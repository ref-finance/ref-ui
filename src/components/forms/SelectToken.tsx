import React from 'react';
import MicroModal from 'react-micro-modal';
import { FaAngleDown } from 'react-icons/fa';
import TokenList from '../tokens/TokenList';
import { TokenMetadata } from '../../services/ft-contract';
import { ArrowDownGreen } from '../icon';

export default function SelectToken({
  tokens,
  selected,
  render,
  onSelect,
  addToken,
  standalone,
  placeholder,
}: {
  tokens: TokenMetadata[];
  selected: string | React.ReactElement;
  standalone?: boolean;
  placeholder?: string;
  render?: (token: TokenMetadata) => React.ReactElement;
  onSelect?: (token: TokenMetadata) => void;
  addToken?: () => JSX.Element;
}) {
  if (!onSelect) {
    return (
        <button className="focus:outline-none p-1" type="button">
          {selected}
        </button>
    );
  }

  return (
      <MicroModal
          trigger={(open) => (
              <button
                  className={`focus:outline-none ${standalone ? 'w-full' : ''}`}
                  type="button"
                  onClick={open}
              >
                {selected || (
                    <section
                        className={`flex justify-between items-center px-3 py-3 ${
                            standalone
                                ? 'bg-inputBg relative flex overflow-hidden rounded-lg align-center my-2 border'
                                : ''
                        }`}
                    >
                      <p
                          className="text-xs font-semibold leading-none"
                          style={{ lineHeight: 'unset' }}
                      >
                        {placeholder ?? 'Select'}
                      </p>
                      <div className="pl-2">
                        <ArrowDownGreen />
                      </div>
                    </section>
                )}
              </button>
          )}
          overrides={{
            Dialog: {
              style: { width: '25%', borderRadius: '0.75rem', padding: '1.5rem' },
            },
          }}
      >
        {(close) => (
            <section>
              <div className="flex border-b items-center justify-between pb-5">
                <h2 className="text-sm font-bold text-center">Select Token</h2>
                {addToken && addToken()}
              </div>
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