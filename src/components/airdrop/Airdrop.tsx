import React, { useEffect, useState } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import getConfig from '~services/config';
import { wallet } from '~services/near';
import { useToken } from '~state/token';
import { TokenMetadata } from '~services/ft-contract';
import Loading from '~components/layout/Loading';
import Countdown, { zeroPad } from 'react-countdown';

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
  const { id, symbol, icon } = token;
  const unlocked = 70.2;
  const locking = 29.8;
  return (
    <div className="text-left p-4">
      <div>
        <label>Total Ref Token</label>
        <div className="bg-gray-200 rounded px-4 py-2 my-4 flex items-center">
          <img
            key={id}
            className="h-8 w-8 rounded-full border bg-white"
            src={icon}
          />
          <span className="ml-2">{symbol}</span>
          <span className="order-last ml-auto font-bold">100</span>
        </div>
      </div>
      <div>
        <label>Locking Ref Token</label>
        <div className="bg-gray-200 rounded px-4 py-2 my-4 flex items-center">
          <img
            key={id}
            className="h-8 w-8 rounded-full border bg-white"
            src={icon}
          />
          <span className="ml-2">{symbol}</span>
          <span className="order-last ml-auto font-bold">80</span>
        </div>
      </div>
      <div>
        <label>Unclaim Ref Token</label>
        <div className="bg-gray-200 rounded px-4 py-2 my-4 flex items-center">
          <img
            key={id}
            className="h-8 w-8 rounded-full border bg-white"
            src={icon}
          />
          <span className="ml-2">{symbol}</span>
          <span className="order-last ml-auto font-bold">20</span>
        </div>
      </div>
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
    <div className="overflow-y-auto bg-secondary shadow-2xl rounded-xl p-7">
      {participateAirdrop
        ? participateAirdropView(refToken, renderer)
        : notParticipateAirdropView(currentAccountId)}
    </div>
  );
}
