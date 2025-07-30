// k6/allExecs.js

// Импорт бизнес-функций
import {
  authentication,
  exampleQueryA,
  exampleQueryB,
} from "../Scripts/HTTP/httpTest.js";

function withAuth(fn) {
  return function () {
    authentication();
    fn();
  };
}

// Экспортируем exec-функции
export const scr_exampleQueryA = withAuth(exampleQueryA);
export const scr_exampleQueryB = withAuth(exampleQueryB);
