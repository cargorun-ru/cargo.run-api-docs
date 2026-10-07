# Асинхронная очередь

Асинхронная очередь позволяет создать одну или несколько фоновых задач и получить результат позднее. Для партнёрских сервисов доступны только заявки типа `Bid`.

## Методы

- [`POST /api/integrations/Tasks/Queue`](reference/endpoints.md#post-apiintegrationstasksqueue) — поставить команды в очередь;
- [`GET /api/integrations/Tasks/Queue`](reference/endpoints.md#get-apiintegrationstasksqueue) — получить состояние и результат задачи;
- [`POST /api/integrations/Tasks/Ping`](reference/endpoints.md#post-apiintegrationstasksping) — проверить доставку webhook на настроенный `callbackTarget`.

```http
POST <baseUrl>/api/integrations/Tasks/Queue
GET  <baseUrl>/api/integrations/Tasks/Queue?id={taskId}
POST <baseUrl>/api/integrations/Tasks/Ping
```

`X-Organization-Id` не требуется.

## Поддерживаемые комбинации

| `action` | `type` | `modelType` | Назначение | Результат `body` |
|---|---|---|---|---|
| `Write` | `Bid` | `Default` | Создать или обновить заявку | `body` не возвращается; ID находится в `objects[].id` |
| `Read` | `Bid` | `Default` | Получить полные данные заявки | `IntegrationBidDetailsModel` |
| `Read` | `Bid` | `Summary` | Получить краткие данные заявки | `IntegrationBidListModel` |
| `ReadQuery` | `Bid` | `Default` | Получить список связанных заявок | `IntegrationBidListModel[]` |

`Delete` и `ReadConfirmation` для партнёрских сервисов не поддерживаются.

## Постановка задачи

```http
POST <baseUrl>/api/integrations/Tasks/Queue
Authorization: Bearer <accessToken.token>
Content-Type: application/json
Idempotency-Key: read-bid-12345-v1
```

```json
{
  "commands": [
    {
      "action": "Read",
      "objects": [
        {
          "type": "Bid",
          "modelType": "Default",
          "id": 12345
        }
      ]
    }
  ]
}
```

На каждый элемент `commands[]` создаётся отдельная задача. Ответ постановки содержит массив `commands` с `id`, `action`, `status` и ориентировочным `readyInMsec`.

## Жизненный цикл

```text
Awaiting → InProgress → Completed
                    ↘ Error
```

Статус `Completed` означает завершение задачи, но не гарантирует успех каждого объекта. Всегда проверяйте `objects[].status`.

## Получение результата

```http
GET <baseUrl>/api/integrations/Tasks/Queue?id={taskId}
Authorization: Bearer <accessToken.token>
```

Пока задача выполняется, используйте `Retry-After` или `readyInMsec` как минимальную паузу до следующего запроса.

Результат также может быть доставлен webhook `queued-task.finished`, если настроен callback.

## Два уровня ошибок

```json
{
  "status": "Completed",
  "objects": [
    {
      "type": "Bid",
      "id": 12345,
      "status": "Error",
      "message": "Bid is not found or is not available for the client.",
      "body": null
    }
  ]
}
```

HTTP-запрос и задача могут завершиться успешно, а отдельный объект — ошибкой.

## Идемпотентность

`Idempotency-Key` необязателен, но рекомендуется для повторяемых запросов.

- максимальная длина — 100 символов;
- срок действия — 24 часа;
- область уникальности — текущий `clientId`;
- для нескольких команд сервер добавляет к ключу индекс команды;
- повтор возвращает прежний `taskId`;
- тело повторного запроса не сравнивается с первоначальным.

Не используйте один ключ для разных логических операций.
