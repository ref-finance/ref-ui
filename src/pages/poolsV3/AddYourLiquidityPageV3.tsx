import React, { useState, useContext, useEffect, createContext } from 'react';
import { ReturnIcon, WarningIcon } from 'src/components/icon/V3';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useTriTokens, useWhitelistTokens } from '../../state/token';
import { useTriTokenIdsOnRef } from '../../services/aurora/aurora';
import {
  TokenMetadata,
  ftGetBalance,
  ftGetTokenMetadata,
} from '../../services/ft-contract';
import { getBoostTokenPrices } from '../../services/farm';
import { useDepositableBalance } from '../../state/token';
import Loading from 'src/components/layout/Loading';
import { list_pools, PoolInfo } from '../../services/swapV3';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import {
  CONSTANT_D,
  DEFAULTSELECTEDFEE,
  useAddLiquidityUrlHandle,
  get_pool_id,
  get_pool_name,
  getBinPointByPoint,
  get_l_amount_by_condition,
  UserLiquidityInfo,
  sort_tokens_by_base,
} from '../../services/commonV3';
import {
  formatWithCommas,
  toReadableNumber,
  toNonDivisibleNumber,
  scientificNotationToString,
  getAllocationsLeastOne,
} from 'src/utils/numbers';
import { WalletContext } from '../../utils/wallets-integration';
import _, { forEach, set } from 'lodash';
import BigNumber from 'bignumber.js';
import { isMobile } from '../../utils/device';
import { ArrowDownV3 } from '../../components/icon/swapV3';

import Big from 'big.js';
import { SelectTokenDCL } from '../../components/forms/SelectToken';
import {
  CurveShape,
  SpotShape,
  BidAskShape,
} from '../Orderly/components/Common/Icons';
import DclChart from '../../components/d3Chart/DclChart';
import {
  IAddLiquidityInfo,
  IAddLiquidityInfoHelp,
  LiquidityShape,
} from './interfaces';
import {
  get_custom_config_for_chart,
  get_default_config_for_chart,
  max_nft_divisional_per_side,
} from '../../components/d3Chart/config';
import {
  IChartItemConfig,
  IChartConfig,
} from '../../components/d3Chart/interfaces';
import { isInvalid } from '../../components/d3Chart/utils';
import { PointsComponent } from './components/add/PointsComponent';
import { AddLiquidityButton } from './components/add/AddLiquidityButton';
import { NoDataComponent } from './components/add/NoDataComponent';
import { InputAmount } from './components/add/InputAmount';
import { PairComponent } from './components/add/PairComponent';
import { SelectFeeTiers } from './components/add/SelectFeeTiers';
import { FeeTipDcl } from '../../components/pool/FeeTip';

export const LiquidityProviderData = createContext(null);
export default function AddYourLiquidityPageV3() {
  const [tokenX, setTokenX] = useState<TokenMetadata>(null);
  const [tokenY, setTokenY] = useState<TokenMetadata>(null);
  const [tokenXAmount, setTokenXAmount] = useState('');
  const [tokenYAmount, setTokenYAmount] = useState('');
  const [leftPoint, setLeftPoint] = useState<number>();
  const [rightPoint, setRightPoint] = useState<number>();
  const [currentPoint, setCurrentPoint] = useState<number>();
  const [onlyAddYToken, setOnlyAddYToken] = useState(false);
  const [onlyAddXToken, setOnlyAddXToken] = useState(false);
  const [invalidRange, setInvalidRange] = useState(false);
  const [currentSelectedPool, setCurrentSelectedPool] =
    useState<PoolInfo>(null);
  const [listPool, setListPool] = useState<PoolInfo[]>([]);
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const [currentPools, setCurrentPools] =
    useState<Record<string, PoolInfo>>(null);
  const [tokenXBalanceFromNear, setTokenXBalanceFromNear] = useState<string>();
  const [tokenYBalanceFromNear, setTokenYBalanceFromNear] = useState<string>();

  const [selectHover, setSelectHover] = useState(false);

  const [binNumber, setBinNumber] = useState();
  const [liquidityShape, setLiquidityShape] = useState<LiquidityShape>('Spot');
  const [SLOT_NUMBER, SET_SLOT_NUMBER] = useState<number>();
  const [BIN_WIDTH, SET_BIN_WIDTH] = useState<number>();
  const [token_amount_tip, set_token_amount_tip] =
    useState<React.ReactElement>();
  const [only_suppport_spot_shape, set_only_suppport_spot_shape] =
    useState<boolean>(false);
  const [switch_pool_loading, set_switch_pool_loading] =
    useState<boolean>(true);
  const [new_user_liquidities, set_new_user_liquidities] = useState<
    UserLiquidityInfo[]
  >([]);
  const [pair_is_reverse, set_pair_is_reverse] = useState<boolean>(false);
  const [show_chart, set_show_chart] = useState<boolean>(true);

  // callBack handle
  useAddLiquidityUrlHandle();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const nearBalance = useDepositableBalance('NEAR');
  const history = useHistory();
  const triTokenIds = useTriTokenIdsOnRef();
  const refTokens = useWhitelistTokens((triTokenIds || []).concat(['aurora']));
  const triTokens = useTriTokens();
  const OPEN_CREATE_POOL_ENTRY = false;
  const mobileDevice = isMobile();

  // init
  useEffect(() => {
    getBoostTokenPrices().then(setTokenPriceList);
    get_list_pools();
  }, []);

  // get balance of tokenX and tokenY
  useEffect(() => {
    if (tokenX) {
      const tokenXId = tokenX.id;
      if (tokenXId) {
        if (isSignedIn) {
          ftGetBalance(tokenXId).then((available: string) =>
            setTokenXBalanceFromNear(
              toReadableNumber(
                tokenX.decimals,
                tokenX.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : available
              )
            )
          );
        }
      }
    }
    if (tokenY) {
      const tokenYId = tokenY.id;
      if (tokenYId) {
        if (isSignedIn) {
          ftGetBalance(tokenYId).then((available: string) =>
            setTokenYBalanceFromNear(
              toReadableNumber(
                tokenY.decimals,
                tokenY.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : available
              )
            )
          );
        }
      }
    }
  }, [tokenX, tokenY, isSignedIn, nearBalance]);

  // get tokenX and tokenY by hash
  useEffect(() => {
    if (listPool.length > 0) {
      get_init_pool();
    }
  }, [listPool]);

  // update hash by tokenX and tokenY
  useEffect(() => {
    if (currentSelectedPool && tokenX && tokenY) {
      const { fee } = currentSelectedPool;
      const link = get_pool_name(`${tokenX.id}|${tokenY.id}|${fee}`);
      history.replace(`#${link}`);
    }
  }, [currentSelectedPool, tokenX, tokenY]);

  // get currentPools and currentSelectedPool by tokenX and tokenY
  useEffect(() => {
    if (tokenX && tokenY) {
      searchPools();
    }
  }, [tokenX, tokenY, tokenPriceList, listPool]);

  // get base info of currentSelectedPool
  useEffect(() => {
    if (currentSelectedPool?.pool_id) {
      const { current_point, point_delta } = currentSelectedPool;
      const n = get_slot_number_in_a_bin();
      const bin_width = n * point_delta;
      SET_SLOT_NUMBER(n);
      SET_BIN_WIDTH(bin_width);
      setCurrentPoint(current_point);
      set_switch_pool_loading(false);
      set_pair_is_reverse(is_reverse_fun());
      set_new_user_liquidities([]);
    }
  }, [currentSelectedPool]);

  // if one bin and inRange then spot mode can only be used
  useEffect(() => {
    set_only_suppport_spot_shape(false);
    if (currentSelectedPool) {
      const { point_delta } = currentSelectedPool;
      if (leftPoint <= currentPoint && rightPoint > currentPoint) {
        // inrange
        const binWidth = SLOT_NUMBER * point_delta;
        const binNumber = (rightPoint - leftPoint) / binWidth;
        if (binNumber == 1) {
          setLiquidityShape('Spot');
          set_only_suppport_spot_shape(true);
          if (tokenXAmount) {
            changeTokenXAmount(tokenXAmount);
          } else if (tokenYAmount) {
            changeTokenYAmount(tokenYAmount);
          }
        }
      }
    }
  }, [
    leftPoint,
    rightPoint,
    currentPoint,
    currentSelectedPool,
    liquidityShape,
  ]);

  // clean error tip
  useEffect(() => {
    set_token_amount_tip(null);
  }, [tokenXAmount, tokenYAmount, currentSelectedPool]);

  function changeTokenXAmount(amount: string = '0') {
    setTokenXAmount(amount);
    if (!onlyAddXToken && liquidityShape === 'Spot') {
      const amount_result = getTokenYAmountByCondition({
        amount,
        leftPoint,
        rightPoint,
        currentPoint,
      });
      setTokenYAmount(amount_result);
    }
  }
  function changeTokenYAmount(amount: string = '0') {
    setTokenYAmount(amount);
    if (!onlyAddYToken && liquidityShape === 'Spot') {
      const amount_result = getTokenXAmountByCondition({
        amount,
        leftPoint,
        rightPoint,
        currentPoint,
      });
      setTokenXAmount(amount_result);
    }
  }
  function getTokenYAmountByCondition({
    amount,
    leftPoint,
    rightPoint,
    currentPoint,
  }: {
    amount: string;
    leftPoint: number;
    rightPoint: number;
    currentPoint: number;
  }) {
    const { token_x, token_y } = currentSelectedPool;
    const token_x_decimals =
      tokenX.id == token_x ? tokenX.decimals : tokenY.decimals;
    const token_y_decimals =
      tokenY.id == token_y ? tokenY.decimals : tokenX.decimals;
    if (+amount == 0) {
      return '';
    } else {
      // X-->L
      const L =
        +amount *
        ((Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1)) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - currentPoint - 1) - 1));
      // L-->current Y
      const Yc = L * Math.pow(Math.sqrt(CONSTANT_D), currentPoint);
      // L--> Y
      const Y =
        L *
        ((Math.pow(Math.sqrt(CONSTANT_D), currentPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
          (Math.sqrt(CONSTANT_D) - 1));
      const decimalsRate =
        Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);

      const Y_result = (Y + Yc) * decimalsRate;
      return Y_result.toString();
    }
  }
  function getTokenXAmountByCondition({
    amount,
    leftPoint,
    rightPoint,
    currentPoint,
  }: {
    amount: string;
    leftPoint: number;
    rightPoint: number;
    currentPoint: number;
  }) {
    const { token_x, token_y } = currentSelectedPool;
    const token_x_decimals =
      tokenX.id == token_x ? tokenX.decimals : tokenY.decimals;
    const token_y_decimals =
      tokenY.id == token_y ? tokenY.decimals : tokenX.decimals;
    if (+amount == 0) {
      return '';
    } else {
      let L;
      // Yc-->L
      if (leftPoint == currentPoint) {
        L = +amount * (1 / Math.pow(Math.sqrt(CONSTANT_D), currentPoint));
      } else {
        // Y-->L
        L =
          +amount *
          ((Math.sqrt(CONSTANT_D) - 1) /
            (Math.pow(Math.sqrt(CONSTANT_D), currentPoint) -
              Math.pow(Math.sqrt(CONSTANT_D), leftPoint)));
      }
      const X =
        L *
        ((Math.pow(Math.sqrt(CONSTANT_D), rightPoint - currentPoint - 1) - 1) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
            Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1)));
      const decimalsRate =
        Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
      const X_result = X * decimalsRate;
      return X_result.toString();
    }
  }
  function get_slot_number_in_a_bin() {
    const pool_id = currentSelectedPool?.pool_id;
    const { bin } = get_default_config_for_chart() as IChartItemConfig;
    const custom_config: IChartConfig = get_custom_config_for_chart();
    const slots = custom_config[pool_id]?.bin || bin;
    return slots;
  }
  async function get_list_pools() {
    const list: PoolInfo[] = await list_pools();

    await Promise.all(
      list.map(async (p: PoolInfo) => {
        const token_x_metadata = await ftGetTokenMetadata(p.token_x);
        const token_y_metadata = await ftGetTokenMetadata(p.token_y);
        p.token_x_metadata = token_x_metadata;
        p.token_y_metadata = token_y_metadata;
        return p;
      })
    );

    if (list.length > 0) {
      setListPool(list);
    }
  }
  async function get_init_pool() {
    let tokenx_id, tokeny_id, pool_fee;
    const hash = decodeURIComponent(location.hash);
    if (hash.indexOf('<>') > -1) {
      // new link
      [tokenx_id, tokeny_id, pool_fee] = get_pool_id(hash.slice(1)).split('|');
    } else {
      // old link
      [tokenx_id, tokeny_id, pool_fee] = hash.slice(1).split('|');
    }
    if (tokenx_id && tokeny_id && pool_fee) {
      const tokenx = await ftGetTokenMetadata(tokenx_id);
      const tokeny = await ftGetTokenMetadata(tokeny_id);
      listPool.find((pool: PoolInfo) => {
        const { token_x, token_y } = pool;
        if (token_x == tokenx.id && token_y == tokeny.id) {
          setTokenX(tokenx);
          setTokenY(tokeny);
          return true;
        }
        if (token_x == tokeny.id && token_y == tokenx.id) {
          setTokenX(tokeny);
          setTokenY(tokenx);
          return true;
        }
      });
    }
  }
  function searchPools() {
    const hash = decodeURIComponent(location.hash);
    let url_fee;
    if (hash.indexOf('<>') > -1) {
      url_fee = +get_pool_id(hash.slice(1)).split('|')[2];
    } else {
      url_fee = +hash.slice(1).split('|')[2];
    }
    const currentPoolsMap = {};
    if (listPool.length > 0 && tokenX && tokenY) {
      set_switch_pool_loading(true);
      const availablePools: PoolInfo[] = listPool.filter((pool: PoolInfo) => {
        // TODO 增加pool 状态的判断
        const { token_x, token_y, state } = pool;
        if (
          (token_x == tokenX.id && token_y == tokenY.id) ||
          (token_x == tokenY.id && token_y == tokenX.id)
        )
          return true;
      });
      if (availablePools.length > 0) {
        /*** percent start */
        const tvlList: number[] = [];
        availablePools.map((p: PoolInfo) => {
          const {
            total_x,
            total_y,
            token_x,
            token_y,
            total_fee_x_charged,
            total_fee_y_charged,
          } = p;
          const firstToken = tokenX.id == token_x ? tokenX : tokenY;
          const secondToken = tokenY.id == token_y ? tokenY : tokenX;
          const firstTokenPrice =
            (tokenPriceList &&
              tokenPriceList[firstToken.id] &&
              tokenPriceList[firstToken.id].price) ||
            '0';
          const secondTokenPrice =
            (tokenPriceList &&
              tokenPriceList[secondToken.id] &&
              tokenPriceList[secondToken.id].price) ||
            '0';
          const totalX = new BigNumber(total_x)
            .minus(total_fee_x_charged || 0)
            .toFixed();
          const totalY = new BigNumber(total_y)
            .minus(total_fee_y_charged || 0)
            .toFixed();
          const tvlx = new Big(toReadableNumber(firstToken.decimals, totalX))
            .times(firstTokenPrice)
            .toNumber();
          const tvly = new Big(toReadableNumber(secondToken.decimals, totalY))
            .times(secondTokenPrice)
            .toNumber();
          const totalTvl = tvlx + tvly;
          p.tvl = totalTvl;
          tvlList.push(totalTvl);
          return p;
        });
        const sumOfTvlList = _.sum(tvlList);
        const tvlPercents =
          sumOfTvlList === 0
            ? ['0', '0', '0', '0']
            : availablePools.map((p: PoolInfo) =>
                scientificNotationToString(
                  ((p.tvl / sumOfTvlList) * 100).toString()
                )
              );
        const nonZeroIndexes: number[] = [];
        tvlPercents.forEach((p, index) => {
          if (Number(p) > 0) {
            nonZeroIndexes.push(index);
          }
        });
        const nonZeroPercents = tvlPercents.filter((r) => Number(r) > 0);
        const checkedNonZero = getAllocationsLeastOne(nonZeroPercents);
        const finalPercents = tvlPercents.map((p, index) => {
          if (nonZeroIndexes.includes(index)) {
            const newP = checkedNonZero[nonZeroIndexes.indexOf(index)];
            return newP;
          }
          return p;
        });
        const maxPercent = _.max(finalPercents);
        let maxPercentPool;
        availablePools.forEach((pool: PoolInfo, index) => {
          const f = pool.fee;
          const temp: PoolInfo = {
            ...pool,
            percent: finalPercents[index],
            tvl: tvlList[index],
          };
          currentPoolsMap[f] = temp;
          if (finalPercents[index] == maxPercent) {
            maxPercentPool = temp;
          }
        });
        // url-fee-pool
        const urlFeePool = url_fee
          ? currentPoolsMap[url_fee] || { fee: url_fee }
          : null;
        setCurrentPools(currentPoolsMap);
        setCurrentSelectedPool(urlFeePool || maxPercentPool);
      } else {
        setCurrentPools({});
        setCurrentSelectedPool({ fee: url_fee || DEFAULTSELECTEDFEE });
      }
    } else {
      setCurrentPools({});
      if (tokenX && tokenY) {
        setCurrentSelectedPool({ fee: url_fee || DEFAULTSELECTEDFEE });
      }
    }
  }
  function is_reverse_fun() {
    const { token_x_metadata, token_y_metadata } = currentSelectedPool;
    if (token_x_metadata && token_y_metadata) {
      const tokens = sort_tokens_by_base([token_x_metadata, token_y_metadata]);
      return tokens[0].id !== token_x_metadata.id;
    }
    return false;
  }
  function goYourLiquidityPage() {
    if (history.length == 2) {
      history.push('/yourliquidity');
    } else {
      history.goBack();
    }
  }
  function switchSelectedFee(fee: number) {
    if (tokenX && tokenY && currentPools) {
      const pool = currentPools[fee];
      setCurrentSelectedPool(pool || { fee });
      if (!pool) {
        setOnlyAddXToken(false);
        setOnlyAddYToken(false);
        setInvalidRange(false);
      }
    }
  }
  /**
   * step1 当数据发生改变
   *       leftPoint, rightPoint 有效
   *       tokenXAmount, tokenYAmount 至少有一个有值
   *       ===> 可以触发
   * step2 根据当前数据获实时获取新的 liquidtiy数据--->改成UserLiquidityInfo数据格式
   * step3 把新增的liquidity传递给Chart组件，
   * step4 chart组件把用户已有的liquidtiy + 新增的，划分成bin数据，生成新的图表
   * step5 疑问；？实时修改图表 会导致效率什么问题吗？
   */
  function generate_new_user_chart() {
    if (
      !isInvalid(leftPoint) &&
      !isInvalid(rightPoint) &&
      ((onlyAddXToken && +tokenXAmount > 0) ||
        (onlyAddYToken && +tokenYAmount > 0) ||
        (+tokenXAmount > 0 && +tokenYAmount > 0))
    ) {
      let new_nfts: any;
      if (liquidityShape == 'Spot') {
        const new_nft = getLiquiditySpot();
        new_nfts = [new_nft];
      } else {
        new_nfts = getLiquidityForCurveAndBidAskMode();
        if (!new_nfts) return;
      }
      const processed_new_nfts = process_liquidities(new_nfts);
      set_new_user_liquidities(processed_new_nfts);
    } else {
      set_new_user_liquidities([]);
    }
  }

  function getLiquiditySpot() {
    const { pool_id } = currentSelectedPool;
    return {
      pool_id,
      left_point: leftPoint,
      right_point: rightPoint,
      amount_x: toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0'),
      amount_y: toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0'),
      token_x: tokenX,
      token_y: tokenY,
    };
  }
  /**
   * curve 模式下，右侧（x）包含当前点位的 nfts划分
   * 此区间bin的数量要求 > 1
   * 双边
   * @param param0
   * @returns
   */
  function get_x_nfts_contain_current_curve({
    left_point,
    right_point,
  }: {
    left_point: number;
    right_point: number;
  }) {
    /**
     * 做等差时，包含当前点位的bin作为一个nft，宽度没必要跟其它的nft宽度一致，从而可以得到对另外一个token数量的最小要求
     * 另外一边做等差时，总的数量 - 当前点位的bin中包含的数量，剩下的做等差
     * 给的条件是左点位，大于当前点位的右点位
     * step 1 把包含当前点位bin 单独划分出来作为一个nft
     * step 2 把剩余的bin 划分若干个nft
     * step 3 总的nft 它们 token amount 之和固定，求出等差
     * step 4 求出等差后 得到包含当前点位的bin对另外一半的最低数量要求，数量满足就可以添加，不满足就不可以添加并给出提示
     */

    /**
     * 从左往右逐渐下降模式
     * 从右往左计算
     * e.g.
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenXAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenXAmount;
     * ===>dis = tokenXAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */
    const { pool_id, point_delta, current_point } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;

    // 不同点1
    const contain_cur_nft_left_point = left_point;
    const contain_cur_nft_right_point = left_point + binWidth;

    // 不同点2
    const exclude_cur_left_point = contain_cur_nft_right_point;
    const exclude_cur_right_point = right_point;

    const exclude_cur_total_bin_number =
      (exclude_cur_right_point - exclude_cur_left_point) / binWidth;
    let exclude_cur_total_nft_number;
    let exclude_cur_bin_number_in_a_nft;
    if (exclude_cur_total_bin_number < max_nft_divisional_per_side) {
      exclude_cur_bin_number_in_a_nft = 1;
      exclude_cur_total_nft_number = exclude_cur_total_bin_number;
    } else {
      exclude_cur_bin_number_in_a_nft = Math.floor(
        exclude_cur_total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(
        exclude_cur_total_bin_number % max_nft_divisional_per_side
      );
      exclude_cur_total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth =
      point_delta * slot_number_in_a_bin * exclude_cur_bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < exclude_cur_total_nft_number; i++) {
      // 不同点3
      let left_i_point;
      let right_i_point;
      if (i == exclude_cur_total_nft_number - 1) {
        left_i_point = exclude_cur_left_point;
      } else {
        left_i_point = exclude_cur_right_point - nftWidth * (i + 1);
      }
      right_i_point = exclude_cur_right_point - nftWidth * i;
      const const_i = Big(i + 1).mul(
        formula_of_token_x(left_i_point, right_i_point)
      );

      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }

    // 不同点4
    const const_last = Big(exclude_cur_total_nft_number + 1).mul(
      formula_of_token_x(current_point + 1, contain_cur_nft_right_point)
    );
    total_const = total_const.plus(const_last);

    addLiquidityInfoHelp[exclude_cur_total_nft_number] = {
      left_point: contain_cur_nft_left_point,
      right_point: contain_cur_nft_right_point,
      const_value: const_last.toFixed(),
    };

    // 不同点5
    let min_token_y_amount_needed_nonDivisible;
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0')
      ).div(total_const);
      for (let i = 0; i < exclude_cur_total_nft_number + 1; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_x = Big(dis).mul(const_value).toFixed(0);
        let amount_y;
        if (i == exclude_cur_total_nft_number) {
          amount_y = dis
            .mul(exclude_cur_total_nft_number + 1)
            .mul(formula_of_token_y(left_point, current_point + 1))
            .toFixed(0);
          min_token_y_amount_needed_nonDivisible = amount_y;
        }
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x,
          amount_y: amount_y || '0',
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }

    return {
      min_token_y_amount_needed_nonDivisible,
      addLiquidityInfoList,
      min_token_y_amount_needed: toReadableNumber(
        tokenY.decimals,
        min_token_y_amount_needed_nonDivisible
      ),
    };
  }
  /**
   * bid ask 模式下，左侧（y）包含当前点位的 nfts划分
   * 此区间bin的数量要求 > 1
   * 双边
   * @param param0
   * @returns
   */
  function get_y_nfts_contain_current_bid_ask({
    left_point,
    right_point,
  }: {
    left_point: number;
    right_point: number;
  }) {
    /**
     * 做等差时，包含当前点位的bin作为一个nft，宽度没必要跟其它的nft宽度一致，从而可以得到对另外一个token数量的最小要求
     * 另外一边做等差时，总的数量 - 当前点位的bin中包含的数量，剩下的做等差
     * 给的条件是左点位，大于当前点位的右点位
     * step 1 把包含当前点位bin 单独划分出来作为一个nft
     * step 2 把剩余的bin 划分若干个nft
     * step 3 总的nft 它们 token amount 之和固定，求出等差
     * step 4 求出等差后 得到包含当前点位的bin对另外一半的最低数量要求，数量满足就可以添加，不满足就不可以添加并给出提示
     */

    /**
     * 从左往右逐渐下降模式
     * 从右往左计算
     * e.g.
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenYAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenYAmount;
     * ===>dis = tokenYAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */

    const { pool_id, point_delta, current_point } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;
    // 不同点1
    const contain_cur_nft_left_point = right_point - binWidth;
    const contain_cur_nft_right_point = right_point;

    // 不同点2
    const exclude_cur_left_point = left_point;
    const exclude_cur_right_point = contain_cur_nft_left_point;

    const exclude_cur_total_bin_number =
      (exclude_cur_right_point - exclude_cur_left_point) / binWidth;
    let exclude_cur_total_nft_number;
    let exclude_cur_bin_number_in_a_nft;
    if (exclude_cur_total_bin_number < max_nft_divisional_per_side) {
      exclude_cur_bin_number_in_a_nft = 1;
      exclude_cur_total_nft_number = exclude_cur_total_bin_number;
    } else {
      exclude_cur_bin_number_in_a_nft = Math.floor(
        exclude_cur_total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(
        exclude_cur_total_bin_number % max_nft_divisional_per_side
      );
      exclude_cur_total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth =
      point_delta * slot_number_in_a_bin * exclude_cur_bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < exclude_cur_total_nft_number; i++) {
      // 不同点3
      let left_i_point;
      let right_i_point;
      if (i == exclude_cur_total_nft_number - 1) {
        left_i_point = exclude_cur_left_point;
      } else {
        left_i_point = exclude_cur_right_point - nftWidth * (i + 1);
      }
      right_i_point = exclude_cur_right_point - nftWidth * i;
      const const_i = Big(i + 2).mul(
        formula_of_token_y(left_i_point, right_i_point)
      );
      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i + 1] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }

    // 不同点4
    const const_last = Big(1).mul(
      formula_of_token_y(contain_cur_nft_left_point, current_point + 1)
    );
    total_const = total_const.plus(const_last);

    addLiquidityInfoHelp[0] = {
      left_point: contain_cur_nft_left_point,
      right_point: contain_cur_nft_right_point,
      const_value: const_last.toFixed(),
    };

    // 不同点5
    let min_token_x_amount_needed_nonDivisible;
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0')
      ).div(total_const);
      for (let i = 0; i < exclude_cur_total_nft_number + 1; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_y = Big(dis).mul(const_value).toFixed(0);
        let amount_x;
        if (i == 0) {
          amount_x = dis
            .mul(
              formula_of_token_x(current_point + 1, contain_cur_nft_right_point)
            )
            .toFixed(0);
          min_token_x_amount_needed_nonDivisible = amount_x;
        }
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x: amount_x || '0',
          amount_y: amount_y,
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }

    return {
      min_token_x_amount_needed_nonDivisible,
      addLiquidityInfoList,
      min_token_x_amount_needed: toReadableNumber(
        tokenX.decimals,
        min_token_x_amount_needed_nonDivisible
      ),
    };
  }
  /**
   * curve 和 bid ask 上升模式下
   * 单边
   * @param param0
   * @returns
   */
  function get_rise_pattern_nfts({
    left_point,
    right_point,
    token,
    token_amount,
    formula_fun,
    is_token_x,
    is_token_y,
  }: {
    left_point: number;
    right_point: number;
    token: TokenMetadata;
    token_amount: string;
    formula_fun: Function;
    is_token_x?: boolean;
    is_token_y?: boolean;
  }) {
    /**
     * 从左往右逐渐上升模式
     * 从左往右计算
     * e.g.
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenYAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenYAmount;
     * ===>dis = tokenYAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */
    const { pool_id, point_delta } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;
    const total_bin_number = (right_point - left_point) / binWidth;
    let total_nft_number;
    let bin_number_in_a_nft;
    if (total_bin_number < max_nft_divisional_per_side) {
      const unbroken_nft_number = Math.floor(total_bin_number);
      const has_remaining = !!(total_bin_number % 1);
      bin_number_in_a_nft = 1;
      total_nft_number = has_remaining
        ? unbroken_nft_number + 1
        : unbroken_nft_number;
    } else {
      bin_number_in_a_nft = Math.floor(
        total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(total_bin_number % max_nft_divisional_per_side);
      total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth = point_delta * slot_number_in_a_bin * bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < total_nft_number; i++) {
      const left_i_point = left_point + nftWidth * i;
      let right_i_point;
      if (i == total_nft_number - 1) {
        right_i_point = right_point;
      } else {
        right_i_point = left_point + nftWidth * (i + 1);
      }
      const const_i = Big(i + 1).mul(formula_fun(left_i_point, right_i_point));
      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(token.decimals, token_amount || '0')
      ).div(total_const);
      for (let i = 0; i < total_nft_number; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_i = Big(dis).mul(const_value).toFixed(0);
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x: is_token_x ? amount_i : '0',
          amount_y: is_token_y ? amount_i : '0',
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }
    return addLiquidityInfoList;
  }
  function formatWithCommas_for_tip(v: string, commas?: boolean) {
    const v_big = Big(v || 0);
    let v_temp;
    if (v_big.lt(0.001)) {
      v_temp = v_big.toFixed(6, 3);
    } else {
      if (commas) {
        v_temp = formatWithCommas(v_big.toFixed(3, 3));
      } else {
        v_temp = v_big.toFixed(3, 3);
      }
    }
    return v_temp;
  }
  function getLiquidityForCurveAndBidAskMode() {
    /**
     *  已知条件:
     *  bin的数量、一个bin里 slot的数量、leftPoint、rightPoint、tokenXAmount、tokenYAmount
     *  当前点位为point，以slot为单位 下一跳是 point + slot
     *  当前点位为point，以bin为单位 下一跳是 point + bin * slots
     *  最小的bin的高度就是等差的值 为dis
     **/
    let nftList: IAddLiquidityInfo[] = [];
    const get_x_nfts =
      liquidityShape == 'Curve'
        ? get_decline_pattern_nfts
        : get_rise_pattern_nfts;
    const get_y_nfts =
      liquidityShape == 'Curve'
        ? get_rise_pattern_nfts
        : get_decline_pattern_nfts;
    if (onlyAddYToken) {
      nftList = get_y_nfts({
        left_point: leftPoint,
        right_point: rightPoint,
        token: tokenY,
        token_amount: tokenYAmount,
        formula_fun: formula_of_token_y,
        is_token_y: true,
      });
    }
    if (onlyAddXToken) {
      nftList = get_x_nfts({
        left_point: leftPoint,
        right_point: rightPoint,
        token: tokenX,
        token_amount: tokenXAmount,
        formula_fun: formula_of_token_x,
        is_token_x: true,
      });
    }
    if (!onlyAddXToken && !onlyAddYToken) {
      /**
       * step1 先判断左侧bin的数量是否 > 1,是的话，左侧包含当前点作等差，否则右侧包含当前点位作等差
       * step2 分配好后，获得对右侧的最小token数量要求
       * step3 另外一侧 总的token数量减去 当前bin中包含的，剩下的 作单边 等差分配即可
       */
      const { point_delta, current_point } = currentSelectedPool;
      const current_l_point = getBinPointByPoint(
        point_delta,
        SLOT_NUMBER,
        current_point,
        'floor'
      );
      const current_r_point = getBinPointByPoint(
        point_delta,
        SLOT_NUMBER,
        current_point,
        'ceil'
      );
      const slot_number_in_a_bin = SLOT_NUMBER;
      const binWidth = slot_number_in_a_bin * point_delta;
      const bin_number_left = (current_point - leftPoint) / binWidth;
      const bin_number_right = (rightPoint - current_point) / binWidth;
      set_token_amount_tip(null);
      if (liquidityShape == 'Curve') {
        if (bin_number_left > 1) {
          // 左侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_x_amount_needed } =
            get_y_nfts_contain_current_curve({
              left_point: leftPoint,
              right_point: current_r_point,
            });
          nftList_y = addLiquidityInfoList;
          const remain_token_x_amount = Big(tokenXAmount).minus(
            min_token_x_amount_needed
          );

          if (remain_token_x_amount.lt(0)) {
            // 给出提示 token x 数量太少不能添加 1
            const a = formatWithCommas_for_tip(min_token_x_amount_needed);
            const a_display = formatWithCommas_for_tip(
              min_token_x_amount_needed,
              true
            );
            const tip = (
              <span>
                You need at least
                <a
                  onClick={() => {
                    setTokenXAmount(a);
                  }}
                  className="mx-0.5 cursor-pointer underline"
                >
                  {a_display}
                </a>
                {tokenX.symbol}
              </span>
            );
            set_token_amount_tip(tip);
            return;
          } else if (bin_number_right < 1) {
            // 给出提示 token x 数量太多，给用户提示只需要输入指定数量
            const a = formatWithCommas_for_tip(min_token_x_amount_needed);
            if (Big(tokenXAmount).gt(a)) {
              const a_display = formatWithCommas_for_tip(
                min_token_x_amount_needed,
                true
              );
              const tip = (
                <span>
                  Based on the price range you've selected, you only need to
                  provide
                  <a
                    onClick={() => {
                      setTokenXAmount(a);
                    }}
                    className="mx-0.5 cursor-pointer underline"
                  >
                    {a_display}
                  </a>
                  {tokenX.symbol}
                </span>
              );
              set_token_amount_tip(tip);
              return;
            }
          } else {
            nftList_x = get_decline_pattern_nfts({
              left_point: current_r_point,
              right_point: rightPoint,
              token: tokenX,
              token_amount: remain_token_x_amount.toFixed(),
              formula_fun: formula_of_token_x,
              is_token_x: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        } else {
          // 右侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_y_amount_needed } =
            get_x_nfts_contain_current_curve({
              left_point: current_l_point,
              right_point: rightPoint,
            });
          nftList_x = addLiquidityInfoList;

          const remain_token_y_amount = Big(tokenYAmount).minus(
            min_token_y_amount_needed
          );
          if (remain_token_y_amount.lt(0)) {
            // 给出提示 token y 数量太少不能添加 2
            const a = formatWithCommas_for_tip(min_token_y_amount_needed);
            const a_display = formatWithCommas_for_tip(
              min_token_y_amount_needed,
              true
            );
            const tip = (
              <span>
                You need at least
                <a
                  onClick={() => {
                    setTokenYAmount(a);
                  }}
                  className="mx-0.5 cursor-pointer underline"
                >
                  {a_display}
                </a>
                {tokenY.symbol}
              </span>
            );
            set_token_amount_tip(tip);
            return;
          } else if (bin_number_left < 1) {
            // 给出提示 token y 数量太多，给用户提示只需要输入指定数量
            const a = formatWithCommas_for_tip(min_token_y_amount_needed);
            if (Big(tokenYAmount).gt(a)) {
              const a_display = formatWithCommas_for_tip(
                min_token_y_amount_needed,
                true
              );
              const tip = (
                <span>
                  Based on the price range you've selected, you only need to
                  provide
                  <a
                    onClick={() => {
                      setTokenYAmount(a);
                    }}
                    className="mx-0.5 cursor-pointer underline"
                  >
                    {a_display}
                  </a>
                  {tokenY.symbol}
                </span>
              );
              set_token_amount_tip(tip);
              return;
            }
          } else {
            nftList_y = get_rise_pattern_nfts({
              left_point: leftPoint,
              right_point: current_l_point,
              token: tokenY,
              token_amount: remain_token_y_amount.toFixed(),
              formula_fun: formula_of_token_y,
              is_token_y: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        }
      } else {
        if (bin_number_left > 1) {
          // 左侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_x_amount_needed } =
            get_y_nfts_contain_current_bid_ask({
              left_point: leftPoint,
              right_point: current_r_point,
            });
          nftList_y = addLiquidityInfoList;
          const remain_token_x_amount = Big(tokenXAmount).minus(
            min_token_x_amount_needed
          );
          if (remain_token_x_amount.lt(0)) {
            // 给出提示 token x 数量太少不能添加 3
            const a = formatWithCommas_for_tip(min_token_x_amount_needed);
            const a_display = formatWithCommas_for_tip(
              min_token_x_amount_needed,
              true
            );
            const tip = (
              <span>
                You need at least
                <a
                  onClick={() => {
                    setTokenXAmount(a);
                  }}
                  className="mx-0.5 cursor-pointer underline"
                >
                  {a_display}
                </a>
                {tokenX.symbol}
              </span>
            );
            set_token_amount_tip(tip);
            return;
          } else if (bin_number_right < 1) {
            // 给出提示 token x 数量太多，给用户提示只需要输入指定数量
            const a = formatWithCommas_for_tip(min_token_x_amount_needed);
            if (Big(tokenXAmount).gt(a)) {
              const a_display = formatWithCommas_for_tip(
                min_token_x_amount_needed,
                true
              );
              const tip = (
                <span>
                  Based on the price range you've selected, you only need to
                  provide
                  <a
                    onClick={() => {
                      setTokenXAmount(a);
                    }}
                    className="mx-0.5 cursor-pointer underline"
                  >
                    {a_display}
                  </a>
                  {tokenX.symbol}
                </span>
              );
              set_token_amount_tip(tip);
              return;
            }
          } else {
            nftList_x = get_rise_pattern_nfts({
              left_point: current_r_point,
              right_point: rightPoint,
              token: tokenX,
              token_amount: remain_token_x_amount.toFixed(),
              formula_fun: formula_of_token_x,
              is_token_x: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        } else {
          // 右侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_y_amount_needed } =
            get_x_nfts_contain_current_bid_ask({
              left_point: current_l_point,
              right_point: rightPoint,
            });
          nftList_x = addLiquidityInfoList;

          const remain_token_y_amount = Big(tokenYAmount).minus(
            min_token_y_amount_needed
          );
          if (remain_token_y_amount.lt(0)) {
            // 给出提示 token y 数量太少不能添加 4
            const a = formatWithCommas_for_tip(min_token_y_amount_needed);
            const a_display = formatWithCommas_for_tip(
              min_token_y_amount_needed,
              true
            );
            const tip = (
              <span>
                You need at least
                <a
                  onClick={() => {
                    setTokenYAmount(a);
                  }}
                  className="mx-0.5 cursor-pointer underline"
                >
                  {a_display}
                </a>
                {tokenY.symbol}
              </span>
            );
            set_token_amount_tip(tip);
            return;
          } else if (bin_number_left < 1) {
            // 给出提示 token y 数量太多，给用户提示只需要输入指定数量
            const a = formatWithCommas_for_tip(min_token_y_amount_needed);
            if (Big(tokenYAmount).gt(a)) {
              const a_display = formatWithCommas_for_tip(
                min_token_y_amount_needed,
                true
              );
              const tip = (
                <span>
                  Based on the price range you've selected, you only need to
                  provide
                  <a
                    onClick={() => {
                      setTokenYAmount(a);
                    }}
                    className="mx-0.5 cursor-pointer underline"
                  >
                    {a_display}
                  </a>
                  {tokenY.symbol}
                </span>
              );
              set_token_amount_tip(tip);
              return;
            }
          } else {
            nftList_y = get_decline_pattern_nfts({
              left_point: leftPoint,
              right_point: current_l_point,
              token: tokenY,
              token_amount: remain_token_y_amount.toFixed(),
              formula_fun: formula_of_token_y,
              is_token_y: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        }
      }
    }
    return nftList;
  }
  /**
   * curve 模式下，左侧（y）包含当前点位的 nfts划分
   * 此区间bin的数量要求 > 1
   * 双边
   * @param param0
   * @returns
   */
  function get_y_nfts_contain_current_curve({
    left_point,
    right_point,
  }: {
    left_point: number;
    right_point: number;
  }) {
    /**
     * 做等差时，包含当前点位的bin作为一个nft，宽度没必要跟其它的nft宽度一致，从而可以得到对另外一个token数量的最小要求
     * 另外一边做等差时，总的数量 - 当前点位的bin中包含的数量，剩下的做等差
     * 给的条件是左点位，大于当前点位的右点位
     * step 1 把包含当前点位bin 单独划分出来作为一个nft
     * step 2 把剩余的bin 划分若干个nft
     * step 3 总的nft 它们 token amount 之和固定，求出等差
     * step 4 求出等差后 得到包含当前点位的bin对另外一半的最低数量要求，数量满足就可以添加，不满足就不可以添加并给出提示
     */

    /**
     * 从左往右逐渐上升模式
     * 从左往右计算
     * e.g.
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenYAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenYAmount;
     * ===>dis = tokenYAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */

    const { pool_id, point_delta, current_point } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;

    const contain_cur_nft_left_point = right_point - binWidth;
    const contain_cur_nft_right_point = right_point;

    const exclude_cur_left_point = left_point;
    const exclude_cur_right_point = contain_cur_nft_left_point;

    const exclude_cur_total_bin_number =
      (exclude_cur_right_point - exclude_cur_left_point) / binWidth;
    let exclude_cur_total_nft_number;
    let exclude_cur_bin_number_in_a_nft;
    if (exclude_cur_total_bin_number < max_nft_divisional_per_side) {
      exclude_cur_bin_number_in_a_nft = 1;
      exclude_cur_total_nft_number = exclude_cur_total_bin_number;
    } else {
      exclude_cur_bin_number_in_a_nft = Math.floor(
        exclude_cur_total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(
        exclude_cur_total_bin_number % max_nft_divisional_per_side
      );
      exclude_cur_total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth =
      point_delta * slot_number_in_a_bin * exclude_cur_bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < exclude_cur_total_nft_number; i++) {
      const left_i_point = exclude_cur_left_point + nftWidth * i;
      let right_i_point;
      if (i == exclude_cur_total_nft_number - 1) {
        right_i_point = exclude_cur_right_point;
      } else {
        right_i_point = exclude_cur_left_point + nftWidth * (i + 1);
      }
      const const_i = Big(i + 1).mul(
        formula_of_token_y(left_i_point, right_i_point)
      );
      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }

    const const_last = Big(exclude_cur_total_nft_number + 1).mul(
      formula_of_token_y(contain_cur_nft_left_point, current_point + 1)
    );
    total_const = total_const.plus(const_last);

    addLiquidityInfoHelp[exclude_cur_total_nft_number] = {
      left_point: contain_cur_nft_left_point,
      right_point: contain_cur_nft_right_point,
      const_value: const_last.toFixed(),
    };

    let min_token_x_amount_needed_nonDivisible;
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0')
      ).div(total_const);
      for (let i = 0; i < exclude_cur_total_nft_number + 1; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_y = Big(dis).mul(const_value).toFixed(0);
        let amount_x;
        if (i == exclude_cur_total_nft_number) {
          amount_x = dis
            .mul(exclude_cur_total_nft_number + 1)
            .mul(
              formula_of_token_x(current_point + 1, contain_cur_nft_right_point)
            )
            .toFixed(0);
          min_token_x_amount_needed_nonDivisible = amount_x;
        }
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x: amount_x || '0',
          amount_y: amount_y,
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }

    return {
      min_token_x_amount_needed_nonDivisible,
      addLiquidityInfoList,
      min_token_x_amount_needed: toReadableNumber(
        tokenX.decimals,
        min_token_x_amount_needed_nonDivisible
      ),
    };
  }
  /**
   * curve 和 bid ask 下降升模式下
   * 单边
   * @param param0
   * @returns
   */
  function get_decline_pattern_nfts({
    left_point,
    right_point,
    token,
    token_amount,
    formula_fun,
    is_token_x,
    is_token_y,
  }: {
    left_point: number;
    right_point: number;
    token: TokenMetadata;
    token_amount: string;
    formula_fun: Function;
    is_token_x?: boolean;
    is_token_y?: boolean;
  }) {
    /**
     * 从左往右逐渐下降模式
     * nft 从右往左计算
     * e.g.
     * 公式推导：
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenXAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenXAmount;
     * ===>dis = tokenXAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */
    const { pool_id, point_delta } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;
    const total_bin_number = (right_point - left_point) / binWidth;
    let total_nft_number;
    let bin_number_in_a_nft;
    if (total_bin_number < max_nft_divisional_per_side) {
      const unbroken_nft_number = Math.floor(total_bin_number);
      const has_remaining = !!(total_bin_number % 1);
      bin_number_in_a_nft = 1;
      total_nft_number = has_remaining
        ? unbroken_nft_number + 1
        : unbroken_nft_number;
    } else {
      bin_number_in_a_nft = Math.floor(
        total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(total_bin_number % max_nft_divisional_per_side);
      total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth = point_delta * slot_number_in_a_bin * bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < total_nft_number; i++) {
      let left_i_point;
      let right_i_point;
      if (i == total_nft_number - 1) {
        left_i_point = left_point;
      } else {
        left_i_point = right_point - nftWidth * (i + 1);
      }
      right_i_point = right_point - nftWidth * i;
      const const_i = Big(i + 1).mul(formula_fun(left_i_point, right_i_point));
      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(token.decimals, token_amount || '0')
      ).div(total_const);
      for (let i = 0; i < total_nft_number; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_i = Big(dis).mul(const_value).toFixed(0);
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x: is_token_x ? amount_i : '0',
          amount_y: is_token_y ? amount_i : '0',
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }
    return addLiquidityInfoList;
  }
  function formula_of_token_x(leftPoint: number, rightPoint: number) {
    return (
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
    );
  }
  function formula_of_token_y(leftPoint: number, rightPoint: number) {
    return (
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
      (Math.sqrt(CONSTANT_D) - 1)
    );
  }
  /**
   * 把传递给合约的liquidities数据形式转换成用于图表展示的liquidity数据形式
   */
  function process_liquidities(liquidities: IAddLiquidityInfo[]) {
    const { pool_id } = currentSelectedPool;
    const new_liquidities: UserLiquidityInfo[] = [];
    liquidities.forEach((l: IAddLiquidityInfo) => {
      const { left_point, right_point, amount_x, amount_y } = l;
      const L = get_l_amount_by_condition({
        left_point,
        right_point,
        token_x_amount: amount_x,
        token_y_amount: amount_y,
        poolDetail: currentSelectedPool,
      });
      new_liquidities.push({
        pool_id,
        left_point,
        right_point,
        amount: L,
      });
    });
    return new_liquidities;
  }
  /**
   * bid ask 模式下，右侧（x）包含当前点位的 nfts划分
   * 此区间bin的数量要求 > 1
   * 双边
   * @param param0
   * @returns
   */
  function get_x_nfts_contain_current_bid_ask({
    left_point,
    right_point,
  }: {
    left_point: number;
    right_point: number;
  }) {
    /**
     * 做等差时，包含当前点位的bin作为一个nft，宽度没必要跟其它的nft宽度一致，从而可以得到对另外一个token数量的最小要求
     * 另外一边做等差时，总的数量 - 当前点位的bin中包含的数量，剩下的做等差
     * 给的条件是左点位，大于当前点位的右点位
     * step 1 把包含当前点位bin 单独划分出来作为一个nft
     * step 2 把剩余的bin 划分若干个nft
     * step 3 总的nft 它们 token amount 之和固定，求出等差
     * step 4 求出等差后 得到包含当前点位的bin对另外一半的最低数量要求，数量满足就可以添加，不满足就不可以添加并给出提示
     */

    /**
     * 从左往右逐渐上升模式
     * 从左往右计算
     * e.g.
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenXAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenXAmount;
     * ===>dis = tokenXAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */
    const { pool_id, point_delta, current_point } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;

    // 不同点1
    const contain_cur_nft_left_point = left_point;
    const contain_cur_nft_right_point = left_point + binWidth;

    // 不同点2
    const exclude_cur_left_point = contain_cur_nft_right_point;
    const exclude_cur_right_point = right_point;

    const exclude_cur_total_bin_number =
      (exclude_cur_right_point - exclude_cur_left_point) / binWidth;
    let exclude_cur_total_nft_number;
    let exclude_cur_bin_number_in_a_nft;
    if (exclude_cur_total_bin_number < max_nft_divisional_per_side) {
      exclude_cur_bin_number_in_a_nft = 1;
      exclude_cur_total_nft_number = exclude_cur_total_bin_number;
    } else {
      exclude_cur_bin_number_in_a_nft = Math.floor(
        exclude_cur_total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(
        exclude_cur_total_bin_number % max_nft_divisional_per_side
      );
      exclude_cur_total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth =
      point_delta * slot_number_in_a_bin * exclude_cur_bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < exclude_cur_total_nft_number; i++) {
      // 不同点3
      const left_i_point = exclude_cur_left_point + nftWidth * i;
      let right_i_point;
      if (i == exclude_cur_total_nft_number - 1) {
        right_i_point = exclude_cur_right_point;
      } else {
        right_i_point = exclude_cur_left_point + nftWidth * (i + 1);
      }
      const const_i = Big(i + 2).mul(
        formula_of_token_x(left_i_point, right_i_point)
      );

      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i + 1] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }

    // 不同点4
    const const_last = Big(1).mul(
      formula_of_token_x(current_point + 1, contain_cur_nft_right_point)
    );
    total_const = total_const.plus(const_last);

    addLiquidityInfoHelp[0] = {
      left_point: contain_cur_nft_left_point,
      right_point: contain_cur_nft_right_point,
      const_value: const_last.toFixed(),
    };

    // 不同点5
    let min_token_y_amount_needed_nonDivisible;
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0')
      ).div(total_const);
      for (let i = 0; i < exclude_cur_total_nft_number + 1; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_x = Big(dis).mul(const_value).toFixed(0);
        let amount_y;
        if (i == 0) {
          amount_y = dis
            .mul(formula_of_token_y(left_point, current_point + 1))
            .toFixed(0);
          min_token_y_amount_needed_nonDivisible = amount_y;
        }
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x,
          amount_y: amount_y || '0',
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }

    return {
      min_token_y_amount_needed_nonDivisible,
      addLiquidityInfoList,
      min_token_y_amount_needed: toReadableNumber(
        tokenY.decimals,
        min_token_y_amount_needed_nonDivisible
      ),
    };
  }
  function pointChange({
    leftPoint,
    rightPoint,
  }: {
    leftPoint: number;
    rightPoint: number;
  }) {
    setInvalidRange(false);
    setOnlyAddXToken(false);
    setOnlyAddYToken(false);
    setLeftPoint(leftPoint);
    setRightPoint(rightPoint);
    // invalid point
    if (leftPoint >= rightPoint) {
      setInvalidRange(true);
      setTokenXAmount('');
      setTokenYAmount('');
      return;
    }
    // can only add x token
    if (leftPoint > currentPoint) {
      setOnlyAddXToken(true);
      setTokenYAmount('');
      return;
    }
    // can only add y token
    if (rightPoint <= currentPoint || currentPoint == rightPoint - 1) {
      setOnlyAddYToken(true);
      setTokenXAmount('');
      return;
    }
    if (liquidityShape !== 'Spot') return;
    if (pair_is_reverse) {
      if (tokenYAmount) {
        const amount_result = getTokenXAmountByCondition({
          amount: tokenYAmount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenXAmount(amount_result);
      } else if (tokenXAmount) {
        const amount_result = getTokenYAmountByCondition({
          amount: tokenXAmount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenYAmount(amount_result);
      }
    } else {
      if (tokenXAmount) {
        const amount_result = getTokenYAmountByCondition({
          amount: tokenXAmount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenYAmount(amount_result);
      } else if (tokenYAmount) {
        const amount_result = getTokenXAmountByCondition({
          amount: tokenYAmount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenXAmount(amount_result);
      }
    }
  }
  if (!refTokens || !triTokens || !triTokenIds) return <Loading />;
  return (
    <LiquidityProviderData.Provider
      value={{
        tokenX,
        setTokenX,
        tokenY,
        setTokenY,

        tokenXAmount,
        setTokenXAmount,
        tokenYAmount,
        setTokenYAmount,

        currentSelectedPool,
        setTokenPriceList,

        tokenPriceList,
        history,
        OPEN_CREATE_POOL_ENTRY,
        mobileDevice,

        pair_is_reverse,

        leftPoint,
        setLeftPoint,
        rightPoint,
        setRightPoint,

        get_slot_number_in_a_bin,
        binNumber,
        setBinNumber,
        pointChange,
        setCurrentSelectedPool,
        currentPoint,
        SLOT_NUMBER,
        BIN_WIDTH,
        liquidityShape,
        tokenXBalanceFromNear,
        tokenYBalanceFromNear,
        onlyAddXToken,
        onlyAddYToken,
        invalidRange,
        isSignedIn,
        token_amount_tip,
        set_token_amount_tip,
        switch_pool_loading,
        currentPools,
        switchSelectedFee,

        get_y_nfts_contain_current_curve,
        get_x_nfts_contain_current_curve,
        get_x_nfts_contain_current_bid_ask,
        get_y_nfts_contain_current_bid_ask,
        get_rise_pattern_nfts,
        get_decline_pattern_nfts,
        formula_of_token_x,
        formula_of_token_y,

        getLiquiditySpot,
        getLiquidityForCurveAndBidAskMode,

        show_chart,
        set_show_chart,
      }}
    >
      <div
        style={{ width: mobileDevice ? '' : '1020px' }}
        className="relative flex flex-col  lg:w-4/5 2xl:w-3/5 xs:w-full md:w-full xsm:px-0 m-auto text-white rounded-2xl "
      >
        {/* head */}
        <div
          className=" xs:w-full max-w-max text-farmText flex items-center mb-5 cursor-pointer hover:text-white"
          onClick={() => {
            history.goBack();
          }}
        >
          <div
            className="cursor-pointer flex items-center justify-center w-6 h-6"
            onClick={goYourLiquidityPage}
          >
            <ReturnIcon></ReturnIcon>
          </div>
          <span className=" text-sm">
            <FormattedMessage id="add_liquidity"></FormattedMessage>
          </span>
        </div>

        {/* content */}
        <div className="relative z-10 py-5 px-7 xsm:px-0 rounded-2xl lg:bg-swapCardGradient">
          <div className="flex items-start justify-between xs:flex-col md:flex-col">
            {/* only mobile */}
            {mobileDevice ? (
              <>
                <PairComponent /> <SelectFeeTiers />
              </>
            ) : null}
            {/* left area */}
            <div className="w-full lg:mr-6">
              {/* no Data */}
              {(currentSelectedPool &&
                !currentSelectedPool.pool_id &&
                !OPEN_CREATE_POOL_ENTRY) ||
              !currentSelectedPool ? (
                <NoDataComponent />
              ) : null}

              {currentSelectedPool && currentSelectedPool.pool_id ? (
                <PointsComponent></PointsComponent>
              ) : null}
            </div>

            {/* right area */}
            <div
              style={{ width: mobileDevice ? '' : '400px' }}
              className="flex-shrink-0 xsm:w-full xsm:px-4"
            >
              {!mobileDevice ? (
                <div className="flex items-center justify-between xsm:mt-4">
                  <div className="text-white text-sm">
                    <FormattedMessage
                      id="select_token_pair"
                      defaultMessage={'Select Token Pair'}
                    ></FormattedMessage>
                  </div>

                  <SelectTokenDCL
                    selectTokenIn={(token) => {
                      setTokenX(token);
                    }}
                    selectTokenOut={(token: TokenMetadata) => {
                      setTokenY(token);
                    }}
                    notNeedSortToken={true}
                    className="pt-6  absolute top-5 outline-none   right-0    xs:text-white xs:font-bold xs:fixed xs:bottom-0 xs:w-full "
                    selected={
                      <div
                        className={` text-sm rounded-lg frcc cursor-pointer p-3 bg-v3SwapGray bg-opacity-10 ${
                          selectHover ? 'text-white' : 'text-primaryText'
                        }`}
                        onMouseEnter={() => {
                          if (!mobileDevice) {
                            setSelectHover(true);
                          }
                        }}
                        onMouseLeave={() => {
                          if (!mobileDevice) {
                            setSelectHover(false);
                          }
                        }}
                        onClick={() => {
                          if (mobileDevice) {
                            setSelectHover(!selectHover);
                          }
                        }}
                        onBlur={() => {
                          if (mobileDevice) {
                            setSelectHover(false);
                          }
                        }}
                      >
                        <ArrowDownV3 />
                      </div>
                    }
                  />
                </div>
              ) : null}
              {mobileDevice ? (
                <div className={`text-base text-white font-gothamBold`}>
                  Input Token Amount
                </div>
              ) : null}

              <div
                className={`flex flex-col ${
                  pair_is_reverse ? 'flex-col-reverse' : ''
                }`}
              >
                <InputAmount
                  token={tokenX}
                  balance={tokenXBalanceFromNear}
                  tokenPriceList={tokenPriceList}
                  amount={tokenXAmount}
                  changeAmount={changeTokenXAmount}
                  currentSelectedPool={currentSelectedPool}
                  disabled={onlyAddYToken || invalidRange ? true : false}
                ></InputAmount>
                <InputAmount
                  token={tokenY}
                  balance={tokenYBalanceFromNear}
                  tokenPriceList={tokenPriceList}
                  amount={tokenYAmount}
                  changeAmount={changeTokenYAmount}
                  currentSelectedPool={currentSelectedPool}
                  disabled={onlyAddXToken || invalidRange ? true : false}
                ></InputAmount>
              </div>
              {token_amount_tip ? (
                <div className="flex items-start text-sm text-warnColor mt-2.5">
                  <WarningIcon className="ml-2.5 mr-2 relative top-px flex-shrink-0"></WarningIcon>
                  {token_amount_tip}
                </div>
              ) : null}
              {!mobileDevice ? <SelectFeeTiers /> : null}
              <div className="text-sm mb-2.5 text-white xsm:text-base xsm:font-gothamBold xsm:mt-6">
                <FormattedMessage
                  id="choose_liquidity_shape"
                  defaultMessage={'Choose Liquidity Shape'}
                ></FormattedMessage>
              </div>

              <div className="frcb xsm:gap-2">
                {[SpotShape, CurveShape, BidAskShape].map(
                  (Shape, index: number) => {
                    let disabled = false;
                    if (
                      (index == 1 || index == 2) &&
                      only_suppport_spot_shape
                    ) {
                      disabled = true;
                    }
                    return (
                      <div
                        className={`flex xsm:flex-grow flex-col  rounded-xl items-center border justify-center ${
                          disabled ? 'opacity-40' : 'cursor-pointer'
                        } ${
                          (index === 0 && liquidityShape === 'Spot') ||
                          (index === 1 && liquidityShape === 'Curve') ||
                          (index === 2 && liquidityShape === 'BidAsk')
                            ? ' border-senderHot bg-senderHot bg-opacity-10'
                            : 'border-limitOrderFeeTiersBorderColor'
                        }  gap-2.5`}
                        style={{
                          width: mobileDevice ? '10px' : '127px',
                          height: '70px',
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (index === 0) setLiquidityShape('Spot');
                          else if (index === 1 && !only_suppport_spot_shape)
                            setLiquidityShape('Curve');
                          else if (index == 2 && !only_suppport_spot_shape)
                            setLiquidityShape('BidAsk');
                        }}
                      >
                        <Shape />

                        <span className="text-white text-xs font-gothamBold">
                          {index === 0 && (
                            <FormattedMessage
                              id="uniform"
                              defaultMessage={'Uniform'}
                            ></FormattedMessage>
                          )}
                          {index === 1 && (
                            <FormattedMessage
                              id="curve"
                              defaultMessage={'Normal'}
                            ></FormattedMessage>
                          )}

                          {index === 2 && (
                            <FormattedMessage
                              id="bid_ask"
                              defaultMessage={'Skewed'}
                            ></FormattedMessage>
                          )}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
              {/* user chart part */}
              <div className="lg:mt-4 xsm:mt-8">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white xsm:text-base xsm:font-gothamBold">
                    <FormattedMessage
                      id="Simulate_liquidity_distribution"
                      defaultMessage={'Simulate Liquidity Distribution'}
                    ></FormattedMessage>
                  </div>
                  <div
                    onClick={generate_new_user_chart}
                    className="text-xs text-v3SwapGray border border-opacity-20 border-primaryText rounded-lg p-2 bg-primaryText bg-opacity-20 cursor-pointer hover:text-white hover:bg-opacity-10 hover:border-transparent"
                  >
                    Generate
                  </div>
                </div>
                {currentSelectedPool?.pool_id &&
                  !isInvalid(leftPoint) &&
                  isSignedIn &&
                  !isInvalid(rightPoint) &&
                  !switch_pool_loading && (
                    <div className="flex items-center justify-center border border-v3SwapGray border-opacity-20 rounded-xl px-3 mt-2 h-24">
                      <DclChart
                        pool_id={currentSelectedPool?.pool_id}
                        config={{
                          controlHidden: true,
                          currentBarHidden: true,
                          hoverBoxHidden: true,
                          svgWidth: '300',
                          svgHeight: '68',
                        }}
                        chartType="USER"
                        reverse={pair_is_reverse ? true : false}
                        newlyAddedLiquidities={new_user_liquidities}
                      ></DclChart>
                    </div>
                  )}
                {(!currentSelectedPool?.pool_id || !isSignedIn) && (
                  <div className="flex items-center justify-center border border-v3SwapGray border-opacity-20 text-sm text-primaryText mt-2 h-24 rounded-xl">
                    No data
                  </div>
                )}
              </div>
              <FeeTipDcl />
              <AddLiquidityButton></AddLiquidityButton>
            </div>
          </div>
        </div>
      </div>
    </LiquidityProviderData.Provider>
  );
}
