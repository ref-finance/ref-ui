import BN from 'bn.js';
import { utils } from 'near-api-js';
import { Action, functionCall } from 'near-api-js/lib/transaction';
import { ftGetStorageBalance } from './ft-contract';
import { wallet } from './near';

const WRAP_NEAR_CONTRACT_ID = 'wrap.near';

export const wrapNear = async (amount: string) => {
  const actions: Action[] = [];
  const balance = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);

  if (balance.total === '0') {
    actions.push(
      functionCall(
        'storage_deposit',
        {},
        new BN('30000000000000'),
        new BN('1250000000000000000000')
      )
    );
  }

  actions.push(
    functionCall(
      'near_deposit',
      {},
      new BN('30000000000000'),
      new BN(utils.format.parseNearAmount(amount))
    )
  );

  return wallet
    .account()
    .sendTransactionWithActions(WRAP_NEAR_CONTRACT_ID, actions);
};
