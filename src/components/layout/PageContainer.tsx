import React, { useState, useEffect } from 'react';
import { useTranstionsExcuteDataStore } from '../../stores/transtionsExcuteData';
import { isNewHostName } from '../../services/config';

export function PageContainer({ children }: any) {
  const [key, setKey] = useState(1);
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const transtionsExcuteStatus = transtionsExcuteDataStore.getActionStatus();
  useEffect(() => {
    if (
      transtionsExcuteStatus == 'resolved' ||
      transtionsExcuteStatus == 'rejected'
    ) {
      setKey(Math.random());
      transtionsExcuteDataStore.setActionStatus('none');
    }
  }, [transtionsExcuteStatus]);
  return <div key={key}>{children}</div>;
}

export function PageContainerHighHighLevel({ children }: any) {
  const [key, setKey] = useState(1);
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const transtionsExcuteStatus = transtionsExcuteDataStore.getActionStatus();
  const pathnames = ['/orderbook/perps', '/orderbook/spot', '/orderly'];
  const pathname = location.pathname;
  const isOrderlyPage = isNewHostName
    ? pathname == '/' || pathname == '/spot' || pathname == '/orderly'
    : pathnames.includes(pathname);
  useEffect(() => {
    if (
      (transtionsExcuteStatus == 'resolved' ||
        transtionsExcuteStatus == 'rejected') &&
      isOrderlyPage
    ) {
      setKey(Math.random());
      transtionsExcuteDataStore.setActionStatus('none');
    }
  }, [transtionsExcuteStatus]);
  return <div key={key}>{children}</div>;
}
