# Получение связанных заявок

Перевозчик может связать заявку CARGO.RUN с заказом партнёрского сервиса. Для этого в интерфейсе CARGO.RUN он указывает:

- партнёрский сервис (`ExternalPlatform`);
- идентификатор заказа (`ExternalPlatformOrderId`).

Оба значения должны быть заполнены. CARGO.RUN сопоставляет `ExternalPlatform` с платформой, настроенной у интеграционного клиента.

!!! warning "Область выборки"
    Фильтрация выполняется по платформе, а не непосредственно по `clientId`. Несколько активных интеграционных клиентов одной платформы могут получить одинаковые связанные заявки.

## Синхронный список

Используйте [`GET /api/integrations/Bids/GetCurrentList`](../reference/endpoints.md#get-apiintegrationsbidsgetcurrentlist).

```http
GET <baseUrl>/api/integrations/Bids/GetCurrentList?$filter=updatedAt gt 2026-10-06T08:00:00Z&$orderby=updatedAt,id&$top=100
Authorization: Bearer <accessToken.token>
```

Ответ:

```json
[
  {
    "id": 12345,
    "externalId": "ORDER-2471970",
    "status": "Started",
    "isDeleted": false,
    "createdAt": "2026-10-06T10:00:00+03:00",
    "updatedAt": "2026-10-07T11:00:00+03:00"
  }
]
```

В `externalId` возвращается `ExternalPlatformOrderId`.

## Асинхронный список

Используйте `ReadQuery / Bid / Default`:

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

После завершения задачи `objects[0].body` содержит `IntegrationBidListModel[]`.

Для `ReadQuery` поля `id`, `version` и `key` должны отсутствовать, а `query` должен быть непустым.

## Первичная загрузка и пагинация

1. Выберите начальное значение `updatedAt`.
2. Запрашивайте данные с `$orderby=updatedAt,id`.
3. Используйте `$top` и `$skip` либо собственный курсор.
4. Сохраняйте последний успешно обработанный `(updatedAt,id)`.
5. Следующий интервал начинайте на несколько секунд раньше.
6. Удаляйте дубли по `id`.

Без явного фильтра по `updatedAt` асинхронный `ReadQuery` ограничивает результат заявками, изменёнными за последние 30 дней.

## Собственные заявки партнёра

Для заявок, созданных текущим партнёром, существует отдельный синхронный метод:

[`GET /api/integrations/Bids/GetList`](../reference/endpoints.md#get-apiintegrationsbidsgetlist)

```http
GET <baseUrl>/api/integrations/Bids/GetList
```

Он возвращает только заявки текущего интеграционного клиента, имеющие его `externalId`. `GetCurrentList` и `ReadQuery` предназначены для заявок, которые перевозчики транслируют платформе.
