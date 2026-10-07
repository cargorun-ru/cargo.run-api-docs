# Возможные значения полей

## `BidStatus`

| JSON | Код в реализации | Значение |
|---|---:|---|
| `New` | 0 | Черновик |
| `Planned` | 5 | Запланирована, но ещё не запущена |
| `Started` | 10 | Запущена в работу |
| `Canceled` | 20 | Отменена |
| `Done` | 30 | Выполнена |

## `IntegrationBidEventType`

| JSON | Код | Значение |
|---|---:|---|
| `BidStarted` | 1 | Заявка запущена |
| `AcceptedByDriver` | 2 | Принята водителем |
| `AcceptedByDriverForwarder` | 3 | Принята водителем-экспедитором |
| `EnteredPointByDriver` | 4 | Водитель отметил прибытие на точку |
| `LoadUnloadedByDriver` | 5 | Водитель отметил погрузку/выгрузку и выезд |
| `DocumentsReceivedByDriver` | 6 | Водитель подтвердил получение документов |
| `BidCompleted` | 7 | Заявка завершена |

## `QueuedApiTaskAction`

| JSON | Код | Доступность партнёру |
|---|---:|---|
| `Write` | 0 | Да, для `Bid` |
| `Read` | 1 | Да, для `Bid` с указанным `id` |
| `ReadConfirmation` | 2 | Нет |
| `ReadQuery` | 3 | Да, для `Bid` |
| `Delete` | 4 | Нет |

## `QueuedApiTaskStatus`

| JSON | Код | Значение |
|---|---:|---|
| `Awaiting` | 0 | Ожидает выполнения |
| `InProgress` | 1 | Выполняется |
| `Completed` | 2 | Завершена; нужно проверить каждый объект |
| `Error` | 3 | Задача завершилась системной ошибкой |

## `QueuedApiTaskEnqueueStatus`

| JSON | Код | Значение |
|---|---:|---|
| `Success` | 0 | Команда поставлена в очередь; поле `id` заполнено |
| `Failed` | 1 | Команда не поставлена; причина находится в `message` |

## `QueuedApiTaskOrigin`

| JSON | Код | Значение |
|---|---:|---|
| `Request` | 0 | Задача создана запросом партнёра |
| `Subscription` | 1 | Задача создана CARGO.RUN по подписке |

## `QueuedApiTaskCallbackStatus`

| JSON | Код | Значение |
|---|---:|---|
| `None` | 0 | Callback отсутствует или доставка ещё не назначена |
| `Awaiting` | 1 | Ожидает доставки |
| `InProgress` | 2 | Выполняется попытка доставки |
| `Delivered` | 3 | Доставлен успешно |
| `Error` | 4 | Доставка завершилась ошибкой |

## `QueuedApiTaskObjectResultStatus`

| JSON | Код | Значение |
|---|---:|---|
| `Created` | 0 | Результат создан, обработка не завершена |
| `Success` | 1 | Объект обработан успешно |
| `Error` | 2 | Ошибка конкретного объекта |
| `VersionMismatch` | 3 | Версия не совпала; в партнёрском сценарии обычно не используется |

## `QueuedApiTaskModelType`

| JSON | Код | Доступность партнёру |
|---|---:|---|
| `Default` | 0 | Полная модель или стандартная модель операции |
| `BidSharedInfoForForwardingModel` | 1 | Не используется партнёрским API |
| `Summary` | 2 | Краткая карточка заявки |

## `InternalEntityType`

| JSON | Код | Доступность в партнёрской очереди |
|---|---:|---|
| `Bid` | 1 | Поддерживается |
| `DistributionBid` | 2 | Не поддерживается |
| `Car` | 3 | Не поддерживается |
| `Trailer` | 4 | Не поддерживается |
| `Driver` | 5 | Не поддерживается |
| `Counterparty` | 6 | Не поддерживается |

## `SourceType`

Поле является служебным. Для партнёрской очереди сервер устанавливает `ExternalIntegration` автоматически; передавать `sourceType` не нужно.

| JSON | Код |
|---|---:|
| `Web` | 0 |
| `Enterprise` | 1 |
| `Forwarding` | 2 |
| `Exploitation` | 3 |
| `Kontur` | 4 |
| `ExternalIntegration` | 5 |

## Типы webhook

Это строковые значения заголовка, а не enum JSON:

| Значение | Смысл |
|---|---|
| `queued-task.finished` | Завершение задачи партнёра |
| `entity.changed` | Изменение связанной заявки |
| `ping` | Тест callback |

## `UserMessageType`

Поле присутствует в синхронной модели сообщений. Для основного сценария достаточно обрабатывать текст, дату и файлы.

| JSON | Код | Значение |
|---|---:|---|
| `User` | 0 | Сообщение пользователя |
| `System` | 10 | Системное уведомление |
| `BidStart` | 20 | Запуск заявки |
| `BidApproved` | 21 | Согласование заявки |
| `DriverControlPoints` | 22 | Задание водителю |
| `BidLateness` | 30 | Опоздание по заявке |
| `BidPointLateness` | 31 | Опоздание на точку |
| `TrackerLogsStopped` | 32 | Нет данных трекера |
| `CarStopped` | 33 | Длительная стоянка |
| `RouteEvents` | 34 | Отклонение от маршрута |
| `AxisLoadMonitoring` | 35 | Отклонение нагрузки на ось |
| `CarStaysAtBidPoint` | 36 | Задержка на точке |
| `BidAcceptLateness` | 37 | Заявка не принята вовремя |
| `TemperatureMonitoring` | 38 | Отклонение температуры |
| `BidRefuelingPointArrival` | 40 | Прибытие/выезд с заправки |
| `BidPlannedRefuelings` | 41 | Планирование заправок |
| `RefuelingSkipped` | 42 | Пропуск заправки |
| `PointVisiting` | 50 | Прибытие/выезд с точки |
| `LoadLateness` | 60 | Опоздание на загрузку |
| `ServicePoints` | 70 | Сервисная точка |
| `Waybills` | 80 | Электронные путевые документы |
| `EmergencyAreaVisit` | 90 | Посещение аварийной зоны |
| `DocumentStatus` | 100 | Изменение статуса документа |
| `DocumentFile` | 101 | Файл документа |
| `RouteControlPoints` | 102 | Контроль планового маршрута |

## Остальные enum моделей заявки

Эти перечисления встречаются во вложенных полях полной карточки заявки.

### `BidPointType`

| JSON | Код | Значение |
|---|---:|---|
| `StartPoint` | 0 | Начальная, или нулевая, точка |
| `LoadPoint` | 1 | Погрузка |
| `UnloadPoint` | 2 | Выгрузка |
| `CustomPoint` | 3 | Пользовательская точка |
| `ServicePoint` | 4 | Сервисная точка |

### `BidPointLoadUnloadStatus`

| JSON | Код |
|---|---:|
| `AtLoading` | 0 |
| `Loaded` | 10 |
| `AtUnloading` | 20 |
| `Unloaded` | 30 |

### `BidPaymentStatus`

| JSON | Код |
|---|---:|
| `NotPaid` | 0 |
| `Paid` | 1 |
| `PartiallyPaid` | 2 |

### `DocumentsTrackingStatus`

| JSON | Код |
|---|---:|
| `NotShipped` | 0 |
| `InTransit` | 10 |
| `Delivered` | 20 |

### `InvoiceTriggerType`

| JSON | Код |
|---|---:|
| `ByOriginal` | 1 |
| `ByScan` | 2 |
| `AtUnloading` | 3 |

### `PaymentPeriodType`

| JSON | Код |
|---|---:|
| `InCalendarDays` | 1 |
| `InBankingDays` | 2 |

### `MapObjectType`

| JSON | Код |
|---|---:|
| `None` | 0 |
| `BidPoint` | 10 |
| `RouteSupportPoint` | 20 |
| `GasStation` | 21 |
| `StartBidPoint` | 40 |
| `PostamatPoint` | 50 |
| `ItemChangePoint` | 60 |
| `ItemChangePointAddress` | 61 |
| `ServicePoint` | 70 |
| `CounterpartyPoint` | 80 |
| `TripCouplingPoint` | 90 |
| `PlatonPoint` | 100 |
| `EmergencyAreaPoint` | 110 |
| `RouteControlPoint` | 120 |

### `RouterCountryType`

| JSON | Код |
|---|---:|
| `Russia` | 1 |

### `RouterProfile`

| JSON | Код |
|---|---:|
| `HgvOptimal` | 1 |
| `HgvShortest` | 2 |
| `Hgv15tOptimal` | 3 |
| `Lcv` | 4 |

### `QueuedApiTaskSyncStatus`

| JSON | Код |
|---|---:|
| `Info` | 0 |
| `Warn` | 1 |
| `Error` | 2 |

### `UserMessageFlag`

Флаговое поле: `None=0`, `Mentioned=1`.

### `UnitOfMeasure`

| JSON | Код | JSON | Код |
|---|---:|---|---:|
| `None` | 0 | `Piece` | 796 |
| `Kilogram` | 166 | `Gram` | 163 |
| `Tonne` | 168 | `Litre` | 112 |
| `Millilitre` | 111 | `Meter` | 6 |
| `Centimeter` | 4 | `Millimeter` | 3 |
| `LinearMeter` | 18 | `SquareMeter` | 55 |
| `CubicMeter` | 113 | `Package` | 778 |
| `Box` | 8751 | `Bottle` | 868 |
| `Can` | 881 | `Pack` | 728 |
| `Set` | 839 | `Pair` | 715 |
| `Hour` | 356 | `Minute` | 355 |
| `Day` | 359 | `Month` | 362 |
| `Year` | 366 | `ConditionalUnit` | 876 |
| `HorsePower` | 251 | — | — |
