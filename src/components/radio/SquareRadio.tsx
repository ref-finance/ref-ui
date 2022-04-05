import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { REF_STABLE_SWAP_TAB_KEY } from '~pages/stable/StableSwapPage';

export default function SquareRadio({
  radios,
  onChange,
  currentChoose,
}: {
  radios: string[];
  onChange: (chooseModule: string) => void;
  currentChoose: string;
}) {
  const [choose, setChoose] = useState(
    currentChoose || localStorage.getItem(REF_STABLE_SWAP_TAB_KEY) || radios[0]
  );
  const intl = useIntl();
  return (
    <>
      <div className="flex justify-between bg-cardBg rounded p-1 mb-2.5 lg:hidden">
        {radios.map((radio) => {
          return (
            <div
              className={`flex items-center py-1.5 px-3 text-center text-xs rounded cursor-pointer ${
                choose === radio
                  ? ' bg-stableTab text-white '
                  : ' text-primaryText'
              }`}
              key={radio}
              onClick={() => {
                setChoose(radio);
                localStorage.setItem(REF_STABLE_SWAP_TAB_KEY, radio);
                onChange(radio);
              }}
            >
              {intl.formatMessage({ id: radio })}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between  lg:mx-12 xs:hidden md:hidden">
        {radios.map((radio) => {
          return (
            <div
              className={`py-4 px-6 text-center text-sm rounded-tr-lg rounded-tl-lg cursor-pointer ${
                choose === radio
                  ? ' bg-cardBg text-white '
                  : ' text-primaryText'
              }`}
              key={radio}
              onClick={() => {
                setChoose(radio);
                localStorage.setItem(REF_STABLE_SWAP_TAB_KEY, radio);
                onChange(radio);
              }}
            >
              {intl.formatMessage({ id: radio })}
            </div>
          );
        })}
      </div>
    </>
  );
}
