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
import { ColorsBox } from '~components/icon/V3';
import {
  GradientButton,
  BorderButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from '~components/button/Button';
import { toPrecision, toReadableNumber } from '~utils/numbers';
import { TokenMetadata } from '../../services/ft-contract';
import { useTokens } from '../../state/token';
import {
  getPriceByPoint,
  CONSTANT_D,
  UserLiquidityInfo,
  useAddAndRemoveUrlHandle,
} from '../../services/commonV3';
import BigNumber from 'bignumber.js';
import { getBoostTokenPrices } from '../../services/farm';
import { RemovePoolV3 } from '~components/pool/RemovePoolV3';
import { AddPoolV3 } from '~components/pool/AddPoolV3';
import {
  YourLiquidityAddLiquidityModal,
  YourLiquidityPage,
} from '../pools/YourLiquidityPage';
import { WalletContext } from '../../utils/wallets-integration';

import {
  MyOrderCircle,
  MyOrderMask,
  MyOrderMask2,
} from '~components/icon/swapV3';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { PoolRPCView } from '../../services/api';
import { ALL_STABLE_POOL_IDS } from '../../services/near';
import { getPoolsByIds } from '../../services/indexer';
export default function YourLiquidityPageV3() {
  const [listLiquidities, setListLiquidities] = useState<UserLiquidityInfo[]>(
    []
  );
  const [liquidityStatusList, setLiquidityStatusList] = useState<string[]>([
    'All',
    'New',
    'Old',
  ]);
  const [addliquidityList, setAddliquidityList] = useState<any[]>([
    {
      text: 'Old Liquidity',
      url: '/pools',
    },
    {
      text: 'New Liquidity',
      url: '/addLiquidityV3',
    },
  ]);

  const [stablePools, setStablePools] = useState<PoolRPCView[]>();

  useEffect(() => {
    const ids = ALL_STABLE_POOL_IDS;

    getPoolsByIds({ pool_ids: ids }).then((res) => {
      setStablePools(res);
    });
  }, []);

  const [generalAddLiquidity, setGeneralAddLiquidity] =
    useState<boolean>(false);
  const [checkedStatus, setCheckedStatus] = useState('All');
  const [oldLiquidityHasNoData, setOldLiquidityHasNoData] = useState(false);
  const [addLiqudityHover, setAddLiqudityHover] = useState(false);
  // callBack handle
  useAddAndRemoveUrlHandle();
  const history = useHistory();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (isSignedIn) {
      get_list_liquidities();
    }
  }, [isSignedIn]);
  async function get_list_liquidities() {
    const list = await list_liquidities();
    if (list.length > 0) {
      setListLiquidities(list);
    }
  }
  function goAddLiquidityPage(url: string) {
    history.push(url);
  }
  function switchButton(type: string) {
    setCheckedStatus(type);
  }
  function setNoOldLiquidity(status: boolean) {
    setOldLiquidityHasNoData(status);
  }
  return (
    <>
      <div className="flex items flex-col lg:w-2/3 xl:w-3/5 md:w-5/6 xs:w-11/12 m-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <span className="text-white text-xl mr-5">Liquidity</span>
            <div className="flex items-center text-xs text-primaryText border border-v3borderColor p-0.5 rounded-lg">
              {liquidityStatusList.map((item: string, index: number) => {
                return (
                  <span
                    key={index}
                    onClick={() => {
                      switchButton(item);
                    }}
                    className="flex items-center justify-center h-6 py-0.5 px-1.5 rounded-md cursor-pointer"
                    style={{
                      background:
                        checkedStatus == item ? 'rgba(48, 68, 82, 0.5)' : '',
                      boxShadow:
                        checkedStatus == item
                          ? '0px 0px 10px rgba(0, 0, 0, 0.15)'
                          : '',
                      backdropFilter: checkedStatus == item ? 'blur(50px)' : '',
                    }}
                  >
                    {item}
                  </span>
                );
              })}
            </div>
          </div>
          <div
            className="relative pb-10"
            onMouseOver={() => {
              setAddLiqudityHover(true);
            }}
            onMouseLeave={() => {
              setAddLiqudityHover(false);
            }}
          >
            <GradientButton
              color="#fff"
              className={`px-4 h-8 text-center text-base text-white focus:outline-none`}
            >
              <FormattedMessage
                id="add_liquidity"
                defaultMessage="Add Liquidity"
              />
            </GradientButton>
            <span
              className={`top-10 pt-2 absolute z-50 ${
                addLiqudityHover ? '' : 'hidden'
              }`}
            >
              <div
                className="py-2 px-1.5 rounded-xl min-w-28 flex flex-col"
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
                        if (item.text === 'Old Liquidity') {
                          setGeneralAddLiquidity(true);
                        } else {
                          goAddLiquidityPage(item.url);
                        }
                      }}
                      className={`whitespace-nowrap hover:bg-primaryText hover:bg-opacity-30 items-center flex justify-center px-4 py-0.5 h-11 mb-0.5 hover:text-white rounded-lg text-primaryText text-center text-sm cursor-pointer my-auto`}
                    >
                      {item.text}
                    </span>
                  );
                })}
              </div>
            </span>
          </div>
        </div>
        {!isSignedIn ||
        (oldLiquidityHasNoData && listLiquidities.length == 0) ? (
          <NoLiquidity></NoLiquidity>
        ) : (
          <>
            {listLiquidities.length == 0 ? null : (
              <div className={`mb-7 ${checkedStatus == 'Old' ? 'hidden' : ''}`}>
                <div className="text-white text-base mb-2.5">
                  New ({listLiquidities.length})
                </div>
                <div>
                  {listLiquidities.map(
                    (liquidity: UserLiquidityInfo, index: number) => {
                      return (
                        <div key={index}>
                          <UserLiquidityLine
                            liquidity={liquidity}
                          ></UserLiquidityLine>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
            {oldLiquidityHasNoData ? null : (
              <div className={`${checkedStatus == 'New' ? 'hidden' : ''}`}>
                <YourLiquidityPage
                  setNoOldLiquidity={setNoOldLiquidity}
                ></YourLiquidityPage>
              </div>
            )}
            {checkedStatus == 'New' && listLiquidities.length == 0 ? (
              <NoLiquidity></NoLiquidity>
            ) : null}
            {checkedStatus == 'Old' && oldLiquidityHasNoData ? (
              <NoLiquidity></NoLiquidity>
            ) : null}
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

function UserLiquidityLine({ liquidity }: { liquidity: UserLiquidityInfo }) {
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
  function getMinRate(direction: string) {
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
    return value;
  }
  function getLpt_id() {
    return lpt_id.split('#')[1];
  }
  function get_your_liquidity(current_point: number) {
    const [tokenX, tokenY] = tokenMetadata_x_y;
    const tokenYAmount = getY(left_point, current_point, L, tokenY) || 0;
    const tokenXAmount = getX(current_point, right_point, L, tokenX) || 0;
    const priceX = tokenPriceList[tokenX.id]?.price || 0;
    const priceY = tokenPriceList[tokenY.id]?.price || 0;
    //  in range
    if (current_point >= left_point && right_point > current_point) {
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      const total_price = tokenYTotalPrice.plus(tokenXTotalPrice).toFixed();
      setYour_liquidity(toPrecision(total_price, 3));
    }
    // only y token
    if (current_point >= right_point) {
      const tokenYTotalPrice = new BigNumber(tokenYAmount).multipliedBy(priceY);
      const total_price = tokenYTotalPrice.toFixed();
      setYour_liquidity(toPrecision(total_price, 3));
    }
    // only x token
    if (left_point > current_point) {
      const tokenXTotalPrice = new BigNumber(tokenXAmount).multipliedBy(priceX);
      const total_price = tokenXTotalPrice.toFixed();
      setYour_liquidity(toPrecision(total_price, 3));
    }
  }
  function getY(
    leftPoint: number,
    rightPoint: number,
    L: string,
    token: TokenMetadata
  ) {
    const y = new BigNumber(L)
      .multipliedBy(
        (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
          (Math.sqrt(CONSTANT_D) - 1)
      )
      .toFixed();
    return toReadableNumber(token.decimals, toPrecision(y, 0));
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
    history.push(`/yoursLiquidityDetailV3/${id}`);
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
      className="rounded-xl mt-3.5 overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`relative p-4 pt-8 cursor-pointer ${
          hover ? 'bg-v3HoverDarkBgColor' : 'bg-cardBg'
        }`}
        onClick={goYourLiquidityDetailPage}
      >
        <div className="absolute top-0 left-6 flex items-center justify-center">
          <ColorsBox></ColorsBox>
          <span className="absolute text-white text-xs">ID #{getLpt_id()}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center">
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[0].icon}
                className="w-7 h-7 border border-greenColor rounded-full"
              ></img>
              <img
                src={tokenMetadata_x_y && tokenMetadata_x_y[1].icon}
                className="relative -ml-1.5 w-7 h-7 border border-greenColor rounded-full"
              ></img>
            </div>
            <span className="text-white font-bold ml-9 mr-2.5">
              {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']}/
              {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}
            </span>
            <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
              <span className="text-xs text-v3SwapGray mr-1.5">Fee Tiers</span>
              <span className="text-sm text-v3Blue">{+fee / 10000}%</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-v3SwapGray text-xs mr-1.5">Min</span>
            <span className="text-white text-sm">{getMinRate('left')}</span>
            <label className="text-v3SwapGray text-xs mx-2">-</label>
            <span className="text-v3SwapGray text-xs mr-1.5">Max</span>
            <span className="text-white text-sm">{getMinRate('right')}</span>
            <span className="text-v3SwapGray text-xs ml-1.5 mr-3">
              {tokenMetadata_x_y && tokenMetadata_x_y[0]['symbol']}/
              {tokenMetadata_x_y && tokenMetadata_x_y[1]['symbol']}
            </span>
            <div className="flex items-center justify-center bg-black bg-opacity-25 rounded-2xl px-3 h-6 py-0.5">
              <span
                className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mr-1.5 ${
                  isInrange ? 'bg-gradientFromHover' : 'bg-v3GarkWarningColor'
                }`}
              ></span>
              <span
                className={`text-xs ${
                  isInrange
                    ? 'text-gradientFromHover'
                    : 'text-v3GarkWarningColor'
                }`}
              >
                {isInrange ? 'In range' : 'Out of range'}
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
          <span className="text-xs text-v3SwapGray">Your Liquidity</span>
          <span className="text-sm text-white mx-2.5">
            ${your_liquidity || '-'}
          </span>
          <GradientButton
            onClick={(e) => {
              e.stopPropagation();
              setShowAddBox(true);
            }}
            color="#fff"
            className={`w-20 h-8 text-center text-sm text-white focus:outline-none mr-2.5`}
          >
            Add
          </GradientButton>
          <BorderButton
            onClick={(e) => {
              e.stopPropagation();
              setShowRemoveBox(true);
            }}
            rounded="rounded-md"
            px="px-0"
            py="py-1"
            className="flex-grow  w-20 text-sm text-greenColor"
          >
            Remove
          </BorderButton>
        </div>
        <div className="flex items-center justify-center">
          <span className="text-xs text-v3SwapGray mr-2.5">Unclaimed Fees</span>
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
          <div
            className={`flex items-center justify-center  rounded-lg text-sm h-8 w-20 ml-5 ${
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
function NoLiquidity() {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  return (
    <div
      className="w-full rounded-xl overflow-hidden h-48 relative text-white font-normal  flex items-center justify-center"
      style={{
        background: 'rgb(26,36,43)',
      }}
    >
      <div className="flex items-center flex-col relative text-center z-50 mx-auto">
        <span className="mb-4">
          <MyOrderCircle />
        </span>

        <span className="text-white text-base">
          Your liquidity positions will appear here.
        </span>
        {isSignedIn ? null : (
          <div className="mt-5 w-72">
            <ConnectToNearBtn></ConnectToNearBtn>
          </div>
        )}
      </div>

      <MyOrderMask />
      <MyOrderMask2 />
    </div>
  );
}
