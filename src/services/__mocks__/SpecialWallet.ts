import { ConnectedWalletAccount, WalletConnection } from 'near-api-js';
import { FinalExecutionOutcome } from 'near-api-js/lib/providers';
import { Action, createTransaction } from 'near-api-js/lib/transaction';
import { KeyPair, PublicKey } from 'near-api-js/lib/utils';

const views: { [key: string]: any } = {};

export default class SpecialWallet extends WalletConnection {
  static transactions = jest.fn();

  _connectedAccount: SpecialWalletAccount;

  static addView(contractId: string, methodName: string, result: any) {
    views[`${contractId}-${methodName}`] = result;
  }

  getAccountId() {
    return 'test.near';
  }

  isSignedIn() {
    return true;
  }

  async requestSignTransactions() {}

  account() {
    if (!this._connectedAccount) {
      this._connectedAccount = new SpecialWalletAccount(
        this,
        this._near.connection,
        this._authData.accountId
      );
    }

    return this._connectedAccount;
  }

  createTransaction({
    receiverId,
    actions,
    nonceOffset = 1,
  }: {
    receiverId: string;
    actions: Action[];
    nonceOffset?: number;
  }) {
    return this._connectedAccount.createTransaction({
      receiverId,
      actions,
      nonceOffset,
    });
  }
}

class SpecialWalletAccount extends ConnectedWalletAccount {
  async viewFunction(
    contractId: string,
    methodName: string,
    args: any
  ): Promise<any> {
    const mockResult = views[`${contractId}-${methodName}`];
    return mockResult === undefined ? [] : mockResult;
  }

  async getAccountBalance() {
    return {
      total: '100000000000000000000000000',
      available: '50000000000000000000000000',
      stateStaked: '0',
      staked: '0',
    };
  }

  protected async signAndSendTransaction(
    receiverId: string,
    actions: Action[]
  ): Promise<FinalExecutionOutcome> {
    SpecialWallet.transactions(receiverId, actions);

    return {
      status: {},
      transaction: {},
      transaction_outcome: {
        id: '',
        outcome: {
          logs: [],
          receipt_ids: [],
          gas_burnt: 0,
          status: {},
        },
      },
      receipts_outcome: [],
    };
  }

  async sendTransactionWithActions(receiverId: string, actions: Action[]) {
    return this.signAndSendTransaction(receiverId, actions);
  }

  async createTransaction({
    receiverId,
    actions,
    nonceOffset = 1,
  }: {
    receiverId: string;
    actions: Action[];
    nonceOffset?: number;
  }) {
    SpecialWallet.transactions(receiverId, actions);

    return createTransaction(
      this.accountId,
      KeyPair.fromRandom('ed25519').getPublicKey(),
      receiverId,
      nonceOffset,
      actions,
      new Uint8Array(
        Buffer.from('7nsuuitwS7xcdGnD9JgrE22cRB2vf2VS4yh1N9S71F4d').buffer
      )
    );
  }
}
