import React, { useState } from 'react';
import { Card } from '~components/card/Card';
import { useWhitelistTokens, useTokenBalances } from '~state/token';
import Loading from '~components/layout/Loading';
import SelectToken from '~components/forms/SelectToken';
import { TokenMetadata } from '~services/ft-contract';
import { toRoundedReadableNumber } from '~utils/numbers';
import { ArrowDownGreen } from '~components/icon';
import Icon from '~components/tokens/Icon';
import { ConnectToNearBtn } from '~components/button/Button';
import { wallet } from '~services/near';
import { addSimpleLiquidityPool } from '~services/pool';
import { Toggle } from '~components/toggle';
import Alert from '~components/alert/Alert';
import { FormattedMessage, useIntl } from 'react-intl';

export function AddPoolPage() {
  const tokens = useWhitelistTokens();
  const balances = useTokenBalances();
  const [token1, setToken1] = useState<TokenMetadata | null>(null);
  const [token2, setToken2] = useState<TokenMetadata | null>(null);
  const [fee, setFee] = useState('0.30');
  const [error, setError] = useState<Error>();
  const intl = useIntl();

  if (!tokens || !balances) return <Loading />;

  const render = (token: TokenMetadata) => {
    return toRoundedReadableNumber({
      decimals: token.decimals,
      number: balances ? balances[token.id] : '0',
    });
  };

  const Selected = (props: { token: TokenMetadata }) => {
    return (
      <div className="flex h-12 justify-between items-center px-3 py-3 bg-inputDarkBg text-white relative flex overflow-hidden rounded-lg align-center my-2 border border-greenLight">
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
    <div className="flex items-center flex-col xl:w-1/3 2xl:w-1/3 3xl:w-1/4 lg:w-1/2 md:w-5/6 xs:w-full xs:p-2 m-auto">
      <Card width="w-full" bgcolor="bg-dark">
        <h2 className="formTitle font-bold text-xl text-white text-left pb-4">
          <FormattedMessage
            id="Create_New_Pool"
            defaultMessage="Create New Pool"
          />
        </h2>
        <div className="text-xs font-semibold text-primaryText">
          <FormattedMessage id="token" defaultMessage="Token" />
        </div>
        <div className="w-full flex justify-center">
          {error && <Alert level="error" message={error.message} />}
        </div>
        <SelectToken
          standalone
          placeholder={intl.formatMessage({ id: 'select_token' })}
          tokens={tokens}
          render={render}
          selected={token1 && <Selected token={token1} />}
          onSelect={setToken1}
          balances={balances}
        />
        <div className="text-xs font-semibold text-primaryText pt-2">
          <FormattedMessage id="pair" defaultMessage="Pair" />
        </div>
        <SelectToken
          standalone
          placeholder={intl.formatMessage({ id: 'select_token' })}
          tokens={tokens}
          render={render}
          selected={token2 && <Selected token={token2} />}
          onSelect={setToken2}
          balances={balances}
        />
        <div className="text-xs font-semibold pt-2 flex items-center justify-between">
          <div>
            <span className="pr-1 text-primaryText">
              <FormattedMessage id="fee" defaultMessage="Fee" /> %
            </span>
          </div>
          <Toggle
            opts={[
              { label: '0.15', value: '0.15' },
              { label: '0.25', value: '0.25' },
              { label: '0.55', value: '0.55' },
            ]}
            onChange={(v) =>
              setFee((parseFloat(v) + 0.05 + Number.EPSILON).toFixed(2))
            }
            value="0.25"
          />
        </div>
        <div className="text-xs font-semibold pt-4 flex items-center justify-between">
          <div>
            <span className="pr-1 text-primaryText">
              <FormattedMessage id="total_fee" defaultMessage="Total Fee %" />(
              <FormattedMessage
                id="protocol_fee_is"
                defaultMessage="protocol fee is "
              />
              0.05%)
            </span>
          </div>
          <div className="inline-block w-20 border border-greenLight bg-inputDarkBg p-2 px-3 rounded-lg">
            <input
              className="text-right text-white"
              type="number"
              value={fee}
              onChange={(evt) => {
                setFee(evt.target.value);
              }}
            />
          </div>
        </div>
        <div className="pt-4 w-full">
          {wallet.isSignedIn() ? (
            <button
              disabled={!canSubmit}
              className={`rounded-full w-full text-xs text-white px-5 py-2.5 focus:outline-none font-semibold ${
                canSubmit ? '' : 'bg-opacity-50 disabled:cursor-not-allowed'
              }`}
              style={
                canSubmit
                  ? {
                      background:
                        'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
                      borderRadius: '5px',
                    }
                  : {
                      background: '#314351',
                      borderRadius: '5px',
                    }
              }
              onClick={() => {
                if (canSubmit) {
                  const v = parseFloat(fee);
                  if (!v) {
                    setError(new Error('Please input valid number'));
                    return;
                  }
                  if (v >= 20) {
                    setError(
                      new Error('Please input number that less then 20')
                    );
                    return;
                  }
                  setError(null);

                  addSimpleLiquidityPool(
                    [token1.id, token2.id],
                    parseFloat(fee) * 100 - 5
                  );
                }
              }}
            >
              <FormattedMessage
                id="add_liquidity"
                defaultMessage="Add Liquidity"
              />
            </button>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </Card>
    </div>
  );
}
