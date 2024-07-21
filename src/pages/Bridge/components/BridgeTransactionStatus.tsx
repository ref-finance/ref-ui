import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';

import SvgIcon from './SvgIcon';
import Button from './Button';
import { useRouter } from '../hooks/useRouter';
import { formatFileUrl, formatTxExplorerUrl } from '../utils/format';
import { BridgeConfig } from '../config';
import moment from 'moment';
import { BridgeTransferParams } from '../services/bridge';
import bridgeHistoryService from '../services/history';
import { useRequest } from '../hooks/useHooks';

export default function BridgeTransactionStatusModal({
  params,
  hash,
  toggleOpenModal,
  ...props
}: Modal.Props & {
  params: BridgeTransferParams;
  hash: string;
  toggleOpenModal: () => void;
}) {
  const { data: transaction } = useRequest(
    async () => {
      const res = await bridgeHistoryService.queryByHash({
        hash,
        accountAddress: params.sender,
        chain: params.from,
      });
      if (res) return res;
      return {
        created_time: new Date(),
        from_chain: params.from,
        to_chain: params.to,
        from_chain_hash: hash,
        to_chain_hash: '',
      } as unknown as BridgeModel.BridgeHistory;
    },
    {
      refreshDeps: [hash, params.sender, props.isOpen],
      before: () => props.isOpen,
      pollingInterval: 10000,
    }
  );

  const estimateTime = useMemo(() => {
    if (!transaction?.created_time) return 0;
    const waiting = moment().diff(transaction.created_time, 'm');
    const estimate = BridgeConfig[params.channel].wait - waiting;
    return estimate > 0 ? estimate : 0;
  }, [transaction?.created_time]);

  const router = useRouter();

  function handleOpenHistory() {
    toggleOpenModal();
    setTimeout(() => router.push('/bridge/history'), 0);
  }

  function handleNewTransfer() {
    toggleOpenModal();
    setTimeout(() => router.push('/bridge'), 0);
  }

  function handleOpenTx() {
    const { from_chain, from_chain_hash, to_chain, to_chain_hash } =
      transaction;

    window.open(
      to_chain_hash
        ? formatTxExplorerUrl(to_chain, to_chain_hash)
        : formatTxExplorerUrl(from_chain, from_chain_hash),
      '_blank'
    );
  }

  return (
    transaction && (
      <Modal
        {...props}
        overlayClassName="modal-overlay"
        onRequestClose={toggleOpenModal}
      >
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
                `/chain/${transaction.from_chain.toLowerCase()}.svg`
              )}
              className="w-7 h-7"
            />
            <div className="bridge-status-process">
              {transaction.status === 'DELIVERED' ? (
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
                `/chain/${transaction.to_chain.toLowerCase()}.svg`
              )}
              className="w-7 h-7"
            />
          </div>
          <div className="my-6 text-center text-white">
            {transaction.status === 'DELIVERED'
              ? `Bridge Completed`
              : `Est. Bridging Time: ${estimateTime} mins`}
          </div>
          <div className="text-center mb-6">
            You can view your transaction on the{' '}
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
            {transaction.status === 'DELIVERED' && (
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
    )
  );
}
