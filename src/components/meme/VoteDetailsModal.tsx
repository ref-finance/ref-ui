import React, { useContext, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon } from './icons';
import { getMemeContractConfig, getMemeDataConfig } from './memeConfig';
import { TokenMetadata } from '../../services/ft-contract';
import { MemeContext } from './context';
import { WalletContext } from '../../utils/wallets-integration';
import { toReadableNumber } from '../../utils/numbers';
import { emptyObject, getTotalRewardBalance } from './tool';
import { Seed } from '../../services/farm';
const memeContractConfig = getMemeContractConfig();
const { MEME_TOKEN_XREF_MAP } = memeContractConfig;
import Big from 'big.js';
import {
  toInternationalCurrencySystem_number,
  toInternationalCurrencySystem_usd,
} from '../..//utils/uiNumber';
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
function VoteDetailsModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const cardWidth = isMobile() ? '90vw' : '52vw';
  const cardHeight = isMobile() ? '588px' : 'auto';
  const [donateList, setDonateList] = useState([]);
  const {
    allTokenMetadatas,
    tokenPriceList,
    xrefSeeds,
    xrefTokenId,
    donateBalances,
  } = useContext(MemeContext);
  useEffect(() => {
    if (!emptyObject(xrefSeeds) && !emptyObject(allTokenMetadatas)) {
      getDonateList();
    }
  }, [xrefSeeds, allTokenMetadatas, tokenPriceList]);
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
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div
        className="py-5 px-4 text-base text-v3SwapGray bg-senderHot rounded-2xl "
        style={{
          width: cardWidth,
          height: cardHeight,
          background: 'linear-gradient(180deg, #213441 0%, #15242F 100%)',
        }}
      >
        <div className="title flex items-center justify-between pr-3 mb-8 xsm:mb-2">
          <div className="text-white text-xl gotham_bold">Detail</div>
          <ModalCloseIcon className="cursor-pointer" onClick={onRequestClose} />
        </div>
        <div style={{ height: is_mobile ? '94%' : '60vh', overflow: 'auto' }}>
          <DonateList donateList={donateList} />
        </div>
      </div>
    </Modal>
  );
}
function DonateList({ donateList }: { donateList: IDonate[] }) {
  return (
    <>
      {is_mobile ? (
        <DonateListMobile donateList={donateList} />
      ) : (
        <DonateListPc donateList={donateList} />
      )}
    </>
  );
}
function DonateListPc({ donateList }: { donateList: IDonate[] }) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const { xrefSeeds, xrefTokenId, xrefFarmContractUserData } =
    useContext(MemeContext);
  return (
    <div>
      <div className="bg-memeModelgreyColor rounded-2xl border border-memeBorderColor mb-4">
        <div className="overflow-x-auto">
          <div className="min-w-full divide-y divide-memeVoteBgColor">
            <div
              className={`${
                isSignedIn ? 'grid grid-cols-6' : 'grid grid-cols-5'
              } pt-6 px-5 pb-2.5 text-sm`}
            >
              <div className="col-span-2">Meme Project</div>
              <div>xREF</div>
              <div>Voters</div>
              <div className="pl-1">Donation</div>
              {isSignedIn ? <div className="pl-1">You Voted</div> : null}
            </div>
            {donateList
              .sort((b, a) => {
                return Big(a.xrefStakedAmount)
                  .minus(b.xrefStakedAmount)
                  .toNumber();
              })
              .map((donateData: IDonate) => {
                const xrefContractId =
                  MEME_TOKEN_XREF_MAP[donateData.memeTokenId];
                const xrefSeed: Seed = xrefSeeds[xrefContractId];
                const userStakedAmount = toReadableNumber(
                  xrefSeed.seed_decimal,
                  xrefFarmContractUserData?.[xrefContractId]?.join_seeds?.[
                    xrefTokenId
                  ]?.free_amount || '0'
                );
                return (
                  <div
                    key={donateData.memeTokenId}
                    className={`${
                      isSignedIn ? 'grid grid-cols-6' : 'grid grid-cols-5'
                    } p-4 items-center text-base text-white`}
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
                    {isSignedIn ? (
                      <div className="gotham_bold pl-3">
                        <div className="justify-self-end gotham_bold">
                          {toInternationalCurrencySystem_number(
                            userStakedAmount
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
function DonateListMobile({ donateList }: { donateList: IDonate[] }) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const { xrefSeeds, xrefTokenId, xrefFarmContractUserData } =
    useContext(MemeContext);
  return (
    <div>
      <div>
        {donateList
          .sort((b, a) => {
            return Big(a.xrefStakedAmount).minus(b.xrefStakedAmount).toNumber();
          })
          .map((donateData: IDonate) => {
            const xrefContractId = MEME_TOKEN_XREF_MAP[donateData.memeTokenId];
            const xrefSeed: Seed = xrefSeeds[xrefContractId];
            const userStakedAmount = toReadableNumber(
              xrefSeed.seed_decimal,
              xrefFarmContractUserData?.[xrefContractId]?.join_seeds?.[
                xrefTokenId
              ]?.free_amount || '0'
            );
            return (
              <div
                key={donateData.memeTokenId}
                className="flex flex-col gap-3 rounded-2xl border-opacity-20 bg-black bg-opacity-20 p-4 mt-4 border border-memeBorderColor"
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
                      {toInternationalCurrencySystem_usd(
                        donateData.donateValue
                      )}
                    </span>
                  </div>
                </div>
                {isSignedIn ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primaryText">You Voted</span>
                    <span className="text-sm text-white">
                      {toInternationalCurrencySystem_number(userStakedAmount)}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
      </div>
    </div>
  );
}
export default VoteDetailsModal;
