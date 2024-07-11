import React, { useState, useEffect, useRef } from 'react';
import {
  LeftActive,
  LeftDisabled,
  RightActive,
  RightDisabled,
  Close,
} from './icon';
import { useOrderlyGuidePopStore } from '../../stores/orderlyGuidePop';

export const Carousel = ({
  list,
  autoPlay = true,
  autoPlayInterval = 5000,
}: {
  list: Array<any>;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const timerRef = useRef(null); //
  const orderlyGuidePopStore: any = useOrderlyGuidePopStore();

  const closePop = () => {
    localStorage.setItem('hasGo', 'true');
    orderlyGuidePopStore.setHasGo(true);
  };

  const blank = () => {
    window.open('https://airdrop.orderly.org/');
  };

  useEffect(() => {
    //
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    //
    if (autoPlay) {
      timerRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }

    //
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval]); //

  const goToPrev = () => {
    //
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    //
    if (autoPlay) {
      timerRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }
    setCurrentIndex((prevIndex) => (prevIndex + list.length - 1) % list.length);
  };

  const goToNext = () => {
    //
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (autoPlay) {
      timerRef.current = setInterval(() => {
        goToNext();
      }, autoPlayInterval);
    }
    setCurrentIndex((prevIndex) => (prevIndex + 1) % list.length);
  };

  return (
    <div
      className="relative frcc p-5 overflow-hidden rounded-2xl mb-12"
      ref={carouselRef}
      style={{
        zIndex: 999999999999,
        width: '350px',
        height: '553px',
        background: 'rgba(29, 41, 50, 1)',
        border: '1px solid rgba(151, 151, 151, 0.2)',
      }}
    >
      {/* close */}
      <span
        className="absolute top-8 right-8 cursor-pointer hover:opacity-70"
        style={{
          zIndex: 200,
        }}
        onClick={closePop}
      >
        <Close></Close>
      </span>
      {/* img container */}
      {list.map((item, index) => (
        <div
          key={index}
          style={{
            display: currentIndex === index ? 'block' : 'none',
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: currentIndex === index ? '318px' : '0',
            height: '179px',
          }}
        >
          {/* modal */}
          <div
            className="absolute top-0 left-0 rounded-lg"
            style={{
              width: '318px',
              height: '179px',
              background:
                'linear-gradient(289.98deg, rgba(0, 0, 0, 0) 6.59%, rgba(0, 214, 175, 0.2) 100%)',
            }}
          ></div>
          {/* img */}
          <img src={item.src} alt="" className="w-full h-full rounded-lg" />
        </div>
      ))}

      {/* content */}
      <div
        className="font-gotham font-medium rounded-lg p-5 absolute overflow-auto"
        style={{
          width: '318px',
          height: '272px',
          border: '1px solid rgba(145, 162, 174, 0.08)',
          top: '219px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <p className="text-lg text-white mb-5">{list[currentIndex].title}</p>
        <p className="text-gray2 text-sm">
          {list[currentIndex].content}
          <span
            className="underline cursor-pointer hover:text-greenLight"
            onClick={() => {
              closePop();
              window.open('https://airdrop.orderly.org/', '_blank');
            }}
          >
            https://airdrop.orderly.org
          </span>
        </p>
      </div>

      {/* operate div */}

      {list.length > 3 ? (
        <div
          className="absolute bottom-4 flex items-center justify-between"
          style={{ width: '318px' }}
        >
          {currentIndex == 0 ? (
            <LeftDisabled />
          ) : (
            <div onClick={goToPrev}>
              <LeftActive />
            </div>
          )}
          <div className="frcc">
            {list.map((item, index) => (
              <div
                key={index}
                style={{
                  width: '67px',
                  height: '38px',
                }}
                className={`rounded-lg mr-2 ${
                  currentIndex == index
                    ? 'border border-greenLight'
                    : 'opacity-40'
                }`}
                onClick={() => {
                  setCurrentIndex(index);
                }}
              >
                <img
                  src={item.src}
                  alt=""
                  className="w-full h-full rounded-lg"
                />
              </div>
            ))}
          </div>

          {currentIndex == list.length - 1 ? (
            <RightDisabled />
          ) : (
            <div onClick={goToNext}>
              <RightActive />
            </div>
          )}
        </div>
      ) : (
        <div
          className="frcc text-white text-sm absolute bottom-2 border border-borderColor rounded-lg cursor-pointer "
          style={{
            width: '318px',
            height: '38px',
          }}
          onClick={() => {
            closePop();
            blank();
          }}
        >
          Bind Now
        </div>
      )}
    </div>
  );
};
