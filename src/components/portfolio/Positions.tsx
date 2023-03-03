import React, { useState, useEffect, useContext, useMemo } from 'react';
import { WalletContext } from '../../utils/wallets-integration';
import { ConnectToNearBtnSwap } from '../../components/button/Button';
import { YourLiquidityV1 } from '../../components/pool/YourLiquidityV1';
import { YourLiquidityV2 } from '../../components/pool/YourLiquidityV2';
import { PortfolioData } from '../../pages/Portfolio';
import { BlueCircleLoading } from '../../components/layout/Loading';
import { NoDataCard } from './Tool';

export default function Positions(props: any) {
  const { globalState } = useContext(WalletContext);
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
  } = useContext(PortfolioData);

  const isSignedIn = globalState.isSignedIn;
  const total_quantity = +v1LiquidityQuantity + +v2LiquidityQuantity;
  const loading_status =
    !(v1LiquidityLoadingDone && v2LiquidityLoadingDone) && isSignedIn;
  const noData_status =
    (v1LiquidityLoadingDone && v2LiquidityLoadingDone && total_quantity == 0) ||
    !isSignedIn;
  const data_status =
    v1LiquidityLoadingDone && v2LiquidityLoadingDone && total_quantity > 0;
  return (
    <div className="text-white">
      <>
        <div
          className={`flex items-center justify-between text-sm text-v3SwapGray mb-2.5 pl-6 pr-16 ${
            data_status ? '' : 'hidden'
          }`}
        >
          <span>Your Position(s)</span>
          <span>Your Liquidity</span>
        </div>
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
      </>
      {loading_status ? (
        <div className="flex items-center justify-center my-20">
          <BlueCircleLoading />
        </div>
      ) : (
        noData_status && (
          <NoDataCard text="Your liquidity position(s) will appear here."></NoDataCard>
        )
      )}
    </div>
  );
}
