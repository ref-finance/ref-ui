import { FormattedMessage } from 'react-intl';
import { DownArrowLight, UpArrowDeep, UpArrowLight } from 'src/components/icon';
import { BlueCircleLoading } from 'src/components/layout/Loading';
import InfiniteScroll from 'react-infinite-scroll-component';
import { find } from 'lodash';
import React from 'react';
import PoolRow from 'src/pages/pools/LiquidityPage/PoolRow';

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
  isFetching,
}) => {
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
              onSortChange('');
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
          id="poolscroll"
          className="max-h-96 overflow-y-auto  pool-list-container-pc relative"
        >
          <InfiniteScroll
            next={nextPage}
            hasMore={hasMore}
            dataLength={pools?.length}
            loader={
              <div
                className={
                  'flex justify-center text-white infinite-scroll-loading'
                }
              >
                Loading
              </div>
            }
            scrollableTarget={'poolscroll'}
          >
            {pools
              ?.filter(poolFilterFunc)
              .sort(poolReSortingFunc)
              .map((pool, i) => (
                <PoolRow
                  tokens={poolTokenMetas[pool.id]}
                  key={i}
                  farmApr={farmAprById ? farmAprById[pool.id] : null}
                  pool={pool}
                  index={i + 1}
                  selectCoinClass={selectCoinClass}
                  morePoolIds={poolsMorePoolsIds[pool.id]}
                  supportFarm={!!farmCounts[pool.id]}
                  farmCount={farmCounts[pool.id]}
                  watched={!!find(watchPools, { id: pool.id })}
                />
              ))}
          </InfiniteScroll>
        </div>
      </div>
    </section>
  );
};

export default LiquidityPoolsTable;
