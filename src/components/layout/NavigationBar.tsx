import React, { useContext, useState } from 'react';
import { matchPath } from 'react-router';
import { Context } from '~components/wrapper';
import getConfig from '~services/config';
import {
  Logo,
  Near,
  IconBubble,
  IconMyLiquidity,
  IconCreateNew,
  IconPools,
  IconAirDropGreenTip,
  WrapNearEnter,
  WrapNearIconDark,
  GreenArrowIcon,
  MoreMenuIcon,
} from '~components/icon';
import { SmallWallet } from '~components/icon/SmallWallet';
import {
  AccountIcon,
  ActivityIcon,
  WalletIcon,
  SignoutIcon,
} from '~components/icon/Common';
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
import { WrapNearIcon } from './WrapNear';
import { XrefIcon } from '~components/icon/Xref';

const config = getConfig();

function Anchor({
  to,
  pattern,
  name,
  className,
  newFuntion,
}: {
  to: string;
  pattern: string;
  name: string;
  className?: string;
  newFuntion?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const location = useLocation();
  const isSelected = matchPath(location.pathname, {
    path: pattern,
    exact: true,
    strict: false,
  });

  return (
    <Link
      to={to}
      className="relative"
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <h2
        className={`link hover:text-greenColor text-lg font-bold p-4 cursor-pointer relative z-10 ${className} ${
          isSelected ? 'text-greenColor' : 'text-gray-400'
        }`}
      >
        <FormattedMessage id={name} defaultMessage={name} />
        {newFuntion ? (
          <span className="absolute top-5 right-2">
            <IconAirDropGreenTip />
          </span>
        ) : null}
      </h2>
      <GreenArrow hover={hover}></GreenArrow>
    </Link>
  );
}

function AccountEntry() {
  const history = useHistory();
  const [hover, setHover] = useState(false);
  const [account, network] = wallet.getAccountId().split('.');
  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;
  const accountName =
    account.length > 10 ? niceAccountId : wallet.getAccountId();
  const location = useLocation();
  const accountList = [
    {
      icon: <AccountIcon />,
      textId: 'view_account',
      selected: location.pathname == '/account',
      click: () => {
        history.push('/account');
      },
    },
    {
      icon: <ActivityIcon />,
      textId: 'recent_activity',
      selected: location.pathname == '/recent',
      click: () => {
        history.push('/recent');
      },
    },
    {
      icon: <WalletIcon />,
      textId: 'go_to_near_wallet',
      subIcon: <HiOutlineExternalLink />,
      click: () => {
        window.open(config.walletUrl, '_blank');
      },
    },
    {
      icon: <SignoutIcon />,
      textId: 'sign_out',
      click: () => {
        wallet.signOut();
        window.location.assign('/');
      },
    },
  ];
  return (
    <div className="user text-xs text-center justify-end z-30 mx-3.5">
      <div
        className={`cursor-pointer font-bold items-center justify-end text-center overflow-visible relative py-5`}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        <div
          className={`inline-flex px-1 py-0.5 items-center justify-center rounded-full border border-gray-700 ${
            hover ? 'border-gradientFrom bg-opacity-0' : ''
          } ${
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
              <span className="flex ml-1">
                {accountName}
                <FiChevronDown className="text-base ml-1" />
              </span>
            ) : (
              <button
                onClick={() => wallet.requestSignIn(REF_FARM_CONTRACT_ID)}
                type="button"
              >
                <span className="ml-1 text-xs">
                  <FormattedMessage
                    id="connect_to_near"
                    defaultMessage="Connect to NEAR"
                  />
                </span>
              </button>
            )}
          </div>
        </div>
        {wallet.isSignedIn() && hover ? (
          <div className={`absolute top-14 pt-2 right-0 w-64`}>
            <Card
              className="menu-max-height cursor-default shadow-4xl  border border-primaryText"
              width="w-64"
              padding="py-4"
            >
              {accountList.map((item, index) => {
                return (
                  <div
                    onClick={item.click}
                    key={item.textId + index}
                    className={`flex items-center text-sm cursor-pointer font-semibold py-4 pl-7 hover:text-white hover:bg-navHighLightBg ${
                      item.selected
                        ? 'text-white bg-navHighLightBg'
                        : 'text-primaryText'
                    }`}
                  >
                    <label className="w-9 text-left cursor-pointer">
                      {item.icon}
                    </label>
                    <label className="cursor-pointer">
                      <FormattedMessage id={item.textId}></FormattedMessage>
                    </label>
                    {item.subIcon ? (
                      <label className="text-lg ml-2">{item.subIcon}</label>
                    ) : null}
                  </div>
                );
              })}
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function QuizOld() {
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
function Quiz() {
  return (
    <div
      className="flex items-center justify-center cursor-pointer relative p-4"
      onClick={() => window.open('https://form.typeform.com/to/EPmUetxU')}
    >
      <IconBubble />
      <span className="absolute" style={{ transform: 'translateY(-3px)' }}>
        <FormattedMessage id="Risk"></FormattedMessage>
      </span>
    </div>
  );
}
function Xref() {
  const history = useHistory();
  const location = useLocation();
  const [hover, setHover] = useState(false);
  const goXrefPage = () => {
    history.push('/xref');
  };
  return (
    <div
      className={`relative p-4 cursor-pointer hover:opacity-100 ${
        location.pathname == '/xref' ? 'opacity-100' : 'opacity-60'
      }`}
      onClick={goXrefPage}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <XrefIcon className="cursor-pointer"></XrefIcon>
      <GreenArrow hover={hover}></GreenArrow>
    </div>
  );
}
function GreenArrow(props: any) {
  const { hover } = props;
  return (
    <div
      className={`flex absolute w-full h-full left-0 top-0 justify-between items-center ${
        hover ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <span>
        <GreenArrowIcon></GreenArrowIcon>
      </span>
      <span style={{ transform: 'rotateY(180deg)' }}>
        <GreenArrowIcon></GreenArrowIcon>
      </span>
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
          isSelected || hover ? 'text-greenColor' : 'text-gray-400'
        }`}
      >
        <div className="relative">
          <h2
            className={`flex items-center link hover:text-greenColor text-lg font-bold p-4 cursor-pointer`}
          >
            <FormattedMessage id="pools" defaultMessage="Pools" />
            <label className="text-xl ml-1">
              <FiChevronDown />
            </label>
          </h2>
          <GreenArrow hover={hover}></GreenArrow>
        </div>
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
      className="relative z-30"
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        onClickMenuItem?.(menuData, '');
      }}
    >
      <div className="text-primaryText hover:text-greenColor cursor-pointer">
        <MoreMenuIcon></MoreMenuIcon>
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
                  {/* {id === 1 && (
                    <span className=" -mt-2 ml-1">
                      <IconAirDropGreenTip />{' '}
                    </span>
                  )} */}
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
            <Anchor to="/" pattern="/" name="Swap" />
            <Anchor to="/stableswap" pattern="/stableswap" name="StableSwap" />
            <PoolsMenu />
            <Anchor to="/farms" pattern="/farms" name="Farms" />
            <Xref></Xref>
          </div>
          <div className="flex items-center justify-end flex-1">
            {wallet.isSignedIn() && (
              <div className="text-white">
                <div
                  className=" py-1 cursor-pointer items-center flex"
                  onClick={() => setShowWrapNear(true)}
                >
                  <WrapNearIcon />
                </div>
                <WrapNear
                  isOpen={showWrapNear}
                  onRequestClose={() => setShowWrapNear(false)}
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
