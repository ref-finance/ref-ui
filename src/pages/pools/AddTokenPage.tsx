import React, { useState } from 'react';
import { Card } from '~components/card/Card';
import { wallet } from '~services/near';
import { registerTokenAndExchange } from '~services/token';
import Alert from '~components/alert/Alert';
import { FormattedMessage, useIntl } from 'react-intl';
import { ConnectToNearBtn } from '~components/button/Button';

export function AddTokenPage() {
  const [addr, setAddr] = useState('');
  const [error, setError] = useState<string>();
  const intl = useIntl();
  return (
    <div className="flex items-center flex-col w-1/3 md:w-5/6 xs:w-11/12 m-auto">
      <div className="text-center pb-8">
        <div className="text-white text-3xl font-semibold">
          <FormattedMessage id="add_token" defaultMessage="Add Token" />
        </div>
      </div>
      <div className="w-full flex justify-center">
        {error && <Alert level="error" message={error} />}
      </div>
      <Card width="w-full">
        <div className="text-xs font-semibold">
          <FormattedMessage id="add_token" defaultMessage="Add token" />
        </div>
        <div className="rounded-lg w-full border my-2">
          <input
            className={`text-sm font-bold bg-inputBg focus:outline-none rounded-lg w-full py-2 px-3 text-greenLight`}
            placeholder={intl.formatMessage({ id: 'enter_token_address' })}
            value={addr}
            onChange={({ target }) => setAddr(target.value)}
          />
        </div>
        <div className="pt-4 flex items-center justify-center">
          {wallet.isSignedIn() ? (
            <button
              disabled={!addr}
              className={`rounded-full text-xs text-white px-5 py-2.5 focus:outline-none font-semibold bg-greenLight ${
                addr ? '' : 'bg-opacity-50 disabled:cursor-not-allowed'
              }`}
              onClick={async () => {
                if (addr) {
                  try {
                    await registerTokenAndExchange(addr);
                  } catch (err) {
                    if (addr.substr(0, 2) === '0x' && addr.length === 42) {
                      setError(intl.formatMessage({ id: 'not_nep_address' }));
                    } else if (err.message.indexOf('does not exist') != -1) {
                      setError(
                        intl.formatMessage({ id: 'not_correct_address' })
                      );
                    } else {
                      setError(err.message);
                    }
                  }
                }
              }}
            >
              <FormattedMessage id="add_token" defaultMessage="Add token" />
            </button>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </Card>
      <div className="text-white text-sm pt-3 leading-6 w-full text-center">
        <FormattedMessage
          id="addTokenCopy"
          defaultMessage="Add any NEP-141 token."
        />
      </div>
    </div>
  );
}
