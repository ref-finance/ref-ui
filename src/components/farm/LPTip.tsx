import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useState, useEffect } from 'react';
import { BurrowIcon } from '../../components/icon/FarmBoost';
import { isMobile } from '../../utils/device';

export default function LPTip({ poolId }: { poolId: string | number }) {
  const mobile = isMobile();
  const [hover, setHover] = useState<Boolean>(false);
  const shadow_id = `shadow_ref_v1-${poolId}`;
  const url = `https://app.burrow.finance/tokenDetail/${shadow_id}`;
  return (
    <div
      className="flex items-center justify-center  relative ml-1.5 mr-0.5"
      onMouseEnter={() => {
        if (!mobile) {
          setHover(true);
        }
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setHover(!hover);
      }}
    >
      <span className="flex justify-center items-center rounded cursor-pointer w-4 h-4 bg-burrowYellowColor">
        <BurrowIcon />
      </span>
      <div
        className={`absolute bottom-0 pb-6 xsm:-right-8 ${
          hover ? '' : 'hidden'
        }`}
      >
        <div className="text-xs text-farmText w-52 border border-primaryText rounded-md px-2 py-1 bg-cardBg">
          Please re-stake to support double reward from Ref’s farm and
          <a
            className="text-xs ml-0.5 text-burrowYellowColor underline cursor-pointer"
            target="_blank"
            onClick={(e) => {
              e.stopPropagation();
              window.open(url);
              setHover(false);
            }}
            rel="noreferrer"
          >
            Burrow’s LP Supplying.
          </a>
        </div>
      </div>
    </div>
  );
}
