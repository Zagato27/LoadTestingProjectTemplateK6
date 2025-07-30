// k6/stages.js

import globalParams from "./global-params.js";

export function createRampingStages(baseRate) {
  const {
    incrementPercent,
    stepDuration,
    holdDuration,
    stepCount,
    initialWarmUpDuration,
    finalCoolDownDuration,
  } = globalParams;

  const stages = [];
  // Warm-up
  stages.push({ duration: initialWarmUpDuration, target: baseRate });

  let currentRate = baseRate;
  for (let i = 0; i < stepCount; i++) {
    currentRate = Math.round(currentRate * (1 + incrementPercent / 100));
    stages.push({ duration: stepDuration, target: currentRate });
    stages.push({ duration: holdDuration, target: currentRate });
  }
  // Завершаем сбросом
  stages.push({ duration: finalCoolDownDuration, target: 0 });

  return stages;
}

export function createStableStages(baseRate) {
  const { stableTestDuration } = globalParams;
  return [
    { duration: stableTestDuration, target: baseRate },
    { duration: "1m", target: 0 },
  ];
}

export function createPerfStages(baseRate) {
  const { perfTestDuration } = globalParams;
  return [
    { duration: perfTestDuration, target: baseRate },
    { duration: "1m", target: 0 },
  ];
}

export function createDebugStages(baseRate) {
  const { perfDebugDuration } = globalParams;
  return [
    { duration: perfDebugDuration, target: baseRate },
    { duration: "10s", target: 0 },
  ];
}
