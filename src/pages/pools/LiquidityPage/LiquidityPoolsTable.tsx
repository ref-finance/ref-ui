import { FormattedMessage } from 'react-intl';
import {
  DownArrowLight,
  NoDataIcon,
  UpArrowDeep,
  UpArrowLight,
} from 'src/components/icon';
import { BlueCircleLoading } from 'src/components/layout/Loading';
import InfiniteScroll from 'react-infinite-scroll-component';
import _, { find } from 'lodash';
import React, { useRef } from 'react';
import PoolRow from 'src/pages/pools/LiquidityPage/PoolRow';
import { ChartNoData } from 'src/components/icon/ChartNoData';

const LiquidityPoolsTable = ({
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
}) => {
  let poolList = pools
    // ?.filter(poolFilterFunc)
    ?.sort(poolReSortingFunc);
  const { handlePageChange, isFetching } = poolsData || {};

  return (
    <section className="">
      <header className="grid grid-cols-7 py-2 pb-4 text-left text-sm text-primaryText mx-8 border-b border-gray-700 border-opacity-70">
        <div className="col-span-3 md:col-span-4 flex">
          <FormattedMessage id="pair" defaultMessage="Pair" />
        </div>
        <div className="col-span-1 justify-self-center md:hidden flex items-center">
          <span
            className={`pr-1  cursor-pointer ${
              sortBy !== 'fee' ? 'hover:text-white' : ''
            } ${sortBy === 'fee' ? 'text-gradientFrom' : ''}`}
            onClick={() => {
              onSortChange('fee');
              setReSortBy('');
              sortBy !== 'fee' && onOrderChange('desc');
              sortBy === 'fee' &&
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
            }}
          >
            <FormattedMessage id="fee" defaultMessage="Fee" />
          </span>

          <span
            className={`cursor-pointer ${sortBy !== 'fee' ? 'hidden' : ''}`}
            onClick={() => {
              onSortChange('fee');
              setReSortBy('');
              sortBy !== 'fee' && onOrderChange('desc');
              sortBy === 'fee' &&
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
            }}
          >
            {sortBy === 'fee' ? (
              order === 'desc' ? (
                <DownArrowLight />
              ) : (
                <UpArrowLight />
              )
            ) : (
              <UpArrowDeep />
            )}
          </span>
        </div>

        <div className="col-span-1 justify-self-center  relative right-1 md:hidden flex items-center">
          <span
            className={`pr-1  cursor-pointer ${
              reSortBy !== 'apr' ? 'hover:text-white' : ''
            } ${reSortBy === 'apr' ? 'text-gradientFrom' : ''}`}
            onClick={() => {
              onSortChange('apr');
              setReSortBy('apr');
              reSortBy !== 'apr' && onOrderChange('desc');
              reSortBy === 'apr' &&
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
            }}
          >
            <FormattedMessage id="apr" defaultMessage="APR" />
          </span>

          <span
            className={reSortBy !== 'apr' ? 'hidden' : 'cursor-pointer'}
            onClick={() => {
              onSortChange('apr');
              setReSortBy('apr');
              reSortBy !== 'apr' && onOrderChange('desc');
              reSortBy === 'apr' &&
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
            }}
          >
            {reSortBy === 'apr' ? (
              order === 'desc' ? (
                <DownArrowLight />
              ) : (
                <UpArrowLight />
              )
            ) : (
              <UpArrowDeep />
            )}
          </span>
        </div>

        <div className="col-span-1 justify-self-center relative  md:hidden flex items-center">
          <span
            className={`pr-1  cursor-pointer ${
              reSortBy !== 'volume' ? 'hover:text-white' : ''
            } ${reSortBy === 'volume' ? 'text-gradientFrom' : ''}`}
            onClick={() => {
              onSortChange('volume24hinUSD');
              setReSortBy('volume');
              reSortBy !== 'volume' && onOrderChange('desc');
              reSortBy === 'volume' &&
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
            }}
          >
            <FormattedMessage id="volume_24h" defaultMessage="Volume (24h)" />
          </span>

          <span
            className={reSortBy !== 'volume' ? 'hidden' : 'cursor-pointer'}
            onClick={() => {
              onSortChange('volume24hinUSD');
              setReSortBy('volume');
              reSortBy !== 'volume' && onOrderChange('desc');
              reSortBy === 'volume' &&
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
            }}
          >
            {reSortBy === 'volume' ? (
              order === 'desc' ? (
                <DownArrowLight />
              ) : (
                <UpArrowLight />
              )
            ) : (
              <UpArrowDeep />
            )}
          </span>
        </div>

        <div className="col-span-1 justify-self-center relative left-4 flex items-center">
          <span
            className={`pr-1  cursor-pointer ${
              sortBy !== 'tvl' ? 'hover:text-white' : ''
            } ${sortBy === 'tvl' ? 'text-gradientFrom' : ''}`}
            onClick={() => {
              onSortChange('tvl');
              setReSortBy('');

              sortBy !== 'tvl' && onOrderChange('desc');
              sortBy === 'tvl' &&
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
            }}
          >
            <FormattedMessage id="tvl" defaultMessage="TVL" />
          </span>
          <span
            className={sortBy !== 'tvl' ? 'hidden' : 'cursor-pointer'}
            onClick={() => {
              onSortChange('tvl');
              setReSortBy('');
              sortBy !== 'tvl' && onOrderChange('desc');
              sortBy === 'tvl' &&
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
            }}
          >
            {sortBy === 'tvl' ? (
              order === 'desc' ? (
                <DownArrowLight />
              ) : (
                <UpArrowLight />
              )
            ) : (
              <UpArrowDeep />
            )}
          </span>
        </div>
        {/*<p className="col-span-1 justify-self-end relative xs:right-8 lg:right-5">*/}
        {/*  <FormattedMessage id="pools" defaultMessage="Pools" />*/}
        {/*</p>*/}
      </header>

      <div className={'relative'}>
        <div className={`pool-loader ${isFetching ? 'pool-loader-show' : ''}`}>
          <BlueCircleLoading />
        </div>

        <div
          ref={poolsScrollRef}
          id="poolscroll"
          className="overflow-y-auto pool-list-container-pc relative"
        >
          <InfiniteScroll
            next={nextPage}
            hasMore={hasMore}
            dataLength={poolList?.length}
            loader={
              <div
                className={
                  'flex mt-5 flex-1 justify-center text-gray2 infinite-scroll-loading'
                }
                style={{ fontSize: 14 }}
              >
                Loading
              </div>
            }
            scrollableTarget={'poolscroll'}
          >
            {poolList?.length ? (
              poolList.map((pool, i) => (
                <PoolRow
                  tokens={poolTokenMetas[pool.id]}
                  key={pool.id}
                  farmApr={farmAprById ? farmAprById[pool.id] : null}
                  pool={pool}
                  index={i + 1}
                  selectCoinClass={selectCoinClass}
                  morePoolIds={poolsMorePoolsIds[pool.id]}
                  supportFarm={!!farmCounts[pool.id]}
                  farmCount={farmCounts[pool.id]}
                  watched={!!find(watchPools, { id: pool.id })}
                />
              ))
            ) : (
              <div
                className={
                  'flex items-center justify-center flex-col pool-nodata'
                }
              >
                <ChartNoData />
                <div className={'text-primaryText'}>
                  <FormattedMessage id="no_data" defaultMessage="No Data" />
                </div>
              </div>
            )}
          </InfiniteScroll>
        </div>
      </div>
    </section>
  );
};

export default LiquidityPoolsTable;
