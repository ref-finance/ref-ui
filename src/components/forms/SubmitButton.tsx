import React from 'react';
import { Near } from '../icon';
import { REF_FARM_CONTRACT_ID, wallet } from '../../services/near';
import { FormattedMessage } from 'react-intl';
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
          className={`flex flex-row justify-center px-5 py-2.5 mt-6 items-center rounded-full bg-greenLight text-buttonText focus:outline-none disabled:cursor-not-allowed mx-auto ${
            disabled ? 'bg-opacity-50' : ''
          }`}
        >
          <h1 className="text-xs font-inter font-semibold">
            <FormattedMessage id="swap" defaultMessage="Swap" />
          </h1>
        </button>
      ) : (
        <button
          onClick={() => wallet.requestSignIn(REF_FARM_CONTRACT_ID)}
          type="button"
          className="flex bg-black bg-opacity-25 font-semibold px-5 py-2.5 text-white p-2 mt-6 items-center rounded-full focus:outline-none mx-auto"
        >
          {' '}
          <Near />
          <span className="ml-2 text-xs">
            <FormattedMessage
              id="connect_to_near"
              defaultMessage="Connect to NEAR"
            />
          </span>
        </button>
      )}
    </>
  );
}

export default SubmitButton;
