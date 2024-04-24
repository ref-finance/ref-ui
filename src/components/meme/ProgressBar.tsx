import React, { useContext, useEffect, useMemo, useState } from 'react';
import Big from 'big.js';
import { FeedMe } from './ani_pc';
import { FeedMeMobile } from './ani_mobile';
import { MemeContext } from './context';
import { formatPercentage } from '../../utils/uiNumber';
import { isMobile } from '../../utils/device';
import StakeModal from './StakeModal';
import { ModalClose } from '../../components/icon';
import MemeAirdropListForPc from './memeAirdropListForPc';
import {
  isPending,
  getListedMemeSeeds,
  emptyObject,
  getSeedsTotalStaked,
} from './tool';
import { Seed } from '../../services/farm';
import UserStakeRanking from './UserStakeRanking';
import { getMemeUiConfig } from './memeConfig';
//
import Modal from 'react-modal';
import { ArrowRightIcon } from './icons';
import {
  Coin,
  RuleTips,
  TriangleUp,
  TriangleDown,
} from '../icon/memeComingModal';
import { memeComingSoonJson } from '../../config/memeConfig';
import { useHistory } from 'react-router-dom';
const is_mobile = isMobile();
const ProgressBar = () => {
  const history = useHistory();
  const [isStakeOpen, setIsStakeOpen] = useState(false);
  const [modal_action_seed_id, set_modal_action_seed_id] = useState('');
  const [activeTab, setActiveTab] = useState('weight');
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

  // coming soon modal
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  // show rules
  const [isShowRules, setShowRules] = useState<Array<any>>([]);
  useEffect(() => {
    const waitDealedData = new Array(memeComingSoonJson.length).fill(false);
    setShowRules(waitDealedData);
  }, []);
  // deal rules show/hide
  const setShowRulesIndex = (index, flag) => {
    //shallow copy
    const updatedWaitDealedData = [...isShowRules];
    updatedWaitDealedData[index] = flag;
    setShowRules(updatedWaitDealedData);
  };
  //
  return (
    <div className="mt-12 rounded-2xl border border-memeBorderColor xsm:mx-3">
      <div
        className="border-b border-memeBorderColor pt-8 bg-memeVoteBgColor rounded-t-2xl pl-14 
      text-primaryText flex item-center text-2xl gotham_bold xsm:text-lg xsm:flex xsm:justify-center 
      xsm:items-center xsm:px-4 xsm:gap-4 xsm:pt-5 xsm:text-center"
      >
        <div
          className={`pb-3.5 mr-24 cursor-pointer xsm:mr-0 xsm:px-4 xsm:leading-6 whitespace-nowrap ${
            activeTab === 'weight' ? 'text-white border-b-4 border-white' : ''
          }`}
          onClick={() => setActiveTab('weight')}
        >
          MEME Gauge <br className="lg:hidden md:hidden" /> Weight
        </div>
        <div
          className={`pb-3.5 mr-24 cursor-pointer xsm:mr-0 xsm:px-4 xsm:leading-6 whitespace-nowrap ${
            activeTab === 'ranking' ? 'text-white border-b-4 border-white' : ''
          }`}
          onClick={() => setActiveTab('ranking')}
        >
          User Stake <br className="lg:hidden md:hidden" /> Ranking
        </div>
        {/* open Coming Soon modal */}
        {!is_mobile && (
          <div
            className="ml-auto flex justify-between items-center w-64 h-12 bg-memeModelgreyColor relative hover:bg-gray-700 cursor-pointer"
            style={{ borderRadius: '3.375rem', top: '-.8rem', right: '1rem' }}
            onClick={() => setIsShowModal(true)}
          >
            <div className="absolute top-0" style={{ left: '-1rem' }}>
              <Coin />
            </div>
            {/*  */}
            <span className="text-white text-base mr-6 ml-auto">
              Airdrop Announcement
            </span>
          </div>
        )}
      </div>
      <div className="py-7 px-8 bg-memeVoteBgColor rounded-b-2xl xsm:px-0 xsm:py-4">
        <div
          className="text-white px-2.5"
          hidden={activeTab === 'weight' ? false : true}
        >
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
              !user_balances[seed_id] ||
              +user_balances[seed_id] == 0 ||
              is_pending;
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
                    <div
                      className="relative z-10"
                      style={{ marginLeft: '-1px' }}
                    >
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
        <UserStakeRanking hidden={activeTab !== 'weight' ? false : true} />

        {/* mobile coming soon button */}
        {is_mobile && (
          <div
            className="flex justify-center items-center h-10 bg-memeModelgreyColor relative hover:bg-gray-700 font-normal"
            style={{
              width: '16rem',
              borderRadius: '3.375rem',
              bottom: '-.6rem',
              marginLeft: '50%',
              transform: 'translateX(-50%) ',
            }}
            onClick={() => history.push('/airdop')}
          >
            <div className="absolute top-0" style={{ left: '-1rem' }}>
              <Coin />
            </div>
            {/*  */}
            <span className="text-white text-sm ml-6 mr-2">
              Airdrop Announcement
            </span>
            <ArrowRightIcon />
          </div>
        )}
      </div>

      {/* Modal PC*/}
      {!is_mobile && (
        <MemeAirdropListForPc
          isOpen={isShowModal}
          onRequestClose={() => {
            setIsShowModal(false);
          }}
        />
      )}
      {/* Modal mobile */}
    </div>
  );
};

function RaceTemplate({ children }: any) {
  return (
    <div
      className="border-b border-greenLight border-opacity-10"
      style={{ height: is_mobile ? '110px' : '142px' }}
    >
      {children}
    </div>
  );
}

export default ProgressBar;
