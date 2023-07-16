import React, {
  createContext,
  useEffect,
  useContext,
  useState
} from 'react';
import Big from 'big.js';
import ReactTooltip from 'react-tooltip';
import { useIntl } from 'react-intl';
import { isMobile } from '~utils/device';
import { executeMultipleTransactions } from '~services/near';
import Navigation, {
  NavigationMobile,
} from '../../components/portfolio/Navigation';
import QuestionMark from '../../components/farm/QuestionMark';
import { toPrecision } from './near';
import TableWithTabs from './components/TableWithTabs';
import SettlePnlModal from './components/TableWithTabs/SettlePnlModal';
import {
  usePortableOrderlyTable
} from './orderly/constantWjsx';
import { getOrderlySystemInfo, getCurrentHolding, getPortfolioPosition } from './orderly/off-chain-api';
import { OrderlyUnderMaintain } from './OrderlyTradingBoard';
import { FlexRow } from './components/Common';
import { AssetManagerModal } from './components/UserBoard';
import { WarningIcon } from '../../components/icon';
import { useTokenMetaFromSymbol } from './components/ChartHeader/state';
import { parseSymbol } from './components/RecentTrade';
import { useTokenInfo } from './orderly/state';
import { OrderAsset, useOrderlyPortfolioAssets } from './components/AssetModal/state';
import { depositOrderly, withdrawOrderly, perpSettlementTx } from './orderly/api';
import { useOrderlyContext } from './orderly/OrderlyContext';
import { Holding } from './orderly/type';

import { WalletContext } from '../../utils/wallets-integration';
import { useWalletSelector } from '../../context/WalletSelectorContext';
export const PortfolioOrderlyData = createContext(null);
const is_mobile = isMobile();

function PortfolioOrderly() {
  const intl = useIntl();
  const { globalState } = useContext(WalletContext);
  const { accountId } = useWalletSelector();
  const { tokenInfo, balances, symbol, myPendingOrdersRefreshing, validAccountSig } = useOrderlyContext();
  const isSignedIn = globalState.isSignedIn;
  const [maintenance, setMaintenance] = useState<boolean>(undefined);
  const [tab, setTab] = useState<number>(0);
  const [refOnly, setRefOnly] = useState<boolean>(false);
  const [orderType, setOrderType] = useState<number>(0);
  const [chooseMarketSymbol, setChooseMarketSymbol] = useState<string>('all_markets');
  const [chooseOrderSide, setChooseOrderSide] = useState<'all_side' | 'BUY' | 'SELL'>('all_side');

  const [holdings, setHoldings] = useState<Holding[]>();
  const [futuresStats, setFuturesStats] = useState<{ unreal: number; daily: number; notional: number; unsettle: number }>({ unreal: 0, daily: 0, notional: 0, unsettle: 0 });
  const [operationType, setOperationType] = useState<'deposit' | 'withdraw'>();
  const { symbolFrom } = parseSymbol(symbol);

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);
  const [operationId, setOperationId] = useState<string>(tokenIn?.id || '');

  const curHoldingIn = holdings?.find((h) => h.token === symbolFrom);
  const tokenInHolding = curHoldingIn
    ? toPrecision(
        new Big(curHoldingIn.holding + curHoldingIn.pending_short).toString(),
        Math.min(8, tokenIn?.decimals || 8),
        false
      )
    : balances && balances[symbolFrom]?.holding;

  const nonOrderlyTokenInfo = useTokenInfo();
  const displayBalances: OrderAsset[] = useOrderlyPortfolioAssets(nonOrderlyTokenInfo);

  // settle pnl
  const [settlePnlModalOpen, setSettlePnlModalOpen] = useState<boolean>(false);
  const [totalPnl, setTotalPnl] = useState<number>(0);

  const { ordersTable, assetsTables, recordsTable } = usePortableOrderlyTable({
    refOnly,
    setRefOnly,
    orderType,
    setOrderType,
    chooseMarketSymbol,
    setChooseMarketSymbol,
    chooseOrderSide,
    setChooseOrderSide,
    setOperationType,
    setOperationId,
    tokenIn,
    setSettlePnlModalOpen,
    futuresStats
  });

  const handleSettlePnl = async () => {
    if (!accountId) return;

    return executeMultipleTransactions([await perpSettlementTx()]);
  };

  const getPnLTotal = async () => {
    const { data } = await getPortfolioPosition({ accountId });
    const { rows, total_pnl_24_h } = data;
    const totalUnsettle: number = rows.reduce((total: number, { unsettled_pnl } : { unsettled_pnl: number }) => total + unsettled_pnl, 0);

    setTotalPnl(totalUnsettle);
    setFuturesStats({
      unreal: rows.reduce((total: number, { mark_price, average_open_price, position_qty } : { mark_price: number; average_open_price: number; position_qty: number; }) => total + ((mark_price - average_open_price) *  position_qty), 0),
      daily: total_pnl_24_h,
      notional: rows.reduce((total: number, { average_open_price, position_qty } : { average_open_price: number;  position_qty: number; }) => total + (average_open_price * position_qty), 0),
      unsettle: totalUnsettle
    });
  }

  useEffect(() => {
    getOrderlySystemInfo().then((res) => {
      if (res.data.status === 2) {
        setMaintenance(true);
      } else {
        setMaintenance(false);
      }
    });
    
    getPnLTotal();
  }, []);

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getCurrentHolding({ accountId }).then((res) => {
      setHoldings(res.data.holding);
    });
  }, [accountId, myPendingOrdersRefreshing, validAccountSig]);

  if (maintenance === undefined) return null;

  const mobileTables = [assetsTables, ordersTable, recordsTable];

  return (
    <PortfolioOrderlyData.Provider
      value={{
        isSignedIn,
        accountId,
        is_mobile,
      }}
    >
      {maintenance && <OrderlyUnderMaintain />}
      <div className="flex items-stretch justify-between w-full h-full lg:-mt-12">
        {/* Navigation */}
        <div style={{ width: '280px' }} className="pl-5 py-4 pr-4 flex-shrink-0 hidden md:block lg:block">
          <Navigation></Navigation>
        </div>
        {/* content */}
        <div className="flex-grow border-l border-r border-boxBorder px-1 pt-4 md:pt-9 lg:pt-9">
          <div className="md:px-2.5 lg:px-5 3xl:max-w-1280px m-auto">
            <div
              className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 md:bg-cardBg lg:bg-cardBg px-7 py-4 rounded-xl"
            >
              {/* getCurrentHolding */}
              <div className="col-span-2 mb-3">
                <div className="flex items-center">
                  <span className="text-sm text-primaryText flex items-center">
                    Total Est. Value
                    <div
                      className="text-white text-right ml-1"
                      data-class="reactTip"
                      data-for="selectAllId"
                      data-place="bottom"
                      data-html={true}
                      data-tip={`
                        <div class="text-navHighLightText text-xs text-left w-64 xsm:w-52">
                          ${intl.formatMessage({ id: 'portfolio_total_est_tip' })}
                        </div>
                      `}
                    >
                      <QuestionMark />
                      <ReactTooltip
                        id="selectAllId"
                        backgroundColor="#1D2932"
                        border
                        borderColor="#7e8a93"
                        effect="solid"
                      />
                    </div>
                  </span>
                </div>
                <span className="text-2xl gotham_bold text-white mt-1">
                  ${displayBalances.reduce((total, { near }) => total + parseInt(near), 0)}
                </span>
              </div>
              <div className="col-span-1 mb-3">
                <div className="flex items-center">
                  <span className="text-sm text-primaryText">
                    In Open order
                  </span>
                </div>
                <span className="text-xl gotham_bold text-white mt-1">
                  ${displayBalances.reduce((total, row) => total + parseInt(row['in-order']), 0)}
                </span>
              </div>
              <div className="col-span-1 mb-3">
                <div className="flex items-center">
                  <span className="text-sm text-primaryText">
                    Available
                  </span>
                </div>
                <span className="text-xl gotham_bold text-white mt-1">
                  ${displayBalances.reduce((total, { available }) => total + parseInt(available), 0)}
                </span>
              </div>
            </div>
            
            <div className="hidden md:block lg:block">
              <TableWithTabs
                table={ordersTable}
                maintenance={maintenance}
                refOnly={refOnly}
                orderType={orderType}
                setOrderType={setOrderType}
                chooseMarketSymbol={chooseMarketSymbol}
                setChooseMarketSymbol={setChooseMarketSymbol}
                chooseOrderSide={chooseOrderSide}
                setChooseOrderSide={setChooseOrderSide}
                displayBalances={displayBalances}
              />
              <TableWithTabs table={assetsTables} maintenance={maintenance} displayBalances={displayBalances} />
              <TableWithTabs table={recordsTable} maintenance={maintenance} displayBalances={displayBalances} />
              <span className="text-xs text-primaryOrderly flex items-center">
                <div className="ml-5 mr-1">
                  <WarningIcon />
                </div>
                {intl.formatMessage({
                  id: 'orderly_portfolio_table_tips',
                  defaultMessage: 'The data provided herein includes all assets and records in your account, not limited to those generated through REF.',
                })}
              </span>
            </div>
            
            <div className="md:hidden lg:hidden">
              <FlexRow className="w-full pb-3 justify-center rounded-t-2xl mt-0 border-white border-opacity-10  md:hidden lg:hidden">
                <FlexRow className={`w-full min-h-8 justify-center`}>
                  <FlexRow className="">
                    {mobileTables.map((table, index) => (
                      <FlexRow
                        key={table.title}
                        onClick={() => {
                          setTab(index);
                        }}
                        className={`justify-center cursor-pointer`}
                      >
                        <span
                          className={`px-5 gotham_bold
                            ${tab === index
                              ? 'text-white relative'
                              : 'text-primaryOrderly relative'
                          }`}
                        >
                          {table.title}

                          {tab === index && (
                            <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-5 left-0"></div>
                          )}
                        </span>
                      </FlexRow>
                    ))}
                  </FlexRow>
                </FlexRow>
              </FlexRow>

              {tab === 0 && <TableWithTabs table={assetsTables} maintenance={maintenance} displayBalances={displayBalances} />}
              {tab === 1 && (
                <TableWithTabs
                  table={ordersTable}
                  maintenance={maintenance}
                  refOnly={refOnly}
                  orderType={orderType}
                  setOrderType={setOrderType}
                  chooseMarketSymbol={chooseMarketSymbol}
                  setChooseMarketSymbol={setChooseMarketSymbol}
                  chooseOrderSide={chooseOrderSide}
                  setChooseOrderSide={setChooseOrderSide}
                  displayBalances={displayBalances}
                />
              )}
              {tab === 2 && <TableWithTabs table={recordsTable} maintenance={maintenance} displayBalances={displayBalances} />}
              
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden lg:hidden">
        <NavigationMobile />
      </div>

      <SettlePnlModal
        isOpen={settlePnlModalOpen}
        onRequestClose={() => {
          setSettlePnlModalOpen(false);
        }}
        onClick={handleSettlePnl}
      />

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
    </PortfolioOrderlyData.Provider>
  );
}
export default PortfolioOrderly;
