import React from 'react';
import { isClientMobie } from 'src/utils/device';

export const PCView = ({ children }) => {
  if (isClientMobie()) return null;

  return children;
};

export const MobileView = ({ children }) => {
  if (!isClientMobie()) return null;

  return children;
};
