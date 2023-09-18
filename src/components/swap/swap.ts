import { WRAP_NEAR_CONTRACT_ID, unwrapedNear } from '../../services/wrap-near';

const SWAP_IN_KEY = 'REF_FI_SWAP_IN';
const SWAP_OUT_KEY = 'REF_FI_SWAP_OUT';
const SWAP_IN_KEY_SYMBOL = 'REF_FI_SWAP_IN_SYMBOL';
const SWAP_OUT_KEY_SYMBOL = 'REF_FI_SWAP_OUT_SYMBOL';

export function getStorageTokenId() {
  const in_key = localStorage.getItem(SWAP_IN_KEY);
  const in_key_symbol = localStorage.getItem(SWAP_IN_KEY_SYMBOL);
  const out_key = localStorage.getItem(SWAP_OUT_KEY);
  const out_key_symbol = localStorage.getItem(SWAP_OUT_KEY_SYMBOL);
  const result = [];
  if (in_key == WRAP_NEAR_CONTRACT_ID) {
    if (in_key_symbol == 'NEAR') {
      result.push('near');
    } else {
      result.push(WRAP_NEAR_CONTRACT_ID);
    }
  } else {
    result.push(in_key);
  }
  if (out_key == WRAP_NEAR_CONTRACT_ID) {
    if (out_key_symbol == 'NEAR') {
      result.push('near');
    } else {
      result.push(WRAP_NEAR_CONTRACT_ID);
    }
  } else {
    result.push(out_key);
  }
  return result;
}
