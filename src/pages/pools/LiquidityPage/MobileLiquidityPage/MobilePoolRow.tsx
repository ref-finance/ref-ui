import { Pool } from 'src/services/pool';
import { TokenMetadata } from 'src/services/ft-contract';
import { useInView } from 'react-intersection-observer';
import React, { useContext, useEffect, useState } from 'react';
import { TokenPriceListContext } from 'src/pages/pools/LiquidityPage/constLiquidityPage';
import { useHistory } from 'react-router';
import { openUrl, sort_tokens_by_base } from 'src/services/commonV3';
import {
  calculateFeePercent,
  toInternationalCurrencySystem,
  toPrecision,
} from 'src/utils/numbers';
import { getPoolFeeApr } from 'src/pages/pools/utils';
import { FormattedMessage } from 'react-intl';
import { RiArrowRightSLine } from 'src/components/reactIcons';
import { Link } from 'react-router-dom';
import { WatchListStartFull } from 'src/components/icon/WatchListStar';
import { ALL_STABLE_POOL_IDS } from 'src/services/near';
import { FarmStampNew, TokenRisk } from 'src/components/icon';
import {
  getGlobalWhitelist,
  get_auto_whitelisted_postfix,
} from '../../../../services/token';

function MobilePoolRow({
  pool,
  sortBy,
  watched,
  tokens,
  morePoolIds,
  supportFarm,
  h24volume,
  watchPool,
  mark,
  farmApr,
  farmCount,
}: {
  pool: Pool;
  sortBy: string;
  watched: Boolean;
  tokens?: TokenMetadata[];
  morePoolIds: string[];
  supportFarm: Boolean;
  h24volume: string;
  watchPool?: boolean;
  mark?: boolean;
  farmApr?: number;
  farmCount?: number;
}) {
  const { ref } = useInView();
  const curRowTokens = tokens;
  const [autoWhitelistedPostfix, setAutoWhitelistedPostfix] = useState([]);
  const [globalWhitelist, setGlobalWhitelist] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    const fetchAutoWhitelistedPostfix = async () => {
      try {
        const postfixes = await get_auto_whitelisted_postfix();
        const whitelist = await getGlobalWhitelist();
        setAutoWhitelistedPostfix(postfixes);
        setGlobalWhitelist(whitelist);
      } catch (error) {
        console.error('Failed to fetch auto whitelisted postfix:', error);
      }
    };
    fetchAutoWhitelistedPostfix();
  }, []);
  function getAtRiskTokenIdsForPool(poolTokens) {
    return poolTokens
      .filter(
        (token) =>
          autoWhitelistedPostfix.some((postfix) =>
            token.id.includes(postfix)
          ) && !globalWhitelist.includes(token.id)
      )
      .map((token) => token.id);
  }
  const { indexFail } = useContext(TokenPriceListContext);

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
      return indexFail ? '-' : toInternationalCurrencySystem(value.toString());
    else if (sortBy === 'fee') return `${calculateFeePercent(value)}%`;
    else if (sortBy === 'volume_24h')
      return !h24volume
        ? '-'
        : Number(h24volume) == 0
        ? '$0'
        : Number(h24volume) < 0.01
        ? '$ <0.01'
        : `$${toInternationalCurrencySystem(h24volume)}`;
    else if (sortBy === 'apr') return `${getPoolFeeApr(h24volume, pool)}%`;
  };

  const morePoolButton = !(
    morePoolIds?.length &&
    morePoolIds?.length > 1 &&
    !watchPool
  ) ? null : (
    <button
      className={
        morePoolIds?.length && morePoolIds?.length > 1 && !watchPool
          ? ' text-farmText bg-black flex items-center bg-opacity-20 rounded-lg text-xs max-w-min  whitespace-nowrap px-2 justify-between ml-2 py-0.5'
          : ''
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        history.push(`/more_pools/${pool.tokenIds}`, {
          morePoolIds,
          tokens,
        });
      }}
    >
      <span>
        {morePoolIds.length}
        &nbsp;
        <FormattedMessage
          id="pools"
          defaultMessage={'Pools'}
        ></FormattedMessage>
      </span>
      <span>
        <RiArrowRightSLine className="w-4 h-4 ml-1" />
      </span>
    </button>
  );
  const is_muti_tokens = curRowTokens?.length > 3;
  return (
    <div className="w-full hover:bg-poolRowHover overflow-x-hidden">
      <Link
        ref={ref}
        className="flex flex-col border-b border-gray-700 border-opacity-70 bg-cardBg w-full px-1.5 py-5 text-white"
        onClick={() => localStorage.setItem('fromMorePools', 'n')}
        to={{
          pathname: `/pool/${pool.id}`,
          state: { tvl: pool?.tvl, backToFarms: supportFarm },
        }}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div
              className={`flex items-center ${
                is_muti_tokens ? 'flex-wrap w-12' : ''
              } ${!!morePoolButton ? 'relative bottom-1' : ''}`}
            >
              <div
                className="h-6 w-6  border-2 border-watchMarkBackgroundColor rounded-full relative z-10"
                style={{
                  height: '26px',
                  width: '26px',
                }}
              >
                <img
                  key={curRowTokens?.[0]?.id.substring(0, 12).substring(0, 12)}
                  className="rounded-full w-full"
                  src={curRowTokens?.[0]?.icon}
                />
              </div>

              <div
                className="h-6 w-6 border-watchMarkBackgroundColor border-2 rounded-full -ml-1.5 relative z-10"
                style={{
                  height: '26px',
                  width: '26px',
                }}
              >
                <img
                  key={curRowTokens?.[1].id}
                  className="w-full rounded-full"
                  src={curRowTokens?.[1].icon}
                />
              </div>
              {curRowTokens?.[2] ? (
                <div
                  className={`h-6 w-6 z-30 border border-watchMarkBackgroundColor rounded-full ${
                    is_muti_tokens ? '-mt-2' : '-ml-1.5'
                  }`}
                  style={{
                    height: '26px',
                    width: '26px',
                  }}
                >
                  <img
                    key={curRowTokens[2].id}
                    className="w-full rounded-full"
                    src={curRowTokens[2].icon}
                  />
                </div>
              ) : null}
              {curRowTokens?.[3] ? (
                <div
                  className={`h-6 w-6 z-30 border border-watchMarkBackgroundColor rounded-full -ml-1.5 ${
                    is_muti_tokens ? '-mt-2' : ''
                  }`}
                  style={{
                    height: '26px',
                    width: '26px',
                  }}
                >
                  <img
                    key={curRowTokens[3].id}
                    className="w-full rounded-full"
                    src={curRowTokens[3].icon}
                  />
                </div>
              ) : null}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-start">
                <div className="flex items-center flex-wrap">
                  <div className="text-sm ml-2 font-semibold whitespace-nowrap mb-0.5">
                    {curRowTokens[0].symbol +
                      '-' +
                      curRowTokens[1].symbol +
                      `${curRowTokens[2] ? '-' + curRowTokens[2].symbol : ''}` +
                      `${curRowTokens[3] ? '-' + curRowTokens[3].symbol : ''}`}
                  </div>
                </div>
                {watched && !watchPool && (
                  <div className="ml-2">
                    <WatchListStartFull />
                  </div>
                )}
                {curRowTokens.map((token) => {
                  const isAtRisk = getAtRiskTokenIdsForPool(
                    curRowTokens
                  ).includes(token.id);
                  return isAtRisk ? (
                    <div
                      key={token.id}
                      className="ml-2 relative"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <span>
                        <TokenRisk />
                      </span>
                      {showTooltip && (
                        <div className="absolute -top-3 left-5 px-2 w-40 py-1.5 border border-borderColor text-farmText text-xs rounded-md bg-cardBg">
                          {token.symbol} is subjected to high volatility
                        </div>
                      )}
                    </div>
                  ) : null;
                })}
              </div>

              <div className="flex items-center relative top-0.5">
                {mark ? (
                  <span className="max-w-min  whitespace-nowrap text-xs text-v3SwapGray bg-watchMarkBackgroundColor px-2.5 py-px rounded-xl ml-2 mb-0.5">
                    {ALL_STABLE_POOL_IDS.indexOf(pool.id.toString()) > -1
                      ? 'Stable'
                      : 'Classic'}
                  </span>
                ) : null}
                {/*{morePoolButton}*/}
                <div
                  className="mr-2 relative bottom-0 px"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openUrl(`/v2farms/${pool.id}-r`);
                  }}
                >
                  {supportFarm && <FarmStampNew multi={farmCount > 1} />}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            {showSortedValue({ sortBy, value: pool[sortBy] })}
            {sortBy === 'apr' &&
              farmApr !== null &&
              farmApr !== undefined &&
              farmApr > 0 && (
                <div>
                  <span className="text-xs text-gradientFrom">
                    {`+${toPrecision((farmApr * 100).toString(), 2)}%`}
                  </span>
                </div>
              )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default MobilePoolRow;
