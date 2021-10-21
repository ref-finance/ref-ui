import React, { PropsWithChildren } from 'react';

export function Card(
  props: PropsWithChildren<{ className?: string }> &
    React.HTMLAttributes<HTMLDivElement> & {
      width?: string;
      padding?: string | number;
      bgcolor?: string;
    }
) {
  const { width, padding, bgcolor } = props;

  return (
    <div
      {...props}
      className={`${bgcolor ? bgcolor : 'bg-cardBg'} rounded-xl ${
        padding ? padding : 'p-6'
      } ${width ? width : 'w-1/4'} ${props.className}`}
    >
      {props.children}
    </div>
  );
}
