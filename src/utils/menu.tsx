import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import {
  AuroraIconSwapNav,
  BorrowIcon,
  BridgeIcon,
  EsIcon,
  FarmsIcon,
  IconAirDrop,
  IconAurora,
  IconBridge,
  IconCelo,
  IconCommunity,
  IconCreateNew,
  IconDocs,
  IconEn,
  IconEthereum,
  IconForum,
  IconLanguage,
  IconPools,
  IconRainbow,
  IconRisk,
  IconSolana,
  IconTerra,
  IconVi,
  IconZh,
  InquiriesIcon,
  JaIcon,
  KoIcon,
  LimitOrderIcon,
  MobileBridgeIcon,
  MobilePoolsIcon,
  MobileYourLiqudityIcon,
  OrderBookIcon,
  OrderlyIcon,
  OverviewIcon,
  PoolsIcon,
  PortfolioIcon,
  PurpleCircleIcon,
  REFSmallIcon,
  RisksIcon,
  RuIcon,
  SwapIcon,
  UkIcon,
  WrapNearIcon,
  XrefEarnIcon,
  XrefIcon,
  XswapIcon,
  YourliquidityIcon,
} from 'src/components/icon/Nav';
import { openUrl } from 'src/services/commonV3';

import {
  Allbridge,
  Aurora,
  BridgeIconMenu,
  Celo,
  ElectronLabs,
  Ethereum,
  Rainbow,
  Solana,
  Terra,
  WalletCedeBridge,
} from '../components/icon/Menu';
import { IconMyLiquidity, MobileNavLimitOrder } from '../components/icon/Nav';
import {
  MobileNavStable,
  MobileNavSwap,
  MobileNavSwapPro,
} from '../components/icon/Nav';
import { HiOutlineExternalLink } from '../components/reactIcons';
import { SWAP_TYPE_KEY } from '../pages/SwapPage';
// import { XrefIcon } from 'src/components/icon/Xref';
import getConfig from '../services/config';
import { isNewHostName } from '../services/config';
import { getCurrentWallet } from '../utils/wallets-integration';

export type MenuItem = {
  id: number;
  label: string;
  url: string;
  icon?: ReactNode;
  isExternal: boolean;
  children?: MenuItem[];
  logo?: ReactNode;
  language?: string;
};
export const useMenuItems = () => {
  const intl = useIntl();

  const menuData: any[] = [
    // {
    //   label: intl.formatMessage({ id: 'stable_pool' }),
    //   specialMenuKey: 'sauce',
    //   url: '/sauce',
    // },
    {
      label: intl.formatMessage({ id: 'bridge' }),
      url: '',
      isExternal: false,
      logo: <BridgeIcon />,
      children: [
        {
          label: intl.formatMessage({ id: 'from_ethereum' }),
          url: 'https://rainbowbridge.app/transfer',
          isExternal: true,
          icon: <HiOutlineExternalLink />,
          id: '2-1',
          logo: <IconEthereum />,
        },
        {
          label: intl.formatMessage({ id: 'from_aurora' }),
          url: 'https://rainbowbridge.app/transfer',
          isExternal: true,
          icon: <HiOutlineExternalLink />,
          id: '2-2',
          logo: <IconAurora />,
        },
        {
          label: intl.formatMessage({ id: 'from_solana' }),
          url: 'https://app.allbridge.io/bridge?from=SOL&to=NEAR',
          isExternal: true,
          icon: <HiOutlineExternalLink />,
          id: '2-3',
          logo: <IconSolana />,
        },
        {
          label: intl.formatMessage({ id: 'from_terra' }),
          url: 'https://app.allbridge.io/bridge?from=TRA&to=NEAR',
          isExternal: true,
          icon: <HiOutlineExternalLink />,
          id: '2-4',
          logo: <IconTerra />,
        },
        {
          label: intl.formatMessage({ id: 'from_celo' }),
          url: 'https://app.allbridge.io/bridge?from=CELO&to=NEAR',
          isExternal: true,
          icon: <HiOutlineExternalLink />,
          id: '2-5',
          logo: <IconCelo />,
        },
      ],
    },
    {
      label: intl.formatMessage({ id: 'docs' }),
      url: 'https://guide.ref.finance',
      // icon: <HiOutlineExternalLink />,
      isExternal: true,
      logo: <IconDocs />,
    },
    {
      label: intl.formatMessage({ id: 'risks' }),
      url: '/risks',
      isExternal: false,
      logo: <RisksIcon />,
    },
    // {
    //   label: <FormattedMessage id="airdrop" defaultMessage="Airdrop" />,
    //   url: '/airdrop',
    //   isExternal: false,
    //   logo: <IconAirDrop />,
    // },
    // {
    //   label: 'Business Inquiries',
    //   url: 'https://form.typeform.com/to/onOPhJ6Y',
    //   isExternal: true,
    //   logo: <InquiriesIcon />,
    // },
  ];
  return { menuData };
};

export const useLanguageItems = () => {
  const lan = [
    {
      label: 'English',
      language: 'en',
      logo: <IconEn />,
    },
    {
      label: '中文',
      language: 'zh-CN',
      logo: <IconZh />,
    },
    {
      label: 'Việt',
      language: 'vi',
      logo: <IconVi />,
    },

    {
      label: '한국어',
      language: 'ko',
      logo: <KoIcon />,
    },
    {
      label: 'Español',
      language: 'es',
      logo: <EsIcon />,
    },
  ];
  return lan;
};

export type MobileMenuItem = {
  id: string;
  label?: string;
  url: string;
  icon?: ReactNode;
  isExternal?: boolean;
  children?: MobileMenuItem[];
  logo?: ReactNode;
  pattern?: string;
  tip?: string;
  subRoute?: string[];
  showIcon?: boolean;
  iconElement?: ReactNode;
  hidden?: boolean;
  idElement?: JSX.Element | string;
  subMenuDefaultChosen?: boolean;
  specialMenuKey?: string;
  defaultClick?: (e?: any) => void;
};
export const useMenus = (cb?: () => void) => {
  const history = useHistory();
  const intl = useIntl();

  const location = useLocation();

  const pathName = location.pathname;

  const menuData = [
    {
      id: '1',
      label: (
        <>
          <FormattedMessage id="trade" />
        </>
      ),
      links: ['/', '/spot', '/orderbook', '/myOrder', '/swap'],
      children: [
        {
          id: '1-1',
          label: <>Swap</>,
          logo: <SwapIcon />,
          url: '/',
          isExternal: false,
          swap_mode: 'normal',
          clickEvent: () => {
            sessionStorage.setItem(SWAP_TYPE_KEY, 'Lite');
            localStorage.setItem('SWAP_MODE_VALUE', 'normal');
            if (isNewHostName) {
              history.push('/swap');
            } else {
              history.push('/');
            }
          },
          links: isNewHostName ? ['/swap'] : ['/', '/swap'],
        },
        {
          id: '1-2',
          label: (
            <>
              <FormattedMessage id="limit_order" />
            </>
          ),
          logo: <LimitOrderIcon />,
          url: '/',
          isExternal: false,
          swap_mode: 'limit',
          clickEvent: () => {
            sessionStorage.setItem(SWAP_TYPE_KEY, 'Pro');
            if (isNewHostName) {
              history.push('/swap');
            } else {
              history.push('/');
            }
            localStorage.setItem('SWAP_MODE_VALUE', 'limit');
          },
          links: isNewHostName ? ['/swap'] : ['/', '/myOrder', '/swap'],
        },
        {
          id: '1-3',
          hoverLabel: (
            <div className="w-full">
              <div className="frcs gap-6 mb-2">
                <OrderBookIcon />
                <FormattedMessage id="orderbook_mobile"></FormattedMessage>
              </div>

              <div className="w-full frcs gap-3 text-white text-base ">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    cb && cb();

                    history.push('/orderbook/spot');
                  }}
                  style={{
                    width: '120px',
                  }}
                  className={`frcc  hover:bg-v3SwapGray  border-v3SwapGray border-opacity-10 hover:bg-opacity-10 w-1/2 rounded-xl py-2 ${
                    (
                      isNewHostName
                        ? pathName.includes('/spot')
                        : pathName.startsWith('/orderbook/spot')
                    )
                      ? ' bg-hoverSubBridge bg-opacity-50'
                      : 'border'
                  }`}
                >
                  {/* <FormattedMessage
                    id="spot"
                    defaultMessage={'Spot'}
                  ></FormattedMessage> */}
                  Spot
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    cb && cb();

                    history.push('/orderbook/perps');
                  }}
                  style={{
                    width: '120px',
                  }}
                  className={`frcc  hover:bg-v3SwapGray hover:bg-opacity-10  border-v3SwapGray border-opacity-10 w-1/2 rounded-xl py-2  ${
                    (
                      isNewHostName
                        ? pathName === '/' ||
                          pathName.startsWith('/orderbook/perps')
                        : pathName.startsWith('/orderbook/perps')
                    )
                      ? ' bg-hoverSubBridge bg-opacity-50'
                      : 'border'
                  }`}
                >
                  {/* <FormattedMessage
                    id="perpetual"
                    defaultMessage={'Perpetual'}
                  ></FormattedMessage> */}
                  Perpetual
                </button>
              </div>
            </div>
          ),

          label: (
            <div className="frcs gap-6 mb-2">
              <OrderBookIcon />
              <FormattedMessage id="orderbook_mobile"></FormattedMessage>
            </div>
          ),

          isExternal: false,
        },
      ],
    },
    {
      id: '2',
      label: (
        <>
          <FormattedMessage id="earn_2" />
        </>
      ),
      links: [
        '/pools',
        '/pool',
        '/poolV2',
        '/sauce',
        '/more_pools',
        // '/yourliquidity',
        '/farms',
        '/xref',
        '/v2farms',
        '/yoursLiquidityDetailV2',
      ],
      children: [
        {
          id: '2-1',
          label: (
            <>
              <FormattedMessage id="liquidity_pools_2" />
            </>
          ),
          logo: <PoolsIcon />,
          url: '/pools',
          isExternal: false,
          links: [
            '/pools',
            '/pool',
            '/poolV2',
            '/sauce',
            '/more_pools',
            '/yourliquidity',
          ],
        },
        // {
        //   id: '2-2',
        //   label: (
        //     <>
        //       <FormattedMessage id="your_liquidity" />
        //     </>
        //   ),
        //   logo: <YourliquidityIcon />,
        //   url: '/yourliquidity',
        //   isExternal: false,
        //   clickEvent: () => {
        //     sessionStorage.setItem('REF_POOL_NAV_TAB_VALUE', '/yourliquidity');
        //     history.push('/yourliquidity');
        //   },
        //   links: ['/yourliquidity', '/yoursLiquidityDetailV2'],
        // },
        {
          id: '2-3',
          label: (
            <>
              <FormattedMessage id="farms" />
            </>
          ),
          logo: <FarmsIcon />,
          url: '/v2farms',
          isExternal: false,
          links: ['/v2farms', '/farms'],
        },
        {
          id: '2-4',
          label: (
            <>
              <XrefIcon />
            </>
          ),
          logo: <XrefEarnIcon />,
          url: '/xref',
          isExternal: false,
          links: ['/xref'],
        },
      ],
    },
    {
      id: '3',
      label: (
        <>
          <FormattedMessage id="portfolio" />
        </>
      ),
      url: '',
      isExternal: false,
      links: ['/portfolio', '/overview', '/orderly'],
      children: [
        {
          id: '3-1',
          label: (
            <>
              <FormattedMessage id="Overview" />
            </>
          ),
          logo: <OverviewIcon />,
          url: '/overview',
          isExternal: false,
          links: ['/overview'],
        },
        {
          id: '3-2',
          label: (
            <>
              <FormattedMessage id="RefFinance" />
            </>
          ),
          logo: <PortfolioIcon />,
          url: '/portfolio',
          isExternal: false,
          links: ['/portfolio'],
        },
        {
          id: '3-3',
          label: (
            <>
              <FormattedMessage id="Orderly" />
            </>
          ),
          renderLogo: ({ activeMenu }: { activeMenu: boolean }) => (
            <OrderlyIcon activeMenu={activeMenu} />
          ),
          url: '/orderly',
          isExternal: false,
          links: ['/orderly'],
        },
      ],
    },
    {
      id: '4',
      label: <>Meme Season</>,
      url: '/meme',
      isExternal: false,
      links: ['/meme', '/airdop'],
    },
    {
      id: '6',
      label: (
        <>
          <FormattedMessage id="vote" />
        </>
      ),
      url: '/referendum',
      isExternal: false,
      hidden: !getConfig().REF_VE_CONTRACT_ID,
      links: ['/referendum'],
    },
    {
      id: '5',
      label: (
        <>
          <FormattedMessage id="more_2" />
        </>
      ),
      links: ['/risks', '/airdrop'],
      children: [
        // {
        //   id: '5-1',
        //   label: <>{intl.formatMessage({ id: 'bridge' })}</>,
        //   logo: <BridgeIcon />,
        //   children: [
        //     {
        //       label: <>{intl.formatMessage({ id: 'from_ethereum' })}</>,
        //       url: 'https://rainbowbridge.app/transfer',
        //       isExternal: true,
        //       icon: <HiOutlineExternalLink />,
        //       id: '5-1-1',
        //       logo: <IconEthereum />,
        //     },
        //     {
        //       label: <>{intl.formatMessage({ id: 'from_aurora' })}</>,
        //       url: 'https://rainbowbridge.app/transfer',
        //       isExternal: true,
        //       icon: <HiOutlineExternalLink />,
        //       id: '5-1-2',
        //       logo: <IconAurora />,
        //     },
        //     {
        //       label: <>{intl.formatMessage({ id: 'from_solana' })}</>,
        //       url: 'https://app.allbridge.io/bridge?from=SOL&to=NEAR',
        //       isExternal: true,
        //       icon: <HiOutlineExternalLink />,
        //       id: '5-1-3',
        //       logo: <IconSolana />,
        //     },
        //     {
        //       label: <>{intl.formatMessage({ id: 'from_terra' })}</>,
        //       url: 'https://app.allbridge.io/bridge?from=TRA&to=NEAR',
        //       isExternal: true,
        //       icon: <HiOutlineExternalLink />,
        //       id: '5-1-4',
        //       logo: <IconTerra />,
        //     },
        //     {
        //       label: <>{intl.formatMessage({ id: 'from_celo' })}</>,
        //       url: 'https://app.allbridge.io/bridge?from=CELO&to=NEAR',
        //       isExternal: true,
        //       icon: <HiOutlineExternalLink />,
        //       id: '5-1-5',
        //       logo: <IconCelo />,
        //     },
        //   ],
        // },
        {
          id: '5-2',
          label: <>{intl.formatMessage({ id: 'docs' })}</>,
          url: 'https://guide.ref.finance',
          isExternal: true,
          logo: <IconDocs />,
        },
        {
          id: '5-3',
          label: <>{intl.formatMessage({ id: 'risks' })}</>,
          url: '/risks',
          isExternal: false,
          logo: <RisksIcon />,
          links: ['/risks'],
        },
        // {
        //   id: '5-4',
        //   label: (
        //     <>{<FormattedMessage id="airdrop" defaultMessage="Airdrop" />}</>
        //   ),
        //   url: '/airdrop',
        //   isExternal: false,
        //   logo: <IconAirDrop />,
        //   links: ['/airdrop'],
        // },
        // {
        //   id: '5-5',
        //   label: (
        //     <>
        //       <FormattedMessage id="business_inquiries" />
        //     </>
        //   ),
        //   url: 'https://form.typeform.com/to/onOPhJ6Y',
        //   isExternal: true,
        //   logo: <InquiriesIcon />,
        // },
      ],
    },
  ];
  return menuData;
};
export const useMenusMobile = (setShow: (show: boolean) => void) => {
  const history = useHistory();
  const intl = useIntl();
  const menuData = [
    {
      id: '1',
      label: (
        <>
          <FormattedMessage id="trade" />
        </>
      ),
      links: ['/', '/spot', '/orderbook', '/myOrder', '/swap'],
      children: [
        {
          id: '1-1',
          label: <>Swap</>,
          logo: <SwapIcon />,
          url: '/',
          isExternal: false,
          swap_mode: 'normal',
          clickEvent: () => {
            if (isNewHostName) {
              history.push('/swap');
            } else {
              history.push('/');
            }

            sessionStorage.setItem(SWAP_TYPE_KEY, 'Lite');
            localStorage.setItem('SWAP_MODE_VALUE', 'normal');
          },
          links: isNewHostName ? ['/swap'] : ['/', '/swap'],
        },

        {
          id: '1-2',
          label: (
            <>
              <FormattedMessage id="limit_order" />
            </>
          ),
          logo: <LimitOrderIcon />,
          url: '/',
          isExternal: false,
          swap_mode: 'limit',
          clickEvent: () => {
            if (isNewHostName) {
              history.push('/swap');
            } else {
              history.push('/');
            }
            localStorage.setItem('SWAP_MODE_VALUE', 'limit');
            sessionStorage.setItem(SWAP_TYPE_KEY, 'Pro');
          },
          links: isNewHostName ? ['/swap'] : ['/', '/myOrder', '/swap'],
        },
        {
          id: '1-3',
          label: (
            <div className="w-full pl-2">
              <div className="frcs gap-4 mb-2">
                <OrderBookIcon />
                <FormattedMessage id="orderbook_mobile"></FormattedMessage>
              </div>

              <div
                className={`w-full font-gotham frcs border ${
                  window.location.pathname === '/orderbook/spot' ||
                  window.location.pathname === '/orderbook/perps' ||
                  (isNewHostName
                    ? window.location.pathname === '/spot' ||
                      window.location.pathname === '/'
                    : '')
                    ? 'bg-cardBg'
                    : ''
                } border-v3SwapGray border-opacity-30 gap-3 text-primaryText text-base rounded-xl p-1`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    history.push('/orderbook/spot');
                    setShow(false);
                  }}
                  className={`frcc bg-symbolHover2 ${
                    window.location.pathname === '/orderbook/spot' ||
                    (isNewHostName ? window.location.pathname === '/spot' : '')
                      ? 'text-white'
                      : ''
                  }    w-1/2 rounded-lg py-1`}
                  style={{
                    background:
                      window.location.pathname === '/orderbook/spot' ||
                      (isNewHostName
                        ? window.location.pathname === '/spot'
                        : '')
                        ? '#324451'
                        : '',
                    width: '95px',
                  }}
                >
                  Spot
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    history.push('/orderbook/perps');
                    setShow(false);
                  }}
                  style={{
                    background:
                      window.location.pathname === '/orderbook/perps' ||
                      (isNewHostName ? window.location.pathname === '/' : '')
                        ? '#324451'
                        : '',
                    width: '95px',
                  }}
                  className={`frcc bg-symbolHover2 ${
                    window.location.pathname === '/orderbook/perps' ||
                    (isNewHostName ? window.location.pathname === '/' : '')
                      ? 'text-white'
                      : ''
                  }   w-1/2 rounded-lg py-1`}
                >
                  Perpetual
                </button>
              </div>
            </div>
          ),

          isExternal: false,
          links: ['/', '/spot', '/orderbook'],
        },
      ],
    },
    {
      id: '2',
      label: (
        <>
          <FormattedMessage id="earn_2" />
        </>
      ),
      links: [
        '/pools',
        '/pool',
        '/poolV2',
        '/sauce',
        '/more_pools',
        // '/yourliquidity',
        '/farms',
        '/xref',
        '/v2farms',
        '/yoursLiquidityDetailV2',
      ],
      children: [
        {
          id: '2-1',
          label: (
            <>
              <FormattedMessage id="liquidity_pools_2" />
            </>
          ),
          logo: <PoolsIcon />,
          url: '/pools',
          isExternal: false,
          links: [
            '/pools',
            '/pool',
            '/poolV2',
            '/sauce',
            '/more_pools',
            '/yourliquidity',
          ],
        },
        // {
        //   id: '2-2',
        //   label: (
        //     <>
        //       <FormattedMessage id="your_liquidity" />
        //     </>
        //   ),
        //   logo: <YourliquidityIcon />,
        //   url: '/yourliquidity',
        //   isExternal: false,
        //   clickEvent: () => {
        //     sessionStorage.setItem('REF_POOL_NAV_TAB_VALUE', '/yourliquidity');
        //     history.push('/yourliquidity');
        //   },
        //   links: ['/yourliquidity', '/yoursLiquidityDetailV2'],
        // },
        {
          id: '2-3',
          label: (
            <>
              <FormattedMessage id="farms" />
            </>
          ),
          logo: <FarmsIcon />,
          url: '/v2farms',
          isExternal: false,
          links: ['/v2farms', '/farms'],
        },
        {
          id: '2-4',
          label: (
            <>
              <XrefIcon />
            </>
          ),
          logo: <XrefEarnIcon />,
          url: '/xref',
          isExternal: false,
          links: ['/xref'],
        },
      ],
    },
    {
      id: '3',
      label: (
        <>
          <FormattedMessage id="portfolio" />
        </>
      ),
      url: '',
      isExternal: false,
      links: ['/portfolio', '/overview', '/orderly'],
      children: [
        {
          id: '3-1',
          label: <FormattedMessage id="Overview" />,
          logo: <OverviewIcon />,
          url: '/overview',
          isExternal: false,
          links: ['/overview'],
        },
        {
          id: '3-2',
          label: <FormattedMessage id="RefFinance" />,
          logo: <PortfolioIcon />,
          url: '/portfolio',
          isExternal: false,
          links: ['/portfolio'],
        },
        {
          id: '3-3',
          label: <FormattedMessage id="Orderly" />,
          renderLogo: ({ activeMenu }: { activeMenu: boolean }) => (
            <OrderlyIcon activeMenu={activeMenu} />
          ),
          url: '/orderly',
          isExternal: false,
          links: ['/orderly'],
        },
      ],
    },
    {
      id: '9',
      label: <>Meme Season</>,
      url: '/meme',
      isExternal: false,
      links: ['/meme', '/airdop'],
    },
    {
      id: '6',
      label: (
        <>
          <FormattedMessage id="vote" />
        </>
      ),
      url: '/referendum',
      isExternal: false,
      hidden: !getConfig().REF_VE_CONTRACT_ID,
      links: ['/referendum'],
    },
    {
      id: '5',
      label: (
        <>
          <FormattedMessage id="more_2" />
        </>
      ),
      links: ['/risks', '/airdrop'],
      children: [
        {
          id: '5-2',
          label: <>{intl.formatMessage({ id: 'docs' })}</>,
          url: 'https://guide.ref.finance',
          isExternal: true,
          logo: <IconDocs />,
        },
        {
          id: '5-3',
          label: <>{intl.formatMessage({ id: 'risks' })}</>,
          url: '/risks',
          isExternal: false,
          logo: <RisksIcon />,
          links: ['/risks'],
        },
        // {
        //   id: '5-4',
        //   label: (
        //     <>{<FormattedMessage id="airdrop" defaultMessage="Airdrop" />}</>
        //   ),
        //   url: '/airdrop',
        //   isExternal: false,
        //   logo: <IconAirDrop />,
        //   links: ['/airdrop'],
        // },
        // {
        //   id: '5-5',
        //   label: (
        //     <>
        //       <FormattedMessage id="business_inquiries" />
        //     </>
        //   ),
        //   url: 'https://form.typeform.com/to/onOPhJ6Y',
        //   isExternal: true,
        //   logo: <InquiriesIcon />,
        // },
      ],
    },
  ];
  return menuData;
};

export const bridgeData: any[] = [
  // {
  //   name: (
  //     <FormattedMessage
  //       id="rainbow"
  //       defaultMessage={'Rainbow'}
  //     ></FormattedMessage>
  //   ),
  //   icon: Rainbow,
  //   id: '0',
  //   label: 'rainbow',

  //   children: [
  //     {
  //       name: <FormattedMessage id="from_ethereum"></FormattedMessage>,
  //       icon: Ethereum,
  //       link: 'https://rainbowbridge.app/transfer',
  //       id: '0-0',
  //     },
  //     {
  //       name: <FormattedMessage id="from_aurora"></FormattedMessage>,
  //       icon: Aurora,
  //       link: 'https://rainbowbridge.app/transfer',
  //       id: '0-1',
  //     },
  //   ],
  // },

  // {
  //   name: (
  //     <FormattedMessage
  //       id="electron_labs"
  //       defaultMessage={'Electron Labs'}
  //     ></FormattedMessage>
  //   ),
  //   icon: ElectronLabs,
  //   id: '2',
  //   label: 'electron_labs',

  //   children: [
  //     {
  //       name: <FormattedMessage id="from_ethereum"></FormattedMessage>,
  //       icon: Ethereum,
  //       link: 'https://mainnet.electronlabs.org/bridge',
  //       id: '2-0',
  //     },
  //   ],
  // },
  {
    name: (
      <FormattedMessage
        id="rainbow"
        defaultMessage={'Rainbow'}
      ></FormattedMessage>
    ),
    icon: Rainbow,
    id: '0',
    label: 'rainbow',
    link: 'https://rainbowbridge.app/transfer',
  },
  {
    name: <>CEX Bridge</>,
    icon: WalletCedeBridge,
    link: `https://send.cede.store/?tokenSymbol=NEAR&network=near&source=ref_finance`,
    label: ' CEX Bridge',
    id: '2',
    needAccountId: true,
  },
];
export function BridgeButton() {
  const [hover, setHover] = useState<boolean>(false);

  const [hoverBridgeType, setHoverBridgeType] = useState<
    'rainbow' | 'allbridge' | 'electron_labs'
  >();
  const [hoverSubBridge, setHoverSubBridge] = useState<string>();
  const accountId = getCurrentWallet()?.wallet?.getAccountId();

  return (
    <div
      className={` relative text-sm whitespace-nowrap rounded-md frcs gap-2 px-3 py-2  text-primaryText ${
        hover ? 'bg-primaryText bg-opacity-30' : ''
      }`}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <BridgeIconMenu
        className={hover ? 'text-white' : 'text-primaryText'}
      ></BridgeIconMenu>

      <span className={`whitespace-nowrap ${hover ? 'text-white' : ''}`}>
        <FormattedMessage
          id="bridge_pure"
          defaultMessage={'Bridge'}
        ></FormattedMessage>
      </span>

      {hover && (
        <div className="absolute pt-4 top-6 right-1/2 transform translate-x-1/2">
          <div className="bg-priceBoardColor p-2 rounded-2xl border border-menuMoreBoxBorderColor ">
            {bridgeData.map((item) => {
              if (!item.children) {
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col py-2 rounded-md px-3.5 cursor-pointer ${
                      hoverBridgeType === item.label
                        ? 'bg-primaryText bg-opacity-20 text-white'
                        : ''
                    } `}
                    style={{
                      width: '146px',
                    }}
                    onMouseEnter={() => {
                      setHoverBridgeType(item.label as any);
                    }}
                    onMouseLeave={() => {
                      setHoverBridgeType(undefined);
                    }}
                    onClick={() => {
                      let targetUrl = item.link;
                      if (item.needAccountId && accountId) {
                        targetUrl = `${targetUrl}&address=${accountId}`;
                      }
                      openUrl(targetUrl);
                    }}
                  >
                    <div className="frcs gap-2">
                      <item.icon
                        className={
                          hoverBridgeType === item.label
                            ? 'text-white'
                            : 'text-primaryText'
                        }
                      ></item.icon>
                      {item.name}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col font-gothamBold py-2 rounded-xl px-2 ${
                      hoverBridgeType === item.label
                        ? 'bg-primaryText bg-opacity-20 text-white'
                        : ''
                    } `}
                    style={{
                      width: '146px',
                    }}
                    onMouseEnter={() => {
                      setHoverBridgeType(item.label as any);
                    }}
                    onMouseLeave={() => {
                      setHoverBridgeType(undefined);
                    }}
                  >
                    <div className="frcs gap-2 mb-2  ">
                      <item.icon
                        className={
                          hoverBridgeType === item.label
                            ? 'text-white'
                            : 'text-primaryText'
                        }
                      ></item.icon>
                      {item.name}
                    </div>

                    {item.children.map((sub) => {
                      return (
                        <div
                          key={sub.id}
                          className={`font-gotham  py-2  rounded-md frcs gap-2 cursor-pointer${
                            hoverSubBridge === sub.id
                              ? 'px-2 bg-hoverSubBridge'
                              : ''
                          }`}
                          onClick={() => {
                            openUrl(sub.link);
                          }}
                          onMouseEnter={() => {
                            setHoverSubBridge(sub.id);
                          }}
                          onMouseLeave={() => {
                            setHoverSubBridge('');
                          }}
                        >
                          <sub.icon
                            className={
                              hoverBridgeType === item.label ? '' : 'opacity-50'
                            }
                          ></sub.icon>

                          {sub.name}
                        </div>
                      );
                    })}
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export interface menuItemType {
  id?: string;
  label: JSX.Element;
  logo?: JSX.Element;
  renderLogo?: (prop: any) => JSX.Element;
  url?: string;
  isExternal?: boolean;
  children?: menuItemType[];
  clickEvent?: () => void;
  links?: string[];
  swap_mode?: string;
  icon?: JSX.Element;
  hidden?: boolean;
  hoverLabel?: JSX.Element;
}
