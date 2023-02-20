import React, { useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import InputAmount from '../../components/forms/InputAmount';
import { TokenMetadata } from '../../services/ft-contract';
import { TokenBalancesView } from '../../services/token';
import {
  percentLess,
  toPrecision,
  toReadableNumber,
} from '../../utils/numbers';
import { toRealSymbol } from '../../utils/token';
import { RefIcon } from '../../components/icon/Common';
import { SmallWallet } from '../icon/SmallWallet';
import { getMax } from '../../utils/numbers';
import { NEARXIDS } from '../../services/near';
import { WalletContext } from '../../utils/wallets-integration';

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

export default function StableTokenListUSN(props: {
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  firstTokenAmount: string;
  secondTokenAmount: string;
  changeFirstTokenAmount?: (e: string) => void;
  changeSecondTokenAmount?: (e: string) => void;
}) {
  const {
    tokens,
    balances,
    firstTokenAmount,
    secondTokenAmount,
    changeFirstTokenAmount,
    changeSecondTokenAmount,
  } = props;

  if (tokens.length < 1) return null;
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  return (
    <div className="mt-4 px-8">
      <div className="flex justify-end items-center text-xs text-right mb-1 text-farmText">
        <FormattedMessage id="balance" defaultMessage="Balance" />
        :&nbsp;
        <span
          title={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
        >
          {isSignedIn
            ? toPrecision(
                toReadableNumber(tokens[0].decimals, balances[tokens[0].id]),
                3,
                true
              )
            : '-'}
        </span>
      </div>
      <div className="flex items-center ">
        <div className="flex items-center w-28 xs:w-24 md:w-24 xs:flex-shrink-0 md:xs:flex-shrink-0">
          <Icon
            icon={tokens[0].icon}
            className="h-9 w-9 xs:h-7 md:h-7 xs:w-7 md:w-7 mr-2"
          />
          <div className="text-white text-base" title={tokens[0].id}>
            {toRealSymbol(tokens[0].symbol)}
          </div>
        </div>
        <InputAmount
          className="flex-grow border border-transparent rounded"
          max={getMax(
            tokens[0].id,
            toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
          )}
          onChangeAmount={(e) => {
            changeFirstTokenAmount(e);
          }}
          value={firstTokenAmount}
        />
      </div>
      <div className=" my-4">
        <div className="flex justify-end items-center text-xs text-right mb-1 text-farmText">
          <FormattedMessage id="balance" defaultMessage="Balance" />
          :&nbsp;
          <span
            title={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
          >
            {isSignedIn
              ? toPrecision(
                  toReadableNumber(tokens[1].decimals, balances[tokens[1].id]),
                  3,
                  true
                )
              : '-'}
          </span>
        </div>
        <div className="flex items-center">
          <div className="flex items-center w-28 xs:w-24 md:w-24 xs:flex-shrink-0 md:xs:flex-shrink-0">
            <Icon
              icon={tokens[1].icon}
              className="h-9 w-9 xs:h-7 md:h-7 xs:w-7 md:w-7 mr-2"
            />
            <div className="text-white text-base" title={tokens[1].id}>
              {toRealSymbol(tokens[1].symbol)}
            </div>
          </div>
          <InputAmount
            className="flex-grow border border-transparent rounded"
            max={getMax(
              tokens[1].id,
              toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
            )}
            onChangeAmount={changeSecondTokenAmount}
            value={secondTokenAmount}
          />
        </div>
      </div>
    </div>
  );
}

export function StableTokensSymbolUSN(props: {
  tokens: TokenMetadata[];
  receiveAmounts: string[];
  slippageTolerance: number;
}) {
  const { tokens, receiveAmounts, slippageTolerance } = props;

  const calcTokenReceived = (receiveAmount: string, token: TokenMetadata) => {
    const nonPrecisionAmount = percentLess(
      slippageTolerance,
      toReadableNumber(token.decimals, receiveAmount)
    );

    return Number(nonPrecisionAmount) < 0.001 && Number(nonPrecisionAmount) > 0
      ? '< 0.001'
      : toPrecision(nonPrecisionAmount, 3);
  };

  return (
    <div
      className={`flex mb-6 w-3/5 mx-auto items-center ${
        tokens.some((t) => t.id == NEARXIDS[0])
          ? 'justify-center'
          : 'justify-between'
      }  xs:items-start md:items-start`}
    >
      <div
        className={`flex xs:flex-col ${
          tokens[0].id === NEARXIDS[0] ? 'hidden' : ''
        } md:flex-col xs:items-center md:items-center`}
      >
        <Icon
          icon={tokens[0].icon}
          className="inline-block h-9 w-9 xs:h-7 xs:w-7 md:h-7 md:w-7 mr-2 xs:mr-0.5 md:mr-0.5"
        />
        <div className="ml-2 inline-block xs:ml-0 md:ml-0">
          <p className="text-sm xs:text-center md:text-center xs:my-1 md:my-1">
            {toRealSymbol(tokens[0].symbol)}
          </p>
          <div className="text-xs xs:text-center md:text-center">
            {calcTokenReceived(receiveAmounts[0], tokens[0])}
          </div>
        </div>
      </div>
      <div
        className={`xs:mt-1.5 md:mt-1.5 ${
          tokens.some((t) => t.id == NEARXIDS[0]) ? 'hidden' : ''
        } `}
      >
        {' '}
        +{' '}
      </div>
      <div
        className={`flex xs:flex-col ${
          tokens[1].id === NEARXIDS[0] ? 'hidden' : ''
        } md:flex-col xs:items-center md:items-center`}
      >
        <Icon
          icon={tokens[1].icon}
          className="inline-block h-9 w-9 xs:h-7 xs:w-7 md:h-7 md:w-7 mr-2 xs:mr-0.5 md:mr-0.5"
        />
        <div className="ml-2 inline-block xs:ml-0 md:ml-0">
          <p className="text-sm xs:text-center md:text-center xs:my-1 md:my-1">
            {toRealSymbol(tokens[1].symbol)}
          </p>
          <div className="text-xs xs:text-center md:text-center">
            {calcTokenReceived(receiveAmounts[1], tokens[1])}
          </div>
        </div>
      </div>
    </div>
  );
}
