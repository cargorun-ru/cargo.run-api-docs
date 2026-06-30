# Сценарий: интеграция перевозчика

Этот сценарий описывает работу внешней системы перевозчика с **CARGO.RUN Загрузки**.

---

## 1. Общий поток

1. Перевозчик получает или создает учетную запись.
2. Система перевозчика авторизуется через `POST /api/Account/GenerateToken`.
3. Перевозчик получает доступные заказы через `GET /api/TransporterOrders/GetList`.
4. По интересующему заказу получает детали через `GET /api/TransporterOrders/GetInfo`.
5. Отправляет отклик через `POST /api/TransporterOrderTruckMatchings/ApplyMatching` или `ApplyManualMatching`.
6. Отслеживает результат выбора перевозчика.
7. Если заказ назначен перевозчику, получает заявку через `GET /api/TransporterBids/GetInfo`.
8. Передает фактические времена по точкам через `POST /api/TransporterBids/ApplyOrderPointFactTimes`.

---

## 2. Регистрация организации перевозчика

Для регистрации используется:

```http
POST /api/Registration/Register
```

Метод создает организацию и пользователя. ИНН организации уникален.

Для работы со списком заказов, откликами и справочниками пользователю перевозчика нужна роль менеджера.

---

## 3. Получение доступных заказов

```http
GET /api/TransporterOrders/GetList
```

Метод возвращает только заказы, доступные текущей организации перевозчика.

Список можно фильтровать, например по периоду погрузки:

```http
GET /api/TransporterOrders/GetList?$filter=loadStart ge 2026-06-24T21:00:00.000Z and loadStart le 2026-06-29T21:00:00.000Z
```

Из ответа сохраните `data[].id`. Этот ID нужен для получения карточки заказа и отправки отклика.

```json
{
  "data": [
    {
      "id": 1552780,
      "addressFrom": "Ростовская область, Аксайский район, улица Логопарк, 5",
      "addressTo": "Ростовская область, Аксай, улица Авиаторов, 5",
      "orderCost": 25000,
      "trailerTypeNames": ["Рефрижератор"]
    }
  ],
  "totalCount": 1
}
```

---

## 4. Создание отклика

Есть два способа.

### Отклик с выбором из справочников

```http
POST /api/TransporterOrderTruckMatchings/ApplyMatching
```

Используется, когда ТС, водитель и прицеп уже есть в справочниках.

Перед вызовом получите ID сущностей из справочников перевозчика:

| Данные | Метод |
|---|---|
| ТС | `GET /api/TransporterTruck/List` |
| Прицеп | `GET /api/TransporterTrailer/List` |
| Водитель | `GET /api/TransporterDriver/List` |

Минимальный смысловой набор для отклика:

- `orderId` — ID заказа из `TransporterOrders/GetList`;
- `price` — ставка перевозчика;
- `ndsTypeId` — тип НДС;
- `truck.id`, `trailer.id`, `driver.id` — выбранные сущности перевозчика;
- `logistFullName`, `logistPhoneNumber` — контакт перевозчика.

### Отклик с ручным заполнением

```http
POST /api/TransporterOrderTruckMatchings/ApplyManualMatching
```

Используется, когда данные ТС, водителя или прицепа передаются вручную. При успешном выполнении метод может создать отсутствующие сущности.

После успешной отправки отклика продолжайте проверять карточку заказа через `GET /api/TransporterOrders/GetInfo?id={order_id}`. Если владелец заказа выбрал другого перевозчика, заказ может исчезнуть из доступных.

---

## 5. Контактное лицо перевозчика

Поля `logistFullName` и `logistPhoneNumber` обязательны. Это контактное лицо перевозчика по отклику.

---

## 6. Временные сущности

Если передается признак временной сущности, например:

```json
{
  "isTemporaryTruck": true
}
```

то данные объекта `truck` не используются как ссылка на существующий тягач.

Аналогично работают:

- `isTemporaryDriver`;
- `isTemporaryTrailer`.

---

## 7. Проверка результата выбора

Если заказ еще доступен перевозчику, детали можно получать через:

```http
GET /api/TransporterOrders/GetInfo?id={order_id}
```

Если перевозчик выбран и заказ стал заявкой, используется:

```http
GET /api/TransporterBids/GetInfo?id={order_id}
```

Если заказ недоступен, вероятно был выбран другой перевозчик или заказ больше не виден текущей организации.

---

## 8. Передача фактических времен

Когда заказ стал заявкой перевозчика, получите карточку через:

```http
GET /api/TransporterBids/GetInfo?id={order_id}
```

В ответе найдите нужную точку маршрута в `points[]` и передайте ее `id` в метод:

```http
POST /api/TransporterBids/ApplyOrderPointFactTimes
```

Пример тела:

```json
{
  "id": 2435200,
  "factEnterTimeOffset": "2026-07-01T15:25:00+03:00",
  "factLeaveTimeOffset": "2026-07-01T16:10:00+03:00",
  "clearAllNextPoints": false
}
```

После успешной передачи проверьте, что в карточке заявки обновились `points[].factEnterTimeOffset` и `points[].factLeaveTimeOffset`.
