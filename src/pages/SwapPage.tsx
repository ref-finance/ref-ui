import React from 'react';
import SwapCard from '~components/swap/SwapCard';
import Loading from '~components/layout/Loading';
import { useWhitelistTokens } from '../state/token';
import copy from '~utils/copy';

function SwapPage() {
  const allTokens = useWhitelistTokens();
  if (!allTokens) return <Loading />;

  return (
    <div className="swap">
      <div className="title text-center text-3xl pb-3 text-white font-semibold">
        Swap
      </div>
      <div className="describe text-center text-xs pb-5 text-white">
        Exchange tokens
      </div>
      <section className="w-1/4 m-auto">
        <SwapCard allTokens={allTokens} />
        <div className="text-center text-white text-xs leading-4 mt-2 whitespace-nowrap transform scale-95 origin-center">
          {copy.swap}
        </div>
      </section>
    </div>
  );
}

export default SwapPage;