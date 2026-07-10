# Counterparties API

Раздел описывает работу с контрагентами в CARGO.RUN Загрузки. Контрагенты используются как заказчики и участники заказа: при создании заказа их ID передается в `counterpartyId`, а сохраненные адреса и контактные лица можно использовать для заполнения карточки заказа.

---

## 1. Контрагенты

### 1.1. Создание или обновление контрагента

```http
POST /api/Counterparty/Apply
```

Метод создает нового контрагента или обновляет существующего.

Если `id = 0`, создается новый контрагент. Если `id` содержит ID существующего контрагента, метод обновляет его данные.

### Важные правила

- Для юридических лиц проверяется уникальность пары `inn + kpp`.
- Для ИП проверяется уникальность по `inn`, поле `kpp` не используется.
- Длина `inn` валидируется:
  - 10 символов для юридического лица;
  - 12 символов для ИП.
- При создании или редактировании можно передать `responsibleId`. Если заказ по этому контрагенту создается из внешней торговой площадки, указанный сотрудник становится ответственным по заказу.

ID ответственного сотрудника можно брать из справочника пользователей, например из `GET /api/Orders/SelectAuthorByOrganizationList`.

### Поля запроса `CounterpartyApplyModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | `0` для создания, ID контрагента для обновления |
| `name` | `string?` | Наименование контрагента |
| `inn` | `string?` | ИНН |
| `kpp` | `string?` | КПП. Для ИП не используется |
| `isIndividualEntrepreneur` | `boolean?` | Контрагент является ИП |
| `contactPersonName` | `string?` | Основное контактное лицо |
| `contactPersonPhoneNumber` | `string?` | Телефон основного контактного лица |
| `responsibleId` | `long?` | ID ответственного сотрудника |
| `sourceType` | `SourceType?` | Источник контрагента |

### Пример

```json
{
  "id": 0,
  "name": "ООО \"Делаем загрузки\"",
  "inn": "1234567890",
  "kpp": "123456789",
  "isIndividualEntrepreneur": false,
  "contactPersonName": "Иван Иванов",
  "contactPersonPhoneNumber": "79999999999",
  "responsibleId": 6092802,
  "sourceType": 90
}
```

### 1.2. Получение списка контрагентов

```http
GET /api/Counterparty/List
```

Метод возвращает список контрагентов текущей организации.

### Query-параметры

| Параметр | Описание |
|---|---|
| `$filter` | Фильтр по полям модели |
| `$orderby` | Сортировка |
| `$top` | Количество записей |
| `$skip` | Смещение |

### Поля ответа `CounterpartyListModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID контрагента |
| `inn` | `string?` | ИНН |
| `kpp` | `string?` | КПП |
| `name` | `string?` | Наименование |
| `contactPersonName` | `string?` | Основное контактное лицо |
| `contactPersonPhoneNumber` | `string?` | Телефон основного контактного лица |
| `registeredOrganizationId` | `long?` | ID зарегистрированной организации CARGO.RUN |
| `sourceType` | `SourceType` | Источник контрагента |
| `isActive` | `boolean` | Контрагент активен |
| `isIndividualEntrepreneur` | `boolean` | Контрагент является ИП |
| `isInBlacklist` | `boolean` | Устаревший признак черного списка |
| `trust` | `CounterpartyTrust?` | Надежность контрагента. Новое поле вместо `isInBlacklist` |
| `cargorunId` | `long?` | ID контрагента в CARGO.RUN |

### 1.3. Получение одного контрагента

```http
GET /api/Counterparty/GetForView?Id={counterparty_id}
```

Метод возвращает карточку контрагента для просмотра.

### Поля ответа `CounterpartyViewModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID контрагента |
| `inn` | `string?` | ИНН |
| `kpp` | `string?` | КПП |
| `name` | `string?` | Наименование |
| `contactPersonName` | `string?` | Основное контактное лицо |
| `contactPersonPhoneNumber` | `string?` | Телефон основного контактного лица |
| `currentDebtLimit` | `double?` | Текущий лимит задолженности |
| `isActive` | `boolean` | Контрагент активен |
| `isIndividualEntrepreneur` | `boolean` | Контрагент является ИП |
| `isInBlacklist` | `boolean` | Устаревший признак черного списка |
| `trust` | `CounterpartyTrust?` | Надежность контрагента. Новое поле вместо `isInBlacklist` |

Для получения модели редактирования используйте:

```http
GET /api/Counterparty/GetForEdit?Id={counterparty_id}
```

Метод возвращает `CounterpartyApplyModel`.

### 1.4. Удаление контрагента

```http
POST /api/Counterparty/Delete?Id={counterparty_id}
```

Метод удаляет контрагента по ID. Удаление может быть ограничено бизнес-правилами, если контрагент используется в заказах или связанных сущностях.

---

## 2. Адреса контрагентов

Адреса контрагентов хранятся в `CounterpartyLocations`. Их можно использовать как сохраненные точки погрузки или выгрузки.

### 2.1. Создание или обновление адреса

```http
POST /api/CounterpartyLocations/Apply
```

### Поля запроса `CounterpartyLocationApplyModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | `0` для создания, ID адреса для обновления |
| `name` | `string?` | Название адреса |
| `counterpartyId` | `long` | ID контрагента |
| `location` | `MapObjectApplyModel?` | Адрес и координаты |

### Основные поля `location`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID геообъекта |
| `latitude` | `double?` | Широта |
| `longitude` | `double?` | Долгота |
| `state` | `string?` | Регион |
| `county` | `string?` | Район |
| `federalDistrict` | `string?` | Федеральный округ |
| `city` | `string?` | Город |
| `village` | `string?` | Населенный пункт |
| `street` | `string?` | Улица |
| `houseNumber` | `string?` | Дом |
| `address` | `string?` | Полный адрес |

### Пример

```json
{
  "id": 0,
  "name": "Склад Москва",
  "counterpartyId": 57398,
  "location": {
    "id": 0,
    "latitude": 55.747035,
    "longitude": 37.616606,
    "state": "Москва",
    "city": "Москва",
    "address": "Москва, Софийская набережная, 14с1"
  }
}
```

### 2.2. Получение списка адресов

```http
GET /api/CounterpartyLocations/List
```

Для интеграционного сценария доступен отдельный список:

```http
GET /api/CounterpartyLocations/ListForIntegrator
```

Оба метода поддерживают `$filter`, `$orderby`, `$top`, `$skip`.

### Поля ответа `CounterpartyLocationListModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID адреса |
| `counterpartyName` | `string?` | Наименование контрагента |
| `name` | `string?` | Название адреса |
| `location` | `MapObjectViewModel?` | Адрес и координаты |
| `updatedAt` | `date-time` | Дата последнего изменения |
| `isDeleted` | `boolean` | Адрес удален |
| `organizationName` | `string?` | Организация, поле есть в интеграторской модели |

### 2.3. Получение одного адреса

```http
GET /api/CounterpartyLocations/GetForView?Id={location_id}
GET /api/CounterpartyLocations/GetForViewIntegrator?Id={location_id}
```

### Поля ответа

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID адреса |
| `counterpartyName` | `string?` | Наименование контрагента |
| `name` | `string?` | Название адреса |
| `address` | `string?` | Полный адрес |
| `latitude` | `double` | Широта |
| `longitude` | `double` | Долгота |
| `updatedAt` | `date-time` | Дата изменения |
| `createdAt` | `date-time` | Дата создания |
| `isDeleted` | `boolean` | Адрес удален |
| `organizationName` | `string?` | Организация, поле есть в интеграторской модели |

### 2.4. Удаление адреса

```http
POST /api/CounterpartyLocations/Delete?Id={location_id}
```

---

## 3. Контактные лица заказчика

Контактные лица заказчика хранятся в `CounterpartyContactPeople`.

### 3.1. Создание или обновление контактного лица

```http
POST /api/CounterpartyContactPeople/Apply
```

### Поля запроса `CounterpartyContactPersonApplyModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | `0` для создания, ID контактного лица для обновления |
| `counterpartyId` | `long?` | ID контрагента |
| `firstName` | `string?` | Имя |
| `lastName` | `string?` | Фамилия |
| `patronymic` | `string?` | Отчество |
| `phoneNumber` | `string?` | Телефон |
| `email` | `string?` | Email |
| `position` | `string?` | Должность |
| `order` | `int` | Порядок отображения |
| `cargorunCounterparty` | `CargorunOrderCounterpartyModel?` | Связанный контрагент CARGO.RUN |

### 3.2. Получение списка контактных лиц

```http
GET /api/CounterpartyContactPeople/List
GET /api/CounterpartyContactPeople/SelectListByCounterpartyId?CounterpartyId={counterparty_id}
```

### Поля ответа `CounterpartyContactPersonListModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID контактного лица |
| `counterpartyId` | `long` | ID контрагента |
| `counterpartyOrganizationName` | `string?` | Организация контрагента |
| `counterpartyName` | `string?` | Наименование контрагента |
| `firstName` | `string?` | Имя |
| `lastName` | `string?` | Фамилия |
| `patronymic` | `string?` | Отчество |
| `phoneNumber` | `string?` | Телефон |
| `email` | `string?` | Email |
| `position` | `string?` | Должность |
| `order` | `int` | Порядок отображения |
| `isDeleted` | `boolean` | Контакт удален |

### 3.3. Получение одного контактного лица

```http
GET /api/CounterpartyContactPeople/GetForView?Id={contact_person_id}&IsNew=false
```

Для формы редактирования:

```http
GET /api/CounterpartyContactPeople/GetForEdit?Id={contact_person_id}&IsNew=false
```

### 3.4. Удаление контактного лица

```http
POST /api/CounterpartyContactPeople/Delete?Id={contact_person_id}&IsNew=false
```

---

## 4. Надежность контрагента

Ранее для черного списка использовались методы:

```http
POST /api/Counterparty/ApplyIsInBlacklist
GET /api/Counterparty/GetIsInBlacklist?Id={counterparty_id}
```

Эти методы считаются устаревшими. Для управления показателями надежности контрагента используйте методы:

```http
POST /api/Counterparty/ApplyTrust
GET /api/Counterparty/GetTrust?Id={counterparty_id}
```

### Тело запроса `ApplyTrust`

```json
{
  "id": 12,
  "trust": 10
}
```

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID контрагента |
| `trust` | `CounterpartyTrust` | Надежность контрагента |

### Значения `trust`

| Значение | Описание |
|---:|---|
| `0` | Надежный |
| `10` | Требует проверки |
| `20` | Ненадежный |

Поле `isInBlacklist` в `List` и `GetForView` также считается устаревшим. Для новых интеграций используйте поле `trust`.

---

## 5. Лимиты задолженности

### 5.1. Установка лимита

```http
POST /api/Counterparty/ApplyDebtLimit
```

### Тело запроса `CounterpartyDebtLimitApplyModel`

```json
{
  "id": 57398,
  "currentDebtLimit": 1000000
}
```

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID контрагента |
| `currentDebtLimit` | `double?` | Текущий лимит задолженности |

### 5.2. Получение лимита

```http
GET /api/Counterparty/GetDebtLimit?Id={counterparty_id}
```

### Ответ `CounterpartyDebtLimitModel`

```json
{
  "currentDebtLimit": 1000000
}
```

| Поле | Тип | Описание |
|---|---|---|
| `currentDebtLimit` | `double?` | Текущий лимит задолженности |
