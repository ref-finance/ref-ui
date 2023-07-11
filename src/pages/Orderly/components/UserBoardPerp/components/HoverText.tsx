import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { QuestionMark } from '../../Common';

export function MarginRatioText() {
  const [hover, setHover] = useState(false);

  const intl = useIntl();

  return (
    <div className="frcs gap-1 ">
      <FormattedMessage
        id="margin_ratio"
        defaultMessage={`Margin Ratio`}
      ></FormattedMessage>

      <div
        className="relative"
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <QuestionMark></QuestionMark>

        {hover && (
          <div
            className=" absolute bg-cardBg z-30 transform translate-y-1/2 right-3  bottom-3 px-4 py-2 rounded-lg text-xs border border-primaryText"
            style={{
              width: '300px',
            }}
          >
            <FormattedMessage
              id="margin_ratio_tip"
              defaultMessage={
                'The margin ratio of an account is equal to the total collateral value (ie the USDC balance + any unrealized profit/loss) divided by the total open notional of the account (the sum of the absolute notional value of all positions)'
              }
            ></FormattedMessage>
            <br />
            <a
              className="underline text-v3Blue"
              href="https://docs.orderly.network/perpetual-futures/margin-leverage-and-pnl"
              rel="noopener noreferrer nofollow"
            >
              {intl.formatMessage({
                id: 'learn_more',
                defaultMessage: 'Learn More',
              })}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function TotaluPNLText() {
  const [hover, setHover] = useState(false);

  const intl = useIntl();

  return (
    <div className="frcs gap-1 ">
      <FormattedMessage
        id="total_upnl"
        defaultMessage={`Total uPnL`}
      ></FormattedMessage>

      <div
        className="relative"
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <QuestionMark></QuestionMark>

        {hover && (
          <div
            className=" absolute bg-cardBg z-30 transform translate-y-1/2 right-3 bottom-3  px-4 py-2 rounded-lg text-xs border border-primaryText"
            style={{
              width: '300px',
            }}
          >
            <FormattedMessage
              id="total_npnl_tip"
              defaultMessage={
                'Estimated unrealized profit and loss across all open positions'
              }
            ></FormattedMessage>
          </div>
        )}
      </div>
    </div>
  );
}

export function UnsettlePnl() {
  const [hover, setHover] = useState(false);

  const intl = useIntl();

  return (
    <div className="frcs gap-1 ">
      <FormattedMessage
        id="unsettle_png"
        defaultMessage={`Unsettle PnL`}
      ></FormattedMessage>

      <div
        className="relative"
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <QuestionMark></QuestionMark>

        {hover && (
          <div
            className=" absolute bg-cardBg z-30 transform translate-y-1/2 right-3 bottom-3  px-4 py-2 rounded-lg text-xs border border-primaryText"
            style={{
              width: '300px',
            }}
          >
            <FormattedMessage
              id="total_npnl_tip"
              defaultMessage={
                'Estimated unrealized profit and loss across all open positions'
              }
            ></FormattedMessage>
          </div>
        )}
      </div>
    </div>
  );
}
