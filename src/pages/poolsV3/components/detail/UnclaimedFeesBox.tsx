import React, { useEffect, useState } from 'react';
import { toPrecision, formatWithCommas } from '../../../../utils/numbers';
import { FormattedMessage } from 'react-intl';
import { claim_all_liquidity_fee } from 'src/services/swapV3';
import { UserLiquidityInfo } from 'src/services/commonV3';
import { ButtonTextWrapper } from 'src/components/button/Button';
import _ from 'lodash';
import { Icon } from './Icon';
import { get_unClaimed_fee_data } from './DetailFun';
import {
  constTransactionPage,
  useTranstionsExcuteDataStore,
} from 'src/stores/transtionsExcuteData';

export function UnclaimedFeesBox(props: any) {
  const { poolDetail, liquidities, tokenPriceList } = props;
  const { token_x_metadata, token_y_metadata } = poolDetail;
  const [user_liquidities_total, set_user_liquidities_total] =
    useState<Record<string, any>>();
  const [cliam_loading, set_cliam_loading] = useState(false);

  const processTransactionPending = useTranstionsExcuteDataStore(
    (state) => state.processTransactionPending
  );
  const processTransactionSuccess = useTranstionsExcuteDataStore(
    (state) => state.processTransactionSuccess
  );
  const processTransactionError = useTranstionsExcuteDataStore(
    (state) => state.processTransactionError
  );

  useEffect(() => {
    if (liquidities) {
      const [total_tvl_fee, total_amount_x_fee, total_amount_y_fee] =
        get_unClaimed_fee_data(liquidities, poolDetail, tokenPriceList);
      set_user_liquidities_total({
        total_amount_x_fee,
        total_amount_y_fee,
        total_tvl_fee,
      });
    }
  }, [liquidities, Object.keys(tokenPriceList).length]);

  function getTotalLiquditiesFee() {
    const total_tvl = user_liquidities_total?.total_tvl_fee || 0;
    if (total_tvl == 0) {
      return '$0';
    } else if (total_tvl < 0.01) {
      return '<$0.01';
    } else {
      return '$' + formatWithCommas(toPrecision(total_tvl.toString(), 2));
    }
  }
  function getTotalFeeAmount() {
    const total_amount_x = user_liquidities_total?.total_amount_x_fee || 0;
    const total_amount_y = user_liquidities_total?.total_amount_y_fee || 0;
    let display_amount_x;
    let display_amount_y;
    const total_amount_x_y = total_amount_x + total_amount_y;
    if (total_amount_x == 0) {
      display_amount_x = '0';
    } else if (total_amount_x < 0.001) {
      display_amount_x = '<0.001';
    } else {
      display_amount_x = toPrecision(total_amount_x.toString(), 3);
    }
    if (total_amount_y == 0) {
      display_amount_y = '0';
    } else if (total_amount_y < 0.001) {
      display_amount_y = '<0.001';
    } else {
      display_amount_y = toPrecision(total_amount_y.toString(), 3);
    }

    return {
      display_amount_x,
      display_amount_y,
      total_amount_x_y,
    };
  }
  const { display_amount_x, display_amount_y, total_amount_x_y } =
    getTotalFeeAmount();

  async function claimRewards() {
    const transactionId = String(Date.now());
    try {
      if (total_amount_x_y == 0) return;
      set_cliam_loading(true);
      const lpt_ids: string[] = [];
      liquidities.forEach((liquidity: UserLiquidityInfo) => {
        const { unclaimed_fee_x, unclaimed_fee_y } = liquidity;
        if (+unclaimed_fee_x > 0 || +unclaimed_fee_y > 0) {
          lpt_ids.push(liquidity.lpt_id);
        }
      });

      processTransactionPending({
        transactionId,
        page: constTransactionPage.pool,
        data: {
          prefix: 'Claiming',
          tokens: [
            {
              token: token_x_metadata,
              amount: display_amount_x,
            },
            {
              token: token_y_metadata,
              amount: display_amount_y,
            },
          ],
        },
      });

      set_cliam_loading(false);
      const { response } = await claim_all_liquidity_fee({
        token_x: token_x_metadata,
        token_y: token_y_metadata,
        lpt_ids,
      });

      processTransactionSuccess({
        transactionId,
        transactionResponse: response,
      });
    } catch (e) {
      processTransactionError({
        error: e,
        transactionId,
      });
    }
  }

  return (
    <>
      {/* for pc */}
      <div className="p-5 bg-cardBg rounded-xl mt-3.5 xsm:hidden">
        <div className="flex  font-gothamBold text-white text-base items-start justify-between xsm:hidden">
          <span className="">
            <FormattedMessage id="unclaimed_fees" />
          </span>
          <span className="text-white font-gothamBold">
            {getTotalLiquditiesFee()}
          </span>
        </div>
        <div className="frcb mt-4">
          <div className="frcs gap-6 text-sm text-white">
            <div className="frcs">
              <Icon
                icon={token_x_metadata.icon}
                className="h-7 w-7 mr-2"
              ></Icon>
              <span className=" ">{display_amount_x}</span>
            </div>
            <div className="frcs ">
              <Icon
                icon={token_y_metadata.icon}
                className="h-7 w-7 mr-2"
              ></Icon>
              <span className=" ">{display_amount_y}</span>
            </div>
          </div>

          <div
            className={`btn-UnclaimedFeesBox flex items-center font-gothamBold justify-center h-10 rounded-lg text-sm px-6 py-1  ${
              total_amount_x_y == 0
                ? 'bg-black bg-opacity-25 text-v3SwapGray cursor-not-allowed'
                : 'bg-deepBlue hover:bg-deepBlueHover text-white cursor-pointer'
            }`}
            onClick={claimRewards}
            style={{
              background: 'linear-gradient(180deg, #646DF4 0%, #371BE4 100%)',
            }}
          >
            <ButtonTextWrapper
              loading={cliam_loading}
              Text={() => <FormattedMessage id={'claim'} />}
            />
          </div>
        </div>
      </div>
      {/* for mobile */}
      <div className="flex flex-col items-center lg:hidden">
        <div className="flex items-center w-full justify-between mt-5">
          <span className="text-sm text-white">
            <FormattedMessage id="unclaimed_fees" />
          </span>
          <span className="text-white font-gothamBold">
            {getTotalLiquditiesFee()}
          </span>
        </div>
        <div className="flex items-center justify-between w-full mt-5">
          <div className="flex items-center">
            <Icon icon={token_x_metadata.icon} className="h-7 w-7 mr-2"></Icon>
            <span className="text-white text-sm">
              {token_x_metadata.symbol}
            </span>
          </div>
          <span className="text-white text-sm">{display_amount_x}</span>
        </div>
        <div className="flex items-center justify-between w-full mt-5">
          <div className="flex items-center">
            <Icon icon={token_y_metadata.icon} className="h-7 w-7 mr-2"></Icon>
            <span className="text-white text-sm">
              {token_y_metadata.symbol}
            </span>
          </div>
          <span className="text-white text-sm">{display_amount_y}</span>
        </div>
        <div
          className={`btn-UnclaimedFeesBox-m flex items-center font-gothamBold justify-center h-10 rounded-lg text-sm px-6 py-1 w-full mt-6 ${
            total_amount_x_y == 0
              ? 'bg-black bg-opacity-25 text-v3SwapGray cursor-not-allowed'
              : 'bg-deepBlue hover:bg-deepBlueHover text-white cursor-pointer'
          }`}
          onClick={claimRewards}
          style={{
            background: 'linear-gradient(180deg, #646DF4 0%, #371BE4 100%)',
          }}
        >
          <ButtonTextWrapper
            loading={cliam_loading}
            Text={() => <FormattedMessage id={'claim'} />}
          />
        </div>
      </div>
    </>
  );
}
