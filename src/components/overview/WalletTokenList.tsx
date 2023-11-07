import {
  display_number_internationalCurrencySystemLongString,
  display_value,
} from 'src/components/portfolio/Tool';
import Big from 'big.js';
import { RefAndDCLWithdrawButton } from 'src/components/overview/ActionButtons';
import React from 'react';
import { TokenMetadata } from 'src/services/ft-contract';

type Props = {
  token: TokenMetadata;
  tokenBalance: number | string;
  showTokenPrice: any;
  showWithdraw?: boolean;
};

export const WalletTokenList = ({
  token,
  tokenBalance,
  showTokenPrice,
  showWithdraw,
}: Props) => {
  const { ref, dcl, id, decimals } = token || {};
  const isRefClassic = Number(ref) > 0;
  const isDCL = Number(dcl) > 0;

  return (
    <div className="grid grid-cols-7 px-3 hover:bg-symbolHover rounded-md  py-3 text-sm flex items-center">
      <div className="flex items-center col-span-3">
        <img
          className="w-4 h-4 border border-gradientFrom rounded-full mr-2.5"
          src={token.icon}
          alt={''}
        />
        <span className="text-sm text-primaryText">{token.symbol}</span>
      </div>
      <div className="col-span-1 text-white">
        {display_number_internationalCurrencySystemLongString(
          Big(tokenBalance || 0).toFixed()
        )}
      </div>
      <div className="col-span-1 text-white">{showTokenPrice(token)}</div>
      <span className="text-sm text-white">{display_value(token.t_value)}</span>
      <div className="col-span-1 cursor-pointer relative z-10">
        {showWithdraw && <RefAndDCLWithdrawButton token={token} />}
      </div>
    </div>
  );
};
