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

export async function getTokenFromTokenId(tokenId: string) {
  checkIsSignedIn();
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
  checkIsSignedIn();
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

export async function getReturn(
  pool_id: number,
  token_in: string,
  token_out: string,
  amount_in: number
) {
  checkIsSignedIn();
  const returnAmt = await window.contract.get_return({
    pool_id,
    token_in,
    token_out,
    amount_in,
  });
  return returnAmt;
}

export async function getPools() {
  checkIsSignedIn();
  const pools = await window.contract.get_pools({
    from_index: 0,
    limit: 200,
  });
  return pools;
}
