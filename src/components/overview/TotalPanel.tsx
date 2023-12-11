import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import QuestionMark from 'src/components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { OverviewData } from '../../pages/Overview';
import { formatWithCommas_usd } from '../../services/overview/utils';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
export default function TotalPanel() {
  const intl = useIntl();
  const { is_mobile } = useContext(OverviewData);
  const netWorthTip = `<div class="text-navHighLightText text-xs text-left w-64 xsm:w-52">${intl.formatMessage(
    { id: 'netWorthTip' }
  )}</div>`;
  return (
    <>
      {is_mobile ? (
        <TotalPanelMobile netWorthTip={netWorthTip}></TotalPanelMobile>
      ) : (
        <TotalPanelPc netWorthTip={netWorthTip}></TotalPanelPc>
      )}
    </>
  );
}

function TotalPanelPc(props: any) {
  const { netWorthTip } = props;
  const {
    netWorth,
    claimable,
    wallet_assets_value,
    burrow_borrowied_value,
    accountId,
  } = useContext(OverviewData);
  return (
    <div className="flex items-stretch justify-between px-2">
      <div className="flex flex-col">
        <div className="flex items-center text-sm text-primaryText">
          <FormattedMessage id="NetWorth" />
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-tooltip-id="netWorthId"
            data-place="top"
            data-tooltip-html={netWorthTip}
          >
            <QuestionMark></QuestionMark>
            <CustomTooltip id="netWorthId" />
          </div>
        </div>
        <span className="text-white text-2xl gotham_bold mt-0.5">
          {formatWithCommas_usd(netWorth)}
        </span>
      </div>
      <div className="flex items-center gap-12">
        <div className="flex flex-col h-full justify-between">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="Claimable" />
          </span>
          <span
            className={`text-base gotham_bold ${
              accountId ? 'text-white' : 'text-overviewGreyColor'
            }`}
          >
            {formatWithCommas_usd(claimable)}
          </span>
        </div>
        <div className="flex flex-col h-full justify-between">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="TotalDebts" />
          </span>
          <span
            className={`text-base gotham_bold ${
              accountId
                ? 'text-overviewBurrowRedColor'
                : 'text-overviewGreyColor'
            }`}
          >
            -{formatWithCommas_usd(burrow_borrowied_value)}
          </span>
        </div>
        <div className="flex flex-col h-full justify-between">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="WalletAssets" />
          </span>
          <span
            className={`text-base gotham_bold ${
              accountId ? 'text-white' : 'text-overviewGreyColor'
            }
 `}
          >
            {formatWithCommas_usd(wallet_assets_value)}
          </span>
        </div>
      </div>
    </div>
  );
}
function TotalPanelMobile(props: any) {
  const { netWorthTip } = props;
  const {
    netWorth,
    claimable,
    wallet_assets_value,
    burrow_borrowied_value,
    accountId,
  } = useContext(OverviewData);
  return (
    <div className="px-4">
      <div className="flex flex-col">
        <div className="flex items-center text-sm text-primaryText">
          <FormattedMessage id="NetWorth" />
          <div
            className="text-white text-right ml-1"
            data-class="reactTip"
            data-tooltip-id="netWorthId"
            data-place="top"
            data-tooltip-html={netWorthTip}
          >
            <QuestionMark></QuestionMark>
            <CustomTooltip id="netWorthId" />
          </div>
        </div>
        <span className="text-white text-2xl gotham_bold">
          {formatWithCommas_usd(netWorth)}
        </span>
      </div>
      <div className="grid grid-cols-2 mb-5 mt-6">
        <div className="flex flex-col h-full justify-between">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="Claimable" />
          </span>
          <span
            className={`text-base gotham_bold ${
              accountId ? 'text-white' : 'text-overviewGreyColor'
            }
`}
          >
            {formatWithCommas_usd(claimable)}
          </span>
        </div>
        <div className="flex flex-col h-full justify-between">
          <span className="text-sm text-primaryText">
            <FormattedMessage id="WalletAssets" />
          </span>
          <span
            className={`text-base gotham_bold ${
              accountId ? 'text-white' : 'text-overviewGreyColor'
            }`}
          >
            {formatWithCommas_usd(wallet_assets_value)}
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-primaryText">
          <FormattedMessage id="TotalDebts" />
        </span>
        <span
          className={`text-base gotham_bold ${
            accountId ? 'text-overviewBurrowRedColor' : 'text-overviewGreyColor'
          }`}
        >
          -{formatWithCommas_usd(burrow_borrowied_value)}
        </span>
      </div>
    </div>
  );
}
