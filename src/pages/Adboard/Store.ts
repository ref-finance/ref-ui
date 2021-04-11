import { atom } from "recoil";

export const drawboardModalState = atom({
  key: "drawboardModalState",
  default: { showModal: false, frameId: -1, frameData: [] },
});

export const buyModalState = atom({
  key: "buyModalState",
  default: { showModal: false, frameId: -1, price: -1, availableTokens: new Set<string>() },
});

export const adboardState = atom({
  key: "adboardState",
  default: { metadata: [], frameData: [] },
});

export const availableWhitelistedTokenState = atom({
  key: "availableWhitelistedTokenState",
  default: new Set<string>(),
});



