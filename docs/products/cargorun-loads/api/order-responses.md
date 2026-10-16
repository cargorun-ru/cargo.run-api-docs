# Order Responses API

Раздел описывает методы работы с откликами перевозчиков со стороны владельца заказа.

---

## 1. Получение откликов {#order-responses-get-info}

Отклики возвращаются в деталях заказа:

```http
GET /api/Orders/GetInfo?Id={order_id}
```

Поле:

```json
{
  "matchingCars": [
    {
      "id": 43587716,
      "orderId": 1552779,
      "truckOrganizationId": 95713,
      "truckOrganizationName": "ООО \"Перевоз-Тентовоз\"",
      "truckNumber": "Х777ХХ16",
      "trailerNumber": "ХХ234556",
      "driverFullName": "Хузятов Шафик Шаехович",
      "logistFullName": "Иванов Иван",
      "logistPhoneNumber": "79999999999",
      "price": 125600,
      "status": 10,
      "matchingType": 40,
      "gpsEnabled": true
    }
  ]
}
```

Основные поля `matchingCars[]`:

| Поле | Описание |
|---|---|
| `id` | ID отклика. Его нужно передать в `OrderTruckMatchings/Accept` или `Decline` |
| `orderId` | ID заказа |
| `truckOrganizationId`, `truckOrganizationName` | Организация перевозчика |
| `price` | Ставка перевозчика |
| `status` | Статус отклика |
| `matchingType` | Тип назначения/отклика |
| `truckNumber`, `trailerNumber` | Номера ТС и прицепа |
| `driverFullName` | Водитель |
| `logistFullName`, `logistPhoneNumber` | Контакт перевозчика |
| `gpsEnabled` | Признак доступности GPS |

---

Полное описание метода: [`GET /api/Orders/GetInfo`](./orders.md#orders-get-info).

## 2. Принятие отклика {#order-truck-matchings-accept}

```http
POST /api/OrderTruckMatchings/Accept
```

Метод принимает отклик перевозчика владельцем заказа.

### Тело запроса

```json
{
  "id": 43587716,
  "ndsTypeId": 3,
  "reason": "Выбран перевозчик",
  "transporterContract": null
}
```

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | ID отклика из `matchingCars[].id` |
| `ndsTypeId` | `long?` | Нет | Тип НДС перевозчика |
| `reason` | `string` | Нет | Комментарий или причина выбора |
| `transporterContract` | `object` | Нет | Договор с перевозчиком |

### Ответ

При успехе метод возвращает `200 OK` без тела ответа.

После принятия отклика:

- в карточке заказа появляется `orderTruckMatchingId`;
- выбранный перевозчик появляется в `transporterInfo`;
- ставка перевозчика доступна в `transporterInfo.price` и может дублироваться в `invitedFleetPrice`;
- ТС, прицеп и водитель появляются в `truckNumber`, `trailerNumber`, `driverFullName`, `driverPhoneNumber`;
- у заказа появляется или обновляется `bidStatus`.

---

## 3. Отклонение отклика

```http
POST /api/OrderTruckMatchings/Decline
```

### Тело запроса

```json
{
  "id": 43587716,
  "reason": "Не подходит ставка"
}
```

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | ID отклика |
| `reason` | `string` | Нет | Причина отклонения |

---

## 4. Список откликов

```http
GET /api/OrderTruckMatchings/List
```

Метод поддерживает `$filter`, `$orderby`, `$top`, `$skip`.

### Ответ

```json
{
  "data": [
    {
      "id": 43587716,
      "orderId": 1552779,
      "createdAt": "2026-06-30T16:35:50+00:00",
      "matchingType": 40,
      "status": 10,
      "logistFullName": "Иванов Иван",
      "logistPhoneNumber": "79999999999",
      "truckOrganizationName": "ООО \"Перевоз-Тентовоз\"",
      "truckNumber": "Х777ХХ16",
      "trailerNumber": "ХХ234556",
      "driverFullName": "Хузятов Шафик Шаехович",
      "price": 125600
    }
  ],
  "totalCount": 1
}
```

Ключевые поля списка совпадают по смыслу с `matchingCars[]` в карточке заказа. Для принятия или отклонения используйте `data[].id`.

---

## 5. Ручное назначение перевозчика

Если нужно назначить перевозчика вручную, используются методы `Orders`.

### Назначение существующего перевозчика, ТС и водителя {#orders-match-manually}

```http
POST /api/Orders/MatchManually
```

Метод доступен пользователю с правами менеджера. Он назначает перевозчика и сразу создает принятый отклик. Заказ должен принадлежать текущей организации, оставаться активным, не иметь выбранного ТС или победителя аукциона и не должен покинуть первую точку.

Поля запроса:

| Поле | Тип | Обязательность | Описание |
|---|---|---|---|
| `id` | `long` | Да | ID заказа |
| `transporterNdsTypeId` | `long` | Да | Существующий ID типа НДС перевозчика |
| `forwardingOrganizationId` | `long` | Да | ID доступной организации перевозчика |
| `truckId` | `long` | Да | ID ТС этой организации |
| `trailerId` | `long?` | Нет | ID прицепа этой организации |
| `driverId` | `long` | Да | ID водителя этой организации |
| `orderCost` | `double` | Да | Стоимость заказчика, больше нуля |
| `invitedFleetPrice` | `double` | Да | Стоимость перевозчика, больше нуля |
| `reason` | `string?` | Условно | Причина назначения, если она обязательна в настройках организации |
| `transporterContract` | `object?` | Нет | Договор с перевозчиком; доступность проверяется для текущей организации |

Пример:

```json
{
  "id": 1552779,
  "forwardingOrganizationId": 95713,
  "truckId": 1001,
  "trailerId": 2001,
  "driverId": 3001,
  "orderCost": 129000,
  "invitedFleetPrice": 125600,
  "transporterNdsTypeId": 1,
  "reason": "Назначение по договоренности"
}
```

При успехе возвращается `200 OK` без тела. Возможные причины `400 Bad Request`: заказ недоступен или уже не допускает назначение, справочный ID не существует, ТС/прицеп/водитель не принадлежит перевозчику, цена неположительная либо не заполнена обязательная причина.

### Назначение с ручным заполнением данных {#orders-match-manually-extended}

```http
POST /api/Orders/MatchManuallyExtended
```

Используется, когда перевозчик, ТС или водитель еще не заведены в справочниках и их данные нужно передать вручную. Метод доступен администратору организации.

Основные поля:

| Поле | Описание |
|---|---|
| `id` | ID заказа |
| `organizationName`, `inn`, `kpp` | Данные перевозчика |
| `truckNumber`, `truckModelTypeId`, `truckOwnershipTypeId` | Данные ТС |
| `trailerNumber`, `trailerModelTypeId`, `trailerOwnershipTypeId` | Данные прицепа |
| `driverLastName`, `driverFirstName`, `driverPatronymic`, `driverPhoneNumber` | Данные водителя |
| `orderCost` | Стоимость заказчика |
| `invitedFleetPrice` | Стоимость перевозчика |
| `transporterNdsTypeId` | Тип НДС перевозчика |

`truckModelTypeId` и `truckOwnershipTypeId` должны содержать ID существующих справочных значений. Обязательность реквизитов перевозчика и водителя зависит от правил организации; не отправляйте вымышленные значения для прохождения валидации.

### Назначение перевозчика CARGO.RUN {#orders-match-manually-for-cargorun}

```http
POST /api/Orders/MatchManuallyForCargorun
```

Используется, когда нужно назначить перевозчика CARGO.RUN с ручным указанием водителя, ТС и прицепа.

Все методы ручного назначения при успехе возвращают `200 OK` без тела ответа. После назначения проверяйте результат через [`GET /api/Orders/GetInfo?Id={order_id}`](./orders.md#orders-get-info).

---

## 6. Отличие от методов перевозчика

| Сценарий | Методы |
|---|---|
| Перевозчик создает отклик | `TransporterOrderTruckMatchings/ApplyMatching` |
| Перевозчик создает отклик вручную | `TransporterOrderTruckMatchings/ApplyManualMatching` |
| Владелец заказа принимает отклик | `OrderTruckMatchings/Accept` |
| Владелец заказа назначает вручную | `Orders/MatchManually*` |
