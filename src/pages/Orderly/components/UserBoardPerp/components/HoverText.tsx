import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { QuestionMark } from '../../Common';
import { isMobile } from '~utils/device';
import { useClientMobile } from '../../../../../utils/device';
import ReactTooltip from 'react-tooltip';

export function MarginRatioText() {
  const [hover, setHover] = useState(false);

  const intl = useIntl();

  return (
    <div className="frcs gap-1 ">
      <span className="whitespace-nowrap">
        <FormattedMessage
          id="margin_ratio"
          defaultMessage={`Margin Ratio`}
        ></FormattedMessage>
      </span>

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
            className=" absolute bg-cardBg z-30 transform xs:left-3 translate-y-1/2 right-3  bottom-3 px-4 py-2 rounded-lg text-xs border border-primaryText"
            style={{
              width: isMobile() ? '200px' : '300px',
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
      <span className="whitespace-nowrap">
        <FormattedMessage
          id="total_upnl"
          defaultMessage={`Total uPnL`}
        ></FormattedMessage>
      </span>

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
            className=" absolute bg-cardBg z-30 transform translate-y-1/2 right-3 xs:left-3 bottom-3  px-4 py-2 rounded-lg text-xs border border-primaryText"
            style={{
              width: isMobile() ? '200px' : '300px',
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

  return (
    <div className="frcs gap-1 ">
      <span className="whitespace-nowrap">
        <FormattedMessage
          id="unsettle_pnl"
          defaultMessage={`Unsettle PnL`}
        ></FormattedMessage>
      </span>

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
            className=" absolute bg-cardBg z-30 xs:left-3  transform translate-y-1/2 right-3 bottom-3  px-4 py-2 rounded-lg text-xs border border-primaryText"
            style={{
              width: isMobile() ? '200px' : '300px',
            }}
          >
            <FormattedMessage
              id="unsettle_pnl_tip"
              defaultMessage={
                'Move a profit or loss from perp markets into the USDC token balance. This has no impact on your open positions or health.'
              }
            ></FormattedMessage>
          </div>
        )}
      </div>
    </div>
  );
}

function getLqPriceTip() {
  const intl = useIntl();
  return `<div class=" rounded-md w-p200 text-primaryOrderly text-xs text-left">
    ${intl.formatMessage({
      id: 'liquidation_price_tip',
      defaultMessage:
        'This price is for reference only. You can see the liquidation price in your Orderly portfolio after your order is filled.',
    })} 
  </div>`;
}

export function LiquidationPriceText() {
  const [hover, setHover] = useState(false);

  const isMobile = useClientMobile();

  return (
    <div className="frcs gap-1 text-primaryText">
      <span className="whitespace-nowrap">
        <FormattedMessage
          id="est_liquidation_price"
          defaultMessage={`Est. liquidation price`}
        />
      </span>

      <div
        data-class="reactTip"
        data-for={'user_lq_price'}
        data-html={true}
        data-place={'top'}
        data-tip={getLqPriceTip()}
      >
        <QuestionMark />

        <ReactTooltip
          id={'user_lq_price'}
          backgroundColor="#1D2932"
          place="right"
          border
          borderColor="#7e8a93"
          textColor="#C6D1DA"
          effect="solid"
        />
      </div>
    </div>
  );
}
