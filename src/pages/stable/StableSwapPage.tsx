import React, { useState } from 'react';
import Loading from '~components/layout/Loading';
import { useStableTokenBalances, useWhitelistTokens } from '../../state/token';
import SquareRadio from '~components/radio/SquareRadio';
import StableSwap from '~components/stableswap/StableSwap';
import AddLiquidityComponent from '~components/stableswap/AddLiquidity';
import { usePool } from '~state/pool';
import { isMobile } from '~utils/device';
import { RemoveLiquidityComponent } from '~components/stableswap/RemoveLiquidity';

const cardWidth = isMobile() ? '95vw' : '580px';
const DEFAULT_ACTIONS = ['stable_swap', 'add_liquidity', 'remove_liquidity'];
const STABLE_TOKENS = ['USDT', 'USDC', 'DAI'];

function StableSwapPage() {
  const { pool } = usePool(10);
  const [actionName, setAction] = useState<string>(DEFAULT_ACTIONS[0]);
  const allTokens = useWhitelistTokens();
  const stable_tokens_balances = useStableTokenBalances();
  const changeAction = (actionName: string) => {
    setAction(actionName);
  };

  const tokens =
    allTokens &&
    allTokens.length > 0 &&
    allTokens.filter((item) => STABLE_TOKENS.indexOf(item.symbol) > -1);

  const renderModule = (tab: string) => {
    switch (tab) {
      case DEFAULT_ACTIONS[0]:
        return <StableSwap tokens={tokens} balances={stable_tokens_balances} />;
      case DEFAULT_ACTIONS[1]:
        return (
          <AddLiquidityComponent
            pool={pool}
            tokens={tokens}
            balances={stable_tokens_balances}
          />
        );
      case DEFAULT_ACTIONS[2]:
        return (
          <RemoveLiquidityComponent
            tokens={tokens}
            shares="0"
            balances={stable_tokens_balances}
          />
        );
    }
  };
  if (!allTokens) return <Loading />;

  return (
    <div className="m-auto" style={{ width: cardWidth }}>
      <SquareRadio onChange={changeAction} radios={DEFAULT_ACTIONS} />
      {renderModule(actionName)}
    </div>
  );
}

export default StableSwapPage;
