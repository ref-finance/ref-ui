import { getCurrentWallet } from '../utils/wallets-integration';
import { Transaction as WSTransaction } from '@near-wallet-selector/core';
import { getOrderlyConfig } from '../pages/Orderly/config';
const webWalletIds = ['my-near-wallet', 'mintbase-wallet'];
export async function batchDeleteKeys(publicKeys: string[]) {
  const accountId = getCurrentWallet().wallet.getAccountId();
  const wallet = await window.selector.wallet();
  const wstransactions: WSTransaction[] = [];
  const actions = [];
  publicKeys.forEach((key) => {
    actions.push({
      type: 'DeleteKey',
      params: {
        publicKey: key,
      },
    });
  });
  wstransactions.push({
    signerId: accountId,
    receiverId: accountId,
    actions,
  });
  wallet
    .signAndSendTransactions({
      transactions: wstransactions,
    })
    .then(() => {
      if (!webWalletIds.includes(wallet.id)) {
        window.location.reload();
      }
    })
    .catch(() => {
      if (!webWalletIds.includes(wallet.id)) {
        window.location.reload();
      }
    });
}
export async function batchOrderelyDeleteKeys(publicKeys: string[]) {
  const accountId = getCurrentWallet().wallet.getAccountId();
  const wallet = await window.selector.wallet();
  const wstransactions: WSTransaction[] = [];
  const len = 1;
  const transactionsLength = Math.ceil(publicKeys.length / len);
  for (let index = 0; index < transactionsLength; index++) {
    const splitPublicKeys = publicKeys.slice(index * len, index * len + len);
    const actions = [];
    splitPublicKeys.forEach((key) => {
      actions.push({
        type: 'FunctionCall',
        params: {
          methodName: 'user_request_key_removal',
          args: {
            public_key: key,
          },
          gas: '30000000000000',
          deposit: '1',
        },
      });
    });
    wstransactions.push({
      signerId: accountId,
      receiverId: getOrderlyConfig().ORDERLY_ASSET_MANAGER,
      actions,
    });
  }
  wallet
    .signAndSendTransactions({
      transactions: wstransactions,
    })
    .then(() => {
      if (!webWalletIds.includes(wallet.id)) {
        window.location.reload();
      }
    })
    .catch(() => {
      if (!webWalletIds.includes(wallet.id)) {
        window.location.reload();
      }
    });
}
