import React, { useState } from 'react';
import Modal from 'react-modal';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon } from './icons';
function RuleModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const cardWidth = isMobile() ? '90vw' : '324px';
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
        className="p-5 text-sm text-v3SwapGray bg-senderHot rounded-2xl"
        style={{
          width: cardWidth,
          background: 'linear-gradient(180deg, #213441 0%, #15242F 100%)',
        }}
      >
        <div className="title flex items-center justify-between">
          <div className="text-white text-base gotham_bold">
            Meme Competition Rules
          </div>
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <p className="mt-4">
          Vote for your favorite Meme by staking xREF. The Top 5 Memes will
          advance to the next round of the ‘Meme Competition’.
        </p>
      </div>
    </Modal>
  );
}

export default RuleModal;
