import React, { useState, useEffect, useContext } from 'react';
import { CheckInButtonIcon } from './icons2';
import CheckInModal from './CheckInModal';
import CheckInSuccessModal from './CheckInSuccessModal';
import _ from 'lodash';

import { WalletContext } from '../../utils/wallets-integration';
import { checkTransaction } from '../../services/swap';
import { getURLInfo } from '../../components/layout/transactionTipPopUp';
import { IReward } from '../../interface/meme';
const CheckIn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [earnRewards, setEarnRewards] = useState<IReward[]>([]);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res: any) => {
        const { transaction, receipts, receipts_outcome } = res;
        const isNeth =
          transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute';
        const methodNameNeth =
          receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
            ?.method_name;
        const methodNameNormal =
          transaction?.actions[0]?.FunctionCall?.method_name;
        const methodName = isNeth ? methodNameNeth : methodNameNormal;
        if (methodName == 'check_in') {
          const log = receipts_outcome[0].outcome.logs[0];
          const logObj = JSON.parse(log.match(/EVENT_JSON:(.*)/)?.[1] || '{}');
          setEarnRewards(logObj.data || []);
        }
      });
    }
  }, [txHash, isSignedIn]);
  function showCheckInModal() {
    setIsOpen(true);
  }
  function closeCheckInModal() {
    setIsOpen(false);
  }
  return (
    <>
      <div
        className="flex justify-center items-center relative cursor-pointer"
        style={{ width: '144px', height: '55px' }}
        onClick={showCheckInModal}
      >
        <CheckInButtonIcon className="absolute left-0 top-0" />
        <div className="relative flex flex-col z-10 pl-4">
          <span className="text-xs gotham_bold text-white">Daily Sign</span>
          <span className="text-base gotham_bold text-white">Check</span>
        </div>
      </div>
      <CheckInModal isOpen={isOpen} onRequestClose={closeCheckInModal} />
      <CheckInSuccessModal earnRewards={earnRewards} />
    </>
  );
};

export default CheckIn;
