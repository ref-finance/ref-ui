import { ethers } from 'ethers';
import erc20Abi from '../abi/erc20.json';
import request from '../utils/request';
import { IS_MAINNET } from '../config';
import Big from 'big.js';
import getConfig from 'src/services/config';
import { connect, keyStores, providers } from 'near-api-js';
import { logger, sleep } from '../utils/common';
import {
  FinalExecutionOutcome,
  QueryResponseKind,
} from 'near-api-js/lib/providers/provider';
import { Optional, Transaction } from '@near-wallet-selector/core';
import { formatAmount, parseAmount } from '../utils/format';
import {
  getTokenAddress,
  getTokenByAddress,
  getTokenMeta,
} from '../utils/token';
import { toast } from 'react-toastify';
import {
  auroraCallToAction,
  buildInput,
  decodeOutput,
  getAurora,
  toAddress,
} from 'src/services/aurora/aurora';
import { getAuroraConfig } from 'src/services/aurora/config';
import {
  scientificNotationToString,
  toNonDivisibleNumber,
  toReadableNumber,
} from 'src/utils/numbers';

export const evmServices = {
  async getEvmContract(
    address: string,
    contractInterface: ethers.ContractInterface
  ) {
    const signer = await window.ethWeb3Provider?.getSigner();
    const evmContract = new ethers.Contract(address, contractInterface, signer);
    return evmContract;
  },
  async checkErc20Approve({
    token,
    amount,
    owner,
    spender,
  }: {
    token: string;
    amount: string;
    owner: string;
    spender: string;
  }) {
    const erc20Contract = await evmServices.getEvmContract(token, erc20Abi);
    const allowance = await erc20Contract.allowance(owner, spender);
    const decimals = await erc20Contract.decimals();
    const amountIn = new Big(amount).times(10 ** decimals).toFixed();
    const unAllowance = new Big(amountIn).minus(allowance).abs();

    if (unAllowance.gt(0)) {
      console.log(
        'checkErc20Approve',
        allowance.toString(),
        unAllowance.toString()
      );
      const tx = await erc20Contract.approve(spender, unAllowance.toString());
      await tx.wait();
    }
  },

  async getBalance(
    chain: BridgeModel.BridgeSupportChain,
    token: BridgeModel.BridgeTokenMeta
  ) {
    try {
      let balance = '0';
      if (!window.ethProvider) return balance;
      const [sender] = await window.ethProvider?.request({
        method: 'eth_requestAccounts',
      });

      if (token.symbol === 'ETH' && !token.addresses[chain]) {
        balance = (await window.ethWeb3Provider?.getBalance(sender)).toString();
      } else {
        const Interface = new ethers.utils.Interface(erc20Abi);
        const data = Interface.encodeFunctionData('balanceOf', [sender]);
        const rawBalance = await window.ethWeb3Provider?.call({
          to: token.addresses[chain],
          data,
        });
        balance = Interface.decodeFunctionResult('balanceOf', rawBalance)[0];
      }
      const formattedBalance = formatAmount(balance, token.decimals);
      logger.log(`bridge: ${token.symbol} balance on eth`, formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error(error);
      logger.log(token.symbol, token.addresses[chain]);
      return '0';
    }
  },
  async calculateGasInUSD(gas: string | number) {
    if (!window.ethWeb3Provider) return '0';
    const gasPrice = await window.ethWeb3Provider.getGasPrice();
    const gasLimit = ethers.BigNumber.from(gas);
    const totalGasCostWei = gasPrice.mul(gasLimit);
    const totalGasCostEth = ethers.utils.formatEther(totalGasCostWei);
    const ethPriceInUSD = await tokenServices.getPrice(getTokenMeta('ETH'));
    const totalGasCostUSD = new Big(totalGasCostEth)
      .times(ethPriceInUSD)
      .toFixed(4);
    logger.log(
      `bridge: Gas Price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} GWei`
    );
    logger.log(`bridge: Gas Limit: ${gasLimit.toString()}`);
    logger.log(`bridge: Total Gas Cost: ${totalGasCostEth} ETH`);
    logger.log(`bridge: Total Gas Cost: ${totalGasCostUSD} USD`);
    return totalGasCostUSD;
  },
};

export const auroraServices = {
  async getAuroraContract(
    address: string,
    contractInterface: ethers.ContractInterface
  ) {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://1rpc.io/aurora'
    );
    const contract = new ethers.Contract(address, contractInterface, provider);
    return contract;
  },
  async checkErc20Approve(
    address: string,
    tokenAddress: string,
    spender: string,
    readableAmountIn: string,
    decimal: number
  ) {
    if (tokenAddress === getAuroraConfig().WETH) return null;

    const allowance = await auroraServices.fetchAllowance(
      address,
      tokenAddress,
      spender
    );

    const parsedAllowance = toReadableNumber(
      decimal,
      scientificNotationToString(allowance.toString())
    );

    if (new Big(parsedAllowance).lt(new Big(readableAmountIn))) {
      return auroraServices.approveErc20(
        tokenAddress,
        spender,
        new Big(readableAmountIn).minus(parsedAllowance).toFixed(0, 3),
        decimal
      );
    }
  },
  async fetchAllowance(address: string, tokenAddress: string, spender: string) {
    try {
      const input = buildInput(erc20Abi, 'allowance', [address, spender]);
      const res = (
        await getAurora().view(
          toAddress(address),
          toAddress(tokenAddress),
          0,
          input
        )
      ).unwrap();
      const out = decodeOutput(erc20Abi, 'allowance', res);
      return Big(out[0] as any);
    } catch (e) {
      return new Big(0);
    }
  },
  approveErc20(
    tokenAddress: string,
    spender: string,
    readableAmount: string,
    decimal: number
  ) {
    const input = buildInput(erc20Abi, 'increaseAllowance', [
      spender,
      toNonDivisibleNumber(decimal, readableAmount),
    ]);

    return auroraCallToAction(toAddress(tokenAddress), input);
  },
};

export type ContractParams = {
  method: string;
  args?: any;
  gas?: string;
  deposit?: string;
};

export type TransactionParams = {
  contractId: string;
  actions: ContractParams[];
};

export const NEAR_DECIMALS = 24;
export const NEAR_TGAS_DECIMALS = 12;

export const STORAGE_DEPOSIT_FEE = '1250000000000000000000';

export const nearServices = {
  getNearConnectionConfig() {
    const {
      networkId,
      helperUrl,
      walletUrl,
      nodeUrl,
      explorerUrl,
      indexerUrl,
    } = getConfig();
    return {
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
      networkId,
      nodeUrl,
      helperUrl,
      walletUrl,
      explorerUrl,
      indexerUrl,
      headers: {},
    };
  },
  async nearConnect() {
    const nearConnection = await connect(
      nearServices.getNearConnectionConfig()
    );
    return nearConnection;
  },
  async query<T>({
    contractId,
    method,
    args = {},
  }: ContractParams & { contractId: string }) {
    try {
      const config = this.getNearConnectionConfig();
      const provider = new providers.JsonRpcProvider({ url: config.nodeUrl });
      logger.log(`${method} args`, args);
      const res = await provider.query({
        request_type: 'call_function',
        account_id: contractId,
        method_name: method,
        args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
        finality: 'final',
      });
      const result = JSON.parse(
        Buffer.from(
          (res as QueryResponseKind & { result: number[] }).result
        ).toString()
      ) as T;
      logger.log(`${method} result`, result);
      return result;
    } catch (error) {
      console.error(`${method} error`, error);
    }
  },

  async sendTransaction(params: TransactionParams) {
    if (!window.nearWallet) throw new Error('Wallet not found');
    const res = await window.nearWallet.signAndSendTransaction(
      (
        await this.transformTransactionActions([params])
      )?.[0]
    );
    console.log('sendTransactions outcome', res);
    const transformedRes =
      typeof res === 'object' ? this.handleTransactionResult(res) : undefined;
    if (!transformedRes || window.nearWallet.id === 'my-near-wallet')
      await sleep(5000);
    else await sleep(2000);
    return transformedRes;
  },

  async sendTransactions(params: TransactionParams[]) {
    if (!window.nearWallet) throw new Error('Wallet not found');

    const res = await window.nearWallet.signAndSendTransactions({
      transactions: await this.transformTransactionActions(params),
    });
    console.log('sendTransactions outcomes', res);
    const transformedRes =
      typeof res === 'object' ? this.handleTransactionResult(res) : undefined;
    if (!transformedRes || window.nearWallet.id === 'my-near-wallet')
      await sleep(5000);
    else await sleep(2000);
    return transformedRes;
  },

  async transformTransactionActions(params: TransactionParams[]) {
    const accountId = this.getNearAccountId();
    const minGas = parseAmount(30, NEAR_TGAS_DECIMALS);
    const defaultGas = parseAmount(200 / params.length, NEAR_TGAS_DECIMALS);
    const result = [];
    for (const p of params) {
      const { contractId, actions } = p;
      const transaction: Optional<Transaction, 'signerId'> = {
        receiverId: contractId,
        signerId: accountId,
        actions: [],
      };
      for (const action of actions) {
        const { method, args = {}, gas = defaultGas, deposit = '0' } = action;
        const parsedArgs = JSON.parse(JSON.stringify(args));
        transaction.actions.push({
          type: 'FunctionCall',
          params: {
            methodName: method,
            args: parsedArgs,
            gas,
            deposit,
          },
        });
        // Call multiple methods from wNEAR contract
        // Swap NEAR to wNEAR, then transfer wNEAR to others
        if (method === 'ft_transfer_call' && parsedArgs.amount) {
          if (contractId === getTokenAddress('NEAR')) {
            transaction.actions.unshift({
              type: 'FunctionCall',
              params: {
                methodName: 'near_deposit',
                args: {},
                deposit: parsedArgs.amount,
                gas: minGas,
              },
            });
          }
          const storageDepositTransaction = await this.checkFTStorageBalance(
            contractId
          );

          if (storageDepositTransaction?.actions?.[0]) {
            transaction.actions.unshift({
              type: 'FunctionCall',
              params: {
                methodName: storageDepositTransaction.actions[0].method,
                args: storageDepositTransaction.actions[0].args,
                deposit:
                  storageDepositTransaction.actions[0].deposit ||
                  STORAGE_DEPOSIT_FEE,
                gas: minGas,
              },
            });
          }
        }
      }
      if (transaction.actions.length) {
        result.push(transaction);
      }
    }
    console.log('transformTransactionActions', result);
    return result;
  },

  handleTransactionResult<
    T extends FinalExecutionOutcome | FinalExecutionOutcome[]
  >(outcome: T): T | undefined {
    if (Array.isArray(outcome)) {
      // @ts-ignore
      const errorMessage = outcome.find((o) => o.status?.Failure?.ActionError) // @ts-ignore
        ?.status.Failure.ActionError as string;
      if (errorMessage) {
        throw new Error(JSON.stringify(errorMessage));
      }
      return outcome;
    } else {
      // @ts-expect-error fix
      const errorMessage = outcome.status?.Failure?.ActionError as string;
      if (errorMessage) {
        toast.error(errorMessage);
        throw new Error(JSON.stringify(errorMessage));
      }
      if (typeof outcome === 'object') return outcome;
    }
  },

  async getTransactionResult(txhash: string) {
    console.log('getTransactionResult', txhash);
    const config = this.getNearConnectionConfig();
    const provider = new providers.JsonRpcProvider({ url: config.nodeUrl });
    const result = await provider.txStatus(txhash, 'unnused');
    console.log('getTransactionResult', result);
    return this.handleTransactionResult(result);
  },
  getNearAccountId(catchError?: boolean) {
    try {
      if (!window.selector) throw new Error('Wallet Selector not found');
      const accounts = window.selector?.store.getState().accounts;
      const accountId = accounts?.find((a) => a.active)?.accountId;
      if (!accountId) throw new Error('Please connect wallet');
      return accountId;
    } catch (error) {
      if (catchError) return '';
      throw error;
    }
  },

  async checkFTStorageBalance(FTContractId: string) {
    if (!window.selector) throw new Error('Wallet Selector not found');
    const accountId = this.getNearAccountId();
    const res = await nearServices.query<{
      available: string;
      total: string;
    }>({
      contractId: FTContractId,
      method: 'storage_balance_of',
      args: { account_id: accountId },
    });
    if (!res?.available) {
      return {
        contractId: FTContractId,
        actions: [
          {
            method: 'storage_deposit',
            args: {
              account_id: nearServices.getNearAccountId(),
              registration_only: true,
            },
            deposit: STORAGE_DEPOSIT_FEE,
          },
        ],
      } as TransactionParams;
    }
  },

  async getNearBalance() {
    try {
      if (!window.selector) throw new Error('Wallet Selector not found');
      const accountId = await this.getNearAccountId();
      const config = this.getNearConnectionConfig();
      const provider = new providers.JsonRpcProvider({ url: config.nodeUrl });
      const res = await provider.query({
        request_type: 'view_account',
        account_id: accountId,
        finality: 'final',
      });
      return 'amount' in res ? (res.amount as string) : '0';
    } catch (error) {
      return '0';
    }
  },

  /** get balance, if tokenAddress is undefined, get NEAR balance */
  async getBalance(tokenAddress: string, decimals?: number) {
    try {
      if (!tokenAddress) return '0';
      const accountId = await this.getNearAccountId();
      if (!accountId) return '0';
      const near = await this.nearConnect();
      const account = await near.account(accountId);
      const address = tokenAddress;
      let balance = '0';
      if (address === getTokenAddress('NEAR')) {
        balance = (await account.getAccountBalance()).available;
        console.log('getBalance', tokenAddress, balance);
        console.log('getBalance2', await nearServices.getNearBalance());
      } else {
        balance =
          (await nearServices.query<string>({
            contractId: address,
            method: 'ft_balance_of',
            args: { account_id: accountId },
          })) || '0';
      }
      const _decimals =
        decimals || getTokenByAddress(address)?.decimals || NEAR_DECIMALS;

      return formatAmount(balance, _decimals);
    } catch (error) {
      console.error(error);
      return '0';
    }
  },
};

export const tokenServices = {
  balances: {} as Record<string, { value: string; timestamp: number }>,
  async getBalance(
    chain: BridgeModel.BridgeSupportChain,
    token: BridgeModel.BridgeTokenMeta,
    isForce = false
  ) {
    const balance = tokenServices.balances[token.addresses[chain]];
    if (!isForce && balance && Date.now() - balance.timestamp < 1000 * 30) {
      return balance.value;
    }
    const res = await (chain === 'NEAR'
      ? nearServices.getBalance(token.addresses.NEAR, token.decimals)
      : evmServices.getBalance(chain, token));
    tokenServices.balances[token.addresses[chain]] = {
      value: res,
      timestamp: Date.now(),
    };
    return res;
  },
  async getPrice(token: BridgeModel.BridgeTokenMeta) {
    const res = await request<{ price: string }>(
      `https://${
        IS_MAINNET ? 'indexer.ref.finance' : 'mainnet-indexer.ref-finance.com'
      }/get-token-price?token_id=${token.addresses.NEAR}`
    );
    return Number.isNaN(+res.price) ? '0' : res.price;
  },
};
