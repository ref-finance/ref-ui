import React, { useState } from 'react';
import VoteSheet from './VoteSheet';
import VotersSheet from './VotersSheet';
import { isMobile } from '../../utils/device';
import MyPieChart from './VoteChart';
import { AcquireXREFIcon, CoinPc } from './icons';
import VoteModal from './VoteModal';
import DonateModal from './DonateModal';
import { Intro } from './Intro';
import { useScrollToTopOnFirstPage } from '../../state/pool';
import UserRankingModal from './UserRankingModal';
import MemeAirdropListForPc from './memeAirdropListForPc';
import VoteDetailsModal from './VoteDetailsModal';

const Staking = () => {
  const is_mobile = isMobile();
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isUserRanking, setUserRanking] = useState(false);
  const [isShowAirdropModal, setShowAirdropModal] = useState(false);
  const [isShowVoteDetailsModal, setVoteDetailsModal] = useState(false);
  const { currentPage, introRef, hasGuided } = useScrollToTopOnFirstPage(1);
  return (
    <div className="mt-16 flex text-white pl-8 pr-2">
      <div className="flex-1 text-center border-r border-memeStakingBorderColor pb-10 pr-24">
        <div className="text-26px mb-10 gotham_bold">Meme staking</div>
        <div
          className="mb-24"
          style={{ width: '285px', height: '285px' }}
        ></div>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="border border-greenLight bg-memeDarkColor rounded-lg h-12 flex items-center cursor-pointer justify-center text-greenLight text-base gotham_bold"
            onClick={() => setUserRanking(true)}
          >
            Rank
          </div>
          <div
            className="border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex cursor-pointer items-center justify-center text-white text-base gotham_bold"
            onClick={() => setShowAirdropModal(true)}
          >
            <CoinPc />
            <p className="ml-2">Airdrop</p>
          </div>
        </div>
      </div>
      <div className="flex-1 text-center pb-10 pl-14">
        <div className="font-bold relative">
          <p className="text-26px mb-10 gotham_bold">xREF staking</p>
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
        {!hasGuided && (currentPage === 1 || currentPage === 2) && (
          <div className="relative" ref={introRef}>
            <Intro
              top={currentPage === 1 ? -264 : -240}
              left={currentPage === 1 ? 180 : 140}
            ></Intro>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          <div
            className="border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex items-center cursor-pointer justify-center text-white text-base gotham_bold"
            onClick={() => {
              setVoteDetailsModal(true);
            }}
          >
            Detail
          </div>
          <div
            className="bg-greenLight rounded-lg h-12 flex items-center justify-center text-black text-base cursor-pointer gotham_bold"
            onClick={() => {
              setIsVoteOpen(true);
            }}
          >
            Vote
          </div>
          <div
            className="border border-greenLight bg-memeDarkColor rounded-lg h-12 flex items-center justify-center text-greenLight text-base cursor-pointer gotham_bold"
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
      {isUserRanking ? (
        <UserRankingModal
          isOpen={isUserRanking}
          onRequestClose={() => {
            setUserRanking(false);
          }}
        />
      ) : null}
      {isShowAirdropModal ? (
        <MemeAirdropListForPc
          isOpen={isShowAirdropModal}
          onRequestClose={() => {
            setShowAirdropModal(false);
          }}
        />
      ) : null}
      {isShowVoteDetailsModal ? (
        <VoteDetailsModal
          isOpen={isShowVoteDetailsModal}
          onRequestClose={() => {
            setVoteDetailsModal(false);
          }}
        />
      ) : null}
    </div>
  );
};
export default Staking;
