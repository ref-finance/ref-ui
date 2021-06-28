import React, { useState } from 'react';
import { FaRegQuestionCircle } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import { Card } from '~components/card/Card';
import { useWhitelistTokens, useTokenBalances } from '~state/token';
import Loading from '~components/layout/Loading';
import SelectToken from '~components/forms/SelectToken';
import { TokenMetadata } from '~services/ft-contract';
import { toRoundedReadableNumber } from '~utils/numbers';
import { ArrowDownGreen } from '~components/icon';
import Icon from '~components/tokens/Icon';
import { ConnectToNearBtn } from '~components/deposit/Deposit';
import { wallet } from '~services/near';
import { addSimpleLiquidityPool } from '~services/pool';
import copy from '~utils/copy';
import { Toggle } from '~components/toggle';
import Alert from '~components/alert/Alert';

export function AddPoolPage() {
  const tokens = useWhitelistTokens();
  const balances = useTokenBalances();
  const [token1, setToken1] = useState<TokenMetadata | null>(null);
  const [token2, setToken2] = useState<TokenMetadata | null>(null);
  const [fee, setFee] = useState('0.40');
  const [error, setError] = useState<Error>();

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
    <div className="flex items-center flex-col w-1/3 md:w-5/6 xs:w-11/12 m-auto">
      <div className="text-center pb-8">
        <div className="text-white text-3xl font-semibold">Create New Pool</div>
      </div>
      <Card width="w-full">
        <div className="text-xs font-semibold">Token</div>
        <div className="w-full flex justify-center">
          {error && <Alert level="error" message={error.message} />}
        </div>
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
        <div className="text-xs font-semibold pt-2 flex items-center justify-between">
          <div>
            <span className="pr-1">Fee (Basis points) </span>
          </div>
          <Toggle
            opts={[
              { label: '0.25', value: '0.25' },
              { label: '0.35', value: '0.35' },
              { label: '0.85', value: '0.85' },
            ]}
            onChange={(v) =>
              setFee((parseFloat(v) + 0.05 + Number.EPSILON).toFixed(2))
            }
            value="0.35"
          />
        </div>
        <div className="text-xs font-semibold pt-4 flex items-center justify-between">
          <div>
            <span className="pr-1">Total Fee (protocol fee is 0.05%)</span>
          </div>
          <div className="inline-block w-20 border bg-gray-100 p-2 px-3 rounded-lg">
            <input
              className="text-right"
              type="number"
              value={fee}
              onChange={(evt) => {
                setFee(evt.target.value);
              }}
            />
          </div>
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
                  const v = parseFloat(fee);
                  if (!v) {
                    setError(new Error('Please input valid number'));
                    return;
                  }
                  if (v >= 1) {
                    setError(new Error('Please input number that less then 1'));
                    return;
                  }
                  setError(null);

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
      <div className="text-white text-sm pt-3 leading-6 w-11/12 text-center">
        {copy.addLiquidityPool}
      </div>
    </div>
  );
}
