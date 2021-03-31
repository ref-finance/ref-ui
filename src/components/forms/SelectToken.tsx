import React, { useEffect, useState } from 'react';
import MicroModal from 'react-micro-modal';
import TokenList from '../tokens/TokenList';
import { getRegisteredTokens } from '../../services/token';

export default function SelectToken({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect?: (id: string) => void;
}) {
  const [tokenIds, setTokenIds] = useState<string[]>();

  useEffect(() => {
    getRegisteredTokens().then(setTokenIds);
  }, []);

  return (
    <MicroModal
      trigger={(open) => (
        <button type="button" onClick={open}>
          {selected || 'Open'}
        </button>
      )}
    >
      {(close) => (
        <>
          <h2>Select Token</h2>
          <TokenList
            tokenIds={tokenIds}
            onClick={(id) => {
              onSelect && onSelect(id);
              close();
            }}
          />
        </>
      )}
    </MicroModal>
  );
}
