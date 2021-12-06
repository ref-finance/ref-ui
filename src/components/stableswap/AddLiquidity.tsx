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
import { REF_FARM_CONTRACT_ID, wallet } from '~services/near';
import {
  addLiquidityToPool,
  addLiquidityToStablePool,
  Pool,
  predictLiquidityShares,
} from '~services/pool';
import { TokenBalancesView } from '~services/token';
import { usePredictShares } from '~state/pool';

import { isMobile } from '~utils/device';
import {
  calculateFairShare,
  percent,
  percentOf,
  toNonDivisibleNumber,
  toReadableNumber,
  toPrecision,
  percentLess,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import { ChooseAddType } from './LiquidityComponents';
import StableTokenList from './StableTokenList';
import { InfoLine } from './LiquidityComponents';
import { usePool } from '~state/pool';
import { LP_TOKEN_DECIMALS } from '~services/m-token';

export const STABLE_LP_TOKEN_DECIMALS = 18;
const SWAP_SLIPPAGE_KEY = 'REF_FI_STABLE_SWAP_ADD_LIQUIDITY_SLIPPAGE_VALUE';

const InfoCard = ({
  shares,
  minimumReceived,
}: {
  shares: string | JSX.Element;
  minimumReceived: string | JSX.Element;
}) => {
  return (
    <Card
      padding="py-4 mt-2 px-8"
      bgcolor="bg-cardBg"
      className="text-white w-full outline-none "
    >
      <InfoLine title="Shares" value={shares} />
      <InfoLine title="minimum received" value={minimumReceived} />
    </Card>
  );
};

function myShares({
  totalShares,
  userTotalShare,
}: {
  totalShares: string;
  userTotalShare: BigNumber;
}) {
  const sharePercent = percent(userTotalShare.valueOf(), totalShares);

  let displayPercent;
  if (Number(sharePercent) > 0 && Number(sharePercent) < 0.01) {
    displayPercent = '< 0.01';
  } else displayPercent = toPrecision(String(sharePercent), 2);

  return displayPercent + '% of Total';
}
export default function AddLiquidityComponent(props: {
  pool: Pool;
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
}) {
  const { pool, tokens, balances } = props;
  const { shares, stakeList } = usePool(pool.id);

  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [thirdTokenAmount, setThirdTokenAmount] = useState<string>('');
  const [addType, setAddType] = useState<string>('addAll');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [messageId, setMessageId] = useState<string>('add_liquidity');
  const [defaultMessage, setDefaultMessage] = useState<string>('Add Liquidity');
  const [error, setError] = useState<Error>();
  const intl = useIntl();
  const history = useHistory();
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [canDeposit, setCanDeposit] = useState<boolean>(false);
  const [farmStake, setFarmStake] = useState<string | number>('0');
  const predicedShares = usePredictShares({
    tokens,
    poolId: pool.id,
    firstTokenAmount,
    secondTokenAmount,
    thirdTokenAmount,
  });
  useEffect(() => {
    const seedIdList: string[] = Object.keys(stakeList);
    let tempFarmStake: string | number = '0';
    seedIdList.forEach((seed) => {
      const id = Number(seed.split('@')[1]);
      if (id == props.pool.id) {
        tempFarmStake = BigNumber.sum(farmStake, stakeList[seed]).valueOf();
      }
    });
    setFarmStake(tempFarmStake);
  }, [stakeList]);

  useEffect(() => {
    if (addType === 'addMax') {
      setFirstTokenAmount(
        toReadableNumber(tokens[0].decimals, balances[tokens[0].id])
      );
      setSecondTokenAmount(
        toReadableNumber(tokens[1].decimals, balances[tokens[1].id])
      );
      setThirdTokenAmount(
        toReadableNumber(tokens[2].decimals, balances[tokens[2].id])
      );
    }
  }, [addType]);

  useEffect(() => {
    const rememberedSlippageTolerance =
      localStorage.getItem(SWAP_SLIPPAGE_KEY) || slippageTolerance;

    setSlippageTolerance(Number(rememberedSlippageTolerance));
  }, []);

  const userTotalShare = BigNumber.sum(shares, farmStake, predicedShares);

  if (!balances) return null;

  const changeFirstTokenAmount = (amount: string) => {
    setError(null);
    if (Object.values(pool.supplies).every((s) => s === '0')) {
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
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[0].decimals, amount),
        totalContribution: pool.supplies[tokens[0].id],
      });
      const secondAmount = toReadableNumber(
        tokens[1].decimals,
        calculateFairShare({
          shareOf: pool.supplies[tokens[1].id],
          contribution: fairShares,
          totalContribution: pool.shareSupply,
        })
      );
      const thirdAmount = toReadableNumber(
        tokens[2].decimals,
        calculateFairShare({
          shareOf: pool.supplies[tokens[2].id],
          contribution: fairShares,
          totalContribution: pool.shareSupply,
        })
      );

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
    if (Object.values(pool.supplies).every((s) => s === '0')) {
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
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[1].decimals, amount),
        totalContribution: pool.supplies[tokens[1].id],
      });
      const firstAmount = toReadableNumber(
        tokens[0].decimals,
        calculateFairShare({
          shareOf: pool.supplies[tokens[0].id],
          contribution: fairShares,
          totalContribution: pool.shareSupply,
        })
      );
      const thirdAmount = toReadableNumber(
        tokens[2].decimals,
        calculateFairShare({
          shareOf: pool.supplies[tokens[2].id],
          contribution: fairShares,
          totalContribution: pool.shareSupply,
        })
      );

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
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setSecondTokenAmount(amount);
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
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[2].decimals, amount),
        totalContribution: pool.supplies[tokens[2].id],
      });
      const firstAmount = toReadableNumber(
        tokens[0].decimals,
        calculateFairShare({
          shareOf: pool.supplies[tokens[0].id],
          contribution: fairShares,
          totalContribution: pool.shareSupply,
        })
      );
      const secondAmount = toReadableNumber(
        tokens[1].decimals,
        calculateFairShare({
          shareOf: pool.supplies[tokens[1].id],
          contribution: fairShares,
          totalContribution: pool.shareSupply,
        })
      );

      setSecondTokenAmount(secondAmount);
      setFirstTokenAmount(firstAmount);
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

    setCanSubmit(false);
    setCanDeposit(false);

    if (firstTokenAmountBN.isGreaterThan(firstTokenBalanceBN)) {
      setCanDeposit(true);
      setMessageId('deposit_to_add_liquidity');
      setDefaultMessage('Deposit to Add Liquidity');

      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[0].symbol
        )}`
      );
    }

    if (secondTokenAmountBN.isGreaterThan(secondTokenBalanceBN)) {
      setCanDeposit(true);
      setMessageId('deposit_to_add_liquidity');
      setDefaultMessage('Deposit to Add Liquidity');
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[1].symbol
        )}`
      );
    }

    if (thirdTokenAmountBN.isGreaterThan(thirdTokenBalanceBN)) {
      setCanDeposit(true);
      setMessageId('deposit_to_add_liquidity');
      setDefaultMessage('Deposit to Add Liquidity');
      throw new Error(
        `${intl.formatMessage({ id: 'you_do_not_have_enough' })} ${toRealSymbol(
          tokens[2].symbol
        )}`
      );
    }

    if (!firstAmount || firstAmount === '0') {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      throw new Error(
        `${intl.formatMessage({
          id: 'must_provide_at_least_one_token_for',
        })} ${toRealSymbol(tokens[0].symbol)}`
      );
    }

    if (!secondAmount || secondAmount === '0') {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      throw new Error(
        `${intl.formatMessage({
          id: 'must_provide_at_least_one_token_for',
        })} ${toRealSymbol(tokens[1].symbol)}`
      );
    }

    if (!thirdAmount || thirdAmount === '0') {
      setCanSubmit(false);
      setMessageId('add_liquidity');
      setDefaultMessage('Add Liquidity');
      throw new Error(
        `${intl.formatMessage({
          id: 'must_provide_at_least_one_token_for',
        })} ${toRealSymbol(tokens[2].symbol)}`
      );
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

    if (!tokens[2]) {
      throw new Error(
        `${tokens[2].id} ${intl.formatMessage({
          id: 'is_not_exist',
        })}`
      );
    }

    setCanSubmit(true);
    setMessageId('add_liquidity');
    setDefaultMessage('Add Liquidity');
  }

  function submit() {
    const min_shares = percentLess(slippageTolerance, predicedShares);

    const amounts = [firstTokenAmount, secondTokenAmount, thirdTokenAmount].map(
      (amount, i) => toNonDivisibleNumber(tokens[i].decimals, amount)
    ) as [string, string, string];

    return addLiquidityToStablePool({
      id: 10,
      amounts,
      min_shares,
    });
  }

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
          addType={addType}
        />

        <div className="flex justify-center mx-2">
          {error && <Alert level="error" message={error.message} />}
        </div>

        <div className="text-xs px-8 pb-2 pt-6 mt-6 border-t border-primaryText border-opacity-30">
          <div className=" text-primaryText">
            <FormattedMessage id="fee" defaultMessage="Fee" />:
            <span className=" text-white pl-3">-</span>
          </div>
          <ChooseAddType addType={addType} setAddType={setAddType} />
          <StableSlipSelecter
            slippageTolerance={slippageTolerance}
            onChange={(slippage) => {
              setSlippageTolerance(slippage);
              localStorage.setItem(SWAP_SLIPPAGE_KEY, slippage?.toString());
            }}
          />
        </div>
        <div className="px-8">
          {wallet.isSignedIn() ? (
            <SolidButton
              disabled={!canSubmit}
              className="focus:outline-none px-4 w-full text-lg"
              onClick={() => {
                try {
                  submit();
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

      <InfoCard
        shares={myShares({ totalShares: pool.shareSupply, userTotalShare })}
        minimumReceived={toPrecision(
          percentLess(
            slippageTolerance,
            toReadableNumber(STABLE_LP_TOKEN_DECIMALS, predicedShares)
          ),
          3
        )}
      />
    </>
  );
}
