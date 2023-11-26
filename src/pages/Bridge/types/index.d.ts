declare namespace BridgeModel {
  type BridgeSupportChain = 'ETH' | 'NEAR';
  type BridgeTokenMeta = {
    chain: BridgeModel.BridgeSupportChain;
    symbol: string;
    name: string;
    decimals: number;
    icon: string;
    address: string;
  };
  type BridgeTransaction = {
    from: BridgeTranSactionItem;
    to: BridgeTranSactionItem;
  };
  type BridgeTranSactionItem = {
    chain: BridgeModel.BridgeSupportChain;
    tokenMeta?: BridgeTokenMeta;
    amount?: number;
    isCustomToken?: boolean;
    customTokenAddress?: string;
  };
}
