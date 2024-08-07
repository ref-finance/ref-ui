import Big from 'big.js';
import moment from 'moment';
import { EVMConfig, NearConfig } from '../config';
import { capitalize } from 'lodash';

export function formatTimestamp(timestamp: string | number | Date) {
  return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

export function formatSortAddress(address: string | undefined) {
  if (!address) return '';

  const domainSuffixes = ['.near', '.testnet', '.betanet', '.mainnet'];
  const maxLength = 12;

  const suffix = domainSuffixes.find((suffix) => address.endsWith(suffix));
  const isLongAddress = address.length > maxLength;

  if (suffix) {
    if (isLongAddress) {
      const visiblePartLength = maxLength - suffix.length - 10;
      if (visiblePartLength > 0) {
        return `${address.slice(0, 6)}...${address.slice(
          -4 - suffix.length,
          -suffix.length
        )}${suffix}`;
      } else {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      }
    } else {
      return address;
    }
  } else {
    return isLongAddress
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;
  }
}

export function formatAmount(
  amount: string | number | undefined,
  decimals = 24
) {
  if (!amount) return '';
  try {
    const n = new Big(amount).div(Big(10).pow(decimals)).toFixed();
    return n;
  } catch (error) {
    return '';
  }
}

export function parseAmount(
  amount: string | number | undefined,
  decimals = 24
) {
  if (!amount) return '';
  try {
    return new Big(amount).times(Big(10).pow(decimals)).toFixed(0);
  } catch (error) {
    return '';
  }
}

export function formatNumber(
  val: string | number | undefined,
  options?: {
    rm?: Big.RoundingMode;
    displayMinimum?: boolean;
    displayDecimals?: number;
  } & Intl.NumberFormatOptions
) {
  if (!val || !Number(val)) return '0';
  const {
    rm = Big.roundHalfUp,
    displayMinimum = true,
    displayDecimals = 2,
    ...numberFormatOptions
  } = options || {};

  const min = new Big(10).pow(-displayDecimals);
  const bigVal = new Big(val);
  const roundedVal = bigVal.round(displayDecimals, rm);

  if (displayMinimum && roundedVal.abs().lt(min)) {
    const formattedMin = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: displayDecimals,
      ...numberFormatOptions,
    }).format(min.toNumber());

    return `< ${roundedVal.lt(0) ? '-' : ''}${formattedMin}`;
  }

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: displayDecimals,
    ...numberFormatOptions,
  }).format(roundedVal.toNumber());

  return formattedValue;
}

export function formatChainName(chain: BridgeModel.BridgeSupportChain) {
  return chain;
}

export function formatTxExplorerUrl(
  chain:
    | BridgeModel.BridgeSupportChain
    | Lowercase<BridgeModel.BridgeSupportChain>,
  hash: string
) {
  const _chain = chain.toLowerCase();
  switch (_chain) {
    case 'aurora':
      return `${EVMConfig.Aurora.explorerUrl}/tx/${hash}`;
    case 'near':
      return `${NearConfig.explorerUrl}/tx/${hash}`;
    default:
      return `${EVMConfig[capitalize(_chain)]?.explorerUrl}/tx/${hash}`;
  }
}

export function formatUSDCurrency(
  val: string | number | undefined,
  min?: string | number
) {
  if (min && val && new Big(val).lt(min)) return `< $${min}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(val));
}

const AssetsCDN = 'https://assets.deltatrade.ai';

export function formatFileUrl(key: string) {
  return `${AssetsCDN}/assets${key}`;
}

export function formatChainIcon(chain: BridgeModel.BridgeSupportChain) {
  const _chain = chain === 'Aurora' ? 'NEAR' : chain;
  return formatFileUrl(`/chain/${_chain.toLowerCase()}.svg`);
}
