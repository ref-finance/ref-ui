import React, { useState, useContext, useMemo, useRef, useEffect } from 'react';
import Modal from 'react-modal';
import Big from 'big.js';
import { isEmpty } from 'lodash';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon, SelectsDown, TipIcon } from './icons';
import { TokenMetadata } from '../../services/ft-contract';
import { MemeContext } from './context';
import { getMemeContractConfig } from './memeConfig';
import { InputAmount } from './InputBox';
import { toReadableNumber, toNonDivisibleNumber } from '../../utils/numbers';
import { WalletContext } from '../../utils/wallets-integration';
import { getMemeUiConfig, getMemeDataConfig } from './memeConfig';
import { stake } from '../../services/meme';
import MemeVoteConfirmModal from './MemeVoteConfirmModal';
import { formatSeconds, sortByXrefStaked } from './tool';
import {
  OprationButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from 'src/components/button/Button';

const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
const { meme_winner_tokens } = getMemeDataConfig();
const progressConfig = getMemeUiConfig();
function MemeVoteModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const [selectedTab, setSelectedTab] = useState('');
  const [amount, setAmount] = useState('');
  const [memeVoteLoading, setMemeVoteLoading] = useState(false);
  const {
    allTokenMetadatas,
    tokenPriceList,
    user_balances,
    xrefSeeds,
    xrefContractConfig,
    seeds,
    memeContractConfig,
  } = useContext(MemeContext);
  const { delay_withdraw_sec } = memeContractConfig;
  useEffect(() => {
    if (!isEmpty(xrefSeeds)) {
      setSelectedTab(
        Object.keys(MEME_TOKEN_XREF_MAP).sort(sortByXrefStaked(xrefSeeds))[0]
      );
    }
  }, [xrefSeeds]);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [selectedTabBalance, seed, FeedIcon] = useMemo(() => {
    if (selectedTab && allTokenMetadatas?.[selectedTab]) {
      const balance = toReadableNumber(
        allTokenMetadatas?.[selectedTab].decimals,
        user_balances[selectedTab] || '0'
      );
      const FeedIcon = progressConfig?.progress?.[selectedTab]?.feedIcon;
      const seed = seeds[selectedTab];
      return [balance, seed, FeedIcon];
    }
    return ['0', null, ''];
  }, [selectedTab, user_balances, Object.keys(allTokenMetadatas || {}).length]);
  const cardWidth = isMobile() ? '100vw' : '28vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  const is_mobile = isMobile();
  function stakeToken() {
    setMemeVoteLoading(true);
    stake({
      seed,
      amount: Big(toNonDivisibleNumber(seed.seed_decimal, amount)).toFixed(0),
    });
  }
  const disabled =
    Big(amount || 0).lte(0) ||
    Big(amount || 0).gt(selectedTabBalance) ||
    !selectedTab ||
    !seed;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const selectedDefaultTab = allTokenMetadatas[selectedTab];
  const dropdownRef = useRef(null);
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // function openMemeVoteConfirmModal() {
  //   setConfirmIsOpen(true);
  // }
  // function closeMemeVoteConfirmModal() {
  //   setConfirmIsOpen(false);
  // }
  if (!selectedTab) return null;
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
          className="px-5 xs:px-3 md:px-3 py-6 lg:rounded-2xl xsm:rounded-t-2xl bg-swapCardGradient overflow-auto xsm:py-4"
          style={{
            width: cardWidth,
            maxHeight: cardHeight,
            border: '1px solid rgba(151, 151, 151, 0.2)',
          }}
        >
          <div className="title flex items-center justify-between">
            <div className="text-white text-2xl gotham_bold xsm:text-xl">
              Feed For Meme
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
            <div className="text-primaryText text-sm xsm:hidden">
              Select Meme you support
            </div>
            <div className="mt-5 flex flex-wrap mb-2 xsm:hidden">
              {meme_winner_tokens
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
            <div className="flex justify-between items-center text-sm mt-2 lg:hidden md:hidden">
              <div className="text-primaryText">Meme</div>
              <div className="text-white relative" ref={dropdownRef}>
                <button
                  className="rounded-3xl border border-memeBorderColor pt-2 pl-2 pr-3 pb-2 flex items-center justify-between cursor-pointer outline-none bg-memeModelgreyColor text-white"
                  onClick={() => setDropdownVisible(!dropdownVisible)}
                >
                  <img
                    className="w-6 h-6 rounded-full"
                    src={selectedDefaultTab?.icon}
                  />
                  <div className="ml-1.5 mr-2 text-base gotham_bold">
                    {selectedDefaultTab?.symbol}
                  </div>
                  <SelectsDown />
                </button>
                {dropdownVisible && (
                  <div
                    className="absolute h-80 overflow-auto z-50 top-12 right-0 rounded-lg border border-memeModelgreyColor pt-4 pl-3.5 pr-9 
                   cursor-pointer outline-none bg-memeModelgreyColor text-white w-max"
                  >
                    {Object.keys(MEME_TOKEN_XREF_MAP)
                      .sort(sortByXrefStaked(xrefSeeds))
                      .map((memeTokenId, index, array) => (
                        <div
                          key={memeTokenId}
                          onClick={() => {
                            setSelectedTab(memeTokenId);
                            setDropdownVisible(false);
                          }}
                          className={`flex items-center ${
                            index !== array.length - 1 ? 'mb-7' : 'mb-4'
                          }`}
                        >
                          <img
                            className="w-6 h-6 rounded-full"
                            src={allTokenMetadatas[memeTokenId]?.icon}
                          />
                          <div className="ml-2 text-base gotham_bold">
                            {allTokenMetadatas[memeTokenId]?.symbol}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-8">
              {allTokenMetadatas?.[selectedTab] && (
                <InputAmount
                  token={allTokenMetadatas[selectedTab]}
                  tokenPriceList={tokenPriceList}
                  balance={selectedTabBalance}
                  changeAmount={setAmount}
                  amount={amount}
                />
              )}
            </div>
            {/* <OprationButton
            onClick={doVote}
            className={`bg-senderHot px-3 py-1 gotham_bold cursor-pointer rounded-md mt-2 w-20 outline-none ${
              memeVoteLoading ? 'opacity-40' : ''
            }`}
          >
            <ButtonTextWrapper
              loading={memeVoteLoading}
              Text={() => (
                <div className="flex items-center gap-2 text-base text-boxBorder">
                  Got it!
                </div>
              )}
            />
          </OprationButton> */}
            {isSignedIn ? (
              <OprationButton
                minWidth="7rem"
                disabled={disabled}
                onClick={stakeToken}
                className={`flex flex-grow items-center justify-center bg-greenLight text-boxBorder mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none ${
                  disabled || memeVoteLoading ? 'opacity-40' : ''
                }`}
              >
                <ButtonTextWrapper
                  loading={memeVoteLoading}
                  Text={() => (
                    <div className="flex items-center gap-2">
                      Feed{' '}
                      {FeedIcon ? (
                        <FeedIcon className="w-5 h-5 relative -top-0.5" />
                      ) : null}
                    </div>
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
                The unstaked assets will available to be withdrawn in{' '}
                {formatSeconds(delay_withdraw_sec)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* {confirmIsOpen && (
        <MemeVoteConfirmModal
          isOpen={confirmIsOpen}
          onRequestClose={closeMemeVoteConfirmModal}
          onMemeVote={stakeToken}
          delay_withdraw_sec={delay_withdraw_sec}
        />
      )} */}
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

export default MemeVoteModal;