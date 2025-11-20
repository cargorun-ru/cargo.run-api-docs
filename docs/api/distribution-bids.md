# Заказы на распределение (DistributionBids)

Этот раздел описывает методы API CARGO.RUN для работы с заказами на распределение (DistributionBids).

Общие принципы работы API см. в:

- [Обзор API](./_overview.md)
- [Auth API](./auth.md)

Минимальные требования к данным заказа на распределение приведены в:

- [Минимальные требования к запросам](./minimal-requirements.md)

---

## 1. Создание и обновление заказов

### 1.1. Пакетное создание/обновление заказов

```http
POST /api/distributionbids/apply
```

### Назначение

Создание и изменение заказов на распределение.

- При `id = 0` в элементах массива — создаётся новый заказ.
- При `id > 0` — обновляется существующий заказ.

### Тело запроса

Тело запроса описано моделью `DistributionBidBatchEditModel`:

```json
{
  "items": [
    {
      // DistributionBidEditModel
    }
  ]
}
```

Модель `DistributionBidEditModel` содержит поля заказа.  
Обязательные поля указаны в разделе:

- [Минимальные требования к запросам](./minimal-requirements.md)

При ошибках валидации возвращается HTTP 4xx и текстовое описание ошибки.

---

## 2. Получение списков заказов

### 2.1. Список заказов для внешних сервисов

```http
GET /api/distributionbids/getlistforexternal
```

### Назначение

Получение списка заказов по фильтру для внешних сервисов с более подробной информацией. Поддерживается формат OData.

### Параметры

- `$filter` — фильтр по полям `DistributionBidForExternalSyncModel`;
- `$orderBy` — сортировка;
- `$top` — ограничение количества;
- `$skip` — смещение;
- `$count`, `$select`, `$expand` — как описано в swagger.

Ответ — массив `DistributionBidForExternalSyncModel`.

---

### 2.2. Получение статусов внешних заказов

```http
GET /api/distributionbids/getlistforexternalstatuses
```

### Назначение

Получение заказов по идентификаторам с информацией о статусах (для сценариев экспедиции).

### Параметры

- `Ids` — массив идентификаторов заказов;
- `$filter`, `$orderBy`, `$top`, `$skip`, `$count`, `$select`, `$expand` — как в методе `getlist`.

Ответ — массив `ExternalDistributionBidStatusModel`.

---

## 3. Получение одного заказа

### 3.1. Получение заказа по идентификатору

```http
GET /api/distributionbids/get/{id}
```

### Параметры

- `id` — идентификатор заказа (path-параметр).

Ответ — `DistributionBidViewModel`.

---

### 3.2. Получение заказа по заявке

```http
GET /api/distributionbids/getforbid/{id}
```

### Параметры

- `id` — идентификатор заявки.

Ответ — модель заказа, связанного с указанной заявкой.

---

## 4. Управление жизненным циклом заказа

### 4.1. Отмена заказа

```http
POST /api/distributionbids/cancel
```

### Тело запроса

Тело описано моделью `DistributionBidCancelModel` и содержит идентификатор заказа и дополнительные параметры, указанные в swagger.

---

### 4.2. Удаление заказа

```http
POST /api/distributionbids/delete
```

### Назначение

Удаление заказа, если по нему не создана заявка.

### Тело запроса

```json
{
  // DistributionBidDeleteModel
}
```

---

### 4.3. Восстановление удалённого заказа

```http
POST /api/distributionbids/restore
```

### Тело запроса

```json
{
  // DistributionBidRestoreModel
}
```

---

### 4.4. Возврат отменённого заказа

```http
POST /api/distributionbids/revert
```

### Назначение

Возвращает отменённый заказ в исходный статус («Без заявки»).

### Тело запроса

```json
{
  // DistributionBidRevertModel
}
```

---

## 7. Сводная таблица методов

| Метод | Описание |
|-------|----------|
| `POST /api/distributionbids/apply` | Cоздание/обновление заказов |
| `GET /api/distributionbids/getlistforexternal` | Список заказов для внешних сервисов |
| `GET /api/distributionbids/getlistofexternalinfo` | Информация о внешних заказах для планирования |
| `GET /api/distributionbids/getlistforexternalstatuses` | Статусы внешних заказов |
| `GET /api/distributionbids/get/{id}` | Получение заказа по идентификатору |
| `GET /api/distributionbids/getforbid/{id}` | Получение заказа по заявке |
| `POST /api/distributionbids/cancel` | Отмена заказа |
| `POST /api/distributionbids/delete` | Удаление заказа (если нет заявки) |
| `POST /api/distributionbids/revert` | Возврат отменённого заказа |
| `POST /api/distributionbids/restore` | Восстановление удалённого заказа |
