import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useSwap } from '../../state/swap';
import SelectToken from '../../components/forms/SelectToken';
import Icon from '../../components/tokens/Icon';
import { AdboardMetadata, buyFrameCall } from '../../services/adboard';
import { TokenMetadata } from '../../services/ft-contract';
import {
  useToken,
  useUserRegisteredTokens,
  useWhitelistTokens,
} from '../../state/token';
import { REF_ADBOARD_CONTRACT_ID } from '../../services/near';
import Alert from '../../components/alert/Alert';
import { toNonDivisibleNumber, toReadableNumber } from '../../utils/numbers';
import db from '../../store/RefDatabase';
import { toRealSymbol } from '~utils/token';

interface BuyModalProps {
  metadata: AdboardMetadata;
  tokens: TokenMetadata[];
  close: () => void;
}

const BuyModal = ({ metadata, close }: BuyModalProps) => {
  const [error, setError] = useState<Error>();
  const [selectedToken, setSelectedToken] = useState<TokenMetadata>();
  const [priceFactor, setPriceFactor] = useState<number>();
  const token = useToken(metadata.token_id);
  const tokens = useWhitelistTokens();

  const { minAmountOut, pool } = useSwap({
    tokenIn: token,
    tokenInAmount: toReadableNumber(
      token?.decimals || 24,
      String(metadata.token_price)
    ),
    tokenOut: selectedToken,
    slippageTolerance: 1.1,
  });

  const sellAmount = +minAmountOut * (priceFactor || 1.0);

  if (!token) return null;

  function callBuyEvent() {
    if (selectedToken === undefined) throw new Error('Please select token');
    if (!pool)
      throw new Error(
        'No pool support, please create pool for these two tokens'
      );

    buyFrameCall({
      frameId: metadata.frameId,
      tokenId: metadata.token_id,
      amount: metadata.token_price.toString(),
      receiverId: REF_ADBOARD_CONTRACT_ID,
      sellTokenId: selectedToken.id,
      sellPrice: toNonDivisibleNumber(
        selectedToken.decimals,
        sellAmount.toString()
      ),
      poolId: pool.id,
    });
  }

  function buyFrame() {
    setError(null);
    try {
      callBuyEvent();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <div className="fixed flex items-center justify-center w-screen h-4/5">
      <div
        className="fixed w-screen  h-4/5 blur"
        style={{
          filter: 'blur(5px)',
          background: 'rgba(0, 0, 0, 0.75)',
        }}
      ></div>
      <div className="fixed flex flex-col rounded-md shadow-xl bg-theme-normal">
        <div className="p-2 mx-8 rounded-xl rounded-b-none text-center bg-green-500 text-black font-semibold">
          {metadata.owner}
        </div>
        <div
          className="rounded-2xl"
          style={{
            backgroundColor: 'black',
          }}
        >
          <div className="mb-2 font-semibold text-white">
            <div
              className="float-right"
              style={{ marginTop: '6px', marginRight: '2px' }}
            >
              <button
                onClick={close}
                className="flex flex-row justify-center focus:outline-none"
              >
                <AiOutlineClose className="mr-2" />
              </button>
            </div>
            <div className="p-8">
              <span className="flex flex-col">
                <div className="mb-4">
                  Coordinate{' '}
                  <span className="float-right">
                    #{metadata.frameId.padStart(3, '0')}
                  </span>
                </div>
                <div className="mb-4">
                  Cost{' '}
                  <span className="float-right">
                    {toReadableNumber(
                      token?.decimals || 24,
                      String(metadata.token_price)
                    )}
                    <span className="ml-2">{toRealSymbol(token.symbol)}</span>
                  </span>
                </div>
                <div className="mb-4">
                  Price Set{' '}
                  {minAmountOut ? (
                    <span className="mr-2">{sellAmount}</span>
                  ) : null}
                  <div
                    className="inline-block float-right"
                    style={{ marginTop: '-3px' }}
                  >
                    <SelectToken
                      placeholder="Select token"
                      tokens={tokens}
                      selected={selectedToken && <Icon token={selectedToken} />}
                      onSelect={setSelectedToken}
                    />
                  </div>
                </div>
              </span>
              <p>
                And a price factor (between 0.9 and 1.1):
                <input
                  type="range"
                  min="0.9"
                  max="1.1"
                  step="0.1"
                  list="steplist"
                  defaultValue={1.0}
                  onChange={(event) => setPriceFactor(+event.target.value)}
                />
              </p>
              {error && <Alert level="error" message={error.message} />}
              <div className="flex flex-row justify-around w-full mt-6">
                <button
                  onClick={() => buyFrame()}
                  className="flex flex-row justify-center items-center text-green-600 bg-white h-auto py-2 font-semibold rounded-3xl focus:outline-none border-theme-light w-40"
                >
                  <FaCheck className="mr-2" />
                  Launch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
