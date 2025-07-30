// k6/scenario-configs/scenario-config2.js

export default {
    operationC: {
      exec: "scr_exampleQueryC",
      baseRate: 80,
      startRate: 1,
      timeUnit: "1s",
      preAllocatedVUs: 10,
      maxVUs: 120,
    },
  };
  