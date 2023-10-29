import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { YourLiquidityV1 } from '../../components/pool/YourLiquidityV1';
import { YourLiquidityV2 } from '../../components/pool/YourLiquidityV2';
import { PortfolioData } from '../../pages/Portfolio';
import { BlueCircleLoading } from '../../components/layout/Loading';
import {
  NoDataCard,
  UpDownButton,
  useTotalLiquidityData,
  getAccountId,
} from './Tool';
import { isMobile } from 'src/utils/device';
import { FormattedMessage, useIntl } from 'react-intl';
const is_mobile = isMobile();
export default function Positions(props: any) {
  const {
    setYourLpValueV2,
    setYourLpValueV1,
    setLpValueV1Done,
    setLpValueV2Done,
    v1LiquidityQuantity,
    v2LiquidityQuantity,
    setV1LiquidityQuantity,
    setV2LiquidityQuantity,
    setV2LiquidityLoadingDone,
    setV1LiquidityLoadingDone,
    v1LiquidityLoadingDone,
    v2LiquidityLoadingDone,
    YourLpValueV1,
    YourLpValueV2,
    lpValueV1Done,
    lpValueV2Done,
    activeTab,
    setActiveTab,
  } = useContext(PortfolioData);
  const intl = useIntl();
  const { total_liquidity_value, total_liquidity_quantity } =
    useTotalLiquidityData({
      YourLpValueV1,
      YourLpValueV2,
      lpValueV1Done,
      lpValueV2Done,
      v1LiquidityQuantity,
      v2LiquidityQuantity,
      v1LiquidityLoadingDone,
      v2LiquidityLoadingDone,
    });
  const { globalState } = useContext(WalletContext);
  const accountId = getAccountId();
  const isSignedIn = !!accountId || globalState.isSignedIn;
  const total_quantity = +v1LiquidityQuantity + +v2LiquidityQuantity;
  const loading_status =
    !(v1LiquidityLoadingDone && v2LiquidityLoadingDone) && isSignedIn;
  const noData_status =
    !loading_status &&
    ((v1LiquidityLoadingDone &&
      v2LiquidityLoadingDone &&
      total_quantity == 0) ||
      !isSignedIn);
  const data_status =
    v1LiquidityLoadingDone && v2LiquidityLoadingDone && total_quantity > 0;
  return (
    <div className="text-white">
      <div className="xsm:border-b xsm:border-cardBg">
        {/* for mobile banner */}
        <div
          className="flex items-center justify-between lg:hidden p-5"
          onClick={() => {
            setActiveTab(activeTab == '2' ? '' : '2');
          }}
        >
          <span className="text-base text-white gotham_bold">
            <FormattedMessage id="your_liquidity_2" /> (
            {total_liquidity_quantity})
          </span>
          <div className="flex items-center">
            <span className="text-base text-white gotham_bold mr-2">
              {total_liquidity_value}
            </span>
            <UpDownButton
              set_switch_off={() => {
                setActiveTab(activeTab == '2' ? '' : '2');
              }}
              switch_off={activeTab != '2'}
            ></UpDownButton>
          </div>
        </div>
        {/* for mobile no data */}
        {noData_status && is_mobile && activeTab == '2' ? (
          <NoDataCard
            text={intl.formatMessage({ id: 'position_will_appear_here' })}
          />
        ) : null}
        {/* liquidities list */}
        <div className={`${activeTab == '2' ? '' : 'hidden'}`}>
          <YourLiquidityV2
            setYourLpValueV2={setYourLpValueV2}
            setLpValueV2Done={setLpValueV2Done}
            setLiquidityLoadingDone={setV2LiquidityLoadingDone}
            setLiquidityQuantity={setV2LiquidityQuantity}
            styleType="2"
          ></YourLiquidityV2>
          <YourLiquidityV1
            setLpValueV1Done={setLpValueV1Done}
            setYourLpValueV1={setYourLpValueV1}
            setLiquidityLoadingDone={setV1LiquidityLoadingDone}
            setLiquidityQuantity={setV1LiquidityQuantity}
            styleType="2"
          ></YourLiquidityV1>
        </div>
        {/* for mobile loading */}
        {loading_status && is_mobile && activeTab == '2' ? (
          <div className={`flex items-center justify-center my-10`}>
            <BlueCircleLoading></BlueCircleLoading>
          </div>
        ) : null}
      </div>
      {/* pc loading */}
      {loading_status && !is_mobile ? (
        <div className="flex items-center justify-center my-20">
          <BlueCircleLoading />
        </div>
      ) : null}
      {/* pc no data */}
      {noData_status && !is_mobile ? (
        <NoDataCard
          text={intl.formatMessage({ id: 'position_will_appear_here' })}
        ></NoDataCard>
      ) : null}
    </div>
  );
}
