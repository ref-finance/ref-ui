import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { BigNumber } from 'bignumber.js';
import {
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../../../utils/numbers';
import { getV3Pool24VolumeById } from 'src/services/indexer';
import { get_metadata } from 'src/services/swapV3';
export function BaseData(props: any) {
  const { poolDetail, tokenPriceList } = props;
  const [volume24, setVolume24] = useState('0');
  const [user_liquidity_fee, set_user_liquidity_fee] = useState<number>();
  useEffect(() => {
    getV3Pool24VolumeById(poolDetail.pool_id)
      .then((res) => {
        setVolume24(res);
      })
      .catch(() => {});
    get_metadata().then((res) => {
      if (res) {
        const { protocol_fee_rate } = res;
        set_user_liquidity_fee((10000 - protocol_fee_rate) / 10000);
      }
    });
  }, []);

  function getTvl() {
    const {
      token_x_metadata,
      token_y_metadata,
      token_x,
      token_y,
      total_x,
      total_y,
      total_fee_x_charged,
      total_fee_y_charged,
    } = poolDetail;
    const pricex = tokenPriceList[token_x]?.price || 0;
    const pricey = tokenPriceList[token_y]?.price || 0;
    const totalX = new BigNumber(total_x).minus(total_fee_x_charged).toFixed();
    const totalY = new BigNumber(total_y).minus(total_fee_y_charged).toFixed();
    const tvlx =
      Number(toReadableNumber(token_x_metadata.decimals, totalX)) *
      Number(pricex);
    const tvly =
      Number(toReadableNumber(token_y_metadata.decimals, totalY)) *
      Number(pricey);
    const tvl = tvlx + tvly;
    if (tvl == 0) {
      return '$0';
    } else if (tvl < 0.01) {
      return '<$0.01';
    } else {
      return '$' + toInternationalCurrencySystem(tvl.toString(), 2);
    }
  }
  function get24Volume() {
    if (+volume24 == 0) {
      return '$0';
    } else if (+volume24 < 0.01) {
      return '<$0.01';
    } else {
      return '$' + toInternationalCurrencySystem(volume24.toString(), 2);
    }
  }

  function get24Fee() {
    const fee = poolDetail.fee;
    const f = new BigNumber(fee)
      .dividedBy(1000000)
      .multipliedBy(user_liquidity_fee || 1)
      .multipliedBy(volume24)
      .toFixed();
    if (+f == 0) {
      return '$0';
    } else if (+f < 0.01) {
      return '<$0.01';
    } else {
      return '$' + toInternationalCurrencySystem(f.toString(), 2);
    }
  }
  return (
    <div className="grid grid-cols-3 gap-3 xsm:grid-cols-2 mt-4">
      <DataBox
        title={
          <FormattedMessage id="TVL" defaultMessage="TVL"></FormattedMessage>
        }
        value={getTvl()}
      ></DataBox>
      <DataBox
        title={
          <FormattedMessage
            id="h24_volume_bracket"
            defaultMessage="Volume(24h)"
          ></FormattedMessage>
        }
        value={get24Volume()}
      ></DataBox>
      <DataBox
        title={
          <FormattedMessage
            id="fee_24h"
            defaultMessage="Fee(24h)"
          ></FormattedMessage>
        }
        value={get24Fee()}
      ></DataBox>
    </div>
  );
}
function DataBox(props: any) {
  const { title, value, className } = props;
  return (
    <div
      className={`flex flex-col flex-grow bg-detailCardBg rounded-lg px-4 py-3.5 ${className}`}
    >
      <span className="text-sm text-farmText">{title}</span>
      <span className="text-base text-white mt-3">{value}</span>
    </div>
  );
}
