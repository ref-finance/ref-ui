import React, { useContext, useMemo } from 'react';
import Big from 'big.js';
import { getMemeContractConfig } from './memeConfig';
import { MemeContext } from './context';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { FarmBoost } from '~src/services/farm';
import { formatPercentage } from '../../utils/uiNumber';
import {
  getSeedApr,
  isPending,
  isEnded,
  emptyObject,
  copy,
  getStakingAprUI,
} from './tool';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function APY({ seed_id }: { seed_id: string }) {
  const { seeds } = useContext(MemeContext);
  const seed = seeds?.[seed_id];
  const meme_is_pending = isPending(seed);
  const meme_is_ended = isEnded(seed);
  const noShowMeme = meme_is_pending || meme_is_ended;
  // const apyData = useMemo(() => {
  //   if (!emptyObject(seeds) && !emptyObject(xrefSeeds)) {
  //     const memeSeed = seeds[seed_id];
  //     const xrefSeed = xrefSeeds[MEME_TOKEN_XREF_MAP[seed_id]];
  //     const memeApr = getSeedApr(memeSeed);
  //     const xrefApr = getSeedApr(xrefSeed);
  //     const meme_is_pending = isPending(memeSeed);
  //     const meme_is_ended = isEnded(memeSeed);
  //     const xref_is_pending = isPending(xrefSeed);
  //     const xref_is_ended = isEnded(xrefSeed);
  //     const noShowMeme = meme_is_pending || meme_is_ended;
  //     const noShowXref = xref_is_pending || xref_is_ended;
  //     const noShow = noShowMeme && noShowXref;
  //     return {
  //       memeSeed,
  //       xrefSeed,
  //       memeApr,
  //       xrefApr,
  //       noShowMeme,
  //       noShowXref,
  //       noShow,
  //     };
  //   }
  //   return {};
  // }, [seeds, xrefSeeds]);
  const totalApr = useMemo(() => {
    if (!emptyObject(seed)) {
      return noShowMeme ? '-' : formatPercentage(getSeedApr(seed));
    }
  }, [seed]);
  function getApyTip() {
    const farmList = seed.farmList || [];
    let farmStr = '';
    farmList.forEach((farm: FarmBoost) => {
      farmStr += `<div class="flex items-center justify-between text-xs text-farmText mt-1">
          <img src="${
            farm?.token_meta_data?.icon
          }" class="w-5 h-5 rounded-full" />
          <span class="text-xs">${
            noShowMeme
              ? '-'
              : formatPercentage(
                  Big(farm.apr || 0)
                    .mul(100)
                    .toFixed()
                )
          }</span>
      </div>`;
    });
    const result =
      `<div class="px-2">
       <div>
        <div class="flex items-center justify-between text-xs text-farmText gap-3.5">
          <span>Staking APR</span>
          <span class="text-white text-sm">${noShowMeme ? '-' : totalApr}</span>
        </div>` +
      farmStr +
      `</div>
    </div>`;
    return result;
  }
  return (
    <div className="flex flex-col justify-between gap-0.5 ">
      {/* title */}
      <div
        style={{ width: '40px' }}
        data-class="reactTip"
        data-tooltip-id={`apyId_${seed_id}`}
        data-place="top"
        data-tooltip-html={getApyTip()}
      >
        <span className="text-sm text-white border-b border-dashed border-white relative -top-0.5">
          APY
        </span>
        <CustomTooltip id={`apyId_${seed_id}`} />
      </div>
      {/* content */}
      <span className="text-xl text-white gotham_bold">{totalApr}</span>
    </div>
  );
}
export default APY;
