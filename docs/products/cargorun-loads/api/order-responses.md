# Order Responses API

Раздел описывает методы работы с откликами перевозчиков со стороны владельца заказа.

---

## 1. Получение откликов

Отклики возвращаются в деталях заказа:

```http
GET /api/Orders/GetInfo?Id={order_id}
```

Поле:

```json
{
  "matchingCars": []
}
```

---

## 2. Принятие отклика

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

При успехе метод возвращает `200 OK`.

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

---

## 5. Ручное назначение перевозчика

Если нужно назначить перевозчика вручную, используются методы `Orders`.

### Назначение существующего перевозчика, ТС и водителя

```http
POST /api/Orders/MatchManually
```

Основные поля:

| Поле | Описание |
|---|---|
| `id` | ID заказа |
| `forwardingOrganizationId` | ID организации перевозчика |
| `truckId` | ID ТС |
| `trailerId` | ID прицепа |
| `driverId` | ID водителя |
| `orderCost` | Стоимость |
| `invitedFleetPrice` | Цена приглашенного парка |

### Назначение с ручным заполнением данных

```http
POST /api/Orders/MatchManuallyExtended
```

Используется, когда часть данных перевозчика, ТС или водителя передается вручную.

### Назначение перевозчика CARGO.RUN

```http
POST /api/Orders/MatchManuallyForCargorun
```

---

## 6. Отличие от методов перевозчика

| Сценарий | Методы |
|---|---|
| Перевозчик создает отклик | `TransporterOrderTruckMatchings/ApplyMatching` |
| Перевозчик создает отклик вручную | `TransporterOrderTruckMatchings/ApplyManualMatching` |
| Владелец заказа принимает отклик | `OrderTruckMatchings/Accept` |
| Владелец заказа назначает вручную | `Orders/MatchManually*` |
