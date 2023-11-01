import React, { useState, useEffect } from 'react';
import { isMobile } from '../../utils/device';
import { ftGetTokenMetadata } from '../../services/ft-contract';
import {
  get_pool,
  PoolInfo,
  list_liquidities,
  get_pool_marketdepth,
  get_liquidity,
} from '../../services/swapV3';
import {
  getPriceByPoint,
  getPointByPrice,
  POINTLEFTRANGE,
  POINTRIGHTRANGE,
  divide_liquidities_into_bins_user,
  UserLiquidityInfo,
  getBinPointByPoint,
  get_x_y_amount_by_condition,
  get_account_24_apr,
  divide_liquidities_into_bins_pool,
  reverse_price,
  get_total_earned_fee,
} from '../../services/commonV3';
import { getDclPoolPoints, getDCLAccountFee } from '../../services/indexer';
import { sortBy, debounce } from 'lodash';
import {
  IChartData,
  IChartItemConfig,
  IChartConfig,
  IBinDetail,
  IPoolChartConfig,
  IUserLiquiditiesDetail,
  IDCLAccountFee,
  IRMTYPE,
} from './interfaces';
import {
  formatNumber,
  formatPercentage,
  formatWithCommas_usd,
  formatWithCommas_number,
  formatPriceWithCommas,
} from './utils';
import {
  get_custom_config_for_chart,
  get_default_config_for_chart,
} from './config';
import Big from 'big.js';
import * as d3 from 'd3';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { getBoostTokenPrices } from '../../services/farm';
import { formatWithCommas } from 'src/utils/numbers';
import { ILiquidityInfoPool, IOrderInfoPool } from '../../services/commonV3';
import { BlueCircleLoading } from '../../components/layout/Loading';
import { get_unClaimed_fee_data } from '../../pages/poolsV3/components/detail/DetailFun';
import { AddIcon, SubIcon } from './Icon';
import { isValid, createRandomString } from './utils';
export default function DclChart({
  pool_id,
  leftPoint,
  rightPoint,
  targetPoint,
  setLeftPoint,
  setRightPoint,
  setTargetPoint,
  config,
  chartType,
  removeParams,
  newlyAddedLiquidities,
  reverse,
  radius,
}: {
  pool_id: string;
  leftPoint?: number;
  rightPoint?: number;
  targetPoint?: number;
  setLeftPoint?: Function;
  setRightPoint?: Function;
  setTargetPoint?: Function;
  config?: IPoolChartConfig;
  chartType?: 'POOL' | 'USER';
  removeParams?: {
    fromLeft?: boolean;
    fromRight?: boolean;
    point?: number;
    all?: boolean;
  };
  newlyAddedLiquidities?: UserLiquidityInfo[];
  reverse?: boolean;
  radius?: number;
}) {
  const [pool, setPool] = useState<PoolInfo>();
  const [price_range, set_price_range] = useState<number[]>();
  const [chartDataList, setChartDataList] = useState<IChartData[]>();
  const [binDetail, setBinDetail] = useState<IBinDetail>();
  const [dragLeftPoint, setDragLeftPoint] = useState<number>();
  const [dragRightPoint, setDragRightPoint] = useState<number>();
  const [zoom, setZoom] = useState<number>();
  const [randomId] = useState('.' + createRandomString());
  const [drawChartDone, setDrawChartDone] = useState<boolean>(false);
  const [user_liquidities, set_user_liquidities] = useState<
    UserLiquidityInfo[]
  >([]);
  const [user_liquidities_detail, set_user_liquidities_detail] =
    useState<IUserLiquiditiesDetail>();
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>();
  const [chartDataListDone, setChartDataListDone] = useState<boolean>(false);
  const [dclPoolPoints, setDclPoolPoints] = useState<IChartData[]>();
  const [dclPoolPointsDone, setDclPoolPointsDone] = useState<boolean>(false);
  /** constant start */
  const appearanceConfig: IPoolChartConfig = config || {};
  let [timerObj, setTimerObj] = useState<any>({
    timer: '',
  });
  const dragBarWidth = 28;
  const radiusDragBarWidth = 20;
  const percentBoxWidth = 44;
  const min_bar_height = 2;
  const svgWidth = +(appearanceConfig.svgWidth || 520);
  const svgHeight = +(appearanceConfig.svgHeight || 250);
  const axisHeight = appearanceConfig.axisHidden
    ? appearanceConfig.controlHidden
      ? 0
      : 5
    : 21;
  const wholeBarHeight = svgHeight - axisHeight;
  const disFromHoverBoxToPointer = +(
    appearanceConfig.disFromPercentBoxToDragBar || 20
  );
  const disFromPercentBoxToDragBar = +(
    appearanceConfig.disFromPercentBoxToDragBar || 2
  );
  const svgPaddingX = +(appearanceConfig.svgPaddingX || 10);

  // for default left price and right price
  const defaultPercent = +(appearanceConfig.defaultPercent || 10);
  const whole_bars_background_padding = +(
    appearanceConfig.whole_bars_background_padding || 20
  );
  /** constant end */
  const { accountId } = useWalletSelector();
  const is_mobile = isMobile();
  useEffect(() => {
    // get all token prices
    getBoostTokenPrices().then((result) => {
      setTokenPriceList(result);
    });
  }, []);
  // init
  useEffect(() => {
    clearTimeout(timerObj.timer);
    if (pool_id) {
      timerObj.timer = setTimeout(() => {
        get_pool_detail(pool_id);
      }, 500);
    }
  }, [pool_id]);
  // init get data from back end
  useEffect(() => {
    if (pool) {
      get_chart_data();
    }
  }, [pool, accountId]);
  useEffect(() => {
    if (dclPoolPointsDone && chartDataListDone) {
      const combineList = combine_data(dclPoolPoints, chartDataList);
      setChartDataList(combineList);
    }
  }, [dclPoolPointsDone, chartDataListDone]);
  useEffect(() => {
    if (chartDataList) {
      init_price_range();
    }
  }, [reverse]);
  //  draw chart
  useEffect(() => {
    if (
      (chartType !== 'USER' && price_range && chartDataList) ||
      (chartType == 'USER' && chartDataList?.length)
    ) {
      drawChart();
      setDrawChartDone(true);
    }
  }, [price_range, chartDataList, config?.svgWidth]);
  // generate user chart
  useEffect(() => {
    if (pool && accountId && newlyAddedLiquidities && chartType == 'USER') {
      const new_list = get_latest_user_chart_data();
      setChartDataList(new_list);
    }
  }, [newlyAddedLiquidities, user_liquidities]);
  useEffect(() => {
    if (
      isValid(dragLeftPoint) &&
      !appearanceConfig.controlHidden &&
      drawChartDone
    ) {
      const scale = scaleAxis();
      const newPoint = dragLeftPoint;
      let newPrice;
      if (reverse) {
        newPrice = reverse_price(get_price_by_point(newPoint));
      } else {
        newPrice = get_price_by_point(newPoint);
      }
      const movePercent = diffPrices(newPrice);
      const x = scale(+newPrice) - dragBarWidth / 2;
      d3.select(`${randomId} .drag-left`).attr(
        'transform',
        `translate(${x}, -${axisHeight})`
      );
      d3.select(`${randomId} .percentLeft`)
        .attr(
          'transform',
          `translate(${
            x -
            (percentBoxWidth - dragBarWidth / 2 + disFromPercentBoxToDragBar)
          }, 0)`
        )
        .select('text')
        .text(movePercent + '%')
        .attr('fill', 'white');
      const rightX = Number(
        d3
          .select(`${randomId} .drag-right`)
          .attr('transform')
          .split(',')[0]
          .slice(10)
      );
      const W = rightX - x - dragBarWidth / 2;
      d3.select(`${randomId} .overlap rect`)
        .attr('transform', `translate(${x + dragBarWidth / 2}, 0)`)
        .attr('width', W);
    }
  }, [dragLeftPoint, price_range, drawChartDone]);
  useEffect(() => {
    if (isValid(leftPoint)) {
      setDragLeftPoint(leftPoint);
    }
  }, [leftPoint]);
  useEffect(() => {
    if (
      isValid(dragRightPoint) &&
      !appearanceConfig.controlHidden &&
      drawChartDone
    ) {
      const scale = scaleAxis();
      const newPoint = dragRightPoint;
      let newPrice = reverse_price(get_price_by_point(newPoint));
      if (reverse) {
        newPrice = reverse_price(get_price_by_point(newPoint));
      } else {
        newPrice = get_price_by_point(newPoint);
      }
      const movePercent = diffPrices(newPrice);
      let x = scale(+newPrice);
      // transform attr can not receive too big number
      if (Big(x).gt(9999999999)) {
        x = 9999999999;
      }
      d3.select(`${randomId} .drag-right`).attr(
        'transform',
        `translate(${x}, -${axisHeight})`
      );
      d3.select(`${randomId} .percentRight`)
        .attr(
          'transform',
          `translate(${x + (disFromPercentBoxToDragBar + 2)}, 0)`
        )
        .select('text')
        .text(movePercent + '%')
        .attr('fill', 'white');

      const leftX = Number(
        d3
          .select(`${randomId} .drag-left`)
          .attr('transform')
          .split(',')[0]
          .slice(10)
      );
      const W = x - leftX - dragBarWidth / 2;
      d3.select(`${randomId} .overlap rect`).attr('width', W);
    }
  }, [dragRightPoint, price_range, drawChartDone]);
  useEffect(() => {
    if (isValid(rightPoint)) {
      setDragRightPoint(rightPoint);
    }
  }, [rightPoint]);
  useEffect(() => {
    if (config?.radiusMode && isValid(targetPoint) && drawChartDone) {
      // hide drag bar and show target price bar
      draw_radius_mode_bar();
      d3.select(`${randomId} .leftBar`).attr('style', 'display:none');
      d3.select(`${randomId} .rightBar`).attr('style', 'display:none');
    } else {
      d3.select(`${randomId} .leftBar`).attr('style', '');
      d3.select(`${randomId} .rightBar`).attr('style', '');
      d3.select(`${randomId} .radiusBar`).attr('style', 'display:none');
    }
  }, [config?.radiusMode, drawChartDone, targetPoint, pool_id, price_range]);

  // bind drag event
  useEffect(() => {
    if (!config.controlHidden && pool_id && drawChartDone) {
      bind_radius_mode_bar_event();
    }
  }, [config.controlHidden, drawChartDone, price_range, pool_id, radius]);

  // draw remove area for user
  useEffect(() => {
    if (removeParams && drawChartDone) {
      const scale = scaleAxis();
      const scaleBar = scaleAxisY();
      draw_background_bars_for_select_area({ scale, scaleBar });
    }
  }, [
    removeParams?.all,
    removeParams?.fromLeft,
    removeParams?.fromRight,
    removeParams?.point,
    drawChartDone,
  ]);
  // to get user detail when hover on chart
  useEffect(() => {
    if (
      user_liquidities.length &&
      pool &&
      chartType == 'USER' &&
      tokenPriceList
    ) {
      get_user_liquidities_detail();
    }
  }, [user_liquidities, pool, chartType, tokenPriceList]);
  async function get_user_liquidities_detail() {
    const { token_x_metadata, token_y_metadata, pool_id } = pool;
    const dcl_fee_result: IDCLAccountFee | any = await getDCLAccountFee({
      pool_id,
      account_id: accountId,
    });
    const price_x = tokenPriceList[token_x_metadata.id]?.price || 0;
    const price_y = tokenPriceList[token_y_metadata.id]?.price || 0;

    const points: number[] = [];
    let total_x_amount = Big(0);
    let total_y_amount = Big(0);
    let total_value = Big(0);
    let total_fee_earned = Big(0);
    let apr_24 = '';
    if (dcl_fee_result) {
      // total unClaimed fee
      const [
        unClaimed_tvl_fee,
        unClaimed_amount_x_fee,
        unClaimed_amount_y_fee,
      ] = get_unClaimed_fee_data(user_liquidities, pool, tokenPriceList);
      const dclAccountFee: IDCLAccountFee = dcl_fee_result;
      const { total_earned_fee } = dclAccountFee;
      // total earned fee
      const { total_fee_earned_money } = get_total_earned_fee({
        total_earned_fee,
        token_x_metadata,
        token_y_metadata,
        unClaimed_amount_x_fee,
        unClaimed_amount_y_fee,
        tokenPriceList,
      });
      total_fee_earned = Big(total_fee_earned_money);
      // 24h profit
      apr_24 = formatPercentage(
        get_account_24_apr(
          unClaimed_tvl_fee,
          dcl_fee_result,
          pool,
          tokenPriceList
        )
      );
    }
    user_liquidities.forEach((l: UserLiquidityInfo) => {
      const { left_point, right_point, amount } = l;
      points.push(left_point, right_point);
      const { total_x, total_y } = get_x_y_amount_by_condition({
        left_point,
        right_point,
        amount,
        tokenX: token_x_metadata,
        tokenY: token_y_metadata,
        poolDetail: pool,
      });
      total_x_amount = total_x_amount.plus(total_x);
      total_y_amount = total_y_amount.plus(total_y);
    });
    const total_x_value = Big(price_x).mul(total_x_amount);
    const total_y_value = Big(price_y).mul(total_y_amount);
    total_value = total_x_value.plus(total_y_value);
    points.sort((b: number, a: number) => {
      return b - a;
    });
    const min_point = points[0];
    const max_point = points[points.length - 1];
    let min_price, max_price;
    if (reverse) {
      min_price = reverse_price(get_price_by_point(max_point));
      max_price = reverse_price(get_price_by_point(min_point));
    } else {
      min_price = get_price_by_point(min_point);
      max_price = get_price_by_point(max_point);
    }
    set_user_liquidities_detail({
      total_value: formatWithCommas_usd(total_value.toFixed()),
      min_price: formatPriceWithCommas(min_price),
      max_price: formatPriceWithCommas(max_price),
      total_x_amount: formatNumber(total_x_amount.toFixed()),
      total_y_amount: formatNumber(total_y_amount.toFixed()),
      apr_24,
      total_earned_fee: formatWithCommas_usd(total_fee_earned.toFixed()),
    });
  }
  function get_latest_user_chart_data() {
    const { token_x_metadata, token_y_metadata } = pool;
    const { bin: bin_final } = getConfig();
    const nfts = user_liquidities.concat(newlyAddedLiquidities || []);
    const list = divide_liquidities_into_bins_user({
      liquidities: nfts,
      slot_number_in_a_bin: bin_final,
      tokenX: token_x_metadata,
      tokenY: token_y_metadata,
      poolDetail: pool,
    });
    return list;
  }
  async function get_pool_detail(pool_id: string) {
    const p: PoolInfo = await get_pool(pool_id);
    const { token_x, token_y } = p;
    p.token_x_metadata = await ftGetTokenMetadata(token_x);
    p.token_y_metadata = await ftGetTokenMetadata(token_y);
    setPool(p);
  }
  async function get_chart_data() {
    get_dcl_pool_points();
    const list = await get_data_from_back_end();
    setChartDataList(list);
    init_price_range();
    setChartDataListDone(true);
  }
  function init_price_range() {
    const { range } = getConfig();
    if (chartType !== 'USER') {
      const [price_l_default, price_r_default] =
        get_price_range_by_percent(range);
      set_price_range([+price_l_default, +price_r_default]);
      setZoom(range);
    } else {
      const { sortP } = get_price_and_liquidity_range();
      const range = [+sortP[0], +sortP[sortP.length - 1]];
      set_price_range(range);
    }
  }
  function get_dcl_pool_points() {
    const { pool_id } = pool;
    const { bin: bin_final, rangeGear } = getConfig();
    const [price_l, price_r] = get_price_range_by_percent(rangeGear[0], true);
    const point_l = get_point_by_price(price_l);
    const point_r = get_point_by_price(price_r);
    getDclPoolPoints(pool_id, bin_final, point_l, point_r).then(
      (pointsData_apr) => {
        setDclPoolPoints(pointsData_apr?.point_data);
        setDclPoolPointsDone(true);
      }
    );
  }
  async function get_data_from_back_end() {
    setChartDataListDone(false);
    const { token_x_metadata, token_y_metadata, pool_id } = pool;
    const { bin: bin_final, rangeGear } = getConfig();
    let list: any[] = [];
    if (chartType == 'USER') {
      if (accountId) {
        const liquidities = await list_liquidities();
        const nfts = liquidities.filter((l: UserLiquidityInfo) => {
          return l.pool_id == pool_id;
        });
        const liquiditiesPromise = nfts.map((liquidity: UserLiquidityInfo) => {
          return get_liquidity(liquidity.lpt_id);
        });
        const nft_details = await Promise.all(liquiditiesPromise);
        set_user_liquidities(nft_details);
        list = divide_liquidities_into_bins_user({
          liquidities: nfts,
          slot_number_in_a_bin: bin_final,
          tokenX: token_x_metadata,
          tokenY: token_y_metadata,
          poolDetail: pool,
        });
      }
    } else {
      const marketdepthData = await get_pool_marketdepth(pool_id);
      const { liquidities, orders } = marketdepthData;
      let liquidities_array: ILiquidityInfoPool[] = Object.values(liquidities);
      // to find the bin which left_point is current_point and right_point is current_point, if the bin number is two,then need to merge.
      let merged_current_point_liquidity: ILiquidityInfoPool;
      const contain_current_point_liquidities: ILiquidityInfoPool[] = [];
      const exclude_current_point_liquidities_array = liquidities_array.filter(
        (l: ILiquidityInfoPool) => {
          const { left_point, right_point } = l;
          if (
            right_point == pool.current_point ||
            left_point == pool.current_point
          ) {
            contain_current_point_liquidities.push(l);
            return false;
          }
          return true;
        }
      );
      if (contain_current_point_liquidities.length == 2) {
        contain_current_point_liquidities.sort(
          (b: ILiquidityInfoPool, a: ILiquidityInfoPool) => {
            return b.left_point - a.left_point;
          }
        );
        merged_current_point_liquidity = {
          left_point: contain_current_point_liquidities[0].left_point,
          right_point: contain_current_point_liquidities[1].right_point,
          amount_l: contain_current_point_liquidities[0].amount_l,
        };
        exclude_current_point_liquidities_array.push(
          merged_current_point_liquidity
        );
        liquidities_array = exclude_current_point_liquidities_array;
      }
      const orders_array: IOrderInfoPool[] = Object.values(orders);
      const pointsData_l = divide_liquidities_into_bins_pool({
        liquidities: liquidities_array,
        orders: orders_array,
        slot_number_in_a_bin: bin_final,
        tokenX: token_x_metadata,
        tokenY: token_y_metadata,
        poolDetail: pool,
      });
      list = combine_data([], pointsData_l);
    }
    return list;
  }
  function combine_data(
    pointsData_apr: IChartData[],
    pointsData_l: IChartData[]
  ) {
    const pointsData: IChartData[] = [];
    const pointsData_apr_map = pointsData_apr?.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.point]: cur,
      };
    }, {});
    const pointsData_l_map = pointsData_l?.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.point]: cur,
      };
    }, {});
    if (pointsData_l_map) {
      Object.keys(pointsData_l_map).forEach((point_l: string) => {
        const {
          liquidity,
          token_x,
          token_y,
          order_liquidity,
          order_x,
          order_y,
          point,
          pool_id,
        } = pointsData_l_map[point_l];

        const { fee, total_liquidity } = pointsData_apr_map?.[point_l] || {};

        pointsData.push({
          fee: fee || '0',
          total_liquidity: total_liquidity || '0',
          pool_id,
          point,
          liquidity,
          token_x,
          token_y,
          order_liquidity,
          order_x,
          order_y,
        });
        pointsData.sort((b: IChartData, a: IChartData) => {
          return b.point - a.point;
        });
      });
    }
    return pointsData;
  }
  function getChartDataListInRange() {
    const [price_range_point_min, price_range_point_max] =
      get_point_range_by_price_range();
    const bin_width = getConfig().bin * pool.point_delta;
    const chartDataListInRange = chartDataList.filter((d: IChartData) => {
      const { point } = d;
      const point_right = point + bin_width;
      // return point >= price_range_point_min && point_right <= price_range_point_max;
      return (
        point_right > price_range_point_min && point < price_range_point_max
      );
    });
    return chartDataListInRange;
  }
  function get_point_range_by_price_range() {
    let price_range_point_min;
    let price_range_point_max;
    const price_range_min = price_range[0].toString();
    const price_range_max = price_range[price_range.length - 1].toString();
    if (reverse) {
      price_range_point_min = get_point_by_price(
        reverse_price(price_range_max)
      );
      price_range_point_max = get_point_by_price(
        reverse_price(price_range_min)
      );
    } else {
      price_range_point_min = get_point_by_price(price_range_min);
      price_range_point_max = get_point_by_price(price_range_max);
    }
    return [price_range_point_min, price_range_point_max];
  }

  function get_price_range_by_percent(
    percent: number,
    forward?: boolean
  ): [string, string] {
    const p_l_r = percent / 100;
    const price = get_current_price(forward);
    const price_l_temp = Big(1 - p_l_r).mul(price);
    const price_l = price_l_temp.lt(0) ? '0' : price_l_temp.toFixed();
    const price_r = Big(1 + p_l_r)
      .mul(price)
      .toFixed();

    return [price_l, price_r];
  }
  function drawChart() {
    const data: IChartData[] = process_back_end_data_in_range();
    const scale = scaleAxis();
    const scaleBar = scaleAxisY();
    // down bars
    draw_down_bars({ data, scale, scaleBar });
    // up bars
    if (chartType !== 'USER') {
      draw_up_bars({ data, scale, scaleBar });
    }
    // create axis
    if (appearanceConfig.axisHidden) {
      d3.select(`${randomId} .axis`).remove();
    } else {
      draw_axis({ scale });
    }
    // draw background bars
    if (appearanceConfig.hoverBoxHidden) {
      d3.select(`${randomId} .bars_background`).remove();
      d3.select(`${randomId} .overBox`).remove();
      d3.select(`${randomId} .whole_bars_background`).remove();
      d3.select(`${randomId} .wholeOverBox`).remove();
    } else {
      draw_background_bars({ data, scale, scaleBar });
    }
    // remove select area
    if (chartType == 'USER' && removeParams) {
      draw_background_bars_for_select_area({ scale, scaleBar });
    } else {
      d3.select(`${randomId} .remove_bars_background`).remove();
    }

    // draw current line
    if (
      appearanceConfig.currentBarHidden ||
      (chartType == 'USER' && !is_in_range())
    ) {
      d3.select(`${randomId} .currentLine`).remove();
    } else {
      draw_current_bar({ scale });
    }
    if (appearanceConfig.controlHidden) {
      remove_control();
    } else {
      // init
      // drag left
      draw_drag_left({ scale });
      // drag right
      draw_drag_right({ scale });
    }
  }
  function is_in_range() {
    const { sortP } = get_price_and_liquidity_range();
    const current_price = get_current_price();
    return (
      Big(current_price).gte(sortP[0]) &&
      Big(current_price).lte(sortP[sortP.length - 1])
    );
  }
  function process_back_end_data_in_range() {
    const { bin: bin_final } = getConfig();
    const { point_delta } = pool;
    const list =
      chartType == 'USER' ? chartDataList : getChartDataListInRange();
    const data: IChartData[] = list?.map((o: IChartData) => {
      const { point } = o;
      let price_l, price_r, point_l, point_r;
      if (reverse) {
        point_l = +point + point_delta * bin_final;
        price_l = reverse_price(get_price_by_point(point_l));
        point_r = point;
        price_r = reverse_price(get_price_by_point(+point_r));
      } else {
        point_l = point;
        price_l = get_price_by_point(+point_l);
        point_r = +point + point_delta * bin_final;
        price_r = get_price_by_point(point_r);
      }
      return {
        ...o,
        liquidity: Big(o.liquidity || 0).toFixed(),
        order_liquidity: Big(o.order_liquidity || 0).toFixed(),
        token_x: Big(o.token_x || 0).toFixed(),
        token_y: Big(o.token_y || 0).toFixed(),
        order_x: Big(o.order_x || 0).toFixed(),
        order_y: Big(o.order_y || 0).toFixed(),
        total_liquidity: Big(o.total_liquidity || 0).toFixed(),
        fee: Big(o.fee || 0).toFixed(),

        price_l,
        price_r,
        point_l,
        point_r,
      };
    });
    return data || [];
  }
  function hoverBox(e: any, d: IChartData) {
    if (is_mobile) {
      d3.select(`${randomId} .overBox`).attr('style', `display:block`);
    } else {
      d3.select(`${randomId} .overBox`).attr(
        'style',
        `visibility:visible;transform:translate(${
          e.offsetX + disFromHoverBoxToPointer
        }px, ${e.offsetY / 2}px)`
      );
    }

    const {
      point_l,
      token_x,
      token_y,
      order_x,
      order_y,
      fee,
      total_liquidity,
    } = d;
    const { colors } = getConfig();

    const total_token_x = Big(token_x).plus(order_x);
    const total_token_y = Big(token_y).plus(order_y);
    const price_by_token_x = get_price_by_point(+point_l);
    const price_by_token_y = reverse_price(price_by_token_x);
    const apr = Big(total_liquidity).gt(0)
      ? Big(fee).div(total_liquidity).mul(365).mul(100).toFixed()
      : '0';
    setBinDetail({
      feeApr: formatPercentage(apr),
      colors,
      ...(total_token_x.gt(0)
        ? {
            token_x_amount: formatWithCommas_number(total_token_x.toFixed()),
            token_x_amount_in_liquidity: formatWithCommas_number(token_x),
            token_x_amount_in_order: formatWithCommas_number(order_x),
          }
        : {}),
      ...(total_token_y.gt(0)
        ? {
            token_y_amount: formatWithCommas_number(total_token_y.toFixed()),
            token_y_amount_in_liquidity: formatWithCommas_number(token_y),
            token_y_amount_in_order: formatWithCommas_number(order_y),
          }
        : {}),
      price_by_token_x: formatPriceWithCommas(price_by_token_x),
      price_by_token_y: formatPriceWithCommas(price_by_token_y),
    });
  }
  function LeaveBox(e: any, d: IChartData) {
    if (is_mobile) {
      d3.select(`${randomId} .overBox`).attr('style', `display:none`);
    } else {
      d3.select(`${randomId} .overBox`).attr(
        'style',
        `visibility:hidden;transform:translate(${
          e.offsetX + disFromHoverBoxToPointer
        }px, ${e.offsetY / 2}px)`
      );
    }
  }
  function hoverUserBox(e: any) {
    if (is_mobile) {
      d3.select(`${randomId} .wholeOverBox`).attr('style', `display:block;`);
    } else {
      d3.select(`${randomId} .wholeOverBox`).attr(
        'style',
        `visibility:visible;transform:translate(${
          e.offsetX + disFromHoverBoxToPointer
        }px, ${e.offsetY / 2}px)`
      );
    }
  }
  function LeaveUserBox(e: any) {
    if (is_mobile) {
      d3.select(`${randomId} .wholeOverBox`).attr('style', `display:none;`);
    } else {
      d3.select(`${randomId} .wholeOverBox`).attr(
        'style',
        `visibility:hidden;transform:translate(${
          e.offsetX + disFromHoverBoxToPointer
        }px, ${e.offsetY / 2}px)`
      );
    }
  }
  function remove_control() {
    d3.select(`${randomId} .control`).remove();
    d3.select(`${randomId} .overlap`).remove();
    d3.select(`${randomId} .rightBar`).remove();
    d3.select(`${randomId} .leftBar`).remove();
  }
  function draw_axis({ scale }: { scale: any }) {
    const axis: any = d3.axisBottom(scale).tickSize(0).tickPadding(10);
    if (appearanceConfig.ticks || chartType == 'USER') {
      axis.ticks(appearanceConfig.ticks || 5).tickFormat(function (d: any) {
        const dBig = new Big(d);
        if (dBig.gte(10000)) {
          return formatWithCommas(dBig.toFixed(0));
        } else {
          return formatWithCommas(dBig.toFixed());
        }
      });
    }
    d3.select(`${randomId} svg .axis`)
      .call(axis)
      .selectAll('text')
      .attr('fill', '#7E8A93');
    d3.select(`${randomId} svg .axis`)
      .attr('transform', `translate(0, ${svgHeight - axisHeight})`)
      .select('.domain')
      .attr('stroke', 'transparent');
  }
  function draw_down_bars({
    data,
    scale,
    scaleBar,
  }: {
    data: IChartData[];
    scale: Function;
    scaleBar: Function;
  }) {
    const { current_point } = pool;
    const { colors } = getConfig();
    d3.select(`${randomId} .bars_liquidity`)
      .selectAll('rect')
      .data(data)
      .join('rect')
      .transition()
      .attr('width', function (d) {
        return (
          scale(Big(d.price_r).toNumber()) - scale(Big(d.price_l).toNumber())
        );
      })
      .attr('height', function (d) {
        return get_final_bar_height(scaleBar(+d.liquidity));
      })
      .attr('x', function (d) {
        return scale(Big(d.price_l).toNumber());
      })
      .attr('y', function (d) {
        return wholeBarHeight - get_final_bar_height(scaleBar(+d.liquidity));
      })
      .attr('rx', 2)
      .attr('fill', function (d) {
        if (reverse) {
          return +d.point_r >= current_point ? colors[1] : colors[0];
        } else {
          return +d.point_l >= current_point ? colors[1] : colors[0];
        }
      });
  }
  function draw_up_bars({
    data,
    scale,
    scaleBar,
  }: {
    data: IChartData[];
    scale: Function;
    scaleBar: Function;
  }) {
    const { colors } = getConfig();
    const { current_point } = pool;
    d3.select(`${randomId} .bars_order`)
      .selectAll('rect')
      .data(data)
      .join('rect')
      .transition()
      .attr('width', function (d) {
        return (
          scale(Big(d.price_r).toNumber()) - scale(Big(d.price_l).toNumber())
        );
      })
      .attr('height', function (d) {
        return get_final_bar_height(scaleBar(+d.order_liquidity));
      })
      .attr('x', function (d) {
        return scale(Big(d.price_l).toNumber());
      })
      .attr('y', function (d) {
        return (
          wholeBarHeight -
          get_final_bar_height(scaleBar(+d.liquidity)) -
          get_final_bar_height(scaleBar(+d.order_liquidity))
        );
      })
      .attr('rx', 2)
      .attr('fill', function (d) {
        if (reverse) {
          return +d.point_r >= current_point ? colors[1] : colors[0];
        } else {
          return +d.point_l >= current_point ? colors[1] : colors[0];
        }
      })
      .attr('opacity', '0.7');
  }
  function get_final_bar_height(h: number) {
    if (Big(h || 0).lt(min_bar_height) && Big(h || 0).gt(0))
      return min_bar_height;
    return h;
  }
  function draw_background_bars({
    data,
    scale,
    scaleBar,
  }: {
    data: IChartData[];
    scale: Function;
    scaleBar: Function;
  }) {
    if (chartType == 'USER') {
      draw_background_bars_user({
        scale,
        scaleBar,
      });
    } else {
      draw_background_bars_pool({
        data,
        scale,
      });
    }
  }
  function draw_background_bars_pool({
    data,
    scale,
  }: {
    data: IChartData[];
    scale: Function;
  }) {
    d3.select(`${randomId} .bars_background`)
      .selectAll('rect')
      .data(data)
      .join('rect')
      .on('mousemove', function (e, d) {
        d3.select(this).attr('fill', 'rgba(255,255,255,0.1)');
        hoverBox(e, d);
      })
      .on('mouseleave', function (e, d) {
        d3.select(this).attr('fill', 'transparent');
        LeaveBox(e, d);
      })
      .transition()
      .attr('width', function (d) {
        return (
          scale(Big(d.price_r).toNumber()) - scale(Big(d.price_l).toNumber())
        );
      })
      .attr('height', function (d) {
        return wholeBarHeight;
      })
      .attr('x', function (d) {
        return scale(Big(d.price_l).toNumber());
      })
      .attr('y', function (d) {
        return 0;
      })
      .attr('rx', 2)
      .attr('fill', 'transparent');
  }
  function draw_background_bars_user({
    scale,
    scaleBar,
  }: {
    scale: Function;
    scaleBar: Function;
  }) {
    const { sortP, sortY } = get_price_and_liquidity_range();
    d3.select(`${randomId} .whole_bars_background`)
      .on('mousemove', function (e) {
        d3.select(this).attr('fill', 'rgba(255,255,255,0.1)');
        hoverUserBox(e);
      })
      .on('mouseleave', function (e) {
        d3.select(this).attr('fill', 'transparent');
        LeaveUserBox(e);
      })
      .transition()
      .attr('width', function () {
        return (
          scale(sortP[sortP.length - 1]) -
          scale(sortP[0]) +
          whole_bars_background_padding * 2
        );
      })
      .attr('height', function () {
        return (
          scaleBar(sortY[sortY.length - 1]) + whole_bars_background_padding
        );
      })
      .attr('x', function () {
        return scale(sortP[0]) - whole_bars_background_padding;
      })
      .attr('y', function () {
        return (
          wholeBarHeight -
          scaleBar(sortY[sortY.length - 1]) -
          whole_bars_background_padding
        );
      })
      .attr('rx', 4)
      .attr('fill', 'transparent');
  }
  function draw_background_bars_for_select_area({
    scale,
    scaleBar,
  }: {
    scale: Function;
    scaleBar: Function;
  }) {
    const { sortP, sortY } = get_price_and_liquidity_range();
    const min_bin_price = sortP[0];
    const max_bin_price = sortP[sortP.length - 1];
    const { fromLeft, fromRight, all, point } = removeParams;
    let remove_to_price: string;
    if (reverse) {
      remove_to_price = reverse_price(get_price_by_point(point));
    } else {
      remove_to_price = get_price_by_point(point);
    }

    d3.select(`${randomId} .remove_bars_background`)
      .attr('width', function () {
        if (all) {
          return scale(max_bin_price) - scale(min_bin_price);
        } else if (fromLeft) {
          return scale(remove_to_price) - scale(min_bin_price);
        } else if (fromRight) {
          return scale(max_bin_price) - scale(remove_to_price);
        }
      })
      .attr('height', function () {
        return (
          scaleBar(sortY[sortY.length - 1]) + whole_bars_background_padding
        );
      })
      .attr('x', function () {
        if (fromRight) {
          return scale(remove_to_price);
        } else {
          return scale(min_bin_price);
        }
      })
      .attr('y', function () {
        return (
          wholeBarHeight -
          scaleBar(sortY[sortY.length - 1]) -
          whole_bars_background_padding
        );
      })
      .attr('rx', 4)
      .attr('fill', 'rgba(255,255,255,0.1)');
  }
  function draw_current_bar({ scale }: { scale: Function }) {
    const x = scale(+get_current_price()) + svgPaddingX;
    d3.select(`${randomId} .currentLine`).attr(
      'style',
      `transform:translate(${x}px, -${axisHeight}px)`
    );
    if (is_mobile) {
      if (x > 290) {
        const tx = x > 320 ? '-95%' : x > 300 ? '-80%' : '-70%';
        d3.select(`${randomId} .currentLineDetail`).attr(
          'style',
          `transform:translateX(${tx})`
        );
      } else if (x < 50) {
        const tx = x < 10 ? '-10%' : x < 20 ? '-20%' : '-30%';
        d3.select(`${randomId} .currentLineDetail`).attr(
          'style',
          `transform:translateX(${tx})`
        );
      }
    }
  }
  function draw_drag_left({ scale }: { scale: any }) {
    const price = get_current_price();
    let price_l;
    if (dragLeftPoint) {
      if (reverse) {
        price_l = reverse_price(get_price_by_point(dragLeftPoint));
      } else {
        price_l = get_price_by_point(dragLeftPoint);
      }
    } else {
      const price_l_temp = Big(1 - defaultPercent / 100)
        .mul(price)
        .toFixed();
      if (reverse) {
        const newLeftPoint = get_nearby_bin_right_point(
          get_point_by_price(reverse_price(price_l_temp))
        );
        price_l = reverse_price(get_price_by_point(newLeftPoint));
        setDragLeftPoint(newLeftPoint);
      } else {
        const newLeftPoint = get_nearby_bin_left_point(
          get_point_by_price(price_l_temp)
        );
        price_l = get_price_by_point(newLeftPoint);
        setDragLeftPoint(newLeftPoint);
      }
    }

    const x = scale(price_l) - dragBarWidth / 2;
    d3.select(`${randomId} .drag-left`).attr(
      'transform',
      `translate(${x}, -${axisHeight})`
    );
    d3.select(`${randomId} .percentLeft`)
      .attr(
        'transform',
        `translate(${
          x - (percentBoxWidth - dragBarWidth / 2 + disFromPercentBoxToDragBar)
        }, 0)`
      )
      .select('text')
      .text(`${diffPrices(price_l)}%`)
      .attr('fill', 'white');
    const dragLeft = d3.drag().on('drag', function (e) {
      const rightX = Number(
        d3
          .select(`${randomId} .drag-right`)
          .attr('transform')
          .split(',')[0]
          .slice(10)
      );
      if (rightX < e.x || e.x < dragBarWidth / 2) return;
      let p;
      if (reverse) {
        p = reverse_price(scale.invert(e.x));
      } else {
        p = scale.invert(e.x);
      }
      let newLeftPoint;
      if (reverse) {
        newLeftPoint = get_nearby_bin_right_point(get_point_by_price(p));
      } else {
        newLeftPoint = get_nearby_bin_left_point(get_point_by_price(p));
      }
      setDragLeftPoint(newLeftPoint);
      setLeftPoint && setLeftPoint(newLeftPoint);
    });
    d3.select(`${randomId} .drag-left`).call(dragLeft);
  }
  function draw_drag_right({ scale }: { scale: any }) {
    const price = get_current_price();
    let price_r;
    if (dragRightPoint) {
      if (reverse) {
        price_r = reverse_price(get_price_by_point(dragRightPoint));
      } else {
        price_r = get_price_by_point(dragRightPoint);
      }
    } else {
      const price_r_temp = Big(1 + defaultPercent / 100)
        .mul(price)
        .toFixed();
      if (reverse) {
        const newRightPoint = get_nearby_bin_left_point(
          get_point_by_price(reverse_price(price_r_temp))
        );
        price_r = reverse_price(get_price_by_point(newRightPoint));
        setDragRightPoint(newRightPoint);
      } else {
        const newRightPoint = get_nearby_bin_right_point(
          get_point_by_price(price_r_temp)
        );
        price_r = get_price_by_point(newRightPoint);
        setDragRightPoint(newRightPoint);
      }
    }
    const x = scale(price_r);
    d3.select(`${randomId} .drag-right`).attr(
      'transform',
      `translate(${x}, -${axisHeight})`
    );
    d3.select(`${randomId} .percentRight`)
      .attr('transform', `translate(${x + disFromPercentBoxToDragBar + 2}, 0)`)
      .select('text')
      .text(`${diffPrices(price_r)}%`)
      .attr('fill', 'white');
    const dragRight = d3.drag().on('drag', (e) => {
      const leftX = Number(
        d3
          .select(`${randomId} .drag-left`)
          .attr('transform')
          .split(',')[0]
          .slice(10)
      );
      const limitx = svgWidth - (svgPaddingX * 2 + dragBarWidth);
      if (leftX > e.x - dragBarWidth / 2 || e.x > limitx) return;
      let p;
      if (reverse) {
        p = reverse_price(scale.invert(e.x));
      } else {
        p = scale.invert(e.x);
      }
      let newRightPoint;
      if (reverse) {
        newRightPoint = get_nearby_bin_left_point(get_point_by_price(p));
      } else {
        newRightPoint = get_nearby_bin_right_point(get_point_by_price(p));
      }
      setDragRightPoint(newRightPoint);
      setRightPoint && setRightPoint(newRightPoint);
    });
    d3.select(`${randomId} .drag-right`).call(dragRight);
  }
  function draw_radius_mode_bar() {
    const scale: any = scaleAxis();
    let price = get_price_by_point(targetPoint);
    if (reverse) {
      price = reverse_price(price);
    }
    const x = scale(price) - 8;
    d3.select(`${randomId} .radiusBar`)
      .attr('transform', `translate(${x}, -${axisHeight})`)
      .attr('style', 'display:block;cursor:ew-resize');
  }
  function bind_radius_mode_bar_event() {
    const scale: any = scaleAxis();
    const dragTarget = d3.drag().on('drag', (e) => {
      let p;
      const drag_price = scale.invert(e.x);
      if (reverse) {
        p = reverse_price(drag_price);
      } else {
        p = drag_price;
      }
      // if target price is out of range then limit dragging
      if (
        Big(drag_price).lte(price_range[0]) ||
        Big(drag_price).gte(price_range[price_range.length - 1])
      )
        return;

      const newTargetPoint = get_point_by_price(p);
      let left_point, right_point;
      const BIN_WIDTH = getConfig().bin * pool.point_delta;
      if (reverse) {
        left_point = Math.min(
          get_bin_point_by_point(newTargetPoint + BIN_WIDTH * radius),
          POINTRIGHTRANGE
        );
        right_point = Math.max(
          left_point - BIN_WIDTH * radius * 2,
          POINTLEFTRANGE
        );
      } else {
        right_point = Math.min(
          get_bin_point_by_point(newTargetPoint + BIN_WIDTH * radius),
          POINTRIGHTRANGE
        );
        left_point = Math.max(
          right_point - BIN_WIDTH * radius * 2,
          POINTLEFTRANGE
        );
      }

      const left_price = get_price_by_point(left_point);
      const right_price = get_price_by_point(right_point);

      // if left or right price is out of range then limit dragging
      if (Big(left_price).lte(0) || Big(right_price).lte(0)) return;

      setTargetPoint && setTargetPoint(newTargetPoint);
      setDragLeftPoint(left_point);
      setDragRightPoint(right_point);
      setLeftPoint && setLeftPoint(left_point);
      setRightPoint && setRightPoint(right_point);
    });
    d3.select(`${randomId} .radiusBar`).call(dragTarget);
  }
  function get_current_price(forward?: boolean) {
    const current_price = get_price_by_point(pool.current_point);
    if (reverse && !forward) {
      return reverse_price(current_price);
    } else {
      return current_price;
    }
  }
  function get_point_by_price(price: string) {
    const { point_delta, token_x_metadata, token_y_metadata } = pool;
    const decimalRate_point =
      Math.pow(10, token_y_metadata.decimals) /
      Math.pow(10, token_x_metadata.decimals);
    const point = getPointByPrice(point_delta, price, decimalRate_point);
    return point;
  }
  function get_price_by_point(point: number) {
    const { token_x_metadata, token_y_metadata } = pool;
    const decimalRate_price =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    return getPriceByPoint(point, decimalRate_price);
  }
  function get_nearby_bin_right_point(p: number) {
    const { point_delta } = pool;
    const slots = getConfig().bin * point_delta;
    const point_int_bin = Math.round(p / slots) * slots;
    if (point_int_bin < POINTLEFTRANGE) {
      return POINTLEFTRANGE;
    } else if (point_int_bin > POINTRIGHTRANGE) {
      return 800000;
    }
    return point_int_bin + slots;
  }
  function get_nearby_bin_left_point(p: number) {
    const { point_delta } = pool;
    const slots = getConfig().bin * point_delta;
    const point_int_bin = Math.round(p / slots) * slots;
    if (point_int_bin < POINTLEFTRANGE) {
      return POINTLEFTRANGE;
    } else if (point_int_bin > POINTRIGHTRANGE) {
      return 800000;
    }
    return point_int_bin;
  }
  function get_bin_point_by_point(point: number, type?: IRMTYPE) {
    const { point_delta } = pool;
    const slot_num = getConfig().bin;
    return getBinPointByPoint(point_delta, slot_num, point, type);
  }
  function scaleAxis() {
    if (chartType == 'USER') {
      return scaleAxis_User();
    } else {
      return scaleAxis_Pool();
    }
  }
  function scaleAxis_User() {
    const { sortP } = get_price_and_liquidity_range();
    const range = [+sortP[0], +sortP[sortP.length - 1]];
    return d3
      .scaleLinear()
      .domain(range)
      .range([0, svgWidth - svgPaddingX * 2]);
  }
  function scaleAxis_Pool() {
    return d3
      .scaleLinear()
      .domain(price_range)
      .range([0, svgWidth - svgPaddingX * 2]);
  }
  function scaleAxisY() {
    if (chartType == 'USER') {
      return scaleAxisY_User();
    } else {
      return scaleAxisY_Pool();
    }
  }
  function scaleAxisY_User() {
    const { sortY: sortL } = get_price_and_liquidity_range();
    return d3
      .scaleLinear()
      .domain([0, +sortL[sortL.length - 1]])
      .range([0, wholeBarHeight - whole_bars_background_padding])
      .clamp(true);
  }
  function scaleAxisY_Pool() {
    const { sortY: sortL } = get_price_and_liquidity_range();
    return d3
      .scaleLinear()
      .domain([0, +sortL[sortL.length - 1]])
      .range([0, wholeBarHeight]);
  }

  function get_price_and_liquidity_range() {
    const Y: number[] = [];
    const X: number[] = [];
    const list = process_back_end_data_in_range();
    list.forEach((o: IChartData) => {
      const { liquidity, order_liquidity, price_l, price_r } = o;
      Y.push(+liquidity);
      X.push(+price_l, +price_r);
      if (chartType !== 'USER') {
        Y.push(
          +order_liquidity,
          Big(liquidity).plus(order_liquidity).plus(min_bar_height).toNumber()
        );
      }
    });
    // X.push(+get_current_price());
    const sortY = sortBy(Y);
    const sortX = sortBy(X);
    return { sortP: sortX, sortY };
  }
  function diffPrices(newPrice: string, peferencePrice?: string) {
    let movePercent;
    const price = peferencePrice || get_current_price();
    if (+price > +newPrice) {
      movePercent = -Big(1)
        .minus(Big(newPrice).div(price))
        .mul(100)
        .toFixed(0, 1);
    } else {
      movePercent = Big(newPrice).div(price).minus(1).mul(100).toFixed(0, 1);
    }
    return movePercent;
  }
  function getConfig(): IChartItemConfig {
    const { bin, range, colors, rangeGear } =
      get_default_config_for_chart() as IChartItemConfig;
    const custom_config: IChartConfig = get_custom_config_for_chart();
    const percent_final = custom_config[pool_id]?.range || range;
    const bin_final = custom_config[pool_id]?.bin || bin;
    const colors_final = custom_config[pool_id]?.colors || colors;
    const rangeGear_final = custom_config[pool_id]?.rangeGear || rangeGear;
    return {
      bin: bin_final,
      range: percent_final,
      colors: colors_final,
      rangeGear: rangeGear_final,
    };
  }
  function get_current_price_by_token_x() {
    if (pool) {
      return formatPriceWithCommas(get_current_price());
    }
    return '-';
  }
  function get_current_price_by_token_y() {
    if (pool) {
      return formatPriceWithCommas(reverse_price(get_current_price()));
    }
    return '-';
  }
  function zoomOut() {
    const { rangeGear } = getConfig();
    const targetPercent = rangeGear.find((item) => item < zoom);
    if (targetPercent) {
      const [new_left_price, new_right_price] =
        get_price_range_by_percent(targetPercent);
      set_price_range([+new_left_price, +new_right_price]);
      setZoom(targetPercent);
    }
  }
  function zoomIn() {
    const { rangeGear } = getConfig();
    const index = rangeGear.findIndex((item) => item == zoom);
    let targetPercent;
    if (index !== 0) {
      targetPercent = rangeGear[index - 1];
    }
    if (targetPercent) {
      const [new_left_price, new_right_price] =
        get_price_range_by_percent(targetPercent);
      set_price_range([+new_left_price, +new_right_price]);
      setZoom(targetPercent);
    }
  }
  const rangeGear = getConfig().rangeGear;
  const is_in_max_zoom = zoom == rangeGear[rangeGear.length - 1];
  const is_in_min_zoom = zoom == rangeGear[0];
  return (
    <>
      <div
        className={`relative inline-flex flex-col justify-between xsm:items-center ${
          (chartType !== 'USER' && chartDataList) ||
          (chartType == 'USER' && chartDataList?.length)
            ? ''
            : 'hidden'
        } ${randomId.slice(1)}`}
      >
        {/* control button area*/}
        <div className="control flex items-center border border-v3GreyColor rounded-lg py-px h-6 w-16 absolute right-0 -top-28">
          <div
            className={`flex items-center justify-center w-1 h-full flex-grow border-r border-chartBorderColor ${
              is_in_max_zoom
                ? 'text-chartBorderColor cursor-not-allowed'
                : 'text-v3SwapGray cursor-pointer'
            }`}
            onClick={zoomOut}
          >
            <AddIcon></AddIcon>
          </div>
          <div
            className={`flex items-center justify-center w-1 h-full flex-grow ${
              is_in_min_zoom
                ? 'text-chartBorderColor cursor-not-allowed'
                : 'text-v3SwapGray cursor-pointer'
            }`}
            onClick={zoomIn}
          >
            <SubIcon></SubIcon>
          </div>
          {/* <div
          className="flex items-center justify-center w-1 h-full flex-grow cursor-pointer"
          onClick={clickToRight}
        >
          <RightArrowIcon></RightArrowIcon>
        </div> */}
        </div>
        <svg width={svgWidth} height={svgHeight}>
          <g transform={`translate(${svgPaddingX} 0)`}>
            <g className="bars_order"></g>
            <g className="bars_liquidity"></g>
            <g className="bars_background"></g>
            <rect className="whole_bars_background"></rect>
            <rect
              className="remove_bars_background"
              stroke="white"
              stroke-opacity="0.3"
              stroke-dasharray="2 2"
            ></rect>
            {/* axis */}
            <g className="axis"></g>
            {/* drag left bar */}
            <g className="leftBar">
              <g className="percentLeft">
                <rect
                  width={percentBoxWidth}
                  height="22"
                  fill="#172631"
                  rx="4"
                ></rect>
                <text
                  x="22"
                  y="12"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  font-size="12"
                ></text>
              </g>
              <g className="drag-left" style={{ cursor: 'ew-resize' }}>
                <rect width={dragBarWidth} height="253" opacity="0"></rect>
                <path
                  d="M15 245L15 -3.69549e-06"
                  stroke="#00FFD1"
                  stroke-width="1.6"
                />
                <path
                  d="M1 242C1 240.343 2.34315 239 4 239H15V253H4C2.34315 253 1 251.657 1 250V242Z"
                  fill="#1C272E"
                  stroke="#00FFD1"
                  stroke-width="1.6"
                />
                <path
                  d="M5.30798 248.034H10.9917"
                  stroke="#00FFD1"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <path
                  d="M5.30798 244.444H10.9917"
                  stroke="#00FFD1"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </g>
            </g>
            {/* drag right bar*/}
            <g className="rightBar">
              <g className="percentRight">
                <rect
                  width={percentBoxWidth}
                  height="22"
                  fill="#172631"
                  rx="4"
                ></rect>
                <text
                  x="22"
                  y="12"
                  dominant-baseline="middle"
                  text-anchor="middle"
                  font-size="12"
                ></text>
              </g>
              <g className="drag-right" style={{ cursor: 'ew-resize' }}>
                <rect
                  width={dragBarWidth}
                  height="253"
                  opacity="0"
                  x={`-${dragBarWidth / 2}`}
                ></rect>
                <path
                  d="M1 245L0.999989 -3.69549e-06"
                  stroke="#00FFD1"
                  stroke-width="1.6"
                />
                <path
                  d="M15 242C15 240.343 13.6569 239 12 239H1V253H12C13.6569 253 15 251.657 15 250V242Z"
                  fill="#1C272E"
                  stroke="#00FFD1"
                  stroke-width="1.6"
                />
                <path
                  d="M10.6921 248.034H5.00838"
                  stroke="#00FFD1"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <path
                  d="M10.6921 244.444H5.00838"
                  stroke="#00FFD1"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </g>
            </g>
            {/* overlap area between drag left and drag right */}
            <g className="overlap" pointer-events="none">
              <rect height={wholeBarHeight} fill="rgba(255,255,255,0.2)"></rect>
            </g>
            {/*  show bar in radius mode */}
            <g className="radiusBar">
              <rect
                width={radiusDragBarWidth}
                height="253"
                opacity="0"
                x={`-3`}
              ></rect>
              <path
                d="M8 245L7.99999 -3.69549e-06"
                stroke="#00FFD1"
                stroke-width="1.6"
              />
              <path
                d="M1 239C1 237.343 2.34315 236 4 236H12C13.6569 236 15 237.343 15 239V247C15 248.657 13.6569 250 12 250H4C2.34315 250 1 248.657 1 247V239Z"
                fill="#1C272E"
                stroke="#00FFD1"
                stroke-width="1.6"
              />
              <path
                d="M5.30811 245.034H10.9919"
                stroke="#00FFD1"
                stroke-width="1.6"
                stroke-linecap="round"
              />
              <path
                d="M5.30811 241.444H10.9919"
                stroke="#00FFD1"
                stroke-width="1.6"
                stroke-linecap="round"
              />
            </g>
          </g>
        </svg>
        {/* show hover box then hover on the bin */}
        <div className="overBox xsm:w-full lg:absolute rounded-xl bg-chartHoverBoxBg border border-assetsBorder px-3 py-2 xsm:hidden xsm:mt-4 lg:invisible z-10">
          <div className="flex items-center justify-between my-2">
            <span className="text-xs text-white">APR(24h)</span>
            <span className="text-xs text-white gotham_bold">
              {binDetail?.feeApr}
            </span>
          </div>
          <div className="flex items-center justify-between my-2">
            <span className="text-xs text-white mr-10">Price</span>
            <span className="text-xs text-white gotham_bold">
              {reverse ? (
                <>
                  {binDetail?.price_by_token_y} {pool?.token_x_metadata?.symbol}{' '}
                  / {binDetail?.price_by_token_x}{' '}
                  {pool?.token_y_metadata?.symbol}
                </>
              ) : (
                <>
                  {binDetail?.price_by_token_x} {pool?.token_y_metadata?.symbol}{' '}
                  / {binDetail?.price_by_token_y}{' '}
                  {pool?.token_x_metadata?.symbol}
                </>
              )}
            </span>
          </div>
          {binDetail?.token_x_amount ? (
            <>
              <div className="flex items-center justify-between my-2">
                <span className="text-xs text-white">
                  {pool?.token_x_metadata?.symbol} Amount
                </span>
                <span className="text-xs text-white gotham_bold">
                  {binDetail.token_x_amount}
                </span>
              </div>
              <div className="flex items-center justify-between my-2">
                <div className="flex items-center text-xs text-white">
                  <span
                    className="flex mr-2"
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      backgroundColor: `${binDetail?.colors[1]}`,
                    }}
                  ></span>
                  <span className="text-xs text-white">in Liquidity</span>
                </div>
                <span className="text-xs text-white gotham_bold">
                  {binDetail.token_x_amount_in_liquidity}
                </span>
              </div>
              <div className="flex items-center justify-between my-2">
                <div className="flex items-center text-xs text-white">
                  <span
                    className="flex mr-2 opacity-50"
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      backgroundColor: `${binDetail?.colors[1]}`,
                    }}
                  ></span>
                  <span className="text-xs text-white">in Limit Orders</span>
                </div>
                <span className="text-xs text-white gotham_bold">
                  {binDetail.token_x_amount_in_order}
                </span>
              </div>
            </>
          ) : null}
          {binDetail?.token_y_amount ? (
            <>
              <div className="flex items-center justify-between my-2">
                <span className="text-xs text-white">
                  {pool?.token_y_metadata?.symbol} Amount
                </span>
                <span className="text-xs text-white gotham_bold">
                  {binDetail.token_y_amount}
                </span>
              </div>
              <div className="flex items-center justify-between my-2">
                <div className="flex items-center text-xs text-white">
                  <span
                    className="flex mr-2"
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      backgroundColor: `${binDetail?.colors[0]}`,
                    }}
                  ></span>
                  <span className="text-xs text-white">in Liquidity</span>
                </div>
                <span className="text-xs text-white gotham_bold">
                  {binDetail.token_y_amount_in_liquidity}
                </span>
              </div>
              <div className="flex items-center justify-between my-2">
                <div className="flex items-center text-xs text-white">
                  <span
                    className="flex mr-2 opacity-50"
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      backgroundColor: `${binDetail?.colors[0]}`,
                    }}
                  ></span>
                  <span className="text-xs text-white">in Limit Orders</span>
                </div>
                <span className="text-xs text-white gotham_bold">
                  {binDetail.token_y_amount_in_order}
                </span>
              </div>
            </>
          ) : null}
        </div>
        <div className="wholeOverBox xsm:w-full lg:absolute rounded-xl bg-chartHoverBoxBg border border-assetsBorder px-3 py-2 z-10  xsm:hidden xsm:mt-4 lg:invisible">
          <div className="flex items-center justify-between my-2">
            <span className="text-xs text-white">Your Liquidity</span>
            <span className="text-xs text-white gotham_bold">
              {user_liquidities_detail?.total_value || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between my-2">
            <span className="text-xs text-white mr-10">Price Range</span>
            <span className="flex items-center text-xs text-white gotham_bold">
              {user_liquidities_detail?.min_price} -{' '}
              {user_liquidities_detail?.max_price}
              <span className="ml-1">
                {reverse
                  ? pool?.token_x_metadata?.symbol +
                    '/' +
                    pool?.token_y_metadata?.symbol
                  : pool?.token_y_metadata?.symbol +
                    '/' +
                    pool?.token_x_metadata?.symbol}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between my-2">
            <span className="text-xs text-white mr-10">Position</span>
            <span className="text-xs text-white gotham_bold">
              {user_liquidities_detail?.total_x_amount}{' '}
              {pool?.token_x_metadata.symbol} +{' '}
              {user_liquidities_detail?.total_y_amount}{' '}
              {pool?.token_y_metadata.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between my-2">
            <span className="text-xs text-white mr-10">APR(24h)</span>
            <span className="text-xs text-white gotham_bold">
              {user_liquidities_detail?.apr_24 || '-'}
            </span>
          </div>
          <div className="flex items-center justify-between my-2">
            <span className="text-xs text-white mr-10">Total Earned Fee</span>
            <span className="text-xs text-white gotham_bold">
              {user_liquidities_detail?.total_earned_fee || '-'}
            </span>
          </div>
        </div>
        {/* current price area */}
        <div className="currentLine flex flex-col items-center absolute left-0 pointer-events-none">
          <div
            className="border border-white border-dashed"
            style={{ height: svgHeight + 'px' }}
          ></div>
          <div
            className={`currentLineDetail top-0 left-0 bg-senderHot rounded-lg p-2 absolute transform -translate-x-1/2 -translate-y-full flex flex-col ${
              reverse ? 'flex-col-reverse' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-black mr-3">
                {pool?.token_x_metadata?.symbol}:{' '}
              </span>
              <span className="text-xs text-black">
                <label className="gotham_bold mr-1">
                  {reverse
                    ? get_current_price_by_token_y()
                    : get_current_price_by_token_x()}
                </label>
                {pool?.token_y_metadata?.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-black mr-3">
                {pool?.token_y_metadata?.symbol}:{' '}
              </span>
              <span className="text-xs text-black">
                <label className="gotham_bold mr-1">
                  {reverse
                    ? get_current_price_by_token_x()
                    : get_current_price_by_token_y()}
                </label>
                {pool?.token_x_metadata?.symbol}
              </span>
            </div>
          </div>
        </div>
      </div>
      {!chartDataListDone && (
        <div
          style={{ height: svgHeight + 'px' }}
          className={`flex items-center justify-center text-primaryText text-sm ${
            chartType == 'USER'
              ? ''
              : appearanceConfig.smallChart
              ? 'transform origin-center scale-50'
              : '-mt-10'
          }`}
        >
          <BlueCircleLoading></BlueCircleLoading>
        </div>
      )}
      {chartDataListDone &&
        !chartDataList?.length &&
        !appearanceConfig.smallChart && (
          <div
            style={{ height: svgHeight + 'px' }}
            className={`flex items-center justify-center text-primaryText text-sm ${
              chartType == 'USER' ? '' : '-mt-10'
            }`}
          >
            No data
          </div>
        )}
    </>
  );
}
