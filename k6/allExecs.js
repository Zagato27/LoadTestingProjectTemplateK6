// k6/allExecs.js

import { authentication } from "../Scripts/HTTP/httpTest.js";
// Импорт бизнес-функций
import {
  operationA,
  operationB,
  operationC,
} from "../Scripts/HTTP/httpTest.js";

function withAuth(fn) {
  return function () {
    authentication_ruip();
    fn();
  };
}

// Экспортируем exec-функции
export const scr_operationA = withAuth(operationA);
export const scr_operationB = withAuth(operationB);
export const scr_operationC = withAuth(operationC);
