import React from 'react';
import MicroModal from 'react-micro-modal';
import TokenList from '../tokens/TokenList';
import { TokenMetadata } from '../../services/token';
import DownArrow from '../../assets/misc/select-arrow.svg';

export default function SelectToken({
  tokens,
  selected,
  render,
  onSelect,
}: {
  tokens: TokenMetadata[];
  selected: string | React.ReactElement;
  render?: (token: TokenMetadata) => React.ReactElement;
  onSelect?: (token: TokenMetadata) => void;
}) {
  return (
    <MicroModal
      trigger={(open) => (
        <button className="focus:outline-none p-1" type="button" onClick={open}>
          {selected || <DownArrow className="stroke-current text-inputText" />}
        </button>
      )}
      overrides={{
        Dialog: { style: { maxWidth: 'auto' } },
      }}
    >
      {(close) => (
        <section>
          <h2>Select Token</h2>
          <TokenList
            tokens={tokens}
            render={render}
            onClick={(token) => {
              onSelect && onSelect(token);
              close();
            }}
          />
        </section>
      )}
    </MicroModal>
  );
}
