import React from 'react';
import USNCard from '../components/usn/USNCard';
import Loading from '../components/layout/Loading';
import getConfig from '../services/config';
import { nearMetadata } from '../services/wrap-near';
import { useTokens } from 'src/state/token';
function USNPage() {
  const extraTokens =
    getConfig().networkId === 'mainnet' ? ['usn'] : ['usdn.testnet'];

  const tokens = useTokens(extraTokens);
  if (!tokens) return <Loading />;
  const allTokens = [nearMetadata, tokens[0]];
  return (
    <div className="swap">
      <section className="lg:w-560px md:w-5/6 xs:w-full xs:p-2 m-auto relative">
        <USNCard allTokens={allTokens} />
      </section>
    </div>
  );
}

export default USNPage;
