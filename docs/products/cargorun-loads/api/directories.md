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

## 3. Типовой ответ

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

## 4. Справочники перевозчика

Справочники перевозчика описаны в разделе [Transporter API](./transporter.md):

- `TransporterTruck`;
- `TransporterTrailer`;
- `TransporterDriver`.
