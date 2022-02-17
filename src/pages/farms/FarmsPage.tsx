import React, { useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import TipsBox from '~components/farm/TipsBox';
import CalcModel, { CalcEle, LinkPool } from '~components/farm/CalcModel';
import UnClaim from '~components/farm/UnClaim';
import QuestionMark from '~components/farm/QuestionMark';
import SelectUi from '~components/farm/SelectUi';
import {
  FarmMiningIcon,
  ModalClose,
  Dots,
  Light,
  Calc,
  ArrowDownHollow,
  Checkbox,
  CheckboxSelected,
  CoinPropertyIcon,
  SortIcon,
  NoDataIcon,
} from '~components/icon';
import {
  GreenLButton,
  BorderButton,
  GradientButton,
  ButtonTextWrapper,
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
  classificationOfCoins,
  classificationOfCoins_key,
  incentiveLpTokenConfig,
} from '~services/farm';
import {
  stake,
  unstake,
  LP_TOKEN_DECIMALS,
  withdrawAllReward,
  LP_STABLE_TOKEN_DECIMALS,
} from '~services/m-token';
import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  percentLess,
  calculateFairShare,
  toNonDivisibleNumber,
  percent,
} from '~utils/numbers';
import { mftGetBalance } from '~services/mft-contract';
import { wallet } from '~services/near';
import Loading, { BeatLoading } from '~components/layout/Loading';
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
import getConfig from '~services/config';
const config = getConfig();
const STABLE_POOL_ID = config.STABLE_POOL_ID;
interface SearchData {
  status: number;
  sort: string;
  sortBoxHidden: boolean;
  coin: string;
}

export function FarmsPage() {
  const intl = useIntl();
  const sortList = {
    apr: intl.formatMessage({ id: 'apr' }),
    new: intl.formatMessage({ id: 'new' }),
    total_staked: intl.formatMessage({ id: 'total_staked' }),
  };
  const filterList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    filterList[key] = intl.formatMessage({ id: key });
  });
  const [unclaimedFarmsIsLoading, setUnclaimedFarmsIsLoading] = useState(false);
  const [farms, setFarms] = useState<FarmInfo[]>([]);
  const [error, setError] = useState<Error>();
  const [stakedList, setStakedList] = useState<Record<string, string>>({});
  const [rewardList, setRewardList] = useState<Record<string, string>>({});
  const [tokenPriceList, setTokenPriceList] = useState<any>();
  const [seeds, setSeeds] = useState<Record<string, string>>({});
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);

  const [tokenPriceMap, setTokenPriceMap] = useState<Record<string, string>>(
    {}
  );
  const [searchData, setSearchData] = useState<SearchData>({
    status: null,
    sort: 'apr',
    coin: 'all',
    sortBoxHidden: true,
  });
  const [yourFarms, setYourFarms] = useState<string | number>('-');
  const [yourReward, setYourReward] = useState<string | number>('-');
  const [lps, setLps] = useState<Record<string, FarmInfo[]>>({});
  const [checkedList, setCheckedList] = useState<Record<string, any>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [noData, setNoData] = useState(false);
  const rewardRef = useRef(null);

  const page = 1;
  const perPage = DEFAULT_PAGE_LIMIT;
  const withdrawNumber = 5;
  const refreshTime = 120000;
  const [count, setCount] = useState(0);
  const [commonSeedFarms, setCommonSeedFarms] = useState({});
  useEffect(() => {
    loadFarmInfoList().then();
  }, []);
  useEffect(() => {
    if (count > 0) {
      loadFarmInfoList(true);
    }
    const intervalId = setInterval(() => {
      setCount(count + 1);
    }, refreshTime);
    return () => {
      clearInterval(intervalId);
    };
  }, [count]);
  async function loadFarmInfoList(isUpload?: boolean) {
    if (isUpload) {
      setUnclaimedFarmsIsLoading(false);
    } else {
      setUnclaimedFarmsIsLoading(true);
    }
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
    const tokenPriceList: any = resolvedParams[2];
    const seeds: Record<string, string> = resolvedParams[3];

    Object.entries(resolvedParams[1]).forEach((item) => {
      const [key, v] = item;
      if (v !== '0') {
        rewardList[key] = v;
      }
    });
    const stakedList_being = Object.keys(stakedList).length > 0;
    searchData.status = wallet.isSignedIn()
      ? Number(
          localStorage.getItem('farm_filter_status') ||
            (stakedList_being ? '2' : '1')
        )
      : 1;
    setSearchData(searchData);
    setStakedList(stakedList);
    setRewardList(rewardList);
    setTokenPriceList(tokenPriceList);
    setSeeds(seeds);
    const composeFarms = (farms: FarmInfo[]) => {
      let tempMap = {};
      let tempFarms = [];
      let tempCommonSeedFarms = {};

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
      tempFarms = Object.keys(tempMap).map((key) => {
        const ele = tempMap[key];
        ele.key = key;
        return ele;
      });
      tempFarms.forEach((arr: any) => {
        const totalApr = getTotalApr(arr);
        arr.totalApr = totalApr;
      });

      tempFarms.forEach((farm) => {
        tempCommonSeedFarms[farm[0].seed_id] =
          tempCommonSeedFarms[farm[0].seed_id] || [];
        tempCommonSeedFarms[farm[0].seed_id].push(farm);
      });
      return [tempFarms, tempCommonSeedFarms];
    };

    const farms = await getFarms({
      page,
      perPage,
      stakedList,
      rewardList,
      tokenPriceList,
      seeds,
    });
    if (isSignedIn) {
      const tempMap = {};
      const mySeeds = new Set();
      farms.forEach((farm) => {
        const { seed_id, userStaked, rewardToken } = farm;
        tempMap[seed_id] = tempMap[seed_id] || [];
        tempMap[seed_id].push(farm);
        if (Number(userStaked) > 0) {
          mySeeds.add(seed_id);
        }
      });
      setLps(tempMap);
      if (mySeeds.size > 0) {
        setYourFarms(mySeeds.size.toString());
      }
    }
    setUnclaimedFarmsIsLoading(false);
    getTokenSinglePrice(farms, rewardList, tokenPriceList);
    const [mergeFarms, commonSeedFarms] = composeFarms(farms);
    searchByCondition(mergeFarms, commonSeedFarms);
  }
  async function getTokenSinglePrice(
    farms: any[],
    rewardList: Record<string, string>,
    tokenPriceList: Record<string, any>
  ) {
    const rewardTokenList: Record<string, any> = {};
    farms.forEach((item) => {
      const { rewardToken = {}, tokenIds = [] } = item;
      const { id } = rewardToken;
      if (id) {
        rewardTokenList[id] = rewardToken;
      }
    });
    const tempMap = {};
    Object.keys(tokenPriceList).forEach((key) => {
      tempMap[key] = tokenPriceList[key].price;
    });

    setTokenPriceMap(tempMap);
    let totalUnWithDraw = 0;
    Object.entries(rewardList).forEach((arr) => {
      const [key, v] = arr;
      const singlePrice = tempMap[key];
      const token = rewardTokenList[key];
      const number: any = toReadableNumber(token.decimals, v);
      if (singlePrice && singlePrice != 'N/A') {
        totalUnWithDraw = BigNumber.sum(
          singlePrice * number,
          totalUnWithDraw
        ).toNumber();
      }
    });
    if (totalUnWithDraw > 0) {
      let totalUnWithDrawV = toInternationalCurrencySystem(
        totalUnWithDraw.toString(),
        2
      );
      if (Number(totalUnWithDrawV) == 0) {
        totalUnWithDrawV = '<$0.01';
      } else {
        totalUnWithDrawV = `$${totalUnWithDrawV}`;
      }
      setYourReward(totalUnWithDrawV);
    }
  }
  function searchByCondition(list?: any, tempCommonSeedFarms?: any) {
    // TODO
    const { status, sort, coin } = searchData;
    let listAll = (list || farms).sort();
    let commonSeedFarmsNew = JSON.parse(
      JSON.stringify(tempCommonSeedFarms || commonSeedFarms)
    );
    let noData = true;
    listAll.forEach((item: any) => {
      const { userStaked, pool, seed_id, farm_id } = item[0];
      const isEnd = isEnded(item);
      const useStaked = Number(userStaked) > 0;
      const { token_symbols } = pool;
      let condition1,
        condition2 = false;
      if (+status == 2) {
        // 0:ended,1:live,2:my farms
        let total_userUnclaimedReward = 0;
        item.forEach((farm: any) => {
          total_userUnclaimedReward += Number(farm.userUnclaimedReward);
        });
        if (useStaked) {
          const commonSeedFarmList = commonSeedFarmsNew[seed_id] || [];
          if (
            isEnd &&
            !total_userUnclaimedReward &&
            commonSeedFarmList.length > 1
          ) {
            condition1 = false;
            for (let i = 0; i < commonSeedFarmList.length; i++) {
              if (commonSeedFarmList[i][0].farm_id == farm_id) {
                commonSeedFarmList.splice(i, 1);
                break;
              }
            }
          } else {
            condition1 = true;
          }
        }
      } else if (+status == 0) {
        condition1 = isEnd;
      } else if (+status == 1) {
        condition1 = !isEnd;
      }
      if (coin != 'all') {
        const satisfiedTokenList = classificationOfCoins[coin];
        for (let i = 0; i < token_symbols.length; i++) {
          if (satisfiedTokenList.indexOf(token_symbols[i]) > -1) {
            condition2 = true;
            break;
          }
        }
      } else {
        condition2 = true;
      }
      if (condition1 && condition2) {
        item.show = true;
        noData = false;
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
        return Number(item2.totalApr) - Number(item1.totalApr);
      });
    } else if (sort == 'total_staked') {
      listAll.sort((item1: any, item2: any) => {
        return Number(item2[0].totalStaked) - Number(item1[0].totalStaked);
      });
    }
    setFarms(listAll);
    setNoData(noData);
    setCommonSeedFarms(tempCommonSeedFarms || commonSeedFarms);
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
  function changeStatus(status: number) {
    searchData.status = status;
    localStorage.setItem('farm_filter_status', status.toString());
    setSearchData(Object.assign({}, searchData));
    searchByCondition();
  }
  async function doWithDraw() {
    setWithdrawLoading(true);
    withdrawAllReward(checkedList);
  }
  function valueOfRewardsTip() {
    const tip = intl.formatMessage({ id: 'farmRewardsCopy' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  function updateCheckList(status: boolean, data: any, index: number) {
    const checkedListEntries = Object.entries(checkedList);
    if (status && checkedListEntries.length == withdrawNumber) return;
    if (status) {
      checkedList[data[0]] = {
        value: data[1],
        index,
      };
    } else {
      delete checkedList[data[0]];
    }
    setCheckedList(Object.assign({}, checkedList));
    const rewardListStr = Object.keys(rewardList).slice(0, withdrawNumber);
    const compair = rewardListStr.every((item) => {
      return checkedList[item];
    });
    if (compair) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }
  function selectAllToken() {
    const surrentStatus = !selectAll;
    if (surrentStatus) {
      const selectedList = {};
      Object.entries(rewardList)
        .slice(0, withdrawNumber)
        .forEach((data, index) => {
          const [key, v] = data;
          selectedList[key] = {
            value: v,
            index,
          };
        });
      setCheckedList(selectedList);
    } else {
      setCheckedList({});
    }
    rewardRef.current.scrollTop = 0;
    setSelectAll(surrentStatus);
  }
  function valueOfWithDrawLimitTip() {
    const tip = intl.formatMessage({ id: 'over_tip' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  const changeSortOption = (option: any) => {
    const [id] = option;
    searchData.sort = id;
    setSearchData(Object.assign({}, searchData));
    searchByCondition();
  };
  const changeCoinOption = (option: any) => {
    const [id] = option;
    searchData.coin = id;
    setSearchData(Object.assign({}, searchData));
    searchByCondition();
  };
  return (
    <div className="xs:w-full md:w-full xs:mt-4 md:mt-4">
      <div className="w-1/3 xs:w-full md:w-full flex m-auto justify-center">
        {error ? <Alert level="warn" message={error.message} /> : null}
      </div>
      <div className="grid grid-cols-farmContainerOther 2xl:grid-cols-farmContainer grid-flow-col xs:grid-cols-1 xs:grid-flow-row md:grid-cols-1 md:grid-flow-row">
        <div className="text-white pl-12 xs:px-5 md:px-5">
          <div className="text-white text-3xl h-12">
            <FormattedMessage id="farms" defaultMessage="Farms" />
          </div>
          <div className="rounded-2xl bg-cardBg pt-5 pb-8 relative overflow-hidden">
            <div className="flex justify-between px-5 pb-12 relative">
              <div className="flex flex-col items-center">
                <div className="flex items-center text-white text-sm text-center mb-1.5">
                  <FormattedMessage id="value_rewards"></FormattedMessage>
                  <div
                    className="ml-2 text-sm"
                    data-type="info"
                    data-place="right"
                    data-multiline={true}
                    data-class="reactTip"
                    data-html={true}
                    data-tip={valueOfRewardsTip()}
                    data-for="yourRewardsId"
                  >
                    <QuestionMark />
                    <ReactTooltip
                      className="w-20"
                      id="yourRewardsId"
                      backgroundColor="#1D2932"
                      border
                      borderColor="#7e8a93"
                      effect="solid"
                    />
                  </div>
                </div>
                <label className="text-white text-2xl text-center font-semibold">
                  {yourReward}
                </label>
              </div>
              <div className="flex flex-col items-center">
                <label className="text-white text-sm text-center mb-1.5">
                  <FormattedMessage id="your_farms"></FormattedMessage>
                </label>
                <label className="text-white text-2xl text-center font-semibold">
                  {yourFarms}
                </label>
              </div>
              <Dots></Dots>
            </div>
            {Object.entries(rewardList).length > 0 ? (
              <>
                <div
                  className="pl-4 pr-5 pt-1.5 pb-7 max-h-96 overflow-auto"
                  ref={rewardRef}
                >
                  {Object.entries(rewardList).map((rewardToken: any, index) => (
                    <WithdrawView
                      key={index}
                      index={index}
                      data={rewardToken}
                      updateCheckList={updateCheckList}
                      checkedList={checkedList}
                      tokenPriceList={tokenPriceList}
                    />
                  ))}
                </div>
                <div className="flex flex-col pt-3">
                  <div className="flex items-center ml-4">
                    <label className="mr-3" onClick={selectAllToken}>
                      {selectAll ? (
                        <CheckboxSelected></CheckboxSelected>
                      ) : (
                        <Checkbox></Checkbox>
                      )}
                    </label>
                    {Object.keys(rewardList).length > withdrawNumber ? (
                      <div className="flex items-center">
                        <label className="mr-1">
                          <FormattedMessage id="all_5" />
                        </label>
                        <div
                          className="text-white text-right ml-1"
                          data-class="reactTip"
                          data-for="selectAllId"
                          data-place="top"
                          data-html={true}
                          data-tip={valueOfWithDrawLimitTip()}
                        >
                          <QuestionMark></QuestionMark>
                          <ReactTooltip
                            id="selectAllId"
                            backgroundColor="#1D2932"
                            border
                            borderColor="#7e8a93"
                            effect="solid"
                          />
                        </div>
                      </div>
                    ) : (
                      <FormattedMessage id="all" />
                    )}
                  </div>
                  <div className="flex justify-center items-center">
                    <GradientButton
                      color="#fff"
                      className={`w-36 h-9 text-center text-base text-white mt-4 focus:outline-none font-semibold ${
                        Object.keys(checkedList).length == 0 ? 'opacity-40' : ''
                      }`}
                      onClick={doWithDraw}
                      disabled={Object.keys(checkedList).length == 0}
                      btnClassName={
                        Object.keys(checkedList).length == 0
                          ? 'cursor-not-allowed'
                          : ''
                      }
                      loading={withdrawLoading}
                    >
                      <div>
                        <ButtonTextWrapper
                          loading={withdrawLoading}
                          Text={() => (
                            <FormattedMessage
                              id="withdraw"
                              defaultMessage="Withdraw"
                            />
                          )}
                        />
                      </div>
                    </GradientButton>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center text-center px-7 pt-8">
                <span className="text-xs text-primaryText">
                  <FormattedMessage id="no_token_tip"></FormattedMessage>
                </span>
                <span className="text-sm text-white mt-1.5">
                  <FormattedMessage id="getToken_tip"></FormattedMessage>
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col pl-5 pr-8 xs:px-5 md:px-5 xs:mt-8 md:mt-8">
          <div className="xs:w-full md:w-full">
            {unclaimedFarmsIsLoading ? null : (
              <div className="flex items-center justify-between xs:flex-col md:flex-col mb-3">
                <div className="flex items-center text-farmText rounded-full h-6 bg-farmSbg lg:mr-4">
                  <label
                    onClick={() => changeStatus(1)}
                    className={`flex justify-center w-28 xs:w-24 md:w-24 items-center rounded-full h-full text-sm cursor-pointer ${
                      +searchData.status == 1
                        ? 'text-chartBg bg-farmSearch'
                        : ''
                    }`}
                  >
                    <FormattedMessage id="live" defaultMessage="Live" />
                  </label>
                  <label
                    onClick={() => changeStatus(0)}
                    className={`flex justify-center w-28 xs:w-24 md:w-24 items-center rounded-full h-full text-sm cursor-pointer ${
                      searchData.status != null && +searchData.status == 0
                        ? 'text-chartBg bg-farmSearch'
                        : ''
                    }`}
                  >
                    <FormattedMessage
                      id="ended_search"
                      defaultMessage="Ended"
                    />
                  </label>
                  {wallet.isSignedIn() ? (
                    <label
                      onClick={() => changeStatus(2)}
                      className={`flex justify-center  w-28 xs:w-24 md:w-24 items-center rounded-full h-full text-sm cursor-pointer ${
                        +searchData.status == 2
                          ? 'text-chartBg bg-farmSearch'
                          : ''
                      }`}
                    >
                      <FormattedMessage
                        id="my_farms"
                        defaultMessage="My farms"
                      />
                    </label>
                  ) : null}
                </div>
                <div className="flex justify-between xs:w-full md:w-full xs:mt-4 md:mt-4">
                  <div className="flex items-center relative mr-4 xs:mr-0 md:mr-0">
                    <label className="text-farmText text-xs mr-2 whitespace-nowrap xs:hidden">
                      <FormattedMessage
                        id="filter_by"
                        defaultMessage="Filter by"
                      />
                    </label>
                    <SelectUi
                      id={searchData.coin}
                      list={filterList}
                      onChange={changeCoinOption}
                      className="w-36"
                      Icon={isMobile() ? CoinPropertyIcon : ''}
                    ></SelectUi>
                  </div>
                  <div className="flex items-center relative">
                    <label className="text-farmText text-xs mr-2 xs:hidden md:hidden">
                      <FormattedMessage id="sort_by" defaultMessage="Sort by" />
                    </label>
                    <SelectUi
                      id={searchData.sort}
                      list={sortList}
                      onChange={changeSortOption}
                      Icon={isMobile() ? SortIcon : ''}
                    ></SelectUi>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex-grow xs:flex-none">
            {noData ? (
              <div className="flex flex-col w-full justify-center items-center mt-32 xs:mt-8 md:mt-8">
                <NoDataIcon />
                <span className="text-farmText text-base mt-4 text-center w-48">
                  <FormattedMessage id="no_result"></FormattedMessage>
                </span>
              </div>
            ) : null}
            <div className="overflow-auto relative pb-4">
              {unclaimedFarmsIsLoading ? (
                <Loading />
              ) : (
                <div className="grid gap-4 grid-cols-2 2xl:grid-cols-3 xs:grid-cols-1 md:grid-cols-1">
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
    </div>
  );
}
function WithdrawView({
  data,
  tokenPriceList,
  updateCheckList,
  checkedList,
  index,
}: {
  data: any;
  tokenPriceList: any;
  updateCheckList: any;
  checkedList: any;
  index: number;
}) {
  const [token, setToken] = useState<TokenMetadata>();
  const [checkStatus, setCheckStatus] = useState(false);
  const [priceData, setPriceData] = useState<Record<string, any>>({});
  useEffect(() => {
    ftGetTokenMetadata(data[0]).then((token) => {
      setToken(token);
      const { id } = token;
      const price = tokenPriceList && tokenPriceList[id]?.price;
      let resultTotalPrice = '0';
      if (price) {
        const totalPrice = new BigNumber(price).multipliedBy(
          toReadableNumber(token.decimals, data[1])
        );
        if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
          resultTotalPrice = '<$0.01';
        } else {
          resultTotalPrice = `$${toInternationalCurrencySystem(
            totalPrice.toString(),
            2
          )}`;
        }
        let displayPrice;
        if (new BigNumber('0.01').isGreaterThan(price)) {
          displayPrice = '<$0.01';
        } else {
          displayPrice = `$${toInternationalCurrencySystem(
            price.toString(),
            2
          )}`;
        }
        setPriceData({
          price: displayPrice,
          totalPrice: resultTotalPrice,
        });
      }
    });
  }, [data]);
  useEffect(() => {
    setCheckStatus(!!checkedList[data[0]]);
  }, [Object.keys(checkedList)]);
  if (!token) return Loading();
  function changeStatus() {
    updateCheckList(!checkStatus, data, index);
  }
  function getTokenNumber() {
    const tokenNumber = toReadableNumber(token.decimals, data[1]);
    let resultDisplay = '';
    if (new BigNumber('0.001').isGreaterThan(tokenNumber)) {
      resultDisplay = '<0.001';
    } else {
      resultDisplay = formatWithCommas(
        new BigNumber(tokenNumber).toFixed(3, 1).toString()
      );
    }
    return resultDisplay;
  }
  return (
    <div key={data.farm_id}>
      <div className="flex justify-between py-3.5">
        <div className="flex items-center text-sm text-white">
          <div className="mr-3" onClick={changeStatus}>
            {checkStatus ? (
              <CheckboxSelected></CheckboxSelected>
            ) : (
              <Checkbox></Checkbox>
            )}
          </div>
          <img src={token.icon} className="w-8 h-8 rounded-full mr-2" />
          <div className="flex flex-col">
            <label className="text-sm text-white">
              {toRealSymbol(token.symbol)}
            </label>
            <label className="text-primaryText text-xs">
              {priceData.price || '$-'}
            </label>
          </div>
        </div>
        <div className="flex flex-col text-right">
          <label className="text-sm text-white">{getTokenNumber()}</label>
          <label className="text-primaryText text-xs">
            {priceData.totalPrice || '$-'}
          </label>
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
  const [unclaimed, setUnclaimed] = useState<Record<any, any>>({});
  const [calcVisible, setCalcVisible] = useState(false);

  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
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
  const mergeCommonRewardFarms = mergeCommonRewardFarmsFun(farmsData);
  function mergeCommonRewardFarmsFun(farmsData: FarmInfo[]) {
    const arr = JSON.parse(JSON.stringify(farmsData));
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
          target.apr = BigNumber.sum(target.apr, commonReward.apr).valueOf();
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
    return arr;
  }
  function getAllRewardsPerWeek() {
    let result: string = '';
    let totalPrice = 0;
    mergeCommonRewardFarms.forEach((item: FarmInfo) => {
      const { rewardToken, rewardsPerWeek } = item;
      const { id, icon } = rewardToken;
      let price = 0;
      if (tokenPriceMap[id] && tokenPriceMap[id] != 'N/A') {
        price = +rewardsPerWeek * +tokenPriceMap[id];
        totalPrice += price;
      }
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${icon}"/>
                          <label class="text-xs text-navHighLightText">${formatWithCommas(
                            rewardsPerWeek
                          )}</label>
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
    const rewardsList: any[] = [];
    mergeCommonRewardFarms.forEach((item: FarmInfo) => {
      const { rewardToken, userUnclaimedReward } = item;
      const { id, icon } = rewardToken;
      let price = 0;
      if (tokenPriceMap[id] && tokenPriceMap[id] != 'N/A') {
        price = +userUnclaimedReward * +tokenPriceMap[id];
        totalPrice += price;
      }
      // quantity display
      let displayNum;
      if (
        !userUnclaimedReward ||
        new BigNumber('0').isEqualTo(userUnclaimedReward)
      ) {
        displayNum = '-';
      } else if (new BigNumber('0.001').isGreaterThan(userUnclaimedReward)) {
        displayNum = '<0.001';
      } else {
        displayNum = new BigNumber(userUnclaimedReward).toFixed(3, 1);
      }
      rewardsList.push({
        icon,
        userUnclaimedReward: displayNum,
      });
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${icon}"/>
                          <label class="text-xs text-navHighLightText">${formatWithCommas(
                            displayNum
                          )}</label>
                        </div>`;
      result += itemHtml;
    });
    // price display
    let resultPrice;
    if (totalPrice == 0) {
      resultPrice = '-';
    } else if (new BigNumber('0.01').isGreaterThan(totalPrice)) {
      resultPrice = '<$0.01';
    } else {
      resultPrice = `$${toInternationalCurrencySystem(
        totalPrice.toString(),
        2
      )}`;
    }
    setUnclaimed({
      tip: result,
      totalPrice: resultPrice,
      rewardsList,
    });
  }
  async function showUnstakeModal() {
    setUnstakeVisible(true);
  }

  async function showStakeModal() {
    const { lpTokenId } = data;
    const b = await mftGetBalance(getMftTokenId(lpTokenId));
    if (STABLE_POOL_ID == lpTokenId) {
      setStakeBalance(toReadableNumber(LP_STABLE_TOKEN_DECIMALS, b));
    } else {
      setStakeBalance(toReadableNumber(LP_TOKEN_DECIMALS, b));
    }
    setStakeVisible(true);
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
  function getRewardTokensSymbol() {
    let result: string = '';
    mergeCommonRewardFarms.forEach((item: FarmInfo) => {
      const { rewardToken } = item;
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${rewardToken.icon}"/>
                          <label class="text-xs text-navHighLightText">${rewardToken?.symbol}</label>
                        </div>`;
      result += itemHtml;
    });
    return result;
  }
  function getRewardTokensIcon() {
    let icons: any[] = [];
    mergeCommonRewardFarms.forEach(function (item: FarmInfo) {
      const { farm_id, rewardToken } = item;
      const icon = (
        <img
          key={farm_id}
          className="h-5 w-5 ml-1.5 my-px rounded-full"
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
  function getAprList() {
    let result: string = '';
    mergeCommonRewardFarms.forEach((item: FarmInfo) => {
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
    tokens.forEach((token: any) => {
      const { id, decimals } = token;
      const tokenNum = toReadableNumber(decimals, minimumAmounts[id]);
      const itemHtml = `<div class="flex justify-between items-center h-8">
                          <image class="w-5 h-5 rounded-full mr-7" src="${
                            token.icon
                          }"/>
                          <label class="text-xs text-navHighLightText">${toInternationalCurrencySystem(
                            tokenNum,
                            3
                          )}</label>
                        </div>`;
      result += itemHtml;
    });
    let percentage = '(-%)';
    if (farmData.userStaked) {
      const userStaked = toNonDivisibleNumber(24, farmData.userStaked);
      const percentV = percent(userStaked, farmData.seedAmount);
      if (new BigNumber(0.001).isGreaterThan(percentV)) {
        percentage = '(<0.001%)';
      } else {
        percentage = `(${toPrecision(percentV.toString(), 2)}%)`;
      }
    }

    return { tip: result, percentage };
  }
  if (!tokens || tokens.length < 2 || farmsIsLoading) return <Loading />;
  const yourShare = calculateNumByShare(farmData, tokens);
  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return 0;
  });
  const images = tokens.map((token, index) => {
    const { icon, id } = token;
    if (icon)
      return (
        <img
          key={id + index}
          className={
            'h-11 w-11 rounded-full border border-gradientFromHover ' +
            (index != 0 ? '-ml-1.5' : '')
          }
          src={icon}
        />
      );
    return (
      <div
        key={id + index}
        className={
          'h-11 w-11 rounded-full bg-cardBg border border-gradientFromHover ' +
          (index == 1 ? '-ml-1.5' : '')
        }
      />
    );
  });
  const symbols = tokens.map((token, index) => {
    const { symbol } = token;
    const hLine = index === tokens.length - 1 ? '' : '-';
    return `${toRealSymbol(symbol)}${hLine}`;
  });
  function valueOfRewardsTip() {
    const tip = intl.formatMessage({ id: 'farmRewardsCopy' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  function showCalcModel() {
    setCalcVisible(true);
  }
  return (
    <Card
      width="w-full"
      className={`self-start relative overflow-hidden ${
        ended ? 'farmEnded' : ''
      }`}
      padding={'p-0'}
      rounded="rounded-2xl"
      style={{ height: '28.5rem' }}
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
                  to={
                    PoolId == STABLE_POOL_ID
                      ? {
                          pathname: '/stableswap',
                          state: { backToFarms: true },
                        }
                      : {
                          pathname: `/pool/${PoolId}`,
                          state: { backToFarms: true },
                        }
                  }
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
            to={
              PoolId == STABLE_POOL_ID
                ? { pathname: '/stableswap', state: { backToFarms: true } }
                : { pathname: `/pool/${PoolId}`, state: { backToFarms: true } }
            }
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
        ) : incentiveLpTokenConfig[farmData.pool.id] ? (
          <div className="incentive status-bar">
            x{incentiveLpTokenConfig[farmData.pool.id]}
          </div>
        ) : pending ? (
          <div className="pending status-bar">
            <FormattedMessage id="pending" defaultMessage="PENDING" />
          </div>
        ) : null}
      </div>
      <div className="info-list p-6 pt-0">
        <div className="text-center max-w-2xl">
          {error ? <Alert level="warn" message={error.message} /> : null}
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
            <div className="flex items-center text-sm text-farmText">
              <FormattedMessage id="apr" defaultMessage="APR" />
              <div className="ml-1.5 cursor-pointer" onClick={showCalcModel}>
                <Calc></Calc>
              </div>
            </div>
            <div>
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
              className="flex flex-wrap justify-end"
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
            <div className="flex items-center pr-1">
              <FormattedMessage
                id="rewards_per_week"
                defaultMessage="Rewards per week"
              />
              <div
                className="text-white text-right ml-1"
                data-class="reactTip"
                data-for={'rewardPerWeekQId' + data.farm_id}
                data-place="top"
                data-html={true}
                data-tip={valueOfRewardsTip()}
              >
                <QuestionMark></QuestionMark>
                <ReactTooltip
                  id={'rewardPerWeekQId' + data.farm_id}
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                />
              </div>
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
            <div className="flex items-center pr-1">
              <FormattedMessage
                id="unclaimed_rewards"
                defaultMessage="Unclaimed rewards"
              />
              <div
                className="text-white text-right ml-1"
                data-class="reactTip"
                data-for={'unclaimedRewardQId' + data.farm_id}
                data-place="top"
                data-html={true}
                data-tip={valueOfRewardsTip()}
              >
                <QuestionMark></QuestionMark>
                <ReactTooltip
                  id={'unclaimedRewardQId' + data.farm_id}
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                />
              </div>
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
        <div className="absolute inset-x-6 bottom-12">
          {wallet.isSignedIn() ? (
            <div className="flex gap-2 justify-center mt-4">
              {data.userStaked !== '0' ? (
                <BorderButton
                  onClick={() => showUnstakeModal()}
                  rounded="rounded-md"
                  px="px-0"
                  py="py-1"
                  className="flex-grow  w-20 text-base text-greenColor"
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
                  className="flex-grow  w-20 text-base text-greenColor"
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
                  loading={claimLoading}
                >
                  <div>
                    <ButtonTextWrapper
                      loading={claimLoading}
                      Text={() => <FormattedMessage id={getClaimId()} />}
                    />
                  </div>
                </GradientButton>
              ) : null}
            </div>
          ) : (
            <ConnectToNearBtn />
          )}
        </div>
      </div>
      <div className="flex justify-center items-center h-8 bg-farmDark absolute w-full bottom-0">
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
        farms={farmsData}
        lps={lps}
        unclaimed={unclaimed}
        type="unstake"
        onSubmit={(amount) => {
          setButtonLoading(true);
          unstake({
            seed_id: data.seed_id,
            amount,
            poolId: farmData.lpTokenId,
          }).catch(setError);
        }}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            transform: 'translate(-50%, -50%)',
          },
        }}
        buttonLoading={buttonLoading}
      />

      <CalcModel
        isOpen={calcVisible}
        onRequestClose={() => {
          setCalcVisible(false);
        }}
        farms={mergeCommonRewardFarms}
        tokenPriceList={tokenPriceList}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            transform: 'translate(-50%, -50%)',
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
        farm={farmData}
        farms={farmsData}
        lps={lps}
        type="stake"
        tokenPriceList={tokenPriceList}
        mergeCommonRewardFarms={mergeCommonRewardFarms}
        onSubmit={(amount) => {
          setButtonLoading(true);
          stake({
            token_id: getMftTokenId(data.lpTokenId),
            amount,
            poolId: farmData.lpTokenId,
          }).catch(setError);
        }}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            transform: 'translate(-50%, -50%)',
          },
        }}
        buttonLoading={buttonLoading}
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
    farms?: FarmInfo[];
    lps?: Record<string, FarmInfo[]>;
    type?: string;
    unclaimed?: any;
    tokenPriceList?: any;
    buttonLoading?: boolean;
    mergeCommonRewardFarms?: FarmInfo[];
    onSubmit: (amount: string) => void;
  }
) {
  const {
    max,
    farm,
    farms,
    lps,
    type,
    unclaimed,
    tokenPriceList,
    buttonLoading,
    mergeCommonRewardFarms,
  } = props;
  const [amount, setAmount] = useState<string>('');
  const [showTip, setShowTip] = useState<boolean>(false);
  const [showCalc, setShowCalc] = useState(false);
  const cardWidth = isMobile() ? '90vw' : '30vw';
  const tokens = useTokens(farm?.tokenIds) || [];
  const [displayTokenData, setDisplayTokenData] = useState<Record<string, any>>(
    {}
  );
  const [stakeCheck, setStakeCheck] = useState(false);
  const intl = useIntl();
  const maxToFormat = new BigNumber(max);
  useEffect(() => {
    if (type == 'unstake') {
      // unstake situation
      const { seed_id } = farm;
      const farms = lps[seed_id];
      if (
        farms &&
        farms.length > 1 &&
        !isEnded(farms) &&
        farm.farm_status == 'Ended'
      ) {
        setShowTip(true);
      }
    }
    if (!props.isOpen) {
      setShowCalc(false);
      setAmount('');
    }
  }, [props.isOpen]);
  useEffect(() => {
    let imgs: any = [];
    let symbols: any = [];
    tokens.forEach(({ icon, id, symbol }, index) => {
      imgs.push(
        <img
          src={icon}
          key={id + index}
          className={
            'w-10 h-10 xs:w-9 md:w-9 xs:h-9 md:h-9 rounded-full border border-gradientFromHover ' +
            (index != 0 ? '-ml-1.5' : '')
          }
        />
      );
      symbols.push(symbol);
    });
    setDisplayTokenData({
      imgs,
      symbols: symbols.join('-'),
    });
  }, [tokens.length > 0 && tokens]);
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
            className="w-32 h-8 text-sm text-greenColor mx-2"
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
  function showCalcWrap() {
    setShowCalc(!showCalc);
  }
  function stakeCheckFun(amount: string) {
    if (type == 'stake') {
      const LIMITAOMUNT = '1000000000000000000';
      let value;
      if (STABLE_POOL_ID == farm.lpTokenId) {
        value = toNonDivisibleNumber(LP_STABLE_TOKEN_DECIMALS, amount);
      } else {
        value = toNonDivisibleNumber(LP_TOKEN_DECIMALS, amount);
      }
      if (new BigNumber(value).isLessThan(LIMITAOMUNT) && amount) {
        setStakeCheck(true);
      } else {
        setStakeCheck(false);
      }
    }
    setAmount(amount);
  }
  return (
    <Modal {...props}>
      {showTip ? (
        <Tip />
      ) : (
        <div>
          {Number(farm?.userUnclaimedReward) !== 0 ? (
            <TipsBox style={{ width: cardWidth }} />
          ) : null}
          <Card
            style={{ width: cardWidth, maxHeight: '95vh' }}
            className="outline-none border border-gradientFrom border-opacity-50 overflow-auto xs:p-4 md:p-4"
          >
            <div className="flex justify-between items-start text-xl text-white font-semibold mb-4">
              <label>{props.title}</label>
              <div className="cursor-pointer" onClick={props.onRequestClose}>
                <ModalClose />
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {displayTokenData.imgs}
                <label className="ml-3 text-base text-white">
                  {/* {displayTokenData.symbols}{' '} */}
                  <FormattedMessage id="my_shares"></FormattedMessage>
                </label>
              </div>
              <label className="text-base text-white">
                {toPrecision(max, 6)}
              </label>
            </div>
            <div>
              <div className="flex rounded relative overflow-hidden align-center">
                <OldInputAmount
                  className="flex-grow"
                  max={max}
                  value={amount}
                  onChangeAmount={stakeCheckFun}
                />
              </div>
            </div>
            {type == 'stake' ? (
              <>
                <div className="mt-4">
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className="flex items-center justify-center mb-2 cursor-pointer"
                      onClick={showCalcWrap}
                    >
                      <Calc></Calc>
                      <label className="text-sm text-white ml-3 mr-4  cursor-pointer">
                        <FormattedMessage id="calculate_roi"></FormattedMessage>
                      </label>
                      <label
                        className={
                          'cursor-pointer ' +
                          (showCalc ? 'transform rotate-180' : '')
                        }
                      >
                        <ArrowDownHollow></ArrowDownHollow>
                      </label>
                    </div>
                    <div
                      className={'w-full ' + (showCalc ? 'block' : 'hidden')}
                    >
                      <CalcEle
                        farms={mergeCommonRewardFarms}
                        lpTokenNum={amount}
                        tokenPriceList={tokenPriceList}
                      ></CalcEle>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <UnClaim unclaimed={unclaimed}></UnClaim>
            )}
            {type == 'stake' ? (
              <div className="flex justify-center mt-2">
                {stakeCheck ? (
                  <Alert
                    level="warn"
                    message={
                      STABLE_POOL_ID == farm.lpTokenId
                        ? intl.formatMessage({ id: 'more_than_stable_seed' })
                        : intl.formatMessage({ id: 'more_than_general_seed' })
                    }
                  />
                ) : null}
              </div>
            ) : null}
            <div className="flex items-center justify-center pt-3">
              <GreenLButton
                onClick={() => {
                  props.onSubmit(amount);
                }}
                disabled={
                  !amount ||
                  new BigNumber(amount).isEqualTo(0) ||
                  new BigNumber(amount).isGreaterThan(maxToFormat) ||
                  stakeCheck
                }
                loading={buttonLoading}
              >
                {buttonLoading ? <BeatLoading /> : props.btnText}
              </GreenLButton>
            </div>
            {type == 'stake' ? (
              <div className="mt-3">
                <LinkPool
                  pooId={farms && farms[0] && farms[0].pool.id}
                ></LinkPool>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </Modal>
  );
}
