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
import { xrefStake } from '../../services/meme';
import { formatSeconds } from './tool';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function VoteModel(props: any) {
  const { isOpen, onRequestClose } = props;
  const [selectedTab, setSelectedTab] = useState('');
  const [stakeLoading, setStakeLoading] = useState(false);
  const {
    allTokenMetadatas,
    tokenPriceList,
    user_balances,
    xrefTokenId,
    xrefSeeds,
    xrefContractConfig,
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
  const [amount, setAmount] = useState('');
  const cardWidth = isMobile() ? '90vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
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
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div className="flex flex-col">
        <div
          className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-swapCardGradient overflow-auto"
          style={{
            width: cardWidth,
            maxHeight: cardHeight,
            border: '1px solid rgba(151, 151, 151, 0.2)',
          }}
        >
          <div className="title flex items-center justify-between">
            <div className="text-white text-2xl gotham_bold">Vote for Meme</div>
            <ModalCloseIcon
              className="cursor-pointer"
              onClick={onRequestClose}
            />
          </div>
          <div className="mt-6 mb-5">
            <div className="text-primaryText text-sm">
              Select Meme you support
            </div>
            <div className="mt-5 flex flex-wrap mb-2">
              {Object.keys(MEME_TOKEN_XREF_MAP).map((memeTokenId) => {
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
