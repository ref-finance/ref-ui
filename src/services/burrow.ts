import Big from 'big.js';
import {
  wallet,
  executeMultipleTransactions,
  Transaction,
  ONE_YOCTO_NEAR,
} from './near';
import {
  ftGetTokenMetadata,
  TokenMetadata,
  ftGetStorageBalance,
} from '~services/ft-contract';
import getConfig from './config';
const { BURROW_CONTRACT_ID, WRAP_NEAR_CONTRACT_ID } = getConfig();
import { getCurrentWallet, WalletContext } from '../utils/wallets-integration';
import { useWalletSelector } from 'context/WalletSelectorContext';
import {
  shrinkToken,
  expandToken,
  sumReducer,
  toUsd,
  decimalMax,
} from './burrow-utils';
import {
  IAccount,
  IAsset,
  INetTvlFarm,
  IAssetRewardDetail,
  IBurrowConfig,
  IRepayWay,
} from './burrow-interfaces';
import { getNetLiquidityAPY } from './burrow-business';
const NO_STORAGE_DEPOSIT_CONTRACTS = ['aurora'];

export async function getAssets() {
  const assets = await burrowViewFunction({ methodName: 'get_assets_paged' });
  const tokenIds = assets?.map(([id]: [string, any]) => id);
  const assetsDetailedRequest = tokenIds.map(async (token_id: string) =>
    burrowViewFunction({
      methodName: 'get_asset',
      args: {
        token_id,
      },
    })
  );
  const assetsDetailed = await Promise.all(assetsDetailedRequest);
  const tokensMetadataRequest = tokenIds.map(async (id: string) =>
    ftGetTokenMetadata(id)
  );
  const tokensMetadata = await Promise.all(tokensMetadataRequest);
  const config = await burrowViewFunction({ methodName: 'get_config' });
  const prices = await wallet
    .account()
    .viewFunction(config?.['oracle_account_id'], 'get_price_data');
  const refPrices = await fetch(
    'https://raw.githubusercontent.com/NearDeFi/token-prices/main/ref-prices.json'
  ).then((r) => r.json());
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  const balances = accountId
    ? await Promise.all(
        tokenIds.map((token_id: string) =>
          wallet
            .account()
            .viewFunction(token_id, 'ft_balance_of', { account_id: accountId })
        )
      )
    : undefined;
  return assetsDetailed?.map((asset, i) => {
    const price = prices?.prices?.find(
      (p: any) => p.asset_id === asset?.token_id
    );
    const usd =
      Number(price?.price?.multiplier) /
      10 ** (price?.price?.decimals - tokensMetadata?.[i].decimals);
    const temp_temp = Big(asset.supplied.balance)
      .plus(Big(asset.reserved))
      .minus(Big(asset.borrowed.balance));
    const temp = temp_temp.minus(temp_temp.mul(0.001));
    const decimals = tokensMetadata?.[i].decimals + asset.config.extra_decimals;
    const availableLiquidity = Number(shrinkToken(temp.toFixed(0), decimals));
    const extraPrice = price?.price || {
      decimals: Number(refPrices?.[asset.token_id]?.decimal),
      multiplier: '1',
    };
    return {
      ...asset,
      metadata: tokensMetadata?.[i],
      accountBalance: accountId ? balances?.[i] : undefined,
      availableLiquidity,
      price: {
        ...extraPrice,
        usd: usd || parseFloat(refPrices?.[asset.token_id]?.price),
      },
    };
  });
}
export async function getAccount() {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  return await burrowViewFunction({
    methodName: 'get_account',
    args: {
      account_id: accountId,
    },
  });
}
export async function getRewards(account: IAccount, assets: IAsset[]) {
  const netLiquidityFarm = (await getFarm('NetTvl')) as INetTvlFarm;
  const [apyRewardTvl, rewardTokensTVL] = getNetLiquidityAPY(
    netLiquidityFarm,
    account,
    assets
  ) as [number, string[]];
  const rewards = assets.map((asset: IAsset) => {
    const apyBase = Number(asset['supply_apr']) * 100;
    const apyBaseBorrow = Number(asset['borrow_apr']) * 100;
    const tokenId = asset.token_id;
    const totalSupplyUsd = toUsd(asset.supplied.balance, asset);
    const totalBorrowUsd = toUsd(asset.borrowed.balance, asset);

    const suppliedFarmRewards =
      asset.farms.find((farm) => farm.farm_id.Supplied === tokenId)?.rewards ||
      {};

    const rewardTokens = [
      ...new Set(
        Object.entries(suppliedFarmRewards)
          .map(([rewardTokenId]) => rewardTokenId)
          .concat(rewardTokensTVL)
      ),
    ];

    const apyRewards = Object.entries(suppliedFarmRewards).map(
      ([rewardTokenId, reward]) => {
        const rewardAsset = assets.find((a) => a.token_id === rewardTokenId);
        const decimals =
          rewardAsset.metadata.decimals + rewardAsset.config.extra_decimals;
        const price = rewardAsset.price?.usd || 0;
        if (!totalSupplyUsd) return 0;
        return (
          new Big(reward.reward_per_day)
            .div(new Big(10).pow(decimals || 0))
            .mul(365)
            .mul(price)
            .div(totalSupplyUsd)
            .mul(100)
            .toNumber() || 0
        );
      }
    );

    const apyReward = apyRewards.reduce(sumReducer, 0);

    const borrowedFarmRewards =
      asset.farms.find((farm) => farm.farm_id.Borrowed === tokenId)?.rewards ||
      {};

    const rewardTokensBorrow = Object.entries(borrowedFarmRewards).map(
      ([rewardTokenId]) => rewardTokenId
    );

    const apyRewardBorrow = Object.entries(borrowedFarmRewards)
      .map(([rewardTokenId, reward]) => {
        const rewardAsset = assets.find((a) => a.token_id === rewardTokenId);
        const decimals =
          rewardAsset.metadata.decimals + rewardAsset.config.extra_decimals;
        const price = rewardAsset.price?.usd || 0;

        if (!totalBorrowUsd) return 0;

        return (
          new Big(reward.reward_per_day)
            .div(new Big(10).pow(decimals || 0))
            .mul(365)
            .mul(price)
            .div(totalBorrowUsd)
            .mul(100)
            .toNumber() || 0
        );
      })
      .reduce(sumReducer, 0);

    return {
      token_id: asset.token_id,
      symbol: asset.metadata.symbol,
      tvlUsd: totalSupplyUsd - totalBorrowUsd,
      apyReward,
      apyRewardTvl: apyRewardTvl || 0,
      apyBase,
      rewardTokens,
      totalSupplyUsd,
      totalBorrowUsd,
      apyBaseBorrow,
      apyRewardBorrow,
      rewardTokensBorrow,
      ltv: asset.config.volatility_ratio,
    } as IAssetRewardDetail;
  });

  return rewards;
}
export async function getFarm(farm_id: string) {
  return await burrowViewFunction({
    methodName: 'get_asset_farm',
    args: {
      farm_id,
    },
  });
}
export async function getFarms() {
  return await burrowViewFunction({
    methodName: 'get_asset_farms_all',
  });
}
export function accountFarmClaimAll() {
  const transactions: Transaction[] = [];
  transactions.push({
    receiverId: BURROW_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'account_farm_claim_all',
        args: {},
      },
    ],
  });
  return executeBurrowMultipleTransactions(transactions);
}
export const burrowViewFunction = ({
  methodName,
  args,
}: {
  methodName: string;
  args?: object;
}) => {
  return wallet.account().viewFunction(BURROW_CONTRACT_ID, methodName, args);
};
export const executeBurrowMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  return executeMultipleTransactions(transactions, callbackUrl);
};
export async function getGlobalConfig() {
  return await burrowViewFunction({ methodName: 'get_config' });
}
export async function submitAdjust({
  account,
  asset,
  isMax,
  amount,
  availableBalance,
  setShowModalBox,
  globalConfig,
}: {
  account: IAccount;
  asset: IAsset;
  isMax: boolean;
  amount: string;
  availableBalance: string;
  setShowModalBox: Function;
  globalConfig: IBurrowConfig;
}) {
  const { token_id, metadata, config } = asset;
  const decimals = metadata.decimals + config.extra_decimals;
  const expandedAmount = isMax
    ? Big(expandToken(availableBalance, decimals))
    : Big(expandToken(amount, decimals));
  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const collateralBalance = accountCollateralAsset?.balance || 0;
  const transactions: Transaction[] = [];
  if (expandedAmount.gt(collateralBalance)) {
    transactions.push({
      receiverId: BURROW_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'execute',
          args: {
            actions: [
              {
                IncreaseCollateral: {
                  token_id,
                  max_amount: !isMax
                    ? expandedAmount.sub(collateralBalance).toFixed(0)
                    : undefined,
                },
              },
            ],
          },
          gas: expandToken(100, 12),
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  } else if (expandedAmount.lt(collateralBalance)) {
    transactions.push({
      receiverId: globalConfig.oracle_account_id,
      functionCalls: [
        {
          methodName: 'oracle_call',
          args: {
            receiver_id: BURROW_CONTRACT_ID,
            msg: JSON.stringify({
              Execute: {
                actions: [
                  {
                    DecreaseCollateral: {
                      token_id,
                      max_amount: expandedAmount.gt(0)
                        ? Big(collateralBalance).sub(expandedAmount).toFixed(0)
                        : undefined,
                    },
                  },
                ],
              },
            }),
          },
          gas: expandToken(100, 12),
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  } else {
    setShowModalBox(false);
    return;
  }
  return executeBurrowMultipleTransactions(transactions);
}

export async function submitSupply({
  asset,
  isMax,
  amount,
  availableBalance,
  switchStatus,
}: {
  asset: IAsset;
  isMax: boolean;
  amount: string;
  availableBalance: string;
  switchStatus: boolean;
}) {
  const amountValue = isMax ? availableBalance : amount;
  const { token_id, metadata, config } = asset;
  if (token_id === WRAP_NEAR_CONTRACT_ID) {
    handleDepositNear(asset, amount, switchStatus);
    return;
  }
  const transactions: Transaction[] = [];
  const expandedAmount = Big(expandToken(amountValue, metadata.decimals));
  const collateralAmount = Big(
    expandToken(amountValue, metadata.decimals + config.extra_decimals)
  ).toFixed(0);
  const collateralMsg =
    config.can_use_as_collateral && switchStatus
      ? `{"Execute":{"actions":[{"IncreaseCollateral":{"token_id": "${token_id}","max_amount":"${collateralAmount}"}}]}}`
      : '';
  transactions.push({
    receiverId: token_id,
    functionCalls: [
      {
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: BURROW_CONTRACT_ID,
          amount: expandedAmount.toFixed(0),
          msg: collateralMsg,
        },
        gas: expandToken(100, 12),
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });
  const storageBurrow = await ftGetStorageBalance(BURROW_CONTRACT_ID);
  if (storageBurrow?.available === '0' || !storageBurrow?.available) {
    transactions.unshift({
      receiverId: BURROW_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {},
          gas: expandToken(140, 12),
          amount: '0.25',
        },
      ],
    });
  }
  return executeBurrowMultipleTransactions(transactions);
}
const handleDepositNear = async (
  asset: IAsset,
  amount: string,
  switchStatus: boolean
) => {
  const { token_id } = asset;
  const transactions: Transaction[] = [];
  const expandedAmount = expandToken(amount, 24);
  const amountDecimal = Big(expandedAmount);
  const extraDecimal = Big(expandedAmount).sub(asset.accountBalance || 0);
  transactions.push(
    ...(extraDecimal.gt(0)
      ? [
          {
            receiverId: token_id,
            functionCalls: [
              {
                methodName: 'near_deposit',
                args: {},
                gas: expandToken(100, 12),
                amount: shrinkToken(extraDecimal.toFixed(), 24),
              },
            ],
          },
        ]
      : [])
  );
  transactions.push({
    receiverId: WRAP_NEAR_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: BURROW_CONTRACT_ID,
          amount: amountDecimal.toFixed(0),
          msg: switchStatus
            ? `{"Execute":{"actions":[{"IncreaseCollateral":{"token_id":"wrap.near","max_amount":"${amountDecimal.toFixed(
                0
              )}"}}]}}`
            : '',
        },
        gas: expandToken(100, 12),
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });
  const storageToken = await ftGetStorageBalance(token_id);
  if (
    !(storageToken && storageToken.total != '0') &&
    !NO_STORAGE_DEPOSIT_CONTRACTS.includes(token_id)
  ) {
    transactions.unshift({
      receiverId: token_id,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {
            registration_only: true,
            account_id: getCurrentWallet()?.wallet?.getAccountId(),
          },
          gas: expandToken(100, 12),
          amount: '0.1',
        },
      ],
    });
  }
  const storageBurrow = await ftGetStorageBalance(BURROW_CONTRACT_ID);
  if (storageBurrow?.available === '0' || !storageBurrow?.available) {
    transactions.unshift({
      receiverId: BURROW_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {},
          gas: expandToken(140, 12),
          amount: '0.25',
        },
      ],
    });
  }

  return executeBurrowMultipleTransactions(transactions);
};

export async function submitWithdraw({
  account,
  asset,
  isMax,
  amount,
  availableBalance,
  globalConfig,
}: {
  account: IAccount;
  asset: IAsset;
  isMax: boolean;
  amount: string;
  availableBalance: string;
  globalConfig: IBurrowConfig;
}) {
  const { token_id, metadata, config } = asset;
  const decimals = metadata.decimals + config.extra_decimals;
  const expandedAmount = Big(
    expandToken(isMax ? availableBalance : amount, decimals)
  );
  const accountSuppliedAsset = account.supplied.find(
    (a) => a.token_id === token_id
  );
  const suppliedBalance = accountSuppliedAsset?.balance || 0;
  const decreaseCollateralAmount = decimalMax(
    expandedAmount.sub(suppliedBalance).toFixed(),
    0
  );
  const withdrawAction = {
    Withdraw: {
      token_id,
      max_amount: !isMax ? expandedAmount.toFixed(0) : undefined,
    },
  };
  const transactions: Transaction[] = [];
  if (decreaseCollateralAmount.gt(0)) {
    transactions.push({
      receiverId: globalConfig.oracle_account_id,
      functionCalls: [
        {
          methodName: 'oracle_call',
          args: {
            receiver_id: BURROW_CONTRACT_ID,
            msg: JSON.stringify({
              Execute: {
                actions: [
                  {
                    DecreaseCollateral: {
                      token_id,
                      amount: decreaseCollateralAmount.toFixed(0),
                    },
                  },
                  withdrawAction,
                ],
              },
            }),
          },
          gas: expandToken(100, 12),
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  } else {
    transactions.push({
      receiverId: globalConfig.oracle_account_id,
      functionCalls: [
        {
          methodName: 'oracle_call',
          args: {
            receiver_id: BURROW_CONTRACT_ID,
            msg: JSON.stringify({
              Execute: { actions: [withdrawAction] },
            }),
          },
          gas: expandToken(100, 12),
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }
  const isNEAR = token_id == WRAP_NEAR_CONTRACT_ID;
  if (isNEAR && expandedAmount.gt(10)) {
    transactions.push({
      receiverId: token_id,
      functionCalls: [
        {
          methodName: 'near_withdraw',
          args: {
            amount: expandedAmount.sub(10).toFixed(0),
          },
          gas: expandToken(100, 12),
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }
  const storageToken = await ftGetStorageBalance(token_id);
  if (
    !(storageToken && storageToken.total != '0') &&
    !NO_STORAGE_DEPOSIT_CONTRACTS.includes(token_id)
  ) {
    transactions.unshift({
      receiverId: token_id,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {
            registration_only: true,
            account_id: getCurrentWallet()?.wallet?.getAccountId(),
          },
          gas: expandToken(100, 12),
          amount: '0.1',
        },
      ],
    });
  }
  return executeBurrowMultipleTransactions(transactions);
}

export async function submitRepay({
  account,
  asset,
  isMax,
  amount,
  availableBalance,
  repayWay,
  globalConfig,
}: {
  account: IAccount;
  asset: IAsset;
  isMax: boolean;
  amount: string;
  availableBalance: string;
  repayWay: IRepayWay;
  globalConfig: IBurrowConfig;
}) {
  if (repayWay == 'wallet') {
    repay_from_wallet({
      asset,
      isMax,
      amount,
      availableBalance,
    });
  } else if (repayWay == 'deposit') {
    repay_from_deposit({
      account,
      asset,
      isMax,
      amount,
      availableBalance,
      globalConfig,
    });
  }
}
async function repay_from_wallet({
  asset,
  isMax,
  amount,
  availableBalance,
}: {
  asset: IAsset;
  isMax: boolean;
  amount: string;
  availableBalance: string;
}) {
  const { token_id, metadata, config } = asset;
  const finalAmount = isMax ? availableBalance : amount;
  const expandedAmount = Big(
    expandToken(
      finalAmount,
      asset.metadata.decimals + asset.config.extra_decimals
    )
  );
  const repayTemplate = {
    Execute: {
      actions: [
        {
          Repay: {
            max_amount: !isMax ? expandedAmount.toFixed(0, 0) : undefined,
            token_id: token_id,
          },
        },
      ],
    },
  };
  const transactions: Transaction[] = [];
  if (
    token_id == WRAP_NEAR_CONTRACT_ID &&
    expandedAmount.gt(asset.accountBalance || 0)
  ) {
    const toWrapAmount = expandedAmount.sub(asset.accountBalance || 0);
    const storageToken = await ftGetStorageBalance(token_id);
    if (
      !(storageToken && storageToken.total != '0') &&
      !NO_STORAGE_DEPOSIT_CONTRACTS.includes(token_id)
    ) {
      transactions.unshift({
        receiverId: token_id,
        functionCalls: [
          {
            methodName: 'storage_deposit',
            args: {
              registration_only: true,
              account_id: getCurrentWallet()?.wallet?.getAccountId(),
            },
            gas: expandToken(100, 12),
            amount: '0.1',
          },
        ],
      });
    }
    transactions.push({
      receiverId: token_id,
      functionCalls: [
        {
          methodName: 'near_deposit',
          args: {},
          gas: expandToken(100, 12),
          amount: shrinkToken(toWrapAmount.toFixed(), 24),
        },
      ],
    });
  }
  transactions.push({
    receiverId: token_id,
    functionCalls: [
      {
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: BURROW_CONTRACT_ID,
          amount: expandToken(finalAmount, metadata.decimals),
          msg: JSON.stringify(repayTemplate),
        },
        gas: expandToken(100, 12),
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });
  const storageBurrow = await ftGetStorageBalance(BURROW_CONTRACT_ID);
  if (storageBurrow?.available === '0' || !storageBurrow?.available) {
    transactions.unshift({
      receiverId: BURROW_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {},
          gas: expandToken(140, 12),
          amount: '0.25',
        },
      ],
    });
  }
  return executeBurrowMultipleTransactions(transactions);
}
async function repay_from_deposit({
  account,
  asset,
  isMax,
  amount,
  availableBalance,
  globalConfig,
}: {
  account: IAccount;
  asset: IAsset;
  isMax: boolean;
  amount: string;
  availableBalance: string;
  globalConfig: IBurrowConfig;
}) {
  const { token_id, metadata, config } = asset;
  const decimals = metadata.decimals + config.extra_decimals;
  const expandedAmount = Big(
    expandToken(isMax ? availableBalance : amount, decimals)
  );
  const accountSuppliedAsset = account.supplied.find(
    (a) => a.token_id === token_id
  );
  const suppliedBalance = accountSuppliedAsset?.balance || 0;
  const decreaseCollateralAmount = decimalMax(
    expandedAmount.sub(suppliedBalance).toFixed(),
    0
  );
  const transactions: Transaction[] = [];
  const RepayTemplate = {
    Execute: {
      actions: [
        ...(decreaseCollateralAmount.gt(0)
          ? [
              {
                DecreaseCollateral: {
                  token_id,
                  amount: decreaseCollateralAmount.toFixed(0),
                },
              },
            ]
          : []),
        {
          Repay: {
            token_id,
            amount: isMax ? undefined : expandedAmount.toFixed(0),
          },
        },
      ],
    },
  };
  transactions.push({
    receiverId: globalConfig.oracle_account_id,
    functionCalls: [
      {
        methodName: 'oracle_call',
        args: {
          receiver_id: BURROW_CONTRACT_ID,
          msg: JSON.stringify(RepayTemplate),
        },
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });
  return executeBurrowMultipleTransactions(transactions);
}

export async function submitBorrow({
  asset,
  isMax,
  amount,
  availableBalance,
  globalConfig,
}: {
  asset: IAsset;
  isMax: boolean;
  amount: string;
  availableBalance: string;
  globalConfig: IBurrowConfig;
}) {
  const { token_id, metadata, config } = asset;
  const finalAmount = isMax
    ? decimalMax(availableBalance, amount).toFixed()
    : amount;
  const transactions: Transaction[] = [];
  const expandedAmount = Big(
    expandToken(
      finalAmount,
      asset.metadata.decimals + asset.config.extra_decimals
    )
  );

  const borrowTemplate = {
    Execute: {
      actions: [
        {
          Borrow: {
            token_id,
            amount: expandedAmount.toFixed(0),
          },
        },
        {
          Withdraw: {
            token_id,
            max_amount: expandedAmount.toFixed(0),
          },
        },
      ],
    },
  };
  transactions.push({
    receiverId: globalConfig.oracle_account_id,
    functionCalls: [
      {
        methodName: 'oracle_call',
        args: {
          receiver_id: BURROW_CONTRACT_ID,
          msg: JSON.stringify(borrowTemplate),
        },
        gas: expandToken(100, 12),
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });
  const storageToken = await ftGetStorageBalance(token_id);
  const storageBurrow = await ftGetStorageBalance(BURROW_CONTRACT_ID);
  if (
    !(storageToken && storageToken.total != '0') &&
    !NO_STORAGE_DEPOSIT_CONTRACTS.includes(token_id)
  ) {
    transactions.unshift({
      receiverId: token_id,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {
            registration_only: true,
            account_id: getCurrentWallet()?.wallet?.getAccountId(),
          },
          gas: expandToken(100, 12),
          amount: '0.1',
        },
      ],
    });
  }

  if (storageBurrow?.available === '0' || !storageBurrow?.available) {
    transactions.unshift({
      receiverId: BURROW_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {},
          gas: expandToken(100, 12),
          amount: '0.25',
        },
      ],
    });
  }
  if (token_id == WRAP_NEAR_CONTRACT_ID && expandedAmount.gt(10)) {
    transactions.push({
      receiverId: token_id,
      functionCalls: [
        {
          methodName: 'near_withdraw',
          args: {
            amount: expandedAmount.sub(10).toFixed(0),
          },
          gas: expandToken(100, 12),
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }

  return executeBurrowMultipleTransactions(transactions);
}
