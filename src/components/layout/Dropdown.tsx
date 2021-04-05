import React, { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { useHistory } from 'react-router';
import { wallet } from '~services/near';

export default function Dropdown() {
  const [open, setOpen] = useState<boolean>(false);
  const history = useHistory();

  const [account, network] = wallet.getAccountId().split('.');
  const niceAccountId = `${account.slice(0, 10)}...${network}`;

  return (
    <div
      className="relative inline-block text-left mr-12"
      onBlur={() => setOpen(false)}
    >
      <div>
        <button
          type="button"
          className="flex max-w-1 items-center hover:text-darkText text-md focus:outline-none"
          id="options-menu"
          aria-expanded="true"
          aria-haspopup="true"
          onClick={() => setOpen((open) => !open)}
        >
          <p>{account.length > 10 ? niceAccountId : wallet.getAccountId()}</p>
          <FaAngleDown className="ml-2 m-auto place-self-center" />
        </button>
      </div>

      {open && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            <button
              type="button"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
              onClick={() => {
                wallet.signOut();
                history.push('/');
                setOpen(false);
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
