import React, { useCallback, useEffect, useState } from 'react';
import { TokenMetadata } from '~services/ft-contract';
import { getTokenPairRate } from '~services/indexer';
import useInterval from 'react-useinterval';
import moment from 'moment';

export const useTokenRate24h = ({
  token,
  base_token,
}: {
  token: TokenMetadata;
  base_token: TokenMetadata;
}) => {
  const [diff, setDiff] = useState<{
    percent: string;
    direction: 'down' | 'up';
    curPrice: number;
  }>();

  const func = () => {
    return getTokenPairRate({
      token,
      base_token,
      dimension: 'D',
    }).then((res) => {
      const priceList = res.price_list.sort(
        (a, b) =>
          moment(b.date_time, 'YYYY-MM-DD HH:mm:ss').unix() -
          moment(a.date_time, 'YYYY-MM-DD HH:mm:ss').unix()
      );

      const curPrice = priceList?.[0]?.price;

      const last24Price = priceList?.[priceList.length - 1]?.price;
      if (curPrice && last24Price) {
        const diff = (curPrice - last24Price) / last24Price;
        const displayDiff = (Math.abs(diff) * 100).toFixed(2) + '%';
        setDiff({
          percent: displayDiff,
          direction: diff > 0 ? 'up' : 'down',
          curPrice: curPrice,
        });
      } else {
        setDiff(undefined);
      }
    });
  };

  useEffect(() => {
    if (!token || !base_token) return null;
    func();
  }, [base_token, token]);

  useInterval(func, 1000 * 60 * 10);

  return diff;
};
