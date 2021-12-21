import BigNumber from 'bignumber.js';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import Alert from '~components/alert/Alert';
import { ConnectToNearBtn, SolidButton } from '~components/button/Button';
import { Card } from '~components/card/Card';
import { StableSlipSelecter } from '~components/forms/SlippageSelector';
import { Near } from '~components/icon';
import { TokenMetadata } from '~services/ft-contract';
import { REF_FARM_CONTRACT_ID, STABLE_POOL_ID, wallet } from '~services/near';
import {
  addLiquidityToPool,
  addLiquidityToStablePool,
  Pool,
  predictLiquidityShares,
  StablePool,
} from '~services/pool';
import { TokenBalancesView } from '~services/token';
import { usePredictShares } from '~state/pool';
import { useFarmStake } from '~state/farm';

import { isMobile } from '~utils/device';
import {
  calculateFairShare,
  percent,
  percentOf,
  toNonDivisibleNumber,
  toReadableNumber,
  toPrecision,
  percentLess,
  toRoundedReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import { ChooseAddType } from './LiquidityComponents';
import StableTokenList from './StableTokenList';
import { InfoLine } from './LiquidityComponents';
import { usePool } from '~state/pool';
import { shareToAmount } from '~services/stable-swap';
import { LP_TOKEN_DECIMALS } from '~services/m-token';

export const STABLE_LP_TOKEN_DECIMALS = 18;
const SWAP_SLIPPAGE_KEY = 'REF_FI_STABLE_SWAP_ADD_LIQUIDITY_SLIPPAGE_VALUE';

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

export default function AddLiquidityComponent(props: {
  pool: Pool;
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  totalShares: string;
  stakeList: Record<string, string>;
  stablePool: StablePool;
}) {
  const { pool, tokens, balances, totalShares, stakeList, stablePool } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [thirdTokenAmount, setThirdTokenAmount] = useState<string>('');
  const [addType, setAddType] = useState<string>('addAll');
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
  const predicedShares = usePredictShares({
    tokens,
    poolId: pool.id,
    firstTokenAmount,
    secondTokenAmount,
    thirdTokenAmount,
    stablePool,
  });
  const [slippageInvalid, setSlippageInvalid] = useState(false);

  useEffect(() => {
    if (addType === 'addMax') {
      setError(null);
      setCanAddLP(true);
      setCanDeposit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      setFirstTokenAmount(
        toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
      );
      setSecondTokenAmount(
        toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
      );
      setThirdTokenAmount(
        toReadableNumber(tokens[2].decimals, balances[tokens[2].id])
      );
    } else if (addType === 'addAll') {
      setError(null);
      setCanAddLP(false);
      setCanDeposit(false);
      setFirstTokenAmount('');
      setSecondTokenAmount('');
      setThirdTokenAmount('');
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
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = getFairShare(amount, tokens[0]);
      const secondAmount = getTokenShare(fairShares, tokens[1]);
      const thirdAmount = getTokenShare(fairShares, tokens[2]);

      setFirstTokenAmount(amount);
      setSecondTokenAmount(secondAmount);
      setThirdTokenAmount(thirdAmount);
      try {
        validate({
          firstAmount: amount,
          secondAmount,
          thirdAmount,
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
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = getFairShare(amount, tokens[1]);
      const firstAmount = getTokenShare(fairShares, tokens[0]);
      const thirdAmount = getTokenShare(fairShares, tokens[2]);

      setSecondTokenAmount(amount);
      setFirstTokenAmount(firstAmount);
      setThirdTokenAmount(thirdAmount);
      try {
        validate({
          firstAmount,
          secondAmount: amount,
          thirdAmount,
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
          tokens,
        });
      } catch (error) {
        setError(error);
      }
    } else {
      const fairShares = getFairShare(amount, tokens[2]);
      const firstAmount = getTokenShare(fairShares, tokens[0]);
      const secondAmount = getTokenShare(fairShares, tokens[1]);

      setFirstTokenAmount(firstAmount);
      setSecondTokenAmount(secondAmount);
      setThirdTokenAmount(amount);
      try {
        validate({
          firstAmount,
          secondAmount,
          thirdAmount: amount,
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
  }: {
    firstAmount: string;
    secondAmount: string;
    thirdAmount: string;
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

    setCanAddLP(true);
    setCanDeposit(false);

    const ONLY_ZEROS = /^0*\.?0*$/;

    if (
      !(
        firstTokenAmountBN.isEqualTo(firstTokenBalanceBN) &&
        secondTokenAmountBN.isEqualTo(secondTokenBalanceBN) &&
        thirdTokenAmountBN.isEqualTo(thirdTokenBalanceBN)
      ) &&
      addType === 'addMax'
    ) {
      setAddType('');
    } else if (
      firstTokenAmountBN.isEqualTo(firstTokenBalanceBN) &&
      secondTokenAmountBN.isEqualTo(secondTokenBalanceBN) &&
      thirdTokenAmountBN.isEqualTo(thirdTokenBalanceBN) &&
      !addType
    ) {
      setAddType('addMax');
    }

    if (firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN)) {
      setMessageId('deposit_to_add_liquidity');
      setDefaultMessage('Deposit to Add Liquidity');
      setCanAddLP(false);
      setCanDeposit(true);
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[0].symbol
        )}`
      );
    }

    if (secondTokenAmountBN.isGreaterThan(secondTokenBalanceBN)) {
      setMessageId('deposit_to_add_liquidity');
      setDefaultMessage('Deposit to Add Liquidity');
      setCanAddLP(false);
      setCanDeposit(true);
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[1].symbol
        )}`
      );
    }

    if (thirdTokenAmountBN.isGreaterThan(thirdTokenBalanceBN)) {
      setMessageId('deposit_to_add_liquidity');
      setDefaultMessage('Deposit to Add Liquidity');
      setCanAddLP(false);
      setCanDeposit(true);
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[2].symbol
        )}`
      );
    }

    if (
      (!firstAmount || ONLY_ZEROS.test(firstAmount)) &&
      (!secondAmount || ONLY_ZEROS.test(secondAmount)) &&
      (!thirdAmount || ONLY_ZEROS.test(thirdAmount))
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

    const amounts = [firstTokenAmount, secondTokenAmount, thirdTokenAmount].map(
      (amount, i) => toNonDivisibleNumber(tokens[i].decimals, amount)
    ) as [string, string, string];

    return addLiquidityToStablePool({
      id: Number(STABLE_POOL_ID),
      amounts,
      min_shares,
    });
  }

  const canSubmit = canDeposit || (canAddLP && !slippageInvalid);

  return (
    <>
      <Card
        padding="py-6"
        bgcolor="bg-cardBg"
        className="text-white w-full outline-none "
      >
        <div className="text-xl pb-4 px-8">
          <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
        </div>

        <StableTokenList
          changeFirstTokenAmount={changeFirstTokenAmount}
          changeSecondTokenAmount={changeSecondTokenAmount}
          changeThirdTokenAmount={changeThirdTokenAmount}
          firstTokenAmount={firstTokenAmount}
          secondTokenAmount={secondTokenAmount}
          thirdTokenAmount={thirdTokenAmount}
          tokens={tokens}
          balances={balances}
        />

        <ChooseAddType addType={addType} setAddType={setAddType} />

        <div className="text-xs px-8 pt-2 mt-6 border-t border-primaryText border-opacity-30">
          <StableSlipSelecter
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
          <div className="flex justify-center mx-2 mb-1">
            {error && <Alert level="error" message={error.message} />}
          </div>
          {wallet.isSignedIn() ? (
            <SolidButton
              disabled={!canSubmit}
              className="focus:outline-none px-4 w-full text-lg"
              onClick={() => {
                try {
                  canSubmit && submit();
                } catch (error) {
                  setError(error);
                }
              }}
            >
              <FormattedMessage
                id={messageId}
                defaultMessage={defaultMessage}
              />
            </SolidButton>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </Card>
    </>
  );
}
