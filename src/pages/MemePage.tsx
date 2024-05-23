import React from 'react';
import Banner from '../components/meme/Banner';
import { isMobile } from '../utils/device';
import { MemeContextProvider } from '../components/meme/context';
import MobileBanner from '../components/meme/MobileBanner';
import Overview from '../components/meme/Overview';
import VoteXREF from '../components/meme/VoteXREF';
import SeedsBox from '../components/meme/SeedsBox';
import WithdrawList from '../components/meme/WithdrawList';
import Countdown from '../components/meme/countdown';

export default function MemePage() {
  const is_mobile = isMobile();
  return (
    <MemeContextProvider>
      <div className="-mt-12 xsm:mt-0">
        {is_mobile ? <MobileBanner /> : <Banner />}
        <div className="m-auto lg:w-5/6" style={{ maxWidth: '1100px' }}>
          <Overview />
          <Countdown />
          <VoteXREF />
          <SeedsBox />
          <WithdrawList />
        </div>
      </div>
    </MemeContextProvider>
  );
}
