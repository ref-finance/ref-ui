import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { REF_STABLE_SWAP_TAB_KEY } from '../../pages/stable/StableSwapPage';

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
      <div className="flex justify-between items-center w-full px-8">
        {radios.map((radio) => {
          return (
            <span
              className={`py-2 text-center text-base cursor-pointer w-full ${
                choose === radio ? ' text-white' : 'text-farmText'
              }`}
              key={radio}
              onClick={() => {
                setChoose(radio);
                onChange(radio);
              }}
            >
              {intl.formatMessage({ id: radio })}
            </span>
          );
        })}
      </div>
      <div className="border-b-2 border-black border-opacity-20 mb-10 mx-8 flex items-center">
        <div
          className={`w-full relative top-1 ${
            currentChoose === 'add_liquidity'
              ? 'border-b-4  rounded-2xl border-gradientFrom'
              : ''
          }`}
        ></div>

        <div
          className={`w-full relative top-1 ${
            currentChoose === 'remove_liquidity'
              ? 'border-b-4  rounded-2xl border-gradientFrom'
              : ''
          }`}
        ></div>
      </div>
    </>
  );
}
