import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  createContext,
} from 'react';
import { Card } from 'src/components/card/Card';
import Alert from 'src/components/alert/Alert';
import Modal from 'react-modal';
import Big from 'big.js';

import {
  ConnectToNearBtn,
  SolidButton,
  OutlineButton,
} from 'src/components/button/Button';
import {
  AllStableTokenIds,
  NEARX_POOL_ID,
  wallet as webWallet,
} from 'src/services/near';
import { PoolRPCView } from 'src/services/api';
import {
  toRoundedReadableNumber,
  percent,
  toPrecision,
  toInternationalCurrencySystem,
  calculateFairShare,
  toReadableNumber,
  ONLY_ZEROS,
  calculateFeePercent,
  formatWithCommas,
} from 'src/utils/numbers';
import {
  RemoveLiquidityModal,
  AddLiquidityModal,
  REF_FI_PRE_LIQUIDITY_ID_KEY,
} from '../../pages/pools/DetailsPage';
import { getTokenPriceList, getYourPools } from 'src/services/indexer';
import { toRealSymbol } from 'src/utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { LP_TOKEN_DECIMALS } from 'src/services/m-token';

import { addLiquidityToPool, canFarm, Pool } from 'src/services/pool';
import {
  ftGetTokensMetadata,
  REF_META_DATA,
  TokenMetadata,
} from 'src/services/ft-contract';
import {
  multiply,
  divide,
  scientificNotationToString,
} from '../../utils/numbers';
import { isStablePool, ALL_STABLE_POOL_IDS } from '../../services/near';
import { STABLE_POOL_ID, REF_FI_CONTRACT_ID } from '../../services/near';
import { isNotStablePool, canFarmV2 } from '../../services/pool';
import { WalletContext } from '../../utils/wallets-integration';
import {
  getFarmsCount,
  getEndedFarmsCount,
  getRealEndedFarmsCount,
} from '../../services/pool';
import { useFarmStake, useAllFarms } from '../../state/farm';
import { getStablePoolDecimal } from 'src/pages/stable/StableSwapEntry';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { getVEPoolId } from '../../pages/ReferendumPage';
import { useAccountInfo } from 'src/state/referendum';
import { VEARROW, RewardCheck } from '../../components/icon/Referendum';
import { toNonDivisibleNumber } from '../../utils/numbers';
import { LOVE_TOKEN_DECIMAL } from '../../state/referendum';
import getConfig from '../../services/config';
import { useStakeListByAccountId, useBatchTotalShares } from '../../state/pool';
import { getPoolsByIds, getPoolsByTokensIndexer } from '../../services/indexer';
import { parsePool } from '../../services/pool';
import { useClientMobile, isClientMobie, isMobile } from '../../utils/device';
import {
  GradientButton,
  ButtonTextWrapper,
} from '../../components/button/Button';
import ReactModal from 'react-modal';
import { ModalClose } from '../../components/icon/ModalClose';
import { unwrapedNear, WRAP_NEAR_CONTRACT_ID } from 'src/services/wrap-near';
import { BoostInputAmount } from '../../components/forms/InputAmount';
import SelectToken from '../../components/forms/SelectToken';
import {
  useRainbowWhitelistTokens,
  useTokenBalances,
  useWhitelistTokens,
} from '../../state/token';
import { ArrowDownCur, ArrowDownWhite } from '../../components/icon/Arrows';
import {
  getDepositableBalance,
  useWalletTokenBalances,
  useDepositableBalance,
} from '../../state/token';
import { WarnTriangle } from 'src/components/icon';
import { StableSwapLogo } from 'src/components/icon/StableSwap';
import { GoodIcon } from '../../components/icon/Common';
import { AddPoolModal } from '../../pages/pools/AddPoolPage';
import { getStableSwapTabKey } from 'src/pages/stable/StableSwapPageUSN';
import { LinkIcon } from '../../components/icon/Portfolio';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { checkFarmStake } from '../../state/farm';
import {
  display_number_withCommas,
  UpDownButton,
  display_value,
} from '../portfolio/Tool';
import { PortfolioData } from 'src/pages/Portfolio';
import { openUrl } from '../../services/commonV3';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import BLACKTip from '../../components/pool/BLACKTip';
import { FeeTipV1 } from '../../components/pool/FeeTip';
import { useLpLocker } from '../../state/lpLocker';
const is_mobile = isMobile();
const { BLACK_TOKEN_LIST } = getConfig();
export const StakeListContext = createContext(null);
export function YourLiquidityV1(props: any) {
  const {
    setYourLpValueV1,
    setLpValueV1Done,
    setLiquidityLoadingDone,
    setLiquidityQuantity,
    styleType,
    showV1EmptyBar,
  } = props;
  const [error, setError] = useState<Error>();
  const [pools, setPools] = useState<PoolRPCView[]>();
  const { v1Farm, v2Farm } = useAllFarms();
  const [generalAddLiquidity, setGeneralAddLiquidity] =
    useState<boolean>(false);
  const { globalState } = useContext(WalletContext);
  const history = useHistory();
  const [stablePools, setStablePools] = useState<PoolRPCView[]>();
  const [tvls, setTvls] = useState<Record<string, number>>();
  const [tokensMeta, setTokensMeta] = useState<{}>();
  const isClientMobile = useClientMobile();
  const [count, setCount] = useState(0);
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();
  const isSignedIn = !!accountId;
  useEffect(() => {
    // get all stable pools;
    const ids = ALL_STABLE_POOL_IDS;
    getPoolsByIds({ pool_ids: ids }).then((res) => {
      setStablePools(res.filter((p) => p.id.toString() !== NEARX_POOL_ID));
    });
  }, []);
  useEffect(() => {
    if (!isSignedIn) return;
    // get all simple pools;
    getYourPools().then((res) => {
      setPools(res.filter((p) => !isStablePool(p.id.toString())));
    });
  }, [isSignedIn]);
  useEffect(() => {
    if (!pools) return;
    // get all tokens meta data both from simple pools and stable pools
    ftGetTokensMetadata(
      (pools.map((p) => p.token_account_ids).flat() || []).concat(
        AllStableTokenIds
      )
    ).then(setTokensMeta);
    // get all tvls of simple pools;(stable pools has tvl field， but simple pools doesn't,so need request again)
    getPoolsByIds({ pool_ids: pools.map((p) => p.id.toString()) }).then(
      (res) => {
        setTvls(
          res
            .map((p) => p.tvl)
            ?.reduce((pre, cur, i) => {
              return {
                ...pre,
                [res[i].id]: cur,
              };
            }, {})
        );
      }
    );
  }, [pools]);
  // get ve pool
  const vePool = pools?.find((p) => Number(p.id) === Number(getVEPoolId()));
  // get stake list in v1 farm and v2 farm
  const { finalStakeList, stakeList, v2StakeList, stakeListDone } =
    useStakeListByAccountId();
  // get lp amount locked in ve contract;
  const { lptAmount, accountInfoDone } = !!getConfig().REF_VE_CONTRACT_ID
    ? useAccountInfo()
    : { lptAmount: '0', accountInfoDone: true };
  // get the rest lp amount in pool and all lp amount  (in v1 farm, v2 farm, pool)
  const {
    batchTotalShares,
    shares: batchStableShares,
    sharesDone: stableSharesDone,
  } = useBatchTotalShares(
    stablePools?.map((p) => p.id),
    finalStakeList,
    stakeListDone
  );
  const {
    batchTotalShares: batchTotalSharesSimplePools,
    shares: batchShares,
    sharesDone: simpleSharesDone,
  } = useBatchTotalShares(
    pools?.map((p) => p.id),
    finalStakeList,
    stakeListDone
  );
  const data_fetch_status =
    !stablePools ||
    !pools ||
    !tokensMeta ||
    !v1Farm ||
    !v2Farm ||
    !stableSharesDone ||
    !simpleSharesDone ||
    !accountInfoDone;
  useEffect(() => {
    if (!data_fetch_status) {
      // get the number of pools which lp amount is greater than zero;
      const count =
        batchTotalSharesSimplePools
          .map((n, i) =>
            n + Number(pools?.[i].id) === Number(getVEPoolId())
              ? Number(lptAmount) + n
              : n
          )
          ?.reduce((acc, cur) => {
            return cur > 0 ? acc + 1 : acc;
          }, 0) +
        batchTotalShares?.reduce((acc, cur) => (cur > 0 ? acc + 1 : acc), 0);
      setLiquidityLoadingDone(true);
      setLiquidityQuantity(count);
      setCount(count);
      if (+count > 0 && tvls) {
        const allPools = pools.concat(stablePools);
        let total_value_final = '0';
        allPools.forEach((pool: PoolRPCView) => {
          // get total amount
          const { id, shares_total_supply, tvl } = pool;
          const is_stable_pool = isStablePool(id);
          const decimals = is_stable_pool
            ? getStablePoolDecimal(id)
            : LP_TOKEN_DECIMALS;
          let total_amount = 0;
          if (is_stable_pool) {
            const i = stablePools.findIndex(
              (p: PoolRPCView) => p.id === pool.id
            );
            total_amount = batchTotalShares?.[i];
          } else {
            const i = pools.findIndex((p: PoolRPCView) => p.id === pool.id);
            total_amount = batchTotalSharesSimplePools?.[i];
          }
          let lp_in_vote = '0';
          if (+id == +getVEPoolId()) {
            lp_in_vote = new BigNumber(lptAmount || 0).shiftedBy(-24).toFixed();
          }
          const read_total_amount = new BigNumber(total_amount)
            .shiftedBy(-decimals)
            .plus(lp_in_vote);
          // get single lp value
          const pool_tvl = tvls[id] || tvl || '0';
          if (+shares_total_supply > 0 && +pool_tvl > 0) {
            const read_total_supply = new BigNumber(
              shares_total_supply
            ).shiftedBy(-decimals);
            const single_lp_value = new BigNumber(pool_tvl).dividedBy(
              read_total_supply
            );
            const value = single_lp_value.multipliedBy(read_total_amount);
            total_value_final = value.plus(total_value_final).toFixed();
          }
        });
        setLpValueV1Done(true);
        setYourLpValueV1(total_value_final);
      } else if (+count == 0) {
        setLpValueV1Done(true);
        setYourLpValueV1('0');
      }
    }
  }, [data_fetch_status, tvls]);
  if (data_fetch_status) return null;
  return (
    <>
      <StakeListContext.Provider
        value={{
          stakeList,
          v2StakeList,
          finalStakeList,
          error,
          vePool,
          batchTotalSharesSimplePools,
          batchTotalShares,
          isClientMobile,
          v1Farm,
          v2Farm,
          tvls,
          tokensMeta,
          lptAmount,
          batchShares,
          pools,
          stablePools,
          batchStableShares,
          generalAddLiquidity,
          setGeneralAddLiquidity,
          showV1EmptyBar,
        }}
      >
        {styleType == '1' ? (
          <LiquidityContainerStyle1></LiquidityContainerStyle1>
        ) : (
          <LiquidityContainerStyle2></LiquidityContainerStyle2>
        )}
      </StakeListContext.Provider>
    </>
  );
}

function LiquidityContainerStyle1() {
  const {
    vePool,
    batchTotalSharesSimplePools,
    batchTotalShares,
    isClientMobile,
    v1Farm,
    v2Farm,
    tvls,
    tokensMeta,
    lptAmount,
    batchShares,
    pools,
    stablePools,
    batchStableShares,
    generalAddLiquidity,
    setGeneralAddLiquidity,
    showV1EmptyBar,
  } = useContext(StakeListContext);
  const RowRender = ({
    p,
    ids,
    shares,
  }: {
    p: PoolRPCView;
    ids: string[];
    shares: string;
  }) => {
    const supportFarmV1 = getFarmsCount(p.id.toString(), v1Farm);

    const supportFarmV2 = getFarmsCount(p.id.toString(), v2Farm);

    const endedFarmV1 = getEndedFarmsCount(p.id.toString(), v1Farm);

    const endedFarmV2 = getEndedFarmsCount(p.id.toString(), v2Farm);
    return (
      <div
        className="hover:bg-poolRowHover w-full hover:bg-opacity-20"
        key={Number(p.id)}
      >
        <PoolRow
          tvl={tvls?.[p.id.toString()]}
          pool={p}
          tokens={ids.map((id) => tokensMeta[id]) || []}
          supportFarmV1={supportFarmV1}
          supportFarmV2={supportFarmV2}
          onlyEndedFarmV2={endedFarmV2 === supportFarmV2}
          endedFarmV2={endedFarmV2}
          endedFarmV1={endedFarmV1}
          lptAmount={lptAmount}
          shares={shares}
        />
      </div>
    );
  };
  const RowRenderMobile = ({
    p,
    ids,
    shares,
  }: {
    p: PoolRPCView;
    ids: string[];
    shares: string;
  }) => {
    const supportFarmV1 = getFarmsCount(p.id.toString(), v1Farm);

    const supportFarmV2 = getFarmsCount(p.id.toString(), v2Farm);
    const endedFarmV1 = getEndedFarmsCount(p.id.toString(), v1Farm);

    const endedFarmV2 = getEndedFarmsCount(p.id.toString(), v2Farm);
    return (
      <PoolRow
        pool={p}
        tvl={tvls?.[p.id.toString()]}
        tokens={ids.map((id) => tokensMeta[id]) || []}
        supportFarmV1={supportFarmV1}
        supportFarmV2={supportFarmV2}
        onlyEndedFarmV2={endedFarmV2 === supportFarmV2}
        lptAmount={lptAmount}
        endedFarmV2={endedFarmV2}
        endedFarmV1={endedFarmV1}
        shares={shares}
      />
    );
  };
  return (
    <div>
      <div className={`flex items flex-col ${showV1EmptyBar ? 'hidden' : ''}`}>
        <Card
          width="w-full"
          padding="px-0 py-6"
          className="xs:hidden md:hidden"
        >
          {(!(!vePool || !getConfig().REF_VE_CONTRACT_ID) ||
            batchTotalSharesSimplePools?.some((s: number) => s > 0) ||
            batchTotalShares?.some((s: number) => s > 0)) &&
          !isClientMobile ? (
            <section>
              <div className="">
                <div
                  style={{
                    gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
                  }}
                  className="grid grid-cols-12 md:flex xs:flex md:items-center xs:items-center xs:justify-between md:justify-between py-2 content-center items-center text-xs text-primaryText pr-6 pl-6 lg:px-8
          xs:border-b xs:border-gray-700 xs:border-opacity-70 md:border-b md:border-gray-700 md:border-opacity-70"
                >
                  <div className="col-span-2">
                    <FormattedMessage id="pair" defaultMessage="Pair" />
                  </div>
                  <div className="col-span-2 ">
                    <FormattedMessage id="token" defaultMessage="Token" />
                  </div>

                  <div className="flex flex-row col-span-5 text-left ml-8">
                    <span>
                      <FormattedMessage id="lp_token"></FormattedMessage>
                    </span>
                    <span>
                      (
                      <FormattedMessage
                        id="my_shares"
                        defaultMessage="Shares"
                      />
                      )
                    </span>
                  </div>
                  <div className="col-span-4 xl:ml-8 ml-4">
                    <FormattedMessage
                      id="usd_value"
                      defaultMessage="USD Value"
                    />
                  </div>
                </div>
                <div className=" overflow-y-auto">
                  {/* display ve pool */}
                  {!vePool || !getConfig().REF_VE_CONTRACT_ID
                    ? null
                    : [vePool].map((p) => {
                        return (
                          <RowRender
                            key={p.id}
                            p={p}
                            ids={p.token_account_ids}
                            shares={
                              batchShares?.[
                                pools.findIndex(
                                  (p2: PoolRPCView) => p2.id === vePool.id
                                )
                              ] || ''
                            }
                          />
                        );
                      })}
                  {/* display stable pools */}
                  {batchTotalShares &&
                    batchTotalShares?.some((s: number) => s > 0) &&
                    stablePools?.map((p: PoolRPCView, i: number) => {
                      return (
                        <RowRender
                          key={p.id}
                          p={p}
                          ids={p.token_account_ids}
                          shares={batchStableShares?.[i] || ''}
                        />
                      );
                    })}
                  {/* display simple pools */}
                  {pools
                    .filter(
                      (p: PoolRPCView) =>
                        !getConfig().REF_VE_CONTRACT_ID ||
                        !vePool ||
                        p.id !== vePool.id
                    )
                    .map((p: PoolRPCView, i: number) => {
                      return (
                        <RowRender
                          key={p.id}
                          shares={
                            batchShares?.[
                              pools.findIndex(
                                (p2: PoolRPCView) => p2.id === p.id
                              )
                            ] || ''
                          }
                          p={p}
                          ids={p.token_account_ids}
                        />
                      );
                    })}
                </div>
              </div>
            </section>
          ) : null}
        </Card>
        {/* Mobile */}

        {(batchTotalSharesSimplePools?.some((s: number) => s > 0) ||
          batchTotalShares?.some((s: number) => s > 0)) &&
        isClientMobile ? (
          <div className="lg:hidden">
            {!vePool || !getConfig().REF_VE_CONTRACT_ID
              ? null
              : [vePool].map((p) => {
                  return (
                    <RowRenderMobile
                      key={p.id}
                      shares={
                        batchShares?.[
                          pools.findIndex(
                            (p2: PoolRPCView) => p2.id === vePool.id
                          )
                        ] || ''
                      }
                      p={p}
                      ids={p.token_account_ids}
                    />
                  );
                })}

            {batchTotalShares &&
              batchTotalShares?.some((s: number) => s > 0) &&
              stablePools?.map((p: PoolRPCView, i: number) => {
                return (
                  <RowRenderMobile
                    key={p.id}
                    shares={batchStableShares?.[i] || ''}
                    p={p}
                    ids={p.token_account_ids}
                  />
                );
              })}

            {pools
              .filter(
                (p: PoolRPCView) =>
                  !getConfig().REF_VE_CONTRACT_ID ||
                  !vePool ||
                  p.id !== vePool.id
              )
              .map((p: PoolRPCView, i: number) => {
                return (
                  <RowRenderMobile
                    key={p.id}
                    shares={
                      batchShares?.[
                        pools.findIndex((p2: PoolRPCView) => p2.id === p.id)
                      ] || ''
                    }
                    p={p}
                    ids={p.token_account_ids}
                  />
                );
              })}
          </div>
        ) : null}
      </div>
      <YourLiquidityAddLiquidityModal
        isOpen={generalAddLiquidity}
        onRequestClose={() => {
          setGeneralAddLiquidity(false);
        }}
        stablePools={stablePools}
      />
    </div>
  );
}

function LiquidityContainerStyle2() {
  const {
    vePool,
    pools,
    stablePools,
    batchTotalShares,
    batchTotalSharesSimplePools,
  } = useContext(StakeListContext);
  const simplePoolsFinal = useMemo(() => {
    const activeSimplePools: PoolRPCView[] = pools.filter(
      (p: PoolRPCView, i: number) => {
        if (!vePool || !getConfig().REF_VE_CONTRACT_ID) {
          return batchTotalSharesSimplePools[i] !== 0;
        } else {
          return batchTotalSharesSimplePools[i] !== 0 && p.id !== vePool?.id;
        }
      }
    );
    return activeSimplePools;
  }, [pools, batchTotalSharesSimplePools]);
  const stablePoolsFinal: PoolRPCView[] = useMemo(() => {
    const activeStablePools = stablePools.filter(
      (p: PoolRPCView, i: number) => {
        return batchTotalShares[i] !== 0;
      }
    );
    return activeStablePools;
  }, [batchTotalShares]);
  return (
    <div>
      {!vePool || !getConfig().REF_VE_CONTRACT_ID ? null : (
        <YourClassicLiquidityLine pool={vePool}></YourClassicLiquidityLine>
      )}
      {stablePoolsFinal.map((pool: PoolRPCView) => {
        return (
          <YourClassicLiquidityLine
            pool={pool}
            key={pool.id}
          ></YourClassicLiquidityLine>
        );
      })}
      {simplePoolsFinal.map((pool: PoolRPCView) => {
        return (
          <YourClassicLiquidityLine
            pool={pool}
            key={pool.id}
          ></YourClassicLiquidityLine>
        );
      })}
    </div>
  );
}
const LiquidityContextData = createContext(null);
function YourClassicLiquidityLine(props: any) {
  const {
    vePool,
    v1Farm,
    v2Farm,
    tvls,
    tokensMeta,
    lptAmount,
    pools,
    stablePools,
    batchTotalShares,
    batchStableShares,
    batchTotalSharesSimplePools,
    batchShares,
    finalStakeList,
  } = useContext(StakeListContext);
  const { set_your_classic_lp_all_in_farms } = useContext(PortfolioData);
  const { pool } = props;
  const { token_account_ids, id: poolId } = pool;
  const tokens = token_account_ids.map((id: number) => tokensMeta[id]) || [];
  const [switch_off, set_switch_off] = useState<boolean>(true);

  const decimals = isStablePool(poolId)
    ? getStablePoolDecimal(poolId)
    : LP_TOKEN_DECIMALS;
  const Images = tokens.map((token: TokenMetadata, index: number) => {
    const { icon, id } = token;
    if (icon)
      return (
        <img
          key={id}
          className={`inline-block h-7 w-7 xsm:w-6 xsm:h-6 rounded-full border border-gradientFromHover ${
            index == 0 ? '' : '-ml-1'
          }`}
          src={icon}
        />
      );
    return (
      <div
        key={id}
        className={
          'inline-block h-7 w-7 xsm:w-6 xsm:h-6 rounded-full bg-cardBg border border-gradientFromHover -ml-1'
        }
      ></div>
    );
  });
  const Symbols = tokens.map((token: TokenMetadata, index: number) => {
    const { symbol } = token;
    if (index == tokens.length - 1) {
      return <label key={symbol}>{symbol}</label>;
    } else {
      return <label key={symbol}>{symbol}/</label>;
    }
  });
  // get lp amount in farm
  const lp_in_farm = useMemo(() => {
    let inFarmAmount = '0';
    Object.keys(finalStakeList).find((seed_id: string) => {
      const pool_id = seed_id.split('@')[1];
      if (+poolId == +pool_id) {
        const amount = finalStakeList[seed_id];
        inFarmAmount = new BigNumber(amount).shiftedBy(-decimals).toFixed();
        return true;
      }
    });
    return inFarmAmount;
  }, [finalStakeList]);
  // get lp amount in vote
  const lp_in_vote = useMemo(() => {
    let lpInVote = '0';
    if (+pool.id == vePool?.id) {
      lpInVote = lptAmount;
    }
    return new BigNumber(lpInVote).shiftedBy(-24).toFixed();
  }, [lptAmount]);
  // get lp amount in pool && total lp (pool + farm) && user lp percent
  const [lp_in_pool, lp_total, user_lp_percent] = useMemo(() => {
    const { id, shares_total_supply } = pool;
    const is_stable_pool = isStablePool(id);
    let amount_in_pool = '0';
    let total_amount = '0';
    if (is_stable_pool) {
      const i = stablePools.findIndex((p: PoolRPCView) => p.id === pool.id);
      amount_in_pool = batchStableShares?.[i];
      total_amount = batchTotalShares?.[i];
    } else {
      const i = pools.findIndex((p: PoolRPCView) => p.id === pool.id);
      amount_in_pool = batchShares?.[i];
      total_amount = batchTotalSharesSimplePools?.[i];
    }
    const read_amount_in_pool = new BigNumber(amount_in_pool)
      .shiftedBy(-decimals)
      .toFixed();
    const read_total_amount = new BigNumber(total_amount)
      .shiftedBy(-decimals)
      .plus(lp_in_vote);
    const read_shareSupply = new BigNumber(
      shares_total_supply || '0'
    ).shiftedBy(-decimals);
    let percent = '0';
    if (
      read_shareSupply.isGreaterThan(0) &&
      read_total_amount.isGreaterThan(0)
    ) {
      percent = read_total_amount.dividedBy(read_shareSupply).toFixed();
    }
    return [read_amount_in_pool, read_total_amount.toFixed(), percent];
  }, [
    batchShares,
    batchStableShares,
    batchTotalSharesSimplePools,
    batchTotalShares,
    lp_in_vote,
  ]);
  // get total lp value
  const lp_total_value = useMemo(() => {
    const { id, tvl, shares_total_supply } = pool;
    const pool_tvl = tvls?.[id] || tvl || 0;
    if (+shares_total_supply > 0) {
      const read_total_supply = new BigNumber(shares_total_supply).shiftedBy(
        -decimals
      );
      const single_lp_value = new BigNumber(pool_tvl).dividedBy(
        read_total_supply
      );
      return new BigNumber(single_lp_value || 0)
        .multipliedBy(lp_total || 0)
        .toFixed();
    }
    return '0';
  }, [lp_total, tvls]);
  // get seed status
  const seed_status = useMemo(() => {
    const allFarmV2_count = getFarmsCount(poolId.toString(), v2Farm);
    const endedFarmV2_count = getRealEndedFarmsCount(poolId.toString(), v2Farm);
    if (allFarmV2_count == endedFarmV2_count) return 'e';
    return 'r';
  }, [v2Farm]);
  function display_percent(percent: string) {
    const p = new BigNumber(percent).multipliedBy(100);
    if (p.isEqualTo(0)) {
      return '0%';
    } else if (p.isLessThan(0.01)) {
      return '<0.01%';
    } else {
      return toPrecision(p.toFixed(), 2) + '%';
    }
  }
  useEffect(() => {
    if (
      new BigNumber(lp_in_pool).isGreaterThan(0) ||
      new BigNumber(lp_in_vote).isGreaterThan(0)
    ) {
      set_your_classic_lp_all_in_farms(false);
    }
  }, [lp_in_pool, lp_in_vote]);
  return (
    <LiquidityContextData.Provider
      value={{
        switch_off,
        Images,
        Symbols,
        pool,
        lp_total_value,
        set_switch_off,
        lp_total,
        display_percent,
        user_lp_percent,
        lp_in_vote,
        lp_in_pool,
        lp_in_farm,
        seed_status,
      }}
    >
      {is_mobile ? (
        <YourClassicLiquidityLineMobile></YourClassicLiquidityLineMobile>
      ) : (
        <YourClassicLiquidityLinePc></YourClassicLiquidityLinePc>
      )}
    </LiquidityContextData.Provider>
  );
}
function YourClassicLiquidityLineMobile() {
  const {
    switch_off,
    Images,
    Symbols,
    pool,
    lp_total_value,
    set_switch_off,
    lp_total,
    display_percent,
    user_lp_percent,
    lp_in_vote,
    lp_in_pool,
    lp_in_farm,
    seed_status,
  } = useContext(LiquidityContextData);
  return (
    <div
      className={`rounded-xl mt-3 mx-4 ${
        switch_off
          ? 'bg-portfolioBgColor'
          : 'border border-border_light_grey_color bg-portfolioBarBgColor'
      }`}
    >
      <div className="flex flex-col justify-between h-20 p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center mr-1.5">{Images}</div>
            <span className="flex flex-wrap text-sm text-white gotham_bold">
              {Symbols}
            </span>
          </div>
          <span className="text-sm text-white gotham_bold">
            {display_value(lp_total_value)}
          </span>
        </div>

        <div className={`flex justify-between`}>
          <span
            onClick={() => {
              openUrl(`/pool/${pool.id}`);
            }}
            className="flex items-center justify-center text-xs text-v3SwapGray bg-selectTokenV3BgColor rounded-md cursor-pointer whitespace-nowrap py-0.5 px-1.5"
          >
            <FormattedMessage id="classic" />{' '}
            <LinkIcon className="ml-1 flex-shrink-0"></LinkIcon>
          </span>
          <UpDownButton
            set_switch_off={() => {
              set_switch_off(!switch_off);
            }}
            switch_off={switch_off}
          ></UpDownButton>
        </div>
      </div>
      <div
        className={`px-2.5 py-4 border-t border-limitOrderFeeTiersBorderColor ${
          switch_off ? 'hidden' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-v3SwapGray">
            <FormattedMessage id="your_liquidity" />
          </span>
          <span className="text-sm text-white">
            {display_value(lp_total_value)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-v3SwapGray">
            <FormattedMessage id="your_lp_tokens_and_shares" />
          </span>
          <span className="text-sm text-white">
            {display_number_withCommas(lp_total)} (
            {display_percent(user_lp_percent)})
          </span>
        </div>
        <div className="flex items-start justify-between">
          <span className="text-sm text-v3SwapGray">
            <FormattedMessage id="usage" />
          </span>
          <div className="flex flex-col items-end text-sm text-white">
            <div
              className={`flex items-center ${
                +lp_in_farm > 0 ? '' : 'hidden'
              } ${+lp_in_vote > 0 || +lp_in_pool > 0 ? 'mb-4' : ''}`}
            >
              {display_number_withCommas(lp_in_farm)}{' '}
              <FormattedMessage id="in" />{' '}
              <span
                className="flex items-center"
                onClick={() => {
                  openUrl(`/v2farms/${pool.id}-${seed_status}`);
                }}
              >
                <label className="underline cursor-pointer mx-1">
                  <FormattedMessage id="farm" />
                </label>{' '}
                <LinkIcon className="cursor-pointer text-primaryText hover:text-white"></LinkIcon>
              </span>
            </div>
            <div
              className={`flex items-center  ${
                +lp_in_vote > 0 ? '' : 'hidden'
              } ${+lp_in_pool > 0 ? 'mb-4' : ''}`}
            >
              {display_number_withCommas(lp_in_vote)}{' '}
              <FormattedMessage id="locked_in"></FormattedMessage>{' '}
              <span
                className="flex items-center"
                onClick={() => {
                  openUrl('/referendum');
                }}
              >
                <label className="underline cursor-pointer mx-1">
                  <FormattedMessage id="vote_capital" />
                </label>{' '}
                <LinkIcon className="cursor-pointer text-primaryText hover:text-white"></LinkIcon>
              </span>
            </div>
            <div
              className={`flex items-center ${+lp_in_pool > 0 ? '' : 'hidden'}`}
            >
              {display_number_withCommas(lp_in_pool)}{' '}
              <FormattedMessage id="holding" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function YourClassicLiquidityLinePc() {
  const {
    switch_off,
    Images,
    Symbols,
    pool,
    lp_total_value,
    set_switch_off,
    lp_total,
    display_percent,
    user_lp_percent,
    lp_in_vote,
    lp_in_pool,
    lp_in_farm,
    seed_status,
  } = useContext(LiquidityContextData);
  return (
    <div
      className={`rounded-xl mt-3 bg-portfolioBgColor px-5 ${
        switch_off ? '' : 'pb-4'
      }`}
    >
      <div className="flex items-center justify-between h-14">
        <div className="flex items-center">
          <div className="flex items-center">{Images}</div>
          <span className="text-sm text-white gotham_bold mx-2.5">
            {Symbols}
          </span>
          <span className="text-sm text-v3SwapGray px-1.5 rounded-md bg-selectTokenV3BgColor mr-1.5">
            <FormattedMessage id="classic" />
          </span>
          <span
            className="flex items-center justify-center h-5 w-5 rounded-md bg-selectTokenV3BgColor cursor-pointer text-primaryText hover:text-white"
            onClick={() => {
              openUrl(`/pool/${pool.id}`);
            }}
          >
            <LinkIcon></LinkIcon>
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-white gotham_bold mr-5">
            {display_value(lp_total_value)}
          </span>
          <UpDownButton
            set_switch_off={() => {
              set_switch_off(!switch_off);
            }}
            switch_off={switch_off}
          ></UpDownButton>
        </div>
      </div>
      <div className={`${switch_off ? 'hidden' : ''}`}>
        <div className="bg-primaryText rounded-xl px-3.5 py-5 bg-opacity-10 mt-3">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-v3SwapGray">
              <FormattedMessage id="your_liquidity_usd_value" />
            </span>
            <span className="text-sm text-white">
              {display_value(lp_total_value)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-v3SwapGray">
              <FormattedMessage id="your_lp_tokens_and_shares" />
            </span>
            <span className="text-sm text-white">
              {display_number_withCommas(lp_total)} (
              {display_percent(user_lp_percent)})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-v3SwapGray">
              <FormattedMessage id="usage" />
            </span>
            <div className="flex items-center text-sm text-white">
              <div
                className={`flex items-center pl-3.5 ${
                  +lp_in_vote > 0 || +lp_in_pool > 0
                    ? 'border-r border-orderTypeBg pr-3.5'
                    : ''
                } ${+lp_in_farm > 0 ? '' : 'hidden'}`}
              >
                {display_number_withCommas(lp_in_farm)}{' '}
                <FormattedMessage id="in" />{' '}
                <span
                  className="flex items-center"
                  onClick={() => {
                    openUrl(`/v2farms/${pool.id}-${seed_status}`);
                  }}
                >
                  <label className="underline cursor-pointer mx-1">
                    <FormattedMessage id="farm" />
                  </label>{' '}
                  <LinkIcon className="cursor-pointer text-primaryText hover:text-white"></LinkIcon>
                </span>
              </div>
              <div
                className={`flex items-center pl-3.5 ${
                  +lp_in_pool > 0 ? 'pr-3.5 border-r border-orderTypeBg' : ''
                } ${+lp_in_vote > 0 ? '' : 'hidden'}`}
              >
                {display_number_withCommas(lp_in_vote)}{' '}
                <FormattedMessage id="locked_in"></FormattedMessage>{' '}
                <span
                  className="flex items-center"
                  onClick={() => {
                    openUrl('/referendum');
                  }}
                >
                  <label className="underline cursor-pointer mx-1">
                    <FormattedMessage id="vote_capital" />
                  </label>{' '}
                  <LinkIcon className="cursor-pointer text-primaryText hover:text-white"></LinkIcon>
                </span>
              </div>
              <div
                className={`flex items-center pl-3.5 ${
                  +lp_in_pool > 0 ? '' : 'hidden'
                }`}
              >
                {display_number_withCommas(lp_in_pool)}{' '}
                <FormattedMessage id="holding" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function MyShares({
  shares,
  totalShares,
  poolId,
  decimal,
  supportFarmV1,
  supportFarmV2,
  farmStakeV1 = '0',
  farmStakeV2 = '0',
  userTotalShare,
  onlyEndedFarmV2,
}: {
  shares: string;
  totalShares: string;
  poolId?: number;
  decimal?: number;
  supportFarmV1: Number;
  supportFarmV2: Number;
  farmStakeV1: string | number;
  farmStakeV2: string | number;
  onlyEndedFarmV2: boolean;
  userTotalShare: BigNumber;
}) {
  if (!shares || !totalShares) return <div>-</div>;

  const sharePercent = percent(userTotalShare.valueOf(), totalShares);

  let displayPercent;
  if (Number.isNaN(sharePercent) || sharePercent === 0) displayPercent = '0';
  else if (sharePercent < 0.01 && sharePercent > 0)
    displayPercent = `< ${
      decimal ? '0.'.padEnd(decimal + 1, '0') + '1' : '0.01'
    }`;
  else displayPercent = toPrecision(String(sharePercent), decimal || 4);

  return (
    <div className=" inline-flex flex-col justify-center xs:text-right md:text-right">
      <div className="pl-2 xs:pr-0 md:pr-0 flex flex-col xs:flex-row md:flex-row text-sm whitespace-nowrap">
        <span>
          {`${toRoundedReadableNumber({
            decimals: isStablePool(poolId)
              ? getStablePoolDecimal(poolId)
              : LP_TOKEN_DECIMALS,
            number: userTotalShare
              .toNumber()
              .toLocaleString('fullwide', { useGrouping: false }),
            precision: decimal || 6,
          })} `}
        </span>

        <span className="md:ml-1 xs:ml-1">{`(${displayPercent}%)`}</span>
      </div>
    </div>
  );
}

function PoolRow(props: {
  pool: PoolRPCView;
  tokens: TokenMetadata[];
  supportFarmV1: number;
  supportFarmV2: number;
  onlyEndedFarmV2: boolean;
  lptAmount?: string;
  endedFarmV1?: number;
  endedFarmV2?: number;
  shares: string;
  tvl: number;
}) {
  const { pool: poolRPC, endedFarmV1, endedFarmV2, shares } = props;
  const pool = parsePool(poolRPC);

  const needForbidden = Number(pool.id) === Number(NEARX_POOL_ID);

  const poolId = pool.id;

  const tokens: TokenMetadata[] = props.tokens;
  const tokensSort: TokenMetadata[] = props.tokens
    ? JSON.parse(JSON.stringify(props.tokens))
    : [];
  tokensSort.sort((a, b) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
    return 0;
  });
  const lptAmount = props.lptAmount || '0';
  const poolTVL = pool.tvl || props.tvl;

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showFunding, setShowFunding] = useState(false);
  const supportFarmV1 = props.supportFarmV1;
  const supportFarmV2 = props.supportFarmV2;
  const disable_add = useMemo(() => {
    const tokenIds = tokens?.map((t) => t.id) || [];
    return !!tokenIds.find((id) => BLACK_TOKEN_LIST.includes(id));
  }, [tokens]);
  const history = useHistory();

  const { stakeList, v2StakeList, finalStakeList } =
    useContext(StakeListContext);

  const farmStakeV1 = useFarmStake({ poolId, stakeList });
  const farmStakeV2 = useFarmStake({ poolId, stakeList: v2StakeList });
  const farmStakeTotal = useFarmStake({ poolId, stakeList: finalStakeList });
  const LpLocked = useLpLocker(`:${poolId}`);
  const userTotalShare = BigNumber.sum(shares, farmStakeTotal, LpLocked);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString('fullwide', { useGrouping: false });

  const usdValue = useMemo(() => {
    try {
      if (
        !userTotalShareToString ||
        typeof poolTVL !== 'number' ||
        !pool ||
        (Number(checkFarmStake({ poolId, stakeList: finalStakeList })) > 0 &&
          Number(farmStakeTotal) === 0)
      )
        return '-';

      const rawRes = multiply(
        new BigNumber(userTotalShareToString)
          .plus(
            Number(getVEPoolId()) === Number(pool.id) ? lptAmount || '0' : '0'
          )
          .toNumber()
          .toFixed(),
        divide(poolTVL.toString(), pool?.shareSupply)
      );

      return `$${toInternationalCurrencySystem(rawRes, 2)}`;
    } catch (error) {
      return '-';
    }
  }, [poolTVL, userTotalShareToString, pool, finalStakeList]);
  if (
    userTotalShare
      .plus(Number(getVEPoolId()) === Number(pool.id) ? lptAmount || '0' : '0')
      .eq(new BigNumber(0))
  )
    return null;

  const Images = tokensSort.map((token, index) => {
    const { icon, id } = token;
    if (icon)
      return (
        <img
          key={id}
          className={
            'inline-block h-8 w-8 rounded-full border border-gradientFromHover -ml-1 '
          }
          src={icon}
        />
      );
    return (
      <div
        key={id}
        className={
          'inline-block h-8 w-8 rounded-full bg-cardBg border border-gradientFromHover -ml-1'
        }
      ></div>
    );
  });
  const tokenAmountShare = (
    pool: Pool,
    token: TokenMetadata,
    shares: string
  ) => {
    const value = toRoundedReadableNumber({
      decimals: token.decimals,
      number: calculateFairShare({
        shareOf: pool.supplies[token.id],
        contribution: shares,
        totalContribution: pool.shareSupply,
      }),
      precision: 3,
      withCommas: false,
    });

    return Number(value) < 0.001 ? (
      <span className="whitespace-nowrap">{'< 0.001'}</span>
    ) : (
      toInternationalCurrencySystem(value, 3)
    );
  };

  const TokenInfoPC = ({ token }: { token: TokenMetadata }) => {
    return (
      <div className="inline-flex items-center justify-between my-1 w-28">
        <div className="gotham_bold">{toRealSymbol(token.symbol)}</div>
        <div className="font-normal relative left-2.5">
          {tokenAmountShare(
            pool,
            token,
            new BigNumber(userTotalShareToString)
              .plus(Number(getVEPoolId()) === Number(pool.id) ? lptAmount : '0')
              .toNumber()
              .toFixed()
          )}
        </div>
      </div>
    );
  };

  const TokenInfoMobile = ({ token }: { token: TokenMetadata }) => {
    return (
      <div className="flex items-center justify-between my-2">
        <div className="col-span-3 text-gray-400">
          {toRealSymbol(token.symbol)}
        </div>
        <div className="font-normal">
          {tokenAmountShare(
            pool,
            token,
            new BigNumber(userTotalShareToString)
              .plus(Number(getVEPoolId()) === Number(pool.id) ? lptAmount : '0')
              .toNumber()
              .toFixed()
          )}
        </div>
      </div>
    );
  };

  const TokensSymbolsMobile = ({ tokens }: { tokens: TokenMetadata[] }) => {
    return (
      <div className="text-xs font-semibold">
        {tokens.map((token, i) => {
          return (
            <span key={i}>
              {i ? '-' : ''}

              {toRealSymbol(token.symbol)}
            </span>
          );
        })}
      </div>
    );
  };

  const lpDecimal = isStablePool(pool.id) ? getStablePoolDecimal(pool.id) : 24;

  const intl = useIntl();

  function getForbiddenTip() {
    const tip = intl.formatMessage({
      id: 'pool_stop_tip',
      defaultMessage: 'This pool has been stopped.',
    });
    const result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  return (
    <>
      {/* PC */}
      <div className="px-8 pb-2 xsm:hidden">
        <Link
          style={{
            gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
          }}
          className="xs:hidden md:hidden grid  py-5 content-center items-center text-sm text-white border-t border-gray-700 border-opacity-70 cursor-pointer"
          to={{ pathname: `/pool/${pool.id}` }}
        >
          <div className="col-span-2 inline-flex items-start flex-col relative">
            <div className="w-16 flex items-center ml-1">{Images}</div>
            <div className="absolute text-xs top-10 text-primaryText">
              {isStablePool(pool.id) ? (
                <FormattedMessage
                  id="stable_pool"
                  defaultMessage="StablePool"
                />
              ) : null}
            </div>
          </div>

          <div className="col-span-2 inline-flex flex-col text-sm">
            {tokensSort.map((token, i) => (
              <TokenInfoPC key={i} token={token} />
            ))}
          </div>

          <div className="col-span-3  text-left pl-6">
            <MyShares
              shares={shares}
              totalShares={pool.shareSupply}
              decimal={2}
              poolId={pool.id}
              supportFarmV1={supportFarmV1}
              userTotalShare={userTotalShare.plus(
                Number(getVEPoolId()) === Number(pool.id) ? lptAmount : '0'
              )}
              farmStakeV1={farmStakeV1}
              farmStakeV2={farmStakeV2}
              supportFarmV2={supportFarmV2}
              onlyEndedFarmV2={props.onlyEndedFarmV2}
            />
          </div>

          <div className="col-span-2 flex flex-col text-xs  -ml-12 text-farmText">
            {(supportFarmV1 > endedFarmV1 || Number(farmStakeV1) > 0) && (
              <Link
                to={{
                  pathname: '/farms',
                }}
                target="_blank"
                rel="noopener noreferrer nofollow"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-primaryText mb-1.5 flex"
              >
                <span>
                  {toPrecision(
                    toReadableNumber(
                      lpDecimal,
                      scientificNotationToString(farmStakeV1.toString())
                    ),
                    2
                  )}
                </span>
                <span className="mx-1">
                  <FormattedMessage id="in" defaultMessage={'in'} />
                </span>
                <div className="text-primaryText flex items-center hover:text-gradientFrom flex-shrink-0">
                  <span className="underline">Legacy Farms</span>

                  <span className="ml-0.5">
                    <VEARROW />
                  </span>
                </div>
              </Link>
            )}

            {(supportFarmV2 > endedFarmV2 || Number(farmStakeV2) > 0) && (
              <Link
                to={{
                  pathname: `/v2farms/${pool.id}-${
                    props.onlyEndedFarmV2 ? 'e' : 'r'
                  }`,
                }}
                target="_blank"
                rel="noopener noreferrer nofollow"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-primaryText mb-1.5 flex"
              >
                <span>
                  {toPrecision(
                    toReadableNumber(
                      lpDecimal,
                      scientificNotationToString(farmStakeV2.toString())
                    ),
                    2
                  )}
                </span>
                <span className="mx-1">
                  <FormattedMessage id="in" defaultMessage={'in'} />
                </span>
                <div className="text-primaryText flex items-center hover:text-gradientFrom flex-shrink-0">
                  <span className="underline">
                    <FormattedMessage id="classic_farms" />
                  </span>

                  <span className="ml-0.5">
                    <VEARROW />
                  </span>
                </div>
              </Link>
            )}
            {Big(LpLocked).gt(0) ? (
              <div>
                <span>
                  {toPrecision(
                    toReadableNumber(
                      lpDecimal,
                      scientificNotationToString(LpLocked.toString())
                    ),
                    2
                  )}
                </span>
                <span className="mx-1">
                  <FormattedMessage id="in" defaultMessage={'in'} />
                </span>
                <span className="text-primaryText">Locked</span>
              </div>
            ) : null}
            {Number(getVEPoolId()) === Number(pool.id) &&
            !!getConfig().REF_VE_CONTRACT_ID ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  openUrl('/referendum');
                }}
                className="text-primaryText mb-1.5 flex whitespace-nowrap items-center"
              >
                <span>
                  {toPrecision(
                    ONLY_ZEROS.test(
                      toNonDivisibleNumber(
                        LOVE_TOKEN_DECIMAL,
                        toReadableNumber(24, lptAmount || '0')
                      )
                    )
                      ? '0'
                      : toReadableNumber(24, lptAmount || '0'),
                    2
                  )}
                </span>
                <span className="mx-1">
                  <FormattedMessage id="locked" defaultMessage={'locked'} />
                </span>
                <span className="mr-1">
                  <FormattedMessage id="in" defaultMessage={'in'} />
                </span>
                <div className="text-primaryText flex items-center hover:text-gradientFrom flex-shrink-0">
                  <span className="underline">
                    <FormattedMessage
                      id="vote_capital"
                      defaultMessage={'VOTE'}
                    />
                  </span>
                  <span className="ml-0.5">
                    <VEARROW />
                  </span>
                </div>
              </div>
            ) : null}

            {ONLY_ZEROS.test(shares) ||
            (supportFarmV1 === 0 && supportFarmV2 === 0) ? null : (
              <div>
                <span
                  className={'text-gradientFrom'}
                  title={toReadableNumber(
                    isStablePool(pool.id) ? getStablePoolDecimal(pool.id) : 24,
                    shares
                  )}
                >
                  {toPrecision(
                    toReadableNumber(
                      isStablePool(pool.id)
                        ? getStablePoolDecimal(pool.id)
                        : 24,
                      shares
                    ),
                    2
                  )}
                </span>

                <span className="ml-1">
                  <FormattedMessage id="available" />
                </span>
              </div>
            )}
          </div>

          <div className="col-span-2 text-left ml-4 xl:ml-8">{usdValue}</div>

          <div className="flex items-center justify-end  text-center  col-span-2 ">
            <div className="flex items-center flex-col justify-end flex-wrap">
              <div
                className="text-xl text-white"
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-tooltip-html={getForbiddenTip()}
                data-tooltip-id={'forbiddenTip' + 'your_lp' + pool.id}
                data-class="reactTip"
              >
                <SolidButton
                  disabled={disable_add}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    if (needForbidden) {
                      return;
                    }

                    if (isNotStablePool(pool)) {
                      setShowFunding(true);
                    } else {
                      history.push(`/sauce/${pool.id}`, {
                        stableTab: 'add_liquidity',
                      });
                    }
                  }}
                  className={`text-sm col-span-2 ${
                    needForbidden ? 'text-opacity-20' : ''
                  } px-1.5 py-1.5 text-center whitespace-nowrap mb-3 gotham_bold rounded-lg`}
                  style={{
                    minWidth: '104px',
                    background: needForbidden ? '#314351' : '',
                    border: needForbidden ? 'none' : '',
                  }}
                >
                  <FormattedMessage id="add" defaultMessage="Add" />
                </SolidButton>
                {needForbidden ? (
                  <CustomTooltip
                    id={'forbiddenTip' + 'your_lp' + pool.id}
                    place="bottom"
                  />
                ) : null}
              </div>

              <OutlineButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  if (isNotStablePool(pool)) {
                    setShowWithdraw(true);
                  } else {
                    history.push(`/sauce/${pool.id}`, {
                      stableTab: 'remove_liquidity',
                    });
                  }

                  setShowWithdraw(true);
                }}
                className="text-sm w-full px-4 col-span-2 text-center h-8 mb-1 gotham_bold rounded-lg"
                style={{
                  minWidth: '104px',
                }}
              >
                <FormattedMessage id="remove" defaultMessage="Remove" />
              </OutlineButton>
            </div>
          </div>
        </Link>
        <BLACKTip tokenIds={tokens?.map((t) => t.id) || []} />
      </div>
      {/* Mobile */}

      <Link
        className="lg:hidden pb-2 px-6 text-sm text-white cursor-pointer"
        to={{ pathname: `/pool/${pool.id}` }}
      >
        <Card width="w-full" padding="py-4 px-0">
          <div className="flex flex-col items-start pb-4 border-b border-gray-700 border-opacity-70 px-6 bg-orderMobileTop">
            <div className="flex items-center">
              <div className="ml-1 mr-4 flex items-center">{Images}</div>
              <div className="text-xs font-semibold">
                <TokensSymbolsMobile tokens={tokensSort} />
              </div>
            </div>
            <div
              className={`relative top-2 text-xs text-primaryText ${
                isStablePool(pool.id) ? 'block' : 'hidden'
              }`}
            >
              <FormattedMessage id="stable_pool" defaultMessage="StablePool" />
            </div>
          </div>
          <div className="flex flex-col text-sm border-b border-gray-700 border-opacity-70 px-6">
            {tokensSort.map((token, i) => (
              <TokenInfoMobile key={i} token={token} />
            ))}
          </div>

          <div
            className={`flex items justify-between border-b border-gray-700 border-opacity-70 px-6 ${
              supportFarmV1 > 0 && supportFarmV2 > 0 ? 'pt-2 pb-4' : 'py-2'
            }`}
          >
            <div className="flex flex-col text-gray-400 text-sm">
              <span>
                <FormattedMessage id="lp_token"></FormattedMessage>
              </span>
              <span>
                (<FormattedMessage id="my_shares" defaultMessage="Shares" />)
              </span>
            </div>

            <div className={`flex flex-col  text-white items-end `}>
              <div
                className={`flex ${
                  supportFarmV1 === 0 && supportFarmV2 === 0 ? 'h-12' : 'mb-1.5'
                }`}
              >
                <MyShares
                  shares={shares}
                  totalShares={pool.shareSupply}
                  decimal={2}
                  poolId={pool.id}
                  supportFarmV1={supportFarmV1}
                  supportFarmV2={supportFarmV2}
                  userTotalShare={userTotalShare.plus(
                    Number(getVEPoolId()) === Number(pool.id) ? lptAmount : '0'
                  )}
                  farmStakeV1={farmStakeV1}
                  farmStakeV2={farmStakeV2}
                  onlyEndedFarmV2={props.onlyEndedFarmV2}
                />
              </div>

              {(supportFarmV1 > endedFarmV1 || Number(farmStakeV1) > 0) && (
                <Link
                  to={{
                    pathname: '/farms',
                  }}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-primaryText flex items-center mb-1.5 text-xs"
                >
                  <span>
                    {toPrecision(
                      toReadableNumber(
                        lpDecimal,
                        scientificNotationToString(farmStakeV1.toString())
                      ),
                      2
                    )}
                  </span>
                  <span className="mx-1">
                    <FormattedMessage id="in" defaultMessage={'in'} />
                  </span>
                  <span className="border-b border-primaryText">
                    <FormattedMessage id="farm" defaultMessage={'Farm'} />
                    <span className="ml-1">Legacy</span>
                  </span>
                  <span className="text-gradientFrom ml-0.5">
                    <VEARROW />
                  </span>
                </Link>
              )}

              {(supportFarmV2 > endedFarmV2 || Number(farmStakeV2) > 0) && (
                <Link
                  to={{
                    pathname: `/v2farms/${pool.id}-${
                      props.onlyEndedFarmV2 ? 'e' : 'r'
                    }`,
                  }}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-primaryText mb-1.5 flex items-center text-xs"
                >
                  <span>
                    {toPrecision(
                      toReadableNumber(
                        lpDecimal,
                        scientificNotationToString(farmStakeV2.toString())
                      ),
                      2
                    )}
                  </span>
                  <span className="mx-1">
                    <FormattedMessage id="in" defaultMessage={'in'} />
                  </span>
                  <span className="border-b border-primaryText">
                    <FormattedMessage id="classic_farms" />
                  </span>
                  <span className="text-gradientFrom ml-0.5">
                    <VEARROW />
                  </span>
                </Link>
              )}
              {Big(LpLocked).gt(0) ? (
                <div className="text-primaryText text-xs">
                  <span>
                    {toPrecision(
                      toReadableNumber(
                        lpDecimal,
                        scientificNotationToString(LpLocked.toString())
                      ),
                      2
                    )}
                  </span>
                  <span className="mx-1">
                    <FormattedMessage id="in" defaultMessage={'in'} />
                  </span>
                  <span className="text-primaryText">Locked</span>
                </div>
              ) : null}
              {Number(getVEPoolId()) === Number(pool.id) &&
              !!getConfig().REF_VE_CONTRACT_ID ? (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openUrl('/referendum');
                  }}
                  className="text-primaryText flex items-center mb-1.5 text-xs"
                >
                  <span>
                    {toPrecision(toReadableNumber(24, lptAmount || '0'), 2)}
                  </span>
                  <span className="mx-1">
                    <FormattedMessage id="locked" defaultMessage={'locked'} />
                  </span>
                  <span className="mr-1">
                    <FormattedMessage id="in" defaultMessage={'in'} />
                  </span>
                  <span className="border-b border-primaryText">
                    <FormattedMessage
                      id="vote_capital"
                      defaultMessage={'VOTE'}
                    />
                  </span>
                  <span className="text-gradientFrom ml-0.5">
                    <VEARROW />
                  </span>
                </div>
              ) : null}

              {ONLY_ZEROS.test(shares) ||
              (supportFarmV1 === 0 && supportFarmV2 === 0) ? null : (
                <div className="text-xs">
                  <span
                    className={'text-gradientFrom'}
                    title={toReadableNumber(
                      isStablePool(pool.id)
                        ? getStablePoolDecimal(pool.id)
                        : 24,
                      shares
                    )}
                  >
                    {toPrecision(
                      toReadableNumber(
                        isStablePool(pool.id)
                          ? getStablePoolDecimal(pool.id)
                          : 24,
                        shares
                      ),
                      2
                    )}
                  </span>

                  <span className="ml-1 text-primaryText">
                    <FormattedMessage id="available" />
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex border-b justify-between border-gray-700 border-opacity-70 p-6">
            <div className="text-gray-400 text-sm">
              <FormattedMessage id="value" defaultMessage="Value" />
            </div>
            <div>{usdValue}</div>
          </div>

          <div className="mt-4 flex items-center justify-center px-6 py-2">
            <div
              className="text-xl text-white"
              data-type="info"
              data-place="top"
              data-multiline={true}
              data-tooltip-html={getForbiddenTip()}
              data-tooltip-id={'forbiddenTip' + 'your_lp' + pool.id}
              data-class="reactTip"
            >
              <SolidButton
                disabled={disable_add}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  if (needForbidden) return;

                  if (isNotStablePool(pool)) {
                    setShowFunding(true);
                  } else {
                    history.push(`/sauce/${pool.id}`, {
                      stableTab: 'add_liquidity',
                    });
                  }
                }}
                className={`text-sm mr-4 h-8 ${
                  needForbidden ? 'text-opacity-20' : ''
                } py-0.5 px-1`}
                style={{
                  minWidth: '112px',
                  background: needForbidden ? '#314351' : '',
                  border: needForbidden ? 'none' : '',
                }}
              >
                <FormattedMessage id="add" defaultMessage="Add" />
              </SolidButton>
              {needForbidden ? (
                <CustomTooltip id={'forbiddenTip' + 'your_lp' + pool.id} />
              ) : null}
            </div>

            <OutlineButton
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (isNotStablePool(pool)) {
                  setShowWithdraw(true);
                } else {
                  history.push(`/sauce/${pool.id}`, {
                    stableTab: 'remove_liquidity',
                  });
                }
              }}
              className="text-sm h-8 py-0.5 px-1"
              style={{
                minWidth: '96px',
              }}
            >
              <FormattedMessage id="remove" defaultMessage="Remove" />
            </OutlineButton>
          </div>
          <BLACKTip
            className="mx-4 mt-2"
            tokenIds={tokens?.map((t) => t.id) || []}
          />
        </Card>
      </Link>
      <RemoveLiquidityModal
        pool={pool}
        shares={shares}
        tokens={tokens}
        isOpen={showWithdraw}
        onRequestClose={() => setShowWithdraw(false)}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            bottom: '50%',
          },
        }}
      />
      <AddLiquidityModal
        closeTip={
          localStorage.getItem(REF_FI_PRE_LIQUIDITY_ID_KEY) &&
          pool.id.toString() !==
            localStorage.getItem(REF_FI_PRE_LIQUIDITY_ID_KEY)
        }
        pool={pool}
        tokens={tokens}
        isOpen={showFunding}
        onRequestClose={() => setShowFunding(false)}
        overlayClassName=""
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            bottom: '50%',
          },
        }}
      />
    </>
  );
}

function MorePoolRow({
  checked,
  setPool,
  pool,
  canFarm,
}: {
  checked: boolean;
  setPool: (pool: Pool) => void;
  pool: Pool;
  canFarm?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-10  px-3 text-sm text-primaryText ${
        checked ? 'bg-cardBg' : 'bg-searchBgColor'
      } rounded-lg py-3  mt-2.5`}
    >
      <span className="flex items-center col-span-4">
        <button
          className="w-4 h-4 bg-navHighLightBg flex items-center text-gradientFrom justify-center border flex-shrink-0 border-gradientFrom rounded mr-2.5"
          onClick={() => {
            setPool(pool);
          }}
        >
          {!checked ? null : <RewardCheck />}
        </button>

        <span>#{pool.id}</span>
        {canFarm && (
          <a
            href={`/v2farms/${pool.id}-r`}
            className="bg-gradientFrom ml-2 xs:ml-1 text-black whitespace-nowrap text-xs px-2 py-0.5 flex items-center hover:bg-senderHot rounded-md"
          >
            <FormattedMessage id="farm" />
            <span className="ml-1">
              <VEARROW />
            </span>
          </a>
        )}
      </span>

      <span className="flex items-center col-span-3">
        <span className={`ml-2 ${checked ? 'text-white' : ''}`}>
          $
          {Number(pool.tvl) > 0 && Number(pool.tvl) < 0.01
            ? '< 0.01'
            : toInternationalCurrencySystem(pool.tvl.toString(), 2)}
        </span>
      </span>

      <span className="flex items-center col-span-3 pl-4">
        <span className={`ml-2 ${checked ? 'text-white' : ''}`}>
          {`${toPrecision(calculateFeePercent(pool.fee).toString(), 2)}`}%
        </span>
      </span>
    </div>
  );
}
export const REF_FI_YOUR_LP_VALUE = 'REF_FI_YOUR_LP_VALUE';

export const REF_FI_YOUR_LP_VALUE_V1_COUNT = 'REF_FI_YOUR_LP_VALUE_V1_COUNT';

export function YourLiquidityAddLiquidityModal(
  props: ReactModal.Props & {
    stablePools: PoolRPCView[];
  }
) {
  const { isOpen, onRequestClose, stablePools } = props;

  const [addPoolOpen, setAddPoolOpen] = useState<boolean>(false);

  const [pool, setPool] = useState<Pool>();

  const [candPools, setCandPools] = useState<Pool[]>();
  const selectTokens = useWhitelistTokens();

  const selectBalances = useTokenBalances();
  const [farmV2Counts, setFarmV2Counts] = useState<Record<string, number>>();

  useEffect(() => {
    if (!candPools) return;
    Promise.all(candPools.map((p) => canFarmV2(p.id))).then((res) => {
      setFarmV2Counts(
        res
          .map((r) => r.count)
          ?.reduce((acc, cur, i) => {
            return {
              ...acc,
              [candPools[i].id]: cur,
            };
          }, {})
      );
    });
  }, [candPools]);

  const candPoolsSortingFunc = (a: Pool, b: Pool) => {
    const AfarmCount = farmV2Counts?.[a.id] || 0;
    const BfarmCount = farmV2Counts?.[b.id] || 0;
    if (AfarmCount !== BfarmCount) {
      return BfarmCount - AfarmCount;
    }

    if (a.tvl !== b.tvl) {
      return Number(b.tvl) - Number(a.tvl);
    }

    return b.fee - a.fee;
  };

  const displayCandPools = useMemo(
    () => candPools?.sort(candPoolsSortingFunc),
    [candPools, farmV2Counts]
  );

  // control  default pool
  useEffect(() => {
    if (!displayCandPools || displayCandPools.length < 1 || forStableClass) {
      setPool(null);
    } else setPool(displayCandPools[0]);
  }, [displayCandPools, farmV2Counts]);

  const [tokens, setTokens] = useState<TokenMetadata[]>([
    REF_META_DATA,
    unwrapedNear,
  ]);

  const forStableClass =
    stablePools?.some(
      (p) =>
        p.token_account_ids.includes(tokens[0].id) &&
        p.token_account_ids.includes(tokens[1].id)
    ) && tokens[0].id !== tokens[1].id;

  useEffect(() => {
    getPoolsByTokensIndexer({
      token0: tokens[0].id,
      token1: tokens[1].id,
    }).then((res) => {
      setCandPools(
        res
          .filter(
            (p: PoolRPCView) =>
              !isStablePool(p.id) &&
              p?.pool_kind !== 'STABLE_SWAP' &&
              p?.pool_kind !== 'RATED_SWAP'
          )
          .map((r: PoolRPCView) => parsePool(r))
      );
    });
  }, [tokens.map((t) => t.id).join('-')]);

  const disabled_add = useMemo(() => {
    return !!tokens.find((t) => BLACK_TOKEN_LIST.includes(t.id));
  }, [tokens]);

  const isMobile = useClientMobile();

  const cardWidth = isMobile ? '90vw' : '450px';

  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [messageId, setMessageId] = useState<string>('add_liquidity');
  const [defaultMessage, setDefaultMessage] = useState<string>('Add Liquidity');
  const balances = useWalletTokenBalances(tokens.map((token) => token.id));

  const nearBalance = useDepositableBalance('NEAR');

  const [error, setError] = useState<Error>();
  const intl = useIntl();
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [canDeposit, setCanDeposit] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [preShare, setPreShare] = useState(null);
  const [modal, setModal] = useState(null);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});

  useEffect(() => {
    getTokenPriceList().then(setTokenPriceList);
  }, []);

  useEffect(() => {
    if (!pool || tokens[0].id === tokens[1].id) {
      setCanDeposit(false);
    }
  }, [tokens.map((t) => t.id).join('-'), pool]);

  balances && (balances[WRAP_NEAR_CONTRACT_ID] = nearBalance);

  const getMax = function (id: string, amount: string) {
    return id !== WRAP_NEAR_CONTRACT_ID
      ? amount
      : Number(amount) <= 0.5
      ? '0'
      : String(Number(amount) - 0.5);
  };

  const changeFirstTokenAmount = (amount: string) => {
    setError(null);
    if (
      tokens[0].id === tokens[1].id ||
      !pool ||
      Object.values(pool.supplies).every((s) => s === '0')
    ) {
      setFirstTokenAmount(amount);
      const zero = new BigNumber('0');
      if (
        zero.isLessThan(secondTokenAmount || '0') &&
        zero.isLessThan(amount || '0')
      ) {
        setPreShare(1);
      } else {
        setPreShare(null);
      }
      try {
        tokens[0].id !== tokens[1].id &&
          pool &&
          validate({
            firstAmount: amount,
            secondAmount: secondTokenAmount,
          });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[0].decimals, amount),
        totalContribution: pool.supplies[tokens[0].id],
      });
      let secondAmount = '';
      if (amount) {
        secondAmount = toReadableNumber(
          tokens[1].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[1].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        );
      }
      setFirstTokenAmount(amount);
      setSecondTokenAmount(secondAmount);
      setPreShare(toReadableNumber(24, fairShares));
      try {
        validate({
          firstAmount: amount,
          secondAmount,
        });
      } catch (error) {
        setError(error);
      }
    }
  };

  const changeSecondTokenAmount = (amount: string) => {
    setError(null);
    if (
      tokens[0].id === tokens[1].id ||
      !pool ||
      Object.values(pool.supplies).every((s) => s === '0')
    ) {
      setSecondTokenAmount(amount);
      const zero = new BigNumber('0');
      if (
        zero.isLessThan(firstTokenAmount || '0') &&
        zero.isLessThan(amount || '0')
      ) {
        setPreShare(1);
      } else {
        setPreShare(null);
      }
      try {
        tokens[0].id !== tokens[1].id &&
          pool &&
          validate({
            firstAmount: firstTokenAmount,
            secondAmount: amount,
          });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[1].decimals, amount),
        totalContribution: pool.supplies[tokens[1].id],
      });
      let firstAmount = '';
      if (amount) {
        firstAmount = toReadableNumber(
          tokens[0].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[0].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        );
      }
      ``;
      setSecondTokenAmount(amount);
      setFirstTokenAmount(firstAmount);
      setPreShare(toReadableNumber(24, fairShares));
      try {
        validate({
          firstAmount,
          secondAmount: amount,
        });
      } catch (error) {
        setError(error);
      }
    }
  };

  useEffect(() => {
    if (!pool) return;
    changeFirstTokenAmount(firstTokenAmount);
  }, [pool?.id]);

  useEffect(() => {
    pool &&
      validate({
        firstAmount: firstTokenAmount,
        secondAmount: secondTokenAmount,
      });
  }, [balances, pool?.id, firstTokenAmount, secondTokenAmount]);

  const firstTokenBalanceBN =
    tokens[0] && balances
      ? new BigNumber(
          getMax(
            tokens[0].id,
            toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
          )
        )
      : new BigNumber(0);

  const secondTokenBalanceBN =
    tokens[1] && balances
      ? new BigNumber(
          getMax(
            tokens[1].id,
            toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
          )
        )
      : new BigNumber(0);
  function validate({
    firstAmount,
    secondAmount,
  }: {
    firstAmount: string;
    secondAmount: string;
  }) {
    const firstTokenAmountBN = new BigNumber(firstAmount.toString());

    const secondTokenAmountBN = new BigNumber(secondAmount.toString());

    setCanSubmit(false);
    setCanDeposit(false);
    if (firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN)) {
      setCanDeposit(true);
      const { id, decimals } = tokens[0];
      const modalData: any = {
        token: tokens[0],
        action: 'deposit',
      };
      getDepositableBalance(id, decimals).then((nearBalance) => {
        modalData.max = nearBalance;
        setModal(Object.assign({}, modalData));
      });
      setModal(modalData);

      return;
    }

    if (secondTokenAmountBN.isGreaterThan(secondTokenBalanceBN)) {
      setCanDeposit(true);
      // setMessageId('deposit_to_add_liquidity');
      // setDefaultMessage('Deposit to Add Liquidity');
      const { id, decimals } = tokens[1];
      const modalData: any = {
        token: tokens[1],
        action: 'deposit',
      };
      getDepositableBalance(id, decimals).then((nearBalance) => {
        modalData.max = nearBalance;
        setModal(Object.assign({}, modalData));
      });
      setModal(modalData);
      return;
    }

    if (ONLY_ZEROS.test(firstAmount)) {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      return;
    }

    if (ONLY_ZEROS.test(secondAmount)) {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      return;
    }

    if (!tokens[0]) {
      throw new Error(
        `${tokens[0].id} ${intl.formatMessage({
          id: 'is_not_exist',
        })}`
      );
    }

    if (!tokens[1]) {
      throw new Error(
        `${tokens[1].id} ${intl.formatMessage({
          id: 'is_not_exist',
        })}`
      );
    }

    setCanSubmit(true);
    setMessageId('add_liquidity');
    setDefaultMessage('Add Liquidity');
  }

  function submit() {
    const token0 = tokens.find((token) => token.id === pool.tokenIds[0]);
    const token1 = tokens.find((token) => token.id === pool.tokenIds[1]);
    const amount0 =
      token0.id === tokens[0].id ? firstTokenAmount : secondTokenAmount;
    const amount1 =
      token1.id === tokens[1].id ? secondTokenAmount : firstTokenAmount;

    return addLiquidityToPool({
      id: pool.id,
      tokenAmounts: [
        { token: token0, amount: amount0 },
        { token: token1, amount: amount1 },
      ],
    });
  }

  const ButtonRender = () => {
    if (!isSignedIn) {
      return <ConnectToNearBtn />;
    }

    const handleClick = async () => {
      if (canSubmit) {
        setButtonLoading(true);
        submit();
      }
    };
    return (
      <SolidButton
        disabled={
          !canSubmit ||
          canDeposit ||
          !pool ||
          tokens[0].id === tokens[1].id ||
          disabled_add
        }
        className="focus:outline-none  w-full text-lg"
        onClick={handleClick}
        loading={buttonLoading}
        padding={'p-4'}
      >
        <div className="flex items-center justify-center w-full m-auto">
          <div>
            <ButtonTextWrapper
              loading={buttonLoading}
              Text={() => (
                <FormattedMessage
                  id={messageId}
                  defaultMessage={defaultMessage}
                />
              )}
            />
          </div>
        </div>
      </SolidButton>
    );
  };

  const shareDisplay = () => {
    let result = '';
    let percentShare = '';
    let displayPercentShare = '';
    if (preShare && new BigNumber('0').isLessThan(preShare)) {
      const myShareBig = new BigNumber(preShare);
      if (myShareBig.isLessThan('0.001')) {
        result = '<0.001';
      } else {
        result = `${myShareBig.toFixed(3)}`;
      }
    } else {
      result = '-';
    }

    if (result !== '-') {
      percentShare = `${percent(
        preShare,
        scientificNotationToString(
          new BigNumber(toReadableNumber(24, pool.shareSupply))
            .plus(new BigNumber(preShare))
            .toString()
        )
      )}`;

      if (Number(percentShare) > 0 && Number(percentShare) < 0.01) {
        displayPercentShare = '< 0.01%';
      } else {
        displayPercentShare = `${toPrecision(percentShare, 2)}%`;
      }
    }

    return {
      lpTokens: result,
      shareDisplay: displayPercentShare,
    };
  };

  const render = (token: TokenMetadata) => {
    return toRoundedReadableNumber({
      decimals: token.decimals,
      number: balances ? balances[token.id] : '0',
    });
  };

  const getStablePoolIdByTokens = () => {
    return (
      stablePools.find((p) => {
        return (
          p.token_account_ids.includes(tokens[0].id) &&
          p.token_account_ids.includes(tokens[1].id)
        );
      }).id || -1
    );
  };

  // if (!selectTokens) return <Loading />;
  if (!selectTokens) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            overflow: 'auto',
          },
          content: {
            outline: 'none',
            transform: `translate(-50%,  ${isMobile ? '-270px' : '-40vh'})`,
          },
        }}
      >
        <div className="flex flex-col">
          <div
            className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-cardBg overflow-auto"
            style={{
              width: cardWidth,
              border: '1px solid rgba(0, 198, 162, 0.5)',
            }}
          >
            <div className="title flex items-center justify-between">
              <div className="flex items-center">
                <label className="text-white text-xl">
                  <FormattedMessage id={'add_liquidity'}></FormattedMessage>
                </label>
              </div>
              <ModalClose className="cursor-pointer" onClick={onRequestClose} />
            </div>
            <div className="text-white outline-none ">
              <div className="mt-8">
                <div className="flex justify-end items-center text-sm text-right mb-1.5 text-farmText">
                  <FormattedMessage id="balance" defaultMessage="Balance" />
                  {':'}
                  <span
                    className="ml-1"
                    title={toReadableNumber(
                      tokens[0].decimals,
                      balances?.[tokens[0].id]
                    )}
                  >
                    {isSignedIn
                      ? toPrecision(
                          toReadableNumber(
                            tokens[0].decimals,
                            balances?.[tokens[0].id]
                          ),
                          2,
                          true
                        )
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center">
                  <BoostInputAmount
                    className="w-full border border-transparent rounded"
                    max={getMax(
                      tokens[0].id,
                      toReadableNumber(
                        tokens[0].decimals,
                        balances?.[tokens[0].id]
                      )
                    )}
                    onChangeAmount={changeFirstTokenAmount}
                    value={firstTokenAmount}
                    tokenSymbol={
                      <SelectToken
                        tokens={selectTokens}
                        render={render}
                        selected={
                          tokens[0] && (
                            <button className="flex items-center hover:bg-black hover:bg-opacity-20 rounded-lg px-2 py-2.5 text-white hover:text-gradientFrom">
                              <span className="text-white">
                                {toRealSymbol(tokens[0].symbol)}
                              </span>
                              <span className="ml-1">
                                <ArrowDownCur />
                              </span>
                            </button>
                          )
                        }
                        onSelect={(token: TokenMetadata) => {
                          setTokens([token, tokens[1]]);
                        }}
                        balances={selectBalances}
                        tokenPriceList={tokenPriceList}
                      />
                    }
                  />
                </div>
              </div>

              <div className="my-8">
                <div className="flex justify-end items-center text-sm text-right mb-1.5 text-farmText">
                  <FormattedMessage id="balance" defaultMessage="Balance" />
                  {':'}
                  <span
                    className="ml-1"
                    title={toReadableNumber(
                      tokens[1].decimals,
                      balances?.[tokens[1].id]
                    )}
                  >
                    {isSignedIn
                      ? toPrecision(
                          toReadableNumber(
                            tokens[1].decimals,
                            balances?.[tokens[1].id]
                          ),
                          2,
                          true
                        )
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center ">
                  <BoostInputAmount
                    className="w-full border border-transparent rounded"
                    max={getMax(
                      tokens[1].id,
                      toReadableNumber(
                        tokens[1].decimals,
                        balances?.[tokens[1].id]
                      )
                    )}
                    onChangeAmount={changeSecondTokenAmount}
                    value={secondTokenAmount}
                    tokenSymbol={
                      <SelectToken
                        tokens={selectTokens}
                        render={render}
                        selected={
                          tokens[1] && (
                            <button className="flex hover:bg-black hover:bg-opacity-20 rounded-lg px-2 py-2.5 items-center text-white hover:text-gradientFrom">
                              <span className="text-white">
                                {toRealSymbol(tokens[1].symbol)}
                              </span>
                              <span className="ml-1">
                                <ArrowDownCur />
                              </span>
                            </button>
                          )
                        }
                        onSelect={(token: TokenMetadata) => {
                          setTokens([tokens[0], token]);
                        }}
                        balances={selectBalances}
                        tokenPriceList={tokenPriceList}
                      />
                    }
                  />
                </div>
              </div>
              {error ? (
                <div className="flex justify-center mb-8 ">
                  <Alert level="warn" message={error.message} />
                </div>
              ) : null}
              {!!pool ? (
                <div className=" text-farmText text-sm mt-6 mb-4  px-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <label>
                      <FormattedMessage
                        id="lp_tokens"
                        defaultMessage={'LP tokens'}
                      />
                    </label>
                    <span className="text-white text-sm">
                      {shareDisplay().lpTokens || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <label>
                      <FormattedMessage id="Share" defaultMessage="Share" />
                    </label>
                    <span className="text-white text-sm">
                      {shareDisplay().shareDisplay || '-'}
                    </span>
                  </div>
                </div>
              ) : null}

              {canDeposit ? (
                <div className=" rounded-md mb-6 px-4 text-center xs:px-2  text-base">
                  <label className="text-warnColor ">
                    <FormattedMessage id="oops" defaultMessage="Oops" />!
                  </label>
                  <label className="ml-2.5 text-warnColor ">
                    {modal?.token?.id === WRAP_NEAR_CONTRACT_ID &&
                    (tokens[0].id === WRAP_NEAR_CONTRACT_ID
                      ? Number(firstTokenBalanceBN) - Number(firstTokenAmount) <
                        0.5
                      : Number(secondTokenBalanceBN) -
                          Number(secondTokenAmount) <
                        0.5) ? (
                      <FormattedMessage id="near_validation_error" />
                    ) : (
                      <>
                        <FormattedMessage id="you_do_not_have_enough" />{' '}
                        {toRealSymbol(modal?.token?.symbol)}.
                      </>
                    )}
                  </label>
                </div>
              ) : null}

              {isSignedIn &&
              candPools?.length < 1 &&
              tokens?.[0].id !== tokens?.[1].id ? (
                <div className="flex bg-black bg-opacity-20 items-center justify-between rounded-md mb-6 py-3 px-4 xs:px-2 border border-warnColor text-sm">
                  <label className="text-warnColor text-base flex items-center">
                    <span className="mr-2">
                      <WarnTriangle />
                    </span>
                    <FormattedMessage
                      id="no_pair_found"
                      defaultMessage={'No pair found'}
                    />
                    !
                  </label>
                  <GradientButton
                    className="px-2.5 py-2"
                    onClick={(e) => {
                      setAddPoolOpen(true);
                      onRequestClose(e);
                    }}
                  >
                    <FormattedMessage id="create_new_pool" />
                  </GradientButton>
                </div>
              ) : null}

              {forStableClass ? (
                <div className="text-white relative bg-black flex flex-col items-center bg-opacity-20  text-sm mt-10 mb-4 border border-gradientFrom p-5 rounded-lg">
                  <div className="absolute z-30  transform  -top-14 left-1/2 -translate-x-1/2">
                    <StableSwapLogo
                      style={{
                        transform: 'scale(0.6)',
                      }}
                    />
                  </div>

                  <div className="absolute top-0 right-5">
                    <GoodIcon />
                  </div>

                  <div className="text-base my-4">
                    <FormattedMessage
                      id="found_stable_pool_in_sauce"
                      defaultMessage={'Found stable pool in SAUCE'}
                    />
                    !
                  </div>

                  <GradientButton
                    className="py-2.5 px-4 mx-auto"
                    onClick={() => {
                      const saucePageTabKey = getStableSwapTabKey(
                        getStablePoolIdByTokens()
                      );
                      localStorage.setItem(saucePageTabKey, 'add_liquidity');
                      openUrl(`/sauce/${getStablePoolIdByTokens()}`);
                    }}
                  >
                    <FormattedMessage
                      id="go_to_sauce"
                      defaultMessage={'Go to SAUCE'}
                    />
                  </GradientButton>
                </div>
              ) : null}
              <FeeTipV1 />
              <ButtonRender />
              <BLACKTip className="mt-2" show={disabled_add} />
            </div>
          </div>

          {/* for candidate list */}
          {candPools?.length > 0 && (
            <div style={{ width: cardWidth }} className="xs:pb-10 xs:mb-10">
              {displayCandPools?.length > 0 ? (
                <div className="grid grid-cols-10 justify-center mt-2.5">
                  <span className="text-addV1PoolTableColor text-sm col-span-4 pl-6">
                    <FormattedMessage id="pool"></FormattedMessage>
                  </span>
                  <span className="text-addV1PoolTableColor text-sm col-span-3 pl-2">
                    <FormattedMessage id="tvl"></FormattedMessage>
                  </span>
                  <span className="text-addV1PoolTableColor text-sm col-span-3 pl-4">
                    <FormattedMessage id="fee"></FormattedMessage>
                  </span>
                </div>
              ) : null}
              {displayCandPools?.slice(0, 3)?.map((p) => {
                return (
                  <MorePoolRow
                    pool={p}
                    key={p.id}
                    canFarm={!!farmV2Counts?.[p.id]}
                    checked={pool?.id === p.id}
                    setPool={setPool}
                  />
                );
              })}
              {displayCandPools?.length > 3 ? (
                <a
                  className="mt-2.5 inline-flex absolute right-0 items-center justify-end text-right text-sm text-primaryText hover:text-gradientFrom"
                  href={`/more_pools/${tokens[0].id},${tokens[1].id}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <span className="mr-1 underline">
                    <FormattedMessage
                      id="more_pools"
                      defaultMessage={'More pools'}
                    />
                  </span>

                  <VEARROW />
                </a>
              ) : null}
            </div>
          )}
        </div>
      </Modal>
      {isSignedIn ? (
        <AddPoolModal
          isOpen={addPoolOpen}
          onRequestClose={(e) => {
            setAddPoolOpen(false);
            props.onRequestClose(e);
          }}
          tokens={selectTokens}
          balances={selectBalances}
          token1Pre={tokens[0]}
          token2Pre={tokens[1]}
        />
      ) : null}
    </>
  );
}
