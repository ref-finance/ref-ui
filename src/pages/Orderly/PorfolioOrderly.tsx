import React, {
  createContext,
  useEffect,
  useContext,
  useState
} from 'react';
import Big from 'big.js';
import { isMobile } from '~utils/device';
import { useIntl } from 'react-intl';
import Navigation, {
  NavigationMobile,
} from '../../components/portfolio/Navigation';
import { toPrecision } from './near';
import TableWithTabs from './components/TableWithTabs';
import {
  usePortableOrderlyTable
} from './orderly/constantWjsx';
import { getOrderlySystemInfo, getCurrentHolding } from './orderly/off-chain-api';
import { OrderlyUnderMaintain } from './OrderlyTradingBoard';
import { FlexRow } from './components/Common';
import { AssetManagerModal } from './components/UserBoard';
import { WarningIcon } from '../../components/icon';
import { useTokenMetaFromSymbol } from './components/ChartHeader/state';
import { parseSymbol } from './components/RecentTrade';
import { useTokenInfo } from './orderly/state';
import { OrderAsset, useOrderlyPortfolioAssets } from './components/AssetModal/state';
import { depositOrderly, withdrawOrderly } from './orderly/api';
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
  const [portfolioValue, setPorfofolioValue] = useState<{ est: number; open: number; avail: number; }>({ est: 0, open: 0, avail: 0 });
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
    tokenIn
  });

  const nonOrderlyTokenInfo = useTokenInfo();
  const displayBalances: OrderAsset[] = useOrderlyPortfolioAssets(nonOrderlyTokenInfo);

  useEffect(() => {
    getOrderlySystemInfo().then((res) => {
      if (res.data.status === 2) {
        setMaintenance(true);
      } else {
        setMaintenance(false);
      }
    });
    
  }, []);

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getCurrentHolding({ accountId }).then((res) => {
      setHoldings(res.data.holding);
    });
  }, [accountId, myPendingOrdersRefreshing, validAccountSig]);

  useEffect(() => {
    if (holdings) return;
  }, [holdings]);

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
        <div className="flex-grow border-l border-r border-boxBorder px-1 pt-9">
          <div className="lg:max-w-1000px 3xl:max-w-1280px m-auto">
            <div
              className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 md:bg-cardBg lg:bg-cardBg px-7 py-4 rounded-xl"
            >
              {/* getCurrentHolding */}
              <div className="col-span-2 mb-3">
                <div className="flex items-center">
                  <span className="text-sm text-primaryText">
                    Total Est. Value 
                  </span>
                </div>
                <span className="text-2xl gotham_bold text-white mt-1">
                  $0
                </span>
              </div>
              <div className="col-span-1 mb-3">
                <div className="flex items-center">
                  <span className="text-sm text-primaryText">
                    In Open order
                  </span>
                </div>
                <span className="text-xl gotham_bold text-white mt-1">
                  $0
                </span>
              </div>
              <div className="col-span-1 mb-3">
                <div className="flex items-center">
                  <span className="text-sm text-primaryText">
                    Available
                  </span>
                </div>
                <span className="text-xl gotham_bold text-white mt-1">
                  $0
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
