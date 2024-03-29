import React, { useState } from 'react';
import VoteBox from './VoteBox';
import DonateBox from './DonateBox';
import { isMobile } from '../../utils/device';
function VoteXrefBoxTop() {
  const [voteTab, setVoteTab] = useState<'vote' | 'donate'>('vote');
  const cardWidth = isMobile() ? '90vw' : '25vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  return (
    <div className="flex items-start justify-between gap-14">
      {/* Date */}
      <div>
        <div>
          <p className="gotham_bold text-4xl text-white">
            Vote for Meme by xREF
          </p>
          <p className="text-base text-primaryText">
            Vote for your favorite Meme by staking xREF, so that the Meme you
            support can be listed in the next round of ‘Meme Copetetion’.
          </p>
        </div>
        <div className="my-8">
          <p className="text-base text-primaryText">Vote time:</p>
          <p className="gotham_bold text-xl text-white">
            2024/04/01-2024/04/03
          </p>
        </div>
        <div>
          <p className="text-base text-primaryText">Meme Competition:</p>
          <p className="gotham_bold text-xl text-white">
            2024/04/04-2024/04/14
          </p>
        </div>
      </div>
      {/* operation box */}
      <div
        className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-swapCardGradient overflow-auto flex-shrink-0"
        style={{
          border: '1px solid rgba(151, 151, 151, 0.2)',
          width: '25vw',
        }}
      >
        <div
          className="flex items-center justify-center text-xl gap-16 mb-4"
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
