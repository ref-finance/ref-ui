import React from 'react';
import { toPrecision } from '../../utils/numbers';

export default function Rounded({
  value,
  precision,
}: {
  value: string;
  precision: number;
}) {
  return <span>{toPrecision(value, precision)}</span>;
}
