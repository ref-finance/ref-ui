////////////////////////////////////////////////////////////////////////////
// SMART ROUTE SWAP LOGIC
////////////////////////////////////////////////////////////////////////////
import Big from 'big.js';

import * as CONSTANTS from '../../constants';
import db from '../../store/RefDatabase';
import metadataDefaults from '../../utils/metadata';

const { NEAR_META_DATA, WRAP_NEAR_CONTRACT_ID } = CONSTANTS;

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
    const p = route[0];
    var beta = new Big(p.reserves[path[0]]);
  } else if (route.length == 2) {
    const p1 = route[0];
    const p2 = route[1];
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
    const p = route[0];
    const gamma = new Big(10000).minus(new Big(p.fee)).div(new Big(10000));
    var epsilon = Big(gamma);
  } else if (route.length == 2) {
    //Double Hop Case
    const p1 = route[0];
    const p2 = route[1];
    const gamma1 = new Big(10000).minus(new Big(p1.fee)).div(new Big(10000));
    const gamma2 = new Big(10000).minus(new Big(p2.fee)).div(Big(10000));
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
    const p = route[0];
    const inputToken = path[0];
    const outputToken = path[1];
    const gamma = new Big(10000).minus(new Big(p.fee)).div(new Big(10000));
    const key1 = p.token1Id;
    const key2 = p.token2Id;
    const val1 = p.token1Supply;
    const val2 = p.token2Supply;
    p.reserves = { [key1]: val1, [key2]: val2 };
    var alpha = new Big(p.reserves[inputToken]).times(
      new Big(p.reserves[outputToken]).times(new Big(gamma))
    );
  } else if (route.length == 2) {
    //console.log('double hop')
    const p1 = route[0];
    const p2 = route[1];
    const key11 = p1.token1Id;
    const key12 = p1.token2Id;
    const val11 = p1.token1Supply;
    const val12 = p1.token2Supply;
    p1.reserves = { [key11]: val11, [key12]: val12 };
    const key21 = p2.token1Id;
    const key22 = p2.token2Id;
    const val21 = p2.token1Supply;
    const val22 = p2.token2Supply;
    p2.reserves = { [key21]: val21, [key22]: val22 };
    const inputToken = path[0];
    const middleToken = path[1];
    const outputToken = path[2];
    const gamma1 = new Big(10000).minus(Big(p1.fee)).div(new Big(10000));
    const gamma2 = new Big(10000).minus(new Big(p2.fee)).div(new Big(10000));
    const alpha1 = new Big(p1.reserves[inputToken])
      .times(new Big(p1.reserves[middleToken]))
      .times(gamma1);
    const alpha2 = new Big(p2.reserves[middleToken])
      .times(new Big(p2.reserves[outputToken]))
      .times(gamma2);
    var alpha = alpha1.times(alpha2);
  }
  return alpha;
}

function getAlphaSumFromRoutes(routes, nodeRoutes) {
  let alphaSum = new Big(0);
  for (const i in routes) {
    const route = routes[i];
    const nodeRoute = nodeRoutes[i];
    const alpha = getAlphaForRoute(route, nodeRoute);
    // console.log('alpha is...');
    // console.log(alpha.toString());
    // below, we are replacing the built-in Big sqrt() method with a
    // newton-iteration BigInt sqrt function, to speed it up by 10x.
    const radical = new Big(bisqrt(BigInt(new Big(alpha).round().toFixed())));
    // let radical = new Big(alpha).sqrt();
    const epsilon = getEpsilonForRoute(route, nodeRoute);
    const denom = new Big(epsilon);
    alphaSum = alphaSum.plus(radical.div(denom));
  }
  return alphaSum;
}

function getBetaSumFromRoutes(routes, nodeRoutes) {
  let betaSum = new Big(0);
  for (const i in routes) {
    const route = routes[i];
    const nodeRoute = nodeRoutes[i];
    const num = new Big(getBetaForRoute(route, nodeRoute));
    const denom = new Big(getEpsilonForRoute(route, nodeRoute));
    betaSum = betaSum.plus(num.div(denom));
  }
  return betaSum;
}

function getPhiFromRoutes(routes, nodeRoutes, totalInput) {
  const alphaSum = getAlphaSumFromRoutes(routes, nodeRoutes);
  const betaSum = getBetaSumFromRoutes(routes, nodeRoutes);
  const phi = new Big(totalInput).plus(betaSum).div(alphaSum);
  return phi;
}

function getAllocationForRoute(phi, route, path) {
  const alpha = getAlphaForRoute(route, path);
  const beta = getBetaForRoute(route, path);
  const epsilon = getEpsilonForRoute(route, path);
  // below, we are replacing the built-in Big sqrt() method with a
  // newton-iteration BigInt sqrt function, to speed it up by 10x.
  const allocation = new Big(phi)
    .abs()
    .times(new Big(bisqrt(BigInt(new Big(alpha).round().toFixed()))))
    .minus(beta)
    .div(epsilon);
  return allocation;
}

function getAllocationVectorForRoutes(phi, routes, nodeRoutes) {
  const allocationVec = [];
  for (const i in routes) {
    allocationVec.push(getAllocationForRoute(phi, routes[i], nodeRoutes[i]));
  }
  return allocationVec;
}

function getOptimalAllocationForRoutes(routes, nodeRoutes, totalInput) {
  // console.log("CALLING GET OPTIMAL ALLOCATION FOR ROUTES:")
  // console.log(routes)
  var totalInput = new Big(totalInput);
  const phi = getPhiFromRoutes(routes, nodeRoutes, totalInput);
  // console.log('PHI CALCULATED TO BE...')
  // console.log(phi.toString())
  let allocations = getAllocationVectorForRoutes(phi, routes, nodeRoutes);
  if (allocations.every((item) => item.lt(new Big(0)))) {
    allocations = allocations.map((item) => item.times(new Big(-1.0)));
  }
  if (allocations.some((item) => item.lt(new Big(0)))) {
    allocations = reduceRoutes(routes, nodeRoutes, allocations, totalInput);
  }
  const sumAllocations = allocations.reduce((a, b) => a.plus(b), new Big(0));
  const normalizedAllocations = allocations.map((a) =>
    a.div(sumAllocations).times(new Big(totalInput))
  );
  return normalizedAllocations;
}

function reduceRoutes(routes, nodeRoutes, allocationVec, totalInput) {
  // console.log("RUNNING REDUCE ROUTES")
  var totalInput = new Big(totalInput);
  const goodIndices = [];
  for (var i in allocationVec) {
    const dx = allocationVec[i];
    // console.log('DX IS...')
    // console.log(dx.toString())
    if (dx.gt(new Big(0))) {
      goodIndices.push(i);
    }
  }
  // console.log('GOOD INDICES ARE...');
  // console.log(goodIndices);
  const newRoutes = [];
  const newNodeRoutes = [];
  for (var i in goodIndices) {
    const goodIndex = goodIndices[i];
    newRoutes.push(routes[goodIndex]);
    newNodeRoutes.push(nodeRoutes[goodIndex]);
  }
  allocationVec = getOptimalAllocationForRoutes(
    newRoutes,
    newNodeRoutes,
    totalInput
  );
  const allocationDict = {};
  for (var i in goodIndices) {
    allocationDict[goodIndices[i]] = allocationVec[i];
  }
  const allocationVecNew = [];
  for (var i in routes) {
    if (goodIndices.includes(i)) {
      allocationVecNew.push(allocationDict[i]);
    } else {
      const zeroAllocation = new Big(0);
      allocationVecNew.push(zeroAllocation);
    }
  }
  return allocationVecNew;
}

function getNodeRoutesFromPathsAndPoolChains(paths, poolChains) {
  const multiplicity = [];
  for (const i in poolChains) {
    const pc = poolChains[i];
    const mul = pc
      .map((item) => item.length)
      .reduce((elem1, elem2) => elem1 * elem2, 1);
    multiplicity.push(mul);
  }
  const nodeRoutes = [];
  for (const j in paths) {
    const path = paths[j];
    const m = multiplicity[j];
    for (let k = 0; k < m; k++) {
      nodeRoutes.push(path);
    }
  }
  return nodeRoutes;
}

function getPoolChainFromPaths(paths, pools, threshold = 0.001) {
  const poolChains = [];
  for (const pathInd in paths) {
    const path = paths[pathInd];
    const chain = [];
    const pairs = [];
    for (let i = 0; i < path.length - 1; i++) {
      pairs.push([path[i], path[i + 1]]);
    }
    for (const pairInd in pairs) {
      const pair = pairs[pairInd];
      // console.log(pair);
      const tokenPools = getPoolsByToken1ANDToken2(pools, pair[0], pair[1]);
      chain.push(tokenPools);
    }
    poolChains.push(chain);
  }
  // return poolChains;
  const culledPoolChains = getCulledPoolChains(poolChains, threshold);

  return culledPoolChains;
}

function getCulledPoolChains(poolChains, threshold = 0.001) {
  const newChains = [];
  for (const pathInd in poolChains) {
    const path = poolChains[pathInd];
    const newPath = [];
    for (const legInd in path) {
      const leg = path[legInd];
      const culledPath = cullPoolsWithInsufficientLiquidity(leg, threshold);
      newPath.push(culledPath);
    }
    newChains.push(newPath);
  }
  return newChains;
}

function getRoutesFromPoolChain(poolChains) {
  const routes = [];
  for (const pci in poolChains) {
    const poolChain = poolChains[pci];
    //get cartesian product of each pool chain to get the list of routes.
    const newRoutes = cartesianProduct(poolChain);
    routes.push(...newRoutes);
  }
  for (const i in routes) {
    if (!routes[i].length) {
      routes[i] = [routes[i]];
    }
  }
  return routes;
}

function getOutputSingleHop(pool, inputToken, outputToken, totalInput) {
  // check if pool is forward or backward for inputToken/outputToken cf. token1Id/token2Id
  let reserves = {};
  if (inputToken === pool.token1Id && outputToken === pool.token2Id) {
    // forward Pool
    reserves = {
      [inputToken]: new Big(pool.token1Supply),
      [outputToken]: new Big(pool.token2Supply),
    };
  } else if (inputToken === pool.token2Id && outputToken === pool.token1Id) {
    // reverse pool
    reserves = {
      [outputToken]: new Big(pool.token1Supply),
      [inputToken]: new Big(pool.token2Supply),
    };
  } else {
    return new Big(0);
  }
  const gamma = new Big(10000).minus(new Big(pool.fee)).div(new Big(10000));
  // console.log('getOutputSingleHop', pool, inputToken, outputToken, totalInput);
  const num = new Big(totalInput).times(gamma).times(reserves[outputToken]);
  const denom = reserves[inputToken].plus(gamma.times(new Big(totalInput)));
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
  for (const poolIndex in pools) {
    const p = pools[poolIndex];
    p.gamma = new Big(10000).minus(new Big(p.fee)).div(new Big(10000));
  }
  const p1 = pools[0];
  const p2 = pools[1];

  if (inputToken === p1.token1Id && middleToken === p1.token2Id) {
    // forward Pool
    p1.reserves = {
      [inputToken]: new Big(p1.token1Supply),
      [middleToken]: new Big(p1.token2Supply),
    };
  } else if (middleToken === p1.token1Id && inputToken === p1.token2Id) {
    //reverse pool
    p1.reserves = {
      [middleToken]: new Big(p1.token1Supply),
      [inputToken]: new Big(p1.token2Supply),
    };
  }

  if (middleToken === p2.token1Id && outputToken === p2.token2Id) {
    // forward Pool
    p2.reserves = {
      [middleToken]: new Big(p2.token1Supply),
      [outputToken]: new Big(p2.token2Supply),
    };
  } else if (outputToken === p2.token1Id && middleToken === p2.token2Id) {
    //reverse pool
    p2.reserves = {
      [outputToken]: new Big(p2.token1Supply),
      [middleToken]: new Big(p2.token2Supply),
    };
  }

  const c1 = new Big(p1.reserves[middleToken]);
  const a1 = new Big(p1.reserves[inputToken]);
  const c2 = new Big(p2.reserves[middleToken]);
  const b2 = new Big(p2.reserves[outputToken]);
  const gamma1 = p1.gamma;
  const gamma2 = p2.gamma;
  const num = totalInput.times(c1).times(b2).times(gamma1).times(gamma2);
  const denom = c2
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
    const inputToken = nodeRoute[0];
    const outputToken = nodeRoute[1];
    const pool = route[0];
    var output = getOutputSingleHop(pool, inputToken, outputToken, allocation);
  } else if (route.length == 2) {
    // DOUBLE HOP
    const inputToken = nodeRoute[0];
    const middleToken = nodeRoute[1];
    const outputToken = nodeRoute[2];
    const pools = route;
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
  const allocations = getOptimalAllocationForRoutes(
    routes,
    nodeRoutes,
    totalInput
  );
  const result = [];
  for (const i in routes) {
    const route = routes[i];
    const nodeRoute = nodeRoutes[i];
    const allocation = allocations[i];
    const output = getOutputFromRoute(route, nodeRoute, allocation);
    result.push(output);
  }
  return {
    result,
    allocations,
  };
  //NOTE -- I made this return an object instead of the tuple returned in python. need to check the places it is called, and specify
  // result field instead of tuple 0 position, and allocations field instead of tuple 1 position.
}

function checkIntegerSumOfAllocations(allocations, totalInput) {
  var totalInput = new Big(totalInput);
  var allocations = allocations.map((item) => new Big(item).round());
  let alloSum = allocations
    .map((item) => new Big(item))
    .reduce((a, b) => a.plus(b), new Big(0));
  let offset = totalInput.minus(alloSum);
  //get largest allocation.
  let currMax = new Big(0);
  let currMaxInd = 0;
  for (var i = 0; i < allocations.length; i++) {
    if (allocations[i].gt(currMax)) {
      currMaxInd = i;
      currMax = allocations[i];
    }
  }
  let newAllocations = [];
  for (var j = 0; j < allocations.length; j++) {
    if (j === currMaxInd) {
      newAllocations.push(allocations[j].plus(offset).toString());
    } else {
      newAllocations.push(allocations[j].toString());
    }
  }
  return newAllocations;
}

function getBestOptInputAndOutput(routes, nodeRoutes, totalInput) {
  const rawDict = getOptOutputVec(routes, nodeRoutes, totalInput);
  const outputRaw = rawDict.result;
  let inputRaw = rawDict.allocations;
  inputRaw = checkIntegerSumOfAllocations(inputRaw, totalInput);

  const res = outputRaw
    .map((v) => new Big(v))
    .reduce((bv1, bv2) => bv1.plus(bv2), new Big(0));

  return {
    input: inputRaw,
    output: res,
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
  const paths = await getPathsFromPools(
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
  const poolChains = await getPoolChainFromPaths(paths, pools, threshold);

  const routes = await getRoutesFromPoolChain(poolChains);
  const nodeRoutes = await getNodeRoutesFromPathsAndPoolChains(
    paths,
    poolChains
  );
  const inputOutput = await getBestOptInputAndOutput(
    routes,
    nodeRoutes,
    totalInput
  );
  const allocations = inputOutput.input;
  const outputs = inputOutput.output;

  return {
    allocations,
    outputs,
    routes,
    nodeRoutes,
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
  const totalInput = allocations
    .map((a) => new Big(a))
    .reduce((a, b) => a.plus(b), new Big(0))
    .toString();
  const hops = [];
  for (const i in routes) {
    let route = routes[i];
    const nodeRoute = nodeRoutes[i];
    const allocation = allocations[i];
    if (new Big(allocation).eq(new Big(0))) {
      continue;
    }
    if (!route.length) {
      route = [route];
    }
    if (!route[0]) {
      continue;
    }
    for (const j in route) {
      const pool = route[j];
      // console.log('J IS...');
      // console.log(j);
      // console.log('NODE ROUTE IS...');
      // console.log(nodeRoute);
      if (j == 0) {
        //first hop.
        // console.log(nodeRoute[0]);
        // console.log(nodeRoute[1]);
        var hop = {
          pool,
          allocation: allocation.toString(),
          inputToken: nodeRoute[0],
          outputToken: nodeRoute[1],
          nodeRoute,
          route,
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
          pool,
          allocation: middleTokenAllocation.toString(),
          inputToken: nodeRoute[1],
          outputToken: nodeRoute[2],
          nodeRoute,
          route,
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

async function getSmartRouteSwapActions(
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

  const resDict = await getBestOptimalAllocationsAndOutputs(
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

  const sortedIndexValues = argsort(allocations);
  const topIndices = sortedIndexValues.slice(0, 10);
  const reducedRoutes = [];
  const reducedNodeRoutes = [];
  for (const ind of topIndices) {
    reducedRoutes.push(routes[ind]);
    reducedNodeRoutes.push(nodeRoutes[ind]);
  }
  routes = reducedRoutes;
  nodeRoutes = reducedNodeRoutes;

  // TODO: compare pairs of routes to get the best allocation pair-wise.
  let currentBestOutput = new Big(0);
  let bestAllocations = resDict.allocations;
  let bestNodeRoutes = resDict.nodeRoutes;
  let bestRoutes = resDict.routes;
  // first check parallel swap with 4 actions. store result.
  const parallelNodeRoutes = [];
  const parallelRoutes = [];
  for (const n in bestRoutes) {
    const currentNodeRoute = bestNodeRoutes[n];
    if (currentNodeRoute.length == 2) {
      parallelNodeRoutes.push(currentNodeRoute);
      parallelRoutes.push(bestRoutes[n]);
    }
  }
  // console.log(`${parallelNodeRoutes.length} parallel routes found...`);
  let bestRoutesAreParallel = false;
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
      const filteredParallelRoutes = [];
      const filteredParallelNodeRoutes = [];
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

    const parallelOutput = parallelOutputs.reduce(
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
  let canHaveTwoRoutes = false;
  // initialize this variable to check if we can have two routes, or if all routes share a pool for an edge case.
  // console.log('THE NUMBER OF ROUTES IS...', routes.length);

  for (var i in routes) {
    for (var j in routes) {
      if (j > i) {
        const route1 = routes[i];
        const route2 = routes[j];
        const nodeRoute1 = nodeRoutes[i];
        const nodeRoute2 = nodeRoutes[j];
        // check if they share a pool.
        const route1PoolIds = new Set(route1.map((r) => r.id));
        const route2PoolIds = new Set(route2.map((r) => r.id));
        let sharePool = false;
        for (const route1PoolId of route1PoolIds) {
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
          const currentRoutes = [route1, route2];
          const currentNodeRoutes = [nodeRoute1, nodeRoute2];

          const filteredAllocationsAndOutputs = getOptOutputVec(
            currentRoutes,
            currentNodeRoutes,
            totalInput
          );

          const filteredAllocations = filteredAllocationsAndOutputs.allocations;
          const filteredOutputs = filteredAllocationsAndOutputs.result;
          // console.log('FILTERED ALLOCATIONS:');
          // console.log(filteredAllocations.map((i) => i.toString()));
          // console.log(filteredOutputs);
          const totalOutput = filteredOutputs.reduce(
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
      const currentRoutes = [routes[i]];
      const currentNodeRoutes = [nodeRoutes[i]];
      // let filteredAllocationsAndOutputs = getOptOutputVecRefined(currentRoutes, currentNodeRoutes, totalInput);
      const filteredAllocationsAndOutputs = getOptOutputVec(
        currentRoutes,
        currentNodeRoutes,
        totalInput
      );

      const filteredAllocations = filteredAllocationsAndOutputs.allocations;
      const filteredOutputs = filteredAllocationsAndOutputs.result;
      // console.log('FILTERED ALLOCATIONS:');
      // console.log(filteredAllocations.map((i) => i.toString()));
      // console.log(filteredOutputs);
      const totalOutput = filteredOutputs.reduce(
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
  const allSortedIndices = argsort(allocations.map((a) => new Big(a)));
  if (bestRoutesAreParallel) {
    numberOfRoutesLimit = 4;
  }
  const sortedIndices = allSortedIndices.slice(0, numberOfRoutesLimit);

  // console.log('sorted Indices are');
  // console.log(sortedIndices);
  let filteredRoutes = [];
  let filteredNodeRoutes = [];
  for (var i in sortedIndices) {
    const index = sortedIndices[i];
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

  const route1PoolIds = filteredRoutes[0].map((pool) => pool.id);
  // console.log('route 1 pool ids:');
  // console.log(route1PoolIds);
  if (filteredRoutes.length > 1) {
    const route2PoolIds = filteredRoutes[1].map((pool) => pool.id);
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
    const allFilteredRoutes = [];
    const allFilteredNodeRoutes = [];
    for (var i in allSortedIndices) {
      allFilteredRoutes.push(routes[allSortedIndices[i]]);
      allFilteredNodeRoutes.push(nodeRoutes[allSortedIndices[i]]);
    }
    const firstRoute = allFilteredRoutes[0];
    // console.log('first route is...');
    // console.log(firstRoute);
    const firstRoutePoolIds = firstRoute.map((pool) => pool.id);
    for (var i in allFilteredRoutes) {
      if (!allFilteredRoutes[i].length) {
        allFilteredRoutes[i] = [allFilteredRoutes[i]];
      }
    }
    // console.log('FIRST ROUTE POOL IDS ARE');
    // console.log(firstRoutePoolIds);
    const allFilteredRouteIds = allFilteredRoutes.map((route) =>
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

        let secondRoute = allFilteredRoutes[i];
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
  const filteredAllocationsAndOutputs = getOptOutputVec(
    filteredRoutes,
    filteredNodeRoutes,
    totalInput
  );

  let filteredAllocations = filteredAllocationsAndOutputs.allocations;

  filteredAllocations = checkIntegerSumOfAllocations(
    filteredAllocations,
    totalInput
  ).map((stringAllo) => new Big(stringAllo));

  const hops = getActionListFromRoutesAndAllocations(
    filteredRoutes,
    filteredNodeRoutes,
    filteredAllocations
  );

  const actions = [];
  // console.log('hops are...');
  // console.log(hops);

  for (const i in hops) {
    const hopInputTokenMeta = await ftGetTokenMetadata(hops[i].inputToken);
    const hopOutputTokenMeta = await ftGetTokenMetadata(hops[i].outputToken);
    const hopOutputTokenDecimals = hopOutputTokenMeta.decimals;
    const allocation = new Big(hops[i].allocation).round().toString();

    // console.log('allocation', allocation);

    const expectedHopOutput = getOutputSingleHop(
      hops[i].pool,
      hops[i].inputToken,
      hops[i].outputToken,
      allocation
    )
      .round(hopOutputTokenDecimals || 8, Big.roundHalfUp)
      .toString();
    const decimalEstimate = new Big(expectedHopOutput)
      .div(new Big(10).pow(hopOutputTokenDecimals))
      .round(hopOutputTokenDecimals || 8, Big.roundHalfUp)
      .toString();
    // console.log(
    //   `===============> ${hopInputTokenMeta.name} decimals:${hopInputTokenMeta.decimals} => ${hopOutputTokenMeta.name} decimals:${hopOutputTokenDecimals}`,
    //   expectedHopOutput,
    //   decimalEstimate
    // );
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
    const status =
      hops[i].inputToken == inputToken && hops[i].outputToken == outputToken
        ? 'parallel swap'
        : 'stableSmart';
    const tokens = await Promise.all(
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
      status,
      token: hopInputTokenMeta,
      outputToken: hops[i].outputToken,
      inputToken: hops[i].inputToken,
      nodeRoute: hops[i].nodeRoute,
      route: hops[i].route,
      allRoutes: hops[i].allRoutes,
      allNodeRoutes: hops[i].allNodeRoutes,
      totalInputAmount: hops[i].totalInputAmount,
      allAllocations: hops[i].allAllocations,
      tokens,
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
  const overallPriceImpact = await calculateSmartRouteV2PriceImpact(actions);

  for (var i in actions) {
    const action = actions[i];

    action.overallPriceImpact = new Big(overallPriceImpact)
      .round(action.token.decimals, Big.roundHalfUp)
      .toString();
    if (action.outputToken === outputToken && action.inputToken != inputToken) {
      // only want to set second hop partial amount in to zero
      action.pool.partialAmountIn = '0';
    }
  }

  return actions;
}

const NEAR_ICON =
  'https://near.org/wp-content/themes/near-19/assets/img/brand-icon.png';
const BANANA_ID = 'berryclub.ek.near';
const CHEDDAR_ID = 'token.cheddar.near';
const CUCUMBER_ID = 'farm.berryclub.ek.near';
const HAPI_ID = 'd9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near';
const WOO_ID = '4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near';
const SOL_ID = 'sol.token.a11bd.near';
const FRAX_ID = '853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near';
const BLACKDRAGON_ID = 'blackdragon.tkn.near';
const SOL_NATIVE_ID = '22.contract.portalbridge.near';
const BABY_BLACKDRAGON_ID = 'babyblackdragon.tkn.near';
const INTEL_ID = 'intel.tkn.near';

const ftGetTokenMetadata = async (id) => {
  try {
    const metadata = await db.allTokens().where({ id }).first();
    // if (!metadata) {
    //   metadata = await ftViewFunction(id, {
    //     methodName: 'ft_metadata',
    //   });
    //   await db.allTokens().put({
    //     id,
    //     name: metadata.name,
    //     symbol: metadata.symbol,
    //     decimals: metadata.decimals,
    //     icon: metadata.icon,
    //   });
    // }
    if (metadata.id === WRAP_NEAR_CONTRACT_ID) {
      return {
        ...metadata,
        icon: NEAR_META_DATA.icon,
        symbol: NEAR_META_DATA.symbol,
      };
    } else if (
      !metadata.icon ||
      metadata.icon === NEAR_ICON ||
      metadata.id === BANANA_ID ||
      metadata.id === CHEDDAR_ID ||
      metadata.id === CUCUMBER_ID ||
      metadata.id === HAPI_ID ||
      metadata.id === WOO_ID ||
      metadata.id === WRAP_NEAR_CONTRACT_ID ||
      metadata.id === SOL_ID ||
      metadata.id === BLACKDRAGON_ID ||
      metadata.id === FRAX_ID ||
      metadata.id === SOL_NATIVE_ID ||
      metadata.id === BABY_BLACKDRAGON_ID ||
      metadata.id === INTEL_ID
    ) {
      metadata.icon = metadataDefaults[id];
      if (metadata.id === SOL_ID) {
        metadata.symbol = 'SOL.Allbridge';
      }
    }
    return {
      id,
      ...metadata,
    };
  } catch (err) {
    return {
      id,
      name: id,
      symbol: id?.split('.')[0].slice(0, 8),
      decimals: 6,
      icon: null,
    };
  }
};

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

  const deltaY = actions
    .filter((a) => a.outputToken == a.routeOutputToken)
    .map((a) => new Big(a.estimate))
    .reduce((a, b) => a.plus(b), new Big(0));
  // console.log('DELTA Y IS...');
  // console.log(deltaY.toString());

  const inputTokenMeta = actions[0].tokens[0];
  const deltaX = new Big(actions[0].totalInputAmount).div(
    new Big(10).pow(inputTokenMeta.decimals)
  );
  // console.log('DELTA X IS...');
  // console.log(deltaX.toString());
  const R = deltaY.div(deltaX);
  // console.log('R IS...');
  // console.log(R.toString());
  // now we need to calculate P. We do this route by route, and take a weighted average.
  let P = new Big(0);
  const routes = actions[0].allRoutes;
  const nodeRoutes = actions[0].allNodeRoutes;
  const allocations = actions[0].allAllocations.map((a) => new Big(a));
  const totalAllocations = allocations
    .map((a) => new Big(a))
    .reduce((a, b) => a.plus(b), new Big(0));
  // console.log('TOTAL ALLOCATIONS ARE...');
  // console.log(totalAllocations);
  const weights = allocations.map((a) => a.div(totalAllocations));
  // console.log('WEIGHTS ARE...');
  // console.log(weights.map((i) => i.toString()));
  for (const i in routes) {
    const route = routes[i];
    const nodeRoute = nodeRoutes[i];
    const tokens = await Promise.all(
      nodeRoute.map(async (t) => await ftGetTokenMetadata(t))
    );
    const weight = weights[i];
    if (route.length == 1) {
      const num = new Big(route[0].reserves[nodeRoute[0]]).div(
        new Big(10).pow(tokens[0].decimals)
      );
      const denom = new Big(route[0].reserves[nodeRoute[1]]).div(
        new Big(10).pow(tokens[1].decimals)
      );
      var routeMarketPrice = num.div(denom);

      // console.log('ROUTE MARKET PRICE 1 IS...');
      // console.log(new Big(1).div(routeMarketPrice).toString());
    } else {
      const num1 = new Big(route[0].reserves[nodeRoute[0]]).div(
        new Big(10).pow(tokens[0].decimals)
      );

      const denom1 = new Big(route[0].reserves[nodeRoute[1]]).div(
        new Big(10).pow(tokens[1].decimals)
      );

      const num2 = new Big(route[1].reserves[nodeRoute[1]]).div(
        new Big(10).pow(tokens[1].decimals)
      );

      const denom2 = new Big(route[1].reserves[nodeRoute[2]]).div(
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
  const priceImpact = P.minus(R).div(R).times(new Big(100)).toString();
  return priceImpact;
}

function decor(arr) {
  const res = [];
  for (const i in arr) {
    res.push([arr[i], i]);
  }
  return res;
}
function argsort(arr) {
  const undecor = (a) => a[1]; // leave only index
  const decorated = decor(arr);
  // console.log(decorated);
  // console.log('item by item');
  // console.log(decorated.map((a) => a[0].toString()));
  return decorated
    .sort((a, b) => new Big(b[0]).minus(new Big(a[0])))
    .map(undecor);
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
  const liquidities = [];
  for (const poolInd in pools) {
    const pool = pools[poolInd];
    pool.amounts = [pool.token1Supply, pool.token2Supply];
    const poolBigAmounts = pool.amounts.map((item) => new Big(item));
    const liquidity = poolBigAmounts[0].times(poolBigAmounts[1]);
    liquidities.push(liquidity);
  }
  return liquidities;
}

function getNormalizedLiquiditiesFromList(pools) {
  const liquidities = getLiqudityOfPoolsFromList(pools);
  const maxLiq = bigMax(liquidities);
  const normalizedLiquidities = liquidities.map((item) => item.div(maxLiq));
  return normalizedLiquidities;
}

function bigMax(arrayOfBigs) {
  if (arrayOfBigs.length < 1) {
    return null;
  }
  let maxElem = arrayOfBigs[0];
  for (const ind in arrayOfBigs) {
    const val = arrayOfBigs[ind];
    if (val.gt(maxElem)) {
      maxElem = val;
    }
  }
  return maxElem;
}

function cullPoolsWithInsufficientLiquidity(pools, threshold = 0.0001) {
  const thresh = new Big(threshold);
  const normLiq = getNormalizedLiquiditiesFromList(pools);
  const filteredPools = [];
  for (let i = 0; i < normLiq.length; i++) {
    if (normLiq[i] > thresh) {
      filteredPools.push(pools[i]);
    }
  }
  return filteredPools;
}

function cartesianProduct(a) {
  const result = a.reduce((a, b) =>
    a.flatMap((d) => b.map((e) => [d, e].flat()))
  );
  return result;
}

function addEdge(g, edge) {
  const src = edge[0];
  const dst = edge[1];
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
  for (const n in edgeList) {
    const edge = edgeList[n];
    addEdge(g, edge);
  }
}

function deleteEdge(g, edge) {
  const gNew = JSON.parse(JSON.stringify(g)); // using this to deep clone graph structure
  const e1 = edge[0];
  const e2 = edge[1];
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
  const gNew = JSON.parse(JSON.stringify(g)); // using this to deep clone graph structure
  if (Object.keys(gNew).includes(node)) {
    delete gNew[node];
  }
  const keys = Object.keys(gNew);
  for (const nodeInd in keys) {
    const nodeNow = keys[nodeInd];
    if (Object.keys(gNew[nodeNow]).includes(node)) {
      delete gNew[nodeNow][node];
    }
  }
  return gNew;
}

function dijkstra(graph, s) {
  const solutions = {};
  solutions[s] = {};
  solutions[s].path = [];
  solutions[s].dist = 0;

  while (true) {
    let parent = null;
    let nearest = null;
    let dist = Infinity;

    //for each existing solution
    for (const n in solutions) {
      if (!solutions[n]) {
        solutions[n] = {};
      }
      if (!solutions[n].path) continue;
      const ndist = solutions[n].dist;
      const adj = graph[n];
      //for each of its adjacent nodes...
      for (const a in adj) {
        //without a solution already...
        if (!solutions[a]) {
          solutions[a] = {};
        }
        if (solutions[a].path) continue;
        //choose nearest node with lowest *total* cost
        const d = adj[a] + ndist;
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
  for (const nodeInd in ignore_nodes) {
    const nodeNow = ignore_nodes[nodeInd];
    gTemp = deleteNode(gTemp, nodeNow);
  }
  // remove edges
  for (const edgeInd in ignore_edges) {
    const edgeNow = ignore_edges[edgeInd];
    gTemp = deleteEdge(gTemp, edgeNow);
  }
  const solution = dijkstra(gTemp, src)[dst];
  solution.path.unshift(src); // original algorithm doesn't include source node in path
  return solution;
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
    const val = this.sortedpaths.shift();
    const path = val[1];
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
  const obj_json = JSON.stringify(obj);
  for (const itemInd in arr) {
    if (JSON.stringify(arr[itemInd]) == obj_json) {
      return true;
    }
  }
  return false;
}

function* yenFromPy(g, source, target) {
  //adapted from the python implementation in networkx.algorithms.simple_paths.shortest_simple_paths()
  const listA = [];
  const listB = new PathBuffer();
  let prev_path = null;

  while (true) {
    if (!prev_path) {
      const sol = shortestPath(g, source, target);
      const length = sol.dist;
      const path = sol.path;
      listB.push(length, path);
    } else {
      let ignore_nodes = [];
      let ignore_edges = [];
      for (let i = 1; i < prev_path.length; i++) {
        const root = prev_path.slice(0, i);
        const root_length = root.length;
        for (const pathInd in listA) {
          const path = listA[pathInd];

          if (arrayEquals(path.slice(0, i), root)) {
            const edgeToIgnore = [path[i - 1], path[i]];
            ignore_edges.push(edgeToIgnore);
          }
        }
        try {
          const sol = shortestPath(
            g,
            root[root.length - 1],
            target,
            (ignore_nodes = ignore_nodes),
            (ignore_edges = ignore_edges)
          );
          const length = sol.dist;
          const spur = sol.path;
          const path = root.slice(0, root.length - 1).concat(spur);
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
        const path = listB.pop();
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
  const paths = [];
  if (maxPathLength < 2) {
    var maxPathLength = 2;
  }
  const gen = yenFromPy(g, source, target);
  for (let n = 1; n <= k; n++) {
    try {
      const res = gen.next().value;
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
  const graph = getGraphFromPoolList(pools);
  return getKShortestPaths(graph, inputToken, outputToken, 100, maxPathLength);
}

function getGraphFromPoolList(poolList) {
  const pools = poolList.filter(
    (item) => item.token1Supply != '0' && item.token2Supply != '0'
  );
  const transitions = pools.map((item) => [item.token1Id, item.token2Id]);
  const g = {};
  addEdges(g, transitions);
  return g;
}

export async function stableSmart({
  pools,
  inputToken,
  outputToken,
  totalInput,
  slippageTolerance,
}) {
  const smartRouteActions = await getSmartRouteSwapActions(
    pools,
    inputToken,
    outputToken,
    totalInput,
    slippageTolerance
  );
  return smartRouteActions;
}
