import Big from 'big.js';
import BigNumber from 'bignumber.js';
import moment, { duration } from 'moment';
import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FormattedMessage, useIntl, FormattedRelativeTime } from 'react-intl';
import { NewGradientButton } from '../button/Button';
import {
  cancelVote,
  claimRewardVE,
  getProposalList,
} from '../../services/referendum';

import { scientificNotationToString, toPrecision } from '../../utils/numbers';
import { Card } from '../card/Card';
import {
  useVEmeta,
  useVoteDetail,
  useUnclaimedProposal,
  useCounterDownVE,
  UnclaimedProposal,
} from '../../state/referendum';
import {
  toReadableNumber,
  toRoundedReadableNumber,
  multiply,
} from '../../utils/numbers';
import {
  BorderGradientButton,
  FarmProposalGrayButton,
  YouVotedButton,
} from '../button/Button';
import {
  ModalWrapper,
  CalenderIcon,
  RewardCard,
} from '../../pages/ReferendumPage';
import Modal from 'react-modal';
import { Images, Symbols } from '../stableswap/CommonComp';
import {
  RightArrowVE,
  NoResultChart,
  LeftArrowVE,
  NO_RESULT_CHART,
} from '../icon/Referendum';
import {
  createProposal,
  Description,
  IncentiveItem,
} from '../../services/referendum';
import {
  toNonDivisibleNumber,
  percent,
  divide,
  ONLY_ZEROS,
} from '../../utils/numbers';
import {
  ftGetTokensMetadata,
  TokenMetadata,
  ftGetTokenMetadata,
} from '../../services/ft-contract';
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from 'recharts';
import { toRealSymbol } from '../../utils/token';
import _, { before, conformsTo, pad } from 'lodash';
import { CustomSwitch } from '../forms/SlippageSelector';

import { ArrowDownLarge, Radio } from '../../components/icon';
import { FilterIcon } from '../icon/PoolFilter';
import {
  LOVE_TOKEN_DECIMAL,
  VEMETA,
  useVoteDetailHisroty,
} from '../../state/referendum';
import {
  getAccountName,
  getCurrentWallet,
  WalletContext,
} from '../../utils/wallets-integration';
import { Item } from '../airdrop/Item';
import { ShareInFarmV2 } from './ShareInFarm';
import {
  VoteCommon,
  VotePoll,
  VoteDetail,
  addBonus,
} from '../../services/referendum';
import {
  useAccountInfo,
  useVEconfig,
  useUnClaimedRewardsVE,
} from '../../state/referendum';
import SelectToken from '../forms/SelectToken';
import { IconLeft } from '../tokens/Icon';
import { REF_META_DATA, ftGetBalance } from '../../services/ft-contract';
import {
  useTokenPriceList,
  useWhitelistTokens,
  useTokenBalances,
} from '../../state/token';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import { useDepositableBalance, useTokens } from '../../state/token';
import { REF_TOKEN_ID, near, wallet } from '../../services/near';
import { NewFarmInputAmount } from '../forms/InputAmount';
import {
  VoteAction,
  VoteFarm,
  VEConfig,
  Incentive,
} from '../../services/referendum';
import {
  VotedIcon,
  FilterIconVE,
  VEARROW,
  YouVotedAngle,
} from '../icon/Referendum';
import { useClientMobile, isClientMobie } from '../../utils/device';

import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import { getCurrentUnixTime } from '../../services/api';
import { useHistory, useParams } from 'react-router-dom';
import {
  checkAllocations,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import { QuestionTip } from './TipWrapper';
import getConfig from '../../services/config';
import { cos, filter } from 'mathjs';
import { AccountInfo, ReferendumPageContext } from '../../pages/ReferendumPage';
import { SelectTokenForList, tokenPrice } from '../forms/SelectToken';
import {
  removeProposal,
  ProposalStatus,
  Proposal,
} from '../../services/referendum';
import { CloseIcon } from '../icon/Actions';
import { getProposal } from '../../services/referendum';
import { NoResultFilter, DownArrowVE } from '../icon/Referendum';
import QuestionMark from '../farm/QuestionMark';
import {
  ConnectToNearBtnGradient,
  ConnectToNearBtnGradientMoible,
} from '../button/Button';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { DownArrowLightMobile } from '../icon/Arrows';
import { getProposalHashes, ProposalHash } from '../../services/indexer';
import { openUrl } from '../../services/commonV3';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

const VotedOnlyKey = 'REF_FI_GOV_PROPOSAL_VOTED_ONLY';
const BonusOnlyKey = 'REF_FI_GOV_PROPOSAL_BONUS_ONLY';

const CreatedOnlyKey = 'REF_FI_GOV_PROPOSAL_BONUS_ONLY';

const REF_FI_PROPOSALTAB = 'REF_FI_PROPOSALTAB_VALUE';

const hideElementsMobile = () => {
  const elements = document.querySelectorAll('.hiddenOnSecondPage');
  elements.forEach((e) => {
    e.classList.add('xsm:hidden');
  });
  document.body.scrollTop = document.documentElement.scrollTop = 0;
};

const recoverElementsMobile = () => {
  const elements = document.querySelectorAll('.hiddenOnSecondPage');
  elements.forEach((e) => {
    e.classList.remove('xsm:hidden');
  });
};

const reArrangeChartGElements = () => {
  const activeG = document?.getElementsByClassName('active-label')?.[0];
  const pNode = activeG?.parentNode;
  const ppNode = pNode?.parentNode;

  if (ppNode && pNode) {
    ppNode.removeChild(pNode);
    ppNode.appendChild(pNode);
  }
};

export const TokenIcon = ({
  token,
  size,
}: {
  token: TokenMetadata;
  size?: string;
}) => {
  return token?.icon ? (
    <img
      src={token.icon}
      className={`rounded-full w-${size || 6} h-${
        size || 6
      } border border-gradientFrom mr-2`}
    />
  ) : (
    <div
      className={`rounded-full w-${size || 6} h-${
        size || 6
      } border border-gradientFrom mr-2`}
    ></div>
  );
};

export const FilterSelector = ({
  isOpen,
  setIsOpen,
  storageKey,
  textId,
  defaultText,
  className,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  storageKey: string;
  textId: string;
  defaultText: string;
  className?: string;
}) => {
  return (
    <div className={`${className || ''} flex items-center`}>
      <span className="text-xs text-primaryText">
        <FormattedMessage id={textId} defaultMessage={defaultText} />
      </span>

      <CustomSwitch
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        storageKey={storageKey}
      />
    </div>
  );
};

export const FarmMobileSelector = ({
  statusList,
  setStatus,
  curStatus,
  votedOnly,
  setVotedOnly,
  bonusOnly,
  setBonusOnly,
  createdOnly,
  setCreatedOnly,
  filterOpen,
  setFilterOpen,
  className,
  veMeta,
}: {
  statusList: string[];
  setStatus: (status: string) => void;
  curStatus: string;
  votedOnly: boolean;
  setVotedOnly: (votedOnly: boolean) => void;
  bonusOnly: boolean;
  setBonusOnly: (bonusOnly: boolean) => void;
  createdOnly: boolean;
  setCreatedOnly: (createdOnly: boolean) => void;
  filterOpen: boolean;
  setFilterOpen: (filterOpen: boolean) => void;
  className?: string;
  veMeta: VEMETA;
}) => {
  return (
    <div className=" relative">
      <button
        className={`flex items-center  ${
          filterOpen ? 'text-white' : ''
        } ${className}`}
        onClick={() => {
          setFilterOpen(true);
        }}
      >
        <span className="mr-1">
          <FilterIconVE />
        </span>

        <span>
          <FormattedMessage id="filter" defaultMessage={'Filter'} />
        </span>
      </button>
      {!filterOpen ? null : (
        <div
          className="fixed h-screen w-screen right-0 top-0 z-40 bg-black bg-opacity-50"
          onClick={() => {
            setFilterOpen(false);
          }}
        ></div>
      )}

      <div
        className={` absolute z-50 top-8 right-0 bg-selectUI rounded-2xl px-2  text-sm w-28 ${
          filterOpen ? '' : 'hidden'
        }`}
        style={{
          border: '1px solid #415462',
        }}
      >
        {statusList.map((item: string, index) => (
          <p
            key={index}
            onMouseDown={() => {
              setStatus(item);
              setFilterOpen(false);
            }}
            className={`flex rounded-lg items-center p-4 h-5 text-white text-opacity-40 my-2 cursor-pointer hover:bg-black hover:bg-opacity-20 hover:text-opacity-100
            ${
              item == curStatus ? 'bg-black bg-opacity-20 text-opacity-100' : ''
            }
            `}
          >
            {item}
          </p>
        ))}
      </div>
      {/* <div className="flex items-center justify-between pt-4 pb-6 mx-5">
          <div className="text-base font-bold">
            <FormattedMessage id="filter" defaultMessage={'Filter'} />
          </div>

          <button className="pl-2 pb-1" onClick={() => setFilterOpen(false)}>
            <CloseIcon width="12" height="12" />
          </button>
        </div>

        <div className="flex items-center justify-between mx-5">
          {statusList.map((status) => {
            return (
              <button
                className="flex"
                onClick={() => {
                  if (status === curStatus) {
                    setStatus('All');
                  } else {
                    setStatus(status);
                  }
                }}
              >
                <Radio
                  checked={status === curStatus}
                  handleSelect={() => {
                    if (status === curStatus) {
                      setStatus('All');
                    } else {
                      setStatus(status);
                    }
                  }}
                />
                <span className="ml-1.5">{status}</span>
              </button>
            );
          })}
        </div>

        <div className="border-b border-white border-opacity-10 mx-2 mt-4 mb-5"></div>

        <div className="flex flex-col mx-4">
          <FilterSelector
            textId="voted_only"
            defaultText="Voted Only"
            isOpen={votedOnly}
            setIsOpen={setVotedOnly}
            storageKey={VotedOnlyKey}
            className="justify-between mb-4"
          />
          <FilterSelector
            textId="bonus_only"
            defaultText="Bonus Only"
            isOpen={bonusOnly}
            setIsOpen={setBonusOnly}
            storageKey={BonusOnlyKey}
            className="justify-between mb-4"
          />

          <FilterSelector
            textId="created_only"
            defaultText="Created Only"
            isOpen={createdOnly}
            setIsOpen={setCreatedOnly}
            storageKey={CreatedOnlyKey}
            className={`justify-between mb-4`}
          />
        </div> */}
    </div>
  );
};

export const BonusBar = ({
  bright,
  incentiveItem,
  setShowAddBonus,
  tokens,
  yourShare,
  proposal,
  showYourShare,
  showAddBonus,
  totalPrice,
  forDetail,
}: {
  proposal?: Proposal;
  bright: boolean;
  incentiveItem: IncentiveItem | null;
  setShowAddBonus?: (show: boolean) => void;
  tokens?: TokenMetadata[];
  yourShare: string;
  showYourShare: boolean;
  showAddBonus?: boolean;
  totalPrice?: string;
  forDetail?: boolean;
}) => {
  const tokenPriceList = useContext(ReferendumPageContext).tokenPriceList;

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
              incentiveItem?.incentive_amounts?.[i] || '0'
            )
          )
        );
      }, new Big(0))
      .toString() || '0'
  );

  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState?.isSignedIn;

  return (
    <>
      <div
        className={`w-full left-0 h-8 xsm:hidden ${
          bright
            ? 'bg-veGradient'
            : 'bg-transparent border-t border-white border-opacity-10'
        } flex items-center text-center bottom-0 absolute text-sm  text-white`}
      >
        <span className="pl-6 mr-1.5 ">
          <QuestionTip
            color="bright"
            id="bonus_tip"
            uniquenessId={`bonus_tip_${proposal?.id || 'preview'}`}
            defaultMessage="Voting bonus is designed to encourage users to vote. Your bonus depends on your number of shares"
            opacity={
              !bright
                ? 'opacity-50 hover:opacity-80'
                : 'opacity-80 hover:opacity-100'
            }
          />
        </span>
        <span
          className={` pr-1 ${!bright ? 'opacity-50' : ''}  flex items-center`}
        >
          <FormattedMessage id="bonus" defaultMessage={'Bonus'} />:
        </span>

        <span className={` ${!bright ? 'opacity-50' : ''}`}>
          {!prices ? '-' : '$' + toInternationalCurrencySystem(total || '0', 2)}
        </span>

        {tokens?.map((t, i) => {
          return (
            <div
              className={`flex ml-4 items-center ${
                !bright ? 'opacity-50' : ''
              } `}
            >
              <TokenIcon token={t} size={'5'} />
              <span className="ml-1">
                {toPrecision(
                  toReadableNumber(
                    t?.decimals || 24,
                    incentiveItem?.incentive_amounts[i] || '0'
                  ),
                  2
                )}
              </span>
            </div>
          );
        })}
        {!showAddBonus || !isSignedIn ? null : (
          <button
            className={`flex items-center rounded-2xl ml-4 hover:bg-senderHot 
          
          hover:text-black px-2 border border-white border-opacity-30  hover:border-opacity-0 opacity-80
          bg-black bg-opacity-20
          
          `}
            onClick={() => {
              setShowAddBonus(true);
            }}
          >
            <span className="mr-1">+</span>
            <span>
              <FormattedMessage id="bonus" defaultMessage={'Bonus'} />
            </span>
          </button>
        )}

        {!showYourShare ? null : (
          <span className={`absolute right-8 ${!bright ? 'opacity-50' : ''}`}>
            <FormattedMessage
              id="your_shares_ve"
              defaultMessage={'Your Shares'}
            />
            : &nbsp;
            {yourShare}
          </span>
        )}
      </div>

      {forDetail ? (
        <div className="flex flex-col ">
          {!showYourShare ? null : (
            <div
              className={`flex lg:hidden  w-full text-sm mt-3 items-center pb-3 justify-between ${
                !bright ? 'opacity-50' : ''
              }`}
            >
              <span className="">
                <FormattedMessage
                  id="your_shares_ve"
                  defaultMessage={'Your Shares'}
                />
              </span>

              <span>{yourShare}</span>
            </div>
          )}
          <div
            className={`w-full left-0   lg:hidden p-3 ${
              bright || true
                ? 'bg-veGradient'
                : 'bg-transparent border-t border-white border-opacity-10'
            } flex items-center xsm:flex-col xsm:flex -mx-4 text-center bottom-0 relative  text-sm  text-white`}
            style={{
              width: 'calc(100% + 2rem)',
            }}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center text-base">
                <span className="mr-1 ">
                  <QuestionTip
                    color="bright"
                    id="bonus_tip"
                    uniquenessId={`bonus_tip_${proposal?.id || 'preview'}`}
                    defaultMessage="Voting bonus is designed to encourage users to vote. Your bonus depends on your number of shares"
                    opacity={
                      !bright
                        ? 'opacity-50 hover:opacity-80'
                        : 'opacity-80 hover:opacity-100'
                    }
                  />
                </span>
                <span className={`font-bold pr-1 } `}>
                  <FormattedMessage id="bonus" defaultMessage={'Bonus'} />:
                </span>

                <span className={`font-bold `}>
                  {!prices
                    ? '$-'
                    : '$' + toInternationalCurrencySystem(total || '0', 2)}
                </span>
              </div>

              {!showAddBonus || !isSignedIn ? null : (
                <button
                  className={`flex items-center rounded-2xl ml-4 hover:bg-senderHot 
            
            hover:text-black px-2 border border-white border-opacity-30 text-sm  hover:border-opacity-0 opacity-80
            bg-black bg-opacity-20 
            
            `}
                  onClick={() => {
                    setShowAddBonus(true);
                  }}
                >
                  <span className="mr-1">+</span>
                  <span>
                    <FormattedMessage id="bonus" defaultMessage={'Bonus'} />
                  </span>
                </button>
              )}
            </div>

            <div
              className={`w-full flex items-center pt-3 ${
                !tokens || tokens.length === 0 ? 'hidden' : ''
              }`}
            >
              {tokens?.map((t, i) => {
                return (
                  <div
                    className={`flex ${i > 0 ? 'ml-3' : 'ml-0'} items-center ${
                      !bright ? 'opacity-50' : ''
                    } `}
                  >
                    <TokenIcon token={t} size={'5'} />
                    <span className="relative -left-1">
                      {toPrecision(
                        toReadableNumber(
                          t?.decimals || 24,
                          incentiveItem?.incentive_amounts[i] || '0'
                        ),
                        2
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`w-full left-0 h-8  lg:hidden ${
            bright
              ? 'bg-veGradient'
              : 'bg-transparent border-t border-white border-opacity-10'
          } flex items-center justify-between text-center bottom-0 absolute text-sm  text-white`}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <div className="flex items-center">
            <span className="ml-4 mr-1.5 ">
              <QuestionTip
                color="bright"
                id="bonus_tip"
                uniquenessId={`bonus_tip_${proposal?.id || 'preview'}`}
                defaultMessage="Voting bonus is designed to encourage users to vote. Your bonus depends on your number of shares"
                opacity={
                  !bright
                    ? 'opacity-50 hover:opacity-80'
                    : 'opacity-80 hover:opacity-100'
                }
              />
            </span>
            <span className={`pr-1 ${!bright ? 'opacity-50' : ''} `}>
              <FormattedMessage id="bonus" defaultMessage={'Bonus'} />
            </span>

            {!showAddBonus || !isSignedIn ? null : (
              <button
                className={`flex items-center rounded-2xl ml-1 hover:bg-senderHot 
            
            hover:text-black px-2 border border-white border-opacity-30  hover:border-opacity-0 opacity-80
            bg-black bg-opacity-20
            
            `}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowAddBonus(true);
                }}
              >
                <span className="">+</span>
              </button>
            )}
          </div>

          <div className="flex items-center mr-4">
            <span className={`mr-4 ${!bright ? 'opacity-50' : ''}`}>
              {!prices
                ? '-'
                : '$' + toInternationalCurrencySystem(total || '0', 2)}
            </span>
            <Images tokens={tokens} size="4" className="flex-shrink-0" />
          </div>
        </div>
      )}
    </>
  );
};

export const getCurUTCDate = (base?: Date) => {
  let now = new Date();
  if (base) now = new Date(base);
  const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  return utc;
};

export const timeStampToUTC = (ts: number, mobile?: Boolean) => {
  if (mobile) {
    return moment(ts * 1000)
      .utc()
      .format('yyyy-MM-DD HH:mm');
  }
  return moment(ts * 1000)
    .utc()
    .format('yyyy-MM-DD HH:mm:ss');
};

export const dateToUnixTimeSec = (date: Date) => {
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  ).getTime();

  return Math.floor(local / 1000);
};

export const addDays = (days: number, base?: Date) => {
  const curDate = getCurUTCDate(base);
  curDate.setDate(curDate.getDate() + days);

  return curDate;
};

export const addSeconds = (secs: number, base?: Date) => {
  const curDate = getCurUTCDate(base);
  return new Date(curDate.getTime() + secs * 1000);
};

export const addHours = (date: Date, hours?: number) => {
  const newDate = date;

  newDate.setHours(date.getHours() + (hours | 0));

  return newDate;
};

export const CustomDatePicker = ({
  startTime,
  setStartTime,
  setOpenPicker,
  openPicker,
  veconfig,
}: {
  startTime: Date;
  setStartTime: (d: Date) => void;
  openPicker?: boolean;
  setOpenPicker: (o: boolean) => void;
  veconfig: VEConfig;
}) => {
  const minDate = addSeconds(
    (veconfig?.min_proposal_start_vote_offset_sec || 0) + 3600
  );

  const onChange = (date: Date) => {
    setStartTime(date);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const getMinTime = () => {
    if (isSameDay(startTime, minDate)) {
      const h1 = minDate.getHours();

      const m1 = minDate.getMinutes();

      return new Date(
        getCurUTCDate().setHours(m1 > 30 ? h1 + 1 : h1, m1 > 30 ? 0 : 30, 0, 0)
      );
    } else {
      return new Date(getCurUTCDate().setHours(0, 0, 0, 0));
    }
  };

  const getMaxTime = () => {
    return new Date(
      getCurUTCDate().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1
    );
  };

  const getMinDate = () => {
    return minDate;
  };

  return (
    <DatePicker
      showTimeSelect
      selected={startTime}
      onChange={onChange}
      minDate={getMinDate()}
      minTime={getMinTime()}
      maxTime={getMaxTime()}
      dateFormat="yyyy-MM-dd hh:mm:ss aa"
      preventOpenOnFocus={true}
      open={openPicker}
      onClickOutside={(e) => {
        e.stopPropagation();
        setOpenPicker(false);
      }}
      onKeyDown={(e) => {
        e.preventDefault();
      }}
      className="xsm:text-sm"
    />
  );
};

const VotePopUp = (
  props: Modal.Props & {
    tokens?: TokenMetadata[];
    votedThisFarm: string;
    myPower: string;
    ratioOld: string;
    ratioNew: string;
    allocationOld: string;
    allocationNew: string;
    proposal_id: number;
    index: number;
    curVotedVe: string;
  }
) => {
  const {
    tokens,
    votedThisFarm,
    myPower,
    ratioNew,
    ratioOld,
    allocationNew,
    allocationOld,
    proposal_id,
    index,
    curVotedVe,
  } = props;

  const InfoRow = ({
    title,
    value,
  }: {
    title: string | JSX.Element;
    value: string | JSX.Element;
  }) => {
    return (
      <div className="flex items-center justify-between text-sm py-2">
        <span className="text-primaryText">{title}</span>

        <span className="text-white">{value}</span>
      </div>
    );
  };

  return (
    <ModalWrapper title={null} {...props}>
      <div className="flex flex-col items-center">
        <Images tokens={tokens} size={'10'} />
        <div className="py-1"></div>
        <Symbols tokens={tokens} size={'text-xl'} separator={'-'} />

        <div className="pt-7 w-full">
          <InfoRow
            title={<FormattedMessage id="voted" defaultMessage={'Voted'} />}
            value={votedThisFarm}
          />

          <InfoRow
            title={
              <FormattedMessage
                id="my_voting_power"
                defaultMessage={'My voting power'}
              />
            }
            value={myPower}
          />

          <InfoRow
            title={
              <FormattedMessage
                id="new_voting_ratio"
                defaultMessage={'New voting ratio '}
              />
            }
            value={
              <span className="flex items-center">
                <span className="text-primaryText">{ratioOld}</span>
                <span className="px-3">
                  <RightArrowVE />
                </span>

                <span>{ratioNew}</span>
              </span>
            }
          />

          <InfoRow
            title={
              <FormattedMessage
                id="REF_allocation"
                defaultMessage={'REF allocation'}
              />
            }
            value={
              <span className="flex items-center">
                <span className="text-primaryText">{allocationOld}</span>
                <span className="px-3">
                  <RightArrowVE />
                </span>

                <span>{allocationNew}</span>
              </span>
            }
          />
        </div>

        <NewGradientButton
          text={<FormattedMessage id="vote" defaultMessage={'Vote'} />}
          className="w-full text-lg py-4 mt-6"
          onClick={() => {
            VoteFarm({
              proposal_id,
              index,
            });
          }}
          beatStyling
        />
      </div>
    </ModalWrapper>
  );
};

const AddBonusPopUp = (
  props: Modal.Props & {
    title: JSX.Element | string;
    proposal_id: number;
    extraIncentiveTokens?: string[];
    farmProposalIndex?: number;
  }
) => {
  // TODO: get vemeta out

  const { proposal_id, extraIncentiveTokens, farmProposalIndex } = props;

  const veMeta = useVEmeta();

  const [selectToken, setSelectToken] = useState<TokenMetadata>(REF_META_DATA);

  const [hoverSelectToken, setHoverSelectToken] = useState<boolean>(false);

  const tokenIds = [
    ...(extraIncentiveTokens || []),
    ...(veMeta?.whitelisted_incentive_tokens || []),
  ];

  const tokens = useTokens(new Array(...new Set(tokenIds)));

  const nearBalance = useDepositableBalance('NEAR');

  const balance = useDepositableBalance(
    selectToken.id === WRAP_NEAR_CONTRACT_ID ? 'NEAR' : selectToken.id
  );

  const [displayBalance, setDisplayBalance] = useState<string>(
    toPrecision(
      toReadableNumber(
        selectToken.decimals,
        selectToken.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : balance
      ) || '0',
      2
    )
  );

  useEffect(() => {
    setDisplayBalance(
      toPrecision(
        toReadableNumber(
          selectToken.decimals,
          selectToken.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : balance
        ) || '0',
        2
      )
    );
  }, [balance, nearBalance]);

  const [value, setValue] = useState<string>('');

  const getMax = function (id: string, max: string) {
    return id !== WRAP_NEAR_CONTRACT_ID
      ? max
      : Number(max) <= 0.5
      ? '0'
      : String(Number(max) - 0.5);
  };

  return (
    <ModalWrapper {...props} overflow="visible">
      <div className="flex items-center justify-between py-5">
        <SelectTokenForList
          tokens={tokens || []}
          onSelect={setSelectToken}
          selected={
            <div
              className="flex font-semibold "
              onMouseEnter={() => setHoverSelectToken(true)}
              onMouseLeave={() => setHoverSelectToken(false)}
            >
              {selectToken ? (
                <IconLeft
                  token={selectToken}
                  hover={hoverSelectToken}
                  size="8"
                />
              ) : null}
            </div>
          }
        />

        <div className="text-xs text-primaryText flex items-center">
          <FormattedMessage id="balance" defaultMessage={'Balance'} />: &nbsp;
          <span>{displayBalance}</span>
        </div>
      </div>

      <NewFarmInputAmount
        max={
          getMax(
            selectToken.id,
            toReadableNumber(
              selectToken.decimals,
              selectToken.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : balance
            )
          ) || '0'
        }
        value={value}
        onChangeAmount={setValue}
      />

      <NewGradientButton
        text={<FormattedMessage id="deposit" defaultMessage={'Deposit'} />}
        className="w-full mt-8"
        disabled={
          !value ||
          !selectToken ||
          new Big(value).gt(
            getMax(
              selectToken.id,
              toReadableNumber(
                selectToken.decimals,
                selectToken.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : balance
              )
            )
          ) ||
          ONLY_ZEROS.test(value)
        }
        onClick={() => {
          addBonus({
            tokenId: selectToken.id,
            amount: value,
            incentive_key:
              typeof farmProposalIndex === 'undefined' ? 0 : farmProposalIndex,
            proposal_id,
          });
        }}
        beatStyling
      />
    </ModalWrapper>
  );
};

export const TIMESTAMP_DIVISOR = 1000000000;

enum PROPOSAL_TAB {
  FARM = 'FARM',
  GOV = 'GOV',
}
const PAIR_SEPERATOR = '|';
const seedIdSeparator = '&';

export const VotingGauge = getConfig().VotingGauge;

export const durationFomatter = (duration: moment.Duration) => {
  return `${Math.floor(
    duration.asDays()
  )}d: ${duration.hours()}h: ${duration.minutes()}m`;
};

const VoteChart = ({
  options,
  ratios,
  forDetail,
}: {
  options: string[];
  ratios: string[];
  forDetail?: boolean;
}) => {
  const data = ratios.map((r, i) => {
    return {
      name: options[i],
      value: Math.round(Number(r) * 100) / 100,
    };
  });

  if (
    !options ||
    !ratios ||
    data?.length === 0 ||
    ratios.every((r) => Number(r) === 0)
  )
    return (
      <div className="pr-10 xsm:pr-0">
        <NoResultChart expand={forDetail ? '1.25' : ''} />
      </div>
    );

  const [activeIndex, setActiveIndex] = useState<number>(-1);

  function customLabel(props: any) {
    let { cx, cy, index, value, name, x, y, midAngle } = props;
    const RADIAN = Math.PI / 180;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x1 = cx + radius * Math.cos(-midAngle * RADIAN);
    const y1 = cy + radius * Math.sin(-midAngle * RADIAN);

    if (index !== activeIndex) return null;

    return (
      <g height={70}>
        <foreignObject
          x={cx - (forDetail ? 50 : 35)}
          y={cy - 20}
          width={60}
          height={55}
        >
          <div
            className="pt-1 pb-2 px-1 flex flex-col rounded-lg bg-voteLabel text-xs border border-black border-opacity-10"
            style={{
              backdropFilter: 'blur(30px)',
            }}
          >
            <div className="flex items-center justify-between pb-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm mr-1 flex-shrink-0 "
                style={{
                  backgroundColor: OPTIONS_COLORS[activeIndex] || '#8EA0CF',
                }}
              ></div>

              <div className="text-right truncate" title={name}>
                {name}
              </div>
            </div>
            <div className="self-end">{value}%</div>
          </div>
        </foreignObject>
      </g>
    );
  }

  const innerRadius = forDetail ? 62 : 42;
  const outerRadius = forDetail ? 80 : 60;
  return (
    <ResponsiveContainer
      className={`flex items-center relative right-${forDetail ? 0 : 5}`}
      width={161}
      height={forDetail ? 161 : 121}
    >
      <PieChart>
        <Pie
          data={data}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          labelLine={false}
          cx="50%"
          cy="50%"
          activeIndex={activeIndex}
          label={customLabel}
          isAnimationActive={false}
        >
          {data.map((entry, index) => {
            return (
              <Cell
                key={`cell-${index}`}
                fill={OPTIONS_COLORS[options.indexOf(entry.name)] || '#8EA0CF'}
                stroke="#304048"
                strokeOpacity={10}
                strokeWidth={2}
                onMouseEnter={() => {
                  setActiveIndex(index);
                }}
                onMouseLeave={() => {
                  setActiveIndex(-1);
                }}
              />
            );
          })}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const OPTIONS_COLORS = [
  '#00D6AF',
  '#855DF8',
  '#5A6780',
  '#8EA0CF',
  '#57678F',
  '#464F65',
  '#3D455B',
];

function SelectUI({
  onChange,
  list,
  curvalue,
  shrink,
  className,
  size,
  labelClassName,
  dropDownClassName,
  canSelect,
  notshowOption,
  brightClick,
  forMobileFarm,
  dropDownItemClassName,
}: {
  onChange: (e: any) => void;
  list: string[];
  curvalue: string;
  shrink?: string;
  className?: string;
  size?: string;
  labelClassName?: string;
  dropDownClassName?: string;
  canSelect?: boolean;
  notshowOption?: boolean;
  brightClick?: boolean;
  forMobileFarm?: boolean;
  dropDownItemClassName?: string;
}) {
  const [showSelectBox, setShowSelectBox] = useState(false);
  const switchSelectBoxStatus = () => {
    canSelect && setShowSelectBox(!showSelectBox);
  };
  const hideSelectBox = () => {
    setShowSelectBox(false);
  };
  return (
    <div
      className={`${className} relative flex ${
        shrink ? 'items-end' : 'items-center '
      } outline-none ${
        brightClick
          ? !showSelectBox && !forMobileFarm
            ? 'opacity-70'
            : 'opacity-100'
          : ''
      }`}
    >
      <span
        onClick={switchSelectBoxStatus}
        tabIndex={-1}
        onBlur={hideSelectBox}
        className={` ${labelClassName}  ${
          forMobileFarm
            ? showSelectBox
              ? 'text-white border-gradientFrom'
              : 'text-primaryText border-primaryText'
            : ''
        } flex items-center justify-between bg-black bg-opacity-20 w-24 h-5 rounded-md px-2.5 py-3  cursor-pointer ${
          size || 'text-xs'
        } outline-none ${shrink ? 'xsm:w-8 md:w-8' : ''} text-white`}
      >
        <label className={` whitespace-nowrap ${shrink ? 'xsm:hidden ' : ''}`}>
          {notshowOption ? (
            <FormattedMessage id="sort_by" defaultMessage={'Sort by'} />
          ) : curvalue ? (
            <FormattedMessage id={curvalue} />
          ) : null}
        </label>
        <span className="text-primaryText">
          {brightClick ? (
            showSelectBox ? (
              <div className="transform rotate-180 relative bottom-0.5 text-white">
                <ArrowDownLarge />
              </div>
            ) : (
              <ArrowDownLarge />
            )
          ) : (
            <ArrowDownLarge />
          )}
        </span>
      </span>
      <div
        className={`${
          dropDownClassName || 'w-28'
        } absolute z-50 top-8 right-0 bg-selectUI rounded-2xl px-2  text-sm ${
          showSelectBox ? '' : 'hidden'
        }`}
        style={{
          border: '1px solid #415462',
        }}
      >
        {list.map((item: string, index) => (
          <p
            key={index}
            onMouseDown={() => {
              onChange(item);
            }}
            className={`${dropDownItemClassName} flex rounded-lg items-center p-4 h-5 text-white text-opacity-40 my-2 cursor-pointer whitespace-nowrap hover:bg-black hover:bg-opacity-20 hover:text-opacity-100
            ${item == curvalue ? 'bg-black bg-opacity-20 text-opacity-100' : ''}
            `}
          >
            {<FormattedMessage id={item} />}
          </p>
        ))}
      </div>
    </div>
  );
}

export const ProposalWrapper = (
  props: any & {
    show: boolean;
    bgcolor?: string;
    padding?: string;
    className?: string;
  }
) => {
  const { padding, show, bgcolor, className } = props;
  return (
    <Card
      padding={`${padding || 'p-8'} xsm:px-0`}
      width="w-full"
      bgcolor={bgcolor}
      className={
        !show ? 'hidden' : `text-primaryText  xsm:bg-transparent ${className}`
      }
    >
      {props.children}
    </Card>
  );
};

export const GradientWrapper = (props: any & { padding: string }) => {
  return (
    <Card className="w-full" bgcolor="bg-veCardGradient" {...props}>
      {props.children}
    </Card>
  );
};

export const PreviewPopUp = (
  props: Modal.Props & {
    title: JSX.Element | string;
    customWidth?: string;
    customHeight?: string;
    timeDuration?: JSX.Element;
    show: boolean;
    setShow: (s: boolean) => void;
    turnOut: string;
    totalVE: string;
    options: string[];
    voted?: VoteAction | 'VoteReject' | 'VoteApprove';
    link: string;
    contentTitle: string;
    type: string;
    index: number;
    startTime: Date;
    setStartTime: (d: Date) => void;
    endTime: Date;
    setEndTime: (d: Date) => void;
  }
) => {
  const {
    title,
    link,
    setShow,
    timeDuration,
    show,
    turnOut,
    totalVE,
    options,
    voted,
    contentTitle,
    type,
    index,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
  } = props;

  const displayLink =
    (new RegExp('https://').test(link) || new RegExp('http://').test(link)) &&
    link.indexOf(link) === 0
      ? link
      : `https://${link}`;

  const intl = useIntl();

  const data = options.map((o, i) => {
    return {
      option: o,
      v: '0',
      ratio: `0`,
    };
  });

  const isClientMobie = useClientMobile();

  const InfoRow = ({
    name,
    value,
    nameClass,
    valueClass,
    valueTitle,
    className,
  }: {
    name: string | JSX.Element;
    value: string | JSX.Element;
    nameClass?: string;
    valueClass?: string;
    valueTitle?: string;
    className?: string;
  }) => {
    return (
      <div className={`py-2.5 flex items-center ${className} `}>
        <span className={`${nameClass} text-primaryText`}>{name}</span>
        <span className={`${valueClass} ml-3`}>{value}</span>
      </div>
    );
  };

  const [mobileOptionDisplay, setMobileOptionDisplay] =
    useState<string>('ratio');

  return (
    <>
      {isClientMobie && show ? (
        <div className="text-white text-sm relative">
          <div className={`text-center relative text-xl pb-7 xsm:pb-3`}>
            <span className="text-lg">
              <FormattedMessage id="preview" defaultMessage={'Preview'} />
            </span>

            <button
              className="absolute left-0 pr-2 top-2 xsm:top-0 text-sm text-primaryText flex items-center"
              onClick={() => setShow(false)}
            >
              <span className=" lg:hidden pl-2 font-bold text-xl">{'<'}</span>
            </button>
          </div>

          <Card
            className="w-full relative overflow-hidden xsm:mb-10"
            bgcolor="bg-black bg-opacity-20 xsm:bg-white xsm:bg-opacity-10"
            padding={`px-10 pt-9 pb-14 xsm:px-4 xsm:py-6 xsm:pb-0`}
          >
            <div className="pb-4 border-b border-white border-opacity-10 px-2 pt-8 xsm:pt-0 text-white text-xl mb-4 xsm:mb-0">
              {contentTitle}
            </div>

            <InfoRow
              name={intl.formatMessage({
                id: 'Creator',
                defaultMessage: 'Creator',
              })}
              value={getAccountName(getCurrentWallet().wallet.getAccountId())}
              valueClass={'font-bold'}
              valueTitle={getCurrentWallet().wallet.getAccountId()}
              className="xsm:py-2.5"
            />

            <InfoRow
              name={intl.formatMessage({
                id: 'voting_period',
                defaultMessage: 'Voting Period',
              })}
              value={`${moment(startTime).format('yyyy-MM-DD HH:mm')} - ${
                !endTime ? '/' : moment(endTime).format('yyyy-MM-DD HH:mm')
              } UTC`}
              className="xsm:flex-col xsm:items-start"
              valueClass="xsm:ml-0 xsm:pt-2.5"
            />

            <div className=" flex items-center justify-center relative top-0 self-start xsm:py-8">
              <NoResultChart expand="1.25" />
            </div>

            <div className="lg:hidden  w-full xsm:flex-col  relative flex items-center justify-between pb-4 border-b border-white border-opacity-10">
              <div className="flex items-center justify-between w-full">
                <InfoRow
                  name={intl.formatMessage({
                    id: 'turn_out',
                    defaultMessage: 'Turnout',
                  })}
                  value={turnOut}
                  className=" lg:hidden xsm:flex-col "
                  valueClass="xsm:ml-0 xsm:items-start"
                />
                <InfoRow
                  name={intl.formatMessage({
                    id: 'voted_veLPT',
                    defaultMessage: 'Voted veLPT',
                  })}
                  value={toPrecision(totalVE, 2)}
                  valueClass="xsm:ml-0 "
                  className="xsm:flex-col xsm:items-end"
                />
              </div>

              <div className="flex items-center justify-between w-full lg:hidden mt-8 text-primaryText">
                <div>
                  <FormattedMessage id="options" defaultMessage={'options'} />
                </div>
                <div className="flex items-center ">
                  <span
                    className={`pr-1.5 border-r border-primaryText border-opacity-30 ${
                      mobileOptionDisplay === 'ratio' ? 'text-white' : ''
                    }`}
                    onClick={() => {
                      setMobileOptionDisplay('ratio');
                    }}
                  >
                    <FormattedMessage id="ratio" defaultMessage={'Ratio'} />
                  </span>
                  <span
                    className={`pl-1.5 ${
                      mobileOptionDisplay === 'velpt' ? 'text-white' : ''
                    }`}
                    onClick={() => {
                      setMobileOptionDisplay('velpt');
                    }}
                  >
                    veLPT
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mt-8 xsm:mt-4 ">
              <div className="w-4/5 xsm:w-full text-primaryText flex flex-col ml-16 xsm:ml-0 pb-6 xsm:pb-0">
                <div className="grid xsm:hidden  grid-cols-10 pb-5 xsm:pb-0 px-6 xsm:px-4">
                  <span className="col-span-6 ">
                    <FormattedMessage id="options" defaultMessage={'Options'} />
                  </span>
                  <span className="col-span-2  ">
                    <FormattedMessage id="ratio" defaultMessage={'Ratio'} />
                  </span>
                  <span className="col-span-2 text-right">veLPT</span>
                </div>

                <div className="flex flex-col w-full text-white xsm:border-b xsm:mb-4 border-white border-opacity-10">
                  {data?.map((d, i) => {
                    return (
                      <div className="grid grid-cols-10 xsm:flex xsm:items-center xsm:justify-between hover:bg-chartBg hover:bg-opacity-20 rounded-lg px-6 xsm:px-0 py-4">
                        <span className="col-span-6 flex items-center">
                          <div
                            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                            style={{
                              backgroundColor:
                                OPTIONS_COLORS[options.indexOf(d.option)] ||
                                '#8EA0CF',
                            }}
                          ></div>
                          <span
                            className="mx-2"
                            style={{
                              maxWidth: isClientMobie ? '180px' : '60%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={d.option}
                          >
                            {d.option}
                          </span>
                        </span>
                        {isClientMobie && mobileOptionDisplay === 'ratio' ? (
                          <span className="col-span-2 ">{d.ratio}%</span>
                        ) : null}

                        {isClientMobie && mobileOptionDisplay === 'velpt' ? (
                          <span className="col-span-2 text-right">{d.v}</span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <BorderGradientButton
              className="flex items-center justify-center h-full"
              onClick={() => {
                openUrl(displayLink);
              }}
              text={
                <span className="flex items-center">
                  <span>
                    <FormattedMessage
                      id="forum_discussion"
                      defaultMessage={'Forum Discussion'}
                    />
                  </span>

                  <span className="text-white hover:text-senderHot ml-2">
                    <VEARROW />
                  </span>
                </span>
              }
              width="h-8 lg:hidden mb-4 min-w-40"
              padding="px-2"
            />
            <BonusBar
              incentiveItem={null}
              bright
              showYourShare={false}
              yourShare={'-'}
              showAddBonus={false}
              forDetail
            />
          </Card>
          <div className="flex items-center justify-end -bottom-14 text-sm xsm:absolute xsm:right-0 xsm:w-full">
            <BorderGradientButton
              text={
                <FormattedMessage id="go_back" defaultMessage={'Go back'} />
              }
              color={isClientMobie ? '#011320' : '#192734 '}
              onClick={props.onRequestClose}
              width="w-1/2 h-10 mr-1 xsm:w-1/2 xsm:mr-2 xsm:h-10"
              className="w-full h-full"
              padding="p-0"
            />

            <NewGradientButton
              text={<FormattedMessage id="create" defaultMessage={'Create'} />}
              disabled={
                !endTime ||
                !link?.trim() ||
                !contentTitle?.trim() ||
                options.filter((_) => !!_.trim()).length < 2
              }
              padding="p-0"
              className="w-1/2 ml-1 h-10 text-sm"
              beatStyling
              onClick={() => {
                createProposal({
                  description: {
                    title: `${contentTitle}`,
                    link,
                  },
                  duration_sec:
                    dateToUnixTimeSec(endTime) - dateToUnixTimeSec(startTime),
                  kind: type === 'Poll' ? 'Poll' : 'Common',
                  options,
                  start: dateToUnixTimeSec(startTime),
                });
              }}
            />
          </div>
        </div>
      ) : (
        <ModalWrapper {...props}>
          <Card
            className="w-full relative overflow-auto mt-9"
            bgcolor="bg-black bg-opacity-20 "
            padding={`px-10 pb-9  `}
          >
            <div className="pb-4 border-b border-white border-opacity-10 px-2 pt-8 text-white text-xl mb-4">
              {contentTitle}
            </div>

            <InfoRow
              name={intl.formatMessage({
                id: 'Creator',
                defaultMessage: 'Creator',
              })}
              value={`${getAccountName(
                getCurrentWallet().wallet.getAccountId()
              )}`}
              valueClass={'font-bold'}
              valueTitle={getCurrentWallet().wallet.getAccountId()}
            />

            <InfoRow
              name={intl.formatMessage({
                id: 'voting_period',
                defaultMessage: 'Voting Period',
              })}
              value={`${moment(startTime).format('yyyy-MM-DD HH:mm:ss')} - ${
                !endTime ? '/' : moment(endTime).format('yyyy-MM-DD HH:mm:ss')
              } UTC`}
            />
            <InfoRow
              name={intl.formatMessage({
                id: 'turn_out',
                defaultMessage: 'Turnout',
              })}
              value={turnOut}
            />
            <div className="w-full relative flex items-center justify-between pb-4 border-b border-white border-opacity-10">
              <InfoRow
                name={intl.formatMessage({
                  id: 'voted_veLPT',
                  defaultMessage: 'Voted veLPT',
                })}
                value={toPrecision(totalVE, 2)}
              />

              <button
                className={`flex items-center ${
                  !link ? 'cursor-not-allowed' : ''
                } `}
                onClick={() => {
                  link && openUrl(displayLink);
                }}
              >
                <span>
                  <FormattedMessage
                    id="forum_discussion"
                    defaultMessage={'Forum Discussion'}
                  />
                </span>

                <span className="text-gradientFrom ml-2">
                  <VEARROW />
                </span>
              </button>
            </div>

            <div className="flex items-center justify-center mt-8 pb-6">
              <div className="w-1/5 flex items-center justify-center self-start pt-10">
                <NoResultChart expand="1.25" />
              </div>

              <div className="w-4/5 text-primaryText flex flex-col ml-16 pb-6 ">
                <div className="grid grid-cols-10 pb-5 px-6">
                  <span className="col-span-6 ">
                    <FormattedMessage id="options" defaultMessage={'Options'} />
                  </span>
                  <span className="col-span-2  ">
                    <FormattedMessage id="ratio" defaultMessage={'Ratio'} />
                  </span>
                  <span className="col-span-2 text-right">veLPT</span>
                </div>

                <div className="flex flex-col w-full text-white">
                  {data?.map((d, i) => {
                    return (
                      <div className="grid grid-cols-10 hover:bg-chartBg hover:bg-opacity-20 rounded-lg px-6 py-4">
                        <span className="col-span-6 flex items-center">
                          <div
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{
                              backgroundColor:
                                OPTIONS_COLORS[i % OPTIONS_COLORS.length] ||
                                'black',
                            }}
                          ></div>
                          <span
                            className="mx-2 truncate w-3/5"
                            title={d.option}
                          >
                            {d.option}
                          </span>
                        </span>

                        <span className="col-span-2 ">
                          {toPrecision(scientificNotationToString(d.ratio), 2)}%
                        </span>

                        <span className="col-span-2 text-right">
                          {toPrecision(d.v, 2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-end pt-8">
            <NewGradientButton
              text={<FormattedMessage id="create" defaultMessage={'Create'} />}
              disabled={
                !endTime ||
                !link?.trim() ||
                !contentTitle?.trim() ||
                options.filter((_) => !!_.trim()).length < 2
              }
              padding="p-0"
              className="w-28 h-8 text-sm"
              beatStyling
              onClick={() => {
                createProposal({
                  description: {
                    title: `${contentTitle}`,
                    link,
                  },
                  duration_sec:
                    dateToUnixTimeSec(endTime) - dateToUnixTimeSec(startTime),
                  kind: type === 'Poll' ? 'Poll' : 'Common',
                  options,
                  start: dateToUnixTimeSec(startTime),
                });
              }}
            />
          </div>
        </ModalWrapper>
      )}
    </>
  );
};

const FarmChart = ({
  ratio,
  size,
  voted,
  innerRadiusProp,
  outerRadiusProp,
  forLastRound,
  proposal,
  voteDetail,
  voteHistory,
}: {
  ratio: {
    name: string;
    value: number;
    pairSymbol: string;
    tokens: TokenMetadata[];
    allocation: string;
    r: string;
    veLPT: string;
    poolId: string;
  }[];
  size: number;
  voted: number;
  innerRadiusProp?: number;
  outerRadiusProp?: number;
  forLastRound?: boolean;
  proposal: Proposal;
  voteDetail: VoteDetail;
  voteHistory: VoteDetail;
}) => {
  if (!ratio) return null;

  const isClientMobie = useClientMobile();

  const intl = useIntl();

  const votedAmount =
    voteDetail?.[proposal?.id]?.amount || voteHistory?.[proposal?.id]?.amount;

  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    reArrangeChartGElements();
  }, [activeIndex]);

  const emptyVote = ratio.every((r, i) => r.value === 0);

  const data = emptyVote
    ? ratio.map((r, i) => {
        const newr = JSON.parse(JSON.stringify(r));
        newr.value = (1 / ratio.length) * 0.99;
        return {
          ...newr,
          index: i,
        };
      })
    : ratio
        .filter((r, i) => r.value > 0)
        .map((r, i) => {
          return {
            ...r,
            index: i,
          };
        });

  const totalVotes = BigNumber.sum(...proposal.votes);

  const ActiveLabel = ({ activeIndex }: { activeIndex: number }) => {
    const activeFarm = data[activeIndex];

    const votedIndex = proposal.kind.FarmingReward.farm_list.indexOf(
      activeFarm.name
    );

    const afterRatio = new BigNumber(
      proposal.votes[
        proposal.kind.FarmingReward.farm_list.indexOf(activeFarm.name)
      ]
    ).div(totalVotes.gt(0) ? totalVotes : 1);

    const beforeRatio = new BigNumber(
      proposal.votes[
        proposal.kind.FarmingReward.farm_list.indexOf(activeFarm.name)
      ]
    )
      .minus(votedAmount)
      .div(
        totalVotes.minus(votedAmount).gt(0) ? totalVotes.minus(votedAmount) : 1
      );

    const contribution = scientificNotationToString(
      afterRatio.minus(beforeRatio).times(100).toString()
    );

    const votedThisActiveOption =
      ratio[voted] && ratio[voted]?.name === data[activeIndex]?.name;

    const displayContribution = new BigNumber(votedAmount).eq(
      new BigNumber(proposal?.votes?.[votedIndex] || '0')
    )
      ? ratio[votedIndex].r
      : new BigNumber(
          proposal.votes[
            proposal.kind.FarmingReward.farm_list.indexOf(activeFarm.name)
          ]
        ).eq(BigNumber.sum(...proposal.votes))
      ? new BigNumber(votedAmount)
          .div(
            BigNumber.sum(...proposal.votes).gt(0)
              ? BigNumber.sum(...proposal.votes)
              : 1
          )
          .times(100)
          .toString()
      : contribution;

    return (
      <div
        className={`rounded-2xl w-full flex flex-col xsm:text-xs text-sm`}
        style={{
          backgroundColor: 'rgba(26, 35, 41, 0.6)',
          backdropFilter: 'blur(50px)',
          WebkitBackdropFilter: 'blur(50px)',
        }}
      >
        <div className="bg-black rounded-t-2xl p-3 bg-opacity-30">
          <div className="flex items-center justify-between w-full">
            <Images
              className={
                forLastRound || votedThisActiveOption ? '' : 'relative top-2'
              }
              tokens={activeFarm.tokens}
              size={forLastRound ? '6' : '7'}
            />
            <div
              className={`flex items-center ${
                votedThisActiveOption ? 'valueStyleVE' : ''
              }  `}
            >
              <Symbols tokens={activeFarm.tokens} separator={'-'} />
            </div>
          </div>
          {activeFarm.poolId ? (
            <div className="flex items-center justify-end">
              {votedThisActiveOption ? <YouVotedButton /> : null}

              <div className="ml-2 text-white text-right">{`#${activeFarm.poolId}`}</div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center px-3 pt-3 justify-between pb-2">
          <span
            className={`text-primaryText whitespace-nowrap ${
              forLastRound && (intl.locale === 'uk' || intl.locale === 'ru')
                ? 'text-xs'
                : ''
            }`}
          >
            <FormattedMessage id="voted_veLPT" defaultMessage={'Voted veLPT'} />
          </span>

          <span className="text-white">
            {toPrecision(activeFarm.veLPT, 2, true)}
          </span>
        </div>

        <div className="flex items-center px-3 justify-between pb-2">
          <span className="text-primaryText">
            <FormattedMessage id="ratio" defaultMessage={'Ratio'} />
          </span>

          <span className="text-white">{activeFarm.r}</span>
        </div>

        <div className="flex items-center px-3 pb-2 justify-between">
          <span className="text-primaryText">
            <FormattedMessage
              id="REF_allocation"
              defaultMessage={'REF allocation'}
            />
          </span>

          <span className="text-white">{activeFarm.allocation}</span>
        </div>

        {ratio?.[voted] && ratio?.[voted]?.name === activeFarm.name ? (
          <div className="flex items-center px-3 justify-between pb-2.5">
            <span className="text-primaryText">
              <FormattedMessage
                id="your_contribution"
                defaultMessage={'Your contribution'}
              />
            </span>

            <span className="text-white">
              {'+' + toPrecision(displayContribution, 2) + '%'}
            </span>
          </div>
        ) : null}
      </div>
    );
  };

  const color = ['#51626B', '#667A86', '#849DA8', '#B5C9CA'];

  function CustomLabel(props: any) {
    let {
      cx,
      cy,
      x,
      y,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      pairSymbol,
      index,
      r,
    } = props;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;

    const x1 = cx + radius * Math.cos(-midAngle * RADIAN);

    const y1 = cy + radius * Math.sin(-midAngle * RADIAN);

    const cos = Math.cos(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);

    if (y < cy) {
      y = y - 30;
    }

    const thereshR = Number(r.substring(0, r.length - 1));

    reArrangeChartGElements();

    const votedThisOption =
      ratio[voted] && ratio[voted]?.name === data[index]?.name;

    const width = forLastRound
      ? isClientMobie
        ? '210'
        : '220'
      : isClientMobie
      ? '210'
      : `250`;

    const height = forLastRound
      ? votedThisOption
        ? '190'
        : '170'
      : votedThisOption
      ? '200'
      : '190';
    const labelx = x1 + Number(width) * (cos > 0 ? -1 : 0);

    return (
      <g
        className={`${activeIndex === index ? 'active-label' : 'sleep-label'}`}
      >
        <defs>
          <linearGradient id="votedIndex" x1="0" x2="100%" y1="0" y2="0%">
            <stop stopColor="#00C6A2" offset="0%" stopOpacity={'1'} />

            <stop stopColor="#7F43FF" offset="100%" stopOpacity={'1'} />
          </linearGradient>
        </defs>
        <text
          x={
            x +
            (isClientMobie ? (pairSymbol.length > 10 ? 18 : 15) : 0) *
              (cos > 0 ? -1 : 1)
          }
          y={thereshR < 3 && !emptyVote ? y : y - 10}
          fontSize={isClientMobie ? '12px' : '14px'}
          fontWeight="bold"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fill={votedThisOption ? 'url(#votedIndex)' : '#91a2ae'}
        >
          {pairSymbol}
        </text>

        {thereshR < 3 && !emptyVote ? null : (
          <text
            x={
              x +
              (isClientMobie ? (pairSymbol.length > 10 ? 18 : 15) : 0) *
                (cos > 0 ? -1 : 1)
            }
            y={y + 8}
            fill="white"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
          >
            {`${emptyVote ? '-' : (percent * 100).toFixed(2)}%`}
          </text>
        )}

        {index === activeIndex ? (
          <foreignObject
            x={labelx}
            y={
              y1 +
              Number(height) * (votedThisOption ? 1 : 0.9) * (sin < 0 ? 0 : -1)
            }
            height={height}
            width={width}
            className="option-info-label"
          >
            <ActiveLabel activeIndex={activeIndex} />
          </foreignObject>
        ) : null}
      </g>
    );
  }

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
      index,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius - 2) * cos;
    const sy = cy + (outerRadius - 2) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 30;
    const ey = my;

    return activeIndex === index ? (
      <g
        onMouseLeave={() => {
          setActiveIndex(-1);
        }}
      >
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={0}
          outerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={'#00FFD1'}
          opacity="0.1"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius - 10}
          outerRadius={outerRadius}
          fill={'#00FFD1'}
          stroke={'#1D2932'}
          strokeWidth={2}
        />
      </g>
    ) : (
      <g
        onMouseEnter={() => {
          setActiveIndex(index);
        }}
      >
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={0}
          outerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={color[activeIndex]}
          opacity="0.1"
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill={color[activeIndex]}
          stroke={'#1D2932'}
          strokeWidth={2}
        />
      </g>
    );
  };

  const innerRadius = isClientMobie
    ? forLastRound
      ? 60
      : 70
    : innerRadiusProp || 140;
  const outerRadius = isClientMobie
    ? forLastRound
      ? 75
      : 85
    : outerRadiusProp || 170;
  return (
    <ResponsiveContainer
      width={'100%'}
      height={
        isClientMobie ? (forLastRound ? 360 : 390) : forLastRound ? 450 : 575
      }
      className={`relative  ${
        !isClientMobie
          ? ''
          : !forLastRound
          ? 'xsm:bottom-10 farmChartScreenWidth'
          : 'farmChartScreenWidthLastRound'
      } `}
    >
      <PieChart>
        <Pie
          className={`recharts-pie-propopsal-${proposal.id}`}
          data={data}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          labelLine={false}
          label={CustomLabel}
          cx="50%"
          cy="50%"
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          isAnimationActive={false}
        >
          {data.map((entry, index) => {
            return (
              <Cell
                key={`cell-${index}`}
                fill={color[index]}
                stroke="#1D2932"
                strokeWidth={2}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
              />
            );
          })}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const GovItemDetail = ({
  show,
  proposal,
  setShow,
  timeDuration,
  description,
  turnOut,
  totalVE,
  options,
  voted,
  forPreview,
  veShare,
  unClaimed,
  yourShare,
  incentiveTokens,
  status,
  setStatus,
  setCounterDownStirng,
  base,
  counterDownStirng,
  transaction_hash,
}: {
  show?: number;
  proposal: Proposal;
  setShow: (s: number) => void;
  timeDuration?: JSX.Element;
  description: Description;
  turnOut: string;
  totalVE: string;
  options: string[];
  voted: VoteAction | 'VoteReject' | 'VoteApprove';
  forPreview?: boolean;
  veShare: string;
  unClaimed?: boolean;
  yourShare?: string;
  incentiveTokens?: TokenMetadata[];
  status: ProposalStatus;
  setStatus: (s: ProposalStatus) => void;
  base: number;
  setCounterDownStirng: (s: string) => void;
  counterDownStirng: string;
  transaction_hash?: string;
}) => {
  const intl = useIntl();

  const startTime = Math.floor(Number(proposal?.start_at) / TIMESTAMP_DIVISOR);
  const endTime = Math.floor(Number(proposal?.end_at) / TIMESTAMP_DIVISOR);

  const link = description.link;

  const displayLink =
    (new RegExp('https://').test(link) || new RegExp('http://').test(link)) &&
    link.indexOf(link) === 0
      ? link
      : `https://${link}`;

  const dataRaw = (
    proposal?.kind?.Common ? proposal?.votes?.slice(0, 2) : proposal?.votes
  )?.map((v, i) => {
    return {
      option: proposal?.kind?.Common
        ? i === 0
          ? 'Yes'
          : 'No'
        : proposal?.kind?.Poll?.options?.[i],
      v: toReadableNumber(LOVE_TOKEN_DECIMAL, v || '0'),
      ratio: toPrecision(
        scientificNotationToString(
          new Big(toReadableNumber(LOVE_TOKEN_DECIMAL, v || '0'))
            .div(new Big(Number(totalVE) > 0 ? totalVE : 1))
            .times(100)
            .toString()
        ),
        2
      ),
    };
  });

  const ratios = checkAllocations(
    ONLY_ZEROS.test(totalVE) ? '0' : '100',
    dataRaw?.map((d) => d.ratio)
  );

  const [mobileOptionDisplay, setMobileOptionDisplay] =
    useState<string>('ratio');

  const veLPTs = checkAllocations(
    toPrecision(totalVE, 2),
    dataRaw?.map((d) => toPrecision(d.v, 2))
  );

  const data = dataRaw.map((d, i) => {
    (d.ratio = ratios[i]), (d.v = veLPTs[i]);
    return d;
  });

  const isClientMobie = useClientMobile();

  const InfoRow = ({
    name,
    value,
    nameClass,
    valueClass,
    valueTitle,
    className,
    valueClassName,
  }: {
    name: string | JSX.Element;
    value: string | JSX.Element;
    nameClass?: string;
    valueClass?: string;
    valueTitle?: string;
    className?: string;
    valueClassName?: string;
  }) => {
    return (
      <div className={`py-2.5 flex items-center ${className}`}>
        <span className={`${nameClass} text-primaryText`}>{name}</span>
        <span
          className={`${valueClass} ml-3 ${valueClassName}`}
          title={valueTitle}
        >
          {value}
        </span>
      </div>
    );
  };

  const [showAddBonus, setShowAddBonus] = useState<boolean>(false);

  const [showVotePop, setShowVotePop] = useState<boolean>(false);

  // useCounterDownVE({
  //   base,
  //   setCounterDownStirng,
  //   id: proposal?.id,
  //   status,
  //   setStatus,
  // });

  const history = useHistory();

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const Button =
    status === 'WarmUp' ? (
      getCurrentWallet().wallet.getAccountId() === proposal?.proposer ? (
        <NewGradientButton
          text={<FormattedMessage id="delete" defaultMessage={'Delete'} />}
          padding="px-0 py-0"
          className="h-8 min-w-20 xsm:h-10 xsm:w-full ml-2.5 xsm:ml-0"
          gradient="bg-redGradient"
          onClick={() => {
            removeProposal(proposal.id);
          }}
          beatStyling
        />
      ) : (
        <FarmProposalGrayButton
          text={
            <FormattedMessage id="not_start" defaultMessage={'Not start'} />
          }
          padding="px-0 py-0"
          className="h-8 min-w-20 ml-2.5 xsm:ml-0 xsm:h-10 xsm:w-full"
        />
      )
    ) : status === 'InProgress' ? (
      ONLY_ZEROS.test(veShare) ? (
        <FarmProposalGrayButton
          text={<FormattedMessage id="no_veLPT" defaultMessage={'No veLPT'} />}
          padding="px-0 py-0"
          className="h-8 min-w-20 ml-2.5 xsm:h-10 xsm:w-full xsm:ml-0"
        />
      ) : (
        <NewGradientButton
          text={
            !!voted ? (
              <FormattedMessage id="cancel" defaultMessage={'Cancel'} />
            ) : (
              <FormattedMessage id="vote" defaultMessage={'Vote'} />
            )
          }
          padding="px-0 py-0"
          className="h-8 min-w-20 ml-2.5 xsm:h-10 xsm:w-full xsm:ml-0"
          onClick={() => {
            !!voted
              ? cancelVote({
                  proposal_id: proposal.id,
                })
              : setShowVotePop(true);
          }}
          beatStyling={!!voted}
        />
      )
    ) : unClaimed ? (
      <NewGradientButton
        text={
          <FormattedMessage id="claim_bonus" defaultMessage={'Claim Bonus'} />
        }
        padding="px-0 py-0"
        className="h-8 min-w-28 ml-2.5 xsm:ml-0 xsm:h-10 xsm:w-full"
        beatStyling
        onClick={() => {
          claimRewardVE({
            proposal_id: proposal?.id,
          });
        }}
      />
    ) : (
      <FarmProposalGrayButton
        text={
          !!voted ? (
            <FormattedMessage id="voted" defaultMessage={'Voted'} />
          ) : (
            <FormattedMessage id="ended_ve" defaultMessage={'Ended'} />
          )
        }
        padding="px-0 py-0"
        className="h-8 min-w-20 ml-2.5 xsm:h-10 xsm:w-full xsm:ml-0"
      />
    );

  return !show ? null : (
    <div className="text-white text-sm relative">
      <div
        className={`${
          forPreview ? 'hidden' : ''
        } text-center relative text-xl pb-7 xsm:pb-10`}
      >
        <span className="xsm:hidden">
          <FormattedMessage
            id="proposal_details"
            defaultMessage={'Proposal Details'}
          />
        </span>

        <button
          className="absolute left-0 pr-2 top-2 xsm:top-0 text-sm text-primaryText flex items-center"
          onClick={() => {
            setShow(undefined);
            recoverElementsMobile();
            history.push('/referendum');
          }}
        >
          <span className="transform scale-50 xsm:hidden">
            {<LeftArrowVE stroke="#7E8A93" strokeWidth={2} />}
          </span>
          <span className="ml-1 xsm:hidden">
            <FormattedMessage id="back" defaultMessage={'Back'} />
          </span>
          <span className=" lg:hidden pl-2 font-bold text-xl">{'<'}</span>
        </button>

        <div
          className={`rounded-3xl  bg-black   xsm:bg-opacity-0 bg-opacity-20 py-1.5 text-xs pr-0 ${
            status === 'Expired' ? 'lg:pr-2' : 'lg:pr-4'
          }  pl-2 xsm:mx-auto text-senderHot absolute right-0 xsm:bottom-1 lg:bottom-6`}
        >
          {status === 'Expired' ? (
            <span className=" rounded-3xl text-primaryText xsm:bg-white relative bottom-1 lg:bottom-0 xsm:py-1.5  xsm:bg-opacity-10 xsm:px-2 ">
              <FormattedMessage id={'ended_ve'} defaultMessage="Ended" />
            </span>
          ) : (
            <span className="flex items-center xsm:inline-flex xsm:rounded-3xl xsm:py-1.5 xsm:bg-white xsm:bg-opacity-10 xsm:pl-2 xsm:pr-4">
              <span
                className={`rounded-3xl px-2 py-0.5 mr-2   ${
                  status === 'WarmUp'
                    ? 'text-white bg-pendingPurple'
                    : 'text-black bg-senderHot'
                }`}
              >
                {status === 'InProgress' ? (
                  <FormattedMessage id="live" defaultMessage={'Live'} />
                ) : (
                  <FormattedMessage
                    id="pending_ve"
                    defaultMessage={'Pending'}
                  />
                )}
              </span>
              <span
                className={`${
                  status === 'WarmUp' ? 'text-primaryText' : 'text-senderHot'
                }`}
              >
                {counterDownStirng}
              </span>
            </span>
          )}
        </div>
      </div>
      {!voted || forPreview ? null : (
        <div
          className={`${
            status === 'Expired' ? 'opacity-30' : ''
          } absolute -right-4 top-10 xsm:top-16 xsm:right-0 xsm:transform xsm:scale-90 z-30`}
        >
          <VotedIcon />
        </div>
      )}
      <Card
        className="w-full relative overflow-hidden"
        bgcolor="bg-black bg-opacity-20 xsm:bg-white xsm:bg-opacity-10"
        padding={`px-10 pt-9 pb-14 xsm:px-4 xsm:pt-6 xsm:pb-0`}
      >
        <div className="pb-4 border-b border-white border-opacity-10 px-2 pt-8 xsm:pt-0 text-white text-xl mb-4 xsm:mb-0">
          {`#${proposal.id} `} {description.title}
        </div>

        <div className="flex xsm:flex-col lg:flex-row lg:items-center lg:justify-between">
          <InfoRow
            name={intl.formatMessage({
              id: 'Creator',
              defaultMessage: 'Creator',
            })}
            value={getAccountName(proposal.proposer)}
            valueClass={'font-bold'}
            valueTitle={proposal.proposer}
            className="xsm:py-2.5"
          />

          <button
            className={`cursor-pointer flex items-center text-sm ${
              !transaction_hash ? 'hidden' : ''
            } text-gradientFrom hover:text-senderHot`}
            onClick={() => {
              openUrl(`${getConfig().explorerUrl}/txns/${transaction_hash}`);
            }}
          >
            <span className="text-primaryText">
              <FormattedMessage id="view_on" defaultMessage={'View on'} />
            </span>

            <span className="underline text-primaryText ml-1">Nearblocks</span>

            <span className="ml-1">
              <VEARROW />
            </span>
          </button>
        </div>

        <InfoRow
          name={intl.formatMessage({
            id: 'voting_period',
            defaultMessage: 'Voting Period',
          })}
          value={`${timeStampToUTC(
            startTime,
            isClientMobie
          )} - ${timeStampToUTC(endTime, isClientMobie)} UTC`}
          className="xsm:flex-col xsm:items-start"
          valueClassName="xsm:ml-0 xsm:pt-2.5"
        />
        <InfoRow
          name={intl.formatMessage({
            id: 'turn_out',
            defaultMessage: 'Turnout',
          })}
          value={turnOut}
          className="xsm:hidden"
        />
        <div className="xsm:hidden w-full relative flex items-center justify-between pb-4 border-b border-white border-opacity-10">
          <InfoRow
            name={intl.formatMessage({
              id: 'voted_veLPT',
              defaultMessage: 'Voted veLPT',
            })}
            value={toPrecision(totalVE, 2)}
          />
        </div>
        {!isClientMobie ? null : (
          <div className=" flex items-center justify-center relative top-0 self-start xsm:py-8">
            {status === 'WarmUp' ? (
              <NoResultChart expand="1.25" />
            ) : (
              <VoteChart
                options={data?.map((d) => d.option)}
                ratios={checkAllocations(
                  ONLY_ZEROS.test(totalVE) ? '0' : '100',
                  data?.map((d) => d.ratio)
                )}
                forDetail
              />
            )}
          </div>
        )}

        <div className="lg:hidden  w-full relative flex flex-col items-center justify-between pb-4 border-b border-white border-opacity-10">
          <div className="flex items-center justify-between w-full">
            <InfoRow
              name={intl.formatMessage({
                id: 'turn_out',
                defaultMessage: 'Turnout',
              })}
              value={turnOut}
              className=" lg:hidden xsm:flex-col "
              valueClassName="xsm:ml-0 xsm:items-start"
            />
            <InfoRow
              name={intl.formatMessage({
                id: 'voted_veLPT',
                defaultMessage: 'Voted veLPT',
              })}
              value={toPrecision(totalVE, 2)}
              valueClassName="xsm:ml-0 "
              className="xsm:flex-col xsm:items-end"
            />
          </div>

          <div className="flex items-center justify-between w-full lg:hidden mt-8 text-primaryText">
            <div>
              <FormattedMessage id="options" defaultMessage={'options'} />
            </div>
            <div className="flex items-center ">
              <span
                className={`pr-1.5 border-r border-primaryText border-opacity-30 ${
                  mobileOptionDisplay === 'ratio' ? 'text-white' : ''
                }`}
                onClick={() => {
                  setMobileOptionDisplay('ratio');
                }}
              >
                <FormattedMessage id="ratio" defaultMessage={'Ratio'} />
              </span>
              <span
                className={`pl-1.5 ${
                  mobileOptionDisplay === 'velpt' ? 'text-white' : ''
                }`}
                onClick={() => {
                  setMobileOptionDisplay('velpt');
                }}
              >
                veLPT
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mt-8 xsm:mt-4 pb-6 xsm:pb-2 lg:border-b lg:border-white lg:border-opacity-10 pb-6 xsm:pb-2">
          <div className="w-1/5 xsm:hidden flex items-center justify-center relative top-0 self-start">
            {status === 'WarmUp' ? (
              <NoResultChart expand="1.25" />
            ) : (
              <VoteChart
                options={data?.map((d) => d.option)}
                ratios={checkAllocations(
                  ONLY_ZEROS.test(totalVE) ? '0' : '100',
                  data?.map((d) => d.ratio)
                )}
                forDetail
              />
            )}
          </div>

          <div className="w-4/5 xsm:w-full text-primaryText flex flex-col ml-16 xsm:ml-0 pb-6 xsm:pb-0">
            <div className="grid xsm:hidden grid-cols-10 pb-5 xsm:pb-0 px-6 xsm:px-4">
              <span className="col-span-6 ">
                <FormattedMessage id="options" defaultMessage={'Options'} />
              </span>
              <span className="col-span-2  ">
                <FormattedMessage id="ratio" defaultMessage={'Ratio'} />
              </span>
              <span className="col-span-2 text-right">veLPT</span>
            </div>

            <div className="flex flex-col w-full text-white xsm:border-b border-white border-opacity-10">
              {data
                .sort((a, b) => {
                  return Number(b.v) - Number(a.v);
                })
                ?.map((d, i) => {
                  const optionId = options.indexOf(d.option);
                  const votedThisOption =
                    voted &&
                    (proposal?.kind?.Common
                      ? (0 === optionId && voted === 'VoteApprove') ||
                        (1 === optionId && voted === 'VoteReject')
                      : (voted as VoteAction)?.VotePoll?.poll_id === optionId);
                  return (
                    <div className="grid grid-cols-10 xsm:flex xsm:items-center xsm:justify-between hover:bg-chartBg hover:bg-opacity-20 rounded-lg px-6 xsm:px-0 py-4">
                      <span className="col-span-6 flex items-center">
                        <div
                          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                          style={{
                            backgroundColor:
                              OPTIONS_COLORS[options.indexOf(d.option)] ||
                              '#8EA0CF',
                          }}
                        ></div>
                        <span
                          className="mx-2 max-w-max"
                          style={{
                            maxWidth: isClientMobie ? '' : '60%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={d.option}
                        >
                          {d.option}
                        </span>
                        {i === 0 && !ONLY_ZEROS.test(totalVE) ? (
                          <span
                            className="flex-shrink-0"
                            style={{
                              color:
                                OPTIONS_COLORS[options.indexOf(d.option)] ||
                                '#8EA0CF',
                            }}
                          >
                            Top
                          </span>
                        ) : null}
                        {!votedThisOption ? null : (
                          <NewGradientButton
                            className="ml-2 xsm:mr-1 flex-shrink-0 whitespace-nowrap text-xs h-4 flex items-center py-3 cursor-default opacity-100"
                            padding="px-2 py-2.5"
                            text={
                              <FormattedMessage
                                id="you_voted"
                                defaultMessage={'You voted'}
                              />
                            }
                          />
                        )}
                      </span>
                      {isClientMobie &&
                      mobileOptionDisplay !== 'ratio' ? null : (
                        <span className="col-span-2 ">{d.ratio}%</span>
                      )}
                      {isClientMobie &&
                      mobileOptionDisplay !== 'velpt' ? null : (
                        <span className="col-span-2 text-right">{d.v}</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 xsm:border-t xsm:hidden border-white border-opacity-10">
          <BorderGradientButton
            className="flex items-center justify-center h-full "
            onClick={() => {
              openUrl(displayLink);
            }}
            text={
              <span className="flex items-center">
                <span>
                  <FormattedMessage
                    id="forum_discussion"
                    defaultMessage={'Forum Discussion'}
                  />
                </span>

                <span className="text-white hover:text-senderHot ml-2">
                  <VEARROW />
                </span>
              </span>
            }
            width="h-8 min-w-40"
            padding="px-2"
          />

          {Button}
        </div>

        <BorderGradientButton
          className="flex items-center justify-center h-full"
          onClick={() => {
            openUrl(displayLink);
          }}
          text={
            <span className="flex items-center">
              <span>
                <FormattedMessage
                  id="forum_discussion"
                  defaultMessage={'Forum Discussion'}
                />
              </span>

              <span className="text-white hover:text-senderHot ml-2">
                <VEARROW />
              </span>
            </span>
          }
          width="h-8 lg:hidden mt-4 min-w-40"
          padding="px-2"
        />

        <BonusBar
          proposal={proposal}
          incentiveItem={proposal?.incentive?.[0]}
          bright={status !== 'Expired' && proposal?.incentive?.[0]}
          showYourShare={true}
          yourShare={
            !!voted && Number(yourShare) > 0
              ? `${toPrecision(yourShare, 2)}%`
              : '-'
          }
          showAddBonus={status !== 'Expired'}
          tokens={proposal?.incentive?.[0]?.incentive_token_ids?.map(
            (id: string) => {
              return incentiveTokens?.find((token) => token.id === id);
            }
          )}
          setShowAddBonus={setShowAddBonus}
          forDetail={true}
        />
      </Card>

      {!isSignedIn && isClientMobie ? (
        <div className=" xsm:relative pt-2   lg:hidden xsm:w-full">
          {' '}
          <ConnectToNearBtnGradient />
        </div>
      ) : (
        <div className=" xsm:relative pt-2   lg:hidden xsm:w-full">
          {' '}
          {Button}
        </div>
      )}

      <AddBonusPopUp
        isOpen={showAddBonus}
        onRequestClose={() => {
          setShowAddBonus(false);
        }}
        title={<FormattedMessage id="add_bonus" defaultMessage={'Add Bonus'} />}
        proposal_id={proposal?.id}
      />

      <VoteGovPopUp
        isOpen={showVotePop}
        title={<FormattedMessage id="you_vote" defaultMessage={'You vote'} />}
        proposalTitle={description?.title}
        onRequestClose={() => setShowVotePop(false)}
        options={data.map((d) => d.option)}
        ratios={checkAllocations(
          ONLY_ZEROS.test(totalVE) ? '0' : '100',
          data.map((d) => d.ratio)
        )}
        proposal={proposal}
        totalVE={toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, totalVE)}
        veShare={veShare}
      />
    </div>
  );
};

const GovProposalItem = ({
  description,
  proposal,
  VEmeta,
  showDetail,
  setShowDetail,
  voteDetail,
  voteHistory,
  veShare,
  transaction_hash,
}: {
  description?: Description;
  proposal: Proposal;
  VEmeta: VEMETA;
  showDetail: number;
  setShowDetail: (s: number) => void;
  voteDetail: VoteDetail;
  voteHistory: VoteDetail;
  veShare: string;
  transaction_hash?: string;
}) => {
  const [status, setStatus] = useState<ProposalStatus>(proposal.status);

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

  const voted = (voteDetail?.[proposal?.id]?.action ||
    voteHistory?.[proposal?.id]?.action) as
    | VoteAction
    | 'VoteReject'
    | 'VoteApprove';

  const votedAmount =
    voteDetail?.[proposal?.id]?.amount || voteHistory?.[proposal?.id]?.amount;

  const [showAddBonus, setShowAddBonus] = useState<boolean>(false);

  const history = useHistory();

  const [showVotePop, setShowVotePop] = useState<boolean>(false);
  const incentiveTokens = useTokens([
    ...(VEmeta?.whitelisted_incentive_tokens || []),
  ]);

  const unClaimedProposal = useUnclaimedProposal(status);

  const unClaimed =
    !!unClaimedProposal?.[proposal?.id] &&
    !ONLY_ZEROS.test(unClaimedProposal?.[proposal?.id]?.amount);

  const isClientMobie = useClientMobile();

  if (
    typeof showDetail !== 'undefined' &&
    showDetail !== Number(proposal?.id)
  ) {
    return null;
  }

  const totalVE = scientificNotationToString(
    BigNumber.sum(
      ...(proposal?.kind?.Common
        ? proposal?.votes?.slice(0, 2)
        : proposal?.votes || [])
    ).toString()
  );

  const turnOut = new Big(totalVE)
    .div(
      new Big(
        Number(proposal?.ve_amount_at_last_action) > 0
          ? proposal?.ve_amount_at_last_action
          : 1
      )
    )
    .times(100)
    .toNumber()
    .toFixed(2);

  const options = proposal?.kind?.Common
    ? ['Yes', 'No']
    : proposal?.kind?.Poll?.options;

  const ratios = (
    proposal?.kind?.Common ? proposal?.votes?.slice(0, 2) : proposal?.votes
  )?.map((v, i) => {
    return toPrecision(
      scientificNotationToString(
        new Big(v || '0')
          .div(new Big(Number(totalVE) > 0 ? totalVE : 1))
          .times(100)
          .toString()
      ),
      2
    );
  });

  const ended = status === 'Expired';

  const topVote = _.maxBy(
    proposal?.kind?.Common
      ? proposal?.votes?.slice(0, 2)
      : proposal?.votes || [],
    (o) => Number(o)
  );

  const topVoteIndex =
    (proposal?.kind?.Common
      ? proposal?.votes?.slice(0, 2)
      : proposal?.votes
    )?.indexOf(topVote) || 0;

  const youVotedIndex = proposal?.kind?.Common
    ? voted === 'VoteApprove'
      ? 0
      : 1
    : (voted as VoteAction)?.VotePoll?.poll_id;

  const topOption = options?.[topVoteIndex];

  const afterRatio = new Big(proposal?.votes?.[youVotedIndex] || '0').div(
    new Big(totalVE).gt(0) ? totalVE : 1
  );

  const beforeRatio = new Big(proposal?.votes?.[youVotedIndex] || '0')
    .minus(votedAmount || '0')
    .div(
      new Big(totalVE || '0').minus(votedAmount || '0').gt(0)
        ? new Big(totalVE || '0').minus(votedAmount || '0')
        : 1
    );

  const contribution = scientificNotationToString(
    afterRatio.minus(beforeRatio).times(100).toString()
  );
  const displayRatios = checkAllocations(
    ONLY_ZEROS.test(totalVE) ? '0' : '100',
    ratios
  );
  const displayContribution = new BigNumber(votedAmount).eq(
    new BigNumber(proposal?.votes?.[youVotedIndex] || '0')
  )
    ? displayRatios[youVotedIndex]
    : new BigNumber(proposal?.votes?.[youVotedIndex] || '0').eq(totalVE)
    ? new BigNumber(votedAmount)
        .div(new BigNumber(totalVE).gt(0) ? totalVE : 1)
        .times(100)
        .toString()
    : contribution;

  const voteData = options
    .map((o, i) => {
      return {
        option: o,
        ratio: displayRatios[i],
      };
    })
    .sort((d1, d2) => {
      return Number(d2.ratio) - Number(d1.ratio);
    });

  const yourShare = new BigNumber(votedAmount).eq(
    new BigNumber(proposal?.votes?.[youVotedIndex] || '0')
  )
    ? displayRatios[youVotedIndex]
    : scientificNotationToString(
        new BigNumber(votedAmount || '0')
          .div(new BigNumber(totalVE).gt(0) ? totalVE : 1)
          .times(100)
          .toString()
      );

  const Button =
    status === 'WarmUp' ? (
      getCurrentWallet().wallet.getAccountId() === proposal?.proposer ? (
        <NewGradientButton
          text={<FormattedMessage id="delete" defaultMessage={'Delete'} />}
          padding="px-0 py-0"
          className="h-8 min-w-20 ml-2.5"
          gradient="bg-redGradient"
          onClick={(e: any) => {
            e.stopPropagation();
            e.preventDefault();

            removeProposal(proposal.id);
          }}
          beatStyling
        />
      ) : (
        <FarmProposalGrayButton
          text={
            <FormattedMessage id="not_start" defaultMessage={'Not start'} />
          }
          padding="px-0 py-0"
          className="h-8 min-w-20 ml-2.5"
        />
      )
    ) : status === 'InProgress' ? (
      ONLY_ZEROS.test(veShare) ? (
        <FarmProposalGrayButton
          text={<FormattedMessage id="no_veLPT" defaultMessage={'No veLPT'} />}
          padding="px-0 py-0"
          className="h-8 min-w-20 ml-2.5"
        />
      ) : (
        <NewGradientButton
          text={
            !!voted ? (
              <FormattedMessage id="cancel" defaultMessage={'Cancel'} />
            ) : (
              <FormattedMessage id="vote" defaultMessage={'Vote'} />
            )
          }
          padding="px-0 py-0"
          className="h-8 min-w-20 ml-2.5"
          onClick={(e: any) => {
            e.stopPropagation();
            e.preventDefault();

            return !!voted
              ? cancelVote({
                  proposal_id: proposal.id,
                })
              : setShowVotePop(true);
          }}
          beatStyling={!!voted}
        />
      )
    ) : unClaimed ? (
      <NewGradientButton
        text={
          <FormattedMessage id="claim_bonus" defaultMessage={'Claim Bonus'} />
        }
        padding="px-0 py-0"
        className="h-8 min-w-28 ml-2.5"
        beatStyling
        onClick={(e: any) => {
          e.stopPropagation();
          e.preventDefault();

          claimRewardVE({
            proposal_id: proposal?.id,
          });
        }}
      />
    ) : (
      <FarmProposalGrayButton
        text={
          !!voted ? (
            <FormattedMessage id="voted" defaultMessage={'Voted'} />
          ) : (
            <FormattedMessage id="ended_ve" defaultMessage={'Ended'} />
          )
        }
        padding="px-0 py-0"
        className="h-8 min-w-20 ml-2.5 xsm:hidden"
      />
    );

  const tokenPriceList = useContext(ReferendumPageContext).tokenPriceList;

  const prices: (string | undefined)[] =
    proposal?.incentive?.[0]?.incentive_token_ids
      ?.map((id: string) => {
        return incentiveTokens?.find((token) => token.id === id);
      })
      ?.map((token: TokenMetadata) => {
        return tokenPriceList?.[token?.id]?.price;
      });

  const total = scientificNotationToString(
    prices
      ?.reduce((acc, price, i) => {
        return acc.plus(
          new Big(price || 0).times(
            toReadableNumber(
              proposal?.incentive?.[0]?.incentive_token_ids?.map(
                (id: string) => {
                  return incentiveTokens?.find((token) => token.id === id);
                }
              )?.[i]?.decimals || 24,
              proposal?.incentive?.[0]?.incentive_amounts?.[i] || '0'
            )
          )
        );
      }, new Big(0))
      .toString() || '0'
  );

  return (
    <>
      {proposal && proposal?.id && showDetail === Number(proposal?.id) ? (
        <GovItemDetail
          incentiveTokens={incentiveTokens}
          yourShare={yourShare}
          show={showDetail}
          setShow={setShowDetail}
          transaction_hash={transaction_hash}
          proposal={proposal}
          description={JSON.parse(
            proposal?.kind?.Poll
              ? proposal?.kind?.Poll?.description
              : proposal?.kind?.Common?.description
          )}
          turnOut={`${turnOut}%`}
          totalVE={toReadableNumber(LOVE_TOKEN_DECIMAL, totalVE)}
          options={options}
          voted={voted}
          veShare={veShare}
          unClaimed={unClaimed}
          status={status}
          setStatus={setStatus}
          counterDownStirng={counterDownStirng}
          setCounterDownStirng={setCounterDownStirng}
          base={base}
        />
      ) : (
        <Card
          className={`w-full flex items-center my-2 relative overflow-hidden `}
          bgcolor={`bg-black bg-opacity-20 xsm:bg-white xsm:bg-opacity-10`}
          padding={`px-8 pt-8 pb-12 xsm:px-4 xsm:pt-4 xsm:pb-10`}
          onClick={(e) => {
            if (isClientMobie) {
              e.stopPropagation();
              e.preventDefault();
              setShowDetail(proposal.id);
              hideElementsMobile();
              history.push(`/referendum/${proposal.id}`);
            }
          }}
        >
          <div
            id={proposal.id + 'vote_chart'}
            className={`xsm:hidden w-1/5 ${
              status === 'Expired' ? 'opacity-70' : ''
            }`}
          >
            {status === 'WarmUp' ? (
              <div className="pr-10">
                <NoResultChart />
              </div>
            ) : (
              <VoteChart
                options={options}
                ratios={checkAllocations(
                  ONLY_ZEROS.test(totalVE) ? '0' : '100',
                  ratios
                )}
              />
            )}
          </div>
          <div className="flex flex-col w-4/5 xsm:w-full">
            <div
              className={`w-full flex items-center xsm:flex-col xsm:items-start justify-between  ${
                status === 'Expired' ? 'opacity-70' : ''
              }`}
            >
              <span className="xsm:hidden  text-lg break-words">
                {' '}
                {`#${proposal?.id} ${description.title}`}{' '}
              </span>

              {/* counter down */}
              <div className="flex items-center">
                <span className="rounded-3xl xsm:relative xsm:right-2 text-xs px-1 text-senderHot xsm:mr-2  md:mr-0 lg:mr-0">
                  {ended ? (
                    <span className="bg-black bg-opacity-20 px-2 py-1 rounded-3xl text-primaryText">
                      <FormattedMessage
                        id={'ended_ve'}
                        defaultMessage="Ended"
                      />
                    </span>
                  ) : (
                    <div className="flex items-center">
                      <span
                        className={`rounded-3xl px-2 py-0.5  ${
                          status === 'WarmUp'
                            ? 'text-white bg-pendingPurple'
                            : 'text-black bg-senderHot'
                        }`}
                      >
                        {status === 'InProgress' ? (
                          <FormattedMessage id="live" defaultMessage={'Live'} />
                        ) : (
                          <FormattedMessage
                            id="pending_ve"
                            defaultMessage={'Pending'}
                          />
                        )}
                      </span>
                    </div>
                  )}
                </span>

                <span
                  className={
                    status === 'Expired'
                      ? 'hidden'
                      : `${
                          status === 'WarmUp'
                            ? 'text-primaryText'
                            : 'text-senderHot'
                        } text-xs xsm:right-3 xsm:relative   lg:hidden `
                  }
                >
                  {counterDownStirng}
                  {`${status === 'WarmUp'}` ? (
                    <span className="ml-1">
                      <FormattedMessage id="starts" defaultMessage={'starts'} />
                    </span>
                  ) : (
                    <span className="ml-1">
                      <FormattedMessage id="left" defaultMessage={'left'} />
                    </span>
                  )}
                </span>
              </div>

              <span className="lg:hidden  mt-4  text-lg break-words">
                {' '}
                <span className="font-bold">{`#${proposal?.id}`}</span>
                {` ${description.title}`}{' '}
              </span>
            </div>

            <div
              className={`w-full flex items-center justify-between pb-8 xsm:border-b xsm:border-white xsm:border-opacity-10 xsm:pb-2.5 xsm:mb-1.5 pt-2.5  ${
                status === 'Expired' ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-center">
                <span className="text-primaryText mr-3 xsm:hidden">
                  <FormattedMessage id="Creator" defaultMessage={'Creator'} />
                </span>

                <span
                  className="font-bold xsm:text-primaryText"
                  title={proposal.proposer}
                >
                  {getAccountName(proposal.proposer)}
                </span>
              </div>

              <span
                className={
                  status === 'Expired'
                    ? 'hidden'
                    : `${
                        status === 'WarmUp'
                          ? 'text-primaryText'
                          : 'text-senderHot'
                      } text-xs  xsm:hidden`
                }
              >
                {counterDownStirng}
                {`${status === 'WarmUp' ? ' starts' : ' left'}`}
              </span>
            </div>

            <div className="w-full flex items-center xsm:flex-col justify-between">
              <div
                className={`flex items-center xsm:w-full xsm:justify-between  ${
                  status === 'Expired' ? 'opacity-70' : ''
                }`}
              >
                <span className="flex flex-col mr-10  xsm:mr-0">
                  <span className="text-primaryText">
                    <FormattedMessage
                      id="turn_out"
                      defaultMessage={'Turnout'}
                    />
                  </span>

                  <span className="mt-1">
                    {status === 'WarmUp' || ONLY_ZEROS.test(totalVE)
                      ? '-'
                      : `${turnOut}%`}
                  </span>
                </span>

                <span className={`flex xsm:mr-0 flex-col xsm:items-end mr-10 `}>
                  <span className="text-primaryText flex items-center ">
                    <FormattedMessage
                      id="top_answer"
                      defaultMessage={'Top Answer'}
                    />
                  </span>

                  <span className="flex items-center mt-1">
                    {status === 'WarmUp' || ONLY_ZEROS.test(totalVE) ? null : (
                      <div
                        className="w-2.5 h-2.5 rounded-sm mr-3 xsm:mr-1 flex-shrink-0"
                        style={{
                          backgroundColor:
                            OPTIONS_COLORS[topVoteIndex] || '#8EA0CF',
                        }}
                      ></div>
                    )}

                    <span
                      className="truncate"
                      style={{
                        maxWidth: '120px',
                      }}
                      title={
                        status === 'WarmUp' || ONLY_ZEROS.test(totalVE)
                          ? ''
                          : topOption
                      }
                    >
                      {status === 'WarmUp' || ONLY_ZEROS.test(totalVE)
                        ? '-'
                        : topOption}
                    </span>
                  </span>
                </span>

                {!!voted && !isClientMobie ? (
                  <span className="flex flex-col">
                    <YouVotedButton />

                    <span className="flex items-center mt-1">
                      <div
                        className="w-2.5 h-2.5 rounded-sm mr-3 xsm:mr-1 flex-shrink-0"
                        style={{
                          backgroundColor:
                            OPTIONS_COLORS[youVotedIndex] || '#8EA0CF',
                        }}
                      ></div>
                      <span
                        className="truncate "
                        title={options?.[youVotedIndex]}
                        style={{
                          maxWidth: isClientMobie ? '80px' : '120px',
                        }}
                      >
                        {options?.[youVotedIndex]}
                      </span>

                      <span className="ml-1 mt-px">
                        {`+${toPrecision(displayContribution, 2)}%`}
                      </span>
                    </span>
                  </span>
                ) : null}
              </div>

              {!!voted ? (
                <div className="lg:hidden flex items-center justify-between xsm:mt-2.5 xsm:w-full">
                  <span className="flex flex-col">
                    <YouVotedButton />

                    <span className="flex items-center mt-1">
                      <div
                        className="w-2.5 h-2.5 rounded-sm mr-3 xsm:mr-1 flex-shrink-0"
                        style={{
                          backgroundColor:
                            OPTIONS_COLORS[youVotedIndex] || '#8EA0CF',
                        }}
                      ></div>
                      <span
                        className="truncate "
                        title={options?.[youVotedIndex]}
                        style={{
                          maxWidth: isClientMobie ? '80px' : '120px',
                        }}
                      >
                        {options?.[youVotedIndex]}
                      </span>

                      <span className="ml-1 mt-px">
                        {`+${toPrecision(displayContribution, 2)}%`}
                      </span>
                    </span>
                  </span>

                  <span className="flex flex-col items-end">
                    <span
                      className={`text-primaryText
                    ${status === 'Expired' ? 'opacity-70' : ''}`}
                    >
                      {status === 'Expired' &&
                      Number(yourShare) > 0 &&
                      Number(total) > 0 ? (
                        <FormattedMessage
                          id="your_bonus"
                          defaultMessage={'Your bonus'}
                        />
                      ) : (
                        <FormattedMessage
                          id="your_shares_ve"
                          defaultMessage={'Your shares'}
                        />
                      )}
                    </span>

                    <span className="flex items-center  mt-1">
                      {status === 'Expired' &&
                      Number(yourShare) > 0 &&
                      Number(total) > 0 ? (
                        <span className="ml-1 mt-px">
                          {!!voted && Number(yourShare) > 0
                            ? `$${new Big(yourShare)
                                .times(new Big(total))
                                .div(100)
                                .toNumber()
                                .toFixed(2)} (${toPrecision(yourShare, 2)}%)`
                            : '-'}
                        </span>
                      ) : (
                        <span className="ml-1 mt-px">
                          {!!voted && Number(yourShare) > 0
                            ? `${toPrecision(yourShare, 2)}%`
                            : '-'}
                        </span>
                      )}
                    </span>
                  </span>
                </div>
              ) : null}

              <div className="flex items-center ">
                <BorderGradientButton
                  text={
                    <FormattedMessage id="details" defaultMessage={'Details'} />
                  }
                  width={`h-8 min-w-20  ${
                    status === 'Expired' ? 'opacity-70' : ''
                  } xsm:hidden`}
                  className="h-full"
                  padding="px-0"
                  color="#182632"
                  onClick={() => {
                    setShowDetail(proposal.id);
                    history.push(`/referendum/${proposal.id}`);
                  }}
                />
                <div className="xsm:absolute xsm:right-2 xsm:top-2">
                  {Button}
                </div>
              </div>
            </div>
          </div>

          <BonusBar
            proposal={proposal}
            incentiveItem={proposal?.incentive?.[0]}
            bright={status !== 'Expired' && proposal?.incentive?.[0]}
            showYourShare={true}
            yourShare={
              !!voted && Number(yourShare) > 0
                ? `${toPrecision(yourShare, 2)}%`
                : '-'
            }
            showAddBonus={status !== 'Expired'}
            tokens={proposal?.incentive?.[0]?.incentive_token_ids?.map(
              (id: string) => {
                return incentiveTokens?.find((token) => token.id === id);
              }
            )}
            setShowAddBonus={setShowAddBonus}
          />
        </Card>
      )}
      <VoteGovPopUp
        isOpen={showVotePop}
        title={<FormattedMessage id="you_vote" defaultMessage={'You vote'} />}
        proposalTitle={description?.title}
        onRequestClose={() => setShowVotePop(false)}
        options={voteData.map((d) => d.option)}
        ratios={voteData.map((d) => d.ratio)}
        proposal={proposal}
        totalVE={totalVE}
        veShare={veShare}
      />
      <AddBonusPopUp
        isOpen={showAddBonus}
        onRequestClose={() => {
          setShowAddBonus(false);
        }}
        title={<FormattedMessage id="add_bonus" defaultMessage={'Add Bonus'} />}
        proposal_id={proposal?.id}
      />
    </>
  );
};

export const ProposalTab = ({
  className,
  curTab,
  setTab,
}: {
  className: string;
  curTab: PROPOSAL_TAB;
  setTab: (t: PROPOSAL_TAB) => void;
}) => {
  const isClientMobie = useClientMobile();

  return (
    <div
      className={`${className} xsm:flex`}
      style={{
        backgroundColor: isClientMobie ? '#1D2932' : '',
      }}
    >
      <NewGradientButton
        className={`lg:text-lg lg:h-12  lg:min-w-72  xsm:whitespace-nowrap xsm:flex-grow mr-2 xsm:mr-0 ${
          curTab === PROPOSAL_TAB.FARM ? 'opacity-100' : ''
        }`}
        grayDisable={curTab !== PROPOSAL_TAB.FARM}
        disableForUI
        text={
          <FormattedMessage
            id="gauge_weight_vote"
            defaultMessage={'Gauge Weight Vote'}
          />
        }
        padding="px-1 py-2"
        onClick={() => setTab(PROPOSAL_TAB.FARM)}
      />

      <NewGradientButton
        className={`lg:text-lg lg:h-12 xsm:flex-grow lg:min-w-72 xsm:w-1/2  xsm:mr-0 mr-2 ${
          curTab === PROPOSAL_TAB.GOV ? 'opacity-100' : ''
        }`}
        onClick={() => setTab(PROPOSAL_TAB.GOV)}
        grayDisable={curTab !== PROPOSAL_TAB.GOV}
        padding="px-0 py-2"
        disableForUI
        text={
          <FormattedMessage id="governance" defaultMessage={'Governance'} />
        }
      />
    </div>
  );
};

export const VoteGovPopUp = (
  props: Modal.Props & {
    title: JSX.Element | string;
    proposalTitle: string;
    options: string[];
    ratios: string[];
    proposal: Proposal;
    totalVE: string;
    veShare: string;
  }
) => {
  const { title, proposalTitle, ratios, proposal, options, totalVE, veShare } =
    props;

  const [value, setvalue] = useState<string>();

  const CheckComponent = ({ checked }: { checked: boolean }) => {
    return (
      <div
        className={`rounded-full w-4 h-4 flex items-center justify-center `}
        style={{
          backgroundColor: checked ? '#00846C' : '#304452',
        }}
      >
        <div
          className={`rounded-full w-1.5 h-1.5 ${
            checked ? '' : 'opacity-30'
          } bg-white`}
        ></div>
      </div>
    );
  };

  const newPercent = new Big(toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, veShare))
    .plus(
      options.indexOf(value) !== -1
        ? new Big(
            proposal?.votes[
              proposal?.kind?.Common
                ? value === 'Yes'
                  ? 0
                  : 1
                : proposal?.kind?.Poll?.options.indexOf(value)
            ] || 0
          )
        : 0
    )
    .div(
      new Big(ONLY_ZEROS.test(totalVE) ? 0 : totalVE).plus(
        Number(veShare) > 0
          ? toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, veShare)
          : '1'
      )
    )
    .times(100);

  return (
    <ModalWrapper {...props}>
      <div className="pt-6 pb-8">
        <div className="pb-4 truncate">{proposalTitle}</div>

        <div
          className="pt-6 px-5 pr-6 rounded-lg bg-black bg-opacity-20 overflow-auto"
          style={{
            maxHeight: '60vh',
          }}
        >
          {options?.map((o, i) => {
            return (
              <button
                className="flex items-center justify-between pb-7 w-full"
                onClick={() => {
                  setvalue(o);
                }}
              >
                <span className="flex items-center ">
                  <CheckComponent checked={value === o} />

                  <span
                    className="ml-4 truncate w-40 xsm:w-28 text-left"
                    title={o}
                  >
                    {o}
                  </span>
                </span>

                <span className="flex items-center">
                  {value === o ? (
                    <span className="mr-2.5 text-gradientFrom">
                      +
                      {newPercent.minus(ratios[i]).lt(0)
                        ? 0
                        : toPrecision(
                            scientificNotationToString(
                              newPercent.minus(ratios[i] || 0).toString()
                            ),
                            2,
                            false,
                            false
                          )}
                      %
                    </span>
                  ) : null}

                  <span>{ratios[i]}%</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center w-full">
        <NewGradientButton
          text={<FormattedMessage id="confirm" defaultMessage={'Confirm'} />}
          className="w-full h-10 mx-2"
          padding="py-2.5"
          disabled={!value}
          onClick={() => {
            proposal?.kind?.Common
              ? VoteCommon({
                  proposal_id: proposal?.id,
                  action: value === 'Yes' ? 'VoteApprove' : 'VoteReject',
                })
              : VotePoll({
                  proposal_id: proposal?.id,
                  index: proposal?.kind?.Poll?.options.indexOf(value),
                });
          }}
          beatStyling
        />
      </div>
    </ModalWrapper>
  );
};

export const LastRoundFarmVoting = (
  props: Modal.Props & {
    title: string | JSX.Element;
    proposal: Proposal;
    VEmeta: VEMETA & {
      totalVE: string;
    };
  }
) => {
  const { proposal: farmProposal } = props;

  const endtimeMoment = moment(
    Math.floor(Number(farmProposal.end_at) / TIMESTAMP_DIVISOR) * 1000
  );

  const voteDetail = useVoteDetail();

  const voteHistoryDetail = useVoteDetailHisroty();

  const votedVE = BigNumber.sum(...(farmProposal?.votes || ['0', '0']));

  const [tokens, setTokens] = useState<Record<string, TokenMetadata>>();

  useEffect(() => {
    ftGetTokensMetadata(
      farmProposal?.kind?.FarmingReward?.farm_list
        ?.map((pair) => {
          return pair.split(seedIdSeparator)[0].split(PAIR_SEPERATOR);
        })
        .flat() || []
    ).then(setTokens);
  }, [farmProposal]);

  const displayRatios = votedVE.isGreaterThan(0)
    ? farmProposal?.votes.map((vote) =>
        new BigNumber(vote).div(votedVE).times(100).toFixed(2)
      )
    : farmProposal?.kind?.FarmingReward?.farm_list?.map((_, i) => '0');

  const checkedRatios = checkAllocations(
    ONLY_ZEROS.test(scientificNotationToString(votedVE.toString()))
      ? '0'
      : '100',
    displayRatios
  );

  const displayVELPT = farmProposal?.votes.map((vote) =>
    toPrecision(toReadableNumber(LOVE_TOKEN_DECIMAL, vote), 2, false)
  );

  const checkedVELPTs = checkAllocations(
    toPrecision(
      toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        scientificNotationToString(votedVE.toString())
      ),
      2
    ),
    displayVELPT
  );

  const allocations = checkAllocations(
    ONLY_ZEROS.test(scientificNotationToString(votedVE.toString()))
      ? '0'
      : '100',
    displayRatios
  ).map((r) => {
    return toPrecision(
      multiply(
        divide(r, '100').toString(),
        farmProposal?.kind?.FarmingReward?.total_reward.toString()
      ),
      0
    );
  });

  const checkedAllocations = checkAllocations(
    ONLY_ZEROS.test(scientificNotationToString(votedVE.toString()))
      ? '0'
      : farmProposal?.kind?.FarmingReward?.total_reward.toString(),
    allocations
  );
  const supplyPercent = votedVE
    .dividedBy(farmProposal?.ve_amount_at_last_action || '1')
    .times(100)
    .toNumber()
    .toFixed(2);
  const InfoRow = ({
    title,
    value,
    valueTitle,
  }: {
    title: string | JSX.Element;
    value: string;
    valueTitle?: string;
  }) => {
    return (
      <div className="my-2 xsm:my-1 text-sm xsm:text-xs whitespace-nowrap text-farmText flex items-center justify-between w-full">
        <span>{title}</span>
        <div className="mx-1 border border-b border-dashed border-white border-opacity-10 w-full"></div>

        <span className="text-white whitespace-nowrap" title={valueTitle}>
          {value}
        </span>
      </div>
    );
  };

  const isClientMobie = useClientMobile();

  return (
    <ModalWrapper
      {...props}
      customHeight="95vh"
      customWidth={isClientMobie ? '95vw' : '650px'}
    >
      <FarmChart
        ratio={farmProposal?.kind?.FarmingReward?.farm_list?.map((f, i) => ({
          name: f,
          value: Number(farmProposal.votes[i]),
          pairSymbol: f
            .split(seedIdSeparator)[0]
            .split(PAIR_SEPERATOR)
            .map((id) => toRealSymbol(tokens?.[id]?.symbol || ''))
            .join('/'),
          tokens: f
            .split(seedIdSeparator)[0]
            .split(PAIR_SEPERATOR)
            .map((id) => tokens?.[id]),

          r: checkedRatios[i] + '%',
          allocation: toPrecision(checkedAllocations[i] || '0', 0, true),
          veLPT: checkedVELPTs[i] || '0',
          poolId: f.split(seedIdSeparator)[1],
        }))}
        size={farmProposal?.kind?.FarmingReward?.farm_list?.length}
        voted={
          voteDetail?.[farmProposal?.id]?.action?.VoteFarm?.farm_id ||
          voteHistoryDetail?.[farmProposal?.id]?.action?.VoteFarm?.farm_id
        }
        outerRadiusProp={130}
        innerRadiusProp={100}
        forLastRound
        proposal={farmProposal}
        voteDetail={voteDetail}
        voteHistory={voteHistoryDetail}
      />

      <div className="w-full border-b border-white border-opacity-10 mb-4"></div>
      <InfoRow
        title={
          <FormattedMessage
            id="voting_period"
            defaultMessage={'Voting Period'}
          />
        }
        value={`
          ${moment(
            Math.floor(Number(farmProposal.start_at) / TIMESTAMP_DIVISOR) * 1000
          )
            .utc()
            .format('D')}-${moment(
          Math.floor(Number(farmProposal.end_at) / TIMESTAMP_DIVISOR) * 1000
        )
          .utc()
          .format('D MMM, yyyy')} (UTC)
          `}
      />
      <InfoRow
        title={
          <FormattedMessage
            id="applying_period"
            defaultMessage={'Applying Period'}
          />
        }
        value={`${endtimeMoment.add(1, 'month').format('MMM yyyy')}`}
      />

      <InfoRow
        title={
          <span className="flex items-center">
            <FormattedMessage
              id="community_gauge_share"
              defaultMessage={'Community Voting Gauge'}
            />
            <span className="ml-1">
              <QuestionTip id="voting_gauge_share_tip" />
            </span>
          </span>
        }
        value={VotingGauge[0]}
      />
      <InfoRow
        title={
          <FormattedMessage
            id="REF_allocation"
            defaultMessage={'REF Allocation'}
          />
        }
        value={`${toPrecision(
          farmProposal?.kind?.FarmingReward.total_reward.toString() || '0',
          0,
          true
        )} REF`}
      />
      <InfoRow
        title={
          <FormattedMessage
            id="qualified_pools"
            defaultMessage={'Qualified Pools'}
          />
        }
        value={farmProposal?.kind?.FarmingReward.farm_list.length.toString()}
      />
      <InfoRow
        title={
          <FormattedMessage
            id="voted"
            defaultMessage={'Voted'}
          ></FormattedMessage>
        }
        value={`${toPrecision(
          toReadableNumber(
            18,
            scientificNotationToString(
              BigNumber.sum(...(farmProposal?.votes || ['0', '0'])).toString()
            )
          ),
          2,
          true
        )} veLPT`}
      />
      <InfoRow
        title={
          <FormattedMessage
            id="total"
            defaultMessage={'Total'}
          ></FormattedMessage>
        }
        value={`${
          Number(farmProposal.ve_amount_at_last_action) === 0
            ? '0'
            : toPrecision(
                toReadableNumber(
                  LOVE_TOKEN_DECIMAL,
                  farmProposal.ve_amount_at_last_action
                ),
                2,
                true,
                false
              )
        } veLPT`}
      />
      <InfoRow
        title={
          <FormattedMessage id="supply_voted" defaultMessage={'Supply Voted'} />
        }
        value={`${Number(supplyPercent) === 0 ? 0 : supplyPercent}%`}
      />
    </ModalWrapper>
  );
};

export const FarmProposal = ({
  farmProposal,
  lastRoundFarmProposal,
  VEmeta,
}: {
  farmProposal: Proposal;
  lastRoundFarmProposal: Proposal;
  VEmeta: VEMETA & { totalVE: string };
}) => {
  const [status, setStatus] = useState<ProposalStatus>(farmProposal.status);

  const UnclaimedProposal = useUnclaimedProposal(status);

  const [base, setBase] = useState<number>(
    Math.floor(
      Number(
        status === 'InProgress' ? farmProposal?.end_at : farmProposal?.start_at
      ) / TIMESTAMP_DIVISOR
    )
  );

  useEffect(() => {
    setBase(
      Math.floor(
        Number(
          status === 'InProgress'
            ? farmProposal?.end_at
            : farmProposal?.start_at
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
            status === 'InProgress'
              ? farmProposal?.end_at
              : farmProposal?.start_at
          ) / TIMESTAMP_DIVISOR
        ) +
          60 -
          moment().unix(),
        'seconds'
      )
    );
    setCounterDownStirng(baseCounterDown);
  }, [base, status, farmProposal]);

  useCounterDownVE({
    base,
    setCounterDownStirng,
    id: farmProposal?.id,
    setStatus,
    status,
  });

  const [showLastRoundVoting, setShowLastRoundVoting] =
    useState<boolean>(false);

  const voteDetail = useVoteDetail();
  const voteHistoryDetail = useVoteDetailHisroty();

  const { veShare, veShareRaw } = useAccountInfo();

  const endTime = Math.floor(
    new Big(farmProposal?.end_at || 0).div(TIMESTAMP_DIVISOR).toNumber()
  );

  const ended = moment().unix() > endTime;

  const incentiveTokens = useTokens([
    ...(VEmeta?.whitelisted_incentive_tokens || []),
    ...(farmProposal?.kind?.FarmingReward?.farm_list
      ?.map((item) => {
        return item.split(seedIdSeparator)[0].split(PAIR_SEPERATOR).flat();
      })
      ?.flat() || []),
  ]);

  const InfoCard = ({
    titles,
    values,
    className,
  }: {
    titles: (JSX.Element | string)[];
    values: (string | number)[];
    className?: string;
  }) => {
    return (
      <div
        className={`${className} bg-black bg-opacity-20 rounded-2xl px-6 flex flex-col xsm:bg-white xsm:bg-opacity-10`}
      >
        {titles.map((t, i) => {
          return (
            <div className="flex items-center justify-between py-3">
              <span>{t}</span>
              <span className="text-white">{values[i]}</span>
            </div>
          );
        })}
      </div>
    );
  };
  const votedVE = BigNumber.sum(...(farmProposal?.votes || ['0', '0']));

  const [tokens, setTokens] = useState<Record<string, TokenMetadata>>();

  useEffect(() => {
    ftGetTokensMetadata(
      farmProposal?.kind?.FarmingReward?.farm_list
        ?.map((pair) => {
          return pair.split(seedIdSeparator)[0].split(PAIR_SEPERATOR);
        })
        .flat() || []
    ).then(setTokens);
  }, [farmProposal]);

  const displayRatios = votedVE.isGreaterThan(0)
    ? farmProposal?.votes.map((vote) =>
        new BigNumber(vote).div(votedVE).times(100).toFixed(2)
      )
    : farmProposal?.kind?.FarmingReward?.farm_list?.map((_, i) => '0');

  const checkedRatios = checkAllocations(
    ONLY_ZEROS.test(scientificNotationToString(votedVE.toString()))
      ? '0'
      : '100',
    displayRatios
  );

  const displayVELPT = farmProposal?.votes.map((vote) =>
    toPrecision(toReadableNumber(LOVE_TOKEN_DECIMAL, vote), 2, false)
  );

  const checkedVELPTs = checkAllocations(
    toPrecision(
      toReadableNumber(
        LOVE_TOKEN_DECIMAL,
        scientificNotationToString(votedVE.toString())
      ),
      2
    ),
    displayVELPT
  );

  const allocations = checkedRatios.map((r) => {
    return toPrecision(
      multiply(
        divide(r, '100').toString(),
        farmProposal?.kind?.FarmingReward?.total_reward.toString()
      ),
      0
    );
  });

  const votedAmount =
    voteDetail?.[farmProposal?.id]?.amount ||
    voteHistoryDetail?.[farmProposal?.id]?.amount;

  const checkedAllocations = checkAllocations(
    ONLY_ZEROS.test(scientificNotationToString(votedVE.toString()))
      ? '0'
      : farmProposal?.kind?.FarmingReward?.total_reward.toString(),
    allocations
  );

  const votedIndex =
    typeof voteDetail?.[farmProposal?.id]?.action?.VoteFarm?.farm_id !==
    'undefined'
      ? voteDetail?.[farmProposal?.id]?.action?.VoteFarm?.farm_id
      : voteHistoryDetail?.[farmProposal?.id]?.action?.VoteFarm?.farm_id;

  const yourShare = new BigNumber(votedAmount).eq(
    farmProposal.votes[votedIndex]
  )
    ? displayRatios[votedIndex]
    : scientificNotationToString(
        new BigNumber(votedAmount || '0')
          .div(farmProposal.votes?.[votedIndex] || '1')
          .times(100)
          .toString()
      );

  const [sortBy, setSortBy] = useState<string>('REF_allocation');

  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const FarmLine = ({
    className,
    index,
    tokens,
    veLPT,
    allocate,
    ratio,
  }: {
    className?: string;
    index: number;
    tokens: TokenMetadata[];
    veLPT: string;
    allocate: string;
    ratio: string;
  }) => {
    const [votePopUpOpen, setVotePopUpOpen] = useState<boolean>(false);

    const [addBonusOpen, setAddBonusOpen] = useState<boolean>(false);

    const displayRatiosNew = farmProposal?.votes?.map((vote, i) =>
      new BigNumber(vote)
        .plus(i === index ? veShareRaw || '0' : '0')
        .div(
          votedVE.plus(veShareRaw || '0').gt(0)
            ? votedVE.plus(veShareRaw || '0')
            : 1
        )
        .times(100)
        .toFixed(2)
    );

    const checkedRatiosNew = checkAllocations('100', displayRatiosNew || []);

    const allocationsNew = checkedRatiosNew?.map((r) => {
      return toPrecision(
        multiply(
          divide(r, '100').toString(),
          farmProposal?.kind?.FarmingReward?.total_reward?.toString()
        ),
        0
      );
    });

    const ratioNew = checkedRatiosNew?.[index];

    const checkedAllocationsNew = checkAllocations(
      farmProposal?.kind?.FarmingReward?.total_reward.toString(),
      allocationsNew
    );

    const allocateNew = checkedAllocationsNew?.[index];

    const Button =
      !isSignedIn && isClientMobie ? (
        <ConnectToNearBtnGradientMoible />
      ) : status === 'Expired' ? (
        UnclaimedProposal?.[farmProposal.id] &&
        !ONLY_ZEROS.test(UnclaimedProposal?.[farmProposal.id]?.amount) &&
        UnclaimedProposal?.[farmProposal.id]?.action?.VoteFarm?.farm_id ===
          index ? (
          <NewGradientButton
            text={
              <FormattedMessage
                id="claim_bonus"
                defaultMessage={'Claim Bonus'}
              />
            }
            className="min-h-8 xsm:h-7 min-w-28 xsm:min-w-24"
            onClick={() => {
              claimRewardVE({
                proposal_id: farmProposal.id,
              });
            }}
            beatStyling
            padding="px-1 py-0"
          />
        ) : (
          <FarmProposalGrayButton
            text={<FormattedMessage id="ended_ve" defaultMessage={'Ended'} />}
            className="h-8 min-w-20 xsm:h-7"
            padding="px-1 py-0"
          />
        )
      ) : typeof votedIndex !== 'undefined' ? (
        votedIndex === index ? (
          <NewGradientButton
            text={<FormattedMessage id="cancel" defaultMessage={'Cancel'} />}
            className=" h-8 min-w-20 xsm:h-7"
            padding="px-0 py-0"
            onClick={() => {
              cancelVote({ proposal_id: farmProposal.id });
            }}
            beatStyling
          />
        ) : (
          <FarmProposalGrayButton
            text={<FormattedMessage id="vote" defaultMessage={'Vote'} />}
            className="h-8 min-w-20 xsm:h-7"
            padding="px-1 py-0"
          />
        )
      ) : status === 'WarmUp' ? (
        <FarmProposalGrayButton
          text={
            <FormattedMessage id="not_start" defaultMessage={'Not start'} />
          }
          className="h-8 min-w-20 xsm:h-7"
          padding="px-1 py-0"
        />
      ) : ONLY_ZEROS.test(veShare) ? (
        <FarmProposalGrayButton
          text={<FormattedMessage id="no_veLPT" defaultMessage={'NO veLPT'} />}
          className="h-8 min-w-20 xsm:h-7"
          padding="px-1 py-0"
        />
      ) : (
        <NewGradientButton
          text={<FormattedMessage id="vote" defaultMessage={'Vote'} />}
          className="h-8 min-w-20 xsm:h-7"
          onClick={() => {
            setVotePopUpOpen(true);
          }}
          padding="px-1 py-0"
        />
      );

    return (
      <>
        <div
          className={` my-2.5 ${
            votedIndex === index && isClientMobie ? 'xsm:pt-8' : 'xsm:pt-4'
          }  xsm:my-4 xsm:flex xsm:flex-col pt-7 pb-14 xsm:pb-8 relative grid bg-black bg-opacity-20 rounded-2xl grid-cols-7 items-center  xsm:bg-cardBg xsm:bg-opacity-100 text-white overflow-hidden`}
        >
          {votedIndex === index && isClientMobie ? (
            <div className="absolute top-0.5 left-5">
              <YouVotedAngle />
            </div>
          ) : null}

          <span className="col-span-3 pl-4 flex items-center xsm:w-full xsm:px-4 xsm:pb-3">
            <Images
              tokens={tokens}
              className="self-start"
              size={isClientMobie ? '6' : '9'}
            />
            <span className="pr-2.5 xsm:pr-1"></span>
            <div className="flex flex-col font-bold">
              <Symbols tokens={tokens} separator={'-'} size="xs:text-sm" />
              <div className="flex items-center">
                <span className="text-sm text-primaryText font-normal">
                  {`#${
                    farmProposal.kind.FarmingReward.farm_list[index].split(
                      seedIdSeparator
                    )[1]
                  }`}
                </span>
              </div>
            </div>

            {votedIndex === index && !isClientMobie ? (
              <NewGradientButton
                className="ml-2 text-white text-sm xsm:text-xs self-start cursor-default opacity-100 h-6"
                text={
                  <FormattedMessage
                    id="you_voted"
                    defaultMessage={'You voted'}
                  />
                }
                padding="px-2 py-0"
              />
            ) : null}
          </span>
          <span className="col-span-1 text-center xsm:w-full xsm:flex xsm:items-center xsm:justify-between xsm:px-4 xsm:pb-3">
            <span className="text-primaryText  lg:hidden text-sm">
              <FormattedMessage id="ve_LPT" defaultMessage={'veLPT'} />
            </span>

            {toPrecision(veLPT, 2, true)}
          </span>
          <span className="col-span-1 text-center xsm:w-full xsm:flex xsm:items-center xsm:justify-between xsm:px-4 xsm:pb-3">
            <span className="text-primaryText  lg:hidden text-sm">
              <FormattedMessage id="ratio" defaultMessage={'Ratio'} />
            </span>

            <span>{ratio}%</span>
          </span>
          <span className="col-span-1 text-center xsm:w-full xsm:flex xsm:items-center xsm:justify-between xsm:px-4 xsm:pb-3">
            <span className="text-primaryText  lg:hidden text-sm">
              <FormattedMessage
                id="REF_allocation"
                defaultMessage={'REF allocation'}
              />
            </span>
            {toPrecision(allocate, 0, true)}
          </span>

          {votedIndex === index && isClientMobie ? (
            <span className="col-span-1 text-center xsm:w-full xsm:flex xsm:items-center xsm:justify-between xsm:px-4 xsm:pb-3">
              <span className="text-primaryText  lg:hidden text-sm">
                <FormattedMessage
                  id="your_shares_ve"
                  defaultMessage={'Your shares'}
                />
              </span>
              {`${toPrecision(yourShare, 2)}%`}
            </span>
          ) : null}

          <span className="col-span-1 text-center text-white text-sm xsm:hidden">
            {Button}
          </span>

          <span
            className={`col-span-1 absolute right-3 ${
              votedIndex === index && isClientMobie ? 'top-8' : 'top-4'
            } text-center text-white text-sm  lg:hidden`}
          >
            {Button}
          </span>
          <BonusBar
            proposal={farmProposal}
            incentiveItem={farmProposal.incentive[index]}
            bright={votedIndex === index && farmProposal.incentive[index]}
            showYourShare={votedIndex === index}
            yourShare={`${toPrecision(yourShare, 2)}%`}
            showAddBonus={
              (typeof votedIndex === 'undefined' || votedIndex === index) &&
              status !== 'Expired'
            }
            tokens={farmProposal.incentive?.[index]?.incentive_token_ids?.map(
              (id: string) => {
                return incentiveTokens?.find((token) => token.id === id);
              }
            )}
            setShowAddBonus={setAddBonusOpen}
          />
        </div>
        <VotePopUp
          isOpen={votePopUpOpen}
          onRequestClose={() => setVotePopUpOpen(false)}
          proposal_id={farmProposal.id}
          index={index}
          tokens={tokens}
          votedThisFarm={toPrecision(
            toReadableNumber(LOVE_TOKEN_DECIMAL, farmProposal?.votes[index]),
            2,
            true
          )}
          myPower={`${toPrecision(veShare, 2, true)} (${new Big(veShareRaw || 0)
            .div(new Big(farmProposal?.ve_amount_at_last_action || '1'))
            .times(100)
            .toFixed(2)}%)`}
          ratioOld={`${toPrecision(
            scientificNotationToString(ratio.toString()),
            2,
            false,
            false
          )}%`}
          allocationOld={toPrecision(allocate, 0, true)}
          ratioNew={`${toPrecision(ratioNew, 2, false, false)}%`}
          allocationNew={toPrecision(allocateNew, 0, true)}
          curVotedVe={toPrecision(
            toReadableNumber(LOVE_TOKEN_DECIMAL, farmProposal?.votes[index]),
            2,
            true
          )}
        />
        <AddBonusPopUp
          isOpen={addBonusOpen}
          onRequestClose={() => {
            setAddBonusOpen(false);
          }}
          title={
            <FormattedMessage id="add_bonus" defaultMessage={'Add Bonus'} />
          }
          farmProposalIndex={index}
          proposal_id={farmProposal.id}
          extraIncentiveTokens={farmProposal.kind.FarmingReward.farm_list[index]
            .split(seedIdSeparator)[0]
            .split(PAIR_SEPERATOR)}
        />
      </>
    );
  };

  const isClientMobie = useClientMobile();

  const supplyPercent = votedVE
    .dividedBy(toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, VEmeta.totalVE || '1'))
    .times(100)
    .toNumber()
    .toFixed(2);

  const endtimeMoment = moment(
    Math.floor(Number(farmProposal.end_at) / TIMESTAMP_DIVISOR) * 1000
  );

  const tokenPriceList = useContext(ReferendumPageContext).tokenPriceList;

  const listRender = farmProposal?.kind?.FarmingReward?.farm_list
    ?.map((pair: string, id) => {
      const itemTokens = farmProposal?.incentive?.[
        id
      ]?.incentive_token_ids?.map((tokenId: string) => {
        return incentiveTokens?.find((token) => token?.id === tokenId);
      });

      const prices: (string | undefined)[] = itemTokens?.map(
        (token: TokenMetadata) => {
          return tokenPriceList?.[token?.id]?.price;
        }
      );

      const total = scientificNotationToString(
        prices
          ?.reduce((acc, price, i) => {
            return acc.plus(
              new Big(price || 0).times(
                toReadableNumber(
                  itemTokens?.[i]?.decimals || 24,
                  farmProposal?.incentive[id]?.incentive_amounts?.[i] || '0'
                )
              )
            );
          }, new Big(0))
          .toString() || '0'
      );

      return {
        index: id,
        key: id,
        tokens: pair
          .split(seedIdSeparator)[0]
          .split(PAIR_SEPERATOR)
          .map((id) => tokens?.[id]),
        ratio: checkedRatios[id],
        veLPT: checkedVELPTs[id],
        allocate: checkedAllocations[id],
        total,
      };
    })
    .sort((a, b) => {
      if (sortBy === 'REF_allocation') {
        return Number(b.allocate) - Number(a.allocate);
      } else if (sortBy === 'bonus') {
        return Number(b.total) - Number(a.total);
      } else {
        return a.index - b.index;
      }
    });

  return (
    <div className="flex flex-col items-center">
      <div className="text-center text-2xl xsm:font-bold xsm:text-base text-white lg:mr-4">
        <FormattedMessage id="proposed" defaultMessage={'Proposed'} />{' '}
        <span>{endtimeMoment.add(1, 'month').format('MMM yyyy')}</span>{' '}
        <FormattedMessage id="farm_reward" defaultMessage={'Farm reward'} />
        <FormattedMessage id="proposed_zh" defaultMessage={' '} />
      </div>

      <div className="text-center relative text-sm mt-4 xsm:mt-3 w-full">
        <span>
          <FormattedMessage
            id="voting_period"
            defaultMessage={'Voting period'}
          />
        </span>{' '}
        <span></span>{' '}
        {moment(
          Math.floor(Number(farmProposal.start_at) / TIMESTAMP_DIVISOR) * 1000
        )
          .utc()
          .format('D')}
        -
        {moment(
          Math.floor(Number(farmProposal.end_at) / TIMESTAMP_DIVISOR) * 1000
        )
          .utc()
          .format('D MMM, yyyy')}
        {` (UTC)`}
        <div className="rounded-3xl bg-black xsm:mt-2 lg:bottom-8  xsm:bg-opacity-0 bg-opacity-20 py-1.5 text-xs px-2 xsm:mx-auto text-senderHot absolute xsm:relative md:right-0 lg:right-0">
          {ended ? (
            <span className=" rounded-3xl text-primaryText xsm:bg-white xsm:py-1.5  xsm:bg-opacity-10 xsm:px-2 ">
              <FormattedMessage id={'ended_ve'} defaultMessage="Ended" />
            </span>
          ) : (
            <span className="flex items-center mr-2 xsm:inline-flex xsm:rounded-3xl xsm:py-1.5 xsm:bg-white xsm:bg-opacity-10 xsm:pl-2 xsm:pr-4">
              <span
                className={`rounded-3xl px-2 py-0.5 mr-2   ${
                  status === 'WarmUp'
                    ? 'text-white bg-pendingPurple'
                    : 'text-black bg-senderHot'
                }`}
              >
                {status === 'InProgress' ? (
                  <FormattedMessage id="live" defaultMessage={'Live'} />
                ) : (
                  <FormattedMessage
                    id="pending_ve"
                    defaultMessage={'Pending'}
                  />
                )}
              </span>
              <span
                className={`${
                  status === 'WarmUp' ? 'text-primaryText' : 'text-senderHot'
                }`}
              >
                {counterDownStirng}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="flex xsm:flex-col xsm:my-5  w-full my-10">
        <InfoCard
          className="text-sm mr-2 xsm:mr-0 w-full"
          titles={[
            <span className="flex items-center">
              <FormattedMessage
                id="community_gauge_share"
                defaultMessage={'Community Voting Gauge'}
              />
              <span className="ml-1">
                <QuestionTip id="voting_gauge_share_tip" />
              </span>
            </span>,
            <FormattedMessage
              id="REF_allocation"
              defaultMessage={'REF Allocation'}
            />,
            <FormattedMessage
              id="qualified_pools"
              defaultMessage={'Qualified Pools'}
            />,
          ]}
          values={[
            VotingGauge[1],
            `${toPrecision(
              farmProposal?.kind?.FarmingReward.total_reward.toString() || '0',
              0,
              true
            )} REF`,
            farmProposal?.kind?.FarmingReward.farm_list.length,
          ]}
        />

        <InfoCard
          className="text-sm ml-2 xsm:ml-0 xsm:mt-2.5 w-full"
          titles={[
            <FormattedMessage id="voted" defaultMessage={'Voted'} />,
            <FormattedMessage id="total" defaultMessage={'Total'} />,
            <FormattedMessage
              id="supply_voted"
              defaultMessage={'Supply Voted'}
            />,
          ]}
          values={[
            `${toPrecision(
              toReadableNumber(
                18,
                scientificNotationToString(
                  BigNumber.sum(
                    ...(farmProposal?.votes || ['0', '0'])
                  ).toString()
                )
              ),
              2,
              true
            )} veLPT`,
            `${
              ONLY_ZEROS.test(farmProposal.ve_amount_at_last_action)
                ? '0'
                : toPrecision(
                    toReadableNumber(
                      LOVE_TOKEN_DECIMAL,
                      farmProposal.ve_amount_at_last_action
                    ),
                    2,
                    true,
                    false
                  )
            } veLPT`,
            `${ONLY_ZEROS.test(supplyPercent) ? 0 : supplyPercent}%`,
          ]}
        />
      </div>
      {!lastRoundFarmProposal ? null : (
        <BorderGradientButton
          text={
            <FormattedMessage
              id="check_last_round"
              defaultMessage={'Check Last Round'}
            />
          }
          className="text-white text-sm  w-full h-full "
          padding=" py-2"
          width="min-w-36 h-12 relative self-start xsm:hidden"
          color="#192431"
          onClick={() => {
            setShowLastRoundVoting(true);
          }}
        />
      )}

      <FarmChart
        ratio={farmProposal?.kind?.FarmingReward?.farm_list?.map((f, i) => ({
          name: f,
          value: Number(farmProposal.votes[i]),
          pairSymbol: f
            .split(seedIdSeparator)[0]
            .split(PAIR_SEPERATOR)
            .map((id) => toRealSymbol(tokens?.[id]?.symbol || ''))
            .join('/'),
          tokens: f
            .split(seedIdSeparator)[0]
            .split(PAIR_SEPERATOR)
            .map((id) => tokens?.[id]),

          r: checkedRatios[i] + '%',
          allocation: toPrecision(checkedAllocations[i] || '0', 0, true),
          veLPT: checkedVELPTs[i] || '0',
          poolId: f.split(seedIdSeparator)[1],
        }))}
        size={farmProposal?.kind?.FarmingReward?.farm_list?.length}
        voted={votedIndex}
        proposal={farmProposal}
        voteDetail={voteDetail}
        voteHistory={voteHistoryDetail}
      />

      <Card
        className="w-full xsm:relative xsm:bottom-14"
        bgcolor="bg-transparent"
        padding={'px-2 pt-8 pb-4'}
      >
        <div
          className={`flex items-center  ${
            lastRoundFarmProposal ? 'justify-between' : 'justify-end'
          }`}
        >
          {!lastRoundFarmProposal ? null : (
            <BorderGradientButton
              text={
                <FormattedMessage
                  id="check_last_round"
                  defaultMessage={'Check Last Round'}
                />
              }
              className="text-white whitespace-nowrap text-xs text-opacity-80  w-full h-full "
              padding=" py-2"
              width="min-w-36 h-8 relative self-start  lg:hidden"
              color="#192431"
              onClick={() => {
                setShowLastRoundVoting(true);
              }}
            />
          )}

          <div className="flex items-center lg:hidden">
            <span className="mr-2">
              <DownArrowLightMobile color="#7E8A93" />
            </span>
            <SelectUI
              list={['bonus', 'REF_allocation']}
              curvalue={sortBy}
              onChange={setSortBy}
              className=" lg:hidden "
              canSelect
              labelClassName="min-w-36 border  rounded-2xl"
              dropDownClassName="min-w-40 text-sm"
              brightClick
              forMobileFarm
              dropDownItemClassName="min-w-40"
            />
          </div>
        </div>

        <div className="grid grid-cols-7 xsm:hidden pb-1">
          <span
            className="col-span-3 pl-4 cursor-pointer"
            onClick={() => {
              if (sortBy !== 'bonus') {
                setSortBy('bonus');
              }
            }}
          >
            <FormattedMessage id="farms" defaultMessage={'Farms'} />
            {' & '}
            <FormattedMessage id="bonus" defaultMessage={'Bonus'} />

            <button
              className={` pl-2  ${
                sortBy === 'bonus' ? 'text-gradientFrom' : ''
              }`}
            >
              <DownArrowVE />
            </button>
          </span>
          <span className="col-span-1 text-center">veLPT</span>
          <span className="col-span-1 text-center">
            <FormattedMessage id="ratio" defaultMessage={'Ratio'} />
          </span>
          <span
            className="col-span-1 cursor-pointer justify-center text-center flex items-center whitespace-nowrap flex-nowrap"
            onClick={() => {
              if (sortBy !== 'REF_allocation') {
                setSortBy('REF_allocation');
              }
            }}
          >
            <FormattedMessage
              id="REF_allocation"
              defaultMessage={'REF allocation'}
            />
            <button
              className={` pl-2  ${
                sortBy === 'REF_allocation' ? 'text-gradientFrom' : ''
              }`}
            >
              <DownArrowVE />
            </button>
          </span>
          <span className="col-span-1 text-center"></span>
        </div>

        {listRender.map((item, id) => {
          return (
            <FarmLine
              index={item.index}
              key={item.index}
              tokens={item.tokens}
              ratio={item.ratio}
              veLPT={item.veLPT}
              allocate={item.allocate}
            />
          );
        })}
      </Card>
      {!lastRoundFarmProposal ? null : (
        <LastRoundFarmVoting
          isOpen={showLastRoundVoting}
          onRequestClose={() => {
            setShowLastRoundVoting(false);
          }}
          title={
            <FormattedMessage
              id="last_round_voting_result"
              defaultMessage={'Last Round Voting Result'}
            />
          }
          proposal={lastRoundFarmProposal}
          VEmeta={VEmeta}
        />
      )}
    </div>
  );
};

export const CreateGovProposal = ({
  show,
  setShow,
  index,
  config,
}: {
  show: boolean;
  setShow: (s: boolean) => void;
  index: number;
  config: VEConfig;
}) => {
  const [title, setTitle] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const intl = useIntl();

  const [type, setType] = useState<string>('Poll');

  const [options, setOptions] = useState<string[]>([]);

  const [link, setLink] = useState<string>();

  const baseStartTime = addSeconds(
    (config?.min_proposal_start_vote_offset_sec || 0) + 3600
  );

  const [startTime, setStartTime] = useState<Date>(baseStartTime);

  const [endTime, setEndTime] = useState<Date>();

  const [duration, setDuration] = useState<number>();

  useEffect(() => {
    if (!duration) return;
    setEndTime(new Date(startTime.getTime() + duration * 1000));
  }, [duration, startTime]);

  const [openPickerStart, setOpenPickerStart] = useState<boolean>(false);

  const durationList = [259200, 604800, 1209600, 2592000];

  const [require, setRequire] = useState<{
    [pos: string]: string;
  }>();

  useEffect(() => {
    if (require && Object.keys(require).length > 0) {
      validate();
    }
  }, [intl.locale]);

  useEffect(() => {
    if (startTime < endTime) {
      setRequire({
        ...require,
        time: '',
      });
    }
  }, [startTime, endTime]);

  const typeList = ['Poll', 'Yes/No'];

  useEffect(() => {
    if (type === 'Yes/No') {
      setOptions(['Yes', 'No']);
    } else {
      setOptions(['']);
    }
  }, [type]);

  const isClientMobie = useClientMobile();

  const [focuesIndex, setFocusedIndex] = useState<number>(-1);

  const validate = () => {
    let newRequire = { ...require };

    if (!duration) {
      newRequire = {
        ...newRequire,
        time: intl.formatMessage({
          defaultMessage: 'Please choose voting duration',
          id: 'please_choose_voting_duration',
        }),
      };
    }

    if (!link?.trim()) {
      newRequire = {
        ...newRequire,
        link: intl.formatMessage({
          defaultMessage: 'Required field',
          id: 'required_field',
        }),
      };
    }
    if (!title?.trim()) {
      newRequire = {
        ...newRequire,
        title: intl.formatMessage({
          defaultMessage: 'Required field',
          id: 'required_field',
        }),
      };
    }

    if (options.filter((_) => !!_.trim()).length < 2) {
      newRequire = {
        ...newRequire,
        option: intl.formatMessage({
          defaultMessage: 'Required field',
          id: 'required_field',
        }),
      };
    }

    if (
      !duration ||
      !link?.trim() ||
      !title?.trim() ||
      options.filter((_) => !!_.trim()).length < 2
    ) {
      setRequire(newRequire);

      return false;
    }

    return true;
  };

  const disabled =
    !duration ||
    !link?.trim() ||
    !title?.trim() ||
    options.filter((_) => !!_.trim()).length < 2;

  return !show ? null : (
    <div className="text-white">
      <div
        className={` ${
          isClientMobie && showPreview ? 'hidden' : ''
        } text-center relative text-xl xsm:text-lg pb-7 xsm:pb-3`}
      >
        <FormattedMessage
          id="create_proposal"
          defaultMessage={'Create Proposal'}
        />

        <button
          className="absolute left-0 pr-2 top-2 xsm:top-0 text-sm text-primaryText flex items-center"
          onClick={() => {
            recoverElementsMobile();

            setShow(false);
          }}
        >
          <span className="transform scale-50 xsm:hidden">
            {<LeftArrowVE stroke="#7E8A93" strokeWidth={2} />}
          </span>
          <span className="ml-1 xsm:hidden">
            <FormattedMessage id="back" defaultMessage={'Back'} />
          </span>
          <span className=" lg:hidden pl-2 font-bold text-xl">{'<'}</span>
        </button>
      </div>

      <Card
        className={`w-full xsm:mb-20 ${
          isClientMobie && showPreview ? 'hidden' : ''
        }`}
        bgcolor="bg-black bg-opacity-20 xsm:bg-white xsm:bg-opacity-10"
        padding={'px-6 py-9 xsm:py-6'}
      >
        <div
          className={`pb-3 border-b ${
            require?.['title']
              ? 'border-error'
              : 'border-white border-opacity-10'
          }  px-2 pt-8  xsm:pt-0 text-primaryText text-xl`}
        >
          <input
            value={title}
            maxLength={100}
            placeholder={intl.formatMessage({
              id: 'proposal_title',
              defaultMessage: 'Proposal Title',
            })}
            onChange={(e) => {
              if (e.target.value) {
                setRequire({
                  ...require,
                  title: '',
                });
              }
              setTitle(e.target.value);
            }}
          />
        </div>

        <div
          className={`mx-2 pt-2 text-error text-sm ${
            require?.['title'] ? 'block' : 'hidden'
          } `}
        >
          {`${require?.['title']} !`}{' '}
        </div>

        <div className="text-xs text-primaryText text-right pt-2.5">
          {title?.length || 0}/100
        </div>

        <div className="flex items-center xsm:justify-between xsm:pt-5">
          <span className="xsm:text-sm">
            <FormattedMessage id="type" defaultMessage={'Type'} />
          </span>

          <SelectUI
            curvalue={type}
            list={typeList}
            onChange={setType}
            size={'text-sm'}
            className={'ml-2'}
            canSelect
            labelClassName="xsm:w-32 h-8"
            dropDownItemClassName="xsm:min-w-32"
          />
        </div>

        <div className={`flex items-center flex-wrap pt-2 pb-10`}>
          {options?.map((o, i) => {
            return (
              <>
                {type === 'Poll' ? (
                  <span
                    className={`flex items-center pr-1 py-1 xsm:py-2 pl-2 xsm:pr-2 w-28 xsm:w-full mt-2 relative ${
                      require?.['option'] && !o.trim() && i < 2
                        ? 'border border-error border-opacity-30'
                        : ''
                    }  bg-black ${
                      focuesIndex === i ? 'bg-opacity-20' : 'bg-opacity-10'
                    } text-sm mr-4 xsm:mr-0 rounded-md `}
                  >
                    <span
                      className="rounded-full mr-2 h-2 w-2 flex-shrink-0"
                      style={{
                        backgroundColor:
                          OPTIONS_COLORS[i % OPTIONS_COLORS.length],
                      }}
                    ></span>

                    <input
                      value={o}
                      onFocus={() => {
                        setFocusedIndex(i);
                      }}
                      onChange={(e) => {
                        setOptions([]);

                        setOptions([
                          ...options.slice(0, i),
                          e.target.value,
                          ...options.slice(i + 1, options.length),
                        ]);
                        e.target.focus();
                        setRequire({
                          ...require,
                          option: '',
                        });
                      }}
                    />

                    <button
                      className={`rounded-md text-lg bg-opacity-20 px-2.5 w-5 h-5 flex items-center justify-center ${
                        focuesIndex === i ? 'flex' : 'hidden'
                      } `}
                      onClick={() => {
                        if (options.length > 1) {
                          setOptions(
                            options
                              .slice(0, i)
                              .concat(options.slice(i + 1, options.length))
                          );
                        }
                      }}
                      style={{
                        backgroundColor: '#445867',
                      }}
                    >
                      <span>-</span>
                    </button>
                    {require?.['option'] && !o.trim() && i < 2 ? (
                      <div
                        className={`mx-2 whitespace-nowrap top-10 absolute text-error text-sm  `}
                      >
                        {`${require?.['option']} !`}{' '}
                      </div>
                    ) : null}
                  </span>
                ) : (
                  <div
                    className={`flex items-center rounded-md w-28 bg-opacity-10 bg-black text-sm pl-2 pr-1 py-1 mr-4 mt-2`}
                  >
                    <span
                      className="rounded-full mr-2 h-2 w-2"
                      style={{
                        backgroundColor:
                          OPTIONS_COLORS[i % OPTIONS_COLORS.length],
                      }}
                    ></span>

                    <span className="">{o}</span>
                  </div>
                )}
              </>
            );
          })}

          {type === 'Yes/No' ? null : (
            <>
              <button
                className=" rounded-lg xsm:w-full xsm:py-1 text-lg bg-black bg-opacity-20 xsm:bg-opacity-30 px-2.5 text-primaryText xsm:text-white mt-2 xsm:mt-5"
                style={{
                  backgroundColor: isClientMobie ? '#445867' : '',
                }}
                onClick={(e) => {
                  if (options[options.length - 1]) {
                    setOptions([...options, '']);
                  }
                }}
              >
                <span>+</span>
                <span className=" lg:hidden ml-2 text-sm relative bottom-0.5">
                  <FormattedMessage
                    id="add_option"
                    defaultMessage={'Add option'}
                  />
                </span>
              </button>
            </>
          )}
        </div>

        <div className="pb-4">
          <FormattedMessage
            id="starting_time"
            defaultMessage={'Starting Time'}
          />
          (UTC)
        </div>

        <div className="flex items-center xsm:items-start xsm:flex-col">
          <div className="flex items-center xsm:mb-5 xsm:w-full justify-between">
            <div className="rounded-lg xsm:w-10/12  bg-black bg-opacity-20 py-2 px-3 flex items-center justify-betwee w-64 cursor-pointer">
              <CustomDatePicker
                startTime={startTime}
                setStartTime={setStartTime}
                openPicker={openPickerStart}
                setOpenPicker={setOpenPickerStart}
                veconfig={config}
              />
              <div
                onClick={(e) => {
                  e.stopPropagation();

                  setOpenPickerStart(!openPickerStart);
                }}
              >
                <CalenderIcon />
              </div>
            </div>
          </div>{' '}
          <span className="mx-4 xsm:hidden">-</span>
          <div className="pb-4 lg:hidden">
            <FormattedMessage id="ending_time" defaultMessage={'Ending Time'} />
            (UTC)
          </div>
          <div className="flex items-center xsm:w-full justify-between xsm:text-sm xsm:ml-3 text-farmText">
            {!duration
              ? '/'
              : moment(startTime)
                  .add(duration, 'seconds')
                  .format('yyyy-MM-DD HH:mm:ss A')}
          </div>
        </div>

        <div className="pb-4 mt-6 flex items-center xsm:flex-col xsm:items-start">
          <span className="mr-3 xsm:mb-2">
            <FormattedMessage id="duration" defaultMessage={'Duration'} />
          </span>

          <div className="bg-opacity-30 rounded-md bg-durationBg">
            {durationList.map((d) => {
              const days = d / 86400;
              return (
                <button
                  className={`text-sm px-6 xsm:px-3 py-0.5 rounded-md ${
                    duration === d
                      ? 'text-poolRowHover bg-gradientFrom'
                      : 'text-farmText'
                  }`}
                  onClick={() => {
                    setDuration(d);
                  }}
                >
                  {days}{' '}
                  {<FormattedMessage id="days_ve" defaultMessage={'days'} />}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`mx-2 pt-2 text-error text-sm ${
            require?.['time'] ? 'block' : 'hidden'
          } `}
        >
          {`${require?.['time']} !`}{' '}
        </div>

        <div className="pb-4 pt-10">
          <FormattedMessage
            id="forum_discussion"
            defaultMessage={'Forum Discussion'}
          />
        </div>
        <div className='border-b border-white xsm:border-none xsm:pb-0 border-opacity-10 pb-6 mb-6"'>
          <div
            className={`w-full ${
              require?.['link'] ? 'border border-error border-opacity-30' : ''
            } text-sm text-primaryText px-5 bg-black bg-opacity-20 py-2 flex items-center rounded-lg `}
          >
            <span className="text-white mr-3">
              <VEARROW />
            </span>

            <input
              value={link}
              onChange={(e) => {
                if (e.target.value) {
                  setRequire({
                    ...require,
                    link: '',
                  });
                }
                setLink(e.target.value);
              }}
              placeholder={intl.formatMessage({
                id: 'share_forum_discussion_link_here',
                defaultMessage: 'Share forum discussion link here',
              })}
              className="w-full"
            />
          </div>

          <div
            className={`mx-2 pt-2 text-error text-sm ${
              require?.['link'] ? 'block' : 'hidden'
            } `}
          >
            {`${require?.['link']} !`}{' '}
          </div>
        </div>

        <div className="flex items-center justify-end pt-6 xsm:pt-10 text-sm xsm:absolute xsm:right-0 xsm:w-full">
          <BorderGradientButton
            text={<FormattedMessage id="preview" defaultMessage={'Preview'} />}
            color={isClientMobie ? '#011320' : '#192734 '}
            onClick={() => setShowPreview(true)}
            width="w-28 h-8 xsm:w-1/2 xsm:mr-2 xsm:h-10"
            className="w-full h-full"
            padding="p-0"
          />

          <NewGradientButton
            text={<FormattedMessage id="create" defaultMessage={'Create'} />}
            onClick={() => {
              if (validate()) {
                createProposal({
                  description: {
                    title: `${title}`,
                    link,
                  },
                  kind: type === 'Poll' ? 'Poll' : 'Common',
                  options,
                  duration_sec: duration,
                  start: dateToUnixTimeSec(startTime),
                });
              }
            }}
            disabled={disabled}
            beatStyling={!disabled}
            className="ml-4 xsm:ml-2 h-8 w-28 xsm:text-sm xsm:w-1/2 xsm:h-10"
            padding="p-0"
            disableForUI
          />
        </div>
      </Card>

      <PreviewPopUp
        isOpen={showPreview}
        onRequestClose={() => setShowPreview(false)}
        index={index}
        title={<FormattedMessage id="preview" defaultMessage={'Preview'} />}
        startTime={startTime}
        endTime={endTime}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
        contentTitle={title}
        customWidth={isClientMobie ? '95%' : '1000px'}
        link={link}
        show={showPreview}
        setShow={setShowPreview}
        options={options.slice(
          0,
          !!options[options.length - 1] ? options.length : options.length - 1
        )}
        turnOut={'-%'}
        totalVE={'-'}
        type={type}
      />
    </div>
  );
};

export const GovProposal = ({
  proposals,
  setShowCreateProposal,
  showDetail,
  setShowDetail,
  UnclaimedProposal,
}: {
  proposals: Proposal[];
  setShowCreateProposal: (s: boolean) => void;
  showDetail: number;
  setShowDetail: (s: number) => void;
  UnclaimedProposal: UnclaimedProposal;
}) => {
  const intl = useIntl();
  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const [transactionHashes, setTransactionHashes] = useState<ProposalHash[]>(
    []
  );

  useEffect(() => {
    if (!proposals || proposals.length === 0) return;

    const proposal_ids = proposals.map((p) => p.id);

    getProposalHashes({ proposal_ids }).then((res: ProposalHash[]) => {
      setTransactionHashes(res);
    });
  }, [proposals]);

  const [bonusOnly, setBonusOnly] = useState<boolean>(
    (isSignedIn && localStorage.getItem(BonusOnlyKey)?.toString() === '1') ||
      false
  );

  const [createdOnly, setCreatedOnly] = useState<boolean>(
    (isSignedIn && localStorage.getItem(CreatedOnlyKey)?.toString() === '1') ||
      false
  );

  const [votedOnly, setVotedOnly] = useState<boolean>(
    (isSignedIn && localStorage.getItem(VotedOnlyKey)?.toString() === '1') ||
      false
  );

  const [filterOpen, setFilterOpen] = useState<boolean>(false);

  const VEmeta = useContext(ReferendumPageContext).VEmeta;

  const voteHistory = useVoteDetailHisroty();

  const voteDetail = useVoteDetail();

  const [state, setState] = useState<string>('all');

  const { veShare } = useAccountInfo();

  const proposalStatus = {
    InProgress: 'live',
    Expired: 'ended_ve',
    WarmUp: 'pending_ve',
  };

  const filterFunc = (p: Proposal) => {
    if (votedOnly) {
      if (
        !Object.keys(voteDetail || [])
          .concat(Object.keys(voteHistory || []))
          ?.includes(p.id.toString())
      ) {
        return false;
      }
    }
    if (createdOnly) {
      if (p.proposer !== getCurrentWallet().wallet.getAccountId()) {
        return false;
      }
    }

    if (bonusOnly) {
      if (!p?.incentive?.[0]) {
        return false;
      }
    }

    return true;
  };

  const history = useHistory();
  const isClientMobie = useClientMobile();

  useEffect(() => {
    if (
      typeof showDetail === 'number' &&
      proposals &&
      !proposals.find((p) => p.id === showDetail)
    ) {
      history.push('/referendum');
      isClientMobie && recoverElementsMobile();
    }
  }, [showDetail, proposals]);

  const filteredProposals = proposals
    ?.filter((p) => state === 'all' || proposalStatus[p.status] === state)
    ?.filter(filterFunc)
    ?.sort((a, b) => b.id - a.id);

  return (
    <div className={`flex flex-col text-white text-sm relative `}>
      {showDetail ? null : (
        <div
          className={`flex items-center justify-between relative pb-6 xsm:pb-2`}
        >
          <div className="flex items-center">
            <div
              className="ml-1"
              data-type="info"
              data-place={'top'}
              data-multiline={true}
              data-class="reactTip"
              data-tooltip-html={`
              <div class="text-xs w-40">

                <div 
                  style="font-weight:400",
                >
                ${intl.formatMessage({
                  id: 'only_for_whitelist_address',
                  defaultMessage: 'Only for whitelist address',
                })}
                                </div>
              </div>
            `}
              data-tooltip-id="create_propopsal_tip"
            >
              {!VEmeta?.whitelisted_accounts?.includes(
                getCurrentWallet().wallet.getAccountId()
              ) ? (
                <FarmProposalGrayButton
                  text={
                    <FormattedMessage
                      id="create_proposal"
                      defaultMessage={'Create Proposal'}
                    />
                  }
                  className="h-10 xsm:h-8 opacity-100"
                  padding="py-0 px-3"
                />
              ) : (
                <BorderGradientButton
                  text={
                    <FormattedMessage
                      id="create_proposal"
                      defaultMessage={'Create Proposal'}
                    />
                  }
                  onClick={() => {
                    hideElementsMobile();

                    setShowCreateProposal(true);
                  }}
                  color="#182430"
                  width="h-10 xsm:h-8"
                  className="h-full "
                  padding="px-3 py-0"
                />
              )}
              <CustomTooltip className="w-20" id="create_propopsal_tip" />
            </div>

            {/* <FilterSelector
              textId="created_only"
              defaultText="Created Only"
              isOpen={createdOnly}
              setIsOpen={setCreatedOnly}
              storageKey={CreatedOnlyKey}
              className={`ml-6 xsm:hidden `}
            /> */}
          </div>

          {/* <div className="flex  lg:hidden">
            <FarmMobileSelector
              curStatus={state}
              setBonusOnly={setBonusOnly}
              bonusOnly={bonusOnly}
              setCreatedOnly={setCreatedOnly}
              createdOnly={createdOnly}
              setVotedOnly={setVotedOnly}
              votedOnly={votedOnly}
              setFilterOpen={setFilterOpen}
              filterOpen={filterOpen}
              statusList={['All', 'Live', 'Ended', 'Pending']}
              setStatus={setState}
              className={`${
                state === 'All' && !bonusOnly && !votedOnly && !createdOnly
                  ? 'text-primaryText'
                  : 'text-white'
              }`}
              veMeta={VEmeta}
            />
          </div> */}

          <div className="flex items-center">
            {/* <FilterSelector
              textId="voted_only"
              defaultText="Voted Only"
              isOpen={votedOnly}
              setIsOpen={setVotedOnly}
              storageKey={VotedOnlyKey}
            />

            <FilterSelector
              textId="bonus_only"
              defaultText="Bonus Only"
              isOpen={bonusOnly}
              setIsOpen={setBonusOnly}
              storageKey={BonusOnlyKey}
              className="ml-6"
            /> */}

            <SelectUI
              curvalue={state}
              list={['all', 'live', 'ended_ve', 'pending_ve']}
              onChange={setState}
              className="ml-6 "
              canSelect
              labelClassName="xsm:w-28 lg:w-32 xsm:bg-cardBg xsm:border xsm:border-selectBorder"
              dropDownClassName="min-w-36 text-sm"
              brightClick
              dropDownItemClassName="min-w-36"
            />
          </div>
        </div>
      )}
      <div className={`flex flex-col ${filterOpen ? 'xsm:pb-44' : ''}`}>
        {filteredProposals?.length === 0 ? <NoResultFilter /> : null}
        {filteredProposals?.map((p) => (
          <GovProposalItem
            VEmeta={VEmeta}
            proposal={p}
            description={JSON.parse(p.description)}
            setShowDetail={setShowDetail}
            showDetail={showDetail}
            voteHistory={voteHistory}
            voteDetail={voteDetail}
            veShare={veShare}
            transaction_hash={
              transactionHashes.find((t) => Number(t.proposal_id) === p.id)
                ?.transaction_hash || ''
            }
          />
        )) || []}
      </div>
    </div>
  );
};

interface ParamTypes {
  proposal_id: string;
}

export const ProposalCard = () => {
  const tab = new URLSearchParams(window.location.search).get('tab');

  const [curTab, setTab] = useState<PROPOSAL_TAB>(
    tab === 'farm'
      ? PROPOSAL_TAB.FARM
      : PROPOSAL_TAB[localStorage.getItem(REF_FI_PROPOSALTAB)] ||
          PROPOSAL_TAB.FARM
  );
  useEffect(() => {
    localStorage.setItem(REF_FI_PROPOSALTAB, curTab);
    if (tab) {
      window.history.replaceState(
        {},
        '',
        window.location.origin + window.location.pathname
      );
    }
  }, [curTab]);

  const [farmProposal, setFarmProposal] = useState<Proposal>();

  const [lastRoundFarmProposal, setLastRoundFarmProposal] =
    useState<Proposal>();

  const [proposals, setProposals] = useState<Proposal[]>();

  const [showCreateProposal, setShowCreateProposal] = useState<boolean>(false);

  const VEmeta = useVEmeta();

  const config = useVEconfig();

  const proposal_id = window.location.pathname.split('/')?.[2];

  const [showDetail, setShowDetail] = useState<number>(
    proposal_id && Number(proposal_id) >= 0 ? Number(proposal_id) : undefined
  );

  const isClientMobie = useClientMobile();

  useEffect(() => {
    getProposalList().then((list: Proposal[]) => {
      setProposals(list);
      const farmProposals = list.filter((p) =>
        Object.keys(p.kind).includes('FarmingReward')
      );

      const farmProposal =
        farmProposals.length === 1
          ? farmProposals[0]
          : _.maxBy(
              farmProposals.filter(
                (p) =>
                  Math.floor(Number(p.start_at) / TIMESTAMP_DIVISOR) <
                    moment().unix() && p.status === 'InProgress'
              ),
              (o) => Number(o.start_at)
            );

      const toSetFarmProposal =
        farmProposal ||
        _.minBy(
          farmProposals.filter(
            (p) =>
              Math.floor(Number(p.start_at) / TIMESTAMP_DIVISOR) >
                moment().unix() && p.status === 'WarmUp'
          ),
          (o) => Number(o.start_at)
        ) ||
        _.maxBy(
          farmProposals.filter(
            (p) =>
              Math.floor(Number(p.end_at) / TIMESTAMP_DIVISOR) <
                moment().unix() && p.status === 'Expired'
          ),
          (o) => Number(o.end_at)
        );

      setFarmProposal(toSetFarmProposal);

      const lastRoundProposal = _.maxBy(
        farmProposals.filter(
          (p) => p.id < toSetFarmProposal.id && p.status === 'Expired'
        ),
        (o) => Number(o.end_at)
      );

      setLastRoundFarmProposal(lastRoundProposal || undefined);
    });
  }, [showDetail]);

  useEffect(() => {
    if (typeof showDetail === 'number' && isClientMobie) {
      hideElementsMobile();
    }

    if (typeof showDetail === 'number') {
      setTab(PROPOSAL_TAB.GOV);
    }
  }, [showDetail]);

  useEffect(() => {
    localStorage.setItem(REF_FI_PROPOSALTAB, curTab);
  }, [curTab]);
  const UnclaimedProposal = useUnclaimedProposal();
  const unClaimedRewards = useUnClaimedRewardsVE();

  const notShowRewardCard =
    !unClaimedRewards || unClaimedRewards?.length === 0 || showDetail;

  return (
    <div className="w-full flex flex-col items-center relative">
      <ProposalTab
        curTab={curTab}
        setTab={setTab}
        className={`hiddenOnSecondPage  text-sm mt-12 xsm:w-full  xsm:mt-8 mb-4  xsm:items-center xsm:p-1 xsm:rounded-lg`}
      />

      {notShowRewardCard || (showCreateProposal && isClientMobie) ? null : (
        <div className="hiddenOnSecondPage xsm:w-64 xsm:fixed xsm:bottom-8 xsm:z-50">
          <RewardCard rewardList={unClaimedRewards} />
        </div>
      )}

      <ProposalWrapper
        show={curTab === PROPOSAL_TAB.FARM}
        padding={!notShowRewardCard ? 'px-8 pb-8 xsm:pt-0 pt-20' : 'p-8'}
      >
        {!farmProposal ? null : (
          <FarmProposal
            lastRoundFarmProposal={lastRoundFarmProposal}
            farmProposal={farmProposal}
            VEmeta={VEmeta}
          />
        )}
      </ProposalWrapper>

      <ProposalWrapper
        show={curTab === PROPOSAL_TAB.GOV}
        bgcolor={'bg-cardBg'}
        padding={
          !notShowRewardCard && !isClientMobie
            ? 'px-8 pb-8 pt-20 '
            : 'p-8 xsm:pt-0 pb-8'
        }
      >
        {showCreateProposal ? (
          <CreateGovProposal
            show={showCreateProposal}
            setShow={setShowCreateProposal}
            index={proposals?.length || 0}
            config={config}
          />
        ) : (
          <GovProposal
            proposals={proposals?.filter(
              (p) => !Object.keys(p.kind).includes('FarmingReward')
            )}
            setShowCreateProposal={setShowCreateProposal}
            showDetail={showDetail}
            setShowDetail={setShowDetail}
            UnclaimedProposal={UnclaimedProposal}
          />
        )}
      </ProposalWrapper>
    </div>
  );
};
