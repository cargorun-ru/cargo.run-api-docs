# Модели запросов и ответов

Колонка «Обязательно» отражает контракт партнёрского API с учётом бизнес-валидации конкретных операций. Все enum в JSON передаются строковыми значениями из раздела «Возможные значения полей».

## Результаты операций

### `ClientCredentialsTokenResponse`

| Поле | Тип | Обязательно | `null` | Описание |
|---|---|---:|---:|---|
| `accessToken` | `AccessToken` | Да | Нет | Токен доступа и срок действия |

### `AccessToken`

| Поле | Тип | Обязательно | `null` | Описание |
|---|---|---:|---:|---|
| `token` | `string` | Да | Нет | JWT для заголовка `Authorization` |
| `expiresIn` | `int32` | Да | Нет | Срок действия в секундах |

### `ApplyBidResultModel`

| Поле | Тип | Обязательно | `null` | Описание |
|---|---|---:|---:|---|
| `id` | `int64` | Да | Нет | ID созданной или обновлённой заявки CARGO.RUN |
| `isRouteBuilt` | `boolean` | Да | Нет | Маршрут успешно построен |

### `OrganizationApplyResult`

| Поле | Тип | Обязательно | `null` | Описание |
|---|---|---:|---:|---|
| `id` | `int64` | Да | Нет | ID созданной или найденной организации |

### `EnqueueApiTasksResponseModel`

| Поле | Тип | Обязательно | `null` | Описание |
|---|---|---:|---:|---|
| `latencyMsec` | `int32` | Да | Нет | Оценка задержки очереди в миллисекундах |
| `enqueuedInMsec` | `int32` | Да | Нет | Время постановки команд в миллисекундах |
| `commands` | `EnqueuedApiTaskResponseModel[]` | Да | Нет | Результат постановки каждой команды |

### `EnqueuedApiTaskResponseModel`

| Поле | Тип | Обязательно | `null` | Описание |
|---|---|---:|---:|---|
| `id` | `int64` | Нет | Да | ID задачи; отсутствует, если команда не поставлена |
| `action` | `QueuedApiTaskAction` | Да | Нет | Действие задачи |
| `status` | `QueuedApiTaskEnqueueStatus` | Да | Нет | Результат постановки |
| `readyInMsec` | `int64` | Да | Нет | Ориентировочная задержка до готовности |
| `message` | `string` | Нет | Да | Причина отказа в постановке |

### `QueuedApiTaskCallbackPayload`

| Поле | Тип | Обязательно | `null` | Описание |
|---|---|---:|---:|---|
| `eventId` | `uuid` | Да | Нет | Уникальный ID события для дедупликации |
| `taskId` | `int64` | Да | Нет | ID задачи |
| `action` | `QueuedApiTaskAction` | Да | Нет | Действие задачи |
| `status` | `QueuedApiTaskStatus` | Да | Нет | Статус задачи |
| `origin` | `QueuedApiTaskOrigin` | Да | Нет | Запрос партнёра или подписка |
| `completedAt` | `date-time` | Нет | Да | Время завершения |
| `attemptCount` | `int32` | Да | Нет | Число попыток обработки задачи |
| `maxAttemptCount` | `int32` | Да | Нет | Максимум попыток обработки |
| `message` | `string` | Нет | Да | Сообщение задачи |
| `objects` | `QueuedApiTaskObjectResultModel[]` | Нет | Да | Результаты объектов |

## Основные модели запросов и ответов

### `ClientCredentialsTokenModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `grantType` | `string` | Да | Нет | значение: `client_credentials` | Тип выдачи токена. Передавайте фиксированное значение `client_credentials`. |
| `clientId` | `string` | Да | Нет | — | Идентификатор интеграционного клиента, выданный CARGO.RUN. |
| `clientSecret` | `string` | Да | Нет | — | Секрет интеграционного клиента, выданный CARGO.RUN. |

### `IntegrationOrganizationCheckModel`

Результат проверки доступности организации для партнёрского сервиса.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `exists` | `boolean` | Да | Нет | — | Организация с указанным ИНН существует. |
| `canCreateBids` | `boolean` | Да | Нет | — | Для организации разрешено создавать заявки партнёрским сервисам. |
| `hasAccess` | `boolean` | Да | Нет | — | Текущий партнёрский сервис уже имеет доступ к организации. |

### `CreateIntegrationOrganizationContext`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `name` | `string` | Нет | Да | — | Название |
| `inn` | `string` | Нет | Да | — | ИНН |
| `kpp` | `string` | Нет | Да | — | КПП |
| `ogrn` | `string` | Нет | Да | — | ОГРН |

### `ApplyBidFromIntegrationContext`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `bid` | `IntegrationBidEditModel` | Да | Нет | — | Данные заявки. |
| `inn` | `string` | Да | Нет | — | ИНН организации перевозчика: 10 цифр для организации или 12 цифр для ИП. Обязателен при синхронном и асинхронном создании или обновлении заявки. |

### `IntegrationBidEditModel`

Данные заявки, полученные от партнёрского сервиса.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Нет | Нет | — | Идентификатор заявки. Можно не указывать при создании.<br>При последующем обновлении заявки необходимо указывать. |
| `externalId` | `string` | Нет | Да | max length: `72` | Идентификатор заявки в партнёрском сервисе. |
| `comment` | `string` | Нет | Да | max length: `4096` | Комментарий. |
| `clientBidNumber` | `string` | Нет | Да | max length: `256` | Номер заявки клиента. |
| `clientBidDate` | `date-time` | Нет | Да | — | Дата заявки клиента. |
| `price` | `double` | Нет | Да | min: `0`; max: `9999999999` | Стоимость перевозки.<br>Если не указана, заявка создаётся как заявка на порожний пробег. |
| `isVatTop` | `boolean` | Нет | Да | — | НДС начисляется сверху. |
| `vat` | `string` | Нет | Да | — | Ставка НДС: текст должен содержать 0, 10, 20 или 22.<br>Обязательна, если указана стоимость перевозки. |
| `bidPoints` | `IntegrationBidPointModel[]` | Да | Нет | min items: `2` | Точки маршрута: минимум одна точка погрузки и одна точка выгрузки. CARGO.RUN сортирует точки по `planEnterDate`. |
| `cargos` | `CargoModel[]` | Да | Нет | — | Грузы. Передайте как минимум один груз; у каждого груза обязательно поле `name`. |
| `car` | `IntegrationVehicleModel` | Да | Нет | — | ТС. |
| `trailer` | `IntegrationVehicleModel` | Нет | Нет | — | Прицеп. Необязателен; если объект передан, поле `number` обязательно. |
| `driver` | `IntegrationDriverModel` | Да | Нет | — | Водитель. |
| `secondaryDriver` | `IntegrationDriverModel` | Нет | Нет | — | Второй водитель. |

### `IntegrationBidListModel`

Краткие данные заявки, созданной партнёрским сервисом.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | Идентификатор заявки Cargo.Run. |
| `externalId` | `string` | Нет | Да | — | В `Bids/GetList` — идентификатор, переданный партнёром при создании заявки; в `Bids/GetCurrentList` — идентификатор заказа, указанный перевозчиком для платформы партнёра. |
| `status` | `BidStatus` | Да | Нет | — | Статус заявки BidStatus |
| `isDeleted` | `boolean` | Да | Нет | — | Заявка удалена. Данные удалённой заявки не читаются, партнёрскому сервису следует прекратить её отслеживание |
| `createdAt` | `date-time` | Да | Нет | — | Дата создания в часовом поясе организации |
| `updatedAt` | `date-time` | Да | Нет | — | Дата последнего изменения заявки. Для курсорной выборки используйте `$filter=updatedAt gt {курсор}&$orderby=updatedAt,id` и небольшое перекрытие интервалов. |

### `BidForExternalSyncModel`

Модель заявки для синхронизации с внешними сервисами

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `price` | `double` | Нет | Да | — | Цена |
| `priceWithoutVatOnTop` | `double` | Нет | Да | — | Цена без НДС. Будет null, если isVatTop = false |
| `status` | `BidStatus` | Да | Нет | — | Статус заявки |
| `createdAt` | `date-time` | Да | Нет | — | Дата создания заявки |
| `externalUpdatedAt` | `date-time` | Нет | Да | — | Дата обновления из внешней системы |
| `acceptedByDriverForwarderAt` | `date-time` | Нет | Да | — | Дата принятия водителем-экспедитором |
| `hasFactoring` | `boolean` | Да | Нет | — | Заявка отправлена на факторинг? |
| `createdById` | `int64` | Да | Нет | — | Идентификатор пользователя, кто создал заявку |
| `paymentTypeId` | `int64` | Нет | Да | — | Идентификатор Типа оплаты |
| `ndsTypeId` | `int64` | Нет | Да | — | Идентификатор Типа ндс |
| `isVatTop` | `boolean` | Да | Нет | — | НДС сверху |
| `counterpartyId` | `int64` | Нет | Да | — | Контрагент |
| `contractId` | `int64` | Нет | Да | — | Договор контрагента |
| `isEmptyMileageBid` | `boolean` | Да | Нет | — | Порожняя заявка? |
| `driverId` | `int64` | Нет | Да | — | Текущий водитель заявки |
| `isDriverForwarder` | `boolean` | Да | Нет | — | Является ли водитель экспедитором? |
| `secondaryDriverId` | `int64` | Нет | Да | — | Второй водитель заявки |
| `approvedById` | `int64` | Нет | Да | — | Идентификатор пользователя-оператора, который согласовал заявку<br>(используется если у организации включен модуль согласования заявок) |
| `approvedAt` | `date-time` | Нет | Да | — | Дата согласования оператором (используется если у организации включен модуль согласования заявок) |
| `responsibleId` | `int64` | Нет | Да | — | Идентификатор ответственного |
| `salesManagerId` | `int64` | Нет | Да | — | Идентификатор менеджера по продажам |
| `carLogistId` | `int64` | Нет | Да | — | Идентификатор логиста, который был привязан к машине на момент создания заявки |
| `distributionBidId` | `int64` | Нет | Да | — | Идентификатор заказа, из которого создана эта заявка |
| `routeId` | `int64` | Нет | Да | — | Идентификатор маршрута |
| `planMileage` | `double` | Да | Нет | — | Плановый пробег (метры) |
| `factMileage` | `double` | Да | Нет | — | Фактический пробег (метры) |
| `planEmptyMileageBefore` | `double` | Да | Нет | — | Плановый порожний пробег до текущей заявки от предыдущей (метры) |
| `factEmptyMileageBefore` | `double` | Да | Нет | — | Фактический порожний пробег до первой точки текущей заявки, включая пробег предыдущей порожней заявки (метры) |
| `factEmptyMileageFromStartPoint` | `double` | Да | Нет | — | Фактический порожний пробег внутри заявки. Включает в себя пробег от нулевой до первой точки текущей заявки (метры) |
| `factEmptyOdometerMileageBefore` | `double` | Да | Нет | — | Фактический порожний пробег по одометру до первой точки текущей заявки, включая пробег предыдущей порожней заявки (метры) |
| `factEmptyOdometerMileageFromStartPoint` | `double` | Да | Нет | — | Фактический порожний пробег по одометру внутри заявки. Включает в себя пробег от нулевой до первой точки текущей заявки (метры) |
| `updatedAt` | `date-time` | Да | Нет | — | Дата обновления |
| `car` | `CarSimpleModel` | Нет | Нет | — | Машина |
| `trailer` | `TrailerListViewModel` | Нет | Нет | — | Прицеп |
| `legalPerson` | `IdNameModel` | Нет | Нет | — | Юр. лицо |
| `estimation` | `BidEstimationModel` | Нет | Нет | — | Расчетная информация |
| `bidPointLoadUnloadStatus` | `BidPointLoadUnloadStatus` | Нет | Да | — | — |
| `bidPoints` | `BidPointViewModel[]` | Нет | Да | — | Точки загрузки |
| `cargos` | `CargoModel[]` | Нет | Да | — | Грузы |
| `typeOptions` | `TypeOptionModel[]` | Нет | Да | — | Дополнительные опции типов для заявки |
| `temperatureRegime` | `BidTemperatureRegimeModel` | Нет | Нет | — | Температурный режим заявки |
| `temperature` | `TemperatureValueModel` | Нет | Нет | — | Текущая информация о температуре |
| `isInternational` | `boolean` | Да | Нет | — | — |
| `documents` | `RelatedDocumentModel[]` | Нет | Да | — | Список документов |
| `extendedProperties` | `PropertyNameValueJsonObject[]` | Нет | Да | — | Дополнительные поля заявки |
| `externalId` | `string` | Нет | Да | — | — |
| `contractNumber` | `string` | Нет | Да | — | Номер договора |
| `comment` | `string` | Нет | Да | — | Комментарий |
| `clientBidNumber` | `string` | Нет | Да | — | Номер заявки клиента |
| `clientBidDate` | `date-time` | Нет | Да | — | Дата заявки клиента |
| `paymentPeriodInDays` | `int32` | Нет | Да | — | Срок оплаты в днях |
| `paymentPeriodType` | `PaymentPeriodType` | Нет | Да | — | — |
| `invoiceTriggerType` | `InvoiceTriggerType` | Нет | Да | — | — |
| `sourceType` | `SourceType` | Да | Нет | — | Источник заявки в CARGO.RUN. Поле возвращается сервером; партнёр его не задаёт. |
| `acceptedByDriverAt` | `date-time` | Нет | Да | — | Дата принятия заявки водителем |
| `hasItemsChange` | `boolean` | Да | Нет | — | true если есть перецепка/пересменка |
| `isDeleted` | `boolean` | Да | Нет | — | Является ли сущность удаленной? |
| `createDocumentAssignment` | `boolean` | Да | Нет | — | Нужно ли создавать задание сдачи документов водителю после завершения заявки? |
| `hasServicePoints` | `boolean` | Да | Нет | — | true если есть точки сервисных работ |
| `isPreBid` | `boolean` | Да | Нет | — | Предзаявка |
| `payment` | `BidPaymentGetModel` | Нет | Нет | — | Информация об оплате заявки |
| `accessPermitIds` | `int64[]` | Нет | Да | — | Допуски и разрешения |

### `IntegrationBidDetailsModel`

Все данные заявки для партнёрского сервиса одним телом.
Возвращается при чтении заявки через очередь заданий (Read).
Фактический маршрут не включается из-за объёма, он доступен методом Bids/GetActualRoute.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `externalId` | `string` | Нет | Да | — | Идентификатор заявки на стороне партнёрского сервиса: внешний идентификатор для собственных заявок<br>или идентификатор заказа в партнёрском сервисе для транслируемых. |
| `bid` | `IntegrationBidDetailsModel.bid` | Нет | Нет | — | Модель заявки для синхронизации с внешними сервисами |
| `plannedRoute` | `IntegrationBidDetailsModel.plannedRoute` | Нет | Нет | — | — |
| `events` | `IntegrationBidDetailsModel.events[]` | Нет | Да | — | События по заявке, вычисленные из фактических дат, как в методе Bids/GetEvents. |
| `driverMessages` | `IntegrationBidDetailsModel.driverMessages[]` | Нет | Да | — | Сокращённые сообщения водителя. Поля `type` и `flags` доступны только в синхронной модели `ChatMessageGetModel`. |

### `IntegrationBidEventModel`

Событие по заявке, вычисленное из фактических дат заявки и ее точек.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `type` | `IntegrationBidEventType` | Да | Нет | — | Тип события. |
| `fixedAt` | `date-time` | Да | Нет | — | Дата события. |
| `bidPointId` | `int64` | Нет | Да | — | Идентификатор точки заявки, если событие относится к точке. |
| `bidPointOrder` | `int32` | Нет | Да | — | Порядок точки в маршруте. |

### `RouteSimpleModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `distance` | `double` | Да | Нет | — | Дистанция маршрута в метрах |
| `duration` | `double` | Да | Нет | — | Продолжительность маршрута в секундах |
| `distanceWithoutEmptyMileage` | `double` | Да | Нет | — | Дистанция маршрута от первой точки до последней, в метрах |
| `emptyMileageDistance` | `double` | Да | Нет | — | Дистанция маршрута от нулевой точки до первой точки, в метрах |
| `durationWithoutEmptyMileage` | `double` | Да | Нет | — | Продолжительность маршрута от первой точки до последней, в секундах |
| `routeOptions` | `RouteOptions` | Нет | Нет | — | Опции графхоппера |

### `CarRouteForExternalModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `emptyMileageRoute` | `TraveledRouteFixedAtPartModel[]` | Нет | Да | — | Пройденный маршрут от точки 0 до точки А (координаты + время фиксации) |
| `mainRoute` | `TraveledRouteFixedAtPartModel[]` | Нет | Да | — | Пройденный маршрут от точки А до конца маршрута (координаты + время фиксации) |
| `carId` | `int64` | Да | Нет | — | Идентификатор машины |
| `carNumber` | `string` | Нет | Да | — | Номер машины |
| `hasActiveMileage` | `boolean` | Да | Нет | — | У заявки есть активный пробег (заехала в первую точку по заявке) |
| `isMobile` | `boolean` | Да | Нет | — | Данная часть маршрута построена из мобильных координат |

### `ChatMessageGetModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `text` | `string` | Нет | Да | — | Текст |
| `createdAt` | `date-time` | Да | Нет | — | Дата написания |
| `chatId` | `int64` | Да | Нет | — | — |
| `createdById` | `int64` | Нет | Да | — | — |
| `fileId` | `int64` | Нет | Да | — | Устаревшее поле. В новой интеграции используйте `files[]`. |
| `fileIds` | `int64[]` | Нет | Да | — | Устаревшее поле. В новой интеграции используйте `files[]`. |
| `file` | `FileModel` | Нет | Нет | — | Устаревшее поле. В новой интеграции используйте `files[]`. |
| `createdBy` | `UserChatModel` | Нет | Нет | — | Профиль того, кто написал сообщение |
| `isDeleted` | `boolean` | Да | Нет | — | — |
| `userMessagesInfo` | `UserMessageInfoModel[]` | Нет | Да | — | — |
| `files` | `FileModel[]` | Нет | Да | — | Авторитетный список файлов сообщения для новой интеграции. |
| `type` | `UserMessageType` | Нет | Нет | — | — |

### `QueuedApiTaskCommandsCollectionModel`

Коллекция команд на выполнение

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `commands` | `QueuedApiTaskAddCommandsModel[]` | Нет | Да | — | Команды |

### `QueuedApiTaskAddCommandsModel`

Модель задания с указанным типом действия и объектами

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `action` | `QueuedApiTaskAction` | Да | Нет | — | Действие |
| `objects` | `QueuedApiTaskObjectAddModel[]` | Нет | Да | — | Объекты |

### `QueuedApiTaskObjectAddModel`

Модель объекта задания со статусом

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `modelType` | `QueuedApiTaskModelType` | Да | Нет | — | Тип модели объекта |
| `status` | `QueuedApiTaskObjectStatusJson` | Нет | Нет | — | Диагностический статус. В документированных партнёрских командах не передаётся. |
| `body` | `JsonObject` | Нет | Нет | — | Тело объекта. Обязательно для `action=Write`; для `Read` и `ReadQuery` не передаётся. |
| `key` | `string` | Нет | Да | — | Внешний ключ объекта |
| `type` | `InternalEntityType` | Да | Нет | — | Тип объекта |
| `sourceType` | `SourceType` | Нет | Да | — | Служебное поле. В документированных партнёрских командах не передаётся. |
| `id` | `int64` | Нет | Да | — | Внутренний идентификатор объекта, если null или 0, то будет создан новый объект |
| `version` | `uuid` | Нет | Да | — | Версия объекта. Если указано `id`, а `version` не передан, проверка версии не выполняется. |
| `query` | `string` | Нет | Да | — | OData-запрос для `ReadQuery`. При его использовании поля `id`, `version` и `key` не передаются. |

### `QueuedApiTaskGetResultsModel`

Модель для получения результатов

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `message` | `string` | Нет | Да | — | Сообщение |
| `status` | `QueuedApiTaskStatus` | Да | Нет | — | Статус задания |
| `origin` | `QueuedApiTaskOrigin` | Да | Нет | — | Источник задания: запрос клиента или подписка на изменения |
| `readyInMsec` | `int64` | Да | Нет | — | Примерное время, через которое можно будет получить результат |
| `remainingObjectCount` | `int32` | Да | Нет | — | Оставшееся количество объектов на выполнение |
| `attemptCount` | `int32` | Да | Нет | — | Текущая попытка обработки |
| `maxAttemptCount` | `int32` | Да | Нет | — | Максимально допустимое количество попыток |
| `nextRetryAt` | `date-time` | Нет | Да | — | Следующее запланированное время повтора |
| `callbackStatus` | `QueuedApiTaskCallbackStatus` | Да | Нет | — | Статус доставки webhook |
| `callbackAttemptCount` | `int32` | Да | Нет | — | Текущая попытка доставки задачи |
| `callbackMaxAttemptCount` | `int32` | Да | Нет | — | Максимально допустимое количество попыток доставки |
| `callbackNextRetryAt` | `date-time` | Нет | Да | — | Следующее запланированное время повтора доставки |
| `callbackDeliveredAt` | `date-time` | Нет | Да | — | Дата успешной доставки |
| `lastError` | `string` | Нет | Да | — | Последняя ошибка доставки |
| `objects` | `QueuedApiTaskObjectResultModel[]` | Нет | Да | — | Объекты |

### `QueuedApiTaskObjectResultModel`

Модель для элемента объекта при получении сформированных данных

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `message` | `string` | Нет | Да | — | Сообщение |
| `status` | `QueuedApiTaskObjectResultStatus` | Да | Нет | — | Статус |
| `body` | `JsonObject` | Нет | Нет | — | Данные |
| `key` | `string` | Нет | Да | — | Внешний ключ объекта |
| `type` | `InternalEntityType` | Да | Нет | — | Тип объекта |
| `sourceType` | `SourceType` | Нет | Да | — | — |
| `id` | `int64` | Нет | Да | — | Внутренний идентификатор обработанного объекта CARGO.RUN. |
| `version` | `uuid` | Нет | Да | — | Версия объекта. Если указано `id`, а `version` отсутствует, проверка версии не выполнялась. |
| `query` | `string` | Нет | Да | — | OData-запрос задачи `ReadQuery`; поля `id`, `version` и `key` для такой задачи отсутствуют. |

## Связанные модели

### `AverageAxisLoadValueModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `averageValue` | `double` | Нет | Да | — | Среднее значение |

### `AvoidSpecialRoadFlags`

Схема не содержит именованных полей.

### `AvoidTollRoadFlags`

Схема не содержит именованных полей.

### `BidEstimationModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `estimatedDate` | `date-time` | Нет | Да | — | Расчётная дата въезда |
| `manualEstimatedLeaveDate` | `date-time` | Нет | Да | — | Ручная дата выезда из точки |

### `BidPaymentGetModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `documentsTrackingStatus` | `DocumentsTrackingStatus` | Нет | Да | — | — |
| `plannedArrivalDate` | `date` | Нет | Да | — | — |
| `documentsReceiptDate` | `date` | Нет | Да | — | — |
| `invoiceDate` | `date` | Нет | Да | — | — |
| `planPaymentDate` | `date` | Нет | Да | — | — |
| `factPaymentDate` | `date` | Нет | Да | — | — |
| `paymentStatus` | `BidPaymentStatus` | Да | Нет | — | — |
| `isPaymentOverdue` | `boolean` | Да | Нет | — | — |
| `remainingPayment` | `double` | Нет | Да | — | — |
| `comment` | `string` | Нет | Да | — | — |
| `updatedAt` | `date-time` | Да | Нет | — | — |

### `BidPaymentStatus`

Схема не содержит именованных полей.

### `BidPointLoadUnloadStatus`

Схема не содержит именованных полей.

### `BidPointType`

Схема не содержит именованных полей.

### `BidPointViewModel`

Точка маршрута

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `order` | `int32` | Да | Нет | — | Порядок точки |
| `type` | `BidPointType` | Да | Нет | — | Тип точки |
| `counterpartyPointId` | `int64` | Нет | Да | — | — |
| `customPointTypeId` | `int64` | Нет | Да | — | — |
| `enteredAt` | `date-time` | Нет | Да | — | Дата въезда в геозону от водителя |
| `loadUnloadedAt` | `date-time` | Нет | Да | — | Дата загрузки/выгрузки от водителя |
| `documentsReceivedAt` | `date-time` | Нет | Да | — | Дата получения документов, от водителя |
| `autoEnteredAt` | `date-time` | Нет | Да | — | Автоматическая дата въезда в точку |
| `autoLeavedAt` | `date-time` | Нет | Да | — | Автоматическая дата выезда из точки |
| `enteredAtByLogist` | `date-time` | Нет | Да | — | Дата въезда в точку, проставленная логистом |
| `loadUnloadedAtByLogist` | `date-time` | Нет | Да | — | Дата выгрузки/выезда из точки, проставленная логистом |
| `axisLoadAfterLeaving` | `AverageAxisLoadValueModel` | Нет | Нет | — | Нагрузка на ось после выезда из точки |
| `servicePoint` | `ServicePointViewModel` | Нет | Нет | — | Точка сервисных работ |
| `scenarioId` | `int64` | Нет | Да | — | Сценарий для водителя |
| `planDistance` | `double` | Нет | Да | — | Плановое расстояние от предыдущей точки до текущей (метры) |
| `factDistance` | `double` | Нет | Да | — | Фактическое расстояние от предыдущей точки до текущей (метры) |
| `intOptions` | `int32` | Нет | Да | — | Опции точки |
| `client` | `string` | Нет | Да | — | — |
| `comment` | `string` | Нет | Да | — | Комментарий к точке |
| `externalId` | `string` | Нет | Да | — | Внешний ид точки |
| `externalCity` | `string` | Нет | Да | — | Город для внешних систем |
| `planEnterDate` | `date-time` | Да | Нет | — | Плановая локальная дата загрузки/выгрузки (по местному времени адреса точки). |
| `planEnterDateOffset` | `date-time` | Да | Нет | — | Плановая дата загрузки/выгрузки, вычисленная по плановой локальной дате, учитывая часовой пояс точки. |
| `planLeaveDateOffset` | `date-time` | Нет | Да | — | Плановая дата выезда. Если модуль планирования включен, вычисляется как плановая дата въезда + X часов. |
| `secondaryPlanEnterDate` | `date-time` | Нет | Да | — | Вторая плановая дата въезда |
| `secondaryPlanEnterDateOffset` | `date-time` | Нет | Да | — | Вторая плановая дата загрузки/выгрузки, вычисленная по плановой локальной дате, учитывая часовой пояс точки. |
| `planLeaveDate` | `date-time` | Нет | Да | — | Плановая дата выезда |
| `createdById` | `int64` | Да | Нет | — | — |
| `geozone` | `MapObjectModel` | Нет | Нет | — | Геозона |
| `contactPerson` | `ContactPersonModel` | Нет | Нет | — | Контактное лицо |
| `counterparty` | `CounterpartyViewModel` | Нет | Нет | — | Контрагент |
| `loadOptions` | `IdModel[]` | Нет | Да | — | Типы загрузок/выгрузок на точке |
| `typeOptions` | `TypeOptionModel[]` | Нет | Да | — | Дополнительные опции типов для точки |
| `extendedProperties` | `PropertyNameValueJsonObject[]` | Нет | Да | — | Дополнительные поля точки заявки |
| `customPointType` | `CustomPointTypeModel` | Нет | Нет | — | Тип произвольной точки |

### `BidStatus`

Схема не содержит именованных полей.

### `BidTemperatureRegimeModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `temperatureMinimum` | `float` | Нет | Да | — | — |
| `temperatureMaximum` | `float` | Нет | Да | — | — |

### `CarSimpleModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `number` | `string` | Нет | Да | — | — |
| `typeId` | `int64` | Да | Нет | — | — |
| `trackerId` | `int64` | Нет | Да | — | — |

### `CargoModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Да | Нет | — | Наименование |
| `weight` | `double` | Нет | Да | — | Вес |
| `volume` | `double` | Нет | Да | — | Объём |
| `length` | `double` | Нет | Да | — | Длина |
| `height` | `double` | Нет | Да | — | Высота |
| `width` | `double` | Нет | Да | — | Ширина |
| `price` | `double` | Нет | Да | — | Стоимость |
| `comment` | `string` | Нет | Да | — | Комментарий |
| `description` | `string` | Нет | Да | — | Описание |
| `typeId` | `int64` | Нет | Да | — | Идентификатор типа Тип груза |
| `loadingTypeId` | `int64` | Нет | Да | — | Идентификатор типа Тип загрузки |
| `unloadingTypeId` | `int64` | Нет | Да | — | Идентификатор типа Тип выгрузки |
| `packType` | `string` | Нет | Да | — | Тип упаковки |
| `placesCount` | `int16` | Нет | Да | — | Количество грузовых мест |
| `unitOfMeasure` | `UnitOfMeasure` | Нет | Да | — | — |
| `extendedProperties` | `PropertyNameValueJsonObject[]` | Нет | Да | — | Дополнительные поля груза заявки |
| `typeOptions` | `TypeOptionModel[]` | Нет | Да | — | Дополнительные опции типов для груза |

### `ContactPersonModel`

Контактное лицо

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `phoneNumber` | `string` | Нет | Да | — | Номер телефона, если такой контакт был введен ранее, существующие данные будут использованы |
| `name` | `string` | Нет | Да | — | Имя |

### `CounterpartyRegistryEntryViewModel`

Запись реестра недобросовестных контрагентов

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `inn` | `string` | Нет | Да | — | — |
| `ratings` | `CounterpartyRegistryRatingViewModel[]` | Нет | Да | — | — |
| `insolvencyRank` | `int32` | Да | Нет | — | — |
| `comments` | `string[]` | Нет | Да | — | — |

### `CounterpartyRegistryRatingViewModel`

Оценка контрагента в реестре

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `organizationName` | `string` | Нет | Да | — | — |
| `comment` | `string` | Нет | Да | — | — |

### `CounterpartyViewModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Нет | Да | — | — |
| `insolvencyRegistryEntry` | `CounterpartyRegistryEntryViewModel` | Нет | Нет | — | — |

### `CustomPointTypeModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Нет | Да | — | — |
| `planStayPeriod` | `int32` | Да | Нет | — | Плановое время нахождения на точке (ч) |
| `isVisitOptional` | `boolean` | Да | Нет | — | — |

### `DocumentsTrackingStatus`

Схема не содержит именованных полей.

### `FileModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `originalFileName` | `string` | Нет | Да | — | — |
| `fileName` | `string` | Нет | Да | — | — |
| `extension` | `string` | Нет | Да | — | — |
| `size` | `int64` | Да | Нет | — | — |
| `accessUrlLink` | `string` | Нет | Да | — | — |
| `hashsum` | `string` | Нет | Да | — | — |
| `mountPoint` | `string` | Нет | Да | — | — |
| `relativePath` | `string` | Нет | Да | — | — |
| `storageType` | `int32` | Да | Нет | — | — |
| `lastAccessedAt` | `date-time` | Нет | Да | — | — |

### `IdModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |

### `IdNameModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Нет | Да | — | — |

### `IntegrationBidEventType`

Схема не содержит именованных полей.

### `IntegrationBidPointAddressModel`

Адрес точки маршрута во внешней заявке.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `location` | `PointEditModel` | Да | Нет | — | Координаты точки: [долгота, широта]. |
| `city` | `string` | Нет | Да | — | — |
| `address` | `string` | Да | Нет | — | — |
| `village` | `string` | Нет | Да | — | — |
| `state` | `string` | Нет | Да | — | — |
| `county` | `string` | Нет | Да | — | — |
| `street` | `string` | Нет | Да | — | — |
| `houseNumber` | `string` | Нет | Да | — | — |
| `federalDistrict` | `string` | Нет | Да | — | — |

### `IntegrationBidPointModel`

Точка маршрута во внешней заявке.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `isLoadPoint` | `boolean` | Да | Нет | — | Признак точки погрузки. Если false — точка выгрузки. |
| `planEnterDate` | `date-time` | Да | Нет | — | Плановая локальная дата прибытия. |
| `planLeaveDate` | `date-time` | Нет | Да | — | Плановая локальная дата выезда. |
| `secondaryPlanEnterDate` | `date-time` | Нет | Да | — | Вторая граница диапазона плановой даты прибытия. |
| `externalId` | `string` | Нет | Да | max length: `72` | Идентификатор точки в партнёрском сервисе. |
| `client` | `string` | Нет | Да | — | Клиент. |
| `comment` | `string` | Нет | Да | max length: `8092` | Комментарий. |
| `geozone` | `IntegrationBidPointAddressModel` | Да | Нет | — | Адрес и координаты точки. |
| `contactPerson` | `IntegrationContactPersonModel` | Нет | Нет | — | Контактное лицо. |

### `IntegrationContactPersonModel`

Контактное лицо точки маршрута.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `phoneNumber` | `string` | Нет | Да | — | Номер телефона. |
| `name` | `string` | Нет | Да | — | Имя. |

### `IntegrationDriverModel`

Водитель во внешней заявке.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `firstName` | `string` | Нет | Да | — | Имя. |
| `lastName` | `string` | Нет | Да | — | Фамилия. |
| `patronymic` | `string` | Нет | Да | — | Отчество. |
| `phoneNumber` | `string` | Да | Да | — | Номер телефона. |

### `IntegrationVehicleModel`

Транспортное средство во внешней заявке.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `number` | `string` | Да | Да | — | Государственный номер. |
| `brandName` | `string` | Нет | Да | — | Марка транспортного средства. |

### `InternalEntityType`

Тип внутренней сущности

Схема не содержит именованных полей.

### `InvoiceTriggerType`

Схема не содержит именованных полей.

### `JsonObject`

Схема не содержит именованных полей.

### `MapObjectModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `city` | `string` | Нет | Да | — | — |
| `address` | `string` | Нет | Да | — | — |
| `village` | `string` | Нет | Да | — | — |
| `state` | `string` | Нет | Да | — | — |
| `county` | `string` | Нет | Да | — | — |
| `street` | `string` | Нет | Да | — | — |
| `houseNumber` | `string` | Нет | Да | — | — |
| `federalDistrict` | `string` | Нет | Да | — | — |
| `radius` | `double` | Нет | Да | — | — |
| `type` | `MapObjectType` | Да | Нет | — | — |
| `coordinates` | `double[][]` | Нет | Нет | min items: `3` | Координаты полигона как массив точек: [[долгота, широта], ...].  |
| `location` | `Point` | Да | Нет | — | — |

### `MapObjectType`

Схема не содержит именованных полей.

### `PaymentPeriodType`

Схема не содержит именованных полей.

### `Point`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `type` | `string` | Нет | Нет | — | Тип геометрии (`Point`). Поле возвращается сервером и не передаётся в `PointEditModel`. |
| `coordinates` | `double[]` | Да | Нет | — | Координаты точки в формате `[долгота, широта]`, WGS 84. |

### `PointEditModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `coordinates` | `double[]` | Да | Нет | min items: `2`; max items: `2` | Координаты точки в формате `[долгота, широта]`, WGS 84. |

### `PropertyNameValueJsonObject`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `propertyName` | `string` | Нет | Да | — | — |
| `value` | `string` | Нет | Да | — | Строковое значение дополнительного поля. Числа, даты и boolean передаются в строковом представлении. |

### `QueuedApiTaskAction`

Схема не содержит именованных полей.

### `QueuedApiTaskCallbackStatus`

Схема не содержит именованных полей.

### `QueuedApiTaskModelType`

Схема не содержит именованных полей.

### `QueuedApiTaskObjectResultStatus`

Статус результата обработки объекта

Схема не содержит именованных полей.

### `QueuedApiTaskObjectStatusJson`

Queued api task status

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `message` | `string` | Нет | Да | — | — |
| `type` | `QueuedApiTaskSyncStatus` | Да | Нет | — | — |

### `QueuedApiTaskOrigin`

Источник задания

Схема не содержит именованных полей.

### `QueuedApiTaskStatus`

Queued api task status

Схема не содержит именованных полей.

### `QueuedApiTaskSyncStatus`

Queued api task status

Схема не содержит именованных полей.

### `RecipientInfoModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `fullName` | `string` | Нет | Да | — | — |
| `bidRoles` | `string[]` | Нет | Да | — | — |
| `isIntegrationAccount` | `boolean` | Да | Нет | — | — |

### `RelatedDocumentModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Нет | Да | — | — |
| `count` | `int32` | Да | Нет | — | — |

### `ResourceInactivityInfoJsonObject`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `inactivityReason` | `string` | Нет | Да | — | — |
| `inactiveSince` | `date-time` | Да | Нет | — | — |
| `inactiveUntil` | `date-time` | Да | Нет | — | — |

### `RouteOptions`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `avoidTollRoadFlags` | `AvoidTollRoadFlags` | Да | Нет | — | — |
| `avoidSpecialRoadFlags` | `AvoidSpecialRoadFlags` | Да | Нет | — | — |
| `disallowToll` | `boolean` | Да | Нет | — | — |
| `disallowTollExceptM4` | `boolean` | Да | Нет | — | — |
| `disallowTollExceptM12DRT` | `boolean` | Да | Нет | — | — |
| `allowFerry` | `boolean` | Да | Нет | — | — |
| `calcTolls` | `boolean` | Да | Нет | — | — |
| `country` | `RouterCountryType` | Нет | Да | — | — |
| `routerProfile` | `RouterProfile` | Нет | Да | — | — |
| `useSpecialProfileForEmptyRoute` | `boolean` | Да | Нет | — | — |

### `RouterCountryType`

Схема не содержит именованных полей.

### `RouterProfile`

Схема не содержит именованных полей.

### `ServicePointViewModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `serviceStationName` | `string` | Нет | Да | — | Наименование СТО |
| `serviceType` | `string` | Нет | Да | — | Тип сервисной работы |
| `phoneNumber` | `string` | Нет | Да | — | Cотовый телефон |
| `initiator` | `string` | Нет | Да | — | Инициатор |
| `withoutCargo` | `boolean` | Да | Нет | — | Опция "Без груза" |
| `externalId` | `string` | Нет | Да | — | Идентификатор сервисной работы в Эксплуатации |

### `SourceType`

Схема не содержит именованных полей.

### `TemperatureValueModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `values` | `float[]` | Нет | Да | — | Значения |
| `fixedAt` | `date-time` | Да | Нет | — | Дата и время фиксации |

### `TrailerListFuelTankModel`

Топливный бак прицепа

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `totalVolume` | `double` | Да | Нет | — | Общий объём |
| `fuelConsumption` | `double` | Да | Нет | — | Расход топлива |

### `TrailerListViewModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `trackerId` | `int64` | Нет | Да | — | Идентификатор трекера |
| `typeId` | `int64` | Нет | Да | — | Тип прицепа. |
| `brandTypeId` | `int64` | Нет | Да | — | Марка прицепа. |
| `number` | `string` | Нет | Да | — | Номер. |
| `trackerDeviceNumber` | `string` | Нет | Да | — | Номер трекера |
| `comment` | `string` | Нет | Да | — | — |
| `loadUnloadOptions` | `IdModel[]` | Нет | Да | — | Типы загрузки/выгрузки |
| `isActive` | `boolean` | Да | Нет | — | Признак активности |
| `resourceInactivityInfo` | `ResourceInactivityInfoJsonObject` | Нет | Нет | — | Сведения о неактивности |
| `transportColumn` | `IdNameModel` | Нет | Нет | — | Транспортная колонна |
| `mechanic` | `IdNameModel` | Нет | Нет | — | Механик |
| `isDeleted` | `boolean` | Да | Нет | — | Признак удаления |
| `isInRefuelingSyncList` | `boolean` | Да | Нет | — | Участвует в планировании заправок? |
| `fuelTank` | `TrailerListFuelTankModel` | Нет | Нет | — | Данные бака |
| `lastDieselSensorValueFixedAt` | `date-time` | Нет | Да | — | Время последней фиксации ДУТ |
| `accessPermitIds` | `int64[]` | Нет | Да | — | Допуски и разрешения |

### `TraveledRouteFixedAtPartModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `coordinate` | `double[]` | Нет | Да | min items: `2`; max items: `2` | Координата фактического маршрута в формате `[долгота, широта]`, WGS 84. |
| `fixedAt` | `date-time` | Да | Нет | — | — |

### `TypeOptionModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | Идентификатор типа |
| `entityOptionId` | `int64` | Да | Нет | — | Идентификатор опции сущности |

### `UnitOfMeasure`

Схема не содержит именованных полей.

### `UserChatModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `fullName` | `string` | Нет | Да | — | — |

### `UserMessageFlag`

Схема не содержит именованных полей.

### `UserMessageInfoModel`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `createdAt` | `date-time` | Да | Нет | — | — |
| `readAt` | `date-time` | Нет | Да | — | — |
| `isRead` | `boolean` | Да | Нет | — | — |
| `isDeleted` | `boolean` | Да | Нет | — | — |
| `type` | `UserMessageType` | Да | Нет | — | — |
| `flags` | `UserMessageFlag` | Да | Нет | — | — |
| `recipient` | `RecipientInfoModel` | Нет | Нет | — | — |

### `UserMessageType`

Схема не содержит именованных полей.

## Вложенные модели

### `IntegrationBidDetailsModel.bid`

Модель заявки для синхронизации с внешними сервисами

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `price` | `double` | Нет | Да | — | Цена |
| `priceWithoutVatOnTop` | `double` | Нет | Да | — | Цена без НДС. Будет null, если isVatTop = false |
| `status` | `BidStatus` | Да | Нет | — | — |
| `createdAt` | `date-time` | Да | Нет | — | Дата создания заявки |
| `externalUpdatedAt` | `date-time` | Нет | Да | — | Дата обновления из внешней системы |
| `acceptedByDriverForwarderAt` | `date-time` | Нет | Да | — | Дата принятия водителем-экспедитором |
| `hasFactoring` | `boolean` | Да | Нет | — | Заявка отправлена на факторинг? |
| `createdById` | `int64` | Да | Нет | — | Идентификатор пользователя, кто создал заявку |
| `paymentTypeId` | `int64` | Нет | Да | — | Идентификатор Типа оплаты |
| `ndsTypeId` | `int64` | Нет | Да | — | Идентификатор Типа ндс |
| `isVatTop` | `boolean` | Да | Нет | — | НДС сверху |
| `counterpartyId` | `int64` | Нет | Да | — | Контрагент |
| `contractId` | `int64` | Нет | Да | — | Договор контрагента |
| `isEmptyMileageBid` | `boolean` | Да | Нет | — | Порожняя заявка? |
| `driverId` | `int64` | Нет | Да | — | Текущий водитель заявки |
| `isDriverForwarder` | `boolean` | Да | Нет | — | Является ли водитель экспедитором? |
| `secondaryDriverId` | `int64` | Нет | Да | — | Второй водитель заявки |
| `approvedById` | `int64` | Нет | Да | — | Идентификатор пользователя-оператора, который согласовал заявку<br>(используется если у организации включен модуль согласования заявок) |
| `approvedAt` | `date-time` | Нет | Да | — | Дата согласования оператором (используется если у организации включен модуль согласования заявок) |
| `responsibleId` | `int64` | Нет | Да | — | Идентификатор ответственного |
| `salesManagerId` | `int64` | Нет | Да | — | Идентификатор менеджера по продажам |
| `carLogistId` | `int64` | Нет | Да | — | Идентификатор логиста, который был привязан к машине на момент создания заявки |
| `distributionBidId` | `int64` | Нет | Да | — | Идентификатор заказа, из которого создана эта заявка |
| `routeId` | `int64` | Нет | Да | — | Идентификатор маршрута |
| `planMileage` | `double` | Да | Нет | — | Плановый пробег (метры) |
| `factMileage` | `double` | Да | Нет | — | Фактический пробег (метры) |
| `planEmptyMileageBefore` | `double` | Да | Нет | — | Плановый порожний пробег до текущей заявки от предыдущей (метры) |
| `factEmptyMileageBefore` | `double` | Да | Нет | — | Фактический порожний пробег до первой точки текущей заявки, включая пробег предыдущей порожней заявки (метры) |
| `factEmptyMileageFromStartPoint` | `double` | Да | Нет | — | Фактический порожний пробег внутри заявки. Включает в себя пробег от нулевой до первой точки текущей заявки (метры) |
| `factEmptyOdometerMileageBefore` | `double` | Да | Нет | — | Фактический порожний пробег по одометру до первой точки текущей заявки, включая пробег предыдущей порожней заявки (метры) |
| `factEmptyOdometerMileageFromStartPoint` | `double` | Да | Нет | — | Фактический порожний пробег по одометру внутри заявки. Включает в себя пробег от нулевой до первой точки текущей заявки (метры) |
| `updatedAt` | `date-time` | Да | Нет | — | Дата обновления |
| `car` | `IntegrationBidDetailsModel.bid.car` | Нет | Нет | — | — |
| `trailer` | `IntegrationBidDetailsModel.bid.trailer` | Нет | Нет | — | — |
| `legalPerson` | `IntegrationBidDetailsModel.bid.legalPerson` | Нет | Нет | — | — |
| `estimation` | `IntegrationBidDetailsModel.bid.estimation` | Нет | Нет | — | — |
| `bidPointLoadUnloadStatus` | `BidPointLoadUnloadStatus` | Нет | Нет | — | — |
| `bidPoints` | `IntegrationBidDetailsModel.bid.bidPoints[]` | Нет | Да | — | Точки загрузки |
| `cargos` | `IntegrationBidDetailsModel.bid.cargos[]` | Нет | Да | — | Грузы |
| `typeOptions` | `IntegrationBidDetailsModel.bid.typeOptions[]` | Нет | Да | — | Дополнительные опции типов для заявки |
| `temperatureRegime` | `IntegrationBidDetailsModel.bid.temperatureRegime` | Нет | Нет | — | — |
| `temperature` | `IntegrationBidDetailsModel.bid.temperature` | Нет | Нет | — | — |
| `isInternational` | `boolean` | Да | Нет | — | — |
| `documents` | `IntegrationBidDetailsModel.bid.documents[]` | Нет | Да | — | Список документов |
| `extendedProperties` | `IntegrationBidDetailsModel.bid.extendedProperties[]` | Нет | Да | — | Дополнительные поля заявки |
| `externalId` | `string` | Нет | Да | — | — |
| `contractNumber` | `string` | Нет | Да | — | Номер договора |
| `comment` | `string` | Нет | Да | — | Комментарий |
| `clientBidNumber` | `string` | Нет | Да | — | Номер заявки клиента |
| `clientBidDate` | `date-time` | Нет | Да | — | Дата заявки клиента |
| `paymentPeriodInDays` | `int32` | Нет | Да | — | Срок оплаты в днях |
| `paymentPeriodType` | `PaymentPeriodType` | Нет | Нет | — | — |
| `invoiceTriggerType` | `InvoiceTriggerType` | Нет | Нет | — | — |
| `sourceType` | `SourceType` | Да | Нет | — | Источник заявки в CARGO.RUN. Поле возвращается сервером; партнёр его не задаёт. |
| `acceptedByDriverAt` | `date-time` | Нет | Да | — | Дата принятия заявки водителем |
| `hasItemsChange` | `boolean` | Да | Нет | — | true если есть перецепка/пересменка |
| `isDeleted` | `boolean` | Да | Нет | — | Является ли сущность удаленной? |
| `createDocumentAssignment` | `boolean` | Да | Нет | — | Нужно ли создавать задание сдачи документов водителю после завершения заявки? |
| `hasServicePoints` | `boolean` | Да | Нет | — | true если есть точки сервисных работ |
| `isPreBid` | `boolean` | Да | Нет | — | Предзаявка |
| `payment` | `IntegrationBidDetailsModel.bid.payment` | Нет | Нет | — | — |
| `accessPermitIds` | `int64[]` | Нет | Да | — | Допуски и разрешения |

### `IntegrationBidDetailsModel.plannedRoute`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `distance` | `double` | Да | Нет | — | Дистанция маршрута в метрах |
| `duration` | `double` | Да | Нет | — | Продолжительность маршрута в секундах |
| `distanceWithoutEmptyMileage` | `double` | Да | Нет | — | Дистанция маршрута от первой точки до последней, в метрах |
| `emptyMileageDistance` | `double` | Да | Нет | — | Дистанция маршрута от нулевой точки до первой точки, в метрах |
| `durationWithoutEmptyMileage` | `double` | Да | Нет | — | Продолжительность маршрута от первой точки до последней, в секундах |
| `routeOptions` | `IntegrationBidDetailsModel.plannedRoute.routeOptions` | Нет | Нет | — | — |

### `IntegrationBidDetailsModel.events`

Событие по заявке, вычисленное из фактических дат заявки и ее точек.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `type` | `IntegrationBidEventType` | Да | Нет | — | — |
| `fixedAt` | `date-time` | Да | Нет | — | Дата события. |
| `bidPointId` | `int64` | Нет | Да | — | Идентификатор точки заявки, если событие относится к точке. |
| `bidPointOrder` | `int32` | Нет | Да | — | Порядок точки в маршруте. |

### `IntegrationBidDetailsModel.driverMessages`

Сообщение водителя по заявке.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | Идентификатор сообщения. |
| `text` | `string` | Нет | Да | — | Текст сообщения. |
| `createdAt` | `date-time` | Да | Нет | — | Дата отправки сообщения. |
| `displayName` | `string` | Нет | Да | — | Имя водителя, отправившего сообщение. |
| `files` | `IntegrationBidDetailsModel.driverMessages.files[]` | Нет | Да | — | Прикреплённые файлы. |

### `IntegrationBidDetailsModel.bid.car`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `number` | `string` | Нет | Да | — | — |
| `typeId` | `int64` | Да | Нет | — | — |
| `trackerId` | `int64` | Нет | Да | — | — |

### `IntegrationBidDetailsModel.bid.trailer`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `trackerId` | `int64` | Нет | Да | — | Идентификатор трекера |
| `typeId` | `int64` | Нет | Да | — | Тип прицепа. |
| `brandTypeId` | `int64` | Нет | Да | — | Марка прицепа. |
| `number` | `string` | Нет | Да | — | Номер. |
| `trackerDeviceNumber` | `string` | Нет | Да | — | Номер трекера |
| `comment` | `string` | Нет | Да | — | — |
| `loadUnloadOptions` | `IntegrationBidDetailsModel.bid.trailer.loadUnloadOptions[]` | Нет | Да | — | Типы загрузки/выгрузки |
| `isActive` | `boolean` | Да | Нет | — | Признак активности |
| `resourceInactivityInfo` | `IntegrationBidDetailsModel.bid.trailer.resourceInactivityInfo` | Нет | Нет | — | — |
| `transportColumn` | `IntegrationBidDetailsModel.bid.trailer.transportColumn` | Нет | Нет | — | — |
| `mechanic` | `IntegrationBidDetailsModel.bid.trailer.mechanic` | Нет | Нет | — | — |
| `isDeleted` | `boolean` | Да | Нет | — | Признак удаления |
| `isInRefuelingSyncList` | `boolean` | Да | Нет | — | Участвует в планировании заправок? |
| `fuelTank` | `IntegrationBidDetailsModel.bid.trailer.fuelTank` | Нет | Нет | — | Топливный бак прицепа |
| `lastDieselSensorValueFixedAt` | `date-time` | Нет | Да | — | Время последней фиксации ДУТ |
| `accessPermitIds` | `int64[]` | Нет | Да | — | Допуски и разрешения |

### `IntegrationBidDetailsModel.bid.legalPerson`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Нет | Да | — | — |

### `IntegrationBidDetailsModel.bid.estimation`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `estimatedDate` | `date-time` | Нет | Да | — | Расчётная дата въезда |
| `manualEstimatedLeaveDate` | `date-time` | Нет | Да | — | Ручная дата выезда из точки |

### `IntegrationBidDetailsModel.bid.bidPoints`

Точка маршрута

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `order` | `int32` | Да | Нет | — | Порядок точки |
| `type` | `BidPointType` | Да | Нет | — | — |
| `counterpartyPointId` | `int64` | Нет | Да | — | — |
| `customPointTypeId` | `int64` | Нет | Да | — | — |
| `enteredAt` | `date-time` | Нет | Да | — | Дата въезда в геозону от водителя |
| `loadUnloadedAt` | `date-time` | Нет | Да | — | Дата загрузки/выгрузки от водителя |
| `documentsReceivedAt` | `date-time` | Нет | Да | — | Дата получения документов, от водителя |
| `autoEnteredAt` | `date-time` | Нет | Да | — | Автоматическая дата въезда в точку |
| `autoLeavedAt` | `date-time` | Нет | Да | — | Автоматическая дата выезда из точки |
| `enteredAtByLogist` | `date-time` | Нет | Да | — | Дата въезда в точку, проставленная логистом |
| `loadUnloadedAtByLogist` | `date-time` | Нет | Да | — | Дата выгрузки/выезда из точки, проставленная логистом |
| `axisLoadAfterLeaving` | `IntegrationBidDetailsModel.bid.bidPoints.axisLoadAfterLeaving` | Нет | Нет | — | — |
| `servicePoint` | `IntegrationBidDetailsModel.bid.bidPoints.servicePoint` | Нет | Нет | — | — |
| `scenarioId` | `int64` | Нет | Да | — | Сценарий для водителя |
| `planDistance` | `double` | Нет | Да | — | Плановое расстояние от предыдущей точки до текущей (метры) |
| `factDistance` | `double` | Нет | Да | — | Фактическое расстояние от предыдущей точки до текущей (метры) |
| `intOptions` | `int32` | Нет | Да | — | Опции точки |
| `client` | `string` | Нет | Да | — | — |
| `comment` | `string` | Нет | Да | — | Комментарий к точке |
| `externalId` | `string` | Нет | Да | — | Внешний ид точки |
| `externalCity` | `string` | Нет | Да | — | Город для внешних систем |
| `planEnterDate` | `date-time` | Да | Нет | — | Плановая локальная дата загрузки/выгрузки (по местному времени адреса точки). |
| `planEnterDateOffset` | `date-time` | Да | Нет | — | Плановая дата загрузки/выгрузки, вычисленная по плановой локальной дате, учитывая часовой пояс точки. |
| `planLeaveDateOffset` | `date-time` | Нет | Да | — | Плановая дата выезда. Если модуль планирования включен, вычисляется как плановая дата въезда + X часов. |
| `secondaryPlanEnterDate` | `date-time` | Нет | Да | — | Вторая плановая дата въезда |
| `secondaryPlanEnterDateOffset` | `date-time` | Нет | Да | — | Вторая плановая дата загрузки/выгрузки, вычисленная по плановой локальной дате, учитывая часовой пояс точки. |
| `planLeaveDate` | `date-time` | Нет | Да | — | Плановая дата выезда |
| `createdById` | `int64` | Да | Нет | — | — |
| `geozone` | `IntegrationBidDetailsModel.bid.bidPoints.geozone` | Нет | Нет | — | — |
| `contactPerson` | `IntegrationBidDetailsModel.bid.bidPoints.contactPerson` | Нет | Нет | — | Контактное лицо |
| `counterparty` | `IntegrationBidDetailsModel.bid.bidPoints.counterparty` | Нет | Нет | — | — |
| `loadOptions` | `IntegrationBidDetailsModel.bid.bidPoints.loadOptions[]` | Нет | Да | — | Типы загрузок/выгрузок на точке |
| `typeOptions` | `IntegrationBidDetailsModel.bid.bidPoints.typeOptions[]` | Нет | Да | — | Дополнительные опции типов для точки |
| `extendedProperties` | `IntegrationBidDetailsModel.bid.bidPoints.extendedProperties[]` | Нет | Да | — | Дополнительные поля точки заявки |
| `customPointType` | `IntegrationBidDetailsModel.bid.bidPoints.customPointType` | Нет | Нет | — | — |

### `IntegrationBidDetailsModel.bid.cargos`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Да | Нет | — | Наименование |
| `weight` | `double` | Нет | Да | — | Вес |
| `volume` | `double` | Нет | Да | — | Объём |
| `length` | `double` | Нет | Да | — | Длина |
| `height` | `double` | Нет | Да | — | Высота |
| `width` | `double` | Нет | Да | — | Ширина |
| `price` | `double` | Нет | Да | — | Стоимость |
| `comment` | `string` | Нет | Да | — | Комментарий |
| `description` | `string` | Нет | Да | — | Описание |
| `typeId` | `int64` | Нет | Да | — | Идентификатор типа Тип груза |
| `loadingTypeId` | `int64` | Нет | Да | — | Идентификатор типа Тип загрузки |
| `unloadingTypeId` | `int64` | Нет | Да | — | Идентификатор типа Тип выгрузки |
| `packType` | `string` | Нет | Да | — | Тип упаковки |
| `placesCount` | `int16` | Нет | Да | — | Количество грузовых мест |
| `unitOfMeasure` | `UnitOfMeasure` | Нет | Нет | — | — |
| `extendedProperties` | `IntegrationBidDetailsModel.bid.cargos.extendedProperties[]` | Нет | Да | — | Дополнительные поля груза заявки |
| `typeOptions` | `IntegrationBidDetailsModel.bid.cargos.typeOptions[]` | Нет | Да | — | Дополнительные опции типов для груза |

### `IntegrationBidDetailsModel.bid.typeOptions`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | Идентификатор типа |
| `entityOptionId` | `int64` | Да | Нет | — | Идентификатор опции сущности |

### `IntegrationBidDetailsModel.bid.temperatureRegime`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `temperatureMinimum` | `float` | Нет | Да | — | — |
| `temperatureMaximum` | `float` | Нет | Да | — | — |

### `IntegrationBidDetailsModel.bid.temperature`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `values` | `float[]` | Нет | Да | — | Значения |
| `fixedAt` | `date-time` | Да | Нет | — | Дата и время фиксации |

### `IntegrationBidDetailsModel.bid.documents`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Нет | Да | — | — |
| `count` | `int32` | Да | Нет | — | — |

### `IntegrationBidDetailsModel.bid.extendedProperties`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `propertyName` | `string` | Нет | Да | — | — |
| `value` | `string` | Нет | Да | — | Строковое значение дополнительного поля. Числа, даты и boolean передаются в строковом представлении. |

### `IntegrationBidDetailsModel.bid.payment`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `documentsTrackingStatus` | `DocumentsTrackingStatus` | Нет | Нет | — | — |
| `plannedArrivalDate` | `date` | Нет | Да | — | — |
| `documentsReceiptDate` | `date` | Нет | Да | — | — |
| `invoiceDate` | `date` | Нет | Да | — | — |
| `planPaymentDate` | `date` | Нет | Да | — | — |
| `factPaymentDate` | `date` | Нет | Да | — | — |
| `paymentStatus` | `BidPaymentStatus` | Да | Нет | — | — |
| `isPaymentOverdue` | `boolean` | Да | Нет | — | — |
| `remainingPayment` | `double` | Нет | Да | — | — |
| `comment` | `string` | Нет | Да | — | — |
| `updatedAt` | `date-time` | Да | Нет | — | — |

### `IntegrationBidDetailsModel.plannedRoute.routeOptions`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `avoidTollRoadFlags` | `AvoidTollRoadFlags` | Да | Нет | — | — |
| `avoidSpecialRoadFlags` | `AvoidSpecialRoadFlags` | Да | Нет | — | — |
| `disallowToll` | `boolean` | Да | Нет | — | — |
| `disallowTollExceptM4` | `boolean` | Да | Нет | — | — |
| `disallowTollExceptM12DRT` | `boolean` | Да | Нет | — | — |
| `allowFerry` | `boolean` | Да | Нет | — | — |
| `calcTolls` | `boolean` | Да | Нет | — | — |
| `country` | `RouterCountryType` | Нет | Нет | — | — |
| `routerProfile` | `RouterProfile` | Нет | Нет | — | — |
| `useSpecialProfileForEmptyRoute` | `boolean` | Да | Нет | — | — |

### `IntegrationBidDetailsModel.driverMessages.files`

Файл для партнёрского сервиса.

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | Идентификатор файла. |
| `originalFileName` | `string` | Нет | Да | — | Исходное имя файла. |
| `accessUrlLink` | `string` | Нет | Да | — | Временная ссылка для скачивания файла.<br>Срок действия ссылки ограничен, после его истечения данные нужно прочитать заново. |

### `IntegrationBidDetailsModel.bid.trailer.loadUnloadOptions`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |

### `IntegrationBidDetailsModel.bid.trailer.resourceInactivityInfo`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `inactivityReason` | `string` | Нет | Да | — | — |
| `inactiveSince` | `date-time` | Да | Нет | — | — |
| `inactiveUntil` | `date-time` | Да | Нет | — | — |

### `IntegrationBidDetailsModel.bid.trailer.transportColumn`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Нет | Да | — | — |

### `IntegrationBidDetailsModel.bid.trailer.mechanic`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Нет | Да | — | — |

### `IntegrationBidDetailsModel.bid.trailer.fuelTank`

Топливный бак прицепа

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `totalVolume` | `double` | Да | Нет | — | Общий объём |
| `fuelConsumption` | `double` | Да | Нет | — | Расход топлива |

### `IntegrationBidDetailsModel.bid.bidPoints.axisLoadAfterLeaving`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `averageValue` | `double` | Нет | Да | — | Среднее значение |

### `IntegrationBidDetailsModel.bid.bidPoints.servicePoint`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `serviceStationName` | `string` | Нет | Да | — | Наименование СТО |
| `serviceType` | `string` | Нет | Да | — | Тип сервисной работы |
| `phoneNumber` | `string` | Нет | Да | — | Cотовый телефон |
| `initiator` | `string` | Нет | Да | — | Инициатор |
| `withoutCargo` | `boolean` | Да | Нет | — | Опция "Без груза" |
| `externalId` | `string` | Нет | Да | — | Идентификатор сервисной работы в Эксплуатации |

### `IntegrationBidDetailsModel.bid.bidPoints.geozone`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `city` | `string` | Нет | Да | — | — |
| `address` | `string` | Нет | Да | — | — |
| `village` | `string` | Нет | Да | — | — |
| `state` | `string` | Нет | Да | — | — |
| `county` | `string` | Нет | Да | — | — |
| `street` | `string` | Нет | Да | — | — |
| `houseNumber` | `string` | Нет | Да | — | — |
| `federalDistrict` | `string` | Нет | Да | — | — |
| `radius` | `double` | Нет | Да | — | — |
| `type` | `MapObjectType` | Да | Нет | — | — |
| `coordinates` | `double[][]` | Нет | Нет | min items: `3` | Координаты полигона как массив точек: [[долгота, широта], ...].  |
| `location` | `IntegrationBidDetailsModel.bid.bidPoints.geozone.location` | Да | Нет | — | — |

### `IntegrationBidDetailsModel.bid.bidPoints.contactPerson`

Контактное лицо

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `phoneNumber` | `string` | Нет | Да | — | Номер телефона, если такой контакт был введен ранее, существующие данные будут использованы |
| `name` | `string` | Нет | Да | — | Имя |

### `IntegrationBidDetailsModel.bid.bidPoints.counterparty`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Нет | Да | — | — |
| `insolvencyRegistryEntry` | `IntegrationBidDetailsModel.bid.bidPoints.counterparty.insolvencyRegistryEntry` | Нет | Нет | — | Запись реестра недобросовестных контрагентов |

### `IntegrationBidDetailsModel.bid.bidPoints.loadOptions`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |

### `IntegrationBidDetailsModel.bid.bidPoints.typeOptions`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | Идентификатор типа |
| `entityOptionId` | `int64` | Да | Нет | — | Идентификатор опции сущности |

### `IntegrationBidDetailsModel.bid.bidPoints.extendedProperties`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `propertyName` | `string` | Нет | Да | — | — |
| `value` | `string` | Нет | Да | — | Строковое значение дополнительного поля. Числа, даты и boolean передаются в строковом представлении. |

### `IntegrationBidDetailsModel.bid.bidPoints.customPointType`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | — |
| `name` | `string` | Нет | Да | — | — |
| `planStayPeriod` | `int32` | Да | Нет | — | Плановое время нахождения на точке (ч) |
| `isVisitOptional` | `boolean` | Да | Нет | — | — |

### `IntegrationBidDetailsModel.bid.cargos.extendedProperties`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `propertyName` | `string` | Нет | Да | — | — |
| `value` | `string` | Нет | Да | — | Строковое значение дополнительного поля. Числа, даты и boolean передаются в строковом представлении. |

### `IntegrationBidDetailsModel.bid.cargos.typeOptions`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `id` | `int64` | Да | Нет | — | Идентификатор типа |
| `entityOptionId` | `int64` | Да | Нет | — | Идентификатор опции сущности |

### `IntegrationBidDetailsModel.bid.bidPoints.geozone.location`

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `type` | `string` | Нет | Нет | — | Тип геометрии (`Point`). Поле возвращается сервером. |
| `coordinates` | `double[]` | Нет | Нет | — | Координата (долгота, широта) |

### `IntegrationBidDetailsModel.bid.bidPoints.counterparty.insolvencyRegistryEntry`

Запись реестра недобросовестных контрагентов

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `inn` | `string` | Нет | Да | — | — |
| `ratings` | `IntegrationBidDetailsModel.bid.bidPoints.counterparty.insolvencyRegistryEntry.ratings[]` | Нет | Да | — | — |
| `insolvencyRank` | `int32` | Да | Нет | — | — |
| `comments` | `string[]` | Нет | Да | — | — |

### `IntegrationBidDetailsModel.bid.bidPoints.counterparty.insolvencyRegistryEntry.ratings`

Оценка контрагента в реестре

| Поле | Тип | Обязательно | `null` | Ограничения | Описание |
|---|---|---:|---:|---|---|
| `organizationName` | `string` | Нет | Да | — | — |
| `comment` | `string` | Нет | Да | — | — |
