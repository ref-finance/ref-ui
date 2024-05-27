import React, { useEffect, useState } from 'react';
import Banner from '../components/meme/Banner';
import { isMobile } from '../utils/device';
import { MemeContextProvider } from '../components/meme/context';
import MobileBanner from '../components/meme/MobileBanner';
import Overview from '../components/meme/Overview';
import VoteXREF from '../components/meme/VoteXREF';
import SeedsBox from '../components/meme/SeedsBox';
import WithdrawList from '../components/meme/WithdrawList';
import { BeginerGuideProvider } from '../components/meme/BeginerGuideModal';
export default function MemePage() {
  const is_mobile = isMobile();
  // const [modalIsOpen, setModalIsOpen] = useState(true);
  // useEffect(() => {
  //   const showModal = localStorage.getItem('hasGotBeginerGuide');
  //   if (!showModal || showModal == 'false') {
  //     setModalIsOpen(true);
  //   }
  // }, []);
  useEffect(() => {
    localStorage.setItem('IntroPage', '1');
  }, []);

  return (
    <MemeContextProvider>
      {/* <BeginerGuideProvider> */}
      <div className="-mt-12 xsm:mt-0">
        {is_mobile ? <MobileBanner /> : <Banner />}
        <div className="m-auto lg:w-5/6" style={{ maxWidth: '1100px' }}>
          <Overview />
          <VoteXREF />
          <SeedsBox />
          <WithdrawList />
        </div>
      </div>
      {/* <BeginerGuideModal
        isOpen={modalIsOpen}
        setModalIsOpen={() => setModalIsOpen(false)}
      ></BeginerGuideModal> */}
      {/* </BeginerGuideProvider> */}
    </MemeContextProvider>
  );
}
