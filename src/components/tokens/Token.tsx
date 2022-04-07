import React from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { toInternationalCurrencySystem } from '~utils/numbers';
import { toPrecision } from '../../utils/numbers';
import { SingleToken } from '../forms/SelectToken';
import { OutLinkIcon } from '../../components/icon/Common';

interface TokenProps {
  token: TokenMetadata;
  onClick: (token: TokenMetadata) => void;
  totalAmount?: string;
  sortBy?: string;
  price?: string;
  index?: number;
}

export default function Token({
  token,
  onClick,
  sortBy,
  price,
  index,
}: TokenProps) {
  const { icon, symbol, id, near, ref, total } = token;

  const displayBalance =
    0 < Number(near) && Number(near) < 0.001
      ? '< 0.001'
      : toPrecision(String(near), 3);

  return (
    <tr
      key={id}
      className="hover:bg-black hover:bg-opacity-10"
      onClick={() => onClick && onClick(token)}
      style={{
        height: '56px',
      }}
    >
      <td
        className={`xs:text-xs text-sm pl-8  ${
          index === 0
            ? !price
              ? 'pt-6 pb-4'
              : 'pt-4 pb-2'
            : !price
            ? 'py-4'
            : 'py-2'
        }  cursor-pointer w-4/5 flex items-center`}
      >
        <SingleToken token={token} price={price} />
      </td>
      <td
        className={`${
          index === 0 ? 'pt-6 pb-4' : 'py-4'
        } xs:text-xs text-sm w-1/5 text-right ${
          sortBy === 'near' ? 'text-white' : ''
        }`}
      >
        <div className="relative flex items-center justify-end pr-12">
          {displayBalance}
          {TokenLinks[symbol] ? (
            <a
              className="absolute right-5"
              onClick={(e) => {
                e.stopPropagation();
                window.open(TokenLinks[symbol]);
              }}
            >
              <OutLinkIcon className="text-primaryText hover:text-greenColor cursor-pointer"></OutLinkIcon>
            </a>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
export const TokenLinks = {
  NEAR: 'https://awesomenear.com/near-protocol',
  wNEAR: 'https://awesomenear.com/near-protocol',
  REF: 'https://awesomenear.com/ref-finance',
  OCT: 'https://awesomenear.com/octopus-network',
  PARAS: 'https://awesomenear.com/paras',
  SKYWARD: 'https://awesomenear.com/skyward-finance',
  FLX: 'https://awesomenear.com/flux',
  PULSE: 'https://awesomenear.com/pulse',
  DBIO: 'https://awesomenear.com/debio-network',
  MYRIA: 'https://awesomenear.com/myriad-social',
  PXT: 'https://awesomenear.com/cryptoheroes',
  HAPI: 'https://awesomenear.com/hapi',
  OIN: 'https://awesomenear.com/oin-finance',
  ABR: 'https://awesomenear.com/allbridge',
  '1MIL': 'https://awesomenear.com/1millionnfts',
  MARMAJ: 'https://awesomenear.com/marmaj-foundation',
  marmaj: 'https://awesomenear.com/marmaj-foundation',
};
