import React, { useEffect, useState } from 'react';
import Loading from '~components/layout/Loading';
import {
  useTokenBalances,
  useWhitelistStableTokens,
  useWhitelistTokens,
} from '../../state/token';
import { usePool, useStablePool } from '~state/pool';
import TokenReserves from '~components/stableswap/TokenReserves';
import getConfig from '~services/config';
import { useWalletTokenBalances } from '../../state/token';
import { useLocation } from 'react-router-dom';
import {
  SharesCard,
  StableTokens,
} from '../../components/stableswap/CommonComp';
import { useFarmStake } from '../../state/farm';
import {
  BackToStablePoolList,
  Images,
} from '~components/stableswap/CommonComp';
import BigNumber from 'bignumber.js';
import { Pool, StablePool, getStablePoolFromCache } from '../../services/pool';
import AddLiquidityComponentUSN from '../../components/stableswap/AddLiquidityUSN';
import { RemoveLiquidityComponentUSN } from '../../components/stableswap/RemoveLiquidityUSN';
export const DEFAULT_ACTIONS = ['add_liquidity', 'remove_liquidity'];
const STABLE_TOKENS = ['USN', 'USDT'];
const STABLE_POOL_USN_ID = getConfig().STABLE_POOL_USN_ID;
export const REF_STABLE_SWAP_TAB_KEY_USN = 'REF_STABLE_SWAP_TAB_VALUE_USN';

interface LocationTypes {
  stableTab?: string;
  shares?: string;
  stakeList?: Record<string, string>;
  farmStake?: string | number;
  pool?: Pool;
}

function StableSwapPageUSN() {
  const { state } = useLocation<LocationTypes>();

  const stableTab = state?.stableTab;

  const [actionName, setAction] = useState<string>(
    stableTab ||
      localStorage.getItem(REF_STABLE_SWAP_TAB_KEY_USN) ||
      DEFAULT_ACTIONS[0]
  );

  const { pool, shares, stakeList } = state?.pool
    ? state
    : usePool(STABLE_POOL_USN_ID);

  const farmStake =
    state?.farmStake ||
    useFarmStake({
      poolId: Number(STABLE_POOL_USN_ID),
      stakeList,
    });
  const userTotalShare = BigNumber.sum(shares, farmStake);

  const allTokens = useWhitelistStableTokens();
  const tokens =
    allTokens &&
    allTokens.length > 0 &&
    allTokens.filter((item) => STABLE_TOKENS.indexOf(item.symbol) > -1);

  const nearBalances = useWalletTokenBalances(
    tokens?.map((token) => token.id) || []
  );
  const [stablePool, setStablePool] = useState<StablePool>();

  useEffect(() => {
    getStablePoolFromCache(STABLE_POOL_USN_ID.toString()).then((res) => {
      setStablePool(res[1]);
    });
  }, []);

  const changeAction = (actionName: string) => {
    localStorage.setItem(REF_STABLE_SWAP_TAB_KEY_USN, actionName);
    setAction(actionName);
  };

  if (
    !allTokens ||
    !pool ||
    !shares ||
    !stablePool ||
    !Object.entries(nearBalances).length
  )
    return <Loading />;

  const renderModule = (tab: string) => {
    switch (tab) {
      case DEFAULT_ACTIONS[0]:
        return (
          <AddLiquidityComponentUSN
            changeAction={changeAction}
            stablePool={stablePool}
            pool={pool}
            tokens={tokens}
            totalShares={shares}
            stakeList={stakeList}
            balances={nearBalances}
          />
        );
      case DEFAULT_ACTIONS[1]:
        return (
          <RemoveLiquidityComponentUSN
            changeAction={changeAction}
            stablePool={stablePool}
            tokens={tokens}
            shares={shares}
            balances={nearBalances}
            pool={pool}
            stakeList={stakeList}
          />
        );
    }
  };

  return (
    <div className="m-auto lg:w-580px md:w-5/6 xs:w-full xs:p-2">
      {<BackToStablePoolList />}
      {<StableTokens tokens={tokens} />}
      {
        <SharesCard
          shares={shares}
          userTotalShare={userTotalShare}
          stakeList={stakeList}
          pool={pool}
        />
      }
      {renderModule(actionName)}
      {<TokenReserves tokens={tokens} pools={[pool]} forPool hiddenChart />}
    </div>
  );
}

export default StableSwapPageUSN;
