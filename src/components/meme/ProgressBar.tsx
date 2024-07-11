import React, { useContext, useMemo, useState } from 'react';
import Big from 'big.js';
import { FeedMe } from './ani_pc';
import { FeedMeMobile } from './ani_mobile';
import { MemeContext } from './context';
import { formatPercentage } from '../../utils/uiNumber';
import { isMobile } from '../../utils/device';
import { getMemeUiConfig } from './memeConfig';
import StakeModal from './StakeModal';
import {
  isPending,
  getListedMemeSeeds,
  emptyObject,
  getSeedsTotalStaked,
} from './tool';
import { Seed } from '../../services/farm';
const is_mobile = isMobile();
const ProgressBar = () => {
  const [isStakeOpen, setIsStakeOpen] = useState(false);
  const [modal_action_seed_id, set_modal_action_seed_id] = useState('');
  const memeUiConfig = getMemeUiConfig();
  const { seeds, user_balances } = useContext(MemeContext);
  const displaySeeds: Record<string, Seed> = useMemo(() => {
    if (!emptyObject(seeds)) {
      return getListedMemeSeeds(seeds);
    }
    return {};
  }, [seeds]);
  const totalTvl = useMemo(() => {
    if (!emptyObject(displaySeeds)) return getSeedsTotalStaked(displaySeeds);
    return 0;
  }, [displaySeeds]);
  return (
    <div className="text-white px-2.5" style={{ marginTop: '80px' }}>
      <div className="flex items-center justify-center">
        <span className="gotham_bold text-white lg:text-3xl xsm:text-xl">
          MEME Gauge Weight
        </span>
      </div>
      {/* Race */}
      {Object.entries(displaySeeds).map(([seed_id, seed]) => {
        let addW = '0';
        let percent = '';
        const seedTvl = seed.seedTvl;
        if (Big(seedTvl).gt(0) && Big(totalTvl).gt(0)) {
          const p = Big(seedTvl).div(totalTvl);
          const length = is_mobile ? window.innerWidth - 190 : 800;
          addW = p.mul(length).toFixed();
          percent = formatPercentage(p.mul(100).toFixed());
        }
        const FeedIcon = memeUiConfig.progress[seed_id].feedIcon;
        const is_pending = isPending(seed);
        const stakeButtonDisabled =
          !user_balances[seed_id] || +user_balances[seed_id] == 0 || is_pending;
        return (
          <RaceTemplate key={seed_id}>
            <div
              className="flex"
              style={{
                transform: `translateY(${memeUiConfig.progress[seed_id].translateY})`,
              }}
            >
              <div
                className="inline-flex"
                onClick={() => {
                  if (is_mobile && !stakeButtonDisabled) {
                    set_modal_action_seed_id(seed.seed_id);
                    setIsStakeOpen(true);
                  }
                }}
              >
                <div>{memeUiConfig.progress[seed_id].tail}</div>
                <div className="relative z-10" style={{ marginLeft: '-1px' }}>
                  {memeUiConfig.progress[seed_id].body(
                    memeUiConfig.progress[seed_id].initW,
                    addW,
                    percent
                  )}
                </div>
                <div style={{ marginLeft: '-1px' }}>
                  {memeUiConfig.progress[seed_id].head}
                </div>
              </div>
              {is_mobile ? (
                <div className="flex items-center justify-center relative transform -translate-y-10 ml-1.5 lg:hidden">
                  <FeedIcon className="w-8 h-8 absolute" />
                  <FeedMeMobile />
                </div>
              ) : (
                <div className="relative transform -translate-y-10 ml-1.5 xsm:hidden">
                  <FeedIcon className="w-8 h-8 absolute -top-4 left-4" />
                  <FeedMe />
                </div>
              )}
            </div>
          </RaceTemplate>
        );
      })}
      {/* Stake Modal */}
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

function RaceTemplate({ children }: any) {
  return (
    <div
      className="border-b border-greenLight border-opacity-10"
      style={{ height: is_mobile ? '130px' : '166px' }}
    >
      {children}
    </div>
  );
}

export default ProgressBar;
