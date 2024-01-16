import React, { useState } from 'react';

const Overview = () => {
  return (
    <div className="flex items-center justify-between gap-8">
      {[1, 2, 3, 4].map((item) => {
        return (
          <div
            key={item}
            className="flex flex-grow flex-col items-center justify-center border border-memeBorderColor bg-swapCardGradient rounded-2xl"
            style={{ height: '110px' }}
          >
            <span className="text-base text-white">Total Staked</span>
            <span className="text-3xl gotham_bold text-white">$34.56M</span>
          </div>
        );
      })}
    </div>
  );
};

export default Overview;
