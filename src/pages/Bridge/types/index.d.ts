declare namespace BridgeModel {
  type BridgeSupportChain = 'Ethereum' | 'Arbitrum' | 'NEAR' | 'Aurora';
  type BridgeSupportChannel = 'Rainbow' | 'Stargate';
  type BridgeTokenMeta = {
    symbol: string;
    name?: string;
    decimals: number;
    icon: string;
    addresses: {
      [k in BridgeSupportChain]?: string;
    };
  };
  type BridgeTransferFormData = {
    from: BridgeTransfer;
    to: BridgeTransfer & {
      isCustomAccountAddress?: boolean;
      customAccountAddress?: string;
    };
  };
  type BridgeTransfer = {
    chain: BridgeSupportChain;
    tokenMeta?: BridgeTokenMeta;
    amount?: string;
  };
  type BridgeTransaction = import('@near-eth/client').DecoratedTransfer & {
    amount?: string;
    decimals?: number;
    startTime: string;
    sourceNetwork: Lowercase<BridgeSupportChain>;
    symbol?: string;
    lockHashes?: string[];
    unlockHashes?: string[];
    burnHashes?: string[];
    mintHashes?: string[];
  };
  type BridgeHistory = {
    account: string;
    chain: BridgeSupportChain;
    type: BridgeSupportChannel;
    from: string;
    to: string;
    from_chain: BridgeSupportChain;
    from_chain_hash: string;
    from_chain_pending: boolean;
    to_chain: BridgeSupportChain;
    to_chain_hash: string;
    to_chain_pending: boolean;
    fee_token: string;
    fee: string;
    token: string;
    volume: string;
    status: 'DELIVERED';
    created_time: number;
    update_time: number;
  };
}
