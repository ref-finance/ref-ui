function request(url: string, options?: RequestInit) {
  return fetch(url, options)
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(err);
      return Promise.reject(err);
    });
}

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

export const bridgeHistoryService = {
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
