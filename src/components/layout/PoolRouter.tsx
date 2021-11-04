import React from 'react';
import { Link } from 'react-router-dom';

export const PoolRouter = (
  props: React.HTMLAttributes<HTMLAnchorElement> & {
    pathname: string;
    located: boolean;
    state?: { [stateName: string]: any };
    className?: string;
  }
) => {
  const { pathname, located, state, className } = props;

  return (
    <Link
      to={{
        pathname,
        state,
      }}
      className={`text-gray-400 text-xs hover:text-white ${
        located ? 'text-white' : ''
      } ${className}`}
    >
      {props.children}
    </Link>
  );
};
