import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Modal from 'react-modal';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import { NavLogoSimple, Near } from 'src/components/icon';
import {
  AccountIcon,
  ActivityIcon,
  WalletIcon,
} from 'src/components/icon/Common';
import { Context } from 'src/components/wrapper';
import getConfig from 'src/services/config';
import { useRefPrice } from 'src/state/account';
import { bridgeData, menuItemType, useMenusMobile } from 'src/utils/menu';
import { toPrecision } from 'src/utils/numbers';

import { WalletContext } from '../../utils/wallets-integration';
import { HiOutlineExternalLink, RiLogoutCircleRLine } from '../reactIcons';
const config = getConfig();
import CopyToClipboard from 'react-copy-to-clipboard';
import {
  ArrowDownIcon,
  ArrowDownLargeIcon,
  ArrowLeftIcon,
  HiMenuIcon,
  MoreIcon,
  OutLinkIcon,
  SauceIcon,
  SauceText,
} from 'src/components/icon/Nav';
import {
  RefAnalytics,
  RefAnalyticsGary,
} from 'src/components/icon/RefAnalytics';
import Marquee from 'src/components/layout/Marquee';
import { REF_FI_SWAP_SWAPPAGE_TAB_KEY } from 'src/constants';
import { isMobile } from 'src/utils/device';
import { useLanguageItems } from 'src/utils/menu';

import {
  ACCOUNT_ID_KEY,
  useWalletSelector,
} from '../../context/WalletSelectorContext';
import { REF_ORDERLY_ACCOUNT_VALID } from '../../pages/Orderly/components/UserBoard/index';
import {
  get_orderly_private_key_path,
  get_orderly_public_key_path,
  tradingKeyMap,
} from '../../pages/Orderly/orderly/utils';
import { SWAP_MODE, SWAP_MODE_KEY } from '../../pages/SwapPage';
import { openUrl } from '../../services/commonV3';
import { isNewHostName } from '../../services/config';
import {
  getAccountName,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { openTransak } from '../alert/Transak';
import { BuyNearButton } from '../button/Button';
import { ConnectDot, CopyIcon } from '../icon/CrossSwapIcons';
import { FarmDot } from '../icon/FarmStamp';
import { MailBoxIcon, RefIcon } from '../icon/Nav';
import { AccountTipDownByAccountID, AuroraEntry } from './NavigationBar';
import { commonLangKey, formatItem } from './NavigationBar';
import { CONST_ACKNOWLEDGE_WALLET_RISK } from 'src/constants/constLocalStorage';
import { WalletRiskCheckBoxModal } from 'src/context/modal-ui/components/WalletOptions/WalletRiskCheckBox';
import { KeyIcon } from '../../components/portfolio/icons';
import AccessKeyModal from '../../components/portfolio/AccessKeyModal';

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

          if (window.location.pathname === '/orderbook') {
            window.location.assign('/orderbook');
          } else {
            window.location.assign('/');
          }
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
  const [showTip, setShowTip] = useState<boolean>(false);
  const [copyButtonDisabled, setCopyButtonDisabled] = useState<boolean>(false);

  const { wallet } = getCurrentWallet();

  const { hasBalanceOnRefAccount, setAccountVisible, setKeyModalShow } = props;
  const { selector, modal, accounts, accountId, setAccountId } =
    useWalletSelector();
  const accountList = [
    {
      icon: <AccountIcon />,
      textId: 'your_assets',
      selected: location.pathname == '/overview',
      click: () => {
        history.push('/overview');
      },
    },
  ];

  const [currentWalletName, setCurrentWalletName] = useState<string>();

  const [currentWalletIcon, setCurrentWalletIcon] = useState<string>();
  const signOut = async () => {
    const curWallet = await wallet.wallet();

    await curWallet.signOut();

    localStorage.removeItem(ACCOUNT_ID_KEY);
    if (window.location.pathname === '/orderbook') {
      window.location.assign('/orderbook');
    } else {
      window.location.assign('/');
    }
  };

  useEffect(() => {
    wallet.wallet().then((res) => {
      setCurrentWalletName(res.metadata.name);
      setCurrentWalletIcon(res.metadata.iconUrl);
    });
  }, [accountId]);

  const [copyIconHover, setCopyIconHover] = useState<boolean>(false);

  const handleClick = (e: any) => {
    // this not working anymore
    // if (!accountWrapRef.current.contains(e.target)) {
    //   props.closeAccount();
    // }
  };
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.addEventListener('click', handleClick, false);
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('click', handleClick, false);
    };
  }, []);
  function showToast() {
    if (copyButtonDisabled) return;
    setCopyButtonDisabled(true);
    setShowTip(true);
    setTimeout(() => {
      setShowTip(false);
      setCopyButtonDisabled(false);
    }, 1000);
  }
  const isDisableChangeWallet = ['keypom', 'Keypom Account'].includes(
    currentWalletName
  );
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
          <div className="mb-accountId text-white text-lg text-left flex-col flex">
            <span>{getAccountName(wallet.getAccountId())}</span>

            <span className="flex items-center ">
              {currentWalletIcon && (
                <span className="mr-1">
                  <img src={currentWalletIcon} className="w-3 h-3" alt="" />
                </span>
              )}
              <span className="text-xs text-primaryText">
                {currentWalletName || '-'}
              </span>
            </span>
          </div>

          <div className="flex items-center">
            <div className="flex items-center justify-center relative">
              <CopyToClipboard text={wallet.getAccountId()} onCopy={showToast}>
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
              {showTip ? (
                <span className="text-xs text-white rounded-lg px-2.5 py-1.5 absolute bottom-8 bg-mobileOrderBg z-50">
                  Copied!
                </span>
              ) : null}
            </div>
            <button
              className="hover:text-gradientFrom text-primaryText w-6 h-6 flex items-center justify-center ml-2 p-0.5 rounded-xl bg-black bg-opacity-30"
              onClick={() => {
                openUrl(
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
            className={`mr-2 w-1/2 py-2.5 border rounded-lg border-opacity-30 ${
              isDisableChangeWallet
                ? 'border-gray-500 text-gray-500 cursor-default'
                : 'text-BTCColor hover:border-transparent hover:bg-opacity-20 hover:bg-BTCColor border-BTCColor'
            }`}
            disabled={isDisableChangeWallet}
            onClick={() => {
              signOut();
            }}
          >
            <FormattedMessage id="disconnect" defaultMessage={'Disconnect'} />
          </button>

          <button
            className={`ml-2 w-1/2 py-2.5 border rounded-lg border-opacity-30 ${
              isDisableChangeWallet
                ? 'border-gray-500 text-gray-500 cursor-default'
                : 'text-gradientFrom border-gradientFrom hover:border-transparent hover:bg-gradientFrom hover:bg-opacity-20'
            }`}
            onClick={async () => {
              modal.show();
            }}
            disabled={isDisableChangeWallet}
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

                {/* {item.subIcon ? (
                  <label className="text-lg ml-2">{item.subIcon}</label>
                ) : null} */}
              </div>
              <div
                onClick={() => {
                  setKeyModalShow(true);
                  setAccountVisible(false);
                }}
                className={`flex items-center text-base cursor-pointer font-semibold py-4 pl-20 hover:text-white hover:bg-navHighLightBg text-primaryText`}
              >
                <label className="w-9">
                  <KeyIcon />
                </label>
                <label className="cursor-pointer text-base">Approved Key</label>
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
  const menusMobile_temp = useMenusMobile(setShow);
  const [showTip, setShowTip] = useState<boolean>(false);
  const [showLanguage, setShowLanguage] = useState<boolean>(false);
  const [one_level_selected, set_one_level_selected] = useState<string>('');
  const [two_level_selected, set_two_level_selected] = useState<string>('');
  const [showWalletRisk, setShowWalletRisk] = useState<boolean>(false);
  const [keyModalShow, setKeyModalShow] = useState<boolean>(false);
  const handleWalletModalOpen = () => {
    const isAcknowledgeWalletRisk = localStorage.getItem(
      CONST_ACKNOWLEDGE_WALLET_RISK
    );
    if (!isAcknowledgeWalletRisk) {
      setShowWalletRisk(true);
    } else {
      modal.show();
    }
  };
  const handleAcknowledgeClick = (status) => {
    if (status === true) {
      setShowWalletRisk(false);
      localStorage.setItem(CONST_ACKNOWLEDGE_WALLET_RISK, '1');
      modal.show();
    }
  };

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
  const menusMobile = useMemo(() => {
    if (menusMobile_temp) {
      const menus_final = menusMobile_temp.filter((m: menuItemType) => {
        return !m.hidden;
      });
      return menus_final;
    }
  }, [menusMobile_temp]);
  useEffect(() => {
    const pathname = '/' + location.pathname.split('/')[1];
    let one_level_selected_id = '';
    let two_level_selected_id = '';
    const swap_mode_in_localstorage =
      localStorage.getItem('SWAP_MODE_VALUE') || 'normal';
    if (menusMobile) {
      const one_level_menu = menusMobile.find((item: menuItemType) => {
        const { links } = item;
        return links?.indexOf(pathname) > -1;
      });
      if (one_level_menu) {
        const { id, children } = one_level_menu;
        one_level_selected_id = id;
        const second_children: any = children;
        if (second_children) {
          const two_level_menu = second_children.find((item: menuItemType) => {
            const { links, swap_mode } = item;
            const condition = isNewHostName
              ? pathname == '/swap'
              : pathname == '/' || pathname == '/swap';
            if (condition) {
              return swap_mode_in_localstorage == swap_mode;
            } else {
              return links?.indexOf(pathname) > -1;
            }
          });
          setOpenMenu(id);
          if (two_level_menu) {
            two_level_selected_id = two_level_menu.id;
          }
        }
      } else {
        menusMobile.find((d) => {
          let match = d.links.includes(pathname);
          if (!match && Array.isArray(d.children)) {
            const level2Match = d.children.find((c) =>
              c.links?.includes(pathname)
            );
            if (level2Match) {
              two_level_selected_id = level2Match.id;
              one_level_selected_id = d.id;
              setOpenMenu(d.id);
            }
          }
          return match;
        });
      }
      set_one_level_selected(one_level_selected_id);
      set_two_level_selected(two_level_selected_id);
    }
  }, [menusMobile?.length, show]);
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
        openUrl(url);
      } else {
        openUrl(url);
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
        openUrl(url);
      } else {
        openUrl(url);
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
        openUrl(url);
      } else {
        openUrl(url);
      }
    }
    if (clickEvent || url) {
      close();
    }
  }

  const [showBridgeModalMobile, setShowBridgeModalMobile] =
    useState<boolean>(false);
  function closeKeyModal() {
    setKeyModalShow(false);
  }
  function showkeyModal() {
    setKeyModalShow(true);
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
          onClick={() => openUrl('/account?tab=ref')}
        >
          <FormattedMessage id="click" defaultMessage="Click" />
        </span>
        <FormattedMessage id="to_recover" defaultMessage="to recover." />
      </div>
      <div
        className="nav-wrap lg:hidden md:show relative xs:mb-6 md:mb-6"
        style={{
          zIndex: show ? 200 : 91,
        }}
      >
        {showTip ? <AccountTipDownByAccountID show={showTip} /> : null}
        <div className="flex items-center text-2xl text-white justify-between p-4">
          <NavLogoSimple
            onClick={() => {
              openUrl('https://www.ref.finance/');
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
                    <span>{getAccountName(wallet.getAccountId())}</span>

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
                      //modal.show();
                      handleWalletModalOpen();
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
            {/*<div className={!isSignedIn ? 'hidden' : ' flex items-center'}>*/}
            {/*  <ConnectDot />*/}
            {/*  <ConnectDot />*/}
            {/*  <AuroraEntry*/}
            {/*    hasBalanceOnAurora={hasAuroraBalance}*/}
            {/*    extraClick={() => setAccountVisible(false)}*/}
            {/*  />*/}
            {/*</div>*/}
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
            zIndex: '300',
          }}
        >
          <div
            ref={popupRef}
            className="h-full w-4/6 float-right bg-cardBg shadow-4xl z-30 overflow-y-auto"
          >
            <div className={`${showLanguage ? 'hidden' : ''}`}>
              <div className="flex text-white items-center justify-between p-4 border-b border-menuBorderColor">
                <div className="flex items-center  bg-priceBgColor rounded-2xl p-1">
                  <RefIcon className="mr-1"></RefIcon>
                  <span className="text-white text-sm">
                    ${data && data !== '-' ? toPrecision(data, 2) : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BuyNearButton />

                  <div
                    className={`frcc text-xs     rounded-lg py-1.5 px-3
                  
                  ${
                    showBridgeModalMobile
                      ? 'text-white  bg-priceBgColor'
                      : 'text-cardBg bg-primaryText font-gothamBold'
                  }
                  `}
                    onClick={() => {
                      setShowBridgeModalMobile(true);
                    }}
                  >
                    <FormattedMessage
                      id="bridge_pure"
                      defaultMessage={'Bridge'}
                    ></FormattedMessage>
                  </div>
                </div>
              </div>
              <div className="text-primaryText gotham_bold pb-24">
                {menusMobile?.map((linkInfo: menuItemType) => {
                  const { id, label, children } = linkInfo;
                  const isSelected = one_level_selected == id;
                  return (
                    <div key={id} className="border-b border-menuBorderColor">
                      {/* one level menu */}
                      <div
                        className={`flex px-4 py-3.5 items-center text-base justify-between ${
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
                            const { id, label, logo, children, renderLogo } =
                              link;
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
                                  className={`flex justify-between text-left items-center pl-3 pr-4 py-3 ${
                                    isSubMenuSelected
                                      ? 'text-white'
                                      : 'text-primaryText'
                                  }`}
                                  onClick={() => {
                                    handleChildMenuClick(linkInfo, link);
                                  }}
                                >
                                  <div className="flex items-center whitespace-nowrap">
                                    {(renderLogo || logo) && (
                                      <span className="text-xl text-left w-8 flex justify-center mr-2">
                                        {renderLogo
                                          ? renderLogo({
                                              activeMenu: isSubMenuSelected,
                                            })
                                          : logo}
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
                                          className={`flex items-center justify-between pl-12 pr-4 py-3 my-2 w-full`}
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
                    className=" transform scale-75 origin-left -mr-9"
                    onClick={() => openUrl('https://stats.ref.finance/')}
                  >
                    <RefAnalyticsGary />
                  </div>
                </div>
                <div
                  onClick={() =>
                    window.open('https://guide.ref.finance/developers/audits')
                  }
                  className="text-primaryText text-xs cursor-pointer underline md:flex-auto md:ml-3"
                >
                  Security
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
            setAccountVisible={setAccountVisible}
            setKeyModalShow={setKeyModalShow}
            closeAccount={() => {
              setAccountVisible(false);
            }}
          />
        ) : null}
      </div>
      {/* {isMobile ? <Marquee></Marquee> : null} */}
      <WalletRiskCheckBoxModal
        isOpen={showWalletRisk}
        setCheckedStatus={handleAcknowledgeClick}
        onClose={() => setShowWalletRisk(false)}
      />

      <MobileBridgeModal
        isOpen={showBridgeModalMobile}
        onRequestClose={() => {
          setShowBridgeModalMobile(false);
        }}
      ></MobileBridgeModal>
      {accountId && keyModalShow ? (
        <AccessKeyModal isOpen={keyModalShow} onRequestClose={closeKeyModal} />
      ) : null}
    </>
  );
}

function MobileBridgeModal(props: Modal.Props) {
  const { accountId } = useWalletSelector();
  return (
    <Modal
      {...props}
      style={{
        overlay: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999999,
          outline: 'none',
        },
        content: {
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bottom: 0,
          left: '50%',
          top: 'none',
          transform: 'translate(-50%, 0)',
          outline: 'none',
          width: '100%',
        },
      }}
    >
      <div
        className="border rounded-2xl w-full pb-10 bg-cardBg p-2 text-base flex flex-col gap-4 text-white"
        style={{
          border: '1px solid #27343E',
        }}
      >
        <div className="pl-4">
          <FormattedMessage
            id="bridge_pure"
            defaultMessage={'Bridge'}
          ></FormattedMessage>
        </div>
        {bridgeData.map((item) => {
          if (!item.children) {
            return (
              <div
                key={item.id}
                className="flex flex-col gap-2 pl-1 text-white cursor-pointer frcs hover:bg-opacity-20 hover:rounded-xl"
                onClick={() => {
                  let targetUrl = item.link;
                  if (item.needAccountId && accountId) {
                    targetUrl = `${targetUrl}&address=${accountId}`;
                  }
                  openUrl(targetUrl);
                }}
              >
                <div className="frcs gap-2 pl-3">
                  <item.icon></item.icon>
                  {item.name}
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={item.id}
                className="flex flex-col gap-2 pl-1 text-primaryText "
              >
                <div className="frcs gap-2 pl-3">
                  <item.icon></item.icon>

                  {item.name}
                </div>

                {item.children.map((sub) => {
                  return (
                    <div
                      key={sub.id}
                      className="rounded-xl  py-1.5 pl-1 text-white bg-primaryText bg-opacity-20 cursor-pointer frcs"
                      onClick={() => {
                        openUrl(sub.link);
                      }}
                    >
                      <div className="frcs pl-3 gap-2">
                        <sub.icon></sub.icon>
                        {sub.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }
        })}
      </div>
    </Modal>
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
