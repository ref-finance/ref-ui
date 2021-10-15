import React, { useEffect, useState } from 'react';
import SwapCard from '~components/swap/SwapCard';
import Loading from '~components/layout/Loading';
import { useWhitelistTokens } from '../state/token';
import { FormattedMessage, useIntl } from 'react-intl';
import parse from 'html-react-parser';

function SwapPage() {
  const allTokens = useWhitelistTokens();
  const intl = useIntl();
  if (!allTokens) return <Loading />;

  return (
    <div className="swap">
      <div className="title text-center text-3xl pb-3 text-white font-semibold">
        <FormattedMessage id="swap" defaultMessage="Swap" />
      </div>
      <section className="w-1/3 md:w-5/6 xs:w-11/12 m-auto">
        <SwapCard allTokens={allTokens} />
      </section>
    </div>
  );
}

export default SwapPage;
