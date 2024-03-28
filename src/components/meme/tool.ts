import Big from 'big.js';
import { Seed, FarmBoost } from '~src/services/farm';
import { formatPercentageUi } from '../../utils/uiNumber';
// getMemeSeedApr
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
  const memeTotalTvl = Object.entries(memeSeeds).reduce((acc, [, seed]) => {
    return acc.plus(seed.seedTvl || 0);
  }, Big(0));
  const xrefTotalTvl = Object.entries(xrefSeeds || {}).reduce(
    (acc, [, seed]) => {
      return acc.plus(seed.seedTvl || 0);
    },
    Big(0)
  );
  const memeSeedTvl = memeSeed?.seedTvl || 0;
  const xrefSeedTvl = xrefSeed?.seedTvl || 0;
  const seedTvl = Big(memeSeedTvl).plus(xrefSeedTvl);
  const totalTvl = memeTotalTvl.plus(xrefTotalTvl);
  const apy = totalTvl.gt(0) ? Big(seedTvl).div(totalTvl).mul(100) : Big(0);
  return {
    seedTvl,
    totalTvl,
    apy: apy.toFixed(),
  };
}
export function emptyObject(o) {
  if (Object.keys(o).length) return false;
  return true;
}
export function copy(o) {
  return JSON.parse(JSON.stringify(o));
}
