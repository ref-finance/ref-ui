import Big from 'big.js';
import { Seed, FarmBoost } from '~src/services/farm';
import { formatPercentageUi } from '../../utils/uiNumber';
import { toReadableNumber } from '../../utils/numbers';
import { getMemeContractConfig, getMemeDataConfig } from './memeConfig';
import { IFarmAccount } from './context';

export function getSeedApr(seed: Seed) {
  if (!seed || isEnded(seed)) return '0';
  const farms = seed.farmList;
  let apr = new Big(0);
  const allPendingFarms = isPending(seed);
  farms.forEach(function (item: FarmBoost) {
    const pendingFarm = item.status == 'Created' || item.status == 'Pending';
    if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
      apr = apr.plus(item.apr);
    }
  });
  return apr.mul(100).toFixed();
}
export function getTotalRewardBalance(seed: Seed, extraBalance) {
  if (!seed || isEnded(seed)) return Big(extraBalance || 0).toFixed();
  const balance_fromFarm = Big(seed.farmList[0]?.total_reward || 0)
    .plus(extraBalance)
    .toFixed();
  return balance_fromFarm;
}
export function isPending(seed: Seed) {
  let pending: boolean = true;
  const farms = seed.farmList;
  for (let i = 0; i < farms.length; i++) {
    if (farms[i].status != 'Created' && farms[i].status != 'Pending') {
      pending = false;
      break;
    }
  }
  return pending;
}
export function isEnded(seed: Seed) {
  let isEnded: boolean = true;
  const farms = seed.farmList;
  for (let i = 0; i < farms.length; i++) {
    if (farms[i].status != 'Ended') {
      isEnded = false;
      break;
    }
  }
  return isEnded;
}
export function formatSeconds(seconds) {
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  let result = '';
  if (days > 0) {
    result += days + ' ' + 'days' + ' ';
  }
  if (hours > 0) {
    result += hours + ' ' + 'hour' + ' ';
  }
  if (minutes > 0) {
    result += minutes + ' ' + 'min';
  }
  return result.trim();
}
export function formatSecondsAbb(seconds) {
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  let result = '';
  if (days > 0) {
    result += days + 'd' + ' ';
  }
  if (hours > 0) {
    result += hours + 'h' + ' ';
  }
  if (minutes > 0) {
    result += minutes + 'm';
  }
  return result.trim();
}
export function getStakingApr(memeSeed: Seed, xrefSeed: Seed) {
  const memeApr = getSeedApr(memeSeed);
  const xrefApr = getSeedApr(xrefSeed);
  const meme_is_pending = isPending(memeSeed);
  const meme_is_ended = isEnded(memeSeed);
  const xref_is_pending = isPending(xrefSeed);
  const xref_is_ended = isEnded(xrefSeed);
  const noShowMeme = meme_is_pending || meme_is_ended;
  const noShowXref = xref_is_pending || xref_is_ended;
  const noShow = noShowMeme && noShowXref;
  if (noShow) return 0;
  let totalApr = Big(0);
  if (!noShowMeme) {
    totalApr = totalApr.plus(memeApr);
  } else if (!noShowXref) {
    totalApr = totalApr.plus(xrefApr);
  } else {
    totalApr = totalApr.plus(xrefApr).plus(memeApr).div(200).mul(100);
  }
  return totalApr.toFixed();
}
export function getStakingAprUI(memeSeed: Seed, xrefSeed: Seed) {
  const apr = getStakingApr(memeSeed, xrefSeed);
  if (!apr) return '-';
  return formatPercentageUi(apr);
}
export function weight({
  memeSeeds,
  xrefSeeds,
  memeSeed,
  xrefSeed,
}: {
  memeSeeds: Record<string, Seed>;
  xrefSeeds: Record<string, Seed>;
  memeSeed: Seed;
  xrefSeed: Seed;
}) {
  const totalTvl = getTotalStaked(memeSeeds, xrefSeeds);
  const memeSeedTvl = memeSeed?.seedTvl || 0;
  const xrefSeedTvl = xrefSeed?.seedTvl || 0;
  const seedTvl = Big(memeSeedTvl).plus(xrefSeedTvl);
  const apy = totalTvl.gt(0) ? Big(seedTvl).div(totalTvl).mul(100) : Big(0);
  return {
    seedTvl,
    totalTvl,
    apy: apy.toFixed(),
  };
}
export function memeWeight({
  displayMemeSeeds,
  seed,
}: {
  displayMemeSeeds: Record<string, Seed>;
  seed: Seed;
}) {
  const totalTvl = getSeedsTotalStaked(displayMemeSeeds);
  const seedTvl = seed?.seedTvl || 0;
  const apy = Big(totalTvl).gt(0)
    ? Big(seedTvl).div(totalTvl).mul(100)
    : Big(0);
  return {
    seedTvl,
    totalTvl,
    apy: apy.toFixed(),
  };
}
export function getTotalStaked(
  xrefSeeds: Record<string, Seed>,
  memeSeeds: Record<string, Seed>
) {
  const memeTotalTvl = Object.entries(memeSeeds || {}).reduce(
    (acc, [, seed]) => {
      return acc.plus(seed.seedTvl || 0);
    },
    Big(0)
  );
  const xrefTotalTvl = Object.entries(xrefSeeds || {}).reduce(
    (acc, [, seed]) => {
      return acc.plus(seed.seedTvl || 0);
    },
    Big(0)
  );
  const totalTvl = memeTotalTvl.plus(xrefTotalTvl);
  return totalTvl;
}
export function getSeedsTotalStaked(seeds: Record<string, Seed>) {
  const totalTvl = Object.entries(seeds)
    .reduce((acc, [, seed]) => {
      return acc.plus(seed.seedTvl || 0);
    }, Big(0))
    .toFixed();
  return totalTvl;
}
export function getAccountFarmData({
  memeFarmContractUserData,
  xrefFarmContractUserData,
  seed_id,
  xrefTokenId,
  seeds,
  tokenPriceList,
  xrefSeeds,
  allTokenMetadatas,
}) {
  const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
  let memeAmount = Big(0);
  let memeUsd = Big(0);
  let xrefAmount = Big(0);
  let xrefUsd = Big(0);
  let memeUnclaimedUsd = Big(0);
  let xrefUnclaimedUsd = Big(0);
  let memeUnclaimed = {};
  let xrefUnclaimed = {};
  const xrefContractId = MEME_TOKEN_XREF_MAP[seed_id];
  const userSeed = memeFarmContractUserData.join_seeds[seed_id];
  const userXrefSeed =
    xrefFarmContractUserData[xrefContractId]?.join_seeds?.[xrefTokenId];
  if (userSeed && !emptyObject(seeds)) {
    const { free_amount } = userSeed;
    const { seed_decimal } = seeds[seed_id];
    const amount = toReadableNumber(seed_decimal, free_amount);
    memeUsd = new Big(amount).mul(tokenPriceList[seed_id]?.price || 0);
    memeAmount = memeAmount.plus(amount);
  }
  if (userXrefSeed && !emptyObject(xrefSeeds)) {
    const { free_amount } = userXrefSeed;
    const { seed_decimal } = xrefSeeds[xrefContractId];
    const amount = toReadableNumber(seed_decimal, free_amount);
    xrefUsd = new Big(amount).mul(tokenPriceList[xrefTokenId]?.price || 0);
    xrefAmount = xrefAmount.plus(amount);
  }
  memeUnclaimed = Object.entries(
    memeFarmContractUserData.unclaimed_rewards?.[seed_id] || {}
  ).reduce((acc, [tokenId, amount]: [string, string]) => {
    return {
      ...acc,
      ...{
        [tokenId]: toReadableNumber(
          allTokenMetadatas?.[tokenId]?.decimals || 0,
          amount
        ),
      },
    };
  }, {});
  xrefUnclaimed = Object.entries(
    xrefFarmContractUserData[xrefContractId].unclaimed_rewards || {}
  ).reduce((acc, [tokenId, amount]: [string, string]) => {
    return {
      ...acc,
      ...{
        [tokenId]: toReadableNumber(
          allTokenMetadatas?.[tokenId]?.decimals || 0,
          amount
        ),
      },
    };
  }, {});
  memeUnclaimedUsd = Object.entries(memeUnclaimed).reduce(
    (acc, [tokenId, amount]: [tokenId: string, amount: string]) =>
      acc.plus(Big(tokenPriceList[tokenId]?.price || 0).mul(amount)),
    Big(0)
  );
  xrefUnclaimedUsd = Object.entries(xrefUnclaimed).reduce(
    (acc, [tokenId, amount]: [tokenId: string, amount: string]) =>
      acc.plus(Big(tokenPriceList[tokenId]?.price || 0).mul(amount)),
    Big(0)
  );
  return {
    memeAmount: memeAmount.toFixed(),
    memeUsd: memeUsd.toFixed(),
    xrefAmount: xrefAmount.toFixed(),
    xrefUsd: xrefUsd.toFixed(),
    memeUnclaimedUsd: memeUnclaimedUsd.toFixed(),
    xrefUnclaimedUsd: xrefUnclaimedUsd.toFixed(),
    memeUnclaimed,
    xrefUnclaimed,
  };
}
export function getAccountButtonStatus({
  memeFarmContractUserData,
  xrefFarmContractUserData,
  MEME_TOKEN_XREF_MAP,
  seed_id,
  xrefTokenId,
}: {
  xrefFarmContractUserData: Record<string, IFarmAccount>;
  memeFarmContractUserData: IFarmAccount;
  MEME_TOKEN_XREF_MAP: Record<string, string>;
  seed_id: string;
  xrefTokenId: string;
}) {
  const memeUnStakeButtonDisabled =
    +(memeFarmContractUserData.join_seeds[seed_id]?.free_amount || 0) == 0;
  const memeClaimButtonDisabled = emptyObject(
    memeFarmContractUserData.unclaimed_rewards[seed_id]
  );
  const xrefUnStakeButtonDisabled =
    +(
      xrefFarmContractUserData[MEME_TOKEN_XREF_MAP[seed_id]].join_seeds[
        xrefTokenId
      ]?.free_amount || 0
    ) == 0;
  const xrefClaimButtonDisabled = emptyObject(
    xrefFarmContractUserData[MEME_TOKEN_XREF_MAP[seed_id]].unclaimed_rewards
  );
  return {
    memeUnStakeButtonDisabled,
    memeClaimButtonDisabled,
    xrefUnStakeButtonDisabled,
    xrefClaimButtonDisabled,
  };
}
export function getListedMemeSeeds(
  memeSeeds: Record<string, Seed>
): Record<string, Seed> {
  const { meme_winner_tokens } = getMemeDataConfig();
  const memeListedSeeds = {};
  meme_winner_tokens.forEach((memeSeedId) => {
    memeListedSeeds[memeSeedId] = memeSeeds[memeSeedId];
  });
  return memeListedSeeds;
}
export function sortByXrefStaked(xrefSeeds: Record<string, Seed>) {
  const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
  return (memeTokenIdB, memeTokenIdA) => {
    const xrefSeedB = xrefSeeds?.[MEME_TOKEN_XREF_MAP[memeTokenIdB]];
    const xrefSeedA = xrefSeeds?.[MEME_TOKEN_XREF_MAP[memeTokenIdA]];
    return (
      +(xrefSeedA?.total_seed_amount || 0) -
      +(xrefSeedB?.total_seed_amount || 0)
    );
  };
}
export function get_meme_token_xref_map_reverse() {
  const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
  const MEME_TOKEN_XREF_MAP_REVERSE = Object.entries(
    MEME_TOKEN_XREF_MAP
  ).reduce(
    (acc, [memeTokenId, xrefContractId]) => ({
      ...acc,
      ...{ [xrefContractId]: memeTokenId },
    }),
    {}
  );
  return MEME_TOKEN_XREF_MAP_REVERSE;
}
export function formatLineUi(v) {
  if (!v || v == '0' || v == '$0' || v == '$-') return '-';
  return v;
}
export function isLineUi(v) {
  if (formatLineUi(v) == '-') return true;
  return false;
}
export function emptyObject(o) {
  if (o && Object.keys(o).length) return false;
  return true;
}
export function emptyNumber(n) {
  if (n && Number(n) > 0) return false;
  return true;
}

export function copy(o) {
  return JSON.parse(JSON.stringify(o));
}
