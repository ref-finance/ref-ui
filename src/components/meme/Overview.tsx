import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import { MemeContext } from './context';
import { toInternationalCurrencySystem_usd } from '../../utils/uiNumber';
import { getSeedApr } from './tool';
import { formatPercentage } from '../../utils/uiNumber';
import { Seed } from '~src/services/farm';
import { TokenMetadata } from '~src/services/ft-contract';
import { isMobile } from '../../utils/device';
const Overview = () => {
  const { seeds, lpSeeds } = useContext(MemeContext);
  const [totalStaked, maxAprSeed, totalStaker] = useMemo(() => {
    if (!Object.values(seeds).length) return ['-', [], '-'];
    const t_staked = Object.values(seeds).reduce((acc, cur) => {
      return acc.plus(cur.seedTvl || 0);
    }, Big(0));
    const [maxSeed, maxApr] = Object.values(seeds).reduce(
      (acc, seed) => {
        const apr = getSeedApr(seed);
        if (acc[1].gt(apr)) {
          return acc;
        } else {
          return [seed, Big(apr)];
        }
      },
      [seeds[0], Big(0)]
    );
    const totalStaker = Object.values(seeds)
      .reduce((acc, seed) => {
        return acc.plus(seed.farmer_count);
      }, Big(0))
      .toFixed();
    return [
      toInternationalCurrencySystem_usd(t_staked),
      [maxSeed, maxApr.toFixed()],
      totalStaker,
    ];
  }, [seeds]) as any;
  const topApyFarm = useMemo(() => {
    const list = Object.entries(lpSeeds);
    if (!list.length) return [];
    return list.reduce((acc, cur) => {
      const [seedId, seed] = cur;
      const apr = getSeedApr(seed);
      if (!acc[0]) return [seed, apr, seedId];
      if (Big(acc[1]).gt(apr)) {
        return acc;
      } else {
        return [seed, apr, seedId];
      }
    }, []);
  }, [lpSeeds]);
  function goFarmDetail(seed_id: string) {
    const lpSeed = lpSeeds[seed_id];
    if (lpSeed.farmList[0].status == 'Ended') {
      window.open(`/v2farms/${lpSeed.pool.id}-e`);
    } else {
      window.open(`/v2farms/${lpSeed.pool.id}-r`);
    }
  }
  const is_mobile = isMobile();
  return (
    <>
      {is_mobile ? (
        <div className="relative z-50 grid grid-cols-2 pl-6 pr-2 mt-6">
          <TemplateMobile title="Total Staked">
            <span className="text-xl gotham_bold text-white">
              {totalStaked}
            </span>
          </TemplateMobile>
          <TemplateMobile title="Total Stakers">
            <span className="text-xl gotham_bold text-white">
              {totalStaker}
            </span>
          </TemplateMobile>
          <TemplateMobile title="Top Staking APY">
            {+maxAprSeed[1] > 0 ? (
              <div className="flex items-center gap-2">
                <img
                  src={maxAprSeed[0]?.token_meta_data?.icon}
                  className="rounded-full"
                  style={{ height: '26px', width: '26px' }}
                />
                <span className="text-xl gotham_bold text-white">
                  {formatPercentage(maxAprSeed[1])}
                </span>
              </div>
            ) : (
              <span className="text-xl gotham_bold text-white">-</span>
            )}
          </TemplateMobile>
          <TemplateMobile
            title="Top Farm APY"
            onClick={() => {
              if (topApyFarm[0]) {
                goFarmDetail(topApyFarm[2]);
              }
            }}
          >
            {topApyFarm[0] ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {(topApyFarm[0] as Seed).pool?.tokens_meta_data?.map(
                    (token: TokenMetadata) => {
                      return (
                        <img
                          key={token.id}
                          src={token.icon}
                          className="rounded-full -ml-1.5"
                          style={{ width: '26px', height: '26px' }}
                        />
                      );
                    }
                  )}
                </div>
                <span className="text-xl gotham_bold text-white">
                  {formatPercentage(topApyFarm[1])}
                </span>
              </div>
            ) : (
              <span className="text-xl gotham_bold text-white">-</span>
            )}
          </TemplateMobile>
        </div>
      ) : (
        <div className="relative z-50 flex items-center justify-between gap-8">
          <Template title="Total Staked">
            <span className="text-3xl gotham_bold text-white">
              {totalStaked}
            </span>
          </Template>
          <Template title="Top Staking APY">
            {+maxAprSeed[1] > 0 ? (
              <div className="flex items-center gap-2">
                <img
                  src={maxAprSeed[0]?.token_meta_data?.icon}
                  className="rounded-full"
                  style={{ height: '26px', width: '26px' }}
                />
                <span className="text-3xl gotham_bold text-white">
                  {formatPercentage(maxAprSeed[1])}
                </span>
              </div>
            ) : (
              <span className="text-3xl gotham_bold text-white">-</span>
            )}
          </Template>
          <Template
            title="Top Farm APY"
            className="cursor-pointer"
            onClick={() => {
              if (topApyFarm[0]) {
                goFarmDetail(topApyFarm[2]);
              }
            }}
          >
            {topApyFarm[0] ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {(topApyFarm[0] as Seed).pool?.tokens_meta_data?.map(
                    (token: TokenMetadata) => {
                      return (
                        <img
                          key={token.id}
                          src={token.icon}
                          className="rounded-full -ml-1.5"
                          style={{ width: '26px', height: '26px' }}
                        />
                      );
                    }
                  )}
                </div>
                <span className="text-3xl gotham_bold text-white">
                  {formatPercentage(topApyFarm[1])}
                </span>
              </div>
            ) : (
              <span className="text-3xl gotham_bold text-white">-</span>
            )}
          </Template>
          <Template title="Total Stakers">
            <span className="text-3xl gotham_bold text-white">
              {totalStaker}
            </span>
          </Template>
        </div>
      )}
    </>
  );
};

function Template({ title, children, className, ...props }: any) {
  return (
    <div
      {...props}
      className={`flex flex-grow flex-col items-center justify-center border border-memeBorderColor bg-swapCardGradient rounded-2xl ${
        className ? className : ''
      }`}
      style={{ height: '110px' }}
    >
      <span className="text-base text-white">{title}</span>
      {children}
    </div>
  );
}
function TemplateMobile({ title, children, ...props }: any) {
  return (
    <div
      {...props}
      className="flex flex-grow flex-col justify-center w-full gap-1.5"
      style={{ height: '80px' }}
    >
      <span className="text-sm text-white">{title}</span>
      {children}
    </div>
  );
}
export default Overview;
