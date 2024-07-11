import { Pool } from 'src/services/pool';
import { PoolInfo } from 'src/services/swapV3';
import { WatchList } from 'src/store/RefDatabase';
import {
  classificationOfCoins,
  classificationOfCoins_key,
  FarmBoost,
  Seed,
} from 'src/services/farm';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { WalletContext } from 'src/utils/wallets-integration';
import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  useRainbowWhitelistTokens,
  useTokenBalances,
  useTokens,
  useWhitelistTokens,
} from 'src/state/token';
import { useAllPoolsV2 } from 'src/state/swapV3';
import _, { find } from 'lodash';
import { REF_META_DATA, TokenMetadata } from 'src/services/ft-contract';
import { unwrapedNear } from 'src/services/wrap-near';
import {
  get_pool_name,
  isPending,
  openUrl,
  sort_tokens_by_base,
} from 'src/services/commonV3';
import { getPoolFeeApr } from 'src/pages/pools/utils';
import Loading from '../../../../components/layout/Loading';
import { PoolTabV3 } from 'src/components/pool/PoolTabV3';
import getConfig from 'src/services/config';
import {
  StartPoolIcon,
  WatchListStartFull,
} from 'src/components/icon/WatchListStar';
import { Card } from 'src/components/card/Card';
import { getVEPoolId } from 'src/pages/ReferendumPage';
import { Images, Symbols } from 'src/components/stableswap/CommonComp';
import {
  ArrowDownLarge,
  CheckedEmpty,
  CheckedTick,
  DownArrowLightMobile,
  FarmStampNew,
  PoolDaoBannerMobile,
  TokenRisk,
  UpArrowDeep,
} from 'src/components/icon';
import { SearchIcon } from 'src/components/icon/FarmBoost';
import { QuestionTip } from 'src/components/layout/TipWrapper';
import { SelectModal, SelectModalV2 } from 'src/components/layout/SelectModal';
import { AddPoolModal } from 'src/pages/pools/AddPoolPage';
import {
  PoolIdNotExist,
  SelectUi,
} from 'src/pages/pools/poolsComponents/poolsComponents';
import {
  REF_MOBILE_POOL_ID_INPUT,
  REF_POOL_ID_SEARCHING_KEY,
  TokenPriceListContext,
} from 'src/pages/pools/LiquidityPage/constLiquidityPage';
import MobilePoolRow from 'src/pages/pools/LiquidityPage/MobileLiquidityPage/MobilePoolRow';
import StablePoolList from 'src/pages/pools/poolsComponents/StablePoolList';
import { useInView } from 'react-intersection-observer';
import { useDCLTopBinFee } from 'src/state/pool';
import {
  calculateFeePercent,
  toInternationalCurrencySystem,
  toPrecision,
} from 'src/utils/numbers';
import { formatPercentage } from 'src/components/d3Chart/utils';
import BigNumber from 'bignumber.js';
import LiquidityV1PoolsMobile from 'src/pages/pools/LiquidityPage/MobileLiquidityPage/LiquidityV1PoolsMobile';
import { PoolsTip } from '../../poolsComponents/poolsTip';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { TknIcon } from 'src/components/icon/Common';
import Pagination from '../../../../components/poolsPagination/Pagination';

function MobileLiquidityPage({
  h24VolumeV2,
  totalItems,
  pageSize,
  handlePageChange,
  handleSizeChange,
  cardLoading,
  pools,
  tokenName,
  order,
  watchPools,
  hasMore,
  onSearch,
  onSortChange,
  onOrderChange,
  nextPage,
  sortBy,
  onHide,
  hideLowTVL,
  allPools,
  poolTokenMetas,
  farmCounts,
  farmOnly,
  setFarmOnly,
  volumes,
  activeTab,
  switchActiveTab,
  watchV2Pools,
  watchList,
  do_farms_v2_poos,
  farmAprById,
  setTknType,
}: {
  cardLoading: boolean;
  totalItems: number;
  pageSize: number;
  handlePageChange: (key: any, size: any) => void;
  handleSizeChange: (key: number) => void;
  h24VolumeV2: string;
  farmAprById: Record<string, number>;
  pools: Pool[];
  poolTokenMetas: any;
  farmOnly: boolean;
  setFarmOnly: (farmOnly: boolean) => void;
  onSortChange: (modeSort: string) => void;
  tokenName: string;
  order: string;
  watchPools: Pool[];
  sortBy: string;
  hideLowTVL: Boolean;
  hasMore: boolean;
  allPools: number;
  onHide: (mode: Boolean) => void;
  onSearch: (name: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
  farmCounts: Record<string, number>;
  volumes: Record<string, string>;
  switchActiveTab: (tab: string) => void;
  activeTab: string;
  watchV2Pools: PoolInfo[];
  watchList: WatchList[];
  do_farms_v2_poos: Record<string, Seed>;
  setTknType: (key: string) => void;
}) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const history = useHistory();
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>();
  const [showSelectModalV2, setShowSelectModalV2] = useState<Boolean>();

  const inputRef = useRef(null);

  const search_id_ref = useRef(null);

  const selectTokens = useWhitelistTokens();

  const selectBalances = useTokenBalances();

  const allPoolsV2 = useAllPoolsV2(true);
  const [v2SortBy, setV2SortBy] = useState<string>('tvl');

  const [v2Order, setV2Order] = useState<string>('desc');
  const [tooltip, setTooltip] = useState<string>();

  const topBinTooltipRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        tooltip &&
        topBinTooltipRef.current &&
        !topBinTooltipRef.current.contains(event.target)
      ) {
        setTooltip('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tooltip]);

  const poolv2ReSortingFunc = (p1: PoolInfo, p2: PoolInfo) => {
    const f1 = p1.fee;

    const f2 = p2.fee;

    const tvl1 = p1.tvl;

    const tvl2 = p2.tvl;

    const v1 = volumes[p1.pool_id] ? parseFloat(volumes[p1.pool_id]) : 0;

    const v2 = volumes[p2.pool_id] ? parseFloat(volumes[p2.pool_id]) : 0;

    const top1 = +(p1.top_bin_apr == '-' ? '0' : p1.top_bin_apr);
    const top2 = +(p2.top_bin_apr == '-' ? '0' : p2.top_bin_apr);
    if (v2Order === 'desc') {
      if (v2SortBy === 'tvl') {
        return tvl2 - tvl1;
      } else if (v2SortBy === 'fee') {
        return f2 - f1;
      } else if (v2SortBy === 'volume_24h') {
        return v2 - v1;
      } else if (v2SortBy == 'top_bin_apr') {
        return top2 - top1;
      }
    } else if (v2Order === 'asc') {
      if (v2SortBy === 'tvl') {
        return tvl1 - tvl2;
      } else if (v2SortBy === 'fee') {
        return f1 - f2;
      } else if (v2SortBy === 'volume_24h') {
        return v1 - v2;
      } else if (v2SortBy == 'top_bin_apr') {
        return top1 - top2;
      }
    }
  };

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
  const tokensStar = [REF_META_DATA, unwrapedNear];

  const filterList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    filterList[key] = intl.formatMessage({ id: key });
  });
  const [selectCoinClass, setSelectCoinClass] = useState<string>('all');
  const [showAddPoolModal, setShowAddPoolModal] = useState<boolean>(false);

  useEffect(() => {
    setTknType(selectCoinClass);
  }, [selectCoinClass]);

  const poolFilterFunc = (p: Pool) => {
    if (selectCoinClass === 'all') return true;

    return poolTokenMetas[p.id].some((tk: TokenMetadata) =>
      classificationOfCoins[selectCoinClass].includes(tk.symbol)
    );
  };
  const outOfText = intl.formatMessage({ id: 'out_of' });
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

  const poolSortingFunc = (p1: Pool, p2: Pool) => {
    if (order === 'asc') {
      if (sortBy === 'apr') {
        return (
          getPoolFeeApr(volumes[p1.id], p1) +
          (farmAprById?.[p1.id] || 0) * 100 -
          (getPoolFeeApr(volumes[p2.id], p2) +
            (farmAprById?.[p2.id] || 0) * 100)
        );
      } else if (sortBy === 'volume_24h') {
        return parseFloat(volumes[p1.id]) - parseFloat(volumes[p2.id]);
      }
    } else if (order === 'desc') {
      if (sortBy === 'apr') {
        return (
          getPoolFeeApr(volumes[p2.id], p2) +
          (farmAprById?.[p2.id] || 0) * 100 -
          (getPoolFeeApr(volumes[p1.id], p1) +
            (farmAprById?.[p1.id] || 0) * 100)
        );
      } else if (sortBy === 'volume_24h') {
        return parseFloat(volumes[p2.id]) - parseFloat(volumes[p1.id]);
      }
    }
  };
  if (activeTab === 'v2' && !allPoolsV2) return <Loading />;

  return (
    <>
      <PoolTabV3></PoolTabV3>
      <div className="flex flex-col w-3/6 md:w-11/12 lg:w-5/6 xs:w-11/12 m-auto md:flex lg:hidden xl:hidden xs:flex">
        <MobileWatchListCard
          poolTokenMetas={poolTokenMetas}
          watchPools={watchPools}
          watchV2Pools={watchV2Pools}
          farmCounts={farmCounts}
          volumes={volumes}
          watchList={watchList}
          do_farms_v2_poos={do_farms_v2_poos}
          farmAprById={farmAprById}
        />

        {/* start pool card */}
        {!!getConfig().REF_VE_CONTRACT_ID ? (
          <div className="mt-1 mb-5">
            <div className="flex items-center">
              <span className="text-white text-sm ml-4 mr-2">
                <FormattedMessage
                  id="start_pool"
                  defaultMessage={'Star Pool'}
                />
              </span>
              <StartPoolIcon />
            </div>
            <Card
              className="mt-2 bg-cardBg flex flex-col  "
              width="w-full"
              padding="px-0 py-3"
            >
              <div className="flex items-center ml-5">
                <button
                  className="flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openUrl(`/pool/${getVEPoolId()}`);
                  }}
                >
                  <Images tokens={tokensStar} size="6" className="mr-2.5" />
                  <Symbols
                    tokens={tokensStar}
                    separator="-"
                    fontSize="text-sm"
                  ></Symbols>
                </button>
              </div>

              <PoolDaoBannerMobile />
            </Card>
          </div>
        ) : null}

        <div className="flex flex-col items-center justify-between mb-4">
          <div className="bg-cardBg flex items-center rounded-xl w-full p-1">
            <button
              className={`w-1/3 h-10 flex items-center justify-center ${
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
              <FormattedMessage id="v2_pools" />
            </button>

            <button
              className={`w-1/3 h-10 flex items-center justify-center ${
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

            <button
              className={`w-1/3 h-10 flex items-center justify-center ${
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
              ></FormattedMessage>
            </button>
          </div>

          {activeTab === 'stable' && (
            <div className="flex items-center justify-end relative w-full">
              <div className="relative rounded-xl w-full my-2 text-primaryText flex items-center pr-2 bg-cardBg">
                <button
                  type="button"
                  className={` flex items-center justify-center px-2 py-0.5 rounded-lg ml-1 ${
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
                  className={`text-sm outline-none rounded-xl w-full py-1.5 pl-3 pr-6`}
                  placeholder={
                    enableIdSearch
                      ? intl.formatMessage({
                          id: 'input_pool_id',
                          defaultMessage: 'Input pool Id',
                        })
                      : intl.formatMessage({
                          id: 'search_by_token',
                        })
                  }
                  defaultValue={
                    enableIdSearch
                      ? sessionStorage.getItem(REF_MOBILE_POOL_ID_INPUT)
                      : tokenName
                  }
                  inputMode={enableIdSearch ? 'decimal' : 'text'}
                  type={enableIdSearch ? 'number' : 'text'}
                  onKeyDown={(evt) => {
                    if (enableIdSearch) {
                      symbolsArr.includes(evt.key) && evt.preventDefault();
                    }

                    if (evt.key === 'Enter' && enableIdSearch) {
                      handleIdSearching(inputRef.current.value);
                    }
                  }}
                  onFocus={() => {
                    setShowPoolIDTip(false);
                  }}
                  onChange={(evt) => {
                    inputRef.current.value = evt.target.value;

                    if (
                      enableIdSearch &&
                      Number(evt.target.value) >= allPools
                    ) {
                      setShowPoolIDTip(true);
                    } else {
                      setShowPoolIDTip(false);
                    }

                    !enableIdSearch
                      ? onSearch(evt.target.value)
                      : sessionStorage.setItem(
                          REF_MOBILE_POOL_ID_INPUT,
                          evt.target.value
                        );
                  }}
                />
                {showPoolIDTip && <PoolIdNotExist />}
                <SearchIcon
                  onClick={() => {
                    if (enableIdSearch && !!inputRef.current.value) {
                      handleIdSearching(inputRef.current.value);
                    }
                  }}
                  className={`absolute right-2 ${
                    enableIdSearch ? 'cursor-pointer' : ''
                  }`}
                ></SearchIcon>
              </div>
            </div>
          )}
        </div>
        <PoolsTip activeTab={activeTab} />
        {activeTab === 'v1' && (
          <LiquidityV1PoolsMobile
            {...{
              enableIdSearch,
              handleEnableIdSearching,
              inputRef,
              allPools,
              setShowPoolIDTip,
              onSearch,
              symbolsArr,
              handleIdSearching,
              tokenName,
              isSignedIn,
              setShowAddPoolModal,
              showPoolIDTip,
              onOrderChange,
              order,
              showSelectModal,
              setShowSelectModal,
              sortBy,
              onSortChange,
              poolSortingFunc,
              selectCoinClass,
              poolTokenMetas,
              watchPools,
              farmCounts,
              farmAprById,
              filterList,
              setSelectCoinClass,
              farmOnly,
              setFarmOnly,
              hideLowTVL,
              onHide,
              pools,
              volumes,
            }}
          />
        )}

        {activeTab === 'v2' && (
          <Card className="w-full" bgcolor="bg-cardBg" padding="p-0 pb-4">
            <div className="rounded my-4 text-gray-400 flex items-center pr-2 mx-4 mb-5">
              <div className="relative flex items-center flex-grow">
                <input
                  ref={inputRef}
                  className={`text-sm outline-none rounded py-2 pl-3 pr-7 flex-grow bg-inputDarkBg`}
                  placeholder={intl.formatMessage({
                    id: 'search_by_token',
                  })}
                  value={tokenName}
                  onFocus={() => tooltip && setTooltip('')}
                  onChange={(evt) => {
                    onSearch(evt.target.value);
                  }}
                />
                <SearchIcon className="absolute right-1.5"></SearchIcon>
              </div>
            </div>
            <section className="w-full">
              <header className="p-4 text-gray-400 flex items-center justify-between text-sm">
                <div>
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </div>
                <div className="flex items-center">
                  <div
                    className="mr-2"
                    onClick={() => {
                      setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2Order === 'desc' ? (
                      <DownArrowLightMobile />
                    ) : (
                      <UpArrowDeep />
                    )}
                  </div>
                  <div
                    ref={topBinTooltipRef}
                    data-tooltip-id={'top-bin-apr-mobile'}
                    data-tooltip-content="This is the trailing 24hr APR of the top performing bin in this pool."
                    className={`relative rounded-full flex items-center border    ${
                      showSelectModalV2
                        ? 'border-greenColor text-white'
                        : 'border-farmText text-farmText'
                    } w-36`}
                  >
                    <CustomTooltip
                      id={'top-bin-apr-mobile'}
                      isOpen={
                        v2SortBy === 'top_bin_apr' && tooltip === 'top_bin_apr'
                      }
                    />

                    <span
                      className={`px-2 w-full text-xs h-5
                      flex items-center justify-between
                    `}
                      onClick={() => {
                        setShowSelectModalV2(true);
                      }}
                    >
                      <label>
                        <FormattedMessage
                          id={v2SortBy}
                          defaultMessage={v2SortBy}
                        />
                      </label>
                      <ArrowDownLarge />
                    </span>

                    {showSelectModalV2 && (
                      <SelectModalV2
                        sortMode={v2SortBy}
                        onSortChange={(e) => {
                          if (e === 'top_bin_apr') {
                            setTooltip(e);
                          }
                          setV2SortBy(e);
                        }}
                        setShowModal={setShowSelectModalV2}
                        className="top-8"
                      />
                    )}
                  </div>
                </div>
              </header>
              <div className="border-b border-gray-700 border-opacity-70" />
              <div className="max-h-96 overflow-y-auto pool-list-container-mobile">
                {allPoolsV2
                  ?.filter(poolv2FilterFunc)
                  .sort(poolv2ReSortingFunc)
                  .map((pool, i) => (
                    <MobilePoolRowV2
                      tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                      pool={pool}
                      sortBy={v2SortBy}
                      watched={!!find(watchV2Pools, { pool_id: pool.pool_id })}
                      key={pool.pool_id + '-mobile-pool-row-v2'}
                      h24volume={volumes[pool.pool_id]}
                      relatedSeed={do_farms_v2_poos[pool.pool_id]}
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
        {activeTab == 'v1' && (
          <div className="mt-10">
            <Pagination
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onChangePage={handlePageChange}
              onPageSizeChange={handleSizeChange}
            ></Pagination>
          </div>
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

function MobileWatchListCard({
  watchPools,
  poolTokenMetas,
  farmCounts,
  volumes,
  watchV2Pools,
  watchList,
  do_farms_v2_poos,
  farmAprById,
}: {
  watchPools: Pool[];
  poolTokenMetas: any;
  farmCounts: Record<string, number>;
  volumes: Record<string, string>;
  watchV2Pools: PoolInfo[];
  watchList: WatchList[];
  do_farms_v2_poos: Record<string, Seed>;
  farmAprById: Record<string, number>;
}) {
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>(false);
  const [sortBy, onSortChange] = useState<string>('tvl');
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
  return (
    <Card className="w-full" bgcolor="bg-cardBg" padding="p-0 pb-4 mb-4 mt-2">
      <div className="mx-4 flex items-center justify-between mt-4">
        <div className="flex items-center">
          <div
            className={`text-${
              watchPools?.length > 0 ? 'white' : 'gray-400'
            }  text-base`}
          >
            <FormattedMessage id="my_watchlist" defaultMessage="My Watchlist" />
            &nbsp;
            {totalWatchList_length > 0 ? <>({totalWatchList_length})</> : ''}
          </div>
          {/* my_watchlist_copy */}
          <QuestionTip id="my_watchlist_copy" />
        </div>
      </div>
      <section className="w-full">
        <header className="p-4 text-gray-400 flex items-center justify-between text-sm">
          <div>
            <FormattedMessage id="pair" defaultMessage="Pair" />
          </div>
          <div className="flex items-center">
            <div
              className={`relative rounded-full flex items-center border    ${
                showSelectModal
                  ? 'border-greenColor text-white'
                  : 'border-farmText text-farmText'
              } w-36`}
            >
              <span
                className={`px-2 w-full text-xs h-5
                    flex items-center justify-between
                  `}
                onClick={() => {
                  setShowSelectModal(true);
                }}
              >
                <label>
                  <FormattedMessage id={sortBy} defaultMessage={sortBy} />
                </label>
                <ArrowDownLarge />
              </span>

              {showSelectModal && (
                <SelectModal
                  onSortChange={onSortChange}
                  setShowModal={setShowSelectModal}
                  className="top-8"
                  sortMode={sortBy}
                />
              )}
            </div>
          </div>
        </header>
        {sortBy === 'apr' && (
          <div className="text-right text-farmText text-xs mr-3 mb-0.5">
            *Pool Fee APY/Top Bin APR + Farm Rewards APR
          </div>
        )}
        <div className="border-b border-gray-700 border-opacity-70" />
        <div className="max-h-96 overflow-y-auto">
          {watchAllPools.map((pool: any, i: number) => {
            if (pool.id?.toString()) {
              return (
                <div className="w-full hover:bg-poolRowHover" key={pool.id}>
                  <MobilePoolRow
                    tokens={poolTokenMetas[pool.id]}
                    sortBy={sortBy}
                    pool={pool}
                    watched={!!find(watchPools, { id: pool.id })}
                    supportFarm={!!farmCounts[pool.id]}
                    h24volume={volumes[pool.id]}
                    watchPool
                    mark={true}
                    farmApr={farmAprById[pool.id]}
                    farmCount={farmCounts[pool.id]}
                  />
                </div>
              );
            } else if (pool.pool_id) {
              return (
                <MobilePoolRowV2
                  tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                  pool={pool}
                  sortBy={sortBy}
                  mark={true}
                  key={pool.pool_id + '-mobile-pool-row-v2'}
                  h24volume={volumes[pool.pool_id]}
                  relatedSeed={do_farms_v2_poos[pool.pool_id]}
                />
              );
            }
          })}
        </div>
      </section>
    </Card>
  );
}

function MobilePoolRowV2({
  pool,
  sortBy,
  tokens,
  mark,
  watched,
  h24volume,
  relatedSeed,
}: {
  pool: PoolInfo;
  sortBy: string;
  tokens?: TokenMetadata[];
  mark?: boolean;
  watched?: boolean;
  h24volume?: string;
  relatedSeed?: Seed;
}) {
  const { ref } = useInView();
  const { riskTokens } = useContext(TokenPriceListContext);
  const curRowTokens = useTokens([pool.token_x, pool.token_y], tokens);
  const [showTooltip, setShowTooltip] = useState(false);
  const isTokenAtRisk = (token) => {
    return riskTokens.some((riskToken) => riskToken.id === token.id);
  };
  const displayOfTopBinApr = useDCLTopBinFee({
    pool,
    way: 'value',
  });
  pool.top_bin_apr = displayOfTopBinApr;

  const history = useHistory();

  if (!curRowTokens) return <></>;
  tokens = sort_tokens_by_base(tokens);

  const showSortedValue = ({
    sortBy,
    value,
  }: {
    sortBy: string;
    value?: number;
  }) => {
    if (sortBy === 'tvl')
      return pool.tvlUnreal
        ? '-'
        : toInternationalCurrencySystem(value.toString());
    else if (sortBy === 'fee') return `${calculateFeePercent(value / 100)}%`;
    else if (sortBy === 'volume_24h') {
      return geth24volume();
    } else if (sortBy === 'top_bin_apr' || (sortBy == 'apr' && mark)) {
      return value?.toString() == '-' ? '-' : formatPercentage(value);
    } else return '/';
  };
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
  const atRiskTokens = curRowTokens.filter((token) =>
    riskTokens.some((riskToken) => riskToken.id === token.id)
  );
  const hasRiskTokens = atRiskTokens.length > 0;
  const tooltipText =
    atRiskTokens.length > 1
      ? `${atRiskTokens
          .map((t) => t.symbol)
          .join(' and ')} are uncertified tokens with high risk.`
      : atRiskTokens.length === 1
      ? `${atRiskTokens[0].symbol} is uncertified token with high risk.`
      : '';
  return (
    <div className="w-full hover:bg-poolRowHover" onClick={goDetailV2}>
      <div
        ref={ref}
        className="flex flex-col border-b border-gray-700 border-opacity-70 bg-cardBg w-full px-2.5 py-6 text-white"
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center justify-start">
            <div className="flex items-center">
              {/* <div className="h-6 w-6 border border-gradientFromHover rounded-full">
                <img
                  key={tokens[0].id.substring(0, 12).substring(0, 12)}
                  className="rounded-full w-full"
                  src={tokens[0].icon}
                />
              </div>

              <div className="h-6 w-6 border border-gradientFromHover rounded-full -ml-1.5">
                <img
                  key={tokens[1].id}
                  className="w-full rounded-full"
                  src={tokens[1].icon}
                />
              </div> */}
              {curRowTokens.map((token, index) => {
                const atRisk = isTokenAtRisk(token);
                return (
                  <div key={token.id} className="relative inline-block">
                    <div
                      className={`border-2 border-watchMarkBackgroundColor rounded-full relative z-10 ${
                        index > 0 ? '-ml-1.5' : ''
                      }`}
                      style={{
                        height: '26px',
                        width: '26px',
                      }}
                    >
                      <img
                        className="rounded-full w-full"
                        src={token.icon}
                        alt={token.symbol}
                      />
                    </div>
                    {atRisk && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center z-50">
                        <TknIcon className="transform scale-75" />
                      </div>
                    )}
                  </div>
                );
              })}
              {tokens[2] ? (
                <div className="h-6 w-6 border border-gradientFromHover rounded-full -ml-1.5">
                  <img
                    key={tokens[2].id}
                    className="w-full rounded-full"
                    src={tokens[2].icon}
                  />
                </div>
              ) : null}
            </div>
            <div className="flex flex-col flex-wrap">
              <div className="flex items-center">
                <div className="text-sm ml-2 font-semibold whitespace-nowrap mb-0.5">
                  {tokens[0].symbol +
                    '-' +
                    tokens[1].symbol +
                    `${tokens[2] ? '-' + tokens[2].symbol : ''}`}
                </div>
                {watched && (
                  <div className="ml-2">
                    <WatchListStartFull />
                  </div>
                )}
              </div>
              <div className="flex items-center">
                {mark ? (
                  <span className="max-w-min  whitespace-nowrap text-xs text-v3SwapGray bg-watchMarkBackgroundColor px-2.5 py-px rounded-xl ml-2 mb-0.5">
                    DCL
                  </span>
                ) : null}
                {relatedSeed && (
                  <div className="mr-2">
                    <FarmStampNew multi={relatedSeed.farmList?.length > 1} />
                  </div>
                )}
              </div>
            </div>
            {hasRiskTokens && (
              <div
                className="ml-2 relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span>
                  <TokenRisk />
                </span>
                {showTooltip && (
                  <div className="absolute -top-3 z-50 left-5 px-2 w-40 py-1.5 border border-borderColor text-farmText text-xs rounded-md bg-cardBg">
                    {tooltipText}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end">
            {showSortedValue({
              sortBy,
              value: sortBy == 'apr' && mark ? pool.top_bin_apr : pool[sortBy],
            })}

            {relatedSeed &&
              (sortBy == 'top_bin_apr' || (sortBy == 'apr' && mark)) && (
                <span className="text-xs text-gradientFrom">
                  {getFarmApr()}
                </span>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileLiquidityPage;
