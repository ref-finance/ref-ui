import React, { useState, useContext, useEffect, useMemo } from 'react';
import Big from 'big.js';
import { ArrowRightIcon } from './icons';
import { useHistory } from 'react-router';
import {
  OprationButton,
  ButtonTextWrapper,
  ConnectToNearBtn,
} from 'src/components/button/Button';
import { MemeContext } from './context';
import { claim, getSeedApr, isPending, isEnded } from '../../services/meme';
import { getMemeDataConfig, getMemeContractConfig } from './memeConfig';
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
import getConfig from '../../services/config';
import StakeNewModal from './StakeNewModel';
import TotalFeed from './TotalFeed';
import YourFeed from './YourFeed';
import WalletBalance from './WalletBalance';
import YourRewards from './YourRewards';
import Feeders from './Feeders';
import APY from './APY';

const is_mobile = isMobile();
export interface ITxParams {
  action: 'stake' | 'unstake';
  params: any;
  txHash: string;
  receiver_id: string;
}
const SeedsBox = () => {
  const {
    seeds,
    xrefSeeds,
    tokenPriceList,
    user_seeds,
    user_balances,
    unclaimed_rewards,
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
  const memeDataConfig = getMemeDataConfig();
  const meme_winner_tokens = memeDataConfig.meme_winner_tokens;
  const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
  const displaySeeds = useMemo(() => {
    if (!Object.keys(seeds).length) return {};
    return meme_winner_tokens.reduce(
      (acc, memeTokenId) => ({
        ...acc,
        ...{ [memeTokenId]: seeds[memeTokenId] },
      }),
      {}
    ) as Record<string, Seed>;
  }, [meme_winner_tokens, seeds]);
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
  function getFarmAPYTip(seed_id) {
    const b = getSeedApr(lpSeeds[seed_id]);
    const result = `<div class="px-2 text-xs text-farmText">
          <div class="flex items-center justify-between text-xs text-farmText gap-3.5">
              <span>Farm APR</span>
              <span class="text-white text-sm">${formatPercentage(b)}</span>
          </div>
    </div>`;
    return result;
  }
  return (
    <div className="grid gap-4 mt-14 xsm:grid-cols-1 xsm:grid-rows-1 lg:grid-cols-2 lg:grid-rows-2 xsm:mx-3">
      {Object.entries(displaySeeds).map(([seed_id, seed]) => {
        const is_pending = isPending(seed);
        const is_ended = isEnded(seed);
        const meme_contract_id = getConfig()?.REF_MEME_FARM_CONTRACT_ID;
        const stakeButtonDisabled =
          !user_balances[seed_id] ||
          +user_balances[seed_id] == 0 ||
          is_pending ||
          meme_contract_id == 'meme-farming.ref-labs.near';

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
            className="flex flex-col justify-between border border-memeBorderColor bg-swapCardGradient rounded-2xl px-4 py-6"
          >
            <div className="flex items-stretch gap-4">
              <img
                src={seed.token_meta_data.icon}
                style={{
                  width: is_mobile ? '62px' : '86px',
                  height: is_mobile ? '62px' : '86px',
                }}
                className=" rounded-full"
              />
              <div className="flex flex-col justify-between gap-1.5 xsm:gap-0">
                <div className="flex items-center justify-between gap-1 xsm:flex-col xsm:items-start xsm:flex-grow">
                  <span className="text-xl gotham_bold text-white">
                    {seed.token_meta_data.symbol}
                  </span>
                  <div
                    data-class="reactTip"
                    data-tooltip-id={`lp_farm_${seed_id}`}
                    data-place="top"
                    data-tooltip-html={
                      hasLpSeed ? getFarmAPYTip(seed_id) : comeSoonTip()
                    }
                  >
                    <div
                      onClick={() => {
                        if (hasLpSeed) {
                          goFarmDetail(seed_id);
                        }
                      }}
                      className={`flex items-center border border-memePoolBoxBorderColor gap-2 rounded-lg h-8 px-2 ${
                        hasLpSeed
                          ? 'cursor-pointer'
                          : 'opacity-30 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-xs text-white">
                        {seed.token_meta_data.symbol}/NEAR
                      </span>
                      <ArrowRightIcon />
                    </div>
                    <CustomTooltip id={`lp_farm_${seed_id}`} />
                  </div>
                </div>
                <p className="text-sm text-primaryText xsm:hidden">
                  {memeDataConfig.description[seed_id]}
                </p>
              </div>
            </div>
            <p className="text-sm text-primaryText lg:hidden mt-2">
              {memeDataConfig.description[seed_id]}
            </p>
            {/* base data */}
            <div className="grid lg:grid-cols-3 lg:grid-rows-2 xsm:grid-cols-2 gap-y-6 mt-5">
              <TotalFeed seed_id={seed_id} />
              <APY seed_id={seed_id} />
              <Feeders seed_id={seed_id} />
              <YourFeed seed_id={seed_id} />
              <YourRewards seed_id={seed_id} />
              <WalletBalance seed_id={seed_id} />
            </div>
            {/* operation */}
            <div className={`mt-6 ${isSignedIn ? 'hidden' : ''}`}>
              <ConnectToNearBtn></ConnectToNearBtn>
            </div>
            <div
              className={`flex items-center justify-between mt-6 gap-3 xsm:flex-col-reverse ${
                isSignedIn ? '' : 'hidden'
              }`}
            >
              <div className="flex items-center flex-grow gap-3 xsm:w-full">
                <OprationButton
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
                  disabled={unStakeButtonDisabled}
                  onClick={() => {
                    set_modal_action_seed_id(seed.seed_id);
                    setIsUnStakeOpen(true);
                  }}
                  className={`flex flex-grow items-center justify-center border border-greenLight rounded-xl h-12 text-greenLight text-base gotham_bold focus:outline-none ${
                    unStakeButtonDisabled ? 'opacity-30' : ''
                  }`}
                >
                  <ButtonTextWrapper
                    loading={false}
                    Text={() => <>Unstake</>}
                  />
                </OprationButton>
              </div>
              {stakeButtonDisabled && is_pending ? (
                <div className="flex-grow">
                  <div
                    data-class="reactTip"
                    data-tooltip-id={`lp_farm_button_${seed_id}`}
                    data-place="top"
                    data-tooltip-html={comeSoonTip()}
                  >
                    <OprationButton
                      disabled={stakeButtonDisabled}
                      onClick={() => {
                        set_modal_action_seed_id(seed.seed_id);
                        setIsStakeOpen(true);
                      }}
                      className={`flex flex-grow items-center justify-center text-boxBorder rounded-xl h-12 text-base gotham_bold focus:outline-none xsm:w-full ${
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
                  disabled={stakeButtonDisabled}
                  onClick={() => {
                    set_modal_action_seed_id(seed.seed_id);
                    setIsStakeOpen(true);
                  }}
                  className={`flex flex-grow items-center justify-center text-boxBorder rounded-xl h-12 text-base gotham_bold focus:outline-none xsm:w-full ${
                    stakeButtonDisabled
                      ? 'bg-memePoolBoxBorderColor'
                      : 'bg-greenLight'
                  }`}
                >
                  Feed {seed.token_meta_data.symbol}
                </OprationButton>
              )}
            </div>
          </div>
        );
      })}
      {isStakeOpen ? (
        <StakeNewModal
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
export default SeedsBox;
