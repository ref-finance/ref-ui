import React, { useState } from 'react';
import Loading from '~components/layout/Loading';
import {
  useTokenBalances,
  useTokens,
  useWhitelistTokens,
} from '../../state/token';
import SquareRadio from '~components/radio/SquareRadio';
import StableSwap from '~components/stableswap/StableSwap';
import AddLiquidityComponent from '~components/stableswap/AddLiquidity';
import { usePool } from '~state/pool';
import { isMobile } from '~utils/device';
import { RemoveLiquidityComponent } from '~components/stableswap/RemoveLiquidity';

// const cardWidth = isMobile() ? '95vw' : '580px';
const DEFAULT_MODULES = ['stable_swap', 'add_liquidity', 'remove_liquidity'];
const STABLE_TOKENS = ['USDT', 'USDC', 'DAI'];
function StableSwapPage() {
  const { pool } = usePool(10);
  const [moduleName, setModule] = useState<string>(DEFAULT_MODULES[0]);
  const allTokens = useWhitelistTokens();
  const balances = useTokenBalances();
  const changeModule = (moduleName: string) => {
    setModule(moduleName);
  };
  const tokens =
    allTokens &&
    allTokens.length > 0 &&
    allTokens.filter((item) => STABLE_TOKENS.indexOf(item.symbol) > -1);
  const renderModule = (tab: string) => {
    switch (tab) {
      case DEFAULT_MODULES[0]:
        return <StableSwap tokens={tokens} balances={balances} />;
      case DEFAULT_MODULES[1]:
        return (
          <AddLiquidityComponent
            pool={pool}
            tokens={tokens}
            balances={balances}
          />
        );
      case DEFAULT_MODULES[2]:
        return (
          <RemoveLiquidityComponent
            tokens={tokens}
            shares="0"
            balances={balances}
          />
        );
    }
  };
  if (!allTokens) return <Loading />;

  return (
    <div className="m-auto lg:w-2/5 md:4/5 xs:w-full">
      <SquareRadio onChange={changeModule} radios={DEFAULT_MODULES} />
      {renderModule(moduleName)}
    </div>
  );
}

export default StableSwapPage;
