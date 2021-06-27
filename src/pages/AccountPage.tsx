import React from 'react';
import { Card } from '~components/card/Card';
import { GreenButton, GrayButton } from '~components/button/Button';

export function AccountPage() {
  return (
    <div className="w-7/12 m-auto overflow-y-auto h-full">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="w-full">
            <div className="flex items-center justify-between pb-4">
              <div className="font-semibold">Balance</div>
              <GreenButton>Go to Wallet</GreenButton>
            </div>
            <div>
              {Array(5)
                .fill(0)
                .map((_, i) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between py-4 border-t"
                    >
                      <div className="flex item-center justify-between">
                        <div className="rounded-full h-10 w-10 bg-gray-600 mr-3"></div>
                        <div className="flex flex-col justify-between py-1">
                          <div>BANANA</div>
                          <div className="text-xs text-gray-500">
                            banana.ft-fin.testnet
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-600">1780</div>
                    </div>
                  );
                })}
            </div>
          </Card>
          <Card className="w-full mt-6">
            <div className="flex items-center justify-between pb-4">
              <div className="font-semibold">Your Liquidity</div>
              <div></div>
            </div>
            <div>
              {Array(5)
                .fill(0)
                .map((_, i) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between py-4 border-t"
                    >
                      <div className="flex item-center justify-between text-xs">
                        <div>BANANA: 1</div>
                        <div className="px-4">-</div>
                        <div>wNear: 8390</div>
                      </div>
                      <div className="text-gray-600">
                        <GrayButton className="text-white text-xs">
                          Remove
                        </GrayButton>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
        <div>
          <Card className="w-full">
            <div className="flex items-center justify-between pb-4">
              <div className="font-semibold">Recent Activity</div>
              <div></div>
            </div>
            <div className="border-b">
              {Array(5)
                .fill(0)
                .map((_, i) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between py-4 border-t"
                    >
                      <div className="flex items-center justify-between">
                        <div className="rounded-full h-6 w-6 bg-gray-600 mr-3"></div>
                        <span className="text-xs font-semibold">BANANA</span>
                      </div>
                      <div className="text-gray-400 text-xs">1780</div>
                    </div>
                  );
                })}
            </div>
            <div>
              <GrayButton className="text-white text-xs w-full justify-center py-2 mt-4">
                <div>View All</div>
              </GrayButton>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
