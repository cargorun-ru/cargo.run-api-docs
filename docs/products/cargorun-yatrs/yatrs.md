<p align="left">
  <img src="./assets/cargorun-logo.png" alt="CARGO.RUN Logo" width="200">
</p>

# **CARGO.RUN Маршрутизация** (**YATRS**)

**YATRS** (Yet Another Truck Routing Service) — сервис построения грузовых маршрутов платформы CARGO.RUN.

Сервис позволяет построить маршрут между точками с учётом выбранного профиля маршрутизации и дополнительных параметров запроса: платных дорог, сезонных ограничений, страны поиска, дорожных ограничений и объектов инфраструктуры на маршруте.

## 1. Методы API

| Метод | Назначение |
|-------|------------|
| `POST /api/v2/Route` | Построение маршрута между двумя и более точками. |
| `POST /api/Account/Token` | Получение Bearer Token для работы со справочниками ограничений. |
| `GET /api/RoadRestrictions/GetListForExternal` | Получение справочника дорожных ограничений. |
| `GET /api/RoadRestrictionTypes/GetListForExternal` | Получение справочника типов дорожных ограничений. |

## 2. Базовый адрес сервиса

```text
https://yatrs.cargorun.ru/
```

## 3. Сценарий интеграции

1. Клиент получает Bearer Token через метод `POST /api/Account/Token`, передавая логин и пароль.
2. Клиент периодически загружает и полностью обновляет локальный справочник дорожных ограничений через метод `GET /api/RoadRestrictions/GetListForExternal`.
3. Клиент периодически загружает и полностью обновляет локальный справочник типов дорожных ограничений через метод `GET /api/RoadRestrictionTypes/GetListForExternal`.
4. При построении маршрута клиент вызывает `POST /api/v2/Route`.
5. В ответе маршрута клиент получает идентификаторы дорожных ограничений и сопоставляет их со своей локальной копией справочника `RoadRestrictions`.
6. Для отображения типа и визуального представления ограничения клиент использует локальный справочник `RoadRestrictionTypes`.

Рекомендуемая периодичность полной синхронизации справочников — **1 раз в сутки**.

## 4. Авторизация

В интеграции используются два способа авторизации.

### 4.1. Авторизация для построения маршрута

Для метода `POST /api/v2/Route` используется авторизация по **ApiKey**.

Ключ передаётся в HTTP-заголовке:

```http
Apikey: <ваш ApiKey>
```

### 4.2. Авторизация для справочников ограничений

Для методов справочников используется авторизация через **Bearer Token**:

- `GET /api/RoadRestrictions/GetListForExternal`
- `GET /api/RoadRestrictionTypes/GetListForExternal`

Токен передаётся в HTTP-заголовке:

```http
Authorization: Bearer <ваш access token>
```

## 5. Получение Bearer Token

```http
POST /api/Account/Token
```

Метод используется для получения Bearer Token, который далее применяется при вызове методов справочников.

Тело запроса:

```json
{
  "email": "client@example.com",
  "password": "your_password"
}
```

Поля:

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `email` | `string` | Да | Логин пользователя. |
| `password` | `string` | Да | Пароль пользователя. |

Пример запроса:

```bash
curl --request POST 'https://yatrs.cargorun.ru/api/Account/Token' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --data '{
    "email": "client@example.com",
    "password": "your_password"
  }'
```

Пример ответа:

```json
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example_token"
```

## 6. Справочник дорожных ограничений

```http
GET /api/RoadRestrictions/GetListForExternal
```

Метод возвращает список дорожных ограничений для использования внешними клиентами.

Авторизация: **Bearer Token**.

Рекомендации:

- хранить справочник локально;
- обновлять справочник полностью, без инкрементальной синхронизации;
- выполнять полное обновление раз в сутки.

Пример запроса:

```bash
curl --request GET 'https://yatrs.cargorun.ru/api/RoadRestrictions/GetListForExternal' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer <ваш access token>'
```

Пример ответа:

```json
[
  {
    "id": 245,
    "typeId": 1,
    "name": "АПВГК Обь",
    "description": "а/д Новосибирск - аэропорт Толмачево, 6 км",
    "location": [
      82.70038,
      54.99391
    ]
  }
]
```

Поля ответа:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | `long` | Идентификатор ограничения. |
| `typeId` | `long` | Идентификатор типа ограничения. |
| `name` | `string` | Наименование ограничения. |
| `description` | `string` | Описание ограничения. |
| `location` | `double[]` | Координаты ограничения. |

## 7. Справочник типов дорожных ограничений

```http
GET /api/RoadRestrictionTypes/GetListForExternal
```

Метод возвращает справочник типов дорожных ограничений.

Авторизация: **Bearer Token**.

Пример запроса:

```bash
curl --request GET 'https://yatrs.cargorun.ru/api/RoadRestrictionTypes/GetListForExternal' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer <ваш access token>'
```

Пример ответа:

```json
[
  {
    "id": 1,
    "name": "АПВГК",
    "iconType": 1,
    "iconUrl": "/icons/AWADCP.svg"
  }
]
```

Поля ответа:

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | `long` | Идентификатор типа ограничения. |
| `name` | `string` | Наименование типа ограничения. |
| `iconType` | `int` | Код типа иконки. |
| `iconUrl` | `string` | URL иконки. |

## 8. Построение маршрута

```http
POST /api/v2/Route
```

Метод строит маршрут между двумя и более точками.

Авторизация: **ApiKey**.

Пример запроса:

```json
{
  "points": [
    [
      37.760889,
      55.718376
    ],
    [
      52.467271999999994,
      55.679742
    ]
  ],
  "profile": "hgv_optimal",
  "options": {
    "avoidRoads": [
      "M1",
      "M3",
      "M11",
      "M12",
      "CRR",
      "EastExitUfa",
      "BypassTolyatti",
      "MRR",
      "Cond"
    ]
  },
  "calcPoints": true,
  "encodePoints": false,
  "calcTolls": true,
  "calcInstructions": false,
  "calcRoadRestrictions": true
}
```

Пример HTTP-запроса:

```bash
curl --request POST 'https://yatrs.cargorun.ru/api/v2/Route' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --header 'Apikey: <ваш ApiKey>' \
  --data '{
    "points": [
      [37.760889, 55.718376],
      [52.467271999999994, 55.679742]
    ],
    "profile": "hgv_optimal",
    "options": {
      "avoidRoads": [
        "M1",
        "M3",
        "M11",
        "M12",
        "CRR",
        "EastExitUfa",
        "BypassTolyatti",
        "MRR",
        "Cond"
      ]
    },
    "calcPoints": true,
    "encodePoints": false,
    "calcTolls": true,
    "calcInstructions": false,
    "calcRoadRestrictions": true
  }'
```

### 8.1. Основные поля запроса

| Поле | Тип | Описание |
|------|-----|----------|
| `points` | `double[][]` | Массив точек маршрута в формате `[longitude, latitude]`. Минимум 2 точки. |
| `profile` | `string` | Профиль маршрутизации. |
| `options` | `object` | Дополнительные параметры маршрутизации. |
| `elevation` | `bool` | Возвращать ли высоту в координатах маршрута. |
| `calcPoints` | `bool` | Рассчитывать ли геометрию маршрута. |
| `encodePoints` | `bool` | Возвращать ли геометрию маршрута в закодированном виде. |
| `calcInstructions` | `bool` | Возвращать ли инструкции движения. |
| `calcTolls` | `bool` | Возвращать ли информацию о платных участках. |
| `details` | `string[]` | Дополнительные детали маршрута. |
| `timeout` | `int` | Таймаут выполнения запроса в миллисекундах. |
| `simplifyPoints` | `bool?` | Упрощение геометрии маршрута. |
| `skipPatterns` | `bool` | Не учитывать шаблоны маршрутов. |
| `skipShortestAdjustment` | `bool` | Пропустить корректировки кратчайшего маршрута. |
| `calcRoadRestrictions` | `bool` | Возвращать ли дорожные ограничения и объекты инфраструктуры по маршруту. |
| `roadRestrictionFlags` | `int` | Флаг режима возврата ограничений. |
| `patternsOptions` | `object` | Настройки работы с шаблонами. |
| `roadRestrictionsOptions` | `object` | Настройки работы с дорожными ограничениями. |

### 8.2. Поля объекта `options`

| Поле | Тип | Описание |
|------|-----|----------|
| `avoidRoads` | `string[]` | Список дорог и групп дорог, которые необходимо исключить из маршрута. |
| `allowFerry` | `bool` | Разрешить использование паромов. |
| `country` | `string` | Ограничение поиска маршрута по стране. |

### 8.3. Поддерживаемые значения `profile`

- `hgv_optimal` — оптимальный маршрут;
- `hgv_shortest` — кратчайший вариант маршрута;
- `hgv15t_optimal` — профиль для машин с общим весом не более 15 тонн.

### 8.4. Поддерживаемые значения `options.country`

- `RUS`
- `ARM`
- `AZE`
- `BLR`
- `GEO`
- `TJK`
- `TUR`
- `TKM`
- `UZB`
- `KAZ`
- `KGZ`
- `null`

Код страны передаётся в формате ISO 3166-1 alpha-3.

### 8.5. Поддерживаемые значения `options.avoidRoads`

| Значение | Описание |
|----------|----------|
| `Tolls` | Исключать все платные дороги, включая те, которые не представлены в этом списке. |
| `M1` | М-1. |
| `M3` | М-3. |
| `M4` | М-4. |
| `M11` | М-11. |
| `M12` | М-12. |
| `Tolls-M3` | Исключать все платные дороги, кроме М-3. |
| `Tolls-M4` | Исключать все платные дороги, кроме М-4. |
| `TRR` | ТТК. |
| `MRR` | МКАД. |
| `CRR` | ЦКАД. |
| `MSD` | МСД, Московский скоростной диаметр. |
| `ZSD` | ЗСД, платная дорога. |
| `A289` | Федеральная автомобильная дорога А-289 Краснодар — Славянск-на-Кубани. |
| `EastExitUfa` | Восточный выезд из Уфы. |
| `BypassTolyatti` | Объезд Тольятти. |
| `Cond` | Использование сезонных ограничений. |

### 8.6. Значения `roadRestrictionFlags`

| Значение | Наименование |
|----------|--------------|
| `0` | `None` |
| `1` | `WithPlaton` |
| `2` | `Detailed` |

## 9. Пример ответа метода `/api/v2/Route`

```json
{
  "path": {
    "snappedInputPoints": [
      [
        37.76124,
        55.71825
      ],
      [
        52.46744,
        55.67983
      ]
    ],
    "distance": 1078876.293,
    "time": 53973,
    "pointsCount": 5319,
    "isPointsEncoded": false,
    "hasElevation": false,
    "points": [
      [
        37.76124,
        55.71825
      ],
      [
        37.76209,
        55.71897
      ]
    ],
    "details": {},
    "tollSegmentsInfo": {
      "segments": [
        {
          "tag": "platon",
          "trackName": "Платон",
          "points": [
            [
              37.9656634,
              55.7966147
            ],
            [
              38.065026,
              55.8079939
            ]
          ],
          "waypoints": null,
          "distance": 6338.57,
          "cost": 32.9,
          "weekendCost": 32.9,
          "rules": []
        }
      ],
      "distance": 1022000.9200000002,
      "cost": 5304.18,
      "weekendCost": 5304.184774800001
    },
    "patternIds": [],
    "roadRestrictionIds": [
      583,
      342,
      1941,
      1942,
      1943,
      2054
    ]
  },
  "status": 0,
  "humanReadableStatus": "Ok",
  "messages": null
}
```

## 10. Обработка дорожных ограничений в маршруте

Если в запросе маршрута установлен параметр:

```json
"calcRoadRestrictions": true
```

то в ответе могут быть возвращены:

- `path.roadRestrictionIds` — список идентификаторов ограничений на маршруте;
- `path.roadRestrictions` — список объектов ограничений с полями `id` и `index`.

Рекомендуемая логика обработки:

1. Получить `roadRestrictionIds` из ответа маршрута.
2. Найти по ним соответствующие элементы в локальном справочнике `RoadRestrictions`.
3. По полю `typeId` ограничения определить его тип через локальный справочник `RoadRestrictionTypes`.
4. Использовать `name`, `description`, `iconType` и `iconUrl` для отображения информации пользователю.

## 11. Особенности использования `Cond`

Если в `options.avoidRoads` передаётся значение `Cond`, то маршрут строится с учётом сезонных ограничений.

Рекомендуемая логика клиента:

- сначала выполнить построение маршрута с `Cond`;
- если маршрут не может быть построен с учётом сезонных ограничений, выполнить повторный запрос без `Cond`.

## 12. Рекомендуемый минимальный сценарий интеграции

1. Получить `ApiKey` для вызова метода маршрутизации.
2. Получить Bearer Token через `POST /api/Account/Token`, передав логин и пароль.
3. Раз в сутки выполнять полную загрузку:
   - `GET /api/RoadRestrictions/GetListForExternal`
   - `GET /api/RoadRestrictionTypes/GetListForExternal`
4. Сохранять справочники локально.
5. При необходимости построения маршрута вызывать `POST /api/v2/Route`.
6. Использовать `roadRestrictionIds` из ответа маршрута для поиска ограничений в локальном справочнике.
