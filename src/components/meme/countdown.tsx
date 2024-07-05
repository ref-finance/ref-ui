import React, { useState, useEffect } from 'react';
import { isMobile } from '../../utils/device';
import {
  CountdownFinish,
  CountdownFinishMobile,
  CountdownLeftBg,
  CountdownLeftMobileBg,
  CountdownMobileTitle,
  CountdownRightBottomBg,
  CountdownRightBottomMobileBg,
  CountdownTitle,
} from './icons';
import PropTypes from 'prop-types';

const formatNumber = (number) => (number < 10 ? `0${number}` : number);
const Countdown = ({ onCountdownFinish }) => {
  const [days, setDays] = useState('00');
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [countdownFinished, setCountdownFinished] = useState(false);
  useEffect(() => {
    const targetDate = new Date(Date.UTC(new Date().getUTCFullYear(), 6, 1));
    const endDate = new Date(Date.UTC(new Date().getUTCFullYear(), 6, 5));
    const updateCountdown = () => {
      const nowUtc = Date.now();
      if (nowUtc >= endDate.getTime()) {
        onCountdownFinish();
      } else if (nowUtc >= targetDate.getTime()) {
        setCountdownFinished(true);
      } else {
        const difference = targetDate.getTime() - nowUtc;
        const daysCalc = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hoursCalc = Math.floor((difference / (1000 * 60 * 60)) % 24);
        let minutesCalc = Math.floor((difference / 1000 / 60) % 60);
        if (daysCalc === 0 && hoursCalc === 0 && minutesCalc === 0) {
          minutesCalc = 1;
        }
        setDays(formatNumber(daysCalc));
        setHours(formatNumber(hoursCalc));
        setMinutes(formatNumber(minutesCalc));
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [onCountdownFinish]);
  return (
    <>
      {countdownFinished ? (
        <div className="mt-12 xsm:mx-4">
          <CountdownFinish className="xsm:hidden" />
          <CountdownFinishMobile className="lg:hidden" />
        </div>
      ) : (
        <div className="mt-12 bg-memeVoteBgColor border border-memeBorderColor rounded-2xl h-72 relative xsm:mx-4 xsm:h-full xsm:p-4 xsm:pb-10">
          <div className="absolute left-0 bottom-0 xsm:hidden">
            <CountdownRightBottomBg />
          </div>
          <div className="absolute left-0 bottom-0 lg:hidden">
            <CountdownRightBottomMobileBg />
          </div>
          <div className="absolute -right-1 top-0 xsm:hidden">
            <CountdownLeftBg style={{ height: '240px' }} />
          </div>
          <div className="lg:absolute left-24 top-14 flex flex-col justify-center items-center xsm:left-1 xsm:mt-4 xsm:mb-10">
            <CountdownTitle className="xsm:hidden" />
            <CountdownMobileTitle className="lg:hidden" />
            <div className="flex justify-center items-center xsm:-mt-7">
              <div className="mt-4 gradient-text flex flex-col justify-center items-center">
                <h1>{days}</h1>
                <p className="text-primaryText text-sm xsm:-mt-7">Days</p>
              </div>
              <div className="text-white -mr-8 text-7xl xsm:text-4xl xsm:-mr-3 xsm:mt-8">
                ：
              </div>
              <div className="mt-4 gradient-text flex flex-col justify-center items-center">
                <h1>{hours}</h1>
                <p className="text-primaryText text-sm xsm:-mt-7">Hours</p>
              </div>
              <div className="text-white -mr-6 text-7xl xsm:text-4xl xsm:-mr-3 xsm:mt-8">
                ：
              </div>
              <div className="mt-4 gradient-text flex flex-col justify-center items-center">
                <h1>{minutes}</h1>
                <p className="text-primaryText text-sm xsm:-mt-7">Mins</p>
              </div>
            </div>
          </div>
          <div className="lg:hidden">
            <CountdownLeftMobileBg />
          </div>
        </div>
      )}
    </>
  );
};

Countdown.propTypes = {
  onCountdownFinish: PropTypes.func.isRequired,
};

export default Countdown;
