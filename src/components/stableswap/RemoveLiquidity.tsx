import BigNumber from 'bignumber.js';
import React from 'react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Alert from '~components/alert/Alert';
import { SolidButton } from '~components/button/Button';
import { Card } from '~components/card/Card';
import { PoolSlippageSelector } from '~components/forms/SlippageSelector';
import { Near } from '~components/icon';
import { TokenMetadata } from '~services/ft-contract';
import { REF_FARM_CONTRACT_ID, wallet } from '~services/near';
import { Pool } from '~services/pool';
import { TokenBalancesView } from '~services/token';
import { useRemoveLiquidity } from '~state/pool';
import {
  toInternationalCurrencySystem,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
} from '~utils/numbers';
import { toRealSymbol } from '~utils/token';
import StableTokenList, { StableTokensSymbol } from './StableTokenList';

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
}) {
  const { shares, tokens, balances } = props;
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>('');
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>('');
  const [thirdTokenAmount, setThirdTokenAmount] = useState<string>('');
  const [isPercentage, setIsPercentage] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>('');
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [error, setError] = useState<Error>();
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
          id: 'must_input_a_value_not_greater_than_your_balance',
        })
      );
    }
    //return function of remove the liquidity
    return ''

  }

  return (
    <Card
      padding="p-8"
      bgcolor="bg-cardBg"
      className="text-white outline-none w-full "
    >
      <div className="text-base pb-4">
        <FormattedMessage
          id="remove_liquidity"
          defaultMessage="Remove Liquidity"
        />
      </div>

      <div className=" text-white flex justify-between text-sm">
        <span className=" text-primaryText">
          <FormattedMessage id="rst_token" defaultMessage="Your RST token" />
        </span>
        <span>0.999</span>
      </div>

      <div className="flex bg-black bg-opacity-20 rounded p-1 text-white">
        <div
          className={`flex justify-center items-center w-2/4 rounded ${isPercentage ? 'bg-framBorder' :''}  h-9`}
          onClick={() => setIsPercentage(true)}
        >
          <FormattedMessage
            id="remove_percentage"
            defaultMessage="Remove as percentage"
          />
        </div>
        <div
          className={`flex justify-center items-center w-2/4 rounded ${!isPercentage ? 'bg-framBorder' :''}  h-9`}
          onClick={() => setIsPercentage(false)}
        >
          <FormattedMessage
            id="remove_flexible"
            defaultMessage="Remove Flexible"
          />
        </div>
      </div>
      {/* Remove as percentage */}
      {isPercentage && (
        <section>
          <p className=" text-primaryText text-sm">
            <FormattedMessage
              id="remove_tip"
              defaultMessage="Romove as percentage will pay 0 fee"
            />
          </p>

          <div>
            <div className="flex">
              <FormattedMessage
                id="share_liquidity"
                defaultMessage="Share of liquidity"
              />
              <input
                max={99.99999}
                min={0.000001}
                defaultValue={25}
                step="any"
                className="border border-gradientFrom normal-input text-gradientFrom bg-opacity-0"
                type="number"
                placeholder=""
              />
              %
            </div>
            {/* <Slider marks={marks} included={false} defaultValue={37} /> */}
          </div>

          <div className=" text-white flex justify-between text-sm mt-10 mb-5">
            <span className=" text-primaryText">
              <FormattedMessage
                id="remove_token_confirm"
                defaultMessage="You will remove RST token"
              />
            </span>
            <span>不知道怎么取</span>
          </div>

          {/* 横着的一排token， with symbol and balance */}
          <StableTokensSymbol tokens={tokens} balances={balances} />
        </section>
      )}

      {!isPercentage && (
        <section>
          <div>
            <div className="text-xs mb-1 text-gray-400">
              <FormattedMessage id="balance" defaultMessage="Balance" />
            </div>
            <StableTokenList
              firstTokenAmount={firstTokenAmount}
              secondTokenAmount={secondTokenAmount}
              thirdTokenAmount={thirdTokenAmount}
              tokens={tokens}
              balances={balances}
            ></StableTokenList>
          </div>
          <div className=" border-t-1 border-b-1">
            <StableTokensSymbol tokens={tokens} balances={balances} />
          </div>
          <div className="pt-4 mb-8">
            <PoolSlippageSelector
              slippageTolerance={slippageTolerance}
              onChange={setSlippageTolerance}
            />
          </div>
        </section>
      )}

      <div className="flex justify-center">
        {error && <Alert level="error" message={error.message} />}
      </div>

      <div className="flex items-center justify-center">
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
          >
            <FormattedMessage
              id="remove_liquidity"
              defaultMessage="Remove Liquidity"
            />
          </SolidButton>
        ) : (
          <SolidButton
            className={`focus:outline-none px-4 w-full rounded-3xl`}
            onClick={() => wallet.requestSignIn(REF_FARM_CONTRACT_ID)}
          >
            <div className="w-full m-auto flex items-center justify-center">
              <div className="mr-2">
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
        )}
      </div>
    </Card>
  );
}
