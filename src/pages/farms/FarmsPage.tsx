import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import InputAmount from '~components/forms/InputAmount';
import { FarmMiningIcon, ModalClose } from '~components/icon';
import {
  GreenButton,
  GreenLButton,
  BorderButton,
  WithdrawButton,
} from '~components/button/Button';
import {
  getFarms,
  claimRewardByFarm,
  FarmInfo,
  getFarmInfo,
  getStakedListByAccountId,
  getRewards,
  getSeeds,
  DEFAULT_PAGE_LIMIT,
  claimRewardBySeed,
} from '~services/farm';
import {
  stake,
  unstake,
  LP_TOKEN_DECIMALS,
  withdrawReward,
} from '~services/m-token';
import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '~utils/numbers';
import { mftGetBalance } from '~services/mft-contract';
import { wallet } from '~services/near';
import Loading from '~components/layout/Loading';
import { ConnectToNearBtn } from '~components/button/Button';
import { useTokens } from '~state/token';
import { Info } from '~components/icon/Info';
import ReactTooltip from 'react-tooltip';
import { getMftTokenId, toRealSymbol } from '~utils/token';
import ReactModal from 'react-modal';
import { isMobile } from '~utils/device';
import ClipLoader from 'react-spinners/ClipLoader';
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import { getTokenPriceList } from '~services/indexer';
import Countdown, { zeroPad } from 'react-countdown';
import moment from 'moment';
import { Link, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import parse from 'html-react-parser';
import { FaArrowCircleRight, FaRegQuestionCircle } from 'react-icons/fa';
import OldInputAmount from '~components/forms/OldInputAmount';

export function FarmsPage() {
  const [unclaimedFarmsIsLoading, setUnclaimedFarmsIsLoading] = useState(false);
  const [farms, setFarms] = useState<FarmInfo[]>([]);
  const [error, setError] = useState<Error>();
  const [stakedList, setStakedList] = useState<Record<string, string>>({});
  const [rewardList, setRewardList] = useState<Record<string, string>>({});
  const [tokenPriceList, setTokenPriceList] = useState<any>();
  const [seeds, setSeeds] = useState<Record<string, string>>({});

  const { hash } = useLocation();
  const pool_id = hash.slice(1);
  const page = 1;
  const perPage = DEFAULT_PAGE_LIMIT;
  const intl = useIntl();
  async function loadFarmInfoList() {
    setUnclaimedFarmsIsLoading(true);
    const isSignedIn: boolean = wallet.isSignedIn();

    const emptyObj = async () => {
      return {};
    };
    let Params: [
      Promise<Record<string, string>>,
      Promise<Record<string, string>>,
      Promise<any>,
      Promise<Record<string, string>>
    ];

    if (isSignedIn) {
      Params = [
        getStakedListByAccountId({}),
        getRewards({}),
        getTokenPriceList(),
        getSeeds({}),
      ];
    } else {
      Params = [emptyObj(), emptyObj(), getTokenPriceList(), getSeeds({})];
    }

    const resolvedParams: [
      Record<string, string>,
      Record<string, string>,
      any,
      Record<string, string>
    ] = await Promise.all(Params);

    const stakedList: Record<string, string> = resolvedParams[0];
    const rewardList: Record<string, string> = resolvedParams[1];

    const tokenPriceList: any = resolvedParams[2];

    const seeds: Record<string, string> = resolvedParams[3];

    setStakedList(stakedList);
    setRewardList(rewardList);
    setTokenPriceList(tokenPriceList);
    setSeeds(seeds);

    const composeFarms = (farms: FarmInfo[]) => {
      let tempMap = {};
      let tempFarms = [];

      while (farms.length) {
        let current = farms.pop();
        const farmEnded = current.farm_status === 'Ended';

        if (farmEnded) {
          tempMap[current.start_at + current.seed_id] =
            tempMap[current.start_at + current.seed_id] || [];
          tempMap[current.start_at + current.seed_id].push(current);
        } else {
          tempMap[current.seed_id] = tempMap[current.seed_id] || [];
          tempMap[current.seed_id].push(current);
        }
      }

      tempFarms = Object.keys(tempMap)
        .sort()
        .reverse()
        .map((key) => tempMap[key]);

      tempFarms.sort(function (a, b) {
        return b.length - a.length;
      });

      return tempFarms;
    };

    getFarms({
      page,
      perPage,
      stakedList,
      rewardList,
      tokenPriceList,
      seeds,
    }).then((farms) => {
      setUnclaimedFarmsIsLoading(false);
      farms = composeFarms(farms);
      setFarms(farms);
    });
  }
  useEffect(() => {
    loadFarmInfoList().then();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById(pool_id).scrollIntoView();
    }, 500);
    return () => clearTimeout(timer);
  }, [unclaimedFarmsIsLoading]);

  return (
    <>
      <div className="w-1/3 xs:w-full md:w-full flex m-auto justify-center">
        {error ? <Alert level="error" message={error.message} /> : null}
      </div>
      <div className="flex gaps-x-8 px-5 -mt-12 xs:flex-col xs:mt-8 md:flex-col md:mt-8">
        <div className="w-96 mr-4 relative xs:w-full md:w-full">
          <div className="text-green-400 text-5xl px-7 xs:text-center md:text-center">
            <FormattedMessage id="farms" defaultMessage="Farms" />
          </div>
          <div className="text-whiteOpacity85 text-xs py-4 p-7 xs:text-center">
            <FormattedMessage
              id="stake_your_liquidity_provider_LP_tokens"
              defaultMessage="Stake your Liquidity Provider (LP) tokens"
            />
            !
          </div>
          {unclaimedFarmsIsLoading ? (
            <Loading />
          ) : (
            <div className="bg-greenOpacity100 text-whiteOpacity85 rounded-xl p-7">
              <div className="text-xl flex">
                <div className="float-left">
                  <FormattedMessage
                    id="your_rewards"
                    defaultMessage="Your Rewards"
                  />
                </div>
                <div
                  className="float-left mt-2 ml-2 text-sm"
                  data-type="dark"
                  data-place="right"
                  data-multiline={true}
                  data-tip={parse(
                    intl.formatMessage({ id: 'farmRewardsCopy' })
                  )}
                  data-for="yourRewardsId"
                >
                  <FaRegQuestionCircle />
                </div>
                <ReactTooltip
                  id="yourRewardsId"
                  className="text-xs shadow-4xl"
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                  class="tool-tip"
                  textColor="#c6d1da"
                />
              </div>
              <div className="text-xs pt-2">
                {Object.entries(rewardList).map((rewardToken: any, index) => (
                  <WithdrawView key={index} data={rewardToken} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-grow xs:flex-none">
          <div className="overflow-auto relative mt-8 pb-4">
            {unclaimedFarmsIsLoading ? (
              <Loading />
            ) : (
              <div className="grid grid-cols-2 gap-4 2xl:grid-cols-3 xs:grid-cols-1 md:grid-cols-1">
                {farms.map((farm) => (
                  <div key={farm[0].farm_id} id={`${farm[0].pool.id}`}>
                    <FarmView
                      farmsData={farm}
                      farmData={farm[0]}
                      stakedList={stakedList}
                      rewardList={rewardList}
                      tokenPriceList={tokenPriceList}
                      seeds={seeds}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function WithdrawView({ data }: { data: any }) {
  const [disableWithdraw, setDisableWithdraw] = useState<boolean>(false);
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const [token, setToken] = useState<TokenMetadata>();
  const withdrawLoadingColor = '#ffffff';
  const withdrawLoadingSize = 12;

  useEffect(() => {
    ftGetTokenMetadata(data[0]).then(setToken);
    if (data[1] === '0') {
      setDisableWithdraw(true);
    }
  }, [data]);

  function withdrawRewards() {
    setDisableWithdraw(true);
    setWithdrawLoading(true);
    withdrawReward({
      token_id: data[0],
      amount: toReadableNumber(token.decimals, data[1]),
      token: token,
    });
  }

  if (!token) return Loading();

  return (
    <div>
      <div
        key={data.farm_id}
        className="py-2 flex items-center justify-between"
      >
        <div>
          {toPrecision(toReadableNumber(token.decimals, data[1]), 6)}{' '}
          {toRealSymbol(token.symbol)}
        </div>
        <div>
          {wallet.isSignedIn() ? (
            <WithdrawButton
              onClick={withdrawRewards}
              disabled={disableWithdraw}
            >
              <div>
                <ClipLoader
                  color={withdrawLoadingColor}
                  loading={withdrawLoading}
                  size={withdrawLoadingSize}
                />
              </div>
              {withdrawLoading ? null : (
                <div>
                  <FormattedMessage id="withdraw" defaultMessage="Withdraw" />
                </div>
              )}
            </WithdrawButton>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </div>
    </div>
  );
}

function FarmView({
  farmsData,
  farmData,
  stakedList,
  rewardList,
  tokenPriceList,
  seeds,
}: {
  farmsData: FarmInfo[];
  farmData: FarmInfo;
  stakedList: Record<string, string>;
  rewardList: Record<string, string>;
  tokenPriceList: any;
  seeds: Record<string, string>;
}) {
  const [farmsIsLoading, setFarmsIsLoading] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [unstakeVisible, setUnstakeVisible] = useState(false);
  const [stakeVisible, setStakeVisible] = useState(false);
  const [stakeBalance, setStakeBalance] = useState('0');
  const [error, setError] = useState<Error>();
  const [ended, setEnded] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const [disableClaim, setDisableClaim] = useState<boolean>(false);
  const [data, setData] = useState<FarmInfo>();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [apr, setApr] = useState('0');

  const clipColor = '#00c08b';
  const clipSize = 12;
  const claimLoadingColor = '#ffffff';
  const claimLoadingSize = 12;
  const refreshTime = 120000;

  const PoolId = farmData.lpTokenId;
  const tokens = useTokens(farmData?.tokenIds);
  const endTime =
    data?.reward_per_session > 0
      ? moment(data?.start_at).valueOf() +
        (data?.session_interval * data?.total_reward) / data?.reward_per_session
      : 0;
  const intl = useIntl();

  const renderer = (countdown: any) => {
    if (countdown.completed) {
      return null;
    } else {
      return (
          <div className="text-farmText">
            <span className="text-green-600">{countdown.days}</span> days{' '}
            <span className="text-green-600 inline-block w-20">
              {zeroPad(countdown.hours)}:{zeroPad(countdown.minutes)}:
              {zeroPad(countdown.seconds)}
            </span>
          </div>
      );
    }
  };

  useEffect(() => {
    setEnded(isEnded(farmData));
    setPending(isPending(farmData));
    setData(farmData);
    setLoading(false);
  }, [farmData]);

  useEffect(() => {
    if (count > 0) {
      setLoading(true);
      getFarmInfo(
        farmData,
        farmData.pool,
        stakedList[farmData.seed_id],
        tokenPriceList,
        rewardList[farmData.reward_token],
        seeds[farmData.seed_id],
        farmData.lpTokenId
      ).then((data) => {
        setData(data);
        setLoading(false);
      });
    }

    if (data) {
      setEnded(isEnded(data));
      setPending(isPending(data));
    }

    const id = setInterval(() => {
      setCount(count + 1);
    }, refreshTime);
    return () => clearInterval(id);
  }, [count]);

  async function showUnstakeModal() {
    setUnstakeVisible(true);
  }

  async function showStakeModal() {
    const b = await mftGetBalance(getMftTokenId(data.lpTokenId));
    setStakeBalance(toReadableNumber(LP_TOKEN_DECIMALS, b));
    setStakeVisible(true);
  }

  function showWithDraw() {
    setWithdrawVisible(true);
  }

  function claimReward() {
    setDisableClaim(true);
    setClaimLoading(true);
    if (farmsData.length > 1) {
      claimRewardBySeed(data.seed_id)
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          setDisableClaim(false);
          setError(error);
        });
    } else {
      claimRewardByFarm(data.farm_id)
        .then(() => {
          window.location.reload();
        })
        .catch((error) => {
          setDisableClaim(false);
          setError(error);
        });
    }
  }

  function isEnded(data: FarmInfo) {
    let ended: boolean = true;
    if (farmsData.length > 1) {
      for (let i = 0; i < farmsData.length; i++) {
        if (farmsData[i].farm_status != 'Ended') {
          ended = false;
          break;
        }
      }
    } else {
      ended = data.farm_status === 'Ended';
    }
    return ended;
  }

  function isPending(data: FarmInfo) {
    let pending: boolean = true;
    if (farmsData.length > 1) {
      for (let i = 0; i < farmsData.length; i++) {
        if (moment.unix(farmsData[i].start_at).valueOf() > moment().valueOf()) {
          pending = true;
        } else {
          if (farmsData[i].farm_status != 'Pending') {
            pending = false;
            break;
          }
        }
      }
    } else {
      if (moment.unix(data.start_at).valueOf() > moment().valueOf()) {
        pending = true;
      } else {
        pending = data.farm_status === 'Pending';
      }
    }
    return pending;
  }

  function farmStarted() {
    let started: boolean;
    if (farmsData.length > 1) {
      let tempNum = 0;
      farmsData.forEach(function (item) {
        if (moment.unix(item.start_at).valueOf() < moment().valueOf())
          tempNum++;
      });
      started = tempNum > 0;
    } else {
      started = moment.unix(data.start_at).valueOf() < moment().valueOf();
    }
    return started;
  }

  function getStartTime() {
    let start_at: any[] = [];
    if (farmsData.length > 1) {
      farmsData.forEach(function (item) {
        start_at.push(item.start_at);
      });
      start_at = _.sortBy(start_at);
      start_at = start_at.filter(function (val) {
        return val != '0';
      });
    } else {
      start_at.push(data.start_at);
    }
    return start_at[0];
  }

  function showEndAt() {
    let showEndAt: boolean;
    if (farmsData.length > 1) {
      let tempNum = 0;
      farmsData.forEach(function (item) {
        if (item?.reward_per_session && item?.total_reward > 0) tempNum++;
      });
      showEndAt = tempNum > 0;
    } else {
      showEndAt = data?.reward_per_session && data?.total_reward > 0;
    }
    return farmStarted() && showEndAt;
  }

  function getEndTime() {
    let end_at: any[] = [];

    if (farmsData.length > 1) {
      farmsData.forEach(function (item) {
        end_at.push(
          item?.reward_per_session > 0
            ? moment(item?.start_at).valueOf() +
                (item?.session_interval * item?.total_reward) /
                  item?.reward_per_session
            : ''
        );
      });
      end_at.sort().reverse();
    } else {
      end_at.push(
        moment(data?.start_at).valueOf() +
          (data?.session_interval * data?.total_reward) /
            data?.reward_per_session
      );
    }

    return end_at[0];
  }

  function getRewardTokensSymbolOld() {
    let symbols = '';
    if (farmsData.length > 1) {
      farmsData.forEach(function (item) {
        symbols += toRealSymbol(item?.rewardToken?.symbol) + '/';
      });
      symbols = symbols.substring(0, symbols.lastIndexOf('/'));
    } else {
      symbols = toRealSymbol(data?.rewardToken?.symbol);
    }
    return symbols;
  }
  function getRewardTokensSymbol() {
    let result:string = ''
    farmsData.forEach(item => {
      const {rewardToken} = item;
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${rewardToken.icon}"/>
                          <label class="text-xs text-navHighLightText">${rewardToken?.symbol}</label>
                        </div>`
      result += itemHtml;
    });
    return result;
  }

  function getRewardTokensIconOld() {
    let icons = '';
    if (farmsData.length > 1) {
      farmsData.forEach(function (item) {
        icons += `<img className="h-5 w-5 xs:h-5 xs:w-5 mr-1.5 rounded-full" src="${item?.rewardToken?.icon}" />`;
      });
    } else {
      icons = `<img className="h-5 w-5 xs:h-5 xs:w-5 mr-1.5 rounded-full" src="${data?.rewardToken?.icon}" />`;
    }
    return icons;
  }
  function getRewardTokensIcon() {
    let icons:any[] = [];
    farmsData.forEach(function (item) {
      const {farm_id, rewardToken} = item;
      const icon = <img key={farm_id} className="h-5 w-5 ml-1.5 rounded-full" src={rewardToken?.icon} />;
      icons.push(icon);
    });
    return icons;
  }

  function getTotalApr() {
    let apr = 0;
    if (farmsData.length > 1) {
      farmsData.forEach(function (item) {
        apr += Number(item.apr);
      });
    } else {
      apr = Number(data.apr);
    }
    return toPrecision(apr.toString(), 2);
  }

  function getAprListOld() {
    let result = '';
    if (farmsData.length > 1) {
      farmsData.forEach(function (item) {
        result += `<div>${item?.rewardToken?.symbol} : ${item.apr}% APR</div>`;
      });
    } else {
      result = `<div>${data?.rewardToken?.symbol} : ${data.apr}% APR</div>`;
    }
    return result;
  }
  function getAprList() {
    let result:string = ''
    farmsData.forEach(item => {
      const {rewardToken, apr} = item;
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${rewardToken.icon}"/>
                          <label class="text-xs text-navHighLightText">${formatWithCommas(apr) + '%'}</label>
                        </div>`
      result += itemHtml;
    });
    return result;
  }

  function getAllRewardsPerWeekOld() {
    let result = '';
    if (farmsData.length > 1) {
      farmsData.forEach(function (item) {
        result +=
          formatWithCommas(item.rewardsPerWeek) +
          ' ' +
          toRealSymbol(item?.rewardToken?.symbol) +
          ' / ';
      });
      result = result.substring(0, result.lastIndexOf('/ '));
    } else {
      result =
        formatWithCommas(data.rewardsPerWeek) +
        ' ' +
        toRealSymbol(data?.rewardToken?.symbol);
    }
    return result;
  }

  function getAllRewardsPerWeek () {
    let result:string = ''
    farmsData.forEach(item => {
      const {rewardToken, rewardsPerWeek} = item;
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${rewardToken.icon}"/>
                          <label class="text-xs text-navHighLightText">${formatWithCommas(rewardsPerWeek)}</label>
                        </div>`
      result += itemHtml;
    });
    return result;
  }

  function getAllUnclaimedRewardOld() {
    let result = '';
    if (farmsData.length > 1) {
      farmsData.forEach(function (item) {
        result +=
          formatWithCommas(item.userUnclaimedReward) +
          ' ' +
          toRealSymbol(item?.rewardToken?.symbol) +
          ' / ';
      });
      result = result.substring(0, result.lastIndexOf('/ '));
    } else {
      result =
        formatWithCommas(data.userUnclaimedReward) +
        ' ' +
        toRealSymbol(data?.rewardToken?.symbol);
    }
    return result;
  }
  function getAllUnclaimedReward() {
    let result:string = ''
    farmsData.forEach(item => {
      const {rewardToken, userUnclaimedReward} = item;
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${rewardToken.icon}"/>
                          <label class="text-xs text-navHighLightText">${formatWithCommas(userUnclaimedReward)}</label>
                        </div>`
      result += itemHtml;
    });
    return result;
  }

  function getClaimId() {
    if (farmsData.length > 1) {
      return 'claim_all';
    } else {
      return 'claim';
    }
  }

  function haveUnclaimedReward() {
    let have: boolean = false;
    if (farmsData.length > 1) {
      for (let i = 0; i < farmsData.length; i++) {
        if (farmsData[i].userUnclaimedReward != '0') {
          have = true;
          break;
        }
      }
    } else {
      have = Number(data.userUnclaimedReward) > 0;
    }
    return have;
  }

  if (!tokens || tokens.length < 2 || farmsIsLoading) return <Loading />;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const images = tokens.map((token, index) => {
    const { icon, id } = token;
    if (icon)
      return (
        <img
          key={id}
          className={"h-11 w-11 rounded-full border border-gradientFromHover " + (index == 1 ? '-ml-1.5': '')}
          src={icon}
        />
      );
    return (
      <div
        key={id}
        className={"h-11 w-11 rounded-full bg-cardBg border border-gradientFromHover " + (index == 1 ? '-ml-1.5': '')}
      ></div>
    );
  });

  const symbols = tokens.map((token, index) => {
    const { symbol } = token;
    const hLine = index === 1 ? '' : '-';
    return `${toRealSymbol(symbol)}${hLine}`;
  });

  return (
    <Card
      width="w-full"
      className="self-start truncate"
      padding={'p-0'}
      rounded="rounded-2xl"
    >
      <div
        className='flex items-center p-6 pb-0 relative overflow-hidden flex-wrap'
      >
        <div className="flex items-center justify-center">
          <div className="h-11">
            <div className="w-22 flex items-center justify-between">
              {images}
            </div>
          </div>
        </div>
        <div className="flex flex-col pl-2">
          <div className="flex items-center">
            <div className="order-2 lg:ml-auto xl:m-0">
              <div>
                <a href={`/pool/${PoolId}`} className="text-lg xs:text-sm text-white">
                  {symbols}
                </a>
              </div>
            </div>
            <div className="pl-3 order-3 lg:ml-auto xl:m-0">
              {farmsData?.length > 1 ? <FarmMiningIcon w="20" h="18.4"/> : null}
            </div>
          </div>
          <Link title={intl.formatMessage({ id: 'view_pool' })} to={{pathname: `/pool/${PoolId}`,state: { backToFarms: true }}}>
            <span className="text-xs text-framBorder border border-framBorder rounded w-10 text-center box-content px-1" style={{zoom: 0.8}}><FormattedMessage id="detail_tip" defaultMessage="detail" /></span>
          </Link>
        </div>
        {ended ? (
          <div className="ended status-bar">
            <FormattedMessage id="ended" defaultMessage="ENDED" />
          </div>
        ) : null}
        {pending ? (
          <div className="pending status-bar">
            <FormattedMessage id="pending" defaultMessage="PENDING" />
          </div>
        ) : null}
      </div>
      <div className="info-list p-6 pt-0">
        <div className="text-center max-w-2xl">
          {error ? <Alert level="error" message={error.message} /> : null}
        </div>
        <div className="py-2">
          <div className="flex items-center justify-between text-sm py-2">
            <div className="text-sm text-farmText">
              <FormattedMessage
                id="total_staked"
                defaultMessage="Total staked"
              />
            </div>
            <div className="text-xl text-white">{`${
              data.totalStaked === 0
                ? '-'
                : `$${toInternationalCurrencySystem(
                    data.totalStaked.toString(),
                    2
                  )}`
            }`}</div>
          </div>
          <div className="flex items-center justify-between text-sm py-2">
            <div className="text-sm text-farmText">
              <FormattedMessage id="apr" defaultMessage="APR" />
            </div>
            <div
              className="text-xl text-white"
              data-type="info"
              data-place="top"
              data-multiline={true}
              data-tip={getAprList()}
              data-html={true}
              data-for={'aprId' + data.farm_id}
              data-class="reactTip"
            >
              {`${getTotalApr() === '0' ? '-' : `${getTotalApr()}%`}`}
              <ReactTooltip
                id={'aprId' + data.farm_id}
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
              />
            </div>
          </div>
          <div className="my-3.5 border border-t-0 border-farmSplitLine"></div>
          {data.userStaked !== '0' ? (
            <div className="flex items-center justify-between text-sm py-2 text-farmText">
              <div>
                <FormattedMessage
                  id="your_shares"
                  defaultMessage="Your Shares"
                />
              </div>
              <div className="text-white">{toPrecision(data.userStaked, 6)}</div>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-sm py-2 text-farmText">
            <div>
              <FormattedMessage
                id="reward_tokens"
                defaultMessage="Reward Tokens"
              />
            </div>
            <div className="flex" data-class="reactTip" data-for={"rewardTokens" + data.farm_id} data-place="top" data-html={true} data-tip={getRewardTokensSymbol()}>{getRewardTokensIcon()}</div>
            <ReactTooltip
              id={"rewardTokens" + data.farm_id}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
          <div className="flex items-center justify-between text-sm py-2 text-farmText">
            <div>
              <FormattedMessage
                id="rewards_per_week"
                defaultMessage="Rewards per week"
              />
            </div>
            <div className="text-white" data-class="reactTip" data-for={"rewardPerWeekId" + data.farm_id} data-place="top" data-html={true} data-tip={getAllRewardsPerWeek()}>-</div>
            <ReactTooltip
              id={"rewardPerWeekId" + data.farm_id}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
          <div className="flex items-center justify-between text-sm py-2 text-farmText">
            <div>
              <FormattedMessage
                id="unclaimed_rewards"
                defaultMessage="Unclaimed rewards"
              />
            </div>
            <div className="text-white" data-class="reactTip" data-for={"unclaimedRewardId" + data.farm_id} data-place="top" data-html={true} data-tip={getAllUnclaimedReward()}>-</div>
            <ReactTooltip
              id={"unclaimedRewardId" + data.farm_id}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
        <div>
          {wallet.isSignedIn() ? (
            <div className="flex gap-2 justify-center mt-4">
              {data.userStaked !== '0' ? (
                <BorderButton onClick={() => showUnstakeModal()} rounded="rounded-md" className="xs:px-3.5">
                  <div className="w-16 text-xs text-greenLight">
                    <FormattedMessage id="unstake" defaultMessage="Unstake" />
                  </div>
                </BorderButton>
              ) : null}
              <BorderButton onClick={() => showStakeModal()} disabled={ended} rounded="rounded-md" className="xs:px-3.5">
                <div className="w-16 text-xs text-greenLight">
                  <FormattedMessage id="stake" defaultMessage="Stake" />
                </div>
              </BorderButton>
              {haveUnclaimedReward() ? (
                <GreenButton
                  onClick={() => claimReward()}
                  disabled={disableClaim}
                  rounded="rounded-md"
                  className="xs:px-3.5"
                >
                  <div className="w-16 text-xs">
                    <ClipLoader
                      color={claimLoadingColor}
                      loading={claimLoading}
                      size={claimLoadingSize}
                    />
                    {claimLoading ? null : (
                      <div>
                        <FormattedMessage id={getClaimId()} />
                      </div>
                    )}
                  </div>
                </GreenButton>
              ) : null}
            </div>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </div>
      <div className="flex justify-center items-center h-8 bg-farmDark">
          {farmStarted() ? (
              <div className="text-farmText text-sm">
                {moment.unix(getStartTime()).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            ) : (
              <Countdown
                date={moment.unix(getStartTime()).valueOf()}
                renderer={renderer}
              />
            )}
            {showEndAt() ? (
              <>
                <label className="w-2.5 border border-t-0 border-greenLight h-0 mx-4"></label>
                <div className="text-farmText text-sm">
                  {moment.unix(getEndTime()).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </>
            ) : null}
      </div>
      <ActionModal
        isOpen={unstakeVisible}
        onRequestClose={() => setUnstakeVisible(false)}
        title={intl.formatMessage({ id: 'unstake' })}
        btnText={intl.formatMessage({ id: 'unstake' })}
        max={data.userStaked}
        onSubmit={(amount) => {
          unstake({
            seed_id: data.seed_id,
            amount,
          }).catch(setError);
        }}
        style={{
          content: {
            outline: 'none',
          },
        }}
      />

      <ActionModal
        isOpen={withdrawVisible}
        onRequestClose={() => setWithdrawVisible(false)}
        title={intl.formatMessage({ id: 'withdraw' })}
        btnText={intl.formatMessage({ id: 'withdraw' })}
        max={data.rewardNumber}
        onSubmit={(amount) => {
          withdrawReward({
            token_id: data.reward_token,
            amount,
            token: data.rewardToken,
          }).catch(setError);
        }}
        style={{
          content: {
            outline: 'none',
          },
        }}
      />

      <ActionModal
        isOpen={stakeVisible}
        onRequestClose={() => {
          setStakeVisible(false);
        }}
        title={intl.formatMessage({ id: 'stake' })}
        btnText={intl.formatMessage({ id: 'stake' })}
        max={stakeBalance}
        onSubmit={(amount) => {
          stake({ token_id: getMftTokenId(data.lpTokenId), amount }).catch(
            setError
          );
        }}
        style={{
          content: {
            outline: 'none',
          },
        }}
      />
    </Card>
  );
}

function ActionModal(
  props: ReactModal.Props & {
    title?: string;
    btnText?: string;
    max: string;
    onSubmit: (amount: string) => void;
  }
) {
  const { max } = props;
  const [amount, setAmount] = useState<string>('');
  const cardWidth = isMobile() ? '75vw' : '25vw';
  return (
    <Modal {...props}>
      <Card
        style={{ width: cardWidth }}
        className="outline-none border border-gradientFrom border-opacity-50"
      >
        <div className="flex justify-between items-start text-xl text-white font-semibold mb-7">
          <label>{props.title}</label>
          <div className="cursor-pointer" onClick={props.onRequestClose}><ModalClose/></div>
        </div>
        <div>
          <div className="flex justify-end mb-1.5">
            <span className="text-primaryText text-xs">
              <FormattedMessage id="balance" defaultMessage="Balance" />:
              {toPrecision(max, 6)}
            </span>
          </div>
          <div className="flex rounded relative overflow-hidden align-center">
            <OldInputAmount
              className="flex-grow"
              max={max}
              value={amount}
              disabled={Number(amount) >= Number(max)}
              onChangeAmount={setAmount}
            />
          </div>
        </div>
        <div className="flex items-center justify-center pt-5">
          <GreenLButton onClick={() => props.onSubmit(amount)} disabled={!amount || Number(amount) >= Number(max) }>
            {props.btnText}
          </GreenLButton>
        </div>
      </Card>
    </Modal>
  );
}
