import React from 'react';
import { Near } from '../icon';
import { REF_FARM_CONTRACT_ID, wallet } from '../../services/near';
import { FormattedMessage } from 'react-intl';
import { GradientButton } from '~components/button/Button';
interface SubmitButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  info?: string | JSX.Element;
}

function SubmitButton({ disabled, onClick }: SubmitButtonProps) {
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
          <h1 className="text-lg font-inter font-semibold">
            <FormattedMessage id="swap" defaultMessage="Swap" />
          </h1>
        </button>
      ) : (
        <GradientButton
          color="#fff"
          className={`w-full text-center text-lg text-white mt-4 px-3 py-2 focus:outline-none font-semibold bg-greenLight`}
          onClick={() => wallet.requestSignIn(REF_FARM_CONTRACT_ID)}
        >
          <FormattedMessage
            id="connect_to_near"
            defaultMessage="Connect to NEAR"
          />
        </GradientButton>
      )}
    </>
  );
}

export default SubmitButton;
