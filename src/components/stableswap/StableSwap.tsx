import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ConnectToNearBtn, SolidButton } from '~components/button/Button';
import InputAmount from '~components/forms/InputAmount';
import SlippageSelector from '~components/forms/SlippageSelector';
import SubmitButton from '~components/forms/SubmitButton';
import { TokenMetadata, ftGetBalance } from '~services/ft-contract';
import { wallet } from '~services/near';
import { swap } from '~services/stable-swap';
import { TokenBalancesView } from '~services/token';
import { useStableSwap, useSwap } from '~state/swap';
import { isMobile } from '~utils/device';
import Alert from '../alert/Alert';
import { SmallWallet } from '~components/icon/SmallWallet';

import {
  calculateExchangeRate,
  toPrecision,
  toReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import { DetailView, SwapAnimation, TokensRadio } from './StableSwapComponents';
import { CountdownTimer } from '~components/icon';
interface StableSwapProps {
  balances: TokenBalancesView;
  tokens: TokenMetadata[];
}
const SWAP_SLIPPAGE_KEY = 'REF_FI_STABLE_SWAP_SLIPPAGE_VALUE';
export const STABLE_SWAP_USE_NEAR_BALANCE_KEY =
  'REF_FI_STABLE_USE_NEAR_BALANCE_VALUE';
export default function StableSwap({ tokens, balances }: StableSwapProps) {
  const [tokenIn, setTokenIn] = useState<TokenMetadata>(tokens[0]);
  const [tokenOut, setTokenOut] = useState<TokenMetadata>(tokens[1]);
  const [tokenInAmount, setTokenInAmount] = useState<string>('1');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [useNearBalance, setUseNearBalance] = useState<boolean>(
    localStorage.getItem(STABLE_SWAP_USE_NEAR_BALANCE_KEY) != 'false'
  );
  const [tokenInBalanceFromNear, setTokenInBalanceFromNear] =
    useState<string>();
  const [tokenOutBalanceFromNear, setTokenOutBalanceFromNear] =
    useState<string>();
  const intl = useIntl();
  const onChangeSlip = (slippage: number) => {
    setSlippageTolerance(slippage);
    localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
  };

  const [loadingTrigger, setLoadingTrigger] = useState<boolean>(false);

  const { tokenOutAmount, pool, canSwap, minAmountOut, swapError, makeSwap } =
    useStableSwap({
      tokenIn,
      tokenInAmount,
      tokenOut,
      slippageTolerance,
      loadingTrigger,
      setLoadingTrigger,
    });

  const handleSwapFrom = (tokenFrom: string) => {
    setTokenIn(tokens.filter((item) => item.id === tokenFrom)[0]);
  };
  const handleSwapTo = (tokenTo: string) => {
    setTokenOut(tokens.filter((item) => item.id === tokenTo)[0]);
  };

  useEffect(() => {
    if (useNearBalance) {
      if (tokenIn) {
        const tokenInId = tokenIn.id;
        if (tokenInId) {
          if (wallet.isSignedIn()) {
            ftGetBalance(tokenInId).then((available) =>
              setTokenInBalanceFromNear(
                toReadableNumber(tokenIn?.decimals, available)
              )
            );
          }
        }
      }
      if (tokenOut) {
        const tokenOutId = tokenOut.id;
        if (tokenOutId) {
          if (wallet.isSignedIn()) {
            ftGetBalance(tokenOutId).then((available) =>
              setTokenOutBalanceFromNear(
                toReadableNumber(tokenOut?.decimals, available)
              )
            );
          }
        }
      }
    }
  }, [tokenIn, tokenOut, useNearBalance]);

  useEffect(() => {
    const rememberedSlippageTolerance =
      localStorage.getItem(SWAP_SLIPPAGE_KEY) || slippageTolerance;

    setSlippageTolerance(Number(rememberedSlippageTolerance));
  }, []);

  const tokenInMax = useNearBalance
    ? tokenInBalanceFromNear || '0'
    : toReadableNumber(tokenIn?.decimals, balances?.[tokenIn?.id]) || '0';
  const tokenOutTotal = useNearBalance
    ? tokenOutBalanceFromNear || '0'
    : toReadableNumber(tokenOut?.decimals, balances?.[tokenOut?.id]) || '0';
  const canSubmit = canSwap && (tokenInMax != '0' || !useNearBalance);

  return (
    <form className="overflow-y-auto bg-secondary shadow-2xl rounded-2xl py-6 bg-dark xs:rounded-lg md:rounded-lg">
      <div className="formTitle flex justify-between text-xl text-white text-left px-8">
        <FormattedMessage id="stable_swap" defaultMessage="StableSwap" />
        <div className="flex items-center">
          <div
            onClick={() => {
              setLoadingTrigger(true);
            }}
            className="mx-4 cursor-pointer"
          >
            <CountdownTimer loadingTrigger={loadingTrigger} />
          </div>
          <SlippageSelector
            slippageTolerance={slippageTolerance}
            onChange={onChangeSlip}
            useNearBalance={useNearBalance.toString()}
            bindUseBalance={(useNearBalance) => {
              setUseNearBalance(useNearBalance);
              localStorage.setItem(
                STABLE_SWAP_USE_NEAR_BALANCE_KEY,
                useNearBalance.toString()
              );
            }}
          />
        </div>
      </div>
      <div className="flex mt-6 px-8">
        <div className="flex-1">
          <p className="text-primaryText text-xs pb-2">
            From:{' '}
            <span className="float-right" title={tokenInMax}>
              {useNearBalance ? (
                <span className="mr-2 float-left">
                  <SmallWallet />
                </span>
              ) : null}
              <FormattedMessage id="balance" defaultMessage="Balance" />: &nbsp;
              {toPrecision(tokenInMax, 3)}
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
            max={tokenInMax}
          />
        </div>

        <SwapAnimation
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          setTokenIn={(token: TokenMetadata) => setTokenIn(token)}
          setTokenOut={(token: TokenMetadata) => setTokenOut(token)}
          setTokenInAmount={setTokenInAmount}
        />

        <div className="flex-1">
          <p className="text-primaryText text-xs pb-2">
            To:{' '}
            <span className=" float-right" title={tokenOutTotal}>
              {useNearBalance ? (
                <span className="mr-2 float-left">
                  <SmallWallet />
                </span>
              ) : null}
              <FormattedMessage id="balance" defaultMessage="Balance" />: &nbsp;
              {toPrecision(tokenOutTotal, 3)}
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

      <div
        className={`text-primaryText text-center mx-8 ${
          tokenIn.id === tokenOut.id ? 'hidden' : ''
        }`}
      >
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
      <div className="mx-8">
        <div className="pb-2">
          {swapError && <Alert level="error" message={swapError.message} />}
        </div>
      </div>

      <div className="mx-8 mt-8">
        {wallet.isSignedIn() ? (
          <SolidButton
            className="w-full text-lg"
            disabled={!canSubmit}
            onClick={(e) => {
              e.preventDefault();

              canSubmit && makeSwap(useNearBalance);
            }}
          >
            <FormattedMessage id="swap" defaultMessage="Swap" />
          </SolidButton>
        ) : (
          <ConnectToNearBtn />
        )}
      </div>
    </form>
  );
}
