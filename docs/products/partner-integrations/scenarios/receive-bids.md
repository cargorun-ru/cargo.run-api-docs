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

## Источник и идентификаторы

| `isCreatedByPlatform` | Источник | Сопоставление |
|---:|---|---|
| `true` | Заявку создал текущий партнёр | `externalId` содержит `bid.externalId`, а `externalPlatformOrderId` — переданный идентификатор заказа платформы, если он был указан |
| `false` | Перевозчик транслирует заявку платформе | `externalPlatformOrderId` содержит строковый ID заказа, указанный перевозчиком |

Всегда сохраняйте внутренний `id` CARGO.RUN и используйте его в последующих
вызовах чтения. `externalId` не гарантируется уникальным и не заменяет внутренний
ID. Для транслируемой заявки сопоставляйте заказ партнёра по
`externalPlatformOrderId`, а не по `externalId`.

`Bids/Apply` и асинхронный `Write` принимают `bid.externalPlatformOrderId`. Если у
интеграционного клиента настроена платформа, CARGO.RUN связывает заявку с этим
заказом и возвращает идентификатор в `GetList`. Для заявки, созданной перевозчиком
в CARGO.RUN, поле заполняется, когда перевозчик связывает заявку с заказом
партнёрской платформы.

## Пример ответа

```json
[
  {
    "id": 12345,
    "externalId": null,
    "externalPlatformOrderId": "2471970",
    "isCreatedByPlatform": false,
    "organizationInn": "7701234567",
    "status": "Started",
    "isDeleted": false,
    "createdAt": "2026-10-06T10:00:00+03:00",
    "updatedAt": "2026-10-07T11:00:00+03:00",
    "estimatedBidPointId": 501,
    "estimatedEnterDate": "2026-10-07T12:25:00+03:00",
    "estimatedDuration": "0.01:25:00",
    "temperatureRegime": {
      "temperatureMinimum": 2,
      "temperatureMaximum": 6
    },
    "counterparty": {
      "name": "ООО Ромашка",
      "inn": "7701234567"
    },
    "vehicleType": {
      "name": "Рефрижератор",
      "tonnage": 20,
      "volume": 82
    },
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

- `points` содержит точки в порядке следования, кроме начальных и сервисных;
- `points[].externalId` всегда имеет тип `string`; числовой ID партнёра возвращается
  строкой;
- `events[].bidPointExternalId` имеет тип `string` и совпадает с внешним
  идентификатором соответствующей точки;
- для транслируемой заявки, созданной в CARGO.RUN, в `points[].type` может
  встретиться `CustomPoint`; во входном `Bids/Apply` такой тип запрещён;
- все даты в `points` возвращаются в часовом поясе соответствующей точки;
- события самой заявки возвращаются в часовом поясе организации;
- события точки возвращаются в часовом поясе точки;
- `events` внутри `GetList` содержит события несервисных точек;
- отдельный `Bids/GetEvents` также не возвращает события сервисных точек;
- `events` вычисляется после основной выборки и не участвует в `$filter` и `$orderby`.

`counterparty`, `temperatureRegime` и `vehicleType` входят в модель `GetList` и
возвращаются независимо от того, использует ли их конкретный партнёр. Параметра,
гарантированно исключающего их из ответа, нет; неиспользуемые поля следует
игнорировать.

В списочной модели `updatedAt` равен более позднему из времени изменения заявки и
времени изменения ETA. Пересчёт `estimatedEnterDate` поэтому сдвигает курсор
`GetList` и `ReadQuery`. Это значение может отличаться от `updatedAt` детальной
модели заявки.

Поля `estimatedBidPointId`, `estimatedEnterDate` и `estimatedDuration` на уровне
заявки описывают ETA ближайшей непосещённой точки. `estimatedDuration` содержит
оставшееся время на момент ответа в формате `d.hh:mm:ss`; прошедшее ETA даёт
нулевую длительность. `points[].estimatedEnterDate` содержит ETA отдельных точек.

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

Значение `$top` не должно превышать `1000`.
