import React, { useState } from 'react';
import { Card } from '~components/card/Card';
import { usePools } from '../../state/pool';
import Loading from '~components/layout/Loading';
import { getPrice, useTokens } from '../../state/token';
import { Link } from 'react-router-dom';
import { Pool } from '../../services/pool';
import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
} from '../../utils/numbers';
import { FaRegQuestionCircle } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';

function PoolRow({ pool }: { pool: Pool }) {
  const tokens = useTokens(pool.tokenIds);
  if (!tokens) return <Loading />;

  const images = tokens.map((token) => {
    const { icon, id } = token;
    if (icon) return <img key={id} className="h-6 w-6" src={icon} />;
    return <div key={id} className="h-6 w-6 rounded-full border"></div>;
  });

  return (
    <Link
      to={`/pool/${pool.id}`}
      className="grid grid-cols-12 md:flex xs:flex md:justify-between xs:justify-between md:flex-wrap xs:flex-wrap py-2 content-center text-xs font-semibold text-gray-600"
    >
      <div className="lg:grid grid-cols-2 col-span-1 md:flex xs:flex md:items-center md:gap-x-1 xs:gap-x-1">
        {images}
      </div>
      <p className="grid grid-cols-2 col-span-5 md:flex xs:flex md:items-center xs:gap-x-1">
        <span>
          {tokens[0].symbol}=
          {toPrecision(
            toReadableNumber(
              tokens[0].decimals || 24,
              pool.supplies[pool.tokenIds[0]]
            ),
            4
          )}
        </span>
        <span>
          {tokens[1].symbol}=
          {toPrecision(
            toReadableNumber(
              tokens[1].decimals || 24,
              pool.supplies[pool.tokenIds[1]]
            ),
            4
          )}
        </span>
      </p>
      <p className="col-span-2 md:flex xs:flex">
        {getPrice(tokens, pool, pool.token0_ref_price, false)}
      </p>
      <p className="col-span-2 md:flex xs:flex">${pool.tvl}</p>
      <p className="col-span-2 md:flex xs:flex">
        {calculateFeePercent(pool.fee)}%
      </p>
    </Link>
  );
}

export function LiquidityPage() {
  const [tokenName, setTokenName] = useState('');
  const [sortBy, setSoryBy] = useState('tvl');
  const [order, setOrder] = useState('desc');
  const { pools, hasMore, nextPage } = usePools({
    tokenName,
    sortBy,
    order,
    useIndexerData: true,
  });
  if (!pools) return <Loading />;

  return (
    <div className="flex items-center flex-col w-3/6 md:w-5/6 xs:w-11/12 m-auto">
      <div className="text-center pb-8">
        <div className="text-white text-3xl font-semibold">Liquidity Pools</div>
      </div>
      <Card width="w-full">
        <div className="flex items-center justify-end pb-4">
          <div className="rounded-lg w-1/5 xs:w-full border my-2">
            <input
              className={`text-sm font-bold bg-inputBg focus:outline-none rounded-lg w-full py-2 px-3 text-greenLight`}
              placeholder="Search pools..."
              value={tokenName}
              onChange={(evt) => setTokenName(evt.target.value)}
            />
          </div>
        </div>
        <section>
          <header className="grid grid-cols-12 xs:flex xs:justify-between py-2 pb-4 text-left text-sm font-bold">
            <p className="col-span-1">Pair</p>
            <p className="col-span-5">Liquidity</p>
            <p className="col-span-2">Market Price</p>
            <div
              className="col-span-2"
              onClick={() => {
                setSoryBy('tvl');
                setOrder(order === 'desc' ? 'asc' : 'desc');
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
              className="col-span-2 cursor-pointer"
              onClick={() => {
                setSoryBy('fee');
                setOrder(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              Fee
            </p>
          </header>
          <div className="max-h-80 overflow-y-auto">
            {pools.map((pool, i) => (
              <PoolRow key={i} pool={pool} />
            ))}
            {pools.length === 0 ? (
              <div className="text-center text-xs font-semibold py-4">
                No match pool
              </div>
            ) : (
              ''
            )}
          </div>
        </section>
        {hasMore && (
          <div className="flex items-center justify-center pt-5">
            <button
              className="rounded-full text-xs text-white px-3 py-1.5 focus:outline-none font-semibold bg-greenLight"
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
