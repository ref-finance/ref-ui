import React, { useContext, useState } from 'react';
import { matchPath } from 'react-router';
import { Context } from '~components/wrapper';
import {
  Logo,
  Near,
  IconBubble,
  IconMyLiquidity,
  IconCreateNew,
  IconPools,
  IconAirDropGreenTip,
  WrapNearEnter,
} from '~components/icon';
import { Link, useLocation } from 'react-router-dom';
import { wallet } from '~services/near';
import { useHistory } from 'react-router';
import { Card } from '~components/card/Card';
import { TokenList } from '~components/deposit/Deposit';
import {
  useTokenBalances,
  useUserRegisteredTokens,
  useWhitelistTokens,
} from '~state/token';
import { REF_FARM_CONTRACT_ID } from '~services/near';
import { GradientButton } from '~components/button/Button';
import { FormattedMessage } from 'react-intl';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { IoChevronBack, IoClose } from 'react-icons/io5';

import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { useMenuItems } from '~utils/menu';
import { MobileNavBar } from './MobileNav';
import WrapNear from '~components/forms/WrapNear';
import { isMobile } from '~utils/device';

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
  if (wallet.isSignedIn()) {
    if (!userTokens || !balances) return null;
  }

  return (
    <div className="user text-xs text-center justify-end h-full z-30 ml-2 mx-5">
      <div
        className={`cursor-pointer font-bold items-center justify-end text-center overflow-visible relative h-16 pt-5`}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <div
          className={`inline-flex p-1 mr-2 items-center justify-center rounded-full ${
            wallet.isSignedIn()
              ? 'bg-gray-700 text-white'
              : 'border border-gradientFrom text-gradientFrom'
          } pl-3 pr-3`}
        >
          <div className="pr-1">
            <Near color={wallet.isSignedIn() ? 'white' : '#00c6a2'} />
          </div>
          <div className="overflow-ellipsis overflow-hidden whitespace-nowrap account-name">
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
          className={`absolute top-14 pt-2 right-0 w-80 ${
            wallet.isSignedIn() && hover ? 'block' : 'hidden'
          }`}
        >
          <Card
            className="menu-max-height cursor-default shadow-4xl  border border-primaryText"
            width="w-80"
          >
            <div className="flex items-center justify-between mb-5 text-primaryText">
              <div className="text-white">
                <FormattedMessage id="balance" defaultMessage="Balance" />
              </div>
            </div>
            {wallet.isSignedIn() ? (
              <TokenList
                tokens={userTokens}
                balances={balances}
                hideEmpty={true}
              />
            ) : null}
            <div className="flex items-center justify-center pt-5">
              <GradientButton
                className=" w-36 h-8 text-white cursor-pointer py-2 mr-2"
                onClick={() => history.push('/account')}
              >
                <FormattedMessage
                  id="view_account"
                  defaultMessage="View account"
                />
              </GradientButton>
              <div
                className="h-8 w-20 rounded border-gradientFrom border py-2 text-xs text-gradientFrom font-semibold cursor-pointer"
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

function Quiz() {
  const [hoverQuiz, setHoverQuiz] = useState(false);
  return (
    <div
      className="relative z-20"
      onMouseOver={() => setHoverQuiz(true)}
      onMouseLeave={() => setHoverQuiz(false)}
    >
      <span className="relative inline-flex p-4">
        <IconBubble />
        <span className={`w-20 h-14 text-gray-800 absolute top-4 left-1`}>
          Quiz
        </span>
      </span>
      <div
        className={`${
          hoverQuiz ? 'block' : 'hidden'
        } absolute top-12 -left-20 rounded-md`}
      >
        <Card
          width="w-60"
          padding="py-4"
          rounded="rounded-md"
          className="border border-primaryText shadow-4xl"
        >
          {/* <div
            className="whitespace-nowrap text-left hover:bg-navHighLightBg text-sm font-semibold flex justify-start text-primaryText hover:text-white cursor-pointer py-4 pl-10 "
            onClick={() =>
              window.open('https://mzko2gfnij6.typeform.com/to/N6jSxnym')
            }
          >
            <FormattedMessage id="New_ui" defaultMessage="New UI" />
            <span className="ml-2 bg-gradientFrom px-2 flex justify-center items-center text-white text-xs rounded-full">
              Hot
            </span>
            <HiOutlineExternalLink className="float-right ml-2 text-xl" />
          </div> */}
          <div
            className="whitespace-nowrap text-left hover:bg-navHighLightBg text-sm font-semibold flex justify-start text-primaryText hover:text-white cursor-pointer py-4 pl-10"
            onClick={() =>
              window.open('https://mzko2gfnij6.typeform.com/to/EPmUetxU')
            }
          >
            <FormattedMessage id="Risk" defaultMessage="Risk" />
            <HiOutlineExternalLink className="float-right ml-2 text-xl" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function PoolsMenu() {
  const location = useLocation();
  const isSelected =
    location.pathname.startsWith('/pools') ||
    location.pathname.startsWith('/pool') ||
    location.pathname.startsWith('/more_pools');
  const [hover, setHover] = useState(false);
  const history = useHistory();

  const links = [
    {
      label: <FormattedMessage id="view_pools" defaultMessage="View Pools" />,
      path: '/pools',
      logo: <IconPools />,
    },
    {
      label: (
        <FormattedMessage
          id="Create_New_Pool"
          defaultMessage="Create New Pool"
        />
      ),
      path: '/pools/add',
      logo: <IconCreateNew />,
    },
  ];

  if (wallet.isSignedIn()) {
    links.push({
      label: (
        <FormattedMessage id="Your_Liquidity" defaultMessage="Your Liquidity" />
      ),
      path: '/pools/yours',
      logo: <IconMyLiquidity />,
    });
  }

  return (
    <div
      className="relative z-20"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`flex items-center justify-center ${
          isSelected || hover ? 'text-green-500' : 'text-gray-400'
        }`}
      >
        <h2
          className={`link hover:text-green-500 text-lg font-bold p-4 cursor-pointer`}
        >
          <FormattedMessage id="pools" defaultMessage="Pools" />
        </h2>
        <FiChevronDown />
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
            let isSelected = link.path === location.pathname;
            if (
              location.pathname.startsWith('/pool/') ||
              location.pathname.startsWith('/more_pools/')
            ) {
              if (link.path === '/pools') {
                isSelected = true;
              }
            }

            return (
              <div
                key={link.path}
                className={`flex justify-start items-center hover:bg-navHighLightBg text-sm font-semibold  hover:text-white cursor-pointer py-4 pl-7 ${
                  isSelected
                    ? 'text-white bg-navHighLightBg'
                    : 'text-primaryText'
                }`}
                onClick={() => history.push(link.path)}
              >
                <span className="inline-block mr-3">{link.logo}</span>
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
  const location = useLocation();
  const history = useHistory();
  const onClickMenuItem = (items: any[], label: string) => {
    setCurMenuItems(items);
    setParentLabel(label);
  };
  const switchLanuage = (label: string) => {
    context.selectLanguage(label);
  };
  const handleMoreMenuClick = (
    url: string,
    isExternal: boolean,
    label: string,
    children?: any,
    language?: string
  ) => {
    if (url) {
      if (isExternal) {
        window.open(url);
      } else {
        history.push(url);
      }
    } else if (children) {
      onClickMenuItem?.(children, label);
    } else {
      switchLanuage(language);
    }
  };
  const hasSubMenu = curMenuItems.some(({ children }) => !!children?.length);
  return (
    <div
      className="relative z-30 h-8"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        onClickMenuItem?.(menuData, '');
      }}
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
            <div
              className="whitespace-nowrap hover:text-white text-left items-center flex justify-start text-sm font-semibold text-primaryText cursor-pointer py-4 pl-4"
              onClick={() => onClickMenuItem?.(menuData, '')}
            >
              <IoChevronBack className="text-xl " />
              <span className=" ml-8">{parentLabel}</span>
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
              const isSelected =
                url &&
                !isExternal &&
                matchPath(location.pathname, {
                  path: url,
                  exact: true,
                  strict: false,
                });

              return (
                <div
                  key={id}
                  className={`whitespace-nowrap text-left items-center flex justify-start hover:bg-navHighLightBg text-sm font-semibold hover:text-white
                 ${
                   (language && currentLocal === language) || isSelected
                     ? 'bg-navHighLightBg text-white'
                     : 'text-primaryText'
                 }
                 cursor-pointer py-4 pl-7`}
                  onClick={() =>
                    handleMoreMenuClick(
                      url,
                      isExternal,
                      label,
                      children,
                      language
                    )
                  }
                >
                  {logo && (
                    <span
                      className={`${
                        parentLabel ? 'ml-10' : ''
                      } text-xl w-9 text-left`}
                    >
                      {logo}
                    </span>
                  )}
                  {label}
                  {id === 1 && (
                    <span className=" -mt-2 ml-1">
                      <IconAirDropGreenTip />{' '}
                    </span>
                  )}
                  <span className="ml-4 text-xl">{icon}</span>
                  {children && (
                    <span className="text-xl absolute right-4">
                      <FiChevronRight />
                    </span>
                  )}
                </div>
              );
            }
          )}
        </Card>
      </div>
    </div>
  );
}

function NavigationBar() {
  const allTokens = useWhitelistTokens();
  const [showWrapNear, setShowWrapNear] = useState(false);
  return (
    <>
      <div className="nav-wrap md:hidden xs:hidden text-center relative">
        <nav className="flex items-center justify-between px-9 pt-6 col-span-8">
          <div className="relative -top-0.5 flex-1">
            <Logo />
          </div>
          <div className="flex items-center">
            <Quiz />
            <Anchor to="/deposit" pattern="/deposit/:id?" name="Deposit" />
            <Anchor to="/" pattern="/" name="Swap" />
            <PoolsMenu />
            <Anchor to="/farms" pattern="/farms" name="Farms" />
          </div>
          <div className="flex items-center justify-end flex-1">
            {wallet.isSignedIn() && (
              <div className="text-white">
                <div
                  className=" py-1 px-2 border text-sm border-framBorder text-framBorder hover:text-white hover:bg-framBorder hover:border-0 cursor-pointer rounded h-6 items-center flex"
                  onClick={() => setShowWrapNear(true)}
                >
                  <WrapNearEnter></WrapNearEnter>
                  <span className=" ml-2 whitespace-nowrap">
                    <FormattedMessage
                      id="wrapnear"
                      defaultMessage="Wrap NEAR"
                    />
                  </span>
                </div>
                <WrapNear
                  isOpen={showWrapNear}
                  onRequestClose={() => setShowWrapNear(false)}
                  allTokens={allTokens}
                  style={{
                    overlay: {
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                    },
                    content: {
                      outline: 'none',
                      position: 'fixed',
                      width: 550,
                      bottom: '50%',
                    },
                  }}
                />
              </div>
            )}
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
