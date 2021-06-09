import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import InputAmount from '~components/forms/InputAmount';
import {
  GreenButton,
  BorderButton,
  BorderlessButton,
} from '~components/button/Button';
import {
  getUnclaimedFarms,
  getFarms,
  claimRewardByFarm,
  FarmInfo,
} from '~services/farm';
import {
  stake,
  unstake,
  LP_TOKEN_DECIMALS,
  withdrawReward,
} from '~services/m-token';
import { toReadableNumber } from '~utils/numbers';
import { mftGetBalance } from '~services/mft-contract';
import { wallet } from '~services/near';
import { farmConfig } from '~utils/FarmData';
import Loading from '~components/layout/Loading';
import { ConnectToNearBtn } from '~components/deposit/Deposit';

export function FarmsPage() {
  const [unclaimedFarmsIsLoading, setUnclaimedFarmsIsLoading] = useState(false);
  const [unclaimedFarms, setUnclaimedFarms] = useState<FarmInfo[]>([]);
  const [farms, setFarms] = useState<FarmInfo[]>([]);
  const [error, setError] = useState<Error>();

  function loadUnclaimedFarms() {
    setUnclaimedFarmsIsLoading(true);
    getUnclaimedFarms({}).then(async (farms) => {
      setUnclaimedFarmsIsLoading(false);
      setUnclaimedFarms(farms);
    });
  }

  function loadFarmInfoList() {
    getFarms({}).then(setFarms);
  }

  useEffect(() => {
    loadUnclaimedFarms();
    loadFarmInfoList();
  }, []);

  function claimRewards() {
    const tasks = farms.map((farm) => claimRewardByFarm(farm.farm_id));
    Promise.all(tasks)
      .then(() => {
        loadUnclaimedFarms();
        loadFarmInfoList();
      })
      .catch((e) => setError);
  }

  return (
    <>
      <div className="w-1/3 flex m-auto justify-center">
        {error ? <Alert level="error" message={error.message} /> : null}
      </div>
      <div className="flex gap-x-8 px-5 -mt-12">
        <div className="w-72 relative">
          <div className="text-green-400 text-5xl px-7">Farms</div>
          <div className="text-whiteOpacity85 text-xs py-4 p-7">
            Simply stake token to earn in Farms. High APR, low risk.
          </div>
          {unclaimedFarmsIsLoading ? (
            <Loading />
          ) : (
            <div className="bg-greenOpacity100 text-whiteOpacity85 rounded-xl p-7">
              <div className="text-xl">Your Rewards</div>
              <div className="text-xs pt-4">
                {unclaimedFarms.map((farm) => (
                  <div
                    key={farm.farm_id}
                    className="py-2 flex items-center justify-between"
                  >
                    <div>{farmConfig[farm.farm_id].name}</div>
                    <div>
                      {farm.userUnclaimedReward}
                      <span> {farm.rewardToken.symbol}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-7 py-2 text-center">
                {wallet.isSignedIn() ? (
                  <button
                    className={`rounded-full text-xs px-3 py-1.5 focus:outline-none font-semibold focus:outline-none bg-white text-green-700`}
                    onClick={claimRewards}
                  >
                    Claim Rewards
                  </button>
                ) : (
                  <ConnectToNearBtn />
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex-grow">
          <div className="min-h-full overflow-auto relative mt-8 pb-4">
            <div className="grid grid-cols-3 gap-4">
              {farms.map((f) => (
                <FarmView key={f.farm_id} data={f} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function farmIdToTokenIds(farmId: string) {
  const at = farmId.indexOf('@');
  const pound = farmId.lastIndexOf('#');
  const tok1 = farmId.slice(at + 1, pound);
  const tok2 = farmId.slice(pound + 1);
  return { tok1, tok2 };
}

function FarmView({ data }: { data: FarmInfo }) {
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [unstakeVisible, setUnstakeVisible] = useState(false);
  const [stakeVisible, setStakeVisible] = useState(false);
  const [stakeBalance, setStakeBalance] = useState('0');
  const [error, setError] = useState<Error>();
  const { tok1 } = farmIdToTokenIds(data.farm_id);

  async function showUnstakeModal() {
    setUnstakeVisible(true);
  }

  async function showStakeModal() {
    const b = await mftGetBalance(tok1);
    setStakeBalance(toReadableNumber(LP_TOKEN_DECIMALS, b));
    setStakeVisible(true);
  }

  function showWithDraw() {
    setWithdrawVisible(true);
  }

  const PoolId = farmConfig[data.farm_id].poolId;
  const Icon = farmConfig[data.farm_id].icon;
  const Name = farmConfig[data.farm_id].name;
  const Description = farmConfig[data.farm_id].description;

  return (
    <Card width="w-full" className="self-start">
      <div className="pb-3 border-b flex items-center">
        <div className="flex items-center justify-center">
          <div className="h-9">
            <Icon />
          </div>
        </div>
        <div className="pl-2">
          <div>
            <a href={`/pool/${PoolId}`}>{Name}</a>
          </div>
          <div className="text-gray-300 text-xs">{Description}</div>
        </div>
      </div>
      <div className="text-center">
        {error ? <Alert level="error" message={error.message} /> : null}
      </div>
      <div className="py-2">
        {data.userStaked !== '0' ? (
          <div className="flex items-center justify-between text-xs py-2">
            <div>Shares You've Staked</div>
            <div>{data.userStaked}</div>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-xs py-2">
          <div>Rewards per week</div>
          <div>
            {data.rewardsPerWeek} {data.rewardToken.symbol}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs py-2">
          <div>Weekly rewards per</div>
          <div>
            {data.userRewardsPerWeek} {data.rewardToken.symbol}
          </div>
        </div>
        {data.userUnclaimedReward !== '0' ? (
          <div className="flex items-center justify-between text-xs py-2">
            <div>Unclaimed rewards</div>
            <div>
              {data.userUnclaimedReward} {data.rewardToken.symbol}
            </div>
          </div>
        ) : null}
      </div>
      <div>
        {wallet.isSignedIn() ? (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {data.rewardNumber !== '0' && data.userStaked !== '0' ? (
              <GreenButton onClick={() => showWithDraw()}>
                <div className="w-16 text-xs text-white">Withdraw</div>
              </GreenButton>
            ) : null}
            {data.userStaked === '0' ? (
              <BorderButton onClick={() => showStakeModal()}>
                <div className="w-10 text-greenLight">Stake</div>
              </BorderButton>
            ) : null}
            {data.userUnclaimedReward !== '0' ? (
              <BorderButton onClick={() => claimRewardByFarm(data.farm_id)}>
                <div className="w-10 text-greenLight">Claim</div>
              </BorderButton>
            ) : null}
            {data.userStaked !== '0' ? (
              <BorderlessButton onClick={() => showUnstakeModal()}>
                <div className="w-8 text-lg text-greenLight">-</div>
              </BorderlessButton>
            ) : null}
            {data.userStaked !== '0' ? (
              <BorderlessButton onClick={() => showStakeModal()}>
                <div className="w-8 text-lg text-greenLight">+</div>
              </BorderlessButton>
            ) : null}
          </div>
        ) : (
          <ConnectToNearBtn />
        )}
      </div>

      <ActionModal
        isOpen={unstakeVisible}
        onRequestClose={() => setUnstakeVisible(false)}
        title="Unstake"
        btnText="Unstake"
        max={data.userStaked}
        onSubmit={(amount) => {
          unstake({ seed_id: data.seed_id, amount }).catch(setError);
        }}
      />

      <ActionModal
        isOpen={withdrawVisible}
        onRequestClose={() => setWithdrawVisible(false)}
        title="Withdraw"
        btnText="Withdraw"
        max={data.rewardNumber}
        onSubmit={(amount) => {
          withdrawReward({
            token_id: data.reward_token,
            amount,
            token: data.rewardToken,
          }).catch(setError);
        }}
      />

      <ActionModal
        isOpen={stakeVisible}
        onRequestClose={() => {
          setStakeVisible(false);
        }}
        title="Stake"
        btnText="Stake"
        max={stakeBalance}
        onSubmit={(amount) => {
          stake({ token_id: tok1, amount }).catch(setError);
        }}
      />
    </Card>
  );
}

function ActionModal(
  props: ReactModal.Props & {
    title?: string;
    btnText?: string;
    max: string;
    onSubmit: (amount: string) => void;
  }
) {
  const { max } = props;
  const [amount, setAmount] = useState<string>('');

  return (
    <Modal {...props}>
      <Card style={{ width: '25vw' }}>
        <div className="text-sm text-gray-800 font-semibold pb-4">
          {props.title}
        </div>
        <div>
          <div className="flex justify-end text-xs font-semibold pb-2.5">
            <span className={`${max === '0' ? 'text-gray-400' : null}`}>
              Balance：
              {max}
            </span>
          </div>
          <div className="flex bg-inputBg relative overflow-hidden rounded-lg align-center my-2 border">
            <InputAmount
              className="flex-grow"
              maxBorder={false}
              // name={selectedToken?.id}
              max={max}
              value={amount}
              onChangeAmount={setAmount}
            />
          </div>
        </div>
        <div className="flex items-center justify-center pt-5">
          <GreenButton onClick={() => props.onSubmit(amount)}>
            {props.btnText}
          </GreenButton>
        </div>
      </Card>
    </Modal>
  );
}
