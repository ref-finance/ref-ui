import BigNumber from 'bignumber.js';
import React, { useEffect, useState, useRef, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Alert from '../../components/alert/Alert';
import {
  ButtonTextWrapper,
  ConnectToNearBtn,
  SolidButton,
} from '../../components/button/Button';
import { Card } from '../../components/card/Card';
import InputAmount from '../../components/forms/InputAmount';
import QuestionMark from 'src/components/farm/QuestionMark';

import { StableSlipSelector } from '../../components/forms/SlippageSelector';
import { TokenMetadata } from '../../services/ft-contract';
import {
  Pool,
  removeLiquidityFromStablePool,
  removeLiquidityByTokensFromStablePool,
  StablePool,
} from '../../services/pool';
import { getRemoveLiquidityByShare } from '../../services/stable-swap';
import { TokenBalancesView } from '../../services/token';
import { usePredictRemoveShares, useRemoveLiquidity } from '../../state/pool';
import {
  percent,
  percentLess,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
  percentIncrese,
  scientificNotationToString,
} from '../../utils/numbers';
import { toRealSymbol } from 'src/utils/token';
import { STABLE_LP_TOKEN_DECIMALS } from './AddLiquidity';
import { InfoLine } from './LiquidityComponents';
import StableTokenList, {
  FlexibleStableTokenList,
  StableTokensSymbol,
} from './StableTokenList';
import { LP_STABLE_TOKEN_DECIMALS } from '../../services/m-token';
import { QuestionTip } from '../../components/layout/TipWrapper';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { percentOfBigNumber } from '../../utils/numbers';
import SquareRadio from '../radio/SquareRadio';
import { DEFAULT_ACTIONS } from '../../pages/stable/StableSwapPage';
import { getStablePoolDecimal } from '../../pages/stable/StableSwapEntry';
import {
  constTransactionPage,
  useTranstionsExcuteDataStore,
} from '../../stores/transtionsExcuteData';
import { HiOutlinePlusSm } from '../reactIcons';
const SWAP_SLIPPAGE_KEY = 'REF_FI_STABLE_SWAP_REMOVE_LIQUIDITY_SLIPPAGE_VALUE';

export function shareToUserTotal({
  shares,
  userTotalShare,
  pool,
  haveFarm,
}: {
  shares: string;
  userTotalShare: BigNumber;
  stakeList?: Record<string, string>;
  pool?: Pool;
  haveFarm: boolean;
}) {
  return (
    <div className="text-xs">
      <span className="text-white">
        {getCurrentWallet()?.wallet?.isSignedIn()
          ? toRoundedReadableNumber({
              decimals: getStablePoolDecimal(pool?.id),
              number: shares,
              precision: 3,
            })
          : '- '}
      </span>

      <span className={`text-primaryText ${!haveFarm ? 'hidden' : ''}`}>
        {getCurrentWallet()?.wallet?.isSignedIn()
          ? ` / ${toRoundedReadableNumber({
              decimals: getStablePoolDecimal(pool?.id),
              number: scientificNotationToString(
                userTotalShare.toExponential()
              ),
              precision: 3,
            })}`
          : '/ -'}
      </span>
    </div>
  );
}

export function RemoveLiquidityComponent(props: {
  shares: string;
  balances: TokenBalancesView;
  tokens: TokenMetadata[];
  pool: Pool;
  stablePool: StablePool;
  changeAction?: (actionName: string) => void;
}) {
  const [slippageInvalid, setSlippageInvalid] = useState(false);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const { shares, tokens, pool, stablePool, changeAction } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [thirdTokenAmount, setThirdTokenAmount] = useState<string>('');
  const [isPercentage, setIsPercentage] = useState<boolean>(true);
  const [amountByShare, setAmountByShare] = useState<string>('');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(
    Number(localStorage.getItem(SWAP_SLIPPAGE_KEY)) || 0.1
  );
  const [canSubmitByShare, setCanSubmitByShare] = useState<boolean>(false);

  const [error, setError] = useState<Error>(null);
  const [sharePercentage, setSharePercentage] = useState<string>('0');
  const progressBarIndex = [0, 25, 50, 75, 100];
  const [receiveAmounts, setReceiveAmounts] = useState<string[]>(['', '', '']);
  const intl = useIntl();

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();

  const byShareRangeRef = useRef(null);

  const setAmountsFlexible = [
    setFirstTokenAmount,
    setSecondTokenAmount,
    setThirdTokenAmount,
  ];

  const { predictedRemoveShares, canSubmitByToken } = usePredictRemoveShares({
    amounts: [firstTokenAmount, secondTokenAmount, thirdTokenAmount],
    setError,
    shares,
    stablePool,
  });

  function submit() {
    if (isPercentage) {
      const removeShares = toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        amountByShare
      );

      const min_amounts = receiveAmounts.map((amount, i) =>
        toNonDivisibleNumber(
          tokens[i].decimals,
          percentLess(
            slippageTolerance,

            toReadableNumber(tokens[i].decimals, amount)
          )
        )
      );

      const tokensNode = [];
      tokens.forEach((d, i) => {
        tokensNode.push({
          token: d,
          amount: toPrecision(toReadableNumber(d.decimals, min_amounts[i]), 3),
        });
        tokensNode.push({
          node: <HiOutlinePlusSm />,
        });
      });
      tokensNode.pop();
      transtionsExcuteDataStore.setActionData({
        status: 'pending',
        page: constTransactionPage.pool,
        data: {
          prefix: 'Removing',
          tokens: tokensNode,
        },
      });
      return removeLiquidityFromStablePool({
        tokens,
        id: pool.id,
        min_amounts: min_amounts as [string, string, string],
        shares: removeShares,
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
    } else {
      const amounts = [
        firstTokenAmount,
        secondTokenAmount,
        thirdTokenAmount,
      ].map((amount, i) => {
        return toNonDivisibleNumber(tokens[i].decimals, amount);
      }) as [string, string, string];

      const predict_burn = toPrecision(
        percentIncrese(slippageTolerance, predictedRemoveShares),
        0
      );

      const max_burn_shares = new BigNumber(predict_burn).isGreaterThan(shares)
        ? shares
        : predict_burn;

      const tokensNode = [];
      tokens.forEach((d, i) => {
        tokensNode.push({
          token: d,
          amount: toPrecision(toReadableNumber(d.decimals, amounts[i]), 3),
        });
        tokensNode.push({
          node: <HiOutlinePlusSm />,
        });
      });
      tokensNode.pop();
      transtionsExcuteDataStore.setActionData({
        status: 'pending',
        page: constTransactionPage.pool,
        data: {
          prefix: 'Removing',
          tokens: tokensNode,
        },
      });
      return removeLiquidityByTokensFromStablePool({
        tokens,
        id: pool.id,
        amounts,
        max_burn_shares,
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
  }

  const calcSharesRemoved = () => {
    const nonPrecisionValue = percentIncrese(
      slippageTolerance,
      toReadableNumber(STABLE_LP_TOKEN_DECIMALS, predictedRemoveShares)
    );

    const myReadableShare = toReadableNumber(STABLE_LP_TOKEN_DECIMALS, shares);

    if (error) return '0';

    return Number(nonPrecisionValue) > 0 && Number(nonPrecisionValue) < 0.001
      ? '< 0.001'
      : new BigNumber(nonPrecisionValue).isGreaterThan(
          new BigNumber(myReadableShare)
        )
      ? toPrecision(myReadableShare, 3)
      : toPrecision(nonPrecisionValue, 3);
  };

  useEffect(() => {
    setCanSubmitByShare(true);
    const readableShares = toReadableNumber(STABLE_LP_TOKEN_DECIMALS, shares);

    const shareParam = toNonDivisibleNumber(
      STABLE_LP_TOKEN_DECIMALS,
      amountByShare
    );

    if (
      Number(amountByShare) === 0 ||
      Number(amountByShare) > Number(readableShares)
    ) {
      setCanSubmitByShare(false);
      setReceiveAmounts(['0', '0', '0']);
      return;
    }
    // setCanSubmitByShare(false);

    const receiveAmounts = getRemoveLiquidityByShare(shareParam, stablePool);

    const parsedAmounts = receiveAmounts.map((amount, i) =>
      toRoundedReadableNumber({
        decimals: LP_STABLE_TOKEN_DECIMALS - tokens[i].decimals,
        number: amount,
        precision: 0,
        withCommas: false,
      })
    );

    setReceiveAmounts(parsedAmounts);
  }, [sharePercentage, tokens, amountByShare]);

  useEffect(() => {
    byShareRangeRef.current.style.backgroundSize = `${sharePercentage}% 100%`;
  }, [sharePercentage]);

  const canSubmit =
    ((isPercentage && canSubmitByShare) ||
      (!isPercentage && canSubmitByToken)) &&
    !slippageInvalid;

  const setAmountByShareFromBar = (sharePercent: string) => {
    setSharePercentage(sharePercent);

    const sharePercentOfValue = percentOfBigNumber(
      Number(sharePercent),
      toReadableNumber(STABLE_LP_TOKEN_DECIMALS, shares),
      STABLE_LP_TOKEN_DECIMALS
    );

    setAmountByShare(sharePercentOfValue);
  };

  return (
    <Card
      padding="pt-6 px-0 pb-16"
      bgcolor="bg-cardBg"
      className="text-white outline-none w-full "
    >
      <SquareRadio
        onChange={changeAction}
        radios={DEFAULT_ACTIONS}
        currentChoose={'remove_liquidity'}
        poolId={pool.id}
      />

      <div className="flex bg-inputDarkBg rounded text-white mx-8 xs:mx-5 md:mx-5 p-1.5 mb-8">
        <div
          className={`flex justify-center items-center w-2/4 rounded cursor-pointer ${
            isPercentage ? 'bg-stableTab' : ''
          }  h-9 xs:h-7 md:h-7`}
          onClick={() => setIsPercentage(true)}
        >
          <FormattedMessage id="by_share" defaultMessage="By Share" />
          <QuestionTip color="bright" id="remove_tip" />
        </div>

        <div
          className={`flex justify-center items-center w-2/4 rounded cursor-pointer ${
            !isPercentage ? 'bg-stableTab' : ''
          }  h-9 xs:h-7 md:h-7`}
          onClick={() => setIsPercentage(false)}
        >
          <FormattedMessage id="by_token" defaultMessage="By Token" />

          <QuestionTip id="flexible_tip" color="bright" />
        </div>
      </div>
      {/* Remove by share */}
      {isPercentage && (
        <section className="mx-8">
          <div className="flex">
            <div className="flex items-center justify-between mr-4">
              <p className="text-primaryText text-xs whitespace-nowrap">
                <FormattedMessage
                  id="shares_removed"
                  defaultMessage="Shares removed"
                />
              </p>
            </div>

            <InputAmount
              value={amountByShare}
              onChangeAmount={(amount) => {
                setAmountByShare(amount);

                const percentage =
                  Number(shares) > 0
                    ? percent(
                        amount || '0',
                        toReadableNumber(STABLE_LP_TOKEN_DECIMALS, shares)
                      ).toString()
                    : '0';

                setSharePercentage(scientificNotationToString(percentage));
              }}
              className="w-full border border-transparent rounded"
              max={toReadableNumber(STABLE_LP_TOKEN_DECIMALS, shares)}
            />
          </div>
          <div className="my-6 mb-8">
            <div className="flex items-center justify-between text-gray-400 px-1.5 ">
              {progressBarIndex.map((index, i) => {
                return (
                  <div
                    className="flex flex-col items-center text-xs cursor-pointer w-4"
                    key={i}
                    onClick={() => {
                      setAmountByShareFromBar(index.toString());
                    }}
                  >
                    <span>{index}%</span>
                    <span>∣</span>
                  </div>
                );
              })}
            </div>
            <div className="py-1 px-1">
              <input
                ref={byShareRangeRef}
                onChange={(e) => {
                  setAmountByShareFromBar(e.target.value);
                }}
                value={sharePercentage}
                type="range"
                className="w-full cursor-pointer remove-by-share-bar"
                min="0"
                max="100"
                step="any"
                inputMode="decimal"
              />
            </div>
          </div>
        </section>
      )}
      {/* remove by token */}
      {!isPercentage && (
        <section className="px-8">
          <FlexibleStableTokenList
            amountsFlexible={[
              firstTokenAmount,
              secondTokenAmount,
              thirdTokenAmount,
            ]}
            setAmountsFlexible={setAmountsFlexible}
            tokens={tokens}
          />
        </section>
      )}

      <div className="mt-4 px-8 w-full border-primaryText border-opacity-30 border-t">
        <div className="text-xs pt-2">
          <StableSlipSelector
            slippageTolerance={slippageTolerance}
            onChange={(slippage) => {
              setSlippageTolerance(slippage);
              localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
            }}
            setInvalid={setSlippageInvalid}
            invalid={slippageInvalid}
          />
          {isPercentage && (
            <div className="text-xs text-primaryText pb-8 pt-2 xs:pt-5 md:pt-5">
              <FormattedMessage
                id="minimum_received"
                defaultMessage="Minimum received"
              />
            </div>
          )}

          {isPercentage && (
            <StableTokensSymbol
              tokens={tokens}
              receiveAmounts={receiveAmounts}
              slippageTolerance={slippageTolerance}
            />
          )}
        </div>
        <div
          className={`flex items-center justify-between text-xs text-primaryText pb-6 xs:pt-5 md:pt-5 ${
            isPercentage ? 'hidden' : ''
          }`}
        >
          <div>
            <FormattedMessage
              id="shares_removed"
              defaultMessage="Shares removed"
            />
          </div>
          <div className="text-white">{calcSharesRemoved()}</div>
        </div>

        <div className="flex justify-center mx-2 mb-1">
          {error && !isPercentage && (
            <Alert
              level="warn"
              message={intl.formatMessage({ id: error.message })}
            />
          )}
        </div>

        {isSignedIn ? (
          <SolidButton
            disabled={!canSubmit || buttonLoading}
            className={`btn-classic-remove-liquidity focus:outline-none px-4 w-full text-lg`}
            onClick={async () => {
              if (canSubmit) {
                setButtonLoading(true);
                submit();
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
  );
}
