import React, { useEffect, useState } from 'react';
import Loading from '../../components/layout/Loading';
import {
  useTokenBalances,
  useWhitelistStableTokens,
  useWhitelistTokens,
} from '../../state/token';
import { usePool, useStablePool } from '../../state/pool';
import TokenReserves from '../../components/stableswap/TokenReserves';
import getConfig from 'src/services/config';
import { useWalletTokenBalances } from '../../state/token';
import { useLocation, useParams } from 'react-router-dom';
import {
  SharesCard,
  StableTokens,
} from '../../components/stableswap/CommonComp';
import {
  BackToStablePoolList,
  Images,
} from '../../components/stableswap/CommonComp';
import { Pool, StablePool, getStablePoolFromCache } from '../../services/pool';
import AddLiquidityComponentUSN from '../../components/stableswap/AddLiquidityUSN';
import { RemoveLiquidityComponentUSN } from '../../components/stableswap/RemoveLiquidityUSN';
import { NEARX_POOL_ID, STABLE_TOKEN_USN_IDS } from '../../services/near';
import { RecentTransactions } from '../pools/DetailsPage';
import { useTokens } from '../../state/token';
export const DEFAULT_ACTIONS = ['add_liquidity', 'remove_liquidity'];

export const getStableSwapTabKey = (id: string | number) =>
  `REF_STABLE_SWAP_TAB_VALUE_${id}`;

interface LocationTypes {
  stableTab?: string;
  shares?: string;
  stakeList?: Record<string, string>;
  farmStake?: string | number;
  pool?: Pool;
}
interface ParamTypes {
  id: string;
}

function StableSwapPageUSN({ pool }: { pool: Pool }) {
  const { state } = useLocation<LocationTypes>();
  const { id } = useParams<ParamTypes>();
  const REF_STABLE_SWAP_TAB_KEY = getStableSwapTabKey(pool.id);
  const stableTab = state?.stableTab;

  const storageTab =
    localStorage.getItem(REF_STABLE_SWAP_TAB_KEY) === 'add_liquidity' ||
    localStorage.getItem(REF_STABLE_SWAP_TAB_KEY) === 'remove_liquidity'
      ? localStorage.getItem(REF_STABLE_SWAP_TAB_KEY)
      : DEFAULT_ACTIONS[0];

  const [actionName, setAction] = useState<string>(
    pool.id == Number(NEARX_POOL_ID)
      ? 'remove_liquidity'
      : stableTab || storageTab
  );

  const { shares } = state?.pool ? state : usePool(id);

  const allTokens = useWhitelistStableTokens();
  const pool_tokens = useTokens(pool?.tokenIds);

  const tokens = allTokens
    ? pool.tokenIds.map((id) => allTokens?.find((token) => token?.id === id))
    : [];

  const nearBalances = useWalletTokenBalances(
    tokens?.map((token) => token.id) || []
  );
  const [stablePool, setStablePool] = useState<StablePool>();

  useEffect(() => {
    getStablePoolFromCache(id.toString()).then((res) => {
      setStablePool(res[1]);
    });
  }, []);

  const changeAction = (actionName: string) => {
    localStorage.setItem(REF_STABLE_SWAP_TAB_KEY, actionName);
    setAction(actionName);
  };

  if (
    !allTokens ||
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
          />
        );
    }
  };

  return (
    <div className="m-auto lg:w-580px md:w-5/6 xs:w-full xs:p-2">
      {<BackToStablePoolList />}
      {<StableTokens tokens={tokens} pool={pool} />}
      {<SharesCard pool={pool} shares={shares} />}
      {renderModule(actionName)}
      {<TokenReserves tokens={tokens} pools={[pool]} forPool hiddenChart />}
      <div className="-mt-7">
        <RecentTransactions
          tokens={pool_tokens}
          pool_id={pool.id}
        ></RecentTransactions>
      </div>
    </div>
  );
}

export default StableSwapPageUSN;
