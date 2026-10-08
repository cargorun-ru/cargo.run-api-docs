# Отслеживание исполнения

После получения `id` заявки CARGO.RUN партнёр может читать её текущие данные синхронно или через очередь.

## Синхронные методы

| Данные | Метод |
|---|---|
| Карточка и ETA | [`GET /api/integrations/Bids/Get`](../reference/endpoints.md#get-apiintegrationsbidsget) |
| События | [`GET /api/integrations/Bids/GetEvents`](../reference/endpoints.md#get-apiintegrationsbidsgetevents) |
| Плановый маршрут | [`GET /api/integrations/Bids/GetPlannedRoute`](../reference/endpoints.md#get-apiintegrationsbidsgetplannedroute) |
| Фактический маршрут | [`GET /api/integrations/Bids/GetActualRoute`](../reference/endpoints.md#get-apiintegrationsbidsgetactualroute) |
| Сообщения и файлы | [`GET /api/integrations/Bids/GetDriverMessages`](../reference/endpoints.md#get-apiintegrationsbidsgetdrivermessages) |

## Статус и события — разные данные

Поле `status` в карточке или краткой модели заявки содержит её текущее состояние: `New`, `Planned`, `Started`, `Canceled` или `Done`. Именно это поле используйте для синхронизации статуса заказа во внешней системе.

`Bids/GetEvents` возвращает этапы исполнения, вычисленные по фактическим датам. Отмена и удаление представлены событиями `BidCanceled` и `BidDeleted`. Текущее состояние заявки всё равно определяйте по `BidStatus`, а события используйте как хронологию изменений.

## Полное чтение через очередь

```json
{
  "commands": [
    {
      "action": "Read",
      "objects": [
        {
          "type": "Bid",
          "modelType": "Default",
          "id": 12345
        }
      ]
    }
  ]
}
```

`objects[].body` содержит `IntegrationBidDetailsModel`:

- `externalId`;
- `bid` — карточка заявки и ETA;
- `plannedRoute`;
- `events`;
- `driverMessages`.

Фактическая геометрия маршрута не включается из-за объёма.

## ETA

ETA находится в `bid.estimation`:

```json
{
  "estimatedDate": "2026-10-08T15:00:00+03:00",
  "manualEstimatedLeaveDate": null
}
```

`estimatedDate` возвращается в часовом поясе последней точки заявки.

Фрагмент ответа `Bids/Get`:

```json
{
  "id": 12345,
  "status": "Started",
  "updatedAt": "2026-10-08T12:05:00+03:00",
  "externalId": "ORDER-2471970",
  "estimation": {
    "estimatedDate": "2026-10-08T15:00:00+03:00",
    "manualEstimatedLeaveDate": null
  }
}
```

## События

```json
[
  {
    "type": "EnteredPointByDriver",
    "fixedAt": "2026-10-08T12:00:00+03:00",
    "bidPointId": 456,
    "bidPointOrder": 1
  }
]
```

Для события точки `fixedAt` использует часовой пояс этой точки, для остальных событий — часовой пояс организации.

## Плановый маршрут

Содержит расстояния в метрах и продолжительность в секундах. Синхронный `GetPlannedRoute` возвращает расчётные показатели; асинхронный `IntegrationBidDetailsModel.plannedRoute` использует ту же модель.

```json
{
  "id": 70001,
  "distance": 815000,
  "duration": 39600,
  "distanceWithoutEmptyMileage": 800000,
  "emptyMileageDistance": 15000,
  "durationWithoutEmptyMileage": 37800
}
```

## Фактический маршрут

```http
GET <baseUrl>/api/integrations/Bids/GetActualRoute?id=12345&coordinateIntervalSeconds=60
Authorization: Bearer <accessToken.token>
```

`coordinateIntervalSeconds` задаёт минимальный интервал между координатами; значение по умолчанию — `60`, значение `0` отключает прореживание.

`isMobile=true` означает мобильные координаты, `false` — другой источник, например телематика.

```json
[
  {
    "emptyMileageRoute": [],
    "mainRoute": [
      {
        "coordinate": [37.6176, 55.7558],
        "fixedAt": "2026-10-08T12:00:00+03:00"
      }
    ],
    "carId": 501,
    "carNumber": "А123АА777",
    "hasActiveMileage": true,
    "isMobile": true
  }
]
```

## Сообщения и файлы

Синхронный метод поддерживает OData и `X-MetaCount`. Он возвращает расширенную `ChatMessageGetModel`, включая `type` и `flags`. В полном асинхронном ответе `driverMessages` содержит сокращённую модель без этих двух полей.

`accessUrlLink` — временная ссылка на файл. Скачайте файл сразу либо повторно прочитайте заявку для получения новой ссылки.

```json
[
  {
    "id": 80001,
    "text": "Документы загружены",
    "createdAt": "2026-10-08T12:10:00+03:00",
    "chatId": 90001,
    "isDeleted": false,
    "files": [
      {
        "id": 81001,
        "originalFileName": "documents.pdf",
        "accessUrlLink": "https://files.example/download/temporary-token"
      }
    ],
    "type": "User"
  }
]
```
