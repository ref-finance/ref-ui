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
import { FormattedMessage } from 'react-intl';

declare global {
  interface Window {
    near: any;
  }
}

export const WalletTitle = ({
  ifBack,
  closeCallback,
  backCallback,
}: {
  ifBack?: boolean;
  closeCallback: (e?: any) => void;
  backCallback?: (e?: any) => void;
}) => {
  return (
    <div
      className={`flex items-start ${
        ifBack ? 'justify-between' : 'justify-end'
      }`}
    >
      <span
        className={`${!ifBack ? 'hidden' : ''} cursor-pointer pb-1 pr-1`}
        onClick={() => {
          backCallback && backCallback();
        }}
      >
        <BackArrowGray />
        {'    '}
      </span>
      <span
        className="cursor-pointer pb-1 pl-1"
        onClick={() => closeCallback()}
      >
        <CloseIcon />
      </span>
    </div>
  );
};

export const WalletOption = ({
  title,
  Icon,
  description,
  officialUrl,
  senderTip,
  decorate,
  connect,
}: {
  title: string;
  decorate?: boolean;
  Icon: JSX.Element;
  senderTip?: string | JSX.Element;
  description: string;
  officialUrl: string;
  connect: (e?: any) => void;
}) => {
  return (
    <div
      className="pl-5 my-2  pr-4 relative rounded-2xl bg-black bg-opacity-20 hover:bg-opacity-40 flex items-center overflow-hidden"
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
            <span className="text-xs text-primaryText ml-2">
              {' '}
              {`(${description})`}{' '}
            </span>
          </div>
          {decorate ? (
            <div
              className="ml-1 px-0.5 text-black rounded bg-senderHot relative left-1 bottom-1"
              style={{
                fontSize: '10px',
                lineHeight: '15px',
              }}
            >
              HOT
            </div>
          ) : null}
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
      <div
        className={`${
          senderTip ? 'block' : 'hidden'
        } rounded-2xl bg-white bg-opacity-10 px-3 ${
          senderTip === 'install now' ? ' text-greenLight' : 'text-primaryText'
        }`}
        style={{
          fontSize: '10px',
          lineHeight: '15px',
          position: 'absolute',
          height: '40px',
          width: senderTip === 'installed' ? '80px' : '120px',
          left:
            senderTip === 'installed'
              ? '245px'
              : senderTip === 'not supported'
              ? '210px'
              : '236px',
          top: '47px',
        }}
      >
        {senderTip}
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
        <WalletTitle
          ifBack
          backCallback={() => {
            setShowSenderNotInstalled(false);
            setShowWalletSelector(true);
          }}
          closeCallback={() => setShowSenderNotInstalled(false)}
        />

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
        <WalletTitle
          ifBack
          backCallback={() => {
            setShowConnecting(false);
            setShowWalletSelector(true);
          }}
          closeCallback={() => setShowConnecting(false)}
        />

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
  const senderInstalled =
    typeof window.near !== 'undefined' && window.near.isSender;
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
          <WalletTitle
            ifBack={false}
            closeCallback={() => setShowWalletSelector(false)}
          />

          <div className="pt-10 text-2xl pb-6 mx-auto items-center flex flex-col">
            <span className=" pb-1">
              <FormattedMessage id="select_a" defaultMessage="select a" />{' '}
              <span className="font-bold"> NEAR </span>
              <span>
                <FormattedMessage id="wallet" defaultMessage="wallet" />
              </span>
            </span>
            <span className="">
              <FormattedMessage
                id="to_use_ref_finance"
                defaultMessage="to use Ref.Finance"
              />
            </span>
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
            senderTip={
              isMobileExplorer()
                ? 'not supported'
                : senderInstalled
                ? 'installed'
                : 'install now'
            }
            decorate
            description={'extension'}
            officialUrl="senderwallet.io"
            connect={() => {
              // mobile device
              if (isMobileExplorer()) {
                return;
              }

              // PC && installed
              if (senderInstalled) {
                setShowWalletSelector(false);
                setShowConnecting(true);
                setWalletIcon(<SenderWalletLarge />);

                getSenderWallet(window)
                  .requestSignIn(REF_FARM_CONTRACT_ID)
                  .then((res: any) => {
                    !res?.error && setShowConnecting(false);
                    !res?.error && signedInStatedispatch({ type: 'signIn' });
                  });
              } else if (!senderInstalled) {
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
