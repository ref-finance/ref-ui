import React, { useState, useEffect, useContext, createContext } from 'react';
import Big from 'big.js';
import {
  Seed,
  UserSeedInfo,
  getBoostTokenPrices,
  FarmBoost,
} from '../../services/farm';

import {
  TokenMetadata,
  ftGetTokenMetadata,
  ftGetBalance,
} from '../../services/ft-contract';
import {
  list_seeds_info,
  list_seed_farms,
  list_farmer_seeds,
  list_farmer_withdraws,
  get_unclaimed_rewards,
  get_config,
  IFarmerWithdraw,
  IMemefarmConfig,
  xref_list_seeds_info,
  xref_list_farmer_seeds,
  xref_list_seed_farms,
  get_xref_unclaimed_rewards,
  xref_list_farmer_withdraws,
  get_xref_config,
  get_donate_list,
} from '../../services/meme';
import {
  getMemeDataConfig,
  getMemeContractConfig,
} from '../../components/meme/memeConfig';

import { toReadableNumber } from 'src/utils/numbers';
import { WalletContext } from '../../utils/wallets-integration';
import { get_all_seeds } from '../../services/commonV3';
import { ChartLoading } from 'src/components/icon/Loading';
const MemeContext = createContext<IMemeContext>(null);
interface IMemeContext {
  tokenPriceList: Record<string, any>;
  seeds: Record<string, Seed>;
  allTokenMetadatas: Record<string, TokenMetadata>;
  user_balances: Record<string, string>;
  memeContractConfig: IMemefarmConfig;
  xrefContractConfig: Record<string, IMemefarmConfig>;
  lpSeeds: Record<string, Seed>;
  xrefSeeds: Record<string, Seed>;
  xrefFarmContractUserData: Record<string, IFarmAccount>;
  memeFarmContractUserData: IFarmAccount;
  xrefTokenId: string;
  donateBalances: Record<string, string>;
  loading: boolean;
}
export interface IFarmAccount {
  withdraw_list: Record<string, IFarmerWithdraw>;
  unclaimed_rewards: Record<string, any>;
  join_seeds: Record<string, UserSeedInfo>;
}
function MemeContextProvider({ children }: any) {
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const [memeContractConfig, setMemeContractConfig] =
    useState<IMemefarmConfig>();
  const [xrefContractConfig, setXrefContractConfig] =
    useState<Record<string, IMemefarmConfig>>();
  const [seeds, setSeeds] = useState<Record<string, Seed>>({});
  const [xrefSeeds, setXrefSeeds] = useState<Record<string, Seed>>({});
  const [lpSeeds, setLpSeeds] = useState<Record<string, Seed>>({});
  const [loading, setLoading] = useState(true);
  const [allTokenMetadatas, setAllTokenMetadatas] = useState<
    Record<string, TokenMetadata>
  >({});
  const [memeTokenMetadatas, setMemeTokenMetadatas] = useState<
    Record<string, TokenMetadata>
  >({});
  const [xrefTokenMetadatas, setXrefTokenMetadatas] = useState<
    Record<string, TokenMetadata>
  >({});
  const [user_meme_balances, set_user_meme_balances] = useState<
    Record<string, string>
  >({});
  const [user_xref_balances, set_user_xref_balances] = useState<
    Record<string, string>
  >({});
  const [user_balances, set_user_balances] = useState<Record<string, string>>(
    {}
  );
  const [donateBalances, setDonateBalances] = useState<Record<string, string>>(
    {}
  );
  const [xrefFarmContractUserData, setXrefFarmContractUserData] =
    useState<Record<string, IFarmAccount>>();
  const [memeFarmContractUserData, setMemeFarmContractUserData] =
    useState<IFarmAccount>();
  const [xrefTokenId, setXrefTokenId] = useState<string>();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    if (
      isSignedIn &&
      Object.keys(seeds).length &&
      Object.keys(xrefSeeds).length
    ) {
      init_user();
    }
  }, [isSignedIn, Object.keys(seeds).length, Object.keys(xrefSeeds).length]);
  useEffect(() => {
    setAllTokenMetadatas({ ...memeTokenMetadatas, ...xrefTokenMetadatas });
  }, [memeTokenMetadatas, xrefTokenMetadatas]);
  useEffect(() => {
    set_user_balances({ ...user_xref_balances, ...user_meme_balances });
  }, [user_xref_balances, user_meme_balances]);
  useEffect(() => {
    if (Object.values(xrefSeeds || {})?.[0]?.seed_id) {
      setXrefTokenId(Object.values(xrefSeeds || {})?.[0]?.seed_id);
    }
  }, [xrefSeeds]);
  async function init() {
    const tokenPriceList = await getBoostTokenPrices();
    const memeContractConfig = await get_config();
    const xrefContractConfig = await get_config_xref();
    get_donate_balance();
    meme_init(tokenPriceList);
    xref_init(tokenPriceList);
    setTokenPriceList(tokenPriceList);
    setMemeContractConfig(memeContractConfig);
    setXrefContractConfig(xrefContractConfig);
  }
  async function get_config_xref() {
    const { XREF_MEME_FARM_CONTRACT_IDS } = getMemeContractConfig();
    return (
      await Promise.all(
        XREF_MEME_FARM_CONTRACT_IDS.map((contractId) =>
          get_xref_config(contractId)
        )
      )
    ).reduce(
      (acc, config, index) => ({
        ...acc,
        [XREF_MEME_FARM_CONTRACT_IDS[index]]: config,
      }),
      {}
    );
  }
  async function meme_init(tokenPriceList) {
    const all_lp_seeds = await get_all_seeds();
    // get seeds
    const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
    const memeTokenIds = Object.keys(MEME_TOKEN_XREF_MAP);
    const seeds: Seed[] = (await list_seeds_info()).filter((seed: Seed) =>
      memeTokenIds.includes(seed.seed_id)
    );
    // get farms
    const farmList = await Promise.all(
      seeds.map((seed: Seed) => list_seed_farms(seed.seed_id))
    );
    // get all token metadata
    const tokenIds = new Set(memeTokenIds);
    farmList.forEach((farms: FarmBoost[]) => {
      farms.forEach((farm: FarmBoost) => {
        tokenIds.add(farm.terms.reward_token);
      });
    });
    seeds.forEach((seed: Seed) => {
      tokenIds.add(seed.seed_id);
    });
    const tokenMetadatas = await Promise.all(
      Array.from(tokenIds).map((tokenId: string) => ftGetTokenMetadata(tokenId))
    );
    const tokenMetadataMap = tokenMetadatas.reduce(
      (acc, metadata: TokenMetadata) => {
        metadata.icon =
          getMemeDataConfig().token_icon?.[metadata.id] || metadata.icon;
        return {
          ...acc,
          [metadata.id]: metadata,
        };
      },
      {}
    );
    // get seed tvl
    seeds.forEach((seed: Seed) => {
      const { seed_decimal, total_seed_amount, seed_id } = seed;
      const seedTotalStakedAmount = toReadableNumber(
        seed_decimal,
        total_seed_amount
      );
      const price = tokenPriceList[seed_id]?.price || 0;
      const seedTotalStakedValue = new Big(seedTotalStakedAmount)
        .mul(price)
        .toFixed();
      seed.seedTvl = seedTotalStakedValue;
    });
    // set farm apr and metadata
    farmList.forEach((farms: FarmBoost[], index) => {
      farms.forEach((farm: FarmBoost) => {
        const { reward_token, daily_reward } = farm.terms;
        const metadata = tokenMetadataMap[reward_token];
        farm.token_meta_data = metadata;
        const daily_reward_amount = toReadableNumber(
          metadata.decimals,
          daily_reward
        );
        const reward_token_price = Number(
          tokenPriceList[reward_token]?.price || 0
        );
        if (+seeds[index].seedTvl > 0) {
          farm.apr = new Big(daily_reward_amount)
            .mul(reward_token_price)
            .mul(365)
            .div(seeds[index].seedTvl)
            .toFixed();
        } else {
          farm.apr = '0';
        }
      });
    });
    const seed_process = seeds.reduce((acc, cur, index) => {
      return {
        ...acc,
        [cur.seed_id]: {
          ...cur,
          farmList: farmList[index],
          token_meta_data: tokenMetadataMap[cur.seed_id],
        },
      };
    }, {});
    // get lp seeds
    const lp_seeds = Object.entries(getMemeDataConfig().lp_farm).reduce(
      (acc, cur) => {
        const [tokenId, poolId] = cur;
        const lp_seeds = all_lp_seeds.filter(
          (seed: Seed) => seed.pool.id == poolId
        );
        const temp = {};
        if (lp_seeds.length > 1) {
          temp[tokenId] = lp_seeds.filter(
            (seed: Seed) => seed.farmList[0].status !== 'Ended'
          )[0];
        } else if (
          lp_seeds[0]?.farmList[0]?.status &&
          lp_seeds[0]?.farmList[0]?.status !== 'Ended'
        ) {
          temp[tokenId] = lp_seeds[0];
        }
        return {
          ...acc,
          ...temp,
        };
      },
      {}
    );
    setSeeds(seed_process);
    setLpSeeds(lp_seeds);
    setMemeTokenMetadatas(tokenMetadataMap);
    setLoading(false);
  }
  async function xref_init(tokenPriceList) {
    const { XREF_MEME_FARM_CONTRACT_IDS } = getMemeContractConfig();
    // get seeds (only one seed in each farm contract)
    const xrefSeeds = await Promise.all(
      XREF_MEME_FARM_CONTRACT_IDS.map((contractId) =>
        xref_list_seeds_info(contractId)
      )
    );
    // get farms
    const xrefFarmList = await Promise.all(
      xrefSeeds.map(([seed]: [seed: Seed], index) => {
        return xref_list_seed_farms(
          XREF_MEME_FARM_CONTRACT_IDS[index],
          seed.seed_id
        );
      })
    );
    // get all token metadata
    const tokenIds = new Set();
    xrefFarmList.forEach((farms: FarmBoost[]) => {
      farms.forEach((farm: FarmBoost) => {
        tokenIds.add(farm.terms.reward_token);
      });
    });
    xrefSeeds.forEach(([seed]: [seed: Seed]) => {
      tokenIds.add(seed.seed_id);
    });
    const tokenMetadatas = await Promise.all(
      Array.from(tokenIds).map((tokenId: string) => ftGetTokenMetadata(tokenId))
    );
    const tokenMetadataMap = tokenMetadatas.reduce(
      (acc, metadata: TokenMetadata) => {
        metadata.icon =
          getMemeDataConfig().token_icon?.[metadata.id] || metadata.icon;
        return {
          ...acc,
          [metadata.id]: metadata,
        };
      },
      {}
    );
    // get seed tvl
    xrefSeeds.forEach(([seed]: [seed: Seed]) => {
      const { seed_decimal, total_seed_amount, seed_id } = seed;
      const seedTotalStakedAmount = toReadableNumber(
        seed_decimal,
        total_seed_amount
      );
      const price = tokenPriceList[seed_id]?.price || 0;
      const seedTotalStakedValue = new Big(seedTotalStakedAmount)
        .mul(price)
        .toFixed();
      seed.seedTvl = seedTotalStakedValue;
    });
    // set farm apr and metadata
    xrefFarmList.forEach((farms: FarmBoost[], index) => {
      farms.forEach((farm: FarmBoost) => {
        const { reward_token, daily_reward } = farm.terms;
        const metadata = tokenMetadataMap[reward_token];
        farm.token_meta_data = metadata;
        const daily_reward_amount = toReadableNumber(
          metadata.decimals,
          daily_reward
        );
        const reward_token_price = Number(
          tokenPriceList[reward_token]?.price || 0
        );
        if (+xrefSeeds?.[index]?.[0].seedTvl > 0) {
          farm.apr = new Big(daily_reward_amount)
            .mul(reward_token_price)
            .mul(365)
            .div(+xrefSeeds?.[index]?.[0].seedTvl)
            .toFixed();
        } else {
          farm.apr = '0';
        }
      });
    });
    const seed_process = xrefSeeds.reduce((acc, [cur], index) => {
      return {
        ...acc,
        [XREF_MEME_FARM_CONTRACT_IDS[index]]: {
          ...cur,
          farmList: xrefFarmList[index],
          token_meta_data: tokenMetadataMap[cur.seed_id],
        },
      };
    }, {});
    setXrefSeeds(seed_process);
    setXrefTokenMetadatas(tokenMetadataMap);
  }
  async function init_user() {
    init_user_meme();
    init_user_xref();
  }
  async function init_user_meme() {
    const user_seeds = await list_farmer_seeds();
    const user_seeds_ids = Object.keys(user_seeds);
    const user_unclaimed_rewards = await Promise.all(
      user_seeds_ids.map((seed_id: string) => get_unclaimed_rewards(seed_id))
    );
    const user_unclaimed_rewards_map = user_unclaimed_rewards.reduce(
      (acc, cur, index) => {
        return {
          ...acc,
          [user_seeds_ids[index]]: cur,
        };
      },
      {}
    );
    const seed_ids = Object.keys(seeds);
    const user_balances = await Promise.all(
      seed_ids.map((seed_id: string) => ftGetBalance(seed_id))
    );
    const user_balances_map = user_balances.reduce(
      (acc, balance: string, index) => {
        return {
          ...acc,
          [seed_ids[index]]: balance,
        };
      },
      {}
    );
    const user_withdraw_list = await list_farmer_withdraws();
    setMemeFarmContractUserData({
      withdraw_list: user_withdraw_list,
      unclaimed_rewards: user_unclaimed_rewards_map,
      join_seeds: user_seeds,
    });
    set_user_meme_balances(user_balances_map);
  }
  async function init_user_xref() {
    const { XREF_MEME_FARM_CONTRACT_IDS } = getMemeContractConfig();
    const user_seeds = await Promise.all(
      XREF_MEME_FARM_CONTRACT_IDS.map((contractId) =>
        xref_list_farmer_seeds(contractId)
      )
    );
    // parted farm contract
    const user_seeds_ids = [];
    user_seeds.forEach((s, index) => {
      const seed_id = Object.keys(s)[0];
      if (seed_id) {
        user_seeds_ids.push({
          [XREF_MEME_FARM_CONTRACT_IDS[index]]: seed_id,
        });
      }
    });
    const user_unclaimed_rewards = (
      await Promise.all(
        user_seeds_ids.map((s: string) => {
          const [[xref_contractId, seed_id]] = Object.entries(s);
          return get_xref_unclaimed_rewards(xref_contractId, seed_id);
        })
      )
    ).reduce((acc, c, index) => {
      return { ...acc, ...{ [Object.keys(user_seeds_ids[index])[0]]: c } };
    }, {});

    const xref_token_id = Object.values(xrefSeeds)?.[0]?.seed_id;
    const xref_balance = await ftGetBalance(xref_token_id);
    const user_withdraw_list = await Promise.all(
      XREF_MEME_FARM_CONTRACT_IDS.map((contractId) =>
        xref_list_farmer_withdraws(contractId)
      )
    );
    const userData = XREF_MEME_FARM_CONTRACT_IDS.reduce(
      (acc: any, cur, index) => {
        return {
          ...acc,
          [cur]: {
            withdraw_list: user_withdraw_list[index],
            unclaimed_rewards: user_unclaimed_rewards[cur],
            join_seeds: user_seeds[index],
          },
        };
      },
      {} as any
    );
    setXrefFarmContractUserData(userData);
    set_user_xref_balances({ [xref_token_id]: xref_balance });
  }
  async function get_donate_balance() {
    const balances = await get_donate_list();
    setDonateBalances(balances);
  }
  return (
    <MemeContext.Provider
      value={{
        tokenPriceList,
        allTokenMetadatas,
        user_balances,
        memeContractConfig,
        xrefContractConfig,
        seeds,
        lpSeeds,
        xrefSeeds,
        xrefFarmContractUserData,
        memeFarmContractUserData,
        xrefTokenId,
        donateBalances,
        loading,
      }}
    >
      {children}
      {loading ? (
        <div className="flex justify-center">
          <ChartLoading />
        </div>
      ) : null}
    </MemeContext.Provider>
  );
}

export { MemeContextProvider, MemeContext, IMemeContext };
