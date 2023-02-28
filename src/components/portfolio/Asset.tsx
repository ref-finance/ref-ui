import React, { useEffect, useMemo, useState, useContext } from 'react';
import { ftGetTokenMetadata, TokenMetadata } from '../../services/ft-contract';
import BigNumber from 'bignumber.js';
import { toReadableNumber } from '~utils/numbers';
import QuestionMark from '../../components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import { ftGetBalance } from '~services/ft-contract';
import { REF_FI_POOL_ACTIVE_TAB } from '../../pages/pools/LiquidityPage';
import { PortfolioData } from '../../pages/Portfolio';
import { WalletContext } from '../../utils/wallets-integration';
import getConfig from '../../services/config';
const { XREF_TOKEN_ID } = getConfig();
import { ArrowJump, display_percentage, display_value } from './Tool';

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
  } = useContext(PortfolioData);
  const [xrefBalance, setXrefBalance] = useState('0');
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (isSignedIn) {
      // get xref balance
      ftGetBalance(XREF_TOKEN_ID).then(async (data: any) => {
        const token = await ftGetTokenMetadata(XREF_TOKEN_ID);
        const { decimals } = token;
        const balance = toReadableNumber(decimals, data);
        setXrefBalance(balance);
      });
    }
  }, [isSignedIn]);
  const total_xref_value = useMemo(() => {
    if (Object.keys(tokenPriceList).length > 0 && +xrefBalance > 0) {
      const price = tokenPriceList[XREF_TOKEN_ID]?.price || 0;
      const totalPrice = new BigNumber(xrefBalance || '0').multipliedBy(price);
      return totalPrice.toFixed();
    }
    return '0';
  }, [tokenPriceList, xrefBalance]);
  const total_user_invest_value = useMemo(() => {
    let total_value = new BigNumber(0);
    if (lpValueV1Done && lpValueV1Done) {
      total_value = total_value
        .plus(YourLpValueV1)
        .plus(YourLpValueV2)
        .plus(total_xref_value);
    }
    return display_value(total_value.toFixed());
  }, [lpValueV1Done, lpValueV2Done, total_xref_value]);
  const percent_in_classic_farms = useMemo(() => {
    let percent = new BigNumber(0);
    if (lpValueV1Done && classic_farms_value_done && +YourLpValueV1 > 0) {
      percent = new BigNumber(classic_farms_value || 0).dividedBy(
        YourLpValueV1
      );
    }
    return display_percentage(percent.multipliedBy(100).toFixed()) + '%';
  }, [lpValueV1Done, classic_farms_value_done]);
  const percent_in_dcl_farms = useMemo(() => {
    let percent = new BigNumber(0);
    if (lpValueV2Done && dcl_farms_value_done && +YourLpValueV2 > 0) {
      percent = new BigNumber(dcl_farms_value || 0).dividedBy(YourLpValueV2);
    }
    return display_percentage(percent.multipliedBy(100).toFixed()) + '%';
  }, [lpValueV2Done, dcl_farms_value_done]);
  function getTip() {
    // const tip = intl.formatMessage({ id: 'over_tip' });
    const tip =
      'USD value of your investment on Ref:Classic pools + DCL pools (including staked in farms)';
    let result: string = `<div class="text-navHighLightText text-xs text-left w-64">${tip}</div>`;
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
    if (lpValueV2Done) {
      return display_value(YourLpValueV2);
    }
    return '$0';
  }
  function getV1PoolUSDValue() {
    if (lpValueV1Done) {
      return display_value(YourLpValueV1);
    }
    return '$0';
  }
  return (
    <div className="border-r border-cardBg" style={{ minWidth: '298px' }}>
      <div className="p-4">
        <div className="flex items-center">
          <span className="text-sm text-primaryText">
            Your investment(USD value)
          </span>
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
        <div className="text-2xl text-white gotham_bold my-1.5">
          {total_user_invest_value}
        </div>
        <div className="text-primaryText text-sm">{getCurrentDate()}</div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 p-4 mt-5">
        <DataTemplate
          title="V2 Pools"
          value={getV2PoolUSDValue()}
          event={() => {
            localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'v2');
            window.open('/pools');
          }}
        >
          <div className="flex items-center text-farmText text-xs mt-1 bg-cardBg rounded-md px-2 py-1">
            {percent_in_dcl_farms}{' '}
            <span
              onClick={() => {
                localStorage.setItem('farmV2Status', 'my');
                window.open('/v2farms');
              }}
              className="ml-1.5 text-limitOrderInputColor underline hover:text-primaryText cursor-pointer"
            >
              in farm
            </span>{' '}
          </div>
        </DataTemplate>
        <DataTemplate
          title="V1 Pools"
          value={getV1PoolUSDValue()}
          event={() => {
            localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'v2');
            window.open('/pools');
          }}
        >
          <div className="flex items-center text-farmText text-xs mt-1 bg-cardBg rounded-md px-2 py-1">
            {percent_in_classic_farms}{' '}
            <span
              onClick={() => {
                localStorage.setItem('farmV2Status', 'my');
                window.open('/v2farms');
              }}
              className="ml-1.5 text-limitOrderInputColor underline hover:text-primaryText cursor-pointer"
            >
              in farm
            </span>{' '}
          </div>
        </DataTemplate>
        <DataTemplate
          title="xREF Staking"
          value={display_value(total_xref_value)}
          event={() => {
            window.open('/xref');
          }}
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
