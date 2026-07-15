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

В теле запроса передается полная модель заявки. При полном обновлении (`id > 0`) передавайте актуальные значения полей, которые должны сохраниться в карточке заявки.

### Основные поля тела запроса

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | `0` для создания новой заявки, ID существующей заявки для обновления |
| `cargoOwnerDictionaryItemId` | `long?` | Да, кроме порожней заявки | ID заказчика/контрагента |
| `paymentTypeId` | `long?` | Да, кроме порожней заявки | Тип оплаты |
| `ndsTypeId` | `long?` | Да, кроме порожней заявки | Тип НДС |
| `price` | `double?` | Да, кроме порожней заявки | Стоимость заявки |
| `driver` | `object?` | Да | Водитель |
| `carOption` | `object?` | Да | Автомобиль/тягач |
| `trailerOption` | `object?` | Да | Прицеп |
| `bidPoints` | `BidPointEditModel[]` | Да | Маршрутные точки, минимум две: погрузка и выгрузка |
| `cargos` | `CargoModel[]?` | Нет | Грузы |
| `typeOptions` | `TypeOptionModel[]?` | Нет | Пользовательские справочники и дополнительные опции |
| `externalId` | `string?` | Нет | Внешний ID заявки |
| `comment` | `string?` | Нет | Комментарий |
| `clientBidNumber` | `string?` | Нет | Номер заявки клиента |
| `clientBidDate` | `date-time?` | Нет | Дата заявки клиента |
| `isEmptyMileageBid` | `boolean?` | Нет | Признак порожней заявки |

### Поля `bidPoints[]`

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | `0` для новой точки, ID существующей точки для обновления |
| `order` | `int` | Да | Порядковый номер точки в маршруте |
| `type` | `BidPointType` | Да | Тип точки, например погрузка или выгрузка |
| `customPointTypeId` | `long?` | Нет | Тип пользовательской точки, если `type = CustomPoint` |
| `planEnterDate` | `date-time?` | Нет | Плановое время прибытия |
| `secondaryPlanEnterDate` | `date-time?` | Нет | Дополнительное плановое время |
| `geozone` | `MapObjectEditModel?` | Да | Геозона/адрес точки |
| `counterpartyId` | `long?` | Нет | Контрагент точки |
| `contactPerson` | `object?` | Нет | Контактное лицо точки |
| `comment` | `string?` | Нет | Комментарий к точке |
| `loadOptions` | `object[]?` | Нет | Опции погрузки/выгрузки |

### Значения `BidPointType`

| Значение | Код | Описание |
|---|---:|---|
| `StartPoint` | `0` | Стартовая точка маршрута |
| `LoadPoint` | `1` | Точка погрузки |
| `UnloadPoint` | `2` | Точка выгрузки |
| `CustomPoint` | `3` | Пользовательская точка маршрута. Для нее можно передать `customPointTypeId` |

### Поля `bidPoints[].geozone`

`geozone` описывает адрес и географию точки маршрута.

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | ID геообъекта. Для новой точки обычно передается `0` |
| `location` | `PointEditModel` | Да | Координаты точки |
| `city` | `string?` | Нет | Город |
| `address` | `string?` | Нет | Полный адрес |
| `village` | `string?` | Нет | Населенный пункт |
| `state` | `string?` | Нет | Регион |
| `county` | `string?` | Нет | Район |
| `street` | `string?` | Нет | Улица |
| `houseNumber` | `string?` | Нет | Номер дома |
| `federalDistrict` | `string?` | Нет | Федеральный округ |
| `radius` | `double?` | Нет | Радиус геозоны |
| `type` | `MapObjectType` | Да | Тип геообъекта |

### Поля `bidPoints[].geozone.location`

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `coordinates` | `double[]?` | Нет | Координаты точки. Обычно передаются в формате `[долгота, широта]` |

### Значения `MapObjectType`

| Значение | Код | Описание |
|---|---:|---|
| `None` | `0` | Тип не задан |
| `BidPoint` | `1` | Точка заявки |
| `RouteSupportPoint` | `2` | Опорная точка маршрута |
| `GasStation` | `3` | АЗС |
| `StartBidPoint` | `4` | Стартовая точка заявки |
| `PostamatPoint` | `5` | Постамат |
| `ItemChangePoint` | `6` | Точка перецепки или пересменки |
| `ServicePoint` | `7` | Сервисная точка |
| `CounterpartyPoint` | `8` | Точка контрагента |
| `TripCouplingPoint` | `9` | Точка сцепки рейса |

### Поля `bidPoints[].contactPerson`

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | ID контактного лица |
| `name` | `string?` | Нет | Имя контактного лица |
| `phoneNumber` | `string?` | Нет | Телефон контактного лица |

### Поля `bidPoints[].loadOptions[]`

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | ID опции погрузки или выгрузки |

### Как читать массивы, справочники и перечисления

| Признак в поле | Что означает | Примеры |
|---|---|---|
| Тип заканчивается на `[]` | Поле содержит массив объектов или значений | `bidPoints`, `cargos`, `typeOptions`, `loadOptions`, `accessPermitIds` |
| Название заканчивается на `Id` или `Ids` | Поле ссылается на существующий объект или элемент справочника | `counterpartyId`, `paymentTypeId`, `ndsTypeId`, `driverId`, `accessPermitIds` |
| Тип указан как отдельная модель с обязательным `id` | Нужно передать ссылку на существующий объект и, если требуется, дополнительные поля модели | `contactPerson`, `loadOptions` |
| Тип имеет фиксированный список значений | Это перечисление, а не справочник | `BidPointType`, `MapObjectType` |

### Поля `cargos[]`

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | `0` для нового груза, ID существующего груза для обновления |
| `typeId` | `long?` | Нет | Тип груза |
| `name` | `string?` | Нет | Наименование груза |
| `weight` | `double?` | Нет | Вес |
| `volume` | `double?` | Нет | Объем |
| `length` | `double?` | Нет | Длина |
| `width` | `double?` | Нет | Ширина |
| `height` | `double?` | Нет | Высота |
| `loadingTypeId` | `long?` | Нет | Тип погрузки |
| `unloadingTypeId` | `long?` | Нет | Тип выгрузки |
| `comment` | `string?` | Нет | Комментарий к грузу |

### Поля `typeOptions[]`

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | ID элемента пользовательского справочника |
| `entityOptionId` | `long` | Да | ID настройки/свойства справочника |

### Особенности

- поддерживает как создание, так и полное обновление;
- при создании статус заявки — `New` (черновик);
- при ошибках валидации API возвращает HTTP 4xx с текстом ошибки.

### Пример создания заявки

В примере показан запрос на создание черновика заявки. Он адаптирован из payload фронта: служебные поля интерфейса и поля состояния не передаются, а `id` новых объектов указаны как `0`.

```json
{
  "id": 0,
  "cargoOwnerDictionaryItemId": 129647034,
  "legalPersonId": 127039077,
  "paymentTypeId": 41,
  "ndsTypeId": 129493473,
  "price": 45000,
  "isVatTop": false,
  "contractNumber": "324352352352",
  "paymentPeriodType": "InCalendarDays",
  "responsibleId": 1466813,
  "isDriverForwarder": false,
  "isEmptyMileageBid": false,
  "createDocumentAssignment": false,
  "driver": {
    "id": 1478168
  },
  "carOption": {
    "carId": 1465629
  },
  "trailerOption": {
    "trailerId": 128820197
  },
  "bidPoints": [
    {
      "id": 0,
      "order": 0,
      "type": "LoadPoint",
      "comment": "Комментарий к первой точке",
      "planEnterDate": "2026-07-15T10:58:00",
      "cargoOwnerDictionaryItemId": 129647035,
      "geozone": {
        "id": 0,
        "location": {
          "type": "Point",
          "coordinates": [
            47.4720139,
            55.86623
          ]
        },
        "city": "Цивильск",
        "address": "Россия, Чувашская Республика — Чувашия, Цивильск, улица Гагарина",
        "state": "Чувашская Республика — Чувашия",
        "county": "Цивильский муниципальный округ",
        "street": "улица Гагарина",
        "houseNumber": null,
        "federalDistrict": "Приволжский федеральный округ",
        "radius": 2000,
        "type": "BidPoint"
      },
      "contactPerson": {
        "id": 129417981,
        "phoneNumber": "+7 964 781-40-98",
        "name": "Александр Пушкин"
      },
      "loadOptions": [
        {
          "id": 4612889
        }
      ],
      "typeOptions": [],
      "extendedProperties": []
    },
    {
      "id": 0,
      "order": 1,
      "type": "UnloadPoint",
      "comment": "Комментарий к выгрузке",
      "planEnterDate": "2026-07-16T11:10:00",
      "cargoOwnerDictionaryItemId": 129647014,
      "geozone": {
        "id": 0,
        "location": {
          "type": "Point",
          "coordinates": [
            55.9507846,
            54.7017154
          ]
        },
        "city": "Уфа",
        "address": "Россия, Республика Башкортостан, Уфа, Сарапульская улица, 35",
        "state": "Республика Башкортостан",
        "county": "городской округ Уфа",
        "street": "Сарапульская улица",
        "houseNumber": "35",
        "federalDistrict": "Приволжский федеральный округ",
        "radius": 1999,
        "type": "BidPoint"
      },
      "contactPerson": {
        "id": 129417982,
        "phoneNumber": "8 914 781 07 01",
        "name": "Михаил Лермонтов"
      },
      "loadOptions": [
        {
          "id": 4612889
        }
      ],
      "typeOptions": [],
      "extendedProperties": []
    }
  ],
  "cargos": [
    {
      "id": 0,
      "name": "Крышки",
      "weight": 20,
      "volume": 5,
      "length": 6,
      "height": 8,
      "width": 7,
      "typeId": 712,
      "packType": "Паллеты",
      "comment": "Комментарий к грузу",
      "extendedProperties": [],
      "typeOptions": []
    }
  ],
  "extendedProperties": [
    {
      "propertyName": "CustomeFieldForDemo",
      "value": "Пример заполнения кастомного поля"
    }
  ],
  "typeOptions": [],
  "documents": [],
  "accessPermitIds": []
}
```

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

### Поля `extendedProperties[]`

`extendedProperties` содержит пользовательские дополнительные поля заявки.

| Поле | Тип | Описание |
|---|---|---|
| `propertyName` | `string` | Имя пользовательского поля |
| `value` | `string?` | Значение, заданное пользователем |

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

Метод возвращает список всех событий замены прицепа, зафиксированных по заявке: старый и новый прицеп, время замены, источник данных и комментарий (если задан).

### Основные поля ответа

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID события замены |
| `bidId` | `long` | ID заявки |
| `oldTrailerId` | `long?` | ID старого прицепа |
| `oldTrailerNumber` | `string?` | Номер старого прицепа |
| `newTrailerId` | `long?` | ID нового прицепа |
| `newTrailerNumber` | `string?` | Номер нового прицепа |
| `replacedAt` | `date-time?` | Дата и время замены |
| `sourceType` | `SourceType?` | Источник данных |
| `comment` | `string?` | Комментарий |

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

Поддерживаемые значения `payment.paymentStatus`:

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
