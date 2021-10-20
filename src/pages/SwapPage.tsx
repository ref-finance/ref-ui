import React from 'react';
import SwapCard from '~components/swap/SwapCard';
import Loading from '~components/layout/Loading';
import { useWhitelistTokens } from '../state/token';
import { FormattedMessage } from 'react-intl';

function SwapPage() {
  const allTokens = useWhitelistTokens();
  if (!allTokens) return <Loading />;

  return (
    <div className="swap">
      <section className="w-1/3 md:w-5/6 xs:w-11/12 m-auto">
        <SwapCard allTokens={allTokens} />
      </section>
    </div>
  );
}

export default SwapPage;
