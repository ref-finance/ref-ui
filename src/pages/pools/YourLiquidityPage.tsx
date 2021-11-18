import React, { useEffect, useState } from 'react';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import {
  BorderButton,
  ConnectToNearBtn,
  SolidButton,
  OutlineButton,
} from '~components/button/Button';
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
import { useHistory } from 'react-router-dom';
import { MyShares } from './DetailsPage';

function Empty() {
  return (
    <div>
      <div className="text-center font-semibold text-xs mb-4 text-primaryText">
        <FormattedMessage
          id="you_are_not_providing_liquidity_to_any_pools"
          defaultMessage="You aren’t providing liquidity to any pools"
        />
      </div>
      {wallet.isSignedIn() ? <AddLiquidityButton /> : <ConnectToNearBtn />}
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

  useEffect(() => {
    getYourPools().then(setPools);
  }, []);

  if (!pools) return <Loading />;

  return (
    <div className="flex items-center flex-col w-1/3 md:w-5/6 xs:w-11/12 m-auto">
      <div className="w-full flex justify-center">
        {error && <Alert level="error" message={error.message} />}
      </div>
      <Card width="w-full" padding="px-0 py-6">
        <div className="text-white text-xl px-6 pb-6">
          <FormattedMessage id="my_liquidity" defaultMessage="My Liquidity" />
        </div>
        {pools.length > 0 ? (
          <section>
            <div className="">
              <div className="grid grid-cols-10 py-2 content-center items-center text-xs text-primaryText px-6">
                <p className="grid col-span-5">
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </p>
                <p className="col-span-5">
                  <FormattedMessage id="my_shares" defaultMessage="My Shares" />
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {pools.map((pool, i) => (
                  <PoolRow key={i} pool={pool} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center mt-4 px-6">
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
  const { pool, shares } = usePool(props.pool.id);
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

  // const images = tokens.map((token) => {
  //   const { icon, id } = token;
  //   if (icon)
  //     return <img key={id} className="h-6 w-6 rounded-full" src={icon} />;
  //   return <div key={id} className="h-6 w-6 rounded-full border"></div>;
  // });

  return (
    Number(balance) > 0 && (
      <div className="grid grid-cols-10 py-2 content-center items-center text-sm text-white px-6 border-t border-gray-700 border-opacity-70">
        <div className="col-span-2">
          <div className="w-16 flex items-center justify-between ">
            <div className="h-7 w-7 border border-gradientFromHover rounded-full mr-2">
              <img
                key={tokens[0].id.substring(0, 12).substring(0, 12)}
                className="rounded-full mr-2 w-full"
                src={tokens[0].icon}
              />
            </div>
            <div className="h-7 w-7 border border-gradientFromHover rounded-full">
              <img
                key={tokens[1].id}
                className="rounded-full mr-2 w-full"
                src={tokens[1].icon}
              />
            </div>
          </div>
        </div>

        <p className="grid col-span-3 text-left">
          {toRealSymbol(tokens[0].symbol)}-{toRealSymbol(tokens[1].symbol)}
        </p>
        <div className="col-span-3 text-left">
          <MyShares shares={shares} totalShares={pool.shareSupply} />
        </div>
        <div className="col-span-2 text-right">
          <OutlineButton
            onClick={() => setShowWithdraw(true)}
            className="text-xs px-4"
            padding="py-1"
          >
            <FormattedMessage id="remove" defaultMessage="Remove" />
          </OutlineButton>
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
