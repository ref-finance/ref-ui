import React, { useState } from 'react';
import {
  DragonTail,
  DragonHead,
  LonkTail,
  LonkHead,
  NekoTail,
  NekoHead,
  LonkBody,
} from './icons';

const ProgressBar = () => {
  return (
    <div className="text-white" style={{ marginTop: '80px' }}>
      <div className="flex items-center justify-center">
        <span className="text-3xl gotham_bold text-white">
          MEME Gauge Weight
        </span>
      </div>
      {/* Race */}
      <RaceTemplate>
        {/* <div className="flex" style={{ transform: 'translateY(110px)' }}>
          <DragonTail className="relative" />
          <div className="dragIcon relative"></div>
          <DragonHead className="relative" style={{ top: '-50px' }} />
        </div> */}
      </RaceTemplate>
      <RaceTemplate>
        <div className="flex" style={{ transform: 'translateY(110px)' }}>
          <LonkTail />
          {/* <div className="LonkIcon relative" style={{top:'-1px'}}></div> */}
          <div style={{ width: '0' }} className=" overflow-hidden">
            <LonkBody />
          </div>
          <LonkHead className="relative" style={{ top: '-35px' }} />
        </div>
      </RaceTemplate>
      {/* <RaceTemplate>
        <div className="flex" style={{ transform: 'translateY(110px)' }}>
          <NekoTail />
          <div className="NekoIcon relative" style={{top:'-1px'}}></div>
          <NekoHead className="relative" style={{ top: '-35px' }} />
        </div>
      </RaceTemplate> */}
    </div>
  );
};

function RaceTemplate({ children }: any) {
  return (
    <div
      className="border-b border-greenLight border-opacity-10"
      style={{ height: '166px' }}
    >
      {children}
    </div>
  );
}
export default ProgressBar;
