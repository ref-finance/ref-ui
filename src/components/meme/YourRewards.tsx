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
import { emptyObject } from './tool';
import { TokenMetadata } from '~src/services/ft-contract';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function YourRewards({ seed_id }: { seed_id: string }) {
  const xrefContractId = MEME_TOKEN_XREF_MAP[seed_id];
  const {
    tokenPriceList,
    memeFarmContractUserData,
    xrefFarmContractUserData,
    allTokenMetadatas,
  } = useContext(MemeContext);
  const yourRewardsData = useMemo(() => {
    if (
      memeFarmContractUserData &&
      xrefFarmContractUserData &&
      !emptyObject(allTokenMetadatas)
    ) {
      const memeUnclaimed =
        memeFarmContractUserData.unclaimed_rewards?.[seed_id] || {};
      const xrefUnclaimed =
        xrefFarmContractUserData[xrefContractId].unclaimed_rewards || {};
      const sumUnclaimed = Object.entries({
        ...memeUnclaimed,
        ...xrefUnclaimed,
      }).reduce((sum, [tokenId, amount]: [tokenId: string, amount: string]) => {
        const metadata = allTokenMetadatas[tokenId];
        const num = toReadableNumber(metadata.decimals, amount);
        return {
          ...sum,
          [tokenId]: Big(sum[tokenId] || 0)
            .plus(num)
            .toFixed(),
        };
      }, {});
      const sumUnclaimedValue = Object.entries(sumUnclaimed)
        .reduce(
          (acc, [tokenId, amount]: [tokenId: string, amount: string]) =>
            acc.plus(Big(tokenPriceList[tokenId]?.price || 0).mul(amount)),
          Big(0)
        )
        .toFixed();
      return {
        unclaimedTotalValue: sumUnclaimedValue,
        unclaimedRewards: sumUnclaimed,
      };
    }
    return {};
  }, [memeFarmContractUserData, xrefFarmContractUserData, tokenPriceList]);
  function getRewardsTip() {
    let result = '';
    Object.entries(yourRewardsData.unclaimedRewards || {}).forEach(
      ([tokenId, amount]) => {
        const metadata: TokenMetadata = allTokenMetadatas[tokenId];
        result += `<div class="flex items-center justify-between text-xs text-farmText mt-1 gap-5">
          <img src="${metadata?.icon}" class="w-5 h-5 rounded-full" />
          <span class="text-xs">${toInternationalCurrencySystem_number(
            amount
          )}</span>
      </div>`;
      }
    );
    return result;
  }
  return (
    <div className="flex flex-col justify-between gap-0.5 ">
      {/* title */}
      <div
        style={{ width: '90px' }}
        data-class="reactTip"
        data-tooltip-id={`rewards_${seed_id}`}
        data-place="top"
        data-tooltip-html={getRewardsTip()}
      >
        <span
          className={`text-sm text-white relative -top-0.5 ${
            Object.keys(yourRewardsData.unclaimedRewards || {}).length
              ? 'border-b border-dashed border-white'
              : ''
          }`}
        >
          Your Reward
        </span>
        <CustomTooltip id={`rewards_${seed_id}`} />
      </div>
      {/* content */}
      <span className="text-xl text-white gotham_bold">
        {toInternationalCurrencySystem_usd(yourRewardsData.unclaimedTotalValue)}
      </span>
    </div>
  );
}
export default YourRewards;
