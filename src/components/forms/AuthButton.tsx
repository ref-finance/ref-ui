import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { wallet } from '../../services/near';
import { initializeAccount } from '../../services/account';

function AuthButton() {
  const [accountId, setAccountId] = useState(wallet.getAccountId());
  const history = useHistory();

  useEffect(() => {
    if (accountId) {
      initializeAccount();
    }
  }, [accountId]);

  const signout = async () => {
    wallet.signOut();
    setAccountId(null);
    history.push('/');
  };

  return (
    <>
      {accountId ? (
        <>
          <button
            onClick={signout}
            type="button"
            className="bg-red-600 hover:bg-white hover:text-red-600 hover:border-2 hover:border-red-600 text-white flex flex-col my-4 py-1 h-15 w-40 border-2  shadow-lg hover:bg-disabled rounded-lg transition-colors focus:outline-none"
          >
            {' '}
            <p className="w-full">SIGN OUT</p>
            <h1 className="w-full">{wallet.getAccountId()}</h1>
          </button>
        </>
      ) : (
        <button
          onClick={() => wallet.requestSignIn()}
          type="button"
          className="bg-blue-500 hover:bg-white hover:text-blue-500 hover:border-2 hover:border-blue-500 text-white my-4 h-10 w-40 border-2 flex-row-centered shadow-lg hover:bg-disabled rounded-lg transition-colors focus:outline-none"
        >
          {' '}
          Sign In with NEAR
        </button>
      )}
    </>
  );
}

export default AuthButton;
