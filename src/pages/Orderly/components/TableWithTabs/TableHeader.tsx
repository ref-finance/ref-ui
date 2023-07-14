import React, { useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import { useIntl } from 'react-intl';
import { FlexRow } from '../Common';
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
  const [select, setSelect] = useState<any>('')
  const [showSideSelector, setShowSideSelector] = useState<boolean>(false);

  const intl = useIntl();

  const { colSpan = 1, key, header, mobileHeaderKey, extras, list } = column

  return (
    <>
      <th className={`col-span-${colSpan}`}>
        <FlexRow
          className={`relative ${extras ? 'cursor-pointer' : ''}`}
          onClick={() => {
            if (extras?.includes('sort')) {
              if (sort[0] !== key) {
                setSort([key, 'asc'])
              } else {
                setSort([key, sort[1] === 'asc' ? 'dsc' : 'asc'])
              }
            }
            if (extras?.includes('select')) {
              setShowSideSelector(true);
            }
          }}
        >
          <span
            className="hidden md:block lg:block"
            style={{ color: (sort[0] === key || showSideSelector) ? 'white' : '#7E8A93' }}
          >
            {select ?
              intl.formatMessage({
                id: select,
                defaultMessage: select,
              }) : intl.formatMessage({
                id: key,
                defaultMessage: header,
              })
            }
          </span>
          <span
            className="md:hidden lg:hidden"
            style={{ color: (sort[0] === key || showSideSelector) ? 'white' : '#7E8A93' }}
          >
            {select ?
              intl.formatMessage({
                id: select,
                defaultMessage: select,
              }) : intl.formatMessage({
                id: mobileHeaderKey ? mobileHeaderKey : key,
                defaultMessage: header,
              })
            }
          </span>
          {(extras?.includes('sort') || extras?.includes('select')) && (
            <MdArrowDropDown
              className={`
                ${(extras?.includes('sort') && (sort[0] === key && sort[1] === 'asc')) ? 'transform rotate-180' : ''}
              `}
              style={{ flex: '0 0 22px' }}
              size={22}
              color={(sort[0] === key || showSideSelector) ? 'white' : '#7E8A93'}
            />
          )}

          {showSideSelector && (

            <div className="absolute top-6 z-50">
              <div
                className={`flex flex-col min-w-28 items-start py-2 px-1.5 rounded-lg border border-borderC text-sm  bg-darkBg `}
              >
                {list.map((item, index) => {
                  return (
                    <div
                      className={`whitespace-nowrap flex items-center justify-between cursor-pointer min-w-fit my-0.5 text-left px-1 py-1 w-full rounded-md ${
                        item.className
                      } ${
                        select === item.textId ? 'bg-symbolHover2' : ''
                      } hover:bg-symbolHover2 `}
                      key={item.textId + index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelect(item.textId);
                        setShowSideSelector(false);
                      }}
                    >
                      <span className="whitespace-nowrap pr-2">{item.text}</span>
                      {select === item.textId && <CheckSelector />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </FlexRow>

      </th>
    </>
  );
}