import React, { useEffect, useState } from 'react';
import { isMobile } from 'src/utils/device';
import { useHistory, useLocation } from 'react-router-dom';
export default function ExternalPopUp() {
  const location = useLocation();
  const env = process.env.REACT_APP_NEAR_ENV || '';
  const is_test_env = env == 'testnet' || env == 'pub-testnet';
  const dom_id = is_test_env ? 'pr3sence' : 'ref-mainnet';
  const is_mobile = isMobile();
  const is_swap_page = location.pathname == '/' || location.pathname == '/swap';
  const is_order = location.pathname == '/myOrder';
  useEffect(() => {
    let walletId = '';
    let zone_id = '';
    let storage = Object.entries(localStorage);
    let found = storage.find(([key]) => /wallet_auth_key*/.test(key));
    const env_map = {
      testnet: ['testnet', 'pub-testnet'],
      near: ['', 'production', 'mainnet'],
    };
    if (found) {
      walletId = JSON.parse(found[1]).accountId;
      const account_suffix = walletId.split('.')[1];
      const env_keys = env_map[account_suffix];
      if (env_keys?.indexOf(env) == -1) {
        walletId = '';
      }
    }
    if (is_test_env) {
      zone_id = '5';
    } else {
      zone_id = '7';
    }
    let script = document.createElement('script');
    script.src = `https://api.pr3sence.xyz/request/content?zone_id=${zone_id}&walletId=${walletId}&type=js`;
    document.head.appendChild(script);
  }, []);
  const hiddenPopup = is_swap_page || is_order || is_mobile;
  return (
    <div
      id={dom_id}
      style={{
        maxWidth: '310px',
        maxHeight: '110px',
        zIndex: 100,
        paddingRight: '10px',
        paddingTop: '10px',
        display: hiddenPopup ? 'none' : 'block',
      }}
      className="fixed xsm:left-1/2 xsm:transform xsm:-translate-x-1/2 lg:right-8 bottom-8 overflow-hidden"
    ></div>
  );
}
