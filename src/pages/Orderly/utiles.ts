import { toPrecision } from './near';
import Big from 'big.js';
import {
  scientificNotationToString,
  formatWithCommas,
  toInternationalCurrencySystemLongString,
} from '../../utils/numbers';
import { spawn } from 'child_process';
export function digitWrapper(
  digit: string | number,
  precision: number,
  fromList?: boolean
) {
  const minStr = '0.' + '0'.repeat(precision - 1) + '1';

  if (Number(digit) < Number(minStr) && new Big(digit).gt(0)) {
    return scientificNotationToString(digit.toString());
  } else
    return toPrecision(
      scientificNotationToString(digit.toString()),
      precision,
      true
    );
}
export function digitWrapperAsset(
  digit: string | number,
  precision?: number,
  fromList?: boolean
) {
  const minStr = '0.' + '0'.repeat(2) + '1';

  if (Number(digit) < Number(minStr) && Number(digit) > 0) {
    return '<' + minStr;
  } else if (Number(digit) > 999999) {
    return toInternationalCurrencySystemLongString(Big(digit || 0).toFixed());
  } else return toPrecision(digit.toString(), 3, true, false);
}

export function numberWithCommas(x: number | string) {
  let str = typeof x === 'number' ? x.toString() : x;

  var parts = scientificNotationToString(str).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function numberWithCommasPadding(x: number, decimalPlaceLength: number) {
  var parts = x.toString().split('.');

  parts[1] = !!parts[1]
    ? parts[1].padEnd(decimalPlaceLength, '0')
    : '0'.repeat(decimalPlaceLength);

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function PerpOrSpot(symbol: string) {
  if (symbol.indexOf('SPOT') > -1) return 'SPOT';
  else return 'PERP';
}
