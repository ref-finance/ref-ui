import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  createContext,
} from 'react';
import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  list_liquidities,
  get_pool,
  get_liquidity,
  PoolInfo,
  claim_all_liquidity_fee,
} from '../../services/swapV3';
import { ColorsBox, TipIon } from 'src/components/icon/V3';
import {
  GradientButton,
  BorderButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import {
  toPrecision,
  toReadableNumber,
  scientificNotationToString,
} from 'src/utils/numbers';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
  TOKEN_LIST_FOR_RATE,
  displayNumberToAppropriateDecimals,
  get_all_seeds,
  get_liquidity_value,
  allocation_rule_liquidities,
  get_pool_name,
  openUrl,
  sort_tokens_by_base,
  get_account_24_apr,
  get_matched_all_seeds_of_a_dcl_pool,
  whether_liquidity_can_farm_in_seed,
  get_valid_range,
  get_total_value_by_liquidity_amount_dcl,
  get_token_amount_in_user_liquidities,
  useRemoveLiquidityUrlHandle,
} from '../../services/commonV3';
import BigNumber from 'bignumber.js';
import {
  FarmBoost,
  getBoostTokenPrices,
  Seed,
  get_seed,
} from '../../services/farm';
import { RemovePoolV3 } from 'src/components/pool/RemovePoolV3';
import { WalletContext } from '../../utils/wallets-integration';
import { list_farmer_seeds, list_seed_farms } from '../../services/farm';
import getConfig from '../../services/config';
import { LinkArrowIcon } from 'src/components/icon/FarmBoost';
import { get_detail_the_liquidity_refer_to_seed } from '../../pages/poolsV3/YourLiquidityPageV3';
import { LinkIcon, WaterDropIcon } from '../../components/icon/Portfolio';
import { UpDownButton } from '../portfolio/Tool';
import { ftGetTokenMetadata, TokenMetadata } from 'src/services/ft-contract';
import { PortfolioData } from '../../pages/Portfolio';
import { isMobile } from 'src/utils/device';
import Big from 'big.js';
import { useWalletSelector } from 'src/context/WalletSelectorContext';
import { IDCLAccountFee } from 'src/components/d3Chart/interfaces';
import { getDCLAccountFee } from '../../services/indexer';
import {
  formatNumber,
  formatWithCommas_usd,
  formatPercentage,
  formatWithCommas_usd_down,
} from './utils';
import { FarmStampNew } from 'src/components/icon/FarmStamp';
import { get_unClaimed_fee_data } from '../../pages/poolsV3/components/detail/DetailFun';
const is_mobile = isMobile();
const { REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();
export function YourLiquidityV2(props: any) {
  const {
    set_dcl_liquidities_list,
    set_dcl_liquidities_details_list,
    set_dcl_tokens_metas,
    set_dcl_liquidities_details_list_done,
  } = useContext(PortfolioData) || {};
  const {
    setYourLpValueV2,
    setLpValueV2Done,
    setLiquidityLoadingDone,
    setLiquidityQuantity,
    styleType,
  } = props;
  const [all_seeds, set_all_seeds] = useState<Seed[]>([]);
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const [all_pools_map, set_all_pools_map] =
    useState<Record<string, PoolInfo>>();
  const [liquidities_list, set_liquidities_list] = useState<
    UserLiquidityInfo[]
  >([]);

  const [groupYourLiquidity, setGroupYourLiquidity] = useState<any>();

  const [liquidities_details_list, set_iquidities_details_list] = useState<
    UserLiquidityInfo[]
  >([]);
  const [liquidities_tokens_metas, set_liquidities_tokens_metas] =
    useState<Record<string, TokenMetadata>>();

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useRemoveLiquidityUrlHandle();
  useEffect(() => {
    getBoostTokenPrices().then(setTokenPriceList);
    get_all_seeds().then((seeds: Seed[]) => {
      set_all_seeds(seeds);
    });
  }, []);
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
    }
  }, [isSignedIn]);
  useEffect(() => {
    if (liquidities_list.length > 0) {
      get_all_pools_detail();
      get_all_tokens_metas();
      get_all_liquidities_details();
    }
  }, [liquidities_list]);
  useEffect(() => {
    get_all_liquidity_value();
  }, [all_pools_map, liquidities_tokens_metas, tokenPriceList]);
  const dcl_liquidities_details_map = useMemo(() => {
    let temp_map = {};
    if (liquidities_details_list.length > 0) {
      temp_map = liquidities_details_list.reduce(
        (acc: any, cur: UserLiquidityInfo) => {
          return {
            ...acc,
            [cur.lpt_id]: cur,
          };
        },
        {}
      );
    }
    return temp_map;
  }, [liquidities_details_list]);
  useEffect(() => {
    if (
      !liquidities_list ||
      !all_pools_map ||
      !liquidities_tokens_metas ||
      !tokenPriceList ||
      !dcl_liquidities_details_map ||
      Object.keys(dcl_liquidities_details_map).length === 0
    ) {
      return;
    }
    Promise.all(
      liquidities_list.map((liquidity) =>
        getYourLiquidityData({
          liquidity,
          all_seeds,
          tokenPriceList,
          poolDetail: all_pools_map?.[liquidity.pool_id],
          liquidityDetail: dcl_liquidities_details_map?.[liquidity.lpt_id],
          liquidities_tokens_metas,
        })
      )
    ).then((yourLiquidityList) => {
      const groupedLiquidity = yourLiquidityList.reduce((acc, cur) => {
        const { pool_id } = cur;
        const [token_x, token_y] = pool_id.split('|');
        const poolDetail = all_pools_map[pool_id];
        const tokensMeta = [
          liquidities_tokens_metas[token_x],
          liquidities_tokens_metas[token_y],
        ];

        if (acc[pool_id]) {
          acc[pool_id].push(cur);

          return acc;
        } else {
          return {
            ...acc,
            [pool_id]: [
              {
                ...cur,
                poolDetail,
                tokensMeta,
              },
            ],
          };
        }
      }, {} as Record<string, any[]>);

      setGroupYourLiquidity(groupedLiquidity);
    });
  }, [
    liquidities_list,
    all_seeds,
    all_pools_map,
    liquidities_tokens_metas,
    tokenPriceList,
    dcl_liquidities_details_map,
    Object.keys(dcl_liquidities_details_map).length === 0,
  ]);
  async function get_list_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    if (list.length > 0) {
      // get user seeds
      const user_seeds_map = await list_farmer_seeds();
      const user_seed_ids = Object.keys(user_seeds_map);
      if (user_seed_ids.length > 0) {
        const seedsPromise = user_seed_ids.map((seed_id: string) => {
          return get_seed(seed_id);
        });
        const user_seeds = await Promise.all(seedsPromise);
        user_seeds.forEach((seed: Seed) => {
          const { seed_id } = seed;
          const [contractId, mft_id] = seed_id.split('@');
          if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
            const { free_amount, locked_amount } =
              user_seeds_map[seed_id] || {};
            const user_seed_amount = new BigNumber(free_amount)
              .plus(locked_amount)
              .toFixed();
            allocation_rule_liquidities({ list, user_seed_amount, seed });
          }
        });
      }
      // sort
      list.sort((item1: UserLiquidityInfo, item2: UserLiquidityInfo) => {
        const item1_hashId = +item1.lpt_id.split('#')[1];
        const item2_hashId = +item2.lpt_id.split('#')[1];
        return item1_hashId - item2_hashId;
      });
      set_liquidities_list(list);
      set_dcl_liquidities_list && set_dcl_liquidities_list(list);
    } else {
      setLpValueV2Done(true);
      setYourLpValueV2('0');
      set_dcl_liquidities_details_list_done &&
        set_dcl_liquidities_details_list_done(true);
    }
    setLiquidityLoadingDone && setLiquidityLoadingDone(true);

    const groupedList = list.reduce((pre, cur) => {
      const { pool_id } = cur;
      const pool = pre[pool_id] || [];
      pool.push(cur);
      pre[pool_id] = pool;
      return pre;
    }, {});

    setLiquidityQuantity &&
      setLiquidityQuantity(Object.keys(groupedList).length);
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
    set_dcl_tokens_metas && set_dcl_tokens_metas(liquidities_tokens_metas);
  }
  async function get_all_liquidities_details() {
    const promise_list_details = liquidities_list.map(
      (item: UserLiquidityInfo) => {
        return get_liquidity(item.lpt_id);
      }
    );
    const list_details = await Promise.all(promise_list_details);
    set_iquidities_details_list(list_details);
    if (set_dcl_liquidities_details_list) {
      set_dcl_liquidities_details_list(list_details);
    }
    if (set_dcl_liquidities_details_list_done) {
      set_dcl_liquidities_details_list_done(true);
    }
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
      setLpValueV2Done && setLpValueV2Done(true);
      setYourLpValueV2 && setYourLpValueV2(total_value.toFixed());
    }
  }
  return (
    <div>
      {groupYourLiquidity && Object.entries(groupYourLiquidity).length && (
        <div
          className={`grid grid-cols-11 px-6 text-sm text-primaryText xsm:hidden ${
            styleType == '2' ? 'hidden' : ''
          }`}
        >
          <div className="col-span-4 ">
            <FormattedMessage
              id="pool"
              defaultMessage={'Pool'}
            ></FormattedMessage>
          </div>

          <div className="col-span-3 ">
            <FormattedMessage
              id="price_range"
              defaultMessage={'Price Range'}
            ></FormattedMessage>
          </div>

          <div className="col-span-2 ">APR(24h)</div>
          <div className="col-span-2 ">
            <FormattedMessage
              id="your_liquidity"
              defaultMessage={'Your Liquidity'}
            ></FormattedMessage>
          </div>
        </div>
      )}

      {groupYourLiquidity &&
        Object.entries(groupYourLiquidity).map(
          ([id, liquidity]: any, index: number) => {
            return (
              <UserLiquidityLineStyleGroup
                key={index}
                groupYourLiquidityList={liquidity}
                liquidities_list={liquidity.map((l: any) => l.liquidityDetail)}
                tokenPriceList={tokenPriceList}
                all_seeds={all_seeds}
                styleType={styleType}
              />
            );
          }
        )}
    </div>
  );
}

// a function just to return your liquidity data
async function getYourLiquidityData({
  liquidity,
  all_seeds,
  tokenPriceList,
  poolDetail,
  liquidities_tokens_metas,
  liquidityDetail,
}: {
  liquidity: UserLiquidityInfo;
  all_seeds: Seed[];
  tokenPriceList: Record<string, any>;
  poolDetail: PoolInfo;
  liquidities_tokens_metas: Record<string, TokenMetadata>;
  liquidityDetail: UserLiquidityInfo;
}) {
  function get_your_liquidity_in_farm_range() {
    if (!related_seed_info.targetSeed || !related_seed_info.targetSeed.seed_id)
      return '0';

    const seed_info = related_seed_info.targetSeed.seed_id.split('&');
    const farmRangeLeft = Number(seed_info[2]);
    const farmRangeRight = Number(seed_info[3]);
    const { current_point } = poolDetail;

    if (left_point > farmRangeRight || right_point < farmRangeLeft) return '0';

    return get_your_liquidity(
      current_point,
      left_point >= farmRangeLeft ? left_point : farmRangeLeft,
      right_point <= farmRangeRight ? right_point : farmRangeRight
    );
  }
  function get_your_liquidity(
    current_point: number,
    left_point: number,
    right_point: number
  ) {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const priceX = tokenPriceList[tokenX.id]?.price || 0;
    const priceY = tokenPriceList[tokenY.id]?.price || 0;
    let total_price;
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      let tokenYAmount = getY(left_point, current_point, L, tokenY) || 0;
      let tokenXAmount = getX(current_point + 1, right_point, L, tokenX) || 0;
      const { amountx, amounty } = get_X_Y_In_CurrentPoint(tokenX, tokenY, L);
      tokenXAmount = new BigNumber(tokenXAmount).plus(amountx).toFixed();
      tokenYAmount = new BigNumber(tokenYAmount).plus(amounty).toFixed();
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      total_price = tokenYTotalPrice.plus(tokenXTotalPrice).toFixed();
    }
    // only y token
    if (current_point >= right_point) {
      const tokenYAmount = getY(left_point, right_point, L, tokenY);
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      total_price = tokenYTotalPrice.toFixed();
    }
    // only x token
    if (left_point > current_point) {
      const tokenXAmount = getX(left_point, right_point, L, tokenX);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      total_price = tokenXTotalPrice.toFixed();
    }

    return total_price;
  }
  function getY(
    leftPoint: number,
    rightPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const y = new BigNumber(L).multipliedBy(
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
        (Math.sqrt(CONSTANT_D) - 1)
    );
    const y_result = y.toFixed();
    return toReadableNumber(token.decimals, toPrecision(y_result, 0));
  }
  function getX(
    leftPoint: number,
    rightPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const x = new BigNumber(L)
      .multipliedBy(
        (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
            Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
      )
      .toFixed();
    return toReadableNumber(token.decimals, toPrecision(x, 0));
  }
  function get_X_Y_In_CurrentPoint(
    tokenX: TokenMetadata,
    tokenY: TokenMetadata,
    L: string
  ) {
    const { liquidity, liquidity_x, current_point } = poolDetail;
    const liquidity_y_big = new BigNumber(liquidity).minus(liquidity_x);
    let Ly = '0';
    let Lx = '0';
    // only remove y
    if (liquidity_y_big.isGreaterThanOrEqualTo(L)) {
      Ly = L;
    } else {
      // have x and y
      Ly = liquidity_y_big.toFixed();
      Lx = new BigNumber(L).minus(Ly).toFixed();
    }
    const amountX = getXAmount_per_point_by_Lx(Lx, current_point);
    const amountY = getYAmount_per_point_by_Ly(Ly, current_point);
    const amountX_read = toReadableNumber(
      tokenX.decimals,
      toPrecision(amountX, 0)
    );
    const amountY_read = toReadableNumber(
      tokenY.decimals,
      toPrecision(amountY, 0)
    );
    return { amountx: amountX_read, amounty: amountY_read };
  }
  function getTokenFeeAmount(p: string) {
    if (liquidityDetail && tokenMetadata_x_y && tokenPriceList) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const { unclaimed_fee_x, unclaimed_fee_y } = liquidityDetail;
      const fee_x_amount = toReadableNumber(
        tokenX.decimals,
        unclaimed_fee_x || '0'
      );
      const fee_y_amount = toReadableNumber(
        tokenY.decimals,
        unclaimed_fee_y || '0'
      );
      if (p == 'l') {
        return fee_x_amount;
      } else if (p == 'r') {
        return fee_y_amount;
      } else if (p == 'p') {
        const tokenxSinglePrice = tokenPriceList[tokenX.id]?.price || '0';
        const tokenySinglePrice = tokenPriceList[tokenY.id]?.price || '0';
        const priceX = new BigNumber(fee_x_amount).multipliedBy(
          tokenxSinglePrice
        );
        const priceY = new BigNumber(fee_y_amount).multipliedBy(
          tokenySinglePrice
        );
        const totalPrice = priceX.plus(priceY);

        return scientificNotationToString(totalPrice.toString());
      }
    }
  }
  function getRate(direction: string) {
    let value = '';
    if (tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      if (direction == 'left') {
        value = getPriceByPoint(left_point, decimalRate);
      } else if (direction == 'right') {
        value = getPriceByPoint(right_point, decimalRate);
      }
      if (rate_need_to_reverse_display && +value !== 0) {
        value = new BigNumber(1).dividedBy(value).toFixed();
      }
    }
    return value;
  }
  function go_farm() {
    const [fixRange, pool_id, left_point, right_point] =
      liquidity.mft_id.split('&');
    const link_params = `${get_pool_name(
      pool_id
    )}[${left_point}-${right_point}]`;
    const actives = related_farms.filter((farm: FarmBoost) => {
      return farm.status != 'Ended';
    });
    let url;
    if (related_farms.length > 0 && actives.length == 0) {
      url = `/v2farms/${link_params}-e`;
    } else {
      url = `/v2farms/${link_params}-r`;
    }
    openUrl(url);
  }
  function getRateMapTokens() {
    if (tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      if (rate_need_to_reverse_display) {
        return `${tokenX.symbol}/${tokenY.symbol}`;
      } else {
        return `${tokenY.symbol}/${tokenX.symbol}`;
      }
    }
  }
  const { lpt_id, pool_id, left_point, right_point, amount: L } = liquidity;
  const [token_x, token_y, fee] = pool_id.split('|');
  const tokenMetadata_x_y = liquidities_tokens_metas
    ? [liquidities_tokens_metas[token_x], liquidities_tokens_metas[token_y]]
    : null;
  let rate_need_to_reverse_display: boolean;

  if (tokenMetadata_x_y) {
    const [tokenX] = tokenMetadata_x_y;
    if (TOKEN_LIST_FOR_RATE.indexOf(tokenX.symbol) > -1)
      rate_need_to_reverse_display = true;
    else rate_need_to_reverse_display = false;
  }
  // the value of the liquidity;
  let your_liquidity: any;
  if (tokenMetadata_x_y && poolDetail && tokenPriceList) {
    const { current_point } = poolDetail;
    your_liquidity = get_your_liquidity(current_point, left_point, right_point);
  }
  const is_in_farming =
    liquidity.part_farm_ratio && +liquidity.part_farm_ratio > 0;
  let related_farms: any;
  if (is_in_farming) {
    const id = liquidity.mft_id.slice(1);
    const seed_id = REF_UNI_V3_SWAP_CONTRACT_ID + '@' + id;
    related_farms = await list_seed_farms(seed_id);
  }
  const related_seed_info = get_detail_the_liquidity_refer_to_seed({
    liquidity,
    all_seeds,
    is_in_farming,
    related_farms,
    tokenPriceList,
  });
  const tokenFeeLeft = getTokenFeeAmount('l');
  const tokenFeeRight = getTokenFeeAmount('r');
  const tokenFeeValue = getTokenFeeAmount('p');
  const rangeMin = getRate(rate_need_to_reverse_display ? 'right' : 'left');
  const rangeMax = getRate(rate_need_to_reverse_display ? 'left' : 'right');
  const ratedMapTokens = getRateMapTokens();
  const your_liquidity_farm = get_your_liquidity_in_farm_range();
  return {
    fee,
    your_liquidity,
    your_liquidity_farm,
    related_seed_info,
    go_farm,
    tokenFeeLeft: tokenFeeLeft || '0',
    tokenFeeRight: tokenFeeRight || '0',
    rate_need_to_reverse_display,
    related_farms,
    is_in_farming,
    liquidity,
    pool_id,
    rangeMax,
    rangeMin,
    ratedMapTokens,
    tokenMetadata_x_y,
    liquidityDetail,
    tokenFeeValue,
  };
}
export function findRangeIntersection(arr: number[][]) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return [];
  }

  arr.sort((a, b) => a[0] - b[0]);

  let intersection = [arr[0]];

  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];
    const [currentStart, currentEnd] = current;
    const [prevStart, prevEnd] = intersection[intersection.length - 1];

    if (currentStart > prevEnd) {
      intersection.push(current);
    } else {
      const start = Math.min(currentStart, prevStart);
      const end = Math.max(currentEnd, prevEnd);
      intersection[intersection.length - 1] = [start, end];
    }
  }

  return intersection;
}
const GroupData = createContext(null);
function UserLiquidityLineStyleGroup({
  groupYourLiquidityList,
  liquidities_list,
  tokenPriceList,
  all_seeds,
  styleType,
}: {
  groupYourLiquidityList: any[];
  liquidities_list: UserLiquidityInfo[];
  tokenPriceList: any;
  all_seeds: Seed[];
  styleType: string;
}) {
  const publicData = groupYourLiquidityList[0];
  const {
    tokenMetadata_x_y,
    fee,
    pool_id,
    related_seed_info,
    ratedMapTokens,
    related_farms,
    poolDetail,
    go_farm,
  } = publicData;
  const [hover, setHover] = useState<boolean>(false);
  const [showRemoveBox, setShowRemoveBox] = useState<boolean>(false);
  const [accountAPR, setAccountAPR] = useState('');
  const [claim_loading, set_claim_loading] = useState(false);

  // new
  const [farm_icon, set_farm_icon] = useState<'single' | 'muti'>();
  const [tip_seed, set_tip_seed] = useState<ILatestSeedTip>();
  const [joined_seeds, set_joined_seeds] = useState<IUserJoinedSeed>();
  const [joined_seeds_done, set_joined_seeds_done] = useState<boolean>(false);

  const [removeButtonTip, setRemoveButtonTip] = useState<boolean>(false);

  const tokens = sort_tokens_by_base(tokenMetadata_x_y);
  const { accountId } = useWalletSelector();
  const history = useHistory();
  useEffect(() => {
    if (
      poolDetail &&
      tokenPriceList &&
      tokenMetadata_x_y &&
      liquidities_list.length
    ) {
      get_24_apr();
    }
  }, [poolDetail, tokenPriceList, tokenMetadata_x_y, liquidities_list]);
  useEffect(() => {
    if (
      all_seeds.length &&
      groupYourLiquidityList.length &&
      liquidities_list.length
    ) {
      // get all seeds of the dcl pool
      const [activeSeeds, endedSeeds, matchedSeeds] =
        get_matched_all_seeds_of_a_dcl_pool({
          seeds: all_seeds,
          pool_id,
        });
      // farm icon
      if (activeSeeds.length) {
        const muti = activeSeeds.find((seed: Seed) => {
          return seed.farmList.length > 1;
        });
        if (muti) {
          set_farm_icon('muti');
        } else {
          set_farm_icon('single');
        }
      }
      // tip
      const latest_seed = activeSeeds[0];
      if (latest_seed) {
        const exist = groupYourLiquidityList.find((l: any) => {
          const liquidity: UserLiquidityInfo = l.liquidity;
          const { part_farm_ratio } = liquidity;
          const is_in_farming = part_farm_ratio && +part_farm_ratio > 0;
          if (!is_in_farming) {
            if (whether_liquidity_can_farm_in_seed(liquidity, latest_seed)) {
              return true;
            }
          }
        });
        if (exist) {
          const seed_apr = getSeedApr(latest_seed);
          set_tip_seed({
            seed: latest_seed,
            seed_apr: seed_apr == 0 ? '-' : formatPercentage(seed_apr),
            go_farm_url_link: get_go_seed_link_url(latest_seed),
          });
        }
      }
      // get all seed that user had joined
      let joined_seeds: IUserJoinedSeed;
      const in_farming_liquidities = groupYourLiquidityList.filter((l: any) => {
        return l.is_in_farming;
      });
      in_farming_liquidities.forEach((l: any) => {
        const [fixRange_l, pool_id_l, left_point_l, right_point_l] =
          l.liquidity.mft_id.split('&');
        const targetSeed = matchedSeeds.find((seed: Seed) => {
          const [contractId, mft_id] = seed.seed_id.split('@');
          if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
            const [
              fixRange,
              pool_id_from_seed,
              left_point_seed,
              right_point_seed,
            ] = mft_id.split('&');
            return (
              left_point_l == left_point_seed &&
              right_point_l == right_point_seed
            );
          }
        });
        if (targetSeed) {
          if (!joined_seeds) {
            joined_seeds = {
              [targetSeed.seed_id]: {
                seed: targetSeed,
                liquidities: [l.liquidity],
              },
            };
          } else if (!joined_seeds[targetSeed.seed_id]) {
            joined_seeds[targetSeed.seed_id] = {
              seed: targetSeed,
              liquidities: [l.liquidity],
            };
          } else {
            joined_seeds[targetSeed.seed_id].liquidities.push(l.liquidity);
          }
        }
      });

      // get farm apr and value of user's investment
      joined_seeds &&
        Object.values(joined_seeds).forEach(
          (joined_seed_info: IUserJoinedSeedDetail) => {
            const { seed, liquidities } = joined_seed_info;
            joined_seed_info.seed_apr = formatPercentage(getSeedApr(seed));
            joined_seed_info.value_of_investment = formatWithCommas_usd(
              getTotalValueInFarmsOfLiquidities(seed, liquidities)
            );
            if (seed.farmList[0].status == 'Ended') {
              joined_seed_info.seed_status = 'ended';
              joined_seed_info.seed_status_num = 3;
            } else {
              if (latest_seed.seed_id == seed.seed_id) {
                joined_seed_info.seed_status = 'run';
                joined_seed_info.seed_status_num = 1;
              } else {
                joined_seed_info.seed_status = 'would_ended';
                joined_seed_info.seed_status_num = 2;
              }
            }
            joined_seed_info.go_farm_url_link = get_go_seed_link_url(seed);
          }
        );
      set_joined_seeds(joined_seeds);
      set_joined_seeds_done(true);
    }
  }, [groupYourLiquidityList, liquidities_list, tokenPriceList, all_seeds]);

  function get_go_seed_link_url(seed: Seed) {
    const [fixRange, dcl_pool_id, left_point_seed, right_point_seed] =
      seed.seed_id.split('@')[1].split('&');
    const link_params = `${get_pool_name(
      dcl_pool_id
    )}[${left_point_seed}-${right_point_seed}]`;
    if (seed.farmList[0].status == 'Ended') {
      return `/v2farms/${link_params}-e`;
    } else {
      return `/v2farms/${link_params}-r`;
    }
  }
  function getSeedApr(seed: Seed) {
    const farms = seed.farmList;
    let apr = 0;
    const allPendingFarms = isPending(seed);
    farms.forEach(function (item: FarmBoost) {
      const pendingFarm = item.status == 'Created' || item.status == 'Pending';
      if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
        apr = +new BigNumber(apr).plus(item.apr).toFixed();
      }
    });
    return apr * 100;
  }
  function getTotalValueInFarmsOfLiquidities(
    seed: Seed,
    liquidities: UserLiquidityInfo[]
  ) {
    let total_value = Big(0);
    liquidities.forEach((l: UserLiquidityInfo) => {
      let v = get_range_part_value(l, seed);
      if (Big(l.unfarm_part_amount || 0).gt(0)) {
        v = Big(l.part_farm_ratio).div(100).mul(v).toFixed();
      }
      total_value = total_value.plus(v || 0);
    });
    return total_value.toFixed();
  }
  async function get_24_apr() {
    let apr_24 = '';
    const dcl_fee_result: IDCLAccountFee | any = await getDCLAccountFee({
      pool_id,
      account_id: accountId,
    });
    if (dcl_fee_result) {
      // 24h profit
      poolDetail.token_x_metadata = tokenMetadata_x_y[0];
      poolDetail.token_y_metadata = tokenMetadata_x_y[1];
      // total unClaimed fee
      const [unClaimed_tvl_fee] = get_unClaimed_fee_data(
        liquidities_list,
        poolDetail,
        tokenPriceList
      );
      apr_24 = get_account_24_apr(
        unClaimed_tvl_fee,
        dcl_fee_result,
        poolDetail,
        tokenPriceList
      );
    }
    setAccountAPR(formatPercentage(apr_24));
  }

  const groupList = () => {
    const [total_x, total_y] = get_token_amount_in_user_liquidities({
      user_liquidities: liquidities_list,
      pool: poolDetail,
      token_x_metadata: tokenMetadata_x_y[0],
      token_y_metadata: tokenMetadata_x_y[1],
    });

    const price_x = tokenPriceList?.[tokenMetadata_x_y[0].id]?.price || 0;
    const price_y = tokenPriceList?.[tokenMetadata_x_y[1].id]?.price || 0;

    const total_x_value = Big(price_x).mul(total_x);
    const total_y_value = Big(price_y).mul(total_y);

    const your_liquidity = total_x_value.plus(total_y_value);

    const tokenFeeLeft = groupYourLiquidityList.reduce((prev, cur) => {
      return new Big(prev || '0').plus(new Big(cur.tokenFeeLeft || '0'));
    }, new Big(0));

    const tokenFeeRight = groupYourLiquidityList.reduce((prev, cur) => {
      return new Big(prev || '0').plus(new Big(cur.tokenFeeRight || '0'));
    }, new Big(0));

    const tokenFeeValue = groupYourLiquidityList.reduce((prev, cur) => {
      return new Big(prev || '0').plus(new Big(cur.tokenFeeValue || '0'));
    }, new Big(0));

    const rangeList = groupYourLiquidityList.map((g) => [
      Number(g.rangeMin),
      Number(g.rangeMax),
    ]);

    const pointRangeList = groupYourLiquidityList.map((g) => [
      g.liquidity.left_point,
      g.liquidity.right_point,
    ]);

    const is_in_farming = groupYourLiquidityList.reduce(
      (pre, cur) => !!pre || !!cur.is_in_farming,
      false
    );

    const intersectionRangeList = findRangeIntersection(rangeList);
    const intersectionPointRangeList = findRangeIntersection(pointRangeList);

    const current_point = poolDetail.current_point;

    const isInRange = intersectionPointRangeList.some(
      (range) => current_point >= range[0] && current_point <= range[1]
    );

    const canClaim = tokenFeeLeft.plus(tokenFeeRight).gt(0);

    // on farm not on myself
    const farmApr: Big = !publicData.related_seed_info.your_apr
      ? ''
      : groupYourLiquidityList.reduce((prev: any, cur: any) => {
          return new Big(prev || '0').plus(
            new Big(cur.related_seed_info.your_apr_raw || '0')
          );
        }, new Big(0));

    let farmRangeLeft;
    let farmRangeRight;

    if (related_seed_info.targetSeed) {
      const seed_info = related_seed_info.targetSeed.seed_id.split('&');
      farmRangeLeft = Number(seed_info[2]);
      farmRangeRight = Number(seed_info[3]);
    }

    const totalLiquidityAmount = groupYourLiquidityList.reduce(
      (pre, cur) => {
        const { mft_id } = cur.liquidity;

        const { your_liquidity_farm } = cur;

        return {
          total: pre.total.plus(new Big(your_liquidity_farm)),
          in_farm: mft_id
            ? pre.in_farm.plus(new Big(your_liquidity_farm))
            : pre.in_farm,
        };
      },
      {
        total: new Big(0),
        in_farm: new Big(0),
      }
    );

    return {
      ...publicData,
      your_liquidity: formatWithCommas_usd(your_liquidity.toFixed()),
      tokenFeeLeft: formatNumber(tokenFeeLeft.toFixed()),
      tokenFeeRight: formatNumber(tokenFeeRight.toFixed()),
      tokenFeeValue: formatWithCommas_usd_down(tokenFeeValue.toFixed()),
      intersectionRangeList: intersectionRangeList.map((range) => [
        new Big(range[0]).toFixed(),
        new Big(range[1]).toFixed(),
      ]),
      is_in_farming,
      intersectionPointRangeList,
      isInRange,
      canClaim,
      farmApr: !farmApr
        ? ''
        : farmApr.eq(new Big(0))
        ? '0%'
        : farmApr.lt(0.01)
        ? '<0.01%'
        : farmApr.toFixed(2, 0) + '%',
      in_farm_percent: totalLiquidityAmount.total.eq(0)
        ? '0%'
        : toPrecision(
            scientificNotationToString(
              totalLiquidityAmount.in_farm
                .div(totalLiquidityAmount.total)
                .times(100)
                .toString()
            ),
            2
          ) + '%',
    };
  };

  const groupedData = groupList();

  const {
    your_liquidity,
    tokenFeeLeft,
    tokenFeeRight,
    tokenFeeValue,
    intersectionRangeList,
    isInRange,
    canClaim,
  } = groupedData;

  function goDetailV2() {
    const url_pool_id = get_pool_name(pool_id);
    history.push(`/poolV2/${url_pool_id}`);
  }
  function claimRewards() {
    if (!canClaim) return;

    set_claim_loading(true);
    const lpt_ids: string[] = [];
    groupYourLiquidityList
      .map((g) => g.liquidityDetail)
      .forEach((liquidity: UserLiquidityInfo) => {
        const { unclaimed_fee_x, unclaimed_fee_y } = liquidity;
        if (+unclaimed_fee_x > 0 || +unclaimed_fee_y > 0) {
          lpt_ids.push(liquidity.lpt_id);
        }
      });
    claim_all_liquidity_fee({
      token_x: tokenMetadata_x_y[0],
      token_y: tokenMetadata_x_y[1],
      lpt_ids,
    });
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
  function get_range_part_value(liquidity: UserLiquidityInfo, seed: Seed) {
    const [left_point, right_point] = get_valid_range(liquidity, seed.seed_id);
    const v = get_liquidity_value_of_range(
      liquidity,
      seed,
      left_point,
      right_point
    );
    return v;
  }
  function get_liquidity_value_of_range(
    liquidity: UserLiquidityInfo,
    seed: Seed,
    leftPoint: number,
    rightPoint: number
  ) {
    const { amount } = liquidity;
    const poolDetail = seed.pool;
    const { token_x, token_y } = poolDetail;
    const v = get_total_value_by_liquidity_amount_dcl({
      left_point: leftPoint || liquidity.left_point,
      right_point: rightPoint || liquidity.right_point,
      poolDetail,
      amount,
      price_x_y: {
        [token_x]: tokenPriceList[token_x]?.price || '0',
        [token_y]: tokenPriceList[token_y]?.price || '0',
      },
      metadata_x_y: {
        [token_x]: tokenMetadata_x_y[0],
        [token_y]: tokenMetadata_x_y[1],
      },
    });
    return v;
  }
  function sort_joined_seeds(
    b: IUserJoinedSeedDetail,
    a: IUserJoinedSeedDetail
  ) {
    return b.seed_status_num - a.seed_status_num;
  }
  return (
    <GroupData.Provider
      value={{
        hover,
        setHover,
        tip_seed,
        goDetailV2,
        tokens,
        fee,
        farm_icon,
        intersectionRangeList,
        ratedMapTokens,
        isInRange,
        accountAPR,
        joined_seeds,
        sort_joined_seeds,
        your_liquidity,
        tokenMetadata_x_y,
        tokenFeeLeft,
        tokenFeeRight,
        canClaim,
        claimRewards,
        claim_loading,
        history,
        joined_seeds_done,
        setRemoveButtonTip,
        setShowRemoveBox,
        removeButtonTip,
        showRemoveBox,
        liquidities_list,
        poolDetail,
        tokenPriceList,
        tokenFeeValue,
      }}
    >
      {styleType == '2' ? (
        <UserLiquidityLineStyleGroupStyle2></UserLiquidityLineStyleGroupStyle2>
      ) : (
        <UserLiquidityLineStyleGroupStyle1></UserLiquidityLineStyleGroupStyle1>
      )}
    </GroupData.Provider>
  );
}
function UserLiquidityLineStyleGroupStyle1() {
  if (is_mobile) {
    return (
      <UserLiquidityLineStyleGroupStyle1Mobile></UserLiquidityLineStyleGroupStyle1Mobile>
    );
  } else {
    return (
      <UserLiquidityLineStyleGroupStyle1Pc></UserLiquidityLineStyleGroupStyle1Pc>
    );
  }
}
function UserLiquidityLineStyleGroupStyle1Mobile() {
  const {
    hover,
    setHover,
    tip_seed,
    goDetailV2,
    tokens,
    fee,
    farm_icon,
    intersectionRangeList,
    ratedMapTokens,
    isInRange,
    accountAPR,
    joined_seeds,
    sort_joined_seeds,
    your_liquidity,
    tokenMetadata_x_y,
    tokenFeeLeft,
    tokenFeeRight,
    canClaim,
    claimRewards,
    claim_loading,
    history,
    joined_seeds_done,
    setRemoveButtonTip,
    setShowRemoveBox,
    removeButtonTip,
    showRemoveBox,
    liquidities_list,
    poolDetail,
    tokenPriceList,
  } = useContext(GroupData);
  return (
    <>
      <div
        className="bg-cardBg rounded-lg overflow-hidden mb-3.5"
        onClick={(e) => {
          goDetailV2();
        }}
      >
        {/* head */}
        <div className="bg-orderMobileTop flex items-start p-3">
          <div className="flex items-center flex-shrink-0">
            <img
              src={tokens[0]?.icon}
              className="w-7 h-7 border border-greenColor rounded-full"
            ></img>
            <img
              src={tokens[1]?.icon}
              className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
            ></img>
          </div>
          <div className="flex flex-grow ml-2.5 flex-col  gap-1">
            <div className="flex items-center justify-between">
              <span className="text-white  font-gothamBold  text-sm">
                {tokens[0]?.['symbol']}-{tokens[1]?.['symbol']}
              </span>
              <span
                className={`whitespace-nowrap text-xs ${
                  isInRange
                    ? 'text-gradientFromHover'
                    : 'text-v3GarkWarningColor'
                }`}
              >
                {isInRange ? (
                  <FormattedMessage id="in_range"></FormattedMessage>
                ) : (
                  <FormattedMessage id="out_of_range"></FormattedMessage>
                )}
              </span>
            </div>

            <div className="frcs gap-2 text-xs">
              <div className="rounded-xl px-1.5 text-white text-sm bg-DCLIconGradient">
                DCL
              </div>
              <div className="flex items-center text-v3SwapGray justify-center bg-black bg-opacity-25 rounded-2xl px-3 py-px border border-dclTabBorderColor">
                <span className="text-xs  whitespace-nowrap mr-1.5">
                  <FormattedMessage id="fee_Tiers" />
                </span>
                <span className="">{+fee / 10000}%</span>
              </div>
              {farm_icon ? (
                <div className="-ml-2">
                  <FarmStampNew multi={farm_icon == 'muti'} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {/* body */}
        <div className="p-3">
          <div className="flex items-start justify-between">
            <span className="text-sm text-v3SwapGray whitespace-nowrap">
              Price Range
            </span>
            <div className="flex flex-col items-end">
              <div className="flex items-center justify-end flex-wrap">
                {intersectionRangeList.map((range: string[], i: number) => {
                  return (
                    <div className="text-white whitespace-nowrap text-sm">
                      <span>
                        {displayNumberToAppropriateDecimals(range[0])}
                      </span>
                      <span className="mx-1">-</span>

                      <span>
                        {displayNumberToAppropriateDecimals(range[1])}
                      </span>
                      {intersectionRangeList.length > 1 &&
                        i < intersectionRangeList.length - 1 && (
                          <span className="mr-1">,</span>
                        )}
                    </div>
                  );
                })}
              </div>
              <span className="text-xs mt-1 text-v3SwapGray">
                {ratedMapTokens}
              </span>
            </div>
          </div>
          <div className="flex items-start justify-between mt-3">
            <span className="text-sm text-v3SwapGray whitespace-nowrap">
              APR(24h)
            </span>
            <div className="flex flex-col items-end">
              <span className="text-sm text-white">{accountAPR || '-'}</span>
              {joined_seeds ? (
                <div className="flex flex-col gap-0.5">
                  {Object.values(joined_seeds)
                    .sort(sort_joined_seeds)
                    .map((joined_seed_info: IUserJoinedSeedDetail) => {
                      const length = Object.values(joined_seeds).length;
                      const { seed_apr, seed_status } = joined_seed_info;
                      if (seed_status == 'ended') return null;
                      if (length == 1) {
                        return (
                          <div className="frcs gap-1 text-xs text-v3SwapGray whitespace-nowrap">
                            <span>
                              <FormattedMessage
                                id="farm_apr"
                                defaultMessage={'Farm APR'}
                              ></FormattedMessage>
                            </span>
                            <span>{seed_apr}</span>
                          </div>
                        );
                      } else {
                        return (
                          <div className="frcs gap-1 text-xs text-v3SwapGray whitespace-nowrap">
                            <span>
                              ({seed_status == 'run' ? 'new' : 'pre.'}) APR
                            </span>
                            <span>{seed_apr}</span>
                          </div>
                        );
                      }
                    })}
                </div>
              ) : tip_seed ? (
                <div className="frcs gap-1 text-xs text-v3SwapGray">
                  <span>
                    <FormattedMessage
                      id="farm_apr"
                      defaultMessage={'Farm APR'}
                    ></FormattedMessage>
                  </span>
                  <span>0%</span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex items-start justify-between mt-3">
            <span className="text-sm text-v3SwapGray whitespace-nowrap">
              <FormattedMessage id="unclaimed_fees" />
            </span>
            <div className="frcc">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                className="w-5 h-5 border border-greenColor rounded-full mr-1"
              ></img>
              <span className="text-sm text-white mr-3 gotham_bold">
                {tokenFeeLeft || '-'}
              </span>
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                className="w-5 h-5 border border-greenColor rounded-full mr-1"
              ></img>
              <span className="text-sm text-white gotham_bold">
                {tokenFeeRight || '-'}
              </span>
            </div>
          </div>
        </div>
        {/* foot */}
        <div className="bg-dclYourLiquidityColor">
          <div className="p-3">
            <div className="flex items-start justify-between">
              <span className="text-sm text-v3SwapGray">Your Liquidity</span>
              <div className="flex flex-col items-end">
                <span className="text-white gotham_bold mb-1">
                  {your_liquidity}
                </span>
                {joined_seeds ? (
                  <div className="flex flex-col items-end gap-0.5 text-xs text-v3SwapGray">
                    {Object.values(joined_seeds)
                      .sort(sort_joined_seeds)
                      .map((joined_seed_info: IUserJoinedSeedDetail) => {
                        const length = Object.values(joined_seeds).length;
                        const {
                          seed_status,
                          value_of_investment,
                          go_farm_url_link,
                        } = joined_seed_info;
                        if (length == 1) {
                          return (
                            <div className="frcs  whitespace-nowrap">
                              {value_of_investment} in
                              <a
                                className="cursor-pointer underline ml-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUrl(go_farm_url_link);
                                }}
                              >
                                farm
                              </a>
                            </div>
                          );
                        } else {
                          return (
                            <div className="frcs gap-1 whitespace-nowrap">
                              {value_of_investment} in
                              <a
                                className={`cursor-pointer underline ml-1`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUrl(go_farm_url_link);
                                }}
                              >
                                farm (
                                {seed_status == 'run'
                                  ? 'new'
                                  : seed_status == 'would_ended'
                                  ? 'pre.'
                                  : 'ended'}
                                )
                              </a>
                            </div>
                          );
                        }
                      })}
                  </div>
                ) : tip_seed ? (
                  <div className="frcs justify-end gap-1 text-xs text-v3SwapGray">
                    0% in
                    <a
                      className="cursor-pointer underline ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUrl(tip_seed.go_farm_url_link);
                      }}
                    >
                      farm
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-3">
              <div
                className={`flex w-24 flex-grow h-8 items-center justify-center  rounded-lg text-sm px-3 py-1 ${
                  !canClaim
                    ? 'bg-deepBlue text-white opacity-30 cursor-not-allowed'
                    : 'bg-deepBlue text-white hover:bg-lightBlue cursor-pointer'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  claimRewards();
                }}
              >
                <ButtonTextWrapper
                  loading={claim_loading}
                  Text={() => <FormattedMessage id="claim" />}
                />
              </div>
              <GradientButton
                onClick={(e) => {
                  e.stopPropagation();
                  const pool_name = get_pool_name(poolDetail.pool_id);
                  history.push(`/addLiquidityV2#${pool_name}`);
                }}
                color="#fff"
                minWidth="5rem"
                borderRadius="8px"
                className={`px-3 w-24 flex-grow h-8 text-center text-sm text-white  focus:outline-none`}
              >
                <FormattedMessage id="add" />
              </GradientButton>
              <div
                className={`relative flex items-center flex-grow ${
                  joined_seeds_done ? '' : 'hidden'
                }`}
                onMouseEnter={() => {
                  if (!!joined_seeds && !is_mobile) {
                    setRemoveButtonTip(true);
                  }
                }}
                onMouseLeave={() => {
                  if (!!joined_seeds) {
                    setRemoveButtonTip(false);
                  }
                }}
                onClick={(e) => {
                  if (is_mobile) {
                    e.stopPropagation();
                    setRemoveButtonTip(!removeButtonTip);
                  }
                }}
              >
                <BorderButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRemoveBox(true);
                  }}
                  rounded="rounded-lg"
                  disabled={!!joined_seeds}
                  px="px-0"
                  py="py-1"
                  style={{ minWidth: '5rem' }}
                  className={`flex-grow w-24  text-sm text-greenColor h-8 ${
                    !!joined_seeds ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  <FormattedMessage id="remove" />
                </BorderButton>
                <div
                  className={`${
                    removeButtonTip ? '' : 'hidden'
                  } absolute z-50 right-0 -top-12 border border-primaryText rounded-md px-2 py-1.5 text-xs text-farmText w-56 bg-cardBg`}
                >
                  You have liquidity in farm, please unstake from{' '}
                  <a
                    className="underline cursor-pointer"
                    onClick={() => {
                      localStorage.setItem('BOOST_FARM_TAB', 'yours');
                      openUrl('/v2farms');
                    }}
                  >
                    Your Farm
                  </a>{' '}
                  first.
                </div>
              </div>
            </div>
          </div>
          {/* tip */}
          {tip_seed ? (
            <div className="relative flex items-center bg-dclFarmTipColor justify-between px-3 py-1">
              <span className="text-sm text-white whitespace-nowrap">
                Farm APR up to{' '}
                <span className="font-gothamBold">{tip_seed.seed_apr}</span>
              </span>
              <div
                className="flex items-center justify-center  text-white cursor-pointer whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  openUrl(tip_seed.go_farm_url_link);
                }}
              >
                <a className="text-sm text-white mr-1 underline">
                  <FormattedMessage id="go_farm" />
                </a>
                <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {showRemoveBox ? (
        <RemovePoolV3
          isOpen={showRemoveBox}
          onRequestClose={() => {
            setShowRemoveBox(false);
          }}
          listLiquidities={liquidities_list}
          tokenMetadata_x_y={tokenMetadata_x_y}
          poolDetail={poolDetail}
          tokenPriceList={tokenPriceList}
          userLiquidity={list_liquidities[0]}
          style={{
            overlay: {
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
            },
            content: {
              outline: 'none',
              transform: 'translate(-50%, -50%)',
            },
          }}
        ></RemovePoolV3>
      ) : null}
    </>
  );
}
function UserLiquidityLineStyleGroupStyle1Pc() {
  const {
    hover,
    setHover,
    tip_seed,
    goDetailV2,
    tokens,
    fee,
    farm_icon,
    intersectionRangeList,
    ratedMapTokens,
    isInRange,
    accountAPR,
    joined_seeds,
    sort_joined_seeds,
    your_liquidity,
    tokenMetadata_x_y,
    tokenFeeLeft,
    tokenFeeRight,
    canClaim,
    claimRewards,
    claim_loading,
    history,
    joined_seeds_done,
    setRemoveButtonTip,
    setShowRemoveBox,
    removeButtonTip,
    showRemoveBox,
    liquidities_list,
    poolDetail,
    tokenPriceList,
  } = useContext(GroupData);
  return (
    <div
      className="mt-3.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* for PC */}
      <div className="relative flex flex-col items-center xs:hidden md:hidden">
        <div className="w-full">
          <div
            className={`relative p-6 cursor-pointer grid  grid-cols-11 overflow-hidden ${
              !tip_seed && !hover ? 'rounded-xl' : 'rounded-t-xl'
            }  ${hover ? 'bg-v3HoverDarkBgColor' : 'bg-cardBg'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goDetailV2();
            }}
          >
            {/* 1/3 */}
            <div className="flex items-start col-span-4">
              <div className="flex items-center flex-shrink-0">
                <img
                  src={tokens[0]?.icon}
                  className="w-7 h-7 border border-greenColor rounded-full"
                ></img>
                <img
                  src={tokens[1]?.icon}
                  className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
                ></img>
              </div>
              <div className="flex ml-2.5 flex-col  gap-1">
                <span className="text-white  font-gothamBold  text-sm">
                  {tokens[0]?.['symbol']}-{tokens[1]?.['symbol']}
                </span>

                <div className="frcs gap-2 text-xs">
                  <div className="rounded-xl px-1.5 text-white text-sm bg-DCLIconGradient">
                    DCL
                  </div>
                  <div className="flex items-center text-v3SwapGray justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
                    <span className="text-xs  whitespace-nowrap mr-1.5">
                      <FormattedMessage id="fee_Tiers" />
                    </span>
                    <span className="">{+fee / 10000}%</span>
                  </div>
                  {farm_icon ? (
                    <div className="-ml-2">
                      <FarmStampNew multi={farm_icon == 'muti'} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            {/* 2/3 */}
            {/* Price Range */}
            <div className="col-span-3">
              <div className=" flex flex-wrap">
                {intersectionRangeList.map((range: string[], i: number) => {
                  return (
                    <div className="text-white whitespace-nowrap text-sm">
                      <span>
                        {displayNumberToAppropriateDecimals(range[0])}
                      </span>
                      <span className="mx-1">-</span>

                      <span>
                        {displayNumberToAppropriateDecimals(range[1])}
                      </span>
                      {intersectionRangeList.length > 1 &&
                        i < intersectionRangeList.length - 1 && (
                          <span className="mr-1">,</span>
                        )}
                    </div>
                  );
                })}
                <span className="text-sm ml-1 text-v3SwapGray">
                  {ratedMapTokens}
                </span>
              </div>
              <div className="frcs mt-1 max-w-max bg-black bg-opacity-25 rounded-2xl px-1.5 h-6 py-0.5 overflow-hidden whitespace-nowrap overflow-ellipsis">
                <span
                  className={`whitespace-nowrap text-xs overflow-hidden  overflow-ellipsis ${
                    isInRange
                      ? 'text-gradientFromHover'
                      : 'text-v3GarkWarningColor'
                  }`}
                >
                  {isInRange ? (
                    <FormattedMessage id="in_range"></FormattedMessage>
                  ) : (
                    <FormattedMessage id="out_of_range"></FormattedMessage>
                  )}
                </span>
              </div>
            </div>
            {/* APR(24h) */}
            <div className="text-white flex flex-col gap-2  text-sm col-span-2">
              <span>{accountAPR || '-'}</span>
              {joined_seeds ? (
                <div className="flex flex-col gap-2">
                  {Object.values(joined_seeds)
                    .sort(sort_joined_seeds)
                    .map((joined_seed_info: IUserJoinedSeedDetail) => {
                      const length = Object.values(joined_seeds).length;
                      const { seed_apr, seed_status } = joined_seed_info;
                      if (seed_status == 'ended') return null;
                      if (length == 1) {
                        return (
                          <div className="frcs gap-1 text-primaryText whitespace-nowrap">
                            <span>
                              <FormattedMessage
                                id="farm_apr"
                                defaultMessage={'Farm APR'}
                              ></FormattedMessage>
                            </span>
                            <span>{seed_apr}</span>
                          </div>
                        );
                      } else {
                        return (
                          <div className="frcs gap-1 text-primaryText whitespace-nowrap">
                            <span>
                              ({seed_status == 'run' ? 'new' : 'pre.'}) APR
                            </span>
                            <span>{seed_apr}</span>
                          </div>
                        );
                      }
                    })}
                </div>
              ) : tip_seed ? (
                <div className="frcs gap-1 text-primaryText">
                  <span>
                    <FormattedMessage
                      id="farm_apr"
                      defaultMessage={'Farm APR'}
                    ></FormattedMessage>
                  </span>
                  <span>0%</span>
                </div>
              ) : null}
            </div>
            {/* Your Liquidity */}
            <div className=" text-white text-sm flex flex-col gap-2 pl-2 col-span-2">
              {your_liquidity}
              {joined_seeds ? (
                <div className="flex flex-col gap-2">
                  {Object.values(joined_seeds)
                    .sort(sort_joined_seeds)
                    .map((joined_seed_info: IUserJoinedSeedDetail) => {
                      const length = Object.values(joined_seeds).length;
                      const {
                        seed_status,
                        value_of_investment,
                        go_farm_url_link,
                      } = joined_seed_info;
                      if (length == 1) {
                        return (
                          <div className="frcs gap-1 text-primaryText whitespace-nowrap">
                            {value_of_investment} in{' '}
                            <a
                              className="cursor-pointer underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                openUrl(go_farm_url_link);
                              }}
                            >
                              farm
                            </a>
                          </div>
                        );
                      } else {
                        return (
                          <div className="frcs gap-1 text-primaryText whitespace-nowrap">
                            {value_of_investment} in{' '}
                            <a
                              className={`cursor-pointer underline text-primaryText hover:text-greenColor`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openUrl(go_farm_url_link);
                              }}
                            >
                              farm (
                              {seed_status == 'run'
                                ? 'new'
                                : seed_status == 'would_ended'
                                ? 'pre.'
                                : 'ended'}
                              )
                            </a>
                          </div>
                        );
                      }
                    })}
                </div>
              ) : tip_seed ? (
                <div className="frcs gap-1 text-primaryText">
                  0% in{' '}
                  <a
                    className="cursor-pointer underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openUrl(tip_seed.go_farm_url_link);
                    }}
                  >
                    farm
                  </a>
                </div>
              ) : null}
            </div>
          </div>
          {/* tip */}
          {tip_seed ? (
            <div
              className={`overflow-hidden ${
                hover ? 'bg-v3HoverDarkBgColor' : 'bg-cardBg rounded-b-xl'
              }`}
            >
              <div className="relative flex items-center pr-8  bg-dclFarmTipColor justify-end p-1">
                <TipIon className="mr-2 flex-shrink-0"></TipIon>
                <span className="text-sm mr-8  text-white">
                  <FormattedMessage id="you_can_earn_tip" />{' '}
                  <span className="font-gothamBold">{tip_seed.seed_apr}</span>
                </span>
                <div
                  className="flex items-center justify-center  text-white cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openUrl(tip_seed.go_farm_url_link);
                  }}
                >
                  <a className="text-sm text-white mr-1 underline">
                    <FormattedMessage id="go_farm" />
                  </a>
                  <LinkArrowIcon className="cursor-pointer"></LinkArrowIcon>
                </div>
              </div>
            </div>
          ) : null}

          <div
            className={`border-t border-v3BlueBorderColor w-full ${
              hover ? '' : 'hidden'
            }`}
          >
            <div className={`frcb bg-cardBg p-4 rounded-b-xl`}>
              {/* unclaimed fees */}
              <div className="frcc">
                <span className="text-sm text-v3SwapGray mr-2.5">
                  <FormattedMessage id="unclaimed_fees" />
                </span>
                <img
                  src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                  className="w-5 h-5 border border-greenColor rounded-full mr-1"
                ></img>
                <span className="text-sm text-white mr-3 gotham_bold">
                  {tokenFeeLeft || '-'}
                </span>
                <img
                  src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                  className="w-5 h-5 border border-greenColor rounded-full mr-1"
                ></img>
                <span className="text-sm text-white gotham_bold">
                  {tokenFeeRight || '-'}
                </span>
              </div>

              <div className="flex items-center justify-center">
                <div
                  className={`flex mr-2.5 w-24 h-8 items-center justify-center  rounded-lg text-sm px-3 py-1 ml-5  ${
                    !canClaim
                      ? 'bg-deepBlue text-white opacity-30 cursor-not-allowed'
                      : 'bg-deepBlue text-white hover:bg-lightBlue cursor-pointer'
                  }`}
                  onClick={claimRewards}
                >
                  <ButtonTextWrapper
                    loading={claim_loading}
                    Text={() => <FormattedMessage id="claim" />}
                  />
                </div>
                <GradientButton
                  onClick={(e) => {
                    e.stopPropagation();
                    const pool_name = get_pool_name(poolDetail.pool_id);
                    history.push(`/addLiquidityV2#${pool_name}`);
                  }}
                  color="#fff"
                  minWidth="5rem"
                  borderRadius="8px"
                  className={`px-3 w-24 h-8 text-center text-sm text-white  focus:outline-none mr-2.5`}
                >
                  <FormattedMessage id="add" />
                </GradientButton>
                <div
                  className={`relative flex items-center ${
                    joined_seeds_done ? '' : 'hidden'
                  }`}
                  onMouseEnter={() => {
                    if (!!joined_seeds) {
                      setRemoveButtonTip(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (!!joined_seeds) {
                      setRemoveButtonTip(false);
                    }
                  }}
                >
                  <BorderButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRemoveBox(true);
                    }}
                    rounded="rounded-lg"
                    disabled={!!joined_seeds}
                    px="px-0"
                    py="py-1"
                    style={{ minWidth: '5rem' }}
                    className={`flex-grow w-24  text-sm text-greenColor h-8 ${
                      !!joined_seeds ? 'opacity-40 pointer-events-none' : ''
                    }`}
                  >
                    <FormattedMessage id="remove" />
                  </BorderButton>
                  <div
                    className={`${
                      removeButtonTip ? '' : 'hidden'
                    } absolute z-50 left-20 border border-primaryText rounded-md px-2 py-1.5 text-xs text-farmText w-56 bg-cardBg`}
                  >
                    You have liquidity in farm, please unstake from{' '}
                    <a
                      className="underline cursor-pointer"
                      onClick={() => {
                        localStorage.setItem('BOOST_FARM_TAB', 'yours');
                        openUrl('/v2farms');
                      }}
                    >
                      Your Farm
                    </a>{' '}
                    first.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showRemoveBox ? (
        <RemovePoolV3
          isOpen={showRemoveBox}
          onRequestClose={() => {
            setShowRemoveBox(false);
          }}
          listLiquidities={liquidities_list}
          tokenMetadata_x_y={tokenMetadata_x_y}
          poolDetail={poolDetail}
          tokenPriceList={tokenPriceList}
          userLiquidity={list_liquidities[0]}
          style={{
            overlay: {
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
            },
            content: {
              outline: 'none',
              transform: 'translate(-50%, -50%)',
            },
          }}
        ></RemovePoolV3>
      ) : null}
    </div>
  );
}
function UserLiquidityLineStyleGroupStyle2() {
  if (is_mobile) {
    return (
      <UserLiquidityLineStyleGroupStyle2Mobile></UserLiquidityLineStyleGroupStyle2Mobile>
    );
  } else {
    return (
      <UserLiquidityLineStyleGroupStyle2Pc></UserLiquidityLineStyleGroupStyle2Pc>
    );
  }
}
function UserLiquidityLineStyleGroupStyle2Mobile() {
  const {
    tip_seed,
    tokens,
    fee,
    intersectionRangeList,
    ratedMapTokens,
    isInRange,
    accountAPR,
    joined_seeds,
    sort_joined_seeds,
    your_liquidity,
    tokenMetadata_x_y,
    tokenFeeLeft,
    tokenFeeRight,
    poolDetail,
    tokenFeeValue,
  } = useContext(GroupData);
  const [switch_off, set_switch_off] = useState<boolean>(true);
  function goPoolDetailPage() {
    const params_str = get_pool_name(poolDetail.pool_id);
    openUrl(`/poolV2/${params_str}`);
  }
  return (
    <>
      <div
        className={`rounded-xl mt-3 mx-4 bg-portfolioBgColor ${
          switch_off ? '' : 'border border-border_light_grey_color'
        }`}
      >
        <div className="px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center flex-shrink-0 mr-2.5">
                <img
                  src={tokens[0]?.icon}
                  className="w-7 h-7 border border-greenColor rounded-full"
                ></img>
                <img
                  src={tokens[1]?.icon}
                  className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
                ></img>
              </div>
              <span className="text-white font-bold text-sm gotham_bold">
                {tokens[0]?.['symbol']}-{tokens[1]?.['symbol']}
              </span>
            </div>
            <span className="text-white text-sm gotham_bold">
              {your_liquidity || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center">
              <span className="flex items-center justify-center text-xs text-v3SwapGray bg-portfolioFeeBgColor rounded-md px-1.5 mr-1.5 py-0.5">
                {+fee / 10000}%
              </span>
              <span
                onClick={() => {
                  goPoolDetailPage();
                }}
                className="flex items-center justify-center text-xs text-v3SwapGray bg-selectTokenV3BgColor rounded-md px-1.5 cursor-pointer hover:text-white  py-0.5  mr-1.5"
              >
                <FormattedMessage id="dcl_pool" />{' '}
                <LinkIcon className="ml-1"></LinkIcon>
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex items-center mr-1.5">
                <WaterDropIcon className="m-1.5"></WaterDropIcon>
                <span className="text-xs text-portfolioGreenColor gotham_bold">
                  {tokenFeeValue}
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
          className={`border-t border-limitOrderFeeTiersBorderColor ${
            switch_off ? 'hidden' : ''
          }`}
        >
          <div className="p-3">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start relative top-0.5">
                <span className="text-sm text-v3SwapGray whitespace-nowrap">
                  <FormattedMessage id="price_range" />
                </span>
                <div className="flex items-center justify-center bg-selectTokenV3BgColor rounded-md px-1.5 h-5 py-0.5 ml-1.5">
                  <span
                    className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isInRange
                        ? 'bg-gradientFromHover'
                        : 'bg-v3GarkWarningColor'
                    }`}
                  ></span>
                  <span
                    className={`whitespace-nowrap text-xs ${
                      isInRange
                        ? 'text-gradientFromHover'
                        : 'text-v3GarkWarningColor'
                    }`}
                  >
                    {isInRange ? (
                      <FormattedMessage id="in_range"></FormattedMessage>
                    ) : (
                      <FormattedMessage id="out_of_range"></FormattedMessage>
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {intersectionRangeList.map((range: string[], i: number) => {
                  return (
                    <div className="text-white whitespace-nowrap text-sm">
                      <span>
                        {displayNumberToAppropriateDecimals(range[0])}
                      </span>
                      <span className="mx-1">-</span>

                      <span>
                        {displayNumberToAppropriateDecimals(range[1])}
                      </span>
                      {intersectionRangeList.length > 1 &&
                        i < intersectionRangeList.length - 1 && <span>,</span>}
                    </div>
                  );
                })}
                <span className="text-xs ml-1 text-v3SwapGray">
                  {ratedMapTokens}
                </span>
              </div>
            </div>
            <div className="flex items-start justify-between mb-5">
              <span className="text-sm text-v3SwapGray">APR(24h)</span>
              <div className="flex flex-col items-end">
                <span className="text-sm">{accountAPR || '-'}</span>
                {joined_seeds ? (
                  <div className="flex flex-col items-end gap-1 text-xs">
                    {Object.values(joined_seeds)
                      .sort(sort_joined_seeds)
                      .map((joined_seed_info: IUserJoinedSeedDetail) => {
                        const length = Object.values(joined_seeds).length;
                        const { seed_apr, seed_status } = joined_seed_info;
                        if (seed_status == 'ended') return null;
                        if (length == 1) {
                          return (
                            <div className="frcs gap-1 text-v3SwapGray whitespace-nowrap">
                              <span>
                                <FormattedMessage
                                  id="farm_apr"
                                  defaultMessage={'Farm APR'}
                                ></FormattedMessage>
                              </span>
                              <span>{seed_apr}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="frcs gap-1 text-v3SwapGray whitespace-nowrap">
                              <span>
                                ({seed_status == 'run' ? 'new' : 'pre.'}) APR
                              </span>
                              <span>{seed_apr}</span>
                            </div>
                          );
                        }
                      })}
                  </div>
                ) : tip_seed ? (
                  <div className="frcs gap-1 text-v3SwapGray text-xs">
                    <span>
                      <FormattedMessage
                        id="farm_apr"
                        defaultMessage={'Farm APR'}
                      ></FormattedMessage>
                    </span>
                    <span>0%</span>
                  </div>
                ) : null}
              </div>
            </div>
            {joined_seeds || tip_seed ? (
              <div className="flex items-start justify-between mb-6">
                <span className="text-sm text-v3SwapGray">
                  <FormattedMessage id="usage" />
                </span>
                {joined_seeds ? (
                  <div className="flex flex-col items-end gap-1">
                    {Object.values(joined_seeds)
                      .sort(sort_joined_seeds)
                      .map((joined_seed_info: IUserJoinedSeedDetail) => {
                        const length = Object.values(joined_seeds).length;
                        const {
                          seed_status,
                          value_of_investment,
                          go_farm_url_link,
                        } = joined_seed_info;
                        if (length == 1) {
                          return (
                            <div className="frcs gap-1 whitespace-nowrap text-v3SwapGray text-xs">
                              {value_of_investment} in{' '}
                              <a
                                className="cursor-pointer underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUrl(go_farm_url_link);
                                }}
                              >
                                farm
                              </a>
                            </div>
                          );
                        } else {
                          return (
                            <div className="frcs gap-1 whitespace-nowrap text-v3SwapGray text-xs">
                              {value_of_investment} in{' '}
                              <a
                                className={`cursor-pointer underline text-v3SwapGray hover:text-greenColor`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUrl(go_farm_url_link);
                                }}
                              >
                                farm (
                                {seed_status == 'run'
                                  ? 'new'
                                  : seed_status == 'would_ended'
                                  ? 'pre.'
                                  : 'ended'}
                                )
                              </a>
                            </div>
                          );
                        }
                      })}
                  </div>
                ) : tip_seed ? (
                  <div className="frcs gap-1 text-v3SwapGray text-xs">
                    0% in{' '}
                    <a
                      className="cursor-pointer underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUrl(tip_seed.go_farm_url_link);
                      }}
                    >
                      farm
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <span className="text-sm text-v3SwapGray whitespace-nowrap">
                <FormattedMessage id="unclaimed_fees" />
              </span>
              <div className="flex items-center">
                <img
                  src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                  className="w-5 h-5 border border-greenColor rounded-full mr-1.5"
                ></img>
                <span className="text-sm text-white mr-5 gotham_bold">
                  {tokenFeeLeft || '-'}
                </span>
                <img
                  src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                  className="w-5 h-5 border border-greenColor rounded-full mr-1.5"
                ></img>
                <span className="text-sm text-white gotham_bold">
                  {tokenFeeRight || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function UserLiquidityLineStyleGroupStyle2Pc() {
  const {
    tip_seed,
    tokens,
    fee,
    intersectionRangeList,
    ratedMapTokens,
    isInRange,
    accountAPR,
    joined_seeds,
    sort_joined_seeds,
    your_liquidity,
    tokenMetadata_x_y,
    tokenFeeLeft,
    tokenFeeRight,
    poolDetail,
    tokenFeeValue,
  } = useContext(GroupData);
  const [switch_off, set_switch_off] = useState<boolean>(true);
  function goPoolDetailPage() {
    const params_str = get_pool_name(poolDetail.pool_id);
    openUrl(`/poolV2/${params_str}`);
  }
  return (
    <>
      <div
        className={`rounded-xl mt-3 bg-portfolioBgColor px-5 ${
          switch_off ? '' : 'pb-4'
        }`}
      >
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <div className="flex items-center flex-shrink-0 mr-2.5">
              <img
                src={tokens[0]?.icon}
                className="w-7 h-7 border border-greenColor rounded-full"
              ></img>
              <img
                src={tokens[1]?.icon}
                className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
              ></img>
            </div>
            <span className="text-white font-bold text-sm gotham_bold">
              {tokens[0]?.['symbol']}-{tokens[1]?.['symbol']}
            </span>
            <span className="flex items-center justify-center text-xs text-v3SwapGray bg-portfolioFeeBgColor rounded-md px-1.5 mx-1.5 py-0.5">
              {+fee / 10000}%
            </span>
            <span
              onClick={() => {
                goPoolDetailPage();
              }}
              className="flex items-center justify-center text-xs text-v3SwapGray bg-selectTokenV3BgColor rounded-md px-1.5 cursor-pointer hover:text-white  py-0.5  mr-1.5"
            >
              <FormattedMessage id="dcl_pool" />{' '}
              <LinkIcon className="ml-1"></LinkIcon>
            </span>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-5">
              <span className="text-white text-sm gotham_bold">
                {your_liquidity || '-'}
              </span>
              <div className="flex items-center">
                <WaterDropIcon className="m-1.5"></WaterDropIcon>
                <span className="text-xs text-portfolioGreenColor gotham_bold">
                  {tokenFeeValue}
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
                <FormattedMessage id="price_range" />
              </span>
              <div className="flex items-center text-sm text-white">
                <div className="flex items-center justify-center bg-selectTokenV3BgColor rounded-md px-3 h-5 py-0.5 mr-2">
                  <span
                    className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isInRange
                        ? 'bg-gradientFromHover'
                        : 'bg-v3GarkWarningColor'
                    }`}
                  ></span>
                  <span
                    className={`whitespace-nowrap text-xs ${
                      isInRange
                        ? 'text-gradientFromHover'
                        : 'text-v3GarkWarningColor'
                    }`}
                  >
                    {isInRange ? (
                      <FormattedMessage id="in_range"></FormattedMessage>
                    ) : (
                      <FormattedMessage id="out_of_range"></FormattedMessage>
                    )}
                  </span>
                </div>
                <div className="flex items-center flex-wrap">
                  {intersectionRangeList.map((range: string[], i: number) => {
                    return (
                      <div className="text-white whitespace-nowrap text-sm">
                        <span>
                          {displayNumberToAppropriateDecimals(range[0])}
                        </span>
                        <span className="mx-1">-</span>

                        <span>
                          {displayNumberToAppropriateDecimals(range[1])}
                        </span>
                        {intersectionRangeList.length > 1 &&
                          i < intersectionRangeList.length - 1 && (
                            <span className="mr-1">,</span>
                          )}
                      </div>
                    );
                  })}
                  <span className="text-xs ml-1 text-v3SwapGray">
                    {ratedMapTokens}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-v3SwapGray">APR(24h)</span>
              <div className="flex items-center">
                <span className="text-sm mr-2">{accountAPR || '-'}</span>
                {joined_seeds ? (
                  <div className="flex items-center gap-2 text-xs">
                    {Object.values(joined_seeds)
                      .sort(sort_joined_seeds)
                      .map((joined_seed_info: IUserJoinedSeedDetail) => {
                        const length = Object.values(joined_seeds).length;
                        const { seed_apr, seed_status } = joined_seed_info;
                        if (seed_status == 'ended') return null;
                        if (length == 1) {
                          return (
                            <div className="frcs gap-1 text-v3SwapGray whitespace-nowrap">
                              <span>
                                <FormattedMessage
                                  id="farm_apr"
                                  defaultMessage={'Farm APR'}
                                ></FormattedMessage>
                              </span>
                              <span>{seed_apr}</span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="frcs gap-1 text-v3SwapGray whitespace-nowrap">
                              <span>
                                ({seed_status == 'run' ? 'new' : 'pre.'}) APR
                              </span>
                              <span>{seed_apr}</span>
                            </div>
                          );
                        }
                      })}
                  </div>
                ) : tip_seed ? (
                  <div className="frcs gap-1 text-v3SwapGray text-xs">
                    <span>
                      <FormattedMessage
                        id="farm_apr"
                        defaultMessage={'Farm APR'}
                      ></FormattedMessage>
                    </span>
                    <span>0%</span>
                  </div>
                ) : null}
              </div>
            </div>
            {joined_seeds || tip_seed ? (
              <div className="flex items-start justify-between mb-6">
                <span className="text-sm text-v3SwapGray">
                  <FormattedMessage id="usage" />
                </span>
                {joined_seeds ? (
                  <div className="flex flex-col items-end gap-2">
                    {Object.values(joined_seeds)
                      .sort(sort_joined_seeds)
                      .map((joined_seed_info: IUserJoinedSeedDetail) => {
                        const length = Object.values(joined_seeds).length;
                        const {
                          seed_status,
                          value_of_investment,
                          go_farm_url_link,
                        } = joined_seed_info;
                        if (length == 1) {
                          return (
                            <div className="frcs gap-1 whitespace-nowrap text-v3SwapGray text-xs">
                              {value_of_investment} in{' '}
                              <a
                                className="cursor-pointer underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUrl(go_farm_url_link);
                                }}
                              >
                                farm
                              </a>
                            </div>
                          );
                        } else {
                          return (
                            <div className="frcs gap-1 whitespace-nowrap text-v3SwapGray text-xs">
                              {value_of_investment} in{' '}
                              <a
                                className={`cursor-pointer underline text-v3SwapGray hover:text-greenColor`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openUrl(go_farm_url_link);
                                }}
                              >
                                farm (
                                {seed_status == 'run'
                                  ? 'new'
                                  : seed_status == 'would_ended'
                                  ? 'pre.'
                                  : 'ended'}
                                )
                              </a>
                            </div>
                          );
                        }
                      })}
                  </div>
                ) : tip_seed ? (
                  <div className="frcs gap-1 text-v3SwapGray text-xs">
                    0% in{' '}
                    <a
                      className="cursor-pointer underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUrl(tip_seed.go_farm_url_link);
                      }}
                    >
                      farm
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <span className="text-sm text-v3SwapGray">
                <FormattedMessage id="unclaimed_fees" />
              </span>
              <div className="flex items-center">
                <img
                  src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                  className="w-5 h-5 border border-greenColor rounded-full mr-1.5"
                ></img>
                <span className="text-sm text-white mr-5 gotham_bold">
                  {tokenFeeLeft || '-'}
                </span>
                <img
                  src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                  className="w-5 h-5 border border-greenColor rounded-full mr-1.5"
                ></img>
                <span className="text-sm text-white gotham_bold">
                  {tokenFeeRight || '-'}
                </span>
                <span className="tex-sm text-portfolioQinColor pl-3.5 border-l border-orderTypeBg ml-3.5">
                  {tokenFeeValue}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
interface IUserJoinedSeed {
  seed_id?: IUserJoinedSeedDetail;
}
interface IUserJoinedSeedDetail {
  seed: Seed;
  liquidities: UserLiquidityInfo[];
  seed_apr?: string;
  value_of_investment?: string;
  seed_status?: 'run' | 'would_ended' | 'ended';
  seed_status_num?: number;
  go_farm_url_link?: string;
}
interface ILatestSeedTip {
  seed: Seed;
  seed_apr: string;
  go_farm_url_link: string;
}
