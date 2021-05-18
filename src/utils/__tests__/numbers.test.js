const { toReadableNumber, toNonDivisibleNumber } = require('../numbers');

describe('toReadableNumber', () => {
  test('single digit', () => {
    expect(toReadableNumber(10, '1')).toEqual('0.0000000001');
  });

  test('to single digit', () => {
    expect(toReadableNumber(12, '1000000000000')).toEqual('1');
  });

  test('small number', () => {
    expect(toReadableNumber(20, '1')).toEqual('0.00000000000000000001');
  });

  test('large number', () => {
    expect(toReadableNumber(20, '1000000000000000000000')).toEqual('10');
  });

  test('large number small decimals', () => {
    expect(toReadableNumber(2, '999900023')).toEqual('9999000.23');
  });

  test('single decimal', () => {
    expect(toReadableNumber(24, '500000000000000000000000')).toEqual('0.5');
  });

  test('big number bigger decimal', () => {
    expect(toReadableNumber(24, '9999988666724')).toEqual(
      '0.000000000009999988666724'
    );
  });
});

describe('toNonDivisibleNumber', () => {
  test('tiny number', () => {
    expect(toNonDivisibleNumber(20, '0.00000000000000000001')).toEqual('1');
  });

  test('large number', () => {
    expect(toNonDivisibleNumber(20, '100000')).toEqual(
      '10000000000000000000000000'
    );
  });

  test('mixed number', () => {
    expect(toNonDivisibleNumber(5, '123.45678')).toEqual('12345678');
  });

  test('overprecise number', () => {
    expect(toNonDivisibleNumber(5, '123.456789')).toEqual('12345678');
  });

  test('zero', () => {
    expect(toNonDivisibleNumber(20, '0')).toEqual('0');
  });

  test('zero decimals', () => {
    expect(toNonDivisibleNumber(0, '5.15')).toEqual('5');
  });
});
