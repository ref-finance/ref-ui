import React, { useState, useContext, useEffect, useMemo } from 'react';
import Big from 'big.js';
import { ArrowRightIcon } from './icons';
import { useHistory } from 'react-router';
import {
  OprationButton,
  ButtonTextWrapper,
} from 'src/components/button/Button';
import { MemeContext } from './context';
import { claim_all, claim, xrefClaim } from '../../services/meme';
import { getMemeDataConfig, getMemeContractConfig } from './memeConfig';
import {
  formatPercentage,
  toInternationalCurrencySystem_number,
  toInternationalCurrencySystem_usd,
} from '../../utils/uiNumber';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { Seed } from '~src/services/farm';
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
import {
  emptyObject,
  getSeedApr,
  getAccountFarmData,
  getAccountButtonStatus,
} from './tool';
import RewardList from './RewardList';

const is_mobile = isMobile();
export interface ITxParams {
  action: 'stake' | 'unstake';
  params: any;
  txHash: string;
  receiver_id: string;
}
const MySeedsBox = ({ hidden }: { hidden: boolean }) => {
  const {
    seeds,
    lpSeeds,
    xrefSeeds,
    memeFarmContractUserData,
    xrefFarmContractUserData,
    xrefTokenId,
    tokenPriceList,
    allTokenMetadatas,
  } = useContext(MemeContext);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [isStakeOpen, setIsStakeOpen] = useState(false);
  const [isUnStakeOpen, setIsUnStakeOpen] = useState(false);
  const [isTxHashOpen, setIsTxHashOpen] = useState(false);
  const [txParams, setTxParams] = useState<ITxParams>();
  const [modal_action_seed_id, set_modal_action_seed_id] = useState('');
  const [claim_id, set_claim_id] = useState('');
  const memeDataConfig = getMemeDataConfig();
  const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
  const displaySeeds: Record<string, Seed> = useMemo(() => {
    if (
      memeFarmContractUserData &&
      xrefFarmContractUserData &&
      !emptyObject(seeds)
    ) {
      const joinMemeSeedIds = new Set();
      Object.keys(memeFarmContractUserData.join_seeds).forEach((memeSeedId) =>
        joinMemeSeedIds.add(memeSeedId)
      );
      const MEME_TOKEN_XREF_MAP_REVERSE = Object.entries(
        MEME_TOKEN_XREF_MAP
      ).reduce(
        (acc, [memeTokenId, xrefContractId]) => ({
          ...acc,
          ...{ [xrefContractId]: memeTokenId },
        }),
        {}
      );
      Object.entries(xrefFarmContractUserData)
        .reduce((acc, [xrefContractId, accountData]) => {
          if (!emptyObject(accountData.join_seeds)) {
            acc.push(MEME_TOKEN_XREF_MAP_REVERSE[xrefContractId]);
          }
          return acc;
        }, [])
        .forEach((memeSeedId) => joinMemeSeedIds.add(memeSeedId));
      return Object.entries(seeds).reduce((acc, [memeTokenId, seed]) => {
        if (joinMemeSeedIds.has(memeTokenId))
          return { ...acc, ...{ [memeTokenId]: seed } };
        return acc;
      }, {});
    }
    return {};
  }, [memeFarmContractUserData, xrefFarmContractUserData, seeds, xrefSeeds]);
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
    set_claim_id(seed.seed_id);
    claim(seed);
  }
  function xrefSeedClaim(seed: Seed) {
    const xrefContractId = MEME_TOKEN_XREF_MAP[seed.seed_id];
    const xrefSeed = xrefSeeds[xrefContractId];
    set_claim_id(xrefContractId);
    xrefClaim(xrefContractId, xrefSeed);
  }
  function seedClaimAll({
    claim_id,
    seed,
    xrefSeed,
    xrefContractId,
  }: {
    claim_id: string;
    seed: Seed;
    xrefSeed: Seed;
    xrefContractId: string;
  }) {
    set_claim_id(claim_id);
    claim_all({
      seed,
      xrefSeed,
      xrefContractId,
    });
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
  if (
    !memeFarmContractUserData ||
    !xrefFarmContractUserData ||
    emptyObject(displaySeeds)
  )
    return null;
  return (
    <div
      className={`grid gap-4 xsm:grid-cols-1 xsm:grid-rows-1 lg:grid-cols-2 lg:grid-rows-2 xsm:mx-3 ${
        hidden ? 'hidden' : ''
      }`}
    >
      {!emptyObject(displaySeeds) &&
        Object.entries(displaySeeds).map(([seed_id, seed]) => {
          const hasLpSeed = lpSeeds[seed_id]?.farmList[0]?.status !== 'Ended';
          const {
            memeUnStakeButtonDisabled,
            memeClaimButtonDisabled,
            xrefUnStakeButtonDisabled,
            xrefClaimButtonDisabled,
          } = getAccountButtonStatus({
            memeFarmContractUserData,
            xrefFarmContractUserData,
            MEME_TOKEN_XREF_MAP,
            seed_id,
            xrefTokenId,
          });
          const {
            memeAmount,
            memeUsd,
            xrefAmount,
            xrefUsd,
            memeUnclaimedUsd,
            xrefUnclaimedUsd,
            memeUnclaimed,
            xrefUnclaimed,
          } = getAccountFarmData({
            memeFarmContractUserData,
            xrefFarmContractUserData,
            seed_id,
            xrefTokenId,
            tokenPriceList,
            seeds,
            xrefSeeds,
            allTokenMetadatas,
          });
          const unStakeButtonDisabled =
            memeUnStakeButtonDisabled && xrefUnStakeButtonDisabled;
          const claimButtonDisabled =
            memeClaimButtonDisabled && xrefClaimButtonDisabled;
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
                    {memeDataConfig.meme_winner_tokens.includes(seed_id) ? (
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
                    ) : null}
                  </div>
                  <p className="text-sm text-primaryText xsm:hidden">
                    {memeDataConfig.description[seed_id]}
                  </p>
                </div>
              </div>
              <p className="text-sm text-primaryText lg:hidden mt-2">
                {memeDataConfig.description[seed_id]}
              </p>
              <div className="mt-5">
                {/* title */}
                <div className="grid grid-cols-2">
                  <span className="text-sm text-white">Your Feed</span>
                  <span className="text-sm text-white ml-5">Your Reward</span>
                </div>
                {/* line1 */}
                <div className="grid grid-cols-2 mt-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={seed?.token_meta_data?.icon}
                      className="w-8 h-8 rounded-full relative top-1"
                    />
                    <div className="flex flex-col">
                      <span className="text-white text-xl gotham_bold">
                        {toInternationalCurrencySystem_number(memeAmount)}
                      </span>
                      <span className="text-white text-sm">
                        {toInternationalCurrencySystem_usd(memeUsd)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col ml-5">
                    <span className="text-white text-xl gotham_bold">
                      {toInternationalCurrencySystem_usd(memeUnclaimedUsd)}
                    </span>
                    <RewardList rewards={memeUnclaimed} />
                  </div>
                </div>
                {/* line2 */}
                <div className="grid grid-cols-2 mt-6">
                  <div className="flex items-start gap-3">
                    <img
                      src={allTokenMetadatas?.[xrefTokenId]?.icon}
                      className="w-8 h-8 relative top-1"
                    />
                    <div className="flex flex-col">
                      <span className="text-white text-xl gotham_bold">
                        {toInternationalCurrencySystem_number(xrefAmount)}
                      </span>
                      <span className="text-white text-sm">
                        {toInternationalCurrencySystem_usd(xrefUsd)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col ml-5">
                    <span className="text-white text-xl gotham_bold">
                      {toInternationalCurrencySystem_usd(xrefUnclaimedUsd)}
                    </span>
                    <RewardList rewards={xrefUnclaimed} />
                  </div>
                </div>
                {/* line3 operation */}
                <div
                  className={`flex items-center justify-between mt-6 gap-3 xsm:flex-col-reverse`}
                >
                  <div className="flex items-center flex-grow gap-3 xsm:w-full">
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
                  <OprationButton
                    disabled={claimButtonDisabled || claim_id == seed_id}
                    onClick={() => {
                      seedClaimAll({
                        claim_id: seed.seed_id,
                        seed: memeClaimButtonDisabled ? undefined : seed,
                        xrefSeed: xrefClaimButtonDisabled
                          ? undefined
                          : xrefSeeds[MEME_TOKEN_XREF_MAP[seed_id]],
                        xrefContractId: xrefClaimButtonDisabled
                          ? undefined
                          : MEME_TOKEN_XREF_MAP[seed_id],
                      });
                    }}
                    className={`flex flex-grow items-center justify-center text-boxBorder rounded-xl h-12 text-base gotham_bold focus:outline-none xsm:w-full ${
                      claimButtonDisabled
                        ? 'bg-memePoolBoxBorderColor'
                        : 'bg-greenLight'
                    }`}
                  >
                    <ButtonTextWrapper
                      loading={claim_id == seed_id}
                      Text={() => <>Claim</>}
                    />
                  </OprationButton>
                </div>
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
export default MySeedsBox;
