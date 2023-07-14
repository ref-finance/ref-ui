import React, { ReactNode, useContext } from 'react';
import { AiOutlineMedium } from 'react-icons/ai';
import { FaDiscord, FaTelegramPlane, FaTwitter } from 'react-icons/fa';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  IconAirDrop,
  IconCommunity,
  IconCreateNew,
  IconDocs,
  IconEn,
  IconForum,
  IconLanguage,
  IconPools,
  IconRainbow,
  IconZh,
  IconVi,
  IconBridge,
  IconEthereum,
  IconAurora,
  IconSolana,
  IconTerra,
  IconCelo,
  UkIcon,
  RuIcon,
  JaIcon,
  KoIcon,
  IconRisk,
  AuroraIconSwapNav,
  MobileYourLiqudityIcon,
  MobilePoolsIcon,
  BridgeIcon,
  RisksIcon,
  EsIcon,
  WrapNearIcon,
  MobileBridgeIcon,
  InquiriesIcon,
  SwapIcon,
  XswapIcon,
  LimitOrderIcon,
  OrderBookIcon,
  PoolsIcon,
  YourliquidityIcon,
  FarmsIcon,
  XrefEarnIcon,
  XrefIcon,
  REFSmallIcon,
  PurpleCircleIcon,
  PortfolioIcon,
  OrderlyIcon,
  BorrowIcon,
  OverviewIcon,
} from '~components/icon/Nav';
// import { XrefIcon } from '~components/icon/Xref';
import getConfig from '../services/config';
import { MobileNavLimitOrder } from '../components/icon/Nav';
import {
  SWAP_MODE_KEY,
  SWAP_MODE,
  REF_FI_SWAP_SWAPPAGE_TAB_KEY,
  SWAP_TYPE_KEY,
} from '../pages/SwapPage';
import {
  MobileNavSwap,
  MobileNavStable,
  MobileNavSwapPro,
} from '../components/icon/Nav';
import { WalletContext } from '../utils/wallets-integration';
import { useHistory } from 'react-router';
import { jsx } from '@emotion/react';
import { openUrl } from '~services/commonV3';

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
    {
      label: <FormattedMessage id="airdrop" defaultMessage="Airdrop" />,
      url: '/airdrop',
      isExternal: false,
      logo: <IconAirDrop />,
    },
    {
      label: 'Business Inquiries',
      url: 'https://form.typeform.com/to/onOPhJ6Y',
      isExternal: true,
      logo: <InquiriesIcon />,
    },
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
      label: 'Українська',
      language: 'uk',
      logo: <UkIcon />,
    },
    {
      label: 'Pусский',
      language: 'ru',
      logo: <RuIcon />,
    },
    {
      label: '日本語',
      language: 'ja',
      logo: <JaIcon />,
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

  const menuData = [
    {
      id: '1',
      label: (
        <>
          <FormattedMessage id="trade" />
        </>
      ),
      links: ['/', '/orderbook', '/myOrder', '/swap'],
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

            history.push('/');
          },
          links: ['/', '/swap'],
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

            history.push('/');
            localStorage.setItem('SWAP_MODE_VALUE', 'limit');
          },
          links: ['/', '/myOrder', '/swap'],
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
                    openUrl('/orderbook/spot');
                  }}
                  style={{
                    width: '120px',
                  }}
                  className={`frcc bg-symbolHover2 hover:bg-light1 w-1/2 rounded-xl py-2 ${
                    window.location.pathname.startsWith('/orderbook/spot')
                      ? 'bg-light1'
                      : ''
                  }`}
                >
                  <FormattedMessage
                    id="spot"
                    defaultMessage={'Spot'}
                  ></FormattedMessage>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    cb && cb();

                    openUrl('/orderbook/perps');
                  }}
                  style={{
                    width: '120px',
                  }}
                  className={`frcc bg-symbolHover2 hover:bg-light1 w-1/2 rounded-xl py-2  ${
                    window.location.pathname.startsWith('/orderbook/perps')
                      ? 'bg-light1'
                      : ''
                  }`}
                >
                  <FormattedMessage
                    id="perpetual"
                    defaultMessage={'Perpetual'}
                  ></FormattedMessage>
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
        '/yourliquidity',
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
          links: ['/pools', '/pool', '/poolV2', '/sauce', '/more_pools'],
        },
        {
          id: '2-2',
          label: (
            <>
              <FormattedMessage id="your_liquidity" />
            </>
          ),
          logo: <YourliquidityIcon />,
          url: '/yourliquidity',
          isExternal: false,
          clickEvent: () => {
            sessionStorage.setItem('REF_POOL_NAV_TAB_VALUE', '/yourliquidity');
            history.push('/yourliquidity');
          },
          links: ['/yourliquidity', '/yoursLiquidityDetailV2'],
        },
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
      links: ['/portfolio', '/burrow', '/overview', '/orderly'],
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
          logo: <OrderlyIcon />,
          url: '/orderly',
          isExternal: false,
          links: ['/orderly'],
        },
        {
          id: '3-4',
          label: (
            <>
              <FormattedMessage id="Burrow" />
            </>
          ),
          logo: <BorrowIcon />,
          url: '/burrow',
          isExternal: false,
          links: ['/burrow'],
        },
      ],
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
          id: '5-1',
          label: <>{intl.formatMessage({ id: 'bridge' })}</>,
          logo: <BridgeIcon />,
          children: [
            {
              label: <>{intl.formatMessage({ id: 'from_ethereum' })}</>,
              url: 'https://rainbowbridge.app/transfer',
              isExternal: true,
              icon: <HiOutlineExternalLink />,
              id: '5-1-1',
              logo: <IconEthereum />,
            },
            {
              label: <>{intl.formatMessage({ id: 'from_aurora' })}</>,
              url: 'https://rainbowbridge.app/transfer',
              isExternal: true,
              icon: <HiOutlineExternalLink />,
              id: '5-1-2',
              logo: <IconAurora />,
            },
            {
              label: <>{intl.formatMessage({ id: 'from_solana' })}</>,
              url: 'https://app.allbridge.io/bridge?from=SOL&to=NEAR',
              isExternal: true,
              icon: <HiOutlineExternalLink />,
              id: '5-1-3',
              logo: <IconSolana />,
            },
            {
              label: <>{intl.formatMessage({ id: 'from_terra' })}</>,
              url: 'https://app.allbridge.io/bridge?from=TRA&to=NEAR',
              isExternal: true,
              icon: <HiOutlineExternalLink />,
              id: '5-1-4',
              logo: <IconTerra />,
            },
            {
              label: <>{intl.formatMessage({ id: 'from_celo' })}</>,
              url: 'https://app.allbridge.io/bridge?from=CELO&to=NEAR',
              isExternal: true,
              icon: <HiOutlineExternalLink />,
              id: '5-1-5',
              logo: <IconCelo />,
            },
          ],
        },
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
        {
          id: '5-4',
          label: (
            <>{<FormattedMessage id="airdrop" defaultMessage="Airdrop" />}</>
          ),
          url: '/airdrop',
          isExternal: false,
          logo: <IconAirDrop />,
          links: ['/airdrop'],
        },
        {
          id: '5-5',
          label: (
            <>
              <FormattedMessage id="business_inquiries" />
            </>
          ),
          url: 'https://form.typeform.com/to/onOPhJ6Y',
          isExternal: true,
          logo: <InquiriesIcon />,
        },
      ],
    },
  ];
  return menuData;
};
export const useMenusMobile = () => {
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
      links: ['/', '/orderbook', '/myOrder', '/swap'],
      children: [
        {
          id: '1-1',
          label: <>Swap</>,
          logo: <SwapIcon />,
          url: '/',
          isExternal: false,
          swap_mode: 'normal',
          clickEvent: () => {
            history.push('/');

            sessionStorage.setItem(SWAP_TYPE_KEY, 'Lite');
            localStorage.setItem('SWAP_MODE_VALUE', 'normal');
          },
          links: ['/', '/swap'],
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
            history.push('/');
            localStorage.setItem('SWAP_MODE_VALUE', 'limit');
            sessionStorage.setItem(SWAP_TYPE_KEY, 'Pro');
          },
          links: ['/', '/myOrder', '/swap'],
        },
        {
          id: '1-3',
          label: (
            <div className="w-full pl-2">
              <div className="frcs gap-4 mb-2">
                <OrderBookIcon />
                <FormattedMessage id="orderbook_mobile"></FormattedMessage>
              </div>

              <div className="w-full font-gotham frcs gap-3 text-white text-base ">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    openUrl('/orderbook/spot');
                  }}
                  className="frcc bg-symbolHover2 border text-white border-white border-opacity-30 w-1/2 rounded-xl py-2"
                  style={{
                    background: '#4F6574',
                    width: '104px',
                  }}
                >
                  <FormattedMessage
                    id="spot"
                    defaultMessage={'Spot'}
                  ></FormattedMessage>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    openUrl('/orderbook/perps');
                  }}
                  style={{
                    background: '#4F6574',
                    width: '104px',
                  }}
                  className="frcc bg-symbolHover2 border  border-white border-opacity-30 w-1/2 rounded-xl py-2"
                >
                  <FormattedMessage
                    id="perpetual"
                    defaultMessage={'Perpetual'}
                  ></FormattedMessage>
                </button>
              </div>
            </div>
          ),
          url: '/orderbook',
          isExternal: false,
          links: ['/orderbook'],
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
        '/yourliquidity',
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
          links: ['/pools', '/pool', '/poolV2', '/sauce', '/more_pools'],
        },
        {
          id: '2-2',
          label: (
            <>
              <FormattedMessage id="your_liquidity" />
            </>
          ),
          logo: <YourliquidityIcon />,
          url: '/yourliquidity',
          isExternal: false,
          clickEvent: () => {
            sessionStorage.setItem('REF_POOL_NAV_TAB_VALUE', '/yourliquidity');
            history.push('/yourliquidity');
          },
          links: ['/yourliquidity', '/yoursLiquidityDetailV2'],
        },
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
      links: ['/portfolio', '/burrow', '/overview', '/orderly'],
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
          logo: <OrderlyIcon />,
          url: '/orderly',
          isExternal: false,
          links: ['/orderly'],
        },
        {
          id: '3-4',
          label: <FormattedMessage id="Burrow" />,
          logo: <BorrowIcon />,
          url: '/burrow',
          isExternal: false,
          links: ['/burrow'],
        },
      ],
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
          id: '5-1',
          label: <>{intl.formatMessage({ id: 'bridge' })}</>,
          logo: <BridgeIcon />,
          children: [
            {
              label: <>{intl.formatMessage({ id: 'from_ethereum' })}</>,
              url: 'https://rainbowbridge.app/transfer',
              isExternal: true,
              icon: <HiOutlineExternalLink />,
              id: '5-1-1',
              logo: <IconEthereum />,
            },
            {
              label: <>{intl.formatMessage({ id: 'from_aurora' })}</>,
              url: 'https://rainbowbridge.app/transfer',
              isExternal: true,
              icon: <HiOutlineExternalLink />,
              id: '5-1-2',
              logo: <IconAurora />,
            },
            {
              label: <>{intl.formatMessage({ id: 'from_solana' })}</>,
              url: 'https://app.allbridge.io/bridge?from=SOL&to=NEAR',
              isExternal: true,
              icon: <HiOutlineExternalLink />,
              id: '5-1-3',
              logo: <IconSolana />,
            },
            {
              label: <>{intl.formatMessage({ id: 'from_terra' })}</>,
              url: 'https://app.allbridge.io/bridge?from=TRA&to=NEAR',
              isExternal: true,
              icon: <HiOutlineExternalLink />,
              id: '5-1-4',
              logo: <IconTerra />,
            },
            {
              label: <>{intl.formatMessage({ id: 'from_celo' })}</>,
              url: 'https://app.allbridge.io/bridge?from=CELO&to=NEAR',
              isExternal: true,
              icon: <HiOutlineExternalLink />,
              id: '5-1-5',
              logo: <IconCelo />,
            },
          ],
        },
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
        {
          id: '5-4',
          label: (
            <>{<FormattedMessage id="airdrop" defaultMessage="Airdrop" />}</>
          ),
          url: '/airdrop',
          isExternal: false,
          logo: <IconAirDrop />,
          links: ['/airdrop'],
        },
        {
          id: '5-5',
          label: (
            <>
              <FormattedMessage id="business_inquiries" />
            </>
          ),
          url: 'https://form.typeform.com/to/onOPhJ6Y',
          isExternal: true,
          logo: <InquiriesIcon />,
        },
      ],
    },
  ];
  return menuData;
};
export const moreLinks: MobileMenuItem[] = [
  {
    id: 'trade_capital',
    label: 'TRADE',
    pattern: '/',
    url: '/',
    isExternal: false,
  },
  {
    id: 'POOL',
    label: 'POOL',
    pattern: '/pools',
    url: '/yourliquidity',
    isExternal: false,
  },
  {
    id: 'farm_capital',
    label: 'FARMS',
    pattern: '/v2farms',
    url: '/v2farms',
    isExternal: false,
  },
  {
    id: 'xref',
    label: 'xREF',
    pattern: '/xref',
    url: '/xref',
    isExternal: false,
    showIcon: true,
    iconElement: <XrefIcon></XrefIcon>,
  },
  {
    id: 'vote_capital',
    label: 'VOTE',
    pattern: '/referendum',
    url: '/referendum',
    isExternal: false,
    hidden: !getConfig().REF_VE_CONTRACT_ID,
  },
  {
    id: 'MORE',
    label: 'MORE',
    url: '',
    isExternal: false,
    subRoute: ['/airdrop', '/risks', '/sauce'],
    children: [
      {
        id: 'bridge',
        label: 'bridge',
        url: '',
        isExternal: false,
        logo: <MobileBridgeIcon />,
        children: [
          {
            id: 'from_ethereum',
            label: 'From Ethereum',
            url: 'https://rainbowbridge.app/transfer',
            isExternal: true,
            logo: <IconEthereum />,
          },
          {
            id: 'from_aurora',
            label: 'From Aurora',
            url: 'https://rainbowbridge.app/transfer',
            isExternal: true,
            logo: <IconAurora />,
          },
          {
            id: 'from_solana',
            label: 'From Solana',
            url: 'https://app.allbridge.io/bridge?from=SOL&to=NEAR',
            isExternal: true,
            logo: <IconSolana />,
          },
          {
            id: 'from_terra',
            label: 'From Terra',
            url: 'https://app.allbridge.io/bridge?from=TRA&to=NEAR',
            isExternal: true,
            logo: <IconTerra />,
          },
          {
            id: 'from_celo',
            label: 'From Celo',
            url: 'https://app.allbridge.io/bridge?from=CELO&to=NEAR',
            isExternal: true,
            logo: <IconCelo />,
          },
        ],
      },
      {
        id: 'docs',
        label: 'docs',
        url: 'https://guide.ref.finance',
        isExternal: true,
        logo: <IconDocs />,
      },
      {
        label: 'Risks',
        id: 'risks',
        pattern: '/risks',
        url: '/risks',
        isExternal: false,
        logo: <RisksIcon />,
      },
      {
        id: 'airdrop',
        label: 'Airdrop',
        url: '/airdrop',
        pattern: '/airdrop',
        isExternal: false,
        logo: <IconAirDrop />,
      },
      {
        id: 'inquiries',
        label: 'Business Inquiries',
        url: 'https://form.typeform.com/to/onOPhJ6Y',
        isExternal: true,
        logo: <InquiriesIcon />,
      },
    ],
  },
];

export interface menuItemType {
  id?: string;
  label: JSX.Element;
  logo?: JSX.Element;
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
