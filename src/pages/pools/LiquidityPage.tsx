import React, { useState, useEffect } from 'react';
import { FaRegQuestionCircle, FaSearch } from 'react-icons/fa';
// AiOutlineSearch

import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useHistory } from 'react-router';
import { Card } from '~components/card/Card';
import { usePools } from '../../state/pool';
import Loading from '~components/layout/Loading';
import { getExchangeRate, useTokens } from '../../state/token';
import { Link } from 'react-router-dom';
import { canFarm, Pool } from '../../services/pool';
import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage, useIntl } from 'react-intl';

function MobilePoolRow({ pool }: { pool: Pool }) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const tokens = useTokens(pool.tokenIds);
  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(canFarm);
    });
  }, [pool]);
  const [expand, setExpand] = useState(false);
  const history = useHistory();

  if (!tokens) return <Loading />;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const farmButton = () => {
    if (supportFarm)
      return (
        <div className="mt-1 px-1 py-0.5 px-1 mr-3 text-center bg-greenLight text-white font-bold inline-block rounded">
          <FormattedMessage id="farms" defaultMessage="Farms" />
        </div>
      );
    return '';
  };

  return (
    <div
      className={`flex items-top flex-col relative text-xs  text-gray-600 w-11/12 m-auto mb-2.5 pr-0`}
    >
      <div
        className={`flex justify-between p-4 rounded-lg ${
          expand ? 'bg-greenLight1' : 'bg-white'
        } ${expand ? 'rounded-b-none' : 'rounded-lg'}`}
        onClick={() => setExpand(!expand)}
      >
        <div className="flex flex-col justify-between">
          <div
            className={`text-base  ${expand ? 'text-white' : 'text-gray-800'}`}
          >
            {toRealSymbol(tokens[0].symbol)}-{toRealSymbol(tokens[1].symbol)}
          </div>
          {expand ? null : (
            <div>
              <div className="col-span-2">
                TVL:{' '}
                <span className="text-greenLight1">
                  ${toPrecision(pool.tvl.toString(), 2, true)}
                </span>
              </div>
              <div className="col-span-2">{farmButton()}</div>
            </div>
          )}
        </div>

        <div className="relative w-20">
          <img
            key={tokens[0].id.substring(0, 12).substring(0, 12)}
            className="h-12 w-12 border rounded-full"
            src={tokens[0].icon}
          />
          <img
            key={tokens[1].id}
            className="h-7 w-7 absolute left-9 bottom-0 rounded-full"
            src={tokens[1].icon}
          />
        </div>
      </div>

      <div
        className={`bg-white rounded-b-lg grid gap-y-6 pt-4 pb-4 ${
          expand ? 'show' : 'hidden'
        }`}
      >
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-900">
            <FormattedMessage id="liquidity" defaultMessage="Liquidity" />
          </div>
          <div>
            <div>
              {toRealSymbol(tokens[0].symbol)}=
              {toPrecision(
                toReadableNumber(
                  tokens[0].decimals || 24,
                  pool.supplies[tokens[0].id]
                ),
                6,
                true
              )}
            </div>
            <div>
              {toRealSymbol(tokens[1].symbol)}=
              {toPrecision(
                toReadableNumber(
                  tokens[1].decimals || 24,
                  pool.supplies[tokens[1].id]
                ),
                6,
                true
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-900">
            <FormattedMessage id="tokens" defaultMessage="Tokens" />
          </div>
          <div>
            <p className="text-xs text-gray-500">
              {`${tokens[0].id.substring(0, 12)}${
                tokens[0].id.length > 12 ? '...' : ''
              }`}
              |
              {`${tokens[1].id.substring(0, 12)}${
                tokens[1].id.length > 12 ? '...' : ''
              }`}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-900">
            <FormattedMessage id="swap_rate" defaultMessage="Swap Rate" />
          </div>
          <div className="text-greenLight1">
            1&nbsp;{toRealSymbol(tokens[0].symbol)}&nbsp;
            {getExchangeRate(tokens, pool, pool.token0_ref_price, false)}
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-900">
            <FormattedMessage id="fee" defaultMessage="Fee" />
          </div>
          <div>{calculateFeePercent(pool.fee)}%</div>
        </div>
        <div className="text-center">
          <button
            className="rounded-full text-xs text-white px-5 py-2.5 focus:outline-none  bg-greenLight"
            onClick={() => {
              history.push(`/pool/${pool.id}`);
            }}
          >
            <FormattedMessage id="view_detail" defaultMessage="View Detail" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileLiquidityPage({
  pools,
  tokenName,
  order,
  hasMore,
  onSearch,
  onSortChange,
  onOrderChange,
  nextPage,
}: {
  pools: Pool[];
  tokenName: string;
  order: string;
  hasMore: boolean;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
}) {
  const intl = useIntl();
  return (
    <div className="flex items-center flex-col w-3/6 md:w-5/6 lg:w-5/6 xs:w-11/12 m-auto md:hidden lg:hidden xl:hidden xs:show">
      <div className="text-center pb-8">
        <div className="text-white text-3xl ">
          <FormattedMessage
            id="liquidity_pools"
            defaultMessage="Liquidity Pools"
          />
        </div>
        <div className="rounded-full w-1/5 xs:w-full border mt-4">
          <input
            className={`text-sm font-bold bg-inputBg focus:outline-none rounded-full w-full py-2 px-3 text-greenLight text-center`}
            placeholder={intl.formatMessage({ id: 'search_pools' })}
            value={tokenName}
            onChange={(evt) => onSearch(evt.target.value)}
          />
        </div>
      </div>
      <div
        id="poll-container"
        style={{
          width: '100%',
          height: '80vh',
          overflow: 'auto',
        }}
      >
        <InfiniteScroll
          scrollableTarget="poll-container"
          dataLength={pools.length}
          next={nextPage}
          hasMore={hasMore}
          loader={
            <h4 style={{ textAlign: 'center', color: 'white' }}>Loading...</h4>
          }
          pullDownToRefresh={false}
        >
          {pools.map((pool, i) => (
            <MobilePoolRow key={i} pool={pool} />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
}

function PoolRow({ pool, index }: { pool: Pool; index: number }) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const tokens = useTokens(pool.tokenIds);
  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(canFarm);
    });
  }, [pool]);
  if (!tokens) return <Loading />;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const farmButton = () => {
    if (supportFarm)
      return (
        <div className="px-0.5 ml-3 mr-2 text-xs text-center bg-gray-600 text-gray-400 inline-block rounded">
          <FormattedMessage id="farms" defaultMessage="Farms" />
        </div>
      );
    return '';
  };

  return (
    <Link
      title={`${tokens[0].id.substring(0, 12)}|${tokens[1].id.substring(
        0,
        12
      )}`}
      to={{
        pathname: `/pool/${pool.id}`,
        state: { tvl: pool.tvl },
      }}
      className="grid grid-cols-12 py-3 content-center text-base text-left mx-8  text-gray-600"
    >
      <div className="col-span-1">{index}</div>
      <div className="col-span-5 md:col-span-4 flex items-center">
        <div className="flex items-center">
          <img
            key={tokens[0].id.substring(0, 12).substring(0, 12)}
            className="h-9 w-9 border rounded-full mr-2"
            src={tokens[0].icon}
          />
          <img
            key={tokens[1].id}
            className="h-9 w-9 border rounded-full"
            src={tokens[1].icon}
          />
        </div>
        <div className="text-white text-lg ml-7">
          {tokens[0].symbol + '-' + tokens[1].symbol}
        </div>
        {farmButton()}
      </div>
      <div className="col-span-1 md:hidden ">
        {calculateFeePercent(pool.fee)}%
      </div>
      <div className="col-span-2 sm:col-span-4">
        <div className="mt-2"></div>
        <div>
          {toRealSymbol(tokens[1].symbol)}=
          {toInternationalCurrencySystem(
            toReadableNumber(
              tokens[1].decimals || 24,
              pool.supplies[tokens[1].id]
            )
          )}
        </div>
      </div>

      <div className="col-span-2">
        <div className="">
          ${toInternationalCurrencySystem(pool.tvl.toString())}
        </div>
      </div>
      <div className="col-span-1">More Pools</div>
    </Link>
  );
}

function LiquidityPage_({
  pools,
  tokenName,
  order,
  hasMore,
  onSearch,
  onSortChange,
  onOrderChange,
  nextPage,
}: {
  pools: Pool[];
  tokenName: string;
  order: string;
  hasMore: boolean;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
}) {
  const intl = useIntl();
  return (
    <div className="flex items-center flex-col whitespace-nowrap w-4/6 lg:w-5/6 xl:w-3/4 md:w-5/6 m-auto xs:hidden">
      <Card width="w-full" className="bg-cardBg" padding="py-7 px-0">
        <div className="pb-6 mx-8">
          <div className="text-white text-2xl ">
            <FormattedMessage
              id="liquidity_pools"
              defaultMessage="Liquidity Pools"
            />
          </div>
        </div>
        <div className="mx-8 flex items-center">
          <div className="text-gray-400 text-lg ">
            <FormattedMessage id="my_watchlist" defaultMessage="My Watchlist" />
          </div>
          <FaRegQuestionCircle
            data-type="dark"
            data-place="bottom"
            data-multiline={true}
            data-tip={intl.formatMessage({ id: 'myWatchList' })}
            className="inline-block	ml-2 text-sm  text-gray-500"
          />
          <ReactTooltip className="text-sm" />
        </div>
        <div className="my-4 border-b border-solid border-gray-600"></div>
        <div className="flex mx-8 justify-between pb-4">
          <div>
            <div className="">
              <div className="text-white text-lg">
                <FormattedMessage id="top_pools" defaultMessage="Top Pools" />
              </div>
            </div>
            <div className="">
              {/* 展示比例 */}
              <div></div>

              <FaRegQuestionCircle
                data-type="dark"
                data-place="bottom"
                data-multiline={true}
                data-tip={intl.formatMessage({ id: 'topPools' })}
                className="inline-block	ml-2 text-sm  text-gray-500"
              />
              <ReactTooltip className="text-sm" />
            </div>
          </div>
          <div className="flex items-center w-3/7">
            <div className="flex items-center">
              <div className=" text-gray-400 text-sm mr-10">
                {'Hide Low TVL Pools'}
              </div>
            </div>

            <div
              className="rounded w-full my-2 text-gray-400 flex items-center pr-2"
              style={{
                backgroundColor: ' rgba(0, 0, 0, 0.2)',
              }}
            >
              <input
                className={`text-sm outline-none rounded w-full py-2 px-3`}
                placeholder={intl.formatMessage({ id: 'search_pools' })}
                value={tokenName}
                onChange={(evt) => onSearch(evt.target.value)}
              />
              <FaSearch />
            </div>
          </div>
        </div>

        <section className="px-2">
          <header className="grid grid-cols-12 py-2 pb-4 text-left text-base text-gray-400 mx-8 border-b border-gray-600">
            <p className="col-span-1">
              <FormattedMessage id="id" defaultMessage="#" />
            </p>
            <p className="col-span-5 md:col-span-4">
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </p>
            <p
              className="col-span-1 md:hidden cursor-pointer"
              onClick={() => {
                onSortChange('fee');
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              <FormattedMessage id="fee" defaultMessage="Fee" />
            </p>
            <p className="col-span-2">
              <FormattedMessage id="24h_volume" defaultMessage="24h Volume" />
            </p>

            <div
              className="col-span-2"
              onClick={() => {
                onSortChange('tvl');
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              <span>
                <FormattedMessage id="tvl" defaultMessage="TVL" />
              </span>
            </div>
            <p className="col-span-1">
              <FormattedMessage id="more_pools" defaultMessage="More Pools" />
            </p>
          </header>
          <div className="max-h-96 overflow-y-auto">
            {pools.map((pool, i) => (
              <PoolRow key={i} pool={pool} index={i + 1} />
            ))}
          </div>
        </section>
        {hasMore && (
          <div className="flex items-center justify-center pt-5">
            <button
              className="rounded-full text-xs text-white px-5 py-2.5 focus:outline-none  bg-greenLight"
              onClick={nextPage}
            >
              More
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

export function LiquidityPage() {
  const [tokenName, setTokenName] = useState('');
  const [sortBy, setSortBy] = useState('tvl');
  const [order, setOrder] = useState('desc');
  const { pools, hasMore, nextPage } = usePools({
    tokenName,
    sortBy,
    order,
  });
  if (!pools) return <Loading />;

  return (
    <>
      <LiquidityPage_
        tokenName={tokenName}
        pools={pools}
        order={order}
        onOrderChange={setOrder}
        onSortChange={setSortBy}
        onSearch={setTokenName}
        hasMore={hasMore}
        nextPage={nextPage}
      />
      <MobileLiquidityPage
        tokenName={tokenName}
        pools={pools}
        order={order}
        onOrderChange={setOrder}
        onSortChange={setSortBy}
        onSearch={setTokenName}
        hasMore={hasMore}
        nextPage={nextPage}
      />
    </>
  );
}
