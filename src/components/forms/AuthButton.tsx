import React, { useEffect } from 'react';
import { wallet } from '../../services/near';
import { initializeAccount, signIn, signOut } from '../../services/account';

function AuthButton() {
  const accountId = wallet.getAccountId();

  useEffect(() => {
    if (accountId) {
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
            className="bg-red-600 hover:bg-red-500 text-white flex flex-col my-4 py-1 h-15 w-40 border border-black shadow-lg hover:bg-disabled rounded-lg transition-colors"
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
          className="bg-blue-500 hover:bg-blue-600 text-white my-4 h-10 w-40 border border-black flex-row-centered shadow-lg hover:bg-disabled rounded-lg transition-colors"
        >
          {' '}
          Sign In with NEAR
        </button>
      )}
    </>
  );}


export default AuthButton;
