import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import { isMobile } from '../../utils/device';
import { ArrowRightTopIcon } from './icons';
import MyPieChart from './VoteChart';
import VoteModal from './VoteModal';
import { MemeContext } from './context';
import { getMemeContractConfig, getMemeDataConfig } from './memeConfig';
import { Seed } from '../../services/farm';
import { toReadableNumber } from '../../utils/numbers';
import { toInternationalCurrencySystem_number } from '../../utils/uiNumber';
import { WalletContext } from '../../utils/wallets-integration';
import { emptyObject } from './tool';
const memeDataConfig = getMemeDataConfig();
const memeContractConfig = getMemeContractConfig();
function VoteSheet({ hidden }: { hidden: boolean }) {
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const {
    xrefSeeds,
    xrefTokenId,
    allTokenMetadatas,
    xrefFarmContractUserData,
  } = useContext(MemeContext);
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
    <div className={`text-primaryText ${hidden ? 'hidden' : ''}`}>
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
        <div className="w-2/5">
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
              <div
                className={`px-5 grid grid-cols-${
                  isSignedIn ? 4 : 3
                } border-b border-memeVoteBgColor pb-2`}
              >
                <div className="col-span-2">Meme Project</div>
                <div className="justify-self-end">xREF</div>
                {isSignedIn ? (
                  <div className="justify-self-end">You Voted</div>
                ) : null}
              </div>
              <div
                className="pt-3 pl-5 pr-4 text-white"
                style={{ maxHeight: '300px', overflow: 'auto' }}
              >
                {!emptyObject(xrefSeeds) &&
                  Object.entries(MEME_TOKEN_XREF_MAP).map(
                    ([memeTokenId, xrefContractId]) => {
                      const xrefSeed: Seed = xrefSeeds[xrefContractId];
                      const userStakedAmount = toReadableNumber(
                        xrefSeed.seed_decimal,
                        xrefFarmContractUserData?.[xrefContractId]
                          ?.join_seeds?.[xrefTokenId]?.free_amount || '0'
                      );
                      const seedTotalStakedAmount = toReadableNumber(
                        xrefSeed.seed_decimal,
                        xrefSeed.total_seed_amount
                      );
                      return (
                        <div
                          key={memeTokenId}
                          className={`grid grid-cols-${
                            isSignedIn ? 4 : 3
                          } mb-5`}
                        >
                          <div className="flex items-center col-span-2">
                            <div className="flex items-center gap-1.5">
                              <img
                                className="w-5 h-5 rounded-full"
                                src={allTokenMetadatas?.[memeTokenId]?.icon}
                              />
                              <p
                                className="overflow-hidden w-24 whitespace-nowrap"
                                style={{ textOverflow: 'ellipsis' }}
                              >
                                {allTokenMetadatas?.[memeTokenId]?.symbol}
                              </p>
                            </div>
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
                          <div className="justify-self-end gotham_bold">
                            {toInternationalCurrencySystem_number(
                              seedTotalStakedAmount
                            )}
                          </div>
                          {isSignedIn ? (
                            <div className="justify-self-end gotham_bold">
                              {toInternationalCurrencySystem_number(
                                userStakedAmount
                              )}
                            </div>
                          ) : null}
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
        <VoteModal
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
