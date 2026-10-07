# Быстрый старт

Во всех примерах `<baseUrl>` — адрес API CARGO.RUN, выданный при подключении.

## 1. Получить токен

```http
POST <baseUrl>/api/Account/Token
Content-Type: application/json
```

```json
{
  "grantType": "client_credentials",
  "clientId": "partner-client-id",
  "clientSecret": "partner-client-secret"
}
```

Сохраните `accessToken.token` из ответа и используйте его во всех последующих запросах:

```http
Authorization: Bearer <accessToken.token>
```

## 2. Выбрать сценарий

=== "Партнёр создаёт заявку"

    1. Проверить организацию по ИНН через [`Organizations/Check`](reference/endpoints.md#get-apiintegrationsorganizationscheck).
    2. При необходимости вызвать [`Organizations/Apply`](reference/endpoints.md#post-apiintegrationsorganizationsapply).
    3. Создать заявку синхронным [`Bids/Apply`](reference/endpoints.md#post-apiintegrationsbidsapply) или асинхронным `Write`.
    4. Сохранить ID заявки CARGO.RUN.

=== "Перевозчик связал заявку с партнёром"

    1. Получить связанные заявки через [`Bids/GetCurrentList`](reference/endpoints.md#get-apiintegrationsbidsgetcurrentlist) или асинхронный `ReadQuery`.
    2. Сохранить ID заявок CARGO.RUN.
    3. Получать полные данные синхронными методами или асинхронным `Read`.

## 3. Получить связанные заявки

Синхронно:

```http
GET <baseUrl>/api/integrations/Bids/GetCurrentList?$orderby=updatedAt,id&$top=100
Authorization: Bearer <accessToken.token>
```

Асинхронно:

```http
POST <baseUrl>/api/integrations/Tasks/Queue
Authorization: Bearer <accessToken.token>
Content-Type: application/json
Idempotency-Key: initial-sync-2026-10-07
```

```json
{
  "commands": [
    {
      "action": "ReadQuery",
      "objects": [
        {
          "type": "Bid",
          "modelType": "Default",
          "query": "$filter=updatedAt gt 2026-10-06T08:00:00Z&$orderby=updatedAt,id&$top=100"
        }
      ]
    }
  ]
}
```

После постановки задачи получите её результат по возвращённому `taskId` либо дождитесь webhook `queued-task.finished`.

## 4. Получить полные данные заявки

Синхронно карточка, события, маршруты и сообщения запрашиваются отдельными [методами `Bids/Get*`](reference/endpoints.md#get-apiintegrationsbidsget).

Через очередь используйте `Read / Bid / Default`: результат содержит карточку, плановый маршрут, события и сообщения. Фактический маршрут всегда запрашивается синхронным [`Bids/GetActualRoute`](reference/endpoints.md#get-apiintegrationsbidsgetactualroute).

## 5. Подключить оперативные уведомления

CARGO.RUN настраивает для интеграционного клиента callback и подписку `Bid/Summary`. После этого партнёр получает webhook `entity.changed`, проверяет подпись, исключает повтор по `eventId` и запрашивает полные данные заявки по её ID.

Даже при использовании webhook периодически выполняйте `ReadQuery` по `updatedAt`: это позволяет восстановить изменения после длительной недоступности callback.
