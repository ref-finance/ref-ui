import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import { GreenButton, GrayButton } from '~components/button/Button';
import { Balances } from '~components/deposit/Deposit';
import {
  useTokenBalances,
  useUserRegisteredTokens,
  useTokens,
} from '~state/token';
import Loading from '~components/layout/Loading';
import { getLatestActions, getYourPools } from '~services/indexer';
import { toPrecision, toReadableNumber } from '~utils/numbers';
import { usePool } from '~state/pool';
import { getPoolBalance } from '~services/api';
import { RemoveLiquidityModal } from './pools/DetailsPage';
import { TokenMetadata } from '~services/ft-contract';
import { TokenBalancesView } from '~services/token';

function useLastActions() {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    getLatestActions().then((resp) => {
      setActions(resp);
    });
  }, []);

  return actions;
}

function Balance({ hideEmpty }: { hideEmpty?: boolean }) {
  const userTokens = useUserRegisteredTokens();
  const balances = useTokenBalances();

  if (!balances || !userTokens) return <Loading />;

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="font-semibold">Balance</div>
        <GreenButton>Go to Wallet</GreenButton>
      </div>
      <div>
        {userTokens.map((token) => {
          const balance = balances[token.id] || '0';
          if (balance === '0' && hideEmpty) return null;

          const amount = toPrecision(
            toReadableNumber(token.decimals, balance),
            6,
            true
          );

          return (
            <div
              key={token.id}
              className="flex items-center justify-between py-4 border-t"
            >
              <div className="flex item-center justify-between">
                {token.icon ? (
                  <img
                    className="h-10 w-10 mr-3"
                    src={token.icon}
                    alt={token.symbol}
                  />
                ) : (
                  <div className="rounded-full h-10 w-10 bg-gray-300 mr-3"></div>
                )}
                <div className="flex flex-col justify-between py-1">
                  <div>{token.symbol}</div>
                  <div className="text-xs text-gray-500">{token.name}</div>
                </div>
              </div>
              <div className="text-gray-600">{amount}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PoolRow(props: { pool: any }) {
  const { pool } = usePool(props.pool.id);
  const [balance, setBalance] = useState('0');
  const tokens = useTokens(pool?.tokenIds);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const balances = useTokenBalances();

  useEffect(() => {
    getPoolBalance(Number(props.pool.id)).then(setBalance);
  }, []);

  if (!pool || !tokens || tokens.length < 2 || !balances) return <Loading />;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  if (!Number(balance)) return null;

  const b0 = toPrecision(
    toReadableNumber(tokens[0].decimals, balances[tokens[0].id]),
    6,
    true
  );
  const b1 = toPrecision(
    toReadableNumber(tokens[1].decimals, balances[tokens[1].id]),
    6,
    true
  );

  return (
    <div className="flex items-center justify-between py-4 border-t">
      <div className="flex item-center justify-between text-xs">
        <div>
          {tokens[0].symbol}: {b0}
        </div>
        <div className="px-4">-</div>
        <div>
          {tokens[1].symbol}: {b1}
        </div>
      </div>
      <div className="text-gray-600">
        <GreenButton onClick={() => setShowWithdraw(true)}>Remove</GreenButton>
      </div>
      <RemoveLiquidityModal
        pool={pool}
        shares={balance}
        tokens={tokens}
        isOpen={showWithdraw}
        onRequestClose={() => setShowWithdraw(false)}
      />
    </div>
  );
}

function LiquidityEmpty() {
  const history = useHistory();

  return (
    <div>
      <div className="text-center font-semibold text-xs pb-1">
        You aren’t providing liquidity to any pools
      </div>
      <div className="flex items-center justify-center">
        <div className="pt-2">
          <GreenButton onClick={() => history.push('/pools')}>
            Add Liquidity
          </GreenButton>
        </div>
      </div>
    </div>
  );
}

function Liquidity() {
  const [error, setError] = useState<Error>();
  const [pools, setPools] = useState([]);

  useEffect(() => {
    getYourPools().then(setPools).catch(setError);
  }, []);

  return (
    <Card className="w-full mt-6">
      <div className="w-full flex justify-center">
        {error && <Alert level="error" message={error.message} />}
      </div>

      <div className="flex items-center justify-between pb-4">
        <div className="font-semibold">Your Liquidity</div>
        <div></div>
      </div>
      {pools.length === 0 ? <LiquidityEmpty /> : null}
      <div>
        {pools.map((pool, i) => {
          return <PoolRow key={i} pool={pool} />;
        })}
      </div>
    </Card>
  );
}

function Account() {
  return (
    <div className="hide-scrollbar w-7/12 m-auto overflow-y-auto h-full">
      <div className="grid grid-cols-3 gap-6 xs:hidden">
        <div className="col-span-2">
          <Balance />
          <Liquidity />
        </div>
        <div>
          <Card className="w-full">
            <div className="flex items-center justify-between pb-4">
              <div className="font-semibold">Recent Activity</div>
              <div></div>
            </div>
            <div className="border-b">
              {Array(5)
                .fill(0)
                .map((_, i) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between py-4 border-t"
                    >
                      <div className="flex items-center justify-between">
                        <div className="rounded-full h-6 w-6 bg-gray-600 mr-3"></div>
                        <span className="text-xs font-semibold">BANANA</span>
                      </div>
                      <div className="text-gray-400 text-xs">1780</div>
                    </div>
                  );
                })}
            </div>
            <div>
              <GrayButton className="text-white text-xs w-full justify-center py-2 mt-4">
                <div>View All</div>
              </GrayButton>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AccountPage() {
  // const userTokens = useUserRegisteredTokens();
  // const balances = useTokenBalances();
  // const actions = useLastActions();

  // if (!balances || !userTokens || !actions) return <Loading />;

  // console.log(actions);

  return (
    <>
      <Account />
    </>
  );
}
