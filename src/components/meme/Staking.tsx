import React, { useState } from 'react';
import VoteSheet from './VoteSheet';
import VotersSheet from './VotersSheet';
import { isMobile } from '../../utils/device';
import MyPieChart from './VoteChart';
import { AcquireXREFIcon } from './icons';
import VoteModal from './VoteModal';
import DonateModal from './DonateModal';

const Staking = () => {
  const is_mobile = isMobile();
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
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
        <div className="font-bold relative">
          <p className="text-26px mb-10 font-bold">xREF staking</p>
          <a
            className="absolute right-0 top-4 text-primaryText text-sm flex items-center justify-center"
            href="/xref"
            target="_blank"
          >
            Acquire $xREF
            <AcquireXREFIcon />
          </a>
        </div>
        <div className="mb-6" style={{ height: '285px' }}>
          {/* <MyPieChart /> */}
        </div>
        <div className="flex px-8 mb-6">
          <div className="flex-1 text-left ">
            <p className="text-sm text-primaryText mb-2">Current Round:</p>
            <div className="text-sm ">2024/05/04-2024/06/03</div>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm text-primaryText mb-2">Current Round:</p>
            <div className="text-sm ">2024/06/06-2024/07/05</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex items-center justify-center text-white text-base">
            Detail
          </div>
          <div
            className="bg-greenLight rounded-lg h-12 flex items-center justify-center text-black text-base cursor-pointer"
            onClick={() => {
              setIsVoteOpen(true);
            }}
          >
            Vote
          </div>
          <div
            className="border border-greenLight bg-memeDarkColor rounded-lg h-12 flex items-center justify-center text-greenLight text-base cursor-pointer"
            onClick={() => {
              setIsDonateOpen(true);
            }}
          >
            Donate
          </div>
        </div>
      </div>
      {isVoteOpen ? (
        <VoteModal
          isOpen={isVoteOpen}
          onRequestClose={() => {
            setIsVoteOpen(false);
          }}
        />
      ) : null}
      {isDonateOpen ? (
        <DonateModal
          isOpen={isDonateOpen}
          onRequestClose={() => {
            setIsDonateOpen(false);
          }}
        />
      ) : null}
    </div>
  );
};
export default Staking;
