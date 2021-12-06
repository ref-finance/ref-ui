import BigNumber from 'bignumber.js';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Alert from '~components/alert/Alert';
import { ConnectToNearBtn, SolidButton } from '~components/button/Button';
import { Card } from '~components/card/Card';
import InputAmount from '~components/forms/InputAmount';
import {
  PoolSlippageSelector,
  StableSlipSelecter,
} from '~components/forms/SlippageSelector';
import { Near } from '~components/icon';
import { TokenMetadata } from '~services/ft-contract';
import { REF_FARM_CONTRACT_ID, wallet } from '~services/near';
import {
  Pool,
  predictRemoveLiquidity,
  removeLiquidityFromStablePool,
  removeLiquidityByTokensFromStablePool,
  removeLiquidityFromPool,
} from '~services/pool';
import { TokenBalancesView } from '~services/token';
import { usePredictRemoveShares, useRemoveLiquidity } from '~state/pool';
import {
  percent,
  percentLess,
  percentOf,
  subtraction,
  toInternationalCurrencySystem,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import { STABLE_LP_TOKEN_DECIMALS } from './AddLiquidity';
import { InfoLine } from './LiquidityComponents';
import StableTokenList, {
  FlexibleStableTokenList,
  OneTokenSelector,
  StableTokensSymbol,
} from './StableTokenList';

const SWAP_SLIPPAGE_KEY = 'REF_FI_STABLE_SWAP_REMOVE_LIQUIDITY_SLIPPAGE_VALUE';
const SHARE_PERCENT_KEY = 'SHARE_PERCENT_VALUE';

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
const marks = {
  0: '0%',
  25: '26%',
  50: '50%',
  75: '75%',
  100: {
    style: {
      color: '#f50',
    },
    label: <strong>100%</strong>,
  },
};

export function RemoveLiquidityComponent(props: {
  shares: string;
  balances: TokenBalancesView;
  tokens: TokenMetadata[];
  pool: Pool;
}) {
  const { shares, tokens, balances, pool } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [thirdTokenAmount, setThirdTokenAmount] = useState<string>('');
  const [isPercentage, setIsPercentage] = useState<boolean>(true);
  const [amountByShare, setAmountByShare] = useState<string>('');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
  const intl = useIntl();
  const [sharePercentage, setSharePercentage] = useState<string>('0');
  const progressBarIndex = [0, 25, 50, 75, 100];
  const [receiveAmounts, setReceiveAmounts] = useState<string[]>(['', '', '']);

  const setAmountsFlexible = [
    setFirstTokenAmount,
    setSecondTokenAmount,
    setThirdTokenAmount,
  ];

  const predicedRemoveShares = usePredictRemoveShares({
    pool_id: pool.id,
    amounts: [firstTokenAmount, secondTokenAmount, thirdTokenAmount],
    tokens,
  });

  function validate({
    firstAmount,
    secondAmount,
    thirdAmount,
    tokens,
    balances,
  }: {
    firstAmount: string;
    secondAmount: string;
    thirdAmount: string;
    tokens: TokenMetadata[];
    balances: TokenBalancesView;
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
    setError(null);
    setCanSubmit(false);

    if (firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN)) {
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[0].symbol
        )}`
      );
    }

    if (secondTokenAmountBN.isGreaterThan(secondTokenBalanceBN)) {
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[1].symbol
        )}`
      );
    }

    if (thirdTokenAmountBN.isGreaterThan(thirdTokenBalanceBN)) {
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[2].symbol
        )}`
      );
    }

    if (
      Number(firstAmount) > 0 ||
      Number(secondAmount) > 0 ||
      Number(thirdAmount) > 0
    ) {
      setCanSubmit(true);
    }
  }

  function submit() {
    if (isPercentage)
      return removeLiquidityFromStablePool({
        id: pool.id,
        min_amounts: receiveAmounts as [string, string, string],
        shares,
      });
  }

  useEffect(() => {
    const rememberedSlippageTolerance =
      localStorage.getItem(SWAP_SLIPPAGE_KEY) || slippageTolerance;

    setSlippageTolerance(Number(rememberedSlippageTolerance));
  }, []);

  useEffect(() => {
    if (!isPercentage) {
      setSharePercentage('0');
      localStorage.setItem(SHARE_PERCENT_KEY, sharePercentage);
    } else {
      const sharePercentageNow = localStorage.getItem(SHARE_PERCENT_KEY) || '0';
      setCanSubmit(Number(sharePercentageNow) > 0);
      setSharePercentage(sharePercentageNow);
      const sharePercentOf = percentOf(
        Number(sharePercentageNow),
        toReadableNumber(STABLE_LP_TOKEN_DECIMALS, shares)
      ).toString();
      setAmountByShare(sharePercentOf);
    }
  }, [isPercentage]);

  useEffect(() => {
    setCanSubmit(Number(amountByShare) > 0);

    if (Number(amountByShare) === 0) {
      setReceiveAmounts(['0', '0', '0']);
      return;
    }

    const shareParam = toNonDivisibleNumber(
      STABLE_LP_TOKEN_DECIMALS,
      amountByShare
    );

    setCanSubmit(false);
    predictRemoveLiquidity(pool.id, shareParam).then((res) => {
      setCanSubmit(true);
      const finalAmounts = res.map((amount, i) =>
        toPrecision(percentLess(slippageTolerance, amount), 0)
      );
      setReceiveAmounts(finalAmounts);
    });
  }, [sharePercentage, tokens, slippageTolerance, amountByShare]);

  return (
    <Card
      padding="py-6 px-0"
      bgcolor="bg-cardBg"
      className="text-white outline-none w-full "
    >
      <div className="text-xl pb-4 px-8">
        <FormattedMessage
          id="remove_liquidity"
          defaultMessage="Remove Liquidity"
        />
      </div>

      <div className=" text-white flex justify-between text-xs pb-4 px-8">
        <span className="text-primaryText">
          <FormattedMessage id="my_shares" defaultMessage="Shares" />
        </span>
        <span>
          {toPrecision(toReadableNumber(STABLE_LP_TOKEN_DECIMALS, shares), 3)}
        </span>
      </div>
      <div
        className={`${
          isPercentage ? 'hidden' : ''
        } text-white flex justify-between text-xs pb-6 px-8`}
      >
        <span className="text-primaryText">
          <FormattedMessage
            id="shares_avaliable"
            defaultMessage="Shares avaliable"
          />
        </span>
        <span>
          {toRoundedReadableNumber({
            decimals: STABLE_LP_TOKEN_DECIMALS,
            number: subtraction(
              shares,
              toPrecision(
                percentLess(slippageTolerance, predicedRemoveShares),
                0
              )
            ),
            precision: 3,
          })}
        </span>
      </div>

      <div className="flex bg-inputDarkBg rounded text-white mx-8 p-1.5">
        <div
          className={`flex justify-center items-center w-2/4 rounded cursor-pointer ${
            isPercentage ? 'bg-framBorder' : ''
          }  h-9`}
          onClick={() => setIsPercentage(true)}
        >
          <FormattedMessage id="percentage" defaultMessage="Percentage" />
        </div>
        <div
          className={`flex justify-center items-center w-2/4 rounded cursor-pointer ${
            !isPercentage ? 'bg-framBorder' : ''
          }  h-9`}
          onClick={() => setIsPercentage(false)}
        >
          <FormattedMessage id="flexible" defaultMessage="Flexible" />
        </div>
      </div>
      {/* Remove as percentage */}
      {isPercentage && (
        <section className="mx-8">
          <p className=" text-primaryText text-xs mt-4 mb-6">
            <FormattedMessage
              id="remove_tip"
              defaultMessage="No fee in removing liquidity as percentage"
            />
          </p>

          <div className="flex">
            <div className="flex items-center justify-between mr-4">
              <p className="text-gray-400 text-xs whitespace-nowrap">
                <FormattedMessage
                  id="shares_removed"
                  defaultMessage="Shares removed"
                />
              </p>
            </div>
            {/* <div className="w-full h-12 text-white text-xl font-semibold bg-inputDarkBg rounded px-2 flex items-center justify-end">
              <div className="float-right">{sharePercentage}%</div>
            </div> */}
            <InputAmount
              value={amountByShare}
              onChangeAmount={(amount) => {
                setAmountByShare(amount);
                const percentage = toPrecision(
                  percent(
                    amount || '0',
                    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, shares)
                  ).toString(),
                  0
                );
                setSharePercentage(percentage);
              }}
              className="w-full border border-transparent rounded"
              max={toReadableNumber(STABLE_LP_TOKEN_DECIMALS, shares)}
            />
          </div>
          <div className="my-4">
            <div className="flex items-center justify-between text-gray-400">
              {progressBarIndex.map((index, i) => {
                return (
                  <div className="flex flex-col items-center text-xs" key={i}>
                    <span>{index}%</span>
                    <span>∣</span>
                  </div>
                );
              })}
            </div>
            <div className="py-1 pr-1">
              <input
                onChange={(e) => {
                  const p = e.target.value;
                  setSharePercentage(e.target.value);
                  const sharePercentOf = percentOf(
                    Number(p),
                    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, shares)
                  ).toString();
                  setAmountByShare(sharePercentOf);
                }}
                value={sharePercentage}
                type="range"
                className="w-full"
                min="0"
                max="100"
                step="1"
              />
            </div>
          </div>
          <div className=" text-white flex justify-between text-xs mt-10 mb-5">
            <span className=" text-primaryText">
              <FormattedMessage
                id="remove_token_confirm"
                defaultMessage="You will remove RUST token"
              />
            </span>
            <span>-</span>
          </div>
          <StableTokensSymbol
            tokens={tokens}
            receiveAmounts={receiveAmounts}
            withPlus
          />
        </section>
      )}
      {/* remove as flexible */}
      {!isPercentage && (
        <section>
          <div className="px-8">
            <div className="text-primaryText mt-4 mb-6 text-xs">
              <FormattedMessage
                id="flexible_tip"
                defaultMessage="Remove how much you want per token"
              />
            </div>
            <FlexibleStableTokenList
              amountsFlexible={[
                firstTokenAmount,
                secondTokenAmount,
                thirdTokenAmount,
              ]}
              setAmountsFlexible={setAmountsFlexible}
              tokens={tokens}
              balances={balances}
              validate={validate}
              setError={setError}
              error={error}
            />
          </div>
        </section>
      )}

      <div className="mt-4 px-8 w-full border-primaryText border-opacity-30 border-t">
        <div
          className={`flex items-center justify-between text-xs text-primaryText pt-5 ${
            isPercentage ? 'hidden' : ''
          }`}
        >
          <div>
            <FormattedMessage
              id="shares_removed"
              defaultMessage="Shares removed"
            />
          </div>
          <div className="text-white">
            {toRoundedReadableNumber({
              decimals: STABLE_LP_TOKEN_DECIMALS,
              number: predicedRemoveShares,
              precision: 3,
            })}
          </div>
        </div>

        <div className={`${isPercentage ? 'py-4' : 'pb-4'} text-xs`}>
          <StableSlipSelecter
            slippageTolerance={slippageTolerance}
            onChange={(slippage) => {
              setSlippageTolerance(slippage);
              localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
            }}
          />
        </div>

        {wallet.isSignedIn() ? (
          <SolidButton
            disabled={!canSubmit}
            className={`focus:outline-none px-4 w-full text-lg`}
            onClick={async () => {
              try {
                await submit();
              } catch (error) {
                setError(error);
              }
            }}
          >
            <FormattedMessage
              id="remove_liquidity"
              defaultMessage="Remove Liquidity"
            />
          </SolidButton>
        ) : (
          <ConnectToNearBtn />
        )}
      </div>
    </Card>
  );
}
