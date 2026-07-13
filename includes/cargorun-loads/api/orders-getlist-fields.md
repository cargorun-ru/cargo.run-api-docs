Таблица ниже содержит поля элемента массива `data[]`, которые можно забирать из `GET /api/Orders/GetList`.

| Поле | Описание | Пример значения |
|---|---|---|
| `locationFrom` | Населенный пункт отправления | `Айдарово` |
| `locationTo` | Населенный пункт назначения | `Ильинское-Усово` |
| `regionFrom` | Регион отправления | `Воронежская область` |
| `regionTo` | Регион назначения | `Московская область` |
| `orderCost` | Стоимость заказа | `62000` |
| `orderCostDeviationPercent` | Отклонение стоимости заказа от среднерыночной ставки по направлению, % | `14.816455166939585` |
| `createdAt` | Дата и время создания заказа | `2026-07-10T09:07:42.515725+00:00` |
| `status` | Статус заказа | `10` |
| `bidStatus` | Статус заявки / торгов | `null` |
| `isDeleted` | Признак удаления | `false` |
| `acceptedMatchingsCount` | Количество принятых откликов | `0` |
| `auctionOffersCount` | Количество предложений на аукционе | `0` |
| `withoutMatching` | Без назначенного отклика | `false` |
| `output` | Рубль/км для экспедитора | `118.32731921373895` |
| `hasDocuments` | Есть документы | `null` |
| `externalId` | Внешний идентификатор | `9e478c554a054826aedcc6622f656a1a` |
| `externalNumber` | Внешний номер | `2579996` |
| `externalStatus` | Внешний статус | `10` |
| `atrucksExternalNumber` | Внешний номер на внешней площадке | `2579996` |
| `authorFullName` | ФИО автора заказа | `Рехтина Дарья Викторовна` |
| `authorId` | ID автора | `97965963` |
| `responsibleFullName` | ФИО ответственного | `null` |
| `responsibleId` | ID ответственного | `null` |
| `hasAuctionWinner` | Есть победитель аукциона | `false` |
| `counterpartyId` | ID контрагента | `5895` |
| `counterpartyName` | Название контрагента | `АО Корса` |
| `isMandatory` | Обязательный заказ | `false` |
| `isGuaranteed` | Гарантированный заказ | `null` |
| `isInternal` | Внутренний заказ | `null` |
| `comment` | Комментарий | `null` |
| `forwarderComment` | Комментарий экспедитора | `null` |
| `transporterOrganizationId` | ID организации перевозчика | `null` |
| `transporterOrganizationName` | Название организации перевозчика | `null` |
| `truckNumber` | Номер тягача | `null` |
| `driverFullName` | ФИО водителя | `"  "` |
| `trailerNumber` | Номер прицепа | `null` |
| `logistFullName` | ФИО логиста | `null` |
| `legalEntityName` | Название юридического лица | `null` |
| `userUniqueViewCount` | Количество уникальных просмотров пользователями | `0` |
| `anonymousUniqueViewCount` | Количество уникальных анонимных просмотров | `0` |
| `integrationSyncStatusType` | Статус синхронизации интеграции | `10` |
| `sovcominsInsuranceStatus` | Статус страхования Совкомбанк | `null` |
| `paymentStatusId` | ID статуса оплаты | `null` |
| `paymentStatusName` | Название статуса оплаты | `null` |
| `integrationOrderId` | ID заказа в интеграции | `null` |
| `externalCreatedAt` | Дата и время создания во внешней системе | `null` |
| `counterpartyContactPerson` | Контактное лицо контрагента | `null` |
| `minTemperature` | Минимальная температура | `null` |
| `maxTemperature` | Максимальная температура | `null` |
| `volume` | Объем груза | `82` |
| `confirmationRequested` | Запрошено подтверждение | `false` |
| `gpsEnabled` | GPS-мониторинг включен | `false` |
| `isTemporaryTruck` | Временный тягач | `null` |
| `orderPoints` | Точки маршрута заказа | `[]` |
| `cargoTypeId` | ID типа груза | `14041` |
| `cargoTypeName` | Название типа груза | `Пиво` |
| `sourceType` | Тип источника создания заказа: ATRUCKS, LP, ручной ввод | `140` |
| `loadsParserServiceType` | Тип сервиса из LP: ATRUCKS, Логинет, Балтика и др. LP - аналог Делкотеха | `170` |
| `loadDistrictsNames` | Названия округов погрузки | `["Центральный федеральный округ"]` |
| `loadDistrictsIds` | ID округов погрузки | `[1]` |
| `unloadDistrictsNames` | Названия округов выгрузки | `["Центральный федеральный округ"]` |
| `unloadDistrictsIds` | ID округов выгрузки | `[1]` |
| `isReserved` | Заказ зарезервирован (забронирован) | `false` |
| `reservationAuthorId` | ID автора резерва | `null` |
| `reservationAuthorName` | Имя автора резерва | `"  "` |
| `reservationHolderId` | ID держателя резерва | `null` |
| `reservationHolderName` | Имя держателя резерва | `"  "` |
| `reservationEndDate` | Дата окончания резерва | `null` |
| `addressFrom` | Адрес отправления (полный) | `село Айдарово, Рамонский район, Воронежская область, Россия` |
| `addressTo` | Адрес назначения (полный) | `поселок Ильинское-Усово, Красногорский район, Московская область, Россия` |
| `loadStart` | Начало окна погрузки | `2026-07-10T16:00:00+03:00` |
| `loadFinish` | Окончание окна погрузки | `null` |
| `loadTimezoneId` | Часовой пояс погрузки | `Europe/Moscow` |
| `unloadStart` | Начало окна выгрузки | `2026-07-11T07:45:00+03:00` |
| `unloadFinish` | Окончание окна выгрузки | `null` |
| `unloadTimezoneId` | Часовой пояс выгрузки | `Europe/Moscow` |
| `organizationName` | Название организации | `ООО "Делко"` |
| `organizationId` | ID организации | `211` |
| `distanceKm` | Расстояние, км | `523.970292` |
| `trailerTypeNames` | Типы полуприцепов | `["Изотерм"]` |
| `pointsCount` | Количество точек маршрута | `2` |
| `orderPriceType` | Тип цены заказа | `30` |
| `offersFixAt` | Время фиксации предложений | `2026-07-10T09:40:17+00:00` |
| `offersAreFixed` | Предложения зафиксированы | `false` |
| `accessType` | Тип доступа / видимость заказа | `30` |
| `visibleForOrganizationsIds` | ID организаций, которым виден заказ | `[211]` |
| `visibleForOrganizationNames` | Организации, которым виден заказ | `["ООО "Делко""]` |
| `id` | ID заказа | `6391954` |
