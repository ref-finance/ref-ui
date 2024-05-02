import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { LiquidityProviderData } from '../../AddYourLiquidityPageV3';
import { RADIUS_DEFAULT_NUMBER } from '../../../../components/d3Chart/config';
import { isInvalid } from '../../../../components/d3Chart/utils';
import {
  getPriceByPoint,
  getPointByPrice,
  POINTLEFTRANGE,
  POINTRIGHTRANGE,
  getBinPointByPrice,
  getBinPointByPoint,
  reverse_price,
  getSlotPointByPoint,
} from '../../../../services/commonV3';
import BigNumber from 'bignumber.js';
import { toPrecision } from 'src/utils/numbers';
import { isMobile } from '../../../../utils/device';
import { FormattedMessage } from 'react-intl';
import DclChart from '../../../../components/d3Chart/DclChart';
import { PointInputComponent } from './PointInputComponent';
import { IntegerInputComponent } from './IntegerInputComponent';

export function PointsComponent() {
  const {
    binNumber,
    setBinNumber,
    currentSelectedPool,
    tokenX,
    tokenY,
    set_token_amount_tip,

    pointChange,
    liquidityShape,

    SLOT_NUMBER,
    BIN_WIDTH,

    switch_pool_loading,

    isSignedIn,
    pair_is_reverse,

    onlyAddXToken,
    onlyAddYToken,
    invalidRange,
    currentPoint,
    show_chart,
  } = useContext(LiquidityProviderData);
  const [priceRangeMode, setPriceRangeMode] = useState<
    'by_range' | 'by_radius'
  >('by_range');
  const [radius, setRadius] = useState<number>();
  const [targetCustomPrice, setTargetCustomPrice] = useState('');
  const [leftCustomPrice, setLeftCustomPrice] = useState('');
  const [rightCustomPrice, setRightCustomPrice] = useState('');
  const [targetPoint, setTargetPoint] = useState<number>();

  const [leftInputStatus, setLeftInputStatus] = useState(false);
  const [rightInputStatus, setRightInputStatus] = useState(false);
  const [targetInputStatus, setTargetInputStatus] = useState(false);

  const [leftPoint, setLeftPoint] = useState<number>();
  const [rightPoint, setRightPoint] = useState<number>();

  const [chartTab, setChartTab] = useState<'liquidity' | 'yours'>('liquidity');

  const token_x_decimals = tokenX.decimals;
  const token_y_decimals = tokenY.decimals;

  // init
  useEffect(() => {
    if (currentSelectedPool?.pool_id && !switch_pool_loading) {
      const { current_point } = currentSelectedPool;
      let left_point, right_point;
      const targetPoint = get_slot_point_by_point(current_point);
      if (pair_is_reverse) {
        left_point = get_bin_point_by_point(
          targetPoint + BIN_WIDTH * RADIUS_DEFAULT_NUMBER
        );
        right_point = left_point - BIN_WIDTH * RADIUS_DEFAULT_NUMBER * 2;
      } else {
        right_point = get_bin_point_by_point(
          targetPoint + BIN_WIDTH * RADIUS_DEFAULT_NUMBER
        );
        left_point = right_point - BIN_WIDTH * RADIUS_DEFAULT_NUMBER * 2;
      }
      setTargetPoint(targetPoint);
      setRadius(RADIUS_DEFAULT_NUMBER);
      setLeftPoint(left_point);
      setRightPoint(right_point);
      setPriceRangeMode('by_range');
      setChartTab('liquidity');
    }
  }, [currentSelectedPool, switch_pool_loading]);

  useEffect(() => {
    if (!isInvalid(leftPoint) && !isInvalid(rightPoint)) {
      // effect bin
      let diff;
      if (pair_is_reverse) {
        diff = leftPoint - rightPoint;
      } else {
        diff = rightPoint - leftPoint;
      }
      const bin_number_temp = diff / BIN_WIDTH;
      setBinNumber(bin_number_temp);
      // effect right area
      if (pair_is_reverse) {
        pointChange({ leftPoint: rightPoint, rightPoint: leftPoint });
      } else {
        pointChange({ leftPoint, rightPoint });
      }
    }
  }, [leftPoint, rightPoint, BIN_WIDTH]);

  useEffect(() => {
    if (
      liquidityShape == 'Spot' &&
      !isInvalid(leftPoint) &&
      !isInvalid(rightPoint)
    ) {
      if (pair_is_reverse) {
        pointChange({ leftPoint: rightPoint, rightPoint: leftPoint });
      } else {
        pointChange({ leftPoint, rightPoint });
      }
    }
  }, [liquidityShape]);

  // clean tip
  useEffect(() => {
    if (!isInvalid(leftPoint) && !isInvalid(rightPoint)) {
      set_token_amount_tip(null);
    }
  }, [liquidityShape, leftPoint, rightPoint]);

  // to change bin --> to get proper right point --->for proper bin
  function changeBin(bin: number) {
    let appropriate_right_point, appropriate_bin_number;
    if (pair_is_reverse) {
      appropriate_right_point = leftPoint - BIN_WIDTH * bin;
      if (appropriate_right_point < POINTLEFTRANGE) {
        appropriate_right_point = POINTLEFTRANGE;
      }
      appropriate_bin_number =
        (leftPoint - appropriate_right_point) / BIN_WIDTH;
    } else {
      appropriate_right_point = leftPoint + BIN_WIDTH * bin;
      if (appropriate_right_point > POINTRIGHTRANGE) {
        appropriate_right_point = POINTRIGHTRANGE;
      }
      appropriate_bin_number =
        (appropriate_right_point - leftPoint) / BIN_WIDTH;
    }
    setRightPoint(appropriate_right_point);
    setBinNumber(appropriate_bin_number);
  }

  // to change radius-->to get proper left point and right point --->for proper radius
  function changeRadius(radius: number) {
    let appropriate_left_point, appropriate_right_point, appropriate_radius;
    if (pair_is_reverse) {
      appropriate_left_point = get_bin_point_by_point(
        targetPoint + BIN_WIDTH * radius
      );
      appropriate_right_point = get_bin_point_by_point(
        appropriate_left_point - BIN_WIDTH * radius * 2
      );
      appropriate_radius =
        (appropriate_left_point - appropriate_right_point) / (BIN_WIDTH * 2);
    } else {
      appropriate_right_point = get_bin_point_by_point(
        targetPoint + BIN_WIDTH * radius
      );
      appropriate_left_point = get_bin_point_by_point(
        appropriate_right_point - BIN_WIDTH * radius * 2
      );
      appropriate_radius =
        (appropriate_right_point - appropriate_left_point) / (BIN_WIDTH * 2);
    }

    setLeftPoint(appropriate_left_point);
    setRightPoint(appropriate_right_point);
    setRadius(appropriate_radius);
  }
  // to change targetPrice-->o get proper left point and right point--->for proper targetPrice
  function handleTargetPriceToAppropriatePoint(price: string) {
    let appropriate_left_point,
      appropriate_right_point,
      appropriate_target_point;
    if (pair_is_reverse) {
      appropriate_target_point = get_point_by_price(reverse_price(price));
      appropriate_left_point = get_bin_point_by_point(
        appropriate_target_point + BIN_WIDTH * radius
      );
      appropriate_right_point = get_bin_point_by_point(
        appropriate_left_point - BIN_WIDTH * radius * 2
      );
      // appropriate_target_point = appropriate_left_point - BIN_WIDTH * radius;
    } else {
      appropriate_target_point = get_point_by_price(price);
      appropriate_right_point = get_bin_point_by_point(
        appropriate_target_point + BIN_WIDTH * radius
      );
      appropriate_left_point = get_bin_point_by_point(
        appropriate_right_point - BIN_WIDTH * radius * 2
      );
      // appropriate_target_point = appropriate_right_point - BIN_WIDTH * radius;
    }
    setLeftPoint(appropriate_left_point);
    setRightPoint(appropriate_right_point);
    return appropriate_target_point;
  }
  function getLeftPrice() {
    if (
      currentSelectedPool &&
      currentSelectedPool.pool_id &&
      !isInvalid(leftPoint)
    ) {
      let price;
      if (pair_is_reverse) {
        price = reverse_price(get_price_by_point(leftPoint));
      } else {
        price = get_price_by_point(leftPoint);
      }
      if (new BigNumber(price).isLessThan('0.00000001')) {
        return price;
      } else {
        return toPrecision(price.toString(), 8);
      }
    } else {
      return '';
    }
  }
  function getRightPrice() {
    if (
      currentSelectedPool &&
      currentSelectedPool.pool_id &&
      !isInvalid(rightPoint)
    ) {
      let price;
      if (pair_is_reverse) {
        price = reverse_price(get_price_by_point(rightPoint));
      } else {
        price = get_price_by_point(rightPoint);
      }
      if (new BigNumber(price).isLessThan('0.00000001')) {
        return price;
      } else {
        return toPrecision(price.toString(), 8);
      }
    } else {
      return '';
    }
  }
  function getTargetPrice() {
    if (
      currentSelectedPool &&
      currentSelectedPool.pool_id &&
      !isInvalid(targetPoint)
    ) {
      let price;
      if (pair_is_reverse) {
        price = reverse_price(get_price_by_point(targetPoint));
      } else {
        price = get_price_by_point(targetPoint);
      }

      if (new BigNumber(price).isLessThan('0.00000001')) {
        return price;
      } else {
        return toPrecision(price.toString(), 8);
      }
    } else {
      return '';
    }
  }
  function get_point_by_price(price: string) {
    const { point_delta } = currentSelectedPool;
    const decimalRate_point =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    const point = getPointByPrice(point_delta, price, decimalRate_point);
    return point;
  }
  function get_price_by_point(point: number) {
    const decimalRate_price =
      Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
    return getPriceByPoint(point, decimalRate_price);
  }
  function get_bin_point_by_price(price: string) {
    const { point_delta } = currentSelectedPool;
    const decimalRate =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    const appropriate_point = getBinPointByPrice(
      point_delta,
      price,
      decimalRate,
      SLOT_NUMBER
    );
    return appropriate_point;
  }
  function get_bin_point_by_point(point: number) {
    const { point_delta } = currentSelectedPool;
    return getBinPointByPoint(point_delta, SLOT_NUMBER, point);
  }
  function get_slot_point_by_point(point: number) {
    const { point_delta } = currentSelectedPool;
    return getSlotPointByPoint(point_delta, point);
  }
  function getPair() {
    if (pair_is_reverse) {
      return `(${tokenX.symbol}/${tokenY.symbol})`;
    } else {
      return `(${tokenY.symbol}/${tokenX.symbol})`;
    }
  }
  const is_mobile = isMobile();

  return (
    <div className={`w-full xs:w-full md:w-full flex flex-col self-stretch`}>
      {/* chart area */}
      <div
        className={`xsm:bg-mobileOrderListBg xsm:py-2.5 xsm:px-4  ${
          show_chart ? '' : 'hidden'
        }`}
      >
        <div
          className="flex justify-center relative mb-5 mt-24 pt-4"
          style={{ height: is_mobile ? 'auto' : '270px' }}
        >
          <div className="absolute left-0 -top-24 inline-flex items-center justify-between bg-detailCardBg rounded-lg border border-dclTabBorderColor p-0.5">
            <span
              onClick={() => {
                setChartTab('liquidity');
              }}
              className={`w-20 frcc text-xs gotham_bold px-3 py-1.5 rounded-md cursor-pointer ${
                chartTab == 'liquidity'
                  ? 'text-black bg-gradientFromHover'
                  : 'text-primaryText'
              }`}
            >
              Liquidity
            </span>
            <span
              className={`w-20 frcc ${
                isSignedIn ? 'cursor-pointer' : 'cursor-not-allowed'
              } text-xs gotham_bold px-3 py-1.5 rounded-md ${
                chartTab == 'yours'
                  ? 'text-black bg-gradientFromHover'
                  : 'text-primaryText'
              }`}
              onClick={() => {
                if (isSignedIn) {
                  setChartTab('yours');
                }
              }}
            >
              Yours
            </span>
          </div>
          <div className={`${chartTab == 'liquidity' ? '' : 'hidden'}`}>
            {!isInvalid(leftPoint) &&
              !isInvalid(rightPoint) &&
              !switch_pool_loading && (
                <DclChart
                  pool_id={currentSelectedPool?.pool_id}
                  leftPoint={leftPoint}
                  rightPoint={rightPoint}
                  setLeftPoint={setLeftPoint}
                  setRightPoint={setRightPoint}
                  setTargetPoint={setTargetPoint}
                  targetPoint={targetPoint}
                  radius={radius}
                  config={{
                    radiusMode: priceRangeMode == 'by_radius',
                    svgWidth: is_mobile
                      ? document.documentElement.clientWidth - 32 || '330'
                      : '',
                  }}
                  reverse={pair_is_reverse}
                ></DclChart>
              )}
          </div>
          {isSignedIn &&
            !isInvalid(leftPoint) &&
            !isInvalid(rightPoint) &&
            !switch_pool_loading && (
              <div className={`${chartTab == 'yours' ? '' : 'hidden'}`}>
                <DclChart
                  pool_id={currentSelectedPool?.pool_id}
                  config={{
                    controlHidden: true,
                    svgWidth: is_mobile
                      ? document.documentElement.clientWidth - 32 || '330'
                      : '',
                  }}
                  chartType="USER"
                  reverse={pair_is_reverse}
                ></DclChart>
              </div>
            )}
        </div>
      </div>
      {/* set price range area */}
      <div className="lg:border lg:border-limitOrderFeeTiersBorderColor lg:rounded-xl p-4">
        {/* price range mode area */}
        <div className="frcb">
          <div className="text-white flex flex-col text-sm xsm:text-base font-gothamBold">
            <FormattedMessage
              id="set_price_range"
              defaultMessage="Set Price Range"
            />

            <span className="text-xs font-gotham text-primaryText">
              {getPair()}
            </span>
          </div>

          <div className="rounded-lg p-1 border frcs text-xs text-primaryText border-v3borderColor">
            <span
              className={`whitespace-nowrap min-w-20 px-3 py-1.5 rounded-md cursor-pointer ${
                priceRangeMode === 'by_range'
                  ? 'text-white bg-proTabBgColor'
                  : ''
              }`}
              onClick={() => {
                setPriceRangeMode('by_range');
              }}
            >
              <FormattedMessage
                id="by_range"
                defaultMessage={'By range'}
              ></FormattedMessage>
            </span>
            <span
              className={`whitespace-nowrap min-w-20 px-3 py-1.5 rounded-md cursor-pointer ${
                priceRangeMode === 'by_radius'
                  ? 'text-white bg-proTabBgColor'
                  : ''
              }`}
              onClick={() => {
                setPriceRangeMode('by_radius');
                changeRadius(radius);
              }}
            >
              <FormattedMessage
                id="by_radius"
                defaultMessage={'By Radius'}
              ></FormattedMessage>
            </span>
          </div>
        </div>
        {/* content */}
        <div className="lg:grid lg:grid-cols-3 xsm:flex xsm:flex-col gap-3 pt-4 mt-3">
          {/* target price input box */}
          <div
            className={` ${
              priceRangeMode === 'by_range' ? 'hidden' : ''
            } flex border border-menuMoreBoxBorderColor items-center bg-black bg-opacity-20 rounded-xl p-2.5 col-span-2`}
          >
            <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
              <FormattedMessage
                id="target_price"
                defaultMessage="Target Price"
              ></FormattedMessage>
            </span>
            <PointInputComponent
              handlePriceToAppropriatePoint={
                handleTargetPriceToAppropriatePoint
              }
              customPrice={targetCustomPrice}
              setCustomPrice={setTargetCustomPrice}
              inputStatus={targetInputStatus}
              setInputStatus={setTargetInputStatus}
              getPrice={getTargetPrice}
              setPoint={setTargetPoint}
              point={targetPoint}
            />
          </div>

          {/* radius input box */}
          <div
            className={` ${
              priceRangeMode === 'by_range' ? 'hidden' : ''
            } flex border border-menuMoreBoxBorderColor items-center bg-black bg-opacity-20 rounded-xl p-2.5 col-span-1`}
          >
            <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
              <FormattedMessage
                id="radius"
                defaultMessage="Radius"
              ></FormattedMessage>
            </span>
            <IntegerInputComponent
              value={radius}
              setValue={setRadius}
              triggerByValue={changeRadius}
            />
          </div>

          {/* min price input box */}
          <div
            className={`flex border border-menuMoreBoxBorderColor items-center rounded-xl p-2.5 col-span-1 ${
              priceRangeMode === 'by_radius' ? '' : 'bg-black bg-opacity-20'
            }`}
          >
            <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
              <FormattedMessage
                id="min_price"
                defaultMessage="Min Price"
              ></FormattedMessage>
            </span>
            <PointInputComponent
              handlePriceToAppropriatePoint={(price: string) => {
                if (pair_is_reverse) {
                  return get_bin_point_by_price(reverse_price(price));
                } else {
                  return get_bin_point_by_price(price);
                }
              }}
              disbaled={priceRangeMode === 'by_radius'}
              customPrice={leftCustomPrice}
              getPrice={getLeftPrice}
              setCustomPrice={setLeftCustomPrice}
              inputStatus={leftInputStatus}
              setInputStatus={setLeftInputStatus}
              setPoint={setLeftPoint}
              point={leftPoint}
            ></PointInputComponent>
          </div>

          {/* max price input box */}
          <div
            className={`flex border border-menuMoreBoxBorderColor items-center rounded-xl p-2.5 col-span-1 ${
              priceRangeMode === 'by_radius' ? '' : 'bg-black bg-opacity-20'
            }`}
          >
            <span className="text-sm text-primaryText xs:text-xs whitespace-nowrap md:text-xs">
              <FormattedMessage
                id="max_price"
                defaultMessage="Max Price"
              ></FormattedMessage>
            </span>
            <PointInputComponent
              handlePriceToAppropriatePoint={(price: string) => {
                if (pair_is_reverse) {
                  return get_bin_point_by_price(reverse_price(price));
                } else {
                  return get_bin_point_by_price(price);
                }
              }}
              customPrice={rightCustomPrice}
              getPrice={getRightPrice}
              setCustomPrice={setRightCustomPrice}
              inputStatus={rightInputStatus}
              setInputStatus={setRightInputStatus}
              setPoint={setRightPoint}
              point={rightPoint}
              disbaled={priceRangeMode === 'by_radius'}
            ></PointInputComponent>
          </div>

          {/* bin number input box */}
          <div
            className={`flex border border-menuMoreBoxBorderColor items-center rounded-xl p-2.5 col-span-1 ${
              priceRangeMode === 'by_radius' ? '' : 'bg-black bg-opacity-20'
            }`}
          >
            <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
              <FormattedMessage
                id="bin_amount"
                defaultMessage="Bin amount"
              ></FormattedMessage>
            </span>
            <IntegerInputComponent
              value={binNumber}
              setValue={setBinNumber}
              triggerByValue={changeBin}
              disabled={priceRangeMode === 'by_radius'}
            />
          </div>
        </div>
        {/* tip in foot */}
        <div
          style={{
            color: '#FF9343',
          }}
          className="text-xs mt-3"
        >
          {onlyAddYToken && currentPoint != rightPoint - 1
            ? `*Only ${currentSelectedPool?.token_y_metadata?.symbol} is needed in the price range you choose.`
            : ''}
          {onlyAddXToken
            ? `*Only ${currentSelectedPool?.token_x_metadata?.symbol} is needed in the price range you choose.`
            : ''}
          {invalidRange ? <FormattedMessage id="invalid_range_tip" /> : ''}
        </div>
      </div>
    </div>
  );
}
