import { path } from 'animejs';
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { WalletContext } from '../../utils/wallets-integration';
import { useHistory } from 'react-router-dom';
import { useClientMobile } from '../../utils/device';
export const PoolTabV3 = ({ count }: { count?: number }) => {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [choosedTab, setChoosedTab] = useState('');
  const history = useHistory();

  const isMobile = useClientMobile();

  useEffect(() => {
    const pathname = location.pathname;
    if (
      pathname.startsWith('/pool/') ||
      pathname.startsWith('/poolV2') ||
      pathname.startsWith('/more_pools/') ||
      pathname == '/pools' ||
      pathname == '/pools/add'
    ) {
      setChoosedTab('2');
    } else if (pathname == '/yourliquidity') {
      setChoosedTab('1');
    }
  }, []);
  function goPage(url: string) {
    history.push(url);
  }
  return (
    <div
      className={`flex items-center justify-between rounded-2xl bg-cardBg text-primaryText font-normal mb-7 text-lg  p-1 mx-auto xl:w-1/3 2xl:w-1/3 3xl:w-1/4 lg:w-1/2 md:w-5/6 xs:w-auto xs:mx-2`}
      style={{
        height: '50px',
      }}
    >
      <span
        className={`flex items-center justify-center h-full  flex-grow text-center cursor-pointer ${
          choosedTab == '1' ? 'bg-tabChosen text-white rounded-xl' : ''
        }`}
        onClick={() => {
          goPage('/yourliquidity');
        }}
      >
        <FormattedMessage id="Your_Liquidity" defaultMessage="Your Liquidity" />
        {count && isMobile && choosedTab === '3' ? `(${count})` : ''}
      </span>
      <span
        className={`flex items-center justify-center h-full flex-grow text-center cursor-pointer ${
          choosedTab == '2' ? 'bg-tabChosen text-white rounded-xl' : ''
        }`}
        onClick={() => {
          goPage('/pools');
        }}
      >
        <FormattedMessage
          id={isMobile ? 'pools' : 'view_pools'}
          defaultMessage={isMobile ? 'Pools' : 'View Pools'}
        />
      </span>
    </div>
  );
};
