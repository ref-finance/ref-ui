import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { Card } from 'src/components/card/Card';
import {
  useMonthTVL,
  useMonthVolume,
  usePool,
  useRemoveLiquidity,
  volumeDataType,
  TVLDataType,
  useDayVolume,
  useClassicPoolTransaction,
  useIndexerStatus,
} from 'src/state/pool';
import {
  addLiquidityToPool,
  addPoolToWatchList,
  getWatchListFromDb,
  Pool,
  removePoolFromWatchList,
} from 'src/services/pool';
import { useTokens, getDepositableBalance } from 'src/state/token';
import Loading from 'src/components/layout/Loading';
import { FarmStamp, FarmStampNew } from 'src/components/icon/FarmStamp';
import { ChartLoading } from 'src/components/icon/Loading';
import { PoolSlippageSelector } from 'src/components/forms/SlippageSelector';
import { Link } from 'react-router-dom';
import { canFarm } from 'src/services/pool';
import {
  calculateFairShare,
  calculateFeePercent,
  percent,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  toRoundedReadableNumber,
} from '../../utils/numbers';
import { ftGetTokenMetadata, TokenMetadata } from 'src/services/ft-contract';
import Alert from 'src/components/alert/Alert';
import InputAmount from 'src/components/forms/InputAmount';
import { isMobile } from 'src/utils/device';
import ReactModal from 'react-modal';
import { toRealSymbol } from 'src/utils/token';

import { ModalClose } from 'src/components/icon';
import { useHistory } from 'react-router';
import { getPool } from 'src/services/indexer';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage, useIntl, FormattedRelativeTime } from 'react-intl';
import {
  WatchListStartFull,
  WatchListStartFullMobile,
} from 'src/components/icon/WatchListStar';
import {
  SolidButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from 'src/components/button/Button';
import { wallet } from 'src/services/near';
import { BreadCrumb } from 'src/components/layout/BreadCrumb';
import { LP_TOKEN_DECIMALS } from '../../services/m-token';
import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Line,
  BarProps,
  Tooltip,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';

import _ from 'lodash';
import moment from 'moment';
import { ChartNoData } from 'src/components/icon/ChartNoData';
import {
  getCurrentWallet,
  WalletContext,
} from '../../utils/wallets-integration';

import {
  useWalletTokenBalances,
  useDepositableBalance,
} from '../../state/token';
import {
  scientificNotationToString,
  toInternationalCurrencySystemLongString,
} from '../../utils/numbers';
import { isNotStablePool, canFarmV2, canFarmV1 } from '../../services/pool';
import { isStablePool, BLACKLIST_POOL_IDS } from '../../services/near';

export const REF_FI_PRE_LIQUIDITY_ID_KEY = 'REF_FI_PRE_LIQUIDITY_ID_VALUE';

import { useWalletSelector } from '../../context/WalletSelectorContext';
import { WRAP_NEAR_CONTRACT_ID } from 'src/services/wrap-near';
import { useAccountInfo, LOVE_TOKEN_DECIMAL } from '../../state/referendum';
import { getVEPoolId } from '../ReferendumPage';
import getConfig from '../../services/config';
import { BoostInputAmount } from '../../components/forms/InputAmount';
import { ExternalLinkIcon } from 'src/components/icon/Risk';
import {
  FaAngleDown,
  FaAngleUp,
  HiOutlinePlusSm,
} from '../../components/reactIcons';
import { useClientMobile, isClientMobie } from '../../utils/device';
import { getPoolFeeApr, getPoolListFarmAprTip } from './utils';
import { Images, Symbols } from '../../components/stableswap/CommonComp';
import { useTokenPriceList } from '../../state/token';
import { ExchangeArrow } from '../../components/icon/Arrows';
import { multiply, divide, calculateFeeCharge } from '../../utils/numbers';

import {
  useSeedFarms,
  useSeedDetail,
  useYourliquidity,
} from '../../state/pool';
import { FarmBoost } from '../../services/farm';
import { FarmBoardInDetailPool, Fire } from '../../components/icon/V3';
import {
  WatchListStartEmpty,
  WatchListStartEmptyMobile,
} from '../../components/icon/WatchListStar';
import {
  ExclamationTip,
  QuestionTip,
} from '../../components/layout/TipWrapper';

import { NoLiquidityDetailPageIcon } from '../../components/icon/Pool';
import { useFarmStake } from '../../state/farm';
import { VEARROW } from '../../components/icon/Referendum';
import BLACKTip from '../../components/pool/BLACKTip';
import Big from 'big.js';
import {
  getEffectiveFarmList,
  sort_tokens_by_base,
} from 'src/services/commonV3';
import { openUrl } from '../../services/commonV3';
import { numberWithCommas } from '../Orderly/utiles';
import { HiOutlineExternalLink, HiOutlineLink } from 'react-icons/hi';

import { PoolRefreshModal } from './PoolRefreshModal';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import {
  constTransactionPage,
  useTranstionsExcuteDataStore,
} from '../../stores/transtionsExcuteData';
import { PageContainer } from '../../components/layout/PageContainer';

export default function Container(props: any) {
  return (
    <PageContainer>
      <PoolDetailsPage {...props} />
    </PageContainer>
  );
}

const { BLACK_TOKEN_LIST } = getConfig();

interface ParamTypes {
  id: string;
}

interface LocationTypes {
  tvl: number;
  backToFarms: boolean;
}
export type ChartType = 'volume' | 'tvl' | 'liquidity';
const ONLY_ZEROS = /^0*\.?0*$/;

const REF_FI_RECENT_TRANSACTION_TAB_KEY = 'REF_FI_RECENT_TRANSACTION_TAB_KEY';

const formatDate = (rawDate: string) => {
  const date = rawDate
    .split('-')
    .map((t) => (t.length >= 2 ? t : t.padStart(2, '0')))
    .join('-');

  return moment(date).format('ll');
};

export function getPoolFee24h(dayVolume: string, pool: Pool) {
  let result = 0;
  if (dayVolume) {
    const { fee } = pool;

    const revenu24h = (fee / 10000) * Number(dayVolume) * 0.8;

    result = revenu24h;
  }
  return Number(result);
}

function Icon(props: { icon?: string; className?: string; style?: any }) {
  const { icon, className, style } = props;
  return icon ? (
    <img
      className={`block ${className} rounded-full border border-gradientFromHover border-solid`}
      src={icon}
      style={style}
    />
  ) : (
    <div
      className={`rounded-full ${className} border border-gradientFromHover  border-solid`}
      style={style}
    />
  );
}

export const GetExchangeRate = ({
  tokens,
  pool,
  token0Price,
}: {
  tokens: any;
  pool: any;
  token0Price?: string;
}) => {
  const first_token_num = toReadableNumber(
    tokens[0].decimals ?? 24,
    pool.supplies[tokens[0].id]
  );
  const second_token_num = toReadableNumber(
    tokens[1].decimals ?? 24,
    pool.supplies[tokens[1].id]
  );
  const rate = Number(second_token_num) / Number(first_token_num);

  const showRate =
    rate < 0.001 ? '< 0.001' : '= ' + numberWithCommas(rate.toFixed(3));

  return Number(first_token_num) === 0 ? (
    <div className="px-1 border border-transparent">&nbsp;</div>
  ) : (
    <div className="text-white text-center text-sm px-1  rounded-sm  whitespace-nowrap">
      <span>
        1&nbsp;{toRealSymbol(tokens[0].symbol)}
        {!token0Price ? null : (
          <span className="text-primaryText">
            (${toInternationalCurrencySystemLongString(token0Price, 2)})
          </span>
        )}
        &nbsp;
        <span title={`${rate}`} className="font-sans">
          {showRate}
        </span>
        &nbsp;{toRealSymbol(tokens[1].symbol)}
      </span>
    </div>
  );
};

function DetailIcons({ tokens }: { tokens: TokenMetadata[] }) {
  return (
    <div className="flex items-center">
      {tokens.map((token, index) => {
        return token.icon ? (
          <img
            src={token.icon}
            className={`w-6 h-6 rounded-full border border-gradientFrom bg-cardBg ${
              index != 0 ? '-ml-1' : ''
            }`}
            alt=""
          />
        ) : (
          <div
            className={`w-6 h-6 rounded-full border border-gradientFrom bg-cardBg ${
              index != 0 ? '-ml-1' : ''
            }`}
          ></div>
        );
      })}
    </div>
  );
}

function DetailSymbol({
  tokens,
  id,
}: {
  tokens: TokenMetadata[];
  id: string | number;
}) {
  return (
    <div className="text-sm text-white flex items-center">
      <span className="pl-2">
        {tokens.map((token) => toRealSymbol(token.symbol)).join('-')}
      </span>

      <span
        className="cursor-pointer pl-2 py-0.5 text-gradientFrom"
        onClick={() => openUrl(`/pool/${id}`)}
      >
        <ExternalLinkIcon />
      </span>
    </div>
  );
}

function PoolDetailCard({
  tokens_o,
  pool,
}: {
  tokens_o: TokenMetadata[];
  pool: Pool;
}) {
  const tokens: TokenMetadata[] = tokens_o
    ? JSON.parse(JSON.stringify(tokens_o))
    : [];
  tokens?.sort((a, b) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
    return 0;
  });
  const [showDetail, setShowDetail] = useState(false);

  const [poolTVL, setPoolTVl] = useState<string>('');
  const h24Volume = useDayVolume(pool.id.toString());

  useEffect(() => {
    getPool(pool.id.toString()).then((pool) => {
      setPoolTVl(pool.tvl.toString());
    });
  }, []);

  const DetailRow = ({
    value,
    valueTitle,
    title,
  }: {
    value: JSX.Element | string;
    valueTitle?: string;
    title: JSX.Element | string;
  }) => {
    return (
      <div className="flex items-center justify-between pt-4">
        <div className="text-farmText">{title}</div>
        <div className="text-white" title={valueTitle}>
          {value}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-cardBg mt-4 rounded-2xl p-6 text-xs w-full right-0">
      <div className="detail-header flex items-center justify-between">
        <div className="flex items-center">
          <DetailIcons tokens={tokens} />
          <DetailSymbol tokens={tokens} id={pool.id} />
        </div>
        <div
          className="cursor-pointer text-gradientFrom flex items-center"
          onClick={() => setShowDetail(!showDetail)}
        >
          <span>
            <FormattedMessage id="pool_stats" defaultMessage="Pool Stats" />
          </span>
          <span>
            <div className="pl-1">
              {showDetail ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </span>
        </div>
      </div>
      {!showDetail ? null : (
        <>
          {' '}
          <DetailRow
            title={
              <FormattedMessage
                id="TVL"
                defaultMessage={'TVL'}
              ></FormattedMessage>
            }
            value={
              !poolTVL
                ? '-'
                : `$${
                    Number(poolTVL) < 0.01 && Number(poolTVL) > 0
                      ? '< 0.01'
                      : toInternationalCurrencySystem(poolTVL || '0', 2)
                  }`
            }
            valueTitle={poolTVL}
          />
          <DetailRow
            title={toRealSymbol(tokens[0].symbol)}
            value={toInternationalCurrencySystem(
              toReadableNumber(tokens[0].decimals, pool.supplies[tokens[0].id]),
              2
            )}
            valueTitle={toReadableNumber(
              tokens[0].decimals,
              pool.supplies[tokens[0].id]
            )}
          />
          <DetailRow
            title={toRealSymbol(tokens[1].symbol)}
            value={toInternationalCurrencySystem(
              toReadableNumber(tokens[1].decimals, pool.supplies[tokens[1].id]),
              2
            )}
            valueTitle={toReadableNumber(
              tokens[1].decimals,
              pool.supplies[tokens[1].id]
            )}
          />
          <DetailRow
            title={
              <FormattedMessage id="h24_volume" defaultMessage="24h volume" />
            }
            value={
              h24Volume ? toInternationalCurrencySystem(h24Volume, 2) : '-'
            }
            valueTitle={h24Volume || ''}
          />
          <DetailRow
            title={
              <FormattedMessage
                id="Fee"
                defaultMessage="Fee"
              ></FormattedMessage>
            }
            value={`${pool.fee / 100}%`}
          />
        </>
      )}
    </div>
  );
}

function AddLiquidity(props: { pool: Pool; tokens: TokenMetadata[] }) {
  const { pool, tokens } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [messageId, setMessageId] = useState<string>('add_liquidity');
  const [defaultMessage, setDefaultMessage] = useState<string>('Add Liquidity');
  const balances = useWalletTokenBalances(tokens.map((token) => token.id));

  const nearBalance = useDepositableBalance('NEAR');

  const [error, setError] = useState<Error>();
  const intl = useIntl();
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [canDeposit, setCanDeposit] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [preShare, setPreShare] = useState(null);
  const [modal, setModal] = useState(null);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  balances && (balances[WRAP_NEAR_CONTRACT_ID] = nearBalance);
  const processTransactionPending = useTranstionsExcuteDataStore(
    (state) => state.processTransactionPending
  );
  const processTransactionSuccess = useTranstionsExcuteDataStore(
    (state) => state.processTransactionSuccess
  );
  const processTransactionError = useTranstionsExcuteDataStore(
    (state) => state.processTransactionError
  );

  const changeFirstTokenAmount = (amount: string) => {
    setError(null);
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setFirstTokenAmount(amount);
      const zero = new BigNumber('0');
      if (
        zero.isLessThan(secondTokenAmount || '0') &&
        zero.isLessThan(amount || '0')
      ) {
        setPreShare(1);
      } else {
        setPreShare(null);
      }
      try {
        validate({
          firstAmount: amount,
          secondAmount: secondTokenAmount,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[0].decimals, amount),
        totalContribution: pool.supplies[tokens[0].id],
      });
      let secondAmount = '';
      if (amount) {
        secondAmount = toReadableNumber(
          tokens[1].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[1].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        );
      }
      setFirstTokenAmount(amount);
      setSecondTokenAmount(secondAmount);
      setPreShare(toReadableNumber(24, fairShares));
      try {
        validate({
          firstAmount: amount,
          secondAmount,
        });
      } catch (error) {
        setError(error);
      }
    }
  };

  const changeSecondTokenAmount = (amount: string) => {
    setError(null);
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setSecondTokenAmount(amount);
      const zero = new BigNumber('0');
      if (
        zero.isLessThan(firstTokenAmount || '0') &&
        zero.isLessThan(amount || '0')
      ) {
        setPreShare(1);
      } else {
        setPreShare(null);
      }
      try {
        validate({
          firstAmount: firstTokenAmount,
          secondAmount: amount,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[1].decimals, amount),
        totalContribution: pool.supplies[tokens[1].id],
      });
      let firstAmount = '';
      if (amount) {
        firstAmount = toReadableNumber(
          tokens[0].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[0].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        );
      }
      ``;
      setSecondTokenAmount(amount);
      setFirstTokenAmount(firstAmount);
      setPreShare(toReadableNumber(24, fairShares));
      try {
        validate({
          firstAmount,
          secondAmount: amount,
        });
      } catch (error) {
        setError(error);
      }
    }
  };
  useEffect(() => {
    validate({
      firstAmount: firstTokenAmount,
      secondAmount: secondTokenAmount,
    });
  }, [balances]);
  const getMax = function (id: string, amount: string) {
    return id !== WRAP_NEAR_CONTRACT_ID
      ? amount
      : Number(amount) <= 0.5
      ? '0'
      : String(Number(amount) - 0.5);
  };

  const firstTokenBalanceBN =
    tokens[0] && balances
      ? new BigNumber(
          getMax(
            tokens[0].id,
            toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
          )
        )
      : new BigNumber(0);

  const secondTokenBalanceBN =
    tokens[1] && balances
      ? new BigNumber(
          getMax(
            tokens[1].id,
            toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
          )
        )
      : new BigNumber(0);

  function validate({
    firstAmount,
    secondAmount,
  }: {
    firstAmount: string;
    secondAmount: string;
  }) {
    const firstTokenAmountBN = new BigNumber(firstAmount.toString());

    const secondTokenAmountBN = new BigNumber(secondAmount.toString());

    setCanSubmit(false);
    setCanDeposit(false);
    if (firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN)) {
      setCanDeposit(true);
      const { id, decimals } = tokens[0];
      const modalData: any = {
        token: tokens[0],
        action: 'deposit',
      };
      getDepositableBalance(id, decimals).then((nearBalance) => {
        modalData.max = nearBalance;
        setModal(Object.assign({}, modalData));
      });
      setModal(modalData);

      return;
    }

    if (secondTokenAmountBN.isGreaterThan(secondTokenBalanceBN)) {
      setCanDeposit(true);
      const { id, decimals } = tokens[1];
      const modalData: any = {
        token: tokens[1],
        action: 'deposit',
      };
      getDepositableBalance(id, decimals).then((nearBalance) => {
        modalData.max = nearBalance;
        setModal(Object.assign({}, modalData));
      });
      setModal(modalData);
      return;
    }

    if (ONLY_ZEROS.test(firstAmount)) {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      return;
    }

    if (ONLY_ZEROS.test(secondAmount)) {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      return;
    }

    if (!tokens[0]) {
      throw new Error(
        `${tokens[0].id} ${intl.formatMessage({
          id: 'is_not_exist',
        })}`
      );
    }

    if (!tokens[1]) {
      throw new Error(
        `${tokens[1].id} ${intl.formatMessage({
          id: 'is_not_exist',
        })}`
      );
    }

    setCanSubmit(true);
    setMessageId('add_liquidity');
    setDefaultMessage('Add Liquidity');
  }

  async function submit() {
    const transactionId = String(Date.now());
    try {
      processTransactionPending({
        transactionId,
        page: constTransactionPage.pool,
        data: {
          prefix: 'Supplying',
          tokens: [
            {
              token: tokens[0],
              amount: firstTokenAmount,
            },
            {
              symbol: '+',
            },
            {
              token: tokens[1],
              amount: secondTokenAmount,
            },
          ],
        },
      });
      setButtonLoading(false);
      const { response } = await addLiquidityToPool({
        id: pool.id,
        tokenAmounts: [
          { token: tokens[0], amount: firstTokenAmount },
          { token: tokens[1], amount: secondTokenAmount },
        ],
      });
      processTransactionSuccess({
        transactionResponse: response,
        transactionId,
      });
      setButtonLoading(false);
    } catch (e) {
      processTransactionError({
        error: e,
        transactionId,
      });
      setButtonLoading(false);
    }
  }

  const ButtonRender = () => {
    if (!isSignedIn) {
      return <ConnectToNearBtn />;
    }

    const handleClick = async () => {
      if (canSubmit) {
        setButtonLoading(true);
        submit();
      }
    };
    return (
      <SolidButton
        disabled={!canSubmit || canDeposit}
        className="btn-add-liq-detail focus:outline-none  w-full text-lg"
        onClick={handleClick}
        loading={buttonLoading}
        padding={'p-4'}
      >
        <div className="flex items-center justify-center w-full m-auto">
          <div>
            <ButtonTextWrapper
              loading={buttonLoading}
              Text={() => (
                <FormattedMessage
                  id={messageId}
                  defaultMessage={defaultMessage}
                />
              )}
            />
          </div>
        </div>
      </SolidButton>
    );
  };

  const shareDisplay = () => {
    let result = '';
    let percentShare = '';
    let displayPercentShare = '';
    if (preShare && new BigNumber('0').isLessThan(preShare)) {
      const myShareBig = new BigNumber(preShare);
      if (myShareBig.isLessThan('0.001')) {
        result = '<0.001';
      } else {
        result = `${myShareBig.toFixed(3)}`;
      }
    } else {
      result = '-';
    }

    if (result !== '-') {
      percentShare = `${percent(
        preShare,
        scientificNotationToString(
          new BigNumber(toReadableNumber(24, pool.shareSupply))
            .plus(new BigNumber(preShare))
            .toString()
        )
      )}`;

      if (Number(percentShare) > 0 && Number(percentShare) < 0.01) {
        displayPercentShare = '< 0.01%';
      } else {
        displayPercentShare = `${toPrecision(percentShare, 2)}%`;
      }
    }

    return {
      lpTokens: result,
      shareDisplay: displayPercentShare,
    };
  };

  return (
    <div className="text-white outline-none ">
      <div className="mt-8">
        <div className="flex justify-end items-center text-sm text-right mb-1.5 text-farmText">
          <FormattedMessage id="balance" defaultMessage="Balance" />
          {':'}
          <span
            className="ml-1"
            title={toReadableNumber(
              tokens[0].decimals,
              balances?.[tokens[0].id]
            )}
          >
            {isSignedIn
              ? toPrecision(
                  toReadableNumber(
                    tokens[0].decimals,
                    balances?.[tokens[0].id]
                  ),
                  2,
                  true
                )
              : '-'}
          </span>
        </div>
        <div className="flex items-center">
          <BoostInputAmount
            className="w-full border border-transparent rounded"
            max={getMax(
              tokens[0].id,
              toReadableNumber(tokens[0].decimals, balances?.[tokens[0].id])
            )}
            onChangeAmount={changeFirstTokenAmount}
            value={firstTokenAmount}
            tokenSymbol={toRealSymbol(tokens[0].symbol)}
          />
        </div>
      </div>
      <div className="my-8">
        <div className="flex justify-end items-center text-sm text-right mb-1.5 text-farmText">
          <FormattedMessage id="balance" defaultMessage="Balance" />
          {':'}
          <span
            className="ml-1"
            title={toReadableNumber(
              tokens[1].decimals,
              balances?.[tokens[1].id]
            )}
          >
            {isSignedIn
              ? toPrecision(
                  toReadableNumber(
                    tokens[1].decimals,
                    balances?.[tokens[1].id]
                  ),
                  2,
                  true
                )
              : '-'}
          </span>
        </div>
        <div className="flex items-center ">
          <BoostInputAmount
            className="w-full border border-transparent rounded"
            max={getMax(
              tokens[1].id,
              toReadableNumber(tokens[1].decimals, balances?.[tokens[1].id])
            )}
            onChangeAmount={changeSecondTokenAmount}
            value={secondTokenAmount}
            tokenSymbol={toRealSymbol(tokens[1].symbol)}
          />
        </div>
      </div>
      {error ? (
        <div className="flex justify-center mb-8 ">
          <Alert level="warn" message={error.message} />
        </div>
      ) : null}
      <div className=" text-farmText text-sm mt-6 mb-4  px-2 rounded-lg">
        <div className="flex items-center justify-between">
          <label>
            <FormattedMessage id="lp_tokens" defaultMessage={'LP tokens'} />
          </label>
          <span className="text-white text-sm">
            {shareDisplay().lpTokens || '-'}
          </span>
        </div>
        <div className="flex items-center justify-between pt-4">
          <label>
            <FormattedMessage id="Share" defaultMessage="Share" />
          </label>
          <span className="text-white text-sm">
            {shareDisplay().shareDisplay || '-'}
          </span>
        </div>
      </div>
      {canDeposit ? (
        <div
          id="classic-pool-add-liquidity"
          className="rounded-md mb-6 px-4 text-center xs:px-2  text-base"
        >
          <label className="text-warnColor ">
            <FormattedMessage id="oops" defaultMessage="Oops" />!
          </label>
          <label className="ml-2.5 text-warnColor ">
            {modal?.token?.id === WRAP_NEAR_CONTRACT_ID &&
            (tokens[0].id === WRAP_NEAR_CONTRACT_ID
              ? Number(firstTokenBalanceBN) - Number(firstTokenAmount) < 0.5
              : Number(secondTokenBalanceBN) - Number(secondTokenAmount) <
                0.5) ? (
              <FormattedMessage id="near_validation_error" />
            ) : (
              <>
                <FormattedMessage id="you_do_not_have_enough" />{' '}
                {toRealSymbol(modal?.token?.symbol)}.
              </>
            )}
          </label>
        </div>
      ) : null}
      <ButtonRender />
    </div>
  );
}

export function AddLiquidityModal(props: any) {
  const { pool, tokens } = props;
  return (
    <CommonModal {...props}>
      <AddLiquidity pool={pool} tokens={tokens} />
    </CommonModal>
  );
}
function CommonModal(props: any) {
  const { isOpen, onRequestClose, tokens, pool } = props;

  const isMobile = useClientMobile();

  const cardWidth = isMobile ? '90vw' : '30vw';
  const cardHeight = isMobile ? '90vh' : '80vh';

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div className="flex flex-col">
        <div
          className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-cardBg overflow-auto"
          style={{
            width: cardWidth,
            maxHeight: cardHeight,
            border: '1px solid rgba(0, 198, 162, 0.5)',
          }}
        >
          <div className="title flex items-center justify-between">
            <div className="flex items-center">
              <label className="text-white text-xl">
                <FormattedMessage id={'add_liquidity'}></FormattedMessage>
              </label>
            </div>
            <ModalClose className="cursor-pointer" onClick={onRequestClose} />
          </div>
          {props.children}
        </div>
        {props.subChildren ? (
          <div style={{ width: cardWidth }}>{props.subChildren}</div>
        ) : (
          <PoolDetailCard tokens_o={tokens} pool={pool} />
        )}
      </div>
    </Modal>
  );
}

export function RemoveLiquidityModal(
  props: ReactModal.Props & {
    pool: Pool;
    shares: string;
    tokens: TokenMetadata[];
  }
) {
  const { pool, shares, tokens } = props;
  const [amount, setAmount] = useState<string>('');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const { minimumAmounts, removeLiquidity } = useRemoveLiquidity({
    pool,
    slippageTolerance,
    shares: amount ? toNonDivisibleNumber(24, amount) : '0',
  });
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const cardWidth = isMobile() ? '95vw' : '30vw';
  const intl = useIntl();

  const poolId = Number(pool.id);

  const [farmCountV1, setFarmCountV1] = useState<number>(0);
  const [farmCountV2, setFarmCountV2] = useState<number>(0);

  const [endedFarmCountV1, setEndedFarmCountV1] = useState<number>(0);
  const [endedFarmCountV2, setEndedFarmCountV2] = useState<number>(0);
  canFarmV1(poolId).then(({ count, version, endedCount }) => {
    setFarmCountV1(count);
    setEndedFarmCountV1(endedCount);
  });

  canFarmV2(poolId).then(({ count, version, endedCount }) => {
    setFarmCountV2(count);
    setEndedFarmCountV2(endedCount);
  });

  const { stakeList, v2StakeList, finalStakeList } = useYourliquidity(poolId);
  const processTransactionPending = useTranstionsExcuteDataStore(
    (state) => state.processTransactionPending
  );
  const processTransactionSuccess = useTranstionsExcuteDataStore(
    (state) => state.processTransactionSuccess
  );
  const processTransactionError = useTranstionsExcuteDataStore(
    (state) => state.processTransactionError
  );

  const farmStakeV1 = useFarmStake({ poolId, stakeList });
  const farmStakeV2 = useFarmStake({ poolId, stakeList: v2StakeList });
  const farmStakeTotal = useFarmStake({ poolId, stakeList: finalStakeList });

  const { lptAmount, fetchDoneVOTEAccountInfo } =
    !!getConfig().REF_VE_CONTRACT_ID && poolId === Number(getVEPoolId())
      ? useAccountInfo()
      : { lptAmount: '0', fetchDoneVOTEAccountInfo: true };

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const sharePercent = percent(shares || '0', pool.shareSupply || '1');

  function submit() {
    const transactionId = String(Date.now());
    const amountBN = new BigNumber(amount?.toString());
    const shareBN = new BigNumber(toReadableNumber(24, shares));
    if (Number(amount) === 0) {
      throw new Error(
        intl.formatMessage({ id: 'must_input_a_value_greater_than_zero' })
      );
    }
    if (amountBN.isGreaterThan(shareBN)) {
      throw new Error(
        intl.formatMessage({
          id: 'input_greater_than_available_shares',
        })
      );
    }
    setButtonLoading(true);
    let tokensNode = [];

    let tokensName = '';

    tokens?.forEach((d, i) => {
      tokensName += `${i !== 0 ? '-' : ''}${d?.symbol}`;
    });

    tokensNode = [
      {
        tokenGroup: tokens,
      },
    ];
    console.log('amountamount', amount);
    processTransactionPending({
      transactionId,
      page: constTransactionPage.pool,
      data: {
        prefix: 'Removing',
        tokens: tokensNode,
        suffix: `${toPrecision(
          amount,
          3,
          false,
          false,
          true
        )} ${tokensName} LP tokens`,
      },
    });
    setButtonLoading(false);
    localStorage.setItem(REF_FI_PRE_LIQUIDITY_ID_KEY, pool.id.toString());
    return removeLiquidity()
      .then(({ response }) => {
        setButtonLoading(false);
        processTransactionSuccess({
          transactionId,
          transactionResponse: response,
        });
      })
      .catch((e) => {
        setButtonLoading(false);
        processTransactionError({
          error: e,
          transactionId,
        });
      });
  }

  function handleChangeAmount(value: string) {
    setAmount(value);
    setError(null);

    const amountBN = new BigNumber(value.toString());
    const shareBN = new BigNumber(toReadableNumber(24, shares));
    if (amountBN.isGreaterThan(shareBN)) {
      setCanSubmit(false);
      throw new Error(
        intl.formatMessage({
          id: 'input_greater_than_available_shares',
        })
      );
    }
    if (ONLY_ZEROS.test(value)) {
      setCanSubmit(false);
      return;
    }
    setCanSubmit(true);
  }

  return (
    <Modal {...props}>
      <Card
        padding="p-8"
        bgcolor="bg-cardBg"
        className="text-white border border-gradientFromHover outline-none "
        style={{
          width: cardWidth,
          border: '1px solid rgba(0, 198, 162, 0.5)',
        }}
      >
        <div className="flex items-start justify-between">
          <div className="text-base pb-4">
            <FormattedMessage
              id="remove_liquidity"
              defaultMessage="Remove Liquidity"
            />
          </div>
          <div
            className="ml-2 cursor-pointer p-1"
            onClick={props.onRequestClose}
          >
            <ModalClose />
          </div>
        </div>

        <div
          className={`flex items-center flex-wrap mb-4  text-xs text-primaryText  ${
            Number(farmStakeV1) > 0 || Number(farmStakeV2) > 0 ? '' : 'hidden'
          }`}
        >
          {Number(farmStakeV1) > 0 && (
            <Link
              to={{
                pathname: '/farms',
              }}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="hover:text-gradientFrom rounded-lg py-1.5 px-2 bg-black bg-opacity-20 mb-1.5 flex mr-2"
            >
              <span>
                {toPrecision(
                  toReadableNumber(
                    24,
                    scientificNotationToString(farmStakeV1.toString())
                  ),
                  2
                )}
              </span>
              <span className="mx-1">
                <FormattedMessage id="in" defaultMessage={'in'} />
              </span>
              <div className=" flex items-center flex-shrink-0">
                <span className="">
                  Legacy &nbsp;
                  <FormattedMessage id="farm" defaultMessage={'Farm'} />
                </span>

                <span className="ml-0.5">
                  <VEARROW />
                </span>
              </div>
            </Link>
          )}

          {Number(farmStakeV2) > 0 && (
            <Link
              to={{
                pathname: `/v2farms/${pool.id}-${
                  endedFarmCountV2 === farmCountV2 ? 'e' : 'r'
                }`,
              }}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="hover:text-gradientFrom mb-1.5 mr-2 flex rounded-lg py-1.5 px-2 bg-black bg-opacity-20"
            >
              <span>
                {toPrecision(
                  toReadableNumber(
                    24,
                    scientificNotationToString(farmStakeV2.toString())
                  ),
                  4
                )}
              </span>
              <span className="mx-1">
                <FormattedMessage id="in" defaultMessage={'in'} />
              </span>
              <div className=" flex items-center  flex-shrink-0">
                <span className="">
                  Classic&nbsp;
                  <FormattedMessage id="farm" defaultMessage={'Farm'} />
                </span>

                <span className="ml-0.5">
                  <VEARROW />
                </span>
              </div>
            </Link>
          )}

          {Number(getVEPoolId()) === Number(pool.id) &&
          fetchDoneVOTEAccountInfo &&
          !!getConfig().REF_VE_CONTRACT_ID ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openUrl('/referendum');
              }}
              className="hover:text-gradientFrom mb-1.5 cursor-pointer flex rounded-lg py-1.5 px-2 bg-black bg-opacity-20"
            >
              <span>
                {toPrecision(
                  ONLY_ZEROS.test(
                    toNonDivisibleNumber(
                      LOVE_TOKEN_DECIMAL,
                      toReadableNumber(24, lptAmount || '0')
                    )
                  )
                    ? '0'
                    : toReadableNumber(24, lptAmount || '0'),
                  2
                )}
              </span>
              <span className="mx-1">
                <FormattedMessage id="locked" defaultMessage={'locked'} />
              </span>
              <span className="mr-1">
                <FormattedMessage id="in" defaultMessage={'in'} />
              </span>
              <div className="flex items-center flex-shrink-0">
                <span className="">
                  <FormattedMessage id="vote_capital" defaultMessage={'VOTE'} />
                </span>
                <span className="ml-0.5">
                  <VEARROW />
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <div className="text-sm text-right mb-2 text-primaryText flex items-center justify-between">
            <FormattedMessage
              id="available_lp_tokens"
              defaultMessage="Available LP Tokens"
            />
            <span className="text-white whitespace-nowrap">
              {`${toPrecision(toReadableNumber(24, shares), 2)} (${
                Number(sharePercent) > 0 && Number(sharePercent) < 0.01
                  ? '<0.01'
                  : toPrecision(sharePercent?.toString() || '0', 2)
              }%)`}
            </span>
          </div>
          <div className=" overflow-hidden ">
            <InputAmount
              maxBorder={false}
              value={amount}
              max={toReadableNumber(24, shares)}
              onChangeAmount={(value) => {
                try {
                  handleChangeAmount(value);
                } catch (error) {
                  setError(error);
                }
              }}
              className="border border-transparent rounded"
            />
          </div>
        </div>
        <div className="pt-4 mb-8">
          <PoolSlippageSelector
            slippageTolerance={slippageTolerance}
            onChange={setSlippageTolerance}
          />
        </div>
        {amount && Number(pool.shareSupply) != 0 ? (
          <>
            <p className="my-3 text-left text-sm text-primaryText">
              <FormattedMessage
                id="minimum_tokens_out"
                defaultMessage="Minimum shares"
              />
            </p>
            <section className="grid grid-cols-2 mb-6 w-full">
              {Object.entries(minimumAmounts).map(
                ([tokenId, minimumAmount], i) => {
                  const token = tokens.find((t) => t.id === tokenId);
                  return (
                    <section
                      key={tokenId}
                      className="flex flex-col items-center col-span-1"
                    >
                      <Icon icon={token.icon} className="h-9 w-9" />
                      <span className="m-1 mb-2 text-sm text-primaryText">
                        {token.symbol}{' '}
                      </span>
                      <span className="ml-2 text-base font-bold">
                        {toInternationalCurrencySystem(
                          toPrecision(
                            toReadableNumber(token.decimals, minimumAmount),
                            4
                          ),
                          4
                        )}
                      </span>
                    </section>
                  );
                }
              )}
            </section>
          </>
        ) : null}
        <div className="flex justify-center mb-2">
          {error && <Alert level="warn" message={error.message} />}
        </div>
        <div className="">
          {isSignedIn ? (
            <SolidButton
              disabled={!canSubmit || buttonLoading}
              className={`btn-detail-remove-liq focus:outline-none px-4 w-full`}
              onClick={async () => {
                try {
                  await submit();
                } catch (error) {
                  setError(error);
                }
              }}
              loading={buttonLoading}
            >
              <ButtonTextWrapper
                loading={buttonLoading}
                Text={() => (
                  <FormattedMessage
                    id="remove_liquidity"
                    defaultMessage="Remove Liquidity"
                  />
                )}
              />
            </SolidButton>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </Card>
    </Modal>
  );
}

function MyShares({
  shares,
  totalShares,
  poolId,
  stakeList = {},
  decimal,
  lptAmount,
}: {
  shares: string;
  totalShares: string;
  poolId?: number;
  stakeList?: Record<string, string>;
  decimal?: number;
  yourLP?: boolean;
  lptAmount?: string;
}) {
  if (!shares || !totalShares) return <div>-</div>;
  const seedIdList: string[] = Object.keys(stakeList);
  let farmStake: string | number = '0';
  seedIdList.forEach((seed) => {
    const id = Number(seed.split('@')[1]);
    if (id == poolId) {
      farmStake = BigNumber.sum(farmStake, stakeList[seed]).valueOf();
    }
  });

  const userTotalShare = BigNumber.sum(
    shares,
    farmStake,
    Number(poolId) === Number(getVEPoolId()) ? lptAmount || '0' : '0'
  );
  let sharePercent = percent(userTotalShare.valueOf(), totalShares);

  let displayPercent;
  if (Number.isNaN(sharePercent) || sharePercent === 0) displayPercent = '0';
  else if (sharePercent < 0.01)
    displayPercent = `< ${
      decimal ? '0.'.padEnd(decimal + 1, '0') + '1' : '0.01'
    }`;
  else displayPercent = toPrecision(String(sharePercent), decimal || 2);

  function displayValue() {
    const v = toReadableNumber(
      LP_TOKEN_DECIMALS,
      userTotalShare
        .toNumber()
        .toLocaleString('fullwide', { useGrouping: false })
    );
    const v_big = new BigNumber(v);
    if (v_big.isEqualTo('0')) {
      return 0;
    } else if (v_big.isLessThan(0.01)) {
      return '0.01';
    } else {
      return toInternationalCurrencySystemLongString(v, 2);
    }
  }

  return (
    <div className="whitespace-nowrap">
      <span
        className="whitespace-nowrap font-bold"
        title={`${toPrecision(
          toReadableNumber(
            LP_TOKEN_DECIMALS,
            userTotalShare
              .toNumber()
              .toLocaleString('fullwide', { useGrouping: false })
          ),
          2
        )}`}
      >
        {displayValue()}
      </span>{' '}
      {`(${displayPercent}%)`}
    </div>
  );
}

type RencentTabKey = 'swap' | 'liquidity';

export function RecentTransactions({
  tokens,
  pool_id,
}: {
  tokens: TokenMetadata[];
  pool_id: string | number;
}) {
  const { swapTransaction, liquidityTransactions } = useClassicPoolTransaction({
    pool_id,
  });

  const storedTab = sessionStorage.getItem(
    REF_FI_RECENT_TRANSACTION_TAB_KEY
  ) as RencentTabKey;

  const [tab, setTab] = useState<RencentTabKey>(storedTab || 'swap');

  const onChangeTab = (tab: RencentTabKey) => {
    sessionStorage.setItem(REF_FI_RECENT_TRANSACTION_TAB_KEY, tab);
    setTab(tab);
  };

  const renderSwapTransactions = swapTransaction.map((tx) => {
    const swapIn = tokens.find((t) => t.id === tx.token_in);

    const swapOut = tokens.find((t) => t.id === tx.token_out);

    if (!swapIn || !swapOut) return null;

    const swapInAmount = toReadableNumber(swapIn.decimals, tx.swap_in);
    const displayInAmount =
      Number(swapInAmount) < 0.01
        ? '<0.01'
        : numberWithCommas(toPrecision(swapInAmount, 6));

    const swapOutAmount = toReadableNumber(swapOut.decimals, tx.swap_out);

    const displayOutAmount =
      Number(swapOutAmount) < 0.01
        ? '<0.01'
        : numberWithCommas(toPrecision(swapOutAmount, 6));

    const txLink = (
      <a
        rel="noopener  noreferrer nofollow "
        className=" hover:underline ml-2"
        target="_blank"
      >
        <HiOutlineExternalLink className=""></HiOutlineExternalLink>
      </a>
    );

    return (
      <tr
        className={`text-sm lg:grid lg:grid-cols-3 text-primaryText hover:text-white hover:bg-poolRecentHover`}
      >
        <td className="gap-1 p-4 lg:flex items-center">
          <span className="col-span-1 text-white" title={swapInAmount}>
            {displayInAmount}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapIn.symbol)}
          </span>
        </td>

        <td className="col-span-1 gap-1 lg:flex items-center">
          <span className="text-white" title={swapOutAmount}>
            {displayOutAmount}
          </span>

          <span className="ml-1 text-primaryText">
            {toRealSymbol(swapOut.symbol)}
          </span>
        </td>

        <td className="col-span-1 relative flex items-center justify-end py-4 pr-4">
          <span
            className="inline-flex items-center cursor-pointer"
            onClick={() => {
              openUrl(`${getConfig().explorerUrl}/txns/${tx.tx_id}`);
            }}
          >
            <span className="hover:underline cursor-pointer xsm:whitespace-nowrap">
              {tx.timestamp}
            </span>
            {txLink}
          </span>
        </td>
      </tr>
    );
  });

  const renderLiquidityTransactions = liquidityTransactions.map((tx) => {
    const { amounts } = tx;
    const renderTokens: any[] = [];
    const amountsObj: any[] = JSON.parse(amounts.replace(/\'/g, '"'));
    amountsObj.forEach((amount: string, index) => {
      if (Big(amount || 0).gt(0)) {
        renderTokens.push({
          token: tokens[index],
          amount: toReadableNumber(tokens[index].decimals, amountsObj[index]),
        });
      }
    });
    const txLink = (
      <a
        rel="noopener  noreferrer nofollow "
        className=" hover:underline ml-2 "
      >
        <HiOutlineExternalLink className="relative"></HiOutlineExternalLink>
      </a>
    );

    return (
      <tr
        className={`text-sm lg:grid  overflow-hidden py-3 lg:grid-cols-${
          tab == 'swap' ? 3 : 5
        } text-primaryText hover:text-white hover:bg-poolRecentHover`}
      >
        <td className="col-span-1 gap-1 px-4">
          <span className="text-white">
            {tx.method_name.toLowerCase().indexOf('add') > -1 && 'Add'}

            {tx.method_name.toLowerCase().indexOf('remove') > -1 && 'Remove'}
          </span>
        </td>

        <td
          className={`col-span-${
            tab == 'swap' ? 1 : 2
          } text-white lg:flex items-center flex-wrap`}
        >
          {renderTokens.map((renderToken, index) => {
            return (
              <>
                <span className="text-white" title={renderToken.amount}>
                  {formatNumber(renderToken.amount)}
                </span>

                <span className="ml-1 text-primaryText">
                  {toRealSymbol(renderToken.token.symbol)}
                </span>
                {index !== renderTokens.length - 1 ? (
                  <span className="mx-1">+</span>
                ) : null}
              </>
            );
          })}
        </td>

        <td
          className={`col-span-${
            tab == 'swap' ? 1 : 2
          } relative pr-4 lg:flex justify-end`}
        >
          <span
            className="inline-flex cursor-pointer"
            onClick={() => {
              openUrl(`${getConfig().explorerUrl}/txns/${tx.tx_id}`);
            }}
          >
            <span className="hover:underline cursor-pointer xsm:whitespace-nowrap">
              {tx.timestamp}
            </span>
            {txLink}
          </span>
        </td>
      </tr>
    );
  });

  const renderTx =
    tab === 'swap' ? renderSwapTransactions : renderLiquidityTransactions;

  return (
    <>
      <div className="flex lg:items-center lg:justify-between xsm:flex-col xsm:items-start  w-full mb-3 mt-7">
        <div className="text-white font-gothamBold text-base">
          <FormattedMessage
            id="recent_transactions"
            defaultMessage={'Recent Transactions'}
          />
        </div>

        <div className="frcs gap-2 h-8 text-sm text-primaryText xsm:mt-4">
          <div
            className={`rounded-lg frcc cursor-pointer h-full w-28 text-center align-middle ${
              tab === 'swap'
                ? 'text-white bg-inputV3BorderColor '
                : 'bg-detailCardBg'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChangeTab('swap');
            }}
          >
            <FormattedMessage
              id="swap"
              defaultMessage={'Swap'}
            ></FormattedMessage>
          </div>

          <div
            className={`rounded-lg frcc cursor-pointer h-full w-28 text-center align-middle ${
              tab === 'liquidity'
                ? 'text-white bg-inputV3BorderColor '
                : 'bg-detailCardBg'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChangeTab('liquidity');
            }}
          >
            <FormattedMessage
              id="liquidity"
              defaultMessage={'Liquidity'}
            ></FormattedMessage>
          </div>
        </div>
      </div>

      <div className="text-sm overflow-hidden rounded-lg w-full text-primaryText bg-detailCardBg">
        <div
          className={`text-left grid grid-cols-5 w-full border-b border-gray1 xsm:hidden`}
        >
          <div className={`p-4 pb-3 col-span-${tab == 'swap' ? 2 : 1}`}>
            {tab === 'liquidity' && (
              <FormattedMessage
                id="action"
                defaultMessage={'Action'}
              ></FormattedMessage>
            )}
            {tab === 'swap' && (
              <FormattedMessage
                id="from"
                defaultMessage={'From'}
              ></FormattedMessage>
            )}
          </div>

          <div className={`py-4 pb-3 col-span-${tab == 'swap' ? 1 : 2}`}>
            {tab === 'liquidity' && (
              <FormattedMessage
                id="amount"
                defaultMessage={'Amount'}
              ></FormattedMessage>
            )}
            {tab === 'swap' && (
              <FormattedMessage
                id="to"
                defaultMessage={'To'}
              ></FormattedMessage>
            )}
          </div>

          <div className="pr-6 text-right col-span-2 py-4 pb-3">
            <FormattedMessage
              id="time"
              defaultMessage={'Time'}
            ></FormattedMessage>
          </div>
        </div>

        <div
          className="overflow-auto "
          style={{
            maxHeight: '700px',
          }}
        >
          <table className="w-full">
            <tr className={`text-left w-full border-b border-gray1 lg:hidden`}>
              <th className={`p-4 pb-3 col-span-${tab == 'swap' ? 2 : 1}`}>
                {tab === 'liquidity' && (
                  <FormattedMessage
                    id="action"
                    defaultMessage={'Action'}
                  ></FormattedMessage>
                )}
                {tab === 'swap' && (
                  <FormattedMessage
                    id="from"
                    defaultMessage={'From'}
                  ></FormattedMessage>
                )}
              </th>

              <th className={`py-4 pb-3 col-span-${tab == 'swap' ? 1 : 2}`}>
                {tab === 'liquidity' && (
                  <FormattedMessage
                    id="amount"
                    defaultMessage={'Amount'}
                  ></FormattedMessage>
                )}
                {tab === 'swap' && (
                  <FormattedMessage
                    id="to"
                    defaultMessage={'To'}
                  ></FormattedMessage>
                )}
              </th>

              <th className="pr-6 col-span-2 py-4 pb-3">
                <FormattedMessage
                  id="time"
                  defaultMessage={'Time'}
                ></FormattedMessage>
              </th>
            </tr>
            {renderTx}
          </table>
        </div>
      </div>
    </>
  );
}

export const ChartChangeButton = ({
  chartDisplay,
  setChartDisplay,
  className,
  noData,
  showLiqudityButton,
}: {
  chartDisplay: ChartType;
  setChartDisplay: (display: ChartType) => void;
  className?: string;
  noData?: boolean;
  showLiqudityButton?: boolean;
}) => {
  return (
    <div
      className={`text-white text-xs rounded-md p-0.5 flex items-center xs:bg-transparent md:bg-transparent bg-cardBg lg:bg-opacity-50 ${className} ${
        noData ? 'z-20 opacity-70' : ''
      }`}
    >
      {showLiqudityButton ? (
        <button
          className={`py-1 xs:py-2 md:py-2 px-2 ${
            chartDisplay === 'liquidity'
              ? 'rounded-md bg-gradient-to-b from-gradientFrom to-gradientTo'
              : 'text-primaryText'
          }`}
          onClick={() => setChartDisplay('liquidity')}
          style={{
            minWidth: '80px',
          }}
        >
          <FormattedMessage id="liquidity" defaultMessage="Liquidity" />
        </button>
      ) : null}
      <button
        className={`py-1 xs:py-2 md:py-2 px-2 ${
          chartDisplay === 'tvl'
            ? 'rounded-md bg-gradient-to-b from-gradientFrom to-gradientTo'
            : 'text-primaryText'
        }`}
        onClick={() => setChartDisplay('tvl')}
        style={{
          minWidth: '80px',
        }}
      >
        <FormattedMessage id="tvl" defaultMessage="TVL" />
      </button>
      <button
        className={`py-1 xs:py-2 md:py-2 px-2 ${
          chartDisplay === 'volume'
            ? 'rounded-md  bg-gradient-to-b from-gradientFrom to-gradientTo'
            : 'text-primaryText'
        }`}
        onClick={() => setChartDisplay('volume')}
        style={{
          minWidth: '80px',
        }}
      >
        <FormattedMessage id="volume" defaultMessage="Volume" />
      </button>
    </div>
  );
};
export const MobileChartChangeButton = ({
  chartDisplay,
  setChartDisplay,
  noData,
  showLiqudityButton,
}: {
  chartDisplay: ChartType;
  setChartDisplay: (display: ChartType) => void;
  className?: string;
  noData?: boolean;
  showLiqudityButton?: boolean;
}) => {
  return (
    <div className="relative mb-4">
      <div className="flex items-center relative z-10">
        {showLiqudityButton ? (
          <span
            onClick={() => setChartDisplay('liquidity')}
            className={`text-sm text-white text-opacity-60 pb-2.5 border-b-4 border-transparent px-2.5 ${
              chartDisplay === 'liquidity'
                ? 'border-senderHot'
                : 'border-transparent'
            }`}
          >
            <FormattedMessage id="liquidity" defaultMessage="Liquidity" />
          </span>
        ) : null}
        <span
          onClick={() => setChartDisplay('tvl')}
          className={`text-sm text-white text-opacity-60 pb-2.5 border-b-4 px-2.5 mx-3 ${
            chartDisplay === 'tvl' ? 'border-senderHot' : 'border-transparent'
          }`}
        >
          <FormattedMessage id="tvl" defaultMessage="TVL" />
        </span>
        <span
          onClick={() => setChartDisplay('volume')}
          className={`text-sm text-white text-opacity-60 pb-2.5 border-b-4 px-2.5 ${
            chartDisplay === 'volume'
              ? 'border-senderHot'
              : 'border-transparent'
          }`}
        >
          <FormattedMessage id="volume" defaultMessage="Volume" />
        </span>
        <div className="border-b border-menuMoreBoxBorderColor"></div>
      </div>
      <div className="h-px w-full absolute bottom-px left-0 bg-menuMoreBoxBorderColor"></div>
    </div>
  );
};

export function EmptyChart({
  chartDisplay,
  setChartDisplay,
  loading,
  showLiqudityButton,
}: {
  chartDisplay: ChartType;
  setChartDisplay: (display: ChartType) => void;
  loading?: boolean;
  showLiqudityButton?: boolean;
}) {
  const mobile = isMobile();
  return (
    <div className="w-full h-full flex flex-col xsm:items-start justify-between">
      <div className="pb-7 relative z-20">
        <div className="flex items-center justify-between xsm:flex-col-reverse xsm:items-start">
          <div className="text-primaryText text-base float-left">$&nbsp;-</div>
          {mobile ? (
            <MobileChartChangeButton
              noData={true}
              chartDisplay={chartDisplay}
              setChartDisplay={setChartDisplay}
              showLiqudityButton={showLiqudityButton}
            />
          ) : (
            <ChartChangeButton
              className="self-start"
              noData={true}
              chartDisplay={chartDisplay}
              setChartDisplay={setChartDisplay}
              showLiqudityButton={showLiqudityButton}
            />
          )}
        </div>
        <div className="text-xs text-gray-500">-</div>
      </div>

      {/* layout */}
      <div
        className="absolute w-full left-0 top-0 h-full m-auto text-center text-base text-gray-500 flex items-center justify-center opacity-70 z-10"
        style={{
          background: '#001320',
        }}
      >
        {loading ? (
          <ChartLoading />
        ) : (
          <div>
            <div>
              <ChartNoData />
            </div>
            <div>
              <FormattedMessage id="no_data" defaultMessage="No Data" />
            </div>
          </div>
        )}
      </div>

      <div className="xs:hidden md:hidden">
        <div className="border border-gradientFrom w-full mb-2" />
        <div className="flex text-xs text-gray-500 justify-between">
          {[
            '24',
            '31',
            '07',
            '14',
            '21',
            '28',
            '04',
            '11',
            '18',
            '25',
            '02',
            '09',
          ].map((d, i) => {
            return <div key={i}>{d}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

export function VolumeChart({
  data,
  chartDisplay,
  setChartDisplay,
  showLiqudityButton,
}: {
  data: volumeDataType[];
  chartDisplay: 'volume' | 'tvl';
  setChartDisplay: (display: 'volume' | 'tvl') => void;
  showLiqudityButton?: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState<number>(null);

  const baseColor = '#00967B';
  const hoverColor = '#00c6a2';

  const BackgroundRender = (targetBar: BarProps & { index?: number }) => {
    const { x, y, width, height, index } = targetBar;
    if (index === hoverIndex)
      return (
        <path
          x={x}
          y={y}
          fill="#304452"
          width={width}
          height={height}
          fillOpacity={1}
          className="recharts-rectangle recharts-bar-background-rectangle"
          d={
            'M ' + x + ',5 h ' + width + ' v ' + height + ' h ' + -width + ' Z'
          }
        />
      );
    else
      return (
        <path
          x={x}
          y={y}
          fill="#304452"
          width={width}
          height={height}
          fillOpacity={0}
          className="recharts-rectangle recharts-bar-background-rectangle"
        />
      );
  };

  if (!data)
    return (
      <EmptyChart
        chartDisplay={chartDisplay}
        setChartDisplay={setChartDisplay}
        loading={true}
        showLiqudityButton={showLiqudityButton}
      />
    );
  if (data.length === 0)
    return (
      <EmptyChart
        chartDisplay={chartDisplay}
        setChartDisplay={setChartDisplay}
        showLiqudityButton={showLiqudityButton}
      />
    );
  const mobile = isMobile();
  return (
    <>
      <div className="flex items-center justify-between xsm:flex-col-reverse xsm:items-start self-start w-full">
        <div className="flex flex-col">
          <div className="text-white text-2xl">
            {`$${toInternationalCurrencySystem(
              typeof hoverIndex === 'number'
                ? data[hoverIndex].volume_dollar.toString()
                : data[data.length - 1].volume_dollar.toString()
            )}`}
          </div>
          <div className="text-xs text-primaryText">
            {typeof hoverIndex === 'number'
              ? formatDate(data[hoverIndex].dateString)
              : formatDate(data[data.length - 1].dateString)}
          </div>
        </div>
        {mobile ? (
          <MobileChartChangeButton
            chartDisplay={chartDisplay}
            setChartDisplay={setChartDisplay}
            showLiqudityButton={showLiqudityButton}
          />
        ) : (
          <ChartChangeButton
            className="self-start"
            chartDisplay={chartDisplay}
            setChartDisplay={setChartDisplay}
            showLiqudityButton={showLiqudityButton}
          />
        )}
      </div>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={data}
          onMouseMove={(item: any) => setHoverIndex(item.activeTooltipIndex)}
        >
          {isClientMobie() ? null : (
            <XAxis
              dataKey="dateString"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value, index) => value.split('-').pop()}
            />
          )}

          <Tooltip
            wrapperStyle={{
              visibility: 'hidden',
            }}
            cursor={false}
          />
          <Bar
            dataKey="volume_dollar"
            background={<BackgroundRender dataKey="volume_dollar" />}
          >
            {data.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={hoverIndex === i ? hoverColor : baseColor}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

export function TVLChart({
  data,
  chartDisplay,
  setChartDisplay,
  showLiqudityButton,
}: {
  data: TVLDataType[];
  chartDisplay: 'volume' | 'tvl';
  setChartDisplay: (display: 'volume' | 'tvl') => void;
  showLiqudityButton?: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState<number>(null);
  if (!data)
    return (
      <EmptyChart
        setChartDisplay={setChartDisplay}
        chartDisplay={chartDisplay}
        loading={true}
        showLiqudityButton={showLiqudityButton}
      />
    );

  if (data.length === 0)
    return (
      <EmptyChart
        setChartDisplay={setChartDisplay}
        chartDisplay={chartDisplay}
        showLiqudityButton={showLiqudityButton}
      />
    );
  const mobile = isMobile();
  return (
    <>
      <div className="flex items-center justify-between xsm:flex-col-reverse xsm:items-start self-start w-full">
        <div className="flex flex-col">
          <div className="text-white text-2xl">
            {`$${toInternationalCurrencySystem(
              typeof hoverIndex === 'number'
                ? data[hoverIndex].total_tvl.toString()
                : data[data.length - 1].total_tvl.toString()
            )}`}
          </div>
          <div className="text-xs text-primaryText">
            {typeof hoverIndex === 'number'
              ? formatDate(data[hoverIndex].date)
              : formatDate(data[data.length - 1].date)}
          </div>
        </div>
        {mobile ? (
          <MobileChartChangeButton
            chartDisplay={chartDisplay}
            setChartDisplay={setChartDisplay}
            showLiqudityButton={showLiqudityButton}
          />
        ) : (
          <ChartChangeButton
            className="self-start"
            chartDisplay={chartDisplay}
            setChartDisplay={setChartDisplay}
            showLiqudityButton={showLiqudityButton}
          />
        )}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          onMouseMove={(item: any) => {
            setHoverIndex(item.activeTooltipIndex);
          }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00c6a2" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00c6a2" stopOpacity={0} />
            </linearGradient>
          </defs>
          {isClientMobie() ? null : (
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value, index) => value.split('-').pop()}
            />
          )}

          <Tooltip
            wrapperStyle={{
              visibility: 'hidden',
            }}
            cursor={{ opacity: '0.3' }}
          />
          <Area
            dataKey="scaled_tvl"
            dot={false}
            stroke="#00c6a2"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorGradient)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  );
}

function PoolDetailsPage() {
  const { id } = useParams<ParamTypes>();
  const { state } = useLocation<LocationTypes>();
  const { pool, shares, finalStakeList: stakeList } = usePool(id);
  const { fail: indexerFail } = useIndexerStatus();

  const [farmVersion, setFarmVersion] = useState<string>('');

  const dayVolume = useDayVolume(id);
  const tokens = useTokens(pool?.tokenIds);

  const seedFarms = useSeedFarms(id);

  const seedDetail = useSeedDetail(id);

  const history = useHistory();

  const monthVolume = useMonthVolume(id);
  const monthTVL = useMonthTVL(id);
  const [showFunding, setShowFunding] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [poolTVL, setPoolTVL] = useState<number>();
  const [backToFarmsButton, setBackToFarmsButton] = useState<Boolean>(false);
  const [showFullStart, setShowFullStar] = useState<Boolean>(false);
  const [chartDisplay, setChartDisplay] = useState<'volume' | 'tvl'>('volume');
  const fromMorePools = localStorage.getItem('fromMorePools') === 'y';
  const morePoolIds: string[] =
    JSON.parse(localStorage.getItem('morePoolIds')) || [];
  const [farmCount, setFarmCount] = useState<Number>(1);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const { wallet } = getCurrentWallet();
  const intl = useIntl();

  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();

  const handleSaveWatchList = () => {
    if (!isSignedIn) {
      modal.show();
    } else {
      addPoolToWatchList({ pool_id: id }).then(() => {
        setShowFullStar(true);
      });
    }
  };
  const farmStakeTotal = useFarmStake({ poolId: Number(id), stakeList });

  const { lptAmount } = !!getConfig().REF_VE_CONTRACT_ID
    ? useAccountInfo()
    : { lptAmount: '0' };

  const userTotalShare = BigNumber.sum(shares, farmStakeTotal);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString('fullwide', { useGrouping: false });

  const handleRemoveFromWatchList = () => {
    removePoolFromWatchList({ pool_id: id }).then(() => {
      setShowFullStar(false);
    });
  };

  useEffect(() => {
    if (state?.tvl > 0) {
      setPoolTVL(state?.tvl);
    } else {
      getPool(id).then((pool) => {
        setPoolTVL(pool?.tvl);
      });
    }
    canFarmV2(Number(id)).then(({ count, version }) => {
      setBackToFarmsButton(!!count);
      setFarmVersion(version);
      setFarmCount(count);
    });

    getWatchListFromDb({ pool_id: id }).then((watchlist) => {
      setShowFullStar(watchlist.length > 0);
    });
  }, []);

  const tokenAmountShareRaw = (
    pool: Pool,
    token: TokenMetadata,
    shares: string
  ) => {
    return toRoundedReadableNumber({
      decimals: token.decimals,
      number: calculateFairShare({
        shareOf: pool.supplies[token.id],
        contribution: shares,
        totalContribution: pool.shareSupply,
      }),
      precision: 3,
      withCommas: false,
    });
  };

  const tokenAmountShare = (
    pool: Pool,
    token: TokenMetadata,
    shares: string
  ) => {
    const value = toRoundedReadableNumber({
      decimals: token.decimals,
      number: calculateFairShare({
        shareOf: pool.supplies[token.id],
        contribution: shares,
        totalContribution: pool.shareSupply,
      }),
      precision: 3,
      withCommas: false,
    });

    return Number(value) == 0
      ? '0'
      : Number(value) < 0.001 && Number(value) > 0
      ? '< 0.001'
      : toInternationalCurrencySystem(value, 3);
  };

  const tokenInfoPC = ({ token }: { token: TokenMetadata }) => {
    return tokenAmountShare(
      pool,
      token,
      new BigNumber(userTotalShareToString)
        .plus(Number(getVEPoolId()) === Number(pool.id) ? lptAmount : '0')
        .toNumber()
        .toFixed()
    );
  };

  const [revertRate, setRevertRate] = useState<boolean>(false);
  const tokenPriceList = useTokenPriceList();

  function totalTvlPerWeekDisplay() {
    const farms = seedFarms;
    const rewardTokenIconMap = {};
    let totalPrice = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    effectiveFarms.forEach((farm: FarmBoost) => {
      const { id, decimals, icon } = farm.token_meta_data;
      const { daily_reward } = farm.terms;
      rewardTokenIconMap[id] = icon;
      const tokenPrice = tokenPriceList?.[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        const tokenAmount = toReadableNumber(decimals, daily_reward);
        totalPrice += +new BigNumber(tokenAmount)
          .multipliedBy(tokenPrice)
          .toFixed();
      }
    });
    totalPrice = +new BigNumber(totalPrice).multipliedBy(7).toFixed();
    const totalPriceDisplay =
      totalPrice == 0
        ? '-'
        : '$' + toInternationalCurrencySystem(totalPrice.toString(), 2);
    return totalPriceDisplay;
  }

  function BaseApr() {
    const farms = seedFarms;

    let totalReward = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    effectiveFarms.forEach((farm: any) => {
      const reward_token_price = Number(
        tokenPriceList?.[farm.token_meta_data.id]?.price || 0
      );

      totalReward = totalReward + Number(farm.yearReward) * reward_token_price;
    });

    const poolShares = Number(toReadableNumber(24, pool.shareSupply));

    const seedTvl =
      !poolShares || !seedDetail
        ? 0
        : (Number(
            toReadableNumber(
              seedDetail.seed_decimal,
              seedDetail.total_seed_power
            )
          ) *
            (poolTVL || 0)) /
          poolShares;

    const baseAprAll = !seedTvl ? 0 : totalReward / seedTvl;

    return {
      displayApr:
        !poolTVL || !seedDetail || !seedFarms
          ? '-'
          : `${toPrecision((baseAprAll * 100).toString(), 2)}%`,
      rawApr: !poolTVL || !seedDetail || !seedFarms ? 0 : baseAprAll,
    };
  }

  const InfoCard = ({
    title,
    value,
    valueTitle,
    id,
  }: {
    title: JSX.Element;
    value: JSX.Element | string;
    valueTitle?: string;
    id: string;
  }) => {
    return (
      <div
        className={`rounded-lg xs:w-full md:w-full xs:mr-0 md:mr-0 ${
          id !== 'apr' ? 'mr-3' : ''
        }  py-3 w-full px-4 flex flex-col`}
        style={{
          background: 'rgba(29, 41, 50, 0.5)',
          height: '80px',
        }}
      >
        <div className="text-primaryText mb-3 text-sm">{title}</div>

        <div className="text-base text-white " title={valueTitle}>
          {value}
        </div>
      </div>
    );
  };

  const usdValue = useMemo(() => {
    try {
      if (!userTotalShareToString || typeof poolTVL !== 'number' || !pool)
        return '-';

      const rawRes = multiply(
        new BigNumber(userTotalShareToString)
          .plus(
            Number(getVEPoolId()) === Number(pool.id) ? lptAmount || '0' : '0'
          )
          .toNumber()
          .toFixed(),
        divide(poolTVL?.toString(), pool?.shareSupply)
      );

      return `$${
        Number(rawRes) == 0 ? '0' : toInternationalCurrencySystem(rawRes, 2)
      }`;
    } catch (error) {
      return '-';
    }
  }, [poolTVL, userTotalShareToString, pool]);

  const disable_add: boolean = useMemo(() => {
    const tokenIds = tokens?.map((t) => t.id) || [];
    return !!tokenIds.find((tokenId) => BLACK_TOKEN_LIST.includes(tokenId));
  }, [tokens]);
  if (!pool || !tokens || tokens.length < 2) return <Loading />;
  if (BLACKLIST_POOL_IDS.includes(pool.id.toString())) history.push('/');
  if (isStablePool(pool.id)) {
    history.push(`/sauce/${pool.id}`);
  }
  function valueOfNearTokenTip() {
    const tip = intl.formatMessage({ id: 'awesomeNear_verified_token' });
    let result: string = `<div class="text-navHighLightText text-xs text-left font-normal">${tip}</div>`;
    return result;
  }

  function add_to_watchlist_tip() {
    const tip = intl.formatMessage({ id: 'add_to_watchlist' });
    let result: string = `<div class="text-navHighLightText text-xs text-left font-normal">${tip}</div>`;
    return result;
  }

  function remove_from_watchlist_tip() {
    const tip = intl.formatMessage({ id: 'remove_from_watchlist' });
    let result: string = `<div class="text-navHighLightText text-xs text-left font-normal">${tip}</div>`;
    return result;
  }

  const haveLiquidity = Number(pool.shareSupply) > 0;

  const haveShare = Number(userTotalShareToString) > 0;

  return (
    <>
      <div className="md:w-11/12 xs:w-11/12 w-4/6 lg:w-5/6 xl:w-1050px m-auto">
        <BreadCrumb
          routes={[
            { id: 'pools', msg: 'Pools', pathname: '/pools' },
            {
              id: 'more_pools',
              msg: 'More Pools',
              pathname: `/more_pools/${tokens.map((tk) => tk.id)}`,
              state: {
                fromMorePools,
                tokens,
                morePoolIds,
              },
            },
            {
              id: 'details',
              msg: 'Details',
              pathname: `/pool`,
            },
          ]}
        />

        <div className="flex items-center w-full relative mb-4 ml-2">
          <Images
            borderStyle="4px solid #3D4451"
            size="9"
            tokens={sort_tokens_by_base(tokens)}
          />

          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="ml-2">
                <Symbols size="text-lg" tokens={sort_tokens_by_base(tokens)} />
              </div>
              {!backToFarmsButton || isClientMobie() ? null : (
                <Link
                  to={{
                    pathname:
                      farmVersion === 'V1' ? '/farms' : `/v2farms/${id}-r`,
                  }}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <FarmStampNew multi={farmCount > 1} />
                </Link>
              )}

              <div
                className="rounded-lg xs:absolute md:absolute xs:right-4 md:right-4 cursor-pointer flex items-center justify-center ml-2"
                style={{
                  background: '#172534',
                  width: '30px',
                  height: '24px',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  showFullStart
                    ? handleRemoveFromWatchList()
                    : handleSaveWatchList();
                }}
              >
                {showFullStart ? (
                  <div
                    className="text-sm "
                    data-type="info"
                    data-place="right"
                    data-multiline={true}
                    data-class="reactTip"
                    data-tooltip-html={
                      !!isClientMobie() ? '' : remove_from_watchlist_tip()
                    }
                    data-tooltip-id="fullstar-tip"
                  >
                    {isClientMobie() ? (
                      <WatchListStartFullMobile />
                    ) : (
                      <WatchListStartFull />
                    )}

                    <CustomTooltip id="fullstar-tip" />
                  </div>
                ) : (
                  <div
                    className="text-sm "
                    data-type="info"
                    data-place="right"
                    data-multiline={true}
                    data-class="reactTip"
                    data-tooltip-html={
                      !!isClientMobie() ? '' : add_to_watchlist_tip()
                    }
                    data-tooltip-id="emptystar-tip"
                  >
                    {isClientMobie() ? (
                      <WatchListStartEmptyMobile />
                    ) : (
                      <WatchListStartEmpty />
                    )}

                    <CustomTooltip id="emptystar-tip" />
                  </div>
                )}
              </div>
              {haveLiquidity && (
                <div className="absolute right-0 xs:hidden md:hidden flex items-center">
                  {revertRate ? (
                    <GetExchangeRate
                      token0Price={tokenPriceList?.[tokens[1].id]?.price}
                      tokens={[tokens[1], tokens[0]]}
                      pool={pool}
                    />
                  ) : (
                    <GetExchangeRate
                      token0Price={tokenPriceList?.[tokens[0].id]?.price}
                      tokens={[tokens[0], tokens[1]]}
                      pool={pool}
                    />
                  )}

                  <div
                    className="rounded-lg cursor-pointer text-v3SwapGray hover:text-gradientFromHover  flex items-center justify-center ml-2"
                    style={{
                      background: '#172534',
                      width: '30px',
                      height: '24px',
                    }}
                    onClick={() => {
                      setRevertRate(!revertRate);
                    }}
                  >
                    <ExchangeArrow />
                  </div>
                </div>
              )}
            </div>

            <div className="ml-2 text-primaryText flex items-center text-sm">
              <FormattedMessage id="fee" defaultMessage={'Fee'} />: &nbsp;
              {calculateFeePercent(pool.fee)}%
              {!backToFarmsButton || !isClientMobie() ? null : (
                <Link
                  to={{
                    pathname:
                      farmVersion === 'V1' ? '/farms' : `/v2farms/${id}-r`,
                  }}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <FarmStampNew multi={farmCount > 1} />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex  items-start flex-row w-full m-auto xs:flex-col-reverse md:flex-col-reverse">
          <div
            className="mr-4"
            style={{
              width: isClientMobie() ? '100%' : 'calc(100% - 333px)',
            }}
          >
            <Card
              width="w-full"
              className="relative rounded-2xl mr-4 mb-4 h-full flex flex-col justify-center  items-center"
              padding="px-7 py-5"
              bgcolor={'bg-transparent'}
              style={{
                height: isClientMobie() ? '370px' : '470px',
              }}
            >
              {chartDisplay === 'volume' ? (
                <VolumeChart
                  data={monthVolume}
                  chartDisplay={chartDisplay}
                  setChartDisplay={setChartDisplay}
                />
              ) : (
                <TVLChart
                  data={monthTVL}
                  chartDisplay={chartDisplay}
                  setChartDisplay={setChartDisplay}
                />
              )}
            </Card>

            <div className="flex items-center justify-between xs:gap-2 md:gap-2 xs:grid md:grid xs:grid-rows-2 xs:grid-cols-2 md:grid-cols-2 md:grid-rows-2 mb-8 w-full ">
              <InfoCard
                title={
                  <FormattedMessage
                    id="TVL"
                    defaultMessage={'TVL'}
                  ></FormattedMessage>
                }
                id="tvl"
                value={
                  !poolTVL
                    ? '-'
                    : `$${
                        Number(poolTVL) < 0.01 && Number(poolTVL) > 0
                          ? '< 0.01'
                          : toInternationalCurrencySystem(
                              poolTVL?.toString() || '0',
                              2
                            )
                      }`
                }
                valueTitle={poolTVL?.toString()}
              />

              <InfoCard
                title={
                  <FormattedMessage
                    id="h24_volume_bracket"
                    defaultMessage="Volume(24h)"
                  />
                }
                id="volume"
                value={
                  dayVolume
                    ? '$' + toInternationalCurrencySystem(dayVolume)
                    : '-'
                }
                valueTitle={dayVolume}
              />

              <InfoCard
                title={
                  <FormattedMessage id="fee_24h" defaultMessage="Fee(24h)" />
                }
                id="fee_24h"
                value={
                  dayVolume
                    ? `$${toInternationalCurrencySystemLongString(
                        getPoolFee24h(dayVolume, pool).toString(),
                        2
                      )}`
                    : '-'
                }
                valueTitle={
                  dayVolume ? `$${getPoolFee24h(dayVolume, pool)}` : '-'
                }
              />
              <InfoCard
                title={
                  <>
                    <FormattedMessage id="apr" defaultMessage="APR" />
                    &nbsp;
                    {dayVolume && seedFarms && BaseApr().rawApr > 0 && (
                      <>
                        (
                        <FormattedMessage id="pool" defaultMessage={'Pool'} /> +
                        <FormattedMessage id="farm" defaultMessage={'Farm'} />)
                      </>
                    )}
                  </>
                }
                id="apr"
                value={
                  <div
                    data-type="info"
                    data-place="left"
                    data-multiline={true}
                    data-class={'reactTip'}
                    data-tooltip-html={getPoolListFarmAprTip()}
                    data-tooltip-id={'pool_list_pc_apr' + pool.id}
                  >
                    {!poolTVL
                      ? '-'
                      : dayVolume
                      ? `${getPoolFeeApr(dayVolume, pool, poolTVL)}%`
                      : '-'}
                    {poolTVL &&
                    dayVolume &&
                    seedFarms &&
                    BaseApr().rawApr > 0 ? (
                      <span className="text-xs text-gradientFrom">
                        {` +` + BaseApr().displayApr}
                      </span>
                    ) : null}

                    {!!seedFarms &&
                      !isMobile() &&
                      seedFarms &&
                      BaseApr().rawApr > 0 && (
                        <CustomTooltip
                          className="w-20"
                          id={'pool_list_pc_apr' + pool.id}
                          place="right"
                        />
                      )}
                  </div>
                }
              />
            </div>

            <div className="text-white text-base mb-3 font-gothamBold w-full">
              <FormattedMessage
                id="pool_composition"
                defaultMessage={'Pool Composition'}
              />
            </div>

            <div
              className="rounded-lg  pt-4 pb-1 w-full"
              style={{
                background: 'rgba(29, 41, 50, 0.5)',
              }}
            >
              <div className="grid px-5 grid-cols-10  justify-items-start text-sm text-primaryText">
                <div className="col-span-5 xs:col-span-4 md:col-span-4">
                  <FormattedMessage id="token" defaultMessage="Token" />
                </div>

                <div className="col-span-3 xs:justify-self-center md:justify-self-center">
                  <FormattedMessage id="amount" defaultMessage="Amount" />
                </div>

                <div className="col-span-3 lg:col-span-2 xs:justify-self-center md:justify-self-center">
                  <FormattedMessage id="value" defaultMessage="Value" />
                </div>
              </div>

              {tokens.map((token) => {
                const price = tokenPriceList?.[token.id]?.price;

                const tokenAmount = toReadableNumber(
                  token.decimals,
                  pool.supplies[token.id]
                );

                return (
                  <div
                    key={token.id + '-pool-composition'}
                    className="grid grid-cols-10 px-5 py-3 items-center hover:bg-chartBg hover:bg-opacity-30 justify-items-start text-base text-white"
                  >
                    <div className="flex items-center col-span-5 xs:col-span-4 md:col-span-4">
                      <Icon icon={token.icon} className="h-7 w-7 mr-2" />
                      <div className="flex items-start flex-col">
                        <div className="flex items-center text-white text-base">
                          {toRealSymbol(token.symbol)}

                          {
                            <span className="lg:hidden">
                              <ExclamationTip
                                id={token.id}
                                defaultMessage={token.id}
                                colorhex="#7E8A93"
                              />
                            </span>
                          }
                        </div>
                        <a
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          href={`/swap/#${
                            tokens[0].id == WRAP_NEAR_CONTRACT_ID
                              ? 'near'
                              : tokens[0].id
                          }|${
                            tokens[1].id == WRAP_NEAR_CONTRACT_ID
                              ? 'near'
                              : tokens[1].id
                          }`}
                          className="text-xs text-primaryText xs:hidden md:hidden"
                          title={token.id}
                        >{`${token.id.substring(0, 24)}${
                          token.id.length > 24 ? '...' : ''
                        }`}</a>
                      </div>
                    </div>

                    <div
                      className="col-span-3 xs:justify-self-center md:justify-self-center"
                      title={
                        Number(tokenAmount) > 0 && Number(tokenAmount) < 0.01
                          ? '< 0.01'
                          : tokenAmount
                      }
                    >
                      {Number(tokenAmount) > 0 && Number(tokenAmount) < 0.01
                        ? '< 0.01'
                        : toInternationalCurrencySystem(tokenAmount, 2)}
                    </div>

                    <div
                      className="col-span-3 lg:col-span-2 xs:justify-self-center md:justify-self-center"
                      title={
                        !!price ? `$${multiply(price, tokenAmount)}` : null
                      }
                    >
                      {!!price
                        ? `$${toInternationalCurrencySystem(
                            multiply(price, tokenAmount),
                            2
                          )}`
                        : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <RecentTransactions
              tokens={tokens}
              pool_id={pool.id}
            ></RecentTransactions>
          </div>

          <div
            className="xs:mb-4 md:mb-4"
            style={{
              width: isClientMobie() ? '100%' : '317px',
            }}
          >
            <Card
              className="rounded-2xl  w-full text-base text-white mb-4"
              bgcolor="bg-cardBg"
            >
              {haveShare && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="whitespace-nowrap">
                      <FormattedMessage
                        id="your_liquidity"
                        defaultMessage={'Your Liquidity'}
                      />
                    </span>

                    <MyShares
                      shares={shares}
                      totalShares={pool.shareSupply}
                      poolId={pool.id}
                      stakeList={stakeList}
                      lptAmount={lptAmount}
                    />
                  </div>

                  <div className="w-full text-right text-sm text-primaryText ">
                    {!isSignedIn ? (
                      '-'
                    ) : usdValue === '-' ? (
                      '-'
                    ) : (
                      <div className="flex items-center relative top-1.5 justify-between">
                        <span className="whitespace-nowrap ">
                          <FormattedMessage
                            id="estimate_value"
                            defaultMessage={'Estimate Value'}
                          ></FormattedMessage>
                        </span>

                        <span className="text-white font-bold">{usdValue}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col text-center text-base  pt-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Icon icon={tokens[0].icon} className="h-7 w-7 mr-2" />
                        <div className="flex items-start flex-col">
                          <div className="flex items-center text-farmText text-sm">
                            {toRealSymbol(tokens[0].symbol)}
                          </div>
                        </div>
                      </div>
                      <div
                        className="flex items-center text-farmText text-sm"
                        title={tokenAmountShareRaw(
                          pool,
                          tokens[0],
                          new BigNumber(userTotalShareToString)
                            .plus(
                              Number(getVEPoolId()) === Number(pool.id)
                                ? lptAmount
                                : '0'
                            )
                            .toNumber()
                            .toFixed()
                        )}
                      >
                        {tokenInfoPC({
                          token: tokens[0],
                        })}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <Icon icon={tokens[1].icon} className="h-7 w-7 mr-2" />
                        <div className="flex items-start flex-col">
                          <div className="flex items-center text-farmText text-sm ">
                            {toRealSymbol(tokens[1].symbol)}
                          </div>
                        </div>
                      </div>
                      <div
                        className="flex items-center text-farmText text-sm"
                        title={tokenAmountShareRaw(
                          pool,
                          tokens[1],
                          new BigNumber(userTotalShareToString)
                            .plus(
                              Number(getVEPoolId()) === Number(pool.id)
                                ? lptAmount
                                : '0'
                            )
                            .toNumber()
                            .toFixed()
                        )}
                      >
                        {tokenInfoPC({
                          token: tokens[1],
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!haveShare && (
                <div className="flex items-center flex-col">
                  <div className="mt-6">
                    <NoLiquidityDetailPageIcon />
                  </div>

                  <div className="text-v3SwapGray my-5 text-sm">
                    <FormattedMessage
                      id="no_positons_in_this_pool_yet"
                      defaultMessage={'No positons in this pool yet'}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center  w-full">
                <div className={`pr-2 ${haveShare ? 'w-1/2' : 'w-full'} `}>
                  <SolidButton
                    padding="px-0"
                    className=" w-full h-11 xs:w-full text-base rounded-lg  md:w-full xs:col-span-1 md:col-span-1 md:text-sm xs:text-sm"
                    onClick={() => {
                      setShowFunding(true);
                    }}
                    disabled={disable_add}
                  >
                    {!haveShare ? (
                      <FormattedMessage
                        id="add_liquidity"
                        defaultMessage={'Add Liquidity'}
                      />
                    ) : (
                      <FormattedMessage id="add" defaultMessage="Add" />
                    )}
                  </SolidButton>
                </div>
                {haveShare && (
                  <div className="pl-2 w-1/2">
                    <SolidButton
                      padding="px-0"
                      onClick={() => {
                        setShowWithdraw(true);
                      }}
                      disabled={Number(userTotalShareToString) == 0}
                      disabledColor={'bg-lockedBg'}
                      className={`btn-remove-liq w-full ${
                        Number(userTotalShareToString) == 0
                          ? 'bg-lockedBg text-opacity-30'
                          : 'bg-bgGreyDefault hover:bg-bgGreyHover '
                      }   h-11 xs:w-full text-base rounded-lg md:w-full xs:col-span-1 md:col-span-1 md:text-sm xs:text-sm bg-poolRowHover`}
                    >
                      <FormattedMessage id="remove" defaultMessage="Remove" />
                    </SolidButton>
                  </div>
                )}
              </div>
            </Card>
            <BLACKTip tokenIds={tokens?.map((t) => t.id) || []} />
            {!seedFarms ? null : (
              <div className="flex flex-col mt-4 relative z-30">
                <FarmBoardInDetailPool
                  style={{
                    position: 'absolute',
                    transform: isClientMobie()
                      ? 'scale(1,1.05)'
                      : 'scale(1.05)',
                    zIndex: -1,
                    left: isClientMobie() ? '' : '8px',
                  }}
                />
                <div className="flex items-center mx-4 xs:mx-7 md:mx-7 mt-4 lg:mt-5 justify-between">
                  <div className="text-white whitespace-nowrap">
                    <FormattedMessage
                      id="farm_apr"
                      defaultMessage={'Farm APR'}
                    />
                  </div>

                  <div
                    className="rounded-lg flex items-center px-2 py-0.5"
                    style={{
                      background: '#17252E',
                    }}
                  >
                    <Images
                      className="mr-1"
                      tokens={seedFarms.map(
                        (farm: any) => farm.token_meta_data
                      )}
                      size="4"
                      isRewardDisplay
                      borderStyle="1px solid #00C6A2"
                    />
                    <span className="text-sm text-v3SwapGray">
                      {totalTvlPerWeekDisplay()}
                      /week
                    </span>
                  </div>
                </div>

                <div className="flex items-center mx-4 xs:mx-7 md:mx-7 mt-3 justify-between">
                  <div className="valueStyleYellow flex items-center text-lg">
                    <span className="mr-2">{BaseApr().displayApr}</span>
                    <Fire />
                  </div>

                  <SolidButton
                    className="py-1.5 pb-1.5 px-4 flex rounded-lg items-center justify-center"
                    onClick={() => {
                      openUrl(`/v2farms/${id}-r`);
                    }}
                  >
                    <FormattedMessage
                      id="farm_now"
                      defaultMessage={'Farm Now!'}
                    />
                  </SolidButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <RemoveLiquidityModal
        pool={pool}
        shares={shares}
        tokens={tokens}
        isOpen={showWithdraw}
        onRequestClose={() => setShowWithdraw(false)}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            bottom: '50%',
          },
        }}
      />
      <AddLiquidityModal
        pool={pool}
        tokens={tokens}
        isOpen={showFunding}
        onRequestClose={() => setShowFunding(false)}
        overlayClassName=""
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            bottom: '50%',
          },
        }}
      />
      {indexerFail && (
        <PoolRefreshModal isOpen={indexerFail}></PoolRefreshModal>
      )}
    </>
  );
}

export const formatNumber = (v: string | number) => {
  const big = Big(v || 0);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.001)) {
    return '<0.001';
  } else {
    return big.toFixed(3, 1);
  }
};
