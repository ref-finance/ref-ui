import React, { useContext, useEffect, useState } from 'react';
import SwapCard from '../components/swap/SwapCard';
import CrossSwapCard from '../components/swap/CrossSwapCard';

import Loading from '../components/layout/Loading';
import { useTriTokens, useWhitelistTokens } from '../state/token';
import { WalletContext } from '../utils/sender-wallet';
import { FormattedMessage } from 'react-intl';
import { SwapCross } from '../components/icon/CrossSwapIcons';
import { useTriTokenIdsOnRef } from '../services/aurora/aurora';
import { TokenMetadata, ftGetTokenMetadata } from '../services/ft-contract';

export const REF_FI_SWAP_SWAPPAGE_TAB_KEY = 'REF_FI_SWAP_SWAPPAGE_TAB_VALUE';

import {
  isStableToken,
  STABLE_POOL_ID,
  STABLE_POOL_USN_ID,
} from '../services/near';
import { Pool, getStablePoolFromCache } from '../services/pool';
import getConfig from '../services/config';
import { extraStableTokenIds } from '../services/near';
import { useAllStablePools } from '../state/pool';

const SWAP_MODE_KEY = 'SWAP_MODE_VALUE';

export enum SWAP_MODE {
  NORMAL = 'normal',
  STABLE = 'stable',
}

const ChangeSwapMode = ({
  swapMode,
  setSwapMode,
}: {
  swapMode: SWAP_MODE;
  setSwapMode: (e?: any) => void;
}) => {
  return (
    <div
      className="rounded-2xl bg-cardBg text-primaryText text-lg flex items-center justify-between p-1 w-4/5 xs:w-11/12 mx-auto mr-5 font-normal"
      style={{
        height: '50px',
      }}
    >
      <span
        className={`py-2 w-1/2 text-center cursor-pointer ${
          swapMode === SWAP_MODE.NORMAL
            ? 'bg-tabChosen text-white rounded-xl'
            : ''
        }`}
        onClick={() => {
          setSwapMode(SWAP_MODE.NORMAL);
          localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.NORMAL);
        }}
      >
        <FormattedMessage id="swap" defaultMessage="Swap" />
      </span>
      <span
        className={`py-2 w-1/2 text-center cursor-pointer ${
          swapMode === SWAP_MODE.STABLE
            ? 'bg-tabChosen text-white rounded-xl'
            : ''
        }`}
        onClick={() => {
          setSwapMode(SWAP_MODE.STABLE);
          localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.STABLE);
        }}
      >
        <FormattedMessage id="stable_swap" defaultMessage="StableSwap" />
      </span>
    </div>
  );
};

function SwapTab({
  ifCross,
  setSwapTab,
  swapMode,
  setSwapMode,
}: {
  ifCross: boolean;
  setSwapTab: (tab: string) => void;
  swapMode: SWAP_MODE;
  setSwapMode: (e?: SWAP_MODE) => void;
}) {
  const TabTitle = () => {
    return !ifCross ? (
      <ChangeSwapMode swapMode={swapMode} setSwapMode={setSwapMode} />
    ) : (
      <div
        className="mr-5 bg-cardBg rounded-2xl w-full text-white text-lg flex items-center justify-center"
        style={{
          height: '50px',
        }}
      >
        <div className="py-1">
          <span>
            <FormattedMessage id="swap_pro" defaultMessage="Swap Pro" />
          </span>
          <span
            className="ml-2 px-1 rounded-xl relative text-sm bg-gradientFrom"
            style={{
              color: '#01121d',
              bottom: '2px',
            }}
          >
            <FormattedMessage id="beta" defaultMessage="beta" />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-5 flex items-center justify-between">
      {/* <div
        className="mr-5 bg-cardBg rounded-2xl w-full text-white text-lg flex items-center justify-center"
        style={{
          height: '50px',
        }}
      > */}
      <TabTitle />
      {/* </div> */}

      <div
        className="cursor-pointer"
        onClick={() => {
          if (ifCross) {
            setSwapTab('normal');
            localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'normal');
          } else {
            setSwapTab('cross');
            localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'cross');
          }
        }}
      >
        <SwapCross ifCross={ifCross} />
      </div>
    </div>
  );
}

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

  const [swapTab, setSwapTab] = useState(
    localStorage.getItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY)?.toString() || 'normal'
  );
  const [swapMode, setSwapMode] = useState<SWAP_MODE>(
    (localStorage.getItem(SWAP_MODE_KEY) as SWAP_MODE | null) ||
      SWAP_MODE.NORMAL
  );
  const stablePools = useAllStablePools();

  if (!refTokens || !triTokens || !triTokenIds || !stablePools)
    return <Loading />;

  const allTokens = getAllTokens(refTokens, triTokens);

  const nearSwapTokens = allTokens.filter((token) => token.onRef);

  // asset to ref
  const crossSwapTokens = allTokens.filter(
    (token) => token.onTri || token.onRef
  );

  return (
    <div className="swap">
      <section className="lg:w-560px md:w-5/6 xs:w-full xs:p-2 m-auto relative ">
        <SwapTab
          ifCross={swapTab === 'cross'}
          setSwapTab={setSwapTab}
          swapMode={swapMode}
          setSwapMode={setSwapMode}
        />

        {swapTab === 'cross' ? (
          <CrossSwapCard
            allTokens={crossSwapTokens}
            tokenInAmount={tokenInAmount}
            setTokenInAmount={setTokenInAmount}
          />
        ) : (
          <SwapCard
            allTokens={nearSwapTokens}
            swapMode={swapMode}
            stablePools={stablePools}
            tokenInAmount={tokenInAmount}
            setTokenInAmount={setTokenInAmount}
          />
        )}
      </section>
    </div>
  );
}

export default SwapPage;
