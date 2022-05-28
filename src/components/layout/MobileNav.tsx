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
  KoIcon,
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
import {
  AccountTipDownByAccountID,
  AuroraEntry,
  USNCard,
} from './NavigationBar';
import { ConnectDot } from '../icon/CrossSwapIcons';
import USNBuyComponent from '~components/forms/USNBuyComponent';
import USNPage from '~components/usn/USNPage';
import { REF_FI_SWAP_SWAPPAGE_TAB_KEY } from '../../pages/SwapPage';
import Marquee from '~components/layout/Marquee';

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
        <div
          className={`flex items-center hitespace-nowrap text-left bg-cardBg text-white p-4 ${
            currentLocal === 'ko' ? 'text-white' : 'text-primaryText '
          }`}
          onClick={() => context.selectLanguage('ko')}
        >
          <span className="text-2xl mr-5">
            <KoIcon />
          </span>
          한국어
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
        if (location.pathname == '/account') {
          localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'normal');
          window.location.reload();
        } else {
          history.push('/account?tab=ref');
        }
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
        top:
          hasBalanceOnRefAccount && window.location.pathname !== '/account'
            ? '6.3rem'
            : '4.2rem',
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
  // const history = useHistory();
  const [mobileWrapNear, setMobileWrapNear] = useState(false);
  // const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [pathnameState, setPathnameState] = useState<boolean>(
    window.location.pathname !== '/account'
  );

  const {
    setShowWalletSelector,
    showWalletSelector,
    hasBalanceOnRefAccount,
    hasAuroraBalance,
  } = props;
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const [showTip, setShowTip] = useState<boolean>(false);
  const [USNButtonHover, setUSNButtonHover] = useState<boolean>(false);
  const [showUSN, setShowUSN] = useState<boolean>(false);

  const [showeBorrowCard, setShowBorrowCard] = useState(false);

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
      document.removeEventListener('click', () => {}, false);
    };
  }, []);
  const setPatheState = () =>
    setPathnameState(window.location.pathname !== '/account');

  useEffect(() => {
    const _historyWrap = function (type: any) {
      const orig = history[type];
      const e = new Event(type);
      return function () {
        const rv = orig.apply(this, arguments);
        //@ts-ignore
        e.arguments = arguments;
        window.dispatchEvent(e);
        return rv;
      };
    };
    history.pushState = _historyWrap('pushState');
    history.replaceState = _historyWrap('replaceState');
    window.addEventListener('popstate', (e) => {
      setPatheState();
    });
    window.addEventListener('pushState', function (e) {
      setPatheState();
    });
    window.addEventListener('replaceState', function (e) {
      setPatheState();
    });
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
      isExternal ? window.open(url) : window.open(url, '_self');
      close();
    } else if (openMenu === label) {
      setCloseMenu(!closeMenu);
    } else {
      setOpenMenu(label);
      setCloseMenu(true);
    }
  }
  return (
    <>
      <div
        className={`${
          hasBalanceOnRefAccount && pathnameState ? 'block' : 'hidden'
        } text-xs py-1.5 px-2 lg:hidden text-center`}
        style={{
          backgroundColor: '#CFCEFE',
          zIndex: 100,
        }}
      >
        👀 &nbsp;
        <FormattedMessage
          id="ref_account_balance_tip_mobile"
          defaultMessage="You have tokens in your ref account."
        />
        {` `}
        <span
          className={`font-bold underline cursor-pointer mx-1`}
          onClick={() => window.open('/account?tab=ref', '_blank')}
        >
          <FormattedMessage id="click" defaultMessage="Click" />
        </span>
        <FormattedMessage id="to_recover" defaultMessage="to recover." />
      </div>
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
              className={`flex px-1 mr-px items-center justify-center rounded-full border border-gray-700 hover:border-gradientFrom hover:bg-opacity-0 ${
                isSignedIn
                  ? 'bg-gray-700 text-white'
                  : 'border border-gradientFrom text-gradientFrom'
              } pl-3 pr-3`}
            >
              <div className="pr-1">
                <Near color={isSignedIn ? 'white' : '#00c6a2'} />
              </div>
              <div className="overflow-ellipsis overflow-hidden text-xs whitespace-nowrap account-name relative">
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

            <div className={!isSignedIn ? 'hidden' : ' flex items-center mr-2'}>
              <ConnectDot />
              <ConnectDot />

              <AuroraEntry
                hasBalanceOnAurora={hasAuroraBalance}
                extraClick={() => setAccountVisible(false)}
              />
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
          style={{
            zIndex: '80',
          }}
        >
          <div
            ref={popupRef}
            className="block h-full overflow-y-scroll w-4/6 float-right bg-cardBg shadow-4xl z-30"
          >
            <div className="p-4 flex text-white items-center justify-start">
              <NavLogoLarge />
              <span className="inline-block ml-2 mt-1 text-white">
                ${data && data !== '-' ? toPrecision(data, 2) : '-'}
              </span>
            </div>
            <div className="text-primaryText divide-y divide-primaryText border-t border-b border-primaryText divide-opacity-30 border-opacity-30">
              {isSignedIn && (
                <div
                  className="text-primaryText"
                  onClick={() => setShow(false)}
                >
                  <div
                    className="flex p-4 justify-between items-center"
                    onClick={() => {
                      setMobileWrapNear(true);
                      setShowUSN(false);
                      setShowBorrowCard(false);
                    }}
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
              <MobileUSNButton
                setShow={setShow}
                setMobileWrapNear={setMobileWrapNear}
                showUSN={showUSN}
                setShowBorrowCard={setShowBorrowCard}
                showeBorrowCard={showeBorrowCard}
                setShowUSN={setShowUSN}
              />
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
                                    : window.open(link.url, '_self');
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
      {isMobile ? <Marquee></Marquee> : null}
    </>
  );
}

function MobileUSNButton({
  setShow,
  setMobileWrapNear,
  showUSN,
  setShowBorrowCard,
  showeBorrowCard,
  setShowUSN,
}: any) {
  const [btnTouched, setBtcTouched] = useState<string>('');

  return (
    <div className="text-primaryText">
      <div className="flex p-5 justify-between items-center text-sm">
        <USNBuyComponent></USNBuyComponent>

        <div className="ml-3 w-full flex items-center">
          <button className="pr-2.5 border-r-2 border-white border-opacity-10">
            <div
              className={`rounded-lg bg-black bg-opacity-20 border border-transparent px-3 py-1 ${
                btnTouched === 'buy'
                  ? 'border border-gradientFrom text-white'
                  : ''
              }`}
              onTouchStart={(e) => {
                setBtcTouched('buy');

                setShowUSN(true);
                setShowBorrowCard(false);
              }}
              onTouchEnd={(e) => {
                setBtcTouched('');
                setShow(false);
                setMobileWrapNear(false);
              }}
            >
              <FormattedMessage id="buy" defaultMessage="Buy" />
            </div>
          </button>

          <button className="pl-2.5">
            <div
              className={`rounded-lg bg-black bg-opacity-20 border border-transparent px-3 py-1 ${
                btnTouched === 'borrow'
                  ? 'border border-gradientFrom text-white'
                  : ''
              }`}
              onTouchStart={(e) => {
                setBtcTouched('borrow');
                setShowUSN(false);
                setShowBorrowCard(true);
              }}
              onTouchEnd={(e) => {
                setBtcTouched('');
                setShow(false);
                setMobileWrapNear(false);
              }}
            >
              <FormattedMessage id="borrow" defaultMessage="Borrow" />
            </div>
          </button>
        </div>
      </div>
      <USNCard
        showUSN={showUSN}
        setShowBorrowCard={setShowBorrowCard}
        showeBorrowCard={showeBorrowCard}
        setShowUSN={setShowUSN}
      />
    </div>
  );
}
