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

Используйте этот метод как ленту изменений: получите `id`, `status`, `bidStatus`, `updatedAt` и затем запрашивайте полную карточку измененного заказа через `GET /api/Orders/GetInfo?Id={order_id}`.

### Query-параметры

| Параметр | Описание |
|---|---|
| `$filter` | Фильтр |
| `$orderby` | Сортировка |
| `$top` | Количество записей |
| `$skip` | Смещение |

### Пример первичной загрузки

```http
GET /api/Orders/GetIntegrationList?$filter=updatedAt ge 2026-06-01T00:00:00.000Z&$top=100
```

### Пример инкрементальной загрузки

После первой успешной обработки сохраните максимальное значение `updatedAt` из обработанных заказов. При следующем запуске запрашивайте только заказы, измененные после этой контрольной точки:

```http
GET /api/Orders/GetIntegrationList?$filter=updatedAt gt 2026-06-30T16:37:14.138307%2B00:00&$orderby=updatedAt asc&$top=100&$skip=0
```

Если заказ изменился, он снова появится в `GetIntegrationList` с новым значением `updatedAt`. После этого запросите полную карточку заказа через `GET /api/Orders/GetInfo?Id={order_id}` и обновите данные во внешней системе.

Для надежной синхронизации:

- используйте сортировку `$orderby=updatedAt asc`;
- обрабатывайте страницы через `$top` и `$skip`;
- сохраняйте новую контрольную точку только после успешной обработки всей страницы;
- учитывайте, что один заказ может попадать в выборку повторно, если вы используете `ge` вместо `gt`.

### Ответ

```json
{
  "data": [
    {
      "id": 1552769,
      "status": 40,
      "bidStatus": 60,
      "updatedAt": "2026-06-30T16:33:51.12787+00:00",
      "createdAt": "2026-06-30T16:32:54.03118+00:00",
      "orderCost": 138000,
      "invitedFleetPrice": 129000,
      "orderPriceType": 10,
      "ndsTypeId": 71,
      "points": []
    }
  ],
  "totalCount": 1
}
```

Элементы `data[]` содержат основные поля заказа, включая `id`, `status`, `bidStatus`, `updatedAt`, `createdAt`, `orderCost`, `invitedFleetPrice`, `orderPriceType`, `ndsTypeId` и `points`.

Часть детальных данных может отсутствовать в списке. Для получения перевозчика, ТС, водителя, названий НДС и полного маршрута используйте `GET /api/Orders/GetInfo`.

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

### Поля для выгрузки в учетную систему

| Данные | Поле в ответе `GetInfo` | Комментарий |
|---|---|---|
| ID заказа | `id` | ID заказа CARGO.RUN |
| Статус заказа | `status` | Enum `OrderStatus` |
| Статус заявки/выполнения | `bidStatus` | Enum `BidStatus`; для выполненной перевозки обычно `60` |
| Стоимость заказчика | `orderCost` | Ставка или стоимость заказа для заказчика |
| НДС заказчика | `ndsTypeId`, `ndsTypeName` | Значения из справочника `NdsType` |
| Заказчик | `counterpartyId`, `counterpartyName` | Контрагент заказчика |
| Экспедитор/владелец заказа | `organizationId`, `organizationName` | Организация текущего владельца заказа |
| Перевозчик | `transporterInfo.organizationId`, `transporterInfo.organizationName` | Заполняется после выбора перевозчика |
| ИНН/КПП перевозчика | `transporterInfo.inn`, `transporterInfo.kpp` | Если доступны |
| Стоимость перевозчика | `transporterInfo.price` | Также может дублироваться в `invitedFleetPrice` |
| НДС перевозчика | `transporterNdsType` | Название типа НДС перевозчика |
| Комментарий по заказу | `comment` | Общий комментарий |
| Госномер машины | `truckNumber` | Заполняется после выбора перевозчика/ТС |
| Госномер прицепа | `trailerNumber` | Заполняется после выбора перевозчика/прицепа |
| Водитель | `driverFullName`, `driverPhoneNumber` | ФИО и телефон водителя |
| Дата создания | `createdAt` | ISO 8601 со смещением |
| Груз | `cargoCost`, `cargoType`, `cargoWeight`, `packTypeNames`, `packCount` | Стоимость, тип, вес, упаковка и количество мест |
| Тип полуприцепа | `trailerTypeNames` | Названия требуемых типов полуприцепов |
| Тип стоимости | `orderPriceType` | Enum `OrderPriceType` |
| Маршрут | `points[]` | Точки маршрута |

### Поля точки маршрута

| Данные | Поле в `points[]` |
|---|---|
| ID точки | `id` |
| Порядок точки | `index` |
| Тип точки | `pointType` |
| Адрес | `location.address` |
| Координаты | `location.latitude`, `location.longitude` |
| Часовой пояс | `timezoneId` или `location.timezoneId` |
| Плановое время прибытия | `planEnterTimeOffset` |
| Плановое время выезда | `planLeaveTimeOffset` |
| Прогноз прибытия | `predictionEnterTimeOffset` |
| Прогноз выезда | `predictionLeaveTimeOffset` |
| Фактическое время прибытия | `factEnterTimeOffset` |
| Фактическое время выезда | `factLeaveTimeOffset` |
| Тип загрузки/выгрузки | `loadUnloadTypeName` |
| Комментарий по точке | `comment` |

### Пример ответа `GetInfo` для выполненного заказа

```json
{
  "id": 1552769,
  "status": 40,
  "bidStatus": 60,
  "createdAt": "2026-06-30T16:32:54.03118+00:00",
  "orderCost": 138000,
  "ndsTypeId": 71,
  "ndsTypeName": "НДС 22%",
  "counterpartyId": 57397,
  "counterpartyName": "ООО \"Делаем загрузки\"",
  "organizationId": 95143,
  "organizationName": "ltgf",
  "comment": "Комментарий по заказу",
  "orderPriceType": 10,
  "cargoCost": 456000,
  "cargoType": "Продукты питания",
  "cargoWeight": 20,
  "packTypeNames": null,
  "packCount": null,
  "trailerTypeNames": ["Тент"],
  "transporterInfo": {
    "organizationId": 95713,
    "organizationName": "ООО \"Перевоз-Тентовоз\"",
    "inn": "1881838374",
    "kpp": "563303910",
    "price": 129000
  },
  "transporterNdsType": "НДС 22%",
  "truckNumber": "Х888ХХ16",
  "trailerNumber": "ХХ123456",
  "driverFullName": "Шоферович Ирек Мандаринович",
  "driverPhoneNumber": "71534503278",
  "points": [
    {
      "id": 2435177,
      "index": 0,
      "pointType": 10,
      "location": {
        "address": "Москва, Чермянская улица, 4с1",
        "latitude": 55.88616,
        "longitude": 37.628559,
        "timezoneId": "Europe/Moscow"
      },
      "timezoneId": "Europe/Moscow",
      "planEnterTimeOffset": "2026-06-29T03:40:00+03:00",
      "factEnterTimeOffset": "2026-06-29T04:00:00+03:00",
      "factLeaveTimeOffset": "2026-06-29T05:05:00+03:00",
      "comment": "Комментарий по точке"
    },
    {
      "id": 2435178,
      "index": 1,
      "pointType": 20,
      "location": {
        "address": "муниципальное образование Краснодар, садовое товарищество Кубаночка, улица Ростовское Шоссе",
        "latitude": 45.149249,
        "longitude": 39.053466,
        "timezoneId": "Europe/Moscow"
      },
      "timezoneId": "Europe/Moscow",
      "planEnterTimeOffset": "2026-06-30T10:00:00+03:00",
      "factEnterTimeOffset": "2026-06-30T17:45:00+03:00",
      "factLeaveTimeOffset": "2026-06-30T19:20:00+03:00",
      "loadUnloadTypeName": "Боковая"
    }
  ]
}
```

### Пример заказа без выбранного перевозчика

```json
{
  "id": 1552780,
  "status": 10,
  "bidStatus": null,
  "orderCost": 25000,
  "ndsTypeId": 1,
  "ndsTypeName": "Без НДС",
  "counterpartyName": "ООО \"Делаем выгрузки\"",
  "organizationName": "ltgf",
  "transporterInfo": null,
  "truckNumber": null,
  "trailerNumber": null,
  "driverFullName": "  ",
  "driverPhoneNumber": null,
  "matchingCars": []
}
```

Для заказов без выбранного перевозчика поля перевозчика, ТС, прицепа и водителя могут быть `null` или пустыми. После выбора перевозчика в карточке заказа появляются `transporterInfo`, `truckNumber`, `trailerNumber`, `driverFullName`, `driverPhoneNumber`, `orderTruckMatchingId`, `bidStatus` и итоговая ставка перевозчика.

---

## 4. Связанные разделы

- [Жизненный цикл заказа](./order-lifecycle.md)
- [Отклики и выбор перевозчика](./order-responses.md)
- [Справочники](./directories.md)
