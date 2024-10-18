import React, { useState } from 'react';
import { BannerCoreBtnIconBg } from './icons';
import RuleModal from './RuleModal';
import CheckIn from './CheckIn';

const Banner = () => {
  const [isOpen, setIsOpen] = useState(false);
  function showRule() {
    setIsOpen(true);
  }
  function closeRule() {
    setIsOpen(false);
  }
  return (
    <div className="relative flex items-center justify-center w-full mb-16">
      <img
        className="relative w-full z-10"
        src="https://img.ref.finance/images/memeBannerPc_10months3.png"
      />
      <div className="absolute right-60 bottom-60 z-10 gap-7">
        <div
          className="bg-bannerBtnBgColor py-2 px-5 flex items-center cursor-pointer"
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
      </div>
      <div className="absolute right-60 bottom-10 z-10">
        <CheckIn />
      </div>
      <RuleModal isOpen={isOpen} onRequestClose={closeRule} />
    </div>
  );
};

export default Banner;
