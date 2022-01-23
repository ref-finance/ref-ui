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
  'REF',
  'wNEAR',
  'SKYWARD',
  'OCT',
  'DAI',
  'PARAS',
  'STNEAR',
  'wETH',
  'USDT',
  'PULSE',
  'AURORA',
  'ETH',
];

export default function CommonBasses({ tokens, onClick }: CommonBassesProps) {
  const commonBassesTokens = tokens.filter((item) => {
    return COMMON_BASSES.indexOf(item?.symbol) > -1;
  });

  return (
    <section className="px-6">
      <div className="text-sm font-bold py-2">
        <FormattedMessage id="popular_tokens" defaultMessage="Popular Tokens" />
      </div>
      <div className="w-full flex flex-wrap text-sm xs:text-xs text-left">
        <Wnear />
        {commonBassesTokens.map((token) => {
          return (
            <div
              className="pt-4 cursor-pointer mr-7 xs:mr-5 md:mr-5 flex items-center"
              key={token.id}
              onClick={() => onClick && onClick(token)}
            >
              {token.icon ? (
                <img
                  src={token.icon}
                  alt={toRealSymbol(token.symbol)}
                  className="inline-block w-7 h-7 mr-2 border rounded-full border-greenLight"
                />
              ) : (
                <div className="inline-block w-7 h-7 mr-2 border rounded-full border-greenLight"></div>
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
        <div className="text-white pt-4 cursor-pointer xs:mr-5 md:mr-5 mr-7">
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
