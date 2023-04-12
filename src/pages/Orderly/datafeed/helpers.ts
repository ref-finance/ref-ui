// Make requests to CryptoCompare API

import { getOrderlyConfig } from '../config';

export async function makePublicApiRequest(path: string) {
  try {
    const response = await fetch(
      `${getOrderlyConfig().OFF_CHAIN_END_POINT}/${path}`
    );
    return response.json();
  } catch {
    throw new Error(`Symbol request Error`);
  }
}

// Generate a symbol ID from a pair of the coins
export function generateSymbol(
  exchange: string,
  fromSymbol: string,
  toSymbol: string
) {
  const short = `${fromSymbol}/${toSymbol}`;
  return {
    short,
    full: `${exchange}:${short}`,
  };
}

export function parseFullSymbol(fullSymbol: string) {
  const symbolName = fullSymbol.split(':')[1];

  return {
    exchange: 'Orderly',
    fromSymbol: symbolName.split('/')[0],
    toSymbol: symbolName.split('/')[1],
  };
}

export function ResolutionToSeconds(resolution: string) {
  const min_time = 60;

  if (resolution.includes('D')) {
    return min_time * 60 * 24;
  } else if (resolution.includes('W')) {
    return min_time * 60 * 24 * 7;
  } else if (resolution.includes('H')) {
    return min_time * 60;
  }

  return min_time * Number(resolution);
}

export function parseResolution(resolution: string) {
  if (resolution.includes('D')) {
    return resolution.replace('D', 'd');
  } else if (resolution.includes('W')) {
    return resolution.replace('W', 'w');
  } else if (resolution.includes('H')) {
    return resolution.replace('H', 'h');
  }

  return resolution + 'm';
}
