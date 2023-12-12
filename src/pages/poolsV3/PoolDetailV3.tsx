import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useClientMobile, isClientMobie } from '../../utils/device';
import { useHistory } from 'react-router';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage, useIntl } from 'react-intl';
import { BreadCrumb } from 'src/components/layout/BreadCrumb';
import {
  get_pool,
  PoolInfo,
  list_liquidities,
  get_liquidity,
} from 'src/services/swapV3';
import {
  UserLiquidityInfo,
  allocation_rule_liquidities,
  get_matched_seeds_for_dcl_pool,
  get_all_seeds,
  sort_tokens_by_base,
  get_pool_id,
  useRemoveLiquidityUrlHandle,
} from 'src/services/commonV3';
import { ftGetTokensMetadata } from '../../services/ft-contract';
import {
  WatchListStartEmpty,
  WatchListStartFull,
} from '../../components/icon/WatchListStar';
import Loading from 'src/components/layout/Loading';
import { getBoostTokenPrices, Seed, get_seed } from '../../services/farm';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { WalletContext } from '../../utils/wallets-integration';
import {
  addPoolToWatchList,
  getWatchListFromDb,
  removePoolFromWatchList,
} from 'src/services/pool';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useDCLTopBinFee } from '../../state/pool';
import { list_farmer_seeds } from '../../services/farm';
import getConfig from '../../services/config';
import _ from 'lodash';
import { FarmStampNewDCL } from '../../components/icon/FarmStamp';
import { UserButtonBox } from './components/detail/UserTabBox';
import { ParamTypes } from './components/detail/type';
import { YourLiquidityBox } from './components/detail/YourLiquidityBox';
import { UnclaimedFeesBox } from './components/detail/UnclaimedFeesBox';
import { RelatedFarmsBox } from './components/detail/RelatedFarmsBox';
import { Chart } from './components/detail/Chart';
import { TablePool } from './components/detail/TablePool';
import { BaseData } from './components/detail/BaseData';
import { NoYourLiquditiesBox } from './components/detail/NoYourLiquditiesBox';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
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
  useRemoveLiquidityUrlHandle();
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
    pool: poolDetail,
  });

  if (!poolDetail) return <Loading></Loading>;
  const isMobile = isClientMobie();
  const tokens = sort_tokens_by_base([
    poolDetail.token_x_metadata,
    poolDetail.token_y_metadata,
  ]);
  return (
    <>
      <div className="w-4/6 lg:w-5/6 xl:w-1200px m-auto xsm:pb-8 xsm:w-full xsm:px-4">
        <BreadCrumb
          routes={[
            { id: 'pools', msg: 'Pools', pathname: '/pools' },
            {
              id: 'details',
              msg: 'Details',
              pathname: `/pool`,
            },
          ]}
        />
        <div className="flex  items-start flex-row w-full m-auto xs:flex-col-reverse md:flex-col-reverse">
          <div className="lg:mr-4 xsm:w-full lg:flex-grow lg:w-1/2">
            {/* title for pc */}
            <div className="relative flex items-center justify-between mb-3 mr-4 flex-grow xsm:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
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
                </div>
                <div className="flex flex-col gap-1 ml-2 xsm:ml-1 xsm:w-full justify-between">
                  <div className="flex items-center text-lg font-gothamBold text-white mr-3.5 xsm:hidden">
                    {tokens[0]?.symbol}-{tokens[1]?.symbol}
                  </div>
                  <div className="flex items-center text-sm text-farmText xsm:justify-between">
                    <span>
                      <FormattedMessage id="fee" />:{' '}
                      <span className="font-gothamBold text-white">
                        {poolDetail.fee / 10000}%
                      </span>
                    </span>
                    <div className="flex items-center">
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
                          defaultMessage={'Top Bin APR (24h)'}
                        />
                        :{' '}
                        <span className="font-gothamBold text-white">
                          {topBinApr}
                        </span>
                      </span>
                    </div>

                    {isMobile && sole_seed && (
                      <FarmStampNewDCL multi={sole_seed.farmList?.length > 1} />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {sole_seed && (
                  <FarmStampNewDCL multi={sole_seed.farmList?.length > 1} />
                )}
                <span
                  className="flex items-center justify-center rounded-lg cursor-pointer ml-2.5"
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
                      data-tooltip-html={
                        isMobile ? '' : remove_from_watchlist_tip()
                      }
                      data-tooltip-id="fullstar-tip"
                    >
                      <WatchListStartFull />

                      <CustomTooltip id="fullstar-tip" />
                    </div>
                  ) : (
                    <div
                      className="text-sm "
                      data-type="info"
                      data-place="right"
                      data-multiline={true}
                      data-class="reactTip"
                      data-tooltip-html={isMobile ? '' : add_to_watchlist_tip()}
                      data-tooltip-id="emptystar-tip"
                    >
                      <WatchListStartEmpty />
                      <CustomTooltip id="emptystar-tip" />
                    </div>
                  )}
                </span>
              </div>
            </div>
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
              sole_seed={sole_seed}
            ></TablePool>
          </div>
          <div
            className="xsm:hidden"
            style={{
              width: isClientMobie() ? '100%' : '380px',
            }}
          >
            {!isMobile ? (
              !isSignedIn ||
              (user_liquidities && user_liquidities.length == 0) ? (
                <NoYourLiquditiesBox
                  poolDetail={poolDetail}
                ></NoYourLiquditiesBox>
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
              )
            ) : null}
            {!isMobile ? (
              <RelatedFarmsBox
                poolDetail={poolDetail}
                tokenPriceList={tokenPriceList}
                sole_seed={sole_seed}
              ></RelatedFarmsBox>
            ) : null}
          </div>
          {/* title for mobile */}
          <div className="relative flex flex-col items-center w-full mb-3 xsm:mb-6 lg:hidden">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
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
                <div className="flex items-center text-lg font-gothamBold text-white">
                  {tokens[0]?.symbol}-{tokens[1]?.symbol}
                </div>
              </div>
              <span
                className="flex items-center justify-center rounded-lg cursor-pointer"
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
                    data-tooltip-html={
                      isMobile ? '' : remove_from_watchlist_tip()
                    }
                    data-tooltip-id="fullstar-tip"
                  >
                    <WatchListStartFull />

                    <CustomTooltip id="fullstar-tip" />
                  </div>
                ) : (
                  <div
                    className="text-sm "
                    data-type="info"
                    data-place="right"
                    data-multiline={true}
                    data-class="reactTip"
                    data-tooltip-html={isMobile ? '' : add_to_watchlist_tip()}
                    data-tooltip-id="emptystar-tip"
                  >
                    <WatchListStartEmpty />
                    <CustomTooltip id="emptystar-tip" />
                  </div>
                )}
              </span>
            </div>
            <div className="flex items-center w-full mt-1.5 pl-1.5 text-sm text-farmText justify-between">
              <div className="flex items-center">
                <span>
                  <FormattedMessage id="fee" />:{' '}
                  <span className="lg:font-gothamBold lg:text-white">
                    {poolDetail.fee / 10000}%
                  </span>
                </span>
                <div className="flex items-center">
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
                      defaultMessage={'Top Bin APR (24h)'}
                    />
                    :{' '}
                    <span className="font-gothamBold text-white">
                      {topBinApr}
                    </span>
                  </span>
                </div>
              </div>
              {sole_seed && (
                <FarmStampNewDCL multi={sole_seed.farmList?.length > 1} />
              )}
            </div>
          </div>
        </div>
      </div>
      {isMobile ? (
        <UserButtonBox
          poolDetail={poolDetail}
          tokenPriceList={tokenPriceList}
          liquidities={user_liquidities}
          matched_seeds={matched_seeds}
        />
      ) : null}
    </>
  );
}
