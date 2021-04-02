import React from 'react';
import MicroModal from 'react-micro-modal';
import { depositStorage } from '~services/account';
import { wallet } from '~services/near';

export default function DepositNotification({ open }: { open: boolean }) {
  console.log(open);
  return (
    <MicroModal openInitially={open}>
      {(close) => (
        <>
          <p>Blah Blah</p>
          <button
            onClick={() =>
              depositStorage({
                accountId: wallet.getAccountId(),
              })
            }
          >
            Yes
          </button>
          <button onClick={() => close()}>No</button>
        </>
      )}
    </MicroModal>
  );
}
