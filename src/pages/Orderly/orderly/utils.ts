import { ec } from 'elliptic';
import moment from 'moment';
import { near, config, orderlyViewFunction, keyStore } from '../near';
import getConfig from '../config';
import bs58 from 'bs58';
import { base_decode, base_encode } from 'near-api-js/lib/utils/serialize';
import keccak256 from 'keccak256';
import { Buffer } from 'buffer';
import { KeyPair, keyStores } from 'near-api-js';
import { NotSignInError } from './error';

const priKeyPath = (accountId: string) =>
  `near-api-js:keystore:${accountId}:${getConfig().networkId}`;

export const tradingKeyMap = new Map();

export const get_orderly_private_key_path = () =>
  `orderly-trading-key-private:${getConfig().networkId}`;

export const get_orderly_public_key_path = () =>
  `orderly-trading-key-public:${getConfig().networkId}`;

export const STORAGE_TO_REGISTER_WITH_MFT = '0.1';

export type OFF_CHAIN_METHOD = 'POST' | 'GET' | 'DELETE' | 'PUT';

export const REF_ORDERLY_NORMALIZED_KEY = 'REF_ORDERLY_NORMALIZED_KEY';

export const generateTradingKeyPair = () => {
  const EC = new ec('secp256k1');

  const accountId = window.selectorAccountId;

  if (!accountId) throw NotSignInError;

  const selectedWalletId = getSelectedWalletId();

  let keyPair = EC.genKeyPair();

  if (selectedWalletId === 'neth') {
    keyPair = EC.keyFromPrivate(priKeyPath(accountId));
  }

  const privateKey = keyPair.getPrivate().toString('hex');

  const publicKey = keyPair.getPublic().encode('hex', false).replace('04', '');

  // const publicKey = keyPair.getPublic().encode('hex', false).replace('04', '');

  localStorage.setItem(get_orderly_private_key_path(), privateKey);

  localStorage.setItem(get_orderly_public_key_path(), publicKey);

  tradingKeyMap.set(get_orderly_private_key_path(), privateKey);

  tradingKeyMap.set(get_orderly_public_key_path(), publicKey);

  const pubKeyAsHex = publicKey;

  const normalizeTradingKey = window.btoa(
    keccak256(pubKeyAsHex).toString('hex')
  );
  localStorage.setItem(REF_ORDERLY_NORMALIZED_KEY, normalizeTradingKey);

  return {
    privateKey,
    publicKey,
    keyPair,
  };
};

export const getNormalizeTradingKey = () => {
  return localStorage.getItem(REF_ORDERLY_NORMALIZED_KEY);
};

export const getSelectedWalletId = () => {
  return window.selector.store.getState().selectedWalletId;
};

export const REF_FI_SENDER_WALLET_ACCESS_KEY =
  'REF_FI_SENDER_WALLET_ACCESS_KEY';

const getSenderAccessKey = () => {
  const storedKey = localStorage.getItem(REF_FI_SENDER_WALLET_ACCESS_KEY);

  if (storedKey && !!JSON.parse(storedKey)?.accessKey) {
    return JSON.parse(storedKey)?.accessKey;
  }

  // @ts-ignore
  const keyStoreSender = window?.near?.authData;

  if (!keyStoreSender) alert('no accessKey found in sender');

  localStorage.setItem(
    REF_FI_SENDER_WALLET_ACCESS_KEY,
    JSON.stringify(keyStoreSender)
  );

  return keyStoreSender.accessKey;
};
export function getNearMobileWalletKeyPairObject() {
  const storage = JSON.parse(
    localStorage.getItem('near-mobile-signer:session') || '{}'
  );
  const networkId = getConfig().networkId;
  const privateKey =
    storage?.[networkId]?.accounts?.[storage?.[networkId]?.activeAccount];
  if (privateKey) {
    const keyPair = KeyPair.fromString(privateKey);
    return keyPair;
  }
  return null;
}
export const getPublicKey = async (accountId: string) => {
  const selectedWalletId = getSelectedWalletId();

  if (selectedWalletId === 'sender') {
    // @ts-ignore

    return getSenderAccessKey()?.publicKey;
  }

  if (selectedWalletId === 'meteor-wallet') {
    const keyStore = new keyStores.BrowserLocalStorageKeyStore(
      window.localStorage,
      '_meteor_wallet'
    );
    const publicKey = (await keyStore.getKey(getConfig().networkId, accountId))
      ?.getPublicKey()
      ?.toString();

    return publicKey;
  }
  if (selectedWalletId === 'keypom') {
    const keyStore = new keyStores.BrowserLocalStorageKeyStore(
      window.localStorage,
      'keypom:'
    );
    const publicKey = (await keyStore.getKey(getConfig().networkId, accountId))
      ?.getPublicKey()
      ?.toString();

    return publicKey;
  }

  if (selectedWalletId === 'near-mobile-wallet') {
    const keyPair = getNearMobileWalletKeyPairObject();
    return keyPair?.getPublicKey()?.toString();
  }

  const publicKey = (await keyStore.getKey(getConfig().networkId, accountId))
    ?.getPublicKey()
    ?.toString();

  return publicKey;
};

// get signature function
export const generateMessage = (
  time_stamp: number,
  method: OFF_CHAIN_METHOD | undefined,
  url: string | null,
  body: object | null
) => {
  return !!body
    ? `${time_stamp}${method || ''}${url || ''}${JSON.stringify(body)}`
    : `${time_stamp}${method || ''}${url || ''}`;
};

export const generateRequestSignatureHeader = async ({
  accountId,
  time_stamp,
  url,
  body,
  method,
}: {
  accountId: string;
  time_stamp: number;
  url: string | null;
  body: object | null;
  method?: OFF_CHAIN_METHOD;
}) => {
  const message = generateMessage(time_stamp, method, url, body);

  let signature;

  let keyPair;

  const selectedWalletId = getSelectedWalletId();

  if (selectedWalletId === 'sender') {
    const accessKeys = getSenderAccessKey();

    keyPair = KeyPair.fromString('ed25519:' + accessKeys.secretKey);
    signature = keyPair?.sign(Buffer.from(message))?.signature;
  } else if (selectedWalletId === 'near-mobile-wallet') {
    const keyPair = getNearMobileWalletKeyPairObject();
    signature = keyPair?.sign(Buffer.from(message))?.signature;
  } else if (selectedWalletId === 'keypom') {
    const keyStore = new keyStores.BrowserLocalStorageKeyStore(
      undefined,
      'keypom:'
    );
    const keyPair = await keyStore.getKey(getConfig().networkId, accountId);
    signature = keyPair?.sign(Buffer.from(message))?.signature;
  } else {
    const keyStore = new keyStores.BrowserLocalStorageKeyStore();
    if (selectedWalletId === 'meteor-wallet') {
      keyPair = KeyPair.fromString(
        localStorage.getItem(
          '_meteor_wallet' + accountId + `:${getConfig().networkId}`
        )
      );
    } else {
      keyPair = await keyStore.getKey(getConfig().networkId, accountId);
    }

    signature = keyPair?.sign(Buffer.from(message))?.signature;
  }

  return Buffer.from(signature ?? '')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export const generateOrderSignature = (message: string) => {
  const msgHash = Buffer.from(keccak256(message)).toString('hex');

  const storedPrivateKey = localStorage.getItem(get_orderly_private_key_path());

  const mapTradingKey = tradingKeyMap.get(get_orderly_private_key_path());

  const priKey = storedPrivateKey || mapTradingKey;

  if (!priKey) {
    alert('Please generate trading key first');
    return null;
  }

  const EC = new ec('secp256k1');

  const keyPair = EC.keyFromPrivate(priKey, 'hex');

  const signature = keyPair.sign(msgHash, 'hex', { canonical: true });
  if (
    signature &&
    signature.r &&
    signature.s &&
    signature.recoveryParam !== undefined
  ) {
    return (
      signature.r.toString('hex', 64) +
      signature.s.toString('hex', 64) +
      '0' +
      signature.recoveryParam
    );
  }
  return '';
};

export const formateParams = (props: object) => {
  const message = Object.entries(props)
    .filter(([k, v], i) => {
      if (typeof v === 'boolean' || typeof v === 'number') return true;

      return v !== undefined && v !== null && !!v;
    })
    .map(([k, v], i) => {
      if (typeof v === 'number') {
        return `${k}=${parseFloat(v.toString())}`;
      }
      return `${k}=${v}`;
    })
    .sort()
    .join('&');

  return message;
};

export const formateParamsNoSorting = (props: object) => {
  const message = Object.entries(props)
    .filter(([k, v], i) => {
      return v !== undefined && v !== null;
    })
    .map(([k, v], i) => {
      if (typeof v === 'number') {
        return `${k}=${parseFloat(v.toString())}`;
      }
      return `${k}=${v}`;
    })
    .join('&');

  return message;
};

export const toReadableNumber = (
  decimals: number,
  number: string = '0'
): string => {
  if (!decimals) return number;

  const wholeStr = number.substring(0, number.length - decimals) || '0';
  const fractionStr = number
    .substring(number.length - decimals)
    .padStart(decimals, '0')
    .substring(0, decimals);

  return `${wholeStr}.${fractionStr}`.replace(/\.?0+$/, '');
};

export const toNonDivisibleNumber = (
  decimals: number,
  number: string
): string => {
  if (decimals === null || decimals === undefined) return number;
  const [wholePart, fracPart = ''] = number.split('.');

  return `${wholePart}${fracPart.padEnd(decimals, '0').slice(0, decimals)}`
    .replace(/^0+/, '')
    .padStart(1, '0');
};

export const getAccountName = (accountId: string) => {
  const [account, network] = accountId.split('.');
  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;

  return account.length > 10 ? niceAccountId : accountId;
};

export function formatTimeDate(ts: number) {
  return moment(ts).format('YYYY-MM-DD HH:mm:ss');
}

export const shortenAddress = (address: string, length = 4) => {
  if (!address) return '';
  const start = address.slice(0, length);
  const end = address.slice(-length);
  return `${start}...${end}`;
};

export function formatDecimalToTwoOrMore(number: number) {
  const decimalCount = (number.toString().split('.')[1] || '').length;

  if (decimalCount < 2) {
    return number.toFixed(2);
  }

  return number.toString();
}
