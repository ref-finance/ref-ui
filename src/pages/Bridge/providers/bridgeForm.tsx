import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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
  const { fromAccountAddress, toAccountAddress, ...restHooks } =
    useBridgeForm();

  const canPreview = useMemo(
    () => fromAccountAddress && toAccountAddress,
    [fromAccountAddress, toAccountAddress]
  );

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  function toggleOpen() {
    setPreviewModalOpen(!previewModalOpen);
  }
  function openPreviewModal() {
    console.log('openPreviewModal');
    setPreviewModalOpen(true);
  }

  const exposes = {
    ...restHooks,
    fromAccountAddress,
    toAccountAddress,
    openPreviewModal,
  };

  return (
    <BridgeFormContext.Provider value={exposes}>
      {children}
      {canPreview && (
        <BridgePreviewModal
          isOpen={previewModalOpen}
          toggleOpenModal={toggleOpen}
        />
      )}
    </BridgeFormContext.Provider>
  );
}
