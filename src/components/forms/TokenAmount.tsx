import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  createRef,
} from 'react';
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
import { SelectTokenDCL, tokenPrice } from './SelectToken';
import {
  toInternationalCurrencySystem,
  toInternationalCurrencySystemLongString,
} from '../../utils/numbers';
import SelectToken, { StableSelectToken } from './SelectToken';
import {
  toPrecision,
  multiply,
  ONLY_ZEROS,
  scientificNotationToString,
} from '../../utils/numbers';
import { FormattedMessage } from 'react-intl';
import { SmallWallet } from '../../components/icon/SmallWallet';
import { RefIcon } from '../../components/icon/Common';
import { currentTokensPrice } from '../../services/api';
import { IconLeft, IconLeftV3 } from '../tokens/Icon';
import { toRealSymbol } from '../../utils/token';
import { ArrowDownGreen, ArrowDownWhite } from '../icon/Arrows';
import { percentLess } from '../../utils/numbers';
import { isMobile, useClientMobile } from '../../utils/device';
import { SWAP_MODE } from '../../pages/SwapPage';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import { InputAmountV3 } from './InputAmount';
import Big from 'big.js';
import { QuestionTip } from '../layout/TipWrapper';
import { regularizedPrice } from '../../services/swapV3';
import { LimitOrderTriggerContext } from '../swap/SwapCard';
import {
  RefreshIcon,
  LockIcon,
  ReduceIcon,
  PlusIcon,
  LockInIcon,
} from '../icon/swapV3';
import BigNumber from 'bignumber.js';
import { WalletContext } from '../../utils/wallets-integration';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

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
  onSelectPre?: (token: TokenMetadata) => void;
  forWrap?: boolean;
  showQuickButton?: boolean;
  ExtraElement?: JSX.Element;
  forLimitOrder?: boolean;
  marketPriceLimitOrder?: string;
  limitOrderDisable?: boolean;
  curRate?: string;
  onChangeRate?: (rate: string) => void;
  tokenIn?: TokenMetadata;
  tokenOut?: TokenMetadata;
  onBlur?: (e?: any) => void;
  limitFee?: number;
  setDiff?: (d: string) => void;
  allowWNEAR?: boolean;
  forCross?: boolean;
  nearErrorTip?: JSX.Element;
  isOut?: boolean;
}

export function getTextWidth(str: string, fontSize: string) {
  let result = 10;
  const mobile = isMobile();
  const ele = document.createElement('span');

  ele.innerText = str;
  ele.style.fontSize = fontSize;

  (document.body || document.documentElement).append(ele);

  result = ele.offsetWidth;

  (document.body || document.documentElement).removeChild(ele);
  return result;
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

export function HalfAndMaxAmountV3({
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
        className={`px-2 py-1 mr-2 cursor-pointer rounded-lg text-primaryText hover:text-gradientFrom ${
          amount === halfValue && !ONLY_ZEROS.test(halfValue)
            ? ' bg-black bg-opacity-20 border border-transparent'
            : ' border border-primaryText border-opacity-20 hover:border-gradientFrom '
        } text-xs`}
        onClick={() => {
          const half = percentOfBigNumber(50, max, token.decimals);

          onChangeAmount(half);
        }}
      >
        <FormattedMessage id="half" defaultMessage="Half" />
      </span>

      <span
        className={`px-2 py-1 cursor-pointer rounded-lg text-primaryText hover:text-gradientFrom ${
          amount === max && !ONLY_ZEROS.test(max)
            ? ' bg-black bg-opacity-20 border border-transparent'
            : 'border border-primaryText border-opacity-20 hover:border-gradientFrom '
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

export function QuickAmountLimitOrder({
  max,
  onChangeAmount,
  marketPrice,
  amount,
  plus10,
  plus5,
  plus1,
  minus1,
}: {
  max: string;
  amount?: string;
  onChangeAmount: (amount: string) => void;
  marketPrice: string;
  plus5: string;
  plus10: string;
  plus1: string;
  minus1: string;
}) {
  const { triggerFetch } = useContext(LimitOrderTriggerContext);

  return (
    <div className="flex items-center">
      <span
        className={`px-2 py-1 xs:hidden mr-1 w-5 h-5 flex items-center justify-center cursor-pointer rounded-md  ${'text-primaryText border border-primaryText border-opacity-20 hover:border hover:border-transparent hover:text-gradientFrom hover:border-gradientFrom'} text-lg`}
        onClick={() => {
          onChangeAmount(minus1);
        }}
      >
        -
      </span>
      <span className="mr-2 md:hidden lg:hidden">
        <QuestionTip id="price_on_slot_tip" dataPlace="bottom" />
      </span>
      <span
        className={`px-2 py-1 mr-2 xs:hidden flex items-center justify-center w-5 h-5 cursor-pointer rounded-md  ${'text-primaryText border border-primaryText border-opacity-20 hover:border hover:border-transparent hover:text-gradientFrom hover:border-gradientFrom'} text-lg`}
        onClick={() => {
          onChangeAmount(plus1);
        }}
      >
        +
      </span>

      <span
        className={`px-2 py-1 mr-2 cursor-pointer flex items-center h-5 rounded-xl  ${
          Number(amount) === Number(plus5)
            ? 'text-gradientFrom  border border-gradientFrom'
            : 'text-primaryText border border-primaryText border-opacity-20 hover:border hover:border-transparent hover:text-gradientFrom hover:border-gradientFrom'
        } text-xs`}
        onClick={() => {
          onChangeAmount(plus5);
        }}
      >
        +5%
      </span>

      <span
        className={`px-2 py-1 cursor-pointer rounded-xl h-5 mr-2 flex items-center ${
          Number(amount) === Number(plus10)
            ? 'text-gradientFrom  border border-gradientFrom'
            : 'text-primaryText border border-primaryText border-opacity-20 hover:border hover:border-transparent hover:text-gradientFrom hover:border-gradientFrom'
        } text-xs`}
        onClick={() => {
          onChangeAmount(plus10);
        }}
      >
        +10%
      </span>
      <span className="mr-2 xs:hidden">
        <QuestionTip id="price_on_slot_tip" dataPlace="bottom" />
      </span>
      <span
        className={`text-xs px-2 py-1 rounded-xl whitespace-nowrap h-5 cursor-pointer flex items-center
        ${
          Number(amount) === Number(max)
            ? 'text-v3Blue bg-v3Blue bg-opacity-10 border border-transparent'
            : 'text-primaryText border border-primaryText border-opacity-20 hover:border hover:border-transparent hover:text-v3Blue hover:bg-v3Blue hover:bg-opacity-10'
        }
        
        `}
        onClick={() => {
          onChangeAmount(marketPrice);
          triggerFetch && triggerFetch();
        }}
      >
        <FormattedMessage id="market_price" defaultMessage={'Market Price'} />
      </span>
    </div>
  );
}

export function QuickAmountLimitOrderMobile({
  onChangeAmount,
  amount,
  plus1,
  minus1,
}: {
  amount?: string;
  onChangeAmount: (amount: string) => void;
  plus1: string;
  minus1: string;
}) {
  const [hoverMinus, setHoverMinus] = useState<boolean>(false);

  const [hoverPlus, setHoverPlus] = useState<boolean>(false);

  return (
    <div className="flex items-center">
      <span
        className={`px-2 py-1 mr-1 ml-2 w-5 h-5 flex items-center justify-center cursor-pointer rounded-md  ${
          hoverMinus
            ? 'border border-transparent text-gradientFrom border-gradientFrom'
            : 'text-primaryText border border-primaryText border-opacity-20  '
        } text-lg`}
        onClick={() => {
          onChangeAmount(minus1);
        }}
        onTouchStart={() => {
          setHoverMinus(true);
        }}
        onTouchEnd={() => {
          setHoverMinus(false);
        }}
      >
        -
      </span>

      <span
        className={`px-2 py-1 mr-2 flex items-center justify-center w-5 h-5 cursor-pointer rounded-md ${
          hoverPlus
            ? 'border border-transparent text-gradientFrom border-gradientFrom'
            : 'text-primaryText border border-primaryText border-opacity-20  '
        } text-lg`}
        onClick={() => {
          onChangeAmount(plus1);
        }}
        onTouchStart={() => {
          setHoverPlus(true);
        }}
        onTouchEnd={() => {
          setHoverPlus(false);
        }}
      >
        +
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
  forWrap,
  allowWNEAR,
}: TokenAmountProps) {
  const render = (token: TokenMetadata) =>
    toRoundedReadableNumber({
      decimals: token.decimals,
      number: balances ? balances[token.id] : '0',
    });

  const [hoverSelectToken, setHoverSelectToken] = useState<boolean>(false);

  const tokenPrice = tokenPriceList?.[selectedToken?.id]?.price || null;

  const curMax =
    selectedToken?.id === WRAP_NEAR_CONTRACT_ID &&
    selectedToken?.symbol == 'NEAR' &&
    !forWrap
      ? Number(max) <= 0.5
        ? '0'
        : String(Number(max) - 0.5)
      : max;

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
            max={curMax}
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
          max={onChangeAmount ? curMax : null}
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
              allowWNEAR={allowWNEAR}
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

export function TokenAmountV3({
  amount,
  max,
  total,
  tokens,
  selectedToken,
  balances,
  onSelectToken,
  onSearchToken,
  onChangeAmount,
  forCross,
  text,
  showSelectToken = true,
  disabled = false,
  useNearBalance,
  forSwap,
  isError,
  tokenPriceList,
  forLimitOrder,
  tokenIn,
  tokenOut,
  onBlur,
  swapMode,
  preSelected,
  postSelected,
  onSelectPost,
  onSelectPre,
  forWrap,
  ExtraElement,
  marketPriceLimitOrder,
  limitOrderDisable,
  onChangeRate,
  curRate,
  limitFee,
  setDiff,
  allowWNEAR,
  isOut,
  nearErrorTip,
}: TokenAmountProps) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [isOverOneLine, setIsOverOneLine] = useState(false);
  const render = (token: TokenMetadata) =>
    toRoundedReadableNumber({
      decimals: token.decimals,
      number: balances ? balances[token.id] : '0',
    });

  const [hoverSelectToken, setHoverSelectToken] = useState<boolean>(false);

  const isMobile = useClientMobile();

  const tokenPrice = tokenPriceList?.[selectedToken?.id]?.price || null;

  const curMax =
    selectedToken?.id === WRAP_NEAR_CONTRACT_ID &&
    selectedToken?.symbol === 'NEAR' &&
    !forWrap
      ? Number(max) <= 0.2
        ? '0'
        : toPrecision(
            scientificNotationToString(
              new BigNumber(max).minus(0.2).toString()
            ),
            12
          )
      : max;

  const plus1 =
    tokenIn &&
    tokenOut &&
    limitFee &&
    toPrecision(
      regularizedPrice(curRate, tokenIn, tokenOut, limitFee, 1) || '0',
      8
    );

  const minus1 =
    tokenIn &&
    tokenOut &&
    limitFee &&
    toPrecision(
      regularizedPrice(curRate, tokenIn, tokenOut, limitFee, -1) || '0',
      8
    );

  const plus5 =
    tokenIn &&
    tokenOut &&
    limitFee &&
    toPrecision(
      regularizedPrice(
        percentOfBigNumber(105, marketPriceLimitOrder || 0, 8),
        tokenIn,
        tokenOut,
        limitFee
      ),
      8
    );
  const plus10 =
    tokenIn &&
    tokenOut &&
    limitFee &&
    toPrecision(
      regularizedPrice(
        percentOfBigNumber(110, marketPriceLimitOrder || 0, 8),
        tokenIn,
        tokenOut,
        limitFee
      ),
      8
    );
  const rateDiff = new Big(curRate || '0')
    .minus(marketPriceLimitOrder || '0')
    .div(marketPriceLimitOrder || '1')
    .times(100);

  const displayRateDiff =
    (Number(rateDiff) < 0 ? '-' : Number(rateDiff) > 0 ? '+' : '') +
    (Number(curRate) === Number(plus5)
      ? 5
      : Number(curRate) === Number(plus10)
      ? 10
      : Math.abs(Number(rateDiff)) < 1
      ? toPrecision(
          scientificNotationToString(
            rateDiff.times(rateDiff.lt(0) ? -1 : 1).toString()
          ),
          1
        )
      : rateDiff.times(rateDiff.lt(0) ? -1 : 1).toFixed(0));
  useEffect(() => {
    if (setDiff) {
      setDiff(displayRateDiff);
    }
  }, [displayRateDiff]);
  const showRateDiff =
    forLimitOrder &&
    !ONLY_ZEROS.test(amount) &&
    Number(rateDiff) !== 0 &&
    !ONLY_ZEROS.test(curRate) &&
    marketPriceLimitOrder &&
    swapMode === SWAP_MODE.LIMIT;

  function RateDiffDOM_newline(props: any) {
    const { over } = props;
    return (
      <div
        className={`relative -top-2 px-1 flex items-center ${
          over ? '' : 'hidden'
        }`}
      >
        <span
          className={`rounded-xl ${
            Number(displayRateDiff) > 0
              ? 'text-gradientFrom bg-gradientFrom '
              : Number(displayRateDiff) <= -10
              ? 'text-error bg-error'
              : 'text-warn bg-warn'
          }  py-0.5 px-2 bg-opacity-20 mr-1 ${showRateDiff ? '' : 'hidden'}`}
        >
          {Number(displayRateDiff) > 1000
            ? '>1000'
            : Number(displayRateDiff) < -1000
            ? '<-1000'
            : displayRateDiff}
          %
        </span>
        {ExtraElement}
      </div>
    );
  }

  function RateDiffDOM(props: any) {
    const [left, setLeft] = useState(0);
    const { over, setOver } = props;
    useEffect(() => {
      const w = getTextWidth(amount, '20px') + 10;
      const inputWidth =
        document.getElementById('rateDiffInput')?.offsetWidth || 0;
      const spanWidth =
        document.getElementById('rateDiffSpan')?.offsetWidth || 0;
      const divWidth = document.getElementById('rateDiffDiv')?.offsetWidth || 0;
      const inputAreaWidth = Math.min(w, inputWidth);
      const isOver = inputAreaWidth + spanWidth > divWidth;

      setLeft(inputAreaWidth);
      setOver(isOver);
    }, [amount, showRateDiff]);

    return (
      <div
        id="rateDiffSpan"
        className={`flex items-center absolute ${
          over ? 'invisible' : 'visible'
        }`}
        style={{
          left: left + 'px',
        }}
      >
        <span
          className={`rounded-xl ${
            Number(displayRateDiff) > 0
              ? 'text-gradientFrom bg-gradientFrom '
              : Number(displayRateDiff) <= -10
              ? 'text-error bg-error'
              : 'text-warn bg-warn'
          }  py-0.5 px-2 bg-opacity-20 mr-1 ${showRateDiff ? '' : 'hidden'}`}
        >
          {Number(displayRateDiff) > 1000
            ? '>1000'
            : Number(displayRateDiff) < -1000
            ? '<-1000'
            : displayRateDiff}
          %
        </span>
        {ExtraElement}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col text-xs bg-opacity-20 ${
        isOut && swapMode !== SWAP_MODE.LIMIT
          ? 'bg-cardBg border-inputV3BorderHoverColor'
          : 'bg-black'
      } bg-black rounded-2xl px-3 xsm:px-2 pt-1 pb-2.5 border border-inputV3BorderColor hover:border-inputV3BorderHoverColor`}
    >
      {text ? (
        <div className="text-limitOrderInputColor text-xs pt-1.5">{text}</div>
      ) : null}

      <fieldset className="relative flex  align-center items-center my-1.5">
        <InputAmountV3
          className="border border-transparent rounded w-full mr-2"
          id="inputAmount"
          name={selectedToken?.id}
          max={onChangeAmount ? curMax : null}
          value={limitOrderDisable ? '' : amount}
          onChangeAmount={onChangeAmount}
          forLimitOrder={limitOrderDisable}
          disabled={
            disabled ||
            limitOrderDisable ||
            (isOut && swapMode !== SWAP_MODE.LIMIT)
          }
          forSwap={!!forSwap}
          nearValidation={tokenIn && tokenIn.id === WRAP_NEAR_CONTRACT_ID}
          onBlur={(e) => {
            if (!!onBlur) {
              const newPrice = regularizedPrice(
                curRate,
                tokenIn,
                tokenOut,
                limitFee
              );

              if (ONLY_ZEROS.test(toPrecision(newPrice, 8, false, false)))
                return;

              onBlur(newPrice);
            }
          }}
          openClear={false}
          rateDiff={
            ExtraElement ? (
              <RateDiffDOM over={isOverOneLine} setOver={setIsOverOneLine} />
            ) : null
          }
        />
        {swapMode === SWAP_MODE.LIMIT ? (
          <SelectTokenDCL
            onSelect={onSelectToken}
            selectedToken={selectedToken}
            selectTokenIn={onSelectPre}
            selectTokenOut={onSelectPost}
            limitOrder={true}
          />
        ) : (
          showSelectToken && (
            <SelectToken
              tokenPriceList={tokenPriceList}
              tokens={tokens}
              render={render}
              customWidth
              forCross={forCross}
              selected={
                selectedToken && (
                  <div
                    className="flex items-center justify-end font-semibold"
                    onMouseEnter={() => setHoverSelectToken(true)}
                    onMouseLeave={() => setHoverSelectToken(false)}
                  >
                    <IconLeftV3
                      size={'7'}
                      token={selectedToken}
                      hover={hoverSelectToken}
                      className={'p-1'}
                    />
                  </div>
                )
              }
              onSelect={onSelectToken}
              balances={balances}
              allowWNEAR={allowWNEAR}
            />
          )
        )}
      </fieldset>
      {ExtraElement ? <RateDiffDOM_newline over={isOverOneLine} /> : null}
      <div className="flex items-center justify-between h-6">
        <span className="mr-3 text-limitOrderInputColor">
          {!!tokenPrice &&
          !ONLY_ZEROS.test(amount) &&
          !isError &&
          !limitOrderDisable
            ? '$' +
              toInternationalCurrencySystemLongString(
                multiply(tokenPrice || '0', amount || '0'),
                2
              )
            : '$-'}
        </span>
        <span className="text-limitOrderInputColor">
          <FormattedMessage id="balance" defaultMessage="Balance" />
          :&nbsp;
          <span
            className={`${
              !!onChangeAmount && !forLimitOrder
                ? 'hover:text-white cursor-pointer underline'
                : ''
            } `}
            onClick={() => {
              if (onChangeAmount && !forLimitOrder) {
                onChangeAmount(curMax);
              }
            }}
            title={total}
          >
            {isSignedIn ? toPrecision(total, 3, true) : '-'}
          </span>
        </span>
      </div>
      {nearErrorTip}
    </div>
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
  ExtraElement,
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
  ExtraElement?: JSX.Element;
}) {
  const [hoverSelectToken, setHoverSelectToken] = useState(false);

  const price = tokenPriceList?.[tokenIn?.id]?.price || null;
  const [symbolsArr] = useState(['e', 'E', '+', '-']);
  const curMax =
    tokenIn?.id === WRAP_NEAR_CONTRACT_ID && tokenIn?.symbol == 'NEAR'
      ? Number(max) <= 0.5
        ? '0'
        : String(Number(max) - 0.5)
      : max;
  if (hidden) return null;

  return (
    <div
      className="bg-black bg-opacity-20  p-5 xs:px-4 py-5 flex flex-col"
      style={{
        borderRadius: '20px',
      }}
    >
      <div className="flex items-center justify-between">
        <SelectToken
          tokenPriceList={tokenPriceList}
          tokens={tokens}
          forCross
          selected={
            <div
              className="flex font-semibold"
              onMouseEnter={() => setHoverSelectToken(true)}
              onMouseLeave={() => setHoverSelectToken(false)}
            >
              {tokenIn ? (
                <IconLeftV3 token={tokenIn} hover={hoverSelectToken} />
              ) : null}
            </div>
          }
          className={'flex-shrink-0 mr-4'}
          onSelect={onSelectToken}
          balances={balances}
          allowWNEAR={true}
        />
        <span
          className="ml-2 text-xs"
          style={{
            color: '#91A2AE',
          }}
        >
          <FormattedMessage id="balance" />: &nbsp; {toPrecision(max, 3, true)}
        </span>
      </div>
      <input
        className="text-right text-white text-xl xs:text-lg"
        value={amount}
        type="number"
        min="0"
        placeholder="0.0"
        onChange={(e) => onChangeAmount(e.target.value)}
        onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
        step="any"
        inputMode="decimal"
      />
      <fieldset className="relative flex  align-center items-center my-2">
        <InputAmountV3
          className="border border-transparent rounded w-full mr-2"
          id="inputAmount"
          name={tokenIn?.id}
          value={amount}
          onChangeAmount={onChangeAmount}
          openClear
        />

        {ExtraElement}
      </fieldset>
      <div className="flex items-center justify-between">
        {tokenPrice(
          price && !ONLY_ZEROS.test(amount) ? multiply(price, amount) : null
        )}

        <HalfAndMaxAmountV3
          token={tokenIn}
          max={curMax}
          onChangeAmount={onChangeAmount}
          amount={amount}
        />
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
      className="bg-black flex items-center justify-between bg-opacity-20 py-5 pr-5 xs:pr-4"
      style={{
        borderRadius: '20px',
      }}
    >
      <SelectToken
        tokenPriceList={tokenPriceList}
        tokens={tokens}
        forCross
        customWidth
        selected={
          <div
            className="flex font-semibold w-full cursor-pointer pl-4 xs:pl-3 pr-3"
            onMouseEnter={() => setHoverSelectToken(true)}
            onMouseLeave={() => setHoverSelectToken(false)}
          >
            {tokenOut ? (
              <IconLeftV3 token={tokenOut} hover={hoverSelectToken} />
            ) : null}
          </div>
        }
        onSelect={onSelectToken}
        balances={balances}
        allowWNEAR={true}
      />

      <span
        className="ml-2 text-xs"
        style={{
          color: '#91A2AE',
        }}
      >
        <FormattedMessage id="balance" />: &nbsp; {toPrecision(max, 3, true)}
      </span>
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

export function TokenAmountV2({
  amount,
  max,
  total,
  selectedToken,
  onChangeAmount,
  disabled = false,
  isError,
  tokenPriceList,
  showQuickButton = false,
}: TokenAmountProps) {
  const tokenPrice = tokenPriceList?.[selectedToken?.id]?.price || null;
  return (
    <>
      <div
        className={`flex items-center justify-between text-xs font-semibold pb-0.5`}
      >
        {selectedToken && (
          <div className="flex items-center">
            <img
              className="w-7 h-7 rounded-full border border-greenLight"
              src={selectedToken.icon}
            ></img>
            <span className="text-sm text-white font-bold ml-2">
              {selectedToken?.symbol}
            </span>
          </div>
        )}
        <div className="flex items-center">
          {onChangeAmount && showQuickButton ? (
            <HalfAndMaxAmount
              token={selectedToken}
              max={max}
              onChangeAmount={onChangeAmount}
              amount={amount}
            />
          ) : null}
          <div
            className={`text-primaryText ${
              showQuickButton ? 'border-l border-primaryText pl-3 ml-1' : ''
            }`}
          >
            <span title={total}>{toPrecision(total, 3, true)}</span>
          </div>
        </div>
      </div>
      <fieldset className="relative flex  align-center my-2">
        <InputAmount
          className="w-full border border-transparent rounded"
          id="inputAmount"
          name={selectedToken?.id}
          max={max}
          value={amount}
          onChangeAmount={onChangeAmount}
          disabled={disabled}
          forSwap={true}
          price={
            tokenPrice && !ONLY_ZEROS.test(amount) && !isError
              ? multiply(tokenPrice, amount)
              : null
          }
        />
      </fieldset>
    </>
  );
}

export function LimitOrderRateSetBox({
  tokenIn,
  tokenOut,
  marketPriceLimitOrder,
  onChangeRate,
  curRate,
  limitFee,
  setDiff,
  setRate,
  curPrice,
  fee,
  triggerFetch,
  hidden,
  hasLockedRate,
  setHasLockedRate,
}: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rateSort, setRateSort] = useState(true);
  const [amount, setAmount] = useState('');
  const [inputStatus, setInputStatus] = useState(false);
  const isMobile = useClientMobile();
  const plus1 =
    tokenIn &&
    tokenOut &&
    limitFee &&
    toPrecision(regularizedPrice(curRate, tokenIn, tokenOut, limitFee, 1), 8);

  const minus1 =
    tokenIn &&
    tokenOut &&
    limitFee &&
    toPrecision(regularizedPrice(curRate, tokenIn, tokenOut, limitFee, -1), 8);

  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  function switchLockStatus() {
    setHasLockedRate(!hasLockedRate);
  }

  function getTokenASymbol() {
    if (rateSort) return tokenIn?.symbol;
    else return tokenOut?.symbol;
  }

  function getTokenBSymbol() {
    if (rateSort) return tokenOut?.symbol;
    else return tokenIn?.symbol;
  }

  const displayInputValue = useMemo(() => {
    if (!curPrice) {
      return '-';
    } else {
      if (rateSort) {
        return curRate;
      } else {
        try {
          if (inputStatus) {
            return amount;
          } else {
            const rate_reverse = new BigNumber(1).dividedBy(curRate).toFixed();
            return toPrecision(rate_reverse, 8);
          }
        } catch (error) {}
      }
    }
  }, [curPrice, curRate, rateSort, inputStatus, amount]);
  return (
    <>
      <div
        className={`flex flex-col  justify-between flex-grow bg-black bg-opacity-20 rounded-xl p-2.5 border border-inputV3BorderColor hover:border-inputV3BorderHoverColor mr-2 ${
          hidden ? 'hidden' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <RefreshIcon
              className={`text-primaryText cursor-pointer`}
              onClick={() => {
                setRateSort(!rateSort);
              }}
            />
            <span className="text-xs text-primaryText ml-2">
              1 {getTokenASymbol()} ={' '}
            </span>
          </div>
          <div className="flex items-center text-xs text-greenColor hover:text-senderHot">
            <span
              className="cursor-pointer select-none"
              onClick={() => {
                setRate(curPrice);
                if (triggerFetch) triggerFetch();
              }}
            >
              <FormattedMessage id="market_rate"></FormattedMessage>
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span
            onClick={() => {
              if (rateSort) {
                onChangeRate(minus1);
              } else {
                onChangeRate(plus1);
              }
            }}
            className={`flex items-center justify-center cursor-pointer w-5 h-5 rounded-md ${
              isMobile ? '' : 'hover:bg-selectTokenV3BgColor'
            } `}
          >
            <ReduceIcon></ReduceIcon>
          </span>
          <div className="flex items-center relative">
            <input
              onWheel={() => inputRef.current.blur()}
              min="0"
              ref={inputRef}
              step="any"
              type="number"
              placeholder={!curPrice ? '-' : '0.0'}
              value={displayInputValue}
              onBlur={(e) => {
                const newR = regularizedPrice(curRate, tokenIn, tokenOut, fee);

                if (ONLY_ZEROS.test(toPrecision(newR, 8, false, false))) {
                  return;
                }
                setRate(newR);
                setInputStatus(false);
              }}
              onChange={(e) => {
                const v = e.target.value;
                setAmount(v);
                setInputStatus(true);
                if (!curPrice) {
                  return null;
                } else {
                  if (!rateSort && +v > 0) {
                    setRate(new BigNumber(1).dividedBy(v).toFixed());
                  } else {
                    setRate(v);
                  }
                }
              }}
              className="text-sm text-white text-center px-2"
              disabled={!curPrice}
              onKeyDown={(e) =>
                symbolsArr.includes(e.key) && e.preventDefault()
              }
            />
            <span className="text-xs text-primaryText mx-0.5">
              {getTokenBSymbol()}
            </span>
          </div>
          <div className="flex items-center">
            <span
              onClick={() => {
                if (rateSort) {
                  onChangeRate(plus1);
                } else {
                  onChangeRate(minus1);
                }
              }}
              className={`flex items-center justify-center cursor-pointer w-5 h-5 rounded-md ${
                isMobile ? '' : 'hover:bg-selectTokenV3BgColor'
              }`}
            >
              <PlusIcon></PlusIcon>
            </span>
            <div
              onClick={switchLockStatus}
              className={`flex items-center justify-center w-5 h-5 rounded-md ml-0.5 cursor-pointer ${
                isMobile ? '' : 'hover:bg-selectTokenV3BgColor'
              }`}
              data-tooltip-id="lockratehint"
            >
              <span>{hasLockedRate ? <LockInIcon /> : <LockIcon />}</span>
            </div>
          </div>
        </div>
      </div>

      <CustomTooltip id={'lockratehint'}>
        <div style={{ maxWidth: 240 }}>
          Lock the rate field to get your buy amount automatically adjusted when
          changing your sell amount.
        </div>
      </CustomTooltip>
    </>
  );
}
