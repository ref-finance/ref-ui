import React, { useState, useEffect } from 'react';
import { isMobile } from '../../utils/device';
import {
  CountdownFinish,
  CountdownLeftBg,
  CountdownLeftMobileBg,
  CountdownRightBottomBg,
  CountdownTitle,
} from './icons';

const formatNumber = (number) => (number < 10 ? `0${number}` : number);
const Countdown = () => {
  const [days, setDays] = useState('0');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [countdownFinished, setCountdownFinished] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let year = now.getFullYear();
      const targetDate = new Date(year, 5, 1);
      if (now > targetDate) {
        year++;
        targetDate.setFullYear(year);
      }
      const difference = targetDate.getTime() - now.getTime();
      if (difference <= 0) {
        clearInterval(timer);
        setCountdownFinished(true);
        return;
      }
      const days = formatNumber(Math.floor(difference / (1000 * 60 * 60 * 24)));
      const hours = formatNumber(
        Math.floor((difference / (1000 * 60 * 60)) % 24)
      );
      const minutes = formatNumber(Math.floor((difference / 1000 / 60) % 60));
      setDays(days);
      setHours(hours);
      setMinutes(minutes);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {countdownFinished ? (
        <div className="mt-12 xsm:mx-4">
          <CountdownFinish />
        </div>
      ) : (
        <div className="mt-12 bg-memeVoteBgColor border border-memeBorderColor rounded-2xl h-72 relative xsm:mx-4 xsm:h-full xsm:p-4">
          <div className="absolute left-0 bottom-0">
            <CountdownRightBottomBg />
          </div>
          <div className="absolute -right-1 top-0 xsm:hidden">
            <CountdownLeftBg />
          </div>
          <div className="lg:absolute left-24 top-14 flex flex-col justify-center items-center xsm:left-1 xsm:mt-8">
            <CountdownTitle className="xsm:transform xsm:scale-90" />
            <div className="flex justify-center items-center xsm:-mt-8">
              <div className="mt-4 gradient-text flex flex-col justify-center items-center">
                <h1>{days}</h1>
                <p className="text-primaryText text-sm xsm:-mt-4">Days</p>
              </div>
              <div className="text-white -mr-8 text-7xl xsm:text-6xl xsm:-mr-6 xsm:mt-5">
                ：
              </div>
              <div className="mt-4 gradient-text flex flex-col justify-center items-center">
                <h1>{hours}</h1>
                <p className="text-primaryText text-sm xsm:-mt-4">Hours</p>
              </div>
              <div className="text-white -mr-6 text-7xl xsm:text-6xl xsm:-mr-6 xsm:mt-5">
                ：
              </div>
              <div className="mt-4 gradient-text flex flex-col justify-center items-center">
                <h1>{minutes}</h1>
                <p className="text-primaryText text-sm xsm:-mt-4">Mins</p>
              </div>
            </div>
          </div>
          <div className="lg:hidden md:hidden ml-8">
            <CountdownLeftMobileBg className="transform scale-75" />
          </div>
        </div>
      )}
    </>
  );
};

export default Countdown;
