import React from 'react';
import { BeatLoader, ClipLoader } from 'react-spinners';
import Loader from 'react-spinners/ClipLoader';
// import { Loading } from 'src/components/icon/Loading';
import { Loading, RefreshTrangle } from './../icon/Loading';

export default function () {
  return <Loading />;
}

export const BeatLoading = ({ color }: { color?: string }) => {
  return <BeatLoader size={5} color={color || '#ffffff'} />;
};
export const ClipLoadering = () => {
  return <ClipLoader color="#ffffff" />;
};

export const BlueCircleLoading = (props: any) => {
  const { className } = props;
  return (
    <svg
      className={`rotateInfinite ${className}`}
      width="60px"
      height="60px"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
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
  );
};
