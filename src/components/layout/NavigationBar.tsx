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
import { REF_FARM_CONTRACT_ID } from '~services/near';
import { ConnectToNearBtn } from '~components/deposit/Deposit';
import RainBow from './RainBow';
import { FormattedMessage, useIntl } from 'react-intl';

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
        <FormattedMessage id={name} defaultMessage={name} />
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
    <div className="user text-xs text-center justify-end pl-5 h-full absolute top-0 right-20 z-20">
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
                onClick={() => wallet.requestSignIn(REF_FARM_CONTRACT_ID)}
                type="button"
              >
                <span className="ml-2 text-xs">
                  <FormattedMessage
                    id="connect_to_near"
                    defaultMessage="Connect to NEAR"
                  />
                </span>
              </button>
            )}
          </div>
        </div>
        <div
          className={`relative top-12 pt-2 right-8 w-80 ${
            wallet.isSignedIn() && hover ? 'block' : 'hidden'
          }`}
        >
          <Card className="cursor-default" width="w-80">
            <div className="flex items-center justify-between text-gray-700">
              <div className="text-base">
                <FormattedMessage id="balance" defaultMessage="Balance" />
              </div>
              <div
                className="cursor-pointer rounded-full border border-greenLight px-2 py-1"
                onClick={() => history.push('/account')}
              >
                <FormattedMessage
                  id="view_account"
                  defaultMessage="View account"
                />
              </div>
            </div>
            <TokenList tokens={userTokens} balances={balances} />
            <div className="flex items-center justify-center pt-2">
              <div
                className="rounded-full bg-greenLight px-5 py-2.5 text-xs text-white font-semibold cursor-pointer"
                onClick={() => {
                  wallet.signOut();
                  window.location.assign('/');
                }}
              >
                <FormattedMessage id="sign_out" defaultMessage="Sign out" />
              </div>
            </div>
          </Card>
        </div>
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
    {
      label: <FormattedMessage id="view_pools" defaultMessage="View Pools" />,
      path: '/pools',
    },
    {
      label: <FormattedMessage id="add_token" defaultMessage="Add Token" />,
      path: '/pools/add-token',
    },
    {
      label: (
        <FormattedMessage
          id="create_new_pool"
          defaultMessage="Create New Pool"
        />
      ),
      path: '/pools/add',
    },
  ];

  if (wallet.isSignedIn()) {
    links.push({
      label: (
        <FormattedMessage id="your_liquidity" defaultMessage="Your Liquidity" />
      ),
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
          <FormattedMessage id="pools" defaultMessage="Pools" />
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

function CommunityMenu() {
  const [hover, setHover] = useState(false);
  const intl = useIntl();

  const links = [
    {
      label: intl.formatMessage({ id: 'docs' }),
      url: 'https://guide.ref.finance',
    },
    { label: 'Forum', url: 'https://gov.ref.finance' },
    { label: 'Discord', url: 'https://discord.gg/SJBGcfMxJz' },
    { label: 'Telegram', url: 'https://t.me/ref_finance' },
    { label: 'Twitter', url: 'https://twitter.com/finance_ref' },
    { label: 'Medium', url: 'https://ref-finance.medium.com/' },
  ];

  return (
    <div
      className="relative z-20"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center justify-center">
        <h2
          className={`link hover:text-green-500 text-lg font-bold p-2 cursor-pointer undefined text-white`}
        >
          <FormattedMessage id="community" defaultMessage="Community" />
        </h2>
        {hover ? <ArrowDownGreen /> : <ArrowDownWhite />}
      </div>
      <div className={`${hover ? 'block' : 'hidden'} absolute top-9`}>
        <Card width="w-auto" padding="p-4">
          {links.map((link) => {
            return (
              <div
                key={link.url}
                className={`whitespace-nowrap text-left text-sm font-semibold text-gray-600 cursor-pointer pb-2 last:pb-0 hover:text-greenLight`}
                onClick={() => window.open(link.url)}
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
          <FormattedMessage id={name} defaultMessage={name} />
        </div>
      </Link>
    </div>
  );
}

function MobilePoolsMenu({
  links,
  onClick,
}: {
  links: Array<{ label: JSX.Element; path: string }>;
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
          <FormattedMessage id="pools" defaultMessage="Pools" />
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

function MobileCommunityMenu({
  links,
  onClick,
}: {
  links: Array<{ label: string; url: string }>;
  onClick: () => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative z-20">
      <div
        className="flex p-4 items-center justify-between"
        onClick={() => setShow(!show)}
      >
        <div className={`text-white link font-bold`}>
          <FormattedMessage id="community" defaultMessage="Community" />
        </div>
        {show ? <MenuItemCollapse /> : <MenuItemExpand />}
      </div>
      <div className={`divide-y divide-green-800 ${show ? 'block' : 'hidden'}`}>
        {links.map((link) => {
          return (
            <div
              key={link.url}
              className={`bg-mobile-nav-item whitespace-nowrap text-left font-bold text-white p-4`}
              onClick={() => {
                onClick();
                window.open(link.url);
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
  const intl = useIntl();
  const accountId = wallet.getAccountId();

  const links = [
    {
      label: <FormattedMessage id="view_pools" defaultMessage="View Pools" />,
      path: '/pools',
    },
    {
      label: <FormattedMessage id="add_token" defaultMessage="Add Token" />,
      path: '/pools/add-token',
    },
    {
      label: (
        <FormattedMessage
          id="create_new_pool"
          defaultMessage="Create New Pool"
        />
      ),
      path: '/pools/add',
    },
  ];

  const communityLinks = [
    {
      label: intl.formatMessage({ id: 'docs' }),
      url: 'https://guide.ref.finance',
    },
    { label: 'Forum', url: 'https://gov.ref.finance' },
    { label: 'Discord', url: 'https://discord.gg/SJBGcfMxJz' },
    { label: 'Telegram', url: 'https://t.me/ref_finance' },
    { label: 'Twitter', url: 'https://twitter.com/finance_ref' },
    { label: 'Medium', url: 'https://ref-finance.medium.com/' },
  ];

  if (wallet.isSignedIn()) {
    links.push({
      label: (
        <FormattedMessage id="your_liquidity" defaultMessage="Your Liquidity" />
      ),
      path: '/pools/yours',
    });
  }

  function close() {
    setShow(false);
  }

  return (
    <div
      className="nav-wrap lg:hidden md:show relative"
      style={{
        zIndex: show ? 200 : 10,
      }}
    >
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
        {wallet.isSignedIn() ? (
          <div
            className="mt-2 rounded-full bg-greenLight px-3 py-1.5 text-xs text-white text-center font-semibold cursor-pointer mx-auto w-1/3"
            onClick={() => {
              wallet.signOut();
              window.location.assign('/');
            }}
          >
            <p>
              <FormattedMessage id="sign_out" defaultMessage="Sign out" />
            </p>
            <p>({accountId})</p>
          </div>
        ) : (
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
          <MobileAnchor
            to="/farms"
            pattern="/farms"
            name="Farms"
            onClick={close}
          />
          <MobileAnchor
            to="/airdrop"
            pattern="/airdrop"
            name="Airdrop"
            onClick={close}
          />
          <MobileCommunityMenu links={communityLinks} onClick={close} />
          <div>
            <Link
              to={{ pathname: 'https://ethereum.bridgetonear.org/' }}
              target="_blank"
            >
              <div className="p-4 link font-bold p-2 text-white">
                <FormattedMessage
                  id="move_assets_to_from_ethereum"
                  defaultMessage="Move assets to/from Ethereum"
                />
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
        <nav className="flex items-center space-x-6 pl-5 pt-3 col-span-8">
          <div className="relative -top-0.5">
            <Logo />
          </div>
          <Anchor to="/deposit" pattern="/deposit/:id?" name="Deposit" />
          <Anchor to="/" pattern="/" name="Swap" />
          <PoolsMenu />
          <Anchor to="/farms" pattern="/farms" name="Farms" />
          <Anchor to="/airdrop" pattern="/airdrop" name="Airdrop" />
          <CommunityMenu />
          <a
            target="_blank"
            href="https://ethereum.bridgetonear.org/"
            className="mt-1 relative ext-white border rounded-full p-4 py-2 border-greenLight text-greenLight"
          >
            <RainBow className="h-6 inline-block"></RainBow>
            <FormattedMessage
              id="move_assets_to_from_ethereum"
              defaultMessage="Move assets to/from Ethereum"
            />
          </a>
        </nav>
        <AccountEntry />
      </div>
      <MobileNavBar />
    </>
  );
}
export default NavigationBar;
