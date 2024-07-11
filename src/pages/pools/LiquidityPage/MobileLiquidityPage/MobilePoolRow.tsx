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
import { TknIcon } from 'src/components/icon/Common';

function MobilePoolRow({
  pool,
  sortBy,
  watched,
  tokens,
  supportFarm,
  h24volume,
  watchPool,
  mark,
  farmApr,
  farmCount,
}: {
  pool: any;
  sortBy: string;
  watched: Boolean;
  tokens?: TokenMetadata[];
  supportFarm: Boolean;
  h24volume: string;
  watchPool?: boolean;
  mark?: boolean;
  farmApr?: number;
  farmCount?: number;
}) {
  const { ref } = useInView();
  const { riskTokens } = useContext(TokenPriceListContext);
  const curRowTokens = tokens;
  const [showTooltip, setShowTooltip] = useState(false);
  const { indexFail } = useContext(TokenPriceListContext);
  const isTokenAtRisk = (token) => {
    return riskTokens.some((riskToken) => riskToken.id === token.id);
  };
  const history = useHistory();

  function formatNumber(value) {
    let formattedValue = value.toFixed(2); //
    if (formattedValue.endsWith('.00')) {
      //
      formattedValue = formattedValue.substring(0, formattedValue.length - 3);
    } else if (formattedValue.endsWith('0')) {
      // 0
      formattedValue = formattedValue.substring(0, formattedValue.length - 1);
    }
    return formattedValue;
  }

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
    else if (sortBy === 'fee')
      return `${
        Reflect.has(pool, 'farm_apy')
          ? formatNumber(pool.fee * 100)
          : calculateFeePercent(pool.fee)
      }%`;
    else if (sortBy === 'volume_24h')
      return !pool.volume_24h
        ? '-'
        : Number(pool.volume_24h) == 0
        ? '$0'
        : Number(pool.volume_24h) < 0.01
        ? '$ <0.01'
        : `$${toInternationalCurrencySystem(pool.volume_24h)}`;
    else if (sortBy === 'apr')
      return `${
        Number(pool.apy).toFixed(0) != '0'
          ? formatNumber(Number(pool.apy))
          : '0'
      }%`;
  };

  const is_muti_tokens = curRowTokens?.length > 3;
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
    <div className="w-full hover:bg-poolRowHover overflow-visible">
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
              className={`flex items-center relative bottom-1 ${
                is_muti_tokens ? 'flex-wrap w-12' : ''
              } `}
            >
              {/* <div
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
              </div> */}
              {curRowTokens.map((token, index) => {
                const atRisk = isTokenAtRisk(token);
                return (
                  <div
                    key={token.id}
                    className={`relative inline-block ${
                      index > 0 ? 'z-20' : 'z-10'
                    }`}
                  >
                    <div
                      className={`border-2 border-watchMarkBackgroundColor rounded-full relative ${
                        index > 0 ? '-ml-1.5' : ''
                      } ${index > 0 ? 'z-20' : 'z-10'}`}
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
                      <div
                        className={`absolute bottom-0 transform -translate-x-1/2 text-center z-50 ${
                          index > 0 ? 'left-1.5' : 'left-1/2'
                        } 
                       `}
                      >
                        <TknIcon className="transform scale-75" />
                      </div>
                    )}
                  </div>
                );
              })}
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
                <div className="flex items-center">
                  <div
                    className="text-sm ml-2 font-semibold whitespace-normal break-words mb-0.5"
                    style={{ maxWidth: '130px' }}
                  >
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
                {pool.top && (
                  <div
                    className="w-9 h-5 bg-greenLight text-black font-bold text-xs frcc"
                    style={{ borderRadius: ' 14px' }}
                  >
                    Top
                  </div>
                )}
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
