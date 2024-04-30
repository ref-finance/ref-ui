import React, { useState } from 'react';
import { MobileBannerCoreBtnIconBg } from './ani_mobile';
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
    <div className="relative flex items-center justify-center w-full">
      <img src="https://assets.ref.finance/images/memeBannerMobile3.png" />
      <div className="absolute right-6 bottom-10 z-10" onClick={showRule}>
        <MobileBannerCoreBtnIconBg />
      </div>
      <RuleModal isOpen={isOpen} onRequestClose={closeRule} />
    </div>
  );
};

export default Banner;
