import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ReactSlider from 'react-slider';

import { ReactSliderProps } from 'react-slider';

export function LeverageSlider(
  props: ReactSliderProps & {
    curLeverage: number | string;
    marginRatio: '-' | number;
  }
) {
  return (
    <div className="">
      <ReactSlider {...props} max={5} step={1} />

      <div className="w-full pl-1.5 pt-1 frcb">
        {['1x', '2x', '3x', '4x', '5x', '10x'].map((label, index) => (
          <button
            className="text-xs text-primaryText cursor-pointer"
            key={'orderly-leverage-slider-item' + index}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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

export function SetLeverageButton(
  props: ReactSliderProps & {
    curLeverage: number | string;
    marginRatio: '-' | number;
  }
) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      document.addEventListener('click', () => {
        setShowModal(false);
      });
    }

    return () => document.removeEventListener('click', () => {});
  }, [showModal]);

  return (
    <div className=" relative frcs gap-1">
      {props.curLeverage !== '-' && (
        <span className="text-white  whitespace-nowrap">
          {`${props.curLeverage}x`}
        </span>
      )}
      <div
        className="frcs cursor-pointer text-white border border-primaryText text-xs  rounded-md px-1 py-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal((s) => !s);
        }}
      >
        <FormattedMessage id="set" defaultMessage={'Set'}></FormattedMessage>
      </div>

      {showModal && (
        <div
          className="absolute z-40 bg-feeBoxBgColor  top-6 text-sm  right-0 px-4 py-5 rounded-2xl flex flex-col  gap-5"
          style={{
            width: '264px',
          }}
        >
          <div className="text-white ">
            <FormattedMessage
              id="leverage_max_leverage_raw"
              defaultMessage={'Max Account Leverage'}
            />
          </div>

          <div className="text-primaryText">
            <FormattedMessage
              id="max_leverage_tip"
              defaultMessage={
                'Max account leverage cannot be lower than your current leverage.'
              }
            ></FormattedMessage>
          </div>

          <LeverageSlider {...props}></LeverageSlider>
        </div>
      )}
    </div>
  );
}
