import React, { useState, useEffect, useRef, useDebugValue } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { parseSymbol } from '../RecentTrade/index';
import { useInView } from 'react-intersection-observer';

import {
  nearMetadata,
  getFTmetadata,
  orderlyViewFunction,
  ftGetBalance,
  toPrecision,
  percent,
  scientificNotationToString,
  percentOfBigNumber,
} from '../../near';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';

import {
  announceKey,
  depositFT,
  depositOrderly,
  setTradingKey,
  storageDeposit,
  withdrawOrderly,
} from '../../orderly/api';
import {
  getAccountInformation,
  getCurrentHolding,
  createOrder,
  getOrderByOrderId,
} from '../../orderly/off-chain-api';
import {
  Holding,
  ClientInfo,
  TokenInfo,
  TokenMetadata,
} from '../../orderly/type';
import { BuyButton, SellButton } from './Button';
import './index.css';
import { FaMinus, FaPlus } from 'react-icons/fa';
import Modal from 'react-modal';
import Big from 'big.js';
import { IoClose } from 'react-icons/io5';
import { MdArrowDropDown } from 'react-icons/md';
import {
  IoIosArrowForward,
  IoIosArrowDown,
  IoIosArrowUp,
} from 'react-icons/io';
import {
  CheckBox,
  ConnectWallet,
  ErrorTip,
  RegisterButton,
  WithdrawButton,
} from '../Common';

import {
  orderPopUp,
  DepositButton,
  ConfirmButton,
  QuestionMark,
} from '../Common/index';
import { useTokenBalance, useTokensBalances } from './state';
import { digitWrapper, digitWrapperAsset } from '../../utiles';

import { FiSearch } from 'react-icons/fi';
import {
  NearIConSelectModal,
  OrderlyNetworkIcon,
  OutLinkIcon,
  PowerByOrderly,
  RefToOrderly,
  Agree,
  OrderlyLoading,
  OrderlyIconBalance,
} from '../Common/Icons';

import { MdKeyboardArrowDown } from 'react-icons/md';
import {
  is_orderly_key_announced,
  is_trading_key_set,
} from '../../orderly/on-chain-api';
import getConfig from '../../config';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { AssetModal } from '../AssetModal';
import ReactTooltip from 'react-tooltip';
import { ButtonTextWrapper } from '~components/button/Button';
import { FlexRow, orderEditPopUpFailure } from '../Common/index';
import { useAllSymbolInfo } from '../AllOrders/state';
import { ONLY_ZEROS } from '../../../../utils/numbers';
import * as math from 'mathjs';
import { NearWalletIcon } from '../Common/Icons';
import {
  getSelectedWalletId,
  generateTradingKeyPair,
} from '../../orderly/utils';
import { useClientMobile, isMobile } from '../../../../utils/device';
import { QuestionTip } from '../../../../components/layout/TipWrapper';

function getTipFOK() {
  return `<div class=" rounded-md w-p200 text-primaryOrderly  text-xs  text-left">
    ${'Fill-Or-Kill is an order to buy or sell that must be executed immediately in its entirety; otherwise, the entire order will be cancelled.'} 
  </div>`;
}

function getTipPostOnly() {
  return `<div class=" rounded-md w-p200 text-primaryOrderly  text-xs  text-left">
    ${'Post Only ensures that traders can only place an order if it would be posted to the orderbook as a Maker order. An order which would be posted as a Taker order will be cancelled.'} 
  </div>`;
}

function getTipIoc() {
  return `<div class=" rounded-md w-p200 text-primaryOrderly  text-xs  text-left">
    ${'Immediate-Or-Cancel is an order to buy or sell that must be filled immediately. Any portion of an IOC order that cannot be filled will be cancelled.'} 
  </div>`;
}
function validContract() {
  const selectedWalletId = getSelectedWalletId();

  if (selectedWalletId === 'sender') {
    //@ts-ignore
    return !!window?.near?.authData?.allKeys?.[
      getConfig().ORDERLY_ASSET_MANAGER
    ];
  }

  if (selectedWalletId === 'neth') return true;

  const walletStoredContract = localStorage.getItem(
    'near-wallet-selector:contract'
  );

  if (!walletStoredContract) {
    return true;
  } else {
    const parsedContract = JSON.parse(walletStoredContract)?.contractId;

    if (
      parsedContract &&
      parsedContract !== getConfig().ORDERLY_ASSET_MANAGER
    ) {
      return false;
    }

    return true;
  }
}

function RegisterModal(
  props: Modal.Props & {
    orderlyRegistered: boolean;
    onConfirm: () => void;
  }
) {
  const { orderlyRegistered, onRequestClose, isOpen, onConfirm } = props;

  return (
    <Modal {...props}>
      <div
        className={` ${'rounded-2xl gradientBorderWrapperZ  border'}      bg-boxBorder text-sm text-white  `}
        style={{
          width: '460px',
        }}
      >
        <div className=" py-6 text-white text-sm flex flex-col px-6">
          <div className="flex px-4 items-center pb-4 justify-end">
            <span
              className={'cursor-pointer text-primaryText'}
              onClick={(e: any) => {
                onRequestClose && onRequestClose(e);
              }}
            >
              <IoClose size={20} />
            </span>
          </div>
          <div>
            This Orderbook page is a graphical user interface for trading on
            Orderly Network, and is provided as a convenience to users of Ref
            Finance. Orderly Network is fully responsible for the security of
            their systems, smart contracts, and any funds deposited or sent to
            those systems and contracts. Users are strongly encouraged to do
            their own research before connecting their wallet and/or placing any
            orders.
          </div>

          <div className="py-5">
            {!orderlyRegistered && (
              <span className="mr-1">
                Your wallet must be registered with Orderly to trade on their
                system.
              </span>
            )}{' '}
            Learn more about
            <a
              href=""
              className="underline text-primary ml-1"
              href="https://orderly.network/"
              target="_blank"
            >
              Orderly Network
            </a>
            .
          </div>

          <div>
            By clicking "Confirm", you confirm that you have comprehensively
            reviewed and comprehended the contents aforementioned
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              className="bg-primaryGradient w-52 rounded-lg mt-5 text-white flex items-center justify-center py-2.5 text-base"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRequestClose && onRequestClose(e);

                onConfirm();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function LearnMoreBox() {
  return (
    <div className="absolute bottom-0 pb-6 right-28 cursor-default w-full">
      <div className="bg-cardBg  rounded-md text-primaryText border text-xs border-primaryText py-3 px-2.5">
        This Orderbook page is a graphical user interface for trading on Orderly
        Network, and is provided as a convenience to users of Ref Finance.
        Orderly Network is fully responsible for the security of their systems,
        smart contracts, and any funds deposited or sent to those systems and
        contracts. Users are strongly encouraged to do their own research before
        connecting their wallet and/or placing any orders.
        <br />
        Learn more about
        <a
          href="https://orderly.network/"
          target="_blank"
          className="inline underline cursor-pointer text-white ml-1"
        >
          Orderly Network.
        </a>
      </div>
    </div>
  );
}

function UserBoardFoot() {
  const [hover, setHover] = useState<boolean>(false);

  const { accountId } = useWalletSelector();

  return (
    <div
      className="flex flex-col text-primaryText pr-6    absolute  bottom-6 text-13px"
      style={{
        zIndex: 91,
      }}
    >
      {!accountId && (
        <>
          <div>
            * This Orderbook page is a graphical user interface for trading on
            Orderly Network, and is provided as a convenience to users of Ref
            Finance.
          </div>

          <div className={`underline relative   justify-self-start mb-5`}>
            <span
              className="cursor-pointer"
              onMouseEnter={() => {
                setHover(true);
              }}
              onMouseLeave={() => {
                setHover(false);
              }}
            >
              Learn more.
              {hover && <LearnMoreBox />}
            </span>
          </div>
        </>
      )}

      <div
        className={`flex items-center justify-center ${
          accountId ? 'left-12' : ''
        } relative `}
      >
        <span className="text-primaryText  ">Powered by</span>

        <div className="mx-2">
          <OrderlyNetworkIcon></OrderlyNetworkIcon>
        </div>
      </div>

      {/* <span className="text-white ">Risk</span> */}
    </div>
  );
}

export const TokenLinks = {
  NEAR: 'https://awesomenear.com/near-protocol',
  wNEAR: 'https://awesomenear.com/near-protocol',
  REF: 'https://awesomenear.com/ref-finance',
  OCT: 'https://awesomenear.com/octopus-network',
  PARAS: 'https://awesomenear.com/paras',
  SKYWARD: 'https://awesomenear.com/skyward-finance',
  FLX: 'https://awesomenear.com/flux',
  PULSE: 'https://awesomenear.com/pulse',
  DBIO: 'https://awesomenear.com/debio-network',
  MYRIA: 'https://awesomenear.com/myriad-social',
  PXT: 'https://awesomenear.com/cryptoheroes',
  HAPI: 'https://awesomenear.com/hapi',
  OIN: 'https://awesomenear.com/oin-finance',
  ABR: 'https://awesomenear.com/allbridge',
  '1MIL': 'https://awesomenear.com/1millionnfts',
  MARMAJ: 'https://awesomenear.com/marmaj-foundation',
  marmaj: 'https://awesomenear.com/marmaj-foundation',
  USN: 'https://awesomenear.com/decentral-bank',
  '1INCH': 'https://awesomenear.com/1inch-network',
  GRT: 'https://awesomenear.com/the-graph',
  LINK: 'https://awesomenear.com/chainlink',
  Cheddar: 'https://awesomenear.com/cheddar-farm',
  AURORA: 'https://awesomenear.com/aurora-dev',
  $META: 'https://awesomenear.com/meta-pool',
  UMINT: 'https://awesomenear.com/youminter',
  UTO: 'https://awesomenear.com/secret-skellies-society',
  DEIP: 'https://awesomenear.com/deip',
  WOO: 'https://awesomenear.com/woo-dex',
  LINEAR: 'https://awesomenear.com/linear-protocol',
  PEM: 'https://awesomenear.com/pembrock-finance',
  ATO: 'https://awesomenear.com/atocha-protocol',
  SEAT: 'https://awesomenear.com/seatlab-nft',
  FAR: 'https://awesomenear.com/few-and-far',
  BSTN: 'https://awesomenear.com/bastion',
  BRRR: 'https://awesomenear.com/burrow',
  XNL: 'https://awesomenear.com/chronicle',
  KSW: 'https://awesomenear.com/killswitch-finance',
  STNEAR: 'https://awesomenear.com/meta-pool',
  NearX: 'https://awesomenear.com/stader',
  SD: 'https://awesomenear.com/stader',
  DISC: 'https://awesomenear.com/discovol',
} as Record<string, string>;

const symbolsArr = ['e', 'E', '+', '-'];

export function TextWrapper({
  className,
  value,
  bg,
  textC,
  bgOpacity,
}: {
  value: string;
  bg?: string;
  textC?: string;
  className?: string;
  bgOpacity?: string;
}) {
  return (
    <span
      className={`pt-0.5 ${
        className || ' px-1.5  '
      }  inline-flex items-center justify-center rounded-md ${
        bg || 'bg-primaryOrderly '
      } ${bgOpacity || 'bg-opacity-10'} ${textC || 'text-white'} `}
    >
      {value}
    </span>
  );
}

export const REF_ORDERLY_AGREE_CHECK = 'REF_ORDERLY_AGREE_CHECK';

export const REF_ORDERLY_ACCOUNT_VALID = 'REF_ORDERLY_ACCOUNT_VALID';

const REF_ORDERLY_LIMIT_ORDER_ADVANCE = 'REF_ORDERLY_LIMIT_ORDER_ADVANCE';

export default function UserBoard() {
  const {
    symbol,
    orders,
    tokenInfo,
    storageEnough,
    balances,
    setValidAccountSig,
    handlePendingOrderRefreshing,
    validAccountSig,
    myPendingOrdersRefreshing,
    bridgePrice,
    userExist,
  } = useOrderlyContext();

  const availableSymbols = useAllSymbolInfo();

  const { accountId, modal, selector } = useWalletSelector();

  const storedLimitOrderAdvance =
    sessionStorage.getItem(REF_ORDERLY_LIMIT_ORDER_ADVANCE) || '{}';

  const parsedAdvance = JSON.parse(storedLimitOrderAdvance);

  const [showLimitAdvance, setShowLimitAdvance] = useState<boolean>(
    parsedAdvance?.show || false
  );

  const [advanceLimitMode, setAdvanceLimitMode] = useState<
    'IOC' | 'FOK' | 'POST_ONLY'
  >(parsedAdvance?.advance);

  useEffect(() => {
    sessionStorage.setItem(
      REF_ORDERLY_LIMIT_ORDER_ADVANCE,

      JSON.stringify(
        advanceLimitMode
          ? {
              advance: advanceLimitMode,
              show: showLimitAdvance,
            }
          : {
              show: showLimitAdvance,
            }
      )
    );
  }, [showLimitAdvance, advanceLimitMode]);

  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');

  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Limit');

  const [holdings, setHoldings] = useState<Holding[]>();

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

  const tokenOut = useTokenMetaFromSymbol(symbolTo, tokenInfo);

  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');

  const [inputValue, setInputValue] = useState<string>('');

  const [limitPrice, setLimitPrice] = useState<string>('');

  useEffect(() => {
    setLimitPrice(bridgePrice);
  }, [bridgePrice]);

  const [userInfo, setUserInfo] = useState<ClientInfo>();

  const [showAllAssets, setShowAllAssets] = useState<boolean>(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const [agreeCheck, setAgreeCheck] = useState<boolean>(false);

  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false);

  const submitDisable =
    !inputValue ||
    Number(inputValue) === 0 ||
    (orderType === 'Limit' && Number(limitPrice) <= 0) ||
    !userInfo;

  const inputLimitPriceRef = useRef<HTMLInputElement>(null);

  const inputAmountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getCurrentHolding({ accountId }).then((res) => {
      setHoldings(res.data.holding);
    });
  }, [accountId, myPendingOrdersRefreshing, validAccountSig]);

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getAccountInformation({ accountId }).then((res) => {
      setUserInfo(res);
    });
  }, [accountId, validAccountSig]);

  const curHoldingIn = holdings?.find((h) => h.token === symbolFrom);

  const curHoldingOut = holdings?.find((h) => h.token === symbolTo);

  const tokenFromBalance = useTokenBalance(
    tokenIn?.id,
    JSON.stringify(balances)
  );

  const tokenToBalance = useTokenBalance(
    tokenOut?.id,
    JSON.stringify(balances)
  );

  const tokenInHolding = curHoldingIn
    ? toPrecision(
        new Big(curHoldingIn.holding + curHoldingIn.pending_short).toString(),
        Math.min(8, tokenIn?.decimals || 8),
        false
      )
    : balances && balances[symbolFrom]?.holding;

  const tokenOutHolding = curHoldingOut
    ? toPrecision(
        new Big(curHoldingOut.holding + curHoldingOut.pending_short).toString(),
        Math.min(8, tokenOut?.decimals || 8),
        false
      )
    : balances && balances[symbolTo]?.holding;

  const fee =
    orderType === 'Limit'
      ? !userInfo || !limitPrice
        ? '-'
        : (userInfo.maker_fee_rate / 10000) *
          Number(limitPrice || 0) *
          Number(inputValue || 0)
      : !userInfo ||
        !orders ||
        !(side === 'Buy' ? orders.asks?.[0]?.[0] : orders?.bids?.[0]?.[0])
      ? '-'
      : (userInfo.taker_fee_rate / 10000) *
        Number(
          side === 'Buy' ? orders.asks?.[0]?.[0] : orders?.bids?.[0]?.[0] || 0
        ) *
        Number(inputValue || 0);

  const marketPrice = !orders
    ? 0
    : side === 'Buy'
    ? orders.asks?.[0]?.[0]
    : orders?.bids?.[0]?.[0];

  const total =
    orderType === 'Limit'
      ? !limitPrice || !userInfo || fee === '-'
        ? '-'
        : Number(inputValue || 0) * Number(limitPrice || 0)
      : !orders || !userInfo || fee === '-' || !marketPrice
      ? '-'
      : Number(inputValue || 0) * Number(marketPrice || 0);

  const handleSubmit = () => {
    if (!accountId) return;
    if (orderType === 'Market') {
      return createOrder({
        accountId,
        orderlyProps: {
          side: side === 'Buy' ? 'BUY' : 'SELL',
          symbol: symbol,
          order_type: 'MARKET',
          order_amount: parseFloat(
            side === 'Buy' ? new Big(total).toFixed(3, 0) : ''
          ),
          order_quantity: side === 'Sell' ? inputValue : '',
          broker_id: 'ref_dex',
        },
      }).then(async (res) => {
        if (res.success === false)
          return orderEditPopUpFailure({
            tip: res.message,
          });

        handlePendingOrderRefreshing();

        const order = await getOrderByOrderId({
          accountId,
          order_id: res.data.order_id,
        });

        return orderPopUp({
          orderType: 'Market',
          symbolName: symbol,
          side: side,
          size: inputValue,
          tokenIn: tokenIn,
          price: marketPrice.toString() || '',
          timeStamp: res.timestamp,
          order,
        });
      });
    } else if (orderType === 'Limit') {
      return createOrder({
        accountId,
        orderlyProps: {
          side: side === 'Buy' ? 'BUY' : 'SELL',
          symbol: symbol,
          order_price: limitPrice,
          order_type:
            typeof advanceLimitMode !== 'undefined'
              ? advanceLimitMode
              : 'LIMIT',
          order_quantity: inputValue,
          broker_id: 'ref_dex',
        },
      }).then(async (res) => {
        if (res.success === false)
          return orderEditPopUpFailure({
            tip: res.message,
          });

        handlePendingOrderRefreshing();

        const order = await getOrderByOrderId({
          accountId,
          order_id: res.data.order_id,
        });

        return orderPopUp({
          orderType: 'Limit',
          symbolName: symbol,
          side: side,
          size: inputValue,
          tokenIn: tokenIn,
          price: limitPrice || '',
          timeStamp: res.timestamp,
          filled: order?.data?.status === 'FILLED',
          order: order.data,
        });
      });
    }
  };

  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);

  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);

  const [showErrorTip, setShowErrorTip] = useState<boolean>(false);

  const [errorTipMsg, setErrorTipMsg] = useState<string>('');

  const storedValid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);

  useEffect(() => {
    if (!accountId || !storageEnough) return;

    if (!!storedValid) {
      setValidAccountSig(true);
      setKeyAnnounced(true);
      setTradingKeySet(true);

      return;
    }

    is_orderly_key_announced(accountId, true)
      .then(async (key_announce) => {
        setKeyAnnounced(key_announce);
        if (!key_announce) {
          const res = await announceKey(accountId).then((res) => {
            setKeyAnnounced(true);
          });
        } else return;
      })
      .then(() => {
        is_trading_key_set(accountId).then(async (trading_key_set) => {
          setTradingKeySet(trading_key_set);
          if (!trading_key_set) {
            await setTradingKey(accountId).then(() => {
              setTradingKeySet(true);
            });
          }
        });
      })
      .catch((e) => {
        setKeyAnnounced(false);
        setTradingKeySet(false);
        setValidAccountSig(false);

        localStorage.removeItem(REF_ORDERLY_ACCOUNT_VALID);
      });
  }, [accountId, storageEnough, agreeCheck]);

  useEffect(() => {
    if (!tradingKeySet || !keyAnnounced) return;

    localStorage.setItem(REF_ORDERLY_ACCOUNT_VALID, '1');
    if (userExist) {
      localStorage.removeItem(REF_ORDERLY_AGREE_CHECK);
    }

    handlePendingOrderRefreshing();

    setValidAccountSig(true);
  }, [tradingKeySet, keyAnnounced]);

  const isInsufficientBalance =
    side === 'Buy'
      ? new Big(total === '-' ? '0' : total).gt(tokenOutHolding || '0') ||
        new Big(tokenOutHolding || 0).eq(0)
      : new Big(inputValue || '0').gt(tokenInHolding || '0');

  const loading =
    ((!!accountId && storageEnough === undefined) ||
      (!!storedValid && !validAccountSig)) &&
    !!accountId;

  const priceValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo) {
      return;
    }

    // price validator

    if (new Big(price || 0).lt(symbolInfo.quote_min)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Min price should be higher than or equal to ${symbolInfo.quote_min}`
      );
      return;
    }

    if (new Big(price || 0).gt(symbolInfo.quote_max)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Price should be lower than or equal to ${symbolInfo.quote_max}`
      );
      return;
    }

    if (
      new Big(new Big(price || 0).minus(new Big(symbolInfo.quote_min)))
        .mod(symbolInfo.quote_tick)
        .gt(0)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(`Price should be multiple of ${symbolInfo.quote_tick}`);
      return;
    }

    if (
      new Big(price || 0).gt(
        new Big(orders.asks?.[0]?.[0] || 0).times(1 + symbolInfo.price_range)
      ) &&
      side === 'Buy'
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Price should be less than or equal to ${new Big(
          orders.asks?.[0]?.[0] || 0
        ).times(1 + symbolInfo.price_range)}`
      );

      return;
    }

    if (
      new Big(price || 0).lt(
        new Big(orders.bids?.[0]?.[0] || 0).times(1 - symbolInfo.price_range)
      ) &&
      side === 'Sell'
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Price should be greater than or equal to ${new Big(
          orders.bids?.[0]?.[0] || 0
        ).times(1 - symbolInfo.price_range)}`
      );

      return;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `The order value should be greater than or equal to ${symbolInfo.min_notional}`
      );
      return;
    }

    return true;
  };

  const sizeValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo) {
      return;
    }

    // size validator

    if (new Big(size || 0).lt(symbolInfo.base_min)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Quantity to ${side.toLowerCase()} should be greater than or equal to ${
          symbolInfo.base_min
        }`
      );
      return;
    }

    if (new Big(size || 0).gt(symbolInfo.base_max)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Quantity to ${side.toLowerCase()} should be less than or equal to ${
          symbolInfo.base_max
        }`
      );
      return;
    }

    if (
      new Big(new Big(size || 0).minus(new Big(symbolInfo.base_min)))
        .mod(symbolInfo.base_tick)
        .gt(0)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(`Quantity should be multiple of ${symbolInfo.base_tick}`);
      return;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `The order value should be greater than or equal to ${symbolInfo.min_notional}`
      );
      return;
    }

    return true;
  };

  const priceAndSizeValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);
    console.log('symbolInfo: ', symbolInfo);

    if (!symbolInfo || (ONLY_ZEROS.test(price) && ONLY_ZEROS.test(size))) {
      setShowErrorTip(false);
      setErrorTipMsg('');
      return;
    }

    let resPrice;
    let resSize;

    if (!ONLY_ZEROS.test(price)) {
      resPrice = priceValidator(price, size);
    } else {
      resPrice = true;
    }

    if (!ONLY_ZEROS.test(size)) {
      resSize = sizeValidator(price, size);
    } else {
      resSize = true;
    }

    if (resPrice === true && resSize === true) {
      // price validator

      setShowErrorTip(false);
      setErrorTipMsg('');
    }
  };

  useEffect(() => {
    const marketPrice = !orders
      ? 0
      : side === 'Buy'
      ? orders.asks?.[0]?.[0]
      : orders?.bids?.[0]?.[0];

    priceAndSizeValidator(
      orderType === 'Limit' ? limitPrice : marketPrice.toString(),
      inputValue
    );
  }, [side, orderType, symbol, orders]);

  const validator =
    !accountId ||
    !storageEnough ||
    !tradingKeySet ||
    !keyAnnounced ||
    !validContract();

  return (
    <div
      className="w-full p-6 relative flex flex-col  border-t border-l border-b h-screen border-boxBorder  bg-black bg-opacity-10"
      style={{
        minHeight: '775px',
        height: validator ? 'calc(100vh - 100px)' : '100%',
      }}
    >
      {/* not signed in wrapper */}

      {loading && (
        <div
          className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
          style={{
            background: 'rgba(0, 19, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 90,
          }}
        >
          <OrderlyLoading></OrderlyLoading>
        </div>
      )}

      {validator && !loading && (
        <div
          className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
          style={{
            background: 'rgba(0, 19, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 50,
          }}
        >
          <RefToOrderly></RefToOrderly>

          {!accountId && (
            <ConnectWallet
              onClick={() => {
                modal.show();
              }}
            ></ConnectWallet>
          )}

          {accountId && !validContract() && (
            <div className="relative bottom-1 break-words inline-flex flex-col items-center">
              <div className="text-base w-p200 pb-6 text-center text-white">
                Using Orderbook request re-connect wallet
              </div>
              <ConfirmButton
                onClick={async () => {
                  // window.modal.show();
                  const wallet = await window.selector.wallet();

                  await wallet.signOut();
                }}
              ></ConfirmButton>

              <div className="flex items-center mt-2 justify-center">
                <PowerByOrderly />
              </div>
            </div>
          )}

          {!!accountId &&
            validContract() &&
            (!storageEnough || !tradingKeySet || !keyAnnounced) && (
              <RegisterButton
                userExist={userExist}
                onClick={() => {
                  if (!agreeCheck) {
                    setRegisterModalOpen(true);
                    return;
                  }
                  if (!accountId || storageEnough) return;

                  if (!userExist) {
                    localStorage.setItem(REF_ORDERLY_AGREE_CHECK, 'true');
                  }

                  storageDeposit(accountId);
                }}
                check={agreeCheck}
                storageEnough={!!storageEnough}
                spin={
                  (storageEnough && (!tradingKeySet || !keyAnnounced)) ||
                  agreeCheck
                }
              />
            )}
        </div>
      )}

      <div className="text-sm text-white font-bold mb-4 text-left flex items-center justify-between">
        <span>Balances</span>

        <div className="flex items-center">
          <DepositButton
            onClick={() => {
              setOperationType('deposit');
              setOperationId(tokenIn?.id || '');
            }}
          ></DepositButton>

          <WithdrawButton
            onClick={() => {
              setOperationType('withdraw');
              setOperationId(tokenIn?.id || '');
            }}
          ></WithdrawButton>
        </div>
      </div>

      <div className="grid grid-cols-4 text-sm text-primaryOrderly mb-2">
        <span className="col-span-2  justify-self-start">Assets</span>

        <span className="justify-self-end flex items-center relative right-10">
          {' '}
          <NearIConSelectModal /> <span className="ml-2">Wallet</span>{' '}
        </span>

        <span className="justify-self-end flex items-center">
          <OrderlyIconBalance></OrderlyIconBalance>
          <span className="ml-2">Available</span>{' '}
        </span>
      </div>

      <div className="grid grid-cols-4 items-center mb-5 text-white text-sm justify-between">
        <div className="flex items-center justify-self-start col-span-2">
          <img
            src={tokenIn?.icon}
            alt=""
            className="rounded-full w-6 h-6 mr-2"
          />
          <span>{symbolFrom}</span>
        </div>

        <div
          className="justify-self-end relative right-10"
          title={tokenFromBalance}
        >
          {!!tokenFromBalance ? digitWrapperAsset(tokenFromBalance, 2) : '-'}
        </div>

        <div
          className="flex items-center justify-self-end"
          title={
            tokenInHolding !== undefined || tokenInHolding !== null
              ? scientificNotationToString(tokenInHolding?.toString() || '')
              : ''
          }
        >
          {tokenInHolding ? digitWrapperAsset(tokenInHolding.toString(), 2) : 0}
        </div>
      </div>

      <div className=" items-center text-white text-sm justify-between grid grid-cols-4">
        <div className="flex items-center justify-self-start col-span-2">
          <img
            src={tokenOut?.icon}
            className="rounded-full w-6 h-6 mr-2"
            alt=""
          />
          <span>{symbolTo}</span>
        </div>

        <div
          className="justify-self-end relative right-10"
          title={tokenToBalance}
        >
          {!!tokenToBalance ? digitWrapperAsset(tokenToBalance, 2) : ''}
        </div>

        <div
          className="flex items-center justify-self-end"
          title={
            tokenOutHolding !== undefined || tokenOutHolding !== null
              ? scientificNotationToString(tokenOutHolding?.toString() || '')
              : ''
          }
        >
          {tokenOutHolding
            ? digitWrapperAsset(tokenOutHolding.toString(), 2)
            : 0}
        </div>
      </div>

      <div className="inline-flex text-primaryOrderly justify-end border-b border-white border-opacity-10 mt-3">
        <span
          className="text-sm py-1.5  mb-3 px-3 rounded-lg bg-symbolHover hover:text-white cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowAllAssets(true);
          }}
        >
          See all
        </span>
      </div>

      {/* sell and buy button  */}
      <div className="flex items-center justify-center mt-7">
        <BuyButton
          onClick={() => {
            setSide('Buy');
          }}
          select={side === 'Buy'}
        />

        <SellButton
          onClick={() => {
            setSide('Sell');
          }}
          select={side === 'Sell'}
        />
      </div>

      {/*  order type  */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-primaryOrderly flex items-center ">
          Order Type
          <QuestionTip
            id="order_type_tip"
            defaultMessage={
              orderType === 'Limit'
                ? 'A limit order is an order to buy or sell at a specific price, or better. Limit orders are not guaranteed to execute'
                : 'A market order is immediately matched to the best available market price, and executed'
            }
            dataPlace="bottom"
            textC="text-primaryText"
          />
        </span>

        <div className="flex items-center">
          <button
            className={`flex px-4 py-2 mr-2 rounded-lg items-center justify-center ${
              orderType === 'Limit'
                ? side === 'Buy'
                  ? 'bg-buyGradientGreen'
                  : 'bg-sellGradientRedReverse'
                : 'bg-orderTypeBg'
            }`}
            onClick={() => {
              setOrderType('Limit');
            }}
            style={{
              width: '80px',
            }}
          >
            <span
              className={`text-sm ${
                orderType === 'Limit' ? 'text-white' : 'text-boxBorder'
              } font-bold`}
            >
              Limit
            </span>
          </button>

          <button
            className={`flex px-4 py-2 items-center rounded-lg justify-center ${
              orderType === 'Market'
                ? side === 'Buy'
                  ? 'bg-buyGradientGreen'
                  : 'bg-sellGradientRedReverse'
                : 'bg-orderTypeBg'
            }`}
            onClick={() => {
              setOrderType('Market');
            }}
            style={{
              width: '80px',
            }}
          >
            <span
              className={`text-sm ${
                orderType === 'Market' ? 'text-white' : 'text-boxBorder'
              } font-bold`}
            >
              Market
            </span>
          </button>
        </div>
      </div>

      {/* input box */}

      {orderType === 'Limit' && (
        <div className="w-full text-primaryOrderly mt-3 text-sm bg-black bg-opacity-10 rounded-xl border border-boxBorder p-3">
          <div className="flex items-center justify-between">
            <span>{'Price'}</span>

            <span>
              {symbolTo}/{symbolFrom}
            </span>
          </div>

          <div className="flex items-center mt-3 justify-between">
            <input
              type="number"
              step="any"
              ref={inputLimitPriceRef}
              onWheel={(e) =>
                inputLimitPriceRef.current
                  ? inputLimitPriceRef.current?.blur()
                  : null
              }
              min={0}
              placeholder="0"
              className="text-white text-left ml-2 text-xl w-full"
              value={limitPrice}
              onChange={(e) => {
                priceAndSizeValidator(e.target.value, inputValue);

                setLimitPrice(e.target.value);
              }}
              inputMode="decimal"
              onKeyDown={(e) =>
                symbolsArr.includes(e.key) && e.preventDefault()
              }
            />
          </div>
        </div>
      )}
      {orderType === 'Market' && (
        <div className="w-full rounded-xl border border-boxBorder p-3 mt-3 text-sm flex items-center justify-between">
          <span className="text-primaryOrderly">{'Price'}</span>

          <span className="text-white">Market price</span>
        </div>
      )}

      <div className="w-full text-primaryOrderly mt-3 bg-black text-sm bg-opacity-10 rounded-xl border border-boxBorder p-3">
        <div className="mb-2 text-left flex items-center justify-between">
          <span>Quantity</span>

          <span className="">{symbolFrom}</span>
        </div>

        <div className="flex items-center mt-2">
          <input
            autoFocus
            inputMode="decimal"
            ref={inputAmountRef}
            onWheel={(e) =>
              inputAmountRef.current ? inputAmountRef.current.blur() : null
            }
            className="text-white ml-2 text-xl w-full"
            value={inputValue}
            placeholder="0"
            type="number"
            step="any"
            min={0}
            onChange={(e) => {
              priceAndSizeValidator(
                orderType === 'Limit' ? limitPrice : marketPrice.toString(),
                e.target.value
              );

              setInputValue(e.target.value);
            }}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
          />

          <span
            className="bg-menuMoreBgColor rounded-md px-2 py-0.5 text-primaryText cursor-pointer hover:opacity-70"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (
                orderType === 'Limit' &&
                new Big(limitPrice || 0).lte(0) &&
                side === 'Buy'
              ) {
                return;
              }
              const symbolInfo = availableSymbols?.find(
                (s) => s.symbol === symbol
              );

              if (!symbolInfo) {
                return;
              }

              const maxAmount =
                side === 'Sell'
                  ? tokenInHolding || 0
                  : new Big(tokenOutHolding || 0)
                      .div(
                        orderType === 'Market' ? marketPrice : limitPrice || 1
                      )
                      .toNumber();

              const displayAmount = new Big(maxAmount || 0)
                .div(new Big(symbolInfo.base_tick))
                .round(0, 0)
                .times(new Big(symbolInfo.base_tick))
                .toString();

              setInputValue(displayAmount);

              priceAndSizeValidator(
                orderType == 'Market' ? marketPrice.toString() : limitPrice,
                displayAmount
              );
            }}
          >
            Max
          </span>
        </div>
      </div>

      {/* limit order advance mode */}

      {orderType === 'Limit' && (
        <div className="text-white text-sm mt-2">
          <div className="flex items-center justify-between">
            <span className="text-primaryOrderly">Advanced</span>

            <span
              className={`${
                showLimitAdvance ? 'text-white' : 'text-primaryOrderly'
              } cursor-pointer `}
              onClick={() => {
                setShowLimitAdvance(!showLimitAdvance);
              }}
            >
              {showLimitAdvance ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
          </div>

          <div
            className={`flex mt-2 items-center justify-between ${
              showLimitAdvance ? '' : 'hidden'
            }`}
          >
            <div className="flex items-center">
              <CheckBox
                check={advanceLimitMode === 'IOC'}
                setCheck={() => {
                  if (advanceLimitMode === 'IOC') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('IOC');
                  }
                }}
              ></CheckBox>
              <span
                className="ml-2 mr-1 cursor-pointer"
                onClick={() => {
                  if (advanceLimitMode === 'IOC') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('IOC');
                  }
                }}
              >
                IOC
              </span>

              <div
                data-class="reactTip"
                data-for={'user_board_ioc'}
                data-html={true}
                data-place={'top'}
                data-tip={getTipIoc()}
              >
                <QuestionMark></QuestionMark>

                <ReactTooltip
                  id={'user_board_ioc'}
                  backgroundColor="#1D2932"
                  place="right"
                  border
                  borderColor="#7e8a93"
                  textColor="#C6D1DA"
                  effect="solid"
                />
              </div>
            </div>
            <div className="flex items-center">
              <CheckBox
                check={advanceLimitMode === 'FOK'}
                setCheck={() => {
                  if (advanceLimitMode === 'FOK') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('FOK');
                  }
                }}
              ></CheckBox>
              <span
                className="cursor-pointer ml-2 mr-1"
                onClick={() => {
                  if (advanceLimitMode === 'FOK') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('FOK');
                  }
                }}
              >
                FOK
              </span>

              <div
                data-class="reactTip"
                data-for={'user_board_folk'}
                data-html={true}
                data-place={'top'}
                data-tip={getTipFOK()}
              >
                <QuestionMark></QuestionMark>

                <ReactTooltip
                  id={'user_board_folk'}
                  backgroundColor="#1D2932"
                  place="right"
                  border
                  borderColor="#7e8a93"
                  textColor="#C6D1DA"
                  effect="solid"
                />
              </div>
            </div>
            <div className="flex items-center">
              <CheckBox
                check={advanceLimitMode === 'POST_ONLY'}
                setCheck={() => {
                  if (advanceLimitMode === 'POST_ONLY') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('POST_ONLY');
                  }
                }}
              ></CheckBox>
              <span
                className="ml-2 mr-1 cursor-pointer"
                onClick={() => {
                  if (advanceLimitMode === 'POST_ONLY') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('POST_ONLY');
                  }
                }}
              >
                Post-only
              </span>

              <div
                data-class="reactTip"
                data-for={'user_board_post_only'}
                data-html={true}
                data-place={'top'}
                data-tip={getTipPostOnly()}
              >
                <QuestionMark></QuestionMark>

                <ReactTooltip
                  id={'user_board_post_only'}
                  backgroundColor="#1D2932"
                  place="right"
                  border
                  borderColor="#7e8a93"
                  textColor="#C6D1DA"
                  effect="solid"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showErrorTip && (
        <ErrorTip className={'relative top-3'} text={errorTipMsg} />
      )}

      <div className="mt-6  rounded-lg text-sm px-0 pt-1 relative z-10 pb-6">
        <div className="flex items-center justify-between">
          <span className="text-primaryOrderly">Fees</span>

          <FlexRow className="">
            <span className="flex items-center mr-1.5">
              <span className=" mr-2 text-white">
                {Number((userInfo?.taker_fee_rate || 0) / 100).toFixed(2)}%
              </span>
              <TextWrapper
                textC="text-primaryText "
                className="text-xs py-0 px-1"
                value={`Taker`}
              ></TextWrapper>
            </span>

            <span className="flex items-center">
              <span className=" mr-2 text-white">
                {Number((userInfo?.maker_fee_rate || 0) / 100).toFixed(2)}%
              </span>
              <TextWrapper
                textC="text-primaryText"
                value={`Maker`}
                className="text-xs py-0 px-1"
              ></TextWrapper>
            </span>
          </FlexRow>
        </div>

        <div className="flex items-center mt-2 justify-between">
          <span className="text-primaryOrderly">Total </span>
          <span className="text-white">
            {total === '-' ? '-' : digitWrapper(total.toString(), 3)}{' '}
            {` ${symbolTo}`}
          </span>
        </div>
      </div>

      <button
        className={`rounded-lg ${
          isInsufficientBalance
            ? 'bg-errorTip'
            : side === 'Buy'
            ? 'bg-buyGradientGreen'
            : 'bg-sellGradientRed'
        } ${
          isInsufficientBalance
            ? 'text-redwarningColor cursor-not-allowed'
            : 'text-white'
        }  py-2.5 relative bottom-3  flex z-20 items-center justify-center text-base ${
          submitDisable || showErrorTip ? 'opacity-60 cursor-not-allowed' : ''
        } `}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // handleSubmit();

          setConfirmModalOpen(true);
        }}
        disabled={submitDisable || isInsufficientBalance || showErrorTip}
        type="button"
      >
        {isInsufficientBalance ? 'Insufficient Balance' : side}
        {` ${isInsufficientBalance ? '' : symbolFrom}`}
      </button>

      <UserBoardFoot />

      {showAllAssets && (
        <AssetModal
          isOpen={showAllAssets}
          onRequestClose={() => {
            setShowAllAssets(false);
          }}
        />
      )}

      <AssetManagerModal
        isOpen={operationType === 'deposit'}
        onRequestClose={() => {
          setOperationType(undefined);
        }}
        type={operationType}
        onClick={(amount: string, tokenId: string) => {
          if (!tokenId) return;
          return depositOrderly(tokenId, amount);
        }}
        tokenId={operationId}
        accountBalance={tokenInHolding || 0}
        tokenInfo={tokenInfo}
      />

      <AssetManagerModal
        isOpen={operationType === 'withdraw'}
        onRequestClose={() => {
          setOperationType(undefined);
        }}
        type={operationType}
        onClick={(amount: string, tokenId: string) => {
          if (!tokenId) return;
          return withdrawOrderly(tokenId, amount);
        }}
        tokenId={operationId}
        accountBalance={tokenInHolding || 0}
        tokenInfo={tokenInfo}
      />

      <ConfirmOrderModal
        isOpen={confirmModalOpen}
        onRequestClose={() => {
          setConfirmModalOpen(false);
        }}
        symbolFrom={symbolFrom}
        symbolTo={symbolTo}
        side={side}
        quantity={inputValue}
        price={
          orderType === 'Limit' ? limitPrice : marketPrice?.toString() || '0'
        }
        fee={fee}
        totalCost={total}
        onClick={handleSubmit}
        userInfo={userInfo}
      ></ConfirmOrderModal>

      <RegisterModal
        isOpen={registerModalOpen}
        onRequestClose={() => {
          setRegisterModalOpen(false);
        }}
        orderlyRegistered={userExist}
        onConfirm={() => {
          setAgreeCheck(true);
        }}
      />
    </div>
  );
}

export function AssetManagerModal(
  props: Modal.Props & {
    type: 'deposit' | 'withdraw' | undefined;
    onClick: (amount: string, tokenId: string) => Promise<void>;
    tokenId: string | undefined;
    accountBalance: number;
    walletBalance?: number | string;
    standAlone?: boolean;
    tokenInfo: TokenInfo[] | undefined;
  }
) {
  const {
    onClick,
    walletBalance: walletBalanceProp,
    standAlone,
    onRequestClose,
    type,
    tokenId: tokenIdProp,
    accountBalance,
    tokenInfo,
    isOpen,
  } = props;

  const [tokenId, setTokenId] = useState<string | undefined>(tokenIdProp);

  const isMobile = useClientMobile();

  useEffect(() => {
    setTokenId(tokenIdProp);
  }, [tokenIdProp]);

  const [showSelectToken, setShowSelectToken] = useState<boolean>(false);

  const [tokenMeta, setTokenMeta] = useState<any>();

  const [percentage, setPercentage] = useState<string>('0');

  const progressBarIndex = [0, 25, 50, 75, 100];

  const [hoverToken, setHoverToken] = useState<boolean>(false);

  const balances = useTokensBalances(
    tokenInfo?.map((token) => {
      return {
        id: token.token_account_id,
        decimals: token.decimals,
      };
    }) || [],
    tokenInfo,
    isOpen
  );

  const walletBalance =
    balances?.find((b: any) => b.id.toLowerCase() === tokenId.toLowerCase())
      ?.wallet_balance ||
    walletBalanceProp ||
    '0';

  const displayAccountBalance =
    balances
      ?.find((b: any) => b.id.toLowerCase() === tokenId.toLowerCase())
      ?.holding?.toString() || '0';

  useEffect(() => {
    if (!tokenId) return;
    if (tokenId === 'near') {
      setTokenMeta(nearMetadata);
    } else
      getFTmetadata(tokenId).then((meta) => {
        setTokenMeta(meta);
      });
  }, [tokenId]);

  const [inputValue, setInputValue] = useState<string>();
  const ref = useRef<HTMLInputElement>(null);

  const rangeRef = useRef<HTMLInputElement>(null);
  const decimalPlaceLimit = Math.min(8, tokenMeta?.decimals || 8);

  const setAmountByShareFromBar = (sharePercent: string) => {
    setPercentage(sharePercent);

    const sharePercentOfValue = percentOfBigNumber(
      Number(sharePercent),
      type === 'deposit'
        ? tokenId.toLowerCase() === 'near'
          ? new Big(Number(walletBalance) < 0.5 ? 0.5 : walletBalance)
              .minus(0.5)
              .toFixed(24)
          : walletBalance
        : displayAccountBalance.toString(),
      decimalPlaceLimit || tokenMeta.decimals
    );

    if (
      new Big(sharePercentOfValue).gt(new Big(walletBalance)) &&
      type === 'deposit'
    ) {
      setInputValue('0');
      return;
    }

    if (Number(sharePercent) === 0) {
      setInputValue('');
    } else {
      setInputValue(sharePercentOfValue);
    }
  };

  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    if (tokenId && tokenMeta) {
      setAmountByShareFromBar(percentage);
    }
  }, [tokenId, tokenMeta]);

  useEffect(() => {
    if (rangeRef.current) {
      rangeRef.current.style.backgroundSize = `${percentage}% 100%`;
    }
  }, [percentage, rangeRef.current]);

  if (!tokenId || !tokenMeta) return null;

  function validation() {
    if (type === 'deposit') {
      if (
        tokenId.toLowerCase() === 'near' &&
        new Big(walletBalance || 0).minus(new Big(inputValue || '0')).lt(0.5) &&
        walletBalance !== ''
      ) {
        return false;
      }

      if (
        tokenId.toLowerCase() !== 'near' &&
        new Big(walletBalance || 0).minus(new Big(inputValue || '0')).lt(0)
      ) {
        return false;
      }
    }

    if (type === 'withdraw') {
      if (
        new Big(displayAccountBalance || 0)
          .minus(new Big(inputValue || '0'))
          .lt(0)
      ) {
        return false;
      }
    }

    return true;
  }

  return (
    <>
      <Modal
        {...props}
        style={{
          content: isMobile
            ? {
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                top: 'none',
                bottom: '0px',
                left: '0px',
                transform: 'translate(-50%, -20px)',
                outline: 'none',
              }
            : {
                zIndex: 999,
              },
        }}
      >
        <div
          className={`  lg:w-p410  ${
            isMobile
              ? 'xs:w-screen xs:fixed xs:bottom-0 xs:left-0 rounded-t-2xl'
              : 'gradientBorderWrapperNoShadowForOrderly border rounded-2xl'
          }  bg-boxBorder text-sm text-primaryOrderly  `}
        >
          <div className="px-5 py-6 flex flex-col ">
            <div className="flex items-center pb-6 justify-between">
              <span className="text-white text-lg font-bold">
                {props.type === 'deposit'
                  ? 'Deposit'
                  : props.type === 'withdraw'
                  ? 'Withdraw'
                  : ''}
              </span>

              <span
                className={isMobile ? 'hidden' : 'cursor-pointer '}
                onClick={(e: any) => {
                  onRequestClose && onRequestClose(e);
                }}
              >
                <IoClose size={20} />
              </span>
            </div>

            <div className="flex items-center pb-3 justify-between">
              <span className="flex items-center">
                <NearIConSelectModal /> <span className="ml-2">Wallet</span>
              </span>

              <span title={walletBalance?.toString() || ''}>
                {!walletBalance
                  ? '-'
                  : digitWrapperAsset(walletBalance.toString() || '0', 3)}
              </span>
            </div>

            <div className="flex items-center pb-4 justify-between">
              <span className="flex items-center ">
                {' '}
                <OrderlyIconBalance />
                <span className="ml-2">Available</span>
              </span>

              <span title={displayAccountBalance?.toString() || ''}>
                {digitWrapperAsset(displayAccountBalance.toString(), 3)}
              </span>
            </div>

            <div className="flex mb-5 items-center border border-border2 w-full bg-black bg-opacity-10 rounded-2xl px-3 py-3">
              <input
                inputMode="decimal"
                ref={ref}
                onWheel={(e) => (ref.current ? ref.current.blur() : null)}
                className="text-white text-xl w-full"
                value={inputValue}
                type="number"
                placeholder="0.0"
                min={0}
                onInput={(e) => {
                  if (decimalPlaceLimit === undefined) return;

                  function limitDecimalPlaces(e: any) {
                    // 获取用户输入的数字
                    const value = e.target.value;

                    // 判断是否超过了8位小数

                    if (
                      value.includes('.') &&
                      value.split('.')[1].length > decimalPlaceLimit
                    ) {
                      // 截取前8位小数
                      e.target.value = value.slice(
                        0,
                        value.indexOf('.') + decimalPlaceLimit + 1
                      );
                    }
                  }

                  limitDecimalPlaces(e);
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputValue(e.target.value);

                  const percentage =
                    Number(
                      type === 'deposit' ? walletBalance : displayAccountBalance
                    ) > 0
                      ? percent(
                          value || '0',
                          type === 'deposit'
                            ? type === 'deposit' &&
                              tokenId.toLowerCase() === 'near'
                              ? new Big(
                                  Number(walletBalance) < 0.5
                                    ? 0.5
                                    : walletBalance || 0
                                )
                                  .minus(0.5)
                                  .toFixed(24)
                              : walletBalance.toString()
                            : displayAccountBalance.toString()
                        ).toString()
                      : '0';
                  setPercentage(scientificNotationToString(percentage));
                }}
                onKeyDown={(e) =>
                  symbolsArr.includes(e.key) && e.preventDefault()
                }
              />

              <div
                className="rounded-3xl p-1  hover:bg-symbolHover3 cursor-pointer flex flex-shrink-0 pr-2 items-center"
                style={{
                  background: hoverToken ? 'rgba(126, 138, 147, 0.1)' : '',
                }}
                onMouseEnter={() => {
                  setHoverToken(true);
                }}
                onMouseLeave={() => {
                  setHoverToken(false);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSelectToken(true);
                }}
              >
                <img
                  src={tokenMeta.icon}
                  className="rounded-full w-6 h-6 mr-2"
                  alt=""
                />
                <span className="text-white font-bold text-base">
                  {tokenMeta.symbol}
                </span>
                <MdKeyboardArrowDown size={20} />
              </div>
            </div>

            <div className="pb-8">
              <div className="flex items-center justify-between  px-1.5 ">
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

              <div className="py-1 px-1 relative">
                <input
                  ref={rangeRef}
                  onChange={(e) => {
                    setAmountByShareFromBar(e.target.value);
                  }}
                  value={percentage}
                  type="range"
                  className={`w-full cursor-pointer ${
                    type + '-bar'
                  } remove-by-share-bar`}
                  min="0"
                  max="100"
                  step="any"
                  inputMode="decimal"
                  style={{
                    backgroundSize: `${percentage}% 100%`,
                  }}
                />

                <div
                  className={`rangeText rounded-lg absolute py-0.5 text-xs ${
                    type === 'withdraw' ? 'text-white' : 'text-black'
                  }  font-bold text-center w-10`}
                  style={{
                    background: type === 'withdraw' ? '#4627FF' : '#00C6A2',
                    left: `calc(${percentage}% - 40px * ${percentage} / 100)`,
                    position: 'absolute',
                    top: '20px',
                  }}
                >
                  {Number(percentage) > 0 && Number(percentage) < 1
                    ? 1
                    : Number(percentage) > 100
                    ? 100
                    : Math.floor(Number(percentage))}
                  %
                </div>
              </div>
            </div>
            {type === 'deposit' &&
              !validation() &&
              tokenId.toLowerCase() === 'near' && (
                <div className="text-warn text-center mb-2 text-xs xs:-mt-2 lg:whitespace-nowrap">
                  0.5 NEAR locked in wallet for covering transaction fee
                </div>
              )}

            <button
              className={`flex ${
                !validation() ||
                new Big(inputValue || 0).lte(0) ||
                buttonLoading
                  ? 'opacity-70 cursor-not-allowed'
                  : ''
              } items-center justify-center  font-bold text-base text-white py-2.5 rounded-lg ${
                type === 'deposit' ? 'bg-primaryGradient' : 'bg-withdrawPurple'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!inputValue) return;
                setButtonLoading(true);
                onClick(inputValue, tokenId);
              }}
              disabled={
                !validation() ||
                new Big(inputValue || 0).lte(0) ||
                buttonLoading
              }
            >
              <ButtonTextWrapper
                loading={buttonLoading}
                Text={() => (
                  <span>
                    {type === 'deposit'
                      ? 'Deposit'
                      : type === 'withdraw'
                      ? 'Withdraw'
                      : ''}
                  </span>
                )}
              ></ButtonTextWrapper>
            </button>
          </div>
        </div>
      </Modal>

      <SelectTokenModal
        onSelect={setTokenId}
        isOpen={showSelectToken}
        onRequestClose={() => {
          setShowSelectToken(false);
        }}
        balances={balances}
        tokenInfo={props.tokenInfo}
        style={{
          overlay: {
            zIndex: 1000,
          },
        }}
        orderBy={type === 'deposit' ? 'wallet' : 'orderly'}
      />
    </>
  );
}

export function MobileUserBoard({
  side,
  setSide,
  setShowWrapper,
}: {
  side: 'Buy' | 'Sell';
  setShowWrapper: (show: boolean) => void;
  setSide: (side: 'Buy' | 'Sell') => void;
}) {
  const {
    symbol,
    orders,
    tokenInfo,
    storageEnough,
    balances,
    setValidAccountSig,
    handlePendingOrderRefreshing,
    validAccountSig,
    myPendingOrdersRefreshing,
    bridgePrice,
  } = useOrderlyContext();

  const availableSymbols = useAllSymbolInfo();

  const { accountId, modal, selector } = useWalletSelector();

  const storedLimitOrderAdvance =
    sessionStorage.getItem(REF_ORDERLY_LIMIT_ORDER_ADVANCE) || '{}';

  const parsedAdvance = JSON.parse(storedLimitOrderAdvance);

  const [showLimitAdvance, setShowLimitAdvance] = useState<boolean>(
    parsedAdvance?.show || false
  );

  const [advanceLimitMode, setAdvanceLimitMode] = useState<
    'IOC' | 'FOK' | 'POST_ONLY'
  >(parsedAdvance?.advance);

  useEffect(() => {
    sessionStorage.setItem(
      REF_ORDERLY_LIMIT_ORDER_ADVANCE,

      JSON.stringify(
        advanceLimitMode
          ? {
              advance: advanceLimitMode,
              show: showLimitAdvance,
            }
          : {
              show: showLimitAdvance,
            }
      )
    );
  }, [showLimitAdvance, advanceLimitMode]);

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Limit');

  const [holdings, setHoldings] = useState<Holding[]>();

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

  const [inputValue, setInputValue] = useState<string>('');

  const [limitPrice, setLimitPrice] = useState<string>('');

  useEffect(() => {
    setLimitPrice(bridgePrice);
  }, [bridgePrice]);

  const [userInfo, setUserInfo] = useState<ClientInfo>();

  const [showAllAssets, setShowAllAssets] = useState<boolean>(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const submitDisable =
    !inputValue ||
    Number(inputValue) === 0 ||
    (orderType === 'Limit' && Number(limitPrice) <= 0) ||
    !userInfo;

  const inputLimitPriceRef = useRef<HTMLInputElement>(null);

  const inputAmountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getCurrentHolding({ accountId }).then((res) => {
      setHoldings(res.data.holding);
    });
  }, [accountId, myPendingOrdersRefreshing, validAccountSig]);

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getAccountInformation({ accountId }).then((res) => {
      setUserInfo(res);
    });
  }, [accountId, validAccountSig]);

  const curHoldingIn = holdings?.find((h) => h.token === symbolFrom);

  const curHoldingOut = holdings?.find((h) => h.token === symbolTo);

  const tokenInHolding = curHoldingIn
    ? curHoldingIn.holding + curHoldingIn.pending_short
    : balances && balances[symbolFrom]?.holding;

  const tokenOutHolding = curHoldingOut
    ? curHoldingOut.holding + curHoldingOut.pending_short
    : balances && balances[symbolTo]?.holding;

  const fee =
    orderType === 'Limit'
      ? !userInfo || !limitPrice
        ? '-'
        : (userInfo.maker_fee_rate / 10000) *
          Number(limitPrice || 0) *
          Number(inputValue || 0)
      : !userInfo ||
        !orders ||
        !(side === 'Buy' ? orders.asks?.[0]?.[0] : orders?.bids?.[0]?.[0])
      ? '-'
      : (userInfo.taker_fee_rate / 10000) *
        Number(
          side === 'Buy' ? orders.asks?.[0]?.[0] : orders?.bids?.[0]?.[0] || 0
        ) *
        Number(inputValue || 0);

  const marketPrice = !orders
    ? 0
    : side === 'Buy'
    ? orders.asks?.[0]?.[0]
    : orders?.bids?.[0]?.[0];

  const total =
    orderType === 'Limit'
      ? !limitPrice || !userInfo || fee === '-'
        ? '-'
        : Number(inputValue || 0) * Number(limitPrice || 0)
      : !orders || !userInfo || fee === '-' || !marketPrice
      ? '-'
      : Number(inputValue || 0) * Number(marketPrice || 0);

  const handleSubmit = () => {
    if (!accountId) return;
    if (orderType === 'Market') {
      return createOrder({
        accountId,
        orderlyProps: {
          side: side === 'Buy' ? 'BUY' : 'SELL',
          symbol: symbol,
          order_type: 'MARKET',
          order_amount: parseFloat(
            side === 'Buy' ? new Big(total).toFixed(3, 0) : ''
          ),

          order_quantity: side === 'Sell' ? inputValue : '',
          broker_id: 'ref_dex',
        },
      }).then(async (res) => {
        if (res.success === false)
          return orderEditPopUpFailure({
            tip: res.message,
          });

        handlePendingOrderRefreshing();

        const order = await getOrderByOrderId({
          accountId,
          order_id: res.data.order_id,
        });

        setShowWrapper(false);

        return orderPopUp({
          orderType: 'Market',
          symbolName: symbol,
          side: side,
          size: inputValue,
          tokenIn: tokenIn,
          price: marketPrice.toString() || '',
          timeStamp: res.timestamp,
          order,
        });
      });
    } else if (orderType === 'Limit') {
      return createOrder({
        accountId,
        orderlyProps: {
          side: side === 'Buy' ? 'BUY' : 'SELL',
          symbol: symbol,
          order_price: limitPrice,
          order_type:
            typeof advanceLimitMode !== 'undefined'
              ? advanceLimitMode
              : 'LIMIT',
          order_quantity: inputValue,
          broker_id: 'ref_dex',
        },
      }).then(async (res) => {
        if (res.success === false)
          return orderEditPopUpFailure({
            tip: res.message,
          });

        handlePendingOrderRefreshing();

        const order = await getOrderByOrderId({
          accountId,
          order_id: res.data.order_id,
        });
        setShowWrapper(false);

        return orderPopUp({
          orderType: 'Limit',
          symbolName: symbol,
          side: side,
          size: inputValue,
          tokenIn: tokenIn,
          price: limitPrice || '',
          timeStamp: res.timestamp,
          filled: order?.data?.status === 'FILLED',
          order: order.data,
        });
      });
    }
  };

  const [showErrorTip, setShowErrorTip] = useState<boolean>(false);

  const [errorTipMsg, setErrorTipMsg] = useState<string>('');

  const isInsufficientBalance =
    side === 'Buy'
      ? new Big(total === '-' ? '0' : total).gt(tokenOutHolding || '0') ||
        new Big(tokenOutHolding || 0).eq(0)
      : new Big(inputValue || '0').gt(tokenInHolding || '0');

  const priceValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo) {
      return;
    }

    // price validator

    if (new Big(price || 0).lt(symbolInfo.quote_min)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Min price should be higher than or equal to ${symbolInfo.quote_min}`
      );
      return;
    }

    if (new Big(price || 0).gt(symbolInfo.quote_max)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Price should be lower than or equal to ${symbolInfo.quote_max}`
      );
      return;
    }

    if (
      new Big(new Big(price || 0).minus(new Big(symbolInfo.quote_min)))
        .mod(symbolInfo.quote_tick)
        .gt(0)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(`Price should be multiple of ${symbolInfo.quote_tick}`);
      return;
    }

    if (
      new Big(price || 0).gt(
        new Big(orders.asks?.[0]?.[0] || 0).times(1 + symbolInfo.price_range)
      ) &&
      side === 'Buy'
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Price should be less than or equal to ${new Big(
          orders.asks?.[0]?.[0] || 0
        ).times(1 + symbolInfo.price_range)}`
      );

      return;
    }

    if (
      new Big(price || 0).lt(
        new Big(orders.bids?.[0]?.[0] || 0).times(1 - symbolInfo.price_range)
      ) &&
      side === 'Sell'
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Price should be greater than or equal to ${new Big(
          orders.bids?.[0]?.[0] || 0
        ).times(1 - symbolInfo.price_range)}`
      );

      return;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `The order value should be greater than or equal to ${symbolInfo.min_notional}`
      );
      return;
    }

    return true;
  };

  const sizeValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo) {
      return;
    }

    // size validator

    if (new Big(size || 0).lt(symbolInfo.base_min)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Quantity to ${side.toLowerCase()} should be greater than or equal to ${
          symbolInfo.base_min
        }`
      );
      return;
    }

    if (new Big(size || 0).gt(symbolInfo.base_max)) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `Quantity to ${side.toLowerCase()} should be less than or equal to ${
          symbolInfo.base_max
        }`
      );
      return;
    }

    if (
      new Big(new Big(size || 0).minus(new Big(symbolInfo.base_min)))
        .mod(symbolInfo.base_tick)
        .gt(0)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(`Quantity should be multiple of ${symbolInfo.base_tick}`);
      return;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      setShowErrorTip(true);
      setErrorTipMsg(
        `The order value should be greater than or equal to ${symbolInfo.min_notional}`
      );
      return;
    }

    return true;
  };

  const priceAndSizeValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!symbolInfo || (ONLY_ZEROS.test(price) && ONLY_ZEROS.test(size))) {
      setShowErrorTip(false);
      setErrorTipMsg('');
      return;
    }

    let resPrice;
    let resSize;

    if (!ONLY_ZEROS.test(price)) {
      resPrice = priceValidator(price, size);
    } else {
      resPrice = true;
    }

    if (!ONLY_ZEROS.test(size)) {
      resSize = sizeValidator(price, size);
    } else {
      resSize = true;
    }

    if (resPrice === true && resSize === true) {
      // price validator

      setShowErrorTip(false);
      setErrorTipMsg('');
    }
  };

  useEffect(() => {
    const marketPrice = !orders
      ? 0
      : side === 'Buy'
      ? orders.asks?.[0]?.[0]
      : orders?.bids?.[0]?.[0];

    priceAndSizeValidator(
      orderType === 'Limit' ? limitPrice : marketPrice.toString(),
      inputValue
    );
  }, [side, orderType]);

  return (
    <div className="w-full p-6 relative flex flex-col    bg-black bg-opacity-10">
      {/* sell and buy button  */}
      <div className="flex items-center justify-center ">
        <BuyButton
          onClick={() => {
            setSide('Buy');
          }}
          select={side === 'Buy'}
        />

        <SellButton
          onClick={() => {
            setSide('Sell');
          }}
          select={side === 'Sell'}
        />
      </div>

      {/*  order type  */}
      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-primaryOrderly flex items-center ">
          Order Type
          <QuestionTip
            id="order_type_tip"
            defaultMessage={
              orderType === 'Limit'
                ? 'A limit order is an order to buy or sell at a specific price, or better. Limit orders are not guaranteed to execute'
                : 'A market order is immediately matched to the best available market price, and executed'
            }
            textC="text-primaryText"
          />
        </span>

        <div className="flex items-center">
          <button
            className={`flex px-4 py-2 mr-2 rounded-lg items-center justify-center ${
              orderType === 'Limit'
                ? side === 'Buy'
                  ? 'bg-buyGradientGreen'
                  : 'bg-sellGradientRedReverse'
                : 'bg-orderTypeBg'
            }`}
            onClick={() => {
              setOrderType('Limit');
            }}
            style={{
              width: '80px',
            }}
          >
            <span
              className={`text-sm ${
                orderType === 'Limit' ? 'text-white' : 'text-boxBorder'
              } font-bold`}
            >
              Limit
            </span>
          </button>

          <button
            className={`flex px-4 py-2 items-center rounded-lg justify-center ${
              orderType === 'Market'
                ? side === 'Buy'
                  ? 'bg-buyGradientGreen'
                  : 'bg-sellGradientRedReverse'
                : 'bg-orderTypeBg'
            }`}
            onClick={() => {
              setOrderType('Market');
            }}
            style={{
              width: '80px',
            }}
          >
            <span
              className={`text-sm ${
                orderType === 'Market' ? 'text-white' : 'text-boxBorder'
              } font-bold`}
            >
              Market
            </span>
          </button>
        </div>
      </div>

      {/* input box */}

      <div className="flex items-center w-full">
        {orderType === 'Limit' && (
          <div className="w-full border border-inputV3BorderColor  mr-1 text-primaryOrderly mt-3 text-sm bg-black bg-opacity-10 rounded-xl  r p-3">
            <div className="flex items-center justify-between">
              <span>{'Price'}</span>

              <span>{symbolTo}</span>
            </div>

            <div className="flex items-center mt-2 justify-between">
              <input
                type="number"
                step="any"
                ref={inputLimitPriceRef}
                onWheel={(e) =>
                  inputLimitPriceRef.current
                    ? inputLimitPriceRef.current?.blur()
                    : null
                }
                min={0}
                placeholder="0"
                className="text-white text-left ml-2 text-xl w-full"
                value={limitPrice}
                onChange={(e) => {
                  priceAndSizeValidator(e.target.value, inputValue);

                  setLimitPrice(e.target.value);
                }}
                inputMode="decimal"
                onKeyDown={(e) =>
                  symbolsArr.includes(e.key) && e.preventDefault()
                }
              />
            </div>
          </div>
        )}

        <div className="w-full text-primaryOrderly ml-1 mt-3 bg-black text-sm bg-opacity-10 rounded-xl border border-inputV3BorderColor p-3">
          <div className="mb-2 text-left flex items-center justify-between">
            <span>Quantity</span>

            <span className="">{symbolFrom}</span>
          </div>

          <div className="flex items-center mt-2">
            <input
              autoFocus
              inputMode="decimal"
              ref={inputAmountRef}
              onWheel={(e) =>
                inputAmountRef.current ? inputAmountRef.current.blur() : null
              }
              className="text-white ml-2 text-xl w-full"
              value={inputValue}
              placeholder="0"
              type="number"
              step="any"
              min={0}
              onChange={(e) => {
                priceAndSizeValidator(
                  orderType === 'Limit' ? limitPrice : marketPrice.toString(),
                  e.target.value
                );

                setInputValue(e.target.value);
              }}
              onKeyDown={(e) =>
                symbolsArr.includes(e.key) && e.preventDefault()
              }
            />

            <span
              className="bg-menuMoreBgColor rounded-md px-2 py-0.5 text-primaryText cursor-pointer hover:opacity-70"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (
                  orderType === 'Limit' &&
                  new Big(limitPrice || 0).lte(0) &&
                  side === 'Buy'
                ) {
                  return;
                }
                const symbolInfo = availableSymbols?.find(
                  (s) => s.symbol === symbol
                );

                if (!symbolInfo) {
                  return;
                }

                const maxAmount =
                  side === 'Sell'
                    ? tokenInHolding || 0
                    : new Big(tokenOutHolding || 0)
                        .div(
                          orderType === 'Market' ? marketPrice : limitPrice || 1
                        )
                        .toNumber();

                const displayAmount = new Big(maxAmount || 0)
                  .div(new Big(symbolInfo.base_tick))
                  .round(0, 0)
                  .times(new Big(symbolInfo.base_tick))
                  .toString();

                setInputValue(displayAmount);

                priceAndSizeValidator(
                  orderType == 'Market' ? marketPrice.toString() : limitPrice,
                  displayAmount
                );
              }}
            >
              Max
            </span>
          </div>
        </div>
      </div>

      <div
        className={`text-primaryText mt-1 ${
          side === 'Sell' ? 'text-right' : 'text-left'
        } `}
      >
        Balance:
        <span
          className={`ml-1 `}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (side === 'Buy') return;

            if (orderType === 'Limit' && new Big(limitPrice || 0).lte(0)) {
              return;
            }
            const symbolInfo = availableSymbols?.find(
              (s) => s.symbol === symbol
            );

            if (!symbolInfo) {
              return;
            }

            const maxAmount =
              side === 'Sell'
                ? tokenInHolding || 0
                : new Big(tokenOutHolding || 0)
                    .div(orderType === 'Market' ? marketPrice : limitPrice || 1)
                    .toNumber();

            const displayAmount = new Big(maxAmount || 0)
              .div(new Big(symbolInfo.base_tick))
              .round(0, 0)
              .times(new Big(symbolInfo.base_tick))
              .toString();

            setInputValue(displayAmount);

            priceAndSizeValidator(
              orderType == 'Market' ? marketPrice.toString() : limitPrice,
              displayAmount
            );
          }}
        >
          {side === 'Buy'
            ? tokenOutHolding
              ? digitWrapperAsset(tokenOutHolding.toString(), 2)
              : 0
            : tokenInHolding
            ? digitWrapperAsset(tokenInHolding.toString(), 2)
            : 0}
        </span>
        <span className="ml-1">{side === 'Sell' ? symbolFrom : symbolTo}</span>
      </div>

      {/* limit order advance mode */}

      {orderType === 'Limit' && (
        <div className="text-white text-sm mt-2">
          <div className="flex items-center justify-between">
            <span className="text-primaryOrderly">Advanced</span>

            <div className="flex items-center text-primaryText">
              <span className="mr-2">
                {advanceLimitMode === 'POST_ONLY'
                  ? 'Post-only'
                  : advanceLimitMode}
              </span>

              <span
                className={`${
                  showLimitAdvance ? 'text-white' : 'text-primaryOrderly'
                } cursor-pointer `}
                onClick={() => {
                  setShowLimitAdvance(!showLimitAdvance);
                }}
              >
                {showLimitAdvance ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </span>
            </div>
          </div>

          <div
            className={`flex mt-2 items-center justify-between ${
              showLimitAdvance ? '' : 'hidden'
            }`}
          >
            <div className="flex items-center">
              <CheckBox
                check={advanceLimitMode === 'IOC'}
                setCheck={() => {
                  if (advanceLimitMode === 'IOC') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('IOC');
                  }
                }}
              ></CheckBox>
              <span
                className="ml-2 mr-1 cursor-pointer"
                onClick={() => {
                  if (advanceLimitMode === 'IOC') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('IOC');
                  }
                }}
              >
                IOC
              </span>

              <div
                data-class="reactTip"
                data-for={'user_board_ioc'}
                data-html={true}
                data-place={'top'}
                data-tip={getTipIoc()}
              >
                <QuestionMark></QuestionMark>

                <ReactTooltip
                  id={'user_board_ioc'}
                  backgroundColor="#1D2932"
                  place="right"
                  border
                  borderColor="#7e8a93"
                  textColor="#C6D1DA"
                  effect="solid"
                />
              </div>
            </div>
            <div className="flex items-center">
              <CheckBox
                check={advanceLimitMode === 'FOK'}
                setCheck={() => {
                  if (advanceLimitMode === 'FOK') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('FOK');
                  }
                }}
              ></CheckBox>
              <span
                className="cursor-pointer ml-2 mr-1"
                onClick={() => {
                  if (advanceLimitMode === 'FOK') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('FOK');
                  }
                }}
              >
                FOK
              </span>

              <div
                data-class="reactTip"
                data-for={'user_board_folk'}
                data-html={true}
                data-place={'top'}
                data-tip={getTipFOK()}
              >
                <QuestionMark></QuestionMark>

                <ReactTooltip
                  id={'user_board_folk'}
                  backgroundColor="#1D2932"
                  place="right"
                  border
                  borderColor="#7e8a93"
                  textColor="#C6D1DA"
                  effect="solid"
                />
              </div>
            </div>
            <div className="flex items-center">
              <CheckBox
                check={advanceLimitMode === 'POST_ONLY'}
                setCheck={() => {
                  if (advanceLimitMode === 'POST_ONLY') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('POST_ONLY');
                  }
                }}
              ></CheckBox>
              <span
                className="ml-2 mr-1 cursor-pointer"
                onClick={() => {
                  if (advanceLimitMode === 'POST_ONLY') {
                    setAdvanceLimitMode(undefined);
                  } else {
                    setAdvanceLimitMode('POST_ONLY');
                  }
                }}
              >
                Post-only
              </span>

              <div
                data-class="reactTip"
                data-for={'user_board_post_only'}
                data-html={true}
                data-place={'top'}
                data-tip={getTipPostOnly()}
              >
                <QuestionMark></QuestionMark>

                <ReactTooltip
                  id={'user_board_post_only'}
                  backgroundColor="#1D2932"
                  place="right"
                  border
                  borderColor="#7e8a93"
                  textColor="#C6D1DA"
                  effect="solid"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6  rounded-lg text-sm px-0 pt-1 relative z-10 ">
        <div className="flex items-center justify-between">
          <span className="text-primaryOrderly">Fees</span>

          <FlexRow className="">
            <span className="flex items-center mr-1.5">
              <span className=" mr-2 text-white">
                {Number((userInfo?.taker_fee_rate || 0) / 100).toFixed(2)}%
              </span>
              <TextWrapper
                textC="text-primaryText "
                className="text-xs py-0 px-1"
                value={`Taker`}
              ></TextWrapper>
            </span>

            <span className="flex items-center">
              <span className=" mr-2 text-white">
                {Number((userInfo?.maker_fee_rate || 0) / 100).toFixed(2)}%
              </span>
              <TextWrapper
                textC="text-primaryText"
                value={`Maker`}
                className="text-xs py-0 px-1"
              ></TextWrapper>
            </span>
          </FlexRow>
        </div>

        <div className="flex items-center mt-2 justify-between">
          <span className="text-primaryOrderly">Total </span>
          <span className="text-white">
            {total === '-' ? '-' : digitWrapper(total.toString(), 3)}{' '}
            {` ${symbolTo}`}
          </span>
        </div>
      </div>

      <div className="mb-10">
        {showErrorTip && (
          <ErrorTip className={'relative top-3'} text={errorTipMsg} />
        )}
      </div>

      <button
        className={`rounded-lg ${
          isInsufficientBalance
            ? 'bg-errorTip'
            : side === 'Buy'
            ? 'bg-buyGradientGreen'
            : 'bg-sellGradientRed'
        } ${
          isInsufficientBalance
            ? 'text-redwarningColor cursor-not-allowed'
            : 'text-white'
        }  py-2.5 relative bottom-3  flex z-20 items-center justify-center text-base ${
          submitDisable || showErrorTip ? 'opacity-60 cursor-not-allowed' : ''
        } `}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // handleSubmit();

          setConfirmModalOpen(true);
        }}
        disabled={submitDisable || isInsufficientBalance || showErrorTip}
        type="button"
      >
        {isInsufficientBalance ? 'Insufficient Balance' : side}
        {` ${isInsufficientBalance ? '' : symbolFrom}`}
      </button>

      {showAllAssets && (
        <AssetModal
          isOpen={showAllAssets}
          onRequestClose={() => {
            setShowAllAssets(false);
          }}
        />
      )}

      <ConfirmOrderModal
        isOpen={confirmModalOpen}
        onRequestClose={() => {
          setConfirmModalOpen(false);
        }}
        symbolFrom={symbolFrom}
        symbolTo={symbolTo}
        side={side}
        quantity={inputValue}
        price={
          orderType === 'Limit' ? limitPrice : marketPrice?.toString() || '0'
        }
        fee={fee}
        totalCost={total}
        onClick={handleSubmit}
        userInfo={userInfo}
      ></ConfirmOrderModal>
    </div>
  );
}

function SelectTokenModal(
  props: Modal.Props & {
    onSelect: (tokenId: string) => void;
    tokenInfo: TokenInfo[] | undefined;
    balances: any;
    orderBy: 'wallet' | 'orderly';
  }
) {
  const { onRequestClose, onSelect, tokenInfo, balances, orderBy } = props;

  const [sortOrderlyAccount, setSortOrderlyAccount] = useState<'asc' | 'desc'>(
    'desc'
  );

  const [sortNearBalance, setSortNearBalance] = useState<'asc' | 'desc'>(
    'desc'
  );

  const [searchValue, setSearchValue] = useState<string>('');

  const [sortByBalance, setSortByBalance] = useState<'wallet' | 'orderly'>(
    orderBy
  );

  useEffect(() => {
    setSortByBalance(orderBy);
  }, [orderBy]);

  const sortingFunc = (a: any, b: any) => {
    if (sortByBalance === 'wallet' || sortByBalance === undefined) {
      if (sortNearBalance === undefined || sortNearBalance === 'desc') {
        return b.wallet_balance - a.wallet_balance;
      } else {
        return a.wallet_balance - b.wallet_balance;
      }
    } else {
      if (sortOrderlyAccount === undefined || sortOrderlyAccount === 'desc') {
        return b.holding - a.holding;
      } else {
        return a.holding - b.holding;
      }
    }
  };

  const filterFunc = (token: any) => {
    const id = token.id.toLowerCase();

    const name = token.name.toLowerCase();

    return (
      !searchValue ||
      id.includes(searchValue.toLowerCase()) ||
      name?.includes(searchValue.toLowerCase())
    );
  };

  const isMobile = useClientMobile();

  if (!tokenInfo) return null;

  return (
    <Modal
      {...props}
      style={{
        content: isMobile
          ? {
              position: 'fixed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              top: 'none',
              bottom: '0px',
              left: '0px',
              transform: 'translate(-50%, -20px)',
              outline: 'none',
            }
          : {
              zIndex: 999,
            },
      }}
    >
      <div
        className={` ${
          isMobile
            ? 'rounded-t-2xl fixed w-screen bottom-0 left-0'
            : 'rounded-2xl gradientBorderWrapperNoShadowForOrderly border'
        }  lg:w-p400  lg:h-p560   bg-boxBorder text-sm text-primaryOrderly  `}
      >
        <div className=" py-6 text-primaryOrderly text-sm flex flex-col ">
          <div className="flex px-4 items-center pb-6 justify-between">
            <span className="text-white text-lg font-bold">Select Token</span>

            <span
              className={isMobile ? 'hidden' : 'cursor-pointer '}
              onClick={(e: any) => {
                onRequestClose && onRequestClose(e);
              }}
            >
              <IoClose size={20} />
            </span>
          </div>
          <div className="w-full px-4">
            <div className="w-full  mb-4 pl-2 py-3 flex items-center rounded-lg bg-black bg-opacity-20 border border-border4">
              <span className="mr-2">
                <FiSearch className={!!searchValue ? 'text-white' : ''} />
              </span>

              <input
                type="text"
                className="w-full"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                }}
                placeholder="Search token"
              ></input>
            </div>
          </div>

          <div className="grid px-3  grid-cols-3">
            <div className="justify-self-start">Assets</div>

            <div
              className="justify-self-center flex items-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (
                  sortNearBalance === 'asc' ||
                  sortNearBalance === undefined
                ) {
                  return;
                }

                setSortByBalance('wallet');
              }}
            >
              <NearIConSelectModal />

              <span className="ml-2">Wallet</span>

              <MdArrowDropDown
                size={22}
                className={`${
                  sortByBalance === 'wallet' && sortNearBalance === 'asc'
                    ? 'transform rotate-180 '
                    : ''
                } ${
                  sortByBalance === 'wallet' && sortNearBalance !== undefined
                    ? 'text-white'
                    : ''
                } cursor-pointer`}
              />
            </div>

            <div
              className="justify-self-end flex items-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (
                  sortOrderlyAccount === 'asc' ||
                  sortOrderlyAccount === undefined
                ) {
                  return;
                }

                setSortByBalance('orderly');
              }}
            >
              <OrderlyIconBalance></OrderlyIconBalance>
              <span className="ml-2 ">Available</span>

              <MdArrowDropDown
                size={22}
                className={`${
                  sortByBalance === 'orderly' && sortOrderlyAccount === 'asc'
                    ? 'transform rotate-180 '
                    : ''
                } cursor-pointer ${
                  sortByBalance === 'orderly' &&
                  sortOrderlyAccount !== undefined
                    ? 'text-white'
                    : ''
                }`}
              />
            </div>
          </div>

          <div
            className="h-full overflow-auto"
            style={{
              height: isMobile ? 'calc(48px * 6)' : '',
            }}
          >
            {balances
              .filter(filterFunc)
              .sort(sortingFunc)
              .map((b: any) => {
                return (
                  <div
                    className="grid grid-cols-3 p-3 px-3 hover:bg-white hover:bg-opacity-5 text-white cursor-pointer"
                    onClick={(e: any) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect(b.id);
                      onRequestClose && onRequestClose(e);
                    }}
                  >
                    <div className="flex items-center  justify-self-start">
                      <img
                        src={b.meta.icon}
                        alt=""
                        className="w-6 h-6 rounded-full flex-shrink-0"
                      />

                      <span className="ml-2 mr-1">
                        {tokenInfo.find((t: any) => t.token_account_id === b.id)
                          ?.token || ''}
                      </span>

                      {TokenLinks[b.name] ? (
                        <a
                          className="ml-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          href={TokenLinks[b.name]}
                          target="_blank"
                        >
                          <OutLinkIcon className="text-primaryOrderly hover:text-white cursor-pointer"></OutLinkIcon>
                        </a>
                      ) : null}
                    </div>

                    <div
                      className="flex items-center justify-self-end relative right-6"
                      title={b.wallet_balance.toString()}
                    >
                      {digitWrapperAsset(b.wallet_balance.toString(), 2)}
                    </div>

                    <div
                      className="justify-self-end flex relative right-4 items-center"
                      title={b.holding.toString()}
                    >
                      {digitWrapperAsset(b.holding.toString(), 2)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ConfirmOrderModal(
  props: Modal.Props & {
    symbolFrom: string;
    symbolTo: string;
    side: 'Buy' | 'Sell';
    quantity: string;
    price: string;
    fee: '-' | number;
    totalCost: number | '-';
    onClick: () => Promise<any>;
    userInfo: ClientInfo;
  }
) {
  const {
    onRequestClose,
    symbolFrom,
    symbolTo,
    side,
    quantity,
    price,
    fee,
    totalCost,
    onClick,
    userInfo,
  } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const isMobile = useClientMobile();

  return (
    <Modal
      {...props}
      style={{
        content: {
          zIndex: 999,
        },
      }}
    >
      <div
        className={` rounded-2xl lg:w-96 xs:w-95vw ${
          isMobile ? '' : ' border border-gradientFrom border-opacity-30'
        }  bg-boxBorder text-sm text-primaryOrderly  `}
      >
        <div className="px-5 py-6 flex flex-col ">
          <div className="flex items-center pb-6 justify-between">
            <span className="text-white text-lg font-bold">Confirm Order</span>

            <span
              className="cursor-pointer "
              onClick={(e: any) => {
                onRequestClose && onRequestClose(e);
              }}
            >
              <IoClose size={20} />
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span>Limit Order</span>

            <span className="flex">
              <TextWrapper
                textC={side === 'Buy' ? 'text-buyGreen' : 'text-sellColorNew'}
                bg={side === 'Buy' ? 'bg-buyGreen' : 'bg-sellRed'}
                value={side}
              ></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span>Qty.</span>

            <span className="flex items-center">
              <span className="text-white mr-2">
                {digitWrapper(quantity, 3)}
              </span>

              <TextWrapper
                textC="text-primaryText"
                className="text-xs py-0 px-1"
                value={symbolFrom}
              ></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span>Price</span>

            <span className="flex items-center">
              <span className="text-white mr-2">{digitWrapper(price, 3)}</span>
              <TextWrapper
                textC="text-primaryText"
                className="text-xs py-0 px-1"
                value={`${symbolTo}/${symbolFrom}`}
              ></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span className="">Total</span>

            <span className="flex items-center">
              <span className=" mr-2 text-white">
                {totalCost === '-'
                  ? '-'
                  : digitWrapper(totalCost.toString(), 3)}
              </span>
              <TextWrapper
                textC="text-primaryText"
                value={`${symbolTo}`}
                className="text-xs py-0 px-1"
              ></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span className="">Fees</span>

            <FlexRow className="">
              <span className="flex items-center mr-3">
                <span className=" mr-2 text-white">
                  {Number((userInfo?.taker_fee_rate || 0) / 100).toFixed(2)}%
                </span>
                <TextWrapper
                  textC="text-primaryText"
                  value={`Taker`}
                  className="text-xs py-0 px-1"
                ></TextWrapper>
              </span>

              <span className="flex items-center">
                <span className=" mr-2 text-white">
                  {Number((userInfo?.maker_fee_rate || 0) / 100).toFixed(2)}%
                </span>
                <TextWrapper
                  textC="text-primaryText"
                  value={`Maker`}
                  className="text-xs py-0 px-1"
                ></TextWrapper>
              </span>
            </FlexRow>
          </div>

          <button
            className={`rounded-lg ${
              loading
                ? 'opacity-70 cursor-not-allowed bg-buttonGradientBgOpacity'
                : ''
            } flex items-center justify-center py-3 bg-buttonGradientBg hover:bg-buttonGradientBgOpacity text-base text-white font-bold`}
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();

              setLoading(true);
              onClick().then(() => {
                setLoading(false);
                onRequestClose && onRequestClose(e);
              });
            }}
            disabled={loading}
          >
            <ButtonTextWrapper
              loading={loading}
              Text={() => {
                return <span>Confirm</span>;
              }}
            />
          </button>
        </div>
      </div>
    </Modal>
  );
}
