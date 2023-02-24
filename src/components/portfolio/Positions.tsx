import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  MyOrderCircle,
  MyOrderMask,
  MyOrderMask2,
} from '~components/icon/swapV3';
import { WalletContext } from '../../utils/wallets-integration';
import { ConnectToNearBtnSwap } from '../../components/button/Button';
import { YourLiquidityV1 } from '../../components/pool/YourLiquidityV1';
import { YourLiquidityV2 } from '../../components/pool/YourLiquidityV2';
import { PortfolioData } from '../../pages/Portfolio';
import { BlueCircleLoading } from '../../components/layout/Loading';

export default function Positions(props: any) {
  const { globalState } = useContext(WalletContext);
  const {
    setYourLpValueV2,
    setYourLpValueV1,
    setLpValueV1Done,
    setLpValueV2Done,
    setV1LiquidityQuantity,
    setV2LiquidityQuantity,
    setV2LiquidityLoadingDone,
    setV1LiquidityLoadingDone,
    v1LiquidityLoadingDone,
    v2LiquidityLoadingDone,
  } = useContext(PortfolioData);
  const isSignedIn = globalState.isSignedIn;
  return (
    <div className="text-white">
      {isSignedIn ? (
        <>
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
          {v1LiquidityLoadingDone && v2LiquidityLoadingDone ? null : (
            <div className="flex items-center justify-center">
              <BlueCircleLoading />
            </div>
          )}
        </>
      ) : (
        <NoLiquidity></NoLiquidity>
      )}
    </div>
  );
}

function NoLiquidity({
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
