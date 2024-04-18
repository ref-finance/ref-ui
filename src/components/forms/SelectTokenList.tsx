import React, { useContext, useEffect, useState } from 'react';
import { TokenMetadata } from '../../services/ft-contract';
import { toInternationalCurrencySystemLongString } from 'src/utils/numbers';
import { toPrecision } from '../../utils/numbers';
import { SingleToken } from './SelectToken';
import { RefIcon } from '../icon/DexIcon';
import { TriIcon } from '../icon/DexIcon';
import { WalletContext } from '../../utils/wallets-integration';
import {
  CollectedIcon,
  NotFavoritedIcon,
  PinEmpty,
  PinSolid,
} from '../icon/Common';
import { localTokens, USER_COMMON_TOKEN_LIST } from './SelectToken';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
interface TokenProps {
  token: TokenMetadata;
  onClick: (token: TokenMetadata) => void;
  totalAmount?: string;
  sortBy?: string;
  price?: string;
  index?: number;
  forCross?: boolean;
  isRisk?: boolean;
}
export function tokenPrice(price: string, error?: boolean) {
  return (
    <span className="text-xs text-primaryText">
      {`$${
        error || !price
          ? '-'
          : toInternationalCurrencySystemLongString(price, 2)
      }`}
    </span>
  );
}
export default function SelectTokenList({
  token,
  onClick,
  sortBy,
  price,
  index,
  forCross,
  isRisk,
}: TokenProps) {
  const { icon, symbol, id, near, ref, total, onRef, onTri } = token;
  const {
    commonBassesTokens,
    getLatestCommonBassesTokens,
    getLatestCommonBassesTokenIds,
  } = useContext(localTokens);
  const local_user_list = getLatestCommonBassesTokenIds();
  const arr = new Set(local_user_list);
  const [hasPin, setHasPin] = useState<boolean>();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    const t = commonBassesTokens.find((token: TokenMetadata) => {
      if (token.id == id && token.symbol == symbol) return true;
    });
    if (t) {
      setHasPin(true);
    } else {
      setHasPin(false);
    }
  }, [commonBassesTokens]);
  const displayBalance = isSignedIn
    ? 0 < Number(near) && Number(near) < 0.001
      ? '< 0.001'
      : toPrecision(String(near), 3)
    : '-';

  const [hover, setHover] = useState(false);
  function pinToken(token: TokenMetadata) {
    if (token.id == WRAP_NEAR_CONTRACT_ID && token.symbol == 'NEAR') {
      arr.add('near');
    } else {
      arr.add(token.id);
    }
    localStorage.setItem(
      USER_COMMON_TOKEN_LIST,
      JSON.stringify(Array.from(arr))
    );
    getLatestCommonBassesTokens();
  }
  function removeToken(token: TokenMetadata) {
    if (token.id == WRAP_NEAR_CONTRACT_ID && token.symbol == 'NEAR') {
      arr.delete('near');
    } else {
      arr.delete(token.id);
    }
    localStorage.setItem(
      USER_COMMON_TOKEN_LIST,
      JSON.stringify(Array.from(arr))
    );
    getLatestCommonBassesTokens();
  }
  return (
    <div
      key={id + symbol}
      className="flex items-center justify-between w-full  hover:bg-white hover:bg-opacity-5 relative"
      onClick={() => onClick && onClick(token)}
      style={{
        height: '56px',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`flex items-center cursor-pointer pl-8 xsm:pl-5 xs:text-xs text-sm  ${
          index === 0 ? 'pt-4 pb-2' : 'py-2'
        }`}
      >
        <SingleToken isRisk={isRisk} token={token} price={price} />
      </div>
      <div
        className={!forCross ? 'hidden' : 'w-12 flex justify-start  absolute '}
        style={{
          left: '52%',
        }}
      >
        {onRef || onTri ? <RefIcon lightTrigger={hover} /> : null}

        {onTri ? <TriIcon lightTrigger={hover} /> : null}
      </div>
      <div
        className={`pr-4 ${
          index === 0 ? 'pt-6 pb-4' : 'py-4'
        } xs:text-xs text-sm w-3/10 text-right ${
          sortBy === 'near' ? 'text-white' : ''
        }`}
      >
        <div className="flex">
          <div className="text-right mr-3">
            <div className="text-sm text-white">{displayBalance}</div>
            <div className="text-xs text-primaryText">
              {price ? tokenPrice(price) : null}
            </div>
          </div>
          {
            <>
              {hasPin ? (
                <PinSolid
                  onClick={(e: any) => {
                    e.stopPropagation();
                    removeToken(token);
                  }}
                  className="text-primaryText hover:text-pinEmptyHoverColor cursor-pointer"
                ></PinSolid>
              ) : (
                <PinEmpty
                  onClick={(e: any) => {
                    e.stopPropagation();
                    pinToken(token);
                  }}
                  className="text-primaryText hover:text-pinEmptyHoverColor cursor-pointer"
                ></PinEmpty>
              )}
            </>
          }
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
  NearX: 'https://awesomenear.com/stader',
  SD: 'https://awesomenear.com/stader',
  DISC: 'https://awesomenear.com/discovol',
};
