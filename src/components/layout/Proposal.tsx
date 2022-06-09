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
import { RightArrowVE } from '../icon/Referendum';
import { VoteFarm } from '../../services/referendum';
import { toNonDivisibleNumber } from '../../utils/numbers';
import {
  ftGetTokensMetadata,
  TokenMetadata,
  ftGetTokenMetadata,
} from '../../services/ft-contract';

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

export const FarmProposal = () => {
  const defautLeft = '0d: 0h 0m ';

  const [counterDown, setCounterDown] = useState<string>(defautLeft);

  const curMonth = moment().format('MMMM');
  const curYear = moment().format('y');

  const VEmeta = useVEmeta();

  const voteDetail = useVoteDetail();

  console.log(voteDetail, 'votedetail');

  const { accountInfo, veShare, veShareRaw } = useAccountInfo();
  const [hover, setHover] = useState<number>();

  const [farmProposal, setFarmProposal] = useState<Proposal>();
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
    voted?: boolean;
    index: number;
    tokens: TokenMetadata[];
  }) => {
    const [votePopUpOpen, setVotePopUpOpen] = useState<boolean>(false);

    const ButtonRender = () => {
      const submit = (e: Event) => {
        !voted
          ? setVotePopUpOpen(true)
          : ended
          ? e.stopPropagation()
          : cancelVote({ proposal_id: farmProposal.id });
      };

      const text =
        hover === index && voted ? (
          <FormattedMessage id="cancel" defaultMessage={'Cancel'} />
        ) : ended ? (
          <FormattedMessage id="ended" defaultMessage={'Ended'} />
        ) : (
          <FormattedMessage id="vote" defaultMessage={'Vote'} />
        );

      return hover === index ? (
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
          className={`py-2 px-4 ${voted || ended ? 'opacity-30' : ''}`}
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
              className="ml-2 text-white"
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
    getProposalList().then((list: Proposal[]) => {
      const farmProposal = list.find((p) =>
        Object.keys(p.kind).includes('FarmingReward')
      );

      setFarmProposal(farmProposal);
    });
  }, []);

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
    .dividedBy(VEmeta.totalVE || 1)
    .times(100)
    .toNumber()
    .toFixed(2);

  return (
    <div className="flex flex-col">
      <div className="text-center text-2xl text-white">
        <FormattedMessage id="proposed" defaultMessage={'Proposed'} />{' '}
        <span>{moment().add(1, 'months').format('MMMM')}</span>{' '}
        <span>{moment().add(1, 'months').format('y')}</span>{' '}
        <FormattedMessage id="farm_reward" defaultMessage={'Farm reward'} />
      </div>

      <div className="text-center relative text-sm mt-4">
        <span>Voting period</span> <span></span> 1-{moment().daysInMonth()}{' '}
        {curMonth}
        {', '}
        {curYear}
        <span className="rounded-md bg-black bg-opacity-20 py-1 px-4 text-gradientFrom absolute right-0">
          {counterDown} left
        </span>
      </div>

      <div className="flex mt-10">
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
              scientificNotationToString(
                BigNumber.sum(...(farmProposal?.votes || ['0', '0'])).toString()
              ),
              2,
              true
            )} veLPT`,
            `${toPrecision(VEmeta.totalVE, 2, true)} veLPT`,
            `${Number(supplyPercent) === 0 ? 0 : supplyPercent}%`,
          ]}
        />
      </div>

      <Card
        className="w-full"
        bgcolor="bg-white bg-opacity-10"
        padding={'px-2 pt-8 pb-4 mt-10'}
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
                voted={
                  voteDetail?.[farmProposal?.id]?.action?.VoteFarm.farm_id ===
                  id
                }
              />
            );
          }
        )}
      </Card>
    </div>
  );
};

export const ProposalWrapper = (props: any & { show: boolean }) => {
  const { show } = props;
  return (
    <Card
      padding={'p-8'}
      width="w-full"
      className={!show ? 'hidden' : 'text-primaryText '}
    >
      {props.children}
    </Card>
  );
};

export const ProposalCard = () => {
  const [curTab, setTab] = useState<PROPOSAL_TAB>(
    PROPOSAL_TAB[localStorage.getItem(REF_FI_PROPOSALTAB)] || PROPOSAL_TAB.FARM
  );

  return (
    <div className="w-full flex flex-col items-center ">
      <ProposalTab curTab={curTab} setTab={setTab} className="mt-12 mb-4" />
      <ProposalWrapper show={curTab === PROPOSAL_TAB.FARM}>
        <FarmProposal />
      </ProposalWrapper>
    </div>
  );
};
