import React, { useContext, useState } from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { FormattedMessage } from 'react-intl';
import { WNEARExchngeIcon } from '../../components/icon/Common';
import WrapNear from '../../components/forms/WrapNear';
import { wallet } from '~services/near';
import { isMobile } from '../../utils/device';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { tokenPrice, SingleToken } from '../forms/SelectToken';
interface CommonBassesProps {
  tokens: TokenMetadata[];
  onClick: (token: TokenMetadata) => void;
  tokenPriceList: Record<string, any>;
}
const COMMON_BASSES = [
  'USN',
  'NEAR',
  'REF',
  'SKYWARD',
  'OCT',
  'STNEAR',
  'USDT.e',
  'USDC',
  'ETH',
  'DAI',
  'WBTC',
  // 'FLX',
];

export default function CommonBasses({
  tokens,
  onClick,
  tokenPriceList,
}: CommonBassesProps) {
  const commonBassesTokens = tokens
    .filter((item) => {
      return COMMON_BASSES.indexOf(item?.symbol) > -1;
    })
    .sort((a, b) => (a.symbol === 'USN' ? -1 : 1))
    .sort((a, b) => (a.symbol === 'wNEAR' ? -1 : 1))
    .sort((a, b) => (a.symbol === 'REF' ? -1 : 1));

  return (
    <section className="px-6">
      <div className="text-sm font-bold py-2 pl-2">
        <FormattedMessage id="popular_tokens" defaultMessage="Common Tokens" />
      </div>
      <div className="w-full flex flex-wrap items-center text-sm xs:text-xs text-left">
        <Wnear />
        {commonBassesTokens.map((token) => {
          const price = tokenPriceList[token.id]?.price;

          return (
            <div
              className="w-1/3 mt-3 hover:bg-black hover:bg-opacity-10 rounded-full pr-3 pl-1 py-1 cursor-pointer flex items-center"
              key={token.id}
              onClick={() => onClick && onClick(token)}
              style={{
                height: '36px',
              }}
            >
              <SingleToken token={token} price={price} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

const Wnear = () => {
  const [showWrapNear, setShowWrapNear] = useState(false);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  return (
    <>
      {isSignedIn && (
        <div className="w-1/3 text-white pt-2 cursor-pointer">
          <div
            className="cursor-pointer items-center flex"
            onClick={() => setShowWrapNear(true)}
          >
            <WNEARExchngeIcon width="75" height="32" />
          </div>
          <WrapNear
            isOpen={showWrapNear}
            onRequestClose={() => setShowWrapNear(false)}
            style={{
              overlay: {
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                zIndex: 1000,
              },
              content: {
                outline: 'none',
                position: 'fixed',
                width: isMobile() ? '90%' : '550px',
                bottom: '50%',
              },
            }}
          />
        </div>
      )}
    </>
  );
};
