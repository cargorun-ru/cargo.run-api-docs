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

---

## 4. Создание отклика с ручным заполнением

```http
POST /api/TransporterOrderTruckMatchings/ApplyManualMatching
```

Метод используется, если данные ТС, водителя или прицепа передаются вручную. При успешном выполнении отсутствующие сущности могут быть созданы.

---

## 5. Изменение и удаление отклика

| Действие | Метод |
|---|---|
| Изменить ставку | `POST /api/TransporterOrderTruckMatchings/EditMatchingPrice` |
| Удалить отклик | `POST /api/TransporterOrderTruckMatchings/Delete` |
| Отклонить отклик со стороны перевозчика | `POST /api/TransporterOrderTruckMatchings/Decline` |

---

## 6. Получение назначенной заявки

```http
GET /api/TransporterBids/GetInfo?id={order_id}
```

Если метод доступен, значит заказ назначен текущему перевозчику и стал заявкой.

---

## 7. Передача фактических времен по точкам

```http
POST /api/TransporterBids/ApplyOrderPointFactTimes
```

Используется для передачи фактического времени въезда и выезда по точке маршрута.

---

## 8. Справочники перевозчика

| Сущность | Список | Создание/редактирование | Удаление |
|---|---|---|---|
| ТС | `GET /api/TransporterTruck/List` | `POST /api/TransporterTruck/Apply` | `POST /api/TransporterTruck/Delete` |
| Прицепы | `GET /api/TransporterTrailer/List` | `POST /api/TransporterTrailer/Apply` | `POST /api/TransporterTrailer/Delete` |
| Водители | `GET /api/TransporterDriver/List` | `POST /api/TransporterDriver/Apply` | `POST /api/TransporterDriver/Delete` |

Удаление справочников перевозчика является мягким: данные остаются в базе, но становятся недоступны пользователям.
