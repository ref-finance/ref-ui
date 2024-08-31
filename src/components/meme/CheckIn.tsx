import React, { useState, useEffect } from 'react';
import { CheckInButtonIcon } from './icons2';
import CheckInModal from './CheckInModal';
import CheckInSuccessModal from './CheckInSuccessModal';
import _ from 'lodash';
import { useWalletSelector } from '../../context/WalletSelectorContext';
const CheckIn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { accountId } = useWalletSelector();
  useEffect(() => {
    if (accountId) {
      // TODO POST
    }
  }, [accountId]);
  function showCheckInModal() {
    setIsOpen(true);
  }
  function closeCheckInModal() {
    setIsOpen(false);
  }
  return (
    <>
      <div
        className="flex justify-center items-center relative cursor-pointer"
        style={{ width: '144px', height: '55px' }}
        onClick={showCheckInModal}
      >
        <CheckInButtonIcon className="absolute left-0 top-0" />
        <div className="relative flex flex-col z-10 pl-4">
          <span className="text-xs gotham_bold text-white">Daily Sign</span>
          <span className="text-base gotham_bold text-white">Check</span>
        </div>
      </div>
      <CheckInModal isOpen={isOpen} onRequestClose={closeCheckInModal} />
      <CheckInSuccessModal />
    </>
  );
};

export default CheckIn;
