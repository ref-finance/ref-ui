import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';

import SvgIcon from './SvgIcon';
import Button from './Button';
import { useRouter } from '../hooks/useRouter';
import useBridge from '../hooks/useBridge';
import { formatFileUrl, formatTxExplorerUrl } from '../utils/format';
import rainbowBridgeService from '../services/bridge/rainbow';
import { BridgeConfig } from '../config';
import moment from 'moment';

export default function BridgeTransactionStatusModal({
  transaction: _transaction,
  toggleOpenModal,
  ...props
}: Modal.Props & {
  transaction: BridgeModel.BridgeTransaction;
  toggleOpenModal: () => void;
}) {
  const { callAction, actionLoading } = useBridge();

  const [transaction, setTransaction] =
    useState<BridgeModel.BridgeTransaction>(_transaction);

  const estimateTime = useMemo(() => {
    const waiting = moment().diff(transaction.startTime, 'm');
    const estimate = BridgeConfig.Rainbow.wait - waiting;
    return estimate > 0 ? estimate : 0;
  }, [transaction.startTime]);

  const router = useRouter();

  function handleOpenHistory() {
    toggleOpenModal();
    router.push('/bridge/history');
  }

  async function handleAction() {
    await callAction(transaction.id);
    const result = await rainbowBridgeService.getById(transaction.id);
    setTransaction(result);
    // toggleOpenModal();
  }

  function handleNewTransfer() {
    toggleOpenModal();
    router.push('/bridge');
  }

  function handleOpenTx() {
    window.open(
      formatTxExplorerUrl(
        transaction.sourceNetwork,
        transaction.burnHashes?.[0] ||
          transaction.lockHashes?.[0] ||
          transaction.unlockHashes?.[0] ||
          transaction.mintHashes?.[0]
      )
    );
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
          <img
            src={formatFileUrl(
              `/chain/${transaction.sourceNetwork.toLowerCase()}.svg`
            )}
            className="w-7 h-7"
          />
          <div className="bridge-status-process">
            {transaction.status === 'completed' ? (
              <SvgIcon name="IconSuccessCircle" className="text-5xl" />
            ) : (
              <SvgIcon
                name="IconWaiting"
                className="text-5xl animate-waiting"
              />
            )}
          </div>
          <img
            src={formatFileUrl(
              `/chain/${transaction.destinationNetwork.toLowerCase()}.svg`
            )}
            className="w-7 h-7"
          />
        </div>
        <div className="my-6 text-center text-white">
          {transaction.status === 'completed' && `Bridge Completed`}
          {transaction.status === 'in-progress' &&
            `Est. Bridging Time: ${estimateTime} mins`}
        </div>
        <div className="text-center mb-6">
          Transaction {transaction.status}. You can view your transaction on the{' '}
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
          {transaction.status === 'action-needed' && transaction.callToAction && (
            <Button
              type="primary"
              size="large"
              className="w-full "
              loading={actionLoading}
              onClick={handleAction}
            >
              {transaction.callToAction}
            </Button>
          )}

          {transaction.status === 'completed' && (
            <Button
              size="large"
              plain
              className="w-full"
              onClick={handleNewTransfer}
            >
              + New Transfer
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
