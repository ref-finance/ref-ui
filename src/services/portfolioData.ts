import { getCurrentWallet } from '../utils/wallets-integration';
import { Transaction as WSTransaction } from '@near-wallet-selector/core';
import { getOrderlyConfig } from '../pages/Orderly/config';
export async function batchDeleteKeys(publicKeys: string[]) {
  const accountId = getCurrentWallet().wallet.getAccountId();
  const wallet = await window.selector.wallet();
  const wstransactions: WSTransaction[] = [];
  publicKeys.forEach((key) => {
    wstransactions.push({
      signerId: accountId,
      receiverId: accountId,
      actions: [
        {
          type: 'DeleteKey',
          params: {
            publicKey: key,
          },
        },
      ],
    });
  });
  wallet
    .signAndSendTransactions({
      transactions: wstransactions,
    })
    .then(() => {
      if (wallet.id !== 'my-near-wallet') {
        window.location.reload();
      }
    })
    .catch(() => {
      if (wallet.id !== 'my-near-wallet') {
        window.location.reload();
      }
    });
}
export async function batchOrderelyDeleteKeys(publicKeys: string[]) {
  const accountId = getCurrentWallet().wallet.getAccountId();
  const wallet = await window.selector.wallet();
  const wstransactions: WSTransaction[] = [];
  publicKeys.forEach((key) => {
    wstransactions.push({
      signerId: accountId,
      receiverId: getOrderlyConfig().ORDERLY_ASSET_MANAGER,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: 'user_request_key_removal',
            args: {
              public_key: key,
            },
            gas: '30000000000000',
            deposit: '1',
          },
        },
      ],
    });
  });
  wallet
    .signAndSendTransactions({
      transactions: wstransactions,
    })
    .then(() => {
      if (wallet.id !== 'my-near-wallet') {
        window.location.reload();
      }
    })
    .catch(() => {
      if (wallet.id !== 'my-near-wallet') {
        window.location.reload();
      }
    });
}
