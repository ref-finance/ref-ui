import { path } from 'animejs';
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { WalletContext } from '../../utils/wallets-integration';
import { useHistory } from 'react-router-dom';
import { useClientMobile } from '../../utils/device';
export const PoolTab = ({ count }: { count?: number }) => {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [choosedTab, setChoosedTab] = useState('');
  const history = useHistory();

  const isMobile = useClientMobile();

  useEffect(() => {
    const pathname = location.pathname;
    if (
      pathname.startsWith('/pool/') ||
      pathname.startsWith('/more_pools/') ||
      pathname == '/pools' ||
      pathname == '/pools/add'
    ) {
      setChoosedTab('1');
    } else if (pathname == '/pools/yours') {
      setChoosedTab('3');
    }
  }, []);
  function goPage(url: string) {
    history.push(url);
  }
  return (
    <div
      className={`flex items-center justify-between rounded-2xl bg-cardBg text-primaryText font-normal mb-4 ${
        choosedTab === '3' ? 'xs:mb-0' : ''
      } text-lg  p-1 mx-auto   ${
        isSignedIn
          ? 'xl:w-1/3 2xl:w-1/3 3xl:w-1/4 lg:w-1/2 md:w-5/6 xs:w-auto xs:mx-2'
          : 'xl:w-1/4 2xl:w-1/4 3xl:w-1/4 lg:w-1/3 md:w-5/6 xs:w-5/6'
      }`}
      style={{
        height: '50px',
      }}
    >
      {isSignedIn ? (
        <span
          className={`flex items-center justify-center h-full  flex-grow text-center cursor-pointer ${
            choosedTab == '3' ? 'bg-tabChosen text-white rounded-xl' : ''
          }`}
          onClick={() => {
            goPage('/pools/yours');
          }}
        >
          <FormattedMessage
            id="Your_Liquidity"
            defaultMessage="Your Liquidity"
          />
          {count && isMobile && choosedTab === '3' ? `(${count})` : ''}
        </span>
      ) : null}
      <span
        className={`flex items-center justify-center h-full flex-grow text-center cursor-pointer ${
          choosedTab == '1' ? 'bg-tabChosen text-white rounded-xl' : ''
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
