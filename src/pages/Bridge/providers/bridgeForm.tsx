import React, { createContext, useContext, useEffect, useState } from 'react';

import BridgePreviewModal from '../components/BridgePreview';
import useBridgeForm from './../hooks/useBridgeForm';

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
  const { bridgeFromValue, bridgeToValue, bridgeChannel, ...restHooks } =
    useBridgeForm();

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
    bridgeChannel,
    openPreviewModal,
  };

  return (
    <BridgeFormContext.Provider value={exposes}>
      {children}
      {bridgeChannel && (
        <BridgePreviewModal
          isOpen={previewModalOpen}
          toggleOpenModal={toggleOpen}
        />
      )}
    </BridgeFormContext.Provider>
  );
}
