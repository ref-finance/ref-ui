import React, { useEffect, useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import { isEmpty } from 'lodash';
import { ArrowRightTopIcon, TipIcon } from './icons';
import { TokenMetadata } from '../../services/ft-contract';
import { MemeContext } from './context';
import { getMemeContractConfig } from './memeConfig';
import { InputAmount } from './InputBox';
import { toReadableNumber, toNonDivisibleNumber } from '../../utils/numbers';
import {
  formatPercentage,
  toInternationalCurrencySystem_number,
} from '../../utils/uiNumber';
import { xrefStake } from '../../services/meme';
import {
  emptyObject,
  formatSeconds,
  getSeedApr,
  getTotalRewardBalance,
  sortByXrefStaked,
} from './tool';
import {
  OprationButton,
  ConnectToNearBtn,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { Seed, UserSeedInfo } from '../../services/farm';
import { WalletContext } from '../../utils/wallets-integration';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function VoteBox({ isActivityOn }: { isActivityOn: boolean }) {
  const [selectedTab, setSelectedTab] = useState('');
  const [stakeLoading, setStakeLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const {
    allTokenMetadatas,
    tokenPriceList,
    user_balances,
    xrefTokenId,
    xrefSeeds,
    xrefContractConfig,
    xrefFarmContractUserData,
    donateBalances,
  } = useContext(MemeContext);
  const xrefBalance = useMemo(() => {
    if (xrefTokenId && allTokenMetadatas?.[xrefTokenId]) {
      return toReadableNumber(
        allTokenMetadatas?.[xrefTokenId].decimals,
        user_balances[xrefTokenId] || '0'
      );
    }
    return '0';
  }, [xrefTokenId, user_balances]);
  useEffect(() => {
    if (!isEmpty(xrefSeeds)) {
      setSelectedTab(
        Object.keys(MEME_TOKEN_XREF_MAP).sort(sortByXrefStaked(xrefSeeds))[0]
      );
    }
  }, [xrefSeeds]);
  function stakeToken() {
    setStakeLoading(true);
    xrefStake({
      contractId: MEME_TOKEN_XREF_MAP[selectedTab],
      seed: xrefSeeds[MEME_TOKEN_XREF_MAP[selectedTab]],
      amount: Big(
        toNonDivisibleNumber(
          xrefSeeds[MEME_TOKEN_XREF_MAP[selectedTab]].seed_decimal,
          amount
        )
      ).toFixed(0),
    });
  }
  const disabled =
    Big(amount || 0).lte(0) ||
    Big(amount || 0).gt(xrefBalance) ||
    !selectedTab ||
    !Object.keys(xrefSeeds).length ||
    !isActivityOn;
  if (!selectedTab) return null;
  return (
    <div>
      <div className="mt-6 mb-5">
        <div className="text-primaryText text-sm">Select Meme you support</div>
        <div className="mt-5 flex flex-wrap mb-2">
          {!emptyObject(xrefSeeds) &&
            Object.keys(MEME_TOKEN_XREF_MAP)
              .sort(sortByXrefStaked(xrefSeeds))
              .map((memeTokenId) => {
                return (
                  <Tab
                    key={memeTokenId}
                    isSelected={selectedTab === memeTokenId}
                    metadata={allTokenMetadatas?.[memeTokenId]}
                    xrefMetadata={allTokenMetadatas?.[xrefTokenId]}
                    onSelect={() => setSelectedTab(memeTokenId)}
                    xrefSeed={xrefSeeds?.[MEME_TOKEN_XREF_MAP[memeTokenId]]}
                    userSeed={
                      xrefFarmContractUserData?.[
                        MEME_TOKEN_XREF_MAP[memeTokenId]
                      ]?.join_seeds
                    }
                    donateBalance={donateBalances[memeTokenId] || '0'}
                  />
                );
              })}
        </div>
        <div className="flex justify-between text-sm">
          <div className="text-primaryText">Stake xREF</div>
          <div className="text-senderHot flex justify-end items-center">
            <a
              className="inline-flex items-center cursor-pointer"
              href="/xref"
              target="_blank"
            >
              Acquire $xREF <ArrowRightTopIcon />
            </a>
          </div>
        </div>
        <div className="mb-8">
          {allTokenMetadatas?.[xrefTokenId] && (
            <InputAmount
              token={allTokenMetadatas[xrefTokenId]}
              tokenPriceList={tokenPriceList}
              balance={xrefBalance}
              changeAmount={setAmount}
              amount={amount}
            />
          )}
        </div>
        {isSignedIn ? (
          <OprationButton
            minWidth="7rem"
            disabled={disabled}
            onClick={stakeToken}
            className={`flex flex-grow items-center justify-center bg-greenLight text-boxBorder mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none ${
              disabled || stakeLoading ? 'opacity-40' : ''
            }`}
          >
            <ButtonTextWrapper
              loading={stakeLoading}
              Text={() => <div className="flex items-center gap-2">Stake</div>}
            />
          </OprationButton>
        ) : (
          <ConnectToNearBtn />
        )}

        <div
          className={`flex items-start gap-2 mt-4 ${
            xrefContractConfig?.[MEME_TOKEN_XREF_MAP[selectedTab]]
              ?.delay_withdraw_sec
              ? ''
              : 'hidden'
          }`}
        >
          <TipIcon className="flex-shrink-0 transform translate-y-1" />
          <p className="text-sm text-greenLight">
            The unstaked $xREF will available to be withdrawn in{' '}
            {formatSeconds(
              xrefContractConfig?.[MEME_TOKEN_XREF_MAP[selectedTab]]
                ?.delay_withdraw_sec
            )}{' '}
          </p>
        </div>
      </div>
    </div>
  );
}

const Tab = ({
  isSelected,
  onSelect,
  metadata,
  xrefMetadata,
  xrefSeed,
  userSeed,
  donateBalance,
}: {
  isSelected: boolean;
  onSelect;
  metadata: TokenMetadata;
  xrefMetadata: TokenMetadata;
  xrefSeed: Seed;
  userSeed: Record<string, UserSeedInfo>;
  donateBalance: string;
}) => {
  const baseStyle =
    'rounded-3xl border border-memeBorderColor pt-2 pl-2 pr-3 pb-2 flex items-center justify-between cursor-pointer outline-none';
  const selectedStyle = 'bg-senderHot text-cardBg';
  const unselectedStyle = 'bg-memeModelgreyColor text-white';
  function getButtonTip() {
    const apr = getSeedApr(xrefSeed);
    const totalMemeReward = toReadableNumber(
      metadata?.decimals || 0,
      getTotalRewardBalance(xrefSeed, donateBalance)
    );
    const userAmount =
      !emptyObject(userSeed || {}) && xrefMetadata
        ? toInternationalCurrencySystem_number(
            toReadableNumber(
              xrefMetadata.decimals,
              Object.values(userSeed)[0].free_amount
            )
          )
        : '-';
    const result = `<div class="px-2">
          <div class="flex items-center justify-between text-xs text-farmText gap-3.5">
            <span>Reward ${metadata?.symbol}</span>
            <span class="text-white text-sm">${toInternationalCurrencySystem_number(
              totalMemeReward
            )}</span>
          </div>
          <div class="flex items-center justify-between text-xs text-farmText gap-3.5 my-1">
            <span>Staking xREF APR</span>
            <span class="text-white text-sm">${formatPercentage(apr)}</span>
          </div>
          <div class="flex items-center justify-between text-xs text-farmText gap-3.5">
            <span>Your Feed</span>
            <span class="text-white text-sm">${userAmount}</span>
          </div>
        </div>`;
    return result;
  }
  const randomInteger = Math.random();
  return (
    <div
      data-class="reactTip"
      data-tooltip-id={`buttonId_${metadata?.id || randomInteger}`}
      data-place="top"
      data-tooltip-html={getButtonTip()}
    >
      <button
        className={`${baseStyle} ${
          isSelected ? selectedStyle : unselectedStyle
        } mr-4 mb-4`}
        onClick={onSelect}
      >
        <img className="w-6 h-6 rounded-full" src={metadata?.icon} />
        <div className="ml-1.5 text-base gotham_bold">{metadata?.symbol}</div>
      </button>
      <CustomTooltip id={`buttonId_${metadata?.id || randomInteger}`} />
    </div>
  );
};

export default VoteBox;
