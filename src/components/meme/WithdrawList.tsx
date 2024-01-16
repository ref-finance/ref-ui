import React, { useState } from 'react';
import { BlackDragonIcon, LonkIcon, NekoIcon, Shitzu } from './icons';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';

const WithdrawList = () => {
  return (
    <div className="bg-swapCardGradient border border-swapCardBorder px-5 rounded-2xl mt-8">
      {[1, 2, 3].map((item) => {
        return (
          <div
            key={item}
            style={{ height: '68px' }}
            className={`flex items-center justify-between border-b border-memePoolBoxBorderColor`}
          >
            <div className="flex items-center gap-2.5">
              <BlackDragonIcon style={{ width: '32px', height: '32px' }} />
              <div className="flex items-center gap-2.5 text-white text-base">
                <span className="gotham_bold">40M LONK</span> is available to be
                withdrawal now!
              </div>
            </div>
            <OprationButton
              minWidth="7rem"
              disabled={false}
              onClick={() => {}}
              className={`flex items-center justify-center bg-memeDarkColor border border-greenLight rounded-xl h-8 text-greenLight text-sm focus:outline-none ${
                false ? 'opacity-40' : ''
              }`}
            >
              <ButtonTextWrapper loading={false} Text={() => <>Withdraw</>} />
            </OprationButton>
          </div>
        );
      })}
    </div>
  );
};

export default WithdrawList;
