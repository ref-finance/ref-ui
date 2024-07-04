import { Card } from 'src/components/card/Card';
import { REF_MOBILE_POOL_ID_INPUT } from 'src/pages/pools/LiquidityPage/constLiquidityPage';
import {
  PoolIdNotExist,
  SelectUi,
} from 'src/pages/pools/poolsComponents/poolsComponents';
import { SearchIcon } from 'src/components/icon/FarmBoost';
import {
  ArrowDownLarge,
  CheckedEmpty,
  CheckedTick,
  DownArrowLightMobile,
  UpArrowDeep,
} from 'src/components/icon';
import { FormattedMessage, useIntl } from 'react-intl';
import { SelectModal } from 'src/components/layout/SelectModal';
import MobilePoolRow from 'src/pages/pools/LiquidityPage/MobileLiquidityPage/MobilePoolRow';
import { find } from 'lodash';
import React from 'react';

const LiquidityV1PoolsMobile = ({
  enableIdSearch,
  handleEnableIdSearching,
  inputRef,
  allPools,
  setShowPoolIDTip,
  onSearch,
  symbolsArr,
  handleIdSearching,
  tokenName,
  isSignedIn,
  setShowAddPoolModal,
  showPoolIDTip,
  onOrderChange,
  order,
  showSelectModal,
  setShowSelectModal,
  sortBy,
  onSortChange,
  poolSortingFunc,
  selectCoinClass,
  poolTokenMetas,
  watchPools,
  farmCounts,
  farmAprById,
  filterList,
  setSelectCoinClass,
  farmOnly,
  setFarmOnly,
  hideLowTVL,
  onHide,
  pools,
  volumes,
}: any) => {
  const intl = useIntl();

  return (
    <Card className="w-full" bgcolor="bg-cardBg" padding="p-0 pb-4">
      <div className="mx-4 flex items-center justify-between my-4">
        <div className="flex items-center">
          <div className="text-white text-base">Pools</div>
        </div>
      </div>

      <div className="rounded my-2 text-gray-400 flex items-center pr-2 mx-4 mb-5">
        <div className="relative flex items-center flex-grow bg-inputDarkBg rounded-md">
          <button
            type="button"
            className={` flex items-center justify-center px-2 py-0.5 rounded-lg ml-1 ${
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
            className={`text-sm outline-none rounded py-2 pl-3 pr-7 flex-grow `}
            placeholder={
              enableIdSearch
                ? intl.formatMessage({
                    id: 'input_pool_id',
                    defaultMessage: 'Input pool Id',
                  })
                : intl.formatMessage({
                    id: 'search_by_token',
                  })
            }
            inputMode={enableIdSearch ? 'decimal' : 'text'}
            type={enableIdSearch ? 'number' : 'text'}
            onChange={(evt) => {
              inputRef.current.value = evt.target.value;
              if (enableIdSearch && Number(evt.target.value) >= allPools) {
                setShowPoolIDTip(true);
              } else {
                setShowPoolIDTip(false);
              }
              !enableIdSearch
                ? onSearch(evt.target.value)
                : sessionStorage.setItem(
                    REF_MOBILE_POOL_ID_INPUT,
                    evt.target.value
                  );
            }}
            onKeyDown={(evt) => {
              if (enableIdSearch) {
                symbolsArr.includes(evt.key) && evt.preventDefault();
              }

              if (evt.key === 'Enter' && enableIdSearch) {
                handleIdSearching(inputRef.current.value);
              }
            }}
            defaultValue={
              enableIdSearch
                ? sessionStorage.getItem(REF_MOBILE_POOL_ID_INPUT)
                : tokenName
            }
            onFocus={() => {
              setShowPoolIDTip(false);
            }}
          />

          {showPoolIDTip && <PoolIdNotExist />}
          <SearchIcon
            onClick={() => {
              if (enableIdSearch && !!inputRef.current.value) {
                handleIdSearching(inputRef.current.value);
              }
            }}
            className={`absolute right-1.5 ${
              enableIdSearch ? 'cursor-pointer' : ''
            }`}
          ></SearchIcon>
        </div>
        {isSignedIn ? (
          <div
            className="ml-1 text-xs"
            data-type="info"
            data-place="top"
            data-multiline={true}
            data-class="reactTip"
            data-tooltip-html={`
              <div className="text-xs">
                <div 
                  style="max-width: 250px;font-weight:400",
                >
                ${intl.formatMessage({ id: 'create_new_pool' })}
                </div>
              </div>
            `}
            data-tooltip-id="add_pool_tip"
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
          <div
            className=" inline-flex items-center cursor-pointer mt-2"
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
              {order === 'desc' ? <DownArrowLightMobile /> : <UpArrowDeep />}
            </div>
            <div
              className={`relative rounded-full flex items-center border    ${
                showSelectModal
                  ? 'border-greenColor text-white'
                  : 'border-farmText text-farmText'
              } w-36`}
            >
              <span
                className={`px-2 w-full text-xs h-5
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
        {sortBy === 'apr' && (
          <div className="text-right text-farmText text-xs mr-3 mb-0.5">
            *Pool Fee APY/Top Bin APR + Farm Rewards APR
          </div>
        )}
        <div className="border-b border-gray-700 border-opacity-70" />
        <div className="max-h-96 overflow-y-auto overflow-x-visible pool-list-container-mobile">
          {pools.sort(poolSortingFunc).map((pool, i) => (
            <MobilePoolRow
              tokens={poolTokenMetas[pool.id]}
              pool={pool}
              sortBy={sortBy}
              watched={!!find(watchPools, { id: pool.id })}
              key={i}
              supportFarm={!!farmCounts[pool.id]}
              h24volume={volumes[pool.id]}
              farmApr={farmAprById[pool.id]}
              farmCount={farmCounts[pool.id]}
            />
          ))}
        </div>
      </section>
    </Card>
  );
};

export default LiquidityV1PoolsMobile;
