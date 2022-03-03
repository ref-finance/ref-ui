import React, { useContext } from 'react';

import ReactModal from 'react-modal';
import { Card } from '../card/Card';
import { wallet, REF_FARM_CONTRACT_ID } from '../../services/near';
import {
  senderWallet,
  getCurrentWallet,
  getSenderWallet,
} from '../../utils/sender-wallet';
import Modal from 'react-modal';
import { WalletContext } from '../../utils/sender-wallet';

declare global {
  interface Window {
    near: any;
  }
}

export const WalletSelectorModal = (
  props: ReactModal.Props & { setShowWalletSelector: (show: boolean) => void }
) => {
  const { setShowWalletSelector } = props;

  const { signedInState, signedInStatedispatch } = useContext(WalletContext);

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
            if (typeof window.near !== 'undefined' && window.near.isSender) {
              getSenderWallet(window)
                .requestSignIn(REF_FARM_CONTRACT_ID)
                .then(() => {
                  setShowWalletSelector(false);
                  signedInStatedispatch({ type: 'signIn' });
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
