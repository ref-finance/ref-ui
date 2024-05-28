import React, { useEffect, useMemo, useState, createContext } from 'react';
import { LockIcon, WarningIcon, ArrowIcon } from './Icons';
import { TokenRisk } from '../icon/Arrows';
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
import { secToTime, tokenAmountInShares } from './utils';
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
  const [your_locked_percent, your_unLocked_time, your_locked_balance] =
    useMemo(() => {
      if (lp_locked_list[accountId]) {
        const { locked_balance, unlock_time_sec } = lp_locked_list[accountId];
        return [
          getSharesPercent(locked_balance),
          secToTime(unlock_time_sec),
          locked_balance,
        ];
      }
      return [{ percent: '', displayPercent: '' }, '', '0'];
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
  const [tokenA_amount, tokenB_amount] = useMemo(() => {
    if (your_locked_balance && tokens && pool && accountId) {
      return [
        tokenAmountInShares(pool, tokens[0], your_locked_balance),
        tokenAmountInShares(pool, tokens[1], your_locked_balance),
      ];
    }
    return ['0', '0'];
  }, [your_locked_balance, tokens, pool, accountId]);
  function switchFold() {
    setFold(!fold);
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
  function yourLockedDetail() {
    if (!your_locked_percent?.displayPercent) return '';
    return `
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between text-xs text-white gap-5">
          <div class="flex items-center gap-2">
              <img src="${tokens?.[0]?.icon}" class="w-5 h-5 rounded-full"/>
              <span class="text-white">${tokens?.[0]?.symbol}</span>
          </div>
          <span>${tokenA_amount}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-white gap-5">
          <div class="flex items-center gap-2">
            <img src="${tokens?.[1].icon}" class="w-5 h-5 rounded-full"/>
            <span class="text-white">${tokens?.[1].symbol}</span>
          </div>
          <span>${tokenB_amount}</span>
        </div>
      </div>
    `;
  }
  const lockButtonDisabled = Big(userShares || 0).lte(0);
  const unLockButtonDisabled =
    Big(lp_locked_list?.[accountId]?.unlock_time_sec || 0).gte(
      new Date().getTime() / 1000
    ) || !your_unLocked_time;
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
                  <TokenRisk className="transform scale-75 origin-center relative top-px" />
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
              <div
                className="text-white"
                data-class="reactTip"
                data-tooltip-id="yourLockedId"
                data-place="top"
                data-tooltip-html={yourLockedDetail()}
              >
                <span
                  className={`text-sm text-greenColor gotham_bold ${
                    your_locked_percent?.displayPercent
                      ? 'border-b border-greenColor border-dashed'
                      : ''
                  }`}
                >
                  {your_locked_percent?.displayPercent || '-'}
                </span>
                <CustomTooltip id="yourLockedId" />
              </div>
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
        <div
          className={`${Object.keys(lp_locked_list).length ? 'mt-5' : ''} ${
            fold ? 'hidden' : ''
          }`}
        >
          {/* global */}
          <div
            className={`flex flex-col bg-primaryText bg-opacity-10 rounded-md mt-2 py-3.5 px-2 ${
              Object.entries(lp_locked_list).length ? '' : 'hidden'
            }`}
          >
            <div className="flex items-center justify-between text-sm text-v3SwapGray mb-5 px-2">
              <span>Phase locking</span>
              <span>Expiration time</span>
            </div>
            <div className="overflow-auto px-2" style={{ maxHeight: '100px' }}>
              {Object.entries(lp_locked_list)
                .sort((b, a) => {
                  return b[1].unlock_time_sec - a[1].unlock_time_sec;
                })
                .map(([account_id, lockedData], index) => {
                  const { percent, displayPercent } = getSharesPercent(
                    lockedData.locked_balance
                  );
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
                })}
            </div>
          </div>

          {/* yours */}
          <div
            className={`flex flex-col bg-primaryText bg-opacity-10 rounded-md mt-2 px-4 py-3.5 gap-3.5 ${
              your_unLocked_time ? '' : 'hidden'
            }`}
          >
            <span className="text-sm text-v3SwapGray">My locking</span>
            <div className="flex items-center justify-between">
              <div
                className="text-white"
                data-class="reactTip"
                data-tooltip-id="yourLockedId2"
                data-place="top"
                data-tooltip-html={yourLockedDetail()}
              >
                <span className="text-lg text-white gotham_bold border-b border-white border-dashed">
                  {your_locked_percent?.displayPercent || '-'}
                </span>
                <CustomTooltip id="yourLockedId2" />
              </div>
              <span className="text-sm text-primaryText">
                {your_unLocked_time}
              </span>
            </div>
          </div>
          {/* button */}
          <div className="flex items-center justify-end mt-3 gap-2.5">
            <div
              onClick={openLockedModal}
              className={`flex items-center justify-center cursor-pointer text-sm text-white border border-white border-opacity-50 rounded-md w-28 h-8 ${
                lockButtonDisabled ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              Lock
            </div>

            <div
              onClick={openUnLockedModal}
              className={`flex items-center justify-center cursor-pointer text-sm text-white border border-white border-opacity-50 rounded-md w-28 h-8 ${
                unLockButtonDisabled ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              UnLock
            </div>
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
