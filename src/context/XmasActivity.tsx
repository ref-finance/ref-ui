import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

import { AiFillCloseCircle } from 'react-icons/ai';
import { useWalletSelector } from './WalletSelectorContext';
import { list_liquidities } from '../services/swapV3';
import { REF_FI_POOL_ACTIVE_TAB } from '../pages/pools/LiquidityPage';
import {
  AddV2liquidityBannerXmax,
  XmasGiftReadyBanner,
  XmasTree,
  XmasTreeWithText,
} from '~components/icon/Common';
import { isMobile } from '~utils/device';

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

  console.log({
    xmasModalOpen,
  });

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
          top: '70px',
        },
        content: {
          outline: 'none',
          transform: `translate(-50%,  ${isMobile() ? '-17vh' : '-40%'})`,
        },
      }}
    >
      <div
        className="w-480px relative text-white pt-16 pb-14 text-sm gotham flex flex-col items-center xs:w-95vw px-5 bg-black bg-opacity-30 rounded-3xl"
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
          className="absolute xs:-top-40 -top-48"
          style={{
            transform: isMobile() ? 'scale(0.75)' : '',
          }}
        >
          <XmasTreeWithText />
        </div>

        <div className="absolute -bottom-5 cursor-pointer">
          {!loadingLiquidityDone ? null : haveV2liquidity ? (
            <XmasGiftReadyBanner />
          ) : (
            <AddV2liquidityBannerXmax
              onClick={() => {
                localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'v2');
                window.open('/pools');
              }}
            ></AddV2liquidityBannerXmax>
          )}
        </div>
        <div className="text-senderHot gotham_bold  flex items-center flex-col text-2xl xs:text-xl">
          <div className=" text-center gotham_bold">Get your NFT gift</div>
          <div className="text-center gotham_bold">chance to win 1225 REF</div>
        </div>

        <div className="my-5 xs:my-4">
          Keep a position in V2 pool until 24:00(UTC) Dec. 23, 2002 and you will
          receive an NFT as a holiday gift on Dec. 25, 2022 automatically.
        </div>

        <div>
          <span className="underline">10 lucky addresses</span>
          will receive a special NFT. On Dec.31, 2022, we will reveal the
          <span>10 lucky addresses</span>
          lucky addresses and send each 1225 REF.
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
