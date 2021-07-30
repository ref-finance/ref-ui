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
import { toPrecision, toReadableNumber } from '~utils/numbers';
import { mftGetBalance } from '~services/mft-contract';
import { wallet } from '~services/near';
import Loading from '~components/layout/Loading';
import { ConnectToNearBtn } from '~components/deposit/Deposit';
import { useTokens } from '~state/token';
import copy from '~utils/copy';
import { Info } from '~components/icon/Info';
import ReactTooltip from 'react-tooltip';
import { toRealSymbol } from '~utils/token';
import { getPoolDetails } from '~services/pool';
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import ReactModal from 'react-modal';
import { isMobile } from '~utils/device';

export function FarmsPage() {
  const [unclaimedFarmsIsLoading, setUnclaimedFarmsIsLoading] = useState(false);
  const [unclaimedFarms, setUnclaimedFarms] = useState<FarmInfo[]>([]);
  const [farms, setFarms] = useState<FarmInfo[]>([]);
  const [error, setError] = useState<Error>();

  function loadUnclaimedFarms() {
    setUnclaimedFarmsIsLoading(true);
    getUnclaimedFarms({})
      .then(async (farms) => {
        setUnclaimedFarmsIsLoading(false);
        setUnclaimedFarms(farms);
      })
      .catch((error) => {
        setUnclaimedFarmsIsLoading(false);
        setError(error);
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
    setUnclaimedFarmsIsLoading(true);
    const tasks = farms.map((farm) => claimRewardByFarm(farm.farm_id));
    Promise.all(tasks)
      .then(() => {
        loadUnclaimedFarms();
        loadFarmInfoList();
      })
      .catch(setError);
  }

  return (
    <>
      <div className="w-1/3 xs:w-full md:w-full flex m-auto justify-center">
        {error ? <Alert level="error" message={error.message} /> : null}
      </div>
      <div className="flex gaps-x-8 px-5 -mt-12 xs:flex-col xs:mt-8 md:flex-col md:mt-8">
        <div className="w-96 mr-4 relative xs:w-full md:w-full">
          <div className="text-green-400 text-5xl px-7 xs:text-center md:text-center">
            Farms
          </div>
          <div className="text-whiteOpacity85 text-xs py-4 p-7">
            Stake your liquidity provider (LP) tokens to earn rewards!
          </div>
          {unclaimedFarmsIsLoading ? (
            <Loading />
          ) : (
            <div className="bg-greenOpacity100 text-whiteOpacity85 rounded-xl p-7">
              <div className="text-xl">Your Rewards</div>
              <div className="text-xs pt-4">
                {unclaimedFarms.map((farm) => (
                  <ClaimView key={farm.farm_id} data={farm} />
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
        <div className="flex-grow xs:flex-none">
          <div className="overflow-auto relative mt-8 pb-4">
            <div className="grid grid-cols-3 gap-4 xs:grid-cols-1 md:grid-cols-1">
              {farms.map((farm) => (
                <FarmView key={farm.farm_id} data={farm} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ClaimView({ data }: { data: FarmInfo }) {
  const [firstToken, setFirstToken] = useState<TokenMetadata>();
  const [secondToken, setSecondToken] = useState<TokenMetadata>();

  useEffect(() => {
    getPoolDetails(Number(data.lpTokenId)).then((pool) => {
      ftGetTokenMetadata(pool.tokenIds[0]).then((token) => {
        setFirstToken(token);
      });
      ftGetTokenMetadata(pool.tokenIds[1]).then((token) => {
        setSecondToken(token);
      });
    });
  }, [data]);
  if (!firstToken || !secondToken) return Loading();

  return (
    <div>
      <div
        key={data.farm_id}
        className="py-2 flex items-center justify-between"
      >
        <div>{`${toRealSymbol(firstToken.symbol)}-${toRealSymbol(
          secondToken.symbol
        )}`}</div>
        <div>
          {data.userUnclaimedReward}
          <span> {toRealSymbol(data.rewardToken.symbol)}</span>
        </div>
      </div>
    </div>
  );
}

function FarmView({ data }: { data: FarmInfo }) {
  const [farmsIsLoading, setFarmsIsLoading] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [unstakeVisible, setUnstakeVisible] = useState(false);
  const [stakeVisible, setStakeVisible] = useState(false);
  const [stakeBalance, setStakeBalance] = useState('0');
  const [error, setError] = useState<Error>();
  const [ended, setEnded] = useState<boolean>(false);
  const [pending, setPending] = useState<boolean>(false);
  const PoolId = data.lpTokenId;
  const tokens = useTokens(data?.tokenIds);

  useEffect(() => {
    setEnded(data.farm_status === 'Ended');
    setPending(data.farm_status === 'Created');
  }, [data]);

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

  function claimReward(farm_id: string) {
    setFarmsIsLoading(true);
    claimRewardByFarm(farm_id)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        setFarmsIsLoading(false);
        setError(error);
      });
  }

  if (!tokens || tokens.length < 2 || farmsIsLoading) return <Loading />;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const images = tokens.map((token, index) => {
    const { icon, id } = token;
    if (icon)
      return <img key={id} className="h-8 w-8 xs:h-6 xs:w-6" src={icon} />;
    return (
      <div key={id} className="h-8 w-8 xs:h-6 xs:w-6 rounded-full border"></div>
    );
  });

  const symbols = tokens.map((token, index) => {
    const { symbol } = token;
    const hLine = index === 1 ? '' : '-';
    return `${toRealSymbol(symbol)}${hLine}`;
  });

  return (
    <Card width="w-full" className="self-start" padding={'p-0'}>
      <div
        className={`${
          ended ? 'rounded-t-xl bg-gray-300 bg-opacity-50' : ''
        } border-b flex items-center p-6 relative overflow-hidden flex-wrap`}
      >
        <div className="flex items-center justify-center">
          <div className="h-9 xs:h-6">
            <div className="w-18 xs:w-12 flex items-center justify-between">
              {images}
            </div>
          </div>
        </div>
        <div className="pl-2 order-2 lg:ml-auto xl:m-0">
          <div>
            <a href={`/pool/${PoolId}`} className="xs:text-sm">
              {symbols}
            </a>
            <p className="text-xs text-gray-400">
              Earn {toRealSymbol(data?.rewardToken?.symbol)}
            </p>
          </div>
        </div>
        {ended ? <div className="ended status-bar">ENDED</div> : null}
        {pending ? <div className="pending status-bar">PENDING</div> : null}
        <div className="ml-auto order-3 lg:w-full lg:mt-2 xl:w-auto xl:mt-0">
          <div className="inline-block">
            <a
              className="hover:text-green-500 text-lg xs:text-sm font-bold p-2 cursor-pointer text-green-500"
              href={`/pool/${PoolId}`}
            >
              View Pool
            </a>
          </div>
          <div className="inline-block">
            <div
              data-type="dark"
              data-place="bottom"
              data-multiline={true}
              data-tip={copy.getLPTokenCopy}
            >
              <Info />
            </div>
            <ReactTooltip />
          </div>
        </div>
      </div>
      <div className="info-list p-6 h-60">
        <div className="text-center max-w-2xl">
          {error ? <Alert level="error" message={error.message} /> : null}
        </div>
        <div className="py-2">
          {data.userStaked !== '0' ? (
            <div className="flex items-center justify-between text-xs py-2">
              <div>Your Shares</div>
              <div>≈{toPrecision(data.userStaked, 6)}</div>
            </div>
          ) : null}
          {data.userStaked === '0' ? (
            <div className="flex items-center justify-between text-xs py-2">
              <div>Rewards per week</div>
              <div>
                {data.rewardsPerWeek} {toRealSymbol(data?.rewardToken?.symbol)}
              </div>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-xs py-2">
            <div>APR</div>
            <div>{data.apr}%</div>
          </div>
          <div className="flex items-center justify-between text-xs py-2">
            <div>Total Staked</div>
            <div>${data.totalStaked}</div>
          </div>
          {data.userUnclaimedReward !== '0' ? (
            <div className="flex items-center justify-between text-xs py-2">
              <div>Unclaimed rewards</div>
              <div>
                {data.userUnclaimedReward}{' '}
                {toRealSymbol(data.rewardToken.symbol)}
              </div>
            </div>
          ) : null}
        </div>
        <div>
          {wallet.isSignedIn() ? (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {data.rewardNumber !== '0' ? (
                <BorderButton onClick={() => showWithDraw()}>
                  <div className="w-16 text-xs text-greenLight">Withdraw</div>
                </BorderButton>
              ) : null}
              {data.userStaked === '0' || ended ? (
                <GreenButton onClick={() => showStakeModal()} disabled={ended}>
                  <div className="w-10 text-white">Stake</div>
                </GreenButton>
              ) : null}
              {data.userUnclaimedReward !== '0' ? (
                <BorderButton onClick={() => claimReward(data.farm_id)}>
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

  const cardWidth = isMobile() ? '75vw' : '25vw';

  return (
    <Modal {...props}>
      <Card style={{ width: cardWidth }}>
        <div className="text-sm text-gray-800 font-semibold pb-4">
          {props.title}
        </div>
        <div>
          <div className="flex justify-end text-xs font-semibold pb-2.5">
            <span className={`${max === '0' ? 'text-gray-400' : null}`}>
              Balance:
              {max}
            </span>
          </div>
          <div className="flex bg-inputBg relative overflow-hidden rounded-lg align-center my-2 border">
            <InputAmount
              className="flex-grow"
              maxBorder={false}
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
