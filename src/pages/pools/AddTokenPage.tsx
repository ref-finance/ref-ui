import React, { useState } from 'react';
import { Card } from '~components/card/Card';
import { ConnectToNearBtn } from '~components/deposit/Deposit';
import { wallet } from '~services/near';
import { registerTokenAndExchange } from '~services/token';
import Alert from '~components/alert/Alert';
import copy from '~utils/copy';

export function AddTokenPage() {
  const [addr, setAddr] = useState('');
  const [error, setError] = useState<Error>();

  return (
    <div className="flex items-center flex-col w-1/3 md:w-5/6 xs:w-11/12 m-auto">
      <div className="text-center pb-8">
        <div className="text-white text-3xl font-semibold">Add Token</div>
      </div>
      <div className="w-1/3 flex justify-center">
        {error && <Alert level="error" message={error.message} />}
      </div>
      <Card width="w-full">
        <div className="text-xs font-semibold">Token</div>
        <div className="rounded-lg w-full border my-2">
          <input
            className={`text-sm font-bold bg-inputBg focus:outline-none rounded-lg w-full py-2 px-3 text-greenLight`}
            placeholder="Enter Token Address..."
            value={addr}
            onChange={({ target }) => setAddr(target.value)}
          />
        </div>
        <div className="pt-4 flex items-center justify-center">
          {wallet.isSignedIn() ? (
            <button
              disabled={!addr}
              className={`rounded-full text-xs text-white px-3 py-1.5 focus:outline-none font-semibold bg-greenLight ${
                addr ? '' : 'bg-opacity-50 disabled:cursor-not-allowed'
              }`}
              onClick={async () => {
                if (addr) {
                  try {
                    await registerTokenAndExchange(addr);
                  } catch (err) {
                    setError(err);
                  }
                }
              }}
            >
              Add token
            </button>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </Card>
      <div className="text-white text-sm pt-3 leading-6 w-full text-center">
        {copy.addToken}
      </div>
    </div>
  );
}
