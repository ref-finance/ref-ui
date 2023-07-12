import React, {
  createContext,
  useEffect,
  useContext,
} from 'react';
import { isMobile } from '~utils/device';
import Navigation, {
  NavigationMobile,
} from '../../components/portfolio/Navigation';
import TableWithTabs from './components/TableWithTabs';
import {
  usePortableOrderlyTable
} from './orderly/constantWjsx';
import { getOrderlySystemInfo } from './orderly/off-chain-api';
import { OrderlyUnderMaintain } from './OrderlyTradingBoard';
import { useCurHoldings } from './components/AllOrders/state';
import {
  PortfolioTable
} from './orderly/type';

import { WalletContext } from '../../utils/wallets-integration';
import { useWalletSelector } from '../../context/WalletSelectorContext';
export const PortfolioOrderlyData = createContext(null);
const is_mobile = isMobile();
function PortfolioOrderly() {
  const { globalState } = useContext(WalletContext);
  const { accountId } = useWalletSelector();
  const isSignedIn = globalState.isSignedIn;
  const [maintenance, setMaintenance] = React.useState<boolean>(undefined);
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

  return (
    <PortfolioOrderlyData.Provider
      value={{
        isSignedIn,
        accountId,
        is_mobile,
      }}
    >
      {maintenance && <OrderlyUnderMaintain />}
      {is_mobile ? (
        <PortfolioOrderlyMobile tables={[assetsTables, ordersTable, recordsTable]} />
      ) : (
        <PortfolioOrderlyPc tables={[ordersTable, assetsTables, recordsTable]} />
      )}
    </PortfolioOrderlyData.Provider>
  );
}
export default PortfolioOrderly;


function PortfolioOrderlyPc({ tables }: { tables: PortfolioTable[] }) {

  return (
    <div className="flex items-stretch justify-between w-full h-full lg:-mt-12">
      {/* Navigation */}
      <div style={{ width: '280px' }} className="pl-5 py-4 pr-4 flex-shrink-0">
        <Navigation></Navigation>
      </div>
      {/* content */}
      <div className="flex-grow border-l border-r border-boxBorder px-1 pt-9">
        <div className="lg:max-w-1000px 3xl:max-w-1280px m-auto">
          <div
            className="w-full grid grid-cols-4 bg-cardBg px-7 py-4 rounded-xl"
          >
            {/* getCurrentHolding */}
            <div className="col-span-2">
              <div className="flex items-center">
                <span className="text-sm text-primaryText">
                  Total Est. Value 
                </span>
              </div>
              <span className="text-2xl gotham_bold text-white mt-1">
                ds
              </span>
            </div>
            <div className="col-span-1">
              <div className="flex items-center">
                <span className="text-sm text-primaryText">
                  In Open order
                </span>
              </div>
              <span className="text-2xl gotham_bold text-white mt-1">
                dsadsa
              </span>
            </div>
            <div className="col-span-1">
              <div className="flex items-center">
                <span className="text-sm text-primaryText">
                  Available
                </span>
              </div>
              <span className="text-2xl gotham_bold text-white mt-1">
                dsadsa
              </span>
            </div>
          </div>
          
          {tables.map((table) => <TableWithTabs key={table.title} table={table} />)}
        </div>
      </div>
    </div>
  );
}

function PortfolioOrderlyMobile({ tables }: { tables: PortfolioTable[] }) {

  return (
    <>
      {/* content */}
      <div className="flex-grow border-l border-r border-boxBorder px-5 pt-9">
        <div className="lg:max-w-1000px 3xl:max-w-1280px m-auto">
          <div
            className="w-full grid grid-cols-4 bg-cardBg px-7 py-4 rounded-xl"
          >
            <div className="col-span-2">
              <div className="flex items-center">
                <span className="text-sm text-primaryText">
                  Total Est. Value 
                </span>
              </div>
              <span className="text-2xl gotham_bold text-white mt-1">
                dsadsa
              </span>
            </div>
            <div className="col-span-1">
              <div className="flex items-center">
                <span className="text-sm text-primaryText">
                  In Open order
                </span>
              </div>
              <span className="text-2xl gotham_bold text-white mt-1">
                dsadsa
              </span>
            </div>
            <div className="col-span-1">
              <div className="flex items-center">
                <span className="text-sm text-primaryText">
                  Available
                </span>
              </div>
              <span className="text-2xl gotham_bold text-white mt-1">
                dsadsa
              </span>
            </div>
          </div>
        </div>
        {tables.map((table) => <TableWithTabs key={table.title} table={table} />)}
      </div>
      <NavigationMobile></NavigationMobile>
    </>
  );
}
