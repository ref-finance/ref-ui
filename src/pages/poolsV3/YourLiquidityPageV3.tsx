import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  list_liquidities,
  get_pool,
  PoolInfo,
  remove_liquidity,
  get_liquidity,
} from '../../services/swapV3';
import {
  ColorsBox,
  ColorsBoxCenter,
  AddButtonIcon,
  TipIon,
} from '~components/icon/V3';
import {
  GradientButton,
  BorderButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '~components/button/Button';
import {
  toPrecision,
  toReadableNumber,
  formatWithCommas,
} from '~utils/numbers';
import { TokenMetadata } from '../../services/ft-contract';
import { useTokens } from '../../state/token';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
  useAddAndRemoveUrlHandle,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
  TOKEN_LIST_FOR_RATE,
  displayNumberToAppropriateDecimals,
  get_intersection_radio,
  get_intersection_icon_by_radio,
  get_all_seeds,
  get_matched_seeds_for_dcl_pool,
  mint_liquidity,
  get_total_value_by_liquidity_amount_dcl,
} from '../../services/commonV3';
import BigNumber from 'bignumber.js';
import {
  FarmBoost,
  getBoostTokenPrices,
  Seed,
  get_seed,
} from '../../services/farm';
import { RemovePoolV3 } from '~components/pool/RemovePoolV3';
import { AddPoolV3 } from '~components/pool/AddPoolV3';
import { PoolTabV3 } from '~components/pool/PoolTabV3';
import {
  YourLiquidityAddLiquidityModal,
  YourLiquidityPage,
} from '../pools/YourLiquidityPage';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';

import {
  MyOrderCircle,
  MyOrderMask,
  MyOrderMask2,
} from '~components/icon/swapV3';
import { PoolRPCView } from '../../services/api';
import { ALL_STABLE_POOL_IDS, REF_FI_CONTRACT_ID } from '../../services/near';
import { getPoolsByIds } from '../../services/indexer';
import {
  ClipLoadering,
  BlueCircleLoading,
} from '../../components/layout/Loading';
import QuestionMark from '~components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import Big from 'big.js';
import { ConnectToNearBtnSwap } from '../../components/button/Button';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { checkTransactionStatus } from '../../services/swap';
import {
  REF_FI_YOUR_LP_VALUE,
  REF_FI_YOUR_LP_VALUE_V1_COUNT,
} from '../pools/YourLiquidityPage';
import {
  list_farmer_seeds,
  list_seed_farms,
  UserSeedInfo,
} from '../../services/farm';
import getConfig from '../../services/config';
import { allocation_rule_liquidities } from '~services/commonV3';
import { LinkArrowIcon } from '~components/icon/FarmBoost';
import { isMobile } from '~utils/device';

const { REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();

export default function YourLiquidityPageV3() {
  const clearState = () => {
    sessionStorage.removeItem(REF_FI_LP_VALUE_COUNT);
    sessionStorage.removeItem(REF_FI_LP_V2_VALUE);

    sessionStorage.removeItem(REF_FI_YOUR_LP_VALUE);

    sessionStorage.removeItem(REF_FI_YOUR_LP_VALUE_V1_COUNT);
  };

  window.onbeforeunload = clearState;

  const historyYourLP = useHistory();

  useEffect(() => {
    clearState();
  }, [historyYourLP.location.pathname]);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const intl = useIntl();
  const [listLiquidities, setListLiquidities] = useState<UserLiquidityInfo[]>(
    []
  );
  const liquidityStatusList = ['all', 'V2', 'V1'];
  const [addliquidityList, setAddliquidityList] = useState<any[]>([
    {
      text: 'V2 Liquidity',
      url: '/addLiquidityV2',
    },
    {
      text: 'V1 Liquidity',
      url: '/pools',
    },
  ]);

  const [stablePools, setStablePools] = useState<PoolRPCView[]>();
  const [listLiquiditiesLoading, setListLiquiditiesLoading] = useState(true);
  const [oldListLiquiditiesLoading, setOldListLiquiditiesLoading] =
    useState(true);

  const [YourLpValueV2, setYourLpValueV2] = useState('0');

  const [YourLpValueV1, setYourLpValueV1] = useState('0');

  const [lpValueV1Done, setLpValueV1Done] = useState(false);

  const [lpValueV2Done, setLpValueV2Done] = useState(false);

  useEffect(() => {
    if (!listLiquiditiesLoading) {
      if (listLiquidities.length === 0) {
        setLpValueV2Done(true);
        setYourLpValueV2('0');
      }
    }
  }, [listLiquiditiesLoading, listLiquidities]);

  const [generalAddLiquidity, setGeneralAddLiquidity] =
    useState<boolean>(false);
  const [checkedStatus, setCheckedStatus] = useState('all');
  const [oldLiquidityHasNoData, setOldLiquidityHasNoData] = useState(false);
  const [addLiqudityHover, setAddLiqudityHover] = useState(false);
  const [all_seeds, set_all_seeds] = useState<Seed[]>([]);
  const [user_seeds_map, set_user_seeds_map] = useState<
    Record<string, UserSeedInfo>
  >({});
  // callBack handle
  useAddAndRemoveUrlHandle();
  const history = useHistory();
  useEffect(() => {
    const ids = ALL_STABLE_POOL_IDS;
    getPoolsByIds({ pool_ids: ids }).then((res) => {
      setStablePools(res);
    });
    get_all_seeds().then((seeds: Seed[]) => {
      set_all_seeds(seeds);
    });
  }, []);
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
    }
  }, [isSignedIn]);
  async function get_list_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    if (list.length > 0) {
      // get user seeds
      const user_seeds_map = await list_farmer_seeds();
      const user_seed_ids = Object.keys(user_seeds_map);
      if (user_seed_ids.length > 0) {
        const seedsPromise = user_seed_ids.map((seed_id: string) => {
          return get_seed(seed_id);
        });
        const user_seeds = await Promise.all(seedsPromise);
        user_seeds.forEach((seed: Seed) => {
          const { seed_id } = seed;
          const [contractId, mft_id] = seed_id.split('@');
          if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
            const { free_amount, locked_amount } =
              user_seeds_map[seed_id] || {};
            const user_seed_amount = new BigNumber(free_amount)
              .plus(locked_amount)
              .toFixed();
            allocation_rule_liquidities({ list, user_seed_amount, seed });
          }
        });
      }
      // sort
      list.sort((item1: UserLiquidityInfo, item2: UserLiquidityInfo) => {
        const item1_hashId = +item1.lpt_id.split('#')[1];
        const item2_hashId = +item2.lpt_id.split('#')[1];
        return item1_hashId - item2_hashId;
      });
      set_user_seeds_map(user_seeds_map);
      setListLiquidities(list);
    }
    setListLiquiditiesLoading(false);
  }
  function goAddLiquidityPage(url: string) {
    history.push(url);
  }
  function switchButton(type: string) {
    setCheckedStatus(type);
  }
  function getTipForV2Pool() {
    const n = intl.formatMessage({ id: 'v2PoolTip' });
    const result: string = `<div class="text-navHighLightText text-xs text-left">${n}</div>`;
    return result;
  }

  const { txHash } = getURLInfo();

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (txHash && getCurrentWallet()?.wallet?.isSignedIn()) {
      checkTransactionStatus(txHash).then((res) => {
        let status: any = res.status;

        if (
          res.transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute'
        ) {
          let receipt = res?.receipts_outcome?.find(
            (o: any) => o?.outcome?.executor_id === REF_FI_CONTRACT_ID
          );

          if (receipt) {
            status = receipt?.outcome?.status;

            // not create pool
            if (
              res?.receipts_outcome?.some((o: any) => {
                return (
                  o?.outcome?.executor_id !== REF_FI_CONTRACT_ID &&
                  o?.outcome?.executor_id !== accountId
                );
              })
            ) {
              return;
            }
            if (receipt?.outcome?.logs.length > 0) {
              return;
            }
          } else return;
        } else if (
          res.transaction?.actions?.[0]?.FunctionCall?.method_name !==
          'add_simple_pool'
        ) {
          return;
        }

        const data: string | undefined = status.SuccessValue;
        if (data) {
          const buff = Buffer.from(data, 'base64');
          const pool_id = buff.toString('ascii');
          history.push(`/pool/${pool_id}`);
        }
      });
    }
  }, [txHash]);
  return (
    <>
      <PoolTabV3
        yourLPpage
        lpValueV1Done={lpValueV1Done}
        lpValueV2Done={lpValueV2Done}
        YourLpValueV1={YourLpValueV1}
        YourLpValueV2={YourLpValueV2}
      ></PoolTabV3>
      <div className="flex items flex-col lg:w-1000px xs:w-11/12 md:w-11/12 m-auto">
        <div className="flex items-start justify-between lg:mt-4 xs:mb-5 md:mb-5">
          <div className="flex items-center">
            <div className="flex items-center text-sm text-primaryText border border-selectBorder p-0.5 rounded-lg bg-v3LiquidityTabBgColor">
              {liquidityStatusList.map((item: string, index: number) => {
                return (
                  <span
                    key={index}
                    onClick={() => {
                      switchButton(item);
                    }}
                    className={`flex items-center justify-center h-6 py-px px-3.5 box-content w-auto rounded-md cursor-pointer gotham_bold ${
                      checkedStatus == item
                        ? 'bg-primaryGradient text-white'
                        : 'text-primaryText'
                    }`}
                  >
                    {item == 'all' ? (
                      <FormattedMessage
                        id={item}
                        defaultMessage={item}
                      ></FormattedMessage>
                    ) : (
                      item
                    )}
                  </span>
                );
              })}
            </div>
          </div>
          <div
            className={`relative  ${
              isSignedIn ? '' : 'hidden'
            } pb-10 xs:pb-0 md:pb-0`}
            onMouseOver={() => {
              setAddLiqudityHover(true);
            }}
            onMouseLeave={() => {
              setAddLiqudityHover(false);
            }}
          >
            <GradientButton
              color="#fff"
              className={`px-4 h-9 text-center text-sm text-white focus:outline-none`}
              borderRadius={'8px'}
            >
              <div className="flex items-center">
                <AddButtonIcon className="mr-1.5 text-white"></AddButtonIcon>
                <FormattedMessage
                  id="add_liquidity"
                  defaultMessage="Add Liquidity"
                />
              </div>
            </GradientButton>
            <span
              className={`top-10 pt-2 absolute z-50 xsm:right-0 ${
                addLiqudityHover ? '' : 'hidden'
              }`}
            >
              <div
                className="p-1.5 rounded-xl min-w-28 flex flex-col"
                style={{
                  background: 'rgba(23,32,38)',
                  border: '1px solid #415462',
                }}
              >
                {addliquidityList.map((item: any, index: number) => {
                  return (
                    <span
                      key={index}
                      onClick={(e) => {
                        if (item.text === 'V1 Liquidity') {
                          setGeneralAddLiquidity(true);
                        } else {
                          goAddLiquidityPage(item.url);
                        }
                      }}
                      className={`whitespace-nowrap hover:bg-primaryText hover:bg-opacity-30 items-center flex justify-center px-5 py-0.5 h-10 hover:text-white rounded-lg text-primaryText text-center text-sm cursor-pointer my-auto`}
                    >
                      {item.text}
                    </span>
                  );
                })}
              </div>
            </span>
          </div>
        </div>
        {!isSignedIn ? (
          <NoLiquidity className="mt-4"></NoLiquidity>
        ) : (
          <>
            {listLiquiditiesLoading ? (
              <div className={`${checkedStatus == 'V1' ? 'hidden' : ''}`}>
                <div className="text-white text-base gotham_bold mb-3">
                  V2 (0)
                </div>
                <div className="flex justify-center items-center">
                  <BlueCircleLoading></BlueCircleLoading>
                </div>
              </div>
            ) : (
              <>
                {listLiquidities.length > 0 ? (
                  <div
                    className={`mb-10 ${checkedStatus == 'V1' ? 'hidden' : ''}`}
                  >
                    <div className="mb-3">
                      <div className="flex items-center text-white text-base">
                        <span className="gotham_bold">
                          V2 ({listLiquidities.length})
                        </span>
                        <div
                          className="text-white text-right ml-1"
                          data-class="reactTip"
                          data-for={'v2PoolNumberTip'}
                          data-place="top"
                          data-html={true}
                          data-tip={getTipForV2Pool()}
                        >
                          <QuestionMark></QuestionMark>
                          <ReactTooltip
                            id={'v2PoolNumberTip'}
                            backgroundColor="#1D2932"
                            border
                            borderColor="#7e8a93"
                            effect="solid"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-farmText">
                        <FormattedMessage id="v2_your_pool_introduction"></FormattedMessage>
                      </p>
                    </div>
                    <div>
                      {listLiquidities.map(
                        (liquidity: UserLiquidityInfo, index: number) => {
                          return (
                            <div key={index}>
                              <UserLiquidityLine
                                lpSize={listLiquidities.length}
                                setLpValueV2Done={setLpValueV2Done}
                                setYourLpValueV2={setYourLpValueV2}
                                liquidity={liquidity}
                                all_seeds={all_seeds}
                              ></UserLiquidityLine>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            )}
            <YourLiquidityPage
              setLpValueV1Done={setLpValueV1Done}
              setYourLpValueV1={setYourLpValueV1}
              checkedStatus={checkedStatus}
              listLiquidities={listLiquidities}
              listLiquiditiesLoading={listLiquiditiesLoading}
            ></YourLiquidityPage>
          </>
        )}
      </div>
      <YourLiquidityAddLiquidityModal
        isOpen={generalAddLiquidity}
        onRequestClose={() => {
          setGeneralAddLiquidity(false);
        }}
        stablePools={stablePools}
      />
    </>
  );
}

export const REF_FI_LP_VALUE_COUNT = 'REF_FI_LP_VALUE_COUNT';

export const REF_FI_LP_V2_VALUE = 'REF_FI_LP_V2_VALUE';

function UserLiquidityLine({
  liquidity,
  setLpValueV2Done,
  lpSize,
  setYourLpValueV2,
  all_seeds,
}: {
  liquidity: UserLiquidityInfo;
  lpSize: number;
  setLpValueV2Done: (value: boolean) => void;
  setYourLpValueV2: (value: string) => void;
  all_seeds: Seed[];
}) {
  const [poolDetail, setPoolDetail] = useState<PoolInfo>();
  const [liquidityDetail, setLiquidityDetail] = useState<UserLiquidityInfo>();
  const [hover, setHover] = useState<boolean>(false);
  const [isInrange, setIsInrange] = useState<boolean>(true);
  const [your_liquidity, setYour_liquidity] = useState('');
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [showRemoveBox, setShowRemoveBox] = useState<boolean>(false);
  const [showAddBox, setShowAddBox] = useState<boolean>(false);
  const [related_farms, set_related_farms] = useState<FarmBoost[]>([]);
  const [is_in_farming, set_is_in_farming] = useState<boolean>(false);
  const [related_seed_info, set_related_seed_info] = useState<
    Record<string, any>
  >({});

  const {
    lpt_id,
    owner_id,
    pool_id,
    left_point,
    right_point,
    amount: L,
    unclaimed_fee_x,
    unclaimed_fee_y,
  } = liquidity;
  const [token_x, token_y, fee] = pool_id.split('|');
  const tokenMetadata_x_y = useTokens([token_x, token_y]);
  const rate_need_to_reverse_display = useMemo(() => {
    if (tokenMetadata_x_y) {
      const [tokenX] = tokenMetadata_x_y;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) return true;
      return false;
    }
  }, [tokenMetadata_x_y?.length]);

  const history = useHistory();
  useEffect(() => {
    get_pool_detail();
    getBoostTokenPrices().then(setTokenPriceList);
    getLiquidityDetail();
    get_pool_related_farms();
  }, []);
  useEffect(() => {
    if (tokenMetadata_x_y && poolDetail && tokenPriceList) {
      const { current_point } = poolDetail;
      get_your_liquidity(current_point);
    }
  }, [poolDetail, tokenMetadata_x_y, tokenPriceList]);
  useEffect(() => {}, []);
  useEffect(() => {
    const { mft_id, left_point, right_point } = liquidity;
    let Icon;
    let your_apr;
    let link;
    let inRange;
    if (is_in_farming) {
      const [fixRange, dcl_pool_id, left_point_seed, right_point_seed] =
        mft_id.split('&');
      const radio = get_intersection_radio({
        left_point_liquidity: left_point,
        right_point_liquidity: right_point,
        left_point_seed,
        right_point_seed,
      });
      Icon = get_intersection_icon_by_radio(radio);
    } else {
      const active_seeds = get_matched_seeds_for_dcl_pool({
        seeds: all_seeds,
        pool_id: liquidity.pool_id,
      });
      const canFarmSeed = active_seeds.find((seed: Seed) => {
        const { min_deposit, seed_id } = seed;
        const [fixRange, dcl_pool_id, left_point_seed, right_point_seed] =
          seed_id.split('@')[1].split('&');
        const v_liquidity = mint_liquidity(liquidity, seed_id);
        const radio = get_intersection_radio({
          left_point_liquidity: left_point,
          right_point_liquidity: right_point,
          left_point_seed,
          right_point_seed,
        });
        const condition1 = new BigNumber(v_liquidity).isGreaterThanOrEqualTo(
          min_deposit
        );
        const condition2 = +radio > 0;
        if (condition1 && condition2) return true;
      });
      const targetSeed = canFarmSeed || active_seeds[0];
      if (targetSeed) {
        const { seed_id } = targetSeed;
        const [fixRange, dcl_pool_id, left_point_seed, right_point_seed] =
          seed_id.split('@')[1].split('&');
        const radio = get_intersection_radio({
          left_point_liquidity: left_point,
          right_point_liquidity: right_point,
          left_point_seed,
          right_point_seed,
        });
        if (canFarmSeed) {
          your_apr = get_your_apr(liquidity, targetSeed);
        }
        Icon = get_intersection_icon_by_radio(radio);
        inRange = +radio > 0;
        const link_params = `${dcl_pool_id}&${left_point_seed}&${right_point_seed}`;
        link = `/v2farms/${link_params}-r`;
      }
    }
    set_related_seed_info({
      Icon,
      your_apr,
      link,
      inRange,
    });
  }, [liquidity, all_seeds, is_in_farming, tokenPriceList]);
  async function get_pool_related_farms() {
    const is_in_farming =
      liquidity.part_farm_ratio && +liquidity.part_farm_ratio > 0;
    if (is_in_farming) {
      const id = liquidity.mft_id.slice(1);
      const seed_id = REF_UNI_V3_SWAP_CONTRACT_ID + '@' + id;
      const farmList = await list_seed_farms(seed_id);
      set_related_farms(farmList);
    }
    set_is_in_farming(is_in_farming);
  }
  async function get_pool_detail() {
    const detail = await get_pool(pool_id, token_x);
    if (detail) {
      const { current_point } = detail;
      if (current_point >= left_point && right_point > current_point) {
        setIsInrange(true);
      } else {
        setIsInrange(false);
      }
      setPoolDetail(detail);
    }
  }
  async function getLiquidityDetail() {
    const l = await get_liquidity(lpt_id);
    if (l) {
      setLiquidityDetail(l);
    }
  }
  function getRate(direction: string) {
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
    return displayNumberToAppropriateDecimals(value);
  }
  function getLpt_id() {
    return lpt_id.split('#')[1];
  }
  function get_your_liquidity(current_point: number) {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const priceX = tokenPriceList[tokenX.id]?.price || 0;
    const priceY = tokenPriceList[tokenY.id]?.price || 0;
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      let tokenYAmount = getY(left_point, current_point, L, tokenY) || 0;
      let tokenXAmount = getX(current_point + 1, right_point, L, tokenX) || 0;
      const { amountx, amounty } = get_X_Y_In_CurrentPoint(tokenX, tokenY, L);
      tokenXAmount = new BigNumber(tokenXAmount).plus(amountx).toFixed();
      tokenYAmount = new BigNumber(tokenYAmount).plus(amounty).toFixed();
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      const total_price = tokenYTotalPrice.plus(tokenXTotalPrice).toFixed();
      setYour_liquidity(formatWithCommas(toPrecision(total_price, 3)));

      const storagedCount = sessionStorage.getItem(REF_FI_LP_VALUE_COUNT);

      const newSize = new BigNumber(storagedCount || '0').plus(1).toFixed();

      sessionStorage.setItem(REF_FI_LP_VALUE_COUNT, newSize);

      const storagedValue = sessionStorage.getItem(REF_FI_LP_V2_VALUE);

      sessionStorage.setItem(
        REF_FI_LP_V2_VALUE,
        new Big(!!total_price ? toPrecision(total_price, 3) : '0')
          .plus(new Big(storagedValue || '0'))
          .toFixed(2)
      );

      const newLPValue = new Big(
        !!total_price ? toPrecision(total_price, 3) : '0'
      )
        .plus(new Big(storagedValue || '0'))
        .toFixed(2);

      if (Number(newSize) == lpSize) {
        setLpValueV2Done(true);
        setYourLpValueV2(newLPValue);
      }
    }
    // only y token
    if (current_point >= right_point) {
      const tokenYAmount = getY(left_point, right_point, L, tokenY);
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      const total_price = tokenYTotalPrice.toFixed();
      setYour_liquidity(formatWithCommas(toPrecision(total_price, 3)));
      const storagedValue = sessionStorage.getItem(REF_FI_LP_V2_VALUE);

      const storagedCount = sessionStorage.getItem(REF_FI_LP_VALUE_COUNT);

      const newSize = new BigNumber(storagedCount || '0').plus(1).toFixed();

      sessionStorage.setItem(REF_FI_LP_VALUE_COUNT, newSize);

      sessionStorage.setItem(
        REF_FI_LP_V2_VALUE,
        new Big(!!total_price ? toPrecision(total_price, 3) : '0')
          .plus(new Big(storagedValue || '0'))
          .toFixed(2)
      );

      const newLPValue = new Big(
        !!total_price ? toPrecision(total_price, 3) : '0'
      )
        .plus(new Big(storagedValue || '0'))
        .toFixed(2);

      if (Number(newSize) == lpSize) {
        setLpValueV2Done(true);
        setYourLpValueV2(newLPValue);
      }
    }
    // only x token
    if (left_point > current_point) {
      const tokenXAmount = getX(left_point, right_point, L, tokenX);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      const total_price = tokenXTotalPrice.toFixed();
      setYour_liquidity(formatWithCommas(toPrecision(total_price, 3)));
      const storagedValue = sessionStorage.getItem(REF_FI_LP_V2_VALUE);

      const storagedCount = sessionStorage.getItem(REF_FI_LP_VALUE_COUNT);

      const newSize = new BigNumber(storagedCount || '0').plus(1).toFixed();

      sessionStorage.setItem(REF_FI_LP_VALUE_COUNT, newSize);

      sessionStorage.setItem(
        REF_FI_LP_V2_VALUE,
        new Big(!!total_price ? toPrecision(total_price, 3) : '0')
          .plus(new Big(storagedValue || '0'))
          .toFixed(2)
      );
      const newLPValue = new Big(
        !!total_price ? toPrecision(total_price, 3) : '0'
      )
        .plus(new Big(storagedValue || '0'))
        .toFixed(2);

      if (Number(newSize) == lpSize) {
        setLpValueV2Done(true);
        setYourLpValueV2(newLPValue);
      }
    }
  }
  function getY(
    leftPoint: number,
    rightPoint: number,
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
  function claimRewards(e: any) {
    e.stopPropagation();
    if (!canClaim()) return;
    setClaimLoading(true);
    const [tokenX, tokenY] = tokenMetadata_x_y;
    remove_liquidity({
      token_x: tokenX,
      token_y: tokenY,
      lpt_id,
      amount: '0',
      mft_id: '',
      min_amount_x: '0',
      min_amount_y: '0',
    });
  }
  function goYourLiquidityDetailPage() {
    const id = lpt_id.replace(/\|/g, '@').replace('#', '@');
    history.push(`/yoursLiquidityDetailV2/${id}`);
  }
  function getTokenFeeAmount(p: string) {
    if (liquidityDetail && tokenMetadata_x_y && tokenPriceList) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const { unclaimed_fee_x, unclaimed_fee_y } = liquidityDetail;
      const fee_x_amount = toReadableNumber(
        tokenX.decimals,
        unclaimed_fee_x || '0'
      );
      const fee_y_amount = toReadableNumber(
        tokenY.decimals,
        unclaimed_fee_y || '0'
      );
      if (p == 'l') {
        if (new BigNumber(fee_x_amount).isEqualTo('0')) {
          return '0';
        } else if (new BigNumber(fee_x_amount).isLessThan('0.001')) {
          return '<0.001';
        } else {
          return toPrecision(fee_x_amount, 3);
        }
      } else if (p == 'r') {
        if (new BigNumber(fee_y_amount).isEqualTo('0')) {
          return '0';
        } else if (new BigNumber(fee_y_amount).isLessThan('0.001')) {
          return '<0.001';
        } else {
          return toPrecision(fee_y_amount, 3);
        }
      } else if (p == 'p') {
        const tokenxSinglePrice = tokenPriceList[tokenX.id]?.price || '0';
        const tokenySinglePrice = tokenPriceList[tokenY.id]?.price || '0';
        const priceX = new BigNumber(fee_x_amount).multipliedBy(
          tokenxSinglePrice
        );
        const priceY = new BigNumber(fee_y_amount).multipliedBy(
          tokenySinglePrice
        );
        const totalPrice = priceX.plus(priceY);
        if (totalPrice.isEqualTo('0')) {
          return '$0';
        } else if (totalPrice.isLessThan('0.001')) {
          return '<$0.001';
        } else {
          return '$' + toPrecision(totalPrice.toFixed(), 3);
        }
      }
    }
  }
  function canClaim() {
    if (liquidityDetail) {
      const { unclaimed_fee_x, unclaimed_fee_y } = liquidityDetail;
      if (+unclaimed_fee_x > 0 || +unclaimed_fee_y > 0) return true;
    }
    return false;
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
  function mobile_ReferenceToken(direction: string) {
    if (tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      if (direction == 'left') {
        if (rate_need_to_reverse_display) {
          return tokenY.symbol;
        } else {
          return tokenX.symbol;
        }
      } else if (direction == 'right') {
        if (rate_need_to_reverse_display) {
          return tokenX.symbol;
        } else {
          return tokenY.symbol;
        }
      }
    }
  }
  function go_farm() {
    const [fixRange, pool_id, left_point, right_point] =
      liquidity.mft_id.split('&');
    const link_params = `${pool_id}&${left_point}&${right_point}`;
    const actives = related_farms.filter((farm: FarmBoost) => {
      return farm.status != 'Ended';
    });
    let url;
    if (related_farms.length > 0 && actives.length == 0) {
      url = `/v2farms/${link_params}-e`;
    } else {
      url = `/v2farms/${link_params}-r`;
    }
    window.open(url);
  }
  function get_your_apr(liquidity: UserLiquidityInfo, seed: Seed) {
    const { farmList, total_seed_amount, total_seed_power, seed_id } = seed;
    // principal
    const total_principal = get_liquidity_value(liquidity, seed);
    // seed total rewards
    let total_rewards = '0';
    farmList.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      const { daily_reward, reward_token } = farm.terms;
      const quantity = toReadableNumber(token_meta_data.decimals, daily_reward);
      const reward_token_price = Number(
        tokenPriceList[reward_token]?.price || 0
      );
      const cur_token_rewards = new BigNumber(quantity)
        .multipliedBy(reward_token_price)
        .multipliedBy(365);
      total_rewards = cur_token_rewards.plus(total_rewards).toFixed();
    });
    // lp percent
    let percent;
    const mint_amount = mint_liquidity(liquidity, seed_id);
    const temp_total = new BigNumber(total_seed_power || 0).plus(mint_amount);
    if (temp_total.isGreaterThan(0)) {
      percent = new BigNumber(mint_amount).dividedBy(temp_total);
    }
    // profit
    let profit;
    if (percent) {
      profit = percent.multipliedBy(total_rewards);
    }

    // your apr
    if (profit && +total_principal > 0) {
      const your_apr = profit.dividedBy(total_principal).multipliedBy(100);
      if (your_apr.isEqualTo('0')) {
        return '0%';
      } else if (your_apr.isLessThan(0.01)) {
        return `<0.01%`;
      } else {
        return `${toPrecision(your_apr.toFixed(), 2)}%`;
      }
    } else {
      return '-';
    }
  }
  function get_liquidity_value(liquidity: UserLiquidityInfo, seed: Seed) {
    const { left_point, right_point, amount } = liquidity;
    const poolDetail = seed.pool;
    const { pool } = seed;
    const tokens = pool.tokens_meta_data;
    const { token_x, token_y } = poolDetail;
    const v = get_total_value_by_liquidity_amount_dcl({
      left_point,
      right_point,
      poolDetail,
      amount,
      price_x_y: {
        [token_x]: tokenPriceList[token_x]?.price || '0',
        [token_y]: tokenPriceList[token_y]?.price || '0',
      },
      metadata_x_y: {
        [token_x]: tokens[0],
        [token_y]: tokens[1],
      },
    });
    return v;
  }
  const {
    Icon: Liquidity_icon,
    your_apr: liquidity_your_apr,
    link: liquidity_link,
    inRange: liquidity_inRange,
  } = related_seed_info;
  return (
    <div
      className="mt-3.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* for PC */}
      <div className="relative flex flex-col items-center xs:hidden md:hidden">
        <div className="absolute -top-1.5 flex items-center justify-center z-10">
          <ColorsBoxCenter></ColorsBoxCenter>
          <span className="absolute text-white text-xs gotham_bold">
            ID #{getLpt_id()}
          </span>
        </div>
        <div className="w-full rounded-xl overflow-hidden">
          <div
            className={`relative p-4 pt-8 cursor-pointer ${
              hover ? 'bg-v3HoverDarkBgColor' : 'bg-cardBg'
            }`}
            onClick={goYourLiquidityDetailPage}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center flex-shrink-0">
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                    className="w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                    className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                </div>
                <span className="text-white font-bold ml-9 mr-2.5 text-sm gotham_bold">
                  {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']}/
                  {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}
                </span>
                <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
                  <span className="text-xs text-v3SwapGray whitespace-nowrap mr-1.5">
                    <FormattedMessage id="fee_Tiers" />
                  </span>
                  <span className="text-sm text-v3Blue">{+fee / 10000}%</span>
                </div>
                {Liquidity_icon ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (liquidity_link) {
                        window.open(liquidity_link);
                      }
                    }}
                    className={`flex items-center justify-center border border-greenColor rounded-lg px-1 ml-2 ${
                      liquidity_link ? 'cursor-pointer' : ''
                    } ${
                      is_in_farming || liquidity_inRange ? '' : 'opacity-40'
                    }`}
                  >
                    <span className="text-xs text-greenColor mr-1">Farm</span>{' '}
                    <Liquidity_icon num="2"></Liquidity_icon>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center">
                <span className="text-v3SwapGray text-xs mr-1.5">
                  <FormattedMessage
                    id="min"
                    defaultMessage="Min"
                  ></FormattedMessage>
                </span>
                <span className="text-white text-sm overflow-hidden whitespace-nowrap overflow-ellipsis gotham_bold">
                  {getRate(rate_need_to_reverse_display ? 'right' : 'left')}
                </span>
                <label className="text-v3SwapGray text-xs mx-2">-</label>
                <span className="text-v3SwapGray text-xs mr-1.5">
                  <FormattedMessage
                    id="max"
                    defaultMessage="Max"
                  ></FormattedMessage>
                </span>
                <span className="text-white text-sm overflow-hidden whitespace-nowrap overflow-ellipsis gotham_bold">
                  {getRate(rate_need_to_reverse_display ? 'left' : 'right')}
                </span>
                <span className="text-v3SwapGray text-xs ml-1.5 mr-3">
                  {getRateMapTokens()}
                </span>
                <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
                  <span
                    className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isInrange
                        ? 'bg-gradientFromHover'
                        : 'bg-v3GarkWarningColor'
                    }`}
                  ></span>
                  <span
                    className={`whitespace-nowrap text-xs ${
                      isInrange
                        ? 'text-gradientFromHover'
                        : 'text-v3GarkWarningColor'
                    }`}
                  >
                    {isInrange ? (
                      <FormattedMessage id="in_range"></FormattedMessage>
                    ) : (
                      <FormattedMessage id="out_of_range"></FormattedMessage>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`border-t border-v3BlueBorderColor w-full ${
              hover ? '' : 'hidden'
            }`}
          >
            {liquidity_your_apr ? (
              <div
                className="relative flex items-center justify-center p-1"
                style={{ background: 'rgba(91, 64, 255, 0.5)' }}
              >
                <TipIon className="mr-2"></TipIon>
                <span className="text-sm text-white">
                  You can earn rewards by farming, est. APR is{' '}
                  {liquidity_your_apr}
                </span>
                <div
                  className="flex items-center justify-center absolute right-4 text-white cursor-pointer"
                  onClick={() => {
                    window.open(liquidity_link);
                  }}
                >
                  <a className="text-sm text-white mr-1 underline">Go Farm</a>
                  <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
                </div>
              </div>
            ) : null}

            <div className={`flex items-center justify-between bg-cardBg p-4`}>
              <div className="flex items-center justify-center">
                <span className="text-xs text-v3SwapGray">
                  <FormattedMessage id="your_liquidity" />
                </span>
                <span className="text-sm text-white mx-2.5 gotham_bold">
                  ${your_liquidity || '-'}
                </span>
                <GradientButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddBox(true);
                  }}
                  color="#fff"
                  minWidth="5rem"
                  disabled={is_in_farming}
                  borderRadius="8px"
                  btnClassName={is_in_farming ? 'cursor-not-allowed' : ''}
                  className={`px-3 h-8 text-center text-sm text-white gotham_bold focus:outline-none mr-2.5 ${
                    is_in_farming ? 'opacity-40 ' : ''
                  }`}
                >
                  <FormattedMessage id="add" />
                </GradientButton>
                <BorderButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRemoveBox(true);
                  }}
                  rounded="rounded-lg"
                  disabled={is_in_farming}
                  px="px-0"
                  py="py-1"
                  style={{ minWidth: '5rem' }}
                  className={`flex-grow  gotham_bold text-sm text-greenColor h-8 ${
                    is_in_farming ? 'opacity-40' : ''
                  }`}
                >
                  <FormattedMessage id="remove" />
                </BorderButton>
                {is_in_farming ? (
                  <div className="flex items-center text-sm text-primaryText ml-2.5">
                    Staked
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        go_farm();
                      }}
                    >
                      <span className="text-greenColor mx-1 cursor-pointer underline">
                        in farm
                      </span>
                      <LinkArrowIcon className="cursor-pointer text-greenColor"></LinkArrowIcon>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-center">
                <span className="text-xs text-v3SwapGray mr-2.5">
                  <FormattedMessage id="unclaimed_fees" />
                </span>
                <img
                  src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                  className="w-5 h-5 border border-greenColor rounded-full mr-1"
                ></img>
                <span className="text-sm text-white mr-3 gotham_bold">
                  {getTokenFeeAmount('l') || '-'}
                </span>
                <img
                  src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                  className="w-5 h-5 border border-greenColor rounded-full mr-1"
                ></img>
                <span className="text-sm text-white gotham_bold">
                  {getTokenFeeAmount('r') || '-'}
                </span>
                <div
                  className={`flex items-center justify-center  rounded-lg text-sm px-2 py-1 ml-5 gotham_bold ${
                    !canClaim()
                      ? 'bg-black bg-opacity-25 text-v3SwapGray cursor-not-allowed'
                      : 'bg-deepBlue hover:bg-deepBlueHover text-white cursor-pointer'
                  }`}
                  onClick={claimRewards}
                >
                  <ButtonTextWrapper
                    loading={claimLoading}
                    Text={() => <FormattedMessage id="claim" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* for Mobile */}
      <div className="lg:hidden">
        <div
          className={`relative cursor-pointer bg-cardBg rounded-lg overflow-hidden`}
          onClick={goYourLiquidityDetailPage}
        >
          <div className="flex flex-col items-center justify-between w-full bg-orderMobileTop px-3 pb-3">
            <div className="flex items-center justify-center">
              <ColorsBox svgId="paint0_linear_124_7158"></ColorsBox>
              <span className="absolute text-white text-xs">
                ID #{getLpt_id()}
              </span>
            </div>
            <div className="flex items-center justify-between w-full mt-1.5">
              <div className="flex items-center flex-shrink-0">
                <div className="flex items-center flex-shrink-0">
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                    className="w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                    className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                </div>
                <span className="text-white text-sm ml-1.5">
                  {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']}/
                  {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}
                </span>
                {Liquidity_icon ? (
                  <div
                    onClick={() => {
                      e.stopPropagation();
                      if (liquidity_link) {
                        window.open(liquidity_link);
                      }
                    }}
                    className={`flex items-center justify-center border border-greenColor rounded-lg px-1 ml-2 ${
                      is_in_farming || liquidity_inRange ? '' : 'opacity-40'
                    }`}
                  >
                    <span className="text-xs text-greenColor mr-1">Farm</span>{' '}
                    <Liquidity_icon num="1"></Liquidity_icon>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-center ml-2 bg-black bg-opacity-25 rounded-2xl px-1.5 h-6 py-0.5 overflow-hidden whitespace-nowrap overflow-ellipsis">
                <span
                  className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isInrange ? 'bg-gradientFromHover' : 'bg-v3GarkWarningColor'
                  }`}
                ></span>
                <span
                  className={`whitespace-nowrap text-xs overflow-hidden  overflow-ellipsis ${
                    isInrange
                      ? 'text-gradientFromHover'
                      : 'text-v3GarkWarningColor'
                  }`}
                >
                  {isInrange ? (
                    <FormattedMessage id="in_range"></FormattedMessage>
                  ) : (
                    <FormattedMessage id="out_of_range"></FormattedMessage>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col p-3">
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-v3SwapGray">
                <FormattedMessage id="fee_Tiers" />
              </span>
              <span className="text-sm text-white">{+fee / 10000}%</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-v3SwapGray text-xs">
                <FormattedMessage id="min_price" /> (1{' '}
                {mobile_ReferenceToken('left')})
              </span>
              <span className="text-white text-sm">
                {getRate(rate_need_to_reverse_display ? 'right' : 'left')}&nbsp;
                {mobile_ReferenceToken('right')}
              </span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-v3SwapGray text-xs">
                <FormattedMessage id="max_price" /> (1{' '}
                {mobile_ReferenceToken('left')})
              </span>
              <span className="text-white text-sm">
                {getRate(rate_need_to_reverse_display ? 'left' : 'right')}&nbsp;
                {mobile_ReferenceToken('right')}
              </span>
            </div>
            <div className="flex items-start justify-between mt-4">
              <span className="text-v3SwapGray text-xs">
                <FormattedMessage id="unclaimed_fees" />
              </span>
              <span className="text-white text-sm"></span>
              <div className="flex flex-col justify-end text-white text-sm">
                <div className="flex items-center">
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                    className="w-5 h-5 border border-greenColor rounded-full mr-1"
                  ></img>
                  <span className="text-sm text-white mr-3">
                    {getTokenFeeAmount('l') || '-'}
                  </span>
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                    className="w-5 h-5 border border-greenColor rounded-full mr-1"
                  ></img>
                  <span className="text-sm text-white">
                    {getTokenFeeAmount('r') || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-end mt-2">
                  <div
                    className={`flex items-center justify-center  rounded-lg text-sm px-2 py-1 ${
                      !canClaim()
                        ? 'bg-black bg-opacity-25 text-v3SwapGray cursor-not-allowed'
                        : 'bg-deepBlue hover:bg-deepBlueHover text-white cursor-pointer'
                    }`}
                    onClick={claimRewards}
                  >
                    <ButtonTextWrapper
                      loading={claimLoading}
                      Text={() => <FormattedMessage id="claim" />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-searchBgColor rounded-2xl pt-3 overflow-hidden">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs text-v3SwapGray">
              <FormattedMessage id="your_liquidity" />
            </span>
            <span className="text-sm text-white">${your_liquidity || '-'}</span>
          </div>
          <div className="flex items-center justify-between px-3 mt-3.5 mb-4">
            <GradientButton
              onClick={(e) => {
                e.stopPropagation();
                setShowAddBox(true);
              }}
              disabled={is_in_farming ? true : false}
              color="#fff"
              className={`w-1 flex-grow h-8 text-center text-sm text-white focus:outline-none mr-3 ${
                is_in_farming ? 'opacity-40' : ''
              }`}
            >
              <FormattedMessage id="add" />
            </GradientButton>
            <BorderButton
              onClick={(e) => {
                e.stopPropagation();
                setShowRemoveBox(true);
              }}
              disabled={is_in_farming ? true : false}
              rounded="rounded-md"
              px="px-0"
              py="py-1"
              className={`w-1 flex-grow  text-sm text-greenColor h-8 ${
                is_in_farming ? 'opacity-40' : ''
              }`}
            >
              <FormattedMessage id="remove" />
            </BorderButton>
          </div>
          {liquidity_your_apr ? (
            <div
              className="relative flex items-start justify-center p-1"
              style={{ background: 'rgba(91, 64, 255, 0.5)' }}
            >
              <div className="flex items-center justify-center text-sm text-white flex-wrap">
                <TipIon className="mr-2"></TipIon>
                You can earn rewards{' '}
                <span
                  className="underline ml-1 mr-0.5"
                  onClick={() => {
                    window.open(liquidity_link);
                  }}
                >
                  by farming
                </span>
                <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
                est. APR is{' '}
                <span className="gotham_bold ml-1">{liquidity_your_apr}</span>
              </div>
            </div>
          ) : null}
          {is_in_farming ? (
            <div className="flex items-center justify-center text-sm text-primaryText mb-3">
              This NFT has been staked
              <span
                className="text-sm text-greenColor underline ml-1 mr-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  go_farm();
                }}
              >
                in farm
              </span>
              <LinkArrowIcon className="text-greenColor"></LinkArrowIcon>
            </div>
          ) : null}
        </div>
      </div>
      {showRemoveBox ? (
        <RemovePoolV3
          isOpen={showRemoveBox}
          onRequestClose={() => {
            setShowRemoveBox(false);
          }}
          tokenMetadata_x_y={tokenMetadata_x_y}
          poolDetail={poolDetail}
          tokenPriceList={tokenPriceList}
          userLiquidity={liquidityDetail}
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
        ></RemovePoolV3>
      ) : null}
      <AddPoolV3
        isOpen={showAddBox}
        onRequestClose={() => {
          setShowAddBox(false);
        }}
        tokenMetadata_x_y={tokenMetadata_x_y}
        poolDetail={poolDetail}
        tokenPriceList={tokenPriceList}
        userLiquidity={liquidityDetail}
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
      ></AddPoolV3>
    </div>
  );
}
export function NoLiquidity({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  return (
    <div
      className={`w-full rounded-xl overflow-hidden h-48 relative text-white font-normal  flex items-center justify-center ${
        className || ''
      }`}
      style={{
        background: 'rgb(26,36,43)',
      }}
    >
      <div className="flex items-center flex-col relative text-center z-10 mx-auto">
        <span className="mb-4">
          <MyOrderCircle />
        </span>

        <span className="text-white text-base">
          Your {text} liquidity positions will appear here.
        </span>
        {isSignedIn ? null : (
          <div className="mt-5 w-72">
            <ConnectToNearBtnSwap />
          </div>
        )}
      </div>

      <MyOrderMask />
      <MyOrderMask2 />
    </div>
  );
}
