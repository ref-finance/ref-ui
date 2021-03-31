import React, { useEffect, useState } from 'react';
import MicroModal from 'react-micro-modal';
import TokenList from '../tokens/TokenList';
import { TokenMetadata } from '../../services/token';

export default function SelectToken({
  tokens,
  selected,
  onSelect,
}: {
  tokens: TokenMetadata[];
  selected: string;
  onSelect?: (token: TokenMetadata) => void;
}) {
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
            tokens={tokens}
            onClick={(token) => {
              onSelect && onSelect(token);
              close();
            }}
          />
        </>
      )}
    </MicroModal>
  );
}
