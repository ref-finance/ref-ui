import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { matchPath } from 'react-router';
import { Context } from '~components/wrapper';
import { Near, NavLogoSimple } from '~components/icon';
import { Link, useLocation } from 'react-router-dom';
import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { HiOutlineExternalLink } from 'react-icons/hi';

import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { useRefPrice } from '~state/account';
import { toPrecision } from '~utils/numbers';
import { moreLinks, useMenusMobile, menuItemType } from '~utils/menu';
import getConfig from '~services/config';
import {
  AccountIcon,
  ActivityIcon,
  WalletIcon,
  SignoutIcon,
} from '~components/icon/Common';

import { WalletContext } from '../../utils/wallets-integration';

const config = getConfig();
import { isMobile } from '~utils/device';
import {
  getCurrentWallet,
  getAccountName,
} from '../../utils/wallets-integration';
import { FarmDot } from '../icon/FarmStamp';
import { AccountTipDownByAccountID, AuroraEntry } from './NavigationBar';
import { ConnectDot, CopyIcon } from '../icon/CrossSwapIcons';
import {
  REF_FI_SWAP_SWAPPAGE_TAB_KEY,
  SWAP_MODE_KEY,
  SWAP_MODE,
} from '../../pages/SwapPage';
import Marquee from '~components/layout/Marquee';
import {
  useWalletSelector,
  ACCOUNT_ID_KEY,
} from '../../context/WalletSelectorContext';
import CopyToClipboard from 'react-copy-to-clipboard';
import { openTransak } from '../alert/Transak';
import { BuyNearButton } from '../button/Button';
import { RefIcon, MailBoxIcon } from '../icon/Nav';
import {
  MoreIcon,
  SauceIcon,
  SauceText,
  OutLinkIcon,
  ArrowLeftIcon,
  ArrowDownIcon,
  HiMenuIcon,
  ArrowDownLargeIcon,
} from '~components/icon/Nav';
import { RefAnalytics, RefAnalyticsGary } from '~components/icon/RefAnalytics';
import { useLanguageItems } from '~utils/menu';
import { commonLangKey, formatItem } from './NavigationBar';
import {
  tradingKeyMap,
  get_orderly_private_key_path,
  get_orderly_public_key_path,
} from '../../pages/Orderly/orderly/utils';
import { REF_ORDERLY_ACCOUNT_VALID } from '../../pages/Orderly/components/UserBoard/index';

export function Logout() {
  const { wallet } = getCurrentWallet();

  return (
    wallet.isSignedIn() && (
      <div
        className={
          'whitespace-nowrap flex text-lg text-left p-4 text-primaryText bg-cardBg'
        }
        onClick={async () => {
          (await wallet.wallet()).signOut();
          localStorage.removeItem(ACCOUNT_ID_KEY);

          const priKeyPath = get_orderly_private_key_path();

          const pubKeyPath = get_orderly_public_key_path();

          tradingKeyMap.clear();
          localStorage.removeItem(priKeyPath);
          localStorage.removeItem(pubKeyPath);

          localStorage.removeItem(REF_ORDERLY_ACCOUNT_VALID);

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
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();
  const accountList = [
    {
      icon: <AccountIcon />,
      textId: 'your_assets',
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
        window.open(
          selector.store.getState().selectedWalletId === 'my-near-wallet'
            ? config.myNearWalletUrl
            : config.walletUrl,
          '_blank'
        );
      },
    },
  ];

  const [currentWalletName, setCurrentWalletName] = useState<string>();

  const [currentWalletIcon, setCurrentWalletIcon] = useState<string>();
  const signOut = async () => {
    const curWallet = await wallet.wallet();

    await curWallet.signOut();

    localStorage.removeItem(ACCOUNT_ID_KEY);

    window.location.assign('/');
  };

  useEffect(() => {
    wallet.wallet().then((res) => {
      setCurrentWalletName(res.metadata.name);
      setCurrentWalletIcon(res.metadata.iconUrl);
    });
  }, [accountId]);

  const [copyIconHover, setCopyIconHover] = useState<boolean>(false);

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
        <div className="mx-7 pt-4 flex justify-between items-start">
          <div className="text-white text-lg text-left flex-col flex">
            <span>{getAccountName(wallet.getAccountId())}</span>

            <span className="flex items-center ">
              <span className="mr-1">
                {!currentWalletIcon ? (
                  <div className="w-3 h-3"></div>
                ) : (
                  <img src={currentWalletIcon} className="w-3 h-3" alt="" />
                )}
              </span>
              <span className="text-xs text-primaryText">
                {currentWalletName || '-'}
              </span>
            </span>
          </div>

          <div className="flex items-center">
            <CopyToClipboard text={wallet.getAccountId()}>
              <div
                className={`bg-black bg-opacity-30  rounded-xl flex items-center justify-center p-1 cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onTouchStart={() => {
                  setCopyIconHover(true);
                }}
                onTouchEnd={() => {
                  setCopyIconHover(false);
                }}
              >
                <CopyIcon fillColor={copyIconHover ? '#4075FF' : '#7E8A93'} />
              </div>
            </CopyToClipboard>

            <button
              className="hover:text-gradientFrom text-primaryText w-6 h-6 flex items-center justify-center ml-2 p-0.5 rounded-xl bg-black bg-opacity-30"
              onClick={() => {
                window.open(
                  `https://${
                    getConfig().networkId === 'testnet' ? 'testnet.' : ''
                  }nearblocks.io/address/${wallet.getAccountId()}#transaction`
                );
              }}
            >
              <HiOutlineExternalLink size={18} />
            </button>
          </div>
        </div>

        <div className="flex mx-7 my-3 items-center text-xs justify-center">
          <button
            className="text-BTCColor mr-2 w-1/2 py-2.5 border rounded-lg hover:border-transparent hover:bg-BTCColor hover:bg-opacity-20 border-BTCColor border-opacity-30"
            onClick={() => {
              signOut();
            }}
          >
            <FormattedMessage id="disconnect" defaultMessage={'Disconnect'} />
          </button>

          <button
            className="text-gradientFrom ml-2 w-1/2 py-2.5 border rounded-lg hover:border-transparent hover:bg-gradientFrom hover:bg-opacity-20 border-gradientFrom border-opacity-30"
            onClick={async () => {
              modal.show();
            }}
          >
            <FormattedMessage id="change" defaultMessage={'Change'} />
          </button>
        </div>

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
                  {item.textId === 'your_assets' && hasBalanceOnRefAccount ? (
                    <FarmDot inFarm={hasBalanceOnRefAccount} />
                  ) : null}
                </label>

                {item.subIcon ? (
                  <label className="text-lg ml-2">{item.subIcon}</label>
                ) : null}
              </div>
              {hasBalanceOnRefAccount && item.textId === 'your_assets' ? (
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
  const [openChildMenu, setOpenChildMenu] = useState('');
  const [pathnameState, setPathnameState] = useState<boolean>(
    window.location.pathname !== '/account'
  );
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();
  const {
    setShowWalletSelector,
    showWalletSelector,
    hasBalanceOnRefAccount,
    hasAuroraBalance,
  } = props;
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const menusMobile = useMenusMobile();
  const [showTip, setShowTip] = useState<boolean>(false);
  const [showLanguage, setShowLanguage] = useState<boolean>(false);
  const [one_level_selected, set_one_level_selected] = useState<string>('');
  const [two_level_selected, set_two_level_selected] = useState<string>('');
  const displayLanguage = () => {
    const currentLocal = localStorage.getItem('local');
    if (commonLangKey.indexOf(currentLocal) > -1) {
      if (currentLocal == 'zh-CN') {
        return '中';
      } else {
        return currentLocal?.toUpperCase();
      }
    } else {
      return 'EN';
    }
  };
  useEffect(() => {
    const pathname = '/' + location.pathname.split('/')[1];
    let one_level_selected_id = '';
    let two_level_selected_id = '';
    if (menusMobile) {
      const one_level_menu = menusMobile.find((item: menuItemType) => {
        const { links } = item;
        return links?.indexOf(pathname) > -1;
      });
      if (one_level_menu) {
        const { id, children } = one_level_menu;
        one_level_selected_id = id;
        let second_children: any = children;
        if (second_children) {
          const two_level_menu = second_children.find((item: menuItemType) => {
            const { links, swap_mode } = item;
            if (pathname == '/') {
              const swap_mode_value = localStorage.getItem('SWAP_MODE_VALUE');
              return swap_mode_value == swap_mode;
            } else {
              return links?.indexOf(pathname) > -1;
            }
          });
          setOpenMenu(id);
          if (two_level_menu) {
            two_level_selected_id = two_level_menu.id;
          }
        }
      }
      set_one_level_selected(one_level_selected_id);
      set_two_level_selected(two_level_selected_id);
    }
  }, [menusMobile?.length]);
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
  const [accountVisible, setAccountVisible] = useState(false);
  const { pathname } = useLocation();
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

  function close() {
    setShow(false);
  }
  function handleMenuClick(linkInfo: menuItemType) {
    const { children, clickEvent, url, isExternal, id } = linkInfo;
    if (clickEvent) {
      clickEvent();
      set_one_level_selected(id);
    } else if (url) {
      if (isExternal) {
        window.open(url);
      } else {
        window.open(url, '_self');
      }
    }
    if (clickEvent || url) {
      close();
    } else if (children) {
      if (openMenu == id) {
        setOpenMenu('');
      } else {
        setOpenMenu(id);
        setOpenChildMenu('');
      }
    }
  }
  function handleChildMenuClick(
    linkInfo_parent: menuItemType,
    linkInfo: menuItemType
  ) {
    const { children, clickEvent, url, isExternal, id } = linkInfo;
    if (clickEvent) {
      clickEvent();
      set_one_level_selected(linkInfo_parent.id);
      set_two_level_selected(id);
    } else if (url) {
      if (isExternal) {
        window.open(url);
      } else {
        window.open(url, '_self');
      }
    }
    if (clickEvent || url) {
      close();
    } else if (children) {
      if (openChildMenu == id) {
        setOpenChildMenu('');
      } else {
        setOpenChildMenu(id);
      }
    }
  }
  function handleGrandsonMenuClick(linkInfo: menuItemType) {
    const { children, clickEvent, url, isExternal, id } = linkInfo;
    if (clickEvent) {
      clickEvent();
    } else if (url) {
      if (isExternal) {
        window.open(url);
      } else {
        window.open(url, '_self');
      }
    }
    if (clickEvent || url) {
      close();
    }
  }
  return (
    <>
      <div
        className={`${
          hasBalanceOnRefAccount && pathnameState ? 'block' : 'hidden'
        } text-xs py-1.5 px-2 lg:hidden text-center`}
        style={{
          backgroundColor: 'rgb(255, 201, 64)',
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
          <NavLogoSimple
            onClick={() => {
              window.open('https://www.ref.finance/');
            }}
          />
          <div className="flex items-center">
            <div
              className={`flex px-1 py-1 items-center justify-center rounded-lg border border-gray-700 hover:border-gradientFrom hover:bg-opacity-0 pl-3 pr-3 ${
                isSignedIn
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'border border-gradientFrom text-gradientFrom'
              }`}
            >
              <Near
                className={`${
                  isSignedIn ? 'text-white' : 'text-gradientFrom'
                } mr-1.5`}
              />
              <div className="overflow-ellipsis overflow-hidden text-sm whitespace-nowrap account-name relative">
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
                      <ArrowDownIcon className="transform rotate-180 ml-2" />
                    ) : (
                      <ArrowDownIcon className="ml-2" />
                    )}
                  </div>
                ) : (
                  <span
                    className="text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      modal.show();
                    }}
                  >
                    <FormattedMessage
                      id="connect_to_near"
                      defaultMessage="Connect to NEAR"
                    />
                  </span>
                )}
              </div>
            </div>
            <div className={!isSignedIn ? 'hidden' : ' flex items-center'}>
              <ConnectDot />
              <ConnectDot />
              <AuroraEntry
                hasBalanceOnAurora={hasAuroraBalance}
                extraClick={() => setAccountVisible(false)}
              />
            </div>
            <span className="ml-4" ref={iconRef} onClick={() => setShow(true)}>
              <HiMenuIcon />
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
            className="h-full w-4/6 float-right bg-cardBg shadow-4xl z-30 overflow-y-auto"
          >
            <div className={`${showLanguage ? 'hidden' : ''}`}>
              <div className="flex text-white items-center justify-between p-4">
                <div className="transform scale-90 origin-left">
                  <NavLogoSimple
                    onClick={() => {
                      window.open('https://www.ref.finance/');
                    }}
                  />
                </div>
                <div className="flex items-center">
                  <BuyNearButton />
                  <div className="flex items-center ml-2.5 bg-priceBgColor rounded-2xl p-1">
                    <RefIcon className="mr-1"></RefIcon>
                    <span className="text-white text-sm">
                      ${data && data !== '-' ? toPrecision(data, 2) : '-'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-primaryText gotham_bold pb-24">
                {menusMobile?.map((linkInfo: menuItemType) => {
                  const { id, label, children } = linkInfo;
                  // if (hidden) return null;
                  const isSelected = one_level_selected == id;
                  return (
                    <div key={id} className="my-2">
                      {/* one level menu */}
                      <div
                        className={`flex pl-4 pr-2 py-4 items-center text-base justify-between ${
                          isSelected
                            ? 'bg-one_level_menu_color text-white'
                            : 'text-primaryText'
                        }`}
                        onClick={() => handleMenuClick(linkInfo)}
                      >
                        {label}
                        {children && (
                          <span className="ml-1">
                            {openMenu == id ? (
                              <ArrowDownLargeIcon className="transform rotate-180 text-white"></ArrowDownLargeIcon>
                            ) : (
                              <ArrowDownLargeIcon
                                className={`${
                                  isSelected ? 'text-white' : 'text-primaryText'
                                }`}
                              ></ArrowDownLargeIcon>
                            )}
                          </span>
                        )}
                      </div>
                      {/* two level menu */}
                      {children && (
                        <div
                          className={`${openMenu === id ? 'block' : 'hidden'}`}
                        >
                          {children?.map((link: menuItemType) => {
                            const { id, label, logo, children } = link;
                            const isSubMenuSelected = two_level_selected == id;
                            return (
                              <div
                                className={`py-0.5 ${
                                  isSubMenuSelected
                                    ? 'bg-two_level_menu_color'
                                    : ''
                                }`}
                                key={id}
                              >
                                <div
                                  className={`flex justify-between text-left items-center pl-3 pr-2 py-3 ${
                                    isSubMenuSelected
                                      ? 'text-white'
                                      : 'text-primaryText'
                                  }`}
                                  onClick={() => {
                                    handleChildMenuClick(linkInfo, link);
                                  }}
                                >
                                  <div className="flex items-center whitespace-nowrap">
                                    {logo && (
                                      <span className="text-xl text-left w-8 flex justify-center mr-2">
                                        {logo}
                                      </span>
                                    )}
                                    {label}
                                  </div>

                                  {children && (
                                    <span className="ml-1">
                                      {openChildMenu === id ? (
                                        <ArrowDownLargeIcon className="transform rotate-180 text-white"></ArrowDownLargeIcon>
                                      ) : (
                                        <ArrowDownLargeIcon className="text-primaryText"></ArrowDownLargeIcon>
                                      )}
                                    </span>
                                  )}
                                </div>
                                {/* three level menu */}
                                {children ? (
                                  <div
                                    className={`${
                                      openChildMenu == id ? 'block' : 'hidden'
                                    }`}
                                  >
                                    {children.map((grandson: menuItemType) => {
                                      const {
                                        id,
                                        label,
                                        logo,
                                        url,
                                        isExternal,
                                      } = grandson;
                                      return (
                                        <div
                                          key={id}
                                          className={`flex items-center justify-between pl-12 pr-2 py-3 my-2 w-full`}
                                          onClick={() => {
                                            handleGrandsonMenuClick(grandson);
                                          }}
                                        >
                                          <div className="flex items-center">
                                            {logo && (
                                              <span className="text-xl mr-2">
                                                {logo}
                                              </span>
                                            )}
                                            {label}
                                          </div>
                                          {url && isExternal && <OutLinkIcon />}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="w-4/6 fixed bottom-7 right-0 flex items-center justify-between bg-cardBg px-4 py-3">
                <div className="flex items-center">
                  <div
                    className=" transform scale-75 origin-left"
                    onClick={() => window.open('https://stats.ref.finance/')}
                  >
                    <RefAnalyticsGary />
                  </div>
                </div>
                <div
                  onClick={() => {
                    setShowLanguage(true);
                  }}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '10px',
                  }}
                  className="flex items-center justify-center text-cardBg text-xs bg-primaryText"
                >
                  {displayLanguage()}
                </div>
              </div>
            </div>
            <div className={`${showLanguage ? '' : 'hidden'}`}>
              <MobileLanguage
                setShowLanguage={setShowLanguage}
              ></MobileLanguage>
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

function SauceMenu(props: any) {
  const { isSelected, label } = props;
  return (
    <div
      className={`flex items-end rounded-xl whitespace-nowrap text-xs cursor-pointer pl-1 py-0.5`}
    >
      <div className="flex items-center mr-1.5">
        <SauceIcon
          className={`${isSelected ? 'text-greenColor' : 'text-primaryText'}`}
        ></SauceIcon>
        <SauceText className="ml-2.5"></SauceText>
      </div>
      <span className="text-xs">{label}</span>
    </div>
  );
}
function MobileLanguage(props: any) {
  const context = useContext(Context);
  const lans = useLanguageItems();
  const currentLocal = formatItem(localStorage.getItem('local'));
  const switchLanuage = (language: string) => {
    context.selectLanguage(language);
  };
  return (
    <div>
      <div
        className="flex items-center pl-5 py-3.5"
        onClick={() => {
          props.setShowLanguage(false);
        }}
      >
        <ArrowLeftIcon className="mr-4"></ArrowLeftIcon>
        <span className="text-base text-white gotham_bold">
          <FormattedMessage id="language"></FormattedMessage>
        </span>
      </div>
      <div className="px-3.5">
        {lans.map(({ label, language, logo }, index) => {
          return (
            <div
              key={index}
              className={`rounded-xl whitespace-nowrap text-left items-center flex justify-start text-white text-sm  py-3 my-2 px-2 ${
                currentLocal === language
                  ? 'bg-menuMoreBgColor text-opacity-100'
                  : 'text-opacity-50'
              }`}
              onClick={() => {
                switchLanuage(language);
              }}
            >
              {logo && (
                <span
                  className={`text-xl w-8 text-left flex justify-center mr-2`}
                >
                  {logo}
                </span>
              )}
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
