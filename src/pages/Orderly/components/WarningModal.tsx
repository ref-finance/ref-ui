import React, { useState } from 'react';
import Modal from 'react-modal';
import { isMobile } from '../../../utils/device';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { ModalCloseIcon } from '../../../components/meme/icons';
import { FaExclamationTriangle } from '../../../components/reactIcons';
// import { formatSeconds } from './tool';
function OrderlyWarningModal(props: any) {
  const { isOpen, onRequestClose, action } = props;
  const [loading, setLoading] = useState(false);
  const cardWidth = isMobile() ? '95vw' : '380px';
  function doAction(e) {
    setLoading(true);
    action(e, setLoading);
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
          <div className="flex items-center gap-1 text-white text-xl gotham_bold">
            <FaExclamationTriangle className="text-warn text-lg relative top-0.5" />{' '}
          </div>
          <ModalCloseIcon
            className="cursor-pointer text-black"
            onClick={onRequestClose}
          />
        </div>
        <div className="mt-5 mb-2 text-sm text-white gap-2">
          Orderly is leaving near, Are you sure you want to continue?
        </div>
        <div className="flex justify-center">
          <OprationButton
            onClick={doAction}
            className={`bg-senderHot px-3 py-1 gotham_bold cursor-pointer rounded-md mt-0 w-24 outline-none ${
              loading ? 'opacity-40' : ''
            }`}
          >
            <ButtonTextWrapper
              loading={loading}
              Text={() => (
                <div className="flex items-center gap-2 text-base text-boxBorder">
                  Continue
                </div>
              )}
            />
          </OprationButton>
        </div>
      </div>
    </Modal>
  );
}

export default OrderlyWarningModal;
