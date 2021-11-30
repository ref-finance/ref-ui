import React from 'react';
import { Near } from '../icon';
import { REF_FARM_CONTRACT_ID, wallet } from '../../services/near';
import { FormattedMessage } from 'react-intl';
import { GradientButton, ConnectToNearBtn } from '~components/button/Button';
interface SubmitButtonProps {
  text?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  info?: string | JSX.Element;
  label?: string;
}

function SubmitButton({ disabled, onClick, label }: SubmitButtonProps) {
  return (
    <>
      {wallet.isSignedIn() ? (
        <button
          type={onClick ? 'button' : 'submit'}
          disabled={disabled}
          onClick={onClick}
          className={`flex flex-row w-full justify-center px-5 py-2 mt-6 text-white disabled:cursor-not-allowed mx-auto ${
            disabled ? 'bg-opacity-50 disabled:cursor-not-allowed' : ''
          }`}
          style={
            disabled
              ? {
                  background: '#314351',
                  borderRadius: '5px',
                }
              : {
                  background:
                    'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
                  borderRadius: '5px',
                }
          }
        >
          {!label && (
            <h1 className="text-lg font-inter font-semibold">
              <FormattedMessage id="swap" defaultMessage="Swap" />
            </h1>
          )}
          {label && (
            <h1 className="text-lg font-inter font-semibold">
              <FormattedMessage id={label} defaultMessage={label} />
            </h1>
          )}
        </button>
      ) : (
        <div className="mt-4">
          <ConnectToNearBtn></ConnectToNearBtn>
        </div>
      )}
    </>
  );
}

export default SubmitButton;
