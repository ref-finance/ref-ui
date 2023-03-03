import React, { useEffect, useMemo, useState, useContext } from 'react';
import BigNumber from 'bignumber.js';
import { UserLiquidityInfo } from '../../services/commonV3';
import { toReadableNumber } from '~utils/numbers';
import QuestionMark from '../../components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import { PortfolioData } from '../../pages/Portfolio';
import { REF_POOL_NAV_TAB_KEY } from '../../components/pool/PoolTabV3';
import { ArrowJump, display_value } from './Tool';

export default function AssetProfit() {
  const {
    tokenPriceList,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    dcl_liquidities_details_list,
    dcl_tokens_metas,
  } = useContext(PortfolioData);
  const total_unClaimed_rewrads_value = useMemo(() => {
    let total_value = new BigNumber(0);
    if (
      Object.keys(tokenPriceList).length > 0 &&
      Object.keys(user_unclaimed_map).length > 0 &&
      Object.keys(user_unclaimed_token_meta_map).length > 0
    ) {
      const user_unclaimed_list = Object.values(user_unclaimed_map);
      user_unclaimed_list.forEach((item: any) => {
        Object.keys(item).forEach((tokenId: string) => {
          const token_meta = user_unclaimed_token_meta_map[tokenId];
          const token_quantity = toReadableNumber(
            token_meta.decimals,
            item[tokenId]
          );
          const token_price = tokenPriceList[tokenId]?.price || 0;
          const token_value = new BigNumber(token_quantity).multipliedBy(
            token_price
          );
          total_value = total_value.plus(token_value);
        });
      });
    }
    return total_value.toFixed();
  }, [user_unclaimed_map, user_unclaimed_token_meta_map, tokenPriceList]);
  const total_fees_value = useMemo(() => {
    let total_value = new BigNumber(0);
    if (
      Object.keys(tokenPriceList).length > 0 &&
      dcl_liquidities_details_list.length > 0 &&
      Object.keys(dcl_tokens_metas || {}).length > 0
    )
      dcl_liquidities_details_list.forEach((liquidity: UserLiquidityInfo) => {
        const { pool_id, unclaimed_fee_x, unclaimed_fee_y } = liquidity;
        const [token_x, token_y] = pool_id.split('|');
        const tokenX = dcl_tokens_metas[token_x];
        const tokenY = dcl_tokens_metas[token_y];
        const price_x = tokenPriceList[token_x]?.price || 0;
        const price_y = tokenPriceList[token_y]?.price || 0;
        const token_x_quantity = toReadableNumber(
          tokenX.decimals,
          unclaimed_fee_x
        );
        const token_y_quantity = toReadableNumber(
          tokenY.decimals,
          unclaimed_fee_y
        );
        const token_x_value = new BigNumber(token_x_quantity).multipliedBy(
          price_x
        );
        const token_y_value = new BigNumber(token_y_quantity).multipliedBy(
          price_y
        );
        total_value = total_value.plus(token_x_value).plus(token_y_value);
      });
    return total_value.toFixed();
  }, [tokenPriceList, dcl_liquidities_details_list, dcl_tokens_metas]);
  const total_proft = useMemo(() => {
    const total_profit = new BigNumber(total_unClaimed_rewrads_value)
      .plus(total_fees_value)
      .toFixed();
    return total_profit;
  }, [total_unClaimed_rewrads_value, total_fees_value]);

  function getTip() {
    // const tip = intl.formatMessage({ id: 'over_tip' });
    const tip =
      'USD value of your invests on Ref:Classic pools + DCL pools (including staked in farms)';
    let result: string = `<div class="text-navHighLightText text-xs text-left w-64">${tip}</div>`;
    return result;
  }
  return (
    <div className=" grid grid-cols-3 bg-portfolioBarBgColor px-7 py-4">
      <div className="col-span-1">
        <div className="flex items-center">
          <span className="text-sm text-primaryText">Your Interest</span>
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-for="selectAllId"
            data-place="top"
            data-html={true}
            data-tip={getTip()}
          >
            <QuestionMark></QuestionMark>
            <ReactTooltip
              id="selectAllId"
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
        <span className="text-2xl gotham_bold text-portfolioGreenColor mt-1">
          {display_value(total_proft)}
        </span>
      </div>
      <div className="flex flex-col justify-between col-span-1">
        <div className="flex items-center text-sm text-primaryText">
          Earned Fees
          <ArrowJump
            clickEvent={() => {
              sessionStorage.setItem(REF_POOL_NAV_TAB_KEY, '/yourliquidity');
              window.open('/yourliquidity');
            }}
            extraClass="ml-3"
          ></ArrowJump>
        </div>
        <div className="tetx-base gotham_bold text-portfolioGreenColor relative -top-1">
          {display_value(total_fees_value)}
        </div>
      </div>
      <div className="flex flex-col justify-between col-span-1">
        <div className="flex items-center text-sm text-primaryText">
          Unclaimed Rewards
          <ArrowJump
            clickEvent={() => {
              localStorage.setItem('farmV2Status', 'my');
              window.open('/v2farms');
            }}
            extraClass="ml-1"
          ></ArrowJump>
        </div>
        <div className="tetx-base gotham_bold text-portfolioGreenColor relative -top-1">
          {display_value(total_unClaimed_rewrads_value)}
        </div>
      </div>
    </div>
  );
}
