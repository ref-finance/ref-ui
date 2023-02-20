import React, { useContext } from 'react';
import { Near } from '../icon';
import { REF_FARM_CONTRACT_ID, wallet } from '../../services/near';
import { FormattedMessage } from 'react-intl';
import {
  GradientButton,
  ConnectToNearBtn,
  ButtonTextWrapper,
} from '../../components/button/Button';

import { BeatLoading } from '~components/layout/Loading';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { ConnectToNearBtnSwap } from '../button/Button';
import {
  getCurrentWallet,
  WalletContext,
} from '../../utils/wallets-integration';

interface SubmitButtonProps {
  text?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  info?: string | JSX.Element;
  label?: string;
  className?: string;
  loading?: boolean;
  signedInConfig?: boolean;
}

function SubmitButton({
  disabled,
  onClick,
  label,
  className,
  loading,
  signedInConfig,
}: SubmitButtonProps) {
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();
  const isSignedIn = !!accountId;

  return (
    <>
      {isSignedIn || signedInConfig ? (
        <button
          type={onClick ? 'button' : 'submit'}
          disabled={disabled || loading}
          onClick={onClick}
          className={`flex flex-row w-full items-center justify-center px-5 py-2  text-white mx-auto ${
            disabled ? 'disabled:cursor-not-allowed opacity-40' : ''
          } ${loading ? 'opacity-40' : ''} ${
            label === 'insufficient_balance' ? 'font-bold' : ''
          } ${className} bg-buttonGradientBgOpacity  ${
            loading || disabled ? '' : 'hover:bg-buttonGradientBg'
          } `}
          style={{
            background: label === 'insufficient_balance' ? '#304352' : '',
            borderRadius: '5px',
            color: label === 'insufficient_balance' ? '#7E8A93' : '',
          }}
        >
          {!label && (
            <h1 className="text-base font-inter gotham_bold">
              <ButtonTextWrapper
                loading={label !== 'insufficient_balance' && loading}
                Text={() => (
                  <FormattedMessage id="swap" defaultMessage="Swap" />
                )}
              />
            </h1>
          )}
          {label && (
            <h1
              className={`text-base font-inter ${
                label !== 'insufficient_balance' ? 'font-bold' : 'font-semibold'
              } `}
            >
              <ButtonTextWrapper
                loading={label !== 'insufficient_balance' && loading}
                Text={() => (
                  <FormattedMessage id={label} defaultMessage={label} />
                )}
              />
            </h1>
          )}
        </button>
      ) : (
        <div className={`mt-4 w-full ${className}`}>
          <ConnectToNearBtnSwap />
        </div>
      )}
    </>
  );
}
export function InsufficientButton(props: any) {
  const { divClassName, spanClassName } = props;
  return (
    <div
      className={`flex items-center justify-center bg-menuMoreBoxBorderColor rounded-lg cursor-not-allowed px-2 whitespace-nowrap ${divClassName}`}
    >
      <span
        className={`gotham_bold text-primaryText text-base ${spanClassName}`}
      >
        <FormattedMessage id="insufficient_balance"></FormattedMessage>
      </span>
    </div>
  );
}

export default SubmitButton;
