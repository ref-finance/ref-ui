import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { ftGetBalance, TokenMetadata } from '../../services/ft-contract';
import { useDepositableBalance } from '../../state/token';
import {
  calculateExchangeRate,
  toPrecision,
  toReadableNumber,
  ONLY_ZEROS,
} from '../../utils/numbers';
import TokenAmount from '../forms/TokenAmount';
import SubmitButton from '../forms/SubmitButton';
import Alert from '../alert/Alert';
import { toRealSymbol } from '../../utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from '../reactIcons';
import USNFormWrap from '../forms/USNFormWrap';
import BigNumber from 'bignumber.js';
import { senderWallet, WalletContext } from '../../utils/wallets-integration';
import { SwapArrow, SwapExchange } from '../icon/Arrows';
import { getTokenPriceList } from '../../services/indexer';
import { fetchMultiplier, buyUSN, sellUSN } from '../../services/buy-sell-usn';
import { POOL_TOKEN_REFRESH_INTERVAL } from '../../services/near';
import { nearMetadata } from '../../services/wrap-near';
import {
  failToast,
  getURLInfo,
  usnBuyAndSellToast,
} from '../../components/layout/transactionTipPopUp';
import { getCurrentWallet } from '../../utils/wallets-integration';
import { checkTransaction } from '../../services/swap';

const USN_SLIPPAGE_KEY = 'USN_FI_SLIPPAGE_VALUE';

function USNDetail({
  title,
  value,
}: {
  title: string;
  value: string | JSX.Element;
}) {
  return (
    <section className="grid grid-cols-12 py-1 text-xs">
      <p className="text-primaryText text-left col-span-6">{title}</p>
      <p className="text-right text-white col-span-6">{value}</p>
    </section>
  );
}

function USNRateDetail({
  title,
  value,
  subTitle,
  from,
  to,
  tokenIn,
  tokenOut,
  fee,
}: {
  fee: number;
  title: string;
  value?: string;
  from: string;
  to: string;
  subTitle?: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) {
  const [newValue, setNewValue] = useState<string>('');
  const [isRevert, setIsRevert] = useState<boolean>(false);

  const exchangeRageValue = useMemo(() => {
    const fromNow = isRevert ? from : to;
    const toNow = isRevert ? to : from;
    if (ONLY_ZEROS.test(fromNow)) return '-';

    return calculateExchangeRate(fee, fromNow, toNow);
  }, [isRevert, to]);

  useEffect(() => {
    setNewValue(value);
  }, [value]);

  useEffect(() => {
    setNewValue(
      `1 ${toRealSymbol(
        isRevert ? tokenIn.symbol : tokenOut.symbol
      )} ≈ ${exchangeRageValue} ${toRealSymbol(
        isRevert ? tokenOut.symbol : tokenIn.symbol
      )}`
    );
  }, [isRevert, exchangeRageValue]);

  function switchSwapRate() {
    setIsRevert(!isRevert);
  }

  return (
    <section className="grid grid-cols-12 py-1 text-xs">
      <p className="text-primaryText text-left flex xs:flex-col md:flex-col col-span-4 whitespace-nowrap">
        <label className="mr-1">{title}</label>
        {subTitle ? <label>{subTitle}</label> : null}
      </p>
      <p
        className="flex justify-end text-white cursor-pointer text-right col-span-8"
        onClick={switchSwapRate}
      >
        <span className="mr-2" style={{ marginTop: '0.1rem' }}>
          <FaExchangeAlt color="#00C6A2" />
        </span>
        <span className="font-sans">{newValue}</span>
      </p>
    </section>
  );
}

function DetailView({
  tokenIn,
  tokenOut,
  from,
  to,
  fee,
  minimumReceived,
  tradeFeeTokenAmount,
  tradeFeeRate,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  from: string;
  to: string;
  fee?: number;
  minimumReceived: string;
  tradeFeeRate: string;
  tradeFeeTokenAmount: string;
}) {
  const intl = useIntl();
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="mt-8">
      <div className="flex justify-center">
        <div
          className="flex items-center text-white cursor-pointer"
          onClick={() => {
            setShowDetails(!showDetails);
          }}
        >
          <p className="block text-xs">
            <FormattedMessage id="details" defaultMessage="Details" />
          </p>
          <div className="pl-1 text-sm">
            {showDetails ? <FaAngleUp /> : <FaAngleDown />}
          </div>
        </div>
      </div>
      <div className={showDetails ? '' : 'hidden'}>
        <USNDetail
          title={intl.formatMessage({ id: 'minimum_received' })}
          value={<span>{minimumReceived}</span>}
        />
        <USNRateDetail
          title={intl.formatMessage({ id: 'rate' })}
          from={from}
          to={to}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          fee={fee}
        />
        <USNDetail
          title={intl.formatMessage({ id: 'trading_fee' })}
          value={
            <span>
              {tradeFeeRate +
                ' / ' +
                tradeFeeTokenAmount +
                ' ' +
                tokenIn.symbol}
            </span>
          }
        />
        <div className="flex items-center justify-end">
          <div className="text-greenColor text-xs flex items-center justify-center bg-xrefbg rounded-3xl px-3 py-1 mt-1.5">
            <FormattedMessage id="usn_fee_tip"></FormattedMessage>
          </div>
        </div>
      </div>
    </div>
  );
}
const useUSN = (props: any) => {
  const {
    loadingTrigger,
    loadingPause,
    setLoadingTrigger,
    tokenPriceList,
    setTokenPriceList,
  } = props;
  const refreshTime = Number(POOL_TOKEN_REFRESH_INTERVAL) * 1000;
  const [currentrate, setCurrentRate] = useState(0);
  useEffect(() => {
    if (loadingTrigger) {
      fetchMultiplierData();
    }
    let id: any = null;
    if (!loadingTrigger && !loadingPause) {
      id = setInterval(() => {
        setLoadingTrigger(true);
      }, refreshTime);
    } else {
      clearInterval(id);
    }
    return () => {
      clearInterval(id);
    };
  }, [loadingTrigger, loadingPause]);
  useEffect(() => {
    if (currentrate) {
      const nearPriceData = JSON.parse(JSON.stringify(nearMetadata));
      nearPriceData.price = currentrate / 10000;
      tokenPriceList[nearMetadata.id] = nearPriceData;
      setTokenPriceList[JSON.parse(JSON.stringify(tokenPriceList))];
    }
  }, [currentrate, tokenPriceList]);
  const fetchMultiplierData = () => {
    fetchMultiplier().then((result) => {
      const { multiplier } = result;
      setCurrentRate(multiplier);
      setLoadingTrigger(false);
    });
  };
  return currentrate;
};
export default function USNCard(props: {
  allTokens: TokenMetadata[];
  closeFun: any;
}) {
  const { allTokens, closeFun } = props;
  const [tokenIn, setTokenIn] = useState<TokenMetadata>();
  const [tokenInAmount, setTokenInAmount] = useState<string>('1');
  const [tokenOut, setTokenOut] = useState<TokenMetadata>();
  const [useNearBalance, setUseNearBalance] = useState<boolean>(true);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [tokenInBalanceFromNear, setTokenInBalanceFromNear] =
    useState<string>();
  const [tokenOutBalanceFromNear, setTokenOutBalanceFromNear] =
    useState<string>();
  const [loadingTrigger, setLoadingTrigger] = useState<boolean>(true);
  const [loadingPause, setLoadingPause] = useState<boolean>(false);
  const [showBuyLoading, setShowBuyLoading] = useState<boolean>(false);
  const { txHash, pathname, errorType } = getURLInfo();
  const intl = useIntl();
  const history = useHistory();

  const [slippageToleranceNormal, setSlippageToleranceNormal] =
    useState<number>(Number(localStorage.getItem(USN_SLIPPAGE_KEY)) || 0.5);

  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const tradeFeeRate = '0.005';
  useEffect(() => {
    getTokenPriceList().then((list) => {
      setTokenPriceList(Object.assign(tokenPriceList, list));
    });
  }, []);

  useEffect(() => {
    if (allTokens) {
      const candTokenIn = allTokens[0];
      const candTokenOut = allTokens[1];
      setTokenIn(candTokenIn);
      setTokenOut(candTokenOut);

      if (tokenOut?.id === candTokenOut?.id && tokenIn?.id === candTokenIn?.id)
        setTokenInAmount(toPrecision('1', 6));
    }
  }, [allTokens]);
  useEffect(() => {
    if (tokenIn && tokenIn.id !== 'NEAR') {
      const tokenInId = tokenIn.id;
      if (tokenInId) {
        if (isSignedIn) {
          ftGetBalance(tokenInId).then((available: string) =>
            setTokenInBalanceFromNear(
              toReadableNumber(tokenIn?.decimals, available)
            )
          );
        }
      }
    }
    if (tokenOut && tokenOut.id !== 'NEAR') {
      const tokenOutId = tokenOut.id;
      if (tokenOutId) {
        if (isSignedIn) {
          ftGetBalance(tokenOutId).then((available: string) =>
            setTokenOutBalanceFromNear(
              toReadableNumber(tokenOut?.decimals, available)
            )
          );
        }
      }
    }
  }, [tokenIn, tokenOut, useNearBalance, isSignedIn]);
  const nearBalance = useDepositableBalance(
    nearMetadata.id,
    nearMetadata.decimals
  );
  const tokenInMax =
    tokenIn?.id === 'NEAR' ? nearBalance : tokenInBalanceFromNear || '0';
  const tokenOutTotal =
    tokenOut?.id === 'NEAR' ? nearBalance : tokenOutBalanceFromNear || '0';
  const multiplier = useUSN({
    loadingPause,
    loadingTrigger,
    setLoadingTrigger,
    tokenPriceList,
    setTokenPriceList,
  });
  const currentRate = multiplier / 10000;
  let tokenOutAmount = '';
  let minimumReceived = '';
  let tradeFeeTokenAmount = '';
  let tokenInAmountAfterCutFee = '';
  if (tokenIn) {
    tokenInAmountAfterCutFee = new BigNumber(tokenInAmount || 0)
      .multipliedBy(1 - Number(tradeFeeRate))
      .toFixed()
      .toString();
    if (tokenIn.symbol == 'NEAR') {
      tokenOutAmount = new BigNumber(tokenInAmountAfterCutFee || 0)
        .multipliedBy(currentRate || 0)
        .toFixed()
        .toString();
    } else {
      tokenOutAmount = new BigNumber(tokenInAmountAfterCutFee || 0)
        .dividedBy(currentRate || 0)
        .toFixed()
        .toString();
    }
    const tokenOutAmountBig = new BigNumber(tradeFeeRate).multipliedBy(
      tokenInAmount || 0
    );
    if (tokenOutAmountBig.isLessThan('0.001')) {
      tradeFeeTokenAmount = '0';
    } else {
      tradeFeeTokenAmount = tokenOutAmountBig.toFixed().toString();
    }
    minimumReceived = new BigNumber(1 - slippageToleranceNormal / 100)
      .multipliedBy(tokenOutAmount)
      .toFixed()
      .toString();
  }
  const getMax = function () {
    if (tokenIn) {
      return tokenIn.id !== 'NEAR'
        ? tokenInMax
        : Number(tokenInMax) <= 0.5
        ? '0'
        : String(Number(tokenInMax) - 0.5);
    }
    return '0';
  };
  const canSubmit =
    !loadingTrigger &&
    !showBuyLoading &&
    Number(tokenInAmountAfterCutFee) &&
    new BigNumber(tokenInAmount).isLessThanOrEqualTo(getMax());
  const handleSubmit = (event: React.FormEvent) => {
    setShowBuyLoading(true);
    if (tokenIn.symbol == 'NEAR') {
      buyUSN({
        multiplier: multiplier.toString(),
        slippage: slippageToleranceNormal,
        amount: tokenInAmount,
      });
    } else {
      sellUSN({
        multiplier: multiplier.toString(),
        slippage: slippageToleranceNormal,
        amount: tokenInAmount,
      });
    }
  };
  return (
    <>
      <USNFormWrap
        useNearBalance={useNearBalance.toString()}
        slippageTolerance={slippageToleranceNormal}
        onChange={(slippage) => {
          setSlippageToleranceNormal(slippage);
          localStorage.setItem(USN_SLIPPAGE_KEY, slippage?.toString());
        }}
        bindUseBalance={(useNearBalance) => {
          setUseNearBalance(useNearBalance);
        }}
        closeFun={closeFun}
        onSubmit={handleSubmit}
        loading={{
          loadingTrigger,
          loadingPause,
          setLoadingPause,
          setLoadingTrigger,
        }}
      >
        <TokenAmount
          forSwap
          amount={tokenInAmount}
          total={tokenInMax}
          max={getMax()}
          selectedToken={tokenIn}
          useNearBalance={useNearBalance}
          showSelectToken={false}
          onChangeAmount={(amount) => {
            setTokenInAmount(amount);
          }}
          tokenPriceList={tokenPriceList}
          isError={tokenIn?.id === tokenOut?.id}
        />
        <div
          className="flex items-center justify-center border-t mt-12"
          style={{ borderColor: 'rgba(126, 138, 147, 0.3)' }}
        >
          <SwapExchange
            onChange={() => {
              setTokenIn(tokenOut);
              setTokenOut(tokenIn);
              setTokenInAmount(toPrecision('1', 6));
            }}
          />
        </div>
        <TokenAmount
          forSwap
          amount={toPrecision(tokenOutAmount, 8)}
          total={tokenOutTotal}
          selectedToken={tokenOut}
          showSelectToken={false}
          useNearBalance={useNearBalance}
          isError={tokenIn?.id === tokenOut?.id}
          tokenPriceList={tokenPriceList}
        />
        {tokenIn && tokenOut && currentRate ? (
          <DetailView
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            from={tokenInAmount}
            to={tokenOutAmount}
            minimumReceived={toPrecision(minimumReceived, 8)}
            tradeFeeTokenAmount={toPrecision(tradeFeeTokenAmount, 3)}
            tradeFeeRate={Number(tradeFeeRate) * 100 + '%'}
          />
        ) : null}

        {/* {swapError ? (
          <div className="pb-2 relative -mb-5">
            <Alert level="warn" message={swapError.message} />
          </div>
        ) : null} */}
        <SubmitButton
          onClick={handleSubmit}
          disabled={!canSubmit}
          label={tokenIn?.id == 'NEAR' ? 'buy' : 'sell'}
          loading={showBuyLoading}
        />
      </USNFormWrap>
    </>
  );
}
