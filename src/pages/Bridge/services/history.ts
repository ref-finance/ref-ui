import { generateUrl } from '../utils/common';
import request from '../utils/request';
import { BridgeTokenRoutes } from '../config';
import Big from 'big.js';

type QueryParams = {
  onlyUnclaimed?: boolean;
  hash?: string;
  chain?: BridgeModel.BridgeSupportChain;
  accountAddress: string;
};

const bridgeHistoryService = {
  async query(params: QueryParams) {
    const { accountAddress: account_id, hash, chain } = params;
    const { data } = await request<{
      data: { list?: BridgeModel.BridgeHistory[]; total?: number };
    }>(
      generateUrl(`https://test.api.cclp.finance/v3/bridge/list`, {
        account_id,
        tx_hash: hash,
        chain: chain === 'NEAR' ? 'aurora' : chain.toLowerCase(),
        limit: 1000,
        offset: 0,
      })
    );
    data.list.forEach((v) => {
      const from =
        v.from_chain.toLowerCase() === 'aurora'
          ? 'near'
          : v.from_chain.toLowerCase();
      const to =
        v.to_chain.toLowerCase() === 'aurora'
          ? 'near'
          : v.to_chain.toLowerCase();
      const protocolFeeRatio = BridgeTokenRoutes.find(
        (item) =>
          item.from.toLowerCase() === from && item.to.toLowerCase() === to
      )?.protocolFeeRatio;
      v.protocolFeeRatio = protocolFeeRatio;
      v.amount = new Big(v.volume)
        .times(new Big(1).minus(protocolFeeRatio))
        .toFixed(0, Big.roundDown);
    });

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
  async queryByHash(params: QueryParams) {
    const res = await bridgeHistoryService.query(params);
    return res?.list?.[0];
  },
};

export default bridgeHistoryService;
