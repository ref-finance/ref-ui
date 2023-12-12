import { NearIConSelectModal, OrderlyIconBalance } from '../Common/Icons';

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
import { HiDownload } from '../../../../components/reactIcons';
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
import Big from 'big.js';
import { CheckBox, ConnectWallet, ErrorTip, RegisterButton } from '../Common';

import { ConfirmButton, QuestionMark } from '../Common/index';

import {
  is_orderly_key_announced,
  is_trading_key_set,
} from '../../orderly/on-chain-api';
import getConfig from '../../config';
import { AssetModal } from '../AssetModal';
import { ONLY_ZEROS } from '../../../../utils/numbers';
import * as math from 'mathjs';
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
  leverageMap,
} from '../UserBoardPerp/math';
import { useLeverage } from '../../orderly/state';
import {
  MarginRatioText,
  TotaluPNLText,
  UnsettlePnl,
  TotalCollateralText,
  FreeCollateralText,
  UsdcAvailableBalanceText,
  CollatteralToken,
  CollatteralTokenAvailableCell,
} from '../UserBoardPerp/components/HoverText';
import { usePerpData } from '../UserBoardPerp/state';
import { executeMultipleTransactions } from '../../../../services/near';
import SettlePnlModal from '../TableWithTabs/SettlePnlModal';
import { SetLeverageButton } from '../UserBoardPerp/components/SetLeverageButton';
import { useOrderlyBalancesStore } from '../../../../stores/orderlyBalances';

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
    holdings,
  } = useOrderlyContext();
  // const [holdings, setHoldings] = useState<Holding[]>();

  const { accountId } = useWalletSelector();

  const [tab, setTab] = useState<'account' | 'balance'>(
    symbolType === 'SPOT' ? 'balance' : 'account'
  );

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const curHoldingIn = holdings?.find((h) => h.token === symbolFrom);

  const curHoldingOut = holdings?.find((h) => h.token === symbolTo);
  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();

  const tokenInHolding = curHoldingIn
    ? curHoldingIn.holding + curHoldingIn.pending_short
    : balances && balances[symbolFrom]?.holding;

  const { freeCollateral, collateralTokenAvailableBalance } = usePerpData();
  const usdcAvailableBalance = curHoldingOut
    ? new Big(curHoldingOut.holding + curHoldingOut.pending_short).toFixed(2)
    : '-';

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

  const tokenOut = useTokenMetaFromSymbol(symbolTo, tokenInfo);

  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');
  const [showAllAssets, setShowAllAssets] = useState<boolean>(false);
  const orderlyBalancesStore: any = useOrderlyBalancesStore();
  const orderlyBalances = orderlyBalancesStore.getBalances();

  const tokenFromBalance = useTokenBalance(
    tokenIn?.id,
    JSON.stringify(orderlyBalances)
  );

  const tokenToBalance = useTokenBalance(
    tokenOut?.id,
    JSON.stringify(orderlyBalances)
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
              {symbolType === 'SPOT' ? null : <CollatteralToken d="right" />}
            </div>

            <div className="justify-self-end relative right-10">
              {!!tokenToBalance ? digitWrapperAsset(tokenToBalance, 2) : ''}
            </div>

            {/* <div className="flex items-center justify-self-end">
              <span>
                {tokenOutHolding
                  ? digitWrapperAsset(tokenOutHolding.toString(), 2)
                  : 0}
              </span>
            </div> */}
            <CollatteralTokenAvailableCell
              finalBalance={collateralTokenAvailableBalance}
              usdcBalance={usdcAvailableBalance}
              freeCollateral={freeCollateral}
            />
          </div>

          <div className="text-sm text-white font-bold pt-4 text-left frcb">
            <div className={`flex items-center w-full `}>
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

            <span
              className={
                'text-base font-normal whitespace-nowrap text-gradientFromHover '
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
            freeCollateral={freeCollateral}
            curHoldingOut={curHoldingOut}
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
            freeCollateral={freeCollateral}
            curHoldingOut={curHoldingOut}
          />
          {showAllAssets && (
            <AssetModal
              isOpen={showAllAssets}
              curHoldingOut={curHoldingOut}
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
    setCurLeverage,
    curLeverage,
    accountCurLeverage,
    collateralTokenAvailableBalance,
  } = usePerpData();

  const intl = useIntl();

  const [settleModalOpen, setSettleModalOpen] = useState<boolean>(false);

  const riskLevel =
    marginRatio === '-'
      ? null
      : getRiskLevel(Number(marginRatio), userInfo?.max_leverage || 10);

  return (
    <div className="flex flex-col text-primaryText gap-2 px-2 text-13px">
      {/* max account leverage */}
      <div className="frcb">
        <FormattedMessage
          id="leverage_max_leverage_raw"
          defaultMessage={'Max Account Leverage'}
        />

        <SetLeverageButton
          curLeverage={userInfo?.max_leverage || '-'}
          value={leverageMap(curLeverage)}
          onChange={(v) => {
            setCurLeverage(leverageMap(v, true));
          }}
          marginRatio={Number(marginRatio)}
          min={0}
          className={`orderly-leverage-slider ${'orderly-leverage-slider-buy'}`}
        />
      </div>

      {/* account current leverage */}
      <div className="frcb">
        <FormattedMessage
          id="current_leverage"
          defaultMessage={`Current Leverage`}
        />

        <span className="font-nunito  text-white">{accountCurLeverage}x</span>
      </div>

      {/* margin ratio */}
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

      {/* Maintenance Margin Ratio */}
      <div className="frcb">
        <FormattedMessage
          id="maintenance_margin_ratio"
          defaultMessage={'Maintenance Margin Ratio'}
        />

        <span className="font-nunito text-white">{mmr}</span>
      </div>
      {/* total colleteral  */}
      <div className="frcb">
        <TotalCollateralText />
        <span className="font-nunito text-white">
          {!positions || totalCollateral === '-'
            ? '-'
            : numberWithCommas(totalCollateral)}
        </span>
      </div>
      {/* Usdc Available Balance */}
      <div className="frcb">
        <UsdcAvailableBalanceText />
        <span className="font-nunito text-white">
          {collateralTokenAvailableBalance === '-'
            ? '-'
            : numberWithCommas(collateralTokenAvailableBalance)}
        </span>
      </div>
      {/* free collateral */}
      <div className="frcb">
        <FreeCollateralText />
        <span className="font-nunito text-white">
          {!positions ? '-' : numberWithCommas(freeCollateral)}
        </span>
      </div>
      {/* total upnl */}
      <div className="frcb">
        <TotaluPNLText></TotaluPNLText>

        <span className="font-nunito text-white">{totaluPnl}</span>
      </div>

      {/* unsettle unpnl */}
      <div className="frcb">
        <UnsettlePnl></UnsettlePnl>

        <div className="font-nunito frcs gap-2">
          <span
            className={`whitespace-nowrap  ${
              ONLY_ZEROS.test(unsettle)
                ? ''
                : Number(unsettle) > 0
                ? 'text-buyGreen'
                : 'text-sellRed'
            }`}
          >
            {Number(unsettle) < 0.01 && Number(unsettle) > 0
              ? '< 0.01'
              : numberWithCommas(toPrecision(unsettle, 2))}
          </span>

          <button
            className={`font-gotham  px-1 text-xs rounded-md border border-primaryText ${
              ONLY_ZEROS.test(unsettle)
                ? 'cursor-not-allowed text-primaryText opacity-70'
                : 'text-white'
            } `}
            onClick={async () => {
              if (ONLY_ZEROS.test(unsettle)) {
                return;
              }

              setSettleModalOpen(true);

              // return executeMultipleTransactions([await perpSettlementTx()]);
            }}
          >
            <FormattedMessage
              id="settle"
              defaultMessage={'Settle'}
            ></FormattedMessage>
          </button>
        </div>
      </div>

      <SettlePnlModal
        onClick={async () => {
          return executeMultipleTransactions([await perpSettlementTx()]);
        }}
        onRequestClose={() => {
          setSettleModalOpen(false);
        }}
        isOpen={settleModalOpen}
        portfolioUnsettle={toPrecision(unsettle, 2, true, false)}
      ></SettlePnlModal>
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
    </>
  );
}
