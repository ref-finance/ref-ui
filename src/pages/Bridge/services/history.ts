export type BridgeTransaction = Partial<{
  id: string;
  from: string;
  to: string;
  amount: number;
  status: string;
  sendingAddress: string;
  receivingAddress: string;
  createdAt: number;
  updatedAt: string;
}>;

const bridgeHistoryService = {
  async query(params?: {
    chain: BridgeModel.BridgeSupportChain;
    onlyUnclaimed: boolean;
  }) {
    console.log('bridgeHistory query', params);
    return [
      {
        id: '1',
        createdAt: Date.now(),
        status: 'success',
        from: 'ETH',
        to: 'BSC',
        sendingAddress: '0x1234567890',
        receivingAddress: '0x0987654321',
        amount: 100,
      },
    ] as BridgeTransaction[];
  },
};

export default bridgeHistoryService;
