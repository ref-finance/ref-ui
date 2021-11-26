import React from 'react';
import { FormattedMessage } from 'react-intl';
import InputAmount from '~components/forms/InputAmount';
import { TokenMetadata } from '~services/ft-contract';
import { TokenBalancesView } from '~services/token';
import { toPrecision, toReadableNumber } from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
export function Icon(props: { icon?: string; className?: string; style?: any }) {
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
  changeFirstTokenAmount?: (e:string) => void;
  changeSecondTokenAmount?: (e:string) => void;
  changeThirdTokenAmount?: (e:string) => void;
}) {
  const { tokens, balances, firstTokenAmount, secondTokenAmount, thirdTokenAmount, changeFirstTokenAmount, changeSecondTokenAmount, changeThirdTokenAmount  } = props;
  if (tokens.length < 1) return null;
  return (
    <div>
      <div className="mt-4">
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
            onChangeAmount={(e)=>{changeFirstTokenAmount(e)}}
            value={firstTokenAmount}
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StableTokensSymbol(props: {
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
}) {
  const { tokens, balances } = props;
  return (
    <div className="flex">
      <div className="flex-1 flex">
        <Icon icon={tokens[0].icon} className="inline-block h-9 w-9 mr-2" />
        <div className=" ml-3 inline-block">
          {toRealSymbol(tokens[0].symbol)}
          <div className=" text-xs">
            {toPrecision(
              toReadableNumber(tokens[0].decimals, balances[tokens[0].id]),
              2,
              true
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex">
        <Icon icon={tokens[1].icon} className="inline-block h-9 w-9 mr-2" />
        <div className=" ml-3 inline-block">
          {toRealSymbol(tokens[1].symbol)}
          <div className=" text-xs">
            {toPrecision(
              toReadableNumber(tokens[1].decimals, balances[tokens[1].id]),
              2,
              true
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex">
        <Icon icon={tokens[2].icon} className="inline-block h-9 w-9 mr-2" />
        <div className=" ml-3 inline-block">
          {toRealSymbol(tokens[2].symbol)}
          <div className=" text-xs">
            {toPrecision(
              toReadableNumber(tokens[2].decimals, balances[tokens[2].id]),
              2,
              true
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
