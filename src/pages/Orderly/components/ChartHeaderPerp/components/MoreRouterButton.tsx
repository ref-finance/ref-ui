import React, { useMemo } from 'react';

import { useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import Modal from 'react-modal';

import { useClientMobile } from '../../../../../utils/device';
import {
  IoClose,
  IoArrowDownOutline,
  IoArrowUpOutline,
} from '../../../../../components/reactIcons';

import {
  MobileMoreRouteIcon,
  OrderlyLoading,
  PerpPerpIcon,
  PerpSpotIcon,
  PerpSwapIcon,
} from '../../Common/Icons';
import { useOrderlyContext } from '../../../../../pages/Orderly/orderly/OrderlyContext';
import { parseSymbol } from '../../RecentTrade';
import { useTokenMetaFromSymbol } from '../../ChartHeader/state';
import { useTokenRate24h } from '../../../../../state/tokenRate';
import { tickerToDisplayDiff } from '..';
import { BsArrowRight } from '../../../../../components/reactIcons';
import { openUrl } from '../../../../../services/commonV3';
import { WRAP_NEAR_CONTRACT_ID } from '../../../../../services/wrap-near';
import { SWAP_MODE, SWAP_MODE_KEY, SWAP_TYPE_KEY } from '../../../../SwapPage';

function MoreRouteBox(props: Modal.Props) {
  const isMobile = useClientMobile();

  const {
    symbol: rawSymbol,
    tokenInfo,
    allTickersPerp,
    allTickers,
    markPrices,
    symbolType,
  } = useOrderlyContext();

  const { symbolFrom, symbolTo } = parseSymbol(rawSymbol);

  const symbol =
    symbolType === 'PERP' ? rawSymbol : `PERP_${symbolFrom}_${symbolTo}`;

  const spotSymbol = `SPOT_${
    symbolFrom === 'BTC' ? 'WBTC' : symbolFrom
  }_${symbolTo}`;

  const PerpTicker = allTickersPerp?.find((item) => item.symbol === symbol);

  const SpotTicker = allTickers?.find((item) => item.symbol === spotSymbol);

  const PerpPrice = PerpTicker?.close;

  const SPotPrice = SpotTicker?.close;

  const { disPlayDiff: DiffSpotRaw, diff: diffSpot } =
    tickerToDisplayDiff(SpotTicker);

  const displayDiffSpot = (
    <span
      className={`${
        diffSpot < 0
          ? 'text-sellRed bg-sellRed'
          : diffSpot > 0
          ? 'text-buyGreen bg-buyGreen'
          : 'text-white'
      } bg-opacity-10 text-xs flex items-center  rounded-md ml-2 px-1 py-0.5`}
    >
      {' '}
      <span className="relative ">
        {diffSpot > 0 ? (
          <IoArrowUpOutline />
        ) : diffSpot < 0 ? (
          <IoArrowDownOutline />
        ) : null}
      </span>
      <span>{DiffSpotRaw}%</span>
    </span>
  );

  const { disPlayDiff: DiffPerpRaw, diff: diffPerp } =
    tickerToDisplayDiff(PerpTicker);

  const displayDiffPerp = (
    <span
      className={`${
        diffPerp < 0
          ? 'text-sellRed bg-sellRed'
          : diffPerp > 0
          ? 'text-buyGreen bg-buyGreen'
          : 'text-white'
      } bg-opacity-10 text-xs flex items-center  rounded-md ml-2 px-1 py-0.5`}
    >
      {' '}
      <span className="relative ">
        {diffPerp > 0 ? (
          <IoArrowUpOutline />
        ) : diffPerp < 0 ? (
          <IoArrowDownOutline />
        ) : null}
      </span>
      <span>{DiffPerpRaw}%</span>
    </span>
  );

  const symbolFromMemo = useMemo(() => {
    return symbolFrom;
  }, [symbolFrom.toString()]);

  const symbolToMemo = useMemo(() => {
    return symbolTo;
  }, [symbolTo.toString()]);

  const tokenInfoMemo = useMemo(() => tokenInfo, [JSON.stringify(tokenInfo)]);

  const tokenIn = useTokenMetaFromSymbol(symbolFromMemo, tokenInfoMemo);

  const tokenOut = useTokenMetaFromSymbol(symbolToMemo, tokenInfoMemo);

  const refDiff = useTokenRate24h({
    base_token: tokenOut,
    token: {
      ...tokenIn,
      id:
        tokenIn?.id?.toLowerCase() === 'near'
          ? WRAP_NEAR_CONTRACT_ID
          : tokenIn?.id,
    },
  });

  const [hoverRoute, sethoverRoute] = useState<'ref' | 'spot' | 'perp'>();

  const displayRefPrice = refDiff?.curPrice || '-';

  const displayRefDiff = !refDiff ? (
    '-'
  ) : (
    <span
      className={`${
        refDiff.direction === 'down'
          ? 'text-sellRed bg-sellRed'
          : refDiff.direction === 'up'
          ? 'text-buyGreen bg-buyGreen'
          : 'text-white'
      } bg-opacity-10 text-xs flex items-center  rounded-md ml-2 px-1 py-0.5`}
    >
      {' '}
      <span className="relative ">
        {refDiff.direction === 'up' ? (
          <IoArrowUpOutline />
        ) : refDiff.direction === 'down' ? (
          <IoArrowDownOutline />
        ) : null}
      </span>
      <span>{refDiff.percent}</span>
    </span>
  );

  const loading =
    // RefSwapRes.quoteDone === false ||
    !markPrices || !allTickers || !allTickersPerp;

  return (
    <Modal
      {...props}
      style={{
        content: {
          transform: isMobile ? '' : 'translate(-50%, -65%)',
        },
      }}
    >
      <div
        className={`${
          isMobile ? '' : 'border border-assetsBorder'
        } rounded-2xl xs:rounded-none xs:rounded-t-2xl pb-6 relative  lg:overflow-hidden xs:pb-8 xs:w-screen xs:fixed xs:bottom-0  bg-boxBorder text-sm text-primaryOrderly border xs:border-none `}
        style={{
          height: isMobile ? '' : '424px',
          width: '404px',
        }}
      >
        <div className=" frcb py-5 px-6 ">
          <div className="text-white font-gothamBold">
            <FormattedMessage
              id="more_trading_price"
              defaultMessage={'More Trading Price'}
            />
          </div>

          <span
            className="cursor-pointer  "
            onClick={(e) => {
              props.onRequestClose && props.onRequestClose(e);
            }}
          >
            <IoClose size={22} />
          </span>
        </div>

        {!loading && (
          <div className="flex flex-col text-white px-6  gap-3">
            <div
              className={`w-full py-3 cursor-pointer ${
                hoverRoute === 'ref'
                  ? 'border border-gradientFromHover bg-inputV3BorderColor'
                  : 'bg-one_level_menu_color border border-opacity-0 '
              } rounded-xl flex flex-col px-4`}
              onMouseEnter={() => {
                sethoverRoute('ref');
              }}
              onMouseLeave={() => {
                sethoverRoute(undefined);
              }}
              onClick={() => {
                sessionStorage.setItem(SWAP_TYPE_KEY, 'Lite');

                localStorage.setItem(SWAP_MODE_KEY, 'normal');

                openUrl(`/swap/#${tokenIn.id}|${tokenOut.id}`);
              }}
            >
              <div className="frcb ">
                <span className="text-sm frcs gap-1">
                  <PerpSwapIcon></PerpSwapIcon>
                  <FormattedMessage
                    id="swap"
                    defaultMessage={'Swap'}
                  ></FormattedMessage>
                </span>
                <div className="cursor-pointer">
                  {hoverRoute === 'ref' && (
                    <BsArrowRight
                      strokeWidth={1}
                      className="text-gradientFromHover"
                    ></BsArrowRight>
                  )}
                </div>
              </div>

              <div className="frcb pt-3 text-white">
                <span className="frcs">
                  <span className="text-white text-sm ">{symbolFrom}</span>
                  <span className="text-primaryText text-xs">/{symbolTo}</span>
                </span>

                <span>${displayRefPrice}</span>
              </div>

              <div className="w-full flex justify-end pt-1.5">
                {displayRefDiff}
              </div>
            </div>

            <div
              className={`w-full py-3 cursor-pointer ${
                hoverRoute === 'spot'
                  ? 'border border-gradientFromHover bg-inputV3BorderColor'
                  : 'bg-one_level_menu_color border border-opacity-0 cursor-pointer'
              } rounded-xl flex flex-col px-4`}
              onMouseEnter={() => {
                sethoverRoute('spot');
              }}
              onMouseLeave={() => {
                sethoverRoute(undefined);
              }}
              onClick={(e: any) => {
                if (symbolType === 'SPOT') {
                  props.onRequestClose && props.onRequestClose(e);
                } else {
                  openUrl('/orderbook/spot');
                }
              }}
            >
              <div className="frcb ">
                <span className="text-sm frcb gap-1">
                  <PerpSpotIcon></PerpSpotIcon>
                  <FormattedMessage
                    id="spot"
                    defaultMessage={'Spot'}
                  ></FormattedMessage>
                </span>
                <div className="cursor-pointer">
                  <div className="cursor-pointer">
                    {hoverRoute === 'spot' && (
                      <BsArrowRight
                        strokeWidth={1}
                        className="text-gradientFromHover"
                      ></BsArrowRight>
                    )}
                  </div>
                </div>
              </div>

              <div className="frcb pt-3 text-white">
                <span className="frcs">
                  <span className="text-white text-sm ">{symbolFrom}</span>
                  <span className="text-primaryText text-xs">/{symbolTo}</span>
                </span>

                <span>${SPotPrice}</span>
              </div>

              <div className="w-full flex justify-end pt-1.5">
                {displayDiffSpot}
              </div>
            </div>

            <div
              className={`w-full py-3 cursor-pointer ${
                hoverRoute === 'perp'
                  ? 'border border-gradientFromHover bg-inputV3BorderColor'
                  : 'bg-one_level_menu_color border border-opacity-0 cursor-pointer'
              } rounded-xl flex flex-col px-4`}
              onMouseEnter={() => {
                sethoverRoute('perp');
              }}
              onMouseLeave={() => {
                sethoverRoute(undefined);
              }}
              onClick={(e) => {
                if (symbolType === 'PERP') {
                  props.onRequestClose && props.onRequestClose(e);
                } else {
                  openUrl('/orderbook/perps');
                }
              }}
            >
              <div className="frcb ">
                <span className="text-sm gap-1 frcs">
                  <PerpPerpIcon></PerpPerpIcon>
                  <FormattedMessage
                    id="perpetual"
                    defaultMessage={'Perpetual'}
                  ></FormattedMessage>
                </span>
                {hoverRoute === 'perp' && (
                  <BsArrowRight
                    strokeWidth={1}
                    className="text-gradientFromHover"
                  ></BsArrowRight>
                )}
              </div>

              <div className="frcb pt-3 text-white">
                <span className="frcs">
                  <span className="text-white text-sm mr-1">{symbolFrom}</span>
                  <span className="text-sm">PERP</span>
                </span>

                <span>${PerpPrice}</span>
              </div>

              <div className="w-full  pt-1.5 frcb text-primaryText">
                <span>
                  <FormattedMessage
                    id="usdc_margined"
                    defaultMessage={'USDC.e margined'}
                  ></FormattedMessage>
                </span>
                {displayDiffPerp}
              </div>
            </div>
          </div>
        )}

        {loading && <OrderlyLoading></OrderlyLoading>}
      </div>
    </Modal>
  );
}

export function MoreRouterButton() {
  const [showRouter, setShowRouter] = useState<boolean>(false);

  return (
    <>
      <button
        style={{
          height: '14px',
          width: '14px',
          background: 'rgb(37,49,56)',
        }}
        onClick={() => {
          setShowRouter(true);
        }}
        className="frcc rounded text-primaryText text-sm "
      >
        <span>···</span>
      </button>
      {showRouter && (
        <MoreRouteBox
          isOpen={showRouter}
          onRequestClose={() => {
            setShowRouter(false);
          }}
        />
      )}
    </>
  );
}

export function MoBileMoreRouterButton() {
  const [showRouter, setShowRouter] = useState<boolean>(false);

  return (
    <>
      <button
        onClick={() => {
          setShowRouter(true);
        }}
        className="frcc rounded text-primaryText text-sm "
      >
        <MobileMoreRouteIcon></MobileMoreRouteIcon>
      </button>
      {showRouter && (
        <MoreRouteBox
          isOpen={showRouter}
          onRequestClose={() => {
            setShowRouter(false);
          }}
        />
      )}
    </>
  );
}
