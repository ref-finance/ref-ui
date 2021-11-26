import BigNumber from 'bignumber.js';
import React from 'react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import Alert from '~components/alert/Alert';
import { SolidButton } from '~components/button/Button';
import { Card } from '~components/card/Card';
import { StableSlipSelecter } from '~components/forms/SlippageSelector';
import { Near } from '~components/icon';
import { TokenMetadata } from '~services/ft-contract';
import { REF_FARM_CONTRACT_ID, wallet } from '~services/near';
import { addLiquidityToPool, Pool } from '~services/pool';
import { TokenBalancesView } from '~services/token';
import { isMobile } from '~utils/device';
import {
  calculateFairShare,
  toNonDivisibleNumber,
  toReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import { ChooseAddType } from './LiquidityComponents';
import StableTokenList from './StableTokenList';

export default function AddLiquidityComponent(props: {
  pool: Pool;
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
}) {
  const { pool, tokens, balances } = props;
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
      return (
        <SolidButton
          className="focus:outline-none px-4 w-full rounded-3xl"
          onClick={() => wallet.requestSignIn(REF_FARM_CONTRACT_ID)}
        >
          <div className="flex items-center justify-center w-full m-auto">
            <div className="mr-2">
              {' '}
              <Near />
            </div>
            <div>
              <FormattedMessage
                id="connect_to_near"
                defaultMessage="Connect to NEAR"
              />
            </div>
          </div>
        </SolidButton>
      );
    }

    const handleClick = async () => {
      if (canDeposit) {
        history.push(`/deposit`);
      } else if (canSubmit) {
        submit();
      }
    };
    return (
      <SolidButton
        disabled={!canSubmit && !canDeposit}
        className="focus:outline-none px-4 w-full"
        onClick={handleClick}
      >
        <div className="flex items-center justify-center w-full m-auto">
          <div>
            <FormattedMessage id={messageId} defaultMessage={defaultMessage} />
          </div>
        </div>
      </SolidButton>
    );
  };

  const onChangeSlip = (slippage: number) => {
    setSlippageTolerance(slippage);
  };

  return (
    <Card
      padding="p-8"
      bgcolor="bg-cardBg"
      className="text-white w-full outline-none "
    >
      <div className="flex items-start justify-between">
        <div className="text-base font-bold pb-4">
          <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
        </div>
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
      ></StableTokenList>

      <div className="flex justify-center mb-8 ">
        {error && <Alert level="error" message={error.message} />}
      </div>

      <div className=" text-sm">
        <div className=" text-primaryText">
          <FormattedMessage
            id="standard_gas"
            defaultMessage="Standard Gas fee:"
          />
          <span className=" text-white pl-3">不知道fee取什么</span>
        </div>
        <ChooseAddType addType={addType} setAddType={setAddType}/>
        <StableSlipSelecter slippageTolerance={slippageTolerance} onChange={onChangeSlip} />
      </div>
      <div className="flex items-center justify-center">
        <ButtonRender />
      </div>
    </Card>
  );
}
