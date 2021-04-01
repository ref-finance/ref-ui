import React from 'react';
import {
  useRegisteredTokens,
  useTokenBalances,
  useUserRegisteredTokens,
} from '~state/token';
import TokenList from '~components/tokens/TokenList';
import TabFormWrap from '~/components/forms/TabFormWrap';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import { toReadableNumber } from '~utils/numbers';
import Register from './Register';

function Portfolio() {
  const balances = useTokenBalances();
  const tokens = useRegisteredTokens();
  const userTokens = useUserRegisteredTokens();

  return (
    <>
      <h1 className="font-semibold font-inter pt-8">Portfolio</h1>
      <TokenList
        tokens={userTokens}
        render={(token) => (
          <p>{toReadableNumber(token.decimals, balances[token.id])}</p>
        )}
      />
      <TabFormWrap titles={['Deposits', 'Withdraws', 'Register']}>
        <Deposit tokens={tokens} />
        <Withdraw tokens={tokens} />
        <Register />
      </TabFormWrap>
    </>
  );
}

export default Portfolio;
