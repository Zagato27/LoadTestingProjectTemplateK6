// k6/mergeConfigs.js

export function mergeConfigs(configArray) {
    // Самый простой merge
    return Object.assign({}, ...configArray);
  }
  