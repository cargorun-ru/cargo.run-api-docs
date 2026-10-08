# Webhook и подписки

Webhook отправляется методом `POST` на `callbackTarget` — HTTPS-адрес обработчика на стороне партнёрского сервиса. Партнёр передаёт этот адрес CARGO.RUN при подключении интеграции вместе с `callbackSecret`; CARGO.RUN сохраняет его в настройках интеграционного клиента.

Например:

```text
https://partner.example.com/webhooks/cargorun
```

Все webhook этого интеграционного клиента (`queued-task.finished`, `entity.changed` и `ping`) поступают на один настроенный адрес. Тип события определяется по заголовку `X-Cargorun-Webhook-Event`. Получатель должен вернуть любой HTTP-код `2xx`.

Проверить доставку на настроенный адрес можно методом [`POST /api/integrations/Tasks/Ping`](reference/endpoints.md#post-apiintegrationstasksping).

## Типы webhook

Значение передаётся в `X-Cargorun-Webhook-Event`:

| Значение | Смысл |
|---|---|
| `queued-task.finished` | Завершилась задача, поставленная партнёром |
| `entity.changed` | Изменилась заявка, связанная с партнёром |
| `ping` | Тест callback |

## Заголовки

| Заголовок | Описание |
|---|---|
| `X-Cargorun-Webhook-Event` | Тип webhook |
| `X-Cargorun-Task-Id` | ID задачи; для `ping` — `0` |
| `X-Cargorun-Webhook-Timestamp` | Unix timestamp в секундах |
| `X-Cargorun-Webhook-Signature` | `sha256=<hex>`, если настроен `callbackSecret` |

## Подпись

```text
HMAC_SHA256(callbackSecret, "<timestamp>.<raw-json-body>")
```

Проверяйте подпись по исходным байтам тела до десериализации. Рекомендуется также проверять допустимое расхождение времени и использовать постоянное по времени сравнение подписей.

## Модель тела

События `queued-task.finished` и `entity.changed` используют модель [`QueuedApiTaskCallbackPayload`](reference/endpoints.md#queuedapitaskcallbackpayload). Поле `origin` определяет источник задачи:

| Событие | `origin` | Назначение |
|---|---|---|
| `queued-task.finished` | `Request` | Результат команды, которую партнёр поставил через `POST /Tasks/Queue` |
| `entity.changed` | `Subscription` | Данные заявки, задачу чтения которой CARGO.RUN создал по подписке |

### `queued-task.finished`

```json
{
  "eventId": "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
  "taskId": 123456,
  "action": "Read",
  "status": "Completed",
  "origin": "Request",
  "completedAt": "2026-10-07T10:00:00Z",
  "attemptCount": 1,
  "maxAttemptCount": 3,
  "message": null,
  "objects": [
    {
      "status": "Success",
      "type": "Bid",
      "id": 12345,
      "key": null,
      "version": null,
      "query": null,
      "body": {
        "externalId": "ORDER-2471970",
        "bid": {
          "id": 12345,
          "status": "Started"
        }
      },
      "message": null
    }
  ]
}
```

Состав `objects[].body` определяется исходной командой: для `Read / Bid / Default` это `IntegrationBidDetailsModel`, для `Read / Bid / Summary` — `IntegrationBidListModel`.

### `entity.changed`

```json
{
  "eventId": "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
  "taskId": 123457,
  "action": "Read",
  "status": "Completed",
  "origin": "Subscription",
  "completedAt": "2026-10-07T10:05:00Z",
  "attemptCount": 1,
  "maxAttemptCount": 3,
  "message": null,
  "objects": [
    {
      "status": "Success",
      "type": "Bid",
      "id": 12345,
      "key": null,
      "version": null,
      "query": null,
      "body": {
        "id": 12345,
        "externalId": "ORDER-2471970",
        "status": "Canceled",
        "isDeleted": false,
        "createdAt": "2026-10-06T10:00:00+03:00",
        "updatedAt": "2026-10-07T13:05:00+03:00"
      },
      "message": null
    }
  ]
}
```

В примере подписка настроена с `modelType=Summary`, поэтому `objects[].body` имеет модель `IntegrationBidListModel`. При `modelType=Default` в `body` приходит `IntegrationBidDetailsModel`.

`eventId` уникален для доставки и используется для дедупликации повторных webhook. `taskId` позволяет повторно получить тот же результат методом `GET /api/integrations/Tasks/Queue?id={taskId}`.

`attemptCount` и `maxAttemptCount` относятся к обработке асинхронной задачи CARGO.RUN. Это не счётчики доставки webhook. Состояние доставки доступно при чтении задачи в полях `callbackStatus`, `callbackAttemptCount`, `callbackMaxAttemptCount`, `callbackNextRetryAt`, `callbackDeliveredAt` и `lastError`.

### `ping`

`ping` — тест доставки на тот же `callbackTarget`. Не используйте его тело как бизнес-событие и не сохраняйте как изменение заявки. Получатель проверяет timestamp и подпись так же, как для остальных webhook, после чего возвращает `2xx`.

## Подписка на заявки

CARGO.RUN настраивает подписку:

```json
[
  {
    "entityType": "Bid",
    "modelType": "Summary"
  }
]
```

Для партнёрских сервисов поддерживается только `Bid`.

`entityType` определяет тип сущности подписки; в текущем партнёрском контракте единственное поддерживаемое значение — строка `Bid`. `modelType` определяет форму `objects[].body`: `Summary` или `Default`.

### `Summary`

В `objects[].body` передаётся `IntegrationBidListModel`. Это рекомендуемый режим: партнёр получает ID и основные данные, затем выполняет `Read / Bid / Default`.

### `Default`

В `objects[].body` передаётся полный `IntegrationBidDetailsModel`. Ответ значительно больше; фактический маршрут всё равно не включается.

## Какие изменения публикуются

Реализация отправляет изменение при создании и редактировании заявки, смене статуса, возврате в работу, изменении автомобиля/водителя/прицепа, действиях водителя на точках, подтверждении получения документов и удалении заявки.

Обычное новое сообщение или файл в чате само по себе не гарантирует `entity.changed`. Для получения сообщений используйте чтение полной заявки или [`GET /api/integrations/Bids/GetDriverMessages`](reference/endpoints.md#get-apiintegrationsbidsgetdrivermessages).

## Порядок обработки

1. Проверить timestamp и HMAC.
2. Проверить, не обработан ли `eventId`.
3. Надёжно сохранить событие во внутреннюю очередь партнёра.
4. Вернуть `2xx`.
5. Обработать `objects[]` и при необходимости запросить полную заявку.

Порядок webhook не гарантируется. Несколько изменений одной заявки могут объединиться в одно событие. Не заменяйте более новые данные старыми — сравнивайте `updatedAt`.

## Повторная доставка

Повторяются сетевые ошибки, `408`, `429` и `5xx`. Остальные `4xx` считаются окончательными.

Выполняется до пяти попыток доставки. Перед повторными отправками используются интервалы 10, 20, 40 и 80 секунд.

После пяти последовательных неудачных доставок уведомлений по подписке доставка приостанавливается. Во время приостановки CARGO.RUN выполняет проверочную доставку каждые 5 минут. Любая успешная доставка или успешный вызов [`Tasks/Ping`](reference/endpoints.md#post-apiintegrationstasksping) сбрасывает счётчик ошибок и возобновляет доставку.

Отдельного публичного поля, показывающего приостановку подписки, нет. Пока доставка приостановлена, часть изменений может быть отброшена, поэтому webhook необходимо дополнять периодическим `ReadQuery` по `updatedAt`.
