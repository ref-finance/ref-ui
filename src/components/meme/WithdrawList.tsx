import React, { useState, useContext } from 'react';
import Big from 'big.js';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { toInternationalCurrencySystem_number } from '../../utils/uiNumber';
import { toReadableNumber } from '../../utils/numbers';
import { MemeContext } from './context';
import { withdraw } from '../../services/meme';

const WithdrawList = () => {
  const [actionSeedId, setActionSeedId] = useState('');
  const { withdraw_list, seeds, memeConfig } = useContext(MemeContext);
  if (!memeConfig) return null;
  const { delay_withdraw_sec } = memeConfig;
  function formatSeconds(seconds) {
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    let result = '';
    if (days > 0) {
      result += days + 'd' + ' ';
    }
    if (hours > 0) {
      result += hours + 'h' + ' ';
    }
    if (minutes > 0) {
      result += minutes + 'm';
    }
    return result.trim();
  }
  function seedWithdraw(seed_id) {
    setActionSeedId(seed_id);
    withdraw({
      seed_id,
      amount: withdraw_list[seed_id].amount,
    });
  }
  if (Object.keys(withdraw_list).length == 0) return null;
  return (
    <div className="bg-swapCardGradient border border-swapCardBorder px-5 rounded-2xl mt-8">
      {Object.entries(withdraw_list).map(([seed_id, withdraw], index) => {
        const { amount, apply_timestamp } = withdraw;
        const unLockDate = Big(apply_timestamp)
          .div(1000000000)
          .plus(delay_withdraw_sec);
        const currentDate = Big(new Date().getTime()).div(1000);
        let withdraw_status: 'free' | 'locked';
        let remainingTimeStr = '';
        if (Big(unLockDate).gt(currentDate)) {
          withdraw_status = 'locked';
          const remainingTime_sec = Big(unLockDate)
            .minus(currentDate)
            .toFixed(0);
          remainingTimeStr = `in ${formatSeconds(remainingTime_sec) || '1m'}.`;
        } else {
          withdraw_status = 'free';
          remainingTimeStr = 'now!';
        }
        const seed = seeds[seed_id];
        const { seed_decimal, token_meta_data } = seed;
        const withdrawButtonDisabled = withdraw_status == 'locked';
        return (
          <div
            key={seed_id}
            style={{ height: '68px' }}
            className={`flex items-center justify-between ${
              index == Object.keys(withdraw_list).length - 1
                ? ''
                : 'border-b border-memePoolBoxBorderColor'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <img
                style={{ width: '32px', height: '32px' }}
                src={token_meta_data?.icon}
              />
              <div className="flex items-center gap-2.5 text-white text-base">
                <span className="gotham_bold">
                  {toInternationalCurrencySystem_number(
                    toReadableNumber(seed_decimal, amount)
                  )}{' '}
                  {seed?.token_meta_data?.symbol}
                </span>{' '}
                is available to be withdraw {remainingTimeStr}
              </div>
            </div>
            <OprationButton
              minWidth="7rem"
              disabled={withdrawButtonDisabled || actionSeedId == seed_id}
              onClick={() => {
                seedWithdraw(seed_id);
              }}
              className={`flex items-center justify-center bg-memeDarkColor border border-greenLight rounded-xl h-8 text-greenLight text-sm focus:outline-none ${
                withdrawButtonDisabled || actionSeedId == seed_id
                  ? 'opacity-40'
                  : ''
              }`}
            >
              <ButtonTextWrapper
                loading={actionSeedId == seed_id}
                Text={() => <>Withdraw</>}
              />
            </OprationButton>
          </div>
        );
      })}
    </div>
  );
};

export default WithdrawList;
