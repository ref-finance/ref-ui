import React, { useState } from 'react';
import MicroModal from 'react-micro-modal';
import { registerTokenAndExchange } from '../../services/token';
import { FormattedMessage, useIntl } from 'react-intl';

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
          className="border border-greenLight focus:outline-none rounded-2xl py-1 px-2 text-xs font-semibold"
        >
          <FormattedMessage id="add_token" defaultMessage="Add Token" />
        </button>
      )}
    >
      {(close) => (
        <>
          <div className="flex justify-between text-gray-600 pb-3">
            <span className="text-black">
              <FormattedMessage id="add_token" defaultMessage="Add Token" />
            </span>
          </div>
          <input
            className="focus:outline-none shadow bg-inputBg appearance-none border rounded border-opacity-30 w-96 py-2 px-3 text-sm text-inputText leading-tight font-bold"
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
              className="flex flex-row justify-center p-2 px-4 mt-5 mb-5 items-center rounded-2xl bg-primaryScale-600 border-2 text-buttonText hover:bg-buttonText hover:text-buttonBg hover:border-buttonBg hover:border-2 transition-colors shadow-lg transition-colors focus:outline-none disabled:cursor-not-allowed mr-2.5"
            >
              <FormattedMessage id="add_token" defaultMessage="Add Token" />
            </button>
            <button
              onClick={close}
              className="flex flex-row justify-center p-2 px-4 mt-5 mb-5 items-center rounded-2xl bg-buttonText text-buttonBg border-buttonBg border-2 hover:bg-buttonText hover:text-buttonBg hover:border-buttonBg hover:border-2 transition-colors shadow-lg transition-colors focus:outline-none disabled:cursor-not-allowed"
            >
              <FormattedMessage id="cancel" defaultMessage="Cancel" />
            </button>
          </div>
        </>
      )}
    </MicroModal>
  );
}
