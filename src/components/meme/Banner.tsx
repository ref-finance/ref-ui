import React from 'react';
import { BannerCoreBg, BannerCoreBtnIconBg, BannerCoreTitleBg } from './icons';
import { translate } from '@near-wallet-selector/core';

const Banner = () => {
  return (
    <div
      className="relative flex items-center justify-center w-full"
      style={{ height: '800px' }}
    >
      <BannerCoreBg className="absolute top-0 w-full z-10" />
      <BannerCoreTitleBg
        className="absolute bottom-28 z-20"
        style={{ transform: 'scale(1.3)' }}
      />
      <div
        className="absolute right-60 bottom-60 z-10 bg-bannerBtnBgColor py-3.5 px-5 flex items-center cursor-pointer"
        style={{ borderRadius: '54px' }}
      >
        <BannerCoreBtnIconBg />
        <div className="ml-5 gotham_bold">
          <p className="text-xs leading-3">Meme</p>
          <p className="text-xs leading-3">Competition</p>
          <p className="text-base leading-4">Rules</p>
        </div>
      </div>
      {/* for custom */}
      {/* <div
        className="absolute hidden"
        style={{ transform: 'translate(50px, 130px)' }}
      >
        <div className="text-black italic gotham_bold text-center">
          <span className="mr-4" style={{ fontSize: '52px' }}>
            125k
          </span>
          <span style={{ fontSize: '32px' }}>Ref / month</span>
        </div>
        <div className="text-cardBg gotham_bold text-xl text-center">
          <p>When you stake your Meme tokens you can earn staking</p>
          <p>APR and compete $REF reward for your Meme farm.</p>
          <p>80% goes to farm, 20% as single token reward.</p>
        </div>
      </div> */}
    </div>
  );
};

export default Banner;
