import React, { useRef } from 'react';
import { Icon } from './StableTokenList';
import { FormattedMessage } from 'react-intl';
import { TokenMetadata } from '~services/ft-contract';

// stable swap exchange rate
export function SwapRateDetail({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <section className="block py-1">
      {title}
      <span className=" text-white inline-block mx-2">{value}</span>
      <FormattedMessage id="including_fees" defaultMessage="(including fees)" />
    </section>
  );
}

// stable swap radio list
export function TokensRadio({
  tokens,
  tokenIn,
  tokenOut,
  handleSwapFrom,
  handleSwapTo,
}: {
  tokens: TokenMetadata[];
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  handleSwapFrom: (e: any) => void;
  handleSwapTo: (e: any) => void;
}) {
  return (
    <div className=" flex py-7 border-b border-primaryText border-opacity-30">
      <div className=" text-white mr-24 flex-1">
        {tokens.map((item) => (
          <div className="flex my-3 items-center" key={item.id}>
            <input
              className="w-6"
              type="radio"
              checked={item.symbol === tokenIn.symbol ? true : false}
              id={item.id}
              name="from"
              value={item.symbol}
              onChange={(e) => {
                handleSwapFrom(e);
              }}
            />
            <Icon icon={item.icon} className="inline-block h-9 w-9 mx-3" />
            <label>{item.symbol}</label>
          </div>
        ))}
      </div>
      <div className=" text-white flex-1">
        {tokens.map((item) => (
          <div className="flex my-2 items-center" key={`second-${item.id}`}>
            <input
              className=" w-6"
              type="radio"
              checked={item.symbol === tokenOut.symbol ? true : false}
              id={item.id}
              name="to"
              value={item.symbol}
              onChange={(e) => {
                handleSwapTo(e);
              }}
            />
            <Icon icon={item.icon} className="inline-block h-9 w-9 mx-3" />
            <label>{item.symbol}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

//swap animation
export function SwapAnimation({
  tokenOut,
  tokenIn,
  setTokenIn,
  setTokenOut,
}: {
  tokenOut: TokenMetadata;
  tokenIn: TokenMetadata;
  setTokenIn: (token: TokenMetadata) => void;
  setTokenOut: (token: TokenMetadata) => void;
}) {
  const topBall = useRef<HTMLInputElement>();
  const bottomBall = useRef<HTMLInputElement>();
  const runSwapAnimation = function () {
    topBall.current.style.animation = 'rotation1 1s 0s ease-out 1';
    bottomBall.current.style.animation = 'rotation2 1s 0s ease-out 1';
    topBall.current.addEventListener('animationend', function () {
      topBall.current.style.animation = '';
    });
    bottomBall.current.addEventListener('animationend', function () {
      bottomBall.current.style.animation = '';
    });
  };
  return (
    <div className=" w-24">
      <div
        className="flex items-center justify-center border-t mt-12"
        style={{ borderColor: 'rgba(126, 138, 147, 0.3)' }}
      >
        <div
          className="relative flex items-center -mt-6 mb-4 w-11 h-11 border border-white border-opacity-40 rounded-full cursor-pointer bg-dark"
          onClick={() => {
            runSwapAnimation();
            setTokenIn(tokenOut);
            setTokenOut(tokenIn);
          }}
        >
          <div className="swap-wrap">
            <div className="top-ball" ref={topBall} id="top-ball" />
            <div className="bottom-ball" ref={bottomBall} id="bottom-ball" />
          </div>
        </div>
      </div>
    </div>
  );
}
