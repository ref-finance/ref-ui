import React from 'react';

import ReactModal from 'react-modal';
import { Card } from '../card/Card';
import { wallet, REF_FARM_CONTRACT_ID } from '../../services/near';
import { senderWallet } from '../../utils/sender-wallet';
import Modal from 'react-modal';

export const WalletSelectorModal = (
  props: ReactModal.Props & { setShowWalletSelector: (show: boolean) => void }
) => {
  const { setShowWalletSelector } = props;

  return (
    <Modal {...props}>
      <Card
        className="p-5 flex flex-col"
        style={{
          width: '40vw',
        }}
      >
        <div
          className="m-5 w-full cursor-pointer text-white"
          onClick={() => {
            wallet.requestSignIn(REF_FARM_CONTRACT_ID);
          }}
        >
          web wallet
        </div>

        <div
          className="m-5 w-full cursor-pointer text-white"
          onClick={() => {
            if (senderWallet.isSender) {
              senderWallet.requestSignIn(REF_FARM_CONTRACT_ID).then(() => {
                setShowWalletSelector(false);
              });
            } else {
              alert('sender wallet not installed');
            }
          }}
        >
          sender wallet
        </div>
      </Card>
    </Modal>
  );
};
