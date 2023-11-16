/* eslint-disable @typescript-eslint/no-explicit-any */

export function transformLoadedSimulationResult({ simulationResult }: { simulationResult: any }) {
    if (simulationResult.returnData) {
        simulationResult.returnData.data = simulationResult.returnData.data[0];
    }
    return simulationResult;
}
