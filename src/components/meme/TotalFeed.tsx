import React, { useMemo, useContext } from 'react';
import Big from 'big.js';
import { toReadableNumber } from '../../utils/numbers';
import {
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from '../../utils/uiNumber';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { getMemeContractConfig } from './memeConfig';
import { MemeContext } from './context';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function TotalFeed({ seed_id }: { seed_id: string }) {
  const { seeds, xrefSeeds } = useContext(MemeContext);
  const feedData = useMemo(() => {
    const seed = seeds[seed_id];
    const xrefSeed = xrefSeeds[MEME_TOKEN_XREF_MAP[seed_id]];
    if (seed && xrefSeed) {
      const seedAmount = toReadableNumber(
        seed.seed_decimal,
        seed.total_seed_amount
      );
      const seedTvl = seed.seedTvl;
      const xrefSeedAmount = toReadableNumber(
        xrefSeed.seed_decimal,
        xrefSeed.total_seed_amount
      );
      const xrefSeedTvl = xrefSeed.seedTvl;
      return {
        seed,
        xrefSeed,
        seedAmount: toInternationalCurrencySystem_number(seedAmount),
        seedTvl: toInternationalCurrencySystem_usd(seedTvl),
        xrefSeedAmount: toInternationalCurrencySystem_number(xrefSeedAmount),
        xrefSeedTvl: toInternationalCurrencySystem_usd(xrefSeedTvl),
        totalTvl: toInternationalCurrencySystem_usd(
          Big(seedTvl).plus(xrefSeedTvl).toFixed()
        ),
      };
    }
    return;
  }, [seeds, xrefSeeds]);
  function getTipContent() {
    return `<div class="flex flex-col gap-2 text-white">
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-1.5">
          <img src="${feedData?.seed?.token_meta_data?.icon}" class="w-4 h-4 rounded-full" />
          <span class="text-xs">${feedData?.seed?.token_meta_data?.symbol}</span>
        </div>
        <div class="flex flex-col items-end gap-0.5">
          <span class="text-xs gotham_bold">${feedData?.seedAmount}</span>
          <span class="text-xs">${feedData?.seedTvl}</span>
        </div>
      </div>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-1.5">
          <img src="${feedData?.xrefSeed?.token_meta_data?.icon}" class="w-4 h-4 rounded-full" />
          <span class="text-xs">${feedData?.xrefSeed?.token_meta_data?.symbol}</span>
        </div>
        <div class="flex flex-col items-end gap-0.5">
          <span class="text-xs gotham_bold">${feedData?.xrefSeedAmount}</span>
          <span class="text-xs">${feedData?.xrefSeedTvl}</span>
        </div>
      </div>
    </div>`;
  }
  return (
    <div className="flex flex-col justify-between gap-0.5 ">
      {/* title */}
      <span className="text-sm text-white">Total Feed</span>
      {/* content */}
      <div
        style={{ width: '40px' }}
        data-class="reactTip"
        data-tooltip-id={`totalFeed_${feedData?.seed?.seed_id}`}
        data-place="top"
        data-tooltip-html={getTipContent()}
      >
        <span className="text-xl gotham_bold text-white border-b border-dashed border-white relative -top-0.5">
          {feedData?.totalTvl || '-'}
        </span>
        <CustomTooltip id={`totalFeed_${feedData?.seed?.seed_id}`} />
      </div>
    </div>
  );
}
export default TotalFeed;
