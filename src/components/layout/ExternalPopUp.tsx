import React, { useEffect, useState } from 'react';

export default function ExternalPopUp() {
  useEffect(() => {
    let walletId = '';
    let zone_id = '';
    let storage = Object.entries(localStorage);
    let found = storage.find(([key]) => /wallet_auth_key*/.test(key));
    const env = process.env.NEAR_ENV || '';
    const env_map = {
      testnet: ['testnet', 'pub-testnet'],
      near: ['', 'production', 'mainnet'],
    };
    if (found) {
      walletId = JSON.parse(found[1]).accountId;
      const account_suffix = walletId.split('.')[1];
      const env_keys = env_map[account_suffix];
      if (env_keys.indexOf(env) == -1) {
        walletId = '';
      }
    }
    if (env == 'testnet' || env == 'pub-testnet') {
      zone_id = '5';
    } else {
      zone_id = '7';
    }
    let script = document.createElement('script');
    script.src = `https://api.pr3sence.xyz/request/content?zone_id=7&walletId=&type=js`;
    document.head.appendChild(script);
  }, []);

  return (
    <div
      id="ref-mainnet"
      style={{
        maxWidth: '310px',
        maxHeight: '100px',
        zIndex: 100,
        paddingRight: '10px',
        paddingTop: '10px',
      }}
      className="rounded-lg fixed xsm:left-1/2 xsm:transform xsm:-translate-x-1/2 lg:right-8 bottom-8 overflow-hidden"
    ></div>
  );
}
