import React from 'react';
import * as IconSets from './icons';

export type IconName = keyof typeof IconSets;

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
