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
import { CheckedTick, UnCheckedBoxVE } from '../icon/CheckBox';

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

export function ConnectToNearBtnGradient({
  className,
}: {
  className?: string;
}) {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [showWalletSelector, setShowWalletSelector] = useState(false);

  return (
    <>
      <div
        className={`${className} flex items-center cursor-pointer w-full justify-center rounded-full py-2 text-base bg-veGradient ${
          buttonLoading ? 'opacity-40' : ''
        }`}
        style={{
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
                id="connect_to_near_wallet"
                defaultMessage="Connect to NEAR Wallet"
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
    backgroundImage?: string;
  }
) {
  const {
    loading,
    disabled,
    className,
    color,
    btnClassName,
    backgroundImage,
    onClick,
  } = props;
  return (
    <div
      className={`${className ? className : ''} ${
        loading ? 'opacity-40' : ''
      } bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover`}
      style={{
        borderRadius: '5px',
        color: color || '',
        backgroundImage: backgroundImage || '',
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
export function OprationButton(props: any) {
  const {
    loading,
    disabled,
    className,
    color,
    btnClassName,
    onClick,
    ...reset
  } = props;
  return (
    <div
      {...reset}
      className={`${className ? className : ''} ${loading ? 'opacity-40' : ''}`}
      style={{
        borderRadius: '8px',
        color: color || '',
      }}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center  w-full h-full ${
          btnClassName ? btnClassName : ''
        }`}
      >
        {props.children}
      </button>
    </div>
  );
}
export function ConnectToNearButton(props: any) {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const { className = '' } = props;
  return (
    <>
      <div
        className={`${className} flex items-center cursor-pointer justify-center rounded-lg py-3 text-base ${
          buttonLoading ? 'opacity-40' : ''
        }`}
        style={{
          background: 'linear-gradient(180deg, #4B5963 0%, #323C43 100%)',
          color: '#fff',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setButtonLoading(true);
          setShowWalletSelector(true);
        }}
      >
        <button>
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => (
              <FormattedMessage
                id="connect_to_wallet"
                defaultMessage="Connect Wallet"
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

export function NewGradientButton(porps: {
  text: string | JSX.Element;
  onClick?: any;
  className?: string;
  disabled?: boolean;
  grayDisable?: boolean;
  disableForUI?: boolean;
  width?: string;
}) {
  const {
    text,
    onClick,
    className,
    disabled,
    grayDisable,
    disableForUI,
    width,
  } = porps;

  return (
    <button
      className={`${
        grayDisable ? 'opacity-30' : 'bg-veGradient'
      } ${width} ${className}  ${
        disabled ? 'opacity-30' : ''
      } px-5 py-3 rounded-lg text-center `}
      onClick={onClick}
      disabled={disableForUI ? false : disabled || grayDisable}
      style={{
        backgroundColor: grayDisable ? '#445867' : '',
      }}
    >
      <span>{text}</span>
    </button>
  );
}

export function WithGradientButton(porps: {
  text: string | JSX.Element;
  onClick?: any;
  className?: string;
  disabled?: boolean;
  grayDisable?: boolean;
  disableForUI?: boolean;
  width?: string;
  gradientWith?: string;
}) {
  const {
    text,
    onClick,
    className,
    disabled,
    grayDisable,
    disableForUI,
    width,
    gradientWith,
  } = porps;

  return (
    <button
      className={` ${width} ${className} relative px-5 py-3  ${
        disabled ? 'opacity-30' : ''
      }  rounded-lg text-center `}
      onClick={onClick}
      disabled={disableForUI ? false : disabled || grayDisable}
      style={{
        backgroundColor: '#445867',
      }}
    >
      <div
        className="w-full h-full left-0 top-0 rounded-lg we bg-veGradient whitespace-nowrap absolute"
        style={{
          width: gradientWith,
        }}
      ></div>
      <span className="">{text}</span>
    </button>
  );
}

export function BorderGradientButton(porps: {
  text: string | JSX.Element;
  onClick?: any;
  className?: string;
  disabled?: boolean;
  width?: string;
  color?: string;
  opacity?: string;
}) {
  const { text, onClick, className, disabled, width, color, opacity } = porps;

  return (
    <button
      className={` p-px rounded-lg text-center  bg-veGradient ${width} ${opacity}`}
      onClick={onClick}
    >
      <button
        disabled={disabled}
        className={`w-full rounded-lg cursor-pointer text-center ${className} py-2.5 px-4`}
        style={{
          backgroundColor: color || 'rgb(0,12,21)',
        }}
      >
        <span className="px-0.5 py-0.5 my-px">{text}</span>
      </button>
    </button>
  );
}

export function CheckRadioButtonVE({
  check,
  setCheck,
}: {
  check: boolean;
  setCheck: (e?: any) => void;
}) {
  return (
    <button
      onClick={() => {
        if (check) {
          setCheck(false);
        } else setCheck(true);
      }}
      className="w-7 h-7 relative bottom-2 mr-2 "
    >
      {check ? (
        <div
          className="p-3"
          style={{
            width: '37px',
            height: '37px',
          }}
        >
          <CheckedTick />
        </div>
      ) : (
        <UnCheckedBoxVE />
      )}
    </button>
  );
}

export function GreenConnectToNearBtn() {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [showWalletSelector, setShowWalletSelector] = useState(false);

  return (
    <>
      <div
        className={`flex items-center cursor-pointer w-full justify-center rounded-lg py-0.5 text-base bg-lightGreenColor ${
          buttonLoading ? 'opacity-40' : ''
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setButtonLoading(true);
          setShowWalletSelector(true);
        }}
      >
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
