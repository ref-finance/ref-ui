import React, { useCallback, useContext, useEffect, useState } from 'react';
import { map, distinctUntilChanged, windowWhen } from 'rxjs';

import {
  NetworkId,
  setupWalletSelector,
  waitFor,
  Network,
} from '@near-wallet-selector/core';
import type { WalletSelector, AccountState } from '@near-wallet-selector/core';
import { setupModal } from './modal-ui';
import type { WalletSelectorModal } from './modal-ui';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import { setupMathWallet } from '@near-wallet-selector/math-wallet';
import { setupLedger } from '@near-wallet-selector/ledger';

import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupNeth } from '@near-wallet-selector/neth';

import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';

import { setupNightly } from '@near-wallet-selector/nightly';

import { setupWalletConnect } from '@near-wallet-selector/wallet-connect';

import getConfig from '../services/config';

import './modal-ui/components/styles.css';
import {
  REF_FARM_CONTRACT_ID,
  wallet,
  REF_FARM_BOOST_CONTRACT_ID,
  near,
} from '../services/near';
import { walletIcons } from './walletIcons';
import { getWSNetworkConfig } from '../services/config';
import { getOrderlyConfig } from '../pages/Orderly/config';
import { REF_ORDERLY_ACCOUNT_VALID } from '../pages/Orderly/components/UserBoard/index';
import {
  REF_FI_SENDER_WALLET_ACCESS_KEY,
  REF_ORDERLY_NORMALIZED_KEY,
  generateTradingKeyPair,
} from '../pages/Orderly/orderly/utils';
import {
  get_orderly_private_key_path,
  get_orderly_public_key_path,
} from '../pages/Orderly/orderly/utils';
import { isMobile } from '../utils/device';
import { AccountView } from 'near-api-js/lib/providers/provider';
import { Account, providers } from 'near-api-js';

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
  isLedger: boolean;
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider: React.FC<any> = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);

  const [isLedger, setIsLedger] = useState<boolean>(undefined);

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
      network: getWSNetworkConfig() as Network,
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
        // @ts-ignore
        setupMeteorWallet({
          iconUrl: walletIcons['meteor-wallet'],
        }),
        setupNeth({
          iconUrl: walletIcons['neth'],
          gas: '300000000000000',
          bundle: false,
        }),
        setupWalletConnect({
          projectId: '87e549918631f833447b56c15354e450',

          metadata: {
            name: 'ref_finance',
            description: 'Example dApp used by NEAR Wallet Selector',
            url: 'https://github.com/ref-finance/ref-ui',
            icons: [walletIcons['wallet-connect']],
          },
          chainId: `near:${getConfig().networkId}`,
          iconUrl: walletIcons['wallet-connect'],
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

        // @ts-ignore
        setupNightly({
          iconUrl: walletIcons['nightly'],
        }),
        setupLedger({
          iconUrl: walletIcons['ledger'],
        }),
        // @ts-ignore
        setupHereWallet(),
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

  const getAllKeys = async (accountId: string) => {
    const account = await near.account(accountId);

    const allKeys = await account.getAccessKeys();

    const isWalletMeta = allKeys.some((k) => {
      if (k.access_key.permission === 'FullAccess') return false;
      const meta =
        k.access_key.permission.FunctionCall.method_names.includes(
          '__wallet__metadata'
        );
      return meta;
    });

    const isSelectLedger =
      selector.store.getState().selectedWalletId === 'ledger';

    setIsLedger(isSelectLedger || isWalletMeta);
  };

  useEffect(() => {
    if (!accountId || !selector) return;

    getAllKeys(accountId);
  }, [accountId, selector]);

  // const getAccount = useCallback(async (): Promise<Account | null> => {
  //   if (!accountId) {
  //     return null;
  //   }

  //   const provider = new providers.JsonRpcProvider({
  //     url: getConfig().nodeUrl,
  //   });

  //   return provider
  //     .query<AccountView>({
  //       request_type: 'view_account',
  //       finality: 'final',
  //       account_id: accountId,
  //     })
  //     .then((data: any) => ({
  //       ...data,
  //       account_id: accountId,
  //     }));
  // }, [accountId]);

  // useEffect(() => {
  //   if (!selector || !accountId) return;

  //   getAccount().catch((e) => {
  //     alert(e?.message);
  //     selector.wallet().then((wallet) => wallet.signOut());
  //   });
  // }, [selector, accountId]);

  if (!selector || !modal || (!!accountId && isLedger === undefined)) {
    return null;
  }

  window.selectorAccountId = accountId;

  selector.on('signedOut', () => {
    localStorage.removeItem(get_orderly_private_key_path());
    localStorage.removeItem(get_orderly_public_key_path());
    localStorage.removeItem(REF_ORDERLY_ACCOUNT_VALID);
    localStorage.removeItem(REF_ORDERLY_NORMALIZED_KEY);
    localStorage.removeItem(REF_FI_SENDER_WALLET_ACCESS_KEY);
  });

  if (!isMobile() && !!window.near) {
    window.near.on('signOut', () => {
      localStorage.removeItem(get_orderly_private_key_path());
      localStorage.removeItem(get_orderly_public_key_path());
      localStorage.removeItem(REF_ORDERLY_ACCOUNT_VALID);
      localStorage.removeItem(REF_ORDERLY_NORMALIZED_KEY);
      localStorage.removeItem(REF_FI_SENDER_WALLET_ACCESS_KEY);
    });

    window.near.on('signIn', () => {
      //@ts-ignore
      const keyStoreSender = window?.near?.authData;

      if (
        keyStoreSender &&
        !!keyStoreSender?.['accountId'] &&
        !!keyStoreSender?.['accessKey']
      ) {
        localStorage.setItem(
          REF_FI_SENDER_WALLET_ACCESS_KEY,
          JSON.stringify(keyStoreSender)
        );
      }
    });
  }

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
        setAccountId,
        isLedger,
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
