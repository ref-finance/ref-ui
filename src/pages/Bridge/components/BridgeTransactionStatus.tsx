import React, { useMemo, useState } from 'react';
import Modal from 'react-modal';

import SvgIcon from './SvgIcon';
import Button from './Button';
import { useRouter } from '../hooks/useRouter';
import useRainbowBridge from '../hooks/useRainbowBridge';
import { formatTxExplorerUrl } from '../utils/format';

export default function BridgeTransactionStatusModal({
  transaction,
  toggleOpenModal,
  ...props
}: Modal.Props & {
  transaction: BridgeModel.BridgeTransaction;
  toggleOpenModal: () => void;
}) {
  const { getDecodedTransaction, callAction, actionLoading } =
    useRainbowBridge();

  const _transaction = useMemo(
    () => getDecodedTransaction(transaction),
    [transaction]
  );

  const router = useRouter();

  function handleOpenHistory() {
    toggleOpenModal();
    router.push('/bridge/history');
  }

  function handleAction() {
    callAction(_transaction.id);
  }

  function handleNewTransfer() {
    toggleOpenModal();
    router.push('/bridge');
  }

  function handleOpenTx() {
    const ethTxHash =
      _transaction.lockHashes?.[0] || _transaction.unlockHashes?.[0];
    const nearTxHash =
      _transaction.burnHashes?.[0] || _transaction.mintHashes?.[0];
    window.open(
      formatTxExplorerUrl(
        _transaction.sourceNetwork === 'near' ? 'NEAR' : 'ETH',
        ethTxHash || nearTxHash
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
          <SvgIcon
            name={
              _transaction.sourceNetwork === 'ethereum'
                ? 'IconChainEthereum'
                : 'IconChainNear'
            }
            className="text-2xl"
          />
          <div className="bridge-status-process">
            {transaction.status === 'completed' ? (
              <SvgIcon name="IconSuccessCircle" className="text-5xl" />
            ) : (
              <SvgIcon name="IconWaiting" className="text-5xl" />
            )}
          </div>
          <SvgIcon
            name={
              _transaction.sourceNetwork === 'near'
                ? 'IconChainEthereum'
                : 'IconChainNear'
            }
            className="text-2xl"
          />
        </div>
        <div className="my-6 text-center text-white">
          Est. Bridging Time: 5 mins / Bridge Completed
        </div>
        <div className="text-center mb-6">
          Transaction {_transaction.status}. You can view your transaction on
          the{' '}
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
          {_transaction.callToAction && (
            <Button
              type="primary"
              size="large"
              className="w-full "
              loading={actionLoading}
              onClick={handleAction}
            >
              {_transaction.callToAction}
            </Button>
          )}

          {_transaction.status === 'completed' && (
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
