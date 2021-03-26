import { Contract } from "near-api-js";
import {
  formatNearAmount,
  parseNearAmount,
} from "near-api-js/lib/utils/format";

import QuestionMark from "~assets/images/question.png";

const env = process.env.NODE_ENV || "development";

function checkIsSignedIn() {
  if (!window.accountId) {
    throw new Error("Not signed in");
  }
}

export async function getStorageBalance() {
  if (!window.accountId) {
    return { total: 0, available: 0 };
  }

  const storageBalance = await window.contract.storage_balance_of({
    account_id: window.accountId,
  });

  return storageBalance;
}

export async function getTokenFromTokenId(tokenId: string) {
  try {
    const newContract = await new Contract(
      window.walletConnection.account(),
      tokenId,
      { viewMethods: ["ft_metadata"] }
    );
    const resp = await newContract.ft_metadata();
    resp.id = tokenId;
    return resp;
  } catch {
    if (env === "development") {
      // In case ft_metadata not implemented on testnet, like the test tokens.
      const resp = {
        id: tokenId,
        version: "",
        name: tokenId,
        symbol: tokenId,
        icon: QuestionMark,
        reference: "",
        reference_hash: "",
        decimals: 6,
      };
      return resp;
    }
    return null;
  }
}

export async function getDeposits() {
  const deposits = await window.contract.get_deposits({
    account_id: window.accountId,
  });

  return deposits;
}

export async function withdrawToken(tokenId: string, amount: number) {
  await window.contract.withdraw(
    {
      token_id: tokenId,
      amount: amount.toString(),
    },
    "50000000000000",
    "1"
  );
}

async function addToPool() {
  const poolContract = await new Contract(
    window.walletConnection.account(),
    window.contractName,
    {
      viewMethods: ["storage_available"],
      changeMethods: ["ft_transfer_call", "storage_deposit"],
    }
  );

  poolContract.storage_deposit({}, null, parseNearAmount("5"));
}

export async function depositToken(tokenId: string, amount: number) {
  checkIsSignedIn();
  const tokenContract = await new Contract(
    window.walletConnection.account(),
    tokenId,
    {
      viewMethods: [],
      changeMethods: ["ft_transfer_call"],
    }
  );

  await tokenContract.ft_transfer_call(
    {
      receiver_id: window.contractName,
      amount: amount.toString(),
      msg: "",
    },
    "50000000000000",
    "1"
  );
}

export async function addLiquidity(pool_id, amounts) {
  await window.contract.add_liquidity(
    {
      pool_id,
      amounts,
    },
    "50000000000000",
    "1"
  );
}

export async function removeLiquidity(pool_id: number, shares: number) {
  await window.contract.remove_liquidity(
    {
      pool_id,
      shares,
      min_amounts: [shares],
    },
    "50000000000000",
    "1"
  );
}

export async function swapToken(
  pool_id: number,
  token_in: string,
  amount_in: number,
  token_out: string,
  min_amount_out: number
) {
  checkIsSignedIn();

  const swapAction = {
    pool_id,
    token_in,
    amount_in,
    token_out,
    min_amount_out,
  };

  await window.contract.swap(
    {
      actions: [swapAction],
    },
    "50000000000000",
    "1"
  );
}

export async function getReturn(
  pool_id: number,
  token_in: string,
  token_out: string,
  amount_in: number
) {
  const returnAmt = await window.contract.get_return({
    pool_id,
    token_in,
    token_out,
    amount_in,
  });
  return returnAmt;
}

export async function getPools() {
  const pools = await window.contract.get_pools({
    from_index: 0,
    limit: 200,
  });
  return pools;
}

export async function getPoolShares(pool_id: number) {
  if (!window.accountId) {
    return 0;
  }

  const poolShares = await window.contract.get_pool_shares({
    pool_id,
    account_id: window.accountId,
  });
  return poolShares;
}
