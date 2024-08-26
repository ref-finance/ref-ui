import React, { useState, useContext } from 'react';
import { useEffect } from 'react';
import { stake_boost_shadow } from '../../services/farm';
import { FarmsContextData } from '../../components/farm/FarmsContext';

export default function ShadowTip({
  show,
  seed_id,
  className,
}: {
  show: boolean;
  seed_id: string;
  className?: string;
}) {
  const contextData = useContext(FarmsContextData);
  const [amount, setAmount] = useState('0');
  useEffect(() => {
    const { free_amount } =
      contextData?.user_data?.user_seeds_map?.[seed_id] || {};
    setAmount(free_amount || '0');
  }, [contextData]);
  function activeShadow() {
    stake_boost_shadow({
      pool_id: +seed_id.split('@')[1],
      amount: '0',
      amountByTransferInFarm: amount,
      seed_id,
    });
  }
  if (!show) return null;
  return (
    <div
      className={`absolute -top-16 text-xs text-farmText w-56 border border-primaryText rounded-md px-2 py-1 bg-cardBg z-10 ${
        className ? className : ''
      }`}
    >
      <a
        className="text-xs ml-0.5 text-burrowYellowColor underline cursor-pointer"
        onClick={activeShadow}
      >
        Activating
      </a>{' '}
      this feature will automatically claim your Farming rewards.
    </div>
  );
}
