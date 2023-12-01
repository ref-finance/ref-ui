declare namespace BridgeModel {
  type BridgeSupportChain = 'ETH' | 'NEAR';
  type BridgeTokenMeta = {
    symbol: string;
    name: string;
    decimals: number;
    icon: string;
    addresses: {
      [k in BridgeSupportChain]: string;
    };
  };
  type BridgeTransaction = {
    from: BridgeTranSactionItem;
    to: BridgeTranSactionItem;
  };
  type BridgeTranSactionItem = {
    chain: BridgeSupportChain;
    tokenMeta?: BridgeTokenMeta;
    amount?: number;
    isCustomToken?: boolean;
    customTokenAddress?: string;
  };
}
