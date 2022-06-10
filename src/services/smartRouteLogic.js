////////////////////////////////////////////////////////////////////////////
// SMART ROUTE SWAP LOGIC
////////////////////////////////////////////////////////////////////////////
import { STABLE_POOL_ID, STABLE_TOKEN_IDS } from './near';
import Big from 'big.js';
import { checkIntegerSumOfAllocations } from './parallelSwapLogic';
import {
  instantSwapGetTransactions,
  getSwappedAmount as getStableSwappedAmount,
} from './stable-swap';
import { STABLE_LP_TOKEN_DECIMALS } from '../components/stableswap/AddLiquidity';
import { getStablePool, getPool } from './pool';
import {
  ftGetStorageBalance,
  ftGetTokenMetadata,
  TokenMetadata,
} from './ft-contract';
import {
  percentLess,
  separateRoutes,
  toNonDivisibleNumber,
} from '../utils/numbers';
import { getPoolEstimate } from './swap';

Big.RM = 0;
Big.DP = 40;
Big.NE = -40;
Big.PE = 40;

function bisqrt(value) {
  // For some ridiculous reason, the .sqrt() method for Big decimals is extremely slow (~10-20ms),
  // which isn't so bad until you need to use it a bunch of times.
  // Since we're dealing with super large numbers anyway, we can convert the Big decimal number into a BigInt,
  // then run this BigInt Newton iteration square root function instead, and then convert back into a
  // Big number. And it speeds up the operation by a crazy factor, ~10x faster.
  if (value < BigInt(0)) {
    throw 'square root of negative numbers is not supported';
  }

  if (value < BigInt(2)) {
    return value;
  }

  function newtonIteration(n, x0) {
    const x1 = (n / x0 + x0) >> BigInt(1);
    if (x0 === x1 || x0 === x1 - BigInt(1)) {
      return x0;
    }
    return newtonIteration(n, x1);
  }

  return newtonIteration(value, BigInt(1));
}

function getBetaForRoute(route, path) {
  if (!route.length) {
    route = [route];
  }
  if (route.length == 1) {
    let p = route[0];
    var beta = new Big(p.reserves[path[0]]);
  } else if (route.length == 2) {
    let p1 = route[0];
    let p2 = route[1];
    var beta = new Big(p1.reserves[path[0]]).times(
      new Big(p2.reserves[path[1]])
    );
  }
  return beta;
}

function getEpsilonForRoute(route, path) {
  if (!route.length) {
    route = [route];
  }
  if (route.length == 1) {
    // Single Hop case
    let p = route[0];
    let gamma = new Big(10000).minus(new Big(p.fee)).div(new Big(10000));
    var epsilon = Big(gamma);
  } else if (route.length == 2) {
    //Double Hop Case
    let p1 = route[0];
    let p2 = route[1];
    let gamma1 = new Big(10000).minus(new Big(p1.fee)).div(new Big(10000));
    let gamma2 = new Big(10000).minus(new Big(p2.fee)).div(Big(10000));
    var epsilon = new Big(p2.reserves[path[1]])
      .times(new Big(gamma1))
      .plus(new Big(p1.reserves[path[1]]).times(gamma1).times(gamma2));
  }
  return epsilon;
}

function getAlphaForRoute(route, path) {
  if (!route.length) {
    route = [route];
  }
  if (route.length == 1) {
    //console.log('single hop')
    let p = route[0];
    let inputToken = path[0];
    let outputToken = path[1];
    let gamma = new Big(10000).minus(new Big(p.fee)).div(new Big(10000));
    let key1 = p.token1Id;
    let key2 = p.token2Id;
    let val1 = p.token1Supply;
    let val2 = p.token2Supply;
    p['reserves'] = { [key1]: val1, [key2]: val2 };
    var alpha = new Big(p.reserves[inputToken]).times(
      new Big(p.reserves[outputToken]).times(new Big(gamma))
    );
  } else if (route.length == 2) {
    //console.log('double hop')
    let p1 = route[0];
    let p2 = route[1];
    let key11 = p1.token1Id;
    let key12 = p1.token2Id;
    let val11 = p1.token1Supply;
    let val12 = p1.token2Supply;
    p1['reserves'] = { [key11]: val11, [key12]: val12 };
    let key21 = p2.token1Id;
    let key22 = p2.token2Id;
    let val21 = p2.token1Supply;
    let val22 = p2.token2Supply;
    p2['reserves'] = { [key21]: val21, [key22]: val22 };
    let inputToken = path[0];
    let middleToken = path[1];
    let outputToken = path[2];
    let gamma1 = new Big(10000).minus(Big(p1.fee)).div(new Big(10000));
    let gamma2 = new Big(10000).minus(new Big(p2.fee)).div(new Big(10000));
    let alpha1 = new Big(p1.reserves[inputToken])
      .times(new Big(p1.reserves[middleToken]))
      .times(gamma1);
    let alpha2 = new Big(p2.reserves[middleToken])
      .times(new Big(p2.reserves[outputToken]))
      .times(gamma2);
    var alpha = alpha1.times(alpha2);
  }
  return alpha;
}

function getAlphaSumFromRoutes(routes, nodeRoutes) {
  let alphaSum = new Big(0);
  for (var i in routes) {
    let route = routes[i];
    let nodeRoute = nodeRoutes[i];
    let alpha = getAlphaForRoute(route, nodeRoute);
    // console.log('alpha is...');
    // console.log(alpha.toString());
    // below, we are replacing the built-in Big sqrt() method with a
    // newton-iteration BigInt sqrt function, to speed it up by 10x.
    let radical = new Big(bisqrt(BigInt(new Big(alpha).round().toFixed())));
    // let radical = new Big(alpha).sqrt();
    let epsilon = getEpsilonForRoute(route, nodeRoute);
    let denom = new Big(epsilon);
    alphaSum = alphaSum.plus(radical.div(denom));
  }
  return alphaSum;
}

function getBetaSumFromRoutes(routes, nodeRoutes) {
  let betaSum = new Big(0);
  for (var i in routes) {
    let route = routes[i];
    let nodeRoute = nodeRoutes[i];
    let num = new Big(getBetaForRoute(route, nodeRoute));
    let denom = new Big(getEpsilonForRoute(route, nodeRoute));
    betaSum = betaSum.plus(num.div(denom));
  }
  return betaSum;
}

function getPhiFromRoutes(routes, nodeRoutes, totalInput) {
  let alphaSum = getAlphaSumFromRoutes(routes, nodeRoutes);
  let betaSum = getBetaSumFromRoutes(routes, nodeRoutes);
  let phi = new Big(totalInput).plus(betaSum).div(alphaSum);
  return phi;
}

function getAllocationForRoute(phi, route, path) {
  let alpha = getAlphaForRoute(route, path);
  let beta = getBetaForRoute(route, path);
  let epsilon = getEpsilonForRoute(route, path);
  // below, we are replacing the built-in Big sqrt() method with a
  // newton-iteration BigInt sqrt function, to speed it up by 10x.
  let allocation = new Big(phi)
    .abs()
    .times(new Big(bisqrt(BigInt(new Big(alpha).round().toFixed()))))
    .minus(beta)
    .div(epsilon);
  return allocation;
}

function getAllocationVectorForRoutes(phi, routes, nodeRoutes) {
  let allocationVec = [];
  for (var i in routes) {
    allocationVec.push(getAllocationForRoute(phi, routes[i], nodeRoutes[i]));
  }
  return allocationVec;
}

function getOptimalAllocationForRoutes(routes, nodeRoutes, totalInput) {
  // console.log("CALLING GET OPTIMAL ALLOCATION FOR ROUTES:")
  // console.log(routes)
  var totalInput = new Big(totalInput);
  let phi = getPhiFromRoutes(routes, nodeRoutes, totalInput);
  // console.log('PHI CALCULATED TO BE...')
  // console.log(phi.toString())
  let allocations = getAllocationVectorForRoutes(phi, routes, nodeRoutes);
  if (allocations.every((item) => item.lt(new Big(0)))) {
    allocations = allocations.map((item) => item.times(new Big(-1.0)));
  }
  if (allocations.some((item) => item.lt(new Big(0)))) {
    allocations = reduceRoutes(routes, nodeRoutes, allocations, totalInput);
  }
  let sumAllocations = allocations.reduce((a, b) => a.plus(b), new Big(0));
  let normalizedAllocations = allocations.map((a) =>
    a.div(sumAllocations).times(new Big(totalInput))
  );
  return normalizedAllocations;
}

function reduceRoutes(routes, nodeRoutes, allocationVec, totalInput) {
  // console.log("RUNNING REDUCE ROUTES")
  var totalInput = new Big(totalInput);
  let goodIndices = [];
  for (var i in allocationVec) {
    let dx = allocationVec[i];
    // console.log('DX IS...')
    // console.log(dx.toString())
    if (dx.gt(new Big(0))) {
      goodIndices.push(i);
    }
  }
  // console.log('GOOD INDICES ARE...');
  // console.log(goodIndices);
  let newRoutes = [];
  let newNodeRoutes = [];
  for (var i in goodIndices) {
    let goodIndex = goodIndices[i];
    newRoutes.push(routes[goodIndex]);
    newNodeRoutes.push(nodeRoutes[goodIndex]);
  }
  allocationVec = getOptimalAllocationForRoutes(
    newRoutes,
    newNodeRoutes,
    totalInput
  );
  let allocationDict = {};
  for (var i in goodIndices) {
    allocationDict[goodIndices[i]] = allocationVec[i];
  }
  var allocationVecNew = [];
  for (var i in routes) {
    if (goodIndices.includes(i)) {
      allocationVecNew.push(allocationDict[i]);
    } else {
      let zeroAllocation = new Big(0);
      allocationVecNew.push(zeroAllocation);
    }
  }
  return allocationVecNew;
}

function getNodeRoutesFromPathsAndPoolChains(paths, poolChains) {
  let multiplicity = [];
  for (var i in poolChains) {
    let pc = poolChains[i];
    let mul = pc
      .map((item) => item.length)
      .reduce((elem1, elem2) => elem1 * elem2, 1);
    multiplicity.push(mul);
  }
  let nodeRoutes = [];
  for (var j in paths) {
    let path = paths[j];
    let m = multiplicity[j];
    for (var k = 0; k < m; k++) {
      nodeRoutes.push(path);
    }
  }
  return nodeRoutes;
}

function getPoolChainFromPaths(paths, pools, threshold = 0.001) {
  let poolChains = [];
  for (var pathInd in paths) {
    let path = paths[pathInd];
    let chain = [];
    let pairs = [];
    for (var i = 0; i < path.length - 1; i++) {
      pairs.push([path[i], path[i + 1]]);
    }
    for (var pairInd in pairs) {
      let pair = pairs[pairInd];
      // console.log(pair);
      let tokenPools = getPoolsByToken1ANDToken2(pools, pair[0], pair[1]);
      chain.push(tokenPools);
    }
    poolChains.push(chain);
  }
  // return poolChains;
  let culledPoolChains = getCulledPoolChains(poolChains, threshold);

  return culledPoolChains;
}

function getCulledPoolChains(poolChains, threshold = 0.001) {
  let newChains = [];
  for (var pathInd in poolChains) {
    let path = poolChains[pathInd];
    let newPath = [];
    for (var legInd in path) {
      let leg = path[legInd];
      let culledPath = cullPoolsWithInsufficientLiquidity(leg, threshold);
      newPath.push(culledPath);
    }
    newChains.push(newPath);
  }
  return newChains;
}

function getRoutesFromPoolChain(poolChains) {
  let routes = [];
  for (var pci in poolChains) {
    let poolChain = poolChains[pci];
    //get cartesian product of each pool chain to get the list of routes.
    let newRoutes = cartesianProduct(poolChain);
    routes.push(...newRoutes);
  }
  for (var i in routes) {
    if (!routes[i].length) {
      routes[i] = [routes[i]];
    }
  }
  return routes;
}

function getOutputSingleHop(pool, inputToken, outputToken, totalInput) {
  var totalInput = new Big(totalInput);
  // check if pool is forward or backward for inputToken/outputToken cf. token1Id/token2Id
  if (inputToken === pool.token1Id && outputToken === pool.token2Id) {
    // forward Pool
    var reserves = {
      [inputToken]: new Big(pool.token1Supply),
      [outputToken]: new Big(pool.token2Supply),
    };
  } else if (inputToken === pool.token2Id && outputToken === pool.token1Id) {
    // reverse pool
    var reserves = {
      [outputToken]: new Big(pool.token1Supply),
      [inputToken]: new Big(pool.token2Supply),
    };
  } else {
    return new Big(0);
  }
  let gamma = new Big(10000).minus(new Big(pool.fee)).div(new Big(10000));
  // console.log(totalInput)
  // console.log(gamma)
  // console.log(reserves)
  let num = totalInput.times(gamma).times(reserves[outputToken]);
  let denom = reserves[inputToken].plus(gamma.times(totalInput));
  return num.div(denom);
}

function getOutputDoubleHop(
  pools,
  inputToken,
  middleToken,
  outputToken,
  totalInput
) {
  var totalInput = new Big(totalInput);
  for (var poolIndex in pools) {
    let p = pools[poolIndex];
    p['gamma'] = new Big(10000).minus(new Big(p.fee)).div(new Big(10000));
  }
  let p1 = pools[0];
  let p2 = pools[1];

  if (inputToken === p1.token1Id && middleToken === p1.token2Id) {
    // forward Pool
    p1['reserves'] = {
      [inputToken]: new Big(p1.token1Supply),
      [middleToken]: new Big(p1.token2Supply),
    };
  } else if (middleToken === p1.token1Id && inputToken === p1.token2Id) {
    //reverse pool
    p1['reserves'] = {
      [middleToken]: new Big(p1.token1Supply),
      [inputToken]: new Big(p1.token2Supply),
    };
  }

  if (middleToken === p2.token1Id && outputToken === p2.token2Id) {
    // forward Pool
    p2['reserves'] = {
      [middleToken]: new Big(p2.token1Supply),
      [outputToken]: new Big(p2.token2Supply),
    };
  } else if (outputToken === p2.token1Id && middleToken === p2.token2Id) {
    //reverse pool
    p2['reserves'] = {
      [outputToken]: new Big(p2.token1Supply),
      [middleToken]: new Big(p2.token2Supply),
    };
  }

  let c1 = new Big(p1.reserves[middleToken]);
  let a1 = new Big(p1.reserves[inputToken]);
  let c2 = new Big(p2.reserves[middleToken]);
  let b2 = new Big(p2.reserves[outputToken]);
  let gamma1 = p1.gamma;
  let gamma2 = p2.gamma;
  let num = totalInput.times(c1).times(b2).times(gamma1).times(gamma2);
  let denom = c2
    .times(a1)
    .plus(
      totalInput.times(c2.times(gamma1).plus(c1.times(gamma1).times(gamma2)))
    );
  // denom = c2*a1 + totalInput * (c2*gamma1 + c1*gamma1*gamma2)

  return num.div(denom);
}

function getOutputFromRoute(route, nodeRoute, allocation) {
  if (new Big(allocation).eq(new Big(0))) {
    return new Big(0);
  } else {
    var allocation = new Big(allocation);
  }
  if (!route.length) {
    route = [route];
  }
  if (route.length == 1) {
    // single hop
    let inputToken = nodeRoute[0];
    let outputToken = nodeRoute[1];
    let pool = route[0];
    var output = getOutputSingleHop(pool, inputToken, outputToken, allocation);
  } else if (route.length == 2) {
    // DOUBLE HOP
    let inputToken = nodeRoute[0];
    let middleToken = nodeRoute[1];
    let outputToken = nodeRoute[2];
    let pools = route;
    var output = getOutputDoubleHop(
      pools,
      inputToken,
      middleToken,
      outputToken,
      allocation
    );
  }
  return output;
}

function getOptOutputVec(routes, nodeRoutes, totalInput) {
  let allocations = getOptimalAllocationForRoutes(
    routes,
    nodeRoutes,
    totalInput
  );
  let result = [];
  for (var i in routes) {
    let route = routes[i];
    let nodeRoute = nodeRoutes[i];
    let allocation = allocations[i];
    let output = getOutputFromRoute(route, nodeRoute, allocation);
    result.push(output);
  }
  return {
    result: result,
    allocations: allocations,
  };
  //NOTE -- I made this return an object instead of the tuple returned in python. need to check the places it is called, and specify
  // result field instead of tuple 0 position, and allocations field instead of tuple 1 position.
}

function getBestOptInputAndOutputSlower(routes, nodeRoutes, totalInput) {
  let refDict = getOptOutputVecRefined(routes, nodeRoutes, totalInput);
  let outputRefined = refDict.result;
  let inputRefined = refDict.allocations;
  inputRefined = checkIntegerSumOfAllocations(inputRefined, totalInput);
  let rawDict = getOptOutputVec(routes, nodeRoutes, totalInput);
  let outputRaw = rawDict.result;
  let inputRaw = rawDict.allocations;
  inputRaw = checkIntegerSumOfAllocations(inputRaw, totalInput);
  let res1 = new Big(0);
  let res2 = new Big(0);

  for (var n in outputRefined) {
    res1 = res1.plus(outputRefined[n]);
  }
  for (var nn in outputRaw) {
    res2 = res2.plus(outputRaw[nn]);
  }
  // console.log('COMPARING SINGLE HOPS VS DOUBLE')
  // console.log(res1.toString())
  // console.log(res2.toString())
  if (res1.gt(res2)) {
    return { input: inputRefined, output: res1 };
  } else {
    return { input: inputRaw, output: res2 };
  }
}

function getBestOptInputAndOutput(routes, nodeRoutes, totalInput) {
  // let refDict = getOptOutputVecRefined(routes, nodeRoutes, totalInput);
  // let outputRefined = refDict.result;
  // let inputRefined = refDict.allocations;
  // inputRefined = checkIntegerSumOfAllocations(inputRefined, totalInput);
  let rawDict = getOptOutputVec(routes, nodeRoutes, totalInput);
  let outputRaw = rawDict.result;
  let inputRaw = rawDict.allocations;
  inputRaw = checkIntegerSumOfAllocations(inputRaw, totalInput);
  let res1 = new Big(0);
  let res2 = new Big(0);

  let res = outputRaw
    .map((v) => new Big(v))
    .reduce((bv1, bv2) => bv1.plus(bv2), new Big(0));

  return {
    input: inputRaw,
    output: res,
  };
}

function getBestOptOutput(routes, nodeRoutes, totalInput) {
  let outputRefined = getOptOutputVecRefined(
    routes,
    nodeRoutes,
    totalInput
  ).result;
  let outputRaw = getOptOutputVec(routes, nodeRoutes, totalInput).result;
  let res1 = new Big(0);
  let res2 = new Big(0);

  for (var n in outputRefined) {
    res1 = res1.plus(outputRefined[n]);
  }
  for (var nn in outputRaw) {
    res2 = res2.plus(outputRaw[nn]);
  }
  if (res1.gt(res2)) {
    return res1;
  } else {
    return res2;
  }
}

function getBestOptInput(routes, nodeRoutes, totalInput) {
  let refDict = getOptOutputVecRefined(routes, nodeRoutes, totalInput);
  let outputRefined = refDict.result;
  let inputRefined = refDict.allocations;
  inputRefined = checkIntegerSumOfAllocations(inputRefined, totalInput);
  let rawDict = getOptOutputVec(routes, nodeRoutes, totalInput);
  let outputRaw = rawDict.result;
  let inputRaw = rawDict.allocations;
  inputRaw = checkIntegerSumOfAllocations(inputRaw, totalInput);
  let res1 = new Big(0);
  let res2 = new Big(0);

  for (var n in outputRefined) {
    res1 = res1.plus(outputRefined[n]);
  }
  for (var nn in outputRaw) {
    res2 = res2.plus(outputRaw[nn]);
  }
  // console.log('COMPARING SINGLE HOPS VS DOUBLE')
  // console.log(res1.toString())
  // console.log(res2.toString())
  if (res1.gt(res2)) {
    return inputRefined;
  } else {
    return inputRaw;
  }
}

function getOptOutputVecRefined(routes, nodeRoutes, totalInput) {
  // need to calculate full result.
  // if direct pools exist, need to calculate parallel result. if not, this portion is set to zero output.

  // need to compare between outputs of the two results above.

  let initLengthRoutes = routes.length;
  let directRouteInds = [];
  for (var routeInd in routes) {
    let route = routes[routeInd];
    if (!route.length) {
      route = [route];
    }
    if (route.length == 1) {
      directRouteInds.push(routeInd);
    }
  }
  // console.log('DIRECT ROUTE INDS ARE')
  // console.log(directRouteInds)
  // if (directRouteInds.length < 1) {
  var fullResultAllocations = getOptimalAllocationForRoutes(
    routes,
    nodeRoutes,
    totalInput
  );
  var fullResult = [];
  for (var i in routes) {
    let r = routes[i];
    let nr = nodeRoutes[i];
    let a = fullResultAllocations[i];
    let output = getOutputFromRoute(r, nr, a);
    fullResult.push(output);
  }
  var fullResultTotal = fullResult.reduce((a, b) => a.plus(b), new Big(0));

  // } else {
  if (directRouteInds.length > 0) {
    // console.log('DOING SINGLE HOP ONLY')
    let droutes = [];
    let dnodeRoutes = [];
    for (var dri in directRouteInds) {
      let ind = directRouteInds[dri];
      droutes.push(routes[ind]);
      dnodeRoutes.push(nodeRoutes[ind]);
    }
    let dallocations = getOptimalAllocationForRoutes(
      droutes,
      dnodeRoutes,
      totalInput
    );
    let dallocDict = {};
    for (var dd in dallocations) {
      dallocDict[directRouteInds[dd]] = dallocations[dd];
    }
    var pallocations = [];

    for (var ii = 0; ii < initLengthRoutes; ii++) {
      if (directRouteInds.includes(ii.toString())) {
        //console.log('ADDING ALLOCATION FOR SINGLE ROUTE')
        pallocations.push(dallocDict[ii]);
      } else {
        pallocations.push(new Big(0));
      }
    }
    var presult = [];
    for (var j in routes) {
      let route = routes[j];
      let nodeRoute = nodeRoutes[j];
      let allocation = pallocations[j];
      let output = getOutputFromRoute(route, nodeRoute, allocation);
      presult.push(output);
    }
    var presultTotal = presult.reduce((a, b) => a.plus(b), new Big(0));
  } else {
    var presultTotal = new Big(0);
  }
  if (presultTotal.gt(fullResultTotal)) {
    var result = presult;
    var allocations = pallocations;
  } else {
    var result = fullResult;
    var allocations = fullResultAllocations;
  }
  // NEED TO COMPARE BETWEEEN DIRECT AND MULTI HOP TO GET BEST OUTPUT
  return {
    result: result,
    allocations: allocations,
  };
}

async function getBestOptimalAllocationsAndOutputs(
  pools,
  inputToken,
  outputToken,
  totalInput,
  maxPathLength = 3,
  threshold = 0.001
) {
  var totalInput = new Big(totalInput);
  let paths = await getPathsFromPools(
    pools,
    inputToken,
    outputToken,
    maxPathLength
  );
  if (!paths.length) {
    return {
      allocations: [],
      outputs: new Big(0),
      routes: [],
      nodeRoutes: [],
    };
  }
  let poolChains = await getPoolChainFromPaths(paths, pools, threshold);

  let routes = await getRoutesFromPoolChain(poolChains);
  let nodeRoutes = await getNodeRoutesFromPathsAndPoolChains(paths, poolChains);
  // let allocations = await getBestOptInput(routes, nodeRoutes, totalInput);
  // // fix integer rounding for allocations:
  // allocations = checkIntegerSumOfAllocations(allocations, totalInput);
  // let outputs = getBestOptOutput(routes, nodeRoutes, totalInput);
  let inputOutput = await getBestOptInputAndOutput(
    routes,
    nodeRoutes,
    totalInput
  );
  let allocations = inputOutput.input;
  let outputs = inputOutput.output;

  return {
    allocations: allocations,
    outputs: outputs,
    routes: routes,
    nodeRoutes: nodeRoutes,
  };
}

function getHopsFromRoutes(routes, nodeRoutes, allocations) {
  let hops = [];
  for (var i in routes) {
    var route = routes[i];
    var nodeRoute = nodeRoutes[i];
    var allocation = allocations[i];
    if (!route.length) {
      route = [route];
    }
    if (!route[0]) {
      continue;
    }
    let hop = {
      pool: route[0],
      allocation: allocation,
      inputToken: nodeRoute[0],
      outputToken: nodeRoute[1],
    };
    hops.push(hop);
  }
  return hops;
}

function distillHopsByPool(hops) {
  // console.log('some HOPS =');
  // console.log(hops);
  let distilledHops = [];
  let poolIds = [];
  let poolId2allocation = {};
  for (var i in hops) {
    let hop = hops[i];
    if (hop.allocation === '0') {
      continue;
    }
    // console.log(`HOP ${i} IS...`);
    // console.log(hop);
    let poolId = hop.pool['id'];
    if (poolIds.includes(poolId)) {
      poolId2allocation[poolId] = new Big(poolId2allocation[poolId])
        .plus(new Big(hop.allocation))
        .toString();
    } else {
      poolId2allocation[poolId] = new Big(hop.allocation).toString();
      poolIds.push(poolId);
    }
  }
  // let poolsWithOrder = [...new Set(...hops.map((item) => item.pool))]
  let keys = Object.keys(poolId2allocation);
  for (var j in keys) {
    var poolId = keys[j];
    let hop = hops.filter(
      (item) => item.pool.id.toString() === poolId.toString()
    )[0];
    let distilledHop = {
      pool: hop.pool,
      allocation: poolId2allocation[poolId],
      inputToken: hop.inputToken,
      outputToken: hop.outputToken,
    };
    distilledHops.push(distilledHop);
  }
  return distilledHops;
}

function getDistilledHopActions(distilledHops, slippageTolerance) {
  let actions = [];
  for (var i in distilledHops) {
    let hop = distilledHops[i];
    let expectedAmountOut = getOutputSingleHop(
      hop.pool,
      hop.inputToken,
      hop.outputToken,
      hop.allocation
    );
    let minimumAmountOut = new Big(expectedAmountOut)
      .times(new Big(1).minus(new Big(slippageTolerance).div(100)))
      .round()
      .toString(); //Here, assume slippage tolerance is a percentage. So 1% would be 1.0
    let action = {
      pool_id: hop.pool.id,
      token_in: hop.inputToken,
      token_out: hop.outputToken,
      amount_in: hop.allocation,
      min_amount_out: minimumAmountOut,
    };
    actions.push(action);
  }
  return actions;
}
function getMiddleTokenTotalsFromFirstHopActions(firstHopActions) {
  let middleTokens = [
    ...new Set(firstHopActions.map((item) => item.token_out)),
  ];
  let middleTokenTotals = {};
  for (var i in middleTokens) {
    let middleToken = middleTokens[i];
    let mtActions = firstHopActions.filter(
      (item) => item.token_out === middleToken
    );
    let mtTotal = mtActions
      .map((item) => new Big(item.min_amount_out))
      .reduce((a, b) => a.plus(b), new Big(0))
      .toString();
    middleTokenTotals[middleToken] = mtTotal;
  }
  return middleTokenTotals;
}
function getRoutesAndAllocationsForMiddleToken(
  routes,
  nodeRoutes,
  allocations,
  middleToken,
  middleTokenTotal
) {
  // get routes that use middle token.
  // (input route alloction) /sum(input allocations of routes with middle token) * (total_middleToken)
  let mask = [];
  for (var i in nodeRoutes) {
    if (nodeRoutes[i][1] === middleToken) {
      mask.push(true);
    } else {
      mask.push(false);
    }
  }
  let froutes = [];
  let fallocations = [];
  let fnoderoutes = [];
  for (var i in routes) {
    if (mask[i]) {
      froutes.push(routes[i]);
      fallocations.push(allocations[i]);
      fnoderoutes.push(nodeRoutes[i]);
    }
  }
  let sumfallocations = fallocations.reduce(
    (a, b) => new Big(a).plus(new Big(b)),
    new Big(0)
  );
  let middleAllocations = fallocations.map((item) =>
    new Big(item).div(sumfallocations).times(new Big(middleTokenTotal))
  );
  let secondHopRoutes = froutes.map((item) => [item[1]]);
  let secondHopNodeRoutes = fnoderoutes.map((item) => [item[1], item[2]]);
  middleAllocations = checkIntegerSumOfAllocations(
    middleAllocations,
    middleTokenTotal
  );
  return {
    routes: secondHopRoutes,
    nodeRoutes: secondHopNodeRoutes,
    allocations: middleAllocations,
  };
}

function getHopActionsFromRoutes(routes, nodeRoutes, allocations) {
  // console.log('INSIDE GET HOP ACTIONS FROM ROUTES');
  // console.log('ROUTES ARE...');
  // console.log(routes);
  // console.log('NODE ROUTES ARE...');
  // console.log(nodeRoutes);
  // console.log('ALLOCATIONS ARE...');
  // console.log(allocations);
  let totalInput = allocations
    .map((a) => new Big(a))
    .reduce((a, b) => a.plus(b), new Big(0))
    .toString();
  let hops = [];
  for (var i in routes) {
    var route = routes[i];
    var nodeRoute = nodeRoutes[i];
    var allocation = allocations[i];
    if (new Big(allocation).eq(new Big(0))) {
      continue;
    }
    if (!route.length) {
      route = [route];
    }
    if (!route[0]) {
      continue;
    }
    for (var j in route) {
      let pool = route[j];
      // console.log('J IS...');
      // console.log(j);
      // console.log('NODE ROUTE IS...');
      // console.log(nodeRoute);
      if (j == 0) {
        //first hop.
        // console.log(nodeRoute[0]);
        // console.log(nodeRoute[1]);
        var hop = {
          pool: pool,
          allocation: allocation.toString(),
          inputToken: nodeRoute[0],
          outputToken: nodeRoute[1],
          nodeRoute: nodeRoute,
          route: route,
          allRoutes: routes,
          allNodeRoutes: nodeRoutes,
          totalInputAmount: totalInput,
          allAllocations: allocations,
        };
        // console.log('FIRST HOP IS...');
        // console.log(hop);
        hops.push(hop);
        if (nodeRoute.length > 2) {
          var middleTokenAllocation = getOutputSingleHop(
            pool,
            nodeRoute[0],
            nodeRoute[1],
            allocation
          );
        }
      } else {
        // second hop
        var hop = {
          pool: pool,
          allocation: middleTokenAllocation.toString(),
          inputToken: nodeRoute[1],
          outputToken: nodeRoute[2],
          nodeRoute: nodeRoute,
          route: route,
          allRoutes: routes,
          allNodeRoutes: nodeRoutes,
          totalInputAmount: totalInput,
          allAllocations: allocations,
        };
        // console.log('SECOND HOP IS...');
        // console.log(hop);
        hops.push(hop);
      }
    }
  }
  // console.log('HOP ACTIONS FOUND TO BE');
  // console.log(hops);
  return hops;
}

// TODO: Clean this function. I don't need all the "actions" just the hops.
// TODO: re-order actions to ensure each route is complete with zero input for second hop before starting next route.
function getActionListFromRoutesAndAllocations(
  routes,
  nodeRoutes,
  allocations
) {
  // REPLACE THE CODE BELOW WITH THE FUNCTION HERE.
  return getHopActionsFromRoutes(routes, nodeRoutes, allocations);
  var actions = [];
  var all_hops = [];
  let firstHops = getHopsFromRoutes(routes, nodeRoutes, allocations);

  firstHops = firstHops.filter((hop) => new Big(hop.allocation).gt(new Big(0)));
  all_hops.push(...firstHops);
  let distilledFirstHops = distillHopsByPool(firstHops);
  let firstHopActions = getDistilledHopActions(
    distilledFirstHops,
    slippageTolerance
  );
  actions.push(...firstHopActions);
  let middleTokenTotals =
    getMiddleTokenTotalsFromFirstHopActions(firstHopActions);
  // console.log('first hop actions are...');
  // console.log(firstHopActions);
  let middleTokens = Object.keys(middleTokenTotals);
  // console.log('middle token totals are...');
  // console.log(middleTokenTotals);
  // console.log('middle tokens are...');
  // console.log(middleTokens);
  for (var tokenIndex in middleTokens) {
    var secondHops = [];
    let middleToken = middleTokens[tokenIndex];
    // console.log('current middle token is ');
    // console.log(middleToken);
    let middleTokenTotal = middleTokenTotals[middleToken];
    // console.log('current middle token total is...');
    // console.log(middleTokenTotal);
    let middleTokenRoutesWithAllocations =
      getRoutesAndAllocationsForMiddleToken(
        routes,
        nodeRoutes,
        allocations,
        middleToken,
        middleTokenTotal
      );
    // console.log('current middle tokens routes with allocations are...');
    // console.log(middleTokenRoutesWithAllocations);
    let middleTokenRoutes = middleTokenRoutesWithAllocations.routes;
    let middleTokenAllocations = middleTokenRoutesWithAllocations.allocations;
    let middleTokenNodeRoutes = middleTokenRoutesWithAllocations.nodeRoutes;
    // console.log('middle token routes are...');
    // console.log(middleTokenRoutes);
    // console.log('middle token allocations are...');
    // console.log(middleTokenAllocations);
    // console.log('middle token node routes are...');
    // console.log(middleTokenNodeRoutes);
    secondHops.push(
      ...getHopsFromRoutes(
        middleTokenRoutes,
        middleTokenNodeRoutes,
        middleTokenAllocations
      )
    );
    // console.log('CURRENT SECOND HOPS', secondHops);
    // console.log(secondHops.length);
    // console.log(secondHops.map((hop) => hop.allocation));
    // console.log('filter out zero allocation 2nd hops:');
    secondHops = secondHops.filter((hop) =>
      new Big(hop.allocation).gt(new Big(0))
    );
    // console.log(secondHops);
    all_hops.push(...secondHops);
    // console.log('second hops are currently...');
    // console.log(secondHops);
    let distilledSecondHopsForToken = distillHopsByPool(secondHops);
    // console.log('distilled second hops are...');
    let secondHopActionsForToken = getDistilledHopActions(
      distilledSecondHopsForToken,
      slippageTolerance
    );
    // console.log(secondHopActionsForToken);
    actions.push(...secondHopActionsForToken);
  }

  //TODO: NEED TO RUN INTEGER ROUNDING FUNCTION ON MIDDLE TOKEN ALLOCATIONS

  // TODO: check the node routes. for double-hop cases, find the hop action for each hop.
  // For now, we are assuming no parallel swaps if there is a double-hop.

  // Possible cases:
  //  (1) 1 single-hop.
  //  (2) Parallel single-hop ?
  //  (3) 1 double-hop
  //  (4) 2 double-hops

  // We only have to worry about re-ordering the actions for cases (3) and (4).

  let orderedHops = orderHops(all_hops, routes, nodeRoutes, allocations);

  // console.log('ALL HOPS', all_hops);
  return orderedHops;
  // return actions;
}

function orderHops(hops, routes, nodeRoutes, allocations) {
  // first get rid of zero allocation routes
  // console.log('NODE ROUTES ARE...');
  // console.log(nodeRoutes);
  let filteredRoutes = [];
  let filteredNodeRoutes = [];
  let filteredAllocations = [];
  for (var i in routes) {
    // remove zero-allocation routes.
    let allocation = new Big(allocations[i]);
    if (allocation.gt(new Big(0))) {
      filteredAllocations.push(allocation);
      filteredRoutes.push(routes[i]);
      filteredNodeRoutes.push(nodeRoutes[i]);
    }
    // console.log('FILTERED NODE ROUTES ARE...');
    // console.log(filteredNodeRoutes);
  }
  // next check node routes to see if it is case 1, 2, 3, or 4.
  // Possible cases:
  //  (1) 1 single-hop.
  //  (2) Parallel single-hop ?
  //  (3) 1 double-hop
  //  (4) 2 double-hops

  if (filteredNodeRoutes.length === 1) {
    // only one route.
    let currentNodeRoute = filteredNodeRoutes[0];
    if (currentNodeRoute.length === 2) {
      // case 1.
      return hops;
    } else {
      // case 3. assume there are only 3 nodes (double-hop)
      //make sure order of hops is such that input token precedes output token.
      //make sure the amount_in for second hop is zero (which will grab all of output of first hop to use.)
      let firstHop = hops.filter(
        (hop) => hop.inputToken === currentNodeRoute[0]
      )[0];
      let secondHop = hops.filter(
        (hop) => hop.inputToken === currentNodeRoute[1]
      )[0];
      // set second hop amount in to 0 so that it will use whatever was generated by hop 1.
      secondHop.pool.partialAmountIn = '0';

      let orderedHops = [firstHop, secondHop];
      return orderedHops;
    }
  } else if (filteredNodeRoutes.length === 2) {
    // two routes.
    let lengthNodeRoutes = filteredNodeRoutes.map((nr) => nr.length);
    // sub cases:
    // [2,2] -- parallel swap. (direct) -- case 2
    // [2,3] -- direct swap in parallel with double hop.
    // [3,2] -- double hop in parallel with direct swap.
    // [3,3] -- double hop in parallel with double hop. -- case 4
    let orderedHops = [];
    if (arrayEquals(lengthNodeRoutes, [2, 2])) {
      return hops;
    } else if (arrayEquals(lengthNodeRoutes, [2, 3])) {
      directNodeRoute = filteredNodeRoutes[0];
      doubleNodeRoute = filteredNodeRoutes[1];
      let firstHop = hops.filter(
        (hop) =>
          hop.inputToken === directNodeRoute[0] &&
          hop.outputToken === directNodeRoute[1]
      )[0];
      let secondHop = hops.filter(
        (hop) => hop.inputToken === doubleNodeRoute[0]
      )[0];
      let thirdHop = hops.filter(
        (hop) => hop.outputToken === doubleNodeRoute[2]
      )[0];
      // set third hop amount in to 0 so that it will use whatever was generated by hop 2.
      thirdHop.pool.partialAmountIn = '0';
      orderedHops = [firstHop, secondHop, thirdHop];
      return orderedHops;
    } else if (arrayEquals(lengthNodeRoutes, [3, 2])) {
      directNodeRoute = filteredNodeRoutes[1];
      doubleNodeRoute = filteredNodeRoutes[0];
      let firstHop = hops.filter(
        (hop) =>
          hop.inputToken === directNodeRoute[0] &&
          hop.outputToken === directNodeRoute[1]
      )[0];
      let secondHop = hops.filter(
        (hop) => hop.inputToken === doubleNodeRoute[0]
      )[0];
      let thirdHop = hops.filter(
        (hop) => hop.outputToken === doubleNodeRoute[2]
      )[0];
      // set third hop amount in to 0 so that it will use whatever was generated by hop 2.
      thirdHop.pool.partialAmountIn = '0';
      orderedHops = [firstHop, secondHop, thirdHop];
      return orderedHops;
    } else if (arrayEquals(lengthNodeRoutes, [3, 3])) {
      orderedHops = [];

      for (var i in filteredNodeRoutes) {
        let doubleNodeRoute = filteredNodeRoutes[i];
        let doubleHopMiddleToken = doubleNodeRoute[1];
        let firstHop = hops.filter(
          (hop) =>
            hop.inputToken === doubleNodeRoute[0] &&
            hop.outputToken === doubleHopMiddleToken
        )[0];
        let secondHop = hops.filter(
          (hop) =>
            hop.inputToken === doubleHopMiddleToken &&
            hop.outputToken === doubleNodeRoute[2]
        )[0];
        // set second hop amount in to 0 so that it will use whatever was generated by hop 1.
        secondHop.pool.partialAmountIn = '0';
        orderedHops.push(firstHop);
        orderedHops.push(secondHop);
      }
      return orderedHops;
    } else {
      return hops;
    }
    for (var i in filteredNodeRoutes) {
      let currentNodeRoute = filteredNodeRoutes[i];
      if (currentNodeRoute.length === 2) {
      }
    }
  }

  return hops;
}

// function getActionListFromRoutesAndAllocationsORIG(
//   routes,
//   nodeRoutes,
//   allocations,
//   slippageTolerance
// ) {
//   let actions = [];
//   for (var i in routes) {
//     let route = routes[i];
//     let nodeRoute = nodeRoutes[i];
//     let allocation = new Big(allocations[i]);
//     if (allocation.eq(new Big(0))) {
//       continue;
//     }
//     if (!route.length) {
//       route = [route];
//     }
//     if (route.length === 1) {
//       //single hop. only one action.
//       let pool = route[0];
//       let poolId = pool.id;
//       let inputToken = nodeRoute[0];
//       let outputToken = nodeRoute[1];
//       let expectedAmountOut = getOutputSingleHop(
//         pool,
//         inputToken,
//         outputToken,
//         allocation
//       );
//       let minimumAmountOut = expectedAmountOut
//         .times(new Big(1).minus(new Big(slippageTolerance).div(100)))
//         .round()
//         .toString(); //Here, assume slippage tolerance is a percentage. So 1% would be 1.0
//       let action = {
//         pool_id: poolId,
//         token_in: inputToken,
//         token_out: outputToken,
//         amount_in: allocation.round().toString(),
//         min_amount_out: minimumAmountOut.toString(),
//       };
//       actions.push(action);
//     } else if (route.length === 2) {
//       // double hop. two actions.
//       let pool1 = route[0];
//       let pool2 = route[1];
//       let pool1Id = pool1.id;
//       let pool2Id = pool2.id;
//       let inputToken = nodeRoute[0];
//       let middleToken = nodeRoute[1];
//       let outputToken = nodeRoute[2];
//       let expectedAmountOutFirstHop = getOutputSingleHop(
//         pool1,
//         inputToken,
//         middleToken,
//         allocation
//       );
//       let minimumAmountOutFirstHop = expectedAmountOutFirstHop
//         .times(new Big(1).minus(new Big(slippageTolerance).div(100)))
//         .round()
//         .toString(); //Here, assume slippage tolerance is a percentage. So 1% would be 1.0

//       let action1 = {
//         pool_id: pool1Id,
//         token_in: inputToken,
//         token_out: middleToken,
//         amount_in: allocation.round().toString(),
//         min_amount_out: minimumAmountOutFirstHop,
//       };
//       let expectedFinalAmountOut = getOutputSingleHop(
//         pool2,
//         middleToken,
//         outputToken,
//         minimumAmountOutFirstHop
//       );
//       let minimumAMountOutSecondHop = expectedFinalAmountOut
//         .times(new Big(1).minus(new Big(slippageTolerance).div(100)))
//         .round()
//         .toString();
//       let action2 = {
//         pool_id: pool2Id,
//         token_in: middleToken,
//         token_out: outputToken,
//         amount_in: minimumAmountOutFirstHop,
//         min_amount_out: minimumAMountOutSecondHop,
//       };
//       actions.push(action1);
//       actions.push(action2);
//     }
//   }
//   return actions;
// }

function* range(start, end) {
  for (; start <= end; ++start) {
    yield start;
  }
}

function last(arr) {
  return arr[arr.length - 1];
}

function* numericCombinations(n, r, loc = []) {
  var idx = loc.length;
  if (idx === r) {
    yield loc;
    return;
  }
  for (let next of range(idx ? last(loc) + 1 : 0, n - r + idx)) {
    yield* numericCombinations(n, r, loc.concat(next));
  }
}

function* combinations(arr, r) {
  for (let idxs of numericCombinations(arr.length, r)) {
    yield idxs.map((i) => arr[i]);
  }
}

//     #middleTokenTotals = getMiddleTokenTotals(routes,nodeRoutes,allocations)
//     #TODO: complete this function with middle token checks.

//     #consider all routes of length 2 with non-zero allocation. (double-hops)
//     # among these, check for parallel swaps. That is, check for common node routes
//     # for first hop. Then check for common node routes on second hop.
//     # when common node routes occur for the first hop:
//     # 1. Calculate the total expected output of intermediate token.
//     # 2.
//     # when common node routes occur for the second hop:
//     # 1. get a ratio of the input allocations of the full routes associated with
//     # these common node routes. allocate the total intermediate token output
//     # toward these 2nd hop routes in the same ratio as their route input allocations.

export async function getSmartRouteSwapActions(
  pools,
  inputToken,
  outputToken,
  totalInput,
  maxPathLength = 3,
  threshold = 0.001,
  numberOfRoutesLimit = 2,
  MAX_NUMBER_PARALLEL_POOLS = 4,
  decimalsCulledPoolIds = []
) {
  if (!totalInput) {
    return [];
  }
  var totalInput = new Big(totalInput);

  // remove pools that have an id from the decimalCulledPoolIds
  pools = pools.filter((p) => !decimalsCulledPoolIds.includes(p.id));

  let resDict = await getBestOptimalAllocationsAndOutputs(
    pools,
    inputToken,
    outputToken,
    totalInput,
    maxPathLength,
    threshold
  );

  let allocations = resDict.allocations;

  // let outputs = resDict.outputs;
  let routes = resDict.routes;
  let nodeRoutes = resDict.nodeRoutes;

  let sortedIndexValues = argsort(allocations);
  let topIndices = sortedIndexValues.slice(0, 10);
  var reducedRoutes = [];
  var reducedNodeRoutes = [];
  for (var ind of topIndices) {
    reducedRoutes.push(routes[ind]);
    reducedNodeRoutes.push(nodeRoutes[ind]);
  }
  routes = reducedRoutes;
  nodeRoutes = reducedNodeRoutes;

  // TODO: compare pairs of routes to get the best allocation pair-wise.
  var currentBestOutput = new Big(0);
  var bestResDict = { routes: [] };
  var bestAllocations = resDict.allocations;
  var bestNodeRoutes = resDict.nodeRoutes;
  var bestRoutes = resDict.routes;
  // first check parallel swap with 4 actions. store result.
  var parallelNodeRoutes = [];
  var parallelRoutes = [];
  for (var n in bestRoutes) {
    let currentNodeRoute = bestNodeRoutes[n];
    if (currentNodeRoute.length == 2) {
      parallelNodeRoutes.push(currentNodeRoute);
      parallelRoutes.push(bestRoutes[n]);
    }
  }
  // console.log(`${parallelNodeRoutes.length} parallel routes found...`);
  var bestRoutesAreParallel = false;
  if (parallelNodeRoutes.length > 0) {
    // first calculate the expected result using only parallel routes.
    // let filteredAllocationsAndOutputs = getOptOutputVecRefined(parallelRoutes, parallelNodeRoutes, totalInput);
    let filteredAllocationsAndOutputs = getOptOutputVec(
      parallelRoutes,
      parallelNodeRoutes,
      totalInput
    );
    let parallellAllocations = filteredAllocationsAndOutputs.allocations;
    let parallelOutputs = filteredAllocationsAndOutputs.result;

    if (parallellAllocations.length > MAX_NUMBER_PARALLEL_POOLS) {
      // now sort by allocation value to the top 4 parallel swaps:
      let sortIndices = argsort(parallellAllocations);

      sortIndices = sortIndices.slice(0, MAX_NUMBER_PARALLEL_POOLS);
      var filteredParallelRoutes = [];
      var filteredParallelNodeRoutes = [];
      for (var i in sortIndices) {
        filteredParallelRoutes.push(parallelRoutes[sortIndices[i]]);
        filteredParallelNodeRoutes.push(parallelNodeRoutes[sortIndices[i]]);
      }
      filteredAllocationsAndOutputs = getOptOutputVec(
        filteredParallelRoutes,
        filteredParallelNodeRoutes,
        totalInput
      );
      parallellAllocations = filteredAllocationsAndOutputs.allocations;
      parallelOutputs = filteredAllocationsAndOutputs.result;
    }

    let parallelOutput = parallelOutputs.reduce(
      (a, b) => a.plus(b),
      new Big(0)
    );
    if (new Big(parallelOutput).gt(currentBestOutput)) {
      bestAllocations = parallellAllocations;
      currentBestOutput = parallelOutput;
      // console.log(
      //   'BEST OUTPUT FROM PARALLEL SWAPS IS NOW... ',
      //   currentBestOutput.toString()
      // );
      bestRoutes = parallelRoutes;
      bestNodeRoutes = parallelNodeRoutes;
      bestRoutesAreParallel = true;
    }
  }
  var canHaveTwoRoutes = false;
  // initialize this variable to check if we can have two routes, or if all routes share a pool for an edge case.
  // console.log('THE NUMBER OF ROUTES IS...', routes.length);

  for (var i in routes) {
    for (var j in routes) {
      if (j > i) {
        var route1 = routes[i];
        var route2 = routes[j];
        var nodeRoute1 = nodeRoutes[i];
        var nodeRoute2 = nodeRoutes[j];
        // check if they share a pool.
        let route1PoolIds = new Set(route1.map((r) => r.id));
        let route2PoolIds = new Set(route2.map((r) => r.id));
        var sharePool = false;
        for (var route1PoolId of route1PoolIds) {
          if (route2PoolIds.has(route1PoolId)) {
            sharePool = true;
          }
        }
        if (sharePool) {
          // routes are not independent. skip this pair.
          // console.log('skipping this pair because pool was shared.');
          continue;
        } else {
          canHaveTwoRoutes = true;
          let currentRoutes = [route1, route2];
          let currentNodeRoutes = [nodeRoute1, nodeRoute2];

          let filteredAllocationsAndOutputs = getOptOutputVec(
            currentRoutes,
            currentNodeRoutes,
            totalInput
          );

          let filteredAllocations = filteredAllocationsAndOutputs.allocations;
          let filteredOutputs = filteredAllocationsAndOutputs.result;
          // console.log('FILTERED ALLOCATIONS:');
          // console.log(filteredAllocations.map((i) => i.toString()));
          // console.log(filteredOutputs);
          let totalOutput = filteredOutputs.reduce(
            (a, b) => a.plus(b),
            new Big(0)
          );
          if (new Big(totalOutput).gt(currentBestOutput)) {
            bestAllocations = filteredAllocations;
            currentBestOutput = totalOutput;
            // console.log('BEST OUTPUT IS NOW... ', currentBestOutput.toString());
            bestRoutes = currentRoutes;
            bestNodeRoutes = currentNodeRoutes;
            bestRoutesAreParallel = false;
            // bestResDict = currentResDict
          }

          // if (currentResDict.outputs.gt(currentBestOutput)) {
          // console.log('DIFF IS...', currentResDict.outputs.minus(currentBestOutput).toString());
          // bestResDict = currentResDict;
          // currentBestOutput = bestResDict.outputs;
          // console.log('BEST OUTPUT IS NOW... ', currentBestOutput.toString());
          // console.log(bestResDict.routes);
          // console.log(bestResDict.allocations.map((i) => i.toString()));
          // console.log(bestResDict.outputs.toString());
        }
      }
    }
  }

  if (!canHaveTwoRoutes) {
    // now we need to check through the routes in single manner to find the best one:
    for (var i in routes) {
      let currentRoutes = [routes[i]];
      let currentNodeRoutes = [nodeRoutes[i]];
      // let filteredAllocationsAndOutputs = getOptOutputVecRefined(currentRoutes, currentNodeRoutes, totalInput);
      let filteredAllocationsAndOutputs = getOptOutputVec(
        currentRoutes,
        currentNodeRoutes,
        totalInput
      );

      let filteredAllocations = filteredAllocationsAndOutputs.allocations;
      let filteredOutputs = filteredAllocationsAndOutputs.result;
      // console.log('FILTERED ALLOCATIONS:');
      // console.log(filteredAllocations.map((i) => i.toString()));
      // console.log(filteredOutputs);
      let totalOutput = filteredOutputs.reduce((a, b) => a.plus(b), new Big(0));
      if (new Big(totalOutput).gt(currentBestOutput)) {
        bestAllocations = filteredAllocations;
        currentBestOutput = totalOutput;
        // console.log('BEST OUTPUT IS NOW... ', currentBestOutput.toString());
        bestRoutes = currentRoutes;
        bestNodeRoutes = currentNodeRoutes;
        bestRoutesAreParallel = false;
        // bestResDict = currentResDict
      }
    }
  }

  // resDict = bestResDict;

  allocations = bestAllocations;

  // let outputs = resDict.outputs;
  routes = bestRoutes;
  nodeRoutes = bestNodeRoutes;

  if (routes.length < 1) {
    return [];
  }

  // check the top numberOfRoutesLimit
  // console.log('initial allocations are...');
  // console.log(allocations.map((a) => a.toString()));
  // console.log('fixed allocations are...');
  // console.log(allocations.map((a) => new Big(a).toFixed()));
  //SORT BY ALLOCATIONS
  let allSortedIndices = argsort(allocations.map((a) => new Big(a)));
  if (bestRoutesAreParallel) {
    numberOfRoutesLimit = 4;
  }
  let sortedIndices = allSortedIndices.slice(0, numberOfRoutesLimit);

  // console.log('sorted Indices are');
  // console.log(sortedIndices);
  var filteredRoutes = [];
  var filteredNodeRoutes = [];
  for (var i in sortedIndices) {
    let index = sortedIndices[i];
    filteredRoutes.push(routes[index]);
    filteredNodeRoutes.push(nodeRoutes[index]);
  }

  // console.log('filteredRoutes are ...');
  // console.log(filteredRoutes);
  for (var i in filteredRoutes) {
    if (!filteredRoutes[i].length) {
      filteredRoutes[i] = [filteredRoutes[i]];
    }
  }
  // console.log('filtered Node routes are...');
  // console.log(filteredNodeRoutes);

  // THE BELOW CODE WILL ENSURE THAT ROUTES ARE INDEPENDENT (e.g. THE ROUTES WILL NOT SHARE A POOL)

  let route1PoolIds = filteredRoutes[0].map((pool) => pool.id);
  // console.log('route 1 pool ids:');
  // console.log(route1PoolIds);
  if (filteredRoutes.length > 1) {
    let route2PoolIds = filteredRoutes[1].map((pool) => pool.id);
    // console.log('route 2 pool ids:');
    // console.log(route2PoolIds);
    var sharedRoute = false;
    for (var i in route2PoolIds) {
      if (route1PoolIds.includes(route2PoolIds[i])) {
        // a pool was shared between routes. need to calculate a new second route.
        // console.log(
        //   'a pool was shared between routes. going to calculate a new second route'
        // );
        sharedRoute = true;
        break;
      }
    }
  }

  // NOTE -- this is a much simpler solution than that below. Instead of choosing the next best second route that doesn't share a
  // pool with the first route, we could just use the first route and allocate all inputs to it.
  // but, for larger transactions, it would be better to have option of two independent routes to spread out slippage.

  // if (sharedRoute) {
  //   filteredRoutes = [filteredRoutes[0]];
  //   filteredNodeRoutes = [filteredNodeRoutes[0]];
  //   // TODO -- later can add in a second route that doesn't share a pool with first.
  // }

  // We're going to find the next-highest allocation route that doesn't share a pool with the first route.
  if (sharedRoute) {
    let allFilteredRoutes = [];
    let allFilteredNodeRoutes = [];
    for (var i in allSortedIndices) {
      allFilteredRoutes.push(routes[allSortedIndices[i]]);
      allFilteredNodeRoutes.push(nodeRoutes[allSortedIndices[i]]);
    }
    let firstRoute = allFilteredRoutes[0];
    // console.log('first route is...');
    // console.log(firstRoute);
    let firstRoutePoolIds = firstRoute.map((pool) => pool.id);
    for (var i in allFilteredRoutes) {
      if (!allFilteredRoutes[i].length) {
        allFilteredRoutes[i] = [allFilteredRoutes[i]];
      }
    }
    // console.log('FIRST ROUTE POOL IDS ARE');
    // console.log(firstRoutePoolIds);
    let allFilteredRouteIds = allFilteredRoutes.map((route) =>
      route.map((pool) => pool.id)
    );
    // console.log('allFilteredRouteIds are ...');
    // console.log(allFilteredRouteIds);
    for (var i in allFilteredRouteIds) {
      // console.log('i is', i);
      // console.log('ALL FILTERED ROUTES [i] IS...');
      // console.log(allFilteredRouteIds[i]);
      for (var j in allFilteredRouteIds[i]) {
        // console.log('j is', j);
        // console.log('ALL FILTERED ROUTES [i][j] IS...');
        // console.log(allFilteredRouteIds[i][j]);
        if (firstRoutePoolIds.includes(allFilteredRouteIds[i][j])) {
          break;
        }

        var secondRoute = allFilteredRoutes[i];
        if (!secondRoute.length) {
          secondRoute = [secondRoute];
        }
        filteredRoutes = [allFilteredRoutes[0], secondRoute];
        filteredNodeRoutes = [
          allFilteredNodeRoutes[0],
          allFilteredNodeRoutes[i],
        ];
        break;
      }
    }
    // console.log('new filteredRoutes are ...');
    // console.log(filteredRoutes);
    // console.log('new filtered Node routes are...');
    // console.log(filteredNodeRoutes);
  }

  // let filteredAllocations_check = getBestOptInput(
  //   filteredRoutes,
  //   filteredNodeRoutes,
  //   totalInput
  // );
  // let filteredAllocationsAndOutputs = getOptOutputVecRefined(filteredRoutes, filteredNodeRoutes, totalInput);
  let filteredAllocationsAndOutputs = getOptOutputVec(
    filteredRoutes,
    filteredNodeRoutes,
    totalInput
  );

  let filteredAllocations = filteredAllocationsAndOutputs.allocations;
  let filteredOutputs = filteredAllocationsAndOutputs.result;

  filteredAllocations = checkIntegerSumOfAllocations(
    filteredAllocations,
    totalInput
  ).map((stringAllo) => new Big(stringAllo));

  let hops = getActionListFromRoutesAndAllocations(
    filteredRoutes,
    filteredNodeRoutes,
    filteredAllocations
  );

  var actions = [];
  // console.log('hops are...');
  // console.log(hops);

  for (var i in hops) {
    let hopInputTokenMeta = await ftGetTokenMetadata(hops[i].inputToken);
    let hopOutputTokenMeta = await ftGetTokenMetadata(hops[i].outputToken);
    let hopOutputTokenDecimals = hopOutputTokenMeta.decimals;

    let expectedHopOutput = getOutputSingleHop(
      hops[i].pool,
      hops[i].inputToken,
      hops[i].outputToken,
      hops[i].allocation
    );
    let decimalEstimate = new Big(expectedHopOutput)
      .div(new Big(10).pow(hopOutputTokenDecimals))
      .toString();

    // Need to check if expected Hop Output is > 1. If not, then cull the corresponding pool and re-calculate.
    if (new Big(expectedHopOutput).lt(new Big(1))) {
      // purge the pool and recalculate.

      decimalsCulledPoolIds.push(hops[i].pool.id);
      return getSmartRouteSwapActions(
        pools,
        inputToken,
        outputToken,
        totalInput,
        (maxPathLength = maxPathLength),
        (threshold = threshold),
        (numberOfRoutesLimit = numberOfRoutesLimit),
        (MAX_NUMBER_PARALLEL_POOLS = MAX_NUMBER_PARALLEL_POOLS),
        (decimalsCulledPoolIds = decimalsCulledPoolIds)
      );
    }

    if (
      hops[i].inputToken == inputToken &&
      hops[i].outputToken == outputToken
    ) {
      var status = 'parallel swap';
    } else {
      var status = 'stableSmart';
    }

    let tokens = await Promise.all(
      hops[i].nodeRoute.map(async (t) => await ftGetTokenMetadata(t))
    );

    actions[i] = {
      estimate: decimalEstimate,
      pool: {
        fee: hops[i].pool.fee,
        gamma_bps: new Big(10000).minus(new Big(hops[i].pool.fee)), //.div(new Big(10000)), //hops[i].pool.gamma, //new Big(10000).minus(new Big(hops[i].pool.fee)).div(new Big(10000));
        id: hops[i].pool.id,
        partialAmountIn: new Big(hops[i].allocation).round().toString(),
        supplies: {
          [hops[i].pool.token1Id]: hops[i].pool.token1Supply,
          [hops[i].pool.token2Id]: hops[i].pool.token2Supply,
        },
        token0_ref_price: hops[i].pool.token0_price,
        tokenIds: [hops[i].pool.token1Id, hops[i].pool.token2Id],
        Dex: hops[i].pool.Dex,
      },
      status: status,
      token: hopInputTokenMeta,
      outputToken: hops[i].outputToken,
      inputToken: hops[i].inputToken,
      nodeRoute: hops[i].nodeRoute,
      route: hops[i].route,
      allRoutes: hops[i].allRoutes,
      allNodeRoutes: hops[i].allNodeRoutes,
      totalInputAmount: hops[i].totalInputAmount,
      allAllocations: hops[i].allAllocations,
      tokens: tokens,
      routeInputToken: inputToken,
      routeOutputToken: outputToken,
      overallPriceImpact: '0',
    };
    // console.log('INPUT TOKEN IS...');
    // console.log(hops[i].inputToken);
    actions[i].pool.x = actions[i].pool.supplies[hops[i].inputToken];
    actions[i].pool.y = actions[i].pool.supplies[hops[i].outputToken];
  }
  // now set partial amount in for second hops equal to zero:
  // also, set the total price impact value.
  let overallPriceImpact = await calculateSmartRouteV2PriceImpact(actions);
  for (var i in actions) {
    let action = actions[i];
    action.overallPriceImpact = overallPriceImpact;
    if (action.outputToken === outputToken && action.inputToken != inputToken) {
      // only want to set second hop partial amount in to zero
      action.pool.partialAmountIn = '0';
    }
  }

  return actions;
}

async function calculateSmartRouteV2PriceImpact(actions) {
  // the goal is to take a weighted average of the price impact per route, treating each one at a time.
  // for single hop (parallel swaps), the price impact is calculated as before.
  // for double-hop, the market price, P, is determined using reserves of tokens in each pool in the route.
  // in both cases, we compare the 'market price', P , determined solely by reserves in pools, and the actual
  // average price, R,  expected to be paid in the transaction.
  // the price impact is then defined as (P-R)/R * 100 and is a percentage number, returned as a string.

  // console.log('TRYING TO CALCULATE SMART ROUTE V2 PRICE IMPACT');
  // console.log('actions are...');
  // console.log(actions);

  let deltaY = actions
    .filter((a) => a.outputToken == a.routeOutputToken)
    .map((a) => new Big(a.estimate))
    .reduce((a, b) => a.plus(b), new Big(0));
  // console.log('DELTA Y IS...');
  // console.log(deltaY.toString());

  let inputTokenMeta = actions[0].tokens[0];
  let deltaX = new Big(actions[0].totalInputAmount).div(
    new Big(10).pow(inputTokenMeta.decimals)
  );
  // console.log('DELTA X IS...');
  // console.log(deltaX.toString());
  let R = deltaY.div(deltaX);
  // console.log('R IS...');
  // console.log(R.toString());
  // now we need to calculate P. We do this route by route, and take a weighted average.
  var P = new Big(0);
  let routes = actions[0].allRoutes;
  let nodeRoutes = actions[0].allNodeRoutes;
  let allocations = actions[0].allAllocations.map((a) => new Big(a));
  let totalAllocations = allocations
    .map((a) => new Big(a))
    .reduce((a, b) => a.plus(b), new Big(0));
  // console.log('TOTAL ALLOCATIONS ARE...');
  // console.log(totalAllocations);
  let weights = allocations.map((a) => a.div(totalAllocations));
  // console.log('WEIGHTS ARE...');
  // console.log(weights.map((i) => i.toString()));
  for (var i in routes) {
    let route = routes[i];
    let nodeRoute = nodeRoutes[i];
    let tokens = await Promise.all(
      nodeRoute.map(async (t) => await ftGetTokenMetadata(t))
    );
    let weight = weights[i];
    if (route.length == 1) {
      let num = new Big(route[0].reserves[nodeRoute[0]]).div(
        new Big(10).pow(tokens[0].decimals)
      );
      let denom = new Big(route[0].reserves[nodeRoute[1]]).div(
        new Big(10).pow(tokens[1].decimals)
      );
      var routeMarketPrice = num.div(denom);

      // console.log('ROUTE MARKET PRICE 1 IS...');
      // console.log(new Big(1).div(routeMarketPrice).toString());
    } else {
      let num1 = new Big(route[0].reserves[nodeRoute[0]]).div(
        new Big(10).pow(tokens[0].decimals)
      );

      let denom1 = new Big(route[0].reserves[nodeRoute[1]]).div(
        new Big(10).pow(tokens[1].decimals)
      );

      let num2 = new Big(route[1].reserves[nodeRoute[1]]).div(
        new Big(10).pow(tokens[1].decimals)
      );

      let denom2 = new Big(route[1].reserves[nodeRoute[2]]).div(
        new Big(10).pow(tokens[2].decimals)
      );

      var routeMarketPrice = num1.div(denom1).times(num2).div(denom2);

      // console.log('ROUTE MARKET PRICE 2 IS...');
      // console.log(new Big(1).div(routeMarketPrice).toString());
    }
    P = P.plus(weight.times(new Big(1).div(routeMarketPrice)));
  }
  // console.log('P IS...');
  // console.log(P.toString());
  // now that we have P and R, we can calculate price impact:
  let priceImpact = P.minus(R).div(R).times(new Big(100)).toString();
  return priceImpact;
}

function decor(arr) {
  var res = [];
  for (var i in arr) {
    res.push([arr[i], i]);
  }
  return res;
}
function argsort(arr) {
  let undecor = (a) => a[1]; // leave only index
  let decorated = decor(arr);
  // console.log(decorated);
  // console.log('item by item');
  // console.log(decorated.map((a) => a[0].toString()));
  return decorated
    .sort((a, b) => new Big(b[0]).minus(new Big(a[0])))
    .map(undecor);
}

function getPoolsByToken1ORToken2(pools, token1, token2) {
  let filteredPools = pools.filter(
    (item) =>
      item.token1Id === token1 ||
      item.token2Id === token1 ||
      item.token1Id === token2 ||
      item.token2Id === token2
  );
  return filteredPools;
}

function getPoolsByToken1ANDToken2(
  pools,
  token1,
  token2,
  cullZeroLiquidityPools = true
) {
  let filteredPools = pools.filter(
    (item) =>
      (item.token1Id === token1 && item.token2Id === token2) ||
      (item.token1Id === token2 && item.token2Id === token1)
  );
  if (cullZeroLiquidityPools) {
    filteredPools = filteredPools.filter(
      (item) => item.token1Supply != '0' && item.token2Supply != '0'
    );
  }
  return filteredPools;
}

function getLiqudityOfPoolsFromList(pools) {
  let liquidities = [];
  for (var poolInd in pools) {
    let pool = pools[poolInd];
    pool.amounts = [pool.token1Supply, pool.token2Supply];
    let poolBigAmounts = pool.amounts.map((item) => new Big(item));
    let liquidity = poolBigAmounts[0].times(poolBigAmounts[1]);
    liquidities.push(liquidity);
  }
  return liquidities;
}

function getNormalizedLiquiditiesFromList(pools) {
  let liquidities = getLiqudityOfPoolsFromList(pools);
  let maxLiq = bigMax(liquidities);
  let normalizedLiquidities = liquidities.map((item) => item.div(maxLiq));
  return normalizedLiquidities;
}

function bigMax(arrayOfBigs) {
  if (arrayOfBigs.length < 1) {
    return null;
  }
  let maxElem = arrayOfBigs[0];
  for (var ind in arrayOfBigs) {
    let val = arrayOfBigs[ind];
    if (val.gt(maxElem)) {
      maxElem = val;
    }
  }
  return maxElem;
}

function cullPoolsWithInsufficientLiquidity(pools, threshold = 0.0001) {
  var thresh = new Big(threshold);
  let normLiq = getNormalizedLiquiditiesFromList(pools);
  let filteredPools = [];
  for (var i = 0; i < normLiq.length; i++) {
    if (normLiq[i] > thresh) {
      filteredPools.push(pools[i]);
    }
  }
  return filteredPools;
}

function cartesianProduct(a) {
  let result = a.reduce((a, b) =>
    a.flatMap((d) => b.map((e) => [d, e].flat()))
  );
  return result;
}

function addEdge(g, edge) {
  let src = edge[0];
  let dst = edge[1];
  if (Object.keys(g).includes(src)) {
    if (!Object.keys(g[src]).includes(dst)) {
      g[src][dst] = 1;
    }
  } else {
    g[src] = {};
    g[src][dst] = 1;
  }
  if (Object.keys(g).includes(dst)) {
    if (!Object.keys(g[dst]).includes(src)) {
      g[dst][src] = 1;
    }
  } else {
    g[dst] = {};
    g[dst][src] = 1;
  }
}

function addEdges(g, edgeList) {
  for (var n in edgeList) {
    let edge = edgeList[n];
    addEdge(g, edge);
  }
}

function deleteEdge(g, edge) {
  let gNew = JSON.parse(JSON.stringify(g)); // using this to deep clone graph structure
  let e1 = edge[0];
  let e2 = edge[1];
  if (Object.keys(gNew).includes(e1)) {
    if (Object.keys(gNew[e1]).includes(e2)) {
      delete gNew[e1][e2];
    }
  }
  if (Object.keys(gNew).includes(e2)) {
    if (Object.keys(gNew[e2]).includes(e1)) {
      delete gNew[e2][e1];
    }
  }
  return gNew;
}

function deleteNode(g, node) {
  let gNew = JSON.parse(JSON.stringify(g)); // using this to deep clone graph structure
  if (Object.keys(gNew).includes(node)) {
    delete gNew[node];
  }
  let keys = Object.keys(gNew);
  for (var nodeInd in keys) {
    let nodeNow = keys[nodeInd];
    if (Object.keys(gNew[nodeNow]).includes(node)) {
      delete gNew[nodeNow][node];
    }
  }
  return gNew;
}

function dijkstra(graph, s) {
  var solutions = {};
  solutions[s] = {};
  solutions[s].path = [];
  solutions[s].dist = 0;

  while (true) {
    var parent = null;
    var nearest = null;
    var dist = Infinity;

    //for each existing solution
    for (var n in solutions) {
      if (!solutions[n]) {
        solutions[n] = {};
      }
      if (!solutions[n].path) continue;
      var ndist = solutions[n].dist;
      var adj = graph[n];
      //for each of its adjacent nodes...
      for (var a in adj) {
        //without a solution already...
        if (!solutions[a]) {
          solutions[a] = {};
        }
        if (solutions[a].path) continue;
        //choose nearest node with lowest *total* cost
        var d = adj[a] + ndist;
        if (d < dist) {
          //reference parent
          parent = solutions[n].path;
          nearest = a;
          dist = d;
        }
      }
    }

    //no more solutions
    if (dist === Infinity) {
      break;
    }

    //extend parent's solution path
    solutions[nearest].path = parent.concat(nearest);
    //extend parent's cost
    solutions[nearest].dist = dist;
  }

  return solutions;
}

function shortestPath(g, src, dst, ignore_nodes = [], ignore_edges = []) {
  let gTemp = JSON.parse(JSON.stringify(g)); // using this to deep clone graph structure. If we can use lodash, could use  _.cloneDeep(obj)
  // remove nodes
  for (var nodeInd in ignore_nodes) {
    let nodeNow = ignore_nodes[nodeInd];
    gTemp = deleteNode(gTemp, nodeNow);
  }
  // remove edges
  for (var edgeInd in ignore_edges) {
    let edgeNow = ignore_edges[edgeInd];
    gTemp = deleteEdge(gTemp, edgeNow);
  }
  let solution = dijkstra(gTemp, src)[dst];
  solution.path.unshift(src); // original algorithm doesn't include source node in path
  return solution;
}

function* count(firstval = 0, step = 1) {
  let x = firstval;
  while (true) {
    yield x;
    x = x + 1;
  }
}

class PathBuffer {
  constructor() {
    this.paths = [];
    this.sortedpaths = [];
    //this.counter = count();
  }
  len() {
    return this.sortedpaths.length;
  }

  push(cost, path) {
    if (path && !arrayContains(this.paths, path)) {
      this.sortedpaths.push([cost, path]);
      this.sortedpaths.sort(function (a, b) {
        return a[0] - b[0];
      });
      //heappush(this.sortedpaths, (cost, this.counter.next().value,path));
      this.paths.push(path);
    }
  }

  pop() {
    //let val = heappop(this.sortedpaths);
    let val = this.sortedpaths.shift();
    let cost = val[0];
    let path = val[1];
    this.paths.splice(this.paths.indexOf(path), 1);
    return path;
  }
}

function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

function arrayContains(arr, obj) {
  // checks to see if the input array contains a reference object, obj, using
  // JSON.stringify() .
  let obj_json = JSON.stringify(obj);
  for (var itemInd in arr) {
    if (JSON.stringify(arr[itemInd]) == obj_json) {
      return true;
    }
  }
  return false;
}

function* yenFromPy(g, source, target) {
  //adapted from the python implementation in networkx.algorithms.simple_paths.shortest_simple_paths()
  let listA = [];
  let listB = new PathBuffer();
  let prev_path = null;

  while (true) {
    if (!prev_path) {
      let sol = shortestPath(g, source, target);
      let length = sol.dist;
      let path = sol.path;
      listB.push(length, path);
    } else {
      let ignore_nodes = [];
      let ignore_edges = [];
      for (var i = 1; i < prev_path.length; i++) {
        let root = prev_path.slice(0, i);
        let root_length = root.length;
        for (var pathInd in listA) {
          let path = listA[pathInd];

          if (arrayEquals(path.slice(0, i), root)) {
            let edgeToIgnore = [path[i - 1], path[i]];
            ignore_edges.push(edgeToIgnore);
          }
        }
        try {
          let sol = shortestPath(
            g,
            root[root.length - 1],
            target,
            (ignore_nodes = ignore_nodes),
            (ignore_edges = ignore_edges)
          );
          let length = sol.dist;
          let spur = sol.path;
          let path = root.slice(0, root.length - 1).concat(spur);
          listB.push(root_length + length, path);
        } catch (e) {
          //console.log(`yenFromPy error was... ${e}`)
          //dont do anything.
        }
        ignore_nodes.push(root[root.length - 1]);
      }
    }
    if (listB.sortedpaths) {
      try {
        let path = listB.pop();
        yield path;
        listA.push(path);
        prev_path = path;
      } catch (e) {
        break;
      }
    } else {
      break;
    }
  }
}

function getKShortestPaths(g, source, target, k, maxPathLength = 3) {
  let paths = [];
  if (maxPathLength < 2) {
    var maxPathLength = 2;
  }
  let gen = yenFromPy(g, source, target);
  for (var n = 1; n <= k; n++) {
    try {
      let res = gen.next().value;
      if (res && !arrayContains(paths, res)) {
        if (res.length > maxPathLength) {
          // console.log(
          //   `found all hops of length ${
          //     maxPathLength - 1
          //   } or less... breaking out of generator`
          // );
          break;
        }
        paths.push(res);
      }
    } catch (e) {
      break;
    }
  }
  return paths;
}

async function getPathsFromPools(
  pools,
  inputToken,
  outputToken,
  maxPathLength = 3
) {
  let graph = getGraphFromPoolList(pools);
  return getKShortestPaths(graph, inputToken, outputToken, 100, maxPathLength);
}

// function getAllPathsBelowLengthN(g, source, target, N, limit = 1000) {
//     // use Yen's algorithm to find the paths of length N or below between source and target nodes in graph g.
//     let paths = [];
//     let gen = yenFromPy(g, source, target);
//     let currentPathLength = 0;
//     let count = 1;
//     while (currentPathLength <= N) {
//         try {
//             let res = gen.next().value;
//             if (res && !arrayContains(paths, res)) {
//                 if (res.length > currentPathLength) {
//                     currentPathLength = res.length;
//                     if (currentPathLength > N) {
//                         break;
//                     }
//                 }
//                 paths.push(res);
//             }
//             count = count + 1;
//             if (count > limit) {
//                 break;
//             }
//         } catch (e) {
//             break;
//         }
//     }
//     return paths;
// }

async function getAllPathsBelowLengthN(g, source, target, N, limit = 100) {
  // use Yen's algorithm to find the paths of length N or below between source and target nodes in graph g.
  // console.log("working with graph")
  // console.log(g)
  // console.log(`SOURCE IS ${source}`)
  // console.log(`TARGET IS ${target}`)
  let paths = [];
  // console.log('INPUTS TO YENFROMPY:')
  // console.log(g)
  // console.log(source)
  // console.log(target)
  let gen = await yenFromPy(g, source, target);
  let currentPathLength = 0;
  let count = 1;
  while (currentPathLength <= N) {
    //   console.log(`CURRENT PATH LENGTH IS ${currentPathLength}`)
    try {
      let res = await gen.next().value;
      //   console.log(`RES IS ${res}`)
      if (res && !arrayContains(paths, res)) {
        if (res.length > currentPathLength) {
          currentPathLength = res.length;
          if (currentPathLength > N) {
            break;
          }
        }
        paths.push(res);
      }
      count = count + 1;
      if (count > limit) {
        break;
      }
    } catch (e) {
      //   console.log(e)
      break;
    }
  }
  return paths;
}

function getGraphFromPoolList(poolList) {
  let pools = poolList.filter(
    (item) => item.token1Supply != '0' && item.token2Supply != '0'
  );
  let transitions = pools.map((item) => [item.token1Id, item.token2Id]);
  let g = {};
  addEdges(g, transitions);
  return g;
}

////////////////////////////////////

// MAIN FUNCTION

////////////////////////////////////

// TODO -- incorporate the following integrated function, which tries to
// account for stablecoins within the context of smart routing.

//TODO -- need the right API / hooks for GETSTABLESWAPACTION function and GETPARALLELSWAPACTIONS functions.

//TODO -- transform the actions generated in this function into tranaction to execute.

//TRYING: GETSTABLESWAPACTION <==> instantSwapGetTransactions

async function GETSTABLESWAPACTION(
  inputToken,
  outputToken,
  amountIn,
  slippageTolerance
) {
  var pool_id = STABLE_POOL_ID;
  // console.log('POOL ID IS...');
  // console.log(pool_id);
  if (!pool_id) {
    var pool_id = STABLE_POOL_ID;
  }
  let stablePool = await getStablePool(pool_id);
  // let StablePoolInfo = await getPoolInfo() from stable-swap?
  // console.log('STABLE POOL VAR IS...');
  // console.log(stablePool);
  // console.log('INPUT TOKEN IS...');
  // console.log(inputToken);
  // console.log('OUTPUT TOKEN IS...');
  // console.log(outputToken);
  let inputTokenMeta = await ftGetTokenMetadata(inputToken);
  let amountInScaled = new Big(amountIn)
    // .div(new Big(10).pow(inputTokenMeta.decimals))
    // .round()
    .toString();
  // console.log('amountInScaled is ...');
  // console.log(amountInScaled);
  const [amount_swapped, fee, dy] = getStableSwappedAmount(
    inputToken,
    outputToken,
    amountInScaled,
    stablePool
  );
  let amount_swapped_scaled = new Big(amount_swapped)
    .div(new Big(10).pow(STABLE_LP_TOKEN_DECIMALS))
    .round()
    .toString();

  let minAmountOut = new Big(amount_swapped_scaled)
    .times(new Big(1).minus(new Big(slippageTolerance).div(100)))
    .round()
    .toString();
  let stableAction = {
    pool_id: pool_id,
    token_in: inputToken,
    token_out: outputToken,
    amount_in: amountIn.toString(),
    min_amount_out: minAmountOut,
    amount_swapped: amount_swapped,
  };
  return stableAction;
  // return await instantSwapGetTransactions(
  //   pool,
  //   inputToken,
  //   outputToken,
  //   amountIn,
  //   minAmountOut
  // );
}

// async function GETPARALLELSWAPACTIONS(
//   pools,
//   inputToken,
//   outputToken,
//   amountIn,
//   slippageTolerance,
//   maxNumberParallelSwaps = 3
// ) {
//   return await getSmartRouteSwapActions(
//     pools,
//     inputToken,
//     outputToken,
//     amountIn,
//     slippageTolerance,
//     2,
//     maxNumberParallelSwaps
//   );
// }

export async function stableSmart(
  pools,
  inputToken,
  outputToken,
  totalInput,
  slippageTolerance
) {
  let smartRouteActions = await getSmartRouteSwapActions(
    pools,
    inputToken,
    outputToken,
    totalInput,
    slippageTolerance
  );
  return smartRouteActions;
}
// if (
//   STABLE_TOKEN_IDS.includes(inputToken) &&
//   STABLE_TOKEN_IDS.includes(outputToken)
// ) {
//   //use stable swap only.
//   console.log('USING STABLE SWAP ONLY...');
//   let firstAction = await GETSTABLESWAPACTION(
//     inputToken,
//     outputToken,
//     totalInput,
//     slippageTolerance
//   );

// let stableAction = await convertStableActionToEstimatesFormat(firstAction);

// return [stableAction];
// ASSUME USER MUST GO TO STABLE SWAP PAGE...
// return [];
//STABLESWAP(poolId=STABLE_POOL_ID, inputToken, outputToken, totalInput, slippageTolerance)
// } else if (
//   STABLE_TOKEN_IDS.includes(inputToken) &&
//   !STABLE_TOKEN_IDS.includes(outputToken)
// ) {
//   // input is stable and output is not.
//   console.log(
//     'INPUT STABLE/ OUTPUT NOT, CHECKING STABLE ROUTES STARTING WITH INPUT...'
//   );

//   // (A) try route inputToken-->stable2-->outputToken (stablePool-->simple pool)
//   // (B) try route inputTokne-->stable3-->outputToken (stablePool-->simple pool)
//   // (C) try normal smart route. (simple Pool-->simple pool)
//   // compare outputs from A,B,C and use the one with maximum return.

//   var partialStableRoutes = [];
//   var bestOutput = new Big(0);
//   var bestStableSwapActions = [];
//   for (var i in STABLE_TOKEN_IDS) {
//     let middleToken = STABLE_TOKEN_IDS[i];
//     if (middleToken === inputToken) {
//       continue;
//     }
//     let secondHopPools = getPoolsByToken1ANDToken2(
//       pools,
//       middleToken,
//       outputToken
//     );
//     console.log('ABOUT TO RUN GETSTABLESWAPACTION');

//     let firstAction = await GETSTABLESWAPACTION(
//       inputToken,
//       middleToken,
//       totalInput,
//       slippageTolerance
//     );
//     let middleTokenAmount = firstAction.min_amount_out;
//     //scale to get minimum_amount_out
//     let minMiddleTokenAmount = new Big(middleTokenAmount)
//       .times(new Big(1).minus(new Big(slippageTolerance).div(100)))
//       .round()
//       .toString();

//     console.log('NOW ABOUT TO DO PARALLEL SWAP ACTIONS FOR SECOND HOP');
//     console.log(middleTokenAmount);
//     let parallelSwapActions = await GETPARALLELSWAPACTIONS(
//       secondHopPools,
//       middleToken,
//       outputToken,
//       minMiddleTokenAmount,
//       slippageTolerance
//     );
//     console.log('PARALLEL SWAP ACTIONS GAVE...');
//     console.log(parallelSwapActions);
//     let stableResult = getExpectedOutputFromActions(
//       parallelSwapActions,
//       outputToken
//     );
//     partialStableRoutes.push(stableResult);
//     if (new Big(stableResult).gt(bestOutput)) {
//       bestOutput = new Big(stableResult);
//       bestStableSwapActions = [firstAction, ...parallelSwapActions];
//     }
//   }
//   let smartRouteActions = await getSmartRouteSwapActions(
//     pools,
//     inputToken,
//     outputToken,
//     totalInput,
//     slippageTolerance
//   );
//   console.log('SMART ROUTE SWAP ACTIONS FOUND TO BE');
//   console.log(smartRouteActions);

//   let smartRouteExpectedOutput = getExpectedOutputFromActions(
//     smartRouteActions,
//     outputToken
//   );
//   console.log('EXPECTED OUTPUT FROM SMART ROUTE ALONE IS...');
//   console.log(smartRouteExpectedOutput.toString());

//   console.log('EXPECTED OUTPUT FROM HYBRID STABLE SWAP / PARALLEL IS...');
//   console.log(bestOutput.toString());
//   console.log('stable swap actions are...');
//   console.log(bestStableSwapActions);
//   // TODO: fix hybrid route, and delete following line.
//   return smartRouteActions;

//   // now choose whichever solution gave the most output.
//   if (new Big(smartRouteExpectedOutput).gt(bestOutput)) {
//     console.log('SMART ROUTE WAS BETTER -- USING THAT.');
//     return smartRouteActions;
//   } else {
//     console.log('HYBRID STABLE ROUTE WAS BETTER -- USING THAT.');
//     return bestStableSwapActions;
//   }
// } else if (
//   !STABLE_TOKEN_IDS.includes(inputToken) &&
//   STABLE_TOKEN_IDS.includes(outputToken)
// ) {
//   console.log(
//     'INPUT NOT STABLE/ OUTPUT IS STABLE, CHECKING STABLE ROUTES ENDING WITH OUTPUT...'
//   );

//   // input is not stable, output is.
//   // (A) try route inputToken-->stable2-->outputToken (simple Pool-->stablepool)
//   // (B) try route inputToken-->stable3-->outputToken (simple Pool-->stablepool)
//   // (C) try normal smart route. (simple Pool-->simple pool)
//   // compare outputs from A,B,C and use the one with maximum return.
//   var partialStableRoutes = [];
//   var bestOutput = new Big(0);
//   var bestStableSwapActions = [];
//   for (var i in STABLE_TOKEN_IDS) {
//     var middleToken = STABLE_TOKEN_IDS[i];
//     if (middleToken === outputToken) {
//       continue;
//     }
//     let parallelSwapActions = await GETPARALLELSWAPACTIONS(
//       pools,
//       inputToken,
//       middleToken,
//       totalInput,
//       slippageTolerance
//     );

//     console.log('GOT PARALLEL SWAP ACTIONS TO BE...');
//     console.log(parallelSwapActions);
//     let minMiddleTokenAmount = getExpectedOutputFromActions(
//       parallelSwapActions,
//       middleToken
//     );
//     console.log('min middle token amount is...');
//     console.log(minMiddleTokenAmount.toString());

//     let middleTokenMeta = await ftGetTokenMetadata(middleToken);
//     let middleTokenDecimals = middleTokenMeta.decimals;
//     let middleTokenInt = new Big(minMiddleTokenAmount)
//       .times(new Big(10).pow(middleTokenDecimals))
//       .round()
//       .toString();
//     let lastAction = await GETSTABLESWAPACTION(
//       middleToken,
//       outputToken,
//       middleTokenInt,
//       slippageTolerance
//     );

//     let stableResult = lastAction.min_amount_out;
//     partialStableRoutes.push(stableResult);
//     if (new Big(stableResult).gt(bestOutput)) {
//       bestOutput = new Big(stableResult);
//       bestStableSwapActions = [...parallelSwapActions, lastAction];
//     }
//   }
//   let smartRouteActions = await getSmartRouteSwapActions(
//     pools,
//     inputToken,
//     outputToken,
//     totalInput,
//     slippageTolerance
//   );
//   let smartRouteExpectedOutput = getExpectedOutputFromActions(
//     smartRouteActions,
//     outputToken
//   );
//   // now choose whichever solution gave the most output.
//   console.log('EXPECTED OUTPUT FROM SMART ROUTE ALONE IS...');
//   console.log(smartRouteExpectedOutput.toString());

//   console.log('EXPECTED OUTPUT FROM HYBRID STABLE SWAP / PARALLEL IS...');
//   console.log(bestOutput.toString());
//   console.log('HYBRID ACTIONS ARE...');
//   console.log(bestStableSwapActions);

//   // TODO: fix hybrid route, and delete following line.
//   return smartRouteActions;

//   if (new Big(smartRouteExpectedOutput).gt(bestOutput)) {
//     console.log('SMART ROUTE WAS BETTER -- USING THAT.');
//     return smartRouteActions;
//   } else {
//     console.log('HYBRID STABLE ROUTE WAS BETTER -- USING THAT.');
//     return bestStableSwapActions;
//   }
//   } else {
//     //do normal smart route swap. (simple Pool-->simple pool)
//     console.log(
//       'NEITHER INPUT NOR OUTPUT IS STABLE. DOING NORMAL SMART ROUTING OVER SIMPLE POOLS'
//     );
//     let smartRouteActions = await getSmartRouteSwapActions(
//       pools,
//       inputToken,
//       outputToken,
//       totalInput,
//       slippageTolerance
//     );
//     return smartRouteActions;
//   }
// }

export function getExpectedOutputFromActionsORIG(actions, outputToken) {
  return actions
    .filter((item) => item.outputToken === outputToken)
    .map((item) => new Big(item.estimate))
    .reduce((a, b) => a.plus(b), new Big(0));
}

export async function getExpectedOutputFromActions(
  actions,
  outputToken,
  slippageTolerance
) {
  // TODO: on cross swap case
  // console.log('INSIDE EXPECTED OUTPUT FUNC');
  // console.log(outputToken);
  // console.log(actions);

  let expectedOutput = new Big(0);

  if (!actions || actions.length === 0) return expectedOutput;

  const routes = separateRoutes(actions, outputToken);

  for (let i = 0; i < routes.length; i++) {
    const curRoute = routes[i];

    if (curRoute.length === 1) {
      expectedOutput = expectedOutput.plus(curRoute[0].estimate);
    } else {
      if (
        curRoute.every((r) => r.pool.Dex !== 'tri') ||
        curRoute.every((r) => r.pool.Dex === 'tri')
      )
        expectedOutput = expectedOutput.plus(curRoute[1].estimate);
      else {
        const secondHopAmountIn = percentLess(
          slippageTolerance,
          curRoute[0].estimate
        );
        const secondEstimateOut = await getPoolEstimate({
          tokenIn: curRoute[1].tokens[1],
          tokenOut: curRoute[1].tokens[2],
          amountIn: toNonDivisibleNumber(
            curRoute[1].tokens[1].decimals,
            secondHopAmountIn
          ),
          Pool: curRoute[1].pool,
        });

        expectedOutput = expectedOutput.plus(secondEstimateOut.estimate);
      }
    }
  }

  return expectedOutput;
}

async function convertActionToEstimatesFormat(action) {
  let hopOutputTokenMeta = await ftGetTokenMetadata(action.token_out);
  let hopOutputTokenDecimals = hopOutputTokenMeta.decimals;
  let pool = await getPool(action.pool_id);
}

async function convertStableActionToEstimatesFormat(action) {
  let hopInputTokenMeta = await ftGetTokenMetadata(action.token_in);
  let hopOutputTokenMeta = await ftGetTokenMetadata(action.token_out);
  let hopOutputTokenDecimals = hopOutputTokenMeta.decimals;
  // NEED TO CACHE THIS RESULT!
  let pool = await getStablePool(action.pool_id);

  let amount_swapped = new Big(action.amount_swapped)
    .div(new Big(10).pow(STABLE_LP_TOKEN_DECIMALS))
    .div(new Big(10).pow(hopOutputTokenDecimals));
  let decimalEstimate = amount_swapped;

  let poolFee = pool.fee ? pool.fee : pool.total_fee;
  let newAction = {
    estimate: decimalEstimate,
    pool: {
      fee: poolFee,
      gamma_bps: new Big(10000).minus(new Big(poolFee)), //.div(new Big(10000)), //hops[i].pool.gamma, //new Big(10000).minus(new Big(hops[i].pool.fee)).div(new Big(10000));
      id: pool.id,
      partialAmountIn: new Big(action.amount_in).round().toString(),
      supplies: {
        [pool.token1Id]: pool.token1Supply,
        [pool.token2Id]: pool.token2Supply,
      },
      token0_ref_price: '', //hops[i].pool.token0_price,
      tokenIds: [pool.token1Id, pool.token2Id],
    },
    status: 'stableSmart',
    token: hopInputTokenMeta,
    outputToken: action.token_out,
  };
  // console.log('INPUT TOKEN IS...');
  // console.log(hops[i].inputToken);
  newAction.pool.x = newAction.pool.supplies[action.token_in];
  newAction.pool.y = newAction.pool.supplies[action.token_out];

  return newAction;
}

function getFeeForRoute(route) {
  if (!route.length) {
    route = [route];
  }
  if (route.length == 1) {
    // Single Hop case
    let p = route[0];
    return p.fee;
  } else if (route.length == 2) {
    //Double Hop Case
    let p1 = route[0];
    let p2 = route[1];
    let fee1 = p1.fee;
    let fee2 = p2.fee;
    return fee1 + fee2;
  }
}

export function getAverageFeeForRoutes(routes, nodeRoutes, totalInput) {
  let normalizedAllocations = getOptimalAllocationForRoutes(
    routes,
    nodeRoutes,
    totalInput
  ).map((a) => a.div(new Big(totalInput)));
  let averageFee = 0;
  for (var i in routes) {
    averageFee += normalizedAllocations[i] * getFeeForRoute(routes[i]);
  }
  return averageFee;
}

//module.exports = { getSmartRouteSwapActions };
