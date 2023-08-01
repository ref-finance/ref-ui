import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ReactSlider from 'react-slider';

import { ReactSliderProps } from 'react-slider';
import { leverageMap } from '../math';

export function LeverageSlider(
  props: ReactSliderProps & {
    curLeverage: number | string;
    marginRatio: '-' | number;
  }
) {
  return (
    <div className="">
      <div className="w-full mb-4 frcb text-sm xs:text-xs text-primaryText">
        <FormattedMessage
          id="leverage_max_leverage"
          defaultMessage={'Max Account Leverage:'}
        />

        <span className="whitespace-nowrap text-white">
          {props.curLeverage}
          <span className="text-primaryText xs:text-white xs:font-gothamBold">
            x
          </span>
        </span>
      </div>

      <ReactSlider {...props} max={5} step={1} />

      <div className="w-full pl-1.5 pt-1 frcb">
        {['1x', '2x', '3x', '4x', '5x', '10x'].map((label, index) => (
          <button
            className="text-xs text-primaryText cursor-pointer"
            key={'orderly-leverage-slider-item' + index}
            // disabled={
            //   props.marginRatio === '-' ||
            //   leverageMap(index, true) < 1 / props.marginRatio
            // }
            onClick={(e) => {
              props.onChange(index, index);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
