import React, { useState, useContext, useMemo } from 'react';

import { isMobile } from '../../utils/device';
import Modal from 'react-modal';

import { getProgressConfig } from './ProgressConfig';
import { ModalClose } from '../../components/icon';
import { FormattedMessage } from 'react-intl';
const progressConfig = getProgressConfig();
function ComingModal(props: any) {
  const { isShowModal, onRequestClose } = props;
  return (
    <Modal
      isOpen={isShowModal}
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
          className="rounded-2xl bg-cardBg overflow-auto"
          style={{
            width: '54rem',
            maxHeight: '37rem',
            // border: '1px solid rgba(0, 198, 162, 0.5)',
          }}
        >
          {/* header */}
          <div className="px-5 xs:px-3 md:px-3 py-6  title flex items-center justify-between ">
            <div className="flex items-center">
              <label className="text-white text-xl">
                <FormattedMessage id={'Airdrop activity'}></FormattedMessage>
              </label>
            </div>
            <ModalClose className="cursor-pointer" onClick={onRequestClose} />
          </div>
          {/* body */}
          <div className="bg-memeUserStackeBgColor fccc py-6 px-6">
            <div
              style={{ width: '51rem', height: '27.375rem' }}
              className=" bg-memeModelgreyColor rounded-2xl mb-4 py-6 px-6"
            >
              111
            </div>
            <div
              style={{ width: '51rem', height: '27.375rem' }}
              className=" bg-memeModelgreyColor rounded-2xl"
            >
              111
            </div>
          </div>
          {/* {props.children} */}
        </div>
      </div>
    </Modal>
  );
}

export default ComingModal;
