import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

export function DepositTip(props: {
  onClick: () => void;
  type: 'spot' | 'perp';
}) {
  const intl = useIntl();

  return (
    <div className="text-center text-sm text-white">
      <span
        className="mr-1 cursor-pointer underline text-gradientFromHover"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          props.onClick();
        }}
      >
        <FormattedMessage id="deposit" defaultMessage="Deposit" />

        <span className="ml-1 font-gothamBold">
          {props.type === 'spot' &&
            intl
              .formatMessage({
                id: 'assets',
                defaultMessage: 'Assets',
              })
              .toLowerCase()}

          {props.type === 'perp' && 'USDC'}
        </span>
      </span>

      <span>
        <FormattedMessage
          id="to_begin_your_trading_journey"
          defaultMessage={'to begin your trading journey.'}
        ></FormattedMessage>
      </span>
    </div>
  );
}
