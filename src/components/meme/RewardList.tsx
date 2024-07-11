import React, { useContext } from 'react';
import { isMobile } from '../../utils/device';
import { toInternationalCurrencySystem_number } from '../../utils/uiNumber';
import { MemeContext } from './context';
import { emptyObject } from './tool';

const is_mobile = isMobile();
const RewardList = ({ rewards }: { rewards: Record<string, string> }) => {
  const { allTokenMetadatas } = useContext(MemeContext);
  return (
    <div className="flex items-center gap-2">
      {Object.entries(rewards).map(([rewardTokenId, amount]) => {
        return (
          <div key={rewardTokenId} className="flex items-center gap-1">
            <img
              className="w-4 h-4 rounded-full"
              src={allTokenMetadatas?.[rewardTokenId]?.icon}
            />
            <span className="text-white text-sm">
              {toInternationalCurrencySystem_number(amount)}
            </span>
          </div>
        );
      })}
      {emptyObject(rewards) ? (
        <span className="text-white text-sm">-</span>
      ) : null}
    </div>
  );
};
export default RewardList;
