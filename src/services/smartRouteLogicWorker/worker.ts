import { stableSmart } from './smartRouteLogicSimple.js';

export async function getStableSmart({
  pools,
  inputToken,
  outputToken,
  totalInput,
  slippageTolerance,
}) {
  const result = await stableSmart({
    pools,
    inputToken,
    outputToken,
    totalInput,
    slippageTolerance,
  });
  return JSON.stringify(result);
}
