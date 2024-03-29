import React, { useContext, useMemo } from 'react';
import Big from 'big.js';
import { isMobile } from '../../utils/device';
import MyPieChart from './VoteChart';
import { MemeContext } from './context';
import { getMemeContractConfig, getMemeDataConfig } from './memeConfig';
import { Seed } from '../../services/farm';
import { toReadableNumber } from '../../utils/numbers';
import { toInternationalCurrencySystem_number } from '../../utils/uiNumber';
import { emptyObject } from './tool';

const memeContractConfig = getMemeContractConfig();
function VoteXrefBox() {
  const { xrefSeeds, xrefTokenId, allTokenMetadatas } = useContext(MemeContext);
  const { MEME_TOKEN_XREF_MAP } = memeContractConfig;
  const totalXrefStaked = useMemo(() => {
    return Object.values(xrefSeeds || {}).reduce((sum, seed: Seed) => {
      const seedTotalStakedAmount = toReadableNumber(
        seed.seed_decimal,
        seed.total_seed_amount
      );
      return sum.plus(seedTotalStakedAmount);
    }, new Big(0));
  }, [xrefSeeds]);
  const cardWidth = isMobile() ? '90vw' : '25vw';
  return (
    <div className="flex items-start gap-14 text-primaryText mt-20">
      <div className="flex justify-center flex-grow transform translate-y-2">
        <MyPieChart />
      </div>
      <div className="mb-6 flex-shrink-0" style={{ width: cardWidth }}>
        <div className="flex justify-between pt-5 pb-4 px-5 text-white text-base items-center gotham_bold">
          <div>Total xREF</div>
          <div className="text-3xl flex items-center">
            <img
              src={allTokenMetadatas?.[xrefTokenId]?.icon}
              style={{
                width: '26px',
                height: '29px',
                marginRight: '10px',
              }}
              className="rounded-full"
            />
            {toInternationalCurrencySystem_number(totalXrefStaked.toFixed())}
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="px-5 flex justify-between items-center border-b border-memeVoteBgColor pb-2">
            <div>Meme Project</div>
            <div>xREF</div>
          </div>
          <div
            className="pt-3 pl-5 pr-4 text-white"
            style={{ maxHeight: '300px', overflow: 'auto' }}
          >
            {Object.keys(xrefSeeds).length &&
              Object.entries(MEME_TOKEN_XREF_MAP).map(
                ([memeTokenId, xrefContractId]) => {
                  const xrefSeed: Seed = xrefSeeds[xrefContractId];
                  const seedTotalStakedAmount = toReadableNumber(
                    xrefSeed.seed_decimal,
                    xrefSeed.total_seed_amount
                  );
                  return (
                    <div
                      key={memeTokenId}
                      className="flex justify-between mb-5"
                    >
                      <div className="flex items-center">
                        <p>{allTokenMetadatas?.[memeTokenId]?.symbol}</p>
                      </div>
                      <div className="gotham_bold">
                        {toInternationalCurrencySystem_number(
                          seedTotalStakedAmount
                        )}
                      </div>
                    </div>
                  );
                }
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoteXrefBox;
