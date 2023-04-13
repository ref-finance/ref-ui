import React, { createContext, useContext, useEffect, useState } from 'react';
import SwapCard from '../components/swap/SwapCard';

import Loading from '../components/layout/Loading';
import {
  useTriTokens,
  useWhitelistTokens,
  useGlobalWhitelistTokens,
} from '../state/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { useTriTokenIdsOnRef } from '../services/aurora/aurora';
import { TokenMetadata } from '../services/ft-contract';

export const REF_FI_SWAP_SWAPPAGE_TAB_KEY = 'REF_FI_SWAP_SWAPPAGE_TAB_VALUE';

import {
  nearMetadata,
  WRAP_NEAR_CONTRACT_ID,
  wnearMetadata,
} from '../services/wrap-near';

import AdSwiper from '../components/layout/Swiper';
import LimitOrderCard from '~components/swap/LimitOrderCard';
import SwapRateChart from '~components/swap/SwapRateChart';
import { EstimateSwapView } from '../services/swap';
import { TradeRoute } from '~components/layout/SwapRoutes';

export const SWAP_MODE_KEY = 'SWAP_MODE_VALUE';

export const SWAP_TYPE_KEY = 'SWAP_TYPE_VALUE';

export const SWAP_ENABLE_TRI = 'SWAP_ENABLE_TRI_VALUE';

const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, newValue) {
  const setItemEvent = new Event('setItemEvent');
  setItemEvent[key] = newValue;
  window.dispatchEvent(setItemEvent);
  originalSetItem.apply(this, [key, newValue]);
};

export enum SWAP_MODE {
  NORMAL = 'normal',
  LIMIT = 'limit',
}

export enum SWAP_TYPE {
  LITE = 'Lite',
  Pro = 'Pro',
}

export type SwapMarket = 'ref' | 'tri' | 'orderly' | undefined;

export type SwapContractType = 'Ref_V1' | 'Ref_DCL' | 'Orderly' | 'Trisolaris';

export interface ExchangeEstimate {
  estimates?: EstimateSwapView[];
  fee?: number;
  priceImpact?: string;
  minAmountOut?: string;
  makeSwap?: () => void;
  quoteDone: boolean;
  canSwap?: boolean;
  tokenOutAmount?: string;
  swapError?: Error;
  availableRoute?: boolean;
  tokenInAmount: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  market: SwapMarket;
}

export interface TradeEstimates {
  [dex: string]: ExchangeEstimate;
}

interface SwapProContextValue {
  trades: TradeEstimates;
  enableTri: boolean;
  selectMarket: SwapMarket;
  setSelectMarket: (e?: SwapMarket) => void;
  setTrades: (e?: TradeEstimates) => void;
  setEnableTri: (e?: boolean) => void;
  swapType: SWAP_TYPE;
  changeSwapType: (e?: SWAP_TYPE) => void;
  swapMode: SWAP_MODE;
}

export const SwapProContext = createContext<SwapProContextValue>(null);

const ChangeSwapMode = ({
  swapMode,
  setSwapMode,
  setLimitTokenTrigger,
  limitTokenTrigger,
  swapType,
  changeSwapType,
}: {
  swapMode: SWAP_MODE;
  swapType: SWAP_TYPE;
  changeSwapType: (e?: SWAP_TYPE) => void;
  setSwapMode: (e?: any) => void;
  setLimitTokenTrigger: (e?: boolean) => void;
  limitTokenTrigger: boolean;
}) => {
  return (
    <div className="frcb w-full">
      <div className="rounded-2xl font-bold xs:relative xs:top-1  w-full text-limitOrderInputColor   text-sm flex py-2 xs:pt-0 xs:pb-2 items-start mx-auto  ">
        <span
          className={`mr-3 xs:mr-2 gotham_bold text-center px-2.5  xsm:px-2 py-1.5 rounded-xl lg:hover:text-gradientFrom  lg:hover:bg-opacity-10  flex flex-col cursor-pointer whitespace-nowrap ${
            swapMode === SWAP_MODE.NORMAL ? ' text-white  ' : ''
          }`}
          style={{
            fontSize: '15px',
          }}
          onClick={() => {
            setSwapMode(SWAP_MODE.NORMAL);
            localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.NORMAL);
          }}
        >
          Swap
        </span>

        <div
          className="w-0.5 xs:relative mt-1.5 "
          style={{
            borderRight: '1.2px solid rgba(145, 162, 174, 0.2)',
            height: '20px',
          }}
        ></div>

        <span
          className={`ml-3 xs:ml-1.5 gotham_bold flex flex-col px-2.5 py-1.5 xsm:px-2  rounded-xl lg:hover:text-gradientFrom  lg:hover:bg-opacity-10 text-center cursor-pointer whitespace-nowrap ${
            swapMode === SWAP_MODE.LIMIT ? ' text-white ' : ''
          }`}
          onClick={() => {
            setSwapMode(SWAP_MODE.LIMIT);
            localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.LIMIT);
            setLimitTokenTrigger(!limitTokenTrigger ? true : false);
          }}
          style={{
            fontSize: '15px',
          }}
        >
          <FormattedMessage id="limit_order" defaultMessage="Limit Order" />
        </span>
      </div>

      {swapMode === SWAP_MODE.NORMAL && (
        <div className="frcs border mr-2 text-xs border-limitOrderFeeTiersBorderColor rounded-lg p-0.5">
          {['Lite', 'Pro'].map((type) => {
            return (
              <div
                style={{
                  background: type === swapType.toString() ? '#324451' : '',
                }}
                className={`rounded-md cursor-pointer px-1.5 py-0.5 ${
                  type === swapType.toString()
                    ? 'text-white '
                    : 'text-primaryText'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  changeSwapType(type as SWAP_TYPE);
                }}
              >
                {type}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function getAllTokens(refTokens: TokenMetadata[], triTokens: TokenMetadata[]) {
  triTokens.forEach((tk) => {
    const tokenInRef = refTokens.find((token) => token.id === tk.id);
    if (tokenInRef) {
      tokenInRef.onTri = true;
    } else {
      refTokens.push(tk);
    }
  });

  return refTokens;
}

function SwapPage() {
  const [tokenInAmount, setTokenInAmount] = useState<string>('1');
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();

  const [trades, setTrades] = useState<TradeEstimates>();

  const [enableTri, setEnableTri] = useState<boolean>(
    sessionStorage.getItem(SWAP_ENABLE_TRI) === 'true' || false
  );

  const [selectMarket, setSelectMarket] = useState<SwapMarket>(undefined);

  const storedType = sessionStorage.getItem(SWAP_TYPE_KEY) as SWAP_TYPE | null;

  const [swapType, setSwapType] = useState<SWAP_TYPE>(
    storedType || SWAP_TYPE.LITE
  );

  const changeSwapType = (type: SWAP_TYPE) => {
    setSwapType(type);
    sessionStorage.setItem(SWAP_TYPE_KEY, type);
  };

  const changeEnableTri = (e: boolean) => {
    setEnableTri(e);
    sessionStorage.setItem(SWAP_ENABLE_TRI, e.toString());
  };

  const triTokenIds = useTriTokenIdsOnRef();

  const refTokens = useWhitelistTokens((triTokenIds || []).concat(['aurora']));

  const triTokens = useTriTokens();

  const [limitTokenTrigger, setLimitTokenTrigger] = useState<boolean>();

  const storageMode = localStorage.getItem(SWAP_MODE_KEY) as SWAP_MODE | null;

  const globalWhiteListTokens = useGlobalWhitelistTokens();

  const [swapMode, setSwapMode] = useState<SWAP_MODE>(
    storageMode || SWAP_MODE.NORMAL
  );

  useEffect(() => {
    if (swapMode === SWAP_MODE.LIMIT) {
      setLimitTokenTrigger(!limitTokenTrigger ? true : false);
    }
  }, [swapMode]);

  useEffect(() => {
    if (storageMode) setSwapMode(storageMode);
  }, [storageMode]);

  if (!refTokens || !triTokens || !triTokenIds || !globalWhiteListTokens)
    return <Loading />;

  let wnearToken;
  refTokens.forEach((token) => {
    if (token.id === WRAP_NEAR_CONTRACT_ID) {
      token.icon = nearMetadata.icon;
      token.symbol = 'NEAR';
      wnearToken = JSON.parse(JSON.stringify(token));
      wnearToken.icon = wnearMetadata.icon;
      wnearToken.symbol = wnearMetadata.symbol;
    }
  });

  const allTokens = getAllTokens(refTokens, triTokens);
  allTokens.push(wnearToken);

  const crossSwapTokens = allTokens.filter(
    (token) => token.onTri || token.onRef
  );

  const SwapNav = (
    <ChangeSwapMode
      setLimitTokenTrigger={setLimitTokenTrigger}
      limitTokenTrigger={limitTokenTrigger}
      swapMode={swapMode}
      setSwapMode={setSwapMode}
      swapType={swapType}
      changeSwapType={changeSwapType}
    />
  );

  return (
    <SwapProContext.Provider
      value={{
        trades,
        setTrades,
        enableTri,
        setEnableTri: changeEnableTri,
        swapMode,
        changeSwapType,
        swapType,
        selectMarket,
        setSelectMarket,
      }}
    >
      <div className="frsc ">
        {swapType === SWAP_TYPE.Pro && (
          <div className="w-700px mr-8">
            <SwapRateChart tokenIn={tokenIn} tokenOut={tokenOut} />
            <div className="text-primaryText mt-8 mb-4 font-gothamBold">
              <FormattedMessage
                id="your_trade_route"
                defaultMessage={`Your trade route`}
              />
            </div>

            {trades?.[selectMarket] && (
              <TradeRoute trade={trades[selectMarket]} />
            )}
          </div>
        )}

        <div className="swapContainer">
          <section className={`lg:w-480px xsm:mx-3  m-auto relative`}>
            {swapMode === SWAP_MODE.NORMAL && (
              <SwapCard
                allTokens={crossSwapTokens}
                swapMode={swapMode}
                tokenIn={tokenIn}
                setTokenIn={setTokenIn}
                tokenOut={tokenOut}
                setTokenOut={setTokenOut}
                tokenInAmount={tokenInAmount}
                setTokenInAmount={setTokenInAmount}
                swapTab={SwapNav}
                globalWhiteListTokens={globalWhiteListTokens}
              />
            )}
            {swapMode === SWAP_MODE.LIMIT && (
              <LimitOrderCard
                allTokens={crossSwapTokens}
                swapMode={swapMode}
                tokenInAmount={tokenInAmount}
                setTokenInAmount={setTokenInAmount}
                limitTokenTrigger={limitTokenTrigger}
                tokenIn={tokenIn}
                setTokenIn={setTokenIn}
                tokenOut={tokenOut}
                setTokenOut={setTokenOut}
                swapTab={SwapNav}
                globalWhiteListTokens={globalWhiteListTokens}
              />
            )}
          </section>
          <div className="lg:w-p450 xsm:mx-3  m-auto relative text-white mt-5">
            <AdSwiper />
          </div>
        </div>
      </div>
    </SwapProContext.Provider>
  );
}

export default SwapPage;
