// k6/main_test.js

import scenarioConfig1 from "./scenario-configs/scenario-config1.js";
import scenarioConfig2 from "./scenario-configs/scenario-config2.js";
import { mergeConfigs } from "./mergeConfigs.js";
import { buildScenarios } from "./buildScenarios.js";

// Импортируем все exec-функции
import {
  scr_operationA,
  scr_operationB,
  scr_operationC,
} from "./allExecs.js";

// Экспортируем exec-функции
export {
  scr_operationA,
  scr_operationB,
  scr_operationC,
};

// Считываем переменные окружения
const configPath = __ENV.SCENARIO_CONFIG_PATH || "config1";
const testType = __ENV.TEST_TYPE || "ramping";
const stand = __ENV.STAND || "";

// Разбиваем configPath (например, "config1,config2") в массив
const configNames = configPath.split(",").map((s) => s.trim());
const configsToMerge = [];

for (const name of configNames) {
  switch (name) {
    case "config1":
      configsToMerge.push(scenarioConfig1);
      break;
    case "config2":
      configsToMerge.push(scenarioConfig2);
      break;
    default:
      throw new Error(`Unknown config name: ${name}`);
  }
}

const mergedConfig = mergeConfigs(configsToMerge);

export let options = {
  scenarios: buildScenarios(mergedConfig, testType, stand),

  // thresholds (пример)
  thresholds: {
    http_req_duration: [
      {
        threshold: "p(95) < 5000",
        abortOnFail: true,
        delayAbortEval: "10s",
      },
    ],
    http_req_failed: [
      {
        threshold: "rate < 0.05",
        abortOnFail: true,
        delayAbortEval: "10s",
      },
    ],
  },
};

// Если вам нужно "setup" и "teardown" — добавьте сюда
export function setup() {
  console.log(`Starting test with testType="${testType}" and stand="${stand}"`);
}

export function teardown(data) {
  console.log("Finished test. Data:", data);
}
