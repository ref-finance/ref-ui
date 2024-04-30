import React, { useState } from 'react';
import Modal from 'react-modal';
import { isMobile } from '../../utils/device';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { ModalCloseIcon } from './icons';
function DonateTipModal(props: any) {
  const { isOpen, onRequestClose, memeSymbol, onDonate } = props;
  const [donateLoading, setDonateLoading] = useState(false);
  const cardWidth = isMobile() ? '95vw' : '327px';
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
        className="p-4 text-sm text-black bg-senderHot rounded-2xl"
        style={{
          width: cardWidth,
        }}
      >
        <div className="title flex items-center justify-between">
          <div className="text-black text-2xl gotham_bold">
            Donate Instructions
          </div>
          <ModalCloseIcon
            className="cursor-pointer text-black"
            color="black"
            onClick={onRequestClose}
          />
        </div>
        <p className="mt-4">
          Your donated Tokens will be added by Ref to the Farming Pool within
          1-2 days, rewarding holders of xRef who support {memeSymbol}.
        </p>
        <div className="flex justify-center">
          <OprationButton
            onClick={doDonate}
            className={`border border-black px-3 py-1 gotham_bold cursor-pointer rounded-md mt-2 ${
              donateLoading ? 'opacity-40' : ''
            }`}
          >
            <ButtonTextWrapper
              loading={donateLoading}
              loadingColor="#000"
              Text={() => (
                <div className="flex items-center gap-2">Got it!</div>
              )}
            />
          </OprationButton>
        </div>
      </div>
    </Modal>
  );
}

export default DonateTipModal;
