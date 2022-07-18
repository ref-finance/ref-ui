import React, { Fragment, useEffect, useState } from 'react';
import type {
  WalletSelector,
  ModuleState,
  Wallet,
} from '@near-wallet-selector/core';

import type { ModalOptions } from '../modal.types';
import { FormattedMessage, useIntl } from 'react-intl';

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
  const [walletInfoVisible, setWalletInfoVisible] = useState(false);
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

  const intl = useIntl();

  const handleWalletClick = (module: ModuleState) => async () => {
    try {
      const { deprecated, available } = module.metadata;

      if (module.type === 'injected' && !available) {
        return onWalletNotInstalled(module);
      }

      if (deprecated) {
        return onError(
          new Error(
            `${module.metadata.name} is deprecated. Please select another wallet.`
          )
        );
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

      onConnected();
    } catch (err) {
      const { name } = module.metadata;

      const message =
        err instanceof Error ? err.message : 'Something went wrong';

      onError(new Error(`Failed to sign in with ${name}: ${message}`));
    }
  };

  return (
    <Fragment>
      <div className="wallet-options-wrapper">
        <ul className={'options-list'}>
          {modules.reduce<Array<JSX.Element>>((result, module) => {
            const { selectedWalletId } = selector.store.getState();
            const { name, description, iconUrl, deprecated } = module.metadata;
            const selected = module.id === selectedWalletId;
            result.push(
              <li
                key={module.id}
                id={module.id}
                onClick={selected ? undefined : handleWalletClick(module)}
                className="px-5 py-3"
              >
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
      <WalletSelectorFooter />
    </Fragment>
  );
};
