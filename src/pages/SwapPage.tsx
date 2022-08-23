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

import { useAllStablePools } from '../state/pool';
import { NewPro } from '~components/icon';

export const SWAP_MODE_KEY = 'SWAP_MODE_VALUE';

export enum SWAP_MODE {
  NORMAL = 'normal',
  STABLE = 'stable',
  LIMIT = 'limit',
}

const ChangeSwapModeV3 = ({
  swapMode,
  setSwapMode,
}: {
  swapMode: SWAP_MODE;
  setSwapMode: (e?: any) => void;
}) => {
  return (
    <div className="rounded-2xl absolute top-3 left-7  text-primaryText text-lg flex items-center  p-1  mx-auto mr-5 font-normal">
      <span
        className={`py-2 mr-10 text-center cursor-pointer ${
          swapMode === SWAP_MODE.NORMAL ? ' text-white' : ''
        }`}
        onClick={() => {
          setSwapMode(SWAP_MODE.NORMAL);
          localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.NORMAL);
        }}
      >
        <FormattedMessage id="swap" defaultMessage="Swap" />
      </span>
      <span
        className={`py-2  text-center cursor-pointer mr-10 ${
          swapMode === SWAP_MODE.STABLE ? ' text-white ' : ''
        }`}
        onClick={() => {
          setSwapMode(SWAP_MODE.STABLE);
          localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.STABLE);
        }}
      >
        <FormattedMessage id="stable" defaultMessage="Stable" />
      </span>

      <span
        className={`py-2  text-center cursor-pointer ${
          swapMode === SWAP_MODE.LIMIT ? ' text-white ' : ''
        }`}
        onClick={() => {
          setSwapMode(SWAP_MODE.LIMIT);
          localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.LIMIT);
        }}
      >
        <FormattedMessage id="limit" defaultMessage="Limit" />
      </span>
    </div>
  );
};

function SwapTab({
  ifCross,
  setSwapTab,
}: {
  ifCross: boolean;
  setSwapTab: (tab: string) => void;
}) {
  return (
    <div className="mb-5 flex absolute top-6 right-20 items-center justify-between">
      <NewPro
        ifCross={ifCross}
        onClick={() => {
          if (ifCross) {
            setSwapTab('normal');
            localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'normal');
          } else {
            setSwapTab('cross');
            localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'cross');
          }
        }}
      />
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

  const storageTab = localStorage
    .getItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY)
    ?.toString();

  const [swapTab, setSwapTab] = useState<string>(storageTab || 'normal');

  const urlMode = window.location.pathname.split('/')?.[2] as SWAP_MODE | null;

  const storageMode = localStorage.getItem(SWAP_MODE_KEY) as SWAP_MODE | null;

  const [swapMode, setSwapMode] = useState<SWAP_MODE>(
    urlMode || storageMode || SWAP_MODE.NORMAL
  );

  console.log(swapMode, 'swap mode');

  const stablePools = useAllStablePools();

  useEffect(() => {
    if (urlMode) setSwapMode(urlMode);
  }, [urlMode]);

  useEffect(() => {
    if (storageMode) setSwapTab(storageTab);
  }, [storageTab]);

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
        {swapTab === 'cross' ? (
          <CrossSwapCard
            allTokens={crossSwapTokens}
            tokenInAmount={tokenInAmount}
            setTokenInAmount={setTokenInAmount}
            swapTab={
              <>
                <SwapTab
                  ifCross={swapTab === 'cross'}
                  setSwapTab={setSwapTab}
                />
              </>
            }
          />
        ) : (
          <SwapCard
            allTokens={nearSwapTokens}
            swapMode={swapMode}
            stablePools={stablePools}
            tokenInAmount={tokenInAmount}
            setTokenInAmount={setTokenInAmount}
            swapTab={
              <>
                <ChangeSwapModeV3
                  swapMode={swapMode}
                  setSwapMode={setSwapMode}
                />
                <SwapTab
                  ifCross={swapTab === 'cross'}
                  setSwapTab={setSwapTab}
                />
              </>
            }
          />
        )}
      </section>
    </div>
  );
}

export default SwapPage;
