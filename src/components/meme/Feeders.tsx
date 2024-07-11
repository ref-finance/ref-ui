import React, { useContext } from 'react';
import { getMemeContractConfig } from './memeConfig';
import { MemeContext } from './context';
import { emptyObject } from './tool';
const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
function Feeders({ seed_id }: { seed_id: string }) {
  const { seeds, xrefSeeds } = useContext(MemeContext);
  function getFeeder() {
    if (!emptyObject(seeds) && !emptyObject(xrefSeeds)) {
      const seed = seeds[seed_id];
      const xrefSeed = xrefSeeds[MEME_TOKEN_XREF_MAP[seed_id]];
      return seed.farmer_count + xrefSeed.farmer_count;
    }
    return 0;
  }
  return (
    <div className="flex flex-col justify-between gap-0.5 ">
      {/* title */}
      <span className="text-sm text-white">Feeders</span>
      {/* content */}
      <div className="flex flex-col">
        <span className="text-xl gotham_bold text-white">{getFeeder()}</span>
      </div>
    </div>
  );
}
export default Feeders;
