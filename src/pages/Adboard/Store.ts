import { atom } from "recoil";

export const drawboardModalState = atom({
  key: "drawboardModalState",
  default: { showModal: false, frameId: -1, frameData: [] },
});

export const adboardState = atom({
  key: "adboardState",
  default: { metadata: [], frameData: [] },
});

export const availableWhitelistedTokenState = atom({
  key: "availableWhitelistedTokenState",
  default: new Set<string>(),
});



