import USDC_SVG from "~assets/coins/usdc.svg";
import USDT_SVG from "~assets/coins/usdt.svg";
import NEAR_SVG from "~assets/coins/near.svg";

export const NEAR_COIN: CoinForSwap = {
  name: "Near Protocol",
  id: "near",
  acronym: "NEAR",
  SVG: NEAR_SVG,
  tokenId: "0x1",
};

export const USDT_COIN: CoinForSwap = {
  name: "Tether",
  id: "tether",
  acronym: "USDT",
  SVG: USDT_SVG,
  tokenId: "0x2",
};

export const USDC_COIN: CoinForSwap = {
  name: "USD Coin",
  id: "usdc",
  acronym: "USDC",
  SVG: USDC_SVG,
  tokenId: "0x3",
};

export const DEFAULT_COIN_LIST = [NEAR_COIN, USDT_COIN, USDC_COIN];
