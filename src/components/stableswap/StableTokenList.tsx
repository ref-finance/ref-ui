import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import InputAmount from '~components/forms/InputAmount';
import { Radio } from '~components/icon';
import { TokenMetadata } from '~services/ft-contract';
import { TokenBalancesView } from '~services/token';
import {
  percentLess,
  subtraction,
  toPrecision,
  toReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import Alert from '~components/alert/Alert';
import BigNumber from 'bignumber.js';

export function Icon(props: {
  icon?: string;
  className?: string;
  style?: any;
}) {
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

export function FlexibleStableToken({
  token,
  amountsFlexible,
  balances,
  setAmountFlexible,
  index,
  validate,
}: {
  token: TokenMetadata;
  amountsFlexible: string[];
  balances: TokenBalancesView;
  setAmountFlexible: (e: string) => void;
  index: number;
  validate: (e: {
    firstAmount: string;
    secondAmount: string;
    thirdAmount: string;
    token: TokenMetadata;
    index: number;
    setError: (error: Error) => void;
    amount: string;
    max: string;
  }) => void;
}) {
  const intil = useIntl();

  const [error, setError] = useState<Error>(null);

  const calcMax = (amountIn: string, amountLeft: string) => {
    const max = BigNumber.sum(amountIn || '0', amountLeft)
      .toNumber()
      .toLocaleString('fullwide', { useGrouping: false });
    return max;
  };

  return (
    <div className="flex flex-col">
      <div className="w-full flex items-start">
        <div className="flex items-center mr-4 mt-1 w-1/4">
          <Icon icon={token.icon} className="h-9 w-9 mr-2" />
          <div className="text-white text-sm" title={token.id}>
            {toRealSymbol(token.symbol)}
          </div>
        </div>
        <div className="w-full flex flex-col">
          <InputAmount
            className="w-full border border-transparent rounded"
            max={calcMax(amountsFlexible[index], balances[token.id])}
            onChangeAmount={(amount) => {
              try {
                validate({
                  token,
                  firstAmount: index === 0 ? amount : amountsFlexible[0],
                  secondAmount: index === 1 ? amount : amountsFlexible[1],
                  thirdAmount: index == 2 ? amount : amountsFlexible[2],
                  setError,
                  index,
                  amount,
                  max: calcMax(amountsFlexible[index], balances[token.id]),
                });
              } catch (error) {
                setError(error);
              }
              setAmountFlexible(amount);
            }}
            value={amountsFlexible[index]}
            iserror={!!error}
          />
          <div
            className={`w-full flex items-center ${
              !!error ? 'justify-between' : 'justify-end'
            } `}
          >
            {!!error && (
              <Alert
                level="error"
                message={intil.formatMessage({
                  id: 'out_of_avaliable_shares',
                })}
              />
            )}

            <div className="text-xs text-right mt-1 mb-4 text-primaryText">
              {toPrecision(balances[token.id], 2, true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StableTokenList(props: {
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  firstTokenAmount: string;
  secondTokenAmount: string;
  thirdTokenAmount: string;
  changeFirstTokenAmount?: (e: string) => void;
  changeSecondTokenAmount?: (e: string) => void;
  changeThirdTokenAmount?: (e: string) => void;
}) {
  const {
    tokens,
    balances,
    firstTokenAmount,
    secondTokenAmount,
    thirdTokenAmount,
    changeFirstTokenAmount,
    changeSecondTokenAmount,
    changeThirdTokenAmount,
  } = props;
  if (tokens.length < 1) return null;

  return (
    <div className="mt-4 px-8">
      <div className="text-xs text-right mb-1 text-gray-400">
        <FormattedMessage id="balance" defaultMessage="Balance" />
        :&nbsp;
        <span
          title={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
        >
          {toPrecision(
            toReadableNumber(tokens[0].decimals, balances[tokens[0].id]),
            2,
            true
          )}
        </span>
      </div>
      <div className="flex items-center ">
        <div className="flex items-center mr-4 w-1/4">
          <Icon icon={tokens[0].icon} className="h-9 w-9 mr-2" />
          <div className="text-white text-base" title={tokens[0].id}>
            {toRealSymbol(tokens[0].symbol)}
          </div>
        </div>
        <InputAmount
          className="w-full border border-transparent rounded"
          max={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
          onChangeAmount={(e) => {
            changeFirstTokenAmount(e);
          }}
          value={firstTokenAmount}
        />
      </div>
      <div className=" my-4">
        <div className="text-xs text-right mb-1 text-gray-400">
          <FormattedMessage id="balance" defaultMessage="Balance" />
          :&nbsp;
          <span
            title={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
          >
            {toPrecision(
              toReadableNumber(tokens[1].decimals, balances[tokens[1].id]),
              2,
              true
            )}
          </span>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-4 w-1/4">
            <Icon icon={tokens[1].icon} className="h-9 w-9 mr-2" />
            <div className="text-white text-base" title={tokens[1].id}>
              {toRealSymbol(tokens[1].symbol)}
            </div>
          </div>
          <InputAmount
            className="w-full border border-transparent rounded"
            max={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
            onChangeAmount={changeSecondTokenAmount}
            value={secondTokenAmount}
          />
        </div>
      </div>
      <div className="my-4">
        <div className="text-xs text-right mb-1 text-gray-400">
          <FormattedMessage id="balance" defaultMessage="Balance" />
          :&nbsp;
          <span
            title={toReadableNumber(tokens[2].decimals, balances[tokens[2].id])}
          >
            {toPrecision(
              toReadableNumber(tokens[2].decimals, balances[tokens[2].id]),
              2,
              true
            )}{' '}
          </span>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-4 w-1/4">
            <Icon icon={tokens[2].icon} className="h-9 w-9 mr-2" />
            <div className="text-white text-base" title={tokens[2].id}>
              {toRealSymbol(tokens[2].symbol)}
            </div>
          </div>
          <InputAmount
            className="w-full border border-transparent rounded"
            max={toReadableNumber(tokens[2].decimals, balances[tokens[2].id])}
            onChangeAmount={changeThirdTokenAmount}
            value={thirdTokenAmount}
          />
        </div>
      </div>
    </div>
  );
}

export function FlexibleStableTokenList(props: {
  tokens: TokenMetadata[];
  amountsFlexible: string[];
  setAmountsFlexible: ((e: string) => void)[];
  validate: (e: {
    firstAmount: string;
    secondAmount: string;
    thirdAmount: string;
    token: TokenMetadata;
    index: number;
    setError: (error: Error) => void;
    amount: string;
    max: string;
  }) => void;
  balances: TokenBalancesView;
}) {
  const { tokens, amountsFlexible, setAmountsFlexible, validate, balances } =
    props;
  if (tokens.length < 1) return null;

  return (
    <div>
      {tokens.map((token, i) => {
        return (
          <FlexibleStableToken
            token={token}
            index={i}
            key={i}
            amountsFlexible={amountsFlexible}
            validate={validate}
            balances={balances}
            setAmountFlexible={setAmountsFlexible[i]}
          />
        );
      })}
    </div>
  );
}

export function StableTokensSymbol(props: {
  tokens: TokenMetadata[];
  receiveAmounts: string[];
  withPlus?: boolean;
  slippageTolerance: number;
}) {
  const { tokens, receiveAmounts, withPlus, slippageTolerance } = props;

  return (
    <div className="flex mb-6 items-center justify-between">
      {Array(withPlus ? 5 : 3)
        .fill({})
        .map((t, i) => {
          if (i % 2 && withPlus) return <div key={i}>+</div>;
          else {
            const token = tokens[withPlus ? Math.floor(i / 2) : i];

            return (
              <div className="flex" key={i}>
                <Icon icon={token.icon} className="inline-block h-9 w-9 mr-2" />
                <div className="ml-2 inline-block">
                  <p className="text-sm">{toRealSymbol(token.symbol)}</p>
                  <div className="text-xs">
                    {toPrecision(
                      percentLess(
                        slippageTolerance,
                        toReadableNumber(
                          token.decimals,
                          receiveAmounts[withPlus ? Math.floor(i / 2) : i]
                        )
                      ),
                      3,
                      true
                    )}
                  </div>
                </div>
              </div>
            );
          }
        })}
    </div>
  );
}
