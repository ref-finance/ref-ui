import React, { useEffect, useState, useRef } from 'react';
import VoteSheet from './VoteSheet';
import VotersSheet from './VotersSheet';
import { isMobile } from '../../utils/device';
import { Intro } from './Intro';
import { introCurrentPageStore } from '../../stores/introCurrentPage';
const VoteXREF = () => {
  const [activeTab, setActiveTab] = useState('vote');
  const is_mobile = isMobile();
  // const [pageChange, setPageChange] = useState(1);
  const { currentPage } = introCurrentPageStore() as any;
  const c1Ref = useRef(null);
  const tellIntro = (key) => {
    // setPageChange(key);
  };
  useEffect(() => {
    if (currentPage === 1) {
      console.log(c1Ref);
      // console.log(c1Ref.current.getBoundingClientRect());
      // c1Ref.current.scrollIntoView({
      //   behavior: 'smooth',
      // });
      const rect = c1Ref.current.getBoundingClientRect();
      //
      const offset = window.innerHeight / 2; //
      const scrollTop = rect.top + window.pageYOffset - offset;
      //
      window.scrollTo({
        top: scrollTop,
        behavior: 'smooth', //
      });
    }
  }, [currentPage]);
  return (
    <div className="mt-12 rounded-2xl border border-memeBorderColor xsm:mx-3">
      <div className="border-b border-memeBorderColor pt-8 bg-memeVoteBgColor rounded-t-2xl pl-14 text-primaryText flex item-center text-2xl gotham_bold xsm:text-lg xsm:flex xsm:justify-center xsm:items-center xsm:px-4 xsm:gap-4 xsm:pt-6">
        {currentPage === 1 && (
          <div className="relative" ref={c1Ref}>
            <Intro
              top={-280}
              left={-10}
              page={1}
              pageChangeToParent={(key) => tellIntro(key)}
            ></Intro>
          </div>
        )}
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
