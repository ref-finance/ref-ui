import React, { useState, useEffect } from 'react';
import { FaRegQuestionCircle } from 'react-icons/fa';
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
} from '../../utils/numbers';
import { toRealSymbol } from '~utils/token';

function MobilePoolRow({ pool }: { pool: Pool }) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const tokens = useTokens(pool.tokenIds);
  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(canFarm);
    });
  }, []);
  const [expand, setExpand] = useState(false);
  const history = useHistory();

  if (!tokens) return <Loading />;

  const farmButton = () => {
    if (supportFarm)
      return (
        <div className="mt-1 px-1 py-0.5 px-1 mr-3 text-center bg-greenLight text-white font-bold inline-block rounded">
          Farms
        </div>
      );
    return '';
  };

  return (
    <div
      className={`flex items-top flex-col relative text-xs font-semibold text-gray-600 w-11/12 m-auto mb-2.5 pr-0`}
    >
      <div
        className={`flex justify-between p-4 rounded-lg ${
          expand ? 'bg-greenLight1' : 'bg-white'
        } ${expand ? 'rounded-b-none' : 'rounded-lg'}`}
        onClick={() => setExpand(!expand)}
      >
        <div className="flex flex-col justify-between">
          <div
            className={`text-base font-semibold ${
              expand ? 'text-white' : 'text-gray-800'
            }`}
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
            key={tokens[0].id}
            className="h-12 w-12 border rounded-full border-gray-300"
            src={tokens[0].icon}
          />
          <img
            key={tokens[1].id}
            className="h-7 w-7 absolute left-9 bottom-0 border rounded-full border-gray-300"
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
          <div className="text-sm text-gray-900">Liquidity</div>
          <div>
            <div>
              {toRealSymbol(tokens[0].symbol)}=
              {toPrecision(
                toReadableNumber(
                  tokens[0].decimals || 24,
                  pool.supplies[pool.tokenIds[0]]
                ),
                4,
                true
              )}
            </div>
            <div>
              {toRealSymbol(tokens[1].symbol)}=
              {toPrecision(
                toReadableNumber(
                  tokens[1].decimals || 24,
                  pool.supplies[pool.tokenIds[1]]
                ),
                4,
                true
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-900">Tokens</div>
          <div>
            <p className="text-xs text-gray-500">
              {tokens[0].id}|{tokens[1].id}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-900">Swap Rate</div>
          <div className="text-greenLight1">
            1&nbsp;{toRealSymbol(tokens[0].symbol)}&nbsp;
            {getExchangeRate(tokens, pool, pool.token0_ref_price, false)}
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-900">Fee</div>
          <div>{calculateFeePercent(pool.fee)}%</div>
        </div>
        <div className="text-center">
          <button
            className="rounded-full text-xs text-white px-5 py-2.5 focus:outline-none font-semibold bg-greenLight"
            onClick={() => {
              history.push(`/pool/${pool.id}`);
            }}
          >
            View Detail
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
  return (
    <div className="flex items-center flex-col w-3/6 md:w-5/6 xs:w-11/12 m-auto md:hidden lg:hidden xl:hidden xs:show">
      <div className="text-center pb-8">
        <div className="text-white text-3xl font-semibold">Liquidity Pools</div>
        <div className="rounded-full w-1/5 xs:w-full border mt-4">
          <input
            className={`text-sm font-bold bg-inputBg focus:outline-none rounded-full w-full py-2 px-3 text-greenLight text-center`}
            placeholder="Search pools..."
            value={tokenName}
            onChange={(evt) => onSearch(evt.target.value)}
          />
        </div>
      </div>
      <div
        id="poll-container"
        style={{
          width: '100%',
          height: '60vh',
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

function PoolRow({ pool }: { pool: Pool }) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const tokens = useTokens(pool.tokenIds);
  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(canFarm);
    });
  }, []);
  if (!tokens) return <Loading />;

  const farmButton = () => {
    if (supportFarm)
      return (
        <div className="mt-4 py-0.5 px-1 mr-3 ml-1 text-center bg-greenLight text-white font-bold inline-block rounded">
          Farms
        </div>
      );
    return '';
  };

  return (
    <Link
      title={`${tokens[0].id}|${tokens[1].id}`}
      to={{
        pathname: `/pool/${pool.id}`,
        state: { tvl: pool.tvl },
      }}
      className="grid grid-cols-12 py-2 content-center text-xs font-semibold text-gray-600"
    >
      <div className="col-span-1">
        <div className="relative">
          <img
            key={tokens[0].id}
            className="h-12 w-12 border rounded-full border-gray-300"
            src={tokens[0].icon}
          />
          <img
            key={tokens[1].id}
            className="h-7 w-7 absolute left-9 bottom-0 border rounded-full border-gray-300"
            src={tokens[1].icon}
          />
        </div>
      </div>
      <div className="col-span-1">{farmButton()}</div>
      <div className="col-span-4">
        <div className="mt-2">
          {toRealSymbol(tokens[0].symbol)}=
          {toPrecision(
            toReadableNumber(
              tokens[0].decimals || 24,
              pool.supplies[pool.tokenIds[0]]
            ),
            4,
            true
          )}
        </div>
        <div>
          {toRealSymbol(tokens[1].symbol)}=
          {toPrecision(
            toReadableNumber(
              tokens[1].decimals || 24,
              pool.supplies[pool.tokenIds[1]]
            ),
            4,
            true
          )}
        </div>
      </div>
      <div className="col-span-3">
        <div className="mt-4">
          1&nbsp;{toRealSymbol(tokens[0].symbol)}&nbsp;
          {getExchangeRate(tokens, pool, pool.token0_ref_price, false)}
        </div>
      </div>
      <div className="col-span-2">
        <div className="mt-4">${toPrecision(pool.tvl.toString(), 2, true)}</div>
      </div>
      <div className="col-span-1">
        <div className="mt-4">{calculateFeePercent(pool.fee)}%</div>
      </div>
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
  return (
    <div className="flex items-center flex-col w-3/6 md:w-5/6 m-auto xs:hidden">
      <div className="text-center pb-8">
        <div className="text-white text-3xl font-semibold">Liquidity Pools</div>
      </div>
      <Card width="w-full">
        <div className="flex items-center justify-end pb-4 px-2">
          <div className="rounded-lg w-1/5 xs:w-full border my-2">
            <input
              className={`text-sm font-bold bg-inputBg focus:outline-none rounded-lg w-full py-2 px-3 text-greenLight`}
              placeholder="Search pools..."
              value={tokenName}
              onChange={(evt) => onSearch(evt.target.value)}
            />
          </div>
        </div>
        <section className="px-2">
          <header className="grid grid-cols-12 py-2 pb-4 text-left text-sm font-bold">
            <p className="col-span-2">Pair</p>
            <p className="col-span-4">Liquidity</p>
            <p className="col-span-3">Swap Rate</p>
            <div
              className="col-span-2"
              onClick={() => {
                onSortChange('tvl');
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              <span>TVL</span>
              <FaRegQuestionCircle
                data-type="dark"
                data-place="bottom"
                data-multiline={true}
                data-tip={'Total Value Locked'}
                className="inline-block	ml-2 text-xs font-semibold text-secondaryScale-500"
              />
              <ReactTooltip className="text-xs font-light" />
            </div>
            <p
              className="col-span-1 cursor-pointer"
              onClick={() => {
                onSortChange('fee');
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              Fee
            </p>
          </header>
          <div className="max-h-80 overflow-y-auto">
            {pools.map((pool, i) => (
              <PoolRow key={i} pool={pool} />
            ))}
          </div>
        </section>
        {hasMore && (
          <div className="flex items-center justify-center pt-5">
            <button
              className="rounded-full text-xs text-white px-5 py-2.5 focus:outline-none font-semibold bg-greenLight"
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
    useIndexerData: true,
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
