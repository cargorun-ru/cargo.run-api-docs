# Map API

Методы `Map` используются для работы с адресами, координатами и маршрутами.

---

## 1. Получение адреса по координатам

```http
GET /api/Map/ReverseSearchAddresses?Latitude={latitude}&Longitude={longitude}
```

### Query-параметры

| Параметр | Тип | Описание |
|---|---|---|
| `Latitude` | `double` | Широта |
| `Longitude` | `double` | Долгота |
| `Key` | `string` | Дополнительный ключ поиска, если используется |

### Пример

```http
GET /api/Map/ReverseSearchAddresses?Latitude=55.74703593862486&Longitude=37.61660648499558
```

### Ответ

Метод возвращает массив адресов:

```json
[
  {
    "latitude": 55.747084,
    "longitude": 37.616728,
    "county": null,
    "state": "Москва",
    "federalDistrict": "Центральный федеральный округ",
    "city": "Москва",
    "village": null,
    "street": "Софийская набережная",
    "houseNumber": "14с1",
    "address": "Москва, Софийская набережная, 14с1"
  }
]
```

Полученный адрес можно использовать в `points[].location` при создании заказа.

---

## 2. Связанные методы

В Swagger также есть методы:

- `GET /api/Map/SearchAddresses`;
- `GET /api/Map/GetTimezoneInfo`;
- `GET /api/Map/GetRoute`;
- `GET /api/Map/GetTravelTimePrediction`;
- `GET /api/Map/GetPrice`.

Они будут описаны отдельно, если станут частью публичного интеграционного сценария.
