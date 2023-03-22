import Big from 'big.js';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useState } from 'react';
import {
  TokenMetadata,
  ftGetTokenMetadata,
  ftGetBalance,
} from '../services/ft-contract';
import { REF_VE_CONTRACT_ID } from '../services/near';
import { toNonDivisibleNumber, ONLY_ZEROS } from '../utils/numbers';
import {
  VoteDetail,
  getVoteDetailHistory,
  getUnclaimedRewards,
} from '../services/referendum';
import { AccountInfo } from '../pages/ReferendumPage';
import { WalletContext } from '../utils/wallets-integration';
import {
  getUnclaimedProposal,
  VEConfig,
  getAccountInfo,
} from '../services/referendum';
import { useDepositableBalance } from './token';
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
import moment from 'moment';
import { durationFomatter } from '../components/layout/Proposal';
import { ProposalStatus } from '../services/referendum';

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
          .minus(new Big(curVEAmount).times(1000000))
          .plus(
            new Big(
              toNonDivisibleNumber(LOVE_TOKEN_DECIMAL, loveBalance)
            ).times(1000000)
          )
          .toString()
      ),
      0
    );

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
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    if (!isSignedIn) return;

    ftGetBalance(REF_VE_CONTRACT_ID).then(setBalance);
  }, [isSignedIn]);

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
  whitelisted_incentive_tokens: string[];
}

export const useVEconfig = () => {
  const [config, setConfig] = useState<VEConfig>();

  useEffect(() => {
    getVEConfig().then(setConfig);
  }, []);
  return config;
};

export const useVEmeta = () => {
  const [meta, setMeta] = useState<VEMETA>();

  useEffect(() => {
    getVEMetaData().then(setMeta);
  }, []);

  return {
    ...meta,
    totalVE: toReadableNumber(LOVE_TOKEN_DECIMAL, meta?.cur_total_ve_lpt),
  };
};

export const useVoteDetail = () => {
  const [detail, setDetail] = useState<VoteDetail>();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (!isSignedIn) return;
    getVoteDetail().then(setDetail);
  }, [isSignedIn]);
  return detail;
};

export const useVoteDetailHisroty = () => {
  const [detailHistory, setDetailHistory] = useState<VoteDetail>();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (!isSignedIn) return;

    getVoteDetailHistory().then(setDetailHistory);
  }, [isSignedIn]);

  return detailHistory;
};

export const useAccountInfo = () => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>();

  const [veShare, setVeShare] = useState<string>('0');
  const [accountInfoDone, setAccountInfoDone] = useState<boolean>(false);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (!isSignedIn) return;
    getAccountInfo().then((info: AccountInfo) => {
      setAccountInfo(info);

      setVeShare(
        toReadableNumber(LOVE_TOKEN_DECIMAL, info?.ve_lpt_amount || '0')
      );
      setAccountInfoDone(true);
    });
  }, [isSignedIn]);

  return {
    accountInfo,
    veShare,
    veShareRaw: accountInfo?.ve_lpt_amount || '0',
    lptAmount: accountInfo?.lpt_amount || '0',
    fetchDoneVOTEAccountInfo: !!accountInfo,
    accountInfoDone,
  };
};

export interface UnclaimedProposal {
  [proposal_id: string]: {
    action: any;
    amount: string;
  };
}

export const useUnclaimedProposal = (status?: ProposalStatus) => {
  const [record, setRecord] = useState<UnclaimedProposal>();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (!isSignedIn) return;

    getUnclaimedProposal().then(setRecord);
  }, [isSignedIn, status]);

  return record;
};

export const useUnClaimedRewardsVE = () => {
  const [rewards, setReward] =
    useState<{ tokenId: string; amount: string }[]>();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (!isSignedIn) return;
    getAccountInfo()
      .then((info: AccountInfo) => {
        return info.rewards.map((r) => {
          return {
            tokenId: r[0],
            amount: r[1],
          };
        });
      })
      .then(setReward);
  }, [isSignedIn]);

  return rewards?.filter((r) => !ONLY_ZEROS.test(r.amount));
};

export const useCounterDownVE = ({
  setCounterDownStirng,
  base,
  id,
  setStatus,
  status,
}: {
  setCounterDownStirng: (s: string) => void;
  base: number;
  id: number | undefined;
  setStatus?: (status?: ProposalStatus) => void;
  status?: ProposalStatus;
}) => {
  const interval = 60 * 1000;

  useEffect(() => {
    let timer = setInterval(() => {
      const duration = moment.duration(base - moment().unix(), 'seconds');

      const durationDisplay = moment.duration(
        base + 60 - moment().unix(),
        'seconds'
      );

      if (duration.asSeconds() < 0) {
        setCounterDownStirng('0d: 0h: 0m');
        if (status === 'WarmUp') {
          setStatus('InProgress');
        } else if (status === 'InProgress') {
          setStatus('Expired');
        }
      } else {
        setCounterDownStirng(durationFomatter(durationDisplay));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [base, id]);
};
