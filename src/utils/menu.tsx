import React, { ReactNode } from 'react';
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
} from '~components/icon/Nav';

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
      logo: <IconAirDrop />,
    },
    {
      label: (
        <FormattedMessage id="rainbow_bridge" defaultMessage="RainBow Bridge" />
      ),
      url: 'https://rainbowbridge.app/transfer',
      icon: <HiOutlineExternalLink />,
      isExternal: true,
      id: 2,
      logo: <IconRainbow />,
    },
    {
      label: intl.formatMessage({ id: 'docs' }),
      url: 'https://guide.ref.finance',
      icon: <HiOutlineExternalLink />,
      isExternal: true,
      id: 3,
      logo: <IconDocs />,
    },
    {
      label: intl.formatMessage({ id: 'Forum' }),
      url: 'https://gov.ref.finance',
      icon: <HiOutlineExternalLink />,
      isExternal: true,
      id: 4,
      logo: <IconForum />,
    },

    {
      label: intl.formatMessage({ id: 'Community' }),
      url: '',
      id: 5,
      isExternal: false,
      logo: <IconCommunity />,
      children: [
        {
          logo: <FaTwitter />,
          label: 'Twitter',
          icon: <HiOutlineExternalLink />,
          url: 'https://twitter.com/finance_ref',
          isExternal: true,
          id: 6,
        },
        {
          logo: <FaTelegramPlane />,
          icon: <HiOutlineExternalLink />,
          label: 'Telegram',
          url: 'https://t.me/ref_finance',
          isExternal: true,
          id: 7,
        },
        {
          logo: <FaDiscord />,
          icon: <HiOutlineExternalLink />,
          label: 'Discord',
          url: 'https://discord.gg/SJBGcfMxJz',
          isExternal: true,
          id: 8,
        },
        {
          logo: <AiOutlineMedium />,
          icon: <HiOutlineExternalLink />,
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
      logo: <IconLanguage />,
      children: [
        {
          label: 'English',
          isExternal: false,
          language: 'en',
          url: '',
          id: 11,
          logo: <IconEn />,
        },
        {
          label: '中文',
          isExternal: false,
          language: 'zh-CN',
          url: '',
          id: 12,
          logo: <IconZh />,
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
        logo: <IconPools />,
      },
      {
        id: 'Create_New_Pool',
        label: 'Create New Pool',
        url: '/pools/add',
        pattern: '/pools/add',
        isExternal: false,
        logo: <IconCreateNew />,
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
        logo: <IconAirDrop />,
      },
      {
        id: 'rainbow_bridge',
        label: 'RainBow Bridge',
        url: 'https://rainbowbridge.app/transfer',
        isExternal: true,
        logo: <IconRainbow />,
      },
      {
        id: 'docs',
        label: 'docs',
        url: 'https://guide.ref.finance',
        isExternal: true,
        logo: <IconDocs />,
      },
      {
        label: 'Forum',
        id: 'Forum',
        url: 'https://gov.ref.finance',
        isExternal: true,
        logo: <IconForum />,
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
        url: 'https://mzko2gfnij6.typeform.com/to/N6jSxnym',
        isExternal: true,
        tip: 'Hot',
      },
      {
        id: 'Risk',
        label: 'Risk',
        url: 'https://mzko2gfnij6.typeform.com/to/EPmUetxU',
        isExternal: true,
      },
    ],
  },
];
