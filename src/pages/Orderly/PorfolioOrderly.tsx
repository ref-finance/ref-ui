import React, {
  createContext,
  useEffect,
  useContext,
  useState
} from 'react';
import { isMobile } from '~utils/device';
import { useIntl } from 'react-intl';
import Navigation, {
  NavigationMobile,
} from '../../components/portfolio/Navigation';
import TableWithTabs from './components/TableWithTabs';
import {
  usePortableOrderlyTable
} from './orderly/constantWjsx';
import { getOrderlySystemInfo } from './orderly/off-chain-api';
import { OrderlyUnderMaintain } from './OrderlyTradingBoard';
import { FlexRow, FlexRowBetween } from './components/Common';
import {
  PortfolioTable
} from './orderly/type';

import { WalletContext } from '../../utils/wallets-integration';
import { useWalletSelector } from '../../context/WalletSelectorContext';
export const PortfolioOrderlyData = createContext(null);
const is_mobile = isMobile();

function PortfolioOrderly() {
  const intl = useIntl();
  const { globalState } = useContext(WalletContext);
  const { accountId } = useWalletSelector();
  const isSignedIn = globalState.isSignedIn;
  const [maintenance, setMaintenance] = useState<boolean>(undefined);
  const [tab, setTab] = useState<number>(0);
  const { ordersTable, assetsTables, recordsTable } = usePortableOrderlyTable();

  useEffect(() => {
    getOrderlySystemInfo().then((res) => {
      if (res.data.status === 2) {
        setMaintenance(true);
      } else {
        setMaintenance(false);
      }
    });
    
  }, []);

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
                <span className="text-2xl gotham_bold text-white mt-1">
                  $0
                </span>
              </div>
              <div className="col-span-1 mb-3">
                <div className="flex items-center">
                  <span className="text-sm text-primaryText">
                    Available
                  </span>
                </div>
                <span className="text-2xl gotham_bold text-white mt-1">
                  $0
                </span>
              </div>
            </div>
            
            <div className="hidden md:block lg:block">
              {[ordersTable, assetsTables, recordsTable].map((table) => <TableWithTabs key={table.title} table={table} />)}
            </div>
            
            <div className="md:hidden lg:hidden">
              <FlexRow className="w-full pb-3 py-3 justify-center rounded-t-2xl mt-0 border-white border-opacity-10  md:hidden lg:hidden">
                <FlexRow className={`w-full min-h-8 justify-center`}>
                  <FlexRow>
                    {mobileTables.map((table, index) => (
                      <FlexRow
                        key={table.title}
                        onClick={() => {
                          setTab(index);
                        }}
                        className={`justify-center cursor-pointer`}
                      >
                        <span
                          className={`px-5
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

              {tab === 0 && <TableWithTabs table={assetsTables} />}
              {tab === 1 && <TableWithTabs table={ordersTable} />}
              {tab === 2 && <TableWithTabs table={recordsTable} />}
              
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden lg:hidden">
        <NavigationMobile />
      </div>
    </PortfolioOrderlyData.Provider>
  );
}
export default PortfolioOrderly;
