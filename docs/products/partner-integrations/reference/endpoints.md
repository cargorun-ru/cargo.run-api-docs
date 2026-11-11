# Методы API, модели и значения

Во всех путях `<baseUrl>` — адрес API CARGO.RUN. Адреса тестовой и промышленной сред запрашиваются у команды CARGO.RUN при подключении. Все методы, кроме `Account/Token`, требуют `Authorization: Bearer <token>`.

## Сводная таблица

| Метод | Назначение |
|---|---|
| `POST /api/Account/Token` | Получить M2M-токен |
| `GET /api/integrations/Organizations/Check` | Проверить организацию по ИНН |
| `POST /api/integrations/Organizations/Apply` | Создать организацию или получить доступ |
| `POST /api/integrations/Bids/Apply` | Создать или обновить заявку |
| `GET /api/integrations/Bids/GetList` | Получить созданные партнёром и транслируемые ему заявки |
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

Поля `name` и `inn` обязательны. Поиск организации выполняется по `inn`. Для новой
организации, создаваемой партнёрским сервисом, сразу включается модуль
«Температурный режим». Успех: `200 OK`, модель
[`OrganizationApplyResult`](#organizationapplyresult).

## `POST /api/integrations/Bids/Apply`

Тело: [`ApplyBidFromIntegrationContext`](#applybidfromintegrationcontext). Результат: [`ApplyBidResultModel`](#applybidresultmodel).

Создаёт или полностью обновляет заявку, создаёт недостающие транспорт, водителей и
контрагента, применяет характеристики ТС и температурный режим и запускает заявку в
работу. Если координаты точки не переданы, CARGO.RUN определяет их по обязательному
адресу.

Успех: `200 OK`:

```json
{
  "id": 12345,
  "isRouteBuilt": true
}
```

При нарушении валидации возвращается `400 Bad Request` с текстовым сообщением.

## `GET /api/integrations/Bids/GetList`

Возвращает [`IntegrationBidListModel[]`](#integrationbidlistmodel):

- заявки, созданные текущим партнёром;
- заявки перевозчиков, транслируемые платформе партнёра.

Поле `isCreatedByPlatform` различает эти виды. `externalId` содержит
`bid.externalId`, а отдельное поле `externalPlatformOrderId` — числовой ID заказа,
указанный перевозчиком для партнёрской платформы. Для последующих вызовов методов
чтения используйте `id` CARGO.RUN.

| Заголовок | Обязательно | Поведение |
|---|---:|---|
| `X-Organization-Id` | Нет | Если передан, возвращаются заявки только этой доступной организации. Без заголовка возвращаются заявки всех организаций, доступных интеграционному клиенту. |

Без непустого `$filter` сервер ограничивает список заявками, изменёнными за последние
30 дней. Любой явно переданный непустой `$filter` отменяет это окно, поэтому для
инкрементальной синхронизации всегда указывайте границу по `updatedAt`.

Сортировка по умолчанию — `updatedAt,id`. Ответ также содержит точки, кроме
начальных и сервисных, и события `events`. Поля `counterparty`, `vehicleType`,
`organizationInn` и `events` добавляются после основной выборки и не участвуют в
`$filter` и `$orderby`.

Поддерживает OData-параметры и заголовок `X-MetaCount`. Для пагинации используйте
`$top` не более `1000` и `$skip` либо курсор `(updatedAt,id)`.

Поля `counterparty`, `temperatureRegime` и `vehicleType` являются частью модели
ответа. Отдельного режима `GetList` без этих объектов нет; клиент должен игнорировать
неиспользуемые поля.

!!! warning "Миграция с GetCurrentList"
    `GET /api/integrations/Bids/GetCurrentList` удалён. Используйте `GetList` и
    определяйте источник заявки по `isCreatedByPlatform`. Отсутствие
    `X-Organization-Id` означает выборку по всем доступным организациям, а не по одной
    текущей организации.

## `GET /api/integrations/Bids/Get`

| Параметр | Где | Тип | Обязательно | Описание |
|---|---|---|---:|---|
| `id` | query | int64 | Да | ID заявки CARGO.RUN |

Успех: `200 OK`, модель [`IntegrationBidModel`](#integrationbidmodel).

Если заявка не существует, удалена или недоступна интеграционному клиенту, в
обычном случае возвращается `200 OK` с пустым телом. Клиент должен проверять тело
ответа до десериализации модели.

## `GET /api/integrations/Bids/GetEvents`

Параметр `id` — обязательный ID заявки CARGO.RUN. Успех:
[`IntegrationBidEventModel[]`](#integrationbideventmodel). Значения `type`:
[`IntegrationBidEventType`](#integrationbideventtype).

События самой заявки возвращаются в часовом поясе организации, события точек — в
часовом поясе соответствующей точки. События сервисных точек не возвращаются.
Массив представляет текущее состояние, вычисленное по фактическим датам, а не
полный журнал изменений.

## `GET /api/integrations/Bids/GetPlannedRoute`

Параметр `id` — обязательный ID заявки. Успех: [`RouteSimpleModel`](#routesimplemodel). Модель содержит расчётные показатели; геометрия планового маршрута в базовом синхронном ответе не используется партнёрским сценарием.

```http
GET <baseUrl>/api/integrations/Bids/GetPlannedRoute?id=12345
Authorization: Bearer <accessToken.token>
```

```json
{
  "id": 98765,
  "distance": 820000,
  "duration": 43200,
  "distanceWithoutEmptyMileage": 820000,
  "emptyMileageDistance": 0,
  "durationWithoutEmptyMileage": 43200
}
```

Расстояния указаны в метрах, продолжительность — в секундах.

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

Поддерживаются только комбинации `Write/Read/ReadQuery` для `Bid`, перечисленные в
разделе [Асинхронная очередь](../async-queue.md). `Write` использует тот же контракт,
что `Bids/Apply`. `ReadQuery` эквивалентен `Bids/GetList` без
`X-Organization-Id`.

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
| `404` | Ресурс не найден в методах, где этот статус явно предусмотрен; чтение недоступной заявки обычно возвращает `200` с пустым телом |
| `429` | Превышена допустимая частота запросов |

## Дополнительные интеграционные методы

Методы `Organizations/GetClients`, `Organizations/MarkClientPaid` и `Drivers/ConfirmAuthorization` относятся к привлечению клиентов и подтверждению авторизации водителей, а не к основному сценарию обмена заявками. Их нельзя включать в реализацию партнёра без отдельного согласования бизнес-сценария и прав с CARGO.RUN.

---

--8<-- "docs/products/partner-integrations/reference/models.md"

---

--8<-- "docs/products/partner-integrations/reference/enums.md"
