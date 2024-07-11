import { path } from 'animejs';
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { WalletContext } from '../../utils/wallets-integration';
import { useHistory } from 'react-router-dom';
import { useClientMobile, isMobile } from '../../utils/device';
import {
  getAllTvl,
  getAllVolume24h,
  getYourPools,
  getAllPoolData,
} from '../../services/indexer';
import { PoolTabBanner, PoolTabBannerMask } from '../icon/Pool';
import {
  UserLiquidityInfo,
  CONSTANT_D,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
} from '../../services/commonV3';
import { get_pool, list_liquidities } from '../../services/swapV3';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import {
  useBatchTotalShares,
  useStakeListByAccountId,
  useV3VolumesPools,
} from '../../state/pool';
import { PoolRPCView } from '../../services/api';
import { getVEPoolId } from '../../pages/ReferendumPage';
import {
  isStablePool,
  ALL_STABLE_POOL_IDS,
  NEARX_POOL_ID,
} from '../../services/near';
import getConfig from '../../services/config';
import { useAccountInfo } from '../../state/referendum';
import { getPoolsByIds } from '../../services/indexer';
import { getBoostTokenPrices } from '../../services/farm';
import { TokenMetadata } from '../../services/ft-contract';
import {
  toInternationalCurrencySystem,
  toInternationalCurrencySystemLongString,
} from '../../utils/numbers';
import BigNumber from 'bignumber.js';
import {
  toReadableNumber,
  toPrecision,
  scientificNotationToString,
} from '../../utils/numbers';
import Big from 'big.js';

export const REF_POOL_NAV_TAB_KEY = 'REF_POOL_NAV_TAB_VALUE';

export const PoolTabV3 = ({
  count,
  yourLPpage,
  YourLpValueV1,
  YourLpValueV2,
  lpValueV1Done,
  lpValueV2Done,
}: {
  count?: number;
  yourLPpage?: boolean;
  YourLpValueV2?: string;
  YourLpValueV1?: string;
  lpValueV1Done?: boolean;
  lpValueV2Done?: boolean;
}) => {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [choosedTab, setChoosedTab] = useState('');
  const history = useHistory();

  const [allTVL, setAllTVL] = useState<string>();

  const [allVolume24h, setAllVolume24h] = useState<string>();
  useEffect(() => {
    // getAllTvl().then(setAllTVL);
    // getAllVolume24h().then(setAllVolume24h);

    getAllPoolData().then((res) => {
      setAllTVL(res.tvl);
      setAllVolume24h(res.volume_24h);
    });
  }, []);

  const isMobile = useClientMobile();

  useEffect(() => {
    const pathname = location.pathname;

    if (
      pathname.startsWith('/pool/') ||
      pathname.startsWith('/poolV2') ||
      pathname.startsWith('/more_pools/') ||
      pathname == '/pools' ||
      pathname == '/pools/add'
    ) {
      setChoosedTab('2');
    } else if (pathname == '/yourliquidity') {
      setChoosedTab('1');
    }
  }, []);
  function goPage(url: string) {
    history.push(url);
  }

  const [listLiquidities, setListLiquidities] = useState<UserLiquidityInfo[]>(
    []
  );
  const [listLiquiditiesLoading, setListLiquiditiesLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
    }
  }, [isSignedIn]);

  async function get_list_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    setListLiquiditiesLoading(false);

    if (list.length > 0) {
      list.sort((item1: UserLiquidityInfo, item2: UserLiquidityInfo) => {
        const item1_hashId = +item1.lpt_id.split('#')[1];
        const item2_hashId = +item2.lpt_id.split('#')[1];
        return item1_hashId - item2_hashId;
      });

      setListLiquidities(list);
    }
  }

  const groupedListByPoolId = listLiquidities.reduce((prev, cur) => {
    if (!prev[cur.pool_id]) {
      prev[cur.pool_id] = [];
    }
    prev[cur.pool_id].push(cur);
    return prev;
  }, {});

  const countV2 = listLiquiditiesLoading
    ? 0
    : Object.keys(groupedListByPoolId).length;

  const { finalStakeList, stakeList, v2StakeList, stakeListDone } =
    useStakeListByAccountId();
  const [stablePools, setStablePools] = useState<PoolRPCView[]>();
  const [pools, setPools] = useState<PoolRPCView[]>();

  const { batchTotalShares: batchTotalSharesSimplePools, shares: batchShares } =
    useBatchTotalShares(
      pools?.map((p) => p.id),
      finalStakeList,
      stakeListDone
    );

  const { batchTotalShares, shares: batchStableShares } = useBatchTotalShares(
    stablePools?.map((p) => p.id),
    finalStakeList,
    stakeListDone
  );
  const { lptAmount } = !!getConfig().REF_VE_CONTRACT_ID
    ? useAccountInfo()
    : { lptAmount: '0' };

  useEffect(() => {
    const ids = ALL_STABLE_POOL_IDS;

    getPoolsByIds({ pool_ids: ids }).then((res) => {
      setStablePools(res.filter((p) => p.id.toString() !== NEARX_POOL_ID));
    });
  }, []);
  useEffect(() => {
    if (!isSignedIn) return;

    getYourPools().then((res) => {
      setPools(res.filter((p) => !isStablePool(p.id.toString())));
    });
  }, [isSignedIn]);

  const countV1 =
    batchTotalSharesSimplePools
      ?.map((n, i) =>
        n + Number(pools?.[i].id) === Number(getVEPoolId())
          ? Number(lptAmount) + n
          : n
      )
      ?.reduce((acc, cur) => {
        return cur > 0 ? acc + 1 : acc;
      }, 0) +
    batchTotalShares?.reduce((acc, cur) => (cur > 0 ? acc + 1 : acc), 0);
  return (
    <>
      {!isMobile ? (
        <>
          <div
            className={`flex w-screen h-48 absolute top-0 z-0 items-center justify-center  bg-poolBanner text-primaryText font-bold mb-7 text-lg  p-1 `}
            style={{
              top: '-150px',
            }}
          >
            <div className="flex items-center relative top-16 w-1000px">
              <div
                className="right-0 absolute "
                style={{
                  top: '-30px',
                }}
              >
                <PoolTabBanner />
                <div className="absolute  bottom-0 -right-32">
                  <PoolTabBannerMask />
                </div>
                <div className="flex absolute bottom-3 left-20 items-center ">
                  {!yourLPpage && (
                    <div className="flex flex-col ml-8 mr-12">
                      <span className="text-white text-xl  gotham_bold">
                        {!allTVL
                          ? '-'
                          : `$` +
                            toInternationalCurrencySystem(
                              new Big(allTVL || '0').toFixed(3),
                              2
                            )}
                      </span>

                      <span className="text-sm text-primaryText gotham_font">
                        <FormattedMessage
                          id="tvl_total_value_locked"
                          defaultMessage={'TVL (Total Value Locked)'}
                        />
                      </span>
                    </div>
                  )}{' '}
                  {!yourLPpage && (
                    <div className="flex flex-col">
                      <span className="text-white text-xl  gotham_bold">
                        {!allVolume24h
                          ? '-'
                          : `$` +
                            toInternationalCurrencySystem(
                              new Big(allVolume24h).toFixed(3),
                              2
                            )}
                      </span>

                      <span className="text-sm text-primaryText gotham_font">
                        <FormattedMessage
                          id="volume_24h"
                          defaultMessage={'Volume (24h)'}
                        />
                      </span>
                    </div>
                  )}
                  {yourLPpage && (
                    <div className="flex flex-col ml-6">
                      {!lpValueV1Done || !lpValueV2Done ? (
                        <span className="text-white text-xl  gotham_bold">
                          $-
                        </span>
                      ) : (
                        <span className="text-white text-xl  gotham_bold">
                          $
                          {toInternationalCurrencySystem(
                            new Big(YourLpValueV1)
                              .plus(YourLpValueV2)
                              .toFixed(),
                            2
                          )}
                        </span>
                      )}

                      <span className="text-sm text-primaryText gotham_font">
                        <FormattedMessage
                          id="your_liquidity_value"
                          defaultMessage={'Your Liquidity Value'}
                        />
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className=" items-center z-20 flex">
                <span
                  className={`mr-12 flex items-end justify-center h-full flex-grow text-center cursor-pointer ${
                    choosedTab == '2' ? ' text-white rounded-xl' : ''
                  }`}
                  onClick={() => {
                    sessionStorage.setItem(REF_POOL_NAV_TAB_KEY, '/pools');
                    goPage('/pools');
                  }}
                >
                  <FormattedMessage id={'pools'} defaultMessage={'Pools'} />
                </span>
                <span
                  className={`flex items-center justify-center h-full  flex-grow text-center cursor-pointer ${
                    choosedTab == '1' ? ' text-white rounded-xl' : ''
                  }`}
                  onClick={() => {
                    sessionStorage.setItem(
                      REF_POOL_NAV_TAB_KEY,
                      '/yourliquidity'
                    );

                    goPage('/yourliquidity');
                  }}
                >
                  <FormattedMessage
                    id="Your_Liquidity"
                    defaultMessage="Your Liquidity"
                  />
                  {!isNaN(countV1) &&
                    !isNaN(countV2) &&
                    !listLiquiditiesLoading && (
                      <span
                        className={`bg-senderHot flex items-center justify-center gotham_bold ${
                          !yourLPpage ? 'bg-opacity-30' : ''
                        }   px-2.5 ml-2 rounded-t-xl rounded-br-xl text-sm text-black`}
                        style={{
                          height: '18px',
                        }}
                      >
                        {countV1 + countV2}
                      </span>
                    )}
                </span>
              </div>
            </div>
          </div>
          <div className="h-1 mb-12"></div>
        </>
      ) : (
        <div
          className={`flex items-center justify-between rounded-2xl bg-cardBg text-primaryText font-normal mb-7 text-lg  p-1 mx-auto xl:w-1/3 2xl:w-1/3 3xl:w-1/4 lg:w-1/2 md:w-5/6 xs:w-auto xs:mx-2`}
          style={{
            height: '50px',
          }}
        >
          <span
            className={`flex items-center justify-center h-full  flex-grow text-center cursor-pointer ${
              choosedTab == '1' ? 'bg-tabChosen text-white rounded-xl' : ''
            }`}
            onClick={() => {
              sessionStorage.setItem(REF_POOL_NAV_TAB_KEY, '/yourliquidity');

              goPage('/yourliquidity');
            }}
          >
            <FormattedMessage
              id="Your_Liquidity"
              defaultMessage="Your Liquidity"
            />
            {count && isMobile && choosedTab === '3' ? `(${count})` : ''}
          </span>
          <span
            className={`flex items-center justify-center h-full flex-grow text-center cursor-pointer ${
              choosedTab == '2' ? 'bg-tabChosen text-white rounded-xl' : ''
            }`}
            onClick={() => {
              sessionStorage.setItem(REF_POOL_NAV_TAB_KEY, '/pools');

              goPage('/pools');
            }}
          >
            <FormattedMessage
              id={isMobile ? 'pools' : 'view_pools'}
              defaultMessage={isMobile ? 'Pools' : 'View Pools'}
            />
          </span>
        </div>
      )}
    </>
  );
};
