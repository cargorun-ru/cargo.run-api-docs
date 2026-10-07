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

## События

```json
{
  "type": "EnteredPointByDriver",
  "fixedAt": "2026-10-08T12:00:00+03:00",
  "bidPointId": 456,
  "bidPointOrder": 1
}
```

Для события точки `fixedAt` использует часовой пояс этой точки, для остальных событий — часовой пояс организации.

## Плановый маршрут

Содержит расстояния в метрах и продолжительность в секундах. Синхронный `GetPlannedRoute` возвращает расчётные показатели; асинхронный `IntegrationBidDetailsModel.plannedRoute` использует ту же модель.

## Фактический маршрут

```http
GET <baseUrl>/api/integrations/Bids/GetActualRoute?id=12345&coordinateIntervalSeconds=60
Authorization: Bearer <accessToken.token>
```

`coordinateIntervalSeconds` задаёт минимальный интервал между координатами; значение по умолчанию — `60`, значение `0` отключает прореживание.

`isMobile=true` означает мобильные координаты, `false` — другой источник, например телематика.

## Сообщения и файлы

Синхронный метод поддерживает OData и `X-MetaCount`. В полном асинхронном ответе сообщения находятся в `driverMessages`.

`accessUrlLink` — временная ссылка на файл, обычно действующая 20–30 минут. Скачайте файл сразу либо повторно прочитайте заявку для получения новой ссылки.
