import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ModalCloseIcon } from './icons';
import { isMobile } from '../../utils/device';

const NFTTaskModal = (props: any) => {
  const { isOpen, onRequestClose, setShareButtonClicked } = props;
  const is_mobile = isMobile();
  const w = is_mobile ? '75vw' : '300px';
  function share() {
    setShareButtonClicked('1');
    onRequestClose(0);
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          overflow: 'auto',
          background: 'transparent',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div
        className="border border-memeDonateBorderColor border-opacity-20 bg-memeDonateBgColor rounded-2xl p-5 pb-6"
        style={{ width: w }}
      >
        <div className="flex items-center justify-between">
          <span className="text-white text-base">Task</span>
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <div className="flex flex-col items-center mt-3">
          <p className="text-white text-sm">
            Here is task description, Here is task description, Here is task
            description, Here is task description, Here is task description
          </p>
          <div
            onClick={share}
            style={{ width: '80px' }}
            className={`flex items-center justify-center text-sm text-senderHot rounded-md border border-senderHot h-7 cursor-pointer mt-7`}
          >
            share
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NFTTaskModal;
