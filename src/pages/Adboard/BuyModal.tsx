import React, { useEffect, useState } from 'react';
import { FaRegWindowClose, FaCheck } from 'react-icons/fa';
import TokenAmount from '~components/forms/TokenAmount';
import SelectToken from '../../components/forms/SelectToken';
import Icon from '../../components/tokens/Icon';
import { AdboardMetadata } from '../../services/adboard';
import { TokenMetadata } from '../../services/ft-contract';
import { useUserRegisteredTokens } from '../../state/token';

interface BuyModalProps {
  metadata: AdboardMetadata;
  tokens: TokenMetadata[];
  close: () => void;
}

const BuyModal = ({ metadata, close }: BuyModalProps) => {
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>();
  const tokens = useUserRegisteredTokens(metadata.owner);

  console.log(tokens);

  function buyFrame(frameId: number, tokenContract: string) {}

  return (
    <div className="fixed flex items-center justify-center w-screen h-screen">
      <div
        className="fixed w-screen h-screen blur"
        style={{
          filter: 'blur(5px)',
          background: 'rgba(0, 0, 0, 0.75)',
        }}
      ></div>
      <div className="fixed flex flex-row h-48 rounded-md shadow-xl bg-theme-normal">
        <div
          className="p-6"
          style={{
            backgroundColor: 'black',
            borderRadius: '6px',
          }}
        >
          <span className="mb-2 text-2xl font-semibold text-white">
            Buy #{metadata.frameId} with:
            <TokenAmount tokens={tokens} />
            <SelectToken
              tokens={tokens}
              selected={selectedToken && <Icon token={selectedToken} />}
              onSelect={setSelectedToken}
            />
          </span>
          <br></br>

          <div className="flex flex-row justify-around w-full mt-12">
            <button
              onClick={close}
              className="flex flex-row justify-center items-center h-auto py-2 font-semibold border border-solid rounded-md shadow-xl focus:outline-none border-theme-light w-28 text-theme-dark bg-theme-light"
              style={{ backgroundColor: 'green' }}
            >
              <FaRegWindowClose className="mr-2" />
              Cancel
            </button>
            <button
              onClick={close}
              className="flex flex-row justify-center items-center h-auto py-2 font-semibold border border-solid rounded-md shadow-xl focus:outline-none border-theme-light w-28 text-theme-dark bg-theme-light"
              style={{ backgroundColor: 'green' }}
            >
              <FaCheck className="mr-2" />
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
