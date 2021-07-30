import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import moment from 'moment';
import ActionSheet, { ActionSheetRef } from 'actionsheet-react';
import Modal from 'react-modal';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import {
  GreenButton,
  GrayButton,
  BorderButton,
} from '~components/button/Button';
import { mapToView } from '~components/icon/Actions';
import {
  useTokenBalances,
  useUserRegisteredTokens,
  useTokens,
} from '~state/token';
import Loading from '~components/layout/Loading';
import { getLatestActions, getYourPools, ActionData } from '~services/indexer';
import { toPrecision, toReadableNumber } from '~utils/numbers';
import { usePool } from '~state/pool';
import { getPoolBalance } from '~services/api';
import { RemoveLiquidityModal } from './pools/DetailsPage';
import { wallet } from '~services/near';
import getConfig from '~services/config';
import { toRealSymbol } from '~utils/token';

const config = getConfig();

function useLastActions() {
  const [actions, setActions] = useState<ActionData[]>([]);

  useEffect(() => {
    getLatestActions().then((resp) => {
      setActions(resp);
    });
  }, []);

  return actions;
}

function Balance({ hideEmpty }: { hideEmpty?: boolean }) {
  const userTokens = useUserRegisteredTokens();
  const balances = useTokenBalances();

  if (!balances || !userTokens) return <Loading />;

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="font-semibold">Balance</div>
        <GreenButton
          onClick={() => {
            window.open(getConfig().walletUrl, '_blank');
          }}
        >
          Go to Wallet
        </GreenButton>
      </div>
      <div>
        {userTokens.map((token) => {
          const balance = balances[token.id] || '0';
          if (balance === '0' && hideEmpty) return null;

          const amount = toPrecision(
            toReadableNumber(token.decimals, balance),
            6,
            true
          );

          return (
            <div
              key={token.id}
              className="flex items-center justify-between py-4 border-t"
            >
              <div className="flex item-center justify-between">
                {token.icon ? (
                  <img
                    className="h-10 w-10 mr-3"
                    src={token.icon}
                    alt={toRealSymbol(token.symbol)}
                  />
                ) : (
                  <div className="rounded-full h-10 w-10 bg-gray-300 mr-3"></div>
                )}
                <div className="flex flex-col justify-between py-1">
                  <div>{toRealSymbol(token.symbol)}</div>
                  <div className="text-xs text-gray-500">{token.id}</div>
                </div>
              </div>
              <div className="text-gray-600">{amount}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PoolRow({ pool: p, mobile }: { pool: any; mobile?: boolean }) {
  const { pool } = usePool(p.id);
  const [balance, setBalance] = useState('0');
  const tokens = useTokens(pool?.tokenIds);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const balances = useTokenBalances();

  useEffect(() => {
    getPoolBalance(Number(p?.id)).then(setBalance);
  }, []);

  if (!pool || !tokens || tokens.length < 2 || !balances) return <Loading />;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  if (!Number(balance)) return null;

  const b0 = toPrecision(
    toReadableNumber(tokens[0].decimals, balances[tokens[0].id]),
    6,
    true
  );
  const b1 = toPrecision(
    toReadableNumber(tokens[1].decimals, balances[tokens[1].id]),
    6,
    true
  );

  return (
    <div
      className={`flex items-center justify-between py-4 ${
        mobile ? 'border-b border-gray-700' : 'border-t'
      }`}
    >
      <div className="flex item-center justify-between text-xs">
        <div>
          {toRealSymbol(tokens[0].symbol)}: {b0}
        </div>
        <div className="px-4">-</div>
        <div>
          {toRealSymbol(tokens[1].symbol)}: {b1}
        </div>
      </div>
      <div className="text-gray-600">
        {mobile ? (
          <BorderButton
            className="text-white"
            borderColor="border-gray-500"
            onClick={() => setShowWithdraw(true)}
          >
            Remove
          </BorderButton>
        ) : (
          <GreenButton onClick={() => setShowWithdraw(true)}>
            Remove
          </GreenButton>
        )}
      </div>
      <RemoveLiquidityModal
        pool={pool}
        shares={balance}
        tokens={tokens}
        isOpen={showWithdraw}
        onRequestClose={() => setShowWithdraw(false)}
      />
    </div>
  );
}

function LiquidityEmpty() {
  const history = useHistory();

  return (
    <div>
      <div className="text-center font-semibold text-xs pb-1">
        You aren’t providing liquidity to any pools
      </div>
      <div className="flex items-center justify-center">
        <div className="pt-2">
          <GreenButton onClick={() => history.push('/pools')}>
            Add Liquidity
          </GreenButton>
        </div>
      </div>
    </div>
  );
}

function Liquidity() {
  const [error, setError] = useState<Error>();
  const [pools, setPools] = useState([]);

  useEffect(() => {
    getYourPools().then(setPools).catch(setError);
  }, []);

  return (
    <Card className="w-full mt-6">
      <div className="w-full flex justify-center">
        {error && <Alert level="error" message={error.message} />}
      </div>

      <div className="flex items-center justify-between pb-4">
        <div className="font-semibold">Your Liquidity</div>
        <div></div>
      </div>
      {pools.length === 0 ? <LiquidityEmpty /> : null}
      <div>
        {pools.map((pool, i) => {
          return <PoolRow key={i} pool={pool} />;
        })}
      </div>
    </Card>
  );
}

function Actions() {
  const actions = useLastActions();
  const [detail, setDetail] = useState<ActionData | null>(null);
  if (!actions) return <Loading />;

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="font-semibold">Recent Activity</div>
        <div></div>
      </div>
      <div className="border-b">
        {actions.map((action, i) => {
          let icon = mapToView(action.data?.Action);
          icon = icon ? (
            <div className="mr-4">{icon}</div>
          ) : (
            <div className="rounded-full h-4 w-4 bg-gray-300 mr-3"></div>
          );
          return (
            <div
              key={i}
              className="flex items-center justify-between py-4 border-t cursor-pointer"
              onClick={() => {
                setDetail(action);
              }}
            >
              <div className="flex items-center justify-between">
                {icon}
                <span className="text-xs font-semibold">
                  {action.data.Action}
                </span>
              </div>
              <div className="text-gray-400 text-xs">
                {moment(action.datetime).fromNow(true)} ago
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <GrayButton
          className="text-white text-xs w-full justify-center py-2 mt-4"
          onClick={() => {
            const url = config.walletUrl + '/' + wallet.account().accountId;
            window.open(url, '_blank');
          }}
        >
          <div>View All</div>
        </GrayButton>
      </div>

      <Modal
        isOpen={!!detail}
        onRequestClose={() => setDetail(null)}
        style={{ content: { outline: 'none' } }}
      >
        {detail ? (
          <Card style={{ width: '30vw' }}>
            <div className="text-center pb-4 font-semibold">
              {detail.data.Action}
            </div>
            <div className="border-b">
              {Object.keys(detail.data).map((k, i) => {
                if (k === 'Action') return null;

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between border-t py-3 text-sm"
                  >
                    <div>{k}</div>
                    <div>{(detail.data as any)[k]}</div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between border-t py-3 text-sm">
                <div>Status</div>
                <div>{detail.status ? 'Success' : 'Failed'}</div>
              </div>
            </div>
            <div className="pt-2">
              <GrayButton className="text-white text-xs w-full justify-center py-2 mt-4">
                <div
                  onClick={() => {
                    window.open(detail.txUrl, '_blank');
                  }}
                >
                  View on Explorer
                </div>
              </GrayButton>
            </div>
          </Card>
        ) : null}
      </Modal>
    </Card>
  );
}

function Account() {
  return (
    <div className="xs:flex xs:flex-col md:flex md:flex-col justify-center h-4/5 lg:mt-24 relative md:hidden xs:hidden">
      <div className="hide-scrollbar w-7/12 m-auto overflow-y-auto h-full">
        <div className="grid grid-cols-3 gap-6 xs:hidden">
          <div className="col-span-2">
            <Balance />
          </div>
          <div>
            <Actions />
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileBalance({ hideEmpty }: { hideEmpty?: boolean }) {
  const userTokens = useUserRegisteredTokens();
  const balances = useTokenBalances();

  if (!balances || !userTokens) return <Loading />;

  return (
    <div className="px-6">
      <div className="py-4 text-center">Balance</div>
      {userTokens.map((token) => {
        const balance = balances[token.id] || '0';
        if (balance === '0' && hideEmpty) return null;

        const amount = toPrecision(
          toReadableNumber(token.decimals, balance),
          6,
          true
        );

        return (
          <div
            key={token.id}
            className="flex items-center justify-between py-4 border-b border-gray-700"
          >
            <div className="flex item-center justify-between">
              {token.icon ? (
                <img
                  className="h-10 w-10 mr-3"
                  src={token.icon}
                  alt={toRealSymbol(token.symbol)}
                />
              ) : (
                <div className="rounded-full h-10 w-10 bg-gray-300 mr-3"></div>
              )}
              <div className="flex flex-col justify-between py-1">
                <div>{toRealSymbol(token.symbol)}</div>
                <div className="text-xs text-gray-300">{token.name}</div>
              </div>
            </div>
            <div className="text-white">{amount}</div>
          </div>
        );
      })}
    </div>
  );
}

function MobileLiquidity() {
  const [error, setError] = useState<Error>();
  const [pools, setPools] = useState([]);

  useEffect(() => {
    getYourPools().then(setPools).catch(setError);
  }, []);

  return (
    <div className="px-6">
      <div className="w-full flex justify-center">
        {error && <Alert level="error" message={error.message} />}
      </div>

      <div className="font-semibold text-center pt-8 pb-6">Your Liquidity</div>
      {pools.length === 0 ? <LiquidityEmpty /> : null}
      <div>
        {pools.map((pool, i) => {
          return <PoolRow key={i} pool={pool} mobile />;
        })}
      </div>
    </div>
  );
}

function MobileActions() {
  const actions = useLastActions();
  const [detail, setDetail] = useState<ActionData | null>(null);
  const ref = useRef<ActionSheetRef>();
  if (!actions || actions.length === 0) return <Loading />;

  return (
    <div className="px-6 mt-4 overflow-auto">
      <div className="border-b border-gray-700">
        {actions.map((action, i) => {
          let icon = mapToView(action.data.Action, true);
          icon = icon ? (
            <div className="mr-4">{icon}</div>
          ) : (
            <div className="rounded-full h-6 w-6 bg-gray-300 mr-3"></div>
          );
          return (
            <div
              key={i}
              className="flex items-center justify-between py-4 border-t border-gray-700 cursor-pointer"
              onClick={() => {
                setDetail(action);
                ref.current.open();
              }}
            >
              <div className="flex items-center justify-between">
                {icon}
                <span className="text-xs font-semibold">
                  {action.data.Action}
                </span>
              </div>
              <div className="text-gray-400 text-xs">
                {moment(action.datetime).fromNow(true)} ago
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <BorderButton
          className=" w-full text-white py-2 mt-6"
          borderColor="border-gray-500"
          onClick={() => {
            const url = config.walletUrl + '/' + wallet.account().accountId;
            window.open(url, '_blank');
          }}
        >
          <div>View All</div>
        </BorderButton>
      </div>

      <ActionSheet ref={ref}>
        {detail ? (
          <div className="text-black px-4 py-6">
            <div className="text-center pb-6 font-semibold">
              {detail.data.Action}
            </div>
            <div className="border-b">
              {Object.keys(detail.data).map((k, i) => {
                if (k === 'Action') return null;

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between border-t py-3 text-sm"
                  >
                    <div>{k}</div>
                    <div>{(detail.data as any)[k]}</div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between border-t py-3 text-sm">
                <div>Status</div>
                <div>{detail.status ? 'Success' : 'Failed'}</div>
              </div>
            </div>
            <div className="pt-2">
              <GrayButton className="text-white text-xs w-full justify-center py-2 mt-4">
                <div
                  onClick={() => {
                    window.open(detail.txUrl, '_blank');
                  }}
                >
                  View on Explorer
                </div>
              </GrayButton>
            </div>
          </div>
        ) : null}
      </ActionSheet>
    </div>
  );
}

function MobileAccount() {
  const [showRecent, setShowRecent] = useState(false);

  return (
    <div className="lg:hidden xl:hidden md:show xs:show relative text-white flex-grow overflow-auto pb-6">
      <div className="text-center text-lg font-semibold">
        {showRecent ? 'Recent Activity' : 'Account'}
      </div>
      <div className="flex items-center justify-center py-4">
        <GreenButton
          onClick={() => {
            window.open(config.walletUrl, '_blank');
          }}
        >
          Go to Wallet
        </GreenButton>
        <div className="w-4"></div>
        <BorderButton onClick={() => setShowRecent(!showRecent)}>
          {showRecent ? 'Balance' : 'Recent Activity'}
        </BorderButton>
      </div>

      {!showRecent ? (
        <>
          <MobileBalance />
          <MobileLiquidity />
        </>
      ) : (
        <MobileActions />
      )}
    </div>
  );
}

export function AccountPage() {
  return (
    <>
      <Account />
      <MobileAccount />
    </>
  );
}
