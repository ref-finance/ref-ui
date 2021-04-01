import { ConnectedWalletAccount, WalletConnection } from 'near-api-js';
import { Action } from 'near-api-js/lib/transaction';

export default class SpecialWallet extends WalletConnection {
  _connectedAccount: SpecialWalletAccount;

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
}

class SpecialWalletAccount extends ConnectedWalletAccount {
  async sendTransactionWithActions(receiverId: string, actions: Action[]) {
    return this.signAndSendTransaction(receiverId, actions);
  }
}
