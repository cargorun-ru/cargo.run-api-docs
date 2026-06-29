# Iris: поддерживаемые типы и модели

## Назначение

Этот документ описывает, какие типы объектов сейчас поддерживаются в Iris, и какие модели нужно передавать или ожидать.

## Главный принцип

Для действия `Write` Iris в большинстве случаев использует те же модели, что и обычные синхронные методы `Apply` в API.

Примеры:

- для машины используется то же тело, что и в `/api/car/apply`
- для водителя используется то же тело, что и в `/api/driver/apply`
- для прицепа используется то же тело, что и в `/api/trailer/apply`
- для заявки используется то же тело, что и в `/api/truckingbids/apply`

То есть при переходе с обычного sync API на Iris обычно не нужно изобретать новый формат объекта. В `body` передается та же модель, только она оборачивается в Iris-конверт `commands -> objects`.

## Важно

Это правило относится прежде всего к `Write`.

Для `Read` и `ReadQuery` модели ответа могут отличаться от моделей `Apply`, потому что для чтения используются специальные модели просмотра и синхронизации.

## Поддерживаемые `InternalEntityType`

Сейчас в Iris поддерживаются следующие типы:

- `Bid`
- `DistributionBid`
- `Car`
- `Trailer`
- `Driver`
- `Counterparty`

На данный момент `Catalog` через Iris не поддерживается.

## Поддерживаемые действия по типам

Для всех поддерживаемых типов сейчас есть:

- `Write`
- `Read`
- `ReadQuery`
- `Delete`

Для `ReadConfirmation` нет отдельного ограничения по типу объекта. Это служебное действие подтверждения ранее прочитанной версии и работает поверх уже прочитанных изменений.

## Справочник по типам

### `Car`

`InternalEntityType`: `Car`

#### `Write`

- Iris body: `CarEditModel`
- Обычный sync endpoint: `POST /api/car/apply`

Принцип:

- в `body` передается тот же JSON, что и в `/api/car/apply`

#### `Read`

- Основная модель ответа: `CarForSyncModel`
- Если `sourceType = Forwarding`: `CarNumber`

#### `ReadQuery`

- Модель списка: `CarListViewModel`
- Логически соответствует списковым методам машин

#### `Delete`

- Удаление по `id`
- Обычный sync endpoint: `POST /api/car/delete`
- Внутри используется логика `CarDeleteModel`

### `Trailer`

`InternalEntityType`: `Trailer`

#### `Write`

- Iris body: `TrailerEditModel`
- Обычный sync endpoint: `POST /api/trailer/apply`

#### `Read`

- Основная модель ответа: `TrailerListViewModel`
- Если `sourceType = Forwarding`: `TrailerNumberModel`

#### `ReadQuery`

- Модель списка: `TrailerListViewModel`

#### `Delete`

- Удаление по `id`
- Обычный sync endpoint: `POST /api/trailer/delete`
- Внутри используется логика `TrailerDeleteModel`

### `Driver`

`InternalEntityType`: `Driver`

#### `Write`

- Iris body: `DriverEditModel`
- Обычный sync endpoint: `POST /api/driver/apply`

#### `Read`

- Основная модель ответа: `DriverViewModel`
- Если `sourceType = Forwarding`: `DriverUserNameAndPhoneModel`

#### `ReadQuery`

- Модель списка: `DriverListViewModel`

#### `Delete`

- Удаление по `id`
- Обычный sync endpoint: `POST /api/driver/delete`
- Внутри используется логика `DriverDeleteModel`

### `Bid`

`InternalEntityType`: `Bid`

#### `Write`

- Iris body: `BidTruckingEditModel`
- Обычный sync endpoint: `POST /api/truckingbids/apply`

#### `Read`

Возможны разные модели в зависимости от `sourceType` и `modelType`:

- обычный сценарий: `BidForExternalSyncModel`
- если `sourceType = Forwarding` и `modelType = Default`: `BidSyncInfoForForwardingModel`
- если `sourceType = Forwarding` и `modelType = BidSharedInfoForForwardingModel`: `BidSharedInfoForForwardingModel`

#### `ReadQuery`

- обычный сценарий: коллекция `BidListItemModel`
- forwarding-сценарий с `modelType = BidSharedInfoForForwardingModel`: коллекция `BidSharedInfoForForwardingModel`

#### `Delete`

- Удаление по `id`
- Обычный sync endpoint: `POST /api/truckingbids/delete`
- Внутри используется логика `BidDeleteModel`

### `DistributionBid`

`InternalEntityType`: `DistributionBid`

#### `Write`

- Iris body: `DistributionBidEditModel`
- Ближайший sync endpoint: `POST /api/distributionbids/apply`

## Важно

Здесь есть исключение.

Обычный sync endpoint `/api/distributionbids/apply` принимает не один `DistributionBidEditModel`, а batch-обертку `DistributionBidBatchEditModel`, внутри которой находится `items`.

В Iris один объект `objects[]` для `DistributionBid` должен содержать именно один `DistributionBidEditModel`, без внешней batch-обертки.

То есть:

- sync API: `{ "items": [ ... ] }`
- Iris object body: сам один элемент `DistributionBidEditModel`

#### `Read`

- Основная модель ответа: `DistributionBidForExternalSyncModel`
- Для `SourceType.Forwarding` чтение этого типа не поддерживается

#### `ReadQuery`

- Модель списка: `DistributionBidListModel`
- Для `SourceType.Forwarding` query-чтение этого типа не поддерживается

#### `Delete`

- Удаление по `id`
- Обычный sync endpoint: `POST /api/distributionbids/delete`
- Внутри используется логика `DistributionBidDeleteModel`

### `Counterparty`

`InternalEntityType`: `Counterparty`

#### `Write`

- Iris body: `CounterpartyEditModel`
- Обычный sync endpoint: `POST /api/cargoownerdictionary/apply`

#### `Read`

- Основная модель ответа: `CounterpartyModel`
- Если `sourceType = Forwarding`: `CounterpartyForForwardingModel`

#### `ReadQuery`

- обычный сценарий: коллекция `CounterpartyModel`
- если `sourceType = Forwarding`: коллекция `CounterpartyForForwardingModel`

#### `Delete`

- Удаление по `id`
- Обычный sync endpoint: `POST /api/cargoownerdictionary/delete`
- Внутри используется логика `CounterpartyDeleteModel`

## Что именно совпадает с обычными методами

### Для `Write`

Совпадает именно `body` внутри Iris-объекта.

Пример для машины:

Обычный sync API:

```json
{
  "brandTypeId": 1,
  "number": "А123АА777"
}
```

Iris:

```json
{
  "commands": [
    {
      "action": "Write",
      "objects": [
        {
          "type": "Car",
          "modelType": "Default",
          "body": {
            "brandTypeId": 1,
            "number": "А123АА777"
          }
        }
      ]
    }
  ]
}
```

То есть содержимое `body` — то же самое, что и JSON body у обычного `/apply`.

### Для `Delete`

В Iris обычно достаточно передать:

- `type`
- `id`

При этом внутри все равно используется та же доменная логика, что и в обычных sync delete-методах.

### Для `ReadQuery`

Логика соответствует обычным list-методам, но форма запроса другая:

- в обычном API query идет в URL
- в Iris query передается в поле `query`

Пример:

- обычный API: `GET /api/car/getlist?$top=100`
- Iris: объект с `query = "$top=100"`

## Что не совпадает полностью

### `DistributionBid`

Это главное исключение по `Write`.

Обычный API:

- принимает `DistributionBidBatchEditModel`

Iris:

- принимает один `DistributionBidEditModel` на один объект

### `Read`

У `Read` и `ReadQuery` часто используются специальные модели чтения:

- не `EditModel`
- а `ViewModel`, `ListModel`, `ForSyncModel`, `ForForwardingModel`

Поэтому клиенту нельзя ожидать, что результат `Read` будет тем же JSON, который раньше отправлялся в `Apply`.

## Особенности для CARGORUN Загрузки (type = Forwarding).

Для части типов поведение зависит от `sourceType = Forwarding`.

Это актуально для:

- `Bid`
- `Car`
- `Trailer`
- `Driver`
- `Counterparty`

В forwarding-сценариях Iris может:

- вернуть другую модель чтения
- использовать другой `modelType`
- не поддерживать некоторые варианты чтения, как в случае `DistributionBid`

Если клиент интегрируется не с forwarding-сценарием, рекомендуется использовать:

- `modelType = Default`
- `sourceType = null`

## Краткая таблица

| InternalEntityType | Write body | Sync apply endpoint | Read model |
| --- | --- | --- | --- |
| `Car` | `CarEditModel` | `/api/car/apply` | `CarForSyncModel` |
| `Trailer` | `TrailerEditModel` | `/api/trailer/apply` | `TrailerListViewModel` |
| `Driver` | `DriverEditModel` | `/api/driver/apply` | `DriverViewModel` |
| `Bid` | `BidTruckingEditModel` | `/api/truckingbids/apply` | `BidForExternalSyncModel` |
| `DistributionBid` | `DistributionBidEditModel` | `/api/distributionbids/apply` | `DistributionBidForExternalSyncModel` |
| `Counterparty` | `CounterpartyEditModel` | `/api/cargoownerdictionary/apply` | `CounterpartyModel` |

## Что сейчас не поддерживается

Через Iris сейчас не поддерживаются:

- `Catalog`
- любые типы, для которых нет зарегистрированного Iris handler

Если клиент попытается использовать неподдерживаемую комбинацию `action + type + modelType + sourceType`, запрос будет отклонен валидацией.

## Рекомендации клиенту

1. Для `Write` брать JSON body из существующего sync `/apply` метода.
2. Для `DistributionBid` использовать не batch-обертку, а один `DistributionBidEditModel` на один Iris object.
3. Для `Read` не ожидать возврата `EditModel`.
4. Если forwarding-сценарий не нужен, использовать `modelType = Default` и не передавать `sourceType`.
