import React, { useEffect, useState } from 'react';
import RangeSlider from './RangeSlider';
import { IAsset } from '~services/burrow-interfaces';
import { formatWithCommas_usd, formatNumber } from '~services/burrow-utils';
import Big from 'big.js';
export default function InputBox(props: { balance: string; asset: IAsset }) {
  const { balance, asset } = props;
  const [balance$, setBalance$] = useState<string>();
  useEffect(() => {
    if (asset && balance !== null && balance !== undefined && balance !== '') {
      setBalance$(
        Big(asset.price.usd || 0)
          .mul(balance || 0)
          .toFixed()
      );
    }
  }, [balance, asset]);
  return (
    <div>
      <div
        style={{ height: '55px' }}
        className="flex items-center border border-inputV3BorderColor rounded-2xl bg-black bg-opacity-20 px-3.5"
      >
        <span>
          <img
            src={asset?.metadata?.icon}
            className="h-6 w-6 rounded-full"
          ></img>
        </span>
        <input
          type="number"
          placeholder="0.0"
          // value={amount}
          // onChange={({ target }) => changeAmount(target.value)}
          className="text-white text-xl focus:outline-non appearance-none leading-tight px-2.5 w-full"
        ></input>
        <div className="text-xs text-primaryText rounded-md border border-primaryText px-1.5 py-1 cursor-pointer opacity-60 hover:opacity-100">
          Max
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-primaryText px-3 mt-2">
        <span>{formatWithCommas_usd(balance$)}</span>
        <span>Balance: {formatNumber(balance)}</span>
      </div>
      <div>
        <RangeSlider></RangeSlider>
      </div>
    </div>
  );
}
