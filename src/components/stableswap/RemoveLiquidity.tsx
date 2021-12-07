import BigNumber from 'bignumber.js';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Alert from '~components/alert/Alert';
import { ConnectToNearBtn, SolidButton } from '~components/button/Button';
import { Card } from '~components/card/Card';
import {
  PoolSlippageSelector,
  StableSlipSelecter,
} from '~components/forms/SlippageSelector';
import { Near } from '~components/icon';
import { TokenMetadata } from '~services/ft-contract';
import { REF_FARM_CONTRACT_ID, wallet } from '~services/near';
import { Pool } from '~services/pool';
import { TokenBalancesView } from '~services/token';
import { useRemoveLiquidity } from '~state/pool';
import {
  toInternationalCurrencySystem,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import StableTokenList, {
  FlexibleStableTokenList,
  OneTokenSelector,
  StableTokensSymbol,
} from './StableTokenList';

const SWAP_SLIPPAGE_KEY = 'REF_FI_STABLE_SWAP_REMOVE_LIQUIDITY_SLIPPAGE_VALUE';

function Icon(props: { icon?: string; className?: string; style?: any }) {
  const { icon, className, style } = props;
  return icon ? (
    <img
      className={`block ${className} rounded-full border border-gradientFromHover border-solid`}
      src={icon}
      style={style}
    />
  ) : (
    <div
      className={`rounded-full ${className} border border-gradientFromHover  border-solid`}
      style={style}
    />
  );
}
const marks = {
  0: '0%',
  25: '26%',
  50: '50%',
  75: '75%',
  100: {
    style: {
      color: '#f50',
    },
    label: <strong>100%</strong>,
  },
};

export function RemoveLiquidityComponent(props: {
  shares: string;
  balances: TokenBalancesView;
  tokens: TokenMetadata[];
}) {
  const { shares, tokens, balances } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [thirdTokenAmount, setThirdTokenAmount] = useState<string>('');
  const [isPercentage, setIsPercentage] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>('');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const intl = useIntl();
  const [sharePercentage, setSharePercentage] = useState<string>('0');
  const progressBarIndex = [0, 25, 50, 75, 100];
  const [selectedToken, setSelectedToken] = useState<string>('');

  const setAmountsFlexible = [
    setFirstTokenAmount,
    setSecondTokenAmount,
    setThirdTokenAmount,
  ];

  function validate({
    firstAmount,
    secondAmount,
    thirdAmount,
    tokens,
    balances,
  }: {
    firstAmount: string;
    secondAmount: string;
    thirdAmount: string;
    tokens: TokenMetadata[];
    balances: TokenBalancesView;
  }) {
    const firstTokenAmountBN = new BigNumber(firstAmount.toString());
    const firstTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
    );
    const secondTokenAmountBN = new BigNumber(secondAmount.toString());
    const secondTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
    );
    const thirdTokenAmountBN = new BigNumber(thirdAmount.toString());
    const thirdTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[2].decimals, balances[tokens[2].id])
    );
    setError(null);
    setCanSubmit(false);

    if (firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN)) {
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[0].symbol
        )}`
      );
    }

    if (secondTokenAmountBN.isGreaterThan(secondTokenBalanceBN)) {
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[1].symbol
        )}`
      );
    }

    if (thirdTokenAmountBN.isGreaterThan(thirdTokenBalanceBN)) {
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[2].symbol
        )}`
      );
    }
    setCanSubmit(true);
  }

  function submit() {
    const amountBN = new BigNumber(amount?.toString());
    const shareBN = new BigNumber(toReadableNumber(24, shares));
    if (Number(amount) === 0) {
      throw new Error(
        intl.formatMessage({ id: 'must_input_a_value_greater_than_zero' })
      );
    }
    if (amountBN.isGreaterThan(shareBN)) {
      throw new Error(
        intl.formatMessage({
          id: 'must_input_a_value_not_greater_than_your_balance',
        })
      );
    }
    //return function of remove the liquidity
    return '';
  }

  useEffect(() => {
    const amounts = [firstTokenAmount, secondTokenAmount, thirdTokenAmount];
    let notZeroTokens: string[] = [];

    amounts.forEach((amount, i) => {
      if (Number(amount) > 0) {
        notZeroTokens.push(tokens[i].id);
      }
    });
    if (notZeroTokens.length > 1) {
      setSelectedToken('');
    }
  }, [tokens, firstTokenAmount, secondTokenAmount, thirdTokenAmount]);

  useEffect(() => {
    if (selectedToken) {
      tokens.forEach((token, i) => {
        token.id !== selectedToken && setAmountsFlexible[i]('');
        token.id === selectedToken &&
          setAmountsFlexible[i](
            toReadableNumber(tokens[i].decimals, balances[selectedToken])
          );
      });
    }
  }, [selectedToken]);

  useEffect(() => {
    const rememberedSlippageTolerance =
      localStorage.getItem(SWAP_SLIPPAGE_KEY) || slippageTolerance;

    setSlippageTolerance(Number(rememberedSlippageTolerance));
  }, []);

  return (
    <Card
      padding="py-6 px-0"
      bgcolor="bg-cardBg"
      className="text-white outline-none w-full "
    >
      <div className="text-xl pb-4 px-8">
        <FormattedMessage
          id="remove_liquidity"
          defaultMessage="Remove Liquidity"
        />
      </div>

      <div className=" text-white flex justify-between text-xs pb-4 px-8">
        <span className="text-primaryText">
          <FormattedMessage id="my_shares" defaultMessage="Shares" />
        </span>
        <span>0.999</span>
      </div>
      <div className=" text-white flex justify-between text-xs pb-6 px-8">
        <span className="text-primaryText">
          <FormattedMessage id="shares_left" defaultMessage="Shares left" />
        </span>
        <span>0.999</span>
      </div>

      <div className="flex bg-inputDarkBg rounded text-white mx-8 p-1">
        <div
          className={`flex justify-center items-center w-2/4 rounded cursor-pointer ${
            isPercentage ? 'bg-framBorder' : ''
          }  h-9`}
          onClick={() => setIsPercentage(true)}
        >
          <FormattedMessage id="percentage" defaultMessage="Percentage" />
        </div>
        <div
          className={`flex justify-center items-center w-2/4 rounded cursor-pointer ${
            !isPercentage ? 'bg-framBorder' : ''
          }  h-9`}
          onClick={() => setIsPercentage(false)}
        >
          <FormattedMessage id="flexible" defaultMessage="Flexible" />
        </div>
      </div>
      {/* Remove as percentage */}
      {isPercentage && (
        <section className="mx-8">
          <p className=" text-primaryText text-xs mt-4 mb-6">
            <FormattedMessage
              id="remove_tip"
              defaultMessage="No fee in removing liquidity as percentage"
            />
          </p>

          <div className="flex">
            <div className="flex items-center justify-between mr-4">
              <p className="text-gray-400 text-xs whitespace-nowrap">
                <FormattedMessage id="my_shares" defaultMessage="Shares" />
              </p>
            </div>
            <div className="w-full h-12 text-white text-xl font-semibold bg-inputDarkBg rounded px-2 flex items-center justify-end">
              <div className="float-right">{sharePercentage}%</div>
            </div>
          </div>
          <div className="my-4">
            <div className="flex items-center justify-between text-gray-400">
              {progressBarIndex.map((index, i) => {
                return (
                  <div className="flex flex-col items-center text-xs" key={i}>
                    <span>{index}%</span>
                    <span>∣</span>
                  </div>
                );
              })}
            </div>
            <div className="py-1 pr-1">
              <input
                onChange={(e) => setSharePercentage(e.target.value)}
                value={sharePercentage}
                type="range"
                className="w-full"
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>
          <div className=" text-white flex justify-between text-xs mt-10 mb-5">
            <span className=" text-primaryText">
              <FormattedMessage
                id="remove_token_confirm"
                defaultMessage="You will remove RUST token"
              />
            </span>
            <span>-</span>
          </div>
          <StableTokensSymbol tokens={tokens} balances={balances} withPlus />
        </section>
      )}
      {/* remove as flexible */}
      {!isPercentage && (
        <section>
          <div className="px-8">
            <div className="text-primaryText mt-4 mb-6 text-xs">
              <FormattedMessage
                id="flexible_tip"
                defaultMessage="Remove how much you want per token"
              />
            </div>
            <FlexibleStableTokenList
              amountsFlexible={[
                firstTokenAmount,
                secondTokenAmount,
                thirdTokenAmount,
              ]}
              setAmountsFlexible={setAmountsFlexible}
              tokens={tokens}
              balances={balances}
              validate={validate}
              setError={setError}
              error={error}
            />
          </div>
          <div className="flex items-center text-primaryText text-xs pl-8">
            <span className="whitespace-nowrap mr-2">
              <FormattedMessage
                id="remove_as_one_token"
                defaultMessage="Remove as one token"
              />
            </span>

            <div className="border-b w-full border-primaryText border-opacity-30" />
          </div>
          <div className="border-b py-6 px-8 border-primaryText border-opacity-30">
            <OneTokenSelector
              tokens={tokens}
              balances={balances}
              selectedToken={selectedToken}
              handleSelect={setSelectedToken}
            />
          </div>

          <div className="pt-4 px-8 text-xs">
            <StableSlipSelecter
              slippageTolerance={slippageTolerance}
              onChange={(slippage) => {
                setSlippageTolerance(slippage);
                localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
              }}
            />
          </div>
        </section>
      )}

      <div className="mt-4 px-8 w-full">
        {wallet.isSignedIn() ? (
          <SolidButton
            disabled={!canSubmit}
            className={`focus:outline-none px-4 w-full text-lg`}
            onClick={async () => {
              try {
                await submit();
              } catch (error) {
                setError(error);
              }
            }}
          >
            <FormattedMessage
              id="remove_liquidity"
              defaultMessage="Remove Liquidity"
            />
          </SolidButton>
        ) : (
          <ConnectToNearBtn />
        )}
      </div>
    </Card>
  );
}
