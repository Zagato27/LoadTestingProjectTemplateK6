// k6/buildScenarios.js

import { createRampingStages, createStableStages, createPerfStages, createDebugStages } from "./stages.js";

export function buildScenarios(config, testType, stand) {
  const scenarios = {};

  for (const scenarioName of Object.keys(config)) {
    const scenarioData = config[scenarioName];
    const scenarioKey = `${scenarioName}_scenario`;

    const baseRate = scenarioData.baseRate || 50;
    if (testType === "ramping") {
      scenarios[scenarioKey] = {
        executor: "ramping-arrival-rate",
        startRate: scenarioData.startRate || 1,
        timeUnit: scenarioData.timeUnit || "1s",
        preAllocatedVUs: scenarioData.preAllocatedVUs || 10,
        maxVUs: scenarioData.maxVUs || 1000,
        stages: createRampingStages(baseRate),
        exec: scenarioData.exec,
        env: { MY_STAND: stand },
      };
    } else if (testType === "stable") {
      scenarios[scenarioKey] = {
        executor: "ramping-arrival-rate", // можно constant-arrival-rate
        timeUnit: scenarioData.timeUnit || "1s",
        preAllocatedVUs: scenarioData.preAllocatedVUs || 10,
        maxVUs: scenarioData.maxVUs || 1000,
        stages: createStableStages(baseRate),
        exec: scenarioData.exec,
        env: { MY_STAND: stand },
      };
    } else if (testType === "perf") {
      scenarios[scenarioKey] = {
        executor: "ramping-arrival-rate",
        timeUnit: scenarioData.timeUnit || "1s",
        preAllocatedVUs: scenarioData.preAllocatedVUs || 10,
        maxVUs: scenarioData.maxVUs || 1000,
        stages: createPerfStages(baseRate),
        exec: scenarioData.exec,
        env: { MY_STAND: stand },
      };
    } else if (testType === "debug") {
      scenarios[scenarioKey] = {
        executor: "ramping-arrival-rate",
        startRate: scenarioData.startRate || 1,
        timeUnit: scenarioData.timeUnit || "1s",
        preAllocatedVUs: scenarioData.preAllocatedVUs || 1,
        maxVUs: scenarioData.maxVUs || 1,
        stages: createDebugStages(baseRate),
        exec: scenarioData.exec,
        env: { MY_STAND: stand },
      };

    } else {
      throw new Error(`Unknown testType: ${testType}`);
    }
  }
  return scenarios;
}
