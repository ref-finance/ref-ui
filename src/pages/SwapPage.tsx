import React from 'react';
import SwapCard from '~components/swap/SwapCard';
import Loading from '~components/layout/Loading';
import { useWhitelistTokens } from '../state/token';

function SwapPage() {
  const allTokens = useWhitelistTokens();
  if (!allTokens) return <Loading />;

  return (
    <div className="swap">
      <div className="title text-center text-3xl pb-3 text-white font-semibold">
        Swap
      </div>
      <div className="describe text-center text-xs pb-5 text-white">
        Use this to deposit tokens
      </div>
      <section className="w-1/4 m-auto">
        <SwapCard allTokens={allTokens} />
        <div className="text-center text-white text-xs leading-4 mt-2 whitespace-nowrap transform scale-95 origin-center">
          Swap exchanges the first selected token with the value of the second
          selected token.
          <br />
          This looks for a pool with available liquidity and the lowest exchange
          fee.
        </div>
      </section>
    </div>
  );
}

export default SwapPage;