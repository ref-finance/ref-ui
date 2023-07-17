import { NearIConSelectModal, OrderlyIconBalance } from '../Common/Icons';
import { BsArrowRight, BsWrenchAdjustableCircleFill } from 'react-icons/bs';

import {
  digitWrapper,
  digitWrapperAsset,
  numberWithCommas,
  numberWithCommasPadding,
} from '../../utiles';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { useTokenBalance } from '../UserBoard/state';
import {
  DepositButton,
  DepositButtonMobile,
  WithdrawButton,
  WithdrawButtonMobile,
} from '../Common/index';
import {
  AssetManagerModal,
  REF_ORDERLY_ACCOUNT_VALID,
  REF_ORDERLY_AGREE_CHECK,
  UserBoardMobileSpot,
} from '../UserBoard/index';
import { ChartContainer } from '../TVChartContainer';
import OrderBook, { OrderBookShrink } from '../OrderBook';
import { OrderlyLoading } from '../Common/Icons';

import React, {
  useState,
  useEffect,
  useRef,
  useDebugValue,
  useMemo,
} from 'react';
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
import { HiDownload } from 'react-icons/hi';
import {
  announceKey,
  depositFT,
  depositOrderly,
  perpSettlementTx,
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
import { CheckBox, ConnectWallet, ErrorTip, RegisterButton } from '../Common';

import { ConfirmButton, QuestionMark } from '../Common/index';

import { FiSearch } from 'react-icons/fi';
import {
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
import { AssetModal } from '../AssetModal';
import ReactTooltip from 'react-tooltip';
import { ButtonTextWrapper } from '~components/button/Button';
import { useAllSymbolInfo } from '../AllOrders/state';
import { ONLY_ZEROS } from '../../../../utils/numbers';
import * as math from 'mathjs';
import { NearWalletIcon } from '../Common/Icons';
import { getSelectedWalletId } from '../../orderly/utils';
import { BuyButton, SellButton } from '../UserBoard/Button';
import AllOrderBoard from '../AllOrders';
import { isMobile } from '../../../../utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
import { PerpOrderlyTipMobile } from '../PerpHeader';
import { TextWrapper, UserBoardMobilePerp } from '../UserBoardPerp';
import moment from 'moment';
import {
  getFreeCollateral,
  getMarginRatio,
  getRiskLevel,
  getTotalCollateral,
  getTotaluPnl,
} from '../UserBoardPerp/math';
import { useLeverage } from '../../orderly/state';
import {
  MarginRatioText,
  TotaluPNLText,
  UnsettlePnl,
} from '../UserBoardPerp/components/HoverText';
import { usePerpData } from '../UserBoardPerp/state';
import { executeMultipleTransactions } from '../../../../services/near';

export const MOBILE_TAB = 'REF_ORDERLY_MOBILE_TAB';

export const MOBILE_DISPLAY = 'REF_ORDERLY_MOBILE_DISPLAY';

export function MobileChartBoard({ maintenance }: { maintenance: boolean }) {
  return (
    <div className="h-full ">
      <ChartContainer maintenance={maintenance} />
    </div>
  );
}

export function CurAsset(props?: any) {
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
    symbolType,
  } = useOrderlyContext();
  const [holdings, setHoldings] = useState<Holding[]>();

  const { accountId } = useWalletSelector();

  const [tab, setTab] = useState<'account' | 'balance'>(
    symbolType === 'SPOT' ? 'balance' : 'account'
  );

  useEffect(() => {
    if (!accountId) return;

    getCurrentHolding({ accountId }).then((res) => {
      setHoldings(res.data.holding);
    });
  }, [accountId, myPendingOrdersRefreshing, validAccountSig]);

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const curHoldingIn = holdings?.find((h) => h.token === symbolFrom);

  const curHoldingOut = holdings?.find((h) => h.token === symbolTo);
  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();

  const tokenInHolding = curHoldingIn
    ? curHoldingIn.holding + curHoldingIn.pending_short
    : balances && balances[symbolFrom]?.holding;

  const { freeCollateral } = usePerpData();

  const tokenOutHolding =
    symbolTo === 'USDC' && freeCollateral !== '-'
      ? freeCollateral
      : curHoldingOut
      ? curHoldingOut.holding + curHoldingOut.pending_short
      : balances && balances[symbolTo]?.holding;

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

  const tokenOut = useTokenMetaFromSymbol(symbolTo, tokenInfo);

  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');
  const [showAllAssets, setShowAllAssets] = useState<boolean>(false);

  const tokenFromBalance = useTokenBalance(
    tokenIn?.id,
    JSON.stringify(balances)
  );

  const tokenToBalance = useTokenBalance(
    tokenOut?.id,
    JSON.stringify(balances)
  );

  const allHoldings =
    holdings &&
    holdings.reduce((acc, cur, i) => {
      return acc + cur.holding + cur.pending_short;
    }, 0);
  const intl = useIntl();
  const valid = !!accountId && (holdings === undefined || allHoldings > 0);

  return (
    <div className="pb-3">
      {symbolType === 'PERP' && (
        <div className="frcs text-sm my-3 border border-v3SwapGray border-opacity-20 rounded-xl p-1 text-primaryText">
          <div
            className={`w-1/2 rounded-md py-0.5 frcc ${
              tab === 'account' ? 'text-white bg-mobileOrderBg' : ''
            }`}
            onClick={() => {
              setTab('account');
            }}
          >
            <FormattedMessage
              id="account"
              defaultMessage={'Account'}
            ></FormattedMessage>
          </div>

          <div
            className={`w-1/2 py-0.5 rounded-md frcc ${
              tab === 'balance' ? 'text-white bg-mobileOrderBg' : ''
            }`}
            onClick={() => {
              setTab('balance');
            }}
          >
            <FormattedMessage
              id="balances"
              defaultMessage={'Balances'}
            ></FormattedMessage>
          </div>
        </div>
      )}

      {tab === 'account' && symbolType === 'PERP' && (
        <PerpAccountBoard></PerpAccountBoard>
      )}

      {(!accountId || !validAccountSig) && tab == 'balance' && (
        <div
          style={{
            minHeight: '35vh',
          }}
          className="flex flex-col text-center items-center justify-center text-primaryText"
        >
          <FormattedMessage id={'welcome'} defaultMessage={'Welcome'} />!
          <br />
          <FormattedMessage
            id={'welcome_mobile'}
            defaultMessage={'Connect your wallet to start'}
          />
        </div>
      )}

      {!!accountId &&
        holdings &&
        allHoldings === 0 &&
        validAccountSig &&
        tab == 'balance' && (
          <div
            style={{
              minHeight: '35vh',
            }}
            className="flex flex-col items-center justify-center text-primaryText"
          >
            <span className="text-center">
              <FormattedMessage
                id={'deposit_assets_to_begin_your_trading_journey'}
                defaultMessage={
                  'Deposit assets to begin your {br} trading journey.'
                }
                values={{ br: <br /> }}
              ></FormattedMessage>
            </span>

            <button
              className="flex items-center justify-center py-2 mt-2 px-8 text-white bg-primaryGradient rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOperationType('deposit');
                setOperationId(tokenOut?.id || '');
              }}
            >
              <span className="mr-2">
                {intl.formatMessage({
                  id: 'deposit',
                  defaultMessage: 'Deposit',
                })}
              </span>

              <HiDownload />
            </button>
          </div>
        )}
      {valid && validAccountSig && holdings && tab == 'balance' && (
        <div className="w-full flex flex-col pt-5 px-2 pb-3">
          <div className="grid grid-cols-4 text-sm text-primaryOrderly mb-2">
            <span className="col-span-2  justify-self-start">
              {intl.formatMessage({
                id: 'assets',
                defaultMessage: 'Assets',
              })}
            </span>

            <span className="justify-self-end flex items-center relative right-10">
              {' '}
              <NearIConSelectModal />{' '}
              <span className="ml-2">
                {intl.formatMessage({
                  id: 'wallet_up',
                  defaultMessage: 'Wallet',
                })}
              </span>{' '}
            </span>

            <span className="justify-self-end flex items-center">
              <OrderlyIconBalance></OrderlyIconBalance>
              <span className="ml-2">
                {intl.formatMessage({
                  id: 'available_orderly',
                  defaultMessage: 'Available',
                })}
              </span>{' '}
            </span>
          </div>

          <div className="grid grid-cols-4 items-center mb-5 text-white text-sm justify-between">
            <div className="flex items-center justify-self-start col-span-2">
              <img
                src={tokenIn?.icon}
                alt=""
                className="rounded-full w-6 h-6 mr-2"
              />
              <span>{symbolFrom === 'BTC' ? 'WBTC' : symbolFrom}</span>
            </div>

            <div className="justify-self-end relative right-10">
              {!!tokenFromBalance
                ? digitWrapperAsset(tokenFromBalance, 2)
                : '-'}
            </div>

            <div className="flex items-center justify-self-end">
              <span>
                {tokenInHolding
                  ? digitWrapperAsset(tokenInHolding.toString(), 2)
                  : 0}
              </span>
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

            <div className="justify-self-end relative right-10">
              {!!tokenToBalance ? digitWrapperAsset(tokenToBalance, 2) : ''}
            </div>

            <div className="flex items-center justify-self-end">
              <span>
                {tokenOutHolding
                  ? digitWrapperAsset(tokenOutHolding.toString(), 2)
                  : 0}
              </span>
            </div>
          </div>

          <div className="text-sm text-white font-bold pt-4 text-left frcb">
            <div
              className={`flex items-center w-full ${
                symbolType == 'PERP' ? 'justify-between' : ''
              }`}
            >
              {symbolType == 'PERP' && (
                <>
                  <DepositButtonMobile
                    onClick={() => {
                      setOperationType('deposit');
                      setOperationId(tokenIn?.id || '');
                    }}
                  ></DepositButtonMobile>

                  <WithdrawButtonMobile
                    onClick={() => {
                      setOperationType('withdraw');
                      setOperationId(tokenIn?.id || '');
                    }}
                  ></WithdrawButtonMobile>
                </>
              )}

              {symbolType === 'SPOT' && (
                <>
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
                </>
              )}
            </div>

            <span
              className={
                symbolType === 'PERP'
                  ? 'hidden'
                  : 'text-base font-normal whitespace-nowrap text-gradientFromHover '
              }
              onClick={() => {
                setShowAllAssets(true);
              }}
            >
              {intl.formatMessage({
                id: 'see_all',
                defaultMessage: 'See all',
              })}
            </span>
          </div>
        </div>
      )}

      {tab == 'balance' && (
        <>
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
          {showAllAssets && (
            <AssetModal
              isOpen={showAllAssets}
              onRequestClose={() => {
                setShowAllAssets(false);
              }}
            ></AssetModal>
          )}
        </>
      )}
    </div>
  );
}

export function PerpAccountBoard() {
  const { positions } = useOrderlyContext();

  const { userInfo } = useLeverage();

  const {
    marginRatio,
    totalCollateral,
    freeCollateral,
    totaluPnl,
    unsettle,
    mmr,
  } = usePerpData();

  const intl = useIntl();

  const riskLevel =
    marginRatio === '-'
      ? null
      : getRiskLevel(Number(marginRatio), userInfo?.max_leverage || 10);

  return (
    <div className="flex flex-col text-primaryText gap-2 px-2 text-13px">
      <div className="frcb">
        <FormattedMessage
          id="max_account_leverage"
          defaultMessage={`Max Account Leverage `}
        ></FormattedMessage>

        <span className="font-nunito text-white">
          {!userInfo ? '-' : userInfo.max_leverage + 'x'}
        </span>
      </div>
      <div className="frcb">
        <FormattedMessage
          id="total_collateral"
          defaultMessage={`Total Collateral`}
        ></FormattedMessage>

        <span className="font-nunito text-white">
          {!positions || totalCollateral === '-'
            ? '-'
            : numberWithCommas(totalCollateral)}
        </span>
      </div>

      <div className="frcb">
        <FormattedMessage
          id="free_collateral"
          defaultMessage={`Free Collateral`}
        />

        <span className="font-nunito text-white">
          {!positions ? '-' : numberWithCommas(freeCollateral)}
        </span>
      </div>

      <div className="frcb">
        <TotaluPNLText></TotaluPNLText>

        <span className="font-nunito text-white">{totaluPnl}</span>
      </div>

      <div className="frcb">
        <MarginRatioText></MarginRatioText>

        <div className="frcs gap-2 text-white">
          {!riskLevel ? (
            '-'
          ) : (
            <TextWrapper
              value={intl.formatMessage({
                id: riskLevel,
                defaultMessage: riskLevel,
              })}
              className="text-xs px-1.5"
              textC={
                riskLevel === 'low_risk'
                  ? 'text-buyGreen'
                  : riskLevel === 'high_risk'
                  ? 'text-sellRed'
                  : 'text-warn'
              }
            ></TextWrapper>
          )}

          <span
            className={`font-nunito
        
            ${
              riskLevel === 'low_risk'
                ? 'text-buyGreen'
                : riskLevel === 'high_risk'
                ? 'text-sellRed'
                : 'text-warn'
            }
        `}
          >
            {!positions || marginRatio == '-'
              ? '-'
              : numberWithCommas(
                  new Big(Number(marginRatio) * 100).toFixed(2)
                ) + '%'}
          </span>
        </div>
      </div>

      <div className="frcb">
        <UnsettlePnl></UnsettlePnl>

        <div className="font-nunito frcs gap-2">
          {Number(unsettle) < 0.01 && Number(unsettle) > 0
            ? '< 0.01'
            : numberWithCommas(toPrecision(unsettle, 2))}

          <button
            className={`font-gotham text-white px-1 text-xs rounded-md border border-inputV3BorderColor ${
              ONLY_ZEROS.test(unsettle) ? 'cursor-not-allowed' : ''
            } `}
            onClick={async () => {
              if (ONLY_ZEROS.test(unsettle)) {
                return;
              }

              return executeMultipleTransactions([await perpSettlementTx()]);
            }}
          >
            <FormattedMessage
              id="settle"
              defaultMessage={'Settle'}
            ></FormattedMessage>
          </button>
        </div>
      </div>

      <div className="frcb">
        <FormattedMessage
          id="maintenance_margin_ratio"
          defaultMessage={'Maintenance Margin Ratio'}
        />

        <span className="font-nunito">{mmr}</span>
      </div>
    </div>
  );
}

function BookBoard({ maintenance }: { maintenance: boolean }) {
  const {
    symbol,
    setSymbol,
    tokenInfo,
    ticker,
    openinterests,
    estFundingRate,
    markPrices,
    symbolType,
  } = useOrderlyContext();
  const intl = useIntl();

  const [displayCountDown, setDisplayCountDown] = useState<string>();

  const interval = 1000;
  useEffect(() => {
    if (!estFundingRate?.fundingTs) return;

    const duration = moment.duration(estFundingRate.fundingTs - Date.now());

    const hours = duration.hours().toString().padStart(2, '0');
    const minutes = duration.minutes().toString().padStart(2, '0');
    const seconds = duration.seconds().toString().padStart(2, '0');
    if (duration.asSeconds() < 0) {
      setDisplayCountDown('00:00:00');
      return;
    }
    setDisplayCountDown(`${hours}:${minutes}:${seconds}`);

    const id = setInterval(() => {
      const duration = moment.duration(estFundingRate?.fundingTs - Date.now());

      const hours = duration.hours().toString().padStart(2, '0');
      const minutes = duration.minutes().toString().padStart(2, '0');
      const seconds = duration.seconds().toString().padStart(2, '0');
      if (duration.asSeconds() < 0) {
        setDisplayCountDown('00:00:00');
        return;
      }

      setDisplayCountDown(`${hours}:${minutes}:${seconds}`);
    }, interval);

    return () => clearInterval(id);
  }, [estFundingRate?.fundingTs?.toString()]);

  return (
    <div
      className=" flex-shrink-0 mr-4"
      style={{
        width: 'calc(40% - 20px)',
      }}
    >
      {symbolType === 'PERP' && (
        <div className="flex items-start  flex-col">
          <span className="text-primaryText whitespace-nowrap text-10px">
            {intl.formatMessage({
              id: 'pred_funding_rate',
              defaultMessage: 'Pred. Funding Rate',
            })}
          </span>

          <div className="frcs gap-1">
            <span className="text-white mt-0.5 font-bold">
              <span className="text-white mt-0.5 text-13px font-bold frcs gap-2 whitespace-nowrap">
                <span
                  style={{
                    color: estFundingRate?.fundingRate ? '#FFAA47' : '',
                  }}
                  title={numberWithCommasPadding(
                    estFundingRate?.fundingRate * 100,
                    4
                  )}
                >
                  {estFundingRate?.fundingRate
                    ? numberWithCommasPadding(
                        Number(
                          new Big(estFundingRate.fundingRate * 100).toFixed(4)
                        ),
                        4
                      ) + '%'
                    : '-'}
                </span>
              </span>
            </span>

            <TextWrapper
              value={displayCountDown || '-'}
              textC="text-primaryText"
              className="text-10px px-1 font-nunito"
            ></TextWrapper>
          </div>
        </div>
      )}

      <OrderBookShrink maintenance={maintenance} />
    </div>
  );
}

function RegisterWrapper() {
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

  const [tradingKeySet, setTradingKeySet] = useState<boolean>(false);
  const [agreeCheck, setAgreeCheck] = useState<boolean>(false);

  const { accountId } = useWalletSelector();

  const [keyAnnounced, setKeyAnnounced] = useState<boolean>(false);

  const storedValid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);

  const { userExist } = useOrderlyContext();

  const loading =
    (storageEnough === undefined && !!accountId) ||
    (!!storedValid && !validAccountSig);

  useEffect(() => {
    if (!accountId || !storageEnough) return;

    if (!!storedValid) {
      setValidAccountSig(true);
      setKeyAnnounced(true);
      setTradingKeySet(true);

      return;
    }

    is_orderly_key_announced(accountId)
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

  const [isOpen, setIsOpen] = useState<boolean>(true);

  useEffect(() => {
    if (!tradingKeySet || !keyAnnounced) return;

    localStorage.setItem(REF_ORDERLY_ACCOUNT_VALID, '1');
    if (userExist) {
      localStorage.removeItem(REF_ORDERLY_AGREE_CHECK);
    }

    handlePendingOrderRefreshing();

    setValidAccountSig(true);
    setIsOpen(false);
  }, [tradingKeySet, keyAnnounced]);

  function validContract() {
    const selectedWalletId = getSelectedWalletId();

    if (selectedWalletId === 'sender') {
      //@ts-ignore
      return !!window?.near?.authData?.allKeys?.[
        getConfig().ORDERLY_ASSET_MANAGER
      ];
    }

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

  const validator =
    !accountId ||
    !storageEnough ||
    !tradingKeySet ||
    !keyAnnounced ||
    !validContract();

  // if (!validator && loading) return null;

  if (!validator && !loading) return null;

  return (
    <>
      {!(!isOpen || !accountId) && (
        <Modal
          isOpen={true}
          onRequestClose={() => {
            setIsOpen(false);
          }}
          style={{
            overlay: {
              backgroundColor:
                !isOpen || !accountId ? 'transparent' : 'rgba(0,0,0,0.7)',
            },
            content: {
              position: 'fixed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              top: 'none',
              bottom: '0px',
              left: '50%',
              transform: 'translate(-50%, -30px)',
              outline: 'none',
            },
          }}
        >
          <div className=" rounded-t-2xl lg:w-p410 xs:w-screen gradientBorderWrapperNoShadowOrderly bg-boxBorder text-sm text-primaryOrderly  ">
            {loading && isOpen && (
              <div
                className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
                style={{
                  background: 'rgba(0, 19, 32, 0.8)',
                  backdropFilter: 'blur(5px)',
                  zIndex: 90,
                  minHeight: '200px',
                }}
              >
                <OrderlyLoading></OrderlyLoading>
              </div>
            )}

            {validator && !loading && (
              <div
                className="rounded-t-2xl   flex flex-col justify-center items-center h-full w-full px-5 py-4 xs:pb-2"
                style={{
                  background: 'rgba(0, 19, 32, 0.8)',
                  backdropFilter: 'blur(5px)',
                  zIndex: 80,
                }}
              >
                <div
                  className={
                    !isOpen ? 'hidden' : 'flex items-center justify-center pt-2'
                  }
                >
                  {!(!accountId || !validContract()) && (
                    <RefToOrderly></RefToOrderly>
                  )}
                </div>

                {!accountId && (
                  <ConnectWallet
                    onClick={() => {
                      window.modal.show();
                      setIsOpen(false);
                    }}
                  ></ConnectWallet>
                )}

                {accountId && !validContract() && (
                  <div className="relative bottom-1 break-words inline-flex flex-col items-center">
                    <div
                      className={
                        !isOpen
                          ? 'hidden'
                          : 'text-base w-p200 pb-6 text-center text-white'
                      }
                    >
                      Using Orderbook request re-connect wallet
                    </div>
                    <ConfirmButton
                      onClick={async () => {
                        // window.modal.show();
                        const wallet = await window.selector.wallet();
                        await wallet.signOut();

                        window.location.reload();
                      }}
                    ></ConfirmButton>
                  </div>
                )}

                {!!accountId &&
                  validContract() &&
                  (!storageEnough || !tradingKeySet || !keyAnnounced) && (
                    <RegisterButton
                      isOpenMobile={isOpen}
                      setIsOpenMobile={setIsOpen}
                      onClick={() => {
                        if (!accountId || storageEnough) return;

                        if (!userExist) {
                          localStorage.setItem(REF_ORDERLY_AGREE_CHECK, 'true');
                        }

                        storageDeposit(accountId);
                      }}
                      setCheck={setAgreeCheck}
                      check={(isMobile() && storageEnough) || agreeCheck}
                      storageEnough={!!storageEnough}
                      spin={
                        (storageEnough && (!tradingKeySet || !keyAnnounced)) ||
                        agreeCheck
                      }
                      userExist={userExist}
                    />
                  )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {(!isOpen || !accountId) && (
        <div
          className=" rounded-t-2xl lg:w-p410 xs:w-screen fixed bottom-8 left-0 gradientBorderWrapperNoShadowOrderly bg-boxBorder text-sm text-primaryOrderly  "
          style={{
            zIndex: 99,
          }}
        >
          {loading && isOpen && (
            <div
              className="absolute  flex flex-col justify-center items-center h-full w-full top-0 left-0 "
              style={{
                background: 'rgba(0, 19, 32, 0.8)',
                backdropFilter: 'blur(5px)',
                zIndex: 90,
                minHeight: '200px',
              }}
            >
              <OrderlyLoading></OrderlyLoading>
            </div>
          )}

          {validator && !loading && (
            <div
              className="rounded-t-2xl   flex flex-col justify-center items-center h-full w-full px-5 py-4 "
              style={{
                background: 'rgba(0, 19, 32, 0.8)',
                backdropFilter: 'blur(5px)',
                zIndex: 80,
              }}
            >
              <div
                className={
                  !isOpen ? 'hidden' : 'flex items-center justify-center pt-2'
                }
              >
                {!(!accountId || !validContract()) && (
                  <RefToOrderly></RefToOrderly>
                )}
              </div>

              {!accountId && (
                <ConnectWallet
                  onClick={() => {
                    window.modal.show();
                    setIsOpen(false);
                  }}
                ></ConnectWallet>
              )}

              {accountId && !validContract() && (
                <div className="relative bottom-1 break-words inline-flex flex-col items-center">
                  <div
                    className={
                      !isOpen
                        ? 'hidden'
                        : 'text-base w-p200 pb-6 text-center text-white'
                    }
                  >
                    Using Orderbook request re-connect wallet
                  </div>
                  <ConfirmButton
                    onClick={async () => {
                      // window.modal.show();
                      const wallet = await window.selector.wallet();
                      await wallet.signOut();
                    }}
                  ></ConfirmButton>

                  <div
                    className={
                      !isOpen
                        ? 'hidden'
                        : 'flex items-center mt-2 justify-center'
                    }
                  >
                    <PowerByOrderly />
                  </div>
                </div>
              )}

              {!!accountId &&
                validContract() &&
                (!storageEnough || !tradingKeySet || !keyAnnounced) && (
                  <RegisterButton
                    isOpenMobile={false}
                    setIsOpenMobile={setIsOpen}
                    setCheck={setAgreeCheck}
                    onClick={() => {
                      setIsOpen(true);
                    }}
                    check={agreeCheck}
                    storageEnough={!!storageEnough}
                    spin={
                      storageEnough &&
                      (!tradingKeySet || !keyAnnounced) &&
                      agreeCheck
                    }
                    userExist={userExist}
                  />
                )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function ({ maintenance }: { maintenance: boolean }) {
  const storedTab = sessionStorage.getItem(MOBILE_TAB) as any;

  const { validAccountSig, ticker, symbolType } = useOrderlyContext();

  const storedDisplay = sessionStorage.getItem(MOBILE_DISPLAY) as any;

  return (
    <>
      <div className="w-full flex">
        <BookBoard maintenance={maintenance} />

        {symbolType === 'SPOT' && (
          <UserBoardMobileSpot maintenance={maintenance}></UserBoardMobileSpot>
        )}

        {symbolType === 'PERP' && (
          <UserBoardMobilePerp maintenance={maintenance}></UserBoardMobilePerp>
        )}
      </div>

      {/* {!validAccountSig && <RegisterWrapper></RegisterWrapper>} */}
    </>
  );
}
