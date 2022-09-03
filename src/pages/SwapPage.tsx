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
import { useHistory } from 'react-router-dom';
import TokenReserves from '~components/stableswap/TokenReserves';
import {
  AllStableTokenIds,
  isStableToken,
  STABLE_TOKEN_USN_IDS,
  STABLE_TOKEN_IDS,
  CUSDIDS,
  BTCIDS,
  BTC_STABLE_POOL_ID,
  STNEAR_POOL_ID,
  LINEAR_POOL_ID,
  NEAX_POOL_ID,
  NEARXIDS,
  LINEARIDS,
  STNEARIDS,
  STABLE_POOL_TYPE,
} from '../services/near';

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
    <div className="rounded-2xl  w-full text-primaryText text-lg flex items-center mx-auto mr-5 font-normal">
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
    <div className=" flex mr-4 items-center justify-between">
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

const MyOrderTab = () => {
  const history = useHistory();

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  return (
    <button
      className={`rounded-xl ${
        !isSignedIn ? 'cursor-not-allowed opacity-30' : ''
      } whitespace-nowrap hover:text-gradientFrom hover:bg-black hover:bg-opacity-20 text-white text-sm border border-primaryText border-opacity-20 h-8 px-2 `}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;

        history.push('/myOrder');
      }}
    >
      <FormattedMessage id="my_orders" defaultMessage={'My Orders'} />
    </button>
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

  const storageTab = localStorage
    .getItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY)
    ?.toString();

  const [swapTab, setSwapTab] = useState<string>(storageTab || 'normal');

  const storageMode = localStorage.getItem(SWAP_MODE_KEY) as SWAP_MODE | null;

  const [swapMode, setSwapMode] = useState<SWAP_MODE>(
    storageMode || SWAP_MODE.NORMAL
  );

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
      <section className="lg:w-560px md:w-5/6 xs:w-full xs:p-2 m-auto relative gradientBorderWrapper">
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
            reservesType={reservesType}
            setReservesType={setReservesType}
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
                {swapMode === SWAP_MODE.LIMIT && <MyOrderTab />}
              </>
            }
            stableReserves={
              swapMode === SWAP_MODE.STABLE ? (
                <TokenReserves
                  tokens={AllStableTokenIds.map((id) =>
                    allTokens.find((token) => token.id === id)
                  )
                    .filter((token) => isStableToken(token.id))
                    .filter((token) => {
                      switch (reservesType) {
                        case 'BTC':
                          return BTCIDS.includes(token.id);
                        case 'USD':
                          return STABLE_TOKEN_IDS.concat(STABLE_TOKEN_USN_IDS)
                            .concat(CUSDIDS)
                            .map((id) => id.toString())
                            .includes(token.id);
                        case 'NEAR':
                          return LINEARIDS.concat(STNEARIDS)
                            .concat(NEARXIDS)
                            .includes(token.id);
                      }
                    })}
                  pools={stablePools.filter((p) => {
                    switch (reservesType) {
                      case 'BTC':
                        return p.id.toString() === BTC_STABLE_POOL_ID;
                      case 'NEAR':
                        return (
                          p.id.toString() === STNEAR_POOL_ID ||
                          p.id.toString() === LINEAR_POOL_ID ||
                          p.id.toString() === NEAX_POOL_ID
                        );
                      case 'USD':
                        return (
                          p.id.toString() !== BTC_STABLE_POOL_ID &&
                          p.id.toString() !== STNEAR_POOL_ID &&
                          p.id.toString() !== LINEAR_POOL_ID &&
                          p.id.toString() !== NEAX_POOL_ID
                        );
                    }
                  })}
                  type={reservesType}
                  setType={setReservesType}
                  swapPage
                />
              ) : null
            }
          />
        )}
      </section>
    </div>
  );
}

export default SwapPage;
