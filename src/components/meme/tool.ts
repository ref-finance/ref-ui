import Big from 'big.js';
export function emptyObject(o) {
  if (Object.keys(o).length) return false;
  return true;
}
export function copy(o) {
  return JSON.parse(JSON.stringify(o));
}
