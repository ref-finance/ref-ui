import React, { createContext, useContext, useState } from 'react';

import { TokenSelector, TokenSelectorProps } from '../components/TokenSelector';

type Props = {
  open: (props: TokenSelectorProps) => void;
};

const TokenSelectorContext = createContext<Props>(null);

export default function TokenSelectorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [chain, setChain] = useState<BridgeModel.BridgeSupportChain>('ETH');
  const [token, setToken] = useState<string>();
  function open({ chain, token }: TokenSelectorProps) {
    setChain(chain);
    setToken(token);
    setShow(true);
  }

  const exposes = {
    open,
  };
  return (
    <TokenSelectorContext.Provider value={exposes}>
      {children}
      <TokenSelector
        isOpen={show}
        toggleOpenModal={() => setShow(!show)}
        chain={chain}
        token={token}
      />
    </TokenSelectorContext.Provider>
  );
}

export function useTokenSelectorContext() {
  const context = useContext(TokenSelectorContext);
  if (!context) {
    throw new Error(
      'useTokenSelectorContext must be used within a TokenSelectorProvider'
    );
  }
  return context;
}
