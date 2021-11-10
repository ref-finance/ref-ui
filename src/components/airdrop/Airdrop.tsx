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
import { SmallConnectToNearBtn } from '~components/button/Button';
import ReactTooltip from 'react-tooltip';
import copy from '~utils/copy';
import { getCurrentUnixTime } from '~services/api';
import { useHistory, useLocation } from 'react-router';
import { checkTransaction } from '~services/swap';
import { toast } from 'react-toastify';
import getConfig from '~services/config';
import { FormattedMessage, useIntl } from 'react-intl';

function notParticipateAirdropView(currentAccountId: string) {
  return currentAccountId ? (
    <div className="text-center p-4">
      <FaExclamationCircle className="mx-auto text-gray-600 text-6xl mt-2 mb-6" />
      <div className="text-2xl">
        <FormattedMessage id="sorry" defaultMessage="Sorry" />
      </div>
      <div className="mt-4">
        <FormattedMessage id="account" defaultMessage="Account" />{' '}
        <span className="italic font-bold">{currentAccountId}</span>{' '}
        <FormattedMessage
          id="has_no_available_claim"
          defaultMessage=" has
        no available claim"
        />
      </div>
    </div>
  ) : (
    <div className="text-center p-4">
      <SmallConnectToNearBtn />
    </div>
  );
}

function participateAirdropView(
  token: TokenMetadata,
  accountInfo: AccountOptions,
  statsInfo: StatsOptions,
  currentTimestamp: number,
  renderer: any,
  intl: any
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
    moment().unix() > Number(cliffTimestamp) &&
    accountInfo?.claimed_balance != accountInfo?.balance;
  const canNotClaim = moment().unix() < Number(cliffTimestamp);
  const canClaimTimeText = `${intl.formatMessage({
    id: 'you_can_claim_from',
  })} ${moment.unix(cliffTimestamp).format('YYYY-MM-DD HH:mm:ss')}`;
  const claimedAllText = intl.formatMessage({
    id: 'you_have_claimed_all_your_rewards',
  });
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (canClaim) claim(token.id).then();
  };

  return (
    <div className="text-left text-sm p-4">
      <Item
        token={token}
        amount={total_balance}
        label={intl.formatMessage({ id: 'total_ref_token' })}
      />
      <Item
        token={token}
        amount={lockingAmount}
        label={intl.formatMessage({ id: 'locking_ref_token' })}
      />
      <Item
        token={token}
        amount={unclaimAmount}
        label={intl.formatMessage({ id: 'unclaim_ref_token' })}
      />
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
                  <p className="text-green-500">
                    <FormattedMessage id="unlocked" defaultMessage="Unlocked" />
                  </p>
                  <p className="text-green-500">{`${unlockedPercent}%`}</p>
                </>
              ) : (
                <>
                  <p>
                    <FormattedMessage id="unlocked" defaultMessage="Unlocked" />
                  </p>
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
                  <p className="bg-gray-200">
                    <FormattedMessage id="locking" defaultMessage="Locking" />
                  </p>
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
            <FormattedMessage id="start_at" defaultMessage="Start at" />{' '}
            {moment.unix(startTimestamp).format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>
        <Countdown date={expiration_time} renderer={renderer} />
      </div>
      <div className="w-1/3 mx-auto">
        <button
          type="button"
          onClick={handleSubmit}
          className={`w-full rounded-full bg-gray-800 text-center text-white mt-6 p-4 focus:outline-none ${
            canClaim ? '' : 'bg-opacity-50 cursor-not-allowed'
          }`}
          data-tip={
            canClaim ? '' : canNotClaim ? canClaimTimeText : claimedAllText
          }
        >
          <FormattedMessage id="claim" defaultMessage="Claim" />
        </button>
        <ReactTooltip className="text-xs font-light" />
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

  const { search } = useLocation();
  const history = useHistory();
  const txHash = new URLSearchParams(search).get('transactionHashes');
  const intl = useIntl();

  const renderer = (countdown: any) => {
    if (countdown.completed) {
      return (
        <span>
          <FormattedMessage id="ended" defaultMessage="Ended" />
        </span>
      );
    } else {
      return (
        <div>
          <FormattedMessage id="ends_in" defaultMessage="Ends in" />{' '}
          <span className="text-green-600">{countdown.days}</span>{' '}
          <FormattedMessage id="days" defaultMessage="days" />{' '}
          <span className="text-green-600">
            {zeroPad(countdown.hours)}:{zeroPad(countdown.minutes)}:
            {zeroPad(countdown.seconds)}
          </span>
          <FaRegQuestionCircle
            data-type="dark"
            data-place="bottom"
            data-multiline={true}
            data-tip={intl.formatMessage({ id: 'airdropCopy' })}
            className="inline-block	ml-2 text-xs font-semibold text-secondaryScale-500"
          />
          <ReactTooltip className="text-xs font-light" />
        </div>
      );
    }
  };

  useEffect(() => {
    if (txHash) {
      checkTransaction(txHash)
        .then(({ receipts, receipts_outcome }) => {
          return (
            receipts[1]?.receipt?.Action?.actions[0]?.FunctionCall
              ?.method_name === 'ft_transfer' &&
            receipts_outcome[1]?.outcome?.status?.Failure !== undefined
          );
        })
        .then((isFail) => {
          if (isFail) {
            toast.error(
              <a
                className="text-gray font-semibold"
                href={`${getConfig().explorerUrl}/transactions/${txHash}`}
                target="_blank"
              >
                <FormattedMessage
                  id="claim_failed_click_to_view"
                  defaultMessage="Claim failed. Click to view"
                />
              </a>,
              {
                theme: 'light',
                closeOnClick: false,
                autoClose: 8000,
              }
            );
          } else {
            toast(
              <a
                className="text-primary font-semibold"
                href={`${getConfig().explorerUrl}/transactions/${txHash}`}
                target="_blank"
              >
                <FormattedMessage
                  id="claim_successful_click_to_view"
                  defaultMessage="Claim successful. Click to view"
                />
              </a>,
              {
                theme: 'light',
                closeOnClick: false,
                autoClose: 8000,
              }
            );
          }
          history.replace('/airdrop');
        });
    }
  }, []);

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
            renderer,
            intl
          )
        : notParticipateAirdropView(currentAccountId)}
    </div>
  );
}
