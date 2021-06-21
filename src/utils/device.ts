export const isMobile = (): Boolean => {
  return window.screen.width < 1024;
};

export const isPC = (): Boolean => {
  return window.screen.width >= 1024;
};
