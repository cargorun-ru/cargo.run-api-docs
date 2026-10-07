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

## Тело

```json
{
  "eventId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "taskId": 123456,
  "action": "Read",
  "status": "Completed",
  "origin": "Subscription",
  "completedAt": "2026-10-07T10:00:00Z",
  "attemptCount": 1,
  "maxAttemptCount": 3,
  "message": null,
  "objects": []
}
```

`eventId` используется для дедупликации повторных доставок.

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

По умолчанию выполняется до пяти попыток доставки с увеличивающимися интервалами. После серии неудач подписка временно приостанавливается, а часть изменений может быть отброшена. Поэтому webhook необходимо дополнять контрольным `ReadQuery`.
