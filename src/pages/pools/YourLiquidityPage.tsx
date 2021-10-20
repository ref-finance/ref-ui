import React, { useEffect, useState } from 'react';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import { BorderButton, ConnectToNearBtn } from '~components/button/Button';
import Loading from '~components/layout/Loading';
import { wallet } from '~services/near';
import { useTokens } from '~state/token';
import { getPoolBalance, PoolRPCView } from '~services/api';
import { toRoundedReadableNumber } from '~utils/numbers';
import { usePool } from '~state/pool';
import { RemoveLiquidityModal } from './DetailsPage';
import { getYourPools } from '~services/indexer';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage } from 'react-intl';

function Empty() {
  return (
    <div>
      <div className="text-center font-semibold text-xs pb-1">
        <FormattedMessage
          id="you_are_not_providing_liquidity_to_any_pools"
          defaultMessage="You aren’t providing liquidity to any pools"
        />
      </div>
      <div className="flex items-center justify-center">
        {wallet.isSignedIn() ? <AddLiquidityButton /> : <ConnectToNearBtn />}
      </div>
    </div>
  );
}

function AddLiquidityButton() {
  return (
    <div className="pt-2">
      <a
        href="/pools"
        className="rounded-full text-xs text-white px-5 py-2.5 focus:outline-none font-semibold border border-greenLight bg-greenLight focus:outline-none"
      >
        <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
      </a>
    </div>
  );
}

export function YourLiquidityPage() {
  const [error, setError] = useState<Error>();
  const [pools, setPools] = useState<PoolRPCView[]>();

  useEffect(() => {
    getYourPools().then(setPools);
  }, []);

  if (!pools) return <Loading />;

  return (
    <div className="flex items-center flex-col w-1/3 md:w-5/6 xs:w-11/12 m-auto">
      <div className="text-center pb-8">
        <div className="text-white text-3xl font-semibold">
          <FormattedMessage
            id="your_liquidity"
            defaultMessage="Your Liquidity"
          />
        </div>
      </div>
      <div className="w-full flex justify-center">
        {error && <Alert level="error" message={error.message} />}
      </div>
      <Card width="w-full">
        {pools.length > 0 ? (
          <section>
            <div className="max-h-80 overflow-y-auto">
              <div className="grid grid-cols-12 py-2 content-center items-center text-xs font-semibold text-primaryText">
                <div className="grid grid-cols-2 col-span-2"></div>
                <p className="grid col-span-3">
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </p>
                <p className="col-span-4 text-center">
                  <FormattedMessage
                    id="shares_owned"
                    defaultMessage="Shares Owned"
                  />
                </p>
              </div>
              {pools.map((pool, i) => (
                <PoolRow key={i} pool={pool} />
              ))}
            </div>
            <div className="flex items-center justify-center my-4">
              <AddLiquidityButton />
            </div>
          </section>
        ) : (
          <Empty />
        )}
      </Card>
    </div>
  );
}

function PoolRow(props: { pool: any }) {
  const { pool } = usePool(props.pool.id);
  const [balance, setBalance] = useState<string>();
  const tokens = useTokens(pool?.tokenIds);
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    getPoolBalance(Number(props.pool.id)).then(setBalance);
  }, [balance]);

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
        <p className="grid col-span-3">
          {toRealSymbol(tokens[0].symbol)}-{toRealSymbol(tokens[1].symbol)}
        </p>
        <p className="col-span-4 text-center">
          {toRoundedReadableNumber({ decimals: 24, number: balance })}
        </p>
        <div className="col-span-3 text-right">
          <BorderButton onClick={() => setShowWithdraw(true)}>
            <FormattedMessage id="remove" defaultMessage="Remove" />
          </BorderButton>
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
