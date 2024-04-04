import React, { useState, useContext, useEffect, useMemo } from 'react';
import { WalletContext } from '../../utils/wallets-integration';
import {
  TRANSACTION_WALLET_TYPE,
  parsedArgs,
} from '../../components/layout/transactionTipPopUp';
import { checkTransaction } from '../../services/swap';
import { isMobile } from '../../utils/device';
import MarketSeedsBox from './MarketSeedsBox';
import MySeedsBox from './MySeedsBox';

const is_mobile = isMobile();
export interface ITxParams {
  action: 'stake' | 'unstake';
  params: any;
  txHash: string;
  receiver_id: string;
}
const SeedsBox = () => {
  const [tab, setTab] = useState<'market' | 'your'>('market');
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const getURLInfo = () => {
    const search = window.location.search;
    const pathname = window.location.pathname;
    const errorType = new URLSearchParams(search).get('errorType');
    const errorCode = new URLSearchParams(search).get('errorCode');
    const signInErrorType = new URLSearchParams(search).get('signInErrorType');
    const txHashes = (
      new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.NEAR_WALLET) ||
      new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.SENDER_WALLET) ||
      new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.WalletSelector)
    )?.split(',');
    return {
      txHash:
        txHashes && txHashes.length > 0 ? txHashes[txHashes.length - 2] : '',
      pathname,
      errorType,
      signInErrorType,
      errorCode,
      txHashes,
    };
  };
  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res: any) => {
        const { transaction, receipts } = res;
        const isNeth =
          transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute';
        const methodNameNeth =
          receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
            ?.method_name;
        const methodNameNormal =
          transaction?.actions[0]?.FunctionCall?.method_name;
        const args = parsedArgs(
          isNeth
            ? res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
                ?.args
            : res?.transaction?.actions?.[0]?.FunctionCall?.args || ''
        );
        const receiver_id = transaction?.receiver_id;
        const parsedInputArgs = JSON.parse(args || '');
        const methodName = isNeth ? methodNameNeth : methodNameNormal;
        if (
          methodName == 'unlock_and_unstake_seed' ||
          methodName == 'ft_transfer_call'
        ) {
          setIsTxHashOpen(true);
          setTxParams({
            action:
              methodName == 'unlock_and_unstake_seed' ? 'unstake' : 'stake',
            params: parsedInputArgs,
            txHash,
            receiver_id,
          });
        }
      });
    }
  }, [txHash, isSignedIn]);
  return (
    <div className="mt-14">
      <div className="flex items-center text-2xl gotham_bold gap-12 mb-5 ml-2">
        <div
          className={` py-2 border-b-4  px-5 cursor-pointer ${
            tab === 'market'
              ? 'text-white border-white'
              : 'text-primaryText border-transparent'
          }`}
          onClick={() => {
            setTab('market');
          }}
        >
          Feed Meme
        </div>
        <div
          className={`py-2 border-b-4  px-5 cursor-pointer ${
            tab === 'your'
              ? 'text-white border-white'
              : 'text-primaryText border-transparent'
          }`}
          onClick={() => {
            setTab('your');
          }}
        >
          Yours
        </div>
      </div>
      <MarketSeedsBox hidden={tab === 'market' ? false : true} />
      <MySeedsBox hidden={tab === 'your' ? false : true} />
    </div>
  );
};
export default SeedsBox;
