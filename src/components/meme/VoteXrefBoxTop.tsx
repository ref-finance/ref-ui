import React, { useEffect, useState } from 'react';
import VoteBox from './VoteBox';
import DonateBox from './DonateBox';
import { isMobile } from '../../utils/device';
import QuestionMark from 'src/components/farm/QuestionMark';
import CustomTooltip from '../customTooltip/customTooltip';
function VoteXrefBoxTop() {
  const [voteTab, setVoteTab] = useState<'vote' | 'donate'>('vote');
  const startTime = '2024-05-01 08:00:00';
  const [isActivityOn, setIsActivityOn] = useState(
    new Date().getTime() - new Date(startTime).getTime() >= 0
  );
  const cardWidth = isMobile() ? '95vw' : '25vw';
  useEffect(() => {
    if (!isActivityOn) {
      const intervalId = setInterval(() => {
        if (new Date().getTime() - new Date(startTime).getTime() >= 0) {
          setIsActivityOn(true);
        }
      }, 1000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isActivityOn]);
  function filterVoteTip() {
    return `
    <div class="flex items-center text-navHighLightText text-xs text-left w-48 gotham_font">
      Filter MemeSeason Participants
    </div>
    `;
  }
  function xRefVoteTip() {
    return `
    <div class="flex items-center text-navHighLightText text-xs text-left w-48 gotham_font">
        Determine the distribution ratio for Ref rewards
    </div>
    `;
  }
  function MeMeVoteTip() {
    return `
    <div class="flex items-center text-navHighLightText text-xs text-left w-48 gotham_font">
        Determine the distribution ratio for Near rewards
    </div>
    `;
  }
  function memeCompetitionTip() {
    return `
    <div class="flex items-center text-navHighLightText text-xs text-left w-48 gotham_font">
        Determine the distribution ratio for the next round
    </div>
    `;
  }
  return (
    <div className="flex lg:items-start lg:justify-between gap-14 xsm:flex-col xsm:items-center">
      {/* Date */}
      <div className="xsm:px-5">
        <div>
          <p className="gotham_bold text-4xl text-white xsm:text-center">
            Vote for Meme by xREF
          </p>
          <p className="text-base text-primaryText xsm:text-center">
            Vote for your favorite Meme by staking xREF. The Top 5 Memes will
            advance to the next round of the ‘Meme Competition’.
          </p>
        </div>
        <div className="my-8">
          <p className="gotham_bold text-4xl text-white xsm:text-center">
            Donate Instructions
          </p>
          <p className="text-base text-primaryText xsm:text-center">
            All donated tokens will be added by Ref to the corresponding xRef
            Farming Pool for MemeToken within 1-2 days. The farming release
            period is set for 1 month. Users staking xRef in the corresponding
            MemeToken will receive these donations.
          </p>
        </div>
        <div className="my-8">
          <p className="text-base text-primaryText xsm:text-center">
            xRef Vote Time:
          </p>
          <p className="flex items-center xsm:justify-center gap-1 gotham_bold text-xl text-white xsm:text-center">
            05/01 UTC 0 - 05/03 UTC 0
            <div
              className="text-white text-right ml-1"
              data-class="reactTip"
              data-tooltip-id="filterVoteTipId"
              data-place="top"
              data-tooltip-html={filterVoteTip()}
            >
              <QuestionMark></QuestionMark>
              <CustomTooltip id="filterVoteTipId" />
            </div>
          </p>
          <p className="flex items-center xsm:justify-center gap-1 gotham_bold text-xl text-white xsm:text-center">
            05/03 UTC 0 - 05/04 UTC 0
            <div
              className="text-white text-right ml-1"
              data-class="reactTip"
              data-tooltip-id="xRefVoteTipId"
              data-place="top"
              data-tooltip-html={xRefVoteTip()}
            >
              <QuestionMark></QuestionMark>
              <CustomTooltip id="xRefVoteTipId" />
            </div>
          </p>
        </div>
        <div className="my-8">
          <p className="gap-1 text-base text-primaryText xsm:text-center">
            Meme Vote Time:
          </p>
          <p className="flex items-center xsm:justify-center  gotham_bold text-xl text-white xsm:text-center">
            05/03 UTC 0 - 05/04 UTC 0
            <div
              className="text-white text-right ml-1"
              data-class="reactTip"
              data-tooltip-id="MeMeVoteTipId"
              data-place="top"
              data-tooltip-html={MeMeVoteTip()}
            >
              <QuestionMark></QuestionMark>
              <CustomTooltip id="MeMeVoteTipId" />
            </div>
          </p>
        </div>
        <div>
          <p className="gap-1 text-base text-primaryText xsm:text-center">
            Meme Competition:
          </p>
          <p className="flex items-center xsm:justify-center  gotham_bold text-xl text-white xsm:text-center">
            05/04 UTC 0 - 06/04 UTC 0
            <div
              className="text-white text-right ml-1"
              data-class="reactTip"
              data-tooltip-id="memeCompetitionTipId"
              data-place="top"
              data-tooltip-html={memeCompetitionTip()}
            >
              <QuestionMark></QuestionMark>
              <CustomTooltip id="memeCompetitionTipId" />
            </div>
          </p>
        </div>
      </div>
      {/* operation box */}
      <div
        className="px-5 py-6 rounded-2xl bg-swapCardGradient overflow-auto flex-shrink-0 xsm:px-2.5"
        style={{
          border: '1px solid rgba(151, 151, 151, 0.2)',
          width: cardWidth,
        }}
      >
        <div
          className="flex items-center justify-center text-xl xsm:text-base gap-16 mb-4"
          style={{ borderBottom: '1px solid #55646E' }}
        >
          <span
            onClick={() => {
              setVoteTab('vote');
            }}
            className={`flex items-center justify-center cursor-pointer w-1/2 py-2.5 ${
              voteTab == 'vote'
                ? 'text-senderHot border-b-4 border-senderHot'
                : 'text-white'
            }`}
          >
            Vote for Meme
          </span>
          <span
            onClick={() => {
              setVoteTab('donate');
            }}
            className={`flex items-center justify-center cursor-pointer w-1/2 py-2.5 ${
              voteTab == 'donate'
                ? 'text-senderHot border-b-4 border-senderHot'
                : 'text-white'
            }`}
          >
            Donate Meme
          </span>
        </div>
        {voteTab == 'vote' ? (
          <VoteBox isActivityOn={isActivityOn} />
        ) : (
          <DonateBox isActivityOn={isActivityOn} />
        )}
      </div>
    </div>
  );
}

export default VoteXrefBoxTop;
