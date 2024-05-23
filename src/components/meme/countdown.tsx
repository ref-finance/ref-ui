import React, { useState } from 'react';
import { isMobile } from '../../utils/device';
import { CountdownLeftBg, CountdownRightBottomBg } from './icons';

const Countdown = () => {
  return (
    <div className="mt-12 bg-memeVoteBgColor  border border-memeBorderColor rounded-2xl h-72 relative">
      <div className="absolute right-0 bottom-0">
        <CountdownRightBottomBg />
      </div>
      <div className="absolute left-0 bottom-0">
        <CountdownLeftBg />
      </div>
    </div>
  );
};
export default Countdown;
