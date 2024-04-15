import { Pool } from 'src/services/pool';
import React, { useContext, useEffect, useState } from 'react';
import { PoolData, useAllStablePoolData } from 'src/state/sauce';
import {
  BTC_CLASS_STABLE_POOL_IDS,
  NEAR_CLASS_STABLE_POOL_IDS,
  USD_CLASS_STABLE_POOL_IDS,
  USDTT_USDCC_USDT_USDC_POOL_ID,
  USDT_USDC_POOL_ID,
  FRAX_USDC_POOL_ID,
} from 'src/services/near';
import _, { find } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
  BTC_TEXT,
  DownArrowLight,
  FarmStampNew,
  NEAR_TEXT,
  TokenRisk,
  UpArrowLight,
  USD_TEXT,
} from 'src/components/icon';
import { getPoolFeeAprTitle } from 'src/pages/pools/LiquidityPage/LiquidityPage';
import Loading from 'src/components/layout/Loading';
import { formatePoolData } from 'src/pages/stable/StableSwapEntry';
import { useYourliquidity } from 'src/state/pool';
import { useWalletSelector } from 'src/context/WalletSelectorContext';
import { useCanFarmV2 } from 'src/state/farm';
import { useHistory } from 'react-router';
import { useClientMobile } from 'src/utils/device';
import { Link } from 'react-router-dom';
import {
  Images,
  Symbols,
  TknImages,
} from 'src/components/stableswap/CommonComp';
import { WatchListStartFull } from 'src/components/icon/WatchListStar';
import { openUrl } from 'src/services/commonV3';
import { getPoolFeeApr, getPoolListFarmAprTip } from 'src/pages/pools/utils';
import {
  checkAllocations,
  percent,
  scientificNotationToString,
  toInternationalCurrencySystem,
  toPrecision,
} from 'src/utils/numbers';
import { ShareInFarm } from 'src/components/layout/ShareInFarm';
import { OutlineButton, SolidButton } from 'src/components/button/Button';
import { TokenMetadata } from 'src/services/ft-contract';
import BigNumber from 'bignumber.js';
import { Cell, Pie, PieChart, Sector } from 'recharts';
import getConfig from 'src/services/config';
import Big from 'big.js';
import { BLACK_TOKEN_IDS_IN_POOL } from '../LiquidityPage/LiquidityPage';
import { TokenPriceListContext } from '../LiquidityPage/constLiquidityPage';

function StablePoolList({
  searchBy,
  volumes,
  watchPools,
  farmCounts,
  farmAprById,
}: {
  searchBy: string;
  volumes: Record<string, string>;
  watchPools: Pool[];
  farmCounts: Record<string, number>;
  farmAprById: Record<string, number>;
}) {
  const [option, setOption] = useState<string>('ALL');

  const [orderStable, setorderStable] = useState<string>('desc');

  const [sortBy, setSortBy] = useState<string>('tvl');

  const [clicked, setClicked] = useState<boolean>(false);

  let allStablePoolData = useAllStablePoolData();

  if (!allStablePoolData || allStablePoolData.some((pd) => !pd))
    return <Loading />;
  allStablePoolData = _.filter(allStablePoolData, (pool) =>
    pool?.tokens?.every((token) => !BLACK_TOKEN_IDS_IN_POOL.includes(token.id))
  );
  const filterFunc = (p: PoolData) => {
    const b1 =
      option === 'ALL'
        ? true
        : option === 'NEAR'
        ? NEAR_CLASS_STABLE_POOL_IDS.includes(p.pool.id.toString())
        : option === 'USD'
        ? USD_CLASS_STABLE_POOL_IDS.includes(p.pool.id.toString())
        : BTC_CLASS_STABLE_POOL_IDS.includes(p.pool.id.toString());
    const b2 = p.tokens.some((t) =>
      _.includes(t.symbol.toLowerCase(), searchBy.toLowerCase())
    );

    return b1 && b2;
  };
  const pinned_pool_ids = [USDTT_USDCC_USDT_USDC_POOL_ID, FRAX_USDC_POOL_ID];
  const sortingFunc = (p1: PoolData, p2: PoolData) => {
    const v1 = Number(p1?.poolTVL?.toString() || 0);
    const v2 = Number(p2?.poolTVL?.toString() || 0);

    const vol1 = Number(volumes[p1.pool.id.toString()] || '0');
    const vol2 = Number(volumes[p2.pool.id.toString()] || '0');

    const standPool1 = p1.pool;
    standPool1.tvl = p1.poolTVL;

    const standPool2 = p2.pool;
    standPool2.tvl = p2.poolTVL;

    const apr1 =
      getPoolFeeAprTitle(vol1.toString(), standPool1) +
      (farmAprById?.[p1.pool.id] || 0) * 100;

    const apr2 =
      getPoolFeeAprTitle(vol2.toString(), standPool2) +
      (farmAprById?.[p2.pool.id] || 0) * 100;

    const is_p1_sort_top = pinned_pool_ids.includes(p1.pool.id);
    const is_p2_sort_top = pinned_pool_ids.includes(p2.pool.id);

    if (is_p1_sort_top) return -1;
    if (is_p2_sort_top) return 1;

    if (orderStable === 'desc') {
      if (sortBy === 'tvl') {
        return v2 - v1;
      } else if (sortBy == 'apr') {
        return apr2 - apr1;
      } else {
        return vol2 - vol1;
      }
    } else {
      if (sortBy === 'tvl') {
        return v1 - v2;
      } else if (sortBy == 'apr') {
        return apr1 - apr2;
      } else {
        return vol1 - vol2;
      }
    }
  };

  return (
    <>
      <div className=" grid grid-cols-6 relative mb-4 xs:mb-2 md:mb-2 items-center">
        <div className="flex items-center col-span-2 xsm:w-full">
          {['ALL', 'USD', 'BTC', 'NEAR'].map((o) => {
            return (
              <button
                key={o + '-stable-pool-type'}
                className={`text-sm xs:text-base md:text-base flex px-3 mr-3 py-1 rounded-xl items-center justify-center  ${
                  option === o ? 'bg-cardBg text-white' : 'text-primaryText'
                } `}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOption(o);
                }}
              >
                {o}
              </button>
            );
          })}
        </div>

        <div className="col-span-4 grid grid-cols-5 items-center xsm:hidden text-primaryText ">
          <div className="col-span-1 relative flex items-center justify-self-center text-sm">
            <span
              className={`pr-1 cursor-pointer
              
              ${sortBy !== 'apr' ? 'hover:text-white' : 'text-gradientFrom'}
    
              `}
              onClick={() => {
                setClicked(true);
                setSortBy('apr');

                setorderStable(
                  orderStable === 'desc' && sortBy === 'apr' ? 'asc' : 'desc'
                );
              }}
            >
              <FormattedMessage id="apr" defaultMessage="APR" />
            </span>
            <span
              className={`cursor-pointer ${sortBy !== 'apr' ? 'hidden' : ''} `}
              onClick={() => {
                setClicked(true);
                setSortBy('apr');
                setorderStable(
                  orderStable === 'desc' && sortBy === 'apr' ? 'asc' : 'desc'
                );
              }}
            >
              {orderStable === 'desc' && sortBy === 'apr' ? (
                <DownArrowLight />
              ) : (
                <UpArrowLight />
              )}
            </span>
          </div>
          <div className="col-span-1 relative flex items-center justify-self-center text-sm">
            <span
              className={`pr-1 cursor-pointer
              
              ${
                sortBy !== 'volume_24h'
                  ? 'hover:text-white'
                  : 'text-gradientFrom'
              }
    
              `}
              onClick={() => {
                setClicked(true);
                setSortBy('volume_24h');

                setorderStable(
                  orderStable === 'desc' && sortBy === 'volume_24h'
                    ? 'asc'
                    : 'desc'
                );
              }}
            >
              <FormattedMessage id="volume_24h" defaultMessage="Volume (24h)" />
            </span>
            <span
              className={`cursor-pointer ${
                sortBy !== 'volume_24h' ? 'hidden' : ''
              } `}
              onClick={() => {
                setClicked(true);
                setSortBy('volume_24h');
                setorderStable(
                  orderStable === 'desc' && sortBy === 'volume_24h'
                    ? 'asc'
                    : 'desc'
                );
              }}
            >
              {orderStable === 'desc' && sortBy === 'volume_24h' ? (
                <DownArrowLight />
              ) : (
                <UpArrowLight />
              )}
            </span>
          </div>

          <div className={`col-span-3 pl-4 relative inline-flex items-center`}>
            <span
              className={`pr-1 cursor-pointer
              ${sortBy !== 'tvl' ? 'hover:text-white' : 'text-gradientFrom'}
              `}
              onClick={() => {
                setClicked(true);
                setSortBy('tvl');

                setorderStable(
                  orderStable === 'desc' && sortBy === 'tvl' ? 'asc' : 'desc'
                );
              }}
            >
              <FormattedMessage id="tvl" defaultMessage="TVL" />
            </span>
            <span
              className={`cursor-pointer ${sortBy !== 'tvl' ? 'hidden' : ''}`}
              onClick={() => {
                setClicked(true);
                setSortBy('tvl');

                setorderStable(
                  orderStable === 'desc' && sortBy === 'tvl' ? 'asc' : 'desc'
                );
              }}
            >
              {orderStable === 'desc' && sortBy === 'tvl' ? (
                <DownArrowLight />
              ) : (
                <UpArrowLight />
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col text-white mb-4">
        {allStablePoolData
          .filter(filterFunc)
          .sort(sortingFunc)
          .map((pd, i) => {
            return (
              <StablePoolCard
                key={pd.pool.id.toString() + i + '-list-render'}
                poolData={pd}
                h24volume={volumes[pd.pool.id.toString()]}
                watched={!!find(watchPools, { id: pd.pool.id })}
                supportFarm={farmCounts && !!farmCounts[pd.pool.id]}
                farmApr={farmAprById ? farmAprById[pd.pool.id] : null}
              />
            );
          })}
      </div>
    </>
  );
}

function StablePoolCard({
  poolData,
  h24volume,
  watched,
  supportFarm,
  farmApr,
}: {
  poolData: PoolData;
  h24volume: string;
  watched?: boolean;
  supportFarm: boolean;
  farmApr: number;
}) {
  const formattedPool = formatePoolData(poolData);
  const standPool = poolData.pool;
  standPool.tvl = poolData.poolTVL;
  const { riskTokens } = useContext(TokenPriceListContext);
  const curRowTokens = poolData.tokens;
  const [showTooltip, setShowTooltip] = useState(false);
  const isTokenAtRisk = (token) => {
    return riskTokens.some((riskToken) => riskToken.id === token.id);
  };

  const [hover, setHover] = useState<boolean>(false);

  const { shares, farmStakeV1, farmStakeV2, userTotalShare } = useYourliquidity(
    poolData.pool.id
  );

  const [chartActiveToken, setChartActiveToken] = useState<string>();

  const { accountId } = useWalletSelector();

  const isSignedIn = !!accountId;
  const { farmCount: countV2, endedFarmCount: endedFarmCountV2 } = useCanFarmV2(
    poolData.pool.id,
    true
  );

  const haveFarm = countV2 > endedFarmCountV2;

  const onlyEndedFarmsV2 = endedFarmCountV2 === countV2;
  const history = useHistory();

  const isMobile = useClientMobile();
  const is_new_pool =
    poolData.pool.id == USDTT_USDCC_USDT_USDC_POOL_ID ||
    poolData.pool.id == USDT_USDC_POOL_ID ||
    poolData.pool.id == FRAX_USDC_POOL_ID;

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
    <div
      className="mb-4 xs:mb-2 md:mb-2"
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <Link
        to={`/sauce/${poolData.pool.id}`}
        className={`${
          hover || isMobile ? 'bg-v3HoverDarkBgColor' : 'bg-cardBg'
        } relative z-20 rounded-xl  xsm:rounded-t-xl xsm:rounded-b-none w-full h-28 xsm:h-20 lg:grid lg:grid-cols-6 overflow-hidden xsm:flex xsm:items-center xsm:justify-between xsm:pr-3`}
        onMouseEnter={() => {
          setHover(true);
        }}
      >
        {is_new_pool ? <NewTag /> : null}
        <StablePoolClassIcon id={poolData.pool.id.toString()} />
        <div
          className={`col-span-2 pl-8 xsm:pl-4 xs:w-full md:w-full ${
            haveFarm
              ? 'xs:relative xs:top-1 xs:items-start md:relative md:top-1 md:items-start'
              : ''
          }  flex items-center   xs:justify-between md:justify-between`}
        >
          <div className="flex items-center">
            <TknImages
              tokens={poolData.tokens}
              size="8"
              className={`mr-4 ${is_new_pool ? 'xsm:ml-4 xsm:mr-0' : ''}`}
              layout="vertical"
              layoutSize="16"
            />
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
          <div className="flex xs:flex-col xs:items-end items-center">
            <div className="flex items-center">
              <Symbols
                fontSize="text-sm"
                tokens={poolData.tokens}
                separator="-"
                className="lg:min-w-48 lg:flex-wrap"
              />
              {watched && (
                <div className="xsm:ml-1">
                  <WatchListStartFull />
                </div>
              )}
            </div>

            <span
              className="xs:relative md:relative xs:top-1 md:top-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openUrl(
                  `/v2farms/${poolData.pool.id}-${onlyEndedFarmsV2 ? 'e' : 'r'}`
                );
              }}
            >
              {haveFarm && (
                <FarmStampNew multi={countV2 - endedFarmCountV2 > 1} />
              )}
            </span>
          </div>
        </div>

        <div className="col-span-4 grid grid-cols-5 items-center xs:hidden md:hidden">
          <div
            className="col-span-1 flex flex-col items-center justify-self-center text-sm"
            data-type="info"
            data-place="right"
            data-multiline={true}
            data-class={'reactTip'}
            data-html={true}
            data-tip={getPoolListFarmAprTip()}
            data-for={'pool_list_pc_apr' + poolData.pool.id}
          >
            {!h24volume ? '-' : `${getPoolFeeApr(h24volume, standPool)}%`}
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
          </div>
          <div
            className="col-span-1 justify-self-center text-sm"
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

          <div className="col-span-2 flex flex-col flex-shrink-0 relative lg:pl-4">
            <div
              className="col-span-1 py-1 text-sm "
              title={toPrecision(
                poolData.poolTVL === undefined
                  ? '-'
                  : scientificNotationToString(poolData.poolTVL.toString()),
                0
              )}
            >
              $
              {poolData.poolTVL === undefined
                ? '-'
                : toInternationalCurrencySystem(poolData.poolTVL.toString())}
            </div>

            <RenderDisplayTokensAmounts
              tokens={poolData.tokens}
              coinsAmounts={formattedPool.coinsAmounts}
              chartActiveToken={chartActiveToken}
              setChartActiveToken={setChartActiveToken}
            />
          </div>

          <div className="absolute xl:right-8 lg:right-4 xs:hidden md:hidden">
            <TokenChart
              tokens={poolData.tokens}
              coinsAmounts={formattedPool.coinsAmounts}
              tokensMap={poolData.tokens.reduce(
                (acc, cur, i) => ({ ...acc, [cur.id]: cur }),
                {}
              )}
              activeToken={chartActiveToken}
            />
          </div>
        </div>
      </Link>

      <div
        className={`w-full justify-between text-sm rounded-b-xl z-10 relative pt-7 pb-3 bottom-3 px-8 xs:px-5 md:px-5 bg-cardBg flex xs:flex-col md:flex-col items-center ${
          !hover && !isMobile ? 'hidden' : ''
        }`}
      >
        <div className="lg:hidden w-full flex  justify-between text-sm text-white">
          <div className="text-xs text-v3SwapGray">
            <FormattedMessage id="apr" defaultMessage={'APR'} />
          </div>

          <div className="flex flex-col items-end ">
            {!h24volume ? '-' : `${getPoolFeeApr(h24volume, standPool)}%`}{' '}
            {supportFarm}
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
          </div>
        </div>
        <div className="lg:hidden w-full mt-2 flex  justify-between text-sm text-white">
          <div className="text-xs text-v3SwapGray">
            <FormattedMessage id="tvl" defaultMessage={'TVL'} />
          </div>

          <div className="flex flex-col items-end ">
            <span
              title={
                poolData.poolTVL === undefined
                  ? '-'
                  : toPrecision(
                      scientificNotationToString(poolData.poolTVL.toString()),
                      0
                    )
              }
            >
              $
              {poolData.poolTVL === undefined
                ? '-'
                : toInternationalCurrencySystem(poolData.poolTVL.toString())}
            </span>

            <RenderDisplayTokensAmounts
              tokens={poolData.tokens}
              coinsAmounts={formattedPool.coinsAmounts}
            />
          </div>
        </div>

        <div className="lg:hidden w-full mt-2 flex justify-between text-sm text-white">
          <div className="text-xs text-v3SwapGray">
            <FormattedMessage id="volume_24h" defaultMessage={'Volume (24h)'} />
          </div>

          <div title={h24volume}>
            {!h24volume
              ? '-'
              : Number(h24volume) == 0
              ? '$0'
              : Number(h24volume) < 0.01
              ? '$ <0.01'
              : `$${toInternationalCurrencySystem(h24volume)}`}
          </div>
        </div>

        <div className="flex items-center xs:hidden md:hidden">
          <div className="text-primaryText text-base">
            <FormattedMessage id="your_shares" defaultMessage="Your Shares" />
          </div>

          <div className="text-sm ml-5 mr-2.5 text-white">
            {formattedPool.displayMyShareAmount}
          </div>
          <div className="text-primaryText mr-4">
            {formattedPool.displaySharePercent}
          </div>

          <div
            className={`cursor-pointer ${!haveFarm ? 'hidden' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              openUrl(
                `/v2farms/${poolData.pool.id}-${onlyEndedFarmsV2 ? 'e' : 'r'}`
              );
            }}
          >
            <ShareInFarm
              farmStake={farmStakeV2}
              userTotalShare={userTotalShare}
              forStable
            />
          </div>
        </div>

        <div className="flex xs:hidden md:hidden items-center">
          <SolidButton
            className={`w-full rounded-lg text-center  flex items-center justify-center h-9 min-w-40  py-1 mr-2 text-sm`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push(`/sauce/${poolData.pool.id}`, {
                stableTab: 'add_liquidity',
                shares,
                pool: poolData.pool,
              });
            }}
          >
            <FormattedMessage
              id="add_liquidity"
              defaultMessage="Add Liquidity"
            />
          </SolidButton>
          <OutlineButton
            className="w-full py-1  min-w-40 ml-2 text-sm  h-9 rounded-lg flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push(`/sauce/${poolData.pool.id}`, {
                stableTab: 'remove_liquidity',
                shares,
                pool: poolData.pool,
              });
            }}
          >
            <FormattedMessage
              id="remove_liquidity"
              defaultMessage="Remove Liquidity"
            />
          </OutlineButton>
        </div>
      </div>
    </div>
  );
}

const RenderDisplayTokensAmounts = ({
  tokens,
  coinsAmounts,
  chartActiveToken,
  setChartActiveToken,
}: {
  tokens: TokenMetadata[];
  coinsAmounts: { [id: string]: BigNumber };
  chartActiveToken?: string;
  setChartActiveToken?: (token: string) => void;
}) => {
  return (
    <div className="flex items-center  flex-shrink-0 xs:-mr-1.5 md:-mr-1.5 flex-wrap xsm:justify-end lg:w-60">
      {tokens.map((token, i) => {
        return (
          <span
            className={`flex   `}
            key={token.id + 'pool_page_stable_pool'}
            onMouseEnter={() => {
              setChartActiveToken && setChartActiveToken(token.id);
            }}
            onMouseLeave={() => {
              setChartActiveToken('');
            }}
          >
            {i ? (
              <span className="mx-1.5 py-1.5 text-primaryText ">+</span>
            ) : null}
            <span
              className={`flex px-1.5 rounded-lg py-1.5 items-center ${
                chartActiveToken === token.id
                  ? 'bg-black bg-opacity-20 text-white'
                  : 'text-primaryText'
              }`}
            >
              <span className="mr-1.5 flex-shrink-0">
                <img
                  src={token.icon}
                  alt=""
                  className="w-4 h-4 border border-gradientFrom rounded-full flex-1 flex-shrink-0"
                />
              </span>

              <span
                className=" text-sm"
                title={toPrecision(
                  scientificNotationToString(coinsAmounts[token.id].toString()),
                  0
                )}
              >
                {toInternationalCurrencySystem(
                  scientificNotationToString(coinsAmounts[token.id].toString())
                )}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
};

const StablePoolClassIcon = ({ id }: { id: string }) => {
  const stableClassIcon = NEAR_CLASS_STABLE_POOL_IDS.includes(id) ? (
    <NEAR_TEXT />
  ) : USD_CLASS_STABLE_POOL_IDS.includes(id) ? (
    <USD_TEXT />
  ) : (
    <BTC_TEXT />
  );

  const isMobile = useClientMobile();

  return <div className="absolute top-0  left-5">{stableClassIcon}</div>;
};

function NewTag() {
  return (
    <svg
      className="absolute left-0 top-0"
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 12C0 5.37258 5.37258 0 12 0H50L0 50V12Z" fill="#00FFD1" />
      <path
        d="M12.9744 28.9164L6.36159 22.3036L7.45053 21.2146L16.1027 22.8975L10.9352 17.73L11.935 16.7302L18.5479 23.343L17.449 24.4419L8.78696 22.749L13.9644 27.9265L12.9744 28.9164ZM22.3763 19.7126C21.9077 20.1812 21.3929 20.5112 20.8319 20.7026C20.271 20.8807 19.7034 20.9005 19.1292 20.762C18.5485 20.6168 17.9974 20.2835 17.476 19.7621C16.981 19.2671 16.6544 18.7359 16.496 18.1683C16.3442 17.5941 16.3442 17.0331 16.496 16.4854C16.6544 15.931 16.9513 15.436 17.3869 15.0004C17.8489 14.5385 18.334 14.2316 18.8421 14.0798C19.3503 13.9148 19.8486 13.8917 20.337 14.0105C20.8253 14.1293 21.2609 14.3801 21.6437 14.7629C21.7559 14.8751 21.8615 15.0136 21.9605 15.1786C22.0661 15.337 22.1321 15.4822 22.1585 15.6142L18.6936 19.079C19.017 19.3364 19.3503 19.4981 19.6935 19.5641C20.0367 19.6301 20.3766 19.6004 20.7131 19.475C21.0431 19.343 21.3599 19.1252 21.6635 18.8217C21.9671 18.5181 22.1882 18.2046 22.3268 17.8812C22.472 17.5512 22.5677 17.1915 22.6138 16.8022L23.6434 17.1585C23.5972 17.6271 23.4685 18.0792 23.2573 18.5148C23.0461 18.9371 22.7524 19.3364 22.3763 19.7126ZM17.971 18.3564L20.634 15.6934C20.6274 15.6736 20.6175 15.6571 20.6043 15.6439C20.5845 15.6241 20.5647 15.6043 20.5449 15.5845C20.3271 15.3667 20.0928 15.2248 19.842 15.1588C19.5846 15.0862 19.3173 15.0961 19.0401 15.1885C18.7629 15.2809 18.4825 15.469 18.1987 15.7528C17.9743 15.9772 17.8126 16.2379 17.7136 16.5349C17.6146 16.8187 17.5849 17.1189 17.6245 17.4357C17.6641 17.7393 17.7796 18.0462 17.971 18.3564ZM26.322 15.5689L20.0358 12.5496L21.0357 11.5497L25.629 13.9256L23.3125 9.27282L24.1837 8.40166L28.8266 10.728L26.4606 6.12478L27.4703 5.11503L30.4798 11.4111L29.5591 12.3318L24.9361 10.0252L27.2426 14.6482L26.322 15.5689Z"
        fill="#181A27"
      />
    </svg>
  );
}

function TokenChart({
  tokens,
  coinsAmounts,
  tokensMap,
  activeToken,
}: {
  tokens: TokenMetadata[];
  coinsAmounts: { [id: string]: BigNumber };
  tokensMap: { [id: string]: TokenMetadata };
  activeToken: string;
}) {
  const tokensData = calculateTokenValueAndShare(
    tokens,
    coinsAmounts,
    tokensMap
  );

  const data = tokens.map((token, i) => {
    return {
      name: token.symbol,
      value: Number(coinsAmounts[token.id]),
      token: token,
      displayV: tokensData[token.id].display2,
    };
  });
  const color = {
    DAI: 'rgba(255, 199, 0, 0.45)',
    USDT: '#167356',
    USN: 'rgba(255, 255, 255, 0.45)',
    cUSD: 'rgba(69, 205, 133, 0.6)',
    HBTC: '#4D85F8',
    WBTC: '#ED9234',
    STNEAR: '#A0A0FF',
    NEAR: '#A0B1AE',
    LINEAR: '#4081FF',
    NEARXC: '#4d5971',
    NearXC: '#4d5971',
    NearX: '#00676D',
    'USDT.e': '#19936D',
    'USDC.e': '#2B6EB7',
    USDC: '#2FA7DB',
    USDt: '#45D0C0',
  };

  const colorLight = {
    DAI: 'rgba(255, 199, 0, 1)',
    'USDT.e': '#167356',
    USDT: '#167356',
    USDC: 'rgba(0, 163, 255, 1)',
    'USDC.e': 'rgba(0, 163, 255, 1)',
    USN: 'rgba(255, 255, 255, 1)',
    cUSD: 'rgba(69, 205, 133, 1)',
    HBTC: '#4D85F8',
    WBTC: '#ED9234',
    STNEAR: '#A0A0FF',
    NEAR: '#A0B1AE',
    LINEAR: '#4081FF',
    NEARXC: '#4d5971',
    NearXC: '#4d5971',
    NearX: '#00676D',
    USDt: '#0E8585',
  };

  let innerRadius = 30;
  let outerRadius = 40;
  let width = 80;

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
      index,
      token,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius - 2) * cos;
    const sy = cy + (outerRadius - 2) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 30;
    const ey = my;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius - 5}
          outerRadius={outerRadius}
          fill={colorLight[token.symbol]}
          stroke={null}
          strokeWidth={2}
        />
      </g>
    );
  };

  const customLabel = activeToken && (
    <div className="text-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">
      {tokensData[activeToken].percentStr}%
    </div>
  );

  return (
    <>
      {customLabel}
      <PieChart width={width} height={80}>
        <Pie
          data={data}
          fill="#8884d8"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          labelLine={false}
          activeShape={renderActiveShape}
          activeIndex={data.findIndex((o) => o.token.id === activeToken)}
        >
          {data.map((entry, index) => {
            return (
              <Cell
                key={`cell-${index}`}
                fill={color[tokens[index].symbol]}
                stroke=""
              />
            );
          })}
        </Pie>
      </PieChart>
    </>
  );
}

const calculateTokenValueAndShare = (
  tokens: TokenMetadata[],
  coinsAmounts: { [id: string]: BigNumber },
  tokensMap: { [id: string]: TokenMetadata }
): Record<string, any> => {
  let result: Record<string, any> = {};
  const totalShares = _.sumBy(Object.values(coinsAmounts), (o) => Number(o));

  let otherTokenNumber = '0';

  Object.keys(tokensMap)
    .sort((a, b) => {
      const usdId =
        getConfig().networkId === 'mainnet' ? 'usn' : 'usdn.testnet';

      if (a === usdId) {
        return 1;
      } else {
        return -1;
      }
    })
    .reverse()
    .forEach((key, index: number) => {
      const token: TokenMetadata = tokensMap[key];

      const value = scientificNotationToString(
        coinsAmounts[token.id].toString()
      );
      let percentStr: string | number;
      if (index == tokens.length - 1) {
        percentStr = new BigNumber(100).minus(otherTokenNumber).toFixed(2);
      } else {
        percentStr = toPrecision(
          percent(value, totalShares.toString()).toString(),
          2
        );
        otherTokenNumber = BigNumber.sum(
          otherTokenNumber,
          percentStr
        ).valueOf();
      }
      result[token.id] = {
        token,
        value,
        percentStr,
        display: `${toInternationalCurrencySystem(value, 2)} (${percentStr}%)`,
        display2: `${toInternationalCurrencySystem(value, 2)} / ${percentStr}%`,
      };
    });

  const percents = Object.values(result).map((o) =>
    toPrecision(
      scientificNotationToString(
        new Big(o.value || '0')
          .div(totalShares || 1)
          .times(100)
          .toString()
      ),
      2
    )
  );

  const finalPercents = checkAllocations('100', percents);

  Object.keys(result).forEach((key, index) => {
    result[key].percentStr = finalPercents[index];
    result[key].display = `${toInternationalCurrencySystem(
      result[key].value,
      2
    )} (${finalPercents[index]}%)`;
    result[key].display2 = `${toInternationalCurrencySystem(
      result[key].value,
      2
    )} / ${finalPercents[index]}%`;
  });

  return result;
};

export default StablePoolList;
