import React, { useEffect, useState } from 'react';
import { FaExclamationCircle, FaRegQuestionCircle } from 'react-icons/fa';
import { wallet } from '~services/near';
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import Loading from '~components/layout/Loading';
import Countdown, { zeroPad } from 'react-countdown';
import { Item } from '~components/airdrop/Item';
import {
  AccountOptions,
  claim,
  getAccount,
  getStats,
  StatsOptions,
} from '~services/airdrop';
import { toReadableNumber } from '~utils/numbers';
import moment from 'moment';
import { ConnectToNearBtn } from '~components/button/Button';
import ReactTooltip from 'react-tooltip';
import copy from '~utils/copy';
import { getCurrentUnixTime } from '~services/api';

function notParticipateAirdropView(currentAccountId: string) {
  return currentAccountId ? (
    <div className="text-center p-4">
      <FaExclamationCircle className="mx-auto text-gray-600 text-6xl mt-2 mb-6" />
      <div className="text-2xl">Sorry</div>
      <div className="mt-4">
        Account <span className="italic font-bold">{currentAccountId}</span> has
        no available claim
      </div>
    </div>
  ) : (
    <div className="text-center p-4">
      <ConnectToNearBtn />
    </div>
  );
}

function participateAirdropView(
  token: TokenMetadata,
  accountInfo: AccountOptions,
  statsInfo: StatsOptions,
  currentTimestamp: number,
  renderer: any
) {
  const total_balance = toReadableNumber(
    token.decimals,
    accountInfo?.balance.toString() || '0'
  );
  const expiration_time = moment
    .unix(Number(statsInfo?.claim_expiration_timestamp))
    .valueOf();

  const end_timestamp = Number(accountInfo?.end_timestamp);
  const cliffTimestamp = Number(accountInfo?.cliff_timestamp);
  const startTimestamp = Number(accountInfo?.start_timestamp);
  const unlockedPercent: number =
    currentTimestamp > end_timestamp
      ? 100
      : currentTimestamp > startTimestamp
      ? Number(
          (
            Number(
              (currentTimestamp - startTimestamp) /
                (end_timestamp - startTimestamp)
            ) * 100
          ).toFixed(3)
        )
      : 0;

  const lockingPercent: number = Number((100 - unlockedPercent).toFixed(3));
  const lockingAmount = Number(
    ((Number(total_balance) * lockingPercent) / 100).toFixed(3)
  );
  const unlockedAmount = Number(
    ((Number(total_balance) * unlockedPercent) / 100).toFixed(3)
  );
  const claimedAmount = Number(
    toReadableNumber(token.decimals, accountInfo?.claimed_balance.toString())
  );
  const unclaimAmount =
    unlockedAmount - claimedAmount > 0 ? unlockedAmount - claimedAmount : 0;
  const canClaim =
    moment().unix() < Number(statsInfo?.claim_expiration_timestamp) ||
    moment().unix() > Number(cliffTimestamp);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    claim(token.id).then();
  };

  return (
    <div className="text-left text-sm p-4">
      <Item token={token} amount={total_balance} label="Total Ref Token" />
      <Item token={token} amount={lockingAmount} label="Locking Ref Token" />
      <Item token={token} amount={unclaimAmount} label="Unclaim Ref Token" />
      <div>
        <div className="w-full mx-auto rounded-xl bg-gray-200 mt-8">
          {unlockedPercent > 0 ? (
            <div
              className={`inline-block text-center text-white rounded-xl py-2 bg-green-500 text-xs ${
                unlockedPercent === 100 ? 'rounded-xl' : ''
              }`}
              style={{
                width: `${unlockedPercent <= 2 ? 2 : unlockedPercent}%`,
              }}
            >
              {unlockedPercent < 15 ? (
                <>
                  <p className="text-green-500">Unlocked</p>
                  <p className="text-green-500">{`${unlockedPercent}%`}</p>
                </>
              ) : (
                <>
                  <p>Unlocked</p>
                  <p>{`${unlockedPercent}%`}</p>
                </>
              )}
            </div>
          ) : null}
          {lockingPercent > 0 ? (
            <div
              className={`inline-block text-center rounded-xl py-2 bg-gray-200 text-xs ${
                lockingPercent === 100 ? 'rounded-xl' : ''
              }`}
              style={{
                width: `${lockingPercent >= 98 ? 98 : lockingPercent}%`,
              }}
            >
              {lockingPercent < 15 ? null : (
                <>
                  <p className="bg-gray-200">Locking</p>
                  <p>{`${lockingPercent}%`}</p>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
      <div className="text-center mt-8">
        <div>
          <div className="mb-2">
            Start at {moment.unix(startTimestamp).format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>
        <Countdown date={expiration_time} renderer={renderer} />
      </div>
      <div className="w-1/3 mx-auto">
        <button
          type="button"
          disabled={!canClaim}
          onClick={handleSubmit}
          className={`w-full rounded-full bg-gray-800 text-center text-white mt-6 p-4 focus:outline-none ${
            canClaim ? '' : 'bg-opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          Claim
        </button>
      </div>
    </div>
  );
}

export default function AirdropView() {
  const [participateAirdrop, setParticipateAirdrop] = useState<boolean>(false);
  const [accountInfo, setAccountInfo] = useState<AccountOptions>();
  const [statsInfo, setStatsInfo] = useState<StatsOptions>();
  const currentAccountId = wallet.getAccountId();
  const [token, setToken] = useState<TokenMetadata>();
  const [currentTimestamp, setCurrentTimestamp] = useState<number>();

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
          <FaRegQuestionCircle
            data-type="dark"
            data-place="bottom"
            data-multiline={true}
            data-tip={copy.airdrop}
            className="inline-block	ml-2 text-xs font-semibold text-secondaryScale-500"
          />
          <ReactTooltip className="text-xs font-light" />
        </div>
      );
    }
  };
  useEffect(() => {
    getAccount()
      .then((account) => {
        setAccountInfo(account);
        if (account) {
          setParticipateAirdrop(true);
        }
      })
      .catch((err) => {
        setAccountInfo(err);
      });
    getStats()
      .then((stats) => {
        ftGetTokenMetadata(stats.token_account_id).then((token) => {
          setToken(token);
        });
        setStatsInfo(stats);
      })
      .catch((err) => {
        setStatsInfo(err);
      });
    getCurrentUnixTime().then((unixtime) => {
      setCurrentTimestamp(Number(unixtime));
    });
  }, []);

  if (!statsInfo || !token) return Loading();

  return (
    <div className="overflow-y-auto bg-secondary shadow-2xl rounded-xl p-7 xs:p-2 md:p-2">
      {participateAirdrop
        ? participateAirdropView(
            token,
            accountInfo,
            statsInfo,
            currentTimestamp,
            renderer
          )
        : notParticipateAirdropView(currentAccountId)}
    </div>
  );
}
