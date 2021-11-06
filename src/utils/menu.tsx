import React, { ReactNode } from 'react';
import { AiOutlineMedium } from 'react-icons/ai';
import {
  FaDiscord,
  FaExternalLinkAlt,
  FaTelegramPlane,
  FaTwitter,
} from 'react-icons/fa';
import { FormattedMessage, useIntl } from 'react-intl';

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
    {
      label: <FormattedMessage id="airdrop" defaultMessage="Airdrop" />,
      url: '/airdrop',
      isExternal: false,
      id: 1,
    },
    {
      label: (
        <FormattedMessage id="rainbow_bridge" defaultMessage="RainBow Bridge" />
      ),
      url: 'https://ethereum.bridgetonear.org/',
      icon: <FaExternalLinkAlt />,
      isExternal: true,
      id: 2,
    },
    {
      label: intl.formatMessage({ id: 'docs' }),
      url: 'https://guide.ref.finance',
      icon: <FaExternalLinkAlt />,
      isExternal: true,
      id: 3,
    },
    { label: 'Forum', url: 'https://gov.ref.finance', isExternal: true, id: 4 },

    {
      label: 'Community',
      url: '',
      icon: <FaExternalLinkAlt />,
      id: 5,
      children: [
        {
          logo: <FaTwitter />,
          label: 'Twitter',
          icon: <FaExternalLinkAlt />,
          url: 'https://twitter.com/finance_ref',
          isExternal: true,
          id: 6,
        },
        {
          logo: <FaTelegramPlane />,
          icon: <FaExternalLinkAlt />,
          label: 'Telegram',
          url: 'https://t.me/ref_finance',
          isExternal: true,
          id: 7,
        },
        {
          logo: <FaDiscord />,
          icon: <FaExternalLinkAlt />,
          label: 'Discord',
          url: 'https://discord.gg/SJBGcfMxJz',
          isExternal: true,
          id: 8,
        },
        {
          logo: <AiOutlineMedium />,
          icon: <FaExternalLinkAlt />,
          label: 'Medium',
          url: 'https://ref-finance.medium.com/',
          isExternal: true,
          id: 9,
        },
      ],
    },
    {
      label: <FormattedMessage id="language" defaultMessage="Language" />,
      url: '',
      isExternal: false,
      id: 10,

      children: [
        {
          label: 'English',
          isExternal: false,
          language: 'en',
          url: '',
          id: 11,
        },
        {
          label: '中文',
          isExternal: false,
          language: 'zh-CN',
          url: '',
          id: 12,
        },
      ],
    },
  ];

  return { menuData };
};

export type MobileMenuItem = {
  id: string;
  label: string;
  url: string;
  icon?: ReactNode;
  isExternal: boolean;
  children?: MobileMenuItem[];
  logo?: ReactNode;
  pattern?: string;
  tip?: string;
  subRoute?: string[];
};

export const moreLinks: MobileMenuItem[] = [
  {
    id: 'Deposit',
    label: 'Deposit',
    pattern: '/deposit/:id?',
    url: '/deposit',
    isExternal: false,
  },
  {
    id: 'Swap',
    label: 'Swap',
    pattern: '/',
    url: '/',
    isExternal: false,
  },
  {
    id: 'pools',
    label: 'Pools',
    url: '',
    subRoute: ['/pools', '/pools/add', '/pools/yours'],
    isExternal: false,
    children: [
      {
        id: 'view_pools',
        label: 'View Pools',
        url: '/pools',
        pattern: '/pools',
        isExternal: false,
      },
      {
        id: 'Create_New_Pool',
        label: 'Create New Pool',
        url: '/pools/add',
        pattern: '/pools/add',
        isExternal: false,
      },
    ],
  },
  {
    id: 'Farms',
    label: 'Farms',
    pattern: '/farms',
    url: '/farms',
    isExternal: false,
  },
  {
    id: 'more',
    label: 'More',
    url: '',
    isExternal: false,
    subRoute: ['/airdrop'],
    children: [
      {
        id: 'airdrop',
        label: 'Airdrop',
        url: '/airdrop',
        pattern: '/airdrop',
        isExternal: false,
      },
      {
        id: 'rainbow_bridge',
        label: 'RainBow Bridge',
        url: 'https://ethereum.bridgetonear.org/',
        isExternal: true,
      },
      {
        id: 'docs',
        label: 'docs',
        url: 'https://guide.ref.finance',
        isExternal: true,
      },
      {
        label: 'Forum',
        id: 'Forum',
        url: 'https://gov.ref.finance',
        isExternal: true,
      },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    url: '',
    isExternal: false,
    children: [
      {
        logo: <FaDiscord />,
        label: 'Discord',
        id: 'Discord',
        url: 'https://discord.gg/SJBGcfMxJz',
        isExternal: true,
      },
      {
        logo: <FaTelegramPlane />,
        label: 'Telegram',
        id: 'Telegram',
        url: 'https://t.me/ref_finance',
        isExternal: true,
      },
      {
        logo: <FaTwitter />,
        id: 'Twitter',
        label: 'Twitter',
        url: 'https://twitter.com/finance_ref',
        isExternal: true,
      },
      {
        logo: <AiOutlineMedium />,
        id: 'Medium',
        label: 'Medium',
        url: 'https://ref-finance.medium.com/',
        isExternal: true,
      },
    ],
  },
  {
    id: 'Quiz',
    label: 'Quiz',
    url: '',
    isExternal: true,
    children: [
      {
        id: 'New_ui',
        label: 'New UI',
        url: '//mzko2gfnij6.typeform.com/to/N6jSxnym',
        isExternal: true,
        tip: 'Hot',
      },
      {
        id: 'Risk',
        label: 'Risk',
        url: '//mzko2gfnij6.typeform.com/to/EPmUetxU',
        isExternal: true,
      },
    ],
  },
];
