import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

import { AiFillCloseCircle } from '../components/reactIcons';
import { useWalletSelector } from './WalletSelectorContext';
import { list_liquidities } from '../services/swapV3';
import { REF_FI_POOL_ACTIVE_TAB } from '../pages/pools/utils';
import {
  AddV2liquidityBannerXmax,
  XmasGiftReadyBanner,
  XmasTree,
  XmasTreeWithText,
} from '../components/icon/Common';
import { isMobile } from '../utils/device';
import { openUrl } from '../services/commonV3';

function XmaxPopUP({
  xmasModalOpen,
  setXmasModalOpen,
}: {
  xmasModalOpen: boolean;
  setXmasModalOpen: (xmasModalOpen: boolean) => void;
}) {
  // if (xmasModalOpen) {
  //   alert('open');
  // }

  const { accountId } = useWalletSelector();

  const isSignedIn = !!accountId;

  const [haveV2liquidity, setHaveV2liquidity] = useState(false);

  const [loadingLiquidityDone, setLoadingLiquidityDone] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    list_liquidities()
      .then((res) => {
        setHaveV2liquidity(res && res?.length > 0);
      })
      .then(() => {
        setLoadingLiquidityDone(true);
      });
  }, [isSignedIn]);

  useEffect(() => {
    document.body.style.overflow = xmasModalOpen ? 'hidden' : 'auto';
  }, [xmasModalOpen]);

  return (
    <Modal
      isOpen={xmasModalOpen}
      onRequestClose={() => {
        setXmasModalOpen(false);
      }}
      style={{
        overlay: {
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          overflow: 'auto',
          top: isMobile() ? '60px' : '70px',
        },
        content: {
          outline: 'none',
          transform: `translate(-50%,  ${isMobile() ? '-18vh' : '-40%'})`,
        },
      }}
    >
      <div
        className="w-480px relative text-white pt-16 xs:pt-12 pb-14 xs:pb-10  text-sm gotham flex flex-col items-center xs:w-95vw px-5 bg-black bg-opacity-30 rounded-3xl"
        style={{
          border: '1px solid #68F694',
        }}
      >
        <AiFillCloseCircle
          className="absolute cursor-pointer right-4 top-4"
          size={20}
          fill="#8EA5B7"
          onClick={() => {
            setXmasModalOpen(false);
          }}
        ></AiFillCloseCircle>

        <div
          className="absolute xs:-top-40 -top-44"
          style={{
            transform: isMobile() ? 'scale(0.75)' : '',
          }}
        >
          <XmasTreeWithText />
        </div>

        <div className="absolute -bottom-5 ">
          {haveV2liquidity ? (
            <div className=" text-warn flex relative top-8 xs:top-10 flex-col items-center">
              <div
                className="cursor-pointer"
                onClick={() => {
                  setXmasModalOpen(false);
                }}
              >
                <XmasGiftReadyBanner />
              </div>

              <div className="mt-2 text-center">
                Make sure you keep the position until 00:01 UTC Dec 24 or you
                won't get the gift.
              </div>
            </div>
          ) : (
            <AddV2liquidityBannerXmax
              onClick={() => {
                localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'v2');
                openUrl('/pools');
              }}
              className="cursor-pointer"
            ></AddV2liquidityBannerXmax>
          )}
        </div>
        <div className="text-senderHot gotham_bold  flex items-center flex-col text-2xl xs:text-xl">
          <div className=" text-center gotham_bold">Get your NFT gift</div>
          <div className="text-center gotham_bold lg:whitespace-nowrap">
            and a chance to win 1,225 REF tokens
          </div>
        </div>

        <div className="my-5 xs:my-2">
          To receive your NFT gift, you must be providing liquidity into (at
          least) one V2 pool (pool of your choice) before 00:01 UTC, Dec 24,
          2022.
        </div>

        <div>
          <span
            className="underline relative cursor-pointer z-50"
            onClick={() => {
              openUrl(
                'https://twitter.com/finance_ref/status/1604878692702113792'
              );
            }}
          >
            10 lucky addresses
          </span>
          &nbsp; will receive a special NFT, along with 1,225 REF tokens, on Dec
          31, 2022.
        </div>
      </div>
    </Modal>
  );
}

interface XmasActivityContextValue {
  xmasModalOpen: boolean;
  setXmasModalOpen: (xmasModalOpen: boolean) => void;
}

const XmasActivityContext =
  React.createContext<XmasActivityContextValue | null>(null);

export const XmasActivityContextProvider: React.FC = ({ children }) => {
  const [xmasModalOpen, setXmasModalOpen] = useState(false);

  return (
    <XmasActivityContext.Provider
      value={{
        xmasModalOpen,
        setXmasModalOpen,
      }}
    >
      {children}
      <XmaxPopUP
        xmasModalOpen={xmasModalOpen}
        setXmasModalOpen={setXmasModalOpen}
      />
    </XmasActivityContext.Provider>
  );
};

export function useXmasActivity() {
  const context = React.useContext(XmasActivityContext);
  if (context === undefined) {
    throw new Error(
      'useXmasActivity must be used within a XmasActivityContextProvider'
    );
  }
  return context;
}
