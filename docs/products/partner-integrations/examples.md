# Полные примеры

## Синхронное создание и отслеживание

```text
1. POST /api/Account/Token
   → сохранить accessToken.token и expiresIn

2. GET /api/integrations/Organizations/Check?inn=7701234567
   → проверить canCreateBids и hasAccess

3. POST /api/integrations/Organizations/Apply
   → при необходимости создать организацию или получить доступ

4. POST /api/integrations/Bids/Apply
   → сохранить id заявки CARGO.RUN

5. GET /api/integrations/Bids/Get?id={id}
   → карточка, статус и ETA

6. GET /api/integrations/Bids/GetEvents?id={id}
   → события исполнения

7. GET /api/integrations/Bids/GetActualRoute?id={id}&coordinateIntervalSeconds=60
   → фактические координаты

8. GET /api/integrations/Bids/GetDriverMessages?id={id}
   → сообщения и временные ссылки на файлы
```

## Асинхронное создание

### Поставить задачу

```http
POST <baseUrl>/api/integrations/Tasks/Queue
Authorization: Bearer <accessToken.token>
Content-Type: application/json
Idempotency-Key: write-order-2471970-v1
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
              "cargos": [
                {
                  "name": "Паллетированный груз"
                }
              ],
              "bidPoints": [
                {
                  "isLoadPoint": true,
                  "planEnterDate": "2026-10-08T10:00:00",
                  "geozone": {
                    "address": "Москва, улица Примерная, 1",
                    "location": { "coordinates": [37.6176, 55.7558] }
                  }
                },
                {
                  "isLoadPoint": false,
                  "planEnterDate": "2026-10-09T10:00:00",
                  "geozone": {
                    "address": "Казань, улица Примерная, 2",
                    "location": { "coordinates": [49.1064, 55.7961] }
                  }
                }
              ],
              "car": { "number": "А123АА777", "brandName": "КАМАЗ" },
              "driver": {
                "firstName": "Иван",
                "lastName": "Иванов",
                "phoneNumber": "+79991234567"
              }
            }
          }
        }
      ]
    }
  ]
}
```

Ответ постановки задачи:

```json
{
  "latencyMsec": 25,
  "enqueuedInMsec": 8,
  "commands": [
    {
      "id": 90001,
      "action": "Write",
      "status": "Success",
      "readyInMsec": 100,
      "message": null
    }
  ]
}
```

Если отдельная команда не поставлена в очередь, для неё возвращается `status="Failed"`, поле `id` отсутствует, а причина находится в `message`.

### Получить результат

```http
GET <baseUrl>/api/integrations/Tasks/Queue?id=90001
Authorization: Bearer <accessToken.token>
```

```json
{
  "status": "Completed",
  "origin": "Request",
  "readyInMsec": 100,
  "remainingObjectCount": 0,
  "attemptCount": 1,
  "maxAttemptCount": 3,
  "callbackStatus": "Delivered",
  "callbackAttemptCount": 1,
  "callbackMaxAttemptCount": 5,
  "objects": [
    {
      "key": "ORDER-2471970",
      "type": "Bid",
      "id": 12345,
      "status": "Success",
      "body": null,
      "message": null
    }
  ]
}
```

## Обработка `entity.changed`

```text
1. Прочитать raw body и заголовки.
2. Проверить допустимость X-Cargorun-Webhook-Timestamp.
3. Рассчитать HMAC_SHA256(secret, timestamp + "." + rawBody).
4. Сравнить с X-Cargorun-Webhook-Signature.
5. Проверить eventId на повтор.
6. Сохранить событие во внутреннюю очередь.
7. Вернуть HTTP 204.
8. Для каждого успешного объекта взять id.
9. Выполнить Read / Bid / Default.
10. Если нужны координаты — вызвать Bids/GetActualRoute.
```

## Восстановление после недоступности webhook

```json
{
  "commands": [
    {
      "action": "ReadQuery",
      "objects": [
        {
          "type": "Bid",
          "modelType": "Default",
          "query": "$filter=updatedAt gt 2026-10-07T07:59:55Z&$orderby=updatedAt,id&$top=100"
        }
      ]
    }
  ]
}
```

Интервал начинается немного раньше последнего курсора. Повторные записи удаляются по `id`, а более новые версии определяются по `updatedAt`.
