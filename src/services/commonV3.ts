import React, { useState, useEffect, useContext } from 'react';
import { getURLInfo } from '../components/layout/transactionTipPopUp';
import { checkTransaction, checkTransactionStatus } from '../services/swap';
import { WalletContext } from '../utils/wallets-integration';
import { useHistory } from 'react-router';
import BigNumber from 'bignumber.js';
/**
 * caculate price by point
 * @param pointDelta
 * @param point
 * @param decimalRate tokenX/tokenY
 * @returns
 */
export function getPriceByPoint(point: number, decimalRate: number) {
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
export function getPointByPrice(
  pointDelta: number,
  price: string,
  decimalRate: number,
  noNeedSlot?: boolean
) {
  const point = Math.log(+price * decimalRate) / Math.log(CONSTANT_D);
  const point_int = Math.round(point);
  let point_int_slot = point_int;
  if (!noNeedSlot) {
    point_int_slot = Math.floor(point_int / pointDelta) * pointDelta;
  }
  if (point_int_slot < POINTLEFTRANGE) {
    return POINTLEFTRANGE;
  } else if (point_int_slot > POINTRIGHTRANGE) {
    return 800000;
  }
  return point_int_slot;
}
export const CONSTANT_D = 1.0001;
export const POINTDELTAMAP = {
  100: 1,
  400: 8,
  2000: 40,
  10000: 200,
};
export const DEFAULTSELECTEDFEE = 2000;
export const FEELIST = [
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
export const POINTLEFTRANGE = -800000;
export const POINTRIGHTRANGE = 800000;
export interface UserLiquidityInfo {
  lpt_id: string;
  owner_id: string;
  pool_id: string;
  left_point: number;
  right_point: number;
  amount: string;
  unclaimed_fee_x: string;
  unclaimed_fee_y: string;
}

export function useAddAndRemoveUrlHandle() {
  const history = useHistory();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res: any) => {
        const { transaction, status } = res;
        const successValue: string | undefined = status?.SuccessValue;
        const methodName =
          transaction?.actions[0]?.['FunctionCall']?.method_name;
        let returnValue;
        let argsValue;
        if (successValue) {
          const buff = Buffer.from(successValue, 'base64');
          const v = buff.toString('ascii');
          returnValue = v.substring(1, v.length - 1);
        }
        const args = transaction?.actions[0]?.['FunctionCall']?.args;
        if (args) {
          const buff = Buffer.from(args, 'base64');
          const v = buff.toString('ascii');
          argsValue = v;
        }
        if (methodName == 'add_liquidity' && returnValue) {
          const [tokenX, tokenY, id] = returnValue.split('|');
          const [fee, hashId] = id.split('#');
          const paramsId = `${tokenX}@${tokenY}@${fee}@${hashId}`;
          history.replace('/yoursLiquidityDetailV3/' + `${paramsId}`);
        } else if (methodName == 'remove_liquidity' && argsValue) {
          const parmas = JSON.parse(argsValue);
          const { amount, min_amount_x, min_amount_y } = parmas;
          if (+amount == 0 && +min_amount_x == 0 && +min_amount_y == 0) {
            history.replace(`${location.pathname}`);
          } else {
            history.replace('/yourliquidity');
          }
        } else if (methodName == 'create_pool' && returnValue) {
          history.replace(`${location.pathname}#${returnValue}`);
        }
      });
    }
  }, [txHash, isSignedIn]);
}
