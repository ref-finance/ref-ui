import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import Modal from 'react-modal';

import {
  ConnectToNearBtn,
  SolidButton,
  OutlineButton,
} from '~components/button/Button';
import Loading from '~components/layout/Loading';
import {
  AllStableTokenIds,
  BTC_STABLE_POOL_ID,
  CUSD_STABLE_POOL_ID,
  LINEAR_POOL_ID,
  STNEAR_POOL_ID,
  wallet as webWallet,
} from '~services/near';
import { PoolRPCView } from '~services/api';
import {
  toRoundedReadableNumber,
  percent,
  toPrecision,
  toInternationalCurrencySystem,
  calculateFairShare,
  toReadableNumber,
  ONLY_ZEROS,
  calculateFeePercent,
} from '~utils/numbers';
import { usePool, usePools } from '~state/pool';
import {
  RemoveLiquidityModal,
  AddLiquidityModal,
  REF_FI_PRE_LIQUIDITY_ID_KEY,
} from './DetailsPage';
import { getTokenPriceList, getYourPools } from '~services/indexer';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { LP_TOKEN_DECIMALS } from '~services/m-token';

import { addLiquidityToPool, canFarm, Pool } from '~services/pool';
import {
  ftGetTokensMetadata,
  REF_META_DATA,
  TokenMetadata,
} from '~services/ft-contract';
import { ShareInFarm } from '~components/layout/ShareInFarm';
import {
  usePoolTVL,
  useYourliquidity,
  useAllStablePools,
} from '../../state/pool';
import {
  multiply,
  divide,
  scientificNotationToString,
} from '../../utils/numbers';
import {
  STABLE_POOL_USN_ID,
  isStablePool,
  ALL_STABLE_POOL_IDS,
} from '../../services/near';
import { STABLE_POOL_ID } from '../../services/near';
import { isNotStablePool, canFarmV2 } from '../../services/pool';
import {
  WalletContext,
  getSenderLoginRes,
} from '../../utils/wallets-integration';
import { getFarmsCount, getEndedFarmsCount } from '../../services/pool';
import { STABLE_LP_TOKEN_DECIMALS } from '~components/stableswap/AddLiquidity';
import { useStabelPoolData } from '../../state/sauce';
import {
  useFarmStake,
  useAllFarms,
  useCanFarmV2,
  useCanFarmV1,
} from '../../state/farm';

import { PoolTab } from '~components/pool/PoolTab';

import { getStablePoolDecimal } from '~pages/stable/StableSwapEntry';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { getVEPoolId } from '../ReferendumPage';
import { useAccountInfo } from '~state/referendum';
import { VEARROW, RewardCheck } from '../../components/icon/Referendum';
import { toNonDivisibleNumber } from '../../utils/numbers';
import { LOVE_TOKEN_DECIMAL } from '../../state/referendum';
import getConfig from '../../services/config';
import { useStakeListByAccountId, useBatchTotalShares } from '../../state/pool';
import { getPoolsByIds, getPoolsByTokensIndexer } from '../../services/indexer';
import { parsePool } from '../../services/pool';
import { usePoolShareRaw } from '../../state/pool';
import { createContext } from 'react';
import { useClientMobile, isClientMobie } from '../../utils/device';
import _, { method } from 'lodash';
import {
  GradientButton,
  ButtonTextWrapper,
} from '../../components/button/Button';
import ReactModal from 'react-modal';
import { ModalClose } from '../../components/icon/ModalClose';
import { unwrapedNear, WRAP_NEAR_CONTRACT_ID } from '~services/wrap-near';
import { BoostInputAmount } from '../../components/forms/InputAmount';
import SelectToken from '../../components/forms/SelectToken';
import { useRainbowWhitelistTokens, useTokenBalances } from '../../state/token';
import { ArrowDownCur, ArrowDownWhite } from '../../components/icon/Arrows';
import {
  getDepositableBalance,
  useWalletTokenBalances,
  useDepositableBalance,
} from '../../state/token';
import { WarnTriangle } from '~components/icon';
import { isSameStableClass } from '~components/swap/SwapCard';
import { StableSwapLogo } from '~components/icon/StableSwap';
import { GoodIcon } from '../../components/icon/Common';
import { AddPoolModal } from './AddPoolPage';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { getCurrentWallet } from '../../utils/wallets-integration';
import { checkTransactionStatus } from '../../services/swap';
import { getStableSwapTabKey } from '~pages/stable/StableSwapPageUSN';
const StakeListContext = createContext(null);

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

  let sharePercent = percent(userTotalShare.valueOf(), totalShares);

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

function Empty() {
  return (
    <div className="px-6">
      <div className="text-center font-semibold text-xs my-10 text-primaryText">
        <FormattedMessage
          id="your_positions_will_be_displayed_here"
          defaultMessage="Your position(s) will be displayed here."
        />
      </div>
    </div>
  );
}

function AddLiquidityButton() {
  const history = useHistory();

  return (
    <SolidButton onClick={() => history.push('/pools')} className="w-full">
      <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
    </SolidButton>
  );
}

export function YourLiquidityPage() {
  const [error, setError] = useState<Error>();
  const [pools, setPools] = useState<PoolRPCView[]>();

  const { v1Farm, v2Farm } = useAllFarms();

  const [generalAddLiquidity, setGeneralAddLiquidity] =
    useState<boolean>(false);

  const { globalState } = useContext(WalletContext);
  const history = useHistory();

  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();
  const isSignedIn = !!accountId;

  const { txHash } = getURLInfo();

  useEffect(() => {
    if (txHash && getCurrentWallet()?.wallet?.isSignedIn()) {
      checkTransactionStatus(txHash).then((res) => {
        console.log(res);

        const transaction = res.transaction;
        const methodName =
          transaction?.actions[0]?.['FunctionCall']?.method_name;

        const status: any = res.status;
        const data: string | undefined = status.SuccessValue;
        if (data && methodName === 'add_simple_pool') {
          const buff = Buffer.from(data, 'base64');
          const pool_id = buff.toString('ascii');
          history.push(`/pool/${pool_id}`);
        }
      });
    }
  }, [txHash]);

  if (!isSignedIn) {
    history.push('/');
    return null;
  }

  const [stablePools, setStablePools] = useState<PoolRPCView[]>();

  const [tvls, setTvls] = useState<Record<string, number>>();

  const isClientMobile = useClientMobile();

  const { finalStakeList, stakeList, v2StakeList } = useStakeListByAccountId();

  const { lptAmount } = !!getConfig().REF_VE_CONTRACT_ID
    ? useAccountInfo()
    : { lptAmount: '0' };

  const { batchTotalShares, shares: batchStableShares } = useBatchTotalShares(
    stablePools?.map((p) => p.id),
    finalStakeList
  );

  const { batchTotalShares: batchTotalSharesSimplePools, shares: batchShares } =
    useBatchTotalShares(
      pools?.map((p) => p.id),
      finalStakeList
    );

  const [tokensMeta, setTokensMeta] = useState<{}>();

  useEffect(() => {
    const ids = ALL_STABLE_POOL_IDS;

    getPoolsByIds({ pool_ids: ids }).then((res) => {
      setStablePools(res);
    });
  }, []);

  useEffect(() => {
    if (!pools) return;

    ftGetTokensMetadata(
      (pools.map((p) => p.token_account_ids).flat() || []).concat(
        AllStableTokenIds
      )
    ).then(setTokensMeta);

    getPoolsByIds({ pool_ids: pools.map((p) => p.id.toString()) }).then(
      (res) => {
        setTvls(
          res
            .map((p) => p.tvl)
            .reduce((pre, cur, i) => {
              return {
                ...pre,
                [res[i].id]: cur,
              };
            }, {})
        );
      }
    );
  }, [pools]);

  useEffect(() => {
    if (!isSignedIn) return;

    getYourPools().then((res) => {
      setPools(res.filter((p) => !isStablePool(p.id.toString())));
    });
  }, [isSignedIn]);

  if (!pools || !tokensMeta || !v1Farm || !v2Farm) return <Loading />;

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
        <StakeListContext.Provider
          value={{
            stakeList,
            finalStakeList,
            v2StakeList,
          }}
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
        </StakeListContext.Provider>
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
      <StakeListContext.Provider
        value={{
          stakeList,
          finalStakeList,
          v2StakeList,
        }}
      >
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
      </StakeListContext.Provider>
    );
  };

  const vePool = pools.find((p) => Number(p.id) === Number(getVEPoolId()));

  const count =
    batchTotalSharesSimplePools
      .map((n, i) =>
        n + Number(pools?.[i].id) === Number(getVEPoolId())
          ? Number(lptAmount) + n
          : n
      )
      .reduce((acc, cur) => {
        return cur > 0 ? acc + 1 : acc;
      }, 0) +
    batchTotalShares.reduce((acc, cur) => (cur > 0 ? acc + 1 : acc), 0);

  return (
    <>
      <PoolTab count={count}></PoolTab>
      <div className="flex items flex-col lg:w-2/3 xl:w-3/5 md:w-5/6 xs:w-11/12 m-auto">
        <div className="w-full flex justify-center self-center">
          {error && <Alert level="warn" message={error.message} />}
        </div>
        {/* PC */}

        <Card
          width="w-full"
          padding="px-0 py-6"
          className="xs:hidden md:hidden"
        >
          <div className="text-white text-xl pr-6 pl-6 lg:pl-10 lg:pr-8 pt-3 pb-6 flex items-center justify-between">
            <span>
              <FormattedMessage
                id="your_liquidity"
                defaultMessage="Your Liquidity"
              />
              ({count})
            </span>

            <GradientButton
              className="px-4 py-1.5 text-sm"
              onClick={() => {
                setGeneralAddLiquidity(true);
              }}
            >
              <FormattedMessage
                id="add_liquidity"
                defaultMessage={'Add Liquidity'}
              />
            </GradientButton>
          </div>

          {(batchTotalSharesSimplePools?.some((s) => s > 0) ||
            batchTotalShares?.some((s) => s > 0)) &&
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

                  <div className="flex flex-col col-span-5 text-left ml-8">
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
                    <FormattedMessage id="value" defaultMessage="Value" />
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {!vePool || !getConfig().REF_VE_CONTRACT_ID
                    ? null
                    : [vePool].map((p) => {
                        return (
                          <RowRender
                            p={p}
                            ids={p.token_account_ids}
                            shares={
                              batchShares?.[
                                pools.findIndex((p2) => p2.id === vePool.id)
                              ] || ''
                            }
                          />
                        );
                      })}

                  {batchTotalShares &&
                    batchTotalShares?.some((s) => s > 0) &&
                    stablePools?.map((p, i) => {
                      return (
                        <RowRender
                          p={p}
                          ids={p.token_account_ids}
                          shares={batchStableShares?.[i] || ''}
                        />
                      );
                    })}

                  {pools
                    .filter(
                      (p) =>
                        !getConfig().REF_VE_CONTRACT_ID ||
                        !vePool ||
                        p.id !== vePool.id
                    )
                    .map((p, i) => {
                      return (
                        <RowRender
                          shares={batchShares?.[i] || ''}
                          p={p}
                          ids={p.token_account_ids}
                        />
                      );
                    })}
                </div>
              </div>
            </section>
          ) : (
            <Empty />
          )}
        </Card>
        {/* Mobile */}

        {(batchTotalSharesSimplePools?.some((s) => s > 0) ||
          batchTotalShares?.some((s) => s > 0)) &&
        isClientMobile ? (
          <div className="lg:hidden">
            {!vePool || !getConfig().REF_VE_CONTRACT_ID
              ? null
              : [vePool].map((p) => {
                  return (
                    <RowRenderMobile
                      shares={
                        batchShares?.[
                          pools.findIndex((p2) => p2.id === vePool.id)
                        ] || ''
                      }
                      p={p}
                      ids={p.token_account_ids}
                    />
                  );
                })}

            {batchTotalShares &&
              batchTotalShares?.some((s) => s > 0) &&
              stablePools?.map((p, i) => {
                return (
                  <RowRenderMobile
                    shares={batchStableShares?.[i] || ''}
                    p={p}
                    ids={p.token_account_ids}
                  />
                );
              })}

            {pools
              .filter(
                (p) =>
                  !getConfig().REF_VE_CONTRACT_ID ||
                  !vePool ||
                  p.id !== vePool.id
              )
              .map((p, i) => {
                return (
                  <RowRenderMobile
                    shares={batchShares?.[i] || ''}
                    p={p}
                    ids={p.token_account_ids}
                  />
                );
              })}
          </div>
        ) : (
          <Card className="lg:hidden mt-4" width="w-full">
            <Empty />
          </Card>
        )}
        <GradientButton
          className="px-4 py-1.5 text-sm text-white lg:hidden"
          onClick={() => {
            setGeneralAddLiquidity(true);
          }}
        >
          <FormattedMessage
            id="add_liquidity"
            defaultMessage={'Add Liquidity'}
          />
        </GradientButton>
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

  const poolId = pool.id;

  const tokens = props.tokens;
  const lptAmount = props.lptAmount;
  const poolTVL = pool.tvl || props.tvl;

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showFunding, setShowFunding] = useState(false);
  const supportFarmV1 = props.supportFarmV1;
  const supportFarmV2 = props.supportFarmV2;

  const history = useHistory();

  const { stakeList, v2StakeList, finalStakeList } =
    useContext(StakeListContext);

  const farmStakeV1 = useFarmStake({ poolId, stakeList });
  const farmStakeV2 = useFarmStake({ poolId, stakeList: v2StakeList });
  const farmStakeTotal = useFarmStake({ poolId, stakeList: finalStakeList });

  const userTotalShare = BigNumber.sum(shares, farmStakeTotal);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString('fullwide', { useGrouping: false });

  const usdValue = useMemo(() => {
    try {
      if (!userTotalShareToString || typeof poolTVL !== 'number' || !pool)
        return '-';

      const rawRes = multiply(
        new BigNumber(userTotalShareToString)
          .plus(Number(getVEPoolId()) === Number(pool.id) ? lptAmount : '0')
          .toNumber()
          .toFixed(),
        divide(poolTVL.toString(), pool?.shareSupply)
      );
      return `$${toInternationalCurrencySystem(rawRes, 2)}`;
    } catch (error) {
      return '-';
    }
  }, [poolTVL, userTotalShareToString, pool]);

  if (
    userTotalShare
      .plus(Number(getVEPoolId()) === Number(pool.id) ? lptAmount || '0' : '0')
      .eq(new BigNumber(0))
  )
    return null;

  const Images = tokens.map((token, index) => {
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
        <div className="font-semibold">{toRealSymbol(token.symbol)}</div>
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

  return (
    <>
      {/* PC */}
      <Link
        style={{
          gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
        }}
        className="xs:hidden md:hidden grid  py-5 content-center items-center text-sm text-white px-8 border-t border-gray-700 border-opacity-70 cursor-pointer"
        to={{ pathname: `/pool/${pool.id}` }}
      >
        <div className="col-span-2 inline-flex items-start flex-col relative">
          <div className="w-16 flex items-center ml-1">{Images}</div>
          <div className="absolute text-xs top-10 text-primaryText">
            {isStablePool(pool.id) ? (
              <FormattedMessage id="stable_pool" defaultMessage="StablePool" />
            ) : null}
          </div>
        </div>

        <div className="col-span-2 inline-flex flex-col text-xs">
          {tokens.map((token, i) => (
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
                <span className="underline">
                  <FormattedMessage id="farm" defaultMessage={'Farm'} />
                  &nbsp; V1
                </span>

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
                  <FormattedMessage id="farm" defaultMessage={'Farm'} />
                  &nbsp; V2
                </span>

                <span className="ml-0.5">
                  <VEARROW />
                </span>
              </div>
            </Link>
          )}
          {Number(getVEPoolId()) === Number(pool.id) &&
          !!getConfig().REF_VE_CONTRACT_ID ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open('/referendum');
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
                  <FormattedMessage id="dao" defaultMessage={'DAO'} />
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
                    isStablePool(pool.id) ? getStablePoolDecimal(pool.id) : 24,
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
            <SolidButton
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                if (isNotStablePool(pool)) {
                  setShowFunding(true);
                } else {
                  history.push(`/sauce/${pool.id}`, {
                    stableTab: 'add_liquidity',
                  });
                }
              }}
              className="text-xs col-span-2 px-1.5 text-center whitespace-nowrap mb-3"
              style={{
                minWidth: '104px',
              }}
            >
              <FormattedMessage
                id="add_liquidity"
                defaultMessage="Add Liquidity"
              />
            </SolidButton>

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
              className="text-xs w-full px-4 col-span-2 text-center h-8 mb-1"
              style={{
                minWidth: '104px',
              }}
            >
              <FormattedMessage id="remove" defaultMessage="Remove" />
            </OutlineButton>
          </div>
        </div>
      </Link>
      {/* Mobile */}

      <Link
        className="lg:hidden pb-2 px-6 text-sm text-white cursor-pointer"
        to={{ pathname: `/pool/${pool.id}` }}
      >
        <Card width="w-full" padding="py-4 px-0">
          <div className="flex flex-col items-start pb-4 border-b border-gray-700 border-opacity-70 px-6">
            <div className="flex items-center">
              <div className="ml-1 mr-4 flex items-center">{Images}</div>
              <div className="text-xs font-semibold">
                <TokensSymbolsMobile tokens={tokens} />
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
            {tokens.map((token, i) => (
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
                    <span className="ml-1">V1</span>
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
                    <FormattedMessage id="farm" defaultMessage={'Farm'} />
                    <span className="ml-1">V2</span>
                  </span>
                  <span className="text-gradientFrom ml-0.5">
                    <VEARROW />
                  </span>
                </Link>
              )}
              {Number(getVEPoolId()) === Number(pool.id) &&
              !!getConfig().REF_VE_CONTRACT_ID ? (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open('/referendum');
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
                    <FormattedMessage id="dao" defaultMessage={'DAO'} />
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
            <SolidButton
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                if (isNotStablePool(pool)) {
                  setShowFunding(true);
                } else {
                  history.push(`/sauce/${pool.id}`, {
                    stableTab: 'add_liquidity',
                  });
                }
              }}
              className="text-sm mr-4 h-8 py-0.5 px-1"
              style={{
                minWidth: '112px',
              }}
            >
              <FormattedMessage
                id="add_liquidity"
                defaultMessage="Add Liquidity"
              />
            </SolidButton>

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
            className="bg-gradientFrom ml-2 xs:ml-1 text-black whitespace-nowrap text-sm px-1 py-0.5 flex items-center hover:bg-senderHot rounded-md"
          >
            <FormattedMessage id="farm" />
            <span className="ml-1">
              <VEARROW />
            </span>
          </a>
        )}
      </span>

      <span className="flex items-center col-span-4">
        <FormattedMessage id="tvl" />
        <span className={`ml-2 ${checked ? 'text-white' : ''}`}>
          ${toInternationalCurrencySystem(pool.tvl.toString(), 2)}
        </span>
      </span>

      <span className="flex items-center justify-self-end col-span-2">
        <FormattedMessage id="fee" defaultMessage={'Fee'} />
        <span className={`ml-2 ${checked ? 'text-white' : ''}`}>
          {`${toPrecision(calculateFeePercent(pool.fee).toString(), 2)}`}%
        </span>
      </span>
    </div>
  );
}

function YourLiquidityAddLiquidityModal(
  props: ReactModal.Props & {
    stablePools: PoolRPCView[];
  }
) {
  const { isOpen, onRequestClose, stablePools } = props;

  const [addPoolOpen, setAddPoolOpen] = useState<boolean>(false);

  const [pool, setPool] = useState<Pool>();

  const [candPools, setCandPools] = useState<Pool[]>();
  const selectTokens = useRainbowWhitelistTokens();

  const selectBalances = useTokenBalances();
  const [farmV2Counts, setFarmV2Counts] = useState<Record<string, number>>();

  useEffect(() => {
    if (!candPools) return;
    Promise.all(candPools.map((p) => canFarmV2(p.id))).then((res) => {
      setFarmV2Counts(
        res
          .map((r) => r.count)
          .reduce((acc, cur, i) => {
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

  function validate({
    firstAmount,
    secondAmount,
  }: {
    firstAmount: string;
    secondAmount: string;
  }) {
    const firstTokenAmountBN = new BigNumber(firstAmount.toString());
    const firstTokenBalanceBN = new BigNumber(
      getMax(
        tokens[0].id,
        toReadableNumber(tokens[0].decimals, balances?.[tokens[0].id] || '0')
      )
    );
    const secondTokenAmountBN = new BigNumber(secondAmount.toString());
    const secondTokenBalanceBN = new BigNumber(
      getMax(
        tokens[1].id,
        toReadableNumber(tokens[1].decimals, balances?.[tokens[1].id] || '0')
      )
    );

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
          !canSubmit || canDeposit || !pool || tokens[0].id === tokens[1].id
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

  const getMax = function (id: string, amount: string) {
    return id !== WRAP_NEAR_CONTRACT_ID
      ? amount
      : Number(amount) <= 0.5
      ? '0'
      : String(Number(amount) - 0.5);
  };

  const render = (token: TokenMetadata) => {
    return toRoundedReadableNumber({
      decimals: token.decimals,
      number: balances ? balances[token.id] : '0',
    });
  };

  const getStablePoolIdByTokens = () => {
    console.log(tokens, stablePools);
    return (
      stablePools.find((p) => {
        return (
          p.token_account_ids.includes(tokens[0].id) &&
          p.token_account_ids.includes(tokens[1].id)
        );
      }).id || -1
    );
  };

  if (!selectTokens) return <Loading />;

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
                    {toPrecision(
                      toReadableNumber(
                        tokens[0].decimals,
                        balances?.[tokens[0].id]
                      ),
                      2,
                      true
                    )}
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
                    {toPrecision(
                      toReadableNumber(
                        tokens[1].decimals,
                        balances?.[tokens[1].id]
                      ),
                      2,
                      true
                    )}
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
                    <FormattedMessage id="you_do_not_have_enough" />{' '}
                    {toRealSymbol(modal?.token?.symbol)}.
                  </label>
                </div>
              ) : null}

              {candPools?.length < 1 && tokens?.[0].id !== tokens?.[1].id ? (
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
                      window.open(`/sauce/${getStablePoolIdByTokens()}`);
                    }}
                  >
                    <FormattedMessage
                      id="go_to_sauce"
                      defaultMessage={'Go to SAUCE'}
                    />
                  </GradientButton>
                </div>
              ) : null}

              <ButtonRender />
            </div>
          </div>

          {/* for candidate list */}
          {candPools?.length > 0 && (
            <div style={{ width: cardWidth }} className="xs:pb-10 xs:mb-10">
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
    </>
  );
}
