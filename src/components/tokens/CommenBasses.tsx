import React, { useMemo } from 'react';
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
  'HAPI',
];

export default function CommenBasses({ tokens, onClick }: CommenBassesProps) {
  const commenBassesTokens = useMemo(
    () => tokens.filter((item) => COMMEN_BASSES.indexOf(item.symbol) > -1),
    [tokens]
  );
  return (
    <section className="px-6">
      <div className="text-sm font-bold py-2">
        <FormattedMessage id="popular_tokens" defaultMessage="Popular Tokens" />
      </div>
      <div className="w-full flex flex-wrap text-sm text-center">
        {commenBassesTokens.map((token) => {
          return (
            <div
              className="inline-block pl-4 pt-4"
              key={token.id}
              onClick={() => onClick && onClick(token)}
            >
              {token.icon && (
                <img
                  src={token.icon}
                  alt={toRealSymbol(token.symbol)}
                  className="inline-block w-7 h-7 mr-2"
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
