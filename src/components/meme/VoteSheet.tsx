import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import { isMobile } from '../../utils/device';
import { ArrowRightTopIcon } from './icons';
import MyPieChart from './VoteChart';
import VoteModel from './VoteModel';
import { MemeContext } from './context';
import { getMemeContractConfig, getMemeDataConfig } from './memeConfig';
import { Seed } from '../../services/farm';
import { toReadableNumber } from '../../utils/numbers';
import {
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
  formatPercentage,
  formatPercentageUi,
} from '../../utils/uiNumber';
const memeDataConfig = getMemeDataConfig();
const memeContractConfig = getMemeContractConfig();
function VoteSheet() {
  const [isVoteOpen, setIsVoteOpen] = useState(false);
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
  return (
    <div className="text-primaryText">
      <div className="text-base mb-7">
        Vote for your favorite Meme by staking xREF, so that the Meme you
        support can be listed in the next round of ‘Meme Competition.
      </div>
      <div className="flex gap-12">
        <div className="flex-grow">
          <div className="flex">
            <div>
              <p>Current Round:</p>
              <span className="text-white text-lg">2024/03/18-2024/03/31</span>
            </div>
            <div className="ml-auto">
              <p>Next Round:</p>
              <span className="text-white text-lg">2024/04/01-2024/04/14</span>
            </div>
          </div>
          <div className="flex justify-center">
            <MyPieChart />
          </div>
        </div>
        <div className="w-1/3">
          <div className="bg-memeModelgreyColor rounded-2xl border border-memeBorderColor mb-6">
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
                />
                {toInternationalCurrencySystem_number(
                  totalXrefStaked.toFixed()
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="px-5 flex justify-between items-center border-b border-memeVoteBgColor pb-2">
                <div>Meme Project</div>
                <div>xREF</div>
              </div>
              <div
                className="pt-3 pl-5 pr-4 text-white"
                style={{ maxHeight: '270px', overflow: 'auto' }}
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
                            {memeDataConfig.meme_winner_tokens.includes(
                              memeTokenId
                            ) ? (
                              <div
                                className="ml-1.5 text-black text-xs gotham_bold rounded py-0.5 px-1 bg-senderHot transform"
                                style={{ transform: 'skewX(-20deg)' }}
                              >
                                Listed
                              </div>
                            ) : null}
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
          <div
            className="bg-greenLight rounded-xl w-full text-black text-center gotham_bold text-base py-3.5 mb-4 cursor-pointer"
            onClick={() => {
              setIsVoteOpen(true);
            }}
          >
            Vote Meme by xREF
          </div>
          <div className="flex items-center justify-center text-greenLight text-base">
            <a
              className="inline-flex items-center cursor-pointer"
              href="/xref"
              target="_blank"
            >
              Acquire $xREF <ArrowRightTopIcon />
            </a>
          </div>
        </div>
      </div>
      {isVoteOpen ? (
        <VoteModel
          isOpen={isVoteOpen}
          onRequestClose={() => {
            setIsVoteOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

export default VoteSheet;
