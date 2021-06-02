import React from 'react';
import SwapCard from '~components/swap/SwapCard';
import RainBow from '~components/layout/RainBow';
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
      <div className="describe text-center text-sm pb-5 text-white">
        Exchange tokens
      </div>
      <section className="w-1/3 m-auto">
        <SwapCard allTokens={allTokens} />
        <div className="text-center text-white text-sm leading-6 mt-2 w-full m-auto">
          {copy.swap}
        </div>
      </section>
    </div>
  );
}

export default SwapPage;