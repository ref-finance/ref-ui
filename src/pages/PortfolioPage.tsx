import React from 'react';
import { toReadableNumber } from '~utils/numbers';
import { useTokenBalances, useUserRegisteredTokens } from '~state/token';
import TokenList from '~components/tokens/TokenList';

export default function PortfolioPage() {
  const balances = useTokenBalances();
  const registeredTokens = useUserRegisteredTokens();

  return (
    <section className="bg-gray-700 shadow-2xl rounded p-8 sm:w-full md:w-1/4 lg:w-1/4 m-auto">
      <TokenList
        tokens={registeredTokens}
        render={(token) => (
          <p>{toReadableNumber(token.decimals, balances[token.id])}</p>
        )}
      />
    </section>
  );
}
