import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  createContext,
  useRef,
} from 'react';
import { get_pointorder_range } from '../../services/swapV3';
import { get_pool, PoolInfo } from '../../services/swapV3';
import { ftGetTokenMetadata } from '../../services/ft-contract';
import { getPriceByPoint, sort_tokens_by_base } from '../../services/commonV3';
import SwapProTab from './SwapProTab';
import {
  toReadableNumber,
  toInternationalCurrencySystem,
} from '~utils/numbers';
import { toRealSymbol } from '../../utils/token';
import { SwapProContext } from '../../pages/SwapPage';
import Big from 'big.js';
import * as d3 from 'd3';
const LimitOrderChartData = createContext(null);
export default function SwapLimitOrderChart() {
  // CONST start
  const limitOrderContainerHeight = '150';
  // CONST end
  const [pool, setPool] = useState<PoolInfo>();
  const [orders, setOrders] = useState<IOrderPoint>();
  const [switch_token, set_switch_token] = useState<ISwitchToken>();
  const [buy_token_x_list, set_buy_token_x_list] =
    useState<IOrderPointItem[]>();
  const [sell_token_x_list, set_sell_token_x_list] =
    useState<IOrderPointItem[]>();
  const [buy_token_y_list, set_buy_token_y_list] =
    useState<IOrderPointItem[]>();
  const [sell_token_y_list, set_sell_token_y_list] =
    useState<IOrderPointItem[]>();
  const [buy_list, set_buy_list] = useState<IOrderPointItem[]>();
  const [sell_list, set_sell_list] = useState<IOrderPointItem[]>();
  const [market_loading, set_market_loading] = useState<boolean>(false);
  const [pair_is_reverse, set_pair_is_reverse] = useState<boolean>(false);
  const { dcl_pool_id } = useContext(SwapProContext);
  const GEARS = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const [zoom, setZoom] = useState<number>(GEARS[0]);
  const pool_id = dcl_pool_id;
  const left_point = -800000;
  const right_point = 600000;
  const sellBoxRef = useRef(null);
  useEffect(() => {
    if (pool_id) {
      get_points_of_orders();
      get_pool_detail();
      setZoom(GEARS[0]);
    }
  }, [pool_id]);
  useEffect(() => {
    if (pool_id && market_loading) {
      refresh();
    }
  }, [market_loading]);
  useEffect(() => {
    if (pool && orders) {
      process_orders();
    }
  }, [pool, orders]);
  useEffect(() => {
    if (switch_token == 'X' && buy_token_x_list && sell_token_x_list) {
      set_buy_list(buy_token_x_list);
      set_sell_list(sell_token_x_list);
    } else if (switch_token == 'Y' && buy_token_y_list && sell_token_y_list) {
      set_buy_list(buy_token_y_list);
      set_sell_list(sell_token_y_list);
    }
  }, [
    switch_token,
    buy_token_x_list,
    sell_token_x_list,
    buy_token_y_list,
    sell_token_y_list,
  ]);
  useEffect(() => {
    if (sellBoxRef.current && sell_list?.length) {
      sellBoxRef.current.scrollTop = 10000;
    }
  }, [sellBoxRef, sell_list]);
  const [cur_pairs, cur_token_symbol, cur_pair_icons] = useMemo(() => {
    if (pool) {
      const classStr = 'w-6 h-6 rounded-full border border-gradientFromHover';
      const { token_x_metadata, token_y_metadata } = pool;
      const x_symbol = toRealSymbol(token_x_metadata.symbol);
      const y_symbol = toRealSymbol(token_y_metadata.symbol);
      if (switch_token == 'X') {
        const y_icons = (
          <>
            <img className={classStr} src={token_y_metadata.icon}></img>
            <img
              className={`${classStr} -ml-1.5`}
              src={token_x_metadata.icon}
            ></img>
          </>
        );
        return [`${y_symbol}/${x_symbol}`, `${y_symbol}`, y_icons];
      } else if (switch_token == 'Y') {
        const x_icons = (
          <>
            <img className={classStr} src={token_x_metadata.icon}></img>
            <img
              className={`${classStr} -ml-1.5`}
              src={token_y_metadata.icon}
            ></img>
          </>
        );
        return [`${x_symbol}/${y_symbol}`, `${x_symbol}`, x_icons];
      }
    }
    return [];
  }, [switch_token, pool]);
  async function refresh() {
    await get_points_of_orders();
    await get_pool_detail();
    set_market_loading(false);
  }
  async function get_points_of_orders() {
    const result = await get_pointorder_range({
      pool_id,
      left_point,
      right_point,
    });
    setOrders(result);
  }
  async function get_pool_detail() {
    const p: PoolInfo = await get_pool(pool_id);
    const { token_x, token_y } = p;
    p.token_x_metadata = await ftGetTokenMetadata(token_x);
    p.token_y_metadata = await ftGetTokenMetadata(token_y);
    const tokens = sort_tokens_by_base([
      p.token_x_metadata,
      p.token_y_metadata,
    ]);
    if (tokens[0].id == p.token_x_metadata.id) {
      set_switch_token('X');
      set_pair_is_reverse(false);
    } else {
      set_switch_token('Y');
      set_pair_is_reverse(true);
    }
    setPool(p);
  }
  function process_orders() {
    const list = Object.values(orders);
    const sell_token_x_list: IOrderPointItem[] = [];
    const sell_token_y_list: IOrderPointItem[] = [];
    const buy_token_x_list: IOrderPointItem[] = [];
    const buy_token_y_list: IOrderPointItem[] = [];
    const list_x = list.filter((item: IOrderPointItem) =>
      Big(item.amount_x).gt(0)
    );
    list_x.sort((b: IOrderPointItem, a: IOrderPointItem) => {
      return b.point - a.point;
    });
    const list_y = list
      .filter((item: IOrderPointItem) => Big(item.amount_y).gt(0))
      .reverse();
    const { token_x_metadata, token_y_metadata } = pool;
    list_y.sort((b: IOrderPointItem, a: IOrderPointItem) => {
      return a.point - b.point;
    });
    // accumulate
    list_x.forEach((item: IOrderPointItem) => {
      const { point, amount_x } = item;
      const price_x_base = get_price_by_point(point);
      const price_y_base = Big(price_x_base).eq(0)
        ? '0'
        : Big(1).div(price_x_base).toFixed();
      const sell_x_readable = toReadableNumber(
        token_x_metadata.decimals,
        amount_x
      );
      const buy_y_readable = Big(price_x_base).mul(sell_x_readable).toFixed();
      const length_sell_token_x_list = sell_token_x_list.length;
      const length_buy_token_y_list = sell_token_x_list.length;
      sell_token_x_list.push({
        ...item,
        price: price_x_base,
        amount_x_readable: sell_x_readable,
        accumulated_x_readable:
          length_sell_token_x_list == 0
            ? sell_x_readable
            : Big(
                sell_token_x_list[length_sell_token_x_list - 1]
                  .accumulated_x_readable
              )
                .plus(sell_x_readable)
                .toFixed(),
      });
      buy_token_y_list.push({
        ...item,
        price: price_y_base,
        amount_y_readable: buy_y_readable,
        accumulated_y_readable:
          length_buy_token_y_list == 0
            ? buy_y_readable
            : Big(
                buy_token_y_list[length_buy_token_y_list - 1]
                  .accumulated_y_readable
              )
                .plus(buy_y_readable)
                .toFixed(),
      });
    });
    list_y.forEach((item: IOrderPointItem) => {
      const { point, amount_y } = item;
      const price_x_base = get_price_by_point(point);
      const price_y_base = Big(price_x_base).eq(0)
        ? '0'
        : Big(1).div(price_x_base).toFixed();
      const sell_y_readable = toReadableNumber(
        token_y_metadata.decimals,
        amount_y
      );
      const buy_x_readable = Big(price_y_base).mul(sell_y_readable).toFixed();
      const length_sell_token_y_list = sell_token_y_list.length;
      const length_buy_token_x_list = buy_token_x_list.length;
      sell_token_y_list.push({
        ...item,
        price: price_y_base,
        amount_y_readable: sell_y_readable,
        accumulated_y_readable:
          length_sell_token_y_list == 0
            ? sell_y_readable
            : Big(
                sell_token_y_list[length_sell_token_y_list - 1]
                  .accumulated_y_readable
              )
                .plus(sell_y_readable)
                .toFixed(),
      });
      buy_token_x_list.push({
        ...item,
        price: price_x_base,
        amount_x_readable: buy_x_readable,
        accumulated_x_readable:
          length_buy_token_x_list == 0
            ? buy_x_readable
            : Big(
                buy_token_x_list[length_buy_token_x_list - 1]
                  .accumulated_x_readable
              )
                .plus(buy_x_readable)
                .toFixed(),
      });
    });
    const sell_token_x_list_reverse = sell_token_x_list.reverse();
    const sell_token_y_list_reverse = sell_token_y_list.reverse();
    set_buy_token_x_list(buy_token_x_list);
    set_sell_token_x_list(sell_token_x_list_reverse);
    set_buy_token_y_list(buy_token_y_list);
    set_sell_token_y_list(sell_token_y_list_reverse);
  }
  function get_price_by_point(point: number) {
    const { token_x_metadata, token_y_metadata } = pool;
    const decimalRate_price =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    return getPriceByPoint(point, decimalRate_price);
  }
  function get_rate_element() {
    if (pool) {
      const { current_point, token_x_metadata, token_y_metadata } = pool;
      const current_price_x = get_price_by_point(current_point);
      const current_price_y = Big(current_price_x).gt(0)
        ? Big(1).div(current_price_x).toFixed()
        : '0';
      return (
        <>
          <span className="text-sm text-primaryText">
            1{' '}
            {switch_token == 'X'
              ? token_x_metadata.symbol
              : token_y_metadata.symbol}{' '}
            =
          </span>
          <span className="text-2xl text-white gotham_bold mx-1.5">
            {switch_token == 'X'
              ? formatPrice(current_price_x)
              : formatPrice(current_price_y)}
          </span>
          <span className="text-sm text-primaryText">
            {switch_token == 'X'
              ? token_y_metadata.symbol
              : token_x_metadata.symbol}
          </span>
        </>
      );
    }
  }
  function marketRefresh() {
    set_market_loading(true);
  }
  // 缩小坐标轴区间范围
  function zoomOut() {
    const targetPercent = GEARS.find((item) => item < zoom);
    if (targetPercent) {
      setZoom(targetPercent);
    }
    console.log('缩小中- targetPercent', targetPercent);
  }
  // 放大坐标轴区间范围
  function zoomIn() {
    const GEARSCOPY: number[] = JSON.parse(JSON.stringify(GEARS)).reverse();
    const targetPercent = GEARSCOPY.find((item) => item > zoom);
    if (targetPercent) {
      setZoom(targetPercent);
    }
  }
  return (
    <LimitOrderChartData.Provider
      value={{
        buy_list,
        sell_list,
        cur_pairs,
        cur_token_symbol,
        pool,
        get_price_by_point,
        switch_token,
        zoom,
        GEARS,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center mr-2">{cur_pair_icons}</div>
          <span className="text-base text-white gotham_bold">{cur_pairs}</span>
        </div>
        <SwapProTab></SwapProTab>
      </div>
      <div className="flex items-stretch justify-between mt-4">
        {/* chart area */}
        <div className="flex-grow pr-3">
          {/* base data */}
          <div className="flex items-center justify-between">
            <div className="flex items-end">{get_rate_element()}</div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-between border border-v3GreyColor rounded-lg p-0.5 mr-2.5 ${
                    pair_is_reverse ? 'flex-row-reverse' : ''
                  }`}
                >
                  <span
                    onClick={() => {
                      set_switch_token('X');
                    }}
                    className={`flex items-center justify-center cursor-pointer rounded-md px-1.5 py-0.5 text-xs ${
                      switch_token == 'X'
                        ? 'bg-proTabBgColor text-white'
                        : 'text-primaryText'
                    }`}
                  >
                    {pool?.token_x_metadata?.symbol}
                  </span>
                  <span
                    onClick={() => {
                      set_switch_token('Y');
                    }}
                    className={`flex items-center justify-center cursor-pointer  rounded-md px-1.5 py-0.5 text-xs ${
                      switch_token == 'Y'
                        ? 'bg-proTabBgColor text-white'
                        : 'text-primaryText'
                    }`}
                  >
                    {pool?.token_y_metadata?.symbol}
                  </span>
                </div>
              </div>
              {/* control button*/}
              <div className="control flex items-center border border-v3GreyColor rounded-lg py-px h-6 w-16">
                {/* <div
                  className="flex items-center justify-center w-1 h-full flex-grow border-r border-chartBorderColor cursor-pointer"
                  onClick={clickToLeft}
                >
                  <LeftArrowIcon></LeftArrowIcon>
                </div> */}
                <div
                  className={`flex items-center justify-center w-1 h-full flex-grow border-r border-chartBorderColor ${
                    zoom == GEARS[GEARS.length - 1]
                      ? 'text-chartBorderColor cursor-not-allowed'
                      : 'text-v3SwapGray cursor-pointer'
                  }`}
                  onClick={zoomOut}
                >
                  <AddIcon></AddIcon>
                </div>
                <div
                  className={`flex items-center justify-center w-1 h-full flex-grow ${
                    zoom == GEARS[0]
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
            </div>
          </div>
          {/* chart */}
          <OrderChart></OrderChart>
        </div>
        {/* table area */}
        <div
          className="border-l border-r border-limitOrderFeeTiersBorderColor"
          style={{ width: '260px' }}
        >
          <div className="text-sm text-white gotham_bold pl-3">
            Limit Orders
          </div>
          <div className="flex items-center justify-between p-3 border-b border-limitOrderFeeTiersBorderColor">
            <div className="flex flex-col">
              <span className="text-sm text-primaryText">Price</span>
              <span className="text-xs text-primaryText" style={{ zoom: 0.85 }}>
                {cur_pairs}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-primaryText">Qty</span>
              <span className="text-xs text-primaryText" style={{ zoom: 0.85 }}>
                {cur_token_symbol}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-primaryText whitespace-nowrap">
                Total Qty
              </span>
              <span className="text-xs text-primaryText" style={{ zoom: 0.85 }}>
                {cur_token_symbol}
              </span>
            </div>
          </div>
          <div
            ref={sellBoxRef}
            className="p-3 pr-0 overflow-auto"
            style={{ maxHeight: `${limitOrderContainerHeight}px` }}
          >
            {sell_list?.map((item: IOrderPointItem, index) => {
              return (
                <div
                  key={item.point + index}
                  className="flex items-center justify-between text-xs py-1.5 pr-2"
                >
                  <span className="text-sellColorNew">
                    {formatPrice(item.price)}
                  </span>
                  <span className="text-white">
                    {formatNumber(
                      item.amount_x_readable || item.amount_y_readable
                    )}
                  </span>
                  <span className="text-white">
                    {formatNumber(
                      item.accumulated_x_readable || item.accumulated_y_readable
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center mt-2.5 pl-3">
            <span className="text-xs text-white mr-2">Market Pirce</span>
            <RefreshIcon
              className={`cursor-pointer ${
                market_loading ? 'refresh-loader' : ''
              }`}
              onClick={marketRefresh}
            ></RefreshIcon>
          </div>
          <div
            className="p-3 pr-0 overflow-auto"
            style={{ maxHeight: `${limitOrderContainerHeight}px` }}
          >
            {buy_list?.map((item: IOrderPointItem, index) => {
              return (
                <div
                  key={item.point + index}
                  className="flex items-center justify-between text-xs py-1.5 pr-2"
                >
                  <span className="text-gradientFromHover">
                    {formatPrice(item.price)}
                  </span>
                  <span className="text-white">
                    {formatNumber(
                      item.amount_x_readable || item.amount_y_readable
                    )}
                  </span>
                  <span className="text-white">
                    {formatNumber(
                      item.accumulated_x_readable || item.accumulated_y_readable
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </LimitOrderChartData.Provider>
  );
}
function OrderChart() {
  const {
    buy_list,
    sell_list,
    cur_pairs,
    cur_token_symbol,
    pool,
    get_price_by_point,
    switch_token,
    zoom,
    GEARS,
  }: {
    buy_list: IOrderPointItem[];
    sell_list: IOrderPointItem[];
    cur_pairs: string;
    cur_token_symbol: string;
    pool: PoolInfo;
    get_price_by_point: Function;
    switch_token: ISwitchToken;
    zoom: number;
    GEARS: number[];
  } = useContext(LimitOrderChartData);

  const [foucsOrderPoint, setFoucsOrderPoint] = useState<IOrderPointItem>();
  const [side, setSide] = useState<ISide>();
  // CONST start
  const svg_width = 600;
  const svg_height = 400;
  const svg_padding = 40;
  const axisRightWidth = 60;
  const disFromHoverBoxToPointer = 20;
  // CONST end
  useEffect(() => {
    if (sell_list?.length || buy_list?.length) {
      drawChart();
    } else {
      clearChart();
    }
  }, [buy_list, sell_list, zoom]);
  function drawChart() {
    clearChart();
    const { price_range, amount_range, buy_list_new, sell_list_new } =
      get_data_for_drawing();
    // 创建一个横坐标轴
    const scaleBottom = d3
      .scaleLinear()
      .domain(price_range)
      .range([0, svg_width - svg_padding - axisRightWidth])
      .clamp(true);
    const axisBottom: any = d3.axisTop(scaleBottom).tickSize(0).tickPadding(10);
    d3.select('.axisBottom')
      .transition()
      .attr('transform', `translate(0, ${svg_height - svg_padding})`)
      .call(axisBottom)
      .selectAll('text')
      .attr('fill', '#7E8A93');
    d3.select('.axisBottom').select('.domain').attr('stroke', 'transparent');

    // 创建一个纵坐标
    const scaleRight = d3
      .scaleLinear()
      .domain(amount_range)
      .range([0, svg_height - svg_padding * 2])
      .clamp(true);
    const axisRight: any = d3.axisLeft(scaleRight).tickSize(0).tickPadding(10);
    d3.select('.axisRight')
      .transition()
      .attr('transform', `translate(${svg_width - svg_padding}, 0)`)
      .call(axisRight)
      .selectAll('text')
      .attr('fill', '#7E8A93')
      .select('.domain');
    d3.select('.axisRight').select('.domain').attr('stroke', 'transparent');

    // 面积 path data 生成器
    const areaGenerator = d3
      .area()
      .x((d: any) => {
        return +Big(scaleBottom(+d.price)).toFixed(0);
      })
      .y0(() => {
        return svg_height - svg_padding * 2;
      })
      .y1((d: any) => {
        return +Big(
          scaleRight(+(d.accumulated_x_readable || d.accumulated_y_readable))
        ).toFixed(0);
      });

    // 折线path data生成器
    const lineGenerator = d3
      .line()
      .x((d: any) => {
        return +Big(scaleBottom(+d.price)).toFixed(0);
      })
      .y((d: any) => {
        return +Big(
          scaleRight(+(d.accumulated_x_readable || d.accumulated_y_readable))
        ).toFixed(0);
      });

    // 虚线 path data 生成器
    const dashLineGenerator = d3.line();

    /** 创建左侧区域 */
    //  面积
    if (buy_list?.length) {
      const area_path_data_left = areaGenerator(buy_list_new as any);
      d3.select('.areaLeft')
        .append('path')
        .attr('opacity', '0.3')
        .attr('d', area_path_data_left)
        .attr('fill', 'url(#paint0_linear_7545_2924)');

      // 渐变色
      const max_y = buy_list_new[buy_list_new.length - 1];
      const y = +Big(
        scaleRight(
          +(max_y.accumulated_x_readable || max_y.accumulated_y_readable)
        )
      ).toNumber();
      d3.select('.greenLinearGradient')
        .attr('y1', y)
        .attr('y2', svg_height - svg_padding * 2);

      // 折线
      var line_path_data_left = lineGenerator(buy_list_new as any);
      d3.select('.areaLeft')
        .append('path')
        .attr('d', line_path_data_left)
        .attr('stroke', '#00FFD1')
        .attr('strokeWidth', '2')
        .attr('fill', 'none');

      // 触发鼠标事件的矩形区域
      const buy_list_first = buy_list_new[0];
      const buy_list_last = buy_list_new[buy_list_new.length - 1];
      d3.select('.rectLeft')
        .append('rect')
        .attr('width', () => {
          return (
            scaleBottom(+buy_list_first.price) -
            scaleBottom(+buy_list_last.price) +
            svg_padding
          );
        })
        .attr('height', () => {
          return svg_height;
        })
        .attr('x', () => {
          return scaleBottom(+buy_list_last.price) - svg_padding;
        })
        .attr('y', `${-svg_padding}`)
        .attr('fill', 'transparent')
        .on('mousemove', function (e) {
          const { offsetX, offsetY } = e;
          const list = buy_list.concat([]).reverse();
          const [targetX, targetY, targetItem] = searchNearCoordinate(
            list,
            e,
            scaleBottom,
            scaleRight
          );
          if (!isInvalid(targetX) && !isInvalid(targetY)) {
            showCrossDot({
              dashLineGenerator,
              targetX,
              targetY,
              offsetX,
              offsetY,
              dotFillColor: '#00FFD1',
            });
            setSide('buy');
            setFoucsOrderPoint(targetItem);
          }
        })
        .on('mouseleave', function (e, d) {
          hideCrossDot();
        });
    }

    /** 创建右侧区域 */
    // 面积
    if (sell_list?.length) {
      const area_path_data_right = areaGenerator(sell_list_new as any);
      d3.select('.areaRight')
        .append('path')
        .attr('opacity', '0.3')
        .attr('d', area_path_data_right)
        .attr('fill', 'url(#paint0_linear_7545_2926)');

      // 渐变色
      const max_y = sell_list_new[0];
      const y = +Big(
        scaleRight(
          +(max_y.accumulated_x_readable || max_y.accumulated_y_readable)
        )
      ).toNumber();
      d3.select('.redLinearGradient')
        .attr('y1', y)
        .attr('y2', svg_height - svg_padding * 2);

      // 折线
      const line_path_data_right = lineGenerator(sell_list_new as any);
      d3.select('.areaRight')
        .append('path')
        .attr('d', line_path_data_right)
        .attr('stroke', '#FF6A8E')
        .attr('strokeWidth', '2')
        .attr('fill', 'none');
      // 触发鼠标事件的矩形区域
      const sell_list_first = sell_list_new[0];
      const sell_list_last = sell_list_new[sell_list_new.length - 1];
      d3.select('.rectRight')
        .append('rect')
        .attr('width', () => {
          return (
            scaleBottom(+sell_list_first.price) -
            scaleBottom(+sell_list_last.price) +
            svg_padding
          );
        })
        .attr('height', () => {
          return svg_height;
        })
        .attr('x', () => {
          return scaleBottom(+sell_list_last.price);
        })
        .attr('y', `${-svg_padding}`)
        .attr('fill', 'transparent')
        .on('mousemove', function (e) {
          const { offsetX, offsetY } = e;
          const list = sell_list.concat([]).reverse();
          const [targetX, targetY, targetItem] = searchNearCoordinate(
            list,
            e,
            scaleBottom,
            scaleRight
          );
          if (!isInvalid(targetX) && !isInvalid(targetY)) {
            showCrossDot({
              dashLineGenerator,
              targetX,
              targetY,
              offsetX,
              offsetY,
              dotFillColor: '#FF6A8E',
            });
            setSide('sell');
            setFoucsOrderPoint(targetItem);
          }
        })
        .on('mouseleave', function (e, d) {
          hideCrossDot();
        });
    }
  }
  function gte_price_range_by_zoom() {
    // 获取价格区间
    let min_price: any;
    let max_price: any;
    if (buy_list.length == 0) {
      min_price = Big(sell_list[sell_list.length - 1].price || 0)
        .mul(0.9)
        .toFixed();
    } else if (buy_list.length == 1) {
      min_price = Big(buy_list[0].price).mul(0.9).toFixed();
    } else {
      min_price = Big(buy_list[buy_list.length - 1].price)
        .mul(0.9)
        .toFixed();
    }
    if (sell_list.length == 0) {
      max_price = Big(buy_list[0].price || 0)
        .mul(1.1)
        .toFixed();
    } else if (sell_list.length == 1) {
      max_price = Big(sell_list[0].price).mul(1.1).toFixed();
    } else {
      max_price = Big(sell_list[0].price).mul(1.1).toFixed();
    }
    let new_min_price: any;
    let new_max_price: any;
    const each_step_range = Big(max_price)
      .minus(min_price)
      .div(GEARS[0] * 2);
    const total_step_range = each_step_range.mul(GEARS[0] - zoom);
    new_min_price = Big(min_price).plus(total_step_range).toFixed();
    new_max_price = Big(max_price).minus(total_step_range).toFixed();
    return [new_min_price, new_max_price];
  }
  function get_data_for_drawing() {
    // 获取价格区间
    const [min_price, max_price] = gte_price_range_by_zoom();
    // 获取 数量区间
    const amounts: string[] = [];
    buy_list.concat(sell_list).forEach((item: IOrderPointItem) => {
      amounts.push(
        Big(item.accumulated_x_readable || item.accumulated_y_readable).toFixed(
          0
        )
      );
    });
    amounts.sort((b, a) => {
      return Big(b).minus(a).toNumber();
    });

    // 给绘制的图 添加辅助点
    const buy_list_new: IOrderPointItem[] = [];
    if (buy_list.length == 1) {
      const ele = buy_list[0];
      buy_list_new.push(
        {
          price: ele.price,
          accumulated_x_readable: '0',
          accumulated_y_readable: '0',
        },
        ele,
        {
          price: min_price,
          accumulated_x_readable: ele.accumulated_x_readable,
          accumulated_y_readable: ele.accumulated_y_readable,
        }
      );
    } else {
      buy_list.forEach((item: IOrderPointItem, index) => {
        if (index == 0) {
          buy_list_new.push({
            price: item.price,
            accumulated_x_readable: '0',
            accumulated_y_readable: '0',
          });
        }
        buy_list_new.push(item);
        const nextItem = buy_list[index + 1];
        if (index < buy_list.length - 1) {
          buy_list_new.push({
            price: nextItem.price,
            accumulated_x_readable: item.accumulated_x_readable,
            accumulated_y_readable: item.accumulated_y_readable,
          });
        }
        if (index == buy_list.length - 1) {
          buy_list_new.push({
            price: min_price,
            accumulated_x_readable: item.accumulated_x_readable,
            accumulated_y_readable: item.accumulated_y_readable,
          });
        }
      });
    }
    const sell_list_new: IOrderPointItem[] = [];
    if (sell_list.length == 1) {
      const ele = sell_list[0];
      sell_list_new.push(
        {
          price: max_price,
          accumulated_x_readable: ele.accumulated_x_readable,
          accumulated_y_readable: ele.accumulated_y_readable,
        },
        ele,
        {
          price: ele.price,
          accumulated_x_readable: '0',
          accumulated_y_readable: '0',
        }
      );
    } else {
      sell_list.forEach((item: IOrderPointItem, index) => {
        if (index == 0) {
          sell_list_new.push({
            price: max_price,
            accumulated_x_readable: item.accumulated_x_readable,
            accumulated_y_readable: item.accumulated_y_readable,
          });
        }
        if (index < sell_list.length - 1) {
          const nextItem = sell_list[index + 1];
          sell_list_new.push(item, {
            price: item.price,
            accumulated_x_readable: nextItem.accumulated_x_readable,
            accumulated_y_readable: nextItem.accumulated_y_readable,
          });
        }
        if (index == sell_list.length - 1) {
          sell_list_new.push(item, {
            price: item.price,
            accumulated_x_readable: '0',
            accumulated_y_readable: '0',
          });
        }
      });
    }
    const price_range: number[] = [+min_price, +max_price];
    const amount_range: number[] = [+amounts[amounts.length - 1], 0];
    return {
      price_range,
      amount_range,
      buy_list_new,
      sell_list_new,
    };
  }
  function clearChart() {
    d3.selectAll('.axisBottom *').remove();
    d3.selectAll('.axisRight *').remove();
    d3.selectAll('.areaLeft *').remove();
    d3.selectAll('.areaRight *').remove();
    d3.selectAll('.rectLeft *').remove();
    d3.selectAll('.rectRight *').remove();
    d3.select('.verticalDashLine').attr('d', '');
    d3.select('.horizontalDashLine').attr('d', '');
  }
  // 找到离这个点最近的一个数据 中文
  function searchNearCoordinate(
    list: IOrderPointItem[],
    e: any,
    scaleBottom: Function,
    scaleRight: Function
  ) {
    const { offsetX } = e;
    const x = offsetX - svg_padding;
    let targetX;
    let targetY;
    let targetItem;
    let gtIndex = list.findIndex((item: IOrderPointItem) => {
      return scaleBottom(+item.price) >= x;
    });
    if (gtIndex == -1) {
      gtIndex = list.length - 1;
    }
    const gtItem = list[gtIndex];
    const x1 = scaleBottom(+gtItem.price);
    if (gtIndex == 0) {
      targetY = scaleRight(
        +(gtItem.accumulated_x_readable || gtItem.accumulated_y_readable)
      );
      targetX = x1;
      targetItem = gtItem;
    } else {
      const ltIndex = gtIndex - 1;
      const ltItem = list[ltIndex];
      const x0 = scaleBottom(+ltItem.price);
      if (x1 - x > x - x0) {
        targetX = x0;
        targetY = scaleRight(
          +(ltItem.accumulated_x_readable || ltItem.accumulated_y_readable)
        );
        targetItem = ltItem;
      } else {
        targetX = x1;
        targetY = scaleRight(
          +(gtItem.accumulated_x_readable || gtItem.accumulated_y_readable)
        );
        targetItem = gtItem;
      }
    }
    return [targetX, targetY, targetItem];
  }
  function showCrossDot({
    dashLineGenerator,
    targetX,
    targetY,
    offsetX,
    offsetY,
    dotFillColor,
  }: {
    dashLineGenerator: Function;
    targetX: number;
    targetY: number;
    offsetX: number;
    offsetY: number;
    dotFillColor: string;
  }) {
    const pathDataX = dashLineGenerator([
      [targetX, -40],
      [targetX, 360],
    ]);
    const pathDataY = dashLineGenerator([
      [0, targetY],
      [520, targetY],
    ]);
    d3.select('.verticalDashLine').attr('d', pathDataX).attr('opacity', '1');
    d3.select('.horizontalDashLine').attr('d', pathDataY).attr('opacity', '1');
    d3.select('.dot')
      .attr('cx', targetX)
      .attr('cy', targetY)
      .attr('opacity', '1')
      .attr('fill', dotFillColor);
    d3.select('.hoverBox').attr(
      'style',
      `visibility:visible;transform:translate(${
        offsetX + disFromHoverBoxToPointer
      }px, ${offsetY - disFromHoverBoxToPointer}px)`
    );
  }
  function hideCrossDot() {
    d3.select('.verticalDashLine').attr('opacity', '0');
    d3.select('.horizontalDashLine').attr('opacity', '0');
    d3.select('.dot').attr('opacity', '0');
    d3.select('.hoverBox').attr('style', `visibility:invisible`);
  }
  return (
    <div className="relative" style={{ width: `${svg_width}px` }}>
      <svg width={`${svg_width}`} height={`${svg_height}`}>
        <g transform={`translate(${svg_padding}, ${svg_padding})`}>
          {/* 横坐标 */}
          <g className="axisBottom"></g>
          {/* 纵坐标 */}
          <g className="axisRight"></g>
          {/* 左侧面积图 */}
          <g className="areaLeft"></g>
          {/* 右侧面积图 */}
          <g className="areaRight"></g>
          {/* 左侧触发鼠标事件区域 */}
          <g className="rectLeft"></g>
          {/* 右侧触发鼠标事件区域 */}
          <g className="rectRight"></g>
          {/* 垂直 虚线 */}
          <path
            className="verticalDashLine"
            fill="none"
            stroke="#999"
            stroke-dasharray="2,2"
          ></path>
          {/* 水平 虚线 */}
          <path
            className="horizontalDashLine"
            fill="none"
            stroke="#999"
            stroke-dasharray="2,2"
          ></path>
          {/* 折线上的点 */}
          <circle
            className="dot"
            r="5"
            stroke="#0D1A23"
            stroke-width="2"
            opacity="0"
          />
        </g>
        {/* 渐变色绿色 */}
        <defs>
          <linearGradient
            className="greenLinearGradient"
            id="paint0_linear_7545_2924"
            x1="0"
            x2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#00D6AF" />
            <stop offset="1" stop-color="#00D6AF" stop-opacity="0" />
          </linearGradient>
        </defs>
        {/* 渐变色红色 */}
        <defs>
          <linearGradient
            className="redLinearGradient"
            id="paint0_linear_7545_2926"
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
          >
            <stop stop-color="#FF6A8E" />
            <stop offset="1" stop-color="#FF6A8E" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {/* hover上去的悬浮框 */}
      <div className="hoverBox absolute px-2 py-3 invisible left-0 top-0 bg-toolTipBoxBgColor border border-toolTipBoxBorderColor rounded-md">
        <div className="flex items-center justify-between gap-5 mb-3">
          <span className="text-xs text-primaryText">Side</span>
          <span
            className={`text-sm capitalize ${
              side == 'buy' ? 'text-senderHot' : 'text-sellColorNew'
            }`}
          >
            {side}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5 mb-3">
          <span className="text-xs text-primaryText">Price({cur_pairs})</span>
          <span className="text-sm text-white">
            {formatPrice(foucsOrderPoint?.price)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5 mb-3">
          <span className="text-xs text-primaryText">
            Qty({cur_token_symbol})
          </span>
          <span className="text-sm text-white">
            {formatNumber(
              foucsOrderPoint?.amount_x_readable ||
                foucsOrderPoint?.amount_y_readable
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <span className="text-xs text-primaryText whitespace-nowrap">
            Total Qty({cur_token_symbol})
          </span>
          <span className="text-sm text-white">
            {formatNumber(
              foucsOrderPoint?.accumulated_x_readable ||
                foucsOrderPoint?.accumulated_y_readable
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
function RefreshIcon(props: any) {
  return (
    <svg
      {...props}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_7575_3623)">
        <path
          d="M11.1321 1.71424V4.71221C11.1321 4.96979 10.9682 5.13372 10.7106 5.13372H7.71264C7.54871 5.13372 7.40815 5.04007 7.31452 4.87614C7.24423 4.71221 7.26763 4.54828 7.40816 4.40774L8.34498 3.49432C7.68926 2.88525 6.91625 2.58077 6.00283 2.58077C5.55782 2.58077 5.1128 2.67455 4.66778 2.83848C4.22276 3.02579 3.87152 3.2835 3.59043 3.58797C3.28596 3.86906 3.02825 4.2203 2.84094 4.66532C2.48958 5.53197 2.48958 6.46878 2.84094 7.33543C3.02825 7.78046 3.28596 8.13169 3.59043 8.41278C3.87152 8.71727 4.22276 8.97497 4.66778 9.16227C5.1128 9.3262 5.55782 9.41998 6.00283 9.41998C6.54151 9.41998 7.0334 9.30282 7.50182 9.06863C7.99372 8.85781 8.39187 8.52995 8.69632 8.08492C8.78998 8.03803 8.83687 8.01466 8.86025 8.01466C8.93053 8.01466 8.97742 8.03803 9.02417 8.08492L9.93774 8.99834C9.98448 9.04523 10.0079 9.09201 10.0079 9.1389C10.0079 9.16227 9.98449 9.20916 9.96112 9.27946C9.44582 9.88839 8.86026 10.3568 8.18106 10.6613C7.54873 10.9658 6.82261 11.1297 6.00285 11.1297C5.27674 11.1297 4.59752 10.9892 4.01196 10.7316C3.33272 10.4271 2.77067 10.0523 2.37254 9.63067C1.9509 9.23256 1.57616 8.67049 1.27168 7.99125C0.733007 6.79676 0.733007 5.204 1.27168 4.00949C1.57616 3.33027 1.9509 2.76821 2.37254 2.37008C2.77067 1.94844 3.33272 1.5737 4.01194 1.26922C4.59751 1.01152 5.27673 0.871094 6.00283 0.871094C6.65866 0.871094 7.291 0.988134 7.89994 1.22234C8.53239 1.48004 9.09446 1.83128 9.53948 2.2763L10.4061 1.40977C10.5232 1.29261 10.6872 1.24584 10.8745 1.31599C11.0385 1.40977 11.1321 1.55031 11.1321 1.71424Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_7575_3623">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
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

const formatNumber = (v: string | number) => {
  if (isInvalid(v)) return '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.01)) {
    return '<0.01';
  } else {
    return toInternationalCurrencySystem(big.toFixed(2, 1));
  }
};
const formatPrice = (v: string | number) => {
  if (isInvalid(v)) return '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.01)) {
    return '<0.0001';
  } else {
    return big.toFixed(4, 1);
  }
};
const isInvalid = function (v: any) {
  if (v === '' || v === undefined || v === null) return true;
  return false;
};

interface IOrderPoint {
  [point: string]: IOrderPointItem;
}
interface IOrderPointItem {
  point?: number;
  amount_x?: string;
  amount_y?: string;
  price?: string;
  amount_x_readable?: string;
  amount_y_readable?: string;
  accumulated_x_readable?: string;
  accumulated_y_readable?: string;
}

type ISwitchToken = 'X' | 'Y';
type ISide = 'buy' | 'sell';
