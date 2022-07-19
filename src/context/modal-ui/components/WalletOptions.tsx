import React, { Fragment, useEffect, useState } from 'react';
import type {
  WalletSelector,
  ModuleState,
  Wallet,
} from '@near-wallet-selector/core';

import { InjectedWallet } from '@near-wallet-selector/core';

import type { ModalOptions } from '../modal.types';
import { FormattedMessage, useIntl } from 'react-intl';
import { useClientMobile } from '../../../utils/device';
import { ACCOUNT_ID_KEY } from '../../WalletSelectorContext';

const walletOfficialUrl = {
  'NEAR Wallet': 'wallet.near.org',
  Sender: 'sender.org',
  'Math Wallet': 'mathwallet.org',
  Nightly: 'nightly.app',
  'Nightly Connect': 'nightly.app',
  Ledger: 'ledger.com',
  WalletConnect: 'walletconnect.com',
  'My NEAR Wallet': 'mynearwallet.com',
};

const SelectedIcon = () => {
  return (
    <div className="left-1 bottom-1 relative">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="9.5" fill="#00C6A2" stroke="#1D2932" />
        <path
          d="M6 10.5L8.66667 13L14 8"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>
  );
};

const Installed = () => {
  return (
    <div
      className="bg-white bg-opacity-10 relative bottom-6 left-4 pl-2 pr-6 pt-6 rounded-lg text-primaryText"
      style={{
        fontSize: '10px',
      }}
    >
      <FormattedMessage id="installed" defaultMessage={'installed'} />
    </div>
  );
};

const Beta = () => {
  return (
    <div
      className="bg-farmText px-1 relative right-px top-px rounded-md"
      style={{
        color: '#01121D',
        fontSize: '8px',
      }}
    >
      <FormattedMessage id="beta" defaultMessage={'Beta'} />
    </div>
  );
};

const notSupportingIcons = [
  'https://ref-finance-images.s3.amazonaws.com/images/wallets-icons/sender.png',
  'https://ref-finance-images.s3.amazonaws.com/images/wallets-icons/math-wallet.png',
  'https://ref-finance-images.s3.amazonaws.com/images/wallets-icons/nightly.png',
  'https://ref-finance-images.s3.amazonaws.com/images/wallets-icons/ledger.png',
  'https://ref-finance-images.s3.amazonaws.com/images/wallets-icons/nightly-connect.png',
  'https://ref-finance-images.s3.amazonaws.com/images/wallets-icons/WalletConnect.png',
];

interface WalletOptionsProps {
  selector: WalletSelector;
  options: ModalOptions;
  onWalletNotInstalled: (module: ModuleState) => void;
  onConnectHardwareWallet: () => void;
  onConnected: () => void;
  onConnecting: (wallet: Wallet) => void;
  onError: (error: Error) => void;
}
export const WalletSelectorFooter = () => {
  const intl = useIntl();

  return (
    <div className="flex items-center pt-5 justify-center text-xs">
      <span className="text-xs">
        <FormattedMessage
          id="first_time_using_ref"
          defaultMessage="First time using Ref"
        />
        ?
      </span>
      <div
        className="ml-2 cursor-pointer font-bold"
        onClick={() => {
          window.open('https://ref.finance', '_blank');
        }}
      >
        {intl.formatMessage({
          id: 'learn_more',
          defaultMessage: 'Learn more',
        })}
      </div>
    </div>
  );
};

export const WalletOptions: React.FC<WalletOptionsProps> = ({
  selector,
  options,
  onWalletNotInstalled,
  onError,
  onConnectHardwareWallet,
  onConnecting,
  onConnected,
}) => {
  const [modules, setModules] = useState<Array<ModuleState>>([]);

  useEffect(() => {
    const subscription = selector.store.observable.subscribe((state) => {
      state.modules.sort((current, next) => {
        if (current.metadata.deprecated === next.metadata.deprecated) {
          return 0;
        }

        return current.metadata.deprecated ? 1 : -1;
      });
      setModules(state.modules);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWalletClick = (module: ModuleState) => async () => {
    try {
      const { available } = module.metadata;

      if (module.type === 'injected' && !available) {
        return onWalletNotInstalled(module);
      }
      const wallet = await module.wallet();

      onConnecting(wallet);

      if (wallet.type === 'hardware') {
        return onConnectHardwareWallet();
      }

      await wallet.signIn({
        contractId: options.contractId,
        methodNames: options.methodNames,
      });

      if (wallet.type !== 'browser') {
        onConnected();
      }
    } catch (err) {
      const { name } = module.metadata;

      const message =
        err instanceof Error ? err.message : 'Something went wrong';

      onError(new Error(`Failed to sign in with ${name}: ${message}`));
    }
  };

  const isMobile = useClientMobile();

  return (
    <Fragment>
      <div className="wallet-options-wrapper">
        <ul className={'options-list'}>
          {modules.reduce<Array<JSX.Element>>((result, module) => {
            const { selectedWalletId } = selector.store.getState();
            const { name, description, iconUrl, deprecated } = module.metadata;
            const selected = module.id === selectedWalletId;
            if (isMobile && module.type !== 'browser') {
              return result;
            }

            const installed =
              module.type === 'injected' && module.metadata.available;

            console.log(module);

            const isBeta = module.metadata.name === 'My NEAR Wallet';

            result.push(
              <li
                key={module.id}
                id={module.id}
                onClick={selected ? undefined : handleWalletClick(module)}
                className={`px-5 py-3 relative ${
                  !selected && installed ? 'overflow-hidden' : ''
                }`}
              >
                <div className="absolute top-0 right-0">
                  {selected ? (
                    <SelectedIcon />
                  ) : installed ? (
                    <Installed />
                  ) : isBeta ? (
                    <Beta />
                  ) : null}
                </div>

                <div
                  title={description || ''}
                  className="wallet-content flex items-center"
                >
                  <div className="wallet-img-box">
                    <img src={iconUrl} alt={name} />
                  </div>
                  <div className="flex items-start flex-col">
                    <span className="">
                      {name === 'NEAR Wallet' ? 'NEAR' : name}
                    </span>

                    <span className="text-xs text-primaryText official-url">
                      {walletOfficialUrl[name]}
                    </span>
                  </div>
                </div>
              </li>
            );

            return result;
          }, [])}
        </ul>
      </div>

      {isMobile && (
        <div className="flex flex-col mt-7">
          <div className="text-xs mb-4">
            <FormattedMessage
              id="wallets_below_supports_on_PC"
              defaultMessage={'Wallets below support on PC'}
            />
          </div>

          <div className="flex items-center opacity-50">
            {notSupportingIcons.map((url) => {
              return <img src={url} className="w-7 h-7 mr-4" alt="" />;
            })}
          </div>
        </div>
      )}

      <WalletSelectorFooter />
    </Fragment>
  );
};
