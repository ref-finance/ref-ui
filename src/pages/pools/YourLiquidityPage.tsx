import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import {
  BorderButton,
  ConnectToNearBtn,
  SolidButton,
  OutlineButton,
} from '~components/button/Button';
import Loading from '~components/layout/Loading';
import { wallet as webWallet } from '~services/near';
import { useTokens } from '~state/token';
import { getPoolBalance, getPoolsBalances, PoolRPCView } from '~services/api';
import {
  toRoundedReadableNumber,
  percent,
  toPrecision,
  toInternationalCurrencySystem,
  toReadableNumber,
  calculateFairShare,
} from '~utils/numbers';
import { usePool } from '~state/pool';
import {
  RemoveLiquidityModal,
  AddLiquidityModal,
  REF_FI_PRE_LIQUIDITY_ID_KEY,
} from './DetailsPage';
import { getPool, getYourPools } from '~services/indexer';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { LP_TOKEN_DECIMALS } from '~services/m-token';

import { canFarm, Pool } from '~services/pool';
import { formatMessage } from '@formatjs/intl';
import { ftGetTokensMetadata, TokenMetadata } from '~services/ft-contract';
import { FarmDot } from '~components/icon';
import { ShareInFarm } from '~components/layout/ShareInFarm';
import { usePoolTVL } from '../../state/pool';
import { multiply, divide } from '../../utils/numbers';
import { STABLE_POOL_ID, STABLE_TOKEN_IDS } from '../../services/near';
import { getStablePoolFromCache, isNotStablePool } from '../../services/pool';
import {
  getCurrentWallet,
  WalletContext,
  getSenderLoginRes,
} from '../../utils/sender-wallet';
import { STABLE_LP_TOKEN_DECIMALS } from '~components/stableswap/AddLiquidity';
import { useTokenBalances } from '../../state/token';
import {
  getURLInfo,
  checkAccountTip,
} from '../../components/layout/transactionTipPopUp';
import { checkTransaction } from '../../services/swap';

function MyShares({
  shares,
  totalShares,
  poolId,
  stakeList = {},
  decimal,
  supportFarm,
  farmStake = '0',
  userTotalShare,
}: {
  shares: string;
  totalShares: string;
  poolId?: number;
  stakeList?: Record<string, string>;
  decimal?: number;
  supportFarm: Number;
  farmStake: string | number;
  userTotalShare: BigNumber;
}) {
  if (!shares || !totalShares) return <div>-</div>;

  let sharePercent = percent(userTotalShare.valueOf(), totalShares);

  let displayPercent;
  if (Number.isNaN(sharePercent) || sharePercent === 0) displayPercent = '0';
  else if (sharePercent < 0.0001)
    displayPercent = `< ${
      decimal ? '0.'.padEnd(decimal + 1, '0') + '1' : '0.0001'
    }`;
  else displayPercent = toPrecision(String(sharePercent), decimal || 4);

  return (
    <div className="h-12 inline-flex flex-col justify-center xs:text-right md:text-right">
      <div className="pl-2 pb-1 xs:pr-0 md:pr-0 text-sm whitespace-nowrap">{`${toRoundedReadableNumber(
        {
          decimals:
            poolId === Number(STABLE_POOL_ID)
              ? STABLE_LP_TOKEN_DECIMALS
              : LP_TOKEN_DECIMALS,
          number: userTotalShare
            .toNumber()
            .toLocaleString('fullwide', { useGrouping: false }),
          precision: decimal || 6,
        }
      )} (${displayPercent}%)`}</div>
      {supportFarm > 0 && (
        <object>
          <Link
            to={{
              pathname: '/farms',
            }}
            target="_blank"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <ShareInFarm
              farmStake={farmStake}
              userTotalShare={userTotalShare}
            />
          </Link>
        </object>
      )}
    </div>
  );
}

function Empty() {
  const { signedInState } = useContext(WalletContext);
  const isSignedIn = signedInState.isSignedIn;

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

  const [stablePool, setStablePool] = useState<PoolRPCView>();

  const { signedInState } = useContext(WalletContext);
  const isSignedIn = signedInState.isSignedIn;
  const senderLoginRes = getSenderLoginRes();
  const history = useHistory();

  if (!senderLoginRes && !webWallet.isSignedIn()) {
    history.push('/');
    return null;
  }

  const [tokensMeta, setTokensMeta] = useState<{}>();

  useEffect(() => {
    if (!pools) return;

    ftGetTokensMetadata(
      (pools?.map((p) => p.token_account_ids).flat() || []).concat(
        STABLE_TOKEN_IDS
      )
    ).then(setTokensMeta);
  }, [pools]);

  useEffect(() => {
    if (isSignedIn) {
      getYourPools().then(setPools);
      getStablePoolFromCache().then((res) => setStablePool(res[0]));
    }
  }, [isSignedIn]);

  if (!pools || !stablePool || !tokensMeta) return <Loading />;

  return (
    <div className="flex items flex-col lg:w-2/3 xl:w-3/5 md:w-5/6 xs:w-11/12 m-auto">
      <div className="w-full flex justify-center self-center">
        {error && <Alert level="warn" message={error.message} />}
      </div>
      {/* PC */}
      <Card width="w-full" padding="px-0 py-6" className="xs:hidden md:hidden">
        <div className="text-white text-xl pr-6 pl-6 lg:pl-10 pb-6">
          <FormattedMessage
            id="your_liquidity"
            defaultMessage="Your Liquidity"
          />
        </div>
        {pools.length > 0 ? (
          <section>
            <div className="">
              <div
                style={{
                  gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
                }}
                className="grid grid-cols-12 md:flex xs:flex md:items-center xs:items-center xs:justify-between md:justify-between py-2 content-center items-center text-xs text-primaryText pr-6 pl-6 lg:pl-10
                xs:border-b xs:border-gray-700 xs:border-opacity-70 md:border-b md:border-gray-700 md:border-opacity-70"
              >
                <div className="col-span-2">
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </div>
                <div className="col-span-2 ">
                  <FormattedMessage id="token" defaultMessage="Token" />
                </div>

                <div className="col-span-3 text-left ml-8 xl:ml-14">
                  <FormattedMessage id="my_shares" defaultMessage="Shares" />
                </div>
                <div className="col-span-6 xl:ml-8 ml-4">
                  <FormattedMessage id="value" defaultMessage="Value" />
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div
                  className="hover:bg-poolRowHover w-full hover:bg-opacity-20"
                  key={Number(STABLE_POOL_ID)}
                >
                  <PoolRow
                    pool={stablePool}
                    tokens={STABLE_TOKEN_IDS.map((id) => tokensMeta[id]) || []}
                  />
                </div>
                {pools.map((pool, i) => (
                  <div
                    key={i}
                    className="hover:bg-poolRowHover w-full hover:bg-opacity-20"
                  >
                    <PoolRow
                      pool={pool}
                      tokens={
                        pool.token_account_ids.map((id) => tokensMeta[id]) || []
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <Empty />
        )}
      </Card>
      {/* Mobile */}
      <div className="text-white text-2xl font-semibold px-4 lg:hidden">
        <FormattedMessage id="your_liquidity" defaultMessage="Your Liquidity" />
      </div>
      {pools.length > 0 ? (
        <div className="lg:hidden">
          <PoolRow
            pool={stablePool}
            key={Number(STABLE_POOL_ID)}
            tokens={STABLE_TOKEN_IDS.map((id) => tokensMeta[id]) || []}
          />

          {pools.map((pool, i) => {
            return (
              <PoolRow
                pool={pool}
                key={i}
                tokens={pool.token_account_ids.map((id) => tokensMeta[id])}
              />
            );
          })}
        </div>
      ) : (
        <Card className="lg:hidden mt-4" width="w-full">
          <Empty />
        </Card>
      )}
    </div>
  );
}

function PoolRow(props: { pool: any; tokens: TokenMetadata[] }) {
  const tokens = props.tokens;

  const { pool, shares, stakeList } = usePool(props.pool.id);

  const poolTVL = usePoolTVL(props.pool.id);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showFunding, setShowFunding] = useState(false);
  const [supportFarm, setSupportFarm] = useState<Number>();
  const [farmStake, setFarmStake] = useState<string | number>('0');

  const history = useHistory();

  useEffect(() => {
    canFarm(Number(props.pool.id), true).then(setSupportFarm);
  }, [props.pool]);

  useEffect(() => {
    const seedIdList: string[] = Object.keys(stakeList);
    let tempFarmStake: string | number = '0';
    seedIdList.forEach((seed) => {
      const id = Number(seed.split('@')[1]);
      if (id == props.pool.id) {
        tempFarmStake = BigNumber.sum(farmStake, stakeList[seed]).valueOf();
      }
    });
    setFarmStake(tempFarmStake);
  }, [stakeList]);

  const userTotalShare = BigNumber.sum(shares, farmStake);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString('fullwide', { useGrouping: false });

  const usdValue = useMemo(() => {
    try {
      if (!userTotalShareToString || typeof poolTVL !== 'number' || !pool)
        return '-';

      const rawRes = multiply(
        userTotalShareToString,
        divide(poolTVL.toString(), pool.shareSupply)
      );
      return `$${toInternationalCurrencySystem(rawRes, 2)}`;
    } catch (error) {
      return '-';
    }
  }, [poolTVL, userTotalShareToString, pool]);

  if (!pool) return <div />;

  if (!(userTotalShare.toNumber() > 0)) return null;

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
          {tokenAmountShare(pool, token, userTotalShareToString)}
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
          {tokenAmountShare(pool, token, userTotalShareToString)}
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

  return (
    <>
      {/* PC */}
      <Link
        style={{
          gridTemplateColumns: 'repeat(13, minmax(0, 1fr))',
        }}
        className="xs:hidden md:hidden grid grid-cols-12 py-5 content-center items-center text-sm text-white pl-10 pr-6 border-t border-gray-700 border-opacity-70 cursor-pointer"
        to={{ pathname: `/pool/${pool.id}` }}
      >
        <div className="col-span-2 inline-flex items-center">
          <div className="w-16 flex items-center ml-1">{Images}</div>
        </div>

        <div className="col-span-2 inline-flex flex-col text-xs">
          {tokens.map((token, i) => (
            <TokenInfoPC key={i} token={token} />
          ))}
        </div>

        <div className="col-span-3  text-left pl-6 xl:pl-12">
          <MyShares
            shares={shares}
            totalShares={pool.shareSupply}
            decimal={2}
            stakeList={stakeList}
            poolId={pool.id}
            supportFarm={supportFarm}
            userTotalShare={userTotalShare}
            farmStake={farmStake}
          />
        </div>

        <div className="col-span-2 text-left ml-4 xl:ml-8">{usdValue}</div>

        <div className="flex items-center justify-end 2xl:justify-center text-center  col-span-4 ">
          <div className="flex items-center justify-end flex-wrap">
            <SolidButton
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                if (isNotStablePool(pool)) {
                  setShowFunding(true);
                } else {
                  history.push('/stableswap', { stableTab: 'add_liquidity' });
                }
              }}
              className="text-xs col-span-2 w-36 text-center mb-1"
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
                  history.push('/stableswap', {
                    stableTab: 'remove_liquidity',
                  });
                }

                setShowWithdraw(true);
              }}
              className="text-xs px-4 col-span-2 w-24 text-center ml-2 mb-1"
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
          <div className="flex items-center pb-4 border-b border-gray-700 border-opacity-70 px-6">
            <div className="ml-1 mr-4 flex items-center">{Images}</div>
            <div className="text-xs font-semibold">
              <TokensSymbolsMobile tokens={tokens} />
            </div>
          </div>
          <div className="flex flex-col text-sm border-b border-gray-700 border-opacity-70 px-6">
            {tokens.map((token, i) => (
              <TokenInfoMobile key={i} token={token} />
            ))}
          </div>

          <div className="flex items justify-between border-b border-gray-700 border-opacity-70 px-6 py-2">
            <div className="text-gray-400 text-sm">
              <FormattedMessage id="my_shares" defaultMessage="Shares" />
            </div>

            <div>
              <MyShares
                shares={shares}
                totalShares={pool.shareSupply}
                decimal={2}
                poolId={pool.id}
                stakeList={stakeList}
                supportFarm={supportFarm}
                userTotalShare={userTotalShare}
                farmStake={farmStake}
              />
            </div>
          </div>

          <div className="flex border-b justify-between border-gray-700 border-opacity-70 p-6">
            <div className="text-gray-400 text-sm">
              <FormattedMessage id="value" defaultMessage="Value" />
            </div>
            <div>{usdValue}</div>
          </div>

          <div className="mt-4 flex items-center justify-center px-6 py-2">
            <div className="">
              <SolidButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  if (isNotStablePool(pool)) {
                    setShowFunding(true);
                  } else {
                    history.push('/stableswap', { stableTab: 'add_liquidity' });
                  }
                }}
                className="text-sm w-44 mr-4"
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
                    history.push('/stableswap', {
                      stableTab: 'remove_liquidity',
                    });
                  }
                }}
                className="text-sm w-24"
              >
                <FormattedMessage id="remove" defaultMessage="Remove" />
              </OutlineButton>
            </div>
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
