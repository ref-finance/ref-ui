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
import { StableSlipSelecter } from '../forms/SlippageSelector';
import { TokenMetadata } from '../../services/ft-contract';
import { STABLE_POOL_ID, wallet } from '../../services/near';
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
import StableTokenList from './StableTokenList';
import { WarnTriangle } from '../icon/SwapRefresh';
import { ActionModel } from '../../pages/AccountPage';
import { getDepositableBalance, useTokenBalances } from '../../state/token';
import { getCurrentWallet, WalletContext } from '../../utils/sender-wallet';
import SquareRadio from '../radio/SquareRadio';
import { DEFAULT_ACTIONS } from '../../pages/stable/StableSwapPage';
import StableTokenListUSN from './StableTokenListUSN';
import { getURLInfo, checkAccountTip } from '../layout/transactionTipPopUp';

export const STABLE_LP_TOKEN_DECIMALS = 18;
const getSwapSlippageKey = (id: string | number) =>
  `REF_FI_STABLE_SWAP_ADD_LIQUIDITY_SLIPPAGE_VALUE_${id}`;
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
    STABLE_LP_TOKEN_DECIMALS,
    displayUserTotalShare
  );

  const inPrecisionDisplayUserTotalShares =
    Number(nonPrecisionDisplayUserTotalShares) > 0 &&
    Number(nonPrecisionDisplayUserTotalShares) < 0.001
      ? '< 0.001'
      : toPrecision(nonPrecisionDisplayUserTotalShares, 3);

  return inPrecisionDisplayUserTotalShares + ' ' + `(${displayPercent}%)`;
}

export default function AddLiquidityComponentUSN(props: {
  pool: Pool;
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  totalShares: string;
  stakeList: Record<string, string>;
  stablePool: StablePool;
  changeAction?: (actionName: string) => void;
}) {
  const {
    pool,
    tokens,
    balances,
    totalShares,
    stakeList,
    stablePool,
    changeAction,
  } = props;

  const SWAP_SLIPPAGE_KEY_USN = getSwapSlippageKey(pool.id);

  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [addType, setAddType] = useState<string>('');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(
    Number(localStorage.getItem(SWAP_SLIPPAGE_KEY_USN)) || 0.1
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
    tokenAmounts: [firstTokenAmount, secondTokenAmount],
    stablePool,
  });
  const [slippageInvalid, setSlippageInvalid] = useState(false);
  const [modal, setModal] = useState(null);
  const [visible, setVisible] = useState(false);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  useEffect(() => {
    const firstAmount = toReadableNumber(
      tokens[0].decimals,
      balances[tokens[0].id]
    );

    const secondAmount = toReadableNumber(
      tokens[1].decimals,
      balances[tokens[1].id]
    );

    if (addType === 'addMax') {
      setError(null);
      setCanAddLP(
        !(ONLY_ZEROS.test(firstAmount) && ONLY_ZEROS.test(secondAmount))
      );
      setCanDeposit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      setFirstTokenAmount(firstAmount);
      setSecondTokenAmount(secondAmount);
    } else if (addType === 'addAll') {
      setError(null);
      setCanAddLP(false);
      setCanDeposit(false);
      setFirstTokenAmount('');
      setSecondTokenAmount('');
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
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = getFairShare(amount, tokens[0]);
      const secondAmount = getTokenShare(fairShares, tokens[1]);

      setFirstTokenAmount(amount);
      setSecondTokenAmount(secondAmount);
      try {
        validate({
          firstAmount: amount,
          secondAmount,
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
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = getFairShare(amount, tokens[1]);
      const firstAmount = getTokenShare(fairShares, tokens[0]);

      setSecondTokenAmount(amount);
      setFirstTokenAmount(firstAmount);
      try {
        validate({
          firstAmount,
          secondAmount: amount,
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
  }: {
    firstAmount: string;
    secondAmount: string;
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

    setCanAddLP(true);
    setCanDeposit(false);

    if (
      !(
        firstTokenAmountBN.isEqualTo(firstTokenBalanceBN) &&
        secondTokenAmountBN.isEqualTo(secondTokenBalanceBN)
      ) &&
      addType === 'addMax'
    ) {
      setAddType('');
    } else if (
      firstTokenAmountBN.isEqualTo(firstTokenBalanceBN) &&
      secondTokenAmountBN.isEqualTo(secondTokenBalanceBN) &&
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

    if (
      (!firstAmount || ONLY_ZEROS.test(firstAmount)) &&
      (!secondAmount || ONLY_ZEROS.test(secondAmount))
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

    const amounts = [firstTokenAmount, secondTokenAmount].map((amount, i) =>
      toNonDivisibleNumber(tokens[i].decimals, amount)
    ) as [string, string];

    return addLiquidityToStablePool({
      tokens: tokens,
      id: Number(pool.id),
      amounts,
      min_shares,
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
        />

        <StableTokenListUSN
          changeFirstTokenAmount={changeFirstTokenAmount}
          changeSecondTokenAmount={changeSecondTokenAmount}
          firstTokenAmount={firstTokenAmount}
          secondTokenAmount={secondTokenAmount}
          tokens={tokens}
          balances={balances}
        />

        <ChooseAddType addType={addType} setAddType={setAddType} />

        <div className="text-xs px-8 pt-2 mt-6 border-t border-primaryText border-opacity-30">
          <StableSlipSelecter
            slippageTolerance={slippageTolerance}
            onChange={(slippage) => {
              setSlippageTolerance(slippage);
              localStorage.setItem(SWAP_SLIPPAGE_KEY_USN, slippage?.toString());
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
              disabled={!canSubmit}
              className="focus:outline-none px-4 w-full text-lg"
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
