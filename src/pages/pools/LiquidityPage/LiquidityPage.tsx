/* eslint-disable react/prop-types */
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  createContext,
} from 'react';
import { ShareInFarm } from '../../../components/layout/ShareInFarm';
import {
  classificationOfCoins_key,
  classificationOfCoins,
  Seed,
} from '../../../services/farm';
import { ArrowDownLarge, TokenRisk } from '../../../components/icon';
import { useHistory } from 'react-router';
import { Card } from '../../../components/card/Card';
import { find } from 'lodash';
import { SelectModal } from '../../../components/layout/SelectModal';
import Pagination from '../../../components/poolsPagination/Pagination';
import {
  useAllPools,
  usePools,
  useWatchPools,
  useV3VolumesPools,
  useDCLTopBinFee,
  useIndexerStatus,
} from '../../../state/pool';
import Loading from '../../../components/layout/Loading';
import { LoadingSmall } from '../../../../src/components/icon/Loading';

import {
  useTokens,
  usePoolTokens,
  useRainbowWhitelistTokens,
  useTokenBalances,
  useWhitelistTokens,
} from '../../../state/token';
import { Link } from 'react-router-dom';
import { canFarm, Pool, canFarms } from '../../../services/pool';
import {
  calculateFeePercent,
  toPrecision,
  toInternationalCurrencySystem,
} from '../../../utils/numbers';
import { CheckedTick, CheckedEmpty } from '../../../components/icon/CheckBox';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  DownArrowLight,
  DownArrowLightMobile,
  UpArrowDeep,
  UpArrowLight,
} from '../../../components/icon';
import { SolidButton } from '../../../components/button/Button';
import {
  NEAR_CLASS_STABLE_POOL_IDS,
  REF_UNI_V3_SWAP_CONTRACT_ID,
  USDTT_USDCC_USDT_USDC_POOL_ID,
  USDT_USDC_POOL_ID,
  FRAX_USDC_POOL_ID,
} from '../../../services/near';
import { WatchListStartFull } from '../../../components/icon/WatchListStar';
import _, { orderBy, sortBy, filter } from 'lodash';
import { useInView } from 'react-intersection-observer';
import { QuestionTip } from '../../../components/layout/TipWrapper';
import { TokenMetadata, REF_META_DATA } from '../../../services/ft-contract';
import {
  scientificNotationToString,
  percent,
  checkAllocations,
} from '../../../utils/numbers';
import {
  useMobile,
  useClientMobile,
  isClientMobie,
  isMobile,
} from '../../../utils/device';
import { useDayVolumesPools, useYourliquidity } from '../../../state/pool';
import { PoolTabV3 } from '../../../components/pool/PoolTabV3';
import { SearchIcon } from '../../../components/icon/FarmBoost';
import {
  WalletContext,
  getCurrentWallet,
} from '../../../utils/wallets-integration';
import { unwrapedNear, wnearMetadata } from '../../../services/wrap-near';
import {
  Images,
  Symbols,
  TknImages,
} from '../../../components/stableswap/CommonComp';
import { getVEPoolId } from '../../ReferendumPage';
import { StartPoolIcon } from '../../../components/icon/WatchListStar';
import {
  PoolDaoBanner,
  NEAR_TEXT,
  USD_TEXT,
} from '../../../components/icon/Logo';
import { VEARROW } from '../../../components/icon/Referendum';
import getConfig from '../../../services/config';
import { AddPoolModal } from '../AddPoolPage';
import { useWalletSelector } from '../../../context/WalletSelectorContext';
import { getURLInfo } from '../../../components/layout/transactionTipPopUp';
import { checkTransactionStatus } from '../../../services/swap';
import { useCanFarmV2 } from '../../../state/farm';
import {
  PoolData,
  useAllStablePoolData,
  useAllStablePools,
} from '../../../state/sauce';
import { formatePoolData } from '../../stable/StableSwapEntry';
import {
  USD_CLASS_STABLE_POOL_IDS,
  BTC_CLASS_STABLE_POOL_IDS,
} from '../../../services/near';
import BigNumber from 'bignumber.js';
import Big from 'big.js';
import { Cell, Pie, PieChart, Sector } from 'recharts';
import { OutlineButton } from '../../../components/button/Button';
import { BTC_TEXT } from '../../../components/icon/Logo';
import { useAllPoolsV2 } from '../../../state/swapV3';
import { PoolInfo } from 'src/services/swapV3';
import { FarmStampNew } from '../../../components/icon/FarmStamp';
import { ALL_STABLE_POOL_IDS } from '../../../services/near';
import { WatchList } from '../../../store/RefDatabase';
import { REF_FI_CONTRACT_ID } from '../../../services/near';
import { FarmBoost } from '../../../services/farm';

import {
  get_all_seeds,
  getLatestStartTime,
  isPending,
  sort_tokens_by_base,
  get_pool_name,
  openUrl,
} from '../../../services/commonV3';

import { formatPercentage } from '../../../components/d3Chart/utils';
import { AiFillStar, RiArrowRightSLine } from '../../../components/reactIcons';
import { useSeedFarmsByPools } from '../../../state/pool';

import { PoolRefreshModal } from '../PoolRefreshModal';
import { useTokenPriceList } from '../../../state/token';
import {
  REF_FI_POOL_ACTIVE_TAB,
  getPoolFeeApr,
  getPoolListFarmAprTip,
} from '../utils';

import { PoolsTip } from 'src/pages/pools/poolsComponents/poolsTip';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import MobileLiquidityPage from './MobileLiquidityPage/MobileLiquidityPage';
import { PoolIdNotExist, SelectUi } from '../poolsComponents/poolsComponents';
import {
  REF_FI_POOL_SEARCH_BY,
  REF_POOL_ID_SEARCHING_KEY,
  TokenPriceListContext,
} from './constLiquidityPage';
import { useRiskTokens } from '../../../state/token';
import { format_apy } from '../../../utils/uiNumber';

const HIDE_LOW_TVL = 'REF_FI_HIDE_LOW_TVL';

const REF_FI_FARM_ONLY = 'REF_FI_FARM_ONLY';
export const BLACK_TOKEN_IDS_IN_POOL = ['usn', 'v2-nearx.stader-labs.near'];
export function getPoolFeeAprTitle(
  dayVolume: string,
  pool: Pool,
  tvlInput?: number
) {
  let result = '0';
  if (dayVolume) {
    const { fee, tvl } = pool;
    const newTvl = tvlInput || tvl;

    const revenu24h = (fee / 10000) * 0.8 * Number(dayVolume);
    if (newTvl > 0 && revenu24h > 0) {
      const annualisedFeesPrct = ((revenu24h * 365) / newTvl) * 100;
      result = annualisedFeesPrct.toString();
    }
  }
  return Number(result);
}

export const getPoolListV2FarmAprTip = () => {
  return `
    <div 
      class="flex flex-col text-xs min-w-36 text-farmText z-50"
    >
      <div>
      Top Bin APR
      </div>

      <div>
      
      + Farm Rewards APR
      </div>
    
   

    </div>
`;
};

// todo need delete
function PoolRow({
  pool,
  index,
  selectCoinClass,
  tokens,
  supportFarm,
  farmCount,
  h24volume,
  watched,
  mark,
  farmApr,
  activeTab,
}: {
  pool: any;
  index?: number;
  selectCoinClass?: string;
  tokens?: TokenMetadata[];
  supportFarm: boolean;
  farmCount: number;
  h24volume: string;
  watched?: boolean;
  mark?: boolean;
  farmApr?: number;
  activeTab?: string;
}) {
  const { riskTokens } = useContext(TokenPriceListContext);
  const curRowTokens = useTokens(pool.tokenIds, tokens);
  const isTokenAtRisk = (token) => {
    return riskTokens.some((riskToken) => riskToken.id === token.id);
  };
  const [showTooltip, setShowTooltip] = useState(false);
  const history = useHistory();
  const [showLinkArrow, setShowLinkArrow] = useState(false);
  const { indexFail } = useContext(TokenPriceListContext);
  if (!curRowTokens) return <></>;
  tokens = sort_tokens_by_base(curRowTokens);

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
  return (
    <div className="w-full hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20">
      <Link
        className={`grid grid-cols-${
          mark ? 7 : 7
        } py-3.5 text-white content-center text-sm text-left mx-8 border-b border-gray-700 border-opacity-70 hover:opacity-80`}
        onClick={() => localStorage.setItem('fromMorePools', 'n')}
        to={{
          pathname: `/pool/${pool.id}`,
          // state: { tvl: pool.tvl, backToFarms: supportFarm },
        }}
        style={{
          height: '70px',
        }}
      >
        <div className="col-span-3 md:col-span-4 flex items-center">
          <div className="flex items-center">
            <TknImages tokens={tokens} size="8" />
            <div className="flex items-center">
              <div className="flex flex-wrap max-w-48 text-sm ml-3">
                <label>{tokens[0].symbol}</label>-
                <label>{tokens[1].symbol}</label>
                {tokens[2] ? <label>-{tokens[2]?.symbol}</label> : null}
                {tokens[3] ? <label>-{tokens[3]?.symbol}</label> : null}
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
                    <div className="absolute -top-3 z-50 left-5 px-2 w-min py-1.5 border border-borderColor text-farmText text-xs rounded-md bg-cardBg">
                      {tooltipText}
                    </div>
                  )}
                </div>
              )}
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
              {pool.top && (
                <div
                  className="w-9 h-5 bg-greenLight text-black font-bold text-xs frcc ml-2"
                  style={{ borderRadius: ' 14px' }}
                >
                  Top
                </div>
              )}
            </div>
          </div>
        </div>

        {/* fee */}
        <div className="col-span-1 flex items-center justify-center justify-self-center py-1 md:hidden ">
          {Reflect.has(pool, 'farm_apy')
            ? formatNumber(pool.fee * 100)
            : calculateFeePercent(pool.fee)}
          %
        </div>
        {/* apr */}
        {Reflect.has(pool, 'farm_apy') ? (
          <div
            className="col-span-1 flex flex-col items-center justify-self-center text-sm py-1"
            data-type="info"
            data-place="right"
            data-multiline={true}
            data-class={'reactTip'}
            data-tooltip-html={getPoolListFarmAprTip()}
            data-tooltip-id={'pool_list_pc_apr' + pool.id}
          >
            {/* {`${
              Number(pool.apy).toFixed(0) != '0'
                ? formatNumber(Number(pool.apy))
                : '0'
            }%`} */}
            {format_apy(pool.apy ?? 0)}
            <span className="text-xs text-gradientFrom">
              {`${
                Number(pool.farm_apy).toFixed(0) != '0'
                  ? formatNumber(Number(pool.farm_apy)) + '%'
                  : ''
              }`}
            </span>
            {Number(pool.farm_apy).toFixed(0) != '0' && (
              <CustomTooltip
                className="w-20"
                id={'pool_list_pc_apr' + pool.id}
                place="right"
              />
            )}
          </div>
        ) : (
          <div
            className="col-span-1 flex flex-col items-center justify-self-center text-sm py-1"
            data-type="info"
            data-place="right"
            data-multiline={true}
            data-class={'reactTip'}
            data-tooltip-html={getPoolListFarmAprTip()}
            data-tooltip-id={'pool_list_pc_apr' + pool.id}
          >
            {!h24volume ? '-' : `${getPoolFeeApr(h24volume, pool)}%`}
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
              <CustomTooltip
                className="w-20"
                id={'pool_list_pc_apr' + pool.id}
                place="right"
              />
            )}
          </div>
        )}
        {/* 24h */}
        {Reflect.has(pool, 'farm_apy') ? (
          <div
            className="col-span-1 flex items-center justify-center py-1 justify-self-center relative "
            title={h24volume}
          >
            {!pool.volume_24h
              ? '-'
              : Number(pool.volume_24h) == 0
              ? '$0'
              : Number(pool.volume_24h) < 0.01
              ? '$ <0.01'
              : `$${toInternationalCurrencySystem(pool.volume_24h)}`}
          </div>
        ) : (
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
        )}

        {/* tvl */}
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
      </Link>
    </div>
  );
}

function PoolRowV2({
  pool,
  index,
  tokens,
  showCol,
  mark,
  watched,
  h24volume,
  relatedSeed,
}: {
  pool: PoolInfo;
  index: number;
  tokens?: TokenMetadata[];
  showCol?: boolean;
  mark?: boolean;
  watched?: boolean;
  h24volume?: string;
  relatedSeed?: Seed;
}) {
  const { riskTokens } = useContext(TokenPriceListContext);
  const curRowTokens = useTokens([pool.token_x, pool.token_y], tokens);
  const [showTooltip, setShowTooltip] = useState(false);
  const isTokenAtRisk = (token) => {
    return riskTokens.some((riskToken) => riskToken.id === token.id);
  };
  const history = useHistory();
  const topBinApr = useDCLTopBinFee({
    pool,
    way: 'value',
  });
  const displayOfTopBinApr =
    topBinApr == '-' ? '-' : formatPercentage(topBinApr);
  pool.top_bin_apr = topBinApr;

  if (!curRowTokens) return <></>;
  tokens = sort_tokens_by_base(tokens);
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
    <div
      className="w-full hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20 cursor-pointer"
      onClick={goDetailV2}
    >
      <div
        className={`grid ${
          mark ? 'grid-cols-7' : 'grid-cols-9'
        } py-3.5 text-white content-center text-sm text-left mx-8 border-b border-gray-700 border-opacity-70 hover:opacity-80`}
      >
        <div
          className={`md:col-span-4 flex items-center ${
            showCol && mark ? 'col-span-3' : 'col-span-4'
          }`}
        >
          <div className="flex items-center">
            <TknImages tokens={tokens} size="8" />
            <div className="text-sm ml-3">
              {tokens[0].symbol +
                '-' +
                tokens[1].symbol +
                `${tokens[2] ? '-' + tokens[2].symbol : ''}`}
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
                  <div className="absolute -top-3 z-50 left-5 px-2 w-min py-1.5 border border-borderColor text-farmText text-xs rounded-md bg-cardBg">
                    {tooltipText}
                  </div>
                )}
              </div>
            )}
          </div>
          {mark ? (
            <span className="text-xs text-v3SwapGray bg-watchMarkBackgroundColor px-2.5 py-px rounded-xl ml-2">
              DCL
            </span>
          ) : null}
          {watched && (
            <div className="ml-2">
              <WatchListStartFull />
            </div>
          )}
          {relatedSeed && (
            <FarmStampNew multi={relatedSeed.farmList?.length > 1} />
          )}
        </div>

        <div
          className={` py-1 md:hidden ${mark ? 'justify-self-center' : ''} ${
            showCol ? 'col-span-1' : 'col-span-2'
          }`}
        >
          {calculateFeePercent(pool.fee / 100)}%
        </div>
        <div
          className={`${
            mark ? 'col-span-1 justify-self-center' : 'col-span-2'
          }`}
        >
          <div
            className={`inline-flex flex-col py-1`}
            data-type="info"
            data-place="right"
            data-multiline={true}
            data-class={'reactTip'}
            data-tooltip-html={getPoolListV2FarmAprTip()}
            data-tooltip-id={'pool_list_v2_pc_apr' + pool.pool_id}
          >
            {displayOfTopBinApr}
            {relatedSeed && (
              <span className="text-xs text-gradientFrom">{getFarmApr()}</span>
            )}
            {relatedSeed && (
              <CustomTooltip
                className="w-20"
                id={'pool_list_v2_pc_apr' + pool.pool_id}
                place="right"
              />
            )}
          </div>
        </div>

        <div
          className={`col-span-1 ${
            mark ? 'justify-self-center' : ''
          }  py-1 md:hidden ${showCol ? '' : 'hidden'}`}
        >
          {geth24volume()}
        </div>
        <div
          className={`col-span-1 py-1  ${
            mark ? 'justify-self-center' : ''
          } relative left-4`}
          title={toPrecision(
            scientificNotationToString(pool.tvl.toString()),
            0
          )}
        >
          {pool.tvlUnreal
            ? '-'
            : '$' + toInternationalCurrencySystem(pool.tvl.toString())}
        </div>
      </div>
    </div>
  );
}

function WatchListCard({
  watchPools,
  poolTokenMetas,
  farmCounts,
  volumes,
  watchV2Pools,
  watchList,
  tokenName,
  do_farms_v2_poos,
  farmAprById,
}: {
  watchPools: Pool[];
  poolTokenMetas: any;
  farmCounts: Record<string, number>;
  volumes: Record<string, string>;
  watchV2Pools: PoolInfo[];
  watchList: WatchList[];
  tokenName: string;
  do_farms_v2_poos: Record<string, Seed>;
  farmAprById: Record<string, number>;
}) {
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

  function v1PoolFilter(p: Pool) {
    return Object.values(p.metas)?.some((t: any) =>
      _.includes(t.symbol.toLowerCase(), tokenName.toLowerCase())
    );
  }

  function v2PoolFilter(p: PoolInfo) {
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
  }

  return (
    <>
      <Card className=" w-full mb-2" padding="p-0 py-6" bgcolor="bg-cardBg">
        <section className="">
          <header className="grid grid-cols-7 py-2 pb-4 text-left text-sm text-gray-400 mx-8 border-b border-gray-700 border-opacity-70">
            <div className="col-span-3 md:col-span-4 flex">
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </div>
            <div className="col-span-1 justify-self-center md:hidden flex items-center">
              <div className="mr-1">
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
            </div>

            <div className="col-span-1 justify-self-center relative right-1 md:hidden flex items-center">
              <div className="pr-1 ">
                <FormattedMessage id="apr" defaultMessage="APR" />
              </div>
            </div>

            <div className="col-span-1 justify-self-center relative  md:hidden flex items-center">
              <div className="pr-1 ">
                <FormattedMessage
                  id="volume_24h"
                  defaultMessage="Volume (24h)"
                />
              </div>
            </div>

            <div className="col-span-1 justify-self-center flex items-center">
              <FormattedMessage id="tvl" defaultMessage="TVL" />
            </div>
          </header>

          <div className="max-h-96 overflow-y-auto">
            {watchAllPools
              .filter((p: any) => {
                if (p.id?.toString()) {
                  return v1PoolFilter(p);
                } else if (p.pool_id) {
                  return v2PoolFilter(p);
                }
              })
              .map((pool: any, i: number) => {
                if (pool.id?.toString()) {
                  return (
                    <div
                      className="w-full hover:bg-poolRowHover hover:bg-opacity-20"
                      key={pool?.id + i}
                    >
                      <PoolRow
                        pool={pool}
                        farmApr={farmAprById ? farmAprById[pool.id] : null}
                        tokens={poolTokenMetas[pool.id]}
                        farmCount={farmCounts[pool.id]}
                        supportFarm={!!farmCounts[pool.id]}
                        h24volume={volumes[pool.id]}
                        mark={true}
                      />
                    </div>
                  );
                } else if (pool.pool_id) {
                  return (
                    <PoolRowV2
                      tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                      key={pool?.pool_id + i}
                      pool={pool}
                      index={1 + i}
                      showCol={true}
                      mark={true}
                      h24volume={volumes[pool.pool_id]}
                      relatedSeed={do_farms_v2_poos[pool.pool_id]}
                    />
                  );
                }
              })}
          </div>
        </section>
      </Card>
    </>
  );
}
function PcLiquidityPage({
  pools,
  sortBy,
  tokenName,
  order,
  hasMore,
  watchPools,
  onSearch,
  onHide,
  hideLowTVL,
  onSortChange,
  onOrderChange,
  nextPage,
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
  h24VolumeV2,
  do_farms_v2_poos,
  farmAprById,
  totalItems,
  pageSize,
  handlePageChange,
  handleSizeChange,
  cardLoading,
  setTknType,
}: {
  cardLoading: boolean;
  totalItems: number;
  pageSize: number;
  handlePageChange: (key: any, size: any) => void;
  handleSizeChange: (key: number) => void;
  pools: Pool[];
  switchActiveTab: (tab: string) => void;
  activeTab: string;
  poolTokenMetas: any;
  sortBy: string;
  hideLowTVL: Boolean;
  watchPools: Pool[];
  tokenName: string;
  order: string;
  onHide: (mode: Boolean) => void;
  allPools: number;
  h24VolumeV2: string;
  farmAprById: Record<string, number>;
  farmOnly: boolean;
  setFarmOnly: (farmOnly: boolean) => void;
  hasMore: boolean;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
  setTknType: (key: string) => void;
  farmCounts: Record<string, number>;
  volumes: Record<string, string>;
  watchV2Pools: PoolInfo[];
  watchList: WatchList[];
  do_farms_v2_poos: Record<string, Seed>;
}) {
  const intl = useIntl();
  const inputRef = useRef(null);

  const allPoolsV2 = useAllPoolsV2(true);

  const [tvlV2, setTvlV2] = useState<string>();

  useEffect(() => {
    setShowPoolIDTip(false);
  }, [activeTab]);

  useEffect(() => {
    if (
      typeof allPoolsV2 === 'undefined' ||
      allPoolsV2.length === 0 ||
      allPoolsV2.every((p) => !p?.tvl)
    )
      return;

    const tvl = allPoolsV2.reduce(
      (a, b) => new Big(a || '0').plus(new Big(b.tvl || '0')),
      new Big(0)
    );

    setTvlV2(scientificNotationToString(tvl.toString()));
  }, [allPoolsV2]);
  //
  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.value = tokenName;
    }
  }, [tokenName, inputRef?.current]);

  const selectTokens = useWhitelistTokens();

  const selectBalances = useTokenBalances();

  const filterList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    filterList[key] = intl.formatMessage({ id: key });
  });

  const [selectCoinClass, setSelectCoinClass] = useState<string>('all');
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const [supportFarmStar, setSupportFarmStar] = useState<Boolean>(false);
  const [farmCountStar, setFarmCountStar] = useState<number>(1);

  const [showAddPoolModal, setShowAddPoolModal] = useState<boolean>(false);

  const [reSortBy, setReSortBy] = useState<string>('');

  const [v2SortBy, setV2SortBy] = useState<string>('tvl');

  const [v2Order, setV2Order] = useState<string>('desc');
  const [symbolsArr] = useState(['e', 'E', '+', '-', '.']);
  const [enableIdSearch, setEnableIdSearch] = useState<boolean>(
    !!sessionStorage.getItem(REF_POOL_ID_SEARCHING_KEY) || false
  );

  useEffect(() => {
    setTknType(selectCoinClass);
  }, [selectCoinClass]);

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

  useEffect(() => {
    canFarm(getVEPoolId()).then(({ count }) => {
      setSupportFarmStar(!!count);
      setFarmCountStar(count);
    });
  }, []);
  const tokensStar = [REF_META_DATA, unwrapedNear];
  const poolReSortingFunc = (p1: Pool, p2: Pool) => {
    const v1 = volumes[p1.id] ? parseFloat(volumes[p1.id]) : 0;

    const v2 = volumes[p2.id] ? parseFloat(volumes[p2.id]) : 0;

    const apr1 =
      getPoolFeeAprTitle(v1.toString(), p1) + (farmAprById?.[p1.id] || 0) * 100;

    const apr2 =
      getPoolFeeAprTitle(v2.toString(), p2) + (farmAprById?.[p2.id] || 0) * 100;

    if (order === 'desc') {
      if (reSortBy === 'volume') {
        return v2 - v1;
      } else if (reSortBy === 'apr') {
        return apr2 - apr1;
      }
    } else if (order === 'asc') {
      if (reSortBy === 'volume') {
        return v1 - v2;
      } else if (reSortBy === 'apr') {
        return apr1 - apr2;
      }
    }
  };

  const poolv2ReSortingFunc = (p1: PoolInfo, p2: PoolInfo) => {
    const f1 = p1.fee;

    const f2 = p2.fee;

    const tvl1 = p1.tvl;

    const tvl2 = p2.tvl;

    const v1 = volumes[p1.pool_id] ? parseFloat(volumes[p1.pool_id]) : 0;

    const v2 = volumes[p2.pool_id] ? parseFloat(volumes[p2.pool_id]) : 0;

    const top_bin_apr1 = p1.top_bin_apr;
    const top_bin_apr2 = p2.top_bin_apr;
    if (v2Order === 'desc') {
      if (v2SortBy === 'tvl') {
        return tvl2 - tvl1;
      } else if (v2SortBy === 'fee') {
        return f2 - f1;
      } else if (v2SortBy === 'volume_24h') {
        return v2 - v1;
      } else if (v2SortBy === 'top_bin_apr') {
        return Number(top_bin_apr2) - Number(top_bin_apr1);
      }
    } else if (v2Order === 'asc') {
      if (v2SortBy === 'tvl') {
        return tvl1 - tvl2;
      } else if (v2SortBy === 'fee') {
        return f1 - f2;
      } else if (v2SortBy === 'volume_24h') {
        return v1 - v2;
      } else if (v2SortBy === 'top_bin_apr') {
        return Number(top_bin_apr1) - Number(top_bin_apr2);
      }
    }
  };

  const [searchFocus, setSearchFocus] = useState(false);

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

  const poolFilterFunc = (p: Pool) => {
    if (selectCoinClass === 'all') return true;
    return poolTokenMetas?.[p.id]?.some((tk: TokenMetadata) =>
      classificationOfCoins[selectCoinClass].includes(tk.symbol)
    );
  };

  if (activeTab === 'v2' && !allPoolsV2) return <Loading />;
  const totalWatchList_length = watchPools?.length + watchV2Pools?.length;

  return (
    <>
      <PoolTabV3></PoolTabV3>
      <div className="flex flex-col whitespace-nowrap w-1000px m-auto ">
        {/* start pool card */}
        {!!getConfig().REF_VE_CONTRACT_ID ? (
          <div className={` mt-5 mb-3`}>
            <Card
              className="mt-2  relative flex items-center "
              width="w-full"
              bgcolor="bg-starPoolBg "
              padding="px-0 "
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openUrl(`/pool/${getVEPoolId()}`);
              }}
            >
              <div className="absolute left-3 top-0 ">
                <StartPoolIcon />
              </div>
              <div className="w-full cursor-pointer flex items-center px-8 py-3 hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Images tokens={tokensStar} size="8" className="mr-7" />
                    <Symbols
                      tokens={tokensStar}
                      separator="-"
                      fontSize="text-sm"
                    ></Symbols>
                  </div>
                </div>

                {supportFarmStar && <FarmStampNew multi={farmCountStar > 1} />}
              </div>
              <div className="absolute flex items-center right-0 bottom-0">
                <button
                  className="text-white hover:text-gradientFrom text-sm z-30 relative top-6 right-0 flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openUrl('/referendum');
                  }}
                >
                  <span className="text-white">
                    <FormattedMessage
                      id="more_than_a_simple_pool"
                      defaultMessage={'More than a simple pool'}
                    />
                  </span>

                  <button className=" ml-1.5">
                    <VEARROW />
                  </button>
                </button>
                <PoolDaoBanner />
              </div>
            </Card>
          </div>
        ) : null}

        <div className={`flex items-center justify-between mb-4 ${'mt-5'} `}>
          <div className=" flex text-base items-center rounded-xl p-1">
            <div className="bg-cardBg p-1 h-10 flex items-center rounded-xl">
              <button
                className={` h-full  hover:bg-viewPoolHoverBgColor border-primaryText px-4 flex items-center justify-center ${
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
                <FormattedMessage id="dcl_pools" defaultMessage={'DCL Pools'} />
              </button>
              {activeTab === 'v1' || activeTab === 'v2' ? null : (
                <div
                  className="w-px h-6"
                  style={{
                    background: '#566069',
                  }}
                ></div>
              )}

              <button
                className={` h-full flex  hover:bg-viewPoolHoverBgColor  px-4 items-center justify-center ${
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
            </div>

            <button
              className={`ml-2.5 h-10 px-4  hover:bg-viewPoolHoverBgColor bg-cardBg flex items-center justify-center ${
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
              />
            </button>

            <button
              className={`ml-2.5 h-10 px-4  hover:bg-viewPoolHoverBgColor bg-cardBg flex items-center justify-center ${
                activeTab === 'watchlist' ? 'text-white' : 'text-primaryText'
              } `}
              style={{
                background:
                  activeTab === 'watchlist'
                    ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                    : null,
                borderRadius: '10px',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchActiveTab('watchlist');
              }}
            >
              {activeTab === 'watchlist' ? (
                <AiFillStar fill="white" />
              ) : (
                <AiFillStar fill="#91A2AE" />
              )}
              <FormattedMessage id="watchlist" defaultMessage={'Watchlist'} />
              {totalWatchList_length > 0 ? ` (${totalWatchList_length})` : ''}
            </button>
          </div>

          <div className="flex items-center justify-end relative ">
            <div
              className={`relative rounded-xl border w-full my-2 text-white  flex items-center pr-2 `}
              style={{
                background: 'rgba(34, 46, 56, 0.2)',
                border: searchFocus ? '1px solid #3A635B' : '1px solid #304452',
                width: '250px',
              }}
            >
              <button
                type="button"
                className={`${
                  activeTab === 'v2' ? 'hidden' : ''
                } flex items-center justify-center px-2 py-1 rounded-lg ml-1 ${
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
                className={`text-sm search-pool-pc outline-none rounded-xl  py-2 pl-3 pr-6`}
                placeholder={
                  enableIdSearch && activeTab !== 'v2'
                    ? intl.formatMessage({
                        id: 'input_pool_id',
                        defaultMessage: 'Input pool Id',
                      })
                    : intl.formatMessage({
                        id: 'search_pool_by_token',
                        defaultMessage: 'Search pool by token...',
                      })
                }
                inputMode={
                  enableIdSearch && activeTab !== 'v2' ? 'decimal' : 'text'
                }
                type={enableIdSearch && activeTab !== 'v2' ? 'number' : 'text'}
                onFocus={() => {
                  setSearchFocus(true);
                  setShowPoolIDTip(false);
                }}
                onBlur={() => {
                  setSearchFocus(false);
                }}
                onChange={(evt) => {
                  inputRef.current.value = evt.target.value.trim();

                  if (
                    enableIdSearch &&
                    activeTab !== 'v2' &&
                    Number(evt.target.value) >= allPools
                  ) {
                    setShowPoolIDTip(true);
                  } else {
                    setShowPoolIDTip(false);
                  }

                  !enableIdSearch || activeTab === 'v2'
                    ? onSearch(evt.target.value)
                    : null;
                }}
                onKeyDown={(evt) => {
                  if (activeTab !== 'v2' && enableIdSearch) {
                    symbolsArr.includes(evt.key) && evt.preventDefault();
                  }

                  if (
                    evt.key === 'Enter' &&
                    activeTab !== 'v2' &&
                    enableIdSearch
                  ) {
                    handleIdSearching(inputRef.current.value);
                  }
                }}
              />

              {showPoolIDTip && <PoolIdNotExist />}
              <SearchIcon
                style={{
                  opacity: searchFocus ? '1' : '0.5',
                }}
                onClick={() => {
                  if (
                    enableIdSearch &&
                    activeTab !== 'v2' &&
                    !!inputRef.current.value
                  ) {
                    handleIdSearching(inputRef.current.value);
                  }
                }}
                className={`absolute right-2 ${
                  enableIdSearch && activeTab !== 'v2' ? 'cursor-pointer' : ''
                }`}
              ></SearchIcon>
            </div>

            {isSignedIn && (activeTab === 'v1' || activeTab === 'v2') ? (
              <div
                className="ml-1 text-xs"
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-class="reactTip"
                data-tooltip-html={`
              <div class="text-xs opacity-50">
                <div 
                  style="font-weight:400",
                >
                ${intl.formatMessage({
                  id: 'dcl_pool_are_not_available_to_be_created_yet',

                  defaultMessage:
                    'DCL Pools are not available to be created yet',
                })}
                </div>
              </div>
            `}
                data-tooltip-id="add_pool_tip"
              >
                <SolidButton
                  className={`text-sm ml-2 px-3 text-white rounded-lg flex items-center justify-center`}
                  onClick={() => {
                    setShowAddPoolModal(true);
                  }}
                  disabled={activeTab === 'v2'}
                >
                  <span className="mr-1">+</span>

                  <span>
                    <FormattedMessage
                      id="create_pool"
                      defaultMessage={'Create Pool'}
                    />
                  </span>
                </SolidButton>

                {activeTab === 'v2' && (
                  <CustomTooltip className="w-20" id="add_pool_tip" />
                )}
              </div>
            ) : null}
          </div>
        </div>
        <PoolsTip activeTab={activeTab} />
        {activeTab === 'watchlist' && (
          <WatchListCard
            poolTokenMetas={poolTokenMetas}
            watchPools={watchPools}
            farmCounts={farmCounts}
            volumes={volumes}
            watchV2Pools={watchV2Pools}
            watchList={watchList}
            tokenName={tokenName}
            do_farms_v2_poos={do_farms_v2_poos}
            farmAprById={farmAprById}
          />
        )}
        {/* classic pools */}
        {activeTab === 'v1' && (
          <Card width="w-full" className="bg-cardBg" padding="pb-7 px-0">
            <div
              className="flex px-6 py-5 justify-between rounded-t-xl mb-2"
              style={{
                background: '#293742',
              }}
            >
              <div className="flex items-center">
                <div className="text-white text-lg font-bold">Pools</div>
              </div>

              <div className="ml-8 justify-between  flex">
                <div className="flex items-center">
                  {/* check farm */}
                  <div
                    className="flex items-center mr-5 cursor-pointer"
                    onClick={() => {
                      farmOnly && setFarmOnly(false);
                      !farmOnly && setFarmOnly(true);
                    }}
                  >
                    <div className="mr-2">
                      {farmOnly ? <CheckedTick /> : <CheckedEmpty />}
                    </div>
                    <div className="text-white text-sm ">
                      <FormattedMessage id="farm" defaultMessage="Farm" />
                    </div>
                  </div>
                  {/* check low pools */}
                  <div
                    className="flex items-center mr-5 cursor-pointer"
                    onClick={() => {
                      hideLowTVL && onHide(false);
                      !hideLowTVL && onHide(true);
                    }}
                  >
                    <div className="mr-2">
                      {hideLowTVL ? <CheckedTick /> : <CheckedEmpty />}
                    </div>
                    <div className="text-white text-sm ">
                      <FormattedMessage
                        id="hide_low_tvl_pools"
                        defaultMessage="Hide low TVL pools"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <SelectUi
                    list={filterList}
                    onChange={setSelectCoinClass}
                    curvalue={selectCoinClass}
                  />
                </div>
              </div>
            </div>

            <section className="">
              <header className="grid grid-cols-7 py-2 pb-4 text-left text-sm text-primaryText mx-8 border-b border-gray-700 border-opacity-70">
                <div className="col-span-3 md:col-span-4 flex">
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </div>
                {/* fee */}
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
                    className={`cursor-pointer ${
                      sortBy !== 'fee' ? 'hidden' : ''
                    }`}
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
                {/* apy */}
                <div className="col-span-1 justify-self-center  relative right-1 md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      sortBy !== 'apy' ? 'hover:text-white' : ''
                    } ${sortBy === 'apy' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      onSortChange('apy');
                      setReSortBy('');
                      sortBy !== 'apy' && onOrderChange('desc');
                      sortBy === 'apy' &&
                        onOrderChange(order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage id="apr" defaultMessage="APR" />
                  </span>

                  <span
                    className={`cursor-pointer ${
                      sortBy !== 'apy' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      onSortChange('apy');
                      setReSortBy('');
                      sortBy !== 'apy' && onOrderChange('desc');
                      sortBy === 'apy' &&
                        onOrderChange(order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {sortBy === 'apy' ? (
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
                {/* 24h */}
                <div className="col-span-1 justify-self-center relative  md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      sortBy !== '24h' ? 'hover:text-white' : ''
                    } ${sortBy === '24h' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      onSortChange('24h');
                      setReSortBy('');
                      sortBy !== '24h' && onOrderChange('desc');
                      sortBy === '24h' &&
                        onOrderChange(order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage
                      id="volume_24h"
                      defaultMessage="Volume (24h)"
                    />
                  </span>

                  <span
                    className={`cursor-pointer ${
                      sortBy !== '24h' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      onSortChange('24h');
                      setReSortBy('');
                      sortBy !== '24h' && onOrderChange('desc');
                      sortBy === '24h' &&
                        onOrderChange(order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {sortBy === '24h' ? (
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
                {/* tvl */}
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
              </header>

              {!cardLoading && (
                <div className="h-96 overflow-y-auto  pool-list-container-pc">
                  {pools?.map((pool, i) => {
                    return (
                      <div key={'v1-pc' + pool.id + i}>
                        <PoolRow
                          tokens={poolTokenMetas[pool.id]}
                          farmApr={farmAprById ? farmAprById[pool.id] : null}
                          pool={pool}
                          index={pool.id + i + Math.random()}
                          selectCoinClass={selectCoinClass}
                          supportFarm={!!farmCounts[pool.id]}
                          farmCount={farmCounts[pool.id]}
                          h24volume={volumes[pool.id]}
                          watched={!!find(watchPools, { id: pool.id })}
                          activeTab="v1"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              {cardLoading && (
                <div className="h-96 overflow-y-auto  pool-list-container-pc">
                  <LoadingSmall></LoadingSmall>
                </div>
              )}
            </section>
          </Card>
        )}

        {activeTab === 'v2' && (
          <Card width="w-full" className="bg-cardBg" padding="py-7 px-0">
            <section className="">
              <header className="grid grid-cols-9 py-2 pb-4 text-left text-sm text-primaryText mx-8 border-b border-gray-700 border-opacity-70">
                <div className="col-span-4 flex">
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </div>
                <div className="col-span-1  md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      v2SortBy !== 'fee' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'fee' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('fee');
                      v2SortBy !== 'fee' && setV2Order('desc');
                      v2SortBy === 'fee' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage id="fee" defaultMessage="Fee" />
                  </span>

                  <span
                    className={`cursor-pointer ${
                      v2SortBy !== 'fee' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      setV2SortBy('fee');
                      v2SortBy !== 'fee' && setV2Order('desc');
                      v2SortBy === 'fee' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'fee' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>

                <div className="col-span-2  md:hidden flex items-center">
                  <span
                    className={`mr-1 flex items-center ${
                      v2SortBy !== 'top_bin_apr' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'top_bin_apr' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('top_bin_apr');
                      v2SortBy !== 'top_bin_apr' && setV2Order('desc');
                      v2SortBy === 'top_bin_apr' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage
                      id="top_bin_apr"
                      defaultMessage="Top Bin APR (24h)"
                    />
                  </span>
                  <QuestionTip
                    id="top-bin-apr"
                    defaultMessage="This is the trailing 24hr APR of the top performing bin in this pool."
                    uniquenessId="topbinapr"
                    className={'pr-1'}
                    maxWidth="210px"
                  />
                  {/* total locked amounts */}
                  <span
                    className={`cursor-pointer ${
                      v2SortBy !== 'top_bin_apr' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      setV2SortBy('top_bin_apr');
                      v2SortBy !== 'top_bin_apr' && setV2Order('desc');
                      v2SortBy === 'top_bin_apr' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'top_bin_apr' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>

                <div className="col-span-1  md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      v2SortBy !== 'volume_24h' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'volume_24h' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('volume_24h');
                      v2SortBy !== 'volume_24h' && setV2Order('desc');
                      v2SortBy === 'volume_24h' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage
                      id="volume_24h"
                      defaultMessage="Volume (24h)"
                    />
                  </span>

                  <span
                    className={`cursor-pointer ${
                      v2SortBy !== 'volume_24h' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      setV2SortBy('volume_24h');
                      v2SortBy !== 'volume_24h' && setV2Order('desc');
                      v2SortBy === 'volume_24h' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'volume_24h' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>

                <div className="col-span-1  relative left-4 flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      v2SortBy !== 'tvl' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'tvl' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('tvl');
                      setReSortBy('');

                      v2SortBy !== 'tvl' && setV2Order('desc');
                      v2SortBy === 'tvl' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage id="tvl" defaultMessage="TVL" />
                  </span>
                  <span
                    className={v2SortBy !== 'tvl' ? 'hidden' : 'cursor-pointer'}
                    onClick={() => {
                      setV2SortBy('tvl');
                      setReSortBy('');
                      v2SortBy !== 'tvl' && setV2Order('desc');
                      v2SortBy === 'tvl' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'tvl' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>
              </header>
              <div className="max-h-96 overflow-y-auto  pool-list-container-pc">
                {allPoolsV2
                  .sort(poolv2ReSortingFunc)
                  .filter(poolv2FilterFunc)
                  .map((pool, i) => (
                    <PoolRowV2
                      tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                      key={pool.pool_id + i}
                      pool={pool}
                      watched={!!find(watchV2Pools, { pool_id: pool.pool_id })}
                      index={i + 1}
                      showCol={true}
                      relatedSeed={do_farms_v2_poos[pool.pool_id]}
                      h24volume={volumes[pool.pool_id]}
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
      {isSignedIn && selectTokens && selectBalances && (
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

export default function LiquidityPage() {
  window.onunload = () => {
    sessionStorage.removeItem(REF_FI_POOL_SEARCH_BY);
  };
  const storeTokenName = sessionStorage.getItem(REF_FI_POOL_SEARCH_BY);

  const [tokenName, setTokenName] = useState(storeTokenName || '');
  const [sortBy, setSortBy] = useState('tvl');
  const [order, setOrder] = useState('desc');
  const AllPools = useAllPools();
  const {
    watchPools,
    watchV2PoolsFinal: watchV2Pools,
    watchList,
  } = useWatchPools();
  const [hideLowTVL, setHideLowTVL] = useState<boolean | any>(false);
  const riskTokens = useRiskTokens();
  const [displayPools, setDisplayPools] = useState<Pool[]>();

  const tokenPriceList = useTokenPriceList();

  const [farmOnly, setFarmOnly] = useState<boolean>(
    localStorage.getItem(REF_FI_FARM_ONLY) === '1' || false
  );

  const [tknType, setTknType] = useState('all');

  const [activeTab, setActiveTab] = useState<string>(
    localStorage.getItem(REF_FI_POOL_ACTIVE_TAB) || 'v1'
  );

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalItems, setTotalItems] = useState(0);

  const handleSetTknType = (type) => {
    setTknType(type);
  };

  useEffect(() => {
    if (localStorage.getItem('poolsTotal')) {
      setTotalItems(Number(localStorage.getItem('poolsTotal')));
    }
  }, [localStorage.getItem('poolsTotal')]);

  const handlePageChange = (newPage, newSize) => {
    setCurrentPage(newPage);
    console.log(`Changed to page ${newPage} with size ${newSize}`);
    // fetch
  };

  //
  const handleSizeChange = (newSize) => {
    setPageSize(newSize);
    console.log(`Changed page size to ${newSize}`);
    //
  };

  // pagination end

  const switchActiveTab = (curTab: string) => {
    setActiveTab(curTab);
    if (curTab != 'v1') {
      setCurrentPage(1);
    }
    localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, curTab);
  };
  const [farmCounts, setFarmCounts] = useState<Record<string, number>>({});
  const clientMobileDevice = useClientMobile();
  const [do_farms_v2_poos, set_do_farms_v2_poos] = useState<
    Record<string, Seed>
  >({});

  const activeObj = {
    v1: 'classic',
    v2: 'dcl',
    stable: 'stable',
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [farmOnly, hideLowTVL]);

  const { pools, hasMore, nextPage, volumes, cardLoading } = usePools({
    tokenName,
    activeTab,
    sortBy,
    order,
    getTopPoolsProps: {
      farm: farmOnly,
      hide_low_pool: hideLowTVL,
      type: activeObj[activeTab],
      sort: sortBy,
      order,
      offset: (currentPage - 1) * pageSize,
      token_type: tknType,
    },
  });
  useEffect(() => {
    get_all_seeds().then((seeds: Seed[]) => {
      const activeSeeds = seeds.filter((seed: Seed) => {
        const { farmList, seed_id } = seed;
        const [contract_id, temp_mft_id] = seed_id.split('@');
        return (
          contract_id == REF_UNI_V3_SWAP_CONTRACT_ID &&
          farmList[0].status != 'Ended'
        );
      });
      if (activeSeeds.length > 0) {
        const temp = {};
        activeSeeds.forEach((seed: Seed) => {
          const [contract_id, temp_mft_id] = seed.seed_id.split('@');
          const [fixRange, pool_id, left_point, right_point] =
            temp_mft_id.split('&');
          const temp_arr = temp[pool_id] || [];
          temp_arr.push(seed);
          temp[pool_id] = temp_arr;
        });
        const temp_final = {};
        Object.keys(temp).forEach((pool_id: string) => {
          const seeds: Seed[] = temp[pool_id];
          seeds.sort((b: Seed, a: Seed) => {
            const b_latest = getLatestStartTime(b);
            const a_latest = getLatestStartTime(a);
            if (b_latest == 0) return -1;
            if (a_latest == 0) return 1;
            return a_latest - b_latest;
          });
          // having benefit
          const temp_seed = seeds.find((s: Seed, index: number) => {
            if (!isPending(s)) {
              seeds.splice(index, 1);
              return true;
            }
          });
          if (temp_seed) {
            seeds.unshift(temp_seed);
          }
          temp_final[pool_id] = seeds[0];
        });

        set_do_farms_v2_poos(temp_final);
      }
    });
  }, []);

  useEffect(() => {
    let tempPools = pools;

    setHideLowTVL(JSON.parse(localStorage.getItem(HIDE_LOW_TVL)) || false);

    if (hideLowTVL) {
      tempPools = _.filter(tempPools, (pool) => pool.tvl > 100);
    }
    if (farmOnly) {
      tempPools = _.filter(tempPools, (pool) => !!farmCounts[pool.id]);
    }
    tempPools = _.filter(tempPools, (pool) =>
      pool?.tokenIds?.every(
        (tokenId) => !BLACK_TOKEN_IDS_IN_POOL.includes(tokenId)
      )
    );
    setDisplayPools(tempPools);
  }, [pools, hideLowTVL, farmOnly, farmCounts]);

  const poolTokenMetas = usePoolTokens(pools);

  const onSearch = useCallback(
    _.debounce(
      (name: string) => {
        setTokenName(name);
        sessionStorage.setItem(REF_FI_POOL_SEARCH_BY, name);
      },
      clientMobileDevice ? 50 : 500
    ),
    [clientMobileDevice]
  );

  const history = useHistory();

  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && getCurrentWallet()?.wallet?.isSignedIn()) {
      checkTransactionStatus(txHash).then((res) => {
        let status: any = res.status;

        if (
          res.transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute'
        ) {
          const receipt = res?.receipts_outcome?.find(
            (o: any) => o?.outcome?.executor_id === REF_FI_CONTRACT_ID
          );

          if (receipt) {
            status = receipt?.outcome?.status;
          }
        }

        const data: string | undefined = status.SuccessValue;

        if (data) {
          const buff = Buffer.from(data, 'base64');
          const pool_id = buff.toString('ascii');

          history.push(`/pool/${pool_id}`);
        } else {
          history.replace(`/pools`);
        }
      });
    }
  }, [txHash]);

  const watchPoolVolumes = useDayVolumesPools(watchPools.map((p) => p.id));
  const v3PoolVolumes = useV3VolumesPools();
  const stablePools = useAllStablePools();
  const [h24VolumeV2, setH24VolumeV2] = useState<string>();
  const { fail: indexerFail } = useIndexerStatus();
  const { farmAprById } = useSeedFarmsByPools([
    ...pools,
    ...watchPools,
    ...stablePools,
  ]);
  useEffect(() => {
    const pool_ids_v1 = pools.map((p) => p.id);
    const pool_ids_watchPools = watchPools.map((p: Pool) => p.id);
    const pool_ids_stablePools = stablePools.map((p: Pool) => p.id);
    const pool_ids = pool_ids_v1
      .concat(pool_ids_watchPools)
      .concat(pool_ids_stablePools);
    canFarms({
      pool_ids,
    }).then(setFarmCounts);
  }, [pools, watchPools?.map((p) => p.id).join('|'), stablePools]);

  useEffect(() => {
    if (Object.keys(v3PoolVolumes).length > 0) {
      const h24Volume = Object.values(v3PoolVolumes).reduce(
        (a, b) => new Big(a || '0').plus(new Big(b || '0')),
        new Big(0)
      );

      setH24VolumeV2(scientificNotationToString(h24Volume.toString()));
    }
  }, [v3PoolVolumes]);

  const allVolumes = { ...watchPoolVolumes, ...volumes, ...v3PoolVolumes };

  if (!displayPools || !watchPools || !poolTokenMetas || !farmAprById)
    return <Loading />;

  return (
    <TokenPriceListContext.Provider
      value={{
        indexFail: Object.keys(tokenPriceList).length == 0,
        riskTokens,
      }}
    >
      {!isMobile() && (
        <PcLiquidityPage
          farmAprById={farmAprById}
          poolTokenMetas={poolTokenMetas}
          activeTab={activeTab}
          h24VolumeV2={h24VolumeV2}
          switchActiveTab={switchActiveTab}
          tokenName={tokenName}
          pools={activeTab == 'v1' ? pools : displayPools}
          onHide={(isHide) => {
            localStorage.setItem(HIDE_LOW_TVL, isHide.toString());
            setHideLowTVL(isHide);
          }}
          farmCounts={farmCounts}
          hideLowTVL={hideLowTVL}
          farmOnly={farmOnly}
          setFarmOnly={(farmOnly: boolean) => {
            setFarmOnly(farmOnly);
            localStorage.setItem(REF_FI_FARM_ONLY, farmOnly ? '1' : '0');
          }}
          watchPools={watchPools}
          watchV2Pools={watchV2Pools}
          watchList={watchList}
          volumes={allVolumes}
          order={order}
          sortBy={sortBy}
          allPools={AllPools}
          onOrderChange={setOrder}
          onSortChange={setSortBy}
          onSearch={onSearch}
          hasMore={hasMore}
          nextPage={nextPage}
          do_farms_v2_poos={do_farms_v2_poos}
          totalItems={totalItems}
          handlePageChange={handlePageChange}
          handleSizeChange={handleSizeChange}
          pageSize={pageSize}
          cardLoading={cardLoading}
          setTknType={handleSetTknType}
        />
      )}

      {isMobile() && (
        <MobileLiquidityPage
          activeTab={activeTab}
          switchActiveTab={switchActiveTab}
          poolTokenMetas={poolTokenMetas}
          hideLowTVL={hideLowTVL}
          tokenName={tokenName}
          pools={activeTab == 'v1' ? pools : displayPools}
          watchPools={watchPools}
          watchV2Pools={watchV2Pools}
          watchList={watchList}
          allPools={AllPools}
          volumes={allVolumes}
          order={order}
          sortBy={sortBy}
          farmCounts={farmCounts}
          farmOnly={farmOnly}
          setFarmOnly={(farmOnly: boolean) => {
            setFarmOnly(farmOnly);
            localStorage.setItem(REF_FI_FARM_ONLY, farmOnly ? '1' : '0');
          }}
          onOrderChange={setOrder}
          onSortChange={setSortBy}
          onHide={(isHide) => {
            localStorage.setItem(HIDE_LOW_TVL, isHide.toString());
            setHideLowTVL(isHide);
          }}
          onSearch={onSearch}
          hasMore={hasMore}
          nextPage={nextPage}
          do_farms_v2_poos={do_farms_v2_poos}
          farmAprById={farmAprById}
          h24VolumeV2={h24VolumeV2}
          totalItems={totalItems}
          handlePageChange={handlePageChange}
          handleSizeChange={handleSizeChange}
          pageSize={pageSize}
          cardLoading={cardLoading}
          setTknType={handleSetTknType}
        />
      )}
      {indexerFail && (
        <PoolRefreshModal isOpen={indexerFail}></PoolRefreshModal>
      )}
    </TokenPriceListContext.Provider>
  );
}

const calculateTokenValueAndShare = (
  tokens: TokenMetadata[],
  coinsAmounts: { [id: string]: BigNumber },
  tokensMap: { [id: string]: TokenMetadata }
): Record<string, any> => {
  const result: Record<string, any> = {};
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
      token,
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

  const innerRadius = 30;
  const outerRadius = 40;
  const width = 80;

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
            key={token.id + 'pool_page_stable_pool' + i}
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
  const { riskTokens } = useContext(TokenPriceListContext);
  const formattedPool = formatePoolData(poolData);
  const standPool = poolData.pool;
  standPool.tvl = poolData.poolTVL;
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
          <TknImages
            tokens={poolData.tokens}
            size="8"
            className={`mr-4 ${is_new_pool ? 'xsm:ml-4 xsm:mr-0' : ''}`}
            layout="vertical"
            layoutSize="16"
          />

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
                  <div className="absolute -top-3 z-50 left-5 px-2 w-min py-1.5 border border-borderColor text-farmText text-xs rounded-md bg-cardBg">
                    {tooltipText}
                  </div>
                )}
              </div>
            )}

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
            data-tooltip-html={getPoolListFarmAprTip()}
            data-tooltip-id={'pool_list_pc_apr' + poolData.pool.id}
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
