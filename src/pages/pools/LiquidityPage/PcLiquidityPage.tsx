import { canFarm, Pool } from 'src/services/pool';
import { PoolInfo } from 'src/services/swapV3';
import { WatchList } from 'src/store/RefDatabase';
import {
  classificationOfCoins,
  classificationOfCoins_key,
  FarmBoost,
  Seed,
} from 'src/services/farm';
import { FormattedMessage, useIntl } from 'react-intl';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useAllPoolsV2 } from 'src/state/swapV3';
import Big from 'big.js';
import {
  calculateFeePercent,
  scientificNotationToString,
  toInternationalCurrencySystem,
  toPrecision,
} from 'src/utils/numbers';
import {
  useRainbowWhitelistTokens,
  useTokenBalances,
  useTokens,
} from 'src/state/token';
import { WalletContext } from 'src/utils/wallets-integration';
import {
  get_pool_name,
  isPending,
  openUrl,
  sort_tokens_by_base,
} from 'src/services/commonV3';
import { getVEPoolId } from 'src/pages/ReferendumPage';
import { REF_META_DATA, TokenMetadata } from 'src/services/ft-contract';
import { unwrapedNear } from 'src/services/wrap-near';
import _, { find } from 'lodash';
import { PoolTabV3 } from 'src/components/pool/PoolTabV3';
import getConfig from 'src/services/config';
import { Card } from 'src/components/card/Card';
import {
  StartPoolIcon,
  WatchListStartFull,
} from 'src/components/icon/WatchListStar';
import { Images, Symbols } from 'src/components/stableswap/CommonComp';
import {
  CheckedEmpty,
  CheckedTick,
  DownArrowLight,
  FarmStampNew,
  PoolDaoBanner,
  UpArrowDeep,
  UpArrowLight,
} from 'src/components/icon';
import { VEARROW } from 'src/components/icon/Referendum';
import { AiFillStar } from 'src/components/reactIcons';
import {
  PoolIdNotExist,
  SelectUi,
} from 'src/pages/pools/LiquidityPage/LiquidityPageComponents/LiquidityPageComponents';
import { SearchIcon } from 'src/components/icon/FarmBoost';
import { SolidButton } from 'src/components/button/Button';
import ReactTooltip from 'react-tooltip';
import LiquidityPoolsTable from 'src/pages/pools/LiquidityPage/LiquidityPoolsTable';
import StablePoolList from 'src/pages/pools/LiquidityPage/LiquidityPageComponents/StablePoolList';
import { AddPoolModal } from 'src/pages/pools/AddPoolPage';
import {
  getPoolFeeAprTitle,
  getPoolListV2FarmAprTip,
} from 'src/pages/pools/LiquidityPage/LiquidityPage';
import { REF_POOL_ID_SEARCHING_KEY } from 'src/pages/pools/LiquidityPage/constLiquidityPage';
import Loading from 'src/components/layout/Loading';
import PoolRow from 'src/pages/pools/LiquidityPage/PoolRow';
import { useHistory } from 'react-router';
import { useDCLTopBinFee } from 'src/state/pool';
import { formatPercentage } from 'src/components/d3Chart/utils';
import BigNumber from 'bignumber.js';

function PcLiquidityPage({
  pools,
  sortBy,
  tokenName,
  order,
  hasMore,
  watchPools,
  onSearch,
  onHide,
  hideLowTVL,
  onSortChange,
  onOrderChange,
  nextPage,
  allPools,
  poolTokenMetas,
  poolsMorePoolsIds,
  farmCounts,
  farmOnly,
  setFarmOnly,
  volumes,
  activeTab,
  switchActiveTab,
  watchV2Pools,
  watchList,
  h24VolumeV2,
  do_farms_v2_poos,
  farmAprById,
  poolsData,
  poolsScrollRef,
  selectCoinClass,
  setSelectCoinClass,
}: {
  pools: Pool[];
  switchActiveTab: (tab: string) => void;
  activeTab: string;
  poolTokenMetas: any;
  sortBy: string;
  hideLowTVL: Boolean;
  watchPools: Pool[];
  tokenName: string;
  order: string;
  onHide: (mode: Boolean) => void;
  allPools: number;
  h24VolumeV2: string;
  farmAprById: Record<string, number>;
  farmOnly: boolean;
  setFarmOnly: (farmOnly: boolean) => void;
  hasMore: boolean;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
  poolsMorePoolsIds: Record<string, string[]>;
  farmCounts: Record<string, number>;
  volumes: Record<string, string>;
  watchV2Pools: PoolInfo[];
  watchList: WatchList[];
  do_farms_v2_poos: Record<string, Seed>;
  poolsData?: any;
  poolsScrollRef?: any;
  selectCoinClass?: any;
  setSelectCoinClass?: any;
}) {
  const intl = useIntl();
  const inputRef = useRef(null);

  let allPoolsV2 = useAllPoolsV2();

  const [tvlV2, setTvlV2] = useState<string>();

  useEffect(() => {
    setShowPoolIDTip(false);
  }, [activeTab]);

  useEffect(() => {
    if (
      typeof allPoolsV2 === 'undefined' ||
      allPoolsV2.length === 0 ||
      allPoolsV2.every((p) => !p?.tvl)
    )
      return;

    const tvl = allPoolsV2.reduce(
      (a, b) => new Big(a || '0').plus(new Big(b.tvl || '0')),
      new Big(0)
    );

    setTvlV2(scientificNotationToString(tvl.toString()));
  }, [allPoolsV2]);
  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.value = tokenName;
    }
  }, [tokenName, inputRef?.current]);

  const selectTokens = useRainbowWhitelistTokens();

  const selectBalances = useTokenBalances();

  const filterList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    filterList[key] = intl.formatMessage({ id: key });
  });
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const [supportFarmStar, setSupportFarmStar] = useState<Boolean>(false);
  const [farmCountStar, setFarmCountStar] = useState<number>(1);

  const [showAddPoolModal, setShowAddPoolModal] = useState<boolean>(false);

  const [reSortBy, setReSortBy] = useState<string>('');

  const [v2SortBy, setV2SortBy] = useState<string>('tvl');

  const [v2Order, setV2Order] = useState<string>('desc');
  const [symbolsArr] = useState(['e', 'E', '+', '-', '.']);
  const [enableIdSearch, setEnableIdSearch] = useState<boolean>(
    !!sessionStorage.getItem(REF_POOL_ID_SEARCHING_KEY) || false
  );

  const handleEnableIdSearching = () => {
    if (enableIdSearch) {
      sessionStorage.removeItem(REF_POOL_ID_SEARCHING_KEY);
    } else {
      sessionStorage.setItem(REF_POOL_ID_SEARCHING_KEY, '1');
    }

    setEnableIdSearch(!enableIdSearch);
    inputRef.current.value = '';
    onSearch('');
    setShowPoolIDTip(false);
  };

  const [showPoolIDTip, setShowPoolIDTip] = useState<boolean>(false);

  const handleIdSearching = (id: string) => {
    if (Number(id) >= allPools) {
      setShowPoolIDTip(true);
    } else if (id && id.length > 0 && !id.includes('.')) {
      openUrl(`/pool/${id}`);
    }
  };

  useEffect(() => {
    canFarm(getVEPoolId()).then(({ count }) => {
      setSupportFarmStar(!!count);
      setFarmCountStar(count);
    });
  }, []);

  const tokensStar = [REF_META_DATA, unwrapedNear];
  const poolReSortingFunc = (p1: Pool, p2: Pool) => {
    const v1 = volumes[p1.id] ? parseFloat(volumes[p1.id]) : 0;

    const v2 = volumes[p2.id] ? parseFloat(volumes[p2.id]) : 0;

    const apr1 =
      getPoolFeeAprTitle(v1.toString(), p1) + (farmAprById?.[p1.id] || 0) * 100;

    const apr2 =
      getPoolFeeAprTitle(v2.toString(), p2) + (farmAprById?.[p2.id] || 0) * 100;

    if (order === 'desc') {
      if (reSortBy === 'volume') {
        return v2 - v1;
      } else if (reSortBy === 'apr') {
        return apr2 - apr1;
      }
    } else if (order === 'asc') {
      if (reSortBy === 'volume') {
        return v1 - v2;
      } else if (reSortBy === 'apr') {
        return apr1 - apr2;
      }
    }
  };

  const poolv2ReSortingFunc = (p1: PoolInfo, p2: PoolInfo) => {
    const f1 = p1.fee;

    const f2 = p2.fee;

    const tvl1 = p1.tvl;

    const tvl2 = p2.tvl;

    const v1 = volumes[p1.pool_id] ? parseFloat(volumes[p1.pool_id]) : 0;

    const v2 = volumes[p2.pool_id] ? parseFloat(volumes[p2.pool_id]) : 0;

    const top_bin_apr1 = p1.top_bin_apr;
    const top_bin_apr2 = p2.top_bin_apr;
    if (v2Order === 'desc') {
      if (v2SortBy === 'tvl') {
        return tvl2 - tvl1;
      } else if (v2SortBy === 'fee') {
        return f2 - f1;
      } else if (v2SortBy === 'volume_24h') {
        return v2 - v1;
      } else if (v2SortBy === 'top_bin_apr') {
        return Number(top_bin_apr2) - Number(top_bin_apr1);
      }
    } else if (v2Order === 'asc') {
      if (v2SortBy === 'tvl') {
        return tvl1 - tvl2;
      } else if (v2SortBy === 'fee') {
        return f1 - f2;
      } else if (v2SortBy === 'volume_24h') {
        return v1 - v2;
      } else if (v2SortBy === 'top_bin_apr') {
        return Number(top_bin_apr1) - Number(top_bin_apr2);
      }
    }
  };

  const [searchFocus, setSearchFocus] = useState(false);

  const poolv2FilterFunc = (p: PoolInfo) => {
    return (
      _.includes(
        p.token_x_metadata.symbol.toLowerCase(),
        tokenName.toLowerCase()
      ) ||
      _.includes(
        p.token_y_metadata.symbol.toLowerCase(),
        tokenName.toLowerCase()
      )
    );
  };

  const poolFilterFunc = (p: Pool) => {
    if (selectCoinClass === 'all') return true;
    poolsScrollRef?.current?.scroll({
      top: 0,
      behavior: 'auto',
    });
    return poolTokenMetas?.[p.id]?.some((tk: TokenMetadata) =>
      classificationOfCoins[selectCoinClass].includes(tk.symbol)
    );
  };

  if (activeTab === 'v2' && !allPoolsV2) return <Loading />;
  const totalWatchList_length = watchPools?.length + watchV2Pools?.length;
  return (
    <>
      <PoolTabV3></PoolTabV3>
      <div className="flex flex-col whitespace-nowrap w-1000px m-auto ">
        {/* start pool card */}
        {!!getConfig().REF_VE_CONTRACT_ID ? (
          <div className={` mt-5 mb-3`}>
            <Card
              className="mt-2  relative flex items-center "
              width="w-full"
              bgcolor="bg-starPoolBg "
              padding="px-0 "
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openUrl(`/pool/${getVEPoolId()}`);
              }}
            >
              <div className="absolute left-3 top-0 ">
                <StartPoolIcon />
              </div>
              <div className="w-full cursor-pointer flex items-center px-8 py-3 hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Images tokens={tokensStar} size="8" className="mr-7" />
                    <Symbols
                      tokens={tokensStar}
                      separator="-"
                      fontSize="text-sm"
                    ></Symbols>
                  </div>
                </div>

                {supportFarmStar && <FarmStampNew multi={farmCountStar > 1} />}
              </div>
              <div className="absolute flex items-center right-0 bottom-0">
                <button
                  className="text-white hover:text-gradientFrom text-sm z-30 relative top-6 right-0 flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openUrl('/referendum');
                  }}
                >
                  <span className="text-white">
                    <FormattedMessage
                      id="more_than_a_simple_pool"
                      defaultMessage={'More than a simple pool'}
                    />
                  </span>

                  <button className=" ml-1.5">
                    <VEARROW />
                  </button>
                </button>
                <PoolDaoBanner />
              </div>
            </Card>
          </div>
        ) : null}

        <div className={`flex items-center justify-between mb-4 ${'mt-5'} `}>
          <div className=" flex text-base items-center rounded-xl p-1">
            <div className="bg-cardBg p-1 h-10 flex items-center rounded-xl">
              <button
                className={` h-full  hover:bg-viewPoolHoverBgColor border-primaryText px-4 flex items-center justify-center ${
                  activeTab === 'v2' ? 'text-white' : 'text-primaryText'
                } `}
                style={{
                  background:
                    activeTab === 'v2'
                      ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                      : null,
                  borderRadius: '10px',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  switchActiveTab('v2');
                }}
              >
                <FormattedMessage id="dcl_pools" defaultMessage={'DCL Pools'} />
              </button>
              {activeTab === 'v1' || activeTab === 'v2' ? null : (
                <div
                  className="w-px h-6"
                  style={{
                    background: '#566069',
                  }}
                ></div>
              )}

              <button
                className={` h-full flex  hover:bg-viewPoolHoverBgColor  px-4 items-center justify-center ${
                  activeTab === 'v1' ? 'text-white' : 'text-primaryText'
                } `}
                style={{
                  background:
                    activeTab === 'v1'
                      ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                      : null,
                  borderRadius: '10px',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  switchActiveTab('v1');
                }}
              >
                <FormattedMessage id="classic_pools"></FormattedMessage>
              </button>
            </div>

            <button
              className={`ml-2.5 h-10 px-4  hover:bg-viewPoolHoverBgColor bg-cardBg flex items-center justify-center ${
                activeTab === 'stable' ? 'text-white' : 'text-primaryText'
              } `}
              style={{
                background:
                  activeTab === 'stable'
                    ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                    : null,
                borderRadius: '10px',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchActiveTab('stable');
              }}
            >
              <FormattedMessage
                id="stable_pools"
                defaultMessage={'Stable Pools'}
              />
            </button>

            <button
              className={`ml-2.5 h-10 px-4  hover:bg-viewPoolHoverBgColor bg-cardBg flex items-center justify-center ${
                activeTab === 'watchlist' ? 'text-white' : 'text-primaryText'
              } `}
              style={{
                background:
                  activeTab === 'watchlist'
                    ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                    : null,
                borderRadius: '10px',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchActiveTab('watchlist');
              }}
            >
              {activeTab === 'watchlist' ? (
                <AiFillStar fill="white" />
              ) : (
                <AiFillStar fill="#91A2AE" />
              )}
              <FormattedMessage id="watchlist" defaultMessage={'Watchlist'} />
              {totalWatchList_length > 0 ? ` (${totalWatchList_length})` : ''}
            </button>
          </div>

          <div className="flex items-center justify-end relative ">
            <div
              className={`relative rounded-xl border w-full my-2 text-white  flex items-center pr-2 `}
              style={{
                background: 'rgba(34, 46, 56, 0.2)',
                border: searchFocus ? '1px solid #3A635B' : '1px solid #304452',
                width: '250px',
              }}
            >
              <button
                type="button"
                className={`${
                  activeTab === 'v2' ? 'hidden' : ''
                } flex items-center justify-center px-2 py-1 rounded-lg ml-1 ${
                  enableIdSearch
                    ? 'bg-gradientFrom text-white'
                    : 'bg-cardBg text-white text-opacity-30'
                } `}
                onClick={() => {
                  handleEnableIdSearching();
                }}
              >
                #
              </button>

              <input
                ref={inputRef}
                className={`text-sm search-pool-pc outline-none rounded-xl  py-2 pl-3 pr-6`}
                placeholder={
                  enableIdSearch && activeTab !== 'v2'
                    ? intl.formatMessage({
                        id: 'input_pool_id',
                        defaultMessage: 'Input pool Id',
                      })
                    : intl.formatMessage({
                        id: 'search_pool_by_token',
                        defaultMessage: 'Search pool by token...',
                      })
                }
                inputMode={
                  enableIdSearch && activeTab !== 'v2' ? 'decimal' : 'text'
                }
                type={enableIdSearch && activeTab !== 'v2' ? 'number' : 'text'}
                onFocus={() => {
                  setSearchFocus(true);
                  setShowPoolIDTip(false);
                }}
                onBlur={() => {
                  setSearchFocus(false);
                }}
                onChange={(evt) => {
                  inputRef.current.value = evt.target.value;

                  if (
                    enableIdSearch &&
                    activeTab !== 'v2' &&
                    Number(evt.target.value) >= allPools
                  ) {
                    setShowPoolIDTip(true);
                  } else {
                    setShowPoolIDTip(false);
                  }

                  !enableIdSearch || activeTab === 'v2'
                    ? onSearch(evt.target.value)
                    : null;
                }}
                onKeyDown={(evt) => {
                  if (activeTab !== 'v2' && enableIdSearch) {
                    symbolsArr.includes(evt.key) && evt.preventDefault();
                  }

                  if (
                    evt.key === 'Enter' &&
                    activeTab !== 'v2' &&
                    enableIdSearch
                  ) {
                    handleIdSearching(inputRef.current.value);
                  }
                }}
              />

              {showPoolIDTip && <PoolIdNotExist />}
              <SearchIcon
                style={{
                  opacity: searchFocus ? '1' : '0.5',
                }}
                onClick={() => {
                  if (
                    enableIdSearch &&
                    activeTab !== 'v2' &&
                    !!inputRef.current.value
                  ) {
                    handleIdSearching(inputRef.current.value);
                  }
                }}
                className={`absolute right-2 ${
                  enableIdSearch && activeTab !== 'v2' ? 'cursor-pointer' : ''
                }`}
              ></SearchIcon>
            </div>

            {isSignedIn && (activeTab === 'v1' || activeTab === 'v2') ? (
              <div
                className="ml-1 text-xs"
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-class="reactTip"
                data-html={true}
                data-tip={`
              <div class="text-xs opacity-50">
                <div 
                  style="font-weight:400",
                >
                ${intl.formatMessage({
                  id: 'dcl_pool_are_not_available_to_be_created_yet',

                  defaultMessage:
                    'DCL Pools are not available to be created yet',
                })}
                </div>
              </div>
            `}
                data-for="add_pool_tip"
              >
                <SolidButton
                  className={`text-sm ml-2 px-3 text-white rounded-lg flex items-center justify-center`}
                  onClick={() => {
                    setShowAddPoolModal(true);
                  }}
                  disabled={activeTab === 'v2'}
                >
                  <span className="mr-1">+</span>

                  <span>
                    <FormattedMessage
                      id="create_pool"
                      defaultMessage={'Create Pool'}
                    />
                  </span>
                </SolidButton>

                {activeTab === 'v2' && (
                  <ReactTooltip
                    className="w-20"
                    id="add_pool_tip"
                    backgroundColor="#1D2932"
                    border
                    borderColor="#7e8a93"
                    textColor="#C6D1DA"
                    effect="solid"
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
        {activeTab === 'watchlist' && (
          <WatchListCard
            poolTokenMetas={poolTokenMetas}
            watchPools={watchPools}
            farmCounts={farmCounts}
            volumes={volumes}
            watchV2Pools={watchV2Pools}
            watchList={watchList}
            poolsMorePoolsIds={poolsMorePoolsIds}
            tokenName={tokenName}
            do_farms_v2_poos={do_farms_v2_poos}
            farmAprById={farmAprById}
          />
        )}
        {activeTab === 'v1' && (
          <Card width="w-full" className="bg-cardBg" padding="pb-7 px-0">
            <div
              className="flex px-6 py-5 justify-between rounded-t-xl mb-2"
              style={{
                background: '#293742',
              }}
            >
              <div className="flex items-center">
                <div className="text-white text-lg font-bold">Pools</div>
              </div>

              <div className="ml-8 justify-between  flex">
                <div className="flex items-center">
                  <div
                    className="flex items-center mr-5 cursor-pointer"
                    onClick={() => {
                      poolsScrollRef?.current?.scroll({
                        top: 0,
                        behavior: 'auto',
                      });
                      farmOnly && setFarmOnly(false);
                      !farmOnly && setFarmOnly(true);
                    }}
                  >
                    <div className="mr-2">
                      {farmOnly ? <CheckedTick /> : <CheckedEmpty />}
                    </div>
                    <div className="text-white text-sm ">
                      <FormattedMessage id="farm" defaultMessage="Farm" />
                    </div>
                  </div>
                  <div
                    className="flex items-center mr-5 cursor-pointer"
                    onClick={() => {
                      poolsScrollRef?.current?.scroll({
                        top: 0,
                        behavior: 'auto',
                      });
                      hideLowTVL && onHide(false);
                      !hideLowTVL && onHide(true);
                    }}
                  >
                    <div className="mr-2">
                      {hideLowTVL ? <CheckedTick /> : <CheckedEmpty />}
                    </div>
                    <div className="text-white text-sm ">
                      <FormattedMessage
                        id="hide_low_tvl_pools"
                        defaultMessage="Hide low TVL pools"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <SelectUi
                    list={filterList}
                    onChange={setSelectCoinClass}
                    curvalue={selectCoinClass}
                  />
                </div>
              </div>
            </div>
            <LiquidityPoolsTable
              {...{
                pools,
                nextPage,
                hasMore,
                sortBy,
                reSortBy,
                poolFilterFunc,
                poolReSortingFunc,
                poolTokenMetas,
                farmAprById,
                selectCoinClass,
                poolsMorePoolsIds,
                volumes,
                watchPools,
                farmCounts,
                onSortChange,
                setReSortBy,
                onOrderChange,
                order,
                poolsData,
                poolsScrollRef,
              }}
            />
          </Card>
        )}

        {activeTab === 'v2' && (
          <Card width="w-full" className="bg-cardBg" padding="py-7 px-0">
            <section className="">
              <header className="grid grid-cols-9 py-2 pb-4 text-left text-sm text-primaryText mx-8 border-b border-gray-700 border-opacity-70">
                <div className="col-span-4 flex">
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </div>
                <div className="col-span-1  md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      v2SortBy !== 'fee' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'fee' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('fee');
                      v2SortBy !== 'fee' && setV2Order('desc');
                      v2SortBy === 'fee' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage id="fee" defaultMessage="Fee" />
                  </span>

                  <span
                    className={`cursor-pointer ${
                      v2SortBy !== 'fee' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      setV2SortBy('fee');
                      v2SortBy !== 'fee' && setV2Order('desc');
                      v2SortBy === 'fee' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'fee' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>

                <div className="col-span-2  md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      v2SortBy !== 'top_bin_apr' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'top_bin_apr' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('top_bin_apr');
                      v2SortBy !== 'top_bin_apr' && setV2Order('desc');
                      v2SortBy === 'top_bin_apr' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage
                      id="top_bin_apr"
                      defaultMessage="Top Bin APR (24h)"
                    />
                  </span>

                  <span
                    className={`cursor-pointer ${
                      v2SortBy !== 'top_bin_apr' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      setV2SortBy('top_bin_apr');
                      v2SortBy !== 'top_bin_apr' && setV2Order('desc');
                      v2SortBy === 'top_bin_apr' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'top_bin_apr' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>

                <div className="col-span-1  md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      v2SortBy !== 'volume_24h' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'volume_24h' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('volume_24h');
                      v2SortBy !== 'volume_24h' && setV2Order('desc');
                      v2SortBy === 'volume_24h' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage
                      id="volume_24h"
                      defaultMessage="Volume (24h)"
                    />
                  </span>

                  <span
                    className={`cursor-pointer ${
                      v2SortBy !== 'volume_24h' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      setV2SortBy('volume_24h');
                      v2SortBy !== 'volume_24h' && setV2Order('desc');
                      v2SortBy === 'volume_24h' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'volume_24h' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>

                <div className="col-span-1  relative left-4 flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      v2SortBy !== 'tvl' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'tvl' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('tvl');
                      setReSortBy('');

                      v2SortBy !== 'tvl' && setV2Order('desc');
                      v2SortBy === 'tvl' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage id="tvl" defaultMessage="TVL" />
                  </span>
                  <span
                    className={v2SortBy !== 'tvl' ? 'hidden' : 'cursor-pointer'}
                    onClick={() => {
                      setV2SortBy('tvl');
                      setReSortBy('');
                      v2SortBy !== 'tvl' && setV2Order('desc');
                      v2SortBy === 'tvl' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'tvl' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>
              </header>
              <div className="max-h-96 overflow-y-auto  pool-list-container-pc">
                {allPoolsV2
                  .sort(poolv2ReSortingFunc)
                  .filter(poolv2FilterFunc)
                  .map((pool, i) => (
                    <PoolRowV2
                      tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                      key={pool.pool_id}
                      pool={pool}
                      watched={!!find(watchV2Pools, { pool_id: pool.pool_id })}
                      index={i + 1}
                      showCol={true}
                      relatedSeed={do_farms_v2_poos[pool.pool_id]}
                      h24volume={volumes[pool.pool_id]}
                    />
                  ))}
              </div>
            </section>
          </Card>
        )}

        {activeTab === 'stable' && (
          <StablePoolList
            searchBy={tokenName}
            volumes={volumes}
            watchPools={watchPools}
            farmCounts={farmCounts}
            farmAprById={farmAprById}
          />
        )}
      </div>
      {isSignedIn && (
        <AddPoolModal
          isOpen={showAddPoolModal}
          onRequestClose={(e) => {
            setShowAddPoolModal(false);
          }}
          tokens={selectTokens}
          balances={selectBalances}
        />
      )}
    </>
  );
}

function WatchListCard({
  watchPools,
  poolTokenMetas,
  farmCounts,
  volumes,
  watchV2Pools,
  poolsMorePoolsIds,
  watchList,
  tokenName,
  do_farms_v2_poos,
  farmAprById,
}: {
  watchPools: Pool[];
  poolTokenMetas: any;
  farmCounts: Record<string, number>;
  volumes: Record<string, string>;
  watchV2Pools: PoolInfo[];
  poolsMorePoolsIds: Record<string, string[]>;
  watchList: WatchList[];
  tokenName: string;
  do_farms_v2_poos: Record<string, Seed>;
  farmAprById: Record<string, number>;
}) {
  const totalWatchList_length = watchPools?.length + watchV2Pools?.length;

  function getAllWatchPools() {
    const watchAllPools: any = [];
    watchList.forEach((d: WatchList) => {
      const { pool_id } = d;
      const targetV1 = watchPools.find((p: Pool) => {
        if (p.id.toString() == pool_id) return true;
      });
      const targetV2 = watchV2Pools.find((p: PoolInfo) => {
        if (p.pool_id == pool_id) return true;
      });
      const target = targetV1 || targetV2;
      if (target) {
        watchAllPools.push(target);
      }
    });
    return watchAllPools;
  }

  const watchAllPools = getAllWatchPools();

  function v1PoolFilter(p: Pool) {
    return Object.values(p.metas)?.some((t: any) =>
      _.includes(t.symbol.toLowerCase(), tokenName.toLowerCase())
    );
  }

  function v2PoolFilter(p: PoolInfo) {
    return (
      _.includes(
        p.token_x_metadata.symbol.toLowerCase(),
        tokenName.toLowerCase()
      ) ||
      _.includes(
        p.token_y_metadata.symbol.toLowerCase(),
        tokenName.toLowerCase()
      )
    );
  }

  return (
    <>
      <Card className=" w-full mb-2" padding="p-0 py-6" bgcolor="bg-cardBg">
        <section className="">
          <header className="grid grid-cols-7 py-2 pb-4 text-left text-sm text-gray-400 mx-8 border-b border-gray-700 border-opacity-70">
            <div className="col-span-3 md:col-span-4 flex">
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </div>
            <div className="col-span-1 justify-self-center md:hidden flex items-center">
              <div className="mr-1">
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
            </div>

            <div className="col-span-1 justify-self-center relative right-1 md:hidden flex items-center">
              <div className="pr-1 ">
                <FormattedMessage id="apr" defaultMessage="APR" />
              </div>
            </div>

            <div className="col-span-1 justify-self-center relative  md:hidden flex items-center">
              <div className="pr-1 ">
                <FormattedMessage
                  id="volume_24h"
                  defaultMessage="Volume (24h)"
                />
              </div>
            </div>

            <div className="col-span-1 justify-self-center flex items-center">
              <FormattedMessage id="tvl" defaultMessage="TVL" />
            </div>
          </header>

          <div className="max-h-96 overflow-y-auto">
            {watchAllPools
              .filter((p: any) => {
                if (p.id?.toString()) {
                  return v1PoolFilter(p);
                } else if (p.pool_id) {
                  return v2PoolFilter(p);
                }
              })
              .map((pool: any, i: number) => {
                if (pool.id?.toString()) {
                  return (
                    <div
                      className="w-full hover:bg-poolRowHover hover:bg-opacity-20"
                      key={i}
                    >
                      <PoolRow
                        pool={pool}
                        farmApr={farmAprById ? farmAprById[pool.id] : null}
                        index={i + 1}
                        tokens={poolTokenMetas[pool.id]}
                        morePoolIds={poolsMorePoolsIds[pool.id]}
                        farmCount={farmCounts[pool.id]}
                        supportFarm={!!farmCounts[pool.id]}
                        mark={true}
                      />
                    </div>
                  );
                } else if (pool.pool_id) {
                  return (
                    <PoolRowV2
                      tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                      key={i}
                      pool={pool}
                      index={1 + i}
                      showCol={true}
                      mark={true}
                      h24volume={volumes[pool.pool_id]}
                      relatedSeed={do_farms_v2_poos[pool.pool_id]}
                    />
                  );
                }
              })}
          </div>
        </section>
      </Card>
    </>
  );
}

function PoolRowV2({
  pool,
  index,
  tokens,
  showCol,
  mark,
  watched,
  h24volume,
  relatedSeed,
}: {
  pool: PoolInfo;
  index: number;
  tokens?: TokenMetadata[];
  showCol?: boolean;
  mark?: boolean;
  watched?: boolean;
  h24volume?: string;
  relatedSeed?: Seed;
}) {
  const curRowTokens = useTokens([pool.token_x, pool.token_y], tokens);
  const history = useHistory();
  const topBinApr = useDCLTopBinFee({
    pool,
    way: 'value',
  });
  const displayOfTopBinApr =
    topBinApr == '-' ? '-' : formatPercentage(topBinApr);
  pool.top_bin_apr = topBinApr;

  if (!curRowTokens) return <></>;
  tokens = sort_tokens_by_base(tokens);

  function goDetailV2() {
    const url_pool_id = get_pool_name(pool.pool_id);
    history.push(`/poolV2/${url_pool_id}`);
  }

  function geth24volume() {
    const v = +(h24volume || '0');
    if (v == 0) {
      return '$0';
    } else if (v < 0.01) {
      return '<$0.01';
    } else {
      return '$' + toInternationalCurrencySystem(v.toString(), 2);
    }
  }

  function getFarmApr() {
    if (relatedSeed) {
      const farms = relatedSeed.farmList;
      let apr = 0;
      const allPendingFarms = isPending(relatedSeed);
      farms.forEach(function (item: FarmBoost) {
        const pendingFarm =
          item.status == 'Created' || item.status == 'Pending';
        if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
          apr = +new BigNumber(apr).plus(item.apr).toFixed();
        }
      });
      apr = apr * 100;
      if (+apr == 0) {
        return '-';
      } else {
        return '+' + toPrecision(apr.toString(), 2) + '%';
      }
    }
    return '';
  }

  return (
    <div
      className="w-full hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20 cursor-pointer"
      onClick={goDetailV2}
    >
      <div
        className={`grid ${
          mark ? 'grid-cols-7' : 'grid-cols-9'
        } py-3.5 text-white content-center text-sm text-left mx-8 border-b border-gray-700 border-opacity-70 hover:opacity-80`}
      >
        <div
          className={`md:col-span-4 flex items-center ${
            showCol && mark ? 'col-span-3' : 'col-span-4'
          }`}
        >
          <div className="flex items-center">
            <Images tokens={tokens} size="8" />
            <div className="text-sm ml-3">
              {tokens[0].symbol +
                '-' +
                tokens[1].symbol +
                `${tokens[2] ? '-' + tokens[2].symbol : ''}`}
            </div>
          </div>
          {mark ? (
            <span className="text-xs text-v3SwapGray bg-watchMarkBackgroundColor px-2.5 py-px rounded-xl ml-2">
              DCL
            </span>
          ) : null}
          {watched && (
            <div className="ml-2">
              <WatchListStartFull />
            </div>
          )}
          {relatedSeed && (
            <FarmStampNew multi={relatedSeed.farmList?.length > 1} />
          )}
        </div>

        <div
          className={` py-1 md:hidden ${mark ? 'justify-self-center' : ''} ${
            showCol ? 'col-span-1' : 'col-span-2'
          }`}
        >
          {calculateFeePercent(pool.fee / 100)}%
        </div>
        <div
          className={`${
            mark ? 'col-span-1 justify-self-center' : 'col-span-2'
          }`}
        >
          <div
            className={`inline-flex flex-col items-center py-1`}
            data-type="info"
            data-place="right"
            data-multiline={true}
            data-class={'reactTip'}
            data-html={true}
            data-tip={getPoolListV2FarmAprTip()}
            data-for={'pool_list_v2_pc_apr' + pool.pool_id}
          >
            {displayOfTopBinApr}
            {relatedSeed && (
              <span className="text-xs text-gradientFrom">{getFarmApr()}</span>
            )}
            {relatedSeed && (
              <ReactTooltip
                className="w-20"
                id={'pool_list_v2_pc_apr' + pool.pool_id}
                backgroundColor="#1D2932"
                place="right"
                border
                borderColor="#7e8a93"
                textColor="#C6D1DA"
                effect="solid"
              />
            )}
          </div>
        </div>

        <div
          className={`col-span-1 ${
            mark ? 'justify-self-center' : ''
          }  py-1 md:hidden ${showCol ? '' : 'hidden'}`}
        >
          {geth24volume()}
        </div>
        <div
          className={`col-span-1 py-1  ${
            mark ? 'justify-self-center' : ''
          } relative left-4`}
          title={toPrecision(
            scientificNotationToString(pool.tvl.toString()),
            0
          )}
        >
          {pool.tvlUnreal
            ? '-'
            : '$' + toInternationalCurrencySystem(pool.tvl.toString())}
        </div>
      </div>
    </div>
  );
}

export default PcLiquidityPage;
