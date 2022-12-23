import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  list_liquidities,
  get_pool,
  PoolInfo,
  remove_liquidity,
  get_liquidity,
} from '../../services/swapV3';
import { ColorsBox, ColorsBoxCenter, AddButtonIcon } from '~components/icon/V3';
import {
  GradientButton,
  BorderButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '~components/button/Button';
import {
  toPrecision,
  toReadableNumber,
  formatWithCommas,
} from '~utils/numbers';
import { TokenMetadata } from '../../services/ft-contract';
import { useTokens } from '../../state/token';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
  useAddAndRemoveUrlHandle,
  getXAmount_per_point_by_Lx,
  getYAmount_per_point_by_Ly,
} from '../../services/commonV3';
import BigNumber from 'bignumber.js';
import { getBoostTokenPrices } from '../../services/farm';
import { RemovePoolV3 } from '~components/pool/RemovePoolV3';
import { AddPoolV3 } from '~components/pool/AddPoolV3';
import { PoolTabV3 } from '~components/pool/PoolTabV3';
import {
  YourLiquidityAddLiquidityModal,
  YourLiquidityPage,
} from '../pools/YourLiquidityPage';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';

import {
  MyOrderCircle,
  MyOrderMask,
  MyOrderMask2,
} from '~components/icon/swapV3';
import { PoolRPCView } from '../../services/api';
import { ALL_STABLE_POOL_IDS, REF_FI_CONTRACT_ID } from '../../services/near';
import { getPoolsByIds } from '../../services/indexer';
import {
  ClipLoadering,
  BlueCircleLoading,
} from '../../components/layout/Loading';
import QuestionMark from '~components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import Big from 'big.js';
import { ConnectToNearBtnSwap } from '../../components/button/Button';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { checkTransactionStatus } from '../../services/swap';
import {
  REF_FI_YOUR_LP_VALUE,
  REF_FI_YOUR_LP_VALUE_V1_COUNT,
} from '../pools/YourLiquidityPage';
export default function YourLiquidityPageV3() {
  const clearState = () => {
    sessionStorage.removeItem(REF_FI_LP_VALUE_COUNT);
    sessionStorage.removeItem(REF_FI_LP_V2_VALUE);

    sessionStorage.removeItem(REF_FI_YOUR_LP_VALUE);

    sessionStorage.removeItem(REF_FI_YOUR_LP_VALUE_V1_COUNT);
  };

  window.onbeforeunload = clearState;

  const historyYourLP = useHistory();

  useEffect(() => {
    clearState();
  }, [historyYourLP.location.pathname]);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const intl = useIntl();
  const [listLiquidities, setListLiquidities] = useState<UserLiquidityInfo[]>(
    []
  );
  const liquidityStatusList = ['all', 'V2', 'V1'];
  const [addliquidityList, setAddliquidityList] = useState<any[]>([
    {
      text: 'V2 Liquidity',
      url: '/addLiquidityV2',
    },
    {
      text: 'V1 Liquidity',
      url: '/pools',
    },
  ]);

  const [stablePools, setStablePools] = useState<PoolRPCView[]>();
  const [listLiquiditiesLoading, setListLiquiditiesLoading] = useState(true);
  const [oldListLiquiditiesLoading, setOldListLiquiditiesLoading] =
    useState(true);

  const [YourLpValueV2, setYourLpValueV2] = useState('0');

  const [YourLpValueV1, setYourLpValueV1] = useState('0');

  const [lpValueV1Done, setLpValueV1Done] = useState(false);

  const [lpValueV2Done, setLpValueV2Done] = useState(false);

  useEffect(() => {
    if (!listLiquiditiesLoading) {
      if (listLiquidities.length === 0) {
        setLpValueV2Done(true);
        setYourLpValueV2('0');
      }
    }
  }, [listLiquiditiesLoading, listLiquidities]);

  const [generalAddLiquidity, setGeneralAddLiquidity] =
    useState<boolean>(false);
  const [checkedStatus, setCheckedStatus] = useState('all');
  const [oldLiquidityHasNoData, setOldLiquidityHasNoData] = useState(false);
  const [addLiqudityHover, setAddLiqudityHover] = useState(false);
  // callBack handle
  useAddAndRemoveUrlHandle();
  const history = useHistory();
  useEffect(() => {
    const ids = ALL_STABLE_POOL_IDS;
    getPoolsByIds({ pool_ids: ids }).then((res) => {
      setStablePools(res);
    });
  }, []);
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
    }
  }, [isSignedIn]);
  async function get_list_liquidities() {
    const list: UserLiquidityInfo[] = await list_liquidities();
    if (list.length > 0) {
      list.sort((item1: UserLiquidityInfo, item2: UserLiquidityInfo) => {
        const item1_hashId = +item1.lpt_id.split('#')[1];
        const item2_hashId = +item2.lpt_id.split('#')[1];
        return item1_hashId - item2_hashId;
      });
      setListLiquidities(list);
    }
    setListLiquiditiesLoading(false);
  }
  function goAddLiquidityPage(url: string) {
    history.push(url);
  }
  function switchButton(type: string) {
    setCheckedStatus(type);
  }
  function getTipForV2Pool() {
    const n = intl.formatMessage({ id: 'v2PoolTip' });
    const result: string = `<div class="text-navHighLightText text-xs text-left">${n}</div>`;
    return result;
  }

  const { txHash } = getURLInfo();

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (txHash && getCurrentWallet()?.wallet?.isSignedIn()) {
      checkTransactionStatus(txHash).then((res) => {
        let status: any = res.status;

        if (
          res.transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute'
        ) {
          let receipt = res?.receipts_outcome?.find(
            (o: any) => o?.outcome?.executor_id === REF_FI_CONTRACT_ID
          );

          if (receipt) {
            status = receipt?.outcome?.status;

            // not create pool
            if (
              res?.receipts_outcome?.some((o: any) => {
                return (
                  o?.outcome?.executor_id !== REF_FI_CONTRACT_ID &&
                  o?.outcome?.executor_id !== accountId
                );
              })
            ) {
              return;
            }
            if (receipt?.outcome?.logs.length > 0) {
              return;
            }
          } else return;
        } else if (
          res.transaction?.actions?.[0]?.FunctionCall?.method_name !==
          'add_simple_pool'
        ) {
          return;
        }

        const data: string | undefined = status.SuccessValue;
        if (data) {
          const buff = Buffer.from(data, 'base64');
          const pool_id = buff.toString('ascii');
          history.push(`/pool/${pool_id}`);
        }
      });
    }
  }, [txHash]);
  return (
    <>
      <PoolTabV3
        yourLPpage
        lpValueV1Done={lpValueV1Done}
        lpValueV2Done={lpValueV2Done}
        YourLpValueV1={YourLpValueV1}
        YourLpValueV2={YourLpValueV2}
      ></PoolTabV3>
      <div className="flex items flex-col lg:w-1000px xs:w-11/12 md:w-11/12 m-auto">
        <div className="flex items-start justify-between lg:mt-4 xs:mb-5 md:mb-5">
          <div className="flex items-center">
            <div className="flex items-center text-sm text-primaryText border border-selectBorder p-0.5 rounded-lg bg-v3LiquidityTabBgColor">
              {liquidityStatusList.map((item: string, index: number) => {
                return (
                  <span
                    key={index}
                    onClick={() => {
                      switchButton(item);
                    }}
                    className={`flex items-center justify-center h-6 py-px px-3.5 box-content w-auto rounded-md cursor-pointer gotham_bold ${
                      checkedStatus == item
                        ? 'bg-primaryGradient text-white'
                        : 'text-primaryText'
                    }`}
                  >
                    {item == 'all' ? (
                      <FormattedMessage
                        id={item}
                        defaultMessage={item}
                      ></FormattedMessage>
                    ) : (
                      item
                    )}
                  </span>
                );
              })}
            </div>
          </div>
          <div
            className={`relative  ${
              isSignedIn ? '' : 'hidden'
            } pb-10 xs:pb-0 md:pb-0`}
            onMouseOver={() => {
              setAddLiqudityHover(true);
            }}
            onMouseLeave={() => {
              setAddLiqudityHover(false);
            }}
          >
            <GradientButton
              color="#fff"
              className={`px-4 h-9 text-center text-sm text-white focus:outline-none`}
              borderRadius={'8px'}
            >
              <div className="flex items-center">
                <AddButtonIcon className="mr-1.5"></AddButtonIcon>
                <FormattedMessage
                  id="add_liquidity"
                  defaultMessage="Add Liquidity"
                />
              </div>
            </GradientButton>
            <span
              className={`top-10 pt-2 absolute z-50 xsm:right-0 ${
                addLiqudityHover ? '' : 'hidden'
              }`}
            >
              <div
                className="p-1.5 rounded-xl min-w-28 flex flex-col"
                style={{
                  background: 'rgba(23,32,38)',
                  border: '1px solid #415462',
                }}
              >
                {addliquidityList.map((item: any, index: number) => {
                  return (
                    <span
                      key={index}
                      onClick={(e) => {
                        if (item.text === 'V1 Liquidity') {
                          setGeneralAddLiquidity(true);
                        } else {
                          goAddLiquidityPage(item.url);
                        }
                      }}
                      className={`whitespace-nowrap hover:bg-primaryText hover:bg-opacity-30 items-center flex justify-center px-5 py-0.5 h-10 hover:text-white rounded-lg text-primaryText text-center text-sm cursor-pointer my-auto`}
                    >
                      {item.text}
                    </span>
                  );
                })}
              </div>
            </span>
          </div>
        </div>
        {!isSignedIn ? (
          <NoLiquidity className="mt-4"></NoLiquidity>
        ) : (
          <>
            {listLiquiditiesLoading ? (
              <div className={`${checkedStatus == 'V1' ? 'hidden' : ''}`}>
                <div className="text-white text-base gotham_bold mb-3">
                  V2 (0)
                </div>
                <div className="flex justify-center items-center">
                  <BlueCircleLoading></BlueCircleLoading>
                </div>
              </div>
            ) : (
              <>
                {listLiquidities.length > 0 ? (
                  <div
                    className={`mb-10 ${checkedStatus == 'V1' ? 'hidden' : ''}`}
                  >
                    <div className="mb-3">
                      <div className="flex items-center text-white text-base">
                        <span className="gotham_bold">
                          V2 ({listLiquidities.length})
                        </span>
                        <div
                          className="text-white text-right ml-1"
                          data-class="reactTip"
                          data-for={'v2PoolNumberTip'}
                          data-place="top"
                          data-html={true}
                          data-tip={getTipForV2Pool()}
                        >
                          <QuestionMark></QuestionMark>
                          <ReactTooltip
                            id={'v2PoolNumberTip'}
                            backgroundColor="#1D2932"
                            border
                            borderColor="#7e8a93"
                            effect="solid"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-farmText">
                        <FormattedMessage id="v2_your_pool_introduction"></FormattedMessage>
                      </p>
                    </div>
                    <div>
                      {listLiquidities.map(
                        (liquidity: UserLiquidityInfo, index: number) => {
                          return (
                            <div key={index}>
                              <UserLiquidityLine
                                lpSize={listLiquidities.length}
                                setLpValueV2Done={setLpValueV2Done}
                                setYourLpValueV2={setYourLpValueV2}
                                liquidity={liquidity}
                              ></UserLiquidityLine>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            )}
            <YourLiquidityPage
              setLpValueV1Done={setLpValueV1Done}
              setYourLpValueV1={setYourLpValueV1}
              checkedStatus={checkedStatus}
              listLiquidities={listLiquidities}
              listLiquiditiesLoading={listLiquiditiesLoading}
            ></YourLiquidityPage>
          </>
        )}
      </div>
      <YourLiquidityAddLiquidityModal
        isOpen={generalAddLiquidity}
        onRequestClose={() => {
          setGeneralAddLiquidity(false);
        }}
        stablePools={stablePools}
      />
    </>
  );
}

export const REF_FI_LP_VALUE_COUNT = 'REF_FI_LP_VALUE_COUNT';

export const REF_FI_LP_V2_VALUE = 'REF_FI_LP_V2_VALUE';

function UserLiquidityLine({
  liquidity,
  setLpValueV2Done,
  lpSize,
  setYourLpValueV2,
}: {
  liquidity: UserLiquidityInfo;
  lpSize: number;
  setLpValueV2Done: (value: boolean) => void;
  setYourLpValueV2: (value: string) => void;
}) {
  const [poolDetail, setPoolDetail] = useState<PoolInfo>();
  const [liquidityDetail, setLiquidityDetail] = useState<UserLiquidityInfo>();
  const [hover, setHover] = useState<boolean>(false);
  const [isInrange, setIsInrange] = useState<boolean>(true);
  const [your_liquidity, setYour_liquidity] = useState('');
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>();
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [showRemoveBox, setShowRemoveBox] = useState<boolean>(false);
  const [showAddBox, setShowAddBox] = useState<boolean>(false);

  const {
    lpt_id,
    owner_id,
    pool_id,
    left_point,
    right_point,
    amount: L,
    unclaimed_fee_x,
    unclaimed_fee_y,
  } = liquidity;
  const [token_x, token_y, fee] = pool_id.split('|');
  const tokenMetadata_x_y = useTokens([token_x, token_y]);
  const history = useHistory();
  useEffect(() => {
    get_pool_detail();
    getBoostTokenPrices().then(setTokenPriceList);
    getLiquidityDetail();
  }, []);
  useEffect(() => {
    if (tokenMetadata_x_y && poolDetail && tokenPriceList) {
      const { current_point } = poolDetail;
      get_your_liquidity(current_point);
    }
  }, [poolDetail, tokenMetadata_x_y, tokenPriceList]);
  async function get_pool_detail() {
    const detail = await get_pool(pool_id, token_x);
    if (detail) {
      const { current_point } = detail;
      if (current_point >= left_point && right_point > current_point) {
        setIsInrange(true);
      } else {
        setIsInrange(false);
      }
      setPoolDetail(detail);
    }
  }
  async function getLiquidityDetail() {
    const l = await get_liquidity(lpt_id);
    if (l) {
      setLiquidityDetail(l);
    }
  }
  function getRate(direction: string) {
    let value = '';
    if (tokenMetadata_x_y) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const decimalRate =
        Math.pow(10, tokenX.decimals) / Math.pow(10, tokenY.decimals);
      if (direction == 'left') {
        value = toPrecision(getPriceByPoint(left_point, decimalRate), 6);
      } else if (direction == 'right') {
        value = toPrecision(getPriceByPoint(right_point, decimalRate), 6);
      }
    }
    const valueBig = new BigNumber(value);
    if (valueBig.isGreaterThan('100000')) {
      return new BigNumber(value).toExponential(3);
    } else {
      return value;
    }
  }
  function getLpt_id() {
    return lpt_id.split('#')[1];
  }
  function get_your_liquidity(current_point: number) {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const priceX = tokenPriceList[tokenX.id]?.price || 0;
    const priceY = tokenPriceList[tokenY.id]?.price || 0;
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      let tokenYAmount = getY(left_point, current_point, L, tokenY) || 0;
      let tokenXAmount = getX(current_point + 1, right_point, L, tokenX) || 0;
      const { amountx, amounty } = get_X_Y_In_CurrentPoint(tokenX, tokenY, L);
      tokenXAmount = new BigNumber(tokenXAmount).plus(amountx).toFixed();
      tokenYAmount = new BigNumber(tokenYAmount).plus(amounty).toFixed();
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      const total_price = tokenYTotalPrice.plus(tokenXTotalPrice).toFixed();
      setYour_liquidity(formatWithCommas(toPrecision(total_price, 3)));

      const storagedCount = sessionStorage.getItem(REF_FI_LP_VALUE_COUNT);

      const newSize = new BigNumber(storagedCount || '0').plus(1).toFixed();

      sessionStorage.setItem(REF_FI_LP_VALUE_COUNT, newSize);

      const storagedValue = sessionStorage.getItem(REF_FI_LP_V2_VALUE);

      sessionStorage.setItem(
        REF_FI_LP_V2_VALUE,
        new Big(!!total_price ? toPrecision(total_price, 3) : '0')
          .plus(new Big(storagedValue || '0'))
          .toFixed(2)
      );

      const newLPValue = new Big(
        !!total_price ? toPrecision(total_price, 3) : '0'
      )
        .plus(new Big(storagedValue || '0'))
        .toFixed(2);

      if (Number(newSize) == lpSize) {
        setLpValueV2Done(true);
        setYourLpValueV2(newLPValue);
      }
    }
    // only y token
    if (current_point >= right_point) {
      const tokenYAmount = getY(left_point, right_point, L, tokenY);
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      const total_price = tokenYTotalPrice.toFixed();
      setYour_liquidity(formatWithCommas(toPrecision(total_price, 3)));
      const storagedValue = sessionStorage.getItem(REF_FI_LP_V2_VALUE);

      const storagedCount = sessionStorage.getItem(REF_FI_LP_VALUE_COUNT);

      const newSize = new BigNumber(storagedCount || '0').plus(1).toFixed();

      sessionStorage.setItem(REF_FI_LP_VALUE_COUNT, newSize);

      sessionStorage.setItem(
        REF_FI_LP_V2_VALUE,
        new Big(!!total_price ? toPrecision(total_price, 3) : '0')
          .plus(new Big(storagedValue || '0'))
          .toFixed(2)
      );

      const newLPValue = new Big(
        !!total_price ? toPrecision(total_price, 3) : '0'
      )
        .plus(new Big(storagedValue || '0'))
        .toFixed(2);

      if (Number(newSize) == lpSize) {
        setLpValueV2Done(true);
        setYourLpValueV2(newLPValue);
      }
    }
    // only x token
    if (left_point > current_point) {
      const tokenXAmount = getX(left_point, right_point, L, tokenX);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      const total_price = tokenXTotalPrice.toFixed();
      setYour_liquidity(formatWithCommas(toPrecision(total_price, 3)));
      const storagedValue = sessionStorage.getItem(REF_FI_LP_V2_VALUE);

      const storagedCount = sessionStorage.getItem(REF_FI_LP_VALUE_COUNT);

      const newSize = new BigNumber(storagedCount || '0').plus(1).toFixed();

      sessionStorage.setItem(REF_FI_LP_VALUE_COUNT, newSize);

      sessionStorage.setItem(
        REF_FI_LP_V2_VALUE,
        new Big(!!total_price ? toPrecision(total_price, 3) : '0')
          .plus(new Big(storagedValue || '0'))
          .toFixed(2)
      );
      const newLPValue = new Big(
        !!total_price ? toPrecision(total_price, 3) : '0'
      )
        .plus(new Big(storagedValue || '0'))
        .toFixed(2);

      if (Number(newSize) == lpSize) {
        setLpValueV2Done(true);
        setYourLpValueV2(newLPValue);
      }
    }
  }
  function getY(
    leftPoint: number,
    rightPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const y = new BigNumber(L).multipliedBy(
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
        (Math.sqrt(CONSTANT_D) - 1)
    );
    const y_result = y.toFixed();
    return toReadableNumber(token.decimals, toPrecision(y_result, 0));
  }
  function getX(
    leftPoint: number,
    rightPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const x = new BigNumber(L)
      .multipliedBy(
        (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
          (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
            Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
      )
      .toFixed();
    return toReadableNumber(token.decimals, toPrecision(x, 0));
  }
  function get_X_Y_In_CurrentPoint(
    tokenX: TokenMetadata,
    tokenY: TokenMetadata,
    L: string
  ) {
    const { liquidity, liquidity_x, current_point } = poolDetail;
    const liquidity_y_big = new BigNumber(liquidity).minus(liquidity_x);
    let Ly = '0';
    let Lx = '0';
    // only remove y
    if (liquidity_y_big.isGreaterThanOrEqualTo(L)) {
      Ly = L;
    } else {
      // have x and y
      Ly = liquidity_y_big.toFixed();
      Lx = new BigNumber(L).minus(Ly).toFixed();
    }
    const amountX = getXAmount_per_point_by_Lx(Lx, current_point);
    const amountY = getYAmount_per_point_by_Ly(Ly, current_point);
    const amountX_read = toReadableNumber(
      tokenX.decimals,
      toPrecision(amountX, 0)
    );
    const amountY_read = toReadableNumber(
      tokenY.decimals,
      toPrecision(amountY, 0)
    );
    return { amountx: amountX_read, amounty: amountY_read };
  }
  function claimRewards(e: any) {
    e.stopPropagation();
    if (!canClaim()) return;
    setClaimLoading(true);
    const [tokenX, tokenY] = tokenMetadata_x_y;
    remove_liquidity({
      token_x: tokenX,
      token_y: tokenY,
      lpt_id,
      amount: '0',
      min_amount_x: '0',
      min_amount_y: '0',
    });
  }
  function goYourLiquidityDetailPage() {
    const id = lpt_id.replace(/\|/g, '@').replace('#', '@');
    history.push(`/yoursLiquidityDetailV2/${id}`);
  }
  function getTokenFeeAmount(p: string) {
    if (liquidityDetail && tokenMetadata_x_y && tokenPriceList) {
      const [tokenX, tokenY] = tokenMetadata_x_y;
      const { unclaimed_fee_x, unclaimed_fee_y } = liquidityDetail;
      const fee_x_amount = toReadableNumber(
        tokenX.decimals,
        unclaimed_fee_x || '0'
      );
      const fee_y_amount = toReadableNumber(
        tokenY.decimals,
        unclaimed_fee_y || '0'
      );
      if (p == 'l') {
        if (new BigNumber(fee_x_amount).isEqualTo('0')) {
          return '0';
        } else if (new BigNumber(fee_x_amount).isLessThan('0.001')) {
          return '<0.001';
        } else {
          return toPrecision(fee_x_amount, 3);
        }
      } else if (p == 'r') {
        if (new BigNumber(fee_y_amount).isEqualTo('0')) {
          return '0';
        } else if (new BigNumber(fee_y_amount).isLessThan('0.001')) {
          return '<0.001';
        } else {
          return toPrecision(fee_y_amount, 3);
        }
      } else if (p == 'p') {
        const tokenxSinglePrice = tokenPriceList[tokenX.id]?.price || '0';
        const tokenySinglePrice = tokenPriceList[tokenY.id]?.price || '0';
        const priceX = new BigNumber(fee_x_amount).multipliedBy(
          tokenxSinglePrice
        );
        const priceY = new BigNumber(fee_y_amount).multipliedBy(
          tokenySinglePrice
        );
        const totalPrice = priceX.plus(priceY);
        if (totalPrice.isEqualTo('0')) {
          return '$0';
        } else if (totalPrice.isLessThan('0.001')) {
          return '<$0.001';
        } else {
          return '$' + toPrecision(totalPrice.toFixed(), 3);
        }
      }
    }
  }
  function canClaim() {
    if (liquidityDetail) {
      const { unclaimed_fee_x, unclaimed_fee_y } = liquidityDetail;
      if (+unclaimed_fee_x > 0 || +unclaimed_fee_y > 0) return true;
    }
    return false;
  }
  return (
    <div
      className="mt-3.5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* for PC */}
      <div className="relative flex flex-col items-center xs:hidden md:hidden">
        <div className="absolute -top-1.5 flex items-center justify-center z-10">
          <ColorsBoxCenter></ColorsBoxCenter>
          <span className="absolute text-white text-xs gotham_bold">
            ID #{getLpt_id()}
          </span>
        </div>
        <div className="w-full rounded-xl overflow-hidden">
          <div
            className={`relative p-4 pt-8 cursor-pointer ${
              hover ? 'bg-v3HoverDarkBgColor' : 'bg-cardBg'
            }`}
            onClick={goYourLiquidityDetailPage}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center flex-shrink-0">
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                    className="w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                    className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                </div>
                <span className="text-white font-bold ml-9 mr-2.5 text-sm gotham_bold">
                  {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']}/
                  {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}
                </span>
                <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
                  <span className="text-xs text-v3SwapGray whitespace-nowrap mr-1.5">
                    <FormattedMessage id="fee_Tiers" />
                  </span>
                  <span className="text-sm text-v3Blue">{+fee / 10000}%</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-v3SwapGray text-xs mr-1.5">
                  <FormattedMessage
                    id="min"
                    defaultMessage="Min"
                  ></FormattedMessage>
                </span>
                <span className="text-white text-sm overflow-hidden whitespace-nowrap overflow-ellipsis gotham_bold">
                  {getRate('left')}
                </span>
                <label className="text-v3SwapGray text-xs mx-2">-</label>
                <span className="text-v3SwapGray text-xs mr-1.5">
                  <FormattedMessage
                    id="max"
                    defaultMessage="Max"
                  ></FormattedMessage>
                </span>
                <span className="text-white text-sm overflow-hidden whitespace-nowrap overflow-ellipsis gotham_bold">
                  {getRate('right')}
                </span>
                <span className="text-v3SwapGray text-xs ml-1.5 mr-3">
                  {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}/
                  {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']}
                </span>
                <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
                  <span
                    className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isInrange
                        ? 'bg-gradientFromHover'
                        : 'bg-v3GarkWarningColor'
                    }`}
                  ></span>
                  <span
                    className={`whitespace-nowrap text-xs ${
                      isInrange
                        ? 'text-gradientFromHover'
                        : 'text-v3GarkWarningColor'
                    }`}
                  >
                    {isInrange ? (
                      <FormattedMessage id="in_range"></FormattedMessage>
                    ) : (
                      <FormattedMessage id="out_of_range"></FormattedMessage>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`items-center justify-between p-4 border-t border-v3BlueBorderColor bg-cardBg ${
              hover ? 'flex' : 'hidden'
            }`}
          >
            <div className="flex items-center justify-center">
              <span className="text-xs text-v3SwapGray">
                <FormattedMessage id="your_liquidity" />
              </span>
              <span className="text-sm text-white mx-2.5 gotham_bold">
                ${your_liquidity || '-'}
              </span>
              <GradientButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddBox(true);
                }}
                color="#fff"
                minWidth="5rem"
                borderRadius="8px"
                className={`px-3 h-8 text-center text-sm text-white gotham_bold focus:outline-none mr-2.5`}
              >
                <FormattedMessage id="add" />
              </GradientButton>
              <BorderButton
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRemoveBox(true);
                }}
                rounded="rounded-lg"
                px="px-0"
                py="py-1"
                style={{ minWidth: '5rem' }}
                className="flex-grow  gotham_bold text-sm text-greenColor h-8"
              >
                <FormattedMessage id="remove" />
              </BorderButton>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs text-v3SwapGray mr-2.5">
                <FormattedMessage id="unclaimed_fees" />
              </span>
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                className="w-5 h-5 border border-greenColor rounded-full mr-1"
              ></img>
              <span className="text-sm text-white mr-3 gotham_bold">
                {getTokenFeeAmount('l') || '-'}
              </span>
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                className="w-5 h-5 border border-greenColor rounded-full mr-1"
              ></img>
              <span className="text-sm text-white gotham_bold">
                {getTokenFeeAmount('r') || '-'}
              </span>
              <div
                className={`flex items-center justify-center  rounded-lg text-sm px-2 py-1 ml-5 gotham_bold ${
                  !canClaim()
                    ? 'bg-black bg-opacity-25 text-v3SwapGray cursor-not-allowed'
                    : 'bg-deepBlue hover:bg-deepBlueHover text-white cursor-pointer'
                }`}
                onClick={claimRewards}
              >
                <ButtonTextWrapper
                  loading={claimLoading}
                  Text={() => <FormattedMessage id="claim" />}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* for Mobile */}
      <div className="lg:hidden">
        <div
          className={`relative cursor-pointer bg-cardBg rounded -xl overflow-hidden`}
          onClick={goYourLiquidityDetailPage}
        >
          <div className="flex flex-col items-center justify-between w-full bg-orderMobileTop px-3 pb-3">
            <div className="flex items-center justify-center">
              <ColorsBox svgId="paint0_linear_124_7158"></ColorsBox>
              <span className="absolute text-white text-xs">
                ID #{getLpt_id()}
              </span>
            </div>
            <div className="flex items-center justify-between w-full mt-1.5">
              <div className="flex items-center">
                <div className="flex items-center flex-shrink-0">
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                    className="w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                    className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
                  ></img>
                </div>
                <span className="text-white text-sm ml-1.5">
                  {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']}/
                  {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}
                </span>
              </div>
              <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
                <span
                  className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isInrange ? 'bg-gradientFromHover' : 'bg-v3GarkWarningColor'
                  }`}
                ></span>
                <span
                  className={`whitespace-nowrap text-xs ${
                    isInrange
                      ? 'text-gradientFromHover'
                      : 'text-v3GarkWarningColor'
                  }`}
                >
                  {isInrange ? (
                    <FormattedMessage id="in_range"></FormattedMessage>
                  ) : (
                    <FormattedMessage id="out_of_range"></FormattedMessage>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col p-3">
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-v3SwapGray">
                <FormattedMessage id="fee_Tiers" />
              </span>
              <span className="text-sm text-white">{+fee / 10000}%</span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-v3SwapGray text-xs">
                <FormattedMessage id="min_price" /> (1{' '}
                {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']})
              </span>
              <span className="text-white text-sm">
                {getRate('left')}&nbsp;
                {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}
              </span>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-v3SwapGray text-xs">
                <FormattedMessage id="max_price" /> (1{' '}
                {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']})
              </span>
              <span className="text-white text-sm">
                {getRate('right')}&nbsp;
                {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}
              </span>
            </div>
            <div className="flex items-start justify-between mt-4">
              <span className="text-v3SwapGray text-xs">
                <FormattedMessage id="unclaimed_fees" />
              </span>
              <span className="text-white text-sm"></span>
              <div className="flex flex-col justify-end text-white text-sm">
                <div className="flex items-center">
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                    className="w-5 h-5 border border-greenColor rounded-full mr-1"
                  ></img>
                  <span className="text-sm text-white mr-3">
                    {getTokenFeeAmount('l') || '-'}
                  </span>
                  <img
                    src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                    className="w-5 h-5 border border-greenColor rounded-full mr-1"
                  ></img>
                  <span className="text-sm text-white">
                    {getTokenFeeAmount('r') || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-end mt-2">
                  <div
                    className={`flex items-center justify-center  rounded-lg text-sm px-2 py-1 ${
                      !canClaim()
                        ? 'bg-black bg-opacity-25 text-v3SwapGray cursor-not-allowed'
                        : 'bg-deepBlue hover:bg-deepBlueHover text-white cursor-pointer'
                    }`}
                    onClick={claimRewards}
                  >
                    <ButtonTextWrapper
                      loading={claimLoading}
                      Text={() => <FormattedMessage id="claim" />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-searchBgColor rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-v3SwapGray">
              <FormattedMessage id="your_liquidity" />
            </span>
            <span className="text-sm text-white">${your_liquidity || '-'}</span>
          </div>
          <div className="flex items-center justify-between mt-3.5">
            <GradientButton
              onClick={(e) => {
                e.stopPropagation();
                setShowAddBox(true);
              }}
              color="#fff"
              className={`w-1 flex-grow h-8 text-center text-sm text-white focus:outline-none mr-3`}
            >
              <FormattedMessage id="add" />
            </GradientButton>
            <BorderButton
              onClick={(e) => {
                e.stopPropagation();
                setShowRemoveBox(true);
              }}
              rounded="rounded-md"
              px="px-0"
              py="py-1"
              className="w-1 flex-grow  text-sm text-greenColor h-8"
            >
              <FormattedMessage id="remove" />
            </BorderButton>
          </div>
        </div>
      </div>
      {showRemoveBox ? (
        <RemovePoolV3
          isOpen={showRemoveBox}
          onRequestClose={() => {
            setShowRemoveBox(false);
          }}
          tokenMetadata_x_y={tokenMetadata_x_y}
          poolDetail={poolDetail}
          tokenPriceList={tokenPriceList}
          userLiquidity={liquidityDetail}
          style={{
            overlay: {
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
            },
            content: {
              outline: 'none',
              transform: 'translate(-50%, -50%)',
            },
          }}
        ></RemovePoolV3>
      ) : null}
      <AddPoolV3
        isOpen={showAddBox}
        onRequestClose={() => {
          setShowAddBox(false);
        }}
        tokenMetadata_x_y={tokenMetadata_x_y}
        poolDetail={poolDetail}
        tokenPriceList={tokenPriceList}
        userLiquidity={liquidityDetail}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            transform: 'translate(-50%, -50%)',
          },
        }}
      ></AddPoolV3>
    </div>
  );
}
export function NoLiquidity({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  return (
    <div
      className={`w-full rounded-xl overflow-hidden h-48 relative text-white font-normal  flex items-center justify-center ${
        className || ''
      }`}
      style={{
        background: 'rgb(26,36,43)',
      }}
    >
      <div className="flex items-center flex-col relative text-center z-10 mx-auto">
        <span className="mb-4">
          <MyOrderCircle />
        </span>

        <span className="text-white text-base">
          Your {text} liquidity positions will appear here.
        </span>
        {isSignedIn ? null : (
          <div className="mt-5 w-72">
            <ConnectToNearBtnSwap />
          </div>
        )}
      </div>

      <MyOrderMask />
      <MyOrderMask2 />
    </div>
  );
}
