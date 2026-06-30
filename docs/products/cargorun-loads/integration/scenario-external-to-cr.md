# Сценарий: учетная система → CARGO.RUN

В этом сценарии заказ создается во внешней системе, например в 1С, ERP или TMS, а затем передается в **CARGO.RUN Загрузки**.

---

## 1. Общий поток

1. Внешняя система получает токен авторизации.
2. При необходимости получает значения справочников.
3. Создает заказ через `POST /api/Orders/Apply`.
4. Запускает заказ в работу через `POST /api/Orders/StartOrder`, если заказ был создан как черновик.
5. Получает детали заказа через `GET /api/Orders/GetInfo`.
6. Отслеживает отклики перевозчиков в `matchingCars`.
7. Принимает выбранный отклик через `POST /api/OrderTruckMatchings/Accept`.
8. Получает результат выполнения через `GET /api/Orders/GetInfo` или список изменений через `GET /api/Orders/GetIntegrationList`.

---

## 2. Подготовка справочников

Перед созданием заказа обычно нужны:

| Данные | Метод |
|---|---|
| Тип груза | `GET /api/CargoType/SelectByOrganizationList` |
| Тип упаковки | `GET /api/PackType/SelectList` |
| Типы прицепов | `GET /api/OrganizationAccount/GetAllowedTrailerTypeList` |
| Тип погрузки/выгрузки | `GET /api/LoadUnloadType/SelectList` |
| Контрагенты | `GET /api/Orders/SelectCounterpartyByOrganizationList` |
| Авторы заказа | `GET /api/Orders/SelectAuthorByOrganizationList` |
| Перевозчики | `GET /api/Organization/SelectRelationsOrganizationsList` |
| Тип НДС | `GET /api/NdsType/SelectList` |
| Тип оплаты | `GET /api/PaymentType/SelectList` |

---

## 3. Создание заказа

Заказ создается методом:

```http
POST /api/Orders/Apply
```

Основные поля:

- `organizationId` — организация владельца заказа;
- `points` — точки маршрута;
- `orderPriceType` — тип цены;
- `orderCost` — стоимость;
- `accessType` — видимость заказа;
- `visibleForOrganizationsIds` — перевозчики, которым виден заказ;
- `trailerTypeIds` — требуемые типы прицепов;
- `contactPersonName`, `contactPersonPhoneNumber` — контакт по заказу;
- `externalId`, `externalInternalId` — идентификаторы внешней системы.

Минимальные требования описаны в разделе [Минимальные требования](../minimal-requirements.md).

---

## 4. Публикация и запуск

Для запуска заказа используется:

```http
POST /api/Orders/StartOrder?Id={order_id}
```

После запуска заказ становится доступен перевозчикам в соответствии с настройками видимости.

---

## 5. Получение откликов

Детали заказа:

```http
GET /api/Orders/GetInfo?Id={order_id}
```

Отклики перевозчиков находятся в поле `matchingCars`.

Для заказов типа `Auction` часть информации по торгам также находится в объекте `auction`.

---

## 6. Принятие отклика

Отклик принимает владелец заказа:

```http
POST /api/OrderTruckMatchings/Accept
```

В запрос нужно передать идентификатор отклика. Точная модель тела запроса описана в разделе [Order Responses API](../api/order-responses.md).

После принятия отклика заказ переходит дальше по жизненному циклу, а в деталях заказа появляются выбранный перевозчик, ТС, водитель и связанные данные.

---

## 7. Получение результата выполнения

Для обратной синхронизации внешняя система может:

- получать детали конкретного заказа через `GET /api/Orders/GetInfo`;
- получать список измененных заказов через `GET /api/Orders/GetIntegrationList` с фильтром по `updatedAt`.

Пример:

```http
GET /api/Orders/GetIntegrationList?$filter=updatedAt ge 2026-06-01T00:00:00.000Z&$top=100
```
