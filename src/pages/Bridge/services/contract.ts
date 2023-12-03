import { ethers } from 'ethers';
import erc20Abi from '../abi/erc20.json';

export const ethServices = {
  async getErc20Contract(address: string) {
    const signer = await window.ethWeb3Provider?.getSigner();
    const erc20Contract = new ethers.Contract(address, erc20Abi, signer);
    return erc20Contract;
  },
  async getBalance(token: BridgeModel.BridgeTokenMeta) {
    try {
      const [sender] = await window.ethProvider?.request({
        method: 'eth_requestAccounts',
      });

      if (token.symbol === 'ETH' && !token.addresses.ETH) {
        const balance = await window.ethWeb3Provider?.getBalance(sender);
        console.log('balance', balance.toString());
        return balance.toString();
      }

      const Interface = new ethers.utils.Interface(erc20Abi);
      const data = Interface.encodeFunctionData('balanceOf', [sender]);
      const rawBalance = await window.ethWeb3Provider?.call({
        to: token.addresses.ETH,
        data,
      });
      const balance = Interface.decodeFunctionResult(
        'balanceOf',
        rawBalance
      )[0];
      console.log('balance', balance.toString());
      return balance.toString();
    } catch (error) {
      console.error(error);
      console.log(token.symbol, token.addresses.ETH);
      return '0';
    }
  },
};

export const nearServices = {
  async getBalance(token: BridgeModel.BridgeTokenMeta, accountId?: string) {
    try {
      if (!token.addresses.NEAR || !window.Near) return '0';
      const _accountId =
        accountId || window.walletNearConnection.getAccountId();
      console.log('_accountId', _accountId);
      const account = await window.Near.account(_accountId);
      if (token.symbol === 'NEAR') {
        const balance = await account.getAccountBalance();
        console.log('balance', balance);
        return balance.available;
      } else {
        const balance = await account.viewFunction(
          token.addresses.NEAR,
          'ft_balance_of',
          { account_id: _accountId }
        );
        console.log('balance', token.symbol, token.addresses.NEAR, balance);
        return balance;
      }
    } catch (error) {
      console.error(error);
      return '0';
    }
  },
};
