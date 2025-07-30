// k6/scenario-configs/scenario-config.js

export default {
    // Название сценария (в вашем «продукте»):
    operationA: {
      exec: "scr_exampleQueryA",
      baseRate: 50,
      startRate: 1,
      timeUnit: "1s",
      preAllocatedVUs: 10,
      maxVUs: 100,
    },
    operationB: {
      exec: "scr_exampleQueryB",
      baseRate: 70,
      startRate: 1,
      timeUnit: "1s",
      preAllocatedVUs: 10,
      maxVUs: 150,
    },
  };
  