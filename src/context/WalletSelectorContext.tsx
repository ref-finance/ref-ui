import React, { useCallback, useContext, useEffect, useState } from 'react';
import { map, distinctUntilChanged } from 'rxjs';
import { utils } from 'near-api-js';

import { NetworkId, setupWalletSelector } from '@near-wallet-selector/core';
import type { WalletSelector, AccountState } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import { setupLedger } from '@near-wallet-selector/ledger';

import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupNeth } from '@near-wallet-selector/neth';

import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';

import { setupNightly } from '@near-wallet-selector/nightly';

import getConfig from '../services/config';
import { Transaction as WSTransaction } from '@near-wallet-selector/core';

import '@near-wallet-selector/modal-ui/styles.css';
import { Transaction, getGas } from '../services/near';
import { getOrderlyConfig } from '../pages/Orderly/config';
import { REF_ORDERLY_ACCOUNT_VALID } from '../pages/Orderly/components/UserBoard/index';
import {
  ledgerTipTrigger,
  addQueryParams,
  extraWalletsError,
  walletsRejectError,
} from '../utils/wallets-integration';
import {
  REF_FI_SENDER_WALLET_ACCESS_KEY,
  REF_ORDERLY_NORMALIZED_KEY,
} from '../pages/Orderly/orderly/utils';
import {
  get_orderly_private_key_path,
  get_orderly_public_key_path,
} from '../pages/Orderly/orderly/utils';
import { TRANSACTION_WALLET_TYPE } from '../components/layout/transactionTipPopUp';

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
  executeMultipleTransactions: any;
  setTransactionExcuteStatus: any;
  transactionExcuteStatus: IExcuteStatus;
  transactioData: any;
}

type IExcuteStatus = 'pending' | 'resolved' | 'rejected';
const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider: React.FC<any> = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [transactionExcuteStatus, setTransactionExcuteStatus] =
    useState<IExcuteStatus>('resolved');
  const [transactioData, setTransactioData] = useState<any>();
  const [isLedger, setIsLedger] = useState<boolean>(undefined);

  // get Account Id
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
        setupMyNearWallet({
          // iconUrl: walletIcons['my-near-wallet'],
        }),
        // @ts-ignore
        setupHereWallet(),
        setupNearWallet({
          // iconUrl: walletIcons['near-wallet'],
        }),
        setupSender({
          // iconUrl: walletIcons['sender'],
        }),
        // @ts-ignore
        setupMeteorWallet({
          // iconUrl: walletIcons['meteor-wallet'],
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
        window.selector.store.observable
          .pipe(
            map((state) => state.accounts),
            distinctUntilChanged()
          )
          .subscribe((nextAccounts) => {
            syncAccountState(accountId, nextAccounts);
          });
      });
  }, [init]);

  // todoxxxx 此处有删除

  useEffect(() => {
    if (!accountId || !selector) return;
    const isSelectLedger =
      selector.store.getState().selectedWalletId === 'ledger';

    setIsLedger(isSelectLedger);
  }, [accountId, selector]);

  window.selectorAccountId = accountId;
  // localStorage todoxxxx 可以去掉
  if (!!window.near) {
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

  const executeMultipleTransactions = async (
    transactions: Transaction[],
    callbackUrl?: string
  ) => {
    const wallet = window.selector;
    const wstransactions: WSTransaction[] = [];
    transactions.forEach((transaction) => {
      wstransactions.push({
        signerId: wallet.getAccountId()!,
        receiverId: transaction.receiverId,
        actions: transaction.functionCalls.map((fc) => {
          return {
            type: 'FunctionCall',
            params: {
              methodName: fc.methodName,
              args: fc.args,
              gas: getGas(fc.gas).toNumber().toFixed(),
              deposit: utils.format.parseNearAmount(fc.amount || '0')!,
            },
          };
        }),
      });
    });
    await ledgerTipTrigger(wallet);
    return (await wallet.wallet())
      .signAndSendTransactions({
        transactions: wstransactions,
        callbackUrl,
      })
      .then((res) => {
        if (!res) return;
        const transactionHashes = (Array.isArray(res) ? res : [res])?.map(
          (r) => r.transaction.hash
        );
        const parsedTransactionHashes = transactionHashes?.join(',');
        const newHref = addQueryParams(
          window.location.origin + window.location.pathname,
          {
            [TRANSACTION_WALLET_TYPE.WalletSelector]: parsedTransactionHashes,
          }
        );
        setTransactionExcuteStatus('resolved');
        setTransactioData(newHref);
      })
      .catch((e: Error) => {
        if (extraWalletsError.includes(e.message)) {
          return;
        }
        if (
          !walletsRejectError.includes(e.message) &&
          !extraWalletsError.includes(e.message)
        ) {
          sessionStorage.setItem('WALLETS_TX_ERROR', e.message);
        }
        setTransactionExcuteStatus('rejected');
      });
  };

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
        setAccountId,
        isLedger,
        executeMultipleTransactions,
        setTransactionExcuteStatus,
        transactionExcuteStatus,
        transactioData,
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
