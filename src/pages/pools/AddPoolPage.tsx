import React, { useState, useContext, useEffect } from 'react';
import { Card } from '~components/card/Card';
import { useWhitelistTokens, useTokenBalances } from '~state/token';
import Loading from '~components/layout/Loading';
import SelectToken from '~components/forms/SelectToken';
import { TokenMetadata } from '~services/ft-contract';
import { toRoundedReadableNumber } from '~utils/numbers';
import { ArrowDownGreen, ArrowDownWhite } from '~components/icon';
import Icon from '~components/tokens/Icon';
import { ButtonTextWrapper, ConnectToNearBtn } from '~components/button/Button';
import { wallet } from '~services/near';
import { addSimpleLiquidityPool } from '~services/pool';
import { Toggle } from '~components/toggle';
import Alert from '~components/alert/Alert';
import { FormattedMessage, useIntl } from 'react-intl';
import { toRealSymbol } from '~utils/token';
import BigNumber from 'bignumber.js';
import QuestionMark from '~components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import { getCurrentWallet, WalletContext } from '../../utils/sender-wallet';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { checkTransactionStatus } from '../../services/swap';
import { decodeBase64 } from 'lzutf8';
import { useHistory } from 'react-router-dom';
import { getTokenPriceList } from '../../services/indexer';
import { useRainbowWhitelistTokens } from '../../state/token';

export function AddPoolPage() {
  const tokens = useRainbowWhitelistTokens();
  const balances = useTokenBalances();
  const [token1, setToken1] = useState<TokenMetadata | null>(null);
  const [token2, setToken2] = useState<TokenMetadata | null>(null);
  const [fee, setFee] = useState('0.30');
  const [error, setError] = useState<Error>();
  const [errorKey, setErrorKey] = useState<string>();
  const intl = useIntl();
  const [buttonLoading, setButtonLoading] = useState(false);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const history = useHistory();

  const { txHash } = getURLInfo();

  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});

  useEffect(() => {
    getTokenPriceList().then(setTokenPriceList);
  }, []);

  useEffect(() => {
    if (txHash && getCurrentWallet().wallet.isSignedIn()) {
      checkTransactionStatus(txHash).then((res) => {
        const status: any = res.status;
        const data: string | undefined = status.SuccessValue;
        if (data) {
          const buff = Buffer.from(data, 'base64');
          const pool_id = buff.toString('ascii');
          history.push(`/pool/${pool_id}`);
        }
      });
    }
  }, [txHash]);

  const tip: any = {
    moreThan: intl.formatMessage({ id: 'more_than' }),
    lessThan: intl.formatMessage({ id: 'less_than' }),
    noValid: intl.formatMessage({ id: 'no_valid' }),
  };
  const feeList = {
    lp_fee: {
      v: intl.formatMessage({ id: 'lp_fee' }),
      percent: '80',
    },
    protocol_fee: {
      v: intl.formatMessage({ id: 'protocol_fee' }),
      percent: '16',
    },
    referral_fee: {
      v: intl.formatMessage({ id: 'referral_fee' }),
      percent: '4',
    },
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
  const getFeeDetail = () => {
    let result = '';
    Object.values(feeList).forEach((item) => {
      const str = `<div class="flex tems-center text-xs text-navHighLightText my-1"><label class="mr-2">${item.v}</label><label>${item.percent}%</label></div>`;
      result += str;
    });
    return result;
  };
  const getCurFee = (item: any) => {
    const { v, percent } = item;
    let result;
    if (
      !!fee &&
      new BigNumber(fee).isGreaterThanOrEqualTo('0.01') &&
      new BigNumber(fee).isLessThan('20')
    ) {
      result = new BigNumber(fee)
        .multipliedBy(percent)
        .dividedBy('100')
        .toFixed();
    } else {
      result = '-';
    }
    return result + ' %';
  };
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
              tokenPriceList={tokenPriceList}
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
              tokenPriceList={tokenPriceList}
            />
          </div>
        </div>

        <div className="text-xs py-2 flex items-center justify-end xs:items-start md:items-start">
          <div className="flex flex-grow items-center">
            <span className="text-white text-sm">
              <FormattedMessage id="total_fee_create" defaultMessage="Fee" />
            </span>
            <div
              className="ml-2 text-sm"
              data-type="info"
              data-place="right"
              data-multiline={true}
              data-class="reactTip"
              data-html={true}
              data-tip={getFeeDetail()}
              data-for="feeDetail"
            >
              <QuestionMark />
              <ReactTooltip
                className="w-20"
                id="feeDetail"
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
                textColor="#C6D1DA"
              />
            </div>
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
            <Alert level="warn" message={new Error(tip[errorKey]).message} />
          )}
        </div>
        <div className="rounded-md bg-black bg-opacity-20 px-4 py-2 mt-5">
          {Object.values(feeList).map((item) => {
            return (
              <div
                className="flex justify-between items-center my-2"
                key={item.v + 1}
              >
                <label className="text-sm text-primaryText">{item.v}</label>
                <label className="text-sm text-white">{getCurFee(item)}</label>
              </div>
            );
          })}
        </div>
        <div className="pt-6 w-full">
          {isSignedIn ? (
            <button
              disabled={!canSubmit}
              className={`rounded-full w-full text-lg text-white px-5 py-2.5 focus:outline-none font-semibold ${
                canSubmit ? '' : 'opacity-40 disabled:cursor-not-allowed'
              } ${buttonLoading ? 'opacity-40' : ''}`}
              style={{
                background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
                borderRadius: '5px',
              }}
              onClick={() => {
                if (canSubmit) {
                  const v = new BigNumber(fee).multipliedBy(100).toFixed(0, 1);
                  setButtonLoading(true);
                  addSimpleLiquidityPool([token1.id, token2.id], Number(v));
                }
              }}
            >
              <ButtonTextWrapper
                loading={buttonLoading}
                Text={() => (
                  <FormattedMessage id="create" defaultMessage="Create" />
                )}
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
