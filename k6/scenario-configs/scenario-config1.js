// k6/scenario-configs/scenario-config1.js

export default {
    // Название сценария (в вашем «продукте»):
    operationA: {
      exec: "scr_operationA",
      baseRate: 50,
      startRate: 1,
      timeUnit: "1s",
      preAllocatedVUs: 10,
      maxVUs: 100,
    },
    operationB: {
      exec: "scr_operationB",
      baseRate: 70,
      startRate: 1,
      timeUnit: "1s",
      preAllocatedVUs: 10,
      maxVUs: 150,
    },
  };
  