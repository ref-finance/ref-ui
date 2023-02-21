import React, { useState, useEffect, useRef, useDebugValue } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { parseSymbol } from '../RecentTrade/index';
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
  registerOrderly,
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
import { digitWrapper } from '../../utiles';

import { useHistory } from 'react-router-dom';

import { FiSearch } from 'react-icons/fi';
import {
  NearIConSelectModal,
  OrderlyNetworkIcon,
  OutLinkIcon,
  PowerByOrderly,
  RefToOrderly,
  Agree,
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

function UserBoardFoot() {
  return (
    <div className="flex items-center right-6 justify-center  absolute opacity-60 bottom-6 text-13px">
      <span className="text-white  ">Powered by</span>

      <div className="mx-2">
        <OrderlyNetworkIcon></OrderlyNetworkIcon>
      </div>

      <span className="text-white ">Risk</span>
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
}: {
  value: string;
  bg?: string;
  textC?: string;
  className?: string;
}) {
  return (
    <span
      className={`${className} px-1.5  py-0.5 rounded-md ${
        bg || 'bg-primaryOrderly '
      } bg-opacity-10 ${textC || 'text-white'} `}
    >
      {value}
    </span>
  );
}

const REF_ORDERLY_AGREE_CHECK = 'REF_ORDERLY_AGREE_CHECK';

export default function UserBoard() {
  const {
    symbol,
    orders,
    tokenInfo,
    storageEnough,
    marketTrade,
    markPrices,
    balances,
    setValidAccountSig,
    handlePendingOrderRefreshing,
    validAccountSig,
    myPendingOrdersRefreshing,
  } = useOrderlyContext();

  const { accountId, modal, selector } = useWalletSelector();

  const [showLimitAdvance, setShowLimitAdvance] = useState<boolean>(false);

  const [advanceLimitMode, setAdvanceLimitMode] = useState<
    'IOC' | 'FOK' | 'POST_ONLY'
  >();

  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');

  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Limit');

  const [holdings, setHoldings] = useState<Holding[]>();

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

  const tokenOut = useTokenMetaFromSymbol(symbolTo, tokenInfo);

  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');

  const [inputValue, setInputValue] = useState<string>('1');

  const [limitPrice, setLimitPrice] = useState<string>(
    marketTrade ? marketTrade?.price?.toString() || '' : ''
  );

  const [userInfo, setUserInfo] = useState<ClientInfo>();

  const [showAllAssets, setShowAllAssets] = useState<boolean>(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const [agreeCheck, setAgreeCheck] = useState<boolean>(
    !!localStorage.getItem(REF_ORDERLY_AGREE_CHECK) || false
  );

  const handleSignOut = async () => {
    const wallet = await selector.wallet();
    return wallet.signOut();
  };

  const submitDisable =
    !inputValue ||
    Number(inputValue) === 0 ||
    (orderType === 'Limit' && Number(limitPrice) <= 0) ||
    !userInfo;

  const inputLimitPriceRef = useRef<HTMLInputElement>(null);

  const inputAmountRef = useRef<HTMLInputElement>(null);

  const tokenFromBalance = useTokenBalance(tokenIn?.id);

  const tokenToBalance = useTokenBalance(tokenOut?.id);

  useEffect(() => {
    console.log('accountId: ', accountId);
    if (!accountId) return;

    getAccountInformation({ accountId }).then((res) => {
      setUserInfo(res);
    });

    getCurrentHolding({ accountId }).then((res) => {
      setHoldings(res.data.holding);
    });
  }, [accountId, myPendingOrdersRefreshing]);

  const curHoldingIn = holdings?.find((h) => h.token === symbolFrom);

  const curHoldingOut = holdings?.find((h) => h.token === symbolTo);

  const tokenInHolding =
    (curHoldingIn && curHoldingIn.holding + curHoldingIn.pending_short) ||
    (balances && balances[symbolFrom]?.holding);
  const tokenOutHolding =
    (curHoldingOut && curHoldingOut.holding + curHoldingOut.pending_short) ||
    (balances && balances[symbolTo]?.holding);

  const markPriceSymbol =
    markPrices && markPrices.find((m) => m.symbol === symbol);

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
        : Number(inputValue || 0) * Number(limitPrice || 0) - Number(fee)
      : !orders || !userInfo || fee === '-' || !marketPrice
      ? '-'
      : Number(inputValue || 0) * Number(marketPrice || 0) - Number(fee);

  const handleSubmit = () => {
    if (!accountId) return;
    if (orderType === 'Market') {
      createOrder({
        accountId,
        orderlyProps: {
          side: side === 'Buy' ? 'BUY' : 'SELL',
          symbol: symbol,
          order_type: 'MARKET',
          order_quantity: inputValue,
          broker_id: 'ref_dex',
        },
      }).then(async (res) => {
        if (res.success === false) return;

        handlePendingOrderRefreshing();

        return orderPopUp({
          orderType: 'Market',
          symbolName: symbol,
          side: side,
          size: inputValue,
          tokenIn: tokenIn,
          price: marketPrice.toString() || '',
          timeStamp: res.timestamp,
        });
      });
    } else if (orderType === 'Limit') {
      createOrder({
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
      }).then((res) => {
        if (res.success === false) return;

        handlePendingOrderRefreshing();

        return orderPopUp({
          orderType: 'Limit',
          symbolName: symbol,
          side: side,
          size: inputValue,
          tokenIn: tokenIn,
          price: limitPrice || '',
          timeStamp: res.timestamp,
        });
      });
    }
  };

  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);

  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);

  useEffect(() => {
    if (!accountId || !storageEnough || !agreeCheck) return;
    is_orderly_key_announced(accountId)
      .then(async (key_announce) => {
        setKeyAnnounced(key_announce);
        if (!key_announce) {
          await announceKey(accountId).then((res) => {
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
      });
  }, [accountId, storageEnough, agreeCheck]);

  useEffect(() => {
    if (!tradingKeySet || !keyAnnounced) return;
    handlePendingOrderRefreshing();

    setValidAccountSig(true);
  }, [tradingKeySet, keyAnnounced]);

  const isInsufficientBalance =
    side === 'Buy'
      ? new Big(total === '-' ? '0' : total).gt(tokenOutHolding || '0') ||
        new Big(tokenOutHolding || 0).eq(0)
      : new Big(inputValue || '0').gt(tokenInHolding || '0');

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
        height: 'calc(100vh - 100px)',
      }}
    >
      {/* not signed in wrapper */}
      {validator && (
        <div
          className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
          style={{
            background: 'rgba(0, 19, 32, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 90,
          }}
        >
          <RefToOrderly></RefToOrderly>
          {!!accountId &&
            validContract() &&
            (!storageEnough || !tradingKeySet || !keyAnnounced) && (
              <div className="text-white mb-4 px-8 text-sm text-start">
                <div>
                  This orderbook page is a graphical user interface of Orderly
                  Network, that allows users to trade on the convenience of its
                  infrastructures. You are creating an Orderly account now.
                  <br />
                  Learn more about Orderly Network
                </div>
                <div className="flex items-center mt-2">
                  <div
                    className="mr-2 cursor-pointer"
                    onClick={() => {
                      if (!agreeCheck) {
                        localStorage.setItem(REF_ORDERLY_AGREE_CHECK, 'true');
                      } else {
                        localStorage.removeItem(REF_ORDERLY_AGREE_CHECK);
                      }

                      setAgreeCheck(!agreeCheck);
                    }}
                  >
                    <Agree check={agreeCheck}></Agree>
                  </div>

                  <span>I agree</span>
                </div>
              </div>
            )}
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
                onClick={() => {
                  if (!accountId || storageEnough) return;
                  storageDeposit(accountId);
                }}
                check={agreeCheck}
                storageEnough={!!storageEnough}
                spin={
                  storageEnough &&
                  (!tradingKeySet || !keyAnnounced) &&
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
        <span className="col-span-2  justify-self-start">Asset</span>

        <span className="justify-self-start">Wallet</span>

        <span className="justify-self-end">Account</span>
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

        <div className="justify-self-start">
          {!!tokenFromBalance ? digitWrapper(tokenFromBalance, 2) : '-'}
        </div>

        <div className="flex items-center justify-self-end">
          <span>{tokenInHolding ? tokenInHolding.toFixed(2) : 0}</span>
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

        <div className="justify-self-start">
          {!!tokenToBalance ? digitWrapper(tokenToBalance, 2) : ''}
        </div>

        <div className="flex items-center justify-self-end">
          <span>{tokenOutHolding ? tokenOutHolding.toFixed(2) : 0}</span>
        </div>
      </div>

      <div className="inline-flex text-primaryOrderly justify-end border-b border-white border-opacity-10 mt-3">
        <span
          className="text-sm py-1.5  mb-3 px-3 rounded-lg bg-symbolHover cursor-pointer"
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
        <span className="text-sm text-primaryOrderly">Order Type</span>

        <div className="flex items-center">
          <button
            className={`flex px-4 py-2 mr-2 rounded-lg items-center justify-center ${
              orderType === 'Limit' ? 'bg-buyGradientGreen' : 'bg-orderTypeBg'
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
              orderType === 'Market' ? 'bg-buyGradientGreen' : 'bg-orderTypeBg'
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
      <div className="w-full text-primaryOrderly mt-6 bg-black text-sm bg-opacity-10 rounded-xl border border-boxBorder p-3">
        <div className="mb-2 text-left">
          {side === 'Buy' ? 'Size(Amount to buy)' : 'Size(Amount to sell)'}
        </div>

        <div className="flex items-center mt-2">
          <input
            autoFocus
            inputMode="decimal"
            ref={inputAmountRef}
            onWheel={(e) =>
              inputAmountRef.current ? inputAmountRef.current.blur() : null
            }
            className="text-white text-xl w-full"
            value={inputValue}
            type="number"
            step="any"
            min={0}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
          />

          <span className="">{symbolFrom}</span>
        </div>
      </div>

      {orderType === 'Limit' && (
        <div className="w-full text-primaryOrderly mt-3 text-sm bg-black bg-opacity-10 rounded-xl border border-boxBorder p-3">
          <div className="flex items-center justify-between">
            <span>{side === 'Buy' ? 'Buy Price' : 'Sell Price'}</span>

            <span>{symbolTo}</span>
          </div>

          <div className="flex items-center mt-3">
            <span
              className="cursor-pointer"
              onClick={() => {
                setLimitPrice(
                  Number(limitPrice) >= 1
                    ? (Number(limitPrice) - 1).toString()
                    : limitPrice
                );
              }}
            >
              <FaMinus></FaMinus>
            </span>
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
              className="text-white text-center text-xl w-full"
              value={limitPrice}
              onChange={(e) => {
                setLimitPrice(e.target.value);
              }}
              inputMode="decimal"
              onKeyDown={(e) =>
                symbolsArr.includes(e.key) && e.preventDefault()
              }
            />
            <span
              className="cursor-pointer"
              onClick={() => {
                setLimitPrice((Number(limitPrice) + 1).toString());
              }}
            >
              <FaPlus></FaPlus>
            </span>
          </div>
        </div>
      )}
      {orderType === 'Market' && (
        <div className="w-full rounded-xl border border-boxBorder p-3 mt-3 text-sm flex items-center justify-between">
          <span className="text-primaryOrderly">
            {side === 'Buy' ? 'Buy Price' : 'Sell Price'}
          </span>

          <span className="text-white">Market price</span>
        </div>
      )}

      {/* limit order advance mode */}

      {orderType === 'Limit' && (
        <div className="text-white text-sm mt-2">
          <div className="flex items-center justify-between">
            <span className="text-primaryOrderly">Advance</span>

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
                className="mx-2 cursor-pointer"
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
                className="cursor-pointer mx-2"
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
                className="mx-2 cursor-pointer"
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

      <div className="mt-6 bg-feeColor rounded-lg text-sm px-2 pt-3 relative z-10 pb-6">
        <div className="flex items-center justify-between">
          <span className="text-primaryOrderly">Fee </span>
          <span className="text-white">
            {fee !== '-' ? '~' : ''} {fee === '-' ? '-' : fee.toFixed(3)}{' '}
            {` ${symbolTo}`}
          </span>
        </div>

        <div className="flex items-center mt-2 justify-between">
          <span className="text-primaryOrderly">Total </span>
          <span className="text-white">
            {total === '-' ? '-' : total.toFixed(4)} {` ${symbolTo}`}
          </span>
        </div>
      </div>

      <button
        className={`rounded-lg ${
          isInsufficientBalance
            ? 'bg-borderC'
            : side === 'Buy'
            ? 'bg-buyGradientGreen'
            : 'bg-sellGradientRed'
        } ${
          isInsufficientBalance
            ? 'text-primaryOrderly cursor-not-allowed'
            : 'text-white'
        }  py-2.5 relative bottom-3  flex z-20 items-center justify-center text-base ${
          submitDisable ? 'opacity-60 cursor-not-allowed' : ''
        } `}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // handleSubmit();
          setConfirmModalOpen(true);
        }}
        disabled={submitDisable || isInsufficientBalance}
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
        onClick={(amount: string) => {
          if (!operationId) return;
          return depositOrderly(operationId, amount);
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
        onClick={(amount: string) => {
          if (!operationId) return;
          return withdrawOrderly(operationId, amount);
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
        price={orderType === 'Limit' ? limitPrice : marketPrice.toString()}
        fee={fee}
        totalCost={total}
        onClick={handleSubmit}
      ></ConfirmOrderModal>
    </div>
  );
}

export function AssetManagerModal(
  props: Modal.Props & {
    type: 'deposit' | 'withdraw' | undefined;
    onClick: (amount: string) => void;
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
  } = props;

  const [tokenId, setTokenId] = useState<string | undefined>(tokenIdProp);

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
    tokenInfo
  );

  const walletBalance =
    balances?.find((b: any) => b.id.toLowerCase() === tokenId.toLowerCase())
      ?.wallet_balance ||
    walletBalanceProp ||
    '0';

  const displayAccountBalance =
    balances
      ?.find((b: any) => b.id.toLowerCase() === tokenId.toLowerCase())
      ?.holding?.toString() ||
    accountBalance ||
    '0';

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

  const setAmountByShareFromBar = (sharePercent: string) => {
    setPercentage(sharePercent);

    const sharePercentOfValue = percentOfBigNumber(
      Number(sharePercent),
      type === 'deposit' ? walletBalance : displayAccountBalance.toString(),
      tokenMeta.decimals
    );

    setInputValue(sharePercentOfValue);
  };

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
        tokenId === 'near' &&
        new Big(walletBalance || 0)
          .minus(new Big(inputValue || '0'))
          .lt(0.25) &&
        walletBalance !== ''
      ) {
        return false;
      }

      if (
        tokenId !== 'near' &&
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
      <Modal {...props}>
        <div className=" rounded-2xl lg:w-96 xs:w-95vw gradientBorderWrapperNoShadow bg-boxBorder text-sm text-primaryOrderly border ">
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
                className="cursor-pointer "
                onClick={(e: any) => {
                  onRequestClose && onRequestClose(e);
                }}
              >
                <IoClose size={20} />
              </span>
            </div>

            <div className="flex items-center pb-3 justify-between">
              <span>Wallet Balance</span>

              <span>
                {!walletBalance
                  ? '-'
                  : toPrecision(walletBalance.toString() || '0', 3)}
              </span>
            </div>

            <div className="flex items-center pb-4 justify-between">
              <span>Account Balance</span>

              <span>{digitWrapper(displayAccountBalance.toString(), 3)}</span>
            </div>

            <div className="flex mb-5 items-center border border-border2 w-full bg-black bg-opacity-10 rounded-2xl px-3 py-3">
              <input
                inputMode="decimal"
                ref={ref}
                onWheel={(e) => (ref.current ? ref.current.blur() : null)}
                className="text-white text-xl w-full"
                value={inputValue}
                type="number"
                step="any"
                min={0}
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
                            ? walletBalance.toString()
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
                  {Math.floor(Number(percentage))}%
                </div>
              </div>
            </div>
            {type === 'deposit' && !validation() && (
              <div className="text-warn mb-2">
                0.25 NEAR locked in wallet for covering transaction fee
              </div>
            )}

            <button
              className={`flex ${
                !validation() ? 'opacity-70 cursor-not-allowed' : ''
              } items-center justify-center  font-bold text-base text-white py-2.5 rounded-lg ${
                type === 'deposit' ? 'bg-primaryGradient' : 'bg-withdrawPurple'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!inputValue) return;
                onClick(inputValue);
              }}
              disabled={!validation()}
            >
              {type === 'deposit'
                ? 'Deposit'
                : type === 'withdraw'
                ? 'Withdraw'
                : ''}
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
      />
    </>
  );
}

function SelectTokenModal(
  props: Modal.Props & {
    onSelect: (tokenId: string) => void;
    tokenInfo: TokenInfo[] | undefined;
    balances: any;
  }
) {
  const { onRequestClose, onSelect, tokenInfo, balances } = props;

  const [sortOrderlyAccount, setSortOrderlyAccount] = useState<
    'asc' | 'desc'
  >();

  const [sortNearBalance, setSortNearBalance] = useState<'asc' | 'desc'>(
    'desc'
  );

  const [searchValue, setSearchValue] = useState<string>('');

  const [sortByBalance, setSortByBalance] = useState<'wallet' | 'orderly'>();

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

  if (!tokenInfo) return null;

  return (
    <Modal {...props}>
      <div className=" rounded-2xl lg:w-96 xs:w-95vw xs:h-vh90 lg:h-p560  gradientBorderWrapperNoShadow bg-boxBorder text-sm text-primaryOrderly border ">
        <div className=" py-6 text-primaryOrderly text-sm flex flex-col ">
          <div className="flex px-5 items-center pb-6 justify-between">
            <span className="text-white text-lg font-bold">Select Token</span>

            <span
              className="cursor-pointer "
              onClick={(e: any) => {
                onRequestClose && onRequestClose(e);
              }}
            >
              <IoClose size={20} />
            </span>
          </div>
          <div className="w-full px-5">
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

          <div className="grid px-5  grid-cols-3">
            <div className="justify-self-start">Asset</div>

            <div
              className="justify-self-center flex items-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (
                  sortNearBalance === 'asc' ||
                  sortNearBalance === undefined
                ) {
                  setSortNearBalance('desc');
                } else {
                  setSortNearBalance('asc');
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
                  setSortOrderlyAccount('desc');
                } else {
                  setSortOrderlyAccount('asc');
                }

                setSortByBalance('orderly');
              }}
            >
              <span className="ml-2 ">Account</span>

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

          <div className="h-full overflow-auto">
            {balances
              .filter(filterFunc)
              .sort(sortingFunc)
              .map((b: any) => {
                return (
                  <div
                    className="grid grid-cols-3 p-3 px-5 hover:bg-white hover:bg-opacity-5 text-white cursor-pointer"
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
                        className="w-6 h-6 rounded-full"
                      />

                      <span className="ml-2 mr-3">
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
                        >
                          <OutLinkIcon className="text-primaryOrderly hover:text-white cursor-pointer"></OutLinkIcon>
                        </a>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-self-end relative right-6">
                      {digitWrapper(b.wallet_balance.toString(), 2)}
                    </div>

                    <div className="justify-self-end flex relative right-4 items-center">
                      {digitWrapper(b.holding.toString(), 2)}
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
    onClick: () => void;
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
  } = props;

  return (
    <Modal {...props}>
      <div className=" rounded-2xl lg:w-80 xs:w-95vw gradientBorderWrapperNoShadow bg-boxBorder text-sm text-primaryOrderly border ">
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
                textC={side === 'Buy' ? 'text-buyGreen' : 'text-sellRed'}
                bg={side === 'Buy' ? 'bg-buyGreen' : 'bg-sellRed'}
                value={side}
              ></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span>Qty.</span>

            <span className="flex items-center">
              <span className="text-white mr-2">{quantity}</span>

              <TextWrapper value={symbolFrom}></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span>Price</span>

            <span className="flex items-center">
              <span className="text-white mr-2">{price}</span>
              <TextWrapper value={`${symbolTo}/${symbolFrom}`}></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span>Fee</span>

            <span className="flex items-center">
              <span className="text-white mr-2">
                {fee === '-' ? '-' : digitWrapper(fee.toString(), 3)}
              </span>
              <TextWrapper value={`${symbolTo}`}></TextWrapper>
            </span>
          </div>

          <div className="flex items-center mb-5 justify-between">
            <span className="">Total cost</span>

            <span className="flex ">
              <span className="text-white mr-2">
                {totalCost === '-'
                  ? '-'
                  : digitWrapper(totalCost.toString(), 3)}
              </span>
              <TextWrapper value={`${symbolTo}`}></TextWrapper>
            </span>
          </div>

          <button
            className="rounded-lg flex items-center justify-center py-3 bg-greenPurpleGradient text-base text-white font-bold"
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              onClick();
              onRequestClose && onRequestClose(e);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}
