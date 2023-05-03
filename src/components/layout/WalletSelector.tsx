import React, { useContext, useState } from 'react';

import ReactModal from 'react-modal';
import { Card } from '../card/Card';
import {
  wallet,
  REF_FARM_CONTRACT_ID,
  REF_FARM_BOOST_CONTRACT_ID,
} from '../../services/near';
import {
  senderWallet,
  getCurrentWallet,
  getSenderWallet,
} from '../../utils/wallets-integration';
import Modal from 'react-modal';
import {
  WalletContext,
  removeSenderLoginRes,
} from '../../utils/wallets-integration';
import { isMobile, isMobileExplorer } from '../../utils/device';
import { BackArrowWhite, BackArrowGray } from '../icon/Arrows';
import { CloseIcon } from '../../components/icon/Actions';
import { NearWallet } from '../../components/icon/Wallet';
import {
  SenderWallet,
  SenderWalletLarge,
  RefWalletLarge,
  NearWalletLarge,
} from '../icon/Wallet';
import { getExplorer } from '../../utils/device';
import { BeatLoader } from 'react-spinners';
import { FormattedMessage } from 'react-intl';
import { openUrl } from '../../services/commonV3';

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
        onClick={() => {
          window.location.reload();
          closeCallback();
        }}
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
  description: string | JSX.Element;
  officialUrl: string;
  connect: (e?: any) => void;
}) => {
  const senderInstalled =
    typeof window.near !== 'undefined' && window.near.isSender;
  return (
    <div
      className="pl-5 my-2  pr-4 relative rounded-2xl bg-black bg-opacity-20 hover:bg-opacity-40 flex items-center overflow-hidden cursor-pointer"
      onClick={() => connect()}
      style={{
        height: '62px',
      }}
    >
      <div className="">{Icon}</div>
      <div className="py-1 pl-3 w-full">
        <div className="flex items-center justify-between">
          <div className="text-base text-white flex items-center">
            {title}
            <span className="text-xs text-primaryText ml-2">
              {'('}
              {description}
              {')'}
            </span>
          </div>
        </div>
        <button className="text-xs text-primaryText">{officialUrl}</button>
      </div>
      <div
        className={`whitespace-nowrap absolute ${
          senderTip ? 'block' : 'hidden'
        } rounded-2xl bg-white bg-opacity-10 pl-3 pr-7 ${
          !senderInstalled ? ' text-greenLight' : 'text-primaryText'
        }`}
        style={{
          fontSize: '10px',
          lineHeight: '15px',
          height: '30px',
          right: '-15px',
          bottom: '-15px',
          textAlign: 'right',
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
  ques: string | JSX.Element;
  tip: string | JSX.Element;
  callback: (e?: any) => void;
}) => {
  return (
    <div className="mx-auto text-white text-xs mt-11 absolute bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
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
          zIndex: 160,
        },
        content: {
          outline: 'none',
        },
      }}
    >
      <Card
        className="pt-8 px-6 pb-6 flex flex-col text-white relative"
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

        <div className="flex justify-center pt-6">
          <SenderWalletLarge />
        </div>

        <div className="mx-auto text-lg">
          <span>
            <FormattedMessage
              id="install_sender_now"
              defaultMessage={'Install Sender Now'}
            />
          </span>
        </div>

        <div className="mx-auto text-xs pt-10 pb-4">
          <span>
            <FormattedMessage
              id="connect_to_dapps_with_one_click"
              defaultMessage="Connect to dApps with one click"
            />
          </span>
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
            openUrl('https://sender.org/?origin=ref');
          }}
        >
          <span>
            <FormattedMessage id="install" defaultMessage="Install" />
          </span>
        </button>

        <WalletFooter
          ques={
            <span>
              <FormattedMessage
                id="first_time_using_ref"
                defaultMessage="First time using Ref"
              />
              ?
            </span>
          }
          tip={<FormattedMessage id="learn_more" defaultMessage="Learn more" />}
          callback={() => {
            openUrl('https://ref.finance');
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
          zIndex: 160,
        },
        content: {
          outline: 'none',
        },
      }}
    >
      <Card
        className="pt-8 px-6 pb-6 flex flex-col text-white relative"
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

        <div className="mx-auto font-bold pt-8 pb-12 ">
          <span
            style={{
              fontSize: '20px',
              lineHeight: '30px',
            }}
          >
            <FormattedMessage id="Connecting" defaultMessage="Connecting" />
          </span>
        </div>

        <div className="flex items-center mx-auto relative left-6">
          <span className="">
            <RefWalletLarge />
          </span>

          <span className="mx-4">
            <BeatLoader size={5} color="#00C6A2" />
          </span>

          <span className="relative right-4">{walletIcon}</span>
        </div>

        <div className="mx-auto pt-6 mb-5 flex justify-center">
          <span className="whitespace-nowrap">
            <FormattedMessage
              id="check_sender_wallet_extension"
              defaultMessage="Please check Sender wallet extension"
            />
          </span>
        </div>

        <WalletFooter
          ques={
            <FormattedMessage
              id="having_trouble"
              defaultMessage="Having trouble?"
            />
          }
          tip={<FormattedMessage id="go_back" defaultMessage="Go back" />}
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
  const { globalState, globalStatedispatch } = useContext(WalletContext);

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
            zIndex: 150,
          },
          content: {
            outline: 'none',
          },
        }}
      >
        <Card
          className="pt-8 px-6 pb-6 flex flex-col text-white relative"
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
              <FormattedMessage id="select_a" defaultMessage="Select a" />{' '}
              <FormattedMessage id="wallet_vi" defaultMessage=" " />
              <span className="font-bold"> NEAR </span>
              <FormattedMessage id="wallet" defaultMessage=" " />
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
            description={<FormattedMessage id="web" defaultMessage="web" />}
            officialUrl="wallet.near.org"
            connect={() => {
              wallet.requestSignIn(REF_FARM_BOOST_CONTRACT_ID);
            }}
          />

          <WalletOption
            title="Sender"
            Icon={<SenderWallet />}
            senderTip={
              isMobileExplorer() ? (
                <FormattedMessage
                  id="not_supported"
                  defaultMessage="not supported"
                />
              ) : senderInstalled ? (
                <FormattedMessage id="installed" defaultMessage="installed" />
              ) : (
                <FormattedMessage
                  id="installe_now"
                  defaultMessage="install now"
                />
              )
            }
            decorate
            description={
              <FormattedMessage id="extension" defaultMessage="extension" />
            }
            officialUrl="sender.org"
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
                  .requestSignIn(REF_FARM_BOOST_CONTRACT_ID)
                  .then((res: any) => {
                    !res?.error && setShowConnecting(false);
                    !res?.error && globalStatedispatch({ type: 'signIn' });
                  });
              } else if (!senderInstalled) {
                setShowSenderNotInstalled(true);
                setShowWalletSelector(false);
              }
            }}
          />

          <WalletFooter
            ques={
              <span>
                <FormattedMessage
                  id="first_time_using_ref"
                  defaultMessage="First time using Ref"
                />
                ?
              </span>
            }
            tip={
              <FormattedMessage id="learn_more" defaultMessage="Learn more" />
            }
            callback={() => {
              openUrl('https://ref.finance');
            }}
          />
        </Card>
      </Modal>
      <SenderNotInstalledModal
        setShowSenderNotInstalled={setShowSenderNotInstalled}
        setShowWalletSelector={setShowWalletSelector}
        isOpen={showSenderNotInstalled}
        onRequestClose={() => {
          window.location.reload();
          setShowSenderNotInstalled(false);
        }}
      />

      <ConnectingModal
        isOpen={showConnecting}
        onRequestClose={() => {
          window.location.reload();
          setShowConnecting(false);
        }}
        setShowConnecting={setShowConnecting}
        setShowWalletSelector={setShowWalletSelector}
        walletIcon={walletIcon}
      />
    </>
  );
};
