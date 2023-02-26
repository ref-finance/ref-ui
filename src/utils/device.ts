import React, { useState, useEffect } from 'react';

export const isMobile = (): Boolean => {
  return window.screen.width <= 1023;
};

export const isPC = (): Boolean => {
  return window.screen.width > 1023;
};

export const isLargeScreen = (): Boolean => {
  return document.documentElement.clientWidth > 2160;
};

export const isClientMobie = (): Boolean => {
  return document.documentElement.clientWidth <= 1023;
};

export const useMobile = () => {
  const [mobileWindow, setMobileWindow] = useState<Boolean>(isMobile());

  const handleResize = () => setMobileWindow(isMobile());

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return mobileWindow;
};

export const useClientMobile = () => {
  const [mobileWindow, setMobileWindow] = useState<Boolean>(isClientMobie());

  const handleResize = () => setMobileWindow(isClientMobie());

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return mobileWindow;
};

export enum ExplorerType {
  Chrome = 'Chrome',
  Firefox = 'Firefox',
  Opera = 'Opera',
  Safari = 'Safari',
}

export const getExplorer = () => {
  const explorer = window.navigator.userAgent;
  if (explorer.indexOf('MSIE') >= 0) {
    return 'ie';
  } else if (explorer.indexOf('Firefox') >= 0) {
    return ExplorerType.Firefox;
  } else if (explorer.indexOf('Chrome') >= 0) {
    return ExplorerType.Chrome;
  } else if (explorer.indexOf('Opera') >= 0) {
    return ExplorerType.Opera;
  } else if (explorer.indexOf('Safari') >= 0) {
    return ExplorerType.Safari;
  }
};

export const isMobileExplorer = () =>
  /Mobi|Android|iPhone/i.test(window.navigator.userAgent);
