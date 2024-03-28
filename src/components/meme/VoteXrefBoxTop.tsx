import React, { useState } from 'react';
import VoteBox from './VoteBox';
import DonateBox from './DonateBox';
function VoteXrefBoxTop() {
  const [voteTab, setVoteTab] = useState<'vote' | 'donate'>('vote');
  return (
    <div className="flex items-start justify-between gap-14">
      <div className="transform translate-y-9">
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
      <div>
        <div className="flex items-center justify-center text-2xl gap-16 mb-4">
          <span
            onClick={() => {
              setVoteTab('vote');
            }}
            className={`cursor-pointer ${
              voteTab == 'vote'
                ? 'text-white border-b-4 border-white'
                : 'text-primaryText'
            }`}
          >
            Vote
          </span>
          <span
            onClick={() => {
              setVoteTab('donate');
            }}
            className={`cursor-pointer ${
              voteTab == 'donate'
                ? 'text-white border-b-4 border-white'
                : 'text-primaryText'
            }`}
          >
            Donate
          </span>
        </div>
        {voteTab == 'vote' ? <VoteBox /> : <DonateBox />}
      </div>
    </div>
  );
}

export default VoteXrefBoxTop;
