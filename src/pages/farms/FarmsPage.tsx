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
import Loading from '~components/layout/Loading';
import { ConnectToNearBtn } from '~components/deposit/Deposit';
import { usePool } from '~state/pool';
import { useTokens } from '~state/token';

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
                    <div>{farm.lpTokenId}</div>
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

function FarmView({ data }: { data: FarmInfo }) {
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [unstakeVisible, setUnstakeVisible] = useState(false);
  const [stakeVisible, setStakeVisible] = useState(false);
  const [stakeBalance, setStakeBalance] = useState('0');
  const [error, setError] = useState<Error>();
  const PoolId = data.lpTokenId;
  const { pool } = usePool(PoolId);
  const tokens = useTokens(pool?.tokenIds);

  async function showUnstakeModal() {
    setUnstakeVisible(true);
  }

  async function showStakeModal() {
    const b = await mftGetBalance(data.lpTokenId);
    setStakeBalance(toReadableNumber(LP_TOKEN_DECIMALS, b));
    setStakeVisible(true);
  }

  function showWithDraw() {
    setWithdrawVisible(true);
  }

  if (!pool || !tokens || tokens.length < 2) return <Loading />;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const images = tokens.map((token, index) => {
    const { icon, id } = token;
    if (icon) return <img key={id} className="h-8 w-8" src={icon} />;
    return <div key={id} className="h-8 w-8 rounded-full border"></div>;
  });

  const symbols = tokens.map((token, index) => {
    const { symbol } = token;
    const hLine = index === 1 ? '' : '-';
    return `${symbol}${hLine}`;
  });

  return (
    <Card width="w-full" className="self-start">
      <div className="pb-3 border-b flex items-center">
        <div className="flex items-center justify-center">
          <div className="h-9">
            <div className="w-18 flex items-center justify-between">
              {images}
            </div>
          </div>
        </div>
        <div className="pl-2">
          <div>
            <a href={`/pool/${PoolId}`}>{symbols}</a>
          </div>
        </div>
      </div>
      <div className="text-center">
        {error ? <Alert level="error" message={error.message} /> : null}
      </div>
      <div className="py-2">
        {data.userStaked !== '0' ? (
          <div className="flex items-center justify-between text-xs py-2">
            <div>Your Shares</div>
            <div>{data.userStaked}</div>
          </div>
        ) : null}
        {data.userStaked === '0' ? (
          <div className="flex items-center justify-between text-xs py-2">
            <div>Rewards per week</div>
            <div>
              {data.rewardsPerWeek} {data.rewardToken.symbol}
            </div>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-xs py-2">
          <div>APR</div>
          <div>{data.apr}</div>
        </div>
        <div className="flex items-center justify-between text-xs py-2">
          <div>Total Staked</div>
          <div>${data.totalStaked}</div>
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
          stake({ token_id: data.lpTokenId, amount }).catch(setError);
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
