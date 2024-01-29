import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import { MemeContext } from './context';
import { toInternationalCurrencySystem_usd } from '../../utils/uiNumber';
import { getSeedApr } from '../../services/meme';
import { formatPercentage } from '../../utils/uiNumber';
import { Seed } from '~src/services/farm';
import { TokenMetadata } from '~src/services/ft-contract';
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
      [maxSeed, formatPercentage(maxApr.toFixed())],
      totalStaker,
    ];
  }, [seeds]) as any;
  const topApyFarm = useMemo(() => {
    const list = Object.entries(lpSeeds);
    if (!list.length) return [];
    return list.reduce((acc, cur) => {
      const [, seed] = cur;
      const apr = getSeedApr(seed);
      if (!acc[0]) return [seed, apr];
      if (Big(acc[1]).gt(apr)) {
        return acc;
      } else {
        return [seed, apr];
      }
    }, []);
  }, [lpSeeds]);
  return (
    <div className="relative z-50 flex items-center justify-between gap-8 xsm:flex-col xsm:mx-4 xsm:gap-4">
      <Template title="Total Staked">
        <span className="text-3xl gotham_bold text-white">{totalStaked}</span>
      </Template>
      <Template title="Top StakingAPY">
        {maxAprSeed[0] ? (
          <div className="flex items-center gap-2">
            <img
              src={maxAprSeed[0]?.token_meta_data?.icon}
              className="rounded-full"
              style={{ height: '26px', width: '26px' }}
            />
            <span className="text-3xl gotham_bold text-white">
              {maxAprSeed[1]}
            </span>
          </div>
        ) : (
          <span className="text-3xl gotham_bold text-white">-</span>
        )}
      </Template>
      <Template title="Top Farm APY">
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
      <Template title="Total Staker">
        <span className="text-3xl gotham_bold text-white">{totalStaker}</span>
      </Template>
    </div>
  );
};

function Template({ title, children }: any) {
  return (
    <div
      className="flex flex-grow flex-col items-center justify-center border border-memeBorderColor bg-swapCardGradient rounded-2xl xsm:w-full"
      style={{ height: '110px' }}
    >
      <span className="text-base text-white">{title}</span>
      {children}
    </div>
  );
}
export default Overview;
