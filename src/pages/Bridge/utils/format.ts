import Big from 'big.js';
import moment from 'moment';
import { EthereumConfig, NearConfig } from '../config';

export function formatTimestamp(timestamp: string | number | Date) {
  return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

export function formatSortAddress(address: string | undefined) {
  if (!address) return '';
  else if (
    (address.endsWith('.near') ||
      address.endsWith('.testnet') ||
      address.endsWith('.betanet') ||
      address.endsWith('.mainnet')) &&
    address.length < 64
  )
    return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalanceRaw(balance: string | undefined, decimals = 18) {
  if (!balance) return '0';
  return new Big(balance).div(10 ** decimals).toFixed();
}

export function formatBalance(balance: string | undefined) {
  if (!balance) return '0';
  return new Big(balance).round(4).toString();
}

export function formatAmountRaw(amount: string | undefined, decimals = 18) {
  if (!amount) return '0';
  return new Big(amount).div(10 ** decimals).toFixed();
}

export function formatAmount(amount: string | undefined) {
  if (!amount) return '0';
  return new Big(amount).round(4).toString();
}

export function formatChainName(chain: BridgeModel.BridgeSupportChain) {
  return chain === 'NEAR' ? 'NEAR' : 'Ethereum';
}

export function formatTxExplorerUrl(
  chain: BridgeModel.BridgeSupportChain | 'near' | 'ethereum',
  hash: string
) {
  return chain === 'NEAR' || chain === 'near'
    ? `${NearConfig.explorerUrl}/txns/${hash}`
    : `${EthereumConfig.explorerUrl}/tx/${hash}`;
}

export function formatUSDCurrency(
  val: string | number | undefined,
  min?: string | number
) {
  if (min && new Big(val).lt(min)) return `< $${min}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(val));
}
