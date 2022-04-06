import React, { HTMLAttributes, useState } from 'react';
import { wallet, REF_FARM_CONTRACT_ID } from '../../services/near';
import {
  Near,
  UnLoginIcon,
  FarmMiningIcon,
  FarmStamp,
} from '../../components/icon';
import { FormattedMessage } from 'react-intl';
import { BeatLoading } from '../../components/layout/Loading';
import { WalletSelectorModal } from '../layout/WalletSelector';

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
    loading?: boolean;
  }
) {
  const {
    className,
    borderColor,
    disabled,
    rounded,
    px,
    py,
    loading,
    ...propsWithoutClassName
  } = props;
  return (
    <button
      disabled={disabled}
      className={`text-xs font-semibold border ${
        borderColor ? borderColor : 'border-greenColor'
      }  ${className} ${
        disabled ? 'bg-opacity-50 disabled:cursor-not-allowed' : ''
      } ${rounded || 'rounded-full'} ${px || 'px-5'} ${py || 'py-2.5'} ${
        loading ? 'opacity-40' : ''
      }`}
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
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [showWalletSelector, setShowWalletSelector] = useState(false);

  return (
    <>
      <div
        className={`flex items-center cursor-pointer justify-center rounded-full py-2 text-base ${
          buttonLoading ? 'opacity-40' : ''
        }`}
        style={{
          background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
          color: '#fff',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setButtonLoading(true);
          setShowWalletSelector(true);
        }}
      >
        {!buttonLoading && (
          <div className="mr-3.5">
            <UnLoginIcon />
          </div>
        )}

        <button>
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => (
              <FormattedMessage
                id="connect_to_near"
                defaultMessage="Connect to NEAR"
              />
            )}
          />
        </button>
      </div>
      <WalletSelectorModal
        isOpen={showWalletSelector}
        onRequestClose={() => {
          window.location.reload();
          setShowWalletSelector(false);
        }}
        setShowWalletSelector={setShowWalletSelector}
      />
    </>
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
    loading?: boolean;
  }
) {
  const { disabled, padding, className, onClick, loading, style } = props;
  return (
    <button
      onClick={onClick}
      className={`${disabled ? 'cursor-not-allowed opacity-40' : ''}  ${
        loading ? 'opacity-40' : ''
      }
        text-white rounded  bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover
         ${padding ? padding : 'py-2'}
        ${className ? className : ''}
      `}
      style={style}
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
  const { disabled, padding, className, onClick, style } = props;
  return (
    <button
      style={style}
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
    loading?: boolean;
  }
) {
  const { loading, disabled, className, color, btnClassName, onClick } = props;
  return (
    <div
      className={`${className ? className : ''} ${
        loading ? 'opacity-40' : ''
      } bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover`}
      style={{
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
  props: HTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
    loading?: boolean;
  }
) {
  const { disabled, loading, className, ...propsWithoutClassName } = props;
  return (
    <button
      disabled={disabled}
      style={{
        background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
      }}
      className={`w-full rounded text-lg text-white font-semibold border-0 px-5 py-2 focus:outline-none ${className} ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${loading ? 'opacity-40' : ''}`}
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

export function ButtonTextWrapper({
  Text,
  loading,
}: {
  Text: () => JSX.Element;
  loading: boolean;
}) {
  return <>{loading ? <BeatLoading /> : <Text />}</>;
}

export function BorderButtonHover(
  props: HTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
  }
) {
  const { className, disabled } = props;
  return (
    <button
      disabled={disabled}
      className={`w-24 h-8 border border-greenColor text-xs text-white rounded ${className} ${
        disabled
          ? 'cursor-not-allowed'
          : 'hover:opacity-100 hover:bg-buttonGradientBg'
      }`}
    >
      {props.children}
    </button>
  );
}
export function BorderButtonMobile(
  props: HTMLAttributes<HTMLButtonElement> & {
    disabled?: boolean;
  }
) {
  const { className, disabled } = props;
  return (
    <button
      disabled={disabled}
      className={`px-2 border border-greenColor text-xs text-framBorder rounded ${
        className ? className : ''
      } ${disabled ? 'opacity-40' : ''}`}
    >
      {props.children}
    </button>
  );
}
