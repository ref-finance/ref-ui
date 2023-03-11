import { toPrecision } from './near';
import { scientificNotationToString } from '../../utils/numbers';
import { spawn } from 'child_process';
export function digitWrapper(
  digit: string | number,
  precision: number,
  fromList?: boolean
) {
  const minStr = '0.' + '0'.repeat(precision - 1) + '1';

  if (Number(digit) < Number(minStr) && Number(digit) > 0) {
    return scientificNotationToString(digit.toString());
  } else return toPrecision(digit.toString(), precision, true);
}

export function digitWrapperAsset(
  digit: string | number,
  precision: number,
  fromList?: boolean
) {
  const minStr = '0.' + '0'.repeat(2) + '1';

  if (Number(digit) < Number(minStr) && Number(digit) > 0) {
    return '<' + minStr;
  } else return toPrecision(digit.toString(), 3, true);
}
