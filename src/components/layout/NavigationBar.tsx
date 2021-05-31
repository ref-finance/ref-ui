import React, { useState } from 'react';
import { matchPath } from 'react-router';
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
import { Card } from '~components/card/Card';
import { TokenList } from '~components/deposit/Deposit';
import { useTokenBalances, useUserRegisteredTokens } from '../../state/token';
import { REF_FI_CONTRACT_ID } from  '../../services/near'
import RainBow from '~components/layout/RainBow';

<<<<<<< HEAD
function MobileBar() {
  return (
    <section className="md:hidden w-full bg-secondary">
      <RefLogo className="m-auto w-40" height="70" />
      <Menu
        styles={{
          bmBurgerButton: {
            position: 'fixed',
            width: '2rem',
            height: '1.6rem',
            left: '1.5rem',
            top: '1.5rem',
          },
          bmBurgerBars: {
            background: '#000000',
          },
          bmBurgerBarsHover: {
            background: '#a90000',
          },
          bmCrossButton: {
            height: '24px',
            width: '24px',
          },
          bmCross: {
            background: '#bdc3c7',
          },
          bmMenuWrap: {
            position: 'fixed',
            height: '100%',
          },
          bmMenu: {
            background: '#FFFFFF',
            padding: '2.5em 1.5em 0',
            fontSize: '1.15em',
          },
          bmMorphShape: {
            fill: '#373a47',
          },
        }}
      >
        <Anchor to="/portfolio" name="Portfolio" />
        <Anchor to="/" name="Swap" />
        <Anchor to="/pools" name="Pools" />
        <a
          href="https://ethereum.bridgetonear.org/"
          target="_blank"
          className="hover:text-primaryScale-500 text-xl p-5 outline-none"
        >
          Rainbow Bridge
        </a>
        <AuthButton />
      </Menu>
    </section>
  );
}

function Anchor({ to, name }: { to: string; name: string }) {
=======
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
>>>>>>> feat/new-ui
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
<<<<<<< HEAD
    <nav className="hidden grid-cols-6 items-center text-center bg-secondary md:grid">
      <Link to="/" className="my-2 mx-3">
        <RefLogo className="w-full" height="66" />
      </Link>
      {wallet.isSignedIn() ? (
        <Anchor to="/portfolio" name="Portfolio" />
      ) : (
        <p></p>
      )}
      <Anchor to="/" name="Swap" />
      <Anchor to="/pools" name="Pools" />
      <a
        href="https://ethereum.bridgetonear.org/"
        target="_blank"
        className="hover:text-primaryScale-500 text-xl p-5"
      >
        Rainbow Bridge
      </a>
      <section className="place-self-center">
        {wallet.isSignedIn() ? <Dropdown /> : <AuthButton />}
      </section>
    </nav>
=======
    <div
      className={`cursor-pointer font-bold items-center justify-end text-center p-1 pl-3 pr-3 relative h-full`}
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
          {wallet.isSignedIn() ? accountName : <button
            onClick={() => wallet.requestSignIn(REF_FI_CONTRACT_ID)}
            type="button"
          >
            <span className="ml-2 text-sm">Connect to NEAR</span>
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
      className="relative"
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
>>>>>>> feat/new-ui
  );
}

function NavigationBar() {
  return (
    <div className="nav-wrap hidden grid-cols-12 items-center text-center md:grid relative">
      <nav className="flex items-center space-x-10 pl-5 pt-3">
        <div className="relative -top-0.5">
          <Logo />
        </div>
        <Anchor to="/deposit" pattern="/deposit/:id?" name="Deposit" />
        <Anchor to="/" pattern="/" name="Swap" />
        <PoolsMenu />
        <Anchor to="/adboard" pattern="/adboard" name="Adboard" />
        <a target="_blank" href="https://ethereum.bridgetonear.org/" className="relative ext-white border rounded-full p-4 py-2 border-greenLight text-greenLight">
          Rainbow&nbsp;Bridge
        </a>
      </nav>
      <div className="user col-span-8 items-center text-xs text-center justify-end pl-5 h-full w-96 absolute right-0">
        <BgShapeTopRight />
        <AccountEntry />
      </div>
    </div>
  );
}
export default NavigationBar;
