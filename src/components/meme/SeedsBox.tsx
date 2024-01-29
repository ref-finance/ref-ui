import React, { useState, useContext, useEffect } from 'react';
import Big from 'big.js';
import { ArrowRightIcon } from './icons';
import { useHistory } from 'react-router';
import {
  OprationButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from 'src/components/button/Button';
import { MemeContext } from './context';
import {
  getMemeConfig,
  claim,
  getSeedApr,
  isPending,
  isEnded,
} from '../../services/meme';
import { toReadableNumber } from '../../utils/numbers';
import {
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
  formatPercentage,
  formatPercentageUi,
} from '../../utils/uiNumber';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { UserSeedInfo, Seed, FarmBoost } from '~src/services/farm';
import { TokenMetadata } from '~src/services/ft-contract';
import { WalletContext } from '../../utils/wallets-integration';
import StakeModal from './StakeModal';
import UnStakeModal from './UnStakeModal';
import CallBackModal from './CallBackModal';
import {
  TRANSACTION_WALLET_TYPE,
  parsedArgs,
} from '../../components/layout/transactionTipPopUp';
import { checkTransaction } from '../../services/swap';
import { isMobile } from '../../utils/device';

export interface ITxParams {
  action: 'stake' | 'unstake';
  params: any;
  txHash: string;
  receiver_id: string;
}
const SeedsBox = () => {
  const {
    seeds,
    tokenPriceList,
    user_seeds,
    user_balances,
    unclaimed_rewards,
    allTokenMetadatas,
    lpSeeds,
  } = useContext(MemeContext);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [isStakeOpen, setIsStakeOpen] = useState(false);
  const [isUnStakeOpen, setIsUnStakeOpen] = useState(false);
  const [isTxHashOpen, setIsTxHashOpen] = useState(false);
  const [txParams, setTxParams] = useState<ITxParams>();
  const [modal_action_seed_id, set_modal_action_seed_id] = useState('');
  const [claim_seed_id, set_claim_seed_id] = useState('');
  const memeConfig = getMemeConfig();
  const history = useHistory();
  const getURLInfo = () => {
    const search = window.location.search;
    const pathname = window.location.pathname;
    const errorType = new URLSearchParams(search).get('errorType');
    const errorCode = new URLSearchParams(search).get('errorCode');
    const signInErrorType = new URLSearchParams(search).get('signInErrorType');
    const txHashes = (
      new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.NEAR_WALLET) ||
      new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.SENDER_WALLET) ||
      new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.WalletSelector)
    )?.split(',');
    return {
      txHash:
        txHashes && txHashes.length > 0 ? txHashes[txHashes.length - 2] : '',
      pathname,
      errorType,
      signInErrorType,
      errorCode,
      txHashes,
    };
  };
  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res: any) => {
        const { transaction, receipts } = res;
        const isNeth =
          transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute';
        const methodNameNeth =
          receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
            ?.method_name;
        const methodNameNormal =
          transaction?.actions[0]?.FunctionCall?.method_name;
        const args = parsedArgs(
          isNeth
            ? res?.receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
                ?.args
            : res?.transaction?.actions?.[0]?.FunctionCall?.args || ''
        );
        const receiver_id = transaction?.receiver_id;
        const parsedInputArgs = JSON.parse(args || '');
        const methodName = isNeth ? methodNameNeth : methodNameNormal;
        if (
          methodName == 'unlock_and_unstake_seed' ||
          methodName == 'ft_transfer_call'
        ) {
          setIsTxHashOpen(true);
          setTxParams({
            action:
              methodName == 'unlock_and_unstake_seed' ? 'unstake' : 'stake',
            params: parsedInputArgs,
            txHash,
            receiver_id,
          });
        }
      });
    }
  }, [txHash, isSignedIn]);
  function getSeedStaked(seed_id: string) {
    const seed = seeds[seed_id];
    const { seed_decimal, total_seed_amount, seedTvl } = seed;
    const seedTotalStakedAmount = toReadableNumber(
      seed_decimal,
      total_seed_amount
    );
    return {
      amount: toInternationalCurrencySystem_number(seedTotalStakedAmount),
      value: toInternationalCurrencySystem_usd(seedTvl),
    };
  }
  function getSeedUserStaked(seed_id: string) {
    const userSeed: UserSeedInfo = user_seeds[seed_id];
    if (userSeed) {
      const seed = seeds[seed_id];
      const { free_amount } = userSeed;
      const { seed_decimal } = seed;
      const seedTotalStakedAmount = toReadableNumber(seed_decimal, free_amount);
      const price = tokenPriceList[seed_id]?.price || 0;
      const seedTotalStakedValue = new Big(seedTotalStakedAmount)
        .mul(price)
        .toFixed();
      return {
        amount: toInternationalCurrencySystem_number(seedTotalStakedAmount),
        value: toInternationalCurrencySystem_usd(seedTotalStakedValue),
      };
    } else {
      return {
        amount: '-',
        value: '',
      };
    }
  }
  function getUserBalance(seed_id: string) {
    const seed = seeds[seed_id];
    const { seed_decimal } = seed;
    const price = tokenPriceList[seed_id]?.price || 0;
    const balance = toReadableNumber(seed_decimal, user_balances[seed_id]);
    const value = new Big(balance).mul(price).toFixed();
    if (+balance) {
      return {
        amount: toInternationalCurrencySystem_number(balance),
        value: toInternationalCurrencySystem_usd(value),
      };
    } else {
      return {
        amount: '-',
        value: '',
      };
    }
  }
  function getFeeder(seed_id: string) {
    const seed = seeds[seed_id];
    return seed.farmer_count;
  }
  function goFarmDetail(seed_id: string) {
    const lpSeed = lpSeeds[seed_id];
    if (lpSeed.farmList[0].status == 'Ended') {
      window.open(`/v2farms/${lpSeed.pool.id}-e`);
    } else {
      window.open(`/v2farms/${lpSeed.pool.id}-r`);
    }
  }
  function seedClaim(seed: Seed) {
    set_claim_seed_id(seed.seed_id);
    claim(seed);
  }
  function comeSoonTip() {
    const result = `<div class="px-2 text-xs text-farmText">
    Coming soon
    </div>`;
    return result;
  }
  const is_mobile = isMobile();
  return (
    <div className="grid gap-4 mt-14 xsm:grid-cols-1 xsm:grid-rows-1 lg:grid-cols-2 lg:grid-rows-2 xsm:mx-3">
      {Object.entries(seeds).map(([seed_id, seed]) => {
        const is_pending = isPending(seed);
        const is_ended = isEnded(seed);
        const stakeButtonDisabled =
          !user_balances[seed_id] || +user_balances[seed_id] == 0 || is_pending;

        const unStakeButtonDisabled =
          +(user_seeds[seed_id]?.free_amount || 0) == 0;
        const claimButtonDisabled =
          Object.keys(unclaimed_rewards[seed_id] || {}).length == 0;
        const hasLpSeed =
          lpSeeds[seed_id]?.farmList[0]?.status &&
          lpSeeds[seed_id]?.farmList[0]?.status !== 'Ended';
        return (
          <div
            key={seed_id}
            className="border border-memeBorderColor bg-swapCardGradient rounded-2xl px-4 py-6"
          >
            <div className="flex items-stretch gap-4">
              <img
                src={seed.token_meta_data.icon}
                style={{ width: '86px', height: '86px' }}
                className=" rounded-full"
              />
              <div className="flex flex-col justify-between gap-1.5">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-xl gotham_bold text-white">
                    {seed.token_meta_data.symbol}
                  </span>
                  {hasLpSeed ? (
                    <div
                      onClick={() => {
                        goFarmDetail(seed_id);
                      }}
                      className="flex items-center border border-memePoolBoxBorderColor gap-2 rounded-lg h-8 px-2 cursor-pointer"
                    >
                      <span className="text-xs text-white">
                        {seed.token_meta_data.symbol}/NEAR
                      </span>
                      <ArrowRightIcon />
                    </div>
                  ) : (
                    <div
                      data-class="reactTip"
                      data-tooltip-id={`lp_farm_${seed_id}`}
                      data-place="top"
                      data-tooltip-html={comeSoonTip()}
                    >
                      <div className="flex items-center border border-memePoolBoxBorderColor gap-2 rounded-lg h-8 px-2 opacity-30 cursor-not-allowed">
                        <span className="text-xs text-white">
                          {seed.token_meta_data.symbol}/NEAR
                        </span>
                        <ArrowRightIcon />
                      </div>
                      <CustomTooltip id={`lp_farm_${seed_id}`} />
                    </div>
                  )}
                </div>
                <p className="text-sm text-primaryText">
                  {memeConfig.description[seed_id]}
                </p>
              </div>
            </div>
            {/* base data */}
            <div className="grid lg:grid-cols-3 lg:grid-rows-2 xsm:grid-cols-2 gap-y-6 mt-5">
              <Template
                title="Total Feed"
                value={getSeedStaked(seed_id).amount}
                subValue={getSeedStaked(seed_id).value}
              />
              <Template
                title="APY"
                value={getSeedApr(seeds[seed_id])}
                seed={seeds[seed_id]}
                pending={is_pending}
                ended={is_ended}
                subValue={getSeedApr(lpSeeds[seed_id])}
                subTargetValue={hasLpSeed ? '' : '-'}
                isAPY={true}
              />
              <Template title="Feeders" value={getFeeder(seed_id)} />
              <Template
                title="Your Feed"
                value={getSeedUserStaked(seed_id).amount}
                subValue={getSeedUserStaked(seed_id).value}
              />
              <Template
                title="Your Reward"
                rewards={unclaimed_rewards[seed_id]}
                isRewards={true}
                seed={seeds[seed_id]}
              />
              <Template
                title="Wallet Balance"
                value={getUserBalance(seed_id).amount}
                subValue={getUserBalance(seed_id).value}
              />
            </div>
            {/* operation */}
            <div className={`flex-grow mt-6 ${isSignedIn ? 'hidden' : ''}`}>
              <ConnectToNearBtn></ConnectToNearBtn>
            </div>
            <div
              className={`flex items-center justify-between mt-6 gap-3 ${
                isSignedIn ? '' : 'hidden'
              }`}
            >
              <OprationButton
                // minWidth="7rem"
                disabled={claimButtonDisabled || claim_seed_id == seed_id}
                onClick={() => {
                  seedClaim(seed);
                }}
                className={`flex flex-grow items-center justify-center border border-greenLight rounded-xl h-12 text-greenLight text-base gotham_bold focus:outline-none ${
                  claimButtonDisabled || claim_seed_id == seed_id
                    ? 'opacity-40'
                    : ''
                }`}
              >
                <ButtonTextWrapper
                  loading={claim_seed_id == seed_id}
                  Text={() => <>Claim</>}
                />
              </OprationButton>
              <OprationButton
                // minWidth="7rem"
                disabled={unStakeButtonDisabled}
                onClick={() => {
                  set_modal_action_seed_id(seed.seed_id);
                  setIsUnStakeOpen(true);
                }}
                className={`flex flex-grow items-center justify-center border border-greenLight rounded-xl h-12 text-greenLight text-base gotham_bold focus:outline-none ${
                  unStakeButtonDisabled ? 'opacity-30' : ''
                }`}
              >
                <ButtonTextWrapper loading={false} Text={() => <>Unstake</>} />
              </OprationButton>
              {stakeButtonDisabled && is_pending ? (
                <div className="flex-grow">
                  <div
                    data-class="reactTip"
                    data-tooltip-id={`lp_farm_button_${seed_id}`}
                    data-place="top"
                    data-tooltip-html={comeSoonTip()}
                  >
                    <OprationButton
                      // minWidth="7rem"
                      disabled={stakeButtonDisabled}
                      onClick={() => {
                        set_modal_action_seed_id(seed.seed_id);
                        setIsStakeOpen(true);
                      }}
                      className={`flex flex-grow items-center justify-center text-boxBorder rounded-xl h-12 text-base gotham_bold focus:outline-none ${
                        stakeButtonDisabled
                          ? 'bg-memePoolBoxBorderColor'
                          : 'bg-greenLight'
                      }`}
                    >
                      Feed {seed.token_meta_data.symbol}
                    </OprationButton>
                    <CustomTooltip id={`lp_farm_button_${seed_id}`} />
                  </div>
                </div>
              ) : (
                <OprationButton
                  // minWidth="7rem"
                  disabled={stakeButtonDisabled}
                  onClick={() => {
                    set_modal_action_seed_id(seed.seed_id);
                    setIsStakeOpen(true);
                  }}
                  className={`flex flex-grow items-center justify-center text-boxBorder rounded-xl h-12 text-base gotham_bold focus:outline-none ${
                    stakeButtonDisabled
                      ? 'bg-memePoolBoxBorderColor'
                      : 'bg-greenLight'
                  }`}
                >
                  Feed {is_mobile ? '' : seed.token_meta_data.symbol}
                </OprationButton>
              )}
            </div>
          </div>
        );
      })}
      {isStakeOpen ? (
        <StakeModal
          isOpen={isStakeOpen}
          onRequestClose={() => {
            setIsStakeOpen(false);
          }}
          seed_id={modal_action_seed_id}
        />
      ) : null}
      {isUnStakeOpen ? (
        <UnStakeModal
          isOpen={isUnStakeOpen}
          onRequestClose={() => {
            setIsUnStakeOpen(false);
          }}
          seed_id={modal_action_seed_id}
        />
      ) : null}
      {isTxHashOpen && txParams ? (
        <CallBackModal
          isOpen={isTxHashOpen}
          onRequestClose={() => {
            setIsTxHashOpen(false);
            history.replace('/meme');
          }}
          txParams={txParams}
        />
      ) : null}
    </div>
  );
};

function Template({
  title,
  value,
  subValue,
  isAPY,
  subTargetValue,
  seed,
  pending,
  rewards,
  isRewards,
  ended,
}: {
  title: string;
  value?: string | number;
  subValue?: string;
  isAPY?: boolean;
  subTargetValue?: string;
  seed?: Seed;
  pending?: boolean;
  rewards?: Record<string, string>;
  isRewards?: boolean;
  ended?: boolean;
}) {
  const { tokenPriceList, allTokenMetadatas } = useContext(MemeContext);
  function getApyTip() {
    const farmList = seed.farmList || [];
    let farmStr = '';
    farmList.forEach((farm: FarmBoost) => {
      farmStr += `<div class="flex items-center justify-between text-xs text-farmText mt-1">
          <img src="${
            farm?.token_meta_data?.icon
          }" class="w-5 h-5 rounded-full" />
          <span class="text-xs">${
            pending || ended
              ? '-'
              : formatPercentage(
                  Big(farm.apr || 0)
                    .mul(100)
                    .toFixed()
                )
          }</span>
      </div>`;
    });
    const result =
      `<div class="px-2">
       <div>
        <div class="flex items-center justify-between text-xs text-farmText gap-3.5">
          <span>Staking APR</span>
          <span class="text-white text-sm">${
            pending || ended ? '-' : formatPercentage(value)
          }</span>
        </div>` +
      farmStr +
      `</div>
        <div class="flex items-center justify-between text-xs text-farmText gap-3.5 mt-2">
          <span>Farm APR</span>
          <span class="text-white text-sm">${
            subTargetValue || formatPercentage(subValue)
          }</span>
      </div>
    </div>`;
    return result;
  }
  function getRewardsTip() {
    let result = '';
    Object.entries(rewards || {}).forEach(([tokenId, amount]) => {
      const metadata: TokenMetadata = allTokenMetadatas[tokenId];
      const num = toReadableNumber(metadata.decimals, amount);
      result += `<div class="flex items-center justify-between text-xs text-farmText mt-1 gap-5">
          <img src="${metadata?.icon}" class="w-5 h-5 rounded-full" />
          <span class="text-xs">${toInternationalCurrencySystem_number(
            num
          )}</span>
      </div>`;
    });
    return result;
  }
  function getUnClaimedRewards() {
    if (Object.keys(rewards || {}).length) {
      const rewardsValue = Object.keys(rewards).reduce((acc, tokenId) => {
        const amount = rewards[tokenId];
        const metadata: TokenMetadata = allTokenMetadatas[tokenId];
        const price = tokenPriceList[tokenId]?.price || 0;
        const num = toReadableNumber(metadata.decimals, amount);
        const value = new Big(num).mul(price).toFixed();
        return acc.plus(value);
      }, Big(0));
      return toInternationalCurrencySystem_usd(rewardsValue.toFixed());
    } else {
      return '-';
    }
  }
  return (
    <div className="flex flex-col justify-between gap-0.5">
      {/* title */}
      {isAPY ? (
        <div
          style={{ width: '40px' }}
          data-class="reactTip"
          data-tooltip-id={`apyId_${seed?.seed_id}`}
          data-place="top"
          data-tooltip-html={getApyTip()}
        >
          <span className="text-sm text-white border-b border-dashed border-white relative -top-0.5">
            {title}
          </span>
          <CustomTooltip id={`apyId_${seed?.seed_id}`} />
        </div>
      ) : null}
      {isRewards ? (
        <div
          style={{ width: '90px' }}
          data-class="reactTip"
          data-tooltip-id={`rewards_${seed?.seed_id}`}
          data-place="top"
          data-tooltip-html={getRewardsTip()}
        >
          <span
            className={`text-sm text-white relative -top-0.5 ${
              Object.keys(rewards || {}).length
                ? 'border-b border-dashed border-white'
                : ''
            }`}
          >
            {title}
          </span>
          <CustomTooltip id={`rewards_${seed?.seed_id}`} />
        </div>
      ) : null}
      {!isAPY && !isRewards ? (
        <span className="text-sm text-white">{title}</span>
      ) : null}
      {/* content */}
      <div className="flex items-end gap-1">
        {isAPY ? (
          <span className="text-xl text-white gotham_bold">
            {pending || ended ? '-' : formatPercentageUi(value)}
          </span>
        ) : null}
        {isRewards ? (
          <span className="text-xl text-white gotham_bold">
            {getUnClaimedRewards()}
          </span>
        ) : null}
        {!isAPY && !isRewards ? (
          <span className="text-xl text-white gotham_bold">{value}</span>
        ) : null}
        {subValue ? (
          <span className="text-xs text-white relative -top-1">
            {isAPY
              ? subTargetValue || '+' + formatPercentageUi(subValue)
              : subValue}
          </span>
        ) : null}
      </div>
    </div>
  );
}
export default SeedsBox;
