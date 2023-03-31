import React, { useContext, useEffect, useState } from 'react';
import SwapCard from '../components/swap/SwapCard';
import CrossSwapCard from '../components/swap/CrossSwapCard';

import Loading from '../components/layout/Loading';
import {
  useTriTokens,
  useWhitelistTokens,
  useGlobalWhitelistTokens,
} from '../state/token';
import { WalletContext } from '../utils/wallets-integration';
import { FormattedMessage, useIntl } from 'react-intl';
import { SwapCross } from '../components/icon/CrossSwapIcons';
import { useTriTokenIdsOnRef } from '../services/aurora/aurora';
import { TokenMetadata, ftGetTokenMetadata } from '../services/ft-contract';

import { useAllStablePools } from '../state/pool';
import { NewPro } from '../components/icon';
import { useHistory } from 'react-router-dom';
import TokenReserves from '../components/stableswap/TokenReserves';
import {
  AllStableTokenIds,
  isStableToken,
  STABLE_POOL_TYPE,
} from '../services/near';
import { useClientMobile, isMobileExplorer } from '../utils/device';
import { Pool, getStablePoolFromCache } from '../services/pool';
import getConfig from '../services/config';
import { extraStableTokenIds } from '../services/near';
import { CrossChainPop } from '../components/icon/swapV3';
import {
  nearMetadata,
  WRAP_NEAR_CONTRACT_ID,
  wnearMetadata,
} from '../services/wrap-near';
import { SnowBar, XmasGift, XmasSmallTree } from '../components/icon/Common';
import { useXmasActivity } from '../context/XmasActivity';
import AdSwiper from '../components/layout/Swiper';

export const SWAP_MODE_KEY = 'SWAP_MODE_VALUE';

const originalSetItem = localStorage.setItem;
localStorage.setItem = function (key, newValue) {
  const setItemEvent = new Event('setItemEvent');
  setItemEvent[key] = newValue;
  window.dispatchEvent(setItemEvent);
  originalSetItem.apply(this, [key, newValue]);
};

export enum SWAP_MODE {
  NORMAL = 'normal',
  STABLE = 'stable',
  LIMIT = 'limit',
  X_SWAP = 'xSwap',
}

export const REF_FI_SWAP_SWAPPAGE_TAB_KEY = 'REF_FI_SWAP_SWAPPAGE_TAB_VALUE';

const ChangeSwapMode = ({
  swapMode,
  setSwapMode,
  setLimitTokenTrigger,
  limitTokenTrigger,
}: {
  swapMode: SWAP_MODE;
  setSwapMode: (e?: any) => void;
  setLimitTokenTrigger: (e?: boolean) => void;
  limitTokenTrigger: boolean;
}) => {
  const [hoverXswap, setHoverXswap] = useState(false);

  const isMobile = useClientMobile();

  return (
    <div className="rounded-2xl font-bold xs:relative xs:top-1  w-full text-limitOrderInputColor text-sm flex py-2 xs:pt-0 xs:pb-2 items-start mx-auto  ">
      <span
        className={`mr-6 xs:mr-2 gotham_bold text-center px-2.5  xsm:px-2 py-1.5 rounded-xl lg:hover:text-gradientFrom  lg:hover:bg-opacity-10  flex flex-col cursor-pointer whitespace-nowrap ${
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
        {/* <FormattedMessage id="swap" defaultMessage="Swap" /> */}
        Swap
      </span>

      <span
        className={`mr-3 xs:mr-1.5 gotham_bold  relative text-center px-2.5 xsm:px-2 py-1.5  rounded-xl lg:hover:text-gradientFrom  lg:hover:bg-opacity-10 flex flex-col cursor-pointer whitespace-nowrap ${
          swapMode === SWAP_MODE.X_SWAP ? ' text-white ' : ''
        }`}
        onClick={() => {
          setSwapMode(SWAP_MODE.X_SWAP);
          localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.X_SWAP);
        }}
        onMouseEnter={() => {
          setHoverXswap(true);
        }}
        onMouseLeave={() => {
          setHoverXswap(false);
        }}
        style={{
          fontSize: '15px',
        }}
      >
        {/* <FormattedMessage id="xSwap" defaultMessage="XSwap" /> */}
        XSwap
        {(isMobile ? false : hoverXswap) && (
          <div
            className="absolute z-50"
            style={{
              bottom: '40px',
              right: isMobile ? '-36px' : '-60px',
            }}
          >
            <span className="text-sm whitespace-nowrap text-white right-4 top-1.5 w-36 absolute z-40">
              {/* <FormattedMessage
                id="cross_chain_swap"
                defaultMessage={'Cross-chain Swap'}
              /> */}
              Cross-chain Swap
            </span>

            <CrossChainPop />
          </div>
        )}
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

  const triTokenIds = useTriTokenIdsOnRef();

  const isMobile = useClientMobile();

  const refTokens = useWhitelistTokens((triTokenIds || []).concat(['aurora']));

  const triTokens = useTriTokens();

  const [limitTokenTrigger, setLimitTokenTrigger] = useState<boolean>();

  const storageTab = localStorage
    .getItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY)
    ?.toString();

  const [swapTab, setSwapTab] = useState<string>(storageTab || 'normal');

  const storageMode = localStorage.getItem(SWAP_MODE_KEY) as SWAP_MODE | null;

  const globalWhiteListTokens = useGlobalWhitelistTokens();

  const [swapMode, setSwapMode] = useState<SWAP_MODE>(
    storageMode || SWAP_MODE.NORMAL
  );

  const history = useHistory();

  useEffect(() => {
    if (swapMode === SWAP_MODE.LIMIT) {
      setLimitTokenTrigger(!limitTokenTrigger ? true : false);
    }
  }, [swapMode]);

  const stablePools = useAllStablePools();

  useEffect(() => {
    if (storageTab) setSwapTab(storageTab);
  }, [storageTab]);

  useEffect(() => {
    if (storageMode) setSwapMode(storageMode);
  }, [storageMode]);

  const reserveTypeStorageKey = 'REF_FI_RESERVE_TYPE';

  const [reservesType, setReservesType] = useState<STABLE_POOL_TYPE>(
    STABLE_POOL_TYPE[localStorage.getItem(reserveTypeStorageKey)] ||
      STABLE_POOL_TYPE.USD
  );

  const { setXmasModalOpen, xmasModalOpen } = useXmasActivity();

  if (
    !refTokens ||
    !triTokens ||
    !triTokenIds ||
    !stablePools ||
    !globalWhiteListTokens
  )
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

  const nearSwapTokens = allTokens.filter((token) => token.onRef);

  // asset to ref
  const crossSwapTokens = allTokens.filter(
    (token) => token.onTri || token.onRef
  );

  return (
    <div className="swap">
      <section
        className={`lg:w-480px xsm:mx-3  m-auto relative  ${
          isMobile ? '' : 'gradientBorderWrapper'
        } `}
      >
        {swapMode === SWAP_MODE.X_SWAP ? (
          <CrossSwapCard
            allTokens={crossSwapTokens}
            tokenInAmount={tokenInAmount}
            setTokenInAmount={setTokenInAmount}
            swapTab={
              <ChangeSwapMode
                swapMode={swapMode}
                setSwapMode={setSwapMode}
                setLimitTokenTrigger={setLimitTokenTrigger}
                limitTokenTrigger={limitTokenTrigger}
              />
            }
            globalWhiteListTokens={globalWhiteListTokens}
            limitTokenTrigger={limitTokenTrigger}
          />
        ) : (
          <SwapCard
            allTokens={nearSwapTokens}
            swapMode={swapMode}
            stablePools={stablePools}
            tokenInAmount={tokenInAmount}
            setTokenInAmount={setTokenInAmount}
            reservesType={reservesType}
            setReservesType={setReservesType}
            limitTokenTrigger={limitTokenTrigger}
            swapTab={
              <ChangeSwapMode
                setLimitTokenTrigger={setLimitTokenTrigger}
                limitTokenTrigger={limitTokenTrigger}
                swapMode={swapMode}
                setSwapMode={setSwapMode}
              />
            }
            stableReserves={
              swapMode === SWAP_MODE.STABLE ? (
                <TokenReserves
                  tokens={AllStableTokenIds.map((id) =>
                    allTokens.find((token) => token.id === id)
                  ).filter((token) => isStableToken(token.id))}
                  pools={stablePools}
                  type={reservesType}
                  setType={setReservesType}
                  swapPage
                />
              ) : null
            }
            globalWhiteListTokens={globalWhiteListTokens}
          />
        )}
      </section>
      <div className="lg:w-480px xsm:mx-3  m-auto relative text-white mt-5">
        <AdSwiper></AdSwiper>
      </div>
    </div>
  );
}

export default SwapPage;
