import React, { useEffect, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import getConfig from '~services/config';
import { wallet } from '~services/near';
import { useToken } from '~state/token';
import { TokenMetadata } from '~services/ft-contract';
import Loading from '~components/layout/Loading';
import Countdown, { zeroPad } from 'react-countdown';
import { Item } from '~components/airdrop/Item';

function notParticipateAirdropView(currentAccountId: string) {
  return (
    <div className="text-center p-4">
      <FaExclamationCircle className="mx-auto text-gray-600 text-6xl mt-2 mb-6" />
      <div className="text-2xl">Sorry</div>
      <div className="mt-4">
        Account <span className="italic font-bold">{currentAccountId}</span> has
        no available claim
      </div>
    </div>
  );
}

function participateAirdropView(token: TokenMetadata, renderer: any) {
  const unlocked = 70.2;
  const locking = 29.8;
  return (
    <div className="text-left text-sm p-4">
      <Item token={token} amount="100" label="Total Ref Token" />
      <Item token={token} amount="80" label="Locking Ref Token" />
      <Item token={token} amount="20" label="Unclaim Ref Token" />
      <div>
        <div className="w-full mx-auto rounded-xl bg-gray-200 mt-8">
          {unlocked > 0 ? (
            <div
              className={`inline-block text-center text-white rounded-l-xl p-2 bg-green-500 text-xs ${
                unlocked === 100 ? 'rounded-r-xl' : ''
              }`}
              style={{ width: `${unlocked}%` }}
            >
              <p>Unlocked</p>
              <p>{`${unlocked}%`}</p>
            </div>
          ) : null}
          {locking > 0 ? (
            <div
              className={`inline-block text-center rounded-r-xl p-2 bg-gray-200 text-xs ${
                locking === 100 ? 'rounded-l-xl' : ''
              }`}
              style={{ width: `${locking}%` }}
            >
              <p>Locking</p>
              <p>{`${locking}%`}</p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="text-center mt-8">
        <Countdown date={new Date('2021-08-01 00:00:00')} renderer={renderer} />
      </div>
      <div>
        <div className="w-1/3 mx-auto rounded-full bg-gray-800 text-center text-white mt-6 p-4">
          Claim
        </div>
      </div>
    </div>
  );
}

export default function AirdropView() {
  const [participateAirdrop, setParticipateAirdrop] = useState<boolean>(false);
  const currentAccountId = wallet.getAccountId();
  const refToken = useToken(getConfig().REF_TOKEN_ID);

  const renderer = (countdown: any) => {
    if (countdown.completed) {
      return <span>Ended</span>;
    } else {
      return (
        <div>
          Ends in <span className="text-green-600">{countdown.days}</span> days{' '}
          <span className="text-green-600">
            {zeroPad(countdown.hours)}:{zeroPad(countdown.minutes)}:
            {zeroPad(countdown.seconds)}
          </span>
        </div>
      );
    }
  };
  useEffect(() => {
    setParticipateAirdrop(true);
  });
  if (!refToken) return Loading();

  return (
    <div className="overflow-y-auto bg-secondary shadow-2xl rounded-xl p-7 xs:p-2 md:p-2">
      {participateAirdrop
        ? participateAirdropView(refToken, renderer)
        : notParticipateAirdropView(currentAccountId)}
    </div>
  );
}
