import React, { useState, useContext, useEffect } from 'react';
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
} from '../../services/commonV3';
import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
  toNonDivisibleNumber,
  checkAllocations,
} from '~utils/numbers';
import { WalletContext } from '../../utils/sender-wallet';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import { toRealSymbol } from '../../utils/token';
import ReactTooltip from 'react-tooltip';

export default function AddYourLiquidityPageV3() {
  const [tokenX, setTokenX] = useState<TokenMetadata>(null);
  const [tokenY, setTokenY] = useState<TokenMetadata>(null);
  const [tokenXAmount, setTokenXAmount] = useState('');
  const [tokenYAmount, setTokenYAmount] = useState('');
  const [listPool, setListPool] = useState<PoolInfo[]>([]);
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const [currentPools, setCurrentPools] = useState<Record<string, PoolInfo>>(
    {}
  );
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
  const history = useHistory();
  const triTokenIds = useTriTokenIdsOnRef();
  const refTokens = useWhitelistTokens((triTokenIds || []).concat(['aurora']));
  const triTokens = useTriTokens();
  const balances = useTokenBalances();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const nearBalance = useDepositableBalance('NEAR');
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
      searchPools(tokenx, tokeny, +pool_fee);
    }
  }
  function goYourLiquidityPage() {
    history.push('/yoursLiquidity');
  }
  async function get_list_pools() {
    const list: PoolInfo[] = await list_pools();
    if (list.length > 0) {
      setListPool(list);
    }
  }
  function searchPools(
    tokenX: TokenMetadata,
    tokenY: TokenMetadata,
    fee?: number
  ) {
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
        let totalLiquidity = 0;
        let percents: string[];
        const liquidityList: number[] = availablePools.map((p: PoolInfo) => {
          return +p.liquidity || 0;
        });
        totalLiquidity = _.sum(liquidityList);
        if (totalLiquidity == 0) {
          percents = ['0', '0', '0', '0'];
        } else
          percents = checkAllocations(
            '100',
            liquidityList.map((c) => ((c / totalLiquidity) * 100).toFixed())
          );
        const maxPercent = _.max(percents);
        availablePools.forEach((pool: PoolInfo, index) => {
          const f = pool.fee;
          const temp: PoolInfo = {
            ...pool,
            percent: percents[index],
          };
          currentPoolsMap[f] = temp;
          if (percents[index] == maxPercent) {
            setCurrentSelectedPool(temp);
          }
        });
        setCurrentPools(currentPoolsMap);
      } else {
        setCurrentPools({});
        setCurrentSelectedPool({ fee: DEFAULTSELECTEDFEE });
      }
    } else {
      setCurrentPools({});
      if (tokenX && tokenY) {
        setCurrentSelectedPool({ fee: DEFAULTSELECTEDFEE });
      }
    }
    if (fee) {
      setCurrentSelectedPool(currentPoolsMap[fee] || { fee });
    }
  }
  function switchSelectedFee(fee: number) {
    if (tokenX && tokenY) {
      const pool = currentPools[fee];
      setCurrentSelectedPool(pool || { fee });
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
      // setTokenYAmount('');
      return '';
    } else {
      const L =
        +amount *
        ((Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1)) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - currentPoint) - 1));
      const Y =
        L *
        ((Math.pow(Math.sqrt(CONSTANT_D), currentPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
          (Math.sqrt(CONSTANT_D) - 1));
      const decimalsRate =
        Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
      const Y_result = Y * decimalsRate;
      // setTokenYAmount(Y_result.toString());
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
      // setTokenXAmount('');
      return '';
    } else {
      const L =
        +amount *
        ((Math.sqrt(CONSTANT_D) - 1) /
          (Math.pow(Math.sqrt(CONSTANT_D), currentPoint) -
            Math.pow(Math.sqrt(CONSTANT_D), leftPoint)));
      const X =
        L *
        ((Math.pow(Math.sqrt(CONSTANT_D), rightPoint - currentPoint) - 1) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
            Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1)));
      const decimalsRate =
        Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
      const X_result = X * decimalsRate;
      // setTokenXAmount(X_result.toString());
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
      setTokenYAmount('');
      return;
    }
    // can only add y token
    if (rightPoint <= currentPoint) {
      setOnlyAddYToken(true);
      setTokenXAmount('');
      return;
    }
    const { token_x, token_y } = currentSelectedPool;
    const sort = tokenX.id == token_x;
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
          amount: tokenXAmount,
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
  }
  const tokenSort = tokenX?.id == currentSelectedPool?.token_x;
  return (
    <div className="relative flex flex-col lg:w-2/3 xl:w-3/5 md:w-5/6 xs:w-11/12 m-auto text-white rounded-2xl">
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
          className="relative z-10 py-5 px-7"
          style={{
            background: 'linear-gradient(180deg, #26343E 0%, #1D2932 100%)',
          }}
        >
          <div className="relative flex items-center justify-center">
            <ReturnIcon
              className="absolute left-1 cursor-pointer"
              onClick={goYourLiquidityPage}
            ></ReturnIcon>
            <span className="text-v3LightGreyColor text-xl">
              <FormattedMessage id="add_liquidity"></FormattedMessage>
            </span>
          </div>
          <div className="flex items-start justify-between mt-7">
            {/* left area */}
            <div className="w-1/2 mr-7 flex-shrink-0">
              <div className="text-white font-bold text-base">
                Select Tokens
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
                            : 'bg-primaryGradient'
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
                          <>Select Token</>
                        )}
                        <SelectIcon></SelectIcon>
                      </div>
                    }
                    onSelect={(token) => {
                      if (tokenY && tokenY.id == token.id) return;
                      setTokenX(token);
                      setTokenXBalanceFromNear(token?.near?.toString());
                      searchPools(token, tokenY);
                    }}
                    balances={balances}
                  />
                </div>
                <SwitchLRButton
                  className="mx-2 cursor-pointer"
                  onClick={switchButtonSort}
                ></SwitchLRButton>
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
                            : 'bg-primaryGradient'
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
                          <>Select Token</>
                        )}
                        <SelectIcon></SelectIcon>
                      </div>
                    }
                    onSelect={(token: TokenMetadata) => {
                      if (tokenX && tokenX.id == token.id) return;
                      setTokenY(token);
                      setTokenYBalanceFromNear(token?.near?.toString());
                      searchPools(tokenX, token);
                    }}
                    balances={balances}
                  />
                </div>
              </div>
              <div
                className="rounded-xl px-4 py-3 mt-5"
                style={{ border: '1.2px solid rgba(145, 162, 174, 0.2)' }}
              >
                <div className="flex justify-between items-center">
                  <div className="text-white text-base mt-1">Fee Tiers</div>
                  <div
                    onClick={switchFeeBoxStatus}
                    className="p-1.5 rounded-lg cursor-pointer"
                    style={{ border: '1.2px solid rgba(145, 162, 174, 0.2)' }}
                  >
                    <SwitchIcon
                      className={`hover:text-senderHot ${
                        feeBoxStatus ? 'text-senderHot' : 'text-v3feeTextColor'
                      }`}
                    ></SwitchIcon>
                  </div>
                </div>
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
                        } ${index == 3 ? '' : 'mr-2.5'} ${
                          currentSelectedPool?.fee == fee
                            ? 'gradientBorderWrapperNoShadow'
                            : 'border border-v3feeBorderColor p-px'
                        }`}
                      >
                        <div className="flex flex-col items-center  px-1 py-3">
                          <span className="text-sm text-white">
                            {fee / 10000}%
                          </span>
                          <div className="text-v3feeTextColor text-xs text-center mt-2">
                            {text}
                          </div>
                          <div
                            className={`flex items-center justify-center w-full py-1 rounded-xl bg-black bg-opacity-20 text-xs text-v3LightGreyColor mt-2 ${
                              tokenX && tokenY ? '' : 'hidden'
                            }`}
                          >
                            {currentPools[fee]
                              ? (currentPools[fee].percent || '0') +
                                '%' +
                                ' select'
                              : 'No Pool'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div
                  className={` items-center mt-3 ${
                    feeBoxStatus || !currentSelectedPool ? 'hidden' : 'flex'
                  }`}
                >
                  <span className="text-base text-white mr-3">
                    {currentSelectedPool
                      ? currentSelectedPool.fee / 10000 + '%'
                      : ''}
                  </span>
                  <div className="text-sm text-v3SwapGray px-2.5 py-0.5 bg-black bg-opacity-20 rounded-2xl">
                    {currentSelectedPool?.pool_id
                      ? `${(currentSelectedPool.percent || 0) + '%'} select`
                      : 'No Pool'}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-base text-white">Input Amount</span>
                <OneSide
                  show={onlyAddYToken || onlyAddXToken ? true : false}
                ></OneSide>
                <InvalidRange show={invalidRange ? true : false}></InvalidRange>
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
            {currentSelectedPool && !currentSelectedPool.pool_id ? (
              <CreatePoolComponent
                currentSelectedPool={currentSelectedPool}
                tokenX={tokenX}
                tokenY={tokenY}
                tokenPriceList={tokenPriceList}
              ></CreatePoolComponent>
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
  );
}
function CreatePoolComponent({
  currentSelectedPool,
  tokenX,
  tokenY,
  tokenPriceList,
}: {
  currentSelectedPool: PoolInfo;
  tokenX: TokenMetadata;
  tokenY: TokenMetadata;
  tokenPriceList: Record<string, any>;
}) {
  const [createPoolButtonLoading, setCreatePoolButtonLoading] = useState(false);
  const [createPoolRate, setCreatePoolRate] = useState<string>('');
  const [rateStatus, setRateStatus] = useState(true);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
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
    const arr = [tokenX.symbol, tokenY.symbol];
    arr.sort();
    if (arr[1] !== tokenX.symbol) {
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
    <div className={`flex flex-col justify-between flex-grow self-stretch`}>
      <div className="text-white font-bold text-base">Initialize the pool:</div>
      <div className="relative flex-grow bg-black bg-opacity-10 rounded-xl px-4 py-7 mt-3">
        <BgIcon className="absolute right-0 top-0"></BgIcon>
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <p className="text-sm text-white">
              This pool is not initialized before. To initialize, select a
              starting price for the pool and the enter your liquidity price
              range and deposit amount.
            </p>
            <p className="text-sm text-v3WarningColor mt-1">
              Gas fees will be higher than usual!
            </p>
          </div>
          <div>
            <p className="text-base text-white">Starting Price</p>
            <div className="flex items-center justify-between mt-3">
              <span className="whitespace-nowrap mr-2">
                1 {toRealSymbol(tokenX?.symbol)} =
              </span>
              <div className="flex items-center justify-between rounded-xl bg-black bg-opacity-20 px-3 h-12">
                <input
                  type="number"
                  placeholder="0.0"
                  className="text-xl font-bold"
                  onChange={({ target }) => {
                    setCreatePoolRate(target.value);
                  }}
                />
                <span className="text-base text-white ml-3">
                  {toRealSymbol(tokenY?.symbol)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3.5">
              <span className="text-xs text-v3LightGreyColor">
                Current Price
              </span>
              <div className="flex items-center text-xs text-white">
                {rateStatus ? (
                  <div className="mr-0.5">
                    1 {toRealSymbol(tokenX?.symbol)}
                    <span className="text-v3LightGreyColor mx-0.5">
                      ({getCurrentPriceValue(tokenX)})
                    </span>
                    = {createPoolRate} {toRealSymbol(tokenY?.symbol)}
                  </div>
                ) : (
                  <div className="mr-0.5">
                    1 {toRealSymbol(tokenY?.symbol)}
                    <span className="text-v3LightGreyColor mx-0.5">
                      ({getCurrentPriceValue(tokenY)})
                    </span>
                    = {getPoolRate()} {toRealSymbol(tokenX?.symbol)}
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
          className={`w-full h-10 mt-5 text-center text-base text-white focus:outline-none ${
            !createPoolRate ? 'opacity-40' : ''
          }`}
          loading={createPoolButtonLoading}
          disabled={createPoolButtonLoading || !createPoolRate}
          btnClassName={`${!createPoolRate ? 'cursor-not-allowed' : ''}`}
          onClick={createPool}
        >
          <ButtonTextWrapper
            loading={createPoolButtonLoading}
            Text={() => <>Create a Pool</>}
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
  const [leftPoint, setLeftPoint] = useState<number>(0);
  const [rightPoint, setRightPoint] = useState<number>(0);
  const [currentPoint, setCurrentPoint] = useState<number>();
  const [addLiquidityButtonLoading, setAddLiquidityButtonLoading] =
    useState(false);
  const [currentCheckedQuickOption, setCurrentCheckedQuickOption] = useState<
    number | string
  >();
  const [quickOptions, setQuickOptions] = useState([5, 10, 20, 50]);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const intl = useIntl();
  const { token_x, token_y } = currentSelectedPool;
  const token_x_decimals =
    tokenX.id == token_x ? tokenX.decimals : tokenY.decimals;
  const token_y_decimals =
    tokenY.id == token_y ? tokenY.decimals : tokenX.decimals;
  // init
  useEffect(() => {
    const { point_delta, current_point, token_x, token_y } =
      currentSelectedPool;
    setCurrentPoint(current_point);
    setCurrentCheckedQuickOption(10);
    const c_price = getCurrentPrice_real_decimal();
    const decimalRate =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    const tokenSort = tokenX.id == token_x ? true : false;
    if (tokenSort) {
      // -10%
      const l_price = new BigNumber(c_price).multipliedBy(0.9).toFixed();
      const point_l = getPointByPrice(
        point_delta,
        l_price.toString(),
        decimalRate
      );
      setLeftPoint(point_l);
      // +10%
      const r_price = new BigNumber(c_price).multipliedBy(1.1).toFixed();
      const point_r = getPointByPrice(
        point_delta,
        r_price.toString(),
        decimalRate
      );
      setRightPoint(point_r);
    } else {
      const c_price2 = new BigNumber(1).dividedBy(c_price).toFixed();
      // +10%
      const priceAdd = new BigNumber(c_price2).multipliedBy(1.1);
      const l_price_2 = new BigNumber(1).dividedBy(priceAdd).toFixed();
      const point_l_2 = getPointByPrice(
        point_delta,
        l_price_2.toString(),
        decimalRate
      );
      setLeftPoint(point_l_2);
      // -10%
      const priceDivide = new BigNumber(c_price2).multipliedBy(0.9);
      const r_price_2 = new BigNumber(1).dividedBy(priceDivide).toFixed();
      const point_r_2 = getPointByPrice(
        point_delta,
        r_price_2.toString(),
        decimalRate
      );
      setRightPoint(point_r_2);
    }
  }, [currentSelectedPool]);
  useEffect(() => {
    pointChange({ leftPoint, rightPoint, currentPoint });
  }, [leftPoint, rightPoint]);
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
      setRightPoint(Math.max(Math.min(POINTRIGHTRANGE, r_p), POINTLEFTRANGE));
    }
  }
  function reduceOneSlot(direction: string) {
    const { point_delta } = currentSelectedPool;
    const l_p = leftPoint - point_delta;
    const r_p = rightPoint - point_delta;
    if (direction == 'l') {
      setLeftPoint(Math.max(Math.min(POINTRIGHTRANGE, l_p), POINTLEFTRANGE));
    } else if (direction == 'r') {
      setRightPoint(Math.max(Math.min(POINTRIGHTRANGE, r_p), POINTLEFTRANGE));
    }
  }
  function handlePriceToAppropriatePoint() {
    setCurrentCheckedQuickOption('');
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
    const { point_delta } = currentSelectedPool;
    const decimalRateTurn =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    if (item == 'full') {
      setLeftPoint(-800000);
      setRightPoint(800000);
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
    setCurrentCheckedQuickOption(item);
  }
  function getButtonText() {
    let txt = 'Add Liquidity';
    if (invalidRange) {
      txt = 'Update Range';
    } else if (onlyAddXToken && +tokenXAmount == 0) {
      txt = 'Input Amount';
    } else if (onlyAddYToken && +tokenYAmount == 0) {
      txt = 'Input Amount';
    } else if (
      !onlyAddXToken &&
      !onlyAddYToken &&
      (+tokenXAmount == 0 || +tokenYAmount == 0)
    ) {
      txt = 'Input Amount';
    } else if (
      +tokenXAmount > 0 &&
      new BigNumber(tokenXAmount).isGreaterThan(
        getMax(tokenX, tokenXBalanceFromNear)
      )
    ) {
      txt = 'Not Enough Balance';
    } else if (
      +tokenYAmount > 0 &&
      new BigNumber(tokenYAmount).isGreaterThan(
        getMax(tokenY, tokenYBalanceFromNear)
      )
    ) {
      txt = 'Not Enough Balance';
    }
    return txt;
  }
  function getPriceTip() {
    const tip = intl.formatMessage({ id: 'farmRewardsCopy' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  const tokenSort = tokenX.id == currentSelectedPool.token_x;
  const isAddLiquidityDisabled = getButtonStatus();
  return (
    <div className={`flex flex-col justify-between flex-grow self-stretch`}>
      <div className="text-white font-bold text-base">Set Price Range</div>
      <div className="flex flex-col justify-between relative flex-grow bg-v3BlackColor rounded-xl px-4 py-7 mt-3">
        <div className="flex items-center justify-between mt-3.5">
          <span className="text-xs text-v3LightGreyColor">Current Price</span>
          <div className="flex items-center text-xs text-white">
            1 {toRealSymbol(tokenX?.symbol)}
            <span className="text-v3LightGreyColor ml-0.5">
              ({getCurrentPriceValue()})
            </span>{' '}
            = {getCurrentPrice()} {toRealSymbol(tokenY?.symbol)}
          </div>
        </div>
        {/* range chart area */}
        <div className=""></div>
        {/* input range area */}
        <div>
          <div className="flex items-center justify-between">
            <div className="w-1 flex-grow flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-3 mr-5">
              <span className="text-sm text-primaryText">Min Price</span>
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
              <span className="text-sm text-primaryText">Max Price</span>
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
              className="ml-2 text-sm"
              data-type="info"
              data-place="top"
              data-multiline={true}
              data-class="reactTip"
              data-html={true}
              data-tip={getPriceTip()}
              data-for="priceTipId"
            >
              <WarningMark className="flex-shrink-0 cursor-pointer"></WarningMark>
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
                  className={`flex items-center justify-center rounded-lg h-6 py-0.5 px-3.5 box-content cursor-pointer font-sans text-sm border ${
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
              className={`flex items-center justify-center rounded-lg h-6 py-0.5 px-3.5 box-content cursor-pointer font-sans text-sm border ${
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
        className={`items-center justify-center bg-black bg-opacity-20 rounded-lg mt-2.5 px-4 py-3 ${
          onlyAddXToken || onlyAddYToken ? 'flex' : 'hidden'
        }`}
      >
        <WarningIcon className="flex-shrink-0"></WarningIcon>
        <div className="text-sm text-v3WarningColor ml-3">
          Your position will not earn fees or be used in trades until the market
          price moves into your range.
        </div>
      </div>
      <div
        className={`items-center justify-center bg-black bg-opacity-20 rounded-lg mt-2.5 px-4 py-3 ${
          invalidRange ? 'flex' : 'hidden'
        }`}
      >
        <WarningIcon className="flex-shrink-0"></WarningIcon>
        <div className="text-sm text-v3WarningColor ml-3">
          Invalid range selected. The min price must be lower than the max
          price.
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
            Text={() => (
              // <FormattedMessage
              //   id="add_liquidity"
              //   defaultMessage="Add Liquidity"
              // />
              <>{getButtonText()}</>
            )}
          />
        </GradientButton>
      ) : (
        <ConnectToNearBtn />
      )}
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
function NoDataComponent() {
  const [quickOptions, setQuickOptions] = useState([1, 3, 5, 10]);
  return (
    <div className={`flex flex-col justify-between flex-grow self-stretch`}>
      <div className="text-white font-bold text-base">Set Price Range</div>
      <div className="flex flex-col justify-between relative flex-grow bg-v3BlackColor rounded-xl px-4 py-7 mt-3 opacity-50">
        {/* range chart area */}
        <div className="flex justify-center mt-24">
          <EmptyIcon></EmptyIcon>
        </div>
        {/* input range area */}
        <div>
          <div className="flex items-center justify-between">
            <div className="w-1 flex-grow flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-3 mr-5">
              <span className="text-sm text-primaryText">Min Price</span>
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
              <span className="text-sm text-primaryText">Max Price</span>
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
            {quickOptions.map((item: number, index) => {
              return (
                <div
                  key={index}
                  className="flex items-center justify-center rounded-lg h-6 py-0.5 px-3.5 box-content font-sans text-v3LightGreyColor text-sm"
                  style={{ border: '1px solid rgba(126, 138, 147, 0.2)' }}
                >
                  ± {item}%
                </div>
              );
            })}
            <div
              className="flex items-center justify-center rounded-lg h-6 py-0.5 px-3.5 box-content font-sans text-v3LightGreyColor text-sm"
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
        <ButtonTextWrapper loading={false} Text={() => <>Select Tokens</>} />
      </GradientButton>
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
        The maket price is outside your price range.Single asset deposit only.
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
        The maket price is outside your price range.
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
  useEffect(() => {
    const price = token ? tokenPriceList[token.id]?.price : '';
    if (price && amount) {
      setInputPrice(new BigNumber(price).multipliedBy(amount).toFixed());
    } else {
      setInputPrice('');
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
    if (inputPrice) {
      return '$' + formatWithCommas(toPrecision(inputPrice.toString(), 3));
    }
    return '$-';
  }
  return (
    <div
      className={`bg-black bg-opacity-20 rounded-xl p-3 mt-3 ${
        hidden ? 'hidden' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <input
          type="number"
          placeholder="0.0"
          className="text-2xl"
          disabled={currentSelectedPool?.pool_id ? false : true}
          value={amount}
          onChange={({ target }) => {
            changeAmount(target.value);
          }}
        />
        <span
          className={`text-base font-bold ml-5 whitespace-nowrap ${
            currentSelectedPool?.pool_id ? 'text-white' : 'text-v3feeTextColor'
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
        <div className="flex items-center text-xs text-primaryText">
          <span title={balance}>
            <FormattedMessage id="balance" />: {getBalance()}
          </span>
          <span
            onClick={() => {
              const maxBalance =
                token.id !== WRAP_NEAR_CONTRACT_ID
                  ? balance
                  : Number(balance) <= 0.5
                  ? '0'
                  : String(Number(balance) - 0.5);
              changeAmount(maxBalance);
            }}
            className={`ml-2.5 text-xs text-farmText px-1.5 py-0.5 rounded-lg border cursor-pointer hover:text-greenColor hover:border-greenColor ${
              false
                ? 'bg-black bg-opacity-20 border-black border-opacity-20'
                : 'border-maxBorderColor'
            }`}
          >
            Max
          </span>
        </div>
      </div>
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
