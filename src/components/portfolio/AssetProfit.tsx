import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from 'react';
import BigNumber from 'bignumber.js';
import { UserLiquidityInfo, openUrl } from '../../services/commonV3';
import { toReadableNumber } from 'src/utils/numbers';
import QuestionMark from '../../components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { PortfolioData } from '../../pages/Portfolio';
import { REF_POOL_NAV_TAB_KEY } from '../../components/pool/PoolTabV3';
import { ArrowJump, display_value, getAccountId } from './Tool';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { isMobile } from '../../utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
const is_mobile = isMobile();
const AssetProfitData = createContext(null);
export default function AssetProfit() {
  const {
    tokenPriceList,
    user_unclaimed_map,
    user_unclaimed_token_meta_map,
    dcl_liquidities_details_list,
    dcl_tokens_metas,
    user_unclaimed_map_done,
    dcl_liquidities_details_list_done,
  } = useContext(PortfolioData);
  const intl = useIntl();
  const { globalState } = useContext(WalletContext);
  const accountId = getAccountId();
  const isSignedIn = !!accountId || globalState.isSignedIn;
  const [total_unClaimed_rewrads_value, total_unClaimed_rewrads_value_done] =
    useMemo(() => {
      let total_value = new BigNumber(0);
      let total_value_done = false;
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
        total_value_done = true;
      }
      if (
        user_unclaimed_map_done &&
        Object.keys(user_unclaimed_map).length == 0
      ) {
        total_value_done = true;
      }
      return [total_value.toFixed(), total_value_done];
    }, [
      user_unclaimed_map,
      user_unclaimed_token_meta_map,
      tokenPriceList,
      user_unclaimed_map_done,
    ]);
  const [total_fees_value, total_fees_value_done] = useMemo(() => {
    let total_value = new BigNumber(0);
    let total_value_done = false;
    if (
      Object.keys(tokenPriceList).length > 0 &&
      dcl_liquidities_details_list.length > 0 &&
      Object.keys(dcl_tokens_metas || {}).length > 0
    ) {
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
      total_value_done = true;
    }
    if (
      dcl_liquidities_details_list_done &&
      dcl_liquidities_details_list.length == 0
    ) {
      total_value_done = true;
    }
    return [total_value.toFixed(), total_value_done];
  }, [
    tokenPriceList,
    dcl_liquidities_details_list,
    dcl_tokens_metas,
    dcl_liquidities_details_list_done,
  ]);
  const total_proft = useMemo(() => {
    const total_profit = new BigNumber(total_unClaimed_rewrads_value)
      .plus(total_fees_value)
      .toFixed();
    return total_profit;
  }, [total_unClaimed_rewrads_value, total_fees_value]);

  function getTip() {
    const tip = intl.formatMessage({ id: 'unclaimed_earnings_tip' });
    let result: string = `<div class="text-navHighLightText text-xs text-left w-64 xsm:w-52">${tip}</div>`;
    return result;
  }
  const show_total_proft = useMemo(() => {
    return total_unClaimed_rewrads_value_done && total_fees_value_done
      ? display_value(total_proft)
      : '$-';
  }, [total_fees_value_done, total_unClaimed_rewrads_value_done, total_proft]);
  const show_total_fees_value = useMemo(() => {
    return total_fees_value_done ? display_value(total_fees_value) : '$-';
  }, [total_fees_value_done, total_fees_value]);
  const show_total_unClaimed_rewrads_value = useMemo(() => {
    return total_unClaimed_rewrads_value_done
      ? display_value(total_unClaimed_rewrads_value)
      : '$-';
  }, [total_unClaimed_rewrads_value_done, total_unClaimed_rewrads_value]);
  return (
    <AssetProfitData.Provider
      value={{
        getTip,
        show_total_proft,
        show_total_fees_value,
        show_total_unClaimed_rewrads_value,
      }}
    >
      {is_mobile ? (
        <AssetProfitMobile></AssetProfitMobile>
      ) : (
        <AssetProfitPc></AssetProfitPc>
      )}
    </AssetProfitData.Provider>
  );
}

function AssetProfitPc() {
  const {
    getTip,
    show_total_proft,
    show_total_fees_value,
    show_total_unClaimed_rewrads_value,
  } = useContext(AssetProfitData);
  return (
    <div className=" grid grid-cols-3 bg-portfolioBarBgColor px-7 py-4 rounded-xl">
      <div className="col-span-1">
        <div className="flex items-center">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="unclaimed_earnings" />
          </span>
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-tooltip-id="selectAllId"
            data-place="top"
            data-tooltip-html={getTip()}
          >
            <QuestionMark></QuestionMark>
            <CustomTooltip id="selectAllId" />
          </div>
        </div>
        <span className="text-2xl gotham_bold text-white mt-1">
          {show_total_proft}
        </span>
      </div>
      <div className="flex flex-col justify-between col-span-1">
        <div className="flex items-center text-sm text-primaryText">
          <FormattedMessage id="unclaimed_pool_fees"></FormattedMessage>
          <ArrowJump
            clickEvent={() => {
              sessionStorage.setItem(REF_POOL_NAV_TAB_KEY, '/yourliquidity');
              openUrl('/yourliquidity');
            }}
            extraClass="ml-3"
          ></ArrowJump>
        </div>
        <div className="text-base gotham_bold text-white relative -top-1">
          {show_total_fees_value}
        </div>
      </div>
      <div className="flex flex-col justify-between col-span-1">
        <div className="flex items-center text-sm text-primaryText">
          <FormattedMessage id="unclaimed_farm_rewards" />
          <ArrowJump
            clickEvent={() => {
              localStorage.setItem('farmV2Status', 'my');
              openUrl('/v2farms');
            }}
            extraClass="ml-1"
          ></ArrowJump>
        </div>
        <div className="text-base gotham_bold text-white relative -top-1">
          {show_total_unClaimed_rewrads_value}
        </div>
      </div>
    </div>
  );
}
function AssetProfitMobile() {
  const {
    getTip,
    show_total_proft,
    show_total_fees_value,
    show_total_unClaimed_rewrads_value,
  } = useContext(AssetProfitData);
  return (
    <div className="bg-portfolioBarBgColor mt-4">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="unclaimed_earnings" />
          </span>
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-tooltip-id="selectAllId"
            data-place="top"
            data-tooltip-html={getTip()}
          >
            <QuestionMark></QuestionMark>
            <CustomTooltip id="selectAllId" />
          </div>
        </div>
        <span className="text-2xl gotham_bold text-white">
          {show_total_proft}
        </span>
      </div>
      <div className="flex items-stretch justify-between border-t border-border_grey_color">
        <div className="flex flex-col justify-between w-1 flex-grow border-r border-border_grey_color px-5 py-2">
          <div className="flex items-center xsm:items-start justify-between text-sm text-primaryText">
            <FormattedMessage id="unclaimed_pool_fees"></FormattedMessage>
            <ArrowJump
              clickEvent={() => {
                sessionStorage.setItem(REF_POOL_NAV_TAB_KEY, '/yourliquidity');
                openUrl('/yourliquidity');
              }}
              extraClass="ml-3 flex-shrink-0 xsm:relative xsm:top-0.5"
            ></ArrowJump>
          </div>
          <div className="text-base gotham_bold text-white mt-1">
            {show_total_fees_value}
          </div>
        </div>
        <div className="flex flex-col justify-between  w-12 flex-grow pl-3 pr-5 py-2">
          <div className="flex items-center xsm:items-start justify-between text-sm text-primaryText">
            <FormattedMessage id="unclaimed_farm_rewards" />
            <ArrowJump
              clickEvent={() => {
                localStorage.setItem('farmV2Status', 'my');
                openUrl('/v2farms');
              }}
              extraClass="ml-0.5 flex-shrink-0 xsm:relative xsm:top-0.5"
            ></ArrowJump>
          </div>
          <div className="text-base gotham_bold text-white">
            {show_total_unClaimed_rewrads_value}
          </div>
        </div>
      </div>
    </div>
  );
}
