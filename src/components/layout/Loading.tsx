import React from 'react';
import { BeatLoader } from 'react-spinners';
import Loader from 'react-spinners/ClipLoader';
// import { Loading } from '~components/icon/Loading';
import { Loading, RefreshTrangle } from './../icon/Loading';

export default function () {
  return <Loading />;
}

export const BeatLoading = () => {
  return <BeatLoader size={5} color="#ffffff" />;
};
