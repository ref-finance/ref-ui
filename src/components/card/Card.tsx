import React, { PropsWithChildren } from 'react';

export function Card(
  props: PropsWithChildren<{ className?: string }> &
    React.HTMLAttributes<HTMLDivElement> & {
      width?: string;
      padding?: string | number;
      bgColor?: string;
    }
) {
  const { width, padding, bgColor } = props;

  return (
    <div
      {...props}
      className={` ${bgColor ? bgColor : 'bg-gray-50'}  rounded-xl ${
        padding ? padding : 'p-6'
      } ${width ? width : 'w-1/4'} ${props.className}`}
    >
      {props.children}
    </div>
  );
}
