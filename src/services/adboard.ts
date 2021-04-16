import { Account } from 'near-api-js';
import { AdboardUtil } from '../utils/AdboardUtil';
import { near, wallet } from './near';

export const REF_ADBOARD_CONTRACT_ID =
  process.env.REF_ADBOARD_CONTRACT_ID || 'ref-adboard.testnet';

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
  const account = new Account(near.connection, REF_ADBOARD_CONTRACT_ID);

  const state = await account.viewState('', { finality: 'final' });
  return state.reduce(
    (acc, { key, value }) => {
      const [decodedKey, index] = key.toString().split('::');
      const decodedValue = value.toString();

      if (decodedKey === 'f') {
        acc.framedata[Number(index)] = JSON.parse(
          AdboardUtil.decompressB64(decodedValue)
        );
      }

      if (decodedKey === 'm') {
        acc.metadata[Number(index)] = {
          ...JSON.parse(decodedValue),
          frameId: index,
        };
      }

      return acc;
    },
    { framedata: [], metadata: [] }
  );
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
