import React, { useState, useEffect, useContext } from 'react';
import Big from 'big.js';
import { useHistory } from 'react-router';
import Overview from '../components/meme/Overview';
import ProgressBar from '../components/meme/ProgressBar';
import SeedsBox from '../components/meme/SeedsBox';
import WithdrawList from '../components/meme/WithdrawList';
import Banner from '../components/meme/Banner';
import { MemeContext } from '../components/meme/context';
import { ChartLoading } from 'src/components/icon/Loading';
import {
  list_seeds_info,
  list_seed_farms,
  list_farmer_seeds,
  list_farmer_withdraws,
  get_unclaimed_rewards,
  get_config,
  IFarmerWithdraw,
  IMemefarmConfig,
  getMemeConfig,
} from '../services/meme';
import {
  getBoostTokenPrices,
  Seed,
  UserSeedInfo,
  FarmBoost,
} from '../services/farm';
import {
  ftGetTokenMetadata,
  ftGetBalance,
  TokenMetadata,
} from '../services/ft-contract';
import { toReadableNumber } from 'src/utils/numbers';
import { WalletContext } from '../utils/wallets-integration';
import { get_all_seeds } from '../services/commonV3';
import { isMobile } from '../utils/device';

export default function MemePage() {
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const [memeConfig, setMemeConfig] = useState<IMemefarmConfig>();
  const [seeds, setSeeds] = useState<Record<string, Seed>>({});
  const [lpSeeds, setLpSeeds] = useState<Record<string, Seed>>({});
  const [loading, setLoading] = useState(true);
  const [allTokenMetadatas, setAllTokenMetadatas] = useState<
    Record<string, TokenMetadata>
  >({});
  const [user_seeds, set_user_seeds] = useState<Record<string, UserSeedInfo>>(
    {}
  );
  const [unclaimed_rewards, set_unclaimed_rewards] = useState<
    Record<string, any>
  >({});
  const [user_balances, set_user_balances] = useState<Record<string, string>>(
    {}
  );
  const [withdraw_list, set_withdraw_list] = useState<
    Record<string, IFarmerWithdraw>
  >({});
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const history = useHistory();
  useEffect(() => {
    init();
  }, []);
  useEffect(() => {
    if (isSignedIn && Object.keys(seeds).length) {
      init_user();
    }
  }, [isSignedIn, seeds]);
  async function init() {
    const tokenPriceList = await getBoostTokenPrices();
    const all_lp_seeds = await get_all_seeds();
    const memeConfig = await get_config();
    const seeds: Seed[] = await list_seeds_info();
    const farmList = await Promise.all(
      seeds.map((seed: Seed) => list_seed_farms(seed.seed_id))
    );
    const tokenIds = new Set();
    farmList.forEach((farms: FarmBoost[]) => {
      farms.forEach((farm: FarmBoost) => {
        tokenIds.add(farm.terms.reward_token);
      });
    });
    seeds.forEach((seed: Seed) => {
      tokenIds.add(seed.seed_id);
    });
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
    const tokenMetadatas = await Promise.all(
      Array.from(tokenIds).map((tokenId: string) => ftGetTokenMetadata(tokenId))
    );
    // get all token metadata
    const tokenMetadataMap = tokenMetadatas.reduce(
      (acc, metadata: TokenMetadata) => {
        return {
          ...acc,
          [metadata.id]: metadata,
        };
      },
      {}
    );
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
    const lp_seeds = Object.entries(getMemeConfig().lp_farm).reduce(
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
    setTokenPriceList(tokenPriceList);
    setSeeds(seed_process);
    setAllTokenMetadatas(tokenMetadataMap);
    setMemeConfig(memeConfig);
    setLpSeeds(lp_seeds);
    setLoading(false);
  }
  async function init_user() {
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
    set_user_seeds(user_seeds);
    set_unclaimed_rewards(user_unclaimed_rewards_map);
    set_user_balances(user_balances_map);
    set_withdraw_list(user_withdraw_list);
  }
  if (isMobile()) {
    history.push('/');
  }
  return (
    <MemeContext.Provider
      value={{
        tokenPriceList,
        seeds,
        allTokenMetadatas,
        unclaimed_rewards,
        user_balances,
        user_seeds,
        withdraw_list,
        memeConfig,
        lpSeeds,
      }}
    >
      <div className="-mt-12">
        <Banner />
        <div
          className="m-auto lg:w-5/6"
          style={{ maxWidth: '1100px', marginTop: '-55px' }}
        >
          <Overview />
          <ProgressBar />
          <SeedsBox />
          <WithdrawList />
          {loading ? (
            <div className="flex justify-center">
              <ChartLoading />
            </div>
          ) : null}
        </div>
      </div>
    </MemeContext.Provider>
  );
}
