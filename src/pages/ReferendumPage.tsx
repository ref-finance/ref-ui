import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FormattedMessage, FormattedRelativeTime, useIntl } from 'react-intl';
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
import {
  NewGradientButton,
  BorderGradientButton,
  CheckRadioButtonVE,
} from '../components/button/Button';
import { useHistory } from 'react-router-dom';
import {
  getAccountInfo,
  getVEMetaData,
  getVEConfig,
  lockLP,
  unlockLP,
} from '../services/referendum';
import { ONLY_ZEROS, percent, divide, multiply } from '../utils/numbers';
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
import {
  useLOVEbalance,
  useLOVEmeta,
  useMultiplier,
  useUnClaimedRewardsVE,
} from '~state/referendum';
import { ArrowLeftIcon } from '~components/icon/FarmBoost';
import {
  LeftArrowVE,
  RightArrowVE,
  VE_ICON,
} from '../components/icon/Referendum';

import moment, { duration } from 'moment';
import { CheckedTick, ErrorTriangle, TipTriangle } from '~components/icon';
import { UnCheckedBoxVE } from '../components/icon/CheckBox';
import {
  toReadableNumber,
  toNonDivisibleNumber,
  calcStableSwapPriceImpact,
} from '../utils/numbers';
import Big from 'big.js';
import {
  LOVE_TOKEN_DECIMAL,
  useAccountInfo,
  UnclaimedProposal,
} from '../state/referendum';
import { ProposalTab, ProposalCard } from '../components/layout/Proposal';
import { WalletContext } from '../utils/sender-wallet';
import { scientificNotationToString, toPrecision } from '../utils/numbers';
import { WarnTriangle } from '../components/icon/SwapRefresh';
import { useTokens, useTokenPriceList } from '../state/token';
import { GiftIcon, RewardCheck } from '../components/icon/Referendum';
import { toRealSymbol } from '../utils/token';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';
import {
  ConnectToNearBtnGradient,
  WithGradientButton,
} from '../components/button/Button';

export interface AccountInfo {
  duration_sec: number;
  lpt_amount: string;
  rewards: string[];
  sponsor_id: string;
  unlock_timestamp: string;
  ve_lpt_amount: string;
}

const RewardCard = ({ rewardList }: { rewardList: Record<string, string> }) => {
  const tokens = useTokens(Object.keys(rewardList));
  const tokenPriceList = useTokenPriceList();
  const [checkList, setCheckList] = useState<string[]>();

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const RewardRow = ({ id, token }: { id: string; token: TokenMetadata }) => {
    const price = tokenPriceList[id];
    const total = new Big(price).times(rewardList[id]).toNumber().toFixed(3);
    const amount = rewardList[id];
    return (
      <div className="flex items-center justify-between text-white text-sm pb-2.5">
        <div className="flex items-center px-2">
          <div
            className={`mr-2 w-4 h-4 rounde bg-opacity-30 ${
              checkList.indexOf(id) !== -1 ? 'bg-black' : 'bg-white'
            } flex items-center justify-center`}
          >
            {checkList.indexOf(id) !== -1 ? null : <RewardCheck />}
          </div>

          {token.icon ? (
            <img
              src={token.icon}
              className="rounded-full w-6 h-6 border border-gradientFrom mr-2"
            />
          ) : (
            <div className="rounded-full w-6 h-6 border border-gradientFrom mr-2"></div>
          )}

          <div className="flex flex-col">
            <span>{toRealSymbol(token.symbol)}</span>

            <span className="bg-opacity-50">${amount}</span>
          </div>
        </div>

        <div className="flex  flex-col">
          <span>{toPrecision(amount, 2)}</span>

          <span className="bg-opacity-50">${total}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="px-3 pt-3 rounded-lg bg-veGradient flex flex-col w-80 fixed top-20 right-0 text-sm">
      <div
        className="flex items-center pb-4 relative cursor-pointer"
        onClick={() => setShowDetail(!showDetail)}
      >
        <span className="mr-2">
          <GiftIcon />
        </span>

        <span>
          {Object.keys(rewardList).length}{' '}
          <FormattedMessage
            id="rewards to be withdraw"
            defaultMessage="rewards to be withdraw"
          />
          !
        </span>

        <button className="pl-1 text-sm absolute right-0">
          {showDetail ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </div>
      {!showDetail ? null : (
        <>
          <div className="bg-balck bg-opacity-30 rounded-lg pb-4">
            {tokens?.map((token) => {
              return <RewardRow id={token.id} token={token} />;
            })}
          </div>

          <div className="flex items-center justify-between pb-4">
            <button
              className={`mr-2  flex items-center justify-center`}
              onClick={() => setCheckList(tokens.map((token) => token.id))}
            >
              <div
                className={`mr-2 h-4 w-4 rounded bg-opacity-30 flex items-center justify-center ${
                  tokens?.length > 0 &&
                  tokens.every((token) => checkList.includes(token.id))
                    ? 'bg-black'
                    : 'bg-white'
                }`}
              >
                {tokens?.length > 0 &&
                tokens.every((token) => checkList.includes(token.id)) ? (
                  <RewardCheck />
                ) : null}
              </div>

              <span className="">
                <FormattedMessage id="all" defaultMessage={'all'} />
              </span>
            </button>

            <button className="px-5 py-1.5 bg-black bg-opacity-30 rounded-lg">
              <FormattedMessage id="withdraw" defaultMessage={'withdraw'} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const timeStampToDate = (ts: number) => {
  return moment(ts * 1000).format('YYYY-MM-DD');
};

export const getPoolId = (env: string = process.env.NEAR_ENV) => {
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

export const ModalWrapper = (
  props: Modal.Props & {
    title: JSX.Element | string | null;
    customWidth?: string;
    customHeight?: string;
  }
) => {
  const { isOpen, onRequestClose, title, customHeight, customWidth } = props;

  const cardWidth = isMobile() ? '90vw' : '423px';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  return (
    <Modal
      {...props}
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
      <Card
        width="w-full"
        className="border border-gradientFrom border-opacity-50 flex flex-col justify-center text-white"
        style={{
          width: customWidth || cardWidth,
          maxHeight: customHeight || cardHeight,
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

export const LockPopUp = ({
  isOpen,
  onRequestClose,
  tokens,
  lpShare,
  accountInfo,
  title,
}: {
  isOpen: boolean;
  onRequestClose: (e?: any) => void;
  tokens: TokenMetadata[];
  lpShare: string;
  accountInfo: AccountInfo;
  title?: string;
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const [duration, setDuration] = useState<number>(0);

  const [config, setConfig] = useState<VEConfig>();

  const [termsCheck, setTermsCheck] = useState<boolean>(false);
  const preLocked = Number(accountInfo?.unlock_timestamp) > 0;

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
    new Big(accountInfo?.unlock_timestamp || 0)
      .div(new Big(1000000000))
      .toNumber()
      .toFixed()
  );
  const leftTime = useMemo(() => {
    return unlockTime - moment().unix();
  }, [unlockTime]);

  if (!config) return null;

  const candidateDurations = [2592000, 7776000, 15552000, 31104000].filter(
    (d) => d + moment().unix() >= unlockTime
  );

  if (leftTime > config.min_locking_duration_sec) {
    candidateDurations.unshift(leftTime);
  }

  const showVeAmount = !ONLY_ZEROS.test(inputValue) && duration;

  const currentVeAmount = toPrecision(
    toReadableNumber(LOVE_TOKEN_DECIMAL, accountInfo?.ve_lpt_amount),
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
        <FormattedMessage
          id={title || 'lock_lp_tokens'}
          defaultMessage="Lock LP Tokens"
        />
      }
    >
      <div className="flex flex-col text-white pt-4">
        <div className="flex items-center justify-between pb-5">
          <div className="flex items-center">
            <Images tokens={tokens} size={'7'} />
            &nbsp;
            <Symbols withArrow={false} tokens={tokens} size="text-base" />
            <button
              className="text-gradientFrom pl-1 py-1"
              onClick={() => window.open(`/pool/${getPoolId()}`, '_blank')}
            >
              ↗
            </button>
          </div>
          <span>
            {!ONLY_ZEROS.test(lpShare) ? (
              toPrecision(lpShare, 2)
            ) : (
              <button
                className="text-gradientFrom"
                onClick={() => window.open(`/pool/${getPoolId()}`, '_blank')}
              >
                <FormattedMessage
                  id="get_lptoken"
                  defaultMessage={'Get LPtoken'}
                />
                &nbsp; ↗
              </button>
            )}
          </span>
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
              <span
                className={`text-lg ${
                  showVeAmount ? 'text-white' : 'text-farmText'
                } `}
              >
                {showVeAmount ? finalAmount : '0'}
              </span>
            </div>
            <span className="pt-1 text-sm text-farmText flex items-center">
              <span className="mr-1">
                <VE_ICON />
              </span>
              <span>veLPT</span>
            </span>
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
              <span
                className={`text-lg ${
                  showVeAmount ? 'text-white' : 'text-farmText'
                }`}
              >
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

        {!showVeAmount || !preLocked ? null : (
          <div className="rounded-lg border text-sm border-gradientFrom px-3 py-2.5 mt-4 text-center">
            <span>
              <FormattedMessage
                id="existing_amount"
                defaultMessage={'Existing amount'}
              />{' '}
              <span className="text-gradientFrom">
                {toPrecision(toReadableNumber(24, accountInfo.lpt_amount), 2)}
              </span>{' '}
              +{' '}
              <FormattedMessage
                id="append_amount"
                defaultMessage={'Append amount'}
              />{' '}
              <span className="text-gradientFrom">
                {toPrecision(inputValue, 2)}
              </span>{' '}
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
          text={
            ONLY_ZEROS.test(lpShare) ? (
              <FormattedMessage
                id="you_have_no_lp_share"
                defaultMessage={'You have no LPtoken'}
              />
            ) : (
              <FormattedMessage id="lock" defaultMessage={'Lock'} />
            )
          }
          className="mt-6 text-lg"
          onClick={() =>
            lockLP({
              token_id: ':' + getPoolId().toString(),
              amount: toNonDivisibleNumber(24, inputValue),
              duration,
              leftTime,
            })
          }
          disabled={
            !termsCheck ||
            ONLY_ZEROS.test(inputValue) ||
            !duration ||
            ONLY_ZEROS.test(lpShare)
          }
        />

        <div className="pt-4 text-sm flex items-start ">
          <CheckRadioButtonVE check={termsCheck} setCheck={setTermsCheck} />

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
    toReadableNumber(LOVE_TOKEN_DECIMAL, accountInfo?.ve_lpt_amount),
    2
  );

  const lockedLPAmount = toPrecision(
    toReadableNumber(24, accountInfo?.lpt_amount),
    2
  );

  const [toUnlockAmount, setToUnlockAmount] = useState<string>('');

  const [error, setError] = useState<Error>(null);

  const multiplier = preLocked
    ? new Big(accountInfo?.ve_lpt_amount).div(
        new Big(accountInfo?.lpt_amount).div(1000000)
      )
    : new Big(1);

  const currentMaxUnlock = preLocked
    ? new Big(balance).times(multiplier)
    : new Big('0');

  const reduced = new Big(toUnlockAmount || '0').div(multiplier);

  const finalve = scientificNotationToString(
    new Big(
      toReadableNumber(LOVE_TOKEN_DECIMAL, accountInfo?.ve_lpt_amount || '0')
    )
      .minus(reduced)
      .toString()
  );

  const finalLove = scientificNotationToString(
    new Big(balance || 0).minus(reduced).toString()
  );

  const intl = useIntl();
  useEffect(() => {
    if (Number(finalLove) < 0) {
      setError(
        new Error(
          `You don’t have enough LOVE ${intl.formatMessage({ id: 'token' })}`
        )
      );
    } else if (Number(finalve) < 0) {
      setError(new Error(`You don’t have enough veLPT`));
    } else setError(null);
  }, [toUnlockAmount]);
  return (
    <ModalWrapper
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={
        <FormattedMessage
          id="unlock_lptoken"
          defaultMessage={'Unlock LPtoken'}
        />
      }
    >
      <div className="flex flex-col pt-4 text-farmText text-sm">
        <div className="flex items-center">
          <Images tokens={tokens} size={'7'} />
          &nbsp;
          <Symbols withArrow={false} tokens={tokens} size="text-base" />
        </div>

        <div className="flex flex-col pb-3 pt-5">
          <div className="text-center flex items-center  justify-between">
            <span>
              <FormattedMessage id="locked" defaultMessage="Locked" />
            </span>
            <span className="pb-1">{lockedLPAmount}</span>
          </div>
          <div className="text-center flex items-center pt-4 justify-between">
            <span>
              <FormattedMessage id="avaliable" defaultMessage="Avaliable" />
            </span>
            <span className="pb-1">
              {currentMaxUnlock.gt(0)
                ? toPrecision(
                    scientificNotationToString(currentMaxUnlock.toString()),
                    2
                  )
                : 0}
            </span>
          </div>
        </div>

        <NewFarmInputAmount
          max={scientificNotationToString(currentMaxUnlock.toString())}
          value={toUnlockAmount}
          onChangeAmount={setToUnlockAmount}
        />

        <div className="text-sm text-farmText pt-7 pb-2.5 flex items-center justify-between">
          veLPT/LOVE &nbsp;
          <FormattedMessage id="balance" defaultMessage="balance" />
        </div>

        <div className="rounded-lg bg-black bg-opacity-20 pt-6 pb-5 flex items-center justify-between ">
          <div className="flex flex-col w-full items-center pl-2 border-r border-white border-opacity-10">
            <div className="flex items-center">
              <span className="text-farmText text-xs">{currentVeAmount}</span>
              {ONLY_ZEROS.test(toUnlockAmount) ? null : (
                <>
                  <span className="mx-3">
                    <RightArrowVE />
                  </span>
                  <span
                    className={`text-lg ${
                      Number(finalve) >= 0 ? 'text-white' : 'text-warn'
                    } `}
                  >
                    {Number(Number(finalve).toFixed(24)) === 0
                      ? 0
                      : toPrecision(finalve, 2, false, false)}
                  </span>
                </>
              )}
            </div>
            <span className="pt-1 text-sm text-farmText flex items-center">
              <span className="mr-1">
                <VE_ICON />
              </span>
              <span>veLPT</span>
            </span>
          </div>
          <div className="flex flex-col w-full items-center pr-2">
            <div className="flex items-center">
              <span className="text-farmText text-xs">
                {toPrecision(balance, 2)}
              </span>
              {ONLY_ZEROS.test(toUnlockAmount) ? null : (
                <>
                  <span className="mx-3">
                    <RightArrowVE />
                  </span>
                  <span
                    className={`text-lg ${
                      Number(finalLove) >= 0 ? 'text-white' : 'text-warn'
                    } `}
                  >
                    {Number(Number(finalLove).toFixed(24)) === 0
                      ? 0
                      : toPrecision(finalLove, 2, false, false)}
                  </span>
                </>
              )}
            </div>
            <span className="pt-1 text-sm text-farmText flex items-center">
              <span className="mr-1">
                <LOVE_ICON />
              </span>
              <span>LOVE</span>
            </span>
          </div>
        </div>

        {!error ? null : (
          <div className=" text-center flex items-center justify-center pt-4">
            <span className="mr-1.5">
              <WarnTriangle />
            </span>

            <span className="text-warn">{error.message}</span>
          </div>
        )}

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
            new Big(toUnlockAmount).gt(lockedLPAmount) ||
            !!error
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

  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const [lockPopOpen, setLockPopOpen] = useState<boolean>(false);

  const [unLockPopOpen, setUnLockPopOpen] = useState<boolean>(false);

  const preLocked = Number(accountInfo?.unlock_timestamp) > 0;

  const unlockTime = new Big(accountInfo?.unlock_timestamp || 0)
    .div(new Big(1000000000))
    .toNumber();

  const lockTime = unlockTime - (accountInfo?.duration_sec || 0);

  const passedTime_sec = moment().unix() - lockTime;

  const lockedLpShare = toReadableNumber(24, accountInfo?.lpt_amount || '0');

  return (
    <Card
      className="flex flex-col relative z-50"
      width="w-2/3"
      bgcolor="bg-veUserCard"
    >
      <div className="text-3xl font-bold mb-2">
        <FormattedMessage
          id="lock_your_lp_tokens"
          defaultMessage="Lock Your LP Tokens"
        />
      </div>
      <span className="pb-20 text-5xl valueStyle font-bold">
        <FormattedMessage
          id="unlock_your_defi_power"
          defaultMessage="Unlock your DeFi Power"
        />
      </span>
      <div className=" flex items-center text-lg">
        <Images tokens={tokens} size="6" />
        <span className="mx-1"></span>
        <Symbols tokens={tokens} seperator="-" size="text-lg" />
      </div>

      <div className="flex items-center justify-between mt-8">
        <div className="flex flex-col w-full">
          <span
            className={`text-3xl font-bold text-gradientFromHover ${
              ONLY_ZEROS.test(lpShare) || !isSignedIn ? 'opacity-20' : ''
            }`}
            title={lpShare}
          >
            {isSignedIn ? toPrecision(lpShare, 2) : '-'}
          </span>

          <span className="text-sm text-farmText pt-1">
            <FormattedMessage
              id="avaliable_to_lock"
              defaultMessage="Avaliable to lock"
            />
          </span>
        </div>
        <div className="flex flex-col w-full">
          <span
            className={`text-3xl font-bold text-gradientFromHover ${
              ONLY_ZEROS.test(lockedLpShare) || !isSignedIn ? 'opacity-20' : ''
            }`}
          >
            {isSignedIn ? toPrecision(lockedLpShare, 2) : '-'}
          </span>

          <span className="text-sm text-farmText pt-1">
            <FormattedMessage id="locked" defaultMessage="Locked" />
          </span>
        </div>
      </div>

      {isSignedIn ? (
        <div className="text-base flex items-center pt-8 w-full">
          <NewGradientButton
            className="w-full mr-4"
            text={
              <FormattedMessage
                id="lock_lptoken"
                defaultMessage="Lock LPtoken"
              />
            }
            onClick={() => setLockPopOpen(true)}
          />
          {ONLY_ZEROS.test(veShare) ? null : moment().unix() > unlockTime ? (
            <BorderGradientButton
              onClick={() => setUnLockPopOpen(true)}
              text={
                <span>
                  {timeStampToDate(unlockTime)}{' '}
                  <span className="">
                    <FormattedMessage id="unlock" defaultMessage="Unlock" />
                  </span>
                </span>
              }
              className="rounded-lg w-full px-5 py-3"
              width="w-full"
            />
          ) : (
            <WithGradientButton
              text={
                <span>
                  {timeStampToDate(unlockTime)}{' '}
                  <span className="">
                    <FormattedMessage id="unlock" defaultMessage="Unlock" />
                  </span>
                </span>
              }
              className="rounded-lg w-full"
              grayDisable={moment().unix() < unlockTime}
              disabled={moment().unix() < unlockTime}
              gradientWith={`${Math.ceil(
                (passedTime_sec / accountInfo?.duration_sec) * 100
              )}%`}
            />
          )}
        </div>
      ) : (
        <ConnectToNearBtnGradient className="mt-8 py-2" />
      )}

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
  const id = getPoolId();
  const unClaimedRewards = useUnClaimedRewardsVE();
  const lpShare = usePoolShare(id);

  const { veShare, accountInfo } = useAccountInfo();

  return (
    <div className="m-auto lg:w-1024px xs:w-full md:w-5/6 text-white relative">
      <div className="w-full flex ">
        <UserReferendumCard
          veShare={veShare}
          lpShare={lpShare}
          accountInfo={accountInfo}
        />
        <PosterCard veShare={veShare} lpShare={lpShare} />
      </div>

      <ProposalCard />

      <div
        className="absolute -top-12 z-20"
        style={{
          right: '40%',
        }}
      >
        <PowerZone />
      </div>

      {!unClaimedRewards ||
      Object.keys(unClaimedRewards).length === 0 ? null : (
        <RewardCard rewardList={unClaimedRewards} />
      )}
    </div>
  );
};
