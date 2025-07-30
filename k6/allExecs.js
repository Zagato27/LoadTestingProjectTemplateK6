// k6/allExecs.js

<<<<<<< HEAD
=======
import { authentication } from "../Scripts/HTTP/httpTest.js";
>>>>>>> 3ec1791abfe45f571ad95d19434ae28c739b1c49
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
