import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import {
  list_farmer_seeds,
  get_unclaimed_rewards,
  Seed,
  FarmBoost,
  get_config,
  BoostConfig,
  UserSeedInfo,
  frontConfigBoost,
} from '../../services/farm';
import getConfig from '../../services/config';
import {
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  formatWithCommas,
} from '../../utils/numbers';
import { ftGetTokenMetadata } from '../../services/ft-contract';
import { BigNumber } from 'bignumber.js';

import { TokenMetadata } from '../../services/ft-contract';
import { useTokens } from 'src/state/token';
import { toRealSymbol } from 'src/utils/token';
import { LOVE_TOKEN_DECIMAL } from '../../state/referendum';
import { LinkIcon, FarmMiningIcon } from '../../components/icon/Portfolio';
import QuestionMark from '../../components/farm/QuestionMark';
import { list_liquidities } from '../../services/swapV3';
import {
  getPriceByPoint,
  UserLiquidityInfo,
  get_total_value_by_liquidity_amount_dcl,
  mint_liquidity,
  allocation_rule_liquidities,
  TOKEN_LIST_FOR_RATE,
  displayNumberToAppropriateDecimals,
  get_intersection_radio,
  get_intersection_icon_by_radio,
  get_liquidity_value,
  get_all_seeds,
  get_pool_name,
  openUrl,
} from 'src/services/commonV3';
import { NFTIdIcon } from 'src/components/icon/FarmBoost';
import { PortfolioData } from '../../pages/Portfolio';
import { BlueCircleLoading } from '../../components/layout/Loading';
const { REF_VE_CONTRACT_ID, REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();
import {
  display_value,
  UpDownButton,
  NoDataCard,
  display_value_withCommas,
  useTotalFarmData,
  getAccountId,
} from './Tool';
import { isMobile } from 'src/utils/device';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

const is_mobile = isMobile();
const FarmCommonDatas = createContext(null);
export default function Farms(props: any) {
  const {
    tokenPriceList,
    set_classic_farms_value,
    set_classic_farms_value_done,
    set_dcl_farms_value,
    set_dcl_farms_value_done,
    set_all_farms_quanity,
    set_all_farms_Loading_done,
    all_farms_Loading_done,
    all_farms_quanity,
    user_unclaimed_map,
    set_user_unclaimed_map,
    set_user_unclaimed_map_done,
    user_unclaimed_token_meta_map,
    set_user_unclaimed_token_meta_map,
    dcl_farms_value,
    classic_farms_value,
    dcl_farms_value_done,
    classic_farms_value_done,
    activeTab,
    setActiveTab,
  } = useContext(PortfolioData);
  const intl = useIntl();
  const [classicSeeds, setClassicSeeds] = useState<Seed[]>([]);
  const [dclSeeds, setDclSeeds] = useState<Seed[]>([]);
  let [user_seeds_map, set_user_seeds_map] = useState<
    Record<string, UserSeedInfo>
  >({});
  const [boostConfig, setBoostConfig] = useState<BoostConfig>(null);
  let [your_list_liquidities, set_your_list_liquidities] = useState<
    UserLiquidityInfo[]
  >([]);
  const { globalState } = useContext(WalletContext);
  const accountId = getAccountId();
  const isSignedIn = !!accountId || globalState.isSignedIn;
  useEffect(() => {
    if (isSignedIn) {
      getBoostConfig();
      get_your_seeds();
      get_your_liquidities();
    }
  }, [isSignedIn]);
  const { total_farms_value, total_farms_quantity } = useTotalFarmData({
    dcl_farms_value,
    classic_farms_value,
    dcl_farms_value_done,
    classic_farms_value_done,
    all_farms_Loading_done,
    all_farms_quanity,
  });
  async function getBoostConfig() {
    const config = await get_config();
    const data = config.booster_seeds[REF_VE_CONTRACT_ID];
    setBoostConfig(data);
  }
  async function get_your_seeds() {
    const seeds: Seed[] = await get_all_seeds();
    const { user_seeds_map } = await get_user_seeds_and_unClaimedRewards();
    const { your_dcl_seeds, your_classic_seeds } = searchOutYourSeeds({
      farm_display_List: seeds,
      user_seeds_map,
    });
    setClassicSeeds(your_classic_seeds);
    setDclSeeds(your_dcl_seeds);
    const dcl_legth = your_dcl_seeds.length;
    const classic_length = your_classic_seeds.length;
    if (dcl_legth == 0) {
      set_dcl_farms_value_done(true);
      set_dcl_farms_value('0');
    }
    if (classic_length == 0) {
      set_classic_farms_value_done(true);
      set_classic_farms_value('0');
    }
    set_all_farms_quanity(dcl_legth + classic_length);
    set_all_farms_Loading_done(true);
  }
  async function get_your_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    set_your_list_liquidities(list);
  }
  async function get_user_seeds_and_unClaimedRewards() {
    // get user seeds
    const list_user_seeds = await list_farmer_seeds();
    set_user_seeds_map(list_user_seeds);
    // get user unclaimed rewards
    const userUncliamedRewards = {};
    const seed_ids = Object.keys(list_user_seeds);
    const request: Promise<any>[] = [];
    seed_ids.forEach((seed_id: string) => {
      request.push(get_unclaimed_rewards(seed_id));
    });
    const resolvedList = await Promise.all(request);
    resolvedList.forEach((rewards, index) => {
      if (rewards && Object.keys(rewards).length > 0) {
        userUncliamedRewards[seed_ids[index]] = rewards;
      }
    });
    set_user_unclaimed_map(userUncliamedRewards);
    set_user_unclaimed_map_done(true);
    // get user unclaimed token meta
    const unclaimed_token_meta_datas = {};
    const prom_rewards = Object.values(userUncliamedRewards).map(
      async (rewards) => {
        const tokens = Object.keys(rewards);
        const unclaimedTokens = tokens.map(async (tokenId: string) => {
          const tokenMetadata = await ftGetTokenMetadata(tokenId);
          return tokenMetadata;
        });
        const tempArr = await Promise.all(unclaimedTokens);
        tempArr.forEach((token: TokenMetadata) => {
          unclaimed_token_meta_datas[token.id] = token;
        });
      }
    );
    await Promise.all(prom_rewards);
    set_user_unclaimed_token_meta_map(unclaimed_token_meta_datas);
    return {
      user_seeds_map: list_user_seeds,
      user_uncliamed_rewards: userUncliamedRewards,
      unclaimed_token_meta_datas,
    };
  }
  function searchOutYourSeeds({
    farm_display_List,
    user_seeds_map,
  }: {
    farm_display_List: Seed[];
    user_seeds_map: Record<string, UserSeedInfo>;
  }) {
    const commonSeedFarms = mergeCommonSeedsFarms(farm_display_List);
    const your_dcl_seeds: Seed[] = [];
    const your_classic_seeds: Seed[] = [];
    // filter out your seeds
    farm_display_List.forEach((seed: Seed) => {
      const { seed_id, farmList } = seed;
      const isEnd = farmList[0].status == 'Ended';
      const user_seed = user_seeds_map[seed_id];
      const userStaked = Object.keys(user_seed || {}).length > 0;
      const [contractId] = seed_id.split('@');
      const is_dcl_seed = contractId == REF_UNI_V3_SWAP_CONTRACT_ID;
      if (userStaked) {
        const commonSeedFarmList = commonSeedFarms[seed_id] || [];
        if (!(commonSeedFarmList.length == 2 && isEnd)) {
          if (is_dcl_seed) {
            your_dcl_seeds.push(seed);
          }
          if (!is_dcl_seed) {
            your_classic_seeds.push(seed);
          }
        }
      }
    });
    // sort by apr
    your_dcl_seeds.sort((item1: Seed, item2: Seed) => {
      const item1PoolId = item1.pool.id;
      const item2PoolId = item2.pool.id;
      const item1Front = frontConfigBoost[item1PoolId];
      const item2Front = frontConfigBoost[item2PoolId];
      if (item1Front || item2Front) {
        return Number(item2Front || 0) - Number(item1Front || 0);
      }
      const item1Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item1)));
      const item2Apr = getTotalAprForSeed(JSON.parse(JSON.stringify(item2)));
      return Number(item2Apr) - Number(item1Apr);
    });
    // sort by tvl
    your_classic_seeds.sort((item1: Seed, item2: Seed) => {
      const item1PoolId = item1.pool.id;
      const item2PoolId = item2.pool.id;
      const item1Front = frontConfigBoost[item1PoolId];
      const item2Front = frontConfigBoost[item2PoolId];
      if (item1Front || item2Front) {
        return Number(item2Front || 0) - Number(item1Front || 0);
      }
      return Number(item2.seedTvl) - Number(item1.seedTvl);
    });
    return {
      your_dcl_seeds,
      your_classic_seeds,
    };
  }
  function mergeCommonSeedsFarms(farm_display_List: Seed[]) {
    const tempMap = {};
    const list = JSON.parse(JSON.stringify(farm_display_List));
    list.forEach((seed: Seed) => {
      const { seed_id } = seed;
      tempMap[seed_id] = tempMap[seed_id] || [];
      tempMap[seed_id].push(seed);
    });
    return tempMap;
  }
  function getTotalAprForSeed(seed: Seed) {
    const farms = seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending(seed);
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = +new BigNumber(item.apr).plus(apr).toFixed();
      }
    });
    return apr;
  }
  const loading_status = !all_farms_Loading_done && isSignedIn;
  const noData_status =
    !loading_status &&
    ((all_farms_Loading_done && all_farms_quanity == 0) || !isSignedIn);
  const data_status = all_farms_Loading_done && all_farms_quanity > 0;
  return (
    <>
      <FarmCommonDatas.Provider
        value={{
          classicSeeds,
          dclSeeds,
          user_seeds_map,
          user_unclaimed_map,
          user_unclaimed_token_meta_map,
          boostConfig,
          tokenPriceList,
          your_list_liquidities,
        }}
      >
        <div className="xsm:border-b xsm:border-cardBg">
          {/* for mobile banner */}
          <div
            className="flex items-center justify-between lg:hidden p-5"
            onClick={() => {
              setActiveTab(activeTab == '3' ? '' : '3');
            }}
          >
            <span className="text-base text-white gotham_bold">
              <FormattedMessage id="yield_farming" /> ({total_farms_quantity})
            </span>
            <div className="flex items-center">
              <span className="text-base text-white gotham_bold mr-2">
                {total_farms_value}
              </span>
              <UpDownButton
                set_switch_off={() => {
                  setActiveTab(activeTab == '3' ? '' : '3');
                }}
                switch_off={activeTab != '3'}
              ></UpDownButton>
            </div>
          </div>
          {/* for mobile loading */}
          {loading_status && is_mobile && activeTab == '3' ? (
            <div className={`flex items-center justify-center my-10`}>
              <BlueCircleLoading></BlueCircleLoading>
            </div>
          ) : null}
          {/* for mobile no data */}
          {noData_status && is_mobile && activeTab == '3' ? (
            <NoDataCard
              text={intl.formatMessage({ id: 'yield_farming_appear_here_tip' })}
            />
          ) : null}
          {/* farm list */}
          <div className={`${activeTab == '3' ? '' : 'hidden'}`}>
            <ClassicFarms></ClassicFarms>
            <DclFarms></DclFarms>
          </div>
        </div>

        {/* pc loading */}
        {loading_status && !is_mobile ? (
          <div className="flex items-center justify-center my-20">
            <BlueCircleLoading />
          </div>
        ) : null}
        {/* pc no data */}
        {noData_status && !is_mobile ? (
          <NoDataCard
            text={intl.formatMessage({ id: 'yield_farming_appear_here_tip' })}
          ></NoDataCard>
        ) : null}
      </FarmCommonDatas.Provider>
    </>
  );
}
function DclFarms() {
  const { user_seeds_map, dclSeeds, your_list_liquidities, tokenPriceList } =
    useContext(FarmCommonDatas);
  const { set_dcl_farms_value_done, set_dcl_farms_value } =
    useContext(PortfolioData);
  useEffect(() => {
    if (
      your_list_liquidities.length > 0 &&
      Object.keys(tokenPriceList).length > 0 &&
      dclSeeds.length > 0
    ) {
      const total_value = get_all_seeds_liquidities_value();
      set_dcl_farms_value_done(true);
      set_dcl_farms_value(total_value);
    }
  }, [your_list_liquidities, tokenPriceList, dclSeeds]);
  function get_all_seeds_liquidities_value() {
    let all_liquidities_value = new BigNumber(0);
    dclSeeds.forEach((seed: Seed) => {
      const farming_liquidities = get_inFarming_list_liquidities(seed);
      farming_liquidities.forEach((liquidity: UserLiquidityInfo) => {
        const poolDetail = seed.pool;
        const { tokens_meta_data } = poolDetail;
        const v = get_liquidity_value({
          liquidity,
          poolDetail,
          tokenPriceList,
          tokensMeta: tokens_meta_data,
        });
        all_liquidities_value = all_liquidities_value.plus(v);
      });
    });
    return all_liquidities_value.toFixed();
  }
  function get_inFarming_list_liquidities(seed: Seed) {
    const { free_amount = '0', locked_amount = '0' } =
      user_seeds_map[seed.seed_id] || {};
    const user_seed_amount = new BigNumber(free_amount)
      .plus(locked_amount)
      .toFixed();
    const [temp_farming] = allocation_rule_liquidities({
      list: your_list_liquidities,
      user_seed_amount,
      seed,
    });
    return temp_farming;
  }
  return (
    <>
      {dclSeeds.map((seed: Seed) => {
        return <DclFarmRow seed={seed} key={seed.seed_id}></DclFarmRow>;
      })}
    </>
  );
}
const DCLData = createContext(null);
function DclFarmRow({ seed }: { seed: Seed }) {
  const {
    user_seeds_map,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    tokenPriceList,
    your_list_liquidities,
  } = useContext(FarmCommonDatas);
  const [listLiquidities_inFarimg, set_listLiquidities_inFarimg] = useState<
    UserLiquidityInfo[]
  >([]);
  const [listLiquidities_inFarimg_value, set_listLiquidities_inFarimg_value] =
    useState<string>('0');
  const [switch_off, set_switch_off] = useState<boolean>(true);
  const tokens = sortTokens(seed.pool.tokens_meta_data);
  useEffect(() => {
    get_inFarming_list_liquidities();
  }, [your_list_liquidities]);
  useEffect(() => {
    get_liquidities_in_seed_value();
  }, [listLiquidities_inFarimg, tokenPriceList]);

  const rate_need_to_reverse_display = useMemo(() => {
    const { tokens_meta_data } = seed.pool;
    if (tokens_meta_data) {
      const [tokenX] = tokens_meta_data;
      if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1) return true;
      return false;
    }
  }, [seed]);
  const unclaimedRewardsData = useMemo(() => {
    return getTotalUnclaimedRewards();
  }, [user_unclaimed_map[seed.seed_id], tokenPriceList]);
  function get_inFarming_list_liquidities() {
    if (your_list_liquidities.length > 0) {
      // get farming liquidites of seed;
      const { free_amount = '0', locked_amount = '0' } =
        user_seeds_map[seed.seed_id] || {};
      const user_seed_amount = new BigNumber(free_amount)
        .plus(locked_amount)
        .toFixed();
      const [temp_farming] = allocation_rule_liquidities({
        list: your_list_liquidities,
        user_seed_amount,
        seed,
      });
      set_listLiquidities_inFarimg(temp_farming);
    }
  }
  function get_liquidities_in_seed_value() {
    if (
      Object.keys(tokenPriceList).length > 0 &&
      listLiquidities_inFarimg.length > 0
    ) {
      // get farming liquidites value;
      let total_value = new BigNumber(0);
      listLiquidities_inFarimg.forEach((liquidity: UserLiquidityInfo) => {
        const poolDetail = seed.pool;
        const { tokens_meta_data } = poolDetail;
        const v = get_liquidity_value({
          liquidity,
          poolDetail,
          tokenPriceList,
          tokensMeta: tokens_meta_data,
        });
        total_value = total_value.plus(v);
      });
      set_listLiquidities_inFarimg_value(total_value.toFixed());
    }
  }
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    const tempFarmsRewards = {};
    seed.farmList.forEach((farm: FarmBoost) => {
      const { terms, token_meta_data } = farm;
      const reward_token = terms.reward_token;
      tempFarmsRewards[reward_token] = token_meta_data;
    });
    const unclaimed = user_unclaimed_map[seed.seed_id] || {};
    const unClaimedTokenIds = Object.keys(unclaimed);
    const tokenList: any[] = [];
    if (unClaimedTokenIds?.length == 0) {
      const tokenList_temp: any = Object.values(tempFarmsRewards).reduce(
        (acc: any[], cur) => {
          const temp = {
            token: cur,
            amount: <span className="text-primaryText">0</span>,
          };
          acc.push(temp);
          return acc;
        },
        []
      );
      return {
        worth: <span className="text-primaryText">$0</span>,
        list: tokenList_temp,
      };
    }
    unClaimedTokenIds?.forEach((tokenId: string) => {
      const token: TokenMetadata = user_unclaimed_token_meta_map[tokenId];
      // total price
      const { id, decimals } = token;
      const amount = toReadableNumber(decimals, unclaimed[id] || '0');
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        totalPrice += +amount * tokenPrice;
      }
      // rewards number
      let displayNum;
      if (new BigNumber('0').isEqualTo(amount)) {
        displayNum = <span className="text-primaryText">0</span>;
      } else if (new BigNumber('0.001').isGreaterThan(amount)) {
        displayNum = '<0.001';
      } else {
        displayNum = new BigNumber(amount).toFixed(3, 1);
      }
      const tempTokenData = {
        token,
        amount: displayNum,
      };
      tokenList.push(tempTokenData);
    });
    if (totalPrice == 0) {
      return {
        worth: <span className="text-primaryText">$0</span>,
        list: tokenList,
      };
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      return {
        worth: '<$0.01',
        list: tokenList,
      };
    } else {
      return {
        worth: `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`,
        list: tokenList,
      };
    }
  }
  function displaySymbols() {
    let result = '';
    seed.pool.tokens_meta_data.forEach(
      (token: TokenMetadata, index: number) => {
        const symbol = toRealSymbol(token.symbol);
        if (index == seed.pool.tokens_meta_data.length - 1) {
          result += symbol;
        } else {
          result += symbol + '-';
        }
      }
    );
    return result;
  }
  function displayImgs() {
    const tokenList: any[] = [];
    (tokens || []).forEach((token: TokenMetadata, index: number) => {
      tokenList.push(
        <label
          key={token.id}
          className={`h-7 w-7 rounded-full overflow-hidden border border-gradientFromHover bg-cardBg ${
            index > 0 ? '-ml-1.5' : ''
          }`}
        >
          <img src={token.icon} className="w-full h-full"></img>
        </label>
      );
    });
    return tokenList;
  }
  function getRange() {
    const [contractId, temp_pool_id] = seed.seed_id.split('@');
    const [fixRange, dcl_pool_id, left_point, right_point] =
      temp_pool_id.split('&');
    const [token_x_metadata, token_y_metadata] = seed.pool.tokens_meta_data;
    const decimalRate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let left_price = getPriceByPoint(+left_point, decimalRate);
    let right_price = getPriceByPoint(+right_point, decimalRate);
    let pairsDiv = (
      <span className="text-xs text-primaryText">
        {token_y_metadata.symbol}/{token_x_metadata.symbol}
      </span>
    );
    if (rate_need_to_reverse_display) {
      const temp = left_price;
      left_price = new BigNumber(1).dividedBy(right_price).toFixed();
      right_price = new BigNumber(1).dividedBy(temp).toFixed();
      pairsDiv = (
        <span className="text-xs text-primaryText">
          {token_x_metadata.symbol}/{token_y_metadata.symbol}
        </span>
      );
    }
    const display_left_price = left_price;
    const display_right_price = right_price;
    return (
      <div className="flex items-center whitespace-nowrap">
        <span className="text-xs text-white mr-1">
          {displayNumberToAppropriateDecimals(display_left_price)} -{' '}
          {displayNumberToAppropriateDecimals(display_right_price)}
        </span>
        {pairsDiv}
      </div>
    );
  }
  return (
    <DCLData.Provider
      value={{
        switch_off,
        displayImgs,
        displaySymbols,
        seed,
        listLiquidities_inFarimg_value,
        unclaimedRewardsData,
        set_switch_off,
        getRange,
        listLiquidities_inFarimg,
        tokens,
        rate_need_to_reverse_display,
      }}
    >
      {is_mobile ? (
        <DclFarmRowMobile></DclFarmRowMobile>
      ) : (
        <DclFarmRowPc></DclFarmRowPc>
      )}
    </DCLData.Provider>
  );
}
function DclFarmRowMobile() {
  const {
    switch_off,
    displayImgs,
    displaySymbols,
    seed,
    listLiquidities_inFarimg_value,
    unclaimedRewardsData,
    set_switch_off,
    getRange,
    listLiquidities_inFarimg,
    tokens,
    rate_need_to_reverse_display,
  } = useContext(DCLData);
  return (
    <div
      className={`rounded-xl mt-3 mx-4 ${
        switch_off
          ? 'bg-portfolioBgColor'
          : 'border border-border_light_grey_color bg-portfolioBarBgColor'
      }`}
    >
      <div className="flex flex-col justify-between h-20 p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center flex-shrink-0 mr-2.5">
              {displayImgs()}
            </div>
            <span className="text-white font-bold text-sm gotham_bold">
              {displaySymbols()}
            </span>
          </div>
          <span className="text-white text-sm gotham_bold">
            {display_value(listLiquidities_inFarimg_value)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="flex items-center justify-center text-xs text-v3SwapGray bg-selectTokenV3BgColor rounded-md px-1.5 mr-1.5 py-0.5">
              DCL
            </span>
            <span
              className="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-selectTokenV3BgColor cursor-pointer text-primaryText text-xs"
              onClick={() => {
                goFarmDetailPage(seed);
              }}
            >
              Farm
              <LinkIcon className="ml-1"></LinkIcon>
            </span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-1.5">
              <FarmMiningIcon className="m-1.5"></FarmMiningIcon>
              <span className="text-xs text-portfolioGreenColor gotham_bold">
                {unclaimedRewardsData.worth}
              </span>
            </div>
            <UpDownButton
              set_switch_off={() => {
                set_switch_off(!switch_off);
              }}
              switch_off={switch_off}
            ></UpDownButton>
          </div>
        </div>
      </div>
      <div
        className={`py-4 border-t border-limitOrderFeeTiersBorderColor ${
          switch_off ? 'hidden' : ''
        }`}
      >
        {/* border-b border-limitOrderFeeTiersBorderColor  */}
        <div className="pb-5 px-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primaryText">
              <FormattedMessage id="farm_reward_range" />
            </span>
            <div className="flex items-center">{getRange()}</div>
          </div>
          <div
            className={`flex justify-between mt-5 ${
              unclaimedRewardsData.list.length > 2
                ? 'items-start'
                : 'items-center'
            }`}
          >
            <span className="text-sm text-primaryText">
              <FormattedMessage id="unclaimed_farm_rewards" />
            </span>
            <div
              className={`flex items-center ${
                unclaimedRewardsData.list.length > 2
                  ? 'grid grid-cols-2 gap-x-3 gap-y-2'
                  : ''
              }`}
            >
              {unclaimedRewardsData.list.map(
                (
                  {
                    token,
                    amount,
                  }: { token: TokenMetadata; amount: JSX.Element },
                  index: number
                ) => {
                  return (
                    <div
                      key={`m_${token.id}_${index}`}
                      className={`flex items-center ${
                        unclaimedRewardsData.list.length <= 2
                          ? index == unclaimedRewardsData.list.length - 1
                            ? ''
                            : 'mr-3.5'
                          : ''
                      }`}
                    >
                      <img
                        src={token.icon}
                        className={`w-5 h-5 border border-greenColor rounded-full mr-1.5`}
                      ></img>
                      <span className={`text-sm text-white`}>{amount}</span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function DclFarmRowPc() {
  const {
    switch_off,
    displayImgs,
    displaySymbols,
    seed,
    listLiquidities_inFarimg_value,
    unclaimedRewardsData,
    set_switch_off,
    getRange,
    listLiquidities_inFarimg,
    tokens,
    rate_need_to_reverse_display,
  } = useContext(DCLData);
  return (
    <div
      className={`rounded-xl mt-3 bg-portfolioBgColor px-5 ${
        switch_off ? '' : 'pb-4'
      }`}
    >
      <div className="flex items-center justify-between h-14">
        <div className="flex items-center">
          <div className="flex items-center flex-shrink-0 mr-2.5">
            {displayImgs()}
          </div>
          <span className="text-white font-bold text-sm gotham_bold">
            {displaySymbols()}
          </span>
          <span className="flex items-center justify-center text-xs text-v3SwapGray bg-selectTokenV3BgColor rounded-md px-1.5 mx-1.5 py-0.5">
            DCL
          </span>
          <span
            className="flex items-center justify-center h-5 w-5 rounded-md bg-selectTokenV3BgColor cursor-pointer text-primaryText hover:text-white"
            onClick={() => {
              goFarmDetailPage(seed);
            }}
          >
            <LinkIcon></LinkIcon>
          </span>
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-end mr-5">
            <span className="text-white text-sm gotham_bold">
              {display_value(listLiquidities_inFarimg_value)}
            </span>
            <div className="flex items-center">
              <FarmMiningIcon className="m-1.5"></FarmMiningIcon>
              <span className="text-xs text-portfolioGreenColor gotham_bold">
                {unclaimedRewardsData.worth}
              </span>
            </div>
          </div>
          <UpDownButton
            set_switch_off={() => {
              set_switch_off(!switch_off);
            }}
            switch_off={switch_off}
          ></UpDownButton>
        </div>
      </div>
      <div className={`${switch_off ? 'hidden' : ''}`}>
        {/* border-b border-gray1  */}
        <div className="pb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primaryText">
              <FormattedMessage id="farm_reward_range" />
            </span>
            <div className="flex items-center">{getRange()}</div>
          </div>
          <div className="flex items-center justify-between mt-5">
            <span className="text-sm text-primaryText">
              <FormattedMessage id="unclaimed_farm_rewards" />
            </span>
            <div className="flex items-center">
              {unclaimedRewardsData.list.map(
                (
                  {
                    token,
                    amount,
                  }: { token: TokenMetadata; amount: JSX.Element },
                  index: number
                ) => {
                  return (
                    <div
                      key={`pc_${token.id}_${index}`}
                      className={`flex items-center ${
                        index == unclaimedRewardsData.list.length - 1
                          ? ''
                          : 'mr-4'
                      }`}
                    >
                      <img
                        src={token.icon}
                        className={`w-5 h-5 border border-greenColor rounded-full mr-1.5`}
                      ></img>
                      <span className={`text-sm text-white gotham_bold`}>
                        {amount}
                      </span>
                    </div>
                  );
                }
              )}
              <span
                className={`tex-sm text-portfolioQinColor pl-3.5 ml-3.5 ${
                  unclaimedRewardsData.list.length == 0
                    ? ''
                    : 'border-l border-orderTypeBg'
                }`}
              >
                {unclaimedRewardsData.worth}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function LiquidityLine(props: {
  liquidity: UserLiquidityInfo;
  seed: Seed;
  tokens: TokenMetadata[];
  rate_need_to_reverse_display: boolean;
}) {
  const { tokenPriceList } = useContext(FarmCommonDatas);
  const { liquidity, seed, tokens, rate_need_to_reverse_display } = props;
  useEffect(() => {
    get_each_token_apr_for_nft();
  }, [seed, tokenPriceList, liquidity]);

  function get_liquidity_value(liquidity: UserLiquidityInfo) {
    const { left_point, right_point, amount } = liquidity;
    const poolDetail = seed.pool;
    const { token_x, token_y } = poolDetail;
    const v = get_total_value_by_liquidity_amount_dcl({
      left_point,
      right_point,
      poolDetail,
      amount,
      price_x_y: {
        [token_x]: tokenPriceList[token_x]?.price || '0',
        [token_y]: tokenPriceList[token_y]?.price || '0',
      },
      metadata_x_y: {
        [token_x]: tokens[0],
        [token_y]: tokens[1],
      },
    });
    return v;
  }
  function get_liquidity_value_display(liquidity: UserLiquidityInfo) {
    const v = get_liquidity_value(liquidity);
    return display_value_withCommas(v);
  }
  function get_your_range(liquidity: UserLiquidityInfo, site?: string) {
    const { left_point, right_point } = liquidity;
    const [token_x_metadata, token_y_metadata] = seed.pool.tokens_meta_data;
    const [fixRange, dcl_pool_id, seed_left_point, seed_right_point] =
      seed.seed_id.split('@')[1].split('&');
    let icon;
    const radio = get_intersection_radio({
      left_point_liquidity: left_point,
      right_point_liquidity: right_point,
      left_point_seed: seed_left_point,
      right_point_seed: seed_right_point,
    });
    const p = new BigNumber(radio);
    const Icon = get_intersection_icon_by_radio(radio);
    icon = <Icon num={Math.random()}></Icon>;
    const decimalRate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let left_price = getPriceByPoint(+left_point, decimalRate);
    let right_price = getPriceByPoint(+right_point, decimalRate);
    if (rate_need_to_reverse_display) {
      const temp = left_price;
      left_price = new BigNumber(1).dividedBy(right_price).toFixed();
      right_price = new BigNumber(1).dividedBy(temp).toFixed();
    }
    const display_left_price = left_price;
    const display_right_price = right_price;
    function rangeTip() {
      const tip =
        'The intersection of your price range and the farm reward range.';
      let result: string = `<div class="text-farmText text-xs w-52 text-left">${tip}</div>`;
      return result;
    }
    function displayP(p: BigNumber) {
      if (p.isEqualTo(0)) {
        return '0%';
      } else if (p.isLessThan(1)) {
        return '1%';
      } else {
        return p?.toFixed(0, 1) + '%';
      }
    }
    return (
      <div className="flex items-center">
        <span className="text-sm mr-1.5">
          {displayNumberToAppropriateDecimals(display_left_price)} ~{' '}
          {displayNumberToAppropriateDecimals(display_right_price)}
        </span>
        <div
          className="text-white text-right"
          data-class="reactTip"
          data-tooltip-id={'rewardPerWeekQId'}
          data-place="top"
          data-tooltip-html={rangeTip()}
        >
          <span className="flex items-center text-xs text-primaryText">
            {icon}
            <label className="ml-1 xsm:hidden">{displayP(p)}</label>
          </span>
          <CustomTooltip id={'rewardPerWeekQId'} />
        </div>
      </div>
    );
  }
  function get_each_token_apr_for_nft() {
    const { farmList, total_seed_amount, total_seed_power } = seed;
    // principal
    const total_principal = get_liquidity_value(liquidity);
    // lp percent
    let percent: BigNumber = new BigNumber(0);
    const mint_amount = mint_liquidity(liquidity, seed.seed_id);
    const part_farm_ratio = liquidity.part_farm_ratio;
    if (+part_farm_ratio == 100) {
      // full farming
      if (+total_seed_power > 0) {
        percent = new BigNumber(mint_amount).dividedBy(total_seed_power);
      }
    } else if (+part_farm_ratio > 0 && +part_farm_ratio < 100) {
      // partial Farming
      if (+total_seed_power > 0) {
        const partial_amount = new BigNumber(mint_amount)
          .multipliedBy(part_farm_ratio)
          .dividedBy(100);
        percent = partial_amount.dividedBy(total_seed_power);
      }
    } else {
      // unFarming, unavailable
      const temp_total = new BigNumber(total_seed_power || 0).plus(mint_amount);
      if (temp_total.isGreaterThan(0)) {
        percent = new BigNumber(mint_amount).dividedBy(temp_total);
      }
    }
    // get apr per token
    const farmList_parse = JSON.parse(JSON.stringify(farmList || []));
    farmList_parse.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      const { daily_reward, reward_token } = farm.terms;
      const quantity = toReadableNumber(token_meta_data.decimals, daily_reward);
      const reward_token_price = Number(
        tokenPriceList[reward_token]?.price || 0
      );
      const cur_token_rewards = new BigNumber(quantity)
        .multipliedBy(reward_token_price)
        .multipliedBy(365);
      const user_can_get_token_rewards = new BigNumber(
        cur_token_rewards
      ).multipliedBy(percent);
      if (+total_principal > 0) {
        farm.yourNFTApr = new BigNumber(user_can_get_token_rewards)
          .dividedBy(total_principal)
          .toFixed();
      } else {
        farm.yourNFTApr = '0';
      }
    });
    liquidity.farmList = farmList_parse;
  }
  function get_your_total_apr() {
    const farms = liquidity.farmList || [];
    let apr = new BigNumber(0);
    const allPendingFarms = isPending(seed);
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || !pendingFarm) {
        apr = new BigNumber(apr).plus(item.yourNFTApr || 0);
      }
    });
    return apr.multipliedBy(100).toFixed();
  }
  function display_your_apr() {
    const total_apr = new BigNumber(get_your_total_apr());
    if (total_apr.isEqualTo('0')) {
      return '0%';
    } else if (total_apr.isLessThan(0.01)) {
      return `<0.01%`;
    } else {
      return `${toPrecision(total_apr.toFixed(), 2)}%`;
    }
  }
  function goYourLiquidityDetail(liquidity: UserLiquidityInfo) {
    const pool_id = liquidity.lpt_id.split('#')[0];
    const lpt_index = liquidity.lpt_id.split('#')[1];
    openUrl(`/yoursLiquidityDetailV2/${get_pool_name(pool_id)}@${lpt_index}`);
  }
  return (
    <>
      {/* for PC */}
      <div className="relative xsm:hidden" key={liquidity.lpt_id}>
        <div className="absolute -top-1.5 left-5 flex items-center justify-center">
          <NFTIdIcon></NFTIdIcon>
          <span className="absolute gotham_bold text-xs text-white">
            NFT ID #{liquidity.lpt_id.split('#')[1]}
          </span>
        </div>
        <div className="bg-v3HoverDarkBgColor rounded-xl mb-5 overflow-hidden">
          <div className="flex items-stretch justify-between pt-7 pb-3.5 px-6">
            <div className="flex flex-col justify-between col-span-1 items-start">
              <div className="flex items-center">
                <span className="text-sm text-primaryText mr-1">
                  <FormattedMessage id="your_liquidity" />
                </span>
                <span
                  className="flex items-center justify-center h-5 w-5 rounded-md bg-selectTokenV3BgColor cursor-pointer text-primaryText hover:text-white"
                  onClick={() => {
                    goYourLiquidityDetail(liquidity);
                  }}
                >
                  <LinkIcon></LinkIcon>
                </span>
              </div>
              <span className={`text-sm mt-2.5 text-white`}>
                {get_liquidity_value_display(liquidity)}
              </span>
            </div>
            <div className="flex flex-col justify-between  col-span-1 items-start">
              <span className="text-sm text-primaryText">
                <FormattedMessage id="your_price_range" />
              </span>
              <span className={`text-sm text-white`}>
                {get_your_range(liquidity, 'pc')}
              </span>
            </div>
            <div className="flex flex-col justify-between col-span-1 items-start">
              <span className="flex items-center text-sm text-primaryText">
                <FormattedMessage id="your_apr" />
              </span>
              <span className="text-sm text-white">{display_your_apr()}</span>
            </div>
          </div>
        </div>
      </div>
      {/* for Mobile */}
      <div
        key={liquidity.lpt_id + 'm'}
        className="relative flex flex-col items-center mb-5 lg:hidden"
      >
        <div className="absolute -top-1.5 flex items-center justify-center">
          <NFTIdIcon></NFTIdIcon>
          <span className="absolute gotham_bold text-xs text-white">
            NFT ID #{liquidity.lpt_id.split('#')[1]}
          </span>
        </div>
        <div className="bg-v3HoverDarkBgColor rounded-xl px-4 py-3 w-full">
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <span className="text-sm text-primaryText mr-1">
                <FormattedMessage id="your_liquidity" />
              </span>
              <span
                className="flex items-center justify-center h-5 w-5 rounded-md bg-selectTokenV3BgColor cursor-pointer text-primaryText"
                onClick={() => {
                  goYourLiquidityDetail(liquidity);
                }}
              >
                <LinkIcon></LinkIcon>
              </span>
            </div>
            <span className={`text-sm text-white`}>
              {get_liquidity_value_display(liquidity)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-primaryText">
              <FormattedMessage id="your_price_range" />
            </span>
            <span className={`text-sm text-white`}>
              {get_your_range(liquidity, 'mobile')}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-sm text-primaryText">
              <FormattedMessage id="your_apr" />
            </div>
            <span className={`text-sm text-white`}>{display_your_apr()}</span>
          </div>
        </div>
      </div>
    </>
  );
}
function ClassicFarms() {
  const { set_classic_farms_value_done, set_classic_farms_value } =
    useContext(PortfolioData);
  const { classicSeeds, user_seeds_map } = useContext(FarmCommonDatas);
  useEffect(() => {
    if (classicSeeds.length > 0) {
      const total_value = get_all_seeds_liquidities_value();
      set_classic_farms_value_done(true);
      set_classic_farms_value(total_value);
    }
  }, [classicSeeds]);
  function get_all_seeds_liquidities_value() {
    let total_value = new BigNumber(0);
    classicSeeds.forEach((seed: Seed) => {
      const v = getYourTvl(seed);
      total_value = total_value.plus(v);
    });
    return total_value.toFixed();
  }
  function getYourTvl(seed: Seed) {
    const { pool, seed_id, seed_decimal } = seed;
    const { free_amount = '0', locked_amount = '0' } =
      user_seeds_map[seed_id] || {};
    const { tvl, shares_total_supply } = pool;
    const amount = new BigNumber(free_amount || 0)
      .plus(locked_amount || 0)
      .toFixed();
    const poolShares = toReadableNumber(seed_decimal, shares_total_supply);
    const yourLpAmount = toReadableNumber(seed_decimal, amount);
    const yourTvl =
      +poolShares == 0
        ? '0'
        : new BigNumber(yourLpAmount)
            .multipliedBy(tvl)
            .dividedBy(poolShares)
            .toFixed();
    return yourTvl;
  }
  return (
    <>
      {classicSeeds.map((seed: Seed) => {
        return <ClassicFarmRow seed={seed} key={seed.seed_id}></ClassicFarmRow>;
      })}
    </>
  );
}
const ClassicData = createContext(null);
function ClassicFarmRow({ seed }: { seed: Seed }) {
  const {
    user_seeds_map,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    boostConfig,
    tokenPriceList,
  } = useContext(FarmCommonDatas);
  const { pool, seedTvl, seed_id, seed_decimal } = seed;
  const {
    free_amount = '0',
    x_locked_amount = '0',
    locked_amount = '0',
  } = user_seeds_map[seed_id] || {};
  const { token_account_ids } = pool;
  const tokens = sortTokens(useTokens(token_account_ids) || []);
  const [switch_off, set_switch_off] = useState<boolean>(true);
  const intl = useIntl();
  const unclaimedRewardsData = useMemo(() => {
    return getTotalUnclaimedRewards();
  }, [user_unclaimed_map[seed_id], tokenPriceList]);
  function getTotalUnclaimedRewards() {
    let totalPrice = 0;
    const tempFarmsRewards = {};
    seed.farmList.forEach((farm: FarmBoost) => {
      const { terms, token_meta_data } = farm;
      const reward_token = terms.reward_token;
      tempFarmsRewards[reward_token] = token_meta_data;
    });
    const unclaimed = user_unclaimed_map[seed_id] || {};
    const unClaimedTokenIds = Object.keys(unclaimed);
    const tokenList: any[] = [];
    if (unClaimedTokenIds?.length == 0) {
      const tokenList_temp: any = Object.values(tempFarmsRewards).reduce(
        (acc: any[], cur) => {
          const temp = {
            token: cur,
            amount: <span className="text-primaryText">0</span>,
          };
          acc.push(temp);
          return acc;
        },
        []
      );
      return {
        worth: <span className="text-primaryText">$0</span>,
        list: tokenList_temp,
      };
    }
    unClaimedTokenIds?.forEach((tokenId: string) => {
      const token: TokenMetadata = user_unclaimed_token_meta_map[tokenId];
      // total price
      const { id, decimals, icon } = token;
      const amount = toReadableNumber(decimals, unclaimed[id] || '0');
      const tokenPrice = tokenPriceList[id]?.price;
      if (tokenPrice && tokenPrice != 'N/A') {
        totalPrice += +amount * tokenPrice;
      }
      // rewards number
      let displayNum = '';
      if (new BigNumber('0').isEqualTo(amount)) {
        displayNum = '-';
      } else if (new BigNumber('0.001').isGreaterThan(amount)) {
        displayNum = '<0.001';
      } else {
        displayNum = new BigNumber(amount).toFixed(3, 1);
      }
      const tempTokenData = {
        token,
        amount: displayNum,
      };
      tokenList.push(tempTokenData);
    });
    if (totalPrice == 0) {
      return {
        worth: <label>$0</label>,
        list: tokenList,
      };
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      return {
        worth: '<$0.01',
        list: tokenList,
      };
    } else {
      return {
        worth: `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`,
        list: tokenList,
      };
    }
  }
  function displayImgs() {
    const tokenList: any[] = [];
    (tokens || []).forEach((token: TokenMetadata, index: number) => {
      tokenList.push(
        <img
          key={token.id + index}
          src={token.icon}
          className={`relative w-7 h-7 xsm:w-6 xsm:h-6 border border-greenColor rounded-full ${
            index > 0 ? '-ml-1.5' : ''
          }`}
        ></img>
      );
    });
    return tokenList;
  }
  function displaySymbols() {
    let result = '';
    pool.tokens_meta_data.forEach((token: TokenMetadata, index: number) => {
      const symbol = toRealSymbol(token.symbol);
      if (index == pool.tokens_meta_data.length - 1) {
        result += symbol;
      } else {
        result += symbol + '-';
      }
    });
    return result;
  }
  function getTotalStaked() {
    return Number(seedTvl) == 0
      ? '-'
      : `$${toInternationalCurrencySystem(seedTvl, 2)}`;
  }
  function showLpPower() {
    const power = getUserPower();
    const powerBig = new BigNumber(power);
    if (powerBig.isEqualTo(0)) {
      return <label className="opacity-50">{'0.0'}</label>;
    } else if (powerBig.isLessThan('0.01')) {
      return '<0.01';
    } else {
      return formatWithCommas(toPrecision(power, 2));
    }
  }
  function getUserPower() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return '';
    let realRadio;
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = seed;
    const love_user_seed = user_seeds_map[REF_VE_CONTRACT_ID];
    const base = affected_seeds[seed_id];
    if (base) {
      const { free_amount = 0, locked_amount = 0 } = love_user_seed || {};
      const totalStakeLoveAmount = toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        new BigNumber(free_amount).plus(locked_amount).toFixed()
      );
      if (+totalStakeLoveAmount > 0) {
        if (+totalStakeLoveAmount < 1) {
          realRadio = 1;
        } else {
          realRadio = new BigNumber(1)
            .plus(Math.log(+totalStakeLoveAmount) / Math.log(base))
            .toFixed();
        }
      }
    }
    const powerBig = new BigNumber(+(realRadio || 1))
      .multipliedBy(free_amount)
      .plus(x_locked_amount);
    const power = toReadableNumber(
      seed_decimal,
      powerBig.toFixed(0).toString()
    );
    return power;
  }
  function getUserLpPercent() {
    let result = '(-%)';
    const { total_seed_power } = seed;
    const userPower = getUserPower();
    if (+total_seed_power && +userPower) {
      const totalAmount = toReadableNumber(seed_decimal, total_seed_power);
      const percent = new BigNumber(userPower)
        .dividedBy(totalAmount)
        .multipliedBy(100);
      if (percent.isLessThan('0.001')) {
        result = '<0.001%';
      } else {
        result = `${toPrecision(percent.toFixed().toString(), 3)}%`;
      }
    }
    return result;
  }
  function getPowerTip() {
    if (REF_VE_CONTRACT_ID && !boostConfig) return '';
    const { affected_seeds = {} } = boostConfig || {};
    const { seed_id } = seed;
    const base = affected_seeds[seed_id];
    const tip = intl.formatMessage({
      id: base ? 'farm_has_boost_tip' : 'farm_no_boost_tip',
    });
    let result: string = `<div class="text-navHighLightText text-xs w-52 xsm:w-32 text-left">${tip}</div>`;
    return result;
  }
  function getYourTvl() {
    const { tvl, shares_total_supply } = pool;
    const amount = new BigNumber(free_amount || 0)
      .plus(locked_amount || 0)
      .toFixed();
    const poolShares = toReadableNumber(seed_decimal, shares_total_supply);
    const yourLpAmount = toReadableNumber(seed_decimal, amount);
    const yourTvl =
      +poolShares == 0
        ? '0'
        : new BigNumber(yourLpAmount)
            .multipliedBy(tvl)
            .dividedBy(poolShares)
            .toFixed();
    return '$' + toInternationalCurrencySystem(yourTvl, 2);
  }
  return (
    <ClassicData.Provider
      value={{
        switch_off,
        set_switch_off,
        displayImgs,
        displaySymbols,
        seed,
        getYourTvl,
        unclaimedRewardsData,
        getPowerTip,
        showLpPower,
        getUserLpPercent,
      }}
    >
      {is_mobile ? (
        <ClassicFarmRowMobile></ClassicFarmRowMobile>
      ) : (
        <ClassicFarmRowPc></ClassicFarmRowPc>
      )}
    </ClassicData.Provider>
  );
}
function ClassicFarmRowMobile() {
  const {
    switch_off,
    set_switch_off,
    displayImgs,
    displaySymbols,
    seed,
    getYourTvl,
    unclaimedRewardsData,
    getPowerTip,
    showLpPower,
    getUserLpPercent,
  } = useContext(ClassicData);
  return (
    <div
      className={`rounded-xl mt-3 mx-4 ${
        switch_off
          ? 'bg-portfolioBgColor'
          : 'border border-border_light_grey_color bg-portfolioBarBgColor'
      }`}
    >
      <div className="flex flex-col justify-between h-20 p-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center flex-shrink-0 mr-1.5">
              {displayImgs()}
            </div>
            <span className="text-white font-bold text-sm gotham_bold">
              {displaySymbols()}
            </span>
          </div>
          <span className="text-white text-sm gotham_bold">{getYourTvl()}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="flex items-center justify-center text-xs text-v3SwapGray bg-selectTokenV3BgColor rounded-md px-1.5 py-0.5 mr-1.5">
              <FormattedMessage id="classic" />
            </span>
            <span
              className="flex items-center justify-center px-1.5 py-0.5 rounded-md bg-selectTokenV3BgColor text-xs cursor-pointer text-primaryText"
              onClick={() => {
                goFarmDetailPage(seed);
              }}
            >
              Farm
              <LinkIcon className="ml-1"></LinkIcon>
            </span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-1.5">
              <FarmMiningIcon className="m-1.5"></FarmMiningIcon>
              <span className="text-xs text-portfolioGreenColor gotham_bold">
                {unclaimedRewardsData.worth}
              </span>
            </div>
            <UpDownButton
              set_switch_off={() => {
                set_switch_off(!switch_off);
              }}
              switch_off={switch_off}
            ></UpDownButton>
          </div>
        </div>
      </div>
      <div
        className={`px-2.5 py-4 border-t border-limitOrderFeeTiersBorderColor ${
          switch_off ? 'hidden' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-v3SwapGray">
            <FormattedMessage id="usd_value_staked" />
          </span>
          <span className="text-sm text-white">{getYourTvl()}</span>
        </div>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <span className="text-sm text-v3SwapGray">
              <FormattedMessage id="your_power" />
            </span>
            <div
              className="text-white text-right ml-1"
              data-class="reactTip"
              data-tooltip-id="powerTipId"
              data-place="top"
              data-tooltip-html={getPowerTip()}
            >
              <QuestionMark></QuestionMark>
              <CustomTooltip id="powerTipId" />
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-white">{showLpPower()}</span>
            <span className="text-xs text-primaryText mt-0.5">
              ({getUserLpPercent()})
            </span>
          </div>
        </div>
        <div
          className={`flex justify-between ${
            unclaimedRewardsData.list.length > 2
              ? 'items-start'
              : 'items-center'
          }`}
        >
          <span className="text-sm text-v3SwapGray">
            <FormattedMessage id="unclaimed_farm_rewards" />
          </span>
          <div
            className={`flex items-center ${
              unclaimedRewardsData.list.length > 2
                ? 'grid grid-cols-2 gap-x-3 gap-y-2'
                : ''
            }`}
          >
            {unclaimedRewardsData.list.map(
              (
                { token, amount }: { token: TokenMetadata; amount: string },
                index: number
              ) => {
                return (
                  <div
                    className="flex items-center"
                    key={`m_${token.id}_${index}`}
                  >
                    <img
                      src={token.icon}
                      className={`w-5 h-5 border border-greenColor rounded-full mr-1.5`}
                    ></img>
                    <span
                      className={`text-sm text-white ${
                        unclaimedRewardsData.list.length <= 2
                          ? index == unclaimedRewardsData.list.length - 1
                            ? ''
                            : 'mr-3.5'
                          : ''
                      }`}
                    >
                      {amount}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function ClassicFarmRowPc() {
  const {
    switch_off,
    set_switch_off,
    displayImgs,
    displaySymbols,
    seed,
    getYourTvl,
    unclaimedRewardsData,
    getPowerTip,
    showLpPower,
    getUserLpPercent,
  } = useContext(ClassicData);
  return (
    <div
      className={`rounded-xl mt-3 bg-portfolioBgColor px-5 ${
        switch_off ? '' : 'pb-4'
      }`}
    >
      <div className="flex items-center justify-between h-14">
        <div className="flex items-center">
          <div className="flex items-center flex-shrink-0 mr-2.5">
            {displayImgs()}
          </div>
          <span className="text-white font-bold text-sm gotham_bold">
            {displaySymbols()}
          </span>
          <span className="flex items-center justify-center text-xs text-v3SwapGray bg-selectTokenV3BgColor rounded-md px-1.5 mx-1.5 py-0.5">
            <FormattedMessage id="classic" />
          </span>
          <span
            className="flex items-center justify-center h-5 w-5 rounded-md bg-selectTokenV3BgColor cursor-pointer text-primaryText hover:text-white"
            onClick={() => {
              goFarmDetailPage(seed);
            }}
          >
            <LinkIcon></LinkIcon>
          </span>
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-end mr-5">
            <span className="text-white text-sm gotham_bold">
              {getYourTvl()}
            </span>
            <div className="flex items-center">
              <FarmMiningIcon className="m-1.5"></FarmMiningIcon>
              <span className="text-xs text-portfolioGreenColor gotham_bold">
                {unclaimedRewardsData.worth}
              </span>
            </div>
          </div>
          <UpDownButton
            set_switch_off={() => {
              set_switch_off(!switch_off);
            }}
            switch_off={switch_off}
          ></UpDownButton>
        </div>
      </div>
      <div className={`${switch_off ? 'hidden' : ''}`}>
        <div className="bg-primaryText rounded-xl px-3.5 py-5 bg-opacity-10 mt-3">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-v3SwapGray">
              <FormattedMessage id="usd_value_staked" />
            </span>
            <span className="text-sm text-white">{getYourTvl()}</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <span className="text-sm text-v3SwapGray">
                <FormattedMessage id="your_power" />
              </span>
              <div
                className="text-white text-right ml-1"
                data-class="reactTip"
                data-tooltip-id="powerTipId"
                data-place="top"
                data-tooltip-html={getPowerTip()}
              >
                <QuestionMark></QuestionMark>
                <CustomTooltip id="powerTipId" />
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-white">{showLpPower()}</span>
              <span className="text-xs text-primaryText mt-0.5">
                ({getUserLpPercent()})
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-v3SwapGray">
              <FormattedMessage id="unclaimed_farm_rewards" />
            </span>
            <div className="flex items-center">
              {unclaimedRewardsData.list.map(
                (
                  { token, amount }: { token: TokenMetadata; amount: string },
                  index: number
                ) => {
                  return (
                    <div
                      key={`pc_${token.id}_${index}`}
                      className={`flex items-center ${
                        index == unclaimedRewardsData.list.length - 1
                          ? ''
                          : 'mr-4'
                      }`}
                    >
                      <img
                        src={token.icon}
                        className={`w-5 h-5 border border-greenColor rounded-full mr-1.5`}
                      ></img>
                      <span className={`text-sm text-white gotham_bold`}>
                        {amount}
                      </span>
                    </div>
                  );
                }
              )}
              <span className="tex-sm text-portfolioQinColor pl-3.5 border-l border-orderTypeBg ml-3.5">
                {unclaimedRewardsData.worth}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function sortTokens(tokens: TokenMetadata[]) {
  tokens.sort((a: TokenMetadata, b: TokenMetadata) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
    return 0;
  });
  return tokens;
}
function goFarmDetailPage(seed: Seed) {
  const poolId = getPoolIdBySeedId(seed.seed_id);
  const status = seed.farmList[0].status == 'Ended' ? 'e' : 'r';
  let mft_id = poolId;
  let is_dcl_pool = false;
  const [contractId, temp_pool_id] = seed.seed_id.split('@');
  if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
    is_dcl_pool = true;
  }
  if (is_dcl_pool) {
    const [fixRange, pool_id, left_point, right_point] =
      temp_pool_id.split('&');
    mft_id = `${get_pool_name(pool_id)}[${left_point}-${right_point}]`;
  }
  openUrl(`/v2farms/${mft_id}-${status}`);
}
function getPoolIdBySeedId(seed_id: string) {
  const [contractId, temp_pool_id] = seed_id.split('@');
  if (temp_pool_id) {
    if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
      const [fixRange, dcl_pool_id, left_point, right_point] =
        temp_pool_id.split('&');
      return dcl_pool_id;
    } else {
      return temp_pool_id;
    }
  }
  return '';
}
function isPending(seed: Seed) {
  let pending: boolean = true;
  const farms = seed.farmList;
  for (let i = 0; i < farms.length; i++) {
    if (farms[i].status != 'Created' && farms[i].status != 'Pending') {
      pending = false;
      break;
    }
  }
  return pending;
}
