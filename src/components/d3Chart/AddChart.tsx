import React, { useState, useRef, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { isMobile } from '../../utils/device';
import { TokenMetadata, ftGetTokenMetadata } from '../../services/ft-contract';
import { get_pool, PoolInfo } from '../../services/swapV3';
import {
  getPriceByPoint,
  getPointByPrice,
  POINTLEFTRANGE,
  POINTRIGHTRANGE,
} from '../../services/commonV3';
import { ONLY_ZEROS, toPrecision } from '../../utils/numbers';
import { getDclPoolPoints } from '../../services/indexer';
import { sortBy } from 'lodash';
import {
  IChartData,
  IChartItemConfig,
  IChartConfig,
  IBinDetail,
} from './interfaces';
import { formatPrice, formatNumber, formatPercentage } from './utils';
import {
  get_custom_config_for_chart,
  get_default_config_for_chart,
} from './config';
import Big from 'big.js';
import * as d3 from 'd3';
export default function AddChart({
  pool_id,
  leftPoint,
  rightPoint,
  setLeftPoint,
  setRightPoint,
}: {
  pool_id: string;
  leftPoint?: number;
  rightPoint?: number;
  setLeftPoint?: Function;
  setRightPoint?: Function;
}) {
  const [pool, setPool] = useState<PoolInfo>();
  const [price_range, set_price_range] = useState<number[]>();
  const [chartDataList, setChartDataList] = useState<IChartData[]>();
  const [binDetail, setBinDetail] = useState<IBinDetail>();
  const [dragLeftPoint, setDragLeftPoint] = useState<number>(leftPoint);
  const [dragRightPoint, setDragRightPoint] = useState<number>(rightPoint);
  const [zoom, setZoom] = useState<number>();
  /** constant start */
  const svgWidth = 520;
  const svgHeight = 250;
  const axisHeight = 21;
  const wholeBarHeight = svgHeight - axisHeight;
  const dragBarWidth = 28;
  const disFromHoverBoxToPointer = 20;
  const percentBoxWidth = 44;
  const disFromPercentBoxToDragBar = 2;
  const svgPaddingX = 5;
  const defaultPercent = 10; // 初始化左侧右侧价格与当前价格的间距百分比 10===》10%, e.g. 右侧价格是当前价格的 1 + 10%
  /** constant end */
  useEffect(() => {
    if (pool_id) {
      get_pool_detail(pool_id);
    }
  }, [pool_id]);
  useEffect(() => {
    if (pool) {
      get_chart_data();
    }
  }, [pool]);
  useEffect(() => {
    if (price_range && chartDataList) {
      drawChart();
    }
  }, [price_range, chartDataList]);
  useEffect(() => {
    if (isValid(dragLeftPoint)) {
      const scale = scaleAxis();
      const newPoint = dragLeftPoint;
      const newPrice = get_price_by_point(newPoint);
      const movePercent = diffPrices(newPrice);
      const x = scale(+newPrice) - dragBarWidth / 2;
      d3.select('.drag-left').attr(
        'transform',
        `translate(${x}, -${axisHeight})`
      );
      d3.select('.percentLeft')
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
        d3.select('.drag-right').attr('transform').split(',')[0].slice(10)
      );
      const W = rightX - x - dragBarWidth / 2;
      d3.select('.overlap rect')
        .attr('transform', `translate(${x + dragBarWidth / 2}, 0)`)
        .attr('width', W);
      setLeftPoint && setLeftPoint(newPoint);
    }
  }, [dragLeftPoint]);
  useEffect(() => {
    if (isValid(leftPoint) && leftPoint !== dragLeftPoint) {
      setDragLeftPoint(leftPoint);
    }
  }, [leftPoint]);
  useEffect(() => {
    if (isValid(dragRightPoint)) {
      const scale = scaleAxis();
      const newPoint = dragRightPoint;
      const newPrice = get_price_by_point(newPoint);
      const movePercent = diffPrices(newPrice);
      const x = scale(+newPrice);
      d3.select('.drag-right').attr(
        'transform',
        `translate(${x}, -${axisHeight})`
      );
      d3.select('.percentRight')
        .attr(
          'transform',
          `translate(${x + (disFromPercentBoxToDragBar + 2)}, 0)`
        )
        .select('text')
        .text(movePercent + '%')
        .attr('fill', 'white');

      const leftX = Number(
        d3.select('.drag-left').attr('transform').split(',')[0].slice(10)
      );
      const W = x - leftX - dragBarWidth / 2;
      d3.select('.overlap rect').attr('width', W);
      setRightPoint && setRightPoint(newPoint);
    }
  }, [dragRightPoint]);
  useEffect(() => {
    if (isValid(rightPoint) && rightPoint !== dragRightPoint) {
      setDragRightPoint(rightPoint);
    }
  }, [rightPoint]);
  async function get_pool_detail(pool_id: string) {
    const p: PoolInfo = await get_pool(pool_id);
    const { token_x, token_y } = p;
    p.token_x_metadata = await ftGetTokenMetadata(token_x);
    p.token_y_metadata = await ftGetTokenMetadata(token_y);
    setPool(p);
  }
  async function get_chart_data() {
    const { point_delta, token_x_metadata, token_y_metadata, pool_id } = pool;
    const { bin: bin_final, rangeGear, range } = getConfig();
    const decimalRate_point =
      Math.pow(10, token_y_metadata.decimals) /
      Math.pow(10, token_x_metadata.decimals);
    const [price_l, price_r] = get_price_range_by_percent(rangeGear[0]);
    const point_l = getPointByPrice(point_delta, price_l, decimalRate_point);
    const point_r = getPointByPrice(point_delta, price_r, decimalRate_point);
    const list = await getDclPoolPoints(pool_id, bin_final, point_l, point_r);
    const [price_l_default, price_r_default] =
      get_price_range_by_percent(range);
    set_price_range([+price_l_default, +price_r_default]);
    setZoom(range);
    setChartDataList(list);
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
    const data: IChartData[] = getDataDisplayInChart();
    const scale = scaleAxis();
    const scaleBar = scaleAxisY();
    // 创建横坐标轴
    draw_axis({ scale });
    // down bars
    draw_down_bars({ data, scale, scaleBar });
    // up bars
    draw_up_bars({ data, scale, scaleBar });
    // background bars
    draw_background_bars({ data, scale });
    // current line
    draw_current_lint({ scale });
    // drag left
    draw_drag_left({ scale });
    // drag right
    draw_drag_right({ scale });
    // init overlap area
    draw_init_overlap_area({ scale });
  }
  function getDataDisplayInChart() {
    const { bin: bin_final } = getConfig();
    const { token_x_metadata, token_y_metadata, point_delta } = pool;
    const decimalRate_price =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    const data: IChartData[] = chartDataList.map((o: IChartData) => {
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
    d3.select('.overBox').attr(
      'style',
      `visibility:visible;transform:translate(${
        e.offsetX + disFromHoverBoxToPointer
      }px, ${e.offsetY / 2}px)`
    );
    const {
      point,
      token_x,
      token_y,
      order_x,
      order_y,
      liquidity,
      order_liquidity,
      fee,
      total_liquidity,
    } = d;
    const { current_point } = pool;
    const { colors } = getConfig();

    const total_token_x = Big(token_x).plus(order_x);
    const total_token_y = Big(token_y).plus(order_y);
    const price_by_token_x = get_price_by_point(+point);
    const price_by_token_y = reverse_price(price_by_token_x);
    const apr = Big(total_liquidity).gt(0)
      ? Big(fee).div(total_liquidity).mul(365).mul(100).toFixed()
      : '0';
    setBinDetail({
      // point,
      feeApr: formatPercentage(apr),
      color: +point > current_point ? colors[1] : colors[0],
      ...(total_token_x.gt(0)
        ? {
            token_x_amount: formatNumber(total_token_x.toFixed()),
            token_x_amount_in_liquidity: formatNumber(token_x),
            token_x_amount_in_order: formatNumber(order_x),
          }
        : {}),
      ...(total_token_y.gt(0)
        ? {
            token_y_amount: formatNumber(total_token_y.toFixed()),
            token_y_amount_in_liquidity: formatNumber(token_y),
            token_y_amount_in_order: formatNumber(order_y),
          }
        : {}),
      price_by_token_x: formatPrice(price_by_token_x),
      price_by_token_y: formatPrice(price_by_token_y),
    });
  }
  function LeaveBox(e: any, d: IChartData) {
    d3.select('.overBox').attr(
      'style',
      `visibility:hidden;transform:translate(${
        e.offsetX + disFromHoverBoxToPointer
      }px, ${e.offsetY / 2}px)`
    );
  }
  function draw_axis({ scale }: { scale: any }) {
    const axis: any = d3.axisBottom(scale).tickSize(0).tickPadding(10);
    d3.select('svg .axis').call(axis).selectAll('text').attr('fill', '#7E8A93');
    d3.select('svg .axis')
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
    d3.select('.bars_liquidity')
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
        return scaleBar(+d.liquidity);
      })
      .attr('x', function (d) {
        return scale(Big(d.price).toNumber());
      })
      .attr('y', function (d) {
        return wholeBarHeight - scaleBar(+d.liquidity);
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
    d3.select('.bars_order')
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
        return scaleBar(+d.order_liquidity);
      })
      .attr('x', function (d) {
        return scale(Big(d.price).toNumber());
      })
      .attr('y', function (d) {
        return (
          wholeBarHeight - scaleBar(+d.liquidity) - scaleBar(+d.order_liquidity)
        );
      })
      .attr('rx', 2)
      .attr('fill', function (d) {
        return +d.point >= current_point ? colors[1] : colors[0];
      })
      .attr('opacity', '0.7');
  }
  function draw_background_bars({
    data,
    scale,
  }: {
    data: IChartData[];
    scale: Function;
  }) {
    d3.select('.bars_background')
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
  function draw_current_lint({ scale }: { scale: Function }) {
    d3.select('.currentLine').attr(
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
    if (leftPoint) {
      price_l = get_price_by_point(leftPoint);
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
    d3.select('.drag-left').attr(
      'transform',
      `translate(${x}, -${axisHeight})`
    );
    d3.select('.percentLeft')
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
        d3.select('.drag-right').attr('transform').split(',')[0].slice(10)
      );
      if (rightX < e.x || e.x < dragBarWidth / 2) return;
      const p = scale.invert(e.x);
      const newLeftPoint = get_nearby_bin_left_point(get_point_by_price(p));
      setDragLeftPoint(newLeftPoint);
    });
    d3.select('.drag-left').call(dragLeft);
  }
  function draw_drag_right({ scale }: { scale: any }) {
    // 初始化右的位置
    const price = get_current_price();
    let price_r;
    if (rightPoint) {
      price_r = get_price_by_point(rightPoint);
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
    d3.select('.drag-right').attr(
      'transform',
      `translate(${x}, -${axisHeight})`
    );
    d3.select('.percentRight')
      .attr('transform', `translate(${x + disFromPercentBoxToDragBar + 2}, 0)`)
      .select('text')
      .text(`${diffPrices(price_r)}%`)
      .attr('fill', 'white');
    const dragRight = d3.drag().on('drag', (e) => {
      const leftX = Number(
        d3.select('.drag-left').attr('transform').split(',')[0].slice(10)
      );
      const limitx = svgWidth - (svgPaddingX * 2 + dragBarWidth);
      console.log('limitx', limitx);
      if (leftX > e.x - dragBarWidth / 2 || e.x > limitx) return;
      console.log('e.x', e.x);
      const p = scale.invert(e.x);
      const newRightPoint = get_nearby_bin_right_point(get_point_by_price(p));
      setDragRightPoint(newRightPoint);
    });
    d3.select('.drag-right').call(dragRight);
  }
  function draw_init_overlap_area({ scale }: { scale: any }) {
    const price = get_current_price();
    let price_l;
    if (leftPoint) {
      price_l = get_price_by_point(leftPoint);
    } else {
      const price_l_temp = Big(1 - defaultPercent / 100)
        .mul(price)
        .toFixed();
      const newLeftPoint = get_nearby_bin_left_point(
        get_point_by_price(price_l_temp)
      );
      price_l = get_point_by_price(newLeftPoint.toString());
    }
    const x = scale(price_l);
    const rightX = Number(
      d3.select('.drag-right').attr('transform').split(',')[0].slice(10)
    );
    const W = rightX - x;
    d3.select('.overlap rect')
      .attr('transform', `translate(${x}, 0)`)
      .attr('width', W);
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
    setDragLeftPoint(get_nearby_bin_left_point(newPoint));
  }
  function clickToRight() {
    const { bin } = getConfig();
    const newPoint = dragRightPoint + pool.point_delta * (bin + 1);
    setDragRightPoint(get_nearby_bin_left_point(newPoint));
  }
  function scaleAxis() {
    return d3
      .scaleLinear()
      .domain(price_range)
      .range([0, svgWidth - svgPaddingX * 2]);
  }
  function scaleAxisY() {
    const L: number[] = [];
    chartDataList.forEach((o: IChartData) => {
      const { liquidity, order_liquidity } = o;
      L.push(
        +liquidity,
        +order_liquidity,
        Big(liquidity).plus(order_liquidity).toNumber()
      );
    });
    const sortL = sortBy(L);
    return d3
      .scaleLinear()
      .domain([+sortL[0], +sortL[sortL.length - 1]])
      .range([0, wholeBarHeight]);
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
      return formatPrice(get_current_price());
    }
    return '-';
  }
  function get_current_price_by_token_y() {
    if (pool) {
      return formatPrice(reverse_price(get_current_price()));
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
  return (
    <div
      className={`m-10 relative inline-flex ${chartDataList ? '' : 'hidden'}`}
    >
      {/* 控件按钮*/}
      <div className="flex items-center border border-v3GreyColor rounded-lg py-px h-6 w-24 absolute right-0 -top-20">
        <div
          className="flex items-center justify-center w-1 h-full flex-grow border-r border-chartBorderColor cursor-pointer"
          onClick={clickToLeft}
        >
          <LeftArrowIcon></LeftArrowIcon>
        </div>
        <div
          className="flex items-center justify-center w-1 h-full flex-grow border-r border-chartBorderColor cursor-pointer"
          onClick={zoomOut}
        >
          <AddIcon></AddIcon>
        </div>
        <div
          className="flex items-center justify-center w-1 h-full flex-grow border-r border-chartBorderColor cursor-pointer"
          onClick={zoomIn}
        >
          <SubIcon></SubIcon>
        </div>
        <div
          className="flex items-center justify-center w-1 h-full flex-grow cursor-pointer"
          onClick={clickToRight}
        >
          <RightArrowIcon></RightArrowIcon>
        </div>
      </div>
      <svg width={svgWidth} height={svgHeight}>
        <g transform={`translate(${svgPaddingX} 0)`}>
          <g className="bars_order"></g>
          <g className="bars_liquidity"></g>
          <g className="bars_background"></g>
          {/* 横坐标轴 */}
          <g className="axis"></g>
          {/* 拖拽线 left */}
          <g>
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
          <g>
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
            <rect height={wholeBarHeight} fill="rgba(255,255,255,0.1)"></rect>
          </g>
        </g>
      </svg>
      {/* hover到柱子上的悬浮框 */}
      <div className="overBox absolute rounded-xl bg-chartHoverBoxBg border border-assetsBorder px-3 py-2 invisible z-10">
        <div className="flex items-center justify-between my-2">
          <span className="text-xs text-white">Fee APR (24h)</span>
          {/* todo test 数据 */}
          {/* {binDetail?.point} */}
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
                    backgroundColor: `${binDetail?.color}`,
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
                    backgroundColor: `${binDetail?.color}`,
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
                    backgroundColor: `${binDetail?.color}`,
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
                    backgroundColor: `${binDetail?.color}`,
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
        stroke="#91A2AE"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <line
        x1="4.49268"
        y1="0.826904"
        x2="4.49268"
        y2="8.17306"
        stroke="#91A2AE"
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
        stroke="#91A2AE"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  );
}
