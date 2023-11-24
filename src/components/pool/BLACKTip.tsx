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
        Due to $META token Reset for the Meta Pool DAO, $META related pools
        canbe removed during Dec.1st-14th. Meanwhile, they will no longer able
        to add liquidity.{' '}
        <a
          href="https://blog.metapool.app/2023/10/02/token-reset-for-the-meta-pool-dao"
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
