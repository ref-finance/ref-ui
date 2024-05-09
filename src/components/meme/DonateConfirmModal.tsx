import React, { useState } from 'react';
import Modal from 'react-modal';
import { isMobile } from '../../utils/device';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { ModalCloseIcon } from './icons';
function DonateConfirmModal(props: any) {
  const { isOpen, onRequestClose, amount, symbol, onDonate } = props;
  const [donateLoading, setDonateLoading] = useState(false);
  const cardWidth = isMobile() ? '95vw' : '380px';
  function doDonate() {
    setDonateLoading(true);
    onDonate();
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div
        className="border border-memeDonateBorderColor border-opacity-20 bg-memeDonateBgColor rounded-2xl p-5 pt-4 text-white"
        style={{
          width: cardWidth,
        }}
      >
        <div className="title flex items-center justify-between">
          <div className="text-white text-xl gotham_bold">
            Donation Instructions
          </div>
          <ModalCloseIcon
            className="cursor-pointer text-black"
            onClick={onRequestClose}
          />
        </div>
        <p className="mt-3 mb-2 text-sm text-white">
          Please confirm that once you execute Donate, you will lose {amount}{' '}
          {symbol}.
        </p>
        <div className="flex justify-center">
          <OprationButton
            onClick={doDonate}
            className={`bg-senderHot px-3 py-1 gotham_bold cursor-pointer rounded-md mt-2 w-20 outline-none ${
              donateLoading ? 'opacity-40' : ''
            }`}
          >
            <ButtonTextWrapper
              loading={donateLoading}
              Text={() => (
                <div className="flex items-center gap-2 text-base text-boxBorder">
                  Got it!
                </div>
              )}
            />
          </OprationButton>
        </div>
      </div>
    </Modal>
  );
}

export default DonateConfirmModal;
