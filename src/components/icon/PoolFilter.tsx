import React from 'react';

const DarkFilterIcon = () => {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="1"
        y1="1"
        x2="13"
        y2="1"
        stroke="#73818B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="5"
        x2="11"
        y2="5"
        stroke="#73818B"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="9"
        x2="9"
        y2="9"
        stroke="#73818B"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const LightFilterIcon = () => {
  return (
    <svg
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="1"
        y1="1"
        x2="13"
        y2="1"
        stroke="#00C6A2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="5"
        x2="11"
        y2="5"
        stroke="#00C6A2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="5"
        y1="9"
        x2="9"
        y2="9"
        stroke="#00C6A2"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const FilterIcon = ({ onShow }: { onShow: boolean }) => {
  return onShow ? <LightFilterIcon /> : <DarkFilterIcon />;
};
