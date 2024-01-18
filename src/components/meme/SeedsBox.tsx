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
import { getMemeConfig, claim, getSeedApr } from '../../services/meme';
import { toReadableNumber } from '../../utils/numbers';
import {
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
  formatPercentage,
  formatPercentageUi,
} from '../../utils/uiNumber';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { UserSeedInfo, Seed } from '~src/services/farm';
import { TokenMetadata } from '~src/services/ft-contract';
import { WalletContext } from '../../utils/wallets-integration';
import StakeModal from './StakeModal';
import UnStakeModal from './UnStakeModal';
import CallBackModal from './CallBackModal';
import {
  getURLInfo,
  parsedArgs,
} from '../../components/layout/transactionTipPopUp';
import { checkTransaction } from '../../services/swap';

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
  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res: any) => {
        debugger;
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
  function getUnClaimedRewards(seed_id: string) {
    const rewards = unclaimed_rewards[seed_id];
    if (rewards) {
      const [rewardsAmount, rewardsValue] = Object.keys(rewards).reduce(
        (acc, tokenId) => {
          const amount = rewards[tokenId];
          const metadata: TokenMetadata = allTokenMetadatas[tokenId];
          const price = tokenPriceList[tokenId]?.price || 0;
          const num = toReadableNumber(metadata.decimals, amount);
          const value = new Big(num).mul(price).toFixed();
          return [acc[0].plus(num), acc[1].plus(value)];
        },
        [Big(0), Big(0)]
      );
      return {
        amount: toInternationalCurrencySystem_number(rewardsAmount.toFixed()),
        value: toInternationalCurrencySystem_usd(rewardsValue.toFixed()),
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
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-4 mt-14">
      {Object.entries(seeds).map(([seed_id, seed]) => {
        const stakeButtonDisabled =
          !user_balances[seed_id] || +user_balances[seed_id] == 0;
        const unStakeButtonDisabled =
          +(user_seeds[seed_id]?.free_amount || 0) == 0;
        const claimButtonDisabled =
          Object.keys(unclaimed_rewards[seed_id] || {}).length == 0;
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
                <div className="flex items-center justify-between">
                  <span className="text-xl gotham_bold text-white">
                    {seed.token_meta_data.symbol}
                  </span>
                  <div
                    onClick={() => {
                      goFarmDetail(seed_id);
                    }}
                    className="flex items-center border border-memePoolBoxBorderColor cursor-pointer gap-2 rounded-lg h-8 px-2"
                  >
                    <span className="text-xs text-white">
                      {seed.token_meta_data.symbol}/NEAR
                    </span>
                    <ArrowRightIcon />
                  </div>
                </div>
                <p className="text-sm text-primaryText">
                  {memeConfig.description[seed_id]}
                </p>
              </div>
            </div>
            {/* base data */}
            <div className="grid grid-cols-3 grid-rows-2 gap-y-6 mt-5">
              <Template
                title="Total Feed"
                value={getSeedStaked(seed_id).amount}
                subValue={getSeedStaked(seed_id).value}
              />
              <Template
                title="APY"
                value={getSeedApr(seeds[seed_id])}
                subValue={getSeedApr(lpSeeds[seed_id])}
                isAPY={true}
              />
              <Template title="Feeder" value={getFeeder(seed_id)} />
              <Template
                title="You Feed"
                value={getSeedUserStaked(seed_id).amount}
                subValue={getSeedUserStaked(seed_id).value}
              />
              <Template
                title="You Reward"
                value={getUnClaimedRewards(seed_id).amount}
                subValue={getUnClaimedRewards(seed_id).value}
              />
              <Template
                title="Balance"
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
                minWidth="7rem"
                disabled={claimButtonDisabled || claim_seed_id == seed_id}
                onClick={() => {
                  seedClaim(seed);
                }}
                className={`flex items-center justify-center border border-greenLight rounded-xl h-12 text-greenLight text-base gotham_bold focus:outline-none ${
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
                minWidth="7rem"
                disabled={unStakeButtonDisabled}
                onClick={() => {
                  set_modal_action_seed_id(seed.seed_id);
                  setIsUnStakeOpen(true);
                }}
                className={`flex items-center justify-center border border-greenLight rounded-xl h-12 text-greenLight text-base gotham_bold focus:outline-none ${
                  unStakeButtonDisabled ? 'opacity-30' : ''
                }`}
              >
                <ButtonTextWrapper loading={false} Text={() => <>Unstake</>} />
              </OprationButton>
              <OprationButton
                minWidth="7rem"
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
}: {
  title: string;
  value: string | number;
  subValue?: string;
  isAPY?: boolean;
}) {
  function getApyTip() {
    const result = `<div class="px-2">
        <div class="flex items-center justify-between text-xs textfarmText gap-3.5">
          <span>Staking APR</span>
          <span>${formatPercentage(value)}</span>
        </div>
        <div class="flex items-center justify-between text-xs textfarmText gap-3.5 mt-2">
          <span>Farm APR</span>
          <span>${formatPercentage(subValue)}</span>
      </div>
    </div>`;
    return result;
  }

  return (
    <div className="flex flex-col justify-between gap-0.5">
      {isAPY ? (
        <div
          style={{ width: '40px' }}
          data-class="reactTip"
          data-tooltip-id="apyId"
          data-place="top"
          data-tooltip-html={getApyTip()}
        >
          <span className="text-sm text-white border-b border-dashed border-white relative -top-0.5">
            {title}
          </span>
          <CustomTooltip id="apyId" />
        </div>
      ) : (
        <span className="text-sm text-white">{title}</span>
      )}
      <div className="flex items-end gap-1">
        <span className="text-xl text-white gotham_bold">
          {isAPY ? formatPercentageUi(value) : value}
        </span>
        {subValue ? (
          <span className="text-xs text-white relative -top-1">
            {isAPY ? '+' + formatPercentageUi(subValue) : subValue}
          </span>
        ) : null}
      </div>
    </div>
  );
}
export default SeedsBox;
