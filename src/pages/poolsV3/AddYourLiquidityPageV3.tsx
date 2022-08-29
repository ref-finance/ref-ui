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
} from '~components/icon/V3';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import {
  GreenLButton,
  BorderButton,
  GradientButton,
  ButtonTextWrapper,
  BlacklightConnectToNearBtn,
} from '~components/button/Button';
import SelectToken from '~components/forms/SelectToken';
import { useTriTokens, useWhitelistTokens } from '../../state/token';
import { useTriTokenIdsOnRef } from '../../services/aurora/aurora';
import { TokenMetadata, ftGetBalance } from '../../services/ft-contract';
import { getTokenPriceList } from '../../services/indexer';
import { useTokenBalances, useDepositableBalance } from '../../state/token';
import Loading from '~components/layout/Loading';
import { list_pools, add_liquidity } from '../../services/swapV3';
import { TokenBalancesView } from '../../services/token';
import { useTokensData } from '../../state/token';
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
} from '~utils/numbers';
import { WalletContext } from '../../utils/sender-wallet';
import _ from 'lodash';
import BigNumber from 'bignumber.js';

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
  const [tokenXBalanceFromNear, setTokenXBalanceFromNear] = useState<string>();
  const [tokenYBalanceFromNear, setTokenYBalanceFromNear] = useState<string>();
  const [currentPoint, setCurrentPoint] = useState<number>();
  const [leftPoint, setLeftPoint] = useState<number>(0);
  const [rightPoint, setRightPoint] = useState<number>(0);
  const [feeList, setFeeList] = useState([
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
  ]);
  const [currentSelectedPool, setCurrentSelectedPool] =
    useState<PoolInfo>(null);
  const [feeBoxStatus, setFeeBoxStatus] = useState(true);
  const [addLiquidityButtonLoading, setAddLiquidityButtonLoading] =
    useState(false);
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
  useEffect(() => {
    if (currentSelectedPool) {
      const {
        pool_id,
        token_x,
        token_y,
        fee,
        point_delta,
        current_point,
        tvl,
      } = currentSelectedPool;
      setCurrentPoint(current_point);
      const c_price = getCurrentPrice_decimal();
      const decimalRate =
        Math.pow(10, tokenY.decimals) / Math.pow(10, tokenX.decimals);
      // -50%
      const l_price = c_price / 2;
      const point_l = getPointByPrice(
        point_delta,
        l_price.toString(),
        decimalRate
      );
      setLeftPoint(point_l);
      // 100%
      const r_price = c_price * 2;
      const point_r = getPointByPrice(
        point_delta,
        r_price.toString(),
        decimalRate
      );
      setRightPoint(point_r);
    }
  }, [currentSelectedPool]);
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
        // 增加pool 状态的判断
        const { token_x, token_y } = pool;
        if (token_x == tokenX.id && token_y == tokenY.id) return true;
      });
      if (availablePools.length > 0) {
        const currentPoolsMap = {};
        availablePools.forEach((pool: PoolInfo) => {
          const f = pool.fee; // TODO pool的tvl怎么获取？
          const temp = {
            ...pool,
            tvl: '',
          };
          currentPoolsMap[f] = temp;
        });
        setCurrentPools(currentPoolsMap);
      } else {
        setCurrentPools({});
      }
    } else {
      setCurrentPools({});
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
    getTokenYAmountByCondition(amount);
  }
  function changeTokenYAmount(amount: string = '0') {
    setTokenYAmount(amount);
    getTokenXAmountByCondition(amount);
  }
  function getTokenYAmountByCondition(amount: string) {
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
  function getTokenXAmountByCondition(amount: string) {
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
  function addOneSlot(direction: string) {
    // TODO [-800000, 800000] 要做判断
    const { point_delta } = currentSelectedPool;
    if (direction == 'l') {
      setLeftPoint(leftPoint + point_delta);
    } else if (direction == 'r') {
      setRightPoint(rightPoint + point_delta);
    }
  }
  function reduceOneSlot(direction: string) {
    // TODO [-800000, 800000] 要做判断
    const { point_delta } = currentSelectedPool;
    if (direction == 'l') {
      setLeftPoint(leftPoint - point_delta);
    } else if (direction == 'r') {
      setRightPoint(rightPoint - point_delta);
    }
  }
  function getLeftPrice() {
    if (currentSelectedPool) {
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      const price = getPriceByPoint(leftPoint, decimalRate);
      return toPrecision(price.toString(), 8);
    } else {
      return '';
    }
  }
  function getRightPrice() {
    if (currentSelectedPool) {
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      const price = getPriceByPoint(rightPoint, decimalRate);
      return toPrecision(price.toString(), 8);
    } else {
      return '';
    }
  }
  function getCurrentPrice_decimal() {
    if (currentSelectedPool) {
      const { current_point } = currentSelectedPool;
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      const price = getPriceByPoint(current_point, decimalRate);
      return price;
    }
    return 0;
  }
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
  function switchFeeBoxStatus() {
    setFeeBoxStatus(!feeBoxStatus);
  }
  function addLiquidity() {
    setAddLiquidityButtonLoading(true);
    const { pool_id } = currentSelectedPool;
    add_liquidity({
      pool_id,
      left_point: leftPoint,
      right_point: rightPoint,
      amount_x: toNonDivisibleNumber(tokenX.decimals, tokenXAmount),
      amount_y: toNonDivisibleNumber(tokenY.decimals, tokenYAmount),
      token_x: tokenX,
      token_y: tokenY,
    });
  }
  // TODO 大小校验
  const isAddLiquidityDisabled = !(
    currentSelectedPool?.pool_id &&
    tokenXAmount &&
    tokenYAmount
  );
  console.log('777777777777', isAddLiquidityDisabled);
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
                              {tokenX.symbol}
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
                              {tokenY.symbol}
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
                              ? (currentPools[fee].tvl || '0') + '%' + ' select'
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
                      ? `${currentSelectedPool.tvl || 0 + '%'} select`
                      : 'No Pool'}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-base text-white">Input Amount</span>
                <InputAmount
                  token={tokenX}
                  balance={tokenXBalanceFromNear}
                  tokenPriceList={tokenPriceList}
                  amount={tokenXAmount}
                  changeAmount={changeTokenXAmount}
                  currentSelectedPool={currentSelectedPool}
                ></InputAmount>
                <InputAmount
                  token={tokenY}
                  balance={tokenYBalanceFromNear}
                  tokenPriceList={tokenPriceList}
                  amount={tokenYAmount}
                  changeAmount={changeTokenYAmount}
                  currentSelectedPool={currentSelectedPool}
                ></InputAmount>
              </div>
            </div>
            {/* right area */}
            {/* no Data */}
            <div className={`${!currentSelectedPool ? '' : 'hidden'}`}>
              no Data
            </div>
            {/* add pool part */}
            <div
              className={`flex-col justify-between flex-grow self-stretch ${
                currentSelectedPool && !currentSelectedPool.pool_id
                  ? 'flex'
                  : 'hidden'
              }`}
            >
              <div className="text-white font-bold text-base">
                Initialize the pool:
              </div>
              <div className="relative flex-grow bg-black bg-opacity-10 rounded-xl px-4 py-7 mt-3">
                <BgIcon className="absolute right-0 top-0"></BgIcon>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <p className="text-sm text-white">
                      This pool is not initialized before. To initialize, select
                      a starting price for the pool and the enter your liquidity
                      price range and deposit amount.
                    </p>
                    <p className="text-sm text-v3WarningColor mt-1">
                      Gas fees will be higher than usual!
                    </p>
                  </div>
                  <div>
                    <p className="text-base text-white">Starting Price</p>
                    <div className="flex items-center justify-between mt-3">
                      <span>1 NEAR =</span>
                      <div className="flex items-center justify-between rounded-xl bg-black bg-opacity-20 px-3 h-12">
                        <input
                          type="number"
                          placeholder="0.0"
                          className="text-xl font-bold"
                          onChange={({ target }) => {}}
                        />
                        <span className="text-base text-white ml-3">REF</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3.5">
                      <span className="text-xs text-v3LightGreyColor">
                        Current Price
                      </span>
                      <div className="flex items-center text-xs text-white">
                        1 NEAR = 10.942 REF{' '}
                        <span className="text-v3LightGreyColor">($5.89)</span>{' '}
                        <SwitchButton className="cursor-pointer ml-1.5"></SwitchButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <GradientButton
                color="#fff"
                className={`w-full h-10 mt-5 text-center text-base text-white focus:outline-none`}
                // onClick={goAddLiquidityPage}
              >
                Create a Pool
              </GradientButton>
            </div>
            {/* add Liquidity part */}
            <div
              className={`flex flex-col justify-between flex-grow self-stretch ${
                currentSelectedPool && currentSelectedPool.pool_id
                  ? ''
                  : 'hidden'
              }`}
            >
              <div className="text-white font-bold text-base">
                Set Price Range
              </div>
              <div className="flex flex-col justify-between relative flex-grow bg-v3BlackColor rounded-xl px-4 py-7 mt-3">
                <div className="flex items-center justify-between mt-3.5">
                  <span className="text-xs text-v3LightGreyColor">
                    Current Price
                  </span>
                  <div className="flex items-center text-xs text-white">
                    1 {tokenX?.symbol} = {getCurrentPrice()} {tokenY?.symbol}
                    <span className="text-v3LightGreyColor ml-0.5">
                      ({getCurrentPriceValue()})
                    </span>
                  </div>
                </div>
                {/* range chart area */}
                <div className=""></div>
                {/* input range area */}
                <div className="flex items-center justify-between">
                  <div className="w-1 flex-grow flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-3 mr-5">
                    <span className="text-sm text-primaryText">Min Price</span>
                    <div className="flex items-center justify-between mt-3.5">
                      <ReduceButton
                        className="cursor-pointer"
                        onClick={() => {
                          reduceOneSlot('l');
                        }}
                      ></ReduceButton>
                      <input
                        type="number"
                        placeholder="0.0"
                        className="text-base mx-3 text-center"
                        // disabled={token ? false : true}
                        value={getLeftPrice()}
                        // value={leftPoint}
                        onChange={({ target }) => {
                          // changeAmount(target.value);
                          // setInputValue(target.value);
                        }}
                      />
                      <AddButton
                        className="cursor-pointer"
                        onClick={() => {
                          addOneSlot('l');
                        }}
                      ></AddButton>
                    </div>
                  </div>
                  <div className="w-1 flex-grow flex flex-col items-center bg-black bg-opacity-20 rounded-xl p-2.5">
                    <span className="text-sm text-primaryText">Max Price</span>
                    <div className="flex items-center justify-between mt-3.5">
                      <ReduceButton
                        className="cursor-pointer"
                        onClick={() => {
                          reduceOneSlot('r');
                        }}
                      ></ReduceButton>
                      <input
                        type="number"
                        placeholder="0.0"
                        className="text-base mx-3 text-center"
                        // disabled={token ? false : true}
                        value={getRightPrice()}
                        // value={rightPoint}
                        onChange={({ target }) => {
                          // changeAmount(target.value);
                          // setInputValue(target.value);
                        }}
                      />
                      <AddButton
                        className="cursor-pointer"
                        onClick={() => {
                          addOneSlot('r');
                        }}
                      ></AddButton>
                    </div>
                  </div>
                </div>
              </div>
              <GradientButton
                color="#fff"
                className={`w-full h-10 mt-5 text-center text-base text-white focus:outline-none ${
                  isAddLiquidityDisabled ? 'opacity-40' : ''
                }`}
                loading={addLiquidityButtonLoading}
                disabled={addLiquidityButtonLoading || isAddLiquidityDisabled}
                btnClassName={`${
                  isAddLiquidityDisabled ? 'cursor-not-allowed' : ''
                }`}
                onClick={addLiquidity}
              >
                <ButtonTextWrapper
                  loading={addLiquidityButtonLoading}
                  Text={() => (
                    <FormattedMessage
                      id="add_liquidity"
                      defaultMessage="Add Liquidity"
                    />
                  )}
                />
              </GradientButton>
            </div>
          </div>
        </div>
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
}: {
  token: TokenMetadata;
  balance: string;
  tokenPriceList: Record<string, any>;
  changeAmount: any;
  amount: string;
  currentSelectedPool: PoolInfo;
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
    return '$-';
  }
  return (
    <div className="bg-black bg-opacity-10 rounded-xl p-3 mt-3">
      <div className="flex items-center justify-between">
        <input
          type="number"
          placeholder="0.0"
          className="text-2xl"
          disabled={
            currentSelectedPool && currentSelectedPool.pool_id ? false : true
          }
          value={amount}
          onChange={({ target }) => {
            changeAmount(target.value);
            setInputValue(target.value);
          }}
        />
        <span className="text-base font-bold text-v3feeTextColor ml-5 whitespace-nowrap">
          {token ? token.symbol : 'Selet Token'}
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
              changeAmount(balance);
              setInputValue(balance);
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
  tvl?: string;
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
  return price;
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
  return point_int_slot;
}
const CONSTANT_D = 1.0001;
