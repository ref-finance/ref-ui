import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from 'react';
import { ftGetTokenMetadata } from '../../services/ft-contract';
import BigNumber from 'bignumber.js';
import { toReadableNumber } from 'src/utils/numbers';
import QuestionMark from '../../components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { ftGetBalance } from 'src/services/ft-contract';
import { REF_FI_POOL_ACTIVE_TAB } from '../../pages/pools/utils';
import { PortfolioData } from '../../pages/Portfolio';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import getConfig from '../../services/config';
import { ArrowUpIcon } from '../../components/icon/Portfolio';
const { XREF_TOKEN_ID } = getConfig();
import {
  ArrowJump,
  display_percentage,
  display_value,
  display_number_ordinary,
  getAccountId,
} from './Tool';
import { isMobile } from 'src/utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
import { openUrl } from '../../services/commonV3';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
const is_mobile = isMobile();
const AssetData = createContext(null);
export default function Asset() {
  const {
    tokenPriceList,
    YourLpValueV1,
    YourLpValueV2,
    lpValueV1Done,
    lpValueV2Done,

    classic_farms_value,
    classic_farms_value_done,
    dcl_farms_value,
    dcl_farms_value_done,

    history_total_asset,
    history_total_asset_done,

    your_classic_lp_all_in_farms,
  } = useContext(PortfolioData);
  const [xrefBalance, setXrefBalance] = useState('0');
  const [xrefBalanceDone, setXrefBalanceDone] = useState<boolean>(false);
  const { globalState } = useContext(WalletContext);
  const accountId = getAccountId();
  const isSignedIn = !!accountId || globalState.isSignedIn;
  const intl = useIntl();
  useEffect(() => {
    if (isSignedIn) {
      // get xref balance
      ftGetBalance(XREF_TOKEN_ID).then(async (data: any) => {
        const token = await ftGetTokenMetadata(XREF_TOKEN_ID);
        const { decimals } = token;
        const balance = toReadableNumber(decimals, data);
        setXrefBalance(balance);
        setXrefBalanceDone(true);
      });
    }
  }, [isSignedIn]);
  const [total_xref_value, total_xref_value_done] = useMemo(() => {
    let total_value = '0';
    let total_value_done = false;
    if (Object.keys(tokenPriceList).length > 0 && +xrefBalance > 0) {
      const price = tokenPriceList[XREF_TOKEN_ID]?.price || 0;
      const totalValue = new BigNumber(xrefBalance || '0').multipliedBy(price);
      total_value = totalValue.toFixed();
      total_value_done = true;
    }
    if (xrefBalanceDone && +xrefBalance == 0) {
      total_value_done = true;
    }
    return [total_value, total_value_done];
  }, [tokenPriceList, xrefBalance, xrefBalanceDone]);
  const [total_user_invest_value_original, total_user_invest_value_done] =
    useMemo(() => {
      let total_value = new BigNumber(0);
      let total_value_done = false;
      if (lpValueV1Done && lpValueV2Done) {
        total_value = total_value
          .plus(YourLpValueV1)
          .plus(YourLpValueV2)
          .plus(total_xref_value);
        total_value_done = true;
      }
      return [total_value.toFixed(), total_value_done];
    }, [lpValueV1Done, lpValueV2Done, total_xref_value]);
  const total_user_invest_value = useMemo(() => {
    return total_user_invest_value_done
      ? display_value(total_user_invest_value_original)
      : '$-';
  }, [total_user_invest_value_original, total_user_invest_value_done]);
  const percent_in_classic_farms = useMemo(() => {
    let percent = new BigNumber(0);
    let percent_done = false;
    if (lpValueV1Done && classic_farms_value_done) {
      percent_done = true;
      if (+YourLpValueV1 > 0) {
        percent = new BigNumber(classic_farms_value || 0).dividedBy(
          YourLpValueV1
        );
        // Special value processing
        if (your_classic_lp_all_in_farms && percent.isLessThan(100)) {
          percent = new BigNumber(1);
        }
        if (
          !your_classic_lp_all_in_farms &&
          percent.isGreaterThanOrEqualTo(1)
        ) {
          percent = new BigNumber(0.99);
        }
      }
    }
    return percent_done
      ? display_percentage(percent.multipliedBy(100).toFixed()) + '%'
      : '-%';
  }, [lpValueV1Done, classic_farms_value_done]);
  const percent_in_dcl_farms = useMemo(() => {
    let percent = new BigNumber(0);
    let percent_done = false;
    if (lpValueV2Done && dcl_farms_value_done) {
      percent_done = true;
      if (+YourLpValueV2 > 0) {
        percent = new BigNumber(dcl_farms_value || 0).dividedBy(YourLpValueV2);
      }
    }
    return percent_done
      ? display_percentage(percent.multipliedBy(100).toFixed()) + '%'
      : '-%';
  }, [lpValueV2Done, dcl_farms_value_done]);
  const [increase_percent_original, increase_percent_done] = useMemo(() => {
    let increase_percent = '0';
    let increase_percent_done = false;
    if (lpValueV1Done && lpValueV2Done && history_total_asset_done) {
      if (+history_total_asset > 0) {
        const p = new BigNumber(total_user_invest_value_original)
          .minus(history_total_asset)
          .dividedBy(history_total_asset)
          .multipliedBy(100);
        increase_percent = p.toFixed();
        increase_percent_done = true;
      }
    }
    return [increase_percent, increase_percent_done];
  }, [
    history_total_asset,
    history_total_asset_done,
    total_user_invest_value_original,
    lpValueV1Done,
    lpValueV2Done,
  ]);
  const show_total_xref_value = useMemo(() => {
    return total_xref_value_done ? display_value(total_xref_value) : '$-';
  }, [total_xref_value, total_xref_value_done]);
  function getTip() {
    const tip = intl.formatMessage({ id: 'your_investment_tip' });
    let result: string = `<div class="text-navHighLightText text-xs text-left w-64 xsm:w-52">${tip}</div>`;
    return result;
  }
  function getCurrentDate() {
    const date = new Date();
    const dateStr = date.toDateString();
    const dateArr = dateStr.split(' ');
    const [week, month, day, year] = dateArr;
    const result = `${month} ${day}, ${year}`;
    return result;
  }
  function getV2PoolUSDValue() {
    return lpValueV2Done ? display_value(YourLpValueV2) : '$-';
  }
  function getV1PoolUSDValue() {
    return lpValueV1Done ? display_value(YourLpValueV1) : '$-';
  }
  function display_increase_percent() {
    const big = new BigNumber(increase_percent_original);
    const big_abs = big.abs();
    const temp = display_number_ordinary(big_abs.toFixed());
    return temp + '%';
  }
  return (
    <AssetData.Provider
      value={{
        getTip,
        total_user_invest_value,
        getCurrentDate,
        getV2PoolUSDValue,
        percent_in_dcl_farms,
        getV1PoolUSDValue,
        percent_in_classic_farms,
        show_total_xref_value,
        increase_percent_original,
        display_increase_percent,
        increase_percent_done,
      }}
    >
      {is_mobile ? <AssetMobile></AssetMobile> : <AssetPc></AssetPc>}
    </AssetData.Provider>
  );
}
function AssetPc() {
  const {
    getTip,
    total_user_invest_value,
    getCurrentDate,
    getV2PoolUSDValue,
    percent_in_dcl_farms,
    getV1PoolUSDValue,
    percent_in_classic_farms,
    show_total_xref_value,
    increase_percent_original,
    display_increase_percent,
    increase_percent_done,
  } = useContext(AssetData);
  const intl = useIntl();
  return (
    <div
      className="border-r border-cardBg flex-shrink-0"
      style={{ minWidth: '320px' }}
    >
      <div className="p-4 mt-4">
        <div className="flex items-center">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="your_investment" />
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
        <div className="text-2xl text-white gotham_bold my-1.5">
          {total_user_invest_value}
        </div>
        <div className="flex items-center text-primaryText text-sm">
          {getCurrentDate()}
          <div
            className={`flex items-center rounded-md px-2 py-0.5 ml-3 ${
              increase_percent_done ? '' : 'hidden'
            } ${
              +increase_percent_original > 0
                ? 'bg-light_green_color text-light_green_text_color'
                : 'bg-light_red_color text-sellColorNew'
            }`}
          >
            <ArrowUpIcon
              className={`mr-0.5 ${
                +increase_percent_original > 0 ? '' : 'transform rotate-180'
              }`}
            ></ArrowUpIcon>
            {display_increase_percent()}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 p-4 mt-5">
        <DataTemplate
          title={intl.formatMessage({ id: 'v2_pools' })}
          value={getV2PoolUSDValue()}
          event={() => {
            localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'v2');
            openUrl('/pools');
          }}
        >
          <div
            className={`flex items-center text-farmText text-xs mt-1 bg-cardBg rounded-md px-2 py-1`}
          >
            {percent_in_dcl_farms}{' '}
            <span
              onClick={() => {
                localStorage.setItem('BOOST_FARM_TAB', 'yours');
                openUrl('/v2farms');
              }}
              className="ml-1.5 text-limitOrderInputColor underline hover:text-primaryText cursor-pointer"
            >
              <FormattedMessage id="in_farm_2"></FormattedMessage>
            </span>{' '}
          </div>
        </DataTemplate>
        <DataTemplate
          title={intl.formatMessage({ id: 'classic_pools' })}
          value={getV1PoolUSDValue()}
          event={() => {
            localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'v1');
            openUrl('/pools');
          }}
        >
          <div className="flex items-center text-farmText text-xs mt-1 bg-cardBg rounded-md px-2 py-1">
            {percent_in_classic_farms}{' '}
            <span
              onClick={() => {
                localStorage.setItem('BOOST_FARM_TAB', 'yours');
                openUrl('/v2farms');
              }}
              className="ml-1.5 text-limitOrderInputColor underline hover:text-primaryText cursor-pointer"
            >
              <FormattedMessage id="in_farm_2"></FormattedMessage>
            </span>{' '}
          </div>
        </DataTemplate>
        <DataTemplate
          title={intl.formatMessage({ id: 'xref_staking' })}
          value={show_total_xref_value}
          event={() => {
            openUrl('/xref');
          }}
        ></DataTemplate>
      </div>
    </div>
  );
}
function AssetMobile() {
  const {
    getTip,
    total_user_invest_value,
    getCurrentDate,
    getV2PoolUSDValue,
    percent_in_dcl_farms,
    getV1PoolUSDValue,
    percent_in_classic_farms,
    show_total_xref_value,
    increase_percent_original,
    display_increase_percent,
    increase_percent_done,
  } = useContext(AssetData);
  const intl = useIntl();
  return (
    <div>
      <div className="px-5 py-3">
        <div className="flex items-center">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="your_investment"></FormattedMessage>
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
        <div className="text-2xl text-white gotham_bold my-1.5">
          {total_user_invest_value}
        </div>
        <div className="flex items-center text-primaryText text-sm">
          {getCurrentDate()}
          <div
            className={`flex items-center rounded-md px-2 py-0.5 ml-3 ${
              increase_percent_done ? '' : 'hidden'
            } ${
              +increase_percent_original > 0
                ? 'bg-light_green_color text-light_green_text_color'
                : 'bg-light_red_color text-sellColorNew'
            }`}
          >
            <ArrowUpIcon
              className={`mr-0.5 ${
                +increase_percent_original > 0 ? '' : 'transform rotate-180'
              }`}
            ></ArrowUpIcon>
            {display_increase_percent()}
          </div>
        </div>
      </div>
      <div className="flex items-stretch justify-between border-t border-b border-cardBg">
        <DataTemplate
          title={intl.formatMessage({ id: 'v2_pools' })}
          value={getV2PoolUSDValue()}
          event={() => {
            localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'v2');
            openUrl('/pools');
          }}
          className="border-r border-cardBg px-5 w-1 flex-grow py-4"
        >
          <div
            className={`flex items-center text-farmText text-xs mt-1 bg-cardBg rounded-md px-2 py-1`}
          >
            {percent_in_dcl_farms}{' '}
            <span
              onClick={() => {
                localStorage.setItem('BOOST_FARM_TAB', 'yours');
                openUrl('/v2farms');
              }}
              className="ml-1.5 text-limitOrderInputColor underline hover:text-primaryText cursor-pointer"
            >
              <FormattedMessage id="in_farm_2"></FormattedMessage>
            </span>{' '}
          </div>
        </DataTemplate>
        <DataTemplate
          title={intl.formatMessage({ id: 'classic_pools' })}
          value={getV1PoolUSDValue()}
          event={() => {
            localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'v1');
            openUrl('/pools');
          }}
          className="pl-3 pr-5 w-1 flex-grow py-4"
        >
          <div className="flex items-center text-farmText text-xs mt-1 bg-cardBg rounded-md px-2 py-1">
            {percent_in_classic_farms}{' '}
            <span
              onClick={() => {
                localStorage.setItem('BOOST_FARM_TAB', 'yours');
                openUrl('/v2farms');
              }}
              className="ml-1.5 text-limitOrderInputColor underline hover:text-primaryText cursor-pointer"
            >
              <FormattedMessage id="in_farm_2"></FormattedMessage>
            </span>{' '}
          </div>
        </DataTemplate>
      </div>
      <div className="border-b border-cardBg">
        <DataTemplate
          title={intl.formatMessage({ id: 'xref_staking' })}
          value={show_total_xref_value}
          event={() => {
            openUrl('/xref');
          }}
          className="px-5 w-1/2 py-4"
        ></DataTemplate>
      </div>
    </div>
  );
}

function DataTemplate(props: any) {
  const { title, value, children, className, event } = props;
  return (
    <div className={`flex flex-col items-start pr-3 ${className}`}>
      <div className="flex items-center justify-between w-full">
        <span className="text-sm text-primaryText mr-1">{title}</span>
        <ArrowJump clickEvent={event}></ArrowJump>
      </div>
      <span className="text-white text-lg">{value}</span>
      {children}
    </div>
  );
}
