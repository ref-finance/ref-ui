import React, { useEffect, useRef, useState } from 'react';
import { TokenMetadata } from 'src/services/ft-contract';
import { TokenBalancesView } from 'src/services/token';
import { tokenPrice } from './SelectToken';
import {
  multiply,
  ONLY_ZEROS,
  toNonDivisibleNumber,
} from '../../utils/numbers';
import { FormattedMessage, useIntl } from 'react-intl';
import { toPrecision } from '../../utils/numbers';
import { InputClear } from '../icon/swapV3';

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: string;
  maxBorder?: boolean;
  showMaxAsBalance?: boolean;
  onChangeAmount?: (amount: string, balances?: TokenBalancesView) => void;
  forSwap?: boolean;
  price?: string | null;
  tokenSymbol?: string | JSX.Element;
  balance?: string;
  decimalLimit?: number;
  value?: string;
  curAmount?: string;
  openClear?: boolean;
  forLimitOrder?: boolean;
  rateDiff?: JSX.Element | string;
  nearValidation?: boolean;
}

export default function InputAmount({
  max,
  className,
  onChangeAmount,
  disabled = false,
  maxBorder = true,
  forSwap = false,
  decimalLimit,
  price,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>();
  const field = useRef<HTMLFieldSetElement>();
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  const [isFocus, setIsFocus] = useState<boolean>(false);

  const handleChange = (amount: string) => {
    if (onChangeAmount) {
      onChangeAmount(amount);
    }
    if (!onChangeAmount) {
      ref.current.value = amount;
    }
  };

  return (
    <>
      <fieldset
        className={`${className} ${
          isFocus
            ? ' border border-greenLight rounded'
            : ' border border-transparent rounded'
        }`}
        ref={field}
      >
        <div
          className={`relative flex align-center items-center bg-inputDarkBg rounded-md`}
        >
          <input
            ref={ref}
            max={max}
            min="0"
            onWheel={() => ref.current.blur()}
            {...rest}
            step="any"
            className={`xs:text-sm text-lg font-bold w-full p-2 ${
              disabled ? 'text-gray-200 placeholder-gray-200' : 'text-white'
            }`}
            type="number"
            placeholder={'0.0'}
            onChange={({ target }) => handleChange(target.value)}
            disabled={disabled}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
            onFocus={() => {
              setIsFocus(true);
            }}
            onBlur={() => {
              setIsFocus(false);
            }}
            inputMode="decimal"
          />
          {max && !forSwap ? (
            <a
              className={`rounded border  items-center px-1 mr-2 m-auto focus:outline-none text-xs ${
                disabled || max === rest.value
                  ? 'text-gray-400 hover:text-gray-400 border-gray-400'
                  : 'text-greenColor border-greenColor'
              }`}
              style={{ lineHeight: 'unset', cursor: 'pointer' }}
              onClick={() => handleChange(max)}
            >
              MAX
            </a>
          ) : null}

          {forSwap ? <span className="mr-3">{tokenPrice(price)}</span> : null}
        </div>
      </fieldset>
    </>
  );
}

export function NewFarmInputAmount({
  max,
  className,
  onChangeAmount,
  disabled = false,
  maxBorder = true,
  tokenSymbol,
  title,
  balance,
  decimalLimit,
  curAmount,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>();
  const field = useRef<HTMLFieldSetElement>();
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  const [isFocus, setIsFocus] = useState<boolean>(false);

  const handleChange = (amount: string) => {
    onChangeAmount(amount);

    if (!onChangeAmount) {
      ref.current.value = amount;
    }
  };

  return (
    <fieldset
      className={`${className} ${
        isFocus
          ? ' border border-greenLight rounded-lg'
          : ' border border-transparent rounded-lg'
      }`}
      ref={field}
    >
      <div
        className={`relative flex flex-col align-center bg-inputDarkBg rounded-lg `}
      >
        <div
          className={`${
            title && balance ? 'block' : 'hidden'
          } flex items-center justify-between text-farmText text-sm pl-5 pt-4`}
        >
          <span>{title}</span>

          <div className="flex justify-end items-center text-sm text-right mb-1.5 text-farmText">
            <FormattedMessage id="balance" defaultMessage="Balance" />
            {':'}
            <span className="ml-1" title={balance}>
              {toPrecision(balance || '0', 2, true)}
            </span>
          </div>
        </div>

        <div className="flex items-center ">
          <input
            ref={ref}
            max={max}
            min="0"
            onWheel={() => ref.current.blur()}
            // {...rest}
            value={rest.value}
            step="any"
            className={`xs:text-sm text-lg font-bold w-full px-5 py-4 ${
              disabled ? 'text-gray-200 placeholder-gray-200' : 'text-white'
            }`}
            type="number"
            placeholder="0.0"
            onChange={({ target }) => handleChange(target.value)}
            disabled={disabled}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
            onFocus={() => {
              setIsFocus(true);
            }}
            inputMode="decimal"
            onBlur={() => {
              setIsFocus(false);
            }}
          />
          <span className="flex items-center">
            <a
              className={`rounded-lg flex items-center justify-center text-center  ${
                rest.value === max && !ONLY_ZEROS.test(max)
                  ? '  bg-opacity-20 bg-black hover:border hover:text-gradientFrom hover:border-gradientFrom hover:bg-none hover:bg-opacity-0'
                  : ' border-maxBorderColor hover:text-gradientFrom border  hover:border-gradientFrom'
              }  text-farmText  px-1 py-0.5 m-auto focus:outline-none text-xs `}
              style={{
                lineHeight: 'unset',
                cursor: 'pointer',
                width: '38px',
                height: '22px',
              }}
              onClick={() => handleChange(max)}
            >
              <span>Max</span>
            </a>
            <span className="text-base font-bold text-white ml-3 whitespace-nowrap">
              {tokenSymbol}
            </span>
          </span>
        </div>
      </div>
    </fieldset>
  );
}
export function BoostInputAmount({
  max,
  className,
  onChangeAmount,
  disabled = false,
  maxBorder = true,
  tokenSymbol,
  title,
  balance,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>();
  const field = useRef<HTMLFieldSetElement>();
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  const [isFocus, setIsFocus] = useState<boolean>(false);

  const handleChange = (amount: string) => {
    if (onChangeAmount) onChangeAmount(amount);

    // ref.current.value = amount;
  };

  return (
    <fieldset
      className={`${className} ${
        isFocus
          ? ' border border-greenLight rounded-lg'
          : ' border border-transparent rounded-lg'
      }`}
      ref={field}
    >
      <div
        className={`relative flex flex-col align-center bg-inputDarkBg rounded-lg `}
      >
        <div
          className={`${
            title && balance ? 'block' : 'hidden'
          } flex items-center justify-between text-farmText text-sm pl-5 pt-4`}
        >
          <span>{title}</span>

          <div className="flex justify-end items-center text-sm text-right mb-1.5 text-farmText">
            <FormattedMessage id="balance" defaultMessage="Balance" />
            {':'}
            <span className="ml-1" title={balance}>
              {toPrecision(balance || '0', 2, true)}
            </span>
          </div>
        </div>

        <div className="flex items-center ">
          <input
            ref={ref}
            max={max}
            min="0"
            onWheel={() => ref.current.blur()}
            {...rest}
            step="any"
            className={`xs:text-sm text-lg font-bold w-full px-5 py-4 ${
              disabled ? 'text-gray-200 placeholder-gray-200' : 'text-white'
            }`}
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            onChange={({ target }) => handleChange(target.value)}
            disabled={disabled}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
            onFocus={() => {
              setIsFocus(true);
            }}
            onBlur={() => {
              setIsFocus(false);
            }}
          />
          <span className="flex items-center">
            <a
              className={`rounded-lg flex items-center justify-center text-center  ${
                rest.value === max && !ONLY_ZEROS.test(max)
                  ? '  bg-opacity-20 bg-black hover:border hover:text-gradientFrom hover:border-gradientFrom hover:bg-none hover:bg-opacity-0'
                  : ' border-maxBorderColor hover:text-gradientFrom border  hover:border-gradientFrom'
              }  text-farmText  px-1 py-0.5 m-auto focus:outline-none text-xs `}
              style={{
                lineHeight: 'unset',
                cursor: 'pointer',
                width: '38px',
                height: '22px',
              }}
              onClick={() => handleChange(max)}
            >
              <span>Max</span>
            </a>
            <span className="text-base font-bold text-white ml-2 whitespace-nowrap mr-3">
              {tokenSymbol}
            </span>
          </span>
        </div>
      </div>
    </fieldset>
  );
}

export function InputAmountV3({
  max,
  className,
  onChangeAmount,
  disabled = false,
  maxBorder = true,
  forSwap = false,
  decimalLimit,
  price,
  forLimitOrder,
  openClear,
  rateDiff,
  nearValidation,
  onBlur,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>();
  const field = useRef<HTMLFieldSetElement>();
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  const handleChange = (amount: string) => {
    if (onChangeAmount) {
      onChangeAmount(amount);
    }
    if (!onChangeAmount) {
      ref.current.value = amount;
    }
  };

  const intl = useIntl();
  return (
    <>
      <fieldset className={`${className} `} ref={field}>
        <div
          className={`relative flex align-center items-center `}
          id={rateDiff ? 'rateDiffDiv' : ''}
        >
          <input
            ref={ref}
            max={max}
            min="0"
            onWheel={() => ref.current.blur()}
            {...rest}
            step="any"
            inputMode="decimal"
            className={`text-xl p-1 ${
              disabled ? 'text-gray-200 placeholder-gray-200' : 'text-white'
            }`}
            id={rateDiff ? 'rateDiffInput' : ''}
            type="number"
            placeholder={forLimitOrder ? '-' : '0.0'}
            onChange={({ target }) => {
              ref.current.setCustomValidity('');

              handleChange(target.value);
            }}
            title={''}
            disabled={disabled}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
            onBlur={onBlur}
          />

          {rateDiff}

          <button
            className="cursor-pointer text-primaryText hover:text-warn"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleChange('');
              ref.current.value = '';
            }}
          >
            {!openClear ? null : <InputClear />}
          </button>
        </div>
      </fieldset>
    </>
  );
}
