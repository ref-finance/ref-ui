import rainbowBridgeService from './rainbowBridge';

const bridgeHistoryService = {
  async query(params?: {
    onlyUnclaimed?: boolean;
    hash?: string;
    accountAddress: string;
  }) {
    const result = await rainbowBridgeService.query({
      filter: (v) => {
        if (
          !(
            v.sender === params.accountAddress ||
            v.recipient === params.accountAddress
          )
        )
          return false;
        if (params?.onlyUnclaimed) {
          if (v.status !== 'action-needed') return false;
        }
        if (params?.hash) {
          return (
            ('lockHashes' in v &&
              Array.isArray(v.lockHashes) &&
              v.lockHashes?.includes(params.hash)) ||
            ('unlockHashes' in v &&
              Array.isArray(v.unlockHashes) &&
              v.unlockHashes?.includes(params.hash)) ||
            ('burnHashes' in v &&
              Array.isArray(v.burnHashes) &&
              v.burnHashes?.includes(params.hash)) ||
            ('mintHashes' in v &&
              Array.isArray(v.mintHashes) &&
              v.mintHashes?.includes(params.hash))
          );
        }

        return true;
      },
    });
    return result;
  },
  async getByHash(hash: string) {
    return rainbowBridgeService.getByHash(hash);
  },
};

export default bridgeHistoryService;
