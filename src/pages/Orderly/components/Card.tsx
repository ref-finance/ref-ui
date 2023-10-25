import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { list_farmer_seeds, get_unclaimed_rewards } from '../../services/farm';
import { PoolRPCView } from 'src/services/api';
import { isStablePool, ALL_STABLE_POOL_IDS } from '../../services/near';
import { getStablePoolDecimal } from 'src/pages/stable/StableSwapEntry';
import { useAccountInfo } from 'src/state/referendum';
import { TokenMetadata } from 'src/services/ft-contract';
import {
  list_liquidities,
  get_pool,
  get_liquidity,
  PoolInfo,
} from '../../services/swapV3';
import { useStakeListByAccountId, useBatchTotalShares } from '../../state/pool';
import { getVEPoolId } from '../../pages/ReferendumPage';
import { UserLiquidityInfo } from '../../services/commonV3';
import { ftGetTokenMetadata } from '../../services/ft-contract';
import { getYourPools } from 'src/services/indexer';
import { NEARX_POOL_ID } from 'src/services/near';
import { ftGetBalance } from 'src/services/ft-contract';
import BigNumber from 'bignumber.js';
import { toReadableNumber } from 'src/utils/numbers';
import getConfig from '../../services/config';
import { getPoolsByIds } from '../../services/indexer';
import { LP_TOKEN_DECIMALS } from 'src/services/m-token';
import { get_liquidity_value } from '../../services/commonV3';
import { OverviewData } from '../../pages/Overview';
import { formatWithCommas_usd } from '../../services/overview/utils';
import { REFBgIcon, ArrowRightIcon } from './Icons';
import { useHistory } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
const { XREF_TOKEN_ID } = getConfig();
function RefPanel() {
  const {
    set_ref_invest_value,
    set_ref_invest_value_done,
    set_ref_profit_value,
    set_ref_profit_value_done,
    is_mobile,
    accountId,
  } = useContext(OverviewData);
  const history = useHistory();
  // get xref
  const [xref_value, xref_value_done] = useXref() as [string, boolean];
  // get lp v1
  const [yourLpValueV1, lpValueV1Done] = useLpV1() as [string, boolean];
  // get lp v2
  const [yourLpValueV2, lpValueV2Done] = useLpV2() as [string, boolean];
  // get unclaimed
  const [total_unClaimed_rewrads_value, total_unClaimed_rewrads_value_done] =
    useUnClaimed() as [string, boolean];
  // get fees
  const [total_fees_value, total_fees_value_done] = useFees() as [
    string,
    boolean
  ];
  // get invest
  const [invest_value, invest_value_done] = useMemo(() => {
    let total_value = new BigNumber(0);
    let total_value_done = false;
    if (lpValueV1Done && lpValueV2Done) {
      total_value = total_value
        .plus(yourLpValueV1)
        .plus(yourLpValueV2)
        .plus(xref_value);
      total_value_done = true;
    }
    return [total_value.toFixed(), total_value_done];
  }, [lpValueV1Done, lpValueV2Done, xref_value_done]);
  // get profit
  const [total_profit, total_profit_done] = useMemo(() => {
    let total_profit = '0';
    let total_profit_done = false;
    if (total_fees_value_done && total_unClaimed_rewrads_value_done) {
      total_profit = new BigNumber(total_unClaimed_rewrads_value)
        .plus(total_fees_value)
        .toFixed();
      total_profit_done = true;
      return [total_profit, total_profit_done];
    }
    return [total_profit, total_profit_done];
  }, [total_fees_value_done, total_unClaimed_rewrads_value_done]);
  useEffect(() => {
    if (invest_value_done) {
      set_ref_invest_value(invest_value);
      set_ref_invest_value_done(true);
    }
    if (total_profit_done) {
      set_ref_profit_value(total_profit);
      set_ref_profit_value_done(true);
    }
  }, [invest_value_done, total_profit_done]);

  return (
    <div
      className="flex flex-col justify-between bg-swapCardGradient rounded-2xl px-5 xsm:px-4 py-4 relative w-1 xsm:w-full flex-grow cursor-pointer xsm:mb-3"
      style={{ height: is_mobile ? '115px' : '176px' }}
      onClick={() => {
        if (!is_mobile) {
          history.push('/portfolio');
        }
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-base text-greenColor gotham_bold">
          <FormattedMessage id="RefFinance" />
        </span>
        <ArrowRightIcon
          className={`lg:hidden text-primaryText`}
          onClick={() => {
            history.push('/portfolio');
          }}
        ></ArrowRightIcon>
        <REFBgIcon className="absolute right-2 xsm:right-7 top-3"></REFBgIcon>
      </div>
      <div className="flex items-stretch justify-between">
        <div className="flex flex-col w-1/2">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="TotalInvested" />
          </span>
          <span
            className={`text-base gotham_bold mt-3 xsm:mt-0 ${
              accountId ? 'text-white' : 'text-overviewGreyColor'
            }
`}
          >
            {formatWithCommas_usd(invest_value)}
          </span>
        </div>
        <div className="flex flex-col items-center w-1/2">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="Claimable" />
          </span>
          <span
            className={`text-base gotham_bold mt-3 xsm:mt-0 ${
              accountId ? 'text-white' : 'text-overviewGreyColor'
            }`}
          >
            {formatWithCommas_usd(total_profit)}
          </span>
        </div>
      </div>
    </div>
  );
}
export default RefPanel;

function useXref() {
  const { tokenPriceList, isSignedIn, accountId } = useContext(OverviewData);
  const [xrefBalance, setXrefBalance] = useState('0');
  const [xrefBalanceDone, setXrefBalanceDone] = useState<boolean>(false);
  useEffect(() => {
    if (isSignedIn) {
      ftGetBalance(XREF_TOKEN_ID).then(async (data: any) => {
        const token = await ftGetTokenMetadata(XREF_TOKEN_ID);
        const { decimals } = token;
        const balance = toReadableNumber(decimals, data);
        setXrefBalance(balance);
        setXrefBalanceDone(true);
      });
    }
  }, [isSignedIn]);
  const [xref_value, xref_value_done] = useMemo(() => {
    let total_value = '0';
    let total_value_done = false;
    if (Object.keys(tokenPriceList).length > 0 && +xrefBalance > 0) {
      const price = tokenPriceList[XREF_TOKEN_ID]?.price || 0;
      const totalValue = new BigNumber(xrefBalance || '0').multipliedBy(price);
      total_value = totalValue.toFixed();
      total_value_done = true;
    }
    if (xrefBalanceDone && +xrefBalance == 0) {
      total_value_done = true;
    }
    return [total_value, total_value_done];
  }, [tokenPriceList, xrefBalance, xrefBalanceDone]);
  return [xref_value, xref_value_done];
}
function useLpV1() {
  const { tokenPriceList, isSignedIn, accountId } = useContext(OverviewData);
  const [yourLpValueV1, setYourLpValueV1] = useState('0');
  const [lpValueV1Done, setLpValueV1Done] = useState(false);
  const [pools, setPools] = useState<PoolRPCView[]>();
  const [stablePools, setStablePools] = useState<PoolRPCView[]>();
  const [tvls, setTvls] = useState<Record<string, number>>();
  // get stake list in v1 farm and v2 farm
  const { finalStakeList, stakeListDone } = useStakeListByAccountId();
  // get lp amount locked in ve contract;
  const { lptAmount, accountInfoDone } = !!getConfig().REF_VE_CONTRACT_ID
    ? useAccountInfo()
    : { lptAmount: '0', accountInfoDone: true };
  // get the rest lp amount in pool and all lp amount  (in v1 farm, v2 farm, pool)
  const { batchTotalShares, sharesDone: stableSharesDone } =
    useBatchTotalShares(
      stablePools?.map((p) => p.id),
      finalStakeList,
      stakeListDone
    );
  const {
    batchTotalShares: batchTotalSharesSimplePools,
    sharesDone: simpleSharesDone,
  } = useBatchTotalShares(
    pools?.map((p) => p.id),
    finalStakeList,
    stakeListDone
  );
  useEffect(() => {
    // get all stable pools;
    const ids = ALL_STABLE_POOL_IDS;
    getPoolsByIds({ pool_ids: ids }).then((res) => {
      setStablePools(res.filter((p) => p.id.toString() !== NEARX_POOL_ID));
    });
  }, []);
  useEffect(() => {
    if (!isSignedIn) return;
    // get all your simple pools;
    getYourPools().then((res) => {
      setPools(res.filter((p) => !isStablePool(p.id.toString())));
    });
  }, [isSignedIn]);
  useEffect(() => {
    if (!pools) return;
    // get all tvls of simple pools;(stable pools has tvl field， but simple pools doesn't,so need request again)
    getPoolsByIds({ pool_ids: pools.map((p) => p.id.toString()) }).then(
      (res) => {
        setTvls(
          res
            .map((p) => p.tvl)
            ?.reduce((pre, cur, i) => {
              return {
                ...pre,
                [res[i].id]: cur,
              };
            }, {})
        );
      }
    );
  }, [pools]);
  const data_fetch_status =
    !stablePools ||
    !pools ||
    !stableSharesDone ||
    !simpleSharesDone ||
    !accountInfoDone;
  useEffect(() => {
    if (!data_fetch_status) {
      // get the number of pools which lp amount is greater than zero;
      const count =
        batchTotalSharesSimplePools
          .map((n, i) =>
            n + Number(pools?.[i].id) === Number(getVEPoolId())
              ? Number(lptAmount) + n
              : n
          )
          ?.reduce((acc, cur) => {
            return cur > 0 ? acc + 1 : acc;
          }, 0) +
        batchTotalShares?.reduce((acc, cur) => (cur > 0 ? acc + 1 : acc), 0);
      if (+count > 0 && tvls) {
        const allPools = pools.concat(stablePools);
        let total_value_final = '0';
        allPools.forEach((pool: PoolRPCView) => {
          // get total amount
          const { id, shares_total_supply, tvl } = pool;
          const is_stable_pool = isStablePool(id);
          const decimals = is_stable_pool
            ? getStablePoolDecimal(id)
            : LP_TOKEN_DECIMALS;
          let total_amount = 0;
          if (is_stable_pool) {
            const i = stablePools.findIndex(
              (p: PoolRPCView) => p.id === pool.id
            );
            total_amount = batchTotalShares?.[i];
          } else {
            const i = pools.findIndex((p: PoolRPCView) => p.id === pool.id);
            total_amount = batchTotalSharesSimplePools?.[i];
          }
          let lp_in_vote = '0';
          if (+id == +getVEPoolId()) {
            lp_in_vote = new BigNumber(lptAmount || 0).shiftedBy(-24).toFixed();
          }
          const read_total_amount = new BigNumber(total_amount)
            .shiftedBy(-decimals)
            .plus(lp_in_vote);
          // get single lp value
          const pool_tvl = tvls[id] || tvl || '0';
          if (+shares_total_supply > 0 && +pool_tvl > 0) {
            const read_total_supply = new BigNumber(
              shares_total_supply
            ).shiftedBy(-decimals);
            const single_lp_value = new BigNumber(pool_tvl).dividedBy(
              read_total_supply
            );
            const value = single_lp_value.multipliedBy(read_total_amount);
            total_value_final = value.plus(total_value_final).toFixed();
          }
        });
        setLpValueV1Done(true);
        setYourLpValueV1(total_value_final);
      } else if (+count == 0) {
        setLpValueV1Done(true);
        setYourLpValueV1('0');
      }
    }
  }, [data_fetch_status, tvls]);
  return [yourLpValueV1, lpValueV1Done];
}
function useLpV2() {
  const { tokenPriceList, isSignedIn, accountId } = useContext(OverviewData);
  const [all_pools_map, set_all_pools_map] =
    useState<Record<string, PoolInfo>>();
  const [liquidities_list, set_liquidities_list] = useState<
    UserLiquidityInfo[]
  >([]);
  const [liquidities_tokens_metas, set_liquidities_tokens_metas] =
    useState<Record<string, TokenMetadata>>();
  const [yourLpValueV2, setYourLpValueV2] = useState('0');
  const [lpValueV2Done, setLpValueV2Done] = useState(false);
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
    }
  }, [isSignedIn]);
  useEffect(() => {
    if (liquidities_list.length > 0) {
      get_all_pools_detail();
      get_all_tokens_metas();
    }
  }, [liquidities_list]);
  useEffect(() => {
    get_all_liquidity_value();
  }, [all_pools_map, liquidities_tokens_metas, tokenPriceList]);
  async function get_list_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    if (list.length > 0) {
      set_liquidities_list(list);
    } else {
      setLpValueV2Done(true);
      setYourLpValueV2('0');
    }
  }
  async function get_all_pools_detail() {
    const pool_ids = new Set();
    liquidities_list.forEach((liquidity: UserLiquidityInfo) => {
      pool_ids.add(liquidity.pool_id);
    });
    const promise_pools = Array.from(pool_ids).map(async (id: string) => {
      const detail = await get_pool(id);
      return detail;
    });
    const all_liquidities_related_pools = await Promise.all(promise_pools);
    const pools_detail_map = all_liquidities_related_pools.reduce(
      (acc, cur) => {
        return {
          ...acc,
          [cur.pool_id]: cur,
        };
      },
      {}
    );
    set_all_pools_map(pools_detail_map);
  }
  async function get_all_tokens_metas() {
    const token_ids = new Set();
    liquidities_list.forEach((liquidity: UserLiquidityInfo) => {
      const { pool_id } = liquidity;
      const [token_x, token_y, fee] = pool_id.split('|');
      token_ids.add(token_x).add(token_y);
    });
    const promise_all_tokens_meta = Array.from(token_ids).map(
      async (id: string) => {
        const token_mata = await ftGetTokenMetadata(id);
        return token_mata;
      }
    );
    const all_tokens_meta = await Promise.all(promise_all_tokens_meta);
    const liquidities_tokens_metas = all_tokens_meta.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.id]: cur,
      };
    }, {});
    set_liquidities_tokens_metas(liquidities_tokens_metas);
  }
  function get_all_liquidity_value() {
    let total_value = new BigNumber(0);
    if (
      all_pools_map &&
      liquidities_tokens_metas &&
      Object.keys(tokenPriceList).length > 0
    ) {
      liquidities_list.forEach((liquidity: UserLiquidityInfo) => {
        const { pool_id } = liquidity;
        const [token_x, token_y] = pool_id.split('|');
        const poolDetail = all_pools_map[pool_id];
        const tokensMeta = [
          liquidities_tokens_metas[token_x],
          liquidities_tokens_metas[token_y],
        ];
        const v = get_liquidity_value({
          liquidity,
          poolDetail,
          tokenPriceList,
          tokensMeta,
        });
        total_value = total_value.plus(v);
      });
      setLpValueV2Done(true);
      setYourLpValueV2(total_value.toFixed());
    }
  }

  return [yourLpValueV2, lpValueV2Done];
}
function useUnClaimed() {
  const { tokenPriceList, isSignedIn, accountId } = useContext(OverviewData);
  const [user_unclaimed, set_user_unclaimed] = useState<Record<string, any>>(
    {}
  );
  const [user_unclaimed_meta, set_user_unclaimed_meta] = useState<
    Record<string, any>
  >({});
  const [user_unclaimed_done, set_user_unclaimed_done] =
    useState<boolean>(false);
  useEffect(() => {
    if (isSignedIn) {
      getUnClaimedRewards();
    }
  }, [isSignedIn]);
  const [total_unClaimed_rewrads_value, total_unClaimed_rewrads_value_done] =
    useMemo(() => {
      let total_value = new BigNumber(0);
      let total_value_done = false;
      if (
        Object.keys(tokenPriceList).length > 0 &&
        Object.keys(user_unclaimed).length > 0 &&
        Object.keys(user_unclaimed_meta).length > 0
      ) {
        const user_unclaimed_list = Object.values(user_unclaimed);
        user_unclaimed_list.forEach((item: any) => {
          Object.keys(item).forEach((tokenId: string) => {
            const token_meta = user_unclaimed_meta[tokenId];
            const token_quantity = toReadableNumber(
              token_meta.decimals,
              item[tokenId]
            );
            const token_price = tokenPriceList[tokenId]?.price || 0;
            const token_value = new BigNumber(token_quantity).multipliedBy(
              token_price
            );
            total_value = total_value.plus(token_value);
          });
        });
        total_value_done = true;
      }
      if (user_unclaimed_done && Object.keys(user_unclaimed).length == 0) {
        total_value_done = true;
      }
      return [total_value.toFixed(), total_value_done];
    }, [
      user_unclaimed,
      user_unclaimed_meta,
      tokenPriceList,
      user_unclaimed_done,
    ]);
  async function getUnClaimedRewards() {
    // get user seeds
    const list_user_seeds = await list_farmer_seeds();
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
    set_user_unclaimed(userUncliamedRewards);
    set_user_unclaimed_meta(unclaimed_token_meta_datas);
    set_user_unclaimed_done(true);
  }
  return [total_unClaimed_rewrads_value, total_unClaimed_rewrads_value_done];
}
function useFees() {
  const { tokenPriceList, isSignedIn, accountId } = useContext(OverviewData);
  const [liquidities_list, set_liquidities_list] = useState<
    UserLiquidityInfo[]
  >([]);
  const [liquidities_details_list, set_iquidities_details_list] = useState<
    UserLiquidityInfo[]
  >([]);
  const [liquidities_tokens_metas, set_liquidities_tokens_metas] =
    useState<Record<string, TokenMetadata>>();
  const [liquidities_list_done, set_liquidities_list_done] =
    useState<boolean>(false);
  const [liquidities_details_list_done, set_liquidities_details_list_done] =
    useState<boolean>(false);
  const [liquidities_tokens_metas_done, set_liquidities_tokens_metas_done] =
    useState<boolean>(false);
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
    }
  }, [isSignedIn]);
  useEffect(() => {
    if (liquidities_list.length > 0) {
      get_all_tokens_metas();
      get_all_liquidities_details();
    }
    if (liquidities_list_done && liquidities_list.length == 0) {
      set_liquidities_details_list_done(true);
      set_liquidities_tokens_metas_done(true);
    }
  }, [liquidities_list, liquidities_list_done]);
  const [total_fees_value, total_fees_value_done] = useMemo(() => {
    let total_value = new BigNumber(0);
    let total_value_done = false;
    if (
      Object.keys(tokenPriceList).length > 0 &&
      liquidities_details_list.length > 0 &&
      Object.keys(liquidities_tokens_metas || {}).length > 0
    ) {
      liquidities_details_list.forEach((liquidity: UserLiquidityInfo) => {
        const { pool_id, unclaimed_fee_x, unclaimed_fee_y } = liquidity;
        const [token_x, token_y] = pool_id.split('|');
        const tokenX = liquidities_tokens_metas[token_x];
        const tokenY = liquidities_tokens_metas[token_y];
        const price_x = tokenPriceList[token_x]?.price || 0;
        const price_y = tokenPriceList[token_y]?.price || 0;
        const token_x_quantity = toReadableNumber(
          tokenX.decimals,
          unclaimed_fee_x
        );
        const token_y_quantity = toReadableNumber(
          tokenY.decimals,
          unclaimed_fee_y
        );
        const token_x_value = new BigNumber(token_x_quantity).multipliedBy(
          price_x
        );
        const token_y_value = new BigNumber(token_y_quantity).multipliedBy(
          price_y
        );
        total_value = total_value.plus(token_x_value).plus(token_y_value);
      });
      total_value_done = true;
    }
    if (liquidities_details_list_done && liquidities_details_list.length == 0) {
      total_value_done = true;
    }
    return [total_value.toFixed(), total_value_done];
  }, [
    tokenPriceList,
    liquidities_details_list,
    liquidities_list,
    liquidities_tokens_metas,
    liquidities_details_list_done,
    liquidities_list_done,
    liquidities_tokens_metas_done,
  ]);
  async function get_list_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    set_liquidities_list(list);
    set_liquidities_list_done(true);
  }
  async function get_all_tokens_metas() {
    const token_ids = new Set();
    liquidities_list.forEach((liquidity: UserLiquidityInfo) => {
      const { pool_id } = liquidity;
      const [token_x, token_y, fee] = pool_id.split('|');
      token_ids.add(token_x).add(token_y);
    });
    const promise_all_tokens_meta = Array.from(token_ids).map(
      async (id: string) => {
        const token_mata = await ftGetTokenMetadata(id);
        return token_mata;
      }
    );
    const all_tokens_meta = await Promise.all(promise_all_tokens_meta);
    const liquidities_tokens_metas = all_tokens_meta.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.id]: cur,
      };
    }, {});
    set_liquidities_tokens_metas(liquidities_tokens_metas);
    set_liquidities_tokens_metas_done(true);
  }
  async function get_all_liquidities_details() {
    const promise_list_details = liquidities_list.map(
      (item: UserLiquidityInfo) => {
        return get_liquidity(item.lpt_id);
      }
    );
    const list_details = await Promise.all(promise_list_details);
    set_iquidities_details_list(list_details);
    set_liquidities_details_list_done(true);
  }
  return [total_fees_value, total_fees_value_done];
}
