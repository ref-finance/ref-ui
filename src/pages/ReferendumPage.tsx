import React, { useState, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { WRAP_NEAR_CONTRACT_ID } from '~services/wrap-near';
import { Card } from '../components/card/Card';
import { REF_TOKEN_ID } from '../services/near';
import {
  ftGetTokenMetadata,
  TokenMetadata,
  REF_META_DATA,
} from '../services/ft-contract';
import { Images } from '~components/stableswap/CommonComp';
import { wnearMetadata } from '../services/wrap-near';
import { usePoolShare } from '../state/pool';
import { NewGradientButton } from '../components/button/Button';
import { useHistory } from 'react-router-dom';
import {
  getAccountInfo,
  getVEMetaData,
  getVEConfig,
} from '../services/referendum';
import { ONLY_ZEROS, toPrecision } from '../utils/numbers';
import { VotingPowerIcon } from '~components/icon/Referendum';
import { LOVEBoosterIcon, PowerZone } from '../components/icon/Referendum';
import Modal from 'react-modal';
import { CloseIcon, mapToView } from '../components/icon/Actions';
import { Symbols } from '../components/stableswap/CommonComp';
import { NewFarmInputAmount } from '~components/forms/InputAmount';
import { isMobile } from '../utils/device';
import { VEConfig } from '../services/referendum';
import { useMultiplier } from '~state/referendum';

const getPoolId = (env: string = process.env.NEAR_ENV) => {
  switch (env) {
    case 'pub-testnet':
      return 269;
    case 'testnet':
      return 269;
    case 'mainnet':
      return 79;
    default:
      return 79;
  }
};

const ModalWrapper = (props: Modal.Props & { title: JSX.Element | string }) => {
  const { isOpen, onRequestClose, title } = props;

  const cardWidth = isMobile() ? '90vw' : '25vw';
  const cardHeight = isMobile() ? '90vh' : '80vh';
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          overflow: 'auto',
        },
        content: {
          outline: 'none',
        },
      }}
    >
      <Card
        width="w-full"
        className="border border-gradientFrom border-opacity-50 flex flex-col justify-center text-white"
        style={{
          width: cardWidth,
          maxHeight: cardHeight,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xl ">{title}</span>

          <button className="pl-2 pb-1" onClick={onRequestClose}>
            <CloseIcon width="12" height="12" />
          </button>
        </div>

        {props.children}
      </Card>
    </Modal>
  );
};

const LockPopUp = ({
  isOpen,
  onRequestClose,
  tokens,
  lpShare,
}: {
  isOpen: boolean;
  onRequestClose: (e?: any) => void;
  tokens: TokenMetadata[];
  lpShare: string;
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const [duration, setDuration] = useState<number>();

  const [config, setConfig] = useState<VEConfig>();

  useEffect(() => {
    getVEConfig().then((res) => setConfig(res));
  }, []);

  const multiplier = useMultiplier({
    duration: duration || 0,
    maxMultiplier: config?.max_locking_multiplier || 20000,
    maxDuration: config?.max_locking_duration_sec || 31104000,
  });

  console.log(multiplier);

  if (!config) return null;

  const Durations = () => (
    <div className="w-full flex items-center">
      {[2592000, 7776000, 15552000, 31104000].map((d, i, array) => {
        const base = array[0];
        return (
          <button
            key={d}
            className={`rounded-lg  mr-2.5 hover:bg-gradientFrom  ${
              duration === d
                ? 'text-chartBg bg-gradientFrom'
                : 'text-primaryText bg-black bg-opacity-20'
            } hover:text-chartBg px-3 py-1 text-xs`}
            onClick={() => setDuration(d)}
          >
            <span>
              {d / base} &nbsp;
              <FormattedMessage
                id={d / base > 1 ? 'months' : 'month'}
                defaultMessage={d / base > 1 ? 'months' : 'month'}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
  return (
    <ModalWrapper
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={
        <FormattedMessage id="lock_lp_tokens" defaultMessage="Lock LP Tokens" />
      }
    >
      <div className="flex flex-col text-white pt-8">
        <div className="flex items-center justify-between pb-5">
          <div className="flex items-center">
            <Images tokens={tokens} size={'7'} />
            &nbsp;
            <Symbols withArrow={false} tokens={tokens} />
          </div>
          <span>{toPrecision(lpShare, 2)}</span>
        </div>

        <NewFarmInputAmount max={lpShare} onChangeAmount={setInputValue} />

        <div className="text-sm text-primaryText py-5">
          <FormattedMessage id="durations" defaultMessage="Durations" />
        </div>

        <Durations />

        <div className="text-sm text-primaryText pt-7 pb-2.5 flex items-center justify-between">
          <span>
            <FormattedMessage id="get" defaultMessage="Get" />
          </span>

          <span className="bg-gradientFromHover rounded-md text-xs px-1 text-black">
            {multiplier.toFixed(1)}x
          </span>
        </div>
      </div>
    </ModalWrapper>
  );
};

const VotingPowerCard = ({ veShare }: { veShare: string }) => {
  return (
    <div className="rounded-2xl bg-veVotingPowerCard flex p-6 font-bold text-black ml-5 mb-2 h-52">
      <div className="flex flex-col">
        <span>
          <FormattedMessage id="voting_power" defaultMessage={'Voting Power'} />
        </span>

        <span className="pt-10">
          {veShare || '0'}
          <div className="text-sm font-normal">{'veLPT'}</div>
        </span>
      </div>
      <div>
        <VotingPowerIcon />
      </div>
    </div>
  );
};

const FarmBoosterCard = ({ veShare }: { veShare: string }) => {
  const history = useHistory();

  return (
    <div className="rounded-2xl bg-veFarmBoostCard flex p-6 font-bold text-senderHot ml-5 mt-2 h-52 relative">
      <div className="flex flex-col">
        <span>
          <FormattedMessage id="farm_booster" defaultMessage={'Farm Booster'} />
        </span>

        <span className="text-white pt-10">
          {veShare || '0'}
          <div className="text-sm font-normal">{'LOVE'}</div>
        </span>
      </div>
      <div>
        <LOVEBoosterIcon />
      </div>

      <button
        className="absolute right-4 bottom-4 font-normal text-sm"
        onClick={() => {
          history.push('/farmsBoost');
        }}
      >
        <FormattedMessage id="go_to_farm" defaultMessage="Go to farm" />
        <span className="ml-1">↗</span>
      </button>
    </div>
  );
};

const PosterCard = ({ veShare }: { veShare: string }) => {
  return (
    <div className="flex flex-col text-3xl font-bold">
      <VotingPowerCard veShare={veShare} />
      <FarmBoosterCard veShare={veShare} />
    </div>
  );
};

const UserReferendumCard = ({ veShare }: { veShare: string }) => {
  const tokens = [REF_META_DATA, wnearMetadata];

  const [lockPopOpen, setLockPopOpen] = useState<boolean>(false);

  const id = getPoolId();

  const lpShare = usePoolShare(id);

  const history = useHistory();

  return (
    <Card
      className="flex flex-col relative z-50"
      width="w-2/3"
      bgcolor="bg-veUserCard"
    >
      <span className="pb-24 text-5xl valueStyle font-bold">
        <FormattedMessage
          id="unlock_your_defi_power"
          defaultMessage="Unlock your DeFi Power"
        />
      </span>
      <div className=" flex items-center text-lg">
        <Images tokens={tokens} size="6" />
        <span className="pl-3">LP tokens</span>
      </div>

      <div className="flex items-center justify-between mt-5">
        <div className="flex flex-col">
          <span
            className={`text-3xl font-bold text-gradientFromHover ${
              ONLY_ZEROS.test(lpShare) ? 'opacity-20' : ''
            }`}
            title={lpShare}
          >
            {toPrecision(lpShare, 2)}
          </span>

          <span className="text-sm text-primaryText">
            <FormattedMessage
              id="avaliable_to_lock"
              defaultMessage="Avaliable to lock"
            />
          </span>
        </div>

        <NewGradientButton
          className="text-sm px-5 py-3 w-40"
          text="get lp tokens ↗"
          onClick={() => history.push(`/pool/${id}`)}
        />
      </div>

      <div className="flex items-center justify-between mt-5">
        <div className="flex flex-col">
          <span
            className={`text-3xl font-bold text-gradientFromHover ${
              ONLY_ZEROS.test(lpShare) ? 'opacity-20' : ''
            }`}
          >
            {toPrecision(lpShare, 2)}
          </span>

          <span className="text-sm text-primaryText">
            <FormattedMessage id="locked" defaultMessage="Locked" />
          </span>
        </div>
      </div>

      <div className="text-sm flex items-center pt-6">
        <NewGradientButton
          className="w-full mr-4"
          text={<FormattedMessage id="lock" defaultMessage="Lock" />}
          onClick={() => setLockPopOpen(true)}
        />

        <button
          type="button"
          className="px-5 py-3 rounded-lg w-40 flex-shrink-0"
          style={{
            backgroundColor: '#445867',
            opacity: '0.3',
          }}
          disabled={true}
        >
          <FormattedMessage id="unlock" defaultMessage={'Unlock'} />
        </button>
      </div>

      <LockPopUp
        isOpen={lockPopOpen}
        onRequestClose={() => setLockPopOpen(false)}
        tokens={tokens}
        lpShare={lpShare}
      />
    </Card>
  );
};

export const ReferendumPage = () => {
  const [accountInfo, setAccountInfo] = useState<string>();

  const [veShare, setVeShare] = useState<string>();

  useEffect(() => {
    getAccountInfo().then(setAccountInfo);

    getVEMetaData().then((res) => console.log(res));
  }, []);

  return (
    <div className="m-auto lg:w-1024px xs:w-full md:w-5/6 text-white relative">
      <div className="m-auto text-3xl font-bold mb-1 ml-4">
        <FormattedMessage
          id="lock_your_lp_tokens"
          defaultMessage="Lock Your LP Tokens"
        />
      </div>
      <div className="w-full flex ">
        <UserReferendumCard veShare={veShare} />
        <PosterCard veShare={veShare} />
      </div>

      <div
        className="absolute -top-12 z-20"
        style={{
          right: '40%',
        }}
      >
        <PowerZone />
      </div>
    </div>
  );
};
