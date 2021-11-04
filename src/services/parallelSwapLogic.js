import Big from 'big.js';
//import allPools from 'testPools.js';

Big.DP = 40;
Big.strict = false;

// Steps.

// Choose pair of tokens: 
// let inputToken = 'wrap.testnet'
// let outputToken = 'banana.ft-fin.testnet'

// Choose input token amount:
//  let inputAmount = '10000000000'

// Query all Pools to find ones that match the chosen inputToken/outputToken pair.
// let filteredPools = filterPoolsByTokenPair(allPools, inputToken, outputToken)

 function getAllTokens(allPools) {
     // Note, here we should plumb in a function that requests all tokens from the Dexie Database. 
     // For now, it just scans the global allPools.
     allTokens = [];
     for (var i=0;i<allPools.length;i++){
        let p = allPools[i];
        token1 = p.token_account_ids[0];
        token2 = p.token_account_ids[1];
        if (!allTokens.includes(token1)) {
            allTokens.push(token1);
        }
        if (!allTokens.includes(token2)) {
            allTokens.push(token2);
        }
     }
     return allTokens;
 };


// allTokens = getAllTokens(allPools);

function filterPoolsByTokenPair(allPools, inputToken, outputToken) {
    let filteredPools = [];
    for (var i=0; i<allPools.length; i++) {
        let pool = allPools[i];
        if (pool.token_account_ids.includes(inputToken) && pool.token_account_ids.includes(outputToken) && !pool.amounts.includes('0')) {
            filteredPools.push(pool);
        }
    }
    return filteredPools;
}



function getExpectedOutputAmount(inputToken,filteredPools,inputAmount) {
    let solution = getBestOutput(inputToken, inputAmount, filteredPools);
    let outputAmount = solution.outputAmount;
    return outputAmount;
};




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

function formatPoolNew(pool, inputToken) {
    let p = pool;
    console.log('pool is ... ',pool);
    for (var i=0; i<p.tokenIds.length; i++){
        let tokenId = p.tokenIds[i];
        if (tokenId != inputToken) {
            let outputToken = tokenId;
        }
    }
    p['gamma_bps'] = new Big(10000).minus(p.fee);
    p['x'] = p.amounts[inputToken];
    p['y'] = p.amounts[outputToken];
    console.log('pool is ... ' pool)
    return p;
}


function calculate_dx_float(mu, pool,inputToken) {
    let p = formatPoolNew(pool, inputToken);
    let radical = new Big(p.x).times(p.y).div(p.gamma_bps);
    let dxFloat = new Big(mu).times(100).times(radical.sqrt()).minus(new Big(p.x).times(10000).div(p.gamma_bps));
    return dxFloat
};


    
function calculate_dy_float(dx_float,pool, inputToken) {
    if (dx_float <= 0) {
    return new Big(0);
    } 
    let p = formatPoolNew(pool, inputToken);
    let dx = new Big(dx_float);
    let denom = new Big(10000).times(p.x).plus(new Big(p.gamma_bps).times(dx));
    let numerator = new Big(p.y).times(dx).times(p.gamma_bps);
    let dyFloat = numerator.div(denom).round();
    return dyFloat;
};


async function solveForMuFloat(pools, totalDeltaX, inputToken) {
    if (pools.length > 0){
        console.log('total delta x is ... ', totalDeltaX);
        let numerator = new Big(totalDeltaX);
        let denominator = new Big(0);
        for (var i=0; i < pools.length; i++) {
            let p = formatPoolNew(pools[i],totalDeltaX,inputToken);
            let numAdd = new Big(p.x).times(10000).div(p.gamma_bps);
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
    // let totalInput = BigInt(totalInput);
    // let totalInput = Big(totalInput);
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

    
 export async function calculateOptimalOutput(pools, inputAmount, inputToken) {
	// This runs the main optimization algorithm using the input
	// console.log('input amount is... ',inputAmount)
	//let mu = solveForMu(pools, inputAmount);
	let mu = await solveForMuFloat(pools, inputAmount, inputToken);
	// console.log('mu is ... ', mu)
	let dxArray = new Array();
	let negativeDxValsFlag = false;
	for (var i=0; i<pools.length; i++) {
	    let pool = pools[i];
		let dx = calculate_dx_float(mu,pool,inputToken);
		if (dx<0) {
			// console.log('found a negative dx value!')
			negativeDxValsFlag = true;
		}
        let dxInt = new Big(dx).round()
		dxArray.push(dxInt);
	}
	if (negativeDxValsFlag) {
		  dxArray = reducePools(pools, dxArray,inputAmount, inputToken);
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


 function reducePools(pools, dxArray, inputAmount, inputToken) {
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
	let newDxVec = calculateOptimalOutput(newPools,inputAmount,inputToken);
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


function getBestOutput(inputToken, inputAmount, filteredPools) {
    let totalInput = new Big(inputAmount);
    let result = getAllocationsAndOutputs(totalInput, filteredPools, inputToken);
    let totalAllocationInt = Big(0);
    for (var i=0; i<result.allocations.length;i++) {
    totalAllocationInt = totalAllocationInt.plus(result.allocations[i]);
    }

    let dyOutVec = [];
    for (var i=0; i<result.outputs.length; i++) {
            dyOutVec.push(result.outputs[i].round().toFixed())
        }

    let totalDy = 0n;
    for (var i=0; i<dyOutVec.length; i++) {
    totalDy += BigInt(dyOutVec[i])
    }

    return {outputAmount: String(totalDy), 
            dyOutVec:dyOutVec};
    };





