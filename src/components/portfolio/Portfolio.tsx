import React from 'react';
import { useRegisteredTokens, useTokenBalances } from '~state/token';
import TokenList from '~components/tokens/TokenList';
import TabFormWrap from '~/components/forms/TabFormWrap';
import Deposit from './Deposit';
import Withdraw from './Withdraw';

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
      <TabFormWrap titles={['Deposits', 'Withdraws']}>
        <Deposit tokens={tokens} />
        <Withdraw tokens={tokens} />
      </TabFormWrap>
    </>
  );
}

export default Portfolio;
