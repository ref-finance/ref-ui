import React from 'react';
import Banner from '../components/meme/Banner';
import { isMobile } from '../utils/device';
import { MemeContextProvider } from '../components/meme/context';
import MobileBanner from '../components/meme/MobileBanner';
import VoteXrefBox from '../components/meme/VoteXrefBox';
import VoteXrefBoxTop from '../components/meme/VoteXrefBoxTop';

export default function MemePage() {
  const is_mobile = isMobile();
  return (
    <MemeContextProvider>
      <div className="-mt-12 xsm:mt-0">
        {is_mobile ? <MobileBanner /> : <Banner />}
        <div className="m-auto lg:w-5/6 mt-20" style={{ maxWidth: '1100px' }}>
          <VoteXrefBoxTop />
          <VoteXrefBox />
        </div>
      </div>
    </MemeContextProvider>
  );
}
