import React, { useState } from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { toInternationalCurrencySystem } from '~utils/numbers';
import { toPrecision } from '../../utils/numbers';
import { SingleToken } from '../forms/SelectToken';
import { OutLinkIcon } from '../../components/icon/Common';
import { RefIcon } from '../../components/icon/DexIcon';
import { TriIcon } from '../icon/DexIcon';
import { getCurrentWallet } from '../../utils/wallets-integration';

interface TokenProps {
  token: TokenMetadata;
  onClick: (token: TokenMetadata) => void;
  totalAmount?: string;
  sortBy?: string;
  price?: string;
  index?: number;
  forCross?: boolean;
}

export default function Token({
  token,
  onClick,
  sortBy,
  price,
  index,
  forCross,
}: TokenProps) {
  const { icon, symbol, id, near, ref, total, onRef, onTri } = token;

  const displayBalance =
    0 < Number(near) && Number(near) < 0.001
      ? '< 0.001'
      : toPrecision(String(near), 3);

  const [hover, setHover] = useState(false);

  return (
    <div
      key={id}
      className="hover:bg-black hover:bg-opacity-10 flex items-center justify-between w-full relative"
      onClick={() => onClick && onClick(token)}
      style={{
        height: '56px',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`xs:text-xs text-sm pl-8 ${
          index === 0
            ? !price
              ? 'pt-6 pb-4'
              : 'pt-4 pb-2'
            : !price
            ? 'py-4'
            : 'py-2'
        }  cursor-pointer flex w-34 items-center`}
      >
        <SingleToken token={token} price={price} />
      </div>
      <div
        className={!forCross ? 'hidden' : 'w-12 flex justify-start  absolute '}
        style={{
          left: '45%',
        }}
      >
        {onRef || onTri ? <RefIcon lightTrigger={hover} /> : null}

        {onTri ? <TriIcon lightTrigger={hover} /> : null}
      </div>
      <div
        className={`${
          index === 0 ? 'pt-6 pb-4' : 'py-4'
        } xs:text-xs text-sm w-3/10 text-right ${
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
      </div>
    </div>
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
  USN: 'https://awesomenear.com/decentral-bank',
  '1INCH': 'https://awesomenear.com/1inch-network',
  GRT: 'https://awesomenear.com/the-graph',
  LINK: 'https://awesomenear.com/chainlink',
  Cheddar: 'https://awesomenear.com/cheddar-farm',
  AURORA: 'https://awesomenear.com/aurora-dev',
  $META: 'https://awesomenear.com/meta-pool',
  UMINT: 'https://awesomenear.com/youminter',
  UTO: 'https://awesomenear.com/secret-skellies-society',
  DEIP: 'https://awesomenear.com/deip',
  WOO: 'https://awesomenear.com/woo-dex',
  LINEAR: 'https://awesomenear.com/linear-protocol',
  PEM: 'https://awesomenear.com/pembrock-finance',
  ATO: 'https://awesomenear.com/atocha-protocol',
  SEAT: 'https://awesomenear.com/seatlab-nft',
  FAR: 'https://awesomenear.com/few-and-far',
  BSTN: 'https://awesomenear.com/bastion',
  BRRR: 'https://awesomenear.com/burrow',
  XNL: 'https://awesomenear.com/chronicle',
  KSW: 'https://awesomenear.com/killswitch-finance',
  STNEAR: 'https://awesomenear.com/meta-pool',
  NearXC: 'https://awesomenear.com/stader',
  SD: 'https://awesomenear.com/stader',
  DISC: 'https://awesomenear.com/discovol',
};
