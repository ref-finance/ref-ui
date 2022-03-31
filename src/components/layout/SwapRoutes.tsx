import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { TokenMetadata, ftGetTokenMetadata } from '~services/ft-contract';
import { calculateFeePercent, toPrecision } from '../../utils/numbers';
import { toRealSymbol } from '~utils/token';
import { EstimateSwapView } from '../../services/stable-swap';
import { getPoolAllocationPercents } from '../../utils/numbers';
import { Pool } from '../../services/pool';

export const RouterIcon = () => {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2"
    >
      <path
        d="M13.4862 6.25488C12.2813 6.25488 11.2485 7.10159 11.019 8.28698H6.02703L4.7647 7.21448C4.93684 6.8758 5.05159 6.48067 5.10897 6.0291C5.10897 5.52107 4.93684 4.9566 4.59257 4.56147L6.02703 3.1503H11.0763C11.478 4.44858 12.8551 5.23884 14.1748 4.84371C15.4945 4.44858 16.2978 3.09385 15.8961 1.79557C15.4945 0.497295 14.1174 -0.292963 12.7977 0.102166C11.937 0.327954 11.3059 1.00532 11.0763 1.79557H5.51062L3.50237 3.77122C3.21548 3.65832 2.92859 3.60188 2.58432 3.60188C1.20723 3.54543 0.0596573 4.61792 0.00227872 5.97265C-0.0550999 7.32738 0.977715 8.45632 2.3548 8.51276H2.58432C3.04334 8.51276 3.44499 8.39987 3.84664 8.17408L5.568 9.6417H11.1911C11.7075 10.8835 13.142 11.5045 14.4043 11.0529C15.6666 10.5449 16.2978 9.13368 15.8388 7.89185C15.4371 6.8758 14.5191 6.25488 13.4862 6.25488V6.25488ZM13.4862 1.344C14.1174 1.344 14.6338 1.85202 14.6338 2.47294C14.6338 3.09385 14.1174 3.60188 13.4862 3.60188C12.8551 3.60188 12.3387 3.09385 12.3387 2.47294C12.3387 1.85202 12.8551 1.344 13.4862 1.344ZM2.58432 7.15804C1.95315 7.15804 1.43674 6.65001 1.43674 6.0291C1.43674 5.40818 1.95315 4.90016 2.58432 4.90016C3.21548 4.90016 3.73189 5.40818 3.73189 6.0291C3.73189 6.65001 3.21548 7.15804 2.58432 7.15804ZM13.4862 9.86749C12.8551 9.86749 12.3387 9.35947 12.3387 8.73855C12.3387 8.11763 12.8551 7.60961 13.4862 7.60961C14.1174 7.60961 14.6338 8.11763 14.6338 8.73855C14.6338 9.35947 14.1174 9.86749 13.4862 9.86749Z"
        fill="url(#paint0_linear_12461_2312)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_12461_2312"
          x1="8"
          y1="0"
          x2="8"
          y2="11.2"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C6A2" />
          <stop offset="1" stopColor="#8C78FF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const AutoRouterText = () => {
  return (
    <span className="from-greenColor to-purple bg-gradient-to-r valueStyle">
      <FormattedMessage id="auto_router" defaultMessage="Auto Router" />
    </span>
  );
};

export const ArrowRight = () => {
  return (
    <div className="mx-1">
      <svg
        width="12"
        height="5"
        viewBox="0 0 12 5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.864 4.4C9.024 4.05867 9.17867 3.76 9.328 3.504C9.488 3.248 9.64267 3.03467 9.792 2.864H0.464V2.192H9.792C9.64267 2.01067 9.488 1.792 9.328 1.536C9.17867 1.28 9.024 0.986666 8.864 0.656H9.424C10.096 1.43467 10.8 2.01067 11.536 2.384V2.672C10.8 3.03467 10.096 3.61067 9.424 4.4H8.864Z"
          fill="#7E8A93"
        />
      </svg>
    </div>
  );
};

export const Icon = ({ token }: { token: TokenMetadata }) => {
  if (token.icon) {
    return (
      <img
        src={token.icon}
        className={`w-4 h-4 rounded-full border border-gradientFromHover flex-shrink-0`}
        alt=""
      />
    );
  } else {
    return (
      <div
        className={`w-4 h-4 rounded-full border border-gradientFromHover flex-shrink-0	`}
      />
    );
  }
};

export const ParaTokenFrom = ({
  tokenIn,
  p,
}: {
  tokenIn: TokenMetadata;
  p: string;
}) => {
  return (
    <div
      className="rounded-md py-1 pl-2 pr-1 flex items-center relative justify-between "
      style={{
        width: '60px',
      }}
    >
      <span className="text-xs text-left text-gray-400 pr-0.5 ">{p}%</span>
      <span className="">
        <Icon token={tokenIn} />
      </span>
    </div>
  );
};

export const PoolInfo = ({ poolId, fee }: { poolId: number; fee: number }) => {
  return (
    <div
      className="flex items-center bg-inputDarkBg px-1 text-gray-400 rounded-md grid grid-cols-2 w-32"
      style={{
        paddingTop: '3px',
        paddingBottom: '3px',
        height: '24px',
      }}
    >
      <div className="bg-acccountBlock text-xs font-semibold rounded pl-1.5 pr-1.5 col-span-1 text-left	h-full flex items-center">
        <div>{`# ${poolId}`}</div>
      </div>
      <span className="col-span-1 text-center">
        {toPrecision(calculateFeePercent(fee).toString(), 2)}%
      </span>
    </div>
  );
};

export const OneParallelRoute = ({
  p,
  tokenIn,
  tokenOut,
  poolId,
  fee,
}: {
  p: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  poolId: number;
  fee: number;
}) => {
  return (
    <div className="flex items-center justify-between ">
      <div className="col-end-3 col-start-1">
        <ParaTokenFrom tokenIn={tokenIn} p={p} />
      </div>
      <ArrowRight />
      <div className="col-end-9 col-span-4 ml-0.5">
        <PoolInfo poolId={poolId} fee={fee} />
      </div>
      <ArrowRight />
      <div className="col-end-12">
        <Icon token={tokenOut} />
      </div>
    </div>
  );
};

export const SmartRouteV2 = ({
  tokens,
  p,
  pools,
}: {
  tokens: TokenMetadata[];
  p: string;
  pools: Pool[];
}) => {
  const Hub = ({ token, poolId }: { token: TokenMetadata; poolId: number }) => {
    return (
      <div
        className="flex items-center bg-inputDarkBg rounded-2xl pr-1 flex-shrink-0"
        style={{
          width: '72px',
          height: '22px',
        }}
      >
        <div className="w-full flex items-center justify-start pl-2">
          <span className="text-gray-400">{`#${poolId}`}</span>
        </div>
        <Icon token={token} />
      </div>
    );
  };

  if (tokens.length == 3) {
    return (
      <div className="text-white flex items-center justify-between">
        {/* <Hub token={tokens[0]} /> */}

        <ParaTokenFrom tokenIn={tokens[0]} p={p} />
        <div className="px-3">
          <ArrowRight />
        </div>

        <Hub token={tokens[1]} poolId={pools?.[0]?.id} />
        <div className="px-3">
          <ArrowRight />
        </div>

        <Hub token={tokens[2]} poolId={pools?.[1]?.id} />
      </div>
    );
  } else if (tokens.length == 2) {
    return (
      <div className="text-white flex items-center justify-between">
        <ParaTokenFrom tokenIn={tokens[0]} p={p} />
        <div className="px-3">
          <ArrowRight />
        </div>
        <Hub token={tokens[1]} poolId={pools?.[0]?.id} />
      </div>
    );
  } else {
    return <div></div>;
  }
};
