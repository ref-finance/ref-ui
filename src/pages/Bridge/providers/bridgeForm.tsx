import React, { createContext, useContext, useEffect, useState } from 'react';

import BridgePreviewModal from '../components/BridgePreview';
import useBridgeForm from './../hooks/useBridgeForm';
import { useWalletConnectContext } from './walletConcent';

type Props = ReturnType<typeof useBridgeForm> & {
  openPreviewModal: () => void;
};

const BridgeFormContext = createContext<Props>(null);

export function useBridgeFormContext() {
  return useContext(BridgeFormContext);
}

export default function BridgeFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    NEAR: { isSignedIn: isNEARSignedIn },
    EVM: { isSignedIn: isEVMSignedIn },
  } = useWalletConnectContext();

  const { bridgeFromValue, bridgeToValue, ...restHooks } = useBridgeForm();

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  function toggleOpen() {
    setPreviewModalOpen(!previewModalOpen);
  }
  function openPreviewModal() {
    setPreviewModalOpen(true);
  }

  const exposes = {
    ...restHooks,
    bridgeFromValue,
    bridgeToValue,

    openPreviewModal,
  };

  return (
    <BridgeFormContext.Provider value={exposes}>
      {children}
      {isNEARSignedIn && isEVMSignedIn && (
        <BridgePreviewModal
          isOpen={previewModalOpen}
          toggleOpenModal={toggleOpen}
        />
      )}
    </BridgeFormContext.Provider>
  );
}
