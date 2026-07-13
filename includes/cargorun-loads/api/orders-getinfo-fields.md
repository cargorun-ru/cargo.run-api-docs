Таблица ниже содержит поля, которые доступны в полной карточке `GET /api/Orders/GetInfo` сверх полей, уже перечисленных для `GetList.data[]`. Для вложенных объектов используется путь через точку, например `points[].location.city`.

| Поле | Описание | Пример значения |
|---|---|---|
| `transportationBasePrice` | Базовая стоимость перевозки | `null` |
| `offersMinPrice` | Минимальная цена предложения | `null` |
| `lastOfferIsMine` | Последнее предложение мое | `false` |
| `offersAreFinished` | Прием предложений завершен | `false` |
| `showMatchingPriceOnOffers` | Показывать цену отклика в предложениях | `false` |
| `directionAverageOrderCost` | Средняя стоимость заказа по направлению | `null` |
| `cargoType` | Тип груза | `null` |
| `packTypeNames` | Типы упаковки | `null` |
| `packCount` | Количество мест / упаковок | `null` |
| `cargoWeight` | Вес груза | `20` |
| `carryingCapacity` | Грузоподъемность | `0` |
| `trailerCapacityTypeName` | Тип вместимости полуприцепа | `null` |
| `requireHealthBook` | Требуется медицинская книжка | `false` |
| `points` | Точки маршрута | `[{"id": 24411546, "planEnterTimeOffset": "2026-07-10T16:00:00+03:00", "maxPlanEnterTimeOffset": null, "predictionEnterTimeOffset": "2026-...` |
| `points[].id` | ID точки маршрута | `24411546` |
| `points[].planEnterTimeOffset` | Плановое время прибытия | `2026-07-10T16:00:00+03:00` |
| `points[].maxPlanEnterTimeOffset` | Максимальное плановое время прибытия | `null` |
| `points[].predictionEnterTimeOffset` | Прогнозное время прибытия | `2026-07-10T16:00:00+03:00` |
| `points[].predictionLeaveTimeOffset` | Прогнозное время выезда | `2026-07-10T18:00:00+03:00` |
| `points[].factEnterTimeOffset` | Фактическое время прибытия | `null` |
| `points[].planLeaveTimeOffset` | Плановое время выезда | `null` |
| `points[].estimatedTimeOffset` | Расчетное время | `null` |
| `points[].factLeaveTimeOffset` | Фактическое время выезда | `null` |
| `points[].enteredTimeByLogistOffset` | Время прибытия, указанное логистом | `null` |
| `points[].leaveTimeByLogistOffset` | Время выезда, указанное логистом | `null` |
| `points[].enteredTimeByDriverOffset` | Время прибытия, указанное водителем | `null` |
| `points[].leaveTimeByDriverOffset` | Время выезда, указанное водителем | `null` |
| `points[].factEnterLoadUnloadTimeOffset` | Фактическое время начала погрузки/выгрузки | `null` |
| `points[].factLeaveLoadUnloadTimeOffset` | Фактическое время окончания погрузки/выгрузки | `null` |
| `points[].location` | Локация | `{"city": "Айдарово", "village": null, "state": "Воронежская область", "county": null, "address": "село Айдарово, Рамонский район, Воронеж...` |
| `points[].location.city` | Город | `Айдарово` |
| `points[].location.village` | Населенный пункт / деревня | `null` |
| `points[].location.state` | Регион | `Воронежская область` |
| `points[].location.county` | Район / округ | `null` |
| `points[].location.address` | Адрес | `село Айдарово, Рамонский район, Воронежская область, Россия` |
| `points[].location.timezoneId` | Часовой пояс | `Europe/Moscow` |
| `points[].location.latitude` | Широта | `51.902942` |
| `points[].location.longitude` | Долгота | `39.286157` |
| `points[].location.id` | ID локации точки маршрута | `25614684` |
| `points[].counterparty` | Контрагент | `null` |
| `points[].loadUnloadTypeName` | Тип погрузки/выгрузки | `Задняя` |
| `points[].comment` | Комментарий к точке маршрута | `null` |
| `points[].index` | Порядковый номер точки | `0` |
| `points[].timezoneId` | Часовой пояс точки маршрута | `Europe/Moscow` |
| `points[].pointType` | Тип точки | `10` |
| `points[].counterpartyId` | ID контрагента точки маршрута | `null` |
| `points[].counterpartyName` | Название контрагента точки маршрута | `null` |
| `points[].counterpartyLocationId` | ID локации контрагента | `null` |
| `points[].contactPersonName` | Контактное лицо точки маршрута | `null` |
| `points[].contactPersonPhoneNumber` | Телефон контактного лица точки маршрута | `null` |
| `points[].tonnage` | Тоннаж | `null` |
| `matchingCars` | Подходящие автомобили | `[]` |
| `matchingsCount` | Количество откликов | `0` |
| `orderTruckMatchingId` | ID отклика / назначения ТС | `null` |
| `truckOrganizationName` | Организация тягача | `null` |
| `truckSourceType` | Тип источника тягача | `null` |
| `truckModelType` | Модель / тип тягача | `null` |
| `truckOwnershipType` | Тип владения тягачом | `null` |
| `truckCurrentLocation` | Текущее местоположение тягача | `null` |
| `truckActualOrganizationName` | Фактическая организация тягача | `null` |
| `driverLastName` | Фамилия водителя | `null` |
| `driverFirstName` | Имя водителя | `null` |
| `driverPatronymic` | Отчество водителя | `null` |
| `driverPhoneNumber` | Телефон водителя | `null` |
| `driverPassportSeries` | Серия паспорта водителя | `null` |
| `driverPassportNumber` | Номер паспорта водителя | `null` |
| `driverPassportGivenBy` | Кем выдан паспорт водителя | `null` |
| `driverPassportGivenWhen` | Когда выдан паспорт водителя | `null` |
| `driverBirthdate` | Дата рождения водителя | `null` |
| `trailerModelType` | Модель / тип прицепа | `null` |
| `trailerOwnershipType` | Тип владения прицепом | `null` |
| `ndsTypeId` | ID типа НДС | `31` |
| `ndsTypeName` | Название типа НДС | `НДС 22%` |
| `transporterNdsType` | Тип НДС перевозчика | `null` |
| `paymentTypeName` | Название типа оплаты | `null` |
| `distance` | Расстояние, м | `523970.292` |
| `orderTruckMatchingExternalId` | Внешний ID отклика / назначения ТС | `null` |
| `externalBidId` | Внешний ID заявки | `null` |
| `contactPersonName` | Имя контактного лица | `Асламов Леонид Александрович` |
| `contactPersonPhoneNumber` | Телефон контактного лица | `79874266000` |
| `acceptedByTruckOwnerFullName` | ФИО принявшего со стороны владельца ТС | `"  "` |
| `customerContract` | Договор с заказчиком | `null` |
| `transporterContract` | Договор с перевозчиком | `null` |
| `transporterInfo` | Информация о перевозчике | `null` |
| `auction` | Аукцион | `null` |
| `cargoCost` | Стоимость груза | `null` |
| `invitedFleetPrice` | Цена приглашенного автопарка | `null` |
| `expenses` | Расходы | `null` |
| `apiServices` | API-сервисы (внутренняя сущность) | `[{"name": "Для синхронизации с 1С", "sourceType": 90, "externalId": null, "syncInfo": {"status": 0, "endedAt": "2026-07-10T09:07:42.63646...` |
| `apiServices[].name` | Название API-сервиса | `Для синхронизации с 1С` |
| `apiServices[].sourceType` | Тип источника API-сервиса | `90` |
| `apiServices[].externalId` | Внешний ID API-сервиса | `null` |
| `apiServices[].syncInfo` | Информация о синхронизации | `{"status": 0, "endedAt": "2026-07-10T09:07:42.63646+00:00", "logText": null}` |
| `apiServices[].syncInfo.status` | Статус синхронизации API-сервиса | `0` |
| `apiServices[].syncInfo.endedAt` | Дата и время окончания синхронизации | `2026-07-10T09:07:42.63646+00:00` |
| `apiServices[].syncInfo.logText` | Текст лога синхронизации | `null` |
| `apiServices[].id` | ID API-сервиса | `531` |
| `cancellationReasonComment` | Комментарий к причине отмены | `null` |
| `cancellationReasons` | Причины отмены | `"  "` |
| `changesRequested` | Запрошены изменения | `null` |
| `atiPaymentRateWithVat` | Ставка оплаты ATI с НДС | `null` |
| `atiPaymentRateWithoutVat` | Ставка оплаты ATI без НДС | `null` |
| `atiPaymentCash` | Оплата наличными для передачи в ATI | `null` |
| `matchingType` | Тип отклика / назначения | `null` |
| `loadsParserLink` | Ссылка на заказ во внешней платформе | `https://cargomart.ru/orders/active?modal=order-view%3Fhash%3D9e478c554a054826aedcc6622f656a1a` |
| `contactPeople` | Контактные лица | `null` |
| `legalEntityId` | ID юридического лица | `null` |
| `counterpartyContactPersonPhoneNumber` | Телефон контактного лица контрагента | `null` |
| `counterpartyContactPersonEmail` | Email контактного лица контрагента | `null` |
| `deferredPayment` | Отсрочка платежа | `null` |
| `truckOrganizationId` | ID организации тягача | `null` |
| `forwarderMainOrderId` | ID основного заказа экспедитора | `null` |
| `isOrderReservationEnabled` | Резервирование заказа включено | `true` |
| `reservationHolderRoles` | Роли держателя резерва | `[]` |
| `atrucksData` | Данные ATRUCKS (устаревшее поле) | `null` |
| `forwardingChildrenOrders` | Дочерние заказы экспедирования | `null` |
| `roundTrip` | Круговой рейс (устаревший признак) | `null` |
| `loadedRateValue` | Ставка за груженый пробег | `null` |
| `emptyMileageRateValue` | Ставка за порожний пробег | `null` |
| `contractValue` | Значение из договора | `null` |
| `trailerTypeRequirementValue` | Требование к типу полуприцепа в заказе | `null` |
| `auctionNumber` | Номер аукциона | `null` |
| `auctionDate` | Дата аукциона | `null` |
| `unloadingByDriver` | Время выгрузки, указанное водителем | `null` |
