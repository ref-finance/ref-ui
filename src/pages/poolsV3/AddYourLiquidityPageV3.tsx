import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  ReturnIcon,
  AddIcon,
  SelectIcon,
  BgIcon,
  SwitchButton,
  AddButton,
  ReduceButton,
  SwitchIcon,
  BoxDarkBg,
  SideIcon,
  InvalidIcon,
  WarningIcon,
  EmptyIcon,
  WarningMark,
  SwitchLRButton,
  SwitchArrowL,
  SwitchArrowR,
} from '~components/icon/V3';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import {
  GradientButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '~components/button/Button';
import SelectToken from '~components/forms/SelectToken';
import { useTriTokens, useWhitelistTokens } from '../../state/token';
import { useTriTokenIdsOnRef } from '../../services/aurora/aurora';
import {
  TokenMetadata,
  ftGetBalance,
  ftGetTokenMetadata,
} from '../../services/ft-contract';
import { getTokenPriceList } from '../../services/indexer';
import { getBoostTokenPrices } from '../../services/farm';
import { useTokenBalances, useDepositableBalance } from '../../state/token';
import Loading from '~components/layout/Loading';
import {
  list_pools,
  add_liquidity,
  create_pool,
  PoolInfo,
  get_pool_marketdepth,
} from '../../services/swapV3';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import {
  getPriceByPoint,
  getPointByPrice,
  CONSTANT_D,
  FEELIST,
  POINTDELTAMAP,
  DEFAULTSELECTEDFEE,
  POINTLEFTRANGE,
  POINTRIGHTRANGE,
  useAddAndRemoveUrlHandle,
  drawChartData,
} from '../../services/commonV3';
import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  checkAllocations,
  scientificNotationToString,
  getAllocationsLeastOne,
  toInternationalCurrencySystem,
} from '~utils/numbers';
import { WalletContext } from '../../utils/wallets-integration';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import { toRealSymbol } from '../../utils/token';
import ReactTooltip from 'react-tooltip';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { BlueCircleLoading } from '../../components/layout/Loading';
import { isMobile } from '../../utils/device';

import Big from 'big.js';

export default function AddYourLiquidityPageV3() {
  const [tokenX, setTokenX] = useState<TokenMetadata>(null);
  const [tokenY, setTokenY] = useState<TokenMetadata>(null);
  const [tokenXAmount, setTokenXAmount] = useState('');
  const [tokenYAmount, setTokenYAmount] = useState('');
  const [listPool, setListPool] = useState<PoolInfo[]>([]);
  const [buttonHover, setButtonHover] = useState<boolean>(false);
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const [currentPools, setCurrentPools] =
    useState<Record<string, PoolInfo>>(null);
  const [onlyAddYToken, setOnlyAddYToken] = useState(false); // real
  const [onlyAddXToken, setOnlyAddXToken] = useState(false); // real
  const [invalidRange, setInvalidRange] = useState(false); // real
  const [tokenXBalanceFromNear, setTokenXBalanceFromNear] = useState<string>();
  const [tokenYBalanceFromNear, setTokenYBalanceFromNear] = useState<string>();
  const [leftPoint, setLeftPoint] = useState<number>(0); // real
  const [rightPoint, setRightPoint] = useState<number>(0); // real
  const [currentPoint, setCurrentPoint] = useState<number>(); // real
  const [currentSelectedPool, setCurrentSelectedPool] =
    useState<PoolInfo>(null); // real
  const [feeBoxStatus, setFeeBoxStatus] = useState(true);
  const [buttonSort, setButtonSort] = useState(false);
  // callBack handle
  useAddAndRemoveUrlHandle();
  const history = useHistory();
  const triTokenIds = useTriTokenIdsOnRef();
  const refTokens = useWhitelistTokens((triTokenIds || []).concat(['aurora']));
  const triTokens = useTriTokens();
  const balances = useTokenBalances();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const nearBalance = useDepositableBalance('NEAR');
  const intl = useIntl();
  const intl_select = intl.formatMessage({ id: 'select_s' });
  const OPEN_CREATE_POOL_ENTRY = true;
  useEffect(() => {
    getBoostTokenPrices().then(setTokenPriceList);
    get_list_pools();
  }, []);
  useEffect(() => {
    if (tokenX) {
      const tokenXId = tokenX.id;
      if (tokenXId) {
        if (isSignedIn) {
          ftGetBalance(tokenXId).then((available: string) =>
            setTokenXBalanceFromNear(
              toReadableNumber(
                tokenX.decimals,
                tokenX.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : available
              )
            )
          );
        }
      }
    }
    if (tokenY) {
      const tokenYId = tokenY.id;
      if (tokenYId) {
        if (isSignedIn) {
          ftGetBalance(tokenYId).then((available: string) =>
            setTokenYBalanceFromNear(
              toReadableNumber(
                tokenY.decimals,
                tokenY.id === WRAP_NEAR_CONTRACT_ID ? nearBalance : available
              )
            )
          );
        }
      }
    }
  }, [tokenX, tokenY, isSignedIn, nearBalance]);
  useEffect(() => {
    if (listPool.length > 0) {
      get_init_pool();
    }
  }, [listPool]);
  useEffect(() => {
    if (currentSelectedPool && tokenX && tokenY) {
      const { fee } = currentSelectedPool;
      history.replace(`#${tokenX.id}|${tokenY.id}|${fee}`);
    }
  }, [currentSelectedPool, tokenX, tokenY]);
  useEffect(() => {
    if (tokenX && tokenY) {
      searchPools();
    }
  }, [tokenX, tokenY, tokenPriceList, listPool]);
  if (!refTokens || !triTokens || !triTokenIds) return <Loading />;
  const allTokens = getAllTokens(refTokens, triTokens);
  const nearSwapTokens = allTokens.filter((token) => token.onRef);
  async function get_init_pool() {
    const hash = location.hash;
    const [tokenx_id, tokeny_id, pool_fee] = decodeURIComponent(
      hash.slice(1)
    ).split('|');
    if (tokenx_id && tokeny_id && pool_fee) {
      const tokenx = await ftGetTokenMetadata(tokenx_id);
      const tokeny = await ftGetTokenMetadata(tokeny_id);
      setTokenX(tokenx);
      setTokenY(tokeny);
    }
  }
  function goYourLiquidityPage() {
    history.push('/yourliquidity');
  }
  async function get_list_pools() {
    const list: PoolInfo[] = await list_pools();
    if (list.length > 0) {
      setListPool(list);
    }
  }
  function searchPools() {
    const hash = location.hash;
    const url_fee = +decodeURIComponent(hash.slice(1)).split('|')[2];
    const currentPoolsMap = {};
    if (listPool.length > 0 && tokenX && tokenY) {
      const availablePools: PoolInfo[] = listPool.filter((pool: PoolInfo) => {
        // TODO 增加pool 状态的判断
        const { token_x, token_y, state } = pool;
        if (
          (token_x == tokenX.id && token_y == tokenY.id) ||
          (token_x == tokenY.id && token_y == tokenX.id)
        )
          return true;
      });
      if (availablePools.length > 0) {
        /*** percent start */
        const tvlList: number[] = [];
        availablePools.map((p: PoolInfo) => {
          const { total_x, total_y, token_x, token_y } = p;
          const firstToken = tokenX.id == token_x ? tokenX : tokenY;
          const secondToken = tokenY.id == token_y ? tokenY : tokenX;
          const firstTokenPrice =
            (tokenPriceList &&
              tokenPriceList[firstToken.id] &&
              tokenPriceList[firstToken.id].price) ||
            '0';
          const secondTokenPrice =
            (tokenPriceList &&
              tokenPriceList[secondToken.id] &&
              tokenPriceList[secondToken.id].price) ||
            '0';
          const tvlx = new Big(toReadableNumber(firstToken.decimals, total_x))
            .times(firstTokenPrice)
            .toNumber();
          const tvly = new Big(toReadableNumber(secondToken.decimals, total_y))
            .times(secondTokenPrice)
            .toNumber();
          const totalTvl = tvlx + tvly;
          p.tvl = totalTvl;
          tvlList.push(totalTvl);
          return p;
        });
        const sumOfTvlList = _.sum(tvlList);
        const tvlPercents =
          sumOfTvlList === 0
            ? ['0', '0', '0', '0']
            : availablePools.map((p: PoolInfo) =>
                scientificNotationToString(
                  ((p.tvl / sumOfTvlList) * 100).toString()
                )
              );
        const nonZeroIndexes: number[] = [];
        tvlPercents.forEach((p, index) => {
          if (Number(p) > 0) {
            nonZeroIndexes.push(index);
          }
        });
        const nonZeroPercents = tvlPercents.filter((r) => Number(r) > 0);
        const checkedNonZero = getAllocationsLeastOne(nonZeroPercents);
        const finalPercents = tvlPercents.map((p, index) => {
          if (nonZeroIndexes.includes(index)) {
            const newP = checkedNonZero[nonZeroIndexes.indexOf(index)];
            return newP;
          }
          return p;
        });
        const maxPercent = _.max(finalPercents);
        let maxPercentPool;
        availablePools.forEach((pool: PoolInfo, index) => {
          const f = pool.fee;
          const temp: PoolInfo = {
            ...pool,
            percent: finalPercents[index],
            tvl: tvlList[index],
          };
          currentPoolsMap[f] = temp;
          if (finalPercents[index] == maxPercent) {
            maxPercentPool = temp;
          }
        });
        // url-fee-pool
        const urlFeePool = url_fee
          ? currentPoolsMap[url_fee] || { fee: url_fee }
          : null;
        setCurrentPools(currentPoolsMap);
        setCurrentSelectedPool(urlFeePool || maxPercentPool);
      } else {
        setCurrentPools({});
        setCurrentSelectedPool({ fee: url_fee || DEFAULTSELECTEDFEE });
      }
    } else {
      setCurrentPools({});
      if (tokenX && tokenY) {
        setCurrentSelectedPool({ fee: url_fee || DEFAULTSELECTEDFEE });
      }
    }
  }
  function switchSelectedFee(fee: number) {
    if (tokenX && tokenY && currentPools) {
      const pool = currentPools[fee];
      setCurrentSelectedPool(pool || { fee });
      if (!pool) {
        setOnlyAddXToken(false);
        setOnlyAddYToken(false);
        setInvalidRange(false);
      }
    }
  }
  function changeTokenXAmount(amount: string = '0') {
    const { token_x, token_y } = currentSelectedPool;
    const sort = tokenX.id == token_x;
    setTokenXAmount(amount);
    if (sort) {
      if (!onlyAddXToken) {
        const amount_result = getTokenYAmountByCondition({
          amount,
          leftPoint: leftPoint,
          rightPoint: rightPoint,
          currentPoint: currentPoint,
        });
        setTokenYAmount(amount_result);
      }
    } else {
      if (!onlyAddYToken) {
        const amount_result = getTokenXAmountByCondition({
          amount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenYAmount(amount_result);
      }
    }
  }
  function changeTokenYAmount(amount: string = '0') {
    const { token_x, token_y } = currentSelectedPool;
    const sort = tokenX.id == token_x;
    setTokenYAmount(amount);
    if (sort) {
      if (!onlyAddYToken) {
        const amount_result = getTokenXAmountByCondition({
          amount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenXAmount(amount_result);
      }
    } else {
      if (!onlyAddXToken) {
        const amount_result = getTokenYAmountByCondition({
          amount,
          leftPoint: leftPoint,
          rightPoint: rightPoint,
          currentPoint: currentPoint,
        });
        setTokenXAmount(amount_result);
      }
    }
  }
  function getTokenYAmountByCondition({
    // real
    amount,
    leftPoint,
    rightPoint,
    currentPoint,
  }: {
    amount: string;
    leftPoint: number;
    rightPoint: number;
    currentPoint: number;
  }) {
    const { token_x, token_y } = currentSelectedPool;
    const token_x_decimals =
      tokenX.id == token_x ? tokenX.decimals : tokenY.decimals;
    const token_y_decimals =
      tokenY.id == token_y ? tokenY.decimals : tokenX.decimals;
    if (+amount == 0) {
      return '';
    } else {
      // X-->L
      const L =
        +amount *
        ((Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1)) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - currentPoint - 1) - 1));
      // L-->current Y
      const Yc = L * Math.pow(Math.sqrt(CONSTANT_D), currentPoint);
      // L--> Y
      const Y =
        L *
        ((Math.pow(Math.sqrt(CONSTANT_D), currentPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
          (Math.sqrt(CONSTANT_D) - 1));
      const decimalsRate =
        Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);

      const Y_result = (Y + Yc) * decimalsRate;
      return Y_result.toString();
    }
  }
  function getTokenXAmountByCondition({
    // real
    amount,
    leftPoint,
    rightPoint,
    currentPoint,
  }: {
    amount: string;
    leftPoint: number;
    rightPoint: number;
    currentPoint: number;
  }) {
    const { token_x, token_y } = currentSelectedPool;
    const token_x_decimals =
      tokenX.id == token_x ? tokenX.decimals : tokenY.decimals;
    const token_y_decimals =
      tokenY.id == token_y ? tokenY.decimals : tokenX.decimals;
    if (+amount == 0) {
      return '';
    } else {
      let L;
      // Yc-->L
      if (leftPoint == currentPoint) {
        L = +amount * (1 / Math.pow(Math.sqrt(CONSTANT_D), currentPoint));
      } else {
        // Y-->L
        L =
          +amount *
          ((Math.sqrt(CONSTANT_D) - 1) /
            (Math.pow(Math.sqrt(CONSTANT_D), currentPoint) -
              Math.pow(Math.sqrt(CONSTANT_D), leftPoint)));
      }
      const X =
        L *
        ((Math.pow(Math.sqrt(CONSTANT_D), rightPoint - currentPoint - 1) - 1) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
            Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1)));
      const decimalsRate =
        Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
      const X_result = X * decimalsRate;
      return X_result.toString();
    }
  }
  function switchFeeBoxStatus() {
    setFeeBoxStatus(!feeBoxStatus);
  }
  function pointChange({
    leftPoint,
    rightPoint,
    currentPoint,
  }: {
    leftPoint: number;
    rightPoint: number;
    currentPoint: number;
  }) {
    const { token_x, token_y } = currentSelectedPool;
    const sort = tokenX.id == token_x;
    setLeftPoint(leftPoint);
    setRightPoint(rightPoint);
    setCurrentPoint(currentPoint);
    setInvalidRange(false);
    setOnlyAddXToken(false);
    setOnlyAddYToken(false);
    // invalid point
    if (leftPoint >= rightPoint) {
      setInvalidRange(true);
      setTokenXAmount('');
      setTokenYAmount('');
      return;
    }
    // can only add x token
    if (leftPoint > currentPoint) {
      setOnlyAddXToken(true);
      if (sort) {
        setTokenYAmount('');
      } else {
        setTokenXAmount('');
      }
      return;
    }
    // can only add y token
    if (rightPoint <= currentPoint || currentPoint == rightPoint - 1) {
      setOnlyAddYToken(true);
      if (sort) {
        setTokenXAmount('');
      } else {
        setTokenYAmount('');
      }
      return;
    }
    if (sort) {
      if (tokenXAmount) {
        const amount_result = getTokenYAmountByCondition({
          amount: tokenXAmount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenYAmount(amount_result);
      } else if (tokenYAmount) {
        const amount_result = getTokenXAmountByCondition({
          amount: tokenYAmount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenXAmount(amount_result);
      }
    } else {
      if (tokenXAmount) {
        const amount_result = getTokenXAmountByCondition({
          amount: tokenXAmount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenYAmount(amount_result);
      } else if (tokenYAmount) {
        const amount_result = getTokenYAmountByCondition({
          amount: tokenYAmount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenXAmount(amount_result);
      }
    }
  }
  function switchButtonSort() {
    if (tokenX || tokenY) {
      setTokenX(tokenY);
      setTokenY(tokenX);
      setTokenXAmount(tokenYAmount);
      setTokenYAmount(tokenXAmount);
      setTokenXBalanceFromNear(tokenYBalanceFromNear);
      setTokenYBalanceFromNear(tokenXBalanceFromNear);
    }
    setButtonSort(!buttonSort);
  }
  function displayTvl(tvl: any) {
    if (!tokenPriceList) {
      return '-';
    } else if (!tvl || +tvl == 0) {
      return '$0';
    } else {
      return `$${toInternationalCurrencySystem(tvl.toString(), 2)}`;
    }
  }
  const tokenSort = tokenX?.id == currentSelectedPool?.token_x;
  const mobileDevice = isMobile();
  return (
    <>
      <div className="m-auto xs:w-full md:w-full xs:px-3 md:px-3 flex items-center mb-5 lg:hidden">
        <div
          className="cursor-pointer flex items-center justify-center w-6 h-6"
          onClick={goYourLiquidityPage}
        >
          <ReturnIcon></ReturnIcon>
        </div>
        <span className="text-white text-sm">
          <FormattedMessage id="add_liquidity"></FormattedMessage>
        </span>
      </div>
      <div className="relative flex flex-col lg:w-4/5 2xl:w-3/5 xs:w-full md:w-full xs:px-3 md:px-3 m-auto text-white rounded-2xl">
        <div
          className="absolute w-full top-0 bottom-0 rounded-2xl"
          style={{
            background:
              'linear-gradient(146.59deg, rgba(0, 255, 209, 0.6) 1.14%, rgba(70, 163, 231, 0) 47.93%, rgba(147, 62, 255, 0.6) 99.25%)',
            filter: 'blur(50px)',
          }}
        ></div>
        <div className="relative rounded-2xl z-10 border-4 gradientBorderWrapper overflow-hidden">
          <div
            className="relative z-10 py-5 px-7 xs:px-3 md:px-3"
            style={{
              background: 'linear-gradient(180deg, #26343E 0%, #1D2932 100%)',
            }}
          >
            <div className="relative flex items-center justify-center mb-7 xs:hidden md:hidden">
              <div
                className="absolute -left-1 cursor-pointer flex items-center justify-center w-6 h-6"
                onClick={goYourLiquidityPage}
              >
                <ReturnIcon></ReturnIcon>
              </div>
              <span className="text-v3LightGreyColor text-xl">
                <FormattedMessage id="add_liquidity"></FormattedMessage>
              </span>
            </div>
            <div className="flex items-start justify-between xs:flex-col md:flex-col">
              {/* left area */}
              <div className="w-1/2 mr-7 flex-shrink-0 xs:w-full md:w-full">
                <div className="text-white font-bold text-base">
                  <FormattedMessage
                    id="select_tokens"
                    defaultMessage="Select Tokens"
                  />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex flex-grow w-1">
                    <SelectToken
                      tokenPriceList={tokenPriceList}
                      tokens={nearSwapTokens}
                      standalone
                      selected={
                        <div
                          className={`flex items-center justify-between flex-grow h-12 text-base text-white rounded-xl px-4 cursor-pointer ${
                            tokenX
                              ? 'bg-black bg-opacity-20'
                              : 'bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover'
                          }`}
                        >
                          {tokenX ? (
                            <div className="flex items-center">
                              <img
                                src={tokenX.icon}
                                className="w-8 h-8 rounded-full border border-greenColor"
                              ></img>
                              <span className="text-white text-base font-bold ml-2.5">
                                {toRealSymbol(tokenX.symbol)}
                              </span>
                            </div>
                          ) : (
                            <>
                              <FormattedMessage
                                id="select_token"
                                defaultMessage="Select Token"
                              ></FormattedMessage>
                            </>
                          )}
                          <SelectIcon></SelectIcon>
                        </div>
                      }
                      onSelect={(token) => {
                        if (tokenY && tokenY.id == token.id) return;
                        setTokenX(token);
                        setTokenXBalanceFromNear(token?.near?.toString());
                      }}
                      balances={balances}
                    />
                  </div>
                  <div
                    onMouseEnter={() => {
                      if (!mobileDevice) {
                        setButtonHover(true);
                      }
                    }}
                    onMouseLeave={() => {
                      if (!mobileDevice) {
                        setButtonHover(false);
                      }
                    }}
                    onTouchStart={() => {
                      if (mobileDevice) {
                        setButtonHover(true);
                      }
                    }}
                    onTouchEnd={() => {
                      if (mobileDevice) {
                        setButtonHover(false);
                      }
                    }}
                    onClick={switchButtonSort}
                    className="flex flex-col items-center justify-center border border-v3SwapGray w-6 h-6 rounded-full mx-2 cursor-pointer box-content"
                  >
                    <SwitchArrowR
                      className={`transition-transform transform ${
                        buttonHover
                          ? 'translate-x-0.5 text-greenColor'
                          : 'text-v3SwapGray'
                      }`}
                    ></SwitchArrowR>
                    <SwitchArrowL
                      style={{ marginTop: '3px' }}
                      className={`transition-transform transform ${
                        buttonHover
                          ? '-translate-x-0.5 text-greenColor'
                          : 'text-v3SwapGray'
                      }`}
                    ></SwitchArrowL>
                  </div>
                  <div className="flex flex-grow w-1">
                    <SelectToken
                      tokenPriceList={tokenPriceList}
                      tokens={nearSwapTokens}
                      standalone
                      selected={
                        <div
                          className={`flex items-center justify-between flex-grow h-12 text-base text-white rounded-xl px-4 cursor-pointer ${
                            tokenY
                              ? 'bg-black bg-opacity-20'
                              : 'bg-gradient-to-b from-gradientFrom to-gradientTo hover:from-gradientFromHover to:from-gradientToHover'
                          }`}
                        >
                          {tokenY ? (
                            <div className="flex items-center">
                              <img
                                src={tokenY.icon}
                                className="w-8 h-8 rounded-full border border-greenColor"
                              ></img>
                              <span className="text-white text-base font-bold ml-2.5">
                                {toRealSymbol(tokenY.symbol)}
                              </span>
                            </div>
                          ) : (
                            <>
                              <FormattedMessage
                                id="select_token"
                                defaultMessage="Select Token"
                              ></FormattedMessage>
                            </>
                          )}
                          <SelectIcon></SelectIcon>
                        </div>
                      }
                      onSelect={(token: TokenMetadata) => {
                        if (tokenX && tokenX.id == token.id) return;
                        setTokenY(token);
                        setTokenYBalanceFromNear(token?.near?.toString());
                      }}
                      balances={balances}
                    />
                  </div>
                </div>
                <div
                  className="rounded-xl px-4 py-3 mt-5 xs:px-2 md:px-2"
                  style={{ border: '1.2px solid rgba(145, 162, 174, 0.2)' }}
                >
                  {/* 移动端头部 */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center pl-2">
                      <span
                        className={`text-sm text-white mr-1.5 lg:hidden ${
                          feeBoxStatus || !currentSelectedPool ? 'hidden' : ''
                        }`}
                      >
                        {currentSelectedPool
                          ? currentSelectedPool.fee / 10000 + '%'
                          : ''}
                      </span>
                      <div className="text-white text-base xs:text-sm md:text-sm">
                        <FormattedMessage
                          id="fee_Tiers"
                          defaultMessage="Fee Tiers"
                        />
                      </div>
                      <div
                        className={`text-xs text-v3SwapGray px-2.5 py-0.5 bg-black bg-opacity-20 rounded-2xl ml-2 lg:hidden ${
                          feeBoxStatus || !currentSelectedPool ? 'hidden' : ''
                        }`}
                      >
                        {currentSelectedPool?.pool_id ? (
                          <span>
                            TVL&nbsp;{displayTvl(currentSelectedPool.tvl)}
                          </span>
                        ) : (
                          <FormattedMessage
                            id="no_pool"
                            defaultMessage="No Pool"
                          ></FormattedMessage>
                        )}
                      </div>
                    </div>
                    <div
                      onClick={switchFeeBoxStatus}
                      className="p-1.5 rounded-lg cursor-pointer"
                      style={{ border: '1.2px solid rgba(145, 162, 174, 0.2)' }}
                    >
                      <SwitchIcon
                        className={`hover:text-senderHot ${
                          feeBoxStatus
                            ? 'text-senderHot'
                            : 'text-v3feeTextColor'
                        }`}
                      ></SwitchIcon>
                    </div>
                  </div>
                  {/* 身体部分 */}
                  <div
                    className={`items-stretch justify-between mt-5 ${
                      feeBoxStatus ? 'flex' : 'hidden'
                    }`}
                  >
                    {FEELIST.map((feeItem, index) => {
                      const { fee, text } = feeItem;
                      return (
                        <div
                          onClick={() => {
                            switchSelectedFee(fee);
                          }}
                          key={fee + index}
                          className={`rounded-xl w-1 flex-grow ${
                            tokenX && tokenY ? 'cursor-pointer' : ''
                          } ${index == 3 ? '' : 'mr-2.5 xs:mr-1 md:mr-1'} ${
                            currentSelectedPool?.fee == fee
                              ? 'gradientBorderWrapperNoShadow'
                              : 'border border-v3feeBorderColor p-px'
                          }`}
                        >
                          <div className="flex flex-col items-center  px-1 py-3 xs:px-px md:px-px">
                            <span className="text-sm text-white">
                              {fee / 10000}%
                            </span>
                            {tokenX && tokenY && currentPools ? (
                              <div
                                className={`flex items-center justify-center w-full py-1 rounded-xl bg-black bg-opacity-20 text-xs text-v3LightGreyColor mt-2 whitespace-nowrap`}
                              >
                                <span className="transform xs:scale-90 md:scale-90">
                                  {!currentPools[fee] ? (
                                    <FormattedMessage id="no_pool" />
                                  ) : Object.keys(tokenPriceList).length > 0 ? (
                                    <span>
                                      TVL&nbsp;
                                      {displayTvl(currentPools[fee].tvl)}
                                    </span>
                                  ) : (
                                    'Loading...'
                                  )}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* pc端头部 */}
                  <div
                    className={` items-center mt-3 xs:hidden md:hidden pl-2 ${
                      feeBoxStatus || !currentSelectedPool ? 'hidden' : 'flex'
                    }`}
                  >
                    <span className="text-base text-white mr-3">
                      {currentSelectedPool
                        ? currentSelectedPool.fee / 10000 + '%'
                        : ''}
                    </span>
                    <div className="text-sm text-v3SwapGray px-2.5 py-0.5 bg-black bg-opacity-20 rounded-2xl">
                      {currentSelectedPool?.pool_id ? (
                        <span>
                          TVL&nbsp;{displayTvl(currentSelectedPool.tvl)}
                        </span>
                      ) : (
                        <FormattedMessage id="no_pool" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <span className="text-base text-white font-bold">
                    <FormattedMessage
                      id="input_amount"
                      defaultMessage="Input Amount"
                    />
                  </span>
                  <OneSide
                    show={
                      (onlyAddYToken && currentPoint != rightPoint - 1) ||
                      onlyAddXToken
                        ? true
                        : false
                    }
                  ></OneSide>
                  <InvalidRange
                    show={invalidRange ? true : false}
                  ></InvalidRange>
                  <InputAmount
                    token={tokenX}
                    balance={tokenXBalanceFromNear}
                    tokenPriceList={tokenPriceList}
                    amount={tokenXAmount}
                    changeAmount={changeTokenXAmount}
                    currentSelectedPool={currentSelectedPool}
                    hidden={
                      tokenSort
                        ? onlyAddYToken || invalidRange
                          ? true
                          : false
                        : onlyAddXToken || invalidRange
                        ? true
                        : false
                    }
                  ></InputAmount>
                  <InputAmount
                    token={tokenY}
                    balance={tokenYBalanceFromNear}
                    tokenPriceList={tokenPriceList}
                    amount={tokenYAmount}
                    changeAmount={changeTokenYAmount}
                    currentSelectedPool={currentSelectedPool}
                    hidden={
                      tokenSort
                        ? onlyAddXToken || invalidRange
                          ? true
                          : false
                        : onlyAddYToken || invalidRange
                        ? true
                        : false
                    }
                  ></InputAmount>
                </div>
              </div>
              {/* right area */}
              {/* no Data */}
              {currentSelectedPool ? null : <NoDataComponent></NoDataComponent>}
              {/* add pool part */}
              {currentSelectedPool &&
              !currentSelectedPool.pool_id &&
              OPEN_CREATE_POOL_ENTRY ? (
                <CreatePoolComponent
                  currentSelectedPool={currentSelectedPool}
                  tokenX={tokenX}
                  tokenY={tokenY}
                  tokenPriceList={tokenPriceList}
                  buttonSort={buttonSort}
                ></CreatePoolComponent>
              ) : null}
              {currentSelectedPool &&
              !currentSelectedPool.pool_id &&
              !OPEN_CREATE_POOL_ENTRY ? (
                <NoDataComponent isNoPool={true}></NoDataComponent>
              ) : null}
              {/* add Liquidity part */}
              {currentSelectedPool && currentSelectedPool.pool_id ? (
                <AddLiquidityComponent
                  currentSelectedPool={currentSelectedPool}
                  tokenX={tokenX}
                  tokenY={tokenY}
                  tokenXAmount={tokenXAmount}
                  tokenYAmount={tokenYAmount}
                  tokenXBalanceFromNear={tokenXBalanceFromNear}
                  tokenYBalanceFromNear={tokenYBalanceFromNear}
                  tokenPriceList={tokenPriceList}
                  onlyAddXToken={onlyAddXToken}
                  onlyAddYToken={onlyAddYToken}
                  invalidRange={invalidRange}
                  pointChange={pointChange}
                ></AddLiquidityComponent>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function CreatePoolComponent({
  currentSelectedPool,
  tokenX,
  tokenY,
  tokenPriceList,
  buttonSort,
}: {
  currentSelectedPool: PoolInfo;
  tokenX: TokenMetadata;
  tokenY: TokenMetadata;
  tokenPriceList: Record<string, any>;
  buttonSort: boolean;
}) {
  const [createPoolButtonLoading, setCreatePoolButtonLoading] = useState(false);
  const [createPoolRate, setCreatePoolRate] = useState<string>('');
  const [rateStatus, setRateStatus] = useState(true);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (createPoolRate) {
      const rateString = new BigNumber(1).dividedBy(createPoolRate).toFixed();
      setCreatePoolRate(toPrecision(rateString, 6));
    }
  }, [buttonSort]);
  function getCurrentPriceValue(token: TokenMetadata) {
    if (token) {
      const price = tokenPriceList[token.id]?.price;
      return price ? `${'$' + price}` : '$-';
    } else {
      return '$-';
    }
  }
  function createPool() {
    setCreatePoolButtonLoading(true);
    const { fee } = currentSelectedPool;
    const pointDelta = POINTDELTAMAP[fee];
    let decimalRate =
      Math.pow(10, tokenY.decimals) / Math.pow(10, tokenX.decimals);
    let init_point = getPointByPrice(
      pointDelta,
      createPoolRate,
      decimalRate,
      true
    );
    const arr = [tokenX.id, tokenY.id];
    arr.sort();
    if (arr[0] !== tokenX.id) {
      decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      init_point = getPointByPrice(
        pointDelta,
        new BigNumber(1).dividedBy(createPoolRate).toFixed(),
        decimalRate,
        true
      );
      create_pool({
        token_a: tokenY.id,
        token_b: tokenX.id,
        fee: currentSelectedPool.fee,
        init_point,
      });
    } else {
      create_pool({
        token_a: tokenX.id,
        token_b: tokenY.id,
        fee: currentSelectedPool.fee,
        init_point,
      });
    }
  }
  function switchRate() {
    setRateStatus(!rateStatus);
  }
  function getPoolRate() {
    if (createPoolRate) {
      const rate = 1 / +createPoolRate;
      return toPrecision(rate.toString(), 6);
    }
    return '';
  }
  return (
    <div
      className={`w-1/2 xs:w-full md:w-full flex flex-col justify-between flex-grow self-stretch xs:mt-5 md:mt-5`}
    >
      <div className="text-white font-bold text-base">
        <FormattedMessage
          id="pool_creation"
          defaultMessage="Pool creation"
        ></FormattedMessage>
        :
      </div>
      <div className="relative flex-grow bg-black bg-opacity-10 rounded-xl px-4 py-7 mt-3 xs:px-2 md:px-2">
        <BgIcon className="absolute right-0 top-0 xs:hidden md:hidden"></BgIcon>
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <p className="text-sm text-white">
              <FormattedMessage
                id="pool_creation_tip"
                defaultMessage="There is no existing pool for the selected tokens. To create the pool, you must set the pool rate, by providing corresponding amounts."
              ></FormattedMessage>
            </p>
          </div>
          <div className="xs:mt-20 md:mt-20">
            <p className="text-base text-white">
              <FormattedMessage
                id="starting_price"
                defaultMessage="Starting Price"
              ></FormattedMessage>
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="whitespace-nowrap mr-2">
                1 {toRealSymbol(tokenX?.symbol)} =
              </span>
              <div className="flex items-center justify-between rounded-xl bg-black bg-opacity-20 px-3 h-12">
                <input
                  type="number"
                  placeholder="0.0"
                  className="text-xl font-bold"
                  value={createPoolRate}
                  onChange={({ target }) => {
                    setCreatePoolRate(target.value);
                  }}
                />
                <span className="text-base text-white ml-3">
                  {toRealSymbol(tokenY?.symbol)}
                </span>
              </div>
            </div>
            <div className="flex items-center flex-wrap justify-between mt-3.5">
              <span className="text-xs text-v3LightGreyColor mr-2 mb-2">
                <FormattedMessage
                  id="current_price"
                  defaultMessage="Current Price"
                ></FormattedMessage>
              </span>
              <div className="flex items-center text-xs text-white mb-2">
                {rateStatus ? (
                  <div className="mr-0.5">
                    1 {toRealSymbol(tokenX?.symbol)}
                    <span className="text-v3LightGreyColor mx-0.5">
                      ({getCurrentPriceValue(tokenX)})
                    </span>
                    <label className="mx-0.5">=</label>
                    <span>
                      {createPoolRate} {toRealSymbol(tokenY?.symbol)}
                    </span>
                  </div>
                ) : (
                  <div className="mr-0.5">
                    1 {toRealSymbol(tokenY?.symbol)}
                    <span className="text-v3LightGreyColor mx-0.5">
                      ({getCurrentPriceValue(tokenY)})
                    </span>
                    <label className="mx-0.5">=</label>
                    <span>
                      {getPoolRate()} {toRealSymbol(tokenX?.symbol)}
                    </span>
                  </div>
                )}

                <SwitchButton
                  onClick={switchRate}
                  className="cursor-pointer ml-1.5"
                ></SwitchButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isSignedIn ? (
        <GradientButton
          color="#fff"
          className={`relative z-50 w-full h-10 mt-5 text-center text-base text-white focus:outline-none ${
            !createPoolRate ? 'opacity-40' : ''
          }`}
          loading={createPoolButtonLoading}
          disabled={createPoolButtonLoading || !createPoolRate}
          btnClassName={`${!createPoolRate ? 'cursor-not-allowed' : ''}`}
          onClick={createPool}
        >
          <ButtonTextWrapper
            loading={createPoolButtonLoading}
            Text={() => (
              <>
                <FormattedMessage
                  id="create_a_pool"
                  defaultMessage="Create a Pool"
                ></FormattedMessage>
              </>
            )}
          />
        </GradientButton>
      ) : (
        <ConnectToNearBtn></ConnectToNearBtn>
      )}
    </div>
  );
}
function AddLiquidityComponent({
  currentSelectedPool,
  tokenX,
  tokenY,
  tokenPriceList,
  tokenXAmount,
  tokenYAmount,
  tokenXBalanceFromNear,
  tokenYBalanceFromNear,
  pointChange,
  onlyAddXToken,
  onlyAddYToken,
  invalidRange,
}: {
  currentSelectedPool: PoolInfo;
  tokenX: TokenMetadata;
  tokenY: TokenMetadata;
  tokenPriceList: Record<string, any>;
  tokenXAmount: string;
  tokenYAmount: string;
  tokenXBalanceFromNear: string;
  tokenYBalanceFromNear: string;
  pointChange: any;
  onlyAddXToken: boolean;
  onlyAddYToken: boolean;
  invalidRange: boolean;
}) {
  let [leftCustomPrice, setLeftCustomPrice] = useState('');
  let [rightCustomPrice, setRightCustomPrice] = useState('');
  let [leftPoint, setLeftPoint] = useState<number>(0);
  let [rightPoint, setRightPoint] = useState<number>(0);
  const [currentPoint, setCurrentPoint] = useState<number>();
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [noDataForChart, setNoDataForChart] = useState(false);
  const [addLiquidityButtonLoading, setAddLiquidityButtonLoading] =
    useState(false);
  const [currentCheckedQuickOption, setCurrentCheckedQuickOption] = useState<
    number | string
  >();
  const [quickOptions, setQuickOptions] = useState([5, 10, 20, 50]);
  const [quickOptionsMapPoint, setQuickOptionsMapPoint] = useState<
    Record<string, any>
  >({});
  const { globalState } = useContext(WalletContext);
  const [timer, setTimer] = useState(null);
  const [depthData, setDepthData] = useState(null);
  const isSignedIn = globalState.isSignedIn;
  const intl = useIntl();
  const chartDom = useRef(null);
  const { token_x, token_y } = currentSelectedPool;
  const token_x_decimals =
    tokenX.id == token_x ? tokenX.decimals : tokenY.decimals;
  const token_y_decimals =
    tokenY.id == token_y ? tokenY.decimals : tokenX.decimals;
  // init
  useEffect(() => {
    const { current_point, point_delta } = currentSelectedPool;
    // 5, 10 20 50
    const optionsMapPoints_temp = {};
    quickOptions.forEach((p: number) => {
      const { left_p, right_p } = getPointByCondition(p);
      optionsMapPoints_temp[p] = { left_p, right_p };
      if (p == 10) {
        leftPoint = left_p;
        rightPoint = right_p;
        setLeftPoint(left_p);
        setRightPoint(right_p);
      }
    });
    // full
    const l_p_temp = _.max([current_point - 400000, -800000]);
    const r_p_temp = _.min([current_point + 400000, 800000]);
    let l_p = Math.floor(l_p_temp / point_delta) * point_delta;
    let r_p = Math.floor(r_p_temp / point_delta) * point_delta;
    if (r_p - l_p >= POINTRIGHTRANGE) {
      l_p = l_p + point_delta;
    }
    optionsMapPoints_temp['full'] = { left_p: l_p, right_p: r_p };
    // set
    setCurrentPoint(current_point);
    setQuickOptionsMapPoint(optionsMapPoints_temp);
    setCurrentCheckedQuickOption(10);
    // show chart data
    setChartLoading(true);
    setNoDataForChart(false);
    clearTimeout(timer);
    const timer_latest = setTimeout(() => {
      getChartData();
    }, 1000);
    setTimer(timer_latest);
  }, [currentSelectedPool]);
  useEffect(() => {
    pointChange({ leftPoint, rightPoint, currentPoint });
    const targetKey = Object.keys(quickOptionsMapPoint).find((key: string) => {
      const { left_p, right_p } = quickOptionsMapPoint[key];
      if (left_p == leftPoint && right_p == rightPoint) {
        return key;
      }
    });
    if (targetKey) {
      setCurrentCheckedQuickOption(targetKey);
    } else {
      setCurrentCheckedQuickOption(undefined);
    }
    if (depthData) {
      drawChartData({
        depthData,
        left_point: leftPoint,
        right_point: rightPoint,
        token_x_decimals,
        token_y_decimals,
        chartDom,
        sort: tokenX.id == token_x,
      });
    }
  }, [leftPoint, rightPoint]);
  async function getChartData() {
    const depthData = await get_pool_marketdepth(currentSelectedPool.pool_id);
    const length = drawChartData({
      depthData,
      left_point: leftPoint,
      right_point: rightPoint,
      token_x_decimals,
      token_y_decimals,
      chartDom,
      sort: tokenX.id == token_x,
    });
    if (length == 0) {
      setNoDataForChart(true);
    } else {
      setDepthData(depthData);
    }
    setChartLoading(false);
  }
  function getPointByCondition(p: number) {
    const { point_delta, token_x } = currentSelectedPool;
    const c_price = getCurrentPrice_real_decimal();
    const decimalRate =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    const tokenSort = tokenX.id == token_x ? true : false;
    const reduce_p = 1 - p / 100;
    const add_p = 1 + p / 100;
    if (tokenSort) {
      // -10% example
      const l_price = new BigNumber(c_price).multipliedBy(reduce_p).toFixed();
      const point_l = getPointByPrice(
        point_delta,
        l_price.toString(),
        decimalRate
      );
      // +10% example
      const r_price = new BigNumber(c_price).multipliedBy(add_p).toFixed();
      const point_r = getPointByPrice(
        point_delta,
        r_price.toString(),
        decimalRate
      );
      return { left_p: point_l, right_p: point_r };
    } else {
      const c_price2 = new BigNumber(1).dividedBy(c_price).toFixed();
      // +10% example
      const priceAdd = new BigNumber(c_price2).multipliedBy(add_p);
      const l_price_2 = new BigNumber(1).dividedBy(priceAdd).toFixed();
      const point_l_2 = getPointByPrice(
        point_delta,
        l_price_2.toString(),
        decimalRate
      );
      // -10% example
      const priceDivide = new BigNumber(c_price2).multipliedBy(reduce_p);
      const r_price_2 = new BigNumber(1).dividedBy(priceDivide).toFixed();
      const point_r_2 = getPointByPrice(
        point_delta,
        r_price_2.toString(),
        decimalRate
      );
      return { left_p: point_l_2, right_p: point_r_2 };
    }
  }
  function getCurrentPrice() {
    let price = getCurrentPrice_real_decimal();
    if (tokenX.id == token_y) {
      price = new BigNumber(1).dividedBy(price).toFixed();
    }
    if (price) {
      return toPrecision(price.toString(), 8);
    } else {
      return '-';
    }
  }
  function getCurrentPriceValue() {
    if (tokenX) {
      const price = tokenPriceList[tokenX.id]?.price;
      return price ? `${'$' + price}` : '$-';
    } else {
      return '$-';
    }
  }
  function getCurrentPrice_real_decimal() {
    if (currentSelectedPool && currentSelectedPool.pool_id) {
      const { current_point, token_x, token_y } = currentSelectedPool;
      const decimalRate =
        Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
      const price = getPriceByPoint(current_point, decimalRate);
      return price;
    }
    return 0;
  }
  function addOneSlot(direction: string) {
    const { point_delta } = currentSelectedPool;
    const l_p = leftPoint + point_delta;
    const r_p = rightPoint + point_delta;
    if (direction == 'l') {
      setLeftPoint(Math.max(Math.min(POINTRIGHTRANGE, l_p), POINTLEFTRANGE));
    } else if (direction == 'r') {
      const target_slot_r = Math.max(
        Math.min(POINTRIGHTRANGE, r_p),
        POINTLEFTRANGE
      );
      if (target_slot_r - leftPoint >= POINTRIGHTRANGE) return;
      setRightPoint(target_slot_r);
    }
  }
  function reduceOneSlot(direction: string) {
    const { point_delta } = currentSelectedPool;
    const l_p = leftPoint - point_delta;
    const r_p = rightPoint - point_delta;
    if (direction == 'l') {
      const target_slot_l = Math.max(
        Math.min(POINTRIGHTRANGE, l_p),
        POINTLEFTRANGE
      );
      if (rightPoint - target_slot_l >= POINTRIGHTRANGE) return;
      setLeftPoint(target_slot_l);
    } else if (direction == 'r') {
      setRightPoint(Math.max(Math.min(POINTRIGHTRANGE, r_p), POINTLEFTRANGE));
    }
  }
  function handlePriceToAppropriatePoint() {
    const { point_delta, token_x, token_y } = currentSelectedPool;
    const decimalRate =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    if (leftCustomPrice) {
      if (!tokenSort) {
        leftCustomPrice = new BigNumber(1).dividedBy(leftCustomPrice).toFixed();
      }
      const c_point = getPointByPrice(
        point_delta,
        leftCustomPrice,
        decimalRate
      );
      setLeftCustomPrice('');
      setLeftPoint(c_point);
      if (rightPoint - c_point >= POINTRIGHTRANGE) {
        const appropriate_r_point = POINTRIGHTRANGE + c_point - point_delta;
        setRightPoint(appropriate_r_point);
      }
    }
    if (rightCustomPrice) {
      if (!tokenSort) {
        rightCustomPrice = new BigNumber(1)
          .dividedBy(rightCustomPrice)
          .toFixed();
      }
      const c_point = getPointByPrice(
        point_delta,
        rightCustomPrice,
        decimalRate
      );
      setRightCustomPrice('');
      setRightPoint(c_point);
      if (c_point - leftPoint >= POINTRIGHTRANGE) {
        const appropriate_l_point = c_point - POINTRIGHTRANGE + point_delta;
        setLeftPoint(appropriate_l_point);
      }
    }
  }
  function getButtonStatus() {
    const condition1 = currentSelectedPool?.pool_id;
    let condition2;
    if (onlyAddXToken) {
      if (tokenSort) {
        condition2 =
          +tokenXAmount > 0 &&
          new BigNumber(
            getMax(tokenX, tokenXBalanceFromNear)
          ).isGreaterThanOrEqualTo(tokenXAmount);
      } else {
        condition2 =
          +tokenYAmount > 0 &&
          new BigNumber(
            getMax(tokenY, tokenYBalanceFromNear)
          ).isGreaterThanOrEqualTo(+tokenYAmount);
      }
    } else if (onlyAddYToken) {
      if (tokenSort) {
        condition2 =
          +tokenYAmount > 0 &&
          new BigNumber(
            getMax(tokenY, tokenYBalanceFromNear)
          ).isGreaterThanOrEqualTo(+tokenYAmount);
      } else {
        condition2 =
          +tokenXAmount > 0 &&
          new BigNumber(
            getMax(tokenX, tokenXBalanceFromNear)
          ).isGreaterThanOrEqualTo(tokenXAmount);
      }
    } else if (!invalidRange) {
      condition2 =
        +tokenXAmount > 0 &&
        new BigNumber(
          getMax(tokenX, tokenXBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenXAmount) &&
        +tokenYAmount > 0 &&
        new BigNumber(
          getMax(tokenY, tokenYBalanceFromNear)
        ).isGreaterThanOrEqualTo(+tokenYAmount);
    }
    return !(condition1 && condition2);
  }
  function getMax(token: TokenMetadata, balance: string) {
    return token.id !== WRAP_NEAR_CONTRACT_ID
      ? balance
      : Number(balance) <= 0.5
      ? '0'
      : String(Number(balance) - 0.5);
  }
  function getLeftPrice() {
    if (currentSelectedPool && currentSelectedPool.pool_id) {
      const { token_x, token_y } = currentSelectedPool;
      const decimalRate =
        Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
      let price = getPriceByPoint(leftPoint, decimalRate);
      if (tokenX.id == token_y) {
        price = new BigNumber(1).dividedBy(price).toFixed();
      }
      if (new BigNumber(price).isLessThan('0.00000001')) {
        return price;
      } else {
        return toPrecision(price.toString(), 8);
      }
    } else {
      return '';
    }
  }
  function getRightPrice() {
    if (currentSelectedPool && currentSelectedPool.pool_id) {
      const { token_x, token_y } = currentSelectedPool;
      const decimalRate =
        Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
      let price = getPriceByPoint(rightPoint, decimalRate);
      if (tokenX.id == token_y) {
        price = new BigNumber(1).dividedBy(price).toFixed();
      }
      if (new BigNumber(price).isLessThan('0.00000001')) {
        return price;
      } else {
        return toPrecision(price.toString(), 8);
      }
    } else {
      return '';
    }
  }
  function addLiquidity() {
    setAddLiquidityButtonLoading(true);
    const { pool_id } = currentSelectedPool;
    add_liquidity({
      pool_id,
      left_point: leftPoint,
      right_point: rightPoint,
      amount_x: tokenSort
        ? toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0')
        : toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0'),
      amount_y: tokenSort
        ? toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0')
        : toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0'),
      token_x: tokenSort ? tokenX : tokenY,
      token_y: tokenSort ? tokenY : tokenX,
    });
  }
  function quickChangePoint(item: string | number) {
    if (currentCheckedQuickOption == item) return;
    const { point_delta, current_point } = currentSelectedPool;
    const decimalRateTurn =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    if (item == 'full') {
      const l_p_temp = _.max([current_point - 400000, -800000]);
      const r_p_temp = _.min([current_point + 400000, 800000]);
      let l_p = Math.floor(l_p_temp / point_delta) * point_delta;
      let r_p = Math.floor(r_p_temp / point_delta) * point_delta;
      if (r_p - l_p >= POINTRIGHTRANGE) {
        l_p = l_p + point_delta;
      }
      setLeftPoint(l_p);
      setRightPoint(r_p);
    } else {
      const decimalRate =
        Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
      const price_c = getPriceByPoint(currentPoint, decimalRate);
      if (tokenSort) {
        const price_l_new = new BigNumber(1 - +item / 100)
          .multipliedBy(price_c)
          .toFixed();
        const price_r_new = new BigNumber(1 + +item / 100)
          .multipliedBy(price_c)
          .toFixed();
        const l_point = getPointByPrice(
          point_delta,
          price_l_new,
          decimalRateTurn
        );
        const r_point = getPointByPrice(
          point_delta,
          price_r_new,
          decimalRateTurn
        );
        setLeftPoint(l_point);
        setRightPoint(r_point);
      } else {
        const price_c_2 = new BigNumber(1).dividedBy(price_c).toFixed();
        const price_l_new_2 = new BigNumber(1 - +item / 100)
          .multipliedBy(price_c_2)
          .toFixed();
        const price_r_new_2 = new BigNumber(1 + +item / 100)
          .multipliedBy(price_c_2)
          .toFixed();
        const price_l_new = new BigNumber(1).dividedBy(price_r_new_2).toFixed();
        const price_r_new = new BigNumber(1).dividedBy(price_l_new_2).toFixed();
        const l_point = getPointByPrice(
          point_delta,
          price_l_new,
          decimalRateTurn
        );
        const r_point = getPointByPrice(
          point_delta,
          price_r_new,
          decimalRateTurn
        );
        setLeftPoint(l_point);
        setRightPoint(r_point);
      }
    }
  }
  function getButtonText() {
    let txt: any = (
      <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
    );
    if (invalidRange) {
      txt = (
        <FormattedMessage id="update_range" defaultMessage="Update Range" />
      );
    } else if (
      (onlyAddXToken && +tokenXAmount == 0 && tokenSort) ||
      (onlyAddXToken && +tokenYAmount == 0 && !tokenSort)
    ) {
      txt = (
        <FormattedMessage
          id="input_amount"
          defaultMessage="Input Amount"
        ></FormattedMessage>
      );
    } else if (
      (onlyAddYToken && +tokenYAmount == 0 && tokenSort) ||
      (onlyAddYToken && +tokenXAmount == 0 && !tokenSort)
    ) {
      txt = (
        <FormattedMessage
          id="input_amount"
          defaultMessage="Input Amount"
        ></FormattedMessage>
      );
    } else if (
      !onlyAddXToken &&
      !onlyAddYToken &&
      (+tokenXAmount == 0 || +tokenYAmount == 0)
    ) {
      txt = (
        <FormattedMessage
          id="input_amount"
          defaultMessage="Input Amount"
        ></FormattedMessage>
      );
    } else if (
      +tokenXAmount > 0 &&
      new BigNumber(tokenXAmount).isGreaterThan(
        getMax(tokenX, tokenXBalanceFromNear)
      )
    ) {
      txt = (
        <FormattedMessage
          id="not_enough_balance"
          defaultMessage="Not Enough Balance"
        />
      );
    } else if (
      +tokenYAmount > 0 &&
      new BigNumber(tokenYAmount).isGreaterThan(
        getMax(tokenY, tokenYBalanceFromNear)
      )
    ) {
      txt = (
        <FormattedMessage
          id="not_enough_balance"
          defaultMessage="Not Enough Balance"
        />
      );
    }
    return txt;
  }
  function getPriceTip() {
    const tip = 'The price should be in one slot nearby';
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  const tokenSort = tokenX.id == currentSelectedPool.token_x;
  const isAddLiquidityDisabled = getButtonStatus();
  return (
    <div
      className={`w-1/2 xs:w-full md:w-full flex flex-col justify-between flex-grow self-stretch xs:mt-5 md:mt-5`}
    >
      <div className="text-white font-bold text-base">
        <FormattedMessage
          id="set_price_range"
          defaultMessage="Set Price Range"
        ></FormattedMessage>
      </div>
      <div className="flex flex-col justify-between relative flex-grow bg-v3BlackColor rounded-xl px-4 py-7 xs:py-5 md:py-5 mt-3 xs:px-2 md:px-2">
        <div className="flex items-center flex-wrap justify-between mt-3.5 xs:mt-0 md:mt-0">
          <span className="text-xs text-v3LightGreyColor mb-2">
            <FormattedMessage
              id="current_price"
              defaultMessage="Current Price"
            ></FormattedMessage>
          </span>
          <div className="flex items-center text-xs text-white mb-2">
            1 {toRealSymbol(tokenX?.symbol)}
            <span className="text-v3LightGreyColor ml-0.5">
              ({getCurrentPriceValue()})
            </span>
            <label className="mx-0.5">=</label>
            <span>
              {getCurrentPrice()} {toRealSymbol(tokenY?.symbol)}
            </span>
          </div>
        </div>
        {/* range chart area */}
        <div className="relative flex flex-col items-center justify-center my-10">
          <svg
            width="100%"
            height="230"
            className={`${
              chartLoading || noDataForChart ? 'invisible' : 'visible'
            }`}
            ref={chartDom}
            style={{ color: 'rgba(91, 64, 255, 0.5)' }}
          >
            <g className="chart"></g>
            <g className="g" transform="translate(50,200)"></g>
            <g className="g2"></g>
            <g className="gLeftLine"></g>
            <g className="gRightLine"></g>
          </svg>
          {chartLoading ? (
            <BlueCircleLoading className="absolute"></BlueCircleLoading>
          ) : null}
          {noDataForChart ? <EmptyIcon className="absolute"></EmptyIcon> : null}
        </div>
        {/* input range area */}
        <div>
          <div className="flex items-center justify-between">
            <div className="w-1 flex-grow flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-3 mr-5 xs:mr-2 md:mr-2">
              <span className="text-sm text-primaryText xs:text-xs md:text-xs">
                <FormattedMessage
                  id="min_price"
                  defaultMessage="Min Price"
                ></FormattedMessage>
              </span>
              {tokenSort ? (
                <PointInputComponent
                  reduceOneSlot={() => {
                    reduceOneSlot('l');
                  }}
                  addOneSlot={() => {
                    addOneSlot('l');
                  }}
                  handlePriceToAppropriatePoint={handlePriceToAppropriatePoint}
                  customPrice={leftCustomPrice}
                  getPrice={getLeftPrice}
                  setCustomPrice={setLeftCustomPrice}
                ></PointInputComponent>
              ) : (
                <PointInputComponent
                  reduceOneSlot={() => {
                    addOneSlot('r');
                  }}
                  addOneSlot={() => {
                    reduceOneSlot('r');
                  }}
                  handlePriceToAppropriatePoint={handlePriceToAppropriatePoint}
                  customPrice={rightCustomPrice}
                  getPrice={getRightPrice}
                  setCustomPrice={setRightCustomPrice}
                ></PointInputComponent>
              )}
            </div>
            <div className="w-1 flex-grow flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-2.5">
              <span className="text-sm text-primaryText xs:text-xs md:text-xs">
                <FormattedMessage
                  id="max_price"
                  defaultMessage="Max Price"
                ></FormattedMessage>
              </span>
              {tokenSort ? (
                <PointInputComponent
                  reduceOneSlot={() => {
                    reduceOneSlot('r');
                  }}
                  addOneSlot={() => {
                    addOneSlot('r');
                  }}
                  handlePriceToAppropriatePoint={handlePriceToAppropriatePoint}
                  customPrice={rightCustomPrice}
                  getPrice={getRightPrice}
                  setCustomPrice={setRightCustomPrice}
                ></PointInputComponent>
              ) : (
                <PointInputComponent
                  reduceOneSlot={() => {
                    addOneSlot('l');
                  }}
                  addOneSlot={() => {
                    reduceOneSlot('l');
                  }}
                  handlePriceToAppropriatePoint={handlePriceToAppropriatePoint}
                  customPrice={leftCustomPrice}
                  getPrice={getLeftPrice}
                  setCustomPrice={setLeftCustomPrice}
                ></PointInputComponent>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div
              className="text-sm"
              data-type="info"
              data-place="top"
              data-multiline={true}
              data-class="reactTip"
              data-html={true}
              data-tip={getPriceTip()}
              data-for="priceTipId"
            >
              <WarningMark className="flex-shrink-0 cursor-pointer text-primaryText hover:text-white"></WarningMark>
              <ReactTooltip
                className="w-20"
                id="priceTipId"
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
              />
            </div>
            {quickOptions.map((item: number, index) => {
              return (
                <div
                  onClick={() => {
                    quickChangePoint(item);
                  }}
                  key={index}
                  className={`flex items-center justify-center rounded-lg h-6 py-0.5 xs:px-1 md:px-1  lg:px-1.5  2xl:px-3.5 box-content cursor-pointer font-sans text-sm border whitespace-nowrap ${
                    currentCheckedQuickOption == item
                      ? 'bg-v3PurpleColor border-v3PurpleColor text-white'
                      : 'border-v3GreyColor text-v3LightGreyColor'
                  }`}
                >
                  ± {item}%
                </div>
              );
            })}
            <div
              onClick={() => {
                quickChangePoint('full');
              }}
              className={`flex items-center justify-center rounded-lg h-6 py-0.5 xs:px-1 md:px-1  lg:px-1.5  2xl:px-3.5 box-content cursor-pointer font-sans text-sm border whitespace-nowrap ${
                currentCheckedQuickOption == 'full'
                  ? 'bg-v3PurpleColor border-v3PurpleColor text-white'
                  : 'border-v3GreyColor text-v3LightGreyColor'
              }`}
            >
              Full Range
            </div>
          </div>
        </div>
      </div>
      <div
        className={`items-start justify-center bg-black bg-opacity-20 rounded-lg mt-2.5 px-4 py-3 ${
          onlyAddXToken || (onlyAddYToken && currentPoint != rightPoint - 1)
            ? 'flex'
            : 'hidden'
        }`}
      >
        <WarningIcon className="relative top-1 flex-shrink-0"></WarningIcon>
        <div className="text-sm text-v3WarningColor ml-3">
          <FormattedMessage
            id="add_single_price_tip"
            defaultMessage="Your position will not earn fees or be used in trades until the market price moves into your range. "
          ></FormattedMessage>
        </div>
      </div>
      <div
        className={`items-start justify-center bg-black bg-opacity-20 rounded-lg mt-2.5 px-4 py-3 ${
          invalidRange ? 'flex' : 'hidden'
        }`}
      >
        <WarningIcon className="relative top-1 flex-shrink-0"></WarningIcon>
        <div className="text-sm text-v3WarningColor ml-3">
          <FormattedMessage
            id="invalid_range_tip"
            defaultMessage="Invalid range selected. The min price must be lower than the max price."
          />
        </div>
      </div>
      {isSignedIn ? (
        <GradientButton
          color="#fff"
          className={`w-full h-10 mt-5 text-center text-base text-white focus:outline-none ${
            isAddLiquidityDisabled ? 'opacity-40' : ''
          }`}
          loading={addLiquidityButtonLoading}
          disabled={addLiquidityButtonLoading || isAddLiquidityDisabled}
          btnClassName={`${isAddLiquidityDisabled ? 'cursor-not-allowed' : ''}`}
          onClick={addLiquidity}
        >
          <ButtonTextWrapper
            loading={addLiquidityButtonLoading}
            Text={() => <>{getButtonText()}</>}
          />
        </GradientButton>
      ) : (
        <ConnectToNearBtn />
      )}
    </div>
  );
}

function NoDataComponent(props: any) {
  const { isNoPool } = props;
  const [quickOptions, setQuickOptions] = useState([5, 10, 20, 50]);
  return (
    <div
      className={`relative w-1/2 xs:w-full md:w-full flex flex-col justify-between flex-grow self-stretch xs:mt-5 md:mt-5`}
    >
      <div className="text-white font-bold text-base">
        <FormattedMessage
          id="set_price_range"
          defaultMessage="Set Price Range"
        ></FormattedMessage>
      </div>
      {isNoPool ? (
        <div className="flex justify-center items-center absolute w-full text-sm text-v3poolWarningColor top-28 xsm:top-16 z-10">
          <FormattedMessage id="no_pool_tip"></FormattedMessage>
        </div>
      ) : null}
      <div className="flex flex-col justify-between relative flex-grow bg-v3BlackColor rounded-xl px-4 py-7 mt-3 xs:px-2 md:px-2 opacity-50">
        {/* range chart area */}
        <div className="flex flex-col items-center justify-center mt-28 xsm:my-12">
          <EmptyIcon></EmptyIcon>
        </div>
        {/* input range area */}
        <div>
          <div className="flex items-center justify-between">
            <div className="w-1 flex-grow flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-3 mr-5 xs:mr-2 md:mr-2">
              <span className="text-sm text-primaryText">
                <FormattedMessage
                  id="min_price"
                  defaultMessage="Min Price"
                ></FormattedMessage>
              </span>
              <div className="flex items-center justify-between mt-3.5">
                <div className="flex w-6 h-6  flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor">
                  <ReduceButton></ReduceButton>
                </div>
                <input
                  type="number"
                  placeholder="0.0"
                  className="text-base mx-3 text-center"
                  disabled={true}
                />
                <div className="flex w-6 h-6  flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor">
                  <AddButton></AddButton>
                </div>
              </div>
            </div>
            <div className="w-1 flex-grow flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-2.5">
              <span className="text-sm text-primaryText">
                <FormattedMessage
                  id="max_price"
                  defaultMessage="Max Price"
                ></FormattedMessage>
              </span>
              <div className="flex items-center justify-between mt-3.5">
                <div className="flex w-6 h-6  flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor">
                  <ReduceButton></ReduceButton>
                </div>
                <input
                  type="number"
                  placeholder="0.0"
                  className="text-base mx-2 text-center"
                  disabled={true}
                />
                <div className="flex w-6 h-6 flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor">
                  <AddButton></AddButton>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <WarningMark className="text-sm flex-shrink-0 text-primaryText"></WarningMark>
            {quickOptions.map((item: number, index) => {
              return (
                <div
                  key={index}
                  className="flex items-center justify-center rounded-lg h-6 py-0.5 xs:px-1 md:px-1  lg:px-1.5  2xl:px-3.5 box-content font-sans text-v3LightGreyColor text-sm whitespace-nowrap"
                  style={{ border: '1px solid rgba(126, 138, 147, 0.2)' }}
                >
                  ± {item}%
                </div>
              );
            })}
            <div
              className="flex items-center justify-center rounded-lg h-6 py-0.5 xs:px-1 md:px-1  lg:px-1.5  2xl:px-3.5 box-content font-sans text-v3LightGreyColor text-sm whitespace-nowrap"
              style={{ border: '1px solid rgba(126, 138, 147, 0.2)' }}
            >
              Full Range
            </div>
          </div>
        </div>
      </div>

      <GradientButton
        color="#fff"
        className={`w-full h-10 mt-5 text-center text-base text-white focus:outline-none opacity-30`}
        disabled={true}
      >
        <ButtonTextWrapper
          loading={false}
          Text={() => (
            <>
              {isNoPool ? (
                <FormattedMessage id="no_pool" defaultMessage="No Pool" />
              ) : (
                <FormattedMessage
                  id="select_tokens"
                  defaultMessage="Select Tokens"
                />
              )}
            </>
          )}
        />
      </GradientButton>
    </div>
  );
}
function PointInputComponent({
  reduceOneSlot,
  addOneSlot,
  handlePriceToAppropriatePoint,
  customPrice,
  getPrice,
  setCustomPrice,
}: any) {
  return (
    <div className="flex items-center justify-between mt-3.5">
      <div
        className="flex w-6 h-6  flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor cursor-pointer"
        onClick={() => {
          reduceOneSlot('r');
        }}
      >
        <ReduceButton className="cursor-pointer"></ReduceButton>
      </div>
      <input
        type="number"
        placeholder="0.0"
        step="any"
        className="text-base mx-2 text-center"
        onBlur={handlePriceToAppropriatePoint}
        value={customPrice || getPrice()}
        onChange={({ target }) => {
          const inputPrice = target.value || '0';
          setCustomPrice(inputPrice);
        }}
      />
      <div
        className="flex w-6 h-6 flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor cursor-pointer"
        onClick={() => {
          addOneSlot('r');
        }}
      >
        <AddButton className="cursor-pointer"></AddButton>
      </div>
    </div>
  );
}
function OneSide({ show }: { show: boolean }) {
  return (
    <div
      className={`items-center relative rounded-xl bg-black bg-opacity-20 h-20 py-2.5 px-6 mt-3 ${
        show ? 'flex' : 'hidden'
      }`}
    >
      <BoxDarkBg className="absolute top-0 right-0"></BoxDarkBg>
      <SideIcon className="mr-5 flex-shrink-0"></SideIcon>
      <div className="relative z-10 text-white text-sm">
        <FormattedMessage
          id="maket_price_outside_single_only_tip"
          defaultMessage="The maket price is outside your price range.Single asset deposit only."
        ></FormattedMessage>
      </div>
    </div>
  );
}
function InvalidRange({ show }: { show: boolean }) {
  return (
    <div
      className={`items-center relative rounded-xl bg-black bg-opacity-20 h-20 py-2.5 px-6 mt-3 ${
        show ? 'flex' : 'hidden'
      }`}
    >
      <BoxDarkBg className="absolute top-0 right-0"></BoxDarkBg>
      <InvalidIcon className="mr-5"></InvalidIcon>
      <div className="relative z-10 text-white text-sm">
        <FormattedMessage
          id="maket_price_outside_tip"
          defaultMessage="The maket price is outside your price range."
        ></FormattedMessage>
      </div>
    </div>
  );
}
function InputAmount({
  token,
  balance,
  tokenPriceList,
  changeAmount,
  amount,
  currentSelectedPool,
  hidden,
}: {
  token: TokenMetadata;
  balance: string;
  tokenPriceList: Record<string, any>;
  changeAmount: any;
  amount: string;
  currentSelectedPool: PoolInfo;
  hidden: Boolean;
}) {
  const [inputPrice, setInputPrice] = useState('');
  const [showNearTip, setShowNearTip] = useState(false);
  useEffect(() => {
    const price = token ? tokenPriceList[token.id]?.price : '';
    if (price && amount) {
      setInputPrice(new BigNumber(price).multipliedBy(amount).toFixed());
    } else {
      setInputPrice('');
    }
    if (token?.id == WRAP_NEAR_CONTRACT_ID && amount) {
      const difference = new BigNumber(maxBalance).minus(amount);
      const b = difference.toFixed();
      const r = difference.isLessThan(0);
      if (r) {
        setShowNearTip(true);
      } else {
        setShowNearTip(false);
      }
    } else {
      setShowNearTip(false);
    }
  }, [amount, token, tokenPriceList.length]);
  function getBalance() {
    let r = '0';
    if (token && balance) {
      r = formatWithCommas(toPrecision(balance.toString(), 3));
    }
    return r;
  }
  function showCurrentPrice() {
    if (isNoPool) {
      return '$-';
    } else if (inputPrice) {
      return '$' + formatWithCommas(toPrecision(inputPrice.toString(), 3));
    }
    return '$-';
  }
  const maxBalance =
    token?.id !== WRAP_NEAR_CONTRACT_ID
      ? balance
      : Number(balance) <= 0.5
      ? '0'
      : String(Number(balance) - 0.5);
  const isNoPool = !currentSelectedPool?.pool_id;
  return (
    <div>
      <div
        className={`bg-black bg-opacity-20 rounded-xl p-3 mt-3 ${
          hidden ? 'hidden' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <input
            type="number"
            placeholder="0.0"
            className="text-2xl xs:text-xl md:text-xl"
            disabled={currentSelectedPool?.pool_id ? false : true}
            value={isNoPool ? '' : amount}
            step="any"
            onChange={({ target }) => {
              changeAmount(target.value);
            }}
          />
          <span
            className={`text-base font-bold ml-5 whitespace-nowrap ${
              currentSelectedPool?.pool_id
                ? 'text-white'
                : 'text-v3feeTextColor'
            }`}
          >
            {token ? toRealSymbol(token.symbol) : 'Selet Token'}
          </span>
        </div>
        <div
          className={`flex items-center justify-between mt-2.5 ${
            token ? 'visible' : 'invisible'
          }`}
        >
          <span className="text-xs text-primaryText">{showCurrentPrice()}</span>
          <div className="flex items-center text-xs text-primaryText text-right">
            <span title={balance}>
              <FormattedMessage id="balance" />: {getBalance()}
            </span>
            <span
              onClick={() => {
                changeAmount(maxBalance);
              }}
              className={`ml-2.5 text-xs text-farmText px-1.5 py-0.5 rounded-lg border cursor-pointer hover:text-greenColor hover:border-greenColor ${
                amount == maxBalance
                  ? 'bg-black bg-opacity-20 border-black border-opacity-20'
                  : 'border-maxBorderColor'
              }`}
            >
              Max
            </span>
          </div>
        </div>
      </div>
      {showNearTip && !isNoPool ? (
        <div className="flex items-center text-sm text-warnColor mt-2.5">
          <WarningIcon className="ml-2.5 mr-2"></WarningIcon>
          <FormattedMessage
            id="near_validation_error"
            defaultMessage="Must have 0.5N or more left in wallet for gas fee."
          />
        </div>
      ) : null}
    </div>
  );
}
function getAllTokens(refTokens: TokenMetadata[], triTokens: TokenMetadata[]) {
  triTokens.forEach((tk) => {
    const tokenInRef = refTokens.find((token) => token.id === tk.id);
    if (tokenInRef) {
      tokenInRef.onTri = true;
    } else {
      refTokens.push(tk);
    }
  });

  return refTokens;
}
