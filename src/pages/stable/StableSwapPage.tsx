import React, { useEffect, useState } from 'react';
import Loading from '../../components/layout/Loading';
import {
  useTokenBalances,
  useWhitelistStableTokens,
  useWhitelistTokens,
} from '../../state/token';
import AddLiquidityComponent from '../../components/stableswap/AddLiquidity';
import { usePool, useStablePool } from '../../state/pool';
import { isMobile } from '~utils/device';
import { RemoveLiquidityComponent } from '../../components/stableswap/RemoveLiquidity';
import TokenReserves from '../../components/stableswap/TokenReserves';

import getConfig from '../../services/config';
import { StableSwapLogo } from '~components/icon/StableSwap';
import { useWalletTokenBalances } from '../../state/token';
import { useLocation, useParams } from 'react-router-dom';
import {
  SharesCard,
  StableTokens,
} from '../../components/stableswap/CommonComp';
import { TokenMetadata } from '../../services/ft-contract';
import { useFarmStake } from '../../state/farm';
import {
  BackToStablePoolList,
  Images,
} from '../../components/stableswap/CommonComp';
import BigNumber from 'bignumber.js';
import { getStablePoolFromCache, Pool, StablePool } from '../../services/pool';
import { getStableSwapTabKey } from './StableSwapPageUSN';
import { STABLE_TOKEN_IDS } from '../../services/near';
export const DEFAULT_ACTIONS = ['add_liquidity', 'remove_liquidity'];
const STABLE_TOKENS = ['USDT.e', 'USDC', 'DAI'];

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

function StableSwapPage({ pool }: { pool: Pool }) {
  const { state } = useLocation<LocationTypes>();
  const { id } = useParams<ParamTypes>();

  const REF_STABLE_SWAP_TAB_KEY = getStableSwapTabKey(pool.id);

  const stableTab = state?.stableTab;

  const storageTab =
    localStorage.getItem(REF_STABLE_SWAP_TAB_KEY) === 'add_liquidity' ||
    localStorage.getItem(REF_STABLE_SWAP_TAB_KEY) === 'remove_liquidity'
      ? localStorage.getItem(REF_STABLE_SWAP_TAB_KEY)
      : DEFAULT_ACTIONS[0];

  const [actionName, setAction] = useState<string>(stableTab || storageTab);

  const { shares } = state?.pool ? state : usePool(id);

  const [stablePool, setStablePool] = useState<StablePool>();

  useEffect(() => {
    getStablePoolFromCache(id.toString()).then((res) => {
      setStablePool(res[1]);
    });
  }, []);

  const allTokens = useWhitelistStableTokens();
  const tokens =
    allTokens &&
    allTokens.length > 0 &&
    allTokens.filter((item) => STABLE_TOKEN_IDS.indexOf(item.id) > -1);

  const nearBalances = useWalletTokenBalances(
    tokens?.map((token) => token.id) || []
  );

  const changeAction = (actionName: string) => {
    localStorage.setItem(REF_STABLE_SWAP_TAB_KEY, actionName);
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
          <AddLiquidityComponent
            changeAction={changeAction}
            stablePool={stablePool}
            pool={pool}
            tokens={tokens}
            balances={nearBalances}
          />
        );
      case DEFAULT_ACTIONS[1]:
        return (
          <RemoveLiquidityComponent
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
      {<SharesCard shares={shares} pool={pool} />}
      {renderModule(actionName)}
      {<TokenReserves tokens={tokens} pools={[pool]} forPool hiddenChart />}
    </div>
  );
}

export default StableSwapPage;
