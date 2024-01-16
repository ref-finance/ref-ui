import React, { useState } from 'react';
import { BlackDragonIcon, LonkIcon, NekoIcon, Shitzu } from './icons';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon, ArrowRightIcon } from './icons';
import { InputAmount } from './InputBox';
import Modal from 'react-modal';

function StakeModal(props: any) {
  const { isOpen, onRequestClose, title, titleIcon } = props;
  const cardWidth = isMobile() ? '90vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div className="flex flex-col">
        <div
          className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-swapCardGradient overflow-auto"
          style={{
            width: cardWidth,
            maxHeight: cardHeight,
            border: '1px solid rgba(151, 151, 151, 0.2)',
          }}
        >
          <div className="title flex items-center justify-end">
            <ModalCloseIcon
              className="cursor-pointer"
              onClick={onRequestClose}
            />
          </div>
          <div className="mt-5">
            <div className="flex flex-col items-center gap-5">
              <BlackDragonIcon style={{ width: '86px', height: '86px' }} />
              <span className="text-2xl text-white gotham_bold">Feed LONK</span>
            </div>
            <InputAmount />
            <div className="mt-4 px-2">
              <Template title="You feed" from="0" to="56234562.25" />
              <Template title="Gauge Weight" from="64.2%" to="67.8%" />
              <Template title="Staking APR" value="23.46%" />
            </div>
            <OprationButton
              minWidth="7rem"
              disabled={false}
              onClick={() => {}}
              className={`flex flex-grow items-center justify-center bg-greenLight text-boxBorder mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none ${
                false ? 'opacity-40' : ''
              }`}
            >
              <ButtonTextWrapper loading={false} Text={() => <>Feed 🍗</>} />
            </OprationButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Template({
  title,
  from,
  to,
  value,
}: {
  title: string;
  from?: string;
  to?: string;
  value?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-primaryText">{title}</span>
      {from ? (
        <div className="flex items-center text-sm text-white gap-2">
          <span className="line-through">{from}</span>
          <ArrowRightIcon />
          <span>{to}</span>
        </div>
      ) : (
        <span className="text-sm text-white">{value}</span>
      )}
    </div>
  );
}
export default StakeModal;
