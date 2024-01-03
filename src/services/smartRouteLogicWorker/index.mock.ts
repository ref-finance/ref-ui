import { wrap } from 'comlink';

export function createSmartRouteLogicWorker() {
  try {
    return wrap<typeof import('./worker').default>(
      new Worker(new URL('worker.ts', ''))
    );
  } catch (error) {
    // console.error('Web Worker not supported');
  }
}
export function transformWorkerResult(
  data: string
): import('./../swap').EstimateSwapView[] | undefined {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing worker result', error);
  }
}
