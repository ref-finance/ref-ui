import BigNumber from 'bignumber.js';
import React, { useEffect, useContext } from 'react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import Alert from '../alert/Alert';
import {
  ButtonTextWrapper,
  ConnectToNearBtn,
  SolidButton,
} from '../button/Button';
import { Card } from '../card/Card';
import { StableSlipSelector } from '../forms/SlippageSelector';

import { TokenMetadata } from '../../services/ft-contract';
import { USDTT_USDCC_USDT_USDC_POOL_ID, wallet } from '../../services/near';
import {
  addLiquidityToStablePool,
  Pool,
  StablePool,
} from '../../services/pool';
import { TokenBalancesView } from '../../services/token';
import { usePredictShares } from '../../state/pool';
import {
  calculateFairShare,
  percent,
  toNonDivisibleNumber,
  toReadableNumber,
  toPrecision,
  percentLess,
} from '../../utils/numbers';
import { ChooseAddType } from './LiquidityComponents';
import StableTokenListFour from './StableTokenListFour';
import { WarnTriangle } from '../icon/SwapRefresh';
import { ActionModel } from '../../pages/AccountPage';
import { getDepositableBalance, useTokenBalances } from '../../state/token';
import {
  getCurrentWallet,
  WalletContext,
} from '../../utils/wallets-integration';
import SquareRadio from '../radio/SquareRadio';
import { DEFAULT_ACTIONS } from '../../pages/stable/StableSwapPage';
import {
  constTransactionPage,
  useTranstionsExcuteDataStore,
} from '../../stores/transtionsExcuteData';
import { HiOutlinePlusSm } from '../reactIcons';

export const STABLE_LP_TOKEN_DECIMALS = 18;
export const RATED_POOL_LP_TOKEN_DECIMALS = 24;

const SWAP_SLIPPAGE_KEY = 'REF_FI_STABLE_SWAP_ADD_LIQUIDITY_SLIPPAGE_VALUE';
const ONLY_ZEROS = /^0*\.?0*$/;

export function myShares({
  totalShares,
  userTotalShare,
}: {
  totalShares: string;
  userTotalShare: BigNumber;
}) {
  const sharePercent = percent(userTotalShare.valueOf(), totalShares);

  const displayUserTotalShare = userTotalShare
    .toNumber()
    .toLocaleString('fullwide', { useGrouping: false });

  let displayPercent;
  if (Number(sharePercent) > 0 && Number(sharePercent) < 0.001) {
    displayPercent = '< 0.001';
  } else displayPercent = toPrecision(String(sharePercent), 3);

  const nonPrecisionDisplayUserTotalShares = toReadableNumber(
    RATED_POOL_LP_TOKEN_DECIMALS,
    displayUserTotalShare
  );

  const inPrecisionDisplayUserTotalShares =
    Number(nonPrecisionDisplayUserTotalShares) > 0 &&
    Number(nonPrecisionDisplayUserTotalShares) < 0.001
      ? '< 0.001'
      : toPrecision(nonPrecisionDisplayUserTotalShares, 3);

  return inPrecisionDisplayUserTotalShares + ' ' + `(${displayPercent}%)`;
}

export default function AddFourLiquidityComponent(props: {
  pool: Pool;
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  stablePool: StablePool;
  changeAction?: (actionName: string) => void;
}) {
  const { pool, tokens, balances, stablePool, changeAction } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [thirdTokenAmount, setThirdTokenAmount] = useState<string>('');
  const [fourTokenAmount, setFourTokenAmount] = useState<string>('');
  const [addType, setAddType] = useState<string>('');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(
    Number(localStorage.getItem(SWAP_SLIPPAGE_KEY)) || 0.1
  );
  const [messageId, setMessageId] = useState<string>('add_liquidity');
  const [defaultMessage, setDefaultMessage] = useState<string>('Add Liquidity');
  const [error, setError] = useState<Error>();
  const [canDeposit, setCanDeposit] = useState<boolean>(false);
  const intl = useIntl();
  const [canAddLP, setCanAddLP] = useState<boolean>(false);
  const history = useHistory();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const predicedShares = usePredictShares({
    poolId: pool.id,
    tokenAmounts: [
      firstTokenAmount,
      secondTokenAmount,
      thirdTokenAmount,
      fourTokenAmount,
    ],
    stablePool,
  });
  const [slippageInvalid, setSlippageInvalid] = useState(false);
  const [modal, setModal] = useState(null);
  const [visible, setVisible] = useState(false);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();

  useEffect(() => {
    const firstAmount = toReadableNumber(
      tokens[0].decimals,
      balances[tokens[0].id]
    );

    const secondAmount = toReadableNumber(
      tokens[1].decimals,
      balances[tokens[1].id]
    );

    const thirdAmount = toReadableNumber(
      tokens[2].decimals,
      balances[tokens[2].id]
    );
    const fourAmount = toReadableNumber(
      tokens[3].decimals,
      balances[tokens[3].id]
    );

    if (addType === 'addMax') {
      setError(null);
      setCanAddLP(
        !(
          ONLY_ZEROS.test(firstAmount) &&
          ONLY_ZEROS.test(secondAmount) &&
          ONLY_ZEROS.test(thirdAmount) &&
          ONLY_ZEROS.test(fourAmount)
        )
      );
      setCanDeposit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      setFirstTokenAmount(firstAmount);
      setSecondTokenAmount(secondAmount);
      setThirdTokenAmount(thirdAmount);
      setFourTokenAmount(fourAmount);
    } else if (addType === 'addAll') {
      setError(null);
      setCanAddLP(false);
      setCanDeposit(false);
      setFirstTokenAmount('');
      setSecondTokenAmount('');
      setThirdTokenAmount('');
      setFourTokenAmount('');
    }
  }, [addType]);

  if (!balances) return null;

  const getFairShare = (amount: string, token: TokenMetadata) => {
    return calculateFairShare({
      shareOf: pool.shareSupply,
      contribution: toNonDivisibleNumber(token.decimals, amount),
      totalContribution: pool.supplies[token.id],
    });
  };

  const getTokenShare = (fairShares: string, token: TokenMetadata) => {
    return toReadableNumber(
      token.decimals,
      calculateFairShare({
        shareOf: pool.supplies[token.id],
        contribution: fairShares,
        totalContribution: pool.shareSupply,
      })
    );
  };

  const changeFirstTokenAmount = (amount: string) => {
    setError(null);
    if (addType !== 'addAll') {
      setFirstTokenAmount(amount);
      try {
        validate({
          firstAmount: amount,
          secondAmount: secondTokenAmount,
          thirdAmount: thirdTokenAmount,
          fourAmount: fourTokenAmount,
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = getFairShare(amount, tokens[0]);
      const secondAmount = getTokenShare(fairShares, tokens[1]);
      const thirdAmount = getTokenShare(fairShares, tokens[2]);
      const fourAmount = getTokenShare(fairShares, tokens[3]);

      setFirstTokenAmount(amount);
      setSecondTokenAmount(secondAmount);
      setThirdTokenAmount(thirdAmount);
      setFourTokenAmount(fourAmount);
      try {
        validate({
          firstAmount: amount,
          secondAmount,
          thirdAmount,
          fourAmount,
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    }
  };

  const changeSecondTokenAmount = (amount: string) => {
    setError(null);
    if (addType !== 'addAll') {
      setSecondTokenAmount(amount);
      try {
        validate({
          firstAmount: firstTokenAmount,
          secondAmount: amount,
          thirdAmount: thirdTokenAmount,
          fourAmount: fourTokenAmount,
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = getFairShare(amount, tokens[1]);
      const firstAmount = getTokenShare(fairShares, tokens[0]);
      const thirdAmount = getTokenShare(fairShares, tokens[2]);
      const fourAmount = getTokenShare(fairShares, tokens[3]);

      setFirstTokenAmount(firstAmount);
      setSecondTokenAmount(amount);
      setThirdTokenAmount(thirdAmount);
      setFourTokenAmount(fourAmount);
      try {
        validate({
          firstAmount,
          secondAmount: amount,
          thirdAmount,
          fourAmount,
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    }
  };
  const changeThirdTokenAmount = (amount: string) => {
    setError(null);
    if (addType !== 'addAll') {
      setThirdTokenAmount(amount);
      try {
        validate({
          firstAmount: firstTokenAmount,
          secondAmount: secondTokenAmount,
          thirdAmount: amount,
          fourAmount: fourTokenAmount,
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = getFairShare(amount, tokens[2]);
      const firstAmount = getTokenShare(fairShares, tokens[0]);
      const secondAmount = getTokenShare(fairShares, tokens[1]);
      const fourAmount = getTokenShare(fairShares, tokens[3]);

      setFirstTokenAmount(firstAmount);
      setSecondTokenAmount(secondAmount);
      setThirdTokenAmount(amount);
      setFourTokenAmount(fourAmount);
      try {
        validate({
          firstAmount,
          secondAmount,
          thirdAmount: amount,
          fourAmount,
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    }
  };
  const changeFourTokenAmount = (amount: string) => {
    setError(null);
    if (addType !== 'addAll') {
      setFourTokenAmount(amount);
      try {
        validate({
          firstAmount: firstTokenAmount,
          secondAmount: secondTokenAmount,
          thirdAmount: thirdTokenAmount,
          fourAmount: amount,
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = getFairShare(amount, tokens[3]);
      const firstAmount = getTokenShare(fairShares, tokens[0]);
      const secondAmount = getTokenShare(fairShares, tokens[1]);
      const thirdAmount = getTokenShare(fairShares, tokens[2]);

      setFirstTokenAmount(firstAmount);
      setSecondTokenAmount(secondAmount);
      setThirdTokenAmount(thirdAmount);
      setFourTokenAmount(amount);
      try {
        validate({
          firstAmount,
          secondAmount,
          thirdAmount,
          fourAmount: amount,
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    }
  };

  function validate({
    firstAmount,
    secondAmount,
    thirdAmount,
    fourAmount,
  }: {
    firstAmount: string;
    secondAmount: string;
    thirdAmount: string;
    fourAmount: string;
    tokens: TokenMetadata[];
  }) {
    const firstTokenAmountBN = new BigNumber(firstAmount.toString());
    const firstTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
    );
    const secondTokenAmountBN = new BigNumber(secondAmount.toString());
    const secondTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
    );
    const thirdTokenAmountBN = new BigNumber(thirdAmount.toString());
    const thirdTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[2].decimals, balances[tokens[2].id])
    );
    const fourTokenAmountBN = new BigNumber(fourAmount.toString());
    const fourTokenBalanceBN = new BigNumber(
      toReadableNumber(tokens[3].decimals, balances[tokens[3].id])
    );

    setCanAddLP(true);
    setCanDeposit(false);

    if (
      !(
        firstTokenAmountBN.isEqualTo(firstTokenBalanceBN) &&
        secondTokenAmountBN.isEqualTo(secondTokenBalanceBN) &&
        thirdTokenAmountBN.isEqualTo(thirdTokenBalanceBN) &&
        fourTokenAmountBN.isEqualTo(fourTokenBalanceBN)
      ) &&
      addType === 'addMax'
    ) {
      setAddType('');
    } else if (
      firstTokenAmountBN.isEqualTo(firstTokenBalanceBN) &&
      secondTokenAmountBN.isEqualTo(secondTokenBalanceBN) &&
      thirdTokenAmountBN.isEqualTo(thirdTokenBalanceBN) &&
      fourTokenAmountBN.isEqualTo(fourTokenBalanceBN) &&
      !addType
    ) {
      setAddType('addMax');
    }

    if (firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN)) {
      setCanAddLP(false);
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
      setCanAddLP(false);
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

    if (thirdTokenAmountBN.isGreaterThan(thirdTokenBalanceBN)) {
      setCanAddLP(false);
      setCanDeposit(true);
      const { id, decimals } = tokens[2];
      const modalData: any = {
        token: tokens[2],
        action: 'deposit',
      };
      getDepositableBalance(id, decimals).then((nearBalance) => {
        modalData.max = nearBalance;
        setModal(Object.assign({}, modalData));
      });
      setModal(modalData);

      return;
    }
    if (fourTokenAmountBN.isGreaterThan(fourTokenBalanceBN)) {
      setCanAddLP(false);
      setCanDeposit(true);
      const { id, decimals } = tokens[3];
      const modalData: any = {
        token: tokens[3],
        action: 'deposit',
      };
      getDepositableBalance(id, decimals).then((nearBalance) => {
        modalData.max = nearBalance;
        setModal(Object.assign({}, modalData));
      });
      setModal(modalData);

      return;
    }

    if (
      (!firstAmount || ONLY_ZEROS.test(firstAmount)) &&
      (!secondAmount || ONLY_ZEROS.test(secondAmount)) &&
      (!thirdAmount || ONLY_ZEROS.test(thirdAmount)) &&
      (!fourAmount || ONLY_ZEROS.test(fourAmount))
    ) {
      setCanAddLP(false);
    }

    setMessageId('add_liquidity');
    setDefaultMessage('Add Liquidity');
  }

  function submit() {
    if (canDeposit) {
      history.push('/deposit');
      return;
    }
    const min_shares = toPrecision(
      percentLess(slippageTolerance, predicedShares),
      0
    );

    const amounts = [
      firstTokenAmount,
      secondTokenAmount,
      thirdTokenAmount,
      fourTokenAmount,
    ].map((amount, i) => toNonDivisibleNumber(tokens[i].decimals, amount)) as [
      string,
      string,
      string
    ];
    const tokensNode = [];
    tokens.forEach((d, i) => {
      tokensNode.push({
        token: d,
        amount: toReadableNumber(d.decimals, amounts[i]),
      });
      tokensNode.push({
        node: <HiOutlinePlusSm />,
      });
    });
    tokensNode.pop();
    transtionsExcuteDataStore.setActionData({
      status: 'pending',
      transactionId: String(Date.now()),
      page: constTransactionPage.pool,
      data: {
        prefix: 'Supplying',
        tokens: tokensNode,
      },
    });
setButtonLoading(false)
    return addLiquidityToStablePool({
      tokens,
      id: Number(USDTT_USDCC_USDT_USDC_POOL_ID),
      amounts,
      min_shares,
    })
      .then(({ response }) => {
        setButtonLoading(false);
        transtionsExcuteDataStore.setActionData({
          status: 'success',
          transactionResponse: response,
        });
        transtionsExcuteDataStore.setActionStatus('resolved');
      })
      .catch((e) => {
        setButtonLoading(false);
        transtionsExcuteDataStore.setActionData({
          status: 'error',
          transactionError: {
            message: e.message,
            transactionId: e.transactionId,
          },
        });
        transtionsExcuteDataStore.setActionStatus('rejected');
      });
  }

  const canSubmit = canAddLP && !slippageInvalid;

  return (
    <>
      <Card
        padding="pt-6 pb-16"
        bgcolor="bg-cardBg"
        className="text-white w-full outline-none "
      >
        <SquareRadio
          onChange={changeAction}
          radios={DEFAULT_ACTIONS}
          currentChoose={'add_liquidity'}
          poolId={pool.id}
        />

        <StableTokenListFour
          changeFirstTokenAmount={changeFirstTokenAmount}
          changeSecondTokenAmount={changeSecondTokenAmount}
          changeThirdTokenAmount={changeThirdTokenAmount}
          changeFourTokenAmount={changeFourTokenAmount}
          firstTokenAmount={firstTokenAmount}
          secondTokenAmount={secondTokenAmount}
          thirdTokenAmount={thirdTokenAmount}
          fourTokenAmount={fourTokenAmount}
          tokens={tokens}
          balances={balances}
        />

        <ChooseAddType addType={addType} setAddType={setAddType} />

        <div className="fourlp text-xs px-8 pt-2 mt-6 border-t border-primaryText border-opacity-30">
          <StableSlipSelector
            slippageTolerance={slippageTolerance}
            onChange={(slippage) => {
              setSlippageTolerance(slippage);
              localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
            }}
            setInvalid={setSlippageInvalid}
            invalid={slippageInvalid}
          />
          <div className="flex items-center justify-between text-xs  lg:pt-2 pb-6 xs:pt-5 md:pt-5">
            <div className="text-primaryText">
              <FormattedMessage
                id="minimum_shares"
                defaultMessage="Minimum shares"
              />
            </div>
            <div>
              {myShares({
                totalShares: BigNumber.sum(
                  pool.shareSupply,
                  percentLess(slippageTolerance, predicedShares)
                )
                  .toNumber()
                  .toLocaleString('fullwide', { useGrouping: false }),
                userTotalShare: new BigNumber(
                  toPrecision(percentLess(slippageTolerance, predicedShares), 0)
                ),
              })}
            </div>
          </div>
        </div>
        <div className="px-8">
          {error ? (
            <div className="flex justify-center mx-2 mb-1">
              {<Alert level="warn" message={error.message} />}
            </div>
          ) : null}

          {canDeposit ? (
            <div className="flex xs:flex-col md:flex-col justify-between items-center rounded-md p-4 xs:px-2 md:px-2 mb-5 border border-warnColor">
              <div className="flex items-center xs:mb-3 md:mb-3">
                <label className="flex-shrink-0">
                  <WarnTriangle />
                </label>
                <label className="ml-2.5 text-base text-warnColor xs:text-sm md:text-sm">
                  <FormattedMessage id="you_do_not_have_enough" />{' '}
                  {modal?.token?.symbol}！
                </label>
              </div>
            </div>
          ) : null}
          {isSignedIn ? (
            <SolidButton
              disabled={!canSubmit || buttonLoading}
              className="btn-AddFourLiquidityComponent focus:outline-none px-4 w-full text-lg"
              loading={buttonLoading}
              onClick={() => {
                try {
                  if (canSubmit) {
                    setButtonLoading(true);
                    submit();
                  }
                } catch (error) {
                  setError(error);
                }
              }}
            >
              <ButtonTextWrapper
                loading={buttonLoading}
                Text={() => (
                  <FormattedMessage
                    id={messageId}
                    defaultMessage={defaultMessage}
                  />
                )}
              />
            </SolidButton>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </Card>
      <ActionModel
        modal={modal}
        visible={visible}
        onRequestClose={setVisible}
      ></ActionModel>
    </>
  );
}
