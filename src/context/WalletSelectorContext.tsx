import React, { useCallback, useContext, useEffect, useState } from 'react';
import { map, distinctUntilChanged } from 'rxjs';

import {
  NetworkId,
  setupWalletSelector,
  waitFor,
} from '@near-wallet-selector/core';
import type { WalletSelector, AccountState } from '@near-wallet-selector/core';
import { setupModal } from './modal-ui';
import type { WalletSelectorModal } from './modal-ui';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import { setupMathWallet } from '@near-wallet-selector/math-wallet';
import { setupLedger } from '@near-wallet-selector/ledger';

import { setupNeth } from '@near-wallet-selector/neth';

import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';

import { setupWalletConnect } from '@near-wallet-selector/wallet-connect';

import { InjectedWallet } from '@near-wallet-selector/core';

import getConfig from '../services/config';

import './modal-ui/components/styles.css';
import {
  REF_FARM_CONTRACT_ID,
  wallet,
  REF_FARM_BOOST_CONTRACT_ID,
} from '../services/near';
import { walletIcons } from './walletIcons';
import { getOrderlyConfig } from '../pages/Orderly/config';
import { REF_ORDERLY_ACCOUNT_VALID } from '../pages/Orderly/components/UserBoard/index';
import {
  get_orderly_private_key_path,
  get_orderly_public_key_path,
} from '../pages/Orderly/orderly/utils';

const CONTRACT_ID = getOrderlyConfig().ORDERLY_ASSET_MANAGER;

export const ACCOUNT_ID_KEY = 'REF_FI_STATE_SYNC_ACCOUNT_ID';

declare global {
  interface Window {
    selector: WalletSelector & {
      getAccountId?: () => string;
    };
    modal: WalletSelectorModal;
    selectorAccountId?: string | null;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
  setAccountId: (accountId: string) => void;
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider: React.FC<any> = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);

  const syncAccountState = (
    currentAccountId: string | null,
    newAccounts: Array<AccountState>
  ) => {
    if (!newAccounts.length) {
      localStorage.removeItem(ACCOUNT_ID_KEY);
      setAccountId(null);
      setAccounts([]);

      return;
    }

    const validAccountId =
      currentAccountId &&
      newAccounts.some((x) => x.accountId === currentAccountId);
    const newAccountId = validAccountId
      ? currentAccountId
      : newAccounts[0].accountId;

    localStorage.setItem(ACCOUNT_ID_KEY, newAccountId);
    setAccountId(newAccountId);
    setAccounts(newAccounts);
  };

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: getConfig().networkId as NetworkId,
      debug: false,
      modules: [
        setupNearWallet({
          iconUrl: walletIcons['near-wallet'],
        }),
        setupMyNearWallet({
          iconUrl: walletIcons['my-near-wallet'],
        }),
        setupSender({
          iconUrl: walletIcons['sender'],
        }),
        setupNeth({
          iconUrl: walletIcons['neth'],
          gas: '300000000000000',
          bundle: false,
        }),
        // setupMeteorWallet({
        //   iconUrl: walletIcons['meteor-wallet'],
        // }),
        // setupMathWallet({
        //   iconUrl: walletIcons['math-wallet'],
        // }),
        // setupNightly({
        //   iconUrl: walletIcons['nightly'],
        // }),
        setupLedger({
          iconUrl: walletIcons['ledger'],
        }),
        // setupNightlyConnect({
        //   url: 'wss://ncproxy.nightly.app/app',
        //   appMetadata: {
        //     additionalInfo: '',
        //     application: 'ref fiannce',
        //     description: 'Example dApp used by NEAR Wallet Selector',
        //     icon: 'https://near.org/wp-content/uploads/2020/09/cropped-favicon-192x192.png',
        //   },
        //   iconUrl: walletIcons['nightly-connect'],
        // }),
        // setupWalletConnect({
        //   projectId: '423baa464ffaeca9d7165ab4222d534f',
        //   relayUrl: 'wss://relay.walletconnect.com',
        //   metadata: {
        //     name: 'ref_finance',
        //     description: 'Example dApp used by NEAR Wallet Selector',
        //     url: 'https://github.com/near/wallet-selector',
        //     icons: walletIcons['wallet-connect'],
        //   },
        //   chainId: `near:${getConfig().networkId}}`,
        //   iconUrl: walletIcons['wallet-connect'],
        // }),
      ],
    });
    const _modal = setupModal(_selector, {
      contractId: CONTRACT_ID,
    });
    const state = _selector.store.getState();
    syncAccountState(localStorage.getItem(ACCOUNT_ID_KEY), state.accounts);

    window.selector = _selector;
    window.modal = _modal;

    setSelector(_selector);
    setModal(_modal);
  }, []);

  useEffect(() => {
    init()
      .catch((err) => {
        console.error(err);
        console.log(err);
        alert('Failed to initialise wallet selector');
      })
      .then(() => {
        const subscription = window.selector.store.observable
          .pipe(
            map((state) => state.accounts),
            distinctUntilChanged()
          )
          .subscribe((nextAccounts) => {
            syncAccountState(accountId, nextAccounts);
          });
      });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map((state) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        syncAccountState(accountId, nextAccounts);
      });

    return () => subscription.unsubscribe();
  }, [selector, accountId]);

  if (!selector || !modal) {
    return null;
  }

  window.selectorAccountId = accountId;

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
        setAccountId,
      }}
    >
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      'useWalletSelector must be used within a WalletSelectorContextProvider'
    );
  }

  return context;
}
