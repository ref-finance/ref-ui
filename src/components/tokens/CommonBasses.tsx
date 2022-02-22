import React, { useState } from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { FormattedMessage } from 'react-intl';
import { WNEARExchngeIcon } from '~components/icon/Common';
import WrapNear from '~components/forms/WrapNear';
import { wallet } from '~services/near';
import { isMobile } from '~utils/device';
interface CommonBassesProps {
  tokens: TokenMetadata[];
  onClick: (token: TokenMetadata) => void;
}
const COMMON_BASSES = [
  'wNEAR',
  'REF',
  'SKYWARD',
  'OCT',
  'STNEAR',
  'USDT',
  'USDC',
  'AURORA',
  'ETH',
  'DAI',
  // 'FLX',
];

export default function CommonBasses({ tokens, onClick }: CommonBassesProps) {
  const commonBassesTokens = tokens.filter((item) => {
    return COMMON_BASSES.indexOf(item?.symbol) > -1;
  });

  return (
    <section className="pl-8 pr-6">
      <div className="text-sm font-bold py-2">
        <FormattedMessage id="popular_tokens" defaultMessage="Popular Tokens" />
      </div>
      <div className="w-full flex flex-wrap items-center text-sm xs:text-xs text-left">
        <Wnear />
        {commonBassesTokens.map((token) => {
          return (
            <div
              className="mt-4 hover:bg-black hover:bg-opacity-10 rounded-full pr-3 cursor-pointer mr-3 flex items-center"
              key={token.id}
              onClick={() => onClick && onClick(token)}
              style={{
                height: '26px',
              }}
            >
              {token.icon ? (
                <img
                  src={token.icon}
                  alt={toRealSymbol(token.symbol)}
                  className="inline-block w-6 h-6 mr-2 border rounded-full border-greenLight"
                />
              ) : (
                <div className="inline-block w-6 h-6 mr-2 border rounded-full border-greenLight"></div>
              )}
              <span>{toRealSymbol(token.symbol)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const Wnear = () => {
  const [showWrapNear, setShowWrapNear] = useState(false);
  return (
    <>
      {wallet.isSignedIn() && (
        <div className="text-white pt-4 cursor-pointer xs:mr-5 md:mr-5 mr-6">
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
