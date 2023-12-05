import { ethers } from 'ethers';
import erc20Abi from '../abi/erc20.json';
import { formatBalanceRaw } from '../utils/format';

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

      let balance = '0';
      if (token.symbol === 'ETH' && !token.addresses.ETH) {
        balance = (await window.ethWeb3Provider?.getBalance(sender)).toString();
      } else {
        const Interface = new ethers.utils.Interface(erc20Abi);
        const data = Interface.encodeFunctionData('balanceOf', [sender]);
        const rawBalance = await window.ethWeb3Provider?.call({
          to: token.addresses.ETH,
          data,
        });
        balance = Interface.decodeFunctionResult('balanceOf', rawBalance)[0];
      }
      const formattedBalance = formatBalanceRaw(balance, token.decimals);
      console.log(`${token.symbol} balance on eth`, formattedBalance);
      return formattedBalance;
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
      let balance = '0';
      if (token.symbol === 'NEAR') {
        balance = (await account.getAccountBalance()).available;
      } else {
        balance = await account.viewFunction(
          token.addresses.NEAR,
          'ft_balance_of',
          { account_id: _accountId }
        );
      }
      const formattedBalance = formatBalanceRaw(balance, token.decimals);
      console.log(`${token.symbol} balance on near`, formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error(error);
      return '0';
    }
  },
};
