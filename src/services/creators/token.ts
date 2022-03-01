import { ONE_YOCTO_NEAR } from '../near';

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
  args: { token_id: tokenId, amount, unregister },
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
