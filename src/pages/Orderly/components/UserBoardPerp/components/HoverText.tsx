import Big from 'big.js';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import { isMobile } from '../../../../../utils/device';
import { useClientMobile } from '../../../../../utils/device';
import { useOrderlyContext } from '../../../orderly/OrderlyContext';
import { digitWrapperAsset } from '../../../utiles';
import { CollatteralTokenIcon, QuestionMark } from '../../Common';
import { parseSymbol } from '../../RecentTrade/index';
import { useTokensBalances } from '../../UserBoard/state';
import { usePerpData } from '../../UserBoardPerp/state';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

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
                'The margin ratio of an account is equal to the total collateral value (ie the USDC.e.e balance + any unrealized profit/loss) divided by the total open notional of the account (the sum of the absolute notional value of all positions)'
              }
            ></FormattedMessage>
            <br />
            <a
              className="underline text-v3Blue"
              href="https://docs.orderly.org/perpetual-futures/margin-leverage-and-pnl"
              rel="noopener noreferrer nofollow"
              target="_blank"
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
                'Move a profit or loss from perp markets into the USDC.e token balance. This has no impact on your open positions or health.'
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
      <span className="">
        <FormattedMessage
          id="est_liquidation_price"
          defaultMessage={`Est. liquidation price`}
        />
        <span
          data-class="reactTip"
          data-tooltip-id={'user_lq_price'}
          data-place={'top'}
          data-tooltip-html={getLqPriceTip()}
          className="inline-block pl-1 relative top-0.5"
        >
          <QuestionMark />

          <CustomTooltip id={'user_lq_price'} place="right" />
        </span>
      </span>
    </div>
  );
}

export function TotalCollateralText() {
  const [hover, setHover] = useState(false);

  const intl = useIntl();

  return (
    <div className="frcs gap-1 ">
      <span className="whitespace-nowrap">
        <FormattedMessage
          id="total_collateral"
          defaultMessage={`Total Collateral`}
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
              width: '200px',
            }}
          >
            Total Collateral = USDC.e Balance + unsettle PnL
          </div>
        )}
      </div>
    </div>
  );
}
export function FreeCollateralText() {
  const [hover, setHover] = useState(false);

  const intl = useIntl();

  return (
    <div className="frcs gap-1 ">
      <span className="whitespace-nowrap">
        <FormattedMessage
          id="free_collateral"
          defaultMessage={`Free Collateral`}
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
            className=" absolute bg-cardBg z-30 transform translate-y-1/2 right-3 xs:left-3 bottom-3  px-4 py-2 rounded-lg 
            #7E8A93-xs border border-primaryText"
            style={{
              width: '200px',
            }}
          >
            Free Collateral = Total Collateral - order/postion
          </div>
        )}
      </div>
    </div>
  );
}
export function UsdcAvailableBalanceText({
  p,
}: {
  p?: 'top' | 'right' | 'left' | 'bottom';
}) {
  const [hover, setHover] = useState(false);

  const intl = useIntl();

  return (
    <div className="frcs gap-1 ">
      <span className="whitespace-nowrap">USDC.e Available Balance</span>

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
            className="absolute bg-cardBg z-30 transform translate-y-1/2 xsm:-right-16 xsm:bottom-12 lg:bottom-3 lg:right-3  px-4 py-2 rounded-lg text-xs border border-primaryText"
            style={{
              width: '200px',
            }}
          >
            USDC.e Available Balance = min(USDC.e Balance, Free Collateral)
          </div>
        )}
      </div>
    </div>
  );
}

export function CollatteralToken({
  d,
}: {
  d?: 'top' | 'right' | 'left' | 'bottom';
}) {
  const [hover, setHover] = useState(false);
  return (
    <div className="frcs ml-1.5">
      <div
        className="relative"
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <CollatteralTokenIcon />

        {hover && (
          <div
            className={`absolute bg-cardBg z-30 transform translate-y-1/2 ${
              d == 'right' ? 'left-5' : d == 'left' ? 'right-5' : 'right-5'
            }  xs:left-3 bottom-3  px-4 py-2 rounded-lg text-xs text-primaryText border border-primaryText whitespace-nowrap`}
          >
            collatteral token
          </div>
        )}
      </div>
    </div>
  );
}
export function CollatteralTokenAvailableCell({
  finalBalance,
  usdcBalance,
  freeCollateral,
}: any) {
  const [collateralTokenTip, setCollateralTokenTip] = useState<boolean>(false);
  const { tokenInfo, holdings, symbol } = useOrderlyContext();
  const { totalCollateral, unsettle } = usePerpData();
  const { symbolTo } = parseSymbol(symbol);
  const curHoldingOut = holdings?.find((h) => h.token === symbolTo);
  const balances = useTokensBalances(
    tokenInfo?.map((token) => {
      return {
        id: token.token_account_id,
        decimals: token.decimals,
      };
    }) || [],
    tokenInfo,
    true,
    freeCollateral,
    curHoldingOut
  );
  const usdc = balances?.find((b: any) => b?.name?.includes('USDC'));
  let in_order: any = '-';
  let balance: any = '-';
  let in_perp: any = '-';
  if (usdc) {
    in_order = Math.abs(usdc['in-order']);
    balance =
      usdcBalance == '-'
        ? Number(in_order)
        : Number(in_order) + Number(usdcBalance);
  }
  if (totalCollateral !== '-' && freeCollateral !== '-') {
    in_perp = Number(totalCollateral) - Number(freeCollateral);
  }
  return (
    <div className="flex items-center justify-self-end border-b border-dashed border-primaryText cursor-pointer frcs">
      <div
        className="relative"
        onMouseEnter={() => {
          setCollateralTokenTip(true);
        }}
        onMouseLeave={() => {
          setCollateralTokenTip(false);
        }}
      >
        {finalBalance}

        {collateralTokenTip && (
          <div className="absolute bg-cardBg z-50 transform translate-y-3/4 right-full -translate-x-2 bottom-3  px-4 py-2 rounded-lg text-xs text-primaryText border border-primaryText whitespace-nowrap">
            <div className="flex items-center gap-2  justify-between text-xs text-farmText">
              <span>Balance</span>
              <span>{balance === '-' ? '-' : Big(balance).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 justify-between text-xs text-farmText mt-2">
              <span>Spot Freezing</span>
              <span>{in_order === '-' ? '-' : Big(in_order).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 justify-between text-xs text-farmText mt-2">
              <span>Perps Positions/Orders Freezing</span>
              <span>{in_perp === '-' ? '-' : Big(in_perp).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 justify-between text-xs text-farmText mt-2">
              <span>Unsettle PnL</span>
              <span>{unsettle === '-' ? '-' : Big(unsettle).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
