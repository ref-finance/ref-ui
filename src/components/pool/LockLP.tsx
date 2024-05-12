import React, { useEffect, useMemo, useState, createContext } from 'react';
import { LockIcon, WarningIcon, ArrowIcon } from './Icons';
import Big from 'big.js';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import LockedModal from './LockedModal';
import UnLockedModal from './UnLockedModal';
import { Pool } from 'src/services/pool';
import {
  get_accounts_paged,
  mft_has_registered,
  ILockerAccounts,
  ILock,
} from '../../services/lp-locker';
import config from '../../services/config';
import { formatPercentage } from '../../utils/uiNumber';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { TokenMetadata } from '../../services/ft-contract';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
const { REF_FI_CONTRACT_ID } = config();
export const LockDataProvider = createContext<{
  pool: Pool;
  userShares: string;
  lockedData: ILock;
  tokens: TokenMetadata[];
}>(null);
const LockLP = ({
  pool,
  userShares,
  tokens,
}: {
  pool: Pool;
  userShares: string;
  tokens: TokenMetadata[];
}) => {
  const [is_mft_registered, set_is_mft_registered] = useState<boolean>(false);
  const [lp_locked_list, set_lp_locked_list] = useState<Record<string, ILock>>(
    {}
  );
  const [isLockedOpen, setIsLockedOpen] = useState<boolean>(false);
  const [isUnLockedOpen, setIsUnLockedOpen] = useState<boolean>(false);
  const [fold, setFold] = useState<boolean>(true);
  const { accountId } = useWalletSelector();
  useEffect(() => {
    init();
  }, []);
  const [your_locked_percent, your_unLocked_time] = useMemo(() => {
    if (lp_locked_list[accountId]) {
      const { locked_balance, unlock_time_sec } = lp_locked_list[accountId];
      return [getSharesPercent(locked_balance), secToTime(unlock_time_sec)];
    }
    return [{ percent: '', displayPercent: '' }, ''];
  }, [accountId, lp_locked_list]);
  const total_locked_percent = useMemo(() => {
    const totalLocked = Object.values(lp_locked_list).reduce((sum, cur) => {
      return sum.plus(cur.locked_balance);
    }, Big(0));
    return getSharesPercent(totalLocked.toFixed());
  }, [lp_locked_list]);
  async function init() {
    const r = await mft_has_registered(`:${pool.id}`);
    set_is_mft_registered(r);
    if (r) {
      const locked_list: ILockerAccounts[] = await get_accounts_paged();
      const locked_token_id = `${REF_FI_CONTRACT_ID}@:${pool.id}`;
      const current_lp_locked_list = locked_list.reduce((acc, cur) => {
        if (cur.locked_tokens[locked_token_id]) {
          return {
            ...acc,
            [cur.account_id]: {
              ...cur.locked_tokens[locked_token_id],
              token_id: locked_token_id,
            },
          };
        }
        return acc;
      }, {});
      set_lp_locked_list(current_lp_locked_list);
    }
  }
  function secToTime(seconds) {
    const date = new Date(seconds * 1000);
    const year = date.getFullYear();
    let month: string | number = date.getMonth() + 1;
    let day: string | number = date.getDate();
    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const minute =
      date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    // const second =
    //   date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;
    const currentTime =
      year + '/' + month + '/' + day + '  ' + hour + ':' + minute;
    // ':' +
    // second;
    return currentTime;
  }
  function getSharesPercent(locked_balance: string) {
    const sharesInPool = pool.shareSupply;
    const sharesInLocked = locked_balance;
    let percent = '0';
    let displayPercent = '0%';
    if (Big(sharesInPool || '0').gt(0)) {
      percent = Big(sharesInLocked).div(sharesInPool).mul(100).toFixed();
      displayPercent = formatPercentage(percent);
    }
    return {
      percent,
      displayPercent,
    };
  }
  function closeLockedModal() {
    setIsLockedOpen(false);
  }
  function openLockedModal() {
    if (!lockButtonDisabled) {
      setIsLockedOpen(true);
    }
  }
  function closeUnLockedModal() {
    setIsUnLockedOpen(false);
  }
  function openUnLockedModal() {
    if (!unLockButtonDisabled) {
      setIsUnLockedOpen(true);
    }
  }
  function lockingTip() {
    return `
    <div class="flex items-center text-navHighLightText text-xs text-left xsm:w-52 lg:w-64 gotham_font px-4 xsm:px-0 xsm:ml-4">
        <ul class="list-disc list-outside text-xs text-v3SwapGray">
            <li>LP locking is not investment advice and doesn't ensure total fund safety. Significant risks remain if the project team holds many tokens.</li>
            <li class="mt-4">Locking LP yields no returns; ordinary users need not participate.</li> 
        </ul>
    </div>
    `;
  }
  const lockButtonDisabled = Big(userShares || 0).lte(0);
  const unLockButtonDisabled = Big(
    lp_locked_list?.[accountId]?.unlock_time_sec || 0
  ).gte(new Date().getTime() / 1000);
  function switchFold() {
    setFold(!fold);
  }
  return (
    <LockDataProvider.Provider
      value={{
        pool,
        userShares,
        lockedData: lp_locked_list[accountId],
        tokens,
      }}
    >
      <div className="bg-poolDetailDarkColor rounded-lg px-3.5 py-4">
        {/* overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-1">
                <span className="text-sm text-primaryText">
                  Overall locking
                </span>
                <div
                  className="text-white text-right"
                  data-class="reactTip"
                  data-tooltip-id="lockingTipId"
                  data-place="top"
                  data-tooltip-html={lockingTip()}
                >
                  <WarningIcon />
                  <CustomTooltip id="lockingTipId" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white text-sm gotham_bold">
                  {total_locked_percent?.displayPercent || '-'}
                </span>
                <LockIcon />
              </div>
            </div>
            <div className="flex flex-col gap-3.5">
              <span className="text-sm text-primaryText">My locking</span>
              <span className="text-sm text-greenColor gotham_bold">
                {your_locked_percent?.displayPercent || '-'}
              </span>
            </div>
          </div>
          <div
            onClick={switchFold}
            className={`flex items-center justify-center cursor-pointer w-6 h-6 border border-primaryText border-opacity-10 rounded-md hover:text-white ${
              fold
                ? 'text-limitOrderInputColor'
                : 'transform rotate-180 text-white'
            }`}
          >
            <ArrowIcon />
          </div>
        </div>
        {/* detail list */}
        <div className={`mt-5 ${fold ? 'hidden' : ''}`}>
          {/* global */}
          {Object.keys(lp_locked_list).filter(
            (account_id: string) => account_id !== accountId
          ).length ? (
            <div className="flex flex-col bg-primaryText bg-opacity-10 rounded-md mt-2 py-3.5 px-2">
              <div className="flex items-center justify-between text-sm text-v3SwapGray mb-5 px-2">
                <span>Phase locking</span>
                <span>Expiration time</span>
              </div>
              <div
                className="overflow-auto px-2"
                style={{ maxHeight: '100px' }}
              >
                {Object.entries(lp_locked_list).map(
                  ([account_id, lockedData], index) => {
                    const { percent, displayPercent } = getSharesPercent(
                      lockedData.locked_balance
                    );
                    if (account_id == accountId) return null;
                    return (
                      <div
                        key={account_id}
                        className={`flex items-center justify-between ${
                          index == Object.entries(lp_locked_list).length - 1
                            ? ''
                            : 'mb-4 '
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4">
                            <CircularProgressbar
                              styles={buildStyles({
                                pathColor: '#00FFD1',
                                strokeLinecap: 'butt',
                                trailColor: 'rgba(255, 255, 255, 0.3)',
                              })}
                              strokeWidth={10}
                              value={+percent}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-white">
                              {displayPercent}
                            </span>
                            <span className="text-sm text-v3SwapGray">
                              Locked
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-primaryText">
                          {secToTime(lockedData.unlock_time_sec)}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          ) : null}

          {/* yours */}
          <div className="flex flex-col bg-primaryText bg-opacity-10 rounded-md mt-2 px-4 py-3.5 gap-3.5">
            <span className="text-sm text-v3SwapGray">My locking</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4">
                  <CircularProgressbar
                    styles={buildStyles({
                      pathColor: '#00FFD1',
                      strokeLinecap: 'butt',
                      trailColor: 'rgba(255, 255, 255, 0.3)',
                    })}
                    strokeWidth={10}
                    value={+(your_locked_percent?.percent || '0')}
                  />
                </div>
                <span className="text-lg text-white gotham_bold">
                  {your_locked_percent?.displayPercent || '-'}
                </span>
              </div>
              <span className="text-sm text-primaryText">
                {your_unLocked_time}
              </span>
            </div>
          </div>
          {/* button */}
          <div className="flex items-center justify-end mt-3 gap-2.5">
            {!lockButtonDisabled ? (
              <div
                onClick={openLockedModal}
                className={`flex items-center justify-center cursor-pointer text-sm text-white border border-white border-opacity-50 rounded-md w-28 h-8 ${
                  lockButtonDisabled ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                Lock
              </div>
            ) : null}

            {your_unLocked_time ? (
              <div
                onClick={openUnLockedModal}
                className={`flex items-center justify-center cursor-pointer text-sm text-white border border-white border-opacity-50 rounded-md w-28 h-8 ${
                  unLockButtonDisabled ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                UnLock
              </div>
            ) : null}
          </div>
        </div>
        {isLockedOpen && (
          <LockedModal
            isOpen={isLockedOpen}
            onRequestClose={closeLockedModal}
            is_mft_registered={is_mft_registered}
          />
        )}
        {isUnLockedOpen && (
          <UnLockedModal
            isOpen={isUnLockedOpen}
            onRequestClose={closeUnLockedModal}
          />
        )}
      </div>
    </LockDataProvider.Provider>
  );
};
export default LockLP;
