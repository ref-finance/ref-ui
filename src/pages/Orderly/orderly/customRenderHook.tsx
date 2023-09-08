import React from 'react';

export const RefDEXLogo = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="25.9459" height="25.9459" rx="8" fill="#031521" />
    <path d="M15.4199 20.4362H21.0809L15.4199 14.7752V20.4362Z" fill="white" />
    <path
      d="M21.0806 4.865L17.7783 4.865L21.0806 8.16722L21.0806 4.865Z"
      fill="#00C6A2"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.6552 14.774C15.5756 14.774 15.4965 14.7719 15.418 14.7678V11.2243L19.272 7.64552C19.8157 8.3872 20.1368 9.30229 20.1368 10.2924C20.1368 12.7675 18.1303 14.774 15.6552 14.774ZM18.2654 6.64896L15.418 9.293V5.81697C15.4965 5.81287 15.5756 5.8108 15.6552 5.8108C16.629 5.8108 17.5303 6.12141 18.2654 6.64896Z"
      fill="white"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.9474 5.81337H10.7017V10.0025L12.6068 11.9077L14.9474 9.73433V5.81337ZM14.9474 11.6656L12.5705 13.8727L10.7017 12.0039V20.4375H14.9474V11.6656Z"
      fill="white"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.2306 5.81337H5.51318V11.8896L9.05135 8.3514L10.2306 9.53069V5.81337ZM10.2306 11.5321L9.05135 10.3528L5.51318 13.891V20.4375H10.2306V11.5321Z"
      fill="white"
    />
  </svg>
);

export const WoofiDEXLogo = () => <div className="woofidex-logo" />;

export const useDEXLogoRender = () => {
  const renderLogo = (dex: string) => {
    if (dex === 'WOOFi DEX') {
      return <WoofiDEXLogo />;
    }

    if (dex === 'REF DEX') {
      return <RefDEXLogo />;
    }
  };

  return {
    renderLogo,
  };
};
