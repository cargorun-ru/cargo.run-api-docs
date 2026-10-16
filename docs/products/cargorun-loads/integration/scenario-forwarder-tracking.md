# Сценарий: отслеживание грузоперевозки экспедитором

Сценарий предназначен для экспедитора, который ведет заказ в своей системе и хочет получать данные об исполнении перевозки из **CARGO.RUN Загрузки**. Перевозчик при этом может не работать в **CARGO.RUN Логистика**.

## Предварительные условия

- экспедитору создан кабинет в **CARGO.RUN Загрузки** и выданы права API;
- для кабинета настроена интеграция с поддерживаемой системой мониторинга;
- в системе мониторинга ТС определяется по госномеру;
- справочные ID, используемые в запросах, заранее получены через API.

Настройка кабинета и подключения к системе мониторинга выполняется при внедрении и не является операцией публичного API.

## Последовательность

1. Создайте заказ через [`POST /api/Orders/Apply`](../api/orders.md#orders-apply).
2. Если заказ сохранен как черновик, запустите его через [`POST /api/Orders/StartOrder`](../api/order-lifecycle.md#orders-start-order).
3. Назначьте перевозчика, ТС и водителя одним из методов ручного назначения.
4. После назначения CARGO.RUN пытается сопоставить госномер ТС с данными настроенной системы мониторинга.
5. В период исполнения запрашивайте [`GET /api/Orders/GetInfo?Id={order_id}`](../api/orders.md#orders-get-info).
6. После завершения заявки получение актуальной GPS-позиции в рамках заказа прекращается автоматически.

## Выбор метода ручного назначения

| Исходные данные | Метод |
|---|---|
| Перевозчик, ТС и водитель уже заведены в справочниках | [`POST /api/Orders/MatchManually`](../api/order-responses.md#orders-match-manually) |
| Нужно передать нового перевозчика или новый госномер и сведения о водителе вручную | [`POST /api/Orders/MatchManuallyExtended`](../api/order-responses.md#orders-match-manually-extended) |

`MatchManually` нельзя использовать только с названием перевозчика и госномером: метод требует существующие `forwardingOrganizationId`, `truckId` и `driverId`.

### Пример назначения существующего ТС

```http
POST /api/Orders/MatchManually
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "id": 1552779,
  "forwardingOrganizationId": 95713,
  "truckId": 1001,
  "trailerId": null,
  "driverId": 3001,
  "orderCost": 129000,
  "invitedFleetPrice": 125600,
  "transporterNdsTypeId": 1,
  "reason": "Назначение по договоренности"
}
```

### Пример назначения с новым госномером

```http
POST /api/Orders/MatchManuallyExtended
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "id": 1552779,
  "organizationName": "ООО Перевозчик",
  "inn": "1650000000",
  "kpp": "165001001",
  "truckNumber": "А123ВС16",
  "truckModelTypeId": 10,
  "truckOwnershipTypeId": 20,
  "driverLastName": "Иванов",
  "driverFirstName": "Иван",
  "driverPatronymic": "Иванович",
  "driverPhoneNumber": "+79990000000",
  "orderCost": 129000,
  "invitedFleetPrice": 125600,
  "transporterNdsTypeId": 1,
  "reason": "Назначение внешнего перевозчика"
}
```

Значения справочников в примере условные. Передавайте ID своей среды.

## Получение данных об исполнении

```http
GET /api/Orders/GetInfo?Id=1552779
Authorization: Bearer <access_token>
```

Проверяйте следующие поля ответа:

| Данные | Поля |
|---|---|
| Состояние заказа | `status` |
| Назначенное ТС | `truckNumber`, `truckOrganizationName`, `driverFullName` |
| Текущее положение | `truckCurrentLocation.latitude`, `truckCurrentLocation.longitude` |
| Актуальность положения | `truckCurrentLocation.fixedAt` |
| Прогноз по точкам | `points[].predictionEnterTimeOffset`, `points[].predictionLeaveTimeOffset` |
| Фактические даты | `points[].factEnterTimeOffset`, `points[].factLeaveTimeOffset` |

Пример фрагмента ответа:

```json
{
  "id": 1552779,
  "status": 40,
  "truckNumber": "А123ВС16",
  "truckCurrentLocation": {
    "latitude": 55.796127,
    "longitude": 49.106414,
    "fixedAt": "2026-10-16T09:42:18+03:00"
  },
  "points": [
    {
      "id": 501,
      "factEnterTimeOffset": "2026-10-16T08:10:00+03:00",
      "factLeaveTimeOffset": "2026-10-16T09:00:00+03:00"
    }
  ]
}
```

## Если координаты отсутствуют

Пустое `truckCurrentLocation` не следует считать ошибкой API. Проверьте:

1. совпадает ли нормализованный госномер с номером в системе мониторинга;
2. настроена ли интеграция мониторинга для кабинета;
3. передает ли трекер свежие данные;
4. находится ли заказ в периоде исполнения.

Не подменяйте последнюю известную позицию текущей без проверки `fixedAt`.

## Завершение

Отдельный запрос для отключения GPS-трансляции не требуется. После завершения заявки система прекращает получать актуальную позицию в рамках заказа. Последнее возвращенное положение может оставаться историческим значением, поэтому всегда учитывайте `status` заказа и `truckCurrentLocation.fixedAt`.
