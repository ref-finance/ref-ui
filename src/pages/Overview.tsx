import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { isMobile } from 'src/utils/device';
import Navigation, {
  NavigationMobile,
} from '../components/portfolio/Navigation';

import { WalletContext } from '../utils/wallets-integration';
import { getBoostTokenPrices } from 'src/services/farm';
import OrderlyPanel from '../components/overview/OrderlyPanel';
import RefPanel from '../components/overview/RefPanel';
import BurrowPanel from '../components/overview/BurrowPanel';
import WalletPanel from '../components/overview/WalletPanel';
import TotalPanel from '../components/overview/TotalPanel';
import BLACKTip from '../components/pool/BLACKTip';
import { useWalletSelector } from '../context/WalletSelectorContext';
import Big from 'big.js';
export const OverviewData = createContext(null);
const is_mobile = isMobile();
export default function Overview() {
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
  const [userTokens, setUserTokens] = useState([]);

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
    <OverviewData.Provider
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
        userTokens,
        setUserTokens,

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
        <OverviewMobile></OverviewMobile>
      ) : (
        <OverviewPc></OverviewPc>
      )}
    </OverviewData.Provider>
  );
}

function OverviewPc() {
  const { userTokens } = useContext(OverviewData);
  const tokenIds = useMemo(() => {
    return userTokens
      .filter((t) => +t.aurora > 0 || +t.dcl > 0 || +t.near > 0 || +t.ref > 0)
      .map((t) => t.id);
  }, [userTokens]);
  return (
    <div className="flex items-stretch justify-between w-full h-full lg:-mt-12">
      {/* Navigation */}
      <div style={{ width: '280px' }} className="pl-5 py-4 pr-4 flex-shrink-0">
        <Navigation></Navigation>
      </div>
      {/* content */}
      <div className="flex-grow border-l border-r border-boxBorder px-5 pt-9">
        <div className="lg:max-w-1000px 3xl:max-w-1280px m-auto">
          <BLACKTip tokenIds={tokenIds} className="mb-5" />
          <TotalPanel></TotalPanel>
          <div className="flex  items-stretch justify-between gap-4 mt-7">
            <RefPanel></RefPanel>
            <OrderlyPanel></OrderlyPanel>
            <BurrowPanel></BurrowPanel>
          </div>
          <WalletPanel></WalletPanel>
        </div>
      </div>
    </div>
  );
}
function OverviewMobile() {
  const { userTokens } = useContext(OverviewData);
  const tokenIds = useMemo(() => {
    return userTokens
      .filter((t) => +t.aurora > 0 || +t.dcl > 0 || +t.near > 0 || +t.ref > 0)
      .map((t) => t.id);
  }, [userTokens]);
  return (
    <>
      <div>
        <BLACKTip tokenIds={tokenIds} className="mb-5 mx-4" />
        <TotalPanel></TotalPanel>
        <div className="flex flex-col px-2.5 mt-5">
          <RefPanel></RefPanel>
          <OrderlyPanel></OrderlyPanel>
          <BurrowPanel></BurrowPanel>
        </div>
        <div className="px-2.5">
          <WalletPanel></WalletPanel>
        </div>
      </div>
      <NavigationMobile></NavigationMobile>
    </>
  );
}
