import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
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
} from '~utils/numbers';
import { usePool } from '~state/pool';
import {
  RemoveLiquidityModal,
  AddLiquidityModal,
  REF_FI_PRE_LIQUIDITY_ID_KEY,
} from './DetailsPage';
import { getYourPools } from '~services/indexer';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { LP_TOKEN_DECIMALS } from '~services/m-token';

import { canFarm, Pool } from '~services/pool';
import { ftGetTokensMetadata, TokenMetadata } from '~services/ft-contract';
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
import { STABLE_POOL_USN_ID, isStablePool } from '../../services/near';
import { STABLE_POOL_ID } from '../../services/near';
import {
  isNotStablePool,
  getFarmsCount,
  getEndedFarmsCount,
} from '../../services/pool';
import { WalletContext, getSenderLoginRes } from '../../utils/sender-wallet';
import { STABLE_LP_TOKEN_DECIMALS } from '~components/stableswap/AddLiquidity';
import { useStabelPoolData } from '../../state/sauce';
import { useFarmStake, useAllFarms, useCanFarmV2 } from '../../state/farm';

import { PoolTab } from '~components/pool/PoolTab';

import { getStablePoolDecimal } from '~pages/stable/StableSwapEntry';
import { getVEPoolId } from '../ReferendumPage';
import { useAccountInfo } from '~state/referendum';
import { VEARROW } from '../../components/icon/Referendum';
import { toNonDivisibleNumber } from '../../utils/numbers';
import { LOVE_TOKEN_DECIMAL } from '../../state/referendum';

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
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  return (
    <div className="px-6">
      <div className="text-center font-semibold text-xs mb-4 text-primaryText">
        <FormattedMessage
          id="your_positions_will_be_displayed_here"
          defaultMessage="Your position(s) will be displayed here."
        />
      </div>
      {isSignedIn ? <AddLiquidityButton /> : <ConnectToNearBtn />}
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

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const senderLoginRes = getSenderLoginRes();
  const history = useHistory();

  const { lptAmount } = useAccountInfo();

  const { poolData: pool3tokenData } = useStabelPoolData(STABLE_POOL_ID);

  const { poolData: USNPoolData } = useStabelPoolData(STABLE_POOL_USN_ID);

  const { poolData: BTCPoolData } = useStabelPoolData(BTC_STABLE_POOL_ID);

  const { poolData: CUSDPoolData } = useStabelPoolData(CUSD_STABLE_POOL_ID);

  const { poolData: STNEARPoolData } = useStabelPoolData(STNEAR_POOL_ID);

  const { poolData: LINEARPoolData } = useStabelPoolData(LINEAR_POOL_ID);

  if (!senderLoginRes && !webWallet.isSignedIn()) {
    history.push('/');
    return null;
  }

  const [tokensMeta, setTokensMeta] = useState<{}>();

  useEffect(() => {
    if (!pools) return;

    ftGetTokensMetadata(
      (pools.map((p) => p.token_account_ids).flat() || []).concat(
        AllStableTokenIds
      )
    ).then(setTokensMeta);
  }, [pools]);

  useEffect(() => {
    if (isSignedIn) {
      getYourPools().then((res) =>
        setPools(res.filter((p) => !isStablePool(p.id.toString())))
      );
    }
  }, [isSignedIn]);

  if (
    !pools ||
    !pool3tokenData ||
    !USNPoolData ||
    !BTCPoolData ||
    !CUSDPoolData ||
    !tokensMeta ||
    !v1Farm ||
    !v2Farm ||
    !STNEARPoolData ||
    !LINEARPoolData ||
    !tokensMeta
  )
    return <Loading />;

  const stablePoolsData = [
    pool3tokenData,
    USNPoolData,
    BTCPoolData,
    CUSDPoolData,
    STNEARPoolData,
    LINEARPoolData,
  ];

  const stablePools = [
    pool3tokenData.pool,
    USNPoolData.pool,
    BTCPoolData.pool,
    CUSDPoolData.pool,
    STNEARPoolData.pool,
    LINEARPoolData.pool,
  ];

  const RowRender = ({ p, ids }: { p: Pool | PoolRPCView; ids: string[] }) => {
    const supportFarmV1 = getFarmsCount(p.id.toString(), v1Farm);

    const supportFarmV2 = getFarmsCount(p.id.toString(), v2Farm);

    const endedFarmV2 = getEndedFarmsCount(p.id.toString(), v2Farm);
    return (
      <div
        className="hover:bg-poolRowHover w-full hover:bg-opacity-20"
        key={Number(p.id)}
      >
        <PoolRow
          pool={p}
          tokens={ids.map((id) => tokensMeta[id]) || []}
          supportFarmV1={supportFarmV1}
          supportFarmV2={supportFarmV2}
          onlyEndedFarmV2={endedFarmV2 === supportFarmV2}
          lptAmount={lptAmount}
        />
      </div>
    );
  };
  const RowRenderMobile = ({
    p,
    ids,
  }: {
    p: Pool | PoolRPCView;
    ids: string[];
  }) => {
    const supportFarmV1 = getFarmsCount(p.id.toString(), v1Farm);

    const supportFarmV2 = getFarmsCount(p.id.toString(), v2Farm);

    const endedFarmV2 = getEndedFarmsCount(p.id.toString(), v2Farm);
    return (
      <PoolRow
        pool={p}
        tokens={ids.map((id) => tokensMeta[id]) || []}
        supportFarmV1={supportFarmV1}
        supportFarmV2={supportFarmV2}
        onlyEndedFarmV2={endedFarmV2 === supportFarmV2}
        lptAmount={lptAmount}
      />
    );
  };

  const vePool = pools.find((p) => Number(p.id) === Number(getVEPoolId()));

  return (
    <>
      <PoolTab></PoolTab>
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
          <div className="text-white text-xl pr-6 pl-6 lg:pl-10 pb-6">
            <FormattedMessage
              id="your_liquidity"
              defaultMessage="Your Liquidity"
            />
          </div>
          {pools.length > 0 ||
          stablePoolsData.some((pd) => Number(pd.userTotalShare) > 0) ? (
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
                  {!vePool
                    ? null
                    : [vePool].map((p) => {
                        return <RowRender p={p} ids={p.token_account_ids} />;
                      })}

                  {stablePools.map((p) => {
                    return <RowRender p={p} ids={p.tokenIds} />;
                  })}

                  {pools
                    .filter((p) => !vePool || p.id !== vePool.id)
                    .map((p, i) => {
                      return <RowRender p={p} ids={p.token_account_ids} />;
                    })}
                </div>
              </div>
            </section>
          ) : (
            <Empty />
          )}
        </Card>
        {/* Mobile */}
        <div className="text-white text-2xl font-semibold px-4 lg:hidden">
          <FormattedMessage
            id="your_liquidity"
            defaultMessage="Your Liquidity"
          />
        </div>
        {pools.length > 0 ||
        stablePoolsData.some((pd) => Number(pd.userTotalShare) > 0) ? (
          <div className="lg:hidden">
            {!vePool
              ? null
              : [vePool].map((p) => {
                  return <RowRenderMobile p={p} ids={p.token_account_ids} />;
                })}

            {stablePools.map((p) => {
              return <RowRenderMobile p={p} ids={p.tokenIds} />;
            })}

            {pools
              .filter((p) => !vePool || p.id !== vePool.id)
              .map((p, i) => {
                return <RowRenderMobile p={p} ids={p.token_account_ids} />;
              })}
          </div>
        ) : (
          <Card className="lg:hidden mt-4" width="w-full">
            <Empty />
          </Card>
        )}
      </div>
    </>
  );
}

function PoolRow(props: {
  pool: any;
  tokens: TokenMetadata[];
  supportFarmV1: number;
  supportFarmV2: number;
  onlyEndedFarmV2: boolean;
  lptAmount?: string;
}) {
  const tokens = props.tokens;
  const lptAmount = props.lptAmount;
  const poolTVL = usePoolTVL(props.pool.id);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showFunding, setShowFunding] = useState(false);
  const supportFarmV1 = props.supportFarmV1;
  const supportFarmV2 = props.supportFarmV2;

  const history = useHistory();

  const {
    pool,
    shares,
    farmStakeV1,
    farmStakeV2,
    userTotalShare,
    userTotalShareToString,
  } = useYourliquidity(Number(props.pool.id));

  const usdValue = useMemo(() => {
    try {
      if (!userTotalShareToString || typeof poolTVL !== 'number' || !pool)
        return '-';

      const rawRes = multiply(
        new BigNumber(userTotalShareToString)
          .plus(Number(getVEPoolId()) === Number(pool.id) ? lptAmount : '0')
          .toNumber()
          .toFixed(),
        divide(poolTVL.toString(), pool.shareSupply)
      );
      return `$${toInternationalCurrencySystem(rawRes, 2)}`;
    } catch (error) {
      return '-';
    }
  }, [poolTVL, userTotalShareToString, pool]);

  if (!pool) return null;

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
          {supportFarmV1 > 0 && (
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

          {supportFarmV2 > 0 && (
            <Link
              to={{
                pathname: `/farmsBoost/${pool.id}-${
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
          {Number(getVEPoolId()) === Number(pool.id) ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open('/referendum');
              }}
              className="text-primaryText mb-1.5 flex"
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
        className="lg:hidden pb-4 px-6 text-sm text-white cursor-pointer"
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

              {supportFarmV1 > 0 && (
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

              {supportFarmV2 > 0 && (
                <Link
                  to={{
                    pathname: `/farmsBoost/${pool.id}-${
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
              {Number(getVEPoolId()) === Number(pool.id) ? (
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
