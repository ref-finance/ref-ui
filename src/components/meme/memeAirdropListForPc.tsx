import React, { useEffect, useState } from 'react';
import { ModalClose } from '../../components/icon';
import { RuleTips, TriangleUp, TriangleDown } from '../icon/memeComingModal';
import { memeComingSoonJson } from '../../config/memeConfig';
import Modal from 'react-modal';

export default function MemeAirdropListForPc({ onRequestClose, isOpen }: any) {
  // show rules
  const [isShowRules, setShowRules] = useState<Array<any>>([]);
  useEffect(() => {
    const waitDealedData = new Array(memeComingSoonJson.length).fill(false);
    setShowRules(waitDealedData);
  }, []);
  // deal rules show/hide
  const setShowRulesIndex = (index, flag) => {
    //shallow copy
    const updatedWaitDealedData = [...isShowRules];
    updatedWaitDealedData[index] = flag;
    setShowRules(updatedWaitDealedData);
  };
  //
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        },
        content: {
          outline: 'none',
          transform: 'translate(-50%, -50%)',
        },
      }}
    >
      <div className="rounded-2xl bg-cardBg" style={{ maxHeight: '37rem' }}>
        {/* header */}
        <div className="px-5 xs:px-3 md:px-3 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <label className="text-white text-xl">Airdrop Activity</label>
          </div>
          <ModalClose className="cursor-pointer" onClick={onRequestClose} />
        </div>

        {/* body */}
        <div style={{ height: '32rem' }} className=" overflow-auto">
          <div className={`bg-memeUserStackeBgColor py-6 px-6 overflow-auto`}>
            {/* map */}
            {memeComingSoonJson.map((item, index) => {
              return (
                <div
                  key={item.title + index}
                  style={{
                    width: '51rem',
                    maxHeight: '27.375rem',
                    minHeight: '13.25rem',
                  }}
                  className=" bg-memeModelgreyColor rounded-2xl mb-4 py-6 px-6 flex"
                >
                  {/* left */}
                  {item.icon}

                  {/* right */}
                  <div
                    style={{ width: '36.525rem' }}
                    className="gotham text-white ml-6"
                  >
                    {/* title */}
                    <div>
                      <h3 className="gotham_bold text-xl">{item.title}</h3>
                      <p className="text-primaryText text-sm">
                        {item.introduce}
                      </p>
                    </div>

                    {/* amount & droptime */}
                    <div className="flex items-center justify-between my-2">
                      {/* left */}
                      <div>
                        <h5 className="text-sm">Amount</h5>
                        <p>
                          <span className="text-xl gotham_bold text-greenLight">
                            {item.amount}
                          </span>
                          <span className="ml-1 text-xs">
                            {item.amountDollar}
                          </span>
                        </p>
                      </div>

                      {/* right */}
                      <div>
                        <div>
                          <h5 className="text-sm">Airdrop time</h5>
                          <p className="text-xl gotham_bold text-greenLight">
                            {item.airdropTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* rule change */}
                    <div className=" select-none">
                      <div className="flex items-center">
                        <RuleTips />
                        <span className="mx-2 my-2 text-base">Rules</span>
                        <div
                          className=" w-5 h-5 rounded-md bg-gray-400 fccc cursor-pointer"
                          onClick={() =>
                            setShowRulesIndex(index, !isShowRules[index])
                          }
                        >
                          {isShowRules[index] ? (
                            <TriangleUp />
                          ) : (
                            <TriangleDown />
                          )}
                        </div>
                      </div>

                      {/* collase */}
                      {isShowRules[index] ? (
                        <div className="h-52 overflow-auto p-6 text-sm text-v3LightGreyColor border border-memeBorderColor rounded-lg bg-memeDarkColor">
                          {item.rules}
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
