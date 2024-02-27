import { getOrderlyConfig } from '../config';

// export const getOrderlyWss = () =>
//   `${getOrderlyConfig().ORDERLY_WS_ENDPOINT}/${
//     !!window.selector && window.selector.isSignedIn() ? window.selectorAccountId : 'OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY'
//   }`;

export const getOrderlyWss = (accountValid: boolean) =>
  `${getOrderlyConfig().ORDERLY_WS_ENDPOINT}/${
    accountValid
      ? window.selectorAccountId
      : 'OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY'
  }`;

export const constOrderlyPageSize = 10;
