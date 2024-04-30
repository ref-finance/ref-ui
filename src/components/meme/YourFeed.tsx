import React, { useMemo, useContext } from 'react';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import Big from 'big.js';
import { toReadableNumber } from '../../utils/numbers';
import {
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from '../../utils/uiNumber';
import { getMemeContractConfig } from './memeConfig';
import { MemeContext } from './context';
import { emptyObject, formatLineUi } from './tool';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function YourFeed({ seed_id }: { seed_id: string }) {
  const xrefContractId = MEME_TOKEN_XREF_MAP[seed_id];
  const {
    xrefFarmContractUserData,
    memeFarmContractUserData,
    seeds,
    xrefSeeds,
    xrefTokenId,
    tokenPriceList,
  } = useContext(MemeContext);
  const youFeedData = useMemo(() => {
    let totalTvl = Big(0);
    let memeAmount = Big(0);
    let xrefAmount = Big(0);
    if (memeFarmContractUserData && xrefFarmContractUserData) {
      const userSeed = memeFarmContractUserData.join_seeds[seed_id];
      const userXrefSeed =
        xrefFarmContractUserData[xrefContractId]?.join_seeds?.[xrefTokenId];
      if (userSeed && !emptyObject(seeds)) {
        const { free_amount } = userSeed;
        const { seed_decimal } = seeds[seed_id];
        const amount = toReadableNumber(seed_decimal, free_amount);
        const value = new Big(amount)
          .mul(tokenPriceList[seed_id]?.price || 0)
          .toFixed();
        totalTvl = totalTvl.plus(value);
        memeAmount = memeAmount.plus(amount);
      }
      if (userXrefSeed && !emptyObject(xrefSeeds)) {
        const { free_amount } = userXrefSeed;
        const { seed_decimal } = xrefSeeds[xrefContractId];
        const amount = toReadableNumber(seed_decimal, free_amount);
        const value = new Big(amount)
          .mul(tokenPriceList[xrefTokenId]?.price || 0)
          .toFixed();
        totalTvl = totalTvl.plus(value);
        xrefAmount = xrefAmount.plus(amount);
      }
    }
    return {
      memeAmount,
      xrefAmount,
      totalTvl,
    };
  }, [
    xrefFarmContractUserData,
    memeFarmContractUserData,
    seeds,
    tokenPriceList,
  ]);
  const isEmpty =
    formatLineUi(
      toInternationalCurrencySystem_usd(youFeedData.totalTvl.toFixed())
    ) == '-';
  function getYourFeedTip() {
    if (isEmpty) return '';
    return `
        <div class="flex flex-col gap-1">
        <div class="flex items-center gap-5">
          <img
            class="w-4 h-4 rounded-full"
            src=${seeds?.[seed_id]?.token_meta_data?.icon}
          />
          <span className="text-sm text-white">
            ${formatLineUi(
              toInternationalCurrencySystem_number(
                youFeedData.memeAmount.toFixed()
              )
            )}
          </span>
        </div>
        <div class="flex items-center gap-5">
          <img
            class="w-4 h-4 rounded-full"
            src=${xrefSeeds?.[xrefContractId]?.token_meta_data?.icon}
          />
          <span class="text-sm text-white">
          ${formatLineUi(
            toInternationalCurrencySystem_number(
              youFeedData.xrefAmount.toFixed()
            )
          )}
          </span>
        </div>
      </div>
    `;
  }
  return (
    <div className="flex flex-col justify-between gap-0.5 ">
      {/* title */}
      <span className="text-sm text-white">Your Feed</span>
      {/* content */}
      <div
        style={{ width: '90px' }}
        data-class="reactTip"
        data-tooltip-id={`yourFeed_${seed_id}`}
        data-place="top"
        data-tooltip-html={getYourFeedTip()}
      >
        <span
          className={`text-xl gotham_bold text-white ${
            isEmpty ? '' : 'border-b border-dashed border-white'
          }`}
        >
          {formatLineUi(
            toInternationalCurrencySystem_usd(youFeedData.totalTvl.toFixed())
          )}
        </span>
        <CustomTooltip id={`yourFeed_${seed_id}`} />
      </div>
    </div>
  );
}
export default YourFeed;
