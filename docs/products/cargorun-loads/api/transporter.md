# Transporter API

Раздел описывает основные методы для сценария перевозчика.

---

## 1. Получение доступных заказов

```http
GET /api/TransporterOrders/GetList
```

Метод возвращает заказы, доступные текущей организации перевозчика.

Используется для получения списка заказов, доступных перевозчику для выполнения: как заказов своей организации, так и чужих доступных заказов. В интерфейсе соответствует разделу **«Поиск заказов»**.

Для получения полной карточки конкретного заказа используйте `GET /api/TransporterOrders/GetInfo?id={order_id}`.

### Query-параметры

| Параметр | Описание |
|---|---|
| `$filter` | Фильтр по полям модели |
| `$orderby` | Сортировка по полям модели |
| `$top` | Ограничение количества записей |
| `$skip` | Смещение |

### Пример

```http
GET /api/TransporterOrders/GetList?$orderby=loadStart asc&$top=50&$skip=0
```

Фильтрация по населенным пунктам доступна через строковые поля `locationFrom` и `locationTo`:

```http
GET /api/TransporterOrders/GetList?$filter=contains(locationFrom,'Айдарово') and contains(locationTo,'Ильинское-Усово')&$top=50&$skip=0
```

### Ответ

Метод возвращает объект со списком доступных заказов и общим количеством найденных записей:

| Поле | Тип | Описание |
|---|---|---|
| `data` | `TransporterOrderWithMatchingsListModel[]` | Массив доступных заказов |
| `totalCount` | `long?` | Общее количество записей, подходящих под фильтр |

Если заказов нет, `data` может быть пустым массивом.

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
      "accessType": 30,
      "output": 678.49,
      "subscribeFilterId": null
    }
  ],
  "totalCount": 1
}
```

### Поля заказа в `data[]`

В модели `TransporterOrderWithMatchingsListModel` доступны отдельные строковые поля населенных пунктов `locationFrom` и `locationTo`. Их можно использовать для фильтрации по точкам отправления и назначения. Для отображения полного маршрута также доступны полные адреса `addressFrom` и `addressTo`.

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID заказа |
| `addressFrom` | `string?` | Адрес первой точки маршрута |
| `addressTo` | `string?` | Адрес последней точки маршрута |
| `locationFrom` | `string?` | Населенный пункт отправления |
| `locationTo` | `string?` | Населенный пункт назначения |
| `loadStart` | `date-time?` | Начало планового окна погрузки |
| `loadFinish` | `date-time?` | Окончание планового окна погрузки |
| `loadTimezoneId` | `string?` | Часовой пояс точки погрузки |
| `unloadStart` | `date-time?` | Начало планового окна выгрузки |
| `unloadFinish` | `date-time?` | Окончание планового окна выгрузки |
| `unloadTimezoneId` | `string?` | Часовой пояс точки выгрузки |
| `organizationName` | `string?` | Название организации владельца заказа |
| `organizationId` | `long` | ID организации владельца заказа |
| `distanceKm` | `double?` | Расстояние маршрута в километрах |
| `trailerTypeNames` | `string[]?` | Названия требуемых типов полуприцепов |
| `pointsCount` | `int?` | Количество точек маршрута |
| `orderPriceType` | `OrderPriceType?` | Тип стоимости: `10` фиксированная, `20` аукцион, `30` предложение цены |
| `offersFixAt` | `date-time?` | Время фиксации предложений |
| `offersAreFixed` | `boolean?` | Признак, что предложения зафиксированы |
| `accessType` | `OrderAccessType` | Видимость заказа: `10` всем, `20` связанным организациям, `30` выбранным связанным организациям |
| `visibleForOrganizationsIds` | `long[]?` | ID организаций, которым виден заказ |
| `visibleForOrganizationNames` | `string[]?` | Названия организаций, которым виден заказ |
| `orderCost` | `double?` | Стоимость заказа для заказчика |
| `orderCostDeviationPercent` | `double?` | Отклонение стоимости в процентах |
| `output` | `double?` | Расчетный показатель вывода/результата |
| `subscribeFilterId` | `long?` | ID фильтра подписки, по которому заказ попал в список |

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

Ответ использует модель `TransporterOrderInfoModel`: данные возвращаются с учетом прав текущей организации перевозчика. Если заказ больше не доступен перевозчику, метод может вернуть ошибку доступа или пустой результат в зависимости от бизнес-ситуации.

---

## 3. Создание отклика из справочников

```http
POST /api/TransporterOrderTruckMatchings/ApplyMatching
```

Метод используется, если данные ТС, водителя или прицепа заполняются из справочников.


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

## 5. Просмотр отклика

```http
GET /api/TransporterOrderTruckMatchings/Get?orderTruckMatchingId={matching_id}
```

Метод возвращает созданный отклик перевозчика на заказ. Используйте его, когда нужно открыть уже отправленный отклик и получить сохраненные данные: контакт логиста, ставку, ТС, прицеп, водителя, НДС и признаки временно введенных сущностей.

### Query-параметры

| Параметр | Тип | Описание |
|---|---|---|
| `orderTruckMatchingId` | `long` | ID отклика |

### Ответ

```json
{
  "id": 43587716,
  "orderId": 1552780,
  "logistFullName": "Иванов Иван",
  "logistPhoneNumber": "79999999999",
  "price": 23000,
  "truck": {
    "id": 1001,
    "trailerTypeId": 1,
    "modelTypeId": 12,
    "number": "Х777ХХ16",
    "ownershipTypeId": 2,
    "ownerName": "ООО \"Перевозчик\"",
    "ownerInn": "1234567890",
    "sourceType": 10,
    "isRented": false,
    "organizationId": 95713
  },
  "trailer": {
    "id": 2001,
    "ownershipTypeId": 2,
    "ownerName": "ООО \"Перевозчик\"",
    "ownerInn": "1234567890",
    "number": "А123ВС77",
    "isRented": false,
    "organizationId": 95713
  },
  "driver": {
    "id": 3001,
    "lastName": "Петров",
    "firstName": "Петр",
    "patronymic": "Петрович",
    "phoneNumber": "79999999999",
    "organizationId": 95713
  },
  "ndsTypeId": 1,
  "isTemporaryTruck": false,
  "isTemporaryDriver": false,
  "isTemporaryTrailer": false,
  "isForwarding": false,
  "forwardingOrganizationId": null
}
```

### Поля отклика

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID отклика |
| `orderId` | `long` | ID заказа |
| `logistFullName` | `string?` | ФИО контактного лица перевозчика по отклику |
| `logistPhoneNumber` | `string?` | Телефон контактного лица перевозчика |
| `price` | `double?` | Ставка перевозчика |
| `truck` | `TransporterOrderTruckMatchingTruckModel?` | Тягач |
| `trailer` | `TransporterOrderTruckMatchingTrailerModel?` | Прицеп |
| `driver` | `TransporterOrderTruckMatchingDriverModel?` | Водитель |
| `ndsTypeId` | `long?` | Тип НДС |
| `isTemporaryTruck` | `boolean` | Тягач введен вручную/временно |
| `isTemporaryDriver` | `boolean` | Водитель введен вручную/временно |
| `isTemporaryTrailer` | `boolean` | Прицеп введен вручную/временно |
| `isForwarding` | `boolean` | Отклик создан как экспедирование |
| `forwardingOrganizationId` | `long?` | ID экспедиторской организации |

### Поля `truck`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID тягача |
| `trailerTypeId` | `long?` | Тип полуприцепа/кузова |
| `modelTypeId` | `long?` | Тип/модель ТС |
| `number` | `string?` | Госномер тягача |
| `ownershipTypeId` | `long?` | Тип владения |
| `ownerName` | `string?` | Собственник |
| `ownerInn` | `string?` | ИНН собственника |
| `sourceType` | `SourceType` | Источник данных ТС |
| `isRented` | `boolean` | ТС арендованное |
| `organizationId` | `long` | ID организации перевозчика |

### Поля `trailer`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID прицепа |
| `ownershipTypeId` | `long?` | Тип владения |
| `ownerName` | `string?` | Собственник |
| `ownerInn` | `string?` | ИНН собственника |
| `number` | `string?` | Госномер прицепа |
| `isRented` | `boolean` | Прицеп арендованный |
| `organizationId` | `long` | ID организации перевозчика |

### Поля `driver`

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | ID водителя |
| `lastName` | `string?` | Фамилия |
| `firstName` | `string?` | Имя |
| `patronymic` | `string?` | Отчество |
| `phoneNumber` | `string?` | Телефон |
| `passportSeries` | `string?` | Серия паспорта |
| `passportNumber` | `string?` | Номер паспорта |
| `passportGivenBy` | `string?` | Кем выдан паспорт |
| `passportGivenWhen` | `date-time?` | Когда выдан паспорт |
| `organizationId` | `long` | ID организации перевозчика |

Для получения данных, необходимых именно для формы редактирования отклика, используется:

```http
GET /api/TransporterOrderTruckMatchings/GetForEditMatching?Id={matching_id}&IsNew=false
```

Метод возвращает `EditOrderTruckMatchingModel`: `id`, `truck`, `trailer`, `driver`, `isForwarding`.


---

## 6. Изменение и удаление отклика

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

## 7. Получение назначенной заявки

```http
GET /api/TransporterBids/GetInfo?id={order_id}
```

Если метод возвращает карточку заказа, значит заказ назначен текущему перевозчику и стал заявкой. Ответ использует модель `OrderInfoModel`.

---

## 8. Передача фактических времен по точкам

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

## 9. Справочники перевозчика

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
