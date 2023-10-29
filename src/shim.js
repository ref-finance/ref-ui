if (typeof BigInt === 'undefined')
  global.BigInt = require(/* webpackChunkName: "big-integer" */ 'big-integer');
