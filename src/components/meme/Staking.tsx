import React, { useState, useContext } from 'react';
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
import MemeVoteModal from './MemeVoteModal';
import { Intro } from './Intro';
import { useScrollToTopOnFirstPage } from '../../state/pool';
import UserRankingModal from './UserRankingModal';
import MemeAirdropListForPc from './memeAirdropListForPc';
import VoteDetailsModal from './VoteDetailsModal';
import StakingChart from './StakingChart';
import { useHistory } from 'react-router-dom';
import { WalletContext } from '../../utils/wallets-integration';

const Staking = () => {
  const is_mobile = isMobile();
  const history = useHistory();
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const [isMemeVoteOpen, setIsMemeVoteOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isUserRanking, setUserRanking] = useState(false);
  const [isShowAirdropModal, setShowAirdropModal] = useState(false);
  const [isShowVoteDetailsModal, setVoteDetailsModal] = useState(false);
  const { currentPage, introRef, hasGuided } = useScrollToTopOnFirstPage();
  const { globalState } = useContext(WalletContext);
  const [showRank, setShowRank] = useState(false);
  const isSignedIn = globalState.isSignedIn;
  return (
    <div className="mt-16 flex text-white xsm:block xsm:pl-0 xsm:pr-0">
      <div className="flex-1 text-center pb-4 mr-4 xsm:pr-0 xsm:pb-0 xsm:text-left xsm:mb-14 xsm:mr-0">
        <div className="text-26px mb-10 gotham_bold xsm:text-xl xsm:ml-8 xsm:mb-5">
          Meme staking
        </div>
        <div className="xsm:bg-memeStakingBgColor xsm:border xsm:border-memeBorderColor xsm:rounded-2xl xsm:pt-12 xsm:pb-8 xsm:px-11">
          <div className="mb-24 xsm:mb-9" style={{ height: '285px' }}>
            <StakingChart chartType="meme" />
          </div>
          <div className="lg:flex lg:justify-center xsm:-mx-5">
            <div
              className="lg:w-32 lg:mr-4 xsm:mb-4 bg-greenLight rounded-lg h-12 flex items-center justify-center text-black text-base cursor-pointer gotham_bold"
              onClick={() => {
                setIsMemeVoteOpen(true);
              }}
            >
              Vote
            </div>
            <div
              className="lg:w-32 xsm:mb-4 lg:mr-4 border border-greenLight bg-memeDarkColor rounded-lg h-12 flex items-center cursor-pointer justify-center text-greenLight text-base gotham_bold"
              onClick={() => setUserRanking(true)}
            >
              Rank
            </div>
            {/* <div className="relative">
              <div
                className="opacity-30 lg:w-32 xsm:mb-4 lg:mr-4 border border-greenLight bg-memeDarkColor 
            rounded-lg h-12 flex items-center cursor-not-allowed justify-center text-greenLight text-base gotham_bold"
                onMouseEnter={() => setShowRank(true)}
                onMouseLeave={() => setShowRank(false)}
              >
                Rank
              </div>
              {showRank && (
                <div
                  className="absolute -top-4 right-6 flex items-center justify-center 
                bg-cardBg border border-primaryText text-farmText rounded-md py-1.5 px-2 text-xs z-50 xsm:top-8"
                  onMouseLeave={() => setShowRank(false)}
                >
                  <p>Coming soon</p>
                </div>
              )}
            </div> */}
            <div
              className="lg:w-32  border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex cursor-pointer 
              items-center justify-center text-white text-base gotham_bold xsm:hidden"
              onClick={() => setShowAirdropModal(true)}
            >
              <CoinPc />
              <p className="ml-2">Airdrop</p>
            </div>
            <div
              className="lg:hidden border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex cursor-pointer 
              items-center justify-center text-white text-base gotham_bold xsm:border-none xsm:bg-transparent xsm:h-auto"
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
      <div className="flex-1 text-center pb-4 xsm:pl-0 xsm:pb-0 xsm:text-left">
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
        <div className="xsm:bg-memeStakingBgColor xsm:border xsm:border-memeBorderColor xsm:rounded-2xl xsm:pt-8 xsm:pb-8 xsm:px-11">
          <div className="lg:hidden mb-3 flex flex-col items-center">
            <div className="text-base text-primaryText">Current Round:</div>
            <div className="text-lg mb-4">2024/07/06-2024/08/05</div>
            {/* <div className="text-base text-primaryText">Next Round:</div>
            <div className="text-lg mb-6">2024/07/06-2024/08/05</div> */}
          </div>
          <div className="mb-6" style={{ height: '285px' }}>
            <StakingChart chartType="xref" />
          </div>
          <div className="flex justify-between mb-6 px-16 xsm:hidden">
            <div className="text-left ">
              <p className="text-sm text-primaryText mb-2">Current Round:</p>
              <div className="text-sm ">2024/07/06-2024/08/05</div>
            </div>
            {/* <div className="text-left">
              <p className="text-sm text-primaryText mb-2">Next Round:</p>
              <div className="text-sm ">2024/07/06-2024/08/05</div>
            </div> */}
          </div>
          {!hasGuided &&
            (currentPage === 1 || currentPage === 2) &&
            !is_mobile &&
            isSignedIn && (
              <div className="relative" ref={introRef}>
                <Intro
                  top={currentPage === 1 ? -264 : -240}
                  left={currentPage === 1 ? 230 : 170}
                >
                  <div
                    className="flex justify-center"
                    style={{
                      width: '33.875rem',
                    }}
                  >
                    <div className="w-32 mr-4 border border-swapCardBorder bg-memeModelgreyColor rounded-lg h-12 flex items-center justify-center text-white text-base">
                      Detail
                    </div>
                    <div className="w-32 mr-4 bg-greenLight rounded-lg h-12 flex items-center justify-center text-black text-base">
                      Vote
                    </div>
                    <div className="w-32 border border-greenLight bg-memeDarkColor rounded-lg h-12 flex items-center justify-center text-greenLight text-base">
                      Donate
                    </div>
                  </div>
                </Intro>
              </div>
            )}
          <div className="lg:flex lg:justify-center xsm:-mx-5">
            <div
              className="lg:w-32 lg:mr-4 xsm:hidden border border-swapCardBorder bg-memeModelgreyColor 
              rounded-lg h-12 flex items-center cursor-pointer justify-center text-white text-base gotham_bold"
              onClick={() => {
                setVoteDetailsModal(true);
              }}
            >
              Detail
            </div>
            <div
              className="lg:w-32 lg:mr-4 xsm:mb-4 bg-greenLight rounded-lg h-12 flex items-center justify-center text-black text-base cursor-pointer gotham_bold"
              onClick={() => {
                setIsVoteOpen(true);
              }}
            >
              Vote
            </div>
            <div
              className="lg:w-32 xsm:w-full xsm:mb-4 border border-greenLight bg-memeDarkColor rounded-lg h-12 flex items-center 
              justify-center text-greenLight text-base cursor-pointer gotham_bold"
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
      {isMemeVoteOpen ? (
        <MemeVoteModal
          isOpen={isMemeVoteOpen}
          onRequestClose={() => {
            setIsMemeVoteOpen(false);
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
