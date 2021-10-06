const {
  toReadableNumber,
  toNonDivisibleNumber,
  toPrecision,
  toRoundedReadableNumber,
  convertToPercentDecimal,
  calculateFeePercent,
  calculateFeeCharge,
  calculateExchangeRate,
  percentOf,
  percentLess,
  percent,
  calculateFairShare,
} = require('../numbers');

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

describe('toPrecision', () => {
  test('lower precision', () => {
    expect(toPrecision('25.98765432', 2)).toEqual('25.98');
  });

  test('higher precision', () => {
    expect(toPrecision('25.98', 5)).toEqual('25.98');
  });

  test('with commas', () => {
    expect(toPrecision('1234567.98765432', 2, true)).toEqual('1,234,567.98');
  });
});

describe('toRoundedReadableNumber', () => {
  test('low decimals', () => {
    expect(
      toRoundedReadableNumber({
        decimals: 2,
        number: '123456789',
      })
    ).toEqual('1,234,567.89');
  });

  test('high decimals', () => {
    expect(
      toRoundedReadableNumber({
        decimals: 20,
        number: '123456789123456789',
      })
    ).toEqual('0.001234');
  });

  test('high decimals hige precision', () => {
    expect(
      toRoundedReadableNumber({
        decimals: 20,
        number: '123456789123456789',
        precision: 15,
      })
    ).toEqual('0.001234567891234');
  });
});

describe('convertToPercentDecimal', () => {
  test('converts percent to decimal version', () => {
    expect(convertToPercentDecimal(100)).toEqual(1);
    expect(convertToPercentDecimal(90)).toEqual(0.9);
    expect(convertToPercentDecimal(75)).toEqual(0.75);
    expect(convertToPercentDecimal(5)).toEqual(0.05);
    expect(convertToPercentDecimal(0.3)).toEqual(0.003);
    expect(convertToPercentDecimal(0)).toEqual(0);
  });
});

describe('calculateFeePercent', () => {
  test('BPS to fee', () => {
    expect(calculateFeePercent(30)).toEqual(0.3);
    expect(calculateFeePercent(25)).toEqual(0.25);
  });
});

describe('calculateFeeCharge', () => {
  test('calculate fee charge from BPS', () => {
    expect(calculateFeeCharge(30, 100)).toEqual(0.3);
    expect(calculateFeeCharge(30, 30)).toEqual(0.09);
    expect(calculateFeeCharge(30, 12)).toEqual(0.04);
  });
});

describe('calculateExchangeRate', () => {
  test('calculate the exchange rate', () => {
    expect(calculateExchangeRate(30, 100, 100)).toEqual(1);
    expect(calculateExchangeRate(30, 200, 50)).toEqual(0.25);
  });
});

describe('percentOf', () => {
  test('calculate the percent of a number', () => {
    expect(percentOf(50, 100)).toEqual(50);
    expect(percentOf(25, 100)).toEqual(25);
    expect(percentOf(75, 100)).toEqual(75);
  });
});

describe('percentLess', () => {
  test('get a number minus a percent of itself', () => {
    expect(percentLess(50, 100)).toEqual('50');
    expect(percentLess(25, 100)).toEqual('75');
    expect(percentLess(80, 100)).toEqual('20');
  });
});

describe('percent', () => {
  test('get percent givent numerator and denominator', () => {
    expect(percent(50, 100)).toEqual(50);
    expect(percent(25, 100)).toEqual(25);
    expect(percent(75, 100)).toEqual(75);
  });
});

describe('calculateFairShare', () => {
  test('calculate the fair share given total an contribution', () => {
    expect(
      calculateFairShare({
        shareOf: 100,
        contribution: 50,
        totalContribution: 100,
      })
    ).toEqual('50');

    expect(
      calculateFairShare({
        shareOf: 100,
        contribution: 33,
        totalContribution: 100,
      })
    ).toEqual('33');

    expect(
      calculateFairShare({
        shareOf: 1,
        contribution: 33,
        totalContribution: 100,
      })
    ).toEqual('0');
  });
});
