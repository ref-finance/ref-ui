import React, { useState } from 'react';
import { Card } from '~components/card/Card';
import { useWhitelistTokens, useTokenBalances } from '~state/token';
import Loading from '~components/layout/Loading';
import SelectToken from '~components/forms/SelectToken';
import { TokenMetadata } from '~services/ft-contract';
import { toRoundedReadableNumber } from '~utils/numbers';
import { ArrowDownGreen, ArrowDownWhite } from '~components/icon';
import Icon from '~components/tokens/Icon';
import { ConnectToNearBtn } from '~components/button/Button';
import { wallet } from '~services/near';
import { addSimpleLiquidityPool } from '~services/pool';
import { Toggle } from '~components/toggle';
import Alert from '~components/alert/Alert';
import { FormattedMessage, useIntl } from 'react-intl';
import { toRealSymbol } from '~utils/token';
import BigNumber from 'bignumber.js';

export function AddPoolPage() {
  const tokens = useWhitelistTokens();
  const balances = useTokenBalances();
  const [token1, setToken1] = useState<TokenMetadata | null>(null);
  const [token2, setToken2] = useState<TokenMetadata | null>(null);
  const [fee, setFee] = useState('0.30');
  const [error, setError] = useState<Error>();
  const [errorKey, setErrorKey] = useState<string>();
  const intl = useIntl();
  const tip: any = {
    moreThan: intl.formatMessage({ id: 'more_than' }),
    lessThan: intl.formatMessage({ id: 'less_than' }),
    noValid: intl.formatMessage({ id: 'no_valid' }),
  };
  if (!tokens || !balances) return <Loading />;

  const render = (token: TokenMetadata) => {
    return toRoundedReadableNumber({
      decimals: token.decimals,
      number: balances ? balances[token.id] : '0',
    });
  };

  const Selected = (props: { token: TokenMetadata }) => {
    const Icon = ({ token }: { token: TokenMetadata }) => {
      return (
        <div className="flex items-center">
          <div>
            <img
              key={token.id}
              className="mx-1 h-7 w-7 border rounded-full border-greenLight"
              src={token.icon}
            />
          </div>

          <div className="mx-1 font-semibold">{toRealSymbol(token.symbol)}</div>
        </div>
      );
    };
    return (
      <div className="flex h-10 justify-between items-center px-3 py-3 bg-inputDarkBg text-white relative flex overflow-hidden rounded align-center my-2">
        {/* <Icon token={props.token} /> */}
        <Icon token={props.token} />
        {tokens.length > 1 && (
          <div className="pl-2 text-xs">
            <ArrowDownWhite />
          </div>
        )}
      </div>
    );
  };
  const canSubmit =
    !!fee &&
    new BigNumber(fee).isGreaterThanOrEqualTo('0.01') &&
    new BigNumber(fee).isLessThan('20') &&
    !!token1 &&
    !!token2;

  return (
    <div className="flex items flex-col xl:w-1/3 2xl:w-1/3 3xl:w-1/4 lg:w-1/2 md:w-5/6 xs:w-full xs:p-2 m-auto">
      <div className="formTitle text-2xl text-white pb-4 px-4 lg:hidden">
        <FormattedMessage
          id="Create_New_Pool"
          defaultMessage="Create New Pool"
        />
      </div>
      <Card width="w-full" bgcolor="bg-cardBg">
        <div className="text-white text-xl pb-6 xs:hidden md:hidden">
          <FormattedMessage
            id="Create_New_Pool"
            defaultMessage="Create New Pool"
          />
        </div>
        <div className="flex flex-col lg:flex-row items-center lg:justify-between pb-6">
          <div className="w-full lg:mr-1 xs:mb-4 md:mb-4">
            <div className="text-xs text-primaryText">
              <FormattedMessage id="token" defaultMessage="Token" />
            </div>
            <SelectToken
              standalone
              placeholder={intl.formatMessage({ id: 'select' })}
              tokens={tokens}
              render={render}
              selected={token1 && <Selected token={token1} />}
              onSelect={setToken1}
              balances={balances}
            />
          </div>
          <div className="w-full lg:ml-1">
            <div className="text-xs text-primaryText">
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </div>
            <SelectToken
              standalone
              placeholder={intl.formatMessage({ id: 'select' })}
              tokens={tokens}
              render={render}
              selected={token2 && <Selected token={token2} />}
              onSelect={setToken2}
              balances={balances}
            />
          </div>
        </div>

        <div className="text-xs py-2 flex items-center justify-end">
          <div className="flex-grow">
            <span className="pr-1 text-white">
              <FormattedMessage id="fee" defaultMessage="Fee" /> %
            </span>
          </div>
          <Toggle
            opts={[
              { label: '0.20%', value: '0.20' },
              { label: '0.30%', value: '0.30' },
              { label: '0.60%', value: '0.60' },
            ]}
            onChange={(v) => {
              setFee(v);
              if (!v || Number(v) <= 0) {
                setErrorKey('noValid');
                return;
              } else {
                const bigV = new BigNumber(v);
                if (!bigV.isGreaterThanOrEqualTo('0.01')) {
                  setErrorKey('moreThan');
                  return;
                }
                if (!bigV.isLessThan('20')) {
                  setErrorKey('lessThan');
                  return;
                }
                // setFee((parseFloat(v) + Number.EPSILON).toFixed(2));
                setFee(bigV.toString());
              }
              setErrorKey('');
            }}
            value="0.30"
          />
        </div>
        <div className="w-full flex justify-center">
          {errorKey && (
            <Alert level="error" message={new Error(tip[errorKey]).message} />
          )}
        </div>
        <div className="pt-6 w-full">
          {wallet.isSignedIn() ? (
            <button
              disabled={!canSubmit}
              className={`rounded-full w-full text-lg text-white px-5 py-2.5 focus:outline-none font-semibold ${
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
                  const v = new BigNumber(fee).multipliedBy(100).toFixed(0, 1);
                  addSimpleLiquidityPool([token1.id, token2.id], Number(v));
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
