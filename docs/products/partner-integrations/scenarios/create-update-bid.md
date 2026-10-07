# Создание и обновление заявки

Партнёр может создать или полностью обновить заявку синхронно либо через очередь. В обоих вариантах используется одна модель `ApplyBidFromIntegrationContext`.

## Предварительные условия

- организация существует;
- организация создана партнёрским сервисом или текущему партнёру явно выдан доступ;
- [`Organizations/Check`](../reference/endpoints.md#get-apiintegrationsorganizationscheck) возвращает `canCreateBids=true`;
- для создания переданы водитель, автомобиль и минимум две точки.

## Синхронный вариант

```http
POST <baseUrl>/api/integrations/Bids/Apply
Authorization: Bearer <accessToken.token>
Content-Type: application/json
```

```json
{
  "inn": "7701234567",
  "bid": {
    "externalId": "ORDER-2471970",
    "comment": "Доставка груза",
    "bidPoints": [
      {
        "isLoadPoint": true,
        "planEnterDate": "2026-10-08T10:00:00",
        "geozone": {
          "location": {
            "type": "Point",
            "coordinates": [37.6176, 55.7558]
          },
          "address": "Москва, улица Примерная, 1"
        }
      },
      {
        "isLoadPoint": false,
        "planEnterDate": "2026-10-09T10:00:00",
        "geozone": {
          "location": {
            "type": "Point",
            "coordinates": [49.1064, 55.7961]
          },
          "address": "Казань, улица Примерная, 2"
        }
      }
    ],
    "car": {
      "number": "А123АА777",
      "brandName": "КАМАЗ"
    },
    "driver": {
      "firstName": "Иван",
      "lastName": "Иванов",
      "phoneNumber": "+79991234567"
    }
  }
}
```

Успешный ответ:

```json
{
  "id": 12345,
  "isRouteBuilt": true
}
```

Заявка автоматически запускается в работу. Если найденная заявка ещё не запущена, обновление также запускает её.

## Асинхронный вариант

```http
POST <baseUrl>/api/integrations/Tasks/Queue
Authorization: Bearer <accessToken.token>
Content-Type: application/json
Idempotency-Key: create-order-2471970-v1
```

```json
{
  "commands": [
    {
      "action": "Write",
      "objects": [
        {
          "type": "Bid",
          "modelType": "Default",
          "key": "ORDER-2471970",
          "body": {
            "inn": "7701234567",
            "bid": {
              "externalId": "ORDER-2471970",
              "bidPoints": [],
              "car": {},
              "driver": {}
            }
          }
        }
      ]
    }
  ]
}
```

В рабочем запросе заполните `bid` так же, как для [`Bids/Apply`](../reference/endpoints.md#post-apiintegrationsbidsapply). Если `bid.externalId` отсутствует, обработчик использует `objects[].key`.

После завершения ID заявки находится в `objects[].id`. `isRouteBuilt` через очередь не возвращается.

## Создание связанных сущностей

- водитель ищется в организации по `phoneNumber`; при отсутствии создаётся;
- автомобиль и прицеп ищутся по `number`; при отсутствии создаются;
- первый и второй водитель обрабатываются независимо.

## Требования к маршруту

- минимум две точки;
- `planEnterDate` обязательно для каждой точки;
- точки должны идти в строгом хронологическом порядке;
- время передаётся как локальное время координат точки без UTC-смещения;
- часовой пояс определяется CARGO.RUN по координатам;
- `geozone.location` и `geozone.address` обязательны;
- координаты передаются как `[долгота, широта]`.

В основном сценарии используются погрузка (`isLoadPoint=true`) и выгрузка (`isLoadPoint=false`).

## Обновление

Обновление возможно:

- по `externalId`, если заявка создана текущим партнёром;
- по внутреннему `id`, полученному от CARGO.RUN;
- по `id` доступной заявки другого партнёра, если соответствующий доступ разрешён.

Частичное обновление не поддерживается. Передавайте полную актуальную модель. Точки маршрута при обновлении пересоздаются.

Уникальность собственной заявки определяется сочетанием организации, интеграционного клиента, источника и `externalId`.
