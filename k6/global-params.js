// k6/global-params.js

export default {
    // Время для стабильного теста
    stableTestDuration: "12h",
    // Время для "perf"-теста
    perfTestDuration: "1h",
    // Время для "debug"-теста
    perfDebugDuration: "1s",
  
    // Параметры для "ramping"
    incrementPercent: 10,
    stepDuration: "1m",
    holdDuration: "5m",
    stepCount: 5,
    initialWarmUpDuration: "5m",
    finalCoolDownDuration: "3m",
  };
  