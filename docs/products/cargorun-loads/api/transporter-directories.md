# Справочники перевозчика

Раздел описывает создание и обновление водителей, тягачей и прицепов организации перевозчика.

## Общие правила

| Сущность | Список | Создание или обновление | Удаление |
|---|---|---|---|
| Водители | `GET /api/TransporterDriver/List` | `POST /api/TransporterDriver/Apply` | `POST /api/TransporterDriver/Delete` |
| Тягачи | `GET /api/TransporterTruck/List` | `POST /api/TransporterTruck/Apply` | `POST /api/TransporterTruck/Delete` |
| Прицепы | `GET /api/TransporterTrailer/List` | `POST /api/TransporterTrailer/Apply` | `POST /api/TransporterTrailer/Delete` |

Для методов `Apply`:

- отсутствие `id` или `id = 0` означает создание;
- существующий `id` означает обновление;
- организация определяется по токену авторизованного пользователя;
- передавать `organizationId` в теле не требуется: поле исключено из публичной модели;
- при успехе сервер возвращает `200 OK` и сохраненную модель с заполненным `id`.

Нельзя создать ресурс в произвольно выбранной организации передачей ее ID. Запрос с токеном экспедитора создаст ресурс организации экспедитора. Для работы с ресурсами разных перевозчиков используйте токен пользователя соответствующей организации.

Полученный `id` сохраните: он используется для обновления, удаления и создания отклика через [`POST /api/TransporterOrderTruckMatchings/ApplyMatching`](./transporter.md#transporter-matching-apply).

Упрощенный фрагмент успешного ответа:

```json
{
  "id": 12345
}
```

## Водители {#transporter-driver-apply}

```http
POST /api/TransporterDriver/Apply
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Обязательные поля обычного водителя

| Поле | Тип | Описание |
|---|---|---|
| `firstName` | `string` | Имя |
| `lastName` | `string` | Фамилия |
| `phoneNumber` | `string` | Номер телефона |
| `passportSeries` | `string` | Серия паспорта |
| `passportNumber` | `string` | Номер паспорта |
| `passportGivenBy` | `string` | Кем выдан паспорт |
| `passportGivenWhen` | `date-time` | Дата выдачи паспорта |

Дополнительно можно передать отчество, адреса регистрации и проживания, сведения о водительском удостоверении, дату рождения, ИНН и комментарий.

Пример создания:

```json
{
  "id": 0,
  "firstName": "Иван",
  "lastName": "Петров",
  "patronymic": "Сергеевич",
  "phoneNumber": "+79990000000",
  "passportSeries": "9200",
  "passportNumber": "123456",
  "passportGivenBy": "МВД России",
  "passportGivenWhen": "2020-04-15"
}
```

### Защита от дублей

`TransporterDriver/Apply` с `id = 0` создает новую запись и не выполняет upsert по телефону, ФИО, паспорту или водительскому удостоверению.

Перед созданием водителя:

1. Получите список через `GET /api/TransporterDriver/List`.
2. На своей стороне сравните нормализованный телефон и, дополнительно, ФИО.
3. Если водитель найден, используйте его `id` для обновления или отклика вместо повторного создания.
4. Передавайте телефон в одном согласованном формате.

### Синхронизация с 1С Делко

Если для организации настроена синхронизация водителей с 1С Делко, локальная запись сопоставляется с поступившей записью прежде всего по нормализованному телефону. Если телефон отсутствует у одной из сравниваемых записей, используется сочетание фамилии, имени и отчества.

При совпадении существующая локальная запись преобразуется в синхронизируемую с сохранением внутреннего `id`. Если совпадение не найдено, может появиться отдельная запись. Поэтому проверяйте список до вызова `Apply` с `id = 0`.

## Тягачи {#transporter-truck-apply}

```http
POST /api/TransporterTruck/Apply
Authorization: Bearer <access_token>
Content-Type: application/json
```

Основные поля:

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | `0` для создания, существующий ID для обновления |
| `number` | `string?` | Госномер |
| `trailerTypeId` | `long?` | Требуемый тип полуприцепа/кузова |
| `truckTypeId` | `long?` | Тип ТС |
| `truckModelTypeId` | `long?` | Модель ТС |
| `isRented` | `boolean` | Признак аренды |
| `ownershipTypeId` | `long?` | Тип владения |
| `ownerName`, `ownerInn` | `string?` | Собственник и его ИНН |
| `vinNumber` | `string?` | VIN |
| `vehiclePassportNumber` | `string?` | Номер ПТС |
| `releaseYearNumber` | `int?` | Год выпуска |

## Прицепы {#transporter-trailer-apply}

```http
POST /api/TransporterTrailer/Apply
Authorization: Bearer <access_token>
Content-Type: application/json
```

Основные поля:

| Поле | Тип | Описание |
|---|---|---|
| `id` | `long` | `0` для создания, существующий ID для обновления |
| `number` | `string?` | Госномер прицепа |
| `trailerTypeId` | `long?` | Тип прицепа |
| `trailerModelTypeId` | `long?` | Модель прицепа |
| `isRented` | `boolean` | Признак аренды |
| `ownershipTypeId` | `long?` | Тип владения |
| `ownerName`, `ownerInn` | `string?` | Собственник и его ИНН |
| `vinNumber` | `string?` | VIN |
| `vehiclePassportNumber` | `string?` | Номер ПТС |
| `releaseYear` | `date-time?` | Год или дата выпуска в формате модели API |

## Списки и удаление

Методы `List` возвращают стандартную коллекцию:

```json
{
  "data": [],
  "totalCount": 0
}
```

Удаление выполняется соответствующим методом `Delete` с ID ресурса. Оно является мягким: запись остается в базе, но перестает быть доступной пользователям в обычных списках.
