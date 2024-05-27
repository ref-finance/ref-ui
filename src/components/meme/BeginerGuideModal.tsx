import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import { CloseIconWithCircle } from '../../components/icon/Actions';
import { translate } from '@near-wallet-selector/core';
const GuidedTourContext = React.createContext(null);

function BeginerGuideProvider({ children }: { children: any }) {
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
          your meme token to stakers of xRef, attracting more xRef holders to
          stake their xRef into that MemeToken.
        </p>
      ),
      title: 'How show love for voters?',
    },
    {
      content: (
        <p className="font-normal">
          <span className="font-gothamBold pr-1">Stake</span>
          your meme token to help your favorite MemeToken earn higher farming
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
          <span className="font-gothamBold px-1">Withdraw</span> at the bottom
          of the page after this period to reclaim your MemeToken.
        </p>
      ),
      title: '',
    },
  ];

  const total = modalContentArray.length;
  const [currentStepRefDetail, setCurrentStepRefDetail] = useState(
    new Array(5)
  );
  const [getRef, setGetRef] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const pageChange = (key) => {
    if (key == 'minus' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (key == 'add' && currentPage < total) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    // currentStepRefDetail[currentPage - 1].ref.scrollIntoView({
    //   behavior: 'smooth',
    // });
    window.scrollTo({
      top: currentStepRefDetail[currentPage - 1].y,
      behavior: 'smooth', //
    });
  }, [currentPage]);

  // provider
  const onDataLoaded = (stepRef, index) => {
    const obj = {
      x: stepRef.getBoundingClientRect().left + window.scrollX,
      y: stepRef.getBoundingClientRect().top + window.scrollY,
      ref: stepRef,
    };
    console.log(
      stepRef.getBoundingClientRect().left,
      stepRef.getBoundingClientRect().top,
      window.scrollX,
      window.screenY
    );
    // setCurrentPage(index);
    const shadowCloneCurrentStepRefDetail = currentStepRefDetail;
    shadowCloneCurrentStepRefDetail[index - 1] = obj;
    setCurrentStepRefDetail(shadowCloneCurrentStepRefDetail);
    setGetRef(true);

    window.scrollTo({
      top: currentStepRefDetail[currentPage - 1].y,
      behavior: 'smooth', //
    });
    // window.scrollTo(
    //   currentStepRefDetail[currentPage - 1].x,
    //   currentStepRefDetail[currentPage - 1].y
    // );
  };

  const intervalRef = useRef(null);
  // useEffect(() => {
  //   //
  //   intervalRef.current = setInterval(updateModalHeight, 100); //

  //   return () => clearInterval(intervalRef.current);
  // }, []);

  // const [modalHeight, setModalHeight] = useState('100vh'); //

  // const updateModalHeight = () => {
  //   const docHeight = Math.max(
  //     document.body.scrollHeight,
  //     document.documentElement.scrollHeight,
  //     document.body.offsetHeight,
  //     document.documentElement.offsetHeight,
  //     document.body.clientHeight,
  //     document.documentElement.clientHeight
  //   );
  //   setModalHeight(`${docHeight}px`);
  // };

  const renderTourContent = () => {
    if (!getRef) return null;
    return (
      <>
        <div
          style={{
            position: 'absolute',
            zIndex: 101,
            top: `${currentStepRefDetail[currentPage - 1]?.y + 'px'}`,
            left: ` ${currentStepRefDetail[currentPage - 1]?.x + 'px'}`,
          }}
        >
          {/* title */}
          <h2 className=" font-gothamBold text-white mb-2 text-xl">
            {modalContentArray[currentPage - 1].title}
          </h2>
          {/* main modal content */}
          <div
            className="bg-greenLight font-gotham text-base text-black p-3 rounded-2xl cursor-default relative"
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
          <div className="flex justify-end items-center mt-2 mx-3 cursor-pointer text-white text-sm hover:opacity-80">
            <span className="mr-2">Close</span>
            <CloseIconWithCircle></CloseIconWithCircle>
          </div>
        </div>
      </>
      // </Modal>
    );
  };
  return (
    <GuidedTourContext.Provider value={{ pageChange, onDataLoaded }}>
      {getRef ? (
        <div
          style={{
            filter: 'blur(6px)',
          }}
        >
          {children}
        </div>
      ) : (
        children
      )}
      {renderTourContent()}
    </GuidedTourContext.Provider>
  );
}

export { BeginerGuideProvider, GuidedTourContext };
