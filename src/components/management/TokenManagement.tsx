import React from 'react';
import { useUserRegisteredTokens, useWhitelistTokens } from '../../state/token';
import Loading from '../../components/layout/Loading';
import TabFormWrap from '../../components/forms/TabFormWrap';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Register from './Register';

function TokenManagement() {
  const tokens = useWhitelistTokens();
  const userTokens = useUserRegisteredTokens();

  if (!tokens || !userTokens) return <Loading />;
  const titles = userTokens.length
    ? ['Deposit', 'Withdraw', 'Whitelist Token']
    : ['Deposit', 'Whitelist Token'];

  return (
    <>
      <TabFormWrap titles={titles}>
        <Deposit tokens={tokens} />
        {userTokens.length ? <Withdraw tokens={userTokens} /> : null}
        <Register />
      </TabFormWrap>
      <p className="text-gray-400 text-center">
        Use this to deposit or withdraw tokens from the exchange.
      </p>
    </>
  );
}

export default TokenManagement;
