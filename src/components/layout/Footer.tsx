import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FooterLogoREF } from 'src/components/icon/FooterLogo';
import { IconForum } from 'src/components/icon/Nav';
import {
  RefAnalytics,
  RefAnalyticsGary,
} from 'src/components/icon/RefAnalytics';
import RpcList from 'src/components/rpc/index';
import { useRefPrice } from 'src/state/account';
import { useClientMobile } from 'src/utils/device';
import { toPrecision } from 'src/utils/numbers';

import {
  AiOutlineMedium,
  FaDiscord,
  FaTelegramPlane,
  FaTwitter,
} from '../reactIcons';

const CommunityLinks = [
  {
    label: 'Discord',
    url: 'https://discord.gg/reffinance',
    icon: <FaDiscord />,
  },
  {
    label: 'Twitter',
    url: 'https://twitter.com/finance_ref',
    icon: <FaTwitter />,
  },
  {
    label: 'Telegram',
    url: 'https://t.me/ref_finance',
    icon: <FaTelegramPlane />,
  },
  {
    label: 'Medium',
    url: 'https://ref-finance.medium.com/',
    icon: <AiOutlineMedium />,
  },
  {
    label: 'Forum',
    url: 'https://gov.ref.finance',
    icon: <IconForum />,
  },
];

function openUrl(url: string) {
  const newTab = window.open();
  newTab.opener = null;
  newTab.location = url;
}

function Footer() {
  const { data } = useRefPrice('Footer');
  const [hoverLogo, setHoverLogo] = useState(false);

  const location = useLocation();

  const mobilePortfolioPathNames = [
    '/orderly',
    '/portfolio',
    '/burrow',
    '/overview',
  ];

  const isMobile = useClientMobile();

  if (!data) return null;

  return (
    <>
      <div className="absolute w-full bottom-6 xs:bottom-0 md:bottom-0">
        <footer
          className={`flex items-center justify-center pl-9 pr-9 ${
            isMobile && mobilePortfolioPathNames.indexOf(location.pathname) > -1
              ? 'xs:pb-24'
              : 'xs:pb-9'
          } md:pb-9`}
        >
          <div className="fixed left-8 bottom-5 md:hidden xs:hidden">
            <div className="flex items-center bg-cardBg rounded-2xl p-0.5 w-24">
              <FooterLogoREF
                className="rounded-full mr-1.5"
                style={{ width: '28px', height: '28px' }}
              ></FooterLogoREF>
              <span className="text-sm text-white">
                ${data === '-' ? '-' : toPrecision(data, 2)}
              </span>
            </div>
            <div className="flex items-center mt-5">
              <div
                className="cursor-pointer inline-flex items-center"
                onMouseOver={() => setHoverLogo(true)}
                onMouseLeave={() => setHoverLogo(false)}
                onClick={() => window.open('https://stats.ref.finance/')}
              >
                {!hoverLogo && (
                  <RefAnalyticsGary
                    style={{
                      transform: 'scale(0.9)',
                      transformOrigin: '30% center',
                    }}
                  />
                )}
                {hoverLogo && (
                  <RefAnalytics
                    style={{
                      transform: 'scale(0.9)',
                      transformOrigin: '30% center',
                    }}
                  />
                )}
              </div>
              <div className="w-px h-3 bg-primaryText mr-3"></div>
              <div
                onClick={() =>
                  window.open('https://guide.ref.finance/developers/audits')
                }
                className="text-primaryText text-sm cursor-pointer transition-colors hover:text-primary hover:underline"
              >
                Security
              </div>
              {/* <div
                className={`text-white text-right`}
                data-class="reactTip"
                data-tooltip-id={'mailBoxId'}
                data-place="right"
                data-tooltip-html={`<div class="opacity-50 text-xs text-left">Business Inquiries</div>`}
              >
                <MailBoxIcon
                  className="relative cursor-pointer ml-5 -mt-1"
                  onClick={() => {
                    window.open('https://form.typeform.com/to/onOPhJ6Y');
                  }}
                ></MailBoxIcon>
                <CustomTooltip
                  id={'mailBoxId'}
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                />
              </div> */}
            </div>
          </div>
          <div className="flex w-72 justify-between md:justify-around xs:justify-around">
            {CommunityLinks.map((link) => {
              return (
                <div
                  key={link.url}
                  className={`text-2xl font-semibold text-gray-600 cursor-pointer pb-2 last:pb-0 hover:text-greenColor`}
                  onClick={() => openUrl(link.url)}
                >
                  {link.icon}
                </div>
              );
            })}
          </div>
        </footer>
        {/*<RpcList></RpcList>*/}
      </div>
    </>
  );
}
export default Footer;
