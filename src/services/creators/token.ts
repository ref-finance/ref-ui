import { ONE_YOCTO_NEAR } from '../near';
import { getCurrentWallet } from '../../utils/wallets-integration';
import { STORAGE_TO_REGISTER_WITH_MFT } from './storage';

interface WithdrawActionOptions {
  tokenId: string;
  amount: string;
  unregister?: boolean;
  singleTx?: boolean;
}
export const withdrawAction = ({
  tokenId,
  amount,
  unregister = false,
  singleTx,
}: WithdrawActionOptions) => ({
  methodName: 'withdraw',
  args: { token_id: tokenId, amount, unregister, skip_unwrap_near: false },
  gas: singleTx ? '60000000000000' : '55000000000000',
  amount: ONE_YOCTO_NEAR,
});

export const registerTokenAction = (tokenId: string) => ({
  methodName: 'register_tokens',
  args: { token_ids: [tokenId] },
  amount: ONE_YOCTO_NEAR,
  gas: '30000000000000',
});

export const registerTokensAction = (tokenIds: string[]) => ({
  methodName: 'register_tokens',
  args: { token_ids: tokenIds },
  amount: ONE_YOCTO_NEAR,
  gas: '30000000000000',
});

export const registerAccountOnToken = () => {
  return {
    methodName: 'storage_deposit',
    args: {
      registration_only: true,
      account_id: getCurrentWallet()?.wallet?.getAccountId(),
    },
    gas: '30000000000000',
    amount: STORAGE_TO_REGISTER_WITH_MFT,
  };
};
