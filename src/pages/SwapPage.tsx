import React, { useContext, useEffect, useState } from 'react';
import SwapCard from '../components/swap/SwapCard';
import CrossSwapCard from '../components/swap/CrossSwapCard';

import Loading from '../components/layout/Loading';
import {
  useTriTokens,
  useWhitelistTokens,
  useGlobalWhitelistTokens,
} from '../state/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { useTriTokenIdsOnRef } from '../services/aurora/aurora';
import { TokenMetadata, ftGetTokenMetadata } from '../services/ft-contract';

export const REF_FI_SWAP_SWAPPAGE_TAB_KEY = 'REF_FI_SWAP_SWAPPAGE_TAB_VALUE';

import {
  nearMetadata,
  WRAP_NEAR_CONTRACT_ID,
  wnearMetadata,
} from '../services/wrap-near';

import AdSwiper from '../components/layout/Swiper';
import LimitOrderCard from '~components/swap/LimitOrderCard';

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
  LIMIT = 'limit',
}

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
  return (
    <div className="rounded-2xl font-bold xs:relative xs:top-1  w-full text-limitOrderInputColor text-sm flex py-2 xs:pt-0 xs:pb-2 items-start mx-auto  ">
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

  return (
    <div className="swap">
      <section className={`lg:w-480px xsm:mx-3  m-auto relative  `}>
        {swapMode === SWAP_MODE.NORMAL && (
          <SwapCard
            allTokens={crossSwapTokens}
            swapMode={swapMode}
            tokenInAmount={tokenInAmount}
            setTokenInAmount={setTokenInAmount}
            limitTokenTrigger={limitTokenTrigger}
            swapTab={
              <ChangeSwapMode
                setLimitTokenTrigger={setLimitTokenTrigger}
                limitTokenTrigger={limitTokenTrigger}
                swapMode={swapMode}
                setSwapMode={setSwapMode}
              />
            }
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
            swapTab={
              <ChangeSwapMode
                setLimitTokenTrigger={setLimitTokenTrigger}
                limitTokenTrigger={limitTokenTrigger}
                swapMode={swapMode}
                setSwapMode={setSwapMode}
              />
            }
            globalWhiteListTokens={globalWhiteListTokens}
          />
        )}
      </section>
      <div className="lg:w-480px xsm:mx-3  m-auto relative text-white mt-5">
        <AdSwiper />
      </div>
    </div>
  );
}

export default SwapPage;
