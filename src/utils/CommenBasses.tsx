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
    id: number;
  };
} = {
  '1': {
    icon: BANANA_URL,
    name: 'Banana',
    id: 1,
  },
  '2': {
    icon: USDC,
    name: 'Usdc',
    id: 2,
  },
  '3': {
    icon: USDT,
    name: 'Usdt',
    id: 3,
  },
  '4': {
    icon: BANANA_URL,
    name: 'Banana',
    id: 4,
  },
  '5': {
    icon: DAI,
    name: 'Dai',
    id: 5,
  },
  '6': {
    icon: PARAS,
    name: 'Paras',
    id: 6,
  },
  '7': {
    icon: BANANA_URL,
    name: 'Banana',
    id: 7,
  },
  '8': {
    icon: REF,
    name: 'Ref',
    id: 8,
  },
};
