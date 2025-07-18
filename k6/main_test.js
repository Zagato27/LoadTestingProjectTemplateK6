// k6/main_test.js

import { mergeConfigs } from "./mergeConfigs.js";
import { buildScenarios } from "./buildScenarios.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
const configNames = configPath.split(",").map((s) => s.trim()).filter(Boolean);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function discoverScenarioFiles() {
  const dir = path.join(__dirname, "scenario-configs");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".js"))
    .reduce((acc, file) => {
      const name = file.replace(/^scenario-/, "").replace(/\.js$/, "");
      acc[name] = file;
      return acc;
    }, {});
}

async function loadScenarioConfigs(names) {
  const map = discoverScenarioFiles();
  const promises = names.map(async (name) => {
    if (!map[name]) {
      throw new Error(`Unknown config name: ${name}`);
    }
    const module = await import(`./scenario-configs/${map[name]}`);
    return module.default;
  });
  return Promise.all(promises);
}

const configsToMerge = await loadScenarioConfigs(configNames);
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
