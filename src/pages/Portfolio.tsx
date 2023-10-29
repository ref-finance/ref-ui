import React, { useState, createContext, useEffect, useContext } from 'react';
import Asset from '../components/portfolio/Asset';
import Tokens from '../components/portfolio/Tokens';
import AssetChart from '../components/portfolio/AssetChart';
import AssetProfit from '../components/portfolio/AssetProfit';
import Tab from '../components/portfolio/Tab';
import Positions from '../components/portfolio/Positions';
import Farms from '../components/portfolio/Farms';
import Orders from '../components/portfolio/Orders';
import Navigation, {
  NavigationMobile,
} from '../components/portfolio/Navigation';
import MainTab from '../components/portfolio/MainTab';
import { getBoostTokenPrices } from '../services/farm';
import { UserLiquidityInfo } from '../services/commonV3';
import { TokenMetadata } from 'src/services/ft-contract';
import { isMobile } from 'src/utils/device';
const is_mobile = isMobile();
export const PortfolioData = createContext(null);
function Portfolio() {
  // variables only used in mobile site start
  const [main_active_tab, set_main_active_tab] = useState('Summary'); // Summary,positions

  // variables only used in mobile site end
  const [activeTab, setActiveTab] = useState(is_mobile ? '' : '1'); // 1,2,3
  const [YourLpValueV2, setYourLpValueV2] = useState('0');
  const [YourLpValueV1, setYourLpValueV1] = useState('0');
  const [lpValueV1Done, setLpValueV1Done] = useState(false);
  const [lpValueV2Done, setLpValueV2Done] = useState(false);
  const [v1LiquidityQuantity, setV1LiquidityQuantity] = useState('0');
  const [v2LiquidityQuantity, setV2LiquidityQuantity] = useState('0');
  const [v2LiquidityLoadingDone, setV2LiquidityLoadingDone] = useState(false);
  const [v1LiquidityLoadingDone, setV1LiquidityLoadingDone] = useState(false);
  const [your_classic_lp_all_in_farms, set_your_classic_lp_all_in_farms] =
    useState<boolean>(true);
  const [tokenPriceList, setTokenPriceList] = useState<any>({});

  const [classic_farms_value, set_classic_farms_value] = useState('0');
  const [dcl_farms_value, set_dcl_farms_value] = useState('0');
  const [classic_farms_value_done, set_classic_farms_value_done] =
    useState(false);
  const [dcl_farms_value_done, set_dcl_farms_value_done] = useState(false);
  const [all_farms_Loading_done, set_all_farms_Loading_done] = useState(false);
  const [all_farms_quanity, set_all_farms_quanity] = useState('0');

  const [active_order_value_done, set_active_order_value_done] =
    useState(false);
  const [active_order_Loading_done, set_active_order_Loading_done] =
    useState(false);
  const [active_order_value, set_active_order_value] = useState(false);
  const [active_order_quanity, set_active_order_quanity] = useState('0');

  const [user_unclaimed_map, set_user_unclaimed_map] = useState<
    Record<string, any>
  >({});
  const [user_unclaimed_map_done, set_user_unclaimed_map_done] =
    useState<boolean>(false);

  const [user_unclaimed_token_meta_map, set_user_unclaimed_token_meta_map] =
    useState<Record<string, any>>({});

  const [dcl_liquidities_list, set_dcl_liquidities_list] = useState<
    UserLiquidityInfo[]
  >([]);
  const [dcl_liquidities_details_list, set_dcl_liquidities_details_list] =
    useState<UserLiquidityInfo[]>([]);

  const [
    dcl_liquidities_details_list_done,
    set_dcl_liquidities_details_list_done,
  ] = useState<boolean>(false);

  const [dcl_tokens_metas, set_dcl_tokens_metas] =
    useState<Record<string, TokenMetadata>>();
  const [history_total_asset, set_history_total_asset] = useState<string>('0');
  const [history_total_asset_done, set_history_total_asset_done] =
    useState<boolean>(false);

  useEffect(() => {
    getTokenPriceList();
  }, []);
  async function getTokenPriceList() {
    // get all token prices
    const tokenPriceList = await getBoostTokenPrices();
    setTokenPriceList(tokenPriceList);
  }
  return (
    <PortfolioData.Provider
      value={{
        main_active_tab,
        set_main_active_tab,
        activeTab,
        setActiveTab,
        tokenPriceList,
        user_unclaimed_map,
        user_unclaimed_token_meta_map,
        set_user_unclaimed_map,
        set_user_unclaimed_token_meta_map,
        history_total_asset,
        history_total_asset_done,
        set_history_total_asset,
        set_history_total_asset_done,

        YourLpValueV1,
        YourLpValueV2,
        lpValueV1Done,
        lpValueV2Done,
        v1LiquidityQuantity,
        v2LiquidityQuantity,
        v2LiquidityLoadingDone,
        v1LiquidityLoadingDone,
        setYourLpValueV1,
        setYourLpValueV2,
        setLpValueV1Done,
        setLpValueV2Done,
        setV1LiquidityQuantity,
        setV2LiquidityQuantity,
        setV1LiquidityLoadingDone,
        setV2LiquidityLoadingDone,

        classic_farms_value,
        dcl_farms_value,
        all_farms_quanity,
        classic_farms_value_done,
        dcl_farms_value_done,
        all_farms_Loading_done,
        set_dcl_farms_value_done,
        set_classic_farms_value_done,
        set_dcl_farms_value,
        set_classic_farms_value,
        set_all_farms_quanity,
        set_all_farms_Loading_done,

        active_order_quanity,
        active_order_value,
        active_order_value_done,
        active_order_Loading_done,
        set_active_order_value_done,
        set_active_order_Loading_done,
        set_active_order_quanity,
        set_active_order_value,

        dcl_liquidities_list,
        dcl_liquidities_details_list,
        dcl_tokens_metas,
        set_dcl_liquidities_list,
        set_dcl_liquidities_details_list,
        set_dcl_tokens_metas,

        user_unclaimed_map_done,
        set_user_unclaimed_map_done,
        dcl_liquidities_details_list_done,
        set_dcl_liquidities_details_list_done,

        your_classic_lp_all_in_farms,
        set_your_classic_lp_all_in_farms,
      }}
    >
      {is_mobile ? (
        <PortfolioMobile></PortfolioMobile>
      ) : (
        <PortfolioPC></PortfolioPC>
      )}
    </PortfolioData.Provider>
  );
}
function PortfolioMobile() {
  const { main_active_tab } = useContext(PortfolioData);
  return (
    <>
      <div>
        <MainTab></MainTab>
        <div className={`${main_active_tab == 'Summary' ? '' : 'hidden'}`}>
          <Asset></Asset>
          <AssetChart></AssetChart>
          <AssetProfit></AssetProfit>
        </div>
        <div className={`${main_active_tab == 'positions_2' ? '' : 'hidden'}`}>
          <Orders></Orders>
          <Positions></Positions>
          <Farms></Farms>
        </div>
      </div>
      <NavigationMobile></NavigationMobile>
    </>
  );
}
function PortfolioPC() {
  const { activeTab } = useContext(PortfolioData);
  return (
    <div className="flex items-stretch justify-between w-full h-full lg:-mt-12">
      {/* Navigation */}
      <div style={{ width: '280px' }} className="pl-5 py-4 pr-4 flex-shrink-0">
        <Navigation></Navigation>
      </div>
      {/* content */}
      <div className="flex-grow border-l border-r border-boxBorder px-5">
        <div className="lg:max-w-1000px 3xl:max-w-1280px m-auto">
          <div>
            <div className="flex justify-between items-stretch">
              <Asset></Asset>
              <AssetChart></AssetChart>
            </div>
            <AssetProfit></AssetProfit>
          </div>
          <div>
            <Tab></Tab>
            <div className="relative px-3.5 py-4 rounded-2xl border border-boxBorder">
              <div className={`${activeTab == 1 ? '' : 'hidden'}`}>
                <Orders></Orders>
              </div>
              <div className={`${activeTab == 2 ? '' : 'hidden'}`}>
                <Positions></Positions>
              </div>
              <div className={`${activeTab == 3 ? '' : 'hidden'}`}>
                <Farms></Farms>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Portfolio;
