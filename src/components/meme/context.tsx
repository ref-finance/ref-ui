import { createContext } from 'react';
import { Seed, UserSeedInfo } from '../../services/farm';
import { TokenMetadata } from '../../services/ft-contract';
import { IFarmerWithdraw, IMemefarmConfig } from '../../services/meme';
interface IMemeContext {
  tokenPriceList: Record<string, any>;
  seeds: Record<string, Seed>;
  allTokenMetadatas: Record<string, TokenMetadata>;
  unclaimed_rewards: Record<string, any>;
  user_balances: Record<string, string>;
  user_seeds: Record<string, UserSeedInfo>;
  withdraw_list: Record<string, IFarmerWithdraw>;
  memeConfig: IMemefarmConfig;
  lpSeeds: Record<string, Seed>;
}
const MemeContext = createContext<IMemeContext>(null);

export { MemeContext };
