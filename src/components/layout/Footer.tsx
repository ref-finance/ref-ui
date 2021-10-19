import React, { useEffect, useState } from 'react';
import { AiOutlineMedium } from 'react-icons/ai';
import { FaDiscord, FaTelegramPlane, FaTwitter } from 'react-icons/fa';
import { FooterLogo } from '~components/icon/FooterLogo';
import { useRefPrice } from '~state/account';

const CommunityLinks = [
  {
    label: 'Discord',
    url: 'https://discord.gg/SJBGcfMxJz',
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
];
function Footer() {
  const { data } = useRefPrice();

  return (
    <>
      <div className="absolute w-full bottom-6">
        <footer className="flex items-center justify-between md:justify-center xs:justify-center pl-9 pr-9">
          <div className="relative pl-14 md:hidden xs:hidden">
            <FooterLogo />
            <span className="text-white">${data?.['ref-finance'].usd}</span>
          </div>
          <div className="flex w-72 justify-between md:justify-around xs:justify-around">
            {CommunityLinks.map((link) => {
              return (
                <div
                  key={link.url}
                  className={`text-2xl font-semibold text-gray-600 cursor-pointer pb-2 last:pb-0 hover:text-greenLight`}
                  onClick={() => window.open(link.url)}
                >
                  {link.icon}
                </div>
              );
            })}
          </div>
          <div className="w-32 md:hidden xs:hidden"></div>
        </footer>
      </div>
    </>
  );
}
export default Footer;
