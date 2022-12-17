import React, { useEffect, useState } from 'react';

function XmaxPopUP({
  xmasModalOpen,
  setXmasModalOpen,
}: {
  xmasModalOpen: boolean;
  setXmasModalOpen: (xmasModalOpen: boolean) => void;
}) {
  if (xmasModalOpen) {
    alert('open');
  }

  return <div></div>;
}

interface XmasActivityContextValue {
  xmasModalOpen: boolean;
  setXmasModalOpen: (xmasModalOpen: boolean) => void;
}

const XmasActivityContext =
  React.createContext<XmasActivityContextValue | null>(null);

export const XmasActivityContextProvider: React.FC = ({ children }) => {
  const [xmasModalOpen, setXmasModalOpen] = useState(false);

  return (
    <XmasActivityContext.Provider
      value={{
        xmasModalOpen,
        setXmasModalOpen,
      }}
    >
      {children}
      <XmaxPopUP
        xmasModalOpen={xmasModalOpen}
        setXmasModalOpen={setXmasModalOpen}
      />
    </XmasActivityContext.Provider>
  );
};

export function useXmasActivity() {
  const context = React.useContext(XmasActivityContext);
  if (context === undefined) {
    throw new Error(
      'useXmasActivity must be used within a XmasActivityContextProvider'
    );
  }
  return context;
}
