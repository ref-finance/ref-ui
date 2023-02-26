import { toPrecision } from './near';
export function digitWrapper(digit: string | number, precision: number) {
  const minStr = '0.' + '0'.repeat(precision - 1) + '1';

  if (Number(digit) < Number(minStr) && Number(digit) > 0) {
    return '< ' + minStr;
  } else return toPrecision(digit.toString(), precision, true);
}
