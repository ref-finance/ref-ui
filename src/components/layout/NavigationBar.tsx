import React, { useContext, useEffect, useRef, useState } from 'react';
import { matchPath } from 'react-router';
import { Context } from '~components/wrapper';
import {
  Logo,
  Near,
  ArrowDownWhite,
  ArrowDownGreen,
  NavLogo,
  NavLogoLarge,
  IconBubble,
} from '~components/icon';
import { Link, useLocation } from 'react-router-dom';
import { wallet } from '~services/near';
import { useHistory } from 'react-router';
import { Card } from '~components/card/Card';
import { TokenList } from '~components/deposit/Deposit';
import { useTokenBalances, useUserRegisteredTokens } from '~state/token';
import { REF_FARM_CONTRACT_ID } from '~services/near';
import { ConnectToNearBtn } from '~components/button/Button';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';
import { IoChevronBack, IoClose } from 'react-icons/io5';

import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { useRefPrice } from '~state/account';
import { toPrecision } from '~utils/numbers';
import { useMenuItems } from '~utils/menu';

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
        className={`link hover:text-green-500 text-lg font-bold p-4 cursor-pointer ${className} ${
          isSelected ? 'text-green-500' : 'text-gray-400'
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
    <div className="user text-xs text-center justify-end pt-6 h-full right-20 absolute top-0 z-20">
      <div
        className={`cursor-pointer font-bold items-center justify-end text-center overflow-visible relative h-full`}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <div className="inline-flex py-1 items-center justify-center rounded-full bg-gray-700 px-5 absolute top-5 right-2">
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
          className={`relative top-10 pt-2 right-0 w-80 ${
            wallet.isSignedIn() && hover ? 'block' : 'hidden'
          }`}
        >
          <Card
            className="cursor-default shadow-4xl border border-primaryText"
            width="w-80"
          >
            <div className="flex items-center justify-between text-primaryText">
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
      label: (
        <FormattedMessage
          id="Create_New_Pool"
          defaultMessage="Create New Pool"
        />
      ),
      path: '/pools/add',
    },
  ];

  if (wallet.isSignedIn()) {
    links.push({
      label: (
        <FormattedMessage id="Your_Liquidity" defaultMessage="Your Liquidity" />
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
          className={`link hover:text-green-500 text-lg font-bold p-4 cursor-pointer ${
            isSelected || hover ? 'text-green-500' : 'text-gray-400'
          }`}
        >
          <FormattedMessage id="pools" defaultMessage="Pools" />
        </h2>
        {isSelected || hover ? <ArrowDownGreen /> : <ArrowDownWhite />}
      </div>
      <div
        className={`${
          hover ? 'block' : 'hidden'
        } absolute top-12 -left-20 rounded-md`}
      >
        <Card
          width="w-64"
          padding="py-4"
          rounded="rounded-md"
          className="border border-primaryText shadow-4xl"
        >
          {links.map((link) => {
            const isSelected = link.path === location.pathname;

            return (
              <div
                key={link.path}
                className={`whitespace-nowrap text-left hover:bg-navHighLightBg text-sm font-semibold text-primaryText hover:text-white cursor-pointer py-4 pl-16 ${
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

function MoreMenu() {
  const [hover, setHover] = useState(false);
  const [parentLabel, setParentLabel] = useState('');
  const { menuData } = useMenuItems();
  const [curMenuItems, setCurMenuItems] = useState(menuData);
  const context = useContext(Context);
  const currentLocal = localStorage.getItem('local');
  const onClickMenuItem = (items: any[], label: string) => {
    setCurMenuItems(items);
    setParentLabel(label);
  };
  const switchLanuage = (label: string) => {
    context.selectLanguage(label);
  };
  const hasSubMenu = curMenuItems.some(({ children }) => !!children?.length);
  return (
    <div
      className="relative z-20 h-8"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex border border-gray-400 hover:border-green-500 rounded-full">
        <h2
          className={`link hover:text-green-500 block font-bold cursor-pointer text-gray-400 h-7 w-7`}
        >
          ...
        </h2>
      </div>
      <div
        className={`${
          hover ? 'block' : 'hidden'
        } absolute top-6 -right-4 pt-4 rounded-md`}
      >
        <Card
          width="w-64"
          padding="py-4"
          rounded="rounded-md"
          className="shadow-4xl border border-primaryText"
        >
          {!hasSubMenu && parentLabel && (
            <div className="whitespace-nowrap text-left items-center flex justify-start hover:bg-navHighLightBg text-sm font-semibold text-primaryText hover:text-white cursor-pointer py-4 pl-4">
              <IoChevronBack
                className=" text-xl"
                onClick={() => onClickMenuItem?.(menuData, '')}
              />
              <span className=" ml-10">{parentLabel}</span>
            </div>
          )}
          {curMenuItems.map(
            ({
              id,
              url,
              children,
              label,
              icon,
              logo,
              isExternal,
              language,
            }) => {
              return (
                <div
                  key={id}
                  className={`whitespace-nowrap text-left items-center flex justify-start hover:bg-navHighLightBg text-sm font-semibold hover:text-white
                 ${
                   language && currentLocal === language
                     ? 'bg-navHighLightBg text-white'
                     : 'text-primaryText'
                 }
                 cursor-pointer py-4 pl-16`}
                  onClick={() =>
                    url
                      ? window.open(url, isExternal ? '' : '_self')
                      : children
                      ? onClickMenuItem?.(children, label)
                      : switchLanuage(language)
                  }
                >
                  {logo && <span className="text-2xl mr-6">{logo}</span>}
                  {label}
                  <span className="ml-4 text-xs">{icon}</span>
                </div>
              );
            }
          )}
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
            isSelected ? 'text-white bg-navHighLightBg' : 'text-primaryText'
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
        onClick={() => {
          setShow(!show);
        }}
      >
        <div
          className={`text-white link font-bold ${
            isSelected ? 'text-white' : 'text-primaryText'
          }`}
        >
          <FormattedMessage id="pools" defaultMessage="Pools" />
        </div>
        <FiChevronUp
          className={`${show ? 'inline-block' : 'hidden'} text-xl`}
        />
        <FiChevronDown
          className={`${!show ? 'inline-block' : 'hidden'} text-xl`}
        />
      </div>
      <div className={`${show ? 'block' : 'hidden'}`}>
        {links.map((link) => {
          const isSelected = link.path === location.pathname;

          return (
            <div
              key={link.path}
              className={`whitespace-nowrap text-left font-bold text-white p-4 ${
                isSelected
                  ? 'text-white bg-navHighLightBg'
                  : 'text-primaryText bg-mobile-nav'
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

function MobileMoreMenu({
  links,
  onClick,
}: {
  links: Array<{ label: string; url: string; isExternal: boolean }>;
  onClick: () => void;
}) {
  const location = useLocation();
  const isSelected = location.pathname.startsWith('/airdrop');
  const [show, setShow] = useState(isSelected);

  return (
    <div className="relative z-20">
      <div
        className="flex p-4 items-center justify-between"
        onClick={() => setShow(!show)}
      >
        <div
          className={`text-white link font-bold ${
            isSelected ? 'text-white' : 'text-primaryText'
          }`}
        >
          <FormattedMessage id="more" defaultMessage="More" />
        </div>
        <FiChevronUp
          className={`${show ? 'inline-block' : 'hidden'} text-xl`}
        />
        <FiChevronDown
          className={`${!show ? 'inline-block' : 'hidden'} text-xl`}
        />
      </div>
      <div className={`${show ? 'block' : 'hidden'}`}>
        {links.map((link) => {
          const isSelected = link.url === location.pathname;
          return (
            <div
              key={link.url}
              className={`whitespace-nowrap text-left font-bold text-white p-4 ${
                isSelected
                  ? 'text-white bg-navHighLightBg'
                  : 'text-primaryText bg-mobile-nav'
              }`}
              onClick={() => {
                onClick();
                window.open(link.url, link.isExternal ? '' : '_self');
              }}
            >
              {link.label}
              {link.isExternal ? (
                <FaExternalLinkAlt className="float-right mt-1 ml-2 text-xs opacity-60" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileSwitchLanguage() {
  const context = useContext(Context);
  const currentLocal = localStorage.getItem('local');
  const [show, setShow] = useState(false);

  return (
    <div className="relative z-20">
      <div
        className="flex p-4 items-center justify-between"
        onClick={() => setShow(!show)}
      >
        <div className={'font-bold text-primaryText'}>
          <FormattedMessage id="language" defaultMessage="Language" />
        </div>
        <FiChevronUp
          className={`${show ? 'inline-block' : 'hidden'} text-xl`}
        />
        <FiChevronDown
          className={`${!show ? 'inline-block' : 'hidden'} text-xl`}
        />
      </div>
      <div className={`${show ? 'block' : 'hidden'}`}>
        <div
          className={`whitespace-nowrap text-left font-bold text-white p-4 ${
            currentLocal === 'en'
              ? 'text-white bg-navHighLightBg'
              : 'text-primaryText bg-mobile-nav'
          }`}
          onClick={() => context.selectLanguage('en')}
        >
          English
        </div>
        <div
          className={`whitespace-nowrap text-left font-bold text-white p-4 ${
            currentLocal === 'zh-CN'
              ? 'text-white bg-navHighLightBg'
              : 'text-primaryText bg-mobile-nav'
          }`}
          onClick={() => context.selectLanguage('zh-CN')}
        >
          中文
        </div>
      </div>
    </div>
  );
}

function MobileNavBar() {
  const [show, setShow] = useState(false);
  const intl = useIntl();
  const { data } = useRefPrice();
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const accountId = wallet.getAccountId();

  useEffect(() => {
    document.addEventListener('click', handleClick, false);

    return () => {
      document.addEventListener('click', handleClick, false);
    };
  }, []);

  const links = [
    {
      label: <FormattedMessage id="view_pools" defaultMessage="View Pools" />,
      path: '/pools',
    },
    {
      label: (
        <FormattedMessage
          id="Create_New_Pool"
          defaultMessage="Create New Pool"
        />
      ),
      path: '/pools/add',
    },
  ];

  const moreLinks = [
    {
      label: <FormattedMessage id="airdrop" defaultMessage="Airdrop" />,
      url: '/airdrop',
      isExternal: false,
    },
    {
      label: (
        <FormattedMessage id="rainbow_bridge" defaultMessage="RainBow Bridge" />
      ),
      url: 'https://ethereum.bridgetonear.org/',
      isExternal: true,
    },
    {
      label: intl.formatMessage({ id: 'docs' }),
      url: 'https://guide.ref.finance',
      isExternal: true,
    },
    { label: 'Forum', url: 'https://gov.ref.finance', isExternal: true },
    {
      label: 'Discord',
      url: 'https://discord.gg/SJBGcfMxJz',
      isExternal: true,
    },
    { label: 'Telegram', url: 'https://t.me/ref_finance', isExternal: true },
    {
      label: 'Twitter',
      url: 'https://twitter.com/finance_ref',
      isExternal: true,
    },
    {
      label: 'Medium',
      url: 'https://ref-finance.medium.com/',
      isExternal: true,
    },
  ];

  const handleClick = (e: any) => {
    if (
      iconRef.current.contains(e.target) ||
      popupRef.current.contains(e.target)
    ) {
      return;
    }
    setShow(false);
  };

  if (wallet.isSignedIn()) {
    links.push({
      label: (
        <FormattedMessage id="Your_Liquidity" defaultMessage="Your Liquidity" />
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
      <div className="flex items-center text-2xl text-white justify-between p-4">
        <NavLogo />
        <div className="flex">
          <div
            className={`inline-flex px-1 mr-2 items-center justify-center rounded-full ${
              wallet.isSignedIn()
                ? 'bg-gray-700 text-white'
                : 'border border-gradientFrom text-gradientFrom'
            } pl-3 pr-3`}
          >
            <div className="pr-1">
              <Near color={wallet.isSignedIn() ? 'white' : '#00c6a2'} />
            </div>
            <div className="overflow-ellipsis overflow-hidden text-xs whitespace-nowrap account-name">
              {wallet.isSignedIn() ? (
                <div>{accountId}</div>
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
          <span ref={iconRef} onClick={() => setShow(true)}>
            <HiMenu />
          </span>
        </div>
      </div>
      <div
        className={`fixed top-0 left-0 z-20 h-screen w-full bg-black bg-opacity-30 backdrop-blur-lg filter-blur backdrop-filter overflow-auto ${
          show ? 'block' : 'hidden'
        }`}
      >
        <div
          ref={popupRef}
          className="block h-full w-4/6 float-right pt-6 bg-mobile-nav shadow-4xl"
        >
          <div className="flex justify-between items-center">
            <div
              className={`inline-flex px-1 ml-4 items-center justify-center rounded-full ${
                wallet.isSignedIn()
                  ? 'bg-gray-700 text-white'
                  : 'border border-gradientFrom text-gradientFrom'
              } pl-3 pr-3`}
            >
              <div className="pr-1">
                <Near color={wallet.isSignedIn() ? 'white' : '#00c6a2'} />
              </div>
              <div className="overflow-ellipsis py-1 text-xs overflow-hidden whitespace-nowrap account-name">
                {wallet.isSignedIn() ? (
                  <div>{accountId}</div>
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
            {wallet.isSignedIn() && (
              <RiLogoutCircleRLine
                className=" text-2xl text-primaryText mr-5"
                onClick={() => {
                  wallet.signOut();
                  window.location.assign('/');
                }}
              />
            )}
          </div>

          <div className="p-4 flex">
            <NavLogoLarge />
            <span className="inline-block ml-2 mt-1 text-white">
              ${data && data !== '-' ? toPrecision(data, 2) : '-'}
            </span>
          </div>
          <div className="text-primaryText divide-y divide-primaryText border-t border-b border-primaryText divide-opacity-30 border-opacity-30">
            {wallet.isSignedIn() && (
              <MobileAnchor
                to="/account"
                pattern="/account"
                name="view_account"
                onClick={close}
              />
            )}
            <MobileAnchor
              to="/deposit"
              pattern="/deposit/:id?"
              name="Deposit"
              onClick={close}
            />
            <MobileAnchor to="/" pattern="/" name="Swap" onClick={close} />
            <MobilePoolsMenu links={links} onClick={close} />
            <MobileAnchor
              to="/farms"
              pattern="/farms"
              name="Farms"
              onClick={close}
            />
            <div>
              <Link
                to={{
                  pathname: 'https://mzko2gfnij6.typeform.com/to/EPmUetxU',
                }}
                target="_blank"
              >
                <div className="p-4 link font-bold p-2 text-primaryText">
                  Quiz
                  <FaExternalLinkAlt className="float-right mt-1 ml-2 text-xs opacity-60" />
                </div>
              </Link>
            </div>

            <MobileMoreMenu links={moreLinks} onClick={close} />
            <MobileSwitchLanguage />
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
        <nav className="flex items-center justify-between px-9 pt-6 col-span-8">
          <div className="relative -top-0.5">
            <Logo />
          </div>
          <div className="flex items-center">
            <span className="relative inline-flex pr-4">
              <IconBubble />
              <a
                target="_blank"
                href="https://mzko2gfnij6.typeform.com/to/EPmUetxU"
                className={`w-14 h-6 text-gray-800 absolute top-0 left-0`}
              >
                Quiz
              </a>
            </span>
            <Anchor to="/deposit" pattern="/deposit/:id?" name="Deposit" />
            <Anchor to="/" pattern="/" name="Swap" />
            <PoolsMenu />
            <Anchor to="/farms" pattern="/farms" name="Farms" />
          </div>
          <div className="flex items-center w-44 justify-end">
            <AccountEntry />
            <MoreMenu />
          </div>
        </nav>
      </div>
      <MobileNavBar />
    </>
  );
}
export default NavigationBar;
