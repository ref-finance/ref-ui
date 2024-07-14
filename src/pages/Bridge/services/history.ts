import { capitalize } from 'lodash';
import { generateUrl } from '../utils/common';
import request from '../utils/request';
import rainbowBridgeService from './bridge/rainbow';

const bridgeHistoryService = {
  async query(params?: {
    onlyUnclaimed?: boolean;
    hash?: string;
    chain?: string;
    accountAddress: string;
  }) {
    const { accountAddress: account_id, hash, chain } = params;
    const { data } = await request<{
      data: { list?: BridgeModel.BridgeHistory[]; total?: number };
    }>(
      generateUrl(`https://test.api.cclp.finance/v3/bridge/list`, {
        account_id,
        hash,
        chain,
        limit: 1000,
        offset: 0,
      })
    );
    console.log('bridgeHistoryService.query', data);
    data.list = data.list.map(
      (v) =>
        ({
          ...v,
          chain: capitalize(v.chain),
          type: capitalize(v.type),
          from_chain: capitalize(v.from_chain),
          to_chain: capitalize(v.to_chain),
        } as BridgeModel.BridgeHistory)
    );

    // const result = await rainbowBridgeService.query({
    //   filter: (v) => {
    //     if (
    //       !(
    //         v.sender === params.accountAddress ||
    //         v.recipient === params.accountAddress
    //       )
    //     )
    //       return false;
    //     if (params?.onlyUnclaimed) {
    //       if (v.status !== 'action-needed') return false;
    //     }
    //     if (params?.hash) {
    //       return (
    //         ('lockHashes' in v &&
    //           Array.isArray(v.lockHashes) &&
    //           v.lockHashes?.includes(params.hash)) ||
    //         ('unlockHashes' in v &&
    //           Array.isArray(v.unlockHashes) &&
    //           v.unlockHashes?.includes(params.hash)) ||
    //         ('burnHashes' in v &&
    //           Array.isArray(v.burnHashes) &&
    //           v.burnHashes?.includes(params.hash)) ||
    //         ('mintHashes' in v &&
    //           Array.isArray(v.mintHashes) &&
    //           v.mintHashes?.includes(params.hash))
    //       );
    //     }

    //     return true;
    //   },
    // });
    return data;
  },
  async getByHash(hash: string) {
    return rainbowBridgeService.getByHash(hash);
  },
};

export default bridgeHistoryService;
