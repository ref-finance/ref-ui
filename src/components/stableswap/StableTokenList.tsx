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

export default function StableTokenList(props: {
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  firstTokenAmount: string;
  secondTokenAmount: string;
  thirdTokenAmount: string;
  changeFirstTokenAmount?: (e: string) => void;
  changeSecondTokenAmount?: (e: string) => void;
  changeThirdTokenAmount?: (e: string) => void;
  addType?: string;
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
    addType,
  } = props;
  if (tokens.length < 1) return null;
  const disabled = addType === 'addMax';

  return (
    <div className="mt-4 px-8">
      <div className="text-xs text-right mb-1 text-gray-400">
        <FormattedMessage id="balance" defaultMessage="Balance" />
        :&nbsp;
        {toPrecision(
          toReadableNumber(tokens[0].decimals, balances[tokens[0].id]),
          2,
          true
        )}
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
          disabled={disabled}
        />
      </div>
      <div className=" my-4">
        <div className="text-xs text-right mb-1 text-gray-400">
          <FormattedMessage id="balance" defaultMessage="Balance" />
          :&nbsp;
          {toPrecision(
            toReadableNumber(tokens[1].decimals, balances[tokens[1].id]),
            2,
            true
          )}
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
            disabled={disabled}
          />
        </div>
      </div>
      <div className="my-4">
        <div className="text-xs text-right mb-1 text-gray-400">
          <FormattedMessage id="balance" defaultMessage="Balance" />
          :&nbsp;
          {toPrecision(
            toReadableNumber(tokens[2].decimals, balances[tokens[2].id]),
            2,
            true
          )}
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
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

export function FlexibleStableTokenList(props: {
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  amountsFlexible: string[];
  setAmountsFlexible: ((e: string) => void)[];
  validate: (e: {
    firstAmount: string;
    secondAmount: string;
    thirdAmount: string;
    tokens: TokenMetadata[];
    balances: TokenBalancesView;
  }) => void;
  setError: (e: Error) => void;
  error: Error;
}) {
  const {
    tokens,
    balances,
    amountsFlexible,
    setAmountsFlexible,
    validate,
    setError,
    error,
  } = props;
  if (tokens.length < 1) return null;

  const intil = useIntl();

  return (
    <div>
      {tokens.map((token, i) => {
        const isError = error && new RegExp(token.symbol).test(error.message);

        return (
          <div className="flex flex-col" key={i}>
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
                  max={balances[token.id]}
                  onChangeAmount={(amount) => {
                    try {
                      validate({
                        tokens,
                        balances,
                        firstAmount: i === 0 ? amount : amountsFlexible[0],
                        secondAmount: i === 1 ? amount : amountsFlexible[1],
                        thirdAmount: i == 2 ? amount : amountsFlexible[2],
                      });
                    } catch (error) {
                      setError(error);
                    }
                    setAmountsFlexible[i](amount);
                  }}
                  value={amountsFlexible[i]}
                  iserror={isError}
                />
                <div
                  className={`w-full flex items-center ${
                    isError ? 'justify-between' : 'justify-end'
                  } `}
                >
                  {isError && (
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
                      toReadableNumber(
                        token.decimals,
                        percentLess(
                          slippageTolerance,
                          receiveAmounts[withPlus ? Math.floor(i / 2) : i] ||
                            '0'
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

export function OneTokenSelector({
  balances,
  tokens,
  selectedToken,
  handleSelect,
}: {
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  selectedToken: string;
  handleSelect: (t: string) => void;
}) {
  return (
    <div className="w-full flex items-center justify-between">
      {tokens.map((token, i) => {
        return (
          <div className="flex items-center" key={i}>
            <Radio
              checked={selectedToken === token.id}
              size="3"
              handleSelect={handleSelect}
              value={token.id}
            />
            <Icon icon={token.icon} className="inline-block h-9 w-9 mx-2" />
            <div className="ml-2 inline-block">
              <p className="text-sm">{toRealSymbol(token.symbol)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
