import React, { useState } from 'react';
import MicroModal from 'react-micro-modal';
import { registerTokenAndExchange } from '../../services/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { IoCloseOutline } from 'react-icons/io5';

export default function AddToken() {
  const [tokenId, setTokenId] = useState<string>();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    return registerTokenAndExchange(tokenId);
  };
  const intl = useIntl();

  return (
    <MicroModal
      trigger={(open) => (
        <button
          onClick={open}
          className="border whitespace-pre border-gray-400 text-gray-400 focus:outline-none rounded-2xl py-1 px-2 text-xs font-semibold"
        >
          <FormattedMessage id="add_token" defaultMessage="Add Token" />
        </button>
      )}
      overrides={{
        Overlay: {
          style: {
            zIndex: 120,
            backgroundColor: 'rgba(0, 19, 32, 0.85)',
          },
        },
        Dialog: {
          style: {
            borderRadius: '0.75rem',
            border: '1px solid rgba(0, 198, 162, 0.5)',
            padding: '1.5rem',
            background: '#1D2932',
          },
        },
      }}
    >
      {(close) => (
        <>
          <div className="flex justify-between text-white pb-3">
            <span>
              <FormattedMessage id="add_token" defaultMessage="Add Token" />
            </span>
            <IoCloseOutline
              onClick={close}
              className="text-gray-400 text-2xl right-6"
            />
          </div>
          <input
            className="focus:outline-none shadow bg-black bg-opacity-25 appearance-none rounded-lg w-96 xs:w-72 py-2 px-3 text-sm text-greenLight leading-tight font-bold"
            type="text"
            placeholder={intl.formatMessage({ id: 'enter_token_address' })}
            value={tokenId}
            onChange={({ target }) => setTokenId(target.value)}
          />
          <div className="flex justify-center">
            <button
              onClick={(e) => {
                handleSubmit(e);
                close();
              }}
              className="flex h-8 flex-row justify-center px-4 mt-5 mb-5 items-center rounded-lg text-buttonText shadow-lg transition-colors focus:outline-none disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
              }}
            >
              <FormattedMessage id="add_token" defaultMessage="Add Token" />
            </button>
          </div>
        </>
      )}
    </MicroModal>
  );
}
