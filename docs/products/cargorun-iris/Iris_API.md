# Iris API

## Что такое Iris

Iris — это асинхронный API для обмена данными между внешней системой и CARGORUN.

Через Iris внешняя система может:

- отправлять команды на создание, обновление и удаление объектов
- читать изменившиеся данные со стороны CARGORUN
- выполнять выборочные чтения по query
- получать результат обработки через polling или webhook

Iris работает в контексте конкретной организации и конкретного внутреннего пользователя. Для внешних M2M интеграций подставляется автоматически через `technical user`.

## Базовые принципы

Iris работает как очередь задач:

1. клиент отправляет одну или несколько команд
2. сервер создает отдельные задачи
3. сервер отдает ответ 202 сразу и клиент получает `taskId`
4. сервер обрабатывает задачи асинхронно
5. клиент забирает результат либо через polling, либо через webhook

У одной команды может быть несколько задач, если в запросе передано несколько элементов в `commands`.

## Авторизация и контекст организации

Для вызова Iris используется обычная JWT авторизация по пользователю, либо m2m авторизация, описанная в [external-integration-auth.md](./docs/external-integration-auth.md:1).

Для org-scoped вызовов Iris обязательно:

- `Authorization: Bearer <access_token>`
- Для М2М: `X-Organization-Id: <organizationId>`

## Основные маршруты

Iris доступен по двум одинаковым префиксам:

- `POST /api/iris/queue`
- `GET /api/iris/queue?id=<taskId>`

Также доступны алиасы:

- `POST /api/tasks/queue`
- `GET /api/tasks/queue?id=<taskId>`


## Схема работы

```text
Внешняя система
    |
    | POST /api/iris/queue
    v
Cargorun Iris
    |
    | создает taskId
    | запускает обработку
    v
Внутренний обработчик
    |
    | формирует результат
    v
Iris task result
    | \
    |  \__ GET /api/iris/queue?id=...
    |
    \____ webhook callback, если настроен
```

## Жизненный цикл задачи

### 1. Создание

Клиент отправляет `QueuedApiTaskCommandsCollectionModel` (см. Scalar/openapi json).

На каждый элемент `commands[]` сервер создает отдельную Iris-задачу.

### 2. Выполнение

Задача получает один из статусов:

- `Awaiting`: создана, ожидает выполнения
- `InProgress`: выполняется
- `Completed`: завершена
- `Error`: завершилась с ошибкой

### 3. Получение результата

Результат можно получить:

- опросом через `GET /api/iris/queue?id=<taskId>`
- webhook-уведомлением, если он настроен в `SyncSystem`

## Откуда берутся изменения для чтения

Когда в системе изменяется сущность, CARGORUN публикует это изменение во внутреннюю таблицу pending-изменений.

Изменение сохраняется:

- отдельно для каждого sync user
- только для тех sync users, у которых есть подходящий `SyncSystem`
- кроме того sync user, который сам сделал изменение

То есть Iris читает не "все изменения в системе вообще", а только pending-изменения для конкретного sync user.

## Режимы SyncSystem

У каждого sync user есть `SyncSystem.Behavior`. Для Iris это влияет на чтение изменений.

### `Read`

Поведение по умолчанию.

Смысл:

- клиент читает изменения
- после успешного `Read` эти pending-изменения считаются прочитанными
- отдельное подтверждение не требуется

### `ReadConfirmation`

Режим чтения с подтверждением.

Смысл:

- клиент читает изменения
- после чтения pending-изменения не удаляются
- затем клиент должен отдельно подтвердить, что он действительно обработал эти версии

Подтверждение выполняется действием `ReadConfirmation`.

## Когда использовать `Read`, а когда `ReadConfirmation`

`Read` подходит, если:

- достаточно факта успешного ответа от API
- внешний клиент не требует отдельного ack-цикла

`ReadConfirmation` подходит, если:

- внешний клиент хочет явно подтверждать обработку данных
- важно не потерять изменение между моментом чтения и моментом фактической записи во внешнюю систему

## Действия Iris

Iris поддерживает пять действий:

- `Write`
- `Read`
- `ReadConfirmation`
- `ReadQuery`
- `Delete`

## Формат запроса на постановку задач

### Общая форма

```json
{
  "commands": [
    {
      "action": "Write",
      "objects": []
    }
  ]
}
```

Ответ:

```json
{
  "latencyMsec": 120,
  "enqueuedInMsec": 15,
  "commands": [
    {
      "id": 123456,
      "action": "Write",
      "status": "Success",
      "readyInMsec": 120
    }
  ]
}
```

Если конкретная задача не была поставлена в очередь, у нее будет:

- `status = Failed`
- `id = null`

## `Write`

`Write` используется для создания или обновления объектов во внутренней системе.

Объекты передаются в `objects[]`, где:

- `type` — тип сущности
- `modelType` — тип модели
- `body` — данные объекта
- `id` — внутренний id, если обновляется существующая запись
- `version` — версия объекта, если нужен optimistic concurrency control
- `key` — внешний ключ объекта

Общий смысл:

- если `id` не передан, обычно создается новый объект
- если `id` передан, обычно обновляется существующий объект
- конкретная логика зависит от обработчика соответствующей сущности

## `Read`

`Read` используется для чтения изменений.

Есть три основных режима.

### Вариант 1. Прочитать все pending-изменения

Передается `action = Read` и пустой список `objects`.

Пример:

```json
{
  "commands": [
    {
      "action": "Read",
      "objects": []
    }
  ]
}
```

В этом случае Iris вернет все pending-изменения для текущего sync user.

### Вариант 2. Прочитать все pending-изменения только по определенным типам

Передаются объекты без `id`, но с `type`.

Пример:

```json
{
  "commands": [
    {
      "action": "Read",
      "objects": [
        {
          "type": "Driver"
        },
        {
          "type": "Car"
        }
      ]
    }
  ]
}
```

В этом случае Iris:

- берет все pending-изменения только по типам `Driver` и `Car`
- формирует по ним результирующие объекты

### Вариант 3. Прочитать конкретный объект

Передается объект с `id`.

Пример:

```json
{
  "commands": [
    {
      "action": "Read",
      "objects": [
        {
          "type": "Driver",
          "id": 100500
        }
      ]
    }
  ]
}
```

Такой сценарий читает сам объект, а не список pending-изменений по типу.

## `ReadConfirmation`

`ReadConfirmation` доступен только если для текущего sync user в `SyncSystem` установлен `Behavior = ReadConfirmation`.

Смысл действия:

- клиент подтверждает, что ранее прочитанная версия объекта действительно обработана

Пример:

```json
{
  "commands": [
    {
      "action": "ReadConfirmation",
      "objects": [
        {
          "type": "Driver",
          "id": 100500,
          "version": "11111111-2222-3333-4444-555555555555"
        }
      ]
    }
  ]
}
```

Как это работает:

1. сервер находит pending-версию для текущего sync user, `entityId` и `type`
2. сравнивает переданную `version` с текущей pending-версией
3. если версия совпала, подтверждение успешно и pending-запись удаляется
4. если версия не совпала, возвращается `VersionMismatch`, а в ответе отдается актуальная версия

## Важно

Для `ReadConfirmation` нужно передавать корректную версию, полученную из предыдущего `Read`.

## `ReadQuery`

`ReadQuery` используется для выборочного чтения по query, а не по pending-изменениям.

Особенности:

- это не "забрать изменения", а "выполнить запрос"
- `id`, `version` и `key` должны быть пустыми
- `query` должен быть заполнен
- по одному `type` можно передать только один объект в рамках одной команды

Пример:

```json
{
  "commands": [
    {
      "action": "ReadQuery",
      "objects": [
        {
          "type": "Driver",
          "query": "$filter=isDeleted eq false&$top=100"
        }
      ]
    }
  ]
}
```

## `Delete`

`Delete` используется для удаления объектов.

Для `Delete` обязательно передавать `id`.

Пример:

```json
{
  "commands": [
    {
      "action": "Delete",
      "objects": [
        {
          "type": "Driver",
          "id": 100500
        }
      ]
    }
  ]
}
```

## Получение результата задачи

### Endpoint

`GET /api/iris/queue?id=<taskId>`

### Ответ

Пример:

```json
{
  "message": null,
  "status": "Completed",
  "readyInMsec": 100,
  "remainingObjectCount": 0,
  "attemptCount": 1,
  "maxAttemptCount": 3,
  "nextRetryAt": null,
  "callbackStatus": "Delivered",
  "callbackAttemptCount": 1,
  "callbackMaxAttemptCount": 3,
  "callbackNextRetryAt": null,
  "callbackDeliveredAt": "2026-06-29T10:00:00Z",
  "lastError": null,
  "objects": [
    {
      "key": "ext-driver-1",
      "type": "Driver",
      "sourceType": null,
      "id": 100500,
      "version": "11111111-2222-3333-4444-555555555555",
      "body": {},
      "message": null,
      "status": "Success"
    }
  ]
}
```

Если задача еще выполняется, сервер добавляет HTTP-заголовок:

`Retry-After: <seconds>`

Его можно использовать как минимальную паузу до следующего poll-запроса.

## Статусы объектов в результате

- `Created`: промежуточный статус, результат создан, но еще не завершен
- `Success`: объект обработан успешно
- `Error`: объект завершился ошибкой
- `VersionMismatch`: подтверждение чтения не прошло, потому что версия уже изменилась

## Polling-сценарий

Рекомендуемый цикл:

```text
1. POST /api/iris/queue
2. Получить taskId
3. Подождать примерно readyInMsec или Retry-After
4. GET /api/iris/queue?id=taskId
5. Повторять, пока status не станет Completed или Error
```

## Webhook

Iris может отправлять webhook после завершения задачи.

Webhook берется из `SyncSystem.Callback` текущего sync user в момент создания задачи.

Это означает:

- если у sync user не настроен callback URL, webhook не будет
- если callback потом изменить, уже созданные задачи используют старый snapshot настроек

## Когда webhook отправляется

Webhook ставится в очередь доставки, когда задача переходит в `Completed` или `Error`, и для нее есть callback URL.

### Важно

Webhook не отправляется "на каждый изменившийся объект". Он отправляется на завершенную Iris-задачу.

## Формат webhook-запроса

Метод:

`POST <callback-url>`

`Content-Type: application/json`

Заголовки:

- `X-Cargorun-Task-Id`: строковый `taskId`
- `X-Cargorun-Webhook-Event`: `queued-task.finished`
- `X-Cargorun-Webhook-Timestamp`: Unix timestamp в секундах
- `X-Cargorun-Webhook-Signature`: `sha256=<hex>` — только если настроен секрет

Подпись считается так:

```text
HMAC_SHA256(secret, "<timestamp>.<raw_json_body>")
```

Тело webhook содержит:

- `eventId`
- `taskId`
- `action`
- `status`
- `completedAt`
- `attemptCount`
- `maxAttemptCount`
- `message`
- `objects`

Пример:

```json
{
  "eventId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "taskId": 123456,
  "action": "Read",
  "status": "Completed",
  "completedAt": "2026-06-29T10:00:00Z",
  "attemptCount": 1,
  "maxAttemptCount": 3,
  "message": null,
  "objects": [
    {
      "key": "ext-driver-1",
      "type": "Driver",
      "sourceType": null,
      "id": 100500,
      "version": "11111111-2222-3333-4444-555555555555",
      "body": {},
      "message": null,
      "status": "Success"
    }
  ]
}
```

## Поведение webhook-доставки

Если callback возвращает успешный HTTP-статус, доставка считается успешной.

Если callback возвращает:

- `408`
- `429`
- любой `5xx`
- сетевую ошибку

такая ошибка считается retryable, и Iris попытается повторить доставку.

Статус webhook-доставки можно видеть в результате задачи:

- `None`
- `Awaiting`
- `InProgress`
- `Delivered`
- `Error`

## Схема webhook

```text
Iris task
    |
    | завершилась
    v
Webhook delivery queue
    |
    | POST callback URL
    v
Система клиента
    |
    | 2xx -> Delivered
    | error/timeout -> retry or Error
```

## Связь между чтением изменений и webhook

Есть два независимых механизма:

1. `Read` / `ReadConfirmation` — клиент сам забирает изменени�� из Iris
2. webhook — клиент получает уведомление, что конкретная Iris-задача завершилась

Webhook не заменяет `ReadConfirmation`.

Если у sync user стоит `Behavior = ReadConfirmation`, то:

- сначала клиент делает `Read`
- затем получает данные
- затем, когда внешняя система их реально обработала, отправляет `ReadConfirmation`

Webhook в этом сценарии только сообщает о завершении самой Iris-зачи, но не является подтверждением прочтения изменений.

## Практические сценарии

### Сценарий 1. Забор всех новых изменений

```text
1. POST /api/iris/queue с action=Read и пустым objects
2. Получить taskId
3. Дождаться Completed
4. Забрать objects из результата
5. Если режим ReadConfirmation не используется, изменения автоматически считаются прочитанными
```

### Сценарий 2. Забор изменений с явным подтверждением

```text
1. POST /api/iris/queue с action=Read
2. Получить версии объектов
3. Обработать данные во внешней системе
4. POST /api/iris/queue с action=ReadConfirmation
5. Передать id + type + version для подтверждения
```

### Сценарий 3. Асинхронная запись объекта

```text
1. POST /api/iris/queue с action=Write
2. Получить taskId
3. Polling или webhook
4. На Completed проверить objects[].status и objects[].message
```

## Типовые ошибки

### `400 Bad Request`

Обычно означает:

- невалидный body
- для `Delete` не передан `id`
- для `ReadQuery` переданы `id`, `version` или `key`
- для `ReadQuery` не передан `query`
- для `ReadConfirmation` передан недопустимый набор полей
- комбинация `action/type/modelType/sourceType` не поддерживается

### `401 Unauthorized`

Обычно означает:

- невалидный bearer token
- не передан `X-Organization-Id`
- integration client не имеет доступа к организации

### `404` или пустой результат при чтении статуса

Обычно означает:

- указан неверный `taskId`
- задача принадлежит другой организации

## Рекомендации клиенту

1. В случае с M2M авторизацией, всегда передавать `X-Organization-Id` для Iris.
2. Для интеграций с подтверждением доставки данных использовать `ReadConfirmation`.
3. Для webhook проверять HMAC-подпись, если настроен секрет.
4. Сохранять `taskId`, `id`, `type` и `version` из результатов чтения.
5. Обрабатывать `VersionMismatch` как сигнал, что объект уже изменился и нужно брать новую версию.
6. Не считать webhook подтверждением чтения в сценарии `ReadConfirmation`.
