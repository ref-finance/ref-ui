import React, { ReactNode } from 'react';
import { Eth, Usdc, Usdt, Banana, Dai } from './FarmData/icons';

const BANANA_URL = 'https://i.postimg.cc/v8xng8fH/image-47.png';
const DAI = 'https://i.postimg.cc/sDSKBj7p/Ellipse-101.png';
const USDC = 'https://i.postimg.cc/Hjff9B3B/Ellipse-104.png';
const USDT = 'https://i.postimg.cc/njWN5kxV/Ellipse-99.png';
const PARAS = 'https://i.postimg.cc/Mfjg8QZ7/Ellipse-102.png';
const REF = 'https://i.postimg.cc/dD7bCzRh/Ellipse-103.png';

export const CommenBassesConfig: {
  [key: string]: {
    icon: string;
    name: string;
  };
} = {
  '1': {
    icon: BANANA_URL,
    name: 'Banana',
  },
  '2': {
    icon: USDC,
    name: 'Usdc',
  },
  '3': {
    icon: USDT,
    name: 'Usdt',
  },
  '4': {
    icon: BANANA_URL,
    name: 'Banana',
  },
  '5': {
    icon: DAI,
    name: 'Dai',
  },
  '6': {
    icon: PARAS,
    name: 'Paras',
  },
  '7': {
    icon: BANANA_URL,
    name: 'Banana',
  },
  '8': {
    icon: REF,
    name: 'Ref',
  },
};
