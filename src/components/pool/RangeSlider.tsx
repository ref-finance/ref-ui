import React, { useRef, useState, useEffect } from 'react';
import { toPrecision } from 'src/utils/numbers';
import Big from 'big.js';
export default function RangeSlider(props: any) {
  const { setAmount, balance, sliderAmount, setSliderAmount } = props;
  const [splitList] = useState([0, 25, 50, 75, 100]);

  const tipRef = useRef(null);
  const valueRef = useRef(null);
  useEffect(() => {
    if (valueRef.current) {
      valueRef.current.style.backgroundSize = `${sliderAmount}% 100%`;
    }
    if (tipRef.current) {
      tipRef.current.style.left = `${+sliderAmount}%`;
      const marginLeft = -13 - (20 * +sliderAmount) / 100;
      tipRef.current.style.marginLeft = `${marginLeft}px`;
    }
  }, [sliderAmount]);
  function changeValue(v: string) {
    setSliderAmount(v);
    setAmount(
      Big(v)
        .div(100)
        .mul(balance || 0)
        .toFixed()
    );
  }
  return (
    <div className="mt-6 mb-8">
      <div className="flex justify-between items-center mb-3 -mx-3">
        {splitList.map((p) => {
          return (
            <div
              key={p}
              className={`flex flex-col items-center cursor-pointer`}
              onClick={() => {
                changeValue(p.toString());
              }}
            >
              <span
                className={`flex items-center justify-center text-xs text-primaryText w-11 py-1 border border-transparent hover:border-v3LiquidityRemoveBarColor rounded-lg ${
                  p == +sliderAmount ? 'bg-black bg-opacity-20' : ''
                }`}
              >
                {p}%
              </span>
              <label
                style={{ height: '5px', width: '1px' }}
                className="bg-primaryText mt-1"
              ></label>
            </div>
          );
        })}
      </div>
      <div className={`relative flex flex-col`}>
        <input
          ref={valueRef}
          onChange={(e) => {
            changeValue(e.target.value);
          }}
          value={sliderAmount}
          type="range"
          className={`w-full cursor-pointer`}
          style={{ backgroundSize: '100% 100%' }}
          min="0"
          max="100"
          step="any"
        />
        <div
          className={`flex items-center justify-center absolute top-6 rounded-lg bg-greenColor h-5`}
          style={{ marginLeft: '-33px', left: '100%', width: '46px' }}
          ref={tipRef}
        >
          <span className="text-xs text-white">
            <label className="gotham_bold">
              {toPrecision(sliderAmount.toString(), 0)}
            </label>
            %
          </span>
        </div>
      </div>
    </div>
  );
}
