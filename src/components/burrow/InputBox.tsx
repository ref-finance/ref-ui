import React, { useEffect, useState } from 'react';
import RangeSlider from './RangeSlider';
import { IAsset } from 'src/services/burrow-interfaces';
import {
  formatWithCommas_usd,
  formatNumber,
  isInvalid,
} from 'src/services/burrow-utils';
import { toPrecision } from 'src/utils/numbers';
import Big from 'big.js';
export default function InputBox(props: any) {
  const {
    balance,
    asset,
    setIsMax,
    isMax,
    amount,
    setAmount,
    sliderAmount,
    setSliderAmount,
    action,
  } = props;
  const [inputValue$, setInputValue$] = useState<string>();

  useEffect(() => {
    if (asset && !isInvalid(amount)) {
      setInputValue$(
        Big(asset.price.usd || 0)
          .mul(amount || 0)
          .toFixed()
      );
    }
  }, [amount, asset]);
  function changeAmount(v: string) {
    const bigV = Big(v || 0);
    if (bigV.lt(0) || bigV.gt(balance || 0)) return;
    setAmount(v.replace(/^0+/, '0'));
    setSliderAmount(
      Big(v || 0)
        .div(balance || 1)
        .mul(100)
        .toFixed()
    );
    setIsMax(false);
  }
  function changeToMax() {
    // todo 当尾部0没有意义时去掉尾部多余的0
    const bigBalance = Big(balance || 0);
    if (bigBalance.eq(0)) {
      setAmount('0');
      setSliderAmount('0');
    } else {
      setAmount(bigBalance.toFixed());
      setSliderAmount('100');
    }
    setIsMax(true);
  }
  return (
    <div>
      <div
        style={{ height: '55px' }}
        className="flex items-center border border-inputV3BorderColor rounded-2xl bg-black bg-opacity-20 px-3.5"
      >
        <img
          src={asset?.metadata?.icon}
          className="h-6 w-6 rounded-full flex-shrink-0"
        ></img>
        <input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={({ target }) => changeAmount(target.value)}
          className="text-white text-xl focus:outline-non appearance-none leading-tight px-2.5 w-full"
          max={balance || 0}
        ></input>
        <div
          onClick={changeToMax}
          className="text-xs text-primaryText rounded-md border border-primaryText px-1.5 py-1 cursor-pointer opacity-60 hover:opacity-100"
        >
          Max
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-primaryText px-3 mt-2">
        <span title={inputValue$ || '$0'}>
          {formatWithCommas_usd(inputValue$)}
        </span>
        <span title={balance || '0'}>Balance: {formatNumber(balance)}</span>
      </div>
      <div>
        <RangeSlider
          setAmount={setAmount}
          balance={balance}
          isMax={isMax}
          setIsMax={setIsMax}
          sliderAmount={sliderAmount}
          setSliderAmount={setSliderAmount}
          action={action}
        ></RangeSlider>
      </div>
    </div>
  );
}
