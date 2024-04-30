import React, { useEffect, useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import { isEmpty } from 'lodash';
import { WalletContext } from '../../utils/wallets-integration';
import { TokenMetadata } from '../../services/ft-contract';
import { MemeContext } from './context';
import { getMemeContractConfig } from './memeConfig';
import { InputAmount } from './InputBox';
import { toReadableNumber, toNonDivisibleNumber } from '../../utils/numbers';
import { donate } from '../../services/meme';
import DonateTipModal from './DonateTipModal';
import { OprationButton, ConnectToNearBtn } from 'src/components/button/Button';
import { sortByXrefStaked } from './tool';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function DonateBox({ isActivityOn }: { isActivityOn: boolean }) {
  const [selectedTab, setSelectedTab] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const { allTokenMetadatas, tokenPriceList, user_balances, xrefSeeds } =
    useContext(MemeContext);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const balance = useMemo(() => {
    if (allTokenMetadatas?.[selectedTab]) {
      return toReadableNumber(
        allTokenMetadatas?.[selectedTab].decimals,
        user_balances[selectedTab] || '0'
      );
    }
    return '0';
  }, [selectedTab, user_balances]);
  useEffect(() => {
    if (!isEmpty(xrefSeeds)) {
      setSelectedTab(
        Object.keys(MEME_TOKEN_XREF_MAP).sort(sortByXrefStaked(xrefSeeds))[0]
      );
    }
  }, [xrefSeeds]);
  function stakeToken() {
    donate({
      tokenId: selectedTab,
      amount: Big(
        toNonDivisibleNumber(allTokenMetadatas[selectedTab].decimals, amount)
      ).toFixed(0),
    });
  }
  function showTipModal() {
    setIsOpen(true);
  }
  function closeTipModal() {
    setIsOpen(false);
  }
  const disabled =
    Big(amount || 0).lte(0) ||
    Big(amount || 0).gt(balance) ||
    !selectedTab ||
    !Object.keys(xrefSeeds).length ||
    !isActivityOn;
  return (
    <div>
      <div className="mt-6 mb-5">
        <div className="text-primaryText text-sm">
          Select donation of Meme token
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
        <div className="flex justify-between text-sm">
          <div className="text-primaryText">Amount</div>
        </div>
        <div className="mb-8">
          {allTokenMetadatas?.[selectedTab] && (
            <InputAmount
              token={allTokenMetadatas[selectedTab]}
              tokenPriceList={tokenPriceList}
              balance={balance}
              changeAmount={setAmount}
              amount={amount}
            />
          )}
        </div>
        {isSignedIn ? (
          <OprationButton
            minWidth="7rem"
            disabled={disabled}
            onClick={showTipModal}
            className={`flex flex-grow items-center justify-center bg-greenLight text-boxBorder mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none ${
              disabled ? 'opacity-40' : ''
            }`}
          >
            <div className="flex items-center gap-2">Donate</div>
          </OprationButton>
        ) : (
          <ConnectToNearBtn />
        )}
      </div>
      <DonateTipModal
        isOpen={isOpen}
        onRequestClose={closeTipModal}
        memeSymbol={allTokenMetadatas?.[selectedTab]?.symbol}
        onDonate={stakeToken}
      />
    </div>
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

export default DonateBox;
