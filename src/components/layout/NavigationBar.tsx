import React, { useEffect, useState } from 'react';
import { matchPath } from 'react-router';
import {
  Logo,
  Near,
  ArrowDownWhite,
  ArrowDownGreen,
  NavLogo,
  NavClose,
  NavExpand,
  NavLogoLarge,
  MenuItemCollapse,
  MenuItemExpand,
} from '~components/icon';
import { Link, useLocation } from 'react-router-dom';
import { wallet } from '~services/near';
import { useHistory } from 'react-router';
import { Card } from '~components/card/Card';
import { TokenList } from '~components/deposit/Deposit';
import { useTokenBalances, useUserRegisteredTokens } from '~state/token';
import { REF_FI_CONTRACT_ID } from '~services/near';
import { ConnectToNearBtn } from '~components/deposit/Deposit';
import RainBow from '~components/layout/RainBow';

function Anchor({
  to,
  pattern,
  name,
  className,
}: {
  to: string;
  pattern: string;
  name: string;
  className?: string;
}) {
  const location = useLocation();
  const isSelected = matchPath(location.pathname, {
    path: pattern,
    exact: true,
    strict: false,
  });

  return (
    <Link to={to}>
      <h2
        className={`link hover:text-green-500 text-lg font-bold p-2 cursor-pointer ${className} ${
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
      className={`cursor-pointer font-bold items-center justify-end text-center p-1 overflow-visible pl-3 pr-3 relative h-full`}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <div className="inline-flex p-1 items-center justify-center rounded-full bg-gray-700 pl-3 pr-3 absolute top-5 right-10">
        <div className="pr-1">
          <Near />
        </div>
        <div className="overflow-ellipsis overflow-hidden whitespace-nowrap account-name text-white">
          {wallet.isSignedIn() ? (
            accountName
          ) : (
            <button
              onClick={() => wallet.requestSignIn(REF_FI_CONTRACT_ID)}
              type="button"
            >
              <span className="ml-2 text-sm">Connect to NEAR</span>
            </button>
          )}
        </div>
      </div>
      <div
        className={`relative top-12 pt-2 right-2 ${
          wallet.isSignedIn() && hover ? 'block' : 'hidden'
        }`}
      >
        <Card className="cursor-default" width="w-80">
          <div className="flex items-center justify-between text-gray-700">
            <div className="text-base">Balance</div>
            <div
              className="cursor-pointer rounded-full border border-greenLight px-2 py-1"
              onClick={() => history.push('/account')}
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
  const isSelected = location.pathname.startsWith('/pools');
  const [hover, setHover] = useState(false);
  const history = useHistory();

  const links = [
    { label: 'View Pools', path: '/pools' },
    { label: 'Add Token', path: '/pools/add-token' },
    { label: 'Create New Pool', path: '/pools/add' },
  ];

  if (wallet.isSignedIn()) {
    links.push({
      label: 'Your Liquidity',
      path: '/pools/yours',
    });
  }

  return (
    <div
      className="relative z-20"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center justify-center">
        <h2
          className={`link hover:text-green-500 text-lg font-bold p-2 cursor-pointer ${
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
                className={`whitespace-nowrap text-left text-sm font-semibold text-gray-600 cursor-pointer pb-2 last:pb-0 hover:text-greenLight ${
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

function MobileAnchor({
  to,
  pattern,
  name,
  className,
  onClick,
}: {
  to: string;
  pattern: string;
  name: string;
  className?: string;
  onClick: () => void;
}) {
  const location = useLocation();
  const isSelected = matchPath(location.pathname, {
    path: pattern,
    exact: true,
    strict: false,
  });

  return (
    <div>
      <Link onClick={onClick} to={to}>
        <div
          className={`p-4 link font-bold p-2 ${className} ${
            isSelected ? 'text-green-500' : 'text-white'
          }`}
        >
          {name}
        </div>
      </Link>
    </div>
  );
}

function MobilePoolsMenu({
  links,
  onClick,
}: {
  links: Array<{ label: string; path: string }>;
  onClick: () => void;
}) {
  const location = useLocation();
  const isSelected = location.pathname.startsWith('/pools');
  const [show, setShow] = useState(isSelected);
  const history = useHistory();

  return (
    <div className="relative z-20">
      <div
        className="flex p-4 items-center justify-between"
        onClick={() => setShow(!show)}
      >
        <div
          className={`text-white link font-bold ${
            isSelected ? 'text-green-500' : 'text-white'
          }`}
        >
          Pools
        </div>
        {show ? <MenuItemCollapse /> : <MenuItemExpand />}
      </div>
      <div className={`divide-y divide-green-800 ${show ? 'block' : 'hidden'}`}>
        {links.map((link) => {
          const isSelected = link.path === location.pathname;

          return (
            <div
              key={link.path}
              className={`bg-mobile-nav-item whitespace-nowrap text-left font-bold text-white p-4 ${
                isSelected ? 'text-green-500' : 'text-white'
              }`}
              onClick={() => {
                onClick();
                history.push(link.path);
              }}
            >
              {link.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileNavBar() {
  const [show, setShow] = useState(false);

  const links = [
    { label: 'View Pools', path: '/pools' },
    { label: 'Add Token', path: '/pools/add-token' },
    { label: 'Create New Pool', path: '/pools/add' },
  ];

  if (wallet.isSignedIn()) {
    links.push({
      label: 'Your Liquidity',
      path: '/pools/yours',
    });
  }

  function close() {
    setShow(false);
  }

  return (
    <div className="nav-wrap lg:hidden md:show relative">
      <div className="flex items-center justify-between p-4">
        <NavLogo />
        <NavExpand onClick={() => setShow(true)} />
      </div>
      <div
        className={`absolute top-0 left-0 z-20 h-screen w-full bg-mobile-nav overflow-auto ${
          show ? 'block' : 'hidden'
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <NavLogoLarge />
          <NavClose onClick={() => setShow(false)} />
        </div>
        {wallet.isSignedIn() ? null : (
          <div className="mt-2">
            <ConnectToNearBtn />
          </div>
        )}
        <div className="mt-9 divide-y divide-green-800 border-t border-b border-green-800">
          <MobileAnchor
            to="/deposit"
            pattern="/deposit/:id?"
            name="Deposit"
            onClick={close}
          />
          <MobileAnchor to="/" pattern="/" name="Swap" onClick={close} />
          <MobileAnchor
            to="/account"
            pattern="/account"
            name="Account"
            onClick={close}
          />
          <MobilePoolsMenu links={links} onClick={close} />
          <div>
            <Link to="https://ethereum.bridgetonear.org/" target="_blank">
              <div className="p-4 link font-bold p-2 text-white">
                Move assets to/from Ethereum
                <RainBow className="h-6 inline-block"></RainBow>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavigationBar() {
  return (
    <>
      <div className="nav-wrap md:hidden xs:hidden text-center relative">
        <nav className="flex items-center space-x-10 pl-5 pt-3 col-span-8">
          <div className="relative -top-0.5">
            <Logo />
          </div>
          <Anchor to="/deposit" pattern="/deposit/:id?" name="Deposit" />
          <Anchor to="/" pattern="/" name="Swap" />
          <PoolsMenu />
          <a
            target="_blank"
            href="https://ethereum.bridgetonear.org/"
            className="mt-1 relative ext-white border rounded-full p-4 py-2 border-greenLight text-greenLight"
          >
            <RainBow className="h-6 inline-block"></RainBow>
            Move assets to/from Ethereum
          </a>
        </nav>
        <div className="user text-xs text-center justify-end pl-5 h-full w-96 absolute top-0 right-0 z-20">
          <AccountEntry />
        </div>
      </div>
      <MobileNavBar />
    </>
  );
}
export default NavigationBar;
