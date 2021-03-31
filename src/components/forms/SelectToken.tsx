import React, { useEffect, useState } from 'react';
import MicroModal from 'react-micro-modal';
import TokenList from '../tokens/TokenList';
import { TokenMetadata } from '../../services/token';
import DownArrow from '../../assets/misc/select-arrow.svg';

export default function SelectToken({
  tokens,
  selected,
  onSelect,
}: {
  tokens: TokenMetadata[];
  selected: string | React.ReactElement;
  onSelect?: (token: TokenMetadata) => void;
}) {
  return (
    <MicroModal
      trigger={(open) => (
        <button className="p-1" type="button" onClick={open}>
          {selected || <DownArrow />}
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
