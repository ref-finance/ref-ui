import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { ArrowDown, ChartIcon } from './Icon';
import { TokenMetadata } from '~services/ft-contract';
import { SelectTokenDCL } from '../../../../components/forms/SelectToken';
import { LiquidityProviderData } from '../../AddYourLiquidityPageV3';

export function PairComponent() {
  const {
    tokenX,
    tokenY,
    setTokenX,
    setTokenY,
    pair_is_reverse,
    show_chart,
    set_show_chart,
  } = useContext(LiquidityProviderData);
  return (
    <div className="flex items-center justify-between px-4 mb-3 w-full">
      <div className="flex items-center gap-2.5">
        {!tokenX || !tokenY ? (
          <span className="text-lg gotham_bold text-white">
            Select Token Pair
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            <div
              className={`flex items-center ${
                pair_is_reverse ? 'flex-row-reverse' : ''
              }`}
            >
              <img
                src={tokenX.icon}
                style={{ borderWidth: '3px' }}
                className={`w-9 h-9 rounded-full border-orderTypeBg ${
                  pair_is_reverse ? '-ml-0.5' : ''
                }`}
              />
              <img
                src={tokenY.icon}
                style={{ borderWidth: '3px' }}
                className={`w-9 h-9 rounded-full border-1 border-orderTypeBg ${
                  pair_is_reverse ? '' : '-ml-0.5'
                }`}
              />
            </div>
            <div
              className={`flex items-center text-lg text-white gotham_bold ${
                pair_is_reverse ? 'flex-row-reverse' : ''
              }`}
            >
              <span>{tokenX.symbol}</span>-<span>{tokenY.symbol}</span>
            </div>
          </div>
        )}

        <SelectTokenDCL
          selectTokenIn={(token) => {
            setTokenX(token);
          }}
          selectTokenOut={(token: TokenMetadata) => {
            setTokenY(token);
          }}
          notNeedSortToken={true}
          className="pt-6  absolute top-5 outline-none   right-0    xs:text-white xs:font-bold xs:fixed xs:bottom-0 xs:w-full "
          selected={<ArrowDown />}
        />
      </div>
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-md bg-v3SwapGray bg-opacity-10 ${
          show_chart ? 'text-gradientFromHover' : 'text-v3SwapGray'
        }`}
        onClick={() => {
          set_show_chart(!show_chart);
        }}
      >
        <ChartIcon />
      </div>
    </div>
  );
}
