# Пользовательские справочники API

Пользовательские, или кастомные, справочники — это несистемные справочники, которые клиент создает в своем аккаунте CARGO.RUN. Они используются только внутри организации клиента и могут быть привязаны к заявкам или заказам.

В выгрузке заявок и заказов такие значения приходят в массиве `typeOptions`.

---

## 1. Как связаны `typeOptions` и справочники

В методах:

```http
GET /api/bids/GetListForExternal
GET /api/DistributionBids/GetListForExternal
```

может приходить массив:

```json
{
  "typeOptions": [
    {
      "id": 129619121,
      "entityOptionId": 126364242
    }
  ]
}
```

Поля `TypeOptionModel`:

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID элемента справочника |
| `entityOptionId` | `long` | ID настройки/свойства справочника, к которому относится значение |

Чтобы получить текстовое значение элемента справочника, используйте `id` из `typeOptions[]` и запросите элемент через `GET /api/Catalogs/GetItems`.

```http
GET /api/Catalogs/GetItems?$filter=id eq 129619121
```

В ответе будет элемент справочника, где значение лежит в `displayName`.

---

## 2. Получение списка справочников

```http
GET /api/Catalogs/GetCatalogs
```

Метод возвращает список доступных справочников, включая пользовательские справочники организации. Поддерживает OData-фильтры и пагинацию.

### Query-параметры

| Параметр | Описание |
|---|---|
| `$filter` | Фильтр по полям модели |
| `$orderby` | Сортировка |
| `$top` | Количество записей |
| `$skip` | Смещение |
| `$count` | Запросить количество |

### Основные поля `CatalogListModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID справочника |
| `displayName` | `string?` | Название справочника |
| `propertyName` | `string?` | Системное имя свойства |
| `type` | `CatalogType?` | Тип справочника |
| `entityType` | `EntityType?` | Тип сущности, к которой относится справочник |
| `entityOptions` | `CatalogEntityOptionModel[]?` | Настройки привязки к сущностям |
| `flags` | `CatalogFlag` | Флаги справочника |
| `intFlags` | `int` | Числовое представление флагов |
| `organizationId` | `long?` | ID организации, если справочник пользовательский |
| `description` | `string?` | Описание |
| `externalId` | `string?` | Внешний ID |
| `version` | `uuid?` | Версия справочника |

---

## 3. Получение элементов справочника

```http
GET /api/Catalogs/GetItems
```

Метод возвращает элементы справочников. Для получения одного значения из `typeOptions[]` фильтруйте по `id` элемента.

### Пример получения значения по ID элемента

```http
GET /api/Catalogs/GetItems?$filter=id eq 129619121
```

### Пример получения элементов конкретного справочника

Если во внешней системе хранится ID справочника, можно фильтровать элементы по полям, которые включены в настройки конкретного клиента. Для точного значения из `GetListForExternal` достаточно запроса по `id`.

### Основные поля `CatalogListItemSimpleViewModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID элемента справочника |
| `displayName` | `string?` | Значение элемента, которое нужно показывать пользователю |
| `propertyName` | `string?` | Системное имя |
| `isDeleted` | `boolean` | Элемент удален |
| `isHidden` | `boolean` | Элемент скрыт |
| `externalId` | `string?` | Внешний ID элемента |

---

## 4. Получение справочников вместе с элементами

```http
GET /api/Catalogs/Get
GET /api/Catalogs/GetSimple
```

Оба метода возвращают справочники с вложенным массивом `items`.

`GetSimple` дополнительно поддерживает параметр:

| Параметр | Описание |
|---|---|
| `showObsolete` | Показывать устаревшие значения |

### Основные поля `CatalogListWithItemsModel`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID справочника |
| `displayName` | `string?` | Название справочника |
| `propertyName` | `string?` | Системное имя свойства |
| `organizationId` | `long?` | ID организации для пользовательского справочника |
| `description` | `string?` | Описание |
| `externalId` | `string?` | Внешний ID справочника |
| `items` | `CatalogListItemSimpleModel[]?` | Элементы справочника |

### Основные поля `items[]`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID элемента |
| `displayName` | `string?` | Значение элемента |
| `propertyName` | `string?` | Системное имя |
| `isDeleted` | `boolean` | Элемент удален |
| `isHidden` | `boolean` | Элемент скрыт |
| `options` | `object?` | Дополнительные свойства элемента |
| `itemEntityOptions` | `CatalogItemEntityOptionSimpleModel[]?` | Привязки элемента к настройкам сущностей |

---

## 5. Рекомендуемый алгоритм для интеграции

1. Получить заявки или заказы через `GET /api/bids/GetListForExternal` или `GET /api/DistributionBids/GetListForExternal`.
2. В каждом объекте проверить массив `typeOptions`.
3. Для каждого элемента взять `typeOptions[].id`.
4. Получить значение справочника:

```http
GET /api/Catalogs/GetItems?$filter=id eq {typeOptions[].id}
```

5. Использовать `displayName` из ответа как человекочитаемое значение.

Пример:

```json
{
  "typeOptions": [
    {
      "id": 129619121,
      "entityOptionId": 126364242
    }
  ]
}
```

Запрос:

```http
GET /api/Catalogs/GetItems?$filter=id eq 129619121
```

Ответ:

```json
[
  {
    "id": 129619121,
    "displayName": "Значение справочника",
    "propertyName": null,
    "isDeleted": false,
    "isHidden": false,
    "externalId": null
  }
]
```
