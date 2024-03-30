import React, { useState } from 'react';
import { BannerCoreBg, BannerCoreBtnIconBg, BannerCoreTitleBg } from './icons';
import RuleModal from './RuleModal';

const Banner = () => {
  const [isOpen, setIsOpen] = useState(false);
  function showRule() {
    setIsOpen(true);
  }
  function closeRule() {
    setIsOpen(false);
  }
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
        onClick={showRule}
      >
        <BannerCoreBtnIconBg />
        <div className="ml-5 gotham_bold">
          <p className="text-xs leading-3">Meme</p>
          <p className="text-xs leading-3">Competition</p>
          <p className="text-base leading-4">Rules</p>
        </div>
      </div>
      <RuleModal isOpen={isOpen} onRequestClose={closeRule} />
    </div>
  );
};

export default Banner;
