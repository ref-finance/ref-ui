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
import { getCurrentWallet, WalletContext } from '../../utils/sender-wallet';

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
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  return (
    <>
      {isSignedIn || signedInConfig ? (
        <button
          type={onClick ? 'button' : 'submit'}
          disabled={disabled}
          onClick={onClick}
          className={`flex flex-row w-full items-center justify-center px-5 py-2 mt-6 text-white mx-auto ${
            disabled ? 'disabled:cursor-not-allowed opacity-40' : ''
          } ${loading ? 'opacity-40' : ''} ${className}`}
          style={{
            background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
            borderRadius: '5px',
          }}
        >
          {!label && (
            <h1 className="text-lg font-inter font-semibold">
              <ButtonTextWrapper
                loading={loading}
                Text={() => (
                  <FormattedMessage id="swap" defaultMessage="Swap" />
                )}
              />
            </h1>
          )}
          {label && (
            <h1 className="text-lg font-inter font-semibold">
              <ButtonTextWrapper
                loading={loading}
                Text={() => (
                  <FormattedMessage id={label} defaultMessage={label} />
                )}
              />
            </h1>
          )}
        </button>
      ) : (
        <div className="mt-4 w-full">
          <ConnectToNearBtn />
        </div>
      )}
    </>
  );
}

export default SubmitButton;
