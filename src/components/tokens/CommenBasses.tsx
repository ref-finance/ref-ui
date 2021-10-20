import React from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { useDepositableBalance } from '~state/token';
import {
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
} from '~utils/numbers';
import { CommenBassesConfig } from '~utils/CommenBasses';
import { FormattedMessage } from 'react-intl';

interface TokenProps {
  token: TokenMetadata;
  onClick: (token: TokenMetadata) => void;
  render?: (token: TokenMetadata) => React.ReactElement;
  totalAmount?: string;
}

export default function CommenBasses() {
  return (
    <section className="px-6">
      <div className="text-sm font-bold py-2">
        <FormattedMessage id="commen_basses" defaultMessage="Commen Basses" />
      </div>
      <div className="w-full flex flex-wrap text-sm text-center">
        {Object.keys(CommenBassesConfig).map((item) => {
          return (
            <div
              className="inline-block pl-4 pt-4"
              key={CommenBassesConfig[item].id}
            >
              <img
                src={CommenBassesConfig[item].icon}
                alt=""
                className="inline-block w-7 h-7 mr-2"
              />
              <span>{CommenBassesConfig[item].name}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
