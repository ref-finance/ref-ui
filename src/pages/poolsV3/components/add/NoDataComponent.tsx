import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { WalletContext } from '../../../../utils/wallets-integration';
import { LiquidityProviderData } from '../../AddYourLiquidityPageV3';

export function NoDataComponent() {
  const [chartTab, setChartTab] = useState<'liquidity' | 'yours'>('liquidity');
  const [priceRangeMode, setPriceRangeMode] = useState<
    'by_range' | 'by_radius'
  >('by_range');
  const { show_chart } = useContext(LiquidityProviderData);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  return (
    <div className={`w-full xs:w-full md:w-full flex flex-col self-stretch`}>
      {/* chart area */}
      <div
        className={`xsm:bg-mobileOrderListBg xsm:py-2.5 xsm:px-4 ${
          show_chart ? '' : 'hidden'
        }`}
      >
        <div className="relative mb-5 mt-24 pt-px" style={{ height: '270px' }}>
          <div className="absolute left-0 -top-24 inline-flex items-center justify-between bg-detailCardBg rounded-lg border border-dclTabBorderColor p-0.5">
            <span
              onClick={() => {
                setChartTab('liquidity');
              }}
              className={`w-20 frcc text-xs gotham_bold px-3 py-1.5 rounded-md cursor-pointer ${
                chartTab == 'liquidity'
                  ? 'text-black bg-gradientFromHover'
                  : 'text-primaryText'
              }`}
            >
              Liquidity
            </span>
            <span
              className={`w-20 frcc text-xs gotham_bold px-3 py-1.5 rounded-md ${
                isSignedIn ? 'cursor-pointer' : 'cursor-not-allowed'
              } ${
                chartTab == 'yours'
                  ? 'text-black bg-gradientFromHover'
                  : 'text-primaryText'
              }`}
              onClick={() => {
                if (isSignedIn) {
                  setChartTab('yours');
                }
              }}
            >
              Yours
            </span>
          </div>
          <div className="flex items-center justify-center text-ms text-primaryText mt-20">
            Oops! The Pool doesn’t exist
          </div>
        </div>
      </div>
      {/* set price range area */}
      <div className="lg:border lg:border-limitOrderFeeTiersBorderColor lg:rounded-xl p-4 xsm:mb-3">
        {/* price range mode area */}
        <div className="frcb">
          <div className="text-white flex flex-col text-sm ">
            <FormattedMessage
              id="set_price_range"
              defaultMessage="Set Price Range"
            />

            <span className="text-xs font-gotham text-primaryText"></span>
          </div>

          <div className="rounded-lg p-1 border frcs text-xs text-primaryText border-v3borderColor">
            <span
              className={`whitespace-nowrap min-w-20 px-3 py-1.5 rounded-md cursor-pointer ${
                priceRangeMode === 'by_range'
                  ? 'text-white bg-proTabBgColor'
                  : ''
              }`}
              onClick={() => {
                setPriceRangeMode('by_range');
              }}
            >
              <FormattedMessage
                id="by_range"
                defaultMessage={'By range'}
              ></FormattedMessage>
            </span>
            <span
              className={`whitespace-nowrap min-w-20 px-3 py-1.5 rounded-md cursor-pointer ${
                priceRangeMode === 'by_radius'
                  ? 'text-white bg-proTabBgColor'
                  : ''
              }`}
              onClick={() => {
                setPriceRangeMode('by_radius');
              }}
            >
              <FormattedMessage
                id="by_radius"
                defaultMessage={'By Radius'}
              ></FormattedMessage>
            </span>
          </div>
        </div>
        {/* content */}
        <div className="lg:grid lg:grid-cols-3 xsm:flex xsm:flex-col gap-3 pt-4 mt-3">
          {/* target price input box */}
          <div
            className={`${
              priceRangeMode === 'by_range' ? 'hidden' : ''
            } flex border border-menuMoreBoxBorderColor items-center justify-between rounded-xl p-2.5 col-span-2`}
          >
            <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
              <FormattedMessage
                id="target_price"
                defaultMessage="Target Price"
              ></FormattedMessage>
            </span>
            <span className="text-base text-primaryText font-gothamBold">
              0
            </span>
          </div>

          {/* radius input box */}
          <div
            className={` ${
              priceRangeMode === 'by_range' ? 'hidden' : ''
            } flex border border-menuMoreBoxBorderColor items-center justify-between  rounded-xl p-2.5 col-span-1`}
          >
            <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
              <FormattedMessage
                id="radius"
                defaultMessage="Radius"
              ></FormattedMessage>
            </span>
            <span className="text-base text-primaryText font-gothamBold">
              0
            </span>
          </div>

          {/* min price input box */}
          <div className=" flex border border-menuMoreBoxBorderColor items-center justify-between rounded-xl p-2.5 col-span-1">
            <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
              <FormattedMessage
                id="min_price"
                defaultMessage="Min Price"
              ></FormattedMessage>
            </span>
            <span className="text-base text-primaryText font-gothamBold">
              0
            </span>
          </div>

          {/* max price input box */}
          <div className="flex border border-menuMoreBoxBorderColor items-center justify-between rounded-xl p-2.5 col-span-1">
            <span className="text-sm text-primaryText xs:text-xs whitespace-nowrap md:text-xs">
              <FormattedMessage
                id="max_price"
                defaultMessage="Max Price"
              ></FormattedMessage>
            </span>
            <span className="text-base text-primaryText font-gothamBold">
              0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
