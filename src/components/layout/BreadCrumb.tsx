import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

interface Route {
  id: string;
  msg: string;
  pathname: string;
  state?: {
    [stateName: string]: any;
  };
}

interface BreadCrumbProps {
  routes: Route[];
}

export const BreadCrumb = ({ routes }: BreadCrumbProps) => {
  const Separator = () => {
    return <span className="px-2">{'>'}</span>;
  };

  return (
    <div className="text-xs inline-flex items-center mb-4">
      {routes.map((route, index) => {
        const { pathname, id, msg, state } = route;
        if (state && !state?.fromMorePools) return <div key={index}></div>;
        if (index === routes.length - 1) {
          return (
            <div
              className="inline-flex items-center text-white cursor-pointer"
              key={index}
            >
              {index !== 0 && <Separator />}
              <span>
                <FormattedMessage id={id} defaultMessage={msg} />
              </span>
            </div>
          );
        } else {
          return (
            <div
              className="inline-flex items-center text-gray-400 hover:text-white"
              key={index}
            >
              {index !== 0 && <Separator />}
              <Link
                to={{
                  pathname,
                  state,
                }}
              >
                <span>
                  <FormattedMessage id={id} defaultMessage={msg} />
                </span>
              </Link>
            </div>
          );
        }
      })}
    </div>
  );
};
