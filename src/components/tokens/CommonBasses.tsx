import React, { useContext, useEffect, useState } from 'react';
import { toRealSymbol } from '../../utils/token';
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
import { CommonCloseButton } from '../../components/icon/Common';
import {
  localTokens,
  USER_COMMON_TOKEN_LIST,
} from '../../components/forms/SelectToken';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
interface CommonBassesProps {
  onClick: (token: TokenMetadata) => void;
  tokenPriceList: Record<string, any>;
  allowWNEAR: boolean;
  handleClose: any;
}
const COMMON_BASSES = [
  'USN',
  'NEAR',
  'REF',
  'SKYWARD',
  'OCT',
  'STNEAR',
  'USDT.e',
  'USDt',
  'USDC',
  'ETH',
  'DAI',
  'WBTC',
  'AURORA',
  'SWEAT',
];

export default function CommonBasses({
  onClick,
  tokenPriceList,
  allowWNEAR,
  handleClose,
}: CommonBassesProps) {
  const { commonBassesTokens } = useContext(localTokens);
  return (
    <section className="px-6 xsm:px-3 pt-2">
      <div className="w-full flex flex-wrap items-center text-sm xs:text-xs text-left">
        {commonBassesTokens.map((token: TokenMetadata) => {
          const price = tokenPriceList[token.id]?.price;

          return (
            <div
              key={token.id + token.symbol}
              onClick={() => {
                if (
                  !(
                    token.id == WRAP_NEAR_CONTRACT_ID &&
                    token.symbol == 'wNEAR' &&
                    !allowWNEAR
                  )
                ) {
                  onClick && onClick(token);
                }
                handleClose();
              }}
            >
              <Token token={token} price={price} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
function Token({ token, price }: { token: TokenMetadata; price: string }) {
  const { getLatestCommonBassesTokens, getLatestCommonBassesTokenIds } =
    useContext(localTokens);
  const local_user_list = getLatestCommonBassesTokenIds();
  const arr = new Set(local_user_list);
  const [hover, setHover] = useState(false);
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
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`relative flex cursor-pointer items-center border border-commonTokenBorderColor rounded-lg px-2 py-1 mr-1.5 mb-2.5 ${
        hover ? 'bg-commonTokenBorderColor' : ''
      }`}
      style={{ minWidth: '90px' }}
    >
      {token.icon ? (
        <img
          src={token.icon}
          alt={toRealSymbol(token.symbol)}
          className="w-7 h-7 inline-block mr-2 border rounded-full border-greenLight"
        />
      ) : (
        <div className="w-7 h-7 inline-block mr-2 border rounded-full border-greenLight"></div>
      )}
      <CommonCloseButton
        onClick={(e: any) => {
          e.stopPropagation();
          if (!isMobile()) {
            removeToken(token);
          }
        }}
        className={`cursor-pointer absolute -top-1.5 -right-1.5 text-commonCloseColor hover:text-black ${
          hover ? 'xsm:hidden' : 'hidden'
        }`}
      ></CommonCloseButton>
      <div className="flex flex-col justify-between">
        <span className="text-sm text-white">{toRealSymbol(token.symbol)}</span>
        <span className="text-xs text-primaryText">{tokenPrice(price)}</span>
      </div>
    </div>
  );
}
