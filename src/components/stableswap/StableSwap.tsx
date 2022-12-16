import React, { useEffect, useState, useContext, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  ButtonTextWrapper,
  ConnectToNearBtn,
  SolidButton,
} from '~components/button/Button';
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
import { RefIcon } from '~components/icon/Common';

import {
  calcStableSwapPriceImpact,
  calculateExchangeRate,
  toPrecision,
  toReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import {
  DetailView,
  SwapAnimation,
  TokensRadio,
  TokensRadioLeft,
  TokensRadioRight,
} from './StableSwapComponents';
import { CountdownTimer } from '~components/icon';
import { StablePool } from '~services/pool';
import { BeatLoading } from '~components/layout/Loading';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { getAccount } from '../../services/airdrop';
import { DoubleCheckModal } from '../layout/SwapDoubleCheck';
import BigNumber from 'bignumber.js';
interface StableSwapProps {
  balances: TokenBalancesView;
  tokens: TokenMetadata[];
  stablePool: StablePool;
  setLoadingTrigger: (mode: boolean) => void;
  loadingTrigger: boolean;
  setLoadingPause: (pause: boolean) => void;
  loadingPause: boolean;
}
const SWAP_SLIPPAGE_KEY = 'REF_FI_STABLE_SWAP_SLIPPAGE_VALUE';
export const STABLE_SWAP_USE_NEAR_BALANCE_KEY =
  'REF_FI_STABLE_USE_NEAR_BALANCE_VALUE';
export default function StableSwap({
  tokens,
  balances,
  stablePool,
  setLoadingTrigger,
  loadingTrigger,
  loadingPause,
  setLoadingPause,
}: StableSwapProps) {
  const [tokenIn, setTokenIn] = useState<TokenMetadata>(tokens[0]);
  const [tokenOut, setTokenOut] = useState<TokenMetadata>(tokens[1]);
  const [tokenInAmount, setTokenInAmount] = useState<string>('1');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(
    Number(localStorage.getItem(SWAP_SLIPPAGE_KEY)) || 0.1
  );

  const [showSwapLoading, setShowSwapLoading] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [useNearBalance, setUseNearBalance] = useState<boolean>(true);
  const [tokenInBalanceFromNear, setTokenInBalanceFromNear] =
    useState<string>();
  const [tokenOutBalanceFromNear, setTokenOutBalanceFromNear] =
    useState<string>();
  const intl = useIntl();
  const onChangeSlip = (slippage: number) => {
    setSlippageTolerance(slippage);
    localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
  };

  const [doubleCheckOpen, setDoubleCheckOpen] = useState(false);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const { wallet } = getCurrentWallet();

  const {
    tokenOutAmount,
    canSwap,
    minAmountOut,
    swapError,
    makeSwap,
    noFeeAmount,
    pool,
  } = useStableSwap({
    tokenIn,
    tokenInAmount,
    tokenOut,
    slippageTolerance,
    loadingTrigger: !loadingPause && loadingTrigger,
    setLoadingTrigger,
    stablePool,
  });

  const handleSwapFrom = (tokenFrom: string) => {
    setTokenIn(tokens.filter((item) => item.id === tokenFrom)[0]);

    if (tokenFrom === tokenOut.id) {
      const nextTokenOut = tokens.find((token) => token.id !== tokenFrom);
      setTokenOut(nextTokenOut);
    }
  };
  const handleSwapTo = (tokenTo: string) => {
    setTokenOut(tokens.filter((item) => item.id === tokenTo)[0]);

    if (tokenTo === tokenIn.id) {
      const nextTokenIn = tokens.find((token) => token.id !== tokenTo);
      setTokenIn(nextTokenIn);
    }
  };

  useEffect(() => {
    if (useNearBalance) {
      if (tokenIn) {
        const tokenInId = tokenIn.id;
        if (tokenInId) {
          if (isSignedIn) {
            ftGetBalance(tokenInId).then((available: string) =>
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
          if (isSignedIn) {
            ftGetBalance(tokenOutId).then((available: string) =>
              setTokenOutBalanceFromNear(
                toReadableNumber(tokenOut?.decimals, available)
              )
            );
          }
        }
      }
    }
  }, [tokenIn, tokenOut, useNearBalance, isSignedIn]);

  const priceImpactValue = useMemo(() => {
    try {
      return calcStableSwapPriceImpact(tokenInAmount, noFeeAmount);
    } catch (error) {
      return '0';
    }
  }, [noFeeAmount]);

  const tokenInMax = useNearBalance
    ? tokenInBalanceFromNear || '0'
    : toReadableNumber(tokenIn?.decimals, balances?.[tokenIn?.id]) || '0';
  const tokenOutTotal = useNearBalance
    ? tokenOutBalanceFromNear || '0'
    : toReadableNumber(tokenOut?.decimals, balances?.[tokenOut?.id]) || '0';
  const canSubmit =
    canSwap && (tokenInMax != '0' || !useNearBalance) && !loadingTrigger;

  const handleSubmit = async (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    const ifDoubleCheck =
      new BigNumber(tokenInAmount).isLessThanOrEqualTo(
        new BigNumber(tokenInMax)
      ) && Number(priceImpactValue) > 2;

    if (isSignedIn) {
      try {
        if (canSubmit) {
          setShowSwapLoading(true);
          setLoadingPause(true);
          if (ifDoubleCheck) setDoubleCheckOpen(true);
          else makeSwap(useNearBalance);
        }
      } catch (error) {}
    }
  };

  return (
    <>
      <form
        className="overflow-y-auto bg-secondary shadow-2xl rounded-2xl py-6 bg-dark xs:rounded-lg md:rounded-lg pb-16"
        onSubmit={handleSubmit}
      >
        <div className="formTitle flex justify-between text-xl text-white text-left px-8">
          <FormattedMessage id="stable_swap" defaultMessage="StableSwap" />
          <div className="flex items-center">
            <div
              onClick={() => {
                if (loadingPause) {
                  setLoadingTrigger(true);
                  setLoadingPause(false);
                } else {
                  setLoadingPause(true);
                }
              }}
              className="mx-4 cursor-pointer"
            >
              <CountdownTimer
                loadingTrigger={loadingTrigger}
                loadingPause={loadingPause}
              />
            </div>
            <SlippageSelector
              slippageTolerance={slippageTolerance}
              onChange={onChangeSlip}
              validSlippageList={[0.05, 0.1, 0.2]}
            />
          </div>
        </div>
        {/* for pc */}
        <div className="xs:hidden md:hidden">
          <div className="flex mt-6 px-8">
            <div className="flex-1 flex flex-col">
              <div className="text-primaryText text-xs pb-2 self-end flex items-center">
                <FormattedMessage id="balance" defaultMessage="Balance" />:
                &nbsp;
                <span title={tokenInMax}>
                  {toPrecision(tokenInMax, 3, true)}
                </span>
              </div>
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

            <div className="flex-1 flex flex-col">
              <div className="text-primaryText text-xs pb-2 self-end flex items-center">
                <FormattedMessage id="balance" defaultMessage="Balance" />:
                &nbsp;
                <span title={tokenOutTotal}>
                  {toPrecision(tokenOutTotal, 3, true)}
                </span>
              </div>
              <InputAmount
                className="border border-transparent rounded"
                id="inputAmount"
                disabled={true}
                name={tokenOut?.id}
                value={toPrecision(tokenOutAmount, 8)}
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
        </div>
        {/* for mobile */}
        <div className="flex flex-col mt-6 px-8 lg:hidden">
          <div className="flex-1 flex flex-col">
            <div className="text-primaryText text-xs pb-2 self-end flex items-center">
              <FormattedMessage id="balance" defaultMessage="Balance" />: &nbsp;
              <span title={tokenInMax}>{toPrecision(tokenInMax, 3, true)}</span>
            </div>
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
          <TokensRadioLeft
            tokens={tokens}
            tokenIn={tokenIn}
            handleSwapFrom={handleSwapFrom}
          ></TokensRadioLeft>
          <SwapAnimation
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            setTokenIn={(token: TokenMetadata) => setTokenIn(token)}
            setTokenOut={(token: TokenMetadata) => setTokenOut(token)}
            setTokenInAmount={setTokenInAmount}
          />
          <div className="flex-1 flex flex-col">
            <div className="text-primaryText text-xs pb-2 self-end flex items-center">
              <FormattedMessage id="balance" defaultMessage="Balance" />: &nbsp;
              <span title={tokenOutTotal}>
                {toPrecision(tokenOutTotal, 3, true)}
              </span>
            </div>
            <InputAmount
              className="border border-transparent rounded"
              id="inputAmount"
              disabled={true}
              name={tokenOut?.id}
              value={toPrecision(tokenOutAmount, 8)}
            />
          </div>
          <TokensRadioRight
            tokens={tokens}
            tokenOut={tokenOut}
            handleSwapTo={handleSwapTo}
          ></TokensRadioRight>
        </div>
        <div
          className={`text-primaryText text-center mx-8 ${
            tokenIn.id === tokenOut.id ? 'hidden' : ''
          }`}
        >
          <DetailView
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            from={tokenInAmount}
            to={tokenOutAmount}
            minAmountOut={minAmountOut}
            canSwap={canSwap}
            noFeeAmount={noFeeAmount}
            pool={pool}
            priceImpactValue={priceImpactValue}
          />
        </div>
        <div className="mx-8">
          <div className="pb-2 relative -mb-6 mt-2">
            {swapError && <Alert level="warn" message={swapError.message} />}
          </div>
        </div>

        <div className="mx-8 mt-8">
          {isSignedIn ? (
            <SolidButton
              className="w-full text-lg"
              disabled={
                !canSubmit ||
                showSwapLoading ||
                (loadingTrigger && !loadingPause)
              }
              loading={showSwapLoading || (loadingTrigger && !loadingPause)}
            >
              <ButtonTextWrapper
                loading={showSwapLoading || (loadingTrigger && !loadingPause)}
                Text={() => (
                  <FormattedMessage id="swap" defaultMessage="Swap" />
                )}
              />
            </SolidButton>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </form>
      <DoubleCheckModal
        isOpen={doubleCheckOpen}
        onRequestClose={() => {
          setDoubleCheckOpen(false);
          setShowSwapLoading(false);
          setLoadingPause(false);
        }}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
        from={tokenInAmount}
        onSwap={() => makeSwap(useNearBalance)}
        priceImpactValue={priceImpactValue}
      />
    </>
  );
}
