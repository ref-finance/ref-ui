import React, { useState } from 'react';
import VoteSheet from './VoteSheet';
import VotersSheet from './VotersSheet';

const VoteXREF = () => {
  const [activeTab, setActiveTab] = useState('vote');
  return (
    <div className="mt-12 rounded-2xl border border-memeBorderColor">
      <div className="border-b border-memeBorderColor pt-8 bg-memeVoteBgColor rounded-t-2xl pl-14 text-primaryText flex item-center text-2xl gotham_bold">
        <div
          className={`pb-3.5 mr-24 cursor-pointer ${
            activeTab === 'vote' ? 'text-white border-b-4 border-white' : ''
          }`}
          onClick={() => setActiveTab('vote')}
        >
          Vote by xREF
        </div>
        <div
          className={`pb-3.5 mr-24 cursor-pointer ${
            activeTab === 'love' ? 'text-white border-b-4 border-white' : ''
          }`}
          onClick={() => setActiveTab('love')}
        >
          Show love for voters
        </div>
      </div>
      <div
        className="py-7 px-8 bg-memeVoteBgColor rounded-b-2xl "
        style={{ height: '600px' }}
      >
        <VoteSheet hidden={activeTab === 'vote' ? false : true} />
        <VotersSheet hidden={activeTab !== 'vote' ? false : true} />
      </div>
    </div>
  );
};
export default VoteXREF;
