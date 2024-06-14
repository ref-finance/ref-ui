import React, { useState, useContext, useMemo, useRef, useEffect } from 'react';
import Big from 'big.js';
import { isMobile } from '../../utils/device';
import { ArrowRightTopIcon } from './icons';
import MyPieChart from './VoteChart';
import VoteModal from './VoteModal';
import { MemeContext } from './context';
import { getMemeContractConfig, getMemeDataConfig } from './memeConfig';
import { Seed } from '../../services/farm';
import { toReadableNumber } from '../../utils/numbers';
import {
  toInternationalCurrencySystem_number,
  formatPercentage,
} from '../../utils/uiNumber';
import { WalletContext } from '../../utils/wallets-integration';
import {
  sortByXrefStaked,
  getSeedApr,
  getTotalRewardBalance,
  emptyObject,
} from './tool';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
const is_mobile = isMobile();
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
    donateBalances,
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
      <div className="text-base mb-7 xsm:text-center xsm:px-6">
        Vote for your favorite Meme by staking xREF, so that the Meme you
        support can be listed in the next round of ‘Meme Competition.
      </div>
      <div className="flex gap-12 xsm:flex-col xsm:gap-9">
        <div className="flex-grow xsm:px-6">
          <div className="flex justify-between xsm:flex-col xsm:items-center xsm:gap-5">
            <div>
              <p className="text-base text-center">Current Round:</p>
              <span className="text-white text-lg text-center">
                2024/05/04-2024/06/03
              </span>
            </div>
            <div>
              <p className="text-base text-center">Next Round:</p>
              <span className="text-white text-lg text-center">
                2024/06/04-2024/07/03
              </span>
            </div>
          </div>
          <div className="flex justify-center mt-14 xsm:mt-10">
            <MyPieChart />
          </div>
        </div>
        <div className="w-2/5 xsm:w-full">
          <div className="bg-memeModelgreyColor rounded-2xl border border-memeBorderColor mb-6 xsm:bg-transparent xsm:border-transparent">
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
                } border-b border-memeVoteBgColor pb-2 text-sm`}
              >
                <div className="col-span-2">Meme Project</div>
                <div className="justify-self-end">xREF</div>
                {isSignedIn ? (
                  <div className="justify-self-end">Yours</div>
                ) : null}
              </div>
              <div
                className=" text-white text-base"
                style={{ maxHeight: '300px', overflow: 'auto' }}
              >
                <div className="relative pt-3 pl-5 pr-4 xsm:pb-px">
                  {!emptyObject(xrefSeeds) &&
                    Object.keys(MEME_TOKEN_XREF_MAP)
                      .sort(sortByXrefStaked(xrefSeeds))
                      .map((memeTokenId) => {
                        const xrefContractId = MEME_TOKEN_XREF_MAP[memeTokenId];
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
                        function getXrefTip() {
                          const apr = getSeedApr(xrefSeed);
                          const totalMemeReward = toReadableNumber(
                            allTokenMetadatas?.[memeTokenId]?.decimals || 0,
                            getTotalRewardBalance(
                              xrefSeed,
                              donateBalances?.[memeTokenId] || 0
                            )
                          );
                          return `<div class="px-2">
                                  <div class="flex items-center justify-between text-xs text-farmText gap-3.5">
                                    <span>Reward ${
                                      allTokenMetadatas?.[memeTokenId]?.symbol
                                    }</span>
                                    <span class="text-white text-sm">${toInternationalCurrencySystem_number(
                                      totalMemeReward
                                    )}</span>
                                  </div>
                                  <div class="flex items-center justify-between text-xs text-farmText gap-3.5 my-1">
                                    <span>Staking xREF APR</span>
                                    <span class="text-white text-sm">${formatPercentage(
                                      apr
                                    )}</span>
                                  </div>
                                </div>`;
                        }
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
                                  className="overflow-hidden w-24 whitespace-nowrap xsm:w-20"
                                  style={{ textOverflow: 'ellipsis' }}
                                >
                                  {allTokenMetadatas?.[memeTokenId]?.symbol}
                                </p>
                              </div>
                              {memeDataConfig.meme_winner_tokens.includes(
                                memeTokenId
                              ) ? (
                                <div
                                  className="ml-1 text-black text-xs gotham_bold rounded py-0.5 px-1 bg-senderHot transform xsm:ml-0"
                                  style={{ transform: 'skewX(-20deg)' }}
                                >
                                  Listed
                                </div>
                              ) : null}
                            </div>
                            <div
                              data-class="reactTip"
                              data-tooltip-id={`xrefTip_${memeTokenId}`}
                              data-place="top"
                              data-tooltip-html={getXrefTip()}
                            >
                              <div className="gotham_bold text-right">
                                {toInternationalCurrencySystem_number(
                                  seedTotalStakedAmount
                                )}
                              </div>
                              <CustomTooltip id={`xrefTip_${memeTokenId}`} />
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
                      })}
                  {is_mobile ? (
                    <div
                      style={{ border: '1px solid #173E45' }}
                      className={`absolute left-0 top-0 bottom-0 right-0 bg-senderHot bg-opacity-5 w-${
                        isSignedIn ? '2/4' : '2/3'
                      }`}
                    ></div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div
            className="bg-greenLight rounded-xl w-full text-black text-center gotham_bold text-base py-3.5 mb-4 cursor-pointer xsm:mx-3 xsm:w-auto"
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
