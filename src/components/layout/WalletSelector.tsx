import React, { useContext, useState } from 'react';

import ReactModal from 'react-modal';
import { Card } from '../card/Card';
import { wallet, REF_FARM_CONTRACT_ID } from '../../services/near';
import {
  senderWallet,
  getCurrentWallet,
  getSenderWallet,
} from '../../utils/sender-wallet';
import Modal from 'react-modal';
import { WalletContext } from '../../utils/sender-wallet';
import { isMobile, isMobileExplorer } from '~utils/device';
import { BackArrowWhite, BackArrowGray } from '../icon/Arrows';
import { CloseIcon } from '~components/icon/Actions';
import { NearWallet } from '~components/icon/Wallet';
import {
  SenderWallet,
  SenderWalletLarge,
  RefWalletLarge,
  NearWalletLarge,
} from '../icon/Wallet';
import { getExplorer } from '../../utils/device';
import { BeatLoader } from 'react-spinners';

declare global {
  interface Window {
    near: any;
  }
}

export const WalletOption = ({
  title,
  Icon,
  decorate,
  description,
  officialUrl,
  connect,
}: {
  title: string;
  Icon: JSX.Element;
  decorate?: boolean;
  description: string;
  officialUrl: string;
  connect: (e?: any) => void;
}) => {
  return (
    <div
      className="pl-5 my-2  pr-4  rounded-2xl bg-black bg-opacity-20 hover:bg-opacity-40 flex items-center "
      onClick={() => connect()}
      style={{
        height: '62px',
      }}
    >
      {Icon}
      <div className="py-1 pl-3 w-full">
        <div className="flex items-center justify-between">
          <div className="text-base text-white flex items-center">
            {title}
            {decorate ? (
              <div
                className="ml-1 px-0.5 text-black rounded bg-senderHot"
                style={{
                  fontSize: '10px',
                  lineHeight: '15px',
                }}
              >
                HOT
              </div>
            ) : null}
          </div>
          <span className="text-xs text-primaryText"> {description} </span>
        </div>
        <button
          className="text-xs text-primaryText"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(`https://${officialUrl}`, '_blank');
          }}
        >
          {officialUrl}
        </button>
      </div>
    </div>
  );
};

export const WalletFooter = ({
  ques,
  tip,
  callback,
}: {
  ques: string;
  tip: string;
  callback: (e?: any) => void;
}) => {
  return (
    <div className="mx-auto text-white text-xs mt-11 ">
      <span>{ques}</span>
      <span
        className="font-bold cursor-pointer ml-2"
        onClick={() => {
          callback();
        }}
      >
        {tip}
      </span>
    </div>
  );
};

const SenderNotInstalledModal = (
  props: ReactModal.Props & {
    setShowSenderNotInstalled: (show?: boolean) => void;
    setShowWalletSelector: (show?: boolean) => void;
  }
) => {
  const { setShowSenderNotInstalled, setShowWalletSelector } = props;

  return (
    <Modal
      {...props}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
        },
      }}
    >
      <Card
        className="pt-8 px-6 pb-6 flex flex-col text-white"
        width="xs:w-95vw w-360px"
        style={{
          border: '1px solid rgba(0, 198, 162, 0.5)',
          height: '422px',
          maxWidth: '360px',
        }}
      >
        <div className="flex items-start justify-between ">
          <span
            className="cursor-pointer pb-1 pr-1"
            onClick={() => {
              setShowSenderNotInstalled(false);
              setShowWalletSelector(true);
            }}
          >
            <BackArrowGray />
            {'    '}
          </span>
          <span
            className="cursor-pointer pb-1 pl-1"
            onClick={() => setShowSenderNotInstalled(false)}
          >
            <CloseIcon />
          </span>
        </div>

        <div className="flex justify-center pt-10 pb-6">
          <SenderWalletLarge />
        </div>

        <div className="mx-auto text-lg">
          <span>Install Sender Now</span>
        </div>

        <div className="mx-auto text-xs pt-14 pb-4">
          <span>Connect to dApps with one click.</span>
        </div>

        <button
          className="py-1.5 flex items-center justify-center mx-auto text-xs rounded-lg"
          style={{
            width: '242px',
            background: 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)',
            height: '40px',
            marginBottom: '5px',
          }}
          onClick={() => {
            window.open('https://senderwallet.io', '_blank');
          }}
        >
          {' '}
          <span>Install</span>{' '}
        </button>

        <WalletFooter
          ques="First time using Ref?"
          tip="Learn more"
          callback={() => {
            window.open('https://ref.finance', '_blank');
          }}
        />
      </Card>
    </Modal>
  );
};
const ConnectingModal = (
  props: ReactModal.Props & {
    setShowConnecting: (show?: boolean) => void;
    setShowWalletSelector: (show?: boolean) => void;
    walletIcon: JSX.Element;
  }
) => {
  const { setShowConnecting, setShowWalletSelector, walletIcon } = props;

  return (
    <Modal
      {...props}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        },
        content: {
          outline: 'none',
        },
      }}
    >
      <Card
        className="pt-8 px-6 pb-6 flex flex-col text-white"
        width="xs:w-95vw w-360px"
        style={{
          border: '1px solid rgba(0, 198, 162, 0.5)',
          height: '422px',
          maxWidth: '360px',
        }}
      >
        <div className="flex items-start justify-between ">
          <span
            className="cursor-pointer pb-1 pr-1"
            onClick={() => {
              setShowConnecting(false);
              setShowWalletSelector(true);
            }}
          >
            <BackArrowGray />
            {'    '}
          </span>
          <span
            className="cursor-pointer pb-1 pl-1"
            onClick={() => setShowConnecting(false)}
          >
            <CloseIcon />
          </span>
        </div>

        <div className="mx-auto font-bold pt-11 pb-16 ">
          <span
            style={{
              fontSize: '20px',
              lineHeight: '30px',
            }}
          >
            Connecting
          </span>
        </div>

        <div className="flex items-center mx-auto">
          <span>
            <RefWalletLarge />
          </span>

          <span className="mx-4">
            <BeatLoader size={5} color="#00C6A2" />
          </span>

          <span>{walletIcon}</span>
        </div>

        <div className="mx-auto pt-12 mb-4">
          <span>Please unlock your Sender wallet.</span>
        </div>

        <WalletFooter
          ques="Having trouble?"
          tip="Go back"
          callback={() => {
            setShowConnecting(false);
            setShowWalletSelector(true);
          }}
        />
      </Card>
    </Modal>
  );
};

export const WalletSelectorModal = (
  props: ReactModal.Props & { setShowWalletSelector: (show: boolean) => void }
) => {
  const { setShowWalletSelector } = props;
  const { signedInState, signedInStatedispatch } = useContext(WalletContext);

  const [showSenderNotInstalled, setShowSenderNotInstalled] =
    useState<boolean>(false);

  const [showConnecting, setShowConnecting] = useState<boolean>(false);

  const [walletIcon, setWalletIcon] = useState(<SenderWalletLarge />);

  return (
    <>
      <Modal
        {...props}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
          },
        }}
      >
        <Card
          className="pt-8 px-6 pb-6 flex flex-col text-white"
          width="xs:w-95vw w-360px "
          style={{
            border: '1px solid rgba(0, 198, 162, 0.5)',
            height: '422px',
            maxWidth: '360px',
          }}
        >
          <div className="flex items-start justify-between">
            <span>
              <BackArrowGray />
              {'    '}
            </span>
            <span
              className="cursor-pointer pb-1 pl-1"
              onClick={() => setShowWalletSelector(false)}
            >
              <CloseIcon />
            </span>
          </div>

          <div className="pt-10 text-2xl pb-6 mx-auto items-center flex flex-col">
            <span className=" pb-1">
              select a<span className="font-bold"> NEAR </span>
              <span>wallet</span>
            </span>
            <span className="">to use Ref.Finance</span>
          </div>

          <WalletOption
            title="NEAR"
            Icon={<NearWallet />}
            description="web"
            officialUrl="wallet.near.org"
            connect={() => {
              setShowWalletSelector(false);
              setShowConnecting(true);
              setWalletIcon(<NearWalletLarge />);

              wallet.requestSignIn(REF_FARM_CONTRACT_ID);
            }}
          />

          <WalletOption
            title="Sender"
            Icon={<SenderWallet />}
            decorate
            description={
              isMobileExplorer()
                ? 'not supported'
                : window.near && window.near.isSender
                ? 'extension'
                : 'not installed'
            }
            officialUrl="senderwallet.io"
            connect={() => {
              if (typeof window.near !== 'undefined' && window.near.isSender) {
                setShowWalletSelector(false);
                setShowConnecting(true);
                setWalletIcon(<SenderWalletLarge />);

                getSenderWallet(window)
                  .requestSignIn(REF_FARM_CONTRACT_ID)
                  .then(() => {
                    setShowConnecting(false);
                    signedInStatedispatch({ type: 'signIn' });
                  });
              } else if (!isMobileExplorer()) {
                setShowSenderNotInstalled(true);
                setShowWalletSelector(false);
              }
            }}
          />

          <WalletFooter
            ques="First time using Ref?"
            tip="Learn more"
            callback={() => {
              window.open('https://ref.finance', '_blank');
            }}
          />
        </Card>
      </Modal>
      <SenderNotInstalledModal
        setShowSenderNotInstalled={setShowSenderNotInstalled}
        setShowWalletSelector={setShowWalletSelector}
        isOpen={showSenderNotInstalled}
        onRequestClose={() => setShowSenderNotInstalled(false)}
      />

      <ConnectingModal
        isOpen={showConnecting}
        onRequestClose={() => setShowConnecting(false)}
        setShowConnecting={setShowConnecting}
        setShowWalletSelector={setShowWalletSelector}
        walletIcon={walletIcon}
      />
    </>
  );
};
