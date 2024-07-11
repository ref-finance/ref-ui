import React, { useEffect, useState, useRef } from 'react';
import VoteSheet from './VoteSheet';
import VotersSheet from './VotersSheet';
import { isMobile } from '../../utils/device';
const VoteXREF = () => {
  const [activeTab, setActiveTab] = useState('vote');
  const is_mobile = isMobile();
  return (
    <div className="mt-12 rounded-2xl border border-memeBorderColor xsm:mx-3">
      <div className="border-b border-memeBorderColor pt-8 bg-memeVoteBgColor rounded-t-2xl pl-14 text-primaryText flex item-center text-2xl gotham_bold xsm:text-lg xsm:flex xsm:justify-center xsm:items-center xsm:px-4 xsm:gap-4 xsm:pt-6">
        <div
          className={`pb-3.5 mr-24 cursor-pointer xsm:mr-0 xsm:px-4 whitespace-nowrap ${
            activeTab === 'vote' ? 'text-white border-b-4 border-white' : ''
          }`}
          onClick={() => setActiveTab('vote')}
        >
          Vote by xREF
        </div>
        <div
          className={`pb-3.5 mr-24 cursor-pointer xsm:mr-0 xsm:px-4 whitespace-nowrap ${
            activeTab === 'love' ? 'text-white border-b-4 border-white' : ''
          }`}
          onClick={() => setActiveTab('love')}
        >
          {is_mobile ? 'Donate Meme' : 'Show love for voters'}
        </div>
      </div>
      <div className="py-7 px-8 bg-memeVoteBgColor rounded-b-2xl xsm:px-0">
        <VoteSheet hidden={activeTab === 'vote' ? false : true} />
        <VotersSheet hidden={activeTab !== 'vote' ? false : true} />
      </div>
    </div>
  );
};
export default VoteXREF;
