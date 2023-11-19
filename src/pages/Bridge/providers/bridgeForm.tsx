import React, { createContext, useContext } from 'react';

import useBridgeForm from './../hooks/useBridgeForm';

type Props = ReturnType<typeof useBridgeForm>;

const BridgeFormContext = createContext<Props>(null);

export function useBridgeFormContext() {
  return useContext(BridgeFormContext);
}

export default function BridgeFormProvider({ children }: any) {
  const formHooks = useBridgeForm();

  const exposes = {
    ...formHooks,
  };

  return (
    <BridgeFormContext.Provider value={exposes}>
      {children}
    </BridgeFormContext.Provider>
  );
}
