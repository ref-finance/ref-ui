import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  createContext,
} from 'react';

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
  get_matched_seeds_for_dcl_pool,
  get_all_seeds,
  get_pool_id,
  get_pool_name,
  openUrl,
  getBinPointByPrice,
  getBinPointByPoint,
  get_l_amount_by_condition,
  UserLiquidityInfo,
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
  ONLY_ZEROS,
} from '~utils/numbers';
import { WalletContext } from '../../utils/wallets-integration';
import _, { forEach, set } from 'lodash';
import BigNumber from 'bignumber.js';
import { toRealSymbol } from '../../utils/token';
import ReactTooltip from 'react-tooltip';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { BlueCircleLoading } from '../../components/layout/Loading';
import { isMobile } from '../../utils/device';
import { SelectedIcon, ArrowDownV3 } from '../../components/icon/swapV3';
import ReactSlider from 'react-slider';
import Big from 'big.js';
import { SelectTokenDCL } from '../../components/forms/SelectToken';
import { SliderCurColor } from '~components/icon/Info';
import {
  CurveShape,
  SpotShape,
  BidAskShape,
} from '../Orderly/components/Common/Icons';
import DclChart from '../../components/d3Chart/DclChart';
import { IChartData } from '../../components/d3Chart/interfaces';
import {
  IAddLiquidityInfo,
  IAddLiquidityInfoHelp,
  LiquidityShape,
  PriceRangeModeType,
} from './interfaces';
import {
  get_custom_config_for_chart,
  get_default_config_for_chart,
  SLIDER_BIN_NUMBER,
  RADIUS_DEFAULT_NUMBER,
  max_nft_divisional_per_side,
} from '../../components/d3Chart/config';
import {
  IChartItemConfig,
  IChartConfig,
} from '../../components/d3Chart/interfaces';
import { isInvalid } from '../../components/d3Chart/utils';
const LiquidityProviderData = createContext(null);
export default function AddYourLiquidityPageV3() {
  const [tokenX, setTokenX] = useState<TokenMetadata>(null);
  const [tokenY, setTokenY] = useState<TokenMetadata>(null);
  const [tokenXAmount, setTokenXAmount] = useState('');
  const [tokenYAmount, setTokenYAmount] = useState('');
  const [leftPoint, setLeftPoint] = useState<number>();
  const [rightPoint, setRightPoint] = useState<number>();
  const [currentPoint, setCurrentPoint] = useState<number>();
  const [onlyAddYToken, setOnlyAddYToken] = useState(false);
  const [onlyAddXToken, setOnlyAddXToken] = useState(false);
  const [invalidRange, setInvalidRange] = useState(false);
  const [currentSelectedPool, setCurrentSelectedPool] =
    useState<PoolInfo>(null);

  const [listPool, setListPool] = useState<PoolInfo[]>([]);
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>({});
  const [currentPools, setCurrentPools] =
    useState<Record<string, PoolInfo>>(null);
  const [tokenXBalanceFromNear, setTokenXBalanceFromNear] = useState<string>();
  const [tokenYBalanceFromNear, setTokenYBalanceFromNear] = useState<string>();

  const [feeBoxStatus, setFeeBoxStatus] = useState(true);
  const [buttonSort, setButtonSort] = useState(false);
  const [selectHover, setSelectHover] = useState(false);
  const [hoverFeeBox, setHoverFeeBox] = useState<boolean>(false);

  // abandon
  const [seed_list, set_seed_list] = useState<Seed[]>();
  const [related_seeds, set_related_seeds] = useState<Seed[]>([]);

  // new
  const [binNumber, setBinNumber] = useState();
  const [liquidityShape, setLiquidityShape] = useState<LiquidityShape>('Spot');
  const [topPairs, setTopPairs] = useState([]);
  const [SLOT_NUMBER, SET_SLOT_NUMBER] = useState<number>();
  const [BIN_WIDTH, SET_BIN_WIDTH] = useState<number>();
  const [token_amount_tip, set_token_amount_tip] = useState<string>();
  const [only_suppport_spot_shape, set_only_suppport_spot_shape] =
    useState<boolean>(false);
  const [switch_pool_loading, set_switch_pool_loading] =
    useState<boolean>(true);
  const [new_user_liquidities, set_new_user_liquidities] = useState<
    UserLiquidityInfo[]
  >([]);

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
  const OPEN_CREATE_POOL_ENTRY = false;

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
  // new
  useEffect(() => {
    // init
    if (currentSelectedPool?.pool_id) {
      const { current_point, point_delta } = currentSelectedPool;
      const n = get_slot_number_in_a_bin();
      const bin_width = n * point_delta;
      SET_SLOT_NUMBER(n);
      SET_BIN_WIDTH(bin_width);
      setCurrentPoint(current_point);
      set_switch_pool_loading(false);
    }
  }, [currentSelectedPool]);
  // 中文 如果只有一个 bin 且 双边 则只允许设置成spot模式
  useEffect(() => {
    set_only_suppport_spot_shape(false);
    if (currentSelectedPool) {
      const { point_delta } = currentSelectedPool;
      if (leftPoint <= currentPoint && rightPoint > currentPoint) {
        // inrange
        const binWidth = SLOT_NUMBER * point_delta;
        const binNumber = (rightPoint - leftPoint) / binWidth;
        if (binNumber == 1) {
          setLiquidityShape('Spot');
          set_only_suppport_spot_shape(true);
          if (tokenXAmount) {
            changeTokenXAmount(tokenXAmount);
          } else if (tokenYAmount) {
            changeTokenYAmount(tokenYAmount);
          }
        }
      }
    }
  }, [
    leftPoint,
    rightPoint,
    currentPoint,
    currentSelectedPool,
    liquidityShape,
  ]);
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
      set_switch_pool_loading(true);
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
    /*if (sort) {*/
    if (!onlyAddXToken && liquidityShape === 'Spot') {
      const amount_result = getTokenYAmountByCondition({
        amount,
        leftPoint: leftPoint,
        rightPoint: rightPoint,
        currentPoint: currentPoint,
      });
      setTokenYAmount(amount_result);
    }
    /*} else {
      if (!onlyAddYToken && liquidityShape === 'Spot') {
        const amount_result = getTokenXAmountByCondition({
          amount,
          leftPoint,
          rightPoint,
          currentPoint,
        });
        setTokenYAmount(amount_result);
      }
    }*/
  }
  function changeTokenYAmount(amount: string = '0') {
    const { token_x, token_y } = currentSelectedPool;
    const sort = tokenX.id == token_x;
    setTokenYAmount(amount);
    /*if (sort) {*/
    if (!onlyAddYToken && liquidityShape === 'Spot') {
      const amount_result = getTokenXAmountByCondition({
        amount,
        leftPoint,
        rightPoint,
        currentPoint,
      });
      setTokenXAmount(amount_result);
    }
    /*} else {
      if (!onlyAddXToken && liquidityShape === 'Spot') {
        const amount_result = getTokenYAmountByCondition({
          amount,
          leftPoint: leftPoint,
          rightPoint: rightPoint,
          currentPoint: currentPoint,
        });
        setTokenXAmount(amount_result);
      }
    }*/
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

    if (liquidityShape !== 'Spot') return;
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
  // start
  function get_slot_number_in_a_bin() {
    const pool_id = currentSelectedPool?.pool_id;
    const { bin } = get_default_config_for_chart() as IChartItemConfig;
    const custom_config: IChartConfig = get_custom_config_for_chart();
    const slots = custom_config[pool_id]?.bin || bin;
    return slots;
  }
  /**
   * step1 当数据发生改变
   *       leftPoint, rightPoint 有效
   *       tokenXAmount, tokenYAmount 至少有一个有值
   *       ===> 可以触发
   * step2 根据当前数据获实时获取新的 liquidtiy数据--->改成UserLiquidityInfo数据格式
   * step3 把新增的liquidity传递给Chart组件，
   * step4 chart组件把用户已有的liquidtiy + 新增的，划分成bin数据，生成新的图表
   * step5 疑问；？实时修改图表 会导致效率什么问题吗？
   */
  function generate_new_user_chart() {
    if (
      !isInvalid(leftPoint) &&
      !isInvalid(rightPoint) &&
      (+tokenXAmount > 0 || +tokenYAmount > 0)
    ) {
      let new_nfts: any;
      if (liquidityShape == 'Spot') {
        const new_nft = getLiquiditySpot();
        new_nfts = [new_nft];
      } else {
        new_nfts = getLiquidityForCurveAndBidAskMode();
        if (!new_nfts) return;
      }
      const processed_new_nfts = process_liquidities(new_nfts);
      set_new_user_liquidities(processed_new_nfts);
    } else {
      set_new_user_liquidities([]);
    }
  }
  function getLiquiditySpot() {
    const { pool_id } = currentSelectedPool;
    return {
      pool_id,
      left_point: leftPoint,
      right_point: rightPoint,
      amount_x: toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0'),
      amount_y: toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0'),
      token_x: tokenX,
      token_y: tokenY,
      // amount_x: tokenSort
      //   ? toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0')
      //   : toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0'),
      // amount_y: tokenSort
      //   ? toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0')
      //   : toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0'),
      // token_x: tokenSort ? tokenX : tokenY,
      // token_y: tokenSort ? tokenY : tokenX,
    };
  }
  function getLiquidityForCurveAndBidAskMode() {
    /**
     *  已知条件:
     *  bin的数量、一个bin里 slot的数量、leftPoint、rightPoint、tokenXAmount、tokenYAmount
     *  当前点位为point，以slot为单位 下一跳是 point + slot
     *  当前点位为point，以bin为单位 下一跳是 point + bin * slots
     *  最小的bin的高度就是等差的值 为dis
     **/
    let nftList: IAddLiquidityInfo[] = [];
    const get_x_nfts =
      liquidityShape == 'Curve'
        ? get_decline_pattern_nfts
        : get_rise_pattern_nfts;
    const get_y_nfts =
      liquidityShape == 'Curve'
        ? get_rise_pattern_nfts
        : get_decline_pattern_nfts;
    if (onlyAddYToken) {
      nftList = get_y_nfts({
        left_point: leftPoint,
        right_point: rightPoint,
        token: tokenY,
        token_amount: tokenYAmount,
        formula_fun: formula_of_token_y,
        is_token_y: true,
      });
    }
    if (onlyAddXToken) {
      nftList = get_x_nfts({
        left_point: leftPoint,
        right_point: rightPoint,
        token: tokenX,
        token_amount: tokenXAmount,
        formula_fun: formula_of_token_x,
        is_token_x: true,
      });
    }
    if (!onlyAddXToken && !onlyAddYToken) {
      /**
       * step1 先判断左侧bin的数量是否 > 1,是的话，左侧包含当前点作等差，否则右侧包含当前点位作等差
       * step2 分配好后，获得对右侧的最小token数量要求
       * step3 另外一侧 总的token数量减去 当前bin中包含的，剩下的 作单边 等差分配即可
       */
      const { point_delta, current_point } = currentSelectedPool;
      const current_l_point = getBinPointByPoint(
        point_delta,
        SLOT_NUMBER,
        current_point,
        'floor'
      );
      const current_r_point = getBinPointByPoint(
        point_delta,
        SLOT_NUMBER,
        current_point,
        'ceil'
      );
      const slot_number_in_a_bin = SLOT_NUMBER;
      const binWidth = slot_number_in_a_bin * point_delta;
      const bin_number_left = (current_point - leftPoint) / binWidth;
      set_token_amount_tip('');
      if (liquidityShape == 'Curve') {
        if (bin_number_left > 1) {
          // 左侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_x_amount_needed } =
            get_y_nfts_contain_current_curve({
              left_point: leftPoint,
              right_point: current_r_point,
            });
          nftList_y = addLiquidityInfoList;
          const remain_token_x_amount = Big(tokenXAmount).minus(
            min_token_x_amount_needed
          );
          if (remain_token_x_amount.lt(0)) {
            // 给出提示 token x 数量太少不能添加
            set_token_amount_tip(`${tokenX.symbol} Token amount is too little`);
            return;
          } else {
            nftList_x = get_decline_pattern_nfts({
              left_point: current_r_point,
              right_point: rightPoint,
              token: tokenX,
              token_amount: remain_token_x_amount.toFixed(),
              formula_fun: formula_of_token_x,
              is_token_x: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        } else {
          // 右侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_y_amount_needed } =
            get_x_nfts_contain_current_curve({
              left_point: current_l_point,
              right_point: rightPoint,
            });
          nftList_x = addLiquidityInfoList;

          const remain_token_y_amount = Big(tokenYAmount).minus(
            min_token_y_amount_needed
          );
          if (remain_token_y_amount.lt(0)) {
            // 给出提示 token y 数量太少不能添加
            set_token_amount_tip(`${tokenY.symbol} Token amount is too little`);
            return;
          } else {
            nftList_y = get_rise_pattern_nfts({
              left_point: leftPoint,
              right_point: current_l_point,
              token: tokenY,
              token_amount: remain_token_y_amount.toFixed(),
              formula_fun: formula_of_token_y,
              is_token_y: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        }
      } else {
        if (bin_number_left > 1) {
          // 左侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_x_amount_needed } =
            get_y_nfts_contain_current_bid_ask({
              left_point: leftPoint,
              right_point: current_r_point,
            });
          nftList_y = addLiquidityInfoList;
          const remain_token_x_amount = Big(tokenXAmount).minus(
            min_token_x_amount_needed
          );
          if (remain_token_x_amount.lt(0)) {
            // 给出提示 token x 数量太少不能添加
            set_token_amount_tip(`${tokenX.symbol} Token amount is too little`);
            return;
          } else {
            nftList_x = get_rise_pattern_nfts({
              left_point: current_r_point,
              right_point: rightPoint,
              token: tokenX,
              token_amount: remain_token_x_amount.toFixed(),
              formula_fun: formula_of_token_x,
              is_token_x: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        } else {
          // 右侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_y_amount_needed } =
            get_x_nfts_contain_current_bid_ask({
              left_point: current_l_point,
              right_point: rightPoint,
            });
          nftList_x = addLiquidityInfoList;

          const remain_token_y_amount = Big(tokenYAmount).minus(
            min_token_y_amount_needed
          );
          if (remain_token_y_amount.lt(0)) {
            // 给出提示 token y 数量太少不能添加
            set_token_amount_tip(`${tokenY.symbol} Token amount is too little`);
            return;
          } else {
            nftList_y = get_decline_pattern_nfts({
              left_point: leftPoint,
              right_point: current_l_point,
              token: tokenY,
              token_amount: remain_token_y_amount.toFixed(),
              formula_fun: formula_of_token_y,
              is_token_y: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        }
      }
    }
    return nftList;
  }
  /**
   * curve 模式下，左侧（y）包含当前点位的 nfts划分
   * 此区间bin的数量要求 > 1
   * 双边
   * @param param0
   * @returns
   */
  function get_y_nfts_contain_current_curve({
    left_point,
    right_point,
  }: {
    left_point: number;
    right_point: number;
  }) {
    /**
     * 做等差时，包含当前点位的bin作为一个nft，宽度没必要跟其它的nft宽度一致，从而可以得到对另外一个token数量的最小要求
     * 另外一边做等差时，总的数量 - 当前点位的bin中包含的数量，剩下的做等差
     * 给的条件是左点位，大于当前点位的右点位
     * step 1 把包含当前点位bin 单独划分出来作为一个nft
     * step 2 把剩余的bin 划分若干个nft
     * step 3 总的nft 它们 token amount 之和固定，求出等差
     * step 4 求出等差后 得到包含当前点位的bin对另外一半的最低数量要求，数量满足就可以添加，不满足就不可以添加并给出提示
     */

    /**
     * 从左往右逐渐上升模式
     * 从左往右计算
     * e.g.
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenYAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenYAmount;
     * ===>dis = tokenYAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */

    const { pool_id, point_delta, current_point } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;

    const contain_cur_nft_left_point = right_point - binWidth;
    const contain_cur_nft_right_point = right_point;

    const exclude_cur_left_point = left_point;
    const exclude_cur_right_point = contain_cur_nft_left_point;

    const exclude_cur_total_bin_number =
      (exclude_cur_right_point - exclude_cur_left_point) / binWidth;
    let exclude_cur_total_nft_number;
    let exclude_cur_bin_number_in_a_nft;
    if (exclude_cur_total_bin_number < max_nft_divisional_per_side) {
      exclude_cur_bin_number_in_a_nft = 1;
      exclude_cur_total_nft_number = exclude_cur_total_bin_number;
    } else {
      exclude_cur_bin_number_in_a_nft = Math.floor(
        exclude_cur_total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(
        exclude_cur_total_bin_number % max_nft_divisional_per_side
      );
      exclude_cur_total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth =
      point_delta * slot_number_in_a_bin * exclude_cur_bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < exclude_cur_total_nft_number; i++) {
      const left_i_point = exclude_cur_left_point + nftWidth * i;
      let right_i_point;
      if (i == exclude_cur_total_nft_number - 1) {
        right_i_point = exclude_cur_right_point;
      } else {
        right_i_point = exclude_cur_left_point + nftWidth * (i + 1);
      }
      const const_i = Big(i + 1).mul(
        formula_of_token_y(left_i_point, right_i_point)
      );
      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }

    const const_last = Big(exclude_cur_total_nft_number + 1).mul(
      formula_of_token_y(contain_cur_nft_left_point, current_point + 1)
    );
    total_const = total_const.plus(const_last);

    addLiquidityInfoHelp[exclude_cur_total_nft_number] = {
      left_point: contain_cur_nft_left_point,
      right_point: contain_cur_nft_right_point,
      const_value: const_last.toFixed(),
    };

    let min_token_x_amount_needed_nonDivisible;
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0')
      ).div(total_const);
      for (let i = 0; i < exclude_cur_total_nft_number + 1; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_y = Big(dis).mul(const_value).toFixed(0);
        let amount_x;
        if (i == exclude_cur_total_nft_number) {
          amount_x = dis
            .mul(exclude_cur_total_nft_number + 1)
            .mul(
              formula_of_token_x(current_point + 1, contain_cur_nft_right_point)
            )
            .toFixed(0);
          min_token_x_amount_needed_nonDivisible = amount_x;
        }
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x: amount_x || '0',
          amount_y: amount_y,
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }

    return {
      min_token_x_amount_needed_nonDivisible,
      addLiquidityInfoList,
      min_token_x_amount_needed: toReadableNumber(
        tokenX.decimals,
        min_token_x_amount_needed_nonDivisible
      ),
    };
  }
  /**
   * curve 模式下，右侧（x）包含当前点位的 nfts划分
   * 此区间bin的数量要求 > 1
   * 双边
   * @param param0
   * @returns
   */
  function get_x_nfts_contain_current_curve({
    left_point,
    right_point,
  }: {
    left_point: number;
    right_point: number;
  }) {
    /**
     * 做等差时，包含当前点位的bin作为一个nft，宽度没必要跟其它的nft宽度一致，从而可以得到对另外一个token数量的最小要求
     * 另外一边做等差时，总的数量 - 当前点位的bin中包含的数量，剩下的做等差
     * 给的条件是左点位，大于当前点位的右点位
     * step 1 把包含当前点位bin 单独划分出来作为一个nft
     * step 2 把剩余的bin 划分若干个nft
     * step 3 总的nft 它们 token amount 之和固定，求出等差
     * step 4 求出等差后 得到包含当前点位的bin对另外一半的最低数量要求，数量满足就可以添加，不满足就不可以添加并给出提示
     */

    /**
     * 从左往右逐渐下降模式
     * 从右往左计算
     * e.g.
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenXAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenXAmount;
     * ===>dis = tokenXAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */
    const { pool_id, point_delta, current_point } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;

    // 不同点1
    const contain_cur_nft_left_point = left_point;
    const contain_cur_nft_right_point = left_point + binWidth;

    // 不同点2
    const exclude_cur_left_point = contain_cur_nft_right_point;
    const exclude_cur_right_point = right_point;

    const exclude_cur_total_bin_number =
      (exclude_cur_right_point - exclude_cur_left_point) / binWidth;
    let exclude_cur_total_nft_number;
    let exclude_cur_bin_number_in_a_nft;
    if (exclude_cur_total_bin_number < max_nft_divisional_per_side) {
      exclude_cur_bin_number_in_a_nft = 1;
      exclude_cur_total_nft_number = exclude_cur_total_bin_number;
    } else {
      exclude_cur_bin_number_in_a_nft = Math.floor(
        exclude_cur_total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(
        exclude_cur_total_bin_number % max_nft_divisional_per_side
      );
      exclude_cur_total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth =
      point_delta * slot_number_in_a_bin * exclude_cur_bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < exclude_cur_total_nft_number; i++) {
      // 不同点3
      let left_i_point;
      let right_i_point;
      if (i == exclude_cur_total_nft_number - 1) {
        left_i_point = exclude_cur_left_point;
      } else {
        left_i_point = exclude_cur_right_point - nftWidth * (i + 1);
      }
      right_i_point = exclude_cur_right_point - nftWidth * i;
      const const_i = Big(i + 1).mul(
        formula_of_token_x(left_i_point, right_i_point)
      );

      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }

    // 不同点4
    const const_last = Big(exclude_cur_total_nft_number + 1).mul(
      formula_of_token_x(current_point + 1, contain_cur_nft_right_point)
    );
    total_const = total_const.plus(const_last);

    addLiquidityInfoHelp[exclude_cur_total_nft_number] = {
      left_point: contain_cur_nft_left_point,
      right_point: contain_cur_nft_right_point,
      const_value: const_last.toFixed(),
    };

    // 不同点5
    let min_token_y_amount_needed_nonDivisible;
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0')
      ).div(total_const);
      for (let i = 0; i < exclude_cur_total_nft_number + 1; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_x = Big(dis).mul(const_value).toFixed(0);
        let amount_y;
        if (i == exclude_cur_total_nft_number) {
          amount_y = dis
            .mul(exclude_cur_total_nft_number + 1)
            .mul(formula_of_token_y(left_point, current_point + 1))
            .toFixed(0);
          min_token_y_amount_needed_nonDivisible = amount_y;
        }
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x,
          amount_y: amount_y || '0',
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }

    return {
      min_token_y_amount_needed_nonDivisible,
      addLiquidityInfoList,
      min_token_y_amount_needed: toReadableNumber(
        tokenY.decimals,
        min_token_y_amount_needed_nonDivisible
      ),
    };
  }
  /**
   * bid ask 模式下，右侧（x）包含当前点位的 nfts划分
   * 此区间bin的数量要求 > 1
   * 双边
   * @param param0
   * @returns
   */
  function get_x_nfts_contain_current_bid_ask({
    left_point,
    right_point,
  }: {
    left_point: number;
    right_point: number;
  }) {
    /**
     * 做等差时，包含当前点位的bin作为一个nft，宽度没必要跟其它的nft宽度一致，从而可以得到对另外一个token数量的最小要求
     * 另外一边做等差时，总的数量 - 当前点位的bin中包含的数量，剩下的做等差
     * 给的条件是左点位，大于当前点位的右点位
     * step 1 把包含当前点位bin 单独划分出来作为一个nft
     * step 2 把剩余的bin 划分若干个nft
     * step 3 总的nft 它们 token amount 之和固定，求出等差
     * step 4 求出等差后 得到包含当前点位的bin对另外一半的最低数量要求，数量满足就可以添加，不满足就不可以添加并给出提示
     */

    /**
     * 从左往右逐渐上升模式
     * 从左往右计算
     * e.g.
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenXAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenXAmount;
     * ===>dis = tokenXAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */
    const { pool_id, point_delta, current_point } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;

    // 不同点1
    const contain_cur_nft_left_point = left_point;
    const contain_cur_nft_right_point = left_point + binWidth;

    // 不同点2
    const exclude_cur_left_point = contain_cur_nft_right_point;
    const exclude_cur_right_point = right_point;

    const exclude_cur_total_bin_number =
      (exclude_cur_right_point - exclude_cur_left_point) / binWidth;
    let exclude_cur_total_nft_number;
    let exclude_cur_bin_number_in_a_nft;
    if (exclude_cur_total_bin_number < max_nft_divisional_per_side) {
      exclude_cur_bin_number_in_a_nft = 1;
      exclude_cur_total_nft_number = exclude_cur_total_bin_number;
    } else {
      exclude_cur_bin_number_in_a_nft = Math.floor(
        exclude_cur_total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(
        exclude_cur_total_bin_number % max_nft_divisional_per_side
      );
      exclude_cur_total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth =
      point_delta * slot_number_in_a_bin * exclude_cur_bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < exclude_cur_total_nft_number; i++) {
      // 不同点3
      const left_i_point = exclude_cur_left_point + nftWidth * i;
      let right_i_point;
      if (i == exclude_cur_total_nft_number - 1) {
        right_i_point = exclude_cur_right_point;
      } else {
        right_i_point = exclude_cur_left_point + nftWidth * (i + 1);
      }
      const const_i = Big(i + 2).mul(
        formula_of_token_x(left_i_point, right_i_point)
      );

      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i + 1] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }

    // 不同点4
    const const_last = Big(1).mul(
      formula_of_token_x(current_point + 1, contain_cur_nft_right_point)
    );
    total_const = total_const.plus(const_last);

    addLiquidityInfoHelp[0] = {
      left_point: contain_cur_nft_left_point,
      right_point: contain_cur_nft_right_point,
      const_value: const_last.toFixed(),
    };

    // 不同点5
    let min_token_y_amount_needed_nonDivisible;
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(tokenX.decimals, tokenXAmount || '0')
      ).div(total_const);
      for (let i = 0; i < exclude_cur_total_nft_number + 1; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_x = Big(dis).mul(const_value).toFixed(0);
        let amount_y;
        if (i == 0) {
          amount_y = dis
            .mul(formula_of_token_y(left_point, current_point + 1))
            .toFixed(0);
          min_token_y_amount_needed_nonDivisible = amount_y;
        }
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x,
          amount_y: amount_y || '0',
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }

    return {
      min_token_y_amount_needed_nonDivisible,
      addLiquidityInfoList,
      min_token_y_amount_needed: toReadableNumber(
        tokenY.decimals,
        min_token_y_amount_needed_nonDivisible
      ),
    };
  }
  /**
   * bid ask 模式下，左侧（y）包含当前点位的 nfts划分
   * 此区间bin的数量要求 > 1
   * 双边
   * @param param0
   * @returns
   */
  function get_y_nfts_contain_current_bid_ask({
    left_point,
    right_point,
  }: {
    left_point: number;
    right_point: number;
  }) {
    /**
     * 做等差时，包含当前点位的bin作为一个nft，宽度没必要跟其它的nft宽度一致，从而可以得到对另外一个token数量的最小要求
     * 另外一边做等差时，总的数量 - 当前点位的bin中包含的数量，剩下的做等差
     * 给的条件是左点位，大于当前点位的右点位
     * step 1 把包含当前点位bin 单独划分出来作为一个nft
     * step 2 把剩余的bin 划分若干个nft
     * step 3 总的nft 它们 token amount 之和固定，求出等差
     * step 4 求出等差后 得到包含当前点位的bin对另外一半的最低数量要求，数量满足就可以添加，不满足就不可以添加并给出提示
     */

    /**
     * 从左往右逐渐下降模式
     * 从右往左计算
     * e.g.
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenYAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenYAmount;
     * ===>dis = tokenYAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */

    const { pool_id, point_delta, current_point } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;
    // 不同点1
    const contain_cur_nft_left_point = right_point - binWidth;
    const contain_cur_nft_right_point = right_point;

    // 不同点2
    const exclude_cur_left_point = left_point;
    const exclude_cur_right_point = contain_cur_nft_left_point;

    const exclude_cur_total_bin_number =
      (exclude_cur_right_point - exclude_cur_left_point) / binWidth;
    let exclude_cur_total_nft_number;
    let exclude_cur_bin_number_in_a_nft;
    if (exclude_cur_total_bin_number < max_nft_divisional_per_side) {
      exclude_cur_bin_number_in_a_nft = 1;
      exclude_cur_total_nft_number = exclude_cur_total_bin_number;
    } else {
      exclude_cur_bin_number_in_a_nft = Math.floor(
        exclude_cur_total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(
        exclude_cur_total_bin_number % max_nft_divisional_per_side
      );
      exclude_cur_total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth =
      point_delta * slot_number_in_a_bin * exclude_cur_bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < exclude_cur_total_nft_number; i++) {
      // 不同点3
      let left_i_point;
      let right_i_point;
      if (i == exclude_cur_total_nft_number - 1) {
        left_i_point = exclude_cur_left_point;
      } else {
        left_i_point = exclude_cur_right_point - nftWidth * (i + 1);
      }
      right_i_point = exclude_cur_right_point - nftWidth * i;
      const const_i = Big(i + 2).mul(
        formula_of_token_y(left_i_point, right_i_point)
      );
      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i + 1] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }

    // 不同点4
    const const_last = Big(1).mul(
      formula_of_token_y(contain_cur_nft_left_point, current_point + 1)
    );
    total_const = total_const.plus(const_last);

    addLiquidityInfoHelp[0] = {
      left_point: contain_cur_nft_left_point,
      right_point: contain_cur_nft_right_point,
      const_value: const_last.toFixed(),
    };

    // 不同点5
    let min_token_x_amount_needed_nonDivisible;
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(tokenY.decimals, tokenYAmount || '0')
      ).div(total_const);
      for (let i = 0; i < exclude_cur_total_nft_number + 1; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_y = Big(dis).mul(const_value).toFixed(0);
        let amount_x;
        if (i == 0) {
          amount_x = dis
            .mul(
              formula_of_token_x(current_point + 1, contain_cur_nft_right_point)
            )
            .toFixed(0);
          min_token_x_amount_needed_nonDivisible = amount_x;
        }
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x: amount_x || '0',
          amount_y: amount_y,
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }

    return {
      min_token_x_amount_needed_nonDivisible,
      addLiquidityInfoList,
      min_token_x_amount_needed: toReadableNumber(
        tokenX.decimals,
        min_token_x_amount_needed_nonDivisible
      ),
    };
  }
  /**
   * curve 和 bid ask 上升模式下
   * 单边
   * @param param0
   * @returns
   */
  function get_rise_pattern_nfts({
    left_point,
    right_point,
    token,
    token_amount,
    formula_fun,
    is_token_x,
    is_token_y,
  }: {
    left_point: number;
    right_point: number;
    token: TokenMetadata;
    token_amount: string;
    formula_fun: Function;
    is_token_x?: boolean;
    is_token_y?: boolean;
  }) {
    /**
     * 从左往右逐渐上升模式
     * 从左往右计算
     * e.g.
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenYAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenYAmount;
     * ===>dis = tokenYAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */
    const { pool_id, point_delta } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;
    const total_bin_number = (right_point - left_point) / binWidth;
    let total_nft_number;
    let bin_number_in_a_nft;
    if (total_bin_number < max_nft_divisional_per_side) {
      const unbroken_nft_number = Math.floor(total_bin_number);
      const has_remaining = !!(total_bin_number % 1);
      bin_number_in_a_nft = 1;
      total_nft_number = has_remaining
        ? unbroken_nft_number + 1
        : unbroken_nft_number;
    } else {
      bin_number_in_a_nft = Math.floor(
        total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(total_bin_number % max_nft_divisional_per_side);
      total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth = point_delta * slot_number_in_a_bin * bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < total_nft_number; i++) {
      const left_i_point = left_point + nftWidth * i;
      let right_i_point;
      if (i == total_nft_number - 1) {
        right_i_point = right_point;
      } else {
        right_i_point = left_point + nftWidth * (i + 1);
      }
      const const_i = Big(i + 1).mul(formula_fun(left_i_point, right_i_point));
      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(token.decimals, token_amount || '0')
      ).div(total_const);
      for (let i = 0; i < total_nft_number; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_i = Big(dis).mul(const_value).toFixed(0);
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x: is_token_x ? amount_i : '0',
          amount_y: is_token_y ? amount_i : '0',
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }
    return addLiquidityInfoList;
  }
  /**
   * curve 和 bid ask 下降升模式下
   * 单边
   * @param param0
   * @returns
   */
  function get_decline_pattern_nfts({
    left_point,
    right_point,
    token,
    token_amount,
    formula_fun,
    is_token_x,
    is_token_y,
  }: {
    left_point: number;
    right_point: number;
    token: TokenMetadata;
    token_amount: string;
    formula_fun: Function;
    is_token_x?: boolean;
    is_token_y?: boolean;
  }) {
    /**
     * 从左往右逐渐下降模式
     * nft 从右往左计算
     * e.g.
     * 公式推导：
     * (dis * 常量1) + (2dis * 常量2) + ...(n*dis * 常量n) = tokenXAmount
     * ===>dis(常量1 + 2常量2 + ...n*常量n) = tokenXAmount;
     * ===>dis = tokenXAmount/(常量1 + 2常量2 + ...n*常量n)
     * ===>求出dis后，就可以知道每个nft的amount
     * NOTE:最后一个（最高的那个nft的宽度可能跟别的nft宽度不一致）
     * */
    const { pool_id, point_delta } = currentSelectedPool;
    const slot_number_in_a_bin = SLOT_NUMBER;
    const binWidth = slot_number_in_a_bin * point_delta;
    const total_bin_number = (right_point - left_point) / binWidth;
    let total_nft_number;
    let bin_number_in_a_nft;
    if (total_bin_number < max_nft_divisional_per_side) {
      const unbroken_nft_number = Math.floor(total_bin_number);
      const has_remaining = !!(total_bin_number % 1);
      bin_number_in_a_nft = 1;
      total_nft_number = has_remaining
        ? unbroken_nft_number + 1
        : unbroken_nft_number;
    } else {
      bin_number_in_a_nft = Math.floor(
        total_bin_number / max_nft_divisional_per_side
      );
      const has_remaining = !!(total_bin_number % max_nft_divisional_per_side);
      total_nft_number = has_remaining
        ? max_nft_divisional_per_side + 1
        : max_nft_divisional_per_side;
    }
    const nftWidth = point_delta * slot_number_in_a_bin * bin_number_in_a_nft;
    let total_const = Big(0);
    const addLiquidityInfoList: IAddLiquidityInfo[] = [];
    const addLiquidityInfoHelp: IAddLiquidityInfoHelp = {};
    for (let i = 0; i < total_nft_number; i++) {
      let left_i_point;
      let right_i_point;
      if (i == total_nft_number - 1) {
        left_i_point = left_point;
      } else {
        left_i_point = right_point - nftWidth * (i + 1);
      }
      right_i_point = right_point - nftWidth * i;
      const const_i = Big(i + 1).mul(formula_fun(left_i_point, right_i_point));
      total_const = total_const.plus(const_i);
      addLiquidityInfoHelp[i] = {
        left_point: left_i_point,
        right_point: right_i_point,
        const_value: const_i.toFixed(),
      };
    }
    if (total_const.gt(0)) {
      const dis = Big(
        toNonDivisibleNumber(token.decimals, token_amount || '0')
      ).div(total_const);
      for (let i = 0; i < total_nft_number; i++) {
        const { left_point, right_point, const_value } =
          addLiquidityInfoHelp[i];
        const amount_i = Big(dis).mul(const_value).toFixed(0);
        addLiquidityInfoList.push({
          pool_id,
          left_point,
          right_point,
          amount_x: is_token_x ? amount_i : '0',
          amount_y: is_token_y ? amount_i : '0',
          min_amount_x: '0',
          min_amount_y: '0',
        });
      }
    }
    return addLiquidityInfoList;
  }
  function formula_of_token_x(leftPoint: number, rightPoint: number) {
    return (
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
    );
  }
  function formula_of_token_y(leftPoint: number, rightPoint: number) {
    return (
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
      (Math.sqrt(CONSTANT_D) - 1)
    );
  }
  /**
   * 把传递给合约的liquidities数据形式转换成用于图表展示的liquidity数据形式
   */
  function process_liquidities(liquidities: IAddLiquidityInfo[]) {
    const { pool_id } = currentSelectedPool;
    const new_liquidities: UserLiquidityInfo[] = [];
    liquidities.forEach((l: IAddLiquidityInfo) => {
      const { left_point, right_point, amount_x, amount_y } = l;
      const L = get_l_amount_by_condition({
        left_point,
        right_point,
        token_x_amount: amount_x,
        token_y_amount: amount_y,
        poolDetail: currentSelectedPool,
      });
      new_liquidities.push({
        pool_id,
        left_point,
        right_point,
        amount: L,
      });
    });
    return new_liquidities;
  }
  function pointAndshapeAndAmountChange() {
    set_token_amount_tip('');
    if (liquidityShape == 'Spot') {
      if (tokenXAmount) {
        changeTokenXAmount(tokenXAmount);
      } else if (tokenYAmount) {
        changeTokenYAmount(tokenYAmount);
      }
    }
  }
  const tokenSort = tokenX?.id == currentSelectedPool?.token_x;
  const mobileDevice = isMobile();

  return (
    <LiquidityProviderData.Provider
      value={{
        get_slot_number_in_a_bin,
        binNumber,
        setBinNumber,
        currentSelectedPool,
        tokenX,
        tokenY,
        pointChange,
        setCurrentSelectedPool,
        leftPoint,
        setLeftPoint,
        rightPoint,
        setRightPoint,
        currentPoint,
        SLOT_NUMBER,
        BIN_WIDTH,
        liquidityShape,
        tokenXAmount,
        tokenYAmount,
        tokenXBalanceFromNear,
        tokenYBalanceFromNear,
        onlyAddXToken,
        onlyAddYToken,
        invalidRange,
        isSignedIn,
        token_amount_tip,
        set_token_amount_tip,
        switch_pool_loading,
        pointAndshapeAndAmountChange,

        get_y_nfts_contain_current_curve,
        get_x_nfts_contain_current_curve,
        get_x_nfts_contain_current_bid_ask,
        get_y_nfts_contain_current_bid_ask,
        get_rise_pattern_nfts,
        get_decline_pattern_nfts,
        formula_of_token_x,
        formula_of_token_y,

        getLiquiditySpot,
        getLiquidityForCurveAndBidAskMode,
      }}
    >
      <div className="m-20">
        {/* 缩略图 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id} config={{axisHidden: true, controlHidden: true, currentBarHidden: true, hoverBoxHidden: true, svgWidth:'80', svgHeight:'32', svgPaddingX:'0'}}></DclChart> */}
        {/* 详情页图 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id} config={{axisHidden: true, controlHidden: true}}></DclChart> */}
        {/* 添加页图 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id}></DclChart> */}
        {/* 用户流动性图表*/}
        {/* <DclChart
          pool_id={currentSelectedPool?.pool_id}
          config={{ controlHidden: true }}
          chartType="USER"
        ></DclChart> */}
        {/* 删除流动性图表 从右侧部分删除 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id} config={{controlHidden: true, currentBarHidden: true, hoverBoxHidden: true}} chartType='USER' removeParams={{ fromRight:true, point:  408800}}></DclChart> */}
        {/* 删除流动性图表 从左侧部分删除 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id} config={{controlHidden: true, currentBarHidden: true, hoverBoxHidden: true}} chartType='USER' removeParams={{ fromLeft:true, point:  408800}}></DclChart> */}
        {/* 删除流动性图表 全部删除 */}
        {/* <DclChart pool_id={currentSelectedPool?.pool_id} config={{controlHidden: true, currentBarHidden: true, hoverBoxHidden: true}} chartType='USER' removeParams={{ all: true }}></DclChart> */}
      </div>

      {/* mobile head */}
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
        {/* pc head */}
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

        {/* content */}
        <div
          className="relative z-10 py-5 px-7 xs:px-3 md:px-3 rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, #213441 0%, #15242F 100%)',
          }}
        >
          <div className="flex items-start justify-between xs:flex-col md:flex-col">
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
            {/* left area */}
            {currentSelectedPool && currentSelectedPool.pool_id ? (
              <SetPointsComponent></SetPointsComponent>
            ) : null}
            {/* right area */}
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
                    setTokenX(token);
                    setTokenXBalanceFromNear(token?.near?.toString());
                  }}
                  selectTokenOut={(token: TokenMetadata) => {
                    setTokenY(token);
                    setTokenYBalanceFromNear(token?.near?.toString());
                  }}
                  notNeedSortToken={true}
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
              {token_amount_tip ? (
                <div className="flex items-center text-sm text-warnColor mt-2.5">
                  <WarningIcon className="ml-2.5 mr-2"></WarningIcon>
                  {token_amount_tip}
                </div>
              ) : null}

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
                    let disabled = false;
                    if (
                      (index == 1 || index == 2) &&
                      only_suppport_spot_shape
                    ) {
                      disabled = true;
                    }
                    return (
                      <div
                        className={`flex flex-col  rounded-xl items-center border justify-center ${
                          disabled ? 'opacity-40' : 'cursor-pointer'
                        } ${
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
                          else if (index === 1 && !only_suppport_spot_shape)
                            setLiquidityShape('Curve');
                          else if (index == 2 && !only_suppport_spot_shape)
                            setLiquidityShape('BidAsk');
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
              {/* new user chart part */}
              {isSignedIn && currentSelectedPool ? (
                <div>
                  <div className="flex items-center justify-between  mt-4">
                    <div className="font-gothamBold text-white">
                      <FormattedMessage
                        id="Simulate_liquidity_distribution"
                        defaultMessage={'Simulate Liquidity Distribution'}
                      ></FormattedMessage>
                    </div>
                    <div
                      onClick={generate_new_user_chart}
                      className="text-xs text-v3SwapGray border border-opacity-20 border-primaryText rounded-lg p-2 bg-primaryText bg-opacity-20 cursor-pointer hover:text-white hover:bg-opacity-10 hover:border-transparent"
                    >
                      Generate
                    </div>
                  </div>
                  {!isInvalid(leftPoint) &&
                    !isInvalid(rightPoint) &&
                    !switch_pool_loading && (
                      <div className="flex items-center justify-center border border-v3SwapGray border-opacity-20 rounded-xl px-3 mt-2">
                        <DclChart
                          pool_id={currentSelectedPool?.pool_id}
                          config={{
                            controlHidden: true,
                            currentBarHidden: true,
                            hoverBoxHidden: true,
                            svgWidth: '300',
                            svgHeight: '68',
                          }}
                          chartType="USER"
                          newlyAddedLiquidities={new_user_liquidities}
                        ></DclChart>
                      </div>
                    )}
                </div>
              ) : null}

              {currentSelectedPool && currentSelectedPool.pool_id && (
                <AddLiquidityButton></AddLiquidityButton>
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
    </LiquidityProviderData.Provider>
  );
}
/**
 * 双边 最小token数量不满足 提示
 * 双边 一侧token 数量太多 提示 todo
 * @returns
 */
function AddLiquidityButton() {
  const {
    currentSelectedPool,
    tokenX,
    tokenY,
    binNumber,
    SLOT_NUMBER,
    leftPoint,
    rightPoint,
    currentPoint,
    liquidityShape,
    tokenXAmount,
    tokenYAmount,
    tokenXBalanceFromNear,
    tokenYBalanceFromNear,
    onlyAddXToken,
    onlyAddYToken,
    invalidRange,
    set_token_amount_tip,
    get_y_nfts_contain_current_curve,
    get_x_nfts_contain_current_curve,
    get_x_nfts_contain_current_bid_ask,
    get_y_nfts_contain_current_bid_ask,
    get_rise_pattern_nfts,
    get_decline_pattern_nfts,
    formula_of_token_x,
    formula_of_token_y,

    getLiquiditySpot,
    getLiquidityForCurveAndBidAskMode,
  } = useContext(LiquidityProviderData);
  const tokenSort = tokenX.id == currentSelectedPool.token_x;
  const [addLiquidityButtonLoading, setAddLiquidityButtonLoading] =
    useState(false);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const { token_x, token_y, point_delta, pool_id } = currentSelectedPool;
  const token_x_decimals =
    tokenX.id == token_x ? tokenX.decimals : tokenY.decimals;
  const token_y_decimals =
    tokenY.id == token_y ? tokenY.decimals : tokenX.decimals;

  function addLiquiditySpot() {
    setAddLiquidityButtonLoading(true);
    const new_liquidity = getLiquiditySpot();
    add_liquidity(new_liquidity);
  }
  function addLiquidityForCurveAndBidAskMode() {
    /**
     *  已知条件:
     *  bin的数量、一个bin里 slot的数量、leftPoint、rightPoint、tokenXAmount、tokenYAmount
     *  当前点位为point，以slot为单位 下一跳是 point + slot
     *  当前点位为point，以bin为单位 下一跳是 point + bin * slots
     *  最小的bin的高度就是等差的值 为dis
     **/
    setAddLiquidityButtonLoading(true);
    const tokenXAmount_nonDivisible = toNonDivisibleNumber(
      tokenX.decimals,
      tokenXAmount || '0'
    );
    const tokenYAmount_nonDivisible = toNonDivisibleNumber(
      tokenY.decimals,
      tokenYAmount || '0'
    );
    let nftList: IAddLiquidityInfo[] = [];
    nftList = getLiquidityForCurveAndBidAskMode();
    if (!nftList) {
      setAddLiquidityButtonLoading(false);
      return;
    }
    batch_add_liquidity({
      liquidityInfos: nftList,
      token_x: tokenX,
      token_y: tokenY,
      amount_x: tokenXAmount_nonDivisible,
      amount_y: tokenYAmount_nonDivisible,
    });
  }
  function addLiquidityForCurveAndBidAskModeCopy() {
    /**
     *  已知条件:
     *  bin的数量、一个bin里 slot的数量、leftPoint、rightPoint、tokenXAmount、tokenYAmount
     *  当前点位为point，以slot为单位 下一跳是 point + slot
     *  当前点位为point，以bin为单位 下一跳是 point + bin * slots
     *  最小的bin的高度就是等差的值 为dis
     **/
    setAddLiquidityButtonLoading(true);
    const tokenXAmount_nonDivisible = toNonDivisibleNumber(
      tokenX.decimals,
      tokenXAmount || '0'
    );
    const tokenYAmount_nonDivisible = toNonDivisibleNumber(
      tokenY.decimals,
      tokenYAmount || '0'
    );
    let nftList: IAddLiquidityInfo[] = [];
    const get_x_nfts =
      liquidityShape == 'Curve'
        ? get_decline_pattern_nfts
        : get_rise_pattern_nfts;
    const get_y_nfts =
      liquidityShape == 'Curve'
        ? get_rise_pattern_nfts
        : get_decline_pattern_nfts;
    if (onlyAddYToken) {
      nftList = get_y_nfts({
        left_point: leftPoint,
        right_point: rightPoint,
        token: tokenY,
        token_amount: tokenYAmount,
        formula_fun: formula_of_token_y,
        is_token_y: true,
      });
    }
    if (onlyAddXToken) {
      nftList = get_x_nfts({
        left_point: leftPoint,
        right_point: rightPoint,
        token: tokenX,
        token_amount: tokenXAmount,
        formula_fun: formula_of_token_x,
        is_token_x: true,
      });
    }
    if (!onlyAddXToken && !onlyAddYToken) {
      /**
       * step1 先判断左侧bin的数量是否 > 1,是的话，左侧包含当前点作等差，否则右侧包含当前点位作等差
       * step2 分配好后，获得对右侧的最小token数量要求
       * step3 另外一侧 总的token数量减去 当前bin中包含的，剩下的 作单边 等差分配即可
       */
      const { point_delta, current_point } = currentSelectedPool;
      const current_l_point = getBinPointByPoint(
        point_delta,
        SLOT_NUMBER,
        current_point,
        'floor'
      );
      const current_r_point = getBinPointByPoint(
        point_delta,
        SLOT_NUMBER,
        current_point,
        'ceil'
      );
      const slot_number_in_a_bin = SLOT_NUMBER;
      const binWidth = slot_number_in_a_bin * point_delta;
      const bin_number_left = (current_point - leftPoint) / binWidth;
      set_token_amount_tip('');
      if (liquidityShape == 'Curve') {
        if (bin_number_left > 1) {
          // 左侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_x_amount_needed } =
            get_y_nfts_contain_current_curve({
              left_point: leftPoint,
              right_point: current_r_point,
            });
          nftList_y = addLiquidityInfoList;
          const remain_token_x_amount = Big(tokenXAmount).minus(
            min_token_x_amount_needed
          );
          if (remain_token_x_amount.lt(0)) {
            // 给出提示 token x 数量太少不能添加
            set_token_amount_tip(`${tokenX.symbol} Token amount is too little`);
            setAddLiquidityButtonLoading(false);
            return;
          } else {
            nftList_x = get_decline_pattern_nfts({
              left_point: current_r_point,
              right_point: rightPoint,
              token: tokenX,
              token_amount: remain_token_x_amount.toFixed(),
              formula_fun: formula_of_token_x,
              is_token_x: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        } else {
          // 右侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_y_amount_needed } =
            get_x_nfts_contain_current_curve({
              left_point: current_l_point,
              right_point: rightPoint,
            });
          nftList_x = addLiquidityInfoList;

          const remain_token_y_amount = Big(tokenYAmount).minus(
            min_token_y_amount_needed
          );
          if (remain_token_y_amount.lt(0)) {
            // 给出提示 token y 数量太少不能添加
            set_token_amount_tip(`${tokenY.symbol} Token amount is too little`);
            setAddLiquidityButtonLoading(false);
            return;
          } else {
            nftList_y = get_rise_pattern_nfts({
              left_point: leftPoint,
              right_point: current_l_point,
              token: tokenY,
              token_amount: remain_token_y_amount.toFixed(),
              formula_fun: formula_of_token_y,
              is_token_y: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        }
      } else {
        if (bin_number_left > 1) {
          // 左侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_x_amount_needed } =
            get_y_nfts_contain_current_bid_ask({
              left_point: leftPoint,
              right_point: current_r_point,
            });
          nftList_y = addLiquidityInfoList;
          const remain_token_x_amount = Big(tokenXAmount).minus(
            min_token_x_amount_needed
          );
          if (remain_token_x_amount.lt(0)) {
            // 给出提示 token x 数量太少不能添加
            set_token_amount_tip(`${tokenX.symbol} Token amount is too little`);
            setAddLiquidityButtonLoading(false);
            return;
          } else {
            nftList_x = get_rise_pattern_nfts({
              left_point: current_r_point,
              right_point: rightPoint,
              token: tokenX,
              token_amount: remain_token_x_amount.toFixed(),
              formula_fun: formula_of_token_x,
              is_token_x: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        } else {
          // 右侧做等差
          let nftList_x: IAddLiquidityInfo[] = [];
          let nftList_y: IAddLiquidityInfo[] = [];
          const { addLiquidityInfoList, min_token_y_amount_needed } =
            get_x_nfts_contain_current_bid_ask({
              left_point: current_l_point,
              right_point: rightPoint,
            });
          nftList_x = addLiquidityInfoList;

          const remain_token_y_amount = Big(tokenYAmount).minus(
            min_token_y_amount_needed
          );
          if (remain_token_y_amount.lt(0)) {
            // 给出提示 token y 数量太少不能添加
            set_token_amount_tip(`${tokenY.symbol} Token amount is too little`);
            setAddLiquidityButtonLoading(false);
            return;
          } else {
            nftList_y = get_decline_pattern_nfts({
              left_point: leftPoint,
              right_point: current_l_point,
              token: tokenY,
              token_amount: remain_token_y_amount.toFixed(),
              formula_fun: formula_of_token_y,
              is_token_y: true,
            });
          }
          nftList = nftList_x.concat(nftList_y);
        }
      }
    }
    batch_add_liquidity({
      liquidityInfos: nftList,
      token_x: tokenX,
      token_y: tokenY,
      amount_x: tokenXAmount_nonDivisible,
      amount_y: tokenYAmount_nonDivisible,
    });
  }
  function getMax(token: TokenMetadata, balance: string) {
    return token.id !== WRAP_NEAR_CONTRACT_ID
      ? balance
      : Number(balance) <= 0.5
      ? '0'
      : String(Number(balance) - 0.5);
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
  const isAddLiquidityDisabled = getButtonStatus();

  const add_lp_func =
    liquidityShape === 'Spot'
      ? addLiquiditySpot
      : addLiquidityForCurveAndBidAskMode;

  return (
    <div
      className={`w-full xs:w-full md:w-full flex flex-col justify-between self-stretch mt-5`}
    >
      {isSignedIn ? (
        <GradientButton
          color="#fff"
          className={`w-full h-12 text-center text-base text-white focus:outline-none ${
            isAddLiquidityDisabled ? 'opacity-40' : ''
          }`}
          loading={addLiquidityButtonLoading}
          disabled={addLiquidityButtonLoading || isAddLiquidityDisabled}
          btnClassName={`${isAddLiquidityDisabled ? 'cursor-not-allowed' : ''}`}
          onClick={add_lp_func}
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
function SetPointsComponent() {
  const {
    binNumber,
    setBinNumber,
    currentSelectedPool,
    tokenX,
    tokenY,
    tokenXAmount,
    tokenYAmount,
    pointAndshapeAndAmountChange,

    pointChange,
    currentPoint,
    liquidityShape,

    leftPoint,
    setLeftPoint,
    rightPoint,
    setRightPoint,

    SLOT_NUMBER,
    BIN_WIDTH,

    switch_pool_loading,

    isSignedIn,
  } = useContext(LiquidityProviderData);
  const [priceRangeMode, setPriceRangeMode] = useState<
    'by_range' | 'by_radius'
  >('by_range');
  const [radius, setRadius] = useState<number>();
  const [targetCustomPrice, setTargetCustomPrice] = useState('');
  const [leftCustomPrice, setLeftCustomPrice] = useState('');
  const [rightCustomPrice, setRightCustomPrice] = useState('');
  const [targetPoint, setTargetPoint] = useState<number>();

  const [leftInputStatus, setLeftInputStatus] = useState(false);
  const [rightInputStatus, setRightInputStatus] = useState(false);
  const [targetInputStatus, setTargetInputStatus] = useState(false);
  const [chartTab, setChartTab] = useState<'liquidity' | 'yours'>('liquidity');

  const [slider_point_min, set_slider_point_min] = useState<number>();
  const [slider_point_max, set_slider_point_max] = useState<number>();

  const [slider_left_value, set_slider_left_value] = useState<number>();
  const [slider_right_value, set_slider_right_value] = useState<number>();

  const { token_x, token_y } = currentSelectedPool;
  const token_x_decimals =
    tokenX.id == token_x ? tokenX.decimals : tokenY.decimals;
  const token_y_decimals =
    tokenY.id == token_y ? tokenY.decimals : tokenX.decimals;
  const tokenSort = tokenX.id == currentSelectedPool.token_x;

  // init
  useEffect(() => {
    if (currentSelectedPool?.pool_id && !switch_pool_loading) {
      const { current_point } = currentSelectedPool;
      const right_point = handlePointToAppropriatePoint(
        current_point + BIN_WIDTH * RADIUS_DEFAULT_NUMBER
      );
      const left_point = right_point - BIN_WIDTH * RADIUS_DEFAULT_NUMBER * 2;
      setTargetPoint(current_point);
      setRadius(RADIUS_DEFAULT_NUMBER);
      setLeftPoint(left_point);
      setRightPoint(right_point);
      set_slider_point_range();
      setPriceRangeMode('by_range');
      setChartTab('liquidity');
    }
  }, [currentSelectedPool, switch_pool_loading]);

  // 中文 左侧改变===》点位
  useEffect(() => {
    if (!isInvalid(leftPoint) && !isInvalid(rightPoint)) {
      // effect bin
      const diff = rightPoint - leftPoint;
      const bin_number_temp = diff / BIN_WIDTH;
      setBinNumber(bin_number_temp);
      // effect slider
      const slider_left_value = get_slider_value_by_point(leftPoint);
      const slider_right_value = get_slider_value_by_point(rightPoint);

      set_slider_left_value(slider_left_value);
      set_slider_right_value(slider_right_value);
      // effect right area
      pointChange({ leftPoint, rightPoint, currentPoint });
    }
  }, [leftPoint, rightPoint, BIN_WIDTH, slider_point_min, slider_point_max]);
  // 数据有变动==》去掉token 太少提示
  useEffect(() => {
    if (!isInvalid(leftPoint) && !isInvalid(rightPoint)) {
      pointAndshapeAndAmountChange();
    }
  }, [liquidityShape, tokenXAmount, tokenYAmount, leftPoint, rightPoint]);

  // 修改bin --> 合适的右点位 --->合适的bin
  function changeBin(bin: number) {
    let appropriate_right_point = leftPoint + BIN_WIDTH * bin;
    if (appropriate_right_point > POINTRIGHTRANGE) {
      appropriate_right_point = POINTRIGHTRANGE;
    }
    const appropriate_bin_number =
      (appropriate_right_point - leftPoint) / BIN_WIDTH;
    setRightPoint(appropriate_right_point);
    setBinNumber(appropriate_bin_number);
  }

  // 修改radius-->合适的左右点位 --->合适的radius
  function changeRadius(radius: number) {
    let appropriate_right_point = handlePointToAppropriatePoint(
      targetPoint + BIN_WIDTH * radius
    );
    let appropriate_left_point = handlePointToAppropriatePoint(
      appropriate_right_point - BIN_WIDTH * radius * 2
    );
    const appropriate_radius =
      (appropriate_right_point - appropriate_left_point) / (BIN_WIDTH * 2);
    setLeftPoint(appropriate_left_point);
    setRightPoint(appropriate_right_point);
    setRadius(appropriate_radius);
  }
  // 修改 targetPrice-->合适的左右点位--->合适的targetPrice
  function handleTargetPriceToAppropriatePoint(price: string) {
    let appropriate_target_point = handlePriceToAppropriatePoint(price);
    const appropriate_right_point = handlePointToAppropriatePoint(
      appropriate_target_point + BIN_WIDTH * radius
    );
    const appropriate_left_point = handlePointToAppropriatePoint(
      appropriate_right_point - BIN_WIDTH * radius * 2
    );
    appropriate_target_point = appropriate_right_point - BIN_WIDTH * radius;
    setLeftPoint(appropriate_left_point);
    setRightPoint(appropriate_right_point);
    return appropriate_target_point;
  }
  // 设置slider可以操作的point 左右点位区间
  function set_slider_point_range() {
    const { current_point } = currentSelectedPool;
    const max_point = handlePointToAppropriatePoint(
      current_point + BIN_WIDTH * (SLIDER_BIN_NUMBER / 2)
    );
    const min_point = max_point - SLIDER_BIN_NUMBER * BIN_WIDTH;
    set_slider_point_min(min_point);
    set_slider_point_max(max_point);
  }
  function get_slider_value_by_point(point: number) {
    const value = (point - slider_point_min) / BIN_WIDTH;
    return value;
  }
  function get_point_by_slider_value(v: number) {
    const new_point = slider_point_min + v * BIN_WIDTH;
    return new_point;
  }
  function handlePointToAppropriatePoint(point: number) {
    const { point_delta } = currentSelectedPool;
    return getBinPointByPoint(point_delta, SLOT_NUMBER, point);
  }
  function handlePriceToAppropriatePoint(price: string) {
    const { point_delta } = currentSelectedPool;
    const decimalRate =
      Math.pow(10, token_y_decimals) / Math.pow(10, token_x_decimals);
    const appropriate_point = getBinPointByPrice(
      point_delta,
      price,
      decimalRate,
      SLOT_NUMBER
    );
    return appropriate_point;
  }
  function getLeftPrice() {
    if (currentSelectedPool && currentSelectedPool.pool_id) {
      const { token_x, token_y } = currentSelectedPool;
      const decimalRate =
        Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
      let price = getPriceByPoint(leftPoint, decimalRate);
      // if (tokenX.id == token_y) {
      //   price = new BigNumber(1).dividedBy(price).toFixed();
      // }
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
      // if (tokenX.id == token_y) {
      //   price = new BigNumber(1).dividedBy(price).toFixed();
      // }
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
      // if (tokenX.id == token_y) {
      //   price = new BigNumber(1).dividedBy(price).toFixed();
      // }
      if (new BigNumber(price).isLessThan('0.00000001')) {
        return price;
      } else {
        return toPrecision(price.toString(), 8);
      }
    } else {
      return '';
    }
  }
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
      {/* chart area */}
      <div className="relative mb-5 mt-24" style={{ height: '250px' }}>
        <div className="absolute left-0 -top-24 inline-flex items-center justify-between bg-detailCardBg rounded-lg border border-dclTabBorderColor p-0.5">
          <span
            onClick={() => {
              setChartTab('liquidity');
            }}
            className={`w-20 frcc text-xs gotham_bold px-3 py-1.5 rounded-md cursor-pointer ${
              chartTab == 'liquidity'
                ? 'text-black bg-gradientFromHover'
                : 'text-primaryText'
            }`}
          >
            Liquidity
          </span>
          <span
            className={`w-20 ${
              isSignedIn ? 'frcc' : 'hidden'
            } text-xs gotham_bold px-3 py-1.5 rounded-md cursor-pointer ${
              chartTab == 'yours'
                ? 'text-black bg-gradientFromHover'
                : 'text-primaryText'
            }`}
            onClick={() => {
              setChartTab('yours');
            }}
          >
            Yours
          </span>
        </div>
        <div className={`${chartTab == 'liquidity' ? '' : 'hidden'}`}>
          {!isInvalid(leftPoint) &&
            !isInvalid(rightPoint) &&
            !switch_pool_loading && (
              <DclChart
                pool_id={currentSelectedPool?.pool_id}
                leftPoint={leftPoint}
                rightPoint={rightPoint}
                setLeftPoint={setLeftPoint}
                setRightPoint={setRightPoint}
                config={{
                  radiusMode: priceRangeMode == 'by_radius',
                  targetPoint,
                }}
              ></DclChart>
            )}
        </div>
        {isSignedIn &&
          !isInvalid(leftPoint) &&
          !isInvalid(rightPoint) &&
          !switch_pool_loading && (
            <div className={`${chartTab == 'yours' ? '' : 'hidden'}`}>
              <DclChart
                pool_id={currentSelectedPool?.pool_id}
                config={{ controlHidden: true }}
                chartType="USER"
              ></DclChart>
            </div>
          )}
      </div>
      {/* set price range area */}
      <div className=" border border-limitOrderFeeTiersBorderColor rounded-xl p-4">
        {/* price range mode area */}
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
                changeRadius(radius);
              }}
            >
              <FormattedMessage
                id="by_radius"
                defaultMessage={'By Radius'}
              ></FormattedMessage>
            </span>
          </div>
        </div>
        {/* content */}
        <div
          className={`mt-6 mb-4 ${
            priceRangeMode == 'by_range' ? '' : 'hidden'
          }`}
        >
          <Slider
            value={[slider_left_value, slider_right_value]}
            set_slider_left_value={set_slider_left_value}
            set_slider_right_value={set_slider_right_value}
            get_point_by_slider_value={get_point_by_slider_value}
            set_left_point={setLeftPoint}
            set_right_point={setRightPoint}
          ></Slider>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-4 mt-3  xsm:px-2">
          {/* target price input box */}
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
            <PointInputComponent
              handlePriceToAppropriatePoint={
                handleTargetPriceToAppropriatePoint
              }
              customPrice={targetCustomPrice}
              setCustomPrice={setTargetCustomPrice}
              inputStatus={targetInputStatus}
              setInputStatus={setTargetInputStatus}
              getPrice={getTargetPrice}
              setPoint={setTargetPoint}
              point={targetPoint}
            />
          </div>

          {/* radius input box */}
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
              setValue={setRadius}
              triggerByValue={changeRadius}
            />
          </div>

          {/* min price input box */}
          <div className=" flex border border-menuMoreBoxBorderColor items-center bg-black bg-opacity-20 rounded-xl p-2.5 col-span-1">
            <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
              <FormattedMessage
                id="min_price"
                defaultMessage="Min Price"
              ></FormattedMessage>
            </span>
            {/* {tokenSort ? ( */}
            <PointInputComponent
              handlePriceToAppropriatePoint={handlePriceToAppropriatePoint}
              disbaled={priceRangeMode === 'by_radius'}
              customPrice={leftCustomPrice}
              getPrice={getLeftPrice}
              setCustomPrice={setLeftCustomPrice}
              inputStatus={leftInputStatus}
              setInputStatus={setLeftInputStatus}
              setPoint={setLeftPoint}
              point={leftPoint}
            ></PointInputComponent>
            {/* ) : (
              <PointInputComponent
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
            )} */}
          </div>

          {/* max price input box */}
          <div className="flex border border-menuMoreBoxBorderColor items-center bg-black bg-opacity-20 rounded-xl p-2.5 col-span-1">
            <span className="text-sm text-primaryText xs:text-xs whitespace-nowrap md:text-xs">
              <FormattedMessage
                id="max_price"
                defaultMessage="Max Price"
              ></FormattedMessage>
            </span>
            {/* {tokenSort ? ( */}
            <PointInputComponent
              handlePriceToAppropriatePoint={handlePriceToAppropriatePoint}
              customPrice={rightCustomPrice}
              getPrice={getRightPrice}
              setCustomPrice={setRightCustomPrice}
              inputStatus={rightInputStatus}
              setInputStatus={setRightInputStatus}
              setPoint={setRightPoint}
              point={rightPoint}
              disbaled={priceRangeMode === 'by_radius'}
            ></PointInputComponent>
            {/* ) : (
              <PointInputComponent
                disbaled={priceRangeMode === 'by_radius'}
                customPrice={leftCustomPrice}
                getPrice={getLeftPrice}
                setCustomPrice={setLeftCustomPrice}
                inputStatus={leftInputStatus}
                setInputStatus={setLeftInputStatus}
              ></PointInputComponent>
            )} */}
          </div>

          {/* bin number input box */}
          <div className=" flex border border-menuMoreBoxBorderColor items-center bg-black bg-opacity-20 rounded-xl p-2.5 col-span-1">
            <span className="text-sm text-primaryText xs:text-xs md:text-xs whitespace-nowrap">
              <FormattedMessage
                id="bin_amount"
                defaultMessage="Bin amount"
              ></FormattedMessage>
            </span>
            <IntegerInputComponent
              value={binNumber}
              setValue={setBinNumber}
              triggerByValue={changeBin}
              disabled={priceRangeMode === 'by_radius'}
            />
          </div>
        </div>
        {/* tip in foot */}
        <div
          style={{
            color: '#3F4A52',
          }}
          className="text-xs mt-3"
        >
          *Only NEAR is needed in the price range you choose.
        </div>
      </div>
    </div>
  );
}

/**
 * step1 slider设置数字区间[0, 20]
 * step2 数字区间 和 point区间做一个 双向 映射
 * step step 为 一个bin，区间设定逻辑是 以当前价格为起点，向左向右各辐射30个point（可配置）
 * @param param0
 * @returns
 */
function Slider({
  value,
  set_slider_left_value,
  set_slider_right_value,
  set_left_point,
  set_right_point,
  get_point_by_slider_value,
}: {
  value: any;
  set_slider_left_value: Function;
  set_slider_right_value: Function;
  set_left_point: Function;
  set_right_point: Function;
  get_point_by_slider_value: Function;
}) {
  return (
    <ReactSlider
      className={`multi-slider-double`}
      onChange={(v) => {
        const [num1, num2] = v;
        set_slider_left_value(num1);
        set_slider_right_value(num2);
        const left_point = get_point_by_slider_value(num1);
        const right_point = get_point_by_slider_value(num2);
        set_left_point(left_point);
        set_right_point(right_point);
      }}
      value={value}
      min={0}
      max={SLIDER_BIN_NUMBER}
      step={1}
      pearling={true}
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
  handlePriceToAppropriatePoint,
  customPrice,
  setCustomPrice,

  getPrice,
  point,
  setPoint,

  inputStatus,
  setInputStatus,
  disbaled,
}: any) {
  return (
    <div className="flex items-center justify-between">
      <input
        type="number"
        placeholder="0.0"
        step="any"
        className={`text-base font-gothamBold mx-2 text-left ${
          disbaled ? 'text-primaryText' : 'text-white'
        }`}
        onBlur={() => {
          setInputStatus(false);
          if (customPrice) {
            const appropriate_point_temp =
              handlePriceToAppropriatePoint(customPrice);
            setPoint(appropriate_point_temp);
          } else {
            setPoint(point);
          }
        }}
        disabled={disbaled}
        value={inputStatus ? customPrice : getPrice()}
        onChange={({ target }) => {
          setInputStatus(true);
          const inputPrice = target.value;
          if (Big(target.value || 0).lt(0)) {
            setCustomPrice('0');
          } else {
            setCustomPrice(inputPrice);
          }
        }}
      />
    </div>
  );
}

export function IntegerInputComponent({
  value,
  setValue,
  disabled,
  triggerByValue,
}: any) {
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
    setValue(val);
    if (val) {
      triggerByValue(val);
    }
  };

  return (
    <div className={`flex items-center justify-between `}>
      <input
        type="text"
        className={`text-base font-gothamBold mx-2 text-left ${
          disabled ? 'text-primaryText' : 'text-white'
        }`}
        disabled={disabled}
        value={value}
        onBlur={({ target }) => {
          if (!target.value) {
            setValue(1);
            triggerByValue(1);
          }
        }}
        onChange={({ target }) => {
          handleChange(target.value);
        }}
      />
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
