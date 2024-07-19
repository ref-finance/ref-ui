import React, { createContext, useContext, useEffect, useState } from 'react';

import BridgeTransactionStatusModal from '../components/BridgeTransactionStatus';
import { useRoute, useRouter } from '../hooks/useRouter';
import { toast } from 'react-toastify';
import { BridgeTransferParams } from '../services/bridge';
import { nearServices } from '../services/contract';
import { storageStore } from '../utils/common';

type Props = {
  openBridgeTransactionStatusModal: (
    param: BridgeTransferParams,
    hash: string
  ) => void;
};

const BridgeTransactionContext = createContext<Props>(null);

export function useBridgeTransactionContext() {
  return useContext(BridgeTransactionContext);
}

export default function BridgeTransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { query } = useRoute<{
    transactionHashes?: string;
    errorMessage?: string;
  }>();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  function toggleOpen() {
    setIsOpen(!isOpen);
    if (!isOpen) storageStore().remove('bridgeTransferParams');
  }
  function openBridgeTransactionStatusModal(
    params: BridgeTransferParams,
    hash: string
  ) {
    setTransaction({ params, hash });
    setIsOpen(true);
  }

  const [transaction, setTransaction] =
    useState<{ params: BridgeTransferParams; hash: string }>();

  useEffect(() => {
    async function handleTransactionStatus() {
      if (query.transactionHashes) {
        const txhash = query.transactionHashes.split(',');
        const transactions = await Promise.all(
          txhash.map(async (tx) => {
            const res = await nearServices.getTransactionResult(tx);
            return res;
          })
        );
        const transaction = transactions.find(
          (item) =>
            item.transaction.receiver_id === 'aurora' &&
            item.transaction.actions?.[0]?.FunctionCall?.method_name === 'call'
        );
        const tranferParams = storageStore().get<BridgeTransferParams>(
          'bridgeTransferParams'
        );
        if (transaction?.transaction.hash && tranferParams)
          openBridgeTransactionStatusModal(
            tranferParams,
            transaction?.transaction.hash
          );

        router.replace({ search: '' });
      }
      if (query.errorMessage) {
        const errorMessage =
          'Transaction Failed: ' + decodeURIComponent(query.errorMessage);
        toast.error(errorMessage, {
          theme: 'dark',
        });
        router.replace({ search: '' });
      }
    }
    handleTransactionStatus();
  }, []);

  const exposes = {
    openBridgeTransactionStatusModal,
  };

  return (
    <BridgeTransactionContext.Provider value={exposes}>
      {children}
      {transaction && (
        <BridgeTransactionStatusModal
          {...transaction}
          isOpen={isOpen}
          toggleOpenModal={toggleOpen}
        ></BridgeTransactionStatusModal>
      )}
    </BridgeTransactionContext.Provider>
  );
}
