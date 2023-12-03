import React, { MouseEventHandler, useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';

import Button from './Button';
import { ChainConfig, TokenList } from '../config';
import SvgIcon from './SvgIcon';
import useBridgeToken from './../hooks/useBridgeToken';
import { useRequest } from '../hooks/useRequest';
import { ethServices, nearServices } from '../services/contract';
import { formatDisplayBalance } from '../utils/format';

type TokenSelectorCommonProps = {
  chain: BridgeModel.BridgeSupportChain;
  token?: BridgeModel.BridgeTokenMeta;
  onClick?: MouseEventHandler;
};

export function SelectTokenButton({
  token,
  onClick,
}: Partial<TokenSelectorCommonProps>) {
  return (
    <Button rounded onClick={onClick}>
      {token ? (
        <>
          <img className="w-7 h-7 rounded-full mr-2" src={token.icon} />
          <span className="text-white mr-2">{token.symbol}</span>
        </>
      ) : (
        <span className="text-white mr-2">Select token </span>
      )}
      <SvgIcon name="IconArrowDown" />
    </Button>
  );
}

function TokenItem({
  isSelect,
  chain,
  item,
  onClick,
}: {
  isSelect?: boolean;
  chain: BridgeModel.BridgeSupportChain;
  item: BridgeModel.BridgeTokenMeta;
  onClick?: MouseEventHandler;
}) {
  const { getTokenBalance } = useBridgeToken();
  const { data: balance, loading } = useRequest(() =>
    getTokenBalance(chain, item)
  );
  return (
    <div
      className="flex items-center justify-between py-3 px-4 -mx-4 cursor-pointer hover:bg-white hover:bg-opacity-10"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="w-9 h-9 relative mr-3">
          <img className="w-full h-full  rounded-full" src={item.icon} />
          <SvgIcon
            name={chain === 'ETH' ? 'IconChainEthereum' : 'IconChainNear'}
            className="absolute right-0 bottom-0"
          />
        </div>
        <div>
          <div className="text-base text-white mb-1">{item.symbol}</div>
          <div className="text-xs">{ChainConfig[chain].name}</div>
        </div>
      </div>
      <div className="text-white text-opacity-50">
        <div className="text-right mb-1">
          {isSelect && (
            <SvgIcon
              name="IconSuccess"
              className="inline-block mr-2 text-primary"
            />
          )}
          <span
            className="inline-block text-white text-sm"
            style={{ minWidth: '3rem' }}
          >
            {loading ? (
              <span className="text-gray-400">...</span>
            ) : (
              formatDisplayBalance(balance, item.decimals)
            )}
          </span>
        </div>
        <div className="text-right text-xs">$0.00</div>
      </div>
    </div>
  );
}

const chainList = Object.entries(ChainConfig).map(([key, { name }]) => ({
  label: name,
  value: key as BridgeModel.BridgeSupportChain,
}));
export interface TokenSelectorProps
  extends Modal.Props,
    TokenSelectorCommonProps {
  toggleOpenModal: () => void;
  onSelected?: (v: BridgeModel.BridgeTokenMeta) => void;
  onCancel?: () => void;
}
export function TokenSelector({
  toggleOpenModal,
  chain,
  token,
  ...props
}: TokenSelectorProps) {
  const [tokenFilter, setTokenFilter] = useState<{
    text: string;
    chain: BridgeModel.BridgeSupportChain;
  }>({ text: '', chain });

  useEffect(() => {
    setTokenFilter({ text: tokenFilter.text, chain });
  }, [chain, tokenFilter.text]);

  const { filterTokens } = useBridgeToken();
  const tokenList = useMemo(() => {
    return filterTokens(tokenFilter.chain, tokenFilter.text);
  }, [filterTokens, tokenFilter.chain, tokenFilter.text]);

  function handleSelected(item: BridgeModel.BridgeTokenMeta) {
    props.onSelected?.(item);
    toggleOpenModal();
  }

  function handleCancel() {
    props.onCancel?.();
    toggleOpenModal();
  }

  return (
    <Modal {...props} onRequestClose={handleCancel}>
      <div className="bridge-modal" style={{ width: '428px' }}>
        <div className="flex items-center justify-between">
          <span className="text-base text-white font-medium">
            Select a token
          </span>
          <Button text onClick={handleCancel}>
            <SvgIcon name="IconClose" />
          </Button>
        </div>
        <div className="my-3">
          <div className="relative">
            <SvgIcon
              name="IconSearch"
              className="absolute left-3 top-1/2 -mt-2"
            />
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
                {label} Network
              </div>
            ))}
            <div className="absolute bottom-0 left-0 w-full h-px bg-white opacity-20"></div>
          </div>
          <div>
            {tokenList.map((item) => (
              <TokenItem
                key={tokenFilter.chain + item.symbol}
                isSelect={token?.symbol === item.symbol}
                chain={tokenFilter.chain}
                item={item}
                onClick={() => handleSelected(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
