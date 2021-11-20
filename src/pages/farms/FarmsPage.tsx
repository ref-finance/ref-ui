import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import {
  FarmMiningIcon,
  ModalClose,
  ArrowDown,
  Dots,
  Light,
} from '~components/icon';
import {
  GreenLButton,
  BorderButton,
  WithdrawButton,
  GradientButton,
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
  getAllSinglePriceByTokenIds,
  claimAndWithDrawReward,
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
  percentLess,
  calculateFairShare,
  toNonDivisibleNumber,
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
import { BigNumber } from 'bignumber.js';
interface SearchData {
  status: boolean;
  staked: boolean;
  sort: string;
  sortBoxHidden: boolean;
}

export function FarmsPage() {
  const intl = useIntl();
  const sortList = {
    new: intl.formatMessage({ id: 'new' }),
    apr: intl.formatMessage({ id: 'apr' }),
    total_staked: intl.formatMessage({ id: 'total_staked' }),
  };
  const [unclaimedFarmsIsLoading, setUnclaimedFarmsIsLoading] = useState(false);
  const [farms, setFarms] = useState<FarmInfo[]>([]);
  const [error, setError] = useState<Error>();
  const [stakedList, setStakedList] = useState<Record<string, string>>({});
  const [rewardList, setRewardList] = useState<Record<string, string>>({});
  const [tokenPriceList, setTokenPriceList] = useState<any>();
  const [seeds, setSeeds] = useState<Record<string, string>>({});

  const [tokenPriceMap, setTokenPriceMap] = useState<Record<string, string>>(
    {}
  );
  const [searchData, setSearchData] = useState<SearchData>({
    status: true,
    staked: false,
    sort: 'new',
    sortBoxHidden: true,
  });
  const [yourFarms, setYourFarms] = useState<string | number>('-');
  const [yourReward, setYourReward] = useState<string | number>('-');
  const [lps, setLps] = useState<Record<string, FarmInfo[]>>({});

  const sortRef = useRef(null);
  const sortBoxRef = useRef(null);

  const { hash } = useLocation();
  const pool_id = hash.slice(1);
  const page = 1;
  const perPage = DEFAULT_PAGE_LIMIT;

  useEffect(() => {
    loadFarmInfoList().then();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const poolDom = document.getElementById(pool_id);
      if (poolDom) {
        poolDom.scrollIntoView();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [unclaimedFarmsIsLoading]);
  useEffect(() => {
    document.addEventListener('click', handleClick, false);
    return () => {
      document.removeEventListener('click', handleClick, false);
    };
  }, [searchData]);

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
        // .sort()
        // .reverse()
        .map((key) => {
          const ele = tempMap[key];
          ele.key = key;
          return ele;
        });
      // tempFarms.sort(function (a, b) {
      //   return b.length - a.length;
      // });
      tempFarms.forEach((arr: any) => {
        const totalApr = getTotalApr(arr);
        arr.totalApr = new BigNumber(totalApr);
        const tempMap = {};
        arr.forEach((m: any) => {
          tempMap[m.rewardToken?.id] = tempMap[m.rewardToken?.id] || [];
          tempMap[m.rewardToken?.id].push(m);
        });
        arr.splice(0, arr.length);
        Object.keys(tempMap).forEach((m: any) => {
          const commonRewardArr = tempMap[m];
          if (commonRewardArr.length > 1) {
            const target = commonRewardArr[0];
            for (let i = 1; i < commonRewardArr.length; i++) {
              const commonReward = commonRewardArr[i];
              target.apr = BigNumber.sum(
                target.apr,
                commonReward.apr
              ).valueOf();
              target.rewardsPerWeek = BigNumber.sum(
                target.rewardsPerWeek,
                commonReward.rewardsPerWeek
              ).valueOf();
              target.userUnclaimedReward = BigNumber.sum(
                target.userUnclaimedReward,
                commonReward.userUnclaimedReward
              ).valueOf();
            }
            tempMap[m] = [target];
          }
          arr.push(tempMap[m][0]);
        });
      });
      return tempFarms;
    };

    const farms = await getFarms({
      page,
      perPage,
      stakedList,
      rewardList,
      tokenPriceList,
      seeds,
    });
    const tempUnClaimRewardMap = {};
    if (isSignedIn) {
      const tempMap = {};
      const mySeeds = new Set();
      farms.forEach((farm) => {
        const { seed_id, userStaked, userUnclaimedReward, rewardToken } = farm;
        tempMap[seed_id] = tempMap[seed_id] || [];
        tempMap[seed_id].push(farm);
        if (Number(userStaked) > 0) {
          mySeeds.add(seed_id);
        }
        if (Number(userUnclaimedReward) > 0) {
          const { id } = rewardToken;
          tempUnClaimRewardMap[id] = BigNumber.sum(
            tempUnClaimRewardMap[id] || 0,
            userUnclaimedReward
          ).toNumber();
        }
      });
      setLps(tempMap);
      if (mySeeds.size > 0) {
        setYourFarms(mySeeds.size.toString());
      }
    }
    setUnclaimedFarmsIsLoading(false);
    await getTokenSinglePrice(farms, tempUnClaimRewardMap);
    const mergeFarms = composeFarms(farms);
    searchByCondition(mergeFarms);
  }
  async function getTokenSinglePrice(farms: any[], map: Record<string, any>) {
    const tokenIdList: string[] = [];
    farms.forEach((item) => {
      const rewardToken = item.rewardToken?.id || '';
      const tokenIds = item.tokenIds || [];
      tokenIdList.push(...tokenIds);
      if (rewardToken) {
        tokenIdList.push(rewardToken);
      }
    });
    const arr: any[] = Array.from(new Set(tokenIdList));
    const paramStr = arr.join('|');
    const priceList = await getAllSinglePriceByTokenIds(paramStr);
    const tempMap = {};
    priceList.forEach((item: string, index: number) => {
      tempMap[arr[index]] = item;
    });
    setTokenPriceMap(tempMap);
    let totalUnClaim = 0;
    Object.keys(map).forEach((item) => {
      if (tempMap[item] && tempMap[item] != 'N/A') {
        totalUnClaim = BigNumber.sum(
          tempMap[item] * map[item],
          totalUnClaim
        ).toNumber();
      }
    });
    if (totalUnClaim > 0) {
      setYourReward(
        `$${toInternationalCurrencySystem(totalUnClaim.toString(), 2)}`
      );
    }
  }
  const handleClick = (e: any) => {
    if (
      !sortRef.current.contains(e.target) &&
      !sortBoxRef.current.contains(e.target)
    ) {
      searchData.sortBoxHidden = true;
      setSearchData(Object.assign({}, searchData));
    }
  };
  function searchByCondition(list?: any) {
    const { status, staked, sort } = searchData;
    let listAll = list || farms;
    listAll.forEach((item: any) => {
      const isEnd = isEnded(item);
      const useStaked = Number(item[0].userStaked) > 0;
      const condition1 = status == !isEnd;
      let condition2 = true;
      if (staked) {
        condition2 = useStaked;
      }
      if (condition1 && condition2) {
        item.show = true;
      } else {
        item.show = false;
      }
    });
    if (sort == 'new') {
      const tempMap = {};
      const keyList: any[] = [];
      listAll.forEach((m: any) => {
        tempMap[m.key] = m;
        keyList.push(m.key);
      });
      listAll = keyList
        .sort()
        .reverse()
        .map((key) => tempMap[key]);
      listAll.sort(function (a: any, b: any) {
        return b.length - a.length;
      });
    }
    if (sort == 'apr') {
      listAll.sort((item1: any, item2: any) => {
        if (item1.totalApr.isGreaterThan(item2.totalApr)) {
          return -1;
        } else {
          return 1;
        }
      });
    } else if (sort == 'total_staked') {
      listAll.sort((item1: any, item2: any) => {
        const big1 = new BigNumber(item1[0].totalStaked);
        const big2 = new BigNumber(item2[0].totalStaked);
        if (big1.isGreaterThan(big2)) {
          return -1;
        } else {
          return 1;
        }
      });
    }
    setFarms(listAll);
  }
  function getTotalApr(farmsData: FarmInfo[]) {
    let apr = 0;
    if (farmsData.length > 1) {
      farmsData.forEach(function (item) {
        apr += Number(item.apr);
      });
    } else {
      apr = Number(farmsData[0].apr);
    }
    return toPrecision(apr.toString(), 2);
  }
  function isEnded(farmsData: FarmInfo[]) {
    let ended: boolean = true;
    for (let i = 0; i < farmsData.length; i++) {
      if (farmsData[i].farm_status != 'Ended') {
        ended = false;
        break;
      }
    }
    return ended;
  }
  function showSortBox() {
    searchData.sortBoxHidden = !searchData.sortBoxHidden;
    setSearchData(Object.assign({}, searchData));
  }
  function changeSortV(e: any) {
    searchData.sortBoxHidden = !searchData.sortBoxHidden;
    searchData.sort = e.target.dataset.id;
    setSearchData(Object.assign({}, searchData));
    searchByCondition();
  }
  function changeStatus(status: number) {
    searchData.status = !!status;
    setSearchData(Object.assign({}, searchData));
    searchByCondition();
  }
  function changeStaked() {
    searchData.staked = !searchData.staked;
    setSearchData(Object.assign({}, searchData));
    searchByCondition();
  }
  return (
    <div className="w-4/6 xs:w-full md:w-full mx-auto xs:mt-4 md:mt-4">
      <div className="w-1/3 xs:w-full md:w-full flex m-auto justify-center">
        {error ? <Alert level="error" message={error.message} /> : null}
      </div>

      <div className="flex flex-col px-5 -mt-12 xs:mt-8 md:mt-8">
        <div className="grid grid-cols-farmSearch gap-4 gap-y-5 mt-8 xs:mt-0 md:mt-0 relative xs:w-full md:w-full xs:grid md:grid xs:grid-cols-1 md:grid-cols-1">
          <div className="text-white text-3xl absolute top-0 left-0 xs:-top-12 md:-top-12">
            <FormattedMessage id="farms" defaultMessage="Farms" />
          </div>
          {unclaimedFarmsIsLoading ? null : (
            <div className="flex items-center self-end">
              <div className="flex items-center w-36 xs:w-32 md:w-32 text-farmText rounded-full h-7 bg-farmSbg mr-4">
                <label
                  onClick={() => changeStatus(1)}
                  className={`flex justify-center items-center w-1/2 rounded-full h-full cursor-pointer ${
                    searchData.status ? 'text-chartBg bg-farmSearch' : ''
                  }`}
                >
                  <FormattedMessage id="live" defaultMessage="Live" />
                </label>
                <label
                  onClick={() => changeStatus(0)}
                  className={`flex justify-center items-center w-1/2 rounded-full h-full cursor-pointer ${
                    !searchData.status ? 'text-chartBg bg-farmSearch' : ''
                  }`}
                >
                  <FormattedMessage id="ended_search" defaultMessage="Ended" />
                </label>
              </div>
              {wallet.isSignedIn() ? (
                <div className="flex items-center mr-4">
                  <label className="text-farmText text-sm">
                    <FormattedMessage
                      id="staked_only"
                      defaultMessage="Staked Only"
                    />
                  </label>
                  <div
                    onClick={changeStaked}
                    className={`flex items-center w-11 h-7 bg-cardBg rounded-full px-1  ml-2.5 box-border cursor-pointer ${
                      searchData.staked ? 'justify-end' : ''
                    }`}
                  >
                    <a
                      className={`h-5 w-5 rounded-full ${
                        searchData.staked ? 'bg-farmSearch' : 'bg-farmRound'
                      }`}
                    ></a>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center relative">
                <label className="text-farmText text-sm mr-2.5 xs:hidden md:hidden">
                  <FormattedMessage id="sort_by" defaultMessage="Sort by" />
                </label>
                <span
                  ref={sortRef}
                  onClick={showSortBox}
                  className="flex items-center justify-between w-32 h-7 xs:w-8 md:w-8 rounded-full px-3 box-border border border-farmText cursor-pointer text-sm text-gray-200"
                >
                  <label className="whitespace-nowrap xs:hidden md:hidden">
                    {sortList[searchData.sort]}
                  </label>
                  <ArrowDown></ArrowDown>
                </span>
                <div
                  ref={sortBoxRef}
                  className={`absolute z-50 top-8 left-14 xs:left-auto xs:right-0 md:left-auto md:right-0 w-36 border border-farmText bg-cardBg rounded-md ${
                    searchData.sortBoxHidden ? 'hidden' : ''
                  }`}
                >
                  {Object.entries(sortList).map((item) => (
                    <p
                      key={item[0]}
                      onClick={changeSortV}
                      data-id={item[0]}
                      className={`flex items-center p-4 text-sm h-7 text-white text-opacity-40 my-2 cursor-pointer hover:bg-white hover:bg-opacity-10 hover:text-opacity-100 ${
                        item[0] == searchData.sort
                          ? 'bg-white bg-opacity-10 text-opacity-100'
                          : ''
                      }`}
                    >
                      {item[1]}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* 
          <div className="text-whiteOpacity85 text-xs py-4 p-7 xs:text-center">
            <FormattedMessage
              id="stake_your_liquidity_provider_LP_tokens"
              defaultMessage="Stake your Liquidity Provider (LP) tokens"
            />
            !
          </div> */}
          {
            unclaimedFarmsIsLoading ? (
              <Loading />
            ) : (
              <div className="flex items-center relative overflow-hidden justify-between bg-farmTopRight text-whiteOpacity85 rounded-lg px-6 py-5 xs:row-start-1 xs:row-end-2 md:row-start-1 md:row-end-2">
                <Dots></Dots>
                <div className="flex flex-col items-center">
                  <p className="text-white text-sm mb-1.5">
                    <FormattedMessage
                      id="your_farms_rewards"
                      defaultMessage="Your Farms Rewards"
                    />
                  </p>
                  <label className="text-white text-2xl font-semibold whitespace-nowrap">
                    {yourReward}
                  </label>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-white text-sm mb-1.5">
                    <FormattedMessage
                      id="your_farms"
                      defaultMessage="Your Farms"
                    />
                  </p>
                  <label className="text-white text-2xl font-semibold whitespace-nowrap">
                    {yourFarms}
                  </label>
                </div>
              </div>
            )
            // (
            //   <div className="bg-greenOpacity100 text-whiteOpacity85 rounded-xl p-7">
            //     <div className="text-xl flex">
            //       <div className="float-left">
            //         <FormattedMessage
            //           id="your_rewards"
            //           defaultMessage="Your Rewards"
            //         />
            //       </div>
            //       <div
            //         className="float-left mt-2 ml-2 text-sm"
            //         data-type="dark"
            //         data-place="right"
            //         data-multiline={true}
            //         data-tip={parse(
            //           intl.formatMessage({ id: 'farmRewardsCopy' })
            //         )}
            //         data-for="yourRewardsId"
            //       >
            //         <FaRegQuestionCircle />
            //       </div>
            //       <ReactTooltip
            //         id="yourRewardsId"
            //         className="text-xs shadow-4xl"
            //         backgroundColor="#1D2932"
            //         border
            //         borderColor="#7e8a93"
            //         effect="solid"
            //         class="tool-tip"
            //         textColor="#c6d1da"
            //       />
            //     </div>
            //     <div className="text-xs pt-2">
            //       {Object.entries(rewardList).map((rewardToken: any, index) => (
            //         <WithdrawView key={index} data={rewardToken} />
            //       ))}
            //     </div>
            //   </div>
            // )
          }
        </div>
        <div className="flex-grow xs:flex-none">
          <div className="overflow-auto relative mt-8 pb-4">
            {unclaimedFarmsIsLoading ? (
              <Loading />
            ) : (
              <div className="grid grid-cols-2 gap-4 2xl:grid-cols-3 xs:grid-cols-1 md:grid-cols-1">
                {farms.map((farm: any) => (
                  <div
                    key={farm[0].farm_id}
                    id={`${farm[0].pool.id}`}
                    className={farm.show ? '' : 'hidden'}
                  >
                    <FarmView
                      farmsData={farm}
                      farmData={farm[0]}
                      stakedList={stakedList}
                      rewardList={rewardList}
                      tokenPriceList={tokenPriceList}
                      seeds={seeds}
                      tokenPriceMap={tokenPriceMap}
                      lps={lps}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
  tokenPriceMap,
  lps,
}: {
  farmsData: FarmInfo[];
  farmData: FarmInfo;
  stakedList: Record<string, string>;
  rewardList: Record<string, string>;
  tokenPriceList: any;
  seeds: Record<string, string>;
  tokenPriceMap: Record<string | number, string | number>;
  lps: Record<string, FarmInfo[]>;
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
  const [rewardsPerWeek, setRewardsPerWeek] = useState<
    Record<string | number, string | number>
  >({});
  const [unclaimed, setUnclaimed] = useState<
    Record<string | number, string | number>
  >({});
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
    getAllRewardsPerWeek();
    getAllUnclaimedReward();
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

  function getAllRewardsPerWeek() {
    let result: string = '';
    let totalPrice = 0;
    farmsData.forEach((item) => {
      const { rewardToken, rewardsPerWeek } = item;
      const { id, icon } = rewardToken;
      let price = 0;
      if (tokenPriceMap[id] && tokenPriceMap[id] != 'N/A') {
        price = +rewardsPerWeek * +tokenPriceMap[id];
        totalPrice += price;
      }
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${icon}"/>
                          <label class="text-xs text-navHighLightText">${
                            price == 0
                              ? '-'
                              : `$${toInternationalCurrencySystem(
                                  price.toString(),
                                  2
                                )}`
                          }</label>
                        </div>`;
      result += itemHtml;
    });
    setRewardsPerWeek({
      tip: result,
      totalPrice: `${
        totalPrice == 0
          ? '-'
          : `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`
      }`,
    });
  }
  function getAllUnclaimedReward() {
    let result: string = '';
    let totalPrice = 0;
    farmsData.forEach((item) => {
      const { rewardToken, userUnclaimedReward } = item;
      const { id, icon } = rewardToken;
      let price = 0;
      if (tokenPriceMap[id] && tokenPriceMap[id] != 'N/A') {
        price = +userUnclaimedReward * +tokenPriceMap[id];
        totalPrice += price;
      }
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${icon}"/>
                          <label class="text-xs text-navHighLightText">${
                            price == 0
                              ? '-'
                              : `$${toInternationalCurrencySystem(
                                  price.toString(),
                                  2
                                )}`
                          }</label>
                        </div>`;
      result += itemHtml;
    });
    setUnclaimed({
      tip: result,
      totalPrice: `${
        totalPrice == 0
          ? '-'
          : `$${toInternationalCurrencySystem(totalPrice.toString(), 2)}`
      }`,
    });
  }
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
    claimAndWithDrawReward(farmsData);
    // if (farmsData.length > 1) {
    //   claimRewardBySeed(data.seed_id)
    //     .then(() => {
    //       window.location.reload();
    //     })
    //     .catch((error) => {
    //       setDisableClaim(false);
    //       setError(error);
    //     });
    // } else {
    //   claimRewardByFarm(data.farm_id)
    //     .then(() => {
    //       window.location.reload();
    //     })
    //     .catch((error) => {
    //       setDisableClaim(false);
    //       setError(error);
    //     });
    // }
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
    let result: string = '';
    farmsData.forEach((item) => {
      const { rewardToken } = item;
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${rewardToken.icon}"/>
                          <label class="text-xs text-navHighLightText">${rewardToken?.symbol}</label>
                        </div>`;
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
    let icons: any[] = [];
    farmsData.forEach(function (item) {
      const { farm_id, rewardToken } = item;
      const icon = (
        <img
          key={farm_id}
          className="h-5 w-5 ml-1.5 rounded-full"
          src={rewardToken?.icon}
        />
      );
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
    let result: string = '';
    farmsData.forEach((item) => {
      const { rewardToken, apr } = item;
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${
                            rewardToken.icon
                          }"/>
                          <label class="text-xs text-navHighLightText">${
                            formatWithCommas(apr) + '%'
                          }</label>
                        </div>`;
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

  function getAllUnclaimedRewardOld() {
    const result: JSX.Element[] = [];
    farmsData.forEach(function (item, index) {
      const rewardV = item.userUnclaimedReward;
      const elem = (
        <label
          key={item.farm_id + item.rewardToken.id}
          style={{ color: Number(rewardV) > 0 ? '#fff' : '' }}
        >
          {formatWithCommas(rewardV)} {toRealSymbol(item?.rewardToken?.symbol)}{' '}
          {index == farmsData.length - 1 ? '' : '/ '}
        </label>
      );
      result.push(elem);
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
  function calculateNumByShare(farmData: FarmInfo, tokens: any) {
    if (Number(farmData.userStaked) <= 0) return {};
    const shares = toNonDivisibleNumber(24, farmData.userStaked);
    const slippageTolerance = 0;
    const { shares_total_supply, amounts, token_account_ids } = farmData.pool;
    const minimumAmounts = amounts.reduce((acc, totalSupply, index) => {
      acc[token_account_ids[index]] = toPrecision(
        percentLess(
          slippageTolerance,
          calculateFairShare({
            shareOf: totalSupply,
            contribution: shares,
            totalContribution: shares_total_supply,
          })
        ),
        0
      );
      return acc;
    }, {});
    let result: string = '';
    let totalPrice: number = 0;
    tokens.forEach((token: any) => {
      const { id, icon, decimals } = token;
      const tokenNum = toReadableNumber(decimals, minimumAmounts[id]);
      const singlePrice = tokenPriceMap[id];
      if (singlePrice && singlePrice != 'N/A') {
        totalPrice += new BigNumber(tokenNum)
          .multipliedBy(singlePrice)
          .toNumber();
      }
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${
                            token.icon
                          }"/>
                          <label class="text-xs text-navHighLightText">${toInternationalCurrencySystem(
                            tokenNum
                          )}</label>
                        </div>`;
      result += itemHtml;
    });
    let percentage = '(-%)';
    if (totalPrice) {
      const percent = Math.min((totalPrice / farmData.totalStaked) * 100, 100);
      percentage = `(${toPrecision(percent.toString(), 2)}%)`;
    }
    return { tip: result, percentage };
  }
  if (!tokens || tokens.length < 2 || farmsIsLoading) return <Loading />;
  const yourShare = calculateNumByShare(farmData, tokens);
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
          className={
            'h-11 w-11 rounded-full border border-gradientFromHover ' +
            (index == 1 ? '-ml-1.5' : '')
          }
          src={icon}
        />
      );
    return (
      <div
        key={id}
        className={
          'h-11 w-11 rounded-full bg-cardBg border border-gradientFromHover ' +
          (index == 1 ? '-ml-1.5' : '')
        }
      />
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
      className={`self-start overflow-hidden ${ended ? 'farmEnded' : ''}`}
      padding={'p-0'}
      rounded="rounded-2xl"
    >
      <div className="flex items-center p-6 pb-0 relative flex-wrap">
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
                <Link
                  to={{
                    pathname: `/pool/${PoolId}`,
                    state: { backToFarms: true },
                  }}
                  target="_blank"
                  className="text-lg xs:text-sm text-white"
                >
                  {symbols}
                </Link>
              </div>
            </div>
            <div className="pl-3 order-3 lg:ml-auto xl:m-0">
              {farmsData?.length > 1 ? (
                <FarmMiningIcon w="20" h="18.4" />
              ) : null}
            </div>
          </div>
          <Link
            title={intl.formatMessage({ id: 'view_pool' })}
            to={{ pathname: `/pool/${PoolId}`, state: { backToFarms: true } }}
            target="_blank"
          >
            <span
              className="text-xs text-framBorder border border-framBorder rounded w-10 text-center box-content px-1"
              style={{ zoom: 0.8 }}
            >
              <FormattedMessage id="detail_tip" defaultMessage="detail" />
            </span>
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
          <div className="my-3.5 border border-t-0 border-farmSplitLine" />
          <div className="flex items-center justify-between text-sm py-2 text-farmText">
            <div>
              <FormattedMessage
                id="reward_tokens"
                defaultMessage="Reward Tokens"
              />
            </div>
            <div
              className="flex"
              data-class="reactTip"
              data-for={'rewardTokens' + data.farm_id}
              data-place="top"
              data-html={true}
              data-tip={getRewardTokensSymbol()}
            >
              {getRewardTokensIcon()}
            </div>
            <ReactTooltip
              id={'rewardTokens' + data.farm_id}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
          <div className="flex items-center justify-between text-sm py-2 text-farmText">
            <div className="pr-1">
              <FormattedMessage
                id="rewards_per_week"
                defaultMessage="Rewards per week"
              />
            </div>
            <div
              className="text-white text-right"
              data-class="reactTip"
              data-for={'rewardPerWeekId' + data.farm_id}
              data-place="top"
              data-html={true}
              data-tip={rewardsPerWeek.tip}
            >
              {rewardsPerWeek.totalPrice}
            </div>
            <ReactTooltip
              id={'rewardPerWeekId' + data.farm_id}
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
          {data.userStaked !== '0' ? (
            <div className="flex items-center justify-between text-sm py-2 text-farmText">
              <div>
                <FormattedMessage
                  id="your_shares"
                  defaultMessage="Your Shares"
                />
              </div>
              <div
                className="text-white"
                data-class="reactTip"
                data-for={'yourShareId' + data.farm_id}
                data-place="top"
                data-html={true}
                data-tip={yourShare.tip}
              >
                {toPrecision(data.userStaked, 6)} {yourShare.percentage}
              </div>
              <ReactTooltip
                id={'yourShareId' + data.farm_id}
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between text-sm py-2 text-farmText">
            <div className="pr-1">
              <FormattedMessage
                id="unclaimed_rewards"
                defaultMessage="Unclaimed rewards"
              />
            </div>
            <div
              className="text-white text-right"
              data-class="reactTip"
              data-for={'unclaimedRewardId' + data.farm_id}
              data-place="top"
              data-html={true}
              data-tip={unclaimed.tip}
            >
              {unclaimed.totalPrice}
            </div>
            <ReactTooltip
              id={'unclaimedRewardId' + data.farm_id}
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
                <BorderButton
                  onClick={() => showUnstakeModal()}
                  rounded="rounded-md"
                  px="px-0"
                  py="py-1"
                  className="flex-grow  w-20 text-base text-greenLight"
                >
                  <FormattedMessage id="unstake" defaultMessage="Unstake" />
                </BorderButton>
              ) : null}
              {ended ? null : data.userStaked !== '0' ? (
                <BorderButton
                  onClick={() => showStakeModal()}
                  rounded="rounded-md"
                  px="px-0"
                  py="py-1"
                  className="flex-grow  w-20 text-base text-greenLight"
                >
                  <FormattedMessage id="stake" defaultMessage="Stake" />
                </BorderButton>
              ) : (
                <GradientButton
                  color="#fff"
                  className={`w-full h-10 text-center text-base text-white mt-4 focus:outline-none font-semibold `}
                  onClick={() => showStakeModal()}
                >
                  <FormattedMessage id="stake" defaultMessage="Stake" />
                </GradientButton>
              )}
              {haveUnclaimedReward() ? (
                <GradientButton
                  color="#fff"
                  onClick={() => claimReward()}
                  disabled={disableClaim}
                  className="text-white text-base flex-grow  w-20"
                >
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
                </GradientButton>
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
            <label className="w-2.5 border border-t-0 border-greenLight h-0 mx-4" />
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
        farm={farmData}
        lps={lps}
        onSubmit={(amount) => {
          unstake({
            seed_id: data.seed_id,
            amount,
          }).catch(setError);
        }}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
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
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
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
    farm?: FarmInfo;
    lps?: Record<string, FarmInfo[]>;
    onSubmit: (amount: string) => void;
  }
) {
  const { max, farm, lps } = props;
  const [amount, setAmount] = useState<string>('');
  const [showTip, setShowTip] = useState<boolean>(false);
  const cardWidth = isMobile() ? '90vw' : '30vw';
  const maxToFormat = new BigNumber(max);
  useEffect(() => {
    if (farm) {
      // unstake situation
      const { seed_id } = farm;
      const farms = lps[seed_id];
      if (farms && farms.length > 1 && !isEnded(farms)) {
        setShowTip(true);
      }
    }
  }, [props.isOpen]);
  function isEnded(farmsData: FarmInfo[]) {
    let ended: boolean = true;
    for (let i = 0; i < farmsData.length; i++) {
      if (farmsData[i].farm_status != 'Ended') {
        ended = false;
        break;
      }
    }
    return ended;
  }
  function Tip() {
    return (
      <div className="flex flex-col items-center text-center w-2/3 xs:w-full md:w-full">
        <Light />
        <p className="text-base text-white mb-2.5 mt-8">
          <FormattedMessage id="unstake_tip_t"></FormattedMessage>
        </p>
        <p className="text-2xl text-white leading-relaxed">
          <FormattedMessage id="unstake_tip_m"></FormattedMessage>
        </p>
        <p className="text-base text-white mb-6 mt-5">
          <FormattedMessage id="unstake_tip_b"></FormattedMessage>
        </p>
        <div className="flex items-center">
          <BorderButton
            onClick={props.onRequestClose}
            rounded="rounded-md"
            px="px-0"
            py="py-1"
            className="w-32 h-8 text-sm text-greenLight mx-2"
          >
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </BorderButton>
          <GradientButton
            color="#fff"
            className="w-32 h-8 text-center text-sm text-white focus:outline-none font-semibold mx-2"
            onClick={() => setShowTip(false)}
          >
            <FormattedMessage id="unstake" defaultMessage="Unstake" />
          </GradientButton>
        </div>
      </div>
    );
  }
  return (
    <Modal {...props}>
      {showTip ? (
        <Tip />
      ) : (
        <Card
          style={{ width: cardWidth }}
          className="outline-none border border-gradientFrom border-opacity-50"
        >
          <div className="flex justify-between items-start text-xl text-white font-semibold mb-7">
            <label>{props.title}</label>
            <div className="cursor-pointer" onClick={props.onRequestClose}>
              <ModalClose />
            </div>
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
                onChangeAmount={setAmount}
              />
            </div>
          </div>
          <div className="flex items-center justify-center pt-5">
            <GreenLButton
              onClick={() => props.onSubmit(amount)}
              disabled={
                !amount ||
                new BigNumber(amount).isEqualTo(0) ||
                new BigNumber(amount).isGreaterThan(maxToFormat)
              }
            >
              {props.btnText}
            </GreenLButton>
          </div>
        </Card>
      )}
    </Modal>
  );
}
