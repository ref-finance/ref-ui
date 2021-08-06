import { ONE_YOCTO_NEAR } from '../near';

interface WithdrawActionOptions {
  tokenId: string;
  amount: string;
  unregister?: boolean;
}
export const withdrawAction = ({
  tokenId,
  amount,
  unregister = false,
}: WithdrawActionOptions) => ({
  methodName: 'withdraw',
  args: { token_id: tokenId, amount, unregister },
  gas: '100000000000000',
  amount: ONE_YOCTO_NEAR,
});

export const registerTokenAction = (tokenId: string) => ({
  methodName: 'register_tokens',
  args: { token_ids: [tokenId] },
  // amount: ONE_YOCTO_NEAR,
});
