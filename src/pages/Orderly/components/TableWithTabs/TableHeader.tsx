import React, { useState, useEffect } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import { useIntl } from 'react-intl';
import { CheckSelector } from '../Common/Icons';
import {
  PortfolioTableColumns
} from '../../orderly/type';

export default function TableHeader({
  column,
  loading,
  sort,
  setSort
}: {
  loading: boolean;
  column: PortfolioTableColumns;
  sort: [string, 'asc' | 'dsc'];
  setSort: (s: [string, 'asc' | 'dsc']) => void;
}) {
  const { colSpan = 1, key, header, mobileHeaderKey, extras, list, icon, suffix, headerType, setSelect, select } = column;

  const [showSelector, setShowSelector] = useState<boolean>(false);

  const intl = useIntl();

  useEffect(() => {
    if (showSelector)
      document.addEventListener('click', () => {
        setShowSelector(false);
      });
  }, [showSelector]);

  return (
    <>
      <th className={`col-span-${colSpan} pb-2 flex items-center`}>
        <div
          className={`flex items-center relative text-left ${extras ? 'cursor-pointer' : ''}`}
          onClick={(e: any) => {
            if (extras?.includes('sort')) {
              if (sort[0] !== key) {
                setSort([key, 'asc'])
              } else {
                setSort([key, sort[1] === 'asc' ? 'dsc' : 'asc'])
              }
            }
            if (extras?.includes('select') || extras?.includes('radio')) {
              e.preventDefault();
              e.stopPropagation();
              setShowSelector(true);
            }
          }}
        >
          <span
            className="hidden md:flex lg:flex items-center"
            style={{ color: (sort[0] === key || showSelector) ? 'white' : '#7E8A93' }}
          >
            {icon && icon}
            <span
              className={`
                ml-2
                ${headerType === 'dashed' ? ' underline' : ''}
              `}
              style={{
                textDecorationStyle: headerType === 'dashed' ? 'dashed' : 'solid'
              }}
            >
              {header && intl.formatMessage({
                id: key,
                defaultMessage: header,
              })}
            </span>
          </span>
          {suffix && suffix}
          <span
            className="md:hidden lg:hidden flex"
            style={{ color: (sort[0] === key || showSelector) ? 'white' : '#7E8A93' }}
          >
            {icon && icon}
            <span className="ml-2">
              {header && intl.formatMessage({
                id: mobileHeaderKey ? mobileHeaderKey : key,
                defaultMessage: header,
              })}
            </span>
          </span>
          {(extras?.includes('sort') || extras?.includes('select') || extras?.includes('radio')) && (
            <MdArrowDropDown
              className={`
                ${(extras?.includes('sort') && (sort[0] === key && sort[1] === 'asc')) ? 'transform rotate-180' : ''}
              `}
              style={{ flex: '0 0 22px' }}
              size={22}
              color={(sort[0] === key || showSelector) ? 'white' : '#7E8A93'}
            />
          )}

          {showSelector && (
            <div className="absolute top-full z-50">
              <div
                className={`flex flex-col min-w-28 items-start py-2 px-1.5 rounded-lg border border-borderC text-sm  bg-darkBg `}
              >
                {list.map((item, index) => {
                  return (
                    <div
                      className={`whitespace-nowrap flex items-center justify-between cursor-pointer min-w-fit my-0.5 text-left px-1 py-1 w-full rounded-md ${
                        item.className
                      } ${
                        (extras?.includes('select') && select === item.textId) ? 'bg-symbolHover2' : ''
                      } ${extras?.includes('select') ? 'hover:bg-symbolHover2' : ''} `}
                      key={item.textId + index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelect(item.textId);
                        setShowSelector(false);
                      }}
                    >
                      {extras?.includes('radio') && (
                        <div className="mr-2 border border-baseGreen bg-symbolHover2 border-solid w-3 h-3 rounded-full">
                          {select === item.textId && <div className="w-2 h-2 bg-baseGreen rounded-full m-px" />}
                        </div>
                      )}
                      <span className="whitespace-nowrap pr-2">{item.text}</span>
                      {(extras?.includes('select') && select === item.textId)&& <CheckSelector />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </th>
    </>
  );
}