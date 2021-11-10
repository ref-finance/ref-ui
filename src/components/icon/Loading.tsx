import React from 'react';

const bgGridSmallImg = 'https://i.postimg.cc/43xZN5zd/bg-image2.png';

export function Loading() {
  return (
    <div className="slick-loader active">
      <svg
        width="100px"
        height="100px"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        className="lds-eclipse"
        style={{ background: 'none' }}
      >
        {' '}
        <path
          ng-attr-d="{{config.pathCmd}}"
          ng-attr-fill="{{config.color}}"
          stroke="none"
          d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50"
          fill="#10B981"
        ></path>{' '}
      </svg>
    </div>
    // <div
    //   className="fixed loadingScreen"
    //   style={{
    //     top: 0,
    //     left: 0,
    //     width: '100%',
    //     height: '100%',
    //     backgroundColor: 'rgba(0,0,0,0.4)',
    //     opacity: 0,
    //     zIndex: -1,
    //     transition: 'all .5s',
    //     borderRadius: '6px',
    //   }}>
    // </div>
  );
}

export function ChartLoading() {
  return (
    <div className="inner-loader active">
      <svg
        width="50px"
        height="50px"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        className="lds-eclipse"
        style={{ background: 'none' }}
      >
        {' '}
        <path
          ng-attr-d="{{config.pathCmd}}"
          ng-attr-fill="{{config.color}}"
          stroke="none"
          d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50"
          fill="#10B981"
        ></path>{' '}
      </svg>
    </div>
  );
}
