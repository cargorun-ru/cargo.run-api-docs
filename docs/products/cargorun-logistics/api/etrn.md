# Электронные транспортные накладные (ЭТРН)

Этот раздел описывает методы API CARGO.RUN для работы с электронными транспортными накладными (ЭТРН) со стороны внешних систем, включая 1С и провайдеров ЭТРН.

В актуальной версии API используется терминология `Waybill`. Прежние названия с `EBill` считаются устаревшими.

Общие принципы работы API и авторизации см.:

- [Обзор API](./_overview.md)
- [Auth API](../api/auth.md)

---

## 1. Что изменилось

### 1.1. Методы внешней Waybill-интеграции

Контроллер:

```text
/api/ebill/Bids -> /api/waybill/Bids
```

Используйте актуальные методы:

| Было | Стало | Примечание |
|------|-------|------------|
| `GET /api/ebill/Bids/Get/{bidId}` | `GET /api/waybill/Bids/Get/{bidId}` | Получение данных заявки для ЭТРН. |
| `GET /api/ebill/Bids/GetLoadPoints` | `GET /api/waybill/Bids/GetLoadPoints` | Получение активных точек загрузки для формирования первого титула. |
| `POST /api/ebill/Bids/BatchMarkBidPoints` | `POST /api/waybill/Bids/BatchMarkBidPoints` | Массовая отметка точек как переданных в обработку. |
| `POST /api/ebill/Bids/ApplyTitle` | `POST /api/waybill/Bids/ApplyTitle` | Сохранение титула по заявке. |
| `GET /api/ebill/Bids/GetAcceptedTitles` | `GET /api/waybill/Bids/GetAcceptedTitles` | Получение принятых титулов. В ответе используются обновлённые значения `WaybillTitleStatus`. |
| `POST /api/ebill/Bids/BatchMarkTitles` | `POST /api/waybill/Bids/BatchMarkTitles` | Массовая отметка титулов как переданных в обработку. |
| `POST /api/ebill/Bids/ApplyQrCodes` | `POST /api/waybill/Bids/ApplyQrCodes` | Сохранение QR-кодов по титулу. |
| `GET /api/ebill/Bids/GetTitleSignatures` | `GET /api/waybill/Bids/GetTitleSignatures` | Получение электронных подписей титулов. |
| `POST /api/ebill/Bids/BatchMarkTitleSignatures` | `POST /api/waybill/Bids/BatchMarkTitleSignatures` | Массовая отметка подписей как переданных в обработку. |
| `GET /api/ebill/Bids/GetPaymentDetailsList` | `GET /api/waybill/Bids/GetPaymentDetailsList` | Получение реквизитов и данных для оплаты. |

### 1.2. Методы 1С

Методы `/api/1c/Bills/...` остаются без изменения. Изменились только значения статусов титулов: вместо `TitleStatus` используется `WaybillTitleStatus`.

---

## 2. Методы для 1С

### 2.1. Получение списка титулов со статусами

```http
GET /api/1c/bills/gettitles
```

#### Назначение

Получение списка титулов ЭТРН с их текущими статусами в формате OData.

Метод возвращает коллекцию `TitleExternalModel`, в которой для каждого титула указаны:

- `id` — идентификатор титула;
- `type` — тип титула (`TitleType`);
- `status` — статус (`WaybillTitleStatus`);
- `statusDate` — дата и время изменения статуса;
- `bill` — данные по накладной (`WaybillExternalModel`).

[Статусы титулов ЭТРН](../statuses.md#4-статусы-титулов-этрн)

#### Параметры запроса

Метод поддерживает стандартные OData-параметры:

- `$filter` — фильтр по полям модели `TitleExternalModel`;
- `$orderBy` — сортировка;
- `$top` — ограничение количества;
- `$skip` — смещение;
- `$count` — возврат количества записей;
- `$select` — выбор полей.

Примеры:

1. Получить все титулы в статусе `ReceivedOrCreated`:

```text
GET /api/1c/bills/gettitles?$filter=status eq 'ReceivedOrCreated'
```

2. Получить первые 50 титулов, отсортированных по дате статуса:

```text
GET /api/1c/bills/gettitles?$orderby=statusDate desc&$top=50
```

### 2.2. Получение титула по заявке

```http
GET /api/1c/Bills/GetTitle?titleId={titleId}&bidId={bidId}&bidExternalId={bidExternalId}
```

#### Назначение

Получение данных одного титула ЭТРН.

Метод может искать титул:

- по идентификатору заявки и по идентификатору титула;
- по внешнему идентификатору заявки и по идентификатору титула.

#### Параметры запроса

Метод поддерживает следующие query-параметры:

- `titleId` — идентификатор титула (int64);
- `bidId` — идентификатор заявки (int64);
- `bidExternalId` — внешний идентификатор заявки (string).

Ответ — модель `TitleWithRemarksExternalModel`, содержащая:

- данные титула;
- статус и дату статуса;
- комментарии и замечания, если есть.

### 2.3. Смена статуса титула

```http
POST /api/1c/bills/applystatus
```

#### Назначение

Изменение статуса титула ЭТРН со стороны внешней системы.

Метод позволяет:

- подтвердить титул;
- отклонить титул;
- передать новый статус обработки титула в CARGO.RUN.

#### Тело запроса

Тело описано моделью `TitleStatusApplyExternalModel`:

```json
{
  "id": 0,
  "status": "Accepted",
  "bidId": 0,
  "bidExternalId": "string"
}
```

Поля:

- `id` — идентификатор титула, обязательное поле;
- `status` — новый статус титула, обязательное поле;
- `bidId` — идентификатор заявки;
- `bidExternalId` — внешний идентификатор заявки.

#### Поддерживаемые значения статуса

Список статусов задаётся enum `WaybillTitleStatus`:

| Значение | Описание |
|----------|----------|
| `ReceivedOrCreated` | Титул получен или создан системой. Ранее использовалось значение `Received`. |
| `Accepted` | Титул принят. |
| `Signed` | Титул подписан. |
| `Sent` | Титул передан на отправку. Ранее использовалось значение `SentToCrEBill`. |
| `Processed` | Титул обработан. |
| `Declined` | Титул отклонён. |
| `Failed` | При обработке титула возникла ошибка. |

---

## 3. Методы внешней Waybill-интеграции

Эти методы используются внешним сервисом ЭТРН для обмена данными с CARGO.RUN. Они заменяют прежние методы `/api/ebill/Bids/...`.

| Метод | Описание |
|-------|----------|
| `GET /api/waybill/Bids/Get/{bidId}` | Получение данных заявки по идентификатору. |
| `GET /api/waybill/Bids/GetLoadPoints` | Получение активных точек загрузки для формирования первого титула. |
| `POST /api/waybill/Bids/BatchMarkBidPoints` | Отметка точек заявки как переданных в обработку. |
| `POST /api/waybill/Bids/ApplyTitle` | Сохранение титула в заявке. |
| `GET /api/waybill/Bids/GetAcceptedTitles` | Получение принятых титулов для последующей генерации QR-кодов. |
| `POST /api/waybill/Bids/BatchMarkTitles` | Отметка титулов как переданных в обработку. |
| `POST /api/waybill/Bids/ApplyQrCodes` | Сохранение QR-кодов в заявке. |
| `GET /api/waybill/Bids/GetTitleSignatures` | Получение электронных подписей титулов. |
| `POST /api/waybill/Bids/BatchMarkTitleSignatures` | Отметка подписей как переданных в обработку. |
| `GET /api/waybill/Bids/GetPaymentDetailsList` | Получение данных для оплаты. |

---

## 4. Enum'ы и переименования

### 4.1. WaybillProviderType

Флаговый enum провайдера ЭТРН:

| Значение | Код | Описание |
|----------|-----|----------|
| `ProviderEmulator` | `0` | Эмулятор провайдера. |
| `Astral` | `1` | Провайдер Астрал. |
| `Kontur` | `2` | Провайдер Контур. |

### 4.2. WaybillTitleStatus

`TitleStatus` переименован в `WaybillTitleStatus`.

| Актуальное значение | Код | Ранее |
|---------------------|-----|-------|
| `ReceivedOrCreated` | `0` | `Received` |
| `Accepted` | `1` | Без изменений |
| `Signed` | `2` | Новое значение |
| `Sent` | `3` | `SentToCrEBill` |
| `Processed` | `4` | Новое значение |
| `Declined` | `5` | Без изменений |
| `Failed` | `6` | Новое значение |

### 4.3. Прочие переименования

| Enum | Актуальное значение | Ранее |
|------|---------------------|-------|
| `FeatureModuleType` | `Waybills = 32` | `EBills` |
| `Role` | `WaybillIntegrationAccount = 180` | `EBillIntegrationAccount` |
| `UserMessageType` | `Waybills = 80` | `EBills` |
| `PushType` | `WaybillQrCodes = 8` | `EBillQrCodes` |
| `PushTemplateType` | `WaybillQrCodes = 12` | `EBillQrCodes` |
