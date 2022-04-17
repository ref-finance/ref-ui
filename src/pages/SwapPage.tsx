import React, { useContext, useEffect, useState } from 'react';
import SwapCard from '~components/swap/SwapCard';
import CrossSwapCard from '~components/swap/CrossSwapCard';

import Loading from '~components/layout/Loading';
import { useTriTokens, useWhitelistTokens } from '../state/token';
import { WalletContext } from '../utils/sender-wallet';
import { FormattedMessage } from 'react-intl';
import { SwapCross } from '../components/icon/CrossSwap';
import {
  getTokenNearAccount,
  getBatchTokenNearAcounts,
} from '../services/aurora/aurora';
import { TokenMetadata, ftGetTokenMetadata } from '../services/ft-contract';
import { defaultTokenList } from '../services/aurora/config';

const REF_FI_SWAP_SWAPPAGE_TAB_KEY = 'REF_FI_SWAP_SWAPPAGE_TAB_VALUE';

function SwapTab({
  ifCross,
  setSwapTab,
}: {
  ifCross: boolean;
  setSwapTab: (tab: string) => void;
}) {
  const { globalStatedispatch } = useContext(WalletContext);

  const TabTitle = () => {
    return !ifCross ? (
      <div>
        <FormattedMessage id="swap" defaultMessage="Swap" />
      </div>
    ) : (
      <div>
        <FormattedMessage id="cross_swap" defaultMessage="🤞CrossSwap" />
        <span
          className="ml-2 px-0.5 bg-farmText rounded-md"
          style={{
            color: '#01121d',
            fontSize: '10px',
          }}
        >
          <FormattedMessage id="beta" defaultMessage="beta" />
        </span>
      </div>
    );
  };

  return (
    <div className="mb-5 flex items-center justify-between">
      <div
        className="mr-5 bg-cardBg rounded-2xl w-full text-white text-lg flex items-center justify-center"
        style={{
          height: '50px',
        }}
      >
        <TabTitle />
      </div>

      <div
        className="cursor-pointer"
        onClick={() => {
          if (ifCross) {
            setSwapTab('normal');
            localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'normal');
          } else {
            setSwapTab('cross');
            localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'cross');
          }
        }}
      >
        <SwapCross ifCross={ifCross} />
      </div>
    </div>
  );
}

function getAllTokens(refTokens: TokenMetadata[], triTokens: TokenMetadata[]) {
  triTokens.forEach((tk) => {
    const tokenInRef = refTokens.find((token) => token.id === tk.id);
    if (tokenInRef) {
      tokenInRef.onTri = true;
    } else {
      refTokens.push(tk);
    }
  });

  return refTokens;
}

function SwapPage() {
  const refTokens = useWhitelistTokens(['aurora']);

  const triTokens = useTriTokens();

  const [swapTab, setSwapTab] = useState(
    localStorage.getItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY) || 'normal'
  );

  if (!refTokens || !triTokens) return <Loading />;

  const allTokens = getAllTokens(refTokens, triTokens);

  const nearSwapTokens = allTokens.filter((token) => token.onRef);

  // asset to ref
  const crossSwapTokens = allTokens.filter(
    (token) => token.onTri && token.onRef
  );

  return (
    <div className="swap">
      <section className="lg:w-560px md:w-5/6 xs:w-full xs:p-2 m-auto relative">
        <SwapTab ifCross={swapTab === 'cross'} setSwapTab={setSwapTab} />

        {swapTab === 'cross' ? (
          <CrossSwapCard allTokens={crossSwapTokens} />
        ) : (
          <SwapCard allTokens={nearSwapTokens} />
        )}
      </section>
    </div>
  );
}

export default SwapPage;
