import React, { useState, createContext, useEffect, useContext } from 'react';
import { isMobile } from '~utils/device';
import Navigation, {
  NavigationMobile,
} from '../components/portfolio/Navigation';

import { WalletContext } from '../utils/wallets-integration';
import { getBoostTokenPrices } from '~services/farm';
import OrderlyPanel from '../components/overview/OrderlyPanel';
import RefPanel from '../components/overview/RefPanel';
import BurrowPanel from '../components/overview/BurrowPanel';
import WalletPanel from '../components/overview/WalletPanel';
import { useWalletSelector } from '../context/WalletSelectorContext';
export const OverviewData = createContext(null);
const is_mobile = isMobile();
function Overview() {
  const { globalState } = useContext(WalletContext);
  const { accountId } = useWalletSelector();
  const isSignedIn = globalState.isSignedIn;
  const [tokenPriceList, setTokenPriceList] = useState<any>({});
  useEffect(() => {
    // get all token prices
    getTokenPriceList();
  }, []);
  async function getTokenPriceList() {
    const tokenPriceList = await getBoostTokenPrices();
    setTokenPriceList(tokenPriceList);
  }
  return (
    <OverviewData.Provider
      value={{
        tokenPriceList,
        isSignedIn,
        accountId,
        is_mobile,
      }}
    >
      <div className="flex items-stretch justify-between w-full h-full lg:-mt-12">
        {/* Navigation */}
        <div
          style={{ width: '280px' }}
          className="pl-5 py-4 pr-4 flex-shrink-0"
        >
          <Navigation></Navigation>
        </div>
        {/* content */}
        <div className="flex-grow border-l border-r border-boxBorder px-5 pt-9">
          <div className="lg:max-w-1000px 3xl:max-w-1280px m-auto">
            <div className="flex  items-stretch justify-between gap-4">
              <RefPanel></RefPanel>
              <RefPanel></RefPanel>
              <BurrowPanel></BurrowPanel>
            </div>
          </div>
        </div>
      </div>

      {/*  */}
      {/* <WalletPanel></WalletPanel> */}
    </OverviewData.Provider>
  );
}
export default Overview;
