import React, { useState, useContext, useMemo } from 'react';
import { ArrowRightIcon } from './icons';
import { OprationButton, ConnectToNearBtn } from 'src/components/button/Button';
import { MemeContext } from './context';
import { getMemeDataConfig, getMemeContractConfig } from './memeConfig';
import { formatPercentage } from '../../utils/uiNumber';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { Seed } from '~src/services/farm';
import { WalletContext } from '../../utils/wallets-integration';
import StakeModal from './StakeModal';
import { isMobile } from '../../utils/device';
import TotalFeed from './TotalFeed';
import YourFeed from './YourFeed';
import WalletBalance from './WalletBalance';
import YourRewards from './YourRewards';
import Feeders from './Feeders';
import APY from './APY';
import { emptyObject, getSeedApr, isPending, emptyNumber } from './tool';

const is_mobile = isMobile();

const MarketSeedsBox = ({
  hidden,
  displaySeedsPercent,
}: {
  hidden: boolean;
  displaySeedsPercent: Record<string, string>;
}) => {
  const { seeds, user_balances, lpSeeds, xrefSeeds, xrefTokenId } =
    useContext(MemeContext);
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [isStakeOpen, setIsStakeOpen] = useState(false);
  const [modal_action_seed_id, set_modal_action_seed_id] = useState('');
  const memeDataConfig = getMemeDataConfig();
  const meme_winner_tokens = memeDataConfig.meme_winner_tokens;
  const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
  const displaySeeds = useMemo(() => {
    if (emptyObject(seeds)) return {};
    return meme_winner_tokens.reduce(
      (acc, memeTokenId) => ({
        ...acc,
        ...{ [memeTokenId]: seeds[memeTokenId] },
      }),
      {}
    ) as Record<string, Seed>;
  }, [meme_winner_tokens, seeds]);
  function goFarmDetail(seed_id: string) {
    const lpSeed = lpSeeds[seed_id];
    if (lpSeed.farmList[0].status == 'Ended') {
      window.open(`/v2farms/${lpSeed.pool.id}-e`);
    } else {
      window.open(`/v2farms/${lpSeed.pool.id}-r`);
    }
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
    <div
      className={`grid gap-4 xsm:grid-cols-1 xsm:grid-rows-1 lg:grid-cols-2 xsm:mx-3 ${
        hidden ? 'hidden' : ''
      }`}
    >
      {Object.entries(displaySeeds).map(([seed_id, seed]) => {
        // const xrefSeed = xrefSeeds[MEME_TOKEN_XREF_MAP[seed_id]];
        // const is_pending = isPending(seed) && isPending(xrefSeed);
        const stakeButtonDisabled =
          emptyNumber(user_balances[seed_id]) &&
          emptyNumber(user_balances[xrefTokenId]);
        const hasLpSeed =
          lpSeeds[seed_id]?.farmList[0]?.status &&
          lpSeeds[seed_id]?.farmList[0]?.status !== 'Ended';
        return (
          <div
            key={seed_id}
            className="flex flex-col justify-between border border-memeBorderColor bg-swapCardGradient rounded-2xl px-4 py-6"
          >
            <div className="flex items-stretch gap-4">
              <div className="flex justify-center flex-shrink-0 relative">
                <img
                  src={seed.token_meta_data.icon}
                  style={{
                    width: is_mobile ? '62px' : '86px',
                    height: is_mobile ? '62px' : '86px',
                  }}
                  className="rounded-full"
                />
                <div className="flex items-center justify-center absolute top-16 xsm:top-12 bg-senderHot text-base text-cardBg px-3.5 xsm:px-1.5 xsm:py-0 xsm:text-sm py-1 rounded-lg xs:rounded-md gotham_bold border border-memeBorderBlackColor">
                  {displaySeedsPercent[seed_id]}
                </div>
              </div>
              <div className="flex flex-col justify-between gap-1.5 xsm:gap-0 flex-grow">
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
            {is_mobile ? (
              <div className="grid xsm:grid-cols-2 gap-y-6 mt-5">
                <TotalFeed seed_id={seed_id} />
                <YourFeed seed_id={seed_id} />
                <APY seed_id={seed_id} />
                <YourRewards seed_id={seed_id} />
                <Feeders seed_id={seed_id} />
                <WalletBalance seed_id={seed_id} />
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 lg:grid-rows-2 gap-y-6 mt-5">
                <TotalFeed seed_id={seed_id} />
                <APY seed_id={seed_id} />
                <Feeders seed_id={seed_id} />
                <YourFeed seed_id={seed_id} />
                <YourRewards seed_id={seed_id} />
                <WalletBalance seed_id={seed_id} />
              </div>
            )}
            {/* operation */}
            <div className={`mt-6 ${isSignedIn ? 'hidden' : ''}`}>
              <ConnectToNearBtn></ConnectToNearBtn>
            </div>
            <div
              className={`flex items-center justify-between mt-6 gap-3 xsm:flex-col-reverse ${
                isSignedIn ? '' : 'hidden'
              }`}
            >
              {stakeButtonDisabled ? (
                <div className="flex-grow w-full">
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
        <StakeModal
          isOpen={isStakeOpen}
          onRequestClose={() => {
            setIsStakeOpen(false);
          }}
          seed_id={modal_action_seed_id}
        />
      ) : null}
    </div>
  );
};
export default MarketSeedsBox;
