import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PoolInfo } from '../services/swapV3';
import { StablePool } from '../services/pool';
import { TokenMetadata } from '../services/ft-contract';
export interface INEAR_USDT_SWAP_TODOS {
  tokenInAmount: string;
  estimateOutAmount: string;
  estimateOutAmountWithSlippageTolerance: string;
  dcl_quote_amout: string;
  dcl_quote_amout_real?: string;
  nonEstimateOutAmount: string;
  nonEstimateOutAmountWithSlippageTolerance: string;
  mixTag: string;
  quoteDone: boolean;
  canSwap: boolean;
  pools: [PoolInfo, StablePool];
  tokens: [TokenMetadata, TokenMetadata, TokenMetadata];
  slippageTolerance: number;
  mixError: Error;
  fee: number;
  priceImpact: string;
  process: '0' | '1' | '2' | '3'; // "0": No transaction, "1": "The dcl transaction has been completed", "2": "The v1 transaction has been processing", "3": "The v1 transaction has been completed"
}
export interface IPersistSwap {
  near_usdt_swapTodos: INEAR_USDT_SWAP_TODOS;
  near_usdt_swapTodos_transaction: INEAR_USDT_SWAP_TODOS;
  set_near_usdt_swapTodos: (near_usdt_swapTodos: INEAR_USDT_SWAP_TODOS) => void;
  set_near_usdt_swapTodos_transaction: (
    near_usdt_swapTodos_transaction: INEAR_USDT_SWAP_TODOS
  ) => void;
}
type IPersistSwapState = IPersistSwap;
type IPersistSwapStore = StateCreator<
  IPersistSwapState,
  [],
  [],
  IPersistSwapState
>;
export const usePersistSwapStore = create<IPersistSwapState>()(
  persist(
    (set) => ({
      near_usdt_swapTodos: null,
      near_usdt_swapTodos_transaction: null,
      set_near_usdt_swapTodos: (near_usdt_swapTodos: INEAR_USDT_SWAP_TODOS) =>
        set({ near_usdt_swapTodos }),
      set_near_usdt_swapTodos_transaction: (
        near_usdt_swapTodos_transaction: INEAR_USDT_SWAP_TODOS
      ) => set({ near_usdt_swapTodos_transaction }),
    }),
    {
      name: '_cached_swap',
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
