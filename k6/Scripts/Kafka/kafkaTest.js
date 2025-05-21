import { check, sleep, group } from "k6";
import { Writer, SASL_SCRAM_SHA512, TLS_1_2 } from "k6/x/kafka";
import { crypto } from "k6/experimental/webcrypto";
import { SharedArray } from "k6/data";
import sql from "k6/x/sql";
import encoding from "k6/encoding";

// --------------------------------------------
// ------ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ И НАСТРОЙКИ -----
// --------------------------------------------

const pipelineId = __ENV.CI_PIPELINE_ID || "local-pipeline";

// Адреса Kafka-брокеров и пароль аутентификации (SASL)
const kafkaBrokers = [__ENV.KAFKA_BROKER_IP || "localhost:9092"];
const kafkaPassword = __ENV.KAFKA_PASSWORD || "secret_password";

// Если нужно писать в PostgreSQL (раскомментируйте):
// const connectionString = "postgres://user:password@host:5432/dbname?sslmode=disable";
// const db = sql.open("postgres", connectionString);

const usernameSasl = "admin";  // Имя пользователя для SASL
const sendTopic = "apps-ruip.addressstruct.search"; // Пример топика

// --------------------------------------------
// ------ ОБЪЕКТ НАСТРОЕК K6 (options) --------
// --------------------------------------------

export let options = {
  iterations: 1,
  // thresholds: {
  //   "kafka_writer_error_count": ["rate < 0.05"],
  //   "checks": ["rate>0.95"],
  // },
};

// --------------------------------------------
// ------ KAFKA: СОЗДАНИЕ WRITER ---------------
// --------------------------------------------

const saslConfig = {
  username: usernameSasl,
  password: kafkaPassword,
  algorithm: SASL_SCRAM_SHA512,
};

const tlsConfig = {
  enableTls: false,
  insecureSkipTlsVerify: false,
  minVersion: TLS_1_2,
};

const writer = new Writer({
  brokers: kafkaBrokers,
  topic: sendTopic,
  sasl: saslConfig,
  requiredAcks: 0,
  tls: tlsConfig,
});

// --------------------------------------------
// ------ ЧТЕНИЕ ДАННЫХ И ШАБЛОНОВ ------------
// --------------------------------------------

// Пример чтения тестовых данных из ./DATA/sampleData.json
const jsonData = new SharedArray("TEST_DATA_ADDRESS", function () {
  return JSON.parse(open("./DATA/sampleData.json")).address;
});

// Пример чтения JSON-шаблона из ./TEMPLATES/messageTemplate.json
const messageTemplate = JSON.parse(open("./TEMPLATES/messageTemplate.json"));

// --------------------------------------------
// ------ ФУНКЦИИ ПОМОЩНИКИ -------------------
// --------------------------------------------

// При необходимости: запись результата в PostgreSQL (закомментировано)
/*
function sendDataToPostgreSQL(batch, topic, startTime) {
  let sqlQuery = "BEGIN;";
  sqlQuery += "INSERT INTO kafka (queryId, startTime, pipelineId, topic) VALUES";
  sqlQuery += batch
    .map(
      (item) => `('${item.queryId}', '${startTime}', ${pipelineId}, '${topic}')`
    )
    .join(",");
  sqlQuery += "; COMMIT;";
  db.exec(sqlQuery);
}
*/

// Генерация строки "XXTYYY", если нужно подобное
function incomeStd() {
  const formattedTwoDigit = String(Math.floor(Math.random() * 99) + 1).padStart(
    2,
    "0"
  );
  const formattedThreeDigit = String(Math.floor(Math.random() * 999) + 1).padStart(
    3,
    "0"
  );
  return `${formattedTwoDigit}T${formattedThreeDigit}`;
}

// Строим одно сообщение на основе шаблона и рандомных данных
function buildKafkaMessage() {
  // Глубокое копирование шаблона
  const msg = JSON.parse(JSON.stringify(messageTemplate));

  // Заполняем UUID и прочие поля
  msg.queryId = crypto.randomUUID();
  msg.loadingId = crypto.randomUUID();
  msg.incomeStd = incomeStd();


  // Рандомный адрес из массива jsonData
  const randomAddress = jsonData[Math.floor(Math.random() * jsonData.length)] || {};
  msg.address.country = randomAddress.country || "";
  msg.address.subject = randomAddress.subject || "";
  msg.address.region = randomAddress.region || "";
  msg.address.locality = randomAddress.locality || "";
  msg.address.district = randomAddress.district || "";
  msg.address.street = randomAddress.street || "";
  msg.address.house = randomAddress.house || "";
  msg.address.building = randomAddress.building || "";
  msg.address.construction = randomAddress.construction || "";
  msg.address.flat = randomAddress.flat || "";
  msg.address.room = randomAddress.room || "";

  return msg;
}

// Генерируем массив (batch) сообщений, кодируем в base64, готовим для writer.produce()
function produceKafkaBatch(numMessages) {
  const batch = [];
  for (let i = 0; i < numMessages; i++) {
    batch.push(buildKafkaMessage());
  }
  const jsonStr = JSON.stringify(batch);
  const encoded = encoding.b64encode(jsonStr);
  const correlationId = batch[0].loadingId;

  return {
    batch,
    message: [
      {
        value: encoded,
        headers: {
          correlationId: correlationId,
        },
      },
    ],
  };
}

// --------------------------------------------
// ------ ОСНОВНАЯ ЛОГИКА (scenario) ----------
// --------------------------------------------

function sendBatchToTopic(numMessages) {
  group("Отправка сообщений в Kafka-топик", () => {
    const { batch, message } = produceKafkaBatch(numMessages);
    const startTime = new Date().toISOString();

    try {
      let error = writer.produce({ messages: message });
      check(error, {
        "is sent": (err) => err === undefined,
      });
      if (error) {
        throw new Error("Ошибка при отправке сообщения в Kafka");
      }

      // При необходимости: 
      // sendDataToPostgreSQL(batch, sendTopic, startTime);
    } catch (err) {
      console.error(err);
    } finally {
      sleep(1); // небольшая пауза
    }
  });
}

// --------------------------------------------
// ------ СЦЕНАРИЙ k6 (default) ---------------
// --------------------------------------------

export default function () {
  // Напр., шлём 658 сообщений за итерацию
  sendBatchToTopic(658);
}

// Очистка (закрытие коннектов) в teardown
export function teardown() {
  writer.close();
  // db.close();
}
