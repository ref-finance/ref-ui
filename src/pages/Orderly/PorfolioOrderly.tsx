import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { isMobile } from '~utils/device';
import Navigation, {
  NavigationMobile,
} from '../../components/portfolio/Navigation';
import TableWithTabs from './components/TableWithTabs';

import { WalletContext } from '../../utils/wallets-integration';
import { getBoostTokenPrices } from '~services/farm';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import Big from 'big.js';
export const PortfolioOrderlyData = createContext(null);
const is_mobile = isMobile();
function PortfolioOrderly() {
  const { globalState } = useContext(WalletContext);
  const { accountId } = useWalletSelector();
  const isSignedIn = globalState.isSignedIn;
  const [tokenPriceList, setTokenPriceList] = useState<any>({});

  const [ref_invest_value, set_ref_invest_value] = useState<string>('0');
  const [ref_invest_value_done, set_ref_invest_value_done] =
    useState<boolean>(false);
  const [ref_profit_value, set_ref_profit_value] = useState<string>('0');
  const [ref_profit_value_done, set_ref_profit_value_done] =
    useState<boolean>(false);

  const [orderly_asset_value, set_orderly_asset_value] = useState<string>('0');
  const [orderly_asset_value_done, set_orderly_asset_value_done] =
    useState<boolean>(false);

  const [burrow_supplied_value, set_burrow_supplied_value] =
    useState<string>('0');
  const [burrow_borrowied_value, set_burrow_borrowied_value] =
    useState<string>('0');
  const [burrow_rewards_value, set_burrow_rewards_value] =
    useState<string>('0');
  const [burrow_done, set_burrow_done] = useState<boolean>(false);

  const [wallet_assets_value, set_wallet_assets_value] = useState<string>('0');
  const [wallet_assets_value_done, set_wallet_assets_value_done] =
    useState<boolean>(false);

  const [netWorth, netWorthDone] = useMemo(() => {
    let netWorth = '0';
    let netWorthDone = false;
    if (
      ref_invest_value_done &&
      ref_profit_value_done &&
      burrow_done &&
      wallet_assets_value_done
    ) {
      netWorth = Big(ref_invest_value)
        .plus(ref_profit_value)
        .plus(orderly_asset_value)
        .plus(burrow_supplied_value)
        .plus(burrow_rewards_value)
        .plus(wallet_assets_value)
        .minus(burrow_borrowied_value)
        .toFixed();
      netWorthDone = true;
    }
    return [netWorth, netWorthDone];
  }, [
    ref_invest_value_done,
    ref_profit_value_done,
    orderly_asset_value,
    burrow_done,
    wallet_assets_value_done,
    burrow_supplied_value,
    burrow_borrowied_value,
    burrow_rewards_value,
  ]);
  const [claimable, claimableDone] = useMemo(() => {
    let claimable = '0';
    let claimableDone = false;
    if (ref_profit_value_done && burrow_done) {
      claimable = Big(ref_profit_value).plus(burrow_rewards_value).toFixed();
      claimableDone = true;
    }
    return [claimable, claimableDone];
  }, [ref_profit_value_done, burrow_rewards_value, burrow_done]);
  useEffect(() => {
    // get all token prices
    getTokenPriceList();
  }, []);
  async function getTokenPriceList() {
    const tokenPriceList = await getBoostTokenPrices();
    setTokenPriceList(tokenPriceList);
  }
  return (
    <PortfolioOrderlyData.Provider
      value={{
        tokenPriceList,
        isSignedIn,
        accountId,
        is_mobile,
        set_ref_invest_value,
        set_ref_invest_value_done,
        set_ref_profit_value,
        set_ref_profit_value_done,

        set_orderly_asset_value,
        set_orderly_asset_value_done,

        set_burrow_supplied_value,
        set_burrow_borrowied_value,
        set_burrow_rewards_value,
        set_burrow_done,

        set_wallet_assets_value,
        set_wallet_assets_value_done,

        netWorth,
        netWorthDone,

        claimable,
        claimableDone,

        wallet_assets_value,
        wallet_assets_value_done,

        burrow_borrowied_value,
        burrow_done,
      }}
    >
      {is_mobile ? (
        <PortfolioOrderlyMobile></PortfolioOrderlyMobile>
      ) : (
        <PortfolioOrderlyPc></PortfolioOrderlyPc>
      )}
    </PortfolioOrderlyData.Provider>
  );
}
export default PortfolioOrderly;

function PortfolioOrderlyPc() {
  return (
    <div className="flex items-stretch justify-between w-full h-full lg:-mt-12">
      {/* Navigation */}
      <div style={{ width: '280px' }} className="pl-5 py-4 pr-4 flex-shrink-0">
        <Navigation></Navigation>
      </div>
      {/* content */}
      <div className="flex-grow border-l border-r border-boxBorder px-5 pt-9">
        <div className="lg:max-w-1000px 3xl:max-w-1280px m-auto">
          <div
            className="w-full grid grid-cols-4 bg-portfolioBarBgColor px-7 py-4 rounded-xl"
          >
            <div className="col-span-2">
              <div className="flex items-center">
                <span className="text-sm text-primaryText">
                  dasdas
                </span>
              </div>
              <span className="text-2xl gotham_bold text-white mt-1">
                dsadsa
              </span>
            </div>
            <div className="col-span-1">
              <div className="flex items-center">
                <span className="text-sm text-primaryText">
                  dasdas
                </span>
              </div>
              <span className="text-2xl gotham_bold text-white mt-1">
                dsadsa
              </span>
            </div>
          </div>
          <TableWithTabs />
          <TableWithTabs />
          <TableWithTabs />
        </div>
      </div>
    </div>
  );
}
function PortfolioOrderlyMobile() {
  return (
    <>
      <div>
        <TableWithTabs />
      </div>
      <NavigationMobile></NavigationMobile>
    </>
  );
}
