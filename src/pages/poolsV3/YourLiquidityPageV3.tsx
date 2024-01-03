import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  list_liquidities_old_version,
  get_pool,
  get_pool_old_version,
  get_liquidity,
  get_liquidity_old_version,
  PoolInfo,
  remove_liquidity,
} from '../../services/swapV3';
import {
  ColorsBox,
  AddButtonIcon,
  WarningTip,
  MobileWarningTip,
} from 'src/components/icon/V3';
import {
  GradientButton,
  BorderButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import {
  toPrecision,
  toReadableNumber,
  formatWithCommas,
} from 'src/utils/numbers';
import { TokenMetadata } from '../../services/ft-contract';
import { useTokens } from '../../state/token';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
  TOKEN_LIST_FOR_RATE,
  get_intersection_radio,
  get_intersection_icon_by_radio,
  get_all_seeds,
  get_matched_seeds_for_dcl_pool,
  mint_liquidity,
  get_total_value_by_liquidity_amount_dcl,
  pause_old_dcl_claim_tip,
  getEffectiveFarmList,
  sort_tokens_by_base,
  get_pool_name,
} from '../../services/commonV3';
import BigNumber from 'bignumber.js';
import { FarmBoost, getBoostTokenPrices, Seed } from '../../services/farm';
import { RemoveOldPoolV3 } from 'src/components/pool/RemoveOldPoolV3';
import { AddPoolV3 } from 'src/components/pool/AddPoolV3';
import { PoolTabV3 } from 'src/components/pool/PoolTabV3';
import {
  YourLiquidityAddLiquidityModal,
  YourLiquidityV1,
} from '../../components/pool/YourLiquidityV1';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';

import {
  MyOrderCircle,
  MyOrderMask,
  MyOrderMask2,
} from 'src/components/icon/swapV3';
import { PoolRPCView } from '../../services/api';
import { ALL_STABLE_POOL_IDS, REF_FI_CONTRACT_ID } from '../../services/near';
import { getPoolsByIds } from '../../services/indexer';
import { BlueCircleLoading } from '../../components/layout/Loading';
import QuestionMark from 'src/components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import Big from 'big.js';
import { ConnectToNearBtnSwap } from '../../components/button/Button';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { checkTransactionStatus } from '../../services/swap';
import { REF_POOL_NAV_TAB_KEY } from '../../components/pool/PoolTabV3';
import { NFTIdIcon } from 'src/components/icon/FarmBoost';
import { YourLiquidityV2 } from 'src/components/pool/YourLiquidityV2';
import { isMobile } from 'src/utils/device';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

export default function YourLiquidityPageV3() {
  const clearState = () => {
    sessionStorage.removeItem('REF_FI_LP_V2_OLD_VALUE');
    sessionStorage.removeItem('REF_FI_LP_VALUE_OLD_COUNT');
  };

  window.onbeforeunload = clearState;

  const historyYourLP = useHistory();

  useEffect(() => {
    clearState();
  }, [historyYourLP.location.pathname]);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const intl = useIntl();
  const [listLiquidities_old_version, setListLiquidities_old_version] =
    useState<UserLiquidityInfo[]>([]);
  const liquidityStatusList = [
    { id: 'all', label: 'all' },
    { id: 'DCL', name: 'DCL' },
    { id: 'Classic', label: 'classic' },
  ];
  const [addliquidityList, setAddliquidityList] = useState<any[]>([
    {
      label: 'dcl_liquidity',
      text: 'DCL Liquidity',
      url: '/addLiquidityV2',
    },
    {
      label: 'classic_liquidity',
      text: 'Classic Liquidity',
      url: '/pools',
    },
  ]);
  const [stablePools, setStablePools] = useState<PoolRPCView[]>();
  const [v2LiquidityLoadingDone, setV2LiquidityLoadingDone] = useState(false);
  const [v1LiquidityLoadingDone, setV1LiquidityLoadingDone] = useState(false);
  const [v2LiquidityQuantity, setV2LiquidityQuantity] = useState('0');
  const [v1LiquidityQuantity, setV1LiquidityQuantity] = useState('0');

  const [YourLpValueV2, setYourLpValueV2] = useState('0');
  const [YourLpValueV1, setYourLpValueV1] = useState('0');
  const [lpValueV1Done, setLpValueV1Done] = useState(false);
  const [lpValueV2Done, setLpValueV2Done] = useState(false);
  const [lpValueV2DoneOld, setLpValueV2DoneOld] = useState(false);
  const [YourLpValueV2Old, setYourLpValueV2Old] = useState('0');
  const [generalAddLiquidity, setGeneralAddLiquidity] =
    useState<boolean>(false);
  const [checkedStatus, setCheckedStatus] = useState('all');
  const [addLiqudityHover, setAddLiqudityHover] = useState(false);
  const [all_seeds, set_all_seeds] = useState<Seed[]>([]);
  const history = useHistory();
  const pool_link = sessionStorage.getItem(REF_POOL_NAV_TAB_KEY);

  if (pool_link === '/pools') {
    history.push(pool_link);
    return null;
  }

  if (!pool_link) {
    history.push('/pools');

    return null;
  }

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
      get_list_liquidities_old_version();
    }
  }, [isSignedIn]);
  async function get_list_liquidities_old_version() {
    const list: UserLiquidityInfo[] = await list_liquidities_old_version();
    if (list.length > 0) {
      list.sort((item1: UserLiquidityInfo, item2: UserLiquidityInfo) => {
        const item1_hashId = +item1.lpt_id.split('#')[1];
        const item2_hashId = +item2.lpt_id.split('#')[1];
        return item1_hashId - item2_hashId;
      });
      setListLiquidities_old_version(list);
    } else {
      setLpValueV2DoneOld(true);
      setYourLpValueV2Old('0');
    }
    return list.length;
  }
  function goAddLiquidityPage(url: string) {
    history.push(url);
  }
  function switchButton(type: string) {
    setCheckedStatus(type);
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
  const showV2EmptyBar =
    v2LiquidityLoadingDone &&
    +v2LiquidityQuantity == 0 &&
    v1LiquidityLoadingDone &&
    +v1LiquidityQuantity > 0;
  const showV1EmptyBar =
    v1LiquidityLoadingDone &&
    +v1LiquidityQuantity == 0 &&
    v2LiquidityLoadingDone &&
    +v2LiquidityQuantity > 0;
  const showCommonEmptyBar =
    v2LiquidityLoadingDone &&
    +v2LiquidityQuantity == 0 &&
    v1LiquidityLoadingDone &&
    +v1LiquidityQuantity == 0;
  return (
    <>
      <PoolTabV3
        yourLPpage
        lpValueV1Done={lpValueV1Done}
        YourLpValueV1={YourLpValueV1}
        YourLpValueV2={YourLpValueV2}
        lpValueV2Done={lpValueV2Done}
      ></PoolTabV3>
      {listLiquidities_old_version.length > 0 ? (
        <UserLegacyLiqudities
          listLiquidities_old_version={listLiquidities_old_version}
          setLpValueV2Done={setLpValueV2DoneOld}
          setYourLpValueV2={setYourLpValueV2Old}
        ></UserLegacyLiqudities>
      ) : null}
      <div className="flex items flex-col lg:w-1000px xs:w-11/12 md:w-11/12 m-auto">
        <div className="flex items-start justify-between lg:mt-4">
          <div className="flex items-center">
            <div className="flex items-center text-sm text-primaryText border border-selectBorder p-0.5 rounded-lg bg-v3LiquidityTabBgColor">
              {liquidityStatusList.map((item: any, index: number) => {
                const { id, name, label } = item;
                return (
                  <span
                    key={index}
                    onClick={() => {
                      switchButton(id);
                    }}
                    className={`flex items-center justify-center h-6 py-px px-3.5 box-content w-auto rounded-md cursor-pointer gotham_bold ${
                      checkedStatus == id
                        ? 'bg-primaryGradient text-white'
                        : 'text-primaryText'
                    }`}
                  >
                    {name || <FormattedMessage id={label}></FormattedMessage>}
                  </span>
                );
              })}
            </div>
          </div>
          <div
            className={`relative ${isSignedIn ? '' : 'hidden'}`}
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
              className={`top-9 pt-2 absolute z-50 xsm:right-0 ${
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
                        if (item.text === 'Classic Liquidity') {
                          setGeneralAddLiquidity(true);
                        } else {
                          goAddLiquidityPage(item.url);
                        }
                      }}
                      className={`whitespace-nowrap hover:bg-primaryText hover:bg-opacity-30 items-center flex justify-center px-5 py-0.5 h-10 hover:text-white rounded-lg text-primaryText text-center text-sm cursor-pointer my-auto`}
                    >
                      <FormattedMessage id={item.label} />
                    </span>
                  );
                })}
              </div>
            </span>
          </div>
        </div>
        {!isSignedIn || showCommonEmptyBar ? (
          <NoLiquidity
            text={intl.formatMessage({ id: 'will_appear_here_tip' })}
            className="mt-10"
          ></NoLiquidity>
        ) : (
          <>
            {/* your v2 liquidity */}
            <div className={`${checkedStatus == 'Classic' ? 'hidden' : ''}`}>
              {!v2LiquidityLoadingDone ? (
                <div className="mt-10">
                  <div className="text-white text-base gotham_bold mb-3">
                    DCL (0)
                  </div>
                  <div className="flex justify-center items-center">
                    <BlueCircleLoading></BlueCircleLoading>
                  </div>
                </div>
              ) : null}
              {+v2LiquidityQuantity > 0 || showV2EmptyBar ? (
                <div className="mt-10 mb-3">
                  <div className="flex items-center text-white text-base">
                    <span className="gotham_bold">
                      DCL ({+v2LiquidityQuantity})
                    </span>
                  </div>
                  <p className="text-sm text-farmText">
                    <FormattedMessage id="v2_your_pool_introduction"></FormattedMessage>
                  </p>
                </div>
              ) : null}
              {showV2EmptyBar ? (
                <NoLiquidity
                  text={intl.formatMessage({ id: 'dcl_will_appear_here_tip' })}
                ></NoLiquidity>
              ) : null}
              <YourLiquidityV2
                setYourLpValueV2={setYourLpValueV2}
                setLpValueV2Done={setLpValueV2Done}
                setLiquidityLoadingDone={setV2LiquidityLoadingDone}
                setLiquidityQuantity={setV2LiquidityQuantity}
                styleType="1"
                liquidityLoadingDone={v2LiquidityLoadingDone}
              ></YourLiquidityV2>
            </div>
            {/* your v1 liquidity */}
            <div className={`${checkedStatus == 'DCL' ? 'hidden' : ''}`}>
              {!v1LiquidityLoadingDone ? (
                <div className="mt-10">
                  <div className="text-white text-base gotham_bold mb-3">
                    <FormattedMessage id="classic" /> (0)
                  </div>
                  <div className="flex items-center justify-center">
                    <BlueCircleLoading />
                  </div>
                </div>
              ) : null}
              {+v1LiquidityQuantity > 0 || showV1EmptyBar ? (
                <div className="mt-10 mb-3">
                  <span className="text-white text-base gotham_bold">
                    <FormattedMessage id="classic" /> ({v1LiquidityQuantity})
                  </span>
                  <p className="text-sm text-farmText">
                    <FormattedMessage id="v1_your_pool_introduction"></FormattedMessage>
                  </p>
                </div>
              ) : null}
              {showV1EmptyBar ? (
                <NoLiquidity
                  text={intl.formatMessage({
                    id: 'classic_will_appear_here_tip',
                  })}
                ></NoLiquidity>
              ) : null}
              <YourLiquidityV1
                setLpValueV1Done={setLpValueV1Done}
                setYourLpValueV1={setYourLpValueV1}
                setLiquidityLoadingDone={setV1LiquidityLoadingDone}
                setLiquidityQuantity={setV1LiquidityQuantity}
                styleType="1"
                showV1EmptyBar={showV1EmptyBar}
              ></YourLiquidityV1>
            </div>
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

export function get_your_apr(
  liquidity: UserLiquidityInfo,
  seed: Seed,
  tokenPriceList: Record<string, any>
) {
  const { farmList, total_seed_amount, total_seed_power, seed_id } = seed;
  // principal
  const total_principal = get_liquidity_value(liquidity, seed, tokenPriceList);
  // seed total rewards
  let total_rewards = '0';
  const effectiveFarms = getEffectiveFarmList(farmList);
  effectiveFarms.forEach((farm: FarmBoost) => {
    const { token_meta_data } = farm;
    const { daily_reward, reward_token } = farm.terms;
    const quantity = toReadableNumber(token_meta_data.decimals, daily_reward);
    const reward_token_price = Number(tokenPriceList[reward_token]?.price || 0);
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

export function get_your_apr_raw(
  liquidity: UserLiquidityInfo,
  seed: Seed,
  tokenPriceList: Record<string, any>
) {
  const { farmList, total_seed_amount, total_seed_power, seed_id } = seed;
  // principal
  const total_principal = get_liquidity_value(liquidity, seed, tokenPriceList);
  // seed total rewards
  let total_rewards = '0';
  const effectiveFarms = getEffectiveFarmList(farmList);
  effectiveFarms.forEach((farm: FarmBoost) => {
    const { token_meta_data } = farm;
    const { daily_reward, reward_token } = farm.terms;
    const quantity = toReadableNumber(token_meta_data.decimals, daily_reward);
    const reward_token_price = Number(tokenPriceList[reward_token]?.price || 0);
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

    return your_apr.toFixed();
  } else {
    return '';
  }
}
function get_liquidity_value(
  liquidity: UserLiquidityInfo,
  seed: Seed,
  tokenPriceList: Record<string, any>
) {
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
export function get_detail_the_liquidity_refer_to_seed({
  liquidity,
  all_seeds,
  is_in_farming,
  related_farms,
  tokenPriceList,
}: {
  liquidity: UserLiquidityInfo;
  all_seeds: Seed[];
  is_in_farming: boolean;
  related_farms: FarmBoost[];
  tokenPriceList: Record<string, any>;
}) {
  const { mft_id, left_point, right_point, amount } = liquidity;
  let Icon;
  let your_apr;
  let your_apr_raw;

  let link;
  let inRange;
  let status;
  const active_seeds = get_matched_seeds_for_dcl_pool({
    seeds: all_seeds,
    pool_id: liquidity.pool_id,
  });

  const canFarmSeed = active_seeds.find((seed: Seed) => {
    const { min_deposit, seed_id } = seed;
    const [fixRange, dcl_pool_id, left_point_seed, right_point_seed] = seed_id
      .split('@')[1]
      .split('&');
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
    const condition3 =
      mft_id ||
      (!mft_id && new BigNumber(amount).isGreaterThanOrEqualTo(1000000));
    if (condition1 && condition2 && condition3) return true;
  });
  const targetSeed = canFarmSeed || active_seeds[0];
  if (targetSeed) {
    const { seed_id } = targetSeed;
    const [fixRange, dcl_pool_id, left_point_seed, right_point_seed] = seed_id
      .split('@')[1]
      .split('&');
    const radio = get_intersection_radio({
      left_point_liquidity: left_point,
      right_point_liquidity: right_point,
      left_point_seed,
      right_point_seed,
    });
    if (canFarmSeed) {
      your_apr = get_your_apr(liquidity, targetSeed, tokenPriceList);
      your_apr_raw = get_your_apr_raw(liquidity, targetSeed, tokenPriceList);
    }
    Icon = get_intersection_icon_by_radio(radio);
    inRange = +radio > 0;
    const link_params = `${get_pool_name(
      dcl_pool_id
    )}[${left_point_seed}-${right_point_seed}]`;
    link = `/v2farms/${link_params}-r`;
    status = 'run';
  }
  if (is_in_farming) {
    const actives = related_farms.filter((farm: FarmBoost) => {
      return farm.status != 'Ended';
    });
    if (related_farms.length > 0) {
      if (actives.length > 0) {
        status = 'run';
      } else {
        status = 'end';
      }
    }
  }
  return {
    Icon,
    your_apr,
    link,
    inRange,
    status,
    your_apr_raw,
    targetSeed,
  };
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

        <span className="text-white text-base">{text}</span>
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
function UserLegacyLiqudities(props: any) {
  const { listLiquidities_old_version, setLpValueV2Done, setYourLpValueV2 } =
    props;
  return (
    <div className="flex items flex-col lg:w-1000px xs:w-11/12 md:w-11/12 m-auto border border-legacyYellowColor p-4 xsm:px-2.5 rounded-2xl bg-legacyBgColor mt-16 xsm:mt-0 mb-9">
      <div className="flex xsm:flex-col items-center justify-center lg:mb-5 lg:px-5">
        <WarningTip className="mr-1.5 xsm:hidden"></WarningTip>
        <MobileWarningTip className="mb-1.5 lg:hidden"></MobileWarningTip>
        <span className="text-base text-legacyYellowColor gotham_bold xsm:text-center">
          <FormattedMessage
            id="new_contract_deploy_tip"
            defaultMessage={
              'A new contract has been deployed! Please remove your liquidity from the old contract'
            }
          />
        </span>
        <span className="text-sm text-v3LightGreyColor text-center lg:hidden my-1.5">
          *
          <FormattedMessage
            id="remove_will_automatically_claim"
            defaultMessage={
              'Removing will automatically claim your unclaimed fees.'
            }
          ></FormattedMessage>
        </span>
      </div>
      {listLiquidities_old_version.length > 0 ? (
        <div>
          {listLiquidities_old_version.map(
            (liquidity: UserLiquidityInfo, index: number) => {
              return (
                <div key={index + liquidity.lpt_id}>
                  <UserLiquidityLine_old
                    lpSize={listLiquidities_old_version.length}
                    setLpValueV2Done={setLpValueV2Done}
                    setYourLpValueV2={setYourLpValueV2}
                    liquidity={liquidity}
                    isLegacy={true}
                  ></UserLiquidityLine_old>
                </div>
              );
            }
          )}
        </div>
      ) : null}
    </div>
  );
}
function UserLiquidityLine_old({
  liquidity,
  setLpValueV2Done,
  lpSize,
  setYourLpValueV2,
  isLegacy,
}: {
  liquidity: UserLiquidityInfo;
  lpSize: number;
  setLpValueV2Done: (value: boolean) => void;
  setYourLpValueV2: (value: string) => void;
  isLegacy?: boolean;
}) {
  const [poolDetail, setPoolDetail] = useState<PoolInfo>();
  const [liquidityDetail, setLiquidityDetail] = useState<UserLiquidityInfo>();
  const [hover, setHover] = useState<boolean>(false);
  const [isInrange, setIsInrange] = useState<boolean>(true);
  const [your_liquidity, setYour_liquidity] = useState('');
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>();
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [showRemoveBox, setShowRemoveBox] = useState<boolean>(false);
  const [showAddBox, setShowAddBox] = useState<boolean>(false);

  const { lpt_id, pool_id, left_point, right_point, amount: L } = liquidity;
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
  }, []);
  useEffect(() => {
    if (tokenMetadata_x_y && poolDetail && tokenPriceList) {
      const { current_point } = poolDetail;
      get_your_liquidity(current_point);
    }
  }, [poolDetail, tokenMetadata_x_y, tokenPriceList]);
  async function get_pool_detail() {
    const get_pool_fun = isLegacy ? get_pool_old_version : get_pool;
    const detail = await get_pool_fun(pool_id, token_x);
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
    const get_liquidity_fun = isLegacy
      ? get_liquidity_old_version
      : get_liquidity;
    const l = await get_liquidity_fun(lpt_id);
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
      value = toPrecision(value, 6);
    }
    const valueBig = new BigNumber(value);
    if (valueBig.isGreaterThan('100000')) {
      return new BigNumber(value).toExponential(3);
    } else {
      return value;
    }
  }
  function getLpt_id() {
    return lpt_id.split('#')[1];
  }
  function get_your_liquidity(current_point: number) {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const priceX = tokenPriceList[tokenX.id]?.price || 0;
    const priceY = tokenPriceList[tokenY.id]?.price || 0;
    let total_price;
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      let tokenYAmount = getY(left_point, current_point, L, tokenY) || 0;
      let tokenXAmount = getX(current_point + 1, right_point, L, tokenX) || 0;
      const { amountx, amounty } = get_X_Y_In_CurrentPoint(tokenX, tokenY, L);
      tokenXAmount = new BigNumber(tokenXAmount).plus(amountx).toFixed();
      tokenYAmount = new BigNumber(tokenYAmount).plus(amounty).toFixed();
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      total_price = tokenYTotalPrice.plus(tokenXTotalPrice).toFixed();
    }
    // only y token
    if (current_point >= right_point) {
      const tokenYAmount = getY(left_point, right_point, L, tokenY);
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      total_price = tokenYTotalPrice.toFixed();
    }
    // only x token
    if (left_point > current_point) {
      const tokenXAmount = getX(left_point, right_point, L, tokenX);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      total_price = tokenXTotalPrice.toFixed();
    }
    setYour_liquidity(formatWithCommas(toPrecision(total_price, 2)));
    const storagedCount = sessionStorage.getItem('REF_FI_LP_VALUE_OLD_COUNT');
    const newSize = new BigNumber(storagedCount || '0').plus(1).toFixed();
    sessionStorage.setItem('REF_FI_LP_VALUE_OLD_COUNT', newSize);
    const storagedValue = sessionStorage.getItem('REF_FI_LP_V2_OLD_VALUE');
    sessionStorage.setItem(
      'REF_FI_LP_V2_OLD_VALUE',
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
    if (!canClaim() || isLegacy) return;
    setClaimLoading(true);
    const [tokenX, tokenY] = tokenMetadata_x_y;
    remove_liquidity({
      token_x: tokenX,
      token_y: tokenY,
      lpt_id,
      amount: '0',
      min_amount_x: '0',
      min_amount_y: '0',
      isLegacy: true,
      mft_id: '',
    });
  }
  function goYourLiquidityDetailPage() {
    const pool_id = lpt_id.split('#')[0];
    const lpt_index = lpt_id.split('#')[1];
    history.push(
      `/yoursLiquidityDetailV2/${get_pool_name(pool_id)}@${lpt_index}${
        isLegacy ? '/1' : ''
      }`
    );
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
  const tokens = sort_tokens_by_base(tokenMetadata_x_y);
  return (
    <div
      className="mt-3.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* for PC */}
      <div className="relative flex flex-col items-center xs:hidden md:hidden">
        <div className="absolute -top-1.5 flex items-center justify-center z-10">
          <NFTIdIcon></NFTIdIcon>
          <span className="absolute text-white text-xs gotham_bold">
            NFT ID #{getLpt_id()}
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
                    src={tokens[0]?.icon}
                    className="w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                  <img
                    src={tokens[1]?.icon}
                    className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                </div>
                <span className="text-white font-bold mx-2.5 text-sm gotham_bold">
                  {tokens[0]?.['symbol']}-{tokens[1]?.['symbol']}
                </span>
                <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
                  <span className="text-xs text-v3SwapGray whitespace-nowrap mr-1.5">
                    <FormattedMessage id="fee_Tiers" />
                  </span>
                  <span className="text-sm text-v3Blue">{+fee / 10000}%</span>
                </div>
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
            className={`items-center justify-between p-4 border-t border-v3BlueBorderColor bg-cardBg ${
              hover ? 'flex' : 'hidden'
            }`}
          >
            <div className="flex items-center justify-center">
              <span className="text-xs text-v3SwapGray">
                <FormattedMessage id="your_liquidity" />
              </span>
              <span className="text-sm text-white mx-2.5 gotham_bold">
                ${your_liquidity || '-'}
              </span>
              {isLegacy ? (
                <div
                  className="flex items-center justify-center bg-legacyButtonBgColor  rounded-lg text-sm text-primaryText h-8 cursor-not-allowed mr-2.5"
                  style={{ minWidth: '5rem' }}
                >
                  <FormattedMessage id="add" />
                </div>
              ) : (
                <GradientButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddBox(true);
                  }}
                  color="#fff"
                  minWidth="5rem"
                  borderRadius="8px"
                  className={`px-3 h-8 text-center text-sm text-white gotham_bold focus:outline-none mr-2.5`}
                >
                  <FormattedMessage id="add" />
                </GradientButton>
              )}
              <BorderButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRemoveBox(true);
                }}
                rounded="rounded-lg"
                px="px-0"
                py="py-1"
                style={{ minWidth: '5rem' }}
                className={`flex-grow  gotham_bold text-sm text-greenColor h-8`}
              >
                <FormattedMessage id="remove" />
              </BorderButton>
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
                className="text-white text-right"
                data-class="reactTip"
                data-tooltip-id={`pause_dcl_tip_claim_${liquidity.lpt_id}`}
                data-place="top"
                data-tooltip-html={isLegacy ? pause_old_dcl_claim_tip() : ''}
              >
                <div
                  className={`flex items-center justify-center  rounded-lg text-sm px-2 py-1 ml-5 gotham_bold ${
                    !canClaim() || isLegacy
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
                <CustomTooltip id={`pause_dcl_tip_claim_${liquidity.lpt_id}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* for Mobile */}
      <div className="lg:hidden">
        <div
          className={`relative cursor-pointer bg-cardBg rounded -xl overflow-hidden`}
          onClick={goYourLiquidityDetailPage}
        >
          <div className="flex flex-col items-center justify-between w-full bg-orderMobileTop px-3 pb-3">
            <div className="flex items-center justify-center">
              <ColorsBox svgId="paint0_linear_124_7158"></ColorsBox>
              <span className="absolute text-white text-xs gotham_bold">
                NFT ID #{getLpt_id()}
              </span>
            </div>
            <div className="flex items-center justify-between w-full mt-1.5">
              <div className="flex items-center">
                <div className="flex items-center flex-shrink-0">
                  <img
                    src={tokens[0]?.icon}
                    className="w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                  <img
                    src={tokens[1]?.icon}
                    className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                </div>
                <span className="text-white text-sm ml-1.5">
                  {tokens[0]?.['symbol']}-{tokens[1]?.['symbol']}
                </span>
              </div>
              <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
                <span
                  className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isInrange ? 'bg-gradientFromHover' : 'bg-v3GarkWarningColor'
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
                  {/* <div
                    className="text-white text-right"
                    data-class="reactTip"
                    data-tooltip-id={`mobile_pause_dcl_tip_claim_${liquidity.lpt_id}`}
                    data-place="top"
                    data-tooltip-html={isLegacy ? pause_old_dcl_claim_tip() : ''}
                  > */}
                  <div
                    className={`flex items-center justify-center  rounded-lg text-sm px-2 py-1 ${
                      !canClaim() || isLegacy
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
        <div className="bg-searchBgColor rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-v3SwapGray">
              <FormattedMessage id="your_liquidity" />
            </span>
            <span className="text-sm text-white">${your_liquidity || '-'}</span>
          </div>
          <div className="flex items-center justify-between mt-3.5">
            {isLegacy ? (
              <div className="flex w-1 flex-grow items-center justify-center bg-black bg-opacity-30 rounded-lg text-sm text-primaryText h-8 cursor-not-allowed mr-3">
                <FormattedMessage id="add" />
              </div>
            ) : (
              <GradientButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddBox(true);
                }}
                color="#fff"
                className={`w-1 flex-grow h-8 text-center text-sm text-white focus:outline-none mr-3`}
              >
                <FormattedMessage id="add" />
              </GradientButton>
            )}
            <BorderButton
              onClick={(e) => {
                e.stopPropagation();
                setShowRemoveBox(true);
              }}
              rounded="rounded-md"
              px="px-0"
              py="py-1"
              className={`w-1 flex-grow text-sm text-greenColor h-8`}
            >
              <FormattedMessage id="remove" />
            </BorderButton>
          </div>
        </div>
      </div>
      {/* todo */}
      {showRemoveBox ? (
        <RemoveOldPoolV3
          isOpen={showRemoveBox}
          onRequestClose={() => {
            setShowRemoveBox(false);
          }}
          tokenMetadata_x_y={tokenMetadata_x_y}
          poolDetail={poolDetail}
          tokenPriceList={tokenPriceList}
          userLiquidity={liquidityDetail}
          isLegacy={isLegacy}
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
        ></RemoveOldPoolV3>
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
