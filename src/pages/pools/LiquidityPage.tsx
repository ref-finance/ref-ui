import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import { FaRegQuestionCircle, FaSearch } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';

import {
  classificationOfCoins_key,
  classificationOfCoins,
} from '~services/farm';
import { ArrowDown, ArrowDownLarge } from '~components/icon';
import { useHistory } from 'react-router';
import { Card } from '~components/card/Card';
import { find, values } from 'lodash';
import { SelectModal } from '~components/layout/SelectModal';
import {
  useAllPools,
  usePools,
  useMorePoolIds,
  useAllWatchList,
  useWatchPools,
} from '../../state/pool';
import Loading from '~components/layout/Loading';
import {
  useTokens,
  usePoolTokens,
  useRainbowWhitelistTokens,
  useTokenBalances,
} from '../../state/token';
import { Link } from 'react-router-dom';
import { canFarm, Pool, isNotStablePool, canFarms } from '../../services/pool';
import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import { CheckedTick, CheckedEmpty } from '~components/icon/CheckBox';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { PoolDb, WatchList } from '~store/RefDatabase';
import {
  DownArrowLight,
  DownArrowLightMobile,
  UpArrowDeep,
  UpArrowLight,
} from '~components/icon';
import { FarmStamp } from '~components/icon/FarmStamp';
import {
  SolidButton,
  FarmButton,
  GradientButton,
} from '~components/button/Button';
import { wallet } from '~services/near';
import {
  WatchListStartEmpty,
  WatchListStartFull,
} from '~components/icon/WatchListStar';
import { PolygonGrayDown } from '~components/icon/Polygon';
import _, { orderBy, sortBy, filter } from 'lodash';
import QuestionMark from '~components/farm/QuestionMark';
import { useInView } from 'react-intersection-observer';
import { QuestionTip } from '~components/layout/TipWrapper';
import { FilterIcon } from '../../components/icon/PoolFilter';
import { TokenMetadata, REF_META_DATA } from '../../services/ft-contract';
import { scientificNotationToString } from '../../utils/numbers';
import { useMobile, useClientMobile } from '../../utils/device';
import { usePoolsMorePoolIds } from '../../state/pool';
import { PoolTab } from '../../components/pool/PoolTab';
import { SearchIcon } from '~components/icon/FarmBoost';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { unwrapedNear } from '../../services/wrap-near';
import { Images, Symbols } from '../../components/stableswap/CommonComp';
import { getVEPoolId } from '../ReferendumPage';
import { StartPoolIcon } from '../../components/icon/WatchListStar';
import { PoolDaoBanner, PoolDaoBannerMobile } from '../../components/icon/Logo';
import { VEARROW } from '../../components/icon/Referendum';
import getConfig from '../../services/config';
import { AddPoolModal } from './AddPoolPage';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { checkTransactionStatus } from '../../services/swap';
import { useAllFarms } from '../../state/farm';
import { REF_FI_CONTRACT_ID } from '../../services/near';

const HIDE_LOW_TVL = 'REF_FI_HIDE_LOW_TVL';

const REF_FI_FARM_ONLY = 'REF_FI_FARM_ONLY';

function SelectUi({
  onChange,
  list,
  curvalue,
  shrink,
  className,
}: {
  onChange: (e: any) => void;
  list: any;
  curvalue: string;
  shrink?: string;
  className?: string;
}) {
  const [showSelectBox, setShowSelectBox] = useState(false);
  const switchSelectBoxStatus = () => {
    setShowSelectBox(!showSelectBox);
  };
  const hideSelectBox = () => {
    setShowSelectBox(false);
  };
  return (
    <div
      className={`relative flex ${
        shrink ? 'items-end' : 'items-center '
      } lg:mr-5 outline-none`}
    >
      <span className="lg:hidden mr-2">
        <FilterIcon onShow={showSelectBox} />
      </span>
      <span className="text-farmText text-sm mr-2.5 xs:hidden md:hidden">
        <FormattedMessage id="filter_by" defaultMessage="Filter by" />
      </span>

      <span
        onClick={switchSelectBoxStatus}
        tabIndex={-1}
        onBlur={hideSelectBox}
        className={`flex items-center justify-between min-w-24 h-5 rounded-full px-2 box-border border cursor-pointer text-xs outline-none ${
          shrink ? 'xs:w-8 md:w-8' : ''
        } ${
          showSelectBox
            ? 'border-greenColor text-white'
            : 'border-farmText text-farmText'
        }`}
      >
        <label
          className={`whitespace-nowrap ${shrink ? 'xs:hidden md:hidden' : ''}`}
        >
          {curvalue ? list[curvalue] : null}
        </label>
        <ArrowDownLarge />
      </span>
      <div
        className={`absolute z-50 top-8 right-0 border border-farmText bg-cardBg rounded-md min-w-24 ${
          showSelectBox ? '' : 'hidden'
        }`}
      >
        {Object.entries(list).map((item: any, index) => (
          <p
            key={item[0] + item[1]}
            onMouseDown={() => {
              onChange(item[0]);
            }}
            className={`flex items-center p-4 text-xs h-5 text-white text-opacity-40 my-2 cursor-pointer hover:bg-white hover:bg-opacity-10 hover:text-opacity-100
            ${
              item[0] == curvalue
                ? 'bg-white bg-opacity-10 text-opacity-100'
                : ''
            }
            `}
          >
            {item[1]}
          </p>
        ))}
      </div>
    </div>
  );
}

function MobilePoolRow({
  pool,
  sortBy,
  watched,
  selectCoinClass,
  tokens,
  morePoolIds,
  supportFarm,
}: {
  pool: Pool;
  sortBy: string;
  watched: Boolean;
  selectCoinClass?: string;
  tokens?: TokenMetadata[];
  morePoolIds: string[];
  supportFarm: Boolean;
}) {
  const { ref, inView } = useInView();

  const curRowTokens = useTokens(pool.tokenIds, tokens);

  const history = useHistory();

  if (!curRowTokens) return <></>;

  tokens = curRowTokens.sort((a, b) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const showSortedValue = ({
    sortBy,
    value,
  }: {
    sortBy: string;
    value?: number;
  }) => {
    if (sortBy === 'tvl')
      return toInternationalCurrencySystem(value.toString());
    else if (sortBy === 'fee') return `${calculateFeePercent(value)}%`;
  };

  const MobileMoreFarmStamp = ({ count }: { count: number }) => {
    return (
      <div className="px-1 rounded border border-greenLight text-greenLight">
        {count}
      </div>
    );
  };

  return (
    <div className="w-full hover:bg-poolRowHover">
      <Link
        ref={ref}
        className="flex flex-col border-b border-gray-700 border-opacity-70 bg-cardBg w-full px-4 py-6 text-white"
        onClick={() => localStorage.setItem('fromMorePools', 'n')}
        to={{
          pathname: `/pool/${pool.id}`,
          state: { tvl: pool?.tvl, backToFarms: supportFarm },
        }}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center justify-start">
            <div className="flex items-center">
              <div className="h-6 w-6 border border-gradientFromHover rounded-full">
                <img
                  key={tokens[0].id.substring(0, 12).substring(0, 12)}
                  className="rounded-full w-full"
                  src={tokens[0].icon}
                />
              </div>

              <div className="h-6 w-6 border border-gradientFromHover rounded-full">
                <img
                  key={tokens[1].id}
                  className="w-full rounded-full"
                  src={tokens[1].icon}
                />
              </div>
            </div>
            <div className="text-sm ml-2 font-semibold">
              {tokens[0].symbol + '-' + tokens[1].symbol}
            </div>
            {watched && (
              <div className="ml-2">
                <WatchListStartFull />
              </div>
            )}

            {morePoolIds?.length && morePoolIds?.length > 1 ? (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  history.push(`/more_pools/${pool.tokenIds}`, {
                    morePoolIds: morePoolIds,
                    tokens,
                  });
                }}
                className="mx-2"
              >
                <MobileMoreFarmStamp count={morePoolIds?.length} />
              </div>
            ) : null}
          </div>
          <div>{showSortedValue({ sortBy, value: pool[sortBy] })}</div>
        </div>
      </Link>
    </div>
  );
}

function MobileWatchListCard({
  watchPools,
  poolTokenMetas,
  farmCounts,
  poolsMorePoolsIds,
}: {
  watchPools: Pool[];
  poolTokenMetas: any;
  farmCounts: Record<string, number>;
  poolsMorePoolsIds: Record<string, string[]>;
}) {
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>(false);
  const [sortBy, onSortChange] = useState<string>('tvl');

  return (
    <Card className="w-full" bgcolor="bg-cardBg" padding="p-0 pb-4 mb-4 mt-2">
      <div className="mx-4 flex items-center justify-between mt-4">
        <div className="flex items-center">
          <div
            className={`text-${
              watchPools?.length > 0 ? 'white' : 'gray-400'
            }  text-base`}
          >
            <FormattedMessage id="my_watchlist" defaultMessage="My Watchlist" />
            {watchPools.length > 0 ? ` (${watchPools.length})` : ''}
          </div>
          {/* my_watchlist_copy */}
          <QuestionTip id="my_watchlist_copy" />
        </div>
      </div>
      <section className="w-full">
        <header className="p-4 text-gray-400 flex items-center justify-between text-sm">
          <div>
            <FormattedMessage id="pair" defaultMessage="Pair" />
          </div>
          <div className="flex items-center">
            <div
              className={`relative rounded-full flex items-center border    ${
                showSelectModal
                  ? 'border-greenColor text-white'
                  : 'border-farmText text-farmText'
              } w-32`}
            >
              <span
                className={`px-3 w-full text-xs h-5
                    flex items-center justify-between
                  `}
                onClick={() => {
                  setShowSelectModal(true);
                }}
              >
                <label>
                  <FormattedMessage id={sortBy} defaultMessage={sortBy} />
                </label>
                <ArrowDownLarge />
              </span>

              {showSelectModal && (
                <SelectModal
                  onSortChange={onSortChange}
                  setShowModal={setShowSelectModal}
                  className="top-8"
                  sortMode={sortBy}
                />
              )}
            </div>
          </div>
        </header>
        <div className="border-b border-gray-700 border-opacity-70" />
        <div className="max-h-96 overflow-y-auto">
          {watchPools?.map((pool, i) => (
            <div className="w-full hover:bg-poolRowHover" key={i}>
              <MobilePoolRow
                tokens={poolTokenMetas[pool.id]}
                sortBy={sortBy}
                pool={pool}
                watched={!!find(watchPools, { id: pool.id })}
                morePoolIds={poolsMorePoolsIds[pool.id]}
                supportFarm={!!farmCounts[pool.id]}
              />
            </div>
          ))}
        </div>
      </section>
    </Card>
  );
}

function MobileLiquidityPage({
  pools,
  tokenName,
  order,
  watchPools,
  hasMore,
  onSearch,
  onSortChange,
  onOrderChange,
  nextPage,
  sortBy,
  onHide,
  hideLowTVL,
  allPools,
  poolTokenMetas,
  poolsMorePoolsIds,
  farmCounts,
  farmOnly,
  setFarmOnly,
}: {
  pools: Pool[];
  poolTokenMetas: any;
  farmOnly: boolean;
  setFarmOnly: (farmOnly: boolean) => void;
  onSortChange: (modeSort: string) => void;
  tokenName: string;
  order: string;
  watchPools: Pool[];
  sortBy: string;
  hideLowTVL: Boolean;
  hasMore: boolean;
  allPools: number;
  onHide: (mode: Boolean) => void;
  onSearch: (name: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
  poolsMorePoolsIds: Record<string, string[]>;
  farmCounts: Record<string, number>;
}) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const history = useHistory();
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>();
  const inputRef = useRef(null);
  const selectTokens = useRainbowWhitelistTokens();

  const selectBalances = useTokenBalances();

  const tokensStar = [REF_META_DATA, unwrapedNear];

  const filterList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    filterList[key] = intl.formatMessage({ id: key });
  });
  const [selectCoinClass, setSelectCoinClass] = useState<string>('all');
  const [showAddPoolModal, setShowAddPoolModal] = useState<boolean>(false);

  const poolFilterFunc = (p: Pool) => {
    if (selectCoinClass === 'all') return true;

    return poolTokenMetas[p.id].some((tk: TokenMetadata) =>
      classificationOfCoins[selectCoinClass].includes(tk.symbol)
    );
  };
  const outOfText = intl.formatMessage({ id: 'out_of' });

  return (
    <>
      <PoolTab></PoolTab>
      <div className="flex flex-col w-3/6 md:w-11/12 lg:w-5/6 xs:w-11/12 m-auto md:flex lg:hidden xl:hidden xs:flex">
        <MobileWatchListCard
          poolTokenMetas={poolTokenMetas}
          watchPools={watchPools}
          farmCounts={farmCounts}
          poolsMorePoolsIds={poolsMorePoolsIds}
        />

        {/* start pool card */}
        {!!getConfig().REF_VE_CONTRACT_ID ? (
          <div className="mt-1 mb-5">
            <div className="flex items-center">
              <span className="text-white text-lg ml-4 mr-2">
                <FormattedMessage
                  id="start_pool"
                  defaultMessage={'Star Pool'}
                />
              </span>
              <StartPoolIcon />
            </div>
            <Card
              className="mt-2 bg-cardBg flex flex-col  "
              width="w-full"
              padding="px-0 py-3"
            >
              <div className="flex items-center ml-5">
                <button
                  className="flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open(`/pool/${getVEPoolId()}`);
                  }}
                >
                  <Images tokens={tokensStar} size="6" className="mr-2.5" />
                  <Symbols
                    tokens={tokensStar}
                    seperator="-"
                    fontSize="text-sm"
                  ></Symbols>
                </button>
              </div>

              <PoolDaoBannerMobile />

              {/* {supportFarmStar && <FarmButton farmCount={farmCountStar} />} */}
            </Card>
          </div>
        ) : null}

        <Card className="w-full" bgcolor="bg-cardBg" padding="p-0 pb-4">
          <div className="mx-4 flex items-center justify-between my-4">
            <div className="flex items-center">
              <div className="text-white text-base">Top Pools</div>
              <QuestionTip id="topPoolsCopy" />
            </div>

            <div className="text-gray-400 text-xs">
              {(pools?.length ? pools?.filter(poolFilterFunc).length : '-') +
                ` ${outOfText} ` +
                (allPools ? allPools : '-')}
            </div>
          </div>
          <div className="rounded my-2 text-gray-400 flex items-center pr-2 mx-4 mb-5">
            <div className="relative flex items-center flex-grow">
              <input
                ref={inputRef}
                className={`text-sm outline-none rounded py-1.5 pl-3 pr-7 flex-grow bg-inputDarkBg`}
                placeholder={intl.formatMessage({
                  id: 'search_by_token',
                })}
                value={tokenName}
                onChange={(evt) => {
                  onSearch(evt.target.value);
                }}
              />
              <SearchIcon className="absolute right-1.5"></SearchIcon>
            </div>
            {isSignedIn ? (
              <div
                className="ml-1 text-xs"
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-class="reactTip"
                data-html={true}
                data-tip={`
              <div className="text-xs">
                <div 
                  style="max-width: 250px;font-weight:400",
                >
                ${intl.formatMessage({ id: 'create_new_pool' })}
                </div>
              </div>
            `}
                data-for="add_pool_tip"
              >
                <button
                  className={`text-base ml-2 px-3 text-primaryText w-8 h-8 bg-black bg-opacity-20 hover:bg-opacity-40 hover:text-gradientFrom rounded-md flex items-center justify-center`}
                  onClick={() => {
                    setShowAddPoolModal(true);
                  }}
                >
                  +
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex items-start justify-between mx-4 mb-2">
            <SelectUi
              list={filterList}
              onChange={setSelectCoinClass}
              curvalue={selectCoinClass}
            />

            <div className="flex flex-col">
              <div
                className=" inline-flex items-center cursor-pointer mb-2"
                onClick={() => {
                  hideLowTVL && onHide(false);
                  !hideLowTVL && onHide(true);
                }}
              >
                <div className="mr-2">
                  {hideLowTVL ? <CheckedTick /> : <CheckedEmpty />}
                </div>
                <div className="text-primaryText text-sm">
                  <FormattedMessage
                    id="hide_low_tvl_pools_mobile"
                    defaultMessage="Hide low TVL pools"
                  />
                </div>
              </div>
              <div
                className=" inline-flex items-center cursor-pointer"
                onClick={() => {
                  farmOnly && setFarmOnly(false);
                  !farmOnly && setFarmOnly(true);
                }}
              >
                <div className="mr-2">
                  {farmOnly ? <CheckedTick /> : <CheckedEmpty />}
                </div>
                <div className="text-primaryText text-sm">
                  <FormattedMessage id="farm_only" defaultMessage="Farm only" />
                </div>
              </div>
            </div>
          </div>

          <section className="w-full">
            <header className="p-4 text-gray-400 flex items-center justify-between text-sm">
              <div>
                <FormattedMessage id="pair" defaultMessage="Pair" />
              </div>
              <div className="flex items-center">
                <div
                  className="mr-2"
                  onClick={() => {
                    onOrderChange(order === 'desc' ? 'asc' : 'desc');
                  }}
                >
                  {order === 'desc' ? (
                    <DownArrowLightMobile />
                  ) : (
                    <UpArrowDeep />
                  )}
                </div>
                <div
                  className={`relative rounded-full flex items-center border    ${
                    showSelectModal
                      ? 'border-greenColor text-white'
                      : 'border-farmText text-farmText'
                  } w-32`}
                >
                  <span
                    className={`px-3 w-full text-xs h-5
                      flex items-center justify-between
                    `}
                    onClick={() => {
                      setShowSelectModal(true);
                    }}
                  >
                    <label>
                      <FormattedMessage id={sortBy} defaultMessage={sortBy} />
                    </label>
                    <ArrowDownLarge />
                  </span>

                  {showSelectModal && (
                    <SelectModal
                      sortMode={sortBy}
                      onSortChange={onSortChange}
                      setShowModal={setShowSelectModal}
                      className="top-8"
                    />
                  )}
                </div>
              </div>
            </header>
            <div className="border-b border-gray-700 border-opacity-70" />
            <div className="max-h-96 overflow-y-auto pool-list-container-mobile">
              {pools?.filter(poolFilterFunc).map((pool, i) => (
                <MobilePoolRow
                  selectCoinClass={selectCoinClass}
                  tokens={poolTokenMetas[pool.id]}
                  pool={pool}
                  sortBy={sortBy}
                  watched={!!find(watchPools, { id: pool.id })}
                  key={i}
                  morePoolIds={poolsMorePoolsIds[pool.id]}
                  supportFarm={!!farmCounts[pool.id]}
                />
              ))}
            </div>
          </section>
        </Card>
      </div>
      {isSignedIn && (
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

function PoolRow({
  pool,
  index,
  selectCoinClass,
  tokens,
  morePoolIds,
  supportFarm,
  farmCount,
}: {
  pool: Pool;
  index: number;
  selectCoinClass?: string;
  tokens?: TokenMetadata[];
  morePoolIds: string[];
  supportFarm: boolean;
  farmCount: number;
}) {
  const curRowTokens = useTokens(pool.tokenIds, tokens);
  const history = useHistory();
  const [showLinkArrow, setShowLinkArrow] = useState(false);

  if (!curRowTokens) return <></>;

  tokens = curRowTokens.sort((a, b) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  return (
    <div className="w-full hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20">
      <Link
        className="grid grid-cols-8 py-3.5 text-white content-center text-sm text-left mx-8 border-b border-gray-700 border-opacity-70 hover:opacity-80"
        onClick={() => localStorage.setItem('fromMorePools', 'n')}
        to={{
          pathname: `/pool/${pool.id}`,
          state: { tvl: pool.tvl, backToFarms: supportFarm },
        }}
      >
        <div className="col-span-5 md:col-span-4 flex items-center">
          <div className="mr-6 w-2">{index}</div>
          <div className="flex items-center">
            <Images tokens={tokens} size="9" />
            <div className="text-sm ml-7">
              {tokens[0].symbol + '-' + tokens[1].symbol}
            </div>
          </div>

          {supportFarm && <FarmButton farmCount={farmCount} />}
        </div>
        <div className="col-span-1 py-1 md:hidden ">
          {calculateFeePercent(pool.fee)}%
        </div>

        <div
          className="col-span-1 py-1"
          title={toPrecision(
            scientificNotationToString(pool.tvl.toString()),
            0
          )}
        >
          ${toInternationalCurrencySystem(pool.tvl.toString())}
        </div>

        <div
          className="col-span-1 py-1 hover:text-green-500 hover:cursor-pointer"
          onMouseEnter={() => setShowLinkArrow(true)}
          onMouseLeave={() => setShowLinkArrow(false)}
          onClick={(e) => {
            e.preventDefault();
            history.push(`/more_pools/${pool.tokenIds}`, {
              morePoolIds: morePoolIds,
              tokens,
            });
          }}
        >
          {morePoolIds?.length ? `${morePoolIds?.length}` : '-'}
          {showLinkArrow && ' >'}
        </div>
      </Link>
    </div>
  );
}

function WatchListCard({
  watchPools,
  poolTokenMetas,
  farmCounts,
  poolsMorePoolsIds,
}: {
  watchPools: Pool[];
  poolTokenMetas: any;
  farmCounts: Record<string, number>;
  poolsMorePoolsIds: Record<string, string[]>;
}) {
  return (
    <>
      <Card className=" w-full mb-2" padding="p-0 py-6" bgcolor="bg-cardBg">
        <div className="mx-8 flex items-center">
          <div
            className={`text-${
              watchPools?.length > 0 ? 'white' : 'gray-400'
            } text-lg`}
          >
            <FormattedMessage id="my_watchlist" defaultMessage="My Watchlist" />
          </div>
          <QuestionTip id="my_watchlist_copy" />
        </div>
        <section className="">
          <header className="grid grid-cols-8 py-2 pb-4 text-left text-sm text-gray-400 mx-8 border-b border-gray-700 border-opacity-70">
            <div className="col-span-5 md:col-span-4 flex">
              <div className="mr-6 w-2">#</div>
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </div>
            <div className="col-span-1 md:hidden flex items-center">
              <div className="mr-1">
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
            </div>

            <div className="col-span-1 flex items-center">
              <span className="mr-1">
                <FormattedMessage id="tvl" defaultMessage="TVL" />
              </span>
            </div>
            <p className="col-span-1">
              <FormattedMessage id="pools" defaultMessage="Pools" />
            </p>
          </header>

          <div className="max-h-96 overflow-y-auto">
            {watchPools?.map((pool, i) => (
              <div
                className="w-full hover:bg-poolRowHover hover:bg-opacity-20"
                key={i}
              >
                <PoolRow
                  pool={pool}
                  index={i + 1}
                  tokens={poolTokenMetas[pool.id]}
                  morePoolIds={poolsMorePoolsIds[pool.id]}
                  farmCount={farmCounts[pool.id]}
                  supportFarm={!!farmCounts[pool.id]}
                />
              </div>
            ))}
          </div>
        </section>
      </Card>
    </>
  );
}

function LiquidityPage_({
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
  poolsMorePoolsIds,
  farmCounts,
  farmOnly,
  setFarmOnly,
}: {
  pools: Pool[];
  poolTokenMetas: any;
  sortBy: string;
  hideLowTVL: Boolean;
  watchPools: Pool[];
  tokenName: string;
  order: string;
  onHide: (mode: Boolean) => void;
  allPools: number;
  farmOnly: boolean;
  setFarmOnly: (farmOnly: boolean) => void;
  hasMore: boolean;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
  poolsMorePoolsIds: Record<string, string[]>;
  farmCounts: Record<string, number>;
}) {
  const intl = useIntl();
  const inputRef = useRef(null);
  const history = useHistory();

  const isMobile = useClientMobile();

  const selectTokens = useRainbowWhitelistTokens();

  const selectBalances = useTokenBalances();

  const filterList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    filterList[key] = intl.formatMessage({ id: key });
  });
  const [selectCoinClass, setSelectCoinClass] = useState<string>('all');
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const [supportFarmStar, setSupportFarmStar] = useState<Boolean>(false);
  const [farmCountStar, setFarmCountStar] = useState<Number>(1);

  const [showAddPoolModal, setShowAddPoolModal] = useState<boolean>(false);

  useEffect(() => {
    canFarm(getVEPoolId()).then(({ count }) => {
      setSupportFarmStar(!!count);
      setFarmCountStar(count);
    });
  }, []);

  const tokensStar = [REF_META_DATA, unwrapedNear];

  const poolFilterFunc = (p: Pool) => {
    if (selectCoinClass === 'all') return true;

    return poolTokenMetas[p.id].some((tk: TokenMetadata) =>
      classificationOfCoins[selectCoinClass].includes(tk.symbol)
    );
  };
  const outOfText = intl.formatMessage({ id: 'out_of' });
  return (
    <>
      <PoolTab></PoolTab>
      <div className="flex flex-col whitespace-nowrap w-4/6 lg:w-5/6 xl:w-3/4 md:hidden m-auto xs:hidden">
        <div className="mb-4 mx-8">
          <div className="text-white text-xl">
            <FormattedMessage
              id="liquidity_pools"
              defaultMessage="Liquidity Pools"
            />
          </div>
        </div>
        <WatchListCard
          poolTokenMetas={poolTokenMetas}
          watchPools={watchPools}
          farmCounts={farmCounts}
          poolsMorePoolsIds={poolsMorePoolsIds}
        />
        {/* start pool card */}
        {!!getConfig().REF_VE_CONTRACT_ID ? (
          <div className="mt-3 mb-5">
            <div className="flex items-center">
              <span className="text-white text-lg ml-8 mr-2">
                <FormattedMessage
                  id="start_pool"
                  defaultMessage={'Star Pool'}
                />
              </span>
              <StartPoolIcon />
            </div>
            <Card
              className="mt-2  relative flex items-center "
              width="w-full"
              bgcolor="bg-cardBg "
              padding="px-0 "
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open(`/pool/${getVEPoolId()}`);
              }}
            >
              <div className="w-full cursor-pointer flex items-center px-8 py-3 hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Images tokens={tokensStar} size="9" className="mr-7" />
                    <Symbols
                      tokens={tokensStar}
                      seperator="-"
                      fontSize="text-sm"
                    ></Symbols>
                  </div>
                </div>

                {supportFarmStar && <FarmButton farmCount={farmCountStar} />}
              </div>
              <div className="absolute flex items-center right-0 bottom-0">
                <button
                  className="text-white hover:text-gradientFrom text-xl z-30 relative top-3 right-3 flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open('/referendum');
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

        <Card width="w-full" className="bg-cardBg" padding="py-7 px-0">
          <div className="flex mx-8 justify-between pb-6">
            <div className="flex items-center">
              <div className="text-white text-lg">Top Pools</div>

              <div className="flex items-center">
                <span className="mr-1">
                  <QuestionTip id="topPoolsCopy" />
                </span>

                <div className="text-primaryText text-sm">
                  {(pools?.length
                    ? pools?.filter(poolFilterFunc).length
                    : '-') +
                    ` ${outOfText} ` +
                    (allPools ? allPools : '-')}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end relative top-4 w-1/4">
              <div className="relative rounded w-full my-2 text-primaryText flex items-center pr-2 bg-inputDarkBg">
                <input
                  ref={inputRef}
                  className={`text-sm outline-none rounded w-full py-1.5 pl-3 pr-6`}
                  placeholder={intl.formatMessage({
                    id: 'search_by_token',
                  })}
                  onChange={(evt) => {
                    onSearch(evt.target.value);
                  }}
                />
                <SearchIcon className="absolute right-2"></SearchIcon>
              </div>

              {isSignedIn ? (
                <div
                  className="ml-1 text-xs"
                  data-type="info"
                  data-place="top"
                  data-multiline={true}
                  data-class="reactTip"
                  data-html={true}
                  data-tip={`
              <div className="text-xs">
                <div 
                  style="max-width: 250px;font-weight:400",
                >
                ${intl.formatMessage({ id: 'create_new_pool' })}
                </div>
              </div>
            `}
                  data-for="add_pool_tip"
                >
                  <button
                    className={`text-base ml-2 px-3 text-primaryText w-8 h-8 bg-black bg-opacity-20 hover:bg-opacity-40 hover:text-gradientFrom rounded-md flex items-center justify-center`}
                    onClick={() => {
                      setShowAddPoolModal(true);
                    }}
                  >
                    +
                  </button>

                  <ReactTooltip
                    className="w-20"
                    id="add_pool_tip"
                    backgroundColor="#1D2932"
                    border
                    borderColor="#7e8a93"
                    textColor="#C6D1DA"
                    effect="solid"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="mx-8 justify-between pb-4 flex">
            <div className="flex items-center">
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
                <div className="text-primaryText text-sm ">
                  <FormattedMessage
                    id="hide_low_tvl_pools"
                    defaultMessage="Hide low TVL pools"
                  />
                </div>
              </div>

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
                <div className="text-primaryText text-sm ">
                  <FormattedMessage id="farm_only" defaultMessage="Farm only" />
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

          <section className="">
            <header className="grid grid-cols-8 py-2 pb-4 text-left text-sm text-gray-400 mx-8 border-b border-gray-700 border-opacity-70">
              <div className="col-span-5 md:col-span-4 flex">
                <div className="mr-6 w-2">#</div>
                <FormattedMessage id="pair" defaultMessage="Pair" />
              </div>
              <div className="col-span-1 md:hidden flex items-center">
                <div
                  className="pr-1 cursor-pointer"
                  onClick={() => {
                    onSortChange('fee');
                    sortBy !== 'fee' && onOrderChange('asc');
                    sortBy === 'fee' &&
                      onOrderChange(order === 'desc' ? 'asc' : 'desc');
                  }}
                >
                  <FormattedMessage id="fee" defaultMessage="Fee" />
                </div>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    onSortChange('fee');
                    sortBy !== 'fee' && onOrderChange('asc');
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

              <div className="col-span-1 flex items-center">
                <span
                  className="pr-1 cursor-pointer"
                  onClick={() => {
                    onSortChange('tvl');
                    sortBy !== 'tvl' && onOrderChange('asc');
                    sortBy === 'tvl' &&
                      onOrderChange(order === 'desc' ? 'asc' : 'desc');
                  }}
                >
                  <FormattedMessage id="tvl" defaultMessage="TVL" />
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    onSortChange('tvl');
                    sortBy !== 'tvl' && onOrderChange('asc');
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
              <p className="col-span-1">
                <FormattedMessage id="pools" defaultMessage="Pools" />
              </p>
            </header>

            <div className="max-h-96 overflow-y-auto  pool-list-container-pc">
              {pools?.filter(poolFilterFunc).map((pool, i) => (
                <PoolRow
                  tokens={poolTokenMetas[pool.id]}
                  key={i}
                  pool={pool}
                  index={i + 1}
                  selectCoinClass={selectCoinClass}
                  morePoolIds={poolsMorePoolsIds[pool.id]}
                  supportFarm={!!farmCounts[pool.id]}
                  farmCount={farmCounts[pool.id]}
                />
              ))}
            </div>
          </section>
        </Card>
      </div>
      {isSignedIn && (
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

export function LiquidityPage() {
  const [tokenName, setTokenName] = useState('');
  const [sortBy, setSortBy] = useState('tvl');
  const [order, setOrder] = useState('desc');
  const AllPools = useAllPools();
  const watchPools = useWatchPools();
  const [hideLowTVL, setHideLowTVL] = useState<Boolean>(false);
  const [displayPools, setDisplayPools] = useState<Pool[]>();
  const { pools, hasMore, nextPage, loading } = usePools({
    tokenName,
    sortBy,
    order,
  });

  const [farmOnly, setFarmOnly] = useState<boolean>(
    localStorage.getItem(REF_FI_FARM_ONLY) === '1' || false
  );

  const [farmCounts, setFarmCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const pool_ids = pools.map((p) => p.id);
    canFarms({
      pool_ids,
    }).then(setFarmCounts);
  }, [pools]);

  const clientMobileDevice = useClientMobile();

  useEffect(() => {
    let tempPools = pools;

    setHideLowTVL(JSON.parse(localStorage.getItem(HIDE_LOW_TVL)) || false);

    if (hideLowTVL) {
      tempPools = _.filter(tempPools, (pool) => pool.tvl > 1000);
    }
    if (farmOnly) {
      tempPools = _.filter(tempPools, (pool) => !!farmCounts[pool.id]);
    }
    setDisplayPools(tempPools);
  }, [pools, hideLowTVL, farmOnly, farmCounts]);
  const poolTokenMetas = usePoolTokens(pools);

  const onSearch = useCallback(
    _.debounce(setTokenName, clientMobileDevice ? 50 : 500),
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
          let receipt = res?.receipts_outcome?.find(
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
        }
      });
    }
  }, [txHash]);

  const poolsMorePoolsIds = usePoolsMorePoolIds();

  if (!displayPools || loading || !watchPools || !poolTokenMetas)
    return <Loading />;

  return (
    <>
      {!clientMobileDevice && (
        <LiquidityPage_
          poolTokenMetas={poolTokenMetas}
          tokenName={tokenName}
          pools={displayPools}
          poolsMorePoolsIds={poolsMorePoolsIds}
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
          order={order}
          sortBy={sortBy}
          allPools={AllPools}
          onOrderChange={setOrder}
          onSortChange={setSortBy}
          onSearch={onSearch}
          hasMore={hasMore}
          nextPage={nextPage}
        />
      )}

      {clientMobileDevice && (
        <MobileLiquidityPage
          poolTokenMetas={poolTokenMetas}
          hideLowTVL={hideLowTVL}
          poolsMorePoolsIds={poolsMorePoolsIds}
          tokenName={tokenName}
          pools={displayPools}
          watchPools={watchPools}
          allPools={AllPools}
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
        />
      )}
    </>
  );
}
