import React, { useState, useEffect } from 'react';
import { SymbolInfo } from '../../orderly/type';
import { getOrderlyConfig } from '../../config';

export function useAllSymbolInfo() {
  const [availableSymbols, setAvailableSymbols] = useState<SymbolInfo[]>();
  useEffect(() => {
    fetch(`${getOrderlyConfig().OFF_CHAIN_END_POINT}/v1/public/info`).then(
      res => {
        res.json().then(data => {
          setAvailableSymbols(data.data.rows);
        });
      }
    );
  }, []);

  return availableSymbols;
}
