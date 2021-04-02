import React from 'react';
import { useUserRegisteredTokens } from '~state/token';
import Loading from '~components/layout/Loading';
import TabFormWrap from '~components/forms/TabFormWrap';
import NewUserPortfolio from './NewUserPortfolio';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Register from './Register';

function Portfolio() {
  const registeredTokens = useUserRegisteredTokens();

  if (!registeredTokens) return <Loading />;

  if (registeredTokens.length === 0) {
    return <NewUserPortfolio />;
  }

  return (
    <>
      <TabFormWrap titles={['Deposit', 'Withdraw', 'Register']}>
        <Deposit tokens={registeredTokens} />
        <Withdraw tokens={registeredTokens} />
        <Register />
      </TabFormWrap>
    </>
  );
}

export default Portfolio;
