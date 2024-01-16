import React, { useState, useEffect, useRef } from 'react';
import { openUrl } from '../services/commonV3';
import Overview from '../components/meme/Overview';
import ProgressBar from '../components/meme/ProgressBar';
import TokenList from '../components/meme/TokenList';
import WithdrawList from '../components/meme/WithdrawList';
import StakeModal from '../components/meme/StakeModal';
import Banner from '../components/meme/Banner';

export default function MemePage() {
  return (
    <div className="-mt-12">
      <Banner />
      <div
        className="m-auto lg:w-5/6"
        style={{ maxWidth: '1100px', marginTop: '-55px' }}
      >
        <Overview />
        <ProgressBar />
        <TokenList />
        <WithdrawList />
      </div>
      <StakeModal />
    </div>
  );
}
