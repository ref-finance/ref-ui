import React from 'react';
import { WarnTipIcon } from '../icon/Common';
import getConfig from '../../services/config';
const config = getConfig();
const BLACKTip = ({
  tokenIds = [],
  className,
  show,
}: {
  tokenIds?: string[];
  className?: string;
  show?: boolean;
}) => {
  return null;
  const { BLACK_TOKEN_LIST } = config;
  if (!show && !tokenIds?.find((tokenId) => BLACK_TOKEN_LIST.includes(tokenId)))
    return null;
  return (
    <div
      className={`flex border border-greenLight p-3.5 rounded-xl bg-greenLight bg-opacity-10 gap-1.5 ${
        className ? className : ''
      }`}
    >
      <WarnTipIcon className="flex-shrink-0 relative top-0.5" />
      <div className="text-sm text-greenLight">
        Allow $META token transfers from December 12th to 14th. This window will
        give Ref Finance users the opportunity to withdraw and lock their $META
        tokens within the mpDAO Governance framework.{' '}
        <a
          href="https://near.org/meta-pool-official.near/widget/ImprovementProposals?tab=proposal&mpip_id=6&transactionHashes=FTBUSsyT3ULHfsNnaGMkNMF2ERFrE12epvapcc2KFGmj"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          More information
        </a>
      </div>
    </div>
  );
};
export default BLACKTip;
