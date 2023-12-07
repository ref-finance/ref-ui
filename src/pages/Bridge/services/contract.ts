import { ethers } from 'ethers';
import erc20Abi from '../abi/erc20.json';
import { formatBalanceRaw } from '../utils/format';
import request from '../utils/request';
import { IS_MAINNET, TokenList } from '../config';
import Big from 'big.js';

export const tokenServices = {
  getBalance(
    chain: BridgeModel.BridgeSupportChain,
    token: BridgeModel.BridgeTokenMeta
  ) {
    return chain === 'ETH'
      ? ethServices.getBalance(token)
      : nearServices.getBalance(token);
  },
  async getPrice(token: BridgeModel.BridgeTokenMeta) {
    const res = await request<{ price: string }>(
      `https://${
        IS_MAINNET ? 'indexer.ref.finance' : 'mainnet-indexer.ref-finance.com'
      }/get-token-price?token_id=${token.addresses.NEAR}`
    );
    return Number.isNaN(+res.price) ? '0' : res.price;
  },
  async getPriceBySymbol(symbol: string) {
    const token = TokenList.find((item) => item.symbol === symbol);
    if (!token) return '0';
    return this.getPrice(token);
  },
};

export const ethServices = {
  async getErc20Contract(address: string) {
    const signer = await window.ethWeb3Provider?.getSigner();
    const erc20Contract = new ethers.Contract(address, erc20Abi, signer);
    return erc20Contract;
  },
  async getBalance(token: BridgeModel.BridgeTokenMeta) {
    try {
      let balance = '0';
      if (!window.ethProvider) return balance;
      const [sender] = await window.ethProvider?.request({
        method: 'eth_requestAccounts',
      });

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
  async calculateGasInUSD(gas: string | number) {
    const gasPrice = await window.ethWeb3Provider.getGasPrice();
    const gasLimit = ethers.BigNumber.from(gas);
    const totalGasCostWei = gasPrice.mul(gasLimit);
    const totalGasCostEth = ethers.utils.formatEther(totalGasCostWei);
    const ethPriceInUSD = await tokenServices.getPriceBySymbol('ETH');
    const totalGasCostUSD = new Big(totalGasCostEth)
      .times(ethPriceInUSD)
      .toFixed(4);
    console.log(
      `Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} GWei`
    );
    console.log(`Gas Limit: ${gasLimit.toString()}`);
    console.log(`Total Gas Cost: ${totalGasCostEth} ETH`);
    console.log(`Total Gas Cost: ${totalGasCostUSD} USD`);
    return totalGasCostUSD;
  },
};

export const nearServices = {
  async getBalance(token: BridgeModel.BridgeTokenMeta, accountId?: string) {
    try {
      let balance = '0';
      if (!token.addresses.NEAR || !window.Near) return balance;
      const _accountId =
        accountId || window.walletNearConnection.getAccountId();
      console.log('_accountId', _accountId);
      const account = await window.Near.account(_accountId);

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
