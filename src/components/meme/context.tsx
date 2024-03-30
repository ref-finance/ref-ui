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
  memeContractConfig: IMemefarmConfig;
  xrefContractConfig: Record<string, IMemefarmConfig>;
  lpSeeds: Record<string, Seed>;
  xrefSeeds: Record<string, Seed>;
  xrefFarmContractUserData: Record<string, IFarmAccount>;
  memeFarmContractUserData: IFarmAccount;
  xrefTokenId: string;
  donateBalances: Record<string, string>;
}

// withdraw_list: user_withdraw_list[index],
// unclaimed_rewards: user_unclaimed_rewards[cur],
// join_seeds: user_seeds[index],
interface IFarmAccount {
  withdraw_list: Record<string, IFarmerWithdraw>;
  unclaimed_rewards: Record<string, any>;
  join_seeds: Record<string, UserSeedInfo>;
}
const MemeContext = createContext<IMemeContext>(null);

export { MemeContext, IMemeContext, IFarmAccount };
