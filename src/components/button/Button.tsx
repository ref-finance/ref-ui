import React, { HTMLAttributes, useState } from 'react';
import {
  wallet,
  REF_FARM_CONTRACT_ID,
  REF_FARM_BOOST_CONTRACT_ID,
} from '../../services/near';
import {
  Near,
  UnLoginIcon,
  FarmMiningIcon,
  FarmStamp,
} from '../../components/icon';
import { FormattedMessage } from 'react-intl';
import { BeatLoading } from '../../components/layout/Loading';
import { WalletSelectorModal } from '../layout/WalletSelector';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { CheckedTick, UnCheckedBoxVE } from '../icon/CheckBox';
import { isClientMobie, useClientMobile } from '../../utils/device';
import {
  BuyNearHover,
  BuyNearDefault,
  BuyNearMobile,
  BuyNearIcon,
  BuyNearHoverIcon,
} from '../icon/Nav';
import { openTransak } from '../alert/Transak';
import { getCurrentWallet } from '../../utils/wallets-integration';
import { WalletRiskCheckBoxModal } from 'src/context/modal-ui/components/WalletOptions/WalletRiskCheckBox';
import { CONST_ACKNOWLEDGE_WALLET_RISK } from 'src/constants/constLocalStorage';

export function BorderlessButton(
  props: HTMLAttributes<HTMLButtonElement> & { disabled?: boolean }
) {
  const { disabled } = props;
  return (
    <button
      disabled={disabled}
      className={`rounded-xl border border-greenLight focus:outline-none font-semibold  ${props.className}`}
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
      className={`rounded-full text-xs px-3 py-1.5 focus:outline-none font-semibold  bg-white text-green-700 ${className} ${
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
  const [showWalletRisk, setShowWalletRisk] = useState<boolean>(false);
  const handleWalletModalOpen = () => {
    const isAcknowledgeWalletRisk = localStorage.getItem(
      CONST_ACKNOWLEDGE_WALLET_RISK
    );
    if (!isAcknowledgeWalletRisk) {
      setShowWalletRisk(true);
    } else {
      modal.show();
    }
  };
  const handleAcknowledgeClick = (status) => {
    if (status === true) {
      setShowWalletRisk(false);
      localStorage.setItem(CONST_ACKNOWLEDGE_WALLET_RISK, '1');
      modal.show();
    }
  };

  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

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
          // setButtonLoading(true);
          //modal.show();
          handleWalletModalOpen();
        }}
      >
        {!buttonLoading && (
          <div className="mr-3.5">
            <UnLoginIcon />
          </div>
        )}

        <button disabled={buttonLoading}>
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

      <WalletRiskCheckBoxModal
        isOpen={showWalletRisk}
        setCheckedStatus={handleAcknowledgeClick}
        onClose={() => setShowWalletRisk(false)}
      />

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

  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

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
          // setButtonLoading(true);
          modal.show();
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
    </>
  );
}

export function ConnectToNearBtnGradientMoible({
  className,
}: {
  className?: string;
}) {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();
  return (
    <>
      <div
        className={`${className} flex items-center cursor-pointer  min-w-24 py-0.5 justify-center rounded-full  text-sm bg-veGradient ${
          buttonLoading ? 'opacity-40' : ''
        }`}
        style={{
          color: '#fff',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // setButtonLoading(true);
          modal.show();
        }}
      >
        <button className="relative left-1">
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => (
              <FormattedMessage id="connect" defaultMessage="Connect" />
            )}
          />
        </button>

        {!buttonLoading && (
          <div className="ml-1 transform scale-50">
            <UnLoginIcon />
          </div>
        )}
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
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

  return (
    <div className="flex items-center justify-center pt-2">
      <GrayButton onClick={() => modal.show()}>
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
    disabledColor?: string;
  }
) {
  const {
    disabledColor,
    disabled,
    padding,
    className,
    onClick,
    loading,
    style,
  } = props;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${disabled ? 'cursor-not-allowed opacity-40' : ''}  ${
        loading ? 'opacity-40' : ''
      }
        text-white rounded
        ${
          disabled && disabledColor
            ? disabledColor
            : ' bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover'
        }
       
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
      className={`flex items-center justify-center rounded ${
        disabled ? 'cursor-not-allowed  opacity-40' : ''
      } ${
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
    minWidth?: string;
    borderRadius?: string;
  }
) {
  const {
    loading,
    disabled,
    className,
    color,
    btnClassName,
    backgroundImage,
    minWidth,
    borderRadius,
    onClick,
  } = props;
  return (
    <div
      className={`${className ? className : ''} ${
        loading ? 'opacity-40' : ''
      } bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover`}
      style={{
        borderRadius: borderRadius || '8px',
        color: color || '',
        backgroundImage: backgroundImage || '',
        minWidth: minWidth || '',
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
  loadingColor,
}: {
  Text: () => JSX.Element;
  loading: boolean;
  loadingColor?: string;
}) {
  return <>{loading ? <BeatLoading color={loadingColor} /> : <Text />}</>;
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
    minWidth,
    background,
    borderRadius,
    ...reset
  } = props;
  return (
    <div
      {...reset}
      className={`${className ? className : ''} ${loading ? 'opacity-40' : ''}`}
      style={{
        borderRadius: borderRadius || '8px',
        minWidth: minWidth || '',
        color: color || '',
        background: background || '',
      }}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center  w-full h-full ${
          disabled ? 'cursor-not-allowed' : ''
        } ${btnClassName ? btnClassName : ''}`}
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
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

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
          // setButtonLoading(true);
          modal.show();
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
  beatStyling?: boolean;
  opacity?: boolean;
  padding?: string;
  gradient?: string;
  style?: any;
}) {
  const {
    text,
    onClick,
    className,
    disabled,
    grayDisable,
    disableForUI,
    width,
    beatStyling,
    opacity,
    padding,
    gradient,
    style,
  } = porps;

  const [beating, setBeating] = useState<boolean>(false);

  const isClientMobie = useClientMobile();

  return (
    <button
      className={`  ${
        grayDisable ? 'opacity-30' : gradient || 'bg-veGradient'
      } ${width} ${className}  ${
        disabled || beating
          ? 'opacity-30 cursor-not-allowed'
          : 'opacity-80 hover:opacity-100'
      } ${padding ? padding : 'px-5 py-3'} rounded-lg text-center   `}
      onClick={(e) => {
        if (beatStyling) {
          setBeating(true);
        }

        onClick && onClick(e);
      }}
      disabled={disableForUI ? false : disabled || grayDisable}
      style={{
        backgroundColor: grayDisable
          ? isClientMobie
            ? '#1D2932'
            : '#445867'
          : '',
        ...style,
      }}
    >
      <span className="flex items-center justify-center">
        {beating ? <BeatLoading /> : text}
      </span>
    </button>
  );
}

export function FarmProposalGrayButton(porps: {
  text: string | JSX.Element;
  onClick?: any;
  className?: string;
  disabled?: boolean;
  grayDisable?: boolean;
  disableForUI?: boolean;
  width?: string;
  beatStyling?: boolean;
  opacity?: boolean;
  padding?: string;
}) {
  const {
    text,
    onClick,
    className,
    disabled,
    grayDisable,
    disableForUI,
    width,
    beatStyling,
    padding,
  } = porps;

  const [beating, setBeating] = useState<boolean>(false);

  return (
    <button
      className={`cursor-not-allowed  ${
        grayDisable ? 'opacity-30' : 'bg-white bg-opacity-10'
      } ${width} ${className}  ${
        disabled || beating ? 'opacity-30 ' : 'opacity-80 '
      } ${padding ? padding : 'px-5 py-3'} rounded-lg text-center   `}
      onClick={(e) => {
        if (beatStyling) {
          setBeating(true);
        }

        onClick && onClick(e);
      }}
      disabled={disableForUI ? false : disabled || grayDisable}
      style={{
        backgroundColor: grayDisable ? '#445867' : '',
      }}
    >
      <span className="text-white opacity-30">
        {beating ? <BeatLoading /> : text}
      </span>
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

  const parsedWith =
    Number(gradientWith.substring(0, gradientWith.length - 1)) > 3
      ? gradientWith
      : '3%';

  const mobileParsedWith =
    Number(gradientWith.substring(0, gradientWith.length - 1)) > 5
      ? gradientWith
      : '5%';

  const isClientMobie = useClientMobile();

  return (
    <button
      className={` ${width} ${className} ${
        disabled || grayDisable ? 'cursor-not-allowed' : ''
      } relative  py-3 xsm:py-0  ${
        disabled ? 'opacity-30' : ''
      }  rounded-lg text-center `}
      onClick={(e) => onClick && onClick(e)}
      disabled={disableForUI ? false : disabled || grayDisable}
      style={{
        backgroundColor: '#445867',
      }}
    >
      <span className="relative z-20">{text}</span>

      <div
        className="w-full h-full left-0 top-0 rounded-lg we bg-veGradient whitespace-nowrap absolute"
        style={{
          width: isClientMobie ? mobileParsedWith : parsedWith,
        }}
      ></div>
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
  padding?: string;
  hoverStyle?: boolean;
  beatStyling?: boolean;
}) {
  const {
    text,
    onClick,
    padding,
    className,
    disabled,
    width,
    color,
    opacity,
    hoverStyle,
    beatStyling,
  } = porps;

  const [beating, setBeating] = useState<boolean>(false);

  return (
    <button
      className={`${
        hoverStyle ? 'opacity-80 hover:opacity-100' : ''
      } p-px rounded-lg text-center ${
        disabled ? 'opacity-30 cursor-not-allowed' : ''
      }  bg-veGradient ${width} ${opacity}`}
    >
      <button
        disabled={disabled}
        className={`w-full ${
          disabled ? 'cursor-not-allowed' : ''
        } rounded-lg cursor-pointer text-center ${className} ${
          padding ? padding : 'py-2.5 px-4'
        }`}
        style={{
          backgroundColor: color || 'rgb(0,12,21)',
        }}
        onClick={(e) => {
          if (beatStyling) {
            setBeating(true);
          }
          onClick && onClick(e);
        }}
      >
        <span className="px-0.5 py-0.5 my-px">
          <ButtonTextWrapper
            loading={beating}
            Text={() => <span>{text}</span>}
          />
        </span>
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

export function GreenConnectToNearBtn(props: any) {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { className } = props;

  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

  return (
    <>
      <div
        className={`flex items-center cursor-pointer justify-center rounded-full py-1 text-sm text-black bg-darkGreenColor hover:bg-lightGreenColor ${className} ${
          buttonLoading ? 'opacity-40' : ''
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // setButtonLoading(true);
          modal.show();
        }}
      >
        <span className="mr-2">
          <UnLoginIcon width="15" height="13" color="#000" />
        </span>
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

export function BlacklightConnectToNearBtn(props: any) {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { className } = props;

  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

  return (
    <>
      <div
        className={`flex items-center cursor-pointer justify-center rounded-full py-1 text-sm text-white bg-black bg-opacity-30 border border-white border-opacity-30 ${className} ${
          buttonLoading ? 'opacity-40' : ''
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // setButtonLoading(true);
          modal.show();
        }}
      >
        <span className="mr-2">
          <UnLoginIcon width="15" height="13" color="#fff" />
        </span>
        <button>
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => (
              <FormattedMessage
                id="connect_wallet"
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

export const YouVotedButton = () => {
  return (
    <NewGradientButton
      className=" text-white whitespace-nowrap text-sm self-start cursor-default opacity-100 h-6"
      text={<FormattedMessage id="you_voted" defaultMessage={'You voted'} />}
      padding="px-2 py-0"
    />
  );
};

export function ConnectToNearBtnVotingMobile() {
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

  return (
    <>
      <div
        className={`flex items-center cursor-pointer border w-40 border-white px-3 justify-center rounded-full bg-opacity-50 py-1 text-sm ${
          buttonLoading ? 'opacity-40' : ''
        }`}
        style={{
          color: '#fff',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // setButtonLoading(true);
          modal.show();
        }}
      >
        {!buttonLoading && (
          <div className="transform scale-50">
            <UnLoginIcon />
          </div>
        )}

        <button className="text-sm">
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
    </>
  );
}

export const BuyNearButton = () => {
  const [hover, setHover] = useState<boolean>(false);

  const wallet = getCurrentWallet().wallet;

  const isMobile = useClientMobile();
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openTransak(wallet.getAccountId() || '');
      }}
      className="relative z-50"
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      {isMobile ? (
        <BuyNearIcon />
      ) : hover ? (
        <BuyNearHoverIcon />
      ) : (
        <BuyNearIcon />
      )}
    </button>
  );
};

export function ConnectToNearBtnSwap() {
  const [hover, setHover] = useState(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const [showWalletRisk, setShowWalletRisk] = useState<boolean>(false);

  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

  const handleModalOpen = () => {
    const isAcknowledgeWalletRisk = localStorage.getItem(
      CONST_ACKNOWLEDGE_WALLET_RISK
    );
    if (!isAcknowledgeWalletRisk) {
      setShowWalletRisk(true);
    } else {
      modal.show();
    }
  };

  const handleAcknowledgeClick = (status) => {
    if (status === true) {
      setShowWalletRisk(false);
      localStorage.setItem(CONST_ACKNOWLEDGE_WALLET_RISK, '1');
      modal.show();
    }
  };

  return (
    <>
      <div
        className={`flex items-center gotham_bold cursor-pointer justify-center rounded-lg py-3 text-base ${
          hover
            ? 'bg-buttonGradientBg text-white'
            : 'bg-unLoginButtonBgColor text-gradientFrom'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // setButtonLoading(true);
          handleModalOpen();
        }}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        {!buttonLoading && (
          <div className="mr-3.5 transform scale-75">
            <UnLoginIcon color={`${hover ? '#fff' : '#00C6A2'}`} />
          </div>
        )}

        <button disabled={buttonLoading}>
          <ButtonTextWrapper
            loading={buttonLoading}
            Text={() => (
              <FormattedMessage
                id="connect_wallet"
                defaultMessage="Connect Wallet"
              />
            )}
          />
        </button>
      </div>

      <WalletRiskCheckBoxModal
        isOpen={showWalletRisk}
        setCheckedStatus={handleAcknowledgeClick}
        onClose={() => setShowWalletRisk(false)}
      />

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
