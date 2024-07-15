import { WalletSelector } from '@near-wallet-selector/core';
import stargateBridgeService from './stargate';
import { logger } from '../../utils/common';
import rainbowBridgeService from './rainbow';

export interface BridgeTransferParams {
  tokenIn: BridgeModel.BridgeTokenMeta;
  tokenOut: BridgeModel.BridgeTokenMeta;
  channel: BridgeModel.BridgeSupportChannel;
  amount: string;
  sender: string;
  from: BridgeModel.BridgeSupportChain;
  to: BridgeModel.BridgeSupportChain;
  recipient: string;
  nearWalletSelector?: WalletSelector;
  slippage?: number;
}

const bridgeServices = {
  async transfer(params: BridgeTransferParams) {
    logger.log('bridge: transfer params', params);
    switch (params.channel) {
      case 'Stargate':
        return stargateBridgeService.transfer(params);
      case 'Rainbow':
        return rainbowBridgeService.transfer(params);
      default:
        throw new Error('Unsupported bridge channel');
    }
  },
  async query(params: BridgeTransferParams) {
    switch (params.channel) {
      case 'Stargate':
        return stargateBridgeService.query(params);
      default:
        return;
    }
  },
};

export default bridgeServices;
