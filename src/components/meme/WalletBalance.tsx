import React, { useMemo, useContext } from 'react';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import Big from 'big.js';
import { toReadableNumber } from '../../utils/numbers';
import {
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from '../../utils/uiNumber';
import { getMemeContractConfig } from './memeConfig';
import { formatLineUi } from './tool';
import { MemeContext } from './context';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function WalletBalance({ seed_id }: { seed_id: string }) {
  const xrefContractId = MEME_TOKEN_XREF_MAP[seed_id];
  const { seeds, xrefSeeds, xrefTokenId, tokenPriceList, user_balances } =
    useContext(MemeContext);
  const walletBalanceData = useMemo(() => {
    let totalValue = Big(0);
    let memeBalance = Big(0);
    let xrefBalance = Big(0);
    const seed = seeds[seed_id];
    const xrefSeed = xrefSeeds[xrefContractId];
    if (seed && xrefSeed) {
      memeBalance = memeBalance.plus(
        toReadableNumber(seed.seed_decimal, user_balances[seed_id])
      );
      xrefBalance = xrefBalance.plus(
        toReadableNumber(xrefSeed.seed_decimal, user_balances[xrefTokenId])
      );
      const memeValue = memeBalance.mul(tokenPriceList[seed_id]?.price || 0);
      const xrefValue = xrefBalance.mul(
        tokenPriceList[xrefTokenId]?.price || 0
      );
      totalValue = totalValue.plus(memeValue).plus(xrefValue);
    }
    return {
      memeBalance,
      xrefBalance,
      totalValue,
    };
  }, [seeds, xrefSeeds, user_balances, tokenPriceList]);
  const isEmpty =
    formatLineUi(
      toInternationalCurrencySystem_usd(walletBalanceData.totalValue.toFixed())
    ) == '-';
  function getWalletBalanceTip() {
    if (isEmpty) return '';
    return `
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-5">
        <img
          class="w-4 h-4 rounded-full"
          src=${seeds?.[seed_id]?.token_meta_data?.icon}
        />
        <span class="text-sm text-white">
          ${formatLineUi(
            toInternationalCurrencySystem_number(
              walletBalanceData.memeBalance.toFixed()
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
              walletBalanceData.xrefBalance.toFixed()
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
      <span className="text-sm text-white">Wallet Balance</span>
      {/* content */}
      <div
        style={{ width: '90px' }}
        data-class="reactTip"
        data-tooltip-id={`walletBalance_${seed_id}`}
        data-place="top"
        data-tooltip-html={getWalletBalanceTip()}
      >
        <span
          className={`text-xl gotham_bold text-white ${
            isEmpty ? '' : ' border-b border-dashed border-white'
          }`}
        >
          {formatLineUi(
            toInternationalCurrencySystem_usd(
              walletBalanceData.totalValue.toFixed()
            )
          )}
        </span>
        <CustomTooltip id={`walletBalance_${seed_id}`} />
      </div>
    </div>
  );
}
export default WalletBalance;
