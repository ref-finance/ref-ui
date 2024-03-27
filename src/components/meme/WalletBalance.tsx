import React, { useMemo, useContext } from 'react';
import Big from 'big.js';
import { toReadableNumber } from '../../utils/numbers';
import {
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from '../../utils/uiNumber';
import { getMemeContractConfig } from './memeConfig';
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
      const memeValue = memeBalance.plus(tokenPriceList[seed_id]?.price || 0);
      const xrefValue = xrefBalance.plus(tokenPriceList[seed_id]?.price || 0);
      totalValue = totalValue.plus(memeValue).plus(xrefValue);
    }
    return {
      memeBalance,
      xrefBalance,
      totalValue,
    };
  }, [user_balances, tokenPriceList]);
  return (
    <div className="flex flex-col justify-between gap-0.5 ">
      {/* title */}
      <span className="text-sm text-white">Wallet Balance</span>
      {/* content */}
      <div className="flex flex-col">
        <span className="text-xl gotham_bold text-white">
          {toInternationalCurrencySystem_usd(
            walletBalanceData.totalValue.toFixed()
          )}
        </span>
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1">
            <img
              className="w-4 h-4 rounded-full"
              src={seeds?.[seed_id]?.token_meta_data?.icon}
            />
            <span className="text-sm text-white">
              {toInternationalCurrencySystem_number(
                walletBalanceData.memeBalance.toFixed()
              )}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <img
              className="w-4 h-4 rounded-full"
              src={xrefSeeds?.[xrefContractId]?.token_meta_data?.icon}
            />
            <span className="text-sm text-white">
              {toInternationalCurrencySystem_number(
                walletBalanceData.xrefBalance.toFixed()
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default WalletBalance;
