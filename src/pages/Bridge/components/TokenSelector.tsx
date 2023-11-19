import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

import { IconArrowDown, IconClose, IconSearch } from '../assets';
import Button from './Button';

export type TokenSelectorProps = {
  chain: BridgeModel.BridgeSupportChain;
  token?: string;
  onClick?: Parameters<typeof Button>[number]['onClick'];
};

export function SelectTokenButton({
  token,
  onClick,
}: Partial<TokenSelectorProps>) {
  return (
    <Button rounded onClick={onClick}>
      {token ? (
        <>
          <span className="inline-block w-7 h-7 bg-white rounded-lg mr-2" />{' '}
          <span className=" text-white mr-2">{token}</span>
        </>
      ) : (
        <span className=" text-white mr-2">Select token </span>
      )}

      <IconArrowDown />
    </Button>
  );
}

const chainList: { label: string; value: BridgeModel.BridgeSupportChain }[] = [
  { label: 'Ethereum NetWork', value: 'ETH' },
  { label: 'NEAR NetWork', value: 'NEAR' },
];

export function TokenSelector({
  toggleOpenModal,
  chain,
  token,
  ...props
}: Modal.Props & { toggleOpenModal: () => void } & TokenSelectorProps) {
  const [tokenFilter, setTokenFilter] = useState<{
    text: string;
    chain: BridgeModel.BridgeSupportChain;
  }>({ text: '', chain });

  useEffect(() => {
    setTokenFilter({ text: tokenFilter.text, chain });
  }, [chain, tokenFilter.text]);

  return (
    <Modal {...props} onRequestClose={toggleOpenModal}>
      <div className="bridge-modal" style={{ width: '428px' }}>
        <div className="flex items-center justify-between">
          <span className="text-base text-white font-medium">
            Select a token
          </span>
          <Button text onClick={toggleOpenModal}>
            <IconClose />
          </Button>
        </div>
        <div className="my-3">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -mt-2" />
            <input
              className="bridge-input"
              style={{ paddingLeft: '2.2rem' }}
              value={tokenFilter.text}
              placeholder="Search name or paste address"
              onChange={(e) =>
                setTokenFilter({ ...tokenFilter, text: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <div className="relative flex items-center">
            {chainList.map(({ label, value }) => (
              <div
                key={value}
                className={`leading-10 w-full text-center border-b-2 cursor-pointer ${
                  tokenFilter.chain === value
                    ? `text-white  border-primary `
                    : 'border-transparent'
                }`}
                onClick={() => setTokenFilter({ ...tokenFilter, chain: value })}
              >
                {label}
              </div>
            ))}
            <div className="absolute bottom-0 left-0 w-full h-px bg-white opacity-20"></div>
          </div>
          <div>{token}</div>
        </div>
      </div>
    </Modal>
  );
}
