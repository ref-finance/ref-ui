import React from 'react';
import { useUserRegisteredTokens, useWhitelistTokens } from '../../state/token';
import Loading from '../../components/layout/Loading';
import TabFormWrap from '../../components/forms/TabFormWrap';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import WrapNear from './WrapNear';
import Register from './Register';

function TokenManagement() {
  const tokens = useWhitelistTokens();
  const userTokens = useUserRegisteredTokens();

  if (!tokens && !userTokens) return <Loading />;

  return (
    <>
      <TabFormWrap
        titles={['Deposit', 'Withdraw', 'Wrap NEAR', 'Whitelist Token']}
      >
        <Deposit tokens={tokens} />
        <Withdraw tokens={userTokens} />
        <WrapNear />
        <Register />
      </TabFormWrap>
      <p className="text-gray-400 text-center">
        Use this to deposit or withdraw tokens from the exchange.
      </p>
    </>
  );
}

export default TokenManagement;
