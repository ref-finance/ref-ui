import React, { HTMLAttributes, useState } from 'react';
import { wallet, REF_FARM_CONTRACT_ID } from '~services/near';
import { Near, UnLoginIcon, FarmMiningIcon, FarmStamp } from '~components/icon';
import { FormattedMessage } from 'react-intl';

export function BorderlessButton(
  props: HTMLAttributes<HTMLButtonElement> & { disabled?: boolean }
) {
  const { disabled } = props;
  return (
    <button
      disabled={disabled}
      className={`rounded-xl border border-greenLight focus:outline-none font-semibold focus:outline-none ${props.className}`}
      {...props}
    >
      {props.children}
    </button>
  );
}

export function BorderButton(
  props: HTMLAttributes<HTMLButtonElement> & { borderColor?: string } & {
    disabled?: boolean;
    rounded?: string;
    px?: string;
    py?: string;
  }
) {
  const {
    className,
    borderColor,
    disabled,
    rounded,
    px,
    py,
    ...propsWithoutClassName
  } = props;
  return (
    <button
      disabled={disabled}
      className={`text-xs font-semibold border ${
        borderColor ? borderColor : 'border-greenLight'
      }  ${className} ${
        disabled ? 'bg-opacity-50 disabled:cursor-not-allowed' : ''
      } ${rounded || 'rounded-full'} ${px || 'px-5'} ${py || 'py-2.5'}`}
      {...propsWithoutClassName}
    >
      {props.children}
    </button>
  );
}

export function GreenButton(
  props: HTMLAttributes<HTMLButtonElement> & { disabled?: boolean } & {
    rounded?: string;
    px?: string;
    py?: string;
  }
) {
  const { disabled, rounded, px, py } = props;
  const { className, ...propsWithoutClassName } = props;
  return (
    <button
      disabled={disabled}
      className={` text-xs text-white px-5 py-2.5 font-semibold border border-greenLight bg-greenLight focus:outline-none ${className} ${
        disabled ? 'bg-opacity-50 disabled:cursor-not-allowed' : ''
      } ${rounded || 'rounded-full'} ${px || 'px-5'} ${py || 'py-2.5'}`}
      {...propsWithoutClassName}
    >
      {props.children}
    </button>
  );
}

export function GrayButton(
  props: HTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
  }
) {
  const { className, ...propsWithoutClassName } = props;
  return (
    <button
      className={`inline-flex cursor-pointer font-bold items-center text-center rounded-full bg-gray-800 px-3.5 py-1 focus:outline-none ${props.className}`}
      {...propsWithoutClassName}
    >
      {props.children}
    </button>
  );
}

export function WithdrawButton(
  props: HTMLAttributes<HTMLButtonElement> & { disabled?: boolean }
) {
  const { disabled } = props;
  const { className, ...propsWithoutClassName } = props;
  return (
    <button
      disabled={disabled}
      className={`rounded-full text-xs px-3 py-1.5 focus:outline-none font-semibold focus:outline-none bg-white text-green-700 ${className} ${
        disabled ? 'bg-opacity-50 disabled:cursor-not-allowed' : ''
      }`}
      {...propsWithoutClassName}
    >
      {props.children}
    </button>
  );
}

export function ConnectToNearBtn() {
  return (
    <div
      className="flex items-center cursor-pointer justify-center rounded-full py-2 text-base"
      style={{
        background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
        color: '#fff',
      }}
      onClick={() => wallet.requestSignIn(REF_FARM_CONTRACT_ID)}
    >
      <div className="mr-3.5">
        <UnLoginIcon />
      </div>
      <button>
        <FormattedMessage
          id="connect_to_near"
          defaultMessage="Connect to NEAR"
        />
      </button>
    </div>
  );
}

export function SmallConnectToNearBtn() {
  return (
    <div className="flex items-center justify-center pt-2">
      <GrayButton onClick={() => wallet.requestSignIn(REF_FARM_CONTRACT_ID)}>
        <div className="pr-1">
          <Near />
        </div>
        <div className="text-xs text-white">
          <FormattedMessage
            id="connect_to_near"
            defaultMessage="Connect to NEAR"
          />
        </div>
      </GrayButton>
    </div>
  );
}

export function SolidButton(
  props: HTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
    padding?: string;
    className?: string;
  }
) {
  const { disabled, padding, className, onClick } = props;

  return (
    <button
      onClick={onClick}
      className={`${disabled ? 'cursor-not-allowed opacity-40' : ''} 
        text-white rounded  bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover
        py-2 ${padding ? padding : ''}
        ${className ? className : ''}
      `}
    >
      {props.children}
    </button>
  );
}

export function OutlineButton(
  props: HTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
    padding?: string;
    className?: string;
  }
) {
  const { disabled, padding, className, onClick } = props;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded ${
        padding ? padding : 'py-2'
      } border border-gradientFromHover text-gradientFrom ${className}`}
    >
      {props.children}
    </button>
  );
}

export function GradientButton(
  props: HTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
    padding?: string;
    className?: string;
    color?: string;
    btnClassName?: string;
  }
) {
  const { disabled, className, color, btnClassName, onClick } = props;
  return (
    <div
      className={`${className ? className : ''}`}
      style={{
        background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
        borderRadius: '5px',
        color: color || '',
      }}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-full ${btnClassName ? btnClassName : ''}`}
      >
        {props.children}
      </button>
    </div>
  );
}
export function GreenLButton(
  props: HTMLAttributes<HTMLButtonElement> & { disabled?: boolean }
) {
  const { disabled } = props;
  const { className, ...propsWithoutClassName } = props;
  return (
    <button
      disabled={disabled}
      style={{
        background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
      }}
      className={`w-full rounded text-lg text-white font-semibold border-0 px-5 py-2 focus:outline-none ${className} ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
      {...propsWithoutClassName}
    >
      {props.children}
    </button>
  );
}

export const FarmButton = ({ farmCount }: { farmCount: Number }) => {
  const isMultiMining = farmCount > 1;
  return (
    <div className="flex items-center">
      <div className="ml-1">
        <FarmStamp />
      </div>
      <div className={isMultiMining ? 'ml-1' : ''}>
        {isMultiMining && <FarmMiningIcon />}
      </div>
    </div>
  );
};
