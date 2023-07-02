import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Card } from '~components/card/Card';
import { Link } from 'react-router-dom';
import {
  calculateFairShare,
  calculateFeePercent,
  percent,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  toRoundedReadableNumber,
  formatWithCommas,
} from '../../utils/numbers';
import { useClientMobile, isClientMobie } from '../../utils/device';
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import { isMobile } from '~utils/device';
import { toRealSymbol } from '~utils/token';
import { useHistory } from 'react-router';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage, useIntl } from 'react-intl';
import { PoolTabV3 } from '../../components/pool/PoolTabV3';
import { BreadCrumb } from '~components/layout/BreadCrumb';
import {
  get_pool,
  PoolInfo,
  list_liquidities,
  get_liquidity,
  get_pool_marketdepth,
  claim_all_liquidity_fee,
  get_metadata,
  pointToPrice,
} from '~services/swapV3';
import {
  UserLiquidityInfo,
  getPriceByPoint,
  drawChartData,
  CONSTANT_D,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
  useAddAndRemoveUrlHandle,
  TOKEN_LIST_FOR_RATE,
  allocation_rule_liquidities,
  get_matched_seeds_for_dcl_pool,
  get_all_seeds,
  displayNumberToAppropriateDecimals,
  getEffectiveFarmList,
  sort_tokens_by_base,
  get_pool_id,
  get_pool_name,
  openUrl,
} from '~services/commonV3';
import { ftGetTokensMetadata } from '../../services/ft-contract';
import {
  WatchListStartEmpty,
  WatchListStartFull,
} from '../../components/icon/WatchListStar';
import Loading from '~components/layout/Loading';
import { useTokenPriceList } from '../../state/token';
import {
  getBoostTokenPrices,
  FarmBoost,
  Seed,
  get_seed,
} from '../../services/farm';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { WalletContext } from '../../utils/wallets-integration';
import {
  addLiquidityToPool,
  addPoolToWatchList,
  getWatchListFromDb,
  Pool,
  PoolDetails,
  removePoolFromWatchList,
} from '~services/pool';
import ReactTooltip from 'react-tooltip';
import { TokenLinks } from '~components/tokens/Token';
import { FiArrowUpRight } from 'react-icons/fi';
import {
  VolumeChart,
  TVLChart,
  ChartType,
  ChartChangeButton,
  MobileChartChangeButton,
} from '../pools/DetailsPage';
import { BlueCircleLoading } from '../../components/layout/Loading';
import { ChartNoData } from '~components/icon/ChartNoData';
import {
  GradientButton,
  OprationButton,
  ButtonTextWrapper,
  BorderButton,
  SolidButton,
} from '~components/button/Button';
import { RemovePoolV3 } from '~components/pool/RemovePoolV3';
import { AddPoolV3 } from '~components/pool/AddPoolV3';
import Modal from 'react-modal';
import { ModalClose } from '~components/icon';
import {
  useV3VolumeChart,
  useV3TvlChart,
  useDCLPoolTransaction,
  useDCLTopBinFee,
  useDCLAccountAPR,
} from '~state/pool';
import { getV3Pool24VolumeById } from '~services/indexer';
import {
  list_farmer_seeds,
  list_seed_farms,
  UserSeedInfo,
} from '../../services/farm';
import getConfig from '../../services/config';
import {
  SwitchButtonIcon,
  NoLiquidityIcon,
  FarmBoardInDetailPool,
  Fire,
  JumpLinkIcon,
  FarmBoardInDetailDCLPool,
} from '../../components/icon/V3';
import _ from 'lodash';
import { PoolRPCView } from '../../services/api';
import { FarmStampNew, FarmStampNewDCL } from '../../components/icon/FarmStamp';
import { numberWithCommas } from '~pages/Orderly/utiles';
import { HiOutlineExternalLink } from 'react-icons/hi';
import Big from 'big.js';
import { findRangeIntersection } from '~components/pool/YourLiquidityV2';
import DclChart from '../../components/d3Chart/DclChart';

const { REF_UNI_V3_SWAP_CONTRACT_ID, DCL_POOL_BLACK_LIST } = getConfig();
export default function PoolDetailV3() {
  const { id } = useParams<ParamTypes>();
  let pool_id_from_url: string;
  const params_str = decodeURIComponent(id);
  if (params_str.indexOf('<>') > -1) {
    // new link
    pool_id_from_url = get_pool_id(params_str);
  } else {
    // old link
    pool_id_from_url = id.replace(/@/g, '|');
  }
  const history = useHistory();
  if (DCL_POOL_BLACK_LIST.includes(pool_id_from_url)) {
    history.push('/pools');
    return null;
  }
  const [poolDetail, setPoolDetail] = useState<PoolInfo>(null);
  const [user_liquidities, set_user_liquidities] =
    useState<UserLiquidityInfo[]>();
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const [currentRateDirection, setCurrentRateDirection] = useState(true);
  const [showFullStart, setShowFullStar] = useState<Boolean>(false);
  const [matched_seeds, set_matched_seeds] = useState<Seed[]>([]);
  const [sole_seed, set_sole_seed] = useState<Seed>();
  const { modal } = useWalletSelector();
  const intl = useIntl();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  // callBack handle
  useAddAndRemoveUrlHandle();
  useEffect(() => {
    get_pool_detail();
    get_user_list_liquidities();
    getBoostTokenPrices().then(setTokenPriceList);
    getWatchListFromDb({ pool_id: pool_id_from_url }).then((watchlist) => {
      setShowFullStar(watchlist.length > 0);
    });
    get_matched_seeds();
  }, []);
  async function get_matched_seeds() {
    const all_seeds = await get_all_seeds();
    const matched_seeds = get_matched_seeds_for_dcl_pool({
      seeds: all_seeds,
      pool_id: pool_id_from_url,
    });
    const target = matched_seeds[0];
    if (target) {
      set_sole_seed(target);
      set_matched_seeds(matched_seeds);
    }
  }
  async function get_pool_detail() {
    const detail: PoolInfo = await get_pool(pool_id_from_url);
    if (detail) {
      const { token_x, token_y } = detail;
      const metaData: Record<string, any> = await ftGetTokensMetadata([
        token_x,
        token_y,
      ]);
      detail.token_x_metadata = metaData[token_x];
      detail.token_y_metadata = metaData[token_y];
      setPoolDetail(detail);
    }
  }
  async function get_user_list_liquidities() {
    if (!isSignedIn) return;
    let user_liquiditys_in_pool: UserLiquidityInfo[] = [];
    const liquidities = await list_liquidities();
    user_liquiditys_in_pool = liquidities.filter(
      (liquidity: UserLiquidityInfo) => {
        const { lpt_id } = liquidity;
        const pool_id = lpt_id.split('#')[0];
        if (pool_id == pool_id_from_url) return true;
      }
    );
    const liquiditiesPromise = user_liquiditys_in_pool.map(
      (liquidity: UserLiquidityInfo) => {
        return get_liquidity(liquidity.lpt_id);
      }
    );
    const user_liqudities_final = await Promise.all(liquiditiesPromise);
    // get user seeds
    if (user_liqudities_final.length > 0) {
      const user_seeds_map = await list_farmer_seeds();
      const target_seed_ids = Object.keys(user_seeds_map).filter(
        (seed_id: string) => {
          const [contractId, mft_id] = seed_id.split('@');
          if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
            const [fixRange, pool_id, left_point, right_point] =
              mft_id.split('&');
            return pool_id == pool_id_from_url;
          }
        }
      );
      if (target_seed_ids.length > 0) {
        const seedsPromise = target_seed_ids.map((seed_id: string) => {
          return get_seed(seed_id);
        });
        const target_seeds = await Promise.all(seedsPromise);
        target_seeds.forEach((seed: Seed) => {
          const { free_amount, locked_amount } = user_seeds_map[seed.seed_id];
          const user_seed_amount = new BigNumber(free_amount)
            .plus(locked_amount)
            .toFixed();
          allocation_rule_liquidities({
            list: user_liqudities_final,
            user_seed_amount,
            seed,
          });
        });
      }
    }
    set_user_liquidities(user_liqudities_final);
  }
  function displayRateDom() {
    const {
      current_point,
      token_x_metadata,
      token_y_metadata,
      token_x,
      token_y,
    } = poolDetail;
    const rate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let price = getPriceByPoint(current_point, rate);
    let tokenPrice = tokenPriceList[token_x]?.price;
    if (!currentRateDirection) {
      price = new BigNumber(1).dividedBy(price).toFixed();
      tokenPrice = tokenPriceList[token_y]?.price;
    }
    let displayTokenPrice;
    let displayRate;
    if (!tokenPrice) {
      displayTokenPrice = '-';
    } else if (new BigNumber(tokenPrice).isLessThan('0.001')) {
      displayTokenPrice = '<$0.001';
    } else {
      displayTokenPrice = `$${toPrecision(tokenPrice.toString(), 3)}`;
    }
    if (new BigNumber(price).isLessThan('0.001')) {
      displayRate = ' < 0.001';
    } else {
      displayRate = ` = ${toPrecision(price.toString(), 3)}`;
    }
    if (currentRateDirection) {
      return (
        <span>
          1 {token_x_metadata.symbol}
          <label className="text-primaryText">({displayTokenPrice})</label>
          {displayRate} {token_y_metadata.symbol}
        </span>
      );
    } else {
      return (
        <span>
          1 {token_y_metadata.symbol}
          <label className="text-primaryText">({displayTokenPrice})</label>
          {displayRate} {token_x_metadata.symbol}
        </span>
      );
    }
  }
  function switchRateButton() {
    const now_direction = !currentRateDirection;
    setCurrentRateDirection(now_direction);
  }
  const handleSaveWatchList = () => {
    if (!isSignedIn) {
      modal.show();
    } else {
      addPoolToWatchList({ pool_id: pool_id_from_url }).then(() => {
        setShowFullStar(true);
      });
    }
  };
  const handleRemoveFromWatchList = () => {
    removePoolFromWatchList({ pool_id: pool_id_from_url }).then(() => {
      setShowFullStar(false);
    });
  };
  function add_to_watchlist_tip() {
    const tip = intl.formatMessage({ id: 'add_to_watchlist' });
    let result: string = `<div class="text-navHighLightText text-xs text-left font-normal">${tip}</div>`;
    return result;
  }

  function remove_from_watchlist_tip() {
    const tip = intl.formatMessage({ id: 'remove_from_watchlist' });
    let result: string = `<div class="text-navHighLightText text-xs text-left font-normal">${tip}</div>`;
    return result;
  }

  const topBinApr = useDCLTopBinFee({
    pool_id: poolDetail?.pool_id,
    number: 100,
  });

  if (!poolDetail) return <Loading></Loading>;
  const isMobile = isClientMobie();
  const tokens = sort_tokens_by_base([
    poolDetail.token_x_metadata,
    poolDetail.token_y_metadata,
  ]);
  return (
    <>
      <div className="md:w-11/12 xs:w-11/12 w-4/6 lg:w-5/6 xl:w-1200px m-auto">
        <BreadCrumb
          routes={[
            { id: 'top_pools', msg: 'Top Pools', pathname: '/pools' },
            {
              id: 'details',
              msg: 'Details',
              pathname: `/pool`,
            },
          ]}
        />
        <div className="flex items-center justify-between mt-4 mb-3">
          <div className="relative flex mr-4 lg:w-1/2 lg:flex-grow items-center xsm:w-full">
            <div className="flex items-center mr-2.5">
              <img
                src={tokens[0]?.icon}
                className="w-10 h-10 rounded-full bg-cardBg"
                style={{ border: '4px solid rgb(61, 68, 81)' }}
              ></img>
              <img
                src={tokens[1]?.icon}
                className="w-10 h-10 rounded-full bg-cardBg -ml-1"
                style={{ border: '4px solid rgb(61, 68, 81)' }}
              ></img>
            </div>

            <div className="w-full frcb">
              <div className="flex flex-col gap-1 ml-2 justify-between">
                <div className="flex items-center">
                  <span className="text-lg font-gothamBold text-white  mr-3.5">
                    {tokens[0]?.symbol}-{tokens[1]?.symbol}
                  </span>
                </div>
                <div className="flex items-center text-sm text-farmText ">
                  <span className=" ">
                    <FormattedMessage id="fee" />:{' '}
                    <span className="font-gothamBold text-white">
                      {poolDetail.fee / 10000}%
                    </span>
                  </span>

                  <div
                    className="mx-4 bg-farmText"
                    style={{
                      height: '13px',
                      width: '1px',
                    }}
                  ></div>

                  <span className="">
                    <FormattedMessage
                      id="top_bin_apr_24h"
                      defaultMessage={'Top Bin Fee APR(24h)'}
                    />
                    :{' '}
                    <span className="font-gothamBold text-white">
                      {topBinApr}
                    </span>
                  </span>

                  {isMobile && sole_seed && (
                    <FarmStampNewDCL multi={sole_seed.farmList?.length > 1} />
                  )}
                </div>
              </div>

              <div className="frcs">
                <span
                  className="flex items-center justify-center rounded-lg cursor-pointer  xsm:absolute xsm:right-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showFullStart
                      ? handleRemoveFromWatchList()
                      : handleSaveWatchList();
                  }}
                  style={{
                    background: '#172534',
                    width: '30px',
                    height: '30px',
                  }}
                >
                  {showFullStart ? (
                    <div
                      className="text-sm "
                      data-type="info"
                      data-place="right"
                      data-multiline={true}
                      data-class="reactTip"
                      data-html={true}
                      data-tip={isMobile ? '' : remove_from_watchlist_tip()}
                      data-for="fullstar-tip"
                    >
                      <WatchListStartFull />

                      <ReactTooltip
                        id="fullstar-tip"
                        backgroundColor="#1D2932"
                        border
                        borderColor="#7e8a93"
                        effect="solid"
                      />
                    </div>
                  ) : (
                    <div
                      className="text-sm "
                      data-type="info"
                      data-place="right"
                      data-multiline={true}
                      data-class="reactTip"
                      data-html={true}
                      data-tip={isMobile ? '' : add_to_watchlist_tip()}
                      data-for="emptystar-tip"
                    >
                      <WatchListStartEmpty />
                      <ReactTooltip
                        id="emptystar-tip"
                        backgroundColor="#1D2932"
                        border
                        borderColor="#7e8a93"
                        effect="solid"
                      />
                    </div>
                  )}
                </span>
                <div className="xsm:hidden">
                  {sole_seed && (
                    <FarmStampNewDCL multi={sole_seed.farmList?.length > 1} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div
            className=""
            style={{
              width: '380px',
            }}
          ></div>
        </div>

        <div className="flex  items-start flex-row w-full m-auto xs:flex-col-reverse md:flex-col-reverse">
          <div className="mr-4 xsm:w-full lg:flex-grow lg:w-1/2">
            <Chart
              poolDetail={poolDetail}
              tokenPriceList={tokenPriceList}
            ></Chart>
            <BaseData
              poolDetail={poolDetail}
              tokenPriceList={tokenPriceList}
            ></BaseData>
            <TablePool
              poolDetail={poolDetail}
              tokenPriceList={tokenPriceList}
            ></TablePool>
          </div>
          <div
            className="xsm:mb-4"
            style={{
              width: isClientMobie() ? '100%' : '380px',
            }}
          >
            {!isSignedIn ||
            (user_liquidities && user_liquidities.length == 0) ? (
              <NoYourLiquditiesBox
                poolDetail={poolDetail}
              ></NoYourLiquditiesBox>
            ) : (
              <>
                {isMobile ? (
                  <>
                    <UserTabBox
                      poolDetail={poolDetail}
                      tokenPriceList={tokenPriceList}
                      liquidities={user_liquidities}
                      matched_seeds={matched_seeds}
                    ></UserTabBox>
                  </>
                ) : (
                  <>
                    <YourLiquidityBox
                      poolDetail={poolDetail}
                      tokenPriceList={tokenPriceList}
                      liquidities={user_liquidities}
                      matched_seeds={matched_seeds}
                    ></YourLiquidityBox>
                    <UnclaimedFeesBox
                      poolDetail={poolDetail}
                      tokenPriceList={tokenPriceList}
                      liquidities={user_liquidities}
                    ></UnclaimedFeesBox>
                  </>
                )}
              </>
            )}
            <RelatedFarmsBox
              poolDetail={poolDetail}
              tokenPriceList={tokenPriceList}
              sole_seed={sole_seed}
            ></RelatedFarmsBox>
          </div>
        </div>
      </div>
    </>
  );
}
function UserTabBox(props: {
  poolDetail: PoolInfo;
  liquidities: UserLiquidityInfo[];
  tokenPriceList: any;
  matched_seeds: Seed[];
}) {
  const { poolDetail, liquidities, tokenPriceList, matched_seeds } = props;
  const [tabActive, setTabActive] = useState(1);
  function switchTab(tabIndex: number) {
    setTabActive(tabIndex);
  }
  return (
    <div className="p-5 bg-cardBg rounded-xl">
      <div className="flex items-center justify-between">
        <div
          className="flex flex-col items-center w-1 flex-grow mr-3"
          onClick={() => {
            switchTab(1);
          }}
        >
          <span
            className={`text-base ${
              tabActive == 1 ? 'text-white' : 'text-primaryText'
            }`}
          >
            <FormattedMessage id="your_liquidity" />
          </span>
          <label
            className={`bg-senderHot w-full rounded-full h-1 mt-3 ${
              tabActive == 1 ? 'bg-opacity-100' : 'bg-opacity-0'
            }`}
          ></label>
        </div>
        <div
          className="flex flex-col items-center w-1 flex-grow"
          onClick={() => {
            switchTab(2);
          }}
        >
          <span
            className={`text-base ${
              tabActive == 2 ? 'text-white' : 'text-primaryText'
            }`}
          >
            <FormattedMessage id="unclaimed_fees" />
          </span>
          <label
            className={`bg-senderHot w-full rounded-full h-1 mt-3 ${
              tabActive == 2 ? 'bg-opacity-100' : 'bg-opacity-0'
            }`}
          ></label>
        </div>
      </div>
      {tabActive == 1 ? (
        <YourLiquidityBox
          poolDetail={poolDetail}
          tokenPriceList={tokenPriceList}
          liquidities={liquidities}
          matched_seeds={matched_seeds}
        ></YourLiquidityBox>
      ) : (
        <UnclaimedFeesBox
          poolDetail={poolDetail}
          tokenPriceList={tokenPriceList}
          liquidities={liquidities}
        ></UnclaimedFeesBox>
      )}
    </div>
  );
}
function YourLiquidityBox(props: {
  poolDetail: PoolInfo;
  liquidities: UserLiquidityInfo[];
  tokenPriceList: any;
  matched_seeds: Seed[];
}) {
  const { poolDetail, liquidities, tokenPriceList, matched_seeds } = props;
  console.log('liquidities: ', liquidities);
  const [user_liquidities_detail, set_user_liquidities_detail] = useState<
    UserLiquidityDetail[]
  >([]);

  console.log('user_liquidities_detail: ', user_liquidities_detail);

  const [showSelectLiquidityBox, setShowSelectLiquidityBox] = useState(false);
  const [operationType, setOperationType] = useState('add');
  const { token_x_metadata, token_y_metadata } = poolDetail;
  useEffect(() => {
    if (liquidities) {
      const temp_list: UserLiquidityDetail[] = [];
      liquidities.forEach((liquidity: UserLiquidityInfo) => {
        if (!liquidity) return;
        const {
          left_point,
          right_point,
          lpt_id,
          amount,
          unclaimed_fee_x,
          unclaimed_fee_y,
        } = liquidity;
        const { amount_x, amount_y } = get_amount_x_y(liquidity);
        const unclaimed_fee_x_amount = toReadableNumber(
          token_x_metadata.decimals,
          unclaimed_fee_x
        );
        const unclaimed_fee_y_amount = toReadableNumber(
          token_y_metadata.decimals,
          unclaimed_fee_y
        );
        const token_x_price = tokenPriceList[token_x_metadata.id]?.price || 0;
        const token_y_price = tokenPriceList[token_y_metadata.id]?.price || 0;
        const total_liqudities_price =
          Number(amount_x) * Number(token_x_price) +
          Number(amount_y) * Number(token_y_price);
        const total_fees_price =
          Number(unclaimed_fee_x_amount) * Number(token_x_price) +
          Number(unclaimed_fee_y_amount) * Number(token_y_price);
        const decimalRate =
          Math.pow(10, token_x_metadata.decimals) /
          Math.pow(10, token_y_metadata.decimals);
        const l_price = getPriceByPoint(left_point, decimalRate);
        const r_price = getPriceByPoint(right_point, decimalRate);
        const temp: UserLiquidityDetail = {
          total_liqudities_price: total_liqudities_price.toString(),
          total_fees_price: total_fees_price.toString(),
          amount_x,
          amount_y,
          unclaimed_fee_x_amount,
          unclaimed_fee_y_amount,

          hashId: lpt_id.split('#')[1],
          l_price,
          r_price,
        };
        temp_list.push(temp);
      });
      set_user_liquidities_detail(temp_list);
    }
  }, [liquidities, Object.keys(tokenPriceList).length]);
  function get_amount_x_y(liquidity: UserLiquidityInfo) {
    const [tokenX, tokenY] = [token_x_metadata, token_y_metadata];
    const { left_point, right_point, amount: L } = liquidity;
    const { current_point } = poolDetail;
    let amount_x = '0';
    let amount_y = '0';
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      const tokenYAmount = getY(
        left_point,
        current_point,
        current_point,
        L,
        tokenY
      );
      const tokenXAmount = getX(current_point + 1, right_point, L, tokenX);
      const { amountx, amounty } = get_X_Y_In_CurrentPoint(tokenX, tokenY, L);
      amount_x = new BigNumber(tokenXAmount).plus(amountx).toFixed();
      amount_y = new BigNumber(tokenYAmount).plus(amounty).toFixed();
    }
    // only y token
    if (current_point >= right_point) {
      const tokenYAmount = getY(
        left_point,
        right_point,
        current_point,
        L,
        tokenY
      );
      amount_y = tokenYAmount;
    }
    // only x token
    if (left_point > current_point) {
      const tokenXAmount = getX(left_point, right_point, L, tokenX);
      amount_x = tokenXAmount;
    }
    return {
      amount_x,
      amount_y,
    };
  }
  function getX(
    leftPoint: number,
    rightPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const x = new BigNumber(L)
      .multipliedBy(
        (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
            Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
      )
      .toFixed();
    return toReadableNumber(token.decimals, toPrecision(x, 0));
  }
  function getY(
    leftPoint: number,
    rightPoint: number,
    currentPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const y = new BigNumber(L).multipliedBy(
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
        (Math.sqrt(CONSTANT_D) - 1)
    );
    const y_result = y.toFixed();
    return toReadableNumber(token.decimals, toPrecision(y_result, 0));
  }
  function get_X_Y_In_CurrentPoint(
    tokenX: TokenMetadata,
    tokenY: TokenMetadata,
    L: string
  ) {
    const { liquidity, liquidity_x, current_point } = poolDetail;
    const liquidity_y_big = new BigNumber(liquidity).minus(liquidity_x);
    let Ly = '0';
    let Lx = '0';
    // only remove y
    if (liquidity_y_big.isGreaterThanOrEqualTo(L)) {
      Ly = L;
    } else {
      // have x and y
      Ly = liquidity_y_big.toFixed();
      Lx = new BigNumber(L).minus(Ly).toFixed();
    }
    const amountX = getXAmount_per_point_by_Lx(Lx, current_point);
    const amountY = getYAmount_per_point_by_Ly(Ly, current_point);
    const amountX_read = toReadableNumber(
      tokenX.decimals,
      toPrecision(amountX, 0)
    );
    const amountY_read = toReadableNumber(
      tokenY.decimals,
      toPrecision(amountY, 0)
    );
    return { amountx: amountX_read, amounty: amountY_read };
  }
  function getTotalLiquditiesTvl() {
    let total = 0;
    user_liquidities_detail.forEach((liquidityDetail: UserLiquidityDetail) => {
      const { total_liqudities_price } = liquidityDetail;
      total += +total_liqudities_price;
    });
    if (total == 0) {
      return '$0';
    } else if (total < 0.01) {
      return '<$0.01';
    } else {
      return '$' + formatWithCommas(toPrecision(total.toString(), 2));
    }
  }
  function getTotalTokenAmount() {
    let total_x = 0;
    let total_y = 0;
    user_liquidities_detail.forEach((liquidityDetail: UserLiquidityDetail) => {
      const { amount_x, amount_y } = liquidityDetail;
      total_x += +amount_x;
      total_y += +amount_y;
    });
    let display_total_x = '0';
    let display_total_y = '0';
    if (total_x == 0) {
      display_total_x = '0';
    } else if (total_x < 0.01) {
      display_total_x = '<0.01';
    } else {
      display_total_x = toInternationalCurrencySystem(total_x.toString(), 3);
    }
    if (total_y == 0) {
      display_total_y = '0';
    } else if (total_y < 0.01) {
      display_total_y = '<0.01';
    } else {
      display_total_y = toInternationalCurrencySystem(total_y.toString(), 3);
    }
    return {
      total_x: display_total_x,
      total_y: display_total_y,
    };
  }

  function getTotalFee() {
    let total_x = 0;
    let total_y = 0;

    let total_price = 0;

    user_liquidities_detail.forEach((liquidityDetail: UserLiquidityDetail) => {
      const {
        unclaimed_fee_x_amount,
        unclaimed_fee_y_amount,
        total_fees_price,
      } = liquidityDetail;
      total_x += +unclaimed_fee_x_amount;
      total_y += +unclaimed_fee_y_amount;

      total_price += +total_fees_price;
    });

    let display_total_price = '$';

    if (total_price == 0) {
      display_total_price = display_total_price + '0';
    } else if (total_price < 0.01) {
      display_total_price = display_total_price + '<0.01';
    } else {
      display_total_price =
        display_total_price +
        toInternationalCurrencySystem(total_price.toString(), 3);
    }

    let display_total_x = '0';
    let display_total_y = '0';
    if (total_x == 0) {
      display_total_x = '0';
    } else if (total_x < 0.01) {
      display_total_x = '<0.01';
    } else {
      display_total_x = toInternationalCurrencySystem(total_x.toString(), 3);
    }
    if (total_y == 0) {
      display_total_y = '0';
    } else if (total_y < 0.01) {
      display_total_y = '<0.01';
    } else {
      display_total_y = toInternationalCurrencySystem(total_y.toString(), 3);
    }
    return {
      total_fee_x: display_total_x,
      total_fee_y: display_total_y,
      total_fee_price: display_total_price,
    };
  }

  function addLiquidity() {
    setOperationType('add');
    setShowSelectLiquidityBox(true);
  }
  function removeLiquidity() {
    setOperationType('remove');
    setShowSelectLiquidityBox(true);
  }

  const { accountId } = useWalletSelector();

  const history = useHistory();

  const accountAPR = useDCLAccountAPR({
    pool_id: poolDetail.pool_id,
    account_id: accountId,
  });

  const [hover, setHover] = useState<boolean>(false);

  const [noReverseRange, setNoReverseRange] = useState(true);

  function getGroupLiquidities() {
    const tokenMetadata_x_y = [token_x_metadata, token_y_metadata];

    let rate_need_to_reverse_display: boolean;

    if (TOKEN_LIST_FOR_RATE.indexOf(token_x_metadata.symbol) > -1) {
      rate_need_to_reverse_display = true;
    }

    if (!noReverseRange) {
      rate_need_to_reverse_display = !rate_need_to_reverse_display;
    }

    function getRateMapTokens() {
      if (tokenMetadata_x_y) {
        const [tokenX, tokenY] = tokenMetadata_x_y;
        if (rate_need_to_reverse_display) {
          return `${tokenX.symbol}/${tokenY.symbol}`;
        } else {
          return `${tokenY.symbol}/${tokenX.symbol}`;
        }
      }
    }

    function getRate(
      direction: string,
      left_point: number,
      right_point: number
    ) {
      let value = '';
      if (tokenMetadata_x_y) {
        const [tokenX, tokenY] = tokenMetadata_x_y;
        const decimalRate =
          Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
        if (direction == 'left') {
          value = getPriceByPoint(left_point, decimalRate);
        } else if (direction == 'right') {
          value = getPriceByPoint(right_point, decimalRate);
        }
        if (rate_need_to_reverse_display && +value !== 0) {
          value = new BigNumber(1).dividedBy(value).toFixed();
        }
      }

      console.log('value: ', value);

      return value;
    }

    const priceRangeList =
      liquidities?.map((l) => {
        return [
          +getRate(
            rate_need_to_reverse_display ? 'right' : 'left',
            l.left_point,
            l.right_point
          ),
          +getRate(
            rate_need_to_reverse_display ? 'left' : 'right',
            l.left_point,
            l.right_point
          ),
        ];
      }) || [];

    const rangeList = findRangeIntersection(priceRangeList);
    console.log('rangeList: ', rangeList);

    return {
      rangeList,
      rateMapTokens: getRateMapTokens(),
    };
  }

  const groupedData = getGroupLiquidities();

  function goAddliquidityV2() {
    const url_pool_id = get_pool_name(poolDetail.pool_id);
    history.push(`/addLiquidityV2#${url_pool_id}`);
  }

  return (
    <div className="p-5 bg-cardBg rounded-xl xsm:p-0">
      <div className="flex items-start justify-between xsm:hidden">
        <span className="text-white font-gothamBold text-base">
          <FormattedMessage id="your_liquidity"></FormattedMessage>
        </span>

        {/* {liquidities?.length > 1 ? (
          <span className="text-gradientFromHover text-xs bg-black bg-opacity-25 border border-greenColor rounded-3xl px-2">
            {liquidities.length} NFTs
          </span>
        ) : null} */}
        <span className="text-white font-gothamBold">
          ~{getTotalLiquditiesTvl()}
        </span>
      </div>
      {/* <div className="flex items-center justify-center text-xl text-white my-4 xsm:flex-col">
        {liquidities?.length > 1 ? (
          <span className="text-gradientFromHover text-xs bg-black bg-opacity-25 border border-greenColor rounded-3xl px-2 mt-0.5 lg:hidden">
            {liquidities.length} NFTs
          </span>
        ) : null}
      </div> */}

      <div className="flex flex-col gap-3 mt-4 text-sm">
        <div className="flex items-start justify-between gap-5">
          <span className="text-primaryText whitespace-nowrap">
            <FormattedMessage
              id="price_range"
              defaultMessage={'Price Range'}
            ></FormattedMessage>
          </span>

          <span className="flex items-center justify-end flex-wrap gap-1">
            {groupedData.rangeList.map((range: number[], i: number) => {
              return (
                <div className="text-white whitespace-nowrap text-sm">
                  <span>{displayNumberToAppropriateDecimals(range[0])}</span>
                  <span className="mx-1">-</span>
                  <span>{displayNumberToAppropriateDecimals(range[1])}</span>
                  {groupedData.rangeList.length > 1 &&
                    i < groupedData.rangeList.length - 1 && (
                      <span className="mr-1">,</span>
                    )}
                </div>
              );
            })}

            <span
              className="cursor-pointer underline text-white"
              onClick={() => {
                setNoReverseRange(!noReverseRange);
              }}
            >
              {groupedData.rateMapTokens}
            </span>
          </span>
        </div>

        <div className="frcb">
          <span className="text-primaryText">
            <FormattedMessage
              id="position"
              defaultMessage={'Position'}
            ></FormattedMessage>
          </span>

          <div className="frcs gap-1 flex-wrap text-sm text-white">
            <span>{getTotalTokenAmount().total_x}</span>

            <span>{token_x_metadata.symbol}</span>

            <span>+</span>

            <span>{getTotalTokenAmount().total_y}</span>

            <span>{token_y_metadata.symbol}</span>
          </div>
        </div>

        <div className="frcb">
          <span className="text-primaryText">
            <FormattedMessage
              id="apr_24h"
              defaultMessage={'APR(24h)'}
            ></FormattedMessage>
          </span>

          <div className="frcs gap-1 flex-wrap text-sm text-white">
            {accountAPR}
          </div>
        </div>

        <div className="frcb ">
          <span className="text-primaryText">
            <FormattedMessage
              id="total_earned_fee"
              defaultMessage={'Total Earned Fee'}
            ></FormattedMessage>
          </span>

          <div
            className="frcs gap-1 flex-wrap relative text-sm text-white"
            onMouseEnter={() => {
              setHover(true);
            }}
            onMouseLeave={() => {
              setHover(false);
            }}
          >
            <div className="relative">
              {hover && (
                <div
                  className="p-3 -top-8 text-white right-0 text-xs absolute rounded-xl border bg- border-assetsBorder flex flex-col gap-3 min-w-32"
                  style={{
                    background: 'rgba(26, 39, 48, 0.9)',
                  }}
                >
                  <div className="frcb gap-3 w-full">
                    <span>{toRealSymbol(token_x_metadata.symbol)}</span>
                    <span>{getTotalFee().total_fee_x}</span>
                  </div>

                  <div className="frcb gap-3 w-full">
                    <span>{toRealSymbol(token_y_metadata.symbol)}</span>

                    <span>{getTotalFee().total_fee_y}</span>
                  </div>
                </div>
              )}
            </div>

            {getTotalFee().total_fee_price}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-7">
        <GradientButton
          onClick={(e) => {
            e.stopPropagation();
            // addLiquidity();

            goAddliquidityV2();
          }}
          color="#fff"
          borderRadius={'8px'}
          className={`flex-grow w-1 h-11 text-center text-sm text-white focus:outline-none mr-2.5`}
        >
          <FormattedMessage id="add" />
        </GradientButton>
        <OprationButton
          onClick={(e: any) => {
            e.stopPropagation();
            removeLiquidity();
          }}
          color="#fff"
          className={`flex-grow  w-1 h-11  items-center justify-center text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover }`}
        >
          <FormattedMessage id="remove" />
        </OprationButton>
      </div>
      <SelectLiquidityBox
        isOpen={showSelectLiquidityBox}
        onRequestClose={() => {
          setShowSelectLiquidityBox(false);
        }}
        poolDetail={poolDetail}
        user_liquidities_detail={user_liquidities_detail}
        user_liquidities={liquidities}
        operation={operationType}
        tokenPriceList={tokenPriceList}
        matched_seeds={matched_seeds}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            transform: 'translate(-50%, -50%)',
          },
        }}
      ></SelectLiquidityBox>
    </div>
  );
}
function UnclaimedFeesBox(props: any) {
  const { poolDetail, liquidities, tokenPriceList } = props;
  const { token_x_metadata, token_y_metadata } = poolDetail;
  const [user_liquidities_total, set_user_liquidities_total] =
    useState<Record<string, any>>();
  const [cliam_loading, set_cliam_loading] = useState(false);
  useEffect(() => {
    if (liquidities) {
      let total_amount_x_fee = 0;
      let total_amount_y_fee = 0;
      let total_tvl_fee = 0;
      liquidities.forEach((liquidity: UserLiquidityInfo) => {
        const { unclaimed_fee_x, unclaimed_fee_y } = liquidity;
        const unclaimed_fee_x_amount = toReadableNumber(
          token_x_metadata.decimals,
          unclaimed_fee_x
        );
        const unclaimed_fee_y_amount = toReadableNumber(
          token_y_metadata.decimals,
          unclaimed_fee_y
        );
        const token_x_price = tokenPriceList[token_x_metadata.id]?.price || 0;
        const token_y_price = tokenPriceList[token_y_metadata.id]?.price || 0;
        const total_fees_price =
          Number(unclaimed_fee_x_amount) * Number(token_x_price) +
          Number(unclaimed_fee_y_amount) * Number(token_y_price);
        total_amount_x_fee += Number(unclaimed_fee_x_amount);
        total_amount_y_fee += Number(unclaimed_fee_y_amount);
        total_tvl_fee += Number(total_fees_price);
      });
      set_user_liquidities_total({
        total_amount_x_fee,
        total_amount_y_fee,
        total_tvl_fee,
      });
    }
  }, [liquidities, Object.keys(tokenPriceList).length]);
  function getTotalLiquditiesFee() {
    const total_tvl = user_liquidities_total?.total_tvl_fee || 0;
    if (total_tvl == 0) {
      return '$0';
    } else if (total_tvl < 0.01) {
      return '<$0.01';
    } else {
      return '$' + formatWithCommas(toPrecision(total_tvl.toString(), 2));
    }
  }
  function getTotalFeeAmount() {
    const total_amount_x = user_liquidities_total?.total_amount_x_fee || 0;
    const total_amount_y = user_liquidities_total?.total_amount_y_fee || 0;
    let display_amount_x;
    let display_amount_y;
    const total_amount_x_y = total_amount_x + total_amount_y;
    if (total_amount_x == 0) {
      display_amount_x = '0';
    } else if (total_amount_x < 0.001) {
      display_amount_x = '<0.001';
    } else {
      display_amount_x = toPrecision(total_amount_x.toString(), 3);
    }
    if (total_amount_y == 0) {
      display_amount_y = '0';
    } else if (total_amount_y < 0.001) {
      display_amount_y = '<0.001';
    } else {
      display_amount_y = toPrecision(total_amount_y.toString(), 3);
    }

    return {
      display_amount_x,
      display_amount_y,
      total_amount_x_y,
    };
  }
  function claimRewards() {
    if (total_amount_x_y == 0) return;
    set_cliam_loading(true);
    const lpt_ids: string[] = [];
    liquidities.forEach((liquidity: UserLiquidityInfo) => {
      const { unclaimed_fee_x, unclaimed_fee_y } = liquidity;
      if (+unclaimed_fee_x > 0 || +unclaimed_fee_y > 0) {
        lpt_ids.push(liquidity.lpt_id);
      }
    });
    claim_all_liquidity_fee({
      token_x: token_x_metadata,
      token_y: token_y_metadata,
      lpt_ids,
    });
  }
  const { display_amount_x, display_amount_y, total_amount_x_y } =
    getTotalFeeAmount();
  return (
    <div className="p-5 bg-cardBg rounded-xl mt-3.5 xsm:p-0">
      <div className="flex  font-gothamBold text-white text-base items-start justify-between xsm:hidden">
        <span className="">
          <FormattedMessage id="unclaimed_fees" />
        </span>

        {/* {liquidities?.length > 1 ? (
          <span className="text-gradientFromHover text-xs bg-black bg-opacity-25 border border-greenColor rounded-3xl px-2">
            {liquidities.length} NFTs
          </span>
        ) : null} */}

        <span className="text-white font-gothamBold">
          ~{getTotalLiquditiesFee()}
        </span>
      </div>
      <div className="flex items-center justify-center text-xl text-white my-2 xsm:flex-col">
        {liquidities?.length > 1 ? (
          <span className="text-gradientFromHover text-xs bg-black bg-opacity-25 border border-greenColor rounded-3xl px-2 mt-0.5 lg:hidden">
            {liquidities.length} NFTs
          </span>
        ) : null}
      </div>

      <div className="frcb">
        <div className="frcs gap-6 text-sm text-white">
          <div className="frcs">
            <Icon icon={token_x_metadata.icon} className="h-7 w-7 mr-2"></Icon>
            <span className=" ">{display_amount_x}</span>
          </div>
          <div className="frcs ">
            <Icon icon={token_y_metadata.icon} className="h-7 w-7 mr-2"></Icon>
            <span className=" ">{display_amount_y}</span>
          </div>
        </div>

        <div
          className={`flex items-center font-gothamBold justify-center h-10 rounded-lg text-sm px-6 py-1  ${
            total_amount_x_y == 0
              ? 'bg-black bg-opacity-25 text-v3SwapGray cursor-not-allowed'
              : 'bg-deepBlue hover:bg-deepBlueHover text-white cursor-pointer'
          }`}
          onClick={claimRewards}
          style={{
            background: 'linear-gradient(180deg, #646DF4 0%, #371BE4 100%)',
          }}
        >
          <ButtonTextWrapper
            loading={cliam_loading}
            Text={() => <FormattedMessage id={'claim'} />}
          />
        </div>
      </div>
    </div>
  );
}
function RelatedFarmsBox(props: any) {
  const { poolDetail, tokenPriceList, sole_seed } = props;
  const [related_seed, set_related_seed] = useState<Seed>();
  const [farm_loading, set_farm_loading] = useState<boolean>(true);
  useEffect(() => {
    if (poolDetail && Object.keys(tokenPriceList).length > 0) {
      get_farms_data();
    }
  }, [poolDetail, tokenPriceList, sole_seed]);
  async function get_farms_data() {
    if (sole_seed) {
      set_related_seed(sole_seed);
    }
    set_farm_loading(false);
  }
  function totalTvlPerWeekDisplay() {
    const farms = related_seed.farmList;
    const rewardTokenIconMap = {};
    let totalPrice = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    effectiveFarms.forEach((farm: FarmBoost) => {
      const { id, decimals, icon } = farm.token_meta_data;
      const { daily_reward } = farm.terms;
      rewardTokenIconMap[id] = icon;
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        const tokenAmount = toReadableNumber(decimals, daily_reward);
        totalPrice += +new BigNumber(tokenAmount)
          .multipliedBy(tokenPrice)
          .toFixed();
      }
    });
    totalPrice = +new BigNumber(totalPrice).multipliedBy(7).toFixed();
    const totalPriceDisplay =
      totalPrice == 0
        ? '-'
        : '$' + toInternationalCurrencySystem(totalPrice.toString(), 2);
    return totalPriceDisplay;
  }
  function isPending(seed: Seed) {
    let pending: boolean = true;
    const farms = seed.farmList;
    for (let i = 0; i < farms.length; i++) {
      if (farms[i].status != 'Created' && farms[i].status != 'Pending') {
        pending = false;
        break;
      }
    }
    return pending;
  }
  function getTotalAprForSeed() {
    const farms = related_seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending(related_seed);
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = +new BigNumber(item.apr).plus(apr).toFixed();
      }
    });
    if (apr == 0) {
      return '-';
    } else {
      apr = +new BigNumber(apr).multipliedBy(100).toFixed();
      return toPrecision(apr.toString(), 2) + '%';
    }
  }
  function getAllRewardsSymbols() {
    const tempMap = {};
    related_seed.farmList.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      const { icon, id } = token_meta_data;
      tempMap[id] = icon;
    });
    const arr = Object.entries(tempMap);
    return arr.slice(0, 5);
  }
  function go_farm() {
    const { seed_id } = related_seed;
    const [contractId, temp_pool_id] = seed_id.split('@');
    const [fixRange, pool_id, left_point, right_point] =
      temp_pool_id.split('&');
    const link_params = `${get_pool_name(
      pool_id
    )}[${left_point}-${right_point}]`;
    openUrl(`/v2farms/${link_params}-r`);
  }
  if (farm_loading) return null;
  if (!related_seed) return null;
  return (
    <div className="relative py-5 px-3 z-10 mt-3">
      <FarmBoardInDetailDCLPool
        style={{
          position: 'absolute',
          // transform: isClientMobie() ? 'scale(1,1.05)' : 'scale(1.05)',
          zIndex: -1,
          left: 0,
          top: 0,
        }}
      ></FarmBoardInDetailDCLPool>
      <div className="flex items-center justify-between">
        <span className="text-base text-white gotham_bold">Farm APR</span>
        <div className="flex items-center bg-dclButtonBgColor rounded-xl pl-1 pr-2 py-px">
          {getAllRewardsSymbols().map(([id, icon]: [string, string], index) => {
            return (
              <img
                key={id}
                src={icon}
                className={`h-4 w-4 rounded-full border border-gradientFromHover ${
                  index != 0 ? '-ml-1.5' : ''
                }`}
              ></img>
            );
          })}
          {related_seed?.farmList.length > 5 ? (
            <div
              className={`flex h-4 w-4 -ml-1.5 flex-shrink-0  items-center justify-center text-gradientFrom rounded-full bg-darkBg border border-gradientFromHover`}
            >
              <span className={`relative bottom-1`}>...</span>
            </div>
          ) : null}

          <span className="flex items-center text-sm text-v3SwapGray ml-1.5">
            {totalTvlPerWeekDisplay()}/week
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center">
          <span className="valueStyleYellow text-xl gotham_bold mr-1">
            {getTotalAprForSeed()}
          </span>
          <Fire></Fire>
        </div>
        <SolidButton
          className="py-1.5 pb-1.5 px-2 flex rounded-lg items-center justify-center whitespace-nowrap"
          onClick={go_farm}
        >
          <FormattedMessage id="farm_now" defaultMessage={'Farm Now!'} />
        </SolidButton>
      </div>
    </div>
  );
}
function NoYourLiquditiesBox(props: any) {
  const { poolDetail } = props;
  const { token_x_metadata, pool_id } = poolDetail;
  const history = useHistory();
  function goAddLiqudityPage() {
    const [token_x, token_y, fee] = pool_id.split('|');
    let url_hash = pool_id;
    if (TOKEN_LIST_FOR_RATE.indexOf(token_x_metadata?.symbol) > -1) {
      url_hash = `${token_y}|${token_x}|${fee}`;
    }
    const pool_name = get_pool_name(url_hash);
    history.push(`/addLiquidityV2#${pool_name}`);
  }
  return (
    <div className="flex flex-col items-center px-10 py-6 bg-cardBg rounded-xl">
      <NoLiquidityIcon className="mt-6"></NoLiquidityIcon>
      <span className="text-sm text-v3SwapGray mt-5 mb-8">
        <FormattedMessage id="no_positons_in_this_pool_yet" />
      </span>
      <div className="flex justify-center w-full">
        <GradientButton
          onClick={(e) => {
            e.stopPropagation();
            goAddLiqudityPage();
          }}
          color="#fff"
          className={`w-full h-11 text-center text-base text-white focus:outline-none`}
        >
          <FormattedMessage id="add_liquidity"></FormattedMessage>
        </GradientButton>
      </div>
    </div>
  );
}
function SelectLiquidityBox(props: any) {
  const {
    isOpen,
    onRequestClose,
    style,
    user_liquidities_detail,
    poolDetail,
    operation,
    tokenPriceList,
    user_liquidities,
    matched_seeds,
  } = props;

  const [hoverHashId, setHoverHashId] = useState('');
  const [showRemoveBox, setShowRemoveBox] = useState<boolean>(false);
  const [showAddBox, setShowAddBox] = useState<boolean>(false);
  const history = useHistory();
  const { token_x_metadata, token_y_metadata } = poolDetail;
  function displayLiqudityTvl(liquidityDetail: UserLiquidityDetail) {
    const total = +liquidityDetail.total_liqudities_price;
    if (total == 0) {
      return '$0';
    } else if (total < 0.01) {
      return '<$0.01';
    } else {
      return '$' + formatWithCommas(toPrecision(total.toString(), 2));
    }
  }
  function displayLiqudityFee(liquidityDetail: UserLiquidityDetail) {
    const total = +liquidityDetail.total_fees_price;
    if (total == 0) {
      return '$0';
    } else if (total < 0.01) {
      return '<$0.01';
    } else {
      return '$' + formatWithCommas(toPrecision(total.toString(), 2));
    }
  }
  function displayRange(liquidityDetail: UserLiquidityDetail) {
    const { l_price, r_price } = liquidityDetail;
    let display_l;
    let display_r;
    if (
      TOKEN_LIST_FOR_RATE.indexOf(token_x_metadata?.symbol) > -1 &&
      +r_price !== 0 &&
      +l_price !== 0
    ) {
      display_l = new BigNumber(1).dividedBy(r_price).toFixed();
      display_r = new BigNumber(1).dividedBy(l_price).toFixed();
    } else {
      display_l = l_price;
      display_r = r_price;
    }
    display_l = displayNumberToAppropriateDecimals(display_l);
    display_r = displayNumberToAppropriateDecimals(display_r);
    return `${display_l} - ${display_r}`;
  }
  function hoverLine(hashId: string) {
    setHoverHashId(hashId);
  }
  function getCurrentLiqudity(hashId: string) {
    const c_l = user_liquidities.find((liquidity: UserLiquidityInfo) => {
      if (liquidity.lpt_id.split('#')[1] == hashId) return true;
    });
    return c_l;
  }
  function goAddLiqudityPage() {
    const pool_id = poolDetail.pool_id;
    const [token_x, token_y, fee] = pool_id.split('|');
    let url_hash = pool_id;
    if (TOKEN_LIST_FOR_RATE.indexOf(token_x_metadata?.symbol) > -1) {
      url_hash = `${token_y}|${token_x}|${fee}`;
    }
    history.push(`/addLiquidityV2#${url_hash}`);
  }
  function displayFarmStatus(liquidity: UserLiquidityInfo) {
    const is_in_farming =
      liquidity.part_farm_ratio && +liquidity.part_farm_ratio > 0;
    if (is_in_farming) {
      return (
        <label className="text-sm text-white">
          <FormattedMessage id="farming" />
        </label>
      );
    } else {
      return (
        <label className="text-sm text-primaryText">
          <FormattedMessage id="unstaked_2" />
        </label>
      );
    }
  }
  function go_farm(liquidity: UserLiquidityInfo) {
    const { mft_id } = liquidity;
    const [fixRange, pool_id, left_point, right_point] = mft_id.split('&');
    const link_params = `${get_pool_name(
      pool_id
    )}[${left_point}-${right_point}]`;
    const seed_id = REF_UNI_V3_SWAP_CONTRACT_ID + '@' + mft_id.slice(1);
    const temp_seeds = (matched_seeds || []).filter((seed: Seed) => {
      return seed_id == seed.seed_id;
    });
    let actives: FarmBoost[] = [];
    temp_seeds.forEach((seed: Seed) => {
      const { farmList } = seed;
      const temp = farmList.filter((farm: FarmBoost) => {
        return farm.status != 'Ended';
      });
      actives = actives.concat(temp);
    });
    let url;
    if (actives.length > 0) {
      url = `/v2farms/${link_params}-r`;
    } else {
      url = `/v2farms/${link_params}-e`;
    }
    openUrl(url);
  }
  function is_in_farming(liquidity: UserLiquidityInfo) {
    const is_in_farming =
      liquidity.part_farm_ratio && +liquidity.part_farm_ratio > 0;
    return is_in_farming;
  }
  const isMobile = isClientMobie();
  const has_no_related_seed =
    matched_seeds?.length == 0 &&
    user_liquidities?.every(
      (liquidity: UserLiquidityInfo) => +(liquidity.part_farm_ratio || 0) == 0
    );
  return (
    // <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={style}>
    //   <Card
    //     style={{ maxHeight: '95vh', minWidth: isMobile ? '' : '730px' }}
    //     padding="px-0 py-6"
    //     className="outline-none border border-gradientFrom border-opacity-50 overflow-auto xs:w-90vw md:w-90vw lg:w-50vw"
    //   >
    //     <div className="header flex items-center justify-between mb-5 px-6">
    //       <div className="flex items-center justify-center">
    //         <span className="text-white text-xl mr-2">Your Positions</span>
    //         <span className="flex-shrink-0 bg-senderHot flex items-center justify-center gotham_bold px-2.5 ml-2 rounded-t-xl rounded-br-xl text-sm text-black">
    //           {user_liquidities_detail.length}
    //         </span>
    //       </div>
    //       <div className="cursor-pointer" onClick={onRequestClose}>
    //         <ModalClose />
    //       </div>
    //     </div>
    //     {/* for Mobile */}
    //     {isMobile ? (
    //       <div className="px-3">
    //         {user_liquidities_detail.map(
    //           (liquidityDetail: UserLiquidityDetail, index: number) => {
    //             return (
    //               <div
    //                 key={liquidityDetail.hashId + index}
    //                 className="bg-chartBg bg-opacity-30 rounded-2xl mb-2.5 p-3"
    //               >
    //                 <span className="text-white text-base">
    //                   #{liquidityDetail.hashId}
    //                 </span>
    //                 <div className="flex items-center justify-between my-1.5">
    //                   <span className="text-sm text-farmText">Liquidity</span>
    //                   <span className="text-sm text-white">
    //                     {displayLiqudityTvl(liquidityDetail)}
    //                   </span>
    //                 </div>
    //                 <div className="flex items-center justify-between my-1.5">
    //                   <span className="text-sm text-farmText">Range</span>
    //                   <span className="text-sm text-white">
    //                     {displayRange(liquidityDetail)}
    //                   </span>
    //                 </div>
    //                 <div className="flex items-center justify-between my-1.5">
    //                   <span className="text-sm text-farmText">
    //                     <FormattedMessage id="unclaimed_fee" />
    //                   </span>
    //                   <span className="text-sm text-white">
    //                     {displayLiqudityFee(liquidityDetail)}
    //                   </span>
    //                 </div>
    //                 <div
    //                   className={`flex items-center justify-between my-1.5 ${
    //                     has_no_related_seed ? 'hidden' : ''
    //                   }`}
    //                 >
    //                   <span className="text-sm text-farmText">
    //                     <FormattedMessage id="farm_state" />
    //                   </span>
    //                   <span className="text-sm text-white">
    //                     {displayFarmStatus(user_liquidities[index])}
    //                   </span>
    //                 </div>
    //                 <div className="flex items-center justify-end mt-2">
    //                   {is_in_farming(user_liquidities[index]) ? (
    //                     <BorderButton
    //                       onClick={(e) => {
    //                         e.stopPropagation();
    //                         go_farm(user_liquidities[index]);
    //                       }}
    //                       rounded="rounded-lg"
    //                       px="px-0"
    //                       py="py-1"
    //                       style={{ minWidth: '5rem' }}
    //                       className={`px-2 text-sm text-greenColor border-opacity-50 h-9 focus:outline-none`}
    //                     >
    //                       <div className="flex items-center justify-center cursor-pointer">
    //                         <FormattedMessage id="farm_detail" />
    //                         <JumpLinkIcon className="ml-1"></JumpLinkIcon>
    //                       </div>
    //                     </BorderButton>
    //                   ) : (
    //                     <>
    //                       {operation == 'add' ? (
    //                         <GradientButton
    //                           onClick={(e) => {
    //                             e.stopPropagation();
    //                             hoverLine(liquidityDetail.hashId);
    //                             setShowAddBox(true);
    //                           }}
    //                           color="#fff"
    //                           borderRadius={'8px'}
    //                           className={`px-2 h-9 text-center text-sm text-white focus:outline-none`}
    //                         >
    //                           <FormattedMessage id="add_liquidity" />
    //                         </GradientButton>
    //                       ) : (
    //                         <OprationButton
    //                           onClick={(e: any) => {
    //                             e.stopPropagation();
    //                             hoverLine(liquidityDetail.hashId);
    //                             setShowRemoveBox(true);
    //                           }}
    //                           color="#fff"
    //                           className={`flex w-24 h-9  items-center justify-center text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover`}
    //                         >
    //                           <FormattedMessage id="remove" />
    //                         </OprationButton>
    //                       )}
    //                     </>
    //                   )}
    //                 </div>
    //               </div>
    //             );
    //           }
    //         )}
    //       </div>
    //     ) : (
    //       // for Pc
    //       <div
    //         className="wrap"
    //         style={{ maxHeight: '500px', overflow: 'auto' }}
    //       >
    //         <div
    //           className={`grid grid-cols-${
    //             has_no_related_seed ? 10 : 12
    //           } gap-x-3 text-farmText  text-sm h-10 justify-center items-center px-6`}
    //         >
    //           <span className="col-span-1 pl-2 whitespace-nowrap">NFT ID</span>
    //           <span className="col-span-2">
    //             <FormattedMessage id="liquidity" />
    //           </span>
    //           <span className="col-span-3">
    //             <FormattedMessage id="range" />
    //           </span>
    //           <span className="col-span-2">
    //             <FormattedMessage id="unclaimed_fee" />
    //           </span>
    //           {has_no_related_seed ? null : (
    //             <span className={`col-span-2`}>
    //               <FormattedMessage id="farm_state" />
    //             </span>
    //           )}
    //           <span className="col-span-2"></span>
    //         </div>
    //         <div>
    //           {user_liquidities_detail.map(
    //             (liquidityDetail: UserLiquidityDetail, index: number) => {
    //               return (
    //                 <div
    //                   key={index}
    //                   onMouseOver={() => {
    //                     hoverLine(liquidityDetail.hashId);
    //                   }}
    //                   // onMouseLeave={() => setHoverHashId('')}
    //                   className={`grid grid-cols-${
    //                     has_no_related_seed ? 10 : 12
    //                   } gap-x-3 text-white text-base h-14 justify-center items-center px-6 ${
    //                     hoverHashId == liquidityDetail.hashId
    //                       ? 'bg-chartBg bg-opacity-20'
    //                       : ''
    //                   }`}
    //                 >
    //                   <span className="col-span-1 pl-2">
    //                     #{liquidityDetail.hashId}
    //                   </span>
    //                   <span className="col-span-2">
    //                     {displayLiqudityTvl(liquidityDetail)}
    //                   </span>
    //                   <span className="col-span-3">
    //                     {displayRange(liquidityDetail)}
    //                   </span>
    //                   <span className="col-span-2">
    //                     {displayLiqudityFee(liquidityDetail)}
    //                   </span>
    //                   {has_no_related_seed ? null : (
    //                     <span className={`col-span-2`}>
    //                       {displayFarmStatus(user_liquidities[index])}
    //                     </span>
    //                   )}
    //                   <div className="col-span-2">
    //                     {is_in_farming(user_liquidities[index]) ? (
    //                       <BorderButton
    //                         onClick={(e) => {
    //                           e.stopPropagation();
    //                           go_farm(user_liquidities[index]);
    //                         }}
    //                         rounded="rounded-lg"
    //                         px="px-0"
    //                         py="py-1"
    //                         style={{ minWidth: '5rem' }}
    //                         className={`w-full px-2 text-sm text-greenColor h-9 border-opacity-50 ${
    //                           hoverHashId == liquidityDetail.hashId
    //                             ? ''
    //                             : 'hidden'
    //                         }`}
    //                       >
    //                         <div className="flex items-center justify-center cursor-pointer whitespace-nowrap">
    //                           <FormattedMessage id="farm_detail" />
    //                           <JumpLinkIcon className="ml-1 flex-shrink-0"></JumpLinkIcon>
    //                         </div>
    //                       </BorderButton>
    //                     ) : (
    //                       <>
    //                         {operation == 'add' ? (
    //                           <GradientButton
    //                             onClick={(e) => {
    //                               e.stopPropagation();
    //                               setShowAddBox(true);
    //                             }}
    //                             color="#fff"
    //                             borderRadius={'8px'}
    //                             className={`px-2 h-9 text-center text-sm text-white focus:outline-none ${
    //                               hoverHashId == liquidityDetail.hashId
    //                                 ? ''
    //                                 : 'hidden'
    //                             }`}
    //                           >
    //                             <FormattedMessage id="add" />
    //                           </GradientButton>
    //                         ) : (
    //                           <OprationButton
    //                             onClick={(e: any) => {
    //                               e.stopPropagation();
    //                               setShowRemoveBox(true);
    //                             }}
    //                             color="#fff"
    //                             className={`flex h-9  items-center justify-center text-center text-sm text-white focus:outline-none font-semibold bg-bgGreyDefault hover:bg-bgGreyHover ${
    //                               hoverHashId == liquidityDetail.hashId
    //                                 ? ''
    //                                 : 'hidden'
    //                             }`}
    //                           >
    //                             <FormattedMessage id="remove" />
    //                           </OprationButton>
    //                         )}
    //                       </>
    //                     )}
    //                   </div>
    //                 </div>
    //               );
    //             }
    //           )}
    //         </div>
    //       </div>
    //     )}

    //     {operation == 'add' ? (
    //       <div className="flex justify-center xsm:px-3">
    //         <div
    //           onClick={(e) => {
    //             e.stopPropagation();
    //             goAddLiqudityPage();
    //           }}
    //           color="#fff"
    //           className={`flex items-center justify-center w-full h-10 mx-6 border border-dashed border-dclBorderColor rounded-lg text-sm  text-primaryText cursor-pointer hover:bg-dclButtonBgColor hover:text-white focus:outline-none mt-7 xsm:mt-4`}
    //         >
    //           + <FormattedMessage id="add_position" />
    //         </div>
    //       </div>
    //     ) : null}
    //     {operation == 'add' && showAddBox ? (
    //       <AddPoolV3
    //         isOpen={showAddBox}
    //         onRequestClose={() => {
    //           setShowAddBox(false);
    //         }}
    //         tokenMetadata_x_y={[token_x_metadata, token_y_metadata]}
    //         poolDetail={poolDetail}
    //         tokenPriceList={tokenPriceList}
    //         userLiquidity={getCurrentLiqudity(hoverHashId)}
    //         style={{
    //           overlay: {
    //             backdropFilter: 'blur(15px)',
    //             WebkitBackdropFilter: 'blur(15px)',
    //           },
    //           content: {
    //             outline: 'none',
    //             transform: 'translate(-50%, -50%)',
    //           },
    //         }}
    //       ></AddPoolV3>
    //     ) : null}
    //     {operation == 'remove' && showRemoveBox ? (
    //       <RemovePoolV3
    //         isOpen={showRemoveBox}
    //         onRequestClose={() => {
    //           setShowRemoveBox(false);
    //         }}
    //         listLiquidities={user_liquidities}
    //         tokenMetadata_x_y={[token_x_metadata, token_y_metadata]}
    //         poolDetail={poolDetail}
    //         tokenPriceList={tokenPriceList}
    //         userLiquidity={getCurrentLiqudity(hoverHashId)}
    //         style={{
    //           overlay: {
    //             backdropFilter: 'blur(15px)',
    //             WebkitBackdropFilter: 'blur(15px)',
    //           },
    //           content: {
    //             outline: 'none',
    //             transform: 'translate(-50%, -50%)',
    //           },
    //         }}
    //       />
    //     ) : null}
    //   </Card>
    // </Modal>

    operation == 'remove' && isOpen ? (
      <RemovePoolV3
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        listLiquidities={user_liquidities}
        tokenMetadata_x_y={[token_x_metadata, token_y_metadata]}
        poolDetail={poolDetail}
        tokenPriceList={tokenPriceList}
        userLiquidity={getCurrentLiqudity(hoverHashId)}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            transform: 'translate(-50%, -50%)',
          },
        }}
      />
    ) : null
  );
}

function Chart(props: any) {
  const { poolDetail, tokenPriceList } = props;
  const [depthData, setDepthData] = useState();
  const [chartDisplay, setChartDisplay] = useState<ChartType>('liquidity');
  useEffect(() => {
    getChartData();
  }, []);
  async function getChartData() {
    const depthData = await get_pool_marketdepth(poolDetail.pool_id);
    setDepthData(depthData);
  }
  const monthVolume = useV3VolumeChart(poolDetail.pool_id);
  const monthTVL = useV3TvlChart(poolDetail.pool_id);
  return (
    <Card
      width="w-full"
      className="relative rounded-2xl mr-4 mb-4 h-full flex flex-col items-center"
      padding="px-7 py-5 xsm:px-4"
      bgcolor={isClientMobie() ? 'bg-transparent' : 'bg-cardBg'}
      style={{
        height: isClientMobie() ? '390px' : '470px',
      }}
    >
      {chartDisplay === 'volume' ? (
        <VolumeChart
          data={monthVolume}
          chartDisplay={chartDisplay}
          setChartDisplay={setChartDisplay}
          showLiqudityButton={true}
        />
      ) : chartDisplay === 'tvl' ? (
        <TVLChart
          data={monthTVL}
          chartDisplay={chartDisplay}
          setChartDisplay={setChartDisplay}
          showLiqudityButton={true}
        />
      ) : (
        // todo
        <LiquidityChart
          data={{ poolDetail, depthData }}
          chartDisplay={chartDisplay}
          setChartDisplay={setChartDisplay}
        ></LiquidityChart>
        // <DclChart pool_id={poolDetail?.pool_id} config={{axisHidden: true, controlHidden: true}}></DclChart>
      )}
    </Card>
  );
}
function BaseData(props: any) {
  const { poolDetail, tokenPriceList } = props;
  const [volume24, setVolume24] = useState('0');
  const [user_liquidity_fee, set_user_liquidity_fee] = useState<number>();
  useEffect(() => {
    getV3Pool24VolumeById(poolDetail.pool_id)
      .then((res) => {
        setVolume24(res);
      })
      .catch(() => {});
    get_metadata().then((res) => {
      if (res) {
        const { protocol_fee_rate } = res;
        set_user_liquidity_fee((10000 - protocol_fee_rate) / 10000);
      }
    });
  }, []);

  function getTvl() {
    const {
      token_x_metadata,
      token_y_metadata,
      token_x,
      token_y,
      total_x,
      total_y,
      total_fee_x_charged,
      total_fee_y_charged,
    } = poolDetail;
    const pricex = tokenPriceList[token_x]?.price || 0;
    const pricey = tokenPriceList[token_y]?.price || 0;
    const totalX = new BigNumber(total_x).minus(total_fee_x_charged).toFixed();
    const totalY = new BigNumber(total_y).minus(total_fee_y_charged).toFixed();
    const tvlx =
      Number(toReadableNumber(token_x_metadata.decimals, totalX)) *
      Number(pricex);
    const tvly =
      Number(toReadableNumber(token_y_metadata.decimals, totalY)) *
      Number(pricey);
    const tvl = tvlx + tvly;
    if (tvl == 0) {
      return '$0';
    } else if (tvl < 0.01) {
      return '<$0.01';
    } else {
      return '$' + toInternationalCurrencySystem(tvl.toString(), 2);
    }
  }
  function get24Volume() {
    if (+volume24 == 0) {
      return '$0';
    } else if (+volume24 < 0.01) {
      return '<$0.01';
    } else {
      return '$' + toInternationalCurrencySystem(volume24.toString(), 2);
    }
  }

  function get24Fee() {
    const fee = poolDetail.fee;
    const f = new BigNumber(fee)
      .dividedBy(1000000)
      .multipliedBy(user_liquidity_fee || 1)
      .multipliedBy(volume24)
      .toFixed();
    if (+f == 0) {
      return '$0';
    } else if (+f < 0.01) {
      return '<$0.01';
    } else {
      return '$' + toInternationalCurrencySystem(f.toString(), 2);
    }
  }
  return (
    <div className="grid grid-cols-3 gap-3 xsm:grid-cols-2 mt-4">
      <DataBox
        title={
          <FormattedMessage id="TVL" defaultMessage="TVL"></FormattedMessage>
        }
        value={getTvl()}
      ></DataBox>
      <DataBox
        title={
          <FormattedMessage
            id="h24_volume_bracket"
            defaultMessage="Volume(24h)"
          ></FormattedMessage>
        }
        value={get24Volume()}
      ></DataBox>
      <DataBox
        title={
          <FormattedMessage
            id="fee_24h"
            defaultMessage="Fee(24h)"
          ></FormattedMessage>
        }
        value={get24Fee()}
      ></DataBox>
    </div>
  );
}
function DataBox(props: any) {
  const { title, value, className } = props;
  return (
    <div
      className={`flex flex-col flex-grow bg-detailCardBg rounded-lg px-4 py-3.5 ${className}`}
    >
      <span className="text-sm text-farmText">{title}</span>
      <span className="text-base text-white mt-3">{value}</span>
    </div>
  );
}

type RencentTabKey = 'swap' | 'liquidity' | 'limit_order';

const REF_FI_RECENT_TRANSACTION_TAB_KEY_DCL =
  'REF_FI_RECENT_TRANSACTION_TAB_KEY_DCL';

export function RecentTransactions({
  pool_id,
  tokens,
}: {
  pool_id: string;
  tokens: TokenMetadata[];
}) {
  const storedTab = sessionStorage.getItem(
    REF_FI_RECENT_TRANSACTION_TAB_KEY_DCL
  ) as RencentTabKey;

  const { swapTransactions, liquidityTransactions, limitOrderTransactions } =
    useDCLPoolTransaction({ pool_id });
  console.log('pool_id: ', pool_id);

  const [tab, setTab] = useState<RencentTabKey>(storedTab || 'swap');

  const onChangeTab = (tab: RencentTabKey) => {
    sessionStorage.setItem(REF_FI_RECENT_TRANSACTION_TAB_KEY_DCL, tab);
    setTab(tab);
  };

  const renderSwapTransactions = swapTransactions.map((tx) => {
    const swapIn = tokens.find((t) => t.id === tx.token_in);

    const swapOut = tokens.find((t) => t.id === tx.token_out);

    if (!swapIn || !swapOut) return null;

    const swapInAmount = toReadableNumber(swapIn.decimals, tx.amount_in);
    const displayInAmount =
      Number(swapInAmount) < 0.01
        ? '<0.01'
        : numberWithCommas(toPrecision(swapInAmount, 6));

    const swapOutAmount = toReadableNumber(swapOut.decimals, tx.amount_out);

    const displayOutAmount =
      Number(swapOutAmount) < 0.01
        ? '<0.01'
        : numberWithCommas(toPrecision(swapOutAmount, 6));

    const txLink = (
      <a
        rel="noopener  noreferrer nofollow "
        href={`${getConfig().explorerUrl}/txns/${tx.tx_id}`}
        className="  hover:underline ml-2"
        target="_blank"
      >
        <HiOutlineExternalLink className="relative "></HiOutlineExternalLink>
      </a>
    );

    return (
      <tr className="text-sm text-primaryText grid w-full grid-cols-5 hover:text-white hover:bg-poolRecentHover">
        <td className=" gap-1 p-4 col-span-1">
          <span className="text-white" title={swapInAmount}>
            {displayInAmount}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapIn.symbol)}
          </span>
        </td>

        <td className=" gap-1 col-span-2 frcs">
          <span className="text-white" title={swapOutAmount}>
            {displayOutAmount}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapOut.symbol)}
          </span>
        </td>

        <td className=" relative  py-4 pr-4 flex items-center justify-end col-span-2">
          <span className="hover:underline cursor-pointer">{tx.timestamp}</span>

          {txLink}
        </td>
      </tr>
    );
  });

  const renderLiquidityTransactions = liquidityTransactions.map((tx) => {
    const swapIn = tokens[0];

    const swapOut = tokens[1];

    if (!swapIn || !swapOut) return null;

    const AmountIn = toReadableNumber(swapIn.decimals, tx.amount_x);
    const displayInAmount =
      Number(AmountIn) < 0.01 && Number(AmountIn) > 0
        ? '<0.01'
        : numberWithCommas(toPrecision(AmountIn, 6));

    const AmountOut = toReadableNumber(swapOut.decimals, tx.amount_y);

    const displayOutAmount =
      Number(AmountOut) < 0.01 && Number(AmountOut) > 0
        ? '<0.01'
        : numberWithCommas(toPrecision(AmountOut, 6));

    const txLink = (
      <a
        rel="noopener  noreferrer nofollow "
        href={`${getConfig().explorerUrl}/txns/${tx.tx_id}`}
        className="hover:underline ml-2 "
        target="_blank"
      >
        <HiOutlineExternalLink className="relative "></HiOutlineExternalLink>
      </a>
    );

    return (
      <tr className="text-sm text-primaryText grid grid-cols-5 hover:text-white hover:bg-poolRecentHover">
        <td className=" gap-1 p-4  col-span-1">
          <span className="text-white">
            {(tx.method_name.toLowerCase().indexOf('add') > -1 ||
              tx.method_name.toLowerCase().indexOf('append') > -1) &&
              'Add'}

            {tx.method_name.toLowerCase().indexOf('remove') > -1 && 'Remove'}
          </span>
        </td>

        <td className="text-white col-span-2 frcs whitespace-nowrap">
          <span className="text-white" title={AmountIn}>
            {displayInAmount}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapIn.symbol)}
          </span>

          <span className="mx-1">+</span>

          <span className="text-white" title={AmountOut}>
            {displayOutAmount}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapOut.symbol)}
          </span>
        </td>

        <td className=" relative py-4 pr-4 flex items-center justify-end col-span-2">
          <span className="hover:underline cursor-pointer">{tx.timestamp}</span>

          {txLink}
        </td>
      </tr>
    );
  });

  const renderLimitOrderTransactions = limitOrderTransactions.map((tx) => {
    const swapIn = tokens.find((t) => t.id === tx.sell_token);

    const swapOut = tokens.find((t) => t.id !== tx.sell_token);

    if (!swapIn || !swapOut) return null;

    const AmountIn = toReadableNumber(swapIn.decimals, tx.amount);
    const displayInAmount =
      Number(AmountIn) < 0.01
        ? '<0.01'
        : numberWithCommas(toPrecision(AmountIn, 6));

    const price = pointToPrice({
      tokenA: swapIn,
      tokenB: swapOut,
      point:
        swapIn.id === pool_id.split('|')[0]
          ? Number(tx.point)
          : -Number(tx.point),
    });

    const AmountOut = new Big(AmountIn).mul(price).toFixed(0, 0);

    const displayOutAmount =
      Number(AmountOut) < 0.01
        ? '<0.01'
        : numberWithCommas(toPrecision(AmountOut, 6));

    const txLink = (
      <a
        rel="noopener  noreferrer nofollow "
        href={`${getConfig().explorerUrl}/txns/${tx.tx_id}`}
        className="  hover:underline ml-2 "
        target="_blank"
      >
        <HiOutlineExternalLink className="relative "></HiOutlineExternalLink>
      </a>
    );

    return (
      <tr className="hover:text-white grid grid-cols-5 overflow-hidden hover:bg-poolRecentHover text-sm text-primaryText">
        <td className=" gap-1 p-4 frcs text-white">
          {tx.method_name.toLowerCase().indexOf('cancelled') > -1 &&
            'Cancelled'}

          {tx.method_name.toLowerCase().indexOf('place') > -1 && 'Place'}
        </td>

        <td className="text-white frcs">
          <span className="text-white" title={AmountIn}>
            {displayInAmount}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapIn.symbol)}
          </span>
        </td>

        <td className="frcs">
          <span className="text-white" title={AmountOut}>
            {displayOutAmount}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapOut.symbol)}
          </span>
        </td>

        <td className="frcs">
          <span className="text-white" title={price}>
            {numberWithCommas(toPrecision(price, 4))}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapOut.symbol)}/{toRealSymbol(swapIn.symbol)}
          </span>
        </td>

        <td className=" relative py-4 flex items-center justify-end pr-2">
          <span className="hover:underline text-right cursor-pointer  relative ">
            {tx.timestamp}
          </span>

          {txLink}
        </td>
      </tr>
    );
  });

  const renderTransactions =
    tab === 'swap'
      ? renderSwapTransactions
      : tab === 'liquidity'
      ? renderLiquidityTransactions
      : renderLimitOrderTransactions;
  return (
    <>
      <div className="frcb w-full mb-3 mt-7">
        <div className="text-white font-gothamBold text-base  ">
          <FormattedMessage
            id="recent_transactions"
            defaultMessage={'Recent Transactions'}
          />
        </div>

        <div className="frcs gap-2 h-8 text-sm text-primaryText">
          <div
            className={`rounded-lg frcc cursor-pointer h-full w-28 text-center align-middle ${
              tab === 'swap'
                ? 'text-white bg-inputV3BorderColor '
                : 'bg-detailCardBg'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChangeTab('swap');
            }}
          >
            <FormattedMessage
              id="swap"
              defaultMessage={'Swap'}
            ></FormattedMessage>
          </div>

          <div
            className={`rounded-lg frcc cursor-pointer h-full w-28 text-center align-middle ${
              tab === 'liquidity'
                ? 'text-white bg-inputV3BorderColor '
                : 'bg-detailCardBg'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChangeTab('liquidity');
            }}
          >
            <FormattedMessage
              id="liquidity"
              defaultMessage={'Liquidity'}
            ></FormattedMessage>
          </div>

          <div
            className={`rounded-lg frcc cursor-pointer h-full w-28 text-center align-middle ${
              tab === 'limit_order'
                ? 'text-white bg-inputV3BorderColor '
                : 'bg-detailCardBg'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChangeTab('limit_order');
            }}
          >
            <FormattedMessage
              id="limit_order"
              defaultMessage={'Limit Order'}
            ></FormattedMessage>
          </div>
        </div>
      </div>

      <div className="text-sm rounded-lg overflow-hidden w-full text-primaryText bg-detailCardBg">
        <tr className="text-left grid grid-cols-5 border-b border-gray1">
          <th className={`p-4 ${'col-span-1'} pb-3`}>
            {tab === 'liquidity' && (
              <FormattedMessage
                id="action"
                defaultMessage={'Action'}
              ></FormattedMessage>
            )}

            {tab === 'limit_order' && (
              <FormattedMessage
                id="action"
                defaultMessage={'Action'}
              ></FormattedMessage>
            )}

            {tab === 'swap' && (
              <FormattedMessage
                id="from"
                defaultMessage={'From'}
              ></FormattedMessage>
            )}
          </th>

          <th
            className={`py-4 pb-3 ${
              tab === 'limit_order' ? 'col-span-1' : 'col-span-2'
            }`}
          >
            {tab === 'liquidity' && (
              <FormattedMessage
                id="amount"
                defaultMessage={'Amount'}
              ></FormattedMessage>
            )}
            {tab === 'swap' && (
              <FormattedMessage
                id="to"
                defaultMessage={'To'}
              ></FormattedMessage>
            )}

            {tab === 'limit_order' && (
              <FormattedMessage
                id="from"
                defaultMessage={'From'}
              ></FormattedMessage>
            )}
          </th>

          {tab === 'limit_order' && (
            <th className="py-4 pb-3 col-span-1">
              <FormattedMessage
                id="to"
                defaultMessage={'To'}
              ></FormattedMessage>
            </th>
          )}

          {tab === 'limit_order' && (
            <th className="py-4 pb-3 col-span-1">
              <FormattedMessage
                id="price"
                defaultMessage={'Price'}
              ></FormattedMessage>
            </th>
          )}

          <th
            className={`p-4 text-right pb-3 ${
              tab === 'limit_order' ? 'col-span-1' : 'col-span-2'
            }`}
          >
            <FormattedMessage
              id="time"
              defaultMessage={'Time'}
            ></FormattedMessage>
          </th>
        </tr>

        <div
          className="overflow-auto "
          style={{
            maxHeight: '700px',
          }}
        >
          {renderTransactions}
        </div>
      </div>
    </>
  );
}

function TablePool(props: any) {
  const { poolDetail, tokenPriceList } = props;
  const [tokens, setTokens] = useState([]);
  const intl = useIntl();
  useEffect(() => {
    const {
      token_x,
      token_y,
      total_x,
      total_y,
      token_x_metadata,
      token_y_metadata,
      total_fee_x_charged,
      total_fee_y_charged,
    } = poolDetail;
    const pricex = tokenPriceList[token_x]?.price || 0;
    const pricey = tokenPriceList[token_y]?.price || 0;
    const totalX = new BigNumber(total_x).minus(total_fee_x_charged).toFixed();
    const totalY = new BigNumber(total_y).minus(total_fee_y_charged).toFixed();
    const amountx = toReadableNumber(token_x_metadata.decimals, totalX);
    const amounty = toReadableNumber(token_y_metadata.decimals, totalY);
    const tvlx = Number(amountx) * Number(pricex);
    const tvly = Number(amounty) * Number(pricey);
    const temp_list = [];
    const temp_tokenx = {
      meta: token_x_metadata,
      amount: amountx,
      tvl: tvlx,
    };
    const temp_tokeny = {
      meta: token_y_metadata,
      amount: amounty,
      tvl: tvly,
    };
    temp_list.push(temp_tokenx, temp_tokeny);
    setTokens(temp_list);
  }, [Object.keys(tokenPriceList).length]);
  function valueOfNearTokenTip() {
    const tip = intl.formatMessage({ id: 'awesomeNear_verified_token' });
    let result: string = `<div class="text-navHighLightText text-xs text-left font-normal">${tip}</div>`;
    return result;
  }
  function displayAmount(amount: string) {
    if (+amount == 0) {
      return '0';
    } else if (+amount < 0.01) {
      return '< 0.01';
    } else {
      return toInternationalCurrencySystem(amount.toString(), 2);
    }
  }
  function displayTvl(token: any) {
    const { tvl } = token;
    if (+tvl == 0 && !tokenPriceList[token.meta.id]?.price) {
      return '$ -';
    } else if (+tvl == 0) {
      return '$0';
    } else if (+tvl < 0.01) {
      return '< $0.01';
    } else {
      return '$' + toInternationalCurrencySystem(tvl.toString(), 2);
    }
  }
  return (
    <div className="mt-8">
      <div className="text-white font-gothamBold text-base mb-3 w-full">
        <FormattedMessage
          id="pool_composition"
          defaultMessage={'Pool Composition'}
        />
      </div>
      <div className="rounded-lg w-full bg-detailCardBg pt-4 pb-1">
        <div className="grid grid-cols-10  px-5">
          <div className="col-span-5 text-sm text-farmText">
            <FormattedMessage id="token" defaultMessage="Token" />
          </div>

          <div className="col-span-3 text-sm text-farmText">
            <FormattedMessage id="amount" defaultMessage="Amount" />
          </div>

          <div className="col-span-2 text-sm text-farmText">
            <FormattedMessage id="value" defaultMessage="Value" />
          </div>
        </div>
        {tokens.map((token: any, i: number) => (
          <div
            key={i}
            className="grid grid-cols-10 items-center px-5 py-3 hover:bg-chartBg hover:bg-opacity-30"
          >
            <div className="col-span-5 flex items-center">
              <Icon icon={token.meta.icon} className="h-7 w-7 mr-2" />
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-white text-base">
                    {toRealSymbol(token.meta.symbol)}
                  </span>
                  {TokenLinks[token.meta.symbol] ? (
                    <div
                      className="ml-0.5 text-sm"
                      data-type="info"
                      data-place="right"
                      data-multiline={true}
                      data-class="reactTip"
                      data-html={true}
                      data-tip={valueOfNearTokenTip()}
                      data-for={'nearVerifiedId1' + i}
                    >
                      <a
                        className=""
                        onClick={(e) => {
                          e.stopPropagation();
                          openUrl(TokenLinks[token.meta.symbol]);
                        }}
                      >
                        <FiArrowUpRight className="text-primaryText hover:text-greenColor cursor-pointer" />
                      </a>
                      <ReactTooltip
                        id={'nearVerifiedId1' + i}
                        backgroundColor="#1D2932"
                        border
                        borderColor="#7e8a93"
                        effect="solid"
                      />
                    </div>
                  ) : null}
                </div>
                <a
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  href={`/swap/#${tokens[0].meta.id}|${tokens[1].meta.id}`}
                  className="text-xs text-primaryText xsm:hidden"
                  title={token.meta.id}
                >{`${token.meta.id.substring(0, 24)}${
                  token.meta.id.length > 24 ? '...' : ''
                }`}</a>
              </div>
            </div>
            <div
              className="col-span-3 text-base text-white"
              title={token.amount}
            >
              {displayAmount(token.amount)}
            </div>
            <div
              className="col-span-2 text-base text-white"
              title={`$${token.tvl}`}
            >
              {displayTvl(token)}
            </div>
          </div>
        ))}
      </div>

      <RecentTransactions
        tokens={tokens.map((t) => t.meta)}
        pool_id={poolDetail.pool_id}
      ></RecentTransactions>
    </div>
  );
}

function Icon(props: { icon?: string; className?: string; style?: any }) {
  const { icon, className, style } = props;
  return icon ? (
    <img
      className={`block ${className} rounded-full border border-gradientFromHover border-solid`}
      src={icon}
      style={style}
    />
  ) : (
    <div
      className={`rounded-full ${className} border border-gradientFromHover  border-solid`}
      style={style}
    />
  );
}
function LiquidityChart(props: any) {
  const { data, chartDisplay, setChartDisplay } = props;
  const { poolDetail, depthData } = data;
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [noData, setNoData] = useState<boolean>(true);
  const [rateDirection, setRateDirection] = useState(true);
  const isMobile = isClientMobie();
  useEffect(() => {
    if (poolDetail?.token_x_metadata) {
      if (
        TOKEN_LIST_FOR_RATE.indexOf(poolDetail?.token_x_metadata.symbol) > -1
      ) {
        setRateDirection(false);
      } else {
        setRateDirection(true);
      }
    }
  }, [poolDetail]);
  const rateDOM = useMemo(() => {
    const { current_point, token_x_metadata, token_y_metadata } = poolDetail;
    const rate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let price = getPriceByPoint(current_point, rate);
    if (!rateDirection) {
      price = new BigNumber(1).dividedBy(price).toFixed();
    }
    let displayRate;
    if (new BigNumber(price).isLessThan('0.001')) {
      displayRate = ' < 0.001';
    } else {
      displayRate = ` = ${formatWithCommas(toPrecision(price.toString(), 3))}`;
    }
    return (
      <span title={price} className="flex items-center flex-wrap xsm:text-sm">
        1 {rateDirection ? token_x_metadata.symbol : token_y_metadata.symbol}
        &nbsp;
        <span>
          {displayRate}{' '}
          {rateDirection ? token_y_metadata.symbol : token_x_metadata.symbol}
        </span>
      </span>
    );
  }, [poolDetail, rateDirection]);
  function switchRate() {
    setRateDirection(!rateDirection);
  }
  return (
    <>
      <div
        className={`relative z-50 flex items-center xsm:flex-col-reverse xsm:items-start justify-between w-full mb-4 ${
          noData ? 'opacity-70' : ''
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-base text-white">{rateDOM}</span>
            <SwitchButtonIcon
              onClick={switchRate}
              className="cursor-pointer ml-2 flex-shrink-0"
            ></SwitchButtonIcon>
          </div>
          <span className="text-sm text-primaryText xsm:text-xs">
            <FormattedMessage id="current_price" />
          </span>
        </div>
        {isMobile ? (
          <MobileChartChangeButton
            chartDisplay={chartDisplay}
            setChartDisplay={setChartDisplay}
            showLiqudityButton={true}
          ></MobileChartChangeButton>
        ) : (
          <ChartChangeButton
            className="self-start"
            chartDisplay={chartDisplay}
            setChartDisplay={setChartDisplay}
            showLiqudityButton={true}
          />
        )}
      </div>
      {chartLoading ? (
        <BlueCircleLoading className="absolute top-1/3"></BlueCircleLoading>
      ) : null}
      {!chartLoading && noData ? (
        <EmptyLiquidityChart></EmptyLiquidityChart>
      ) : (
        <DclChart pool_id={poolDetail?.pool_id} config={{controlHidden: true, svgWidth:'750', svgHeight:'300'}}></DclChart>
      )}
    </>
  );
}

function EmptyLiquidityChart() {
  return (
    <div className="absolute w-full h-full left-0 right-0 top-0 bottom-0">
      <div className="flex items-center justify-center absolute w-full h-full left-0 right-0 top-0 bottom-0  bg-chartBg opacity-70 z-10">
        <div className="relative flex flex-col">
          <ChartNoData />
          <span className="text-base text-gray-500">
            <FormattedMessage id="no_data" defaultMessage="No Data" />
          </span>
        </div>
      </div>
      <div className="absolute bottom-5 left-7 right-7 xs:hidden md:hidden">
        <div className="border border-gradientFrom w-full mb-2" />
        <div className="flex text-xs text-gray-500 justify-between">
          {[
            '24',
            '31',
            '07',
            '14',
            '21',
            '28',
            '04',
            '11',
            '18',
            '25',
            '02',
            '09',
          ].map((d, i) => {
            return <div key={i}>{d}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
interface ParamTypes {
  id: string;
}
interface UserLiquidityDetail {
  total_liqudities_price: string;
  total_fees_price: string;
  amount_x: string;
  amount_y: string;
  hashId: string;
  l_price: string;
  r_price: string;
  unclaimed_fee_y_amount?: string;
  unclaimed_fee_x_amount?: string;
}
