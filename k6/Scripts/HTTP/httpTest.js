import http from "k6/http";
import { sleep, check, group } from "k6";
import { SharedArray } from "k6/data";
import encoding from "k6/encoding";

// ------------------ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ ------------------

const host = __ENV.HOST || "http://localhost:8080"; // Хост API, например: --env HOST="https://my-graph-ql.server"
let accessToken = null; // Для хранения токена, если нужен.

// ------------------ K6 OPTIONS ------------------

export let options = {
  iterations: 10,
  insecureSkipTLSVerify: true, // при необходимости пропустить проверку TLS
  // thresholds: {
  //   http_req_duration: ["p(95)<2000"],
  // },
};

// ------------------ ЧТЕНИЕ ТЕСТОВЫХ ДАННЫХ ------------------

const jsonData = new SharedArray("SAMPLE_DATA", function () {
  return JSON.parse(open("./DATA/sampleData.json")).items;
});

function getRandomId() {
  const item = jsonData[Math.floor(Math.random() * jsonData.length)];
  return item.id;
}

// ------------------ АУТЕНТИФИКАЦИЯ (ПРИ НЕОБХОДИМОСТИ) ------------------

export function authentication() {
  group('Authentication(AllRequests)', () => {
    function parseJwt(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = JSON.parse(
        encoding.b64decode(base64, 'rawstd', 's')
      );
      return jsonPayload;
    }

    function isTokenValid(decoded) {
      return decoded && decoded.exp > Date.now() / 1000;
    }

    function requestNewToken() {
      const authUrl =
        'https://sso.host.test:443/realms/test/protocol/openid-connect/token';
      const body = {
        client_id: 'nsi',
        client_secret: 'secret',
        username: 'user',
        password: 'pass',
        scope: 'openid',
        grant_type: 'password',
      };
      const params = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      };
      const res = http.post(authUrl, body, params);
      return res.json().access_token;
    }

    if (!accessToken || !isTokenValid(parseJwt(accessToken))) {
      accessToken = requestNewToken();
    }
  });
}




// ------------------ ПРИМЕР GRAPHQL-ЗАПРОСА 1 ------------------

export function exampleQueryA() {
  group("ExampleQueryA", () => {
    const url = `${host}/graphql-endpoint-1`;
    const randomId = getRandomId();
    // Пример GraphQL-запроса (псевдо)
    const query = `
      query {
        someEntityById(id: "${randomId}") {
          id
          name
          additionalField
        }
      }
    `;

    const body = JSON.stringify({ query: query, variables: {} });
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`, // если нужен токен
    };

    const res = http.post(url, body, { headers });
    check(res, {
      "A status 2xx": (r) => r.status >= 200 && r.status < 300,
    });

    sleep(0.2);
  });
}

// ------------------ ПРИМЕР GRAPHQL-ЗАПРОСА 2 ------------------


export function exampleQueryB() {
    group("ExampleQueryB", () => {
      const url = `${host}/graphql-endpoint-2`;
      const randomId = getRandomId();
      // Пример GraphQL-запрос
      const query = `
        mutation {
          updateSomeEntity(id: "${randomId}", input: { field: "value" }) {
            success
            errors
          }
        }
      `;
      const body = JSON.stringify({ query: query, variables: {} });
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      };
  
      const res = http.post(url, body, { headers });
      check(res, {
        "B status 2xx": (r) => r.status >= 200 && r.status < 300,
      });
  
      sleep(0.2);
    });
  }
  
  // ------------------ СЦЕНАРИЙ ПО УМОЛЧАНИЮ ------------------
  
  export default function () {
    authentication(); // перед любыми запросами
  
    // Вызываем нужные методы (запросы):
    exampleQueryA();
    exampleQueryB();
  
    // При желании, можно рандомизировать выбор функций:
    // const randomPick = Math.random() < 0.5 ? exampleQueryA : exampleQueryB;
    // randomPick();
  }
  