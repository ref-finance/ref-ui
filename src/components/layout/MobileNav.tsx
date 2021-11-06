import React, { useContext, useEffect, useRef, useState } from 'react';
import { matchPath } from 'react-router';
import { Context } from '~components/wrapper';
import { Near, NavLogo, NavLogoLarge } from '~components/icon';
import { Link, useLocation } from 'react-router-dom';
import { wallet } from '~services/near';
import { useHistory } from 'react-router';
import { REF_FARM_CONTRACT_ID } from '~services/near';
import { FormattedMessage, useIntl } from 'react-intl';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { HiMenu } from 'react-icons/hi';

import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { useRefPrice } from '~state/account';
import { toPrecision } from '~utils/numbers';
import { RefAnalytics } from '~components/icon/RefAnalytics';

export function MobileAnchor({
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

export function MobilePoolsMenu({
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

export function MobileMoreMenu({
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

export function MobileSwitchLanguage() {
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

export function Logout() {
  return (
    wallet.isSignedIn() && (
      <div
        className={
          'whitespace-nowrap flex text-left font-bold p-4 text-primaryText bg-mobile-nav'
        }
        onClick={() => {
          wallet.signOut();
          window.location.assign('/');
        }}
      >
        <RiLogoutCircleRLine className="text-2xl text-primaryText mr-3" />
        <FormattedMessage id="sign_out" defaultMessage="Sign out" />
      </div>
    )
  );
}

export function MobileNavBar() {
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
          <Logout />
          <div
            className=" p-4 "
            onClick={() => window.open('https://sodaki.com/')}
          >
            <RefAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
}
