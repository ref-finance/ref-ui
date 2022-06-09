import Big from 'big.js';
import BigNumber from 'bignumber.js';
import React, { useEffect, useState } from 'react';
import {
  TokenMetadata,
  ftGetTokenMetadata,
  ftGetBalance,
} from '../services/ft-contract';
import { REF_VE_CONTRACT_ID } from '../services/near';
import { toNonDivisibleNumber } from '../utils/numbers';
import { VoteDetail, getAccountInfo } from '../services/referendum';
import { AccountInfo } from '../pages/ReferendumPage';
import {
  getVEConfig,
  getVEMetaData,
  getVoteDetail,
} from '../services/referendum';
import {
  toReadableNumber,
  toPrecision,
  scientificNotationToString,
} from '../utils/numbers';

const minMultiplier = 10000;

export const LOVE_TOKEN_DECIMAL = 18;

export const useMultiplier = ({
  duration,
  maxMultiplier,
  maxDuration,
  amount,
  lockedAmount,
  curDuration,
  curVEAmount,
  loveBalance,
}: {
  duration: number;
  maxMultiplier: number;
  maxDuration: number;
  amount: string;
  lockedAmount: string;
  curDuration: number;
  curVEAmount: string;
  loveBalance: string;
}) => {
  try {
    const appenMultiplier = new Big(duration)
      .times(maxMultiplier - minMultiplier)
      .div(new Big(maxDuration).times(new Big(minMultiplier)))
      .plus(new Big(1));

    const Xappend = appenMultiplier.times(amount);

    const newDuration = duration > curDuration ? duration : curDuration;

    const multiplier = new Big(newDuration)
      .times(maxMultiplier - minMultiplier)
      .div(new Big(maxDuration).times(new Big(minMultiplier)))
      .plus(new Big(1));

    const X = multiplier.times(new Big(lockedAmount));

    const finalX = X.plus(Xappend);

    const finalMultiplier = finalX.div(
      new Big(lockedAmount).plus(new Big(amount))
    );

    const finalVeAmount = toPrecision(
      scientificNotationToString(finalX.toString()),
      0
    );

    const appendVeAmount = toPrecision(
      scientificNotationToString(Xappend.toString()),
      0
    );

    const finalLoveAmount = toPrecision(
      scientificNotationToString(
        finalX
          .minus(new Big(curVEAmount))
          .plus(new Big(toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, loveBalance)))
          .toString()
      ),
      0
    );

    console.log(finalLoveAmount.toString(), 'final love amount');

    return {
      multiplier: finalMultiplier.toNumber(),
      finalAmount: toPrecision(
        toReadableNumber(24, finalVeAmount),
        2,
        false,
        false
      ),
      appendAmount: toPrecision(
        toReadableNumber(24, appendVeAmount),
        2,
        false,
        false
      ),
      finalLoveAmount: toPrecision(
        toReadableNumber(24, finalLoveAmount),
        2,
        false,
        false
      ),
    };
  } catch (error) {}
  return {
    multiplier: 1,
    finalAmount: '0',
    appendAmount: '0',
    finalLoveAmount: '0',
  };
};

export const useLOVEmeta = () => {
  const [meta, setMeta] = useState<TokenMetadata>(null);

  useEffect(() => {
    ftGetTokenMetadata(REF_VE_CONTRACT_ID).then(setMeta);
  }, []);

  return meta;
};

export const useLOVEbalance = () => {
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    ftGetBalance(REF_VE_CONTRACT_ID).then(setBalance);
  }, []);

  return toReadableNumber(LOVE_TOKEN_DECIMAL, balance);
};

export interface VEMETA {
  version: string;
  owner_id: string;
  operators: string[];
  whitelisted_accounts: string[];
  lptoken_contract_id: string;
  lptoken_id: string;
  lptoken_decimals: number;
  account_count: string;
  proposal_count: string;
  cur_total_ve_lpt: string;
  cur_lock_lpt: string;
  lostfound: string;
}

export const useVEmeta = () => {
  const [meta, setMeta] = useState<VEMETA>();

  useEffect(() => {
    getVEMetaData().then(setMeta);
  }, []);

  console.log(meta, 'meta');

  return {
    ...meta,
    totalVE: toReadableNumber(meta?.lptoken_decimals, meta?.cur_total_ve_lpt),
  };
};

export const useVoteDetail = () => {
  const [detail, setDetail] = useState<VoteDetail>();

  useEffect(() => {
    getVoteDetail().then(setDetail);
  }, []);
  return detail;
};

export const useAccountInfo = () => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>();

  const [veShare, setVeShare] = useState<string>('0');

  useEffect(() => {
    getAccountInfo().then((info: AccountInfo) => {
      setAccountInfo(info);

      setVeShare(toReadableNumber(LOVE_TOKEN_DECIMAL, info.ve_lpt_amount));
    });
  }, []);

  return { accountInfo, veShare, veShareRaw: accountInfo?.ve_lpt_amount };
};
