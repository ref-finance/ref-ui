import React, { useEffect, useState, useMemo } from 'react';
import Modal from 'react-modal';
import { usePersistSwapStore } from '../../stores/swapStore';
import { isMobile } from '../../utils/device';
import { ModalCloseIcon } from '../meme/icons';
import {
  ButtonTextWrapper,
  OprationButton,
} from 'src/components/button/Button';
import {
  makeDclSwap_nearUsdt,
  makeV1Swap_nearUsdt,
} from '../../state/swap_near_usdt';
export default function SwapMixModal(props: any) {
  const { isOpen, onRequestClose } = props;
  const [step1Loading, setStep1Loading] = useState(false);
  const [step2Loading, setStep2Loading] = useState(false);
  const {
    near_usdt_swapTodos,
    set_near_usdt_swapTodos_transaction,
    near_usdt_swapTodos_transaction,
  } = usePersistSwapStore();
  const cardWidth = isMobile() ? '95vw' : '400px';
  const step1Disabled =
    near_usdt_swapTodos_transaction &&
    near_usdt_swapTodos_transaction.process !== '0';
  const step2Disabled = !step1Disabled;
  function makeDclSwap(e) {
    e.preventDefault();
    e.stopPropagation();
    if (step1Disabled) return;
    setStep1Loading(true);
    set_near_usdt_swapTodos_transaction({
      ...near_usdt_swapTodos,
      accountId: window.selectorAccountId,
    });
    const { pools, slippageTolerance, dcl_quote_amout, tokens, tokenInAmount } =
      near_usdt_swapTodos;
    makeDclSwap_nearUsdt({
      dcl_pool_id: pools[0].pool_id,
      slippageTolerance,
      dcl_quote_amout,
      nearMetadata: tokens[0],
      usdcMetadata: tokens[1],
      tokenInAmount,
    });
  }
  function makeV1Swap() {
    if (step2Disabled) return;
    setStep2Loading(true);
    const {
      dcl_quote_amout_real,
      tokens,
      nonEstimateOutAmountWithSlippageTolerance,
    } = near_usdt_swapTodos_transaction;
    set_near_usdt_swapTodos_transaction({
      ...near_usdt_swapTodos_transaction,
      process: '2',
    });
    makeV1Swap_nearUsdt({
      usdcMetadata: tokens[1],
      usdtMetadata: tokens[2],
      amountIn: dcl_quote_amout_real,
      nonEstimateOutAmountWithSlippageTolerance,
    });
  }
  return (
    <Modal
      isOpen={isOpen}
      // onRequestClose={onRequestClose}
      style={{
        overlay: {
          overflow: 'auto',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div
        className="bg-cardBg rounded-2xl p-4 pb-8"
        style={{ width: cardWidth }}
      >
        <div className="flex items-center justify-between mb-6">
          <span className=" text-lg text-white gotham_bold">Swap</span>
          <ModalCloseIcon onClick={onRequestClose} className="cursor-pointer" />
        </div>
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-menuMoreBoxBorderColor text-white text-sm">
              1
            </span>
            <span className="text-sm text-white">Swap from NEAR to USDC</span>
          </div>
          {step1Disabled ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="24"
                height="24"
                rx="4"
                fill="url(#paint0_linear_10645_72)"
              />
              <path
                d="M6.4082 12.0059L10.6749 16.0059L19.2082 8.00586"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_10645_72"
                  x1="12"
                  y1="0"
                  x2="12"
                  y2="24"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#00C6A2" />
                  <stop offset="1" stopColor="#008B72" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <OprationButton
              disabled={step1Disabled}
              onClick={makeDclSwap}
              className={`flex items-center justify-center bg-buttonGradientBg text-boxBorderrounded-xl h-10 text-base gotham_bold focus:outline-none w-28 ${
                step1Disabled || step1Loading ? 'opacity-40' : ''
              }`}
            >
              <ButtonTextWrapper
                loading={step1Loading}
                Text={() => (
                  <div className="flex items-center gap-2 text-white">
                    Submit
                  </div>
                )}
              />
            </OprationButton>
          )}
        </div>
        <div className="flex items-center justify-between mt-6 gap-8">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-menuMoreBoxBorderColor text-white text-sm">
              2
            </span>
            <span className="text-sm text-white">Swap from USDC to USDt</span>
          </div>
          <OprationButton
            disabled={step2Disabled}
            onClick={makeV1Swap}
            className={`flex items-center justify-center bg-buttonGradientBg text-boxBorder rounded-xl h-10 text-base gotham_bold focus:outline-none w-28 ${
              step2Disabled || step2Loading ? 'opacity-40' : ''
            }`}
          >
            <ButtonTextWrapper
              loading={step2Loading}
              Text={() => (
                <div className="flex items-center gap-2 text-white">Submit</div>
              )}
            />
          </OprationButton>
        </div>
      </div>
    </Modal>
  );
}
