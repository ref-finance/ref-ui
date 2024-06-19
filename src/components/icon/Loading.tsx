import React from 'react';

const bgGridSmallImg = 'https://i.postimg.cc/43xZN5zd/bg-image2.png';

export function LoadingSmall() {
  return (
    <div className="slick-loader-new active">
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
  );
}

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

export const RefreshTrangle = () => {
  return (
    <svg
      width="5"
      height="6"
      viewBox="0 0 5 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.5 2.13398C5.16667 2.51888 5.16667 3.48113 4.5 3.86603L1.5 5.59808C0.833333 5.98298 1.92632e-07 5.50185 2.26281e-07 4.73205L3.77702e-07 1.26795C4.11351e-07 0.498148 0.833334 0.0170236 1.5 0.401924L4.5 2.13398Z"
        fill="#00C6A2"
      />
    </svg>
  );
};
