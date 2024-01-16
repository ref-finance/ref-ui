import React, { useState } from 'react';
import {
  ArrowRightIcon,
  BlackDragonIcon,
  LonkIcon,
  NekoIcon,
  Shitzu,
} from './icons';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';

import CustomTooltip from 'src/components/customTooltip/customTooltip';

const TokenList = () => {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 mt-14">
      {[1, 2, 3, 4].map((item) => {
        return (
          <div
            key={item}
            className="border border-memeBorderColor bg-swapCardGradient rounded-2xl px-4 py-6"
          >
            <div className="flex items-stretch gap-4">
              <LonkIcon style={{ width: '86px', height: '86px' }} />
              <div className="flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xl gotham_bold text-white">
                    BLACKDRAGON
                  </span>
                  <div className="flex items-center border border-memePoolBoxBorderColor cursor-pointer gap-2 rounded-lg h-8 px-2">
                    <span className="text-xs text-white">BLACKDRAGON/NEAR</span>
                    <ArrowRightIcon />
                  </div>
                </div>
                <p className="text-sm text-primaryText">
                  Dawn of BLACKDRAGON | the next gen, fully open-source &
                  community-driven, memecoin native to NEAR
                </p>
              </div>
            </div>
            {/* base data */}
            <div className="grid grid-cols-3 grid-rows-2 gap-y-6 mt-5">
              <Template title="Total Feed" value="22.67B" subValue="$6.27M" />
              <Template
                title="APY"
                value="23.45%"
                subValue="+26.35%"
                isAPY={true}
              />
              <Template title="Feeder" value="123" />
              <Template title="You Feed" value="10M" subValue="$2.27K" />
              <Template title="You Reward" value="52.34K" subValue="$12.67" />
              <Template title="Balance" value="10M" subValue="$2.27K" />
            </div>
            {/* operation */}
            <div className="flex items-center justify-between gap-3">
              <OprationButton
                minWidth="7rem"
                disabled={false}
                onClick={() => {}}
                className={`flex items-center justify-center border border-greenLight mt-6 rounded-xl h-12 text-greenLight text-base gotham_bold focus:outline-none ${
                  false ? 'opacity-40' : ''
                }`}
              >
                <ButtonTextWrapper loading={false} Text={() => <>Claim</>} />
              </OprationButton>
              <OprationButton
                minWidth="7rem"
                disabled={false}
                onClick={() => {}}
                className={`flex items-center justify-center border border-greenLight mt-6 rounded-xl h-12 text-greenLight text-base gotham_bold focus:outline-none ${
                  false ? 'opacity-40' : ''
                }`}
              >
                <ButtonTextWrapper loading={false} Text={() => <>Unstake</>} />
              </OprationButton>
              <OprationButton
                minWidth="7rem"
                disabled={false}
                onClick={() => {}}
                className={`flex flex-grow items-center justify-center bg-greenLight text-boxBorder mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none ${
                  false ? 'opacity-40' : ''
                }`}
              >
                <ButtonTextWrapper
                  loading={false}
                  Text={() => <>Feed BLACKDRAGON</>}
                />
              </OprationButton>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function Template({
  title,
  value,
  subValue,
  isAPY,
}: {
  title: string;
  value: string;
  subValue?: string;
  isAPY?: boolean;
}) {
  function getApyTip() {
    const result = `<div class="px-2">
        <div class="flex items-center justify-between text-xs textfarmText gap-3.5">
          <span>Staking APR</span>
          <span>${value}</span>
        </div>
        <div class="flex items-center justify-between text-xs textfarmText gap-3.5 mt-2">
          <span>Farm APR</span>
          <span>${subValue}</span>
      </div>
    </div>`;
    return result;
  }

  return (
    <div className="flex flex-col justify-between gap-0.5">
      {isAPY ? (
        <div
          style={{ width: '40px' }}
          data-class="reactTip"
          data-tooltip-id="apyId"
          data-place="top"
          data-tooltip-html={getApyTip()}
        >
          <span className="text-sm text-white border-b border-dashed border-white relative -top-0.5">
            {title}
          </span>
          <CustomTooltip id="apyId" />
        </div>
      ) : (
        <span className="text-sm text-white">{title}</span>
      )}
      <div className="flex items-end gap-1">
        <span className="text-xl text-white gotham_bold">{value}</span>
        {subValue ? (
          <span className="text-xs text-white relative -top-1">$6.27M</span>
        ) : null}
      </div>
    </div>
  );
}
export default TokenList;
