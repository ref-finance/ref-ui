import {
  getAmount,
  getGas,
  ONE_YOCTO_NEAR,
  REF_AIRDRAOP_CONTRACT_ID,
  REF_FI_CONTRACT_ID,
  wallet,
} from '~services/near';

export interface StatsOptions {
  token_account_id: string;
  skyward_account_id: string;
  claim_expiration_timestamp: string;
  total_balance: number;
  untouched_balance: number;
  total_claimed: number;
}

export interface AccountOptions {
  start_timestamp: string;
  cliff_timestamp: string;
  end_timestamp: string;
  balance: number;
  claimed_balance: number;
}

export const getStats = async (): Promise<StatsOptions> => {
  return wallet
    .account()
    .viewFunction(REF_AIRDRAOP_CONTRACT_ID, 'get_stats', {});
};

export const getAccount = async (): Promise<AccountOptions> => {
  const accountId = wallet.getAccountId();
  return wallet
    .account()
    .viewFunction(REF_AIRDRAOP_CONTRACT_ID, 'get_account', {
      account_id: accountId,
    });
};

export const claim = async () => {
  return wallet
    .account()
    .functionCall(
      REF_AIRDRAOP_CONTRACT_ID,
      'claim',
      '',
      getGas('100000000000000'),
      getAmount(ONE_YOCTO_NEAR)
    );
};
