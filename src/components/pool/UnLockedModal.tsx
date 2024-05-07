import React, { useState, useContext } from 'react';
import { ButtonTextWrapper } from 'src/components/button/Button';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon } from '../../components/meme/icons';
import { LockMiddleIcon, UnLockIcon } from './Icons';
import { GradientButton } from '../../components/button/Button';
import { toPrecision, toReadableNumber } from 'src/utils/numbers';
import { toInternationalCurrencySystem_number } from 'src/utils/uiNumber';
import { unlock_lp } from '../../services/lp-locker';
import { LockDataProvider } from './LockLP';
import Modal from 'react-modal';
function UnLockedModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const { tokens, lockedData } = useContext(LockDataProvider);
  const [unlock_loading, set_unlock_loading] = useState<boolean>(false);
  const cardWidth = isMobile() ? '95vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  const balance = toPrecision(
    toReadableNumber(24, lockedData?.locked_balance || '0'),
    8
  );
  function unlock() {
    set_unlock_loading(true);
    unlock_lp({
      token_id: lockedData.token_id,
      amount: lockedData.locked_balance,
    });
  }

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
      <div
        className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-swapCardGradient overflow-auto xsm:py-4"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
          border: '1px solid rgba(151, 151, 151, 0.2)',
        }}
      >
        <div className="title flex items-center justify-between">
          <span className="text-lg text-white gotham_bold">Unlock</span>
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <div>
          <div className="text-sm text-primaryText mt-7">
            <span>My locking</span>
          </div>
          <div
            className="flex items-center justify-between rounded-2xl bg-primaryText bg-opacity-20 px-3 mt-4"
            style={{ height: '60px' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-white gotham_bold text-2xl">{balance}</span>
              <LockMiddleIcon />
            </div>
            <div className="flex items-center flex-shrink-0 bg-primaryText bg-opacity-10 rounded-full p-1">
              {tokens.map((token) => {
                return (
                  <img
                    key={token.id}
                    src={token.icon}
                    className="w-7 h-7 rounded-full"
                  />
                );
              })}
            </div>
          </div>
          {/* button */}
          <GradientButton
            onClick={unlock}
            color="#fff"
            loading={unlock_loading}
            btnClassName={unlock_loading ? 'cursor-not-allowed' : ''}
            className={`flex-shrink-0 mt-6 h-12 text-center text-sm text-white focus:outline-none font-semibold`}
          >
            <ButtonTextWrapper
              loading={unlock_loading}
              Text={() => (
                <div className="flex items-center justify-center gap-2 text-base">
                  <UnLockIcon />
                  Unlock
                </div>
              )}
            />
          </GradientButton>
        </div>
      </div>
    </Modal>
  );
}

export default UnLockedModal;
