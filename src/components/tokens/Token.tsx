import React, { useContext, useEffect, useState } from 'react';
import { toRealSymbol } from '~utils/token';
import { TokenMetadata } from '../../services/ft-contract';
import { toInternationalCurrencySystem } from '~utils/numbers';
import { toPrecision } from '../../utils/numbers';
import { SingleToken } from '../forms/SelectToken';
import { RefIcon } from '../../components/icon/DexIcon';
import { TriIcon } from '../icon/DexIcon';
import {
  getCurrentWallet,
  WalletContext,
} from '../../utils/wallets-integration';
import { PinEmpty, PinSolid } from '../../components/icon/Common';
import {
  localTokens,
  USER_COMMON_TOKEN_LIST,
} from '../../components/forms/SelectToken';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import { isClientMobie } from '../../utils/device';
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
      className="flex items-center justify-between w-full  hover:bg-black hover:bg-opacity-10 relative"
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
        <SingleToken token={token} price={price} />
      </div>
      <div
        className={!forCross ? 'hidden' : 'w-12 flex justify-start  absolute '}
        style={{
          left: '43%',
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
        <div className="flex items-center justify-end pr-6">
          <span className="text-sm text-white mr-3">{displayBalance}</span>
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
