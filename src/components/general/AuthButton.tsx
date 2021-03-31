import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getUserRegisteredTokens } from '../../services/token';
import { REF_FI_CONTRACT_ID, wallet } from '../../services/near';

function AuthButton() {
  const history = useHistory();
  const [authorizedTokens, setAuthorizedTokens] = useState([]);
  const accountId = wallet.getAccountId();

  useEffect(() => {
    if (accountId)
      getUserRegisteredTokens().then((res) => setAuthorizedTokens(res));
  }, [accountId]);

  const signIn = () => {
    wallet.requestSignIn(REF_FI_CONTRACT_ID, 'ref-finance');
  };

  const signOut = () => {
    wallet.signOut();
    // reload page
    history.go(0);
  };

  return (
    <>
      {wallet.isSignedIn() ? (
        <>
          <button
            onClick={signOut}
            type="button"
            className=" my-4 h-10 w-40  border border-black flex-row-centered shadow-lg hover:bg-disabledGray rounded-lg transition-colors"
          >
            {' '}
            SIGN OUT
          </button>
          <h1>Welcome {wallet.getAccountId()}!</h1>
        </>
      ) : (
        <button
          onClick={signIn}
          type="button"
          className=" my-4 h-10 w-40  border border-black flex-row-centered shadow-lg hover:bg-disabledGray rounded-lg transition-colors"
        >
          {' '}
          Sign In with NEAR
        </button>
      )}
    </>
  );
}

export default AuthButton;
