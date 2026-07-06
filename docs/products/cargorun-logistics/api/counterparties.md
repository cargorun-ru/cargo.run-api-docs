# Контрагенты API

Раздел описывает работу с контрагентами CARGO.RUN Логистика: создание, удаление, получение списка и одного элемента, а также работу с договорами и адресами/точками контрагента.

Контрагенты используются в заявках и заказах через поля `counterpartyId`, `cargoOwnerDictionaryItemId`, `contractId` и связанные адресные точки.

---

## 1. Контрагенты

### 1.1. Создание или обновление контрагента

```http
POST /api/CargoOwnerDictionary/Apply
```

Метод создает нового контрагента или обновляет существующего.

Если `id = 0`, создается новый контрагент. Если `id` содержит ID существующего контрагента, метод обновляет его данные.

#### Основные поля запроса `CounterpartyEditModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | `0` для создания, ID контрагента для обновления |
| `name` | `string?` | Наименование |
| `inn` | `string?` | ИНН |
| `kpp` | `string?` | КПП |
| `ogrn` | `string?` | ОГРН |
| `address` | `string?` | Юридический адрес полностью |
| `city`, `street`, `houseNumber` | `string?` | Части юридического адреса |
| `mailingAddress` | `string?` | Почтовый адрес |
| `settlementAccount` | `string?` | Расчетный счет |
| `correspondentAccount` | `string?` | Корреспондентский счет |
| `bankName` | `string?` | Название банка |
| `bankId` | `string?` | БИК |
| `counterpartyGroupId` | `long?` | ID группы контрагентов |
| `comment` | `string?` | Комментарий |
| `management` | `Management?` | Руководитель |
| `contactPerson` | `CounterpartyContactPersonModel?` | Контактное лицо |
| `documents` | `CounterpartyDocumentModel[]?` | Документы |
| `platforms` | `CounterpartyPlatformModel[]?` | Площадки/платформы |
| `noteForDrivers` | `string?` | Примечание для водителей |
| `analyzeStrictOffsetHours` | `int?` | Смещение для учета посещений точки |
| `status` | `CounterpartyStatus?` | Статус контрагента |
| `isInsolvent` | `boolean` | Контрагент неплатежеспособен |
| `insolvencyComment` | `string?` | Комментарий о неплатежеспособности |

#### Пример

```json
{
  "id": 0,
  "name": "ООО \"Грузополучатель\"",
  "inn": "1234567890",
  "kpp": "123456789",
  "ogrn": "1234567890123",
  "address": "г. Москва, ул. Примерная, д. 1",
  "mailingAddress": "г. Москва, ул. Примерная, д. 1",
  "bankName": "АО \"Банк\"",
  "bankId": "044525000",
  "settlementAccount": "40702810000000000000",
  "correspondentAccount": "30101810000000000000",
  "isInsolvent": false,
  "contactPerson": {
    "firstName": "Иван",
    "lastName": "Иванов",
    "phoneNumber": "79999999999",
    "email": "client@example.com"
  }
}
```

### 1.2. Получение списка контрагентов

```http
GET /api/CargoOwnerDictionary/Get
```

Метод возвращает список контрагентов в OData-формате. Общее количество записей приходит в заголовке `X-MetaCount`.

#### Query-параметры

| Параметр | Описание |
|---|---|
| `withDeleted` | Включить удаленных контрагентов |
| `onlyInsolvent` | Вернуть только неплатежеспособных контрагентов |
| `$filter` | Фильтр по полям модели, например `Id eq 1` |
| `$orderby` | Сортировка, например `CreatedAt desc` |
| `$top` | Количество записей |
| `$skip` | Смещение |
| `$count` | Запросить количество записей |

#### Основные поля ответа `CounterpartyListModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID контрагента |
| `name` | `string?` | Наименование |
| `inn` | `string?` | ИНН |
| `kpp` | `string?` | КПП |
| `email` | `string?` | Email организации |
| `hasAccess` | `boolean` | Есть доступ к просмотру заявок |
| `linkedOrganizationId` | `long?` | ID прикрепленной организации |
| `comment` | `string?` | Комментарий |
| `status` | `CounterpartyStatus` | Статус контрагента |
| `insolvencyRegistryEntry` | `InsolvencyRegistryEntryGetModel?` | Данные из реестра неплатежеспособности |
| `counterpartyGroupId` | `long?` | ID группы контрагента |
| `counterpartyGroupName` | `string?` | Название группы контрагента |
| `documents` | `CounterpartyDocumentModel[]?` | Документы |
| `points` | `CounterpartyPointModel[]?` | Точки/адреса контрагента |
| `isDeleted` | `boolean` | Контрагент удален |

### 1.3. Получение одного контрагента

```http
GET /api/CargoOwnerDictionary/Get({id})
```

Метод возвращает карточку контрагента по ID.

#### Параметры

| Параметр | Тип | Описание |
|---|---|---|
| `id` | `long` | ID контрагента в path |

#### Основные поля ответа `CounterpartyModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID контрагента |
| `isDeleted` | `boolean` | Контрагент удален |
| `name`, `inn`, `kpp`, `ogrn` | `string?` | Реквизиты контрагента |
| `address`, `mailingAddress` | `string?` | Юридический и почтовый адрес |
| `city`, `street`, `houseNumber` | `string?` | Части адреса |
| `email` | `string?` | Email организации |
| `management` | `Management?` | Руководитель |
| `bankName`, `bankId` | `string?` | Банк и БИК |
| `settlementAccount`, `correspondentAccount` | `string?` | Расчетный и корреспондентский счет |
| `regionId` | `long?` | ID региона |
| `flags` | `CounterpartyFlag` | Флаги контрагента |
| `type` | `CounterpartyType` | Тип контрагента |
| `contactPerson` | `CounterpartyContactPersonModel?` | Контактное лицо |
| `hasAccess` | `boolean` | Есть доступ к просмотру заявок |
| `linkedOrganizationId` | `long?` | ID прикрепленной организации |
| `comment` | `string?` | Комментарий |
| `noteForDrivers` | `string?` | Примечание для водителей |
| `status` | `CounterpartyStatus` | Статус |
| `isInsolvent` | `boolean` | Контрагент неплатежеспособен |
| `insolvencyComment` | `string?` | Комментарий о неплатежеспособности |
| `counterpartyGroupId`, `counterpartyGroupName` | `long?`, `string?` | Группа контрагента |
| `documents` | `CounterpartyDocumentModel[]?` | Документы |
| `points` | `CounterpartyPointModel[]?` | Точки/адреса |
| `platforms` | `CounterpartyPlatformModel[]?` | Площадки |
| `documentTemplates` | `CounterpartyDocumentTemplateModel[]?` | Шаблоны документов |

### 1.4. Удаление контрагента

```http
POST /api/CargoOwnerDictionary/Delete
```

Метод удаляет контрагента, если это не запрещено бизнес-правилами.

#### Тело запроса `CounterpartyDeleteModel`

```json
{
  "id": 57398
}
```

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID контрагента |

---

## 2. Договоры контрагентов

Договоры привязаны к контрагенту и используются в заявках/заказах через `contractId`.

### 2.1. Создание или обновление договора

```http
POST /api/CargoOwnerDictionary/ApplyContract
```

Если `id = 0`, создается новый договор. Если `id` содержит ID договора, метод обновляет существующий договор.

#### Поля запроса `CounterpartyContractEditModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | `0` для создания, ID договора для обновления |
| `counterpartyId` | `long` | ID контрагента |
| `legalPersonId` | `long` | ID организации/юридического лица |
| `name` | `string?` | Название договора |
| `number` | `string?` | Номер договора |
| `date` | `date` | Дата договора |
| `settlementCurrency` | `string?` | Валюта взаиморасчетов |
| `billingOptionId` | `long?` | Вариант выставления счета |
| `invoiceTriggerType` | `InvoiceTriggerType?` | Основание для выставления счета |
| `paymentPeriod` | `int?` | Срок оплаты |
| `paymentTypeId` | `long?` | Тип оплаты |
| `paymentPeriodType` | `PaymentPeriodType?` | Вариант срока оплаты |
| `debtCeiling` | `double?` | Лимит задолженности |
| `currentDebt` | `double?` | Текущая задолженность |
| `isMain` | `boolean?` | Основной договор |

#### Пример

```json
{
  "id": 0,
  "counterpartyId": 57398,
  "legalPersonId": 95143,
  "name": "Основной договор",
  "number": "Д-100",
  "date": "2026-07-01",
  "settlementCurrency": "RUB",
  "paymentPeriod": 10,
  "paymentTypeId": 1,
  "isMain": true
}
```

### 2.2. Получение списка договоров

```http
GET /api/CargoOwnerDictionary/GetContracts?counterpartyId={counterparty_id}
```

Метод возвращает список договоров контрагента в OData-формате.

#### Query-параметры

| Параметр | Описание |
|---|---|
| `counterpartyId` | ID контрагента |
| `$filter` | Фильтр по полям модели |
| `$orderby` | Сортировка |
| `$top` | Количество записей |
| `$skip` | Смещение |
| `$count` | Запросить количество записей |

### 2.3. Получение одного договора

```http
GET /api/CargoOwnerDictionary/GetContract?counterpartyId={counterparty_id}&contractId={contract_id}
```

#### Параметры

| Параметр | Тип | Описание |
|---|---|---|
| `counterpartyId` | `long` | ID контрагента |
| `contractId` | `long` | ID договора |

#### Поля ответа `CounterpartyContractModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID договора |
| `name` | `string?` | Название договора |
| `number` | `string?` | Номер договора |
| `date` | `date` | Дата договора |
| `settlementCurrency` | `string?` | Валюта взаиморасчетов |
| `billingOptionId` | `long?` | Вариант выставления счета |
| `invoiceTriggerType` | `InvoiceTriggerType?` | Основание для выставления счета |
| `legalPersonId` | `long?` | ID организации/юридического лица |
| `legalPersonName` | `string?` | Название организации/юридического лица |
| `paymentPeriod` | `int?` | Срок оплаты |
| `paymentPeriodType` | `PaymentPeriodType?` | Вариант срока оплаты |
| `paymentTypeId` | `long?` | Тип оплаты |
| `debtCeiling` | `double?` | Лимит задолженности |
| `currentDebt` | `double?` | Текущая задолженность |
| `isMain` | `boolean` | Основной договор |

### 2.4. Удаление договора

```http
POST /api/CargoOwnerDictionary/DeleteContract
```

#### Тело запроса `CounterpartyContractDeleteModel`

```json
{
  "id": 100500,
  "counterpartyId": 57398
}
```

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID договора |
| `counterpartyId` | `long` | ID контрагента |

---

## 3. Адреса и точки контрагентов

Точки контрагента используются для сохранения часто используемых адресов погрузки, выгрузки или складов.

### 3.1. Создание или обновление точки

```http
POST /api/CargoOwnerDictionary/ApplyCounterpartyPoint
```

#### Поля запроса `CounterpartyPointEditModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | `0` для создания, ID точки для обновления |
| `counterpartyId` | `long` | ID контрагента |
| `organizationId` | `long` | ID организации |
| `name` | `string?` | Наименование точки |
| `client` | `string?` | Клиент |
| `geozone` | `MapObjectEditModel` | Геоданные точки |
| `lastUsedAt` | `date-time` | Дата последнего использования |

#### Основные поля `geozone`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID геообъекта |
| `location` | `PointEditModel` | Координаты |
| `address` | `string?` | Полный адрес |
| `city`, `village`, `state`, `county`, `street`, `houseNumber` | `string?` | Компоненты адреса |
| `federalDistrict` | `string?` | Федеральный округ |
| `coordinates` | `array?` | Координаты полигона |
| `radius` | `double?` | Радиус |
| `type` | `MapObjectType` | Тип точки |

### 3.2. Получение списка точек

```http
GET /api/CargoOwnerDictionary/GetCounterpartyPoints?counterpartyId={counterparty_id}
```

Метод возвращает список точек контрагента в OData-формате.

### 3.3. Получение одной точки

```http
GET /api/CargoOwnerDictionary/GetCounterpartyPoint/{id}
```

#### Поля ответа `CounterpartyPointModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID точки |
| `counterpartyId` | `long` | ID контрагента |
| `name` | `string?` | Наименование |
| `client` | `string?` | Клиент |
| `geozone` | `MapObjectModel` | Геоданные точки |
| `lastUsedAt` | `date-time` | Дата последнего использования |

### 3.4. Удаление точки

```http
POST /api/CargoOwnerDictionary/DeleteCounterpartyPoint
```

#### Тело запроса `CounterpartyPointDeleteModel`

```json
{
  "id": 2435200
}
```

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID точки контрагента |

### 3.5. Восстановление точки

```http
POST /api/CargoOwnerDictionary/RestoreCounterpartyPoint
```

Метод восстанавливает ранее удаленную точку контрагента.
