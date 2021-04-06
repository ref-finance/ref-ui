import React from 'react';
import { wallet } from '../../services/near';
import { FaInfoCircle } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';

interface SubmitButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  info?: string;
}

function SubmitButton({ text, disabled, onClick, info }: SubmitButtonProps) {
  return (
    <>
      {wallet.isSignedIn() ? (
        <button
          type={onClick ? 'button' : 'submit'}
          disabled={disabled}
          onClick={onClick}
          className="flex flex-row justify-center py-4 mt-5 mb-5 items-center rounded-md w-full bg-buttonBg border-2 text-buttonText hover:bg-buttonText hover:text-buttonBg hover:border-buttonBg hover:border-2 disabled:opacity-50 transition-colors shadow-lg transition-colors focus:outline-none disabled:cursor-not-allowed"
        >
          <h1 className="text-xl font-inter font-medium ">{text}</h1>
          {info ? (
            <>
              <FaInfoCircle
                data-type="dark"
                data-place="bottom"
                data-multiline={true}
                data-tip={info}
                className="text-large ml-2"
              />
              <ReactTooltip />
            </>
          ) : null}
        </button>
      ) : (
        <button
          onClick={() => wallet.requestSignIn()}
          type="button"
          className="bg-blue-500 hover:bg-white hover:text-blue-500 hover:border-2 hover:border-blue-500 border-2 text-white py-4 mt-5 mb-5 items-center rounded-md w-full shadow-lg hover:bg-disabled rounded-lg transition-colors focus:outline-none"
        >
          {' '}
          CONNECT WALLET
        </button>
      )}
    </>
  );
}

export default SubmitButton;
