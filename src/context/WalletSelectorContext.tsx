import React, { useCallback, useContext, useEffect, useState } from 'react';
import { map, distinctUntilChanged } from 'rxjs';

import { NetworkId, setupWalletSelector } from '@near-wallet-selector/core';
import type { WalletSelector, AccountState } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import { setupLedger } from '@near-wallet-selector/ledger';

import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupNeth } from '@near-wallet-selector/neth';

import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';

import { setupNightly } from '@near-wallet-selector/nightly';

import getConfig from '../services/config';
import { setupWalletConnect } from '@near-wallet-selector/wallet-connect';
import { setupNearMobileWallet } from '@near-wallet-selector/near-mobile-wallet';
import { setupOKXWallet } from '@near-wallet-selector/okx-wallet';
import { setupMintbaseWallet } from '@near-wallet-selector/mintbase-wallet';

import '@near-wallet-selector/modal-ui/styles.css';
import { near } from '../services/near';
import { getOrderlyConfig } from '../pages/Orderly/config';
import { REF_ORDERLY_ACCOUNT_VALID } from '../pages/Orderly/components/UserBoard/index';
import {
  REF_FI_SENDER_WALLET_ACCESS_KEY,
  REF_ORDERLY_NORMALIZED_KEY,
} from '../pages/Orderly/orderly/utils';
import {
  get_orderly_private_key_path,
  get_orderly_public_key_path,
} from '../pages/Orderly/orderly/utils';
import { isMobile } from '../utils/device';
import { setupKeypom } from '@keypom/selector';
import { addUserWallet } from '../services/indexer';

const CONTRACT_ID = getOrderlyConfig().ORDERLY_ASSET_MANAGER;

export const ACCOUNT_ID_KEY = 'REF_FI_STATE_SYNC_ACCOUNT_ID';

declare global {
  interface Window {
    selector: WalletSelector & {
      getAccountId?: () => string;
    };
    modal: WalletSelectorModal;
    selectorAccountId?: string | null;
    sender?: any;
  }
}
interface IAccountKey {
  access_key: {
    nonce: number;
    permission: string | Ipermission;
  };
  public_key: string;
}
export interface Ipermission {
  FunctionCall: {
    allowance: string;
    method_names: string[];
    receiver_id: string;
  };
}
interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
  setAccountId: (accountId: string) => void;
  isLedger: boolean;
  allKeys: IAccountKey[];
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider: React.FC<any> = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);

  const [isLedger, setIsLedger] = useState<boolean>(undefined);
  const [allKeys, setAllKeys] = useState<IAccountKey[]>([]);

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

  const KEYPOM_OPTIONS = {
    beginTrial: {
      landing: {
        title: 'Welcome!',
      },
    },
    wallets: [
      {
        name: 'MyNEARWallet',
        description: 'Secure your account with a Seed Phrase',
        redirectUrl: `https://${
          getConfig().networkId
        }.mynearwallet.com/linkdrop/ACCOUNT_ID/SECRET_KEY`,
        iconUrl: 'INSERT_ICON_URL_HERE',
      },
    ],
  };

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: getConfig().networkId as NetworkId,
      debug: false,
      modules: [
        setupOKXWallet({}),
        setupMyNearWallet({
          // iconUrl: walletIcons['my-near-wallet'],
        }),
        // @ts-ignore
        setupHereWallet(),
        setupSender({
          // iconUrl: walletIcons['sender'],
        }),
        // @ts-ignore
        setupMeteorWallet({
          // iconUrl: walletIcons['meteor-wallet'],
        }),
        setupNearMobileWallet({
          dAppMetadata: {
            name: 'ref finance',
            logoUrl: 'https://assets.ref.finance/images/REF-black-logo.png',
            url: 'https://app.ref.finance',
          },
        }),
        setupNeth({
          // iconUrl: walletIcons['neth'],
          gas: '300000000000000',
          bundle: false,
        }) as any,
        // @ts-ignore
        setupNightly({
          // iconUrl: walletIcons['nightly'],
        }),
        setupLedger({
          // iconUrl: walletIcons['ledger'],
        }),
        setupWalletConnect({
          projectId: '87e549918631f833447b56c15354e450',

          metadata: {
            name: 'ref finance',
            description: 'Example dApp used by NEAR Wallet Selector',
            url: 'https://github.com/ref-finance/ref-ui',
            icons: ['https://avatars.githubusercontent.com/u/37784886'],
          },
          chainId: `near:${getConfig().networkId}`,
          // iconUrl: walletIcons['wallet-connect'],
        }),
        setupKeypom({
          networkId: getConfig().networkId as NetworkId,
          signInContractId: CONTRACT_ID,
          trialAccountSpecs: {
            url: '/trial-accounts/ACCOUNT_ID#SECRET_KEY',
            modalOptions: KEYPOM_OPTIONS,
          },
          instantSignInSpecs: {
            url: '/#instant-url/ACCOUNT_ID#SECRET_KEY/MODULE_ID',
          },
        }),
        setupMintbaseWallet({
          walletUrl: 'https://wallet.mintbase.xyz',
          contractId: CONTRACT_ID,
          deprecated: false,
        }),
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
  useEffect(() => {
    const selectedWalletId = selector?.store?.getState()?.selectedWalletId;
    if (accountId && selectedWalletId) {
      addUserWallet({
        account_id: accountId,
        wallet_address: selectedWalletId,
      });
    }
  }, [selector?.store?.getState()?.selectedWalletId, accountId]);

  const getAllKeys = async (accountId: string) => {
    const account = await near.account(accountId);

    const allKeys = (await account.getAccessKeys()) as IAccountKey[];

    const isWalletMeta = allKeys.some((k) => {
      if (k.access_key.permission === 'FullAccess') return false;
      const meta = (
        k.access_key.permission as Ipermission
      ).FunctionCall.method_names.includes('__wallet__metadata');
      return meta;
    });

    const isSelectLedger =
      selector.store.getState().selectedWalletId === 'ledger';
    setAllKeys(allKeys);
    setIsLedger(isSelectLedger || isWalletMeta);
  };

  useEffect(() => {
    if (!accountId || !selector) return;

    getAllKeys(accountId);
  }, [accountId, selector]);

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
        !!keyStoreSender?.accountId &&
        !!keyStoreSender?.accessKey
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
        allKeys,
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
