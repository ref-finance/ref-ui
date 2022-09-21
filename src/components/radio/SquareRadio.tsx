import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { NEARX_POOL_ID } from '../../services/near';

export default function SquareRadio({
  radios,
  onChange,
  currentChoose,
  poolId,
}: {
  radios: string[];
  onChange: (chooseModule: string) => void;
  currentChoose: string;
  poolId: string | number;
}) {
  const [choose, setChoose] = useState(currentChoose || radios[0]);
  const intl = useIntl();
  return (
    <>
      <div className="flex justify-between items-center w-full px-8">
        {radios.map((radio) => {
          return (
            <span
              className={`py-2 text-center text-base cursor-pointer ${
                Number(poolId) === Number(NEARX_POOL_ID) &&
                radio === 'add_liquidity'
                  ? 'cursor-not-allowed'
                  : ''
              } w-full ${choose === radio ? ' text-white' : 'text-farmText'}`}
              key={radio}
              onClick={() => {
                if (
                  Number(poolId) === Number(NEARX_POOL_ID) &&
                  radio === 'add_liquidity'
                ) {
                  return;
                }
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
