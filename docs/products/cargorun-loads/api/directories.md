# Directories API

Справочники используются при создании заказа и настройке фильтров интеграции.

Большинство методов поддерживают:

- `$filter`;
- `$orderby`;
- `$top`;
- `$skip`.

---

## 1. Примеры фильтрации

```http
GET /api/PackType/SelectList?$filter=name eq 'Тент'
```

```http
GET /api/PackType/SelectList?$filter=contains(tolower(name),'тент')
```

```http
GET /api/PackType/SelectList?$filter=id eq 42
```

---

## 2. Справочники для создания заказа

| Справочник | Метод |
|---|---|
| Тип груза | `GET /api/CargoType/SelectByOrganizationList` |
| Типы упаковки | `GET /api/PackType/SelectList` |
| Типы прицепов | `GET /api/OrganizationAccount/GetAllowedTrailerTypeList` |
| Тип загрузки/погрузки | `GET /api/LoadUnloadType/SelectList` |
| Контрагент | `GET /api/Orders/SelectCounterpartyByOrganizationList` |
| Автор заказа | `GET /api/Orders/SelectAuthorByOrganizationList` |
| Перевозчики | `GET /api/Organization/SelectRelationsOrganizationsList` |
| Тип НДС | `GET /api/NdsType/SelectList` |
| Тип оплаты | `GET /api/PaymentType/SelectList` |
| Причины отмены | `GET /api/CancellationReasons/SelectByOrderList` |

---

## 3. Справочники для расшифровки заказа

Эти же справочники используются при чтении заказа из `GET /api/Orders/GetInfo`.

| Поле заказа | Справочник | Пример значения |
|---|---|---|
| `ndsTypeId`, `ndsTypeName` | `GET /api/NdsType/SelectList` | `{"id": 71, "name": "НДС 22%"}` |
| `trailerTypeNames` | `GET /api/OrganizationAccount/GetAllowedTrailerTypeList` | `{"id": 122, "name": "Тент"}` |
| `packTypeNames` | `GET /api/PackType/SelectList` | `{"id": 811, "name": "Паллета"}` |
| `cargoType` | `GET /api/CargoType/SelectByOrganizationList` | `{"id": 8791, "name": "Продукты питания"}` |
| `points[].loadUnloadTypeName` | `GET /api/LoadUnloadType/SelectList` | Тип загрузки/выгрузки |

В ответе заказа часто возвращаются и ID, и название справочного значения. Например, НДС заказчика возвращается как `ndsTypeId` и `ndsTypeName`, а НДС перевозчика может возвращаться как `transporterNdsType`.

### Пример справочника НДС

```json
{
  "data": [
    { "id": 1, "name": "Без НДС" },
    { "id": 51, "name": "НДС 12%" },
    { "id": 61, "name": "НДС 5%" },
    { "id": 41, "name": "НДС 20%" },
    { "id": 11, "name": "НДС 10%" },
    { "id": 2, "name": "НДС 0%" },
    { "id": 71, "name": "НДС 22%" }
  ],
  "totalCount": 7
}
```

### Пример справочника типов полуприцепов

```json
{
  "data": [
    { "id": 122, "name": "Тент" },
    { "id": 12, "name": "Рефрижератор" },
    { "id": 121, "name": "Изотерм" },
    { "id": 123, "name": "Термос" }
  ],
  "totalCount": 20
}
```

---

## 4. Типовой ответ

```json
{
  "data": [
    {
      "id": 1,
      "name": "Тент"
    }
  ],
  "totalCount": 1
}
```

---

## 5. Справочники перевозчика

Справочники перевозчика описаны в разделе [Transporter API](./transporter.md):

- `TransporterTruck`;
- `TransporterTrailer`;
- `TransporterDriver`.
