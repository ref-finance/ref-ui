import rainbowBridgeService from './rainbowBridge';

const bridgeHistoryService = {
  async query(params?: {
    chain?: BridgeModel.BridgeSupportChain;
    onlyUnclaimed?: boolean;
    hash?: string;
  }) {
    const result = await rainbowBridgeService.query({
      filter: (v) => {
        if (params?.onlyUnclaimed) {
          if (v.status !== 'action-needed') return false;
        }
        if (params?.hash) {
          return (
            v.lockHashes.includes(params.hash) ||
            v.unlockHashes.includes(params.hash) ||
            v.burnHashes.includes(params.hash) ||
            v.mintHashes.includes(params.hash)
          );
        }
        return true;
      },
    });
    return result;
  },
};

export default bridgeHistoryService;
