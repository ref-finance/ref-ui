import React from 'react';
import { useRegisteredTokens, useTokenBalances } from '~state/token';
import TokenList from '~components/tokens/TokenList';
import Deposit from './Deposit';

function Portfolio() {
  const balances = useTokenBalances();
  const tokens = useRegisteredTokens();

  return (
    <>
      <h1 className="font-semibold font-inter pt-8">Portfolio</h1>
      <TokenList
        tokens={tokens}
        render={(token) => <p>{balances[token.id]}</p>}
      />
      <Deposit tokens={tokens} />
    </>
  );
}

export default Portfolio;
