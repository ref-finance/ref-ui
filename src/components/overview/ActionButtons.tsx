import React, { useState } from 'react';
import { batchWithdraw, batchWithdrawDCL } from 'src/services/token';
import { batchWithdrawFromAurora } from 'src/services/aurora/aurora';

type Props = {
  token: any;
  isAurora?: boolean;
};

export const RefAndDCLWithdrawButton = ({ token, isAurora }: Props) => {
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const { ref, dcl, aurora, id, decimals } = token || {};
  const isRefClassic = Number(ref) > 0;
  const isDCL = Number(dcl) > 0;

  const doWithDraw = async () => {
    if (!withdrawLoading) {
      try {
        setWithdrawLoading(true);
        if (isAurora) {
          await batchWithdrawFromAurora({
            [id]: {
              amount: aurora,
              decimals,
              id,
            },
          });
        } else if (isRefClassic) {
          await batchWithdraw({
            [id]: {
              amount: ref,
              decimals,
              id,
            },
          });
        } else if (isDCL) {
          await batchWithdrawDCL({
            [id]: {
              amount: dcl,
              decimals,
              id,
            },
          });
        }
      } catch (e) {
      } finally {
        setWithdrawLoading(false);
      }
    }
  };

  return (
    <div
      className={`h-8 w-max flex items-center rounded-md text-sm text-greenColor sm:px-3 sm:border border-greenColor ${
        withdrawLoading ? 'opacity-40' : ''
      }`}
      onClick={doWithDraw}
    >
      Withdraw
    </div>
  );
};
