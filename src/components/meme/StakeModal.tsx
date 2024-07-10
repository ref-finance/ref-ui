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
import { stake, xrefStake } from '../../services/meme';
import { getMemeContractConfig } from './memeConfig';
import {
  toInternationalCurrencySystem_number,
  formatPercentage,
} from '../../utils/uiNumber';
import { Seed, FarmBoost } from '../../services/farm';
import { getMemeUiConfig } from './memeConfig';
import { TipIcon, ArrowRightTopIcon } from './icons';
import {
  memeWeight,
  formatSeconds,
  getListedMemeSeeds,
  getSeedApr,
} from './tool';
const is_mobile = isMobile();
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
const progressConfig = getMemeUiConfig();
function StakeModal(props: any) {
  const {
    seeds,
    xrefSeeds,
    user_balances,
    tokenPriceList,
    memeContractConfig,
    xrefContractConfig,
    xrefTokenId,
    allTokenMetadatas,
    memeFarmContractUserData,
    xrefFarmContractUserData,
  } = useContext(MemeContext);
  const { isOpen, onRequestClose, seed_id } = props;
  const { delay_withdraw_sec } = memeContractConfig;
  const xrefContractId = MEME_TOKEN_XREF_MAP[seed_id];
  const { delay_withdraw_sec: delay_withdraw_sec_xref } =
    xrefContractConfig[MEME_TOKEN_XREF_MAP[seed_id]];
  const { join_seeds: user_seeds } = memeFarmContractUserData;
  const { join_seeds: xref_user_seeds } =
    xrefFarmContractUserData[xrefContractId];
  const [amount, setAmount] = useState('');
  const [xrefAmount, setXrefAmount] = useState('');
  const [stakeLoading, setStakeLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'meme' | 'xref'>('meme');
  const { seed, xrefSeed } = useMemo(() => {
    return {
      seed: seeds[seed_id],
      xrefSeed: xrefSeeds[MEME_TOKEN_XREF_MAP[seed_id]],
    };
  }, [seeds, xrefSeeds]);
  const { balance, xrefBalance } = useMemo(() => {
    const balance = toReadableNumber(
      seed.seed_decimal || 0,
      user_balances[seed_id] || '0'
    );
    const xrefBalance = toReadableNumber(
      allTokenMetadatas?.[xrefTokenId]?.decimals || 0,
      user_balances[xrefTokenId] || '0'
    );
    return {
      balance,
      xrefBalance,
    };
  }, [seed, user_balances, allTokenMetadatas]);
  const [[feedFrom, feedTo], [xrefFeedFrom, xrefFeedTo]] = useMemo(() => {
    const from = toReadableNumber(
      seed.seed_decimal || 0,
      user_seeds[seed_id]?.free_amount || '0'
    );
    const to = Big(amount || 0).plus(from);
    const xrefFrom = toReadableNumber(
      xrefSeed?.seed_decimal || 0,
      xref_user_seeds?.[xrefTokenId]?.free_amount || '0'
    );
    const xrefTo = Big(xrefAmount || 0).plus(xrefFrom);
    return [
      [from, to],
      [xrefFrom, xrefTo],
    ];
  }, [amount, seed, user_seeds, xrefAmount, xrefSeed, xref_user_seeds]);
  const [weightFrom, weightTo] = useMemo(() => {
    const displayMemeSeeds = getListedMemeSeeds(seeds);
    const { seedTvl, totalTvl } = memeWeight({
      displayMemeSeeds,
      seed,
    });
    const addTvl = Big(amount || 0).mul(
      tokenPriceList[seed.seed_id]?.price || 0
    );
    const from = Big(totalTvl).gt(0)
      ? Big(seedTvl).div(totalTvl).mul(100)
      : Big(0);
    const to = Big(totalTvl).plus(addTvl).gt(0)
      ? Big(seedTvl).plus(addTvl).div(Big(totalTvl).plus(addTvl)).mul(100)
      : Big(0);
    return [from.toFixed(), to.toFixed()];
  }, [amount, seeds, seed, tokenPriceList]);
  const { trialMemeSeed, trialXrefSeed } = useMemo(() => {
    let newMemeSeed;
    let newXrefSeed;
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
      newMemeSeed = seedCopy;
    }
    if (+xrefAmount > 0 && xrefSeed) {
      const xrefSeedCopy: Seed = JSON.parse(JSON.stringify(xrefSeed));
      const addTvl = Big(tokenPriceList[xrefTokenId]?.price || 0).mul(
        xrefAmount
      );
      xrefSeedCopy.seedTvl = addTvl.add(xrefSeedCopy.seedTvl).toFixed();
      // set farm apr;
      xrefSeedCopy.farmList.forEach((farm: FarmBoost) => {
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
          .div(xrefSeedCopy.seedTvl)
          .toFixed();
      });
      newXrefSeed = xrefSeedCopy;
    }
    if (selectedTab === 'meme' && newMemeSeed) {
      return {
        trialMemeSeed: newMemeSeed,
        trialXrefSeed: xrefSeed,
      };
    } else if (selectedTab === 'xref' && newXrefSeed) {
      return {
        trialMemeSeed: seed,
        trialXrefSeed: newXrefSeed,
      };
    }
    return {
      trialMemeSeed: seed,
      trialXrefSeed: xrefSeed,
    };
  }, [amount, seed, tokenPriceList, xrefAmount, xrefSeed, selectedTab]);
  const cardWidth = isMobile() ? '100vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  const disabled =
    selectedTab === 'meme'
      ? Big(amount || 0).lte(0) || Big(amount || 0).gt(balance)
      : Big(xrefAmount || 0).lte(0) || Big(xrefAmount || 0).gt(xrefBalance);
  function stakeToken() {
    setStakeLoading(true);
    if (selectedTab === 'xref') {
      xrefStake({
        seed: xrefSeed,
        amount: Big(
          toNonDivisibleNumber(xrefSeed.seed_decimal, xrefAmount)
        ).toFixed(0),
        contractId: MEME_TOKEN_XREF_MAP[seed_id],
      });
    } else {
      stake({
        seed,
        amount: Big(toNonDivisibleNumber(seed.seed_decimal, amount)).toFixed(0),
      });
    }
  }
  const FeedIcon = progressConfig?.progress[seed_id]?.feedIcon;
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
          ...(is_mobile
            ? {
                transform: 'translateX(-50%)',
                top: 'auto',
                bottom: '32px',
              }
            : {
                transform: 'translate(-50%, -50%)',
              }),
        },
      }}
    >
      <div className="flex flex-col xsm:relative">
        <div
          className="px-5 xs:px-3 md:px-3 py-6 lg:rounded-2xl xsm:rounded-t-2xl bg-swapCardGradient overflow-auto xsm:py-4"
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
          <div
            className="mt-5 transparentScrollbar xsm:mt-4"
            style={{ maxHeight: is_mobile ? '70vh' : 'auto', overflow: 'auto' }}
          >
            <div className="flex flex-col items-center gap-5 xsm:gap-2">
              <img
                src={seed?.token_meta_data.icon}
                style={{
                  width: is_mobile ? '60px' : '86px',
                  height: is_mobile ? '60px' : '86px',
                }}
                className="rounded-full xsm:absolute xsm:-top-6 xsm:z-50"
              />
              <span className="text-2xl text-white gotham_bold xsm:text-lg">
                Feed {seed?.token_meta_data.symbol} by
              </span>
            </div>
            {/* Tab */}
            <div className="mt-5 flex justify-between">
              <div
                className={`flex-grow w-1 ${
                  selectedTab === 'meme'
                    ? 'bg-senderHot text-cardBg'
                    : 'bg-memeModelgreyColor text-white'
                } mr-4 rounded-3xl border border-memeBorderColor py-2 px-3 flex items-center justify-between cursor-pointer`}
                onClick={() => setSelectedTab('meme')}
              >
                <img
                  src={seed?.token_meta_data.icon}
                  style={{ width: '26px', height: '26px' }}
                  className="rounded-full"
                />
                <span
                  className="text-base gotham_bold ml-2 w-20 overflow-hidden whitespace-nowrap text-ellipsis xsm:hidden"
                  style={{ textOverflow: 'ellipsis' }}
                >
                  {seed?.token_meta_data.symbol}
                </span>
                <span className="ml-auto">
                  {toInternationalCurrencySystem_number(balance)}
                </span>
              </div>
              <div
                className={`flex-grow w-1 ${
                  selectedTab === 'xref'
                    ? 'bg-senderHot text-cardBg'
                    : 'bg-memeModelgreyColor text-white'
                } rounded-3xl border border-memeBorderColor py-2 px-3 flex items-center justify-between cursor-pointer`}
                onClick={() => setSelectedTab('xref')}
              >
                <img
                  src={allTokenMetadatas?.[xrefTokenId]?.icon}
                  style={{ width: '26px', height: '26px' }}
                  className="rounded-full"
                />
                <span className="text-base gotham_bold ml-2 xsm:hidden">
                  {allTokenMetadatas?.[xrefTokenId]?.symbol}
                </span>
                <span className="ml-auto">
                  {toInternationalCurrencySystem_number(xrefBalance)}
                </span>
              </div>
            </div>
            {/* Acquire Token */}
            <div className="text-sm mt-5 text-senderHot flex justify-end items-center">
              <a
                className="inline-flex items-center cursor-pointer"
                href={`${
                  selectedTab === 'meme'
                    ? `/#near|${seed?.token_meta_data.id}`
                    : '/xref'
                }`}
                target="_blank"
                rel="noreferrer"
              >
                Acquire{' '}
                {selectedTab === 'meme'
                  ? `$${seed?.token_meta_data.symbol}`
                  : '$xREF'}{' '}
                <ArrowRightTopIcon className="ml-1" />
              </a>
            </div>
            {/* Input */}
            <InputAmount
              token={seed.token_meta_data}
              tokenPriceList={tokenPriceList}
              balance={balance}
              changeAmount={setAmount}
              amount={amount}
              hidden={selectedTab === 'xref'}
            />
            <InputAmount
              token={xrefSeed.token_meta_data}
              tokenPriceList={tokenPriceList}
              balance={xrefBalance}
              changeAmount={setXrefAmount}
              amount={xrefAmount}
              hidden={selectedTab === 'meme'}
            />
            {/* Trial calculation */}
            <div className="mt-4 px-2">
              <Template
                title="You feed"
                from={toInternationalCurrencySystem_number(feedFrom)}
                to={toInternationalCurrencySystem_number(feedTo)}
                hidden={selectedTab === 'xref'}
                icon={seed?.token_meta_data?.icon}
              />
              <Template
                title="You feed"
                from={toInternationalCurrencySystem_number(xrefFeedFrom)}
                to={toInternationalCurrencySystem_number(xrefFeedTo)}
                hidden={selectedTab === 'meme'}
                icon={xrefSeed?.token_meta_data?.icon}
              />
              <Template
                title="Gauge Weight"
                from={formatPercentage(weightFrom)}
                to={formatPercentage(weightTo)}
                hidden={selectedTab === 'xref'}
              />
              <Template
                title="Staking APR"
                value={formatPercentage(getSeedApr(trialMemeSeed))}
                hidden={selectedTab === 'xref'}
              />
              <Template
                title="Staking xREF APR"
                value={formatPercentage(getSeedApr(trialXrefSeed))}
                hidden={selectedTab === 'meme'}
              />
            </div>
            {/* operation */}
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
                    Feed{' '}
                    {FeedIcon ? (
                      <FeedIcon className="w-5 h-5 relative -top-0.5" />
                    ) : null}
                  </div>
                )}
              />
            </OprationButton>
            {/* delay tip */}
            <div className="flex items-start gap-2 mt-4">
              <TipIcon className="flex-shrink-0 transform translate-y-1" />
              <p className="text-sm text-greenLight">
                The unstaked assets will available to be withdrawn in{' '}
                {selectedTab === 'meme'
                  ? formatSeconds(delay_withdraw_sec)
                  : formatSeconds(delay_withdraw_sec_xref)}
                .
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
  hidden,
  icon,
}: {
  title: string;
  from?: string;
  to?: string;
  value?: string;
  hidden?: boolean;
  icon?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${
        hidden ? 'hidden' : ''
      }`}
    >
      <span className="text-sm text-primaryText">{title}</span>
      {from ? (
        <div className="flex items-center text-sm text-white gap-2">
          <span className="flex items-center gap-1.5 line-through">
            {icon ? <img className="w-4 h-4 rounded-full" src={icon} /> : null}
            {from}
          </span>
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
