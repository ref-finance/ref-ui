import React, { useState } from 'react';
import { MobileBannerCoreBtnIconBg, MobileCheckInButton } from './ani_mobile';
import RuleModal from './RuleModal';
import CheckInModal from './CheckInModal';
import CheckInSuccessModal from './CheckInSuccessModal';

const Banner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkInIsOpen, setCheckInIsOpen] = useState(false);
  function showRule() {
    setIsOpen(true);
  }
  function closeRule() {
    setIsOpen(false);
  }
  function showCheckIn() {
    setCheckInIsOpen(true);
  }
  function closeCheckIn() {
    setCheckInIsOpen(false);
  }
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative flex items-center justify-center w-full">
        <img src="https://img.ref.finance/images/memeBannerMobile3.png" />
        <div className="flex flex-col gap-3 absolute right-6 bottom-10 z-10">
          <div className="" onClick={showRule}>
            <MobileBannerCoreBtnIconBg />
          </div>
        </div>
        <RuleModal isOpen={isOpen} onRequestClose={closeRule} />
        <CheckInModal isOpen={checkInIsOpen} onRequestClose={closeCheckIn} />
        <CheckInSuccessModal />
      </div>
      <MobileCheckInButton onClick={showCheckIn} className="mt-5 mb-2" />
    </div>
  );
};

export default Banner;
