import React from 'react';
import Loader from 'react-spinners/ClipLoader';
// import { Loading } from '~components/icon/Loading';
import { Loading } from './../icon/Loading';

export default function () {
  return <Loading />;
}

export function ChartLoading() {
  return <Loader color="#10B981" css="display: block; margin: auto" />;
}
