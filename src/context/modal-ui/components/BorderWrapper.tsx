import React from 'react';

export const GradientWrapper = (
  Props: any & {
    className?: string;
    reverse?: boolean;
  }
) => {
  const { className, reverse } = Props;

  return (
    <div
      className={` ${
        reverse ? 'bg-grayBoderGradientReverse' : 'bg-grayBoderGradient'
      } ${className} p-0.5`}
    >
      {Props.children}
    </div>
  );
};
