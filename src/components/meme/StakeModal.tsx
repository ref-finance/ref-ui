import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon, ArrowRightIcon } from './icons';
import { InputAmount } from './InputBox';
import Modal from 'react-modal';
import { MemeContext } from './context';
import { toNonDivisibleNumber, toReadableNumber } from '../../utils/numbers';
import { stake, getSeedApr, isEnded } from '../../services/meme';
import {
  toInternationalCurrencySystem_number,
  formatPercentage,
} from '../../utils/uiNumber';
import { Seed, FarmBoost } from '../../services/farm';
import { getProgressConfig } from './ProgressConfig';
import { TipIcon } from './icons';
const progressConfig = getProgressConfig();
function StakeModal(props: any) {
  const { seeds, user_balances, tokenPriceList, user_seeds, memeConfig } =
    useContext(MemeContext);
  const { delay_withdraw_sec } = memeConfig;
  const { isOpen, onRequestClose, seed_id } = props;
  const [amount, setAmount] = useState('');
  const [stakeLoading, setStakeLoading] = useState(false);
  const seed = seeds[seed_id];
  const balance = toReadableNumber(
    seed.seed_decimal || 0,
    user_balances[seed_id] || '0'
  );
  const cardWidth = isMobile() ? '90vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  const disabled = Big(amount || 0).lte(0) || Big(amount || 0).gt(balance);
  const [feedFrom, feedTo] = useMemo(() => {
    const from = toReadableNumber(
      seed.seed_decimal,
      user_seeds[seed_id]?.free_amount || '0'
    );
    const to = Big(amount || 0).plus(from);
    return [from, to];
  }, [amount, seed, user_seeds]);
  const [weightFrom, weightTo] = useMemo(() => {
    const totalTvl = Object.entries(seeds).reduce((acc, [, seed]) => {
      return acc.plus(seed.seedTvl || 0);
    }, Big(0));
    const seedTvl = seed.seedTvl;
    const addTvl = Big(amount || 0).mul(
      tokenPriceList[seed.seed_id]?.price || 0
    );
    const from = totalTvl.gt(0) ? Big(seedTvl).div(totalTvl).mul(100) : Big(0);
    const to = totalTvl.plus(addTvl).gt(0)
      ? Big(seedTvl).plus(addTvl).div(totalTvl.plus(addTvl)).mul(100)
      : Big(0);
    return [from.toFixed(), to.toFixed()];
  }, [amount, seeds]);
  const seed_new = useMemo(() => {
    const seed = seeds[seed_id];
    if (+amount > 0 && seed) {
      const seedCopy: Seed = JSON.parse(JSON.stringify(seed));
      const addTvl = Big(tokenPriceList[seed_id]?.price || 0).mul(amount);
      seedCopy.seedTvl = addTvl.add(seedCopy.seedTvl).toFixed();
      // set farm apr;
      seedCopy.farmList.forEach((farm: FarmBoost) => {
        const { reward_token, daily_reward } = farm.terms;
        const daily_reward_amount = toReadableNumber(
          farm.token_meta_data.decimals,
          daily_reward
        );
        const reward_token_price = Number(
          tokenPriceList[reward_token]?.price || 0
        );
        farm.apr = new Big(daily_reward_amount)
          .mul(reward_token_price)
          .mul(365)
          .div(seedCopy.seedTvl)
          .toFixed();
      });
      return seedCopy;
    }
    return seed;
  }, [amount, seeds, tokenPriceList]);
  function stakeToken() {
    setStakeLoading(true);
    stake({
      seed,
      amount: Big(toNonDivisibleNumber(seed.seed_decimal, amount)).toFixed(0),
    });
  }
  function formatSeconds(seconds) {
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    let result = '';
    if (days > 0) {
      result += days + ' ' + 'days' + ' ';
    }
    if (hours > 0) {
      result += hours + ' ' + 'hour' + ' ';
    }
    if (minutes > 0) {
      result += minutes + ' ' + 'min';
    }
    return result.trim();
  }
  const FeedIcon = progressConfig.progress[seed_id].feedIcon;
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
                Feed {seed?.token_meta_data.symbol}
              </span>
            </div>
            <InputAmount
              token={seed.token_meta_data}
              tokenPriceList={tokenPriceList}
              balance={balance}
              changeAmount={setAmount}
              amount={amount}
            />
            <div className="mt-4 px-2">
              <Template
                title="You feed"
                from={toInternationalCurrencySystem_number(feedFrom)}
                to={toInternationalCurrencySystem_number(feedTo)}
              />
              <Template
                title="Gauge Weight"
                from={formatPercentage(weightFrom)}
                to={formatPercentage(weightTo)}
              />
              <Template
                title="Staking APR"
                value={
                  isEnded(seed_new)
                    ? '-'
                    : formatPercentage(getSeedApr(seed_new))
                }
              />
            </div>
            <OprationButton
              minWidth="7rem"
              disabled={disabled}
              onClick={stakeToken}
              className={`flex flex-grow items-center justify-center bg-greenLight text-boxBorder mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none ${
                disabled || stakeLoading ? 'opacity-40' : ''
              }`}
            >
              <ButtonTextWrapper
                loading={stakeLoading}
                Text={() => (
                  <div className="flex items-center gap-2">
                    Feed <FeedIcon className="w-5 h-5 relative -top-0.5" />
                  </div>
                )}
              />
            </OprationButton>
            <div className="flex items-start gap-2 mt-4">
              <TipIcon className="flex-shrink-0 transform translate-y-1" />
              <p className="text-sm text-greenLight">
                the unstaked assets will available to be withdrawn in{' '}
                {formatSeconds(delay_withdraw_sec)}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function Template({
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
