# Работа с заявками (Bids)

Этот раздел описывает методы API CARGO.RUN, использующиеся для создания, обновления, получения, удаления и управления статусами заявок.  
Общие правила работы API, в том числе паттерн `Apply`, приведены в файле:

- [Обзор API](./overview.md)

Минимальные обязательные поля заявки — в:

- [Минимальные требования к запросам](../minimal-requirements.md)

Сценарии интеграции описаны в:

- [CARGO.RUN → учетная система](../integration/scenario-cr-to-external.md)
- [Учетная система → CARGO.RUN](../integration/scenario-external-to-cr.md)
- [Синхронизация данных](../integration/sync.md)

---

# 1. Создание и обновление заявки

## 1.1. Полное создание или обновление заявки

```http
POST /api/truckingbids/apply
```

### Назначение

- Создание новой заявки (`id = 0`)
- Полное обновление существующей заявки (`id > 0`)

В теле запроса необходимо передавать **все поля**, требуемые swagger.

### Особенности

- поддерживает как создание, так и полное обновление;
- при создании статус заявки — `New` (черновик);
- при ошибках валидации API возвращает HTTP 4xx с текстом ошибки.

---

## 1.2. Частичное обновление заявки (Patch)

```http
POST /api/truckingbids/patch
```

### Назначение

- обновление только изменённых полей заявки.

### Ограничения

- нельзя частично изменить вложенные структуры (`bidPoints`, `cargos`, `typeOptions` и др.);
- если нужно изменить маршрутные точки — необходимо передать **весь массив** `bidPoints`, включая неизменённые точки.

---

# 2. Управление статусами и жизненным циклом

## 2.1. Запуск заявки в работу

```http
POST /api/truckingbids/setstatus
```

### Тело запроса

```json
{
  "bidId": 0,
  "status": "Started"
}
```

---

## 2.2. Отмена заявки

```http
POST /api/bids/cancel
```

### Тело запроса

```json
{
  "bidId": 0
}
```

---

## 2.3. Закрытие заявки вручную

```http
POST /api/truckingbids/forcecomplete
```

### Тело запроса

```json
{
  "bidId": 0,
  "reason": "string",
  "mileage": 0,
  "useOdometerMileage": true,
  "bidPoints": [
    {
      "id": 0,
      "enteredAtByLogist": "2025-05-07T07:15:04Z",
      "loadUnloadedAtByLogist": "2025-05-07T07:15:04Z",
      "loadUnloadStatus": "AtLoading"
    }
  ]
}
```

---

## 2.4. Возврат заявки в черновик

```http
POST /api/truckingbids/revert
```

### Тело запроса

```json
{
  "bidId": 0
}
```

---

# 3. Удаление и восстановление

## 3.1. Удаление заявки

```http
POST /api/bids/delete
```

### Тело запроса

```json
{
  "bidId": 0
}
```

Заявка должна быть предварительно переведена в статус `New` (через `/api/truckingbids/revert`).

---

## 3.2. Восстановление удалённой заявки

```http
POST /api/bids/restore
```

### Тело запроса

```json
{
  "bidId": 0
}
```

---

# 4. Получение заявок

## 4.1. Получение заявки для редактирования

```http
GET /api/bids/get
```

Параметры:

- `id` — идентификатор заявки.

---

## 4.2. Получение списка заявок (инкрементальная синхронизация)

```http
GET /api/bids/getlistforexternal
```

Поддерживает:

- `$filter`
- `$orderby`
- `$top`
- `$skip`

Пример:

```http
GET /api/bids/getlistforexternal
  ?$filter=updatedAt ge 2024-01-23T21:00:00Z
  &$orderby=updatedAt
  &$top=50
  &$skip=0
```

Подробное описание в:

- [Синхронизация данных](../integration/sync.md)

### Основные поля ответа `BidForExternalSyncModel`

Метод возвращает массив заявок. Общее количество записей передается в заголовке `X-MetaCount`.

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID заявки |
| `status` | `BidStatus` | Статус заявки |
| `price` | `double?` | Цена |
| `priceWithoutVatOnTop` | `double?` | Цена без НДС, если НДС сверху |
| `createdAt` | `date-time` | Дата создания заявки |
| `updatedAt` | `date-time` | Дата последнего изменения |
| `externalUpdatedAt` | `date-time?` | Дата обновления из внешней системы |
| `createdById` | `long` | ID пользователя, создавшего заявку |
| `approvedById` | `long?` | ID пользователя, согласовавшего заявку |
| `approvedAt` | `date-time?` | Дата согласования |
| `responsibleId` | `long?` | ID ответственного |
| `salesManagerId` | `long?` | ID менеджера по продажам |
| `carLogistId` | `long?` | ID логиста автомобиля на момент создания заявки |
| `paymentTypeId` | `long` | Тип оплаты |
| `ndsTypeId` | `long` | Тип НДС |
| `isVatTop` | `boolean` | НДС начисляется сверху |
| `counterpartyId` | `long?` | ID контрагента |
| `contractId` | `long?` | ID договора контрагента |
| `distributionBidId` | `long?` | ID заказа, из которого создана заявка |
| `routeId` | `long?` | ID маршрута |
| `driverId` | `long?` | ID текущего водителя |
| `secondaryDriverId` | `long?` | ID второго водителя |
| `isDriverForwarder` | `boolean` | Водитель является экспедитором |
| `acceptedByDriverAt` | `date-time?` | Дата принятия заявки водителем |
| `acceptedByDriverForwarderAt` | `date-time?` | Дата принятия водителем-экспедитором |
| `car` | `CarSimpleModel?` | Автомобиль |
| `trailer` | `TrailerListViewModel?` | Прицеп |
| `legalPerson` | `IdModel?` | Юридическое лицо |
| `bidPoints` | `BidPointViewModel[]?` | Точки маршрута |
| `cargos` | `CargoModel[]?` | Грузы |
| `typeOptions` | `TypeOptionModel[]?` | Пользовательские справочники и дополнительные опции |
| `temperatureRegime` | `BidTemperatureRegimeModel?` | Температурный режим |
| `temperature` | `TemperatureValueModel?` | Текущая температура |
| `documents` | `RelatedDocumentModel[]?` | Документы |
| `extendedProperties` | `ExtendedPropertyJsonObject[]?` | Дополнительные поля заявки |
| `externalId` | `string?` | Внешний ID |
| `contractNumber` | `string?` | Номер договора |
| `comment` | `string?` | Комментарий |
| `clientBidNumber` | `string?` | Номер заявки клиента |
| `clientBidDate` | `date-time?` | Дата заявки клиента |
| `paymentPeriodInDays` | `int?` | Срок оплаты в днях |
| `paymentPeriodType` | `PaymentPeriodType?` | Вариант срока оплаты |
| `sourceType` | `SourceType` | Источник заявки |
| `hasFactoring` | `boolean` | Заявка отправлена на факторинг |
| `isEmptyMileageBid` | `boolean` | Порожняя заявка |
| `isInternational` | `boolean` | Международная заявка |
| `hasItemsChange` | `boolean` | Есть перецепка/пересменка |
| `isDeleted` | `boolean` | Заявка удалена |
| `createDocumentAssignment` | `boolean` | Создавать задание сдачи документов после завершения |
| `hasServicePoints` | `boolean` | Есть точки сервисных работ |
| `isPreBid` | `boolean` | Предзаявка |
| `payment` | `BidPaymentGetModel?` | Информация об оплате |
| `accessPermitIds` | `long[]?` | Допуски и разрешения |

### Поля `typeOptions[]`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID элемента пользовательского справочника |
| `entityOptionId` | `long` | ID настройки/свойства справочника |

Чтобы получить человекочитаемое значение элемента, запросите `GET /api/Catalogs/GetItems?$filter=id eq {typeOptions[].id}`. Подробнее: [Пользовательские справочники](./custom-catalogs.md).

---

# 5. Получение связанных данных

## 5.1. Связанные документы

```http
GET /api/bids/getbiddocumentassignmentsforbid
```

Возвращает связанные документы (внешние файлы) по заявке.

---

## 5.2. Данные по точкам заявки

Изменение точек выполняется:

- через `/apply` — полная передача модели,
- через `/patch` — но с передачей **всего массива `bidPoints`**.


## 5.3. Получение данных по перецепкам в заявке

```http
GET /api/truckingbids/gettrailerreplacements
```

### Назначение

Получение данных о перецепках (замене прицепа) в рамках конкретной заявки.

### Параметры

- `bidId` — идентификатор заявки (query-параметр).

### Комментарии

Метод возвращает список всех событий замены прицепа, зафиксированных по заявке: старый и новый прицеп, время замены, источник данных и комментарий (если задан). Фактическая структура ответа определяется моделью `TrailerReplacementViewModel` в swagger.

---

## 5.4. Обновление данных по оплате заявки

```http
POST /api/TruckingBids/ApplyBidPayment
```

### Назначение

Установка или изменение данных по оплате заявки.

Используйте `ApplyBidPayment`, если внешняя система (например, 1С) фиксирует оплату по заявке и должна передать в CARGO.RUN статус оплаты, дату оплаты, плановую дату оплаты, сумму остатка или комментарий.

### Тело запроса

Тело описано моделью `BidPaymentWrapperModel`:

```json
{
  "bidId": 0,
  "payment": {
    "paymentStatus": "Paid",
    "factPaymentDate": "2026-06-30",
    "planPaymentDate": "2026-07-05",
    "invoiceDate": "2026-06-29",
    "remainingPayment": 0,
    "comment": "Оплата получена"
  }
}
```

Поля:

- `bidId` — идентификатор заявки;
- `payment` — данные оплаты (`BidPaymentModel`);
- `payment.paymentStatus` — статус оплаты, обязательное поле;
- `payment.factPaymentDate` — фактическая дата оплаты;
- `payment.planPaymentDate` — плановая дата оплаты;
- `payment.invoiceDate` — дата счёта;
- `payment.remainingPayment` — остаток к оплате;
- `payment.comment` — комментарий по оплате.

### Поддерживаемые значения

По перечислению `BidPaymentStatus` в swagger:

- `NotPaid`
- `PartiallyPaid`
- `Paid`
- `Expired`

---

# 6. Ошибки

Возможные ошибки:

- невалидные данные (`paymentTypeId`, `ndsTypeId`, элементы геозон и т.д.);
- попытка удалить заявку без предварительного `revert`;
- частичное обновление вложенных структур через `/patch`.

Поведение API:
