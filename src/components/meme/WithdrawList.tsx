import React, { useState, useContext, useMemo } from 'react';
import Big from 'big.js';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { toInternationalCurrencySystem_number } from '../../utils/uiNumber';
import { toReadableNumber } from '../../utils/numbers';
import { MemeContext } from './context';
import { withdraw, xrefWithdraw } from '../../services/meme';
import { isMobile } from '../../utils/device';
import { formatSecondsAbb, emptyObject } from './tool';
interface IWithdraw {
  [id: string]: {
    amount: string;
    apply_timestamp: string;
    delay_withdraw_sec: number;
    type: 'meme' | 'xref';
  };
}
const WithdrawList = () => {
  const [actionSeedId, setActionSeedId] = useState('');
  const {
    memeContractConfig,
    xrefContractConfig,
    memeFarmContractUserData,
    xrefFarmContractUserData,
    allTokenMetadatas,
    xrefTokenId,
  } = useContext(MemeContext);
  const all_withdraw_list: IWithdraw = useMemo(() => {
    if (!memeFarmContractUserData || !xrefFarmContractUserData) return {};
    const meme_withdraw_list = memeFarmContractUserData.withdraw_list;
    const common_meme_withdraw_list = Object.entries(meme_withdraw_list).reduce(
      (acc, [seed_id, withdraw]) => ({
        ...acc,
        ...{
          [seed_id]: {
            ...withdraw,
            delay_withdraw_sec: memeContractConfig?.delay_withdraw_sec,
            type: 'meme',
          },
        },
      }),
      {}
    );
    const common_xref_withdraw_list = Object.entries(
      xrefFarmContractUserData
    ).reduce((acc, [contractId, userData]) => {
      const withdraw_list = userData.withdraw_list;
      if (emptyObject(withdraw_list)) return acc;
      const withdraw = Object.values(withdraw_list)[0];
      return {
        ...acc,
        ...{
          [contractId]: {
            ...withdraw,
            delay_withdraw_sec:
              xrefContractConfig?.[contractId]?.delay_withdraw_sec,
            type: 'xref',
          },
        },
      };
    }, {});
    return { ...common_meme_withdraw_list, ...common_xref_withdraw_list };
  }, [
    memeFarmContractUserData,
    xrefFarmContractUserData,
    memeContractConfig,
    xrefContractConfig,
  ]);
  if (!memeContractConfig || !xrefContractConfig) return null;
  function seedWithdraw(id, type) {
    setActionSeedId(id);
    if (type == 'meme') {
      withdraw({
        seed_id: id,
        amount: all_withdraw_list[id].amount,
      });
    } else {
      xrefWithdraw({
        contractId: id,
        seed_id: xrefTokenId,
        amount: all_withdraw_list[id].amount,
      });
    }
  }
  if (emptyObject(all_withdraw_list)) return null;
  const is_mobile = isMobile();
  return (
    <div className="lg:bg-swapCardGradient lg:border lg:border-swapCardBorder lg:px-5 rounded-2xl mt-8">
      {is_mobile ? (
        <div className="flex justify-center text-white text-xl gotham_bold mb-6">
          Withdraw
        </div>
      ) : null}
      {Object.entries(all_withdraw_list).map(([id, withdraw], index) => {
        const { amount, apply_timestamp, delay_withdraw_sec, type } = withdraw;
        const unLockDate = Big(apply_timestamp)
          .div(1000000000)
          .plus(delay_withdraw_sec);
        const currentDate = Big(new Date().getTime()).div(1000);
        let withdraw_status: 'free' | 'locked';
        let remainingTimeStr = '';
        if (Big(unLockDate).gt(currentDate)) {
          withdraw_status = 'locked';
          const remainingTime_sec = Big(unLockDate)
            .minus(currentDate)
            .toFixed(0);
          remainingTimeStr = `in ${
            formatSecondsAbb(remainingTime_sec) || '1m'
          }.`;
        } else {
          withdraw_status = 'free';
          remainingTimeStr = 'now!';
        }
        const token_meta_data =
          type === 'meme'
            ? allTokenMetadatas?.[id]
            : allTokenMetadatas?.[xrefTokenId];
        const withdrawButtonDisabled = withdraw_status == 'locked';
        return (
          <div
            key={id}
            style={{ height: is_mobile ? 'auto' : '68px' }}
            className={`flex items-center justify-between py-3 xsm:px-4 ${
              index == Object.keys(all_withdraw_list).length - 1
                ? ''
                : 'border-b border-memePoolBoxBorderColor'
            }`}
          >
            <div className="flex items-center xsm:items-start gap-2.5">
              <img
                style={{ width: '32px', height: '32px' }}
                src={token_meta_data?.icon}
                className="rounded-full xsm:mt-1"
              />
              <div className="flex items-center gap-2.5 text-white text-base xsm:hidden">
                <span className="gotham_bold">
                  {toInternationalCurrencySystem_number(
                    toReadableNumber(token_meta_data?.decimals || 0, amount)
                  )}{' '}
                  {token_meta_data?.symbol}
                </span>{' '}
                is available to be withdraw {remainingTimeStr}
              </div>
              <div className=" text-white text-base lg:hidden">
                <span className="gotham_bold">
                  {toInternationalCurrencySystem_number(
                    toReadableNumber(token_meta_data?.decimals || 0, amount)
                  )}{' '}
                  {token_meta_data?.symbol}
                </span>{' '}
                is available to be withdraw {remainingTimeStr}
              </div>
            </div>
            <OprationButton
              minWidth={`${is_mobile ? '6rem' : '7rem'}`}
              disabled={withdrawButtonDisabled || actionSeedId == id}
              onClick={() => {
                seedWithdraw(id, type);
              }}
              className={`flex items-center justify-center bg-memeDarkColor border border-greenLight rounded-xl h-8 text-greenLight text-sm focus:outline-none xsm:ml-2 ${
                withdrawButtonDisabled || actionSeedId == id ? 'opacity-40' : ''
              }`}
            >
              <ButtonTextWrapper
                loading={actionSeedId == id}
                Text={() => <>Withdraw</>}
              />
            </OprationButton>
          </div>
        );
      })}
    </div>
  );
};

export default WithdrawList;
