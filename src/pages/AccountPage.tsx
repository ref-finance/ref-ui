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
  GradientButton,
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
import { FormattedMessage, useIntl } from 'react-intl';
import { TokenList } from '~components/deposit/Deposit';

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

function Balances({ hideEmpty }: { hideEmpty?: boolean }) {
  const userTokens = useUserRegisteredTokens();
  const balances = useTokenBalances();
  const [account, network] = wallet.getAccountId().split('.');
  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;
  const accountName =
    account.length > 10 ? niceAccountId : wallet.getAccountId();

  if (!balances || !userTokens) return <Loading />;

  return (
    <Card className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="font-semibold text-white">
          {wallet.isSignedIn() && accountName}
        </div>
        <GradientButton
          className="text-white text-xs py-2 px-5"
          onClick={() => {
            window.open(getConfig().walletUrl, '_blank');
          }}
        >
          <FormattedMessage id="go_to_wallet" defaultMessage="Go to Wallet" />
        </GradientButton>
      </div>
      <div>
        <div className="flex text-sm text-primaryText items-center justify-between py-4">
          <div>
            <FormattedMessage id="token" defaultMessage="Token" />
          </div>
          <div>
            <FormattedMessage id="balance" defaultMessage="Balance" />
          </div>
        </div>
        <TokenList
          hideEmpty={true}
          showTokenId={true}
          tokens={userTokens}
          balances={balances}
        />
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
        <div className="font-semibold text-white">
          <FormattedMessage
            id="recent_activity"
            defaultMessage="Recent Activity"
          />
        </div>
        <div></div>
      </div>
      <div className="border-b border-gray-500 border-opacity-30">
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
              className="flex items-center justify-between py-4 cursor-pointer"
              onClick={() => {
                setDetail(action);
              }}
            >
              <div className="flex items-center justify-between">
                {icon}
                <span className="text-xs font-semibold text-white">
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
      <div className=" text-center pt-4">
        <div
          className="h-8 w-36 text-center inline-block rounded border-gradientFrom border py-2 text-xs text-gradientFrom font-semibold cursor-pointer"
          onClick={() => {
            const url = config.walletUrl + '/' + wallet.account().accountId;
            window.open(url, '_blank');
          }}
        >
          <FormattedMessage id="view_all" defaultMessage="View All" />
        </div>
      </div>

      <Modal
        isOpen={!!detail}
        onRequestClose={() => setDetail(null)}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
          },
        }}
      >
        {detail ? (
          <Card
            style={{ width: '30vw', minWidth: '200px' }}
            className="outline-none border border-gradientFrom border-opacity-50"
          >
            <div className="text-white text-center pb-4 font-semibold">
              {detail.data.Action}
            </div>
            <div className="text-white">
              {Object.keys(detail.data).map((k, i) => {
                if (k === 'Action') return null;
                const value = String((detail.data as any)[k]) || '';
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>{k}</div>
                    <div>{`${value.substring(0, 25)}${
                      value.length > 25 ? '...' : ''
                    }`}</div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between py-3 text-sm">
                <div>Status</div>
                <div>{detail.status ? 'Success' : 'Failed'}</div>
              </div>
            </div>
            <div className="pt-2 text-center">
              <GradientButton className="inline-block w-36 text-white text-xs py-2 mt-4">
                <div
                  onClick={() => {
                    window.open(detail.txUrl, '_blank');
                  }}
                >
                  View on Explorer
                </div>
              </GradientButton>
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
            <Balances />
          </div>
          <div>
            <Actions />
          </div>
        </div>
      </div>
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

      <div className="font-semibold text-center pt-8 pb-6">
        <FormattedMessage id="your_liquidity" defaultMessage="Your Liquidity" />
      </div>
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
    <div className="overflow-auto">
      <div className="bg-cardBg mx-4 rounded-2xl p-6 md:rounded-lg xs:rounded-lg">
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
        <div className="text-center">
          <div
            className="h-8 w-36 text-center inline-block rounded border-gradientFrom border py-2 text-xs text-gradientFrom font-semibold cursor-pointer"
            onClick={() => {
              const url = config.walletUrl + '/' + wallet.account().accountId;
              window.open(url, '_blank');
            }}
          >
            <div>
              <FormattedMessage id="view_all" defaultMessage="View All" />
            </div>
          </div>
        </div>
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
                const value = String((detail.data as any)[k]) || '';
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between  py-3 text-sm"
                  >
                    <div>{k}</div>
                    <div>{`${value.substring(0, 25)}${
                      value.length > 25 ? '...' : ''
                    }`}</div>
                  </div>
                );
              })}
              <div className="flex items-center justify-between py-3 text-sm">
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
  const userTokens = useUserRegisteredTokens();
  const balances = useTokenBalances();
  const intl = useIntl();
  return (
    <div className="lg:hidden xl:hidden md:show xs:show relative text-white flex-grow overflow-auto pb-6">
      <div className="text-center text-lg font-semibold">
        {showRecent
          ? intl.formatMessage({ id: 'recent_activity' })
          : intl.formatMessage({ id: 'account' })}
      </div>
      <div className="flex items-center justify-center py-4">
        <GradientButton
          className="rounded w-52 text-xs text-white py-2 px-5"
          btnClassName="font-semibold"
          onClick={() => setShowRecent(!showRecent)}
        >
          {showRecent
            ? intl.formatMessage({ id: 'balance' })
            : intl.formatMessage({ id: 'recent_activity' })}
        </GradientButton>
        <div
          className="ml-4 h-8 w-28 text-center inline-block rounded border-gradientFrom border py-2 text-xs text-gradientFrom font-semibold cursor-pointer"
          onClick={() => {
            window.open(config.walletUrl, '_blank');
          }}
        >
          <FormattedMessage id="go_to_wallet" defaultMessage="Go to Wallet" />
        </div>
      </div>

      {!showRecent && userTokens ? (
        <>
          <div className="bg-cardBg mx-4 rounded-2xl p-6 md:rounded-lg xs:rounded-lg">
            <div className="py-4 text-center">
              <FormattedMessage id="balance" defaultMessage="Balance" />
            </div>
            <TokenList
              hideEmpty={true}
              showTokenId={true}
              tokens={userTokens}
              balances={balances}
            />
          </div>
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
