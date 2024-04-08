import React, { useState, useContext, useMemo } from 'react';
import Modal from 'react-modal';
import Big from 'big.js';
import { isMobile } from '../../utils/device';
import { ArrowRightTopIcon, ModalCloseIcon, TipIcon } from './icons';
import { TokenMetadata } from '../../services/ft-contract';
import { MemeContext } from './context';
import { getMemeContractConfig } from './memeConfig';
import { InputAmount } from './InputBox';
import { toReadableNumber, toNonDivisibleNumber } from '../../utils/numbers';
import { WalletContext } from '../../utils/wallets-integration';

import {
  toInternationalCurrencySystem_number,
  formatPercentage,
} from '../../utils/uiNumber';
import { xrefStake } from '../../services/meme';
import {
  formatSeconds,
  getSeedApr,
  getTotalRewardBalance,
  sortByXrefStaked,
} from './tool';
import {
  OprationButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from 'src/components/button/Button';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function VoteModel(props: any) {
  const { isOpen, onRequestClose } = props;
  const [selectedTab, setSelectedTab] = useState(
    Object.keys(MEME_TOKEN_XREF_MAP)[0]
  );
  const [stakeLoading, setStakeLoading] = useState(false);
  const {
    allTokenMetadatas,
    tokenPriceList,
    user_balances,
    xrefTokenId,
    xrefSeeds,
    xrefContractConfig,
    donateBalances,
  } = useContext(MemeContext);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const xrefBalance = useMemo(() => {
    console.log(
      '3333333333333-xrefTokenId, user_balances, allTokenMetadatas',
      xrefTokenId,
      user_balances,
      allTokenMetadatas
    );
    if (xrefTokenId && allTokenMetadatas?.[xrefTokenId]) {
      return toReadableNumber(
        allTokenMetadatas?.[xrefTokenId].decimals,
        user_balances[xrefTokenId] || '0'
      );
    }
    return '0';
  }, [xrefTokenId, user_balances, Object.keys(allTokenMetadatas || {}).length]);
  const [xrefApr, totalMemeReward] = useMemo(() => {
    const xrefSeed = xrefSeeds[MEME_TOKEN_XREF_MAP[selectedTab]];
    const apr = getSeedApr(xrefSeed);
    const totalMemeReward = toReadableNumber(
      allTokenMetadatas?.[selectedTab]?.decimals || 0,
      getTotalRewardBalance(xrefSeed, donateBalances[selectedTab])
    );
    return [apr, totalMemeReward];
  }, [selectedTab, xrefSeeds, donateBalances, allTokenMetadatas]);
  const [amount, setAmount] = useState('');
  const cardWidth = isMobile() ? '100vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  const is_mobile = isMobile();
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
    !Object.keys(xrefSeeds).length;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          // backdropFilter: 'blur(15px)',
          // WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          ...(is_mobile
            ? {
                transform: 'translateX(-50%)',
                top: 'auto',
                bottom: '32px',
              }
            : {
                transform: 'translate(-50%, -50%)',
              }),
        },
      }}
    >
      <div className="flex flex-col">
        <div
          className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-swapCardGradient overflow-auto xsm:py-4"
          style={{
            width: cardWidth,
            maxHeight: cardHeight,
            border: '1px solid rgba(151, 151, 151, 0.2)',
          }}
        >
          <div className="title flex items-center justify-between">
            <div className="text-white text-2xl gotham_bold xsm:text-xl">
              Vote for Meme
            </div>
            <ModalCloseIcon
              className="cursor-pointer"
              onClick={onRequestClose}
            />
          </div>
          <div
            className="mt-6 mb-5 transparentScrollbar xsm:mt-4"
            style={{ maxHeight: is_mobile ? '70vh' : 'auto', overflow: 'auto' }}
          >
            <div className="text-primaryText text-sm">
              Select Meme you support
            </div>
            <div className="mt-5 flex flex-wrap mb-2">
              {Object.keys(MEME_TOKEN_XREF_MAP)
                .sort(sortByXrefStaked(xrefSeeds))
                .map((memeTokenId) => {
                  return (
                    <Tab
                      key={memeTokenId}
                      isSelected={selectedTab === memeTokenId}
                      metadata={allTokenMetadatas?.[memeTokenId]}
                      onSelect={() => setSelectedTab(memeTokenId)}
                    />
                  );
                })}
            </div>
            <div className="flex justify-between text-sm mt-2">
              <div className="text-primaryText">
                Reward {allTokenMetadatas?.[selectedTab].symbol}
              </div>
              <span className="text-white">
                {toInternationalCurrencySystem_number(totalMemeReward)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-5">
              <div className="text-primaryText">Staking xREF APR</div>
              <span className="text-white">{formatPercentage(xrefApr)}</span>
            </div>
            <div className="flex justify-between text-sm mt-5">
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
                  Text={() => (
                    <div className="flex items-center gap-2">Stake</div>
                  )}
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
                days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const Tab = ({
  isSelected,
  onSelect,
  metadata,
}: {
  isSelected: boolean;
  onSelect;
  metadata: TokenMetadata;
}) => {
  const baseStyle =
    'rounded-3xl border border-memeBorderColor pt-2 pl-2 pr-3 pb-2 flex items-center justify-between cursor-pointer outline-none';
  const selectedStyle = 'bg-senderHot text-cardBg';
  const unselectedStyle = 'bg-memeModelgreyColor text-white';

  return (
    <button
      className={`${baseStyle} ${
        isSelected ? selectedStyle : unselectedStyle
      } mr-4 mb-4`}
      onClick={onSelect}
    >
      <img className="w-6 h-6 rounded-full" src={metadata?.icon} />
      <div className="ml-1.5 text-base gotham_bold">{metadata?.symbol}</div>
    </button>
  );
};

export default VoteModel;
