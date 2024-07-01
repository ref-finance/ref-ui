import React, { lazy } from 'react';

export type IconName = keyof typeof IconSets;

const IconSets = {
  IconArrowDown: lazy(() => import('./../assets/arrow-down.svg')),
  IconClose: lazy(() => import('./../assets/close.svg')),
  IconDisconnect: lazy(() => import('./../assets/disconnect.svg')),
  IconExchange: lazy(() => import('./../assets/exchange.svg')),
  IconExport: lazy(() => import('./../assets/export.svg')),
  IconInfo: lazy(() => import('./../assets/info.svg')),
  IconLine: lazy(() => import('./../assets/line.svg')),
  IconRefresh: lazy(() => import('./../assets/refresh.svg')),
  IconSearch: lazy(() => import('./../assets/search.svg')),
  IconSetting: lazy(() => import('./../assets/setting.svg')),
  IconSuccess: lazy(() => import('./../assets/success.svg')),
  IconSuccessCircle: lazy(() => import('./../assets/success-circle.svg')),
  IconWaiting: lazy(() => import('./../assets/waiting.svg')),
  IconWarning: lazy(() => import('./../assets/warning.svg')),
  IconChainEthereum: lazy(() => import('./../assets/chain-ethereum.svg')),
  IconChainNear: lazy(() => import('./../assets/chain-near.svg')),
  IconDirection: lazy(() => import('./../assets/direction.svg')),
  IconLoading: lazy(() => import('./../assets/loading.svg')),
  IconEmpty: lazy(() => import('./../assets/empty.svg')),
  IconErrorCircleFill: lazy(() => import('./../assets/error-circle-fill.svg')),
  IconSuccessCircleFill: lazy(
    () => import('./../assets/success-circle-fill.svg')
  ),
};

export default function SvgIcon({
  name,
  ...props
}: {
  name: IconName;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = IconSets[name];
  return <Icon {...props} style={{ width: '1em', height: '1em' }} />;
}
