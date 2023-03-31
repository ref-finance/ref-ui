import React, { useEffect, useState } from 'react';

export default function ExternalPopUp() {
  const env = process.env.NEAR_ENV || '';
  const is_test_env = env == 'testnet' || env == 'pub-testnet';
  const dom_id = is_test_env ? 'pr3sence' : 'ref-mainnet';
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
    // click event
    // document.getElementById(dom_id).addEventListener('click', function (e:any) {
    //   if (e.target.closest('#close-button')) {
    //     document.getElementById(dom_id).style.display = 'none';
    //   }
    // });
  }, []);

  return (
    <div
      id={dom_id}
      style={{
        maxWidth: '310px',
        maxHeight: '110px',
        zIndex: 100,
        paddingRight: '10px',
        paddingTop: '10px',
      }}
      className="fixed xsm:left-1/2 xsm:transform xsm:-translate-x-1/2 lg:right-8 bottom-8 overflow-hidden"
    ></div>
  );
}
