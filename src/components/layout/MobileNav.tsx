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
  WrapNearEnter,
} from '~components/icon';
import { Link, useLocation } from 'react-router-dom';
import { wallet } from '~services/near';
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
      </div>
    </div>
  );
}

export function Logout() {
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

export function MobileNavBar() {
  const [show, setShow] = useState(false);
  const intl = useIntl();
  const { data } = useRefPrice();
  const iconRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [account, network] = wallet.getAccountId().split('.');
  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;
  const [openMenu, setOpenMenu] = useState('');
  const [closeMenu, setCloseMenu] = useState(false);
  const history = useHistory();
  const [mobileWrapNear, setMobileWrapNear] = useState(false);
  const allTokens = useWhitelistTokens();

  const accountName =
    account.length > 10 ? niceAccountId : wallet.getAccountId();
  const nearBalance = wallet.isSignedIn()
    ? useDepositableBalance(nearMetadata.id, nearMetadata.decimals)
    : '0';

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

  if (wallet.isSignedIn()) {
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
                <div>{accountName}</div>
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
          className="block h-full overflow-y-scroll w-4/6 float-right pt-6 bg-cardBg shadow-4xl"
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
                  <div>{accountName}</div>
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

          <div className="p-4 flex text-white items-center justify-start">
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
            {wallet.isSignedIn() && (
              <div className="text-primaryText" onClick={() => setShow(false)}>
                <div
                  className="flex p-4 justify-between"
                  onClick={() => setMobileWrapNear(true)}
                >
                  <span className=" text-lg">
                    <FormattedMessage
                      id="wrapnear"
                      defaultMessage="Wrap NEAR"
                    />
                  </span>
                  <div className=" py-1 px-2 border border-framBorder text-framBorder hover:text-white hover:bg-framBorder hover:border-0 cursor-pointer rounded h-6 items-center flex">
                    <WrapNearEnter></WrapNearEnter>
                    <span className=" ml-2 text-xs">
                      {toPrecision(nearBalance, 3, true)}
                    </span>
                  </div>
                </div>
                <WrapNear
                  isOpen={mobileWrapNear}
                  onRequestClose={() => setMobileWrapNear(false)}
                  allTokens={allTokens}
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
              ({ id, label, subRoute, pattern, url, isExternal, children }) => {
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
                      <div className={`link `}>
                        <FormattedMessage id={id} defaultMessage={label} />
                      </div>
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
                              className={`whitespace-nowrap text-left items-center p-4 flex justify-start ${
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
                                <span className="text-xl text-left w-9">
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
          <Logout />
          <div
            className="p-4 bg-cardBg mb-24"
            onClick={() => window.open('https://sodaki.com/')}
          >
            <RefAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
}
