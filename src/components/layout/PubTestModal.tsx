import React, { useState } from 'react';

import { isMobile } from 'src/utils/device';
import { ModalCloseIcon } from '../meme/icons';
import Modal from 'react-modal';

export default function PubTestModal() {
  const [isOpen, setIsOpen] = useState(
    localStorage.getItem('pub-testnet-modal-show') !== '1'
  );
  function closeModal() {
    setIsOpen(false);
    localStorage.setItem('pub-testnet-modal-show', '1');
  }
  const cardWidth = isMobile() ? '95vw' : '430px';
  if (location.hostname !== 'testnet.ref.finance') return null;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        closeModal();
      }}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div
        style={{ width: cardWidth, maxHeight: '95vh' }}
        className={`outline-none bg-cardBg border border-gradientFrom border-opacity-30 overflow-auto rounded-2xl  xsm:rounded-lg p-5`}
      >
        <div className="flex justify-between mb-4">
          <span className="text-white text-2xl gotham_bold xsm:text-xl">
            public testnet
          </span>
          <ModalCloseIcon className="cursor-pointer" onClick={closeModal} />
        </div>
        <span className="text-base  text-white">
          This URL is for a public testnet, intended for testing purposes only.
          Please log in using a testnet wallet.
        </span>
      </div>
    </Modal>
  );
}
