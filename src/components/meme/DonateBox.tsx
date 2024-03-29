import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import { isMobile } from '../../utils/device';
import { WalletContext } from '../../utils/wallets-integration';
import { TokenMetadata } from '../../services/ft-contract';
import { MemeContext } from './context';
import { getMemeContractConfig } from './memeConfig';
import { InputAmount } from './InputBox';
import { toReadableNumber, toNonDivisibleNumber } from '../../utils/numbers';
import { donate } from '../../services/meme';
import {
  OprationButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from 'src/components/button/Button';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function DonateBox(props: any) {
  const [selectedTab, setSelectedTab] = useState(
    Object.keys(MEME_TOKEN_XREF_MAP)[0]
  );
  const [stakeLoading, setStakeLoading] = useState(false);
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
  const [amount, setAmount] = useState('');
  const cardWidth = isMobile() ? '90vw' : '25vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  function stakeToken() {
    setStakeLoading(true);
    donate({
      tokenId: selectedTab,
      amount: Big(
        toNonDivisibleNumber(allTokenMetadatas[selectedTab].decimals, amount)
      ).toFixed(0),
    });
  }
  const disabled =
    Big(amount || 0).lte(0) ||
    Big(amount || 0).gt(balance) ||
    !selectedTab ||
    !Object.keys(xrefSeeds).length;
  return (
    <div
    // className="px-5 xs:px-3 md:px-3 py-6 rounded-2xl bg-swapCardGradient overflow-auto"
    // style={{
    //   width: cardWidth,
    //   maxHeight: cardHeight,
    //   border: '1px solid rgba(151, 151, 151, 0.2)',
    // }}
    >
      <div className="mt-6 mb-5">
        <div className="text-primaryText text-sm">
          Select donation of Meme token
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
            onClick={stakeToken}
            className={`flex flex-grow items-center justify-center bg-greenLight text-boxBorder mt-6 rounded-xl h-12 text-base gotham_bold focus:outline-none ${
              disabled || stakeLoading ? 'opacity-40' : ''
            }`}
          >
            <ButtonTextWrapper
              loading={stakeLoading}
              Text={() => <div className="flex items-center gap-2">Donate</div>}
            />
          </OprationButton>
        ) : (
          <ConnectToNearBtn />
        )}
      </div>
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
