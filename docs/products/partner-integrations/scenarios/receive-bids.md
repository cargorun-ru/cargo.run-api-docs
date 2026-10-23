# Получение заявок

`GET /api/integrations/Bids/GetList` возвращает единый список:

- заявок, созданных текущим партнёром;
- заявок перевозчиков, транслируемых платформе партнёра.

Для транслируемой заявки перевозчик указывает в CARGO.RUN платформу
`ExternalPlatform` и идентификатор заказа `ExternalPlatformOrderId`. Оба значения
должны быть заполнены.

!!! warning "Область выборки"
    Транслируемые заявки выбираются по платформе, а не непосредственно по `clientId`.
    Несколько активных интеграционных клиентов одной платформы могут получить
    одинаковые заявки.

## Синхронный список

Все доступные организации:

```http
GET <baseUrl>/api/integrations/Bids/GetList?$filter=updatedAt%20gt%202026-10-06T08:00:00Z&$orderby=updatedAt,id&$top=100
Authorization: Bearer <accessToken.token>
```

Только одна организация:

```http
GET <baseUrl>/api/integrations/Bids/GetList?$filter=updatedAt%20gt%202026-10-06T08:00:00Z&$orderby=updatedAt,id&$top=100
Authorization: Bearer <accessToken.token>
X-Organization-Id: 12345
```

`X-Organization-Id` необязателен только как ограничитель области этого метода. Если
заголовок передан, организация должна быть доступна интеграционному клиенту.

!!! warning "Миграция"
    `GET /api/integrations/Bids/GetCurrentList` удалён. Не заменяйте его вызовом
    `GetList` вслепую: новый метод также возвращает заявки, созданные партнёром, а без
    `X-Organization-Id` охватывает все доступные организации.

## Источник и внешний идентификатор

| `isCreatedByPlatform` | Источник | Значение `externalId` |
|---:|---|---|
| `true` | Заявку создал текущий партнёр | `bid.externalId`, переданный в `Apply` или `Write` |
| `false` | Перевозчик транслирует заявку платформе | `ExternalPlatformOrderId`, указанный перевозчиком |

Всегда сохраняйте внутренний `id` CARGO.RUN. `externalId` имеет разную семантику в
зависимости от источника и не заменяет внутренний ID.

## Пример ответа

```json
[
  {
    "id": 12345,
    "externalId": "ORDER-2471970",
    "isCreatedByPlatform": false,
    "status": "Started",
    "isDeleted": false,
    "createdAt": "2026-10-06T10:00:00+03:00",
    "updatedAt": "2026-10-07T11:00:00+03:00",
    "points": [
      {
        "id": 501,
        "order": 0,
        "externalId": "POINT-LOAD-1",
        "type": "LoadPoint",
        "planEnterDate": "2026-10-07T12:00:00+03:00",
        "estimatedEnterDate": "2026-10-07T12:25:00+03:00",
        "loadUnloadStatus": "AtLoading",
        "enteredAt": "2026-10-07T12:18:00+03:00",
        "loadUnloadedAt": null,
        "documentsReceivedAt": null
      }
    ],
    "events": [
      {
        "type": "EnteredPointByDriver",
        "fixedAt": "2026-10-07T12:18:00+03:00",
        "bidPointId": 501,
        "bidPointOrder": 0,
        "bidPointExternalId": "POINT-LOAD-1"
      }
    ]
  }
]
```

## Точки, события и часовые пояса

- `points` содержит несервисные точки в порядке следования;
- все даты в `points` возвращаются в часовом поясе соответствующей точки;
- события самой заявки возвращаются в часовом поясе организации;
- события точки возвращаются в часовом поясе точки;
- `events` внутри `GetList` содержит события несервисных точек;
- отдельный `Bids/GetEvents` дополнительно возвращает события сервисных точек, если
  у них есть фактические даты;
- `events` вычисляется после основной выборки и не участвует в `$filter` и `$orderby`.

`estimatedEnterDate` пересчитывается без изменения заявки и не сдвигает `updatedAt`.
Поэтому курсорная выборка по `updatedAt` не гарантирует получение каждого изменения
ETA. Если актуальная ETA нужна в интерфейсе, периодически перечитывайте интересующие
заявки по ID или запрашивайте подходящее текущее окно.

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
`ReadQuery` эквивалентен `GetList` без `X-Organization-Id` и охватывает все доступные
организации. Поля `id`, `version` и `key` в объекте команды должны отсутствовать, а
`query` должен быть непустым.

## Первичная загрузка и пагинация

Без непустого `$filter` сервер возвращает заявки, изменённые за последние 30 дней.
Любой непустой `$filter`, даже не связанный с `updatedAt`, отменяет это окно.

1. Выберите начальное значение `updatedAt`.
2. Запрашивайте данные с `$orderby=updatedAt,id`.
3. Используйте `$top` и `$skip` либо собственный курсор.
4. Сохраняйте последний успешно обработанный `(updatedAt,id)`.
5. Следующий интервал начинайте на несколько секунд раньше.
6. Удаляйте дубли по `id`.
7. Разделяйте источники по `isCreatedByPlatform`, если для них нужны разные процессы.
