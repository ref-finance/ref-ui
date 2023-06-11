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
import {
  getBoostTokenPrices,
  Seed,
  FarmBoost,
  classificationOfCoins,
} from '../../services/farm';
import { useTokenBalances, useDepositableBalance } from '../../state/token';
import Loading from '~components/layout/Loading';
import {
  list_pools,
  add_liquidity,
  create_pool,
  PoolInfo,
  get_pool_marketdepth,
  regularizedPoint,
  AddLiquidityInfo,
  batch_add_liquidity,
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
  TOKEN_LIST_FOR_RATE,
  get_matched_seeds_for_dcl_pool,
  get_all_seeds,
  displayNumberToAppropriateDecimals,
  get_pool_id,
  get_pool_name,
  openUrl,
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
import _, { set } from 'lodash';
import BigNumber from 'bignumber.js';
import { toRealSymbol } from '../../utils/token';
import ReactTooltip from 'react-tooltip';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { BlueCircleLoading } from '../../components/layout/Loading';
import { isMobile } from '../../utils/device';
import { SelectedIcon, ArrowDownV3 } from '../../components/icon/swapV3';
import { OutLinkIcon } from '../../components/icon/Common';
import { REF_FI_POOL_ACTIVE_TAB } from '../pools/LiquidityPage';
import getConfig from '../../services/config';
import QuestionMark from '../../components/farm/QuestionMark';
import ReactSlider from 'react-slider';
import Big from 'big.js';
import { SelectTokenDCL } from '../../components/forms/SelectToken';
import { SliderCurColor } from '~components/icon/Info';
import { values } from 'lodash';
import { PipValues } from '../../../public/charting_library/charting_library';
import {
  CurveShape,
  SpotShape,
  BidAskShape,
} from '../Orderly/components/Common/Icons';
import { SLOT_NUMBER } from '~services/near';
import DclChart from '../../components/d3Chart/DclChart';

export type LiquidityShape = 'Spot' | 'Curve' | 'BidAsk';

export default function AddYourLiquidityPageV3() {
  const [tokenX, setTokenX] = useState<TokenMetadata>(null);
  const [tokenY, setTokenY] = useState<TokenMetadata>(null);
  const [tokenXAmount, setTokenXAmount] = useState('');
  const [tokenYAmount, setTokenYAmount] = useState('');
  const [listPool, setListPool] = useState<PoolInfo[]>([]);

  const [binNumber, setBinNumber] = useState(10);
  const [curPointInBinBoundry, setCurPointInBinBoundry] = useState(false);

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
  const [selectHover, setSelectHover] = useState(false);
  const [topPairs, setTopPairs] = useState([]);
  const [seed_list, set_seed_list] = useState<Seed[]>();
  const [related_seeds, set_related_seeds] = useState<Seed[]>([]);
  const [hoverFeeBox, setHoverFeeBox] = useState<boolean>(false);

  const [liquidityShape, setLiquidityShape] = useState<LiquidityShape>('Spot');

  // callBack handle
  useAddAndRemoveUrlHandle();
  const history = useHistory();
  const triTokenIds = useTriTokenIdsOnRef();
  const refTokens = useWhitelistTokens((triTokenIds || []).concat(['aurora']));
  const triTokens = useTriTokens();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const nearBalance = useDepositableBalance('NEAR');
  const intl = useIntl();
  const intl_select = intl.formatMessage({ id: 'select_s' });
  const OPEN_CREATE_POOL_ENTRY = false;

  const [priceRangeMode, setPriceRangeMode] = useState<
    'by_range' | 'by_radius'
  >('by_range');

  useEffect(() => {
    getBoostTokenPrices().then(setTokenPriceList);
    get_list_pools();
    get_seeds();
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
      const link = get_pool_name(`${tokenX.id}|${tokenY.id}|${fee}`);
      history.replace(`#${link}`);
      if (seed_list && currentSelectedPool.pool_id) {
        get_optional_seeds();
      }
    }
  }, [currentSelectedPool, tokenX, tokenY, seed_list]);
  useEffect(() => {
    if (tokenX && tokenY) {
      searchPools();
    }
  }, [tokenX, tokenY, tokenPriceList, listPool]);
  useEffect(() => {
    if (listPool.length > 0 && Object.keys(tokenPriceList).length > 0) {
      getTopPairs();
    }
  }, [listPool, tokenPriceList]);

  async function getTopPairs() {
    const listPromise = listPool.map(async (p: PoolInfo) => {
      const token_x = p.token_x;
      const token_y = p.token_y;

      p.token_x_metadata = await ftGetTokenMetadata(token_x);
      p.token_y_metadata = await ftGetTokenMetadata(token_y);
      const pricex = tokenPriceList[token_x]?.price || 0;
      const pricey = tokenPriceList[token_y]?.price || 0;
      const { total_x, total_y, total_fee_x_charged, total_fee_y_charged } = p;
      const totalX = new BigNumber(total_x)
        .minus(total_fee_x_charged)
        .toFixed();
      const totalY = new BigNumber(total_y)
        .minus(total_fee_y_charged)
        .toFixed();
      const tvlx =
        Number(toReadableNumber(p.token_x_metadata.decimals, totalX)) *
        Number(pricex);
      const tvly =
        Number(toReadableNumber(p.token_y_metadata.decimals, totalY)) *
        Number(pricey);

      p.tvl = tvlx + tvly;

      return p;
    });
    const list: PoolInfo[] = await Promise.all(listPromise);
    list.sort((b: PoolInfo, a: PoolInfo) => {
      return a.tvl - b.tvl;
    });
    const top3 = list.slice(0, 3);
    setTopPairs(top3);
  }

  if (!refTokens || !triTokens || !triTokenIds) return <Loading />;
  const allTokens = getAllTokens(refTokens, triTokens);
  async function get_seeds() {
    const seeds = await get_all_seeds();
    set_seed_list(seeds);
  }
  function get_optional_seeds() {
    const optional_seeds = get_matched_seeds_for_dcl_pool({
      seeds: seed_list,
      pool_id: currentSelectedPool.pool_id,
    });
    if (optional_seeds.length) {
      set_related_seeds(optional_seeds);
    } else {
      set_related_seeds([]);
    }
  }
  async function get_init_pool() {
    let tokenx_id, tokeny_id, pool_fee;
    const hash = decodeURIComponent(location.hash);
    if (hash.indexOf('<>') > -1) {
      // new link
      [tokenx_id, tokeny_id, pool_fee] = get_pool_id(hash.slice(1)).split('|');
    } else {
      // old link
      [tokenx_id, tokeny_id, pool_fee] = hash.slice(1).split('|');
    }
    if (tokenx_id && tokeny_id && pool_fee) {
      const tokenx = await ftGetTokenMetadata(tokenx_id);
      const tokeny = await ftGetTokenMetadata(tokeny_id);
      setTokenX(tokenx);
      setTokenY(tokeny);
    }
  }
  function goYourLiquidityPage() {
    if (history.length == 2) {
      history.push('/yourliquidity');
    } else {
      history.goBack();
    }
  }
  async function get_list_pools() {
    const list: PoolInfo[] = await list_pools();
    if (list.length > 0) {
      setListPool(list);
    }
  }
  function searchPools() {
    const hash = decodeURIComponent(location.hash);
    let url_fee;
    if (hash.indexOf('<>') > -1) {
      url_fee = +get_pool_id(hash.slice(1)).split('|')[2];
    } else {
      url_fee = +hash.slice(1).split('|')[2];
    }
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
          const {
            total_x,
            total_y,
            token_x,
            token_y,
            total_fee_x_charged,
            total_fee_y_charged,
          } = p;
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
          const totalX = new BigNumber(total_x)
            .minus(total_fee_x_charged || 0)
            .toFixed();
          const totalY = new BigNumber(total_y)
            .minus(total_fee_y_charged || 0)
            .toFixed();
          const tvlx = new Big(toReadableNumber(firstToken.decimals, totalX))
            .times(firstTokenPrice)
            .toNumber();
          const tvly = new Big(toReadableNumber(secondToken.decimals, totalY))
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
    } else if (+tvl < 1) {
      return '<$1';
    } else {
      return `$${toInternationalCurrencySystem(tvl.toString(), 0)}`;
    }
  }
  function goPoolsPage() {
    const poolId = currentSelectedPool?.pool_id;
    if (poolId) {
      const newPoolId = get_pool_name(poolId);
      openUrl(`/poolV2/${newPoolId}`);
    } else {
      localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'v2');
      openUrl('/pools');
    }
  }
  const tokenSort = tokenX?.id == currentSelectedPool?.token_x;
  const mobileDevice = isMobile();
  return (
    <>
      <div className="m-20">
        {/* 缩略图 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id} config={{axisHidden: true, controlHidden: true, currentBarHidden: true, hoverBoxHidden: true, svgWidth:'80', svgHeight:'32', svgPaddingX:'0'}}></DclChart> */}
        {/* 详情页图 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id} config={{axisHidden: true, controlHidden: true}}></DclChart> */}
        {/* 添加页图 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id}></DclChart> */}
        {/* 用户流动性图表*/}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id} config={{controlHidden: true}} chartType='USER'></DclChart> */}
        {/* 删除流动性图表 部分删除 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id} config={{controlHidden: true, currentBarHidden: true, hoverBoxHidden: true}} chartType='USER' removeParams={{ fromRight:true, point:  408800}}></DclChart> */}
        {/* 删除流动性图表 全部删除 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id} config={{controlHidden: true, currentBarHidden: true, hoverBoxHidden: true}} chartType='USER' removeParams={{ all: true }}></DclChart> */}
      </div>

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
      <div
        style={{ width: mobileDevice ? '' : '1020px' }}
        className="relative flex flex-col  lg:w-4/5 2xl:w-3/5 xs:w-full md:w-full xs:px-3 md:px-3 m-auto text-white rounded-2xl "
      >
        <div
          className=" xs:w-full max-w-max  md:w-full xs:px-3 md:px-3 text-farmText flex items-center mb-5 cursor-pointer hover:text-white"
          onClick={() => {
            history.goBack();
          }}
        >
          <div
            className="cursor-pointer flex items-center justify-center w-6 h-6"
            onClick={goYourLiquidityPage}
          >
            <ReturnIcon></ReturnIcon>
          </div>
          <span className=" text-sm">
            <FormattedMessage id="add_liquidity"></FormattedMessage>
          </span>
        </div>

        <div
          className="relative z-10 py-5 px-7 xs:px-3 md:px-3 rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, #213441 0%, #15242F 100%)',
          }}
        >
          {/* <div className="relative flex items-center justify-center mb-7 xs:hidden md:hidden">
              <div
                className="absolute -left-1 cursor-pointer flex items-center justify-center w-6 h-6"
                onClick={goYourLiquidityPage}
              >
                <ReturnIcon></ReturnIcon>
              </div>
              <span className="text-white text-base gotham_bold">
                <FormattedMessage id="add_liquidity"></FormattedMessage>
              </span>
            </div> */}
          <div className="flex items-start justify-between xs:flex-col md:flex-col">
            {/* left area */}

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
                setCurrentSelectedPool={setCurrentSelectedPool}
                tokenXAmount={tokenXAmount}
                tokenYAmount={tokenYAmount}
                tokenXBalanceFromNear={tokenXBalanceFromNear}
                tokenYBalanceFromNear={tokenYBalanceFromNear}
                tokenPriceList={tokenPriceList}
                onlyAddXToken={onlyAddXToken}
                onlyAddYToken={onlyAddYToken}
                invalidRange={invalidRange}
                pointChange={pointChange}
                seeds={related_seeds}
                priceRangeMode={priceRangeMode}
                setPriceRangeMode={setPriceRangeMode}
                binNumber={binNumber}
                setBinNumber={setBinNumber}
                curPointInBinBoundry={curPointInBinBoundry}
                setCurPointInBinBoundry={setCurPointInBinBoundry}
              ></AddLiquidityComponent>
            ) : null}

            <div
              style={{ width: mobileDevice ? '' : '400px' }}
              className="flex-shrink-0 xs:w-full md:w-full"
            >
              <div className="flex items-center justify-between">
                <div className="text-white font-gothamBold">
                  <FormattedMessage
                    id="select_token_pair"
                    defaultMessage={'Select Token Pair'}
                  ></FormattedMessage>
                </div>

                <SelectTokenDCL
                  selectTokenIn={(token) => {
                    if (tokenY && tokenY.id == token.id) return;
                    setTokenX(token);
                    setTokenXBalanceFromNear(token?.near?.toString());
                  }}
                  selectTokenOut={(token: TokenMetadata) => {
                    if (tokenX && tokenX.id == token.id) return;
                    setTokenY(token);
                    setTokenYBalanceFromNear(token?.near?.toString());
                  }}
                  className="pt-6  absolute top-5 outline-none   right-0    xs:text-white xs:font-bold xs:fixed xs:bottom-0 xs:w-full "
                  selected={
                    <div
                      className={` text-sm rounded-lg frcc cursor-pointer p-3 bg-v3SwapGray bg-opacity-10 ${
                        selectHover ? 'text-white' : 'text-primaryText'
                      }`}
                      onMouseEnter={() => {
                        if (!mobileDevice) {
                          setSelectHover(true);
                        }
                      }}
                      onMouseLeave={() => {
                        if (!mobileDevice) {
                          setSelectHover(false);
                        }
                      }}
                      onClick={() => {
                        if (mobileDevice) {
                          setSelectHover(!selectHover);
                        }
                      }}
                      onBlur={() => {
                        if (mobileDevice) {
                          setSelectHover(false);
                        }
                      }}
                    >
                      <ArrowDownV3 />
                    </div>
                  }
                />
              </div>

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

              <div className="frcb mt-6 mb-7">
                <div className="text-white font-gothamBold">
                  <FormattedMessage
                    id="select_fee_tiers"
                    defaultMessage={'Select Fee Tiers'}
                  ></FormattedMessage>
                </div>

                <div className="frcs gap-2">
                  <span className="font-gothamBold text-white">
                    {!!currentSelectedPool?.fee
                      ? `${currentSelectedPool.fee / 10000}%`
                      : ''}
                  </span>

                  <div
                    className="w-7 h-7 rounded-lg relative bg-v3SwapGray z-50 bg-opacity-10 hover:bg-opacity-30 text-primaryText hover:text-white frcc "
                    onMouseLeave={() => {
                      setHoverFeeBox(false);
                    }}
                    onMouseEnter={() => {
                      setHoverFeeBox(true);
                    }}
                  >
                    <div>
                      <SliderCurColor></SliderCurColor>
                    </div>
                    {hoverFeeBox && (
                      <div className="absolute right-0 top-5 pt-4">
                        <div
                          className="rounded-xl  right-0 top-3 px-4 py-3  xs:px-2 md:px-2"
                          style={{
                            border: '1.2px solid rgba(145, 162, 174, 0.2)',
                            width: '418px',
                            background:
                              'linear-gradient(rgb(34, 47, 55) 0%, rgb(25, 34, 41) 100%)',
                          }}
                        >
                          <div className="text-sm text-white font-gothamBold">
                            <FormattedMessage
                              id="fee_Tiers"
                              defaultMessage="Fee Tiers"
                            />
                          </div>
                          <div
                            className={`items-stretch justify-between mt-5 ${
                              feeBoxStatus ? 'flex' : 'hidden'
                            }`}
                          >
                            {FEELIST.map((feeItem, index) => {
                              const { fee, text } = feeItem;
                              const isNoPool =
                                currentPools && !currentPools[fee];
                              return (
                                <div
                                  onClick={() => {
                                    switchSelectedFee(fee);
                                  }}
                                  key={fee + index}
                                  className={`relative flex flex-col px-2 py-1.5 xsm:py-1 rounded-lg w-1 flex-grow ${
                                    tokenX && tokenY ? 'cursor-pointer' : ''
                                  } ${index == 3 ? '' : 'mr-2.5 xsm:mr-1'} ${
                                    isNoPool
                                      ? 'border border-v3GreyColor'
                                      : currentSelectedPool?.fee == fee
                                      ? 'bg-feeBoxBgLiqudityColor'
                                      : 'bg-v3GreyColor'
                                  }`}
                                >
                                  <span
                                    className={`text-sm font-gothamBold ${
                                      isNoPool ||
                                      !(tokenX && tokenY && currentPools)
                                        ? 'text-primaryText text-opacity-60'
                                        : 'text-white'
                                    }`}
                                  >
                                    {fee / 10000}%
                                  </span>
                                  {tokenX && tokenY && currentPools ? (
                                    <span
                                      className={`transform scale-90 origin-left text-xs text-primaryText whitespace-nowrap ${
                                        isNoPool ? 'text-opacity-60' : ''
                                      }`}
                                    >
                                      {isNoPool ? (
                                        'No Pool'
                                      ) : Object.keys(tokenPriceList).length >
                                        0 ? (
                                        <span>
                                          {displayTvl(currentPools[fee].tvl)}
                                        </span>
                                      ) : (
                                        'Loading...'
                                      )}
                                    </span>
                                  ) : null}
                                  {currentSelectedPool?.fee == fee ? (
                                    <SelectedIcon className="absolute top-0 right-0"></SelectedIcon>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="font-gothamBold mb-2.5 text-white">
                <FormattedMessage
                  id="choose_liquidity_shape"
                  defaultMessage={'Choose Liquidity Shape'}
                ></FormattedMessage>
              </div>

              <div className="frcb">
                {[SpotShape, CurveShape, BidAskShape].map(
                  (Shape, index: number) => {
                    return (
                      <div
                        className={`flex flex-col  rounded-xl cursor-pointer items-center border justify-center ${
                          (index === 0 && liquidityShape === 'Spot') ||
                          (index === 1 && liquidityShape === 'Curve') ||
                          (index === 2 && liquidityShape === 'BidAsk')
                            ? ' border-senderHot bg-senderHot bg-opacity-10'
                            : 'border-limitOrderFeeTiersBorderColor'
                        }  gap-2.5`}
                        style={{
                          width: '127px',
                          height: '70px',
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (index === 0) setLiquidityShape('Spot');
                          else if (index === 1) setLiquidityShape('Curve');
                          else setLiquidityShape('BidAsk');
                        }}
                      >
                        <Shape />

                        <span className="text-white text-xs font-gothamBold">
                          {index === 0 && (
                            <FormattedMessage
                              id="spot"
                              defaultMessage={'Spot'}
                            ></FormattedMessage>
                          )}
                          {index === 1 && (
                            <FormattedMessage
                              id="curve"
                              defaultMessage={'Curve'}
                            ></FormattedMessage>
                          )}

                          {index === 2 && (
                            <FormattedMessage
                              id="bid_ask"
                              defaultMessage={'Bid-ask'}
                            ></FormattedMessage>
                          )}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="font-gothamBold mt-4 text-white">
                <FormattedMessage
                  id="silmulate_liquidity_distribution"
                  defaultMessage={'Silmulate Liquidity Distribution'}
                ></FormattedMessage>
              </div>
              {currentSelectedPool && currentSelectedPool.pool_id && (
                <AddLiquidityButton
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
                  seeds={related_seeds}
                  priceRangeMode={priceRangeMode}
                  setPriceRangeMode={setPriceRangeMode}
                  binNumber={binNumber}
                  setBinNumber={setBinNumber}
                  curPointInBinBoundry={curPointInBinBoundry}
                  setCurPointInBinBoundry={setCurPointInBinBoundry}
                  getTokenYAmountByCondition={getTokenYAmountByCondition}
                  getTokenXAmountByCondition={getTokenXAmountByCondition}
                />
              )}

              <div className="mt-5">
                <OneSide
                  show={
                    (onlyAddYToken && currentPoint != rightPoint - 1) ||
                    onlyAddXToken
                      ? true
                      : false
                  }
                ></OneSide>
                <InvalidRange show={invalidRange ? true : false}></InvalidRange>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Slider({
  min,
  max,
  step,
  values,
  setValues,
  invert,
}: {
  min: number;
  max: number;
  step: number;
  values: any;
  setValues: any;
  invert: boolean;
}) {
  return (
    <ReactSlider
      invert={invert}
      className={`multi-slider ${
        invert ? 'invert' : ''
      } w-full h-2.5 mb-6 my-8`}
      onChange={setValues}
      value={values}
      min={min}
      max={max}
      step={step}
    />
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
  const mobileDevice = isMobile();
  return (
    <div
      className={`w-full xs:w-full mr-6 md:w-full flex flex-col justify-between  self-stretch xs:mt-5 md:mt-5`}
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
          className={`relative z-50 w-full h-12 mt-5 text-center text-base text-white focus:outline-none ${
            +createPoolRate <= 0 ? 'opacity-40' : ''
          }`}
          loading={createPoolButtonLoading}
          disabled={createPoolButtonLoading || +createPoolRate <= 0}
          btnClassName={`${+createPoolRate <= 0 ? 'cursor-not-allowed' : ''}`}
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

export type PriceRangeModeType = 'by_range' | 'by_radius';

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
  seeds,
  priceRangeMode,
  setPriceRangeMode,
  binNumber,
  setBinNumber,
  curPointInBinBoundry,
  setCurPointInBinBoundry,
  setCurrentSelectedPool,
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
  seeds: Seed[];
  priceRangeMode: PriceRangeModeType;
  setPriceRangeMode: (mode: PriceRangeModeType) => void;
  binNumber: number;
  setBinNumber: (binNumber: number) => void;
  curPointInBinBoundry: boolean;
  setCurPointInBinBoundry: (curPointInBinBoundry: boolean) => void;
  setCurrentSelectedPool: (pool: PoolInfo) => void;
}) {
  let [leftCustomPrice, setLeftCustomPrice] = useState('');
  let [rightCustomPrice, setRightCustomPrice] = useState('');
  let [targetCustomPrice, setTargetCustomPrice] = useState('');

  let [leftPoint, setLeftPoint] = useState<number>(0);
  let [rightPoint, setRightPoint] = useState<number>(0);

  let [targetPoint, setTargetPoint] = useState<number>(0);

  const [leftInputStatus, setLeftInputStatus] = useState(false);
  const [rightInputStatus, setRightInputStatus] = useState(false);
  const [targetInputStatus, setTargetInputStatus] = useState(false);

  const [currentPoint, setCurrentPoint] = useState<number>();

  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [noDataForChart, setNoDataForChart] = useState(false);
  const [addLiquidityButtonLoading, setAddLiquidityButtonLoading] =
    useState(false);

  const [radius, setRadius] = useState(5);

  useEffect(() => {
    if (priceRangeMode === 'by_radius') {
      setBinNumber(radius * 2);
    }
  }, [radius, priceRangeMode]);

  useEffect(() => {
    if (!currentSelectedPool || !targetPoint) return;
    if (priceRangeMode === 'by_range') {
      setCurrentSelectedPool({
        ...currentSelectedPool,
        current_point: currentPoint,
      });
    } else {
      setCurrentSelectedPool({
        ...currentSelectedPool,
        current_point: targetPoint,
      });
    }
  }, [priceRangeMode, targetCustomPrice]);
  console.log('currentSelectedPool: ', currentSelectedPool);

  useEffect(() => {
    const { point_delta } = currentSelectedPool;

    if (tokenSort) {
      setRightPoint(leftPoint + point_delta * SLOT_NUMBER * binNumber);
    } else {
      setLeftPoint(rightPoint - point_delta * SLOT_NUMBER * binNumber);
    }
  }, [binNumber]);

  const [currentCheckedQuickOption, setCurrentCheckedQuickOption] = useState<
    number | string
  >();
  const [quickOptions, setQuickOptions] = useState([5, 10, 20, 50]);
  const [quickOptionsMapPoint, setQuickOptionsMapPoint] = useState<
    Record<string, any>
  >({});

  console.log('quickOptionsMapPoint: ', quickOptionsMapPoint);

  const { globalState } = useContext(WalletContext);
  const [timer, setTimer] = useState(null);
  const [depthData, setDepthData] = useState(null);

  const [displayedSeedIndex, setDisplayedSeedIndex] = useState(0);
  const isSignedIn = globalState.isSignedIn;
  const intl = useIntl();
  const chartDom = useRef(null);
  const { token_x, token_y } = currentSelectedPool;
  const token_x_decimals =
    tokenX.id == token_x ? tokenX.decimals : tokenY.decimals;
  const token_y_decimals =
    tokenY.id == token_y ? tokenY.decimals : tokenX.decimals;
  // init

  // quick options
  useEffect(() => {
    const { current_point, point_delta, fee } = currentSelectedPool;
    // 5, 10 20 50

    const BIN_SIZE = point_delta * SLOT_NUMBER;

    const optionsMapPoints_temp = {};
    quickOptions.forEach((p: number) => {
      const { left_p, right_p } = getPointByCondition(p);
      optionsMapPoints_temp[p] = { left_p, right_p };
      // if (p == 10) {
      //   leftPoint = left_p;
      //   rightPoint = right_p;
      //   setLeftPoint(left_p);
      //   setRightPoint(right_p);
      // }
    });
    // full
    const l_p_temp = _.max([current_point - 400000, -800000]);
    const r_p_temp = _.min([current_point + 400000, 800000]);
    let l_p = Math.floor(l_p_temp / point_delta) * point_delta;
    let r_p = Math.floor(r_p_temp / point_delta) * point_delta;
    if (r_p - l_p >= POINTRIGHTRANGE) {
      l_p = l_p + point_delta;
    }

    r_p = Math.floor((r_p - l_p) / BIN_SIZE) * BIN_SIZE + l_p;

    optionsMapPoints_temp['full'] = { left_p: l_p, right_p: r_p };

    let { left_p, right_p } = optionsMapPoints_temp['10'];

    left_p = Math.floor((left_p - l_p) / BIN_SIZE) * BIN_SIZE + l_p;

    right_p = left_p + BIN_SIZE * binNumber;

    setCurPointInBinBoundry((current_point - l_p) / BIN_SIZE === 0);

    setLeftPoint(left_p);
    setRightPoint(right_p);

    // set
    setCurrentPoint(current_point);

    setTargetPoint(current_point);
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
  console.log('currentSelectedPool: ', currentSelectedPool);
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
        space_x: 5,
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
      space_x: 5,
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
    if (targetCustomPrice) {
      if (!tokenSort) {
        targetCustomPrice = new BigNumber(1)
          .dividedBy(targetCustomPrice)
          .toFixed();
      }
      const c_point = getPointByPrice(
        point_delta,
        targetCustomPrice,
        decimalRate
      );
      setTargetCustomPrice('');
      setTargetPoint(c_point);
      // if (c_point - leftPoint >= POINTRIGHTRANGE ) {
      //   const appropriate_l_point = c_point - POINTRIGHTRANGE + point_delta;
      //   setLeftPoint(appropriate_l_point);
      // }
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
          ).isGreaterThanOrEqualTo(tokenYAmount);
      }
    } else if (onlyAddYToken) {
      if (tokenSort) {
        condition2 =
          +tokenYAmount > 0 &&
          new BigNumber(
            getMax(tokenY, tokenYBalanceFromNear)
          ).isGreaterThanOrEqualTo(tokenYAmount);
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
        ).isGreaterThanOrEqualTo(tokenYAmount);
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

  function getTargetPrice() {
    if (currentSelectedPool && currentSelectedPool.pool_id) {
      const { token_x, token_y } = currentSelectedPool;
      const decimalRate =
        Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
      let price = getPriceByPoint(targetPoint, decimalRate);
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

  function get_related_seeds() {
    const temp_seeds = seeds.map((seed: Seed) => {
      const [contractId, temp_mft_id] = seed.seed_id.split('@');
      const [fixRange, pool_id, left_point, right_point] =
        temp_mft_id.split('&');
      const decimalRate =
        Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
      const price_left = getPriceByPoint(+left_point, decimalRate);
      const price_right = getPriceByPoint(+right_point, decimalRate);
      return {
        seed,
        price_left,
        price_right,
      };
    });
    const tokenSort = tokenX.id == token_x ? true : false;
    const targetSeed = temp_seeds[displayedSeedIndex];
    const { price_left, price_right } = targetSeed;
    let price_left_final = price_left;
    let price_right_final = price_right;

    if (!tokenSort) {
      price_left_final = new BigNumber(1).dividedBy(price_right).toFixed();
      price_right_final = new BigNumber(1).dividedBy(price_left).toFixed();
    }
    const display_price_left = displayNumberToAppropriateDecimals(
      price_left_final.toString()
    );
    const display_price_right = displayNumberToAppropriateDecimals(
      price_right_final.toString()
    );
    return (
      <div className="flex flex-col items-ends text-sm">
        <span className="text-limitOrderInputColor text-right">
          1 {tokenX.symbol} ={' '}
        </span>
        <div className="flex items-center mt-2">
          <ArrowDownV3
            onClick={() => {
              setDisplayedSeedIndex(displayedSeedIndex - 1);
            }}
            className={`transform rotate-90 mr-1.5 text-primaryText cursor-pointer ${
              seeds.length > 1 && displayedSeedIndex > 0 ? '' : 'hidden'
            }`}
          ></ArrowDownV3>
          <span
            className="text-v3SwapGray underline cursor-pointer mx-1"
            onClick={() => {
              if (!tokenSort) {
                leftCustomPrice = price_right_final;
                rightCustomPrice = price_left_final;
              } else {
                leftCustomPrice = price_left_final;
                rightCustomPrice = price_right_final;
              }
              setLeftCustomPrice(leftCustomPrice);
              setRightCustomPrice(rightCustomPrice);
              handlePriceToAppropriatePoint();
            }}
          >
            {display_price_left} ~ {display_price_right}
          </span>
          <span className="text-limitOrderInputColor">{tokenY.symbol}</span>
          <ArrowDownV3
            onClick={() => {
              setDisplayedSeedIndex(displayedSeedIndex + 1);
            }}
            className={`transform -rotate-90 ml-1.5 text-primaryText cursor-pointer ${
              seeds.length > 1 && displayedSeedIndex < seeds.length - 1
                ? ''
                : 'hidden'
            }`}
          ></ArrowDownV3>
        </div>
      </div>
    );
  }
  function rewardRangeTip() {
    const tip = intl.formatMessage({ id: 'reward_range_tip' });
    let result: string = `<div class="text-farmText text-xs text-left">${tip}</div>`;
    return result;
  }
  const tokenSort = tokenX.id == currentSelectedPool.token_x;

  function getPair() {
    if (tokenSort) {
      return `(${tokenX.symbol}/${tokenY.symbol})`;
    } else {
      return `(${tokenY.symbol}/${tokenX.symbol})`;
    }
  }

  return (
    <div
      className={`w-full xs:w-full md:w-full flex  mr-6 flex-col justify-between self-stretch xs:mt-5 md:mt-5`}
    >
      <div className=" border border-limitOrderFeeTiersBorderColor rounded-xl p-4">
        <div className="frcb">
          <div className="text-white font-gothamBold flex flex-col text-base ">
            <FormattedMessage
              id="set_price_range"
              defaultMessage="Set Price Range"
            />

            <span className="text-xs font-gotham text-primaryText">
              {getPair()}
            </span>
          </div>

          <div className="rounded-lg p-1 border frcs text-xs text-primaryText border-v3borderColor">
            <span
              className={`whitespace-nowrap min-w-20 px-3 py-1.5 rounded-md cursor-pointer ${
                priceRangeMode === 'by_range'
                  ? 'text-white bg-burrowTabColor bg-opacity-60'
                  : ''
              }`}
              onClick={() => {
                setPriceRangeMode('by_range');
              }}
            >
              <FormattedMessage
                id="by_range"
                defaultMessage={'By range'}
              ></FormattedMessage>
            </span>
            <span
              className={`whitespace-nowrap min-w-20 px-3 py-1.5 rounded-md cursor-pointer ${
                priceRangeMode === 'by_radius'
                  ? 'text-white bg-burrowTabColor bg-opacity-60'
                  : ''
              }`}
              onClick={() => {
                setPriceRangeMode('by_radius');
              }}
            >
              <FormattedMessage
                id="by_radius"
                defaultMessage={'By Radius'}
              ></FormattedMessage>
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between relative flex-grow   pt-4 mt-3  xsm:px-2">
          <div>
            <div className="grid grid-cols-3 gap-3">
              {/* target price */}

              <div className="col-span-3">
                {priceRangeMode === 'by_range' &&
                  quickOptionsMapPoint['full']?.['left_p'] &&
                  quickOptionsMapPoint['full']?.['right_p'] && (
                    <Slider
                      invert={!tokenSort}
                      min={quickOptionsMapPoint['full']?.['left_p']}
                      max={quickOptionsMapPoint['full']?.['right_p']}
                      step={
                        // bin size

                        (currentSelectedPool?.point_delta || 0) * SLOT_NUMBER
                      }
                      values={[leftPoint, rightPoint]}
                      setValues={(values: any) => {
                        setLeftPoint(values[0]);
                        setRightPoint(values[1]);

                        setBinNumber(
                          (values[1] - values[0]) /
                            (currentSelectedPool.point_delta * SLOT_NUMBER)
                        );
                      }}
                    ></Slider>
                  )}
              </div>

              <div
                className={` ${
                  priceRangeMode === 'by_range' ? 'hidden' : ''
                } flex border border-menuMoreBoxBorderColor items-center bg-black bg-opacity-20 rounded-xl p-2.5 col-span-2`}
              >
                <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
                  <FormattedMessage
                    id="target_price"
                    defaultMessage="Target Price"
                  ></FormattedMessage>
                </span>
                {/* {tokenSort ? ( */}
                <PointInputComponent
                  handlePriceToAppropriatePoint={handlePriceToAppropriatePoint}
                  customPrice={targetCustomPrice}
                  getPrice={getTargetPrice}
                  setCustomPrice={setTargetCustomPrice}
                  inputStatus={targetInputStatus}
                  setInputStatus={setTargetInputStatus}
                />
              </div>

              {/* radius */}
              <div
                className={` ${
                  priceRangeMode === 'by_range' ? 'hidden' : ''
                } flex border border-menuMoreBoxBorderColor items-center bg-black bg-opacity-20 rounded-xl p-2.5 col-span-1`}
              >
                <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
                  <FormattedMessage
                    id="radius"
                    defaultMessage="Radius"
                  ></FormattedMessage>
                </span>
                <IntegerInputComponent
                  value={radius}
                  onChange={(value: any) => {
                    setRadius(value);
                  }}
                />
              </div>

              {/* min price */}

              <div className=" flex border border-menuMoreBoxBorderColor items-center bg-black bg-opacity-20 rounded-xl p-2.5 col-span-1">
                <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
                  <FormattedMessage
                    id="min_price"
                    defaultMessage="Min Price"
                  ></FormattedMessage>
                </span>
                {tokenSort ? (
                  <PointInputComponent
                    handlePriceToAppropriatePoint={
                      handlePriceToAppropriatePoint
                    }
                    disbaled={priceRangeMode === 'by_radius'}
                    customPrice={leftCustomPrice}
                    getPrice={getLeftPrice}
                    setCustomPrice={setLeftCustomPrice}
                    inputStatus={leftInputStatus}
                    setInputStatus={setLeftInputStatus}
                  ></PointInputComponent>
                ) : (
                  <PointInputComponent
                    reduceOneSlot={() => {
                      addOneSlot('r');
                    }}
                    addOneSlot={() => {
                      reduceOneSlot('r');
                    }}
                    disbaled={priceRangeMode === 'by_radius'}
                    handlePriceToAppropriatePoint={
                      handlePriceToAppropriatePoint
                    }
                    customPrice={rightCustomPrice}
                    getPrice={getRightPrice}
                    setCustomPrice={setRightCustomPrice}
                    inputStatus={rightInputStatus}
                    setInputStatus={setRightInputStatus}
                  ></PointInputComponent>
                )}
              </div>

              {/* max price */}
              <div className="flex border border-menuMoreBoxBorderColor items-center bg-black bg-opacity-20 rounded-xl p-2.5 col-span-1">
                <span className="text-sm text-primaryText xs:text-xs whitespace-nowrap md:text-xs">
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
                    disbaled={priceRangeMode === 'by_radius'}
                    addOneSlot={() => {
                      addOneSlot('r');
                    }}
                    handlePriceToAppropriatePoint={
                      handlePriceToAppropriatePoint
                    }
                    customPrice={rightCustomPrice}
                    getPrice={getRightPrice}
                    setCustomPrice={setRightCustomPrice}
                    inputStatus={rightInputStatus}
                    setInputStatus={setRightInputStatus}
                  ></PointInputComponent>
                ) : (
                  <PointInputComponent
                    reduceOneSlot={() => {
                      addOneSlot('l');
                    }}
                    addOneSlot={() => {
                      reduceOneSlot('l');
                    }}
                    handlePriceToAppropriatePoint={
                      handlePriceToAppropriatePoint
                    }
                    disbaled={priceRangeMode === 'by_radius'}
                    customPrice={leftCustomPrice}
                    getPrice={getLeftPrice}
                    setCustomPrice={setLeftCustomPrice}
                    inputStatus={leftInputStatus}
                    setInputStatus={setLeftInputStatus}
                  ></PointInputComponent>
                )}
              </div>

              {/* bin number */}
              <div className=" flex border border-menuMoreBoxBorderColor items-center bg-black bg-opacity-20 rounded-xl p-2.5 col-span-1">
                <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
                  <FormattedMessage
                    id="bin_amount"
                    defaultMessage="Bin amount"
                  ></FormattedMessage>
                </span>
                <IntegerInputComponent
                  value={binNumber}
                  disabled={priceRangeMode === 'by_radius'}
                  onChange={(value: any) => {
                    setBinNumber(value);
                  }}
                />
              </div>
            </div>

            {seeds.length ? (
              <div
                className={`relative flex items-start justify-between xsm:justify-end mt-3.5 mb-1`}
              >
                <div className="flex items-center text-sm text-primaryText mr-3 xsm:absolute xsm:left-0">
                  <FormattedMessage id="farm_reward_range" />
                  <div
                    className="text-white text-right ml-1"
                    data-class="reactTip"
                    data-for="rangeTipId"
                    data-place="top"
                    data-html={true}
                    data-tip={rewardRangeTip()}
                  >
                    <QuestionMark></QuestionMark>
                    <ReactTooltip
                      id="rangeTipId"
                      backgroundColor="#1D2932"
                      border
                      borderColor="#7e8a93"
                      effect="solid"
                    />
                  </div>
                </div>
                {get_related_seeds()}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            color: '#3F4A52',
          }}
          className="text-xs mt-3"
        >
          *Only NEAR is needed in the price range you choose.
        </div>
      </div>

      {/* <div
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
            defaultMessage="As long as the market is trading into your range of prices, you will receive trading fees proportional to your liquidity. "
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
      </div> */}
      {/* {isSignedIn ? (
        <GradientButton
          color="#fff"
          className={`w-full h-12 mt-5 text-center text-base text-white focus:outline-none ${
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
      )} */}
    </div>
  );
}

function AddLiquidityButton({
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
  seeds,
  priceRangeMode,
  setPriceRangeMode,
  binNumber,
  setBinNumber,
  curPointInBinBoundry,
  setCurPointInBinBoundry,
  getTokenYAmountByCondition,
  getTokenXAmountByCondition,
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
  seeds: Seed[];
  priceRangeMode: PriceRangeModeType;
  setPriceRangeMode: (mode: PriceRangeModeType) => void;
  binNumber: number;
  setBinNumber: (binNumber: number) => void;
  curPointInBinBoundry: boolean;
  setCurPointInBinBoundry: (curPointInBinBoundry: boolean) => void;
  getTokenYAmountByCondition: any;
  getTokenXAmountByCondition: any;
}) {
  let [leftPoint, setLeftPoint] = useState<number>(0);
  let [rightPoint, setRightPoint] = useState<number>(0);
  const [leftInputStatus, setLeftInputStatus] = useState(false);
  const [rightInputStatus, setRightInputStatus] = useState(false);
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
        space_x: 5,
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
      space_x: 5,
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
          ).isGreaterThanOrEqualTo(tokenYAmount);
      }
    } else if (onlyAddYToken) {
      if (tokenSort) {
        condition2 =
          +tokenYAmount > 0 &&
          new BigNumber(
            getMax(tokenY, tokenYBalanceFromNear)
          ).isGreaterThanOrEqualTo(tokenYAmount);
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
        ).isGreaterThanOrEqualTo(tokenYAmount);
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

  function addLiquidityCurve() {
    const { pool_id, point_delta } = currentSelectedPool;

    const binSize = point_delta * SLOT_NUMBER;

    let liquidityInfo: AddLiquidityInfo[];

    if (onlyAddYToken) {
      // left side
      const Y = tokenYAmount;

      const D = new Big(Y)
        .mul(2)
        .div(new Big(binNumber).mul(new Big(binNumber).plus(1)))
        .div(binSize);

      liquidityInfo = new Array(binNumber).map((item, index) => {
        const height = new Big(index + 1).mul(D).toFixed(0);
        const left_p = leftPoint + binSize * index;
        const right_p = leftPoint + binSize * (index + 1);

        const amount_y = toNonDivisibleNumber(
          tokenY.decimals,
          new Big(height).mul(binSize).toFixed()
        );

        return {
          pool_id,
          left_point: left_p,
          right_point: right_p,
          amount_x: '0',
          amount_y,
        };
      });
    }

    if (onlyAddXToken) {
      const X = tokenSort ? tokenYAmount : tokenXAmount;

      const D = new Big(X)
        .mul(2)
        .div(new Big(binNumber).mul(new Big(binNumber).plus(1)))
        .div(binSize);

      liquidityInfo = new Array(binNumber).map((item, index) => {
        const height = new Big(binNumber - index).mul(D).toFixed(0);
        const left_p = leftPoint + binSize * index;
        const right_p = leftPoint + binSize * (index + 1);

        const amount_x = toNonDivisibleNumber(
          tokenX.decimals,
          new Big(height).mul(binSize).toFixed()
        );

        return {
          pool_id,
          left_point: left_p,
          right_point: right_p,
          amount_x,
          amount_y: '0',
        };
      });
    }

    if (!onlyAddXToken || !onlyAddYToken) {
      if (curPointInBinBoundry) {
        const leftBinSize = Math.floor(binNumber / 2);
        const rightBinSize = binNumber - leftBinSize;

        const X_left = tokenYAmount;

        const Y_right = tokenXAmount;

        const D_left = new Big(X_left)
          .mul(2)
          .div(new Big(leftBinSize).mul(new Big(leftBinSize).plus(1)))
          .div(binSize);

        const D_right = new Big(Y_right)
          .mul(2)
          .div(new Big(rightBinSize).mul(new Big(rightBinSize).plus(1)))
          .div(binSize);

        liquidityInfo = new Array(leftBinSize).map((item, index) => {
          const height = new Big(index + 1).mul(D_left).toFixed(0);
          const left_p = leftPoint + binSize * index;
          const right_p = leftPoint + binSize * (index + 1);

          const amount_y = toNonDivisibleNumber(
            tokenY.decimals,
            new Big(height).mul(binSize).toFixed()
          );

          return {
            pool_id,
            left_point: left_p,
            right_point: right_p,
            amount_x: '0',
            amount_y,
          };
        });

        liquidityInfo = liquidityInfo.concat(
          new Array(rightBinSize).map((item, index) => {
            const height = new Big(rightBinSize - index)
              .mul(D_right)
              .toFixed(0);
            const left_p = leftPoint + binSize * (leftBinSize + index);
            const right_p = leftPoint + binSize * (leftBinSize + index + 1);

            const amount_x = toNonDivisibleNumber(
              tokenX.decimals,
              new Big(height).mul(binSize).toFixed()
            );

            return {
              pool_id,
              left_point: left_p,
              right_point: right_p,
              amount_x,
              amount_y: '0',
            };
          })
        );
      } else {
        const leftBinSize = Math.floor(binNumber / 2) + 1;
        const rightBinSize = binNumber - leftBinSize - 1;

        const D_left = new Big(tokenYAmount).div(
          new Big(
            new Big(((leftBinSize - 1) * leftBinSize) / 2).mul(binSize)
          ).plus(new Big(leftBinSize).mul(currentPoint - leftPoint))
        );

        if (leftBinSize - 1 > 0) {
          const addLpList = new Array(leftBinSize - 1).map((item, index) => {
            const height = new Big(index + 1).mul(D_left).toFixed(0);
            const left_p = leftPoint + binSize * index;
            const right_p = leftPoint + binSize * (index + 1);

            const amount_y = toNonDivisibleNumber(
              tokenY.decimals,
              new Big(height).mul(binSize).toFixed()
            );

            return {
              pool_id,
              left_point: left_p,
              right_point: right_p,
              amount_x: '0',
              amount_y: amount_y,
            };
          });
          liquidityInfo = (liquidityInfo || []).concat(addLpList);
        }

        // middle bin

        const tokenYMiddleAmount = new Big(currentPoint)
          .minus(leftPoint + Number(leftBinSize - 1) * binSize)
          .mul(D_left)
          .mul(leftBinSize)
          .toFixed(0);

        const tokenXMiddleAmount = getTokenXAmountByCondition({
          amount: tokenYMiddleAmount,
          leftPoint: leftPoint + Number(leftBinSize - 1) * binSize,
          rightPoint: leftPoint + leftBinSize * binSize,
          currentPoint,
        });

        liquidityInfo = (liquidityInfo || []).concat([
          {
            pool_id,
            left_point: leftPoint + Number(leftBinSize - 1) * binSize,
            right_point: leftPoint + leftBinSize * binSize,
            amount_x: toNonDivisibleNumber(tokenX.decimals, tokenXMiddleAmount),
            amount_y: toNonDivisibleNumber(tokenY.decimals, tokenYMiddleAmount),
          },
        ]);

        // right side

        if (rightBinSize > 1) {
          const newtokenXAmount = new Big(tokenXAmount)
            .minus(tokenXMiddleAmount)
            .toFixed(0);

          const D_right = new Big(newtokenXAmount)
            .mul(2)
            .div(new Big(((rightBinSize - 1) * rightBinSize) / 2).mul(binSize));

          const addLpList = new Array(rightBinSize).map((item, index) => {
            const height = new Big(rightBinSize - index)
              .mul(D_right)
              .toFixed(0);
            const left_p = leftPoint + leftBinSize + index * binSize;
            const right_p = left_p + binSize;

            const amount_x = toNonDivisibleNumber(
              tokenX.decimals,
              new Big(height).mul(binSize).toFixed()
            );

            return {
              pool_id,
              left_point: left_p,
              right_point: right_p,
              amount_x,
              amount_y: '0',
            };
          });
          liquidityInfo = (liquidityInfo || []).concat(addLpList);
        }

        //
      }
    }

    return batch_add_liquidity({
      liquidityInfo,
      token_x: tokenX,
      token_y: tokenY,
    });
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

  const tokenSort = tokenX.id == currentSelectedPool.token_x;
  const isAddLiquidityDisabled = getButtonStatus();
  return (
    <div
      className={`w-full xs:w-full md:w-full flex flex-col justify-between self-stretch xs:mt-5 md:mt-5`}
    >
      {isSignedIn ? (
        <GradientButton
          color="#fff"
          className={`w-full h-12 mt-5 text-center text-base text-white focus:outline-none ${
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
  const mobileDevice = isMobile();
  return (
    <div
      style={{ width: mobileDevice ? '' : '372px' }}
      className={`relative w-full xs:w-full md:w-full flex flex-col justify-between  self-stretch xs:mt-5 md:mt-5`}
    >
      <div className="text-primaryText text-sm ml-2">
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
      <div className="flex flex-col justify-between relative flex-grow bg-black bg-opacity-10 rounded-xl px-2.5 py-4 mt-3  xsm:px-2">
        {/* range chart area */}
        <div className="flex flex-col items-center justify-center my-24 xsm:my-12">
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
          {/* <div className="flex items-center justify-between mt-3">
            <WarningMark className="text-sm flex-shrink-0 text-primaryText"></WarningMark>
            {quickOptions.map((item: number, index) => {
              return (
                <div
                  key={index}
                  className="flex items-center justify-center rounded-lg h-6 py-0.5 xs:px-1 md:px-1  lg:px-1.5 box-content font-sans text-v3LightGreyColor text-sm whitespace-nowrap"
                  style={{ border: '1px solid rgba(126, 138, 147, 0.2)' }}
                >
                  ± {item}%
                </div>
              );
            })}
            <div
              className="flex items-center justify-center rounded-lg h-6 py-0.5 xs:px-1 md:px-1  lg:px-1.5 box-content font-sans text-v3LightGreyColor text-sm whitespace-nowrap"
              style={{ border: '1px solid rgba(126, 138, 147, 0.2)' }}
            >
              <FormattedMessage id="full_range" />
            </div>
          </div> */}
        </div>
      </div>
      <GradientButton
        color="#fff"
        className={`w-full h-12 mt-5 text-center text-base text-white focus:outline-none opacity-30`}
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
  inputStatus,
  setInputStatus,
  disbaled,
}: any) {
  return (
    <div className="flex items-center justify-between ">
      {/* <div
        className="flex w-6 h-6  flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor cursor-pointer"
        onClick={() => {
          reduceOneSlot('r');
        }}
      >
        <ReduceButton className="cursor-pointer"></ReduceButton>
      </div> */}
      <input
        type="number"
        placeholder="0.0"
        step="any"
        className={`text-base font-gothamBold mx-2 text-left ${
          disbaled ? 'text-primaryText' : 'text-white'
        }`}
        onBlur={() => {
          handlePriceToAppropriatePoint();
          setInputStatus(false);
        }}
        disabled={disbaled}
        value={inputStatus ? customPrice : getPrice()}
        onChange={({ target }) => {
          setInputStatus(true);
          const inputPrice = target.value;
          setCustomPrice(inputPrice);
        }}
      />
      {/* <div
        className="flex w-6 h-6 flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor cursor-pointer"
        onClick={() => {
          addOneSlot('r');
        }}
      >
        <AddButton className="cursor-pointer"></AddButton>
      </div> */}
    </div>
  );
}

function IntegerInputComponent({ value, onChange, disabled }: any) {
  const removeLeadingZeros = (s: string) => {
    const oldLen = s.length;
    s = s.replace(/^0+/, '');
    if (s.length === 0 && oldLen > 0) {
      s = '0';
    }
    return s;
  };

  const handleChange = (val: string) => {
    val = val.replace(/[^\d]/g, '');
    val = removeLeadingZeros(val);

    onChange(val);
  };

  return (
    <div className="flex items-center justify-between ">
      {/* <div
        className="flex w-6 h-6  flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor cursor-pointer"
        onClick={() => {
          reduceOneSlot('r');
        }}
      >
        <ReduceButton className="cursor-pointer"></ReduceButton>
      </div> */}
      <input
        type="text"
        className={`text-base font-gothamBold mx-2 text-left ${
          disabled ? 'text-primaryText' : 'text-white'
        }`}
        disabled={disabled}
        value={value}
        onChange={({ target }) => {
          handleChange(target.value);
        }}
      />
      {/* <div
        className="flex w-6 h-6 flex-shrink-0 items-center justify-center rounded-md bg-v3BlackColor cursor-pointer"
        onClick={() => {
          addOneSlot('r');
        }}
      >
        <AddButton className="cursor-pointer"></AddButton>
      </div> */}
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
          defaultMessage="The market price is outside the price range. Add liquidity for the corresponding token."
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
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
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
    return isSignedIn ? r : '-';
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
        className={`bg-black bg-opacity-20 rounded-xl p-3 mt-3 border border-inputV3BorderColor hover:border-inputV3BorderHoverColor ${
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
            className={`text-base gotham_bold ml-5 whitespace-nowrap ${
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
              <FormattedMessage id="balance" />:{' '}
              <span
                className="cursor-pointer hover:text-white underline"
                onClick={() => {
                  changeAmount(maxBalance);
                }}
              >
                {getBalance()}
              </span>
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
