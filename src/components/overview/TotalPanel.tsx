import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import QuestionMark from '~components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import Big from 'big.js';

import { useWalletSelector } from '../../context/WalletSelectorContext';
import { isMobile } from '~utils/device';
// import { useTokenInfo } from '../../orderly/state';
import { useTokenInfo } from '../../pages/Orderly/orderly/state';
import { useOrderAssets } from '../../pages/Orderly/components/AssetModal/state';
const is_mobile = isMobile();
export default function OrderlyPanel() {
  const tokenInfo = useTokenInfo();
  const balances = useOrderAssets(tokenInfo); // todo需要拿ordely 状态 等捋清逻辑再最后处理
  console.log('balances', balances);
  console.log('tokenInfo', tokenInfo);
  return <div>hello kity</div>;
}
