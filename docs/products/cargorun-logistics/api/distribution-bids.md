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
- `$count`, `$select`, `$expand` — как описано в swagger.

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

Тело описано моделью `DistributionBidCancelModel` и содержит идентификатор заказа и дополнительные параметры, указанные в swagger.

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
