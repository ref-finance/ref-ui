import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  createContext,
} from 'react';
import {
  classificationOfCoins_key,
  classificationOfCoins,
  Seed,
} from '../../../services/farm';
import { useHistory } from 'react-router';
import {
  useAllPools,
  usePools,
  useWatchPools,
  useV3VolumesPools,
  useDCLTopBinFee,
  useIndexerStatus,
} from '../../../state/pool';
import Loading, { BlueCircleLoading } from '../../../components/layout/Loading';

import {
  useTokens,
  usePoolTokens,
  useRainbowWhitelistTokens,
  useTokenBalances,
} from '../../../state/token';
import {
  canFarm,
  Pool,
  isNotStablePool,
  canFarms,
} from '../../../services/pool';
import {
  NEAR_CLASS_STABLE_POOL_IDS,
  REF_UNI_V3_SWAP_CONTRACT_ID,
  USDTT_USDCC_USDT_USDC_POOL_ID,
} from '../../../services/near';
import _, { orderBy, sortBy, filter } from 'lodash';
import {
  scientificNotationToString,
  percent,
  checkAllocations,
} from '../../../utils/numbers';
import {
  useMobile,
  useClientMobile,
  isClientMobie,
  isMobile,
} from '../../../utils/device';
import {
  usePoolsMorePoolIds,
  useDayVolumesPools,
  useYourliquidity,
} from '../../../state/pool';
import {
  WalletContext,
  getCurrentWallet,
} from '../../../utils/wallets-integration';
import getConfig from '../../../services/config';
import { getURLInfo } from '../../../components/layout/transactionTipPopUp';
import { checkTransactionStatus } from '../../../services/swap';
import Big from 'big.js';
import { REF_FI_CONTRACT_ID } from '../../../services/near';

import {
  get_all_seeds,
  getLatestStartTime,
  isPending,
  sort_tokens_by_base,
  get_pool_name,
  openUrl,
} from '../../../services/commonV3';

import { useSeedFarmsByPools } from '../../../state/pool';

import { PoolRefreshModal } from '../PoolRefreshModal';
import { useTokenPriceList } from '../../../state/token';
import {
  REF_FI_POOL_ACTIVE_TAB,
  getPoolFeeApr,
  getPoolListFarmAprTip,
} from '../utils';
import { REF_FI_POOL_SEARCH_BY, REF_MOBILE_POOL_ID_INPUT, TokenPriceListContext } from "./constLiquidityPage";
import './LiquidityPage.css';
import MobileLiquidityPage from "src/pages/pools/LiquidityPage/MobileLiquidityPage/MobileLiquidityPage";
import PcLiquidityPage from "src/pages/pools/LiquidityPage/PcLiquidityPage";

const HIDE_LOW_TVL = 'REF_FI_HIDE_LOW_TVL';

const REF_FI_FARM_ONLY = 'REF_FI_FARM_ONLY';

const REF_POOL_ID_SEARCHING_KEY = 'REF_POOL_ID_SEARCHING_KEY';
const { switch_on_dcl_farms } = getConfig();

export function getPoolFeeAprTitle(
  dayVolume: string,
  pool: Pool,
  tvlInput?: number
) {
  let result = '0';
  if (dayVolume) {
    const { fee, tvl } = pool;
    const newTvl = tvlInput || tvl;

    const revenu24h = (fee / 10000) * 0.8 * Number(dayVolume);
    if (newTvl > 0 && revenu24h > 0) {
      const annualisedFeesPrct = ((revenu24h * 365) / newTvl) * 100;
      result = annualisedFeesPrct.toString();
    }
  }
  return Number(result);
}

export const getPoolListV2FarmAprTip = () => {
  return `
    <div 
      class="flex flex-col text-xs min-w-36 text-farmText z-50"
    >
      <div>
      Top Bin APR
      </div>

      <div>
      
      + Farm Rewards APR
      </div>
    
   

    </div>
`;
};

export default function LiquidityPage() {
  window.onunload = () => {
    sessionStorage.removeItem(REF_FI_POOL_SEARCH_BY);
  };
  const storeTokenName = sessionStorage.getItem(REF_FI_POOL_SEARCH_BY);
  const poolsScrollRef = useRef<HTMLInputElement>();
  const [tokenName, setTokenName] = useState(storeTokenName || '');
  const [sortBy, setSortBy] = useState('tvl');
  const [order, setOrder] = useState('desc');
  const [selectCoinClass, setSelectCoinClass] = useState<string>('all');
  const AllPools = useAllPools();
  const {
    watchPools,
    watchV2PoolsFinal: watchV2Pools,
    watchList,
  } = useWatchPools();
  const [hideLowTVL, setHideLowTVL] = useState<Boolean>(false);
  const [displayPools, setDisplayPools] = useState<Pool[]>();
  const poolsData = usePools({
    hideLowTVL,
    selectCoinClass,
    tokenName,
    sortBy,
    order,
  });
  const { pools, hasMore, nextPage, loading, volumes } = poolsData || {};

  const tokenPriceList = useTokenPriceList();

  const [farmOnly, setFarmOnly] = useState<boolean>(
    localStorage.getItem(REF_FI_FARM_ONLY) === '1' || false
  );

  const [activeTab, setActiveTab] = useState<string>(
    localStorage.getItem(REF_FI_POOL_ACTIVE_TAB) || 'v1'
  );

  const switchActiveTab = (curTab: string) => {
    setActiveTab(curTab);

    localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, curTab);
  };

  const [farmCounts, setFarmCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const pool_ids_v1 = pools.map((p) => p.id);
    const pool_ids_watchPools = watchPools.map((p: Pool) => p.id);
    const pool_ids = pool_ids_v1.concat(pool_ids_watchPools);
    canFarms({
      pool_ids,
    }).then(setFarmCounts);
  }, [pools, watchPools?.map((p) => p.id).join('|')]);

  const clientMobileDevice = useClientMobile();
  const [do_farms_v2_poos, set_do_farms_v2_poos] = useState<
    Record<string, Seed>
  >({});
  useEffect(() => {
    get_all_seeds().then((seeds: Seed[]) => {
      const activeSeeds = seeds.filter((seed: Seed) => {
        const { farmList, seed_id } = seed;
        const [contract_id, temp_mft_id] = seed_id.split('@');
        return (
          contract_id == REF_UNI_V3_SWAP_CONTRACT_ID &&
          farmList[0].status != 'Ended'
        );
      });
      if (activeSeeds.length > 0) {
        const temp = {};
        activeSeeds.forEach((seed: Seed) => {
          const [contract_id, temp_mft_id] = seed.seed_id.split('@');
          const [fixRange, pool_id, left_point, right_point] =
            temp_mft_id.split('&');
          const temp_arr = temp[pool_id] || [];
          temp_arr.push(seed);
          temp[pool_id] = temp_arr;
        });
        const temp_final = {};
        Object.keys(temp).forEach((pool_id: string) => {
          const seeds: Seed[] = temp[pool_id];
          seeds.sort((b: Seed, a: Seed) => {
            const b_latest = getLatestStartTime(b);
            const a_latest = getLatestStartTime(a);
            if (b_latest == 0) return -1;
            if (a_latest == 0) return 1;
            return a_latest - b_latest;
          });
          // having benefit
          const temp_seed = seeds.find((s: Seed, index: number) => {
            if (!isPending(s)) {
              seeds.splice(index, 1);
              return true;
            }
          });
          if (temp_seed) {
            seeds.unshift(temp_seed);
          }
          temp_final[pool_id] = seeds[0];
        });

        set_do_farms_v2_poos(temp_final);
      }
    });
  }, []);

  useEffect(() => {
    let tempPools = pools;

    setHideLowTVL(JSON.parse(localStorage.getItem(HIDE_LOW_TVL)) || false);

    if (hideLowTVL) {
      // tempPools = _.filter(tempPools, (pool) => pool.tvl > 1000);
    }
    if (farmOnly) {
      tempPools = _.filter(tempPools, (pool) => !!farmCounts[pool.id]);
    }
    setDisplayPools(tempPools);
  }, [pools, hideLowTVL, farmOnly, farmCounts]);

  const poolTokenMetas = usePoolTokens(pools);
  const onSearch = useCallback(
    _.debounce(
      (name: string) => {
        setTokenName(name);
        sessionStorage.setItem(REF_FI_POOL_SEARCH_BY, name);
      },
      clientMobileDevice ? 50 : 500
    ),
    [clientMobileDevice]
  );

  const history = useHistory();

  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && getCurrentWallet()?.wallet?.isSignedIn()) {
      checkTransactionStatus(txHash).then((res) => {
        let status: any = res.status;

        if (
          res.transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute'
        ) {
          let receipt = res?.receipts_outcome?.find(
            (o: any) => o?.outcome?.executor_id === REF_FI_CONTRACT_ID
          );

          if (receipt) {
            status = receipt?.outcome?.status;
          }
        }

        const data: string | undefined = status.SuccessValue;

        if (data) {
          const buff = Buffer.from(data, 'base64');
          const pool_id = buff.toString('ascii');

          history.push(`/pool/${pool_id}`);
        } else {
          history.replace(`/pools`);
        }
      });
    }
  }, [txHash]);

  const poolsMorePoolsIds = usePoolsMorePoolIds();

  const watchPoolVolumes = useDayVolumesPools(watchPools.map((p) => p.id));
  const v3PoolVolumes = useV3VolumesPools();
  const [h24VolumeV2, setH24VolumeV2] = useState<string>();

  const { fail: indexerFail } = useIndexerStatus();

  const { farmAprById } = useSeedFarmsByPools([...pools, ...watchPools]);

  useEffect(() => {
    if (Object.keys(v3PoolVolumes).length > 0) {
      const h24Volume = Object.values(v3PoolVolumes).reduce(
        (a, b) => new Big(a || '0').plus(new Big(b || '0')),
        new Big(0)
      );

      setH24VolumeV2(scientificNotationToString(h24Volume.toString()));
    }
  }, [v3PoolVolumes]);

  const allVolumes = { ...watchPoolVolumes, ...volumes, ...v3PoolVolumes };

  const handleSortClick = (e) => {
    poolsScrollRef?.current?.scroll({
      top: 0,
      behavior: 'auto',
    });
    setSortBy(e);
  };

  if (
    !displayPools ||
    loading ||
    !watchPools ||
    !poolTokenMetas ||
    !farmAprById
  )
    return <Loading />;

  return (
    <TokenPriceListContext.Provider
      value={{
        indexFail: Object.keys(tokenPriceList).length == 0,
      }}
    >
      {!clientMobileDevice && (
        <PcLiquidityPage
          farmAprById={farmAprById}
          poolTokenMetas={poolTokenMetas}
          activeTab={activeTab}
          h24VolumeV2={h24VolumeV2}
          switchActiveTab={switchActiveTab}
          tokenName={tokenName}
          pools={displayPools}
          poolsMorePoolsIds={poolsMorePoolsIds}
          onHide={(isHide) => {
            localStorage.setItem(HIDE_LOW_TVL, isHide.toString());
            setHideLowTVL(isHide);
          }}
          farmCounts={farmCounts}
          hideLowTVL={hideLowTVL}
          farmOnly={farmOnly}
          setFarmOnly={(farmOnly: boolean) => {
            setFarmOnly(farmOnly);
            localStorage.setItem(REF_FI_FARM_ONLY, farmOnly ? '1' : '0');
          }}
          selectCoinClass={selectCoinClass}
          setSelectCoinClass={setSelectCoinClass}
          watchPools={watchPools}
          watchV2Pools={watchV2Pools}
          watchList={watchList}
          volumes={allVolumes}
          order={order}
          sortBy={sortBy}
          allPools={AllPools}
          onOrderChange={setOrder}
          onSortChange={handleSortClick}
          onSearch={onSearch}
          hasMore={hasMore}
          nextPage={nextPage}
          do_farms_v2_poos={do_farms_v2_poos}
          poolsData={poolsData}
          poolsScrollRef={poolsScrollRef}
        />
      )}

      {clientMobileDevice && (
        <MobileLiquidityPage
          activeTab={activeTab}
          switchActiveTab={switchActiveTab}
          poolTokenMetas={poolTokenMetas}
          hideLowTVL={hideLowTVL}
          poolsMorePoolsIds={poolsMorePoolsIds}
          tokenName={tokenName}
          pools={displayPools}
          watchPools={watchPools}
          watchV2Pools={watchV2Pools}
          watchList={watchList}
          allPools={AllPools}
          volumes={allVolumes}
          order={order}
          sortBy={sortBy}
          farmCounts={farmCounts}
          farmOnly={farmOnly}
          setFarmOnly={(farmOnly: boolean) => {
            setFarmOnly(farmOnly);
            localStorage.setItem(REF_FI_FARM_ONLY, farmOnly ? '1' : '0');
          }}
          selectCoinClass={selectCoinClass}
          setSelectCoinClass={setSelectCoinClass}
          onOrderChange={setOrder}
          onSortChange={handleSortClick}
          onHide={(isHide) => {
            localStorage.setItem(HIDE_LOW_TVL, isHide.toString());
            setHideLowTVL(isHide);
          }}
          onSearch={onSearch}
          hasMore={hasMore}
          nextPage={nextPage}
          do_farms_v2_poos={do_farms_v2_poos}
          farmAprById={farmAprById}
        />
      )}
      {indexerFail && (
        <PoolRefreshModal isOpen={indexerFail}></PoolRefreshModal>
      )}
    </TokenPriceListContext.Provider>
  );
}
