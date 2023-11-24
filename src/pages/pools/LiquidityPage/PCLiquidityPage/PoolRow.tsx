import { Pool } from 'src/services/pool';
import { TokenMetadata } from 'src/services/ft-contract';
import { useTokens } from 'src/state/token';
import { useHistory } from 'react-router';
import React, { useContext, useState } from 'react';
import { sort_tokens_by_base } from 'src/services/commonV3';
import { Link } from 'react-router-dom';
import { Images } from 'src/components/stableswap/CommonComp';
import { ALL_STABLE_POOL_IDS } from 'src/services/near';
import { WatchListStartFull } from 'src/components/icon/WatchListStar';
import { FarmStampNew } from 'src/components/icon';
import {
  calculateFeePercent,
  scientificNotationToString,
  toInternationalCurrencySystem,
  toPrecision,
} from 'src/utils/numbers';
import { getPoolFeeApr, getPoolListFarmAprTip } from 'src/pages/pools/utils';
import ReactTooltip from 'react-tooltip';
import { TokenPriceListContext } from '../constLiquidityPage';

export default function PoolRow({
  pool,
  index,
  selectCoinClass,
  tokens,
  morePoolIds,
  supportFarm,
  farmCount,
  // h24volume,
  watched,
  mark,
  farmApr,
}: {
  pool: Pool;
  index: number;
  selectCoinClass?: string;
  tokens?: TokenMetadata[];
  morePoolIds: string[];
  supportFarm: boolean;
  farmCount: number;
  // h24volume: string;
  watched?: boolean;
  mark?: boolean;
  farmApr?: number;
}) {
  // console.log("tokenstokens",tokens,pool.tokenIds)
  const { token_symbols, volume24hinUSD, apr } = pool || {};
  const curRowTokens = useTokens(pool.tokenIds, tokens);
  const history = useHistory();
  const [showLinkArrow, setShowLinkArrow] = useState(false);
  // console.log("curRowTokenscurRowTokens",curRowTokens)
  const { indexFail } = useContext(TokenPriceListContext);

  if (!curRowTokens) return <></>;

  tokens = sort_tokens_by_base(curRowTokens);
  const h24volume = volume24hinUSD;

  return (
    <div className="w-full hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20">
      <Link
        className={`grid grid-cols-${
          mark ? 6 : 7
        } py-3.5 text-white content-center text-sm text-left mx-8 border-b border-gray-700 border-opacity-70 hover:opacity-80`}
        onClick={() => localStorage.setItem('fromMorePools', 'n')}
        to={{
          pathname: `/pool/${pool.id}`,
          state: { tvl: pool.tvl, backToFarms: supportFarm },
        }}
        style={{
          height: '70px',
        }}
      >
        <div className="col-span-3 md:col-span-4 flex items-center">
          <div className="flex items-center">
            <Images tokens={tokens} size="8" />
            <div className="flex items-center">
              <div className="flex flex-wrap max-w-48 text-sm ml-3">
                <label>{token_symbols[0]}</label>-
                <label>{token_symbols[1]}</label>
                {token_symbols[2] ? <label>-{token_symbols[2]}</label> : null}
                {token_symbols[3] ? <label>-{token_symbols[3]}</label> : null}
              </div>
              {mark ? (
                <span className="text-xs text-v3SwapGray bg-watchMarkBackgroundColor px-2.5 py-px rounded-xl ml-2">
                  {ALL_STABLE_POOL_IDS.indexOf(pool.id.toString()) > -1
                    ? 'Stable'
                    : 'Classic'}
                </span>
              ) : null}
              {watched && (
                <div className="ml-2">
                  <WatchListStartFull />
                </div>
              )}
              {supportFarm && <FarmStampNew multi={farmCount > 1} />}
            </div>
          </div>
        </div>
        <div className="col-span-1 flex items-center justify-center justify-self-center py-1 md:hidden ">
          {calculateFeePercent(pool.fee)}%
        </div>
        <div
          className="col-span-1 flex flex-col items-center justify-self-center text-sm py-1"
          data-type="info"
          data-place="right"
          data-multiline={true}
          data-class={'reactTip'}
          data-html={true}
          data-tip={getPoolListFarmAprTip()}
          data-for={'pool_list_pc_apr' + pool.id}
        >
          {!h24volume ? '-' : `${apr}%`}
          {supportFarm &&
            !Number.isNaN(farmApr) &&
            farmApr !== null &&
            farmApr !== undefined &&
            farmApr > 0 &&
            h24volume && (
              <span className="text-xs text-gradientFrom">
                {`+${toPrecision((farmApr * 100).toString(), 2)}%`}
              </span>
            )}
          {supportFarm && farmApr > 0 && (
            <ReactTooltip
              className="w-20"
              id={'pool_list_pc_apr' + pool.id}
              backgroundColor="#1D2932"
              place="right"
              border
              borderColor="#7e8a93"
              textColor="#C6D1DA"
              effect="solid"
            />
          )}
        </div>

        <div
          className="col-span-1 flex items-center justify-center py-1 justify-self-center relative "
          title={h24volume}
        >
          {!h24volume
            ? '-'
            : Number(h24volume) == 0
            ? '$0'
            : Number(h24volume) < 0.01
            ? '$ <0.01'
            : `$${toInternationalCurrencySystem(h24volume)}`}
        </div>

        <div
          className="col-span-1 flex items-center justify-center py-1 justify-self-center relative left-4"
          title={toPrecision(
            scientificNotationToString(pool.tvl.toString()),
            0
          )}
        >
          {indexFail
            ? '-'
            : `${toInternationalCurrencySystem(pool.tvl.toString())}`}
        </div>

        {/*<div*/}
        {/*  className={`col-span-1 justify-self-center flex items-center justify-center py-1 hover:text-green-500 hover:cursor-pointer ${*/}
        {/*    mark ? 'hidden' : ''*/}
        {/*  }`}*/}
        {/*  onMouseEnter={() => setShowLinkArrow(true)}*/}
        {/*  onMouseLeave={() => setShowLinkArrow(false)}*/}
        {/*  onClick={(e) => {*/}
        {/*    e.preventDefault();*/}
        {/*    history.push(`/more_pools/${pool.tokenIds}`, {*/}
        {/*      morePoolIds: morePoolIds,*/}
        {/*      tokens,*/}
        {/*    });*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <span className="relative left-8">*/}
        {/*    {morePoolIds?.length ? `${morePoolIds?.length}` : '-'}*/}
        {/*    {showLinkArrow && ' >'}*/}
        {/*  </span>*/}
        {/*</div>*/}
      </Link>
    </div>
  );
}
