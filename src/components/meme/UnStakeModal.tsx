import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon, TipIcon } from './icons';
import { InputAmount } from './InputBox';
import Modal from 'react-modal';
import { MemeContext } from './context';
import { toNonDivisibleNumber, toReadableNumber } from '../../utils/numbers';
import { unStake, formatSeconds } from '../../services/meme';
import {
  toInternationalCurrencySystem_number,
  formatPercentage,
} from '../../utils/uiNumber';

import { Template } from './StakeModal';

function UnStakeModal(props: any) {
  const {
    seeds,
    tokenPriceList,
    user_seeds,
    memeContractConfig,
    withdraw_list,
  } = useContext(MemeContext);
  const { delay_withdraw_sec } = memeContractConfig;
  const { isOpen, onRequestClose, seed_id } = props;
  const [amount, setAmount] = useState('');
  const [unStakeLoading, setUnStakeLoading] = useState(false);
  const seed = seeds[seed_id];
  const stakedBalance = toReadableNumber(
    seed.seed_decimal || 0,
    user_seeds[seed_id]?.free_amount || '0'
  );
  const cardWidth = isMobile() ? '90vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  const disabled =
    Big(amount || 0).lte(0) || Big(amount || 0).gt(stakedBalance);
  const feedTo = useMemo(() => {
    const to = Big(stakedBalance || 0).minus(amount || 0);
    return to;
  }, [amount, seed, user_seeds]);
  const [weightFrom, weightTo] = useMemo(() => {
    const totalTvl = Object.entries(seeds).reduce((acc, [, seed]) => {
      return acc.plus(seed.seedTvl || 0);
    }, Big(0));
    const seedTvl = seed.seedTvl;
    const deleteTvl = Big(amount || 0).mul(
      tokenPriceList[seed.seed_id]?.price || 0
    );
    const from = totalTvl.gt(0) ? Big(seedTvl).div(totalTvl).mul(100) : Big(0);
    const to = totalTvl.minus(deleteTvl).gt(0)
      ? Big(seedTvl).minus(deleteTvl).div(totalTvl.minus(deleteTvl)).mul(100)
      : Big(0);
    return [from.toFixed(), to.toFixed()];
  }, [amount, seeds]);
  const withdraw_part_status = useMemo(() => {
    if (withdraw_list[seed_id] && delay_withdraw_sec && seed_id) {
      const { apply_timestamp } = withdraw_list[seed_id];
      const unLockDate = Big(apply_timestamp)
        .div(1000000000)
        .plus(delay_withdraw_sec);
      const currentDate = Big(new Date().getTime()).div(1000);
      if (Big(unLockDate).gt(currentDate)) {
        return 'locked';
      } else {
        return 'free';
      }
    }
    return null;
  }, [withdraw_list, seed_id, delay_withdraw_sec]);
  function unStakeToken() {
    setUnStakeLoading(true);
    unStake({
      seed,
      amount: Big(toNonDivisibleNumber(seed.seed_decimal, amount)).toFixed(0),
      ...(withdraw_part_status == 'free'
        ? {
            withdrawAmount: withdraw_list[seed_id].amount,
          }
        : {}),
    });
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          // backdropFilter: 'blur(15px)',
          // WebkitBackdropFilter: 'blur(15px)',
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
              <img
                src={seed?.token_meta_data.icon}
                style={{ width: '86px', height: '86px' }}
                className="rounded-full"
              />
              <span className="text-2xl text-white gotham_bold">
                Unstake {seed?.token_meta_data.symbol}
              </span>
            </div>
            <InputAmount
              token={seed.token_meta_data}
              tokenPriceList={tokenPriceList}
              balance={stakedBalance}
              changeAmount={setAmount}
              amount={amount}
              title="Staked"
            />
            <div className="mt-4 px-2">
              <Template
                title="You feed"
                from={toInternationalCurrencySystem_number(stakedBalance)}
                to={toInternationalCurrencySystem_number(feedTo)}
              />
              <Template
                title="Gauge Weight"
                from={formatPercentage(weightFrom)}
                to={formatPercentage(weightTo)}
              />
            </div>
            {/* deep delay tip */}
            {withdraw_part_status == 'locked' ? (
              <div className="bg-memeyellowColor rounded-lg px-3 py-1.5 my-4 text-sm text-memeyellowColor bg-opacity-10">
                You have a record in the process of unstaking. If you unstake
                again, the two records will be merged and the pending time will
                be reset.
              </div>
            ) : withdraw_part_status == 'free' ? (
              <div className="bg-greenLight rounded-lg px-3 py-1.5 my-4 text-sm text-greenLight bg-opacity-10">
                You have withdrawable MemeTokens,  unstake will help you
                withdraw them simultaneously.
              </div>
            ) : null}

            <OprationButton
              minWidth="7rem"
              disabled={disabled}
              onClick={unStakeToken}
              className={`flex flex-grow items-center justify-center bg-greenLight text-boxBorder mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none ${
                disabled || unStakeLoading ? 'opacity-40' : ''
              }`}
            >
              <ButtonTextWrapper
                loading={unStakeLoading}
                Text={() => <>Unstake</>}
              />
            </OprationButton>
            {/* delay tip */}
            <div className="flex items-start gap-2 mt-4">
              <TipIcon className="flex-shrink-0 transform translate-y-1" />
              <p className="text-sm text-greenLight">
                Your vote for this period is valid and the unstaked assets will
                available to be withdrawn in {formatSeconds(delay_withdraw_sec)}
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UnStakeModal;
