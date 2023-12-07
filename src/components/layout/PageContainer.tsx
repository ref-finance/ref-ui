import React, { useState, useEffect } from 'react';
import { useTranstionsExcuteDataStore } from '../../stores/transtionsExcuteData';

export function PageContainer({ children }: any) {
  const [key, setKey] = useState(1);
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const transtionsExcuteStatus = transtionsExcuteDataStore.getActionStatus();
  useEffect(() => {
    if (transtionsExcuteStatus == 'resolved') {
      setKey(Math.random());
      transtionsExcuteDataStore.setActionStatus('none');
    }
  }, [transtionsExcuteStatus]);
  return <div key={key}>{children}</div>;
}
