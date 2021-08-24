import React, { useEffect, useState } from 'react';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import { ConnectToNearBtn, GreenButton } from '~components/button/Button';
import Loading from '~components/layout/Loading';
import { wallet } from '~services/near';
import { useTokens } from '~state/token';
import { getPoolBalance } from '~services/api';
import { toRoundedReadableNumber } from '~utils/numbers';
import { usePool } from '~state/pool';
import { RemoveLiquidityModal } from './DetailsPage';
import { getYourPools } from '~services/indexer';
import { toRealSymbol } from '~utils/token';

function Empty() {
  return (
    <div>
      <div className="text-center font-semibold text-xs pb-1">
        You aren’t providing liquidity to any pools
      </div>
      <div className="flex items-center justify-center">
        {wallet.isSignedIn() ? (
          <div className="pt-2">
            <GreenButton>Add Liquidity</GreenButton>
          </div>
        ) : (
          <ConnectToNearBtn />
        )}
      </div>
    </div>
  );
}

export function YourLiquidityPage() {
  const [error, setError] = useState<Error>();
  const [pools, setPools] = useState([
    {
      id: 0,
      token_account_ids: ['', ''],
      token_symbols: ['', ''],
      amounts: ['0', '0'],
      total_fee: 0,
      shares_total_supply: '',
      tvl: 0,
      token0_ref_price: '',
      share: '0',
    },
  ]);

  useEffect(() => {
    getYourPools().then(setPools);
  }, []);

  if (!pools) return <Loading />;

  return (
    <div className="flex items-center flex-col w-1/3 md:w-5/6 xs:w-11/12 m-auto">
      <div className="text-center pb-8">
        <div className="text-white text-3xl font-semibold">Your Liquidity</div>
      </div>
      <div className="w-full flex justify-center">
        {error && <Alert level="error" message={error.message} />}
      </div>
      <Card width="w-full">
        {!wallet.isSignedIn() || pools.length === 0 ? <Empty /> : null}
        {pools.length > 0 ? (
          <section>
            <div className="max-h-80 overflow-y-auto">
              <div className="grid grid-cols-12 py-2 content-center items-center text-xs font-semibold text-gray-600">
                <div className="grid grid-cols-2 col-span-2"></div>
                <p className="grid col-span-4">Pair</p>
                <p className="col-span-4 text-center">Shares Owned</p>
              </div>
              {pools.map((pool, i) => (
                <PoolRow key={i} pool={pool} />
              ))}
            </div>
          </section>
        ) : null}
      </Card>
    </div>
  );
}

function PoolRow(props: { pool: any }) {
  const { pool } = usePool(props.pool.id);
  const [balance, setBalance] = useState('0');
  const tokens = useTokens(pool?.tokenIds);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    getPoolBalance(Number(props.pool.id)).then(setBalance);
  }, []);

  if (!pool || !tokens || tokens.length < 2 || !balance) return null;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const images = tokens.map((token) => {
    const { icon, id } = token;
    if (icon) return <img key={id} className="h-6 w-6" src={icon} />;
    return <div key={id} className="h-6 w-6 rounded-full border"></div>;
  });

  return (
    Number(balance) > 0 && (
      <div className="grid grid-cols-12 py-2 content-center items-center text-xs font-semibold text-gray-600">
        <div className="grid grid-cols-2 col-span-2">
          <div className="w-14 flex items-center justify-between">{images}</div>
        </div>
        <p className="grid col-span-4">
          {toRealSymbol(tokens[0].symbol)}-{toRealSymbol(tokens[1].symbol)}
        </p>
        <p className="col-span-4 text-center">
          {toRoundedReadableNumber({ decimals: 24, number: balance })}
        </p>
        <div className="col-span-2 text-right">
          <GreenButton onClick={() => setShowWithdraw(true)}>
            Remove
          </GreenButton>
        </div>
        <RemoveLiquidityModal
          pool={pool}
          shares={balance}
          tokens={tokens}
          isOpen={showWithdraw}
          onRequestClose={() => setShowWithdraw(false)}
        />
      </div>
    )
  );
}
