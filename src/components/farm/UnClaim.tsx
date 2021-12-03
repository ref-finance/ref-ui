import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useState, useEffect } from 'react';
import { ArrowDownHollow } from '~components/icon';

export default function UnClaim(props: { unclaimed: any }) {
  const [showClaim, setShowClaim] = useState(false);
  const { rewardsList, totalPrice } = props.unclaimed;
  function switchShowClaim() {
    setShowClaim(!showClaim);
  }
  return (
    <div className="mt-7 xs:mt-4 md:mt-4">
      <div
        className="flex items-center justify-center cursor-pointer"
        onClick={switchShowClaim}
      >
        <label className="text-sm text-white ml-3 mr-4 cursor-pointer">
          <FormattedMessage id="rewards_claimed"></FormattedMessage>
        </label>
        <label
          className={
            'cursor-pointer ' + (showClaim ? 'transform rotate-180' : '')
          }
        >
          <ArrowDownHollow></ArrowDownHollow>
        </label>
      </div>
      <div
        className={
          'rounded bg-black bg-opacity-20 p-5 mt-3.5 ' +
          (showClaim ? 'block' : 'hidden')
        }
      >
        <p className="flex justify-between items-center">
          <label className="text-sm text-farmText">
            <FormattedMessage id="value_rewards_token"></FormattedMessage>
          </label>
          <label className="text-sm text-farmText text-right">
            {totalPrice == '-'
              ? '$ -'
              : totalPrice.indexOf('<') > -1
              ? `${totalPrice}`
              : `~ ${totalPrice}`}
          </label>
        </p>
        <div className="flex flex-col mt-4">
          <label className="text-sm text-farmText">
            <FormattedMessage id="reward_token"></FormattedMessage>
          </label>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {rewardsList.map(
              (
                {
                  icon,
                  userUnclaimedReward,
                }: { icon: string; userUnclaimedReward: string },
                index: number
              ) => {
                return (
                  <span className="flex items-center" key={index}>
                    <img
                      src={icon}
                      className="w-6 h-6 xs:w-5 xs:h-5 md:w-5 md:h-5 rounded-full border border-gradientFromHover"
                    ></img>{' '}
                    <label className="text-sm text-farmText ml-2.5">
                      {userUnclaimedReward || '-'}
                    </label>
                  </span>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
