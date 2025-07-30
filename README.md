# Шаблон нагрузочных тестов (k6)

Этот проект содержит готовую структуру для **нагрузочных тестов** на базе [k6](https://k6.io/).  
Подходит для быстрой раскатки на новые проекты НТ, где нужно несколько типов тестов (ramping, stable, perf, debug), разные конфиги сценариев и общие параметры.

## Структура каталогов

- **`k6/global-params.js`**: глобальные параметры нагрузок (время теста, шаги, warm-up и т.д.).
- **`k6/Profile/`**: операционные конфиги (каждый файл описывает набор сценариев).
- **`k6/stages.js`**: функции генерации «ступеней» (ramping, stable, perf).
- **`k6/allExecs.js`**: exec-функции (scr_...) с логикой авторизации (через `withAuth`).
- **`k6/buildScenarios.js`**: сборка `options.scenarios` на основе типа теста (`ramping|stable|perf|debug`).
- **`k6/mergeConfigs.js`**: утилита объединения нескольких конфигов (по списку).
- **`k6/main_test.js`**: главный скрипт k6. Автоматически ищет файлы в `k6/scenario-configs`, собирает scenarios, задаёт thresholds и экспортирует exec-функции.

## Запуск локально

Убедитесь, что **k6** установлен и доступен в PATH.  
Затем можно запустить, например:

```bash
cd new-project-nt-load-tests
k6 run k6/main_test.js \
  --env STAND="http://mytest.server" \
  --env SCENARIO_CONFIG_PATH="config1" \
  --env TEST_TYPE="ramping"
```
## Запуск в GitLab CI
Файл .gitlab-ci.yml содержит заготовку для запуска тестов:
- Считывает переменные окружения STAND, TEST_TYPE, PROFILE.
- Устанавливает SCENARIO_CONFIG_PATH и TYPE в зависимости от выбора.
- Запускает k6 run в фоне, обрабатывая отмену пайплайна (SIGTERM/SIGINT) для корректного завершения.

## Добавление новой операции

1. Добавить бизнес-логику в k6/Scripts/HTTP/httpTest.js (или другой файл).
2. Создать exec-функцию в allExecs.js, обёрнутую в withAuth(...).
3. В каком-нибудь scenario-configX.js прописать:
<<<<<<< HEAD
```js
=======
  ```js 
>>>>>>> 3ec1791abfe45f571ad95d19434ae28c739b1c49
   myNewOperation: {
     exec: "scr_myNewOperation",
     baseRate: 80,
     // ...
   }
<<<<<<< HEAD
```   
=======
```

>>>>>>> 3ec1791abfe45f571ad95d19434ae28c739b1c49
4. Импортируем все exec-функции из 1 пункта в main_test.js
5. Запустить, указав нужный SCENARIO_CONFIG_PATH и TEST_TYPE.

## Добавление нового конфига

1. Создайте файл scenario-configX.js в k6/scenario-configs/ или добавьте сценарии в уже существующий.
```js
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
```

2. Опишите там свои сценарии.
<<<<<<< HEAD
3. В main_test.js добавьте обработку case "configX" и импорт нового файла scenario-configX.js:.
```js
import scenarioConfigX from "./Profile/scenario-configX.js";
import scenarioConfigX1 from "./Profile/scenario-configX1.js";

//...Остальной код

for (const name of configNames) {
  switch (name) {
    case "scenario-configX":
      configsToMerge.push(scenarioConfigX);
      break;
    case "scenario-configX1":
      configsToMerge.push(scenarioConfigX1);
      break;  
    default:
      throw new Error(`Unknown config name: ${name}`);
  }
}
```



4. Теперь можно вызывать несколько конфигов, через запятую:
```bash  
   k6 run k6/Profile/main_test.js --env SCENARIO_CONFIG_PATH="scenario-configX,scenario-configX1"
``` 
=======
3. Просто укажите `SCENARIO_CONFIG_PATH="configX"` при запуске (можно перечислить несколько имён через запятую).
4. main_test.js автоматически найдёт нужные файлы и объединит их:
   
```bash
   k6 run k6/Profile/main_test.js --env SCENARIO_CONFIG_PATH="config1,configX"
  ``` 
>>>>>>> 3ec1791abfe45f571ad95d19434ae28c739b1c49

## Поддержка

В случае вопросов по k6 и структуре обращайтесь к документации [k6.io/docs](https://k6.io/docs).
