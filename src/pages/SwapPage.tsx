import React, { useContext, useEffect, useState } from 'react';
import SwapCard from '~components/swap/SwapCard';
import CrossSwapCard from '~components/swap/CrossSwapCard';

import Loading from '~components/layout/Loading';
import { useWhitelistTokens } from '../state/token';
import { WalletContext } from '../utils/sender-wallet';
import { FormattedMessage } from 'react-intl';
import { SwapCross } from '../components/icon/CrossSwap';
import {
  getTokenNearAccount,
  getBatchTokenNearAcounts,
} from '../services/aurora/aurora';
import { TokenMetadata, ftGetTokenMetadata } from '../services/ft-contract';
import { defaultTokenList } from '../services/aurora/config';

function SwapTab({ ifCross }: { ifCross: boolean }) {
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
          if (ifCross) globalStatedispatch({ type: 'crossSwapOff' });
          else globalStatedispatch({ type: 'crossSwapOn' });
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

  const [triTokens, setTriTokens] = useState<TokenMetadata[]>();

  useEffect(() => {
    const tokenIds = defaultTokenList.tokens.map((tk) => tk.address);

    getBatchTokenNearAcounts(tokenIds).then((res) => {
      return Promise.all(
        res.map((addr: string) =>
          ftGetTokenMetadata(addr).then((ftmeta) => ({
            ...ftmeta,
            onTri: true,
          }))
        )
      ).then(setTriTokens);
    });
  }, []);

  const { globalState } = useContext(WalletContext);

  const ifCross = globalState.crossSwap;

  if (!refTokens || !triTokens) return <Loading />;

  const allTokens = getAllTokens(refTokens, triTokens);

  return (
    <div className="swap">
      <section className="lg:w-560px md:w-5/6 xs:w-full xs:p-2 m-auto relative">
        <SwapTab ifCross={ifCross} />

        {ifCross ? (
          <CrossSwapCard allTokens={allTokens} />
        ) : (
          <SwapCard allTokens={allTokens} />
        )}
      </section>
    </div>
  );
}

export default SwapPage;
