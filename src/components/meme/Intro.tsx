import React, { useEffect, useState, useRef } from 'react';
import { CloseIconWithCircle } from '../../components/icon/Actions';
import { introCurrentPageStore } from '../../stores/introCurrentPage';

function Intro({
  top,
  left,
  children,
}: {
  top: number | string;
  left: number | string;
  children?: any;
}) {
  const { setCurrentPage, currentPage } = introCurrentPageStore() as any;
  const modalContentArray = [
    {
      content: (
        <p className="font-normal">
          <span className="font-gothamBold pr-1">Stake</span>
          xREF to help your favorite MemeToken earn higher farming yields, While
          also receiving rewards from the Meme community.
        </p>
      ),
      title: 'Vote By xRef',
    },
    {
      content: (
        <p className="font-normal">
          <span className="font-gothamBold pr-1">Donate </span>
          your MemeToken to stakers of xRef, attracting more xRef holders to
          stake their xRef into that MemeToken.
        </p>
      ),
      title: 'Show Love For Voters',
    },
    {
      content: (
        <p className="font-normal">
          <span className="font-gothamBold pr-1">Stake</span>
          your MemeToken to help your favorite MemeToken earn higher farming
          yields.
        </p>
      ),
      title: '',
    },
    {
      content: (
        <p className="font-normal">
          Your staked MemeTokens will be displayed here.
        </p>
      ),
      title: '',
    },
    {
      content: (
        <p className="font-normal">
          Unstaking requires a 5-day wait.Click
          <span className="font-gothamBold px-1">{`'withdraw'`}</span> at the
          bottom of the page after this period to reclaim your MemeToken.
        </p>
      ),
      title: '',
    },
  ];

  const total = modalContentArray.length;

  const pageChange = (key) => {
    if (key == 'minus' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (key == 'add' && currentPage < total) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderTourContent = () => {
    return (
      <>
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: '100vw',
            background: 'rgba(0,0,0,.8)',
            zIndex: 100,
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            zIndex: 103,
            top: `${top + 'px'}`,
            left: ` ${left + 'px'}`,
          }}
        >
          {/* title */}
          <h2 className=" font-gothamBold text-white mb-2 text-xl text-left">
            {modalContentArray[currentPage - 1].title}
          </h2>
          {/* main modal content */}
          <div
            className="bg-greenLight font-gotham text-base text-black p-3 rounded-2xl cursor-default relative text-left"
            style={{ width: '343px' }}
          >
            {modalContentArray.map(
              (item, index) =>
                index + 1 == currentPage && (
                  <div key={'content' + index} className="">
                    {item.content}
                  </div>
                )
            )}
            {/* pagination */}
            <div className="flex justify-end font-gothamBold text-sm cursor-pointer mt-2">
              {currentPage > 1 && (
                <span
                  className="mx-2 hover:opacity-50"
                  onClick={() => pageChange('minus')}
                >
                  &lt; Pre
                </span>
              )}
              {currentPage < modalContentArray.length &&
                modalContentArray.length > 1 && (
                  <span
                    className="mx-2 hover:opacity-50"
                    onClick={() => pageChange('add')}
                  >
                    Next &gt;
                  </span>
                )}
              {currentPage == modalContentArray.length && (
                <span
                  className="mx-2 hover:opacity-50"
                  onClick={() => {
                    localStorage.setItem('hasGuided', 'true');
                    setCurrentPage(0);
                  }}
                >
                  got it!
                </span>
              )}
            </div>

            {/*dashed line */}
            <div
              className="absolute"
              style={{
                width: '1px',
                height: '69px',
                bottom: '-69px',
                border: '1px dashed #00D6AF',
                right: currentPage == 2 ? '100px' : '300px',
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#00D6AF',
                  boxShadow: '0px 0px 0px 4px rgba(255, 255, 255, 0.1)',
                  position: 'absolute',
                  bottom: '-7px',
                  left: '-7px',
                }}
              ></div>
            </div>
          </div>
          {/* close */}
          <div
            onClick={() => {
              localStorage.setItem('hasGuided', 'true');
              setCurrentPage(0);
            }}
            className="flex justify-end items-center mt-2 mx-3 cursor-pointer text-white text-sm hover:opacity-80"
          >
            <span className="mr-2">Close</span>
            <CloseIconWithCircle></CloseIconWithCircle>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            zIndex: 102,
            top: 0,
            left: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              zIndex: 103,
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          ></div>
          {children}
        </div>
      </>
      // </Modal>
    );
  };
  return renderTourContent();
}

export { Intro };
