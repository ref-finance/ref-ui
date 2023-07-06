import React from 'react';

import { FormattedMessage } from 'react-intl';

export function PerpOrderlyTip() {
  return (
    <div
      className="w-screen  h-9  absolute -top-12 bg-gradientFromHover frcc"
      style={{
        fontSize: '13px',
        color: '#111F29',
      }}
    >
      <FormattedMessage
        id="perpTip"
        defaultMessage={
          'Welcome to Ref perpetual-future, read {perpTipLink} docs to get start!'
        }
        values={{
          perpTipLink: (
            <a
              className="font-gothamBold mx-1"
              rel="noopener noreferrer nofollow"
              target="_blank"
              href="https://docs.orderly.network/perpetual-futures/introduction"
            >
              <FormattedMessage
                id="perpTipLink"
                defaultMessage="[Perpetual-futures Introduction]"
              />
            </a>
          ),
        }}
      />
    </div>
  );
}
