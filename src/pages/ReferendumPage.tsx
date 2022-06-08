import React, { useState, useEffect, useMemo } from 'react';
import { FormattedMessage, FormattedRelativeTime } from 'react-intl';
import { WRAP_NEAR_CONTRACT_ID } from '~services/wrap-near';
import { Card } from '../components/card/Card';
import { REF_TOKEN_ID, REF_VE_CONTRACT_ID } from '../services/near';
import {
  ftGetTokenMetadata,
  TokenMetadata,
  REF_META_DATA,
} from '../services/ft-contract';
import { Images } from '~components/stableswap/CommonComp';
import { wnearMetadata } from '../services/wrap-near';
import { usePoolShare } from '../state/pool';
import { NewGradientButton } from '../components/button/Button';
import { useHistory } from 'react-router-dom';
import {
  getAccountInfo,
  getVEMetaData,
  getVEConfig,
  lockLP,
  unlockLP,
} from '../services/referendum';
import {
  ONLY_ZEROS,
  percent,
  toPrecision,
  divide,
  multiply,
} from '../utils/numbers';
import { VotingPowerIcon } from '~components/icon/Referendum';
import {
  LOVEBoosterIcon,
  PowerZone,
  LOVE_ICON,
} from '../components/icon/Referendum';
import Modal from 'react-modal';
import { CloseIcon, mapToView } from '../components/icon/Actions';
import { Symbols } from '../components/stableswap/CommonComp';
import { NewFarmInputAmount } from '~components/forms/InputAmount';
import { isMobile } from '../utils/device';
import { VEConfig } from '../services/referendum';
import { useLOVEbalance, useLOVEmeta, useMultiplier } from '~state/referendum';
import { ArrowLeftIcon } from '~components/icon/FarmBoost';
import { LeftArrowVE, RightArrowVE } from '../components/icon/Referendum';

import moment, { duration } from 'moment';
import { CheckedTick, ErrorTriangle, TipTriangle } from '~components/icon';
import { UnCheckedBoxVE } from '../components/icon/CheckBox';
import {
  toReadableNumber,
  toNonDivisibleNumber,
  calcStableSwapPriceImpact,
} from '../utils/numbers';
import Big from 'big.js';

interface AccountInfo {
  duration_sec: number;
  lpt_amount: string;
  rewards: string[];
  sponsor_id: string;
  unlock_timestamp: string;
  ve_lpt_amount: string;
}

const timeStampToDate = (ts: number) => {
  return moment(ts * 1000).format('YYYY-MM-DD');
};

const getPoolId = (env: string = process.env.NEAR_ENV) => {
  switch (env) {
    case 'pub-testnet':
      return 269;
    case 'testnet':
      return 269;
    case 'mainnet':
      return 79;
    default:
      return 79;
  }
};

const ModalWrapper = (props: Modal.Props & { title: JSX.Element | string }) => {
  const { isOpen, onRequestClose, title } = props;

  const cardWidth = isMobile() ? '90vw' : '423px';
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
        },
      }}
    >
      <Card
        width="w-full"
        className="border border-gradientFrom border-opacity-50 flex flex-col justify-center text-white"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xl ">{title}</span>

          <button className="pl-2 pb-1" onClick={onRequestClose}>
            <CloseIcon width="12" height="12" />
          </button>
        </div>

        {props.children}
      </Card>
    </Modal>
  );
};

const LockPopUp = ({
  isOpen,
  onRequestClose,
  tokens,
  lpShare,
  accountInfo,
}: {
  isOpen: boolean;
  onRequestClose: (e?: any) => void;
  tokens: TokenMetadata[];
  lpShare: string;
  accountInfo: AccountInfo;
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const [duration, setDuration] = useState<number>(0);

  const [config, setConfig] = useState<VEConfig>();

  const [termsCheck, setTermsCheck] = useState<boolean>(false);
  const preLocked = accountInfo?.unlock_timestamp;

  useEffect(() => {
    getVEConfig().then((res) => setConfig(res));
  }, []);

  const balance = useLOVEbalance();

  const { multiplier, finalAmount, appendAmount, finalLoveAmount } =
    useMultiplier({
      duration: duration || 0,
      maxMultiplier: config?.max_locking_multiplier || 20000,
      maxDuration: config?.max_locking_duration_sec || 31104000,
      amount: toNonDivisibleNumber(24, inputValue),
      lockedAmount: accountInfo?.lpt_amount || '0',
      curDuration: accountInfo?.duration_sec || 0,
      curVEAmount: accountInfo?.ve_lpt_amount || '0',
      loveBalance: balance,
    });

  const unlockTime = Number(
    new Big(preLocked || 0).div(new Big(1000000000)).toNumber().toFixed()
  );
  const leftTime = useMemo(() => {
    return unlockTime - moment().unix();
  }, [unlockTime]);

  if (!config) return null;

  const candidateDurations = [2592000, 7776000, 15552000, 31104000].filter(
    (d) => d + moment().unix() >= unlockTime
  );

  if (leftTime > 0) {
    candidateDurations.unshift(leftTime);
  }

  const showVeAmount = !ONLY_ZEROS.test(inputValue) && duration;

  const currentVeAmount = toPrecision(
    toReadableNumber(24, accountInfo?.ve_lpt_amount),
    2
  );

  const Durations = () => (
    <div className="w-full flex items-center pt-1.5">
      {candidateDurations.map((d) => {
        const base = 2592000;
        return (
          <button
            key={d}
            className={`rounded-lg  mr-2.5 hover:bg-gradientFrom  ${
              duration === d
                ? 'text-chartBg bg-gradientFrom'
                : 'text-farmText bg-black bg-opacity-20'
            } hover:text-chartBg px-3 py-1 text-xs`}
            onClick={() => setDuration(d)}
          >
            {' '}
            {d === leftTime ? (
              <span>
                {' '}
                <FormattedMessage id="keep" defaultMessage={'keep'} />
                &nbsp; {timeStampToDate(unlockTime)}{' '}
              </span>
            ) : (
              <span>
                {d / base} &nbsp;
                <FormattedMessage
                  id={d / base > 1 ? 'months' : 'month'}
                  defaultMessage={d / base > 1 ? 'months' : 'month'}
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
  return (
    <ModalWrapper
      isOpen={isOpen}
      onRequestClose={() => {
        onRequestClose();
        setInputValue('');
      }}
      title={
        <FormattedMessage id="lock_lp_tokens" defaultMessage="Lock LP Tokens" />
      }
    >
      <div className="flex flex-col text-white pt-8">
        <div className="flex items-center justify-between pb-5">
          <div className="flex items-center">
            <Images tokens={tokens} size={'7'} />
            &nbsp;
            <Symbols withArrow={false} tokens={tokens} />
          </div>
          <span>{toPrecision(lpShare, 2)}</span>
        </div>

        <NewFarmInputAmount max={lpShare} onChangeAmount={setInputValue} />

        <div className="text-sm text-farmText py-5 pb-2.5 flex items-center justify-between">
          <span>
            <FormattedMessage id="durations" defaultMessage="Durations" />
          </span>

          <span className="text-white">
            {timeStampToDate(moment().unix() + duration)}
          </span>
        </div>

        {preLocked ? (
          <div className="flex items-center pb-1.5">
            <span className="mr-1">
              <TipTriangle h="14" w="13" c="#00C6A2" />
            </span>
            <span className="text-xs text-farmText">
              <FormattedMessage
                id="ve_lock_tip"
                defaultMessage={'Cannot be earlier than current duration'}
              />
            </span>
          </div>
        ) : null}

        <Durations />

        <div className="text-sm text-farmText pt-7 pb-2.5 flex items-center justify-between">
          <span>
            <FormattedMessage id="get" defaultMessage="Get" />
          </span>

          <span className="bg-gradientFromHover rounded-md text-xs px-1 text-black">
            {showVeAmount ? multiplier.toFixed(1) + 'x' : '1.0x'}
          </span>
        </div>

        <div className="rounded-lg bg-black bg-opacity-20 pt-6 pb-5 flex items-center justify-between ">
          <div className="flex flex-col w-full items-center pl-2 border-r border-white border-opacity-10">
            <div className="flex items-center">
              {preLocked && showVeAmount ? (
                <>
                  <span className="text-farmText text-xs">
                    {currentVeAmount}
                  </span>

                  <span className="mx-3">
                    <RightArrowVE />
                  </span>
                </>
              ) : null}
              <span className="text-lg">
                {showVeAmount ? finalAmount : '0'}
              </span>
            </div>
            <span className="pt-1 text-sm text-farmText">veLPT</span>
          </div>
          <div className="flex flex-col w-full items-center pr-2">
            <div className="flex items-center">
              {preLocked && showVeAmount ? (
                <>
                  <span className="text-farmText text-xs">
                    {toPrecision(balance, 2)}
                  </span>
                  <span className="mx-3">
                    <RightArrowVE />
                  </span>
                </>
              ) : null}
              <span className="text-lg">
                {showVeAmount ? finalLoveAmount : '0'}
              </span>
            </div>
            <span className="pt-1 text-sm text-farmText flex items-center">
              <span className="mr-1">
                <LOVE_ICON />
              </span>
              <span>LOVE</span>
            </span>
          </div>
        </div>

        {!showVeAmount ? null : (
          <div className="rounded-lg border text-sm border-gradientFrom px-3 py-2.5 mt-4 text-center">
            <span>
              <FormattedMessage
                id="existing_amount"
                defaultMessage={'Existing amount'}
              />{' '}
              <span className="text-gradientFrom">{currentVeAmount}</span> +{' '}
              <FormattedMessage
                id="append_amount"
                defaultMessage={'Append amount'}
              />{' '}
              <span className="text-gradientFrom">{appendAmount}</span>{' '}
              <FormattedMessage
                id="will_be_able_to_unstake_after"
                defaultMessage={'will be able to unstaked after'}
              />{' '}
              <span className="text-gradientFrom">
                {moment(moment().unix() * 1000 + duration * 1000).format('ll')}
              </span>
            </span>
          </div>
        )}

        <NewGradientButton
          text={<FormattedMessage id="lock" defaultMessage={'Lock'} />}
          className="mt-6 text-lg"
          onClick={() =>
            lockLP({
              token_id: ':' + getPoolId().toString(),
              amount: toNonDivisibleNumber(24, inputValue),
              duration,
            })
          }
          disabled={!termsCheck || ONLY_ZEROS.test(inputValue) || !duration}
        />

        <div className="pt-4 text-sm flex items-start ">
          <button
            onClick={() => {
              if (termsCheck) {
                setTermsCheck(false);
              } else setTermsCheck(true);
            }}
            className="w-7 h-7 relative bottom-2 mr-2 "
          >
            {termsCheck ? (
              <div
                className="p-3"
                style={{
                  width: '37px',
                  height: '37px',
                }}
              >
                <CheckedTick />
              </div>
            ) : (
              <UnCheckedBoxVE />
            )}
          </button>
          <span>
            I understand and accept the terms relating to the early unlocking
            penalty
          </span>
        </div>
      </div>
    </ModalWrapper>
  );
};

const UnLockPopUp = ({
  isOpen,
  onRequestClose,
  tokens,
  lpShare,
  accountInfo,
}: {
  isOpen: boolean;
  onRequestClose: (e?: any) => void;
  tokens: TokenMetadata[];
  lpShare: string;
  accountInfo: AccountInfo;
}) => {
  const preLocked = accountInfo?.unlock_timestamp;
  const unlockTime = Number(
    new Big(preLocked || 0).div(new Big(1000000000)).toNumber().toFixed()
  );

  const balance = useLOVEbalance();

  const currentVeAmount = toPrecision(
    toReadableNumber(24, accountInfo?.ve_lpt_amount),
    2
  );

  const lockedLPAmount = toPrecision(
    toReadableNumber(24, accountInfo?.lpt_amount),
    2
  );

  const [toUnlockAmount, setToUnlockAmount] = useState<string>('');

  console.log(toUnlockAmount);

  const currentMaxUnlock = accountInfo?.lpt_amount
    ? new Big(balance)
        .div(
          new Big(accountInfo?.ve_lpt_amount).div(
            new Big(accountInfo?.lpt_amount)
          )
        )
        .toNumber()
        .toFixed()
    : '0';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={
        <FormattedMessage
          id="unlock_lp_tokens"
          defaultMessage={'Unlock LP Tokens'}
        />
      }
    >
      <div className="flex flex-col pt-7 text-farmText text-sm">
        <div className="flex items-start justify-between">
          <span>
            <FormattedMessage
              id="currently_you_have"
              defaultMessage={'Currently you have'}
            />
          </span>

          <div>
            <div>
              <span>{currentVeAmount}</span> &nbsp; {'veLPT'}
            </div>

            <div className="pt-5">
              <span>{currentVeAmount}</span> &nbsp; {'LOVE'}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center py-5 border-b border-white border-opacity-10">
          <span>
            <FormattedMessage id="unlock_time" defaultMessage={'Unlock time'} />
          </span>

          <div>
            <span className="text-gradientFrom">
              <FormattedMessage id="expired" defaultMessage="Expired" />
            </span>
            &nbsp;
            <span>{timeStampToDate(unlockTime)}</span>
          </div>
        </div>

        <div className="flex items-center pt-7">
          <Images tokens={tokens} size={'7'} />
          &nbsp;
          <Symbols withArrow={false} tokens={tokens} />
        </div>

        <div className="flex items-center justify-end pb-3">
          <div className="text-center flex items-center flex-col mr-11">
            <span className="pb-1">{currentMaxUnlock}</span>

            <span>
              <FormattedMessage id="current" defaultMessage="Current" />
            </span>
          </div>

          <div className="text-center flex items-center flex-col">
            <span className="pb-1">{lockedLPAmount}</span>

            <span>
              <FormattedMessage id="potential" defaultMessage="Potential" />
            </span>
          </div>
        </div>

        <NewFarmInputAmount
          max={lockedLPAmount}
          value={toUnlockAmount}
          onChangeAmount={setToUnlockAmount}
        />

        <div
          className="mt-4 p-2  pb-4 flex border rounded-lg"
          style={{
            borderColor: '#2e3c45',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(50px)',
            WebkitBackdropFilter: 'blur(50px)',
          }}
        >
          <span className="mr-2">
            <TipTriangle h="14" w="13" c="#00C6A2" />
          </span>

          <span className="text-xs">
            <FormattedMessage
              id="unlock_lpt_tip"
              defaultMessage="To unlock all the veREF to get LP token back, must insure there have the same amount of LOVE token to be burned. If not, the maximum amount is  equal to the LOVE amount, or you can swap enough LOVE token "
            />
          </span>
        </div>

        <NewGradientButton
          text={<FormattedMessage id="unlock" defaultMessage={'Unlock'} />}
          className="mt-5 text-white text-lg py-4"
          onClick={() => {
            unlockLP({
              amount: toNonDivisibleNumber(24, toUnlockAmount),
            });
          }}
          disabled={
            ONLY_ZEROS.test(toUnlockAmount) ||
            new Big(toUnlockAmount).gt(lockedLPAmount)
          }
        />
      </div>
    </ModalWrapper>
  );
};

const VotingPowerCard = ({
  veShare,
  lpShare,
}: {
  veShare: string;
  lpShare: string;
}) => {
  const allZeros = ONLY_ZEROS.test(veShare) && ONLY_ZEROS.test(lpShare);

  return (
    <div className="rounded-2xl bg-veVotingPowerCard flex p-6 font-bold text-black ml-5 mb-2 h-52">
      <div className="flex flex-col">
        <span>
          <FormattedMessage id="voting_power" defaultMessage={'Voting Power'} />
        </span>

        <span className="pt-10">
          <span>
            {allZeros ? <LeftArrowVE /> : toPrecision(veShare, 2) || '0'}
          </span>
          <div className="text-sm font-normal">
            {allZeros ? (
              <FormattedMessage
                id="lock_lp_tokens_first"
                defaultMessage="Lock LP tokens first!"
              />
            ) : (
              'veLPT'
            )}
          </div>
        </span>
      </div>
      <div>
        <VotingPowerIcon />
      </div>
    </div>
  );
};

const FarmBoosterCard = ({ lpShare }: { lpShare: string }) => {
  const history = useHistory();

  const balance = useLOVEbalance();

  const allZeros = ONLY_ZEROS.test(balance) && ONLY_ZEROS.test(lpShare);

  return (
    <div className="rounded-2xl bg-veFarmBoostCard flex p-6 font-bold text-senderHot ml-5 mt-2 h-52 relative">
      <div className="flex flex-col">
        <span>
          <FormattedMessage id="farm_booster" defaultMessage={'Farm Booster'} />
        </span>

        <span className="text-white pt-10">
          <span>
            {allZeros ? (
              <LeftArrowVE stroke="#00ffd1" />
            ) : (
              toPrecision(balance, 2) || '0'
            )}
          </span>
          <div className="text-sm font-normal">
            {' '}
            {allZeros ? (
              <FormattedMessage
                id="lock_lp_tokens_first"
                defaultMessage="Lock LP tokens first!"
              />
            ) : (
              'LOVE'
            )}
          </div>
        </span>
      </div>
      <div>
        <LOVEBoosterIcon />
      </div>

      <button
        className="absolute right-4 bottom-4 font-normal text-sm"
        onClick={() => {
          history.push('/farmsBoost');
        }}
      >
        <FormattedMessage id="go_to_farm" defaultMessage="Go to farm" />
        <span className="ml-1">↗</span>
      </button>
    </div>
  );
};

const PosterCard = ({
  veShare,
  lpShare,
}: {
  veShare: string;
  lpShare: string;
}) => {
  return (
    <div className="flex flex-col text-3xl font-bold">
      <VotingPowerCard veShare={veShare} lpShare={lpShare} />
      <FarmBoosterCard lpShare={lpShare} />
    </div>
  );
};

const UserReferendumCard = ({
  veShare,
  lpShare,
  accountInfo,
}: {
  veShare: string;
  lpShare: string;
  accountInfo: AccountInfo;
}) => {
  const tokens = [REF_META_DATA, wnearMetadata];

  const [lockPopOpen, setLockPopOpen] = useState<boolean>(false);

  const [unLockPopOpen, setUnLockPopOpen] = useState<boolean>(true);

  const history = useHistory();

  const preLocked = accountInfo?.unlock_timestamp;

  const unlockTime = new Big(preLocked || 0)
    .div(new Big(1000000000))
    .toNumber();

  const lockTime = unlockTime - accountInfo?.duration_sec || 0;

  const passedTime_sec = moment().unix() - lockTime;

  return (
    <Card
      className="flex flex-col relative z-50"
      width="w-2/3"
      bgcolor="bg-veUserCard"
    >
      <span className="pb-24 text-5xl valueStyle font-bold">
        <FormattedMessage
          id="unlock_your_defi_power"
          defaultMessage="Unlock your DeFi Power"
        />
      </span>
      <div className=" flex items-center text-lg">
        <Images tokens={tokens} size="6" />
        <span className="pl-3">LP tokens</span>
      </div>

      <div className="flex items-center justify-between mt-5">
        <div className="flex flex-col">
          <span
            className={`text-3xl font-bold text-gradientFromHover ${
              ONLY_ZEROS.test(lpShare) ? 'opacity-20' : ''
            }`}
            title={lpShare}
          >
            {toPrecision(lpShare, 2)}
          </span>

          <span className="text-sm text-farmText">
            <FormattedMessage
              id="avaliable_to_lock"
              defaultMessage="Avaliable to lock"
            />
          </span>
        </div>

        <NewGradientButton
          className="text-sm px-5 py-3 w-40"
          text={
            <span>
              <FormattedMessage
                id="get_lp_tokens"
                defaultMessage="Get LP Tokens"
              />{' '}
              ↗
            </span>
          }
          onClick={() => history.push(`/pool/${getPoolId()}`)}
        />
      </div>

      <div className="flex items-center justify-between mt-5">
        <div className="flex flex-col">
          <span
            className={`text-3xl font-bold text-gradientFromHover ${
              ONLY_ZEROS.test(veShare) ? 'opacity-20' : ''
            }`}
          >
            {toPrecision(veShare, 2)}
          </span>

          <span className="text-sm text-farmText">
            <FormattedMessage id="locked" defaultMessage="Locked" />
          </span>
        </div>

        {preLocked ? (
          <div className={`flex flex-col`}>
            <div className="w-40 rounded-lg h-2">
              <div
                className="w-full rounded-lg h-2 bg-veGradient"
                style={{
                  width: `${Math.ceil(
                    passedTime_sec / accountInfo?.duration_sec
                  )}%`,
                }}
              ></div>
            </div>

            <span className="mt-2 text-sm text-farmText">
              <FormattedMessage
                id="unlock_time"
                defaultMessage={'Unlock time'}
              />{' '}
              &nbsp;
              {timeStampToDate(unlockTime)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="text-sm flex items-center pt-6">
        <NewGradientButton
          className="w-full mr-4"
          text={<FormattedMessage id="lock" defaultMessage="Lock" />}
          onClick={() => setLockPopOpen(true)}
        />

        <button
          type="button"
          className="px-5 py-3 rounded-lg w-40 flex-shrink-0"
          style={{
            backgroundColor: '#445867',
            opacity: '0.3',
          }}
          disabled={moment().unix() < unlockTime}
          onClick={() => setUnLockPopOpen(true)}
        >
          <FormattedMessage id="unlock" defaultMessage={'Unlock'} />
        </button>
      </div>

      <LockPopUp
        isOpen={lockPopOpen}
        onRequestClose={() => setLockPopOpen(false)}
        tokens={tokens}
        lpShare={lpShare}
        accountInfo={accountInfo}
      />

      <UnLockPopUp
        isOpen={unLockPopOpen}
        onRequestClose={() => setUnLockPopOpen(false)}
        tokens={tokens}
        lpShare={lpShare}
        accountInfo={accountInfo}
      />
    </Card>
  );
};

export const ReferendumPage = () => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>();
  const id = getPoolId();

  const lpShare = usePoolShare(id);

  const [veShare, setVeShare] = useState<string>('0');

  useEffect(() => {
    getAccountInfo().then((info: AccountInfo) => {
      setAccountInfo(info);
      setVeShare(toReadableNumber(24, info.ve_lpt_amount));
    });

    getVEMetaData().then((res) => console.log(res));
  }, []);

  console.log(accountInfo);

  return (
    <div className="m-auto lg:w-1024px xs:w-full md:w-5/6 text-white relative">
      <div className="m-auto text-3xl font-bold mb-1 ml-4">
        <FormattedMessage
          id="lock_your_lp_tokens"
          defaultMessage="Lock Your LP Tokens"
        />
      </div>
      <div className="w-full flex ">
        <UserReferendumCard
          veShare={veShare}
          lpShare={lpShare}
          accountInfo={accountInfo}
        />
        <PosterCard veShare={veShare} lpShare={lpShare} />
      </div>

      <div
        className="absolute -top-12 z-20"
        style={{
          right: '40%',
        }}
      >
        <PowerZone />
      </div>
    </div>
  );
};
