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
import { TokenMetadata, ftGetBalance } from '../../services/ft-contract';
import { getTokenPriceList } from '../../services/indexer';
import { useTokenBalances, useDepositableBalance } from '../../state/token';
import Loading from '~components/layout/Loading';
import { list_pools, add_liquidity, create_pool } from '../../services/swapV3';
import { WRAP_NEAR_CONTRACT_ID } from '../../services/wrap-near';
import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
  percentLess,
  calculateFairShare,
  toNonDivisibleNumber,
  percent,
  checkAllocations,
} from '~utils/numbers';
import { WalletContext } from '../../utils/sender-wallet';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import { toRealSymbol } from '../../utils/token';

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
  const [onlyAddYToken, setOnlyAddYToken] = useState(false);
  const [onlyAddXToken, setOnlyAddXToken] = useState(false);
  const [invalidRange, setInvalidRange] = useState(false);
  const [tokenXBalanceFromNear, setTokenXBalanceFromNear] = useState<string>();
  const [tokenYBalanceFromNear, setTokenYBalanceFromNear] = useState<string>();
  const [leftPoint, setLeftPoint] = useState<number>(0);
  const [rightPoint, setRightPoint] = useState<number>(0);
  const [currentPoint, setCurrentPoint] = useState<number>();
  const [currentSelectedPool, setCurrentSelectedPool] =
    useState<PoolInfo>(null);
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
    getTokenPriceList().then(setTokenPriceList);
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

  if (!refTokens || !triTokens || !triTokenIds) return <Loading />;
  const allTokens = getAllTokens(refTokens, triTokens);
  const nearSwapTokens = allTokens.filter((token) => token.onRef);

  function goYourLiquidityPage() {
    history.push('/yoursV3');
  }
  async function get_list_pools() {
    const list: PoolInfo[] = await list_pools();
    if (list.length > 0) {
      setListPool(list);
    }
  }
  function searchPools(tokenX: TokenMetadata, tokenY: TokenMetadata) {
    if (listPool.length > 0 && tokenX && tokenY) {
      const availablePools: PoolInfo[] = listPool.filter((pool: PoolInfo) => {
        // TODO 增加pool 状态的判断
        const { token_x, token_y, state } = pool;
        if (token_x == tokenX.id && token_y == tokenY.id) return true;
      });
      if (availablePools.length > 0) {
        const currentPoolsMap = {};
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
        setCurrentSelectedPool({ fee: defaultSelectedFee });
      }
    } else {
      setCurrentPools({});
      if (tokenX && tokenY) {
        setCurrentSelectedPool({ fee: defaultSelectedFee });
      }
    }
  }
  function switchSelectedFee(fee: number) {
    if (tokenX && tokenY) {
      const pool = currentPools[fee];
      setCurrentSelectedPool(pool || { fee });
    }
  }
  function changeTokenXAmount(amount: string = '0') {
    setTokenXAmount(amount);
    if (!onlyAddXToken) {
      getTokenYAmountByCondition({
        amount,
        leftPoint: leftPoint,
        rightPoint: rightPoint,
        currentPoint: currentPoint,
      });
    }
  }
  function changeTokenYAmount(amount: string = '0') {
    setTokenYAmount(amount);
    if (!onlyAddYToken) {
      getTokenXAmountByCondition({
        amount,
        leftPoint,
        rightPoint,
        currentPoint,
      });
    }
  }
  function getTokenYAmountByCondition({
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
    if (+amount == 0) {
      setTokenYAmount('');
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
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      const Y_result = Y * decimalsRate;
      setTokenYAmount(Y_result.toString());
    }
  }
  function getTokenXAmountByCondition({
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
    if (+amount == 0) {
      setTokenXAmount('');
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
        Math.pow(10, tokenY.decimals) / Math.pow(10, tokenX.decimals);
      const X_result = X * decimalsRate;
      setTokenXAmount(X_result.toString());
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
    if (leftPoint >= currentPoint) {
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
    if (tokenXAmount) {
      getTokenYAmountByCondition({
        amount: tokenXAmount,
        leftPoint,
        rightPoint,
        currentPoint,
      });
    } else if (tokenYAmount) {
      getTokenXAmountByCondition({
        amount: tokenYAmount,
        leftPoint,
        rightPoint,
        currentPoint,
      });
    }
  }
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
                <div className="flex flex-grow">
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
                <AddIcon className="mx-2"></AddIcon>
                <div className="flex flex-grow">
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
                  {feeList.map((feeItem, index) => {
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
                  hidden={onlyAddYToken || invalidRange ? true : false}
                ></InputAmount>
                <InputAmount
                  token={tokenY}
                  balance={tokenYBalanceFromNear}
                  tokenPriceList={tokenPriceList}
                  amount={tokenYAmount}
                  changeAmount={changeTokenYAmount}
                  currentSelectedPool={currentSelectedPool}
                  hidden={onlyAddXToken || invalidRange ? true : false}
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
    const pointDelta = pointDeltaMap[fee];
    const decimalRate =
      Math.pow(10, tokenY.decimals) / Math.pow(10, tokenX.decimals);
    const init_point = getPointByPrice(pointDelta, createPoolRate, decimalRate);
    create_pool({
      token_a: tokenX.id,
      token_b: tokenY.id,
      fee: currentSelectedPool.fee,
      init_point,
    });
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
                    1 {toRealSymbol(tokenX?.symbol)} = {createPoolRate}{' '}
                    {toRealSymbol(tokenY?.symbol)}
                    <span className="text-v3LightGreyColor ml-0.5">
                      ({getCurrentPriceValue(tokenX)})
                    </span>
                  </div>
                ) : (
                  <div className="mr-0.5">
                    1 {toRealSymbol(tokenY?.symbol)} = {getPoolRate()}{' '}
                    {toRealSymbol(tokenX?.symbol)}
                    <span className="text-v3LightGreyColor ml-0.5">
                      ({getCurrentPriceValue(tokenY)})
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
  const [leftCustomPrice, setLeftCustomPrice] = useState('');
  const [rightCustomPrice, setRightCustomPrice] = useState('');
  const [leftPoint, setLeftPoint] = useState<number>(0);
  const [rightPoint, setRightPoint] = useState<number>(0);
  const [initLeftPoint, setInitLeftPoint] = useState<number>(0);
  const [initRightPoint, setiInitRightPoint] = useState<number>(0);
  const [currentPoint, setCurrentPoint] = useState<number>();
  const [addLiquidityButtonLoading, setAddLiquidityButtonLoading] =
    useState(false);
  const [currentCheckedQuickOption, setCurrentCheckedQuickOption] = useState<
    number | string
  >();
  const [quickOptions, setQuickOptions] = useState([1, 3, 5, 10]);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  // init
  useEffect(() => {
    const { point_delta, current_point } = currentSelectedPool;
    setCurrentPoint(current_point);
    setCurrentCheckedQuickOption('');
    const c_price = getCurrentPrice_decimal();
    const decimalRate =
      Math.pow(10, tokenY.decimals) / Math.pow(10, tokenX.decimals);
    // -50%
    const l_price = +c_price / 2;
    const point_l = getPointByPrice(
      point_delta,
      l_price.toString(),
      decimalRate
    );
    setLeftPoint(point_l);
    setInitLeftPoint(point_l);
    // 100%
    const r_price = +c_price * 2;
    const point_r = getPointByPrice(
      point_delta,
      r_price.toString(),
      decimalRate
    );
    setRightPoint(point_r);
    setiInitRightPoint(point_r);
  }, [currentSelectedPool]);
  useEffect(() => {
    pointChange({ leftPoint, rightPoint, currentPoint });
  }, [leftPoint, rightPoint]);
  function getCurrentPrice() {
    const price = getCurrentPrice_decimal();
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
  function getCurrentPrice_decimal() {
    if (currentSelectedPool && currentSelectedPool.pool_id) {
      const { current_point } = currentSelectedPool;
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
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
    if (leftCustomPrice) {
      const { point_delta } = currentSelectedPool;
      const decimalRate =
        Math.pow(10, tokenY.decimals) / Math.pow(10, tokenX.decimals);
      const c_point = getPointByPrice(
        point_delta,
        leftCustomPrice,
        decimalRate
      );
      setLeftCustomPrice('');
      setLeftPoint(c_point);
    }
    if (rightCustomPrice) {
      const { point_delta } = currentSelectedPool;
      const decimalRate =
        Math.pow(10, tokenY.decimals) / Math.pow(10, tokenX.decimals);
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
      condition2 =
        +tokenXAmount > 0 &&
        new BigNumber(
          getMax(tokenX, tokenXBalanceFromNear)
        ).isGreaterThanOrEqualTo(tokenXAmount);
    } else if (onlyAddYToken) {
      condition2 =
        +tokenYAmount > 0 &&
        new BigNumber(
          getMax(tokenY, tokenYBalanceFromNear)
        ).isGreaterThanOrEqualTo(+tokenYAmount);
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
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      const price = getPriceByPoint(leftPoint, decimalRate);
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
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      const price = getPriceByPoint(rightPoint, decimalRate);
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
      amount_x: toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0'),
      amount_y: toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0'),
      token_x: tokenX,
      token_y: tokenY,
    });
  }
  function changePoint(item: string | number) {
    if (currentCheckedQuickOption == item) return;
    const { point_delta } = currentSelectedPool;
    const decimalRateTurn =
      Math.pow(10, tokenY.decimals) / Math.pow(10, tokenX.decimals);
    if (item == 'full') {
      setLeftPoint(-800000);
      setRightPoint(800000);
    } else {
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      const price_l = getPriceByPoint(initLeftPoint, decimalRate);
      const price_r = getPriceByPoint(initRightPoint, decimalRate);
      const price_l_new = new BigNumber(1 - +item / 100)
        .multipliedBy(price_l)
        .toFixed();
      const price_r_new = new BigNumber(1 + +item / 100)
        .multipliedBy(price_r)
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
  const isAddLiquidityDisabled = getButtonStatus();
  return (
    <div className={`flex flex-col justify-between flex-grow self-stretch`}>
      <div className="text-white font-bold text-base">Set Price Range</div>
      <div className="flex flex-col justify-between relative flex-grow bg-v3BlackColor rounded-xl px-4 py-7 mt-3">
        <div className="flex items-center justify-between mt-3.5">
          <span className="text-xs text-v3LightGreyColor">Current Price</span>
          <div className="flex items-center text-xs text-white">
            1 {toRealSymbol(tokenX?.symbol)} = {getCurrentPrice()}{' '}
            {toRealSymbol(tokenY?.symbol)}
            <span className="text-v3LightGreyColor ml-0.5">
              ({getCurrentPriceValue()})
            </span>
          </div>
        </div>
        {/* range chart area */}
        <div className=""></div>
        {/* input range area */}
        <div>
          <div className="flex items-center justify-between">
            <div className="w-1 flex-grow flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-3 mr-5">
              <span className="text-sm text-primaryText">Min Price</span>
              <div className="flex items-center justify-between mt-3.5">
                <div
                  className="flex w-6 h-6  flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor cursor-pointer"
                  onClick={() => {
                    reduceOneSlot('l');
                  }}
                >
                  <ReduceButton className="cursor-pointer"></ReduceButton>
                </div>
                <input
                  type="number"
                  placeholder="0.0"
                  className="text-base mx-3 text-center"
                  onBlur={handlePriceToAppropriatePoint}
                  value={leftCustomPrice || getLeftPrice()}
                  onChange={({ target }) => {
                    const inputPrice = target.value || '0';
                    setLeftCustomPrice(inputPrice);
                  }}
                />
                <div
                  className="flex w-6 h-6  flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor cursor-pointer"
                  onClick={() => {
                    addOneSlot('l');
                  }}
                >
                  <AddButton className="cursor-pointer"></AddButton>
                </div>
              </div>
            </div>
            <div className="w-1 flex-grow flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-2.5">
              <span className="text-sm text-primaryText">Max Price</span>
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
                  value={rightCustomPrice || getRightPrice()}
                  onChange={({ target }) => {
                    const inputPrice = target.value || '0';
                    setRightCustomPrice(inputPrice);
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
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            {quickOptions.map((item: number, index) => {
              return (
                <div
                  onClick={() => {
                    changePoint(item);
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
                changePoint('full');
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
      <SideIcon className="mr-5"></SideIcon>
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
  const [inputValue, setInputValue] = useState('');
  const [inputPrice, setInputPrice] = useState('');
  useEffect(() => {
    const price = token ? tokenPriceList[token.id]?.price : '';
    if (token && price && inputValue) {
      setInputPrice(new BigNumber(price).multipliedBy(inputValue).toFixed());
    } else {
      setInputPrice('');
    }
  }, [inputValue, token, tokenPriceList.length]);
  function getBalance() {
    let r = '0';
    if (token) {
      r = formatWithCommas(toPrecision(balance.toString(), 3));
    }
    return r;
  }
  function showCurrentPrice() {
    if (inputPrice) {
      return '$' + formatWithCommas(toPrecision(inputPrice.toString(), 3));
    }
    if (amount) {
      return '$' + formatWithCommas(toPrecision(amount.toString(), 3));
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
            setInputValue(target.value);
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
              setInputValue(maxBalance);
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
interface PoolInfo {
  pool_id?: string;
  token_x?: string;
  token_y?: string;
  fee: number;
  point_delta?: number;
  current_point?: number;
  state?: string;
  liquidity?: string;
  liquidity_x?: string;
  max_liquidity_per_point?: string;
  percent?: string;
}
/**
 * caculate price by point
 * @param pointDelta
 * @param point
 * @param decimalRate tokenX/tokenY
 * @returns
 */
function getPriceByPoint(point: number, decimalRate: number) {
  const price = Math.pow(CONSTANT_D, point) * decimalRate;
  const price_handled = new BigNumber(price).toFixed();
  return price_handled;
}
/**
 * caculate point by price
 * @param pointDelta
 * @param price
 * @param decimalRate tokenY/tokenX
 * @returns
 */
function getPointByPrice(
  pointDelta: number,
  price: string,
  decimalRate: number
) {
  const point = Math.log(+price * decimalRate) / Math.log(CONSTANT_D);
  const point_int = Math.round(point);
  const point_int_slot = Math.floor(point_int / pointDelta) * pointDelta;
  if (point_int_slot < POINTLEFTRANGE) {
    return POINTLEFTRANGE;
  } else if (point_int_slot > POINTRIGHTRANGE) {
    return 800000;
  }
  return point_int_slot;
}
const CONSTANT_D = 1.0001;
const pointDeltaMap = {
  100: 1,
  400: 8,
  2000: 40,
  10000: 200,
};
const defaultSelectedFee = 2000;
const feeList = [
  {
    fee: 100,
    text: 'Best for very stable pairs',
  },
  {
    fee: 400,
    text: 'Best for stable pairs',
  },
  {
    fee: 2000,
    text: 'Best for most pairs',
  },
  {
    fee: 10000,
    text: 'Best for rare pairs',
  },
];
const POINTLEFTRANGE = -800000;
const POINTRIGHTRANGE = 800000;
