# Заказы на распределение (DistributionBids)

Этот раздел описывает методы API CARGO.RUN для работы с заказами на распределение (DistributionBids).

Общие принципы работы API см. в:

- [Обзор API](../api/overview.md)
- [Auth API](../api/auth.md)

Минимальные требования к данным заказа на распределение приведены в:

- [Минимальные требования к запросам](../minimal-requirements.md)

---

## 1. Создание и обновление заказов

### 1.1. Пакетное создание/обновление заказов

```http
POST /api/distributionbids/apply
```

### Назначение

Создание и изменение заказов на распределение.

- При `id = 0` в элементах массива — создаётся новый заказ.
- При `id > 0` — обновляется существующий заказ.

### Тело запроса

Тело запроса описано моделью `DistributionBidBatchEditModel`:

```json
{
  "items": [
    {
      // DistributionBidEditModel
    }
  ]
}
```

Модель `DistributionBidEditModel` содержит поля заказа.  
Обязательные поля указаны в разделе:

- [Минимальные требования к запросам](../minimal-requirements.md)

### Основные поля `DistributionBidEditModel`

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | `0` для создания нового заказа, ID существующего заказа для обновления |
| `counterpartyId` | `long?` | Нет | ID контрагента |
| `legalPersonId` | `long?` | Нет | ID юридического лица |
| `sourceId` | `long?` | Нет | ID источника заказа |
| `trailerTypeId` | `long?` | Нет | ID типа прицепа |
| `contactPerson` | `object?` | Нет | Контактное лицо |
| `temperatureRegime` | `object?` | Нет | Температурный режим |
| `carId` | `long?` | Нет | ID автомобиля |
| `driverId` | `long?` | Нет | ID водителя |
| `trailerId` | `long?` | Нет | ID прицепа |
| `externalStatus` | `ExternalDistributionBidStatus` | Да | Внешний статус заказа |
| `cargos` | `DistributionBidCargoModel[]?` | Нет | Грузы |
| `bidPoints` | `DistributionBidPointEditModel[]?` | Нет | Точки заказа |
| `key` | `string?` | Нет | Ключ или внешний код заказа |
| `comment` | `string?` | Нет | Комментарий |
| `paymentTypeId` | `long?` | Нет | Тип оплаты |
| `ndsTypeId` | `long?` | Нет | Тип НДС |
| `price` | `double?` | Нет | Стоимость |
| `isVatTop` | `boolean?` | Нет | НДС начисляется сверху |
| `externalId` | `string?` | Нет | Внешний ID |

### Поля `bidPoints[]`

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | `0` для новой точки, ID существующей точки для обновления |
| `order` | `int` | Да | Порядковый номер точки в маршруте |
| `type` | `BidPointType` | Да | Тип точки заказа |
| `customPointTypeId` | `long?` | Нет | Тип пользовательской точки, если `type = CustomPoint` |
| `planEnterDate` | `date-time?` | Нет | Плановое время прибытия |
| `secondaryPlanEnterDate` | `date-time?` | Нет | Дополнительное плановое время |
| `geozone` | `MapObjectEditModel?` | Нет | Геозона/адрес точки |
| `counterpartyId` | `long?` | Нет | Контрагент точки |
| `contactPerson` | `ContactPersonModel?` | Нет | Контактное лицо точки |
| `comment` | `string?` | Нет | Комментарий к точке |
| `loadOptions` | `LoadOptionModel[]?` | Нет | Опции погрузки/выгрузки |

### Значения `BidPointType`

| Значение | Код | Описание |
|---|---:|---|
| `StartPoint` | `0` | Стартовая точка маршрута |
| `LoadPoint` | `1` | Точка погрузки |
| `UnloadPoint` | `2` | Точка выгрузки |
| `CustomPoint` | `3` | Пользовательская точка маршрута. Для нее можно передать `customPointTypeId` |

### Поля `bidPoints[].geozone`

`geozone` описывает адрес и географию точки заказа.

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
| `BidPoint` | `1` | Точка заявки или заказа |
| `RouteSupportPoint` | `2` | Опорная точка маршрута |
| `GasStation` | `3` | АЗС |
| `StartBidPoint` | `4` | Стартовая точка заявки или заказа |
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

### Пример создания заказа

В примере показано создание заказа на распределение с двумя точками маршрута, грузом, наемным транспортом и пользовательским дополнительным полем.

```json
{
  "items": [
    {
      "id": 0,
      "externalStatus": "None",
      "counterpartyId": 129647035,
      "legalPersonId": 127039078,
      "responsibleId": 1466813,
      "price": 120000,
      "paymentTypeId": 41,
      "ndsTypeId": 129493473,
      "paymentPeriodType": "InCalendarDays",
      "paymentPeriodInDays": 30,
      "invoiceTriggerType": "ByOriginal",
      "trailerTypeId": 94325,
      "hasHiredCar": true,
      "isMandatory": true,
      "hiredCarCounterpartyId": 129647034,
      "hiredCarPrice": 115000,
      "hiredCarCompletedAt": "2026-07-15T00:00:00",
      "hiredCarNdsTypeId": 129493473,
      "hiredCarPaymentTypeId": 41,
      "hiredCarInvoiceTriggerType": "AtUnloading",
      "hiredCarPaymentPeriodType": "InCalendarDays",
      "hiredCarPaymentPeriodInDays": 30,
      "hiredCarId": 301,
      "hiredTrailerId": 182,
      "hiredDriverId": 242,
      "contractNumber": "324352352352",
      "comment": "Произвольный комментарий к заказу",
      "contactPerson": {
        "name": "Владимир Высоцкий",
        "phoneNumber": "+7 (962) 568-85-39"
      },
      "bidPoints": [
        {
          "id": 0,
          "order": 0,
          "type": "LoadPoint",
          "planEnterDate": "2026-07-13T13:55",
          "counterpartyId": 129647035,
          "comment": "Произвольный комментарий к точке загрузки",
          "geozone": {
            "id": 0,
            "location": {
              "type": "Point",
              "coordinates": [
                44.697292211870554,
                43.03449472631854
              ]
            },
            "address": "Россия, Республика Северная Осетия — Алания, Владикавказ, Пушкинская улица, 58А",
            "geocoderSourceType": "Yandex",
            "city": "Владикавказ",
            "state": "Республика Северная Осетия — Алания",
            "county": "городской округ Владикавказ",
            "street": "Пушкинская улица",
            "houseNumber": "58А",
            "federalDistrict": "Северо-Кавказский федеральный округ",
            "radius": null,
            "coordinates": null,
            "type": "BidPoint"
          },
          "contactPerson": {
            "phoneNumber": "+7 964 781-40-98",
            "name": "Александр Пушкин"
          },
          "loadOptions": [
            {
              "id": 4612889
            },
            {
              "id": 4612891
            },
            {
              "id": 4675966
            }
          ],
          "extendedProperties": []
        },
        {
          "id": 0,
          "order": 1,
          "type": "UnloadPoint",
          "planEnterDate": "2026-07-15T00:00",
          "counterpartyId": 5225295,
          "comment": "Произвольный комментарий к точке выгрузки",
          "geozone": {
            "id": 0,
            "location": {
              "type": "Point",
              "coordinates": [
                52.224350311291346,
                52.80040289067903
              ]
            },
            "address": "Россия, Оренбургская область, Бузулук, улица Гая, 69",
            "geocoderSourceType": "Yandex",
            "city": "Бузулук",
            "state": "Оренбургская область",
            "county": "городской округ Бузулук",
            "street": "улица Гая",
            "houseNumber": "69",
            "federalDistrict": "Приволжский федеральный округ",
            "radius": null,
            "coordinates": null,
            "type": "BidPoint"
          },
          "contactPerson": {
            "phoneNumber": "8 914 781 07 01",
            "name": "Михаил Лермонтов"
          },
          "loadOptions": [
            {
              "id": 4612890
            }
          ],
          "extendedProperties": []
        }
      ],
      "cargos": [
        {
          "id": 0,
          "name": "Кирпичи",
          "typeId": 713,
          "comment": "Произвольный комментарий к грузу",
          "packType": "паллеты",
          "volume": 18,
          "length": 82,
          "width": 13,
          "height": 8,
          "extendedProperties": []
        }
      ],
      "extendedProperties": [
        {
          "propertyName": "CustomeFieldForDemo",
          "value": "Пример заполнения кастомного поля"
        }
      ],
      "typeOptions": [],
      "documents": []
    }
  ]
}
```

При ошибках валидации возвращается HTTP 4xx и текстовое описание ошибки.

---

## 2. Получение списков заказов

### 2.1. Список заказов для внешних сервисов

```http
GET /api/distributionbids/getlistforexternal
```

### Назначение

Получение списка заказов по фильтру для внешних сервисов с более подробной информацией. Поддерживается формат OData.

### Параметры

- `$filter` — фильтр по полям `DistributionBidForExternalSyncModel`;
- `$orderBy` — сортировка;
- `$top` — ограничение количества;
- `$skip` — смещение;
- `$count` — запрос количества записей;
- `$select` — выбор отдельных полей, если поддерживается в подключении;
- `$expand` — раскрытие связанных сущностей, если поддерживается в подключении.

Ответ — массив `DistributionBidForExternalSyncModel`.

### Основные поля ответа `DistributionBidForExternalSyncModel`

Метод возвращает массив заказов на распределение. Общее количество записей передается в заголовке `X-MetaCount`.

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID заказа |
| `bidId` | `long?` | ID заявки, созданной на основании заказа; `null`, если заказ не распределен |
| `status` | `DistributionBidStatus` | Внутренний статус заказа |
| `counterpartyId` | `long?` | ID контрагента |
| `counterparty` | `CounterpartyViewModel?` | Контрагент |
| `contractId` | `long?` | ID договора контрагента |
| `contactPersonId` | `long?` | ID контактного лица |
| `contactPerson` | `ContactPersonViewModel?` | Контактное лицо |
| `createdAt` | `date-time` | Дата создания |
| `updatedAt` | `date-time` | Дата последнего изменения |
| `createdById` | `long` | ID создателя |
| `createdBy` | `ShortNameModel?` | Пользователь, создавший заказ |
| `paymentTypeId` | `long?` | Тип оплаты |
| `ndsTypeId` | `long?` | Тип НДС |
| `hourlyPrice` | `double?` | Почасовая ставка |
| `price` | `double?` | Стоимость |
| `priceWithoutVatOnTop` | `double?` | Стоимость без НДС, если НДС сверху |
| `isVatTop` | `boolean?` | НДС начисляется сверху |
| `externalId` | `string?` | Внешний ID |
| `contractNumber` | `string?` | Номер договора |
| `comment` | `string?` | Комментарий |
| `clientBidNumber` | `string?` | Номер заявки клиента |
| `clientBidDate` | `date-time?` | Дата заявки клиента |
| `sourceType` | `SourceType` | Источник заказа |
| `paymentPeriodInDays` | `int?` | Срок оплаты в днях |
| `paymentPeriodType` | `PaymentPeriodType?` | Вариант срока оплаты |
| `invoiceTriggerType` | `InvoiceTriggerType?` | Основание для выставления счета |
| `documents` | `RelatedDocumentModel[]?` | Документы |
| `hasHiredCar` | `boolean` | Используется наемный транспорт |
| `hiredCarCounterpartyId` | `long?` | ID перевозчика наемного транспорта |
| `hiredCarId` | `long?` | ID наемного транспорта |
| `hiredTrailerId` | `long?` | ID прицепа наемного транспорта |
| `hiredDriverId` | `long?` | ID водителя наемного транспорта |
| `hiredCarPrice` | `double?` | Стоимость наемного транспорта |
| `isHiredCarVatTop` | `boolean` | НДС сверху по наемному транспорту |
| `hiredCarNdsTypeId` | `long?` | Тип НДС наемного транспорта |
| `hiredCarPaymentTypeId` | `long?` | Тип оплаты перевозчику |
| `hiredCarPaymentPeriodInDays` | `int?` | Срок оплаты перевозчику |
| `hiredCarCompletedAtOffset` | `date-time?` | Ручная дата выполнения со смещением часового пояса |
| `hiredCarCompletedAt` | `date-time?` | Ручная дата выполнения |
| `lastSyncStatus` | `SyncEntityStatus` | Последний статус синхронизации |
| `legalPersonId` | `long?` | ID юридического лица |
| `isMandatory` | `boolean` | Обязательный заказ |
| `isDeleted` | `boolean` | Заказ удален |
| `createDocumentAssignment` | `boolean` | Создавать задание сдачи документов после завершения |
| `extendedProperties` | `ExtendedPropertyJsonObject[]?` | Дополнительные поля |
| `hiredCarCounterparty` | `CounterpartyViewModel?` | Перевозчик наемного транспорта |
| `hiredCar` | `HiredVehicleViewModel?` | Наемный транспорт |
| `hiredTrailer` | `HiredVehicleViewModel?` | Прицеп наемного транспорта |
| `hiredDriver` | `HiredDriverViewModel?` | Водитель наемного транспорта |
| `cargos` | `CargoModel[]?` | Грузы |
| `bidPoints` | `DistributionBidPointViewModel[]?` | Точки заказа |
| `typeOptions` | `TypeOptionModel[]?` | Пользовательские справочники и настраиваемые опции |
| `hasUploadedFile` | `boolean` | Загружен файл заказа |
| `isPreBid` | `boolean` | Предзаявка |
| `accessPermitIds` | `long[]?` | Допуски и разрешения |

### Поля `extendedProperties[]`

`extendedProperties` содержит пользовательские дополнительные поля заказа.

| Поле | Тип | Описание |
|---|---|---|
| `propertyName` | `string` | Имя пользовательского поля |
| `value` | `string?` | Значение, заданное пользователем |

### Поля `typeOptions[]`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID элемента пользовательского справочника |
| `entityOptionId` | `long` | ID настройки/свойства справочника |

Чтобы получить значение элемента, запросите `GET /api/Catalogs/GetItems?$filter=id eq {typeOptions[].id}`. Подробнее: [Пользовательские справочники](./custom-catalogs.md).

---

### 2.2. Получение статусов внешних заказов

```http
GET /api/distributionbids/getlistforexternalstatuses
```

### Назначение

Получение заказов по идентификаторам с информацией о статусах (для сценариев экспедиции).

### Параметры

- `Ids` — массив идентификаторов заказов;
- `$filter`, `$orderBy`, `$top`, `$skip`, `$count`, `$select`, `$expand` — как в методе `getlist`.

Ответ — массив `ExternalDistributionBidStatusModel`.

---

## 3. Получение одного заказа

### 3.1. Получение заказа по идентификатору

```http
GET /api/distributionbids/get/{id}
```

### Параметры

- `id` — идентификатор заказа (path-параметр).

Ответ — `DistributionBidViewModel`.

---

### 3.2. Получение заказа по заявке

```http
GET /api/distributionbids/getforbid/{id}
```

### Параметры

- `id` — идентификатор заявки.

Ответ — модель заказа, связанного с указанной заявкой.

---

## 4. Управление жизненным циклом заказа

### 4.1. Отмена заказа

```http
POST /api/distributionbids/cancel
```

### Тело запроса

```json
{
  "id": 0,
  "comment": "Причина отмены"
}
```

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | ID заказа на распределение |
| `comment` | `string?` | Нет | Комментарий или причина отмены, если используется в подключении |

---

### 4.2. Удаление заказа

```http
POST /api/distributionbids/delete
```

### Назначение

Удаление заказа, если по нему не создана заявка.

### Тело запроса

```json
{
  // DistributionBidDeleteModel
}
```

---

### 4.3. Восстановление удалённого заказа

```http
POST /api/distributionbids/restore
```

### Тело запроса

```json
{
  // DistributionBidRestoreModel
}
```

---

### 4.4. Возврат отменённого заказа

```http
POST /api/distributionbids/revert
```

### Назначение

Возвращает отменённый заказ в исходный статус («Без заявки»).

### Тело запроса

```json
{
  // DistributionBidRevertModel
}
```

---

## 5. Сводная таблица методов

| Метод | Описание |
|-------|----------|
| `POST /api/DistributionBids/Apply` | Создание и обновление заказов на распределение |
| `GET /api/DistributionBids/GetListForExternal` | Список заказов для внешней синхронизации |
| `GET /api/DistributionBids/GetListForExternalStatuses` | Получение статусов внешних заказов |
| `GET /api/DistributionBids/Get/{id}` | Получение одного заказа по ID |
| `GET /api/DistributionBids/GetForBid/{id}` | Получение заказа по ID заявки |
| `POST /api/DistributionBids/Cancel` | Отмена заказа |
| `POST /api/DistributionBids/Delete` | Удаление заказа |
| `POST /api/DistributionBids/Restore` | Восстановление удаленного заказа |
| `POST /api/DistributionBids/Revert` | Возврат отмененного заказа |
