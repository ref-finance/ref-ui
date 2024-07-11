import Big from 'big.js';
import React, { useState, useEffect, useContext } from 'react';
import DonateModal from './DonateModal';
import { get_donate_list } from '../../services/meme';
import { getMemeContractConfig, getMemeDataConfig } from './memeConfig';
import { WalletContext } from '../../utils/wallets-integration';
import { MemeContext } from './context';
import { toReadableNumber } from '../../utils/numbers';
import { isMobile } from '../../utils/device';
import {
  toInternationalCurrencySystem_number,
  toInternationalCurrencySystem_usd,
} from '../../utils/uiNumber';
import { emptyObject, getTotalRewardBalance } from './tool';
import { TokenMetadata } from '../../services/ft-contract';
import { ArrowTopIcon } from './icons';
const is_mobile = isMobile();
interface IDonate {
  donateBalance: string;
  donateValue: string;
  metadata: TokenMetadata;
  xrefStakedAmount: string;
  xrefVoters: number;
  memeTokenId: string;
  win?: boolean;
}
function VotersSheet({ hidden }: { hidden: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [donateList, setDonateList] = useState([]);
  const { globalState } = useContext(WalletContext);
  const {
    allTokenMetadatas,
    tokenPriceList,
    xrefSeeds,
    xrefTokenId,
    donateBalances,
  } = useContext(MemeContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (!emptyObject(xrefSeeds) && !emptyObject(allTokenMetadatas)) {
      getDonateList();
    }
  }, [xrefSeeds, allTokenMetadatas, tokenPriceList]);
  function showModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }
  async function getDonateList() {
    const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
    const { meme_winner_tokens } = getMemeDataConfig();
    const list: IDonate[] = Object.entries(MEME_TOKEN_XREF_MAP).reduce(
      (acc, [memeTokenId, xrefContractId]) => {
        const xrefSeed = xrefSeeds[xrefContractId];
        const totalMemeReward = toReadableNumber(
          allTokenMetadatas?.[memeTokenId]?.decimals || 0,
          getTotalRewardBalance(xrefSeed, donateBalances[memeTokenId])
        );

        acc.push({
          memeTokenId,
          donateBalance: totalMemeReward,
          donateValue: Big(totalMemeReward)
            .mul(tokenPriceList[memeTokenId]?.price || '0')
            .toFixed(),
          metadata: allTokenMetadatas[memeTokenId],
          xrefStakedAmount: toReadableNumber(
            allTokenMetadatas[xrefTokenId]?.decimals || 0,
            xrefSeed.total_seed_amount
          ),
          xrefVoters: xrefSeed.farmer_count,
          win: meme_winner_tokens.includes(memeTokenId),
        });
        return acc;
      },
      []
    );
    const winners = meme_winner_tokens.reduce((acc, memeTokenId, index) => {
      return {
        ...acc,
        ...{ [memeTokenId]: meme_winner_tokens.length - index },
      };
    }, {});
    list.sort((b, a) => {
      return (winners[a.memeTokenId] || 0) - (winners[b.memeTokenId] || 0);
    });
    setDonateList(list);
  }
  return (
    <div className={`text-primaryText ${hidden ? 'hidden' : ''}`}>
      <div className="text-base mb-7 xsm:text-center">
        All donated tokens will be added by Ref to the corresponding xRef
        Farming Pool for MemeToken within 1-2 days. The farming release period
        is set for 1 month. Users staking xRef in the corresponding MemeToken
        will receive these donations.
      </div>
      <DonateList donateList={donateList} showModal={showModal} />
      <DonateModal isOpen={isOpen} onRequestClose={closeModal} />
    </div>
  );
}
function DonateList({
  donateList,
  showModal,
}: {
  donateList: IDonate[];
  showModal: any;
}) {
  return (
    <>
      {is_mobile ? (
        <DonateListMobile donateList={donateList} showModal={showModal} />
      ) : (
        <DonateListPc donateList={donateList} showModal={showModal} />
      )}
    </>
  );
}
function DonateListPc({
  donateList,
  showModal,
}: {
  donateList: IDonate[];
  showModal: any;
}) {
  return (
    <div>
      <div className="bg-memeModelgreyColor rounded-2xl border border-memeBorderColor mb-4">
        <div className="overflow-x-auto">
          <div className="min-w-full divide-y divide-memeVoteBgColor">
            <div className="grid grid-cols-5 pt-6 px-5 pb-2.5 text-sm">
              <div className="col-span-2">Meme Project</div>
              <div>xREF</div>
              <div>Voters</div>
              <div className="pl-1">Donation</div>
            </div>
            {donateList
              .sort((b, a) => {
                return Big(a.xrefStakedAmount)
                  .minus(b.xrefStakedAmount)
                  .toNumber();
              })
              .map((donateData: IDonate) => {
                return (
                  <div
                    key={donateData.memeTokenId}
                    className="grid grid-cols-5 p-4 items-center text-base text-white"
                  >
                    <div className="flex items-center col-span-2">
                      <div className="flex items-center gap-1.5">
                        <img
                          className="w-5 h-5 rounded-full"
                          src={donateData.metadata?.icon}
                        />
                        <span>{donateData.metadata?.symbol}</span>
                        {donateData.win ? (
                          <div
                            className="text-black text-xs gotham_bold rounded py-0.5 px-1 bg-senderHot transform"
                            style={{ transform: 'skewX(-20deg)' }}
                          >
                            Listed
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="gotham_bold">
                      {toInternationalCurrencySystem_number(
                        donateData.xrefStakedAmount
                      )}
                    </div>
                    <div className="gotham_bold">{donateData.xrefVoters}</div>
                    <div className="flex items-center gap-1.5">
                      <img
                        className="w-5 h-5 rounded-full"
                        src={donateData.metadata?.icon}
                      />
                      <div className="flex flex-col">
                        <span className="gotham_bold">
                          {toInternationalCurrencySystem_number(
                            donateData.donateBalance
                          )}
                        </span>
                        <span className="text-xs">
                          {toInternationalCurrencySystem_usd(
                            donateData.donateValue
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <div
        onClick={showModal}
        className="bg-greenLight rounded-xl w-full text-black text-center gotham_bold text-base py-3.5 mb-4 cursor-pointer"
      >
        Donate
      </div>
    </div>
  );
}
function DonateListMobile({
  donateList,
  showModal,
}: {
  donateList: IDonate[];
  showModal: any;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div
        onClick={showModal}
        className="bg-greenLight rounded-xl w-full text-black text-center gotham_bold text-base py-3.5 mb-4 cursor-pointer xsm:mx-3 xsm:w-auto"
      >
        Donate
      </div>
      <div className="flex items-center justify-between mx-3 mt-7">
        <span className="text-base gotham_bold text-white">Meme Project</span>
        <span
          onClick={() => {
            setOpen(!open);
          }}
          className={`flex items-center justify-center w-5 h-5 ${
            open ? '' : 'transform rotate-180'
          }`}
        >
          <ArrowTopIcon />
        </span>
      </div>
      <div className={`mx-3 ${open ? '' : 'hidden'}`}>
        {donateList.map((donateData: IDonate) => {
          return (
            <div
              key={donateData.memeTokenId}
              className="flex flex-col gap-5 rounded-2xl border-opacity-20 bg-black bg-opacity-20 p-4 mt-4 border border-memeBorderColor"
            >
              <div className="flex items-center gap-2">
                <img
                  className="w-10 h-10 rounded-full"
                  src={donateData.metadata?.icon}
                />
                <span className="text-base text-white gotham_bold">
                  {donateData.metadata?.symbol}
                </span>
                {donateData.win ? (
                  <div
                    className="text-black text-xs gotham_bold rounded py-0.5 px-1 bg-senderHot transform"
                    style={{ transform: 'skewX(-20deg)' }}
                  >
                    Listed
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primaryText">xREF</span>
                <span className="text-sm text-white">
                  {toInternationalCurrencySystem_number(
                    donateData.xrefStakedAmount
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primaryText">Voters</span>
                <span className="text-sm text-white">
                  {donateData.xrefVoters}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-primaryText">Donation</span>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-white">
                    {' '}
                    {toInternationalCurrencySystem_number(
                      donateData.donateBalance
                    )}
                  </span>
                  <span className="text-xs text-primaryText">
                    {' '}
                    {toInternationalCurrencySystem_usd(donateData.donateValue)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VotersSheet;
