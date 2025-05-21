### Краткие пояснения

1. Переменная окружения  
   - `HOST` (например, --env HOST="https://my-graphql-service") определяет базовый URL.

2. Аутентификация  
   - Если не нужна, можно убрать блоки authentication(), parseJwt, isTokenValid, requestNewToken и вызов в default function.
   - Если нужна, подставьте правильный OAuth/OpenID endpoint (/realms/demo/protocol/openid-connect/token – пример).

3. GraphQL-запросы  
   - Функции exampleQueryA() и exampleQueryB() демонстрируют, как формировать тело запроса.  
   - Меняйте пути (/graphql-endpoint-1, /graphql-endpoint-2), названия query или mutation, переменные и прочее.

4. Тестовые данные  
   - sampleData.json содержит массив items, у каждого — поле "id".  
   - Скрипт вызывает getRandomId(), выбирает один из items случайно.

5. Проверки (`check`)  
   - Проверяем лишь что статус в диапазоне 2xx. Можно добавить другие проверки (например, поля JSON).

6. Сценарий (default function)  
   - Сперва вызов authentication() (получаем токен, если нужно).  
   - Затем один или несколько GraphQL‑запросов, вызванных по очереди.

7. Настройка  
   - В options (iterations, vus, thresholds) настраивайте нагрузку, SLA, и т.д.
   - Можно внедрить scenarios (ramping, constant‑arrival, perf) для более гибкой нагрузки.