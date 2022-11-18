import React, { useContext, useEffect, useState } from 'react';
import SwapCard from '../components/swap/SwapCard';
import CrossSwapCard from '../components/swap/CrossSwapCard';

import Loading from '../components/layout/Loading';
import { useTriTokens, useWhitelistTokens } from '../state/token';
import { WalletContext } from '../utils/wallets-integration';
import { FormattedMessage, useIntl } from 'react-intl';
import { SwapCross } from '../components/icon/CrossSwapIcons';
import { useTriTokenIdsOnRef } from '../services/aurora/aurora';
import { TokenMetadata, ftGetTokenMetadata } from '../services/ft-contract';

export const REF_FI_SWAP_SWAPPAGE_TAB_KEY = 'REF_FI_SWAP_SWAPPAGE_TAB_VALUE';

import { useAllStablePools } from '../state/pool';
import { NewPro } from '../components/icon';
import { useHistory } from 'react-router-dom';
import TokenReserves from '../components/stableswap/TokenReserves';
import {
  AllStableTokenIds,
  isStableToken,
  STABLE_POOL_TYPE,
} from '../services/near';
import { useClientMobile } from '../utils/device';
import { Pool, getStablePoolFromCache } from '../services/pool';
import getConfig from '../services/config';
import { extraStableTokenIds } from '../services/near';
import { nearMetadata, WRAP_NEAR_CONTRACT_ID } from '../services/wrap-near';

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
}

const ChangeSwapModeV3 = ({
  swapMode,
  setSwapMode,
}: {
  swapMode: SWAP_MODE;
  setSwapMode: (e?: any) => void;
}) => {
  return (
    <div className="rounded-2xl  xs:hidden w-full text-primaryText text-lg flex items-center mx-auto  font-normal">
      <span
        className={`py-2 mr-10 text-center flex flex-col cursor-pointer ${
          swapMode === SWAP_MODE.NORMAL ? ' text-white ' : ''
        }`}
        onClick={() => {
          setSwapMode(SWAP_MODE.NORMAL);
          localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.NORMAL);
        }}
      >
        <FormattedMessage id="swap" defaultMessage="Swap" />
        {swapMode === SWAP_MODE.NORMAL ? (
          <div className="h-1 rounded-lg mt-1 bg-gradientFromHover"></div>
        ) : (
          <div className="h-1 rounded-lg mt-1 bg-transparent"></div>
        )}
      </span>

      <span
        className={`py-2  flex flex-col text-center cursor-pointer ${
          swapMode === SWAP_MODE.LIMIT ? ' text-white ' : ''
        }`}
        onClick={() => {
          setSwapMode(SWAP_MODE.LIMIT);
          localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.LIMIT);
        }}
      >
        <FormattedMessage id="limit_order" defaultMessage="Limit Order" />

        {swapMode === SWAP_MODE.LIMIT ? (
          <div className="h-1 rounded-lg mt-1 bg-gradientFromHover"></div>
        ) : (
          <div className="h-1 rounded-lg mt-1 bg-transparent"></div>
        )}
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
  const intl = useIntl();

  return (
    <div className=" flex mr-4 xs:hidden items-center justify-between">
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

const MobileSwapTab = ({
  ifCross,
  swapMode,
  setSwapMode,
  setSwapTab,
}: {
  ifCross: boolean;
  swapMode: SWAP_MODE;
  setSwapMode: (e?: any) => void;
  setSwapTab: (tab: string) => void;
}) => {
  return (
    <div className="flex items-center p-0.5 w-11/12 pb-4 mx-auto justify-between">
      <div
        className={`${
          ifCross ? '' : 'hidden'
        } text-lg whitespace-nowrap w-full p-1 rounded-xl text-white flex items-center `}
      >
        <span>
          <FormattedMessage
            id="cross_chain_swap"
            defaultMessage={'Cross-chain Swap'}
          />
        </span>{' '}
        <span
          className=" ml-3 xs:mr-2  xs:relative   h-3 flex items-center text-black bg-farmText rounded-md px-0.5 py-px"
          style={{
            fontSize: '10px',
          }}
        >
          <FormattedMessage id="beta" defaultMessage={'beta'} />
        </span>
      </div>
      <div
        className={`rounded-xl ${
          ifCross ? 'hidden' : ''
        } p-1 w-full text-primaryText text-base flex items-center mx-auto justify-between font-normal`}
        style={{
          backgroundColor: '#1C2A34',
        }}
      >
        <span
          className={`py-1 w-1/2 px-4 whitespace-nowrap text-center cursor-pointer ${
            swapMode === SWAP_MODE.NORMAL ? ' text-white' : ''
          }`}
          style={{
            borderRadius: swapMode === SWAP_MODE.NORMAL ? '10px' : '',
            backgroundColor: swapMode === SWAP_MODE.NORMAL ? '#33424E' : '',
          }}
          onClick={() => {
            setSwapMode(SWAP_MODE.NORMAL);
            localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.NORMAL);
          }}
        >
          <FormattedMessage id="swap" defaultMessage="Swap" />
        </span>

        <span
          className={`py-1 w-1/2 px-3 whitespace-nowrap  text-center cursor-pointer ${
            swapMode === SWAP_MODE.LIMIT ? ' text-white ' : ''
          }`}
          style={{
            borderRadius: swapMode === SWAP_MODE.LIMIT ? '10px' : '',
            backgroundColor: swapMode === SWAP_MODE.LIMIT ? '#33424E' : '',
          }}
          onClick={() => {
            setSwapMode(SWAP_MODE.LIMIT);
            localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.LIMIT);
          }}
        >
          <FormattedMessage id="limit_order" defaultMessage="Limit Order" />
        </span>
      </div>
      <div className=" flex ml-3 items-center justify-between">
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

  refTokens.forEach((token) => {
    if (token.id === WRAP_NEAR_CONTRACT_ID) {
      token.icon = nearMetadata.icon;
      token.symbol = 'NEAR';
    }
  });

  const allTokens = getAllTokens(refTokens, triTokens);

  const nearSwapTokens = allTokens.filter((token) => token.onRef);

  // asset to ref
  const crossSwapTokens = allTokens.filter(
    (token) => token.onTri || token.onRef
  );

  return (
    <div className="swap">
      {!isMobile ? null : (
        <MobileSwapTab
          ifCross={swapTab === 'cross'}
          setSwapTab={setSwapTab}
          swapMode={swapMode}
          setSwapMode={setSwapMode}
        />
      )}

      <section className="lg:w-560px md:w-5/6 xs:w-11/12  m-auto relative gradientBorderWrapper">
        {swapTab === 'cross' ? (
          <CrossSwapCard
            allTokens={crossSwapTokens}
            tokenInAmount={tokenInAmount}
            setTokenInAmount={setTokenInAmount}
            swapTab={<></>}
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
              </>
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
          />
        )}
      </section>
      <div className="flex items-center justify-center mt-4">
        <span className="text-sm text-primaryText mr-1.5">Try out by</span>
        <div
          onClick={() => {
            setSwapTab('cross');
          }}
          className="rounded-md border border-laguageBorderColor text-sm text-primaryText px-1.5 py-1 cursor-pointer"
        >
          Cross-chain Swap
        </div>
      </div>
    </div>
  );
}

export default SwapPage;
