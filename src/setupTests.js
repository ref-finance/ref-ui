const { REF_FI_CONTRACT_ID } = require('./services/near');
const { default: SpecialWallet } = require('./services/SpecialWallet');
const { WRAP_NEAR_CONTRACT_ID } = require('./services/wrap-near');

jest.mock('./services/SpecialWallet.ts');

expect.extend({
  toHaveTransaction(received, contractId, actions) {
    const matchedActions = SpecialWallet.transactions.mock.calls.reduce(
      (acc, [calledContractId, calledActions]) => {
        if (calledContractId === contractId) {
          acc.push(
            calledActions.map(({ functionCall }) => ({
              methodName: functionCall.methodName,
              args: JSON.parse(functionCall.args.toString()),
              gas: functionCall.gas.toString(),
              amount: functionCall.deposit.toString(),
            }))
          );
        }
        return acc;
      },
      []
    );

    if (matchedActions.length) expect(matchedActions).toContainEqual(actions);
    else expect(actions).toHaveLength(0);

    return { pass: true };
  },
});

beforeEach(() => {
  SpecialWallet.addView(REF_FI_CONTRACT_ID, 'get_user_whitelisted_tokens', [
    WRAP_NEAR_CONTRACT_ID,
    'nDAI',
    'nWETH',
  ]);

  SpecialWallet.addView(REF_FI_CONTRACT_ID, 'get_deposits', {
    nDAI: '50000000000000000',
    nWETH: '60000000000000000',
  });

  SpecialWallet.addView(REF_FI_CONTRACT_ID, 'get_pool', {
    token_account_ids: ['nDAI', 'nWETH'],
    amounts: ['10000000', '500000000000'],
    total_fee: '30',
    shares_total_supply: '2000000000000000000000000',
  });

  SpecialWallet.addView(REF_FI_CONTRACT_ID, 'get_pool_volumes', [0, 0]);
  SpecialWallet.addView(
    REF_FI_CONTRACT_ID,
    'get_pool_shares',
    '1000000000000000000000000'
  );

  SpecialWallet.addView(WRAP_NEAR_CONTRACT_ID, 'ft_metadata', {
    id: WRAP_NEAR_CONTRACT_ID,
    name: 'wrapped NEAR',
    symbol: 'wNEAR',
    decimals: 24,
  });

  SpecialWallet.addView(
    WRAP_NEAR_CONTRACT_ID,
    'ft_balance_of',
    '100000000000000000000000000'
  );

  SpecialWallet.addView(WRAP_NEAR_CONTRACT_ID, 'storage_balance_of', {
    total: '0',
    available: '0',
  });

  SpecialWallet.addView('nDAI', 'ft_metadata', {
    id: 'nDAI',
    name: 'NEAR wrapped DAI',
    symbol: 'nDAI',
    decimals: 6,
  });

  SpecialWallet.addView('nDAI', 'ft_balance_of', '10000000');

  SpecialWallet.addView('nDAI', 'storage_balance_of', {
    total: '0',
    available: '0',
  });

  SpecialWallet.addView('nWETH', 'ft_metadata', {
    id: 'nWETH',
    name: 'NEAR wrapped ETH',
    symbol: 'nWETH',
    decimals: 10,
  });

  SpecialWallet.addView('nWETH', 'ft_balance_of', '50000000000');

  SpecialWallet.addView('nWETH', 'storage_balance_of', {
    total: '0',
    available: '0',
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
