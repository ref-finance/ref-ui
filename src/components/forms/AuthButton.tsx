import React, { useEffect, useState } from 'react';
import { getUserRegisteredTokens } from '../../services/token';
import { wallet } from '../../services/near';
import { initializeAccount, signIn, signOut } from '../../services/account';

function AuthButton() {
  const [authorizedTokens, setAuthorizedTokens] = useState([]);
  const accountId = wallet.getAccountId();

  useEffect(() => {
    if (accountId) {
      getUserRegisteredTokens().then((res) => setAuthorizedTokens(res));
      initializeAccount();
    }
  }, [accountId]);

  return (
    <>
      {wallet.isSignedIn() ? (
        <>
          <button
            onClick={signOut}
            type="button"
            className="flex flex-col my-4 py-1 h-15 w-40 border border-black shadow-lg hover:bg-disabledGray rounded-lg transition-colors"
          >
            {' '}
            <p className="w-full">SIGN OUT</p>
            <h1 className="w-full">{wallet.getAccountId()}</h1>
          </button>
        </>
      ) : (
        <button
          onClick={signIn}
          type="button"
          className="my-4 h-10 w-40 border border-black flex-row-centered shadow-lg hover:bg-disabledGray rounded-lg transition-colors"
        >
          {' '}
          Sign In with NEAR
        </button>
      )}
    </>
  );
}

export default AuthButton;
