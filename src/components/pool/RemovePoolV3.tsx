import React, { useEffect, useMemo, useState, useContext, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { WalletContext } from '../../utils/wallets-integration';
import { Card } from 'src/components/card/Card';
import { ModalClose } from 'src/components/icon';
import { TokenMetadata } from '../../services/ft-contract';
import ReactSlider from 'react-slider';
import {
  GradientButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '../../components/button/Button';
import { PoolSlippageSelectorV3 } from 'src/components/forms/SlippageSelector';
import Modal from 'react-modal';
import BigNumber from 'bignumber.js';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
} from 'src/utils/numbers';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
  sort_tokens_by_base,
  getBinPointByPrice,
  getBinPointByPoint,
} from '../../services/commonV3';
import {
  PoolInfo,
  batch_remove_liquidity_contract,
} from '../../services/swapV3';
import { REF_POOL_NAV_TAB_KEY } from './PoolTabV3';
import Big from 'big.js';
import {
  get_custom_config_for_chart,
  get_default_config_for_chart,
} from '../../components/d3Chart/config';
import {
  IChartItemConfig,
  IChartConfig,
} from '../../components/d3Chart/interfaces';
import {
  formatNumber,
  formatWithCommas_usd,
} from '../../components/d3Chart/utils';
import {
  IAddLiquidityInfo,
  IRemoveLiquidityInfo,
  IBatchUpdateiquidityInfo,
} from 'src/pages/poolsV3/interfaces';
import DclChart from '../../components/d3Chart/DclChart';
import { isMobile } from 'src/utils/device';
import QuestionMark from 'src/components/farm/QuestionMark';

import { useWalletSelector } from '../../context/WalletSelectorContext';
import CustomTooltip from '../customTooltip/customTooltip';
import {
  constTransactionPage,
  useTranstionsExcuteDataStore,
} from '../../stores/transtionsExcuteData';

export type RemoveType = 'left' | 'right' | 'all';

export const RemovePoolV3 = (props: any) => {
  const {
    tokenMetadata_x_y,
    poolDetail,
    tokenPriceList,
    isLegacy,
    listLiquidities,
    ...restProps
  }: {
    tokenMetadata_x_y: TokenMetadata[];
    poolDetail: PoolInfo;
    tokenPriceList: any;
    isLegacy?: boolean;
    restProps: any;
    listLiquidities: UserLiquidityInfo[];
  } = props;
  const SLOT_NUMBER = get_slot_number_in_a_bin();
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const pair_is_reverse =
    sort_tokens_by_base(tokenMetadata_x_y)[0].id !== tokenMetadata_x_y[0].id;
  const tokens = tokenMetadata_x_y;
  const { decimals: token_x_decimals } = tokens[0];
  const { decimals: token_y_decimals } = tokens[1];
  const [removeLoading, setRemoveLoading] = useState<boolean>(false);
  const [removeType, setRemoveType] = useState<RemoveType>('all');
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const [minPoint, setMinPoint] = useState<number>();
  const [maxPoint, setMaxPoint] = useState<number>();
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [maxBinAmount, setMaxBinAmount] = useState<string>();

  const [minBoxPrice, setMinBoxPrice] = useState<string>('');
  const [maxBoxPrice, setMaxBoxPrice] = useState<string>('');
  const [minBoxPoint, setMinBoxPoint] = useState<number>();
  const [maxBoxPoint, setMaxBoxPoint] = useState<number>();
  const [binBoxAmount, setBinBoxAmount] = useState<string>('');
  const [show_boundary_tip, set_show_boundary_tip] = useState<boolean>(false);
  const [boundary_is_diff, set_boundary_is_diff] = useState<boolean>(false);

  const processTransactionPending = useTranstionsExcuteDataStore(
    (state) => state.processTransactionPending
  );
  const processTransactionSuccess = useTranstionsExcuteDataStore(
    (state) => state.processTransactionSuccess
  );
  const processTransactionError = useTranstionsExcuteDataStore(
    (state) => state.processTransactionError
  );

  const { selector } = useWalletSelector();
  useEffect(() => {
    // init
    if (tokens && poolDetail && listLiquidities) {
      get_user_points_range();
    }
  }, [JSON.stringify(tokens), poolDetail, listLiquidities]);

  useEffect(() => {
    if (minBoxPoint && maxBoxPoint) {
      let bin_amount;
      if (pair_is_reverse) {
        bin_amount = get_bin_amount_by_points(maxBoxPoint, minBoxPoint);
      } else {
        bin_amount = get_bin_amount_by_points(minBoxPoint, maxBoxPoint);
      }
      setBinBoxAmount(bin_amount);
    }
  }, [minBoxPoint, maxBoxPoint]);
  useEffect(() => {
    if (binBoxAmount !== '') {
      handleBinAmountToAppropriateAmount(+binBoxAmount);
    }
  }, [binBoxAmount]);
  useEffect(() => {
    if (boundary_is_diff && removeType == 'all') {
      set_show_boundary_tip(true);
    } else {
      set_show_boundary_tip(false);
    }
  }, [boundary_is_diff, removeType]);
  const [
    min_received_x_amount,
    min_received_y_amount,
    min_received_total_value,
  ] = useMemo(() => {
    if (tokenMetadata_x_y && minBoxPoint && maxBoxPoint) {
      const { total_token_x_amount, total_token_y_amount, total_value } =
        get_minimum_received_data();
      return [
        formatNumber(total_token_x_amount, 'down'),
        formatNumber(total_token_y_amount, 'down'),
        formatWithCommas_usd(total_value),
      ];
    }
    return ['0', '0', '$0'];
  }, [
    tokenPriceList,
    tokenMetadata_x_y,
    minBoxPoint,
    maxBoxPoint,
    slippageTolerance,
  ]);

  function get_will_deleted_nfts() {
    let whole_deleted_nfts: UserLiquidityInfo[] = [];
    let broken_deleted_nfts: UserLiquidityInfo[] = [];
    if (removeType == 'all') {
      whole_deleted_nfts = [].concat(listLiquidities);
    } else if (removeType == 'left') {
      listLiquidities.forEach((l: UserLiquidityInfo) => {
        const { left_point, right_point } = l;
        if (pair_is_reverse) {
          if (right_point > maxBoxPoint) {
            if (left_point >= maxBoxPoint) {
              whole_deleted_nfts.push(l);
            } else {
              broken_deleted_nfts.push(l);
            }
          }
        } else {
          if (left_point < maxBoxPoint) {
            if (right_point <= maxBoxPoint) {
              whole_deleted_nfts.push(l);
            } else {
              broken_deleted_nfts.push(l);
            }
          }
        }
      });
    } else if (removeType == 'right') {
      listLiquidities.forEach((l: UserLiquidityInfo) => {
        const { left_point, right_point } = l;
        if (pair_is_reverse) {
          if (left_point < minBoxPoint) {
            if (right_point <= minBoxPoint) {
              whole_deleted_nfts.push(l);
            } else {
              broken_deleted_nfts.push(l);
            }
          }
        } else {
          if (right_point > minBoxPoint) {
            if (left_point >= minBoxPoint) {
              whole_deleted_nfts.push(l);
            } else {
              broken_deleted_nfts.push(l);
            }
          }
        }
      });
    }
    return {
      whole_deleted_nfts,
      broken_deleted_nfts,
    };
  }

  function get_slot_number_in_a_bin() {
    const pool_id = poolDetail?.pool_id;
    const { bin } = get_default_config_for_chart() as IChartItemConfig;
    const custom_config: IChartConfig = get_custom_config_for_chart();
    const slots = custom_config[pool_id]?.bin || bin;
    return slots;
  }
  function get_user_points_range() {
    const user_points: number[] = [];
    listLiquidities.forEach((l: UserLiquidityInfo) => {
      user_points.push(l.left_point, l.right_point);
    });
    user_points.sort((b, a) => b - a);
    const user_min_point = user_points[0];
    const user_max_point = user_points[user_points.length - 1];
    const min_point = get_bin_point_by_point(user_min_point, 'floor');
    const max_point = get_bin_point_by_point(user_max_point, 'ceil');
    if (min_point !== user_min_point || max_point !== user_max_point) {
      set_boundary_is_diff(true);
    }
    let min_price, max_price;
    if (pair_is_reverse) {
      min_price = reverse_price(get_bin_price_by_point(max_point));
      max_price = reverse_price(get_bin_price_by_point(min_point));
    } else {
      min_price = get_bin_price_by_point(min_point);
      max_price = get_bin_price_by_point(max_point);
    }

    const max_bin_amount = get_bin_amount_by_points(min_point, max_point);
    setMinPoint(min_point);
    setMaxPoint(max_point);
    setMinPrice(min_price);
    setMaxPrice(max_price);
    setMaxBinAmount(max_bin_amount);

    setMinBoxPrice(min_price);
    setMaxBoxPrice(max_price);
    if (pair_is_reverse) {
      setMinBoxPoint(max_point);
      setMaxBoxPoint(min_point);
    } else {
      setMinBoxPoint(min_point);
      setMaxBoxPoint(max_point);
    }
    setBinBoxAmount(max_bin_amount);
  }
  function reverse_price(price: string) {
    if (Big(price).eq(0)) return '0';
    return Big(1).div(price).toFixed();
  }
  function get_bin_amount_by_points(left_point: number, right_point: number) {
    const { point_delta } = poolDetail;
    const binWidth = SLOT_NUMBER * point_delta;
    const bin_amount = Big(right_point - left_point)
      .div(binWidth)
      .toFixed();
    return bin_amount;
  }
  function get_bin_price_by_point(point: number) {
    const decimalRate =
      Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
    const price = getPriceByPoint(point, decimalRate);
    return price;
  }
  function get_bin_point_by_price(price: string) {
    const point_delta = poolDetail.point_delta;
    const decimalRate =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    const point = getBinPointByPrice(
      point_delta,
      price,
      decimalRate,
      SLOT_NUMBER
    );
    return point;
  }
  function get_bin_point_by_point(
    point: number,
    type: 'round' | 'floor' | 'ceil'
  ) {
    const point_delta = poolDetail.point_delta;
    const bin_point = getBinPointByPoint(point_delta, SLOT_NUMBER, point, type);
    return bin_point;
  }
  function handleMinBoxPriceToAppropriatePoint() {
    /**
     * min price <= price < max box price
     */
    let appropriate_price;
    let appropriate_point;
    const big_price = Big(minBoxPrice || 0);
    if (big_price.lt(minPrice)) {
      appropriate_price = minPrice;
      if (pair_is_reverse) {
        appropriate_point = maxPoint;
      } else {
        appropriate_point = minPoint;
      }
    } else if (big_price.gt(maxBoxPrice)) {
      appropriate_price = maxBoxPrice;
      appropriate_point = maxBoxPoint;
    } else {
      if (pair_is_reverse) {
        appropriate_point = get_bin_point_by_price(reverse_price(minBoxPrice));
        appropriate_price = reverse_price(
          get_bin_price_by_point(appropriate_point)
        );
      } else {
        appropriate_point = get_bin_point_by_price(minBoxPrice);
        appropriate_price = get_bin_price_by_point(appropriate_point);
      }
    }
    setMinBoxPrice(appropriate_price);
    setMinBoxPoint(appropriate_point);
  }
  function handleMaxBoxPriceToAppropriatePoint() {
    /**
     *  min box price <= price <= max price
     */
    let appropriate_price;
    let appropriate_point;
    const big_price = Big(maxBoxPrice || 0);
    if (big_price.lt(minBoxPrice)) {
      appropriate_price = minBoxPrice;
      appropriate_point = minBoxPoint;
    } else if (big_price.gt(maxPrice)) {
      appropriate_price = maxPrice;
      if (pair_is_reverse) {
        appropriate_point = minPoint;
      } else {
        appropriate_point = maxPoint;
      }
    } else {
      if (pair_is_reverse) {
        appropriate_point = get_bin_point_by_price(reverse_price(maxBoxPrice));
        appropriate_price = reverse_price(
          get_bin_price_by_point(appropriate_point)
        );
      } else {
        appropriate_point = get_bin_point_by_price(maxBoxPrice);
        appropriate_price = get_bin_price_by_point(appropriate_point);
      }
    }
    setMaxBoxPrice(appropriate_price);
    setMaxBoxPoint(appropriate_point);
  }
  /**
   * 左右点位改变会触发bin amount随之更改
   * bin amount 修改会改变可以修改的点位
   * 0 <= bin amount < max bin amount
   */
  function handleBinAmountToAppropriateAmount(binAmount: number) {
    const amount_int = binAmount || +binBoxAmount;
    const { point_delta } = poolDetail;
    const binWidth = SLOT_NUMBER * point_delta;
    let appropriate_amount = amount_int;
    if (amount_int > +maxBinAmount) {
      appropriate_amount = +maxBinAmount;
    }
    if (removeType == 'left') {
      let right_box_point, right_box_price;
      if (pair_is_reverse) {
        right_box_point = maxPoint - binWidth * appropriate_amount;
        right_box_price = reverse_price(
          get_bin_price_by_point(right_box_point)
        );
      } else {
        right_box_point = minPoint + binWidth * appropriate_amount;
        right_box_price = get_bin_price_by_point(right_box_point);
      }
      setMaxBoxPoint(right_box_point);
      setMaxBoxPrice(right_box_price);
    } else if (removeType == 'right') {
      let left_box_point, left_box_price;
      if (pair_is_reverse) {
        left_box_point = minPoint + binWidth * appropriate_amount;
        left_box_price = reverse_price(get_bin_price_by_point(left_box_point));
      } else {
        left_box_point = maxPoint - binWidth * appropriate_amount;
        left_box_price = get_bin_price_by_point(left_box_point);
      }
      setMinBoxPoint(left_box_point);
      setMinBoxPrice(left_box_price);
    }
    setBinBoxAmount(appropriate_amount.toString());
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
  function batch_remove_nfts() {
    const transactionId = String(Date.now());
    setRemoveLoading(true);
    const [tokenX, tokenY] = tokenMetadata_x_y;
    sessionStorage.setItem(REF_POOL_NAV_TAB_KEY, '/yourliquidity');
    let batch_remove_liquidity: IRemoveLiquidityInfo[];
    let batch_update_liquidity: IBatchUpdateiquidityInfo;
    const mint_liquidities: UserLiquidityInfo[] = [];
    const { whole_deleted_nfts, broken_deleted_nfts } = get_will_deleted_nfts();
    const { pool_id } = poolDetail;
    /**
     *  step1 找到被截断的nft的 未截断的区间
     *  step2 找到区间，也知道高度==>推导出这个区间的 tokenx的数量和tokeny的数量
     *  step3 未截断的区间 和 token 数量作为 添加nft的参数
     */
    if (broken_deleted_nfts.length) {
      const removeLiquidityInfos: IRemoveLiquidityInfo[] = [];
      const addLiquidityInfoList: IAddLiquidityInfo[] = [];
      broken_deleted_nfts.forEach((l: UserLiquidityInfo) => {
        const { amount, lpt_id, left_point, right_point, mft_id } = l;
        const [new_left_point, new_right_point] = get_un_deleted_range(l);
        const [new_token_x_amount, new_token_y_amount] =
          get_min_x_y_amount_of_liquidity({
            left_point: new_left_point,
            right_point: new_right_point,
            amount,
          });
        const [min_token_x_amount, min_token_y_amount] =
          get_min_x_y_amount_of_liquidity({
            left_point,
            right_point,
            amount,
          });
        addLiquidityInfoList.push({
          pool_id,
          left_point: new_left_point,
          right_point: new_right_point,
          amount_x: toNonDivisibleNumber(tokenX.decimals, new_token_x_amount),
          amount_y: toNonDivisibleNumber(tokenY.decimals, new_token_y_amount),
          min_amount_x: '0',
          min_amount_y: '0',
        });
        removeLiquidityInfos.push({
          lpt_id,
          amount,
          min_amount_x: toNonDivisibleNumber(
            tokenX.decimals,
            min_token_x_amount
          ),
          min_amount_y: toNonDivisibleNumber(
            tokenY.decimals,
            min_token_y_amount
          ),
        });
        if (mft_id) {
          mint_liquidities.push(l);
        }
      });

      batch_update_liquidity = {
        remove_liquidity_infos: removeLiquidityInfos,
        add_liquidity_infos: addLiquidityInfoList,
      };
    }
    if (whole_deleted_nfts.length) {
      const batchRemoveLiquidity: IRemoveLiquidityInfo[] = [];
      whole_deleted_nfts.forEach((l: UserLiquidityInfo) => {
        const { amount, lpt_id, left_point, right_point, mft_id } = l;
        const [min_token_x_amount, min_token_y_amount] =
          get_min_x_y_amount_of_liquidity({
            left_point,
            right_point,
            amount,
          });
        batchRemoveLiquidity.push({
          lpt_id,
          amount,
          min_amount_x: toNonDivisibleNumber(
            tokenX.decimals,
            min_token_x_amount
          ),
          min_amount_y: toNonDivisibleNumber(
            tokenY.decimals,
            min_token_y_amount
          ),
        });
        if (mft_id) {
          mint_liquidities.push(l);
        }
      });
      batch_remove_liquidity = batchRemoveLiquidity;
    }

    processTransactionPending({
      transactionId,
      page: constTransactionPage.pool,
      data: {
        prefix: 'Removing',
        tokens: [
          {
            token: tokenX,
            amount: min_received_x_amount,
          },
          {
            token: tokenY,
            amount: min_received_y_amount,
          },
        ],
      },
    });

    setRemoveLoading(false);
    batch_remove_liquidity_contract({
      token_x: tokenX,
      token_y: tokenY,
      batch_remove_liquidity,
      batch_update_liquidity,
      mint_liquidities,
      selectedWalletId: selector.store.getState().selectedWalletId,
    })
      .then(({ response }) => {
        setRemoveLoading(false);
        processTransactionSuccess({
          transactionId,
          transactionResponse: response,
        });
        sessionStorage.setItem('REMOVE_POOL_ID', pool_id);
      })
      .catch((e) => {
        setRemoveLoading(false);
        processTransactionError({
          error: e,
          transactionId,
        });
      });
  }
  function get_minimum_received_data() {
    /**
     * step1 完整删除的nfts，求出每个nft 对应的最小 x,y 的数量
     * step2 截段的nfts，求出每个nft被删除那一段流动性 对应的最小 x,y的数量
     * step3 把上述step1, step2 得到的x,y 累加起来即可
     */
    let total_token_x_amount = Big(0);
    let total_token_y_amount = Big(0);
    let minimum_total_value = Big(0);
    const { whole_deleted_nfts, broken_deleted_nfts } = get_will_deleted_nfts();
    if (whole_deleted_nfts.length) {
      whole_deleted_nfts.forEach((l: UserLiquidityInfo) => {
        const { amount, left_point, right_point } = l;
        const [min_token_x_amount, min_token_y_amount] =
          get_min_x_y_amount_of_liquidity({
            left_point,
            right_point,
            amount,
          });
        total_token_x_amount = total_token_x_amount.plus(
          min_token_x_amount || 0
        );
        total_token_y_amount = total_token_y_amount.plus(
          min_token_y_amount || 0
        );
      });
    }
    if (broken_deleted_nfts.length) {
      broken_deleted_nfts.forEach((l: UserLiquidityInfo) => {
        const { amount, left_point, right_point } = l;
        const [new_left_point, new_right_point] = get_un_deleted_range(l);
        const [new_token_x_amount, new_token_y_amount] =
          get_x_y_amount_of_liquidity({
            left_point: new_left_point,
            right_point: new_right_point,
            amount,
          });
        const [min_token_x_amount, min_token_y_amount] =
          get_min_x_y_amount_of_liquidity({
            left_point,
            right_point,
            amount,
          });
        const broken_min_token_x_amount =
          Big(min_token_x_amount).minus(new_token_x_amount);
        const broken_min_token_y_amount =
          Big(min_token_y_amount).minus(new_token_y_amount);
        if (broken_min_token_x_amount.gt(0)) {
          total_token_x_amount = total_token_x_amount.plus(
            broken_min_token_x_amount || 0
          );
        }
        if (broken_min_token_y_amount.gt(0)) {
          total_token_y_amount = total_token_y_amount.plus(
            broken_min_token_y_amount || 0
          );
        }
      });
    }
    if (tokenPriceList && tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const priceX = tokenPriceList[tokenX.id]?.price || 0;
      const priceY = tokenPriceList[tokenY.id]?.price || 0;
      const token_x_value = total_token_x_amount.mul(priceX);
      const token_y_value = total_token_y_amount.mul(priceY);
      minimum_total_value = token_x_value.plus(token_y_value);
    }
    const rate = (100 - slippageTolerance) / 100;
    return {
      total_token_x_amount: total_token_x_amount.toFixed(),
      total_token_y_amount: total_token_y_amount.toFixed(),
      minimum_total_value: minimum_total_value.toFixed(),
      total_value: minimum_total_value.div(rate).toFixed(),
    };
  }

  function get_un_deleted_range(liquidity: UserLiquidityInfo) {
    const { left_point, right_point } = liquidity;
    // intersection part
    let intersection_l, intersection_r;
    if (pair_is_reverse) {
      intersection_l = Math.min(right_point, minBoxPoint);
      intersection_r = Math.max(left_point, maxBoxPoint);
    } else {
      intersection_l = Math.max(left_point, minBoxPoint);
      intersection_r = Math.min(right_point, maxBoxPoint);
    }
    // intersection part
    let un_intersection_l;
    let un_intersection_r;
    if (removeType == 'left') {
      un_intersection_l = intersection_r;
      if (pair_is_reverse) {
        un_intersection_r = left_point;
      } else {
        un_intersection_r = right_point;
      }
    } else if (removeType == 'right') {
      if (pair_is_reverse) {
        un_intersection_l = right_point;
      } else {
        un_intersection_l = left_point;
      }
      un_intersection_r = intersection_l;
    }
    if (pair_is_reverse) {
      return [un_intersection_r, un_intersection_l];
    } else {
      return [un_intersection_l, un_intersection_r];
    }
  }
  function get_x_y_amount_of_liquidity(liquidity: {
    left_point: number;
    right_point: number;
    amount: string;
  }) {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const { left_point, right_point, amount: L } = liquidity;
    const { current_point } = poolDetail;
    let curTokenXAmount = '0';
    let curTokenYAmount = '0';
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      curTokenXAmount = getX(current_point + 1, right_point, L, tokenX);
      curTokenYAmount = getY(left_point, current_point, L, tokenY);
      const { amountx, amounty } = get_X_Y_In_CurrentPoint(tokenX, tokenY, L);
      curTokenXAmount = Big(amountx || '0')
        .plus(curTokenXAmount || '0')
        .toFixed();
      curTokenYAmount = Big(amounty || '0')
        .plus(curTokenYAmount || '0')
        .toFixed();
    }
    // only y token
    if (current_point >= right_point) {
      curTokenYAmount = getY(left_point, right_point, L, tokenY);
    }
    // only x token
    if (left_point > current_point) {
      curTokenXAmount = getX(left_point, right_point, L, tokenX);
    }
    return [curTokenXAmount, curTokenYAmount];
  }
  function get_min_x_y_amount_of_liquidity(liquidity: {
    left_point: number;
    right_point: number;
    amount: string;
  }) {
    const rate = (100 - slippageTolerance) / 100;
    const [token_x_amount, token_y_amount] =
      get_x_y_amount_of_liquidity(liquidity);
    const min_token_x_amount = Big(token_x_amount || 0)
      .mul(rate)
      .toFixed();
    const min_token_y_amount = Big(token_y_amount || 0)
      .mul(rate)
      .toFixed();
    return [min_token_x_amount, min_token_y_amount];
  }
  function get_boundary_tip() {
    const tip =
      'The Min Price and Max price displayed here correspond to the boundaries of the bins. Since you added liquidity before the upgrade, the liquidity boundaries are within the bins containing the Min Price or  Max price. Therefore, your actual price range may differ from the the Min Price or Max price displayed here.';
    const result: string = `<div class="text-farmText text-xs text-left xsm:w-52 lg:w-80">${tip}</div>`;
    return result;
  }
  const isRemoveLiquidityDisabled = minBoxPoint == maxBoxPoint;
  const is_mobile = isMobile();
  const cardWidth = is_mobile ? '100vw' : '550px';
  const cardHeight = is_mobile ? '70vh' : '95vh';
  return (
    <Modal
      {...restProps}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
          top: is_mobile ? 'auto' : '50%',
          left: is_mobile ? 'auto' : '50%',
          transform: is_mobile ? 'none' : 'translate(-50%, -50%)',
          bottom: is_mobile ? '32px' : 'auto',
          width: is_mobile ? '100%' : 'auto',
        },
      }}
    >
      <Card
        style={{ maxHeight: cardHeight, minWidth: cardWidth }}
        className={`outline-none border lg:border-gradientFrom border-opacity-50 overflow-auto xsm:p-3 xsm:rounded-t-2xl xsm:rounded-b-none xsm:border-bottomBoxBorderColor`}
      >
        {/* Title */}
        <div className="flex items-center justify-between">
          <span className="text-xl text-white">
            <FormattedMessage id="remove_liquidity"></FormattedMessage>
          </span>
          <div className="cursor-pointer" onClick={props.onRequestClose}>
            <ModalClose />
          </div>
        </div>
        {/* Symbol pairs */}
        <div className="flex items-center justify-between mt-6 flex-wrap">
          <div className="flex items-center mb-2">
            <div
              className={`flex items-center ${
                pair_is_reverse ? 'flex-row-reverse' : ''
              }`}
            >
              <img
                src={tokens[0]?.icon}
                className="w-8 h-8 border border-greenColor rounded-full"
              ></img>
              <img
                src={tokens[1]?.icon}
                className="relative w-8 h-8 border border-greenColor rounded-full -ml-1.5"
              ></img>
            </div>
            <span className="text-white text-base font-bold ml-2.5">
              {pair_is_reverse
                ? `${tokens[1]?.symbol}-${tokens[0]?.symbol}`
                : `${tokens[0]?.symbol}-${tokens[1]?.symbol}`}
            </span>
          </div>
          <span className="text-white text-lg mb-2">
            {min_received_total_value}
          </span>
        </div>
        <div className="flex flex-col relative border-opacity-20 rounded-xl pb-4 pt-10">
          <span className="absolute right-4 top-2 text-primaryText text-xs font-bold">
            (
            {pair_is_reverse
              ? `${tokens[0]?.symbol}/${tokens[1]?.symbol}`
              : `${tokens[1]?.symbol}/${tokens[0]?.symbol}`}
            )
          </span>
          {maxPoint && (
            <DclChart
              pool_id={poolDetail.pool_id}
              config={{
                controlHidden: true,
                currentBarHidden: true,
                hoverBoxHidden: true,
                svgWidth: is_mobile ? '320' : '480',
                svgHeight: '82',
              }}
              chartType="USER"
              removeParams={{
                fromLeft: removeType == 'left',
                fromRight: removeType == 'right',
                all: removeType == 'all',
                point: removeType == 'left' ? maxBoxPoint : minBoxPoint,
              }}
              reverse={pair_is_reverse}
            ></DclChart>
          )}
        </div>
        {/* Removing way */}
        <div className="mt-3 frcb ">
          <div className="text-primaryText text-xs">
            <FormattedMessage
              id="remove"
              defaultMessage={'Remove'}
            ></FormattedMessage>
          </div>
          <div className="frcs gap-2 text-xs text-primaryText">
            <div
              className={`p-2 border border-v3LiquidityRemoveBarColor  cursor-pointer rounded-lg
      ${removeType === 'left' ? 'bg-gradientFromHover text-black' : ''}
      
      `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRemoveType('left');
                setMinBoxPrice(minPrice);
                if (pair_is_reverse) {
                  setMinBoxPoint(maxPoint);
                } else {
                  setMinBoxPoint(minPoint);
                }
              }}
            >
              <FormattedMessage
                id="from_left"
                defaultMessage={'From left'}
              ></FormattedMessage>
            </div>

            <div
              className={`p-2 border border-v3LiquidityRemoveBarColor  cursor-pointer rounded-lg
      ${removeType === 'right' ? 'bg-gradientFromHover text-black' : ''}
      
      `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRemoveType('right');
                setMaxBoxPrice(maxPrice);
                if (pair_is_reverse) {
                  setMaxBoxPoint(minPoint);
                } else {
                  setMaxBoxPoint(maxPoint);
                }
              }}
            >
              <FormattedMessage
                id="from_right"
                defaultMessage={'From right'}
              ></FormattedMessage>
            </div>

            <div
              className={`p-2 border border-v3LiquidityRemoveBarColor  cursor-pointer rounded-lg
      ${removeType === 'all' ? 'bg-gradientFromHover text-black' : ''}
      
      `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRemoveType('all');
                setMinBoxPrice(minPrice);
                setMaxBoxPrice(maxPrice);
                if (pair_is_reverse) {
                  setMinBoxPoint(maxPoint);
                  setMaxBoxPoint(minPoint);
                } else {
                  setMinBoxPoint(minPoint);
                  setMaxBoxPoint(maxPoint);
                }
              }}
            >
              <FormattedMessage
                id="all"
                defaultMessage={'All'}
              ></FormattedMessage>
            </div>
          </div>
        </div>
        {/* remove slider */}
        {/* binBoxAmount 控制 */}
        <ReactSlider
          invert={removeType == 'right'}
          disabled={removeType == 'all'}
          className={`multi-slider mt-6`}
          onChange={(v) => {
            setBinBoxAmount(v.toString());
          }}
          value={+binBoxAmount}
          min={0}
          max={+maxBinAmount}
          step={1}
        ></ReactSlider>
        {/* Set points */}
        <div className="mb-3 text-base grid xsm:grid-rows-3 lg:grid-cols-3 gap-2 w-full mt-6">
          {/* min price  */}
          <div className="frcs w-full border border-menuMoreBoxBorderColor py-2 px-3 rounded-xl col-span-1">
            <span className="text-xs min-w-max text-primaryText">
              <FormattedMessage
                id="min_price"
                defaultMessage={'Min Price'}
              ></FormattedMessage>
            </span>

            <input
              className={`ml-2 font-gothamBold xsm:text-right ${
                removeType !== 'right' ? 'text-primaryText' : 'text-white'
              }`}
              value={minBoxPrice !== '' ? toPrecision(minBoxPrice, 8) : ''}
              onChange={(e) => {
                const value = e.target.value;
                setMinBoxPrice(value);
              }}
              inputMode="decimal"
              onBlur={() => {
                handleMinBoxPriceToAppropriatePoint();
              }}
              disabled={removeType !== 'right'}
            ></input>
          </div>
          {/* max price */}
          <div className="frcs w-full border border-menuMoreBoxBorderColor py-2 px-3 rounded-xl col-span-1">
            <span className="text-xs min-w-max text-primaryText">
              <FormattedMessage
                id="max_price"
                defaultMessage={'Max Price'}
              ></FormattedMessage>
            </span>
            <input
              className={`ml-2 font-gothamBold xsm:text-right ${
                removeType !== 'left' ? 'text-primaryText' : 'text-white'
              }`}
              onChange={(e) => {
                const value = e.target.value;
                setMaxBoxPrice(value);
              }}
              value={maxBoxPrice !== '' ? toPrecision(maxBoxPrice, 8) : ''}
              inputMode="decimal"
              onBlur={() => {
                handleMaxBoxPriceToAppropriatePoint();
              }}
              disabled={removeType !== 'left'}
            ></input>
          </div>
          {/* bin amount */}
          <div className="frcs w-full border border-menuMoreBoxBorderColor py-2 px-3 rounded-xl col-span-1">
            <span className="text-xs  min-w-max text-primaryText">
              <FormattedMessage id="bin_amount" defaultMessage={'Bin Amount'} />
            </span>

            <IntegerInputComponent
              value={binBoxAmount}
              setValue={setBinBoxAmount}
              className="ml-2"
              onBlur={handleBinAmountToAppropriateAmount}
              disabled={removeType === 'all'}
            />
          </div>
        </div>
        {/* Tip */}
        {show_boundary_tip ? (
          <div className="flex items-start mt-2.5 text-sm text-warnColor">
            {/* <WarningIcon className="ml-2.5 mr-2 relative top-px flex-shrink-0" /> */}
            <div
              className="text-white text-right mr-1 relative top-1"
              data-class="reactTip"
              data-tooltip-id="rewardRangeTipId"
              data-place="top"
              data-tooltip-html={get_boundary_tip()}
            >
              <QuestionMark></QuestionMark>
              <CustomTooltip id="rewardRangeTipId" />
            </div>
            <span>
              Why the Min Price or Max price here differ from my actual price
              range?
            </span>
          </div>
        ) : null}

        {/* Slippage */}
        <div>
          <PoolSlippageSelectorV3
            slippageTolerance={slippageTolerance}
            onChange={setSlippageTolerance}
            textColor="text-white"
          />
        </div>
        {/* Minimum received */}
        <div
          className="mt-6"
          style={{ borderTop: '1px solid rgba(110, 124, 133, 0.2)' }}
        ></div>
        <div className="flex justify-between lg:items-center xsm:items-start mt-4">
          <span className="text-sm text-white">
            <FormattedMessage id="minimum_tokens_out"></FormattedMessage>
          </span>

          <div
            className={`flex items-center gap-8 xsm:flex-col xsm:items-end xsm:gap-1 ${
              pair_is_reverse ? 'flex-row-reverse' : ''
            }`}
          >
            <div className="frcs gap-2 xsm:flex-row-reverse">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                className="w-5 h-5 border border-greenColor rounded-full"
              ></img>

              <span className="text-lg font-gothamBold text-white">
                {min_received_x_amount}
              </span>
            </div>
            <div className="frcs gap-2 xsm:flex-row-reverse">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                className="w-5 h-5 border border-greenColor rounded-full"
              ></img>

              <span className="text-lg font-gothamBold text-white">
                {min_received_y_amount}
              </span>
            </div>
          </div>
        </div>
        {/* Button */}
        {isSignedIn ? (
          <GradientButton
            onClick={batch_remove_nfts}
            color="#fff"
            disabled={removeLoading || isRemoveLiquidityDisabled}
            loading={removeLoading || isRemoveLiquidityDisabled}
            btnClassName={`${
              isRemoveLiquidityDisabled ? 'cursor-not-allowed' : ''
            }`}
            className={`btn-remove-liq-dcl mt-8 w-full h-14 text-center text-lg text-white focus:outline-none font-semibold`}
            backgroundImage="linear-gradient(180deg, #C0B1A3 0%, #92877D 100%)"
          >
            <ButtonTextWrapper
              loading={removeLoading}
              Text={() => <FormattedMessage id="remove" />}
            />
          </GradientButton>
        ) : (
          <div className="mt-10">
            <ConnectToNearBtn></ConnectToNearBtn>
          </div>
        )}
      </Card>
    </Modal>
  );
};
export function IntegerInputComponent({
  value,
  setValue,
  disabled,
  className,
  max,
  onBlur,
}: any) {
  const removeLeadingZeros = (s: string) => {
    const oldLen = s.length;
    s = s.replace(/^0+/, '');

    if (s.length === 0 && oldLen > 0) {
      s = '0';
    }

    if (max && Number(s) > max) {
      return max;
    }

    return s;
  };

  const handleChange = (val: string) => {
    val = val.replace(/[^\d]/g, '');
    val = removeLeadingZeros(val);
    setValue(val);
  };

  return (
    <div
      className={`${className} flex items-center justify-between xsm:flex-grow `}
    >
      <input
        type="text"
        className={`text-base font-gothamBold mx-2 text-left xsm:text-right xsm:mx-0 ${
          disabled ? 'text-primaryText' : 'text-white'
        }`}
        disabled={disabled}
        value={value}
        onBlur={({ target }) => {
          if (onBlur) {
            onBlur();
          } else if (!target.value) {
            setValue(1);
          }
        }}
        onChange={({ target }) => {
          handleChange(target.value);
        }}
      />
    </div>
  );
}
