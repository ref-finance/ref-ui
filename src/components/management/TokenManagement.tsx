import React from 'react';
import {
  useNeedToPayStorage,
  useUserRegisteredTokens,
  useWhitelistTokens,
} from '~state/token';
import Loading from '~components/layout/Loading';
import TabFormWrap from '~components/forms/TabFormWrap';
import NewUserPortfolio from './NewUserPortfolio';
import Deposit from './Deposit';
import Withdraw from './Withdraw';

function TokenManagement() {
  const tokens = useWhitelistTokens();
  const userTokens = useUserRegisteredTokens();
  const needsStorage = useNeedToPayStorage();

  if (!tokens && !userTokens) return <Loading />;

  if (userTokens.length === 0 && needsStorage) {
    return <NewUserPortfolio />;
  }

  return (
    <>
      <TabFormWrap titles={['Deposit', 'Withdraw']}>
        <Deposit tokens={tokens} />
        <Withdraw tokens={userTokens} />
      </TabFormWrap>
    </>
  );
}

export default TokenManagement;
