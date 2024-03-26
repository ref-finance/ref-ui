import React, { useState } from 'react';
import { Pie, PieChart } from 'recharts';
import { ArrowRightTopIcon } from './icons';
import VoteModel from './VoteModel';
import MyPieChart from './VoteChart';

const VoteXREF = () => {
  const [activeTab, setActiveTab] = useState('vote');
  const [isVoteOpen, setIsVoteOpen] = useState(false);
  return (
    <div className="mt-12 rounded-2xl border border-memeBorderColor">
      <div className="border-b border-memeBorderColor pt-8 bg-memeVoteBgColor rounded-t-2xl pl-14 text-primaryText flex item-center text-2xl gotham_bold">
        <div
          className={`pb-3.5 mr-24 cursor-pointer ${
            activeTab === 'vote' ? 'text-white border-b-4 border-white' : ''
          }`}
          onClick={() => setActiveTab('vote')}
        >
          Vote by xREF
        </div>
        <div
          className={`pb-3.5 mr-24 cursor-pointer ${
            activeTab === 'love' ? 'text-white border-b-4 border-white' : ''
          }`}
          onClick={() => setActiveTab('love')}
        >
          Show love for voters
        </div>
      </div>
      <div
        className="py-7 px-8 bg-memeVoteBgColor rounded-b-2xl "
        style={{ height: '600px' }}
      >
        {activeTab === 'vote' ? (
          <div className="text-primaryText">
            <div className="text-base mb-7">
              Vote for your favorite Meme by staking xREF, so that the Meme you
              support can be listed in the next round of ‘Meme Copetetion’.
            </div>
            <div className="flex gap-12">
              <div className="flex-grow">
                <div className="flex">
                  <div>
                    <p>Current Round:</p>
                    <span className="text-white text-lg">
                      2024/03/18-2024/03/31
                    </span>
                  </div>
                  <div className="ml-auto">
                    <p>Next Round:</p>
                    <span className="text-white text-lg">
                      2024/04/01-2024/04/14
                    </span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <MyPieChart />
                </div>
              </div>
              <div className="w-1/3">
                <div className="bg-memeModelgreyColor rounded-2xl border border-memeBorderColor mb-6">
                  <div className="flex justify-between pt-5 pb-4 px-5 text-white text-base items-center gotham_bold">
                    <div>Total xREF</div>
                    <div className="text-3xl flex items-center">
                      <img
                        src="data:image/png;base64,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"
                        style={{
                          width: '26px',
                          height: '29px',
                          marginRight: '10px',
                        }}
                        className="rounded-full"
                      />
                      1.23M
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="px-5 flex justify-between items-center border-b border-memeVoteBgColor pb-2">
                      <div>Meme Project</div>
                      <div>xREF</div>
                    </div>
                    <div
                      className="pt-3 pl-5 pr-4 text-white"
                      style={{ maxHeight: '270px', overflow: 'auto' }}
                    >
                      {[1, 2, 3, 4].map((v) => {
                        return (
                          <div key={v} className="flex justify-between mb-5">
                            <div className="flex items-center">
                              <p>Blackdragon</p>
                              <div
                                className="ml-1.5 text-black text-xs gotham_bold rounded py-0.5 px-1 bg-senderHot transform"
                                style={{ transform: 'skewX(-20deg)' }}
                              >
                                Listed
                              </div>
                            </div>
                            <div className="gotham_bold">5020.35</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div
                  className="bg-greenLight rounded-xl w-full text-black text-center gotham_bold text-base py-3.5 mb-4 cursor-pointer"
                  onClick={() => {
                    setIsVoteOpen(true);
                  }}
                >
                  Vote Meme by xREF
                </div>
                <div className="flex items-center justify-center text-greenLight text-base">
                  <a
                    className="inline-flex items-center cursor-pointer"
                    href="/xref"
                    target="_blank"
                  >
                    Acquire $xREF <ArrowRightTopIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-primaryText">
            <div className="text-base mb-7">
              Donate you supporting Meme, to encourage xREF holders to vote for
              your Meme. Show some love to them!
            </div>
            <div className="bg-memeModelgreyColor rounded-2xl border border-memeBorderColor mb-4">
              <div className="overflow-x-auto">
                <div className="min-w-full divide-y divide-memeVoteBgColor">
                  <div className="grid grid-cols-5 pt-6 px-5 pb-2.5 text-sm">
                    <div>Meme Project</div>
                    <div>xREF</div>
                    <div>Voters</div>
                    <div>Donation</div>
                    <div>USD Value</div>
                  </div>
                  <div className="grid grid-cols-5 p-4 items-center text-base text-white">
                    <div className="flex items-center">
                      <p>Blackdragon</p>
                      <div
                        className="ml-1.5 text-black text-xs gotham_bold rounded py-0.5 px-1 bg-senderHot transform"
                        style={{ transform: 'skewX(-20deg)' }}
                      >
                        Listed
                      </div>
                    </div>
                    <div className="gotham_bold">5020.35</div>
                    <div className="gotham_bold">502</div>
                    <div className="gotham_bold">18400.94B</div>
                    <div className="gotham_bold">$6,673.67</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-greenLight rounded-xl w-full text-black text-center gotham_bold text-base py-3.5 mb-4 cursor-pointer">
              Donate
            </div>
          </div>
        )}
      </div>
      {isVoteOpen ? (
        <VoteModel
          isOpen={isVoteOpen}
          onRequestClose={() => {
            setIsVoteOpen(false);
          }}
        />
      ) : null}
    </div>
  );
};
export default VoteXREF;
