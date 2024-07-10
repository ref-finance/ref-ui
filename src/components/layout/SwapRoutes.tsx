import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TokenMetadata, ftGetTokenMetadata } from '../../services/ft-contract';

import { FaAngleRight } from '../reactIcons';

import {
  calculateFeePercent,
  toPrecision,
  calculateExchangeRate,
  calculateFeeCharge,
  toInternationalCurrencySystemLongString,
} from '../../utils/numbers';
import { toRealSymbol } from '../../utils/token';

import { EstimateSwapView } from 'src/services/swap';

import {
  getPoolAllocationPercents,
  percent,
  getRouteAllocationPercents,
} from '../../utils/numbers';
import { Pool } from '../../services/pool';
import { FaAngleUp, FaAngleDown } from '../reactIcons';
import { Card } from '../card/Card';
import {
  FlashAction,
  OrderlyActions,
  OrderlyOrderBookIcon,
  OrderlyOrderBookIconMobile,
  RefIconNew,
  RefSwapPro,
  TriAndAurora,
} from '../icon/CrossSwapIcons';
import _, { result } from 'lodash';
//@ts-ignore
import { getExpectedOutputFromActionsORIG } from '../../services/smartRouteLogic';
import {
  RefIcon,
  RefIconLarge,
  TriIcon,
  NEARICONDEX,
  TriIconLarge,
  AURORAICONDEX,
} from '../icon/DexIcon';
import {
  separateRoutes,
  ONLY_ZEROS,
  scientificNotationToString,
} from '../../utils/numbers';
import Big from 'big.js';
import { useTokenPriceList } from '../../state/token';
import { PopUpContainer, PopUpContainerMulti } from '../icon/Info';
import { percentLess, multiply, divide } from '../../utils/numbers';
import { QuestionTip } from './TipWrapper';
import { HiOutlineExternalLink } from '../reactIcons';
import { Images } from '../stableswap/CommonComp';
import { getAuroraConfig } from '../../services/aurora/config';
import { isMobile, useClientMobile } from '../../utils/device';
import { getV3PoolId } from '../../services/swapV3';
import { nearMetadata, WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import {
  SwapContractType,
  SwapMarket,
  SwapProContext,
} from '../../pages/SwapPage';
import {
  ExchangeEstimate,
  TradeEstimates,
  SWAP_TYPE,
} from '../../pages/SwapPage';
import { DisplayIcon } from '../../components/tokens/Icon';
import Modal from 'react-modal';
import { ModalWrapper } from '../../pages/ReferendumPage';
import { displayNumberToAppropriateDecimals } from '../../services/commonV3';
import { numberWithCommas } from '../../pages/Orderly/utiles';
import { get_pool_name, openUrl } from '../../services/commonV3';
import getConfigV2 from '../../services/configV2';

import { REF_FI_BEST_MARKET_ROUTE } from '../../state/swap';
import { PolygonRight } from '../../pages/Orderly/components/Common/Icons';
import {
  IEstimateSwapServerView,
  IServerRoute,
  getTokensOfRoute,
} from '../../services/smartRouterFromServer';
const configV2 = getConfigV2();
export const GetPriceImpact = (
  value: string,
  tokenIn?: TokenMetadata,
  tokenInAmount?: string
) => {
  const textColor =
    Number(value) <= 1
      ? 'text-white xs:text-primaryText'
      : 1 < Number(value) && Number(value) <= 2
      ? 'text-warn'
      : 'text-error';

  const displayValue = scientificNotationToString(
    multiply(tokenInAmount, divide(value, '100'))
  );
  const tokenInInfo =
    Number(displayValue) <= 0
      ? ` / 0 ${toRealSymbol(tokenIn?.symbol)}`
      : ` / -${toInternationalCurrencySystemLongString(displayValue, 3)} ${
          tokenIn?.symbol
        }`;

  if (Number(value) < 0.01)
    return (
      <span className="text-white xs:text-primaryText">
        {`< -0.01%`}
        {tokenInInfo}
      </span>
    );

  if (Number(value) > 1000)
    return (
      <span className="text-error">
        {`< -1000%`}
        {tokenInInfo}
      </span>
    );

  return (
    <span className={`${textColor} `}>
      {`-${toPrecision(value || '0', 2)}%`}
      {tokenInInfo}
    </span>
  );
};

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

export const Icon = ({
  token,
  size,
}: {
  token: TokenMetadata;
  size?: string;
}) => {
  const imgSize = size || '4';

  if (token.icon) {
    return (
      <img
        src={token.icon}
        className={`w-${imgSize} h-${imgSize}  rounded-full border border-gradientFromHover flex-shrink-0`}
        alt=""
      />
    );
  } else {
    return (
      <div
        className={`w-${imgSize}  h-${imgSize}   rounded-full border bg-cardBg border-gradientFromHover flex-shrink-0	`}
      />
    );
  }
};

export const CrossIcon = ({
  Icon,
  poolId,
}: {
  Icon: JSX.Element;
  poolId?: number | string;
}) => {
  return typeof poolId === 'number' && Number(poolId) >= 0 ? (
    <div className="h-4 relative rounded-xl bg-black bg-opacity-20 pl-2 pr-6 py-0.5 flex items-center">
      <span
        className="opacity-50"
        style={{
          fontSize: '10px',
        }}
      >
        #{poolId}
      </span>
      <div
        className="absolute  right-0 flex-shrink-0"
        style={{
          top: '-2px',
        }}
      >
        {Icon}
      </div>
    </div>
  ) : (
    <div className="flex-shrink-0">{Icon}</div>
  );
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
      className=" items-center bg-inputDarkBg px-1 text-gray-400 rounded-md grid grid-cols-2 w-32"
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
  tokenIn,
  tokenOut,
}: {
  tokens: TokenMetadata[];
  p: string;
  pools: Pool[];
  tokenIn?: TokenMetadata;
  tokenOut?: TokenMetadata;
}) => {
  const Hub = ({
    token,
    poolId,
    Dex,
  }: {
    token: TokenMetadata;
    poolId: number;
    Dex: string;
  }) => {
    const onTri = Dex && Dex === 'tri';

    return (
      <div
        className={`flex items-center ${
          onTri ? 'bg-transparent justify-end' : 'bg-inputDarkBg'
        }  rounded-2xl pr-1 flex-shrink-0`}
        style={{
          width: '72px',
          height: '22px',
        }}
      >
        <div
          className={`w-full flex items-center justify-start pl-2 ${
            onTri ? 'hidden' : 'block'
          }`}
        >
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

        <ParaTokenFrom tokenIn={tokenIn || tokens[0]} p={p} />
        <div className="px-3">
          <ArrowRight />
        </div>

        <Hub token={tokens[1]} poolId={pools?.[0]?.id} Dex={pools?.[0]?.Dex} />
        <div className="px-3">
          <ArrowRight />
        </div>

        <Hub
          token={tokenOut || tokens[2]}
          poolId={pools?.[1]?.id}
          Dex={pools?.[0]?.Dex}
        />
      </div>
    );
  } else if (tokens.length == 2) {
    return (
      <div className="text-white flex items-center justify-between">
        <ParaTokenFrom tokenIn={tokenIn || tokens[0]} p={p} />
        <div className="px-3">
          <ArrowRight />
        </div>
        <Hub
          token={tokenOut || tokens[1]}
          poolId={pools?.[0]?.id}
          Dex={pools?.[0]?.Dex}
        />
      </div>
    );
  } else {
    return <div></div>;
  }
};

export const PoolName = ({
  dex,
  translate,
}: {
  dex: string;
  translate: string;
}) => {
  return (
    <span
      style={{
        position: 'relative',
        fontSize: '10px',
        opacity: '0.5',
        right: `${Number(dex === 'tri' ? 0 : 10) + Number(translate)}px`,
      }}
    >
      {dex === 'tri' ? 'Trisolaris' : 'Ref'}
    </span>
  );
};

const BestIcon = () => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="9" cy="9" r="9" fill="#00C6A2" />
      <path
        d="M3.91844 7.81449L3.91309 12.7226C3.91309 13.0199 4.18742 13.3041 4.68869 13.3041H6.25366H6.32856H6.39426H6.45769V7.04346H4.691C4.20195 7.05339 3.91844 7.52105 3.91844 7.81449Z"
        fill="#1C272E"
      />
      <path
        d="M13.4936 6.26174L11.7315 6.26097C12.9755 2.14678 10.6434 2.34928 10.6434 2.34928C9.80356 2.34928 9.38404 3.06834 9.38404 3.91273C9.38099 3.88752 9.38176 3.91349 9.38328 3.92266C9.33819 5.27825 7.65707 6.73779 6.89062 6.99835V13.3041H12.7111C13.6036 13.3041 13.897 12.5216 13.897 12.5216C14.4052 11.3074 15.0356 8.52513 15.0501 8.36697C15.2374 6.34807 13.4936 6.26174 13.4936 6.26174Z"
        fill="#1C272E"
      />
    </svg>
  );
};

export function SwapRateDetail({
  value,
  from,
  to,
  tokenIn,
  tokenOut,
  isRevert,
  setIsRevert,
  tokenPriceList,
}: {
  value: string | JSX.Element;
  from: string;
  to: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  tokenPriceList: any;
  isRevert?: boolean;
  setIsRevert?: any;
}) {
  const [newValue, setNewValue] = useState<string | JSX.Element>(value);

  const exchangeRageValue = useMemo(() => {
    try {
      const fromNow = isRevert ? to : from;
      const toNow = isRevert ? from : to;
      if (ONLY_ZEROS.test(fromNow)) return '-';

      const value = calculateExchangeRate(0, fromNow, toNow);

      return Number(value) < 0.001 ? '< 0.0001' : value;
    } catch (error) {
      return '-';
    }
  }, [isRevert, to]);

  useEffect(() => {
    const curPrice = isRevert
      ? tokenPriceList?.[tokenOut?.id]?.price
      : tokenPriceList?.[tokenIn?.id]?.price;

    setNewValue(
      <span>
        {`1 ${toRealSymbol(isRevert ? tokenOut?.symbol : tokenIn?.symbol)} `}{' '}
        {!!curPrice ? (
          <span className="text-primaryText">
            (${toPrecision(curPrice, 2)})
          </span>
        ) : null}{' '}
        <label className="arial_font">≈</label>{' '}
        {`${exchangeRageValue} ${toRealSymbol(
          isRevert ? tokenIn?.symbol : tokenOut?.symbol
        )}`}
      </span>
    );
  }, [isRevert.toString()]);

  function switchSwapRate() {
    setIsRevert(!isRevert);
  }

  return (
    <div
      className="flex items-center cursor-pointer justify-end opacity-60 hover:opacity-100 text-white "
      onClick={switchSwapRate}
    >
      <span className=" text-xs">{newValue}</span>
    </div>
  );
}

export const CrossSwapRoute = ({
  route,
  p,
  tokenIn,
  tokenOut,
}: {
  route: EstimateSwapView[];
  p: string;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) => {
  const [hoverRouter1, setHoverRouter1] = useState(false);

  const [hoverRouter2, setHoverRouter2] = useState(false);

  return (
    <div className="flex items-center text-xs text-white w-full">
      {route.length === 1 ? (
        <div
          className={`w-full flex-shrink-0 h-4 flex items-center rounded-xl  justify-between relative `}
        >
          <span
            className="flex items-center  rounded-md p-1 py-0.5"
            style={{
              background: '#24333D',
            }}
          >
            <Icon token={tokenIn || route[0].tokens[0]} size={'5'} />
            <span className="text-right mx-0.5">{p}%</span>
          </span>

          <div
            className="w-full absolute bottom-2"
            style={{
              border: '1px dashed #304352',
              zIndex: -1,
            }}
          ></div>

          <div
            style={{
              background: '#24333D',
            }}
            className="py-1 px-1 flex items-center rounded-md hover:text-gray-400 cursor-pointer text-primaryText"
            onClick={() => {
              if (route[0].pool?.Dex === 'ref') {
                openUrl(`/pool/${route[0].pool.id}`);
              } else
                openUrl(
                  `${getAuroraConfig().explorer}/address/${
                    route[0].pool?.pairAdd
                  }`
                );
            }}
            onMouseEnter={() => setHoverRouter1(true)}
            onMouseLeave={() => setHoverRouter1(false)}
          >
            <span
              style={{
                color: route[0].pool?.Dex === 'tri' ? '#277CF7' : '#00C6A2',
              }}
              className="font-bold mr-1"
            >
              {route[0].pool?.Dex === 'tri' ? 'Tri' : ''}
            </span>

            {route[0].pool?.Dex !== 'tri' && (
              <span className="flex items-center mx-1">
                <Images
                  border
                  borderStyle="1px solid #00C6A2"
                  size="4"
                  tokens={route[0].tokens.map((t) =>
                    t?.symbol === 'wNEAR' ? nearMetadata : t
                  )}
                />

                <span className=" ml-1">{`#${route[0].pool.id}`}</span>
              </span>
            )}

            <span
              className={`flex items-center cursor-pointer justify-center ${
                hoverRouter1 ? 'text-gradientFrom' : ''
              } `}
            >
              <HiOutlineExternalLink />
            </span>
          </div>

          <div className="flex-shrink-0">
            <Icon token={tokenOut || route[0].tokens[1]} size={'5'} />
          </div>
        </div>
      ) : (
        <div
          className={`w-full flex-shrink-0 h-4 flex items-center rounded-xl  justify-between relative `}
        >
          <span
            className="flex items-center w-14  rounded-md p-1 py-0.5"
            style={{
              background: '#24333D',
            }}
          >
            <Icon token={tokenIn || route[0].tokens[0]} size={'5'} />
            <span className="text-right mx-0.5">{p}%</span>
          </span>

          <div
            className="w-full absolute bottom-2"
            style={{
              border: '1px dashed #304352',
              zIndex: -1,
            }}
          ></div>

          <div
            style={{
              background: '#24333D',
              left: '30%',
            }}
            className="py-1 absolute  px-1 flex items-center rounded-md hover:text-gray-400 cursor-pointer text-primaryText"
            onClick={() => {
              openUrl(`/pool/${route[0].pool.id}`);
            }}
            onMouseEnter={() => setHoverRouter1(true)}
            onMouseLeave={() => setHoverRouter1(false)}
          >
            <span className="flex items-center mx-1">
              <Images
                border
                borderStyle="1px solid #00C6A2"
                size="4"
                tokens={route[0].tokens
                  .slice(0, 2)
                  .map((t) => (t?.symbol === 'wNEAR' ? nearMetadata : t))}
              />

              <span className=" ml-1">{`#${route[0].pool.id}`}</span>
            </span>

            <span
              className={`flex items-center cursor-pointer justify-center ${
                hoverRouter1 ? 'text-gradientFrom' : ''
              } `}
            >
              <HiOutlineExternalLink />
            </span>
          </div>

          <div
            style={{
              background: '#24333D',
            }}
            className="py-1  px-1 flex items-center rounded-md hover:text-gray-400 cursor-pointer text-primaryText"
            onClick={() => {
              openUrl(`/pool/${route[1].pool.id}`);
            }}
            onMouseEnter={() => setHoverRouter2(true)}
            onMouseLeave={() => setHoverRouter2(false)}
          >
            <span className="flex items-center mx-1">
              <Images
                border
                borderStyle="1px solid #00C6A2"
                size="4"
                tokens={route[1].tokens
                  .slice(1, 3)
                  .map((t) => (t?.symbol === 'wNEAR' ? nearMetadata : t))}
              />

              <span className=" ml-1">{`#${route[1].pool.id}`}</span>
            </span>

            <span
              className={`flex items-center cursor-pointer justify-center  ${
                hoverRouter2 ? 'text-gradientFrom' : ''
              } `}
            >
              <HiOutlineExternalLink />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const getDexIcon = (market: SwapMarket) => {
  if (market === 'ref') return <RefIconNew></RefIconNew>;
  if (market === 'orderly')
    return isMobile() ? (
      <OrderlyOrderBookIconMobile></OrderlyOrderBookIconMobile>
    ) : (
      <OrderlyOrderBookIcon></OrderlyOrderBookIcon>
    );
  if (market === 'tri') return <TriAndAurora></TriAndAurora>;
};

export const getDexAction = (market: SwapMarket) => {
  if (market === 'ref') return <FlashAction></FlashAction>;

  if (market === 'orderly') return <OrderlyActions></OrderlyActions>;

  if (market === 'tri') return <FlashAction></FlashAction>;
};

export const SwapRoute = ({
  route,
  market,
  routeServer,
}: {
  route?: EstimateSwapView[];
  market: SwapMarket;
  routeServer?: IServerRoute;
}) => {
  const [tokens, setTokens] = useState([]);
  useEffect(() => {
    if (route) {
      setTokens(route[0].tokens);
    } else if (routeServer) {
      getTokensOfRoute(routeServer).then((res) => {
        setTokens(res);
      });
    }
  }, [route, routeServer]);

  const { swapType } = useContext(SwapProContext);

  return (
    <div className="frcs">
      <div
        style={{
          height: '13px',
          width: '13px',
        }}
        className="frcc mr-1.5"
      >
        {getDexIcon(market)}
      </div>

      {isMobile() &&
        swapType === SWAP_TYPE.Pro &&
        sessionStorage.getItem(REF_FI_BEST_MARKET_ROUTE) ===
          market.toString() && (
          <div className="px-1 mr-1 rounded-2xl text-10px bg-gradientFromHover text-black">
            <FormattedMessage
              id="best"
              defaultMessage={'Best'}
            ></FormattedMessage>
          </div>
        )}

      <div
        className="bg-limitOrderInputColor mr-1"
        style={{
          height: '10px',
          width: '1px',
        }}
      ></div>
      <div
        className="frcs"
        style={{
          maxWidth: isMobile() ? '180px' : '',
        }}
      >
        {tokens &&
          tokens.map((t, i) => {
            return (
              <div
                key={i}
                className={`text-xs ${
                  tokens.length === 3 && toRealSymbol(t.symbol).length > 7
                    ? 'xsm:overflow-hidden'
                    : ''
                }  ml-0.5 text-primaryText frcs`}
              >
                {i > 0 && <FaAngleRight />}
                <span
                  className={
                    tokens.length === 3 && toRealSymbol(t.symbol).length > 7
                      ? 'overflow-hidden overflow-ellipsis'
                      : ''
                  }
                >
                  {toRealSymbol(t.symbol)}
                </span>
              </div>
            );
          })}

        <span className="lg:hidden ml-1.5">
          <PolygonRight></PolygonRight>
        </span>
      </div>
    </div>
  );
};

export const SwapRouteMoreThan2 = ({
  market,
  trade,
  throughPools,
}: {
  market: SwapMarket;
  trade: ExchangeEstimate;
  throughPools: number;
}) => {
  const intl = useIntl();

  const { swapType } = useContext(SwapProContext);
  return (
    <div className="frcs">
      <div
        style={{
          height: '13px',
          width: '13px',
        }}
        className="frcc mr-1.5"
      >
        {getDexIcon(market)}
      </div>

      {isMobile() &&
        swapType === SWAP_TYPE.Pro &&
        sessionStorage.getItem(REF_FI_BEST_MARKET_ROUTE) ===
          market.toString() && (
          <div className="px-1 mr-1 rounded-2xl text-10px bg-gradientFromHover text-black">
            <FormattedMessage
              id="best"
              defaultMessage={'Best'}
            ></FormattedMessage>
          </div>
        )}

      <div
        className="bg-limitOrderInputColor mr-1"
        style={{
          height: '10px',
          width: '1px',
        }}
      ></div>
      <div className="frcs text-primaryText">
        {intl.locale === 'zh-CN' &&
          intl.formatMessage({
            id: 'steps_in_the_route_zh',
          })}
        <span className={intl.locale === 'zh-CN' ? 'mr-0' : 'mr-1'}>
          {throughPools}
        </span>

        <FormattedMessage
          id="steps_in_the_route"
          defaultMessage={'steps in the route'}
        ></FormattedMessage>

        <span className="lg:hidden ml-1.5">
          <PolygonRight></PolygonRight>
        </span>
      </div>
    </div>
  );
};
export function RouteDCLDetail({
  bestFee,
  tokenIn,
  tokenOut,
  isXSwap,
}: {
  bestFee: number;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  isXSwap?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const isMobile = useClientMobile();
  const pool_id = getV3PoolId(tokenIn.id, tokenOut.id, bestFee * 100);
  const pool_id_url_params = get_pool_name(pool_id);

  return (
    <section
      className={`${
        isXSwap ? 'py-0 w-full' : 'py-2'
      }  flex  text-xs items-center justify-between rounded-xl`}
    >
      <div className={`text-farmText ${isXSwap ? 'hidden' : ''}`}>
        <div className="inline-flex items-center">
          <FormattedMessage id="route" defaultMessage={'Route'} />
        </div>
      </div>
      <div
        className={`flex-shrink-0 h-4  ${
          isXSwap ? 'w-full' : ''
        }  flex items-center rounded-xl  justify-between relative z-0`}
      >
        <span
          className="flex items-center  rounded-md p-1 py-0.5"
          style={{
            background: '#24333D',
          }}
        >
          <Icon token={tokenIn} size={isMobile ? '3' : '3.5'} />
          <span className="text-right mx-0.5 text-farmText">100%</span>
        </span>

        <div
          className="w-full absolute bottom-2"
          style={{
            border: '1px dashed #304352',
            zIndex: -1,
          }}
        ></div>

        <div
          style={{
            background: '#24333D',
          }}
          className={`py-1 px-1 flex items-center rounded-md mx-5 cursor-pointer text-farmText ${
            isXSwap ? 'hover:text-gray-400' : ''
          }`}
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            openUrl(`/poolV2/${pool_id_url_params}`);
          }}
        >
          <span className="font-bold mr-1 ">DCL</span>

          <span className="flex items-center mx-1">
            <Images
              border
              borderStyle="1px solid #00C6A2"
              size={isMobile ? '3' : '3.5'}
              tokens={[
                tokenIn?.id == WRAP_NEAR_CONTRACT_ID ? nearMetadata : tokenIn,
                tokenOut?.id == WRAP_NEAR_CONTRACT_ID ? nearMetadata : tokenOut,
              ]}
            />
          </span>

          <div className={`flex items-center`}>
            <span className=" mr-1">{bestFee / 100}%</span>
            <span
              className={`flex items-center cursor-pointer  justify-center ${
                hover ? 'text-senderHot' : ''
              }`}
            >
              <HiOutlineExternalLink />
            </span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Icon token={tokenOut} size={isMobile ? '3' : '3.5'} />
        </div>
      </div>
    </section>
  );
}

function CrossSwapRoutesDetail({
  swapsTodo,
  tokenOut,
  tokenIn,
  fee,
}: {
  swapsTodo: EstimateSwapView[];
  tokenOut: TokenMetadata;
  tokenIn: TokenMetadata;
  fee: number;
}) {
  const routes = separateRoutes(swapsTodo, tokenOut.id);
  const pools = routes?.map((todo) => todo[0].pool);

  const percents = useMemo(() => {
    try {
      return getPoolAllocationPercents(pools);
    } catch (error) {
      return [];
    }
  }, [pools]);

  return (
    <section className="text-xs pb-2 text-white w-full">
      {routes?.map((route, i) => {
        return (
          <div
            key={i}
            className={`flex ${
              i > 0 ? 'mt-3' : ''
            } items-center w-full relative`}
          >
            {route[0].pool === null ? (
              <RouteDCLDetail
                bestFee={fee}
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                isXSwap
              />
            ) : (
              <CrossSwapRoute
                tokenIn={tokenIn}
                tokenOut={tokenOut}
                route={route}
                p={percents[i]}
              />
            )}
          </div>
        );
      })}
    </section>
  );
}

const GetPriceImpactWarning = (
  value: string,
  tokenIn?: TokenMetadata,
  tokenInAmount?: string
) => {
  const textColor =
    Number(value) <= 1
      ? 'text-greenLight'
      : 1 < Number(value) && Number(value) <= 2
      ? 'text-warn'
      : 'text-redwarningColor';

  const displayValue = scientificNotationToString(
    multiply(tokenInAmount, divide(value, '100'))
  );
  const tokenInInfo = (
    <span className="whitespace-nowrap ">
      <span className="gotham_bold">
        {Number(displayValue) <= 0
          ? ` / 0 `
          : ` / -${toInternationalCurrencySystemLongString(displayValue, 3)} `}
      </span>

      <span className="gotham">{toRealSymbol(tokenIn?.symbol)}</span>
    </span>
  );

  Number(displayValue) <= 0
    ? ` / 0 `
    : ` / -${toInternationalCurrencySystemLongString(displayValue, 3)} `;

  if (Number(value) < 0.01)
    return (
      <span className="text-greenLight">
        {`< -0.01%`}
        {tokenInInfo}
      </span>
    );

  if (Number(value) > 1000)
    return (
      <span className="">
        {`< -1000%`}
        {tokenInInfo}
      </span>
    );

  return (
    <span className={`${textColor}`}>
      <span className="gotham_bold">
        {` -${toPrecision(value || '0', 2)}%`}
      </span>
      {tokenInInfo}
    </span>
  );
};

export const CrossSwapAllResult = ({
  refTodos,
  triTodos,
  tokenInAmount,
  tokenOutId,
  slippageTolerance,
  tokenOut,
  LoadingRefresh,
  selectTodos,
  setSelectTodos,
  tokenIn,
  setSelectReceive,
  tokenPriceList,
  feeRef,
  feeTri,
  priceImpactRef,
  priceImpactTri,
  selectReceive,
  supportLedger,
}: {
  refTodos: EstimateSwapView[];
  triTodos: EstimateSwapView[];
  tokenInAmount: string;
  tokenOutId: string;
  slippageTolerance: number;
  tokenOut: TokenMetadata;
  LoadingRefresh: JSX.Element;
  selectTodos: EstimateSwapView[];
  supportLedger: boolean;
  setSelectTodos: (todos: EstimateSwapView[]) => void;
  tokenIn: TokenMetadata;
  tokenPriceList: any;
  setSelectReceive?: any;
  feeRef: number;
  feeTri: number;
  priceImpactRef: string;
  priceImpactTri: string;
  selectReceive: string;
}) => {
  const results = [refTodos, triTodos].filter(
    (r) => !!r && !!r?.[0] && !!r?.[0].estimate
  );

  const isMobile = useClientMobile();

  const [hoverOptimal, setHoverOptimal] = useState(false);

  const handleHoverOptimal = (hover: boolean) => {
    if (isMobile) return;
    setHoverOptimal(hover);
  };

  const SelectPopOver = ({
    curSwapTodos,
    fee,
    minAmount,
    priceImpact,
    receive,
  }: {
    curSwapTodos: EstimateSwapView[];
    fee: number;
    minAmount: string;
    priceImpact: string;
    receive: string;
  }) => {
    const intl = useIntl();

    const priceImpactDisplay = useMemo(() => {
      if (!priceImpact || !tokenIn || !tokenInAmount) return null;

      try {
        return GetPriceImpact(priceImpact, tokenIn, tokenInAmount);
      } catch (error) {
        return '-';
      }
    }, [receive, priceImpact]);

    const poolFeeDisplay = useMemo(() => {
      if (!fee || !tokenInAmount || !tokenIn) return null;

      try {
        return `${toPrecision(
          calculateFeePercent(fee || 0).toString(),
          2
        )}% / ${calculateFeeCharge(fee, tokenInAmount)} ${toRealSymbol(
          tokenIn?.symbol
        )}`;
      } catch (error) {
        return '-';
      }
    }, [receive]);

    const isMulti = curSwapTodos && curSwapTodos.length > 2;

    return (
      <div
        className="absolute gotham_font xs:relative xs:text-primaryText xs:rounded-xl xs:px-2.5 xs:mt-2  p-4  text-xs  cursor-default text-white whitespace-nowrap"
        style={{
          width: isMobile ? '100%' : '316px',
          height: isMobile ? null : isMulti ? '150px' : '124px',
          zIndex: 60,
          left: isMobile ? '' : '-300px',
          border: isMobile ? '1.2px solid #304352' : '',
          fontSize: isMobile ? '13px' : '',
        }}
      >
        {isMobile ? null : isMulti ? (
          <PopUpContainerMulti />
        ) : (
          <PopUpContainer />
        )}

        <CrossSwapRoutesDetail
          swapsTodo={curSwapTodos}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          fee={fee}
        />

        <div className="flex items-center mt-2.5 justify-between">
          <span className="">{intl.formatMessage({ id: 'price_impact' })}</span>
          <span>{priceImpactDisplay}</span>
        </div>

        <div className="flex items-center mt-2 justify-between">
          <span className="whitespace-pre-wrap">
            {intl.formatMessage({
              id: 'pool_fee_cross_swap',
              defaultMessage: 'Pool/Cross-chain fee',
            })}
          </span>

          <span>{poolFeeDisplay}</span>
        </div>

        <div className="flex items-center mt-2   justify-between">
          <span className="whitespace-pre-wrap">
            {intl.formatMessage({ id: 'minimum_received' })}
          </span>

          <span className="">
            {Number(minAmount) < 0.001
              ? '< 0.001'
              : toPrecision(minAmount || '0', 6)}
          </span>
        </div>
      </div>
    );
  };

  const [isRevert, setIsRevert] = useState<boolean>(true);

  const [showAllResult, setShowAllResult] = useState<boolean>(false);

  useEffect(() => {
    if (showAllResult)
      document.addEventListener('click', () => {
        setShowAllResult(false);
      });
  }, [showAllResult]);

  const receives = results?.map((result) => {
    if (
      result?.every((r) => r.pool?.Dex === 'tri') ||
      (result?.every((r) => r.pool?.Dex === 'ref' || !r?.pool) &&
        result.length === 1)
    ) {
      return result[0].estimate;
    } else {
      return getExpectedOutputFromActionsORIG(result, tokenOut.id).toString();
    }
  });
  const bestReceived = _.maxBy(receives || ['0'], (o) => Number(o));

  const selectIsTri =
    selectTodos?.[0]?.pool !== null && selectTodos?.[0]?.pool?.Dex === 'tri';

  const OneResult = ({
    Type,
    rate,
    Diff,
    rawRate,
    rateTitle,
    index,
    receive,
    result,
  }: {
    Type: JSX.Element;
    rate: string;
    rawRate: string;
    Diff: JSX.Element | string;
    rateTitle?: string;
    index: number;
    receive: string;
    result: EstimateSwapView[];
  }) => {
    const [hover, setHover] = useState(false);

    const handleHover = (isHover: boolean) => {
      if (isMobile) return;
      setHover(isHover);
    };

    const isTri =
      result?.[0]?.pool !== null && result?.[0]?.pool?.Dex === 'tri';

    return (
      <div
        className={`w-full   whitespace-nowrap xs:text-xs hover:bg-black cursor-pointer mb-2 hover:bg-opacity-10 grid items-center grid-cols-10 px-4 xs:px-2 justify-between py-2.5 relative ${
          selectReceive === receive
            ? 'border border-gradientFrom rounded-md'
            : 'border border-transparent'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          setSelectTodos(result);
          setSelectReceive(receive);

          setShowAllResult(false);
        }}
        onMouseEnter={() => {
          handleHover(true);
        }}
        onMouseLeave={() => {
          handleHover(false);
        }}
      >
        <span className="col-span-1">{Type}</span>

        <span className="col-span-4  relative left-8 xs:left-5">{rawRate}</span>

        <div
          className="justify-self-center xs:justify-self-end  xs:right-10 col-span-4 relative px-4 xs:px-2 "
          title={rateTitle}
        >
          {(Number(rate) < 0.001 ? '< ' : '') + toPrecision(rate, 3)}
        </div>

        <span className=" text-right relative right-3 justify-self-end col-span-1">
          {Diff}
        </span>
        {hover && (
          <SelectPopOver
            curSwapTodos={result}
            fee={isTri ? feeTri : feeRef}
            minAmount={rate}
            priceImpact={isTri ? priceImpactTri : priceImpactRef}
            receive={receive}
          />
        )}
      </div>
    );
  };

  const priceImpactDisplayWarning = useMemo(() => {
    try {
      if (
        (!selectIsTri ? !priceImpactTri : !priceImpactRef) ||
        !tokenIn ||
        !tokenInAmount
      )
        return null;

      return GetPriceImpactWarning(
        selectIsTri ? priceImpactTri : priceImpactRef,
        tokenIn,
        tokenInAmount
      );
    } catch (error) {
      return null;
    }
  }, [selectReceive, priceImpactTri, priceImpactRef, selectIsTri]);

  const diffs = receives.map((r) => {
    if (r === bestReceived) {
      return '0';
    }
    return percent(
      new Big(bestReceived).minus(new Big(r)).toString(),
      bestReceived
    ).toString();
  });

  const Icons = [
    <div className="relative mr-2">
      <RefIconLarge />
      <div className="absolute xs:-right-4 -right-1">
        <NEARICONDEX />
      </div>
    </div>,
    <div className="relative mr-2">
      <TriIconLarge />
      <div className="absolute xs:-right-4 -right-1">
        <AURORAICONDEX />
      </div>
    </div>,
  ];

  const SelectRate = () => {
    const from = tokenInAmount;
    let to: string = '0';

    if (!selectTodos) return null;

    if (
      selectTodos?.every((r) => r.pool?.Dex === 'tri') ||
      (selectTodos?.every((r) => r.pool?.Dex === 'ref' || !r?.pool) &&
        selectTodos.length === 1)
    ) {
      to = selectTodos[selectTodos.length - 1].estimate;
    } else {
      to = getExpectedOutputFromActionsORIG(
        selectTodos,
        tokenOut.id
      ).toString();
    }

    const exchangeRateValue = useMemo(() => {
      if (!from || ONLY_ZEROS.test(to)) return '-';
      else {
        const value = calculateExchangeRate(0, to, from);
        return Number(value) < 0.001 ? '< 0.001' : value;
      }
    }, [to]);

    const curPrice = tokenPriceList?.[tokenOut?.id]?.price;

    return (
      <SwapRateDetail
        value={
          <span>
            {`1 ${toRealSymbol(tokenOut?.symbol)} `}{' '}
            {!!curPrice ? (
              <span className="text-primaryText">
                (${toPrecision(curPrice, 2)})
              </span>
            ) : null}{' '}
            ≈ {`${exchangeRateValue} ${toRealSymbol(tokenIn?.symbol)}`}
          </span>
        }
        isRevert={isRevert}
        setIsRevert={setIsRevert}
        from={from}
        to={to}
        tokenPriceList={tokenPriceList}
        tokenIn={tokenIn}
        tokenOut={tokenOut}
      />
    );
  };
  const displayResults = results
    .map((result, i) => {
      const calRawRate = new Big(receives[i] || '0').div(
        ONLY_ZEROS.test(tokenInAmount) ? '1' : tokenInAmount
      );

      return {
        type: Icons[result?.[0]?.pool?.Dex === 'tri' ? 1 : 0],
        rate: percentLess(slippageTolerance, receives[i]),
        receive: receives[i],
        result,
        rawRate:
          Number(calRawRate) < 0.001
            ? '< 0.001'
            : toPrecision(scientificNotationToString(calRawRate.toString()), 3),
        diff: diffs[i],
        rateTitle: toPrecision(
          percentLess(slippageTolerance, receives[i]),
          tokenOut?.decimals || 24
        ),
      };
    })
    .filter((_) => !!_)
    .sort((a, b) => {
      if (new Big(a.rate).gt(new Big(b.rate))) return -1;
      return 1;
    });

  useEffect(() => {
    if (!results || results.length === 0 || !bestReceived || !receives)
      return null;

    const selectTodosBest = results.find((r, i) => {
      return receives[i] === bestReceived;
    });

    const validator = results.every((todos) => {
      return todos?.[todos?.length - 1].outputToken === tokenOut?.id;
    });

    if (!validator) return null;

    setSelectTodos(selectTodosBest || null);
    setSelectReceive(bestReceived || null);
  }, [bestReceived, supportLedger]);

  if (!results || results.length === 0 || !selectTodos) return null;

  return (
    <section className={`w-full xs:z-30 relative my-4 mt-6`}>
      <div
        className={`z-50  justify-between rounded-lg xs:rounded-xl text-sm text-white mx-auto relative bottom-1 flex items-center  bg-cardBg  ${
          showAllResult
            ? isMobile
              ? 'gradientBorderWrapperNoShadow'
              : ''
            : 'xs:border xs:border-primaryText'
        }  `}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{
          border: isMobile ? '' : `1.2px solid #304352`,
          padding: isMobile && showAllResult ? '0.1px' : '',
        }}
        onMouseEnter={() => {
          handleHoverOptimal(true);
        }}
        onMouseLeave={() => {
          handleHoverOptimal(false);
        }}
      >
        <div className="flex items-center w-full justify-between pt-3 pb-1 px-4 xs:py-3 rounded-lg ">
          {selectReceive === displayResults[0].receive && (
            <div className="absolute text-xs left-4 -top-3 bg-gradientFrom rounded-md px-2 py-0.5 text-black">
              <FormattedMessage id="optimal" defaultMessage={'Optimal'} />
            </div>
          )}
          {!isMobile &&
            hoverOptimal &&
            selectTodos &&
            selectTodos.length > 0 &&
            selectTodos[selectTodos.length - 1].outputToken ===
              tokenOut?.id && (
              <SelectPopOver
                curSwapTodos={selectTodos}
                fee={selectIsTri ? feeTri : feeRef}
                minAmount={
                  selectReceive
                    ? percentLess(slippageTolerance, selectReceive)
                    : '0'
                }
                priceImpact={selectIsTri ? priceImpactTri : priceImpactRef}
                receive={selectReceive}
              />
            )}

          <div className="items-center flex bg-transparent">
            {LoadingRefresh}

            <SelectRate />
          </div>

          <span
            className={`flex items-center cursor-pointer justify-center ${
              !showAllResult ? 'text-primaryText' : ''
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAllResult(!showAllResult);
            }}
          >
            <span className={` xs:hidden  my-2`}>
              {showAllResult ? (
                <FormattedMessage
                  id="hide_routes"
                  defaultMessage="Hide Routes"
                />
              ) : (
                <FormattedMessage
                  id="show_routes"
                  defaultMessage="Show Routes"
                />
              )}
            </span>
            <span className="ml-1">
              {showAllResult ? (
                <FaAngleUp size={18} />
              ) : (
                <FaAngleDown size={18} />
              )}
            </span>
          </span>
        </div>
      </div>

      <Card
        padding="pt-4 xs:pt-2"
        className={
          showAllResult
            ? ' text-sm xs:text-xs text-white absolute xs:relative  top-14 xs:top-0 xs:mt-2'
            : 'hidden'
        }
        style={{
          border: `1.2px solid #304352`,
          zIndex: 40,
          background: '#2E3D47',
        }}
        width="w-full"
        rounded="rounded-lg xs:rounded-xl"
      >
        <div className="text-primaryText px-4 xs:px-2 grid grid-cols-10 mb-2">
          <span className="col-span-1 ">
            <FormattedMessage id="dex" defaultMessage="DEX" />
          </span>

          <span className="col-span-4 relative left-6 xs:left-4">
            {`${toRealSymbol(tokenOut?.symbol)}/${toRealSymbol(
              tokenIn?.symbol
            )} `}
          </span>
          <span className="col-span-4 xs:justify-self-center relative right-6 xs:right-4 justify-self-end">
            {
              <FormattedMessage
                id="minimum_received_dot"
                defaultMessage="Min. Received"
              />
            }
          </span>
          <span className="relative right-2 xs:right-4 whitespace-nowrap text-right  col-span-1">
            <FormattedMessage id="diff" defaultMessage="Diff" />
          </span>
        </div>
        {displayResults?.map((result, i) => {
          return (
            <OneResult
              key={i + result.rate}
              index={i}
              Type={result.type}
              rate={toPrecision(result.rate, 6)}
              rateTitle={result.rateTitle}
              rawRate={result.rawRate}
              receive={result.receive}
              result={result.result}
              Diff={
                Number(result.diff) === 0 ? (
                  <BestIcon />
                ) : (
                  `-${toPrecision(result.diff, 2)}%`
                )
              }
            />
          );
        })}
      </Card>
      {isMobile && !showAllResult && (
        <SelectPopOver
          curSwapTodos={selectTodos}
          fee={selectIsTri ? feeTri : feeRef}
          minAmount={
            selectReceive ? percentLess(slippageTolerance, selectReceive) : '0'
          }
          priceImpact={selectIsTri ? priceImpactTri : priceImpactRef}
          receive={selectReceive}
        />
      )}

      {Number(selectIsTri ? priceImpactTri : priceImpactRef) > 2 &&
      priceImpactDisplayWarning ? (
        <div className="flex items-center xs:flex-col justify-between border border-warnRedColor bg-lightReBgColor rounded-xl p-3 mt-4 text-sm text-redwarningColor">
          <span>
            <FormattedMessage id="price_impact_warning"></FormattedMessage>
          </span>
          <div className="flex items-center">
            <span className="">{priceImpactDisplayWarning}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
};

const PolygonArrow = ({ color }: { color?: string }) => {
  return (
    <svg
      width="6"
      height="10"
      viewBox="0 0 6 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 5L-4.07833e-07 9.33013L-2.92811e-08 0.669872L6 5Z"
        fill={color || '#00FFD1'}
      />
    </svg>
  );
};

export const TradeRouteHub = ({
  token,
  contract,
  poolId,
}: {
  token: TokenMetadata;
  contract: SwapContractType;
  poolId?: string | number;
}) => {
  const contractToMarket = (): SwapMarket => {
    if (contract.toLowerCase().includes('ref')) return 'ref';
    if (contract.toLowerCase().includes('orderly')) return 'orderly';
    if (contract.toLowerCase().includes('trisolaris')) return 'tri';
  };
  return (
    <div
      className="flex flex-col justify-center  relative z-10 text-primaryText text-xs rounded-md px-2.5 py-1 border border-swapCardBorder bg-swapCardGradient"
      style={{
        height: '60px',
      }}
    >
      <div className="border-b pb-1 frcs border-primaryText border-opacity-30">
        <DisplayIcon token={token} height="14px" width="14px" />
        <span className="block ml-1 text-white text-xs w-28 truncate">
          {toRealSymbol(token.symbol)}
        </span>
      </div>

      <div className="w-full frcs pt-1 relative top-0.5 rounded-md">
        <div
          style={{
            height: '13px',
            width: '13px',
          }}
          className="frcc"
        >
          {getDexIcon(contractToMarket())}
        </div>

        <span className="ml-1 mr-1">{contract}</span>
        <span
          className={`cursor-pointer block mr-1.5 ${
            configV2.BLACK_LIST_DCL_POOL_IDS_IN_POOLS.includes(
              poolId?.toString()
            )
              ? 'hidden'
              : ''
          }`}
          onClick={() => {
            if (typeof poolId === 'undefined' || poolId === null) return;

            openUrl(
              typeof poolId === 'number'
                ? `/pool/${poolId}`
                : `/poolV2/${get_pool_name(poolId)}`
            );
          }}
        >
          {!(typeof poolId === 'undefined' || poolId === null) && (
            <HiOutlineExternalLink className="hover:text-white"></HiOutlineExternalLink>
          )}
        </span>

        <span>100%</span>
      </div>
    </div>
  );
};

export const RightBracket = ({ size }: { size: number }) => {
  return (
    <div
      className="w-4 mr-3 opacity-30 rounded-full relative z-10 border border-primaryText "
      style={{
        height: `${size * 60}px`,
        clipPath: `polygon(50% 0, 100% 0,100% 100%, 50%  100%)`,
      }}
    ></div>
  );
};

export const LeftBracket = ({ size }: { size: number }) => {
  return (
    <div
      className="w-4 ml-3 opacity-30 rounded-full relative z-10 border border-primaryText  transform rotate-180"
      style={{
        height: `${size * 60}px`,
        clipPath: `polygon(50% 0, 100% 0,100% 100%, 50%  100%)`,
      }}
    ></div>
  );
};

export const TradeRoute = ({
  trade,
  tokenIn,
  tokenOut,
}: {
  trade: ExchangeEstimate;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) => {
  const [estimatesServerUI, setEstimatesServerUI] =
    useState<IEstimateSwapServerView>();
  const { estimates, estimatesServer } = trade || {};
  const identicalRoutes = estimates
    ? separateRoutes(estimates, estimates[estimates.length - 1].outputToken)
    : [];

  const pools = identicalRoutes.map((r) => r[0]).map((hub) => hub.pool);
  useEffect(() => {
    if (estimatesServer) {
      getTokensDataOfEstimatesServer();
    } else {
      setEstimatesServerUI(undefined);
    }
  }, [JSON.stringify(estimatesServer || {})]);
  async function getTokensDataOfEstimatesServer() {
    const pending = estimatesServer.routes.map((route) =>
      getTokensOfRoute(route)
    );
    const tokens_of_routes = await Promise.all(pending);
    estimatesServer.routes.map((route, index) => {
      route.tokens = tokens_of_routes[index];
    });
    setEstimatesServerUI(estimatesServer);
  }
  const percents = useMemo(() => {
    try {
      return getPoolAllocationPercents(pools);
    } catch (error) {
      if (identicalRoutes.length === 0) return ['100'];
      else return identicalRoutes.map((r) => r[0].percent);
    }
  }, [identicalRoutes, pools]);
  const percentsServer = useMemo(() => {
    const routes = estimatesServer?.routes || [];
    try {
      return getRouteAllocationPercents(routes);
    } catch (error) {
      return ['100'];
    }
  }, [(estimatesServer?.routes || []).length]);
  if (!tokenIn || !tokenOut) return null;

  if (!trade || !trade?.availableRoute || tokenIn?.id === tokenOut?.id) {
    return (
      <div className="frcb relative">
        <DisplayIcon token={tokenIn} height="26px" width="26px" />
        <div className="w-full frcc mx-2 relative">
          <div
            className="border border-dashed absolute left-5 opacity-30 border-primaryText w-full px-3"
            style={{
              width: 'calc(100% - 32px)',
            }}
          ></div>

          <div
            className="relative z-50 text-primaryText text-opacity-30"
            style={{
              background: '#001220',
            }}
          >
            {'/  /'}
          </div>
        </div>
        <div className="absolute right-8">
          <PolygonArrow color="#303E48" />
        </div>

        <DisplayIcon token={tokenOut} height="26px" width="26px" />
      </div>
    );
  }
  const routeLength =
    identicalRoutes.length || trade.estimatesServer?.routes?.length;
  return (
    <div className="frcb">
      <DisplayIcon token={tokenIn} height="26px" width="26px" />
      <LeftBracket size={routeLength} />
      {/* from script routes */}
      {trade.estimates ? (
        <div className={`w-full  mx-2 xsm:overflow-x-auto hideScroll relative`}>
          {identicalRoutes.map((route, j) => {
            return (
              <div
                key={j}
                className="relative frcb my-3 "
                style={{
                  width: isMobile() ? '460px' : '',
                }}
              >
                <span className="text-xs text-senderHot">{percents[j]}%</span>
                <div
                  className="border border-dashed absolute left-5 opacity-30 border-primaryText w-full px-3"
                  style={{
                    width: 'calc(100% - 32px)',
                  }}
                ></div>
                <div className="frcs">
                  {route[0].tokens
                    .slice(1, route[0].tokens.length)
                    .map((t, i) => {
                      return (
                        <>
                          <TradeRouteHub
                            poolId={
                              route[i].contract === 'Ref_DCL'
                                ? getV3PoolId(
                                    tokenIn.id,
                                    tokenOut.id,
                                    trade.fee * 100
                                  )
                                : route[i].contract === 'Ref_Classic'
                                ? Number(route[i].pool.id)
                                : null
                            }
                            token={t}
                            contract={route[i].contract}
                          />
                          {t.id !==
                            route[0].tokens[route[0].tokens.length - 1]?.id && (
                            <div className="mx-3">
                              <PolygonArrow />
                            </div>
                          )}
                        </>
                      );
                    })}
                </div>

                <PolygonArrow />
              </div>
            );
          })}
        </div>
      ) : null}

      {/* from server routes */}
      {estimatesServerUI ? (
        <div className={`w-full  mx-2 xsm:overflow-x-auto hideScroll relative`}>
          {estimatesServerUI.routes.map((route, j) => {
            const { pools, tokens } = route;
            return (
              <div
                key={j}
                className="relative frcb my-3 "
                style={{
                  width: isMobile() ? '620px' : '',
                }}
              >
                <span className="text-xs text-senderHot">
                  {percentsServer[j]}%
                </span>
                <div
                  className="border border-dashed absolute left-5 opacity-30 border-primaryText w-full px-3"
                  style={{
                    width: 'calc(100% - 32px)',
                  }}
                ></div>
                <div className="frcs">
                  {tokens?.slice(1, tokens.length).map((t, i) => {
                    return (
                      <>
                        <TradeRouteHub
                          poolId={Number(pools[i].pool_id)}
                          token={t}
                          contract="Ref_Classic"
                        />
                        {t.id !== tokens[tokens.length - 1]?.id && (
                          <div className="mx-3">
                            <PolygonArrow />
                          </div>
                        )}
                      </>
                    );
                  })}
                </div>

                <PolygonArrow />
              </div>
            );
          })}
        </div>
      ) : null}

      <RightBracket size={routeLength} />

      <DisplayIcon token={tokenOut} height="26px" width="26px" />
    </div>
  );
};

export const TradeRouteModal = (
  props: Modal.Props & {
    trade: ExchangeEstimate;
  }
) => {
  return (
    <ModalWrapper
      title={
        <FormattedMessage
          id="your_trade_route_capital"
          defaultMessage={`Your Trade Route`}
        />
      }
      {...props}
      customWidth={isMobile() ? '95vw' : '800px'}
    >
      <div className="w-full mt-7">
        <TradeRoute
          trade={props.trade}
          tokenIn={props.trade.tokenIn}
          tokenOut={props.trade.tokenOut}
        />
      </div>
    </ModalWrapper>
  );
};

export const MarketList = ({
  trade,
  allTrades,
  selectMarket,
  tokenIn,
  tokenOut,
}: {
  trade: ExchangeEstimate;
  allTrades: TradeEstimates;
  selectMarket: SwapMarket;
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}) => {
  const { setSelectMarket } = useContext(SwapProContext);

  const sortedTradesList = Object.values(allTrades)
    .filter((t) => !!t.availableRoute)
    .sort((a, b) => {
      return new Big(a.tokenOutAmount || '0').gt(
        new Big(b.tokenOutAmount || '0')
      )
        ? -1
        : 1;
    });

  const bestAmount = sortedTradesList?.[0]?.tokenOutAmount;

  if (!bestAmount || tokenIn?.id === tokenOut?.id)
    return (
      <>
        <div className="pb-4 max-w-max mt-6 flex flex-col">
          <span className="pb-1.5 text-white">
            <FormattedMessage
              id="markets"
              defaultMessage={'Markets'}
            ></FormattedMessage>
          </span>
        </div>
        {!isMobile() && (
          <table
            className="w-full table relative right-3 border-separate"
            style={{
              borderSpacing: 0,
            }}
          >
            <tr
              className="text-primaryText"
              style={{
                fontSize: '13px',
              }}
            >
              <th align="left" className="pb-2 pl-3">
                <FormattedMessage id="exchanges" defaultMessage={'Exchanges'} />
              </th>

              <th align="left">
                {<FormattedMessage id="price" defaultMessage={'Price'} />}
                <span className="ml-1">
                  {`(${toRealSymbol(trade.tokenOut.symbol)}/${toRealSymbol(
                    trade.tokenIn.symbol
                  )})`}
                </span>
              </th>

              <th align="left">
                <FormattedMessage
                  id="output_est"
                  defaultMessage={'Output (est.)'}
                />
              </th>

              <th align="left">
                <FormattedMessage id="diff" defaultMessage={'Diff'} />
              </th>

              <th align="left"></th>
            </tr>
          </table>
        )}

        <div
          className="text-center mt-10 text-sm"
          style={{
            color: '#566069',
          }}
        >
          <FormattedMessage
            id="no_trade_routes"
            defaultMessage={'No trade routes.'}
          />
        </div>
      </>
    );

  const displayList = sortedTradesList.map((t) => {
    const rawRate = scientificNotationToString(
      new Big(t.tokenOutAmount || '0')
        .div(ONLY_ZEROS.test(t.tokenInAmount || '0') ? '1' : t.tokenInAmount)
        .toString()
    );
    return {
      ...t,
      marketIcon: getDexIcon(t.market),
      diff:
        t.tokenOutAmount === bestAmount
          ? 'best'
          : new Big(t.tokenOutAmount || '0')
              .div(bestAmount || '1')
              .minus(1)
              .times(100)
              .toFixed(2),
      rate: numberWithCommas(displayNumberToAppropriateDecimals(rawRate)),
      selected: selectMarket === t.market,
      output: numberWithCommas(
        displayNumberToAppropriateDecimals(t.tokenOutAmount)
      ),
      action: getDexAction(t.market),
    };
  });

  return (
    <>
      <div className="pb-4 max-w-max mt-6 flex flex-col">
        <span className="pb-1.5 text-white">
          <FormattedMessage
            id="markets"
            defaultMessage={'Markets'}
          ></FormattedMessage>
        </span>

        <div
          className="w-full xsm:hidden rounded-md bg-senderHot"
          style={{
            height: '3px',
          }}
        ></div>
      </div>

      {!isMobile() && (
        <table
          className="w-full table relative right-3 border-separate"
          style={{
            borderSpacing: 0,
          }}
        >
          <tr
            className="text-primaryText"
            style={{
              fontSize: '13px',
            }}
          >
            <th align="left" className="pb-2 pl-3">
              <FormattedMessage id="exchanges" defaultMessage={'Exchanges'} />
            </th>

            <th align="left">
              {<FormattedMessage id="price" defaultMessage={'Price'} />}
              <span className="ml-1">
                {`(${toRealSymbol(trade.tokenOut.symbol)}/${toRealSymbol(
                  trade.tokenIn.symbol
                )})`}
              </span>
            </th>

            <th align="left">
              <FormattedMessage
                id="output_est"
                defaultMessage={'Output (est.)'}
              />
            </th>

            <th align="left">
              <FormattedMessage id="diff" defaultMessage={'Diff'} />
            </th>

            <th align="left"></th>
          </tr>
          {displayList.map((t) => {
            return (
              <>
                <tr
                  className={`text-white rounded-xl text-sm p-2 
              hover:bg-inputV3BorderColor hover:bg-opacity-40
              ${t.selected ? 'bg-inputV3BorderColor bg-opacity-40' : ''}
            
            `}
                  onClick={() => {
                    setSelectMarket(t.market);
                  }}
                >
                  <td className="rounded-l-xl">
                    <div className="frcs pl-3">
                      <div
                        className="frcc "
                        style={{
                          height: '25px',
                          width: '25px',
                        }}
                      >
                        {t.marketIcon}
                      </div>

                      <div className="ml-2 frcc">{t?.exchange_name}</div>
                    </div>
                  </td>

                  <td>{t.rate}</td>

                  <td>{t.output}</td>

                  <td>
                    {t.diff === 'best' ? (
                      <span className="text-black text-xs my-2 max-w-max rounded-2xl bg-senderHot px-2.5 py-0.5 frcc ">
                        <FormattedMessage
                          id="best"
                          defaultMessage={'Best'}
                        ></FormattedMessage>
                      </span>
                    ) : (
                      <span className="bg-sellRed my-2  text-xs max-w-max bg-opacity-10 text-sellRed rounded-2xl px-2.5 py-0.5 frcc">
                        {t.diff}%
                      </span>
                    )}
                  </td>

                  <td className="rounded-r-xl">
                    <div
                      className="w-4  h-4 rounded-full  frcc"
                      style={{
                        border: '1px solid #223846',
                      }}
                    >
                      {t.selected && (
                        <div
                          className="rounded-full bg-senderHot"
                          style={{
                            height: '9px',
                            width: '9px',
                          }}
                        ></div>
                      )}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td>
                    <div className="my-1"></div>
                  </td>
                </tr>
              </>
            );
          })}
        </table>
      )}

      {isMobile() &&
        displayList.map((t, i) => {
          return (
            <div
              className={`${
                t.selected ? 'border border-gradientFromHover' : ''
              } bg-menuMoreBgColor rounded-xl
            
              p-2.5 mb-3
            `}
              onClick={() => {
                setSelectMarket(t.market);
              }}
            >
              <div className="frcb ">
                <div className="frcs">
                  <div
                    className="frcc "
                    style={{
                      height: '25px',
                      width: '25px',
                    }}
                  >
                    {t.marketIcon}
                  </div>

                  <div className="mx-2 frcc">{t?.exchange_name}</div>

                  <div>
                    {t.diff === 'best' ? (
                      <span className="text-black text-xs my-2 max-w-max rounded-2xl bg-senderHot px-2.5 py-0.5 frcc ">
                        <FormattedMessage
                          id="best"
                          defaultMessage={'Best'}
                        ></FormattedMessage>
                      </span>
                    ) : (
                      <span className="bg-sellRed my-2  text-xs max-w-max bg-opacity-10 text-sellRed rounded-2xl px-2.5 py-0.5 frcc">
                        {t.diff}%
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="w-4  h-4 rounded-full  frcc"
                  style={{
                    border: '1px solid #223846',
                  }}
                >
                  {t.selected && (
                    <div
                      className="rounded-full bg-senderHot"
                      style={{
                        height: '9px',
                        width: '9px',
                      }}
                    ></div>
                  )}
                </div>
              </div>

              <div className="frcb py-3 text-13px">
                <div className=" text-primaryText">
                  {<FormattedMessage id="price" defaultMessage={'Price'} />}
                  <span className="ml-1">
                    {`(${toRealSymbol(trade.tokenOut.symbol)}/${toRealSymbol(
                      trade.tokenIn.symbol
                    )})`}
                  </span>
                </div>

                <div className="text-white">{t.rate}</div>
              </div>

              <div className="frcb text-13px">
                <div className=" text-primaryText">
                  <FormattedMessage
                    id="output_est"
                    defaultMessage={'Output (est.)'}
                  />
                </div>

                <div className="text-white">{t.output}</div>
              </div>
            </div>
          );
        })}
    </>
  );
};
