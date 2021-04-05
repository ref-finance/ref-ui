import React from 'react';
import MicroModal from 'react-micro-modal';
import { FaAngleDown } from 'react-icons/fa';
import TokenList from '../tokens/TokenList';
import { TokenMetadata } from '../../services/ft-contract';

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
  if (!onSelect) {
    return (
      <button className="focus:outline-none p-1 col-span-3" type="button">
        {selected}
      </button>
    );
  }

  return (
    <MicroModal
      trigger={(open) => (
        <button
          className="focus:outline-none p-1 col-span-3"
          type="button"
          onClick={open}
        >
          {selected || (
            <section className="flex justify-end">
              <p className="text-sm">select token</p>
              <FaAngleDown className="stroke-current text-inputText block ml-1" />
            </section>
          )}
        </button>
      )}
      overrides={{
        Dialog: { style: { maxWidth: 'auto' } },
      }}
    >
      {(close) => (
        <section>
          <h2 className="text-2xl py-2 text-center border-b-2">Select Token</h2>
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
