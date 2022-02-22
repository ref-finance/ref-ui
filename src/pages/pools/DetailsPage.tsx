import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import { ActionModel } from '~pages/AccountPage';
import {
  useMonthTVL,
  useMonthVolume,
  usePool,
  useRemoveLiquidity,
  volumeDataType,
  volumeType,
  TVLDataType,
  TVLType,
  useDayVolume,
} from '~state/pool';
import {
  addLiquidityToPool,
  addPoolToWatchList,
  getWatchListFromDb,
  Pool,
  PoolDetails,
  removePoolFromWatchList,
} from '~services/pool';
import {
  useTokenBalances,
  useTokens,
  getDepositableBalance,
} from '~state/token';
import Loading from '~components/layout/Loading';
import { FarmMiningIcon } from '~components/icon/FarmMining';
import { FarmStamp } from '~components/icon/FarmStamp';
import { ChartLoading } from '~components/icon/Loading';
import { REF_FARM_CONTRACT_ID, REF_FI_CONTRACT_ID } from '~services/near';
import { PoolSlippageSelector } from '~components/forms/SlippageSelector';
import { Link } from 'react-router-dom';
import { canFarm } from '~services/pool';
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
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import Alert from '~components/alert/Alert';
import InputAmount from '~components/forms/InputAmount';
import { isMobile } from '~utils/device';
import ReactModal from 'react-modal';
import { toRealSymbol } from '~utils/token';

import {
  BackArrowWhite,
  BackArrowGray,
  ModalClose,
  Near,
} from '~components/icon';
import { useHistory } from 'react-router';
import { getPool } from '~services/indexer';
import { BigNumber } from 'bignumber.js';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  WatchListStartEmpty,
  WatchListStartFull,
} from '~components/icon/WatchListStar';
import {
  OutlineButton,
  SolidButton,
  FarmButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '~components/button/Button';
import { wallet } from '~services/near';
import { BreadCrumb } from '~components/layout/BreadCrumb';
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
import { ChartNoData } from '~components/icon/ChartNoData';
import { WarnTriangle } from '~components/icon/SwapRefresh';
import { RefIcon } from '~components/icon/Common';
interface ParamTypes {
  id: string;
}

interface LocationTypes {
  tvl: number;
  backToFarms: boolean;
}
const ONLY_ZEROS = /^0*\.?0*$/;

const formatDate = (rawDate: string) => {
  const date = rawDate
    .split('-')
    .map((t) => (t.length >= 2 ? t : t.padStart(2, '0')))
    .join('-');

  return moment(date).format('ll');
};

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
}: {
  tokens: any;
  pool: any;
}) => {
  const first_token_num = toReadableNumber(
    tokens[0].decimals || 24,
    pool.supplies[tokens[0].id]
  );
  const second_token_num = toReadableNumber(
    tokens[1].decimals || 24,
    pool.supplies[tokens[1].id]
  );
  const rate = Number(second_token_num) / Number(first_token_num);

  const showRate = rate < 0.01 ? '< 0.01' : rate.toFixed(2);

  return Number(first_token_num) === 0 ? (
    <div className="px-1 border border-transparent">&nbsp;</div>
  ) : (
    <div className="text-white text-center px-1  rounded-sm border border-solid border-gray-400">
      <span>
        1&nbsp;{toRealSymbol(tokens[0].symbol)}&nbsp;
        <span title={`${rate}`}>
          {rate < 0.01 ? '' : '≈'} {showRate}
        </span>
        &nbsp;{toRealSymbol(tokens[1].symbol)}
      </span>
    </div>
  );
};

export function AddLiquidityModal(
  props: ReactModal.Props & {
    pool: Pool;
    tokens: TokenMetadata[];
  }
) {
  const { pool, tokens } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [messageId, setMessageId] = useState<string>('add_liquidity');
  const [defaultMessage, setDefaultMessage] = useState<string>('Add Liquidity');
  const balances = useTokenBalances();
  const [error, setError] = useState<Error>();
  const intl = useIntl();
  const history = useHistory();
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [canDeposit, setCanDeposit] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [preShare, setPreShare] = useState(null);
  const [modal, setModal] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (balances) {
      const firstTokenBalanceBN = new BigNumber(
        toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
      );
      const secondTokenBalanceBN = new BigNumber(
        toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
      );

      if (firstTokenBalanceBN.isZero() && secondTokenBalanceBN.isZero()) {
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
      }
    }
  }, [balances]);

  if (!balances) return null;

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

  function validate({
    firstAmount,
    secondAmount,
  }: {
    firstAmount: string;
    secondAmount: string;
  }) {
    const firstTokenAmountBN = new BigNumber(firstAmount.toString());
    const firstTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
    );
    const secondTokenAmountBN = new BigNumber(secondAmount.toString());
    const secondTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
    );

    const hasDeposited = !(
      firstTokenBalanceBN.isZero() && secondTokenBalanceBN.isZero()
    );

    setCanSubmit(false);
    setCanDeposit(false);
    if (
      firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN) ||
      !hasDeposited
    ) {
      setCanDeposit(true);
      // setMessageId('deposit_to_add_liquidity');
      // setDefaultMessage('Deposit to Add Liquidity');
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
      // throw new Error(
      //   `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
      //     tokens[0].symbol
      //   )}`
      // );
      return;
    }

    if (secondTokenAmountBN.isGreaterThan(secondTokenBalanceBN)) {
      setCanDeposit(true);
      // setMessageId('deposit_to_add_liquidity');
      // setDefaultMessage('Deposit to Add Liquidity');
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
      // throw new Error(
      //   `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
      //     tokens[1].symbol
      //   )}`
      // );
      return;
    }

    if (ONLY_ZEROS.test(firstAmount)) {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      return;
      // throw new Error(
      //   `${toRealSymbol(tokens[0].symbol)} ${intl.formatMessage({
      //     id: 'amount_must_be_greater_than_0',
      //   })} `
      // );
    }

    if (ONLY_ZEROS.test(secondAmount)) {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      return;
      // throw new Error(
      //   `${toRealSymbol(tokens[1].symbol)} ${intl.formatMessage({
      //     id: 'amount_must_be_greater_than_0',
      //   })} `
      // );
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

  function submit() {
    return addLiquidityToPool({
      id: pool.id,
      tokenAmounts: [
        { token: tokens[0], amount: firstTokenAmount },
        { token: tokens[1], amount: secondTokenAmount },
      ],
    });
  }

  const cardWidth = isMobile() ? '95vw' : '40vw';

  const ButtonRender = () => {
    if (!wallet.isSignedIn()) {
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
        className="focus:outline-none px-4 w-full"
        onClick={handleClick}
        loading={buttonLoading}
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
    if (preShare && new BigNumber('0').isLessThan(preShare)) {
      const myShareBig = new BigNumber(preShare);
      if (myShareBig.isLessThan('0.001')) {
        result = '<0.001';
      } else {
        result = `≈ ${myShareBig.toFixed(3)}`;
      }
    } else {
      result = '-';
    }
    return result;
  };

  return (
    <Modal {...props}>
      <Card
        style={{
          width: cardWidth,
          border: '1px solid rgba(0, 198, 162, 0.5)',
        }}
        padding="p-8"
        bgcolor="bg-cardBg"
        className="text-white outline-none "
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-base font-bold pb-2">
              <FormattedMessage
                id="add_liquidity"
                defaultMessage="Add Liquidity"
              />
            </div>
            <p className="text-xs text-primaryText">
              <a
                className="underline cursor-pointer"
                onClick={() => {
                  window.open('/account');
                }}
              >
                <FormattedMessage id="deposit"></FormattedMessage>
              </a>
              &nbsp;
              <FormattedMessage id="deposit_into_ref_account" />
            </p>
          </div>
          <div
            className="ml-2 cursor-pointer p-1"
            onClick={props.onRequestClose}
          >
            <ModalClose />
          </div>
        </div>

        {/* PC display */}
        <div className="mt-8 md:hidden xs:hidden">
          <div className="flex justify-end items-center text-xs text-right mb-1 text-gray-400">
            <span className="mr-2 text-primaryText">
              <RefIcon></RefIcon>
            </span>
            <FormattedMessage id="balance" defaultMessage="Balance" />
            :&nbsp;
            <span
              title={toReadableNumber(
                tokens[0].decimals,
                balances[tokens[0].id]
              )}
            >
              {toPrecision(
                toReadableNumber(tokens[0].decimals, balances[tokens[0].id]),
                2,
                true
              )}
            </span>
          </div>
          <div className="flex items-center ">
            <div className="flex items-center mr-4 w-1/3">
              <Icon icon={tokens[0].icon} className="h-9 w-9 mr-2" />
              <div className="text-white text-base" title={tokens[0].id}>
                {toRealSymbol(tokens[0].symbol)}
              </div>
            </div>
            <InputAmount
              className="w-full border border-transparent rounded"
              max={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
              onChangeAmount={changeFirstTokenAmount}
              value={firstTokenAmount}
            />
          </div>
        </div>
        <div className="my-8 md:hidden xs:hidden">
          <div className="flex justify-end items-center text-xs text-right mb-1 text-gray-400">
            <span className="mr-2 text-primaryText">
              <RefIcon></RefIcon>
            </span>
            <FormattedMessage id="balance" defaultMessage="Balance" />
            :&nbsp;
            <span
              title={toReadableNumber(
                tokens[1].decimals,
                balances[tokens[1].id]
              )}
            >
              {toPrecision(
                toReadableNumber(tokens[1].decimals, balances[tokens[1].id]),
                2,
                true
              )}
            </span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-4 w-1/3">
              <Icon icon={tokens[1].icon} className="h-9 w-9 mr-2" />
              <div className="text-white text-base" title={tokens[1].id}>
                {toRealSymbol(tokens[1].symbol)}
              </div>
            </div>
            <InputAmount
              className="w-full border border-transparent rounded"
              max={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
              onChangeAmount={changeSecondTokenAmount}
              value={secondTokenAmount}
            />
          </div>
        </div>
        {/* mobile display */}
        <div className="my-6 lg:hidden">
          <div className="flex items-end justify-between mb-2">
            <div className="flex items-center">
              <Icon icon={tokens[0].icon} className="h-9 w-9 mr-2" />
              <div className="flex items-start flex-col">
                <div className="text-white text-base">
                  {toRealSymbol(tokens[0].symbol)}
                </div>
                {/* <div
                  className="text-xs text-gray-400"
                  title={tokens[0].id}
                >{`${tokens[0].id.substring(0, 25)}${
                  tokens[0].id.length > 25 ? '...' : ''
                }`}</div> */}
              </div>
            </div>
            <div className="flex items-center justify-end text-xs text-right mb-1 text-gray-400">
              <span className="mr-2 text-primaryText">
                <RefIcon></RefIcon>
              </span>
              <FormattedMessage id="balance" defaultMessage="Balance" />
              :&nbsp;
              <span
                title={toReadableNumber(
                  tokens[0].decimals,
                  balances[tokens[0].id]
                )}
              >
                {toPrecision(
                  toReadableNumber(tokens[0].decimals, balances[tokens[0].id]),
                  2,
                  true
                )}
              </span>
            </div>
          </div>
          <InputAmount
            className="w-full border border-transparent rounded"
            max={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
            onChangeAmount={changeFirstTokenAmount}
            value={firstTokenAmount}
            disabled={!wallet.isSignedIn()}
          />
        </div>
        <div className="my-8 lg:hidden">
          <div className="flex items-end justify-between mb-2">
            <div className="flex items-center">
              <Icon icon={tokens[1].icon} className="h-9 w-9 mr-2" />
              <div className="flex items-start flex-col">
                <div className="text-white text-base">
                  {toRealSymbol(tokens[1].symbol)}
                </div>
                {/* <div
                  className="text-xs text-gray-400"
                  title={tokens[1].id}
                >{`${tokens[1].id.substring(0, 25)}${
                  tokens[1].id.length > 25 ? '...' : ''
                }`}</div> */}
              </div>
            </div>
            <div className="flex justify-end items-end text-xs text-right mb-1 text-gray-400">
              <span className="mr-2 text-primaryText">
                <RefIcon></RefIcon>
              </span>
              <FormattedMessage id="balance" defaultMessage="Balance" />
              :&nbsp;
              <span
                title={toReadableNumber(
                  tokens[1].decimals,
                  balances[tokens[1].id]
                )}
              >
                {toPrecision(
                  toReadableNumber(tokens[1].decimals, balances[tokens[1].id]),
                  2,
                  true
                )}
              </span>
            </div>
          </div>
          <InputAmount
            className="w-full border border-transparent rounded"
            max={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
            onChangeAmount={changeSecondTokenAmount}
            value={secondTokenAmount}
          />
        </div>
        {error ? (
          <div className="flex justify-center mb-8 ">
            <Alert level="warn" message={error.message} />
          </div>
        ) : null}

        {canDeposit ? (
          <div className="flex xs:flex-col md:flex-col justify-between items-center rounded-md p-4 xs:px-2 md:px-2 border border-warnColor">
            <div className="flex items-center xs:mb-3 md:mb-3">
              <label className="flex-shrink-0">
                <WarnTriangle />
              </label>
              <label className="ml-2.5 text-base text-warnColor xs:text-sm md:text-sm">
                <FormattedMessage id="you_do_not_have_enough" />{' '}
                {modal?.token?.symbol}！
              </label>
            </div>
            <SolidButton
              className="focus:outline-none px-3 py-1.5 text-sm"
              onClick={() => {
                setVisible(true);
              }}
            >
              <FormattedMessage id="deposit" />
            </SolidButton>
          </div>
        ) : null}
        <div className="flex justify-between text-primaryText text-sm my-6">
          <label>
            <FormattedMessage id="my_shares"></FormattedMessage>
          </label>
          <span className="text-white text-sm">{shareDisplay()}</span>
        </div>
        <div className="">
          <ButtonRender />
        </div>
      </Card>
      <ActionModel
        modal={modal}
        visible={visible}
        onRequestClose={setVisible}
      ></ActionModel>
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
  const cardWidth = isMobile() ? '95vw' : '40vw';
  const intl = useIntl();

  function submit() {
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
    return removeLiquidity();
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

        <div>
          <div className="text-xs text-right mb-1 text-gray-400">
            <FormattedMessage id="my_shares" defaultMessage="Shares" />
            :&nbsp;
            {toPrecision(toReadableNumber(24, shares), 2)}
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
            <p className="my-3 text-left text-sm">
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
                      <span className="m-1 mb-2 text-sm">{token.symbol} </span>
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
          {wallet.isSignedIn() ? (
            <SolidButton
              disabled={!canSubmit}
              className={`focus:outline-none px-4 w-full`}
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
}: {
  shares: string;
  totalShares: string;
  poolId?: number;
  stakeList?: Record<string, string>;
  decimal?: number;
  yourLP?: boolean;
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

  const userTotalShare = BigNumber.sum(shares, farmStake);
  let sharePercent = percent(userTotalShare.valueOf(), totalShares);

  let displayPercent;
  if (Number.isNaN(sharePercent) || sharePercent === 0) displayPercent = '0';
  else if (sharePercent < 0.0001)
    displayPercent = `< ${
      decimal ? '0.'.padEnd(decimal + 1, '0') + '1' : '0.0001'
    }`;
  else displayPercent = toPrecision(String(sharePercent), decimal || 4);

  return (
    <div>{`${toRoundedReadableNumber({
      decimals: LP_TOKEN_DECIMALS,
      number: userTotalShare
        .toNumber()
        .toLocaleString('fullwide', { useGrouping: false }),
      precision: decimal || 6,
    })} (${displayPercent}%)`}</div>
  );
}

const ChartChangeButton = ({
  chartDisplay,
  setChartDisplay,
  className,
  noData,
}: {
  chartDisplay: 'volume' | 'tvl';
  setChartDisplay: (display: 'volume' | 'tvl') => void;
  className?: string;
  noData?: boolean;
}) => {
  return (
    <div
      className={`text-white text-xs rounded-2xl flex items-center bg-gray-700 ${className} ${
        noData ? 'z-20 opacity-70' : ''
      }`}
    >
      <button
        className={`py-1 w-16 ${
          chartDisplay === 'tvl'
            ? 'rounded-2xl bg-gradient-to-b from-gradientFrom to-gradientTo'
            : 'text-gray-400'
        }`}
        onClick={() => setChartDisplay('tvl')}
      >
        <FormattedMessage id="tvl" defaultMessage="TVL" />
      </button>
      <button
        className={`py-1 w-16 ${
          chartDisplay === 'volume'
            ? 'rounded-2xl bg-gradient-to-b from-gradientFrom to-gradientTo'
            : 'text-gray-400'
        }`}
        onClick={() => setChartDisplay('volume')}
      >
        <FormattedMessage id="volume" defaultMessage="Volume" />
      </button>
    </div>
  );
};

function EmptyChart({
  chartDisplay,
  setChartDisplay,
  loading,
}: {
  chartDisplay: 'volume' | 'tvl';
  setChartDisplay: (display: 'volume' | 'tvl') => void;
  loading?: boolean;
}) {
  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="pb-7">
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-base float-left">$&nbsp;-</div>
          <ChartChangeButton
            className="self-start"
            noData={true}
            chartDisplay={chartDisplay}
            setChartDisplay={setChartDisplay}
          />
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

      <div>
        <div
          style={{
            width: '300px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1px',
            transform: 'rotate(90deg)',
            position: 'relative',
            bottom: '140px',
            left: '150px',
          }}
        />
        <div
          style={{
            borderBottom: '1px solid #ffffff',
            boxSizing: 'border-box',
            width: '13px',
            height: '13px',
            position: 'relative',
            left: '295px',
            top: '4px',
            backgroundColor: '#00d6af',
            opacity: 0.4,
          }}
          className="rounded-full"
        />
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
}: {
  data: volumeDataType[];
  chartDisplay: 'volume' | 'tvl';
  setChartDisplay: (display: 'volume' | 'tvl') => void;
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
      />
    );
  if (data.length === 0)
    return (
      <EmptyChart
        chartDisplay={chartDisplay}
        setChartDisplay={setChartDisplay}
      />
    );

  return (
    <>
      <div className="flex items-center justify-between self-start w-full">
        <div className="flex flex-col">
          <div className="text-white text-2xl">
            {`$${toInternationalCurrencySystem(
              typeof hoverIndex === 'number'
                ? data[hoverIndex].volume_dollar.toString()
                : data[data.length - 1].volume_dollar.toString()
            )}`}
          </div>
          <div className="text-xs text-gray-400">
            {typeof hoverIndex === 'number'
              ? formatDate(data[hoverIndex].dateString)
              : formatDate(data[data.length - 1].dateString)}
          </div>
        </div>
        <ChartChangeButton
          className="self-start"
          chartDisplay={chartDisplay}
          setChartDisplay={setChartDisplay}
        />
      </div>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={data}
          onMouseMove={(item: any) => setHoverIndex(item.activeTooltipIndex)}
        >
          <XAxis
            dataKey="dateString"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value, index) => value.split('-').pop()}
          />
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
}: {
  data: TVLDataType[];
  chartDisplay: 'volume' | 'tvl';
  setChartDisplay: (display: 'volume' | 'tvl') => void;
}) {
  const [hoverIndex, setHoverIndex] = useState<number>(null);
  if (!data)
    return (
      <EmptyChart
        setChartDisplay={setChartDisplay}
        chartDisplay={chartDisplay}
        loading={true}
      />
    );

  if (data.length === 0)
    return (
      <EmptyChart
        setChartDisplay={setChartDisplay}
        chartDisplay={chartDisplay}
      />
    );

  return (
    <>
      <div className="flex items-center justify-between self-start w-full">
        <div className="flex flex-col">
          <div className="text-white text-2xl">
            {`$${toInternationalCurrencySystem(
              typeof hoverIndex === 'number'
                ? data[hoverIndex].total_tvl.toString()
                : data[data.length - 1].total_tvl.toString()
            )}`}
          </div>
          <div className="text-xs text-gray-400">
            {typeof hoverIndex === 'number'
              ? formatDate(data[hoverIndex].date)
              : formatDate(data[data.length - 1].date)}
          </div>
        </div>
        <ChartChangeButton
          className="self-start"
          chartDisplay={chartDisplay}
          setChartDisplay={setChartDisplay}
        />
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
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value, index) => value.split('-').pop()}
          />

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

export function PoolDetailsPage() {
  const { id } = useParams<ParamTypes>();
  const { state } = useLocation<LocationTypes>();
  const { pool, shares, stakeList } = usePool(id);
  const dayVolume = useDayVolume(id);
  const tokens = useTokens(pool?.tokenIds);

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

  const handleSaveWatchList = () => {
    if (!wallet.isSignedIn()) {
      wallet.requestSignIn(REF_FARM_CONTRACT_ID);
    } else {
      addPoolToWatchList({ pool_id: id }).then(() => {
        setShowFullStar(true);
      });
    }
  };

  const handleRemoveFromWatchList = () => {
    removePoolFromWatchList({ pool_id: id }).then(() => {
      setShowFullStar(false);
    });
  };

  const isStablePool = (pool: PoolDetails) => {
    return pool?.tokenIds.length > 2;
  };

  useEffect(() => {
    if (state?.tvl > 0) {
      setPoolTVL(state?.tvl);
    } else {
      getPool(id).then((pool) => {
        setPoolTVL(pool?.tvl);
      });
    }
    canFarm(Number(id)).then((canFarm) => {
      setBackToFarmsButton(!!canFarm);
      setFarmCount(canFarm);
    });

    getWatchListFromDb({ pool_id: id }).then((watchlist) => {
      setShowFullStar(watchlist.length > 0);
    });
  }, []);

  if (!pool || !tokens || tokens.length < 2) return <Loading />;
  if (isStablePool(pool)) {
    history.push('/');
  }

  if (isStablePool(pool)) {
    history.push('/');
  }

  return (
    <div>
      <div className="md:w-11/12 xs:w-11/12 w-4/6 lg:w-5/6 xl:w-4/5 m-auto">
        <BreadCrumb
          routes={[
            { id: 'top_pools', msg: 'Top Pools', pathname: '/pools' },
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
              id: 'detail',
              msg: 'Detail',
              pathname: `/pool`,
            },
          ]}
        />
      </div>
      <div className="flex items-start flex-row md:w-11/12 xs:w-11/12 w-4/6 lg:w-5/6 xl:w-4/5 md:flex-col xs:flex-col m-auto">
        <div className="md:w-full xs:w-full">
          <Card
            className="rounded-2xl mr-3 lg:w-96 md:w-full xs:w-full"
            padding="p-0"
            bgcolor="bg-cardBg"
          >
            <div className="flex flex-col text-center text-base mx-4 py-4">
              <div className="flex items-center justify-end mb-4">
                {backToFarmsButton ? (
                  <Link
                    to={{
                      pathname: '/farms',
                    }}
                    target="_blank"
                  >
                    <FarmButton farmCount={farmCount} />
                  </Link>
                ) : (
                  <span>' '</span>
                )}
                <div className="lg:hidden ml-2">
                  <div onClick={handleSaveWatchList}>
                    {!showFullStart && <WatchListStartEmpty />}
                  </div>
                  <div onClick={handleRemoveFromWatchList}>
                    {showFullStart && <WatchListStartFull />}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-end">
                  <Icon icon={tokens[0].icon} className="h-10 w-10 mr-2" />
                  <div className="flex items-start flex-col">
                    <div className="text-white text-base">
                      {toRealSymbol(tokens[0].symbol)}
                    </div>
                    <a
                      target="_blank"
                      href={`/swap/#${tokens[0].id}|${tokens[1].id}`}
                      className="text-xs text-gray-400"
                      title={tokens[0].id}
                    >{`${tokens[0].id.substring(0, 24)}${
                      tokens[0].id.length > 24 ? '...' : ''
                    }`}</a>
                  </div>
                </div>
                <div
                  className="text-white text-sm"
                  title={toReadableNumber(
                    tokens[0].decimals,
                    pool.supplies[tokens[0].id]
                  )}
                >
                  {Number(
                    toReadableNumber(
                      tokens[0].decimals,
                      pool.supplies[tokens[0].id]
                    )
                  ) < 0.01 &&
                  Number(
                    toReadableNumber(
                      tokens[0].decimals,
                      pool.supplies[tokens[0].id]
                    )
                  ) > 0
                    ? '< 0.01'
                    : toInternationalCurrencySystem(
                        toReadableNumber(
                          tokens[0].decimals,
                          pool.supplies[tokens[0].id]
                        )
                      )}
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-end">
                  <Icon icon={tokens[1].icon} className="h-10 w-10 mr-2" />
                  <div className="flex items-start flex-col">
                    <div className="text-white text-base">
                      {toRealSymbol(tokens[1].symbol)}
                    </div>
                    <a
                      target="_blank"
                      href={`/swap/#${tokens[0].id}|${tokens[1].id}`}
                      className="text-xs text-gray-400"
                      title={tokens[1].id}
                    >{`${tokens[1].id.substring(0, 24)}${
                      tokens[1].id.length > 24 ? '...' : ''
                    }`}</a>
                  </div>
                </div>
                <div
                  className="text-white text-sm
                "
                  title={toReadableNumber(
                    tokens[1].decimals,
                    pool.supplies[tokens[1].id]
                  )}
                >
                  {Number(
                    toReadableNumber(
                      tokens[1].decimals,
                      pool.supplies[tokens[1].id]
                    )
                  ) < 0.01 &&
                  Number(
                    toReadableNumber(
                      tokens[1].decimals,
                      pool.supplies[tokens[1].id]
                    )
                  ) > 0
                    ? '< 0.01'
                    : toInternationalCurrencySystem(
                        toReadableNumber(
                          tokens[1].decimals,
                          pool.supplies[tokens[1].id]
                        )
                      )}
                </div>
              </div>
              {/* rate */}
              <div className="flex justify-between text-sm md:text-xs xs:text-xs">
                <GetExchangeRate tokens={[tokens[0], tokens[1]]} pool={pool} />
                <GetExchangeRate tokens={[tokens[1], tokens[0]]} pool={pool} />
              </div>
            </div>
            <div className="border-b border-solid border-gray-600" />
            <div className="text-sm text-gray-400 pt-4 mx-4">
              {/* fee */}
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <FormattedMessage id="fee" defaultMessage="Fee" />
                </div>
                <div className="text-xs text-white border-greenLight border px-2 rounded-sm">{`${calculateFeePercent(
                  pool.fee
                )}%`}</div>
              </div>
              {/* TVL */}
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <FormattedMessage id="tvl" defaultMessage="TVL" />
                </div>
                <div className="text-base text-white">
                  {' '}
                  ${toInternationalCurrencySystem(poolTVL?.toString())}
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <FormattedMessage
                    id="h24_volume"
                    defaultMessage="24h volume"
                  />
                </div>
                <div className="text-white">
                  {dayVolume ? toInternationalCurrencySystem(dayVolume) : '-'}
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <FormattedMessage
                    id="total_shares"
                    defaultMessage="Total Shares"
                  />
                </div>
                <div className=" text-white">
                  {toInternationalCurrencySystem(
                    toReadableNumber(24, pool?.shareSupply)
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2.5 pb-5">
                <div>
                  <FormattedMessage id="my_shares" defaultMessage="My Shares" />
                </div>
                <div className="text-white">
                  <MyShares
                    shares={shares}
                    totalShares={pool.shareSupply}
                    poolId={pool.id}
                    stakeList={stakeList}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* chart */}
        <div className="w-full flex flex-col h-full">
          <div className="lg:flex items-center justify-end mb-4">
            <div className="flex items-center xs:hidden md:hidden">
              <div className="mr-2 cursor-pointer">
                <div onClick={handleSaveWatchList}>
                  {!showFullStart && <WatchListStartEmpty />}
                </div>
                <div onClick={handleRemoveFromWatchList}>
                  {showFullStart && <WatchListStartFull />}
                </div>
              </div>
              <div className="text-gray-400 text-xs whitespace-nowrap ">
                <FormattedMessage
                  id={showFullStart ? 'remove_watchlist' : 'add_watchlist'}
                  defaultMessage={
                    showFullStart ? 'Remove Watchlist' : 'Add Watchlist'
                  }
                />
              </div>
            </div>

            <div className="lg:flex items-center justify-end xs:mt-4 md:mt-4 xs:grid xs:grid-cols-2 md:grid md:grid-cols-2 w-full">
              <div className="pr-2">
                <SolidButton
                  padding="px-0"
                  className="w-48 h-10 xs:w-full  md:w-full xs:col-span-1 md:col-span-1 md:text-sm xs:text-sm"
                  onClick={() => {
                    setShowFunding(true);
                  }}
                >
                  <FormattedMessage
                    id="add_liquidity"
                    defaultMessage="Add Liquidity"
                  />
                </SolidButton>
              </div>
              <div className="pl-2">
                <OutlineButton
                  padding="px-0"
                  onClick={() => {
                    setShowWithdraw(true);
                  }}
                  className="w-48 h-10 xs:w-full md:w-full xs:col-span-1 md:col-span-1 md:text-sm xs:text-sm bg-poolRowHover"
                >
                  <FormattedMessage
                    id="remove_liquidity"
                    defaultMessage="Remove Liquidity"
                  />
                </OutlineButton>
              </div>
            </div>
          </div>

          <Card
            width="w-full"
            className="relative rounded-2xl h-full flex flex-col justify-center md:hidden xs:hidden items-center"
            padding="px-7 py-5"
            bgcolor="bg-cardBg"
            style={{
              height: '397px',
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
      </div>
    </div>
  );
}
