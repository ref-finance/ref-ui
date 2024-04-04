import Big from 'big.js';
import React, { useState, useEffect, useContext } from 'react';
import DonateModal from './DonateModal';
import { get_donate_list } from '../../services/meme';
import { getMemeContractConfig, getMemeDataConfig } from './memeConfig';
import { WalletContext } from '../../utils/wallets-integration';
import { MemeContext } from './context';
import { toReadableNumber } from '../../utils/numbers';
import {
  toInternationalCurrencySystem_number,
  toInternationalCurrencySystem_usd,
} from '../../utils/uiNumber';
import { emptyObject } from './tool';
import { TokenMetadata } from '../../services/ft-contract';
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
  const { allTokenMetadatas, tokenPriceList, xrefSeeds, xrefTokenId } =
    useContext(MemeContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (!emptyObject(xrefSeeds) && !emptyObject(allTokenMetadatas)) {
      getDonateList();
    }
  }, [isSignedIn, xrefSeeds, allTokenMetadatas, tokenPriceList]);
  function showModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }
  async function getDonateList() {
    const donate = await get_donate_list();
    const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
    const { meme_winner_tokens } = getMemeDataConfig();
    const list: IDonate[] = Object.entries(MEME_TOKEN_XREF_MAP).reduce(
      (acc, [memeTokenId, xrefContractId]) => {
        const donateBalance = toReadableNumber(
          allTokenMetadatas[memeTokenId]?.decimals || 0,
          donate[memeTokenId]
        );
        const xrefSeed = xrefSeeds[xrefContractId];
        acc.push({
          memeTokenId,
          donateBalance,
          donateValue: Big(donateBalance)
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
      <div className="text-base mb-7">
        All donated tokens will be added by Ref to the corresponding xRef
        Farming Pool for MeMeToken within 1-2 days. The farming release period
        is set for 2 weeks. Users staking xRef in the corresponding MeMeToken
        will receive these donations.
      </div>
      <div className="bg-memeModelgreyColor rounded-2xl border border-memeBorderColor mb-4">
        <div className="overflow-x-auto">
          <div className="min-w-full divide-y divide-memeVoteBgColor">
            <div className="grid grid-cols-6 pt-6 px-5 pb-2.5 text-sm">
              <div className="col-span-2">Meme Project</div>
              <div>xREF</div>
              <div>Voters</div>
              <div>Donation</div>
              <div>USD Value</div>
            </div>
            {donateList.map((donateData: IDonate) => {
              return (
                <div
                  key={donateData.memeTokenId}
                  className="grid grid-cols-6 p-4 items-center text-base text-white"
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
                  <div className="flex items-center gap-1.5 gotham_bold">
                    <img
                      className="w-5 h-5 rounded-full"
                      src={donateData.metadata?.icon}
                    />
                    <span>
                      {toInternationalCurrencySystem_number(
                        donateData.donateBalance
                      )}
                    </span>
                  </div>
                  <div className="gotham_bold">
                    <span>
                      {toInternationalCurrencySystem_usd(
                        donateData.donateValue
                      )}
                    </span>
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
      <DonateModal isOpen={isOpen} onRequestClose={closeModal} />
    </div>
  );
}

export default VotersSheet;
