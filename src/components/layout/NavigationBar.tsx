import React, { useState } from 'react';
import {
  Logo,
  Near,
  BgShapeTopRight,
  ArrowDownWhite,
  ArrowDownGreen,
} from '../../components/icon';
import { Link, useLocation } from 'react-router-dom';
import { wallet } from '~services/near';
import { useHistory } from 'react-router';
import { Card } from '~components/card';
import { TokenList } from '~components/deposit';
import { useTokenBalances, useUserRegisteredTokens } from '../../state/token';

function Anchor({
  to,
  name,
  className,
}: {
  to: string;
  name: string;
  className?: string;
}) {
  const location = useLocation();
  const isSelected = to === location.pathname;

  return (
    <Link to={to}>
      <h2
        className={`link hover:text-green-500 text-sm font-bold p-2 cursor-pointer ${className} ${
          isSelected ? 'text-green-500' : 'text-white'
        }`}
      >
        {name}
      </h2>
    </Link>
  );
}

function AccountEntry() {
  const userTokens = useUserRegisteredTokens();
  const balances = useTokenBalances();

  const [hover, setHover] = useState(false);
  const [account, network] = wallet.getAccountId().split('.');
  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;
  const history = useHistory();

  const accountName =
    account.length > 10 ? niceAccountId : wallet.getAccountId();

  if (!userTokens || !balances) return null;

  return (
    <div
      className={`cursor-pointer font-bold items-center justify-end text-center p-1 pl-3 pr-3 relative h-full`}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <div className="inline-flex py-2 px-6 items-center justify-center rounded-full bg-gray-700 absolute top-5 right-10">
        <div className="pr-1">
          <Near />
        </div>
        <div className="overflow-ellipsis overflow-hidden whitespace-nowrap account-name text-white">
          {wallet.isSignedIn() ? accountName : <button
            onClick={() => wallet.requestSignIn()}
            type="button"
          >
            <span className="ml-2 text-xs">Connect to NEAR</span>
          </button>}
        </div>
      </div>
      <div
        className={`absolute top-12 pt-2 right-10 ${
          wallet.isSignedIn() && hover ? 'block' : 'hidden'
        }`}
      >
        <Card className="cursor-default" width="w-80">
          <div className="flex items-center justify-between text-gray-700">
            <div className="text-base">Balance</div>
            <div
              className="cursor-pointer rounded-full border border-greenLight px-2 py-1"
              onClick={() => history.push('/deposit')}
            >
              View account
            </div>
          </div>
          <TokenList tokens={userTokens} balances={balances} />
          <div className="flex items-center justify-center pt-2">
            <div
              className="rounded-full bg-greenLight px-3 py-1.5 text-xs text-white font-semibold cursor-pointer"
              onClick={() => {
                wallet.signOut();
                window.location.assign('/');
              }}
            >
              Sign out
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PoolsMenu() {
  const location = useLocation();
  const isSelected = location.pathname.startsWith('/pools/');
  const [hover, setHover] = useState(false);
  const history = useHistory();

  const links = [
    { label: 'View Pools', path: '/pools' },
    { label: 'Add Token', path: '/pools/add-token' },
    { label: 'Create New Pool', path: '/pools/add' },
  ];

  return (
    <div
      className="relative"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center justify-center">
        <h2
          className={`link hover:text-green-500 text-sm font-bold p-2 cursor-pointer ${
            isSelected || hover ? 'text-green-500' : 'text-white'
          }`}
        >
          Pools
        </h2>
        {isSelected || hover ? <ArrowDownGreen /> : <ArrowDownWhite />}
      </div>
      <div className={`${hover ? 'block' : 'hidden'} absolute top-9`}>
        <Card width="w-auto" padding="p-4">
          {links.map((link) => {
            const isSelected = link.path === location.pathname;

            return (
              <div
                key={link.path}
                className={`whitespace-nowrap text-left text-xs font-semibold text-gray-600 cursor-pointer pb-2 last:pb-0 hover:text-greenLight ${
                  isSelected ? 'text-green-500' : 'text-white'
                }`}
                onClick={() => history.push(link.path)}
              >
                {link.label}
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function NavigationBar() {
  return (
    <div className="nav-wrap hidden grid-cols-12 items-center text-center md:grid relative">
      <nav className="flex items-center space-x-10 pl-5 pt-3">
        <div className="relative -top-0.5">
          <Logo />
        </div>
        <Anchor to="/deposit" name="Deposit" />
        <Anchor to="/" name="Swap" />
        <PoolsMenu />
        <Anchor to="/adboard" name="Adboard" />
      </nav>
      <div className="user col-span-8 items-center text-xs text-center justify-end pl-5 h-full w-96 absolute right-0">
        <BgShapeTopRight />
        <AccountEntry />
      </div>
    </div>
  );
}
export default NavigationBar;