declare namespace BridgeModel {
  type BridgeSupportChain = 'ETH' | 'NEAR';
  type BridgeTransaction = {
    chain: BridgeSupportChain;
    amount?: number;
    token?: string;
    isCustomToken?: boolean;
    customTokenAddress?: string;
  };
}
