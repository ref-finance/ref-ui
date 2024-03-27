import React, { useState } from 'react';
function VotersSheet() {
  return (
    <div className="text-primaryText">
      <div className="text-base mb-7">
        Donate you supporting Meme, to encourage xREF holders to vote for your
        Meme. Show some love to them!
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
  );
}

export default VotersSheet;
