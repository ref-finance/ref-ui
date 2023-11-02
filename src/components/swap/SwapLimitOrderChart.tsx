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
  formatWithCommas,
} from '../../utils/numbers';
import { toRealSymbol } from '../../utils/token';
import { SwapProContext } from '../../pages/SwapPage';
import Big from 'big.js';
import * as d3 from 'd3';
import { isMobile } from '../../utils/device';
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
  const [fetch_data_done, set_fetch_data_done] = useState(false);
  const [buy_list, set_buy_list] = useState<IOrderPointItem[]>();
  const [sell_list, set_sell_list] = useState<IOrderPointItem[]>();
  const [market_loading, set_market_loading] = useState<boolean>(false);
  const [pair_is_reverse, set_pair_is_reverse] = useState<boolean>(false);
  const [show_view_all, set_show_view_all] = useState<boolean>(false);
  const { dcl_pool_id } = useContext(SwapProContext);
  const GEARS = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const [zoom, setZoom] = useState<number>(GEARS[0]);
  const pool_id = dcl_pool_id;
  const left_point = -800000;
  const right_point = 800000;
  const sellBoxRef = useRef(null);
  const is_mobile = isMobile();
  useEffect(() => {
    if (pool_id) {
      set_fetch_data_done(false);
      setZoom(GEARS[0]);
      fetch_data();
    }
  }, [pool_id]);
  useEffect(() => {
    if (pool_id && market_loading) {
      refresh();
    }
  }, [market_loading]);
  useEffect(() => {
    if (pool && orders && !market_loading) {
      process_orders();
      set_fetch_data_done(true);
    }
  }, [pool, orders, market_loading]);
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
  useEffect(() => {
    if (show_view_all && is_mobile) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = 'auto';
    }
  }, [show_view_all]);
  const [cur_pairs, cur_pairs_price_mode, cur_token_symbol, cur_pair_icons] =
    useMemo(() => {
      if (pool) {
        const classStr = 'w-6 h-6 rounded-full border border-gradientFromHover';
        const { token_x_metadata, token_y_metadata } = pool;
        const x_symbol = toRealSymbol(token_x_metadata.symbol);
        const y_symbol = toRealSymbol(token_y_metadata.symbol);
        if (switch_token == 'X') {
          const y_icons = (
            <>
              <img className={classStr} src={token_x_metadata.icon}></img>
              <img
                className={`${classStr} -ml-1.5`}
                src={token_y_metadata.icon}
              ></img>
            </>
          );
          return [
            `${y_symbol}/${x_symbol}`,
            `${x_symbol}-${y_symbol}`,
            `${x_symbol}`,
            y_icons,
          ];
        } else if (switch_token == 'Y') {
          const x_icons = (
            <>
              <img className={classStr} src={token_y_metadata.icon}></img>
              <img
                className={`${classStr} -ml-1.5`}
                src={token_x_metadata.icon}
              ></img>
            </>
          );
          return [
            `${x_symbol}/${y_symbol}`,
            `${y_symbol}-${x_symbol}`,
            `${y_symbol}`,
            x_icons,
          ];
        }
      }
      return [];
    }, [switch_token, pool]);
  async function refresh() {
    await fetch_data();
    set_market_loading(false);
  }
  async function fetch_data() {
    const orders = await get_points_of_orders();
    const [switch_token, is_reverse, p] = (await get_pool_detail()) as any;
    set_switch_token(switch_token);
    set_pair_is_reverse(is_reverse);
    setPool(p);
    setOrders(orders);
  }
  async function get_points_of_orders() {
    const result = await get_pointorder_range({
      pool_id,
      left_point,
      right_point,
    });
    return result;
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
      return ['X', false, p];
    } else {
      return ['Y', true, p];
    }
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
              ? formatPriceWithCommas(current_price_x)
              : formatPriceWithCommas(current_price_y)}
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
  function get_rate_element_mobile() {
    if (pool) {
      const { current_point, token_x_metadata, token_y_metadata } = pool;
      const current_price_x = get_price_by_point(current_point);
      const current_price_y = Big(current_price_x).gt(0)
        ? Big(1).div(current_price_x).toFixed()
        : '0';
      return (
        <div className="flex items-center">
          <span className="text-2xl text-senderHot gotham_bold mx-1.5">
            {switch_token == 'X'
              ? formatPriceWithCommas(current_price_x)
              : formatPriceWithCommas(current_price_y)}
          </span>
          <span className="text-sm text-primaryText">
            {switch_token == 'X'
              ? token_y_metadata.symbol + '/' + token_x_metadata.symbol
              : token_x_metadata.symbol + '/' + token_y_metadata.symbol}
          </span>
        </div>
      );
    }
  }
  function marketRefresh() {
    set_market_loading(true);
  }
  // 缩小坐标轴区间范围
  function zoomOut() {
    if (is_empty) return;
    const targetPercent = GEARS.find((item) => item < zoom);
    if (targetPercent) {
      setZoom(targetPercent);
    }
  }
  // 放大坐标轴区间范围
  function zoomIn() {
    if (is_empty) return;
    const GEARSCOPY: number[] = JSON.parse(JSON.stringify(GEARS)).reverse();
    const targetPercent = GEARSCOPY.find((item) => item > zoom);
    if (targetPercent) {
      setZoom(targetPercent);
    }
  }
  const is_empty = fetch_data_done && !sell_list?.length && !buy_list?.length;
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
      <div className="flex items-center justify-between xsm:mt-5">
        <div className="flex items-center">
          <div className="flex items-center mr-2">{cur_pair_icons}</div>
          <span className="text-base text-white gotham_bold">
            {cur_pairs_price_mode}
          </span>
        </div>
        <SwapProTab />
      </div>
      <div className="flex items-stretch justify-between mt-4">
        {/* chart area */}
        <div className="flex-grow lg:pr-3 xsm:w-full">
          {/* base data */}
          <div className="flex items-center xsm:items-start justify-between xsm:flex-col-reverse">
            <div className="flex items-end xsm:hidden">
              {get_rate_element()}
            </div>
            <div className="flex items-end lg:hidden mt-2.5">
              {get_rate_element_mobile()}
            </div>
            <div className="flex items-center justify-between xsm:w-full">
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
                      zoom == GEARS[GEARS.length - 1] || is_empty
                        ? 'text-chartBorderColor cursor-not-allowed'
                        : 'text-v3SwapGray cursor-pointer'
                    }`}
                    onClick={zoomOut}
                  >
                    <AddIcon></AddIcon>
                  </div>
                  <div
                    className={`flex items-center justify-center w-1 h-full flex-grow ${
                      zoom == GEARS[0] || is_empty
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
              <div
                onClick={() => {
                  set_show_view_all(true);
                }}
                className="text-xs text-white px-2 py-1 border border-v3SwapGray border-opacity-20 rounded-md lg:hidden"
              >
                View All
              </div>
            </div>
          </div>
          {/* chart */}
          {is_empty ? (
            <div
              className="flex flex-col items-center justify-center gap-5"
              style={{ height: '400px' }}
            >
              <EmptyIcon></EmptyIcon>
              <span className="text-sm text-limitOrderInputColor">
                Not enough data for the chart right now.
              </span>
            </div>
          ) : (
            <OrderChart></OrderChart>
          )}
        </div>
        {/* table area */}
        <div className="lg:border-l lg:border-r lg:border-limitOrderFeeTiersBorderColor">
          {is_mobile && show_view_all && (
            <div
              className="fixed w-screen h-screen top-0 left-0"
              style={{
                zIndex: 150,
                background: 'rgba(0, 19, 32, 0.8)',
                position: 'fixed',
              }}
              onClick={() => {
                set_show_view_all(false);
              }}
            ></div>
          )}
          <div
            className={`xsm:fixed xsm:bottom-8 xsm:bg-cardBg xsm:rounded-t-xl xsm:left-0 xsm:border xsm:border-bottomBoxBorderColor xsm:pt-5 ${
              (show_view_all && is_mobile) || !is_mobile ? '' : 'hidden'
            }`}
            style={{
              width: is_mobile ? '100%' : '260px',
              zIndex: is_mobile ? '999' : '',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-white gotham_bold pl-3">
                Limit Orders
              </div>
              <div className="flex items-center lg:hidden">
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
            </div>
            <div className="flex items-center justify-between p-3 xsm:px-5 border-b border-limitOrderFeeTiersBorderColor">
              <div className="flex flex-col">
                <span className="text-sm text-primaryText">Price</span>
                <span
                  className="text-xs text-primaryText"
                  style={{ zoom: 0.85 }}
                >
                  {cur_pairs}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-primaryText">Qty</span>
                <span
                  className="text-xs text-primaryText"
                  style={{ zoom: 0.85 }}
                >
                  {cur_token_symbol}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-primaryText whitespace-nowrap">
                  Total Qty
                </span>
                <span
                  className="text-xs text-primaryText"
                  style={{ zoom: 0.85 }}
                >
                  {cur_token_symbol}
                </span>
              </div>
            </div>
            {is_empty ? (
              <div
                className="text-sm text-limitOrderInputColor flex items-center justify-center"
                style={{ marginTop: '100px' }}
              >
                No order yet
              </div>
            ) : (
              <div>
                <div
                  ref={sellBoxRef}
                  className={`font-nunito ${
                    sell_list?.length ? 'p-3 xsm:px-5' : 'p-1'
                  } pr-0 overflow-auto`}
                  style={{ maxHeight: `${limitOrderContainerHeight}px` }}
                >
                  {sell_list?.map((item: IOrderPointItem, index) => {
                    return (
                      <div
                        key={item.point + index}
                        className="grid grid-cols-3  justify-items-end text-xs py-1.5 pr-2"
                      >
                        <span className="text-sellColorNew justify-self-start">
                          {formatPriceWithCommas(item.price)}
                        </span>
                        <span className="text-white pr-3">
                          {formatNumber(
                            item.amount_x_readable || item.amount_y_readable
                          )}
                        </span>
                        <span className="text-white">
                          {formatNumber(
                            item.accumulated_x_readable ||
                              item.accumulated_y_readable
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center mt-2.5 pl-3 xsm:pl-5 font-nunito">
                  <div className="flex items-center xsm:hidden">
                    <span className="text-xs text-white mr-2">
                      Market Pirce
                    </span>
                    <RefreshIcon
                      className={`cursor-pointer ${
                        market_loading ? 'refresh-loader' : ''
                      }`}
                      onClick={marketRefresh}
                    ></RefreshIcon>
                  </div>
                  <span
                    className="lg:hidden text-sm text-white underline"
                    onClick={marketRefresh}
                  >
                    Refresh Market Price
                  </span>
                </div>
                <div
                  className={`font-nunito ${
                    buy_list?.length ? 'p-3 xsm:px-5' : 'p-1'
                  } pr-0 overflow-auto`}
                  style={{ maxHeight: `${limitOrderContainerHeight}px` }}
                >
                  {buy_list?.map((item: IOrderPointItem, index) => {
                    return (
                      <div
                        key={item.point + index}
                        className="grid grid-cols-3 justify-items-end text-xs py-1.5 pr-2"
                      >
                        <span className="text-gradientFromHover justify-self-start">
                          {formatPriceWithCommas(item.price)}
                        </span>
                        <span className="text-white pr-3">
                          {formatNumber(
                            item.amount_x_readable || item.amount_y_readable
                          )}
                        </span>
                        <span className="text-white">
                          {formatNumber(
                            item.accumulated_x_readable ||
                              item.accumulated_y_readable
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
  const svg_width = isMobile() ? 360 : 600;
  const svg_height = 400;
  const svg_padding = 40;
  const axisRightWidth = 60;
  const disFromHoverBoxToPointer = 20;
  const is_mobile = isMobile();
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
    let translate_x = offsetX + disFromHoverBoxToPointer;
    let translate_y = is_mobile
      ? offsetY + disFromHoverBoxToPointer
      : offsetY - disFromHoverBoxToPointer;
    if (offsetX > 380) {
      translate_x = offsetX - 235;
    }
    if (is_mobile) {
      translate_x = Math.min(140, translate_x);
    }
    d3.select('.hoverBox').attr(
      'style',
      `visibility:visible;transform:translate(${translate_x}px, ${translate_y}px)`
    );
  }
  function hideCrossDot() {
    d3.select('.verticalDashLine').attr('opacity', '0');
    d3.select('.horizontalDashLine').attr('opacity', '0');
    d3.select('.dot').attr('opacity', '0');
    d3.select('.hoverBox').attr('style', `visibility:invisible`);
  }
  return (
    <div
      className="relative xsm:flex xsm:flex-col xsm:w-full xsm:items-center"
      style={{ width: is_mobile ? 'auto' : `${svg_width}px` }}
    >
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
      {/* lg:invisible xsm:hidden */}
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
            {formatPriceWithCommas(foucsOrderPoint?.price)}
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
function EmptyIcon(props: any) {
  return (
    <svg
      {...props}
      width="37"
      height="35"
      viewBox="0 0 37 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28.3876 4.56658C28.1438 4.62244 27.8849 4.55643 27.702 4.38377C27.5649 4.25682 27.4888 4.08416 27.4888 3.89627C27.4888 3.71346 27.5649 3.53572 27.702 3.40877L29.5911 1.51463C29.7181 1.37752 29.8907 1.30135 30.0786 1.30135C30.2665 1.30135 30.4392 1.37752 30.5661 1.51463C30.7032 1.64158 30.7794 1.81424 30.7794 2.00213C30.7794 2.18494 30.7032 2.36267 30.5661 2.48963L28.677 4.38377C28.5603 4.50057 28.5044 4.55642 28.3876 4.55642V4.56658ZM32.6228 8.98455C32.5364 9.03025 32.4349 9.05057 32.3333 9.04549L29.9313 8.76111C29.5505 8.73064 29.2712 8.39549 29.3017 8.01463C29.3321 7.63377 29.6673 7.35447 30.0481 7.38494L32.4501 7.61346C32.831 7.649 33.1103 7.97908 33.0798 8.35994C33.0798 8.64432 32.897 8.89822 32.6228 8.98455ZM24.32 3.65252C24.1474 3.71346 23.9544 3.69314 23.7919 3.60682C23.6294 3.52049 23.5126 3.36814 23.4618 3.19549L22.6595 0.900176C22.5376 0.554863 22.7153 0.168925 23.0606 0.0368943C23.2333 -0.0240432 23.4263 -0.0088091 23.5888 0.077519C23.7513 0.163847 23.8731 0.311113 23.9239 0.488847L24.7263 2.78416C24.7974 2.95174 24.7974 3.13963 24.7212 3.30213C24.645 3.46971 24.4977 3.59158 24.32 3.65252Z"
        fill="#566069"
      />
      <path
        d="M3.01234 14.4879C3.35765 14.366 3.6014 14.0511 3.63695 13.6855C2.97679 11.6187 2.31664 9.54685 1.6514 7.48005C1.52953 7.09411 1.06742 6.89606 0.620544 7.03825C0.173669 7.18044 -0.0954714 7.607 0.0314817 7.99294C0.691638 10.08 1.35179 12.1672 2.01703 14.2593C2.27601 14.5234 2.66703 14.6148 3.01234 14.4879ZM8.28851 30.7633C8.63383 30.6414 8.87758 30.3265 8.91312 29.9609C8.25297 27.8941 7.59281 25.8222 6.92758 23.7554C6.8057 23.3695 6.34359 23.1715 5.89672 23.3136C5.44984 23.4558 5.1807 23.8824 5.30765 24.2683C5.96781 26.3554 6.62797 28.4426 7.2932 30.5347C7.54711 30.8039 7.93812 30.8902 8.28851 30.7633ZM9.71039 34.7648C10.0557 34.6429 10.2995 34.3281 10.335 33.9625C9.67484 31.8957 10.3198 33.932 9.65961 31.8652C9.53773 31.4793 9.07562 31.2812 8.62875 31.4234C8.18187 31.5656 7.91273 31.9922 8.03969 32.3781C8.69984 34.4652 8.05492 32.4492 8.71508 34.5363C8.97406 34.8054 9.36508 34.8918 9.71039 34.7648ZM9.33969 34.8765C11.4319 34.2316 9.4057 34.8461 11.4979 34.2011C11.8838 34.0844 12.087 33.6172 11.9498 33.1703C11.8127 32.7234 11.3862 32.4543 11.0002 32.5711C8.92328 33.2058 10.9698 32.5761 8.89281 33.216C8.61351 33.4547 8.49672 33.8304 8.58812 34.1859C8.67953 34.5414 8.97406 34.8105 9.33969 34.8765ZM5.62758 22.6383C5.97289 22.5164 6.21664 22.2015 6.25218 21.8359C5.59203 19.7691 4.93187 17.6972 4.26664 15.6304C4.14476 15.2445 3.68265 15.0465 3.23578 15.1886C2.7889 15.3308 2.51976 15.7574 2.64672 16.1433C3.30687 18.2304 3.96703 20.3176 4.63226 22.4097C4.89125 22.6738 5.28226 22.7601 5.62758 22.6383ZM29.9772 27.6961C32.044 26.9699 34.1108 26.2488 36.1776 25.5226C36.5635 25.3906 36.7412 24.9183 36.5889 24.4765C36.4366 24.0347 35.9998 23.7808 35.619 23.9129C33.5674 24.6238 31.5159 25.3398 29.4643 26.0508C29.1952 26.2996 29.0936 26.6804 29.2002 27.0308C29.3069 27.3863 29.6116 27.6453 29.9772 27.6961ZM13.7424 33.3429C15.8092 32.6168 17.876 31.8957 19.9428 31.1695C20.3288 31.0375 20.5065 30.5652 20.3541 30.1234C20.2018 29.6816 19.7651 29.4277 19.3842 29.5597C17.3327 30.2707 15.2811 30.9867 13.2295 31.6976C12.9604 31.9465 12.8588 32.3273 12.9655 32.6777C13.0721 33.0281 13.3768 33.2922 13.7424 33.3429ZM21.842 30.5855C23.9088 29.8593 25.9756 29.1383 28.0424 28.4121C28.4284 28.2801 28.6061 27.8078 28.4537 27.366C28.3014 26.9242 27.8647 26.6703 27.4838 26.8023C25.4323 27.5133 23.3807 28.2293 21.3291 28.9402C21.06 29.189 20.9584 29.5699 21.0651 29.9203C21.1666 30.2758 21.4713 30.5347 21.842 30.5855ZM13.0772 23.8722L15.2506 19.6625L20.1459 22.1914C20.3491 22.298 20.5827 22.3183 20.801 22.2472L20.8213 22.2422C21.0448 22.166 21.2276 21.9984 21.3241 21.7851L26.5342 10.2832C26.7323 9.85153 26.5393 9.33864 26.1077 9.14567C25.676 8.9527 25.1631 9.1406 24.9702 9.57224L20.1307 20.2465L15.276 17.7429C14.8545 17.5246 14.3366 17.6922 14.1182 18.1136L11.5487 23.0851C11.3303 23.5066 11.4979 24.0246 11.9194 24.2429C12.3409 24.4562 12.8588 24.2937 13.0772 23.8722Z"
        fill="#566069"
      />
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
export const formatPriceWithCommas = (v: string | number) => {
  if (isInvalid(v)) return '-';
  const big = Big(v);
  if (big.eq(0)) {
    return '0';
  } else if (big.lt(0.0001)) {
    return '<0.0001';
  } else {
    const p = big.toFixed(4, 0);
    const [whole, decimal] = p.split('.');
    return `${formatWithCommas(whole)}${decimal ? '.' + decimal : ''}`;
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
