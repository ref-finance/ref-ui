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
import { OverviewData } from '../../pages/Overview';
import { formatWithCommas_usd } from '../../services/overview/utils';
export default function TotalPanel() {
  const {
    netWorth,
    netWorthDone,
    claimable,
    claimableDone,
    wallet_assets_value,
    wallet_assets_value_done,
    burrow_borrowied_value,
    burrow_done,
  } = useContext(OverviewData);
  return (
    <div className="flex items-stretch justify-between px-2">
      <div className="flex flex-col">
        <div className="flex items-center text-sm text-primaryText">
          Net Worth
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-for="netWorthId"
            data-place="top"
            data-html={true}
            data-tip={'hello kity'}
          >
            <QuestionMark></QuestionMark>
            <ReactTooltip
              id="netWorthId"
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
        <span className="text-white text-2xl gotham_bold mt-0.5">
          {formatWithCommas_usd(netWorth)}
        </span>
      </div>
      <div className="flex items-center gap-12">
        <div className="flex flex-col h-full justify-between">
          <span className="text-sm text-primaryText">Claimable</span>
          <span className="text-base gotham_bold text-portfolioQinColor">
            {formatWithCommas_usd(claimable)}
          </span>
        </div>
        <div className="flex flex-col h-full justify-between">
          <span className="text-sm text-primaryText">Total Debts</span>
          <span className="text-base gotham_bold text-overviewBurrowRedColor">
            -{formatWithCommas_usd(burrow_borrowied_value)}
          </span>
        </div>
        <div className="flex flex-col h-full justify-between">
          <span className="text-sm text-primaryText">Wallet Assets</span>
          <span className="text-base gotham_bold text-white">
            {formatWithCommas_usd(wallet_assets_value)}
          </span>
        </div>
      </div>
    </div>
  );
}
