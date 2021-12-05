import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ConnectToNearBtn, SolidButton } from '~components/button/Button';
import InputAmount from '~components/forms/InputAmount';
import SlippageSelector from '~components/forms/SlippageSelector';
import SubmitButton from '~components/forms/SubmitButton';
import { TokenMetadata } from '~services/ft-contract';
import { wallet } from '~services/near';
import { TokenBalancesView } from '~services/token';
import { useStableSwap, useSwap } from '~state/swap';
import { isMobile } from '~utils/device';
import {
  calculateExchangeRate,
  toPrecision,
  toReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import { DetailView, SwapAnimation, TokensRadio } from './StableSwapComponents';
interface StableSwapProps {
  balances: TokenBalancesView;
  tokens: TokenMetadata[];
}
const SWAP_SLIPPAGE_KEY = 'REF_FI_STABLE_SWAP_SLIPPAGE_VALUE';
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
    localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
  };

  const { tokenOutAmount, pool, minAmountOut, canSwap } = useStableSwap({
    tokenIn,
    tokenInAmount: tokenInAmount,
    tokenOut,
    slippageTolerance,
  });

  const handleSwapFrom = (tokenFrom: string) => {
    setTokenIn(tokens.filter((item) => item.id === tokenFrom)[0]);
  };
  const handleSwapTo = (tokenTo: string) => {
    setTokenOut(tokens.filter((item) => item.id === tokenTo)[0]);
  };
  const handleSubmit = () => {
    event.preventDefault();

    if (wallet.isSignedIn()) {
      try {
      } catch (err) {}
    }
  };

  useEffect(() => {
    const rememberedSlippageTolerance =
      localStorage.getItem(SWAP_SLIPPAGE_KEY) || slippageTolerance;

    setSlippageTolerance(Number(rememberedSlippageTolerance));
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-y-auto bg-secondary shadow-2xl rounded-2xl py-6 bg-dark xs:rounded-lg md:rounded-lg"
    >
      <div className="formTitle flex justify-between text-xl text-white text-left px-8">
        <FormattedMessage id="stable_swap" defaultMessage="StableSwap" />
        <SlippageSelector
          slippageTolerance={slippageTolerance}
          onChange={onChangeSlip}
          bindUseBalance={bindUseBalance}
        />
      </div>
      <div className="flex mt-6 px-8">
        <div className="flex-1">
          <p className="text-primaryText text-xs pb-2">
            From:{' '}
            <span className="float-right">
              <FormattedMessage id="balance" defaultMessage="Balance" />: &nbsp;
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
              setTokenInAmount(amount);
            }}
            disabled={disabled}
            max={toReadableNumber(tokenIn.decimals, balances[tokenIn.id])}
          />
        </div>

        <SwapAnimation
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          setTokenIn={(token: TokenMetadata) => setTokenIn(token)}
          setTokenOut={(token: TokenMetadata) => setTokenOut(token)}
        />

        <div className="flex-1">
          <p className="text-primaryText text-xs pb-2">
            To:{' '}
            <span className=" float-right">
              <FormattedMessage id="balance" defaultMessage="Balance" />: &nbsp;
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
        handleSwapFrom={handleSwapFrom}
        handleSwapTo={handleSwapTo}
      />

      <div className="text-primaryText text-center mx-8">
        <DetailView
          pool={pool}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          from={tokenInAmount}
          to={tokenOutAmount}
          minAmountOut={minAmountOut}
          canSwap={canSwap}
        />
      </div>
      <div className="mx-8 mt-8">
        {wallet.isSignedIn() ? (
          <SolidButton className="w-full text-lg">
            <FormattedMessage id="swap" defaultMessage="Swap" />
          </SolidButton>
        ) : (
          <ConnectToNearBtn />
        )}
      </div>
    </form>
  );
}
