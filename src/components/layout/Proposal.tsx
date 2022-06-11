import Big from 'big.js';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { NewGradientButton } from '~components/button/Button';
import { cancelVote, getProposalList, Proposal } from '~services/referendum';
import { scientificNotationToString, toPrecision } from '~utils/numbers';
import { Card } from '../card/Card';
import {
  useVEmeta,
  useVoteDetail,
  useAccountInfo,
} from '../../state/referendum';
import {
  toReadableNumber,
  toRoundedReadableNumber,
  multiply,
  divide,
} from '../../utils/numbers';
import { BorderGradientButton } from '../button/Button';
import { ModalWrapper } from '../../pages/ReferendumPage';
import Modal from 'react-modal';
import { Images, Symbols } from '../stableswap/CommonComp';
import { RightArrowVE, NoResultChart } from '../icon/Referendum';
import { VoteFarm } from '../../services/referendum';
import { toNonDivisibleNumber, percent } from '../../utils/numbers';
import {
  ftGetTokensMetadata,
  TokenMetadata,
  ftGetTokenMetadata,
} from '../../services/ft-contract';
import { PieChart, Pie, Cell, Sector, ResponsiveContainer } from 'recharts';
import { toRealSymbol } from '../../utils/token';
import _, { pad } from 'lodash';
import { CustomSwitch } from '../forms/SlippageSelector';
import { ArrowDownLarge } from '~components/icon';
import { FilterIcon } from '~components/icon/PoolFilter';
import { LOVE_TOKEN_DECIMAL } from '../../state/referendum';

const REF_FI_PROPOSALTAB = 'REF_FI_PROPOSALTAB_VALUE';

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
        <Symbols tokens={tokens} size={'text-xl'} seperator={'-'} />

        <div className="pt-7 w-full">
          <InfoRow
            title={
              <FormattedMessage
                id="currently_voted"
                defaultMessage={'Currently voted'}
              />
            }
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
                id="voting_ratio"
                defaultMessage={'Voting ratio '}
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
                id="currently_REF_allocation"
                defaultMessage={'Currently REF allocation'}
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
        />
      </div>
    </ModalWrapper>
  );
};

enum PROPOSAL_TAB {
  FARM = 'FARM',
  GOV = 'GOV',
}
const PAIR_SEPERATOR = '|';

export const durationFomatter = (duration: moment.Duration) => {
  return `${duration.days()}d: ${duration.hours()}h: ${duration.days()}m`;
};

function SelectUI({
  onChange,
  list,
  curvalue,
  shrink,
  className,
}: {
  onChange: (e: any) => void;
  list: string[];
  curvalue: string;
  shrink?: string;
  className?: string;
}) {
  const [showSelectBox, setShowSelectBox] = useState(false);
  const switchSelectBoxStatus = () => {
    setShowSelectBox(!showSelectBox);
  };
  const hideSelectBox = () => {
    setShowSelectBox(false);
  };
  return (
    <div
      className={`relative flex ${
        shrink ? 'items-end' : 'items-center '
      } lg:mr-5 outline-none ml-8`}
    >
      <span
        onClick={switchSelectBoxStatus}
        tabIndex={-1}
        onBlur={hideSelectBox}
        className={`flex items-center justify-between bg-black bg-opacity-20 w-24 h-5 rounded-md px-2.5 py-0.5  cursor-pointer text-xs outline-none ${
          shrink ? 'xs:w-8 md:w-8' : ''
        } ${showSelectBox ? ' text-white' : 'text-farmText'}`}
      >
        <label
          className={`whitespace-nowrap ${shrink ? 'xs:hidden md:hidden' : ''}`}
        >
          {curvalue ? curvalue : null}
        </label>
        <ArrowDownLarge />
      </span>
      <div
        className={`absolute z-50 top-8 right-0 bg-cardBg rounded-2xl px-2  text-sm w-28 ${
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
            className={`flex rounded-lg items-center p-4 text-xs h-5 text-white text-opacity-40 my-2 cursor-pointer hover:bg-black hover:bg-opacity-20 hover:text-opacity-100
            ${item == curvalue ? 'bg-black bg-opacity-20 text-opacity-100' : ''}
            `}
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

export const ProposalWrapper = (
  props: any & { show: boolean; bgcolor?: string }
) => {
  const { show, bgcolor } = props;
  return (
    <Card
      padding={'p-8'}
      width="w-full"
      bgcolor={bgcolor}
      className={!show ? 'hidden' : 'text-primaryText '}
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

const FarmChart = ({
  ratio,
  size,
}: {
  ratio: {
    name: string;
    value: number;
    pairSymbol: string;
    tokens: TokenMetadata[];
    allocation: string;
    r: string;
  }[];
  size: number;
}) => {
  if (!ratio) return null;
  const [activeIndex, setActiveIndex] = useState<number>();

  const emptyVote = ratio.every((r, i) => r.value === 0);

  const data = emptyVote
    ? ratio.map((r, i) => {
        const newr = JSON.parse(JSON.stringify(r));
        newr.value = (1 / ratio.length) * 0.99;
        return newr;
      })
    : ratio.filter((r) => r.value > 0);

  const ActiveLabel = () => {
    const activeFarm = data[activeIndex];

    return (
      <div
        className="rounded-lg border w-full border-gradientFrom px-3 pt-4 pb-3 flex flex-col text-base"
        style={{
          backgroundColor: 'rgba(26, 35, 41, 0.6)',
        }}
      >
        <div className="flex items-center justify-between w-full pb-2">
          <Images tokens={activeFarm.tokens} size="6" />
          <Symbols
            tokens={activeFarm.tokens}
            seperator={'-'}
            size="text-base"
          />
        </div>

        <div className="flex items-center justify-between pb-2">
          <span className="text-primaryText">
            <FormattedMessage id="voted_veLPT" defaultMessage={'Voted veLPT'} />
          </span>

          <span className="text-white">
            {toPrecision(
              toReadableNumber(
                18,
                scientificNotationToString(activeFarm.value.toString())
              ),
              2,
              true
            )}
          </span>
        </div>

        <div className="flex items-center justify-between pb-2">
          <span className="text-primaryText">
            <FormattedMessage id="ratio" defaultMessage={'Ratio'} />
          </span>

          <span className="text-white">{activeFarm.r}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-primaryText">
            <FormattedMessage
              id="ref_allocation"
              defaultMessage={'REF allocation'}
            />
          </span>

          <span className="text-white">{activeFarm.allocation}</span>
        </div>
      </div>
    );
  };

  const color = ['#51626B', '#667A86', '#849DA8', '#B5C9CA'];

  function customLabel(props: any) {
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
    } = props;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x1 = cx + radius * Math.cos(-midAngle * RADIAN) - 15;
    const y1 = cy + radius * Math.sin(-midAngle * RADIAN) - 15;
    if (y < cy) {
      y = y - 30;
    }

    if (index === activeIndex) return null;

    return (
      <g>
        <text
          x={x}
          y={y + 10}
          fill="#91A2AE"
          fontSize="14px"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {pairSymbol}
        </text>
        <text
          x={x}
          y={y + 30}
          fill="#91A2AE"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {`${emptyVote ? '-' : (percent * 100).toFixed(0)}%`}
        </text>
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
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius - 2) * cos;
    const sy = cy + (outerRadius - 2) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 30;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    console.log(cos, 'cos');

    return (
      <g>
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
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={'#00FFD1'}
          fill="none"
        />

        <foreignObject
          x={ex + (cos < 0 ? -1 : 0) * 250}
          y={ey - 80}
          height="160"
          width="250"
        >
          <ActiveLabel />
        </foreignObject>
      </g>
    );
  };

  const innerRadius = 140;
  const outerRadius = 170;
  return (
    <ResponsiveContainer width={'100%'} height={600}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          labelLine={false}
          label={customLabel}
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
                onMouseMove={() => setActiveIndex(index)}
              />
            );
          })}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

const GovProposalItem = ({
  status,
  description,
  proposal,
}: {
  status: 'Live' | 'Ended' | 'Pending';
  description?: string;
  proposal: Proposal;
}) => {
  const StatusIcon = () => {
    return (
      <div
        className={`rounded-3xl px-2 py-1`}
        style={{
          color:
            status === 'Ended'
              ? '#73818B'
              : status === 'Live'
              ? '#A4FFEF'
              : '#BD9FFF',
          backgroundColor:
            status === 'Ended'
              ? 'rgba(0, 0, 0, 0.2)'
              : status === 'Live'
              ? 'rgba(76, 254, 222, 0.2)'
              : 'rgba(126, 69, 255, 0.2)',
        }}
      >
        {' '}
        {<FormattedMessage id={status} defaultMessage={status} />}{' '}
      </div>
    );
  };

  console.log(status);

  return (
    <Card
      className="w-full flex items-center my-2"
      bgcolor="bg-white bg-opacity-10"
      padding={'p-8'}
    >
      <div>{status === 'Pending' ? <NoResultChart /> : null}</div>
      <div className="flex flex-col w-full ml-8">
        <div className="w-full flex items-center   justify-between">
          <div className="text-lg"> title </div>

          <StatusIcon />
        </div>

        <div className="w-full flex items-center justify-between pb-8 pt-3">
          <div className="flex items-center">
            <span className="text-primaryText mr-3">
              <FormattedMessage id="proposer" defaultMessage={'Proposter'} />
            </span>

            <span className="font-bold">{proposal.proposer}</span>
          </div>

          <span
            className={
              status === 'Ended'
                ? 'hidden'
                : `${
                    status === 'Pending'
                      ? 'text-primaryText'
                      : 'text-gradientFrom'
                  }`
            }
          >
            {durationFomatter(
              moment.duration(
                Number(proposal.start_at) / 1000000 - moment().unix()
              )
            )}
            {` left`}
          </span>
        </div>

        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <span className="flex flex-col mr-10">
              <span className="text-primaryText">
                <FormattedMessage id="turn_out" defaultMessage={'Turnout'} />
              </span>

              <span>-</span>
            </span>

            <span className="flex flex-col">
              <span className="text-primaryText">
                <FormattedMessage
                  id="top_answer"
                  defaultMessage={'Top Answer'}
                />
              </span>

              <span>-</span>
            </span>
          </div>
          <div className="flex items-center">
            <BorderGradientButton
              text={<FormattedMessage id="detail" defaultMessage={'Detail'} />}
              width="h-11 "
              className="h-full"
            />

            <NewGradientButton
              text={<FormattedMessage id="vote" defaultMessage={'Vote'} />}
              className="ml-2.5 h-11"
            />
          </div>
        </div>
      </div>
    </Card>
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
  return (
    <div className={className}>
      <NewGradientButton
        className="w-72 mr-2"
        grayDisable={curTab !== PROPOSAL_TAB.FARM}
        disableForUI
        text={
          <FormattedMessage
            id="gauge_weight_vote"
            defaultMessage={'Gauge Weight Vote'}
          />
        }
        onClick={() => setTab(PROPOSAL_TAB.FARM)}
      />

      <NewGradientButton
        className="w-72 ml-2"
        onClick={() => setTab(PROPOSAL_TAB.GOV)}
        grayDisable={curTab !== PROPOSAL_TAB.GOV}
        disableForUI
        text={
          <FormattedMessage id="governance" defaultMessage={'Governance'} />
        }
      />
    </div>
  );
};

export const FarmProposal = ({ farmProposal }: { farmProposal: Proposal }) => {
  const defautLeft = '0d: 0h 0m ';

  const [counterDown, setCounterDown] = useState<string>(defautLeft);

  const curMonth = moment().format('MMMM');
  const curYear = moment().format('y');

  const VEmeta = useVEmeta();

  const voteDetail = useVoteDetail();

  const { accountInfo, veShare, veShareRaw } = useAccountInfo();
  const [hover, setHover] = useState<number>();

  const startTime = Math.floor(
    new Big(farmProposal?.start_at || 0).div(1000000).toNumber()
  );

  const endTime = Math.floor(
    new Big(farmProposal?.end_at || 0).div(1000000).toNumber()
  );

  const ended = moment().unix() > endTime;
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
        className={`${className} bg-white bg-opacity-10 rounded-2xl px-6 flex flex-col`}
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
          return pair.split(PAIR_SEPERATOR);
        })
        .flat() || []
    ).then(setTokens);
  }, [farmProposal]);

  const FarmLine = ({
    className,
    voted,
    index,
    tokens,
  }: {
    className?: string;
    voted?: string;
    index: number;
    tokens: TokenMetadata[];
  }) => {
    const [votePopUpOpen, setVotePopUpOpen] = useState<boolean>(false);
    console.log(voted);
    const ButtonRender = () => {
      const submit = (e: Event) => {
        !voted
          ? setVotePopUpOpen(true)
          : !ended && Number(voted) === index
          ? cancelVote({ proposal_id: farmProposal.id })
          : e.stopPropagation();
      };

      const text =
        hover === index && Number(voted) === index ? (
          <FormattedMessage id="cancel" defaultMessage={'Cancel'} />
        ) : ended ? (
          <FormattedMessage id="ended" defaultMessage={'Ended'} />
        ) : (
          <FormattedMessage id="vote" defaultMessage={'Vote'} />
        );

      return hover === index && (!voted || Number(voted) === index) ? (
        <NewGradientButton
          onClick={submit}
          text={text}
          className="w-20 py-2.5 px-4 h-10"
        />
      ) : (
        <BorderGradientButton
          onClick={submit}
          text={text}
          width="w-20 h-10"
          opacity={voted || ended ? 'opacity-30' : ''}
          className={`py-2 px-4`}
          color="#323842"
        />
      );
    };

    const ratio = votedVE.isGreaterThan(0)
      ? scientificNotationToString(
          new BigNumber(farmProposal?.votes[index])
            .div(votedVE)
            .times(100)
            .toString()
        )
      : '0';

    const ratioNew = scientificNotationToString(
      new BigNumber(farmProposal?.votes[index])
        .plus(new BigNumber(veShareRaw))
        .div(votedVE.plus(veShareRaw))
        .times(100)
        .toString()
    );

    const allocate = multiply(
      divide(ratio, '100').toString(),
      farmProposal?.kind?.FarmingReward?.total_reward.toString()
    );

    const allocateNew = multiply(
      divide(ratioNew, '100').toString(),
      farmProposal?.kind?.FarmingReward?.total_reward.toString()
    );

    return (
      <div
        className={`py-5 grid grid-cols-7 rounded-lg items-center ${
          hover === index ? 'bg-chartBg bg-opacity-20' : ''
        } cursor-pointer text-white`}
        onMouseEnter={() => setHover(index)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={() => setHover(index)}
      >
        <span className="col-span-3 pl-4 flex items-center">
          <Images tokens={tokens} size={'9'} />
          <span className="pr-2.5"></span>
          <Symbols tokens={tokens} seperator={'-'} />

          {!voted ? null : (
            <NewGradientButton
              className="ml-2 text-white text-sm px-2.5 py-1.5"
              text={
                <FormattedMessage id="you_voted" defaultMessage={'You voted'} />
              }
            />
          )}
        </span>
        <span className="col-span-1 text-center">
          {toPrecision(
            toReadableNumber(24, farmProposal?.votes[index]),
            0,
            true
          )}
        </span>
        <span className="col-span-1 text-center">
          {toPrecision(ratio, 1, false)}%
        </span>
        <span className="col-span-1 text-center">
          {toPrecision(allocate, 0, true)}
        </span>
        <span className="col-span-1 text-center text-white text-sm">
          <ButtonRender />
        </span>

        <VotePopUp
          isOpen={votePopUpOpen}
          onRequestClose={() => setVotePopUpOpen(false)}
          proposal_id={farmProposal.id}
          index={index}
          tokens={tokens}
          votedThisFarm={toPrecision(
            toReadableNumber(24, farmProposal?.votes[index]),
            0,
            true
          )}
          myPower={toPrecision(veShare, 2, true)}
          ratioOld={`${toPrecision(ratio, 1, false)}%`}
          allocationOld={toPrecision(allocate, 0, true)}
          ratioNew={`${toPrecision(ratioNew, 1, false)}%`}
          allocationNew={toPrecision(allocateNew, 0, true)}
        />
      </div>
    );
  };

  useEffect(() => {
    const startTime = moment().unix();

    let duration = moment.duration(
      (endTime - startTime) * 1000,
      'milliseconds'
    );

    if (duration.asMilliseconds() < 0) {
      setCounterDown(defautLeft);
    } else {
      setCounterDown(
        `${duration.days()}d: ${duration.hours()}h: ${duration.minutes()}m `
      );
    }

    const interval = 60 * 1000;
    let timer = setInterval(() => {
      duration = moment.duration(
        duration.asMilliseconds() - interval,
        'milliseconds'
      );

      if (duration.asMilliseconds() < 0) {
        setCounterDown(defautLeft);
      } else {
        setCounterDown(
          `${duration.days()}d: ${duration.hours()}h: ${duration.minutes()}m `
        );
      }
    }, interval);

    return () => clearInterval(timer);
  }, [farmProposal]);

  const supplyPercent = votedVE
    .dividedBy(toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, VEmeta.totalVE || '1'))
    .times(100)
    .toNumber()
    .toFixed(2);

  return (
    <div className="flex flex-col items-center">
      <div className="text-center text-2xl text-white">
        <FormattedMessage id="proposed" defaultMessage={'Proposed'} />{' '}
        <span>{moment().add(1, 'months').format('MMMM')}</span>{' '}
        <span>{moment().add(1, 'months').format('y')}</span>{' '}
        <FormattedMessage id="farm_reward" defaultMessage={'Farm reward'} />
      </div>

      <div className="text-center relative text-sm mt-4 w-full">
        <span>Voting period</span> <span></span> 1-{moment().daysInMonth()}{' '}
        {curMonth}
        {', '}
        {curYear}
        <span className="rounded-md bg-black bg-opacity-20 py-1 px-4 text-gradientFrom absolute right-0">
          {ended ? (
            <span className="text-primaryText">
              <FormattedMessage
                id={'voting_ende'}
                defaultMessage="Voting Ended"
              />
            </span>
          ) : (
            `${counterDown} left`
          )}
        </span>
      </div>

      <div className="flex mt-10 w-full mb-10">
        <InfoCard
          className="text-sm mr-2 w-full"
          titles={[
            <FormattedMessage
              id="voting_gauge_share"
              defaultMessage={'Voting Gauge Share'}
            />,
            <FormattedMessage
              id="ref_allocation"
              defaultMessage={'REF Allocation'}
            />,
            <FormattedMessage
              id="designatated_pools"
              defaultMessage={'Designatated Pools'}
            />,
          ]}
          values={[
            '0',
            `${toPrecision(
              farmProposal?.kind?.FarmingReward.total_reward.toString() || '0',
              0,
              true
            )} REF`,
            farmProposal?.kind?.FarmingReward.farm_list.length,
          ]}
        />

        <InfoCard
          className="text-sm ml-2 w-full"
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
              Number(VEmeta.totalVE) === 0
                ? '0'
                : toPrecision(VEmeta.totalVE, 2, true, false)
            } veLPT`,
            `${Number(supplyPercent) === 0 ? 0 : supplyPercent}%`,
          ]}
        />
      </div>

      <FarmChart
        ratio={farmProposal?.kind?.FarmingReward?.farm_list?.map((f, i) => ({
          name: f,
          value: Number(farmProposal.votes[i]),
          pairSymbol: f
            .split(PAIR_SEPERATOR)
            .map((id) => toRealSymbol(tokens?.[id]?.symbol || ''))
            .join('/'),
          tokens: f.split(PAIR_SEPERATOR).map((id) => tokens?.[id]),

          r: votedVE.isEqualTo(0)
            ? '0'
            : toPrecision(
                scientificNotationToString(
                  new BigNumber(farmProposal.votes[i])
                    .div(votedVE)
                    .times(100)
                    .toString()
                ),
                1,
                false
              ) + '%',
          allocation: votedVE.isEqualTo(0)
            ? '0'
            : toPrecision(
                scientificNotationToString(
                  new BigNumber(farmProposal.votes[i])
                    .div(votedVE)
                    .times(farmProposal.kind.FarmingReward.total_reward)
                    .toString()
                ),
                0,
                true
              ),
        }))}
        size={farmProposal?.kind?.FarmingReward?.farm_list?.length}
      />

      <Card
        className="w-full"
        bgcolor="bg-white bg-opacity-10"
        padding={'px-2 pt-8 pb-4'}
      >
        <div className="grid grid-cols-7 pb-4">
          <span className="col-span-3 pl-4">
            <FormattedMessage id="farms" defaultMessage={'Farms'} />
          </span>
          <span className="col-span-1 text-center">veLPT</span>
          <span className="col-span-1 text-center">
            <FormattedMessage id="ratio" defaultMessage={'Ratio'} />
          </span>
          <span className="col-span-1 text-center">
            <FormattedMessage
              id="ref_allocation"
              defaultMessage={'REF allocation'}
            />
          </span>
          <span className="col-span-1 text-center">
            <FormattedMessage id="vote" defaultMessage={'Vote'} />
          </span>
        </div>

        {farmProposal?.kind?.FarmingReward?.farm_list?.map(
          (pair: string, id) => {
            return (
              <FarmLine
                index={id}
                key={id}
                tokens={pair.split(PAIR_SEPERATOR).map((id) => tokens?.[id])}
                voted={voteDetail?.[
                  farmProposal?.id
                ]?.action?.VoteFarm?.farm_id?.toString()}
              />
            );
          }
        )}
      </Card>
    </div>
  );
};

export const GovProposal = ({ proposals }: { proposals: Proposal[] }) => {
  const VotedOnlyKey = 'REF_FI_GOV_PROPOSAL_VOTED_ONLY';
  const [votedOnly, setVotedOnly] = useState<boolean>(
    localStorage.getItem(VotedOnlyKey)?.toString() === '1' || false
  );

  const [state, setState] = useState<'All' | 'Live' | 'Ended' | 'Pending'>(
    'All'
  );

  const proposalStatus = {
    InProgress: 'Live',
    Expired: 'Ended',
    WarmUp: 'Pending',
  };

  return (
    <div className="flex flex-col text-white text-sm">
      <div className="flex items-center justify-end pb-6">
        <span className="text-xs text-primaryText">
          <FormattedMessage id="voted_only" defaultMessage={'Voted only'} />
        </span>

        <CustomSwitch
          isOpen={votedOnly}
          setIsOpen={setVotedOnly}
          storageKey={VotedOnlyKey}
        />

        <SelectUI
          curvalue={state}
          list={['All', 'Live', 'Ended', 'Pending']}
          onChange={setState}
        />
      </div>

      <div>
        {proposals?.map((p) => (
          <GovProposalItem status={proposalStatus[p.status]} proposal={p} />
        ))}
      </div>
    </div>
  );
};

export const ProposalCard = () => {
  const [curTab, setTab] = useState<PROPOSAL_TAB>(
    PROPOSAL_TAB[localStorage.getItem(REF_FI_PROPOSALTAB)] || PROPOSAL_TAB.FARM
  );

  const [farmProposal, setFarmProposal] = useState<Proposal>();

  const [proposals, setProposals] = useState<Proposal[]>();

  console.log(proposals);

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
              farmProposals.filter((p) => Number(p.start_at) < moment().unix()),
              (o) => Number(o.start_at)
            );

      setFarmProposal(farmProposal);
    });
  }, []);
  useEffect(() => {
    localStorage.setItem(REF_FI_PROPOSALTAB, curTab);
  }, [curTab]);

  return (
    <div className="w-full flex flex-col items-center ">
      <ProposalTab curTab={curTab} setTab={setTab} className="mt-12 mb-4" />
      <ProposalWrapper show={curTab === PROPOSAL_TAB.FARM}>
        <FarmProposal farmProposal={farmProposal} />
      </ProposalWrapper>

      <ProposalWrapper
        show={curTab === PROPOSAL_TAB.GOV}
        bgcolor={'bg-veCardGradient'}
      >
        <GovProposal
          proposals={proposals?.filter(
            (p) => !Object.keys(p.kind).includes('FarmingReward')
          )}
        />
      </ProposalWrapper>
    </div>
  );
};
