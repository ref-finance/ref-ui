import axios from 'axios';
import {
  ONE_YOCTO_NEAR,
  REF_FI_CONTRACT_ID,
  wallet,
  getGas,
  getAmount,
  REF_ADBOARD_CONTRACT_ID,
} from './near';

export interface AdboardMetadata {
  token_price: number;
  token_id: string;
  owner: string;
  protected_ts: number;
  frameId: string;
}

export type AdboardFrameData = number[][];

export interface AdboardState {
  framedata: AdboardFrameData;
  metadata: AdboardMetadata[];
}

export const getAdboardState = async (): Promise<AdboardState> => {
  const resp = await axios.get(
    'https://pixelparty.pixeldapps.co/api/getAdboard'
  );
  return { framedata: resp.data.framedata, metadata: resp.data.metadata };
};

export const editFrame = ({
  frameId,
  framedata,
}: {
  frameId: string;
  framedata: AdboardFrameData;
}) => {
  return wallet.account().functionCall(REF_ADBOARD_CONTRACT_ID, 'editFrame', {
    frameId: Number(frameId),
    frameData: framedata,
  });
};

export const buyFrameCall = ({
  frameId,
  tokenId,
  amount,
  receiverId,
  sellTokenId,
  sellPrice,
  poolId,
}: {
  frameId: string;
  tokenId: string;
  amount: string;
  receiverId: string;
  sellTokenId: string;
  sellPrice: string;
  poolId: number;
}) => {
  return wallet.account().functionCall(
    REF_FI_CONTRACT_ID,
    'mft_transfer_call',
    {
      token_id: tokenId,
      amount: amount,
      receiver_id: receiverId,
      msg: frameId + '||' + sellTokenId + '||' + sellPrice + '||' + poolId,
    },
    getGas('300000000000000'),
    getAmount(ONE_YOCTO_NEAR)
  );
};
