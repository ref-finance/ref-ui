import React, { useState, useEffect } from 'react';

export const isMobile = (): Boolean => {
  return window.screen.width < 1024;
};

export const isPC = (): Boolean => {
  return window.screen.width >= 1024;
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
