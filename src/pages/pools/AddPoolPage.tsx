import React, { useState } from 'react';
import { Card } from '~components/card';
import { useWhitelistTokens, useTokenBalances } from '../../state/token';
import Loading from '~components/layout/Loading';
import SelectToken from '~components/forms/SelectToken';
import { TokenMetadata } from '../../services/ft-contract';
import { toRoundedReadableNumber } from '../../utils/numbers';
import { ArrowDownGreen } from '~components/icon';
import Icon from '~components/tokens/Icon';
import { ConnectToNearBtn } from '~components/deposit';
import { wallet } from '~services/near';
import { addSimpleLiquidityPool } from '~services/pool';
import copy from '~utils/copy';

export function AddPoolPage() {
  const tokens = useWhitelistTokens();
  const balances = useTokenBalances();
  const [token1, setToken1] = useState<TokenMetadata | null>(null);
  const [token2, setToken2] = useState<TokenMetadata | null>(null);
  const [fee, setFee] = useState('');

  if (!tokens || !balances) return <Loading />;

  const render = (token: TokenMetadata) => (
    <p className="text-black">
      {toRoundedReadableNumber({
        decimals: token.decimals,
        number: balances[token.id],
      })}
    </p>
  );

  const Selected = (props: { token: TokenMetadata }) => {
    return (
      <div className="flex items-center justify-between font-semibold bg-inputBg relative flex overflow-hidden rounded-lg align-center my-2 border py-3 px-3">
        <Icon token={props.token} />
        {tokens.length > 1 && (
          <div className="pl-2 text-xs">
            <ArrowDownGreen />
          </div>
        )}
      </div>
    );
  };

  const canSubmit = !!fee && !!token1 && !!token2;

  return (
    <div className="flex items-center flex-col">
      <div className="text-center pb-8">
        <div className="text-white text-3xl font-semibold">
          Add Liquidity Pool
        </div>
      </div>
      <Card width="w-1/3">
        <div className="text-xs font-semibold">Token</div>
        <SelectToken
          standalone
          placeholder="Select token"
          tokens={tokens}
          render={balances ? render : null}
          selected={token1 && <Selected token={token1} />}
          onSelect={setToken1}
        />
        <div className="text-xs font-semibold pt-2">Pair</div>
        <SelectToken
          standalone
          placeholder="Select token"
          tokens={tokens}
          render={balances ? render : null}
          selected={token2 && <Selected token={token2} />}
          onSelect={setToken2}
        />
        <div className="text-xs font-semibold pt-2">Fee (Basis points)</div>
        <div className="rounded-lg w-full border my-2">
          <input
            step="any"
            min="0"
            className={`text-sm font-bold bg-inputBg focus:outline-none rounded-lg w-full py-2 px-3 text-greenLight`}
            type="number"
            placeholder="0.0"
            value={fee}
            onChange={({ target }) => setFee(target.value)}
          />
        </div>
        <div className="pt-4 flex items-center justify-center">
          {wallet.isSignedIn() ? (
            <button
              disabled={!canSubmit}
              className={`rounded-full text-xs text-white px-3 py-1.5 focus:outline-none font-semibold bg-greenLight ${
                canSubmit ? '' : 'bg-opacity-50 disabled:cursor-not-allowed'
              }`}
              onClick={() => {
                if (canSubmit) {
                  addSimpleLiquidityPool(
                    [token1.id, token2.id],
                    parseFloat(fee)
                  );
                }
              }}
            >
              Add Liquidity
            </button>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </Card>
      <div className="text-white text-xs pt-3 leading-4 w-1/4 text-center">
        {copy.addLiquidityPool}
      </div>
    </div>
  );
}
