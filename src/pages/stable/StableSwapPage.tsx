import React, { useState } from 'react';
import Loading from '~components/layout/Loading';
import {
  useTokenBalances,
  useWhitelistStableTokens,
  useWhitelistTokens,
} from '../../state/token';
import SquareRadio from '~components/radio/SquareRadio';
import StableSwap from '~components/stableswap/StableSwap';
import AddLiquidityComponent from '~components/stableswap/AddLiquidity';
import { usePool, useStablePool } from '~state/pool';
import { isMobile } from '~utils/device';
import { RemoveLiquidityComponent } from '~components/stableswap/RemoveLiquidity';
import TokenReserves from '~components/stableswap/TokenReserves';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from 'react-icons/fa';
import getConfig from '~services/config';
import { StableSwapLogo } from '~components/icon/StableSwap';
import { useWalletTokenBalances } from '../../state/token';
import { useLocation } from 'react-router-dom';
const DEFAULT_ACTIONS = ['stable_swap', 'add_liquidity', 'remove_liquidity'];
const STABLE_TOKENS = ['USDT', 'USDC', 'DAI'];
const STABLE_POOL_ID = getConfig().STABLE_POOL_ID;
export const REF_STABLE_SWAP_TAB_KEY = 'REF_STABLE_SWAP_TAB_VALUE';

interface LocationTypes {
  stableTab?: string;
}

function StableSwapPage() {
  const { pool, shares, stakeList } = usePool(STABLE_POOL_ID);
  const { state } = useLocation<LocationTypes>();

  const [actionName, setAction] = useState<string>(
    state?.stableTab ||
      localStorage.getItem(REF_STABLE_SWAP_TAB_KEY) ||
      DEFAULT_ACTIONS[0]
  );

  const [loadingTrigger, setLoadingTrigger] = useState<boolean>(false);
  const [loadingPause, setLoadingPause] = useState<boolean>(false);

  const allTokens = useWhitelistStableTokens();
  const tokens =
    allTokens &&
    allTokens.length > 0 &&
    allTokens.filter((item) => STABLE_TOKENS.indexOf(item.symbol) > -1);

  const nearBalances = useWalletTokenBalances(
    tokens?.map((token) => token.id) || []
  );

  const stablePool = useStablePool({
    loadingTrigger,
    setLoadingTrigger,
    loadingPause,
    setLoadingPause,
  });

  const changeAction = (actionName: string) => {
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
          <StableSwap
            tokens={tokens}
            balances={nearBalances}
            stablePool={stablePool}
            loadingTrigger={loadingTrigger}
            setLoadingTrigger={setLoadingTrigger}
            loadingPause={loadingPause}
            setLoadingPause={setLoadingPause}
          />
        );
      case DEFAULT_ACTIONS[1]:
        return (
          <AddLiquidityComponent
            stablePool={stablePool}
            pool={pool}
            tokens={tokens}
            totalShares={shares}
            stakeList={stakeList}
            balances={nearBalances}
          />
        );
      case DEFAULT_ACTIONS[2]:
        return (
          <RemoveLiquidityComponent
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
      <div className="flex justify-center -mt-10 mb-2 xs:hidden md:hidden">
        <StableSwapLogo></StableSwapLogo>
      </div>
      <div className="flex justify-center -mt-10 mb-2 lg:hidden">
        <StableSwapLogo width="100" height="76"></StableSwapLogo>
      </div>
      <SquareRadio
        onChange={changeAction}
        radios={DEFAULT_ACTIONS}
        currentChoose={actionName}
      />
      {renderModule(actionName)}
      {
        <TokenReserves
          totalStableCoins="100"
          tokens={tokens}
          pool={pool}
          inSwapPage={actionName === DEFAULT_ACTIONS[0]}
        />
      }
    </div>
  );
}

export default StableSwapPage;
