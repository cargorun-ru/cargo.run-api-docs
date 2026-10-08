# Методы API, модели и значения

Во всех путях `<baseUrl>` — адрес API CARGO.RUN. Адреса тестовой и промышленной сред запрашиваются у команды CARGO.RUN при подключении. Все методы, кроме `Account/Token`, требуют `Authorization: Bearer <token>`.

## Сводная таблица

| Метод | Назначение |
|---|---|
| `POST /api/Account/Token` | Получить M2M-токен |
| `GET /api/integrations/Organizations/Check` | Проверить организацию по ИНН |
| `POST /api/integrations/Organizations/Apply` | Создать организацию или получить доступ |
| `POST /api/integrations/Bids/Apply` | Создать или обновить заявку |
| `GET /api/integrations/Bids/GetList` | Получить заявки, созданные текущим партнёром |
| `GET /api/integrations/Bids/GetCurrentList` | Получить заявки, связанные с платформой партнёра |
| `GET /api/integrations/Bids/Get` | Получить карточку заявки |
| `GET /api/integrations/Bids/GetEvents` | Получить события заявки |
| `GET /api/integrations/Bids/GetPlannedRoute` | Получить плановый маршрут |
| `GET /api/integrations/Bids/GetActualRoute` | Получить фактический маршрут |
| `GET /api/integrations/Bids/GetDriverMessages` | Получить сообщения и файлы водителя |
| `POST /api/integrations/Tasks/Queue` | Поставить команды в очередь |
| `GET /api/integrations/Tasks/Queue` | Получить результат задачи |
| `POST /api/integrations/Tasks/Ping` | Проверить callback |

## `POST /api/Account/Token`

Получает токен по `client_credentials`. Авторизация не требуется.

Тело: [`ClientCredentialsTokenModel`](#clientcredentialstokenmodel). Ответ: [`ClientCredentialsTokenResponse`](#clientcredentialstokenresponse).

```json
{
  "grantType": "client_credentials",
  "clientId": "partner-client-id",
  "clientSecret": "partner-client-secret"
}
```

Успех: `200 OK`. Используйте `accessToken.token` и `accessToken.expiresIn`. Не вызывайте метод чаще двух раз за 30 секунд.

## `GET /api/integrations/Organizations/Check`

| Параметр | Где | Тип | Обязательно | Описание |
|---|---|---|---:|---|
| `inn` | query | string | Да | ИНН организации |

Успех: `200 OK`, модель [`IntegrationOrganizationCheckModel`](#integrationorganizationcheckmodel).

## `POST /api/integrations/Organizations/Apply`

Тело: [`CreateIntegrationOrganizationContext`](#createintegrationorganizationcontext).

Поиск выполняется по ИНН. Без ИНН используется служебная организация. Успех: `200 OK`, модель [`OrganizationApplyResult`](#organizationapplyresult).

## `POST /api/integrations/Bids/Apply`

Тело: [`ApplyBidFromIntegrationContext`](#applybidfromintegrationcontext). Результат: [`ApplyBidResultModel`](#applybidresultmodel).

Создаёт или полностью обновляет заявку, создаёт недостающие транспорт и водителей и запускает заявку в работу.

Успех: `200 OK`:

```json
{
  "id": 12345,
  "isRouteBuilt": true
}
```

При нарушении валидации возвращается `400 Bad Request` с текстовым сообщением.

## `GET /api/integrations/Bids/GetList`

Возвращает [`IntegrationBidListModel[]`](#integrationbidlistmodel) — заявки, созданные текущим партнёром и имеющие его `externalId`.

Поддерживает OData-параметры и заголовок `X-MetaCount`.

## `GET /api/integrations/Bids/GetCurrentList`

Возвращает [`IntegrationBidListModel[]`](#integrationbidlistmodel) — заявки, которые перевозчики связали с платформой текущего интеграционного клиента. В `externalId` возвращается ID заказа партнёра.

Поддерживает OData-параметры и `X-MetaCount`.

## `GET /api/integrations/Bids/Get`

| Параметр | Где | Тип | Обязательно | Описание |
|---|---|---|---:|---|
| `id` | query | int64 | Да | ID заявки CARGO.RUN |

Успех: `200 OK`, модель [`BidForExternalSyncModel`](#bidforexternalsyncmodel).

## `GET /api/integrations/Bids/GetEvents`

Параметр `id` — обязательный ID заявки CARGO.RUN. Успех: [`IntegrationBidEventModel[]`](#integrationbideventmodel). Значения `type`: [`IntegrationBidEventType`](#integrationbideventtype).

## `GET /api/integrations/Bids/GetPlannedRoute`

Параметр `id` — обязательный ID заявки. Успех: [`RouteSimpleModel`](#routesimplemodel). Модель содержит расчётные показатели; геометрия планового маршрута в базовом синхронном ответе не используется партнёрским сценарием.

## `GET /api/integrations/Bids/GetActualRoute`

| Параметр | Тип | Обязательно | По умолчанию | Описание |
|---|---|---:|---:|---|
| `id` | int64 | Да | — | ID заявки CARGO.RUN |
| `coordinateIntervalSeconds` | int32 | Нет | `60` | Минимальный интервал между координатами; `0` отключает прореживание |

Успех: [`CarRouteForExternalModel[]`](#carrouteforexternalmodel).

## `GET /api/integrations/Bids/GetDriverMessages`

Параметр `id` — обязательный ID заявки. Возвращает [`ChatMessageGetModel[]`](#chatmessagegetmodel), поддерживает OData и `X-MetaCount`.

Ссылки `files[].accessUrlLink` временные; не храните их как постоянные.

## `POST /api/integrations/Tasks/Queue`

Тело: [`QueuedApiTaskCommandsCollectionModel`](#queuedapitaskcommandscollectionmodel). Ответ: [`EnqueueApiTasksResponseModel`](#enqueueapitasksresponsemodel).

Необязательный заголовок:

| Заголовок | Ограничение | Назначение |
|---|---|---|
| `Idempotency-Key` | До 100 символов | Возвращает те же задачи при повторе в течение 24 часов |

Поддерживаются только комбинации `Write/Read/ReadQuery` для `Bid`, перечисленные в разделе [Асинхронная очередь](../async-queue.md).

Успешная постановка возвращает сведения о созданных задачах и их `id`. Для каждой команды может быть `status="Success"` или `status="Failed"`.

## `GET /api/integrations/Tasks/Queue`

| Параметр | Тип | Обязательно | Описание |
|---|---|---:|---|
| `id` | int64 | Да | ID задачи текущего интеграционного клиента |

Успех: [`QueuedApiTaskGetResultsModel`](#queuedapitaskgetresultsmodel). Пока задача выполняется, ответ содержит `Retry-After`.

## `POST /api/integrations/Tasks/Ping`

Не принимает тело. Отправляет тестовый подписанный webhook на настроенный callback и возвращает результат доставки.

## Общие HTTP-коды

| Код | Значение |
|---:|---|
| `200` | Успешное чтение или синхронная команда |
| `202` | Асинхронная команда принята в обработку; фактическое поведение постановки задач |
| `400` | Ошибка формата, валидации или бизнес-правила |
| `401` | Токен отсутствует, недействителен или истёк |
| `403` | Нет доступа к операции или организации |
| `429` | Превышена допустимая частота запросов |

## Дополнительные интеграционные методы

Методы `Organizations/GetClients`, `Organizations/MarkClientPaid` и `Drivers/ConfirmAuthorization` относятся к привлечению клиентов и подтверждению авторизации водителей, а не к основному сценарию обмена заявками. Их нельзя включать в реализацию партнёра без отдельного согласования бизнес-сценария и прав с CARGO.RUN.

---

--8<-- "docs/products/partner-integrations/reference/models.md"

---

--8<-- "docs/products/partner-integrations/reference/enums.md"
