# Transporter API

Раздел описывает основные методы для сценария перевозчика.

---

## 1. Получение доступных заказов

```http
GET /api/TransporterOrders/GetList
```

Метод возвращает заказы, доступные текущей организации перевозчика.

Поддерживает:

- `$filter`;
- `$orderby`;
- `$top`;
- `$skip`.

### Ответ

```json
{
  "data": [
    {
      "id": 1552780,
      "addressFrom": "Ростовская область, Аксайский район, улица Логопарк, 5",
      "addressTo": "Ростовская область, Аксай, улица Авиаторов, 5",
      "loadStart": "2026-07-01T15:15:00+03:00",
      "unloadStart": "2026-07-02T08:15:00+03:00",
      "organizationName": "ltgf",
      "organizationId": 95143,
      "distanceKm": 30.5,
      "trailerTypeNames": ["Рефрижератор"],
      "pointsCount": 2,
      "orderPriceType": 10,
      "orderCost": 25000,
      "accessType": 30
    }
  ],
  "totalCount": 1
}
```

Основные поля `data[]`:

| Поле | Описание |
|---|---|
| `id` | ID заказа |
| `addressFrom`, `addressTo` | Первый и последний адрес маршрута |
| `loadStart`, `loadFinish` | Плановый интервал погрузки |
| `unloadStart`, `unloadFinish` | Плановый интервал выгрузки |
| `organizationName`, `organizationId` | Владелец заказа |
| `distanceKm` | Расстояние |
| `trailerTypeNames` | Требуемые типы полуприцепов |
| `pointsCount` | Количество точек маршрута |
| `orderPriceType` | Тип цены |
| `orderCost` | Стоимость заказа |

---

## 2. Получение деталей доступного заказа

```http
GET /api/TransporterOrders/GetInfo?id={order_id}
```

Метод возвращает подробную информацию о заказе для перевозчика:

- маршрут;
- груз;
- тип цены;
- стоимость;
- отклики;
- статус;
- контактные данные;
- ограничения и требования.

Ответ использует модель `OrderInfoModel`, как и `GET /api/Orders/GetInfo`, но данные возвращаются с учетом прав текущей организации перевозчика. Если заказ больше не доступен перевозчику, метод может вернуть ошибку доступа или пустой результат в зависимости от бизнес-ситуации.

---

## 3. Создание отклика из справочников

```http
POST /api/TransporterOrderTruckMatchings/ApplyMatching
```

Основные поля:

| Поле | Описание |
|---|---|
| `orderId` | ID заказа |
| `logistFullName` | ФИО контактного лица перевозчика |
| `logistPhoneNumber` | Телефон контактного лица |
| `price` | Ставка |
| `truck` | Тягач |
| `trailer` | Прицеп |
| `driver` | Водитель |
| `ndsTypeId` | Тип НДС |
| `isTemporaryTruck` | Временный тягач |
| `isTemporaryDriver` | Временный водитель |
| `isTemporaryTrailer` | Временный прицеп |

Пример:

```json
{
  "id": 0,
  "orderId": 1552780,
  "logistFullName": "Иванов Иван",
  "logistPhoneNumber": "79999999999",
  "price": 23000,
  "truck": {
    "id": 1001,
    "organizationId": 95713,
    "sourceType": 10,
    "isRented": false
  },
  "trailer": {
    "id": 2001,
    "organizationId": 95713,
    "isRented": false
  },
  "driver": {
    "id": 3001,
    "organizationId": 95713
  },
  "ndsTypeId": 1,
  "isTemporaryTruck": false,
  "isTemporaryDriver": false,
  "isTemporaryTrailer": false,
  "isForwarding": false
}
```

При успехе метод возвращает `200 OK` без тела ответа. После отправки отклика проверяйте заказ через `GET /api/TransporterOrders/GetInfo?id={order_id}`.

---

## 4. Создание отклика с ручным заполнением

```http
POST /api/TransporterOrderTruckMatchings/ApplyManualMatching
```

Метод используется, если данные ТС, водителя или прицепа передаются вручную. При успешном выполнении отсутствующие сущности могут быть созданы.

Основные поля:

| Поле | Описание |
|---|---|
| `id` | `0` для нового отклика |
| `orderId` | ID заказа |
| `truckNumber`, `trailerNumber` | Номера ТС и прицепа |
| `driverLastName`, `driverFirstName`, `driverPatronymic` | ФИО водителя |
| `driverPhoneNumber` | Телефон водителя |
| `logistFullName`, `logistPhoneNumber` | Контакт перевозчика |
| `price` | Ставка перевозчика |
| `ndsTypeId` | Тип НДС |
| `truckTrailerTypeId`, `truckModelTypeId`, `truckOwnershipTypeId` | Справочные данные ТС |
| `trailerOwnershipTypeId` | Справочные данные прицепа |

При успехе метод возвращает `200 OK` без тела ответа.

---

## 5. Изменение и удаление отклика

| Действие | Метод |
|---|---|
| Изменить ставку | `POST /api/TransporterOrderTruckMatchings/EditMatchingPrice` |
| Удалить отклик | `POST /api/TransporterOrderTruckMatchings/Delete` |
| Отклонить отклик со стороны перевозчика | `POST /api/TransporterOrderTruckMatchings/Decline` |

### Изменение ставки

```json
{
  "id": 43587716,
  "price": 24000
}
```

### Удаление отклика

```http
POST /api/TransporterOrderTruckMatchings/Delete?Id={matching_id}
```

### Отклонение отклика

```json
{
  "id": 43587716
}
```

При успехе эти методы возвращают `200 OK` без тела ответа.

---

## 6. Получение назначенной заявки

```http
GET /api/TransporterBids/GetInfo?id={order_id}
```

Если метод возвращает карточку заказа, значит заказ назначен текущему перевозчику и стал заявкой. Ответ использует модель `OrderInfoModel`.

---

## 7. Передача фактических времен по точкам

```http
POST /api/TransporterBids/ApplyOrderPointFactTimes
```

Используется для передачи фактического времени въезда и выезда по точке маршрута.

### Тело запроса

```json
{
  "id": 2435200,
  "factEnterTimeOffset": "2026-07-01T15:25:00+03:00",
  "factLeaveTimeOffset": "2026-07-01T16:10:00+03:00",
  "clearAllNextPoints": false
}
```

| Поле | Обязательность | Описание |
|---|---|---|
| `id` | Да | ID точки маршрута из `points[].id` |
| `factEnterTimeOffset` | Нет | Фактическое время прибытия |
| `factLeaveTimeOffset` | Нет | Фактическое время выезда |
| `clearAllNextPoints` | Да | Очистить фактические времена следующих точек |

При успехе метод возвращает `200 OK` без тела ответа. Обновленные времена появятся в `points[].factEnterTimeOffset` и `points[].factLeaveTimeOffset`.

---

## 8. Справочники перевозчика

| Сущность | Список | Создание/редактирование | Удаление |
|---|---|---|---|
| ТС | `GET /api/TransporterTruck/List` | `POST /api/TransporterTruck/Apply` | `POST /api/TransporterTruck/Delete` |
| Прицепы | `GET /api/TransporterTrailer/List` | `POST /api/TransporterTrailer/Apply` | `POST /api/TransporterTrailer/Delete` |
| Водители | `GET /api/TransporterDriver/List` | `POST /api/TransporterDriver/Apply` | `POST /api/TransporterDriver/Delete` |

Удаление справочников перевозчика является мягким: данные остаются в базе, но становятся недоступны пользователям.

Списки справочников возвращают стандартный ответ:

```json
{
  "data": [
    {
      "id": 1001,
      "number": "Х777ХХ16",
      "sourceType": 10,
      "updatedAt": "2026-06-30T16:30:00+00:00"
    }
  ],
  "totalCount": 1
}
```
