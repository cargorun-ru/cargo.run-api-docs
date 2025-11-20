# Работа с заявками (Bids)

Этот раздел описывает методы API CARGO.RUN, использующиеся для создания, обновления, получения, удаления и управления статусами заявок.  
Общие правила работы API, в том числе паттерн `Apply`, приведены в файле:

- [Обзор API](./_overview.md)

Минимальные обязательные поля заявки — в:

- [Минимальные требования к запросам](./minimal-requirements.md)

Сценарии интеграции описаны в:

- [CARGO.RUN → учетная система](./integration/scenario-cr-to-external.md)
- [Учетная система → CARGO.RUN](./integration/scenario-external-to-cr.md)
- [Синхронизация данных](./integration/sync.md)

---

# 1. Создание и обновление заявки

## 1.1. Полное создание или обновление заявки

```http
POST /api/truckingbids/apply
```

### Назначение

- Создание новой заявки (`id = 0`)
- Полное обновление существующей заявки (`id > 0`)

В теле запроса необходимо передавать **все поля**, требуемые swagger.

### Особенности

- поддерживает как создание, так и полное обновление;
- при создании статус заявки — `New` (черновик);
- при ошибках валидации API возвращает HTTP 4xx с текстом ошибки.

---

## 1.2. Частичное обновление заявки (Patch)

```http
POST /api/truckingbids/patch
```

### Назначение

- обновление только изменённых полей заявки.

### Ограничения

- нельзя частично изменить вложенные структуры (`bidPoints`, `cargos`, `typeOptions` и др.);
- если нужно изменить маршрутные точки — необходимо передать **весь массив** `bidPoints`, включая неизменённые точки.

---

# 2. Управление статусами и жизненным циклом

## 2.1. Запуск заявки в работу

```http
POST /api/truckingbids/setstatus
```

### Тело запроса

```json
{
  "bidId": 0,
  "status": "Started"
}
```

---

## 2.2. Отмена заявки

```http
POST /api/bids/cancel
```

### Тело запроса

```json
{
  "bidId": 0
}
```

---

## 2.3. Закрытие заявки вручную

```http
POST /api/truckingbids/forcecomplete
```

### Тело запроса

```json
{
  "bidId": 0,
  "reason": "string",
  "mileage": 0,
  "useOdometerMileage": true,
  "bidPoints": [
    {
      "id": 0,
      "enteredAtByLogist": "2025-05-07T07:15:04Z",
      "loadUnloadedAtByLogist": "2025-05-07T07:15:04Z",
      "loadUnloadStatus": "AtLoading"
    }
  ]
}
```

---

## 2.4. Возврат заявки в черновик

```http
POST /api/truckingbids/revert
```

### Тело запроса

```json
{
  "bidId": 0
}
```

---

# 3. Удаление и восстановление

## 3.1. Удаление заявки

```http
POST /api/bids/delete
```

### Тело запроса

```json
{
  "bidId": 0
}
```

Заявка должна быть предварительно переведена в статус `New` (через `/api/truckingbids/revert`).

---

## 3.2. Восстановление удалённой заявки

```http
POST /api/bids/restore
```

### Тело запроса

```json
{
  "bidId": 0
}
```

---

# 4. Получение заявок

## 4.1. Получение заявки для редактирования

```http
GET /api/bids/get
```

Параметры:

- `id` — идентификатор заявки.

---

## 4.2. Получение списка заявок (инкрементальная синхронизация)

```http
GET /api/bids/getlistforexternal
```

Поддерживает:

- `$filter`
- `$orderby`
- `$top`
- `$skip`

Пример:

```http
GET /api/bids/getlistforexternal
  ?$filter=updatedAt ge 2024-01-23T21:00:00Z
  &$orderby=updatedAt
  &$top=50
  &$skip=0
```

Подробное описание в:

- [integration/sync.md](./integration/sync.md)

---

# 5. Получение связанных данных

## 5.1. Связанные документы

```http
GET /api/bids/getbiddocumentassignmentsforbid
```

Возвращает связанные документы (внешние файлы) по заявке.

---

## 5.2. Данные по точкам заявки

Изменение точек выполняется:

- через `/apply` — полная передача модели,
- через `/patch` — но с передачей **всего массива `bidPoints`**.


## 5.3. Получение данных по перецепкам в заявке

```http
GET /api/truckingbids/gettrailerreplacements
```

### Назначение

Получение данных о перецепках (замене прицепа) в рамках конкретной заявки.

### Параметры

- `bidId` — идентификатор заявки (query-параметр).

### Комментарии

Метод возвращает список всех событий замены прицепа, зафиксированных по заявке: старый и новый прицеп, время замены, источник данных и комментарий (если задан). Фактическая структура ответа определяется моделью `TrailerReplacementViewModel` в swagger.

---

## 5.4. Обновление статуса оплаты заявки

```http
POST /api/bids/setpaymentstatus
```

### Назначение

Установка или изменение статуса оплаты заявки.

### Тело запроса

```json
{
  "bidId": 0,
  "paymentStatus": "Paid"
}
```

### Поддерживаемые значения

По перечислению `BidPaymentStatusEnum` в swagger:

- `NotPaid`
- `PartiallyPaid`
- `Paid`
- `Expired`

### Комментарии

Метод используется, когда внешняя система (например, 1С) фиксирует оплату по заявке и должна передать статус оплаты в CARGO.RUN.

---

# 6. Ошибки

Возможные ошибки:

- невалидные данные (`paymentTypeId`, `ndsTypeId`, элементы геозон и т.д.);
- попытка удалить заявку без предварительного `revert`;
- частичное обновление вложенных структур через `/patch`.

Поведение API:

- HTTP 4xx
- текстовое пояснение в ответе

---

# 7. Список методов

| Метод | Описание |
|-------|----------|
| `POST /api/truckingbids/apply` | Создание / полное обновление |
| `POST /api/truckingbids/patch` | Частичное обновление |
| `POST /api/truckingbids/setstatus` | Запуск заявки |
| `POST /api/bids/cancel` | Отмена |
| `POST /api/truckingbids/forcecomplete` | Ручное завершение |
| `POST /api/truckingbids/revert` | Возврат в черновик |
| `POST /api/bids/delete` | Удаление |
| `POST /api/bids/restore` | Восстановление |
| `GET /api/bids/get` | Получение заявки |
| `GET /api/bids/getlistforexternal` | Инкрементальная синхронизация |
| `GET /api/bids/getbiddocumentassignmentsforbid` | Получение документов по заявке |
| `GET /api/truckingbids/gettrailerreplacements` | Получение данных по перецепкам |
| `POST /api/bids/setpaymentstatus` | Обновление статуса оплаты по заявке |





