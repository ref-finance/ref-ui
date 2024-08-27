import { getCurrentWallet } from 'src/utils/wallets-integration';
import { near, wallet } from 'src/services/near';
import getConfig from 'src/services/config';

const { REF_FI_CONTRACT_ID } = getConfig();

export const getShadowRecords = async () => {
  try {
    const result = await wallet
      .account()
      .viewFunction(REF_FI_CONTRACT_ID, 'get_shadow_records', {
        account_id: getCurrentWallet()?.wallet?.getAccountId(),
      });
    return result;
  } catch (e) {
    console.error('getShadowRecordsErr', e);
  }
};
