import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useState, useEffect } from 'react';
import { BurrowIcon } from '../../components/icon/FarmBoost';
import { isMobile } from '../../utils/device';
import { get_shadow_records } from '../../services/farm';

export default function LPTip({ poolId }: { poolId: string | number }) {
  const mobile = isMobile();
  const [hover, setHover] = useState<Boolean>(false);
  const [has_shadow_in_farm, set_has_shadow_in_farm] = useState(false);
  const shadow_id = `shadow_ref_v1-${poolId}`;
  const url = `https://app.burrow.finance/tokenDetail/${shadow_id}`;
  useEffect(() => {
    get_shadow_records().then((res) => {
      set_has_shadow_in_farm(!!Number(res[poolId]?.shadow_in_burrow || 0));
    });
  }, []);
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
      <span
        className={`flex justify-center items-center rounded cursor-pointer w-4 h-4 ${
          has_shadow_in_farm ? 'bg-burrowYellowColor' : 'bg-primaryText'
        }`}
      >
        <BurrowIcon />
      </span>
      <div
        className={`absolute bottom-0 pb-6 xsm:-right-8 z-10 ${
          hover ? '' : 'hidden'
        }`}
      >
        {has_shadow_in_farm ? (
          <div className="text-xs text-farmText w-56 border border-primaryText rounded-md px-2 py-1 bg-cardBg">
            You‘ve supplied this LP on Borrow
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
