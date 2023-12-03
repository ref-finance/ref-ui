import React, { useState } from 'react';
import Modal from 'react-modal';

import SvgIcon from './SvgIcon';
import Button from './Button';
import { useRouter } from '../hooks/useRouter';
import { NearConfig } from '../config';

export default function BridgeTransactionStatusModal({
  toggleOpenModal,
  tx,
  ...props
}: Modal.Props & { tx: string; toggleOpenModal: () => void }) {
  const router = useRouter();

  function handleOpenHistory() {
    toggleOpenModal();
    router.push('/bridge/history');
  }

  function handleClaim() {
    toggleOpenModal();
    router.push('/bridge/history');
  }

  function handleNewTransfer() {
    toggleOpenModal();
    router.push('/bridge');
  }

  function handleOpenTx() {
    window.open(`${NearConfig.explorerUrl}/txns/${tx}`, '_blank');
  }

  return (
    <Modal {...props} onRequestClose={toggleOpenModal}>
      <div className="bridge-modal" style={{ width: '428px' }}>
        <div className="flex items-center justify-between">
          <span className="text-base text-white font-medium">
            Transaction Detail
          </span>
          <Button text onClick={toggleOpenModal}>
            <SvgIcon name="IconClose" />
          </Button>
        </div>
        <div className="flex items-center justify-center my-8 gap-2">
          <div className="w-7 h-7 bg-white rounded-md" />
          <div className="bridge-status-process">
            <SvgIcon name="IconWaiting" className="text-5xl" />
            {/* <SvgIcon name="IconSuccessCircle" className="text-5xl"/> */}
          </div>
          <div className="w-7 h-7 bg-white rounded-md" />
        </div>
        <div className="my-6 text-center text-white">
          Est. Bridging Time: 5 mins / Bridge Completed
        </div>
        <div className="text-center mb-6">
          Transaction completed. You can view your transaction on the{' '}
          <Button type="primary" text onClick={handleOpenHistory}>
            bridge transaction history
          </Button>
          .
        </div>
        <div className="text-center">
          <Button onClick={handleOpenTx}>
            <span className="inline-flex items-center text-primary text-xs">
              SRC TX <SvgIcon name="IconExport" className="text-xs ml-2" />
            </span>
          </Button>
        </div>
        <div className="mt-6">
          <Button
            type="primary"
            size="large"
            className="w-full "
            onClick={handleClaim}
          >
            Claim
          </Button>
          <br />
          <br />
          <Button
            size="large"
            plain
            className="w-full"
            onClick={handleNewTransfer}
          >
            + New Transfer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
