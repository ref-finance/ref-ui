import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { matchPath } from 'react-router';
import { Context } from '~components/wrapper';
import {
  Near,
  NavLogo,
  NavLogoLarge,
  IconMyLiquidity,
  IconEn,
  IconZh,
  IconVi,
  WrapNearEnter,
  IconAirDropGreenTip,
  WrapNearIconDark,
  UkIcon,
  RuIcon,
  JaIcon,
} from '~components/icon';
import { WNEARExchngeIcon } from '~components/icon/Common';
import { Link, useLocation } from 'react-router-dom';
import { near, wallet } from '~services/near';
import { useHistory } from 'react-router';
import { REF_FARM_CONTRACT_ID } from '~services/near';
import { FormattedMessage, useIntl } from 'react-intl';
import { HiMenu, HiOutlineExternalLink } from 'react-icons/hi';

import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { useRefPrice } from '~state/account';
import { toPrecision } from '~utils/numbers';
import { RefAnalytics } from '~components/icon/RefAnalytics';
import { moreLinks } from '~utils/menu';
import WrapNear from '~components/forms/WrapNear';
import { useDepositableBalance, useWhitelistTokens } from '~state/token';
import { nearMetadata } from '~services/wrap-near';
import getConfig from '~services/config';
import {
  AccountIcon,
  ActivityIcon,
  WalletIcon,
  SignoutIcon,
} from '~components/icon/Common';

import { WalletContext } from '~utils/sender-wallet';

const config = getConfig();
import { isMobile } from '~utils/device';
import { getCurrentWallet, getAccountName } from '../../utils/sender-wallet';
import { FarmDot } from '../icon/FarmStamp';
import { AccountTipDownByAccountID } from './NavigationBar';

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
          className={`p-4 text-lg link ${className} ${
            isSelected ? 'text-white bg-navHighLightBg' : 'text-primaryText'
          }`}
        >
          <FormattedMessage id={name} defaultMessage={name} />
        </div>
      </Link>
    </div>
  );
}
const openMenuContext = createContext(null);
export function MobileSwitchLanguage() {
  const context = useContext(Context);
  const currentLocal = localStorage.getItem('local');
  const [show, setShow] = useState(false);
  const { openMenu, setOpenMenu } = useContext(openMenuContext);
  const handleLanguageMenu = function () {
    if (openMenu || show === false) {
      setShow(true);
      setOpenMenu(false);
    } else {
      setShow(false);
    }
  };

  return (
    <div className="relative z-20 bg-cardBg">
      <div
        className="flex p-4 items-center text-lg justify-between"
        onClick={handleLanguageMenu}
      >
        <div className={'text-primaryText'}>
          <FormattedMessage id="language" defaultMessage="Language" />
        </div>
        <FiChevronUp
          className={`${show && !openMenu ? 'inline-block' : 'hidden'} text-xl`}
        />
        <FiChevronDown
          className={`${!show || openMenu ? 'inline-block' : 'hidden'} text-xl`}
        />
      </div>
      <div className={`${show && !openMenu ? 'block' : 'hidden'}`}>
        <div
          className={`flex items-center whitespace-nowrap bg-cardBg text-left text-white p-4 ${
            currentLocal === 'en' ? 'text-white' : 'text-primaryText'
          }`}
          onClick={() => context.selectLanguage('en')}
        >
          <span className="text-2xl mr-5">
            <IconEn />
          </span>
          English
        </div>
        <div
          className={`flex items-center hitespace-nowrap text-left bg-cardBg text-white p-4 ${
            currentLocal === 'zh-CN' ? 'text-white' : 'text-primaryText '
          }`}
          onClick={() => context.selectLanguage('zh-CN')}
        >
          <span className="text-2xl mr-5">
            <IconZh />
          </span>
          中文
        </div>
        <div
          className={`flex items-center hitespace-nowrap text-left bg-cardBg text-white p-4 ${
            currentLocal === 'vi' ? 'text-white' : 'text-primaryText '
          }`}
          onClick={() => context.selectLanguage('vi')}
        >
          <span className="text-2xl mr-5">
            <IconVi />
          </span>
          Việt
        </div>
        <div
          className={`flex items-center hitespace-nowrap text-left bg-cardBg text-white p-4 ${
            currentLocal === 'uk' ? 'text-white' : 'text-primaryText '
          }`}
          onClick={() => context.selectLanguage('uk')}
        >
          <span className="text-2xl mr-5">
            <UkIcon />
          </span>
          Yкраїнський
        </div>
        <div
          className={`flex items-center hitespace-nowrap text-left bg-cardBg text-white p-4 ${
            currentLocal === 'ru' ? 'text-white' : 'text-primaryText '
          }`}
          onClick={() => context.selectLanguage('ru')}
        >
          <span className="text-2xl mr-5">
            <RuIcon />
          </span>
          Pусский
        </div>
        <div
          className={`flex items-center hitespace-nowrap text-left bg-cardBg text-white p-4 ${
            currentLocal === 'ja' ? 'text-white' : 'text-primaryText '
          }`}
          onClick={() => context.selectLanguage('ja')}
        >
          <span className="text-2xl mr-5">
            <JaIcon />
          </span>
          日本語
        </div>
      </div>
    </div>
  );
}

export function Logout() {
  const { wallet } = getCurrentWallet();

  return (
    wallet.isSignedIn() && (
      <div
        className={
          'whitespace-nowrap flex text-lg text-left p-4 text-primaryText bg-cardBg'
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

export function AccountModel(props: any) {
  const history = useHistory();
  const accountWrapRef = useRef(null);

  const { wallet } = getCurrentWallet();

  const { hasBalanceOnRefAccount } = props;

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
  const handleClick = (e: any) => {
    if (!accountWrapRef.current.contains(e.target)) {
      props.closeAccount();
    }
  };
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.addEventListener('click', handleClick, false);
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('click', handleClick, false);
    };
  }, []);
  return (
    <div
      className="fixed left-0 bottom-0 w-screen bg-black bg-opacity-70"
      style={{
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        top: '4.2rem',
      }}
    >
      <div className="w-full bg-cardBg" ref={accountWrapRef}>
        {accountList.map((item, index) => {
          return (
            <>
              <div
                onClick={() => {
                  item.click();
                  props.closeAccount();
                }}
                key={item.textId + index}
                className={`flex items-center text-base cursor-pointer font-semibold py-4 pl-20 hover:text-white hover:bg-navHighLightBg ${
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
                <label htmlFor="" className="ml-1.5">
                  {item.textId === 'view_account' && hasBalanceOnRefAccount ? (
                    <FarmDot inFarm={hasBalanceOnRefAccount} />
                  ) : null}
                </label>

                {item.subIcon ? (
                  <label className="text-lg ml-2">{item.subIcon}</label>
                ) : null}
              </div>
              {hasBalanceOnRefAccount && item.textId === 'view_account' ? (
                <div
                  className="text-center py-0.5 font-normal bg-gradientFrom w-full cursor-pointer text-xs"
                  onClick={item.click}
                  style={{
                    color: '#001320',
                  }}
                >
                  <FormattedMessage
                    id="ref_account_tip_2"
                    defaultMessage="You have token(s) in your REF Account"
                  />
                </div>
              ) : null}
            </>
          );
        })}
      </div>
    </div>
  );
}
export function MobileNavBar(props: any) {
  const [show, setShow] = useState(false);
  const intl = useIntl();
  const { data } = useRefPrice('MobileNav');
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [openMenu, setOpenMenu] = useState('');
  const [closeMenu, setCloseMenu] = useState(false);
  const history = useHistory();
  const [mobileWrapNear, setMobileWrapNear] = useState(false);
  // const [showWalletSelector, setShowWalletSelector] = useState(false);

  const { setShowWalletSelector, showWalletSelector, hasBalanceOnRefAccount } =
    props;
  const { signedInState } = useContext(WalletContext);
  const isSignedIn = signedInState.isSignedIn;

  const [showTip, setShowTip] = useState<boolean>(false);

  useEffect(() => {
    setShowTip(hasBalanceOnRefAccount);
  }, [hasBalanceOnRefAccount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [showTip]);

  const { wallet } = getCurrentWallet();

  const nearBalance = useDepositableBalance(
    nearMetadata.id,
    nearMetadata.decimals
  );
  const [accountVisible, setAccountVisible] = useState(false);

  useEffect(() => {
    document.addEventListener('click', handleClick, false);

    return () => {
      document.addEventListener('click', handleClick, false);
    };
  }, []);
  useEffect(() => {
    if (mobileWrapNear) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [mobileWrapNear]);

  const handleClick = (e: any) => {
    if (
      iconRef.current.contains(e.target) ||
      popupRef.current.contains(e.target)
    ) {
      return;
    }
    setShow(false);
  };

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [show]);

  if (isSignedIn) {
    moreLinks[2].children[2] = {
      id: 'Your_Liquidity',
      label: 'Your Liquidity',
      url: '/pools/yours',
      pattern: '/pools/yours',
      isExternal: false,
      logo: <IconMyLiquidity />,
    };
  }

  function close() {
    setShow(false);
  }
  function handleMenuClick(url: string, label: string, isExternal: boolean) {
    if (url) {
      isExternal ? window.open(url) : history.push(url);
      close();
    } else if (openMenu === label) {
      setCloseMenu(!closeMenu);
    } else {
      setOpenMenu(label);
      setCloseMenu(true);
    }
  }
  return (
    <div
      className="nav-wrap lg:hidden md:show relative xs:mb-6 md:mb-6"
      style={{
        zIndex: show ? 200 : 51,
      }}
    >
      {showTip ? <AccountTipDownByAccountID show={showTip} /> : null}
      <div className="flex items-center text-2xl text-white justify-between p-4">
        <NavLogo />
        <div className="flex">
          <div
            className={`inline-flex px-1 mr-2 items-center justify-center rounded-full border border-gray-700 hover:border-gradientFrom hover:bg-opacity-0 ${
              isSignedIn
                ? 'bg-gray-700 text-white'
                : 'border border-gradientFrom text-gradientFrom'
            } pl-3 pr-3`}
          >
            <div className="pr-1">
              <Near color={isSignedIn ? 'white' : '#00c6a2'} />
            </div>
            <div className="overflow-ellipsis overflow-hidden text-xs whitespace-nowrap account-name">
              {isSignedIn ? (
                <div
                  className="flex items-center"
                  onClick={() => {
                    setAccountVisible(!accountVisible);
                    setShowTip(false);
                  }}
                >
                  <div>{getAccountName(wallet.getAccountId())}</div>

                  {hasBalanceOnRefAccount ? (
                    <span className="ml-1.5">
                      <FarmDot inFarm={hasBalanceOnRefAccount} />
                    </span>
                  ) : null}

                  {accountVisible ? (
                    <FiChevronUp className="text-base ml-1" />
                  ) : (
                    <FiChevronDown className="text-base ml-1" />
                  )}
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowWalletSelector(true);
                  }}
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
        className={`fixed top-0 bottom-0 left-0 z-20 w-full bg-black bg-opacity-30 backdrop-blur-lg filter-blur backdrop-filter overflow-auto ${
          show ? 'block' : 'hidden'
        }`}
      >
        <div
          ref={popupRef}
          className="block h-full overflow-y-scroll w-4/6 float-right bg-cardBg shadow-4xl"
        >
          <div className="p-4 flex text-white items-center justify-start">
            <NavLogoLarge />
            <span className="inline-block ml-2 mt-1 text-white">
              ${data && data !== '-' ? toPrecision(data, 2) : '-'}
            </span>
          </div>
          <div className="text-primaryText divide-y divide-primaryText border-t border-b border-primaryText divide-opacity-30 border-opacity-30">
            {isSignedIn && (
              <div className="text-primaryText" onClick={() => setShow(false)}>
                <div
                  className="flex p-4 justify-between items-center"
                  onClick={() => setMobileWrapNear(true)}
                >
                  <WNEARExchngeIcon width="75" height="32" />
                  <span className="text-sm">
                    NEAR:&nbsp;{toPrecision(nearBalance, 3, true)}
                  </span>
                </div>
                <WrapNear
                  isOpen={mobileWrapNear}
                  onRequestClose={() => setMobileWrapNear(false)}
                  style={{
                    overlay: {
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                    },
                    content: {
                      outline: 'none',
                      position: 'fixed',
                      width: '90%',
                      bottom: '50%',
                    },
                  }}
                />
              </div>
            )}
            {moreLinks.map(
              ({
                id,
                label,
                subRoute,
                pattern,
                url,
                isExternal,
                children,
                newFunction,
                showIcon,
                iconElement,
              }) => {
                let location = useLocation();
                let isSelected = subRoute
                  ? subRoute.includes(location.pathname)
                  : matchPath(location.pathname, {
                      path: pattern,
                      exact: true,
                      strict: false,
                    });
                if (
                  location.pathname.startsWith('/pool/') ||
                  location.pathname.startsWith('/more_pools/')
                ) {
                  if (id === 'pools') {
                    isSelected = true;
                  }
                }
                return (
                  <div key={id}>
                    <div
                      className={`flex p-4 items-center text-lg justify-between ${
                        isSelected
                          ? !children
                            ? 'bg-navHighLightBg text-white'
                            : 'text-white'
                          : 'text-primaryText'
                      }`}
                      onClick={() => handleMenuClick(url, label, isExternal)}
                    >
                      {showIcon ? (
                        <span
                          className={`py-2 ${
                            isSelected ? 'opacity-100' : 'opacity-50'
                          }`}
                        >
                          {iconElement}
                        </span>
                      ) : (
                        <div className={`link relative`}>
                          <FormattedMessage id={id} defaultMessage={label} />
                          {newFunction ? (
                            <span className="absolute top-1 -right-2">
                              <IconAirDropGreenTip />
                            </span>
                          ) : null}
                        </div>
                      )}
                      {children && (
                        <span>
                          <FiChevronUp
                            className={`${
                              openMenu === label && closeMenu
                                ? 'inline-block'
                                : 'hidden'
                            } text-xl`}
                          />
                          <FiChevronDown
                            className={`${
                              openMenu !== label || !closeMenu
                                ? 'inline-block'
                                : 'hidden'
                            } text-xl`}
                          />
                        </span>
                      )}
                    </div>
                    {children && (
                      <div
                        className={`${
                          openMenu === label && closeMenu ? 'block' : 'hidden'
                        }`}
                      >
                        {children?.map((link) => {
                          let isSubMenuSelected: any = matchPath(
                            location.pathname,
                            {
                              path: link.pattern,
                              exact: true,
                              strict: false,
                            }
                          );
                          if (
                            location.pathname.startsWith('/pool/') ||
                            location.pathname.startsWith('/more_pools/')
                          ) {
                            if (link.id === 'view_pools') {
                              isSubMenuSelected = true;
                            }
                          }
                          return (
                            <div
                              key={link.id}
                              className={`whitespace-nowrap text-left items-center p-4 pl-2 flex justify-start ${
                                !link.isExternal && isSubMenuSelected
                                  ? 'text-white bg-navHighLightBg'
                                  : 'text-primaryText'
                              }`}
                              onClick={() => {
                                link.url && link.isExternal
                                  ? window.open(link.url)
                                  : history.push(link.url);
                                close();
                              }}
                            >
                              {link.logo && (
                                <span className="text-xl text-left w-8 flex justify-center mr-2">
                                  {link.logo}
                                </span>
                              )}
                              <FormattedMessage
                                id={link.id}
                                defaultMessage={link.label}
                              />
                              {link.tip && (
                                <span className="ml-2 bg-gradientFrom px-2 flex justify-center items-center text-white text-xs rounded-full">
                                  {link.tip}
                                </span>
                              )}

                              {link.url && link.isExternal && (
                                <HiOutlineExternalLink className="float-right ml-2 text-xl opacity-60" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
            )}
            <openMenuContext.Provider value={{ openMenu, setOpenMenu }}>
              <MobileSwitchLanguage />
            </openMenuContext.Provider>
          </div>
          <div
            className="p-4 bg-cardBg pb-16"
            onClick={() => window.open('https://stats.ref.finance/')}
          >
            <RefAnalytics />
          </div>
        </div>
      </div>
      {accountVisible ? (
        <AccountModel
          hasBalanceOnRefAccount={hasBalanceOnRefAccount}
          closeAccount={() => {
            setAccountVisible(false);
          }}
        />
      ) : null}
    </div>
  );
}
