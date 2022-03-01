import { ONE_YOCTO_NEAR } from '../near';

interface WithdrawActionOptions {
  tokenId: string;
  amount: string;
  unregister?: boolean;
  pos?: number;
}
export const withdrawAction = ({
  tokenId,
  amount,
  unregister = false,
  pos,
}: WithdrawActionOptions) => ({
  methodName: 'withdraw',
  args: { token_id: tokenId, amount, unregister },
  gas: pos === 0 ? '65000000000000' : '55000000000000',
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
