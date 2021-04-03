import React from 'react';
import MicroModal from 'react-micro-modal';
import { depositStorage } from '~services/account';
import { wallet } from '~services/near';

export default function DepositNotification({ open }: { open: boolean }) {
  return (
    <MicroModal openInitially={open}>
      {(close) => (
        <>
          <h1 className="text-center text-2xl">First time here?</h1>
          <p className="my-4">
            Ref-fi requires a one time initial storage payment of .01 Ⓝ
          </p>
          <section className="flex justify-center">
            <button
              className="items-center my-4 h-10 w-40 rounded-md bg-buttonBg border-2 text-buttonText hover:bg-buttonText hover:text-buttonBg hover:border-buttonBg hover:border-2 shadow-lg hover:bg-disabled rounded-lg transition-colors focus:outline-none"
              onClick={() =>
                depositStorage({
                  accountId: wallet.getAccountId(),
                  registrationOnly: false,
                })
              }
            >
              {' '}
              PROCEED
            </button>
            <button
              className="bg-red-600 hover:bg-white m-3 flex-row-centered hover:text-red-600 hover:border-2 hover:border-red-600 text-white flex flex-col my-4 h-10 w-40 border-2  shadow-lg hover:bg-disabled rounded-lg transition-colors focus:outline-none"
              onClick={() => {
                wallet.signOut();
                window.location.replace('/');
              }}
            >
              {' '}
              CANCEL
            </button>
          </section>
        </>
      )}
    </MicroModal>
  );
}
