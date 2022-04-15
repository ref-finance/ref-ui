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
import SelectToken, { tokenPrice } from './SelectToken';
import { toPrecision, multiply, ONLY_ZEROS } from '../../utils/numbers';
import { FormattedMessage } from 'react-intl';
import { SmallWallet } from '../../components/icon/SmallWallet';
import { RefIcon } from '../../components/icon/Common';
import { currentTokensPrice } from '../../services/api';
import { IconLeft } from '../tokens/Icon';
import { toRealSymbol } from '../../utils/token';
import { ArrowDownGreen, ArrowDownWhite } from '../icon/Arrows';

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

export function HalfAndMaxAmount({
  max,
  onChangeAmount,
  token,
  forCrossSwap,
}: {
  max: string;
  token: TokenMetadata;
  onChangeAmount: (amount: string) => void;
  forCrossSwap?: boolean;
}) {
  return (
    <div className="flex items-center">
      <span
        className={`px-2 py-1 hover:bg-black hover:bg-opacity-20 cursor-pointer ${
          forCrossSwap ? 'hover:text-gradientFrom' : ''
        }  rounded-3xl text-primaryText text-xs`}
        onClick={() => {
          const half = percentOfBigNumber(50, max, token.decimals);

          onChangeAmount(half);
        }}
      >
        <FormattedMessage id="half" defaultMessage="Half" />
      </span>

      <span
        className={`px-2 py-1 hover:bg-black hover:bg-opacity-20 cursor-pointer rounded-3xl ${
          forCrossSwap ? 'hover:text-gradientFrom' : ''
        } text-primaryText text-xs`}
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

export function TokenCardIn({
  tokenIn,
  max,
  onChangeAmount,
  tokenPriceList,
  tokens,
  onSelectToken,
  balances,
  amount,
}: {
  tokenIn: TokenMetadata;
  max: string;
  onChangeAmount: (amount: string) => void;
  tokenPriceList?: Record<string, any>;
  tokens: TokenMetadata[];
  onSelectToken?: (token: TokenMetadata) => void;
  balances: TokenBalancesView;
  amount: string;
}) {
  const [hoverSelectToken, setHoverSelectToken] = useState(false);

  const price = tokenPriceList?.[tokenIn?.id]?.price || null;

  return (
    <div
      className="bg-black bg-opacity-20 p-5 flex flex-col"
      style={{
        borderRadius: '20px',
      }}
    >
      <div className="flex items-center justify-between pb-4">
        <span className="text-sm text-primaryText">
          <FormattedMessage id="from" defaultMessage="From" />
        </span>
        <div className="text-xs text-primaryText flex items-center">
          <HalfAndMaxAmount
            token={tokenIn}
            max={max}
            onChangeAmount={onChangeAmount}
            forCrossSwap
          />
          <span className="ml-2">{max}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SelectToken
          tokenPriceList={tokenPriceList}
          tokens={tokens}
          selected={
            <div
              className="flex font-semibold "
              onMouseEnter={() => setHoverSelectToken(true)}
              onMouseLeave={() => setHoverSelectToken(false)}
            >
              {tokenIn ? (
                <IconLeft token={tokenIn} hover={hoverSelectToken} />
              ) : null}
            </div>
          }
          onSelect={onSelectToken}
          balances={balances}
        />

        <div className="flex flex-col items-end w-full">
          <input
            className="text-right text-white text-xl"
            value={amount}
            onChange={(e) => onChangeAmount(e.target.value)}
          />

          <div>
            {tokenPrice(
              price && !ONLY_ZEROS.test(amount) ? multiply(price, amount) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TokenCardOut({
  tokenOut,
  onSelectToken,
  tokenPriceList,
  tokens,
  balances,
}: {
  tokenOut: TokenMetadata;
  onSelectToken: (token: TokenMetadata) => void;

  tokenPriceList?: Record<string, any>;
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
}) {
  const [hoverSelectToken, setHoverSelectToken] = useState(false);

  return (
    <div
      className="bg-black bg-opacity-20 p-5"
      style={{
        borderRadius: '20px',
      }}
    >
      <div className="text-sm text-primaryText pb-4">
        <FormattedMessage id="to" defaultMessage="To" />
      </div>
      <SelectToken
        tokenPriceList={tokenPriceList}
        tokens={tokens}
        standalone
        selected={
          <div
            className="flex font-semibold w-full cursor-pointer"
            onMouseEnter={() => setHoverSelectToken(true)}
            onMouseLeave={() => setHoverSelectToken(false)}
          >
            {tokenOut ? (
              <div
                className={`flex items-center text-lg text-white justify-between w-full rounded-full flex-shrink-0 `}
                style={{ lineHeight: 'unset' }}
              >
                <div className="flex items-center">
                  <img
                    key={tokenOut.id}
                    className="mr-2 xs:ml-1 h-11 w-11 xs:h-9 xs:w-9 border rounded-full border-greenLight"
                    src={tokenOut.icon}
                  />
                  <p className="block text-lg">
                    {toRealSymbol(tokenOut.symbol)}
                  </p>
                </div>

                <div className="pl-2 xs:pl-1 text-xs">
                  {hoverSelectToken ? <ArrowDownGreen /> : <ArrowDownWhite />}
                </div>
              </div>
            ) : null}
          </div>
        }
        onSelect={onSelectToken}
        balances={balances}
      />
    </div>
  );
}
