import React, { createContext, useContext, useEffect, useState } from 'react';
import SwapCard from '../components/swap/SwapCard';

import Loading from '../components/layout/Loading';
import { IProTab } from '../components/swap/SwapProTab';
import {
  useTriTokens,
  useWhitelistTokens,
  useGlobalWhitelistTokens,
} from '../state/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { useTriTokenIdsOnRef } from '../services/aurora/aurora';
import { TokenMetadata, ftGetBalance } from '../services/ft-contract';

import {
  nearMetadata,
  WRAP_NEAR_CONTRACT_ID,
  wnearMetadata,
} from '../services/wrap-near';

import AdSwiper from '../components/layout/Swiper';
import LimitOrderCard from '../components/swap/LimitOrderCard';
import SwapRateChart from '../components/swap/SwapRateChart';
import SwapLimitOrderChart from '../components/swap/SwapLimitOrderChart';
import { EstimateSwapView } from '../services/swap';
import { TradeRoute } from '../components/layout/SwapRoutes';
import { MarketList } from '../components/layout/SwapRoutes';
import MyOrderComponent from './Orderly/components/MyOrder';
import { useWalletSelector } from '../context/WalletSelectorContext';
import { useClientMobile } from '../utils/device';
import { useDclPoolIdByCondition } from '../state/swapV3';
import { useUserBlackAssetStore } from '../stores/userBlackAsset';
import getConfig from '../services/config';
import BLACKTip from '../components/pool/BLACKTip';
import OrderlyAirDropPop from '../components/orderlyAirdrop/index';
import OrderlyAirDropPopMobile from '../components/orderlyAirdropMobile/index';
import { useOrderlyGuidePopStore } from '../stores/orderlyGuidePop';
import { isMobile } from 'src/utils/device';
import { IEstimateSwapServerView } from '~src/services/smartRouterFromServer';

export const SWAP_MODE_KEY = 'SWAP_MODE_VALUE';

export const SWAP_TYPE_KEY = 'SWAP_TYPE_VALUE';

export const SWAP_ENABLE_TRI = 'SWAP_ENABLE_TRI_VALUE';

const originalSetItem = sessionStorage.setItem;
sessionStorage.setItem = function (key, newValue) {
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

export type SwapContractType =
  | 'Ref_Classic'
  | 'Ref_DCL'
  | 'Orderly'
  | 'Trisolaris';

export interface ExchangeEstimate {
  estimates?: EstimateSwapView[];
  estimatesServer?: IEstimateSwapServerView;
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
  maker_fee?: number;
  taker_fee?: number;
  exchange_name?: JSX.Element;
  hasTriPool?: boolean;
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
  forceEstimatePro?: boolean;
  setForceEstimatePro?: (e?: boolean) => void;
  proTab?: IProTab;
  setProTab?: Function;
  dcl_pool_id?: string;
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
            changeSwapType(SWAP_TYPE.LITE);
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
                key={type}
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
  const orderlyGuidePopStore: any = useOrderlyGuidePopStore();

  const [tokenInAmount, setTokenInAmount] = useState<string>('1');
  const [tokenInAmountInput, setTokenInAmountInput] = useState<string>('1');

  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();

  const [trades, setTrades] = useState<TradeEstimates>();
  const [blackTokensHasBalance, setBlackTokensHasBalance] =
    useState<boolean>(false);

  const [enableTri, setEnableTri] = useState<boolean>(
    sessionStorage.getItem(SWAP_ENABLE_TRI) === 'true' || false
  );

  const storedType =
    (sessionStorage.getItem(SWAP_TYPE_KEY) as SWAP_TYPE) || null;

  const [selectMarket, setSelectMarket] = useState<SwapMarket>(undefined);

  const [swapType, setSwapType] = useState<SWAP_TYPE>(
    storedType || SWAP_TYPE.LITE
  );

  const [forceEstimatePro, setForceEstimatePro] = useState<boolean>(false);
  const [proTab, setProTab] = useState<IProTab>('PRICE');
  const { BLACK_TOKEN_LIST } = getConfig();
  const changeSwapType = (type: SWAP_TYPE) => {
    setSwapType(type);
    sessionStorage.setItem(SWAP_TYPE_KEY, type);
    setForceEstimatePro(true);
  };
  const userBlackAssetStore: any = useUserBlackAssetStore();
  useEffect(() => {
    get_black_tokens_balances(BLACK_TOKEN_LIST);
  }, []);
  useEffect(() => {
    const changeWindowCommonMenuCollapsed = (e: any) => {
      if (e?.[SWAP_TYPE_KEY]) {
        setSwapType(e?.[SWAP_TYPE_KEY]);
      }
    };

    window.addEventListener('setItemEvent', changeWindowCommonMenuCollapsed);
    return () => {
      window.removeEventListener(
        'setItemEvent',
        changeWindowCommonMenuCollapsed
      );
    };
  }, []);
  useEffect(() => {
    if (BLACK_TOKEN_LIST.includes(tokenOut?.id) || blackTokensHasBalance) {
      userBlackAssetStore.setHasBlackAsset(true);
    } else {
      userBlackAssetStore.setHasBlackAsset(false);
    }
  }, [tokenOut, blackTokensHasBalance]);
  async function get_black_tokens_balances(tokenIds: string[]) {
    if (tokenIds.length) {
      const res = await Promise.all(tokenIds.map((id) => ftGetBalance(id)));
      setBlackTokensHasBalance(!!res.find((b) => +b > 0));
    }
  }
  const changeEnableTri = (e: boolean) => {
    setEnableTri(e);
    sessionStorage.setItem(SWAP_ENABLE_TRI, e.toString());
  };

  const triTokenIds = useTriTokenIdsOnRef();

  const refTokens = useWhitelistTokens((triTokenIds || []).concat(['aurora']));

  const triTokens = useTriTokens();

  const [limitTokenTrigger, setLimitTokenTrigger] = useState<boolean>();

  const storageMode = localStorage.getItem(SWAP_MODE_KEY) as SWAP_MODE | null;

  const { accountId } = useWalletSelector();

  const isMobile = useClientMobile();

  const isSignedIn = accountId;

  const globalWhiteListTokens = useGlobalWhitelistTokens();

  const [swapMode, setSwapMode] = useState<SWAP_MODE>(
    storageMode || SWAP_MODE.NORMAL
  );
  const dcl_pool_id = useDclPoolIdByCondition('all');
  useEffect(() => {
    if (swapMode === SWAP_MODE.LIMIT) {
      setLimitTokenTrigger(!limitTokenTrigger ? true : false);
      changeSwapType(SWAP_TYPE.Pro);
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
      token.name = 'Near';
      wnearToken = JSON.parse(JSON.stringify(token));
      wnearToken.icon = wnearMetadata.icon;
      wnearToken.symbol = wnearMetadata.symbol;
      wnearToken.name = 'Wrapped NEAR fungible token';
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
    <>
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
          forceEstimatePro,
          setForceEstimatePro,
          proTab,
          setProTab,
          dcl_pool_id,
        }}
      >
        <div className="frsc xsm:flex   xsm:flex-col-reverse">
          {swapType === SWAP_TYPE.Pro && (
            <div
              className="lg:w-full  mr-8 xsm:w-95vw xsm:mx-auto xsm:overflow-x-hidden"
              style={{
                maxWidth: '850px',
              }}
            >
              {(swapMode === SWAP_MODE.NORMAL ||
                (SWAP_MODE.LIMIT && dcl_pool_id && proTab == 'PRICE')) && (
                <SwapRateChart tokenIn={tokenIn} tokenOut={tokenOut} />
              )}
              {dcl_pool_id &&
                proTab == 'ORDER' &&
                swapMode === SWAP_MODE.LIMIT && (
                  <SwapLimitOrderChart></SwapLimitOrderChart>
                )}
              {swapMode === SWAP_MODE.NORMAL ? (
                <>
                  <div
                    className="text-primaryText xsm:text-white xsm:text-base mt-8 mb-4 font-gothamBold"
                    id="swap_pro_trade_route"
                  >
                    <FormattedMessage
                      id="your_trade_route"
                      defaultMessage={`Your trade route`}
                    />
                  </div>

                  <TradeRoute
                    trade={trades?.[selectMarket]}
                    tokenIn={tokenIn}
                    tokenOut={tokenOut}
                  />
                </>
              ) : (
                <div
                  className="lg:bg-portfolioBgColor  my-5 py-2 xsm:px-0 px-4 rounded-xl text-v3SwapGray xsm:text-limitOrderInputColor"
                  style={{
                    border: isMobile ? '' : '1px solid #00463A',

                    fontSize: '13px',
                  }}
                >
                  <FormattedMessage
                    id="new_swap_order_tip"
                    defaultMessage={
                      'The price is from the Ref AMM offer and for reference only. There is no guarente that your limit order will be immediately filled. '
                    }
                  />
                </div>
              )}

              {swapMode === SWAP_MODE.NORMAL &&
                trades &&
                trades?.[selectMarket] && (
                  <MarketList
                    trade={trades[selectMarket]}
                    allTrades={trades}
                    selectMarket={selectMarket}
                    tokenIn={tokenIn}
                    tokenOut={tokenOut}
                  />
                )}

              {isSignedIn && swapMode === SWAP_MODE.LIMIT && (
                <MyOrderComponent />
              )}
            </div>
          )}
          {isMobile && swapMode === SWAP_MODE.NORMAL && (
            <div className="lg:w-480px xsm:mx-3  m-auto relative text-white mt-5">
              <BLACKTip show={userBlackAssetStore.getHasBlackAsset()} />
            </div>
          )}
          <div className="swapContainer xsm:w-95vw xsm:mx-auto">
            <section className={`lg:w-480px  relative`}>
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
                  tokenInAmountInput={tokenInAmountInput}
                  setTokenInAmountInput={setTokenInAmountInput}
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
            {!isMobile && (
              <div className="lg:w-480px  text-white mt-5">
                <AdSwiper />
              </div>
            )}
            {!isMobile && swapMode === SWAP_MODE.NORMAL && (
              <div className="lg:w-480px  text-white mt-5">
                <BLACKTip show={userBlackAssetStore.getHasBlackAsset()} />
              </div>
            )}
          </div>
        </div>

        {isMobile && (
          <div className="lg:w-480px xsm:mx-3  m-auto relative text-white mt-5">
            <AdSwiper />
          </div>
        )}
      </SwapProContext.Provider>
    </>
  );
}

export default SwapPage;
