import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ConnectToNearBtn } from '~components/button/Button';
import InputAmount from '~components/forms/InputAmount';
import SlippageSelector from '~components/forms/SlippageSelector';
import SubmitButton from '~components/forms/SubmitButton';
import { TokenMetadata } from '~services/ft-contract';
import { wallet } from '~services/near';
import { TokenBalancesView } from '~services/token';
import { useSwap } from '~state/swap';
import { isMobile } from '~utils/device';
import {
  calculateExchangeRate,
  toPrecision,
  toReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import { SwapAnimation, SwapRateDetail, TokensRadio } from './StableSwapComponents';
interface StableSwapProps {
  balances: TokenBalancesView;
  tokens: TokenMetadata[];
}
const SWAP_SLIPPAGE_KEY = 'REF_FI_SLIPPAGE_VALUE';
export default function StableSwap({ tokens, balances }: StableSwapProps) {
  const [tokenIn, setTokenIn] = useState<TokenMetadata>(tokens[0]);
  const [tokenOut, setTokenOut] = useState<TokenMetadata>(tokens[1]);
  const [tokenInAmount, setTokenInAmount] = useState<string>('1');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [disabled, setDisabled] = useState<boolean>(false);
  const intl = useIntl();
  const bindUseBalance = () => {};
  const onChangeSlip = (slippage: number) => {
    setSlippageTolerance(slippage);
  };

  const { canSwap, tokenOutAmount, minAmountOut, pool, swapError, makeSwap } =
    useSwap({
      tokenIn: tokenIn,
      tokenInAmount: tokenInAmount,
      tokenOut: tokenOut,
      slippageTolerance,
    });

  const handleSwapFrom = (e: any) => {
    setTokenIn(tokens.filter((item) => item.symbol === e.target.value)[0]);
  };
  const handleSwapTo = (e: any) => {
    setTokenOut(tokens.filter((item) => item.symbol === e.target.value)[0]);
  };
  const handleSubmit = () => {
    event.preventDefault();

    if (wallet.isSignedIn()) {
      try {
      } catch (err) {}
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-y-auto bg-secondary shadow-2xl rounded-2xl p-7 bg-dark xs:rounded-lg md:rounded-lg"
    >
      <h2 className="formTitle flex justify-between font-bold text-xl text-white text-left pb-2">
        <FormattedMessage id="stable_swap" defaultMessage="Stableswap" />
        <SlippageSelector
          slippageTolerance={slippageTolerance}
          onChange={onChangeSlip}
          bindUseBalance={bindUseBalance}
        />
      </h2>
      <div className=" flex mt-7">

        <div className=" flex-1">
          <p className=" text-primaryText text-xs pb-3">
            From:{' '}
            <span className=" float-right">
              {toPrecision(
                toReadableNumber(tokenIn.decimals, balances[tokenIn.id]),
                2,
                true
              )}
            </span>
          </p>
          <InputAmount
            className="border border-transparent rounded"
            id="inputAmount"
            name={tokenIn?.id}
            value={tokenInAmount}
            onChangeAmount={(amount) => {
              console.log(amount);
              setTokenInAmount(amount);
            }}
            disabled={disabled}
          />
        </div>

        <SwapAnimation tokenIn={tokenIn} tokenOut ={tokenOut} setTokenIn={(token:TokenMetadata)=> setTokenIn(token)} setTokenOut={(token:TokenMetadata)=> setTokenOut(token)} />

        <div className=" flex-1">
          <p className=" text-primaryText text-xs pb-3">
            To:{' '}
            <span className=" float-right">
              {toPrecision(
                toReadableNumber(tokenOut.decimals, balances[tokenOut.id]),
                2,
                true
              )}
            </span>
          </p>
          <InputAmount
            className="border border-transparent rounded"
            id="inputAmount"
            disabled={true}
            name={tokenOut?.id}
            value={tokenOutAmount}
          />
        </div>
      </div>

      <TokensRadio
        tokens={tokens}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        handleSwapFrom={(e) => {
          handleSwapFrom(e);
        }}
        handleSwapTo={(e) => {
          handleSwapTo(e);
        }}
      />

      <div className=" text-primaryText my-5 text-center">
        {pool && tokenInAmount && tokenOutAmount && (
          <SwapRateDetail
            title={intl.formatMessage({ id: 'exchange_rate' })}
            value={`1 ${toRealSymbol(
              tokenOut.symbol
            )} ≈ ${calculateExchangeRate(
              pool.fee,
              tokenOutAmount,
              tokenInAmount
            )} ${toRealSymbol(tokenIn.symbol)}`}
          />
        )}
      </div>
      {wallet.isSignedIn() ? (
        <SubmitButton disabled={!canSwap} label="Swap" />
      ) : (
        <ConnectToNearBtn />
      )}
    </form>
  );
}
