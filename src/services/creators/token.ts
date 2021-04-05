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
  amount: ONE_YOCTO_NEAR,
});
