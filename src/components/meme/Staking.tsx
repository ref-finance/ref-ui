import React, { useState } from 'react';
import { isMobile } from '../../utils/device';
import {
  AcquireXREFIcon,
  AirdropMobileArrowIcon,
  ArrowRightTopIcon,
  CoinPc,
  XREFStakingDetails,
} from './icons';
import VoteModal from './VoteModal';
import DonateModal from './DonateModal';
import { Intro } from './Intro';
import { useScrollToTopOnFirstPage } from '../../state/pool';
import UserRankingModal from './UserRankingModal';
import MemeAirdropListForPc from './memeAirdropListForPc';
import VoteDetailsModal from './VoteDetailsModal';
import StakingChart from './StakingChart';
import { useHistory } from 'react-router-dom';

const Staking = () => {
  const is_mobile = isMobile();
  const history = useHistory();
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isUserRanking, setUserRanking] = useState(false);
  const [isShowAirdropModal, setShowAirdropModal] = useState(false);
  const [isShowVoteDetailsModal, setVoteDetailsModal] = useState(false);
  const { currentPage, introRef, hasGuided } = useScrollToTopOnFirstPage();
  return (
    <div className="mt-16 flex text-white pl-8 pr-2 xsm:block xsm:pl-0 xsm:pr-0">
      <div className="flex-1 text-center border-r border-memeStakingBorderColor pb-10 pr-24 xsm:pr-0 xsm:pb-0 xsm:text-left xsm:mb-14">
        <div className="text-26px mb-10 gotham_bold xsm:text-xl xsm:ml-8 xsm:mb-5">
          Meme staking
        </div>
        <div className="xsm:bg-memeStakingBgColor xsm:border xsm:border-memeBorderColor xsm:rounded-2xl xsm:pt-12 xsm:pb-8 xsm:px-11">
          <div className="mb-24 xsm:mb-9" style={{ height: '285px' }}>
            <StakingChart chartType="meme" />
          </div>
          <div className="grid grid-cols-2 gap-4 xsm:grid-cols-1 xsm:-mx-5 xsm:gap-5">
            <div
              className="border border-greenLight bg-memeDarkColor rounded-lg h-12 flex items-center cursor-pointer justify-center text-greenLight text-base gotham_bold"
              onClick={() => setUserRanking(true)}
            >
              Rank
            </div>
            <div
              className="border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex cursor-pointer 
              items-center justify-center text-primaryText text-base gotham_bold xsm:hidden"
              onClick={() => setShowAirdropModal(true)}
            >
              <CoinPc />
              <p className="ml-2">Airdrop</p>
            </div>
            <div
              className="lg:hidden border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex cursor-pointer 
              items-center justify-center text-primaryText text-base gotham_bold xsm:border-none xsm:bg-transparent xsm:h-auto"
              onClick={() => history.push('/airdop')}
            >
              <CoinPc />
              <p className="ml-2">Airdrop</p>
              <div className="ml-1">
                <AirdropMobileArrowIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 text-center pb-10 pl-14 xsm:pl-0 xsm:pb-0 xsm:text-left">
        <div className="font-bold relative xsm:flex xsm:justify-between xsm:items-center xsm:mb-5">
          <p className="text-26px mb-10 gotham_bold xsm:text-xl xsm:ml-8 xsm:mb-0">
            xREF staking
          </p>
          <a
            className="absolute right-0 top-4 text-primaryText text-sm flex items-center justify-center xsm:hidden"
            href="/xref"
            target="_blank"
          >
            Acquire $xREF
            <AcquireXREFIcon />
          </a>
          <div className="lg:hidden mr-8 flex items-center justify-center">
            <XREFStakingDetails />
            <p
              className="ml-1.5 text-sm"
              onClick={() => {
                setVoteDetailsModal(true);
              }}
            >
              Detail
            </p>
          </div>
        </div>
        <div className="xsm:bg-memeStakingBgColor xsm:border xsm:border-memeBorderColor xsm:rounded-2xl xsm:pt-12 xsm:pb-8 xsm:px-11">
          <div className="mb-6" style={{ height: '285px' }}>
            <StakingChart chartType="xref" />
          </div>
          <div className="flex px-8 mb-6 xsm:hidden">
            <div className="flex-1 text-left ">
              <p className="text-sm text-primaryText mb-2">Current Round:</p>
              <div className="text-sm ">2024/05/04-2024/06/03</div>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-primaryText mb-2">Current Round:</p>
              <div className="text-sm ">2024/06/06-2024/07/05</div>
            </div>
          </div>
          {!hasGuided &&
            (currentPage === 1 || currentPage === 2) &&
            !is_mobile && (
              <div className="relative" ref={introRef}>
                <Intro
                  top={currentPage === 1 ? -264 : -240}
                  left={currentPage === 1 ? 180 : 140}
                >
                  <div
                    className="grid grid-cols-3 gap-4"
                    style={{
                      width: '28.3rem',
                    }}
                  >
                    <div className="border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex items-center justify-center text-white text-base">
                      Detail
                    </div>
                    <div className=" bg-greenLight rounded-lg h-12 flex items-center justify-center text-black text-base">
                      Vote
                    </div>
                    <div className="border border-greenLight bg-memeDarkColor rounded-lg h-12 flex items-center justify-center text-greenLight text-base">
                      Donate
                    </div>
                  </div>
                </Intro>
              </div>
            )}
          <div className="grid grid-cols-3 gap-4 xsm:grid-cols-1 xsm:-mx-5 xsm:gap-5">
            <div
              className="xsm:hidden border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex items-center cursor-pointer justify-center text-white text-base gotham_bold"
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
            <div className="lg:hidden flex items-center justify-center text-greenLight text-base">
              <a
                className="inline-flex items-center cursor-pointer"
                href="/xref"
                target="_blank"
              >
                Acquire $xREF <ArrowRightTopIcon />
              </a>
            </div>
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
