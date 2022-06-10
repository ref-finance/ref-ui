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
import { tokenPrice } from './SelectToken';
import { toInternationalCurrencySystem } from '../../utils/numbers';
import SelectToken, { StableSelectToken } from './SelectToken';
import { toPrecision, multiply, ONLY_ZEROS } from '../../utils/numbers';
import { FormattedMessage } from 'react-intl';
import { SmallWallet } from '~components/icon/SmallWallet';
import { RefIcon } from '../../components/icon/Common';
import { currentTokensPrice } from '../../services/api';
import { IconLeft } from '../tokens/Icon';
import { toRealSymbol } from '../../utils/token';
import { ArrowDownGreen, ArrowDownWhite } from '../icon/Arrows';
import { percentLess } from '../../utils/numbers';
import { isMobile } from '../../utils/device';
import { SWAP_MODE } from '../../pages/SwapPage';

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
  swapMode?: SWAP_MODE;
  preSelected?: TokenMetadata;
  postSelected?: TokenMetadata;
  onSelectPost?: (token: TokenMetadata) => void;
}

export function HalfAndMaxAmount({
  max,
  onChangeAmount,
  token,
  forCrossSwap,
  amount,
}: {
  max: string;
  token: TokenMetadata;
  onChangeAmount: (amount: string) => void;
  forCrossSwap?: boolean;
  amount?: string;
}) {
  const halfValue = percentOfBigNumber(50, max, token?.decimals);

  return (
    <div className="flex items-center">
      <span
        className={`px-2 py-1 hover:bg-black hover:bg-opacity-20 cursor-pointer ${'hover:text-gradientFrom'}  rounded-3xl ${
          amount === halfValue && !ONLY_ZEROS.test(halfValue)
            ? 'text-gradientFrom'
            : 'text-primaryText'
        } text-xs`}
        onClick={() => {
          const half = percentOfBigNumber(50, max, token.decimals);

          onChangeAmount(half);
        }}
      >
        <FormattedMessage id="half" defaultMessage="Half" />
      </span>

      <span
        className={`px-2 py-1 hover:bg-black hover:bg-opacity-20 cursor-pointer rounded-3xl ${'hover:text-gradientFrom'} ${
          amount === max && !ONLY_ZEROS.test(max)
            ? 'text-gradientFrom'
            : 'text-primaryText'
        } text-xs`}
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
  swapMode,
  preSelected,
  postSelected,
  onSelectPost,
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
            amount={amount}
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
        {showSelectToken &&
          (!swapMode || swapMode === SWAP_MODE.NORMAL ? (
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
          ) : (
            <StableSelectToken
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
              tokens={tokens}
              onSelect={onSelectToken}
              preSelected={preSelected}
              postSelected={postSelected}
              onSelectPost={onSelectPost}
            />
          ))}
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
  hidden,
}: {
  tokenIn: TokenMetadata;
  max: string;
  onChangeAmount: (amount: string) => void;
  tokenPriceList?: Record<string, any>;
  tokens: TokenMetadata[];
  onSelectToken?: (token: TokenMetadata) => void;
  balances: TokenBalancesView;
  amount: string;
  hidden: boolean;
}) {
  const [hoverSelectToken, setHoverSelectToken] = useState(false);

  const price = tokenPriceList?.[tokenIn?.id]?.price || null;
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  if (hidden) return null;

  return (
    <div
      className="bg-black bg-opacity-20 p-5 xs:px-4 py-5 flex flex-col"
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
            amount={amount}
          />
          <span className="ml-2">{toPrecision(max, 3, true)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <SelectToken
          tokenPriceList={tokenPriceList}
          tokens={tokens}
          forCross
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

        <div
          className="flex flex-col items-end"
          style={{
            width: !isMobile() ? '100%' : '55%',
          }}
        >
          <input
            className="text-right text-white text-xl xs:text-lg"
            value={amount}
            type="number"
            min="0"
            placeholder="0.0"
            onChange={(e) => onChangeAmount(e.target.value)}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
            step="any"
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
  hidden,
  max,
}: {
  tokenOut: TokenMetadata;
  onSelectToken: (token: TokenMetadata) => void;
  hidden: boolean;
  tokenPriceList?: Record<string, any>;
  tokens: TokenMetadata[];
  balances: TokenBalancesView;
  max: string;
}) {
  const [hoverSelectToken, setHoverSelectToken] = useState(false);
  if (hidden) return null;
  return (
    <div
      className="bg-black bg-opacity-20 py-5"
      style={{
        borderRadius: '20px',
      }}
    >
      <div className="text-sm text-primaryText pb-4 flex items-center justify-between px-5">
        <span>
          <FormattedMessage id="to" defaultMessage="To" />
        </span>

        <span className="ml-2 text-xs">{toPrecision(max, 3, true)}</span>
      </div>
      <SelectToken
        tokenPriceList={tokenPriceList}
        tokens={tokens}
        forCross
        standalone
        selected={
          <div
            className="flex font-semibold w-full cursor-pointer pl-4 xs:pl-3 pr-3"
            onMouseEnter={() => setHoverSelectToken(true)}
            onMouseLeave={() => setHoverSelectToken(false)}
          >
            {tokenOut ? (
              <div
                className={`flex items-center text-lg text-white justify-between w-full rounded-full flex-shrink-0  ${
                  hoverSelectToken ? 'bg-black bg-opacity-20 ' : ''
                }`}
                style={{ lineHeight: 'unset' }}
              >
                <div className="flex items-center">
                  <img
                    key={tokenOut.id}
                    className="mr-2 xs:ml-0 xs:mr-1  h-11 w-11 xs:h-7 xs:w-7 border rounded-full border-greenLight"
                    src={tokenOut.icon}
                  />
                  <p className="block text-lg xs:text-sm">
                    {toRealSymbol(tokenOut.symbol)}
                  </p>
                </div>

                <div className="pl-2 xs:pl-1 text-xs pr-4">
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

export function CrossSwapTokens({
  tokenIn,
  tokenOut,
  tokenPriceList,
  amountIn,
  amountOut,
  slippageTolerance,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenPriceList?: Record<string, any>;
  amountIn: string;
  amountOut: string;
  slippageTolerance: number;
}) {
  const tokenInPrice = tokenPriceList?.[tokenIn?.id]?.price || null;
  const tokenOutPrice = tokenPriceList?.[tokenOut?.id]?.price || null;

  if (!tokenIn || !tokenOut || !amountOut) return null;

  return (
    <div className="py-5 px-4 border bg-black bg-opacity-20 border-gradientFrom rounded-xl flex items-center justify-between relative">
      <div className="flex flex-col justify-between">
        <span className="text-white flex items-center xs:text-sm">
          <span>{toPrecision(amountIn, 3)}</span>
          <span className="ml-1">{toRealSymbol(tokenIn?.symbol)}</span>
          <div
            className=" text-2xl xs:text-xl font-bold ml-6 xs:ml-3"
            style={{
              color: '#7e8a93',
            }}
          >
            {'>'}
          </div>
        </span>
        <span className="text-sm xs:text-xs text-primaryText pt-1">
          {tokenInPrice ? tokenPrice(multiply(amountIn, tokenInPrice)) : null}
        </span>
      </div>

      <div className="flex flex-col justify-between items-end">
        <span className="text-gradientFrom font-bold text-xl xs:text-base">
          <span title={percentLess(slippageTolerance, amountOut)}>
            {toPrecision(percentLess(slippageTolerance, amountOut), 6)}
          </span>
          <span className="ml-1">{toRealSymbol(tokenOut?.symbol)}</span>
        </span>
        <span className="text-sm text-primaryText pt-1">
          {tokenOutPrice
            ? tokenPrice(multiply(amountOut, tokenOutPrice))
            : null}
        </span>
      </div>
    </div>
  );
}
