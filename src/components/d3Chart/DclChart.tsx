import React, { useState, useRef, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { isMobile } from '../../utils/device';
import { TokenMetadata, ftGetTokenMetadata } from '../../services/ft-contract';
import { get_pool, PoolInfo, list_liquidities } from '../../services/swapV3';
import {
  getPriceByPoint,
  getPointByPrice,
  POINTLEFTRANGE,
  POINTRIGHTRANGE,
  divide_liquidities_into_bins,
  UserLiquidityInfo,
  getBinPointByPoint,
  get_x_y_amount_by_condition,
  get_account_24_apr,
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
  formatPrice,
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
import { toNonDivisibleNumber, toReadableNumber } from '~utils/numbers';
export default function DclChart({
  pool_id,
  leftPoint,
  rightPoint,
  setLeftPoint,
  setRightPoint,
  config,
  chartType,
  removeParams,
  newlyAddedLiquidities,
}: {
  pool_id: string;
  leftPoint?: number;
  rightPoint?: number;
  setLeftPoint?: Function;
  setRightPoint?: Function;
  config?: IPoolChartConfig;
  chartType?: 'POOL' | 'USER';
  removeParams?: {
    fromLeft?: boolean;
    fromRight?: boolean;
    point?: number;
    all?: boolean;
  };
  newlyAddedLiquidities?: UserLiquidityInfo[];
}) {
  const [pool, setPool] = useState<PoolInfo>();
  const [price_range, set_price_range] = useState<number[]>();
  const [chartDataList, setChartDataList] = useState<IChartData[]>();
  const [binDetail, setBinDetail] = useState<IBinDetail>();
  const [dragLeftPoint, setDragLeftPoint] = useState<number>();
  const [dragRightPoint, setDragRightPoint] = useState<number>();
  const [zoom, setZoom] = useState<number>();
  const [randomId, setRandomId] = useState('.' + createRandomString());
  const [drawChartDone, setDrawChartDone] = useState<boolean>(false);
  const [user_liquidities, set_user_liquidities] = useState<
    UserLiquidityInfo[]
  >([]);
  const [user_liquidities_detail, set_user_liquidities_detail] =
    useState<IUserLiquiditiesDetail>();
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>();
  /** constant start */
  const appearanceConfig: IPoolChartConfig = config || {};
  let [timerObj, setTimerObj] = useState<any>({
    timer: '',
  });
  const dragBarWidth = 28;
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
  const defaultPercent = +(appearanceConfig.defaultPercent || 10); // 初始化左侧右侧价格与当前价格的间距百分比 10===》10%, e.g. 右侧价格是当前价格的 1 + 10%
  // hover 到用户图表上时，hover出来的背景框要大些，设置多扩充出来的大小。
  const whole_bars_background_padding = +(
    appearanceConfig.whole_bars_background_padding || 20
  );
  /** constant end */
  const { accountId } = useWalletSelector();
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
  // init 从后端获取数据
  useEffect(() => {
    if (pool) {
      get_chart_data();
    }
  }, [pool, accountId]);
  // 更新用户数据
  useEffect(() => {
    if (pool && accountId && newlyAddedLiquidities && chartType == 'USER') {
      const new_list = get_latest_user_chart_data();
      setChartDataList(new_list);
    }
  }, [newlyAddedLiquidities, user_liquidities]);
  //  绘制图表
  useEffect(() => {
    if (
      (chartType !== 'USER' && price_range && chartDataList) ||
      (chartType == 'USER' && chartDataList?.length)
    ) {
      drawChart();
      setDrawChartDone(true);
    }
  }, [price_range, chartDataList]);
  useEffect(() => {
    if (
      isValid(dragLeftPoint) &&
      !appearanceConfig.controlHidden &&
      drawChartDone
    ) {
      const scale = scaleAxis();
      const newPoint = dragLeftPoint;
      const newPrice = get_price_by_point(newPoint);
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
      const newPrice = get_price_by_point(newPoint);
      const movePercent = diffPrices(newPrice);
      const x = scale(+newPrice);
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
    if (config?.radiusMode && config?.targetPoint && drawChartDone) {
      // hide drag bar and show target price bar
      draw_radius_mode_bar();
      d3.select(`${randomId} .leftBar`).attr('style', 'display:none');
      d3.select(`${randomId} .rightBar`).attr('style', 'display:none');
    } else {
      d3.select(`${randomId} .leftBar`).attr('style', '');
      d3.select(`${randomId} .rightBar`).attr('style', '');
      d3.select(`${randomId} .radiusBar`).attr('style', 'display:none');
    }
  }, [config?.radiusMode, config?.targetPoint, pool_id, drawChartDone]);
  /**
   * 中文
   * remove 流动性，当参数改变，重新绘制删除区域的北京框
   */
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
  /**
   * 获取个人流动性图表详情信息
   * 用户 hover 框里数据展示
   */
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
      const dclAccountFee: IDCLAccountFee = dcl_fee_result;
      const { total_earned_fee } = dclAccountFee;
      // 总共赚到的fee
      const { total_fee_x, total_fee_y } = total_earned_fee || {};
      const total_earned_fee_x = toReadableNumber(
        token_x_metadata.decimals,
        Big(total_fee_x || 0).toFixed()
      );
      const total_earned_fee_y = toReadableNumber(
        token_y_metadata.decimals,
        Big(total_fee_y || 0).toFixed()
      );
      const total_earned_fee_x_value = Big(total_earned_fee_x).mul(price_x);
      const total_earned_fee_y_value = Big(total_earned_fee_y).mul(price_y);
      total_fee_earned = total_earned_fee_x_value.plus(
        total_earned_fee_y_value
      );
      // 24h 利润
      apr_24 = formatPercentage(
        get_account_24_apr(dcl_fee_result, pool, tokenPriceList)
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
    const min_price = get_price_by_point(min_point);
    const max_price = get_price_by_point(max_point);
    set_user_liquidities_detail({
      total_value: formatWithCommas_usd(total_value.toFixed()),
      min_price: formatPrice(min_price),
      max_price: formatPrice(max_price),
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
    const list = divide_liquidities_into_bins({
      liquidities: nfts,
      slot_number_in_a_bin: bin_final,
      tokenX: token_x_metadata,
      tokenY: token_y_metadata,
      poolDetail: pool,
    });
    return list;
  }
  /**
   * 用户图表来说，新增的Liquidities发生改变时，把数据叠加重新绘制图表
   */
  async function get_pool_detail(pool_id: string) {
    const p: PoolInfo = await get_pool(pool_id);
    const { token_x, token_y } = p;
    p.token_x_metadata = await ftGetTokenMetadata(token_x);
    p.token_y_metadata = await ftGetTokenMetadata(token_y);
    setPool(p);
  }
  async function get_chart_data() {
    const { range } = getConfig();
    const list = await get_data_from_back_end();
    if (chartType !== 'USER') {
      const [price_l_default, price_r_default] =
        get_price_range_by_percent(range);
      set_price_range([+price_l_default, +price_r_default]);
      setZoom(range);
    }
    setChartDataList(list);
  }
  async function get_data_from_back_end() {
    const { point_delta, token_x_metadata, token_y_metadata, pool_id } = pool;
    const { bin: bin_final, rangeGear } = getConfig();
    const decimalRate_point =
      Math.pow(10, token_y_metadata.decimals) /
      Math.pow(10, token_x_metadata.decimals);
    const [price_l, price_r] = get_price_range_by_percent(rangeGear[0]);
    const point_l = getPointByPrice(point_delta, price_l, decimalRate_point);
    const point_r = getPointByPrice(point_delta, price_r, decimalRate_point);
    let list = [];
    if (chartType == 'USER' && accountId) {
      const liquidities = await list_liquidities();
      const nfts = liquidities.filter((l: UserLiquidityInfo) => {
        return l.pool_id == pool_id;
      });
      set_user_liquidities(nfts);
      list = divide_liquidities_into_bins({
        liquidities: nfts,
        slot_number_in_a_bin: bin_final,
        tokenX: token_x_metadata,
        tokenY: token_y_metadata,
        poolDetail: pool,
      });
    } else {
      const result = await getDclPoolPoints(
        pool_id,
        bin_final,
        point_l,
        point_r
      );
      list = result.point_data || [];
    }
    return list;
  }
  function getChartDataListInRange() {
    const point_l = get_point_by_price(price_range[0].toString());
    const point_r = get_point_by_price(
      price_range[price_range.length - 1].toString()
    );
    let start_index;
    for (let i = 0; i < chartDataList.length - 1; i++) {
      if (+chartDataList[i].point == point_l) {
        start_index = i;
        break;
      }
      if (
        +chartDataList[i].point > point_l &&
        +chartDataList[Math.max(i - 1, 0)].point < point_l
      ) {
        start_index = Math.max(i - 1, 0);
        break;
      }
    }
    let end_index = chartDataList.findIndex((d: IChartData) => {
      return +d.point >= point_r;
    });
    if (!isValid(start_index)) {
      start_index = 0;
    }
    if (end_index == -1) {
      end_index = chartDataList.length - 1;
    }
    const chartDataListInRange = chartDataList.slice(
      start_index,
      end_index + 1
    );
    return chartDataListInRange;
  }
  function get_price_range_by_percent(percent: number): [string, string] {
    const p_l_r = percent / 100;
    const price = get_current_price();
    const price_l_temp = Big(1 - p_l_r).mul(price);
    const price_l = price_l_temp.lt(0) ? '0' : price_l_temp.toFixed();
    const price_r = Big(1 + p_l_r)
      .mul(price)
      .toFixed();

    return [price_l, price_r];
  }
  function drawChart() {
    const data: IChartData[] = process_chart_data_for_display();
    const scale = scaleAxis();
    const scaleBar = scaleAxisY(data);
    // down bars
    draw_down_bars({ data, scale, scaleBar });
    // up bars
    if (chartType !== 'USER') {
      draw_up_bars({ data, scale, scaleBar });
    }
    // 创建横坐标轴
    if (appearanceConfig.axisHidden) {
      d3.select(`${randomId} .axis`).remove();
    } else {
      draw_axis({ scale });
    }
    // background bars
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
      d3.select('.remove_bars_background').remove();
    }

    // current line
    if (appearanceConfig.currentBarHidden) {
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
  function process_chart_data_for_display() {
    const { bin: bin_final } = getConfig();
    const { token_x_metadata, token_y_metadata, point_delta } = pool;
    const decimalRate_price =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    const list =
      chartType == 'USER' ? chartDataList : getChartDataListInRange();
    const data: IChartData[] = list.map((o: IChartData) => {
      const { point } = o;
      const price_l = getPriceByPoint(+point, decimalRate_price);
      const point_r = +point + point_delta * bin_final;
      const point_r_close = +point + point_delta * bin_final + 1;
      const price_r = getPriceByPoint(point_r, decimalRate_price);
      const price_r_close = getPriceByPoint(point_r_close, decimalRate_price);

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
        price: price_l.toString(),
        price_r: price_r.toString(),
        point_r: point_r.toString(),
        price_r_close: price_r_close.toString(),
      };
    });
    return data;
  }
  function hoverBox(e: any, d: IChartData) {
    d3.select(`${randomId} .overBox`).attr(
      'style',
      `visibility:visible;transform:translate(${
        e.offsetX + disFromHoverBoxToPointer
      }px, ${e.offsetY / 2}px)`
    );
    const { point, token_x, token_y, order_x, order_y, fee, total_liquidity } =
      d;
    const { colors } = getConfig();

    const total_token_x = Big(token_x).plus(order_x);
    const total_token_y = Big(token_y).plus(order_y);
    const price_by_token_x = get_price_by_point(+point);
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
      price_by_token_x: formatPrice(price_by_token_x),
      price_by_token_y: formatPrice(price_by_token_y),
    });
  }
  function LeaveBox(e: any, d: IChartData) {
    d3.select(`${randomId} .overBox`).attr(
      'style',
      `visibility:hidden;transform:translate(${
        e.offsetX + disFromHoverBoxToPointer
      }px, ${e.offsetY / 2}px)`
    );
  }
  function hoverUserBox(e: any) {
    d3.select(`${randomId} .wholeOverBox`).attr(
      'style',
      `visibility:visible;transform:translate(${
        e.offsetX + disFromHoverBoxToPointer
      }px, ${e.offsetY / 2}px)`
    );
  }
  function LeaveUserBox(e: any) {
    d3.select(`${randomId} .wholeOverBox`).attr(
      'style',
      `visibility:hidden;transform:translate(${
        e.offsetX + disFromHoverBoxToPointer
      }px, ${e.offsetY / 2}px)`
    );
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
          return dBig.toFixed(0);
        } else {
          return d;
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
          scale(Big(d.price_r).toNumber()) - scale(Big(d.price).toNumber())
        );
      })
      .attr('height', function (d) {
        return get_final_bar_height(scaleBar(+d.liquidity));
      })
      .attr('x', function (d) {
        return scale(Big(d.price).toNumber());
      })
      .attr('y', function (d) {
        return wholeBarHeight - get_final_bar_height(scaleBar(+d.liquidity));
      })
      .attr('rx', 2)
      .attr('fill', function (d) {
        return +d.point >= current_point ? colors[1] : colors[0];
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
          scale(Big(d.price_r).toNumber()) - scale(Big(d.price).toNumber())
        );
      })
      .attr('height', function (d) {
        return get_final_bar_height(scaleBar(+d.order_liquidity));
      })
      .attr('x', function (d) {
        return scale(Big(d.price).toNumber());
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
        return +d.point >= current_point ? colors[1] : colors[0];
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
          scale(Big(d.price_r_close).toNumber()) -
          scale(Big(d.price).toNumber())
        );
      })
      .attr('height', function (d) {
        return wholeBarHeight;
      })
      .attr('x', function (d) {
        return scale(Big(d.price).toNumber());
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
    d3.select(`${randomId} .remove_bars_background`)
      .attr('width', function () {
        if (all) {
          return scale(max_bin_price) - scale(min_bin_price);
        } else if (fromLeft) {
          return scale(get_price_by_point(point)) - scale(min_bin_price);
        } else if (fromRight) {
          return scale(max_bin_price) - scale(get_price_by_point(point));
        }
      })
      .attr('height', function () {
        return (
          scaleBar(sortY[sortY.length - 1]) + whole_bars_background_padding
        );
      })
      .attr('x', function () {
        if (fromRight) {
          return scale(get_price_by_point(point));
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
    d3.select(`${randomId} .currentLine`).attr(
      'style',
      `transform:translate(${
        scale(+get_current_price()) + svgPaddingX
      }px, -${axisHeight}px)`
    );
  }
  function draw_drag_left({ scale }: { scale: any }) {
    // 初始化左的位置
    const price = get_current_price();
    let price_l;
    if (dragLeftPoint) {
      price_l = get_price_by_point(dragLeftPoint);
    } else {
      const price_l_temp = Big(1 - defaultPercent / 100)
        .mul(price)
        .toFixed();
      const newLeftPoint = get_nearby_bin_left_point(
        get_point_by_price(price_l_temp)
      );
      price_l = get_price_by_point(newLeftPoint);
      setDragLeftPoint(newLeftPoint);
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
      const p = scale.invert(e.x);
      const newLeftPoint = get_nearby_bin_left_point(get_point_by_price(p));

      setDragLeftPoint(newLeftPoint);
      setLeftPoint && setLeftPoint(newLeftPoint);
    });
    d3.select(`${randomId} .drag-left`).call(dragLeft);
  }
  function draw_drag_right({ scale }: { scale: any }) {
    // 初始化右的位置
    const price = get_current_price();
    let price_r;
    if (dragRightPoint) {
      price_r = get_price_by_point(dragRightPoint);
    } else {
      const price_r_temp = Big(1 + defaultPercent / 100)
        .mul(price)
        .toFixed();
      const newRightPoint = get_nearby_bin_right_point(
        get_point_by_price(price_r_temp)
      );
      price_r = get_price_by_point(newRightPoint);
      setDragRightPoint(newRightPoint);
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
      const p = scale.invert(e.x);
      const newRightPoint = get_nearby_bin_right_point(get_point_by_price(p));
      setDragRightPoint(newRightPoint);
      setRightPoint && setRightPoint(newRightPoint);
    });
    d3.select(`${randomId} .drag-right`).call(dragRight);
  }
  function draw_radius_mode_bar() {
    const scale: any = scaleAxis();
    const { targetPoint } = config;
    const price = get_price_by_point(targetPoint);
    const x = scale(price);
    d3.select(`${randomId} .radiusBar`)
      .attr('transform', `translate(${x}, -${axisHeight})`)
      .attr('style', 'display:block');
  }
  function get_current_price() {
    return get_price_by_point(pool.current_point);
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
  function clickToLeft() {
    const { bin } = getConfig();
    const newPoint = dragLeftPoint - pool.point_delta * (bin + 1);
    const newPoint_nearby_bin = get_bin_point_by_point(newPoint, 'floor');
    setDragLeftPoint(newPoint_nearby_bin);
    setLeftPoint && setLeftPoint(newPoint_nearby_bin);
  }
  function clickToRight() {
    const { bin } = getConfig();
    const newPoint = dragRightPoint + pool.point_delta * (bin + 1);
    const newPoint_nearby_bin = get_bin_point_by_point(newPoint, 'ceil');
    setDragRightPoint(newPoint_nearby_bin);
    setRightPoint && setRightPoint(newPoint_nearby_bin);
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
  function scaleAxis_Pool() {
    return d3
      .scaleLinear()
      .domain(price_range)
      .range([0, svgWidth - svgPaddingX * 2]);
  }
  function scaleAxis_User() {
    const binWidth = get_bin_width();
    const min_point = Math.max(
      chartDataList[0].point - binWidth * 2,
      POINTLEFTRANGE
    );
    const max_point = Math.min(
      chartDataList[chartDataList.length - 1].point + binWidth * 2,
      POINTRIGHTRANGE
    );
    const min_price = get_price_by_point(min_point);
    const max_price = get_price_by_point(max_point);
    const range = [+min_price, +max_price];
    return d3
      .scaleLinear()
      .domain(range)
      .range([0, svgWidth - svgPaddingX * 2]);
  }
  function scaleAxisY(data: IChartData[]) {
    if (chartType == 'USER') {
      return scaleAxisY_User();
    } else {
      return scaleAxisY_Pool(data);
    }
  }
  function scaleAxisY_Pool(data: IChartData[]) {
    const L: number[] = [];
    data.forEach((o: IChartData) => {
      const { liquidity, order_liquidity } = o;
      L.push(
        +liquidity,
        +order_liquidity,
        Big(liquidity).plus(order_liquidity).plus(min_bar_height).toNumber()
      );
    });
    const sortL = sortBy(L);
    return d3
      .scaleLinear()
      .domain([0, +sortL[sortL.length - 1]])
      .range([0, wholeBarHeight]);
  }
  function scaleAxisY_User() {
    const { sortY: sortL } = get_price_and_liquidity_range();
    return d3
      .scaleLinear()
      .domain([0, +sortL[sortL.length - 1]])
      .range([0, wholeBarHeight - whole_bars_background_padding])
      .clamp(true);
  }
  function get_bin_width() {
    const slot_num_in_a_bin = getConfig().bin;
    const { point_delta } = pool;
    return point_delta * slot_num_in_a_bin;
  }
  function get_price_and_liquidity_range() {
    const Y: number[] = [];
    const X: number[] = [];
    const chartDataListInrange =
      chartType == 'USER' ? chartDataList : getChartDataListInRange();
    const binWidth = getConfig().bin * pool.point_delta;
    chartDataListInrange.forEach((o: IChartData, index) => {
      const { liquidity, point } = o;
      Y.push(+liquidity);
      X.push(+point);
      if (index == chartDataListInrange.length - 1) {
        X.push(+point + binWidth);
      }
    });
    const sortY = sortBy(Y);
    const sortX = sortBy(X);
    const sortX_Price = sortX.map((x) => {
      return get_price_by_point(x);
    });
    return { sortP: sortX_Price, sortY };
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
  function reverse_price(price: string) {
    if (Big(price).eq(0)) return 0;
    return Big(1).div(price).toFixed();
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
    <div
      className={`relative inline-flex ${
        (chartType !== 'USER' && chartDataList) ||
        (chartType == 'USER' && chartDataList?.length)
          ? ''
          : 'hidden'
      } ${randomId.slice(1)}`}
    >
      {/* 控件按钮*/}
      <div className="control flex items-center border border-v3GreyColor rounded-lg py-px h-6 w-16 absolute right-0 -top-24">
        {/* <div
          className="flex items-center justify-center w-1 h-full flex-grow border-r border-chartBorderColor cursor-pointer"
          onClick={clickToLeft}
        >
          <LeftArrowIcon></LeftArrowIcon>
        </div> */}
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
          {/* 横坐标轴 */}
          <g className="axis"></g>
          {/* 拖拽线 left */}
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
              <rect width="28" height="253" opacity="0"></rect>
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
          {/* 拖拽线 right */}
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
                width="28"
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
          {/* 左右坐标轴中间的重叠区域 */}
          <g className="overlap" pointer-events="none">
            <rect height={wholeBarHeight} fill="rgba(255,255,255,0.2)"></rect>
          </g>
          {/* radius 模式下 target price 对应的柱子 */}
          <g className="radiusBar">
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
      {/* hover到柱子(bin)上的悬浮框 */}
      <div className="overBox absolute rounded-xl bg-chartHoverBoxBg border border-assetsBorder px-3 py-2 invisible z-10">
        <div className="flex items-center justify-between my-2">
          <span className="text-xs text-white">Trailing 24hr APR</span>
          <span className="text-xs text-white gotham_bold">
            {binDetail?.feeApr}
          </span>
        </div>
        <div className="flex items-center justify-between my-2">
          <span className="text-xs text-white mr-10">Price</span>
          <span className="text-xs text-white gotham_bold">
            {binDetail?.price_by_token_x} {pool?.token_x_metadata?.symbol} /{' '}
            {binDetail?.price_by_token_y} {pool?.token_y_metadata?.symbol}
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
                <span className="text-xs text-white">by Limit Orders</span>
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
                <span className="text-xs text-white">by Limit Orders</span>
              </div>
              <span className="text-xs text-white gotham_bold">
                {binDetail.token_y_amount_in_order}
              </span>
            </div>
          </>
        ) : null}
      </div>
      <div className="wholeOverBox absolute rounded-xl bg-chartHoverBoxBg border border-assetsBorder px-3 py-2 z-10 invisible">
        <div className="flex items-center justify-between my-2">
          <span className="text-xs text-white">Your Liquidity</span>
          <span className="text-xs text-white gotham_bold">
            {user_liquidities_detail?.total_value || '-'}
          </span>
        </div>
        <div className="flex items-center justify-between my-2">
          <span className="text-xs text-white mr-10">Price Range</span>
          <span className="text-xs text-white gotham_bold">
            {user_liquidities_detail?.min_price} -{' '}
            {user_liquidities_detail?.max_price}
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
          <span className="text-xs text-white mr-10">Trailing 24hr APR</span>
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
      {/* current 价格 */}
      <div className="currentLine flex flex-col items-center absolute left-0 pointer-events-none">
        <div
          className="border border-white border-dashed"
          style={{ height: svgHeight + 'px' }}
        ></div>
        <div className="top-0 left-0 bg-senderHot rounded-lg p-2 absolute transform -translate-x-1/2 -translate-y-full">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-black mr-3">
              {pool?.token_x_metadata?.symbol}:{' '}
            </span>
            <span className="text-xs text-black">
              <label className="gotham_bold mr-1">
                {get_current_price_by_token_x()}
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
                {get_current_price_by_token_y()}
              </label>
              {pool?.token_x_metadata?.symbol}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
function isValid(n: number) {
  if (n !== undefined && n !== null) return true;
  return false;
}
function LeftArrowIcon(props: any) {
  return (
    <svg
      {...props}
      width="5"
      height="9"
      viewBox="0 0 5 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 1L1 4.5L4 8"
        stroke="#91A2AE"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}
function RightArrowIcon(props: any) {
  return (
    <svg
      {...props}
      width="7"
      height="9"
      viewBox="0 0 7 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 8L5 4.5L1 1"
        stroke="#91A2AE"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}

function AddIcon(props: any) {
  return (
    <svg
      {...props}
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="0.75"
        y1="4.43054"
        x2="8.09615"
        y2="4.43054"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <line
        x1="4.49268"
        y1="0.826904"
        x2="4.49268"
        y2="8.17306"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}

function SubIcon(props: any) {
  return (
    <svg
      {...props}
      width="9"
      height="2"
      viewBox="0 0 9 2"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="0.75"
        y1="1.25"
        x2="8.09615"
        y2="1.25"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}
function createRandomChar(c = 'a-z') {
  switch (c) {
    case 'A-Z':
      return String.fromCharCode(Math.trunc(Math.random() * 25) + 65);
    case 'a-z':
      return String.fromCharCode(Math.trunc(Math.random() * 25) + 97);
    case '0-9':
    default:
      return String.fromCharCode(Math.trunc(Math.random() * 10) + 48);
  }
}
function createRandomString(length = 4) {
  let str = '';
  for (let i = 0; i < length; i++) str += createRandomChar();
  return str;
}
