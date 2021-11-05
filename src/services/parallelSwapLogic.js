// import Big from 'big.js';
//import allPools from 'testPools.js';

// Big.DP = 40;
// Big.strict = false;

// Steps.

// Choose pair of tokens: 
// let inputToken = 'wrap.testnet'
// let outputToken = 'banana.ft-fin.testnet'

// Choose input token amount:
//  let inputAmount = '10000000000'

// Query all Pools to find ones that match the chosen inputToken/outputToken pair.
// let filteredPools = filterPoolsByTokenPair(allPools, inputToken, outputToken)

//  function getAllTokens(allPools) {
//      // Note, here we should plumb in a function that requests all tokens from the Dexie Database. 
//      // For now, it just scans the global allPools.
//      allTokens = [];
//      for (var i=0;i<allPools.length;i++){
//         let p = allPools[i];
//         token1 = p.token_account_ids[0];
//         token2 = p.token_account_ids[1];
//         if (!allTokens.includes(token1)) {
//             allTokens.push(token1);
//         }
//         if (!allTokens.includes(token2)) {
//             allTokens.push(token2);
//         }
//      }
//      return allTokens;
//  };


// allTokens = getAllTokens(allPools);

// function filterPoolsByTokenPair(allPools, inputToken, outputToken) {
//     let filteredPools = [];
//     for (var i=0; i<allPools.length; i++) {
//         let pool = allPools[i];
//         if (pool.token_account_ids.includes(inputToken) && pool.token_account_ids.includes(outputToken) && !pool.amounts.includes('0')) {
//             filteredPools.push(pool);
//         }
//     }
//     return filteredPools;
// }



// function getExpectedOutputAmount(inputToken,filteredPools,inputAmount) {
//     let solution = getBestOutput(inputToken, inputAmount, filteredPools);
//     let outputAmount = solution.outputAmount;
//     return outputAmount;
// };




// function formatPool(pool, inputToken) {
//     let p = pool;
//     p['gamma_bps'] = new Big(10000).minus(p.total_fee);
//     if (p.token_account_ids[0] === inputToken) {
//         p['x'] = p.amounts[0];
//         p['y'] = p.amounts[1]; 
//         return p;
//     } else if (p.token_account_ids[1] === inputToken) {
//         p['x'] = p.amounts[1];
//         p['y'] = p.amounts[0];
//         return p;
//     } else {
//         // error - wrong pool was used -- input token not present in pool.
//         //console.log('ERROR -- wrong pool was used. Could not find token ',inputToken)
//         //throw  'ERROR -- wrong pool was used. Could not find inputToken';
//     }
// }

function formatPoolNew(pool, inputToken, outputToken) {
    let p = pool;
    let x = p.supplies[inputToken]
    let y = p.supplies[outputToken]
    p['gamma_bps'] = new Big(10000).minus(p.fee);
    p['x'] = x;
    p['y'] = y;
    return p;
}


function calculate_dx_float(mu, pool,inputToken, outputToken) {
    let p = formatPoolNew(pool, inputToken, outputToken);
    let radical = new Big(p.x).times(p.y).div(p.gamma_bps);
    let dxFloat = new Big(mu).times(100).times(radical.sqrt()).minus(new Big(p.x).times(10000).div(p.gamma_bps));
    return dxFloat
};


    
function calculate_dy_float(dx_float,pool, inputToken, outputToken) {
    if (dx_float <= 0) {
    return new Big(0);
    } 
    let p = formatPoolNew(pool, inputToken, outputToken);
    let dx = new Big(dx_float);
    let denom = new Big(10000).times(p.x).plus(new Big(p.gamma_bps).times(dx));
    let numerator = new Big(p.y).times(dx).times(p.gamma_bps);
    let dyFloat = numerator.div(denom).round();
    return dyFloat;
};


function solveForMuFloat(pools, totalDeltaX, inputToken, outputToken) {
    if (pools.length > 0){
        // console.log('total delta x is ... ', totalDeltaX);
        let numerator = new Big(totalDeltaX);
        let denominator = new Big(0);
        console.log(numerator);
        console.log(denominator)

        for (var i=0; i < pools.length; i++) {
            console.log('made it this far...')
            let p = formatPoolNew(pools[i],inputToken,outputToken);
            console.log('formatted pool... ',p)
            let numAdd = new Big(p.x).times(10000).div(p.gamma_bps);
            console.log(numAdd.toFixed());
            numerator = numerator.plus(numAdd);
            let denomAdd = new Big(p.x).times(p.y).div(p.gamma_bps).sqrt().times(100);
            denominator = denominator.plus(denomAdd);
        }

        const mu = new Big(numerator).div(denominator);
    return mu;	
    }
    else {
        console.log('ERROR - could not find pools that satisfy token pair')
        const mu = NaN;
    return mu;	
    }
};



function getAllocationsAndOutputs(totalInput, filteredPoolStructList,inputToken) {
    let algPools = filteredPoolStructList;
    let allocations = calculateOptimalOutput(algPools, totalInput, inputToken);
    let dyReturns = [];
    for (var i=0; i<algPools.length; i++) {
        let ap = algPools[i];
        let allocNow = allocations[i];
        let dyReturn = new Big(calculate_dy_float(allocNow,ap,inputToken)).round();
        dyReturns.push(dyReturn);
    }
    return {allocations:allocations, outputs: dyReturns};
};


  function calculateOptimalOutput(pools, inputAmount, inputToken, outputToken) {
	// This runs the main optimization algorithm using the input
	// console.log('input amount is... ',inputAmount)
	//let mu = solveForMu(pools, inputAmount);
	let mu = solveForMuFloat(pools, inputAmount, inputToken, outputToken);
	// console.log('mu is ... ', mu)
	let dxArray = new Array();
	let negativeDxValsFlag = false;
	for (var i=0; i<pools.length; i++) {
	    let pool = formatPoolNew(pools[i],inputToken, outputToken);
		let dx = calculate_dx_float(mu,pool,inputToken,outputToken);
		if (dx<0) {
			// console.log('found a negative dx value!')
			negativeDxValsFlag = true;
		}
        let dxInt = new Big(dx).round()
		dxArray.push(dxInt);
	}
	if (negativeDxValsFlag) {
		  dxArray = reducePools(pools, dxArray,inputAmount, inputToken, outputToken);
	}
	let dxArraySum = new Big(0);
	for (var i=0; i<dxArray.length; i++) {
		dxArraySum = dxArraySum.plus(dxArray[i]);
	}
	let normalizedDxArray = [];
	for (var i=0; i<dxArray.length; i++) {
        let ndx = new Big(dxArray[i]).times(inputAmount).div(dxArraySum).round()
		normalizedDxArray.push(BigInt(ndx.toFixed()));
	}
	return normalizedDxArray
};


 function reducePools(pools, dxArray, inputAmount, inputToken, outputToken) {
	let goodIndices = [];
	for (var i=0;i<dxArray.length;i++) {
		let dx = dxArray[i];
		if (dx>=0) {
			goodIndices.push(i)
		}
	}
    if (goodIndices.length < 1) {
    console.log("ERROR OCCURRED -- ALL DX VALUES WERE NEGATIVE")
    return dxArray;
    }
	let newPools = [];
	for (var j=0; j<dxArray.length; j++) {
		if (goodIndices.includes(j)) {
			newPools.push(pools[j])
		}
	}
	let newDxVec = calculateOptimalOutput(newPools,inputAmount,inputToken,outputToken);
	let goodInd2newdx = {};
	for (var k=0;k<newDxVec.length;k++) {
		goodInd2newdx[goodIndices[k]] = newDxVec[k]
	}
	let newFullDxVec = [];
	for (var ii=0; ii<pools.length; ii++) {
		if (goodIndices.includes(ii)) {
			newFullDxVec.push(goodInd2newdx[ii]);
		} else {
			newFullDxVec.push(0);
		}
	}
	return newFullDxVec;
};

//////////////////////////
// MAIN FUNCTION -- RETURNS ARRAYs OF OPTIMAL INPUTS, 
//                                    EXPECTED OUTPUTS, AND 
//                                    POOL ID ARRAYS
//////////////////////////

function calculateParallelSwapInputsOutputsPerPool(pools,inputAmount, inputToken, outputToken) {
    let ndxArray = calculateOptimalOutput(pools, inputAmount, inputToken, outputToken)
    let dyArray = [];
    for (var i=0; i<pools.length; i++) {
        let dyNow = new Big(calculate_dy_float(ndxArray[i],pools[i], inputToken, outputToken));
        dyArray.push(dyNow)
    }
    let poolIdArray = pools.map((item) => item.id);

    return ndxArray, dyArray, poolIdArray
}