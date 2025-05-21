### Краткие пояснения

1. Папки:
   - DATA/ — хранит sampleData.json.
   - TEMPLATES/ — хранит messageTemplate.json.
2. Переменные окружения:
   - CI_PIPELINE_ID, KAFKA_BROKER_IP, KAFKA_PASSWORD при желании можно переопределить при запуске.
3. Kafka Writer:
   - С аутентификацией SASL (SCRAM-SHA512) и настройками TLS (при необходимости).
   - Параметр requiredAcks: 0 — можно поменять на 1 или -1 (все реплики).
4. Чтение данных:
   - SharedArray читает sampleData.json → массив address.
   - messageTemplate загружается из messageTemplate.json.
5. Функции:
   - buildKafkaMessage() клонирует шаблон, генерирует UUID, вставляет случайный адрес.
   - produceKafkaBatch(numMessages) генерирует массив сообщений, кодирует в base64, формирует структуру для writer.produce.
6. Основной сценарий:
   - Вызывает sendBatchToTopic(658), который отправляет 658 сообщений в топик, проверяя отсутствие ошибок.
7. Teardown:
   - Закрывает writer (а также db, если PostgreSQL включён).