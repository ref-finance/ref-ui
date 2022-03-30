import React, { useEffect, useMemo, useState } from 'react';
import { wallet } from '../../services/near';
import {
  toRoundedReadableNumber,
  percentOfBigNumber,
  toReadableNumber,
} from '../../utils/numbers';
import { TokenMetadata } from '../../services/ft-contract';
import { TokenBalancesView } from '../../services/token';
import Icon from '../tokens/Icon';
import InputAmount from './InputAmount';
import SelectToken from './SelectToken';
import { toPrecision, multiply, ONLY_ZEROS } from '../../utils/numbers';
import { FormattedMessage } from 'react-intl';
import { SmallWallet } from '../../components/icon/SmallWallet';
import { RefIcon } from '../../components/icon/Common';
import { currentTokensPrice } from '../../services/api';

interface TokenAmountProps {
  amount?: string;
  max?: string;
  total?: string;
  tokens?: TokenMetadata[];
  showSelectToken?: boolean;
  selectedToken: TokenMetadata;
  balances?: TokenBalancesView;
  onMax?: (input: HTMLInputElement) => void;
  onSelectToken?: (token: TokenMetadata) => void;
  onSearchToken?: (value: string) => void;
  onChangeAmount?: (amount: string) => void;
  text?: string;
  disabled?: boolean;
  useNearBalance?: boolean;
  forSwap?: boolean;
  isError?: boolean;
  tokenPriceList?: Record<string, any>;
}

function HalfAndMaxAmount({
  max,
  onChangeAmount,
  token,
}: {
  max: string;
  token: TokenMetadata;
  onChangeAmount: (amount: string) => void;
}) {
  return (
    <div className="flex items-center">
      <span
        className="px-2 py-1 hover:bg-black hover:bg-opacity-20 cursor-pointer  rounded-3xl mr-1 text-primaryText text-xs"
        onClick={() => {
          const half = percentOfBigNumber(50, max, token.decimals);

          onChangeAmount(half);
        }}
      >
        <FormattedMessage id="half" defaultMessage="Half" />
      </span>

      <span
        className="px-2 py-1 hover:bg-black hover:bg-opacity-20 cursor-pointer rounded-3xl ml-1 text-primaryText text-xs"
        onClick={() => {
          onChangeAmount(max);
        }}
      >
        <FormattedMessage id="max" defaultMessage="Max" />
      </span>
    </div>
  );
}

export default function TokenAmount({
  amount,
  max,
  total,
  tokens,
  selectedToken,
  balances,
  onSelectToken,
  onSearchToken,
  onChangeAmount,
  text,
  showSelectToken = true,
  disabled = false,
  useNearBalance,
  forSwap,
  isError,
  tokenPriceList,
}: TokenAmountProps) {
  const render = (token: TokenMetadata) =>
    toRoundedReadableNumber({
      decimals: token.decimals,
      number: balances ? balances[token.id] : '0',
    });

  const [hoverSelectToken, setHoverSelectToken] = useState<boolean>(false);

  const tokenPrice = tokenPriceList?.[selectedToken?.id]?.price || null;

  return (
    <>
      <div
        className={`flex items-center ${
          forSwap ? 'justify-between pl-2' : 'justify-end'
        } text-xs font-semibold pb-0.5 w-3/5 ${forSwap ? 'xs:w-full' : ''} `}
      >
        <span className="text-primaryText">
          {useNearBalance ? (
            <span className="mr-2 float-left">
              <SmallWallet />
            </span>
          ) : (
            <span className="mr-2 float-left text-primaryText">
              <RefIcon></RefIcon>
            </span>
          )}
          <FormattedMessage id="balance" defaultMessage="Balance" />
          :&nbsp;
          <span title={total}>{toPrecision(total, 3, true)}</span>
        </span>
        {forSwap && onChangeAmount ? (
          <HalfAndMaxAmount
            token={selectedToken}
            max={max}
            onChangeAmount={onChangeAmount}
          />
        ) : null}
      </div>
      <fieldset className="relative flex  align-center my-2">
        <InputAmount
          className="w-3/5 border border-transparent rounded"
          id="inputAmount"
          name={selectedToken?.id}
          max={max}
          value={amount}
          onChangeAmount={onChangeAmount}
          disabled={disabled}
          forSwap={!!forSwap}
          price={
            tokenPrice && !ONLY_ZEROS.test(amount) && !isError
              ? multiply(tokenPrice, amount)
              : null
          }
        />
        {showSelectToken && (
          <SelectToken
            tokenPriceList={tokenPriceList}
            tokens={tokens}
            render={render}
            selected={
              selectedToken && (
                <div
                  className="flex items-center justify-end font-semibold "
                  onMouseEnter={() => setHoverSelectToken(true)}
                  onMouseLeave={() => setHoverSelectToken(false)}
                >
                  <Icon token={selectedToken} hover={hoverSelectToken} />
                </div>
              )
            }
            onSelect={onSelectToken}
            balances={balances}
          />
        )}
        {!showSelectToken && selectedToken && (
          <div className="flex items-center justify-end font-semibold w-2/5">
            <Icon token={selectedToken} showArrow={false} />
          </div>
        )}
      </fieldset>
    </>
  );
}
