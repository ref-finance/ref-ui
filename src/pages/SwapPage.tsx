import React, { useEffect, useState } from 'react';
import SwapCard from '../components/swap/SwapCard';
import Loading from '../components/layout/Loading';
import { useWhitelistTokens } from '../state/token';
import { FormattedMessage } from 'react-intl';
import {
  isStableToken,
  STABLE_POOL_ID,
  STABLE_POOL_USN_ID,
} from '../services/near';
import { TokenMetadata } from '../services/ft-contract';
import { Pool, getStablePoolFromCache } from '../services/pool';
import getConfig from '../services/config';

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
    <div className="rounded-2xl bg-cardBg text-primaryText text-lg flex items-center justify-between p-1 w-4/5 xs:w-11/12 mx-auto mb-4 font-normal">
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

function SwapPage() {
  const [swapMode, setSwapMode] = useState<SWAP_MODE>(
    (localStorage.getItem(SWAP_MODE_KEY) as SWAP_MODE | null) ||
      SWAP_MODE.NORMAL
  );

  const [stablePools, setStablePools] = useState<Pool[]>();

  useEffect(() => {
    Promise.all([
      getStablePoolFromCache(STABLE_POOL_ID.toString()),
      getStablePoolFromCache(STABLE_POOL_USN_ID.toString()),
    ]).then((rawPoolInfos) => {
      setStablePools(rawPoolInfos.map((PInfo) => PInfo[0]));
    });
  }, []);

  const extraTokens =
    getConfig().networkId === 'mainnet' ? ['usn'] : ['usdn.testnet'];

  const allTokens = useWhitelistTokens(extraTokens);

  if (!allTokens || !stablePools) return <Loading />;

  return (
    <div className="swap">
      <section className="lg:w-560px md:w-5/6 xs:w-full xs:p-2 m-auto relative">
        <ChangeSwapMode swapMode={swapMode} setSwapMode={setSwapMode} />
        <SwapCard
          allTokens={allTokens}
          swapMode={swapMode}
          stablePools={stablePools}
        />
      </section>
    </div>
  );
}

export default SwapPage;
