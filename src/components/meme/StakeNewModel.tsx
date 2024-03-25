import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon, ArrowRightIcon, ArrowRightTopIcon } from './icons';
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
import { getMemeDataConfig } from './memeConfig';
import { TipIcon } from './icons';
const progressConfig = getMemeDataConfig();
function StakeNewModal(props: any) {
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
  console.log(seed.token_meta_data)
  console.log(tokenPriceList)
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
  const [selectedTab, setSelectedTab] = useState('first');
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
                Feed {seed?.token_meta_data.symbol} by
              </span>
            </div>
            <div className="mt-5 flex justify-between">
              <div
                className={` flex-1 ${
                  selectedTab === 'first'
                    ? 'bg-senderHot text-cardBg'
                    : 'bg-memeModelgreyColor text-white'
                } mr-4 rounded-3xl border border-memeBorderColor py-2 px-3 flex items-center justify-between cursor-pointer`}
                onClick={() => setSelectedTab('first')}
              >
                <img
                  src={seed?.token_meta_data.icon}
                  style={{ width: '26px', height: '26px' }}
                  className="rounded-full"
                />
                <span className="text-base gotham_bold ml-2">
                  {seed?.token_meta_data.symbol}
                </span>
                <span className="ml-auto">5.93M</span>
              </div>
              <div
                className={`flex-1 ${
                  selectedTab === 'second'
                    ? 'bg-senderHot text-cardBg'
                    : 'bg-memeModelgreyColor text-white'
                } rounded-3xl border border-memeBorderColor py-2 px-3 flex items-center justify-between cursor-pointer`}
                onClick={() => setSelectedTab('second')}
              >
                <img
                  src="data:image/png;base64,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"
                  style={{ width: '25px', height: '28px' }}
                  className="rounded-full"
                />
                <span className="text-base gotham_bold ml-2">xREF</span>
                <span className="ml-auto">2.93K</span>
              </div>
            </div>
            {selectedTab === 'first' ? (
              <>
                <div className="text-sm text-senderHot flex justify-end items-center mt-5">
                  <p className="mr-2">
                    Acquire ${seed?.token_meta_data.symbol}
                  </p>
                  <ArrowRightTopIcon />
                </div>
                <div className="-mt-5">
                  <InputAmount
                    token={seed.token_meta_data}
                    tokenPriceList={tokenPriceList}
                    balance={balance}
                    changeAmount={setAmount}
                    amount={amount}
                  />
                </div>
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
                    The unstaked ${seed?.token_meta_data.symbol} will available
                    to be withdrawn in {formatSeconds(delay_withdraw_sec)}.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-senderHot flex justify-end items-center mt-5">
                  <p className="mr-2">Acquire $xREF</p>
                  <ArrowRightTopIcon />
                </div>
                <div className="-mt-5">
                  <InputAmount
                    token={seed.token_meta_data}
                    tokenPriceList={tokenPriceList}
                    balance={balance}
                    changeAmount={setAmount}
                    amount={amount}
                  />
                </div>
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
                    The unstaked $xREF will available to be withdrawn in 24
                    hours.
                  </p>
                </div>
              </>
            )}
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

export default StakeNewModal;
