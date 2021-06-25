import getConfig from './config';

const config = getConfig();

export const parseMessage = (methodName: string) => {
  switch (methodName) {
    case 'swap': {
      parseSwap();
      break;
    }
    case 'withdraw': {
      break;
    }
    case 'register_tokens': {
      break;
    }
    case 'add_liquidity': {
      break;
    }
    case 'remove_liquidity': {
      break;
    }
    case 'add_simple_pool': {
      break;
    }
    case 'near_deposit': {
      break;
    }
    case 'near_withdraw': {
      break;
    }
    case 'storage_deposit': {
      break;
    }
  }
};

const parseSwap = () => {};

const parseWithdraw = () => {};

const parseRegisterTokens = () => {};

const parseAddLiquidity = () => {};

const parseRemoveLiquidity = () => {};

const parseAddSimplePool = () => {};

const parseNearDeposit = () => {};

const parseNearWithdraw = () => {};

const parseStorageDeposit = () => {};
