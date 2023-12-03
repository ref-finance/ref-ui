import React, { createContext, useContext, useEffect, useState } from 'react';

import BridgeTransactionStatusModal from '../components/BridgeTransactionStatus';
import { useRoute, useRouter } from '../hooks/useRouter';
import { toast } from 'react-toastify';
import { safeJSONParse } from '../utils/common';
import { NearConfig } from '../config';

type Props = {
  openBridgeTransactionStatusModal: () => void;
};

const BridgeTransactionStatusContext = createContext<Props>(null);

export function useBridgeTransactionStatusContext() {
  return useContext(BridgeTransactionStatusContext);
}

export default function BridgeTransactionStatusProvider({ children }: any) {
  const [tx, setTx] = useState('');
  const { searchParams, query } = useRoute<{
    transactionHashes?: string;
    errorCode?: 'Error';
    errorMessage?: string;
  }>();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  function toggleOpen() {
    setIsOpen(!isOpen);
  }
  function openBridgeTransactionStatusModal() {
    setIsOpen(true);
  }

  useEffect(() => {
    function handleTransactionStatus() {
      if (query.transactionHashes) {
        setTx(query.transactionHashes);
        openBridgeTransactionStatusModal();
        toast.success(`Transaction Successful`, {
          theme: 'dark',
        });
        router.replace({ search: '' });
      } else if (query.errorCode === 'Error') {
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
    <BridgeTransactionStatusContext.Provider value={exposes}>
      {children}
      <BridgeTransactionStatusModal
        tx={tx}
        isOpen={isOpen}
        toggleOpenModal={toggleOpen}
      />
    </BridgeTransactionStatusContext.Provider>
  );
}
