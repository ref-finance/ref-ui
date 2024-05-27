import React, { useState } from 'react';
import VoteSheet from './VoteSheet';
import VotersSheet from './VotersSheet';
import { isMobile } from '../../utils/device';
import { Intro } from './Intro';
import { useScrollToTopOnFirstPage } from '../../state/pool';

const Staking = () => {
  const is_mobile = isMobile();
  const { currentPage, introRef, hasGuided } = useScrollToTopOnFirstPage(1);
  return (
    <div className="mt-16 flex text-white pl-8 pr-2">
      <div className="flex-1 text-center border-r border-memeStakingBorderColor pb-10 pr-24">
        <div className="text-26px mb-10 font-bold">Meme staking</div>
        <div
          className="mb-24"
          style={{ width: '285px', height: '285px' }}
        ></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-greenLight bg-memeDarkColor rounded-lg h-12 flex items-center justify-center text-greenLight text-base">
            Rank
          </div>
          <div className="border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex items-center justify-center text-primaryText text-base">
            Coming Soon
          </div>
        </div>
      </div>
      <div className="flex-1 text-center pb-10 pl-14">
        <div className="text-26px mb-10 font-bold">xREF staking</div>
        <div className="mb-6" style={{ width: '285px', height: '285px' }}></div>
        <div className="flex px-8 mb-6">
          <div className="flex-1 text-left ">
            <p className="text-sm text-primaryText mb-2">Current Round:</p>
            <div className="text-sm ">2024/03/18-2024/03/31</div>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm text-primaryText mb-2">Current Round:</p>
            <div className="text-sm ">2024/03/18-2024/03/31</div>
          </div>
        </div>
        {!hasGuided && (currentPage === 1 || currentPage === 2) && (
          <div className="relative" ref={introRef}>
            <Intro
              top={currentPage === 1 ? -264 : -240}
              left={currentPage === 1 ? 180 : 140}
            ></Intro>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex items-center justify-center text-white text-base">
            Detail
          </div>
          <div className="bg-greenLight rounded-lg h-12 flex items-center justify-center text-black text-base">
            Vote
          </div>
          <div className="border border-greenLight bg-memeDarkColor rounded-lg h-12 flex items-center justify-center text-greenLight text-base">
            Donate
          </div>
        </div>
      </div>
    </div>
  );
};
export default Staking;
