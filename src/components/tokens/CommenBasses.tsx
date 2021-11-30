import React from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { FormattedMessage } from 'react-intl';

interface CommenBassesProps {
  tokens: TokenMetadata[];
  onClick: (token: TokenMetadata) => void;
}
const COMMEN_BASSES = [
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

export default function CommenBasses({ tokens, onClick }: CommenBassesProps) {
  const commenBassesTokens = tokens.filter((item) => {
    return COMMEN_BASSES.indexOf(item?.symbol) > -1;
  });

  return (
    <section className="px-6">
      <div className="text-sm font-bold py-2">
        <FormattedMessage id="popular_tokens" defaultMessage="Popular Tokens" />
      </div>
      <div className="w-full flex flex-wrap text-sm xs:text-xs text-left">
        {commenBassesTokens.map((token) => {
          return (
            <div
              className="pt-4 cursor-pointer mr-7"
              key={token.id}
              onClick={() => onClick && onClick(token)}
            >
              {token.icon && (
                <img
                  src={token.icon}
                  alt={toRealSymbol(token.symbol)}
                  className="inline-block w-7 h-7 mr-2 border rounded-full border-greenLight"
                />
              )}
              <span>{toRealSymbol(token.symbol)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
