import { Pool } from 'src/services/pool';
import { scientificNotationToString, toPrecision } from 'src/utils/numbers';

export const REF_FI_POOL_ACTIVE_TAB = 'REF_FI_POOL_ACTIVE_TAB_VALUE';

export function getPoolFeeApr(
  dayVolume: string,
  pool: Pool,
  tvlInput?: number
) {
  let result = '0';
  if (dayVolume) {
    const { fee, tvl } = pool;

    const newTvl = tvlInput || tvl;

    const revenu24h = (fee / 10000) * 0.8 * Number(dayVolume);
    if (newTvl > 0 && revenu24h > 0) {
      const annualisedFeesPrct = ((revenu24h * 365) / newTvl) * 100;
      result = toPrecision(
        scientificNotationToString(annualisedFeesPrct.toString()),
        2
      );
    }
  }
  return Number(result);
}

export const getPoolListFarmAprTip = () => {
  return `
    <div 
      class="flex flex-col text-xs min-w-36 text-farmText z-50"
    >
      <div>
      Pool Fee APY
      </div>

      <div>
      
      + Farm Rewards APR
      </div>
    
   

    </div>
`;
};
