# Orders API

Раздел описывает методы создания и получения заказов для сценария грузоотправителя/экспедитора.

---

## 1. Создание или обновление заказа

```http
POST /api/Orders/Apply
```

Метод создает новый заказ или обновляет существующий.

### Основные поля запроса

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | `0` для создания нового заказа |
| `organizationId` | `long` | ID организации владельца заказа |
| `points` | `ApplyOrderPointModel[]` | Точки маршрута |
| `orderPriceType` | `OrderPriceType` | Тип цены: фикс, аукцион или предложение цены |
| `orderCost` | `double?` | Стоимость заказа |
| `accessType` | `OrderAccessType?` | Видимость заказа |
| `visibleForOrganizationsIds` | `long[]` | Перевозчики, которым виден заказ |
| `trailerTypeIds` | `long[]` | Требуемые типы прицепов |
| `contactPersonName` | `string` | Контактное лицо |
| `contactPersonPhoneNumber` | `string` | Телефон контакта |
| `externalId` | `string` | ID во внешней системе |
| `externalInternalId` | `string` | Дополнительный внешний номер |

### Пример

```json
{
  "id": 0,
  "withoutMatching": false,
  "requireHealthBook": false,
  "carryingCapacity": 0,
  "trucksCount": 1,
  "orderCost": 80000,
  "orderPriceType": 10,
  "points": [
    {
      "id": 0,
      "index": 0,
      "pointType": 10,
      "location": {
        "id": 0,
        "latitude": 55.74703593862486,
        "longitude": 37.61660648499558,
        "state": "Москва",
        "city": "Москва",
        "address": "Москва, Софийская набережная, 14с1"
      },
      "planEnterTime": "2026-07-01T10:00:00"
    },
    {
      "id": 0,
      "index": 1,
      "pointType": 20,
      "location": {
        "id": 0,
        "latitude": 55.785990125631436,
        "longitude": 49.20877539587499,
        "state": "Республика Татарстан",
        "city": "Казань",
        "address": "Республика Татарстан, Казань"
      },
      "planEnterTime": "2026-07-02T10:00:00"
    }
  ],
  "accessType": 30,
  "visibleForOrganizationsIds": [33352, 33277],
  "trailerTypeIds": [1],
  "ndsTypeId": 3,
  "paymentTypeId": 1,
  "contactPersonName": "Имя",
  "contactPersonPhoneNumber": "79999999999",
  "cargoCost": 3000000,
  "isInternal": false,
  "organizationId": 33249
}
```

---

## 2. Получение списка заказов для интеграции

```http
GET /api/Orders/GetIntegrationList
```

Метод возвращает список заказов текущей организации для интеграции.

### Query-параметры

| Параметр | Описание |
|---|---|
| `$filter` | Фильтр |
| `$orderby` | Сортировка |
| `$top` | Количество записей |
| `$skip` | Смещение |

### Пример

```http
GET /api/Orders/GetIntegrationList?$filter=updatedAt ge 2026-06-01T00:00:00.000Z&$top=100
```

### Ответ

```json
{
  "data": [],
  "totalCount": 0
}
```

Элементы `data[]` содержат основные поля заказа, включая `id`, `status`, `bidStatus`, `updatedAt`, `points`, `transporter`, `truck`, `driver`, `trailer`.

---

## 3. Получение деталей заказа

```http
GET /api/Orders/GetInfo?Id={order_id}
```

Метод возвращает полную карточку заказа.

Ключевые поля ответа:

| Поле | Описание |
|---|---|
| `id` | ID заказа |
| `status` | Статус заказа |
| `bidStatus` | Статус заявки |
| `points` | Точки маршрута |
| `matchingCars` | Отклики перевозчиков |
| `auction` | Данные аукциона |
| `orderTruckMatchingId` | ID выбранного отклика |
| `transporterInfo` | Информация о перевозчике |
| `truckNumber` | Номер ТС |
| `driverFullName` | ФИО водителя |
| `factEnterTimeOffset`, `factLeaveTimeOffset` | Фактические времена в точках |

---

## 4. Связанные разделы

- [Жизненный цикл заказа](./order-lifecycle.md)
- [Отклики и выбор перевозчика](./order-responses.md)
- [Справочники](./directories.md)
