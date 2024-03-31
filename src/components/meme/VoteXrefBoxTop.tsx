import React, { useState } from 'react';
import VoteBox from './VoteBox';
import DonateBox from './DonateBox';
import { isMobile } from '../../utils/device';
function VoteXrefBoxTop() {
  const [voteTab, setVoteTab] = useState<'vote' | 'donate'>('vote');
  const cardWidth = isMobile() ? '95vw' : '25vw';
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
            Farming Pool for MeMeToken within 1-2 days. The farming release
            period is set for 2 weeks. Users staking xRef in the corresponding
            MeMeToken will receive these donations.
          </p>
        </div>
        <div className="my-8">
          <p className="text-base text-primaryText xsm:text-center">
            Vote time:
          </p>
          <p className="gotham_bold text-xl text-white xsm:text-center">
            2024/04/01-2024/04/03
          </p>
        </div>
        <div>
          <p className="text-base text-primaryText xsm:text-center">
            Meme Competition:
          </p>
          <p className="gotham_bold text-xl text-white xsm:text-center">
            2024/04/04-2024/04/14
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
        {voteTab == 'vote' ? <VoteBox /> : <DonateBox />}
      </div>
    </div>
  );
}

export default VoteXrefBoxTop;
