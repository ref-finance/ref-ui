import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import { ButtonTextWrapper } from 'src/components/button/Button';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon, TipIcon } from '../../components/meme/icons';
import { LockLargeIcon } from './Icons';
import { GradientButton } from '../../components/button/Button';
import { toNonDivisibleNumber, toReadableNumber } from 'src/utils/numbers';
import { formatWithCommas_number } from 'src/utils/uiNumber';
import { lock_lp } from '../../services/lp-locker';
import { LockDataProvider } from './LockLP';
import RangeSlider from './RangeSlider';
import LockedConfirmModal from './LockedConfirmModal';
import Modal from 'react-modal';
function LockedModal(props: any) {
  const { isOpen, onRequestClose, is_mft_registered } = props;
  const { pool, userShares, lockedData, tokens } = useContext(LockDataProvider);
  const [sliderAmount, setSliderAmount] = useState<string>('0');
  const [amount, setAmount] = useState<string>('');
  const [months, setMonths] = useState<string | number>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const cardWidth = isMobile() ? '95vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  const balance = toReadableNumber(24, userShares);
  const [new_unlock_time_sec, isInValidMonths] = useMemo(() => {
    const new_unlock_time_sec = Big(new Date().getTime() / 1000).plus(
      +(months || 0) * 30 * 24 * 3600
    );
    const old_unlock_time_sec = lockedData?.unlock_time_sec || 0;
    return [
      new_unlock_time_sec,
      Big(months || 0).gt(0) && new_unlock_time_sec.lte(old_unlock_time_sec),
    ];
  }, [lockedData, months]);
  function lock() {
    lock_lp({
      token_id: `:${pool.id}`,
      amount: Big(toNonDivisibleNumber(24, amount)).toFixed(0),
      unlock_time_sec: +new_unlock_time_sec.toFixed(0),
      is_mft_registered,
      // unlock_time_sec: 1715094000,
    });
  }
  function changeMonths(v) {
    if (v.indexOf('.') > -1) {
      setMonths(v.substring(0, v.indexOf('.')));
    } else if (+v > 1200) return;
    else {
      setMonths(v);
    }
  }
  function changeAmount(m) {
    setAmount(m);
  }
  const disabled =
    Big(amount || 0).lte(0) ||
    Big(months || 0).lte(0) ||
    isInValidMonths ||
    Big(amount || 0).gt(balance);
  function openConfirmModal() {
    setIsConfirmOpen(true);
  }
  function closeConfirmModal() {
    setIsConfirmOpen(false);
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
          <span className="text-lg text-white gotham_bold">Lock LP</span>
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <div>
          <div className="flex items-center justify-between text-sm text-primaryText mt-7">
            <span>Balance</span>
            <span>{formatWithCommas_number(balance)}</span>
          </div>
          <div
            className="flex items-center justify-between bg-black bg-opacity-20 px-3 rounded-2xl mt-4 border border-inputV3BorderColor"
            style={{ height: '55px' }}
          >
            <input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={({ target }) => changeAmount(target.value)}
              className="text-white text-xl focus:outline-non appearance-none leading-tight px-2.5 w-full"
            ></input>
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
          {/* slider */}
          <div className="px-3">
            <RangeSlider
              setAmount={setAmount}
              balance={balance}
              sliderAmount={sliderAmount}
              setSliderAmount={setSliderAmount}
            />
          </div>
          <div className="mt-11">
            <div className="text-sm text-primaryText">Lock Period</div>
            <div
              className="flex items-center justify-between bg-black bg-opacity-20 px-3 rounded-2xl mt-4 border border-inputV3BorderColor"
              style={{ height: '55px' }}
            >
              <input
                type="number"
                placeholder="0"
                value={months}
                onChange={({ target }) => changeMonths(target.value)}
                className="text-white text-xl focus:outline-non appearance-none leading-tight px-2.5 w-full"
              ></input>
              <span className="text-base text-primaryText">Months</span>
            </div>
          </div>
          {/* waring tip */}
          <div
            className={`flex items-start gap-2 mt-4 ${
              isInValidMonths ? '' : 'hidden'
            }`}
          >
            <TipIcon className="flex-shrink-0 transform translate-y-1" />
            <p className="text-sm text-greenLight">
              The new unlock time must be longer than the old unlock time
            </p>
          </div>
          {/* button */}
          <GradientButton
            disabled={disabled}
            onClick={openConfirmModal}
            color="#fff"
            btnClassName={disabled ? 'cursor-not-allowed' : ''}
            className={`flex-shrink-0 mt-6 h-12 text-center text-sm text-white focus:outline-none font-semibold ${
              disabled ? 'opacity-40' : ''
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-base">
              <LockLargeIcon />
              Lock
            </div>
          </GradientButton>
        </div>
        {isConfirmOpen && (
          <LockedConfirmModal
            isOpen={isConfirmOpen}
            onRequestClose={closeConfirmModal}
            months={months}
            onLock={lock}
          />
        )}
      </div>
    </Modal>
  );
}

export default LockedModal;
