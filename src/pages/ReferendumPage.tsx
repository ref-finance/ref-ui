import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FormattedMessage, FormattedRelativeTime, useIntl } from 'react-intl';
import { WRAP_NEAR_CONTRACT_ID } from '../services/wrap-near';
import { Card } from '../components/card/Card';
import {
  REF_TOKEN_ID,
  REF_VE_CONTRACT_ID,
  isRatedPool,
} from '../services/near';
import {
  ftGetTokenMetadata,
  TokenMetadata,
  REF_META_DATA,
} from '../services/ft-contract';
import { Images } from '../components/stableswap/CommonComp';
import { wnearMetadata, unwrapedNear } from '../services/wrap-near';
import { usePoolShare, useYourliquidity } from '../state/pool';
import {
  NewGradientButton,
  BorderGradientButton,
  CheckRadioButtonVE,
  ButtonTextWrapper,
} from '../components/button/Button';
import { useHistory } from 'react-router-dom';
import {
  getVEMetaData,
  getVEConfig,
  lockLP,
  unlockLP,
  withdrawRewardVE,
} from '../services/referendum';
import { ONLY_ZEROS, percent, divide, multiply } from '../utils/numbers';
import {
  RightArrowUnlockingVE,
  VEARROW,
  VotingPowerIcon,
} from '../components/icon/Referendum';
import {
  LOVEBoosterIcon,
  PowerZone,
  LOVE_ICON,
} from '../components/icon/Referendum';
import Modal from 'react-modal';
import { CloseIcon, mapToView } from '../components/icon/Actions';
import { Symbols } from '../components/stableswap/CommonComp';
import { NewFarmInputAmount } from '../components/forms/InputAmount';
import { isClientMobie, isMobile, useClientMobile } from '../utils/device';
import {
  VEConfig,
  Proposal,
  ProposalStatus,
  batchFetchProposals,
} from '../services/referendum';
import {
  useLOVEbalance,
  useLOVEmeta,
  useMultiplier,
  useUnClaimedRewardsVE,
} from '../state/referendum';
import { ArrowLeftIcon } from '../components/icon/FarmBoost';
import {
  LeftArrowVE,
  RightArrowVE,
  VE_ICON,
} from '../components/icon/Referendum';

import moment, { duration } from 'moment';
import { CheckedTick, ErrorTriangle, TipTriangle } from '../components/icon';

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
import {
  ProposalTab,
  ProposalCard,
  TIMESTAMP_DIVISOR,
} from '../components/layout/Proposal';

import { WalletContext } from '../utils/wallets-integration';

import { scientificNotationToString, toPrecision } from '../utils/numbers';
import { WarnTriangle } from '../components/icon/SwapRefresh';
import { useTokens, useTokenPriceList } from '../state/token';
import {
  GiftIcon,
  RewardCheck,
  UnLockExpiredIcon,
} from '../components/icon/Referendum';
import { toRealSymbol } from '../utils/token';
import { FaAngleUp, FaAngleDown } from '../components/reactIcons';
import {
  ConnectToNearBtnGradient,
  ConnectToNearBtnVotingMobile,
} from '../components/button/Button';
import { WithGradientButton } from '../components/button/Button';
import {
  useVEmeta,
  useVEconfig,
  useVoteDetail,
  useCounterDownVE,
} from '../state/referendum';
import { QuestionTip, ExclamationTip } from '../components/layout/TipWrapper';
import QuestionMark from '../components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { createContext } from 'react';
import { VETip } from '../components/icon/Referendum';
import { durationFomatter } from '../components/layout/Proposal';
import BigNumber from 'bignumber.js';
import { openUrl } from '../services/commonV3';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

export interface AccountInfo {
  duration_sec: number;
  lpt_amount: string;
  rewards: string[][];
  sponsor_id: string;
  unlock_timestamp: string;
  ve_lpt_amount: string;
}

const UnLockTip = () => {
  return (
    <div className="px-4  py-1.5 flex items-center justify-center bg-veGradient text-sm ">
      <span className="mr-2.5">
        <UnLockExpiredIcon />
      </span>
      <span>
        <span className="lg:hidden ">
          <FormattedMessage
            id="unlock_tip_mobile"
            defaultMessage={'Unlocking is available now!'}
          />
        </span>

        <span className="xsm:hidden">
          <FormattedMessage
            id="unlock_tip_top"
            defaultMessage={
              'Your locking has been expired, unlocking is available now!'
            }
          />
        </span>
      </span>
    </div>
  );
};

export const RewardCard = ({
  rewardList,
}: {
  rewardList: { tokenId: string; amount: string }[];
}) => {
  const length_at_once = 4;
  const tokenIds = rewardList.map(({ tokenId }) => tokenId);

  const tokens = useTokens(tokenIds);
  const tokenPriceList = useContext(ReferendumPageContext).tokenPriceList;

  const [checkList, setCheckList] = useState<string[]>([]);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const RewardRow = ({
    id,
    token,
    index,
  }: {
    id: string;
    token: TokenMetadata;
    index: number;
  }) => {
    const amount = toReadableNumber(
      token.decimals,
      rewardList[index].amount || '0'
    );

    const price = tokenPriceList?.[id]?.price;

    const total = new Big(price || 0).times(amount).toNumber().toFixed(2);

    return (
      <div className="flex items-center justify-between text-white text-sm pb-2.5">
        <div className="flex items-center px-2">
          <button
            className={`mr-2 w-4 h-4 rounded bg-opacity-30 ${
              checkList?.indexOf(id) !== -1 ? 'bg-black' : 'bg-white'
            } flex items-center justify-center`}
            onClick={() => {
              if (checkList?.indexOf(id) == -1 && checkList.length < 5) {
                setCheckList([...checkList, id]);
              } else {
                const idx = checkList.indexOf(id);
                setCheckList([
                  ...checkList.slice(0, idx),
                  ...checkList.slice(idx + 1),
                ]);
              }
            }}
          >
            {checkList?.indexOf(id) === -1 ? null : <RewardCheck />}
          </button>

          {token.icon ? (
            <img
              src={token.icon}
              className="rounded-full w-6 h-6 border border-gradientFrom mr-2"
            />
          ) : (
            <div className="rounded-full w-6 h-6 border border-gradientFrom mr-2"></div>
          )}

          <div className="flex flex-col">
            <span className="relative top-0.5">
              {toRealSymbol(token.symbol)}
            </span>

            <span className="opacity-50">${!price ? '-' : price}</span>
          </div>
        </div>

        <div className="flex  flex-col items-end">
          <span>{toPrecision(amount, 2)}</span>

          <span className="opacity-50">${!price ? '-' : total}</span>
        </div>
      </div>
    );
  };

  const isClientMobie = useClientMobile();

  return (
    <>
      <div className="px-3 xsm:w-full pt-3 xsm:pt-2 lg:top-32 xsm:mb-4  rounded-lg bg-veGradient flex flex-col w-80 absolute xsm:relative left-1/2 transform -translate-x-1/2 text-sm z-40">
        <div
          className="flex items-center pb-4 xsm:pb-2 relative  cursor-pointer "
          onClick={() => setShowDetail(!showDetail)}
        >
          <span className="mr-2">
            <GiftIcon />
          </span>

          <span>
            {Object.keys(rewardList)?.length}{' '}
            <FormattedMessage
              id="bonus_to_be_withdraw"
              defaultMessage="bonus to be withdraw"
            />
            !
          </span>

          <button className="pl-1 text-sm absolute right-0">
            {showDetail ? (
              isClientMobie ? (
                <FaAngleDown />
              ) : (
                <FaAngleUp />
              )
            ) : isClientMobie ? (
              <FaAngleUp />
            ) : (
              <FaAngleDown />
            )}
          </button>
        </div>
        {!showDetail ? null : (
          <>
            <div className="bg-chartBg bg-opacity-50 rounded-lg p-4 mb-2">
              {tokens?.map((token, i) => {
                return <RewardRow id={token.id} token={token} index={i} />;
              })}
            </div>

            <div className="flex items-center justify-between pb-4">
              <button
                className={`mr-2  flex items-center justify-center`}
                onClick={() => {
                  if (
                    checkList?.length === tokenIds?.length ||
                    checkList.length === length_at_once
                  ) {
                    setCheckList([]);
                  } else {
                    if (tokenIds.length <= length_at_once) {
                      setCheckList(tokenIds);
                    } else {
                      const candidateList = [];

                      for (let i = 0; i < tokenIds.length; i++) {
                        const id = tokenIds[i];
                        if (!checkList.includes(id)) {
                          candidateList.push(id);
                          if (
                            candidateList.length ===
                            length_at_once - checkList.length
                          ) {
                            break;
                          }
                        }
                      }
                      setCheckList([...checkList, ...candidateList]);
                    }
                  }
                }}
              >
                <button
                  className={`mr-2 h-4 w-4 rounded bg-opacity-30 flex items-center justify-center ${
                    (tokens?.length > 0 &&
                      tokens?.every((token) => checkList.includes(token.id))) ||
                    checkList.length === length_at_once
                      ? 'bg-black'
                      : 'bg-white'
                  }`}
                >
                  {(tokens?.length > 0 &&
                    tokens?.every((token) => checkList.includes(token.id))) ||
                  checkList.length === length_at_once ? (
                    <RewardCheck />
                  ) : null}
                </button>

                <span className="text-sm">
                  {Object.keys(rewardList).length > length_at_once ? (
                    <div className="flex items-center">
                      <label className="mr-1 whitespace-nowrap">
                        <FormattedMessage id="all_4_v2" />
                      </label>
                      <QuestionTip id="over_tip" color="bright" />
                    </div>
                  ) : (
                    <label className="">
                      <FormattedMessage id="all" />
                    </label>
                  )}
                </span>
              </button>

              <button
                className=" py-1.5 w-24 text-center bg-black bg-opacity-30 rounded-lg"
                onClick={() => {
                  setLoading(true);
                  withdrawRewardVE({
                    token_ids: checkList,
                    rewardList: rewardList,
                  });
                }}
                disabled={!checkList?.length}
              >
                <ButtonTextWrapper
                  Text={() => {
                    return (
                      <FormattedMessage
                        id="withdraw"
                        defaultMessage={'withdraw'}
                      />
                    );
                  }}
                  loading={loading}
                />
              </button>
            </div>
          </>
        )}
      </div>
      {!showDetail ? null : (
        <div
          className="fixed w-screen h-screen top-0 left-0 right-0 bottom-0 bg-cardBg bg-opacity-30 z-30"
          onClick={() => {
            setShowDetail(false);
          }}
        ></div>
      )}
    </>
  );
};

const timeStampToDate = (ts: number) => {
  return moment(ts * 1000).format('YYYY-MM-DD');
};

export const getVEPoolId = (env: string = process.env.REACT_APP_NEAR_ENV) => {
  switch (env) {
    case 'pub-testnet':
      return 17;
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
    overflow?: string;
  }
) => {
  const { isOpen, onRequestClose, title, customHeight, customWidth, overflow } =
    props;

  const cardWidth = isMobile() ? '90vw' : '423px';
  const cardHeight = '90vh';
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
        className="border border-gradientFrom border-opacity-50 flex overflow-y-auto overflow-x-hidden flex-col  text-white "
        style={{
          width: customWidth || cardWidth,
          maxHeight: customHeight || cardHeight,
          overflow: overflow || '',
        }}
        padding="p-6 xsm:p-4"
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
  farmStakeV1,
  farmStakeV2,
}: {
  isOpen: boolean;
  onRequestClose: (e?: any) => void;
  tokens: TokenMetadata[];
  lpShare: string;
  accountInfo: AccountInfo;
  title?: string;
  farmStakeV1?: string | number;
  farmStakeV2?: string | number;
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const config = useVEconfig();

  const [termsCheck, setTermsCheck] = useState<boolean>(false);
  const preLocked = Number(accountInfo?.unlock_timestamp) > 0;

  const balance = useLOVEbalance();

  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;
  const intl = useIntl();

  const unlockTime = Number(
    new Big(accountInfo?.unlock_timestamp || 0)
      .div(new Big(1000000000))
      .toNumber()
      .toFixed()
  );
  const leftTime = useMemo(() => {
    return unlockTime - moment().unix();
  }, [unlockTime]);

  const candidateDurations = [2592000, 7776000, 15552000, 31104000].filter(
    (d) => d + moment().unix() >= unlockTime
  );

  const [duration, setDuration] = useState<number>(
    candidateDurations?.[0] || 0
  );

  useEffect(() => {
    setDuration(candidateDurations?.[0] || 0);
  }, [candidateDurations?.length]);

  const { multiplier, finalAmount, finalLoveAmount } = useMultiplier({
    duration: duration || 0,
    maxMultiplier: config?.max_locking_multiplier || 20000,
    maxDuration: config?.max_locking_duration_sec || 31104000,
    amount: toNonDivisibleNumber(24, inputValue),
    lockedAmount: accountInfo?.lpt_amount || '0',
    curDuration: accountInfo?.duration_sec || 0,
    curVEAmount: accountInfo?.ve_lpt_amount || '0',
    loveBalance: balance,
  });
  const showVeAmount = !ONLY_ZEROS.test(inputValue) && duration;

  const currentVeAmount = toPrecision(
    toReadableNumber(LOVE_TOKEN_DECIMAL, accountInfo?.ve_lpt_amount),
    2
  );
  if (!config) return null;

  const Durations = () => (
    <div className="w-full flex items-center pt-1.5 xsm:justify-between ">
      {candidateDurations.map((d) => {
        const base = 2592000;
        return (
          <button
            key={d}
            className={`rounded-lg text-center  mr-2.5 hover:bg-gradientFrom  ${
              duration === d
                ? 'text-chartBg bg-gradientFrom'
                : 'text-farmText bg-black bg-opacity-20'
            } hover:text-chartBg px-3 xsm:px-1.5 py-1 text-xs`}
            onClick={() => setDuration(d)}
          >
            {' '}
            {d === leftTime ? (
              <span>
                {' '}
                <FormattedMessage id="keep_ve" defaultMessage={'keep'} />
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <Images tokens={tokens} size={'7'} />
            &nbsp;
            <Symbols withArrow={false} tokens={tokens} size="text-base" />
            <button
              className={`hover:text-senderHot ${
                ONLY_ZEROS.test(lpShare) ? 'hidden' : ''
              } text-gradientFrom pl-1 py-1`}
              onClick={() => openUrl(`/pool/${getVEPoolId()}`)}
            >
              <VEARROW />
            </button>
          </div>
          <span className="">
            {!ONLY_ZEROS.test(lpShare) ? (
              toPrecision(lpShare, 2)
            ) : (
              <button
                className="text-gradientFrom hover:text-senderHot flex items-center text-xs "
                onClick={() => openUrl(`/pool/${getVEPoolId()}`)}
              >
                <span>
                  <FormattedMessage
                    id="get_lptoken"
                    defaultMessage={'Get LP Tokens'}
                  />
                </span>
                &nbsp; <VEARROW />
              </button>
            )}
          </span>
        </div>

        <FarmStakeTip stake={farmStakeV1} version={1} />

        <FarmStakeTip stake={farmStakeV2} version={2} />

        <NewFarmInputAmount
          max={lpShare}
          onChangeAmount={setInputValue}
          className=""
          value={inputValue}
        />

        <div className="text-sm text-farmText py-5 xsm:pt-3 pb-2.5 flex items-center justify-between">
          <span>
            <FormattedMessage id="duration" defaultMessage="Duration" />
          </span>

          <span className="text-white">
            {timeStampToDate(moment().unix() + duration)}
          </span>
        </div>

        {preLocked && leftTime > config?.min_locking_duration_sec ? (
          <div className="flex items-center pb-1.5">
            <span className="mr-1">
              <TipTriangle h="14" w="13" c="#00C6A2" />
            </span>
            <span className="text-xs text-farmText">
              <FormattedMessage
                id="ve_lock_tip"
                defaultMessage={'Cannot be earlier than current unlocking date'}
              />
              <span>
                {`, `}
                <button
                  className={` font-bold  underline text-gradientFrom hover:text-senderHot
                    ${duration === leftTime ? '  text-senderHot ' : ''} `}
                  onClick={() => {
                    setDuration(leftTime);
                  }}
                  style={{
                    textDecorationThickness: '0.5px',
                    textUnderlineOffset: '1px',
                  }}
                >
                  {timeStampToDate(unlockTime)}
                </button>
              </span>
            </span>
          </div>
        ) : null}

        <Durations />

        <div className="text-sm text-farmText pt-7 xsm:pt-3 pb-2.5 flex items-center justify-between">
          <span className="whitespace-nowrap">
            <FormattedMessage id="get" defaultMessage="Get" />
          </span>

          <div className="mx-1.5 w-full border-b border-white border-opacity-10"></div>

          <span className="bg-gradientFromHover rounded-md text-xs px-1 text-black">
            {!showVeAmount ? '' : multiplier.toFixed(2) + 'x'}
          </span>
        </div>

        <div className="rounded-lg  pt-6 pb-5 xsm:py-0 flex items-center justify-between ">
          <div className="flex flex-col w-1/2 items-center border-r border-white border-opacity-10">
            <div
              className="flex items-center"
              style={{
                transform:
                  !showVeAmount || finalAmount.length < 17
                    ? 'none'
                    : `scale(${17 / finalAmount.length},${
                        17 / finalAmount.length
                      })`,
              }}
            >
              {preLocked && showVeAmount ? (
                <>
                  <span className="text-farmText text-xs">
                    {currentVeAmount}
                  </span>

                  <span className="mx-1.5">
                    <RightArrowVE />
                  </span>
                </>
              ) : null}
              <span
                className={`${
                  finalAmount.length < 10
                    ? 'text-lg'
                    : finalAmount.length > 14
                    ? finalAmount.length >= 16
                      ? 'text-xs'
                      : 'text-sm'
                    : 'text-base'
                } ${showVeAmount ? 'text-white' : 'text-farmText'} `}
              >
                {showVeAmount ? finalAmount : '0'}
              </span>
            </div>
            <span className="pt-1 text-sm text-farmText flex items-center">
              <span className="mr-1">
                <VE_ICON />
              </span>
              <span className="flex items-center">
                <span>veLPT</span>
                <div
                  className="ml-1 text-xs"
                  data-type="info"
                  data-place="right"
                  data-multiline={true}
                  data-class="reactTip"
                  data-tooltip-html={`
              <div class="text-xs">
                <div 
                  style="max-width: 250px;font-weight:400",
                >
                ${intl.formatMessage({ id: 'veTip' })}
                </div>
              </div>
            `}
                  data-tooltip-id="tipId_lock_ve"
                >
                  <QuestionMark color="dark" />
                  <CustomTooltip className="w-20" id="tipId_lock_ve" />
                </div>
              </span>
            </span>
          </div>
          <div className="flex flex-col w-1/2 items-center">
            <div
              className="flex items-center"
              style={{
                transform:
                  !showVeAmount || finalLoveAmount.length < 17
                    ? 'none'
                    : `scale(${17 / finalLoveAmount.length},${
                        17 / finalLoveAmount.length
                      })`,
              }}
            >
              {preLocked && showVeAmount ? (
                <>
                  <span className="text-farmText text-xs">
                    {toPrecision(balance, 2)}
                  </span>
                  <span className="mx-1.5">
                    <RightArrowVE />
                  </span>
                </>
              ) : null}
              <span
                className={`${
                  finalLoveAmount.length < 10
                    ? 'text-lg'
                    : finalLoveAmount.length > 13
                    ? finalLoveAmount.length >= 16
                      ? 'text-xs'
                      : 'text-sm'
                    : 'text-base'
                } ${showVeAmount ? 'text-white' : 'text-farmText'}`}
              >
                {showVeAmount ? finalLoveAmount : '0'}
              </span>
            </div>
            <span className="pt-1 text-sm text-farmText flex items-center">
              <span className="mr-1">
                <LOVE_ICON />
              </span>
              <span className="flex items-center">
                <span>LOVE</span>

                <div
                  className="ml-1 text-xs"
                  data-type="info"
                  data-place="left"
                  data-multiline={true}
                  data-class="reactTip"
                  data-tooltip-html={`
              <div class="text-xs">
                <div 
                  style="max-width: 250px;font-weight:400",
                >
                ${intl.formatMessage({ id: 'loveTip' })}
                </div>
              </div>
            `}
                  data-tooltip-id="tipId_lock_love"
                >
                  <QuestionMark color="dark" />

                  <CustomTooltip className="w-20" id="tipId_lock_love" />
                </div>
              </span>
            </span>
          </div>
        </div>

        {!showVeAmount || !preLocked ? null : (
          <div
            className="rounded-lg border text-sm flex items-center border-gradientFrom px-3 py-2.5 mt-4 text-left"
            style={{
              backgroundColor: '#0D131C',
            }}
          >
            {' '}
            <span className="mr-4 self-start">
              <TipTriangle h="16" w="17" c="#00C6A2" />
            </span>
            <span>
              <div className="text-lightBg">
                <FormattedMessage
                  id="you_currently_have"
                  defaultMessage={'You currently have '}
                />
                <span>
                  {toPrecision(toReadableNumber(24, accountInfo.lpt_amount), 2)}
                </span>
                <FormattedMessage
                  id="lp_tokens_locking"
                  defaultMessage={'LP Tokens'}
                />
                <FormattedMessage
                  id="scheduled_to_be_unlocked"
                  defaultMessage={'scheduled to be unlocked'}
                />{' '}
                <span>{moment(unlockTime * 1000).format('MMM D YYYY')}</span>
                {'. '}
              </div>

              <div className="text-white font-bold">
                <span className="text-lightBg font-normal">
                  <FormattedMessage
                    id="locking_more_lp_tokens"
                    defaultMessage={'Locking more LP Tokens'}
                  />
                </span>
                <span>
                  <FormattedMessage
                    id="will_mean_these"
                    defaultMessage={'will mean these'}
                  />
                </span>
                <span>
                  {toPrecision(toReadableNumber(24, accountInfo.lpt_amount), 2)}
                </span>
                <span>
                  <FormattedMessage
                    id="lp_tokens_will_not_be_unlocked_until"
                    defaultMessage={'LP Tokens will not be unlocked until'}
                  />{' '}
                </span>
                <span>
                  {moment(moment().unix() * 1000 + duration * 1000).format(
                    'MMM D YYYY'
                  )}
                </span>
              </div>
            </span>
          </div>
        )}

        <div className="pt-4 text-sm flex items-start ">
          <button
            className="w-4 h-4 bg-navHighLightBg flex items-center text-gradientFrom justify-center border flex-shrink-0 border-gradientFrom rounded mr-2.5"
            onClick={() => {
              setTermsCheck(!termsCheck);
            }}
          >
            {!termsCheck ? null : <RewardCheck />}
          </button>
          <span className="text-lightBg">
            <FormattedMessage
              id="I_understand_that_I_won't_be_able_to_remove_my"
              defaultMessage={"I understand that I won't be able to remove my"}
            />
            <span className="text-white font-bold">
              {toPrecision(
                scientificNotationToString(
                  new Big(toReadableNumber(24, accountInfo?.lpt_amount || '0'))
                    .plus(new Big(inputValue || '0'))
                    .toString()
                ),
                2
              )}
            </span>
            <FormattedMessage
              id="lp_tokens_locking"
              defaultMessage={'LP Tokens'}
            />
            <FormattedMessage id="until" defaultMessage={'until'} />{' '}
            <span className="text-white font-bold">
              {moment(moment().unix() * 1000 + duration * 1000).format(
                'MMM D YYYY'
              )}
            </span>
          </span>
        </div>

        {isSignedIn ? (
          <NewGradientButton
            text={
              ONLY_ZEROS.test(lpShare) ? (
                <FormattedMessage
                  id="you_have_no_lp_share"
                  defaultMessage={'You have no LP Tokens'}
                />
              ) : (
                <FormattedMessage id="lock" defaultMessage={'Lock'} />
              )
            }
            beatStyling
            className="mt-4 text-lg xsm:text-base"
            padding="py-2 px-0"
            onClick={() =>
              lockLP({
                token_id: ':' + getVEPoolId().toString(),
                amount: toNonDivisibleNumber(24, inputValue),
                duration,
                leftTime,
              })
            }
            disabled={
              !termsCheck ||
              ONLY_ZEROS.test(inputValue) ||
              new Big(inputValue).gt(new Big(lpShare)) ||
              !duration ||
              ONLY_ZEROS.test(lpShare)
            }
          />
        ) : (
          <ConnectToNearBtnGradient className="mt-6" />
        )}
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
  const preLocked = Number(accountInfo?.unlock_timestamp) > 0;

  const balance = useLOVEbalance();

  const currentVeAmount = toPrecision(
    toReadableNumber(LOVE_TOKEN_DECIMAL, accountInfo?.ve_lpt_amount),
    2
  );

  const lockedLPAmount = toReadableNumber(24, accountInfo?.lpt_amount);

  const [toUnlockAmount, setToUnlockAmount] = useState<string>('');

  const [error, setError] = useState<Error>(null);

  const multiplier = preLocked
    ? new Big(accountInfo?.ve_lpt_amount).div(
        new Big(accountInfo?.lpt_amount || 1).div(1000000)
      )
    : new Big(1);

  const currentMaxUnlock = preLocked
    ? new Big(
        new Big(
          toReadableNumber(
            LOVE_TOKEN_DECIMAL,
            accountInfo?.ve_lpt_amount || '0'
          )
        ).lt(balance)
          ? toReadableNumber(
              LOVE_TOKEN_DECIMAL,
              accountInfo?.ve_lpt_amount || '0'
            )
          : balance
      ).div(multiplier)
    : new Big('0');

  const reduced = new Big(toUnlockAmount || '0').times(multiplier);

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

  useEffect(() => {
    setError(null);
    setToUnlockAmount('');
  }, [isOpen]);

  const intl = useIntl();
  useEffect(() => {
    if (Number(finalLove) < 0) {
      setError(
        new Error(
          `${intl.formatMessage({
            id: 'you_do_not_have_enough',
          })} LOVE ${intl.formatMessage({ id: 'token' })}`
        )
      );
    } else if (Number(finalve) < 0) {
      setError(
        new Error(
          `${intl.formatMessage({ id: 'you_do_not_have_enough' })} veLPT`
        )
      );
    } else setError(null);
  }, [toUnlockAmount]);
  return (
    <ModalWrapper
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={
        <FormattedMessage
          id="unlock_lptoken"
          defaultMessage={'Unlock LP Tokens'}
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
            <span className="pb-1 text-white">
              {toPrecision(lockedLPAmount, 2)}
              <span className="text-primaryText ml-2">{'LP Tokens'}</span>
            </span>
          </div>
          <div className="text-center flex items-center pt-4 justify-between">
            <span>
              <FormattedMessage id="available" defaultMessage="Available" />
            </span>
            <span className="pb-1 text-white">
              {currentMaxUnlock.gt(0)
                ? toPrecision(
                    scientificNotationToString(currentMaxUnlock.toString()),
                    2
                  )
                : 0}
              <span className="text-primaryText ml-2">
                {' '}
                <FormattedMessage
                  id="lp_tokens"
                  defaultMessage={'LP Tokens'}
                />{' '}
              </span>
            </span>
          </div>
        </div>

        <NewFarmInputAmount
          max={toReadableNumber(
            24,
            toNonDivisibleNumber(
              24,
              scientificNotationToString(currentMaxUnlock.toString())
            )
          )}
          value={toUnlockAmount}
          onChangeAmount={setToUnlockAmount}
        />

        <div className="text-sm text-farmText  pb-2.5 pt-3 flex items-center justify-between">
          veLPT/LOVE &nbsp;
          <FormattedMessage id="balance_lowercase" defaultMessage="balance" />
        </div>

        <div className="rounded-lg  pt-6 pb-5 flex items-center justify-between ">
          <div className="flex flex-col w-1/2 items-center border-r border-white border-opacity-10">
            <div
              className="flex items-center"
              style={{
                transform:
                  ONLY_ZEROS.test(toUnlockAmount) ||
                  toPrecision(finalve, 2).length < 17
                    ? 'none'
                    : `scale(${17 / toPrecision(finalve, 2).length},${
                        17 / toPrecision(finalve, 2).length
                      })`,
              }}
            >
              <span className="text-farmText text-xs">{currentVeAmount}</span>
              {ONLY_ZEROS.test(toUnlockAmount) ? null : (
                <>
                  <span className="mx-1">
                    <RightArrowVE />
                  </span>
                  <span
                    className={`${
                      toPrecision(finalve, 2).length < 10
                        ? 'text-lg'
                        : toPrecision(finalve, 2).length > 14
                        ? toPrecision(finalve, 2).length >= 16
                          ? 'text-xs'
                          : 'text-sm'
                        : 'text-base'
                    } ${Number(finalve) >= 0 ? 'text-white' : 'text-warn'} `}
                  >
                    {ONLY_ZEROS.test(
                      toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, finalve)
                    )
                      ? 0
                      : toPrecision(finalve, 2)}
                  </span>
                </>
              )}
            </div>
            <span className="pt-1 text-sm text-farmText flex items-center">
              <span className="mr-1">
                <VE_ICON />
              </span>
              <span className="flex items-center">
                <span>veLPT</span>
                <div
                  className="ml-1 text-xs"
                  data-type="info"
                  data-place="right"
                  data-multiline={true}
                  data-class="reactTip"
                  data-tooltip-html={`
              <div class="text-xs">
 
                <div 
                  style="max-width: 250px;font-weight:400",
                >
                ${intl.formatMessage({ id: 'veTip' })}
                 </div>
              </div>
            `}
                  data-tooltip-id="tipId_unlock_ve"
                >
                  <QuestionMark color="dark" />

                  <CustomTooltip className="w-20" id="tipId_unlock_ve" />
                </div>
              </span>
            </span>
          </div>
          <div className="flex flex-col w-1/2 items-center ">
            <div
              className="flex items-center"
              style={{
                transform:
                  ONLY_ZEROS.test(toUnlockAmount) ||
                  toPrecision(finalLove, 2).length < 17
                    ? 'none'
                    : `scale(${17 / toPrecision(finalLove, 2).length},${
                        17 / toPrecision(finalLove, 2).length
                      })`,
              }}
            >
              <span className="text-farmText text-xs">
                {toPrecision(balance, 2)}
              </span>
              {ONLY_ZEROS.test(toUnlockAmount) ? null : (
                <>
                  <span className="mx-1">
                    <RightArrowVE />
                  </span>
                  <span
                    className={`${
                      toPrecision(finalLove, 2).length < 10
                        ? 'text-lg'
                        : toPrecision(finalLove, 2).length > 14
                        ? toPrecision(finalLove, 2).length >= 16
                          ? 'text-xs'
                          : 'text-sm'
                        : 'text-base'
                    } ${Number(finalLove) >= 0 ? 'text-white' : 'text-warn'} `}
                  >
                    {ONLY_ZEROS.test(
                      toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, finalLove)
                    )
                      ? 0
                      : toPrecision(finalLove, 2)}
                  </span>
                </>
              )}
            </div>
            <span className="pt-1 text-sm text-farmText flex items-center">
              <span className="mr-1">
                <LOVE_ICON />
              </span>
              <span className="flex items-center">
                <span>LOVE</span>

                <div
                  className="ml-1 text-xs"
                  data-type="info"
                  data-place="left"
                  data-multiline={true}
                  data-class="reactTip"
                  data-tooltip-html={`
              <div class="text-xs">

                <div 
                  style="max-width: 250px;font-weight:400",
                >
                ${intl.formatMessage({ id: 'loveTip' })}
</div>
            `}
                  data-tooltip-id="tipId_unlock_love"
                >
                  <QuestionMark color="dark" />

                  <CustomTooltip className="w-20" id="tipId_unlock_love" />
                </div>
              </span>
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
          className="mt-5 text-white text-lg py-4 xsm:text-base"
          onClick={() => {
            unlockLP({
              amount: toNonDivisibleNumber(24, toUnlockAmount),
            });
          }}
          beatStyling
          disabled={
            ONLY_ZEROS.test(toUnlockAmount) ||
            new Big(toUnlockAmount).gt(currentMaxUnlock) ||
            !!error
          }
        />
      </div>
    </ModalWrapper>
  );
};

const UnlockCheckPopUp = (
  props: Modal.Props & {
    setUnlockingOpen: (o: boolean) => void;
  }
) => {
  const { setUnlockingOpen } = props;

  const [proposals, setProposals] = useState<Proposal[]>();
  const myVoteDetail = useContext(ReferendumPageContext).myVoteDetail;

  useEffect(() => {
    const proposal_ids = Object.keys(myVoteDetail || {}).map((id) =>
      Number(id)
    );
    if (proposal_ids && proposal_ids.length > 0) {
      batchFetchProposals(proposal_ids).then(setProposals);
    }
  }, [myVoteDetail]);

  const sortFunc = (proposala: Proposal, proposalb: Proposal) => {
    const isFarmProposala = Object.keys(proposala.kind).includes(
      'FarmingReward'
    );
    const isFarmProposalb = Object.keys(proposalb.kind).includes(
      'FarmingReward'
    );

    if (isFarmProposala) {
      return -2;
    } else if (isFarmProposalb) {
      return 2;
    } else {
      if (proposala.id > proposalb.id) {
        return -1;
      } else {
        return 1;
      }
    }
  };

  return (
    <ModalWrapper
      {...props}
      customHeight="85vh"
      title={
        <FormattedMessage
          id="unlock_lptoken"
          defaultMessage={'Unlock LP Tokens'}
        />
      }
    >
      <div className="mx-auto mt-9 mb-6">
        <TipTriangle w="30" h="26" c="#00C6A2" />
      </div>

      <div className="text-center text-white mb-10">
        <FormattedMessage id="unlocking_tip" />
      </div>

      <NewGradientButton
        text={
          <FormattedMessage
            id="yes_continue"
            defaultMessage={'Yes, continue'}
          />
        }
        className="mb-9"
        onClick={(e: any) => {
          setUnlockingOpen(true);
          props.onRequestClose(e);
        }}
      />

      <div className="w-full">
        {proposals?.sort(sortFunc).map((p) => {
          return <ProposalThumbnail proposal={p} />;
        })}
      </div>

      <div className="mt-2 flex items-center text-xs text-primaryText">
        <span className="text-gradientFrom mr-1">*</span>

        <span className="whitespace-nowrap">
          <FormattedMessage
            id="estimate_bonus"
            defaultMessage={'Estimate Bonus'}
          />
        </span>
        <span className="mx-1">=</span>

        <span className="whitespace-nowrap">
          <FormattedMessage
            id="your_shares_ve"
            defaultMessage={'Your shares'}
          />
        </span>

        <span className="mx-1">*</span>

        <span className="">
          <FormattedMessage
            id="current_value_of_bonus"
            defaultMessage={'Current Value of bonus'}
          />
        </span>
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
  const allZeros = ONLY_ZEROS.test(veShare);

  const isClientMobile = useClientMobile();

  const mobileNotSignedIn = isClientMobile && allZeros;

  const intl = useIntl();

  return (
    <div
      className="rounded-2xl relative bg-veVotingPowerCard flex py-4 px-5 xsm:p-3 font-bold text-black ml-5  h-1/2 mb-2 xsm:ml-0 xsm:mr-1 xsm:mb-0"
      style={{
        width: isClientMobile ? '50%' : '350px',
        height: isClientMobile ? '100px' : '',
      }}
    >
      <div className="flex xsm:relative flex-col justify-between">
        <span className="lg:whitespace-nowrap xsm:text-lg xsm:leading-5">
          <FormattedMessage id="voting_power" defaultMessage={'Voting Power'} />
        </span>

        <span className={`pt-10 xsm:pt-3 xsm:absolute xsm:-bottom-2`}>
          <>
            <span title={veShare} className="flex items-center xsm:text-xl">
              {allZeros ? (
                !mobileNotSignedIn ? (
                  <>
                    <span className="transform scale-75">
                      <LeftArrowVE />
                    </span>
                    <span className="text-black text-xs ml-2">
                      <FormattedMessage
                        id="lock_lp_tokens_first"
                        defaultMessage="Lock LP Tokens first!"
                      />
                    </span>
                  </>
                ) : (
                  '-'
                )
              ) : Number(veShare) > 0 && Number(veShare) < 0.01 ? (
                '< 0.01'
              ) : (
                toPrecision(veShare, 2) || '0'
              )}
            </span>
            <div className="text-sm flex items-center font-normal xsm:mt-0 mt-2 xsm:text-xs">
              <>
                <span>veLPT</span>
                <div
                  className="ml-1 text-xs"
                  data-type="info"
                  data-place={isClientMobile ? 'top' : 'right'}
                  data-multiline={true}
                  data-class="reactTip"
                  data-tooltip-html={`
              <div class="text-xs">

                <div 
                  style="max-width: 250px;font-weight:400",
                >
                ${intl.formatMessage({ id: 'veTip' })}
                                </div>
              </div>
            `}
                  data-tooltip-id="tipId_ve_post_card"
                >
                  <QuestionMark color="dark" colorhex="#000000" />
                  <CustomTooltip className="w-20" id="tipId_ve_post_card" />
                </div>
              </>
            </div>
          </>
        </span>
      </div>
      <div
        className={`${
          isClientMobile ? 'opacity-30' : ''
        } absolute xsm:right-24 lg:bottom-11 lg:left-40 lg:-top-6 xsm:top-6 xsm:transform`}
        style={{
          transform: isClientMobile ? 'scale(0.4,0.4)' : '',
        }}
      >
        <VotingPowerIcon />
      </div>
    </div>
  );
};

const FarmBoosterCard = ({
  lpShare,
  veShare,
}: {
  lpShare: string;
  veShare: string;
}) => {
  const balance = useLOVEbalance();

  const allZeros = ONLY_ZEROS.test(veShare) && ONLY_ZEROS.test(balance);

  const isClientMobile = useClientMobile();

  const mobileNotSignedIn = isClientMobile && allZeros;

  const intl = useIntl();

  return (
    <div
      className="rounded-2xl bg-veFarmBoostCard flex py-4 px-5 xsm:p-3 font-bold text-senderHot ml-5 mt-2 h-1/2  relative xsm:ml-1 xsm:mt-0"
      style={{
        width: isClientMobile ? '50%' : '350px',
        height: isClientMobile ? '100px' : '',
      }}
    >
      <div className="flex xsm:relative  flex-col lg:whitespace-nowrap justify-between xsm:text-lg">
        <span className="xsm:leading-5">
          <FormattedMessage id="farm_booster" defaultMessage={'Farm Booster'} />
        </span>

        <span
          className={`text-white pt-10 xsm:pt-3 xsm:absolute xsm:-bottom-2`}
        >
          <>
            <span title={balance} className="flex items-center">
              {allZeros ? (
                !mobileNotSignedIn ? (
                  <>
                    <span className="transform scale-75">
                      <LeftArrowVE stroke="#00ffd1" />
                    </span>
                    <span className="text-xs text-white font-normal ml-2">
                      <FormattedMessage
                        id="lock_lp_tokens_first"
                        defaultMessage="Lock LP Tokens first!"
                      />
                    </span>
                  </>
                ) : (
                  '-'
                )
              ) : Number(balance) > 0 && Number(balance) < 0.01 ? (
                '< 0.01'
              ) : (
                toPrecision(balance, 2) || '0'
              )}
            </span>

            <div className="text-sm font-normal flex items-center mt-2 xsm:mt-0 xsm:text-xs">
              <>
                <span>LOVE</span>
                <div
                  className="ml-1 text-xs"
                  data-type="info"
                  data-place={isClientMobile ? 'left' : 'right'}
                  data-multiline={true}
                  data-class="reactTip"
                  data-tooltip-html={`
              <div class="text-xs">
  
                <div 
                  style="max-width: ${
                    isClientMobile ? '200px' : '250px'
                  };font-weight:400;white-space: initial;",
                >
                ${intl.formatMessage({ id: 'loveTip' })}
                             </div>
            `}
                  data-tooltip-id="tipId_love_post_card"
                >
                  <QuestionMark color="bright" />
                  <CustomTooltip className="w-20" id="tipId_love_post_card" />
                </div>
              </>
            </div>
          </>
        </span>
      </div>
      <div
        className={` ${
          isClientMobile ? 'opacity-30' : ''
        } absolute   lg:left-40 lg:-top-6 xsm:right-24 xsm:top-6 xsm:transform`}
        style={{
          transform: isClientMobile ? 'scale(0.4,0.4)' : '',
        }}
      >
        <LOVEBoosterIcon />
      </div>
      <button
        className={`absolute lg:text-xs flex xsm:items-center xsm:bg-none hover:bg-farmBoostingGotoFarm text-white hover:text-gradientFrom xsm:text-gradientFrom whitespace-nowrap  xsm:bottom-1  right-1 bottom-4 px-4 xsm:px-0 py-px rounded-full font-normal `}
        style={{
          fontSize: isClientMobile
            ? intl.locale === 'uk'
              ? '8px'
              : '10px'
            : '',
        }}
        onClick={() => {
          openUrl('/v2farms');
        }}
      >
        <span>
          <FormattedMessage id="go_to_farm" defaultMessage="Go to farm" />
        </span>
        <span className="ml-1 lg:relative lg:top-1 xsm:transform xsm:scale-75">
          <VEARROW />
        </span>
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
    <div className="flex flex-col xsm:flex-row text-2xl font-bold">
      <VotingPowerCard veShare={veShare} lpShare={lpShare} />
      <FarmBoosterCard lpShare={lpShare} veShare={veShare} />
    </div>
  );
};
export const FarmStakeTip = ({
  stake,
  version,
}: {
  stake: string | number;
  version: number;
}) => {
  if (Number(stake) === 0) {
    return null;
  }

  return (
    <div className="text-primaryText flex items-center text-xs relative mb-1.5">
      <FormattedMessage id="you_have" defaultMessage={'You have'} />{' '}
      {toPrecision(
        toReadableNumber(24, scientificNotationToString(stake.toString())),
        2
      )}{' '}
      <FormattedMessage id="more_lock_ve_popup2" defaultMessage={'more '} />{' '}
      <FormattedMessage id="lp_tokens" defaultMessage={'LP Tokens'} />
      <span className="ml-1">
        <FormattedMessage id="more_in_cn" defaultMessage={'in'} />
        <span
          className="text-gradientFrom hover:text-senderHot ml-1 cursor-pointer underline"
          onClick={() => {
            if (version === 1) {
              openUrl('farms');
            } else openUrl(`/v2farms/${getVEPoolId()}-r`);
          }}
        >
          <FormattedMessage id="farm" defaultMessage={'farm'} />{' '}
          {`${version === 1 ? 'Legacy' : 'Classic'}`}
        </span>
      </span>
    </div>
  );
};

export const FarmStakeTipHomePage = ({
  stake,
  version,
}: {
  stake: string | number;
  version: number;
}) => {
  if (Number(stake) === 0) {
    return null;
  }

  return (
    <div className="text-lightBg font-light flex items-center text-sm flex-shrink-0 whitespace-nowrap">
      {toPrecision(
        toReadableNumber(24, scientificNotationToString(stake.toString())),
        2
      )}{' '}
      <span className={`flex ml-1`}>
        <FormattedMessage id="more_in" defaultMessage={'more in'} />
        <span
          className=" ml-1 flex cursor-pointer hover:text-gradientFrom "
          onClick={() => {
            if (version === 1) {
              openUrl('farms');
            } else openUrl(`/v2farms/${getVEPoolId()}-r`);
          }}
        >
          <span className="underline mr-1 ">
            <FormattedMessage id="farm" defaultMessage={'farm'} />{' '}
            <span className="text-xs">{`${
              version === 1 ? 'Legacy' : 'Classic'
            }`}</span>
          </span>
          <span className="relative top-1.5">
            <VEARROW />
          </span>
        </span>
      </span>
    </div>
  );
};

const UserReferendumCard = ({
  veShare,
  lpShare,
  accountInfo,
  allowUnlock,
}: {
  veShare: string;
  lpShare: string;
  accountInfo: AccountInfo;
  allowUnlock: boolean;
}) => {
  const tokens = [REF_META_DATA, unwrapedNear];

  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const [lockPopOpen, setLockPopOpen] = useState<boolean>(false);

  const [unLockPopOpen, setUnLockPopOpen] = useState<boolean>(false);

  const [unlockCheckPopUp, setUnlockCheckPopUp] = useState<boolean>(false);

  const intl = useIntl();

  const unlockTime = new Big(accountInfo?.unlock_timestamp || 0)
    .div(new Big(1000000000))
    .toNumber();

  const lockTime = unlockTime - (accountInfo?.duration_sec || 0);

  const passedTime_sec = moment().unix() - lockTime;

  const lockedLpShare = toReadableNumber(24, accountInfo?.lpt_amount || '0');

  const { farmStakeV1, farmStakeV2 } = useYourliquidity(Number(getVEPoolId()));
  const myVoteDetail = useContext(ReferendumPageContext).myVoteDetail;

  const [hoverTip, setHoverTip] = useState<boolean>(false);

  const [showMobileLocker, setShowMobileLocker] = useState<boolean>(false);

  return (
    <>
      <Card
        className={`flex xsm:hidden flex-col  relative z-30 justify-between overflow-hidden`}
        width="w-2/3 xsm:w-full"
        padding={'p-0'}
        bgcolor="bg-transparent"
        rounded="rounded-none"
      >
        <div className="text-3xl xsm:text-2xl font-bold mb-2 xsm:px-2">
          <FormattedMessage
            id="lock_your_lp_tokens"
            defaultMessage="Lock Your LP Tokens"
          />
        </div>
        <span
          className={`pb-7 text-5xl xsm:text-2xl valueStyle font-bold xsm:px-2`}
        >
          <FormattedMessage
            id="unlock_your_defi_power"
            defaultMessage="Unlock Your DeFi Power"
          />
        </span>
        <div className=" flex items-center text-lg relative left-1 xsm:px-2">
          <Images tokens={tokens} size="6" />
          <span className="mx-1"></span>
          <Symbols
            tokens={tokens}
            separator="-"
            size="text-lg"
            fontSize="font-normal"
          />
          <button
            className={`hover:text-senderHot text-gradientFrom pl-1 py-1`}
            onClick={() => openUrl(`/pool/${getVEPoolId()}`)}
          >
            <VEARROW />
          </button>
        </div>

        <div className="flex items-center justify-between mt-10 mb-4 xsm:px-2">
          <div className="flex flex-col w-1/2 mr-4">
            <div className={`text-2xl font-bold text-gradientFromHover `}>
              <span className="flex items-center">
                <span
                  className={`
              ${ONLY_ZEROS.test(lpShare) || !isSignedIn ? 'opacity-20' : ''}
              `}
                >
                  {isSignedIn ? (
                    Number(lpShare) > 0 && Number(lpShare) < 0.01 ? (
                      '< 0.01'
                    ) : (
                      <span title={lpShare}>
                        {`${toPrecision(lpShare, 2)}`}{' '}
                      </span>
                    )
                  ) : (
                    '-'
                  )}
                </span>

                {!isSignedIn ||
                !(Number(farmStakeV1) > 0 || Number(farmStakeV2) > 0) ? null : (
                  <div
                    className={`ml-2 relative  flex items-start  pl-1 py-0.5`}
                    onMouseEnter={() => setHoverTip(true)}
                    onMouseLeave={() => setHoverTip(false)}
                  >
                    <div className={`relative z-20`}>
                      <VETip />
                    </div>
                    {!hoverTip ? null : (
                      <div className="-top-0.5 -left-0.5 pl-6 pr-3 z-10 absolute bg-black bg-opacity-80  rounded-xl text-sm">
                        <div className={`ml-1 mt-0.5`}>
                          <div
                            className={Number(farmStakeV1) > 0 ? 'mb-1.5' : ''}
                          >
                            {Number(farmStakeV1) > 0 ? (
                              <FarmStakeTipHomePage
                                stake={farmStakeV1}
                                version={1}
                              />
                            ) : null}
                          </div>
                          <div
                            className={Number(farmStakeV1) > 0 ? 'mb-1' : ''}
                          >
                            {Number(farmStakeV2) > 0 ? (
                              <FarmStakeTipHomePage
                                stake={farmStakeV2}
                                version={2}
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </span>
            </div>

            <span className="text-sm text-farmText pt-1">
              <FormattedMessage
                id="avaliable_to_lock"
                defaultMessage="Available to lock"
              />
            </span>
          </div>
          <div className="flex flex-col w-1/2">
            <div
              className={`text-2xl font-bold text-gradientFromHover ${
                ONLY_ZEROS.test(lockedLpShare) || !isSignedIn
                  ? 'opacity-20'
                  : ''
              }`}
            >
              <span title={lockedLpShare}>
                {isSignedIn
                  ? Number(lockedLpShare) > 0 && Number(lockedLpShare) < 0.01
                    ? '< 0.01'
                    : toPrecision(lockedLpShare, 2)
                  : '-'}
              </span>
            </div>

            <span className="text-sm text-farmText pt-1">
              <FormattedMessage id="locked" defaultMessage="Locked" />
            </span>
          </div>
        </div>

        {isSignedIn ? (
          <div className={`text-base flex items-center w-full xsm:text-sm `}>
            <NewGradientButton
              className={`${
                ONLY_ZEROS.test(veShare) ? 'w-full' : 'w-1/2'
              } mr-2 h-11`}
              padding="p-0"
              text={
                <FormattedMessage
                  id="lock_lptoken"
                  defaultMessage="Lock LP Tokens"
                />
              }
              onClick={() => setLockPopOpen(true)}
            />
            {ONLY_ZEROS.test(veShare) ? null : moment().unix() > unlockTime ? (
              <BorderGradientButton
                onClick={() => {
                  if (Object.keys(myVoteDetail || {}).length > 0) {
                    setUnlockCheckPopUp(true);
                  } else {
                    setUnLockPopOpen(true);
                  }
                }}
                text={
                  <span>
                    {timeStampToDate(unlockTime)}{' '}
                    <span className="">
                      <FormattedMessage id="unlock" defaultMessage="Unlock" />
                    </span>
                  </span>
                }
                className="rounded-lg w-full h-full"
                padding="p-0"
                width="w-1/2 ml-2 h-11"
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
                className="rounded-lg w-1/2 ml-2 h-11"
                grayDisable={moment().unix() < unlockTime}
                disabled={moment().unix() < unlockTime}
                gradientWith={`${Math.ceil(
                  (passedTime_sec / accountInfo?.duration_sec) * 100
                )}%`}
              />
            )}
          </div>
        ) : (
          <ConnectToNearBtnGradient className="mt-0 py-2 h-11" />
        )}
      </Card>

      <div className="lg:hidden bg-veReverseGradient  relative rounded-b-2xl text-white pb-14 mb-14 overflow-visible">
        <div className="text-2xl font-bold mt-5 text-center">
          <FormattedMessage id="vote_mobile_capital" defaultMessage={'VOTE'} />
        </div>
        <div className="text-sm mt-2 text-center">
          <span>
            <FormattedMessage
              id="voting_power_and_extra_earnings"
              defaultMessage={'Voting power & Extra earnings'}
            />
          </span>
        </div>
        <div className="mt-5 flex items-center justify-center">
          {!isSignedIn ? (
            <ConnectToNearBtnVotingMobile />
          ) : (
            <button
              className={`flex items-center cursor-pointer border w-auto border-white px-2 justify-center rounded-full text-center bg-opacity-50 py-1  text-sm`}
              onClick={() => {
                setShowMobileLocker(!showMobileLocker);
              }}
            >
              <FormattedMessage
                id="lptoken_locker"
                defaultMessage={'LP Token Locker'}
              />
              <span className="ml-3">
                {showMobileLocker ? <FaAngleUp /> : <FaAngleDown />}
              </span>
            </button>
          )}
          {!allowUnlock ? null : (
            <span className="flex items-center">
              <div
                className="ml-1 text-xs"
                data-type="info"
                data-place="bottom"
                data-multiline={true}
                data-class="reactTip"
                data-tooltip-html={`${intl.formatMessage({
                  id: 'unlock_tip_top',
                })}`}
                data-tooltip-id="mobile_unlock_tip_lptoken"
              >
                <div className="text-gradientFrom ml-2">
                  <VETip />
                </div>
                <CustomTooltip id="mobile_unlock_tip_lptoken" place="bottom" />
              </div>
            </span>
          )}
        </div>

        <div
          className={`w-11/12 rounded-2xl mt-3 flex flex-col p-3 ${
            !showMobileLocker ? 'hidden' : ''
          }  mx-auto`}
          style={{
            background:
              'linear-gradient(360deg, rgba(0,19,32,0.5) 50%, rgba(0,19,32,0.5) 100%)',
          }}
        >
          <div className="flex items-center ">
            <div className="flex flex-col items-center w-1/2 mr-4">
              <div className={`text-base font-bold text-white `}>
                <span className="flex items-center">
                  <span
                    className={`
              ${ONLY_ZEROS.test(lpShare) || !isSignedIn ? 'opacity-20' : ''}
              `}
                  >
                    {isSignedIn ? (
                      Number(lpShare) > 0 && Number(lpShare) < 0.01 ? (
                        '< 0.01'
                      ) : (
                        <span title={lpShare}>
                          {`${toPrecision(lpShare, 2)}`}{' '}
                        </span>
                      )
                    ) : (
                      '-'
                    )}
                  </span>

                  {!isSignedIn ||
                  !(
                    Number(farmStakeV1) > 0 || Number(farmStakeV2) > 0
                  ) ? null : (
                    <div
                      className={`ml-2 relative  flex items-start  pl-1 py-0.5`}
                      onMouseEnter={() => setHoverTip(true)}
                      onMouseLeave={() => setHoverTip(false)}
                    >
                      <div className={`relative z-20 text-gradientFrom`}>
                        <VETip />
                      </div>
                      {!hoverTip ? null : (
                        <div className="-top-0.5 -left-0.5 pl-6 pr-3 z-10 absolute bg-black bg-opacity-80  rounded-xl text-sm">
                          <div className={`ml-1 mt-0.5`}>
                            <div
                              className={
                                Number(farmStakeV1) > 0 ? 'mb-1.5' : ''
                              }
                            >
                              {Number(farmStakeV1) > 0 ? (
                                <FarmStakeTipHomePage
                                  stake={farmStakeV1}
                                  version={1}
                                />
                              ) : null}
                            </div>
                            <div
                              className={Number(farmStakeV1) > 0 ? 'mb-1' : ''}
                            >
                              {Number(farmStakeV2) > 0 ? (
                                <FarmStakeTipHomePage
                                  stake={farmStakeV2}
                                  version={2}
                                />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </span>
              </div>

              <span className="text-xs text-farmText pt-1">
                <FormattedMessage
                  id="avaliable_to_lock"
                  defaultMessage="Available to lock"
                />
              </span>
            </div>
            <div className="flex flex-col items-center w-1/2">
              <div
                className={`text-base font-bold text-white ${
                  ONLY_ZEROS.test(lockedLpShare) || !isSignedIn
                    ? 'opacity-20'
                    : ''
                }`}
              >
                <span title={lockedLpShare}>
                  {isSignedIn
                    ? Number(lockedLpShare) > 0 && Number(lockedLpShare) < 0.01
                      ? '< 0.01'
                      : toPrecision(lockedLpShare, 2)
                    : '-'}
                </span>
              </div>

              <span className="text-xs text-farmText pt-1">
                <FormattedMessage id="locked" defaultMessage="Locked" />
              </span>
            </div>
          </div>

          <div
            className={`text-base flex items-center w-full  xsm:text-sm mt-3`}
          >
            <NewGradientButton
              className={`${
                ONLY_ZEROS.test(veShare) ? 'w-full' : 'w-1/2'
              } mr-2 h-11 xsm:h-8`}
              padding="p-0"
              text={
                <span className="flex items-center">
                  <FormattedMessage id="lock" defaultMessage="Lock" />

                  <Images
                    className="ml-1.5"
                    size="4"
                    tokens={tokens}
                    noverlap
                  />
                </span>
              }
              onClick={() => setLockPopOpen(true)}
            />
            {ONLY_ZEROS.test(veShare) ? null : moment().unix() > unlockTime ? (
              <BorderGradientButton
                onClick={() => {
                  if (Object.keys(myVoteDetail || {}).length > 0) {
                    setUnlockCheckPopUp(true);
                  } else {
                    setUnLockPopOpen(true);
                  }
                }}
                text={
                  <span>
                    {timeStampToDate(unlockTime)}{' '}
                    <span className="">
                      <FormattedMessage id="unlock" defaultMessage="Unlock" />
                    </span>
                  </span>
                }
                className="rounded-lg w-full h-full xsm:text-xs"
                padding="p-0"
                width="w-1/2 ml-2 h-11 xsm:h-8"
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
                className="rounded-lg w-1/2 ml-2 h-11 xsm:h-8"
                grayDisable={moment().unix() < unlockTime}
                disabled={moment().unix() < unlockTime}
                gradientWith={`${Math.ceil(
                  (passedTime_sec / accountInfo?.duration_sec) * 100
                )}%`}
              />
            )}
          </div>
        </div>

        <div className="w-11/12 mx-auto absolute left-4 -bottom-16">
          <PosterCard veShare={veShare} lpShare={lpShare} />
        </div>
      </div>

      <LockPopUp
        isOpen={lockPopOpen}
        onRequestClose={() => setLockPopOpen(false)}
        tokens={tokens}
        lpShare={lpShare}
        accountInfo={accountInfo}
        farmStakeV1={farmStakeV1}
        farmStakeV2={farmStakeV2}
      />

      <UnLockPopUp
        isOpen={unLockPopOpen}
        onRequestClose={() => setUnLockPopOpen(false)}
        tokens={tokens}
        lpShare={lpShare}
        accountInfo={accountInfo}
      />

      <UnlockCheckPopUp
        isOpen={unlockCheckPopUp}
        onRequestClose={() => {
          setUnlockCheckPopUp(false);
        }}
        setUnlockingOpen={setUnLockPopOpen}
      />
    </>
  );
};

export const ReferendumPageContext = createContext(null);

export const ProposalThumbnail = ({ proposal }: { proposal: Proposal }) => {
  const [status, setStatus] = useState<ProposalStatus>(proposal.status);

  const isFarmProposal = Object.keys(proposal.kind).includes('FarmingReward');

  const myVoteDetail = useContext(ReferendumPageContext).myVoteDetail;

  const votedIndex = isFarmProposal
    ? myVoteDetail?.[proposal?.id]?.action?.VoteFarm?.farm_id
    : 0;

  const tokenPriceList = useContext(ReferendumPageContext).tokenPriceList;

  const votedAmount = myVoteDetail?.[proposal?.id]?.amount;

  const totalVE = !isFarmProposal
    ? scientificNotationToString(
        BigNumber.sum(
          ...(proposal?.kind?.Common
            ? proposal?.votes?.slice(0, 2)
            : proposal?.votes || [])
        ).toString()
      )
    : new BigNumber(proposal.votes?.[votedIndex]);

  const tokens = useTokens(
    proposal?.incentive?.[votedIndex]?.incentive_token_ids || []
  );

  const prices: (string | undefined)[] = tokens?.map((token) => {
    return tokenPriceList?.[token?.id]?.price;
  });

  const total = scientificNotationToString(
    prices
      ?.reduce((acc, price, i) => {
        return acc.plus(
          new Big(price || 0).times(
            toReadableNumber(
              tokens?.[i]?.decimals || 24,
              proposal?.incentive?.[votedIndex]?.incentive_amounts?.[i] || '0'
            )
          )
        );
      }, new Big(0))
      .toString() || '0'
  );

  const yourShare = scientificNotationToString(
    new BigNumber(votedAmount).div(totalVE).times(total).toString()
  );

  useEffect(() => {
    setStatus(proposal.status);
  }, [proposal.id, proposal]);

  const [base, setBase] = useState<number>(
    Math.floor(
      Number(status === 'InProgress' ? proposal?.end_at : proposal?.start_at) /
        TIMESTAMP_DIVISOR
    )
  );

  useEffect(() => {
    setBase(
      Math.floor(
        Number(
          status === 'InProgress' ? proposal?.end_at : proposal?.start_at
        ) / TIMESTAMP_DIVISOR
      )
    );
  }, [status]);

  const baseCounterDown = durationFomatter(
    moment.duration(base + 60 - moment().unix(), 'seconds')
  );
  const [counterDownStirng, setCounterDownStirng] =
    useState<string>(baseCounterDown);

  useEffect(() => {
    const baseCounterDown = durationFomatter(
      moment.duration(
        Math.floor(
          Number(
            status === 'InProgress' ? proposal?.end_at : proposal?.start_at
          ) / TIMESTAMP_DIVISOR
        ) +
          60 -
          moment().unix(),
        'seconds'
      )
    );
    setCounterDownStirng(baseCounterDown);
  }, [base, proposal.id, status]);

  useCounterDownVE({
    base,
    setCounterDownStirng,
    id: proposal?.id,
    status,
    setStatus,
  });

  const endtimeMoment = isFarmProposal
    ? moment(Math.floor(Number(proposal.end_at) / TIMESTAMP_DIVISOR) * 1000)
    : null;

  const farmTitle = isFarmProposal ? (
    <div className="text-base text-white truncate">
      <FormattedMessage id="proposed" defaultMessage={'Proposed'} />{' '}
      <span>{endtimeMoment.add(1, 'month').format('MMM yyyy')}</span>{' '}
      <FormattedMessage id="farm_reward" defaultMessage={'Farm reward'} />
      <FormattedMessage id="proposed_zh" defaultMessage={' '} />
    </div>
  ) : null;

  const govProposalTitle = isFarmProposal ? null : (
    <div
      className="text-base text-white truncate"
      title={`#${proposal.id} ${JSON.parse(proposal.description).title}`}
    >
      {`#${proposal.id}`} {JSON.parse(proposal.description).title}
    </div>
  );

  return (
    <div className="flex flex-col my-2 rounded-lg p-3 bg-priceBoardColor">
      <div className="flex items-center justify-between">
        <div className="text-senderHot">{counterDownStirng}</div>
        <button
          onClick={() => {
            if (isFarmProposal) {
              openUrl('/referendum?tab=farm');
            } else {
              openUrl('/referendum/' + proposal.id);
            }
          }}
        >
          <RightArrowUnlockingVE />
        </button>
      </div>

      {isFarmProposal ? farmTitle : govProposalTitle}
      {ONLY_ZEROS.test(total) || ONLY_ZEROS.test(yourShare) ? null : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-primaryText mt-1">
            <FormattedMessage
              id="estimate_bonus"
              defaultMessage={'Estimate bonus'}
            />
          </span>

          <span
            style={{
              color: '#5B62FF',
            }}
          >
            ${toPrecision(yourShare, 2, false, false)}
          </span>
        </div>
      )}
    </div>
  );
};

export default function ReferendumPage() {
  const id = getVEPoolId();
  const lpShare = usePoolShare(id, LOVE_TOKEN_DECIMAL);

  const { veShare, accountInfo, veShareRaw } = useAccountInfo();
  const tokenPriceList = useTokenPriceList();

  const allowUnlock =
    Number(accountInfo?.unlock_timestamp || 0) > 0 &&
    Math.floor(Number(accountInfo?.unlock_timestamp || 0) / TIMESTAMP_DIVISOR) <
      moment().unix();

  const isClientMobie = useClientMobile();
  const VEmeta = useVEmeta();

  const myVoteDetail = useVoteDetail();

  return (
    <ReferendumPageContext.Provider
      value={{
        tokenPriceList,
        veShare,
        veShareRaw,
        VEmeta,
        myVoteDetail,
      }}
    >
      <div className="m-auto lg:w-1024px  xsm:w-11/12 md:w-5/6 text-white relative lg:top-6 xsm:-top-4">
        <Card
          className={`w-full xsm:w-screen xsm:right-4 hiddenOnSecondPage  flex xsm:flex-col z-20 overflow-hidden xsm:overflow-visible relative `}
          bgcolor="lg:bg-veCardGradientRight xsm:bg-transparnet"
          padding={
            isClientMobie
              ? 'p-0'
              : allowUnlock
              ? 'px-6 xsm:px-3 xsm:py-4 xsm:pb-10 pb-12 py-6'
              : 'p-6 xsm:px-3 py-4'
          }
          rounded="xsm:rounded-none lg:rounded-2xl"
        >
          <UserReferendumCard
            veShare={veShare}
            lpShare={lpShare}
            accountInfo={accountInfo}
            allowUnlock={allowUnlock}
          />

          <div className="xsm:hidden">
            <PosterCard veShare={veShare} lpShare={lpShare} />
          </div>

          {!allowUnlock ? null : (
            <div className="absolute xsm:hidden w-full bottom-0 right-0 xsm:text-xs">
              <UnLockTip />
            </div>
          )}
        </Card>

        <ProposalCard />

        <div className={`absolute -top-14 z-10  lg:-left-10  xsm:hidden`}>
          <PowerZone />
        </div>
      </div>
    </ReferendumPageContext.Provider>
  );
}

export const CalenderIcon = () => {
  return (
    <svg
      width="21"
      height="22"
      viewBox="0 0 21 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect opacity="0.3" width="21" height="22" rx="6" fill="#445867" />
      <path
        d="M16.21 6.20931H13.7757V5.23829C13.7757 5.02742 13.605 4.85645 13.3939 4.85645C13.1828 4.85645 13.012 5.02742 13.012 5.23829V6.20931H9.33827V5.23829C9.33827 5.02742 9.16749 4.85645 8.95642 4.85645C8.74536 4.85645 8.57457 5.02742 8.57457 5.23829V6.20931H5.72791C5.25098 6.20931 4.86279 6.5973 4.86279 7.07443V15.9251C4.86279 16.4022 5.25098 16.7902 5.72791 16.7902H16.21C16.6869 16.7902 17.0751 16.4022 17.0751 15.9251V7.07443C17.0751 6.5973 16.6869 6.20931 16.21 6.20931ZM16.3114 15.9251C16.3114 15.952 16.3007 15.9778 16.2817 15.9968C16.2627 16.0158 16.2369 16.0265 16.21 16.0265H5.72791C5.70102 16.0265 5.67523 16.0158 5.65622 15.9968C5.6372 15.9778 5.62651 15.952 5.62648 15.9251V7.07443C5.62651 7.04753 5.6372 7.02175 5.65622 7.00274C5.67523 6.98372 5.70102 6.97302 5.72791 6.97299H8.57459V7.8575C8.57459 8.06837 8.74537 8.23935 8.95644 8.23935C9.16751 8.23935 9.33829 8.06837 9.33829 7.8575V6.97299H13.012V7.8575C13.012 8.06837 13.1828 8.23935 13.3939 8.23935C13.605 8.23935 13.7757 8.06837 13.7757 7.8575V6.97299H16.21C16.2369 6.97302 16.2627 6.98372 16.2817 7.00274C16.3007 7.02175 16.3114 7.04753 16.3114 7.07443V15.9251H16.3114Z"
        fill="white"
      />
      <path
        d="M7.23584 10.5449C7.23584 10.638 7.25417 10.7301 7.28977 10.8161C7.32538 10.902 7.37757 10.9801 7.44336 11.0459C7.50915 11.1117 7.58726 11.1639 7.67322 11.1995C7.75918 11.2351 7.85131 11.2535 7.94436 11.2535C8.0374 11.2535 8.12953 11.2351 8.21549 11.1995C8.30146 11.1639 8.37956 11.1117 8.44535 11.0459C8.51115 10.9801 8.56333 10.902 8.59894 10.8161C8.63455 10.7301 8.65287 10.638 8.65287 10.5449C8.65287 10.357 8.57823 10.1768 8.44535 10.0439C8.31248 9.91107 8.13227 9.83643 7.94436 9.83643C7.75645 9.83643 7.57623 9.91107 7.44336 10.0439C7.31049 10.1768 7.23584 10.357 7.23584 10.5449Z"
        fill="white"
      />
      <path
        d="M10.3638 10.5449C10.3638 10.7329 10.4384 10.9131 10.5713 11.0459C10.7042 11.1788 10.8844 11.2535 11.0723 11.2535C11.2602 11.2535 11.4404 11.1788 11.5733 11.0459C11.7062 10.9131 11.7808 10.7329 11.7808 10.5449C11.7808 10.357 11.7062 10.1768 11.5733 10.0439C11.4404 9.91107 11.2602 9.83643 11.0723 9.83643C10.8844 9.83643 10.7042 9.91107 10.5713 10.0439C10.4384 10.1768 10.3638 10.357 10.3638 10.5449Z"
        fill="white"
      />
      <path
        d="M13.4917 10.5449C13.4917 10.638 13.51 10.7301 13.5456 10.8161C13.5812 10.902 13.6334 10.9801 13.6992 11.0459C13.765 11.1117 13.8431 11.1639 13.9291 11.1995C14.015 11.2351 14.1072 11.2535 14.2002 11.2535C14.2933 11.2535 14.3854 11.2351 14.4714 11.1995C14.5573 11.1639 14.6354 11.1117 14.7012 11.0459C14.767 10.9801 14.8192 10.902 14.8548 10.8161C14.8904 10.7301 14.9087 10.638 14.9087 10.5449C14.9087 10.4519 14.8904 10.3598 14.8548 10.2738C14.8192 10.1878 14.767 10.1097 14.7012 10.0439C14.6354 9.97815 14.5573 9.92596 14.4714 9.89036C14.3854 9.85475 14.2933 9.83643 14.2002 9.83643C14.1072 9.83643 14.015 9.85475 13.9291 9.89036C13.8431 9.92596 13.765 9.97815 13.6992 10.0439C13.6334 10.1097 13.5812 10.1878 13.5456 10.2738C13.51 10.3598 13.4917 10.4519 13.4917 10.5449Z"
        fill="white"
      />
      <path
        d="M7.23584 13.3106C7.23584 13.4036 7.25417 13.4957 7.28977 13.5817C7.32538 13.6677 7.37757 13.7458 7.44336 13.8116C7.50915 13.8774 7.58726 13.9295 7.67322 13.9652C7.75918 14.0008 7.85131 14.0191 7.94436 14.0191C8.0374 14.0191 8.12953 14.0008 8.21549 13.9652C8.30146 13.9295 8.37956 13.8774 8.44535 13.8116C8.51115 13.7458 8.56333 13.6677 8.59894 13.5817C8.63455 13.4957 8.65287 13.4036 8.65287 13.3106C8.65287 13.1227 8.57823 12.9424 8.44535 12.8096C8.31248 12.6767 8.13227 12.6021 7.94436 12.6021C7.75645 12.6021 7.57623 12.6767 7.44336 12.8096C7.31049 12.9424 7.23584 13.1227 7.23584 13.3106Z"
        fill="white"
      />
      <path
        d="M10.3638 13.3106C10.3638 13.4985 10.4384 13.6787 10.5713 13.8116C10.7042 13.9445 10.8844 14.0191 11.0723 14.0191C11.2602 14.0191 11.4404 13.9445 11.5733 13.8116C11.7062 13.6787 11.7808 13.4985 11.7808 13.3106C11.7808 13.2175 11.7625 13.1254 11.7269 13.0394C11.6913 12.9535 11.6391 12.8754 11.5733 12.8096C11.5075 12.7438 11.4294 12.6916 11.3434 12.656C11.2575 12.6204 11.1653 12.6021 11.0723 12.6021C10.9793 12.6021 10.8871 12.6204 10.8012 12.656C10.7152 12.6916 10.6371 12.7438 10.5713 12.8096C10.5055 12.8754 10.4533 12.9535 10.4177 13.0394C10.3821 13.1254 10.3638 13.2175 10.3638 13.3106Z"
        fill="white"
      />
      <path
        d="M13.4917 13.3107C13.4917 13.4037 13.51 13.4959 13.5456 13.5819C13.5812 13.6678 13.6334 13.7459 13.6992 13.8117C13.765 13.8776 13.8431 13.9298 13.9291 13.9654C14.015 14.001 14.1072 14.0193 14.2002 14.0193C14.2933 14.0193 14.3854 14.001 14.4714 13.9654C14.5574 13.9298 14.6355 13.8776 14.7013 13.8117C14.7671 13.7459 14.8193 13.6678 14.8549 13.5819C14.8905 13.4959 14.9088 13.4037 14.9088 13.3107C14.9088 13.2176 14.8905 13.1255 14.8549 13.0395C14.8193 12.9535 14.7671 12.8754 14.7013 12.8096C14.6355 12.7438 14.5574 12.6916 14.4714 12.656C14.3854 12.6204 14.2933 12.6021 14.2002 12.6021C14.1072 12.6021 14.015 12.6204 13.9291 12.656C13.8431 12.6916 13.765 12.7438 13.6992 12.8096C13.6334 12.8754 13.5812 12.9535 13.5456 13.0395C13.51 13.1255 13.4917 13.2176 13.4917 13.3107Z"
        fill="white"
      />
    </svg>
  );
};
